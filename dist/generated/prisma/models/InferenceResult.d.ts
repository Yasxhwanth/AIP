import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
/**
 * Model InferenceResult
 *
 */
export type InferenceResultModel = runtime.Types.Result.DefaultSelection<Prisma.$InferenceResultPayload>;
export type AggregateInferenceResult = {
    _count: InferenceResultCountAggregateOutputType | null;
    _avg: InferenceResultAvgAggregateOutputType | null;
    _sum: InferenceResultSumAggregateOutputType | null;
    _min: InferenceResultMinAggregateOutputType | null;
    _max: InferenceResultMaxAggregateOutputType | null;
};
export type InferenceResultAvgAggregateOutputType = {
    confidence: number | null;
};
export type InferenceResultSumAggregateOutputType = {
    confidence: number | null;
};
export type InferenceResultMinAggregateOutputType = {
    id: string | null;
    modelVersionId: string | null;
    logicalId: string | null;
    confidence: number | null;
    createdAt: Date | null;
};
export type InferenceResultMaxAggregateOutputType = {
    id: string | null;
    modelVersionId: string | null;
    logicalId: string | null;
    confidence: number | null;
    createdAt: Date | null;
};
export type InferenceResultCountAggregateOutputType = {
    id: number;
    modelVersionId: number;
    logicalId: number;
    input: number;
    output: number;
    confidence: number;
    createdAt: number;
    _all: number;
};
export type InferenceResultAvgAggregateInputType = {
    confidence?: true;
};
export type InferenceResultSumAggregateInputType = {
    confidence?: true;
};
export type InferenceResultMinAggregateInputType = {
    id?: true;
    modelVersionId?: true;
    logicalId?: true;
    confidence?: true;
    createdAt?: true;
};
export type InferenceResultMaxAggregateInputType = {
    id?: true;
    modelVersionId?: true;
    logicalId?: true;
    confidence?: true;
    createdAt?: true;
};
export type InferenceResultCountAggregateInputType = {
    id?: true;
    modelVersionId?: true;
    logicalId?: true;
    input?: true;
    output?: true;
    confidence?: true;
    createdAt?: true;
    _all?: true;
};
export type InferenceResultAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which InferenceResult to aggregate.
     */
    where?: Prisma.InferenceResultWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of InferenceResults to fetch.
     */
    orderBy?: Prisma.InferenceResultOrderByWithRelationInput | Prisma.InferenceResultOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.InferenceResultWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` InferenceResults from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` InferenceResults.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned InferenceResults
    **/
    _count?: true | InferenceResultCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: InferenceResultAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: InferenceResultSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: InferenceResultMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: InferenceResultMaxAggregateInputType;
};
export type GetInferenceResultAggregateType<T extends InferenceResultAggregateArgs> = {
    [P in keyof T & keyof AggregateInferenceResult]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateInferenceResult[P]> : Prisma.GetScalarType<T[P], AggregateInferenceResult[P]>;
};
export type InferenceResultGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.InferenceResultWhereInput;
    orderBy?: Prisma.InferenceResultOrderByWithAggregationInput | Prisma.InferenceResultOrderByWithAggregationInput[];
    by: Prisma.InferenceResultScalarFieldEnum[] | Prisma.InferenceResultScalarFieldEnum;
    having?: Prisma.InferenceResultScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: InferenceResultCountAggregateInputType | true;
    _avg?: InferenceResultAvgAggregateInputType;
    _sum?: InferenceResultSumAggregateInputType;
    _min?: InferenceResultMinAggregateInputType;
    _max?: InferenceResultMaxAggregateInputType;
};
export type InferenceResultGroupByOutputType = {
    id: string;
    modelVersionId: string;
    logicalId: string;
    input: runtime.JsonValue;
    output: runtime.JsonValue;
    confidence: number | null;
    createdAt: Date;
    _count: InferenceResultCountAggregateOutputType | null;
    _avg: InferenceResultAvgAggregateOutputType | null;
    _sum: InferenceResultSumAggregateOutputType | null;
    _min: InferenceResultMinAggregateOutputType | null;
    _max: InferenceResultMaxAggregateOutputType | null;
};
type GetInferenceResultGroupByPayload<T extends InferenceResultGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<InferenceResultGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof InferenceResultGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], InferenceResultGroupByOutputType[P]> : Prisma.GetScalarType<T[P], InferenceResultGroupByOutputType[P]>;
}>>;
export type InferenceResultWhereInput = {
    AND?: Prisma.InferenceResultWhereInput | Prisma.InferenceResultWhereInput[];
    OR?: Prisma.InferenceResultWhereInput[];
    NOT?: Prisma.InferenceResultWhereInput | Prisma.InferenceResultWhereInput[];
    id?: Prisma.StringFilter<"InferenceResult"> | string;
    modelVersionId?: Prisma.StringFilter<"InferenceResult"> | string;
    logicalId?: Prisma.StringFilter<"InferenceResult"> | string;
    input?: Prisma.JsonFilter<"InferenceResult">;
    output?: Prisma.JsonFilter<"InferenceResult">;
    confidence?: Prisma.FloatNullableFilter<"InferenceResult"> | number | null;
    createdAt?: Prisma.DateTimeFilter<"InferenceResult"> | Date | string;
    modelVersion?: Prisma.XOR<Prisma.ModelVersionScalarRelationFilter, Prisma.ModelVersionWhereInput>;
};
export type InferenceResultOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    modelVersionId?: Prisma.SortOrder;
    logicalId?: Prisma.SortOrder;
    input?: Prisma.SortOrder;
    output?: Prisma.SortOrder;
    confidence?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    modelVersion?: Prisma.ModelVersionOrderByWithRelationInput;
};
export type InferenceResultWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.InferenceResultWhereInput | Prisma.InferenceResultWhereInput[];
    OR?: Prisma.InferenceResultWhereInput[];
    NOT?: Prisma.InferenceResultWhereInput | Prisma.InferenceResultWhereInput[];
    modelVersionId?: Prisma.StringFilter<"InferenceResult"> | string;
    logicalId?: Prisma.StringFilter<"InferenceResult"> | string;
    input?: Prisma.JsonFilter<"InferenceResult">;
    output?: Prisma.JsonFilter<"InferenceResult">;
    confidence?: Prisma.FloatNullableFilter<"InferenceResult"> | number | null;
    createdAt?: Prisma.DateTimeFilter<"InferenceResult"> | Date | string;
    modelVersion?: Prisma.XOR<Prisma.ModelVersionScalarRelationFilter, Prisma.ModelVersionWhereInput>;
}, "id">;
export type InferenceResultOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    modelVersionId?: Prisma.SortOrder;
    logicalId?: Prisma.SortOrder;
    input?: Prisma.SortOrder;
    output?: Prisma.SortOrder;
    confidence?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.InferenceResultCountOrderByAggregateInput;
    _avg?: Prisma.InferenceResultAvgOrderByAggregateInput;
    _max?: Prisma.InferenceResultMaxOrderByAggregateInput;
    _min?: Prisma.InferenceResultMinOrderByAggregateInput;
    _sum?: Prisma.InferenceResultSumOrderByAggregateInput;
};
export type InferenceResultScalarWhereWithAggregatesInput = {
    AND?: Prisma.InferenceResultScalarWhereWithAggregatesInput | Prisma.InferenceResultScalarWhereWithAggregatesInput[];
    OR?: Prisma.InferenceResultScalarWhereWithAggregatesInput[];
    NOT?: Prisma.InferenceResultScalarWhereWithAggregatesInput | Prisma.InferenceResultScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"InferenceResult"> | string;
    modelVersionId?: Prisma.StringWithAggregatesFilter<"InferenceResult"> | string;
    logicalId?: Prisma.StringWithAggregatesFilter<"InferenceResult"> | string;
    input?: Prisma.JsonWithAggregatesFilter<"InferenceResult">;
    output?: Prisma.JsonWithAggregatesFilter<"InferenceResult">;
    confidence?: Prisma.FloatNullableWithAggregatesFilter<"InferenceResult"> | number | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"InferenceResult"> | Date | string;
};
export type InferenceResultCreateInput = {
    id?: string;
    logicalId: string;
    input: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    output: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    confidence?: number | null;
    createdAt?: Date | string;
    modelVersion: Prisma.ModelVersionCreateNestedOneWithoutInferenceResultsInput;
};
export type InferenceResultUncheckedCreateInput = {
    id?: string;
    modelVersionId: string;
    logicalId: string;
    input: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    output: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    confidence?: number | null;
    createdAt?: Date | string;
};
export type InferenceResultUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    logicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    input?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    output?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    confidence?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    modelVersion?: Prisma.ModelVersionUpdateOneRequiredWithoutInferenceResultsNestedInput;
};
export type InferenceResultUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    modelVersionId?: Prisma.StringFieldUpdateOperationsInput | string;
    logicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    input?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    output?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    confidence?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type InferenceResultCreateManyInput = {
    id?: string;
    modelVersionId: string;
    logicalId: string;
    input: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    output: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    confidence?: number | null;
    createdAt?: Date | string;
};
export type InferenceResultUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    logicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    input?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    output?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    confidence?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type InferenceResultUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    modelVersionId?: Prisma.StringFieldUpdateOperationsInput | string;
    logicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    input?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    output?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    confidence?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type InferenceResultListRelationFilter = {
    every?: Prisma.InferenceResultWhereInput;
    some?: Prisma.InferenceResultWhereInput;
    none?: Prisma.InferenceResultWhereInput;
};
export type InferenceResultOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type InferenceResultCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    modelVersionId?: Prisma.SortOrder;
    logicalId?: Prisma.SortOrder;
    input?: Prisma.SortOrder;
    output?: Prisma.SortOrder;
    confidence?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type InferenceResultAvgOrderByAggregateInput = {
    confidence?: Prisma.SortOrder;
};
export type InferenceResultMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    modelVersionId?: Prisma.SortOrder;
    logicalId?: Prisma.SortOrder;
    confidence?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type InferenceResultMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    modelVersionId?: Prisma.SortOrder;
    logicalId?: Prisma.SortOrder;
    confidence?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type InferenceResultSumOrderByAggregateInput = {
    confidence?: Prisma.SortOrder;
};
export type InferenceResultCreateNestedManyWithoutModelVersionInput = {
    create?: Prisma.XOR<Prisma.InferenceResultCreateWithoutModelVersionInput, Prisma.InferenceResultUncheckedCreateWithoutModelVersionInput> | Prisma.InferenceResultCreateWithoutModelVersionInput[] | Prisma.InferenceResultUncheckedCreateWithoutModelVersionInput[];
    connectOrCreate?: Prisma.InferenceResultCreateOrConnectWithoutModelVersionInput | Prisma.InferenceResultCreateOrConnectWithoutModelVersionInput[];
    createMany?: Prisma.InferenceResultCreateManyModelVersionInputEnvelope;
    connect?: Prisma.InferenceResultWhereUniqueInput | Prisma.InferenceResultWhereUniqueInput[];
};
export type InferenceResultUncheckedCreateNestedManyWithoutModelVersionInput = {
    create?: Prisma.XOR<Prisma.InferenceResultCreateWithoutModelVersionInput, Prisma.InferenceResultUncheckedCreateWithoutModelVersionInput> | Prisma.InferenceResultCreateWithoutModelVersionInput[] | Prisma.InferenceResultUncheckedCreateWithoutModelVersionInput[];
    connectOrCreate?: Prisma.InferenceResultCreateOrConnectWithoutModelVersionInput | Prisma.InferenceResultCreateOrConnectWithoutModelVersionInput[];
    createMany?: Prisma.InferenceResultCreateManyModelVersionInputEnvelope;
    connect?: Prisma.InferenceResultWhereUniqueInput | Prisma.InferenceResultWhereUniqueInput[];
};
export type InferenceResultUpdateManyWithoutModelVersionNestedInput = {
    create?: Prisma.XOR<Prisma.InferenceResultCreateWithoutModelVersionInput, Prisma.InferenceResultUncheckedCreateWithoutModelVersionInput> | Prisma.InferenceResultCreateWithoutModelVersionInput[] | Prisma.InferenceResultUncheckedCreateWithoutModelVersionInput[];
    connectOrCreate?: Prisma.InferenceResultCreateOrConnectWithoutModelVersionInput | Prisma.InferenceResultCreateOrConnectWithoutModelVersionInput[];
    upsert?: Prisma.InferenceResultUpsertWithWhereUniqueWithoutModelVersionInput | Prisma.InferenceResultUpsertWithWhereUniqueWithoutModelVersionInput[];
    createMany?: Prisma.InferenceResultCreateManyModelVersionInputEnvelope;
    set?: Prisma.InferenceResultWhereUniqueInput | Prisma.InferenceResultWhereUniqueInput[];
    disconnect?: Prisma.InferenceResultWhereUniqueInput | Prisma.InferenceResultWhereUniqueInput[];
    delete?: Prisma.InferenceResultWhereUniqueInput | Prisma.InferenceResultWhereUniqueInput[];
    connect?: Prisma.InferenceResultWhereUniqueInput | Prisma.InferenceResultWhereUniqueInput[];
    update?: Prisma.InferenceResultUpdateWithWhereUniqueWithoutModelVersionInput | Prisma.InferenceResultUpdateWithWhereUniqueWithoutModelVersionInput[];
    updateMany?: Prisma.InferenceResultUpdateManyWithWhereWithoutModelVersionInput | Prisma.InferenceResultUpdateManyWithWhereWithoutModelVersionInput[];
    deleteMany?: Prisma.InferenceResultScalarWhereInput | Prisma.InferenceResultScalarWhereInput[];
};
export type InferenceResultUncheckedUpdateManyWithoutModelVersionNestedInput = {
    create?: Prisma.XOR<Prisma.InferenceResultCreateWithoutModelVersionInput, Prisma.InferenceResultUncheckedCreateWithoutModelVersionInput> | Prisma.InferenceResultCreateWithoutModelVersionInput[] | Prisma.InferenceResultUncheckedCreateWithoutModelVersionInput[];
    connectOrCreate?: Prisma.InferenceResultCreateOrConnectWithoutModelVersionInput | Prisma.InferenceResultCreateOrConnectWithoutModelVersionInput[];
    upsert?: Prisma.InferenceResultUpsertWithWhereUniqueWithoutModelVersionInput | Prisma.InferenceResultUpsertWithWhereUniqueWithoutModelVersionInput[];
    createMany?: Prisma.InferenceResultCreateManyModelVersionInputEnvelope;
    set?: Prisma.InferenceResultWhereUniqueInput | Prisma.InferenceResultWhereUniqueInput[];
    disconnect?: Prisma.InferenceResultWhereUniqueInput | Prisma.InferenceResultWhereUniqueInput[];
    delete?: Prisma.InferenceResultWhereUniqueInput | Prisma.InferenceResultWhereUniqueInput[];
    connect?: Prisma.InferenceResultWhereUniqueInput | Prisma.InferenceResultWhereUniqueInput[];
    update?: Prisma.InferenceResultUpdateWithWhereUniqueWithoutModelVersionInput | Prisma.InferenceResultUpdateWithWhereUniqueWithoutModelVersionInput[];
    updateMany?: Prisma.InferenceResultUpdateManyWithWhereWithoutModelVersionInput | Prisma.InferenceResultUpdateManyWithWhereWithoutModelVersionInput[];
    deleteMany?: Prisma.InferenceResultScalarWhereInput | Prisma.InferenceResultScalarWhereInput[];
};
export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type InferenceResultCreateWithoutModelVersionInput = {
    id?: string;
    logicalId: string;
    input: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    output: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    confidence?: number | null;
    createdAt?: Date | string;
};
export type InferenceResultUncheckedCreateWithoutModelVersionInput = {
    id?: string;
    logicalId: string;
    input: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    output: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    confidence?: number | null;
    createdAt?: Date | string;
};
export type InferenceResultCreateOrConnectWithoutModelVersionInput = {
    where: Prisma.InferenceResultWhereUniqueInput;
    create: Prisma.XOR<Prisma.InferenceResultCreateWithoutModelVersionInput, Prisma.InferenceResultUncheckedCreateWithoutModelVersionInput>;
};
export type InferenceResultCreateManyModelVersionInputEnvelope = {
    data: Prisma.InferenceResultCreateManyModelVersionInput | Prisma.InferenceResultCreateManyModelVersionInput[];
    skipDuplicates?: boolean;
};
export type InferenceResultUpsertWithWhereUniqueWithoutModelVersionInput = {
    where: Prisma.InferenceResultWhereUniqueInput;
    update: Prisma.XOR<Prisma.InferenceResultUpdateWithoutModelVersionInput, Prisma.InferenceResultUncheckedUpdateWithoutModelVersionInput>;
    create: Prisma.XOR<Prisma.InferenceResultCreateWithoutModelVersionInput, Prisma.InferenceResultUncheckedCreateWithoutModelVersionInput>;
};
export type InferenceResultUpdateWithWhereUniqueWithoutModelVersionInput = {
    where: Prisma.InferenceResultWhereUniqueInput;
    data: Prisma.XOR<Prisma.InferenceResultUpdateWithoutModelVersionInput, Prisma.InferenceResultUncheckedUpdateWithoutModelVersionInput>;
};
export type InferenceResultUpdateManyWithWhereWithoutModelVersionInput = {
    where: Prisma.InferenceResultScalarWhereInput;
    data: Prisma.XOR<Prisma.InferenceResultUpdateManyMutationInput, Prisma.InferenceResultUncheckedUpdateManyWithoutModelVersionInput>;
};
export type InferenceResultScalarWhereInput = {
    AND?: Prisma.InferenceResultScalarWhereInput | Prisma.InferenceResultScalarWhereInput[];
    OR?: Prisma.InferenceResultScalarWhereInput[];
    NOT?: Prisma.InferenceResultScalarWhereInput | Prisma.InferenceResultScalarWhereInput[];
    id?: Prisma.StringFilter<"InferenceResult"> | string;
    modelVersionId?: Prisma.StringFilter<"InferenceResult"> | string;
    logicalId?: Prisma.StringFilter<"InferenceResult"> | string;
    input?: Prisma.JsonFilter<"InferenceResult">;
    output?: Prisma.JsonFilter<"InferenceResult">;
    confidence?: Prisma.FloatNullableFilter<"InferenceResult"> | number | null;
    createdAt?: Prisma.DateTimeFilter<"InferenceResult"> | Date | string;
};
export type InferenceResultCreateManyModelVersionInput = {
    id?: string;
    logicalId: string;
    input: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    output: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    confidence?: number | null;
    createdAt?: Date | string;
};
export type InferenceResultUpdateWithoutModelVersionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    logicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    input?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    output?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    confidence?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type InferenceResultUncheckedUpdateWithoutModelVersionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    logicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    input?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    output?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    confidence?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type InferenceResultUncheckedUpdateManyWithoutModelVersionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    logicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    input?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    output?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    confidence?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type InferenceResultSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    modelVersionId?: boolean;
    logicalId?: boolean;
    input?: boolean;
    output?: boolean;
    confidence?: boolean;
    createdAt?: boolean;
    modelVersion?: boolean | Prisma.ModelVersionDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["inferenceResult"]>;
