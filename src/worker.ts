import 'dotenv/config';
import { PrismaClient } from './generated/prisma';
import { Orchestrator } from './orchestrator';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import logger from './logger';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
}

async function main() {
    logger.info('🚀 Starting AIP Worker Tier...');

    // 1. Database Setup
    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({
        adapter,
        log: ['warn', 'error']
    });

    // 2. Initialize Orchestrator
    const orchestrator = new Orchestrator(prisma);

    // 3. Graceful Shutdown
    const shutdown = async () => {
        logger.info('🛑 Shutting down worker...');
        await orchestrator.stopWorker();
        await prisma.$disconnect();
        await pool.end();
        process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    // 4. Start Processing
    try {
        await orchestrator.startWorker();
        logger.info('✅ Worker is active and polling for jobs.');
    } catch (err: any) {
        logger.error(err, 'Failed to start worker');
        process.exit(1);
    }
}

main().catch((err: any) => {
    logger.error(err, 'Unhandled Worker Error');
    process.exit(1);
});
