"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schedulerTelemetry = void 0;
exports.upsertEntityInstance = upsertEntityInstance;
exports.executeJob = executeJob;
exports.dryRunJob = dryRunJob;
exports.startScheduler = startScheduler;
const policy_engine_1 = require("./policy-engine");
const identity_service_1 = require("./identity-service");
const ontology_reasoner_1 = require("./ontology-reasoner");
const crypto_1 = __importDefault(require("crypto"));
const connectors = {
    /**
     * REST_API — Fetch records from an HTTP endpoint.
     * connectionConfig: { url, headers?, method?, responsePath? }
     */
    REST_API: async (config) => {
        if (!config.url)
            throw new Error('REST_API connector requires a url in connectionConfig');
        const resp = await fetch(config.url, {
            method: config.method ?? 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(config.headers ?? {}),
            },
            body: config.method === 'POST' && config.body ? JSON.stringify(config.body) : null,
        });
        if (!resp.ok) {
            throw new Error(`REST_API fetch failed: ${resp.status} ${resp.statusText}`);
        }
        let data = await resp.json();
        // Drill into the response if a responsePath is specified
        if (config.responsePath) {
            for (const key of config.responsePath.split('.')) {
                data = data?.[key];
            }
        }
        if (!Array.isArray(data)) {
            throw new Error('REST_API connector: response is not an array (use responsePath to drill in)');
        }
        return data;
    },
    /**
     * JSON_UPLOAD — Accept raw records passed inline in the request body.
     */
    JSON_UPLOAD: async (_config, inlineData) => {
        if (!inlineData || !Array.isArray(inlineData)) {
            throw new Error('JSON_UPLOAD connector: inline data[] is required');
        }
        return inlineData;
    },
    /**
     * CSV_UPLOAD — Accept CSV text passed inline, parse into records.
     */
    CSV_UPLOAD: async (_config, inlineData) => {
        if (!inlineData || !Array.isArray(inlineData)) {
            throw new Error('CSV_UPLOAD connector: inline data[] is required (pre-parsed rows)');
        }
        return inlineData;
    },
};
// ── Transform Engine ─────────────────────────────────────────────
/**
 * Maps raw external records to ontology-shaped payloads using fieldMapping.
 *
 * fieldMapping = { "temp": "temperature", "loc": "location" }
 *   → input  { temp: 72.5, loc: "Building A", sensorId: "s1" }
 *   → output { temperature: 72.5, location: "Building A" }
 *
 * Fields not in the mapping are dropped (except logicalIdField which is extracted separately).
 */
function transformRecord(record, fieldMapping) {
    const mapped = {};
    for (const [externalField, ontologyAttribute] of Object.entries(fieldMapping)) {
        if (externalField in record) {
            mapped[ontologyAttribute] = record[externalField];
        }
    }
    return mapped;
}
// ── Entity Upsert (reusable ingest path) ─────────────────────────
/**
 * Upserts a single entity instance using the same bi-temporal logic
 * as the POST /entity-types/:id/instances endpoint.
 *
 * Returns { success: true } on success, { success: false, error } on failure.
 */
