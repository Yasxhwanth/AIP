/**
 * =============================================================================
 * ONTOLOGY STRUCTURAL METADATA - DOMAIN MODELS
 * Phase 1A - Enterprise Ontology Runtime
 * =============================================================================
 * 
 * These TypeScript types define the structural metadata for a generic ontology
 * engine. All business semantics are user-defined via metadata - nothing is
 * hardcoded.
 * 
 * Design principles:
 * - Branded types for type-safe IDs
 * - Strict null checking
 * - Readonly properties where applicable
 * - Comprehensive JSDoc documentation
 * =============================================================================
 */

// =============================================================================
// BRANDED TYPES
// =============================================================================
// Branded types prevent accidental mixing of different ID types at compile time.
// e.g., you cannot pass an EntityTypeId where an AttributeDefinitionId is expected.

declare const __brand: unique symbol;

export type Brand<T, B> = T & { readonly [__brand]: B };

/** Unique identifier for an ontology version */
export type OntologyVersionId = Brand<string, 'OntologyVersionId'>;

/** Unique identifier for an entity type */
export type EntityTypeId = Brand<string, 'EntityTypeId'>;

/** Unique identifier for an attribute definition */
export type AttributeDefinitionId = Brand<string, 'AttributeDefinitionId'>;

/** Unique identifier for a relationship type */
export type RelationshipTypeId = Brand<string, 'RelationshipTypeId'>;

/** Unique identifier for an entity constraint (Phase 1B) */
export type EntityConstraintId = Brand<string, 'EntityConstraintId'>;

// Phase 33A: Geographic Types
export const ENTITY_TYPE_LOCATION = 'LOCATION' as EntityTypeId;
export const ENTITY_TYPE_REGION = 'REGION' as EntityTypeId;

export const RELATIONSHIP_TYPE_LOCATED_AT = 'LOCATED_AT' as RelationshipTypeId;
export const RELATIONSHIP_TYPE_WITHIN = 'WITHIN' as RelationshipTypeId;

// Phase 2A: Runtime Object IDs

/** Unique identifier for an entity (runtime instance of EntityType) */
export type EntityId = Brand<string, 'EntityId'>;

/** Unique identifier for an entity version */
export type EntityVersionId = Brand<string, 'EntityVersionId'>;

/** Unique identifier for an attribute value */
export type AttributeValueId = Brand<string, 'AttributeValueId'>;

/** Unique identifier for a relationship (runtime instance of RelationshipType) */
export type RelationshipId = Brand<string, 'RelationshipId'>;

/** Unique identifier for a relationship version */
export type RelationshipVersionId = Brand<string, 'RelationshipVersionId'>;

// Phase 2B: Audit & History IDs

/** Unique identifier for an audit log entry */
export type AuditLogId = Brand<string, 'AuditLogId'>;

/** Unique identifier for a deletion record */
export type DeletionRecordId = Brand<string, 'DeletionRecordId'>;

/** Unique identifier for a user (future auth integration) */
export type UserId = Brand<string, 'UserId'>;

// =============================================================================
// ENUMS
// =============================================================================

/**
 * Lifecycle status of an ontology version.
 * 
 * State transitions:
 * - DRAFT → PUBLISHED (one-way, triggers immutability)
 * - PUBLISHED → DEPRECATED (one-way, marks as superseded)
 * 
 * @invariant DRAFT versions are mutable
 * @invariant PUBLISHED versions are immutable (except for soft delete)
 * @invariant DEPRECATED versions are read-only
 */
export enum OntologyVersionStatus {
  /** Mutable version, can be edited */
  DRAFT = 'DRAFT',

  /** Immutable version, in production use */
  PUBLISHED = 'PUBLISHED',

  /** Superseded version, read-only, kept for historical reference */
  DEPRECATED = 'DEPRECATED',
}

/**
 * Data types supported for attribute values.
 * 
 * Each type has specific validation_rules schema in AttributeDefinition.
 */
