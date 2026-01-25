/**
 * =============================================================================
 * ONTOLOGY DEFINITION STORE
 * =============================================================================
 * 
 * Central store for all ontology definitions.
 * Manages ObjectTypeDefinition, AttributeDefinition, RelationshipTypeDefinition,
 * and OntologyVersion.
 * 
 * INVARIANTS:
 * - Definitions are immutable once created
 * - All definitions are versioned
 * - All definitions are tenant-isolated
 * - Only one active version per tenant
 */

import {
    OntologyVersion,
    OntologyVersionId,
    ObjectTypeDefinition,
    ObjectTypeDefinitionId,
    AttributeDefinition,
    AttributeDefinitionId,
    RelationshipTypeDefinition,
    RelationshipTypeDefinitionId,
    MetricDefinition,
    MetricDefinitionId,
    OntologyVersionStatus,
    EntityConstraintDefinition,
    ConstraintType
} from './ontology-definition-types';
import { eventBus } from '../EventBus';
import { DomainEventType } from '../event-types';

export class OntologyDefinitionStore {
    // Core storage
    private ontologyVersions: Map<string, OntologyVersion> = new Map();
    private objectTypes: Map<string, ObjectTypeDefinition> = new Map();
    private attributes: Map<string, AttributeDefinition> = new Map();
    private relationshipTypes: Map<string, RelationshipTypeDefinition> = new Map();
    private metricDefinitions: Map<string, MetricDefinition> = new Map();
    private entityConstraints: Map<string, EntityConstraintDefinition> = new Map();

    // Indexes
    private activeVersionsByTenant: Map<string, OntologyVersionId> = new Map();
    private objectTypesByVersion: Map<OntologyVersionId, Set<ObjectTypeDefinitionId>> = new Map();
    private attributesByObjectType: Map<ObjectTypeDefinitionId, Set<AttributeDefinitionId>> = new Map();
    private relationshipsByVersion: Map<OntologyVersionId, Set<RelationshipTypeDefinitionId>> = new Map();
    private metricsByVersion: Map<OntologyVersionId, Set<MetricDefinitionId>> = new Map();
    private constraintsByObjectType: Map<ObjectTypeDefinitionId, Set<string>> = new Map();

    // =========================================================================
    // ONTOLOGY VERSION MANAGEMENT
    // =========================================================================

    public createOntologyVersion(
        tenantId: string,
        versionName: string,
        parentVersionId: OntologyVersionId | null,
        createdBy: string | null
    ): OntologyVersion {
        // Get next version number
        const existingVersions = Array.from(this.ontologyVersions.values())
            .filter(v => v.tenant_id === tenantId);
        const versionNumber = existingVersions.length > 0
            ? Math.max(...existingVersions.map(v => v.version_number)) + 1
            : 1;

        const version: OntologyVersion = {
            id: crypto.randomUUID() as OntologyVersionId,
            tenant_id: tenantId,
            version_name: versionName,
            version_number: versionNumber,
            status: OntologyVersionStatus.DRAFT,
            parent_version_id: parentVersionId,
            is_active: false,
            backward_compatible: parentVersionId !== null,
            migration_rules: [],
            object_type_ids: [],
            relationship_type_ids: [],
            metric_definition_ids: [],
            description: null,
            metadata: {},
            created_at: new Date(),
            created_by: createdBy,
            activated_at: null,
            deprecated_at: null
        };

        this.ontologyVersions.set(version.id, version);
        return version;
    }

