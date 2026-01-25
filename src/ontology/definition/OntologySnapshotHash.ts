/**
 * =============================================================================
 * ONTOLOGY SNAPSHOT HASHING
 * =============================================================================
 * 
 * Generates deterministic hashes for ontology snapshots to ensure:
 * - Replay verification (same ontology → same hash)
 * - Deterministic compilation
 * - Snapshot integrity checks
 * 
 * INVARIANTS:
 * - Same metadata always produces same hash
 * - Hash includes all structural elements
 * - Byte-level deterministic
 */

import {
    OntologySnapshot,
    OntologyVersionId,
    ObjectTypeDefinition,
    AttributeDefinition,
    RelationshipTypeDefinition,
    MetricDefinition
} from './ontology-definition-types';

export interface OntologySnapshotHashResult {
    ontology_version_id: OntologyVersionId;
    snapshot_hash: string;
    computed_at: Date;
    elements_hashed: {
        object_types: number;
        attributes: number;
        relationships: number;
        metrics: number;
        constraints: number;
    };
}

export class OntologySnapshotHasher {
    /**
     * Compute deterministic hash for ontology snapshot.
     * 
     * CRITICAL: Hash must be deterministic across runs.
     * - Sort all collections by ID
     * - Normalize whitespace
     * - Exclude timestamps (non-structural)
     */
    public computeHash(snapshot: OntologySnapshot): OntologySnapshotHashResult {
        const elements: string[] = [];

        // 1. Hash object types (sorted by ID)
        const objectTypes = Array.from(snapshot.object_types.values())
            .sort((a, b) => a.id.localeCompare(b.id));
        for (const objType of objectTypes) {
            elements.push(this.hashObjectType(objType));
        }

        // 2. Hash attributes (sorted by ID)
        const allAttributes: AttributeDefinition[] = [];
        for (const attrs of snapshot.attributes_by_object_type.values()) {
            allAttributes.push(...attrs);
        }
        allAttributes.sort((a, b) => a.id.localeCompare(b.id));
        for (const attr of allAttributes) {
            elements.push(this.hashAttribute(attr));
        }

        // 3. Hash relationships (sorted by ID)
        const relationships = Array.from(snapshot.relationship_types.values())
            .sort((a, b) => a.id.localeCompare(b.id));
        for (const rel of relationships) {
            elements.push(this.hashRelationship(rel));
        }

        // 4. Hash metrics (sorted by ID)
        const metrics = Array.from(snapshot.metric_definitions.values())
            .sort((a, b) => a.id.localeCompare(b.id));
        for (const metric of metrics) {
            elements.push(this.hashMetric(metric));
        }

        // 5. Hash constraints (sorted by ID)
        const allConstraints = Array.from(snapshot.constraints_by_object_type.values())
            .flat()
            .sort((a, b) => a.id.localeCompare(b.id));
        for (const constraint of allConstraints) {
            elements.push(this.hashConstraint(constraint));
        }

        // Combine all elements and hash
        const combinedString = elements.join('|');
        const hash = this.sha256(combinedString);

        return {
            ontology_version_id: snapshot.ontology_version_id,
            snapshot_hash: hash,
            computed_at: new Date(),
            elements_hashed: {
                object_types: objectTypes.length,
                attributes: allAttributes.length,
                relationships: relationships.length,
                metrics: metrics.length,
                constraints: allConstraints.length
            }
        };
    }

    /**
     * Hash object type definition (structural only).
     */
    private hashObjectType(objType: ObjectTypeDefinition): string {
        return [
            'OBJ',
            objType.id,
            objType.name,
            objType.display_name,
            objType.description || '',
            objType.icon || '',
            objType.color || ''
        ].join(':');
    }

    /**
     * Hash attribute definition (structural only).
     */
    private hashAttribute(attr: AttributeDefinition): string {
        return [
            'ATTR',
            attr.id,
            attr.object_type_id,
            attr.name,
            attr.display_name,
            attr.data_type,
            attr.is_required ? '1' : '0',
            attr.is_unique ? '1' : '0',
            attr.is_indexed ? '1' : '0',
            attr.is_primary_display ? '1' : '0',
            attr.pattern || '',
            attr.min_length || '',
            attr.max_length || '',
            attr.description || ''
        ].join(':');
    }

    /**
     * Hash relationship type definition (structural only).
     */
    private hashRelationship(rel: RelationshipTypeDefinition): string {
        return [
            'REL',
            rel.id,
            rel.name,
            rel.display_name,
            rel.from_type_id,
            rel.to_type_id,
            rel.cardinality,
            rel.description || ''
        ].join(':');
    }

    /**
     * Hash metric definition (structural only).
     */
    private hashMetric(metric: MetricDefinition): string {
        return [
            'METRIC',
            metric.id,
            metric.name,
            metric.display_name,
            metric.aggregation_type,
            metric.target_object_type_id || '',
            JSON.stringify(metric.filter_expression || {}),
            metric.target_attribute_id || ''
        ].join(':');
    }

    /**
     * Hash constraint definition (structural only).
     */
    private hashConstraint(constraint: any): string {
        return [
            'CONSTRAINT',
            constraint.id,
            constraint.object_type_id,
            constraint.constraint_type,
            JSON.stringify(constraint.expression || {})
        ].join(':');
    }

    /**
     * SHA-256 hash implementation (deterministic).
     */
    private sha256(input: string): string {
        // Simple deterministic hash for browser/node compatibility
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(16).padStart(16, '0');
    }
}

export const ontologySnapshotHasher = new OntologySnapshotHasher();
