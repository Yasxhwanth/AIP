-- =============================================================================
-- ONTOLOGY STRUCTURAL METADATA SCHEMA
-- Phase 1A - Enterprise Ontology Runtime
-- =============================================================================
-- This schema defines the structural metadata for a generic ontology engine.
-- All business semantics are user-defined via metadata - nothing is hardcoded.
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- ENUMS
-- =============================================================================

-- Ontology version lifecycle status
CREATE TYPE ontology_version_status AS ENUM (
    'DRAFT',        -- Mutable, can be edited
    'PUBLISHED',    -- Immutable, in production use
    'DEPRECATED'    -- Superseded, read-only
);

-- Attribute data types
CREATE TYPE attribute_data_type AS ENUM (
    'STRING',       -- Variable-length text
    'INTEGER',      -- Whole numbers (bigint)
    'FLOAT',        -- Decimal numbers (double precision)
    'BOOLEAN',      -- True/false
    'DATE',         -- Date without time
    'DATETIME',     -- Date with time and timezone
    'JSON',         -- Arbitrary JSON structure
    'ARRAY',        -- Ordered collection (element type in validation_rules)
    'REFERENCE'     -- Reference to another entity (target type in validation_rules)
);

-- Relationship cardinality
CREATE TYPE relationship_cardinality AS ENUM (
    'ONE_TO_ONE',
    'ONE_TO_MANY',
    'MANY_TO_ONE',
    'MANY_TO_MANY'
);

-- Entity-level constraint types (Phase 1B)
CREATE TYPE constraint_type AS ENUM (
    'UNIQUE_TOGETHER',      -- Multiple attributes must be unique together
    'CONDITIONAL_REQUIRED', -- Attribute required if condition met
    'MUTUAL_EXCLUSION',     -- Only one of listed attributes can have value
    'CUSTOM_EXPRESSION'     -- User-defined expression (future)
);

-- Audit operation types (Phase 2B)
CREATE TYPE audit_operation AS ENUM (
    'CREATE',   -- Record created
    'UPDATE',   -- Record modified (new version)
    'DELETE',   -- Soft delete
    'RESTORE'   -- Restored from soft delete
);

-- Visibility markers (Phase 4)
CREATE TYPE visibility_marker AS ENUM (
    'PUBLIC',      -- Visible to everyone
    'INTERNAL',    -- Visible to authenticated users
    'PRIVATE',     -- Visible only to owner/specific roles
    'RESTRICTED'   -- Highly sensitive, requires explicit policy clearance
);

-- =============================================================================
-- ONTOLOGY VERSION
-- =============================================================================
-- Represents a versioned snapshot of the ontology schema.
-- Published versions are immutable to ensure runtime stability.
-- =============================================================================

CREATE TABLE ontology_version (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Version identifier (semantic versioning recommended)
    version VARCHAR(50) NOT NULL,
    
    -- Human-readable name for this version
    name VARCHAR(255) NOT NULL,
    
    -- Detailed description of changes in this version
    description TEXT,
    
    -- Lifecycle status
    status ontology_version_status NOT NULL DEFAULT 'DRAFT',
    
    -- Extensible metadata for future needs
    metadata JSONB NOT NULL DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    created_by UUID,  -- FK to users table (Phase N)
    
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT ontology_version_version_unique 
        UNIQUE (version) 
        -- Note: Partial unique index created below for soft delete
);

-- Partial unique index: version must be unique among non-deleted records
DROP INDEX IF EXISTS idx_ontology_version_version_unique;
CREATE UNIQUE INDEX idx_ontology_version_version_unique 
    ON ontology_version (version) 
    WHERE deleted_at IS NULL;

-- Index for status queries
CREATE INDEX idx_ontology_version_status ON ontology_version (status) 
    WHERE deleted_at IS NULL;

-- =============================================================================
-- ENTITY TYPE
-- =============================================================================
-- Defines a class/type of entity that can exist in the system.
-- Examples: Customer, Order, Product (but these are USER-defined, not hardcoded)
-- =============================================================================

CREATE TABLE entity_type (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Parent version (scopes this type to a specific ontology version)
    ontology_version_id UUID NOT NULL,
    
    -- Machine-readable identifier (snake_case, alphanumeric)
    name VARCHAR(255) NOT NULL,
    
    -- Human-readable name
    display_name VARCHAR(255) NOT NULL,
    
    -- Detailed description
    description TEXT,
    
    -- Icon identifier for UI rendering (e.g., "mdi:account", "lucide:box")
    icon VARCHAR(100),
    
    -- Color for UI rendering (hex code)
    color VARCHAR(7),
    
    -- Governance hooks (Phase 4)
    owner_id UUID,                     -- User or Group who owns this type
    visibility visibility_marker NOT NULL DEFAULT 'INTERNAL',
    policy_bindings JSONB NOT NULL DEFAULT '{}', -- Role/Action to Policy mappings
    
    -- Extensible metadata
    metadata JSONB NOT NULL DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    
    -- Foreign keys
    CONSTRAINT fk_entity_type_ontology_version 
        FOREIGN KEY (ontology_version_id) 
        REFERENCES ontology_version(id) 
        ON DELETE RESTRICT,
    
    -- Name must be valid identifier
    CONSTRAINT entity_type_name_format 
        CHECK (name ~ '^[a-z][a-z0-9_]*$')
);

-- Partial unique index: name must be unique per version among non-deleted records
CREATE UNIQUE INDEX idx_entity_type_version_name_unique 
    ON entity_type (ontology_version_id, name) 
    WHERE deleted_at IS NULL;

-- Index for version queries
CREATE INDEX idx_entity_type_ontology_version 
    ON entity_type (ontology_version_id) 
    WHERE deleted_at IS NULL;

-- =============================================================================
-- ATTRIBUTE DEFINITION
-- =============================================================================
-- Defines a property/field on an entity type.
-- Examples: name, email, quantity (but these are USER-defined)
-- =============================================================================

CREATE TABLE attribute_definition (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Parent entity type
    entity_type_id UUID NOT NULL,
    
    -- Machine-readable identifier (snake_case, alphanumeric)
    name VARCHAR(255) NOT NULL,
    
    -- Human-readable name
    display_name VARCHAR(255) NOT NULL,
    
    -- Detailed description
    description TEXT,
    
    -- Data type
    data_type attribute_data_type NOT NULL,
    
    -- Constraints
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    is_unique BOOLEAN NOT NULL DEFAULT FALSE,
    is_indexed BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Is this attribute part of the entity's primary display?
    is_primary_display BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Default value (type must match data_type)
    default_value JSONB,
    
    -- Validation rules (schema depends on data_type)
    -- Examples:
    --   STRING: { "min_length": 1, "max_length": 100, "pattern": "^[A-Z]" }
    --   INTEGER: { "min": 0, "max": 1000 }
    --   ARRAY: { "element_type": "STRING", "min_items": 1 }
    --   REFERENCE: { "target_entity_type_id": "uuid-here" }
    validation_rules JSONB NOT NULL DEFAULT '{}',
    
    -- Display order (lower = first)
    ordinal INTEGER NOT NULL DEFAULT 0,
    
    -- Extensible metadata
    metadata JSONB NOT NULL DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    
    -- Foreign keys
    CONSTRAINT fk_attribute_definition_entity_type 
        FOREIGN KEY (entity_type_id) 
        REFERENCES entity_type(id) 
        ON DELETE RESTRICT,
    
    -- Governance hooks (Phase 4)
    owner_id UUID,                     -- User or Group who owns this attribute
    visibility visibility_marker NOT NULL DEFAULT 'INTERNAL',
    policy_bindings JSONB NOT NULL DEFAULT '{}', -- Role/Action to Policy mappings
    
    -- Name must be valid identifier
    CONSTRAINT attribute_definition_name_format 
        CHECK (name ~ '^[a-z][a-z0-9_]*$')
);

