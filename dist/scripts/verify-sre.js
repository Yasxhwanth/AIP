"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log('[VerifySRE] Script started at top of file');
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const prisma_1 = require("../generated/prisma");
const axios_1 = __importDefault(require("axios"));
async function main() {
    console.log('--- Stage 6: SRE & Auditing Verification ---');
    const dbUrl = "postgresql://aip_user:aip_password@localhost:5432/aip_db";
    const pool = new pg_1.Pool({ connectionString: dbUrl });
    const adapter = new adapter_pg_1.PrismaPg(pool);
    const prisma = new prisma_1.PrismaClient({ adapter });
    const baseUrl = "http://localhost:3001";
    try {
        console.log('\n1. Verifying Global Audit Middleware');
        console.log('Triggering project creation (Mutation)...');
        const projectRes = await axios_1.default.post(`${baseUrl}/projects`, {
            name: `SRE-Test-${Date.now()}`,
            description: 'Verifying global auditing'
        });
        console.log(`✅ Project created: ${projectRes.data.id}`);
        await new Promise(r => setTimeout(r, 2000));
        console.log('Checking for automatic AuditLog...');
        const log = await prisma.auditLog.findFirst({
            where: {
                action: { contains: 'POST_PROJECTS' }
            },
            orderBy: { occurredAt: 'desc' }
        });
        if (log) {
            console.log(`✅ AuditLog found: ${log.action} by ${log.actor}`);
            console.log(`Meta: ${JSON.stringify(log.metadata)}`);
        }
        else {
            console.error('❌ Global AuditLog NOT FOUND for mutation.');
        }
        console.log('\n2. Verifying Deep Health (SLO Architecture)');
        const sloRes = await axios_1.default.get(`${baseUrl}/api/v1/health/deep`);
        console.log(`✅ SLO Health: ${sloRes.data.status}`);
        console.log(`Metrics: ${JSON.stringify(sloRes.data.metrics, null, 2)}`);
        console.log('\n3. Verifying Runtime Health (System Architecture)');
        const runtimeRes = await axios_1.default.get(`${baseUrl}/api/v1/health/deep`);
        console.log(`✅ Runtime Health: ${runtimeRes.data.status}`);
        console.log(`Schedulers: ${JSON.stringify(runtimeRes.data.schedulers, null, 2)}`);
        console.log('\n--- Stage 6 SRE Verification COMPLETED ---');
    }
    catch (err) {
        console.error('\n❌ SRE Verification FAILED');
        if (err.response) {
            console.error(`Status: ${err.response.status}`);
            console.error(`Data: ${JSON.stringify(err.response.data)}`);
        }
        else {
            console.error('Error:', err.message);
        }
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
        await pool.end();
    }
}
main();
//# sourceMappingURL=verify-sre.js.map