export type InferenceResultSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    modelVersionId?: boolean;
    logicalId?: boolean;
    input?: boolean;
    output?: boolean;
    confidence?: boolean;
    createdAt?: boolean;
    modelVersion?: boolean | Prisma.ModelVersionDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["inferenceResult"]>;
export type InferenceResultSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    modelVersionId?: boolean;
    logicalId?: boolean;
    input?: boolean;
    output?: boolean;
    confidence?: boolean;
    createdAt?: boolean;
    modelVersion?: boolean | Prisma.ModelVersionDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["inferenceResult"]>;
export type InferenceResultSelectScalar = {
    id?: boolean;
    modelVersionId?: boolean;
    logicalId?: boolean;
    input?: boolean;
    output?: boolean;
    confidence?: boolean;
    createdAt?: boolean;
};
export type InferenceResultOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "modelVersionId" | "logicalId" | "input" | "output" | "confidence" | "createdAt", ExtArgs["result"]["inferenceResult"]>;
export type InferenceResultInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    modelVersion?: boolean | Prisma.ModelVersionDefaultArgs<ExtArgs>;
};
export type InferenceResultIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    modelVersion?: boolean | Prisma.ModelVersionDefaultArgs<ExtArgs>;
};
export type InferenceResultIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    modelVersion?: boolean | Prisma.ModelVersionDefaultArgs<ExtArgs>;
};
export type $InferenceResultPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "InferenceResult";
    objects: {
        modelVersion: Prisma.$ModelVersionPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        modelVersionId: string;
        logicalId: string;
        input: runtime.JsonValue;
        output: runtime.JsonValue;
        confidence: number | null;
        createdAt: Date;
    }, ExtArgs["result"]["inferenceResult"]>;
    composites: {};
};
export type InferenceResultGetPayload<S extends boolean | null | undefined | InferenceResultDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$InferenceResultPayload, S>;
export type InferenceResultCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<InferenceResultFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: InferenceResultCountAggregateInputType | true;
};
export interface InferenceResultDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['InferenceResult'];
        meta: {
            name: 'InferenceResult';
        };
    };
    /**
     * Find zero or one InferenceResult that matches the filter.
     * @param {InferenceResultFindUniqueArgs} args - Arguments to find a InferenceResult
     * @example
     * // Get one InferenceResult
     * const inferenceResult = await prisma.inferenceResult.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends InferenceResultFindUniqueArgs>(args: Prisma.SelectSubset<T, InferenceResultFindUniqueArgs<ExtArgs>>): Prisma.Prisma__InferenceResultClient<runtime.Types.Result.GetResult<Prisma.$InferenceResultPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one InferenceResult that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {InferenceResultFindUniqueOrThrowArgs} args - Arguments to find a InferenceResult
     * @example
     * // Get one InferenceResult
     * const inferenceResult = await prisma.inferenceResult.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends InferenceResultFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, InferenceResultFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__InferenceResultClient<runtime.Types.Result.GetResult<Prisma.$InferenceResultPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first InferenceResult that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InferenceResultFindFirstArgs} args - Arguments to find a InferenceResult
     * @example
     * // Get one InferenceResult
     * const inferenceResult = await prisma.inferenceResult.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends InferenceResultFindFirstArgs>(args?: Prisma.SelectSubset<T, InferenceResultFindFirstArgs<ExtArgs>>): Prisma.Prisma__InferenceResultClient<runtime.Types.Result.GetResult<Prisma.$InferenceResultPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first InferenceResult that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InferenceResultFindFirstOrThrowArgs} args - Arguments to find a InferenceResult
     * @example
     * // Get one InferenceResult
     * const inferenceResult = await prisma.inferenceResult.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends InferenceResultFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, InferenceResultFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__InferenceResultClient<runtime.Types.Result.GetResult<Prisma.$InferenceResultPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more InferenceResults that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InferenceResultFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all InferenceResults
     * const inferenceResults = await prisma.inferenceResult.findMany()
     *
     * // Get first 10 InferenceResults
     * const inferenceResults = await prisma.inferenceResult.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const inferenceResultWithIdOnly = await prisma.inferenceResult.findMany({ select: { id: true } })
     *
     */
    findMany<T extends InferenceResultFindManyArgs>(args?: Prisma.SelectSubset<T, InferenceResultFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$InferenceResultPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a InferenceResult.
     * @param {InferenceResultCreateArgs} args - Arguments to create a InferenceResult.
     * @example
     * // Create one InferenceResult
     * const InferenceResult = await prisma.inferenceResult.create({
     *   data: {
     *     // ... data to create a InferenceResult
     *   }
     * })
     *
     */
    create<T extends InferenceResultCreateArgs>(args: Prisma.SelectSubset<T, InferenceResultCreateArgs<ExtArgs>>): Prisma.Prisma__InferenceResultClient<runtime.Types.Result.GetResult<Prisma.$InferenceResultPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many InferenceResults.
     * @param {InferenceResultCreateManyArgs} args - Arguments to create many InferenceResults.
     * @example
     * // Create many InferenceResults
     * const inferenceResult = await prisma.inferenceResult.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends InferenceResultCreateManyArgs>(args?: Prisma.SelectSubset<T, InferenceResultCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many InferenceResults and returns the data saved in the database.
     * @param {InferenceResultCreateManyAndReturnArgs} args - Arguments to create many InferenceResults.
     * @example
     * // Create many InferenceResults
     * const inferenceResult = await prisma.inferenceResult.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many InferenceResults and only return the `id`
     * const inferenceResultWithIdOnly = await prisma.inferenceResult.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends InferenceResultCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, InferenceResultCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$InferenceResultPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a InferenceResult.
     * @param {InferenceResultDeleteArgs} args - Arguments to delete one InferenceResult.
     * @example
     * // Delete one InferenceResult
     * const InferenceResult = await prisma.inferenceResult.delete({
     *   where: {
     *     // ... filter to delete one InferenceResult
     *   }
     * })
     *
     */
    delete<T extends InferenceResultDeleteArgs>(args: Prisma.SelectSubset<T, InferenceResultDeleteArgs<ExtArgs>>): Prisma.Prisma__InferenceResultClient<runtime.Types.Result.GetResult<Prisma.$InferenceResultPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one InferenceResult.
     * @param {InferenceResultUpdateArgs} args - Arguments to update one InferenceResult.
     * @example
     * // Update one InferenceResult
     * const inferenceResult = await prisma.inferenceResult.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends InferenceResultUpdateArgs>(args: Prisma.SelectSubset<T, InferenceResultUpdateArgs<ExtArgs>>): Prisma.Prisma__InferenceResultClient<runtime.Types.Result.GetResult<Prisma.$InferenceResultPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more InferenceResults.
     * @param {InferenceResultDeleteManyArgs} args - Arguments to filter InferenceResults to delete.
     * @example
     * // Delete a few InferenceResults
     * const { count } = await prisma.inferenceResult.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends InferenceResultDeleteManyArgs>(args?: Prisma.SelectSubset<T, InferenceResultDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more InferenceResults.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InferenceResultUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many InferenceResults
     * const inferenceResult = await prisma.inferenceResult.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends InferenceResultUpdateManyArgs>(args: Prisma.SelectSubset<T, InferenceResultUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more InferenceResults and returns the data updated in the database.
     * @param {InferenceResultUpdateManyAndReturnArgs} args - Arguments to update many InferenceResults.
     * @example
     * // Update many InferenceResults
     * const inferenceResult = await prisma.inferenceResult.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more InferenceResults and only return the `id`
     * const inferenceResultWithIdOnly = await prisma.inferenceResult.updateManyAndReturn({
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
    updateManyAndReturn<T extends InferenceResultUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, InferenceResultUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$InferenceResultPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one InferenceResult.
     * @param {InferenceResultUpsertArgs} args - Arguments to update or create a InferenceResult.
     * @example
     * // Update or create a InferenceResult
     * const inferenceResult = await prisma.inferenceResult.upsert({
     *   create: {
     *     // ... data to create a InferenceResult
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the InferenceResult we want to update
     *   }
     * })
     */
    upsert<T extends InferenceResultUpsertArgs>(args: Prisma.SelectSubset<T, InferenceResultUpsertArgs<ExtArgs>>): Prisma.Prisma__InferenceResultClient<runtime.Types.Result.GetResult<Prisma.$InferenceResultPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of InferenceResults.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InferenceResultCountArgs} args - Arguments to filter InferenceResults to count.
     * @example
     * // Count the number of InferenceResults
     * const count = await prisma.inferenceResult.count({
     *   where: {
     *     // ... the filter for the InferenceResults we want to count
     *   }
     * })
    **/
    count<T extends InferenceResultCountArgs>(args?: Prisma.Subset<T, InferenceResultCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], InferenceResultCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a InferenceResult.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InferenceResultAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends InferenceResultAggregateArgs>(args: Prisma.Subset<T, InferenceResultAggregateArgs>): Prisma.PrismaPromise<GetInferenceResultAggregateType<T>>;
    /**
     * Group by InferenceResult.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InferenceResultGroupByArgs} args - Group by arguments.
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
    groupBy<T extends InferenceResultGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: InferenceResultGroupByArgs['orderBy'];
    } : {
        orderBy?: InferenceResultGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, InferenceResultGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInferenceResultGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the InferenceResult model
     */
    readonly fields: InferenceResultFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for InferenceResult.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__InferenceResultClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    modelVersion<T extends Prisma.ModelVersionDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ModelVersionDefaultArgs<ExtArgs>>): Prisma.Prisma__ModelVersionClient<runtime.Types.Result.GetResult<Prisma.$ModelVersionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
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
 * Fields of the InferenceResult model
 */
export interface InferenceResultFieldRefs {
    readonly id: Prisma.FieldRef<"InferenceResult", 'String'>;
    readonly modelVersionId: Prisma.FieldRef<"InferenceResult", 'String'>;
    readonly logicalId: Prisma.FieldRef<"InferenceResult", 'String'>;
    readonly input: Prisma.FieldRef<"InferenceResult", 'Json'>;
    readonly output: Prisma.FieldRef<"InferenceResult", 'Json'>;
    readonly confidence: Prisma.FieldRef<"InferenceResult", 'Float'>;
    readonly createdAt: Prisma.FieldRef<"InferenceResult", 'DateTime'>;
}
/**
 * InferenceResult findUnique
 */
export type InferenceResultFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InferenceResult
     */
    select?: Prisma.InferenceResultSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the InferenceResult
     */
    omit?: Prisma.InferenceResultOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.InferenceResultInclude<ExtArgs> | null;
    /**
     * Filter, which InferenceResult to fetch.
     */
    where: Prisma.InferenceResultWhereUniqueInput;
};
/**
 * InferenceResult findUniqueOrThrow
 */
export type InferenceResultFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InferenceResult
     */
    select?: Prisma.InferenceResultSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the InferenceResult
     */
    omit?: Prisma.InferenceResultOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.InferenceResultInclude<ExtArgs> | null;
    /**
     * Filter, which InferenceResult to fetch.
     */
    where: Prisma.InferenceResultWhereUniqueInput;
};
/**
 * InferenceResult findFirst
 */
export type InferenceResultFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InferenceResult
     */
    select?: Prisma.InferenceResultSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the InferenceResult
     */
    omit?: Prisma.InferenceResultOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.InferenceResultInclude<ExtArgs> | null;
    /**
     * Filter, which InferenceResult to fetch.
     */
    where?: Prisma.InferenceResultWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of InferenceResults to fetch.
     */
    orderBy?: Prisma.InferenceResultOrderByWithRelationInput | Prisma.InferenceResultOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for InferenceResults.
     */
    cursor?: Prisma.InferenceResultWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` InferenceResults from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` InferenceResults.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of InferenceResults.
     */
    distinct?: Prisma.InferenceResultScalarFieldEnum | Prisma.InferenceResultScalarFieldEnum[];
};
/**
 * InferenceResult findFirstOrThrow
 */
export type InferenceResultFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InferenceResult
     */
    select?: Prisma.InferenceResultSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the InferenceResult
     */
    omit?: Prisma.InferenceResultOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.InferenceResultInclude<ExtArgs> | null;
    /**
     * Filter, which InferenceResult to fetch.
     */
    where?: Prisma.InferenceResultWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of InferenceResults to fetch.
     */
    orderBy?: Prisma.InferenceResultOrderByWithRelationInput | Prisma.InferenceResultOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for InferenceResults.
     */
    cursor?: Prisma.InferenceResultWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` InferenceResults from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` InferenceResults.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of InferenceResults.
     */
    distinct?: Prisma.InferenceResultScalarFieldEnum | Prisma.InferenceResultScalarFieldEnum[];
};
/**
 * InferenceResult findMany
 */