export enum AttributeDataType {
  /** Variable-length text */
  STRING = 'STRING',

  /** Whole numbers (stored as bigint in PostgreSQL) */
  INTEGER = 'INTEGER',

  /** Decimal numbers (stored as double precision) */
  FLOAT = 'FLOAT',

  /** Boolean true/false */
  BOOLEAN = 'BOOLEAN',

  /** Date without time component */
  DATE = 'DATE',

  /** Date with time and timezone */
  DATETIME = 'DATETIME',

  /** Arbitrary JSON structure */
  JSON = 'JSON',

  /** Ordered collection (element type defined in validation_rules) */
  ARRAY = 'ARRAY',

  /** Reference to another entity (target type in validation_rules) */
  REFERENCE = 'REFERENCE',
}

/**
 * Cardinality constraint for relationships.
 * 
 * Defines how many instances can participate on each side.
 */
export enum RelationshipCardinality {
  /** Source has at most one target; target has at most one source */
  ONE_TO_ONE = 'ONE_TO_ONE',

  /** Source can have many targets; each target has at most one source */
  ONE_TO_MANY = 'ONE_TO_MANY',

  /** Source has at most one target; target can have many sources */
  MANY_TO_ONE = 'MANY_TO_ONE',

  /** Source can have many targets; target can have many sources */
  MANY_TO_MANY = 'MANY_TO_MANY',
}

/**
 * Entity-level constraint types (Phase 1B).
 * 
 * Defines validation rules that span multiple attributes.
 */
export enum ConstraintType {
  /** Multiple attributes must be unique together */
  UNIQUE_TOGETHER = 'UNIQUE_TOGETHER',

  /** Attribute(s) required if condition is met */
  CONDITIONAL_REQUIRED = 'CONDITIONAL_REQUIRED',

  /** Only one of the listed attributes can have a value */
  MUTUAL_EXCLUSION = 'MUTUAL_EXCLUSION',

  /** User-defined expression (future) */
  CUSTOM_EXPRESSION = 'CUSTOM_EXPRESSION',
}

/**
 * Audit operation types (Phase 2B).
 * 
 * Tracks what kind of change was made to a record.
 */
export enum AuditOperation {
  /** Record was created */
  CREATE = 'CREATE',

  /** Record was modified (new version created) */
  UPDATE = 'UPDATE',

  /** Record was soft-deleted */
  DELETE = 'DELETE',

  /** Record was restored from soft-delete */
  RESTORE = 'RESTORE',
}

/**
 * Visibility markers (Phase 4).
 * 
 * Defines the high-level visibility of an object.
 */
export enum VisibilityMarker {
  /** Visible to everyone */
  PUBLIC = 'PUBLIC',

  /** Visible to authenticated users */
  INTERNAL = 'INTERNAL',

  /** Visible only to owner/specific roles */
  PRIVATE = 'PRIVATE',

  /** Highly sensitive, requires explicit policy clearance */
  RESTRICTED = 'RESTRICTED',
}

/**
 * Extensible governance hooks for future permission engine integration.
 * (Phase 4)
 */
export interface GovernanceMetadata {
  /** User or Group ID who owns the object */
  owner_id: UserId | string | null;

  /** High-level visibility marker */
  visibility: VisibilityMarker;

  /** 
   * Role/Action to Policy mappings.
   * e.g., { "read": "policy-123", "write": "policy-456" }
   */
  policy_bindings?: Record<string, string>;
}

// =============================================================================
// CONSTRAINT CONFIGURATIONS (Phase 1B)
// =============================================================================
// Type-safe configuration definitions per constraint type.

/**
 * Configuration for UNIQUE_TOGETHER constraint.
 * The combination of listed attributes must be unique across all entities.
 */
export interface UniqueTogetherConfig {
  /** Attribute names that must be unique together */
  attribute_names: string[];
}

/**
 * Configuration for CONDITIONAL_REQUIRED constraint.
 * If the trigger attribute has the specified value, then the target attributes are required.
 */
