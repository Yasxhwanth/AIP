"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const prisma_1 = require("../generated/prisma");
const tenant_context_1 = require("../tenant-context");
async function main() {
    const prismaRaw = new prisma_1.PrismaClient();
    const prisma = (0, tenant_context_1.getTenantPrisma)(prismaRaw);
    console.log('🧪 Starting RLS Verification (Stage 3)...');
    // 1. Apply FORCE RLS (Ensures owner bypass is disabled)
    console.log('Harding RLS with FORCE...');
    const tables = [
        'EntityType', 'EntityTypeInstance', 'AuditLog', 'DomainEvent', 'CurrentEntityState'
    ];
    for (const table of tables) {
        try {
            await prismaRaw.$executeRawUnsafe(`ALTER TABLE "${table}" FORCE ROW LEVEL SECURITY`);
        }
        catch (e) {
            // Might fail if not owner or table missing, ignore for now
        }
    }
    // 2. Get a Project ID from the seed
    const projects = await prismaRaw.project.findMany();
    if (!projects || projects.length === 0) {
        console.error('❌ No projects found to test with. Run seed first.');
        process.exit(1);
    }
    const tenant1 = projects[0].id;
    console.log(`Using Tenant 1: ${tenant1}`);
    // 3. Test Reading without tenant context
    console.log('\n--- Test 1: Reading WITHOUT tenant context ---');
    try {
        const entities = await prisma.currentEntityState.findMany();
        console.log(`Tenant Prisma (no context): found ${entities.length} entities (Expected: 0)`);
        if (entities.length === 0) {
            console.log('✅ RLS successfully denied access without context.');
        }
        else {
            console.warn('⚠️ RLS bypassed! (Is FORCE RLS applied? Is it the owner?)');
        }
    }
    catch (err) {
        console.log(`Error (Expected): ${err.message}`);
    }
    // 4. Test Reading WITH tenant context
    console.log(`\n--- Test 2: Reading WITH Tenant 1 context (${tenant1}) ---`);
    await tenant_context_1.tenantStorage.run({ projectId: tenant1 }, async () => {
        try {
            const entities = await prisma.currentEntityState.findMany();
            console.log(`Tenant Prisma (Tenant 1): found ${entities.length} entities`);
            if (entities.length > 0) {
                console.log('✅ RLS successfully allowed access with correct context.');
            }
            else {
                console.warn('❌ RLS denied access even with correct context! (Check if entities belong to this project)');
            }
        }
        catch (err) {
            console.error(`❌ Unexpected error: ${err.message}`);
        }
    });
    // 5. Test Isolation with a dummy tenant ID
    const dummyTenant = '00000000-0000-0000-0000-000000000000';
    console.log(`\n--- Test 3: Reading with DUMMY Tenant (${dummyTenant}) ---`);
    await tenant_context_1.tenantStorage.run({ projectId: dummyTenant }, async () => {
        const entities = await prisma.currentEntityState.findMany();
        console.log(`Tenant Prisma (Dummy): found ${entities.length} entities (Expected: 0)`);
        if (entities.length === 0) {
            console.log('✅ RLS successfully isolated dummy tenant.');
        }
        else {
            console.error('❌ RLS leaked data to incorrect tenant!');
        }
    });
    await prismaRaw.$disconnect();
}
main().catch(console.error);
//# sourceMappingURL=verify-rls.js.map