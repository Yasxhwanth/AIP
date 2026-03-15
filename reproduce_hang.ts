import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './src/generated/prisma';

async function test() {
    process.env.DATABASE_URL = "postgresql://aip_user:aip_password@localhost:5432/aip_db";
    console.log('--- Minimal Transaction Test (with Adapter) ---');

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter } as any);

    try {
        console.log('Connecting...');
        await prisma.$connect();
        console.log('Connected.');

        console.log('Starting transaction...');
        const result = await prisma.$transaction(async (tx) => {
            console.log('Inside transaction. Fetching project...');
            const project = await tx.project.findFirst();
            console.log('Project fetched:', project?.name);
            return project;
        });
        console.log('Transaction finished. Result:', result?.name);

    } catch (err: any) {
        console.error('Test failed:', err.message);
    } finally {
        await prisma.$disconnect();
        await pool.end();
        console.log('Disconnected.');
    }
}

test();
