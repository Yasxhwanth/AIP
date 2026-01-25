
import { authorityLifecycleManager } from './AuthorityLifecycleManager';
import { authorityGraphEngine } from './AuthorityGraphEngine';
import { AuthorityIntent, AuthorityScope, AuthorityConstraints } from './authority-types';

async function testAuthorityLifecycle() {
    console.log('--- Testing Authority Lifecycle ---');

    const tenantId = 'tenant-1';
    const actorId = 'user-lifecycle-1';
    const adminId = 'admin-1';

    // 1. Grant Authority
    console.log('1. Testing Grant Authority...');
    const scope: AuthorityScope = { operations: ['EXECUTE_ACTION'] };
    const constraints: AuthorityConstraints = {};

    const grant = authorityLifecycleManager.grantAuthority(
        'system',
        actorId,
        AuthorityIntent.REQUEST_EXECUTION,
        scope,
        constraints,
        adminId
    );
    console.log('Granted:', grant.grantId);

    // Verify it resolves now
    const snapshot1 = authorityGraphEngine.resolveAuthoritySnapshot(actorId, tenantId, new Date());
    const hasExecute1 = snapshot1.permissions.some(p => p.authority_type === 'EXECUTE');
    console.log('Has EXECUTE (Active):', hasExecute1);
    if (!hasExecute1) throw new Error('Failed to resolve active grant');

    // 2. Revoke Authority
    console.log('2. Testing Revocation...');
    // Wait a tiny bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    authorityLifecycleManager.revokeAuthority(grant.grantId, 'Testing revocation', adminId);
    console.log('Revoked:', grant.grantId);

    // Verify it does NOT resolve now
    const snapshot2 = authorityGraphEngine.resolveAuthoritySnapshot(actorId, tenantId, new Date());
    const hasExecute2 = snapshot2.permissions.some(p => p.authority_type === 'EXECUTE');
    console.log('Has EXECUTE (Revoked):', hasExecute2);
    if (hasExecute2) throw new Error('Resolved revoked authority');

    // 3. Time Travel (Replay)
    console.log('3. Testing Time Travel...');
    // Check at time of grant (before revocation)
    const timeOfGrant = new Date(grant.createdAt);
    // Add a small buffer to ensure we are "after" creation but "before" revocation
    // Actually, let's just use a time between creation and revocation.
    // Since we didn't capture exact timestamps in variables, let's rely on the manager's logic.
    // We can just use the grant's createdAt time + 1ms.
    const replayTime = new Date(new Date(grant.createdAt).getTime() + 1);

    const snapshot3 = authorityGraphEngine.resolveAuthoritySnapshot(actorId, tenantId, replayTime);
    const hasExecute3 = snapshot3.permissions.some(p => p.authority_type === 'EXECUTE');
    console.log('Has EXECUTE (Replay at creation):', hasExecute3);
    if (!hasExecute3) throw new Error('Failed to resolve authority during replay');

    // 4. Emergency Grant Expiration
    console.log('4. Testing Emergency Grant Expiration...');
    const emergencyGrant = authorityLifecycleManager.grantAuthority(
        'system',
        actorId,
        AuthorityIntent.APPROVE_EXECUTION,
        scope,
        constraints,
        adminId,
        true, // isEmergency
        new Date(Date.now() - 1000).toISOString() // Expired 1 second ago
    );
    console.log('Granted Emergency (Expired):', emergencyGrant.grantId);

    const snapshot4 = authorityGraphEngine.resolveAuthoritySnapshot(actorId, tenantId, new Date());
    const hasApprove = snapshot4.permissions.some(p => p.authority_type === 'APPROVE');
    console.log('Has APPROVE (Expired):', hasApprove);
    if (hasApprove) throw new Error('Resolved expired emergency authority');

    console.log('--- Test Complete ---');
}

testAuthorityLifecycle().catch(e => {
    console.error('Test Failed:', e);
    process.exit(1);
});
