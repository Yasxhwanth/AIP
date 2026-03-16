import { PrismaClient } from './generated/prisma';
/**
 * Executes a Spark job DAG by its DB id.
 */
export declare function executeSparkJob(jobId: string, runId: string, prisma: PrismaClient, broadcastFn?: (eventUrl: string, payload: any) => void): Promise<{
    status: string;
    totalRecordsProcessed: number;
}>;
//# sourceMappingURL=spark-engine.d.ts.map