export interface ConditionalRequiredConfig {
  /** Attribute name that triggers the condition */
  if_attribute: string;

  /** Value that triggers the condition (use null for "has any value") */
  if_value: unknown;

  /** Attributes that become required when condition is met */
  then_required: string[];
}

/**
 * Configuration for MUTUAL_EXCLUSION constraint.
 * Only one of the listed attributes can have a non-null value.
 */
export interface MutualExclusionConfig {
  /** Attribute names where only one can have a value */
  attribute_names: string[];
}

/**
 * Configuration for CUSTOM_EXPRESSION constraint (future).
 */
export interface CustomExpressionConfig {
  /** Expression to evaluate (syntax TBD) */
  expression: string;
}

/**
 * Union type for all constraint configurations.
 */
export type ConstraintConfiguration =
  | UniqueTogetherConfig
  | ConditionalRequiredConfig
  | MutualExclusionConfig
  | CustomExpressionConfig;

// =============================================================================
// VALIDATION RULES
// =============================================================================
// Type-safe validation rule definitions per data type.

/**
 * Validation rules for STRING attributes.
 */
export interface StringValidationRules {
  /** Minimum length (inclusive) */
  min_length?: number;

  /** Maximum length (inclusive) */
  max_length?: number;

  /** Regex pattern the value must match */
  pattern?: string;

  /** Enumerated allowed values */
  enum_values?: string[];
}

/**
 * Validation rules for INTEGER and FLOAT attributes.
 */
export interface NumericValidationRules {
  /** Minimum value (inclusive) */
  min?: number;

  /** Maximum value (inclusive) */
  max?: number;

  /** For FLOAT: maximum decimal places */
  decimal_places?: number;
}

/**
 * Validation rules for DATE and DATETIME attributes.
 */
export interface DateValidationRules {
  /** Minimum date (ISO 8601 string) */
  min_date?: string;

  /** Maximum date (ISO 8601 string) */
  max_date?: string;
}

/**
 * Validation rules for ARRAY attributes.
 */
export interface ArrayValidationRules {
  /** Data type of array elements */
  element_type: AttributeDataType;

  /** Minimum number of items */
  min_items?: number;

  /** Maximum number of items */
  max_items?: number;

  /** Whether items must be unique */
  unique_items?: boolean;

  /** Element-level validation rules (type depends on element_type) */
  element_rules?: ValidationRules;
}

/**
 * Validation rules for REFERENCE attributes.
 */
export interface ReferenceValidationRules {
  /** Target entity type ID that this reference points to */
  target_entity_type_id: EntityTypeId;
}

/**
 * Validation rules for JSON attributes.
 */
export interface JsonValidationRules {
  /** JSON Schema for validating the structure */
  json_schema?: Record<string, unknown>;
}

/**
 * Union type for all validation rules.
 */
export type ValidationRules =
  | StringValidationRules
  | NumericValidationRules
  | DateValidationRules
  | ArrayValidationRules
  | ReferenceValidationRules
  | JsonValidationRules
  | Record<string, never>; // Empty rules (no validation)

// =============================================================================
// CORE DOMAIN MODELS
// =============================================================================

/**
 * Base fields present on all entities.
 */
export interface BaseEntity {
  /** Timestamp when record was created */
  readonly created_at: Date;

  /** Timestamp when record was last updated */
  readonly updated_at: Date;

  /** User who created this record (null if system-generated) */
  readonly created_by: UserId | null;

  /** Soft delete timestamp (null if not deleted) */
  readonly deleted_at: Date | null;
}

/**
 * Extensible metadata container.
 * Used for storing additional attributes without schema changes.
 */
export type Metadata = Record<string, unknown>;

/**
 * Represents a versioned snapshot of the ontology schema.
 * 
 * @invariant Version string must be unique among non-deleted records
 * @invariant Published versions are immutable
 * @invariant Status transitions: DRAFT → PUBLISHED → DEPRECATED
 */
