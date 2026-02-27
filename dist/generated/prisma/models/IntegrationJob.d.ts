import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
/**
 * Model IntegrationJob
 *
 */
export type IntegrationJobModel = runtime.Types.Result.DefaultSelection<Prisma.$IntegrationJobPayload>;
export type AggregateIntegrationJob = {
    _count: IntegrationJobCountAggregateOutputType | null;
    _min: IntegrationJobMinAggregateOutputType | null;
    _max: IntegrationJobMaxAggregateOutputType | null;
};
export type IntegrationJobMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    dataSourceId: string | null;
    targetEntityTypeId: string | null;
    logicalIdField: string | null;
    schedule: string | null;
    enabled: boolean | null;
    createdAt: Date | null;
    projectId: string | null;
};
export type IntegrationJobMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    dataSourceId: string | null;
    targetEntityTypeId: string | null;
    logicalIdField: string | null;
    schedule: string | null;
    enabled: boolean | null;
    createdAt: Date | null;
    projectId: string | null;
};
export type IntegrationJobCountAggregateOutputType = {
    id: number;
    name: number;
    dataSourceId: number;
    targetEntityTypeId: number;
    fieldMapping: number;
    logicalIdField: number;
    schedule: number;
    enabled: number;
    createdAt: number;
    projectId: number;
    _all: number;
};
export type IntegrationJobMinAggregateInputType = {
    id?: true;
    name?: true;
    dataSourceId?: true;
    targetEntityTypeId?: true;
    logicalIdField?: true;
    schedule?: true;
    enabled?: true;
    createdAt?: true;
    projectId?: true;
};
export type IntegrationJobMaxAggregateInputType = {
    id?: true;
    name?: true;
    dataSourceId?: true;
    targetEntityTypeId?: true;
    logicalIdField?: true;
    schedule?: true;
    enabled?: true;
    createdAt?: true;
    projectId?: true;
};
export type IntegrationJobCountAggregateInputType = {
    id?: true;
    name?: true;
    dataSourceId?: true;
    targetEntityTypeId?: true;
    fieldMapping?: true;
    logicalIdField?: true;
    schedule?: true;
    enabled?: true;
    createdAt?: true;
    projectId?: true;
    _all?: true;
};
export type IntegrationJobAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which IntegrationJob to aggregate.
     */
    where?: Prisma.IntegrationJobWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of IntegrationJobs to fetch.
     */
    orderBy?: Prisma.IntegrationJobOrderByWithRelationInput | Prisma.IntegrationJobOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.IntegrationJobWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` IntegrationJobs from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` IntegrationJobs.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned IntegrationJobs
    **/
    _count?: true | IntegrationJobCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: IntegrationJobMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: IntegrationJobMaxAggregateInputType;
};
export type GetIntegrationJobAggregateType<T extends IntegrationJobAggregateArgs> = {
    [P in keyof T & keyof AggregateIntegrationJob]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateIntegrationJob[P]> : Prisma.GetScalarType<T[P], AggregateIntegrationJob[P]>;
};
export type IntegrationJobGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.IntegrationJobWhereInput;
    orderBy?: Prisma.IntegrationJobOrderByWithAggregationInput | Prisma.IntegrationJobOrderByWithAggregationInput[];
    by: Prisma.IntegrationJobScalarFieldEnum[] | Prisma.IntegrationJobScalarFieldEnum;
    having?: Prisma.IntegrationJobScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: IntegrationJobCountAggregateInputType | true;
    _min?: IntegrationJobMinAggregateInputType;
    _max?: IntegrationJobMaxAggregateInputType;
};
export type IntegrationJobGroupByOutputType = {
    id: string;
    name: string;
    dataSourceId: string;
    targetEntityTypeId: string;
    fieldMapping: runtime.JsonValue;
    logicalIdField: string;
    schedule: string | null;
    enabled: boolean;
    createdAt: Date;
    projectId: string;
    _count: IntegrationJobCountAggregateOutputType | null;
    _min: IntegrationJobMinAggregateOutputType | null;
    _max: IntegrationJobMaxAggregateOutputType | null;
};
type GetIntegrationJobGroupByPayload<T extends IntegrationJobGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<IntegrationJobGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof IntegrationJobGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], IntegrationJobGroupByOutputType[P]> : Prisma.GetScalarType<T[P], IntegrationJobGroupByOutputType[P]>;
}>>;
export type IntegrationJobWhereInput = {
    AND?: Prisma.IntegrationJobWhereInput | Prisma.IntegrationJobWhereInput[];
    OR?: Prisma.IntegrationJobWhereInput[];
    NOT?: Prisma.IntegrationJobWhereInput | Prisma.IntegrationJobWhereInput[];
    id?: Prisma.StringFilter<"IntegrationJob"> | string;
    name?: Prisma.StringFilter<"IntegrationJob"> | string;
    dataSourceId?: Prisma.StringFilter<"IntegrationJob"> | string;
    targetEntityTypeId?: Prisma.StringFilter<"IntegrationJob"> | string;
    fieldMapping?: Prisma.JsonFilter<"IntegrationJob">;
    logicalIdField?: Prisma.StringFilter<"IntegrationJob"> | string;
    schedule?: Prisma.StringNullableFilter<"IntegrationJob"> | string | null;
    enabled?: Prisma.BoolFilter<"IntegrationJob"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"IntegrationJob"> | Date | string;
    projectId?: Prisma.StringFilter<"IntegrationJob"> | string;
    project?: Prisma.XOR<Prisma.ProjectScalarRelationFilter, Prisma.ProjectWhereInput>;
    dataSource?: Prisma.XOR<Prisma.DataSourceScalarRelationFilter, Prisma.DataSourceWhereInput>;
    targetEntityType?: Prisma.XOR<Prisma.EntityTypeScalarRelationFilter, Prisma.EntityTypeWhereInput>;
    executions?: Prisma.JobExecutionListRelationFilter;
};
export type IntegrationJobOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    dataSourceId?: Prisma.SortOrder;
    targetEntityTypeId?: Prisma.SortOrder;
    fieldMapping?: Prisma.SortOrder;
    logicalIdField?: Prisma.SortOrder;
    schedule?: Prisma.SortOrderInput | Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    projectId?: Prisma.SortOrder;
    project?: Prisma.ProjectOrderByWithRelationInput;
    dataSource?: Prisma.DataSourceOrderByWithRelationInput;
    targetEntityType?: Prisma.EntityTypeOrderByWithRelationInput;
    executions?: Prisma.JobExecutionOrderByRelationAggregateInput;
};
export type IntegrationJobWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    name?: string;
    AND?: Prisma.IntegrationJobWhereInput | Prisma.IntegrationJobWhereInput[];
    OR?: Prisma.IntegrationJobWhereInput[];
    NOT?: Prisma.IntegrationJobWhereInput | Prisma.IntegrationJobWhereInput[];
    dataSourceId?: Prisma.StringFilter<"IntegrationJob"> | string;
    targetEntityTypeId?: Prisma.StringFilter<"IntegrationJob"> | string;
    fieldMapping?: Prisma.JsonFilter<"IntegrationJob">;
    logicalIdField?: Prisma.StringFilter<"IntegrationJob"> | string;
    schedule?: Prisma.StringNullableFilter<"IntegrationJob"> | string | null;
    enabled?: Prisma.BoolFilter<"IntegrationJob"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"IntegrationJob"> | Date | string;
    projectId?: Prisma.StringFilter<"IntegrationJob"> | string;
    project?: Prisma.XOR<Prisma.ProjectScalarRelationFilter, Prisma.ProjectWhereInput>;
    dataSource?: Prisma.XOR<Prisma.DataSourceScalarRelationFilter, Prisma.DataSourceWhereInput>;
    targetEntityType?: Prisma.XOR<Prisma.EntityTypeScalarRelationFilter, Prisma.EntityTypeWhereInput>;
    executions?: Prisma.JobExecutionListRelationFilter;
}, "id" | "name">;
export type IntegrationJobOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    dataSourceId?: Prisma.SortOrder;
    targetEntityTypeId?: Prisma.SortOrder;
    fieldMapping?: Prisma.SortOrder;
    logicalIdField?: Prisma.SortOrder;
    schedule?: Prisma.SortOrderInput | Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    projectId?: Prisma.SortOrder;
    _count?: Prisma.IntegrationJobCountOrderByAggregateInput;
    _max?: Prisma.IntegrationJobMaxOrderByAggregateInput;
    _min?: Prisma.IntegrationJobMinOrderByAggregateInput;
};
export type IntegrationJobScalarWhereWithAggregatesInput = {
    AND?: Prisma.IntegrationJobScalarWhereWithAggregatesInput | Prisma.IntegrationJobScalarWhereWithAggregatesInput[];
    OR?: Prisma.IntegrationJobScalarWhereWithAggregatesInput[];
    NOT?: Prisma.IntegrationJobScalarWhereWithAggregatesInput | Prisma.IntegrationJobScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"IntegrationJob"> | string;
    name?: Prisma.StringWithAggregatesFilter<"IntegrationJob"> | string;
    dataSourceId?: Prisma.StringWithAggregatesFilter<"IntegrationJob"> | string;
    targetEntityTypeId?: Prisma.StringWithAggregatesFilter<"IntegrationJob"> | string;
    fieldMapping?: Prisma.JsonWithAggregatesFilter<"IntegrationJob">;
    logicalIdField?: Prisma.StringWithAggregatesFilter<"IntegrationJob"> | string;
    schedule?: Prisma.StringNullableWithAggregatesFilter<"IntegrationJob"> | string | null;
    enabled?: Prisma.BoolWithAggregatesFilter<"IntegrationJob"> | boolean;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"IntegrationJob"> | Date | string;
    projectId?: Prisma.StringWithAggregatesFilter<"IntegrationJob"> | string;
};
export type IntegrationJobCreateInput = {
    id?: string;
    name: string;
    fieldMapping: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicalIdField: string;
    schedule?: string | null;
    enabled?: boolean;
    createdAt?: Date | string;
    project: Prisma.ProjectCreateNestedOneWithoutIntegrationJobsInput;
    dataSource: Prisma.DataSourceCreateNestedOneWithoutIntegrationJobsInput;
    targetEntityType: Prisma.EntityTypeCreateNestedOneWithoutIntegrationJobsInput;
    executions?: Prisma.JobExecutionCreateNestedManyWithoutIntegrationJobInput;
};
export type IntegrationJobUncheckedCreateInput = {
    id?: string;
    name: string;
    dataSourceId: string;
    targetEntityTypeId: string;
    fieldMapping: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicalIdField: string;
    schedule?: string | null;
    enabled?: boolean;
    createdAt?: Date | string;
    projectId: string;
    executions?: Prisma.JobExecutionUncheckedCreateNestedManyWithoutIntegrationJobInput;
};
export type IntegrationJobUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    fieldMapping?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicalIdField?: Prisma.StringFieldUpdateOperationsInput | string;
    schedule?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    project?: Prisma.ProjectUpdateOneRequiredWithoutIntegrationJobsNestedInput;
    dataSource?: Prisma.DataSourceUpdateOneRequiredWithoutIntegrationJobsNestedInput;
    targetEntityType?: Prisma.EntityTypeUpdateOneRequiredWithoutIntegrationJobsNestedInput;
    executions?: Prisma.JobExecutionUpdateManyWithoutIntegrationJobNestedInput;
};
export type IntegrationJobUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    dataSourceId?: Prisma.StringFieldUpdateOperationsInput | string;
    targetEntityTypeId?: Prisma.StringFieldUpdateOperationsInput | string;
    fieldMapping?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicalIdField?: Prisma.StringFieldUpdateOperationsInput | string;
    schedule?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    projectId?: Prisma.StringFieldUpdateOperationsInput | string;
    executions?: Prisma.JobExecutionUncheckedUpdateManyWithoutIntegrationJobNestedInput;
};
export type IntegrationJobCreateManyInput = {
    id?: string;
    name: string;
    dataSourceId: string;
    targetEntityTypeId: string;
    fieldMapping: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicalIdField: string;
    schedule?: string | null;
    enabled?: boolean;
    createdAt?: Date | string;
    projectId: string;
};
export type IntegrationJobUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    fieldMapping?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicalIdField?: Prisma.StringFieldUpdateOperationsInput | string;
    schedule?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type IntegrationJobUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    dataSourceId?: Prisma.StringFieldUpdateOperationsInput | string;
    targetEntityTypeId?: Prisma.StringFieldUpdateOperationsInput | string;
    fieldMapping?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicalIdField?: Prisma.StringFieldUpdateOperationsInput | string;
    schedule?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    projectId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type IntegrationJobListRelationFilter = {
    every?: Prisma.IntegrationJobWhereInput;
    some?: Prisma.IntegrationJobWhereInput;
    none?: Prisma.IntegrationJobWhereInput;
};
export type IntegrationJobOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type IntegrationJobCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    dataSourceId?: Prisma.SortOrder;
    targetEntityTypeId?: Prisma.SortOrder;
    fieldMapping?: Prisma.SortOrder;
    logicalIdField?: Prisma.SortOrder;
    schedule?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    projectId?: Prisma.SortOrder;
};
export type IntegrationJobMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    dataSourceId?: Prisma.SortOrder;
    targetEntityTypeId?: Prisma.SortOrder;
    logicalIdField?: Prisma.SortOrder;
    schedule?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    projectId?: Prisma.SortOrder;
};
export type IntegrationJobMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    dataSourceId?: Prisma.SortOrder;
    targetEntityTypeId?: Prisma.SortOrder;
    logicalIdField?: Prisma.SortOrder;
    schedule?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    projectId?: Prisma.SortOrder;
};
export type IntegrationJobScalarRelationFilter = {
    is?: Prisma.IntegrationJobWhereInput;
    isNot?: Prisma.IntegrationJobWhereInput;
};
export type IntegrationJobCreateNestedManyWithoutProjectInput = {
    create?: Prisma.XOR<Prisma.IntegrationJobCreateWithoutProjectInput, Prisma.IntegrationJobUncheckedCreateWithoutProjectInput> | Prisma.IntegrationJobCreateWithoutProjectInput[] | Prisma.IntegrationJobUncheckedCreateWithoutProjectInput[];
    connectOrCreate?: Prisma.IntegrationJobCreateOrConnectWithoutProjectInput | Prisma.IntegrationJobCreateOrConnectWithoutProjectInput[];
    createMany?: Prisma.IntegrationJobCreateManyProjectInputEnvelope;
    connect?: Prisma.IntegrationJobWhereUniqueInput | Prisma.IntegrationJobWhereUniqueInput[];
};
export type IntegrationJobUncheckedCreateNestedManyWithoutProjectInput = {
    create?: Prisma.XOR<Prisma.IntegrationJobCreateWithoutProjectInput, Prisma.IntegrationJobUncheckedCreateWithoutProjectInput> | Prisma.IntegrationJobCreateWithoutProjectInput[] | Prisma.IntegrationJobUncheckedCreateWithoutProjectInput[];
    connectOrCreate?: Prisma.IntegrationJobCreateOrConnectWithoutProjectInput | Prisma.IntegrationJobCreateOrConnectWithoutProjectInput[];
    createMany?: Prisma.IntegrationJobCreateManyProjectInputEnvelope;
    connect?: Prisma.IntegrationJobWhereUniqueInput | Prisma.IntegrationJobWhereUniqueInput[];
};
export type IntegrationJobUpdateManyWithoutProjectNestedInput = {
    create?: Prisma.XOR<Prisma.IntegrationJobCreateWithoutProjectInput, Prisma.IntegrationJobUncheckedCreateWithoutProjectInput> | Prisma.IntegrationJobCreateWithoutProjectInput[] | Prisma.IntegrationJobUncheckedCreateWithoutProjectInput[];
    connectOrCreate?: Prisma.IntegrationJobCreateOrConnectWithoutProjectInput | Prisma.IntegrationJobCreateOrConnectWithoutProjectInput[];
    upsert?: Prisma.IntegrationJobUpsertWithWhereUniqueWithoutProjectInput | Prisma.IntegrationJobUpsertWithWhereUniqueWithoutProjectInput[];
    createMany?: Prisma.IntegrationJobCreateManyProjectInputEnvelope;
    set?: Prisma.IntegrationJobWhereUniqueInput | Prisma.IntegrationJobWhereUniqueInput[];
    disconnect?: Prisma.IntegrationJobWhereUniqueInput | Prisma.IntegrationJobWhereUniqueInput[];
    delete?: Prisma.IntegrationJobWhereUniqueInput | Prisma.IntegrationJobWhereUniqueInput[];
    connect?: Prisma.IntegrationJobWhereUniqueInput | Prisma.IntegrationJobWhereUniqueInput[];
    update?: Prisma.IntegrationJobUpdateWithWhereUniqueWithoutProjectInput | Prisma.IntegrationJobUpdateWithWhereUniqueWithoutProjectInput[];
    updateMany?: Prisma.IntegrationJobUpdateManyWithWhereWithoutProjectInput | Prisma.IntegrationJobUpdateManyWithWhereWithoutProjectInput[];
    deleteMany?: Prisma.IntegrationJobScalarWhereInput | Prisma.IntegrationJobScalarWhereInput[];
};
export type IntegrationJobUncheckedUpdateManyWithoutProjectNestedInput = {
    create?: Prisma.XOR<Prisma.IntegrationJobCreateWithoutProjectInput, Prisma.IntegrationJobUncheckedCreateWithoutProjectInput> | Prisma.IntegrationJobCreateWithoutProjectInput[] | Prisma.IntegrationJobUncheckedCreateWithoutProjectInput[];
    connectOrCreate?: Prisma.IntegrationJobCreateOrConnectWithoutProjectInput | Prisma.IntegrationJobCreateOrConnectWithoutProjectInput[];
    upsert?: Prisma.IntegrationJobUpsertWithWhereUniqueWithoutProjectInput | Prisma.IntegrationJobUpsertWithWhereUniqueWithoutProjectInput[];
    createMany?: Prisma.IntegrationJobCreateManyProjectInputEnvelope;
    set?: Prisma.IntegrationJobWhereUniqueInput | Prisma.IntegrationJobWhereUniqueInput[];
    disconnect?: Prisma.IntegrationJobWhereUniqueInput | Prisma.IntegrationJobWhereUniqueInput[];
    delete?: Prisma.IntegrationJobWhereUniqueInput | Prisma.IntegrationJobWhereUniqueInput[];
    connect?: Prisma.IntegrationJobWhereUniqueInput | Prisma.IntegrationJobWhereUniqueInput[];
    update?: Prisma.IntegrationJobUpdateWithWhereUniqueWithoutProjectInput | Prisma.IntegrationJobUpdateWithWhereUniqueWithoutProjectInput[];
    updateMany?: Prisma.IntegrationJobUpdateManyWithWhereWithoutProjectInput | Prisma.IntegrationJobUpdateManyWithWhereWithoutProjectInput[];
    deleteMany?: Prisma.IntegrationJobScalarWhereInput | Prisma.IntegrationJobScalarWhereInput[];
};
export type IntegrationJobCreateNestedManyWithoutTargetEntityTypeInput = {
    create?: Prisma.XOR<Prisma.IntegrationJobCreateWithoutTargetEntityTypeInput, Prisma.IntegrationJobUncheckedCreateWithoutTargetEntityTypeInput> | Prisma.IntegrationJobCreateWithoutTargetEntityTypeInput[] | Prisma.IntegrationJobUncheckedCreateWithoutTargetEntityTypeInput[];
    connectOrCreate?: Prisma.IntegrationJobCreateOrConnectWithoutTargetEntityTypeInput | Prisma.IntegrationJobCreateOrConnectWithoutTargetEntityTypeInput[];
    createMany?: Prisma.IntegrationJobCreateManyTargetEntityTypeInputEnvelope;
    connect?: Prisma.IntegrationJobWhereUniqueInput | Prisma.IntegrationJobWhereUniqueInput[];
};
export type IntegrationJobUncheckedCreateNestedManyWithoutTargetEntityTypeInput = {
    create?: Prisma.XOR<Prisma.IntegrationJobCreateWithoutTargetEntityTypeInput, Prisma.IntegrationJobUncheckedCreateWithoutTargetEntityTypeInput> | Prisma.IntegrationJobCreateWithoutTargetEntityTypeInput[] | Prisma.IntegrationJobUncheckedCreateWithoutTargetEntityTypeInput[];
    connectOrCreate?: Prisma.IntegrationJobCreateOrConnectWithoutTargetEntityTypeInput | Prisma.IntegrationJobCreateOrConnectWithoutTargetEntityTypeInput[];
    createMany?: Prisma.IntegrationJobCreateManyTargetEntityTypeInputEnvelope;
    connect?: Prisma.IntegrationJobWhereUniqueInput | Prisma.IntegrationJobWhereUniqueInput[];
};
export type IntegrationJobUpdateManyWithoutTargetEntityTypeNestedInput = {
    create?: Prisma.XOR<Prisma.IntegrationJobCreateWithoutTargetEntityTypeInput, Prisma.IntegrationJobUncheckedCreateWithoutTargetEntityTypeInput> | Prisma.IntegrationJobCreateWithoutTargetEntityTypeInput[] | Prisma.IntegrationJobUncheckedCreateWithoutTargetEntityTypeInput[];
    connectOrCreate?: Prisma.IntegrationJobCreateOrConnectWithoutTargetEntityTypeInput | Prisma.IntegrationJobCreateOrConnectWithoutTargetEntityTypeInput[];
    upsert?: Prisma.IntegrationJobUpsertWithWhereUniqueWithoutTargetEntityTypeInput | Prisma.IntegrationJobUpsertWithWhereUniqueWithoutTargetEntityTypeInput[];
    createMany?: Prisma.IntegrationJobCreateManyTargetEntityTypeInputEnvelope;
    set?: Prisma.IntegrationJobWhereUniqueInput | Prisma.IntegrationJobWhereUniqueInput[];
    disconnect?: Prisma.IntegrationJobWhereUniqueInput | Prisma.IntegrationJobWhereUniqueInput[];
    delete?: Prisma.IntegrationJobWhereUniqueInput | Prisma.IntegrationJobWhereUniqueInput[];
    connect?: Prisma.IntegrationJobWhereUniqueInput | Prisma.IntegrationJobWhereUniqueInput[];
    update?: Prisma.IntegrationJobUpdateWithWhereUniqueWithoutTargetEntityTypeInput | Prisma.IntegrationJobUpdateWithWhereUniqueWithoutTargetEntityTypeInput[];
    updateMany?: Prisma.IntegrationJobUpdateManyWithWhereWithoutTargetEntityTypeInput | Prisma.IntegrationJobUpdateManyWithWhereWithoutTargetEntityTypeInput[];
    deleteMany?: Prisma.IntegrationJobScalarWhereInput | Prisma.IntegrationJobScalarWhereInput[];
};
export type IntegrationJobUncheckedUpdateManyWithoutTargetEntityTypeNestedInput = {
    create?: Prisma.XOR<Prisma.IntegrationJobCreateWithoutTargetEntityTypeInput, Prisma.IntegrationJobUncheckedCreateWithoutTargetEntityTypeInput> | Prisma.IntegrationJobCreateWithoutTargetEntityTypeInput[] | Prisma.IntegrationJobUncheckedCreateWithoutTargetEntityTypeInput[];
    connectOrCreate?: Prisma.IntegrationJobCreateOrConnectWithoutTargetEntityTypeInput | Prisma.IntegrationJobCreateOrConnectWithoutTargetEntityTypeInput[];
    upsert?: Prisma.IntegrationJobUpsertWithWhereUniqueWithoutTargetEntityTypeInput | Prisma.IntegrationJobUpsertWithWhereUniqueWithoutTargetEntityTypeInput[];
    createMany?: Prisma.IntegrationJobCreateManyTargetEntityTypeInputEnvelope;
    set?: Prisma.IntegrationJobWhereUniqueInput | Prisma.IntegrationJobWhereUniqueInput[];
    disconnect?: Prisma.IntegrationJobWhereUniqueInput | Prisma.IntegrationJobWhereUniqueInput[];
    delete?: Prisma.IntegrationJobWhereUniqueInput | Prisma.IntegrationJobWhereUniqueInput[];
    connect?: Prisma.IntegrationJobWhereUniqueInput | Prisma.IntegrationJobWhereUniqueInput[];
    update?: Prisma.IntegrationJobUpdateWithWhereUniqueWithoutTargetEntityTypeInput | Prisma.IntegrationJobUpdateWithWhereUniqueWithoutTargetEntityTypeInput[];
    updateMany?: Prisma.IntegrationJobUpdateManyWithWhereWithoutTargetEntityTypeInput | Prisma.IntegrationJobUpdateManyWithWhereWithoutTargetEntityTypeInput[];
    deleteMany?: Prisma.IntegrationJobScalarWhereInput | Prisma.IntegrationJobScalarWhereInput[];
};
export type IntegrationJobCreateNestedManyWithoutDataSourceInput = {
    create?: Prisma.XOR<Prisma.IntegrationJobCreateWithoutDataSourceInput, Prisma.IntegrationJobUncheckedCreateWithoutDataSourceInput> | Prisma.IntegrationJobCreateWithoutDataSourceInput[] | Prisma.IntegrationJobUncheckedCreateWithoutDataSourceInput[];
    connectOrCreate?: Prisma.IntegrationJobCreateOrConnectWithoutDataSourceInput | Prisma.IntegrationJobCreateOrConnectWithoutDataSourceInput[];
    createMany?: Prisma.IntegrationJobCreateManyDataSourceInputEnvelope;
    connect?: Prisma.IntegrationJobWhereUniqueInput | Prisma.IntegrationJobWhereUniqueInput[];
};
export type IntegrationJobUncheckedCreateNestedManyWithoutDataSourceInput = {
    create?: Prisma.XOR<Prisma.IntegrationJobCreateWithoutDataSourceInput, Prisma.IntegrationJobUncheckedCreateWithoutDataSourceInput> | Prisma.IntegrationJobCreateWithoutDataSourceInput[] | Prisma.IntegrationJobUncheckedCreateWithoutDataSourceInput[];
    connectOrCreate?: Prisma.IntegrationJobCreateOrConnectWithoutDataSourceInput | Prisma.IntegrationJobCreateOrConnectWithoutDataSourceInput[];
    createMany?: Prisma.IntegrationJobCreateManyDataSourceInputEnvelope;
    connect?: Prisma.IntegrationJobWhereUniqueInput | Prisma.IntegrationJobWhereUniqueInput[];
};
export type IntegrationJobUpdateManyWithoutDataSourceNestedInput = {
    create?: Prisma.XOR<Prisma.IntegrationJobCreateWithoutDataSourceInput, Prisma.IntegrationJobUncheckedCreateWithoutDataSourceInput> | Prisma.IntegrationJobCreateWithoutDataSourceInput[] | Prisma.IntegrationJobUncheckedCreateWithoutDataSourceInput[];
    connectOrCreate?: Prisma.IntegrationJobCreateOrConnectWithoutDataSourceInput | Prisma.IntegrationJobCreateOrConnectWithoutDataSourceInput[];
    upsert?: Prisma.IntegrationJobUpsertWithWhereUniqueWithoutDataSourceInput | Prisma.IntegrationJobUpsertWithWhereUniqueWithoutDataSourceInput[];
    createMany?: Prisma.IntegrationJobCreateManyDataSourceInputEnvelope;
    set?: Prisma.IntegrationJobWhereUniqueInput | Prisma.IntegrationJobWhereUniqueInput[];
    disconnect?: Prisma.IntegrationJobWhereUniqueInput | Prisma.IntegrationJobWhereUniqueInput[];
    delete?: Prisma.IntegrationJobWhereUniqueInput | Prisma.IntegrationJobWhereUniqueInput[];
    connect?: Prisma.IntegrationJobWhereUniqueInput | Prisma.IntegrationJobWhereUniqueInput[];
    update?: Prisma.IntegrationJobUpdateWithWhereUniqueWithoutDataSourceInput | Prisma.IntegrationJobUpdateWithWhereUniqueWithoutDataSourceInput[];
    updateMany?: Prisma.IntegrationJobUpdateManyWithWhereWithoutDataSourceInput | Prisma.IntegrationJobUpdateManyWithWhereWithoutDataSourceInput[];
    deleteMany?: Prisma.IntegrationJobScalarWhereInput | Prisma.IntegrationJobScalarWhereInput[];
};
export type IntegrationJobUncheckedUpdateManyWithoutDataSourceNestedInput = {
    create?: Prisma.XOR<Prisma.IntegrationJobCreateWithoutDataSourceInput, Prisma.IntegrationJobUncheckedCreateWithoutDataSourceInput> | Prisma.IntegrationJobCreateWithoutDataSourceInput[] | Prisma.IntegrationJobUncheckedCreateWithoutDataSourceInput[];
    connectOrCreate?: Prisma.IntegrationJobCreateOrConnectWithoutDataSourceInput | Prisma.IntegrationJobCreateOrConnectWithoutDataSourceInput[];
    upsert?: Prisma.IntegrationJobUpsertWithWhereUniqueWithoutDataSourceInput | Prisma.IntegrationJobUpsertWithWhereUniqueWithoutDataSourceInput[];
    createMany?: Prisma.IntegrationJobCreateManyDataSourceInputEnvelope;
    set?: Prisma.IntegrationJobWhereUniqueInput | Prisma.IntegrationJobWhereUniqueInput[];
    disconnect?: Prisma.IntegrationJobWhereUniqueInput | Prisma.IntegrationJobWhereUniqueInput[];
    delete?: Prisma.IntegrationJobWhereUniqueInput | Prisma.IntegrationJobWhereUniqueInput[];
    connect?: Prisma.IntegrationJobWhereUniqueInput | Prisma.IntegrationJobWhereUniqueInput[];
    update?: Prisma.IntegrationJobUpdateWithWhereUniqueWithoutDataSourceInput | Prisma.IntegrationJobUpdateWithWhereUniqueWithoutDataSourceInput[];
    updateMany?: Prisma.IntegrationJobUpdateManyWithWhereWithoutDataSourceInput | Prisma.IntegrationJobUpdateManyWithWhereWithoutDataSourceInput[];
    deleteMany?: Prisma.IntegrationJobScalarWhereInput | Prisma.IntegrationJobScalarWhereInput[];
};
export type IntegrationJobCreateNestedOneWithoutExecutionsInput = {
    create?: Prisma.XOR<Prisma.IntegrationJobCreateWithoutExecutionsInput, Prisma.IntegrationJobUncheckedCreateWithoutExecutionsInput>;
    connectOrCreate?: Prisma.IntegrationJobCreateOrConnectWithoutExecutionsInput;
    connect?: Prisma.IntegrationJobWhereUniqueInput;
};
export type IntegrationJobUpdateOneRequiredWithoutExecutionsNestedInput = {
    create?: Prisma.XOR<Prisma.IntegrationJobCreateWithoutExecutionsInput, Prisma.IntegrationJobUncheckedCreateWithoutExecutionsInput>;
    connectOrCreate?: Prisma.IntegrationJobCreateOrConnectWithoutExecutionsInput;
    upsert?: Prisma.IntegrationJobUpsertWithoutExecutionsInput;
    connect?: Prisma.IntegrationJobWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.IntegrationJobUpdateToOneWithWhereWithoutExecutionsInput, Prisma.IntegrationJobUpdateWithoutExecutionsInput>, Prisma.IntegrationJobUncheckedUpdateWithoutExecutionsInput>;
};
export type IntegrationJobCreateWithoutProjectInput = {
    id?: string;
    name: string;
    fieldMapping: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicalIdField: string;
    schedule?: string | null;
    enabled?: boolean;
    createdAt?: Date | string;
    dataSource: Prisma.DataSourceCreateNestedOneWithoutIntegrationJobsInput;
    targetEntityType: Prisma.EntityTypeCreateNestedOneWithoutIntegrationJobsInput;
    executions?: Prisma.JobExecutionCreateNestedManyWithoutIntegrationJobInput;
};
export type IntegrationJobUncheckedCreateWithoutProjectInput = {
    id?: string;
    name: string;
    dataSourceId: string;
    targetEntityTypeId: string;
    fieldMapping: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicalIdField: string;
    schedule?: string | null;
    enabled?: boolean;
    createdAt?: Date | string;
    executions?: Prisma.JobExecutionUncheckedCreateNestedManyWithoutIntegrationJobInput;
};
export type IntegrationJobCreateOrConnectWithoutProjectInput = {
    where: Prisma.IntegrationJobWhereUniqueInput;
    create: Prisma.XOR<Prisma.IntegrationJobCreateWithoutProjectInput, Prisma.IntegrationJobUncheckedCreateWithoutProjectInput>;
};
export type IntegrationJobCreateManyProjectInputEnvelope = {
    data: Prisma.IntegrationJobCreateManyProjectInput | Prisma.IntegrationJobCreateManyProjectInput[];
    skipDuplicates?: boolean;
};
export type IntegrationJobUpsertWithWhereUniqueWithoutProjectInput = {
    where: Prisma.IntegrationJobWhereUniqueInput;
    update: Prisma.XOR<Prisma.IntegrationJobUpdateWithoutProjectInput, Prisma.IntegrationJobUncheckedUpdateWithoutProjectInput>;
    create: Prisma.XOR<Prisma.IntegrationJobCreateWithoutProjectInput, Prisma.IntegrationJobUncheckedCreateWithoutProjectInput>;
};
export type IntegrationJobUpdateWithWhereUniqueWithoutProjectInput = {
    where: Prisma.IntegrationJobWhereUniqueInput;
    data: Prisma.XOR<Prisma.IntegrationJobUpdateWithoutProjectInput, Prisma.IntegrationJobUncheckedUpdateWithoutProjectInput>;
};
export type IntegrationJobUpdateManyWithWhereWithoutProjectInput = {
    where: Prisma.IntegrationJobScalarWhereInput;
    data: Prisma.XOR<Prisma.IntegrationJobUpdateManyMutationInput, Prisma.IntegrationJobUncheckedUpdateManyWithoutProjectInput>;
};
export type IntegrationJobScalarWhereInput = {
    AND?: Prisma.IntegrationJobScalarWhereInput | Prisma.IntegrationJobScalarWhereInput[];
    OR?: Prisma.IntegrationJobScalarWhereInput[];
    NOT?: Prisma.IntegrationJobScalarWhereInput | Prisma.IntegrationJobScalarWhereInput[];
    id?: Prisma.StringFilter<"IntegrationJob"> | string;
    name?: Prisma.StringFilter<"IntegrationJob"> | string;
    dataSourceId?: Prisma.StringFilter<"IntegrationJob"> | string;
    targetEntityTypeId?: Prisma.StringFilter<"IntegrationJob"> | string;
    fieldMapping?: Prisma.JsonFilter<"IntegrationJob">;
    logicalIdField?: Prisma.StringFilter<"IntegrationJob"> | string;
    schedule?: Prisma.StringNullableFilter<"IntegrationJob"> | string | null;
    enabled?: Prisma.BoolFilter<"IntegrationJob"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"IntegrationJob"> | Date | string;
    projectId?: Prisma.StringFilter<"IntegrationJob"> | string;
};
export type IntegrationJobCreateWithoutTargetEntityTypeInput = {
    id?: string;
    name: string;
    fieldMapping: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicalIdField: string;
    schedule?: string | null;
    enabled?: boolean;
    createdAt?: Date | string;
    project: Prisma.ProjectCreateNestedOneWithoutIntegrationJobsInput;
    dataSource: Prisma.DataSourceCreateNestedOneWithoutIntegrationJobsInput;
    executions?: Prisma.JobExecutionCreateNestedManyWithoutIntegrationJobInput;
};
export type IntegrationJobUncheckedCreateWithoutTargetEntityTypeInput = {
    id?: string;
    name: string;
    dataSourceId: string;
    fieldMapping: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicalIdField: string;
    schedule?: string | null;
    enabled?: boolean;
    createdAt?: Date | string;
    projectId: string;
    executions?: Prisma.JobExecutionUncheckedCreateNestedManyWithoutIntegrationJobInput;
};
export type IntegrationJobCreateOrConnectWithoutTargetEntityTypeInput = {
    where: Prisma.IntegrationJobWhereUniqueInput;
    create: Prisma.XOR<Prisma.IntegrationJobCreateWithoutTargetEntityTypeInput, Prisma.IntegrationJobUncheckedCreateWithoutTargetEntityTypeInput>;
};
export type IntegrationJobCreateManyTargetEntityTypeInputEnvelope = {
    data: Prisma.IntegrationJobCreateManyTargetEntityTypeInput | Prisma.IntegrationJobCreateManyTargetEntityTypeInput[];
    skipDuplicates?: boolean;
};
export type IntegrationJobUpsertWithWhereUniqueWithoutTargetEntityTypeInput = {
    where: Prisma.IntegrationJobWhereUniqueInput;
    update: Prisma.XOR<Prisma.IntegrationJobUpdateWithoutTargetEntityTypeInput, Prisma.IntegrationJobUncheckedUpdateWithoutTargetEntityTypeInput>;
    create: Prisma.XOR<Prisma.IntegrationJobCreateWithoutTargetEntityTypeInput, Prisma.IntegrationJobUncheckedCreateWithoutTargetEntityTypeInput>;
};
export type IntegrationJobUpdateWithWhereUniqueWithoutTargetEntityTypeInput = {
    where: Prisma.IntegrationJobWhereUniqueInput;
    data: Prisma.XOR<Prisma.IntegrationJobUpdateWithoutTargetEntityTypeInput, Prisma.IntegrationJobUncheckedUpdateWithoutTargetEntityTypeInput>;
};
export type IntegrationJobUpdateManyWithWhereWithoutTargetEntityTypeInput = {
    where: Prisma.IntegrationJobScalarWhereInput;
    data: Prisma.XOR<Prisma.IntegrationJobUpdateManyMutationInput, Prisma.IntegrationJobUncheckedUpdateManyWithoutTargetEntityTypeInput>;
};
export type IntegrationJobCreateWithoutDataSourceInput = {
    id?: string;
    name: string;
    fieldMapping: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicalIdField: string;
    schedule?: string | null;
    enabled?: boolean;
    createdAt?: Date | string;
    project: Prisma.ProjectCreateNestedOneWithoutIntegrationJobsInput;
    targetEntityType: Prisma.EntityTypeCreateNestedOneWithoutIntegrationJobsInput;
    executions?: Prisma.JobExecutionCreateNestedManyWithoutIntegrationJobInput;
};
export type IntegrationJobUncheckedCreateWithoutDataSourceInput = {
    id?: string;
    name: string;
    targetEntityTypeId: string;
    fieldMapping: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicalIdField: string;
    schedule?: string | null;
    enabled?: boolean;
    createdAt?: Date | string;
    projectId: string;
    executions?: Prisma.JobExecutionUncheckedCreateNestedManyWithoutIntegrationJobInput;
};
export type IntegrationJobCreateOrConnectWithoutDataSourceInput = {
    where: Prisma.IntegrationJobWhereUniqueInput;
    create: Prisma.XOR<Prisma.IntegrationJobCreateWithoutDataSourceInput, Prisma.IntegrationJobUncheckedCreateWithoutDataSourceInput>;
};
export type IntegrationJobCreateManyDataSourceInputEnvelope = {
    data: Prisma.IntegrationJobCreateManyDataSourceInput | Prisma.IntegrationJobCreateManyDataSourceInput[];
    skipDuplicates?: boolean;
};
export type IntegrationJobUpsertWithWhereUniqueWithoutDataSourceInput = {
    where: Prisma.IntegrationJobWhereUniqueInput;
    update: Prisma.XOR<Prisma.IntegrationJobUpdateWithoutDataSourceInput, Prisma.IntegrationJobUncheckedUpdateWithoutDataSourceInput>;
    create: Prisma.XOR<Prisma.IntegrationJobCreateWithoutDataSourceInput, Prisma.IntegrationJobUncheckedCreateWithoutDataSourceInput>;
};
export type IntegrationJobUpdateWithWhereUniqueWithoutDataSourceInput = {
    where: Prisma.IntegrationJobWhereUniqueInput;
    data: Prisma.XOR<Prisma.IntegrationJobUpdateWithoutDataSourceInput, Prisma.IntegrationJobUncheckedUpdateWithoutDataSourceInput>;
};
export type IntegrationJobUpdateManyWithWhereWithoutDataSourceInput = {
    where: Prisma.IntegrationJobScalarWhereInput;
    data: Prisma.XOR<Prisma.IntegrationJobUpdateManyMutationInput, Prisma.IntegrationJobUncheckedUpdateManyWithoutDataSourceInput>;
};
export type IntegrationJobCreateWithoutExecutionsInput = {
    id?: string;
    name: string;
    fieldMapping: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicalIdField: string;
    schedule?: string | null;
    enabled?: boolean;
    createdAt?: Date | string;
    project: Prisma.ProjectCreateNestedOneWithoutIntegrationJobsInput;
    dataSource: Prisma.DataSourceCreateNestedOneWithoutIntegrationJobsInput;
    targetEntityType: Prisma.EntityTypeCreateNestedOneWithoutIntegrationJobsInput;
};
export type IntegrationJobUncheckedCreateWithoutExecutionsInput = {
    id?: string;
    name: string;
    dataSourceId: string;
    targetEntityTypeId: string;
    fieldMapping: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicalIdField: string;
    schedule?: string | null;
    enabled?: boolean;
    createdAt?: Date | string;
    projectId: string;
};
export type IntegrationJobCreateOrConnectWithoutExecutionsInput = {
    where: Prisma.IntegrationJobWhereUniqueInput;
    create: Prisma.XOR<Prisma.IntegrationJobCreateWithoutExecutionsInput, Prisma.IntegrationJobUncheckedCreateWithoutExecutionsInput>;
};
export type IntegrationJobUpsertWithoutExecutionsInput = {
    update: Prisma.XOR<Prisma.IntegrationJobUpdateWithoutExecutionsInput, Prisma.IntegrationJobUncheckedUpdateWithoutExecutionsInput>;
    create: Prisma.XOR<Prisma.IntegrationJobCreateWithoutExecutionsInput, Prisma.IntegrationJobUncheckedCreateWithoutExecutionsInput>;
    where?: Prisma.IntegrationJobWhereInput;
};
export type IntegrationJobUpdateToOneWithWhereWithoutExecutionsInput = {
    where?: Prisma.IntegrationJobWhereInput;
    data: Prisma.XOR<Prisma.IntegrationJobUpdateWithoutExecutionsInput, Prisma.IntegrationJobUncheckedUpdateWithoutExecutionsInput>;
};
export type IntegrationJobUpdateWithoutExecutionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    fieldMapping?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicalIdField?: Prisma.StringFieldUpdateOperationsInput | string;
    schedule?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    project?: Prisma.ProjectUpdateOneRequiredWithoutIntegrationJobsNestedInput;
    dataSource?: Prisma.DataSourceUpdateOneRequiredWithoutIntegrationJobsNestedInput;
    targetEntityType?: Prisma.EntityTypeUpdateOneRequiredWithoutIntegrationJobsNestedInput;
};
export type IntegrationJobUncheckedUpdateWithoutExecutionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    dataSourceId?: Prisma.StringFieldUpdateOperationsInput | string;
    targetEntityTypeId?: Prisma.StringFieldUpdateOperationsInput | string;
    fieldMapping?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicalIdField?: Prisma.StringFieldUpdateOperationsInput | string;
    schedule?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    projectId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type IntegrationJobCreateManyProjectInput = {
    id?: string;
    name: string;
    dataSourceId: string;
    targetEntityTypeId: string;
    fieldMapping: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicalIdField: string;
    schedule?: string | null;
    enabled?: boolean;
    createdAt?: Date | string;
};
export type IntegrationJobUpdateWithoutProjectInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    fieldMapping?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicalIdField?: Prisma.StringFieldUpdateOperationsInput | string;
    schedule?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    dataSource?: Prisma.DataSourceUpdateOneRequiredWithoutIntegrationJobsNestedInput;
    targetEntityType?: Prisma.EntityTypeUpdateOneRequiredWithoutIntegrationJobsNestedInput;
    executions?: Prisma.JobExecutionUpdateManyWithoutIntegrationJobNestedInput;
};
export type IntegrationJobUncheckedUpdateWithoutProjectInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    dataSourceId?: Prisma.StringFieldUpdateOperationsInput | string;
    targetEntityTypeId?: Prisma.StringFieldUpdateOperationsInput | string;
    fieldMapping?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicalIdField?: Prisma.StringFieldUpdateOperationsInput | string;
    schedule?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    executions?: Prisma.JobExecutionUncheckedUpdateManyWithoutIntegrationJobNestedInput;
};
export type IntegrationJobUncheckedUpdateManyWithoutProjectInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    dataSourceId?: Prisma.StringFieldUpdateOperationsInput | string;
    targetEntityTypeId?: Prisma.StringFieldUpdateOperationsInput | string;
    fieldMapping?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicalIdField?: Prisma.StringFieldUpdateOperationsInput | string;
    schedule?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type IntegrationJobCreateManyTargetEntityTypeInput = {
    id?: string;
    name: string;
    dataSourceId: string;
    fieldMapping: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicalIdField: string;
    schedule?: string | null;
    enabled?: boolean;
    createdAt?: Date | string;
    projectId: string;
};
export type IntegrationJobUpdateWithoutTargetEntityTypeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    fieldMapping?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicalIdField?: Prisma.StringFieldUpdateOperationsInput | string;
    schedule?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    project?: Prisma.ProjectUpdateOneRequiredWithoutIntegrationJobsNestedInput;
    dataSource?: Prisma.DataSourceUpdateOneRequiredWithoutIntegrationJobsNestedInput;
    executions?: Prisma.JobExecutionUpdateManyWithoutIntegrationJobNestedInput;
};
export type IntegrationJobUncheckedUpdateWithoutTargetEntityTypeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    dataSourceId?: Prisma.StringFieldUpdateOperationsInput | string;
    fieldMapping?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicalIdField?: Prisma.StringFieldUpdateOperationsInput | string;
    schedule?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    projectId?: Prisma.StringFieldUpdateOperationsInput | string;
    executions?: Prisma.JobExecutionUncheckedUpdateManyWithoutIntegrationJobNestedInput;
};
export type IntegrationJobUncheckedUpdateManyWithoutTargetEntityTypeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    dataSourceId?: Prisma.StringFieldUpdateOperationsInput | string;
    fieldMapping?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicalIdField?: Prisma.StringFieldUpdateOperationsInput | string;
    schedule?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    projectId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type IntegrationJobCreateManyDataSourceInput = {
    id?: string;
    name: string;
    targetEntityTypeId: string;
    fieldMapping: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicalIdField: string;
    schedule?: string | null;
    enabled?: boolean;
    createdAt?: Date | string;
    projectId: string;
};
export type IntegrationJobUpdateWithoutDataSourceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    fieldMapping?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicalIdField?: Prisma.StringFieldUpdateOperationsInput | string;
    schedule?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    project?: Prisma.ProjectUpdateOneRequiredWithoutIntegrationJobsNestedInput;
    targetEntityType?: Prisma.EntityTypeUpdateOneRequiredWithoutIntegrationJobsNestedInput;
    executions?: Prisma.JobExecutionUpdateManyWithoutIntegrationJobNestedInput;
};
export type IntegrationJobUncheckedUpdateWithoutDataSourceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    targetEntityTypeId?: Prisma.StringFieldUpdateOperationsInput | string;
    fieldMapping?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicalIdField?: Prisma.StringFieldUpdateOperationsInput | string;
    schedule?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    projectId?: Prisma.StringFieldUpdateOperationsInput | string;
    executions?: Prisma.JobExecutionUncheckedUpdateManyWithoutIntegrationJobNestedInput;
};
export type IntegrationJobUncheckedUpdateManyWithoutDataSourceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    targetEntityTypeId?: Prisma.StringFieldUpdateOperationsInput | string;
    fieldMapping?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicalIdField?: Prisma.StringFieldUpdateOperationsInput | string;
    schedule?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    projectId?: Prisma.StringFieldUpdateOperationsInput | string;
};
/**
 * Count Type IntegrationJobCountOutputType
 */
