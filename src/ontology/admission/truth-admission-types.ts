/**
 * =============================================================================
 * TRUTH ADMISSION TYPES
 * Phase 23 - Truth Admission & Review Engine
 * =============================================================================
 * 
 * Defines the data models for the governed admission layer.
 * Ensures that CandidateTruth objects are reviewed and explicitly approved
 * before becoming part of the ontology.
 */

import { Brand, UserId, EntityId, RelationshipTypeId, RelationshipId } from '../types';
import { CandidateTruthId } from '../ingestion/ingestion-types';

// =============================================================================
// RELATIONSHIP ADMISSION TYPES (Phase 2 - Relationship as First-Class Truth)
// =============================================================================

export type RelationshipCandidateTruthId = Brand<string, 'RelationshipCandidateTruthId'>;
export type RelationshipAdmissionCaseId = Brand<string, 'RelationshipAdmissionCaseId'>;

// =============================================================================
// BRANDED TYPES
// =============================================================================

export type AdmissionCaseId = Brand<string, 'AdmissionCaseId'>;
export type AdmissionDecisionId = Brand<string, 'AdmissionDecisionId'>;

// =============================================================================
// ENUMS
// =============================================================================

export enum AdmissionStatus {
    PENDING = 'PENDING',
    RESOLVED = 'RESOLVED'
}

export enum AdmissionDecision {
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

// =============================================================================
// DOMAIN MODELS
// =============================================================================

/**
 * Represents a review case for a CandidateTruth.
 * This is the object that users interact with in the UI.
 */
export interface AdmissionCase {
    readonly id: AdmissionCaseId;
    readonly tenant_id: string;

    /** The candidate truth being reviewed */
    readonly candidate_id: CandidateTruthId;

    /** Current status of the case */
    status: AdmissionStatus;

    /** The computed difference between candidate and current truth */
    readonly diff: AdmissionDiff;

    readonly created_at: Date;

    /** Final resolution if status is RESOLVED */
    resolution: AdmissionResolution | null;
}

/**
 * Represents the difference between the proposed candidate and the existing entity (if any).
 */
export interface AdmissionDiff {
    /** ID of the existing entity, if this candidate matches one */
    readonly entity_id?: string;

    /** True if this candidate proposes creating a new entity */
    readonly is_new_entity: boolean;

    /** Map of field names to their old and new values */
    readonly changes: Record<string, DiffChange>;
}

export interface DiffChange {
    old: unknown;
    new: unknown;
}

/**
 * The final decision made on an admission case.
 */
export interface AdmissionResolution {
    readonly decision: AdmissionDecision;

    /** Mandatory explanation for the decision */
    readonly justification: string;

    readonly decided_by: UserId;
    readonly performed_by_session_id?: string;
    readonly authority_snapshot_id?: string;
    readonly decided_at: Date;

    /** Link to the immutable journal entry */
    readonly decision_journal_id: string;
}

// =============================================================================
// RELATIONSHIP AS FIRST-CLASS TRUTH (Phase 2 - Ontology Roadmap)
// =============================================================================

/**
 * Type of candidate being proposed for admission.
 */
export enum CandidateType {
    /** Entity candidate (object in the ontology) */
    ENTITY = 'ENTITY',
    /** Relationship candidate (link between objects) */
    RELATIONSHIP = 'RELATIONSHIP'
}

/**
 * Proposed relationship truth awaiting admission.
 * Similar to CandidateTruth but specifically for relationships.
 */
export interface RelationshipCandidateTruth {
    readonly id: RelationshipCandidateTruthId;
    readonly tenant_id: string;

    /** Type of relationship being proposed */
    readonly relationship_type_id: RelationshipTypeId;

    /** Source entity of the relationship */
    readonly source_entity_id: EntityId;

    /** Target entity of the relationship */
    readonly target_entity_id: EntityId;

    /** Properties of the relationship (weights, labels, etc.) */
    readonly proposed_properties: Record<string, unknown>;

    /** Timestamp when first validity starts (default: now) */
    readonly proposed_valid_from?: Date;

    /** Timestamp when validity ends (null = indefinite) */
    readonly proposed_valid_to?: Date | null;

    /** Whether this is updating an existing relationship */
    readonly existing_relationship_id?: RelationshipId;

    /** ID of the ingestion event that created this candidate */
    readonly derived_from_event_id?: string;

    readonly created_at: Date;
}

/**
 * Represents a review case for a RelationshipCandidateTruth.
 * Parallel to AdmissionCase but for relationships.
 */
export interface RelationshipAdmissionCase {
    readonly id: RelationshipAdmissionCaseId;
    readonly tenant_id: string;

    /** The relationship candidate being reviewed */
    readonly candidate_id: RelationshipCandidateTruthId;

    /** Current status of the case */
    status: AdmissionStatus;

    /** The computed difference between candidate and current relationship */
    readonly diff: RelationshipAdmissionDiff;

    readonly created_at: Date;

    /** Final resolution if status is RESOLVED */
    resolution: AdmissionResolution | null;
}

/**
 * Represents the difference between the proposed relationship and existing one (if any).
 */
export interface RelationshipAdmissionDiff {
    /** ID of the existing relationship, if this candidate updates one */
    readonly relationship_id?: RelationshipId;

    /** True if this candidate proposes creating a new relationship */
    readonly is_new_relationship: boolean;

    /** Source entity currently exists and is valid */
    readonly source_entity_valid: boolean;

    /** Target entity currently exists and is valid */
    readonly target_entity_valid: boolean;

    /** Changes to relationship properties (old vs new values) */
    readonly property_changes: Record<string, DiffChange>;

    /** Changes to temporal validity */
    readonly validity_changes?: {
        valid_from?: DiffChange;
        valid_to?: DiffChange;
    };

    /** Cardinality validation result */
    readonly cardinality_check?: {
        source_count: number;
        target_count: number;
        source_max?: number | null;
        target_max?: number | null;
        would_violate: boolean;
    };
}

/**
 * Combined admission case that can be entity or relationship.
 * Useful for unified admission queues.
 */
export interface UnifiedAdmissionCase {
    readonly id: string;
    readonly tenant_id: string;
    readonly type: CandidateType;
    readonly case: AdmissionCase | RelationshipAdmissionCase;
    readonly created_at: Date;
    readonly status: AdmissionStatus;
}