async function upsertEntityInstance(entityType, logicalId, attrData, prisma, options) {
    const { OntologyService } = require('./ontology-service');
    const ontologySvc = new OntologyService(prisma);
    try {
        const hash = crypto_1.default.createHash('sha256').update(JSON.stringify(attrData)).digest('hex');
        const idempotencyKey = options?.sourceRecordId
            ? `EntityStateChanged:${options.sourceSystem}:${options.sourceRecordId}`
            : `EntityStateChanged:${logicalId}:${hash}`;
        const result = await ontologySvc.recordDomainEventAndApply({
            eventType: 'EntityStateChanged',
            logicalId,
            entityTypeId: entityType.id,
            entityVersion: entityType.version,
            data: attrData,
            projectId: entityType.projectId ?? 'default',
            actor: options?.sourceSystem ?? 'data-integration',
            idempotencyKey,
            sourceSystem: options?.sourceSystem,
            sourceRecordId: options?.sourceRecordId,
            metadata: {
                confidence: options?.confidence ?? 1.0,
                sourceSystem: options?.sourceSystem
            }
        });
        // ── Fire-and-forget logic ──
        // Note: These could eventually be moved into the Outbox/Worker for even tighter decoupling
        // 1. Evaluate policies
        (0, policy_engine_1.evaluatePolicies)({
            eventId: result.event.id,
            eventType: 'EntityStateChanged',
            entityTypeId: entityType.id,
            logicalId,
            entityVersion: entityType.version,
            payload: {
                previousState: null, // Previous state fetch could be optimized if needed
                newState: attrData,
                validFrom: new Date().toISOString(),
            },
        }, prisma);
        // 2. Trigger semantic reasoner
        (0, ontology_reasoner_1.runReasonerForEntity)(logicalId, entityType.projectId ?? 'default', prisma).catch(err => {
            console.error(`[Semantic Reasoner Error] Failed to reason for entity ${logicalId}:`, err);
        });
        return { success: true, instanceId: result.instanceId };
    }
    catch (error) {
        return { success: false, error: String(error) };
    }
}
// ── Job Execution Engine ─────────────────────────────────────────
/**
 * Executes a single integration job:
 * 1. Creates a JobExecution record (PENDING → RUNNING)
 * 2. Calls the appropriate connector to fetch records
 * 3. Transforms each record using fieldMapping
 * 4. Upserts each record as an entity instance
 * 5. Updates the JobExecution with results
 */
