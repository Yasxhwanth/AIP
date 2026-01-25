/**
 * =============================================================================
 * ONTOLOGY STORE (Single Source of Truth)
 * Phase 25 - UI Truth Binding & Repair
 * =============================================================================
 * 
 * Responsibilities:
 * - Centralized in-memory cache for all materialized ontology truth.
 * - Written ONLY by TruthMaterializationEngine.
 * - Read ONLY by QueryClient.
 * - Enforces temporal consistency (asOf queries).
 */

import {
    Entity,
    EntityId,
    EntityVersion,
    EntityVersionId,
    AttributeValue,
    Relationship,
    RelationshipVersion,
    EntityTypeId
} from './types';

export class OntologyStore {
    private entities: Map<string, Entity> = new Map();
    private versions: Map<string, EntityVersion[]> = new Map(); // EntityId -> Versions[]
    private attributes: Map<string, AttributeValue[]> = new Map(); // EntityVersionId -> Attributes[]
    private relationships: Map<string, Relationship> = new Map();
    private relationshipVersions: Map<string, RelationshipVersion[]> = new Map();

    // --- Write API (Internal to Ontology Layer) ---

    public addEntity(entity: Entity) {
        this.entities.set(entity.id, entity);
    }

    public addEntityVersion(version: EntityVersion, attributes: AttributeValue[]) {
        const entityVersions = this.versions.get(version.entity_id) || [];
        entityVersions.push(version);
        // Sort by version number to ensure sequential access
        entityVersions.sort((a, b) => a.version_number - b.version_number);
        this.versions.set(version.entity_id, entityVersions);
        this.attributes.set(version.id, attributes);
    }

    public addRelationship(rel: Relationship) {
        this.relationships.set(rel.id, rel);
    }

    public addRelationshipVersion(version: RelationshipVersion) {
        const relVersions = this.relationshipVersions.get(version.relationship_id) || [];
        relVersions.push(version);
        relVersions.sort((a, b) => a.version_number - b.version_number);
        this.relationshipVersions.set(version.relationship_id, relVersions);
    }

    public getRelationship(id: string): Relationship | undefined {
        return this.relationships.get(id);
    }

    // --- Query API (Read-Only) ---

    public getEntities(asOf: Date, tenantId: string): Entity[] {
        return Array.from(this.entities.values())
            .filter(e => e.tenant_id === tenantId)
            .filter(e => {
                const versions = this.versions.get(e.id);
                if (!versions) return false;
                // Check if any version was valid at asOf
                return versions.some(v => v.valid_from <= asOf && (!v.valid_to || v.valid_to > asOf));
            });
    }

    public getEntitySnapshot(id: string, asOf: Date, tenantId: string): any | null {
        const entity = this.entities.get(id);
        if (!entity || entity.tenant_id !== tenantId) return null;

        const versions = this.versions.get(id);
        if (!versions) return null;

        const version = versions.find(v => v.valid_from <= asOf && (!v.valid_to || v.valid_to > asOf));
        if (!version) return null;

        const attrs = this.attributes.get(version.id) || [];
        const data: Record<string, any> = {};
        attrs.forEach(a => {
            const value = a.value_string ?? a.value_integer ?? a.value_float ?? a.value_boolean ?? a.value_date ?? a.value_datetime ?? a.value_json;
            data[a.attribute_definition_id as any] = value;
        });

        return {
            id: entity.id,
            tenant_id: entity.tenant_id,
            entity_type_id: entity.entity_type_id,
            ...data,
            _version: version
        };
    }

    public getEntityRelationships(id: string, asOf: Date, tenantId: string): any[] {
        // Find relationships where this entity is source or target
        return Array.from(this.relationships.values())
            .filter(r => (r.source_entity_id === id || r.target_entity_id === id) && r.tenant_id === tenantId)
            .filter(r => {
                const versions = this.relationshipVersions.get(r.id);
                if (!versions) return false;
                return versions.some(v => v.valid_from <= asOf && (!v.valid_to || v.valid_to > asOf));
            });
    }

    public getRelationshipHistory(entityId: string, typeId: string, asOf: Date, tenantId: string): RelationshipVersion[] {
        // Find relationships where this entity is source or target
        const rels = Array.from(this.relationships.values())
            .filter(r => (r.source_entity_id === entityId || r.target_entity_id === entityId) && r.tenant_id === tenantId && r.relationship_type_id === typeId);

        const history: RelationshipVersion[] = [];

        rels.forEach(r => {
            const versions = this.relationshipVersions.get(r.id) || [];
            // Get ALL versions that were valid at some point before or at asOf
            // We want the history, so we filter by valid_from <= asOf
            const validVersions = versions.filter(v => v.valid_from <= asOf);
            history.push(...validVersions);
        });

        // Sort by valid_from descending (newest first)
        return history.sort((a, b) => b.valid_from.getTime() - a.valid_from.getTime());
    }

    public getSpatialSnapshots(entityId: string, tenantId: string): { time: Date; x: number; y: number }[] {
        const entity = this.entities.get(entityId);
        if (!entity || entity.tenant_id !== tenantId) return [];

        const versions = this.versions.get(entityId) || [];
        const snapshots: { time: Date; x: number; y: number }[] = [];

        versions.forEach(v => {
            const attrs = this.attributes.get(v.id) || [];
            const xAttr = attrs.find(a => a.attribute_definition_id as any === 'x');
            const yAttr = attrs.find(a => a.attribute_definition_id as any === 'y');

            if (xAttr && yAttr) {
                const x = xAttr.value_integer ?? xAttr.value_float;
                const y = yAttr.value_integer ?? yAttr.value_float;
                if (x !== null && y !== null) {
                    snapshots.push({ time: v.valid_from, x, y });
                }
            }
        });

        return snapshots;
    }