    public activateVersion(versionId: OntologyVersionId, tenantId: string): void {
        const version = this.ontologyVersions.get(versionId);
        if (!version || version.tenant_id !== tenantId) {
            throw new Error(`Version ${versionId} not found for tenant ${tenantId}`);
        }

        // Deactivate previous active version
        const currentActive = this.activeVersionsByTenant.get(tenantId);
        if (currentActive) {
            const currentVersion = this.ontologyVersions.get(currentActive);
            if (currentVersion) {
                currentVersion.is_active = false;
                currentVersion.status = OntologyVersionStatus.DEPRECATED;
                currentVersion.deprecated_at = new Date();
            }
        }

        // Activate new version
        version.is_active = true;
        version.status = OntologyVersionStatus.ACTIVE;
        version.activated_at = new Date();
        this.activeVersionsByTenant.set(tenantId, versionId);

        // Emit Domain Event
        eventBus.emit({
            eventId: crypto.randomUUID(),
            type: DomainEventType.ONTOLOGY_ACTIVATED,
            occurredAt: new Date(),
            tenantId: tenantId,
            versionId: versionId
        });
    }

    public getActiveVersion(tenantId: string): OntologyVersion | null {
        const activeId = this.activeVersionsByTenant.get(tenantId);
        if (!activeId) return null;
        return this.ontologyVersions.get(activeId) || null;
    }

    public getVersion(versionId: OntologyVersionId): OntologyVersion | null {
        return this.ontologyVersions.get(versionId) || null;
    }

    // =========================================================================
    // OBJECT TYPE DEFINITION MANAGEMENT
    // =========================================================================

    public createObjectType(
        ontologyVersionId: OntologyVersionId,
        name: string,
        displayName: string,
        createdBy: string | null
    ): ObjectTypeDefinition {
        const version = this.ontologyVersions.get(ontologyVersionId);
        if (!version) {
            throw new Error(`Ontology version ${ontologyVersionId} not found`);
        }

        // Check name uniqueness within version
        const existing = Array.from(this.objectTypes.values())
            .find(t => t.ontology_version_id === ontologyVersionId && t.name === name);
        if (existing && !existing.deprecated_at) {
            throw new Error(`Object type ${name} already exists in version ${ontologyVersionId}`);
        }

        const objectType: ObjectTypeDefinition = {
            id: crypto.randomUUID() as ObjectTypeDefinitionId,
            ontology_version_id: ontologyVersionId,
            name,
            display_name: displayName,
            description: null,
            icon: undefined,
            color: undefined,
            attribute_ids: [],
            relationship_type_ids: [],
            is_abstract: false,
            extends_type_id: undefined,
            owner_id: null,
            visibility: 'INTERNAL',
            metadata: {},
            created_at: new Date(),
            created_by: createdBy,
            deprecated_at: null
        };

        this.objectTypes.set(objectType.id, objectType);

        // Update version
        version.object_type_ids.push(objectType.id);

        // Update index
        const typeSet = this.objectTypesByVersion.get(ontologyVersionId) || new Set();
        typeSet.add(objectType.id);
        this.objectTypesByVersion.set(ontologyVersionId, typeSet);

        return objectType;
    }

    public getObjectType(typeId: ObjectTypeDefinitionId): ObjectTypeDefinition | null {
        return this.objectTypes.get(typeId) || null;
    }

    public getObjectTypesByVersion(versionId: OntologyVersionId): ObjectTypeDefinition[] {
        const typeIds = this.objectTypesByVersion.get(versionId) || new Set();
        return Array.from(typeIds)
            .map(id => this.objectTypes.get(id))
            .filter((t): t is ObjectTypeDefinition => t !== undefined && !t.deprecated_at);
    }

    // =========================================================================
    // ATTRIBUTE DEFINITION MANAGEMENT
    // =========================================================================

