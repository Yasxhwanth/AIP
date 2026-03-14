import { PrismaClient, Prisma } from './generated/prisma';

export type CanonicalEventType =
  | 'EntityCreated'
  | 'EntityUpdated'
  | 'EntityDeleted'
  | 'RelationshipCreated'
  | 'RelationshipDeleted'
  | 'IdempotencyLock';

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
export async function recordDomainEvent(args: RecordDomainEventArgs, tx?: Prisma.TransactionClient) {
  const client: PrismaClient | Prisma.TransactionClient = tx ?? args.prisma;

  const domainEvent = await (client as any).domainEvent.create({
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
    await (client as any).outboxEvent.create({
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

