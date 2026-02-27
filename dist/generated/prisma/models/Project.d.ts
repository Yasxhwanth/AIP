import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
/**
 * Model Project
 *
 */
export type ProjectModel = runtime.Types.Result.DefaultSelection<Prisma.$ProjectPayload>;
export type AggregateProject = {
    _count: ProjectCountAggregateOutputType | null;
    _min: ProjectMinAggregateOutputType | null;
    _max: ProjectMaxAggregateOutputType | null;
};
export type ProjectMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    description: string | null;
    createdAt: Date | null;
};
export type ProjectMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    description: string | null;
    createdAt: Date | null;
};
export type ProjectCountAggregateOutputType = {
    id: number;
    name: number;
    description: number;
    createdAt: number;
    _all: number;
};
export type ProjectMinAggregateInputType = {
    id?: true;
    name?: true;
    description?: true;
    createdAt?: true;
};
export type ProjectMaxAggregateInputType = {
    id?: true;
    name?: true;
    description?: true;
    createdAt?: true;
};
export type ProjectCountAggregateInputType = {
    id?: true;
    name?: true;
    description?: true;
    createdAt?: true;
    _all?: true;
};
export type ProjectAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which Project to aggregate.
     */
    where?: Prisma.ProjectWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Projects to fetch.
     */
    orderBy?: Prisma.ProjectOrderByWithRelationInput | Prisma.ProjectOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.ProjectWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Projects from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Projects.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Projects
    **/
    _count?: true | ProjectCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: ProjectMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: ProjectMaxAggregateInputType;
};
export type GetProjectAggregateType<T extends ProjectAggregateArgs> = {
    [P in keyof T & keyof AggregateProject]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateProject[P]> : Prisma.GetScalarType<T[P], AggregateProject[P]>;
};
export type ProjectGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ProjectWhereInput;
    orderBy?: Prisma.ProjectOrderByWithAggregationInput | Prisma.ProjectOrderByWithAggregationInput[];
    by: Prisma.ProjectScalarFieldEnum[] | Prisma.ProjectScalarFieldEnum;
    having?: Prisma.ProjectScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ProjectCountAggregateInputType | true;
    _min?: ProjectMinAggregateInputType;
    _max?: ProjectMaxAggregateInputType;
};
export type ProjectGroupByOutputType = {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    _count: ProjectCountAggregateOutputType | null;
    _min: ProjectMinAggregateOutputType | null;
    _max: ProjectMaxAggregateOutputType | null;
};
type GetProjectGroupByPayload<T extends ProjectGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ProjectGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ProjectGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ProjectGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ProjectGroupByOutputType[P]>;
}>>;
export type ProjectWhereInput = {
    AND?: Prisma.ProjectWhereInput | Prisma.ProjectWhereInput[];
    OR?: Prisma.ProjectWhereInput[];
    NOT?: Prisma.ProjectWhereInput | Prisma.ProjectWhereInput[];
    id?: Prisma.StringFilter<"Project"> | string;
    name?: Prisma.StringFilter<"Project"> | string;
    description?: Prisma.StringNullableFilter<"Project"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"Project"> | Date | string;
    entityTypes?: Prisma.EntityTypeListRelationFilter;
    dataSources?: Prisma.DataSourceListRelationFilter;
    integrationJobs?: Prisma.IntegrationJobListRelationFilter;
    decisionRules?: Prisma.DecisionRuleListRelationFilter;
    modelDefinitions?: Prisma.ModelDefinitionListRelationFilter;
    dashboards?: Prisma.DashboardListRelationFilter;
    pipelines?: Prisma.PipelineListRelationFilter;
};
export type ProjectOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    entityTypes?: Prisma.EntityTypeOrderByRelationAggregateInput;
    dataSources?: Prisma.DataSourceOrderByRelationAggregateInput;
    integrationJobs?: Prisma.IntegrationJobOrderByRelationAggregateInput;
    decisionRules?: Prisma.DecisionRuleOrderByRelationAggregateInput;
    modelDefinitions?: Prisma.ModelDefinitionOrderByRelationAggregateInput;
    dashboards?: Prisma.DashboardOrderByRelationAggregateInput;
    pipelines?: Prisma.PipelineOrderByRelationAggregateInput;
};
export type ProjectWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.ProjectWhereInput | Prisma.ProjectWhereInput[];
    OR?: Prisma.ProjectWhereInput[];
    NOT?: Prisma.ProjectWhereInput | Prisma.ProjectWhereInput[];
    name?: Prisma.StringFilter<"Project"> | string;
    description?: Prisma.StringNullableFilter<"Project"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"Project"> | Date | string;
    entityTypes?: Prisma.EntityTypeListRelationFilter;
    dataSources?: Prisma.DataSourceListRelationFilter;
    integrationJobs?: Prisma.IntegrationJobListRelationFilter;
    decisionRules?: Prisma.DecisionRuleListRelationFilter;
    modelDefinitions?: Prisma.ModelDefinitionListRelationFilter;
    dashboards?: Prisma.DashboardListRelationFilter;
    pipelines?: Prisma.PipelineListRelationFilter;
}, "id">;
export type ProjectOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.ProjectCountOrderByAggregateInput;
    _max?: Prisma.ProjectMaxOrderByAggregateInput;
    _min?: Prisma.ProjectMinOrderByAggregateInput;
};
export type ProjectScalarWhereWithAggregatesInput = {
    AND?: Prisma.ProjectScalarWhereWithAggregatesInput | Prisma.ProjectScalarWhereWithAggregatesInput[];
    OR?: Prisma.ProjectScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ProjectScalarWhereWithAggregatesInput | Prisma.ProjectScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Project"> | string;
    name?: Prisma.StringWithAggregatesFilter<"Project"> | string;
    description?: Prisma.StringNullableWithAggregatesFilter<"Project"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Project"> | Date | string;
};
export type ProjectCreateInput = {
    id?: string;
    name: string;
    description?: string | null;
    createdAt?: Date | string;
    entityTypes?: Prisma.EntityTypeCreateNestedManyWithoutProjectInput;
    dataSources?: Prisma.DataSourceCreateNestedManyWithoutProjectInput;
    integrationJobs?: Prisma.IntegrationJobCreateNestedManyWithoutProjectInput;
    decisionRules?: Prisma.DecisionRuleCreateNestedManyWithoutProjectInput;
    modelDefinitions?: Prisma.ModelDefinitionCreateNestedManyWithoutProjectInput;
    dashboards?: Prisma.DashboardCreateNestedManyWithoutProjectInput;
    pipelines?: Prisma.PipelineCreateNestedManyWithoutProjectInput;
};
export type ProjectUncheckedCreateInput = {
    id?: string;
    name: string;
    description?: string | null;
    createdAt?: Date | string;
    entityTypes?: Prisma.EntityTypeUncheckedCreateNestedManyWithoutProjectInput;
    dataSources?: Prisma.DataSourceUncheckedCreateNestedManyWithoutProjectInput;
    integrationJobs?: Prisma.IntegrationJobUncheckedCreateNestedManyWithoutProjectInput;
    decisionRules?: Prisma.DecisionRuleUncheckedCreateNestedManyWithoutProjectInput;
    modelDefinitions?: Prisma.ModelDefinitionUncheckedCreateNestedManyWithoutProjectInput;
    dashboards?: Prisma.DashboardUncheckedCreateNestedManyWithoutProjectInput;
    pipelines?: Prisma.PipelineUncheckedCreateNestedManyWithoutProjectInput;
};
export type ProjectUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    entityTypes?: Prisma.EntityTypeUpdateManyWithoutProjectNestedInput;
    dataSources?: Prisma.DataSourceUpdateManyWithoutProjectNestedInput;
    integrationJobs?: Prisma.IntegrationJobUpdateManyWithoutProjectNestedInput;
    decisionRules?: Prisma.DecisionRuleUpdateManyWithoutProjectNestedInput;
    modelDefinitions?: Prisma.ModelDefinitionUpdateManyWithoutProjectNestedInput;
    dashboards?: Prisma.DashboardUpdateManyWithoutProjectNestedInput;
    pipelines?: Prisma.PipelineUpdateManyWithoutProjectNestedInput;
};
export type ProjectUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    entityTypes?: Prisma.EntityTypeUncheckedUpdateManyWithoutProjectNestedInput;
    dataSources?: Prisma.DataSourceUncheckedUpdateManyWithoutProjectNestedInput;
    integrationJobs?: Prisma.IntegrationJobUncheckedUpdateManyWithoutProjectNestedInput;
    decisionRules?: Prisma.DecisionRuleUncheckedUpdateManyWithoutProjectNestedInput;
    modelDefinitions?: Prisma.ModelDefinitionUncheckedUpdateManyWithoutProjectNestedInput;
    dashboards?: Prisma.DashboardUncheckedUpdateManyWithoutProjectNestedInput;
    pipelines?: Prisma.PipelineUncheckedUpdateManyWithoutProjectNestedInput;
};
export type ProjectCreateManyInput = {
    id?: string;
    name: string;
    description?: string | null;
    createdAt?: Date | string;
};
export type ProjectUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ProjectUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ProjectCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type ProjectMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type ProjectMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type ProjectScalarRelationFilter = {
    is?: Prisma.ProjectWhereInput;
    isNot?: Prisma.ProjectWhereInput;
};
export type StringFieldUpdateOperationsInput = {
    set?: string;
};
export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null;
};
export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
};
export type ProjectCreateNestedOneWithoutEntityTypesInput = {
    create?: Prisma.XOR<Prisma.ProjectCreateWithoutEntityTypesInput, Prisma.ProjectUncheckedCreateWithoutEntityTypesInput>;
    connectOrCreate?: Prisma.ProjectCreateOrConnectWithoutEntityTypesInput;
    connect?: Prisma.ProjectWhereUniqueInput;
};
export type ProjectUpdateOneRequiredWithoutEntityTypesNestedInput = {
    create?: Prisma.XOR<Prisma.ProjectCreateWithoutEntityTypesInput, Prisma.ProjectUncheckedCreateWithoutEntityTypesInput>;
    connectOrCreate?: Prisma.ProjectCreateOrConnectWithoutEntityTypesInput;
    upsert?: Prisma.ProjectUpsertWithoutEntityTypesInput;
    connect?: Prisma.ProjectWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ProjectUpdateToOneWithWhereWithoutEntityTypesInput, Prisma.ProjectUpdateWithoutEntityTypesInput>, Prisma.ProjectUncheckedUpdateWithoutEntityTypesInput>;
};
export type ProjectCreateNestedOneWithoutDataSourcesInput = {
    create?: Prisma.XOR<Prisma.ProjectCreateWithoutDataSourcesInput, Prisma.ProjectUncheckedCreateWithoutDataSourcesInput>;
    connectOrCreate?: Prisma.ProjectCreateOrConnectWithoutDataSourcesInput;
    connect?: Prisma.ProjectWhereUniqueInput;
};
export type ProjectUpdateOneRequiredWithoutDataSourcesNestedInput = {
    create?: Prisma.XOR<Prisma.ProjectCreateWithoutDataSourcesInput, Prisma.ProjectUncheckedCreateWithoutDataSourcesInput>;
    connectOrCreate?: Prisma.ProjectCreateOrConnectWithoutDataSourcesInput;
    upsert?: Prisma.ProjectUpsertWithoutDataSourcesInput;
    connect?: Prisma.ProjectWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ProjectUpdateToOneWithWhereWithoutDataSourcesInput, Prisma.ProjectUpdateWithoutDataSourcesInput>, Prisma.ProjectUncheckedUpdateWithoutDataSourcesInput>;
};
export type ProjectCreateNestedOneWithoutPipelinesInput = {
    create?: Prisma.XOR<Prisma.ProjectCreateWithoutPipelinesInput, Prisma.ProjectUncheckedCreateWithoutPipelinesInput>;
    connectOrCreate?: Prisma.ProjectCreateOrConnectWithoutPipelinesInput;
    connect?: Prisma.ProjectWhereUniqueInput;
};
export type ProjectUpdateOneRequiredWithoutPipelinesNestedInput = {
    create?: Prisma.XOR<Prisma.ProjectCreateWithoutPipelinesInput, Prisma.ProjectUncheckedCreateWithoutPipelinesInput>;
    connectOrCreate?: Prisma.ProjectCreateOrConnectWithoutPipelinesInput;
    upsert?: Prisma.ProjectUpsertWithoutPipelinesInput;
    connect?: Prisma.ProjectWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ProjectUpdateToOneWithWhereWithoutPipelinesInput, Prisma.ProjectUpdateWithoutPipelinesInput>, Prisma.ProjectUncheckedUpdateWithoutPipelinesInput>;
};
export type ProjectCreateNestedOneWithoutIntegrationJobsInput = {
    create?: Prisma.XOR<Prisma.ProjectCreateWithoutIntegrationJobsInput, Prisma.ProjectUncheckedCreateWithoutIntegrationJobsInput>;
    connectOrCreate?: Prisma.ProjectCreateOrConnectWithoutIntegrationJobsInput;
    connect?: Prisma.ProjectWhereUniqueInput;
};
export type ProjectUpdateOneRequiredWithoutIntegrationJobsNestedInput = {
    create?: Prisma.XOR<Prisma.ProjectCreateWithoutIntegrationJobsInput, Prisma.ProjectUncheckedCreateWithoutIntegrationJobsInput>;
    connectOrCreate?: Prisma.ProjectCreateOrConnectWithoutIntegrationJobsInput;
    upsert?: Prisma.ProjectUpsertWithoutIntegrationJobsInput;
    connect?: Prisma.ProjectWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ProjectUpdateToOneWithWhereWithoutIntegrationJobsInput, Prisma.ProjectUpdateWithoutIntegrationJobsInput>, Prisma.ProjectUncheckedUpdateWithoutIntegrationJobsInput>;
};
export type ProjectCreateNestedOneWithoutModelDefinitionsInput = {
    create?: Prisma.XOR<Prisma.ProjectCreateWithoutModelDefinitionsInput, Prisma.ProjectUncheckedCreateWithoutModelDefinitionsInput>;
    connectOrCreate?: Prisma.ProjectCreateOrConnectWithoutModelDefinitionsInput;
    connect?: Prisma.ProjectWhereUniqueInput;
};
export type ProjectUpdateOneRequiredWithoutModelDefinitionsNestedInput = {
    create?: Prisma.XOR<Prisma.ProjectCreateWithoutModelDefinitionsInput, Prisma.ProjectUncheckedCreateWithoutModelDefinitionsInput>;
    connectOrCreate?: Prisma.ProjectCreateOrConnectWithoutModelDefinitionsInput;
    upsert?: Prisma.ProjectUpsertWithoutModelDefinitionsInput;
    connect?: Prisma.ProjectWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ProjectUpdateToOneWithWhereWithoutModelDefinitionsInput, Prisma.ProjectUpdateWithoutModelDefinitionsInput>, Prisma.ProjectUncheckedUpdateWithoutModelDefinitionsInput>;
};
export type ProjectCreateNestedOneWithoutDecisionRulesInput = {
    create?: Prisma.XOR<Prisma.ProjectCreateWithoutDecisionRulesInput, Prisma.ProjectUncheckedCreateWithoutDecisionRulesInput>;
    connectOrCreate?: Prisma.ProjectCreateOrConnectWithoutDecisionRulesInput;
    connect?: Prisma.ProjectWhereUniqueInput;
};
export type ProjectUpdateOneRequiredWithoutDecisionRulesNestedInput = {
    create?: Prisma.XOR<Prisma.ProjectCreateWithoutDecisionRulesInput, Prisma.ProjectUncheckedCreateWithoutDecisionRulesInput>;
    connectOrCreate?: Prisma.ProjectCreateOrConnectWithoutDecisionRulesInput;
    upsert?: Prisma.ProjectUpsertWithoutDecisionRulesInput;
    connect?: Prisma.ProjectWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ProjectUpdateToOneWithWhereWithoutDecisionRulesInput, Prisma.ProjectUpdateWithoutDecisionRulesInput>, Prisma.ProjectUncheckedUpdateWithoutDecisionRulesInput>;
};
export type ProjectCreateNestedOneWithoutDashboardsInput = {
    create?: Prisma.XOR<Prisma.ProjectCreateWithoutDashboardsInput, Prisma.ProjectUncheckedCreateWithoutDashboardsInput>;
    connectOrCreate?: Prisma.ProjectCreateOrConnectWithoutDashboardsInput;
    connect?: Prisma.ProjectWhereUniqueInput;
};
export type ProjectUpdateOneRequiredWithoutDashboardsNestedInput = {
    create?: Prisma.XOR<Prisma.ProjectCreateWithoutDashboardsInput, Prisma.ProjectUncheckedCreateWithoutDashboardsInput>;
    connectOrCreate?: Prisma.ProjectCreateOrConnectWithoutDashboardsInput;
    upsert?: Prisma.ProjectUpsertWithoutDashboardsInput;
    connect?: Prisma.ProjectWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ProjectUpdateToOneWithWhereWithoutDashboardsInput, Prisma.ProjectUpdateWithoutDashboardsInput>, Prisma.ProjectUncheckedUpdateWithoutDashboardsInput>;
};
export type ProjectCreateWithoutEntityTypesInput = {
    id?: string;
    name: string;
    description?: string | null;
    createdAt?: Date | string;
    dataSources?: Prisma.DataSourceCreateNestedManyWithoutProjectInput;
    integrationJobs?: Prisma.IntegrationJobCreateNestedManyWithoutProjectInput;
    decisionRules?: Prisma.DecisionRuleCreateNestedManyWithoutProjectInput;
    modelDefinitions?: Prisma.ModelDefinitionCreateNestedManyWithoutProjectInput;
    dashboards?: Prisma.DashboardCreateNestedManyWithoutProjectInput;
    pipelines?: Prisma.PipelineCreateNestedManyWithoutProjectInput;
};
export type ProjectUncheckedCreateWithoutEntityTypesInput = {
    id?: string;
    name: string;
    description?: string | null;
    createdAt?: Date | string;
    dataSources?: Prisma.DataSourceUncheckedCreateNestedManyWithoutProjectInput;
    integrationJobs?: Prisma.IntegrationJobUncheckedCreateNestedManyWithoutProjectInput;
    decisionRules?: Prisma.DecisionRuleUncheckedCreateNestedManyWithoutProjectInput;
    modelDefinitions?: Prisma.ModelDefinitionUncheckedCreateNestedManyWithoutProjectInput;
    dashboards?: Prisma.DashboardUncheckedCreateNestedManyWithoutProjectInput;
    pipelines?: Prisma.PipelineUncheckedCreateNestedManyWithoutProjectInput;
};
export type ProjectCreateOrConnectWithoutEntityTypesInput = {
    where: Prisma.ProjectWhereUniqueInput;
    create: Prisma.XOR<Prisma.ProjectCreateWithoutEntityTypesInput, Prisma.ProjectUncheckedCreateWithoutEntityTypesInput>;
};
export type ProjectUpsertWithoutEntityTypesInput = {
    update: Prisma.XOR<Prisma.ProjectUpdateWithoutEntityTypesInput, Prisma.ProjectUncheckedUpdateWithoutEntityTypesInput>;
    create: Prisma.XOR<Prisma.ProjectCreateWithoutEntityTypesInput, Prisma.ProjectUncheckedCreateWithoutEntityTypesInput>;
    where?: Prisma.ProjectWhereInput;
};
export type ProjectUpdateToOneWithWhereWithoutEntityTypesInput = {
    where?: Prisma.ProjectWhereInput;
    data: Prisma.XOR<Prisma.ProjectUpdateWithoutEntityTypesInput, Prisma.ProjectUncheckedUpdateWithoutEntityTypesInput>;
};
export type ProjectUpdateWithoutEntityTypesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    dataSources?: Prisma.DataSourceUpdateManyWithoutProjectNestedInput;
    integrationJobs?: Prisma.IntegrationJobUpdateManyWithoutProjectNestedInput;
    decisionRules?: Prisma.DecisionRuleUpdateManyWithoutProjectNestedInput;
    modelDefinitions?: Prisma.ModelDefinitionUpdateManyWithoutProjectNestedInput;
    dashboards?: Prisma.DashboardUpdateManyWithoutProjectNestedInput;
    pipelines?: Prisma.PipelineUpdateManyWithoutProjectNestedInput;
};
export type ProjectUncheckedUpdateWithoutEntityTypesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    dataSources?: Prisma.DataSourceUncheckedUpdateManyWithoutProjectNestedInput;
    integrationJobs?: Prisma.IntegrationJobUncheckedUpdateManyWithoutProjectNestedInput;
    decisionRules?: Prisma.DecisionRuleUncheckedUpdateManyWithoutProjectNestedInput;
    modelDefinitions?: Prisma.ModelDefinitionUncheckedUpdateManyWithoutProjectNestedInput;
    dashboards?: Prisma.DashboardUncheckedUpdateManyWithoutProjectNestedInput;
    pipelines?: Prisma.PipelineUncheckedUpdateManyWithoutProjectNestedInput;
};
export type ProjectCreateWithoutDataSourcesInput = {
    id?: string;
    name: string;
    description?: string | null;
    createdAt?: Date | string;
    entityTypes?: Prisma.EntityTypeCreateNestedManyWithoutProjectInput;
    integrationJobs?: Prisma.IntegrationJobCreateNestedManyWithoutProjectInput;
    decisionRules?: Prisma.DecisionRuleCreateNestedManyWithoutProjectInput;
    modelDefinitions?: Prisma.ModelDefinitionCreateNestedManyWithoutProjectInput;
    dashboards?: Prisma.DashboardCreateNestedManyWithoutProjectInput;
    pipelines?: Prisma.PipelineCreateNestedManyWithoutProjectInput;
};
export type ProjectUncheckedCreateWithoutDataSourcesInput = {
    id?: string;
    name: string;
    description?: string | null;
    createdAt?: Date | string;
    entityTypes?: Prisma.EntityTypeUncheckedCreateNestedManyWithoutProjectInput;
    integrationJobs?: Prisma.IntegrationJobUncheckedCreateNestedManyWithoutProjectInput;
    decisionRules?: Prisma.DecisionRuleUncheckedCreateNestedManyWithoutProjectInput;
    modelDefinitions?: Prisma.ModelDefinitionUncheckedCreateNestedManyWithoutProjectInput;
    dashboards?: Prisma.DashboardUncheckedCreateNestedManyWithoutProjectInput;
    pipelines?: Prisma.PipelineUncheckedCreateNestedManyWithoutProjectInput;
};
export type ProjectCreateOrConnectWithoutDataSourcesInput = {
    where: Prisma.ProjectWhereUniqueInput;
    create: Prisma.XOR<Prisma.ProjectCreateWithoutDataSourcesInput, Prisma.ProjectUncheckedCreateWithoutDataSourcesInput>;
};
export type ProjectUpsertWithoutDataSourcesInput = {
    update: Prisma.XOR<Prisma.ProjectUpdateWithoutDataSourcesInput, Prisma.ProjectUncheckedUpdateWithoutDataSourcesInput>;
    create: Prisma.XOR<Prisma.ProjectCreateWithoutDataSourcesInput, Prisma.ProjectUncheckedCreateWithoutDataSourcesInput>;
    where?: Prisma.ProjectWhereInput;
};
export type ProjectUpdateToOneWithWhereWithoutDataSourcesInput = {
    where?: Prisma.ProjectWhereInput;
    data: Prisma.XOR<Prisma.ProjectUpdateWithoutDataSourcesInput, Prisma.ProjectUncheckedUpdateWithoutDataSourcesInput>;
};
export type ProjectUpdateWithoutDataSourcesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    entityTypes?: Prisma.EntityTypeUpdateManyWithoutProjectNestedInput;
    integrationJobs?: Prisma.IntegrationJobUpdateManyWithoutProjectNestedInput;
    decisionRules?: Prisma.DecisionRuleUpdateManyWithoutProjectNestedInput;
    modelDefinitions?: Prisma.ModelDefinitionUpdateManyWithoutProjectNestedInput;
    dashboards?: Prisma.DashboardUpdateManyWithoutProjectNestedInput;
    pipelines?: Prisma.PipelineUpdateManyWithoutProjectNestedInput;
};
export type ProjectUncheckedUpdateWithoutDataSourcesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    entityTypes?: Prisma.EntityTypeUncheckedUpdateManyWithoutProjectNestedInput;
    integrationJobs?: Prisma.IntegrationJobUncheckedUpdateManyWithoutProjectNestedInput;
    decisionRules?: Prisma.DecisionRuleUncheckedUpdateManyWithoutProjectNestedInput;
    modelDefinitions?: Prisma.ModelDefinitionUncheckedUpdateManyWithoutProjectNestedInput;
    dashboards?: Prisma.DashboardUncheckedUpdateManyWithoutProjectNestedInput;
    pipelines?: Prisma.PipelineUncheckedUpdateManyWithoutProjectNestedInput;
};
export type ProjectCreateWithoutPipelinesInput = {
    id?: string;
    name: string;
    description?: string | null;
    createdAt?: Date | string;
    entityTypes?: Prisma.EntityTypeCreateNestedManyWithoutProjectInput;
    dataSources?: Prisma.DataSourceCreateNestedManyWithoutProjectInput;
    integrationJobs?: Prisma.IntegrationJobCreateNestedManyWithoutProjectInput;
    decisionRules?: Prisma.DecisionRuleCreateNestedManyWithoutProjectInput;
    modelDefinitions?: Prisma.ModelDefinitionCreateNestedManyWithoutProjectInput;
    dashboards?: Prisma.DashboardCreateNestedManyWithoutProjectInput;
};
export type ProjectUncheckedCreateWithoutPipelinesInput = {
    id?: string;
    name: string;
    description?: string | null;
    createdAt?: Date | string;
    entityTypes?: Prisma.EntityTypeUncheckedCreateNestedManyWithoutProjectInput;
    dataSources?: Prisma.DataSourceUncheckedCreateNestedManyWithoutProjectInput;
    integrationJobs?: Prisma.IntegrationJobUncheckedCreateNestedManyWithoutProjectInput;
    decisionRules?: Prisma.DecisionRuleUncheckedCreateNestedManyWithoutProjectInput;
    modelDefinitions?: Prisma.ModelDefinitionUncheckedCreateNestedManyWithoutProjectInput;
    dashboards?: Prisma.DashboardUncheckedCreateNestedManyWithoutProjectInput;
};
export type ProjectCreateOrConnectWithoutPipelinesInput = {
    where: Prisma.ProjectWhereUniqueInput;
    create: Prisma.XOR<Prisma.ProjectCreateWithoutPipelinesInput, Prisma.ProjectUncheckedCreateWithoutPipelinesInput>;
};
export type ProjectUpsertWithoutPipelinesInput = {
    update: Prisma.XOR<Prisma.ProjectUpdateWithoutPipelinesInput, Prisma.ProjectUncheckedUpdateWithoutPipelinesInput>;
    create: Prisma.XOR<Prisma.ProjectCreateWithoutPipelinesInput, Prisma.ProjectUncheckedCreateWithoutPipelinesInput>;
    where?: Prisma.ProjectWhereInput;
};
export type ProjectUpdateToOneWithWhereWithoutPipelinesInput = {
    where?: Prisma.ProjectWhereInput;
    data: Prisma.XOR<Prisma.ProjectUpdateWithoutPipelinesInput, Prisma.ProjectUncheckedUpdateWithoutPipelinesInput>;
};
export type ProjectUpdateWithoutPipelinesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    entityTypes?: Prisma.EntityTypeUpdateManyWithoutProjectNestedInput;
    dataSources?: Prisma.DataSourceUpdateManyWithoutProjectNestedInput;
    integrationJobs?: Prisma.IntegrationJobUpdateManyWithoutProjectNestedInput;
    decisionRules?: Prisma.DecisionRuleUpdateManyWithoutProjectNestedInput;
    modelDefinitions?: Prisma.ModelDefinitionUpdateManyWithoutProjectNestedInput;
    dashboards?: Prisma.DashboardUpdateManyWithoutProjectNestedInput;
};
export type ProjectUncheckedUpdateWithoutPipelinesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    entityTypes?: Prisma.EntityTypeUncheckedUpdateManyWithoutProjectNestedInput;
    dataSources?: Prisma.DataSourceUncheckedUpdateManyWithoutProjectNestedInput;
    integrationJobs?: Prisma.IntegrationJobUncheckedUpdateManyWithoutProjectNestedInput;
    decisionRules?: Prisma.DecisionRuleUncheckedUpdateManyWithoutProjectNestedInput;
    modelDefinitions?: Prisma.ModelDefinitionUncheckedUpdateManyWithoutProjectNestedInput;
    dashboards?: Prisma.DashboardUncheckedUpdateManyWithoutProjectNestedInput;
};
export type ProjectCreateWithoutIntegrationJobsInput = {
    id?: string;
    name: string;
    description?: string | null;
    createdAt?: Date | string;
    entityTypes?: Prisma.EntityTypeCreateNestedManyWithoutProjectInput;
    dataSources?: Prisma.DataSourceCreateNestedManyWithoutProjectInput;
    decisionRules?: Prisma.DecisionRuleCreateNestedManyWithoutProjectInput;
    modelDefinitions?: Prisma.ModelDefinitionCreateNestedManyWithoutProjectInput;
    dashboards?: Prisma.DashboardCreateNestedManyWithoutProjectInput;
    pipelines?: Prisma.PipelineCreateNestedManyWithoutProjectInput;
};
export type ProjectUncheckedCreateWithoutIntegrationJobsInput = {
    id?: string;
    name: string;
    description?: string | null;
    createdAt?: Date | string;
    entityTypes?: Prisma.EntityTypeUncheckedCreateNestedManyWithoutProjectInput;
    dataSources?: Prisma.DataSourceUncheckedCreateNestedManyWithoutProjectInput;
    decisionRules?: Prisma.DecisionRuleUncheckedCreateNestedManyWithoutProjectInput;
    modelDefinitions?: Prisma.ModelDefinitionUncheckedCreateNestedManyWithoutProjectInput;
    dashboards?: Prisma.DashboardUncheckedCreateNestedManyWithoutProjectInput;
    pipelines?: Prisma.PipelineUncheckedCreateNestedManyWithoutProjectInput;
};
export type ProjectCreateOrConnectWithoutIntegrationJobsInput = {
    where: Prisma.ProjectWhereUniqueInput;
    create: Prisma.XOR<Prisma.ProjectCreateWithoutIntegrationJobsInput, Prisma.ProjectUncheckedCreateWithoutIntegrationJobsInput>;
};
export type ProjectUpsertWithoutIntegrationJobsInput = {
    update: Prisma.XOR<Prisma.ProjectUpdateWithoutIntegrationJobsInput, Prisma.ProjectUncheckedUpdateWithoutIntegrationJobsInput>;
    create: Prisma.XOR<Prisma.ProjectCreateWithoutIntegrationJobsInput, Prisma.ProjectUncheckedCreateWithoutIntegrationJobsInput>;
    where?: Prisma.ProjectWhereInput;
};
export type ProjectUpdateToOneWithWhereWithoutIntegrationJobsInput = {
    where?: Prisma.ProjectWhereInput;
    data: Prisma.XOR<Prisma.ProjectUpdateWithoutIntegrationJobsInput, Prisma.ProjectUncheckedUpdateWithoutIntegrationJobsInput>;
};
export type ProjectUpdateWithoutIntegrationJobsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    entityTypes?: Prisma.EntityTypeUpdateManyWithoutProjectNestedInput;
    dataSources?: Prisma.DataSourceUpdateManyWithoutProjectNestedInput;
    decisionRules?: Prisma.DecisionRuleUpdateManyWithoutProjectNestedInput;
    modelDefinitions?: Prisma.ModelDefinitionUpdateManyWithoutProjectNestedInput;
    dashboards?: Prisma.DashboardUpdateManyWithoutProjectNestedInput;
    pipelines?: Prisma.PipelineUpdateManyWithoutProjectNestedInput;
};
export type ProjectUncheckedUpdateWithoutIntegrationJobsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    entityTypes?: Prisma.EntityTypeUncheckedUpdateManyWithoutProjectNestedInput;
    dataSources?: Prisma.DataSourceUncheckedUpdateManyWithoutProjectNestedInput;
    decisionRules?: Prisma.DecisionRuleUncheckedUpdateManyWithoutProjectNestedInput;
    modelDefinitions?: Prisma.ModelDefinitionUncheckedUpdateManyWithoutProjectNestedInput;
    dashboards?: Prisma.DashboardUncheckedUpdateManyWithoutProjectNestedInput;
    pipelines?: Prisma.PipelineUncheckedUpdateManyWithoutProjectNestedInput;
};
export type ProjectCreateWithoutModelDefinitionsInput = {
    id?: string;
    name: string;
    description?: string | null;
    createdAt?: Date | string;
    entityTypes?: Prisma.EntityTypeCreateNestedManyWithoutProjectInput;
    dataSources?: Prisma.DataSourceCreateNestedManyWithoutProjectInput;
    integrationJobs?: Prisma.IntegrationJobCreateNestedManyWithoutProjectInput;
    decisionRules?: Prisma.DecisionRuleCreateNestedManyWithoutProjectInput;
    dashboards?: Prisma.DashboardCreateNestedManyWithoutProjectInput;
    pipelines?: Prisma.PipelineCreateNestedManyWithoutProjectInput;
};
export type ProjectUncheckedCreateWithoutModelDefinitionsInput = {
    id?: string;
    name: string;
    description?: string | null;
    createdAt?: Date | string;
    entityTypes?: Prisma.EntityTypeUncheckedCreateNestedManyWithoutProjectInput;
    dataSources?: Prisma.DataSourceUncheckedCreateNestedManyWithoutProjectInput;
    integrationJobs?: Prisma.IntegrationJobUncheckedCreateNestedManyWithoutProjectInput;
    decisionRules?: Prisma.DecisionRuleUncheckedCreateNestedManyWithoutProjectInput;
    dashboards?: Prisma.DashboardUncheckedCreateNestedManyWithoutProjectInput;
    pipelines?: Prisma.PipelineUncheckedCreateNestedManyWithoutProjectInput;
};
export type ProjectCreateOrConnectWithoutModelDefinitionsInput = {
    where: Prisma.ProjectWhereUniqueInput;
    create: Prisma.XOR<Prisma.ProjectCreateWithoutModelDefinitionsInput, Prisma.ProjectUncheckedCreateWithoutModelDefinitionsInput>;
};
export type ProjectUpsertWithoutModelDefinitionsInput = {
    update: Prisma.XOR<Prisma.ProjectUpdateWithoutModelDefinitionsInput, Prisma.ProjectUncheckedUpdateWithoutModelDefinitionsInput>;
    create: Prisma.XOR<Prisma.ProjectCreateWithoutModelDefinitionsInput, Prisma.ProjectUncheckedCreateWithoutModelDefinitionsInput>;
    where?: Prisma.ProjectWhereInput;
};
export type ProjectUpdateToOneWithWhereWithoutModelDefinitionsInput = {
    where?: Prisma.ProjectWhereInput;
    data: Prisma.XOR<Prisma.ProjectUpdateWithoutModelDefinitionsInput, Prisma.ProjectUncheckedUpdateWithoutModelDefinitionsInput>;
};
export type ProjectUpdateWithoutModelDefinitionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    entityTypes?: Prisma.EntityTypeUpdateManyWithoutProjectNestedInput;
    dataSources?: Prisma.DataSourceUpdateManyWithoutProjectNestedInput;
    integrationJobs?: Prisma.IntegrationJobUpdateManyWithoutProjectNestedInput;
    decisionRules?: Prisma.DecisionRuleUpdateManyWithoutProjectNestedInput;
    dashboards?: Prisma.DashboardUpdateManyWithoutProjectNestedInput;
    pipelines?: Prisma.PipelineUpdateManyWithoutProjectNestedInput;
};
export type ProjectUncheckedUpdateWithoutModelDefinitionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    entityTypes?: Prisma.EntityTypeUncheckedUpdateManyWithoutProjectNestedInput;
    dataSources?: Prisma.DataSourceUncheckedUpdateManyWithoutProjectNestedInput;
    integrationJobs?: Prisma.IntegrationJobUncheckedUpdateManyWithoutProjectNestedInput;
    decisionRules?: Prisma.DecisionRuleUncheckedUpdateManyWithoutProjectNestedInput;
    dashboards?: Prisma.DashboardUncheckedUpdateManyWithoutProjectNestedInput;
    pipelines?: Prisma.PipelineUncheckedUpdateManyWithoutProjectNestedInput;
};
export type ProjectCreateWithoutDecisionRulesInput = {
    id?: string;
    name: string;
    description?: string | null;
    createdAt?: Date | string;
    entityTypes?: Prisma.EntityTypeCreateNestedManyWithoutProjectInput;
    dataSources?: Prisma.DataSourceCreateNestedManyWithoutProjectInput;
    integrationJobs?: Prisma.IntegrationJobCreateNestedManyWithoutProjectInput;
    modelDefinitions?: Prisma.ModelDefinitionCreateNestedManyWithoutProjectInput;
    dashboards?: Prisma.DashboardCreateNestedManyWithoutProjectInput;
    pipelines?: Prisma.PipelineCreateNestedManyWithoutProjectInput;
};
export type ProjectUncheckedCreateWithoutDecisionRulesInput = {
    id?: string;
    name: string;
    description?: string | null;
    createdAt?: Date | string;
    entityTypes?: Prisma.EntityTypeUncheckedCreateNestedManyWithoutProjectInput;
    dataSources?: Prisma.DataSourceUncheckedCreateNestedManyWithoutProjectInput;
    integrationJobs?: Prisma.IntegrationJobUncheckedCreateNestedManyWithoutProjectInput;
    modelDefinitions?: Prisma.ModelDefinitionUncheckedCreateNestedManyWithoutProjectInput;
    dashboards?: Prisma.DashboardUncheckedCreateNestedManyWithoutProjectInput;
    pipelines?: Prisma.PipelineUncheckedCreateNestedManyWithoutProjectInput;
};
export type ProjectCreateOrConnectWithoutDecisionRulesInput = {
    where: Prisma.ProjectWhereUniqueInput;
    create: Prisma.XOR<Prisma.ProjectCreateWithoutDecisionRulesInput, Prisma.ProjectUncheckedCreateWithoutDecisionRulesInput>;
};
export type ProjectUpsertWithoutDecisionRulesInput = {
    update: Prisma.XOR<Prisma.ProjectUpdateWithoutDecisionRulesInput, Prisma.ProjectUncheckedUpdateWithoutDecisionRulesInput>;
    create: Prisma.XOR<Prisma.ProjectCreateWithoutDecisionRulesInput, Prisma.ProjectUncheckedCreateWithoutDecisionRulesInput>;
    where?: Prisma.ProjectWhereInput;
};
export type ProjectUpdateToOneWithWhereWithoutDecisionRulesInput = {
    where?: Prisma.ProjectWhereInput;
    data: Prisma.XOR<Prisma.ProjectUpdateWithoutDecisionRulesInput, Prisma.ProjectUncheckedUpdateWithoutDecisionRulesInput>;
};
export type ProjectUpdateWithoutDecisionRulesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    entityTypes?: Prisma.EntityTypeUpdateManyWithoutProjectNestedInput;
    dataSources?: Prisma.DataSourceUpdateManyWithoutProjectNestedInput;
    integrationJobs?: Prisma.IntegrationJobUpdateManyWithoutProjectNestedInput;
    modelDefinitions?: Prisma.ModelDefinitionUpdateManyWithoutProjectNestedInput;
    dashboards?: Prisma.DashboardUpdateManyWithoutProjectNestedInput;
    pipelines?: Prisma.PipelineUpdateManyWithoutProjectNestedInput;
};
export type ProjectUncheckedUpdateWithoutDecisionRulesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    entityTypes?: Prisma.EntityTypeUncheckedUpdateManyWithoutProjectNestedInput;
    dataSources?: Prisma.DataSourceUncheckedUpdateManyWithoutProjectNestedInput;
    integrationJobs?: Prisma.IntegrationJobUncheckedUpdateManyWithoutProjectNestedInput;
    modelDefinitions?: Prisma.ModelDefinitionUncheckedUpdateManyWithoutProjectNestedInput;
    dashboards?: Prisma.DashboardUncheckedUpdateManyWithoutProjectNestedInput;
    pipelines?: Prisma.PipelineUncheckedUpdateManyWithoutProjectNestedInput;
};
export type ProjectCreateWithoutDashboardsInput = {
    id?: string;
    name: string;
    description?: string | null;
    createdAt?: Date | string;
    entityTypes?: Prisma.EntityTypeCreateNestedManyWithoutProjectInput;
    dataSources?: Prisma.DataSourceCreateNestedManyWithoutProjectInput;
    integrationJobs?: Prisma.IntegrationJobCreateNestedManyWithoutProjectInput;
    decisionRules?: Prisma.DecisionRuleCreateNestedManyWithoutProjectInput;
    modelDefinitions?: Prisma.ModelDefinitionCreateNestedManyWithoutProjectInput;
    pipelines?: Prisma.PipelineCreateNestedManyWithoutProjectInput;
};
export type ProjectUncheckedCreateWithoutDashboardsInput = {
    id?: string;
    name: string;
    description?: string | null;
    createdAt?: Date | string;
    entityTypes?: Prisma.EntityTypeUncheckedCreateNestedManyWithoutProjectInput;
    dataSources?: Prisma.DataSourceUncheckedCreateNestedManyWithoutProjectInput;
    integrationJobs?: Prisma.IntegrationJobUncheckedCreateNestedManyWithoutProjectInput;
    decisionRules?: Prisma.DecisionRuleUncheckedCreateNestedManyWithoutProjectInput;
    modelDefinitions?: Prisma.ModelDefinitionUncheckedCreateNestedManyWithoutProjectInput;
    pipelines?: Prisma.PipelineUncheckedCreateNestedManyWithoutProjectInput;
};
export type ProjectCreateOrConnectWithoutDashboardsInput = {
    where: Prisma.ProjectWhereUniqueInput;
    create: Prisma.XOR<Prisma.ProjectCreateWithoutDashboardsInput, Prisma.ProjectUncheckedCreateWithoutDashboardsInput>;
};
export type ProjectUpsertWithoutDashboardsInput = {
    update: Prisma.XOR<Prisma.ProjectUpdateWithoutDashboardsInput, Prisma.ProjectUncheckedUpdateWithoutDashboardsInput>;
    create: Prisma.XOR<Prisma.ProjectCreateWithoutDashboardsInput, Prisma.ProjectUncheckedCreateWithoutDashboardsInput>;
    where?: Prisma.ProjectWhereInput;
};
export type ProjectUpdateToOneWithWhereWithoutDashboardsInput = {
    where?: Prisma.ProjectWhereInput;
    data: Prisma.XOR<Prisma.ProjectUpdateWithoutDashboardsInput, Prisma.ProjectUncheckedUpdateWithoutDashboardsInput>;
};
export type ProjectUpdateWithoutDashboardsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    entityTypes?: Prisma.EntityTypeUpdateManyWithoutProjectNestedInput;
    dataSources?: Prisma.DataSourceUpdateManyWithoutProjectNestedInput;
    integrationJobs?: Prisma.IntegrationJobUpdateManyWithoutProjectNestedInput;
    decisionRules?: Prisma.DecisionRuleUpdateManyWithoutProjectNestedInput;
    modelDefinitions?: Prisma.ModelDefinitionUpdateManyWithoutProjectNestedInput;
    pipelines?: Prisma.PipelineUpdateManyWithoutProjectNestedInput;
};
export type ProjectUncheckedUpdateWithoutDashboardsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    entityTypes?: Prisma.EntityTypeUncheckedUpdateManyWithoutProjectNestedInput;
    dataSources?: Prisma.DataSourceUncheckedUpdateManyWithoutProjectNestedInput;
    integrationJobs?: Prisma.IntegrationJobUncheckedUpdateManyWithoutProjectNestedInput;
    decisionRules?: Prisma.DecisionRuleUncheckedUpdateManyWithoutProjectNestedInput;
    modelDefinitions?: Prisma.ModelDefinitionUncheckedUpdateManyWithoutProjectNestedInput;
    pipelines?: Prisma.PipelineUncheckedUpdateManyWithoutProjectNestedInput;
};
/**
 * Count Type ProjectCountOutputType
 */
