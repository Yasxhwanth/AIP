
import { policyEvaluator } from './PolicyEvaluator';
import {
    PolicyDefinition,
    PolicyConditionType,
    PolicySeverity,
    PolicyProposal,
    PolicyEvaluationStatus
} from './policy-types';
import { AuthoritySnapshot } from '../authority/authority-types';

async function testPolicyLayer() {
    console.log('--- Testing Policy Layer ---');

    const tenantId = 'tenant-1';
    const asOf = new Date('2025-01-01T10:00:00Z'); // 10 AM UTC

    // 1. Setup Policies
    console.log('1. Setting up Policies...');

    // Policy 1: Block operations outside 9-17 UTC
    const timePolicy: PolicyDefinition = {
        policyId: 'policy-time',
        name: 'Business Hours Only',
        description: 'Operations allowed only between 09:00 and 17:00 UTC',
        appliesToIntentTypes: [], // Applies to all
        scope: { tenantId },
        conditions: [{
            type: PolicyConditionType.TIME_WINDOW,
            parameters: { startTime: '09:00', endTime: '17:00' }
        }],
        severity: PolicySeverity.BLOCKING,
        createdAt: new Date().toISOString(),
        createdBy: 'admin'
    };

    // Policy 2: Warn on specific action type
    const riskyActionPolicy: PolicyDefinition = {
        policyId: 'policy-risky',
        name: 'Risky Action Warning',
        description: 'Warn when executing HIGH_RISK actions',
        appliesToIntentTypes: ['HIGH_RISK_OP'],
        scope: { tenantId },
        conditions: [], // No conditions implies always active if applicable? Or maybe we need a condition?
        // Let's assume for this test that if it applies, and has no conditions, it passes? 
        // Actually, usually policies constrain. If no conditions, maybe it's just informational?
        // Let's add a dummy condition that always fails to trigger the warning.
        // Or better, let's use a condition that checks something we can control.
        // For now, let's use a Time Window that is impossible to meet to force a warning.
        conditions: [{
            type: PolicyConditionType.TIME_WINDOW,
            parameters: { startTime: '25:00', endTime: '26:00' } // Impossible
        }],
        severity: PolicySeverity.WARNING,
        createdAt: new Date().toISOString(),
        createdBy: 'admin'
    };

    policyEvaluator.addPolicy(timePolicy);
    policyEvaluator.addPolicy(riskyActionPolicy);

    // 2. Test Passing Proposal
    console.log('2. Testing Passing Proposal...');
    const passingProposal: PolicyProposal = {
        actionType: 'NORMAL_OP',
        targetEntityId: 'entity-1',
        parameters: {},
        tenantId
    };

    // Mock Snapshot (irrelevant for PolicyEvaluator currently, but required by signature)
    const mockSnapshot: AuthoritySnapshot = {
        id: 'snap-1',
        actor_id: 'user-1', // Evaluator should ignore this
        tenant_id: tenantId,
        valid_at: asOf.toISOString(),
        permissions: [],
        expires_at: asOf.toISOString()
    };

    const results1 = policyEvaluator.evaluate(passingProposal, mockSnapshot, asOf);
    console.log('Results 1:', results1.map(r => `${r.policyName}: ${r.status}`));

    const timePolicyResult1 = results1.find(r => r.policyId === timePolicy.policyId);
    if (!timePolicyResult1 || timePolicyResult1.status !== PolicyEvaluationStatus.PASS) {
        throw new Error('Time policy should PASS at 10 AM');
    }

    // 3. Test Blocking Proposal (Time)
    console.log('3. Testing Blocking Proposal (Time)...');
    const nightTime = new Date('2025-01-01T20:00:00Z'); // 8 PM UTC
    const results2 = policyEvaluator.evaluate(passingProposal, mockSnapshot, nightTime);
    console.log('Results 2:', results2.map(r => `${r.policyName}: ${r.status}`));

    const timePolicyResult2 = results2.find(r => r.policyId === timePolicy.policyId);
    if (!timePolicyResult2 || timePolicyResult2.status !== PolicyEvaluationStatus.BLOCK) {
        throw new Error('Time policy should BLOCK at 8 PM');
    }

    // 4. Test Warning Proposal
    console.log('4. Testing Warning Proposal...');
    const riskyProposal: PolicyProposal = {
        actionType: 'HIGH_RISK_OP',
        targetEntityId: 'entity-1',
        parameters: {},
        tenantId
    };

    const results3 = policyEvaluator.evaluate(riskyProposal, mockSnapshot, asOf);
    console.log('Results 3:', results3.map(r => `${r.policyName}: ${r.status}`));

    const riskyResult = results3.find(r => r.policyId === riskyActionPolicy.policyId);
    if (!riskyResult || riskyResult.status !== PolicyEvaluationStatus.WARN) {
        throw new Error('Risky policy should WARN (due to impossible condition)');
    }

    console.log('--- Test Complete ---');
}

testPolicyLayer().catch(e => {
    console.error('Test Failed:', e);
    process.exit(1);
});