async function executeJob(jobId, prisma, queueId, inlineData, options) {
    // Load the job with its data source and target entity type
    const job = await prisma.integrationJob.findUnique({
        where: { id: jobId },
        include: {
            dataSource: true,
            targetEntityType: { include: { attributes: true } },
        },
    });
    if (!job)
        throw new Error(`Integration job '${jobId}' not found`);
    if (!job.enabled)
        throw new Error(`Integration job '${job.name}' is disabled`);
    if (!job.dataSource.enabled)
        throw new Error(`Data source '${job.dataSource.name}' is disabled`);
    let recordsProcessed = 0;
    let recordsFailed = 0;
    let recordsDropped = 0;
    try {
        // Step 1: Fetch records via connector
        const connectorFn = connectors[job.dataSource.type];
        if (!connectorFn) {
            throw new Error(`Unsupported data source type: '${job.dataSource.type}'`);
        }
        const connectionConfig = job.dataSource.connectionConfig;
        const rawRecords = await connectorFn(connectionConfig, inlineData);
        // Step 2: Transform + Ingest each record
        const fieldMapping = job.fieldMapping;
        const dataContract = job.dataContract;
        const entityType = {
            id: job.targetEntityType.id,
            version: job.targetEntityType.version,
            name: job.targetEntityType.name,
            projectId: job.targetEntityType.projectId,
        };
        for (const raw of rawRecords) {
            // Data Contract Validation
            if (dataContract) {
                let contractFailed = false;
                // Allow defining a custom threshold in the contract, default to 5%
                const contractObj = dataContract;
                const threshold = typeof contractObj.threshold === 'number' ? contractObj.threshold : 0.05;
                if (dataContract.required) {
                    for (const reqField of dataContract.required) {
                        if (raw[reqField] === undefined || raw[reqField] === null) {
                            contractFailed = true;
                            break;
                        }
                    }
                }
                if (!contractFailed && dataContract.types) {
                    for (const [key, type] of Object.entries(dataContract.types)) {
                        if (raw[key] !== undefined && raw[key] !== null && typeof raw[key] !== type) {
                            contractFailed = true;
                            break;
                        }
                    }
                }
                if (contractFailed) {
                    recordsDropped++;
                    console.warn(`[DataIntegration] Record dropped due to data contract violation:`, raw);
                    // Persist rejected record for quarantine/analysis
                    try {
                        await prisma.rejectedRecord.create({
                            data: {
                                projectId: job.targetEntityType.projectId ?? global.DEFAULT_PROJECT_ID,
                                dataSourceId: job.dataSourceId,
                                jobId: job.id,
                                rawRecord: raw,
                                errors: dataContract,
                            },
                        });
                    }
                    catch (err) {
                        // eslint-disable-next-line no-console
                        console.warn('[DataIntegration] Failed to persist RejectedRecord:', err);
                    }
                    continue;
                }
            }
            let externalId = raw[job.logicalIdField];
            if (!externalId || typeof externalId !== 'string') {
                recordsFailed++;
                // eslint-disable-next-line no-console
                console.warn(`[DataIntegration] Skipping record: missing or invalid logicalIdField '${job.logicalIdField}'`, raw);
                continue;
            }
            // Step 2a: Identity Resolution
            let logicalId = externalId;
            let confidence = 1.0;
            const resolved = await identity_service_1.IdentityService.resolveLogicalId(job.dataSource.name, externalId, prisma);
            if (resolved) {
                logicalId = resolved.logicalId;
                confidence = resolved.confidence;
            }
            else {
                // If not resolved, use the externalId as the logicalId for now and register an alias
                await identity_service_1.IdentityService.registerAlias(job.dataSource.name, externalId, externalId, 1.0, entityType.projectId, prisma);
            }
            const mapped = transformRecord(raw, fieldMapping);
            const result = await upsertEntityInstance(entityType, logicalId, mapped, prisma, {
                sourceSystem: job.dataSource.name,
                sourceRecordId: externalId, // Using externalId as sourceRecordId for simplicity
                confidence,
                ...(options?.generateOutbox ? { generateOutbox: { targetSystem: 'WEBHOOK' } } : {})
            });
            if (result.success) {
                recordsProcessed++;
            }
            else {
                recordsFailed++;
                // eslint-disable-next-line no-console
                console.warn(`[DataIntegration] Failed to ingest record ${logicalId}:`, result.error);
            }
        }
        const totalProcessed = recordsProcessed + recordsFailed + recordsDropped;
        if (dataContract && totalProcessed > 0) {
            const contractObj = dataContract;
            const threshold = typeof contractObj.threshold === 'number' ? contractObj.threshold : 0.05;
            const dropRatio = recordsDropped / totalProcessed;
            if (dropRatio > threshold) {
                throw new Error(`Data Quality Violation: Dropped record ratio (${(dropRatio * 100).toFixed(1)}%) exceeds threshold (${(threshold * 100).toFixed(1)}%). Job aborted to prevent data corruption.`);
            }
        }
        // Orchestrator handles marking completion on the JobQueue object.
        return {
            status: 'COMPLETED',
            recordsProcessed,
            recordsFailed,
            recordsDropped,
        };
    }
    catch (error) {
        // Orchestrator will handle the failure update to JobQueue
        return {
            status: 'FAILED',
            recordsProcessed,
            recordsFailed,
            recordsDropped,
            error: String(error),
        };
    }
}
/**
 * Dry-Run an integration job:
 * Fetches data from the exact connector but halts before writing any instances to the DB.
 * Returns a subset of raw vs mapped records for user preview.
 */