-- Partial unique index: name must be unique per entity type among non-deleted records
CREATE UNIQUE INDEX idx_attribute_definition_entity_name_unique 
    ON attribute_definition (entity_type_id, name) 
    WHERE deleted_at IS NULL;

-- Index for entity type queries
CREATE INDEX idx_attribute_definition_entity_type 
    ON attribute_definition (entity_type_id) 
    WHERE deleted_at IS NULL;

-- Index for ordinal sorting
CREATE INDEX idx_attribute_definition_ordinal 
    ON attribute_definition (entity_type_id, ordinal) 
    WHERE deleted_at IS NULL;

-- =============================================================================
-- RELATIONSHIP TYPE
-- =============================================================================
-- Defines a type of relationship that can exist between entity types.
-- Examples: "customer places order", "product belongs to category"
-- =============================================================================

CREATE TABLE relationship_type (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Parent version (scopes this relationship to a specific ontology version)
    ontology_version_id UUID NOT NULL,
    
    -- Machine-readable identifier (snake_case, alphanumeric)
    name VARCHAR(255) NOT NULL,
    
    -- Human-readable name (e.g., "Places Order")
    display_name VARCHAR(255) NOT NULL,
    
    -- Detailed description
    description TEXT,
    
    -- Source entity type (the "from" side)
    source_entity_type_id UUID NOT NULL,
    
    -- Target entity type (the "to" side)
    target_entity_type_id UUID NOT NULL,
    
    -- Cardinality constraint
    cardinality relationship_cardinality NOT NULL DEFAULT 'MANY_TO_MANY',
    
    -- Is this a directional relationship?
    -- TRUE: A→B is different from B→A (e.g., "manages")
    -- FALSE: A→B is same as B→A (e.g., "related to")
    is_directional BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Name when viewing from target side (for bidirectional display)
    -- e.g., if name is "manages", inverse_name might be "managed_by"
    inverse_name VARCHAR(255),
    
    -- Human-readable inverse display name
    inverse_display_name VARCHAR(255),
    
    -- Relationship instance constraints (Phase 1B)
    -- Defines min/max number of relationships per entity instance
    source_min_count INTEGER NOT NULL DEFAULT 0,  -- Min relationships from source
    source_max_count INTEGER,                      -- Max relationships from source (NULL = unlimited)
    target_min_count INTEGER NOT NULL DEFAULT 0,  -- Min relationships to target
    target_max_count INTEGER,                      -- Max relationships to target (NULL = unlimited)
    
    -- Governance hooks (Phase 4)
    owner_id UUID,                     -- User or Group who owns this type
    visibility visibility_marker NOT NULL DEFAULT 'INTERNAL',
    policy_bindings JSONB NOT NULL DEFAULT '{}', -- Role/Action to Policy mappings
    
    -- Extensible metadata
    metadata JSONB NOT NULL DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    
    -- Foreign keys
    CONSTRAINT fk_relationship_type_ontology_version 
        FOREIGN KEY (ontology_version_id) 
        REFERENCES ontology_version(id) 
        ON DELETE RESTRICT,
    
    CONSTRAINT fk_relationship_type_source_entity 
        FOREIGN KEY (source_entity_type_id) 
        REFERENCES entity_type(id) 
        ON DELETE RESTRICT,
    
    CONSTRAINT fk_relationship_type_target_entity 
        FOREIGN KEY (target_entity_type_id) 
        REFERENCES entity_type(id) 
        ON DELETE RESTRICT,
    
    -- Name must be valid identifier
    CONSTRAINT relationship_type_name_format 
        CHECK (name ~ '^[a-z][a-z0-9_]*$'),
    
    -- Inverse name must be valid identifier if provided
    CONSTRAINT relationship_type_inverse_name_format 
        CHECK (inverse_name IS NULL OR inverse_name ~ '^[a-z][a-z0-9_]*$')
);

-- Partial unique index: name must be unique per version among non-deleted records
CREATE UNIQUE INDEX idx_relationship_type_version_name_unique 
    ON relationship_type (ontology_version_id, name) 
    WHERE deleted_at IS NULL;

-- Index for version queries
CREATE INDEX idx_relationship_type_ontology_version 
    ON relationship_type (ontology_version_id) 
    WHERE deleted_at IS NULL;

-- Index for source entity queries
CREATE INDEX idx_relationship_type_source 
    ON relationship_type (source_entity_type_id) 
    WHERE deleted_at IS NULL;

-- Index for target entity queries
CREATE INDEX idx_relationship_type_target 
    ON relationship_type (target_entity_type_id) 
    WHERE deleted_at IS NULL;

-- =============================================================================
-- ENTITY CONSTRAINT (Phase 1B)
-- =============================================================================
-- Defines entity-level constraints that span multiple attributes.
-- Examples: unique together, conditional required, mutual exclusion
-- =============================================================================

CREATE TABLE entity_constraint (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Parent entity type
    entity_type_id UUID NOT NULL,
    
    -- Machine-readable identifier (snake_case, alphanumeric)
    name VARCHAR(255) NOT NULL,
    
    -- Human-readable display name
    display_name VARCHAR(255) NOT NULL,
    
    -- Type of constraint
    constraint_type constraint_type NOT NULL,
    
    -- Constraint configuration (structure depends on constraint_type)
    -- UNIQUE_TOGETHER: { "attribute_names": ["attr1", "attr2"] }
    -- CONDITIONAL_REQUIRED: { "if_attribute": "x", "if_value": "y", "then_required": ["a", "b"] }
    -- MUTUAL_EXCLUSION: { "attribute_names": ["attr1", "attr2", "attr3"] }
    -- CUSTOM_EXPRESSION: { "expression": "..." } (future)
    configuration JSONB NOT NULL,
    
    -- Custom error message (supports {attribute} placeholders)
    error_message VARCHAR(500),
    
    -- Display order (lower = evaluated first)
    ordinal INTEGER NOT NULL DEFAULT 0,
    
    -- Extensible metadata
    metadata JSONB NOT NULL DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    
    -- Foreign keys
    CONSTRAINT fk_entity_constraint_entity_type 
        FOREIGN KEY (entity_type_id) 
        REFERENCES entity_type(id) 
        ON DELETE RESTRICT,
    
    -- Governance hooks (Phase 4)
    owner_id UUID,                     -- User or Group who owns this constraint
    visibility visibility_marker NOT NULL DEFAULT 'INTERNAL',
    policy_bindings JSONB NOT NULL DEFAULT '{}', -- Role/Action to Policy mappings
    
    -- Name must be valid identifier
    CONSTRAINT entity_constraint_name_format 
        CHECK (name ~ '^[a-z][a-z0-9_]*$')
);

