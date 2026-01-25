/**
 * =============================================================================
 * INGESTION FABRIC TYPES
 * Phase 22 - Data Ingestion & Streaming
 * =============================================================================
 * 
 * Defines the core data models for the ingestion fabric, ensuring external data
 * enters the platform safely as "Candidate Truth" before being promoted to
 * actual entities.
 */

import { Brand, EntityTypeId, UserId } from '../types.js';

// =============================================================================
// BRANDED TYPES
// =============================================================================

export type IngestionSourceId = Brand<string, 'IngestionSourceId'>;
export type IngestionSourceVersionId = Brand<string, 'IngestionSourceVersionId'>;
export type IngestionEventId = Brand<string, 'IngestionEventId'>;
export type CandidateTruthId = Brand<string, 'CandidateTruthId'>;

// =============================================================================
// ENUMS
// =============================================================================

export enum IngestionSourceType {
    API = 'API',
    STREAM = 'STREAM',
    FILE = 'FILE',
    WEBHOOK = 'WEBHOOK',
    MANUAL = 'MANUAL'
}

export enum IngestionSourceStatus {
    ACTIVE = 'ACTIVE',
    PAUSED = 'PAUSED',
    DEPRECATED = 'DEPRECATED'
}

export enum IngestionEventStatus {
    RECEIVED = 'RECEIVED',
    VALIDATED = 'VALIDATED',
    REJECTED = 'REJECTED',
    PROCESSED = 'PROCESSED'
}

export enum CandidateType {
    ENTITY = 'ENTITY',
    RELATIONSHIP = 'RELATIONSHIP',
    ATTRIBUTE_CHANGE = 'ATTRIBUTE_CHANGE'
}

// =============================================================================
// MAPPING & NORMALIZATION
// =============================================================================

/**
 * Declarative rules for mapping external data to ontology structures.
 */
export interface MappingRules {
    /** Target entity type this mapping produces */
    target_entity_type_id: EntityTypeId;

    /** Field mappings: Target Attribute Name -> Source Path / Config */
    field_mappings: Record<string, FieldMapping>;
}

export type FieldMapping =
    | string // Simple path mapping (e.g., "user.name")
    | ComplexFieldMapping;

export interface ComplexFieldMapping {
    /** Path to value in source JSON (dot notation supported) */
    source_path?: string;

    /** Static value to use if source_path is missing or not provided */
    static_value?: unknown;

    /** Default value if source value is null/undefined */
    default_value?: unknown;

    /** Transform function name (e.g., "toUpperCase", "parseDate") - strictly controlled list */
    transform?: string;
}

// =============================================================================
// DOMAIN MODELS
// =============================================================================

/**
 * Represents a source of external data.
 */
export interface IngestionSource {
    readonly id: IngestionSourceId;
    readonly tenant_id: string;

    name: string;
    description: string | null;
    source_type: IngestionSourceType;
    status: IngestionSourceStatus;

    readonly created_at: Date;
    readonly created_by: UserId | null;
}

/**
 * Immutable configuration snapshot for an ingestion source.
 * Contains the specific mapping rules used at a point in time.
 */
export interface IngestionSourceVersion {
    readonly id: IngestionSourceVersionId;
    readonly ingestion_source_id: IngestionSourceId;

    /** The mapping rules active for this version */
    mapping_rules: MappingRules;

    readonly created_at: Date;
    readonly created_by: UserId | null;
}

/**
 * An immutable record of a raw data payload entering the system.
 * This is the "Ground Truth" of what was received.
 */
export interface IngestionEvent {
    readonly id: IngestionEventId;
    readonly tenant_id: string;

    /** Reference to the configuration used to process this event */
    readonly source_version_id: IngestionSourceVersionId;

    /** When the payload was received */
    readonly received_at: Date;

    /** The raw, untouched payload */
    readonly raw_payload: Record<string, unknown>;

    /** SHA-256 checksum of raw_payload for idempotency */
    readonly checksum: string;

    /** Current processing status */
    status: IngestionEventStatus;

    /** If rejected, contains validation errors */
    validation_errors?: unknown[];

    /** IDs of CandidateTruth objects produced (if processed) */
    candidate_ids?: CandidateTruthId[];
}

/**
 * A proposed change to the ontology, derived from an IngestionEvent.
 * These are NOT entities and cannot be queried as such.
 * They exist solely for review and approval workflows.
 */
export interface CandidateTruth {
    readonly id: CandidateTruthId;
    readonly tenant_id: string;

    candidate_type: CandidateType;

    /** The normalized data proposed for the ontology */
    proposed_data: Record<string, unknown>;

    /** Link back to the source event */
    readonly derived_from_event_id: IngestionEventId;

    readonly created_at: Date;
}
