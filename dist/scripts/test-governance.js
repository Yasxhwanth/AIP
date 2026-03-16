"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const prisma_1 = require("../generated/prisma");
const governance_service_1 = require("../governance-service");
const release_service_1 = require("../release-service");
async function main() {
    process.env.DATABASE_URL = "postgresql://aip_user:aip_password@localhost:5432/aip_db";
    console.log('--- Stage 6 Verification: Governance, Compliance, SRE ---');
    const databaseUrl = process.env.DATABASE_URL;
    console.log(`Connecting to: ${databaseUrl}`);
    const pool = new pg_1.Pool({ connectionString: databaseUrl });
    const adapter = new adapter_pg_1.PrismaPg(pool);
    const prisma = new prisma_1.PrismaClient({ adapter });
    try {
        console.log('Testing database connection...');
        await prisma.$connect();
        console.log('✅ Base connection OK');
        // Fetch a real project to avoid FK errors
        const project = await prisma.project.findFirst();
        if (!project) {
            console.log('No project found, creating a test project...');
            await prisma.project.create({
                data: {
                    id: 'proj-military-ops-123',
                    name: 'Military Operations',
                    description: 'Test Project'
                }
            });
        }
        const activeProjectId = project?.id || 'proj-military-ops-123';
        console.log(`Using Project ID: ${activeProjectId}`);
        const govSvc = new governance_service_1.GovernanceService(prisma);
        const relSvc = new release_service_1.ReleaseService(prisma);
        console.log('\n1. Testing Governance (Change Requests)');
        const cr = await govSvc.createChangeRequest({
            projectId: activeProjectId,
            resourceType: 'Project',
            resourceId: activeProjectId,
            proposedChanges: { name: 'Military Operations - Enhanced' },
            createdBy: 'commander-test'
        });
        console.log(`✅ Change Request created: ${cr.id}`);
        console.log('\n2. Testing Approval and Application (Transaction test)');
        console.log('Calling approveAndApply...');
        const approved = await govSvc.approveAndApply(cr.id, 'admin-commander');
        console.log(`✅ Change Request applied. New status: ${approved.status}`);
        console.log('\n3. Testing Release Management');
        const release = await relSvc.createRelease(activeProjectId, 'v1.1.0-gold', 'commander-test');
        console.log(`✅ Release created: ${release.id}`);
        console.log('\n4. Verifying Audit Logs');
        const logs = await prisma.auditLog.findMany({
            where: { projectId: activeProjectId },
            orderBy: { occurredAt: 'desc' },
            take: 5
        });
        console.log(`✅ Found ${logs.length} audit logs for project.`);
        logs.forEach((l) => console.log(` - [${l.occurredAt.toISOString()}] ${l.action} by ${l.actor}`));
        console.log('\n--- Stage 6 Verification COMPLETED SUCCESSFULY ---');
    }
    catch (err) {
        console.error('\n❌ Stage 6 Verification FAILED');
        console.error('Error:', err.message);
        if (err.stack)
            console.error(err.stack);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
        await pool.end();
        console.log('Cleaned up resources.');
    }
}
main().catch(err => {
    console.error('Fatal unhandled error:', err);
    process.exit(1);
});
//# sourceMappingURL=test-governance.js.map