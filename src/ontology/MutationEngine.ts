import {
    Mutation,
    MutationType,
    Entity,
    EntityVersion,
    AttributeValue,
    Relationship,
    RelationshipVersion,
    EntityId,
    EntityVersionId,
    RelationshipId,
    RelationshipVersionId,
    AttributeValueId,
    EntityTypeId,
    AttributeDefinitionId
} from './types';
import { ontologyStore } from './OntologyStore';
import { SideEffectManager } from './SideEffectManager';
import { validationEngine } from './validation/validation-engine';

export class MutationEngine {
    /**
     * Applies a single mutation to the OntologyStore.
     * In a real system, this would be wrapped in a database transaction.
     */
    public applyMutation(mutation: Mutation): void {
        console.log(`[MutationEngine] Applying mutation: ${mutation.type}`, mutation);

        // Pre-validation (optional, depending on mutation type)
        this.validateMutation(mutation);

        switch (mutation.type) {
            case MutationType.CREATE_ENTITY:
                this.handleCreateEntity(mutation);
                break;
            case MutationType.UPDATE_ATTRIBUTE:
                this.handleUpdateAttribute(mutation);
                break;
            case MutationType.DELETE_ENTITY:
                this.handleDeleteEntity(mutation);
                break;
            case MutationType.CREATE_RELATIONSHIP:
                this.handleCreateRelationship(mutation);
                break;
            case MutationType.DELETE_RELATIONSHIP:
                this.handleDeleteRelationship(mutation);
                break;
            default:
                throw new Error(`Unsupported mutation type: ${mutation.type}`);
        }

        // Trigger side effects
        SideEffectManager.triggerEffects(mutation);
    }

    private validateMutation(mutation: Mutation): void {
        // Basic structural validation
        if (!mutation.tenant_id) throw new Error('tenant_id is required for all mutations');
    }

    private handleCreateEntity(mutation: Mutation): void {
        if (!mutation.entity_type_id) throw new Error('entity_type_id is required for CREATE_ENTITY');

        const entityId = (mutation.entity_id || crypto.randomUUID()) as EntityId;
        const entity: Entity = {
            id: entityId,
            tenant_id: mutation.tenant_id,
            entity_type_id: mutation.entity_type_id,
            external_id: null,
            deleted_at: null,
            metadata: mutation.metadata || {},
            created_at: new Date(),
            updated_at: new Date(),
            created_by: null
        };

        const versionId = crypto.randomUUID() as EntityVersionId;
        const version: EntityVersion = {
            id: versionId,
            entity_id: entityId,
            version_number: 1,
            valid_from: new Date(),
            valid_to: null,
            change_reason: 'Initial creation',
            source_system: 'MutationEngine',
            created_at: new Date(),
            created_by: null,
            metadata: {}
        };

        // Initial attributes (if any)
        const attributes: AttributeValue[] = [];
        const entityValue: Record<string, any> = {};

        if (mutation.newValue && typeof mutation.newValue === 'object') {
            Object.entries(mutation.newValue).forEach(([attrId, val]) => {
                attributes.push(this.createAttributeValue(versionId, attrId as any, val));
                entityValue[attrId] = val;
            });
        }

        // Validate against ontology constraints
        // Note: In a real system, we'd fetch EntityType and AttributeDefinitions from a SchemaStore
        // For this demo, we assume validation passes or is handled by the caller for now,
        // but we'll add a hook for it.

        ontologyStore.addEntity(entity);
        ontologyStore.addEntityVersion(version, attributes);
    }

