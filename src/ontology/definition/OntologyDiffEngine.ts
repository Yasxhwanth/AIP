/**
 * =============================================================================
 * ONTOLOGY DIFF ENGINE
 * =============================================================================
 * 
 * Compares two ontology versions and detects structural changes.
 * 
 * INVARIANTS:
 * - Diff is purely structural (no runtime execution)
 * - Diff is deterministic (same versions → same diff)
 * - No business logic assumptions
 */

import {
    OntologyVersionId,
    ObjectTypeDefinition,
    AttributeDefinition,
    RelationshipTypeDefinition,
    MetricDefinition,
    OntologySnapshot
} from './ontology-definition-types';
import { ontologySnapshotResolver } from './OntologySnapshotResolver';

export interface OntologyDiff {
    from_version_id: OntologyVersionId;
    to_version_id: OntologyVersionId;
    computed_at: Date;

    object_types: {
        added: ObjectTypeDefinition[];
        removed: ObjectTypeDefinition[];
        modified: ObjectTypeModification[];
    };

    attributes: {
        added: AttributeDefinition[];
        removed: AttributeDefinition[];
        modified: AttributeModification[];
    };

    relationships: {
        added: RelationshipTypeDefinition[];
        removed: RelationshipTypeDefinition[];
        modified: RelationshipModification[];
    };

    metrics: {
        added: MetricDefinition[];
        removed: MetricDefinition[];
        modified: MetricModification[];
    };
}

export interface ObjectTypeModification {
    object_type_id: string;
    name: string;
    changes: FieldChange[];
}

export interface AttributeModification {
    attribute_id: string;
    name: string;
    object_type_id: string;
    changes: FieldChange[];
}

export interface RelationshipModification {
    relationship_id: string;
    name: string;
    changes: FieldChange[];
}

export interface MetricModification {
    metric_id: string;
    name: string;
    changes: FieldChange[];
}

export interface FieldChange {
    field_name: string;
    old_value: unknown;
    new_value: unknown;
    change_type: 'MODIFIED' | 'ADDED' | 'REMOVED';
}

export class OntologyDiffEngine {
    /**
     * Compute diff between two ontology versions.
     */
    public computeDiff(
        fromVersionId: OntologyVersionId,
        toVersionId: OntologyVersionId,
        asOf: Date,
        tenantId: string
    ): OntologyDiff {
        // Resolve snapshots
        const fromSnapshot = ontologySnapshotResolver.resolveSnapshot(fromVersionId, asOf, tenantId);
        const toSnapshot = ontologySnapshotResolver.resolveSnapshot(toVersionId, asOf, tenantId);

        // Compute diffs for each element type
        const objectTypesDiff = this.diffObjectTypes(fromSnapshot, toSnapshot);
        const attributesDiff = this.diffAttributes(fromSnapshot, toSnapshot);
        const relationshipsDiff = this.diffRelationships(fromSnapshot, toSnapshot);
        const metricsDiff = this.diffMetrics(fromSnapshot, toSnapshot);

        return {
            from_version_id: fromVersionId,
            to_version_id: toVersionId,
            computed_at: new Date(),
            object_types: objectTypesDiff,
            attributes: attributesDiff,
            relationships: relationshipsDiff,
            metrics: metricsDiff
        };
    }

    /**
     * Diff object types between two snapshots.
     */
    private diffObjectTypes(from: OntologySnapshot, to: OntologySnapshot) {
        const added: ObjectTypeDefinition[] = [];
        const removed: ObjectTypeDefinition[] = [];
        const modified: ObjectTypeModification[] = [];

        const fromIds = new Set(from.object_types.keys());
        const toIds = new Set(to.object_types.keys());

        // Added
        for (const id of toIds) {
            if (!fromIds.has(id)) {
                added.push(to.object_types.get(id)!);
            }
        }

        // Removed
        for (const id of fromIds) {
            if (!toIds.has(id)) {
                removed.push(from.object_types.get(id)!);
            }
        }

        // Modified
        for (const id of fromIds) {
            if (toIds.has(id)) {
                const fromObj = from.object_types.get(id)!;
                const toObj = to.object_types.get(id)!;
                const changes = this.compareObjectTypes(fromObj, toObj);
                if (changes.length > 0) {
                    modified.push({
                        object_type_id: id,
                        name: fromObj.name,
                        changes: changes
                    });
                }
            }
        }

        return { added, removed, modified };
    }

