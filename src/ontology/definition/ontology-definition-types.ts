/**
 * =============================================================================
 * ONTOLOGY DEFINITION TYPES
 * =============================================================================
 * 
 * Core types for the Ontology Definition Engine.
 * These types define the structure of the ontology itself - what entity types
 * exist, what attributes they have, and how they relate to each other.
 * 
 * INVARIANTS:
 * - All definitions are versioned
 * - All definitions are tenant-isolated
 * - Definitions are immutable once created
 * - Definitions can be deprecated but never deleted
 */

import { Brand } from '../types';

// =============================================================================
// BRANDED TYPES
// =============================================================================

export type OntologyVersionId = Brand<string, 'OntologyVersionId'>;
export type ObjectTypeDefinitionId = Brand<string, 'ObjectTypeDefinitionId'>;
export type AttributeDefinitionId = Brand<string, 'AttributeDefinitionId'>;
export type RelationshipTypeDefinitionId = Brand<string, 'RelationshipTypeDefinitionId'>;
export type MetricDefinitionId = Brand<string, 'MetricDefinitionId'>;

// =============================================================================
// ENUMS
// =============================================================================

export enum AttributeDataType {
    STRING = 'STRING',
    INTEGER = 'INTEGER',
    FLOAT = 'FLOAT',
    BOOLEAN = 'BOOLEAN',
    DATE = 'DATE',
    DATETIME = 'DATETIME',
    GEO_POINT = 'GEO_POINT',
    GEO_POLYGON = 'GEO_POLYGON',
    ENUM = 'ENUM',
    REFERENCE = 'REFERENCE',
    JSON = 'JSON',
    ARRAY = 'ARRAY'
}

export enum RelationshipDirection {
    UNIDIRECTIONAL = 'UNIDIRECTIONAL',
    BIDIRECTIONAL = 'BIDIRECTIONAL'
}

export enum RelationshipCardinality {
    ONE_TO_ONE = 'ONE_TO_ONE',
    ONE_TO_MANY = 'ONE_TO_MANY',
    MANY_TO_ONE = 'MANY_TO_ONE',
    MANY_TO_MANY = 'MANY_TO_MANY'
}

export enum OntologyVersionStatus {
    DRAFT = 'DRAFT',
    ACTIVE = 'ACTIVE',
    DEPRECATED = 'DEPRECATED',
    ARCHIVED = 'ARCHIVED'
}

export enum MetricAggregationType {
    COUNT = 'COUNT',
    SUM = 'SUM',
    AVG = 'AVG',
    MIN = 'MIN',
    MAX = 'MAX',
    PERCENTAGE = 'PERCENTAGE'
}

// =============================================================================
// METRIC DEFINITION
// =============================================================================

export interface MetricDefinition {
    readonly id: MetricDefinitionId;
    readonly ontology_version_id: OntologyVersionId;

    name: string; // Machine-readable identifier
    display_name: string;
    description: string | null;

    target_object_type_id: ObjectTypeDefinitionId;
    target_attribute_id?: AttributeDefinitionId; // Attribute to aggregate (if not COUNT)
    
    aggregation_type: MetricAggregationType;
    
    // Filter for the metric (subset of entities)
    filter_expression?: string; // Simplified query language e.g. "status = 'DEGRADED'"
    
    // Dimension for grouping
    group_by_attribute_id?: AttributeDefinitionId;
    
    // Display configuration
    unit?: string;
    decimal_places?: number;
    trend_window_hours?: number; // How far back to look for trend
    
    // Metadata
    metadata: Record<string, unknown>;

    // Audit
    created_at: Date;
    created_by: string | null;
    deprecated_at: Date | null;
}

// =============================================================================
// ATTRIBUTE DEFINITION
// =============================================================================

export interface AttributeDefinition {
    readonly id: AttributeDefinitionId;
    readonly ontology_version_id: OntologyVersionId;
    readonly object_type_id: ObjectTypeDefinitionId;

    name: string; // Machine-readable identifier (snake_case)
    display_name: string; // Human-readable name
    description: string | null;

    data_type: AttributeDataType;

    // Constraints
    is_required: boolean;
    is_unique: boolean;
    is_indexed: boolean;
    is_primary_display: boolean; // Used for entity display

    // Type-specific configuration
    enum_values?: string[]; // For ENUM type
    reference_target_type_id?: ObjectTypeDefinitionId; // For REFERENCE type
    array_element_type?: AttributeDataType; // For ARRAY type
    min_length?: number; // For STRING/ARRAY
    max_length?: number; // For STRING/ARRAY
    min_value?: number; // For INTEGER/FLOAT
    max_value?: number; // For INTEGER/FLOAT
    pattern?: string; // Regex pattern for STRING