    public createAttribute(
        ontologyVersionId: OntologyVersionId,
        objectTypeId: ObjectTypeDefinitionId,
        name: string,
        displayName: string,
        dataType: string,
        createdBy: string | null
    ): AttributeDefinition {
        const objectType = this.objectTypes.get(objectTypeId);
        if (!objectType || objectType.ontology_version_id !== ontologyVersionId) {
            throw new Error(`Object type ${objectTypeId} not found in version ${ontologyVersionId}`);
        }

        // Check name uniqueness within object type
        const existing = Array.from(this.attributes.values())
            .find(a => a.object_type_id === objectTypeId && a.name === name);
        if (existing && !existing.deprecated_at) {
            throw new Error(`Attribute ${name} already exists on object type ${objectTypeId}`);
        }

        const attribute: AttributeDefinition = {
            id: crypto.randomUUID() as AttributeDefinitionId,
            ontology_version_id: ontologyVersionId,
            object_type_id: objectTypeId,
            name,
            display_name: displayName,
            description: null,
            data_type: dataType as any,
            is_required: false,
            is_unique: false,
            is_indexed: false,
            is_primary_display: false,
            default_value: null,
            ordinal: objectType.attribute_ids.length,
            metadata: {},
            created_at: new Date(),
            created_by: createdBy,
            deprecated_at: null
        };

        this.attributes.set(attribute.id, attribute);

        // Update object type
        objectType.attribute_ids.push(attribute.id);

        // Update index
        const attrSet = this.attributesByObjectType.get(objectTypeId) || new Set();
        attrSet.add(attribute.id);
        this.attributesByObjectType.set(objectTypeId, attrSet);

        return attribute;
    }

    public getAttribute(attributeId: AttributeDefinitionId): AttributeDefinition | null {
        return this.attributes.get(attributeId) || null;
    }

    public getAttributesByObjectType(objectTypeId: ObjectTypeDefinitionId): AttributeDefinition[] {
        const attrIds = this.attributesByObjectType.get(objectTypeId) || new Set();
        return Array.from(attrIds)
            .map(id => this.attributes.get(id))
            .filter((a): a is AttributeDefinition => a !== undefined && !a.deprecated_at)
            .sort((a, b) => a.ordinal - b.ordinal);
    }

    // =========================================================================
    // RELATIONSHIP TYPE DEFINITION MANAGEMENT
    // =========================================================================

    public createRelationshipType(
        ontologyVersionId: OntologyVersionId,
        name: string,
        displayName: string,
        fromTypeId: ObjectTypeDefinitionId,
        toTypeId: ObjectTypeDefinitionId,
        direction: string,
        cardinality: string,
        createdBy: string | null
    ): RelationshipTypeDefinition {
        const version = this.ontologyVersions.get(ontologyVersionId);
        if (!version) {
            throw new Error(`Ontology version ${ontologyVersionId} not found`);
        }

        // Verify both types exist in this version
        const fromType = this.objectTypes.get(fromTypeId);
        const toType = this.objectTypes.get(toTypeId);
        if (!fromType || !toType ||
            fromType.ontology_version_id !== ontologyVersionId ||
            toType.ontology_version_id !== ontologyVersionId) {
            throw new Error(`Object types must exist in version ${ontologyVersionId}`);
        }

        const relationshipType: RelationshipTypeDefinition = {
            id: crypto.randomUUID() as RelationshipTypeDefinitionId,
            ontology_version_id: ontologyVersionId,
            name,
            display_name: displayName,
            description: null,
            from_type_id: fromTypeId,
            to_type_id: toTypeId,
            direction: direction as any,
            cardinality: cardinality as any,
            is_temporal: false,
            relationship_attribute_ids: [],
            metadata: {},
            created_at: new Date(),
            created_by: createdBy,
            deprecated_at: null
        };

        this.relationshipTypes.set(relationshipType.id, relationshipType);

        // Update version
        version.relationship_type_ids.push(relationshipType.id);

        // Update object types
        fromType.relationship_type_ids.push(relationshipType.id);
        toType.relationship_type_ids.push(relationshipType.id);

        // Update index
        const relSet = this.relationshipsByVersion.get(ontologyVersionId) || new Set();
        relSet.add(relationshipType.id);
        this.relationshipsByVersion.set(ontologyVersionId, relSet);

        return relationshipType;
    }