    /**
     * Diff attributes between two snapshots.
     */
    private diffAttributes(from: OntologySnapshot, to: OntologySnapshot) {
        const added: AttributeDefinition[] = [];
        const removed: AttributeDefinition[] = [];
        const modified: AttributeModification[] = [];

        const fromAttrs = this.flattenAttributes(from);
        const toAttrs = this.flattenAttributes(to);

        const fromIds = new Set(fromAttrs.keys());
        const toIds = new Set(toAttrs.keys());

        // Added
        for (const id of toIds) {
            if (!fromIds.has(id)) {
                added.push(toAttrs.get(id)!);
            }
        }

        // Removed
        for (const id of fromIds) {
            if (!toIds.has(id)) {
                removed.push(fromAttrs.get(id)!);
            }
        }

        // Modified
        for (const id of fromIds) {
            if (toIds.has(id)) {
                const fromAttr = fromAttrs.get(id)!;
                const toAttr = toAttrs.get(id)!;
                const changes = this.compareAttributes(fromAttr, toAttr);
                if (changes.length > 0) {
                    modified.push({
                        attribute_id: id,
                        name: fromAttr.name,
                        object_type_id: fromAttr.object_type_id,
                        changes: changes
                    });
                }
            }
        }

        return { added, removed, modified };
    }

    /**
     * Diff relationships between two snapshots.
     */
    private diffRelationships(from: OntologySnapshot, to: OntologySnapshot) {
        const added: RelationshipTypeDefinition[] = [];
        const removed: RelationshipTypeDefinition[] = [];
        const modified: RelationshipModification[] = [];

        const fromIds = new Set(from.relationship_types.keys());
        const toIds = new Set(to.relationship_types.keys());

        // Added
        for (const id of toIds) {
            if (!fromIds.has(id)) {
                added.push(to.relationship_types.get(id)!);
            }
        }

        // Removed
        for (const id of fromIds) {
            if (!toIds.has(id)) {
                removed.push(from.relationship_types.get(id)!);
            }
        }

        // Modified
        for (const id of fromIds) {
            if (toIds.has(id)) {
                const fromRel = from.relationship_types.get(id)!;
                const toRel = to.relationship_types.get(id)!;
                const changes = this.compareRelationships(fromRel, toRel);
                if (changes.length > 0) {
                    modified.push({
                        relationship_id: id,
                        name: fromRel.name,
                        changes: changes
                    });
                }
            }
        }

        return { added, removed, modified };
    }

    /**
     * Diff metrics between two snapshots.
     */
    private diffMetrics(from: OntologySnapshot, to: OntologySnapshot) {
        const added: MetricDefinition[] = [];
        const removed: MetricDefinition[] = [];
        const modified: MetricModification[] = [];

        const fromIds = new Set(from.metric_definitions.keys());
        const toIds = new Set(to.metric_definitions.keys());

        // Added
        for (const id of toIds) {
            if (!fromIds.has(id)) {
                added.push(to.metric_definitions.get(id)!);
            }
        }

        // Removed
        for (const id of fromIds) {
            if (!toIds.has(id)) {
                removed.push(from.metric_definitions.get(id)!);
            }
        }

        // Modified
        for (const id of fromIds) {
            if (toIds.has(id)) {
                const fromMetric = from.metric_definitions.get(id)!;
                const toMetric = to.metric_definitions.get(id)!;
                const changes = this.compareMetrics(fromMetric, toMetric);
                if (changes.length > 0) {
                    modified.push({
                        metric_id: id,
                        name: fromMetric.name,
                        changes: changes
                    });
                }
            }
        }

        return { added, removed, modified };
    }

