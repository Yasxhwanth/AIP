
import { authorityGraphEngine } from './AuthorityGraphEngine';
import { AuthorityEdgeType, AuthorityIntent, AuthorityNodeType } from './authority-types';

async function testAuthorityGraph() {
    console.log('--- Testing Authority Graph ---');

    const tenantId = 'tenant-1';
    const actorId = 'user-1';
    const asOf = new Date();

    // 1. Test Direct Authority
    console.log('1. Testing Direct Authority...');
    authorityGraphEngine.addEdge({
        edgeId: 'edge-1',
        fromNodeId: 'system',
        toNodeId: actorId,
        type: AuthorityEdgeType.DIRECT,
        intent: AuthorityIntent.REQUEST_EXECUTION,
        constraints: { expiresAt: new Date(Date.now() + 100000).toISOString() },
        grantedAt: new Date(Date.now() - 1000).toISOString(),
        grantedBy: 'system'
    });

    const snapshot2 = authorityGraphEngine.resolveAuthoritySnapshot(actorId, tenantId, asOf);
    const hasExecute = snapshot2.permissions.some(p => p.authority_type === 'EXECUTE');
    console.log('Has EXECUTE:', hasExecute);
    if (!hasExecute) throw new Error('Failed to resolve direct EXECUTE authority');

    // 2. Test Delegation (Recursive)
    // Group G has VIEW authority.
    // User A is member of Group G (via DELEGATED edge).
    // User A should inherit VIEW authority.
    console.log('2. Testing Delegation...');
    const groupId = 'group-viewers';

    // Grant VIEW to Group
    authorityGraphEngine.addEdge({
        edgeId: 'edge-group-view',
        fromNodeId: 'system',
        toNodeId: groupId,
        type: AuthorityEdgeType.DIRECT,
        intent: AuthorityIntent.VIEW_SENSITIVE,
        constraints: {},
        grantedAt: new Date(Date.now() - 1000).toISOString(),
        grantedBy: 'system'
    });

    // Make User Member of Group (Delegation)
    // Note: The intent here is just "DELEGATED" (which maps to nothing in our switch, but triggers traversal)
    // or we can give it a dummy intent.
    // The engine logic: if type === DELEGATED, traverse to fromNodeId.
    authorityGraphEngine.addEdge({
        edgeId: 'edge-membership',
        fromNodeId: groupId,
        toNodeId: actorId,
        type: AuthorityEdgeType.DELEGATED,
        intent: AuthorityIntent.APPROVE_BUDGET, // Dummy intent, shouldn't matter for traversal, but might add APPROVE permission too.
        constraints: {},
        grantedAt: new Date(Date.now() - 1000).toISOString(),
        grantedBy: 'system'
    });

    const snapshot4 = authorityGraphEngine.resolveAuthoritySnapshot(actorId, tenantId, asOf);

    // Check for VIEW (inherited from Group)
    const hasView = snapshot4.permissions.some(p => p.authority_type === 'VIEW');
    console.log('Has VIEW (via delegation):', hasView);
    if (!hasView) throw new Error('Failed to resolve delegated VIEW authority');

    // Check for APPROVE (from membership edge itself)
    const hasApprove = snapshot4.permissions.some(p => p.authority_type === 'APPROVE');
    console.log('Has APPROVE (from membership edge):', hasApprove);

    console.log('--- Test Complete ---');
}

testAuthorityGraph().catch(e => {
    console.error('Test Failed:', e);
    process.exit(1);
});
