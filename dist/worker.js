"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const prisma_1 = require("./generated/prisma");
const orchestrator_1 = require("./orchestrator");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const logger_1 = __importDefault(require("./logger"));
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
}
async function main() {
    logger_1.default.info('🚀 Starting AIP Worker Tier...');
    // 1. Database Setup
    const pool = new pg_1.Pool({ connectionString: databaseUrl });
    const adapter = new adapter_pg_1.PrismaPg(pool);
    const prisma = new prisma_1.PrismaClient({
        adapter,
        log: ['warn', 'error']
    });
    // 2. Initialize Orchestrator
    const orchestrator = new orchestrator_1.Orchestrator(prisma);
    // 3. Graceful Shutdown
    const shutdown = async () => {
        logger_1.default.info('🛑 Shutting down worker...');
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
        logger_1.default.info('✅ Worker is active and polling for jobs.');
    }
    catch (err) {
        logger_1.default.error(err, 'Failed to start worker');
        process.exit(1);
    }
}
main().catch((err) => {
    logger_1.default.error(err, 'Unhandled Worker Error');
    process.exit(1);
});
//# sourceMappingURL=worker.js.map