-- Partial unique index: name must be unique per entity type among non-deleted records
CREATE UNIQUE INDEX idx_entity_constraint_entity_name_unique 
    ON entity_constraint (entity_type_id, name) 
    WHERE deleted_at IS NULL;

-- Index for entity type queries
CREATE INDEX idx_entity_constraint_entity_type 
    ON entity_constraint (entity_type_id) 
    WHERE deleted_at IS NULL;

-- Index for ordinal sorting
CREATE INDEX idx_entity_constraint_ordinal 
    ON entity_constraint (entity_type_id, ordinal) 
    WHERE deleted_at IS NULL;

-- =============================================================================
-- PHASE 2A: RUNTIME OBJECTS
-- =============================================================================
-- Runtime instances of the ontology metadata. These tables store actual
-- business data (entities, relationships, values) that conform to the
-- ontology schema defined in Phase 1A/1B.
-- =============================================================================

-- =============================================================================
-- ENTITY
-- =============================================================================
-- A runtime instance of an EntityType. Represents actual business objects
-- like a specific Customer, Order, or Product.
-- =============================================================================

CREATE TABLE entity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Reference to the entity type (metadata layer)
    entity_type_id UUID NOT NULL,
    
    -- External system identifier for integration
    external_id VARCHAR(500),
    
    -- Pointer to the current active version
    current_version_id UUID,  -- FK added after entity_version table
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    
    -- Governance hooks (Phase 4)
    owner_id UUID,                     -- User or Group who owns this instance
    visibility visibility_marker NOT NULL DEFAULT 'INTERNAL',
    
    -- Extensible metadata
    metadata JSONB NOT NULL DEFAULT '{}',
    
    -- Foreign keys
    CONSTRAINT fk_entity_entity_type 
        FOREIGN KEY (entity_type_id) 
        REFERENCES entity_type(id) 
        ON DELETE RESTRICT
);

-- Index for entity type queries
CREATE INDEX idx_entity_entity_type 
    ON entity (entity_type_id) 
    WHERE deleted_at IS NULL;

-- Index for external ID lookups
CREATE INDEX idx_entity_external_id 
    ON entity (entity_type_id, external_id) 
    WHERE deleted_at IS NULL AND external_id IS NOT NULL;

-- =============================================================================
-- ENTITY VERSION
-- =============================================================================
-- Immutable snapshot of entity state at a point in time.
-- Each update creates a new version; old versions are preserved for history.
-- =============================================================================

CREATE TABLE entity_version (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Parent entity
    entity_id UUID NOT NULL,
    
    -- Sequential version number (1, 2, 3...)
    version_number INTEGER NOT NULL,
    
    -- Temporal validity (bi-temporal support)
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ,  -- NULL means currently valid
    
    -- Provenance / data lineage
    change_reason TEXT,
    source_system VARCHAR(255),
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    
    -- Extensible metadata
    metadata JSONB NOT NULL DEFAULT '{}',
    
    -- Foreign keys
    CONSTRAINT fk_entity_version_entity 
        FOREIGN KEY (entity_id) 
        REFERENCES entity(id) 
        ON DELETE RESTRICT,
    
    -- Version number must be positive
    CONSTRAINT entity_version_number_positive 
        CHECK (version_number > 0)
);

-- Add FK from entity to entity_version (deferred due to circular reference)
ALTER TABLE entity 
    ADD CONSTRAINT fk_entity_current_version 
    FOREIGN KEY (current_version_id) 
    REFERENCES entity_version(id) 
    ON DELETE SET NULL;

-- Unique version number per entity
CREATE UNIQUE INDEX idx_entity_version_entity_number 
    ON entity_version (entity_id, version_number);

-- Index for temporal queries (as-of time)
CREATE INDEX idx_entity_version_temporal 
    ON entity_version (entity_id, valid_from, valid_to);

-- Index for current version queries
CREATE INDEX idx_entity_version_current 
    ON entity_version (entity_id) 
    WHERE valid_to IS NULL;

-- =============================================================================
-- ATTRIBUTE VALUE
-- =============================================================================
-- Stores actual attribute values for an entity version.
-- Uses typed columns for query performance and type safety.
-- =============================================================================

