import * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "./prismaNamespace";
export type LogOptions<ClientOptions extends Prisma.PrismaClientOptions> = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never;
export interface PrismaClientConstructor {
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
    new <Options extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions, LogOpts extends LogOptions<Options> = LogOptions<Options>, OmitOpts extends Prisma.PrismaClientOptions['omit'] = Options extends {
        omit: infer U;
    } ? U : Prisma.PrismaClientOptions['omit'], ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs>(options: Prisma.Subset<Options, Prisma.PrismaClientOptions>): PrismaClient<LogOpts, OmitOpts, ExtArgs>;
}
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
export interface PrismaClient<in LogOpts extends Prisma.LogLevel = never, in out OmitOpts extends Prisma.PrismaClientOptions['omit'] = undefined, in out ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['other'];
    };
    $on<V extends LogOpts>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;
    /**
     * Connect with the database
     */
    $connect(): runtime.Types.Utils.JsPromise<void>;
    /**
     * Disconnect from the database
     */
    $disconnect(): runtime.Types.Utils.JsPromise<void>;
    /**
       * Executes a prepared raw query and returns the number of affected rows.
       * @example
       * ```
       * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
       * ```
       *
       * Read more in our [docs](https://pris.ly/d/raw-queries).
       */
    $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;
    /**
     * Executes a raw query and returns the number of affected rows.
     * Susceptible to SQL injections, see documentation.
     * @example
     * ```
     * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
     * ```
     *
     * Read more in our [docs](https://pris.ly/d/raw-queries).
     */
    $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;
    /**
     * Performs a prepared raw query and returns the `SELECT` data.
     * @example
     * ```
     * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
     * ```
     *
     * Read more in our [docs](https://pris.ly/d/raw-queries).
     */
    $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;
    /**
     * Performs a raw query and returns the `SELECT` data.
     * Susceptible to SQL injections, see documentation.
     * @example
     * ```
     * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
     * ```
     *
     * Read more in our [docs](https://pris.ly/d/raw-queries).
     */
    $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;
    /**
     * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
     * @example
     * ```
     * const [george, bob, alice] = await prisma.$transaction([
     *   prisma.user.create({ data: { name: 'George' } }),
     *   prisma.user.create({ data: { name: 'Bob' } }),
     *   prisma.user.create({ data: { name: 'Alice' } }),
     * ])
     * ```
     *
     * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
     */
    $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: {
        isolationLevel?: Prisma.TransactionIsolationLevel;
    }): runtime.Types.Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>;
    $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => runtime.Types.Utils.JsPromise<R>, options?: {
        maxWait?: number;
        timeout?: number;
        isolationLevel?: Prisma.TransactionIsolationLevel;
    }): runtime.Types.Utils.JsPromise<R>;
    $extends: runtime.Types.Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<OmitOpts>, ExtArgs, runtime.Types.Utils.Call<Prisma.TypeMapCb<OmitOpts>, {
        extArgs: ExtArgs;
    }>>;
    /**
 * `prisma.entityType`: Exposes CRUD operations for the **EntityType** model.
  * Example usage:
  * ```ts
  * // Fetch zero or more EntityTypes
  * const entityTypes = await prisma.entityType.findMany()
  * ```
  */
    get entityType(): Prisma.EntityTypeDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.attributeDefinition`: Exposes CRUD operations for the **AttributeDefinition** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more AttributeDefinitions
      * const attributeDefinitions = await prisma.attributeDefinition.findMany()
      * ```
      */
    get attributeDefinition(): Prisma.AttributeDefinitionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.relationshipDefinition`: Exposes CRUD operations for the **RelationshipDefinition** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more RelationshipDefinitions
      * const relationshipDefinitions = await prisma.relationshipDefinition.findMany()
      * ```
      */
    get relationshipDefinition(): Prisma.RelationshipDefinitionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.relationshipInstance`: Exposes CRUD operations for the **RelationshipInstance** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more RelationshipInstances
      * const relationshipInstances = await prisma.relationshipInstance.findMany()
      * ```
      */
    get relationshipInstance(): Prisma.RelationshipInstanceDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.entityInstance`: Exposes CRUD operations for the **EntityInstance** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more EntityInstances
      * const entityInstances = await prisma.entityInstance.findMany()
      * ```
      */
    get entityInstance(): Prisma.EntityInstanceDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.domainEvent`: Exposes CRUD operations for the **DomainEvent** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more DomainEvents
      * const domainEvents = await prisma.domainEvent.findMany()
      * ```
      */
    get domainEvent(): Prisma.DomainEventDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.policyDefinition`: Exposes CRUD operations for the **PolicyDefinition** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more PolicyDefinitions
      * const policyDefinitions = await prisma.policyDefinition.findMany()
      * ```
      */
    get policyDefinition(): Prisma.PolicyDefinitionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.alert`: Exposes CRUD operations for the **Alert** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Alerts
      * const alerts = await prisma.alert.findMany()
      * ```
      */
    get alert(): Prisma.AlertDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.currentEntityState`: Exposes CRUD operations for the **CurrentEntityState** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more CurrentEntityStates
      * const currentEntityStates = await prisma.currentEntityState.findMany()
      * ```
      */
    get currentEntityState(): Prisma.CurrentEntityStateDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.currentGraph`: Exposes CRUD operations for the **CurrentGraph** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more CurrentGraphs
      * const currentGraphs = await prisma.currentGraph.findMany()
      * ```
      */
    get currentGraph(): Prisma.CurrentGraphDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.timeseriesMetric`: Exposes CRUD operations for the **TimeseriesMetric** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more TimeseriesMetrics
      * const timeseriesMetrics = await prisma.timeseriesMetric.findMany()
      * ```
      */
    get timeseriesMetric(): Prisma.TimeseriesMetricDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.metricDefinition`: Exposes CRUD operations for the **MetricDefinition** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more MetricDefinitions
      * const metricDefinitions = await prisma.metricDefinition.findMany()
      * ```
      */
    get metricDefinition(): Prisma.MetricDefinitionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
}
export declare function getPrismaClientClass(): PrismaClientConstructor;
//# sourceMappingURL=class.d.ts.map