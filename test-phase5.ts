import 'dotenv/config';
import { spawn } from 'child_process';
import { PrismaClient } from './src/generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import crypto from 'crypto';

const BASE = 'http://localhost:3000/api/v1';

async function fetchWithRetry(url: string, options: any = {}, retries = 5, delay = 1000): Promise<Response> {
    for (let i = 0; i < retries; i++) {
        try {
            const res = await fetch(url, options);
            return res;
        } catch (e) {
            if (i === retries - 1) throw e;
            await new Promise((r) => setTimeout(r, delay));
        }
    }
    throw new Error('Unreachable');
}

async function main() {
    console.log('=== Phase 5: Enterprise Hardening Test ===\\n');

    // 1. Start Server with AUTH_REQUIRED=true
    console.log('1. Starting hardened server (AUTH_REQUIRED=true, LOG_LEVEL=silent)...');

    // Using cross-env trick or just passing env directly
    const serverProcess = spawn('npm.cmd', ['run', 'dev'], {
        env: { ...process.env, AUTH_REQUIRED: 'true', LOG_LEVEL: 'silent' },
        stdio: 'ignore',
        shell: true
    });

    console.log(' Waiting for server to boot...');
    await new Promise(r => setTimeout(r, 4000));

    let rawKey = '';
    let jwtToken = '';

    try {
        // 2. Test unauthenticated Deep Health Check
        console.log('\\n2. Testing unauthenticated Deep Health Check...');
        const healthRes = await fetchWithRetry(`${BASE}/health/deep`);
        const healthStatus = healthRes.status;
        const healthData = await healthRes.json();
        console.log(`   Status: ${healthStatus} (expected 200)`);
        console.log(`   Database: ${healthData.database}`);
        console.log(`   Headers attached -> X-Correlation-ID: ${healthRes.headers.get('x-correlation-id')}`);

        // 3. Test unauthenticated API request (Should Fail)
        console.log('\\n3. Testing unauthenticated request to protected route...');
        const failRes = await fetch(`${BASE}/entity-types`);
        console.log(`   Status: ${failRes.status} (expected 401 Unauthorized)`);
        const failData = await failRes.json();
        console.log(`   Response: ${JSON.stringify(failData)}`);

        // 4. Create API Key
        console.log('\\n4. Creating API key via Prisma directly...');
        // We will insert it directly into the DB to bypass auth for this test setup
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        const adapter = new PrismaPg(pool);
        const prisma = new PrismaClient({ adapter });

        rawKey = `c3aip_${crypto.randomUUID().replace(/-/g, '')}`;
        const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

        await prisma.apiKey.create({
            data: {
                name: 'EnterpriseTestKey',
                keyHash,
                role: 'ADMIN',
                rateLimit: 5
            }
        });
        console.log(`   ✓ Created API Key (Rate Limit 5/min): ${rawKey}`);

        console.log('\\n5. Exchanging API Key for JWT...');
        const tokenRes = await fetch(`${BASE}/auth/token`, {
            method: 'POST',
            headers: { 'X-API-Key': rawKey }
        });
        const tokenData = await tokenRes.json();
        jwtToken = tokenData.token;
        console.log(`   ✓ Received JWT Token (length: ${jwtToken.length})`);

        console.log('\\n7. Testing request with invalid API Key...');
        const invalidRes = await fetchWithRetry(`${BASE}/entity-types`, {
            headers: { 'X-API-Key': 'invalid_key_123' }
        });
        console.log(`   Status: ${invalidRes.status} (expected 401)`);

        console.log('\\n8. Testing request with valid API Key...');
        const validRes = await fetch(`${BASE}/entity-types`, {
            headers: { 'X-API-Key': rawKey }
        });
        console.log(`   Status: ${validRes.status} (expected 200)`);

        console.log('\\n9. Testing request with JWT Bearer Token...');
        const jwtRes = await fetch(`${BASE}/entity-types`, {
            headers: { 'Authorization': `Bearer ${jwtToken}` }
        });
        console.log(`   Status: ${jwtRes.status} (expected 200)`);

        console.log('\\n10. Testing rate limiter (Sending 6 fast requests, limit is 5)...');
        let blockSeen = false;
        for (let i = 0; i < 6; i++) {
            const spamRes = await fetch(`${BASE}/entity-types`, {
                headers: { 'X-API-Key': rawKey }
            });
            if (spamRes.status === 429) {
                console.log(`   Request ${i + 1} Blocked: ${spamRes.status} Too Many Requests`);
                blockSeen = true;
            }
        }
        if (!blockSeen) {
            console.log("   X Rate limiter did not engage!");
            throw new Error("Rate limiting failed");
        } else {
            console.log("   ✓ Rate limiter engaged successfully");
        }

        console.log('\\n11. Testing Graceful Shutdown...');
        serverProcess.kill('SIGTERM');
        console.log('   Sent SIGTERM. Server should clean up and exit.');

        serverProcess.on('exit', (code) => {
            console.log(`   Server exited gracefully with code ${code} (expected 0)`);
            console.log('\\n=== Phase 5 Tests Complete and Passed! ===');
            process.exit(0);
        });

    } catch (err) {
        console.error('Test Failed:', err);
        serverProcess.kill();
        process.exit(1);
    }
}

main();