CREATE TABLE attribute_value (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Parent entity version
    entity_version_id UUID NOT NULL,
    
    -- Reference to attribute definition (metadata layer)
    attribute_definition_id UUID NOT NULL,
    
    -- Explicit NULL tracking (distinguishes "not set" from "set to null")
    is_null BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Typed value columns (only one should be populated based on data_type)
    value_string TEXT,
    value_integer BIGINT,
    value_float DOUBLE PRECISION,
    value_boolean BOOLEAN,
    value_date DATE,
    value_datetime TIMESTAMPTZ,
    value_json JSONB,
    
    -- Extensible metadata
    metadata JSONB NOT NULL DEFAULT '{}',
    
    -- Foreign keys
    CONSTRAINT fk_attribute_value_entity_version 
        FOREIGN KEY (entity_version_id) 
        REFERENCES entity_version(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_attribute_value_attribute_definition 
        FOREIGN KEY (attribute_definition_id) 
        REFERENCES attribute_definition(id) 
        ON DELETE RESTRICT
);

-- Unique attribute per version (one value per attribute per version)
CREATE UNIQUE INDEX idx_attribute_value_version_attribute 
    ON attribute_value (entity_version_id, attribute_definition_id);

-- Index for attribute definition lookups
CREATE INDEX idx_attribute_value_attribute_definition 
    ON attribute_value (attribute_definition_id);

-- =============================================================================
-- RELATIONSHIP
-- =============================================================================
-- A runtime instance of a RelationshipType connecting two entities.
-- =============================================================================

CREATE TABLE relationship (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Reference to relationship type (metadata layer)
    relationship_type_id UUID NOT NULL,
    
    -- Source and target entities
    source_entity_id UUID NOT NULL,
    target_entity_id UUID NOT NULL,
    
    -- Pointer to current active version
    current_version_id UUID,  -- FK added after relationship_version table
    
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    
    -- Governance hooks (Phase 4)
    owner_id UUID,                     -- User or Group who owns this instance
    visibility visibility_marker NOT NULL DEFAULT 'INTERNAL',
    
    -- Extensible metadata
    metadata JSONB NOT NULL DEFAULT '{}',
    
    -- Foreign keys
    CONSTRAINT fk_relationship_relationship_type 
        FOREIGN KEY (relationship_type_id) 
        REFERENCES relationship_type(id) 
        ON DELETE RESTRICT,
    
    CONSTRAINT fk_relationship_source_entity 
        FOREIGN KEY (source_entity_id) 
        REFERENCES entity(id) 
        ON DELETE RESTRICT,
    
    CONSTRAINT fk_relationship_target_entity 
        FOREIGN KEY (target_entity_id) 
        REFERENCES entity(id) 
        ON DELETE RESTRICT
);

-- Index for relationship type queries
CREATE INDEX idx_relationship_relationship_type 
    ON relationship (relationship_type_id) 
    WHERE deleted_at IS NULL;

-- Index for source entity queries (outgoing relationships)
CREATE INDEX idx_relationship_source 
    ON relationship (source_entity_id) 
    WHERE deleted_at IS NULL;

-- Index for target entity queries (incoming relationships)
CREATE INDEX idx_relationship_target 
    ON relationship (target_entity_id) 
    WHERE deleted_at IS NULL;

-- Composite index for relationship lookups
CREATE INDEX idx_relationship_source_target_type 
    ON relationship (source_entity_id, target_entity_id, relationship_type_id) 
    WHERE deleted_at IS NULL;

-- =============================================================================
-- RELATIONSHIP VERSION
-- =============================================================================
-- Immutable snapshot of relationship state (for relationships with properties).
-- =============================================================================

CREATE TABLE relationship_version (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Parent relationship
    relationship_id UUID NOT NULL,
    
    -- Sequential version number
    version_number INTEGER NOT NULL,
    
    -- Temporal validity
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ,  -- NULL means currently valid
    
    -- Relationship properties (weights, labels, etc.)
    properties JSONB NOT NULL DEFAULT '{}',
    
    -- Provenance
    change_reason TEXT,
    source_system VARCHAR(255),
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    
    -- Extensible metadata
    metadata JSONB NOT NULL DEFAULT '{}',
    
    -- Foreign keys
    CONSTRAINT fk_relationship_version_relationship 
        FOREIGN KEY (relationship_id) 
        REFERENCES relationship(id) 
        ON DELETE RESTRICT,
    
    -- Version number must be positive
    CONSTRAINT relationship_version_number_positive 
        CHECK (version_number > 0)
);

-- Add FK from relationship to relationship_version
ALTER TABLE relationship 
    ADD CONSTRAINT fk_relationship_current_version 
    FOREIGN KEY (current_version_id) 
    REFERENCES relationship_version(id) 
    ON DELETE SET NULL;

-- Unique version number per relationship
CREATE UNIQUE INDEX idx_relationship_version_relationship_number 
    ON relationship_version (relationship_id, version_number);

-- Index for temporal queries
CREATE INDEX idx_relationship_version_temporal 
    ON relationship_version (relationship_id, valid_from, valid_to);

-- Index for current version queries
CREATE INDEX idx_relationship_version_current 
    ON relationship_version (relationship_id) 
    WHERE valid_to IS NULL;

-- =============================================================================
-- PHASE 2B: AUDIT & HISTORY
-- =============================================================================
-- Immutable audit trail for compliance, debugging, and historical reconstruction.
-- These tables are append-only - no updates or deletes allowed.
-- =============================================================================

-- =============================================================================
-- AUDIT LOG
-- =============================================================================
-- Immutable log of all changes to runtime objects.
-- Application layer must insert records; no triggers (for performance).
-- =============================================================================

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- What changed
    table_name VARCHAR(100) NOT NULL,  -- e.g., 'entity', 'relationship'
    record_id UUID NOT NULL,           -- ID of the affected record
    operation audit_operation NOT NULL,
    
    -- Version info (for UPDATE operations)
    old_version_number INTEGER,
    new_version_number INTEGER,
    
    -- Change details
    changes JSONB,  -- {field: {old: ..., new: ...}}
    
    -- Who/when
    performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    performed_by UUID,
    
    -- Governance context (Phase 4)
    governance_context JSONB NOT NULL DEFAULT '{}', -- Policy decision details
    
    -- Context for debugging/compliance
    request_id UUID,           -- Correlation ID for distributed tracing
    client_ip INET,            -- Source IP address
    user_agent VARCHAR(500),   -- Client identifier
    context JSONB NOT NULL DEFAULT '{}',  -- Additional context
    
    -- Immutability: no updated_at, no deleted_at
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for record history queries
CREATE INDEX idx_audit_log_record 
    ON audit_log (table_name, record_id, performed_at);

-- Index for user activity queries
CREATE INDEX idx_audit_log_user 
    ON audit_log (performed_by, performed_at)
    WHERE performed_by IS NOT NULL;

-- Index for time-based queries
CREATE INDEX idx_audit_log_time 
    ON audit_log (performed_at DESC);

-- =============================================================================
-- PHASE 6: RULE & EVENT EVALUATION ENGINE
-- =============================================================================

-- Rule lifecycle status
CREATE TYPE rule_status AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'DEPRECATED'
);

-- =============================================================================
-- RULE DEFINITION
-- =============================================================================
-- Stores the high-level definition of a declarative rule.
-- Rules are bound to a specific ontology version to ensure schema consistency.
-- =============================================================================

CREATE TABLE rule_definition (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Binding to ontology version (RE-6)
    ontology_version_id UUID NOT NULL,
    
    -- Machine-readable identifier
    name VARCHAR(255) NOT NULL,
    
    -- Human-readable name
    display_name VARCHAR(255) NOT NULL,
    
    -- Detailed description
    description TEXT,
    
    -- Current lifecycle status
    status rule_status NOT NULL DEFAULT 'DRAFT',
    
    -- Governance hooks (Phase 4)
    owner_id UUID,
    visibility visibility_marker NOT NULL DEFAULT 'INTERNAL',
    policy_bindings JSONB NOT NULL DEFAULT '{}',
    
    -- Extensible metadata
    metadata JSONB NOT NULL DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    
    -- Foreign keys
    CONSTRAINT fk_rule_definition_ontology_version 
        FOREIGN KEY (ontology_version_id) 
        REFERENCES ontology_version(id) 
        ON DELETE RESTRICT,
    
    -- Name must be valid identifier
    CONSTRAINT rule_definition_name_format 
        CHECK (name ~ '^[a-z][a-z0-9_]*$')
);

-- Unique name per ontology version
CREATE UNIQUE INDEX idx_rule_definition_name_unique 
    ON rule_definition (ontology_version_id, name) 
    WHERE deleted_at IS NULL;

-- =============================================================================
-- RULE VERSION
-- =============================================================================
-- Immutable snapshot of a rule's logic.
-- Each publication creates a new version.
-- =============================================================================

CREATE TABLE rule_version (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Parent rule
    rule_definition_id UUID NOT NULL,
    
    -- Sequential version number
    version_number INTEGER NOT NULL,
    
    -- Declarative condition (JSON structure)
    -- e.g., { "type": "AND", "conditions": [...] }
    condition_expression JSONB NOT NULL,
    
    -- Event type to emit on false -> true transition
    event_type VARCHAR(100) NOT NULL,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    
    -- Extensible metadata
    metadata JSONB NOT NULL DEFAULT '{}',
    
    -- Foreign keys
    CONSTRAINT fk_rule_version_rule_definition 
        FOREIGN KEY (rule_definition_id) 
        REFERENCES rule_definition(id) 
        ON DELETE RESTRICT,
    
    -- Version number must be positive
    CONSTRAINT rule_version_number_positive 
        CHECK (version_number > 0)
);

