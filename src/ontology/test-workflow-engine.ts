import { WorkflowEngine, WorkflowPersistenceService } from './workflow-engine.js';
import { DomainEvent } from './rule-types.js';
import {
    WorkflowVersion,
    WorkflowInstance,
    WorkflowInstanceStatus,
    StepExecutionStatus,
    HumanTaskStatus,
} from './workflow-types.js';

// Mock Workflow Version
const testWorkflow: WorkflowVersion = {
    id: 'wv1',
    workflow_id: 'wd1',
    ontology_version_id: 'v1' as any,
    version_number: 1,
    trigger_config: {
        event_type: 'ORDER_CREATED',
    },
    steps: [
        {
            id: 'step1',
            type: 'AUTOMATED',
            config: { action: 'validate' },
            transitions: { success: 'step2' },
        },
        {
            id: 'step2',
            type: 'HUMAN_TASK',
            config: { assignee_id: 'u1', timeout: 3600 },
            transitions: { approve: 'step3', reject: 'failed' },
        },
        {
            id: 'step3',
            type: 'COMPLETED',
            config: {},
            transitions: {},
        },
    ],
};

// Mock Persistence
let instances: any[] = [];
let executions: any[] = [];
let tasks: any[] = [];

const mockPersistence: WorkflowPersistenceService = {
    getPublishedWorkflows: async () => [testWorkflow],
    createInstance: async (data: any) => {
        const instance = { id: 'inst' + (instances.length + 1), ...data, started_at: new Date() };
        instances.push(instance);
        return instance;
    },
    updateInstance: async (id, updates) => {
        const idx = instances.findIndex(i => i.id === id);
        if (idx !== -1) instances[idx] = { ...instances[idx], ...updates };
    },
    getInstance: async (id) => instances.find(i => i.id === id) || null,
    createStepExecution: async (data: any) => {
        const id = 'exec' + (executions.length + 1);
        executions.push({ id, ...data });
        return id;
    },
    updateStepExecution: async (id, updates) => {
        const idx = executions.findIndex(e => e.id === id);
        if (idx !== -1) executions[idx] = { ...executions[idx], ...updates };
    },
    createHumanTask: async (data: any) => {
        const id = 'task' + (tasks.length + 1);
        tasks.push({ id, ...data });
        return id;
    },
    getHumanTask: async (id) => tasks.find(t => t.id === id) || null,
    updateHumanTask: async (id, updates) => {
        const idx = tasks.findIndex(t => t.id === id);
        if (idx !== -1) tasks[idx] = { ...tasks[idx], ...updates };
    },
};

const engine = new WorkflowEngine(mockPersistence);

// Mock helper for engine (since we didn't implement the full version resolver in engine)
(engine as any).getWorkflowVersion = async () => testWorkflow;
(engine as any).getStepExecution = async (id: string) => executions.find(e => e.id === id);

async function runTests() {
    console.log('Running Workflow Engine Tests...\n');

    // 1. Trigger Workflow
    const event: DomainEvent = {
        id: 'ev1',
        rule_version_id: 'rv1',
        entity_version_id: 'env1' as any,
        event_type: 'ORDER_CREATED',
        payload: { order_id: 'o123' },
        created_at: new Date(),
    };

    console.log('Test 1: Triggering Workflow...');
    await engine.onDomainEvent(event);

    const instance = instances[0];
    console.log('- Instance created:', instance ? 'PASSED' : 'FAILED');
    console.log('- Current status (should be WAITING after step2):', instance.status === WorkflowInstanceStatus.WAITING ? 'PASSED' : 'FAILED');
    console.log('- Executions count (should be 2: step1, step2):', executions.length === 2 ? 'PASSED' : 'FAILED');
    console.log('- Human tasks count (should be 1):', tasks.length === 1 ? 'PASSED' : 'FAILED');

    // 2. Handle Human Decision
    console.log('\nTest 2: Handling Human Decision (Approve)...');
    const task = tasks[0];
    await engine.handleHumanDecision(task.id, { action: 'approve', comment: 'looks good' });

    const updatedInstance = instances[0];
    console.log('- Instance status (should be COMPLETED):', updatedInstance.status === WorkflowInstanceStatus.COMPLETED ? 'PASSED' : 'FAILED');
    console.log('- Executions count (should be 3: step1, step2, step3):', executions.length === 3 ? 'PASSED' : 'FAILED');
    console.log('- Task status (should be COMPLETED):', tasks[0].status === HumanTaskStatus.COMPLETED ? 'PASSED' : 'FAILED');

    // 3. Handle Human Rejection
    console.log('\nTest 3: Handling Human Decision (Reject)...');
    instances = []; executions = []; tasks = []; // Reset
    await engine.onDomainEvent(event);
    const task2 = tasks[0];
    await engine.handleHumanDecision(task2.id, { action: 'reject', reason: 'invalid data' });

    const rejectedInstance = instances[0];
    console.log('- Instance status (should be FAILED):', rejectedInstance.status === WorkflowInstanceStatus.FAILED ? 'PASSED' : 'FAILED');
    console.log('- Task status (should be COMPLETED):', tasks[0].status === HumanTaskStatus.COMPLETED ? 'PASSED' : 'FAILED');

    console.log('\nTests Completed.');
}

runTests().catch(console.error);
