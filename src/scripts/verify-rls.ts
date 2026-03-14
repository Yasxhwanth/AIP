import 'dotenv/config';
import { PrismaClient } from '../generated/prisma';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { tenantStorage, getTenantPrisma } from '../tenant-context';

async function main() {
    const baseUrl = process.env.DATABASE_URL || '';
    const databaseUrl = baseUrl.replace('aip_user:aip_password', 'aip_app:aip_password');
    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaPg(pool);
    const prismaRaw = new PrismaClient({ adapter });
    const prisma = getTenantPrisma(prismaRaw) as any;

    console.log('🧪 Starting RLS Verification...');

    // 1. Get a Project ID from the seed (we know one exists)
    const projects = await prismaRaw.project.findMany();
    if (!projects || projects.length === 0) {
        console.error('❌ No projects found to test with. Run seed first.');
        process.exit(1);
    }
    const tenant1 = (projects[0] as any).id;
    console.log(`Using Tenant 1: ${tenant1}`);

    // 2. Test Reading without tenant context (should return nothing due to RLS)
    console.log('\n--- Test 1: Reading WITHOUT tenant context ---');
    try {
        const entitiesRaw = await prismaRaw.currentEntityState.findMany();
        console.log(`Raw Prisma (no RLS): found ${entitiesRaw.length} entities (Expected: 0)`);

        // Note: Raw Prisma client doesn't set aip.tenant_id, so it should return 0 records if RLS is working
        const entitiesRLS = await prisma.currentEntityState.findMany();
        console.log(`Tenant Prisma (no context): found ${entitiesRLS.length} entities (Expected: 0)`);
    } catch (err: any) {
        console.log(`Expected Error for no context (if current_setting fails): ${err.message}`);
    }

    // 3. Test Reading WITH tenant context
    console.log(`\n--- Test 2: Reading WITH Tenant 1 context (${tenant1}) ---`);
    await tenantStorage.run({ projectId: tenant1 }, async () => {
        const entities = await prisma.currentEntityState.findMany();
        console.log(`Tenant Prisma (Tenant 1): found ${entities.length} entities (Expected: 5)`);

        if (entities.length > 0) {
            console.log('✅ RLS successfully allowed access with context.');
        } else {
            console.error('❌ RLS denied access even with correct context.');
        }
    });

    // 4. Test Isolation with a dummy tenant ID
    const dummyTenant = '00000000-0000-0000-0000-000000000000';
    console.log(`\n--- Test 3: Reading with DUMMY Tenant (${dummyTenant}) ---`);
    await tenantStorage.run({ projectId: dummyTenant }, async () => {
        const entities = await prisma.currentEntityState.findMany();
        console.log(`Tenant Prisma (Dummy): found ${entities.length} entities (Expected: 0)`);

        if (entities.length === 0) {
            console.log('✅ RLS successfully isolated dummy tenant.');
        } else {
            console.error('❌ RLS leaked data to incorrect tenant!');
        }
    });

    await pool.end();
}

main().catch(console.error);
