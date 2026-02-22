import { z } from 'zod';

// ── Entity Types ─────────────────────────────────────────────────

export const CreateEntityTypeSchema = z.object({
    name: z.string().min(1).max(100),
    attributes: z.array(z.object({
        name: z.string().min(1),
        dataType: z.enum(['string', 'int', 'float', 'boolean', 'json', 'datetime']),
        required: z.boolean().optional(),
        temporal: z.boolean().optional(),
    })).min(1),
});

export const UpdateEntityTypeSchema = z.object({
    attributes: z.array(z.object({
        name: z.string().min(1),
        dataType: z.enum(['string', 'int', 'float', 'boolean', 'json', 'datetime']),
        required: z.boolean().optional(),
        temporal: z.boolean().optional(),
    })).min(1),
});

// ── Relationships ────────────────────────────────────────────────

export const CreateRelationshipDefSchema = z.object({
    name: z.string().min(1).max(100),
    sourceEntityTypeId: z.string().uuid(),
    targetEntityTypeId: z.string().uuid(),
});

export const CreateRelationshipInstanceSchema = z.object({
    relationshipDefinitionId: z.string().uuid(),
    sourceLogicalId: z.string().min(1),
    targetLogicalId: z.string().min(1),
    properties: z.record(z.string(), z.unknown()).optional(),
});

// ── Telemetry ────────────────────────────────────────────────────

export const IngestTelemetrySchema = z.object({
    logicalId: z.string().min(1),
    metrics: z.array(z.object({
        metric: z.string().min(1),
        value: z.number(),
        timestamp: z.string().optional(),
    })).min(1),
});

// ── Data Sources ─────────────────────────────────────────────────

export const CreateDataSourceSchema = z.object({
    name: z.string().min(1).max(100),
    type: z.enum(['REST_API', 'JSON_UPLOAD', 'CSV_UPLOAD']),
    connectionConfig: z.record(z.string(), z.unknown()),
    enabled: z.boolean().optional(),
});

// ── Integration Jobs ─────────────────────────────────────────────

export const CreateIntegrationJobSchema = z.object({
    name: z.string().min(1).max(100),
    dataSourceId: z.string().uuid(),
    targetEntityTypeId: z.string().uuid(),
    fieldMapping: z.record(z.string(), z.string()),
    logicalIdField: z.string().min(1),
    schedule: z.string().optional(),
    enabled: z.boolean().optional(),
});

// ── Models ───────────────────────────────────────────────────────

export const CreateModelSchema = z.object({
    name: z.string().min(1).max(100),
    entityTypeId: z.string().uuid(),
    description: z.string().optional(),
    inputFields: z.array(z.string().min(1)).min(1),
    outputField: z.string().min(1),
});

export const CreateModelVersionSchema = z.object({
    strategy: z.enum(['THRESHOLD', 'ANOMALY_ZSCORE', 'LINEAR_REGRESSION', 'CUSTOM']),
    hyperparameters: z.record(z.string(), z.unknown()),
});

export const UpdateModelVersionStatusSchema = z.object({
    status: z.enum(['DRAFT', 'STAGING', 'PRODUCTION', 'RETIRED']),
});

// ── Decision Rules ───────────────────────────────────────────────

export const CreateDecisionRuleSchema = z.object({
    name: z.string().min(1).max(100),
    entityTypeId: z.string().uuid(),
    conditions: z.array(z.object({
        field: z.string().min(1),
        operator: z.enum(['>', '<', '>=', '<=', '==', '!=', 'contains', 'exists']),
        value: z.unknown(),
    })).min(1),
    logicOperator: z.enum(['AND', 'OR']).optional(),
    priority: z.number().int().min(1).optional(),
    autoExecute: z.boolean().optional(),
    confidenceThreshold: z.number().min(0).max(1).optional(),
});

// ── Action Definitions ───────────────────────────────────────────

export const CreateActionDefinitionSchema = z.object({
    name: z.string().min(1).max(100),
    type: z.enum(['WEBHOOK', 'UPDATE_ENTITY', 'CREATE_ALERT', 'RUN_INFERENCE', 'LOG_ONLY']),
    config: z.record(z.string(), z.unknown()),
});

// ── Execution Plans ──────────────────────────────────────────────

export const CreateExecutionPlanSchema = z.object({
    decisionRuleId: z.string().uuid(),
    actionDefinitionId: z.string().uuid(),
    stepOrder: z.number().int().min(1),
    continueOnFailure: z.boolean().optional(),
});

// ── Computed Metrics ─────────────────────────────────────────────

export const CreateComputedMetricSchema = z.object({
    name: z.string().min(1).max(100),
    entityTypeId: z.string().uuid(),
    expression: z.string().min(1),
    unit: z.string().optional(),
});

// ── Policies ─────────────────────────────────────────────────────

export const CreatePolicySchema = z.object({
    name: z.string().min(1).max(100),
    entityTypeId: z.string().uuid(),
    eventType: z.string().optional(),
    condition: z.object({
        field: z.string().min(1),
        operator: z.string().min(1),
        value: z.unknown(),
    }),
    actionType: z.string().optional(),
    actionConfig: z.record(z.string(), z.unknown()).optional(),
});

// ── Auth ─────────────────────────────────────────────────────────

export const CreateApiKeySchema = z.object({
    name: z.string().min(1).max(100),
    role: z.enum(['ADMIN', 'OPERATOR', 'VIEWER']).optional(),
    rateLimit: z.number().int().min(1).optional(),
});
