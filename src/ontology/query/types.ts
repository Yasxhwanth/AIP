import {
    OntologyVersionId,
    EntityTypeId,
    AttributeDefinitionId,
    RelationshipTypeId,
    EntityId,
    EntityVersionId,
    RelationshipId,
    RelationshipVersionId,
    Metadata,
} from '../types.js';

/**
 * Represents a snapshot of an entity at a specific point in time.
 * Reconstructed from entity_version and attribute_values.
 */
export interface EntitySnapshot {
    /** Identity of the entity */
    readonly id: EntityId;

    /** Version of the entity valid at the asOf time */
    readonly version_id: EntityVersionId;

    /** Type of the entity */
    readonly type_id: EntityTypeId;

    /** 
     * Materialized attribute values.
     * Key is attribute name (resolved from attribute_definition).
     */
    readonly attributes: Record<string, unknown>;

    /** Metadata associated with this version */
    readonly metadata: Metadata;

    /** When this version became valid */
    readonly valid_from: Date;

    /** When this version was superseded (null = currently valid) */
    readonly valid_to: Date | null;
}

/**
 * Represents the result of a relationship traversal.
 */
export interface TraversalResult {
    /** The relationship identity */
    readonly relationship_id: RelationshipId;

    /** The relationship version valid at the asOf time */
    readonly version_id: RelationshipVersionId;

    /** The target entity snapshot */
    readonly target: EntitySnapshot;

    /** Properties associated with this relationship version */
    readonly properties: Record<string, unknown>;
}

/**
 * Options for ontology queries.
 */
export interface QueryOptions {
    /** 
     * Point-in-time for the query.
     * All metadata and runtime objects will be resolved as of this time.
     */
    asOf: Date;
}

/**
 * Core service for deterministic, version-aware ontology queries.
 * 
 * @invariant TC-0: Uses ontology_version PUBLISHED at asOf time.
 * @invariant TC-1: All results consistent with same asOf.
 * @invariant TC-3: Relationship versions bind to valid entity versions.
 */
export interface OntologyQueryService {
    /**
     * Retrieves a single entity by ID at a specific point in time.
     */
    getEntity(id: EntityId, options: QueryOptions): Promise<EntitySnapshot | null>;

    /**
     * Retrieves all entities of a specific type at a point in time.
     */
    getEntitiesByType(typeId: EntityTypeId, options: QueryOptions): Promise<EntitySnapshot[]>;

    /**
     * Traverses relationships from a source entity.
     * 
     * @param sourceId The starting entity
     * @param relationshipName The name of the relationship to traverse
     * @param options Query options (including asOf)
     */
    traverse(
        sourceId: EntityId,
        relationshipName: string,
        options: QueryOptions
    ): Promise<TraversalResult[]>;

    /**
     * Resolves the metadata context (OntologyVersion) for a given time.
     */
    resolveMetadataVersion(asOf: Date): Promise<OntologyVersionId>;

    /**
     * Retrieves an entity snapshot by its version ID.
     */
    getEntityByVersion(versionId: EntityVersionId): Promise<EntitySnapshot | null>;
}