export type IntegrationJobCountOutputType = {
    executions: number;
};
export type IntegrationJobCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    executions?: boolean | IntegrationJobCountOutputTypeCountExecutionsArgs;
};
/**
 * IntegrationJobCountOutputType without action
 */
export type IntegrationJobCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntegrationJobCountOutputType
     */
    select?: Prisma.IntegrationJobCountOutputTypeSelect<ExtArgs> | null;
};
/**
 * IntegrationJobCountOutputType without action
 */
export type IntegrationJobCountOutputTypeCountExecutionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.JobExecutionWhereInput;
};
export type IntegrationJobSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    dataSourceId?: boolean;
    targetEntityTypeId?: boolean;
    fieldMapping?: boolean;
    logicalIdField?: boolean;
    schedule?: boolean;
    enabled?: boolean;
    createdAt?: boolean;
    projectId?: boolean;
    project?: boolean | Prisma.ProjectDefaultArgs<ExtArgs>;
    dataSource?: boolean | Prisma.DataSourceDefaultArgs<ExtArgs>;
    targetEntityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
    executions?: boolean | Prisma.IntegrationJob$executionsArgs<ExtArgs>;
    _count?: boolean | Prisma.IntegrationJobCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["integrationJob"]>;
export type IntegrationJobSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    dataSourceId?: boolean;
    targetEntityTypeId?: boolean;
    fieldMapping?: boolean;
    logicalIdField?: boolean;
    schedule?: boolean;
    enabled?: boolean;
    createdAt?: boolean;
    projectId?: boolean;
    project?: boolean | Prisma.ProjectDefaultArgs<ExtArgs>;
    dataSource?: boolean | Prisma.DataSourceDefaultArgs<ExtArgs>;
    targetEntityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["integrationJob"]>;
