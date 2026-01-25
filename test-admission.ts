
import { truthAdmissionEngine } from './src/ontology/admission/TruthAdmissionEngine';
import { CandidateTruth, CandidateType, CandidateTruthId } from './src/ontology/ingestion/ingestion-types';
import { AdmissionDecision, AdmissionStatus } from './src/ontology/admission/truth-admission-types';
import { decisionManager } from './src/decision/DecisionJournalManager';
import { authorityEvaluator } from './src/authority/AuthorityEvaluator';
import { AuthorityNodeType, AuthorityEdgeType, AuthorityIntent } from './src/authority/authority-types';
import { TenantContextManager } from './src/tenant/TenantContext';

// Configure Authority
authorityEvaluator.addNode({
    nodeId: 'user-1',
    type: AuthorityNodeType.HUMAN,
    metadata: { name: 'Test User' }
});

authorityEvaluator.addEdge({
    edgeId: 'edge-1',
    fromNodeId: 'user-1',
    toNodeId: 'user-1', // Self-authorized
    type: AuthorityEdgeType.DIRECT,
    intent: AuthorityIntent.DECIDE_SCENARIO,
    constraints: {},
    scope: { targetIds: [] }, // Empty scope for global/generic permission
    grantedAt: new Date().toISOString(),
    grantedBy: 'system'
});

// Mock Candidate
const mockCandidate: CandidateTruth = {
    id: 'candidate-123' as CandidateTruthId,
    tenant_id: 'tenant-1',
    candidate_type: CandidateType.ENTITY,
    proposed_data: {
        id: 'entity-1',
        name: 'Test Entity',
        status: 'ACTIVE'
    },
    derived_from_event_id: 'event-1' as any,
    created_at: new Date()
};

// Mock Existing Entity (optional)
const mockEntity = {
    id: 'entity-1',
    properties: {
        id: 'entity-1',
        name: 'Old Name',
        status: 'ACTIVE'
    }
};

async function runTest() {
    console.log('--- Starting Truth Admission Verification ---');

    // 0. Set Tenant Context
    TenantContextManager.setContext({
        tenantId: 'tenant-1',
        userId: 'user-1',
        role: 'ADMIN',
        sessionId: 'session-1'
    });

    // 1. Create Admission Case
    console.log('1. Creating Admission Case...');
    const admissionCase = truthAdmissionEngine.createAdmissionCase(mockCandidate, mockEntity as any);
    console.log('Case Created:', admissionCase.id);
    console.log('Status:', admissionCase.status);

    // console.log('Diff:', JSON.stringify(admissionCase.diff, null, 2));

    if (admissionCase.status !== AdmissionStatus.PENDING) throw new Error('Status should be PENDING');
    if (admissionCase.diff.changes['name'].old !== 'Old Name') throw new Error('Diff old value mismatch');
    if (admissionCase.diff.changes['name'].new !== 'Test Entity') throw new Error('Diff new value mismatch');

    // 2. Submit Decision
    console.log('\n2. Submitting Decision (APPROVED)...');
    let resolvedCase;
    try {
        resolvedCase = await truthAdmissionEngine.submitDecision(
            admissionCase.id,
            AdmissionDecision.APPROVED,
            'Looks good to me',
            'user-1'
        );
    } catch (e) {
        console.error('Submit Decision Failed:', e);
        throw e;
    }
    console.log('Case Resolved:', resolvedCase.status);
    console.log('Resolution:', resolvedCase.resolution);

    if (resolvedCase.status !== AdmissionStatus.RESOLVED) throw new Error('Status should be RESOLVED');
    if (resolvedCase.resolution?.decision !== AdmissionDecision.APPROVED) throw new Error('Decision should be APPROVED');

    // 3. Verify Journal
    console.log('\n3. Verifying Decision Journal...');
    const journalEntry = decisionManager.getDecision(resolvedCase.resolution!.decision_journal_id);
    if (!journalEntry) throw new Error('Journal entry not found');

    console.log('Journal Entry:', journalEntry.id);
    console.log('Admission Decision in Journal:', journalEntry.admissionDecision);

    if (journalEntry.admissionDecision !== 'APPROVED') throw new Error('Journal entry missing admission decision');

    console.log('\n--- Verification SUCCESS ---');
}

runTest().catch(err => {
    console.error('Verification FAILED:', err);
    process.exit(1);
});
