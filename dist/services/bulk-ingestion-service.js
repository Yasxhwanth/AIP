"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkIngestionService = void 0;
const ontology_service_1 = require("../ontology-service");
const outbox_service_1 = require("../outbox-service");
/**
 * BulkIngestionService — encapsulates all logic for high-volume entity ingestion.
 * Designed to be called from the Orchestrator (background), keeping the API thread free.
 * Every record goes through OntologyService to ensure event-sourcing discipline.
 */
class BulkIngestionService {
    constructor(prisma) {
        this.prisma = prisma;
        this.ontologySvc = new ontology_service_1.OntologyService(prisma);
    }
    async execute(payload) {
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
        const errors = [];
        for (const item of items) {
            const { logicalId, ...rest } = item;
            try {
                // Build attribute payload (strip meta fields)
                const attrData = {};
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
                await outbox_service_1.OutboxService.enqueue(this.prisma, {
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
            }
            catch (err) {
                failed++;
                errors.push({ logicalId, error: String(err.message ?? err) });
                console.error(`[BulkIngestionService] Failed to process logicalId=${logicalId}:`, err);
            }
        }
        console.log(`[BulkIngestionService] Done. Processed: ${processed}, Failed: ${failed}`);
        return { processed, failed, errors };
    }
}
exports.BulkIngestionService = BulkIngestionService;
//# sourceMappingURL=bulk-ingestion-service.js.map