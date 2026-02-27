import * as runtime from "@prisma/client/runtime/index-browser";
export type * from '../models';
export type * from './prismaNamespace';
export declare const Decimal: typeof runtime.Decimal;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
/**
 * Helper for filtering JSON entries that have `null` on the database (empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const DbNull: import("@prisma/client-runtime-utils").DbNullClass;
/**
 * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
/**
 * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const AnyNull: import("@prisma/client-runtime-utils").AnyNullClass;
export declare const ModelName: {
    readonly Project: "Project";
    readonly EntityType: "EntityType";
    readonly AttributeDefinition: "AttributeDefinition";
    readonly RelationshipDefinition: "RelationshipDefinition";
    readonly RelationshipInstance: "RelationshipInstance";
    readonly EntityInstance: "EntityInstance";
    readonly EntityAlias: "EntityAlias";
    readonly ProvenanceRecord: "ProvenanceRecord";
    readonly DomainEvent: "DomainEvent";
    readonly PolicyDefinition: "PolicyDefinition";
    readonly Alert: "Alert";
    readonly CurrentEntityState: "CurrentEntityState";
    readonly CurrentGraph: "CurrentGraph";
    readonly TimeseriesMetric: "TimeseriesMetric";
    readonly DataSource: "DataSource";
    readonly Pipeline: "Pipeline";
    readonly IntegrationJob: "IntegrationJob";
    readonly JobExecution: "JobExecution";
    readonly ComputedMetricDefinition: "ComputedMetricDefinition";
    readonly TelemetryRollup: "TelemetryRollup";
    readonly ModelDefinition: "ModelDefinition";
    readonly ModelVersion: "ModelVersion";
    readonly InferenceResult: "InferenceResult";
    readonly DecisionRule: "DecisionRule";
    readonly ActionDefinition: "ActionDefinition";
    readonly ExecutionPlan: "ExecutionPlan";
    readonly DecisionLog: "DecisionLog";
    readonly ApiKey: "ApiKey";
    readonly Dashboard: "Dashboard";
    readonly DashboardWidget: "DashboardWidget";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const ProjectScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly description: "description";
    readonly createdAt: "createdAt";
};
export type ProjectScalarFieldEnum = (typeof ProjectScalarFieldEnum)[keyof typeof ProjectScalarFieldEnum];
export declare const EntityTypeScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly version: "version";
    readonly createdAt: "createdAt";
    readonly projectId: "projectId";
};
export type EntityTypeScalarFieldEnum = (typeof EntityTypeScalarFieldEnum)[keyof typeof EntityTypeScalarFieldEnum];
export declare const AttributeDefinitionScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly dataType: "dataType";
    readonly required: "required";
    readonly temporal: "temporal";
    readonly entityTypeId: "entityTypeId";
};
export type AttributeDefinitionScalarFieldEnum = (typeof AttributeDefinitionScalarFieldEnum)[keyof typeof AttributeDefinitionScalarFieldEnum];
export declare const RelationshipDefinitionScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly createdAt: "createdAt";
    readonly sourceEntityTypeId: "sourceEntityTypeId";
    readonly targetEntityTypeId: "targetEntityTypeId";
};
export type RelationshipDefinitionScalarFieldEnum = (typeof RelationshipDefinitionScalarFieldEnum)[keyof typeof RelationshipDefinitionScalarFieldEnum];
export declare const RelationshipInstanceScalarFieldEnum: {
    readonly id: "id";
    readonly relationshipDefinitionId: "relationshipDefinitionId";
    readonly sourceLogicalId: "sourceLogicalId";
    readonly targetLogicalId: "targetLogicalId";
    readonly properties: "properties";
    readonly validFrom: "validFrom";
    readonly validTo: "validTo";
    readonly transactionTime: "transactionTime";
};
export type RelationshipInstanceScalarFieldEnum = (typeof RelationshipInstanceScalarFieldEnum)[keyof typeof RelationshipInstanceScalarFieldEnum];
export declare const EntityInstanceScalarFieldEnum: {
    readonly id: "id";
    readonly logicalId: "logicalId";
    readonly entityTypeId: "entityTypeId";
    readonly entityVersion: "entityVersion";
    readonly data: "data";
    readonly confidenceScore: "confidenceScore";
    readonly reviewStatus: "reviewStatus";
    readonly validFrom: "validFrom";
    readonly validTo: "validTo";
    readonly transactionTime: "transactionTime";
};
export type EntityInstanceScalarFieldEnum = (typeof EntityInstanceScalarFieldEnum)[keyof typeof EntityInstanceScalarFieldEnum];
export declare const EntityAliasScalarFieldEnum: {
    readonly id: "id";
    readonly externalId: "externalId";
    readonly sourceSystem: "sourceSystem";
    readonly targetLogicalId: "targetLogicalId";
    readonly confidence: "confidence";
    readonly isPrimary: "isPrimary";
    readonly createdAt: "createdAt";
};
export type EntityAliasScalarFieldEnum = (typeof EntityAliasScalarFieldEnum)[keyof typeof EntityAliasScalarFieldEnum];
export declare const ProvenanceRecordScalarFieldEnum: {
    readonly id: "id";
    readonly entityInstanceId: "entityInstanceId";
    readonly attributeName: "attributeName";
    readonly sourceSystem: "sourceSystem";
    readonly sourceRecordId: "sourceRecordId";
    readonly sourceTimestamp: "sourceTimestamp";
    readonly ingestedAt: "ingestedAt";
};
export type ProvenanceRecordScalarFieldEnum = (typeof ProvenanceRecordScalarFieldEnum)[keyof typeof ProvenanceRecordScalarFieldEnum];
export declare const DomainEventScalarFieldEnum: {
    readonly id: "id";
    readonly idempotencyKey: "idempotencyKey";
    readonly eventType: "eventType";
    readonly entityTypeId: "entityTypeId";
    readonly logicalId: "logicalId";
    readonly entityVersion: "entityVersion";
    readonly payload: "payload";
    readonly occurredAt: "occurredAt";
};
export type DomainEventScalarFieldEnum = (typeof DomainEventScalarFieldEnum)[keyof typeof DomainEventScalarFieldEnum];
export declare const PolicyDefinitionScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly description: "description";
    readonly entityTypeId: "entityTypeId";
    readonly eventType: "eventType";
    readonly condition: "condition";
    readonly actionType: "actionType";
    readonly actionConfig: "actionConfig";
    readonly version: "version";
    readonly enabled: "enabled";
    readonly createdAt: "createdAt";
};
export type PolicyDefinitionScalarFieldEnum = (typeof PolicyDefinitionScalarFieldEnum)[keyof typeof PolicyDefinitionScalarFieldEnum];
export declare const AlertScalarFieldEnum: {
    readonly id: "id";
    readonly alertType: "alertType";
    readonly severity: "severity";
    readonly policyId: "policyId";
    readonly policyVersion: "policyVersion";
    readonly eventId: "eventId";
    readonly entityTypeId: "entityTypeId";
    readonly logicalId: "logicalId";
    readonly payload: "payload";
    readonly evaluationTrace: "evaluationTrace";
    readonly acknowledged: "acknowledged";
    readonly createdAt: "createdAt";
};
export type AlertScalarFieldEnum = (typeof AlertScalarFieldEnum)[keyof typeof AlertScalarFieldEnum];
export declare const CurrentEntityStateScalarFieldEnum: {
    readonly logicalId: "logicalId";
    readonly entityTypeId: "entityTypeId";
    readonly data: "data";
    readonly updatedAt: "updatedAt";
};
export type CurrentEntityStateScalarFieldEnum = (typeof CurrentEntityStateScalarFieldEnum)[keyof typeof CurrentEntityStateScalarFieldEnum];
export declare const CurrentGraphScalarFieldEnum: {
    readonly id: "id";
    readonly relationshipDefinitionId: "relationshipDefinitionId";
    readonly relationshipName: "relationshipName";
    readonly sourceLogicalId: "sourceLogicalId";
    readonly targetLogicalId: "targetLogicalId";
    readonly properties: "properties";
};
export type CurrentGraphScalarFieldEnum = (typeof CurrentGraphScalarFieldEnum)[keyof typeof CurrentGraphScalarFieldEnum];
export declare const TimeseriesMetricScalarFieldEnum: {
    readonly id: "id";
    readonly logicalId: "logicalId";
    readonly metric: "metric";
    readonly value: "value";
    readonly timestamp: "timestamp";
};
export type TimeseriesMetricScalarFieldEnum = (typeof TimeseriesMetricScalarFieldEnum)[keyof typeof TimeseriesMetricScalarFieldEnum];
export declare const DataSourceScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly type: "type";
    readonly connectionConfig: "connectionConfig";
    readonly enabled: "enabled";
    readonly createdAt: "createdAt";
    readonly projectId: "projectId";
};
export type DataSourceScalarFieldEnum = (typeof DataSourceScalarFieldEnum)[keyof typeof DataSourceScalarFieldEnum];
export declare const PipelineScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly description: "description";
    readonly nodes: "nodes";
    readonly edges: "edges";
    readonly enabled: "enabled";
    readonly createdAt: "createdAt";
    readonly projectId: "projectId";
};
export type PipelineScalarFieldEnum = (typeof PipelineScalarFieldEnum)[keyof typeof PipelineScalarFieldEnum];
export declare const IntegrationJobScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly dataSourceId: "dataSourceId";
    readonly targetEntityTypeId: "targetEntityTypeId";
    readonly fieldMapping: "fieldMapping";
    readonly logicalIdField: "logicalIdField";
    readonly schedule: "schedule";
    readonly enabled: "enabled";
    readonly createdAt: "createdAt";
    readonly projectId: "projectId";
};
export type IntegrationJobScalarFieldEnum = (typeof IntegrationJobScalarFieldEnum)[keyof typeof IntegrationJobScalarFieldEnum];
export declare const JobExecutionScalarFieldEnum: {
    readonly id: "id";
    readonly integrationJobId: "integrationJobId";
    readonly status: "status";
    readonly recordsProcessed: "recordsProcessed";
    readonly recordsFailed: "recordsFailed";
    readonly error: "error";
    readonly startedAt: "startedAt";
    readonly completedAt: "completedAt";
};
export type JobExecutionScalarFieldEnum = (typeof JobExecutionScalarFieldEnum)[keyof typeof JobExecutionScalarFieldEnum];
export declare const ComputedMetricDefinitionScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly entityTypeId: "entityTypeId";
    readonly expression: "expression";
    readonly unit: "unit";
    readonly enabled: "enabled";
    readonly createdAt: "createdAt";
};
export type ComputedMetricDefinitionScalarFieldEnum = (typeof ComputedMetricDefinitionScalarFieldEnum)[keyof typeof ComputedMetricDefinitionScalarFieldEnum];
export declare const TelemetryRollupScalarFieldEnum: {
    readonly id: "id";
    readonly logicalId: "logicalId";
    readonly metric: "metric";
    readonly windowSize: "windowSize";
    readonly windowStart: "windowStart";
    readonly avg: "avg";
    readonly min: "min";
    readonly max: "max";
    readonly sum: "sum";
    readonly count: "count";
};
export type TelemetryRollupScalarFieldEnum = (typeof TelemetryRollupScalarFieldEnum)[keyof typeof TelemetryRollupScalarFieldEnum];
export declare const ModelDefinitionScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly entityTypeId: "entityTypeId";
    readonly description: "description";
    readonly inputFields: "inputFields";
    readonly outputField: "outputField";
    readonly createdAt: "createdAt";
    readonly projectId: "projectId";
};
export type ModelDefinitionScalarFieldEnum = (typeof ModelDefinitionScalarFieldEnum)[keyof typeof ModelDefinitionScalarFieldEnum];
export declare const ModelVersionScalarFieldEnum: {
    readonly id: "id";
    readonly modelDefinitionId: "modelDefinitionId";
    readonly version: "version";
    readonly status: "status";
    readonly strategy: "strategy";
    readonly hyperparameters: "hyperparameters";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type ModelVersionScalarFieldEnum = (typeof ModelVersionScalarFieldEnum)[keyof typeof ModelVersionScalarFieldEnum];
export declare const InferenceResultScalarFieldEnum: {
    readonly id: "id";
    readonly modelVersionId: "modelVersionId";
    readonly logicalId: "logicalId";
    readonly input: "input";
    readonly output: "output";
    readonly confidence: "confidence";
    readonly createdAt: "createdAt";
};
export type InferenceResultScalarFieldEnum = (typeof InferenceResultScalarFieldEnum)[keyof typeof InferenceResultScalarFieldEnum];
export declare const DecisionRuleScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly entityTypeId: "entityTypeId";
    readonly conditions: "conditions";
    readonly logicOperator: "logicOperator";
    readonly priority: "priority";
    readonly autoExecute: "autoExecute";
    readonly confidenceThreshold: "confidenceThreshold";
    readonly enabled: "enabled";
    readonly createdAt: "createdAt";
    readonly projectId: "projectId";
};
export type DecisionRuleScalarFieldEnum = (typeof DecisionRuleScalarFieldEnum)[keyof typeof DecisionRuleScalarFieldEnum];
export declare const ActionDefinitionScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly type: "type";
    readonly config: "config";
    readonly createdAt: "createdAt";
};
export type ActionDefinitionScalarFieldEnum = (typeof ActionDefinitionScalarFieldEnum)[keyof typeof ActionDefinitionScalarFieldEnum];
export declare const ExecutionPlanScalarFieldEnum: {
    readonly id: "id";
    readonly decisionRuleId: "decisionRuleId";
    readonly actionDefinitionId: "actionDefinitionId";
    readonly stepOrder: "stepOrder";
    readonly continueOnFailure: "continueOnFailure";
};
export type ExecutionPlanScalarFieldEnum = (typeof ExecutionPlanScalarFieldEnum)[keyof typeof ExecutionPlanScalarFieldEnum];
export declare const DecisionLogScalarFieldEnum: {
    readonly id: "id";
    readonly decisionRuleId: "decisionRuleId";
    readonly logicalId: "logicalId";
    readonly triggerType: "triggerType";
    readonly triggerData: "triggerData";
    readonly conditionResults: "conditionResults";
    readonly decision: "decision";
    readonly executionResults: "executionResults";
    readonly status: "status";
    readonly createdAt: "createdAt";
};
export type DecisionLogScalarFieldEnum = (typeof DecisionLogScalarFieldEnum)[keyof typeof DecisionLogScalarFieldEnum];
export declare const ApiKeyScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly keyHash: "keyHash";
    readonly role: "role";
    readonly rateLimit: "rateLimit";
    readonly enabled: "enabled";
    readonly lastUsedAt: "lastUsedAt";
    readonly createdAt: "createdAt";
};
export type ApiKeyScalarFieldEnum = (typeof ApiKeyScalarFieldEnum)[keyof typeof ApiKeyScalarFieldEnum];
export declare const DashboardScalarFieldEnum: {
    readonly id: "id";
    readonly projectId: "projectId";
    readonly name: "name";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type DashboardScalarFieldEnum = (typeof DashboardScalarFieldEnum)[keyof typeof DashboardScalarFieldEnum];
export declare const DashboardWidgetScalarFieldEnum: {
    readonly id: "id";
    readonly dashboardId: "dashboardId";
    readonly type: "type";
    readonly configData: "configData";
    readonly x: "x";
    readonly y: "y";
    readonly w: "w";
    readonly h: "h";
};
export type DashboardWidgetScalarFieldEnum = (typeof DashboardWidgetScalarFieldEnum)[keyof typeof DashboardWidgetScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const NullableJsonNullValueInput: {
    readonly DbNull: import("@prisma/client-runtime-utils").DbNullClass;
    readonly JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
};
export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput];
export declare const JsonNullValueInput: {
    readonly JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
};
export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
export declare const JsonNullValueFilter: {
    readonly DbNull: import("@prisma/client-runtime-utils").DbNullClass;
    readonly JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
    readonly AnyNull: import("@prisma/client-runtime-utils").AnyNullClass;
};
export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter];
//# sourceMappingURL=prismaNamespaceBrowser.d.ts.map