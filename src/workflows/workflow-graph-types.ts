export enum WorkflowNodeType {
    START = 'START',
    TASK = 'TASK',
    APPROVAL = 'APPROVAL',
    DECISION = 'DECISION',
    AI_REVIEW = 'AI_REVIEW',
    ACTION = 'ACTION',
    WAIT = 'WAIT',
    END = 'END'
}

export interface WorkflowNode {
    id: string;
    type: WorkflowNodeType;
    label: string;
    position: { x: number; y: number };
    config: Record<string, any>;
    requiredAuthority?: string;
}

export interface WorkflowEdge {
    id: string;
    from: string;
    to: string;
    condition?: string;
}

export interface WorkflowGraph {
    id: string;
    tenant_id: string;
    version: number;
    created_at: Date;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
}
