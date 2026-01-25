import {
    WorkflowInstanceSummary,
    WorkflowStepTask,
    WorkflowStatus,
    WorkflowStepType,
    WorkflowTaskStatus
} from './workflow-runtime-types';

export class WorkflowRuntimeStore {
    private instances: Map<string, WorkflowInstanceSummary> = new Map();
    private tasks: Map<string, WorkflowStepTask> = new Map();

    constructor() {
        // Initialize with some mock data for development
        this.seedMockData();
    }

    public getWorkflowInstances(tenantId: string, asOf: Date): WorkflowInstanceSummary[] {
        return Array.from(this.instances.values())
            .filter(i => i.tenant_id === tenantId)
            // In a real system, we'd filter by asOf, but for now we just return current state
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    }

    public getWorkflowInstance(id: string): WorkflowInstanceSummary | undefined {
        return this.instances.get(id);
    }

    public getPendingTasks(actorId: string, tenantId: string): WorkflowStepTask[] {
        return Array.from(this.tasks.values())
            .filter(t =>
                t.status === WorkflowTaskStatus.PENDING &&
                (t.assigned_actor_id === actorId || !t.assigned_actor_id) && // Assigned to actor or open role (simplified)
                this.instances.get(t.workflow_instance_id)?.tenant_id === tenantId
            );
    }

    public getTasksForWorkflow(instanceId: string): WorkflowStepTask[] {
        return Array.from(this.tasks.values())
            .filter(t => t.workflow_instance_id === instanceId)
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }

    // Internal method for Engine to update state
    public updateInstance(instance: WorkflowInstanceSummary) {
        this.instances.set(instance.id, instance);
    }

    public updateTask(task: WorkflowStepTask) {
        this.tasks.set(task.id, task);
    }

    public createTask(task: WorkflowStepTask) {
        this.tasks.set(task.id, task);
    }

    private seedMockData() {
        const tenantId = 'tenant-1'; // Default mock tenant
        const actorId = 'user-1';

        // Mock Instance 1: Running
        const id1 = 'wf-inst-1';
        this.instances.set(id1, {
            id: id1,
            workflow_definition_id: 'wf-def-approval-chain',
            workflow_version: '1.0.0',
            status: WorkflowStatus.RUNNING,
            current_step_id: 'step-manager-approval',
            started_at: new Date(Date.now() - 3600000).toISOString(),
            updated_at: new Date(Date.now() - 1800000).toISOString(),
            tenant_id: tenantId,
            owner_id: actorId
        });

        this.tasks.set('task-1', {
            id: 'task-1',
            workflow_instance_id: id1,
            step_id: 'step-initial-review',
            step_type: WorkflowStepType.HUMAN_APPROVAL,
            status: WorkflowTaskStatus.COMPLETED,
            assigned_actor_id: actorId,
            created_at: new Date(Date.now() - 3600000).toISOString(),
            completed_at: new Date(Date.now() - 3500000).toISOString(),
            decision: {
                decision: 'APPROVE',
                justification: 'Looks good to me.',
                actor_id: actorId,
                timestamp: new Date(Date.now() - 3500000).toISOString()
            }
        });

        this.tasks.set('task-2', {
            id: 'task-2',
            workflow_instance_id: id1,
            step_id: 'step-manager-approval',
            step_type: WorkflowStepType.HUMAN_APPROVAL,
            status: WorkflowTaskStatus.PENDING,
            assigned_actor_id: actorId,
            created_at: new Date(Date.now() - 3500000).toISOString(),
            context_snapshot: {
                amount: 50000,
                currency: 'USD',
                requester: 'John Doe'
            }
        });

        // Mock Instance 2: Completed
        const id2 = 'wf-inst-2';
        this.instances.set(id2, {
            id: id2,
            workflow_definition_id: 'wf-def-deployment',
            workflow_version: '2.1.0',
            status: WorkflowStatus.COMPLETED,
            current_step_id: 'step-deploy-prod',
            started_at: new Date(Date.now() - 86400000).toISOString(),
            updated_at: new Date(Date.now() - 82800000).toISOString(),
            tenant_id: tenantId,
            owner_id: actorId
        });
    }
}

export const workflowRuntimeStore = new WorkflowRuntimeStore();
