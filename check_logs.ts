
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './src/generated/prisma';

async function run() {
    const pool = new Pool({ connectionString: 'postgresql://aip_user:aip_password@localhost:5432/aip_db' });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter } as any);

    try {
        const logs = await (prisma as any).auditLog.findMany({
            take: 20,
            orderBy: { occurredAt: 'desc' }
        });
        console.log('--- Recent Audit Logs ---');
        logs.forEach((l: any) => {
            console.log(`[${l.occurredAt.toISOString()}] ${l.action} | Actor: ${l.actor}`);
        });
    } catch (err: any) {
        console.error('Error fetching logs:', err.message);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}
run();
