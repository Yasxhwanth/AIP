import * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../models";
import { type PrismaClient } from "./class";
export type * from '../models';
export type DMMF = typeof runtime.DMMF;
export type PrismaPromise<T> = runtime.Types.Public.PrismaPromise<T>;
/**
 * Prisma Errors
 */
export declare const PrismaClientKnownRequestError: typeof runtime.PrismaClientKnownRequestError;
export type PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
export declare const PrismaClientUnknownRequestError: typeof runtime.PrismaClientUnknownRequestError;
export type PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
export declare const PrismaClientRustPanicError: typeof runtime.PrismaClientRustPanicError;
export type PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
export declare const PrismaClientInitializationError: typeof runtime.PrismaClientInitializationError;
export type PrismaClientInitializationError = runtime.PrismaClientInitializationError;
export declare const PrismaClientValidationError: typeof runtime.PrismaClientValidationError;
export type PrismaClientValidationError = runtime.PrismaClientValidationError;
/**
 * Re-export of sql-template-tag
 */
export declare const sql: typeof runtime.sqltag;
export declare const empty: runtime.Sql;
export declare const join: typeof runtime.join;
export declare const raw: typeof runtime.raw;
export declare const Sql: typeof runtime.Sql;
export type Sql = runtime.Sql;
/**
 * Decimal.js
 */
export declare const Decimal: typeof runtime.Decimal;
export type Decimal = runtime.Decimal;
export type DecimalJsLike = runtime.DecimalJsLike;
/**
* Extensions
*/
export type Extension = runtime.Types.Extensions.UserArgs;
export declare const getExtensionContext: typeof runtime.Extensions.getExtensionContext;
export type Args<T, F extends runtime.Operation> = runtime.Types.Public.Args<T, F>;
export type Payload<T, F extends runtime.Operation = never> = runtime.Types.Public.Payload<T, F>;
export type Result<T, A, F extends runtime.Operation> = runtime.Types.Public.Result<T, A, F>;
export type Exact<A, W> = runtime.Types.Public.Exact<A, W>;
export type PrismaVersion = {
    client: string;
    engine: string;
};
/**
 * Prisma Client JS version: 7.4.1
 * Query Engine version: 55ae170b1ced7fc6ed07a15f110549408c501bb3
 */
export declare const prismaVersion: PrismaVersion;
/**
 * Utility Types
 */
export type Bytes = runtime.Bytes;
export type JsonObject = runtime.JsonObject;
export type JsonArray = runtime.JsonArray;
export type JsonValue = runtime.JsonValue;
export type InputJsonObject = runtime.InputJsonObject;
export type InputJsonArray = runtime.InputJsonArray;
export type InputJsonValue = runtime.InputJsonValue;
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
export declare const DbNull: runtime.DbNullClass;
/**
 * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const JsonNull: runtime.JsonNullClass;
/**
 * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const AnyNull: runtime.AnyNullClass;
type SelectAndInclude = {
    select: any;
    include: any;
};
type SelectAndOmit = {
    select: any;
    omit: any;
};
/**
 * From T, pick a set of properties whose keys are in the union K
 */
type Prisma__Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};
export type Enumerable<T> = T | Array<T>;
/**
 * Subset
 * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
 */
export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
};
/**
 * SelectSubset
 * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
 * Additionally, it validates, if both select and include are present. If the case, it errors.
 */
export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
} & (T extends SelectAndInclude ? 'Please either choose `select` or `include`.' : T extends SelectAndOmit ? 'Please either choose `select` or `omit`.' : {});
/**
 * Subset + Intersection
 * @desc From `T` pick properties that exist in `U` and intersect `K`
 */
export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
} & K;
type Without<T, U> = {
    [P in Exclude<keyof T, keyof U>]?: never;
};
/**
 * XOR is needed to have a real mutually exclusive union type
 * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
 */
export type XOR<T, U> = T extends object ? U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : U : T;
/**
 * Is T a Record?
 */
type IsObject<T extends any> = T extends Array<any> ? False : T extends Date ? False : T extends Uint8Array ? False : T extends BigInt ? False : T extends object ? True : False;
/**
 * If it's T[], return T
 */
export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T;
/**
 * From ts-toolbelt
 */
type __Either<O extends object, K extends Key> = Omit<O, K> & {
    [P in K]: Prisma__Pick<O, P & keyof O>;
}[K];
type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>;
type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>;
type _Either<O extends object, K extends Key, strict extends Boolean> = {
    1: EitherStrict<O, K>;
    0: EitherLoose<O, K>;
}[strict];
export type Either<O extends object, K extends Key, strict extends Boolean = 1> = O extends unknown ? _Either<O, K, strict> : never;
export type Union = any;
export type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K];
} & {};
/** Helper Types for "Merge" **/
export type IntersectOf<U extends Union> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
export type Overwrite<O extends object, O1 extends object> = {
    [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
} & {};
type _Merge<U extends object> = IntersectOf<Overwrite<U, {
    [K in keyof U]-?: At<U, K>;
}>>;
type Key = string | number | symbol;
type AtStrict<O extends object, K extends Key> = O[K & keyof O];
type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
    1: AtStrict<O, K>;
    0: AtLoose<O, K>;
}[strict];
export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
} & {};
export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
} & {};
type _Record<K extends keyof any, T> = {
    [P in K]: T;
};
type NoExpand<T> = T extends unknown ? T : never;
export type AtLeast<O extends object, K extends string> = NoExpand<O extends unknown ? (K extends keyof O ? {
    [P in K]: O[P];
} & O : O) | {
    [P in keyof O as P extends K ? P : never]-?: O[P];
} & O : never>;
type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;
export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
/** End Helper Types for "Merge" **/
export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;
export type Boolean = True | False;
export type True = 1;
export type False = 0;
export type Not<B extends Boolean> = {
    0: 1;
    1: 0;
}[B];
export type Extends<A1 extends any, A2 extends any> = [A1] extends [never] ? 0 : A1 extends A2 ? 1 : 0;
export type Has<U extends Union, U1 extends Union> = Not<Extends<Exclude<U1, U>, U1>>;
export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
        0: 0;
        1: 1;
    };
    1: {
        0: 1;
        1: 1;
    };
}[B1][B2];
export type Keys<U extends Union> = U extends unknown ? keyof U : never;
export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O ? O[P] : never;
} : never;
type FieldPaths<T, U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>> = IsObject<T> extends True ? U : T;
export type GetHavingFields<T> = {
    [K in keyof T]: Or<Or<Extends<'OR', K>, Extends<'AND', K>>, Extends<'NOT', K>> extends True ? T[K] extends infer TK ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never> : never : {} extends FieldPaths<T[K]> ? never : K;
}[keyof T];
/**
 * Convert tuple to union
 */