    // Default value (type must match data_type)
    default_value: unknown | null;

    // Display configuration
    ordinal: number; // Display order
    display_format?: string; // Format string for display
    unit?: string; // Unit label (e.g., "kg", "USD")

    // Metadata
    metadata: Record<string, unknown>;

    // Audit
    created_at: Date;
    created_by: string | null;
    deprecated_at: Date | null;
}

// =============================================================================
// OBJECT TYPE DEFINITION
// =============================================================================

export interface ObjectTypeDefinition {
    readonly id: ObjectTypeDefinitionId;
    readonly ontology_version_id: OntologyVersionId;

    name: string; // Machine-readable identifier (snake_case)
    display_name: string; // Human-readable name
    description: string | null;

    // Display configuration
    icon?: string; // Icon identifier (e.g., "mdi:account", "lucide:box")
    color?: string; // Hex color for UI

    // Attributes (references to AttributeDefinition)
    attribute_ids: AttributeDefinitionId[];

    // Relationships this type can participate in (references)
    relationship_type_ids: RelationshipTypeDefinitionId[];

    // Constraints
    is_abstract: boolean; // Cannot be instantiated directly
    extends_type_id?: ObjectTypeDefinitionId; // Inheritance

    // Governance
    owner_id: string | null;
    visibility: 'PUBLIC' | 'INTERNAL' | 'RESTRICTED';

    // Metadata
    metadata: Record<string, unknown>;

    // Audit
    created_at: Date;
    created_by: string | null;
    deprecated_at: Date | null;
}

// =============================================================================
// ENTITY CONSTRAINT DEFINITION
// =============================================================================

export enum ConstraintType {
    UNIQUE_TOGETHER = 'UNIQUE_TOGETHER',
    CONDITIONAL_REQUIRED = 'CONDITIONAL_REQUIRED',
    MUTUAL_EXCLUSION = 'MUTUAL_EXCLUSION',
    CUSTOM_EXPRESSION = 'CUSTOM_EXPRESSION'
}

export interface EntityConstraintDefinition {
    readonly id: string;
    readonly ontology_version_id: OntologyVersionId;
    readonly object_type_id: ObjectTypeDefinitionId;

    name: string;
    display_name: string;
    constraint_type: ConstraintType;
    configuration: Record<string, unknown>;
    error_message: string | null;
    ordinal: number;
}

export interface RelationshipTypeDefinition {
    readonly id: RelationshipTypeDefinitionId;
    readonly ontology_version_id: OntologyVersionId;

    name: string; // Machine-readable identifier (snake_case)
    display_name: string; // Human-readable name
    description: string | null;

    // Type constraints
    from_type_id: ObjectTypeDefinitionId;
    to_type_id: ObjectTypeDefinitionId;
    direction: RelationshipDirection;
    cardinality: RelationshipCardinality;

    // Temporal properties
    is_temporal: boolean; // Can relationships have time validity?
    temporal_granularity?: 'SECOND' | 'MINUTE' | 'HOUR' | 'DAY' | 'MONTH' | 'YEAR';

    // Constraints
    min_instances?: number; // Minimum relationships per entity
    max_instances?: number; // Maximum relationships per entity

    // Inverse relationship (for bidirectional)
    inverse_name?: string;
    inverse_relationship_id?: RelationshipTypeDefinitionId;

    // Attributes on the relationship itself
    relationship_attribute_ids: AttributeDefinitionId[]; // Attributes on the edge

    // Metadata
    metadata: Record<string, unknown>;

    // Audit
    created_at: Date;
    created_by: string | null;
    deprecated_at: Date | null;
}

// =============================================================================
// ONTOLOGY VERSION
// =============================================================================

export interface OntologyVersion {
    readonly id: OntologyVersionId;
    readonly tenant_id: string;

    version_name: string; // Semantic version (e.g., "v1.0.0")
    version_number: number; // Incremental version number

    status: OntologyVersionStatus;

    // Parent version (for branching)
    parent_version_id: OntologyVersionId | null;

    // Active pointer
    is_active: boolean; // Only one active version per tenant

    // Backward compatibility
    backward_compatible: boolean; // Can entities from previous version be used?
    migration_rules?: MigrationRule[]; // How to migrate from previous version

    // Definitions
    object_type_ids: ObjectTypeDefinitionId[];
    relationship_type_ids: RelationshipTypeDefinitionId[];
    metric_definition_ids: MetricDefinitionId[];

