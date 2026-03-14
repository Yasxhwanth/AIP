
console.log('[VerifySRE] Script started at top of file');
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma';
import axios from 'axios';

async function main() {
    console.log('--- Stage 6: SRE & Auditing Verification ---');

    const dbUrl = "postgresql://aip_user:aip_password@localhost:5432/aip_db";
    const pool = new Pool({ connectionString: dbUrl });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter } as any);

    const baseUrl = "http://localhost:3001";

    try {
        console.log('\n1. Verifying Global Audit Middleware');
        console.log('Triggering project creation (Mutation)...');
        const projectRes = await axios.post(`${baseUrl}/projects`, {
            name: `SRE-Test-${Date.now()}`,
            description: 'Verifying global auditing'
        });
        console.log(`✅ Project created: ${projectRes.data.id}`);

        await new Promise(r => setTimeout(r, 2000));

        console.log('Checking for automatic AuditLog...');
        const log = await (prisma as any).auditLog.findFirst({
            where: {
                action: { contains: 'POST_PROJECTS' }
            },
            orderBy: { occurredAt: 'desc' }
        });

        if (log) {
            console.log(`✅ AuditLog found: ${log.action} by ${log.actor}`);
            console.log(`Meta: ${JSON.stringify(log.metadata)}`);
        } else {
            console.error('❌ Global AuditLog NOT FOUND for mutation.');
        }

        console.log('\n2. Verifying Deep Health (SLO Architecture)');
        const sloRes = await axios.get(`${baseUrl}/api/v1/health/deep`);
        console.log(`✅ SLO Health: ${sloRes.data.status}`);
        console.log(`Metrics: ${JSON.stringify(sloRes.data.metrics, null, 2)}`);

        console.log('\n3. Verifying Runtime Health (System Architecture)');
        const runtimeRes = await axios.get(`${baseUrl}/api/v1/health/deep`);
        console.log(`✅ Runtime Health: ${runtimeRes.data.status}`);
        console.log(`Schedulers: ${JSON.stringify(runtimeRes.data.schedulers, null, 2)}`);

        console.log('\n--- Stage 6 SRE Verification COMPLETED ---');

    } catch (err: any) {
        console.error('\n❌ SRE Verification FAILED');
        if (err.response) {
            console.error(`Status: ${err.response.status}`);
            console.error(`Data: ${JSON.stringify(err.response.data)}`);
        } else {
            console.error('Error:', err.message);
        }
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