export type IntegrationJobSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    dataSourceId?: boolean;
    targetEntityTypeId?: boolean;
    fieldMapping?: boolean;
    logicalIdField?: boolean;
    schedule?: boolean;
    enabled?: boolean;
    createdAt?: boolean;
    projectId?: boolean;
    project?: boolean | Prisma.ProjectDefaultArgs<ExtArgs>;
    dataSource?: boolean | Prisma.DataSourceDefaultArgs<ExtArgs>;
    targetEntityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["integrationJob"]>;
export type IntegrationJobSelectScalar = {
    id?: boolean;
    name?: boolean;
    dataSourceId?: boolean;
    targetEntityTypeId?: boolean;
    fieldMapping?: boolean;
    logicalIdField?: boolean;
    schedule?: boolean;
    enabled?: boolean;
    createdAt?: boolean;
    projectId?: boolean;
};
export type IntegrationJobOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "name" | "dataSourceId" | "targetEntityTypeId" | "fieldMapping" | "logicalIdField" | "schedule" | "enabled" | "createdAt" | "projectId", ExtArgs["result"]["integrationJob"]>;
export type IntegrationJobInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    project?: boolean | Prisma.ProjectDefaultArgs<ExtArgs>;
    dataSource?: boolean | Prisma.DataSourceDefaultArgs<ExtArgs>;
    targetEntityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
    executions?: boolean | Prisma.IntegrationJob$executionsArgs<ExtArgs>;
    _count?: boolean | Prisma.IntegrationJobCountOutputTypeDefaultArgs<ExtArgs>;
};
export type IntegrationJobIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    project?: boolean | Prisma.ProjectDefaultArgs<ExtArgs>;
    dataSource?: boolean | Prisma.DataSourceDefaultArgs<ExtArgs>;
    targetEntityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
};
export type IntegrationJobIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    project?: boolean | Prisma.ProjectDefaultArgs<ExtArgs>;
    dataSource?: boolean | Prisma.DataSourceDefaultArgs<ExtArgs>;
    targetEntityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
};
export type $IntegrationJobPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "IntegrationJob";
    objects: {
        project: Prisma.$ProjectPayload<ExtArgs>;
        dataSource: Prisma.$DataSourcePayload<ExtArgs>;
        targetEntityType: Prisma.$EntityTypePayload<ExtArgs>;
        executions: Prisma.$JobExecutionPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        name: string;
        dataSourceId: string;
        targetEntityTypeId: string;
        fieldMapping: runtime.JsonValue;
        logicalIdField: string;
        schedule: string | null;
        enabled: boolean;
        createdAt: Date;
        projectId: string;
    }, ExtArgs["result"]["integrationJob"]>;
    composites: {};
};
export type IntegrationJobGetPayload<S extends boolean | null | undefined | IntegrationJobDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$IntegrationJobPayload, S>;
export type IntegrationJobCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<IntegrationJobFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: IntegrationJobCountAggregateInputType | true;
};
export interface IntegrationJobDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['IntegrationJob'];
        meta: {
            name: 'IntegrationJob';
        };
    };
    /**
     * Find zero or one IntegrationJob that matches the filter.
     * @param {IntegrationJobFindUniqueArgs} args - Arguments to find a IntegrationJob
     * @example
     * // Get one IntegrationJob
     * const integrationJob = await prisma.integrationJob.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends IntegrationJobFindUniqueArgs>(args: Prisma.SelectSubset<T, IntegrationJobFindUniqueArgs<ExtArgs>>): Prisma.Prisma__IntegrationJobClient<runtime.Types.Result.GetResult<Prisma.$IntegrationJobPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one IntegrationJob that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {IntegrationJobFindUniqueOrThrowArgs} args - Arguments to find a IntegrationJob
     * @example
     * // Get one IntegrationJob
     * const integrationJob = await prisma.integrationJob.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends IntegrationJobFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, IntegrationJobFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__IntegrationJobClient<runtime.Types.Result.GetResult<Prisma.$IntegrationJobPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first IntegrationJob that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntegrationJobFindFirstArgs} args - Arguments to find a IntegrationJob
     * @example
     * // Get one IntegrationJob
     * const integrationJob = await prisma.integrationJob.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends IntegrationJobFindFirstArgs>(args?: Prisma.SelectSubset<T, IntegrationJobFindFirstArgs<ExtArgs>>): Prisma.Prisma__IntegrationJobClient<runtime.Types.Result.GetResult<Prisma.$IntegrationJobPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first IntegrationJob that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntegrationJobFindFirstOrThrowArgs} args - Arguments to find a IntegrationJob
     * @example
     * // Get one IntegrationJob
     * const integrationJob = await prisma.integrationJob.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends IntegrationJobFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, IntegrationJobFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__IntegrationJobClient<runtime.Types.Result.GetResult<Prisma.$IntegrationJobPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more IntegrationJobs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntegrationJobFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all IntegrationJobs
     * const integrationJobs = await prisma.integrationJob.findMany()
     *
     * // Get first 10 IntegrationJobs
     * const integrationJobs = await prisma.integrationJob.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const integrationJobWithIdOnly = await prisma.integrationJob.findMany({ select: { id: true } })
     *
     */
    findMany<T extends IntegrationJobFindManyArgs>(args?: Prisma.SelectSubset<T, IntegrationJobFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$IntegrationJobPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a IntegrationJob.
     * @param {IntegrationJobCreateArgs} args - Arguments to create a IntegrationJob.
     * @example
     * // Create one IntegrationJob
     * const IntegrationJob = await prisma.integrationJob.create({
     *   data: {
     *     // ... data to create a IntegrationJob
     *   }
     * })
     *
     */
    create<T extends IntegrationJobCreateArgs>(args: Prisma.SelectSubset<T, IntegrationJobCreateArgs<ExtArgs>>): Prisma.Prisma__IntegrationJobClient<runtime.Types.Result.GetResult<Prisma.$IntegrationJobPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many IntegrationJobs.
     * @param {IntegrationJobCreateManyArgs} args - Arguments to create many IntegrationJobs.
     * @example
     * // Create many IntegrationJobs
     * const integrationJob = await prisma.integrationJob.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends IntegrationJobCreateManyArgs>(args?: Prisma.SelectSubset<T, IntegrationJobCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many IntegrationJobs and returns the data saved in the database.
     * @param {IntegrationJobCreateManyAndReturnArgs} args - Arguments to create many IntegrationJobs.
     * @example
     * // Create many IntegrationJobs
     * const integrationJob = await prisma.integrationJob.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many IntegrationJobs and only return the `id`
     * const integrationJobWithIdOnly = await prisma.integrationJob.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends IntegrationJobCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, IntegrationJobCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$IntegrationJobPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a IntegrationJob.
     * @param {IntegrationJobDeleteArgs} args - Arguments to delete one IntegrationJob.
     * @example
     * // Delete one IntegrationJob
     * const IntegrationJob = await prisma.integrationJob.delete({
     *   where: {
     *     // ... filter to delete one IntegrationJob
     *   }
     * })
     *
     */
    delete<T extends IntegrationJobDeleteArgs>(args: Prisma.SelectSubset<T, IntegrationJobDeleteArgs<ExtArgs>>): Prisma.Prisma__IntegrationJobClient<runtime.Types.Result.GetResult<Prisma.$IntegrationJobPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one IntegrationJob.
     * @param {IntegrationJobUpdateArgs} args - Arguments to update one IntegrationJob.
     * @example
     * // Update one IntegrationJob
     * const integrationJob = await prisma.integrationJob.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends IntegrationJobUpdateArgs>(args: Prisma.SelectSubset<T, IntegrationJobUpdateArgs<ExtArgs>>): Prisma.Prisma__IntegrationJobClient<runtime.Types.Result.GetResult<Prisma.$IntegrationJobPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more IntegrationJobs.
     * @param {IntegrationJobDeleteManyArgs} args - Arguments to filter IntegrationJobs to delete.
     * @example
     * // Delete a few IntegrationJobs
     * const { count } = await prisma.integrationJob.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends IntegrationJobDeleteManyArgs>(args?: Prisma.SelectSubset<T, IntegrationJobDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more IntegrationJobs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntegrationJobUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many IntegrationJobs
     * const integrationJob = await prisma.integrationJob.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends IntegrationJobUpdateManyArgs>(args: Prisma.SelectSubset<T, IntegrationJobUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more IntegrationJobs and returns the data updated in the database.
     * @param {IntegrationJobUpdateManyAndReturnArgs} args - Arguments to update many IntegrationJobs.
     * @example
     * // Update many IntegrationJobs
     * const integrationJob = await prisma.integrationJob.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more IntegrationJobs and only return the `id`
     * const integrationJobWithIdOnly = await prisma.integrationJob.updateManyAndReturn({
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
    updateManyAndReturn<T extends IntegrationJobUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, IntegrationJobUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$IntegrationJobPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one IntegrationJob.
     * @param {IntegrationJobUpsertArgs} args - Arguments to update or create a IntegrationJob.
     * @example
     * // Update or create a IntegrationJob
     * const integrationJob = await prisma.integrationJob.upsert({
     *   create: {
     *     // ... data to create a IntegrationJob
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the IntegrationJob we want to update
     *   }
     * })
     */
    upsert<T extends IntegrationJobUpsertArgs>(args: Prisma.SelectSubset<T, IntegrationJobUpsertArgs<ExtArgs>>): Prisma.Prisma__IntegrationJobClient<runtime.Types.Result.GetResult<Prisma.$IntegrationJobPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of IntegrationJobs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntegrationJobCountArgs} args - Arguments to filter IntegrationJobs to count.
     * @example
     * // Count the number of IntegrationJobs
     * const count = await prisma.integrationJob.count({
     *   where: {
     *     // ... the filter for the IntegrationJobs we want to count
     *   }
     * })
    **/
    count<T extends IntegrationJobCountArgs>(args?: Prisma.Subset<T, IntegrationJobCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], IntegrationJobCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a IntegrationJob.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntegrationJobAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends IntegrationJobAggregateArgs>(args: Prisma.Subset<T, IntegrationJobAggregateArgs>): Prisma.PrismaPromise<GetIntegrationJobAggregateType<T>>;
    /**
     * Group by IntegrationJob.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntegrationJobGroupByArgs} args - Group by arguments.
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
    groupBy<T extends IntegrationJobGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: IntegrationJobGroupByArgs['orderBy'];
    } : {
        orderBy?: IntegrationJobGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, IntegrationJobGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetIntegrationJobGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the IntegrationJob model
     */
    readonly fields: IntegrationJobFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for IntegrationJob.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__IntegrationJobClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    project<T extends Prisma.ProjectDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ProjectDefaultArgs<ExtArgs>>): Prisma.Prisma__ProjectClient<runtime.Types.Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    dataSource<T extends Prisma.DataSourceDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.DataSourceDefaultArgs<ExtArgs>>): Prisma.Prisma__DataSourceClient<runtime.Types.Result.GetResult<Prisma.$DataSourcePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    targetEntityType<T extends Prisma.EntityTypeDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.EntityTypeDefaultArgs<ExtArgs>>): Prisma.Prisma__EntityTypeClient<runtime.Types.Result.GetResult<Prisma.$EntityTypePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    executions<T extends Prisma.IntegrationJob$executionsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.IntegrationJob$executionsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$JobExecutionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
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
 * Fields of the IntegrationJob model
 */
export interface IntegrationJobFieldRefs {
    readonly id: Prisma.FieldRef<"IntegrationJob", 'String'>;
    readonly name: Prisma.FieldRef<"IntegrationJob", 'String'>;
    readonly dataSourceId: Prisma.FieldRef<"IntegrationJob", 'String'>;
    readonly targetEntityTypeId: Prisma.FieldRef<"IntegrationJob", 'String'>;
    readonly fieldMapping: Prisma.FieldRef<"IntegrationJob", 'Json'>;
    readonly logicalIdField: Prisma.FieldRef<"IntegrationJob", 'String'>;
    readonly schedule: Prisma.FieldRef<"IntegrationJob", 'String'>;
    readonly enabled: Prisma.FieldRef<"IntegrationJob", 'Boolean'>;
    readonly createdAt: Prisma.FieldRef<"IntegrationJob", 'DateTime'>;
    readonly projectId: Prisma.FieldRef<"IntegrationJob", 'String'>;
}
/**
 * IntegrationJob findUnique
 */
export type IntegrationJobFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which IntegrationJob to fetch.
     */
    where: Prisma.IntegrationJobWhereUniqueInput;
};
/**
 * IntegrationJob findUniqueOrThrow
 */
export type IntegrationJobFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which IntegrationJob to fetch.
     */
    where: Prisma.IntegrationJobWhereUniqueInput;
};
/**
 * IntegrationJob findFirst
 */