export type ProjectCountOutputType = {
    entityTypes: number;
    dataSources: number;
    integrationJobs: number;
    decisionRules: number;
    modelDefinitions: number;
    dashboards: number;
    pipelines: number;
};
export type ProjectCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    entityTypes?: boolean | ProjectCountOutputTypeCountEntityTypesArgs;
    dataSources?: boolean | ProjectCountOutputTypeCountDataSourcesArgs;
    integrationJobs?: boolean | ProjectCountOutputTypeCountIntegrationJobsArgs;
    decisionRules?: boolean | ProjectCountOutputTypeCountDecisionRulesArgs;
    modelDefinitions?: boolean | ProjectCountOutputTypeCountModelDefinitionsArgs;
    dashboards?: boolean | ProjectCountOutputTypeCountDashboardsArgs;
    pipelines?: boolean | ProjectCountOutputTypeCountPipelinesArgs;
};
/**
 * ProjectCountOutputType without action
 */
export type ProjectCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProjectCountOutputType
     */
    select?: Prisma.ProjectCountOutputTypeSelect<ExtArgs> | null;
};
/**
 * ProjectCountOutputType without action
 */
export type ProjectCountOutputTypeCountEntityTypesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EntityTypeWhereInput;
};
/**
 * ProjectCountOutputType without action
 */