type _TupleToUnion<T> = T extends (infer E)[] ? E : never;
type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>;
export type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T;
/**
 * Like `Pick`, but additionally can also accept an array of keys
 */
export type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>;
/**
 * Exclude all keys with underscores
 */
export type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T;
export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>;
type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>;
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
    readonly DataSource: "DataSource";
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
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export interface TypeMapCb<GlobalOmitOptions = {}> extends runtime.Types.Utils.Fn<{
    extArgs: runtime.Types.Extensions.InternalArgs;
}, runtime.Types.Utils.Record<string, any>> {
    returns: TypeMap<this['params']['extArgs'], GlobalOmitOptions>;
}
export type TypeMap<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
        omit: GlobalOmitOptions;
    };
    meta: {
        modelProps: "entityType" | "attributeDefinition" | "relationshipDefinition" | "relationshipInstance" | "entityInstance" | "domainEvent" | "policyDefinition" | "alert" | "currentEntityState" | "currentGraph" | "timeseriesMetric" | "dataSource" | "integrationJob" | "jobExecution" | "computedMetricDefinition" | "telemetryRollup" | "modelDefinition" | "modelVersion" | "inferenceResult" | "decisionRule" | "actionDefinition" | "executionPlan" | "decisionLog" | "apiKey";
        txIsolationLevel: TransactionIsolationLevel;
    };
    model: {
        EntityType: {
            payload: Prisma.$EntityTypePayload<ExtArgs>;
            fields: Prisma.EntityTypeFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.EntityTypeFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EntityTypePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.EntityTypeFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EntityTypePayload>;
                };
                findFirst: {
                    args: Prisma.EntityTypeFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EntityTypePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.EntityTypeFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EntityTypePayload>;
                };
                findMany: {
                    args: Prisma.EntityTypeFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EntityTypePayload>[];
                };
                create: {
                    args: Prisma.EntityTypeCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EntityTypePayload>;
                };
                createMany: {
                    args: Prisma.EntityTypeCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.EntityTypeCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EntityTypePayload>[];
                };
                delete: {
                    args: Prisma.EntityTypeDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EntityTypePayload>;
                };
                update: {
                    args: Prisma.EntityTypeUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EntityTypePayload>;
                };
                deleteMany: {
                    args: Prisma.EntityTypeDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.EntityTypeUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.EntityTypeUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EntityTypePayload>[];
                };
                upsert: {
                    args: Prisma.EntityTypeUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EntityTypePayload>;
                };
                aggregate: {
                    args: Prisma.EntityTypeAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateEntityType>;
                };
                groupBy: {
                    args: Prisma.EntityTypeGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.EntityTypeGroupByOutputType>[];
                };
                count: {
                    args: Prisma.EntityTypeCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.EntityTypeCountAggregateOutputType> | number;
                };
            };
        };
        AttributeDefinition: {
            payload: Prisma.$AttributeDefinitionPayload<ExtArgs>;
            fields: Prisma.AttributeDefinitionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.AttributeDefinitionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AttributeDefinitionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.AttributeDefinitionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AttributeDefinitionPayload>;
                };
                findFirst: {
                    args: Prisma.AttributeDefinitionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AttributeDefinitionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.AttributeDefinitionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AttributeDefinitionPayload>;
                };
                findMany: {
                    args: Prisma.AttributeDefinitionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AttributeDefinitionPayload>[];
                };
                create: {
                    args: Prisma.AttributeDefinitionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AttributeDefinitionPayload>;
                };
                createMany: {
                    args: Prisma.AttributeDefinitionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.AttributeDefinitionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AttributeDefinitionPayload>[];
                };
                delete: {
                    args: Prisma.AttributeDefinitionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AttributeDefinitionPayload>;
                };
                update: {
                    args: Prisma.AttributeDefinitionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AttributeDefinitionPayload>;
                };
                deleteMany: {
                    args: Prisma.AttributeDefinitionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.AttributeDefinitionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.AttributeDefinitionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AttributeDefinitionPayload>[];
                };
                upsert: {
                    args: Prisma.AttributeDefinitionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AttributeDefinitionPayload>;
                };
                aggregate: {
                    args: Prisma.AttributeDefinitionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateAttributeDefinition>;
                };
                groupBy: {
                    args: Prisma.AttributeDefinitionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AttributeDefinitionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.AttributeDefinitionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AttributeDefinitionCountAggregateOutputType> | number;
                };
            };
        };
        RelationshipDefinition: {
            payload: Prisma.$RelationshipDefinitionPayload<ExtArgs>;
            fields: Prisma.RelationshipDefinitionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.RelationshipDefinitionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RelationshipDefinitionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.RelationshipDefinitionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RelationshipDefinitionPayload>;
                };
                findFirst: {
                    args: Prisma.RelationshipDefinitionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RelationshipDefinitionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.RelationshipDefinitionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RelationshipDefinitionPayload>;
                };
                findMany: {
                    args: Prisma.RelationshipDefinitionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RelationshipDefinitionPayload>[];
                };
                create: {
                    args: Prisma.RelationshipDefinitionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RelationshipDefinitionPayload>;
                };
                createMany: {
                    args: Prisma.RelationshipDefinitionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.RelationshipDefinitionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RelationshipDefinitionPayload>[];
                };
                delete: {
                    args: Prisma.RelationshipDefinitionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RelationshipDefinitionPayload>;
                };
                update: {
                    args: Prisma.RelationshipDefinitionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RelationshipDefinitionPayload>;
                };
                deleteMany: {
                    args: Prisma.RelationshipDefinitionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.RelationshipDefinitionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.RelationshipDefinitionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RelationshipDefinitionPayload>[];
                };
                upsert: {
                    args: Prisma.RelationshipDefinitionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RelationshipDefinitionPayload>;
                };
                aggregate: {
                    args: Prisma.RelationshipDefinitionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateRelationshipDefinition>;
                };
                groupBy: {
                    args: Prisma.RelationshipDefinitionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RelationshipDefinitionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.RelationshipDefinitionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RelationshipDefinitionCountAggregateOutputType> | number;
                };
            };
        };
        RelationshipInstance: {
            payload: Prisma.$RelationshipInstancePayload<ExtArgs>;
            fields: Prisma.RelationshipInstanceFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.RelationshipInstanceFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RelationshipInstancePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.RelationshipInstanceFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RelationshipInstancePayload>;
                };
                findFirst: {
                    args: Prisma.RelationshipInstanceFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RelationshipInstancePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.RelationshipInstanceFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RelationshipInstancePayload>;
                };
                findMany: {
                    args: Prisma.RelationshipInstanceFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RelationshipInstancePayload>[];
                };
                create: {
                    args: Prisma.RelationshipInstanceCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RelationshipInstancePayload>;
                };
                createMany: {
                    args: Prisma.RelationshipInstanceCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.RelationshipInstanceCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RelationshipInstancePayload>[];
                };
                delete: {
                    args: Prisma.RelationshipInstanceDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RelationshipInstancePayload>;
                };
                update: {
                    args: Prisma.RelationshipInstanceUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RelationshipInstancePayload>;
                };
                deleteMany: {
                    args: Prisma.RelationshipInstanceDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.RelationshipInstanceUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.RelationshipInstanceUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RelationshipInstancePayload>[];
                };
                upsert: {
                    args: Prisma.RelationshipInstanceUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RelationshipInstancePayload>;
                };
                aggregate: {
                    args: Prisma.RelationshipInstanceAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateRelationshipInstance>;
                };
                groupBy: {
                    args: Prisma.RelationshipInstanceGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RelationshipInstanceGroupByOutputType>[];
                };
                count: {
                    args: Prisma.RelationshipInstanceCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RelationshipInstanceCountAggregateOutputType> | number;
                };
            };
        };
        EntityInstance: {
            payload: Prisma.$EntityInstancePayload<ExtArgs>;
            fields: Prisma.EntityInstanceFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.EntityInstanceFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EntityInstancePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.EntityInstanceFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EntityInstancePayload>;
                };
                findFirst: {
                    args: Prisma.EntityInstanceFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EntityInstancePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.EntityInstanceFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EntityInstancePayload>;
                };
                findMany: {
                    args: Prisma.EntityInstanceFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EntityInstancePayload>[];
                };
                create: {
                    args: Prisma.EntityInstanceCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EntityInstancePayload>;
                };
                createMany: {
                    args: Prisma.EntityInstanceCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.EntityInstanceCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EntityInstancePayload>[];
                };
                delete: {
                    args: Prisma.EntityInstanceDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EntityInstancePayload>;
                };
                update: {
                    args: Prisma.EntityInstanceUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EntityInstancePayload>;
                };
                deleteMany: {
                    args: Prisma.EntityInstanceDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.EntityInstanceUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.EntityInstanceUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EntityInstancePayload>[];
                };
                upsert: {
                    args: Prisma.EntityInstanceUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EntityInstancePayload>;
                };
                aggregate: {
                    args: Prisma.EntityInstanceAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateEntityInstance>;
                };
                groupBy: {
                    args: Prisma.EntityInstanceGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.EntityInstanceGroupByOutputType>[];
                };
                count: {
                    args: Prisma.EntityInstanceCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.EntityInstanceCountAggregateOutputType> | number;
                };
            };
        };
        DomainEvent: {
            payload: Prisma.$DomainEventPayload<ExtArgs>;
            fields: Prisma.DomainEventFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.DomainEventFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DomainEventPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.DomainEventFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DomainEventPayload>;
                };
                findFirst: {
                    args: Prisma.DomainEventFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DomainEventPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.DomainEventFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DomainEventPayload>;
                };
                findMany: {
                    args: Prisma.DomainEventFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DomainEventPayload>[];
                };
                create: {
                    args: Prisma.DomainEventCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DomainEventPayload>;
                };
                createMany: {
                    args: Prisma.DomainEventCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.DomainEventCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DomainEventPayload>[];
                };
                delete: {
                    args: Prisma.DomainEventDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DomainEventPayload>;
                };
                update: {
                    args: Prisma.DomainEventUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DomainEventPayload>;
                };
                deleteMany: {
                    args: Prisma.DomainEventDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.DomainEventUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.DomainEventUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DomainEventPayload>[];
                };
                upsert: {
                    args: Prisma.DomainEventUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DomainEventPayload>;
                };
                aggregate: {
                    args: Prisma.DomainEventAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateDomainEvent>;
                };
                groupBy: {
                    args: Prisma.DomainEventGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.DomainEventGroupByOutputType>[];
                };
                count: {
                    args: Prisma.DomainEventCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.DomainEventCountAggregateOutputType> | number;
                };
            };
        };
        PolicyDefinition: {
            payload: Prisma.$PolicyDefinitionPayload<ExtArgs>;
            fields: Prisma.PolicyDefinitionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.PolicyDefinitionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PolicyDefinitionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.PolicyDefinitionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PolicyDefinitionPayload>;
                };
                findFirst: {
                    args: Prisma.PolicyDefinitionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PolicyDefinitionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.PolicyDefinitionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PolicyDefinitionPayload>;
                };
                findMany: {
                    args: Prisma.PolicyDefinitionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PolicyDefinitionPayload>[];
                };
                create: {
                    args: Prisma.PolicyDefinitionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PolicyDefinitionPayload>;
                };
                createMany: {
                    args: Prisma.PolicyDefinitionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.PolicyDefinitionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PolicyDefinitionPayload>[];
                };
                delete: {
                    args: Prisma.PolicyDefinitionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PolicyDefinitionPayload>;
                };
                update: {
                    args: Prisma.PolicyDefinitionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PolicyDefinitionPayload>;
                };
                deleteMany: {
                    args: Prisma.PolicyDefinitionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.PolicyDefinitionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.PolicyDefinitionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PolicyDefinitionPayload>[];
                };
                upsert: {
                    args: Prisma.PolicyDefinitionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PolicyDefinitionPayload>;
                };
                aggregate: {
                    args: Prisma.PolicyDefinitionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregatePolicyDefinition>;
                };
                groupBy: {
                    args: Prisma.PolicyDefinitionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PolicyDefinitionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.PolicyDefinitionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PolicyDefinitionCountAggregateOutputType> | number;
                };
            };
        };
        Alert: {
            payload: Prisma.$AlertPayload<ExtArgs>;
            fields: Prisma.AlertFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.AlertFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AlertPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.AlertFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AlertPayload>;
                };
                findFirst: {
                    args: Prisma.AlertFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AlertPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.AlertFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AlertPayload>;
                };
                findMany: {
                    args: Prisma.AlertFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AlertPayload>[];
                };
                create: {
                    args: Prisma.AlertCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AlertPayload>;
                };
                createMany: {
                    args: Prisma.AlertCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.AlertCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AlertPayload>[];
                };
                delete: {
                    args: Prisma.AlertDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AlertPayload>;
                };
                update: {
                    args: Prisma.AlertUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AlertPayload>;
                };
                deleteMany: {
                    args: Prisma.AlertDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.AlertUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.AlertUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AlertPayload>[];
                };
                upsert: {
                    args: Prisma.AlertUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AlertPayload>;
                };
                aggregate: {
                    args: Prisma.AlertAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateAlert>;
                };
                groupBy: {
                    args: Prisma.AlertGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AlertGroupByOutputType>[];
                };
                count: {
                    args: Prisma.AlertCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AlertCountAggregateOutputType> | number;
                };
            };
        };
        CurrentEntityState: {
            payload: Prisma.$CurrentEntityStatePayload<ExtArgs>;
            fields: Prisma.CurrentEntityStateFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.CurrentEntityStateFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CurrentEntityStatePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.CurrentEntityStateFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CurrentEntityStatePayload>;
                };
                findFirst: {
                    args: Prisma.CurrentEntityStateFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CurrentEntityStatePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.CurrentEntityStateFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CurrentEntityStatePayload>;
                };
                findMany: {
                    args: Prisma.CurrentEntityStateFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CurrentEntityStatePayload>[];
                };
                create: {
                    args: Prisma.CurrentEntityStateCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CurrentEntityStatePayload>;
                };
                createMany: {
                    args: Prisma.CurrentEntityStateCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.CurrentEntityStateCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CurrentEntityStatePayload>[];
                };
                delete: {
                    args: Prisma.CurrentEntityStateDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CurrentEntityStatePayload>;
                };
                update: {
                    args: Prisma.CurrentEntityStateUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CurrentEntityStatePayload>;
                };
                deleteMany: {
                    args: Prisma.CurrentEntityStateDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.CurrentEntityStateUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.CurrentEntityStateUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CurrentEntityStatePayload>[];
                };
                upsert: {
                    args: Prisma.CurrentEntityStateUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CurrentEntityStatePayload>;
                };
                aggregate: {
                    args: Prisma.CurrentEntityStateAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateCurrentEntityState>;
                };
                groupBy: {
                    args: Prisma.CurrentEntityStateGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CurrentEntityStateGroupByOutputType>[];
                };
                count: {
                    args: Prisma.CurrentEntityStateCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CurrentEntityStateCountAggregateOutputType> | number;
                };
            };
        };
        CurrentGraph: {
            payload: Prisma.$CurrentGraphPayload<ExtArgs>;
            fields: Prisma.CurrentGraphFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.CurrentGraphFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CurrentGraphPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.CurrentGraphFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CurrentGraphPayload>;
                };
                findFirst: {
                    args: Prisma.CurrentGraphFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CurrentGraphPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.CurrentGraphFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CurrentGraphPayload>;
                };
                findMany: {
                    args: Prisma.CurrentGraphFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CurrentGraphPayload>[];
                };
                create: {
                    args: Prisma.CurrentGraphCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CurrentGraphPayload>;
                };
                createMany: {
                    args: Prisma.CurrentGraphCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.CurrentGraphCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CurrentGraphPayload>[];
                };
                delete: {
                    args: Prisma.CurrentGraphDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CurrentGraphPayload>;
                };
                update: {
                    args: Prisma.CurrentGraphUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CurrentGraphPayload>;
                };
                deleteMany: {
                    args: Prisma.CurrentGraphDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.CurrentGraphUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.CurrentGraphUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CurrentGraphPayload>[];
                };
                upsert: {
                    args: Prisma.CurrentGraphUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CurrentGraphPayload>;
                };
                aggregate: {
                    args: Prisma.CurrentGraphAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateCurrentGraph>;
                };
                groupBy: {
                    args: Prisma.CurrentGraphGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CurrentGraphGroupByOutputType>[];
                };
                count: {
                    args: Prisma.CurrentGraphCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CurrentGraphCountAggregateOutputType> | number;
                };
            };
        };
        TimeseriesMetric: {
            payload: Prisma.$TimeseriesMetricPayload<ExtArgs>;
            fields: Prisma.TimeseriesMetricFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.TimeseriesMetricFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TimeseriesMetricPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.TimeseriesMetricFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TimeseriesMetricPayload>;
                };
                findFirst: {
                    args: Prisma.TimeseriesMetricFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TimeseriesMetricPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.TimeseriesMetricFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TimeseriesMetricPayload>;
                };
                findMany: {
                    args: Prisma.TimeseriesMetricFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TimeseriesMetricPayload>[];
                };
                create: {
                    args: Prisma.TimeseriesMetricCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TimeseriesMetricPayload>;
                };
                createMany: {
                    args: Prisma.TimeseriesMetricCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.TimeseriesMetricCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TimeseriesMetricPayload>[];
                };
                delete: {
                    args: Prisma.TimeseriesMetricDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TimeseriesMetricPayload>;
                };
                update: {
                    args: Prisma.TimeseriesMetricUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TimeseriesMetricPayload>;
                };
                deleteMany: {
                    args: Prisma.TimeseriesMetricDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.TimeseriesMetricUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.TimeseriesMetricUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TimeseriesMetricPayload>[];
                };
                upsert: {
                    args: Prisma.TimeseriesMetricUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TimeseriesMetricPayload>;
                };
                aggregate: {
                    args: Prisma.TimeseriesMetricAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateTimeseriesMetric>;
                };
                groupBy: {
                    args: Prisma.TimeseriesMetricGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TimeseriesMetricGroupByOutputType>[];
                };
                count: {
                    args: Prisma.TimeseriesMetricCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TimeseriesMetricCountAggregateOutputType> | number;
                };
            };
        };
        DataSource: {
            payload: Prisma.$DataSourcePayload<ExtArgs>;
            fields: Prisma.DataSourceFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.DataSourceFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataSourcePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.DataSourceFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataSourcePayload>;
                };
                findFirst: {
                    args: Prisma.DataSourceFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataSourcePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.DataSourceFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataSourcePayload>;
                };
                findMany: {
                    args: Prisma.DataSourceFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataSourcePayload>[];
                };
                create: {
                    args: Prisma.DataSourceCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataSourcePayload>;
                };
                createMany: {
                    args: Prisma.DataSourceCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.DataSourceCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataSourcePayload>[];
                };
                delete: {
                    args: Prisma.DataSourceDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataSourcePayload>;
                };
                update: {
                    args: Prisma.DataSourceUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataSourcePayload>;
                };
                deleteMany: {
                    args: Prisma.DataSourceDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.DataSourceUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.DataSourceUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataSourcePayload>[];
                };
                upsert: {
                    args: Prisma.DataSourceUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataSourcePayload>;
                };
                aggregate: {
                    args: Prisma.DataSourceAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateDataSource>;
                };
                groupBy: {
                    args: Prisma.DataSourceGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.DataSourceGroupByOutputType>[];
                };
                count: {
                    args: Prisma.DataSourceCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.DataSourceCountAggregateOutputType> | number;
                };
            };
        };
        IntegrationJob: {
            payload: Prisma.$IntegrationJobPayload<ExtArgs>;
            fields: Prisma.IntegrationJobFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.IntegrationJobFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$IntegrationJobPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.IntegrationJobFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$IntegrationJobPayload>;
                };
                findFirst: {
                    args: Prisma.IntegrationJobFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$IntegrationJobPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.IntegrationJobFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$IntegrationJobPayload>;
                };
                findMany: {
                    args: Prisma.IntegrationJobFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$IntegrationJobPayload>[];
                };
                create: {
                    args: Prisma.IntegrationJobCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$IntegrationJobPayload>;
                };
                createMany: {
                    args: Prisma.IntegrationJobCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.IntegrationJobCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$IntegrationJobPayload>[];
                };
                delete: {
                    args: Prisma.IntegrationJobDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$IntegrationJobPayload>;
                };
                update: {
                    args: Prisma.IntegrationJobUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$IntegrationJobPayload>;
                };
                deleteMany: {
                    args: Prisma.IntegrationJobDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.IntegrationJobUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.IntegrationJobUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$IntegrationJobPayload>[];
                };
                upsert: {
                    args: Prisma.IntegrationJobUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$IntegrationJobPayload>;
                };
                aggregate: {
                    args: Prisma.IntegrationJobAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateIntegrationJob>;
                };
                groupBy: {
                    args: Prisma.IntegrationJobGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.IntegrationJobGroupByOutputType>[];
                };
                count: {
                    args: Prisma.IntegrationJobCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.IntegrationJobCountAggregateOutputType> | number;
                };
            };
        };
        JobExecution: {
            payload: Prisma.$JobExecutionPayload<ExtArgs>;
            fields: Prisma.JobExecutionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.JobExecutionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$JobExecutionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.JobExecutionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$JobExecutionPayload>;
                };
                findFirst: {
                    args: Prisma.JobExecutionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$JobExecutionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.JobExecutionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$JobExecutionPayload>;
                };
                findMany: {
                    args: Prisma.JobExecutionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$JobExecutionPayload>[];
                };
                create: {
                    args: Prisma.JobExecutionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$JobExecutionPayload>;
                };
                createMany: {
                    args: Prisma.JobExecutionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.JobExecutionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$JobExecutionPayload>[];
                };
                delete: {
                    args: Prisma.JobExecutionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$JobExecutionPayload>;
                };
                update: {
                    args: Prisma.JobExecutionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$JobExecutionPayload>;
                };
                deleteMany: {
                    args: Prisma.JobExecutionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.JobExecutionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.JobExecutionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$JobExecutionPayload>[];
                };
                upsert: {
                    args: Prisma.JobExecutionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$JobExecutionPayload>;
                };
                aggregate: {
                    args: Prisma.JobExecutionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateJobExecution>;
                };
                groupBy: {
                    args: Prisma.JobExecutionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.JobExecutionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.JobExecutionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.JobExecutionCountAggregateOutputType> | number;
                };
            };
        };
        ComputedMetricDefinition: {
            payload: Prisma.$ComputedMetricDefinitionPayload<ExtArgs>;
            fields: Prisma.ComputedMetricDefinitionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ComputedMetricDefinitionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ComputedMetricDefinitionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ComputedMetricDefinitionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ComputedMetricDefinitionPayload>;
                };
                findFirst: {
                    args: Prisma.ComputedMetricDefinitionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ComputedMetricDefinitionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ComputedMetricDefinitionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ComputedMetricDefinitionPayload>;
                };
                findMany: {
                    args: Prisma.ComputedMetricDefinitionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ComputedMetricDefinitionPayload>[];
                };
                create: {
                    args: Prisma.ComputedMetricDefinitionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ComputedMetricDefinitionPayload>;
                };
                createMany: {
                    args: Prisma.ComputedMetricDefinitionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ComputedMetricDefinitionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ComputedMetricDefinitionPayload>[];
                };
                delete: {
                    args: Prisma.ComputedMetricDefinitionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ComputedMetricDefinitionPayload>;
                };
                update: {
                    args: Prisma.ComputedMetricDefinitionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ComputedMetricDefinitionPayload>;
                };
                deleteMany: {
                    args: Prisma.ComputedMetricDefinitionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ComputedMetricDefinitionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ComputedMetricDefinitionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ComputedMetricDefinitionPayload>[];
                };
                upsert: {
                    args: Prisma.ComputedMetricDefinitionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ComputedMetricDefinitionPayload>;
                };
                aggregate: {
                    args: Prisma.ComputedMetricDefinitionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateComputedMetricDefinition>;
                };
                groupBy: {
                    args: Prisma.ComputedMetricDefinitionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ComputedMetricDefinitionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ComputedMetricDefinitionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ComputedMetricDefinitionCountAggregateOutputType> | number;
                };
            };
        };
        TelemetryRollup: {
            payload: Prisma.$TelemetryRollupPayload<ExtArgs>;
            fields: Prisma.TelemetryRollupFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.TelemetryRollupFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TelemetryRollupPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.TelemetryRollupFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TelemetryRollupPayload>;
                };
                findFirst: {
                    args: Prisma.TelemetryRollupFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TelemetryRollupPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.TelemetryRollupFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TelemetryRollupPayload>;
                };
                findMany: {
                    args: Prisma.TelemetryRollupFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TelemetryRollupPayload>[];
                };
                create: {
                    args: Prisma.TelemetryRollupCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TelemetryRollupPayload>;
                };
                createMany: {
                    args: Prisma.TelemetryRollupCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.TelemetryRollupCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TelemetryRollupPayload>[];
                };
                delete: {
                    args: Prisma.TelemetryRollupDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TelemetryRollupPayload>;
                };
                update: {
                    args: Prisma.TelemetryRollupUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TelemetryRollupPayload>;
                };
                deleteMany: {
                    args: Prisma.TelemetryRollupDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.TelemetryRollupUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.TelemetryRollupUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TelemetryRollupPayload>[];
                };
                upsert: {
                    args: Prisma.TelemetryRollupUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TelemetryRollupPayload>;
                };
                aggregate: {
                    args: Prisma.TelemetryRollupAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateTelemetryRollup>;
                };
                groupBy: {
                    args: Prisma.TelemetryRollupGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TelemetryRollupGroupByOutputType>[];
                };
                count: {
                    args: Prisma.TelemetryRollupCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TelemetryRollupCountAggregateOutputType> | number;
                };
            };
        };
        ModelDefinition: {
            payload: Prisma.$ModelDefinitionPayload<ExtArgs>;
            fields: Prisma.ModelDefinitionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ModelDefinitionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModelDefinitionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ModelDefinitionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModelDefinitionPayload>;
                };
                findFirst: {
                    args: Prisma.ModelDefinitionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModelDefinitionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ModelDefinitionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModelDefinitionPayload>;
                };
                findMany: {
                    args: Prisma.ModelDefinitionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModelDefinitionPayload>[];
                };
                create: {
                    args: Prisma.ModelDefinitionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModelDefinitionPayload>;
                };
                createMany: {
                    args: Prisma.ModelDefinitionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ModelDefinitionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModelDefinitionPayload>[];
                };
                delete: {
                    args: Prisma.ModelDefinitionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModelDefinitionPayload>;
                };
                update: {
                    args: Prisma.ModelDefinitionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModelDefinitionPayload>;
                };
                deleteMany: {
                    args: Prisma.ModelDefinitionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ModelDefinitionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ModelDefinitionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModelDefinitionPayload>[];
                };
                upsert: {
                    args: Prisma.ModelDefinitionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModelDefinitionPayload>;
                };
                aggregate: {
                    args: Prisma.ModelDefinitionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateModelDefinition>;
                };
                groupBy: {
                    args: Prisma.ModelDefinitionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ModelDefinitionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ModelDefinitionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ModelDefinitionCountAggregateOutputType> | number;
                };
            };
        };
        ModelVersion: {
            payload: Prisma.$ModelVersionPayload<ExtArgs>;
            fields: Prisma.ModelVersionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ModelVersionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModelVersionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ModelVersionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModelVersionPayload>;
                };
                findFirst: {
                    args: Prisma.ModelVersionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModelVersionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ModelVersionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModelVersionPayload>;
                };
                findMany: {
                    args: Prisma.ModelVersionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModelVersionPayload>[];
                };
                create: {
                    args: Prisma.ModelVersionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModelVersionPayload>;
                };
                createMany: {
                    args: Prisma.ModelVersionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ModelVersionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModelVersionPayload>[];
                };
                delete: {
                    args: Prisma.ModelVersionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModelVersionPayload>;
                };
                update: {
                    args: Prisma.ModelVersionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModelVersionPayload>;
                };
                deleteMany: {
                    args: Prisma.ModelVersionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ModelVersionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ModelVersionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModelVersionPayload>[];
                };
                upsert: {
                    args: Prisma.ModelVersionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModelVersionPayload>;
                };
                aggregate: {
                    args: Prisma.ModelVersionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateModelVersion>;
                };
                groupBy: {
                    args: Prisma.ModelVersionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ModelVersionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ModelVersionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ModelVersionCountAggregateOutputType> | number;
                };
            };
        };
        InferenceResult: {
            payload: Prisma.$InferenceResultPayload<ExtArgs>;
            fields: Prisma.InferenceResultFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.InferenceResultFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$InferenceResultPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.InferenceResultFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$InferenceResultPayload>;
                };
                findFirst: {
                    args: Prisma.InferenceResultFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$InferenceResultPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.InferenceResultFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$InferenceResultPayload>;
                };
                findMany: {
                    args: Prisma.InferenceResultFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$InferenceResultPayload>[];
                };
                create: {
                    args: Prisma.InferenceResultCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$InferenceResultPayload>;
                };
                createMany: {
                    args: Prisma.InferenceResultCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.InferenceResultCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$InferenceResultPayload>[];
                };
                delete: {
                    args: Prisma.InferenceResultDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$InferenceResultPayload>;
                };
                update: {
                    args: Prisma.InferenceResultUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$InferenceResultPayload>;
                };
                deleteMany: {
                    args: Prisma.InferenceResultDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.InferenceResultUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.InferenceResultUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$InferenceResultPayload>[];
                };
                upsert: {
                    args: Prisma.InferenceResultUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$InferenceResultPayload>;
                };
                aggregate: {
                    args: Prisma.InferenceResultAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateInferenceResult>;
                };
                groupBy: {
                    args: Prisma.InferenceResultGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.InferenceResultGroupByOutputType>[];
                };
                count: {
                    args: Prisma.InferenceResultCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.InferenceResultCountAggregateOutputType> | number;
                };
            };
        };
        DecisionRule: {
            payload: Prisma.$DecisionRulePayload<ExtArgs>;
            fields: Prisma.DecisionRuleFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.DecisionRuleFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DecisionRulePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.DecisionRuleFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DecisionRulePayload>;
                };
                findFirst: {
                    args: Prisma.DecisionRuleFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DecisionRulePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.DecisionRuleFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DecisionRulePayload>;
                };
                findMany: {
                    args: Prisma.DecisionRuleFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DecisionRulePayload>[];
                };
                create: {
                    args: Prisma.DecisionRuleCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DecisionRulePayload>;
                };
                createMany: {
                    args: Prisma.DecisionRuleCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.DecisionRuleCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DecisionRulePayload>[];
                };
                delete: {
                    args: Prisma.DecisionRuleDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DecisionRulePayload>;
                };
                update: {
                    args: Prisma.DecisionRuleUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DecisionRulePayload>;
                };
                deleteMany: {
                    args: Prisma.DecisionRuleDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.DecisionRuleUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.DecisionRuleUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DecisionRulePayload>[];
                };
                upsert: {
                    args: Prisma.DecisionRuleUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DecisionRulePayload>;
                };
                aggregate: {
                    args: Prisma.DecisionRuleAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateDecisionRule>;
                };
                groupBy: {
                    args: Prisma.DecisionRuleGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.DecisionRuleGroupByOutputType>[];
                };
                count: {
                    args: Prisma.DecisionRuleCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.DecisionRuleCountAggregateOutputType> | number;
                };
            };
        };
        ActionDefinition: {
            payload: Prisma.$ActionDefinitionPayload<ExtArgs>;
            fields: Prisma.ActionDefinitionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ActionDefinitionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ActionDefinitionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ActionDefinitionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ActionDefinitionPayload>;
                };
                findFirst: {
                    args: Prisma.ActionDefinitionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ActionDefinitionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ActionDefinitionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ActionDefinitionPayload>;
                };
                findMany: {
                    args: Prisma.ActionDefinitionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ActionDefinitionPayload>[];
                };
                create: {
                    args: Prisma.ActionDefinitionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ActionDefinitionPayload>;
                };
                createMany: {
                    args: Prisma.ActionDefinitionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ActionDefinitionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ActionDefinitionPayload>[];
                };
                delete: {
                    args: Prisma.ActionDefinitionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ActionDefinitionPayload>;
                };
                update: {
                    args: Prisma.ActionDefinitionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ActionDefinitionPayload>;
                };
                deleteMany: {
                    args: Prisma.ActionDefinitionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ActionDefinitionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ActionDefinitionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ActionDefinitionPayload>[];
                };
                upsert: {
                    args: Prisma.ActionDefinitionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ActionDefinitionPayload>;
                };
                aggregate: {
                    args: Prisma.ActionDefinitionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateActionDefinition>;
                };
                groupBy: {
                    args: Prisma.ActionDefinitionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ActionDefinitionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ActionDefinitionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ActionDefinitionCountAggregateOutputType> | number;
                };
            };
        };
        ExecutionPlan: {
            payload: Prisma.$ExecutionPlanPayload<ExtArgs>;
            fields: Prisma.ExecutionPlanFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ExecutionPlanFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExecutionPlanPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ExecutionPlanFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExecutionPlanPayload>;
                };
                findFirst: {
                    args: Prisma.ExecutionPlanFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExecutionPlanPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ExecutionPlanFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExecutionPlanPayload>;
                };
                findMany: {
                    args: Prisma.ExecutionPlanFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExecutionPlanPayload>[];
                };
                create: {
                    args: Prisma.ExecutionPlanCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExecutionPlanPayload>;
                };
                createMany: {
                    args: Prisma.ExecutionPlanCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ExecutionPlanCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExecutionPlanPayload>[];
                };
                delete: {
                    args: Prisma.ExecutionPlanDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExecutionPlanPayload>;
                };
                update: {
                    args: Prisma.ExecutionPlanUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExecutionPlanPayload>;
                };
                deleteMany: {
                    args: Prisma.ExecutionPlanDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ExecutionPlanUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ExecutionPlanUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExecutionPlanPayload>[];
                };
                upsert: {
                    args: Prisma.ExecutionPlanUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExecutionPlanPayload>;
                };
                aggregate: {
                    args: Prisma.ExecutionPlanAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateExecutionPlan>;
                };
                groupBy: {
                    args: Prisma.ExecutionPlanGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ExecutionPlanGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ExecutionPlanCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ExecutionPlanCountAggregateOutputType> | number;
                };
            };
        };
        DecisionLog: {
            payload: Prisma.$DecisionLogPayload<ExtArgs>;
            fields: Prisma.DecisionLogFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.DecisionLogFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DecisionLogPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.DecisionLogFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DecisionLogPayload>;
                };
                findFirst: {
                    args: Prisma.DecisionLogFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DecisionLogPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.DecisionLogFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DecisionLogPayload>;
                };
                findMany: {
                    args: Prisma.DecisionLogFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DecisionLogPayload>[];
                };
                create: {
                    args: Prisma.DecisionLogCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DecisionLogPayload>;
                };
                createMany: {
                    args: Prisma.DecisionLogCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.DecisionLogCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DecisionLogPayload>[];
                };
                delete: {
                    args: Prisma.DecisionLogDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DecisionLogPayload>;
                };
                update: {
                    args: Prisma.DecisionLogUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DecisionLogPayload>;
                };
                deleteMany: {
                    args: Prisma.DecisionLogDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.DecisionLogUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.DecisionLogUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DecisionLogPayload>[];
                };
                upsert: {
                    args: Prisma.DecisionLogUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DecisionLogPayload>;
                };
                aggregate: {
                    args: Prisma.DecisionLogAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateDecisionLog>;
                };
                groupBy: {
                    args: Prisma.DecisionLogGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.DecisionLogGroupByOutputType>[];
                };
                count: {
                    args: Prisma.DecisionLogCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.DecisionLogCountAggregateOutputType> | number;
                };
            };
        };
        ApiKey: {
            payload: Prisma.$ApiKeyPayload<ExtArgs>;
            fields: Prisma.ApiKeyFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ApiKeyFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApiKeyPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ApiKeyFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApiKeyPayload>;
                };
                findFirst: {
                    args: Prisma.ApiKeyFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApiKeyPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ApiKeyFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApiKeyPayload>;
                };
                findMany: {
                    args: Prisma.ApiKeyFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApiKeyPayload>[];
                };
                create: {
                    args: Prisma.ApiKeyCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApiKeyPayload>;
                };
                createMany: {
                    args: Prisma.ApiKeyCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ApiKeyCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApiKeyPayload>[];
                };
                delete: {
                    args: Prisma.ApiKeyDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApiKeyPayload>;
                };
                update: {
                    args: Prisma.ApiKeyUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApiKeyPayload>;
                };
                deleteMany: {
                    args: Prisma.ApiKeyDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ApiKeyUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ApiKeyUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApiKeyPayload>[];
                };
                upsert: {
                    args: Prisma.ApiKeyUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApiKeyPayload>;
                };
                aggregate: {
                    args: Prisma.ApiKeyAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateApiKey>;
                };
                groupBy: {
                    args: Prisma.ApiKeyGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ApiKeyGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ApiKeyCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ApiKeyCountAggregateOutputType> | number;
                };
            };
        };
    };
} & {
    other: {
        payload: any;
        operations: {
            $executeRaw: {
                args: [query: TemplateStringsArray | Sql, ...values: any[]];
                result: any;
            };
            $executeRawUnsafe: {
                args: [query: string, ...values: any[]];
                result: any;
            };
            $queryRaw: {
                args: [query: TemplateStringsArray | Sql, ...values: any[]];
                result: any;
            };
            $queryRawUnsafe: {
                args: [query: string, ...values: any[]];
                result: any;
            };
        };
    };
};
/**
 * Enums
 */
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
    readonly createdAt: "createdAt";
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
export declare const DataSourceScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly type: "type";
    readonly connectionConfig: "connectionConfig";
    readonly enabled: "enabled";
    readonly createdAt: "createdAt";
};
export type DataSourceScalarFieldEnum = (typeof DataSourceScalarFieldEnum)[keyof typeof DataSourceScalarFieldEnum];
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
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const NullableJsonNullValueInput: {
    readonly DbNull: runtime.DbNullClass;
    readonly JsonNull: runtime.JsonNullClass;
};
export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput];
export declare const JsonNullValueInput: {
    readonly JsonNull: runtime.JsonNullClass;
};
export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const JsonNullValueFilter: {
    readonly DbNull: runtime.DbNullClass;
    readonly JsonNull: runtime.JsonNullClass;
    readonly AnyNull: runtime.AnyNullClass;
};
export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
/**
 * Field references
 */
