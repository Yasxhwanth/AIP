
/**
 * =============================================================================
 * EXECUTION ENGINE TYPES
 * Phase 19: Controlled Execution Engine
 * =============================================================================
 * 
 * Defines the core primitives for the Controlled Execution Engine.
 * 
 * PRINCIPLES:
 * - Decisions do not execute.
 * - Execution requires explicit intent.
 * - Execution is idempotent (via mandatory idempotencyKey).
 * - Execution is isolated (Command pattern).
 * - Execution is auditable (Snapshots).
 */

import { AuthorityProofSnapshot } from '../authority/authority-types';

// =============================================================================
// ENUMS
// =============================================================================

export enum ExecutionMode {
    /** Simulates execution without side effects */
    DRY_RUN = 'DRY_RUN',
    /** Performs actual execution with side effects */
    REAL_RUN = 'REAL_RUN'
}

export enum ExecutionStatus {
    /** Intent created, waiting for Dry Run */
    PENDING = 'PENDING',
    /** Dry Run completed successfully, waiting for Approval */
    DRY_RUN_COMPLETED = 'DRY_RUN_COMPLETED',
    /** Approved for Real Run */
    APPROVED = 'APPROVED',
    /** Successfully executed */
    EXECUTED = 'EXECUTED',
    /** Failed execution or Dry Run */
    FAILED = 'FAILED',
    /** Cancelled by user */
    CANCELLED = 'CANCELLED'
}

// =============================================================================
// CORE TYPES
// =============================================================================

/**
 * Immutable request to execute an action.
 * Created from a Decision.
 */
export interface ExecutionIntent {
    readonly intentId: string;
    readonly tenantId: string;
    readonly decisionId: string;
    readonly actionType: string;
    readonly targetEntities: string[];
    readonly parameters: Record<string, any>;
    readonly targetScenarioId?: string;

    /** 
     * Mandatory idempotency key.
     * hash(decisionId + actionType + targetEntities + params)
     */
    readonly idempotencyKey: string;

    readonly requestedBy: string;
    readonly performedBySessionId?: string;
    readonly authority_snapshot_id?: string;
    readonly requestedAt: string; // ISO Date

    /** Current status of the intent */
    status: ExecutionStatus;

    /** History of status changes */
    statusHistory: {
        status: ExecutionStatus;
        timestamp: string;
        changedBy: string;
    }[];
}

/**
 * Decoupled command object sent to the Action Engine.
 * ExecutionManager emits this; ActionEngine consumes it.
 */
export interface ExecutionCommand {
    readonly intentId: string;
    readonly tenantId: string;
    readonly actionType: string;
    readonly parameters: Record<string, any>;
    readonly idempotencyKey: string;
    readonly mode: ExecutionMode;
    readonly targetScenarioId?: string;
}

/**
 * Result of an execution attempt.
 */
export interface ExecutionResult {
    tenantId: string;
    success: boolean;
    output?: any;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    logs?: string[];
}

/**
 * Record of an actual execution attempt (Dry or Real).
 */
export interface ExecutionAttempt {
    readonly attemptId: string;
    readonly intentId: string;
    readonly mode: ExecutionMode;
    readonly performedBySessionId?: string;

    readonly startedAt: string; // ISO Date
    readonly completedAt?: string; // ISO Date

    /** Snapshot of authority at the moment of execution */
    readonly executionAuthorityProofSnapshot?: AuthorityProofSnapshot;

    /** Snapshot of environment variables/config */
    readonly executionEnvironment?: Record<string, any>;

    readonly result: ExecutionResult;
}
