import { DomainEvent } from './rule-types.js';
import {
    WorkflowVersion,
    WorkflowInstance,
    WorkflowStep,
    WorkflowInstanceStatus,
    StepExecutionStatus,
    HumanTaskStatus,
    Metadata,
} from './workflow-types.js';

/**
 * Persistence service for workflow state.
 */
export interface WorkflowPersistenceService {
    /** Gets all published workflow versions for an ontology version */
    getPublishedWorkflows(ontologyVersionId: string): Promise<WorkflowVersion[]>;

    /** Creates a new workflow instance */
    createInstance(instance: Omit<WorkflowInstance, 'id' | 'started_at'>): Promise<WorkflowInstance>;

    /** Updates an existing workflow instance */
    updateInstance(id: string, updates: Partial<WorkflowInstance>): Promise<void>;

    /** Gets a workflow instance by ID */
    getInstance(id: string): Promise<WorkflowInstance | null>;

    /** Records a step execution */
    createStepExecution(execution: any): Promise<string>;

    /** Updates a step execution (only if not finished) */
    updateStepExecution(id: string, updates: any): Promise<void>;

    /** Creates a human task */
    createHumanTask(task: any): Promise<string>;

    /** Gets a human task by ID */
    getHumanTask(id: string): Promise<any>;

    /** Updates a human task */
    updateHumanTask(id: string, updates: any): Promise<void>;
}

/**
 * Core engine for executing declarative workflows.
 */
export class WorkflowEngine {
    constructor(private persistenceService: WorkflowPersistenceService) { }

    /**
     * Entry point for domain events. Triggers matching workflows.
     */
    public async onDomainEvent(event: DomainEvent): Promise<void> {
        // 1. Resolve ontology version (this would come from the event's context)
        // For now, we'll assume we can get it or it's passed in.
        const ontologyVersionId = 'v1'; // Mocked

        // 2. Get workflows matching this event type
        const workflows = await this.persistenceService.getPublishedWorkflows(ontologyVersionId);
        const matchingWorkflows = workflows.filter(wf => wf.trigger_config.event_type === event.event_type);

        // 3. Start instances
        for (const workflow of matchingWorkflows) {
            const instance = await this.persistenceService.createInstance({
                workflow_version_id: workflow.id,
                trigger_event_id: event.id,
                subject_entity_version_id: event.entity_version_id,
                status: WorkflowInstanceStatus.RUNNING,
                current_step_id: workflow.steps[0]?.id || null,
                context: {
                    event_payload: event.payload,
                },
                finished_at: null,
            });

            if (instance.current_step_id) {
                await this.executeStep(instance.id, instance.current_step_id);
            }
        }
    }

    /**
     * Executes a single step in a workflow instance.
     * 
     * @invariant WF-6: No direct ontology queries. Use context/event/snapshot.
     * @invariant WF-7: Step executions are immutable once finished.
     */
    public async executeStep(instanceId: string, stepId: string): Promise<void> {
        const instance = await this.persistenceService.getInstance(instanceId);
        if (!instance || instance.status !== WorkflowInstanceStatus.RUNNING) return;

        // 1. Resolve workflow version and step definition
        // This assumes we can fetch the version from the instance.
        // For brevity, we'll assume we have the steps available.
        const workflowVersion = await this.getWorkflowVersion(instance.workflow_version_id);
        const step = workflowVersion.steps.find(s => s.id === stepId);
        if (!step) {
            await this.failInstance(instanceId, `Step ${stepId} not found`);
            return;
        }

        // 2. Create step execution record
        const executionId = await this.persistenceService.createStepExecution({
            workflow_instance_id: instanceId,
            step_id: stepId,
            status: StepExecutionStatus.IN_PROGRESS,
            input: instance.context,
            started_at: new Date(),
        });

        // 3. Handle step by type
        try {
            switch (step.type) {
                case 'AUTOMATED':
                    await this.handleAutomatedStep(instance, step, executionId);
                    break;
                case 'HUMAN_TASK':
                    await this.handleHumanTaskStep(instance, step, executionId);
                    break;
                case 'COMPLETED':
                    await this.completeInstance(instanceId);
                    break;
                default:
                    throw new Error(`Unsupported step type: ${step.type}`);
            }
        } catch (error: any) {
            await this.persistenceService.updateStepExecution(executionId, {
                status: StepExecutionStatus.FAILED,
                output: { error: error.message },
                finished_at: new Date(),
            });
            await this.failInstance(instanceId, error.message);
        }
    }

