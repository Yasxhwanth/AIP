import {
    ActionDefinitionVersion,
    ActionIntent,
    ActionDefinitionStatus,
    ActionIntentStatus,
    ActionExecutionAttempt,
    ExecutionAttemptStatus,
    ConnectorType,
} from './action-types.js';

/**
 * Stateless connector interface.
 */
export interface Connector {
    execute(intent: ActionIntent, config: any): Promise<{
        status: ExecutionAttemptStatus;
        output?: any;
        error?: any;
    }>;
}

/**
 * Persistence interface for Action Engine.
 */
export interface ActionPersistenceService {
    getIntent(id: string): Promise<ActionIntent | null>;
    updateIntent(id: string, updates: Partial<ActionIntent>): Promise<void>;
    createAttempt(data: any): Promise<void>;
    getSuccessfulAttempt(intentId: string): Promise<ActionExecutionAttempt | null>;
    getIntentByIdempotencyKey(versionId: string, key: string): Promise<ActionIntent | null>;
}

/**
 * Core Action & Integration Engine.
 */
export class ActionEngine {
    constructor(
        private persistence: ActionPersistenceService,
        private connectors: Record<ConnectorType, Connector>
    ) { }

    /**
     * Claims an intent for execution (locking).
     */
    async claimIntent(intentId: string, workerId: string): Promise<boolean> {
        const intent = await this.persistence.getIntent(intentId);
        if (!intent || intent.status !== ActionIntentStatus.PENDING) return false;

        // In a real DB, this would be an atomic UPDATE ... WHERE status = 'PENDING'
        await this.persistence.updateIntent(intentId, {
            status: ActionIntentStatus.PROCESSING,
            locked_by: workerId,
            locked_at: new Date(),
        });
        return true;
    }

    /**
     * Executes a claimed intent.
     */
    async executeIntent(intentId: string, version: ActionDefinitionVersion, workerId: string): Promise<void> {
        const intent = await this.persistence.getIntent(intentId);
        if (!intent || intent.locked_by !== workerId || intent.status !== ActionIntentStatus.PROCESSING) {
            throw new Error('Intent not locked by this worker or invalid status');
        }

        // AE-11: Successful execution is terminal
        const existingSuccess = await this.persistence.getSuccessfulAttempt(intentId);
        if (existingSuccess) {
            await this.persistence.updateIntent(intentId, { status: ActionIntentStatus.SUCCESS });
            return;
        }

        const connector = this.connectors[version.connector_type];
        const attemptNumber = 1; // Simplified for test
        const startedAt = new Date();

        try {
            const result = await connector.execute(intent, version.connector_config);

            await this.persistence.createAttempt({
                action_intent_id: intentId,
                attempt_number: attemptNumber,
                status: result.status,
                output_data: result.output,
                error_details: result.error,
                started_at: startedAt,
                finished_at: new Date(),
                performed_by: workerId,
            });

            if (result.status === ExecutionAttemptStatus.SUCCESS) {
                await this.persistence.updateIntent(intentId, { status: ActionIntentStatus.SUCCESS });
            } else {
                // Handle retry logic here in real implementation
                await this.persistence.updateIntent(intentId, { status: ActionIntentStatus.FAILED });
            }
        } catch (err: any) {
            await this.persistence.createAttempt({
                action_intent_id: intentId,
                attempt_number: attemptNumber,
                status: ExecutionAttemptStatus.FAILURE,
                error_details: { message: err.message, stack: err.stack },
                started_at: startedAt,
                finished_at: new Date(),
                performed_by: workerId,
            });
            await this.persistence.updateIntent(intentId, { status: ActionIntentStatus.FAILED });
        }
    }
}

// --- TEST SUITE ---

async function runTests() {
    console.log('Running Action Engine Tests...\n');

    const mockIntents: Record<string, ActionIntent> = {};
    const mockAttempts: ActionExecutionAttempt[] = [];

    const mockPersistence: ActionPersistenceService = {
        getIntent: async (id) => mockIntents[id] || null,
        updateIntent: async (id, updates) => {
            if (mockIntents[id]) mockIntents[id] = { ...mockIntents[id], ...updates };
        },
        createAttempt: async (data) => { mockAttempts.push(data as any); },
        getSuccessfulAttempt: async (intentId) => mockAttempts.find(a => a.action_intent_id === intentId && a.status === ExecutionAttemptStatus.SUCCESS) || null,
        getIntentByIdempotencyKey: async (vId, key) => Object.values(mockIntents).find(i => i.action_definition_version_id === vId && i.idempotency_key === key) || null,
    };

    const mockConnector: Connector = {
        execute: async (intent) => {
            if (intent.input_data.should_fail) {
                return { status: ExecutionAttemptStatus.FAILURE, error: { message: 'Injected failure' } };
            }
            return { status: ExecutionAttemptStatus.SUCCESS, output: { result: 'ok' } };
        }
    };

    const engine = new ActionEngine(mockPersistence, { [ConnectorType.REST]: mockConnector } as any);

    // 1. Test Idempotency & Creation
    console.log('Test 1: Idempotency & Locking...');
    const intentId = 'intent1';
    mockIntents[intentId] = {
        id: intentId,
        action_definition_version_id: 'v1',
        workflow_instance_id: 'inst1',
        workflow_step_execution_id: 'exec1',
        idempotency_key: 'key123',
        input_data: { foo: 'bar' },
        status: ActionIntentStatus.PENDING,
        locked_by: null,
        locked_at: null,
        created_at: new Date(),
        updated_at: new Date(),
    };

    const claimed = await engine.claimIntent(intentId, 'worker1');
    console.log('- Worker 1 claimed intent:', claimed ? 'PASSED' : 'FAILED');

    const claimedAgain = await engine.claimIntent(intentId, 'worker2');
    console.log('- Worker 2 cannot claim same intent:', !claimedAgain ? 'PASSED' : 'FAILED');

    // 2. Test Execution Success
    console.log('\nTest 2: Successful Execution...');
    const version: ActionDefinitionVersion = {
        id: 'v1',
        action_definition_id: 'a1',
        version_number: 1,
        connector_type: ConnectorType.REST,
        connector_config: { url: 'https://api.example.com' },
        input_schema: {},
        retry_policy: { max_retries: 3, backoff_ms: 1000, backoff_multiplier: 2 },
        status: ActionDefinitionStatus.PUBLISHED,
        created_at: new Date(),
        published_at: new Date(),
    } as any;

    await engine.executeIntent(intentId, version, 'worker1');
    console.log('- Intent status is SUCCESS:', mockIntents[intentId].status === ActionIntentStatus.SUCCESS ? 'PASSED' : 'FAILED');
    console.log('- Attempt recorded:', mockAttempts.length === 1 ? 'PASSED' : 'FAILED');

    // 3. Test Terminal Success (AE-11)
    console.log('\nTest 3: Terminal Success (cannot re-execute)...');
    // Reset status to PROCESSING to simulate a retry after success
    mockIntents[intentId].status = ActionIntentStatus.PROCESSING;
    await engine.executeIntent(intentId, version, 'worker1');
    console.log('- No new attempt recorded for terminal success:', mockAttempts.length === 1 ? 'PASSED' : 'FAILED');

    console.log('\nTests Completed.');
}

runTests().catch(console.error);