-- Unique version per rule
CREATE UNIQUE INDEX idx_rule_version_number_unique 
    ON rule_version (rule_definition_id, version_number);

-- =============================================================================
-- RULE EVALUATION STATE
-- =============================================================================
-- Tracks the result of rule evaluations for transition detection.
-- Scoped by time to support deterministic replay (RE-7).
-- =============================================================================

CREATE TABLE rule_evaluation_state (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- The rule version used for evaluation
    rule_version_id UUID NOT NULL,
    
    -- The object being evaluated (Entity or Relationship)
    target_object_id UUID NOT NULL,
    
    -- Point-in-time for this evaluation
    evaluation_as_of_time TIMESTAMPTZ NOT NULL,
    
    -- Result of the evaluation
    result BOOLEAN NOT NULL,
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Foreign keys
    CONSTRAINT fk_rule_evaluation_state_rule_version 
        FOREIGN KEY (rule_version_id) 
        REFERENCES rule_version(id) 
        ON DELETE CASCADE
);

-- Index for finding previous state during evaluation
CREATE INDEX idx_rule_evaluation_state_lookup 
    ON rule_evaluation_state (rule_version_id, target_object_id, evaluation_as_of_time DESC);

-- =============================================================================
-- DOMAIN EVENT
-- =============================================================================
-- Immutable log of events emitted by rules.
-- Supports idempotency (RE-5).
-- =============================================================================

CREATE TABLE domain_event (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- The rule version that emitted this event
    rule_version_id UUID NOT NULL,
    
    -- The entity version that triggered the event
    entity_version_id UUID NOT NULL,
    
    -- The type of event emitted
    event_type VARCHAR(100) NOT NULL,
    
    -- Event payload (contextual data from the entity snapshot)
    payload JSONB NOT NULL DEFAULT '{}',
    
    -- When the event was emitted
    emitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Point-in-time context
    as_of_time TIMESTAMPTZ NOT NULL,
    
    -- Foreign keys
    CONSTRAINT fk_domain_event_rule_version 
        FOREIGN KEY (rule_version_id) 
        REFERENCES rule_version(id) 
        ON DELETE RESTRICT,
    
    CONSTRAINT fk_domain_event_entity_version 
        FOREIGN KEY (entity_version_id) 
        REFERENCES entity_version(id) 
        ON DELETE RESTRICT,
    
    -- Idempotency constraint (RE-5)
    CONSTRAINT domain_event_idempotency 
        UNIQUE (rule_version_id, entity_version_id, event_type)
);

-- Index for event history
CREATE INDEX idx_domain_event_entity 
    ON domain_event (entity_version_id);

CREATE INDEX idx_domain_event_type 
    ON domain_event (event_type, emitted_at DESC);


-- =============================================================================
-- DELETION RECORD
-- =============================================================================
-- Tracks soft deletions for audit and potential restoration.
-- Separate from audit_log for specialized deletion queries.
-- =============================================================================