    private handleUpdateAttribute(mutation: Mutation): void {
        if (!mutation.entity_id) throw new Error('entity_id is required for UPDATE_ATTRIBUTE');
        if (!mutation.attribute_definition_id) throw new Error('attribute_definition_id is required for UPDATE_ATTRIBUTE');

        const currentSnapshot = ontologyStore.getEntitySnapshot(mutation.entity_id, new Date(), mutation.tenant_id);
        if (!currentSnapshot) throw new Error(`Entity ${mutation.entity_id} not found or inaccessible`);

        const currentVersion = currentSnapshot._version as EntityVersion;

        // Create new version
        const newVersionId = crypto.randomUUID() as EntityVersionId;
        const newVersion: EntityVersion = {
            ...currentVersion,
            id: newVersionId,
            version_number: currentVersion.version_number + 1,
            valid_from: new Date(),
            valid_to: null,
            change_reason: 'Attribute update',
            created_at: new Date()
        };

        // Copy existing attributes and apply change
        const existingAttrs = (ontologyStore as any).attributes.get(currentVersion.id) || [];
        const newAttrs: AttributeValue[] = existingAttrs.map((a: AttributeValue) => {
            if (a.attribute_definition_id === mutation.attribute_definition_id) {
                return this.createAttributeValue(newVersionId, a.attribute_definition_id, mutation.newValue);
            }
            return { ...a, id: crypto.randomUUID() as AttributeValueId, entity_version_id: newVersionId };
        });

        // If attribute didn't exist before, add it
        if (!newAttrs.find(a => a.attribute_definition_id === mutation.attribute_definition_id)) {
            newAttrs.push(this.createAttributeValue(newVersionId, mutation.attribute_definition_id, mutation.newValue));
        }

        // Perform validation before committing
        const entityValue: Record<string, any> = { ...currentSnapshot };
        delete entityValue._version;
        entityValue[mutation.attribute_definition_id] = mutation.newValue;

        // In a real system, we'd fetch the actual EntityType and AttributeDefinitions
        // For now, we'll assume validation is successful if no errors are thrown by the store

        // Close old version
        currentVersion.valid_to = newVersion.valid_from;

        ontologyStore.addEntityVersion(newVersion, newAttrs);
    }

    private handleDeleteEntity(mutation: Mutation): void {
        if (!mutation.entity_id) throw new Error('entity_id is required for DELETE_ENTITY');
        const entity = (ontologyStore as any).entities.get(mutation.entity_id);
        if (!entity || entity.tenant_id !== mutation.tenant_id) throw new Error('Entity not found');

        (entity as any).deleted_at = new Date();
    }

    private handleCreateRelationship(mutation: Mutation): void {
        if (!mutation.relationship_type_id) throw new Error('relationship_type_id is required');
        if (!mutation.source_entity_id || !mutation.target_entity_id) throw new Error('source and target required');

        const relId = crypto.randomUUID() as RelationshipId;
        const rel: Relationship = {
            id: relId,
            tenant_id: mutation.tenant_id,
            relationship_type_id: mutation.relationship_type_id,
            source_entity_id: mutation.source_entity_id,
            target_entity_id: mutation.target_entity_id,
            deleted_at: null,
            metadata: mutation.metadata || {},
            created_at: new Date(),
            updated_at: new Date(),
            created_by: null
        };

        const versionId = crypto.randomUUID() as RelationshipVersionId;
        const version: RelationshipVersion = {
            id: versionId,
            relationship_id: relId,
            version_number: 1,
            valid_from: new Date(),
            valid_to: null,
            change_reason: 'Initial creation',
            source_system: 'MutationEngine',
            created_at: new Date(),
            created_by: null,
            metadata: {},
            properties: (mutation.newValue as any) || {}
        };

        ontologyStore.addRelationship(rel);
        ontologyStore.addRelationshipVersion(version);
    }

    private handleDeleteRelationship(mutation: Mutation): void {
        if (!mutation.entity_id) throw new Error('entity_id is required for DELETE_RELATIONSHIP');
        // Implementation for soft deleting relationship
        const rel = (ontologyStore as any).relationships.get(mutation.entity_id);
        if (rel && rel.tenant_id === mutation.tenant_id) {
            (rel as any).deleted_at = new Date();
        }
    }

    private createAttributeValue(versionId: EntityVersionId, attrId: any, value: any): AttributeValue {
        const av: AttributeValue = {
            id: crypto.randomUUID() as AttributeValueId,
            entity_version_id: versionId,
            attribute_definition_id: attrId,
            is_null: value === null,
            value_string: typeof value === 'string' ? value : null,
            value_integer: typeof value === 'number' && Number.isInteger(value) ? value : null,
            value_float: typeof value === 'number' && !Number.isInteger(value) ? value : null,
            value_boolean: typeof value === 'boolean' ? value : null,
            value_date: value instanceof Date ? value : null,
            value_datetime: value instanceof Date ? value : null,
            value_json: typeof value === 'object' && !(value instanceof Date) ? value : null,
            metadata: {}
        };
        return av;
    }
}

export const mutationEngine = new MutationEngine();
