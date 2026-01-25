/**
 * =============================================================================
 * TRUTH MATERIALIZATION ENGINE
 * Phase 24 - Truth Materialization Engine
 * =============================================================================
 * 
 * Responsibilities:
 * - Materialize approved admission decisions into the ontology.
 * - Ensure idempotency (one admission case = at most one materialization).
 * - Ensure forward-only mutations (never update existing versions).
 * - Attach full lineage metadata to every created version.
 */

import {
    MaterializationJob,
    MaterializationJobId,
    MaterializationStatus,
    MaterializationResult
} from './materialization-types';
import {
    AdmissionCase,
    AdmissionCaseId,
    AdmissionStatus,
    AdmissionDecision,
    RelationshipAdmissionCase,
    RelationshipAdmissionCaseId
} from '../admission/truth-admission-types';
import { truthAdmissionEngine } from '../admission/TruthAdmissionEngine';
import { relationshipAdmissionEngine } from '../admission/RelationshipAdmissionEngine';
import {
    Entity,
    EntityVersion,
    AttributeValue,
    EntityId,
    EntityVersionId,
    AttributeValueId,
    AuditOperation,
    AuditLog,
    AuditLogId,
    EntityTypeId,
    Relationship,
    RelationshipVersion,
    RelationshipId,
    RelationshipVersionId
} from '../types';

import { ontologyStore } from '../OntologyStore';
import { IdentityContext } from '../../identity/IdentityContext';
import { eventBus } from '../EventBus';
import { DomainEventType } from '../event-types';
import { TenantContextManager } from '../../tenant/TenantContext';

export class TruthMaterializationEngine {
    // In-memory stores for demo purposes (Audit log remains here for now)
    private jobStore: Map<string, MaterializationJob> = new Map();
    private auditStore: AuditLog[] = [];

    /**
     * Materializes an approved admission decision into the ontology.
     * 
     * TM-24-8: Idempotent - returns safely if already applied.
     */
    public async applyAdmissionDecision(admissionCaseId: AdmissionCaseId): Promise<MaterializationResult> {
        // 1. Check for existing job (Idempotency)
        const existingJob = Array.from(this.jobStore.values()).find(j => j.admission_case_id === admissionCaseId);
        if (existingJob && existingJob.status === MaterializationStatus.APPLIED) {
            console.log(`[TruthMaterializationEngine] Case ${admissionCaseId} already materialized. Returning safely.`);
            return this.getJobResult(existingJob.id);
        }

        // 2. Create/Load Job
        const job: MaterializationJob = existingJob || {
            id: crypto.randomUUID() as MaterializationJobId,
            admission_case_id: admissionCaseId,
            decision_journal_id: '', // Will be filled from case
            status: MaterializationStatus.PENDING,
            created_at: new Date()
        };
        this.jobStore.set(job.id, job);

        try {
            // 3. Load and Verify Admission Case
            const admissionCase = truthAdmissionEngine.getCase(admissionCaseId);
            if (!admissionCase) throw new Error(`Admission case ${admissionCaseId} not found`);
            if (admissionCase.status !== AdmissionStatus.RESOLVED) throw new Error(`Admission case ${admissionCaseId} is not resolved`);
            if (!admissionCase.resolution || admissionCase.resolution.decision !== AdmissionDecision.APPROVED) {
                throw new Error(`Admission case ${admissionCaseId} was not approved`);
            }

            // Update job with journal ID
            (job as any).decision_journal_id = admissionCase.resolution.decision_journal_id;

            // 4. Compute Mutations
            const result = await this.executeMaterialization(job, admissionCase);

            // 5. Mark Job as APPLIED
            job.status = MaterializationStatus.APPLIED;
            job.applied_at = new Date();

            return result;

        } catch (error: any) {
            job.status = MaterializationStatus.FAILED;
            job.error_message = error.message;
            console.error(`[TruthMaterializationEngine] Materialization failed for case ${admissionCaseId}:`, error.message);
            throw error;
        }
    }

