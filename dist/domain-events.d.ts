import { PrismaClient, Prisma } from './generated/prisma';
export type CanonicalEventType = 'EntityCreated' | 'EntityUpdated' | 'EntityDeleted' | 'RelationshipCreated' | 'RelationshipDeleted' | 'IdempotencyLock';
export interface EntityStatePayload {
    previousState: Record<string, unknown> | null;
    newState: Record<string, unknown>;
    validFrom?: string;
}
export interface RecordDomainEventArgs {
    prisma: PrismaClient;
    entityTypeId: string;
    logicalId: string;
    entityVersion: number;
    eventType: CanonicalEventType | string;
    payload: EntityStatePayload;
    idempotencyKey?: string | null;
    projectId: string;
    outbox?: {
        projectId: string;
        aggregateType: string;
        targetSystem: string;
    };
}
/**
 * Append a DomainEvent row using a canonical payload shape.
 * Callers are responsible for updating projections (CurrentEntityState, CurrentGraph, etc.)
 * in the same transaction when needed.
 */
export declare function recordDomainEvent(args: RecordDomainEventArgs, tx?: Prisma.TransactionClient): Promise<any>;
//# sourceMappingURL=domain-events.d.ts.map