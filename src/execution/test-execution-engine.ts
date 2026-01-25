import { executionManager } from './ExecutionManager';
import { authorityEvaluator } from '../authority/AuthorityEvaluator';
import {
    AuthorityNode,
    AuthorityNodeType,
    AuthorityEdge,
    AuthorityEdgeType,
    AuthorityIntent
} from '../authority/authority-types';
import { ExecutionStatus } from './execution-types';

import { TenantContextManager } from '../tenant/TenantContext';

async function runTests() {
    console.log('Running Execution Engine Tests...\n');

    // Setup Tenant Context
    TenantContextManager.setContext({
        tenantId: 'TENANT-A',
        userId: 'USER-EXEC',
        role: 'ADMIN', // specific role
        sessionId: 'SESSION-1'
    });

    // Setup Authority
    const user = { nodeId: 'USER-EXEC', type: AuthorityNodeType.HUMAN };
    const admin = { nodeId: 'ADMIN-EXEC', type: AuthorityNodeType.HUMAN };
    authorityEvaluator.addNode(user);
    authorityEvaluator.addNode(admin);

    // Grant REQUEST_EXECUTION to User
    authorityEvaluator.addEdge({
        edgeId: 'AUTH-REQ',
        fromNodeId: 'USER-EXEC',
        toNodeId: 'SCENARIO-X',
        type: AuthorityEdgeType.DIRECT,
        intent: AuthorityIntent.REQUEST_EXECUTION,
        constraints: {},
        grantedAt: new Date().toISOString(),
        grantedBy: 'SYSTEM'
    });

    // Grant APPROVE_EXECUTION to Admin
    authorityEvaluator.addEdge({
        edgeId: 'AUTH-APP',
        fromNodeId: 'ADMIN-EXEC',
        toNodeId: 'SCENARIO-X',
        type: AuthorityEdgeType.DIRECT,
        intent: AuthorityIntent.APPROVE_EXECUTION,
        constraints: {},
        grantedAt: new Date().toISOString(),
        grantedBy: 'SYSTEM'
    });

    // Test 1: Create Intent (Success)
    console.log('Test 1: Create Intent');
    const intent = executionManager.createIntent(
        'DECISION-1',
        'DEPLOY_RESOURCES',
        ['SCENARIO-X'],
        { amount: 100 },
        'USER-EXEC'
    );
    console.assert(intent.status === ExecutionStatus.PENDING, 'Status should be PENDING');
    console.assert(!!intent.idempotencyKey, 'Idempotency Key should exist');
    console.assert(intent.tenantId === 'TENANT-A', 'Tenant ID should be set');
    console.log('PASS\n');

    // Test 2: Dry Run
    console.log('Test 2: Dry Run');
    const dryRunAttempt = await executionManager.runDryRun(intent.intentId, 'USER-EXEC');
    console.assert(dryRunAttempt.result.success, 'Dry Run should succeed');
    console.assert(intent.status === ExecutionStatus.DRY_RUN_COMPLETED, 'Status should be DRY_RUN_COMPLETED');
    console.log('PASS\n');

    // Test 3: Real Run Blocked (Not Approved)
    console.log('Test 3: Real Run Blocked (Not Approved)');
    try {
        await executionManager.executeRealRun(intent.intentId, 'USER-EXEC');
        console.error('FAIL: Should have thrown error');
    } catch (e: any) {
        console.assert(e.message.includes('not APPROVED'), 'Error should mention approval');
        console.log('PASS\n');
    }

    // Test 4: Approval (Success)
    console.log('Test 4: Approval');
    executionManager.approveExecution(intent.intentId, 'ADMIN-EXEC');
    console.assert(intent.status === ExecutionStatus.APPROVED, 'Status should be APPROVED');
    console.log('PASS\n');

    // Test 5: Real Run (Success)
    console.log('Test 5: Real Run');
    const realRunAttempt = await executionManager.executeRealRun(intent.intentId, 'ADMIN-EXEC');
    console.assert(realRunAttempt.result.success, 'Real Run should succeed');
    console.assert(intent.status === ExecutionStatus.EXECUTED, 'Status should be EXECUTED');
    console.assert(!!realRunAttempt.executionAuthorityProofSnapshot, 'Proof should be captured');
    console.log('PASS\n');

    // Test 6: Idempotency Check
    console.log('Test 6: Idempotency Check');
    const intent2 = executionManager.createIntent(
        'DECISION-1',
        'DEPLOY_RESOURCES',
        ['SCENARIO-X'],
        { amount: 100 },
        'USER-EXEC'
    );
    console.assert(intent.idempotencyKey === intent2.idempotencyKey, 'Keys should match for same input');
    console.log('PASS\n');

    // Test 7: Tenant Isolation (Fail)
    console.log('Test 7: Tenant Isolation');
    TenantContextManager.setContext({
        tenantId: 'TENANT-B', // Switch Tenant
        userId: 'USER-EXEC',
        role: 'ADMIN',
        sessionId: 'SESSION-2'
    });
    try {
        executionManager.getIntent(intent.intentId);
        console.error('FAIL: Should have blocked cross-tenant access');
    } catch (e: any) {
        console.assert(e.message.includes('Cross-tenant access denied'), 'Should throw isolation error');
        console.log('PASS\n');
    }
}

runTests().catch(console.error);