    /**
     * Resumes workflow execution after a human decision.
     */
    public async handleHumanDecision(taskId: string, decision: Metadata): Promise<void> {
        const task = await this.persistenceService.getHumanTask(taskId);
        if (!task || task.status !== HumanTaskStatus.PENDING) return;

        // 1. Update task
        await this.persistenceService.updateHumanTask(taskId, {
            status: HumanTaskStatus.COMPLETED,
            decision,
            completed_at: new Date(),
        });

        // 2. Update step execution
        await this.persistenceService.updateStepExecution(task.step_execution_id, {
            status: StepExecutionStatus.COMPLETED,
            output: decision,
            finished_at: new Date(),
        });

        // 3. Resolve next step and resume
        const execution = await this.getStepExecution(task.step_execution_id);
        const instance = await this.persistenceService.getInstance(execution.workflow_instance_id);
        if (!instance) return;

        const workflowVersion = await this.getWorkflowVersion(instance.workflow_version_id);
        const step = workflowVersion.steps.find(s => s.id === execution.step_id);
        if (!step) return;

        // Transition logic
        const decisionKey = decision.action as string; // Convention: 'action' field in decision
        const nextStepId = step.transitions[decisionKey] || step.transitions['default'];

        if (nextStepId) {
            await this.persistenceService.updateInstance(instance.id, {
                status: WorkflowInstanceStatus.RUNNING,
                current_step_id: nextStepId,
            });
            await this.executeStep(instance.id, nextStepId);
        } else {
            await this.completeInstance(instance.id);
        }
    }

    private async handleAutomatedStep(instance: WorkflowInstance, step: WorkflowStep, executionId: string) {
        // In a real system, this would call a plugin or service.
        // For Phase 7, we just simulate a successful execution.
        const output = { result: 'success' };

        await this.persistenceService.updateStepExecution(executionId, {
            status: StepExecutionStatus.COMPLETED,
            output,
            finished_at: new Date(),
        });

        const nextStepId = step.transitions['success'] || step.transitions['default'];
        if (nextStepId) {
            await this.persistenceService.updateInstance(instance.id, { current_step_id: nextStepId });
            await this.executeStep(instance.id, nextStepId);
        } else {
            await this.completeInstance(instance.id);
        }
    }

    private async handleHumanTaskStep(instance: WorkflowInstance, step: WorkflowStep, executionId: string) {
        // Create human task and pause instance
        await this.persistenceService.createHumanTask({
            step_execution_id: executionId,
            assignee_id: step.config.assignee_id,
            status: HumanTaskStatus.PENDING,
            due_at: step.config.timeout ? new Date(Date.now() + step.config.timeout) : null,
        });

        await this.persistenceService.updateInstance(instance.id, {
            status: WorkflowInstanceStatus.WAITING,
        });
    }

    private async completeInstance(id: string) {
        await this.persistenceService.updateInstance(id, {
            status: WorkflowInstanceStatus.COMPLETED,
            current_step_id: null,
            finished_at: new Date(),
        });
    }

    private async failInstance(id: string, reason: string) {
        await this.persistenceService.updateInstance(id, {
            status: WorkflowInstanceStatus.FAILED,
            current_step_id: null,
            finished_at: new Date(),
            context: { error: reason },
        });
    }

    // Mock helpers for brevity
    private async getWorkflowVersion(id: string): Promise<WorkflowVersion> {
        // In a real system, this would be fetched from persistence
        return {} as any;
    }

    private async getStepExecution(id: string): Promise<any> {
        return {} as any;
    }
}