export type InferenceResultFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InferenceResult
     */
    select?: Prisma.InferenceResultSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the InferenceResult
     */
    omit?: Prisma.InferenceResultOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.InferenceResultInclude<ExtArgs> | null;
    /**
     * Filter, which InferenceResults to fetch.
     */
    where?: Prisma.InferenceResultWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of InferenceResults to fetch.
     */
    orderBy?: Prisma.InferenceResultOrderByWithRelationInput | Prisma.InferenceResultOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing InferenceResults.
     */
    cursor?: Prisma.InferenceResultWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` InferenceResults from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` InferenceResults.
     */
    skip?: number;
    distinct?: Prisma.InferenceResultScalarFieldEnum | Prisma.InferenceResultScalarFieldEnum[];
};
/**
 * InferenceResult create
 */
export type InferenceResultCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InferenceResult
     */
    select?: Prisma.InferenceResultSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the InferenceResult
     */
    omit?: Prisma.InferenceResultOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.InferenceResultInclude<ExtArgs> | null;
    /**
     * The data needed to create a InferenceResult.
     */
    data: Prisma.XOR<Prisma.InferenceResultCreateInput, Prisma.InferenceResultUncheckedCreateInput>;
};
/**
 * InferenceResult createMany
 */
export type InferenceResultCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many InferenceResults.
     */
    data: Prisma.InferenceResultCreateManyInput | Prisma.InferenceResultCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * InferenceResult createManyAndReturn
 */
