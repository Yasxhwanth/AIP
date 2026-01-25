/**
 * =============================================================================
 * HISTORY & AUDIT UTILITIES
 * Phase 2B - Ontology Versioning & History
 * =============================================================================
 * 
 * Utilities for historical reconstruction and temporal queries.
 * These functions define the interface for time-travel queries.
 * =============================================================================
 */

import type {
    EntityId,
    EntityVersion,
    AttributeValue,
    AuditLog,
    DeletionRecord,
} from './types.js';

/**
 * Parameters for a historical query.
 */
export interface HistoricalQuery {
    /** The entity to query */
    entityId: EntityId;

    /** 
     * The point in time to reconstruct state for.
     * If null, returns the current state.
     */
    asOfTime: Date | null;
}

/**
 * Represents the reconstructed state of an entity at a specific point in time.
 */
export interface ReconstructedEntityState {
    /** The version record valid at that time */
    version: EntityVersion;

    /** The attribute values valid at that time */
    attributes: AttributeValue[];

    /** Whether the entity was deleted at that time */
    isDeleted: boolean;

    /** If deleted, the deletion record */
    deletionRecord: DeletionRecord | null;
}

/**
 * Interface for a history service that can reconstruct state.
 * Implementation would connect to the database.
 */
export interface HistoryService {
    /**
     * Reconstructs the full state of an entity at a specific point in time.
     * 
     * Logic:
     * 1. Find entity_version where valid_from <= time < valid_to
     * 2. If no version found, check deletion_record
     * 3. If version found, load attribute_values for that version
     */
    reconstructEntityAtTime(query: HistoricalQuery): Promise<ReconstructedEntityState | null>;

    /**
     * Retrieves the full audit history for an entity.
     * Returns chronological list of all operations (CREATE, UPDATE, DELETE, RESTORE).
     */
    getEntityHistory(entityId: EntityId): Promise<AuditLog[]>;

    /**
     * Retrieves the version history (metadata only).
     */
    getVersionHistory(entityId: EntityId): Promise<EntityVersion[]>;
}

/**
 * Helper to check if a version was valid at a specific time.
 */
export function isVersionValidAt(
    version: EntityVersion,
    time: Date
): boolean {
    const validFrom = new Date(version.valid_from).getTime();
    const validTo = version.valid_to ? new Date(version.valid_to).getTime() : Infinity;
    const queryTime = time.getTime();

    return queryTime >= validFrom && queryTime < validTo;
}