    /**
     * Materializes an approved relationship admission decision.
     */
    public async applyRelationshipAdmissionDecision(caseId: RelationshipAdmissionCaseId): Promise<MaterializationResult> {
        // 1. Idempotency Check
        const existingJob = Array.from(this.jobStore.values()).find(j => (j.admission_case_id as any) === (caseId as any));
        if (existingJob && existingJob.status === MaterializationStatus.APPLIED) {
            return this.getJobResult(existingJob.id);
        }

        const job: MaterializationJob = existingJob || {
            id: crypto.randomUUID() as MaterializationJobId,
            admission_case_id: caseId,
            decision_journal_id: '',
            status: MaterializationStatus.PENDING,
            created_at: new Date()
        };
        this.jobStore.set(job.id, job);

        try {
            const admissionCase = relationshipAdmissionEngine.getCase(caseId);
            if (!admissionCase) throw new Error(`Relationship admission case ${caseId} not found`);
            if (admissionCase.status !== AdmissionStatus.RESOLVED) throw new Error(`Relationship admission case ${caseId} is not resolved`);
            if (!admissionCase.resolution || admissionCase.resolution.decision !== AdmissionDecision.APPROVED) {
                throw new Error(`Relationship admission case ${caseId} was not approved`);
            }

            (job as any).decision_journal_id = admissionCase.resolution.decision_journal_id;

            const result = await this.executeRelationshipMaterialization(job, admissionCase);

            job.status = MaterializationStatus.APPLIED;
            job.applied_at = new Date();

            return result;
        } catch (error: any) {
            job.status = MaterializationStatus.FAILED;
            job.error_message = error.message;
            throw error;
        }
    }

    private async executeRelationshipMaterialization(
        job: MaterializationJob, 
        admissionCase: RelationshipAdmissionCase
    ): Promise<MaterializationResult> {
        const { diff, tenant_id, candidate_id, resolution } = admissionCase;
        const journalId = resolution!.decision_journal_id;
        const candidate = relationshipAdmissionEngine.getCandidate(candidate_id);
        if (!candidate) throw new Error(`Candidate ${candidate_id} not found`);

        let relationshipId: RelationshipId;
        let versionNumber: number;

        if (diff.is_new_relationship) {
            relationshipId = crypto.randomUUID() as RelationshipId;
            const relationship: Relationship = {
                id: relationshipId,
                tenant_id: tenant_id,
                relationship_type_id: candidate.relationship_type_id,
                source_entity_id: candidate.source_entity_id,
                target_entity_id: candidate.target_entity_id,
                created_at: new Date(),
                updated_at: new Date(),
                created_by: resolution?.decided_by || null,
                deleted_at: null,
                metadata: {}
            };
            ontologyStore.addRelationship(relationship);
            versionNumber = 1;
        } else {
            relationshipId = diff.relationship_id as RelationshipId;
            const history = ontologyStore.getRelationshipVersions(relationshipId);
            versionNumber = history.length > 0 ? history[history.length - 1].version_number + 1 : 1;
        }

        const versionId = crypto.randomUUID() as RelationshipVersionId;
        const version: RelationshipVersion = {
            id: versionId,
            relationship_id: relationshipId,
            version_number: versionNumber,
            valid_from: candidate.proposed_valid_from || new Date(),
            valid_to: candidate.proposed_valid_to || null,
            properties: candidate.proposed_properties,
            change_reason: resolution?.justification || 'Materialized relationship',
            source_system: 'TruthMaterializationEngine',
            created_at: new Date(),
            created_by: resolution?.decided_by || null,
            metadata: {},
            admission_case_id: admissionCase.id,
            decision_journal_id: journalId
        };

        ontologyStore.addRelationshipVersion(version);

        // Emit Domain Event
        eventBus.emit({
            eventId: crypto.randomUUID(),
            type: DomainEventType.RELATIONSHIP_MATERIALIZED,
            occurredAt: new Date(),
            tenantId: tenant_id,
            relationshipId: relationshipId,
            versionId: versionId,
            actorId: resolution?.decided_by
        });

        return {
            job_id: job.id,
            entity_versions_created: [],
            relationship_versions_created: [versionId],
            attribute_values_created: []
        };
    }