/**
 * Reference to a field of type 'String'
 */
export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>;
/**
 * Reference to a field of type 'String[]'
 */
export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>;
/**
 * Reference to a field of type 'Int'
 */
export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>;
/**
 * Reference to a field of type 'Int[]'
 */
export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>;
/**
 * Reference to a field of type 'DateTime'
 */
export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>;
/**
 * Reference to a field of type 'DateTime[]'
 */
export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>;
/**
 * Reference to a field of type 'Boolean'
 */
export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>;
/**
 * Reference to a field of type 'Json'
 */
export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>;
/**
 * Reference to a field of type 'QueryMode'
 */
export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>;
/**
 * Reference to a field of type 'Float'
 */
export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>;
/**
 * Reference to a field of type 'Float[]'
 */
export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>;
/**
 * Batch Payload for updateMany & deleteMany & createMany
 */
export type BatchPayload = {
    count: number;
};
export declare const defineExtension: runtime.Types.Extensions.ExtendsHook<"define", TypeMapCb, runtime.Types.Extensions.DefaultArgs>;
export type DefaultPrismaClient = PrismaClient;
export type ErrorFormat = 'pretty' | 'colorless' | 'minimal';
export type PrismaClientOptions = ({
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-pg`.
     */
    adapter: runtime.SqlDriverAdapterFactory;
    accelerateUrl?: never;
} | {
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl: string;
    adapter?: never;
}) & {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat;
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     *
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     *
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     *
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[];
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
        maxWait?: number;
        timeout?: number;
        isolationLevel?: TransactionIsolationLevel;
    };
    /**
     * Global configuration for omitting model fields by default.
     *
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: GlobalOmitConfig;
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     *
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[];
};
export type GlobalOmitConfig = {
    entityType?: Prisma.EntityTypeOmit;
    attributeDefinition?: Prisma.AttributeDefinitionOmit;
    relationshipDefinition?: Prisma.RelationshipDefinitionOmit;
    relationshipInstance?: Prisma.RelationshipInstanceOmit;
    entityInstance?: Prisma.EntityInstanceOmit;
    domainEvent?: Prisma.DomainEventOmit;
    policyDefinition?: Prisma.PolicyDefinitionOmit;
    alert?: Prisma.AlertOmit;
    currentEntityState?: Prisma.CurrentEntityStateOmit;
    currentGraph?: Prisma.CurrentGraphOmit;
    timeseriesMetric?: Prisma.TimeseriesMetricOmit;
    dataSource?: Prisma.DataSourceOmit;
    integrationJob?: Prisma.IntegrationJobOmit;
    jobExecution?: Prisma.JobExecutionOmit;
    computedMetricDefinition?: Prisma.ComputedMetricDefinitionOmit;
    telemetryRollup?: Prisma.TelemetryRollupOmit;
    modelDefinition?: Prisma.ModelDefinitionOmit;
    modelVersion?: Prisma.ModelVersionOmit;
    inferenceResult?: Prisma.InferenceResultOmit;
    decisionRule?: Prisma.DecisionRuleOmit;
    actionDefinition?: Prisma.ActionDefinitionOmit;
    executionPlan?: Prisma.ExecutionPlanOmit;
    decisionLog?: Prisma.DecisionLogOmit;
    apiKey?: Prisma.ApiKeyOmit;
};
export type LogLevel = 'info' | 'query' | 'warn' | 'error';
export type LogDefinition = {
    level: LogLevel;
    emit: 'stdout' | 'event';
};
export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;
export type GetLogType<T> = CheckIsLogLevel<T extends LogDefinition ? T['level'] : T>;
export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition> ? GetLogType<T[number]> : never;
export type QueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
};
export type LogEvent = {
    timestamp: Date;
    message: string;
    target: string;
};
export type PrismaAction = 'findUnique' | 'findUniqueOrThrow' | 'findMany' | 'findFirst' | 'findFirstOrThrow' | 'create' | 'createMany' | 'createManyAndReturn' | 'update' | 'updateMany' | 'updateManyAndReturn' | 'upsert' | 'delete' | 'deleteMany' | 'executeRaw' | 'queryRaw' | 'aggregate' | 'count' | 'runCommandRaw' | 'findRaw' | 'groupBy';
/**
 * `PrismaClient` proxy available in interactive transactions.
 */
export type TransactionClient = Omit<DefaultPrismaClient, runtime.ITXClientDenyList>;
//# sourceMappingURL=prismaNamespace.d.ts.map