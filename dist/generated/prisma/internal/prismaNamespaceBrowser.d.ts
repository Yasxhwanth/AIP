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
    readonly EntityInstance: "EntityInstance";
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
export declare const EntityInstanceScalarFieldEnum: {
    readonly id: "id";
    readonly entityTypeId: "entityTypeId";
    readonly entityVersion: "entityVersion";
    readonly data: "data";
    readonly validFrom: "validFrom";
    readonly validTo: "validTo";
    readonly transactionTime: "transactionTime";
};
export type EntityInstanceScalarFieldEnum = (typeof EntityInstanceScalarFieldEnum)[keyof typeof EntityInstanceScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const JsonNullValueInput: {
    readonly JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
};
export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const JsonNullValueFilter: {
    readonly DbNull: import("@prisma/client-runtime-utils").DbNullClass;
    readonly JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
    readonly AnyNull: import("@prisma/client-runtime-utils").AnyNullClass;
};
export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
//# sourceMappingURL=prismaNamespaceBrowser.d.ts.map