CREATE TABLE deletion_record (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- What was deleted
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    
    -- When/who
    deleted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_by UUID,
    
    -- Why
    reason TEXT,
    
    -- State
    restorable BOOLEAN NOT NULL DEFAULT TRUE,  -- Can it be undeleted?
    restored_at TIMESTAMPTZ,
    restored_by UUID,
    
    -- Snapshot of record at deletion (for recovery)
    snapshot JSONB,
    
    -- Context
    context JSONB NOT NULL DEFAULT '{}',
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for finding deletions by record
CREATE INDEX idx_deletion_record_record 
    ON deletion_record (table_name, record_id);

-- Index for restorable records
CREATE INDEX idx_deletion_record_restorable 
    ON deletion_record (table_name, restorable)
    WHERE restorable = TRUE AND restored_at IS NULL;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ontology_version_updated_at
    BEFORE UPDATE ON ontology_version
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_entity_type_updated_at
    BEFORE UPDATE ON entity_type
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_attribute_definition_updated_at
    BEFORE UPDATE ON attribute_definition
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_relationship_type_updated_at
    BEFORE UPDATE ON relationship_type
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_entity_constraint_updated_at
    BEFORE UPDATE ON entity_constraint
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Phase 2A: Runtime object triggers
CREATE TRIGGER trigger_entity_updated_at
    BEFORE UPDATE ON entity
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_relationship_updated_at
    BEFORE UPDATE ON relationship
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Prevent modification of published ontology versions
CREATE OR REPLACE FUNCTION prevent_published_version_modification()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'PUBLISHED' AND NEW.status = 'PUBLISHED' THEN
        -- Allow soft delete even on published versions
        IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
            RETURN NEW;
        END IF;
        RAISE EXCEPTION 'Cannot modify a published ontology version. Create a new version instead.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_prevent_published_version_modification
    BEFORE UPDATE ON ontology_version
    FOR EACH ROW
    EXECUTE FUNCTION prevent_published_version_modification();

-- Set published_at when status changes to PUBLISHED
CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'PUBLISHED' AND OLD.status != 'PUBLISHED' THEN
        NEW.published_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_published_at
    BEFORE UPDATE ON ontology_version
    FOR EACH ROW
    EXECUTE FUNCTION set_published_at();

-- =============================================================================
-- COMMENTS (Documentation)
-- =============================================================================

-- Phase 1A: Metadata layer
COMMENT ON TABLE ontology_version IS 'Versioned snapshots of the ontology schema. Published versions are immutable.';
COMMENT ON TABLE entity_type IS 'Defines classes of entities that can exist. Scoped to an ontology version.';
COMMENT ON TABLE attribute_definition IS 'Defines properties on entity types. Includes data type, validation, and constraints.';
COMMENT ON TABLE relationship_type IS 'Defines relationship types between entity types. Includes cardinality and directionality.';
COMMENT ON TABLE entity_constraint IS 'Defines entity-level constraints spanning multiple attributes. Phase 1B addition.';

-- Phase 2A: Runtime layer
COMMENT ON TABLE entity IS 'Runtime instance of an EntityType. Actual business objects.';
COMMENT ON TABLE entity_version IS 'Immutable snapshot of entity state. Supports version history and temporal queries.';
COMMENT ON TABLE attribute_value IS 'Actual attribute values for an entity version. Uses typed columns for performance.';
COMMENT ON TABLE relationship IS 'Runtime instance of RelationshipType connecting two entities.';
COMMENT ON TABLE relationship_version IS 'Immutable snapshot of relationship state with properties.';

COMMENT ON COLUMN entity_type.name IS 'Machine-readable identifier. Must be snake_case, start with letter.';
COMMENT ON COLUMN attribute_definition.validation_rules IS 'JSON schema for value validation. Structure depends on data_type.';
COMMENT ON COLUMN relationship_type.is_directional IS 'TRUE if A→B differs from B→A. FALSE for symmetric relationships.';
COMMENT ON COLUMN entity_version.valid_from IS 'When this version became valid. For bi-temporal queries.';
COMMENT ON COLUMN entity_version.valid_to IS 'When superseded. NULL means currently valid.';
-- =============================================================================
-- PHASE 6: RULE & EVENT EVALUATION ENGINE
-- =============================================================================
-- Declarative, metadata-driven rule system that evaluates conditions against
-- ontology snapshots and emits immutable domain events.
-- =============================================================================

-- Rule Lifecycle Status
CREATE TYPE rule_status AS ENUM (
    'DRAFT',        -- Mutable, can be edited
    'PUBLISHED',    -- Immutable, in production use
    'DEPRECATED'    -- Superseded, read-only
);

-- Rule Definition
-- Stores the metadata and configuration for a rule.
CREATE TABLE rule_definition (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Parent ontology version (rules are bound to a specific schema context)
    ontology_version_id UUID NOT NULL,
    
    -- Machine-readable identifier
    name VARCHAR(255) NOT NULL,
    
    -- Human-readable name
    display_name VARCHAR(255) NOT NULL,
    
    -- Detailed description
    description TEXT,
    
    -- Lifecycle status
    status rule_status NOT NULL DEFAULT 'DRAFT',
    
    -- Rule configuration (JSON-based ConditionExpression)
    configuration JSONB NOT NULL,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    created_by UUID,
    
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    
    -- Foreign keys
    CONSTRAINT fk_rule_definition_ontology_version 
        FOREIGN KEY (ontology_version_id) 
        REFERENCES ontology_version(id) 
        ON DELETE RESTRICT,
        
    -- Name must be valid identifier
    CONSTRAINT rule_definition_name_format 
        CHECK (name ~ '^[a-z][a-z0-9_]*$')
);

-- Partial unique index: name must be unique per version among non-deleted records
CREATE UNIQUE INDEX idx_rule_definition_version_name_unique 
    ON rule_definition (ontology_version_id, name) 
    WHERE deleted_at IS NULL;

-- Rule Version
-- Immutable snapshots of rules. Only PUBLISHED versions are evaluated.
CREATE TABLE rule_version (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Parent rule definition
    rule_id UUID NOT NULL,
    
    -- Explicit binding to ontology version (for self-contained historical replay)
    ontology_version_id UUID NOT NULL,
    
    -- Sequential version number
    version_number INTEGER NOT NULL,
    
    -- Rule configuration at this point in time
    configuration JSONB NOT NULL,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    
    -- Foreign keys
    CONSTRAINT fk_rule_version_rule 
        FOREIGN KEY (rule_id) 
        REFERENCES rule_definition(id) 
        ON DELETE RESTRICT,
        
    CONSTRAINT fk_rule_version_ontology_version 
        FOREIGN KEY (ontology_version_id) 
        REFERENCES ontology_version(id) 
        ON DELETE RESTRICT,
        
    -- Version number must be positive
    CONSTRAINT rule_version_number_positive 
        CHECK (version_number > 0),
        
    -- Unique version number per rule
    CONSTRAINT rule_version_number_unique 
        UNIQUE (rule_id, version_number)
);

-- Rule Evaluation State
-- Tracks the result of rule evaluations for specific objects at specific times.
-- Used for transition detection (e.g., false -> true).
CREATE TABLE rule_evaluation_state (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Rule version used for evaluation
    rule_version_id UUID NOT NULL,
    
    -- Target object being evaluated
    target_object_id UUID NOT NULL,
    
    -- Type of target object (future-proofing for relationships)
    target_object_type VARCHAR(50) NOT NULL, -- 'ENTITY', 'RELATIONSHIP'
    
    -- Point-in-time for the evaluation
    evaluation_as_of_time TIMESTAMPTZ NOT NULL,
    
    -- Evaluation result
    result BOOLEAN NOT NULL,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Foreign keys
    CONSTRAINT fk_rule_evaluation_state_rule_version 
        FOREIGN KEY (rule_version_id) 
        REFERENCES rule_version(id) 
        ON DELETE RESTRICT,
        
    -- Uniqueness constraint for determinism and history tracking
    CONSTRAINT rule_evaluation_state_uniqueness 
        UNIQUE (rule_version_id, target_object_id, evaluation_as_of_time),
        
    -- Valid object types
    CONSTRAINT rule_evaluation_target_type_check 
        CHECK (target_object_type IN ('ENTITY', 'RELATIONSHIP'))
);

-- Index for historical replay queries
CREATE INDEX idx_rule_evaluation_state_history 
    ON rule_evaluation_state (target_object_id, rule_version_id, evaluation_as_of_time DESC);

-- Domain Event
-- Immutable, append-only log of events emitted by the rule engine.
CREATE TABLE domain_event (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Rule version that triggered the event
    rule_version_id UUID NOT NULL,
    
    -- Entity version that triggered the event (rules evaluate against snapshots)
    entity_version_id UUID NOT NULL,
    
    -- Type of event (e.g., 'STATUS_CHANGED', 'THRESHOLD_EXCEEDED')
    event_type VARCHAR(255) NOT NULL,
    
    -- Event payload
    payload JSONB NOT NULL DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    
    -- Foreign keys
    CONSTRAINT fk_domain_event_rule_version 
        FOREIGN KEY (rule_version_id) 
        REFERENCES rule_version(id) 
        ON DELETE RESTRICT,
        
    CONSTRAINT fk_domain_event_entity_version 
        FOREIGN KEY (entity_version_id) 
        REFERENCES entity_version(id) 
        ON DELETE RESTRICT,
        
    -- Idempotency: ensure no duplicate events for the same rule/entity version/type
    CONSTRAINT domain_event_idempotency 
        UNIQUE (rule_version_id, entity_version_id, event_type)
);

-- Index for event stream queries
CREATE INDEX idx_domain_event_rule_version ON domain_event (rule_version_id);
CREATE INDEX idx_domain_event_entity_version ON domain_event (entity_version_id);
CREATE INDEX idx_domain_event_created_at ON domain_event (created_at);

-- =============================================================================
-- PHASE 7: WORKFLOW & HUMAN-IN-THE-LOOP ENGINE
-- =============================================================================
-- Declarative workflow system that manages multi-step processes and
-- human-in-the-loop interactions.
-- =============================================================================

-- Workflow Lifecycle Status
CREATE TYPE workflow_status AS ENUM (
    'DRAFT',        -- Mutable, can be edited
    'PUBLISHED',    -- Immutable, in production use
    'DEPRECATED'    -- Superseded, read-only
);

-- Workflow Definition
-- Stores the metadata and configuration for a workflow.
CREATE TABLE workflow_definition (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Parent ontology version (workflows are bound to a specific schema context)
    ontology_version_id UUID NOT NULL,
    
    -- Machine-readable identifier
    name VARCHAR(255) NOT NULL,
    
    -- Human-readable name
    display_name VARCHAR(255) NOT NULL,
    
    -- Detailed description
    description TEXT,
    
    -- Lifecycle status
    status workflow_status NOT NULL DEFAULT 'DRAFT',
    
    -- Trigger configuration (JSON-based event matching criteria)
    trigger_config JSONB NOT NULL,
    
    -- Steps definition (JSON-based list of WorkflowStep)
    steps JSONB NOT NULL,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    created_by UUID,
    
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    
    -- Foreign keys
    CONSTRAINT fk_workflow_definition_ontology_version 
        FOREIGN KEY (ontology_version_id) 
        REFERENCES ontology_version(id) 
        ON DELETE RESTRICT,
        
    -- Name must be valid identifier
    CONSTRAINT workflow_definition_name_format 
        CHECK (name ~ '^[a-z][a-z0-9_]*$')
);

-- Partial unique index: name must be unique per version among non-deleted records
CREATE UNIQUE INDEX idx_workflow_definition_version_name_unique 
    ON workflow_definition (ontology_version_id, name) 
    WHERE deleted_at IS NULL;

-- Workflow Version
-- Immutable snapshots of workflows.
CREATE TABLE workflow_version (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Parent workflow definition
    workflow_id UUID NOT NULL,
    
    -- Explicit binding to ontology version (for self-contained historical replay)
    ontology_version_id UUID NOT NULL,
    
    -- Sequential version number
    version_number INTEGER NOT NULL,
    
    -- Configuration at this point in time
    trigger_config JSONB NOT NULL,
    steps JSONB NOT NULL,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    
    -- Foreign keys
    CONSTRAINT fk_workflow_version_workflow 
        FOREIGN KEY (workflow_id) 
        REFERENCES workflow_definition(id) 
        ON DELETE RESTRICT,
        
    CONSTRAINT fk_workflow_version_ontology_version 
        FOREIGN KEY (ontology_version_id) 
        REFERENCES ontology_version(id) 
        ON DELETE RESTRICT,
        
    -- Version number must be positive
    CONSTRAINT workflow_version_number_positive 
        CHECK (version_number > 0),
        
    -- Unique version number per workflow
    CONSTRAINT workflow_version_number_unique 
        UNIQUE (workflow_id, version_number)
);

-- Workflow Instance (Runtime)
-- Represents a single execution of a workflow.
CREATE TABLE workflow_instance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Workflow version used for this execution
    workflow_version_id UUID NOT NULL,
    
    -- Event that triggered this instance
    trigger_event_id UUID NOT NULL,
    
    -- Explicit reference to the subject being processed (RE-2)
    subject_entity_version_id UUID NOT NULL,
    
    -- Current status (WF-5)
    status VARCHAR(50) NOT NULL DEFAULT 'RUNNING',
    
    -- Current active step ID
    current_step_id VARCHAR(255),
    
    -- Variable storage for the instance
    context JSONB NOT NULL DEFAULT '{}',
    
    -- Audit fields
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    
    -- Foreign keys
    CONSTRAINT fk_workflow_instance_version 
        FOREIGN KEY (workflow_version_id) 
        REFERENCES workflow_version(id) 
        ON DELETE RESTRICT,
        
    CONSTRAINT fk_workflow_instance_trigger_event 
        FOREIGN KEY (trigger_event_id) 
        REFERENCES domain_event(id) 
        ON DELETE RESTRICT,
        
    CONSTRAINT fk_workflow_instance_subject 
        FOREIGN KEY (subject_entity_version_id) 
        REFERENCES entity_version(id) 
        ON DELETE RESTRICT,
        
    -- Valid statuses
    CONSTRAINT workflow_instance_status_check 
        CHECK (status IN ('RUNNING', 'WAITING', 'COMPLETED', 'FAILED', 'CANCELLED'))
);

