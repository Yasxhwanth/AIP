
export type PageId =
    | 'ontology'
    | 'integrations'
    | 'build'
    | 'run'
    | 'telemetry'
    | 'workshop'
    | 'maven'
    | 'sre'
    | 'terminal'
    | 'agent-studio'
    | 'admin';

export interface AipContextSelection {
    entityTypeId?: string;
    logicalId?: string;
    pipelineId?: string;
    workspaceId?: string;
    jobId?: string;
    alertId?: string;
    tab?: string;
    apiHealth?: any;
    filters?: Record<string, any>;
    vars?: Record<string, any>; // Palantir-style Application Variables
}

export interface AipAgent {
    id: string;
    name: string;
    description: string;
    systemPrompt: string;
    allowedTools: string[];
    model?: string;
}

export interface AipAssistRequest {
    page: PageId;
    projectId: string;
    vars: AipContextSelection;
    message: string;
    agentId?: string;
}

export interface AipAssistResponse {
    answer: string;
    usedTools: string[];
    links: Array<{
        type: 'ontology' | 'integration' | 'job' | 'alert' | 'telemetry';
        label: string;
        entityTypeId?: string;
        logicalId?: string;
        jobId?: string;
        alertId?: string;
    }>;
    actions?: Array<{
        type: 'navTo' | 'setFilter' | 'focusEntity' | 'updateVar';
        target: string;
        payload: any;
        risk?: 'LOW' | 'HIGH';
    }>;
    trace?: Array<{
        tool: string;
        args: any;
        result?: any;
    }>;
    proposal?: {
        id: string;
        type: string;
        title: string;
        detail: string;
        status: string;
    };
}