export type ProjectCountOutputTypeCountDataSourcesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DataSourceWhereInput;
};
/**
 * ProjectCountOutputType without action
 */
export type ProjectCountOutputTypeCountIntegrationJobsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.IntegrationJobWhereInput;
};
/**
 * ProjectCountOutputType without action
 */
export type ProjectCountOutputTypeCountDecisionRulesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DecisionRuleWhereInput;
};
/**
 * ProjectCountOutputType without action
 */
export type ProjectCountOutputTypeCountModelDefinitionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ModelDefinitionWhereInput;
};
/**
 * ProjectCountOutputType without action
 */
export type ProjectCountOutputTypeCountDashboardsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DashboardWhereInput;
};
/**
 * ProjectCountOutputType without action
 */
export type ProjectCountOutputTypeCountPipelinesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PipelineWhereInput;
};
export type ProjectSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    description?: boolean;
    createdAt?: boolean;
    entityTypes?: boolean | Prisma.Project$entityTypesArgs<ExtArgs>;
    dataSources?: boolean | Prisma.Project$dataSourcesArgs<ExtArgs>;
    integrationJobs?: boolean | Prisma.Project$integrationJobsArgs<ExtArgs>;
    decisionRules?: boolean | Prisma.Project$decisionRulesArgs<ExtArgs>;
    modelDefinitions?: boolean | Prisma.Project$modelDefinitionsArgs<ExtArgs>;
    dashboards?: boolean | Prisma.Project$dashboardsArgs<ExtArgs>;
    pipelines?: boolean | Prisma.Project$pipelinesArgs<ExtArgs>;
    _count?: boolean | Prisma.ProjectCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["project"]>;
