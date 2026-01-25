/**
 * =============================================================================
 * REPLAY VERIFICATION
 * =============================================================================
 * 
 * Ensures replay context matches original ontology state by comparing
 * snapshot hashes.
 * 
 * INVARIANTS:
 * - Replay must use same ontology version
 * - Snapshot hash must match stored hash
 * - Mismatch surfaces warning (does not block)
 */

import { OntologyVersionId } from '../ontology/definition/ontology-definition-types';
import { ontologySnapshotHasher } from '../ontology/definition/OntologySnapshotHash';
import { ontologySnapshotResolver } from '../ontology/definition/OntologySnapshotResolver';

export interface ReplayVerificationResult {
    is_valid: boolean;
    expected_hash: string | null;
    actual_hash: string;
    ontology_version_id: OntologyVersionId;
    warning?: string;
}

export class ReplayVerificationEngine {
    /**
     * Verify replay context against stored ontology snapshot hash.
     * 
     * @param ontologyVersionId - Version being replayed
     * @param asOf - Time point of replay
     * @param tenantId - Tenant context
     * @param storedHash - Hash stored at original replay creation time
     * @returns Verification result with warning if mismatch
     */
    public verifyReplayContext(
        ontologyVersionId: OntologyVersionId,
        asOf: Date,
        tenantId: string,
        storedHash: string | null
    ): ReplayVerificationResult {
        // Resolve current snapshot
        const snapshot = ontologySnapshotResolver.resolveSnapshot(
            ontologyVersionId,
            asOf,
            tenantId
        );

        // Compute current hash
        const hashResult = ontologySnapshotHasher.computeHash(snapshot);
        const actualHash = hashResult.snapshot_hash;

        // Compare hashes
        const isValid = storedHash === null || storedHash === actualHash;

        const result: ReplayVerificationResult = {
            is_valid: isValid,
            expected_hash: storedHash,
            actual_hash: actualHash,
            ontology_version_id: ontologyVersionId
        };

        if (!isValid) {
            result.warning = `Replay context diverged from original ontology state. Expected hash: ${storedHash}, Actual hash: ${actualHash}. Ontology may have been modified since replay creation.`;
        }

        return result;
    }

    /**
     * Verify replay session before execution.
     * Logs warning but does not block.
     */
    public verifyReplaySession(
        ontologyVersionId: OntologyVersionId,
        asOf: Date,
        tenantId: string,
        storedHash: string | null
    ): void {
        const result = this.verifyReplayContext(
            ontologyVersionId,
            asOf,
            tenantId,
            storedHash
        );

        if (!result.is_valid && result.warning) {
            console.warn('[ReplayVerification]', result.warning);
        }
    }
}

export const replayVerificationEngine = new ReplayVerificationEngine();