    public getRelationshipType(relTypeId: RelationshipTypeDefinitionId): RelationshipTypeDefinition | null {
        return this.relationshipTypes.get(relTypeId) || null;
    }

    public getRelationshipTypesByVersion(versionId: OntologyVersionId): RelationshipTypeDefinition[] {
        const relIds = this.relationshipsByVersion.get(versionId) || new Set();
        return Array.from(relIds)
            .map(id => this.relationshipTypes.get(id))
            .filter((r): r is RelationshipTypeDefinition => r !== undefined && !r.deprecated_at);
    }

    // =========================================================================
    // METRIC DEFINITION MANAGEMENT
    // =========================================================================

    public createMetricDefinition(
        ontologyVersionId: OntologyVersionId,
        config: Omit<MetricDefinition, 'id' | 'ontology_version_id' | 'created_at' | 'deprecated_at' | 'metadata'>
    ): MetricDefinition {
        const version = this.ontologyVersions.get(ontologyVersionId);
        if (!version) {
            throw new Error(`Ontology version ${ontologyVersionId} not found`);
        }

        const metric: MetricDefinition = {
            ...config,
            id: crypto.randomUUID() as MetricDefinitionId,
            ontology_version_id: ontologyVersionId,
            metadata: {},
            created_at: new Date(),
            deprecated_at: null
        };

        this.metricDefinitions.set(metric.id, metric);

        // Update version
        version.metric_definition_ids.push(metric.id);

        // Update index
        const metricSet = this.metricsByVersion.get(ontologyVersionId) || new Set();
        metricSet.add(metric.id);
        this.metricsByVersion.set(ontologyVersionId, metricSet);

        return metric;
    }

    public getMetricDefinitionsByVersion(versionId: OntologyVersionId): MetricDefinition[] {
        const metricIds = this.metricsByVersion.get(versionId) || new Set();
        return Array.from(metricIds)
            .map(id => this.metricDefinitions.get(id))
            .filter((m): m is MetricDefinition => m !== undefined && !m.deprecated_at);
    }

    // =========================================================================
    // ENTITY CONSTRAINT MANAGEMENT
    // =========================================================================

    public createEntityConstraint(
        ontologyVersionId: OntologyVersionId,
        objectTypeId: ObjectTypeDefinitionId,
        name: string,
        displayName: string,
        constraintType: ConstraintType,
        configuration: Record<string, unknown>,
        errorMessage: string | null
    ): EntityConstraintDefinition {
        const objectType = this.objectTypes.get(objectTypeId);
        if (!objectType || objectType.ontology_version_id !== ontologyVersionId) {
            throw new Error(`Object type ${objectTypeId} not found in version ${ontologyVersionId}`);
        }

        const constraint: EntityConstraintDefinition = {
            id: crypto.randomUUID(),
            ontology_version_id: ontologyVersionId,
            object_type_id: objectTypeId,
            name,
            display_name: displayName,
            constraint_type: constraintType,
            configuration,
            error_message: errorMessage,
            ordinal: (this.constraintsByObjectType.get(objectTypeId)?.size || 0)
        };

        this.entityConstraints.set(constraint.id, constraint);

        // Update index
        const constraintSet = this.constraintsByObjectType.get(objectTypeId) || new Set();
        constraintSet.add(constraint.id);
        this.constraintsByObjectType.set(objectTypeId, constraintSet);

        return constraint;
    }

    public getConstraintsByObjectType(objectTypeId: ObjectTypeDefinitionId): EntityConstraintDefinition[] {
        const constraintIds = this.constraintsByObjectType.get(objectTypeId) || new Set();
        return Array.from(constraintIds)
            .map(id => this.entityConstraints.get(id))
            .filter((c): c is EntityConstraintDefinition => c !== undefined)
            .sort((a, b) => a.ordinal - b.ordinal);
    }
}

export const ontologyDefinitionStore = new OntologyDefinitionStore();