export type ProjectSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    description?: boolean;
    createdAt?: boolean;
}, ExtArgs["result"]["project"]>;
export type ProjectSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    description?: boolean;
    createdAt?: boolean;
}, ExtArgs["result"]["project"]>;
export type ProjectSelectScalar = {
    id?: boolean;
    name?: boolean;
    description?: boolean;
    createdAt?: boolean;
};
export type ProjectOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "name" | "description" | "createdAt", ExtArgs["result"]["project"]>;
export type ProjectInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    entityTypes?: boolean | Prisma.Project$entityTypesArgs<ExtArgs>;
    dataSources?: boolean | Prisma.Project$dataSourcesArgs<ExtArgs>;
    integrationJobs?: boolean | Prisma.Project$integrationJobsArgs<ExtArgs>;
    decisionRules?: boolean | Prisma.Project$decisionRulesArgs<ExtArgs>;
    modelDefinitions?: boolean | Prisma.Project$modelDefinitionsArgs<ExtArgs>;
    dashboards?: boolean | Prisma.Project$dashboardsArgs<ExtArgs>;
    pipelines?: boolean | Prisma.Project$pipelinesArgs<ExtArgs>;
    _count?: boolean | Prisma.ProjectCountOutputTypeDefaultArgs<ExtArgs>;
};
export type ProjectIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type ProjectIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $ProjectPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Project";
    objects: {
        entityTypes: Prisma.$EntityTypePayload<ExtArgs>[];
        dataSources: Prisma.$DataSourcePayload<ExtArgs>[];
        integrationJobs: Prisma.$IntegrationJobPayload<ExtArgs>[];
        decisionRules: Prisma.$DecisionRulePayload<ExtArgs>[];
        modelDefinitions: Prisma.$ModelDefinitionPayload<ExtArgs>[];
        dashboards: Prisma.$DashboardPayload<ExtArgs>[];
        pipelines: Prisma.$PipelinePayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
    }, ExtArgs["result"]["project"]>;
    composites: {};
};
export type ProjectGetPayload<S extends boolean | null | undefined | ProjectDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ProjectPayload, S>;
export type ProjectCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ProjectFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ProjectCountAggregateInputType | true;
};
export interface ProjectDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Project'];
        meta: {
            name: 'Project';
        };
    };
    /**
     * Find zero or one Project that matches the filter.
     * @param {ProjectFindUniqueArgs} args - Arguments to find a Project
     * @example
     * // Get one Project
     * const project = await prisma.project.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProjectFindUniqueArgs>(args: Prisma.SelectSubset<T, ProjectFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ProjectClient<runtime.Types.Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one Project that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ProjectFindUniqueOrThrowArgs} args - Arguments to find a Project
     * @example
     * // Get one Project
     * const project = await prisma.project.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProjectFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ProjectFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ProjectClient<runtime.Types.Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Project that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectFindFirstArgs} args - Arguments to find a Project
     * @example
     * // Get one Project
     * const project = await prisma.project.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProjectFindFirstArgs>(args?: Prisma.SelectSubset<T, ProjectFindFirstArgs<ExtArgs>>): Prisma.Prisma__ProjectClient<runtime.Types.Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Project that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectFindFirstOrThrowArgs} args - Arguments to find a Project
     * @example
     * // Get one Project
     * const project = await prisma.project.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProjectFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ProjectFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ProjectClient<runtime.Types.Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more Projects that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Projects
     * const projects = await prisma.project.findMany()
     *
     * // Get first 10 Projects
     * const projects = await prisma.project.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const projectWithIdOnly = await prisma.project.findMany({ select: { id: true } })
     *
     */
    findMany<T extends ProjectFindManyArgs>(args?: Prisma.SelectSubset<T, ProjectFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a Project.
     * @param {ProjectCreateArgs} args - Arguments to create a Project.
     * @example
     * // Create one Project
     * const Project = await prisma.project.create({
     *   data: {
     *     // ... data to create a Project
     *   }
     * })
     *
     */
    create<T extends ProjectCreateArgs>(args: Prisma.SelectSubset<T, ProjectCreateArgs<ExtArgs>>): Prisma.Prisma__ProjectClient<runtime.Types.Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many Projects.
     * @param {ProjectCreateManyArgs} args - Arguments to create many Projects.
     * @example
     * // Create many Projects
     * const project = await prisma.project.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends ProjectCreateManyArgs>(args?: Prisma.SelectSubset<T, ProjectCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many Projects and returns the data saved in the database.
     * @param {ProjectCreateManyAndReturnArgs} args - Arguments to create many Projects.
     * @example
     * // Create many Projects
     * const project = await prisma.project.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Projects and only return the `id`
     * const projectWithIdOnly = await prisma.project.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends ProjectCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ProjectCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a Project.
     * @param {ProjectDeleteArgs} args - Arguments to delete one Project.
     * @example
     * // Delete one Project
     * const Project = await prisma.project.delete({
     *   where: {
     *     // ... filter to delete one Project
     *   }
     * })
     *
     */
    delete<T extends ProjectDeleteArgs>(args: Prisma.SelectSubset<T, ProjectDeleteArgs<ExtArgs>>): Prisma.Prisma__ProjectClient<runtime.Types.Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one Project.
     * @param {ProjectUpdateArgs} args - Arguments to update one Project.
     * @example
     * // Update one Project
     * const project = await prisma.project.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends ProjectUpdateArgs>(args: Prisma.SelectSubset<T, ProjectUpdateArgs<ExtArgs>>): Prisma.Prisma__ProjectClient<runtime.Types.Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more Projects.
     * @param {ProjectDeleteManyArgs} args - Arguments to filter Projects to delete.
     * @example
     * // Delete a few Projects
     * const { count } = await prisma.project.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends ProjectDeleteManyArgs>(args?: Prisma.SelectSubset<T, ProjectDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Projects.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Projects
     * const project = await prisma.project.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends ProjectUpdateManyArgs>(args: Prisma.SelectSubset<T, ProjectUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Projects and returns the data updated in the database.
     * @param {ProjectUpdateManyAndReturnArgs} args - Arguments to update many Projects.
     * @example
     * // Update many Projects
     * const project = await prisma.project.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Projects and only return the `id`
     * const projectWithIdOnly = await prisma.project.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends ProjectUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ProjectUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one Project.
     * @param {ProjectUpsertArgs} args - Arguments to update or create a Project.
     * @example
     * // Update or create a Project
     * const project = await prisma.project.upsert({
     *   create: {
     *     // ... data to create a Project
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Project we want to update
     *   }
     * })
     */
    upsert<T extends ProjectUpsertArgs>(args: Prisma.SelectSubset<T, ProjectUpsertArgs<ExtArgs>>): Prisma.Prisma__ProjectClient<runtime.Types.Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of Projects.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectCountArgs} args - Arguments to filter Projects to count.
     * @example
     * // Count the number of Projects
     * const count = await prisma.project.count({
     *   where: {
     *     // ... the filter for the Projects we want to count
     *   }
     * })
    **/
    count<T extends ProjectCountArgs>(args?: Prisma.Subset<T, ProjectCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ProjectCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a Project.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProjectAggregateArgs>(args: Prisma.Subset<T, ProjectAggregateArgs>): Prisma.PrismaPromise<GetProjectAggregateType<T>>;
    /**
     * Group by Project.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
    **/
    groupBy<T extends ProjectGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ProjectGroupByArgs['orderBy'];
    } : {
        orderBy?: ProjectGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ProjectGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProjectGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Project model
     */
    readonly fields: ProjectFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for Project.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__ProjectClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    entityTypes<T extends Prisma.Project$entityTypesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Project$entityTypesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EntityTypePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    dataSources<T extends Prisma.Project$dataSourcesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Project$dataSourcesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DataSourcePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    integrationJobs<T extends Prisma.Project$integrationJobsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Project$integrationJobsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$IntegrationJobPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    decisionRules<T extends Prisma.Project$decisionRulesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Project$decisionRulesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DecisionRulePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    modelDefinitions<T extends Prisma.Project$modelDefinitionsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Project$modelDefinitionsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ModelDefinitionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    dashboards<T extends Prisma.Project$dashboardsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Project$dashboardsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DashboardPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    pipelines<T extends Prisma.Project$pipelinesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Project$pipelinesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PipelinePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
/**
 * Fields of the Project model
 */
export interface ProjectFieldRefs {
    readonly id: Prisma.FieldRef<"Project", 'String'>;
    readonly name: Prisma.FieldRef<"Project", 'String'>;
    readonly description: Prisma.FieldRef<"Project", 'String'>;
    readonly createdAt: Prisma.FieldRef<"Project", 'DateTime'>;
}
/**
 * Project findUnique
 */
export type ProjectFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: Prisma.ProjectSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Project
     */
    omit?: Prisma.ProjectOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProjectInclude<ExtArgs> | null;
    /**
     * Filter, which Project to fetch.
     */
    where: Prisma.ProjectWhereUniqueInput;
};
/**
 * Project findUniqueOrThrow
 */
export type ProjectFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: Prisma.ProjectSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Project
     */
    omit?: Prisma.ProjectOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProjectInclude<ExtArgs> | null;
    /**
     * Filter, which Project to fetch.
     */
    where: Prisma.ProjectWhereUniqueInput;
};
/**
 * Project findFirst
 */
export type ProjectFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: Prisma.ProjectSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Project
     */
    omit?: Prisma.ProjectOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProjectInclude<ExtArgs> | null;
    /**
     * Filter, which Project to fetch.
     */
    where?: Prisma.ProjectWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Projects to fetch.
     */
    orderBy?: Prisma.ProjectOrderByWithRelationInput | Prisma.ProjectOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Projects.
     */
    cursor?: Prisma.ProjectWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Projects from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Projects.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Projects.
     */
    distinct?: Prisma.ProjectScalarFieldEnum | Prisma.ProjectScalarFieldEnum[];
};
/**
 * Project findFirstOrThrow
 */
export type ProjectFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: Prisma.ProjectSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Project
     */
    omit?: Prisma.ProjectOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProjectInclude<ExtArgs> | null;
    /**
     * Filter, which Project to fetch.
     */
    where?: Prisma.ProjectWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Projects to fetch.
     */
    orderBy?: Prisma.ProjectOrderByWithRelationInput | Prisma.ProjectOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Projects.
     */
    cursor?: Prisma.ProjectWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Projects from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Projects.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Projects.
     */
    distinct?: Prisma.ProjectScalarFieldEnum | Prisma.ProjectScalarFieldEnum[];
};
/**
 * Project findMany
 */