-- Index for instance lookups
CREATE INDEX idx_workflow_instance_status ON workflow_instance (status);
CREATE INDEX idx_workflow_instance_subject ON workflow_instance (subject_entity_version_id);

-- Workflow Step Execution (Append-only)
-- Records each step execution for auditability and resumability.
CREATE TABLE workflow_step_execution (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Parent instance
    workflow_instance_id UUID NOT NULL,
    
    -- Step ID from the workflow definition
    step_id VARCHAR(255) NOT NULL,
    
    -- Status of this step execution
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    
    -- Input data for the step
    input JSONB,
    
    -- Output data from the step
    output JSONB,
    
    -- Audit fields
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    
    -- Foreign keys
    CONSTRAINT fk_workflow_step_execution_instance 
        FOREIGN KEY (workflow_instance_id) 
        REFERENCES workflow_instance(id) 
        ON DELETE RESTRICT,
        
    -- Valid statuses
    CONSTRAINT workflow_step_status_check 
        CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'SKIPPED'))
);

-- Human Task
-- Represents a manual intervention step in a workflow.
CREATE TABLE human_task (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Step execution that created this task
    step_execution_id UUID NOT NULL,
    
    -- Assigned user or group
    assignee_id UUID,
    
    -- Current status
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    
    -- Decision made by the human (JSON structure)
    decision JSONB,
    
    -- Temporal constraints
    due_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Foreign keys
    CONSTRAINT fk_human_task_step_execution 
        FOREIGN KEY (step_execution_id) 
        REFERENCES workflow_step_execution(id) 
        ON DELETE RESTRICT,
        
    -- Valid statuses
    CONSTRAINT human_task_status_check 
        CHECK (status IN ('PENDING', 'COMPLETED', 'REJECTED', 'EXPIRED'))
);

-- Index for task management
CREATE INDEX idx_human_task_assignee_status ON human_task (assignee_id, status);
CREATE INDEX idx_human_task_due_at ON human_task (due_at) WHERE status = 'PENDING';

-- =============================================================================
-- PHASE 8: ACTION & INTEGRATION ENGINE
-- =============================================================================
-- This section defines the execution layer for external integrations.
-- Actions are decoupled from workflows, versioned, and support idempotency.
-- =============================================================================

-- Connector types for external integrations
CREATE TYPE connector_type AS ENUM (
    'REST',
    'SQL',
    'SCRIPT',
    'EMAIL',
    'WEBHOOK'
);

-- Action definition lifecycle status
CREATE TYPE action_definition_status AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'DEPRECATED'
);

-- Action intent lifecycle status
CREATE TYPE action_intent_status AS ENUM (
    'PENDING',      -- Created, waiting for worker
    'PROCESSING',   -- Claimed by worker
    'SUCCESS',      -- Successfully executed (Terminal)
    'FAILED',       -- Failed after all retries (Terminal)
    'CANCELLED'     -- Manually cancelled (Terminal)
);

-- Execution attempt status
CREATE TYPE execution_attempt_status AS ENUM (
    'SUCCESS',
    'FAILURE'
);

-- Action Definition (Root)
CREATE TABLE action_definition (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ontology_version_id UUID NOT NULL,
    
    -- Machine-readable identifier
    name VARCHAR(255) NOT NULL,
    
    -- Human-readable name
    display_name VARCHAR(255) NOT NULL,
    
    -- Detailed description
    description TEXT,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Foreign keys
    CONSTRAINT fk_action_definition_ontology_version 
        FOREIGN KEY (ontology_version_id) 
        REFERENCES ontology_version(id) 
        ON DELETE RESTRICT,
        
    -- Name must be valid identifier
    CONSTRAINT action_definition_name_format 
        CHECK (name ~ '^[a-z][a-z0-9_]*$')
);

