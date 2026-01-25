import {
    OntologyVersionId,
    Metadata,
    UserId,
} from './types.js';

/**
 * Status of an AI reasoning session.
 */
export enum ReasoningSessionStatus {
    /** Session is active and reasoning is in progress */
    ACTIVE = 'ACTIVE',

    /** Session is finalized and immutable (Terminal) */
    FINALIZED = 'FINALIZED',

    /** Session was aborted (Terminal) */
    ABORTED = 'ABORTED',
}

/**
 * Structured reasoning step for explainability.
 * Evidence -> Reason -> Recommendation -> ExpectedOutcome
 */
export interface ReasoningStep {
    /** Platform facts (events, states) used as input */
    evidence: Metadata;

    /** Structured justification (rules, comparisons) */
    reason: string;

    /** Semantic proposal (not executable) */
    recommendation: string;

    /** Outcome of simulation (Rules + Workflows) */
    expected_outcome: Metadata;
}

/**
 * Structured log of reasoning steps.
 * AR-7: Must not include internal chain-of-thought.
 */
export interface ExplanationTrace {
    steps: ReasoningStep[];
}

/**
 * Semantic proposal for an action.
 * AR-8: AI cannot construct executable ActionIntent.
 */
export interface RecommendedAction {
    /** Reference to the action definition version */
    action_definition_version_id: string;

    /** Human-readable rationale for this specific recommendation */
    rationale: string;

    /** Proposed input data (must be validated by system before intent creation) */
    proposed_input: Metadata;
}

/**
 * Outcome of a dry-run simulation.
 * AR-9: Must use rule + workflow dry-run.
 */
export interface SimulationResult {
    /** Which workflows would have started */
    triggered_workflows: string[];

    /** Which rules would have fired */
    fired_rules: string[];

    /** Which steps would have blocked or required approval */
    blocking_steps: string[];

    /** Final predicted state of the subject entity */
    predicted_state: Metadata;
}

/**
 * Immutable snapshot of an AI reasoning session.
 * AR-10: Once finalized, it cannot be updated.
 */
export interface ReasoningSession {
    readonly id: string;
    readonly ontology_version_id: OntologyVersionId;

    /** Deterministic time scope for reasoning */
    readonly as_of: Date;

    /** User who initiated the session */
    readonly initiated_by: UserId;

    /** Current status */
    status: ReasoningSessionStatus;

    readonly created_at: Date;
    finalized_at: Date | null;
}

/**
 * AI Recommendation output.
 */
export interface AIRecommendation {
    readonly id: string;
    readonly session_id: string;

    /** The semantic proposal */
    readonly action_proposal: RecommendedAction;

    /** Structured explanation for audit/trust */
    readonly explanation_trace: ExplanationTrace;

    /** Results of the dry-run simulation */
    readonly simulation_result: SimulationResult;

    readonly created_at: Date;
}

/**
 * Interface for read-only AI tools.
 * AR-1: Strictly read-only.
 */
export interface AITool {
    readonly name: string;
    readonly description: string;
    readonly input_schema: Metadata;

    /** 
     * Execute the tool. 
     * Implementation must use Query Engine with session.as_of.
     */
    execute(input: Metadata, context: { as_of: Date }): Promise<Metadata>;
}
