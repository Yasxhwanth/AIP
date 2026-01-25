export interface PathProjection {
    entityId: string;
    fromTime: Date;
    toTime: Date;
    points: { x: number; y: number; t: Date }[];
    confidence: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface RuleTriggerProjection {
    ruleId: string;
    estimatedTriggerTime: Date;
    reason: string;
}

export interface WorkflowProjection {
    workflowId: string;
    estimatedStartTime: Date;
    blockingSteps: string[];
}

export interface ProjectionBundle {
    paths: PathProjection[];
    ruleTriggers: RuleTriggerProjection[];
    workflows: WorkflowProjection[];
}