    private async executeMaterialization(job: MaterializationJob, admissionCase: AdmissionCase): Promise<MaterializationResult> {
        const { diff, tenant_id, candidate_id, resolution } = admissionCase;
        const journalId = resolution!.decision_journal_id;

        let entityId: EntityId;
        let versionNumber: number;

        const createdVersions: string[] = [];
        const createdAttributes: string[] = [];

        if (diff.is_new_entity) {
            // CREATE NEW ENTITY
            entityId = crypto.randomUUID() as EntityId;
            const entity: Entity = {
                id: entityId,
                tenant_id: tenant_id,
                entity_type_id: 'unknown' as EntityTypeId, // In a real system, this comes from CandidateTruth
                external_id: null,
                created_at: new Date(),
                updated_at: new Date(),
                created_by: resolution?.decided_by || null,
                deleted_at: null,
                metadata: {}
            };
            ontologyStore.addEntity(entity);
            versionNumber = 1;
        } else {
            // CREATE NEW VERSION FOR EXISTING ENTITY
            entityId = diff.entity_id as EntityId;
            const snapshot = ontologyStore.getEntitySnapshot(entityId, new Date(), tenant_id);
            versionNumber = snapshot ? (snapshot._version.version_number + 1) : 1;
        }

        // Create Entity Version
        const versionId = crypto.randomUUID() as EntityVersionId;
        const version: EntityVersion = {
            id: versionId,
            entity_id: entityId,
            version_number: versionNumber,
            valid_from: new Date(),
            valid_to: null,
            change_reason: resolution?.justification || 'Materialized from admission',
            source_system: 'TruthMaterializationEngine',
            created_at: new Date(),
            created_by: resolution?.decided_by || null,
            metadata: {},
            // Lineage Metadata
            admission_case_id: admissionCase.id,
            decision_journal_id: journalId,
            candidate_truth_id: candidate_id,
            ingestion_event_id: undefined // Would come from CandidateTruth in real system
        };

        // Create Attribute Values
        const attributes: AttributeValue[] = [];
        for (const [key, change] of Object.entries(diff.changes)) {
            const attrId = crypto.randomUUID() as AttributeValueId;
            const attr: AttributeValue = {
                id: attrId,
                entity_version_id: versionId,
                attribute_definition_id: key as any, // Simplified
                is_null: change.new === null,
                value_string: typeof change.new === 'string' ? change.new : null,
                value_integer: typeof change.new === 'number' ? change.new : null,
                value_float: null,
                value_boolean: typeof change.new === 'boolean' ? change.new : null,
                value_date: null,
                value_datetime: null,
                value_json: typeof change.new === 'object' ? change.new : null,
                metadata: {}
            };
            attributes.push(attr);
            createdAttributes.push(attrId);
        }

        // Write to OntologyStore
        ontologyStore.addEntityVersion(version, attributes);
        createdVersions.push(versionId);

        // Emit Domain Event
        eventBus.emit({
            eventId: crypto.randomUUID(),
            type: DomainEventType.TRUTH_MATERIALIZED,
            occurredAt: new Date(),
            tenantId: tenant_id,
            entityId: entityId,
            versionId: versionId,
            actorId: resolution?.decided_by
        });

        // Record Audit Log
        const auditLog: AuditLog = {
            id: crypto.randomUUID() as AuditLogId,
            table_name: 'entity_version',
            record_id: versionId,
            operation: diff.is_new_entity ? AuditOperation.CREATE : AuditOperation.UPDATE,
            old_version_number: diff.is_new_entity ? null : versionNumber - 1,
            new_version_number: versionNumber,
            changes: diff.changes as any,
            performed_at: new Date(),
            performed_by: resolution?.decided_by || null,
            performed_by_session_id: IdentityContext.getInstance().getCurrentContext().session_id,
            context: {
                job_id: job.id,
                admission_case_id: admissionCase.id
            }
        };
        this.auditStore.push(auditLog);

        return {
            job_id: job.id,
            entity_versions_created: createdVersions,
            relationship_versions_created: [],
            attribute_values_created: createdAttributes
        };
    }

    private getJobResult(jobId: MaterializationJobId): MaterializationResult {
        // In a real system, this would query the DB for what was created by this job
        return {
            job_id: jobId,
            entity_versions_created: [],
            relationship_versions_created: [],
            attribute_values_created: []
        };
    }

    // Helpers for testing
    public getEntity(id: string) { return (ontologyStore as any).entities.get(id); }
    public getVersion(id: string) {
        const allVersions = Array.from((ontologyStore as any).versions.values()) as EntityVersion[][];
        return allVersions.flat().find(v => v.id === id);
    }
    public getAttributes(versionId: string) { return (ontologyStore as any).attributes.get(versionId); }
    public getAuditLogs() { return this.auditStore; }
    public getJob(id: string) { return this.jobStore.get(id); }
}

export const materializationEngine = new TruthMaterializationEngine();
