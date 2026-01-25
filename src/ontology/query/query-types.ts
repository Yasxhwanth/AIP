/**
 * =============================================================================
 * ONTOLOGY QUERY DSL TYPES
 * Phase 3 - Ontology Query Interface
 * =============================================================================
 * 
 * Definitions for the metadata-driven Query DSL.
 * Designed for type-safety, composability, and AI tool usage.
 * =============================================================================
 */

import type { EntityId, EntityTypeId } from '../types.js';

/**
 * Supported comparison operators for filters.
 */
export enum FilterOperator {
    EQUALS = 'EQUALS',
    NOT_EQUALS = 'NOT_EQUALS',
    GREATER_THAN = 'GREATER_THAN',
    LESS_THAN = 'LESS_THAN',
    GREATER_THAN_OR_EQUAL = 'GREATER_THAN_OR_EQUAL',
    LESS_THAN_OR_EQUAL = 'LESS_THAN_OR_EQUAL',
    CONTAINS = 'CONTAINS',
    STARTS_WITH = 'STARTS_WITH',
    ENDS_WITH = 'ENDS_WITH',
    IN = 'IN',
    IS_NULL = 'IS_NULL',
    IS_NOT_NULL = 'IS_NOT_NULL',
}

/**
 * A single filter condition on an attribute.
 */
export interface AttributeFilter {
    type: 'attribute';
    /** Machine-readable attribute name */
    attributeName: string;
    operator: FilterOperator;
    /** Value to compare against. Can be an array for 'IN' operator. */
    value?: unknown;
}

/**
 * Logical operators for combining filters.
 */
export interface LogicalFilter {
    type: 'logical';
    operator: 'AND' | 'OR' | 'NOT';
    filters: Filter[];
}

/**
 * Union type for all possible filters.
 */
export type Filter = AttributeFilter | LogicalFilter;

/**
 * Sorting direction.
 */
export type SortDirection = 'ASC' | 'DESC';

/**
 * Sorting configuration for a query.
 */
export interface SortOption {
    attributeName: string;
    direction: SortDirection;
}

/**
 * Base interface for all ontology queries.
 */
export interface BaseQuery {
    /** Optional point-in-time for historical queries */
    asOf?: Date;
    /** Pagination: maximum number of results */
    limit?: number;
    /** Pagination: number of results to skip */
    offset?: number;
}

/**
 * Query for searching entities of a specific type.
 */
export interface EntityQuery extends BaseQuery {
    /** Machine-readable entity type name */
    entityType: string | EntityTypeId;
    /** Optional filter criteria */
    filter?: Filter;
    /** Optional sorting criteria */
    sort?: SortOption[];
}

/**
 * Traversal direction for relationship queries.
 */
export type TraversalDirection = 'OUTGOING' | 'INGOING' | 'BOTH';

/**
 * Query for traversing relationships from a starting entity.
 */
export interface TraversalQuery extends BaseQuery {
    /** ID of the starting entity */
    from: EntityId;
    /** Machine-readable relationship type name */
    relationshipType: string;
    /** Direction of traversal relative to the starting entity */
    direction: TraversalDirection;
    /** Optional filter criteria for the target entities */
    targetFilter?: Filter;
}
