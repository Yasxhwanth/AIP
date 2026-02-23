import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
/**
 * Model ComputedMetricDefinition
 *
 */
export type ComputedMetricDefinitionModel = runtime.Types.Result.DefaultSelection<Prisma.$ComputedMetricDefinitionPayload>;
export type AggregateComputedMetricDefinition = {
    _count: ComputedMetricDefinitionCountAggregateOutputType | null;
    _min: ComputedMetricDefinitionMinAggregateOutputType | null;
    _max: ComputedMetricDefinitionMaxAggregateOutputType | null;
};
export type ComputedMetricDefinitionMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    entityTypeId: string | null;
    expression: string | null;
    unit: string | null;
    enabled: boolean | null;
    createdAt: Date | null;
};
export type ComputedMetricDefinitionMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    entityTypeId: string | null;
    expression: string | null;
    unit: string | null;
    enabled: boolean | null;
    createdAt: Date | null;
};
export type ComputedMetricDefinitionCountAggregateOutputType = {
    id: number;
    name: number;
    entityTypeId: number;
    expression: number;
    unit: number;
    enabled: number;
    createdAt: number;
    _all: number;
};
export type ComputedMetricDefinitionMinAggregateInputType = {
    id?: true;
    name?: true;
    entityTypeId?: true;
    expression?: true;
    unit?: true;
    enabled?: true;
    createdAt?: true;
};
export type ComputedMetricDefinitionMaxAggregateInputType = {
    id?: true;
    name?: true;
    entityTypeId?: true;
    expression?: true;
    unit?: true;
    enabled?: true;
    createdAt?: true;
};
export type ComputedMetricDefinitionCountAggregateInputType = {
    id?: true;
    name?: true;
    entityTypeId?: true;
    expression?: true;
    unit?: true;
    enabled?: true;
    createdAt?: true;
    _all?: true;
};
export type ComputedMetricDefinitionAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which ComputedMetricDefinition to aggregate.
     */
    where?: Prisma.ComputedMetricDefinitionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ComputedMetricDefinitions to fetch.
     */
    orderBy?: Prisma.ComputedMetricDefinitionOrderByWithRelationInput | Prisma.ComputedMetricDefinitionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.ComputedMetricDefinitionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ComputedMetricDefinitions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ComputedMetricDefinitions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned ComputedMetricDefinitions
    **/
    _count?: true | ComputedMetricDefinitionCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: ComputedMetricDefinitionMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: ComputedMetricDefinitionMaxAggregateInputType;
};
export type GetComputedMetricDefinitionAggregateType<T extends ComputedMetricDefinitionAggregateArgs> = {
    [P in keyof T & keyof AggregateComputedMetricDefinition]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateComputedMetricDefinition[P]> : Prisma.GetScalarType<T[P], AggregateComputedMetricDefinition[P]>;
};
export type ComputedMetricDefinitionGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ComputedMetricDefinitionWhereInput;
    orderBy?: Prisma.ComputedMetricDefinitionOrderByWithAggregationInput | Prisma.ComputedMetricDefinitionOrderByWithAggregationInput[];
    by: Prisma.ComputedMetricDefinitionScalarFieldEnum[] | Prisma.ComputedMetricDefinitionScalarFieldEnum;
    having?: Prisma.ComputedMetricDefinitionScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ComputedMetricDefinitionCountAggregateInputType | true;
    _min?: ComputedMetricDefinitionMinAggregateInputType;
    _max?: ComputedMetricDefinitionMaxAggregateInputType;
};
export type ComputedMetricDefinitionGroupByOutputType = {
    id: string;
    name: string;
    entityTypeId: string;
    expression: string;
    unit: string | null;
    enabled: boolean;
    createdAt: Date;
    _count: ComputedMetricDefinitionCountAggregateOutputType | null;
    _min: ComputedMetricDefinitionMinAggregateOutputType | null;
    _max: ComputedMetricDefinitionMaxAggregateOutputType | null;
};
type GetComputedMetricDefinitionGroupByPayload<T extends ComputedMetricDefinitionGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ComputedMetricDefinitionGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ComputedMetricDefinitionGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ComputedMetricDefinitionGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ComputedMetricDefinitionGroupByOutputType[P]>;
}>>;
export type ComputedMetricDefinitionWhereInput = {
    AND?: Prisma.ComputedMetricDefinitionWhereInput | Prisma.ComputedMetricDefinitionWhereInput[];
    OR?: Prisma.ComputedMetricDefinitionWhereInput[];
    NOT?: Prisma.ComputedMetricDefinitionWhereInput | Prisma.ComputedMetricDefinitionWhereInput[];
    id?: Prisma.StringFilter<"ComputedMetricDefinition"> | string;
    name?: Prisma.StringFilter<"ComputedMetricDefinition"> | string;
    entityTypeId?: Prisma.StringFilter<"ComputedMetricDefinition"> | string;
    expression?: Prisma.StringFilter<"ComputedMetricDefinition"> | string;
    unit?: Prisma.StringNullableFilter<"ComputedMetricDefinition"> | string | null;
    enabled?: Prisma.BoolFilter<"ComputedMetricDefinition"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"ComputedMetricDefinition"> | Date | string;
    entityType?: Prisma.XOR<Prisma.EntityTypeScalarRelationFilter, Prisma.EntityTypeWhereInput>;
};
export type ComputedMetricDefinitionOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    entityTypeId?: Prisma.SortOrder;
    expression?: Prisma.SortOrder;
    unit?: Prisma.SortOrderInput | Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    entityType?: Prisma.EntityTypeOrderByWithRelationInput;
};
export type ComputedMetricDefinitionWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    entityTypeId_name?: Prisma.ComputedMetricDefinitionEntityTypeIdNameCompoundUniqueInput;
    AND?: Prisma.ComputedMetricDefinitionWhereInput | Prisma.ComputedMetricDefinitionWhereInput[];
    OR?: Prisma.ComputedMetricDefinitionWhereInput[];
    NOT?: Prisma.ComputedMetricDefinitionWhereInput | Prisma.ComputedMetricDefinitionWhereInput[];
    name?: Prisma.StringFilter<"ComputedMetricDefinition"> | string;
    entityTypeId?: Prisma.StringFilter<"ComputedMetricDefinition"> | string;
    expression?: Prisma.StringFilter<"ComputedMetricDefinition"> | string;
    unit?: Prisma.StringNullableFilter<"ComputedMetricDefinition"> | string | null;
    enabled?: Prisma.BoolFilter<"ComputedMetricDefinition"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"ComputedMetricDefinition"> | Date | string;
    entityType?: Prisma.XOR<Prisma.EntityTypeScalarRelationFilter, Prisma.EntityTypeWhereInput>;
}, "id" | "entityTypeId_name">;
export type ComputedMetricDefinitionOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    entityTypeId?: Prisma.SortOrder;
    expression?: Prisma.SortOrder;
    unit?: Prisma.SortOrderInput | Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.ComputedMetricDefinitionCountOrderByAggregateInput;
    _max?: Prisma.ComputedMetricDefinitionMaxOrderByAggregateInput;
    _min?: Prisma.ComputedMetricDefinitionMinOrderByAggregateInput;
};
export type ComputedMetricDefinitionScalarWhereWithAggregatesInput = {
    AND?: Prisma.ComputedMetricDefinitionScalarWhereWithAggregatesInput | Prisma.ComputedMetricDefinitionScalarWhereWithAggregatesInput[];
    OR?: Prisma.ComputedMetricDefinitionScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ComputedMetricDefinitionScalarWhereWithAggregatesInput | Prisma.ComputedMetricDefinitionScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"ComputedMetricDefinition"> | string;
    name?: Prisma.StringWithAggregatesFilter<"ComputedMetricDefinition"> | string;
    entityTypeId?: Prisma.StringWithAggregatesFilter<"ComputedMetricDefinition"> | string;
    expression?: Prisma.StringWithAggregatesFilter<"ComputedMetricDefinition"> | string;
    unit?: Prisma.StringNullableWithAggregatesFilter<"ComputedMetricDefinition"> | string | null;
    enabled?: Prisma.BoolWithAggregatesFilter<"ComputedMetricDefinition"> | boolean;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"ComputedMetricDefinition"> | Date | string;
};
export type ComputedMetricDefinitionCreateInput = {
    id?: string;
    name: string;
    expression: string;
    unit?: string | null;
    enabled?: boolean;
    createdAt?: Date | string;
    entityType: Prisma.EntityTypeCreateNestedOneWithoutComputedMetricsInput;
};
export type ComputedMetricDefinitionUncheckedCreateInput = {
    id?: string;
    name: string;
    entityTypeId: string;
    expression: string;
    unit?: string | null;
    enabled?: boolean;
    createdAt?: Date | string;
};
export type ComputedMetricDefinitionUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    expression?: Prisma.StringFieldUpdateOperationsInput | string;
    unit?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    entityType?: Prisma.EntityTypeUpdateOneRequiredWithoutComputedMetricsNestedInput;
};
export type ComputedMetricDefinitionUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    entityTypeId?: Prisma.StringFieldUpdateOperationsInput | string;
    expression?: Prisma.StringFieldUpdateOperationsInput | string;
    unit?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ComputedMetricDefinitionCreateManyInput = {
    id?: string;
    name: string;
    entityTypeId: string;
    expression: string;
    unit?: string | null;
    enabled?: boolean;
    createdAt?: Date | string;
};
export type ComputedMetricDefinitionUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    expression?: Prisma.StringFieldUpdateOperationsInput | string;
    unit?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ComputedMetricDefinitionUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    entityTypeId?: Prisma.StringFieldUpdateOperationsInput | string;
    expression?: Prisma.StringFieldUpdateOperationsInput | string;
    unit?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ComputedMetricDefinitionListRelationFilter = {
    every?: Prisma.ComputedMetricDefinitionWhereInput;
    some?: Prisma.ComputedMetricDefinitionWhereInput;
    none?: Prisma.ComputedMetricDefinitionWhereInput;
};
export type ComputedMetricDefinitionOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ComputedMetricDefinitionEntityTypeIdNameCompoundUniqueInput = {
    entityTypeId: string;
    name: string;
};
export type ComputedMetricDefinitionCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    entityTypeId?: Prisma.SortOrder;
    expression?: Prisma.SortOrder;
    unit?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type ComputedMetricDefinitionMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    entityTypeId?: Prisma.SortOrder;
    expression?: Prisma.SortOrder;
    unit?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type ComputedMetricDefinitionMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    entityTypeId?: Prisma.SortOrder;
    expression?: Prisma.SortOrder;
    unit?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type ComputedMetricDefinitionCreateNestedManyWithoutEntityTypeInput = {
    create?: Prisma.XOR<Prisma.ComputedMetricDefinitionCreateWithoutEntityTypeInput, Prisma.ComputedMetricDefinitionUncheckedCreateWithoutEntityTypeInput> | Prisma.ComputedMetricDefinitionCreateWithoutEntityTypeInput[] | Prisma.ComputedMetricDefinitionUncheckedCreateWithoutEntityTypeInput[];
    connectOrCreate?: Prisma.ComputedMetricDefinitionCreateOrConnectWithoutEntityTypeInput | Prisma.ComputedMetricDefinitionCreateOrConnectWithoutEntityTypeInput[];
    createMany?: Prisma.ComputedMetricDefinitionCreateManyEntityTypeInputEnvelope;
    connect?: Prisma.ComputedMetricDefinitionWhereUniqueInput | Prisma.ComputedMetricDefinitionWhereUniqueInput[];
};
export type ComputedMetricDefinitionUncheckedCreateNestedManyWithoutEntityTypeInput = {
    create?: Prisma.XOR<Prisma.ComputedMetricDefinitionCreateWithoutEntityTypeInput, Prisma.ComputedMetricDefinitionUncheckedCreateWithoutEntityTypeInput> | Prisma.ComputedMetricDefinitionCreateWithoutEntityTypeInput[] | Prisma.ComputedMetricDefinitionUncheckedCreateWithoutEntityTypeInput[];
    connectOrCreate?: Prisma.ComputedMetricDefinitionCreateOrConnectWithoutEntityTypeInput | Prisma.ComputedMetricDefinitionCreateOrConnectWithoutEntityTypeInput[];
    createMany?: Prisma.ComputedMetricDefinitionCreateManyEntityTypeInputEnvelope;
    connect?: Prisma.ComputedMetricDefinitionWhereUniqueInput | Prisma.ComputedMetricDefinitionWhereUniqueInput[];
};
export type ComputedMetricDefinitionUpdateManyWithoutEntityTypeNestedInput = {
    create?: Prisma.XOR<Prisma.ComputedMetricDefinitionCreateWithoutEntityTypeInput, Prisma.ComputedMetricDefinitionUncheckedCreateWithoutEntityTypeInput> | Prisma.ComputedMetricDefinitionCreateWithoutEntityTypeInput[] | Prisma.ComputedMetricDefinitionUncheckedCreateWithoutEntityTypeInput[];
    connectOrCreate?: Prisma.ComputedMetricDefinitionCreateOrConnectWithoutEntityTypeInput | Prisma.ComputedMetricDefinitionCreateOrConnectWithoutEntityTypeInput[];
    upsert?: Prisma.ComputedMetricDefinitionUpsertWithWhereUniqueWithoutEntityTypeInput | Prisma.ComputedMetricDefinitionUpsertWithWhereUniqueWithoutEntityTypeInput[];
    createMany?: Prisma.ComputedMetricDefinitionCreateManyEntityTypeInputEnvelope;
    set?: Prisma.ComputedMetricDefinitionWhereUniqueInput | Prisma.ComputedMetricDefinitionWhereUniqueInput[];
    disconnect?: Prisma.ComputedMetricDefinitionWhereUniqueInput | Prisma.ComputedMetricDefinitionWhereUniqueInput[];
    delete?: Prisma.ComputedMetricDefinitionWhereUniqueInput | Prisma.ComputedMetricDefinitionWhereUniqueInput[];
    connect?: Prisma.ComputedMetricDefinitionWhereUniqueInput | Prisma.ComputedMetricDefinitionWhereUniqueInput[];
    update?: Prisma.ComputedMetricDefinitionUpdateWithWhereUniqueWithoutEntityTypeInput | Prisma.ComputedMetricDefinitionUpdateWithWhereUniqueWithoutEntityTypeInput[];
    updateMany?: Prisma.ComputedMetricDefinitionUpdateManyWithWhereWithoutEntityTypeInput | Prisma.ComputedMetricDefinitionUpdateManyWithWhereWithoutEntityTypeInput[];
    deleteMany?: Prisma.ComputedMetricDefinitionScalarWhereInput | Prisma.ComputedMetricDefinitionScalarWhereInput[];
};
export type ComputedMetricDefinitionUncheckedUpdateManyWithoutEntityTypeNestedInput = {
    create?: Prisma.XOR<Prisma.ComputedMetricDefinitionCreateWithoutEntityTypeInput, Prisma.ComputedMetricDefinitionUncheckedCreateWithoutEntityTypeInput> | Prisma.ComputedMetricDefinitionCreateWithoutEntityTypeInput[] | Prisma.ComputedMetricDefinitionUncheckedCreateWithoutEntityTypeInput[];
    connectOrCreate?: Prisma.ComputedMetricDefinitionCreateOrConnectWithoutEntityTypeInput | Prisma.ComputedMetricDefinitionCreateOrConnectWithoutEntityTypeInput[];
    upsert?: Prisma.ComputedMetricDefinitionUpsertWithWhereUniqueWithoutEntityTypeInput | Prisma.ComputedMetricDefinitionUpsertWithWhereUniqueWithoutEntityTypeInput[];
    createMany?: Prisma.ComputedMetricDefinitionCreateManyEntityTypeInputEnvelope;
    set?: Prisma.ComputedMetricDefinitionWhereUniqueInput | Prisma.ComputedMetricDefinitionWhereUniqueInput[];
    disconnect?: Prisma.ComputedMetricDefinitionWhereUniqueInput | Prisma.ComputedMetricDefinitionWhereUniqueInput[];
    delete?: Prisma.ComputedMetricDefinitionWhereUniqueInput | Prisma.ComputedMetricDefinitionWhereUniqueInput[];
    connect?: Prisma.ComputedMetricDefinitionWhereUniqueInput | Prisma.ComputedMetricDefinitionWhereUniqueInput[];
    update?: Prisma.ComputedMetricDefinitionUpdateWithWhereUniqueWithoutEntityTypeInput | Prisma.ComputedMetricDefinitionUpdateWithWhereUniqueWithoutEntityTypeInput[];
    updateMany?: Prisma.ComputedMetricDefinitionUpdateManyWithWhereWithoutEntityTypeInput | Prisma.ComputedMetricDefinitionUpdateManyWithWhereWithoutEntityTypeInput[];
    deleteMany?: Prisma.ComputedMetricDefinitionScalarWhereInput | Prisma.ComputedMetricDefinitionScalarWhereInput[];
};
export type ComputedMetricDefinitionCreateWithoutEntityTypeInput = {
    id?: string;
    name: string;
    expression: string;
    unit?: string | null;
    enabled?: boolean;
    createdAt?: Date | string;
};
export type ComputedMetricDefinitionUncheckedCreateWithoutEntityTypeInput = {
    id?: string;
    name: string;
    expression: string;
    unit?: string | null;
    enabled?: boolean;
    createdAt?: Date | string;
};
export type ComputedMetricDefinitionCreateOrConnectWithoutEntityTypeInput = {
    where: Prisma.ComputedMetricDefinitionWhereUniqueInput;
    create: Prisma.XOR<Prisma.ComputedMetricDefinitionCreateWithoutEntityTypeInput, Prisma.ComputedMetricDefinitionUncheckedCreateWithoutEntityTypeInput>;
};
export type ComputedMetricDefinitionCreateManyEntityTypeInputEnvelope = {
    data: Prisma.ComputedMetricDefinitionCreateManyEntityTypeInput | Prisma.ComputedMetricDefinitionCreateManyEntityTypeInput[];
    skipDuplicates?: boolean;
};
export type ComputedMetricDefinitionUpsertWithWhereUniqueWithoutEntityTypeInput = {
    where: Prisma.ComputedMetricDefinitionWhereUniqueInput;
    update: Prisma.XOR<Prisma.ComputedMetricDefinitionUpdateWithoutEntityTypeInput, Prisma.ComputedMetricDefinitionUncheckedUpdateWithoutEntityTypeInput>;
    create: Prisma.XOR<Prisma.ComputedMetricDefinitionCreateWithoutEntityTypeInput, Prisma.ComputedMetricDefinitionUncheckedCreateWithoutEntityTypeInput>;
};
export type ComputedMetricDefinitionUpdateWithWhereUniqueWithoutEntityTypeInput = {
    where: Prisma.ComputedMetricDefinitionWhereUniqueInput;
    data: Prisma.XOR<Prisma.ComputedMetricDefinitionUpdateWithoutEntityTypeInput, Prisma.ComputedMetricDefinitionUncheckedUpdateWithoutEntityTypeInput>;
};
export type ComputedMetricDefinitionUpdateManyWithWhereWithoutEntityTypeInput = {
    where: Prisma.ComputedMetricDefinitionScalarWhereInput;
    data: Prisma.XOR<Prisma.ComputedMetricDefinitionUpdateManyMutationInput, Prisma.ComputedMetricDefinitionUncheckedUpdateManyWithoutEntityTypeInput>;
};
export type ComputedMetricDefinitionScalarWhereInput = {
    AND?: Prisma.ComputedMetricDefinitionScalarWhereInput | Prisma.ComputedMetricDefinitionScalarWhereInput[];
    OR?: Prisma.ComputedMetricDefinitionScalarWhereInput[];
    NOT?: Prisma.ComputedMetricDefinitionScalarWhereInput | Prisma.ComputedMetricDefinitionScalarWhereInput[];
    id?: Prisma.StringFilter<"ComputedMetricDefinition"> | string;
    name?: Prisma.StringFilter<"ComputedMetricDefinition"> | string;
    entityTypeId?: Prisma.StringFilter<"ComputedMetricDefinition"> | string;
    expression?: Prisma.StringFilter<"ComputedMetricDefinition"> | string;
    unit?: Prisma.StringNullableFilter<"ComputedMetricDefinition"> | string | null;
    enabled?: Prisma.BoolFilter<"ComputedMetricDefinition"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"ComputedMetricDefinition"> | Date | string;
};
export type ComputedMetricDefinitionCreateManyEntityTypeInput = {
    id?: string;
    name: string;
    expression: string;
    unit?: string | null;
    enabled?: boolean;
    createdAt?: Date | string;
};
export type ComputedMetricDefinitionUpdateWithoutEntityTypeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    expression?: Prisma.StringFieldUpdateOperationsInput | string;
    unit?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ComputedMetricDefinitionUncheckedUpdateWithoutEntityTypeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    expression?: Prisma.StringFieldUpdateOperationsInput | string;
    unit?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ComputedMetricDefinitionUncheckedUpdateManyWithoutEntityTypeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    expression?: Prisma.StringFieldUpdateOperationsInput | string;
    unit?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ComputedMetricDefinitionSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    entityTypeId?: boolean;
    expression?: boolean;
    unit?: boolean;
    enabled?: boolean;
    createdAt?: boolean;
    entityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["computedMetricDefinition"]>;
export type ComputedMetricDefinitionSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    entityTypeId?: boolean;
    expression?: boolean;
    unit?: boolean;
    enabled?: boolean;
    createdAt?: boolean;
    entityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["computedMetricDefinition"]>;
export type ComputedMetricDefinitionSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    entityTypeId?: boolean;
    expression?: boolean;
    unit?: boolean;
    enabled?: boolean;
    createdAt?: boolean;
    entityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["computedMetricDefinition"]>;
export type ComputedMetricDefinitionSelectScalar = {
    id?: boolean;
    name?: boolean;
    entityTypeId?: boolean;
    expression?: boolean;
    unit?: boolean;
    enabled?: boolean;
    createdAt?: boolean;
};
export type ComputedMetricDefinitionOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "name" | "entityTypeId" | "expression" | "unit" | "enabled" | "createdAt", ExtArgs["result"]["computedMetricDefinition"]>;
export type ComputedMetricDefinitionInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    entityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
};
export type ComputedMetricDefinitionIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    entityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
};
export type ComputedMetricDefinitionIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    entityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
};
export type $ComputedMetricDefinitionPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ComputedMetricDefinition";
    objects: {
        entityType: Prisma.$EntityTypePayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        name: string;
        entityTypeId: string;
        expression: string;
        unit: string | null;
        enabled: boolean;
        createdAt: Date;
    }, ExtArgs["result"]["computedMetricDefinition"]>;
    composites: {};
};
export type ComputedMetricDefinitionGetPayload<S extends boolean | null | undefined | ComputedMetricDefinitionDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ComputedMetricDefinitionPayload, S>;
export type ComputedMetricDefinitionCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ComputedMetricDefinitionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ComputedMetricDefinitionCountAggregateInputType | true;
};
export interface ComputedMetricDefinitionDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ComputedMetricDefinition'];
        meta: {
            name: 'ComputedMetricDefinition';
        };
    };
    /**
     * Find zero or one ComputedMetricDefinition that matches the filter.
     * @param {ComputedMetricDefinitionFindUniqueArgs} args - Arguments to find a ComputedMetricDefinition
     * @example
     * // Get one ComputedMetricDefinition
     * const computedMetricDefinition = await prisma.computedMetricDefinition.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ComputedMetricDefinitionFindUniqueArgs>(args: Prisma.SelectSubset<T, ComputedMetricDefinitionFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ComputedMetricDefinitionClient<runtime.Types.Result.GetResult<Prisma.$ComputedMetricDefinitionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one ComputedMetricDefinition that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ComputedMetricDefinitionFindUniqueOrThrowArgs} args - Arguments to find a ComputedMetricDefinition
     * @example
     * // Get one ComputedMetricDefinition
     * const computedMetricDefinition = await prisma.computedMetricDefinition.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ComputedMetricDefinitionFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ComputedMetricDefinitionFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ComputedMetricDefinitionClient<runtime.Types.Result.GetResult<Prisma.$ComputedMetricDefinitionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first ComputedMetricDefinition that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ComputedMetricDefinitionFindFirstArgs} args - Arguments to find a ComputedMetricDefinition
     * @example
     * // Get one ComputedMetricDefinition
     * const computedMetricDefinition = await prisma.computedMetricDefinition.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ComputedMetricDefinitionFindFirstArgs>(args?: Prisma.SelectSubset<T, ComputedMetricDefinitionFindFirstArgs<ExtArgs>>): Prisma.Prisma__ComputedMetricDefinitionClient<runtime.Types.Result.GetResult<Prisma.$ComputedMetricDefinitionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first ComputedMetricDefinition that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ComputedMetricDefinitionFindFirstOrThrowArgs} args - Arguments to find a ComputedMetricDefinition
     * @example
     * // Get one ComputedMetricDefinition
     * const computedMetricDefinition = await prisma.computedMetricDefinition.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ComputedMetricDefinitionFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ComputedMetricDefinitionFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ComputedMetricDefinitionClient<runtime.Types.Result.GetResult<Prisma.$ComputedMetricDefinitionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more ComputedMetricDefinitions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ComputedMetricDefinitionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ComputedMetricDefinitions
     * const computedMetricDefinitions = await prisma.computedMetricDefinition.findMany()
     *
     * // Get first 10 ComputedMetricDefinitions
     * const computedMetricDefinitions = await prisma.computedMetricDefinition.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const computedMetricDefinitionWithIdOnly = await prisma.computedMetricDefinition.findMany({ select: { id: true } })
     *
     */
    findMany<T extends ComputedMetricDefinitionFindManyArgs>(args?: Prisma.SelectSubset<T, ComputedMetricDefinitionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ComputedMetricDefinitionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a ComputedMetricDefinition.
     * @param {ComputedMetricDefinitionCreateArgs} args - Arguments to create a ComputedMetricDefinition.
     * @example
     * // Create one ComputedMetricDefinition
     * const ComputedMetricDefinition = await prisma.computedMetricDefinition.create({
     *   data: {
     *     // ... data to create a ComputedMetricDefinition
     *   }
     * })
     *
     */
    create<T extends ComputedMetricDefinitionCreateArgs>(args: Prisma.SelectSubset<T, ComputedMetricDefinitionCreateArgs<ExtArgs>>): Prisma.Prisma__ComputedMetricDefinitionClient<runtime.Types.Result.GetResult<Prisma.$ComputedMetricDefinitionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many ComputedMetricDefinitions.
     * @param {ComputedMetricDefinitionCreateManyArgs} args - Arguments to create many ComputedMetricDefinitions.
     * @example
     * // Create many ComputedMetricDefinitions
     * const computedMetricDefinition = await prisma.computedMetricDefinition.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends ComputedMetricDefinitionCreateManyArgs>(args?: Prisma.SelectSubset<T, ComputedMetricDefinitionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many ComputedMetricDefinitions and returns the data saved in the database.
     * @param {ComputedMetricDefinitionCreateManyAndReturnArgs} args - Arguments to create many ComputedMetricDefinitions.
     * @example
     * // Create many ComputedMetricDefinitions
     * const computedMetricDefinition = await prisma.computedMetricDefinition.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many ComputedMetricDefinitions and only return the `id`
     * const computedMetricDefinitionWithIdOnly = await prisma.computedMetricDefinition.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends ComputedMetricDefinitionCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ComputedMetricDefinitionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ComputedMetricDefinitionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a ComputedMetricDefinition.
     * @param {ComputedMetricDefinitionDeleteArgs} args - Arguments to delete one ComputedMetricDefinition.
     * @example
     * // Delete one ComputedMetricDefinition
     * const ComputedMetricDefinition = await prisma.computedMetricDefinition.delete({
     *   where: {
     *     // ... filter to delete one ComputedMetricDefinition
     *   }
     * })
     *
     */
    delete<T extends ComputedMetricDefinitionDeleteArgs>(args: Prisma.SelectSubset<T, ComputedMetricDefinitionDeleteArgs<ExtArgs>>): Prisma.Prisma__ComputedMetricDefinitionClient<runtime.Types.Result.GetResult<Prisma.$ComputedMetricDefinitionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one ComputedMetricDefinition.
     * @param {ComputedMetricDefinitionUpdateArgs} args - Arguments to update one ComputedMetricDefinition.
     * @example
     * // Update one ComputedMetricDefinition
     * const computedMetricDefinition = await prisma.computedMetricDefinition.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends ComputedMetricDefinitionUpdateArgs>(args: Prisma.SelectSubset<T, ComputedMetricDefinitionUpdateArgs<ExtArgs>>): Prisma.Prisma__ComputedMetricDefinitionClient<runtime.Types.Result.GetResult<Prisma.$ComputedMetricDefinitionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more ComputedMetricDefinitions.
     * @param {ComputedMetricDefinitionDeleteManyArgs} args - Arguments to filter ComputedMetricDefinitions to delete.
     * @example
     * // Delete a few ComputedMetricDefinitions
     * const { count } = await prisma.computedMetricDefinition.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends ComputedMetricDefinitionDeleteManyArgs>(args?: Prisma.SelectSubset<T, ComputedMetricDefinitionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more ComputedMetricDefinitions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ComputedMetricDefinitionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ComputedMetricDefinitions
     * const computedMetricDefinition = await prisma.computedMetricDefinition.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends ComputedMetricDefinitionUpdateManyArgs>(args: Prisma.SelectSubset<T, ComputedMetricDefinitionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more ComputedMetricDefinitions and returns the data updated in the database.
     * @param {ComputedMetricDefinitionUpdateManyAndReturnArgs} args - Arguments to update many ComputedMetricDefinitions.
     * @example
     * // Update many ComputedMetricDefinitions
     * const computedMetricDefinition = await prisma.computedMetricDefinition.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more ComputedMetricDefinitions and only return the `id`
     * const computedMetricDefinitionWithIdOnly = await prisma.computedMetricDefinition.updateManyAndReturn({
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
    updateManyAndReturn<T extends ComputedMetricDefinitionUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ComputedMetricDefinitionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ComputedMetricDefinitionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one ComputedMetricDefinition.
     * @param {ComputedMetricDefinitionUpsertArgs} args - Arguments to update or create a ComputedMetricDefinition.
     * @example
     * // Update or create a ComputedMetricDefinition
     * const computedMetricDefinition = await prisma.computedMetricDefinition.upsert({
     *   create: {
     *     // ... data to create a ComputedMetricDefinition
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ComputedMetricDefinition we want to update
     *   }
     * })
     */
    upsert<T extends ComputedMetricDefinitionUpsertArgs>(args: Prisma.SelectSubset<T, ComputedMetricDefinitionUpsertArgs<ExtArgs>>): Prisma.Prisma__ComputedMetricDefinitionClient<runtime.Types.Result.GetResult<Prisma.$ComputedMetricDefinitionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of ComputedMetricDefinitions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ComputedMetricDefinitionCountArgs} args - Arguments to filter ComputedMetricDefinitions to count.
     * @example
     * // Count the number of ComputedMetricDefinitions
     * const count = await prisma.computedMetricDefinition.count({
     *   where: {
     *     // ... the filter for the ComputedMetricDefinitions we want to count
     *   }
     * })
    **/
    count<T extends ComputedMetricDefinitionCountArgs>(args?: Prisma.Subset<T, ComputedMetricDefinitionCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ComputedMetricDefinitionCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a ComputedMetricDefinition.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ComputedMetricDefinitionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ComputedMetricDefinitionAggregateArgs>(args: Prisma.Subset<T, ComputedMetricDefinitionAggregateArgs>): Prisma.PrismaPromise<GetComputedMetricDefinitionAggregateType<T>>;
    /**
     * Group by ComputedMetricDefinition.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ComputedMetricDefinitionGroupByArgs} args - Group by arguments.
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
    groupBy<T extends ComputedMetricDefinitionGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ComputedMetricDefinitionGroupByArgs['orderBy'];
    } : {
        orderBy?: ComputedMetricDefinitionGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ComputedMetricDefinitionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetComputedMetricDefinitionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the ComputedMetricDefinition model
     */
    readonly fields: ComputedMetricDefinitionFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for ComputedMetricDefinition.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__ComputedMetricDefinitionClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    entityType<T extends Prisma.EntityTypeDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.EntityTypeDefaultArgs<ExtArgs>>): Prisma.Prisma__EntityTypeClient<runtime.Types.Result.GetResult<Prisma.$EntityTypePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
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
 * Fields of the ComputedMetricDefinition model
 */
export interface ComputedMetricDefinitionFieldRefs {
    readonly id: Prisma.FieldRef<"ComputedMetricDefinition", 'String'>;
    readonly name: Prisma.FieldRef<"ComputedMetricDefinition", 'String'>;
    readonly entityTypeId: Prisma.FieldRef<"ComputedMetricDefinition", 'String'>;
    readonly expression: Prisma.FieldRef<"ComputedMetricDefinition", 'String'>;
    readonly unit: Prisma.FieldRef<"ComputedMetricDefinition", 'String'>;
    readonly enabled: Prisma.FieldRef<"ComputedMetricDefinition", 'Boolean'>;
    readonly createdAt: Prisma.FieldRef<"ComputedMetricDefinition", 'DateTime'>;
}
/**
 * ComputedMetricDefinition findUnique
 */
export type ComputedMetricDefinitionFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ComputedMetricDefinition
     */
    select?: Prisma.ComputedMetricDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ComputedMetricDefinition
     */
    omit?: Prisma.ComputedMetricDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ComputedMetricDefinitionInclude<ExtArgs> | null;
    /**
     * Filter, which ComputedMetricDefinition to fetch.
     */
    where: Prisma.ComputedMetricDefinitionWhereUniqueInput;
};
/**
 * ComputedMetricDefinition findUniqueOrThrow
 */
export type ComputedMetricDefinitionFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ComputedMetricDefinition
     */
    select?: Prisma.ComputedMetricDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ComputedMetricDefinition
     */
    omit?: Prisma.ComputedMetricDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ComputedMetricDefinitionInclude<ExtArgs> | null;
    /**
     * Filter, which ComputedMetricDefinition to fetch.
     */
    where: Prisma.ComputedMetricDefinitionWhereUniqueInput;
};
/**
 * ComputedMetricDefinition findFirst
 */
export type ComputedMetricDefinitionFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ComputedMetricDefinition
     */
    select?: Prisma.ComputedMetricDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ComputedMetricDefinition
     */
    omit?: Prisma.ComputedMetricDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ComputedMetricDefinitionInclude<ExtArgs> | null;
    /**
     * Filter, which ComputedMetricDefinition to fetch.
     */
    where?: Prisma.ComputedMetricDefinitionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ComputedMetricDefinitions to fetch.
     */
    orderBy?: Prisma.ComputedMetricDefinitionOrderByWithRelationInput | Prisma.ComputedMetricDefinitionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ComputedMetricDefinitions.
     */
    cursor?: Prisma.ComputedMetricDefinitionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ComputedMetricDefinitions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ComputedMetricDefinitions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ComputedMetricDefinitions.
     */
    distinct?: Prisma.ComputedMetricDefinitionScalarFieldEnum | Prisma.ComputedMetricDefinitionScalarFieldEnum[];
};
/**
 * ComputedMetricDefinition findFirstOrThrow
 */
export type ComputedMetricDefinitionFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ComputedMetricDefinition
     */
    select?: Prisma.ComputedMetricDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ComputedMetricDefinition
     */
    omit?: Prisma.ComputedMetricDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ComputedMetricDefinitionInclude<ExtArgs> | null;
    /**
     * Filter, which ComputedMetricDefinition to fetch.
     */
    where?: Prisma.ComputedMetricDefinitionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ComputedMetricDefinitions to fetch.
     */
    orderBy?: Prisma.ComputedMetricDefinitionOrderByWithRelationInput | Prisma.ComputedMetricDefinitionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ComputedMetricDefinitions.
     */
    cursor?: Prisma.ComputedMetricDefinitionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ComputedMetricDefinitions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ComputedMetricDefinitions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ComputedMetricDefinitions.
     */
    distinct?: Prisma.ComputedMetricDefinitionScalarFieldEnum | Prisma.ComputedMetricDefinitionScalarFieldEnum[];
};
/**
 * ComputedMetricDefinition findMany
 */
export type ComputedMetricDefinitionFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ComputedMetricDefinition
     */
    select?: Prisma.ComputedMetricDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ComputedMetricDefinition
     */
    omit?: Prisma.ComputedMetricDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ComputedMetricDefinitionInclude<ExtArgs> | null;
    /**
     * Filter, which ComputedMetricDefinitions to fetch.
     */
    where?: Prisma.ComputedMetricDefinitionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ComputedMetricDefinitions to fetch.
     */
    orderBy?: Prisma.ComputedMetricDefinitionOrderByWithRelationInput | Prisma.ComputedMetricDefinitionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing ComputedMetricDefinitions.
     */
    cursor?: Prisma.ComputedMetricDefinitionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ComputedMetricDefinitions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ComputedMetricDefinitions.
     */
    skip?: number;
    distinct?: Prisma.ComputedMetricDefinitionScalarFieldEnum | Prisma.ComputedMetricDefinitionScalarFieldEnum[];
};
/**
 * ComputedMetricDefinition create
 */
export type ComputedMetricDefinitionCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ComputedMetricDefinition
     */
    select?: Prisma.ComputedMetricDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ComputedMetricDefinition
     */
    omit?: Prisma.ComputedMetricDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ComputedMetricDefinitionInclude<ExtArgs> | null;
    /**
     * The data needed to create a ComputedMetricDefinition.
     */
    data: Prisma.XOR<Prisma.ComputedMetricDefinitionCreateInput, Prisma.ComputedMetricDefinitionUncheckedCreateInput>;
};
/**
 * ComputedMetricDefinition createMany
 */
export type ComputedMetricDefinitionCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many ComputedMetricDefinitions.
     */
    data: Prisma.ComputedMetricDefinitionCreateManyInput | Prisma.ComputedMetricDefinitionCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * ComputedMetricDefinition createManyAndReturn
 */
export type ComputedMetricDefinitionCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ComputedMetricDefinition
     */
    select?: Prisma.ComputedMetricDefinitionSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the ComputedMetricDefinition
     */
    omit?: Prisma.ComputedMetricDefinitionOmit<ExtArgs> | null;
    /**
     * The data used to create many ComputedMetricDefinitions.
     */
    data: Prisma.ComputedMetricDefinitionCreateManyInput | Prisma.ComputedMetricDefinitionCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ComputedMetricDefinitionIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * ComputedMetricDefinition update
 */
export type ComputedMetricDefinitionUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ComputedMetricDefinition
     */
    select?: Prisma.ComputedMetricDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ComputedMetricDefinition
     */
    omit?: Prisma.ComputedMetricDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ComputedMetricDefinitionInclude<ExtArgs> | null;
    /**
     * The data needed to update a ComputedMetricDefinition.
     */
    data: Prisma.XOR<Prisma.ComputedMetricDefinitionUpdateInput, Prisma.ComputedMetricDefinitionUncheckedUpdateInput>;
    /**
     * Choose, which ComputedMetricDefinition to update.
     */
    where: Prisma.ComputedMetricDefinitionWhereUniqueInput;
};
/**
 * ComputedMetricDefinition updateMany
 */
export type ComputedMetricDefinitionUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update ComputedMetricDefinitions.
     */
    data: Prisma.XOR<Prisma.ComputedMetricDefinitionUpdateManyMutationInput, Prisma.ComputedMetricDefinitionUncheckedUpdateManyInput>;
    /**
     * Filter which ComputedMetricDefinitions to update
     */
    where?: Prisma.ComputedMetricDefinitionWhereInput;
    /**
     * Limit how many ComputedMetricDefinitions to update.
     */
    limit?: number;
};
/**
 * ComputedMetricDefinition updateManyAndReturn
 */
export type ComputedMetricDefinitionUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ComputedMetricDefinition
     */
    select?: Prisma.ComputedMetricDefinitionSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the ComputedMetricDefinition
     */
    omit?: Prisma.ComputedMetricDefinitionOmit<ExtArgs> | null;
    /**
     * The data used to update ComputedMetricDefinitions.
     */
    data: Prisma.XOR<Prisma.ComputedMetricDefinitionUpdateManyMutationInput, Prisma.ComputedMetricDefinitionUncheckedUpdateManyInput>;
    /**
     * Filter which ComputedMetricDefinitions to update
     */
    where?: Prisma.ComputedMetricDefinitionWhereInput;
    /**
     * Limit how many ComputedMetricDefinitions to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ComputedMetricDefinitionIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * ComputedMetricDefinition upsert
 */
export type ComputedMetricDefinitionUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ComputedMetricDefinition
     */
    select?: Prisma.ComputedMetricDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ComputedMetricDefinition
     */
    omit?: Prisma.ComputedMetricDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ComputedMetricDefinitionInclude<ExtArgs> | null;
    /**
     * The filter to search for the ComputedMetricDefinition to update in case it exists.
     */
    where: Prisma.ComputedMetricDefinitionWhereUniqueInput;
    /**
     * In case the ComputedMetricDefinition found by the `where` argument doesn't exist, create a new ComputedMetricDefinition with this data.
     */
    create: Prisma.XOR<Prisma.ComputedMetricDefinitionCreateInput, Prisma.ComputedMetricDefinitionUncheckedCreateInput>;
    /**
     * In case the ComputedMetricDefinition was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.ComputedMetricDefinitionUpdateInput, Prisma.ComputedMetricDefinitionUncheckedUpdateInput>;
};
/**
 * ComputedMetricDefinition delete
 */
export type ComputedMetricDefinitionDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ComputedMetricDefinition
     */
    select?: Prisma.ComputedMetricDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ComputedMetricDefinition
     */
    omit?: Prisma.ComputedMetricDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ComputedMetricDefinitionInclude<ExtArgs> | null;
    /**
     * Filter which ComputedMetricDefinition to delete.
     */
    where: Prisma.ComputedMetricDefinitionWhereUniqueInput;
};
/**
 * ComputedMetricDefinition deleteMany
 */
export type ComputedMetricDefinitionDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which ComputedMetricDefinitions to delete
     */
    where?: Prisma.ComputedMetricDefinitionWhereInput;
    /**
     * Limit how many ComputedMetricDefinitions to delete.
     */
    limit?: number;
};
/**
 * ComputedMetricDefinition without action
 */
export type ComputedMetricDefinitionDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ComputedMetricDefinition
     */
    select?: Prisma.ComputedMetricDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ComputedMetricDefinition
     */
    omit?: Prisma.ComputedMetricDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ComputedMetricDefinitionInclude<ExtArgs> | null;
};
export {};
//# sourceMappingURL=ComputedMetricDefinition.d.ts.map