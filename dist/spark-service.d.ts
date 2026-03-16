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
        projectId: string | null;
        status: string;
        jobId: string;
        trigger: string;
        summary: import("./generated/prisma/runtime/client").JsonValue | null;
        startedAt: Date;
        finishedAt: Date | null;
        inputData: import("./generated/prisma/runtime/client").JsonValue | null;
        durationMs: number | null;
    }>;
    private processDag;
}
//# sourceMappingURL=spark-service.d.ts.map