export type IntegrationJobFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which IntegrationJob to fetch.
     */
    where?: Prisma.IntegrationJobWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of IntegrationJobs to fetch.
     */
    orderBy?: Prisma.IntegrationJobOrderByWithRelationInput | Prisma.IntegrationJobOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for IntegrationJobs.
     */
    cursor?: Prisma.IntegrationJobWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` IntegrationJobs from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` IntegrationJobs.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of IntegrationJobs.
     */
    distinct?: Prisma.IntegrationJobScalarFieldEnum | Prisma.IntegrationJobScalarFieldEnum[];
};
/**
 * IntegrationJob findFirstOrThrow
 */
export type IntegrationJobFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which IntegrationJob to fetch.
     */
    where?: Prisma.IntegrationJobWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of IntegrationJobs to fetch.
     */
    orderBy?: Prisma.IntegrationJobOrderByWithRelationInput | Prisma.IntegrationJobOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for IntegrationJobs.
     */
    cursor?: Prisma.IntegrationJobWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` IntegrationJobs from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` IntegrationJobs.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of IntegrationJobs.
     */
    distinct?: Prisma.IntegrationJobScalarFieldEnum | Prisma.IntegrationJobScalarFieldEnum[];
};
/**
 * IntegrationJob findMany
 */
export type IntegrationJobFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which IntegrationJobs to fetch.
     */
    where?: Prisma.IntegrationJobWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of IntegrationJobs to fetch.
     */
    orderBy?: Prisma.IntegrationJobOrderByWithRelationInput | Prisma.IntegrationJobOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing IntegrationJobs.
     */
    cursor?: Prisma.IntegrationJobWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` IntegrationJobs from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` IntegrationJobs.
     */
    skip?: number;
    distinct?: Prisma.IntegrationJobScalarFieldEnum | Prisma.IntegrationJobScalarFieldEnum[];
};
/**
 * IntegrationJob create
 */
