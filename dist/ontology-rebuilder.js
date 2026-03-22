"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OntologyRebuilder = void 0;
const logger_1 = __importDefault(require("./logger"));
class OntologyRebuilder {
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Reconstructs the CurrentEntityState projection from the DomainEvent log.
     * This is a "scratch and rebuild" operation.
     * Atomic swap is simulated here by using a transaction or a separate table (if schema supported).
     * For this implementation, we clear and rebuild within a transaction to maintain consistency.
     */
    async rebuildProjectOntology(projectId) {
        logger_1.default.info({ projectId }, '🔄 Starting Ontology Rebuild from DomainEvents');
        return await this.prisma.$transaction(async (tx) => {
            // 1. Clear existing projections for this project
            const deleted = await tx.currentEntityState.deleteMany({
                where: { projectId }
            });
            logger_1.default.info({ projectId, deletedCount: deleted.count }, '🗑️ Cleared existing CurrentEntityState projections');
            // 2. Fetch all DomainEvents in chronological order
            const events = await tx.domainEvent.findMany({
                where: { projectId },
                orderBy: { occurredAt: 'asc' }
            });
            logger_1.default.info({ projectId, eventCount: events.length }, '📜 Replaying domain events');
            let processedCount = 0;
            for (const event of events) {
                const payload = event.payload;
                const newState = payload.newState;
                if (event.eventType === 'EntityDeleted') {
                    await tx.currentEntityState.delete({
                        where: { logicalId: event.logicalId }
                    }).catch(() => { });
                }
                else {
                    // EntityCreated or EntityUpdated or EntityStateChanged
                    await tx.currentEntityState.upsert({
                        where: { logicalId: event.logicalId },
                        create: {
                            logicalId: event.logicalId,
                            entityTypeId: event.entityTypeId,
                            data: newState,
                            projectId: event.projectId,
                            updatedAt: event.occurredAt
                        },
                        update: {
                            data: newState,
                            updatedAt: event.occurredAt
                        }
                    });
                }
                processedCount++;
            }
            logger_1.default.info({ projectId, processedCount }, '✅ Ontology rebuild completed successfully');
            return { success: true, processedCount };
        }, {
            timeout: 30000 // 30s timeout for large rebuilds
        });
    }
}
exports.OntologyRebuilder = OntologyRebuilder;
//# sourceMappingURL=ontology-rebuilder.js.map