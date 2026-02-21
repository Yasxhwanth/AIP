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
    readonly EntityType: "EntityType";
    readonly AttributeDefinition: "AttributeDefinition";
    readonly RelationshipDefinition: "RelationshipDefinition";
    readonly RelationshipInstance: "RelationshipInstance";
    readonly EntityInstance: "EntityInstance";
    readonly DomainEvent: "DomainEvent";
    readonly PolicyDefinition: "PolicyDefinition";
    readonly Alert: "Alert";
    readonly CurrentEntityState: "CurrentEntityState";
    readonly CurrentGraph: "CurrentGraph";
    readonly TimeseriesMetric: "TimeseriesMetric";
    readonly MetricDefinition: "MetricDefinition";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const EntityTypeScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly version: "version";
    readonly semanticUri: "semanticUri";
    readonly description: "description";
    readonly status: "status";
    readonly owner: "owner";
    readonly effectiveFrom: "effectiveFrom";
    readonly effectiveTo: "effectiveTo";
    readonly deprecatedAt: "deprecatedAt";
    readonly createdAt: "createdAt";
    readonly parentTypeId: "parentTypeId";
};
export type EntityTypeScalarFieldEnum = (typeof EntityTypeScalarFieldEnum)[keyof typeof EntityTypeScalarFieldEnum];
export declare const AttributeDefinitionScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly dataType: "dataType";
    readonly required: "required";
    readonly temporal: "temporal";
    readonly description: "description";
    readonly unit: "unit";
    readonly regexPattern: "regexPattern";
    readonly minValue: "minValue";
    readonly maxValue: "maxValue";
    readonly defaultValue: "defaultValue";
    readonly allowedValues: "allowedValues";
    readonly entityTypeId: "entityTypeId";
};
export type AttributeDefinitionScalarFieldEnum = (typeof AttributeDefinitionScalarFieldEnum)[keyof typeof AttributeDefinitionScalarFieldEnum];
export declare const RelationshipDefinitionScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly semanticUri: "semanticUri";
    readonly description: "description";
    readonly inverseName: "inverseName";
    readonly minSourceCardinality: "minSourceCardinality";
    readonly maxSourceCardinality: "maxSourceCardinality";
    readonly minTargetCardinality: "minTargetCardinality";
    readonly maxTargetCardinality: "maxTargetCardinality";
    readonly symmetric: "symmetric";
    readonly transitive: "transitive";
    readonly composition: "composition";
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
    readonly validFrom: "validFrom";
    readonly validTo: "validTo";
    readonly transactionTime: "transactionTime";
};
export type EntityInstanceScalarFieldEnum = (typeof EntityInstanceScalarFieldEnum)[keyof typeof EntityInstanceScalarFieldEnum];
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
export declare const MetricDefinitionScalarFieldEnum: {
    readonly id: "id";
    readonly key: "key";
    readonly semanticUri: "semanticUri";
    readonly name: "name";
    readonly description: "description";
    readonly unit: "unit";
    readonly dataType: "dataType";
    readonly minValue: "minValue";
    readonly maxValue: "maxValue";
    readonly required: "required";
    readonly status: "status";
    readonly createdAt: "createdAt";
    readonly entityTypeId: "entityTypeId";
};
export type MetricDefinitionScalarFieldEnum = (typeof MetricDefinitionScalarFieldEnum)[keyof typeof MetricDefinitionScalarFieldEnum];
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