export interface OntologyVersion extends BaseEntity {
  /** Unique identifier */
  readonly id: OntologyVersionId;

  /** Tenant ID (Multi-tenancy) */
  readonly tenant_id: string;

  /** Version identifier (semantic versioning recommended, e.g., "1.0.0") */
  version: string;

  /** Human-readable name for this version */
  name: string;

  /** Detailed description of changes in this version */
  description: string | null;

  /** Lifecycle status */
  status: OntologyVersionStatus;

  /** Extensible metadata */
  metadata: Metadata;

  /** Timestamp when version was published (null if still draft) */
  readonly published_at: Date | null;
}

/**
 * Defines a class/type of entity that can exist in the system.
 * 
 * Examples (user-defined, not hardcoded): Customer, Order, Product
 * 
 * @invariant Name must be unique per ontology version among non-deleted records
 * @invariant Name must be valid identifier: lowercase, alphanumeric, underscores, starts with letter
 * @invariant Must belong to an existing, non-deleted ontology version
 */
export interface EntityType extends BaseEntity {
  /** Unique identifier */
  readonly id: EntityTypeId;

  /** Parent ontology version */
  readonly ontology_version_id: OntologyVersionId;

  /** Machine-readable identifier (snake_case) */
  name: string;

  /** Human-readable display name */
  display_name: string;

  /** Detailed description */
  description: string | null;

  /** Icon identifier for UI rendering (e.g., "mdi:account") */
  icon: string | null;

  /** Color for UI rendering (hex code, e.g., "#3B82F6") */
  color: string | null;

  /** Governance hooks (Phase 4) */
  governance?: GovernanceMetadata;

  /** Extensible metadata */
  metadata: Metadata;
}

/**
 * Defines a property/field on an entity type.
 * 
 * Examples (user-defined): name, email, quantity
 * 
 * @invariant Name must be unique per entity type among non-deleted records
 * @invariant Name must be valid identifier: lowercase, alphanumeric, underscores, starts with letter
 * @invariant Must belong to an existing, non-deleted entity type
 * @invariant default_value type must match data_type
 * @invariant validation_rules schema must match data_type
 */
export interface AttributeDefinition extends BaseEntity {
  /** Unique identifier */
  readonly id: AttributeDefinitionId;

  /** Parent entity type */
  readonly entity_type_id: EntityTypeId;

  /** Machine-readable identifier (snake_case) */
  name: string;

  /** Human-readable display name */
  display_name: string;

  /** Detailed description */
  description: string | null;

  /** Data type for values */
  data_type: AttributeDataType;

  /** Whether a value is required for this attribute */
  is_required: boolean;

  /** Whether values must be unique across all entities of this type */
  is_unique: boolean;

  /** Whether to create a database index on this attribute */
  is_indexed: boolean;

  /** Whether this attribute is part of the entity's primary display */
  is_primary_display: boolean;

  /** Default value when not provided (type must match data_type) */
  default_value: unknown | null;

  /** Type-specific validation rules */
  validation_rules: ValidationRules;

  /** Display order (lower = displayed first) */
  ordinal: number;

  /** Governance hooks (Phase 4) */
  governance?: GovernanceMetadata;

  /** Extensible metadata */
  metadata: Metadata;
}

/**
 * Defines a type of relationship that can exist between entity types.
 * 
 * Examples (user-defined): "customer places order", "product belongs to category"
 * 
 * @invariant Name must be unique per ontology version among non-deleted records
 * @invariant Name must be valid identifier: lowercase, alphanumeric, underscores, starts with letter
 * @invariant Source and target entity types must exist and belong to the same ontology version
 * @invariant inverse_name, if provided, must be a valid identifier
 */
export interface RelationshipType extends BaseEntity {
  /** Unique identifier */
  readonly id: RelationshipTypeId;

  /** Parent ontology version */
  readonly ontology_version_id: OntologyVersionId;

  /** Machine-readable identifier (snake_case) */
  name: string;

  /** Human-readable display name (e.g., "Places Order") */
  display_name: string;

