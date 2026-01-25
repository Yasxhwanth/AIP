/**
 * =============================================================================
 * TRUTH ADMISSION ENGINE
 * Phase 23 - Truth Admission & Review Engine
 * =============================================================================
 * 
 * Responsibilities:
 * - Create Admission Cases from CandidateTruth
 * - Compute diffs between CandidateTruth and current Entity state
 * - Record decisions (Approve/Reject)
 * - Emit DecisionJournal entries
 * 
 * INVARIANTS:
 * - NEVER mutates the ontology directly.
 * - NEVER creates EntityVersions.
 * - ONLY updates AdmissionCase status and records decisions.
 */



import {
    AdmissionCase,
    AdmissionCaseId,
    AdmissionStatus,
    AdmissionDecision,
    AdmissionDiff,
    AdmissionResolution,
    DiffChange,
    UnifiedAdmissionCase,
    CandidateType,
    RelationshipAdmissionCase
} from './truth-admission-types';
import { relationshipAdmissionEngine } from './RelationshipAdmissionEngine';
import { CandidateTruth, CandidateTruthId } from '../ingestion/ingestion-types';
import { Entity } from '../types'; // Assuming Entity type exists here
import { decisionManager } from '../../decision/DecisionJournalManager';
import { DecisionJournalInput } from '../../decision/decision-types';
import { TenantContextManager } from '../../tenant/TenantContext';
import { IdentityContext } from '../../identity/IdentityContext';
import { authorityGraphEngine } from '../../authority/AuthorityGraphEngine';
import { eventBus } from '../EventBus';
import { DomainEventType } from '../event-types';

export class TruthAdmissionEngine {
    // In-memory store for demo purposes
    private caseStore: Map<string, AdmissionCase> = new Map();

    /**
     * Creates a new admission case for a candidate truth.
     */
    public createAdmissionCase(candidate: CandidateTruth, currentEntity?: Entity): AdmissionCase {
        const diff = this.computeDiff(candidate, currentEntity);

        const admissionCase: AdmissionCase = {
            id: crypto.randomUUID() as AdmissionCaseId,
            tenant_id: candidate.tenant_id,
            candidate_id: candidate.id,
            status: AdmissionStatus.PENDING,
            diff: diff,
            created_at: new Date(),
            resolution: null
        };

        this.persistCase(admissionCase);

        // Emit Domain Event
        eventBus.emit({
            eventId: crypto.randomUUID(),
            type: DomainEventType.ADMISSION_CASE_CREATED,
            occurredAt: new Date(),
            tenantId: candidate.tenant_id,
            caseId: admissionCase.id,
            caseType: 'ENTITY'
        });

        return admissionCase;
    }

    /**
     * Computes the difference between the candidate's proposed data and the current entity.
     */
    public computeDiff(candidate: CandidateTruth, currentEntity?: Entity): AdmissionDiff {
        const changes: Record<string, DiffChange> = {};
        const proposedData = candidate.proposed_data;
        const currentData = currentEntity ? (currentEntity as any).properties || {} : {}; // Simplified access

        // Check for new or changed fields
        for (const [key, newValue] of Object.entries(proposedData)) {
            const oldValue = currentData[key];
            if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
                changes[key] = { old: oldValue, new: newValue };
            }
        }

