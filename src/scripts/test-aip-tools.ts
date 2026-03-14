import 'dotenv/config';
import { PrismaClient } from '../generated/prisma';
import { AIPExecutor } from '../aip-executor';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

async function main() {
    const baseUrl = process.env.DATABASE_URL || '';
    const databaseUrl = baseUrl.replace('aip_app:aip_password', 'aip_user:aip_password');
    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    const executor = new AIPExecutor(prisma);

    console.log('🧪 Starting AIP Tool Platform Verification...');

    try {
        // 1. Get a valid project (Military Operations from seed)
        const project = await prisma.project.findFirst({ where: { name: 'Military Operations' } });
        if (!project) throw new Error('Project not found. Run seed first.');

        const projectId = project.id;
        console.log(`Using Project: ${projectId}`);

        // 2. Discover Tools
        console.log('\n--- Discovery: Listing Tools ---');
        const tools = await executor.listTools();
        console.log(`Found ${tools.length} available tools:`, tools.map(t => t.name).join(', '));

        // 3. Test get_entity (Valid)
        console.log('\n--- Test 1: get_entity (Valid Payload) ---');
        const entity = await (prisma as any).currentEntityState.findFirst({ where: { projectId } });
        if (!entity) throw new Error('No entities found for project.');

        const res1 = await executor.execute({
            toolName: 'get_entity',
            projectId,
            parameters: { logicalId: entity.logicalId }
        });

        if (res1.success) {
            console.log(`✅ Success! Fetched entity: ${res1.result.state.logicalId}`);
            console.log('State Data:', JSON.stringify(res1.result.state.data, null, 2));
        } else {
            console.error('❌ Failed to fetch entity:', res1.error);
        }

        // 4. Test RLS Bypass/Isolation (Trying to fetch with wrong projectId)
        console.log('\n--- Test 2: RLS Isolation (Wrong Project ID) ---');
        const dummyProjectId = '00000000-0000-0000-0000-000000000000';
        const res2 = await executor.execute({
            toolName: 'get_entity',
            projectId: dummyProjectId,
            parameters: { logicalId: entity.logicalId }
        });

        if (!res2.success || res2.result.error) {
            console.log('✅ RLS Blocked Access as expected.');
            console.log('Result:', res2.result?.error || 'No result');
        } else {
            console.error('❌ FAILURE: RLS leaked data between projects!');
        }

        // 5. Test search_entities
        console.log('\n--- Test 3: search_entities ---');
        const res3 = await executor.execute({
            toolName: 'search_entities',
            projectId,
            parameters: { entityTypeName: 'Asset' }
        });

        if (res3.success) {
            console.log(`✅ Success! Found ${res3.result.count} assets in project.`);
        } else {
            console.error('❌ Search failed:', res3.error);
        }

    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main().catch(console.error);
