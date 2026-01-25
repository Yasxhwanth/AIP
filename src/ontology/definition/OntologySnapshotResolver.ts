/**
 * =============================================================================
 * ONTOLOGY SNAPSHOT RESOLVER
 * =============================================================================
 * 
 * Resolves OntologySnapshot for a given (asOf time + ontology version).
 * This is critical for replay - every query must resolve against the correct
 * ontology version that was active at that time.
 * 
 * INVARIANTS:
 * - Deterministic: same inputs always produce same snapshot
 * - Time-bound: snapshots are resolved "as of" a specific time
 * - Version-aware: respects ontology version history
 * - Tenant-isolated: snapshots are scoped to tenant
 */

import {
    OntologySnapshot,
    OntologyVersionId,
    ObjectTypeDefinition,
    AttributeDefinition,
    RelationshipTypeDefinition,
    ObjectTypeDefinitionId,
    AttributeDefinitionId,
    RelationshipTypeDefinitionId,
    EntityConstraintDefinition,
    MetricDefinition,
    MetricDefinitionId
} from './ontology-definition-types';
import { ontologyDefinitionStore } from './OntologyDefinitionStore';

export class OntologySnapshotResolver {
    private snapshotCache: Map<string, OntologySnapshot> = new Map();

    /**
     * Resolve ontology snapshot for a given version and time.
     * 
     * @param versionId - The ontology version to resolve
     * @param asOf - The time point to resolve "as of"
     * @param tenantId - Tenant isolation
     * @returns Resolved ontology snapshot
     */
    public resolveSnapshot(
        versionId: OntologyVersionId,
        asOf: Date,
        tenantId: string
    ): OntologySnapshot {
        // Check cache
        const cacheKey = `${versionId}|${asOf.toISOString()}|${tenantId}`;
        const cached = this.snapshotCache.get(cacheKey);
        if (cached) {
            return cached;
        }

        // Get version
        const version = ontologyDefinitionStore.getVersion(versionId);
        if (!version || version.tenant_id !== tenantId) {
            throw new Error(`Version ${versionId} not found for tenant ${tenantId}`);
        }

        // Resolve object types (only non-deprecated as of this time)
        const objectTypes = new Map<ObjectTypeDefinitionId, ObjectTypeDefinition>();
        const objectTypesByName = new Map<string, ObjectTypeDefinition>();

        const allObjectTypes = ontologyDefinitionStore.getObjectTypesByVersion(versionId);
        for (const type of allObjectTypes) {
            // Only include if not deprecated at asOf time
            if (!type.deprecated_at || type.deprecated_at > asOf) {
                objectTypes.set(type.id, type);
                objectTypesByName.set(type.name, type);
            }
        }

        // Resolve attributes (only non-deprecated as of this time)
        const attributes = new Map<AttributeDefinitionId, AttributeDefinition>();
        const attributesByObjectType = new Map<ObjectTypeDefinitionId, AttributeDefinition[]>();

        for (const objectType of objectTypes.values()) {
            const typeAttributes = ontologyDefinitionStore.getAttributesByObjectType(objectType.id)
                .filter(attr => !attr.deprecated_at || attr.deprecated_at > asOf);

            for (const attr of typeAttributes) {
                attributes.set(attr.id, attr);
            }

            attributesByObjectType.set(objectType.id, typeAttributes);
        }

        // Resolve relationship types (only non-deprecated as of this time)
        const relationshipTypes = new Map<RelationshipTypeDefinitionId, RelationshipTypeDefinition>();
        const relationshipsByFromType = new Map<ObjectTypeDefinitionId, RelationshipTypeDefinition[]>();
        const relationshipsByToType = new Map<ObjectTypeDefinitionId, RelationshipTypeDefinition[]>();

        const allRelationshipTypes = ontologyDefinitionStore.getRelationshipTypesByVersion(versionId);
        for (const relType of allRelationshipTypes) {
            // Only include if not deprecated at asOf time
            if (!relType.deprecated_at || relType.deprecated_at > asOf) {
                relationshipTypes.set(relType.id, relType);

                // Index by from type
                const fromRels = relationshipsByFromType.get(relType.from_type_id) || [];
                fromRels.push(relType);
                relationshipsByFromType.set(relType.from_type_id, fromRels);

                // Index by to type
                const toRels = relationshipsByToType.get(relType.to_type_id) || [];
                toRels.push(relType);
                relationshipsByToType.set(relType.to_type_id, toRels);
            }
        }

        // Resolve constraints
        const constraintsByObjectType = new Map<ObjectTypeDefinitionId, EntityConstraintDefinition[]>();
        for (const objectType of objectTypes.values()) {
            const typeConstraints = ontologyDefinitionStore.getConstraintsByObjectType(objectType.id);
            constraintsByObjectType.set(objectType.id, typeConstraints);
        }

        // Resolve metrics
        const metricDefinitions = new Map<MetricDefinitionId, MetricDefinition>();
        const allMetrics = ontologyDefinitionStore.getMetricDefinitionsByVersion(versionId);
        for (const metric of allMetrics) {
            if (!metric.deprecated_at || metric.deprecated_at > asOf) {
                metricDefinitions.set(metric.id, metric);
            }
        }

        const snapshot: OntologySnapshot = {
            ontology_version_id: versionId,
            as_of: asOf,
            resolved_at: new Date(),
            object_types: objectTypes,
            attributes: attributes,
            relationship_types: relationshipTypes,
            metric_definitions: metricDefinitions,
            object_types_by_name: objectTypesByName,
            attributes_by_object_type: attributesByObjectType,
            relationships_by_from_type: relationshipsByFromType,
            relationships_by_to_type: relationshipsByToType,
            constraints_by_object_type: constraintsByObjectType
        };

        // Cache snapshot (with size limit)
        if (this.snapshotCache.size > 1000) {
            // Clear oldest 50% of cache
            const entries = Array.from(this.snapshotCache.entries());
            entries.sort((a, b) => a[1].resolved_at.getTime() - b[1].resolved_at.getTime());
            const toRemove = entries.slice(0, Math.floor(entries.length / 2));
            toRemove.forEach(([key]) => this.snapshotCache.delete(key));
        }
        this.snapshotCache.set(cacheKey, snapshot);

        return snapshot;
    }

    /**
     * Resolve snapshot for active version at a given time.
     * This is the most common use case - querying current ontology.
     */
    public resolveActiveSnapshot(
        asOf: Date,
        tenantId: string
    ): OntologySnapshot {
        const activeVersion = ontologyDefinitionStore.getActiveVersion(tenantId);
        if (!activeVersion) {
            throw new Error(`No active ontology version for tenant ${tenantId}`);
        }

        return this.resolveSnapshot(activeVersion.id, asOf, tenantId);
    }

    /**
     * Clear cache (useful for testing or when definitions change)
     */
    public clearCache(): void {
        this.snapshotCache.clear();
    }
}

export const ontologySnapshotResolver = new OntologySnapshotResolver();
