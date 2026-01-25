export enum WorkflowStatus {
    RUNNING = 'RUNNING',
    WAITING = 'WAITING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED'
}

export enum WorkflowStepType {
    HUMAN_APPROVAL = 'HUMAN_APPROVAL',
    SYSTEM_WAIT = 'SYSTEM_WAIT'
}

export enum WorkflowTaskStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    REJECTED = 'REJECTED'
}

export interface WorkflowInstanceSummary {
    id: string;
    workflow_definition_id: string;
    workflow_version: string;
    status: WorkflowStatus;
    current_step_id: string;
    started_at: string;
    updated_at: string;
    tenant_id: string;
    owner_id?: string; // Who started it
}

export interface WorkflowStepTask {
    id: string;
    workflow_instance_id: string;
    step_id: string;
    step_type: WorkflowStepType;
    status: WorkflowTaskStatus;
    assigned_role?: string;
    assigned_actor_id?: string;
    created_at: string;
    completed_at?: string;
    decision?: {
        decision: 'APPROVE' | 'REJECT';
        justification: string;
        actor_id: string;
        timestamp: string;
    };
    context_snapshot?: any; // Snapshot of data at creation time for context
}
