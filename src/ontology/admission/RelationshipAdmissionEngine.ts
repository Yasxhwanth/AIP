/**
 * =============================================================================
 * RELATIONSHIP ADMISSION ENGINE
 * Phase 2 - Relationship as First-Class Truth (Ontology Roadmap)
 * =============================================================================
 * 
 * Responsibilities:
 * - Create Admission Cases from RelationshipCandidateTruth
 * - Compute diffs between proposed and existing relationships
 * - Validate cardinality constraints
 * - Check source/target entity validity
 * - Record decisions via DecisionJournalManager
 * 
 * INVARIANTS:
 * - NEVER mutates the ontology directly.
 * - NEVER creates RelationshipVersions.
 * - ONLY updates RelationshipAdmissionCase status and records decisions.
 * - Relationships require authority just like entities.
 */

import {
    RelationshipAdmissionCase,
    RelationshipAdmissionCaseId,
    RelationshipCandidateTruth,
    RelationshipCandidateTruthId,
    RelationshipAdmissionDiff,
    AdmissionStatus,
    AdmissionDecision,
    AdmissionResolution,
    DiffChange
} from './truth-admission-types';
import {
    Relationship,
    RelationshipVersion,
    RelationshipId,
    EntityId,
    RelationshipTypeId
} from '../types';
import { ontologyStore } from '../OntologyStore';
import { decisionManager } from '../../decision/DecisionJournalManager';
import { DecisionJournalInput } from '../../decision/decision-types';
import { TenantContextManager } from '../../tenant/TenantContext';
import { IdentityContext } from '../../identity/IdentityContext';
import { authorityGraphEngine } from '../../authority/AuthorityGraphEngine';

export class RelationshipAdmissionEngine {
    // In-memory store for relationship candidates
    private candidateStore: Map<string, RelationshipCandidateTruth> = new Map();
    // In-memory store for relationship admission cases
    private caseStore: Map<string, RelationshipAdmissionCase> = new Map();

    /**
     * Creates a new relationship candidate truth.
     * This is the entry point for proposing a new or updated relationship.
     */
    public createCandidate(
        tenantId: string,
        relationshipTypeId: RelationshipTypeId,
        sourceEntityId: EntityId,
        targetEntityId: EntityId,
        proposedProperties: Record<string, unknown>,
        options?: {
            validFrom?: Date;
            validTo?: Date | null;
            existingRelationshipId?: RelationshipId;
            derivedFromEventId?: string;
        }
    ): RelationshipCandidateTruth {
        const candidate: RelationshipCandidateTruth = {
            id: crypto.randomUUID() as RelationshipCandidateTruthId,
            tenant_id: tenantId,
            relationship_type_id: relationshipTypeId,
            source_entity_id: sourceEntityId,
            target_entity_id: targetEntityId,
            proposed_properties: proposedProperties,
            proposed_valid_from: options?.validFrom,
            proposed_valid_to: options?.validTo,
            existing_relationship_id: options?.existingRelationshipId,
            derived_from_event_id: options?.derivedFromEventId,
            created_at: new Date()
        };

        this.candidateStore.set(candidate.id, candidate);
        return candidate;
    }

    /**
     * Creates a new admission case for a relationship candidate.
     */
    public createAdmissionCase(
        candidate: RelationshipCandidateTruth,
        currentRelationship?: Relationship
    ): RelationshipAdmissionCase {
        const diff = this.computeDiff(candidate, currentRelationship);

        const admissionCase: RelationshipAdmissionCase = {
            id: crypto.randomUUID() as RelationshipAdmissionCaseId,
            tenant_id: candidate.tenant_id,
            candidate_id: candidate.id,
            status: AdmissionStatus.PENDING,
            diff: diff,
            created_at: new Date(),
            resolution: null
        };

        this.persistCase(admissionCase);
        return admissionCase;
    }

    /**
     * Computes the difference between the proposed relationship and the existing one.
     */
    public computeDiff(
        candidate: RelationshipCandidateTruth,
        currentRelationship?: Relationship
    ): RelationshipAdmissionDiff {
        const asOf = new Date();
        const tenantId = candidate.tenant_id;

        // Check source entity validity
        const sourceEntityValid = this.isEntityValid(candidate.source_entity_id, asOf, tenantId);

        // Check target entity validity
        const targetEntityValid = this.isEntityValid(candidate.target_entity_id, asOf, tenantId);

        // Compute property changes
        const propertyChanges = this.computePropertyChanges(
            candidate.proposed_properties,
            currentRelationship
        );

        // Compute validity changes
        const validityChanges = this.computeValidityChanges(candidate, currentRelationship);

        // Check cardinality constraints
        const cardinalityCheck = this.checkCardinality(candidate, currentRelationship);

        return {
            relationship_id: currentRelationship?.id,
            is_new_relationship: !currentRelationship,
            source_entity_valid: sourceEntityValid,
            target_entity_valid: targetEntityValid,
            property_changes: propertyChanges,
            validity_changes: validityChanges,
            cardinality_check: cardinalityCheck
        };
    }

