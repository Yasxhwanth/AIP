import * as runtime from "@prisma/client/runtime/client";
import * as $Class from "./internal/class";
import * as Prisma from "./internal/prismaNamespace";
export * as $Enums from './enums';
export * from "./enums";
/**
 * ## Prisma Client
 *
 * Type-safe database client for TypeScript
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more EntityTypes
 * const entityTypes = await prisma.entityType.findMany()
 * ```
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export declare const PrismaClient: $Class.PrismaClientConstructor;
export type PrismaClient<LogOpts extends Prisma.LogLevel = never, OmitOpts extends Prisma.PrismaClientOptions["omit"] = Prisma.PrismaClientOptions["omit"], ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = $Class.PrismaClient<LogOpts, OmitOpts, ExtArgs>;
export { Prisma };
/**
 * Model EntityType
 *
 */
export type EntityType = Prisma.EntityTypeModel;
/**
 * Model AttributeDefinition
 *
 */
export type AttributeDefinition = Prisma.AttributeDefinitionModel;
/**
 * Model RelationshipDefinition
 *
 */
export type RelationshipDefinition = Prisma.RelationshipDefinitionModel;
/**
 * Model RelationshipInstance
 *
 */
export type RelationshipInstance = Prisma.RelationshipInstanceModel;
/**
 * Model EntityInstance
 *
 */
export type EntityInstance = Prisma.EntityInstanceModel;
/**
 * Model DomainEvent
 *
 */
export type DomainEvent = Prisma.DomainEventModel;
/**
 * Model PolicyDefinition
 *
 */
export type PolicyDefinition = Prisma.PolicyDefinitionModel;
/**
 * Model Alert
 *
 */
export type Alert = Prisma.AlertModel;
/**
 * Model CurrentEntityState
 *
 */
export type CurrentEntityState = Prisma.CurrentEntityStateModel;
/**
 * Model CurrentGraph
 *
 */
export type CurrentGraph = Prisma.CurrentGraphModel;
/**
 * Model TimeseriesMetric
 *
 */
export type TimeseriesMetric = Prisma.TimeseriesMetricModel;
/**
 * Model MetricDefinition
 *
 */
export type MetricDefinition = Prisma.MetricDefinitionModel;
//# sourceMappingURL=client.d.ts.map