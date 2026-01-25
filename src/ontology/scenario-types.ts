export type MutationType = 'ATTRIBUTE_OVERRIDE' | 'RELATIONSHIP_ADD' | 'RELATIONSHIP_REMOVE' | 'STATUS_CHANGE';

export interface ScenarioBranch {
    scenarioId: string;
    tenantId: string;
    baseAsOfTime: Date;
    baseOntologyVersion: string; // MUST match current system version to be valid
    createdBy: string;
    createdAt: Date;
    description: string;
    status: 'ACTIVE' | 'ARCHIVED' | 'PROMOTED';
}

export interface ScenarioMutation {
    mutationId: string;
    scenarioId: string;
    sequence: number; // Monotonic counter for deterministic replay
    targetEntityId: string;
    mutationType: MutationType;
    proposedValue: any;
    effectiveValidTime: Date;
    createdAt: Date;
}

export interface ConflictReport {
    scenarioId: string;
    generatedAt: Date;
    conflicts: {
        entityId: string;
        attributeId?: string;
        scenarioValue: any;
        truthValue: any;
        conflictType: 'VERSION_MISMATCH' | 'VALUE_DRIFT';
    }[];
}

export interface ScenarioPromotion {
    promotionId: string;
    scenarioId: string;
    promotedBy: string;
    promotedAt: Date;
    mutationCount: number;
    targetOntologyVersion: string;
}
