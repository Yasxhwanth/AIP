import {
    OntologyVersionId,
    EntityVersionId,
    type Metadata,
} from './types.js';

export type { Metadata };

/**
 * Lifecycle status of a workflow definition.
 */
export enum WorkflowStatus {
    /** Mutable, can be edited */
    DRAFT = 'DRAFT',

    /** Immutable, in production use */
    PUBLISHED = 'PUBLISHED',

    /** Superseded, read-only */
    DEPRECATED = 'DEPRECATED',
}

/**
 * Status of a workflow instance.
 */
export enum WorkflowInstanceStatus {
    /** Currently executing steps */
    RUNNING = 'RUNNING',

    /** Paused, waiting for external input (e.g., human task) */
    WAITING = 'WAITING',

    /** Successfully finished all steps */
    COMPLETED = 'COMPLETED',

    /** Execution failed due to error */
    FAILED = 'FAILED',

    /** Manually cancelled */
    CANCELLED = 'CANCELLED',
}

/**
 * Status of a single step execution.
 */
export enum StepExecutionStatus {
    /** Not yet started */
    PENDING = 'PENDING',

    /** Currently executing */
    IN_PROGRESS = 'IN_PROGRESS',

    /** Successfully finished */
    COMPLETED = 'COMPLETED',

    /** Execution failed */
    FAILED = 'FAILED',

    /** Step was skipped due to branching logic */
    SKIPPED = 'SKIPPED',
}

/**
 * Status of a human task.
 */
export enum HumanTaskStatus {
    /** Waiting for assignee action */
    PENDING = 'PENDING',

    /** Assignee approved/completed the task */
    COMPLETED = 'COMPLETED',

    /** Assignee rejected the task */
    REJECTED = 'REJECTED',

    /** Task expired due to timeout */
    EXPIRED = 'EXPIRED',
}

/**
 * Type of workflow step.
 */
export type WorkflowStepType = 'AUTOMATED' | 'HUMAN_TASK' | 'COMPLETED';

/**
 * Declarative step definition.
 */
export interface WorkflowStep {
    /** Unique identifier within the workflow */
    id: string;

    /** Type of step */
    type: WorkflowStepType;

    /** Step-specific configuration */
    config: any;

    /** 
     * Explicit transitions based on step result or human decision.
     * Key is the result/decision string, value is the next step ID.
     */
    transitions: Record<string, string>;
}

/**
 * Trigger configuration for a workflow.
 */
export interface WorkflowTriggerConfig {
    /** Type of domain event that triggers this workflow */
    event_type: string;

    /** Optional condition to match against the event payload/snapshot */
    condition?: any;
}

/**
 * Metadata for a workflow definition.
 */
export interface WorkflowDefinition {
    /** Unique identifier */
    readonly id: string;

    /** Tenant ID (Multi-tenancy) */
    readonly tenant_id: string;

    /** Parent ontology version */
    readonly ontology_version_id: OntologyVersionId;

    /** Machine-readable identifier */
    name: string;

    /** Human-readable name */
    display_name: string;

    /** Detailed description */
    description: string | null;

    /** Lifecycle status */
    status: WorkflowStatus;

    /** Trigger configuration */
    trigger_config: WorkflowTriggerConfig;

    /** Workflow Graph Definition */
    graph: import('../workflows/workflow-graph-types').WorkflowGraph;
}

/**
 * Immutable snapshot of a workflow.
 */
export interface WorkflowVersion {
    /** Unique identifier */
    readonly id: string;

    /** Parent workflow definition */
    readonly workflow_id: string;

    /** Explicit binding to ontology version */
    readonly ontology_version_id: OntologyVersionId;

    /** Sequential version number */
    readonly version_number: number;

    /** Trigger configuration at this point in time */
    readonly trigger_config: WorkflowTriggerConfig;

    /** Steps definition at this point in time */
    readonly steps: WorkflowStep[];
}

/**
 * Runtime instance of a workflow.
 */
export interface WorkflowInstance {
    /** Unique identifier */
    readonly id: string;

    /** Workflow version used for execution */
    readonly workflow_version_id: string;

    /** Event that triggered this instance */
    readonly trigger_event_id: string;

    /** Snapshot of the subject being processed */
    readonly subject_entity_version_id: EntityVersionId;

    /** Current execution status */
    status: WorkflowInstanceStatus;

    /** Current active step ID */
    current_step_id: string | null;

    /** Variable storage for the instance */
    context: Metadata;

    /** When the instance started */
    readonly started_at: Date;

    /** When the instance finished */
    finished_at: Date | null;
}

/**
 * Execution record for a single step.
 */
export interface WorkflowStepExecution {
    /** Unique identifier */
    readonly id: string;

    /** Parent workflow instance */
    readonly workflow_instance_id: string;

    /** Step ID from the workflow definition */
    readonly step_id: string;

    /** Execution status */
    status: StepExecutionStatus;

    /** Input data passed to the step */
    input: Metadata | null;

    /** Output data produced by the step */
    output: Metadata | null;

    /** When the step started */
    readonly started_at: Date;

    /** When the step finished */
    finished_at: Date | null;
}

/**
 * Manual intervention task.
 */
export interface HumanTask {
    /** Unique identifier */
    readonly id: string;

    /** Step execution that created this task */
    readonly step_execution_id: string;

    /** Assigned user or group ID */
    assignee_id: string | null;

    /** Task status */
    status: HumanTaskStatus;

    /** Decision made by the human */
    decision: Metadata | null;

    /** When the task is due */
    due_at: Date | null;

    /** When the task was completed */
    completed_at: Date | null;
}