async function dryRunJob(jobId, prisma, inlineData) {
    const job = await prisma.integrationJob.findUnique({
        where: { id: jobId },
        include: {
            dataSource: true,
            targetEntityType: { include: { attributes: true } },
        },
    });
    if (!job)
        throw new Error(`Integration job '${jobId}' not found`);
    try {
        const connectorFn = connectors[job.dataSource.type];
        if (!connectorFn) {
            throw new Error(`Unsupported data source type: '${job.dataSource.type}'`);
        }
        const connectionConfig = job.dataSource.connectionConfig;
        const rawRecords = await connectorFn(connectionConfig, inlineData);
        const fieldMapping = job.fieldMapping;
        const previewLimit = 5;
        const previewRecords = rawRecords.slice(0, previewLimit);
        const output = previewRecords.map(raw => {
            const externalId = raw[job.logicalIdField];
            const mapped = transformRecord(raw, fieldMapping);
            return {
                raw,
                mapped,
                externalId: externalId ?? null
            };
        });
        return {
            status: 'SUCCESS',
            records: output
        };
    }
    catch (error) {
        return {
            status: 'FAILED',
            records: [],
            error: String(error),
        };
    }
}
// ── Simple Scheduler (Upgraded to enqueue jobs instead of run) ────
/**
 * Live telemetry for the job scheduler — consumed by the deep health endpoint.
 * All fields are null until the scheduler has started and run at least one tick.
 */
exports.schedulerTelemetry = {
    jobScheduler: {
        startedAt: null,
        lastTickAt: null,
        lastError: null,
        tickIntervalMs: 60000, // expected tick interval
    },
};
/**
 * A lightweight interval-based scheduler.
 * Checks every 60 seconds for jobs with a `schedule` field.
 * Supports simple interval patterns: "every:Xs", "every:Xm", "every:Xh"
 * (e.g., "every:30s", "every:5m", "every:1h")
 */
const lastRunMap = new Map(); // jobId → last run timestamp (ms)
function parseScheduleMs(schedule) {
    const match = schedule.match(/^every:(\d+)(s|m|h)$/);
    if (!match)
        return null;
    const value = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
        case 's': return value * 1000;
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        default: return null;
    }
}
function startScheduler(prisma) {
    const TICK_INTERVAL = 60000; // check every 60 seconds
    exports.schedulerTelemetry.jobScheduler.startedAt = new Date();
    exports.schedulerTelemetry.jobScheduler.tickIntervalMs = TICK_INTERVAL;
    setInterval(async () => {
        try {
            const jobs = await prisma.integrationJob.findMany({
                where: {
                    enabled: true,
                    schedule: { not: null },
                    dataSource: { enabled: true },
                },
                include: { dataSource: true },
            });
            const now = Date.now();
            for (const job of jobs) {
                if (!job.schedule)
                    continue;
                const intervalMs = parseScheduleMs(job.schedule);
                if (!intervalMs) {
                    // eslint-disable-next-line no-console
                    console.warn(`[Scheduler] Invalid schedule format for job '${job.name}': ${job.schedule}`);
                    continue;
                }
                const lastRun = lastRunMap.get(job.id) ?? 0;
                if (now - lastRun >= intervalMs) {
                    lastRunMap.set(job.id, now);
                    // eslint-disable-next-line no-console
                    console.log(`[Scheduler] Running scheduled job '${job.name}'`);
                    // Push a new job onto the Orchestrator Queue
                    prisma.jobQueue.create({
                        data: {
                            jobType: 'INTEGRATION_SYNC',
                            integrationJobId: job.id,
                            payload: { autoScheduled: true },
                            priority: 5, // normal priority for scheduled runs
                            projectId: job.projectId
                        }
                    }).catch((err) => {
                        console.error(`[Scheduler] Job enqueue failed:`, err);
                    });
                }
            }
            // Record successful tick
            exports.schedulerTelemetry.jobScheduler.lastTickAt = new Date();
            exports.schedulerTelemetry.jobScheduler.lastError = null;
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.error('[Scheduler] Tick error:', error);
            exports.schedulerTelemetry.jobScheduler.lastError = String(error);
            exports.schedulerTelemetry.jobScheduler.lastTickAt = new Date();
        }
    }, TICK_INTERVAL);
    // eslint-disable-next-line no-console
    console.log(`[Scheduler] Started — checking every ${TICK_INTERVAL / 1000}s for scheduled jobs`);
}
//# sourceMappingURL=data-integration.js.map