export type ProjectFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: Prisma.ProjectSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Project
     */
    omit?: Prisma.ProjectOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProjectInclude<ExtArgs> | null;
    /**
     * Filter, which Projects to fetch.
     */
    where?: Prisma.ProjectWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Projects to fetch.
     */
    orderBy?: Prisma.ProjectOrderByWithRelationInput | Prisma.ProjectOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Projects.
     */
    cursor?: Prisma.ProjectWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Projects from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Projects.
     */
    skip?: number;
    distinct?: Prisma.ProjectScalarFieldEnum | Prisma.ProjectScalarFieldEnum[];
};
/**
 * Project create
 */
export type ProjectCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: Prisma.ProjectSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Project
     */
    omit?: Prisma.ProjectOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProjectInclude<ExtArgs> | null;
    /**
     * The data needed to create a Project.
     */
    data: Prisma.XOR<Prisma.ProjectCreateInput, Prisma.ProjectUncheckedCreateInput>;
};
/**
 * Project createMany
 */
export type ProjectCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many Projects.
     */
    data: Prisma.ProjectCreateManyInput | Prisma.ProjectCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * Project createManyAndReturn
 */
export type ProjectCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: Prisma.ProjectSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Project
     */
    omit?: Prisma.ProjectOmit<ExtArgs> | null;
    /**
     * The data used to create many Projects.
     */
    data: Prisma.ProjectCreateManyInput | Prisma.ProjectCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * Project update
 */
