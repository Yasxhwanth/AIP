import { DecisionContext } from '../decision/decision-types';

export interface TimelineEvent {
    eventIndex: number;
    eventType: TimelineEventType;
    timestamp: Date;
    payload: any;
}

export type TimelineEventType =
    | 'SYSTEM_CONTEXT'
    | 'BASE_REALITY_SNAPSHOT'
    | 'SCENARIO_BRANCHES'
    | 'COMPARISON_VIEW'
    | 'AI_EXPLANATION'
    | 'HUMAN_DECISION';

export interface ReplayTimeline {
    decisionId: string;
    decidedAt: Date;
    events: TimelineEvent[];
}

// Payload Interfaces for Type Safety

export interface SystemContextPayload {
    asOf: Date;
    user: string; // The user who made the decision
    environment: string; // e.g., "Production", "Staging"
}

export interface BaseRealitySnapshotPayload {
    asOf: Date;
    ontologyVersion: string;
    // We do NOT store the full ontology state here. 
    // The system relies on the deterministic QueryClient to resolve state at 'asOf'.
}

export interface ScenarioBranchesPayload {
    activeScenarios: { id: string; name: string }[];
    // In a real system, this might include immutable references to scenario definitions
}

export interface ComparisonViewPayload {
    leftScenarioId: string | null;
    rightScenarioId: string | null;
    deltaSummary: any; // Snapshot of what the user saw
}

export interface HumanDecisionPayload {
    chosenScenarioId: string | null;
    justification: string;
    author: string;
}
