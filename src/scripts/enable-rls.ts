import 'dotenv/config';
import { PrismaClient } from '../generated/prisma';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const databaseUrl = process.env.DATABASE_URL;
const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Applying Row-Level Security (RLS) policies to Postgres...');

    // 1. Find all tables that have a "projectId" column
    const tablesWithProjectId: { table_name: string }[] = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'projectId' 
        AND table_schema = 'public'
    `;

    for (const row of tablesWithProjectId) {
        const table = row.table_name;
        if (table === '_prisma_migrations') continue;

        console.log(`Enabling RLS on ${table}...`);

        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);
            await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" FORCE ROW LEVEL SECURITY;`);

            // Drop existing policy if we are re-running
            await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS tenant_isolation ON "${table}";`);

            // Create the isolation policy
            // 'system' bypasses RLS for scripts and background worker jobs that do pan-tenant operations
            await prisma.$executeRawUnsafe(`
                CREATE POLICY tenant_isolation ON "${table}"
                FOR ALL
                USING (
                    "projectId" = current_setting('aip.tenant_id', true)
                    OR current_setting('aip.tenant_id', true) = 'system'
                    OR current_setting('aip.tenant_bypass', true) = '1'
                );
            `);
            console.log(`  ✅ RLS enforced for ${table}`);
        } catch (e: any) {
            console.error(`  ❌ Failed to enable RLS on ${table}:`, e.message);
        }
    }

    console.log('Done.');
}

if (require.main === module) {
    main()
        .catch(console.error)
        .finally(() => prisma.$disconnect());
}

export { main as enableRLS };