-- Partial unique index: name must be unique per version
CREATE UNIQUE INDEX idx_action_definition_version_name_unique 
    ON action_definition (ontology_version_id, name) 
    WHERE deleted_at IS NULL;

-- Action Definition Version (Immutable Snapshot)
CREATE TABLE action_definition_version (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action_definition_id UUID NOT NULL,
    version_number INTEGER NOT NULL,
    
    -- Connector configuration
    connector_type connector_type NOT NULL,
    connector_config JSONB NOT NULL DEFAULT '{}',
    
    -- Input validation
    input_schema JSONB NOT NULL DEFAULT '{}',
    
    -- Retry policy
    retry_policy JSONB NOT NULL DEFAULT '{
        "max_retries": 3,
        "backoff_ms": 1000,
        "backoff_multiplier": 2
    }',
    
    -- Lifecycle
    status action_definition_status NOT NULL DEFAULT 'DRAFT',
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    
    -- Foreign keys
    CONSTRAINT fk_action_definition_version_root 
        FOREIGN KEY (action_definition_id) 
        REFERENCES action_definition(id) 
        ON DELETE RESTRICT,
        
    -- Version number must be positive
    CONSTRAINT action_definition_version_number_positive 
        CHECK (version_number > 0)
);

-- Unique version number per action
CREATE UNIQUE INDEX idx_action_definition_version_number 
    ON action_definition_version (action_definition_id, version_number);

-- Action Intent (Immutable Request)
CREATE TABLE action_intent (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action_definition_version_id UUID NOT NULL,
    
    -- Workflow context
    workflow_instance_id UUID,
    workflow_step_execution_id UUID,
    
    -- Idempotency (Enforced at DB level)
    idempotency_key VARCHAR(500) NOT NULL,
    
    -- Input data
    input_data JSONB NOT NULL DEFAULT '{}',
    
    -- Status & Locking
    status action_intent_status NOT NULL DEFAULT 'PENDING',
    locked_by VARCHAR(255),
    locked_at TIMESTAMPTZ,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Foreign keys
    CONSTRAINT fk_action_intent_version 
        FOREIGN KEY (action_definition_version_id) 
        REFERENCES action_definition_version(id) 
        ON DELETE RESTRICT,
        
    CONSTRAINT fk_action_intent_workflow_instance 
        FOREIGN KEY (workflow_instance_id) 
        REFERENCES workflow_instance(id) 
        ON DELETE SET NULL,
        
    CONSTRAINT fk_action_intent_step_execution 
        FOREIGN KEY (workflow_step_execution_id) 
        REFERENCES workflow_step_execution(id) 
        ON DELETE SET NULL,
        
    -- Idempotency constraint: unique key per action version
    CONSTRAINT action_intent_idempotency_unique 
        UNIQUE (action_definition_version_id, idempotency_key)
);

-- Index for worker polling
CREATE INDEX idx_action_intent_pending_worker 
    ON action_intent (status, created_at) 
    WHERE status = 'PENDING';

-- Action Execution Attempt (Append-only History)
CREATE TABLE action_execution_attempt (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action_intent_id UUID NOT NULL,
    attempt_number INTEGER NOT NULL,
    
    -- Result
    status execution_attempt_status NOT NULL,
    output_data JSONB,
    error_details JSONB,
    
    -- Audit fields
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    performed_by VARCHAR(255) NOT NULL,
    
    -- Foreign keys
    CONSTRAINT fk_action_execution_attempt_intent 
        FOREIGN KEY (action_intent_id) 
        REFERENCES action_intent(id) 
        ON DELETE CASCADE,
        
    -- Attempt number must be positive
    CONSTRAINT action_execution_attempt_number_positive 
        CHECK (attempt_number > 0)
);

-- Unique attempt number per intent
CREATE UNIQUE INDEX idx_action_execution_attempt_number 
    ON action_execution_attempt (action_intent_id, attempt_number);
-- =============================================================================
-- PHASE 9: AI REASONING LAYER
-- =============================================================================
-- This section defines the reasoning layer for AI-driven insights.
-- Reasoning is read-only, deterministic, and explainable.
-- =============================================================================

-- Reasoning session status
CREATE TYPE reasoning_session_status AS ENUM (
    'ACTIVE',
    'FINALIZED',
    'ABORTED'
);

-- AI Reasoning Session (Immutable Snapshot)
CREATE TABLE ai_reasoning_session (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ontology_version_id UUID NOT NULL,
    
    -- Deterministic time scope
    as_of TIMESTAMPTZ NOT NULL,
    
    -- Context
    initiated_by UUID NOT NULL,
    status reasoning_session_status NOT NULL DEFAULT 'ACTIVE',
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finalized_at TIMESTAMPTZ,
    
    -- Foreign keys
    CONSTRAINT fk_ai_session_ontology_version 
        FOREIGN KEY (ontology_version_id) 
        REFERENCES ontology_version(id) 
        ON DELETE RESTRICT
);

-- AI Recommendation (Explainable Output)
CREATE TABLE ai_recommendation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL,
    
    -- Semantic proposal (AR-8: not executable)
    action_proposal JSONB NOT NULL,
    
    -- Structured explanation trace (AR-7: no thought)
    explanation_trace JSONB NOT NULL,
    
    -- Simulation results (AR-9: rule + workflow dry-run)
    simulation_result JSONB NOT NULL,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Foreign keys
    CONSTRAINT fk_ai_recommendation_session 
        FOREIGN KEY (session_id) 
        REFERENCES ai_reasoning_session(id) 
        ON DELETE CASCADE
);

-- AI Simulation Log (Audit of dry-runs)
CREATE TABLE ai_simulation_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recommendation_id UUID NOT NULL,
    
    -- Detailed dry-run trace
    triggered_workflows JSONB NOT NULL DEFAULT '[]',
    fired_rules JSONB NOT NULL DEFAULT '[]',
    blocking_steps JSONB NOT NULL DEFAULT '[]',
    
    -- Predicted state
    predicted_state JSONB NOT NULL DEFAULT '{}',
    
    -- Audit fields
    performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Foreign keys
    CONSTRAINT fk_ai_simulation_recommendation 
        FOREIGN KEY (recommendation_id) 
        REFERENCES ai_recommendation(id) 
        ON DELETE CASCADE
);

-- AI Tool Access Log (AR-6: for auditability)
CREATE TABLE ai_tool_access_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL,
    
    -- Tool details
    tool_name VARCHAR(255) NOT NULL,
    input_data JSONB NOT NULL,
    output_data JSONB NOT NULL,
    
    -- Audit fields
    accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Foreign keys
    CONSTRAINT fk_ai_tool_log_session 
        FOREIGN KEY (session_id) 
        REFERENCES ai_reasoning_session(id) 
        ON DELETE CASCADE
);

-- Index for session management
CREATE INDEX idx_ai_session_status ON ai_reasoning_session (status);
CREATE INDEX idx_ai_recommendation_session ON ai_recommendation (session_id);
