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
   * // Fetch zero or more Projects
   * const projects = await prisma.project.findMany()
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
 * // Fetch zero or more Projects
 * const projects = await prisma.project.findMany()
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
 * `prisma.project`: Exposes CRUD operations for the **Project** model.
  * Example usage:
  * ```ts
  * // Fetch zero or more Projects
  * const projects = await prisma.project.findMany()
  * ```
  */
    get project(): Prisma.ProjectDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
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
     * `prisma.entityAlias`: Exposes CRUD operations for the **EntityAlias** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more EntityAliases
      * const entityAliases = await prisma.entityAlias.findMany()
      * ```
      */
    get entityAlias(): Prisma.EntityAliasDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.provenanceRecord`: Exposes CRUD operations for the **ProvenanceRecord** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more ProvenanceRecords
      * const provenanceRecords = await prisma.provenanceRecord.findMany()
      * ```
      */
    get provenanceRecord(): Prisma.ProvenanceRecordDelegate<ExtArgs, {
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
     * `prisma.dataSource`: Exposes CRUD operations for the **DataSource** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more DataSources
      * const dataSources = await prisma.dataSource.findMany()
      * ```
      */
    get dataSource(): Prisma.DataSourceDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.pipeline`: Exposes CRUD operations for the **Pipeline** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Pipelines
      * const pipelines = await prisma.pipeline.findMany()
      * ```
      */
    get pipeline(): Prisma.PipelineDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.integrationJob`: Exposes CRUD operations for the **IntegrationJob** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more IntegrationJobs
      * const integrationJobs = await prisma.integrationJob.findMany()
      * ```
      */
    get integrationJob(): Prisma.IntegrationJobDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.jobExecution`: Exposes CRUD operations for the **JobExecution** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more JobExecutions
      * const jobExecutions = await prisma.jobExecution.findMany()
      * ```
      */
    get jobExecution(): Prisma.JobExecutionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.computedMetricDefinition`: Exposes CRUD operations for the **ComputedMetricDefinition** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more ComputedMetricDefinitions
      * const computedMetricDefinitions = await prisma.computedMetricDefinition.findMany()
      * ```
      */
    get computedMetricDefinition(): Prisma.ComputedMetricDefinitionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.telemetryRollup`: Exposes CRUD operations for the **TelemetryRollup** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more TelemetryRollups
      * const telemetryRollups = await prisma.telemetryRollup.findMany()
      * ```
      */
    get telemetryRollup(): Prisma.TelemetryRollupDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.modelDefinition`: Exposes CRUD operations for the **ModelDefinition** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more ModelDefinitions
      * const modelDefinitions = await prisma.modelDefinition.findMany()
      * ```
      */
    get modelDefinition(): Prisma.ModelDefinitionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.modelVersion`: Exposes CRUD operations for the **ModelVersion** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more ModelVersions
      * const modelVersions = await prisma.modelVersion.findMany()
      * ```
      */
    get modelVersion(): Prisma.ModelVersionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.inferenceResult`: Exposes CRUD operations for the **InferenceResult** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more InferenceResults
      * const inferenceResults = await prisma.inferenceResult.findMany()
      * ```
      */
    get inferenceResult(): Prisma.InferenceResultDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.decisionRule`: Exposes CRUD operations for the **DecisionRule** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more DecisionRules
      * const decisionRules = await prisma.decisionRule.findMany()
      * ```
      */
    get decisionRule(): Prisma.DecisionRuleDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.actionDefinition`: Exposes CRUD operations for the **ActionDefinition** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more ActionDefinitions
      * const actionDefinitions = await prisma.actionDefinition.findMany()
      * ```
      */
    get actionDefinition(): Prisma.ActionDefinitionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.executionPlan`: Exposes CRUD operations for the **ExecutionPlan** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more ExecutionPlans
      * const executionPlans = await prisma.executionPlan.findMany()
      * ```
      */
    get executionPlan(): Prisma.ExecutionPlanDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.decisionLog`: Exposes CRUD operations for the **DecisionLog** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more DecisionLogs
      * const decisionLogs = await prisma.decisionLog.findMany()
      * ```
      */
    get decisionLog(): Prisma.DecisionLogDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.apiKey`: Exposes CRUD operations for the **ApiKey** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more ApiKeys
      * const apiKeys = await prisma.apiKey.findMany()
      * ```
      */
    get apiKey(): Prisma.ApiKeyDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.dashboard`: Exposes CRUD operations for the **Dashboard** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Dashboards
      * const dashboards = await prisma.dashboard.findMany()
      * ```
      */
    get dashboard(): Prisma.DashboardDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.dashboardWidget`: Exposes CRUD operations for the **DashboardWidget** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more DashboardWidgets
      * const dashboardWidgets = await prisma.dashboardWidget.findMany()
      * ```
      */
    get dashboardWidget(): Prisma.DashboardWidgetDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
}
export declare function getPrismaClientClass(): PrismaClientConstructor;
//# sourceMappingURL=class.d.ts.map