  /** Detailed description */
  description: string | null;

  /** Source entity type (the "from" side) */
  readonly source_entity_type_id: EntityTypeId;

  /** Target entity type (the "to" side) */
  readonly target_entity_type_id: EntityTypeId;

  /** Cardinality constraint */
  cardinality: RelationshipCardinality;

  /**
   * Whether this relationship is directional.
   * - TRUE: A→B is different from B→A (e.g., "manages")
   * - FALSE: A→B is equivalent to B→A (e.g., "related to")
   */
  is_directional: boolean;

  /**
   * Machine-readable name when viewing from target side.
   * Used for bidirectional traversal.
   * e.g., if name is "manages", inverse_name might be "managed_by"
   */
  inverse_name: string | null;

  /** Human-readable inverse display name */
  inverse_display_name: string | null;

  // Phase 1B: Relationship instance constraints
  /** Minimum number of relationships from source entity (default 0) */
  source_min_count: number;

  /** Maximum number of relationships from source entity (null = unlimited) */
  source_max_count: number | null;

  /** Minimum number of relationships to target entity (default 0) */
  target_min_count: number;

  /** Maximum number of relationships to target entity (null = unlimited) */
  target_max_count: number | null;

  /** Governance hooks (Phase 4) */
  governance?: GovernanceMetadata;

  /** Extensible metadata */
  metadata: Metadata;
}

/**
 * Defines an entity-level constraint that spans multiple attributes (Phase 1B).
 * 
 * Examples: unique together, conditional required, mutual exclusion
 * 
 * @invariant Name must be unique per entity type among non-deleted records
 * @invariant Name must be valid identifier: lowercase, alphanumeric, underscores, starts with letter
 * @invariant Must belong to an existing, non-deleted entity type
 * @invariant configuration schema must match constraint_type
 */
export interface EntityConstraint extends BaseEntity {
  /** Unique identifier */
  readonly id: EntityConstraintId;

  /** Parent entity type */
  readonly entity_type_id: EntityTypeId;

  /** Machine-readable identifier (snake_case) */
  name: string;

  /** Human-readable display name */
  display_name: string;

  /** Type of constraint */
  constraint_type: ConstraintType;

  /** Type-specific constraint configuration */
  configuration: ConstraintConfiguration;

  /** Custom error message (supports {attribute} placeholders) */
  error_message: string | null;

  /** Evaluation order (lower = evaluated first) */
  ordinal: number;

  /** Governance hooks (Phase 4) */
  governance?: GovernanceMetadata;

  /** Extensible metadata */
  metadata: Metadata;
}

// =============================================================================
// PHASE 2A: RUNTIME OBJECTS
// =============================================================================
// Runtime instances of the ontology metadata. These represent actual business
// data that conforms to the ontology schema.

/**
 * Base fields for version records.
 */
export interface VersionBase {
  /** Sequential version number (1, 2, 3...) */
  version_number: number;

  /** When this version became valid */
  valid_from: Date;

  /** When this version was superseded (null = currently valid) */
  valid_to: Date | null;

  /** Why this version was created */
  change_reason: string | null;

  /** Origin system for data lineage */
  source_system: string | null;

  /** When this version was created */
  readonly created_at: Date;

  /** User who created this version */
  readonly created_by: UserId | null;

  /** Extensible metadata */
  metadata: Metadata;

  // --- Lineage Metadata (Phase 24) ---
  /** Link to the admission case that approved this version */
  readonly admission_case_id?: string;
  /** Link to the immutable decision journal entry */
  readonly decision_journal_id?: string;
  /** Link to the candidate truth that proposed this change */
  readonly candidate_truth_id?: string;
  /** Link to the raw ingestion event */
  readonly ingestion_event_id?: string;
}

/**
 * Runtime instance of an EntityType.
 * Represents actual business objects like a specific Customer, Order, or Product.
 * 
 * @invariant Must reference an existing, non-deleted entity type
 * @invariant external_id, if provided, should be unique per entity type
 */