export type InferenceResultCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InferenceResult
     */
    select?: Prisma.InferenceResultSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the InferenceResult
     */
    omit?: Prisma.InferenceResultOmit<ExtArgs> | null;
    /**
     * The data used to create many InferenceResults.
     */
    data: Prisma.InferenceResultCreateManyInput | Prisma.InferenceResultCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.InferenceResultIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * InferenceResult update
 */
export type InferenceResultUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InferenceResult
     */
    select?: Prisma.InferenceResultSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the InferenceResult
     */
    omit?: Prisma.InferenceResultOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.InferenceResultInclude<ExtArgs> | null;
    /**
     * The data needed to update a InferenceResult.
     */
    data: Prisma.XOR<Prisma.InferenceResultUpdateInput, Prisma.InferenceResultUncheckedUpdateInput>;
    /**
     * Choose, which InferenceResult to update.
     */
    where: Prisma.InferenceResultWhereUniqueInput;
};
/**
 * InferenceResult updateMany
 */
export type InferenceResultUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update InferenceResults.
     */
    data: Prisma.XOR<Prisma.InferenceResultUpdateManyMutationInput, Prisma.InferenceResultUncheckedUpdateManyInput>;
    /**
     * Filter which InferenceResults to update
     */
    where?: Prisma.InferenceResultWhereInput;
    /**
     * Limit how many InferenceResults to update.
     */
    limit?: number;
};
/**
 * InferenceResult updateManyAndReturn
 */
