/**
 * =============================================================================
 * ONTOLOGY QUERY SERVICE INTERFACES
 * Phase 3 - Ontology Query Interface
 * =============================================================================
 * 
 * Service layer definitions for executing ontology queries.
 * =============================================================================
 */

import type { Entity, EntityId } from '../types.js';
import type { EntityQuery, TraversalQuery, Filter, SortOption } from './query-types.js';

/**
 * Primary service for executing ontology-aware queries.
 */
export interface OntologyQueryService {
    /**
     * Searches for entities matching the given query criteria.
     * 
     * @param query The entity search query
     * @returns A list of entities matching the criteria
     */
    searchEntities(query: EntityQuery): Promise<Entity[]>;

    /**
     * Traverses relationships from a starting entity.
     * 
     * @param query The traversal query
     * @returns A list of target entities reached via the traversal
     */
    traverse(query: TraversalQuery): Promise<Entity[]>;

    /**
     * Retrieves a single entity by its ID with optional temporal support.
     * 
     * @param id The entity ID
     * @param asOf Optional point-in-time for historical retrieval
     * @returns The entity if found, otherwise null
     */
    getEntity(id: EntityId, asOf?: Date): Promise<Entity | null>;

    /**
     * Counts the number of entities matching the given query criteria.
     * 
     * @param query The entity search query (limit/offset/sort are ignored)
     * @returns The total count of matching entities
     */
    countEntities(query: Omit<EntityQuery, 'limit' | 'offset' | 'sort'>): Promise<number>;
}

/**
 * Fluent builder for constructing ontology queries.
 * Designed to be used by both developers and AI tools.
 */
export interface QueryBuilder {
    /** Set the entity type to query */
    forType(entityType: string): this;

    /** Add a filter condition */
    where(filter: Filter): this;

    /** Add sorting */
    orderBy(attribute: string, direction?: 'ASC' | 'DESC'): this;

    /** Set pagination limit */
    limit(count: number): this;

    /** Set pagination offset */
    offset(count: number): this;

    /** Set point-in-time for the query */
    asOf(time: Date): this;

    /** Build the final EntityQuery object */
    build(): EntityQuery;
}
