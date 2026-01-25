/**
 * =============================================================================
 * IN-MEMORY PERSISTENCE ADAPTER
 * =============================================================================
 * 
 * Temporary in-memory implementation for development.
 * All data lost on restart.
 */

import { PersistenceAdapter } from './PersistenceAdapter';
import { Entity, EntityVersion, AttributeValue, Relationship, RelationshipVersion } from '../ontology/types';
import { OntologyVersion, ObjectTypeDefinition, AttributeDefinition, RelationshipTypeDefinition, MetricDefinition } from '../ontology/definition/ontology-definition-types';
import { WorkflowDefinition, WorkflowVersion } from '../ontology/workflow-types';

export class InMemoryPersistence implements PersistenceAdapter {
    private entities = new Map<string, Entity>();
    private entityVersions = new Map<string, EntityVersion[]>();
    private relationships = new Map<string, Relationship>();
    private relationshipVersions = new Map<string, RelationshipVersion[]>();
    private ontologyVersions = new Map<string, OntologyVersion>();
    private objectTypes = new Map<string, ObjectTypeDefinition>();
    private attributes = new Map<string, AttributeDefinition>();
    private relationshipTypes = new Map<string, RelationshipTypeDefinition>();
    private metricDefinitions = new Map<string, MetricDefinition>();
    private workflowDefinitions = new Map<string, WorkflowDefinition>();
    private workflowVersions = new Map<string, WorkflowVersion>();
    private activeVersionsByTenant = new Map<string, string>();

    async saveEntity(entity: Entity): Promise<void> {
        this.entities.set(entity.id, entity);
    }

    async saveEntityVersion(version: EntityVersion, attributes: AttributeValue[]): Promise<void> {
        const versions = this.entityVersions.get(version.entity_id) || [];
        versions.push(version);
        this.entityVersions.set(version.entity_id, versions);
    }

    async getEntity(id: string): Promise<Entity | null> {
        return this.entities.get(id) || null;
    }

    async getEntityVersions(entityId: string): Promise<EntityVersion[]> {
        return this.entityVersions.get(entityId) || [];
    }

    async getEntitySnapshot(entityId: string, asOf: Date, tenantId: string): Promise<any | null> {
        const entity = this.entities.get(entityId);
        if (!entity || entity.tenant_id !== tenantId) return null;
        
        const versions = this.entityVersions.get(entityId) || [];
        const version = versions.find(v => v.valid_from <= asOf && (!v.valid_to || v.valid_to > asOf));
        
        return version ? { ...entity, _version: version } : null;
    }

    async saveRelationship(relationship: Relationship): Promise<void> {
        this.relationships.set(relationship.id, relationship);
    }

    async saveRelationshipVersion(version: RelationshipVersion): Promise<void> {
        const versions = this.relationshipVersions.get(version.relationship_id) || [];
        versions.push(version);
        this.relationshipVersions.set(version.relationship_id, versions);
    }

    async getRelationship(id: string): Promise<Relationship | null> {
        return this.relationships.get(id) || null;
    }

    async getRelationshipVersions(relationshipId: string): Promise<RelationshipVersion[]> {
        return this.relationshipVersions.get(relationshipId) || [];
    }

    async saveOntologyVersion(version: OntologyVersion): Promise<void> {
        this.ontologyVersions.set(version.id, version);
        if (version.is_active) {
            this.activeVersionsByTenant.set(version.tenant_id, version.id);
        }
    }

    async saveObjectType(objectType: ObjectTypeDefinition): Promise<void> {
        this.objectTypes.set(objectType.id, objectType);
    }

    async saveAttribute(attribute: AttributeDefinition): Promise<void> {
        this.attributes.set(attribute.id, attribute);
    }

    async saveRelationshipType(relationshipType: RelationshipTypeDefinition): Promise<void> {
        this.relationshipTypes.set(relationshipType.id, relationshipType);
    }

    async saveMetricDefinition(metric: MetricDefinition): Promise<void> {
        this.metricDefinitions.set(metric.id, metric);
    }

    async getOntologyVersion(id: string): Promise<OntologyVersion | null> {
        return this.ontologyVersions.get(id) || null;
    }

    async getActiveOntologyVersion(tenantId: string): Promise<OntologyVersion | null> {
        const activeId = this.activeVersionsByTenant.get(tenantId);
        return activeId ? this.ontologyVersions.get(activeId) || null : null;
    }

    async saveWorkflowDefinition(workflow: WorkflowDefinition): Promise<void> {
        this.workflowDefinitions.set(workflow.id, workflow);
    }

    async saveWorkflowVersion(version: WorkflowVersion): Promise<void> {
        this.workflowVersions.set(version.id, version);
    }

    async getWorkflowDefinition(id: string): Promise<WorkflowDefinition | null> {
        return this.workflowDefinitions.get(id) || null;
    }

    async queryEntities(tenantId: string, typeId: string, filters: any, asOf: Date): Promise<any[]> {
        return Array.from(this.entities.values())
            .filter(e => e.tenant_id === tenantId && e.entity_type_id === typeId)
            .map(e => {
                const versions = this.entityVersions.get(e.id) || [];
                const version = versions.find(v => v.valid_from <= asOf && (!v.valid_to || v.valid_to > asOf));
                return version ? { ...e, _version: version } : null;
            })
            .filter(e => e !== null);
    }

    async beginTransaction(): Promise<void> {
        // No-op for in-memory
    }

    async commit(): Promise<void> {
        // No-op for in-memory
    }

    async rollback(): Promise<void> {
        // No-op for in-memory
    }

    // Utility: Clear all data (for testing)
    clear(): void {
        this.entities.clear();
        this.entityVersions.clear();
        this.relationships.clear();
        this.relationshipVersions.clear();
        this.ontologyVersions.clear();
        this.objectTypes.clear();
        this.attributes.clear();
        this.relationshipTypes.clear();
        this.metricDefinitions.clear();
        this.workflowDefinitions.clear();
        this.workflowVersions.clear();
        this.activeVersionsByTenant.clear();
    }
}

export const inMemoryPersistence = new InMemoryPersistence();