export interface Entity extends BaseEntity {
  /** Unique identifier */
  readonly id: EntityId;

  /** Tenant ID (Multi-tenancy) */
  readonly tenant_id: string;

  /** Reference to entity type (metadata layer) */
  readonly entity_type_id: EntityTypeId;

  /** External system identifier for integration */
  external_id: string | null;

  /** Governance hooks (Phase 4) */
  governance?: GovernanceMetadata;

  /** Extensible metadata */
  metadata: Metadata;
}

/**
 * Immutable snapshot of entity state at a point in time.
 * Each update creates a new version; old versions are preserved for history.
 * 
 * @invariant version_number must be positive and sequential per entity
 * @invariant valid_to is null for the current version only
 */
export interface EntityVersion extends VersionBase {
  /** Unique identifier */
  readonly id: EntityVersionId;

  /** Parent entity */
  readonly entity_id: EntityId;
}

/**
 * Actual attribute value for an entity version.
 * Uses typed fields for query performance.
 * 
 * @invariant Only one value_* field should be populated based on attribute data_type
 * @invariant is_null = true means the attribute was explicitly set to null
 */
export interface AttributeValue {
  /** Unique identifier */
  readonly id: AttributeValueId;

  /** Parent entity version */
  readonly entity_version_id: EntityVersionId;

  /** Reference to attribute definition (metadata layer) */
  readonly attribute_definition_id: AttributeDefinitionId;

  /** Explicit NULL tracking (distinguishes "not set" from "set to null") */
  is_null: boolean;

  /** Typed value fields - only one should be populated */
  value_string: string | null;
  value_integer: number | null;
  value_float: number | null;
  value_boolean: boolean | null;
  value_date: Date | null;
  value_datetime: Date | null;
  value_json: unknown | null;

  /** Extensible metadata */
  metadata: Metadata;
}

/**
 * Runtime instance of a RelationshipType connecting two entities.
 * 
 * @invariant source and target entities must match relationship type's entity types
 * @invariant source and target must be non-deleted entities
 */
export interface Relationship extends BaseEntity {
  /** Unique identifier */
  readonly id: RelationshipId;

  /** Tenant ID (Multi-tenancy) */
  readonly tenant_id: string;

  /** Reference to relationship type (metadata layer) */
  readonly relationship_type_id: RelationshipTypeId;

  /** Source entity */
  readonly source_entity_id: EntityId;

  /** Target entity */
  readonly target_entity_id: EntityId;

  /** Governance hooks (Phase 4) */
  governance?: GovernanceMetadata;

  /** Extensible metadata */
  metadata: Metadata;
}

/**
 * Immutable snapshot of relationship state.
 * Supports relationships with dynamic properties (weights, labels, etc.).
 * 
 * @invariant version_number must be positive and sequential per relationship
 */
export interface RelationshipVersion extends VersionBase {
  /** Unique identifier */
  readonly id: RelationshipVersionId;

  /** Parent relationship */
  readonly relationship_id: RelationshipId;

  /** Relationship properties (weights, labels, etc.) */
  properties: Record<string, unknown>;
}

// =============================================================================
// PHASE 2B: AUDIT & HISTORY
// =============================================================================
// Immutable audit trail and deletion history.

/**
 * Immutable log of a change to a runtime object.
 * 
 * @invariant performed_at is set by the database/system
 * @invariant changes object contains old/new values for modified fields
 */
export interface AuditLog {
  /** Unique identifier */
  readonly id: AuditLogId;

  /** Table name of the affected record */
  readonly table_name: string;

  /** ID of the affected record */
  readonly record_id: string;

  /** Type of operation performed */
  readonly operation: AuditOperation;

  /** Version number before change (for UPDATE) */
  readonly old_version_number: number | null;

  /** Version number after change (for UPDATE) */
  readonly new_version_number: number | null;

  /** Detailed changes {field: {old, new}} */
  readonly changes: Record<string, { old: unknown; new: unknown }> | null;

