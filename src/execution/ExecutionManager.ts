import {
    ExecutionIntent,
    ExecutionStatus,
    ExecutionMode,
    ExecutionCommand,
    ExecutionAttempt,
    ExecutionResult
} from './execution-types';
import { DryRunExecutor, RealRunExecutor, Executor } from './Executors';
import { authorityEvaluator } from '../authority/AuthorityEvaluator';
import { AuthorityIntent, AuthorityStatus } from '../authority/authority-types';

import { TenantContextManager } from '../tenant/TenantContext';
import { IdentityContext } from '../identity/IdentityContext';
import { authorityGraphEngine } from '../authority/AuthorityGraphEngine';

export class ExecutionManager {
    private intents: Map<string, ExecutionIntent> = new Map();
    private attempts: ExecutionAttempt[] = [];

    private dryRunExecutor = new DryRunExecutor();
    private realRunExecutor = new RealRunExecutor();

    /**
     * Creates a new Execution Intent.
     * Validates REQUEST_EXECUTION authority.
     */
    public createIntent(
        decisionId: string,
        actionType: string,
        targetEntities: string[],
        parameters: Record<string, any>,
        requestedBy: string,
        targetScenarioId?: string
    ): ExecutionIntent {
        // 0. Get Tenant Context
        const { tenantId } = TenantContextManager.getContext();
        const identityContext = IdentityContext.getInstance().getCurrentContext();
        if (identityContext.tenant_id !== tenantId) throw new Error('Tenant mismatch');

        // 1. Check Authority: REQUEST_EXECUTION
        // Phase 30: Use AuthorityGraphEngine
        const snapshot = authorityGraphEngine.resolveAuthoritySnapshot(requestedBy, tenantId, new Date());

        // Check if we have EXECUTE permission for this action
        const hasPermission = snapshot.permissions.some(p =>
            p.authority_type === 'EXECUTE' &&
            (p.scope.action_definition_id === actionType || !p.scope.action_definition_id) // Simple scope check
        );

        if (!hasPermission) {
            throw new Error(`Unauthorized to request execution: No EXECUTE authority found for ${actionType}`);
        }

        // 2. Generate Idempotency Key
        const idempotencyKey = this.generateIdempotencyKey(decisionId, actionType, targetEntities, parameters);

        // 3. Create Intent
        const intent: ExecutionIntent = {
            intentId: globalThis.crypto.randomUUID(),
            tenantId, // Enforce Tenant Binding
            decisionId,
            actionType,
            targetEntities,
            parameters,
            idempotencyKey,
            requestedBy,
            performedBySessionId: identityContext.session_id,
            authority_snapshot_id: snapshot.id,
            requestedAt: new Date().toISOString(),
            targetScenarioId,
            status: ExecutionStatus.PENDING,
            statusHistory: [{
                status: ExecutionStatus.PENDING,
                timestamp: new Date().toISOString(),
                changedBy: requestedBy
            }]
        };

        this.intents.set(intent.intentId, intent);
        return intent;
    }

    /**
     * Runs a Dry Run for the intent.
     * Transitions status to DRY_RUN_COMPLETED.
     */
    public async runDryRun(intentId: string, actorId: string): Promise<ExecutionAttempt> {
        const intent = this.getIntent(intentId);

        // Lifecycle Check
        if (intent.status !== ExecutionStatus.PENDING && intent.status !== ExecutionStatus.DRY_RUN_COMPLETED) {
            throw new Error(`Invalid status for Dry Run: ${intent.status}`);
        }

        const command: ExecutionCommand = {
            intentId: intent.intentId,
            tenantId: intent.tenantId,
            actionType: intent.actionType,
            parameters: intent.parameters,
            idempotencyKey: intent.idempotencyKey,
            mode: ExecutionMode.DRY_RUN,
            targetScenarioId: intent.targetScenarioId
        };

        const result = await this.dryRunExecutor.execute(command);

        const attempt = this.recordAttempt(intent, ExecutionMode.DRY_RUN, result);

        if (result.success) {
            this.updateStatus(intent, ExecutionStatus.DRY_RUN_COMPLETED, actorId);
        } else {
            this.updateStatus(intent, ExecutionStatus.FAILED, actorId);
        }

        return attempt;
    }