export type IntegrationJobCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The data needed to create a IntegrationJob.
     */
    data: Prisma.XOR<Prisma.IntegrationJobCreateInput, Prisma.IntegrationJobUncheckedCreateInput>;
};
/**
 * IntegrationJob createMany
 */
export type IntegrationJobCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many IntegrationJobs.
     */
    data: Prisma.IntegrationJobCreateManyInput | Prisma.IntegrationJobCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * IntegrationJob createManyAndReturn
 */
export type IntegrationJobCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntegrationJob
     */
    select?: Prisma.IntegrationJobSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the IntegrationJob
     */
    omit?: Prisma.IntegrationJobOmit<ExtArgs> | null;
    /**
     * The data used to create many IntegrationJobs.
     */
    data: Prisma.IntegrationJobCreateManyInput | Prisma.IntegrationJobCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.IntegrationJobIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * IntegrationJob update
 */
export type IntegrationJobUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The data needed to update a IntegrationJob.
     */
    data: Prisma.XOR<Prisma.IntegrationJobUpdateInput, Prisma.IntegrationJobUncheckedUpdateInput>;
    /**
     * Choose, which IntegrationJob to update.
     */
    where: Prisma.IntegrationJobWhereUniqueInput;
};
/**
 * IntegrationJob updateMany
 */
