import { PrismaClient } from '../generated/prisma';
import { OntologyService } from '../ontology-service';
import { OutboxService } from '../outbox-service';

export interface BulkIngestionRecord {
    logicalId: string;
    [key: string]: unknown;
}

export interface BulkIngestionPayload {
    entityTypeId: string;
    projectId: string;
    actor: string;
    items: BulkIngestionRecord[];
}

export interface BulkIngestionResult {
    processed: number;
    failed: number;
    errors: { logicalId: string; error: string }[];
}

/**
 * BulkIngestionService — encapsulates all logic for high-volume entity ingestion.
 * Designed to be called from the Orchestrator (background), keeping the API thread free.
 * Every record goes through OntologyService to ensure event-sourcing discipline.
 */
export class BulkIngestionService {
    private prisma: PrismaClient;
    private ontologySvc: OntologyService;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
        this.ontologySvc = new OntologyService(prisma);
    }

    async execute(payload: BulkIngestionPayload): Promise<BulkIngestionResult> {
        const { entityTypeId, projectId, actor, items } = payload;

        // Load entity type once for validation
        const entityType = await this.prisma.entityType.findUnique({
            where: { id: entityTypeId },
            include: { attributes: true },
        });

        if (!entityType) {
            throw new Error(`Entity type '${entityTypeId}' not found`);
        }

        const allowedNames = new Set(entityType.attributes.map((a) => a.name));
        const metaFields = new Set(['logicalId', 'validFrom', 'validTo']);
        const now = new Date();

        let processed = 0;
        let failed = 0;
        const errors: { logicalId: string; error: string }[] = [];

        for (const item of items) {
            const { logicalId, ...rest } = item;

            try {
                // Build attribute payload (strip meta fields)
                const attrData: Record<string, unknown> = {};
                for (const [key, value] of Object.entries(rest)) {
                    if (!metaFields.has(key) && allowedNames.has(key)) {
                        attrData[key] = value;
                    }
                }

                const idempotencyKey = `BulkIngestion:${entityTypeId}:${logicalId}:${now.toISOString()}`;

                // recordDomainEventAndApply handles bi-temporal history + projection atomically
                const { event } = await this.ontologySvc.recordDomainEventAndApply({
                    eventType: 'EntityStateChanged',
                    logicalId,
                    entityTypeId: entityType.id,
                    entityVersion: entityType.version,
                    data: attrData,
                    projectId,
                    actor,
                    idempotencyKey,
                    metadata: { source: 'BulkIngestionService' },
                });

                // Enqueue outbox for external system fanout
                await OutboxService.enqueue(this.prisma as any, {
                    projectId,
                    aggregateType: 'EntityType',
                    aggregateId: entityType.id,
                    eventType: 'EntityStateChanged',
                    targetSystem: 'WEBHOOK',
                    payload: {
                        entityTypeId: entityType.id,
                        logicalId,
                        data: attrData,
                        timestamp: now.toISOString()
                    },
                    domainEventId: event.id
                });

                processed++;
            } catch (err: any) {
                failed++;
                errors.push({ logicalId, error: String(err.message ?? err) });
                console.error(`[BulkIngestionService] Failed to process logicalId=${logicalId}:`, err);
            }
        }

        console.log(`[BulkIngestionService] Done. Processed: ${processed}, Failed: ${failed}`);
        return { processed, failed, errors };
    }
}