    /**
     * Submits a decision for a relationship admission case.
     * 
     * CRITICAL: This method ONLY records the decision. It does NOT mutate the ontology.
     */
    public async submitDecision(
        caseId: RelationshipAdmissionCaseId,
        decision: AdmissionDecision,
        justification: string,
        author: string
    ): Promise<RelationshipAdmissionCase> {
        const admissionCase = this.caseStore.get(caseId);
        if (!admissionCase) {
            throw new Error(`Relationship admission case ${caseId} not found`);
        }

        if (admissionCase.status !== AdmissionStatus.PENDING) {
            throw new Error(`Relationship admission case ${caseId} is already resolved`);
        }

        // Phase 30: Check Authority
        const snapshot = authorityGraphEngine.resolveAuthoritySnapshot(
            author,
            admissionCase.tenant_id,
            new Date()
        );

        const hasPermission = snapshot.permissions.some(
            p => p.authority_type === 'APPROVE'
        );
        if (!hasPermission) {
            throw new Error(`Unauthorized: No APPROVE or APPROVE_RELATIONSHIP authority found for user ${author}`);
        }

        // Validate the diff (source/target must be valid for APPROVED decisions)
        if (decision === AdmissionDecision.APPROVED) {
            if (!admissionCase.diff.source_entity_valid) {
                throw new Error('Cannot approve: Source entity is not valid');
            }
            if (!admissionCase.diff.target_entity_valid) {
                throw new Error('Cannot approve: Target entity is not valid');
            }
            if (admissionCase.diff.cardinality_check?.would_violate) {
                throw new Error('Cannot approve: Would violate cardinality constraints');
            }
        }

        // 1. Create Decision Journal Entry
        const journalInput: DecisionJournalInput = {
            author: author,
            justification: justification,
            chosenScenarioId: null,
            context: {
                asOf: new Date(),
                leftScenarioId: null,
                rightScenarioId: null,
                deltaSummary: admissionCase.diff,
                comparisonMetadata: {
                    type: 'RELATIONSHIP_ADMISSION_REVIEW',
                    caseId: caseId,
                    decision: decision
                }
            },
            admissionDecision: decision
        };

        const journalEntry = decisionManager.submitDecision(journalInput);

        // 2. Update Case Status
        const identityContext = IdentityContext.getInstance().getCurrentContext();

        const resolution: AdmissionResolution = {
            decision: decision,
            justification: justification,
            decided_by: author as any,
            performed_by_session_id: identityContext.session_id,
            authority_snapshot_id: snapshot.id,
            decided_at: new Date(),
            decision_journal_id: journalEntry.id
        };

        const updatedCase: RelationshipAdmissionCase = {
            ...admissionCase,
            status: AdmissionStatus.RESOLVED,
            resolution: resolution
        };

        this.persistCase(updatedCase);

        // 3. Emit Event (In a real system, this would trigger the Mutation Engine)
        console.log(`[RelationshipAdmissionEngine] Decision submitted: ${decision} for case ${caseId}`);

        return updatedCase;
    }

    /**
     * Gets all pending relationship admission cases for the current tenant.
     */
    public getPendingCases(): RelationshipAdmissionCase[] {
        return Array.from(this.caseStore.values())
            .filter(c => c.status === AdmissionStatus.PENDING)
            .filter(c => c.tenant_id === TenantContextManager.getContext().tenantId);
    }

    /**
     * Gets all relationship admission cases for the current tenant.
     */
    public getAllCases(): RelationshipAdmissionCase[] {
        return Array.from(this.caseStore.values())
            .filter(c => c.tenant_id === TenantContextManager.getContext().tenantId);
    }

    /**
     * Gets a specific admission case by ID.
     */
    public getCase(id: string): RelationshipAdmissionCase | undefined {
        return this.caseStore.get(id);
    }

