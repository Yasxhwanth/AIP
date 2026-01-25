import { AuthorityProofSnapshot } from '../authority/authority-types';

export interface DecisionContext {
    asOf: Date;
    leftScenarioId: string | null;
    rightScenarioId: string | null;
    deltaSummary: any; // Using any for now as DeltaSummary might be complex or defined elsewhere
    comparisonMetadata?: any;
    workflowContext?: {
        instanceId: string;
        stepId: string;
        taskId: string;
    };
}

export interface DecisionJournalInput {
    author: string;
    justification: string;
    chosenScenarioId: string | null; // null if neither or "keep status quo" if applicable, but usually one is chosen
    context: DecisionContext;
    admissionDecision?: 'APPROVED' | 'REJECTED';
    workflowDecision?: {
        decision: 'APPROVE' | 'REJECT';
        taskId: string;
    };
}

export interface DecisionJournal {
    id: string;
    tenantId: string;
    timestamp: Date;
    author: string;
    performedBySessionId?: string;
    justification: string;
    chosenScenarioId: string | null;
    context: DecisionContext;
    authorityProof: AuthorityProofSnapshot;
    admissionDecision?: 'APPROVED' | 'REJECTED'; // Optional, for admission decisions
    workflowDecision?: {
        decision: 'APPROVE' | 'REJECT';
        taskId: string;
    };
}
