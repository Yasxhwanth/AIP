import { PrismaClient, Prisma } from './generated/prisma';
export declare class Orchestrator {
    private prisma;
    private workerId;
    private isRunning;
    private HEARTBEAT_INTERVAL;
    private POLL_INTERVAL;
    private activeJobs;
    private MAX_CONCURRENT_JOBS;
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
        payload: Prisma.JsonValue;
        status: string;
        startedAt: Date | null;
        completedAt: Date | null;
        idempotencyKey: string | null;
        recordsProcessed: number;
        recordsFailed: number;
        recordsDropped: number;
        jobType: string;
        priority: number;
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
    /**
     * Checks all PRODUCTION models for recent drift metrics violating thresholds.
     */
    private checkModelDrift;
}
//# sourceMappingURL=orchestrator.d.ts.map