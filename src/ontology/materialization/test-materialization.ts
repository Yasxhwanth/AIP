/**
 * =============================================================================
 * TEST: TRUTH MATERIALIZATION ENGINE
 * Phase 24 - Truth Materialization Engine
 * =============================================================================
 */

import { materializationEngine } from './TruthMaterializationEngine';
import { truthAdmissionEngine } from '../admission/TruthAdmissionEngine';
import { AdmissionDecision, AdmissionStatus } from '../admission/truth-admission-types';
import { CandidateTruth, CandidateType } from '../ingestion/ingestion-types';
import { TenantContextManager } from '../../tenant/TenantContext';
import { authorityEvaluator } from '../../authority/AuthorityEvaluator';
import { AuthorityEdgeType, AuthorityIntent, AuthorityNodeType } from '../../authority/authority-types';

async function runTest() {
    console.log('--- Starting Truth Materialization Verification ---');

    // 0. Setup Context & Authority
    TenantContextManager.setContext({
        tenantId: 'tenant-1',
        userId: 'user-1',
        role: 'ADMIN',
        sessionId: 'session-1'
    });

    authorityEvaluator.addNode({ nodeId: 'user-1', type: AuthorityNodeType.HUMAN, metadata: {} });
    authorityEvaluator.addNode({ nodeId: 'system', type: AuthorityNodeType.SYSTEM, metadata: {} });
    authorityEvaluator.addEdge({
        edgeId: 'edge-1',
        fromNodeId: 'user-1',
        toNodeId: 'system',
        type: AuthorityEdgeType.DIRECT,
        intent: AuthorityIntent.DECIDE_SCENARIO,
        scope: {
            targetIds: ['system'] // Wildcard for system-level decisions
        },
        constraints: {},
        grantedAt: new Date().toISOString(),
        grantedBy: 'admin'
    });

    // 1. Setup Candidate Truth
    const candidate: CandidateTruth = {
        id: 'candidate-1' as any,
        tenant_id: 'tenant-1',
        candidate_type: CandidateType.ENTITY,
        proposed_data: {
            name: 'New Entity Name',
            status: 'ACTIVE',
            value: 100
        },
        derived_from_event_id: 'event-1' as any,
        created_at: new Date()
    };

    console.log('1. Creating Admission Case...');
    const admissionCase = truthAdmissionEngine.createAdmissionCase(candidate);
    console.log('Case Created:', admissionCase.id);

    console.log('2. Approving Admission Case...');
    await truthAdmissionEngine.submitDecision(
        admissionCase.id,
        AdmissionDecision.APPROVED,
        'Looks good to me',
        'user-1'
    );

    // 3. Materialize
    console.log('3. Materializing Approved Truth...');
    const result = await materializationEngine.applyAdmissionDecision(admissionCase.id);
    console.log('Materialization SUCCESS');
    console.log('Result:', JSON.stringify(result, null, 2));

    // 4. Verify Ontology State
    console.log('4. Verifying Ontology State...');
    const versionId = result.entity_versions_created[0];
    const version = materializationEngine.getVersion(versionId);

    if (!version) throw new Error('Version not found in store');
    console.log('Version Found:', version.id);
    console.log('Lineage Check:');
    console.log(' - Admission Case ID:', version.admission_case_id);
    console.log(' - Decision Journal ID:', version.decision_journal_id);
    console.log(' - Candidate Truth ID:', version.candidate_truth_id);

    if (version.admission_case_id !== admissionCase.id) throw new Error('Lineage mismatch: admission_case_id');

    const attributes = materializationEngine.getAttributes(versionId);
    console.log('Attributes Created:', attributes?.length);
    if (attributes?.length !== 3) throw new Error('Attribute count mismatch');

    // 5. Test Idempotency
    console.log('5. Testing Idempotency (Re-running materialization)...');
    const secondResult = await materializationEngine.applyAdmissionDecision(admissionCase.id);
    console.log('Second Materialization Result (should be same job):', secondResult.job_id);
    if (secondResult.job_id !== result.job_id) throw new Error('Idempotency failure: different job ID');

    // 6. Verify Audit Log
    console.log('6. Verifying Audit Log...');
    const logs = materializationEngine.getAuditLogs();
    const materializationLog = logs.find(l => (l.context as any).job_id === result.job_id);
    if (!materializationLog) throw new Error('Audit log not found for materialization');
    console.log('Audit Log Found:', materializationLog.id);
    console.log('Operation:', materializationLog.operation);

    console.log('\n--- Verification SUCCESS ---');
}

runTest().catch(err => {
    console.error('\n--- Verification FAILED ---');
    console.error(err);
});