export type ProjectUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: Prisma.ProjectSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Project
     */
    omit?: Prisma.ProjectOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProjectInclude<ExtArgs> | null;
    /**
     * The data needed to update a Project.
     */
    data: Prisma.XOR<Prisma.ProjectUpdateInput, Prisma.ProjectUncheckedUpdateInput>;
    /**
     * Choose, which Project to update.
     */
    where: Prisma.ProjectWhereUniqueInput;
};
/**
 * Project updateMany
 */
export type ProjectUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update Projects.
     */
    data: Prisma.XOR<Prisma.ProjectUpdateManyMutationInput, Prisma.ProjectUncheckedUpdateManyInput>;
    /**
     * Filter which Projects to update
     */
    where?: Prisma.ProjectWhereInput;
    /**
     * Limit how many Projects to update.
     */
    limit?: number;
};
/**
 * Project updateManyAndReturn
 */
export type ProjectUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: Prisma.ProjectSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Project
     */
    omit?: Prisma.ProjectOmit<ExtArgs> | null;
    /**
     * The data used to update Projects.
     */
    data: Prisma.XOR<Prisma.ProjectUpdateManyMutationInput, Prisma.ProjectUncheckedUpdateManyInput>;
    /**
     * Filter which Projects to update
     */
    where?: Prisma.ProjectWhereInput;
    /**
     * Limit how many Projects to update.
     */
    limit?: number;
};
/**
 * Project upsert
 */