export type InferenceResultUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InferenceResult
     */
    select?: Prisma.InferenceResultSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the InferenceResult
     */
    omit?: Prisma.InferenceResultOmit<ExtArgs> | null;
    /**
     * The data used to update InferenceResults.
     */
    data: Prisma.XOR<Prisma.InferenceResultUpdateManyMutationInput, Prisma.InferenceResultUncheckedUpdateManyInput>;
    /**
     * Filter which InferenceResults to update
     */
    where?: Prisma.InferenceResultWhereInput;
    /**
     * Limit how many InferenceResults to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.InferenceResultIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * InferenceResult upsert
 */
export type InferenceResultUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InferenceResult
     */
    select?: Prisma.InferenceResultSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the InferenceResult
     */
    omit?: Prisma.InferenceResultOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.InferenceResultInclude<ExtArgs> | null;
    /**
     * The filter to search for the InferenceResult to update in case it exists.
     */
    where: Prisma.InferenceResultWhereUniqueInput;
    /**
     * In case the InferenceResult found by the `where` argument doesn't exist, create a new InferenceResult with this data.
     */
    create: Prisma.XOR<Prisma.InferenceResultCreateInput, Prisma.InferenceResultUncheckedCreateInput>;
    /**
     * In case the InferenceResult was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.InferenceResultUpdateInput, Prisma.InferenceResultUncheckedUpdateInput>;
};
/**
 * InferenceResult delete
 */
export type InferenceResultDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InferenceResult
     */
    select?: Prisma.InferenceResultSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the InferenceResult
     */
    omit?: Prisma.InferenceResultOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.InferenceResultInclude<ExtArgs> | null;
    /**
     * Filter which InferenceResult to delete.
     */
    where: Prisma.InferenceResultWhereUniqueInput;
};
/**
 * InferenceResult deleteMany
 */
export type InferenceResultDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which InferenceResults to delete
     */
    where?: Prisma.InferenceResultWhereInput;
    /**
     * Limit how many InferenceResults to delete.
     */
    limit?: number;
};
/**
 * InferenceResult without action
 */
export type InferenceResultDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InferenceResult
     */
    select?: Prisma.InferenceResultSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the InferenceResult
     */
    omit?: Prisma.InferenceResultOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.InferenceResultInclude<ExtArgs> | null;
};
export {};
//# sourceMappingURL=InferenceResult.d.ts.map