  /** When the operation occurred */
  readonly performed_at: Date;

  /** Who performed the operation */
  readonly performed_by: UserId | null;

  /** Session ID of the actor who performed the operation */
  readonly performed_by_session_id?: string;

  /** Governance context (Phase 4) */
  readonly governance_context?: Record<string, unknown>;

  /** Request context (IP, user agent, etc.) */
  readonly context: Record<string, unknown>;
}

/**
 * Record of a soft-deleted object.
 * 
 * @invariant restorable=true implies the object can be undeleted
 */
export interface DeletionRecord {
  /** Unique identifier */
  readonly id: DeletionRecordId;

  /** Table name of the deleted record */
  readonly table_name: string;

  /** ID of the deleted record */
  readonly record_id: string;

  /** When it was deleted */
  readonly deleted_at: Date;

  /** Who deleted it */
  readonly deleted_by: UserId | null;

  /** Reason for deletion */
  readonly reason: string | null;

  /** Whether it can be restored */
  readonly restorable: boolean;

  /** When it was restored (if applicable) */
  readonly restored_at: Date | null;

  /** Who restored it (if applicable) */
  readonly restored_by: UserId | null;

  /** Snapshot of data at time of deletion */
  readonly snapshot: Record<string, unknown> | null;

  /** Additional context */
  readonly context: Record<string, unknown>;
}

// =============================================================================
// PHASE 35: OBJECT ACTIONS & MUTATIONS
// =============================================================================

/**
 * Type of mutation to perform on the ontology.
 */
export enum MutationType {
  CREATE_ENTITY = 'CREATE_ENTITY',
  UPDATE_ATTRIBUTE = 'UPDATE_ATTRIBUTE',
  DELETE_ENTITY = 'DELETE_ENTITY',
  CREATE_RELATIONSHIP = 'CREATE_RELATIONSHIP',
  DELETE_RELATIONSHIP = 'DELETE_RELATIONSHIP',
}

/**
 * Represents a single atomic change to the ontology.
 */
export interface Mutation {
  readonly type: MutationType;
  readonly tenant_id: string;
  readonly entity_id?: EntityId;
  readonly entity_type_id?: EntityTypeId;
  readonly attribute_definition_id?: AttributeDefinitionId;
  readonly newValue?: unknown;
  readonly relationship_type_id?: RelationshipTypeId;
  readonly source_entity_id?: EntityId;
  readonly target_entity_id?: EntityId;
  readonly metadata?: Metadata;
}

/**
 * Defines a user-invokable action that results in mutations.
 */