export type ProjectUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: Prisma.ProjectSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Project
     */
    omit?: Prisma.ProjectOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProjectInclude<ExtArgs> | null;
    /**
     * The filter to search for the Project to update in case it exists.
     */
    where: Prisma.ProjectWhereUniqueInput;
    /**
     * In case the Project found by the `where` argument doesn't exist, create a new Project with this data.
     */
    create: Prisma.XOR<Prisma.ProjectCreateInput, Prisma.ProjectUncheckedCreateInput>;
    /**
     * In case the Project was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.ProjectUpdateInput, Prisma.ProjectUncheckedUpdateInput>;
};
/**
 * Project delete
 */
export type ProjectDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: Prisma.ProjectSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Project
     */
    omit?: Prisma.ProjectOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProjectInclude<ExtArgs> | null;
    /**
     * Filter which Project to delete.
     */
    where: Prisma.ProjectWhereUniqueInput;
};
/**
 * Project deleteMany
 */
export type ProjectDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which Projects to delete
     */
    where?: Prisma.ProjectWhereInput;
    /**
     * Limit how many Projects to delete.
     */
    limit?: number;
};
/**
 * Project.entityTypes
 */
export type Project$entityTypesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntityType
     */
    select?: Prisma.EntityTypeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the EntityType
     */
    omit?: Prisma.EntityTypeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.EntityTypeInclude<ExtArgs> | null;
    where?: Prisma.EntityTypeWhereInput;
    orderBy?: Prisma.EntityTypeOrderByWithRelationInput | Prisma.EntityTypeOrderByWithRelationInput[];
    cursor?: Prisma.EntityTypeWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.EntityTypeScalarFieldEnum | Prisma.EntityTypeScalarFieldEnum[];
};
/**
 * Project.dataSources
 */
