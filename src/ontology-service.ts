import { PrismaClient } from './generated/prisma';
import { recordDomainEvent } from './domain-events';
import { tenantStorage } from './tenant-context';

export class OntologyService {
    constructor(private prisma: any) { }

    /**
     * Canonical helper to record a DomainEvent and update the CurrentEntityState in a single transaction.
     * This ensures event-sourcing invariants: No state change without an event.
     * 
     * Handles:
     * 1. Immutable DomainEvent creation.
     * 2. Transactional Outbox entry for external sync.
     * 3. Bi-temporal record creation (EntityInstance history).
     * 4. CurrentEntityState projection update (CQRS).
     */
    async recordDomainEventAndApply(args: {
        eventType: string;
        logicalId: string;
        entityTypeId: string;
        entityVersion?: number;
        data: any;
        projectId: string;
        actor: string;
        idempotencyKey?: string;
        sourceSystem?: string;
        sourceRecordId?: string;
        metadata?: any;
    }) {
        const {
            eventType,
            logicalId,
            entityTypeId,
            entityVersion = 1,
            data,
            projectId,
            actor,
            idempotencyKey,
            sourceSystem,
            sourceRecordId,
            metadata
        } = args;

        const now = new Date();

        return this.prisma.$transaction(async (tx: any) => {
            // 1. Record the Immutable Domain Event
            const event = await recordDomainEvent({
                prisma: tx as any,
                eventType,
                projectId,
                entityTypeId,
                logicalId,
                entityVersion,
                payload: {
                    previousState: null, // Logic to fetch previous state could be added here if needed
                    newState: data,
                    validFrom: now.toISOString()
                },
                idempotencyKey,
                outbox: {
                    projectId,
                    aggregateType: 'OntologyEntity',
                    targetSystem: 'AIP_INTERNAL'
                }
            }, tx as any);

            // Handle Deletion
            if (eventType === 'EntityDeleted') {
                await tx.currentEntityState.delete({ where: { logicalId } }).catch(() => { }); // Ignore if already gone
                return { event, projection: null };
            }

            // Handle Legal Hold (Partial update)
            if (eventType === 'LegalHoldChanged') {
                const projection = await tx.currentEntityState.update({
                    where: { logicalId },
                    data: {
                        legalHold: !!data.enabled,
                        updatedAt: now
                    }
                });
                return { event, projection };
            }

            // 2. Bi-temporal History: Close currently-active row in EntityInstance
            const currentActive = await tx.entityInstance.findFirst({
                where: { entityTypeId, logicalId, validTo: null }
            });

            if (currentActive) {
                await tx.entityInstance.update({
                    where: { id: currentActive.id },
                    data: { validTo: now }
                });
            }

            // 3. Insert New Bi-temporal Record
            const newInstance = await tx.entityInstance.create({
                data: {
                    logicalId,
                    entityTypeId,
                    entityVersion,
                    data,
                    validFrom: now,
                    validTo: null,
                    projectId,
                    confidenceScore: 1.0, // Default
                    reviewStatus: 'APPROVED'
                }
            });

            // 4. Record Provenance if source info provided
            if (sourceSystem && sourceRecordId) {
                await tx.provenance.create({
                    data: {
                        resourceId: newInstance.id,
                        sourceSystem,
                        sourceId: sourceRecordId,
                        projectId,
                        actor,
                        occurredAt: now
                    }
                });
            }

            // 5. Project into CurrentEntityState (Fast-Read Projection)
            const projection = await tx.currentEntityState.upsert({
                where: { logicalId },
                update: {
                    data,
                    updatedAt: now,
                    projectId // Ensure projectId matches current tenant
                },
                create: {
                    logicalId,
                    entityTypeId,
                    data,
                    updatedAt: now,
                    projectId
                }
            });

            return { event, projection, instanceId: newInstance.id };
        });
    }

    /**
     * Rebuilds the CurrentEntityState for a specific EntityType by replaying all DomainEvents.
     * This is used for recovery or when projection logic changes.
     */
    async replayEntityType(entityTypeId: string, projectId: string) {
        return this.prisma.$transaction(async (tx: any) => {
            // 1. Clear existing projection for this type
            await tx.currentEntityState.deleteMany({
                where: { entityTypeId, projectId }
            });

            // 2. Fetch all events for this type
            const events = await tx.domainEvent.findMany({
                where: { entityTypeId, projectId },
                orderBy: { occurredAt: 'asc' }
            });

            const stateMap = new Map<string, any>();
            for (const ev of events) {
                if (ev.eventType === 'EntityStateChanged') {
                    const payload = ev.payload as any;
                    if (payload.newState) {
                        stateMap.set(ev.logicalId, {
                            data: payload.newState,
                            updatedAt: ev.occurredAt,
                            lastEventId: ev.id
                        });
                    }
                }
            }

            // 3. Batch insert the new projection
            let rebuiltCount = 0;
            for (const [logicalId, state] of stateMap.entries()) {
                await tx.currentEntityState.create({
                    data: {
                        logicalId,
                        entityTypeId,
                        data: state.data,
                        updatedAt: state.updatedAt,
                        lastEventId: state.lastEventId,
                        projectId
                    }
                });
                rebuiltCount++;
            }

            return { rebuiltCount };
        });
    }
}