    /**
     * Compare two object types and detect field changes.
     */
    private compareObjectTypes(from: ObjectTypeDefinition, to: ObjectTypeDefinition): FieldChange[] {
        const changes: FieldChange[] = [];

        if (from.display_name !== to.display_name) {
            changes.push({
                field_name: 'display_name',
                old_value: from.display_name,
                new_value: to.display_name,
                change_type: 'MODIFIED'
            });
        }

        if (from.description !== to.description) {
            changes.push({
                field_name: 'description',
                old_value: from.description,
                new_value: to.description,
                change_type: 'MODIFIED'
            });
        }

        if (from.icon !== to.icon) {
            changes.push({
                field_name: 'icon',
                old_value: from.icon,
                new_value: to.icon,
                change_type: 'MODIFIED'
            });
        }

        return changes;
    }

    /**
     * Compare two attributes and detect field changes.
     */
    private compareAttributes(from: AttributeDefinition, to: AttributeDefinition): FieldChange[] {
        const changes: FieldChange[] = [];

        if (from.data_type !== to.data_type) {
            changes.push({
                field_name: 'data_type',
                old_value: from.data_type,
                new_value: to.data_type,
                change_type: 'MODIFIED'
            });
        }

        if (from.is_required !== to.is_required) {
            changes.push({
                field_name: 'is_required',
                old_value: from.is_required,
                new_value: to.is_required,
                change_type: 'MODIFIED'
            });
        }

        if (from.is_unique !== to.is_unique) {
            changes.push({
                field_name: 'is_unique',
                old_value: from.is_unique,
                new_value: to.is_unique,
                change_type: 'MODIFIED'
            });
        }

        return changes;
    }

    /**
     * Compare two relationships and detect field changes.
     */
    private compareRelationships(from: RelationshipTypeDefinition, to: RelationshipTypeDefinition): FieldChange[] {
        const changes: FieldChange[] = [];

        if (from.cardinality !== to.cardinality) {
            changes.push({
                field_name: 'cardinality',
                old_value: from.cardinality,
                new_value: to.cardinality,
                change_type: 'MODIFIED'
            });
        }

        if (from.from_type_id !== to.from_type_id) {
            changes.push({
                field_name: 'from_type_id',
                old_value: from.from_type_id,
                new_value: to.from_type_id,
                change_type: 'MODIFIED'
            });
        }

        if (from.to_type_id !== to.to_type_id) {
            changes.push({
                field_name: 'to_type_id',
                old_value: from.to_type_id,
                new_value: to.to_type_id,
                change_type: 'MODIFIED'
            });
        }

        return changes;
    }

    /**
     * Compare two metrics and detect field changes.
     */
    private compareMetrics(from: MetricDefinition, to: MetricDefinition): FieldChange[] {
        const changes: FieldChange[] = [];

        if (from.aggregation_type !== to.aggregation_type) {
            changes.push({
                field_name: 'aggregation_type',
                old_value: from.aggregation_type,
                new_value: to.aggregation_type,
                change_type: 'MODIFIED'
            });
        }

        if (from.target_object_type_id !== to.target_object_type_id) {
            changes.push({
                field_name: 'target_object_type_id',
                old_value: from.target_object_type_id,
                new_value: to.target_object_type_id,
                change_type: 'MODIFIED'
            });
        }

        return changes;
    }

    /**
     * Flatten attributes from snapshot into a single map.
     */
    private flattenAttributes(snapshot: OntologySnapshot): Map<string, AttributeDefinition> {
        const map = new Map<string, AttributeDefinition>();
        for (const attrs of snapshot.attributes_by_object_type.values()) {
            for (const attr of attrs) {
                map.set(attr.id, attr);
            }
        }
        return map;
    }
}

export const ontologyDiffEngine = new OntologyDiffEngine();