export type IntegrationJobUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update IntegrationJobs.
     */
    data: Prisma.XOR<Prisma.IntegrationJobUpdateManyMutationInput, Prisma.IntegrationJobUncheckedUpdateManyInput>;
    /**
     * Filter which IntegrationJobs to update
     */
    where?: Prisma.IntegrationJobWhereInput;
    /**
     * Limit how many IntegrationJobs to update.
     */
    limit?: number;
};
/**
 * IntegrationJob updateManyAndReturn
 */
export type IntegrationJobUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntegrationJob
     */
    select?: Prisma.IntegrationJobSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the IntegrationJob
     */
    omit?: Prisma.IntegrationJobOmit<ExtArgs> | null;
    /**
     * The data used to update IntegrationJobs.
     */
    data: Prisma.XOR<Prisma.IntegrationJobUpdateManyMutationInput, Prisma.IntegrationJobUncheckedUpdateManyInput>;
    /**
     * Filter which IntegrationJobs to update
     */
    where?: Prisma.IntegrationJobWhereInput;
    /**
     * Limit how many IntegrationJobs to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.IntegrationJobIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * IntegrationJob upsert
 */
export type IntegrationJobUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The filter to search for the IntegrationJob to update in case it exists.
     */
    where: Prisma.IntegrationJobWhereUniqueInput;
    /**
     * In case the IntegrationJob found by the `where` argument doesn't exist, create a new IntegrationJob with this data.
     */
    create: Prisma.XOR<Prisma.IntegrationJobCreateInput, Prisma.IntegrationJobUncheckedCreateInput>;
    /**
     * In case the IntegrationJob was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.IntegrationJobUpdateInput, Prisma.IntegrationJobUncheckedUpdateInput>;
};
/**
 * IntegrationJob delete
 */
export type IntegrationJobDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter which IntegrationJob to delete.
     */
    where: Prisma.IntegrationJobWhereUniqueInput;
};
/**
 * IntegrationJob deleteMany
 */
export type IntegrationJobDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which IntegrationJobs to delete
     */
    where?: Prisma.IntegrationJobWhereInput;
    /**
     * Limit how many IntegrationJobs to delete.
     */
    limit?: number;
};
/**
 * IntegrationJob.executions
 */
export type IntegrationJob$executionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobExecution
     */
    select?: Prisma.JobExecutionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the JobExecution
     */
    omit?: Prisma.JobExecutionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.JobExecutionInclude<ExtArgs> | null;
    where?: Prisma.JobExecutionWhereInput;
    orderBy?: Prisma.JobExecutionOrderByWithRelationInput | Prisma.JobExecutionOrderByWithRelationInput[];
    cursor?: Prisma.JobExecutionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.JobExecutionScalarFieldEnum | Prisma.JobExecutionScalarFieldEnum[];
};
/**
 * IntegrationJob without action
 */
export type IntegrationJobDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
};
export {};
//# sourceMappingURL=IntegrationJob.d.ts.map