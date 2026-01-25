/**
 * =============================================================================
 * PERSISTENCE ADAPTER
 * Phase 14: Backend Persistence Layer
 * =============================================================================
 * 
 * Abstract interface for persistence operations.
 * In-memory implementation for development, Postgres/Cockroach for production.
 */

import { Entity, EntityVersion, AttributeValue, Relationship, RelationshipVersion } from '../ontology/types';
import { OntologyVersion, ObjectTypeDefinition, AttributeDefinition, RelationshipTypeDefinition, MetricDefinition } from '../ontology/definition/ontology-definition-types';
import { WorkflowDefinition, WorkflowVersion } from '../ontology/workflow-types';

export interface PersistenceAdapter {
    // Entity Operations
    saveEntity(entity: Entity): Promise<void>;
    saveEntityVersion(version: EntityVersion, attributes: AttributeValue[]): Promise<void>;
    getEntity(id: string): Promise<Entity | null>;
    getEntityVersions(entityId: string): Promise<EntityVersion[]>;
    getEntitySnapshot(entityId: string, asOf: Date, tenantId: string): Promise<any | null>;
    
    // Relationship Operations
    saveRelationship(relationship: Relationship): Promise<void>;
    saveRelationshipVersion(version: RelationshipVersion): Promise<void>;
    getRelationship(id: string): Promise<Relationship | null>;
    getRelationshipVersions(relationshipId: string): Promise<RelationshipVersion[]>;
    
    // Ontology Definition Operations
    saveOntologyVersion(version: OntologyVersion): Promise<void>;
    saveObjectType(objectType: ObjectTypeDefinition): Promise<void>;
    saveAttribute(attribute: AttributeDefinition): Promise<void>;
    saveRelationshipType(relationshipType: RelationshipTypeDefinition): Promise<void>;
    saveMetricDefinition(metric: MetricDefinition): Promise<void>;
    
    getOntologyVersion(id: string): Promise<OntologyVersion | null>;
    getActiveOntologyVersion(tenantId: string): Promise<OntologyVersion | null>;
    
    // Workflow Operations
    saveWorkflowDefinition(workflow: WorkflowDefinition): Promise<void>;
    saveWorkflowVersion(version: WorkflowVersion): Promise<void>;
    getWorkflowDefinition(id: string): Promise<WorkflowDefinition | null>;
    
    // Query Operations
    queryEntities(tenantId: string, typeId: string, filters: any, asOf: Date): Promise<any[]>;
    
    // Transaction Support
    beginTransaction(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
}
