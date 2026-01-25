import {
    OntologyVersionId,
    EntityVersionId,
    Metadata,
} from './types.js';

/**
 * Lifecycle status of a rule.
 */
export enum RuleStatus {
    /** Mutable, can be edited */
    DRAFT = 'DRAFT',

    /** Immutable, in production use */
    PUBLISHED = 'PUBLISHED',

    /** Superseded, read-only */
    DEPRECATED = 'DEPRECATED',
}

/**
 * Logical operators for combining conditions.
 */
export type LogicalOperator = 'AND' | 'OR' | 'NOT';

/**
 * Comparison operators for evaluating attribute values.
 */
export type ComparisonOperator =
    | 'EQUALS'
    | 'NOT_EQUALS'
    | 'GREATER_THAN'
    | 'LESS_THAN'
    | 'CONTAINS'
    | 'EXISTS';

/**
 * Declarative condition expression.
 * Supports nested logical operators and path-based attribute resolution.
 */
export interface ConditionExpression {
    /** Logical operator (if combining multiple expressions) */
    operator?: LogicalOperator;

    /** Nested expressions (for AND/OR/NOT) */
    expressions?: ConditionExpression[];

    /** 
     * Path to the value in the EntitySnapshot.
     * e.g., "attributes.status", "metadata.source"
     */
    path?: string;

    /** Comparison operator */
    comparison?: ComparisonOperator;

    /** Value to compare against */
    value?: any;
}

/**
 * Metadata for a rule definition.
 */
export interface RuleDefinition {
    /** Unique identifier */
    readonly id: string;

    /** Parent ontology version */
    readonly ontology_version_id: OntologyVersionId;

    /** Machine-readable identifier */
    name: string;

    /** Human-readable name */
    display_name: string;

    /** Detailed description */
    description: string | null;

    /** Lifecycle status */
    status: RuleStatus;

    /** Rule configuration */
    configuration: ConditionExpression;

    /** When the rule was published */
    published_at: Date | null;
}

/**
 * Immutable snapshot of a rule.
 */
export interface RuleVersion {
    /** Unique identifier */
    readonly id: string;

    /** Parent rule definition */
    readonly rule_id: string;

    /** Explicit binding to ontology version */
    readonly ontology_version_id: OntologyVersionId;

    /** Sequential version number */
    readonly version_number: number;

    /** Rule configuration at this point in time */
    readonly configuration: ConditionExpression;

    /** When this version was created */
    readonly created_at: Date;
}

/**
 * Result of a rule evaluation.
 */
export interface EvaluationResult {
    /** Whether the rule condition was met */
    result: boolean;

    /** Rule version used for evaluation */
    rule_version_id: string;

    /** Target object ID (Entity or Relationship) */
    target_object_id: string;

    /** Point-in-time for the evaluation */
    asOf: Date;
}

/**
 * Structure of an emitted domain event.
 */
export interface DomainEvent {
    /** Unique identifier */
    readonly id: string;

    /** Rule version that triggered the event */
    readonly rule_version_id: string;

    /** Entity version that triggered the event */
    readonly entity_version_id: EntityVersionId;

    /** Type of event */
    event_type: string;

    /** Event payload */
    payload: Metadata;

    /** When the event was emitted */
    readonly created_at: Date;
}
