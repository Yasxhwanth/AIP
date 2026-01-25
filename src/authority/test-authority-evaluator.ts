import { authorityEvaluator } from './AuthorityEvaluator';
import {
    AuthorityNode,
    AuthorityNodeType,
    AuthorityEdge,
    AuthorityEdgeType,
    AuthorityIntent,
    AuthorityStatus,
    DenialReasonCode
} from './authority-types';

async function runTests() {
    console.log('Running Authority Evaluator Tests...\n');

    // Setup Data
    const human: AuthorityNode = { nodeId: 'USER-1', type: AuthorityNodeType.HUMAN };
    const teamLead: AuthorityNode = { nodeId: 'LEAD-1', type: AuthorityNodeType.HUMAN };
    const aiAgent: AuthorityNode = { nodeId: 'AI-1', type: AuthorityNodeType.AI };

    authorityEvaluator.addNode(human);
    authorityEvaluator.addNode(teamLead);
    authorityEvaluator.addNode(aiAgent);

    // Test 1: No Authority (Default Deny)
    console.log('Test 1: No Authority (Default Deny)');
    const res1 = authorityEvaluator.evaluate({
        actorId: 'USER-1',
        intentType: AuthorityIntent.DECIDE_SCENARIO,
        targetEntityId: 'SCENARIO-A',
        context: { asOf: new Date() }
    });
    console.assert(res1.status === AuthorityStatus.DENIED, 'Should be DENIED');
    console.assert(res1.reason?.code === DenialReasonCode.NO_AUTHORITY_PATH, 'Reason should be NO_AUTHORITY_PATH');
    console.log('PASS\n');

    // Test 2: Direct Authority
    console.log('Test 2: Direct Authority');
    const edge1: AuthorityEdge = {
        edgeId: 'EDGE-1',
        fromNodeId: 'USER-1',
        toNodeId: 'SCENARIO-A',
        type: AuthorityEdgeType.DIRECT,
        intent: AuthorityIntent.DECIDE_SCENARIO,
        constraints: {},
        grantedAt: new Date().toISOString(),
        grantedBy: 'ADMIN'
    };
    authorityEvaluator.addEdge(edge1);

    const res2 = authorityEvaluator.evaluate({
        actorId: 'USER-1',
        intentType: AuthorityIntent.DECIDE_SCENARIO,
        targetEntityId: 'SCENARIO-A',
        context: { asOf: new Date() }
    });
    console.assert(res2.status === AuthorityStatus.ALLOWED, 'Should be ALLOWED');
    console.assert(res2.proof?.matchedEdgeId === 'EDGE-1', 'Proof should match EDGE-1');
    console.log('PASS\n');

    // Test 3: Delegation Chain
    console.log('Test 3: Delegation Chain');
    // LEAD-1 delegates to USER-1
    const delegationEdge: AuthorityEdge = {
        edgeId: 'DEL-1',
        fromNodeId: 'USER-1', // Wait, fromNodeId is the one HAVING authority? 
        // No, "fromNodeId" in graph usually means Source -> Target.
        // If A delegates to B, the edge is A -> B? Or B -> A?
        // In standard RBAC/Graph:
        // If I have authority, I am the source of the action.
        // If I delegate to you, I am giving you power.
        // So the flow of power is Me -> You.
        // But the evaluator looks for a path FROM Actor TO Target.
        // So if Actor is USER-1, we need path USER-1 -> ... -> Target.
        // So if LEAD-1 has authority on Target, and delegates to USER-1.
        // Then USER-1 has authority?
        // Path: USER-1 -> LEAD-1 -> Target.
        // So Edge: USER-1 -> LEAD-1 (Type: DELEGATED).
        // Let's verify this interpretation.
        // If "AuthorityEdge" represents "Granted Authority", then:
        // A -> B means "A has authority over B" or "A can act on B".
        // If LEAD-1 can act on SCENARIO-B. (LEAD-1 -> SCENARIO-B).
        // And LEAD-1 delegates to USER-1.
        // Then USER-1 can act on SCENARIO-B.
        // So we need a path from USER-1 to SCENARIO-B.
        // So the edge must be USER-1 -> LEAD-1.
        // This edge means "USER-1 is granted authority by/via LEAD-1"?
        // Or "USER-1 has access to LEAD-1's scope"?
        // Yes, USER-1 -> LEAD-1.

        // Let's create the edges:
        // 1. LEAD-1 -> SCENARIO-B (Direct)
        // 2. USER-1 -> LEAD-1 (Delegated)
        toNodeId: 'LEAD-1',
        type: AuthorityEdgeType.DELEGATED,
        intent: AuthorityIntent.DECIDE_SCENARIO,
        scope: {
            targetIds: ['SCENARIO-B']
        },
        constraints: {},
        grantedAt: new Date().toISOString(),
        grantedBy: 'ADMIN'
    };
    authorityEvaluator.addEdge(delegationEdge);

    const directEdge2: AuthorityEdge = {
        edgeId: 'EDGE-2',
        fromNodeId: 'LEAD-1',
        toNodeId: 'SCENARIO-B',
        type: AuthorityEdgeType.DIRECT,
        intent: AuthorityIntent.DECIDE_SCENARIO,
        constraints: {},
        grantedAt: new Date().toISOString(),
        grantedBy: 'ADMIN'
    };
    authorityEvaluator.addEdge(directEdge2);

    const res3 = authorityEvaluator.evaluate({
        actorId: 'USER-1',
        intentType: AuthorityIntent.DECIDE_SCENARIO,
        targetEntityId: 'SCENARIO-B',
        context: { asOf: new Date() }
    });
    console.log('Proof:', JSON.stringify(res3.proof, null, 2));
    console.assert(res3.status === AuthorityStatus.ALLOWED, 'Should be ALLOWED via delegation');
    console.assert(res3.proof?.delegationChainIds?.includes('DEL-1'), 'Proof should include delegation edge');
    console.log('PASS\n');

    // Test 4: Scope Mismatch
    console.log('Test 4: Scope Mismatch');
    // USER-1 -> LEAD-1 is for DECIDE_SCENARIO.
    // Try APPROVE_BUDGET.
    const res4 = authorityEvaluator.evaluate({
        actorId: 'USER-1',
        intentType: AuthorityIntent.APPROVE_BUDGET,
        targetEntityId: 'SCENARIO-B',
        context: { asOf: new Date() }
    });
    console.assert(res4.status === AuthorityStatus.DENIED, 'Should be DENIED (Intent mismatch)');
    console.log('PASS\n');

    // Test 5: AI Actor (No Authority)
    console.log('Test 5: AI Actor (No Authority)');
    const res5 = authorityEvaluator.evaluate({
        actorId: 'AI-1',
        intentType: AuthorityIntent.DECIDE_SCENARIO,
        targetEntityId: 'SCENARIO-A',
        context: { asOf: new Date() }
    });
    console.assert(res5.status === AuthorityStatus.DENIED, 'Should be DENIED');
    console.log('PASS\n');
}

runTests().catch(console.error);