    // Metadata
    description: string | null;
    metadata: Record<string, unknown>;

    // Audit
    created_at: Date;
    created_by: string | null;
    activated_at: Date | null;
    deprecated_at: Date | null;
}

export interface MigrationRule {
    from_attribute_id: AttributeDefinitionId;
    to_attribute_id: AttributeDefinitionId;
    transformation?: string; // Transformation expression
    default_value?: unknown; // Default if transformation fails
}

// =============================================================================
// ONTOLOGY SNAPSHOT
// =============================================================================

/**
 * A resolved snapshot of the ontology at a specific version and time.
 * This is what queries resolve against.
 */
export interface OntologySnapshot {
    readonly ontology_version_id: OntologyVersionId;
    readonly as_of: Date;
    readonly resolved_at: Date;

    // Resolved definitions
    object_types: Map<ObjectTypeDefinitionId, ObjectTypeDefinition>;
    attributes: Map<AttributeDefinitionId, AttributeDefinition>;
    relationship_types: Map<RelationshipTypeDefinitionId, RelationshipTypeDefinition>;
    metric_definitions: Map<MetricDefinitionId, MetricDefinition>;

    // Indexes for fast lookup
    object_types_by_name: Map<string, ObjectTypeDefinition>;
    attributes_by_object_type: Map<ObjectTypeDefinitionId, AttributeDefinition[]>;
    relationships_by_from_type: Map<ObjectTypeDefinitionId, RelationshipTypeDefinition[]>;
    relationships_by_to_type: Map<ObjectTypeDefinitionId, RelationshipTypeDefinition[]>;
    constraints_by_object_type: Map<ObjectTypeDefinitionId, EntityConstraintDefinition[]>;
}

// =============================================================================
// COMPILED ONTOLOGY SNAPSHOT
// =============================================================================

/**
 * Output of OntologyCompiler.
 * Contains runtime-optimized structures for validation, querying, and UI generation.
 */
export interface CompiledOntologySnapshot {
    readonly ontology_version_id: OntologyVersionId;
    readonly compiled_at: Date;
    readonly snapshot: OntologySnapshot;
    readonly snapshot_hash?: string; // Deterministic hash for replay verification

    // Compiled validators
    validators: Map<ObjectTypeDefinitionId, CompiledValidator>;

    // Compiled query plans
    query_plans: Map<string, CompiledQueryPlan>;

    // Compiled UI schemas
    ui_schemas: Map<ObjectTypeDefinitionId, CompiledUISchema>;

    // Compiled workflow contracts
    workflow_contracts: Map<string, CompiledWorkflowContract>;

    // Compiled AI context schemas
    ai_context_schemas: Map<ObjectTypeDefinitionId, CompiledAIContextSchema>;
}

export interface CompiledValidator {
    object_type_id: ObjectTypeDefinitionId;
    validate: (entity: Record<string, unknown>) => ValidationResult;
}

export interface CompiledQueryPlan {
    query_id: string;
    plan: QueryExecutionPlan;
}

export interface CompiledUISchema {
    object_type_id: ObjectTypeDefinitionId;
    form_fields: FormFieldDefinition[];
    display_config: DisplayConfiguration;
}

export interface CompiledWorkflowContract {
    workflow_id: string;
    input_schema: Record<string, unknown>;
    output_schema: Record<string, unknown>;
}

export interface CompiledAIContextSchema {
    object_type_id: ObjectTypeDefinitionId;
    semantic_description: string;
    attribute_descriptions: Map<string, string>;
    relationship_descriptions: Map<string, string>;
}

export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
}

export interface ValidationError {
    attribute_id?: AttributeDefinitionId;
    message: string;
    code: string;
}

export interface QueryExecutionPlan {
    steps: QueryStep[];
}

export interface QueryStep {
    type: 'FILTER' | 'JOIN' | 'AGGREGATE' | 'PROJECT';
    config: Record<string, unknown>;
}

export interface FormFieldDefinition {
    attribute_id: AttributeDefinitionId;
    field_type: 'text' | 'number' | 'select' | 'date' | 'checkbox' | 'textarea';
    label: string;
    placeholder?: string;
    required: boolean;
    validation_rules: Record<string, unknown>;
}

export interface DisplayConfiguration {
    primary_attribute_id: AttributeDefinitionId;
    secondary_attribute_ids: AttributeDefinitionId[];
    list_view_columns: AttributeDefinitionId[];
    detail_view_sections: DetailViewSection[];
}

export interface DetailViewSection {
    title: string;
    attribute_ids: AttributeDefinitionId[];
}