export interface ActionDefinition extends BaseEntity {
  readonly id: string;
  readonly tenant_id: string;
  readonly name: string;
  readonly display_name: string;
  readonly description: string | null;
  readonly input_schema: Record<string, any>;
  readonly mutation_logic: string; // DSL or reference to logic
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard to check if validation rules are for STRING type.
 */
export function isStringValidationRules(
  rules: ValidationRules
): rules is StringValidationRules {
  return (
    'min_length' in rules ||
    'max_length' in rules ||
    'pattern' in rules ||
    'enum_values' in rules
  );
}

/**
 * Type guard to check if validation rules are for numeric types.
 */
export function isNumericValidationRules(
  rules: ValidationRules
): rules is NumericValidationRules {
  return 'min' in rules || 'max' in rules || 'decimal_places' in rules;
}

/**
 * Type guard to check if validation rules are for ARRAY type.
 */
export function isArrayValidationRules(
  rules: ValidationRules
): rules is ArrayValidationRules {
  return 'element_type' in rules;
}

/**
 * Type guard to check if validation rules are for REFERENCE type.
 */
export function isReferenceValidationRules(
  rules: ValidationRules
): rules is ReferenceValidationRules {
  return 'target_entity_type_id' in rules;
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================
// These create branded IDs from raw strings. Use when deserializing from DB.

/**
 * Creates a branded OntologyVersionId from a raw string.
 */
export function createOntologyVersionId(id: string): OntologyVersionId {
  return id as OntologyVersionId;
}

/**
 * Creates a branded EntityTypeId from a raw string.
 */
export function createEntityTypeId(id: string): EntityTypeId {
  return id as EntityTypeId;
}

/**
 * Creates a branded AttributeDefinitionId from a raw string.
 */
export function createAttributeDefinitionId(id: string): AttributeDefinitionId {
  return id as AttributeDefinitionId;
}

/**
 * Creates a branded RelationshipTypeId from a raw string.
 */
export function createRelationshipTypeId(id: string): RelationshipTypeId {
  return id as RelationshipTypeId;
}

/**
 * Creates a branded EntityConstraintId from a raw string (Phase 1B).
 */
export function createEntityConstraintId(id: string): EntityConstraintId {
  return id as EntityConstraintId;
}

// Phase 2A: Runtime object ID factories

/**
 * Creates a branded EntityId from a raw string.
 */
export function createEntityId(id: string): EntityId {
  return id as EntityId;
}

/**
 * Creates a branded EntityVersionId from a raw string.
 */
export function createEntityVersionId(id: string): EntityVersionId {
  return id as EntityVersionId;
}

/**
 * Creates a branded AttributeValueId from a raw string.
 */
export function createAttributeValueId(id: string): AttributeValueId {
  return id as AttributeValueId;
}

/**
 * Creates a branded RelationshipId from a raw string.
 */
export function createRelationshipId(id: string): RelationshipId {
  return id as RelationshipId;
}

/**
 * Creates a branded RelationshipVersionId from a raw string.
 */
export function createRelationshipVersionId(id: string): RelationshipVersionId {
  return id as RelationshipVersionId;
}

/**
 * Creates a branded AuditLogId from a raw string.
 */
export function createAuditLogId(id: string): AuditLogId {
  return id as AuditLogId;
}

/**
 * Creates a branded DeletionRecordId from a raw string.
 */
export function createDeletionRecordId(id: string): DeletionRecordId {
  return id as DeletionRecordId;
}

/**
 * Creates a branded UserId from a raw string.
 */
export function createUserId(id: string): UserId {
  return id as UserId;
}

// =============================================================================
// CONSTRAINT TYPE GUARDS (Phase 1B)
// =============================================================================

/**
 * Type guard for UNIQUE_TOGETHER constraint configuration.
 */
export function isUniqueTogetherConfig(
  config: ConstraintConfiguration
): config is UniqueTogetherConfig {
  return 'attribute_names' in config && !('if_attribute' in config);
}

/**
 * Type guard for CONDITIONAL_REQUIRED constraint configuration.
 */
export function isConditionalRequiredConfig(
  config: ConstraintConfiguration
): config is ConditionalRequiredConfig {
  return 'if_attribute' in config && 'then_required' in config;
}

/**
 * Type guard for MUTUAL_EXCLUSION constraint configuration.
 */
export function isMutualExclusionConfig(
  config: ConstraintConfiguration
): config is MutualExclusionConfig {
  return 'attribute_names' in config && !('if_attribute' in config) && !('expression' in config);
}

/**
 * Type guard for CUSTOM_EXPRESSION constraint configuration.
 */
export function isCustomExpressionConfig(
  config: ConstraintConfiguration
): config is CustomExpressionConfig {
  return 'expression' in config;
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Regex pattern for valid identifiers (name fields).
 * Must be lowercase, start with letter, contain only alphanumeric and underscores.
 */
export const IDENTIFIER_PATTERN = /^[a-z][a-z0-9_]*$/;

/**
 * Validates that a string is a valid identifier.
 */
export function isValidIdentifier(name: string): boolean {
  return IDENTIFIER_PATTERN.test(name);
}

/**
 * Regex pattern for valid hex color codes.
 */
export const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

/**
 * Validates that a string is a valid hex color code.
 */
export function isValidHexColor(color: string): boolean {
  return HEX_COLOR_PATTERN.test(color);
}