    /**
     * Approves the intent for Real Run.
     * Validates APPROVE_EXECUTION authority.
     */
    public approveExecution(intentId: string, actorId: string): void {
        const intent = this.getIntent(intentId);

        // Lifecycle Check
        if (intent.status !== ExecutionStatus.DRY_RUN_COMPLETED) {
            throw new Error(`Cannot approve execution. Current status: ${intent.status}. Must complete Dry Run first.`);
        }

        // Authority Check: APPROVE_EXECUTION
        const authResult = authorityEvaluator.evaluate({
            actorId: actorId,
            intentType: AuthorityIntent.APPROVE_EXECUTION,
            targetEntityId: intent.targetEntities[0],
            context: { asOf: new Date() }
        });

        if (authResult.status !== AuthorityStatus.ALLOWED) {
            throw new Error(`Unauthorized to approve execution: ${authResult.reason?.message}`);
        }

        this.updateStatus(intent, ExecutionStatus.APPROVED, actorId);
    }

    /**
     * Executes the Real Run.
     * Requires APPROVED status.
     * Re-validates authority snapshot.
     */
    public async executeRealRun(intentId: string, actorId: string): Promise<ExecutionAttempt> {
        const intent = this.getIntent(intentId);

        // Lifecycle Check
        if (intent.status !== ExecutionStatus.APPROVED) {
            throw new Error(`Cannot execute. Intent is not APPROVED. Current status: ${intent.status}`);
        }

        // Final Authority Check (Snapshot)
        const authResult = authorityEvaluator.evaluate({
            actorId: actorId, // The person triggering the final click
            intentType: AuthorityIntent.APPROVE_EXECUTION, // Or a specific EXECUTE intent? Using APPROVE for now as per plan
            targetEntityId: intent.targetEntities[0],
            context: { asOf: new Date() }
        });

        if (authResult.status !== AuthorityStatus.ALLOWED) {
            this.updateStatus(intent, ExecutionStatus.FAILED, actorId);
            throw new Error(`Execution blocked: Authority revoked since approval.`);
        }

        const command: ExecutionCommand = {
            intentId: intent.intentId,
            tenantId: intent.tenantId,
            actionType: intent.actionType,
            parameters: intent.parameters,
            idempotencyKey: intent.idempotencyKey,
            mode: ExecutionMode.REAL_RUN,
            targetScenarioId: intent.targetScenarioId
        };

        const result = await this.realRunExecutor.execute(command);

        const attempt = this.recordAttempt(intent, ExecutionMode.REAL_RUN, result, authResult.proof);

        if (result.success) {
            this.updateStatus(intent, ExecutionStatus.EXECUTED, actorId);
        } else {
            this.updateStatus(intent, ExecutionStatus.FAILED, actorId);
        }

        return attempt;
    }

    public getIntent(intentId: string): ExecutionIntent {
        const intent = this.intents.get(intentId);
        if (!intent) throw new Error(`Intent ${intentId} not found`);

        // Enforce Tenant Isolation
        TenantContextManager.verifyTenant(intent.tenantId);

        return intent;
    }

    private updateStatus(intent: ExecutionIntent, status: ExecutionStatus, actorId: string) {
        intent.status = status;
        intent.statusHistory.push({
            status,
            timestamp: new Date().toISOString(),
            changedBy: actorId
        });
    }

    private recordAttempt(
        intent: ExecutionIntent,
        mode: ExecutionMode,
        result: ExecutionResult,
        proof?: any
    ): ExecutionAttempt {
        const attempt: ExecutionAttempt = {
            attemptId: globalThis.crypto.randomUUID(),
            intentId: intent.intentId,
            mode,
            performedBySessionId: IdentityContext.getInstance().getCurrentContext().session_id,
            startedAt: new Date().toISOString(), // Approximation
            completedAt: new Date().toISOString(),
            result,
            executionAuthorityProofSnapshot: proof,
            executionEnvironment: {
                // @ts-ignore - Vite specific
                nodeEnv: import.meta.env?.MODE || 'development'
            }
        };
        // Ensure result has tenantId (runtime patch if executor didn't set it)
        if (!attempt.result.tenantId) {
            // @ts-ignore
            attempt.result.tenantId = intent.tenantId;
        }
        this.attempts.push(attempt);
        return attempt;
    }

    private generateIdempotencyKey(decisionId: string, actionType: string, targetEntities: string[], parameters: any): string {
        const data = `${decisionId}:${actionType}:${targetEntities.sort().join(',')}:${JSON.stringify(parameters)}`;
        // Simple synchronous hash for browser (DJB2 variant)
        let hash = 5381;
        for (let i = 0; i < data.length; i++) {
            hash = ((hash << 5) + hash) + data.charCodeAt(i); /* hash * 33 + c */
        }
        return (hash >>> 0).toString(16); // Ensure unsigned 32-bit integer
    }

    // Read-only accessors for analytics/metrics (no mutation, return copies)
    public getAllIntents(): ExecutionIntent[] {
        return Array.from(this.intents.values());
    }

    public getAllAttempts(): ExecutionAttempt[] {
        return [...this.attempts];
    }
}

export const executionManager = new ExecutionManager();