    // =========================================================================
    // RELATIONSHIP AS FIRST-CLASS TRUTH (Phase 2 - Ontology Roadmap)
    // =========================================================================

    /**
     * Gets all relationships for a tenant at a specific point in time.
     */
    public getRelationships(asOf: Date, tenantId: string): Relationship[] {
        return Array.from(this.relationships.values())
            .filter(r => r.tenant_id === tenantId)
            .filter(r => {
                const versions = this.relationshipVersions.get(r.id);
                if (!versions) return false;
                return versions.some(v => v.valid_from <= asOf && (!v.valid_to || v.valid_to > asOf));
            });
    }

    /**
     * Gets a relationship snapshot at a specific point in time.
     * Includes the current version's properties and lineage metadata.
     */
    public getRelationshipSnapshot(id: string, asOf: Date, tenantId: string): {
        relationship: Relationship;
        version: RelationshipVersion;
        lineage?: {
            admission_case_id?: string;
            decision_journal_id?: string;
        };
    } | null {
        const relationship = this.relationships.get(id);
        if (!relationship || relationship.tenant_id !== tenantId) return null;

        const versions = this.relationshipVersions.get(id);
        if (!versions || versions.length === 0) return null;

        const version = versions.find(v => v.valid_from <= asOf && (!v.valid_to || v.valid_to > asOf));
        if (!version) return null;

        return {
            relationship,
            version,
            lineage: {
                admission_case_id: version.admission_case_id,
                decision_journal_id: version.decision_journal_id
            }
        };
    }

    /**
     * Gets all versions of a relationship (full history).
     */
    public getRelationshipVersions(relationshipId: string): RelationshipVersion[] {
        return this.relationshipVersions.get(relationshipId) || [];
    }

    /**
     * Gets relationships by type for a specific entity.
     */
    public getRelationshipsByType(
        entityId: string,
        relationshipTypeId: string,
        asOf: Date,
        tenantId: string,
        direction: 'source' | 'target' | 'both' = 'both'
    ): Relationship[] {
        return Array.from(this.relationships.values())
            .filter(r => {
                if (r.tenant_id !== tenantId) return false;
                if (r.relationship_type_id !== relationshipTypeId) return false;

                const matchesDirection =
                    direction === 'both' ? (r.source_entity_id === entityId || r.target_entity_id === entityId) :
                        direction === 'source' ? r.source_entity_id === entityId :
                            r.target_entity_id === entityId;

                if (!matchesDirection) return false;

                const versions = this.relationshipVersions.get(r.id);
                if (!versions) return false;
                return versions.some(v => v.valid_from <= asOf && (!v.valid_to || v.valid_to > asOf));
            });
    }

    /**
     * Counts relationships for cardinality validation.
     */
    public countRelationships(
        entityId: string,
        relationshipTypeId: string,
        direction: 'source' | 'target',
        asOf: Date,
        tenantId: string
    ): number {
        return this.getRelationshipsByType(entityId, relationshipTypeId, asOf, tenantId, direction).length;
    }

    /**
     * Gets relationship diff between two points in time.
     * Useful for scenario comparison.
     */
    public diffRelationships(
        entityId: string,
        asOf1: Date,
        asOf2: Date,
        tenantId: string
    ): {
        added: Relationship[];
        removed: Relationship[];
        changed: Array<{
            relationship: Relationship;
            oldVersion: RelationshipVersion;
            newVersion: RelationshipVersion;
        }>;
    } {
        const rels1 = this.getEntityRelationships(entityId, asOf1, tenantId);
        const rels2 = this.getEntityRelationships(entityId, asOf2, tenantId);

        const ids1 = new Set(rels1.map((r: { id: string }) => r.id));
        const ids2 = new Set(rels2.map((r: { id: string }) => r.id));

        // Added: in asOf2 but not in asOf1
        const added = rels2.filter((r: { id: string }) => !ids1.has(r.id));

        // Removed: in asOf1 but not in asOf2
        const removed = rels1.filter((r: { id: string }) => !ids2.has(r.id));

        // Changed: in both but different versions
        const changed: Array<{
            relationship: Relationship;
            oldVersion: RelationshipVersion;
            newVersion: RelationshipVersion;
        }> = [];

        for (const rel of rels1) {
            if (!ids2.has(rel.id)) continue;

            const versions = this.relationshipVersions.get(rel.id);
            if (!versions) continue;

            const v1 = versions.find(v => v.valid_from <= asOf1 && (!v.valid_to || v.valid_to > asOf1));
            const v2 = versions.find(v => v.valid_from <= asOf2 && (!v.valid_to || v.valid_to > asOf2));

            if (v1 && v2 && v1.id !== v2.id) {
                const relationship = this.relationships.get(rel.id);
                if (relationship) {
                    changed.push({ relationship, oldVersion: v1, newVersion: v2 });
                }
            }
        }

        return { added, removed, changed };
    }

    // For debugging/demo
    public clear() {
        this.entities.clear();
        this.versions.clear();
        this.attributes.clear();
        this.relationships.clear();
        this.relationshipVersions.clear();
    }
}

export const ontologyStore = new OntologyStore();
