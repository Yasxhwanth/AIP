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
    readonly MetricDefinition: "MetricDefinition";
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
        modelProps: "entityType" | "attributeDefinition" | "relationshipDefinition" | "relationshipInstance" | "entityInstance" | "domainEvent" | "policyDefinition" | "alert" | "currentEntityState" | "currentGraph" | "timeseriesMetric" | "metricDefinition";
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
        MetricDefinition: {
            payload: Prisma.$MetricDefinitionPayload<ExtArgs>;
            fields: Prisma.MetricDefinitionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.MetricDefinitionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MetricDefinitionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.MetricDefinitionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MetricDefinitionPayload>;
                };
                findFirst: {
                    args: Prisma.MetricDefinitionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MetricDefinitionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.MetricDefinitionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MetricDefinitionPayload>;
                };
                findMany: {
                    args: Prisma.MetricDefinitionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MetricDefinitionPayload>[];
                };
                create: {
                    args: Prisma.MetricDefinitionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MetricDefinitionPayload>;
                };
                createMany: {
                    args: Prisma.MetricDefinitionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.MetricDefinitionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MetricDefinitionPayload>[];
                };
                delete: {
                    args: Prisma.MetricDefinitionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MetricDefinitionPayload>;
                };
                update: {
                    args: Prisma.MetricDefinitionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MetricDefinitionPayload>;
                };
                deleteMany: {
                    args: Prisma.MetricDefinitionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.MetricDefinitionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.MetricDefinitionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MetricDefinitionPayload>[];
                };
                upsert: {
                    args: Prisma.MetricDefinitionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MetricDefinitionPayload>;
                };
                aggregate: {
                    args: Prisma.MetricDefinitionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateMetricDefinition>;
                };
                groupBy: {
                    args: Prisma.MetricDefinitionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MetricDefinitionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.MetricDefinitionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MetricDefinitionCountAggregateOutputType> | number;
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
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
export declare const JsonNullValueFilter: {
    readonly DbNull: runtime.DbNullClass;
    readonly JsonNull: runtime.JsonNullClass;
    readonly AnyNull: runtime.AnyNullClass;
};
export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter];
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
 * Reference to a field of type 'Float'
 */
export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>;
/**
 * Reference to a field of type 'Float[]'
 */
export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>;
/**
 * Reference to a field of type 'Json'
 */
export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>;
/**
 * Reference to a field of type 'QueryMode'
 */
export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>;
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
    metricDefinition?: Prisma.MetricDefinitionOmit;
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