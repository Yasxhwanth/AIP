export type AIConfidenceLevel = 'low' | 'medium' | 'high';

export type AIAdvisoryResponseType = 'observation' | 'explanation' | 'analysis';

export type AIInvocationSource = 'comparison' | 'dry-run' | 'failure' | 'decision' | 'manual';

export interface AIContextSnapshot {
    timestamp: Date;
    viewContext: AIInvocationSource;

    // Scenario Comparison
    comparison?: {
        asOf: Date;
        leftScenarioId: string | null;
        rightScenarioId: string | null;
        deltaSummary: any;
        topEntityDeltas: any[];
    };

    // Execution (Dry-Run or Failure)
    execution?: {
        intentId: string;
        status: string;
        dryRunOutput?: any;
        errorCode?: string;
        errorMessage?: string;
        impactedEntities?: string[];
        warnings?: string[];
    };

    // Decision Review
    decision?: {
        decisionId: string;
        chosenScenarioId: string | null;
        justification: string;
        deltaSummary: any;
        authorityProofSummary?: any;
    };

    // Legacy/General
    activeScenarioId?: string;
    selectedEntityIds?: string[];
    deltaSummary?: any;
    executionResult?: any;
}

export interface AIAdvisoryRequest {
    sessionId: string;
    prompt: string;
    contextSnapshot: AIContextSnapshot;
}

export interface AIAdvisoryResponse {
    responseType: AIAdvisoryResponseType;
    content: string;
    confidenceLevel: AIConfidenceLevel;
    disclaimer: "Advisory only — not a recommendation or decision";
    supportingSignals: string[];
    dataSources?: string[]; // Track what data AI analyzed
}

export interface AIAdvisorySession {
    sessionId: string;
    createdAt: Date;
    createdBy: string; // User ID
    performedBySessionId?: string;
    invocationSource: AIInvocationSource;
    purpose: string;
    contextSnapshot: AIContextSnapshot;
    history: {
        request: AIAdvisoryRequest;
        response: AIAdvisoryResponse;
        timestamp: Date;
    }[];
}