        return {
            entity_id: currentEntity?.id,
            is_new_entity: !currentEntity,
            changes: changes
        };
    }

    /**
     * Submits a decision for an admission case.
     * 
     * CRITICAL: This method ONLY records the decision. It does NOT mutate the ontology.
     */
    public async submitDecision(
        caseId: AdmissionCaseId,
        decision: AdmissionDecision,
        justification: string,
        author: string
    ): Promise<AdmissionCase> {
        const admissionCase = this.caseStore.get(caseId);
        if (!admissionCase) {
            throw new Error(`Admission case ${caseId} not found`);
        }

        if (admissionCase.status !== AdmissionStatus.PENDING) {
            throw new Error(`Admission case ${caseId} is already resolved`);
        }

        // Phase 30: Check Authority
        const snapshot = authorityGraphEngine.resolveAuthoritySnapshot(
            author,
            admissionCase.tenant_id,
            new Date()
        );

        const hasPermission = snapshot.permissions.some(p => p.authority_type === 'APPROVE');
        if (!hasPermission) {
            throw new Error(`Unauthorized: No APPROVE authority found for user ${author}`);
        }

        // 1. Create Decision Journal Entry
        const journalInput: DecisionJournalInput = {
            author: author,
            justification: justification,
            chosenScenarioId: null, // Not a scenario decision
            context: {
                asOf: new Date(),
                leftScenarioId: null,
                rightScenarioId: null,
                deltaSummary: admissionCase.diff,
                comparisonMetadata: {
                    type: 'ADMISSION_REVIEW',
                    caseId: caseId,
                    decision: decision
                }
            },
            admissionDecision: decision // We'll add this to the input type
        };

        const journalEntry = decisionManager.submitDecision(journalInput);

        // 2. Update Case Status
        const identityContext = IdentityContext.getInstance().getCurrentContext();

        const resolution: AdmissionResolution = {
            decision: decision,
            justification: justification,
            decided_by: author as any, // Casting for now
            performed_by_session_id: identityContext.session_id,
            authority_snapshot_id: snapshot.id,
            decided_at: new Date(),
            decision_journal_id: journalEntry.id
        };

        const updatedCase: AdmissionCase = {
            ...admissionCase,
            status: AdmissionStatus.RESOLVED,
            resolution: resolution
        };

        this.persistCase(updatedCase);

        // 3. Emit Event (In a real system, this would trigger the Mutation Engine)
        // For now, we just log it.
        console.log(`[TruthAdmissionEngine] Decision submitted: ${decision} for case ${caseId}`);

        return updatedCase;
    }

    public getPendingCases(): AdmissionCase[] {
        return Array.from(this.caseStore.values())
            .filter(c => c.status === AdmissionStatus.PENDING)
            .filter(c => c.tenant_id === TenantContextManager.getContext().tenantId);
    }

    public getCase(id: string): AdmissionCase | undefined {
        return this.caseStore.get(id);
    }

    /**
     * Read-only access to all admission cases for analytics/metrics.
     * Returns a shallow copy of the underlying collection.
     */
    public getAllCases(): AdmissionCase[] {
        return Array.from(this.caseStore.values());
    }

    private persistCase(admissionCase: AdmissionCase): void {
        this.caseStore.set(admissionCase.id, admissionCase);
    }

    // =========================================================================
    // UNIFIED ADMISSION QUEUE (Phase 2 - Relationship as First-Class Truth)
    // =========================================================================

    /**
     * Gets a unified view of all pending admission cases (entities + relationships).
     * This allows reviewers to see all pending work in one queue.
     */
    public getUnifiedPendingCases(): UnifiedAdmissionCase[] {
        const tenantId = TenantContextManager.getContext().tenantId;
        const unified: UnifiedAdmissionCase[] = [];

        // Add entity admission cases
        const entityCases = this.getPendingCases();
        for (const c of entityCases) {
            unified.push({
                id: c.id,
                tenant_id: c.tenant_id,
                type: CandidateType.ENTITY,
                case: c,
                created_at: c.created_at,
                status: c.status
            });
        }

        // Add relationship admission cases
        const relationshipCases = relationshipAdmissionEngine.getPendingCases();
        for (const c of relationshipCases) {
            unified.push({
                id: c.id,
                tenant_id: c.tenant_id,
                type: CandidateType.RELATIONSHIP,
                case: c,
                created_at: c.created_at,
                status: c.status
            });
        }

        // Sort by created_at (oldest first)
        return unified.sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
    }

    /**
     * Gets all admission cases (both entity and relationship) for the current tenant.
     */
    public getAllUnifiedCases(): UnifiedAdmissionCase[] {
        const unified: UnifiedAdmissionCase[] = [];

        // Add entity admission cases
        const entityCases = this.getAllCases();
        for (const c of entityCases) {
            unified.push({
                id: c.id,
                tenant_id: c.tenant_id,
                type: CandidateType.ENTITY,
                case: c,
                created_at: c.created_at,
                status: c.status
            });
        }

        // Add relationship admission cases
        const relationshipCases = relationshipAdmissionEngine.getAllCases();
        for (const c of relationshipCases) {
            unified.push({
                id: c.id,
                tenant_id: c.tenant_id,
                type: CandidateType.RELATIONSHIP,
                case: c,
                created_at: c.created_at,
                status: c.status
            });
        }

        // Sort by created_at (oldest first)
        return unified.sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
    }
}

export const truthAdmissionEngine = new TruthAdmissionEngine();
