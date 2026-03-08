import { PrismaClient } from './generated/prisma';
export declare class SparkService {
    private prisma;
    constructor(prisma: PrismaClient);
    /**
     * Executes a Spark job DAG, managing the progress of individual stages natively (Promises).
     */
    executeJob(jobId: string, trigger: string, inputData?: any, broadcastFn?: (eventUrl: string, payload: any) => void): Promise<{
        error: string | null;
        id: string;
        status: string;
        startedAt: Date;
        trigger: string;
        inputData: import("./generated/prisma/runtime/client").JsonValue | null;
        summary: import("./generated/prisma/runtime/client").JsonValue | null;
        finishedAt: Date | null;
        durationMs: number | null;
        jobId: string;
    }>;
    private processDag;
}
//# sourceMappingURL=spark-service.d.ts.map