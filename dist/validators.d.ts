import { z } from 'zod';
export declare const CreateEntityTypeSchema: z.ZodObject<{
    name: z.ZodString;
    attributes: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        dataType: z.ZodEnum<{
            string: "string";
            boolean: "boolean";
            int: "int";
            float: "float";
            json: "json";
            datetime: "datetime";
        }>;
        required: z.ZodOptional<z.ZodBoolean>;
        temporal: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const UpdateEntityTypeSchema: z.ZodObject<{
    attributes: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        dataType: z.ZodEnum<{
            string: "string";
            boolean: "boolean";
            int: "int";
            float: "float";
            json: "json";
            datetime: "datetime";
        }>;
        required: z.ZodOptional<z.ZodBoolean>;
        temporal: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const CreateRelationshipDefSchema: z.ZodObject<{
    name: z.ZodString;
    sourceEntityTypeId: z.ZodString;
    targetEntityTypeId: z.ZodString;
}, z.core.$strip>;
export declare const CreateRelationshipInstanceSchema: z.ZodObject<{
    relationshipDefinitionId: z.ZodString;
    sourceLogicalId: z.ZodString;
    targetLogicalId: z.ZodString;
    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
export declare const IngestTelemetrySchema: z.ZodObject<{
    logicalId: z.ZodString;
    metrics: z.ZodArray<z.ZodObject<{
        metric: z.ZodString;
        value: z.ZodNumber;
        timestamp: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const CreateDataSourceSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<{
        REST_API: "REST_API";
        JSON_UPLOAD: "JSON_UPLOAD";
        CSV_UPLOAD: "CSV_UPLOAD";
    }>;
    connectionConfig: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    enabled: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const CreateIntegrationJobSchema: z.ZodObject<{
    name: z.ZodString;
    dataSourceId: z.ZodString;
    targetEntityTypeId: z.ZodString;
    fieldMapping: z.ZodRecord<z.ZodString, z.ZodString>;
    logicalIdField: z.ZodString;
    schedule: z.ZodOptional<z.ZodString>;
    enabled: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const CreateModelSchema: z.ZodObject<{
    name: z.ZodString;
    entityTypeId: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    inputFields: z.ZodArray<z.ZodString>;
    outputField: z.ZodString;
}, z.core.$strip>;
export declare const CreateModelVersionSchema: z.ZodObject<{
    strategy: z.ZodEnum<{
        THRESHOLD: "THRESHOLD";
        ANOMALY_ZSCORE: "ANOMALY_ZSCORE";
        LINEAR_REGRESSION: "LINEAR_REGRESSION";
        CUSTOM: "CUSTOM";
    }>;
    hyperparameters: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, z.core.$strip>;
export declare const UpdateModelVersionStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        PRODUCTION: "PRODUCTION";
        DRAFT: "DRAFT";
        STAGING: "STAGING";
        RETIRED: "RETIRED";
    }>;
}, z.core.$strip>;
export declare const CreateDecisionRuleSchema: z.ZodObject<{
    name: z.ZodString;
    entityTypeId: z.ZodString;
    conditions: z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        operator: z.ZodEnum<{
            ">": ">";
            "<": "<";
            ">=": ">=";
            "<=": "<=";
            "==": "==";
            "!=": "!=";
            contains: "contains";
            exists: "exists";
        }>;
        value: z.ZodUnknown;
    }, z.core.$strip>>;
    logicOperator: z.ZodOptional<z.ZodEnum<{
        AND: "AND";
        OR: "OR";
    }>>;
    priority: z.ZodOptional<z.ZodNumber>;
    autoExecute: z.ZodOptional<z.ZodBoolean>;
    confidenceThreshold: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const CreateActionDefinitionSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<{
        WEBHOOK: "WEBHOOK";
        UPDATE_ENTITY: "UPDATE_ENTITY";
        CREATE_ALERT: "CREATE_ALERT";
        RUN_INFERENCE: "RUN_INFERENCE";
        LOG_ONLY: "LOG_ONLY";
    }>;
    config: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, z.core.$strip>;
export declare const CreateExecutionPlanSchema: z.ZodObject<{
    decisionRuleId: z.ZodString;
    actionDefinitionId: z.ZodString;
    stepOrder: z.ZodNumber;
    continueOnFailure: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const CreateComputedMetricSchema: z.ZodObject<{
    name: z.ZodString;
    entityTypeId: z.ZodString;
    expression: z.ZodString;
    unit: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const CreatePolicySchema: z.ZodObject<{
    name: z.ZodString;
    entityTypeId: z.ZodString;
    eventType: z.ZodOptional<z.ZodString>;
    condition: z.ZodObject<{
        field: z.ZodString;
        operator: z.ZodString;
        value: z.ZodUnknown;
    }, z.core.$strip>;
    actionType: z.ZodOptional<z.ZodString>;
    actionConfig: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
export declare const CreateApiKeySchema: z.ZodObject<{
    name: z.ZodString;
    role: z.ZodOptional<z.ZodEnum<{
        ADMIN: "ADMIN";
        VIEWER: "VIEWER";
        OPERATOR: "OPERATOR";
    }>>;
    rateLimit: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
//# sourceMappingURL=validators.d.ts.map