    /**
     * Gets a specific candidate by ID.
     */
    public getCandidate(id: string): RelationshipCandidateTruth | undefined {
        return this.candidateStore.get(id);
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    private isEntityValid(entityId: EntityId, asOf: Date, tenantId: string): boolean {
        const snapshot = ontologyStore.getEntitySnapshot(entityId, asOf, tenantId);
        return snapshot !== null;
    }

    private computePropertyChanges(
        proposedProperties: Record<string, unknown>,
        currentRelationship?: Relationship
    ): Record<string, DiffChange> {
        const changes: Record<string, DiffChange> = {};

        // Get current properties from the latest version
        const currentProperties = currentRelationship
            ? this.getCurrentRelationshipProperties(currentRelationship.id)
            : {};

        // Check for new or changed properties
        for (const [key, newValue] of Object.entries(proposedProperties)) {
            const oldValue = currentProperties[key];
            if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
                changes[key] = { old: oldValue, new: newValue };
            }
        }

        // Check for removed properties
        for (const [key, oldValue] of Object.entries(currentProperties)) {
            if (!(key in proposedProperties)) {
                changes[key] = { old: oldValue, new: undefined };
            }
        }

        return changes;
    }

    private getCurrentRelationshipProperties(relationshipId: RelationshipId): Record<string, unknown> {
        // Get the latest version's properties
        const versions = this.getRelationshipVersions(relationshipId);
        if (versions.length === 0) return {};

        const latestVersion = versions[versions.length - 1];
        return latestVersion.properties || {};
    }

    private getRelationshipVersions(relationshipId: RelationshipId): RelationshipVersion[] {
        // Access relationship versions from the store
        const relationship = ontologyStore.getRelationship(relationshipId);
        if (!relationship) return [];

        // We need to access versions - for now, return empty
        // In a real implementation, we'd have access to version history
        return [];
    }

    private computeValidityChanges(
        candidate: RelationshipCandidateTruth,
        currentRelationship?: Relationship
    ): { valid_from?: DiffChange; valid_to?: DiffChange } | undefined {
        if (!currentRelationship) {
            // New relationship - no validity changes to compare
            return undefined;
        }

        const changes: { valid_from?: DiffChange; valid_to?: DiffChange } = {};

        // For existing relationships, we'd compare valid_from and valid_to
        // This requires access to the current relationship version
        const versions = this.getRelationshipVersions(currentRelationship.id);
        if (versions.length === 0) return undefined;

        const latestVersion = versions[versions.length - 1];

        if (candidate.proposed_valid_from &&
            candidate.proposed_valid_from.getTime() !== latestVersion.valid_from.getTime()) {
            changes.valid_from = {
                old: latestVersion.valid_from,
                new: candidate.proposed_valid_from
            };
        }

        if (candidate.proposed_valid_to !== undefined &&
            JSON.stringify(candidate.proposed_valid_to) !== JSON.stringify(latestVersion.valid_to)) {
            changes.valid_to = {
                old: latestVersion.valid_to,
                new: candidate.proposed_valid_to
            };
        }

        return Object.keys(changes).length > 0 ? changes : undefined;
    }

    private checkCardinality(
        candidate: RelationshipCandidateTruth,
        currentRelationship?: Relationship
    ): {
        source_count: number;
        target_count: number;
        source_max?: number | null;
        target_max?: number | null;
        would_violate: boolean;
    } | undefined {
        // This would require access to relationship type definitions
        // For now, return a basic check
        const tenantId = candidate.tenant_id;
        const asOf = new Date();

        // Count existing relationships from source entity
        const sourceRelationships = ontologyStore.getEntityRelationships(
            candidate.source_entity_id,
            asOf,
            tenantId
        );
        const sourceCount = sourceRelationships.filter(
            r => r.relationship_type_id === candidate.relationship_type_id
        ).length;

        // Count existing relationships to target entity
        const targetRelationships = ontologyStore.getEntityRelationships(
            candidate.target_entity_id,
            asOf,
            tenantId
        );
        const targetCount = targetRelationships.filter(
            r => r.relationship_type_id === candidate.relationship_type_id
        ).length;

        // For now, we don't have access to the relationship type's max counts
        // In a full implementation, we'd check against the ontology definition
        return {
            source_count: sourceCount + (currentRelationship ? 0 : 1),
            target_count: targetCount + (currentRelationship ? 0 : 1),
            source_max: null, // Would come from RelationshipType.source_max_count
            target_max: null, // Would come from RelationshipType.target_max_count
            would_violate: false // Would be computed based on max counts
        };
    }

    private persistCase(admissionCase: RelationshipAdmissionCase): void {
        this.caseStore.set(admissionCase.id, admissionCase);
    }
}

export const relationshipAdmissionEngine = new RelationshipAdmissionEngine();
