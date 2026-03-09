import { PrismaClient, Prisma } from './generated/prisma';
import { executeJob } from './data-integration';
import { computeAllRecentRollups } from './rollup-engine';
import { RelationshipDerivationService } from './relationship-derivation-service';
import os from 'os';

/**
 * Enterprise Job Queue & Orchestrator
 * Uses PostgreSQL as a reliable, DLQ-supported, distributed queue via Prisma.
 */

const HOSTNAME = os.hostname();
const PID = process.pid;

export class Orchestrator {
    private prisma: PrismaClient;
    private workerId: string | null = null;
    private isRunning = false;

    // Timeouts
    private HEARTBEAT_INTERVAL = 30_000; // 30s
    private POLL_INTERVAL = 5_000; // 5s

    // Concurrency
    private activeJobs = 0;
    private MAX_CONCURRENT_JOBS = 5;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    /**
     * Start the worker node, register it in the DB, and begin polling for jobs
     */
    async startWorker() {
        if (this.isRunning) return;
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

    private startHeartbeat() {
        setInterval(async () => {
            if (!this.isRunning || !this.workerId) return;
            try {
                await this.prisma.jobWorker.update({
                    where: { id: this.workerId },
                    data: { lastHeartbeat: new Date() }
                });
            } catch (err) {
                console.error('[Orchestrator] Heartbeat failed:', err);
            }
        }, this.HEARTBEAT_INTERVAL);
    }

    /**
     * Enqueue a new job
     */
    async enqueue(
        jobType: string,
        payload: any,
        options?: {
            idempotencyKey?: string;
            priority?: number;
            integrationJobId?: string;
            parentJobId?: string;
        }
    ) {
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
    private async pollForJobs() {
        while (this.isRunning) {
            try {
                if (this.activeJobs >= this.MAX_CONCURRENT_JOBS) {
                    await new Promise(res => setTimeout(res, 1000));
                    continue;
                }

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
                    include: {
                        integrationJob: true
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
                        this.activeJobs++;
                        this.processJob(candidate).catch(err => {
                            console.error('[Orchestrator] Unhandled process error:', err);
                        }).finally(() => {
                            this.activeJobs--;
                        });
                        // Loop immediately to grab more jobs without waiting for interval
                        continue;
                    }
                }
            } catch (error) {
                console.error('[Orchestrator] Polling error:', error);
            }

            // Sleep if no jobs
            await new Promise(res => setTimeout(res, this.POLL_INTERVAL));
        }
    }

    /**
     * Route and process the selected job
     */
    private async processJob(job: any) {
        console.log(`[Orchestrator] Processing job ${job.id} (${job.jobType}) attempt ${job.attempts + 1}/${job.maxAttempts}`);
        const startTime = Date.now();
        let success = false;
        let errorMessage = '';

        try {
            // ---- ROUTER ----
            if (job.jobType === 'INTEGRATION_SYNC') {
                if (!job.integrationJobId) throw new Error("Missing integrationJobId payload");

                // Map the old executeJob logic to the jobQueue record instead of jobExecution
                const result = await executeJob(job.integrationJobId, this.prisma, job.id);

                if (result.status === 'FAILED') {
                    throw new Error(result.error || "Integration sync failed");
                }

                // Update specific metrics
                await this.prisma.jobQueue.update({
                    where: { id: job.id },
                    data: {
                        recordsProcessed: result.recordsProcessed,
                        recordsFailed: result.recordsFailed,
                        recordsDropped: result.recordsDropped,
                    }
                });
            } else if (job.jobType === 'TELEMETRY_ROLLUP_TRIGGER') {
                const payload = job.payload as any;
                if (!payload || !payload.windowSize || !payload.lookbackMs) {
                    throw new Error("Missing windowSize or lookbackMs in TELEMETRY_ROLLUP_TRIGGER payload");
                }
                const result = await computeAllRecentRollups(payload.windowSize, payload.lookbackMs, this.prisma);
                console.log(`[Orchestrator] TELEMETRY_ROLLUP_TRIGGER completed. Yielded ${result.totalBuckets} buckets across ${result.combinationsProcessed} metric combos.`);
            } else if (job.jobType === 'RELATIONSHIP_DECAY') {
                const count = await RelationshipDerivationService.applyConfidenceDecay(this.prisma);
                console.log(`[Orchestrator] RELATIONSHIP_DECAY completed. Decayed ${count} probabilistic edges.`);
            } else if (job.jobType === 'MLOPS_DRIFT_MONITOR') {
                await this.checkModelDrift();
                console.log("[Orchestrator] Processed MLOPS_DRIFT_MONITOR.");
            } else if (job.jobType === 'SYSTEM_PING') {
                console.log("[Orchestrator] Processed system ping.");
            } else {
                throw new Error(`Unknown jobType: ${job.jobType}`);
            }

            success = true;
        } catch (error: any) {
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
        } else {
            // Check for retry / DLQ threshold
            const retryPolicy = job.integrationJob?.retryPolicy as { maxAttempts?: number, backoffMultiplier?: number } | undefined;
            const maxAttempts = retryPolicy?.maxAttempts ?? job.maxAttempts;
            const backoffMultiplier = retryPolicy?.backoffMultiplier ?? 2;

            const nextAttempt = job.attempts + 1;
            const isDead = nextAttempt >= maxAttempts;

            await this.prisma.jobQueue.update({
                where: { id: job.id },
                data: {
                    status: isDead ? 'DEAD_LETTER' : 'QUEUED',
                    lastError: errorMessage,
                    lockedAt: null,
                    lockedByWorkerId: null,
                    // Exponential backoff
                    nextAttemptAt: isDead ? null : new Date(Date.now() + (Math.pow(backoffMultiplier, nextAttempt) * 1000)),
                }
            });

            if (isDead) {
                console.log(`[Orchestrator] Job ${job.id} moved to DEAD_LETTER queue.`);
            }
        }
    }

    /**
     * Checks all PRODUCTION models for recent drift metrics violating thresholds.
     */
    private async checkModelDrift() {
        // Find all production models
        const prodModels = await this.prisma.modelVersion.findMany({
            where: { status: 'PRODUCTION' },
            include: { modelDefinition: true }
        });

        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        for (const model of prodModels) {
            // Find recent drift metrics
            const recentMetrics = await this.prisma.modelDriftMetric.findMany({
                where: {
                    modelVersionId: model.id,
                    createdAt: { gte: oneDayAgo }
                }
            });

            for (const metric of recentMetrics) {
                // Example threshold logic: if JS divergence > 0.1, alert
                let thresholdViolated = false;
                if (metric.metricType === 'JENSEN_SHANNON' && metric.value > 0.1) thresholdViolated = true;
                if (metric.metricType === 'PSI' && metric.value > 0.2) thresholdViolated = true;

                if (thresholdViolated) {
                    const alertPayload = {
                        featureName: metric.featureName,
                        metricType: metric.metricType,
                        value: metric.value,
                        modelName: model.modelDefinition.name,
                        version: model.version
                    };

                    // Check for active alerts to prevent spam (Idempotency) using entityTypeId for model Definition instead
                    const existingAlert = await this.prisma.alert.findFirst({
                        where: {
                            alertType: 'ModelDrift',
                            entityTypeId: model.modelDefinitionId,
                            logicalId: model.id,
                            acknowledged: false
                        }
                    });

                    if (!existingAlert) {
                        try {
                            await this.prisma.alert.create({
                                data: {
                                    alertType: 'ModelDrift',
                                    severity: 'warning',
                                    entityTypeId: model.modelDefinitionId,  // using entityTypeId to hold ModelDef ID
                                    logicalId: model.id,                    // using logicalId to hold ModelVersion ID
                                    policyId: 'SYSTEM_DRIFT_MONITOR',       // dummy policyId as required by schema
                                    payload: {
                                        message: `Drift detected in production model ${model.modelDefinition.name} v${model.version} on feature ${metric.featureName}`,
                                        ...alertPayload
                                    } as Prisma.InputJsonValue,
                                }
                            });
                            console.log(`[Orchestrator] Created ModelDrift alert for ${model.id}`);
                        } catch (e) {
                            console.error('[Orchestrator] Could not create drift alert', e);
                        }
                    }
                }
            }
        }
    }
}
