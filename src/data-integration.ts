import { PrismaClient, Prisma } from './generated/prisma';
import { evaluatePolicies } from './policy-engine';
import { IdentityService } from './identity-service';
import { ProvenanceService } from './provenance-service';

// ── Types ────────────────────────────────────────────────────────

interface ConnectionConfig {
    url?: string;
    headers?: Record<string, string>;
    method?: string;
    body?: unknown;
    responsePath?: string; // JSONPath-like dot-notation to the array of records in the response
}

type FieldMapping = Record<string, string>; // { externalField: ontologyAttribute }

// ── Connector Registry ───────────────────────────────────────────

type ConnectorFn = (
    config: ConnectionConfig,
    inlineData?: unknown[],
) => Promise<Record<string, unknown>[]>;

const connectors: Record<string, ConnectorFn> = {
    /**
     * REST_API — Fetch records from an HTTP endpoint.
     * connectionConfig: { url, headers?, method?, responsePath? }
     */
    REST_API: async (config) => {
        if (!config.url) throw new Error('REST_API connector requires a url in connectionConfig');

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

        return data as Record<string, unknown>[];
    },

    /**
     * JSON_UPLOAD — Accept raw records passed inline in the request body.
     */
    JSON_UPLOAD: async (_config, inlineData) => {
        if (!inlineData || !Array.isArray(inlineData)) {
            throw new Error('JSON_UPLOAD connector: inline data[] is required');
        }
        return inlineData as Record<string, unknown>[];
    },

    /**
     * CSV_UPLOAD — Accept CSV text passed inline, parse into records.
     */
    CSV_UPLOAD: async (_config, inlineData) => {
        if (!inlineData || !Array.isArray(inlineData)) {
            throw new Error('CSV_UPLOAD connector: inline data[] is required (pre-parsed rows)');
        }
        return inlineData as Record<string, unknown>[];
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
function transformRecord(
    record: Record<string, unknown>,
    fieldMapping: FieldMapping,
): Record<string, unknown> {
    const mapped: Record<string, unknown> = {};

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
export async function upsertEntityInstance(
    entityType: { id: string; version: number; name: string },
    logicalId: string,
    attrData: Record<string, unknown>,
    prisma: PrismaClient,
    options?: {
        sourceSystem: string;
        sourceRecordId: string;
        confidence?: number;
    }
): Promise<{ success: boolean; instanceId?: string; error?: string }> {
    const now = new Date();

    try {
        const { eventId, previousState, instanceId } = await prisma.$transaction(async (tx) => {
            // Fetch the currently-active row
            const current = await tx.entityInstance.findFirst({
                where: {
                    entityTypeId: entityType.id,
                    logicalId,
                    validTo: null,
                },
            });

            // Close the currently-active row (if any)
            if (current) {
                await tx.entityInstance.update({
                    where: { id: current.id },
                    data: { validTo: now },
                });
            }

            // Insert new active row
            const newInstance = await tx.entityInstance.create({
                data: {
                    logicalId,
                    entityTypeId: entityType.id,
                    entityVersion: entityType.version,
                    data: attrData as Prisma.InputJsonValue,
                    validFrom: now,
                    validTo: null,
                    confidenceScore: options?.confidence ?? 1.0,
                    reviewStatus: (options?.confidence ?? 1.0) < 0.7 ? 'PENDING' : 'APPROVED' // Low confidence requires review
                },
            });

            // Record Provenance
            if (options?.sourceSystem && options?.sourceRecordId) {
                await ProvenanceService.recordLineage(
                    newInstance.id,
                    options.sourceSystem,
                    options.sourceRecordId,
                    now, // source timestamp (approximated here as now)
                    null, // Entire record provenance for now
                    tx
                );
            }

            // Emit domain event
            const idempotencyKey = `EntityStateChanged:${logicalId}:${now.toISOString()}`;
            const domainEvent = await tx.domainEvent.create({
                data: {
                    idempotencyKey,
                    eventType: 'EntityStateChanged',
                    entityTypeId: entityType.id,
                    logicalId,
                    entityVersion: entityType.version,
                    payload: {
                        previousState: current?.data ?? null,
                        newState: attrData,
                        validFrom: now.toISOString(),
                    } as unknown as Prisma.InputJsonValue,
                },
            });

            // CQRS: Upsert read model projection
            await tx.currentEntityState.upsert({
                where: { logicalId },
                create: {
                    logicalId,
                    entityTypeId: entityType.id,
                    data: attrData as Prisma.InputJsonValue,
                    updatedAt: now,
                },
                update: {
                    data: attrData as Prisma.InputJsonValue,
                    updatedAt: now,
                },
            });

            return {
                eventId: domainEvent.id,
                previousState: (current?.data as Record<string, unknown>) ?? null,
                instanceId: newInstance.id
            };
        });

        // Fire-and-forget: evaluate policies
        evaluatePolicies(
            {
                eventId,
                eventType: 'EntityStateChanged',
                entityTypeId: entityType.id,
                logicalId,
                entityVersion: entityType.version,
                payload: {
                    previousState,
                    newState: attrData,
                    validFrom: now.toISOString(),
                },
            },
            prisma,
        );

        return { success: true, instanceId };
    } catch (error) {
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
export async function executeJob(
    jobId: string,
    prisma: PrismaClient,
    queueId?: string,
    inlineData?: unknown[],
): Promise<{ status: string; recordsProcessed: number; recordsFailed: number; error?: string }> {
    // Load the job with its data source and target entity type
    const job = await prisma.integrationJob.findUnique({
        where: { id: jobId },
        include: {
            dataSource: true,
            targetEntityType: { include: { attributes: true } },
        },
    });

    if (!job) throw new Error(`Integration job '${jobId}' not found`);
    if (!job.enabled) throw new Error(`Integration job '${job.name}' is disabled`);
    if (!job.dataSource.enabled) throw new Error(`Data source '${job.dataSource.name}' is disabled`);

    let recordsProcessed = 0;
    let recordsFailed = 0;

    try {
        // Step 1: Fetch records via connector
        const connectorFn = connectors[job.dataSource.type];
        if (!connectorFn) {
            throw new Error(`Unsupported data source type: '${job.dataSource.type}'`);
        }

        const connectionConfig = job.dataSource.connectionConfig as unknown as ConnectionConfig;
        const rawRecords = await connectorFn(connectionConfig, inlineData);

        // Step 2: Transform + Ingest each record
        const fieldMapping = job.fieldMapping as unknown as FieldMapping;
        const entityType = {
            id: job.targetEntityType.id,
            version: job.targetEntityType.version,
            name: job.targetEntityType.name,
        };

        for (const raw of rawRecords) {
            let externalId = raw[job.logicalIdField] as string;
            if (!externalId || typeof externalId !== 'string') {
                recordsFailed++;
                // eslint-disable-next-line no-console
                console.warn(
                    `[DataIntegration] Skipping record: missing or invalid logicalIdField '${job.logicalIdField}'`,
                    raw,
                );
                continue;
            }

            // Step 2a: Identity Resolution
            let logicalId = externalId;
            let confidence = 1.0;

            const resolved = await IdentityService.resolveLogicalId(job.dataSource.name, externalId, prisma);
            if (resolved) {
                logicalId = resolved.logicalId;
                confidence = resolved.confidence;
            } else {
                // If not resolved, use the externalId as the logicalId for now and register an alias
                await IdentityService.registerAlias(job.dataSource.name, externalId, externalId, 1.0, prisma);
            }

            const mapped = transformRecord(raw, fieldMapping);
            const result = await upsertEntityInstance(entityType, logicalId, mapped, prisma, {
                sourceSystem: job.dataSource.name,
                sourceRecordId: externalId, // Using externalId as sourceRecordId for simplicity
                confidence
            });

            if (result.success) {
                recordsProcessed++;
            } else {
                recordsFailed++;
                // eslint-disable-next-line no-console
                console.warn(`[DataIntegration] Failed to ingest record ${logicalId}:`, result.error);
            }
        }

        // Orchestrator handles marking completion on the JobQueue object.
        return {
            status: 'COMPLETED',
            recordsProcessed,
            recordsFailed,
        };
    } catch (error) {
        // Orchestrator will handle the failure update to JobQueue
        return {
            status: 'FAILED',
            recordsProcessed,
            recordsFailed,
            error: String(error),
        };
    }
}

// ── Simple Scheduler (Upgraded to enqueue jobs instead of run) ────

/**
 * A lightweight interval-based scheduler.
 * Checks every 60 seconds for jobs with a `schedule` field.
 * Supports simple interval patterns: "every:Xs", "every:Xm", "every:Xh"
 * (e.g., "every:30s", "every:5m", "every:1h")
 */
const lastRunMap = new Map<string, number>(); // jobId → last run timestamp (ms)

function parseScheduleMs(schedule: string): number | null {
    const match = schedule.match(/^every:(\d+)(s|m|h)$/);
    if (!match) return null;

    const value = parseInt(match[1]!, 10);
    const unit = match[2]!;

    switch (unit) {
        case 's': return value * 1000;
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        default: return null;
    }
}

export function startScheduler(prisma: PrismaClient): void {
    const TICK_INTERVAL = 60_000; // check every 60 seconds

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
                if (!job.schedule) continue;

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
                        }
                    }).catch((err: any) => {
                        console.error(`[Scheduler] Job enqueue failed:`, err);
                    });
                }
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('[Scheduler] Tick error:', error);
        }
    }, TICK_INTERVAL);

    // eslint-disable-next-line no-console
    console.log(`[Scheduler] Started — checking every ${TICK_INTERVAL / 1000}s for scheduled jobs`);
}
