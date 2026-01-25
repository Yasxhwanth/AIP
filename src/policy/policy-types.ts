
/**
 * =============================================================================
 * POLICY LAYER TYPES
 * Phase 32: Policy Layer (Non-Executable)
 * =============================================================================
 * 
 * Defines the core primitives for the declarative policy layer.
 * 
 * PRINCIPLES:
 * - Policies do NOT grant authority.
 * - Policies do NOT approve actions.
 * - Policies do NOT execute anything.
 * - Policies are declarative constraints.
 */

export enum PolicySeverity {
    INFO = 'INFO',
    WARNING = 'WARNING',
    BLOCKING = 'BLOCKING'
}

export enum PolicyConditionType {
    TIME_WINDOW = 'TIME_WINDOW',
    REGION = 'REGION',
    ENTITY_TYPE = 'ENTITY_TYPE',
    RISK_LEVEL = 'RISK_LEVEL',
    SCENARIO_TYPE = 'SCENARIO_TYPE'
}

export interface PolicyCondition {
    type: PolicyConditionType;
    parameters: Record<string, any>;
}

export interface PolicyDefinition {
    policyId: string;
    name: string;
    description: string;
    appliesToIntentTypes: string[]; // e.g., ['REQUEST_EXECUTION', 'APPROVE_BUDGET']
    scope: {
        tenantId: string;
        targetEntityTypes?: string[];
        regions?: string[];
    };
    conditions: PolicyCondition[];
    severity: PolicySeverity;
    createdAt: string; // ISO Date
    createdBy: string;
}

/**
 * Sanitized input for policy evaluation.
 * EXPLICITLY EXCLUDES ACTOR IDENTITY to prevent policies from becoming permissions.
 */
export interface PolicyProposal {
    actionType: string;
    targetEntityId: string;
    parameters: Record<string, any>;
    tenantId: string;
}

export enum PolicyEvaluationStatus {
    PASS = 'PASS',
    WARN = 'WARN',
    BLOCK = 'BLOCK',
    NOT_APPLICABLE = 'NOT_APPLICABLE'
}

export interface PolicyEvaluationResult {
    policyId: string;
    policyName: string;
    status: PolicyEvaluationStatus;
    explanation: string;
    evidence?: Record<string, any>;
}
