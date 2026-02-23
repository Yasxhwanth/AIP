"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateApiKeySchema = exports.CreatePolicySchema = exports.CreateComputedMetricSchema = exports.CreateExecutionPlanSchema = exports.CreateActionDefinitionSchema = exports.CreateDecisionRuleSchema = exports.UpdateModelVersionStatusSchema = exports.CreateModelVersionSchema = exports.CreateModelSchema = exports.CreateIntegrationJobSchema = exports.CreateDataSourceSchema = exports.IngestTelemetrySchema = exports.CreateRelationshipInstanceSchema = exports.CreateRelationshipDefSchema = exports.UpdateEntityTypeSchema = exports.CreateEntityTypeSchema = void 0;
const zod_1 = require("zod");
// ── Entity Types ─────────────────────────────────────────────────
exports.CreateEntityTypeSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    attributes: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string().min(1),
        dataType: zod_1.z.enum(['string', 'int', 'float', 'boolean', 'json', 'datetime']),
        required: zod_1.z.boolean().optional(),
        temporal: zod_1.z.boolean().optional(),
    })).min(1),
});
exports.UpdateEntityTypeSchema = zod_1.z.object({
    attributes: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string().min(1),
        dataType: zod_1.z.enum(['string', 'int', 'float', 'boolean', 'json', 'datetime']),
        required: zod_1.z.boolean().optional(),
        temporal: zod_1.z.boolean().optional(),
    })).min(1),
});
// ── Relationships ────────────────────────────────────────────────
exports.CreateRelationshipDefSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    sourceEntityTypeId: zod_1.z.string().uuid(),
    targetEntityTypeId: zod_1.z.string().uuid(),
});
exports.CreateRelationshipInstanceSchema = zod_1.z.object({
    relationshipDefinitionId: zod_1.z.string().uuid(),
    sourceLogicalId: zod_1.z.string().min(1),
    targetLogicalId: zod_1.z.string().min(1),
    properties: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
});
// ── Telemetry ────────────────────────────────────────────────────
exports.IngestTelemetrySchema = zod_1.z.object({
    logicalId: zod_1.z.string().min(1),
    metrics: zod_1.z.array(zod_1.z.object({
        metric: zod_1.z.string().min(1),
        value: zod_1.z.number(),
        timestamp: zod_1.z.string().optional(),
    })).min(1),
});
// ── Data Sources ─────────────────────────────────────────────────
exports.CreateDataSourceSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    type: zod_1.z.enum(['REST_API', 'JSON_UPLOAD', 'CSV_UPLOAD']),
    connectionConfig: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()),
    enabled: zod_1.z.boolean().optional(),
});
// ── Integration Jobs ─────────────────────────────────────────────
exports.CreateIntegrationJobSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    dataSourceId: zod_1.z.string().uuid(),
    targetEntityTypeId: zod_1.z.string().uuid(),
    fieldMapping: zod_1.z.record(zod_1.z.string(), zod_1.z.string()),
    logicalIdField: zod_1.z.string().min(1),
    schedule: zod_1.z.string().optional(),
    enabled: zod_1.z.boolean().optional(),
});
// ── Models ───────────────────────────────────────────────────────
exports.CreateModelSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    entityTypeId: zod_1.z.string().uuid(),
    description: zod_1.z.string().optional(),
    inputFields: zod_1.z.array(zod_1.z.string().min(1)).min(1),
    outputField: zod_1.z.string().min(1),
});
exports.CreateModelVersionSchema = zod_1.z.object({
    strategy: zod_1.z.enum(['THRESHOLD', 'ANOMALY_ZSCORE', 'LINEAR_REGRESSION', 'CUSTOM']),
    hyperparameters: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()),
});
exports.UpdateModelVersionStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['DRAFT', 'STAGING', 'PRODUCTION', 'RETIRED']),
});
// ── Decision Rules ───────────────────────────────────────────────
exports.CreateDecisionRuleSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    entityTypeId: zod_1.z.string().uuid(),
    conditions: zod_1.z.array(zod_1.z.object({
        field: zod_1.z.string().min(1),
        operator: zod_1.z.enum(['>', '<', '>=', '<=', '==', '!=', 'contains', 'exists']),
        value: zod_1.z.unknown(),
    })).min(1),
    logicOperator: zod_1.z.enum(['AND', 'OR']).optional(),
    priority: zod_1.z.number().int().min(1).optional(),
    autoExecute: zod_1.z.boolean().optional(),
    confidenceThreshold: zod_1.z.number().min(0).max(1).optional(),
});
// ── Action Definitions ───────────────────────────────────────────
exports.CreateActionDefinitionSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    type: zod_1.z.enum(['WEBHOOK', 'UPDATE_ENTITY', 'CREATE_ALERT', 'RUN_INFERENCE', 'LOG_ONLY']),
    config: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()),
});
// ── Execution Plans ──────────────────────────────────────────────
exports.CreateExecutionPlanSchema = zod_1.z.object({
    decisionRuleId: zod_1.z.string().uuid(),
    actionDefinitionId: zod_1.z.string().uuid(),
    stepOrder: zod_1.z.number().int().min(1),
    continueOnFailure: zod_1.z.boolean().optional(),
});
// ── Computed Metrics ─────────────────────────────────────────────
exports.CreateComputedMetricSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    entityTypeId: zod_1.z.string().uuid(),
    expression: zod_1.z.string().min(1),
    unit: zod_1.z.string().optional(),
});
// ── Policies ─────────────────────────────────────────────────────
exports.CreatePolicySchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    entityTypeId: zod_1.z.string().uuid(),
    eventType: zod_1.z.string().optional(),
    condition: zod_1.z.object({
        field: zod_1.z.string().min(1),
        operator: zod_1.z.string().min(1),
        value: zod_1.z.unknown(),
    }),
    actionType: zod_1.z.string().optional(),
    actionConfig: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
});
// ── Auth ─────────────────────────────────────────────────────────
exports.CreateApiKeySchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    role: zod_1.z.enum(['ADMIN', 'OPERATOR', 'VIEWER']).optional(),
    rateLimit: zod_1.z.number().int().min(1).optional(),
});
//# sourceMappingURL=validators.js.map