import {
    OntologyVersionId,
    Metadata,
    UserId,
} from './types.js';

/**
 * Supported connector types for external integrations.
 */
export enum ConnectorType {
    REST = 'REST',
    SQL = 'SQL',
    SCRIPT = 'SCRIPT',
    EMAIL = 'EMAIL',
    WEBHOOK = 'WEBHOOK',
}

/**
 * Status of an action definition version.
 */
export enum ActionDefinitionStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    DEPRECATED = 'DEPRECATED',
}

/**
 * Lifecycle status of an action intent.
 */
export enum ActionIntentStatus {
    /** Created, waiting for a worker to claim */
    PENDING = 'PENDING',

    /** Claimed by a worker, execution in progress */
    PROCESSING = 'PROCESSING',

    /** Successfully executed (Terminal) */
    SUCCESS = 'SUCCESS',

    /** Failed after all retries (Terminal) */
    FAILED = 'FAILED',

    /** Manually cancelled (Terminal) */
    CANCELLED = 'CANCELLED',
}

/**
 * Status of a single execution attempt.
 */
export enum ExecutionAttemptStatus {
    SUCCESS = 'SUCCESS',
    FAILURE = 'FAILURE',
}

/**
 * Root definition of an action.
 */
export interface ActionDefinition {
    readonly id: string;
    readonly tenant_id: string;
    readonly ontology_version_id: OntologyVersionId;

    /** Machine-readable identifier */
    name: string;

    /** Human-readable name */
    display_name: string;

    /** Detailed description */
    description: string | null;

    readonly created_at: Date;
    readonly updated_at: Date;
    readonly deleted_at: Date | null;
}

/**
 * Immutable version of an action definition.
 */
export interface ActionDefinitionVersion {
    readonly id: string;
    readonly action_definition_id: string;
    readonly version_number: number;

    /** Type of connector to use */
    readonly connector_type: ConnectorType;

    /** Connector-specific configuration (e.g., URL, credentials) */
    readonly connector_config: Metadata;

    /** JSON Schema for input validation */
    readonly input_schema: Metadata;

    /** Retry configuration */
    readonly retry_policy: {
        max_retries: number;
        backoff_ms: number;
        backoff_multiplier: number;
    };

    readonly status: ActionDefinitionStatus;
    readonly created_at: Date;
    readonly published_at: Date | null;
}

/**
 * Immutable intent to execute an action.
 */
export interface ActionIntent {
    readonly id: string;
    readonly action_definition_version_id: string;

    /** Context: which workflow instance triggered this */
    readonly workflow_instance_id: string | null;

    /** Context: which specific step triggered this */
    readonly workflow_step_execution_id: string | null;

    /** 
     * Client-provided key for idempotency.
     * UNIQUE(action_definition_version_id, idempotency_key)
     */
    readonly idempotency_key: string;

    /** Input data for the action, validated against input_schema */
    readonly input_data: Metadata;

    /** Current status of the intent */
    status: ActionIntentStatus;

    /** Worker ID that claimed this intent */
    locked_by: string | null;

    /** When the intent was claimed */
    locked_at: Date | null;

    readonly created_at: Date;
    readonly updated_at: Date;
}

/**
 * Append-only record of an execution attempt.
 */
export interface ActionExecutionAttempt {
    readonly id: string;
    readonly action_intent_id: string;

    /** Sequential attempt number (1, 2, 3...) */
    readonly attempt_number: number;

    /** Status of this specific attempt */
    readonly status: ExecutionAttemptStatus;

    /** Response from the external system */
    readonly output_data: Metadata | null;

    /** Error details if status is FAILURE */
    readonly error_details: {
        message: string;
        code?: string;
        stack?: string;
    } | null;

    readonly started_at: Date;
    readonly finished_at: Date;

    /** Worker ID that performed this attempt */
    readonly performed_by: string;
}
