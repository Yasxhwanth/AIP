import { PrismaClient, Prisma } from './generated/prisma';
import logger from './logger';

export class OntologyRebuilder {
    constructor(private prisma: PrismaClient) { }

    /**
     * Reconstructs the CurrentEntityState projection from the DomainEvent log.
     * This is a "scratch and rebuild" operation.
     * Atomic swap is simulated here by using a transaction or a separate table (if schema supported).
     * For this implementation, we clear and rebuild within a transaction to maintain consistency.
     */
    async rebuildProjectOntology(projectId: string) {
        logger.info({ projectId }, '🔄 Starting Ontology Rebuild from DomainEvents');

        return await this.prisma.$transaction(async (tx) => {
            // 1. Clear existing projections for this project
            const deleted = await tx.currentEntityState.deleteMany({
                where: { projectId }
            });
            logger.info({ projectId, deletedCount: deleted.count }, '🗑️ Cleared existing CurrentEntityState projections');

            // 2. Fetch all DomainEvents in chronological order
            const events = await tx.domainEvent.findMany({
                where: { projectId },
                orderBy: { occurredAt: 'asc' }
            });

            logger.info({ projectId, eventCount: events.length }, '📜 Replaying domain events');

            let processedCount = 0;
            for (const event of events) {
                const payload = event.payload as any;
                const newState = payload.newState;

                if (event.eventType === 'EntityDeleted') {
                    await tx.currentEntityState.delete({
                        where: { logicalId: event.logicalId }
                    }).catch(() => { /* ignore if already gone */ });
                } else {
                    // EntityCreated or EntityUpdated or EntityStateChanged
                    await tx.currentEntityState.upsert({
                        where: { logicalId: event.logicalId },
                        create: {
                            logicalId: event.logicalId,
                            entityTypeId: event.entityTypeId,
                            data: newState as Prisma.InputJsonValue,
                            projectId: event.projectId,
                            updatedAt: event.occurredAt
                        },
                        update: {
                            data: newState as Prisma.InputJsonValue,
                            updatedAt: event.occurredAt
                        }
                    });
                }
                processedCount++;
            }

            logger.info({ projectId, processedCount }, '✅ Ontology rebuild completed successfully');
            return { success: true, processedCount };
        }, {
            timeout: 30000 // 30s timeout for large rebuilds
        });
    }
}
