"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordDomainEvent = recordDomainEvent;
/**
 * Append a DomainEvent row using a canonical payload shape.
 * Callers are responsible for updating projections (CurrentEntityState, CurrentGraph, etc.)
 * in the same transaction when needed.
 */
async function recordDomainEvent(args, tx) {
    const client = tx ?? args.prisma;
    const domainEvent = await client.domainEvent.create({
        data: {
            idempotencyKey: args.idempotencyKey ?? null,
            eventType: args.eventType,
            entityTypeId: args.entityTypeId,
            logicalId: args.logicalId,
            entityVersion: args.entityVersion,
            payload: {
                previousState: args.payload.previousState,
                newState: args.payload.newState,
                validFrom: args.payload.validFrom ?? new Date().toISOString(),
            },
            projectId: args.projectId,
        },
    });
    if (args.outbox) {
        await client.outboxEvent.create({
            data: {
                projectId: args.outbox.projectId,
                aggregateType: args.outbox.aggregateType,
                aggregateId: args.logicalId,
                eventType: args.eventType,
                targetSystem: args.outbox.targetSystem,
                payload: args.payload.newState,
                domainEventId: domainEvent.id
            }
        });
    }
    return domainEvent;
}
//# sourceMappingURL=domain-events.js.map