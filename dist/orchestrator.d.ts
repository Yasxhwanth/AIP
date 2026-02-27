import { PrismaClient } from './generated/prisma';
export declare class Orchestrator {
    private prisma;
    private workerId;
    private isRunning;
    private HEARTBEAT_INTERVAL;
    private POLL_INTERVAL;
    constructor(prisma: PrismaClient);
    /**
     * Start the worker node, register it in the DB, and begin polling for jobs
     */
    startWorker(): Promise<void>;
    /**
     * Stop the worker gracefully (drain)
     */
    stopWorker(): Promise<void>;
    private startHeartbeat;
    /**
     * Enqueue a new job
     */
    enqueue(jobType: string, payload: any, options?: {
        idempotencyKey?: string;
        priority?: number;
        integrationJobId?: string;
        parentJobId?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        payload: import("./generated/prisma/runtime/client").JsonValue;
        idempotencyKey: string | null;
        status: string;
        recordsProcessed: number;
        recordsFailed: number;
        jobType: string;
        priority: number;
        startedAt: Date | null;
        completedAt: Date | null;
        lockedAt: Date | null;
        lockedByWorkerId: string | null;
        attempts: number;
        maxAttempts: number;
        nextAttemptAt: Date | null;
        lastError: string | null;
        integrationJobId: string | null;
        parentJobId: string | null;
    }>;
    /**
     * The core polling loop.
     */
    private pollForJobs;
    /**
     * Route and process the selected job
     */
    private processJob;
}
//# sourceMappingURL=orchestrator.d.ts.map