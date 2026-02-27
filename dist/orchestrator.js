"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Orchestrator = void 0;
const data_integration_1 = require("./data-integration");
const rollup_engine_1 = require("./rollup-engine");
const relationship_derivation_service_1 = require("./relationship-derivation-service");
const os_1 = __importDefault(require("os"));
/**
 * Enterprise Job Queue & Orchestrator
 * Uses PostgreSQL as a reliable, DLQ-supported, distributed queue via Prisma.
 */
const HOSTNAME = os_1.default.hostname();
const PID = process.pid;
class Orchestrator {
    constructor(prisma) {
        this.workerId = null;
        this.isRunning = false;
        // Timeouts
        this.HEARTBEAT_INTERVAL = 30000; // 30s
        this.POLL_INTERVAL = 5000; // 5s
        this.prisma = prisma;
    }
    /**
     * Start the worker node, register it in the DB, and begin polling for jobs
     */
    async startWorker() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        // Register worker
        const worker = await this.prisma.jobWorker.create({
            data: {
                hostname: HOSTNAME,
                pid: PID,
                status: 'ACTIVE',
            }
        });
        this.workerId = worker.id;
        console.log(`[Orchestrator] Worker started: ${this.workerId} (${HOSTNAME}:${PID})`);
        this.startHeartbeat();
        this.pollForJobs();
    }
    /**
     * Stop the worker gracefully (drain)
     */
    async stopWorker() {
        this.isRunning = false;
        if (this.workerId) {
            await this.prisma.jobWorker.update({
                where: { id: this.workerId },
                data: { status: 'OFFLINE' }
            });
            console.log(`[Orchestrator] Worker ${this.workerId} stopped gracefully.`);
        }
    }
    startHeartbeat() {
        setInterval(async () => {
            if (!this.isRunning || !this.workerId)
                return;
            try {
                await this.prisma.jobWorker.update({
                    where: { id: this.workerId },
                    data: { lastHeartbeat: new Date() }
                });
            }
            catch (err) {
                console.error('[Orchestrator] Heartbeat failed:', err);
            }
        }, this.HEARTBEAT_INTERVAL);
    }
    /**
     * Enqueue a new job
     */
    async enqueue(jobType, payload, options) {
        // If an idempotencyKey exists, check if it's already queued/completed
        if (options?.idempotencyKey) {
            const existing = await this.prisma.jobQueue.findUnique({
                where: { idempotencyKey: options.idempotencyKey }
            });
            if (existing) {
                console.log(`[Orchestrator] Job ignored: idempotency key '${options.idempotencyKey}' already exists.`);
                return existing;
            }
        }
        const job = await this.prisma.jobQueue.create({
            data: {
                jobType,
                payload,
                priority: options?.priority ?? 0,
                ...(options?.idempotencyKey ? { idempotencyKey: options.idempotencyKey } : {}),
                ...(options?.integrationJobId ? { integrationJobId: options.integrationJobId } : {}),
                ...(options?.parentJobId ? { parentJobId: options.parentJobId } : {})
            }
        });
        console.log(`[Orchestrator] Enqueued ${jobType} job: ${job.id}`);
        return job;
    }
    /**
     * The core polling loop.
     */
    async pollForJobs() {
        while (this.isRunning) {
            try {
                // Find a QUEUED job or a job ready for retry
                // PostgreSQL SKIP LOCKED equivalent logic conceptually achieved by finding and atomically locking
                const now = new Date();
                // 1) Find candidate
                const candidate = await this.prisma.jobQueue.findFirst({
                    where: {
                        status: 'QUEUED',
                        OR: [
                            { nextAttemptAt: null },
                            { nextAttemptAt: { lte: now } }
                        ],
                        AND: [
                            {
                                OR: [
                                    { parentJobId: null },
                                    { parentJob: { status: 'COMPLETED' } }
                                ]
                            }
                        ]
                    },
                    orderBy: [
                        { priority: 'desc' },
                        { createdAt: 'asc' }
                    ]
                });
                if (candidate && this.workerId) {
                    // 2) Try to lock it atomically
                    const lockedJob = await this.prisma.jobQueue.updateMany({
                        where: {
                            id: candidate.id,
                            status: 'QUEUED', // Ensure nobody else took it
                        },
                        data: {
                            status: 'RUNNING',
                            lockedAt: new Date(),
                            startedAt: new Date(),
                            lockedByWorkerId: this.workerId,
                            attempts: { increment: 1 }
                        }
                    });
                    // If we successfully locked it, process it!
                    if (lockedJob.count > 0) {
                        await this.processJob(candidate);
                        // Loop immediately to grab more jobs without waiting for interval
                        continue;
                    }
                }
            }
            catch (error) {
                console.error('[Orchestrator] Polling error:', error);
            }
            // Sleep if no jobs
            await new Promise(res => setTimeout(res, this.POLL_INTERVAL));
        }
    }
    /**
     * Route and process the selected job
     */
    async processJob(job) {
        console.log(`[Orchestrator] Processing job ${job.id} (${job.jobType}) attempt ${job.attempts + 1}/${job.maxAttempts}`);
        const startTime = Date.now();
        let success = false;
        let errorMessage = '';
        try {
            // ---- ROUTER ----
            if (job.jobType === 'INTEGRATION_SYNC') {
                if (!job.integrationJobId)
                    throw new Error("Missing integrationJobId payload");
                // Map the old executeJob logic to the jobQueue record instead of jobExecution
                const result = await (0, data_integration_1.executeJob)(job.integrationJobId, this.prisma, job.id);
                if (result.status === 'FAILED') {
                    throw new Error(result.error || "Integration sync failed");
                }
                // Update specific metrics
                await this.prisma.jobQueue.update({
                    where: { id: job.id },
                    data: {
                        recordsProcessed: result.recordsProcessed,
                        recordsFailed: result.recordsFailed,
                    }
                });
            }
            else if (job.jobType === 'TELEMETRY_ROLLUP_TRIGGER') {
                const payload = job.payload;
                if (!payload || !payload.windowSize || !payload.lookbackMs) {
                    throw new Error("Missing windowSize or lookbackMs in TELEMETRY_ROLLUP_TRIGGER payload");
                }
                const result = await (0, rollup_engine_1.computeAllRecentRollups)(payload.windowSize, payload.lookbackMs, this.prisma);
                console.log(`[Orchestrator] TELEMETRY_ROLLUP_TRIGGER completed. Yielded ${result.totalBuckets} buckets across ${result.combinationsProcessed} metric combos.`);
            }
            else if (job.jobType === 'RELATIONSHIP_DECAY') {
                const count = await relationship_derivation_service_1.RelationshipDerivationService.applyConfidenceDecay(this.prisma);
                console.log(`[Orchestrator] RELATIONSHIP_DECAY completed. Decayed ${count} probabilistic edges.`);
            }
            else if (job.jobType === 'SYSTEM_PING') {
                console.log("[Orchestrator] Processed system ping.");
            }
            else {
                throw new Error(`Unknown jobType: ${job.jobType}`);
            }
            success = true;
        }
        catch (error) {
            success = false;
            errorMessage = error.message || String(error);
            console.error(`[Orchestrator] Job ${job.id} failed:`, errorMessage);
        }
        // ---- FINALIZE ----
        const duration = Date.now() - startTime;
        if (success) {
            await this.prisma.jobQueue.update({
                where: { id: job.id },
                data: {
                    status: 'COMPLETED',
                    completedAt: new Date(),
                    lockedAt: null,
                    lockedByWorkerId: null,
                }
            });
            console.log(`[Orchestrator] Job ${job.id} completed in ${duration}ms`);
        }
        else {
            // Check for retry / DLQ threshold
            const nextAttempt = job.attempts + 1;
            const isDead = nextAttempt >= job.maxAttempts;
            await this.prisma.jobQueue.update({
                where: { id: job.id },
                data: {
                    status: isDead ? 'DEAD_LETTER' : 'QUEUED',
                    lastError: errorMessage,
                    lockedAt: null,
                    lockedByWorkerId: null,
                    // Exponential backoff
                    nextAttemptAt: isDead ? null : new Date(Date.now() + (Math.pow(2, nextAttempt) * 1000)),
                }
            });
            if (isDead) {
                console.log(`[Orchestrator] Job ${job.id} moved to DEAD_LETTER queue.`);
            }
        }
    }
}
exports.Orchestrator = Orchestrator;
//# sourceMappingURL=orchestrator.js.map