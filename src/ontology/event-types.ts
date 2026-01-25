import { EntityId, EntityVersionId, RelationshipId, RelationshipVersionId } from './types';
import { OntologyVersionId } from './definition/ontology-definition-types';

/**
 * =============================================================================
 * DOMAIN EVENT MODEL
 * =============================================================================
 * 
 * The system nervous system. Allows decoupled communication between engines.
 */

export enum DomainEventType {
    ONTOLOGY_ACTIVATED = 'ONTOLOGY_ACTIVATED',
    TRUTH_MATERIALIZED = 'TRUTH_MATERIALIZED',
    RELATIONSHIP_MATERIALIZED = 'RELATIONSHIP_MATERIALIZED',
    DECISION_TAKEN = 'DECISION_TAKEN',
    ADMISSION_CASE_CREATED = 'ADMISSION_CASE_CREATED',
    EXECUTION_COMPLETED = 'EXECUTION_COMPLETED'
}

export interface BaseDomainEvent {
    eventId: string;
    occurredAt: Date;
    tenantId: string;
    actorId?: string;
}

export interface OntologyActivatedEvent extends BaseDomainEvent {
    type: DomainEventType.ONTOLOGY_ACTIVATED;
    versionId: OntologyVersionId;
}

export interface TruthMaterializedEvent extends BaseDomainEvent {
    type: DomainEventType.TRUTH_MATERIALIZED;
    entityId: EntityId;
    versionId: EntityVersionId;
}

export interface RelationshipMaterializedEvent extends BaseDomainEvent {
    type: DomainEventType.RELATIONSHIP_MATERIALIZED;
    relationshipId: RelationshipId;
    versionId: RelationshipVersionId;
}

export interface DecisionTakenEvent extends BaseDomainEvent {
    type: DomainEventType.DECISION_TAKEN;
    decisionId: string;
}

export interface AdmissionCaseCreatedEvent extends BaseDomainEvent {
    type: DomainEventType.ADMISSION_CASE_CREATED;
    caseId: string;
    caseType: 'ENTITY' | 'RELATIONSHIP';
}

export type DomainEvent = 
    | OntologyActivatedEvent 
    | TruthMaterializedEvent 
    | RelationshipMaterializedEvent 
    | DecisionTakenEvent 
    | AdmissionCaseCreatedEvent;

export type EventHandler<T extends DomainEvent> = (event: T) => void | Promise<void>;