export type Project$dataSourcesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataSource
     */
    select?: Prisma.DataSourceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DataSource
     */
    omit?: Prisma.DataSourceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DataSourceInclude<ExtArgs> | null;
    where?: Prisma.DataSourceWhereInput;
    orderBy?: Prisma.DataSourceOrderByWithRelationInput | Prisma.DataSourceOrderByWithRelationInput[];
    cursor?: Prisma.DataSourceWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.DataSourceScalarFieldEnum | Prisma.DataSourceScalarFieldEnum[];
};
/**
 * Project.integrationJobs
 */
export type Project$integrationJobsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntegrationJob
     */
    select?: Prisma.IntegrationJobSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the IntegrationJob
     */
    omit?: Prisma.IntegrationJobOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.IntegrationJobInclude<ExtArgs> | null;
    where?: Prisma.IntegrationJobWhereInput;
    orderBy?: Prisma.IntegrationJobOrderByWithRelationInput | Prisma.IntegrationJobOrderByWithRelationInput[];
    cursor?: Prisma.IntegrationJobWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.IntegrationJobScalarFieldEnum | Prisma.IntegrationJobScalarFieldEnum[];
};
/**
 * Project.decisionRules
 */
export type Project$decisionRulesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DecisionRule
     */
    select?: Prisma.DecisionRuleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DecisionRule
     */
    omit?: Prisma.DecisionRuleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DecisionRuleInclude<ExtArgs> | null;
    where?: Prisma.DecisionRuleWhereInput;
    orderBy?: Prisma.DecisionRuleOrderByWithRelationInput | Prisma.DecisionRuleOrderByWithRelationInput[];
    cursor?: Prisma.DecisionRuleWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.DecisionRuleScalarFieldEnum | Prisma.DecisionRuleScalarFieldEnum[];
};
/**
 * Project.modelDefinitions
 */
export type Project$modelDefinitionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModelDefinition
     */
    select?: Prisma.ModelDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ModelDefinition
     */
    omit?: Prisma.ModelDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ModelDefinitionInclude<ExtArgs> | null;
    where?: Prisma.ModelDefinitionWhereInput;
    orderBy?: Prisma.ModelDefinitionOrderByWithRelationInput | Prisma.ModelDefinitionOrderByWithRelationInput[];
    cursor?: Prisma.ModelDefinitionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ModelDefinitionScalarFieldEnum | Prisma.ModelDefinitionScalarFieldEnum[];
};
/**
 * Project.dashboards
 */
export type Project$dashboardsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dashboard
     */
    select?: Prisma.DashboardSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Dashboard
     */
    omit?: Prisma.DashboardOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DashboardInclude<ExtArgs> | null;
    where?: Prisma.DashboardWhereInput;
    orderBy?: Prisma.DashboardOrderByWithRelationInput | Prisma.DashboardOrderByWithRelationInput[];
    cursor?: Prisma.DashboardWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.DashboardScalarFieldEnum | Prisma.DashboardScalarFieldEnum[];
};
/**
 * Project.pipelines
 */
export type Project$pipelinesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pipeline
     */
    select?: Prisma.PipelineSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Pipeline
     */
    omit?: Prisma.PipelineOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PipelineInclude<ExtArgs> | null;
    where?: Prisma.PipelineWhereInput;
    orderBy?: Prisma.PipelineOrderByWithRelationInput | Prisma.PipelineOrderByWithRelationInput[];
    cursor?: Prisma.PipelineWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PipelineScalarFieldEnum | Prisma.PipelineScalarFieldEnum[];
};
/**
 * Project without action
 */
export type ProjectDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: Prisma.ProjectSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Project
     */
    omit?: Prisma.ProjectOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProjectInclude<ExtArgs> | null;
};
export {};
//# sourceMappingURL=Project.d.ts.map