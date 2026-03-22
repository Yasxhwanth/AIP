export declare class OntologyService {
    private prisma;
    constructor(prisma: any);
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
    recordDomainEventAndApply(args: {
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
    }): Promise<any>;
    /**
     * Rebuilds the CurrentEntityState for a specific EntityType by replaying all DomainEvents.
     * This is used for recovery or when projection logic changes.
     */
    replayEntityType(entityTypeId: string, projectId: string): Promise<any>;
}
//# sourceMappingURL=ontology-service.d.ts.map