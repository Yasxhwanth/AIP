import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
/**
 * Model AttributeDefinition
 *
 */
export type AttributeDefinitionModel = runtime.Types.Result.DefaultSelection<Prisma.$AttributeDefinitionPayload>;
export type AggregateAttributeDefinition = {
    _count: AttributeDefinitionCountAggregateOutputType | null;
    _avg: AttributeDefinitionAvgAggregateOutputType | null;
    _sum: AttributeDefinitionSumAggregateOutputType | null;
    _min: AttributeDefinitionMinAggregateOutputType | null;
    _max: AttributeDefinitionMaxAggregateOutputType | null;
};
export type AttributeDefinitionAvgAggregateOutputType = {
    minValue: number | null;
    maxValue: number | null;
};
export type AttributeDefinitionSumAggregateOutputType = {
    minValue: number | null;
    maxValue: number | null;
};
export type AttributeDefinitionMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    dataType: string | null;
    required: boolean | null;
    temporal: boolean | null;
    description: string | null;
    unit: string | null;
    regexPattern: string | null;
    minValue: number | null;
    maxValue: number | null;
    entityTypeId: string | null;
};
export type AttributeDefinitionMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    dataType: string | null;
    required: boolean | null;
    temporal: boolean | null;
    description: string | null;
    unit: string | null;
    regexPattern: string | null;
    minValue: number | null;
    maxValue: number | null;
    entityTypeId: string | null;
};
export type AttributeDefinitionCountAggregateOutputType = {
    id: number;
    name: number;
    dataType: number;
    required: number;
    temporal: number;
    description: number;
    unit: number;
    regexPattern: number;
    minValue: number;
    maxValue: number;
    defaultValue: number;
    allowedValues: number;
    entityTypeId: number;
    _all: number;
};
export type AttributeDefinitionAvgAggregateInputType = {
    minValue?: true;
    maxValue?: true;
};
export type AttributeDefinitionSumAggregateInputType = {
    minValue?: true;
    maxValue?: true;
};
export type AttributeDefinitionMinAggregateInputType = {
    id?: true;
    name?: true;
    dataType?: true;
    required?: true;
    temporal?: true;
    description?: true;
    unit?: true;
    regexPattern?: true;
    minValue?: true;
    maxValue?: true;
    entityTypeId?: true;
};
export type AttributeDefinitionMaxAggregateInputType = {
    id?: true;
    name?: true;
    dataType?: true;
    required?: true;
    temporal?: true;
    description?: true;
    unit?: true;
    regexPattern?: true;
    minValue?: true;
    maxValue?: true;
    entityTypeId?: true;
};
export type AttributeDefinitionCountAggregateInputType = {
    id?: true;
    name?: true;
    dataType?: true;
    required?: true;
    temporal?: true;
    description?: true;
    unit?: true;
    regexPattern?: true;
    minValue?: true;
    maxValue?: true;
    defaultValue?: true;
    allowedValues?: true;
    entityTypeId?: true;
    _all?: true;
};
export type AttributeDefinitionAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which AttributeDefinition to aggregate.
     */
    where?: Prisma.AttributeDefinitionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AttributeDefinitions to fetch.
     */
    orderBy?: Prisma.AttributeDefinitionOrderByWithRelationInput | Prisma.AttributeDefinitionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.AttributeDefinitionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AttributeDefinitions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AttributeDefinitions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned AttributeDefinitions
    **/
    _count?: true | AttributeDefinitionCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: AttributeDefinitionAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: AttributeDefinitionSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: AttributeDefinitionMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: AttributeDefinitionMaxAggregateInputType;
};
export type GetAttributeDefinitionAggregateType<T extends AttributeDefinitionAggregateArgs> = {
    [P in keyof T & keyof AggregateAttributeDefinition]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateAttributeDefinition[P]> : Prisma.GetScalarType<T[P], AggregateAttributeDefinition[P]>;
};
export type AttributeDefinitionGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AttributeDefinitionWhereInput;
    orderBy?: Prisma.AttributeDefinitionOrderByWithAggregationInput | Prisma.AttributeDefinitionOrderByWithAggregationInput[];
    by: Prisma.AttributeDefinitionScalarFieldEnum[] | Prisma.AttributeDefinitionScalarFieldEnum;
    having?: Prisma.AttributeDefinitionScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: AttributeDefinitionCountAggregateInputType | true;
    _avg?: AttributeDefinitionAvgAggregateInputType;
    _sum?: AttributeDefinitionSumAggregateInputType;
    _min?: AttributeDefinitionMinAggregateInputType;
    _max?: AttributeDefinitionMaxAggregateInputType;
};
export type AttributeDefinitionGroupByOutputType = {
    id: string;
    name: string;
    dataType: string;
    required: boolean;
    temporal: boolean;
    description: string | null;
    unit: string | null;
    regexPattern: string | null;
    minValue: number | null;
    maxValue: number | null;
    defaultValue: runtime.JsonValue | null;
    allowedValues: runtime.JsonValue | null;
    entityTypeId: string;
    _count: AttributeDefinitionCountAggregateOutputType | null;
    _avg: AttributeDefinitionAvgAggregateOutputType | null;
    _sum: AttributeDefinitionSumAggregateOutputType | null;
    _min: AttributeDefinitionMinAggregateOutputType | null;
    _max: AttributeDefinitionMaxAggregateOutputType | null;
};
type GetAttributeDefinitionGroupByPayload<T extends AttributeDefinitionGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<AttributeDefinitionGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof AttributeDefinitionGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], AttributeDefinitionGroupByOutputType[P]> : Prisma.GetScalarType<T[P], AttributeDefinitionGroupByOutputType[P]>;
}>>;
export type AttributeDefinitionWhereInput = {
    AND?: Prisma.AttributeDefinitionWhereInput | Prisma.AttributeDefinitionWhereInput[];
    OR?: Prisma.AttributeDefinitionWhereInput[];
    NOT?: Prisma.AttributeDefinitionWhereInput | Prisma.AttributeDefinitionWhereInput[];
    id?: Prisma.StringFilter<"AttributeDefinition"> | string;
    name?: Prisma.StringFilter<"AttributeDefinition"> | string;
    dataType?: Prisma.StringFilter<"AttributeDefinition"> | string;
    required?: Prisma.BoolFilter<"AttributeDefinition"> | boolean;
    temporal?: Prisma.BoolFilter<"AttributeDefinition"> | boolean;
    description?: Prisma.StringNullableFilter<"AttributeDefinition"> | string | null;
    unit?: Prisma.StringNullableFilter<"AttributeDefinition"> | string | null;
    regexPattern?: Prisma.StringNullableFilter<"AttributeDefinition"> | string | null;
    minValue?: Prisma.FloatNullableFilter<"AttributeDefinition"> | number | null;
    maxValue?: Prisma.FloatNullableFilter<"AttributeDefinition"> | number | null;
    defaultValue?: Prisma.JsonNullableFilter<"AttributeDefinition">;
    allowedValues?: Prisma.JsonNullableFilter<"AttributeDefinition">;
    entityTypeId?: Prisma.StringFilter<"AttributeDefinition"> | string;
    entityType?: Prisma.XOR<Prisma.EntityTypeScalarRelationFilter, Prisma.EntityTypeWhereInput>;
};
export type AttributeDefinitionOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    dataType?: Prisma.SortOrder;
    required?: Prisma.SortOrder;
    temporal?: Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    unit?: Prisma.SortOrderInput | Prisma.SortOrder;
    regexPattern?: Prisma.SortOrderInput | Prisma.SortOrder;
    minValue?: Prisma.SortOrderInput | Prisma.SortOrder;
    maxValue?: Prisma.SortOrderInput | Prisma.SortOrder;
    defaultValue?: Prisma.SortOrderInput | Prisma.SortOrder;
    allowedValues?: Prisma.SortOrderInput | Prisma.SortOrder;
    entityTypeId?: Prisma.SortOrder;
    entityType?: Prisma.EntityTypeOrderByWithRelationInput;
};
export type AttributeDefinitionWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.AttributeDefinitionWhereInput | Prisma.AttributeDefinitionWhereInput[];
    OR?: Prisma.AttributeDefinitionWhereInput[];
    NOT?: Prisma.AttributeDefinitionWhereInput | Prisma.AttributeDefinitionWhereInput[];
    name?: Prisma.StringFilter<"AttributeDefinition"> | string;
    dataType?: Prisma.StringFilter<"AttributeDefinition"> | string;
    required?: Prisma.BoolFilter<"AttributeDefinition"> | boolean;
    temporal?: Prisma.BoolFilter<"AttributeDefinition"> | boolean;
    description?: Prisma.StringNullableFilter<"AttributeDefinition"> | string | null;
    unit?: Prisma.StringNullableFilter<"AttributeDefinition"> | string | null;
    regexPattern?: Prisma.StringNullableFilter<"AttributeDefinition"> | string | null;
    minValue?: Prisma.FloatNullableFilter<"AttributeDefinition"> | number | null;
    maxValue?: Prisma.FloatNullableFilter<"AttributeDefinition"> | number | null;
    defaultValue?: Prisma.JsonNullableFilter<"AttributeDefinition">;
    allowedValues?: Prisma.JsonNullableFilter<"AttributeDefinition">;
    entityTypeId?: Prisma.StringFilter<"AttributeDefinition"> | string;
    entityType?: Prisma.XOR<Prisma.EntityTypeScalarRelationFilter, Prisma.EntityTypeWhereInput>;
}, "id">;
export type AttributeDefinitionOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    dataType?: Prisma.SortOrder;
    required?: Prisma.SortOrder;
    temporal?: Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    unit?: Prisma.SortOrderInput | Prisma.SortOrder;
    regexPattern?: Prisma.SortOrderInput | Prisma.SortOrder;
    minValue?: Prisma.SortOrderInput | Prisma.SortOrder;
    maxValue?: Prisma.SortOrderInput | Prisma.SortOrder;
    defaultValue?: Prisma.SortOrderInput | Prisma.SortOrder;
    allowedValues?: Prisma.SortOrderInput | Prisma.SortOrder;
    entityTypeId?: Prisma.SortOrder;
    _count?: Prisma.AttributeDefinitionCountOrderByAggregateInput;
    _avg?: Prisma.AttributeDefinitionAvgOrderByAggregateInput;
    _max?: Prisma.AttributeDefinitionMaxOrderByAggregateInput;
    _min?: Prisma.AttributeDefinitionMinOrderByAggregateInput;
    _sum?: Prisma.AttributeDefinitionSumOrderByAggregateInput;
};
export type AttributeDefinitionScalarWhereWithAggregatesInput = {
    AND?: Prisma.AttributeDefinitionScalarWhereWithAggregatesInput | Prisma.AttributeDefinitionScalarWhereWithAggregatesInput[];
    OR?: Prisma.AttributeDefinitionScalarWhereWithAggregatesInput[];
    NOT?: Prisma.AttributeDefinitionScalarWhereWithAggregatesInput | Prisma.AttributeDefinitionScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"AttributeDefinition"> | string;
    name?: Prisma.StringWithAggregatesFilter<"AttributeDefinition"> | string;
    dataType?: Prisma.StringWithAggregatesFilter<"AttributeDefinition"> | string;
    required?: Prisma.BoolWithAggregatesFilter<"AttributeDefinition"> | boolean;
    temporal?: Prisma.BoolWithAggregatesFilter<"AttributeDefinition"> | boolean;
    description?: Prisma.StringNullableWithAggregatesFilter<"AttributeDefinition"> | string | null;
    unit?: Prisma.StringNullableWithAggregatesFilter<"AttributeDefinition"> | string | null;
    regexPattern?: Prisma.StringNullableWithAggregatesFilter<"AttributeDefinition"> | string | null;
    minValue?: Prisma.FloatNullableWithAggregatesFilter<"AttributeDefinition"> | number | null;
    maxValue?: Prisma.FloatNullableWithAggregatesFilter<"AttributeDefinition"> | number | null;
    defaultValue?: Prisma.JsonNullableWithAggregatesFilter<"AttributeDefinition">;
    allowedValues?: Prisma.JsonNullableWithAggregatesFilter<"AttributeDefinition">;
    entityTypeId?: Prisma.StringWithAggregatesFilter<"AttributeDefinition"> | string;
};
export type AttributeDefinitionCreateInput = {
    id?: string;
    name: string;
    dataType: string;
    required: boolean;
    temporal?: boolean;
    description?: string | null;
    unit?: string | null;
    regexPattern?: string | null;
    minValue?: number | null;
    maxValue?: number | null;
    defaultValue?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    allowedValues?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    entityType: Prisma.EntityTypeCreateNestedOneWithoutAttributesInput;
};
export type AttributeDefinitionUncheckedCreateInput = {
    id?: string;
    name: string;
    dataType: string;
    required: boolean;
    temporal?: boolean;
    description?: string | null;
    unit?: string | null;
    regexPattern?: string | null;
    minValue?: number | null;
    maxValue?: number | null;
    defaultValue?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    allowedValues?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    entityTypeId: string;
};
export type AttributeDefinitionUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    dataType?: Prisma.StringFieldUpdateOperationsInput | string;
    required?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    temporal?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    unit?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    regexPattern?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    minValue?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    maxValue?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    defaultValue?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    allowedValues?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    entityType?: Prisma.EntityTypeUpdateOneRequiredWithoutAttributesNestedInput;
};
export type AttributeDefinitionUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    dataType?: Prisma.StringFieldUpdateOperationsInput | string;
    required?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    temporal?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    unit?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    regexPattern?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    minValue?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    maxValue?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    defaultValue?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    allowedValues?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    entityTypeId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type AttributeDefinitionCreateManyInput = {
    id?: string;
    name: string;
    dataType: string;
    required: boolean;
    temporal?: boolean;
    description?: string | null;
    unit?: string | null;
    regexPattern?: string | null;
    minValue?: number | null;
    maxValue?: number | null;
    defaultValue?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    allowedValues?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    entityTypeId: string;
};
export type AttributeDefinitionUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    dataType?: Prisma.StringFieldUpdateOperationsInput | string;
    required?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    temporal?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    unit?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    regexPattern?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    minValue?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    maxValue?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    defaultValue?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    allowedValues?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
};
export type AttributeDefinitionUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    dataType?: Prisma.StringFieldUpdateOperationsInput | string;
    required?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    temporal?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    unit?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    regexPattern?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    minValue?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    maxValue?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    defaultValue?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    allowedValues?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    entityTypeId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type AttributeDefinitionListRelationFilter = {
    every?: Prisma.AttributeDefinitionWhereInput;
    some?: Prisma.AttributeDefinitionWhereInput;
    none?: Prisma.AttributeDefinitionWhereInput;
};
export type AttributeDefinitionOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type AttributeDefinitionCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    dataType?: Prisma.SortOrder;
    required?: Prisma.SortOrder;
    temporal?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    unit?: Prisma.SortOrder;
    regexPattern?: Prisma.SortOrder;
    minValue?: Prisma.SortOrder;
    maxValue?: Prisma.SortOrder;
    defaultValue?: Prisma.SortOrder;
    allowedValues?: Prisma.SortOrder;
    entityTypeId?: Prisma.SortOrder;
};
export type AttributeDefinitionAvgOrderByAggregateInput = {
    minValue?: Prisma.SortOrder;
    maxValue?: Prisma.SortOrder;
};
export type AttributeDefinitionMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    dataType?: Prisma.SortOrder;
    required?: Prisma.SortOrder;
    temporal?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    unit?: Prisma.SortOrder;
    regexPattern?: Prisma.SortOrder;
    minValue?: Prisma.SortOrder;
    maxValue?: Prisma.SortOrder;
    entityTypeId?: Prisma.SortOrder;
};
export type AttributeDefinitionMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    dataType?: Prisma.SortOrder;
    required?: Prisma.SortOrder;
    temporal?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    unit?: Prisma.SortOrder;
    regexPattern?: Prisma.SortOrder;
    minValue?: Prisma.SortOrder;
    maxValue?: Prisma.SortOrder;
    entityTypeId?: Prisma.SortOrder;
};
export type AttributeDefinitionSumOrderByAggregateInput = {
    minValue?: Prisma.SortOrder;
    maxValue?: Prisma.SortOrder;
};
export type AttributeDefinitionCreateNestedManyWithoutEntityTypeInput = {
    create?: Prisma.XOR<Prisma.AttributeDefinitionCreateWithoutEntityTypeInput, Prisma.AttributeDefinitionUncheckedCreateWithoutEntityTypeInput> | Prisma.AttributeDefinitionCreateWithoutEntityTypeInput[] | Prisma.AttributeDefinitionUncheckedCreateWithoutEntityTypeInput[];
    connectOrCreate?: Prisma.AttributeDefinitionCreateOrConnectWithoutEntityTypeInput | Prisma.AttributeDefinitionCreateOrConnectWithoutEntityTypeInput[];
    createMany?: Prisma.AttributeDefinitionCreateManyEntityTypeInputEnvelope;
    connect?: Prisma.AttributeDefinitionWhereUniqueInput | Prisma.AttributeDefinitionWhereUniqueInput[];
};
export type AttributeDefinitionUncheckedCreateNestedManyWithoutEntityTypeInput = {
    create?: Prisma.XOR<Prisma.AttributeDefinitionCreateWithoutEntityTypeInput, Prisma.AttributeDefinitionUncheckedCreateWithoutEntityTypeInput> | Prisma.AttributeDefinitionCreateWithoutEntityTypeInput[] | Prisma.AttributeDefinitionUncheckedCreateWithoutEntityTypeInput[];
    connectOrCreate?: Prisma.AttributeDefinitionCreateOrConnectWithoutEntityTypeInput | Prisma.AttributeDefinitionCreateOrConnectWithoutEntityTypeInput[];
    createMany?: Prisma.AttributeDefinitionCreateManyEntityTypeInputEnvelope;
    connect?: Prisma.AttributeDefinitionWhereUniqueInput | Prisma.AttributeDefinitionWhereUniqueInput[];
};
export type AttributeDefinitionUpdateManyWithoutEntityTypeNestedInput = {
    create?: Prisma.XOR<Prisma.AttributeDefinitionCreateWithoutEntityTypeInput, Prisma.AttributeDefinitionUncheckedCreateWithoutEntityTypeInput> | Prisma.AttributeDefinitionCreateWithoutEntityTypeInput[] | Prisma.AttributeDefinitionUncheckedCreateWithoutEntityTypeInput[];
    connectOrCreate?: Prisma.AttributeDefinitionCreateOrConnectWithoutEntityTypeInput | Prisma.AttributeDefinitionCreateOrConnectWithoutEntityTypeInput[];
    upsert?: Prisma.AttributeDefinitionUpsertWithWhereUniqueWithoutEntityTypeInput | Prisma.AttributeDefinitionUpsertWithWhereUniqueWithoutEntityTypeInput[];
    createMany?: Prisma.AttributeDefinitionCreateManyEntityTypeInputEnvelope;
    set?: Prisma.AttributeDefinitionWhereUniqueInput | Prisma.AttributeDefinitionWhereUniqueInput[];
    disconnect?: Prisma.AttributeDefinitionWhereUniqueInput | Prisma.AttributeDefinitionWhereUniqueInput[];
    delete?: Prisma.AttributeDefinitionWhereUniqueInput | Prisma.AttributeDefinitionWhereUniqueInput[];
    connect?: Prisma.AttributeDefinitionWhereUniqueInput | Prisma.AttributeDefinitionWhereUniqueInput[];
    update?: Prisma.AttributeDefinitionUpdateWithWhereUniqueWithoutEntityTypeInput | Prisma.AttributeDefinitionUpdateWithWhereUniqueWithoutEntityTypeInput[];
    updateMany?: Prisma.AttributeDefinitionUpdateManyWithWhereWithoutEntityTypeInput | Prisma.AttributeDefinitionUpdateManyWithWhereWithoutEntityTypeInput[];
    deleteMany?: Prisma.AttributeDefinitionScalarWhereInput | Prisma.AttributeDefinitionScalarWhereInput[];
};
export type AttributeDefinitionUncheckedUpdateManyWithoutEntityTypeNestedInput = {
    create?: Prisma.XOR<Prisma.AttributeDefinitionCreateWithoutEntityTypeInput, Prisma.AttributeDefinitionUncheckedCreateWithoutEntityTypeInput> | Prisma.AttributeDefinitionCreateWithoutEntityTypeInput[] | Prisma.AttributeDefinitionUncheckedCreateWithoutEntityTypeInput[];
    connectOrCreate?: Prisma.AttributeDefinitionCreateOrConnectWithoutEntityTypeInput | Prisma.AttributeDefinitionCreateOrConnectWithoutEntityTypeInput[];
    upsert?: Prisma.AttributeDefinitionUpsertWithWhereUniqueWithoutEntityTypeInput | Prisma.AttributeDefinitionUpsertWithWhereUniqueWithoutEntityTypeInput[];
    createMany?: Prisma.AttributeDefinitionCreateManyEntityTypeInputEnvelope;
    set?: Prisma.AttributeDefinitionWhereUniqueInput | Prisma.AttributeDefinitionWhereUniqueInput[];
    disconnect?: Prisma.AttributeDefinitionWhereUniqueInput | Prisma.AttributeDefinitionWhereUniqueInput[];
    delete?: Prisma.AttributeDefinitionWhereUniqueInput | Prisma.AttributeDefinitionWhereUniqueInput[];
    connect?: Prisma.AttributeDefinitionWhereUniqueInput | Prisma.AttributeDefinitionWhereUniqueInput[];
    update?: Prisma.AttributeDefinitionUpdateWithWhereUniqueWithoutEntityTypeInput | Prisma.AttributeDefinitionUpdateWithWhereUniqueWithoutEntityTypeInput[];
    updateMany?: Prisma.AttributeDefinitionUpdateManyWithWhereWithoutEntityTypeInput | Prisma.AttributeDefinitionUpdateManyWithWhereWithoutEntityTypeInput[];
    deleteMany?: Prisma.AttributeDefinitionScalarWhereInput | Prisma.AttributeDefinitionScalarWhereInput[];
};
export type BoolFieldUpdateOperationsInput = {
    set?: boolean;
};
export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type AttributeDefinitionCreateWithoutEntityTypeInput = {
    id?: string;
    name: string;
    dataType: string;
    required: boolean;
    temporal?: boolean;
    description?: string | null;
    unit?: string | null;
    regexPattern?: string | null;
    minValue?: number | null;
    maxValue?: number | null;
    defaultValue?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    allowedValues?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
};
export type AttributeDefinitionUncheckedCreateWithoutEntityTypeInput = {
    id?: string;
    name: string;
    dataType: string;
    required: boolean;
    temporal?: boolean;
    description?: string | null;
    unit?: string | null;
    regexPattern?: string | null;
    minValue?: number | null;
    maxValue?: number | null;
    defaultValue?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    allowedValues?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
};
export type AttributeDefinitionCreateOrConnectWithoutEntityTypeInput = {
    where: Prisma.AttributeDefinitionWhereUniqueInput;
    create: Prisma.XOR<Prisma.AttributeDefinitionCreateWithoutEntityTypeInput, Prisma.AttributeDefinitionUncheckedCreateWithoutEntityTypeInput>;
};
export type AttributeDefinitionCreateManyEntityTypeInputEnvelope = {
    data: Prisma.AttributeDefinitionCreateManyEntityTypeInput | Prisma.AttributeDefinitionCreateManyEntityTypeInput[];
    skipDuplicates?: boolean;
};
export type AttributeDefinitionUpsertWithWhereUniqueWithoutEntityTypeInput = {
    where: Prisma.AttributeDefinitionWhereUniqueInput;
    update: Prisma.XOR<Prisma.AttributeDefinitionUpdateWithoutEntityTypeInput, Prisma.AttributeDefinitionUncheckedUpdateWithoutEntityTypeInput>;
    create: Prisma.XOR<Prisma.AttributeDefinitionCreateWithoutEntityTypeInput, Prisma.AttributeDefinitionUncheckedCreateWithoutEntityTypeInput>;
};
export type AttributeDefinitionUpdateWithWhereUniqueWithoutEntityTypeInput = {
    where: Prisma.AttributeDefinitionWhereUniqueInput;
    data: Prisma.XOR<Prisma.AttributeDefinitionUpdateWithoutEntityTypeInput, Prisma.AttributeDefinitionUncheckedUpdateWithoutEntityTypeInput>;
};
export type AttributeDefinitionUpdateManyWithWhereWithoutEntityTypeInput = {
    where: Prisma.AttributeDefinitionScalarWhereInput;
    data: Prisma.XOR<Prisma.AttributeDefinitionUpdateManyMutationInput, Prisma.AttributeDefinitionUncheckedUpdateManyWithoutEntityTypeInput>;
};
export type AttributeDefinitionScalarWhereInput = {
    AND?: Prisma.AttributeDefinitionScalarWhereInput | Prisma.AttributeDefinitionScalarWhereInput[];
    OR?: Prisma.AttributeDefinitionScalarWhereInput[];
    NOT?: Prisma.AttributeDefinitionScalarWhereInput | Prisma.AttributeDefinitionScalarWhereInput[];
    id?: Prisma.StringFilter<"AttributeDefinition"> | string;
    name?: Prisma.StringFilter<"AttributeDefinition"> | string;
    dataType?: Prisma.StringFilter<"AttributeDefinition"> | string;
    required?: Prisma.BoolFilter<"AttributeDefinition"> | boolean;
    temporal?: Prisma.BoolFilter<"AttributeDefinition"> | boolean;
    description?: Prisma.StringNullableFilter<"AttributeDefinition"> | string | null;
    unit?: Prisma.StringNullableFilter<"AttributeDefinition"> | string | null;
    regexPattern?: Prisma.StringNullableFilter<"AttributeDefinition"> | string | null;
    minValue?: Prisma.FloatNullableFilter<"AttributeDefinition"> | number | null;
    maxValue?: Prisma.FloatNullableFilter<"AttributeDefinition"> | number | null;
    defaultValue?: Prisma.JsonNullableFilter<"AttributeDefinition">;
    allowedValues?: Prisma.JsonNullableFilter<"AttributeDefinition">;
    entityTypeId?: Prisma.StringFilter<"AttributeDefinition"> | string;
};
export type AttributeDefinitionCreateManyEntityTypeInput = {
    id?: string;
    name: string;
    dataType: string;
    required: boolean;
    temporal?: boolean;
    description?: string | null;
    unit?: string | null;
    regexPattern?: string | null;
    minValue?: number | null;
    maxValue?: number | null;
    defaultValue?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    allowedValues?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
};
export type AttributeDefinitionUpdateWithoutEntityTypeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    dataType?: Prisma.StringFieldUpdateOperationsInput | string;
    required?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    temporal?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    unit?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    regexPattern?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    minValue?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    maxValue?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    defaultValue?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    allowedValues?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
};
export type AttributeDefinitionUncheckedUpdateWithoutEntityTypeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    dataType?: Prisma.StringFieldUpdateOperationsInput | string;
    required?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    temporal?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    unit?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    regexPattern?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    minValue?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    maxValue?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    defaultValue?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    allowedValues?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
};
export type AttributeDefinitionUncheckedUpdateManyWithoutEntityTypeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    dataType?: Prisma.StringFieldUpdateOperationsInput | string;
    required?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    temporal?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    unit?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    regexPattern?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    minValue?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    maxValue?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    defaultValue?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    allowedValues?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
};
export type AttributeDefinitionSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    dataType?: boolean;
    required?: boolean;
    temporal?: boolean;
    description?: boolean;
    unit?: boolean;
    regexPattern?: boolean;
    minValue?: boolean;
    maxValue?: boolean;
    defaultValue?: boolean;
    allowedValues?: boolean;
    entityTypeId?: boolean;
    entityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["attributeDefinition"]>;
export type AttributeDefinitionSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    dataType?: boolean;
    required?: boolean;
    temporal?: boolean;
    description?: boolean;
    unit?: boolean;
    regexPattern?: boolean;
    minValue?: boolean;
    maxValue?: boolean;
    defaultValue?: boolean;
    allowedValues?: boolean;
    entityTypeId?: boolean;
    entityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["attributeDefinition"]>;
export type AttributeDefinitionSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    dataType?: boolean;
    required?: boolean;
    temporal?: boolean;
    description?: boolean;
    unit?: boolean;
    regexPattern?: boolean;
    minValue?: boolean;
    maxValue?: boolean;
    defaultValue?: boolean;
    allowedValues?: boolean;
    entityTypeId?: boolean;
    entityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["attributeDefinition"]>;
export type AttributeDefinitionSelectScalar = {
    id?: boolean;
    name?: boolean;
    dataType?: boolean;
    required?: boolean;
    temporal?: boolean;
    description?: boolean;
    unit?: boolean;
    regexPattern?: boolean;
    minValue?: boolean;
    maxValue?: boolean;
    defaultValue?: boolean;
    allowedValues?: boolean;
    entityTypeId?: boolean;
};
export type AttributeDefinitionOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "name" | "dataType" | "required" | "temporal" | "description" | "unit" | "regexPattern" | "minValue" | "maxValue" | "defaultValue" | "allowedValues" | "entityTypeId", ExtArgs["result"]["attributeDefinition"]>;
export type AttributeDefinitionInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    entityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
};
export type AttributeDefinitionIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    entityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
};
export type AttributeDefinitionIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    entityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
};
export type $AttributeDefinitionPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "AttributeDefinition";
    objects: {
        entityType: Prisma.$EntityTypePayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        name: string;
        dataType: string;
        required: boolean;
        temporal: boolean;
        description: string | null;
        unit: string | null;
        regexPattern: string | null;
        minValue: number | null;
        maxValue: number | null;
        defaultValue: runtime.JsonValue | null;
        allowedValues: runtime.JsonValue | null;
        entityTypeId: string;
    }, ExtArgs["result"]["attributeDefinition"]>;
    composites: {};
};
export type AttributeDefinitionGetPayload<S extends boolean | null | undefined | AttributeDefinitionDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$AttributeDefinitionPayload, S>;
export type AttributeDefinitionCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<AttributeDefinitionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: AttributeDefinitionCountAggregateInputType | true;
};
export interface AttributeDefinitionDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['AttributeDefinition'];
        meta: {
            name: 'AttributeDefinition';
        };
    };
    /**
     * Find zero or one AttributeDefinition that matches the filter.
     * @param {AttributeDefinitionFindUniqueArgs} args - Arguments to find a AttributeDefinition
     * @example
     * // Get one AttributeDefinition
     * const attributeDefinition = await prisma.attributeDefinition.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AttributeDefinitionFindUniqueArgs>(args: Prisma.SelectSubset<T, AttributeDefinitionFindUniqueArgs<ExtArgs>>): Prisma.Prisma__AttributeDefinitionClient<runtime.Types.Result.GetResult<Prisma.$AttributeDefinitionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one AttributeDefinition that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AttributeDefinitionFindUniqueOrThrowArgs} args - Arguments to find a AttributeDefinition
     * @example
     * // Get one AttributeDefinition
     * const attributeDefinition = await prisma.attributeDefinition.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AttributeDefinitionFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, AttributeDefinitionFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__AttributeDefinitionClient<runtime.Types.Result.GetResult<Prisma.$AttributeDefinitionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first AttributeDefinition that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttributeDefinitionFindFirstArgs} args - Arguments to find a AttributeDefinition
     * @example
     * // Get one AttributeDefinition
     * const attributeDefinition = await prisma.attributeDefinition.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AttributeDefinitionFindFirstArgs>(args?: Prisma.SelectSubset<T, AttributeDefinitionFindFirstArgs<ExtArgs>>): Prisma.Prisma__AttributeDefinitionClient<runtime.Types.Result.GetResult<Prisma.$AttributeDefinitionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first AttributeDefinition that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttributeDefinitionFindFirstOrThrowArgs} args - Arguments to find a AttributeDefinition
     * @example
     * // Get one AttributeDefinition
     * const attributeDefinition = await prisma.attributeDefinition.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AttributeDefinitionFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, AttributeDefinitionFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__AttributeDefinitionClient<runtime.Types.Result.GetResult<Prisma.$AttributeDefinitionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more AttributeDefinitions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttributeDefinitionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AttributeDefinitions
     * const attributeDefinitions = await prisma.attributeDefinition.findMany()
     *
     * // Get first 10 AttributeDefinitions
     * const attributeDefinitions = await prisma.attributeDefinition.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const attributeDefinitionWithIdOnly = await prisma.attributeDefinition.findMany({ select: { id: true } })
     *
     */
    findMany<T extends AttributeDefinitionFindManyArgs>(args?: Prisma.SelectSubset<T, AttributeDefinitionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AttributeDefinitionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a AttributeDefinition.
     * @param {AttributeDefinitionCreateArgs} args - Arguments to create a AttributeDefinition.
     * @example
     * // Create one AttributeDefinition
     * const AttributeDefinition = await prisma.attributeDefinition.create({
     *   data: {
     *     // ... data to create a AttributeDefinition
     *   }
     * })
     *
     */
    create<T extends AttributeDefinitionCreateArgs>(args: Prisma.SelectSubset<T, AttributeDefinitionCreateArgs<ExtArgs>>): Prisma.Prisma__AttributeDefinitionClient<runtime.Types.Result.GetResult<Prisma.$AttributeDefinitionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many AttributeDefinitions.
     * @param {AttributeDefinitionCreateManyArgs} args - Arguments to create many AttributeDefinitions.
     * @example
     * // Create many AttributeDefinitions
     * const attributeDefinition = await prisma.attributeDefinition.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends AttributeDefinitionCreateManyArgs>(args?: Prisma.SelectSubset<T, AttributeDefinitionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many AttributeDefinitions and returns the data saved in the database.
     * @param {AttributeDefinitionCreateManyAndReturnArgs} args - Arguments to create many AttributeDefinitions.
     * @example
     * // Create many AttributeDefinitions
     * const attributeDefinition = await prisma.attributeDefinition.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many AttributeDefinitions and only return the `id`
     * const attributeDefinitionWithIdOnly = await prisma.attributeDefinition.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends AttributeDefinitionCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, AttributeDefinitionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AttributeDefinitionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a AttributeDefinition.
     * @param {AttributeDefinitionDeleteArgs} args - Arguments to delete one AttributeDefinition.
     * @example
     * // Delete one AttributeDefinition
     * const AttributeDefinition = await prisma.attributeDefinition.delete({
     *   where: {
     *     // ... filter to delete one AttributeDefinition
     *   }
     * })
     *
     */
    delete<T extends AttributeDefinitionDeleteArgs>(args: Prisma.SelectSubset<T, AttributeDefinitionDeleteArgs<ExtArgs>>): Prisma.Prisma__AttributeDefinitionClient<runtime.Types.Result.GetResult<Prisma.$AttributeDefinitionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one AttributeDefinition.
     * @param {AttributeDefinitionUpdateArgs} args - Arguments to update one AttributeDefinition.
     * @example
     * // Update one AttributeDefinition
     * const attributeDefinition = await prisma.attributeDefinition.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends AttributeDefinitionUpdateArgs>(args: Prisma.SelectSubset<T, AttributeDefinitionUpdateArgs<ExtArgs>>): Prisma.Prisma__AttributeDefinitionClient<runtime.Types.Result.GetResult<Prisma.$AttributeDefinitionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more AttributeDefinitions.
     * @param {AttributeDefinitionDeleteManyArgs} args - Arguments to filter AttributeDefinitions to delete.
     * @example
     * // Delete a few AttributeDefinitions
     * const { count } = await prisma.attributeDefinition.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends AttributeDefinitionDeleteManyArgs>(args?: Prisma.SelectSubset<T, AttributeDefinitionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more AttributeDefinitions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttributeDefinitionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AttributeDefinitions
     * const attributeDefinition = await prisma.attributeDefinition.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends AttributeDefinitionUpdateManyArgs>(args: Prisma.SelectSubset<T, AttributeDefinitionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more AttributeDefinitions and returns the data updated in the database.
     * @param {AttributeDefinitionUpdateManyAndReturnArgs} args - Arguments to update many AttributeDefinitions.
     * @example
     * // Update many AttributeDefinitions
     * const attributeDefinition = await prisma.attributeDefinition.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more AttributeDefinitions and only return the `id`
     * const attributeDefinitionWithIdOnly = await prisma.attributeDefinition.updateManyAndReturn({
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
    updateManyAndReturn<T extends AttributeDefinitionUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, AttributeDefinitionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AttributeDefinitionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one AttributeDefinition.
     * @param {AttributeDefinitionUpsertArgs} args - Arguments to update or create a AttributeDefinition.
     * @example
     * // Update or create a AttributeDefinition
     * const attributeDefinition = await prisma.attributeDefinition.upsert({
     *   create: {
     *     // ... data to create a AttributeDefinition
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AttributeDefinition we want to update
     *   }
     * })
     */
    upsert<T extends AttributeDefinitionUpsertArgs>(args: Prisma.SelectSubset<T, AttributeDefinitionUpsertArgs<ExtArgs>>): Prisma.Prisma__AttributeDefinitionClient<runtime.Types.Result.GetResult<Prisma.$AttributeDefinitionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of AttributeDefinitions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttributeDefinitionCountArgs} args - Arguments to filter AttributeDefinitions to count.
     * @example
     * // Count the number of AttributeDefinitions
     * const count = await prisma.attributeDefinition.count({
     *   where: {
     *     // ... the filter for the AttributeDefinitions we want to count
     *   }
     * })
    **/
    count<T extends AttributeDefinitionCountArgs>(args?: Prisma.Subset<T, AttributeDefinitionCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], AttributeDefinitionCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a AttributeDefinition.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttributeDefinitionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends AttributeDefinitionAggregateArgs>(args: Prisma.Subset<T, AttributeDefinitionAggregateArgs>): Prisma.PrismaPromise<GetAttributeDefinitionAggregateType<T>>;
    /**
     * Group by AttributeDefinition.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttributeDefinitionGroupByArgs} args - Group by arguments.
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
    groupBy<T extends AttributeDefinitionGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: AttributeDefinitionGroupByArgs['orderBy'];
    } : {
        orderBy?: AttributeDefinitionGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, AttributeDefinitionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAttributeDefinitionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the AttributeDefinition model
     */
    readonly fields: AttributeDefinitionFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for AttributeDefinition.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__AttributeDefinitionClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
 * Fields of the AttributeDefinition model
 */
export interface AttributeDefinitionFieldRefs {
    readonly id: Prisma.FieldRef<"AttributeDefinition", 'String'>;
    readonly name: Prisma.FieldRef<"AttributeDefinition", 'String'>;
    readonly dataType: Prisma.FieldRef<"AttributeDefinition", 'String'>;
    readonly required: Prisma.FieldRef<"AttributeDefinition", 'Boolean'>;
    readonly temporal: Prisma.FieldRef<"AttributeDefinition", 'Boolean'>;
    readonly description: Prisma.FieldRef<"AttributeDefinition", 'String'>;
    readonly unit: Prisma.FieldRef<"AttributeDefinition", 'String'>;
    readonly regexPattern: Prisma.FieldRef<"AttributeDefinition", 'String'>;
    readonly minValue: Prisma.FieldRef<"AttributeDefinition", 'Float'>;
    readonly maxValue: Prisma.FieldRef<"AttributeDefinition", 'Float'>;
    readonly defaultValue: Prisma.FieldRef<"AttributeDefinition", 'Json'>;
    readonly allowedValues: Prisma.FieldRef<"AttributeDefinition", 'Json'>;
    readonly entityTypeId: Prisma.FieldRef<"AttributeDefinition", 'String'>;
}
/**
 * AttributeDefinition findUnique
 */
export type AttributeDefinitionFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AttributeDefinition
     */
    select?: Prisma.AttributeDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AttributeDefinition
     */
    omit?: Prisma.AttributeDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AttributeDefinitionInclude<ExtArgs> | null;
    /**
     * Filter, which AttributeDefinition to fetch.
     */
    where: Prisma.AttributeDefinitionWhereUniqueInput;
};
/**
 * AttributeDefinition findUniqueOrThrow
 */
export type AttributeDefinitionFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AttributeDefinition
     */
    select?: Prisma.AttributeDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AttributeDefinition
     */
    omit?: Prisma.AttributeDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AttributeDefinitionInclude<ExtArgs> | null;
    /**
     * Filter, which AttributeDefinition to fetch.
     */
    where: Prisma.AttributeDefinitionWhereUniqueInput;
};
/**
 * AttributeDefinition findFirst
 */
export type AttributeDefinitionFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AttributeDefinition
     */
    select?: Prisma.AttributeDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AttributeDefinition
     */
    omit?: Prisma.AttributeDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AttributeDefinitionInclude<ExtArgs> | null;
    /**
     * Filter, which AttributeDefinition to fetch.
     */
    where?: Prisma.AttributeDefinitionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AttributeDefinitions to fetch.
     */
    orderBy?: Prisma.AttributeDefinitionOrderByWithRelationInput | Prisma.AttributeDefinitionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for AttributeDefinitions.
     */
    cursor?: Prisma.AttributeDefinitionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AttributeDefinitions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AttributeDefinitions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of AttributeDefinitions.
     */
    distinct?: Prisma.AttributeDefinitionScalarFieldEnum | Prisma.AttributeDefinitionScalarFieldEnum[];
};
/**
 * AttributeDefinition findFirstOrThrow
 */
export type AttributeDefinitionFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AttributeDefinition
     */
    select?: Prisma.AttributeDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AttributeDefinition
     */
    omit?: Prisma.AttributeDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AttributeDefinitionInclude<ExtArgs> | null;
    /**
     * Filter, which AttributeDefinition to fetch.
     */
    where?: Prisma.AttributeDefinitionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AttributeDefinitions to fetch.
     */
    orderBy?: Prisma.AttributeDefinitionOrderByWithRelationInput | Prisma.AttributeDefinitionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for AttributeDefinitions.
     */
    cursor?: Prisma.AttributeDefinitionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AttributeDefinitions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AttributeDefinitions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of AttributeDefinitions.
     */
    distinct?: Prisma.AttributeDefinitionScalarFieldEnum | Prisma.AttributeDefinitionScalarFieldEnum[];
};
/**
 * AttributeDefinition findMany
 */
export type AttributeDefinitionFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AttributeDefinition
     */
    select?: Prisma.AttributeDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AttributeDefinition
     */
    omit?: Prisma.AttributeDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AttributeDefinitionInclude<ExtArgs> | null;
    /**
     * Filter, which AttributeDefinitions to fetch.
     */
    where?: Prisma.AttributeDefinitionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AttributeDefinitions to fetch.
     */
    orderBy?: Prisma.AttributeDefinitionOrderByWithRelationInput | Prisma.AttributeDefinitionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing AttributeDefinitions.
     */
    cursor?: Prisma.AttributeDefinitionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AttributeDefinitions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AttributeDefinitions.
     */
    skip?: number;
    distinct?: Prisma.AttributeDefinitionScalarFieldEnum | Prisma.AttributeDefinitionScalarFieldEnum[];
};
/**
 * AttributeDefinition create
 */
export type AttributeDefinitionCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AttributeDefinition
     */
    select?: Prisma.AttributeDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AttributeDefinition
     */
    omit?: Prisma.AttributeDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AttributeDefinitionInclude<ExtArgs> | null;
    /**
     * The data needed to create a AttributeDefinition.
     */
    data: Prisma.XOR<Prisma.AttributeDefinitionCreateInput, Prisma.AttributeDefinitionUncheckedCreateInput>;
};
/**
 * AttributeDefinition createMany
 */
export type AttributeDefinitionCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many AttributeDefinitions.
     */
    data: Prisma.AttributeDefinitionCreateManyInput | Prisma.AttributeDefinitionCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * AttributeDefinition createManyAndReturn
 */
export type AttributeDefinitionCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AttributeDefinition
     */
    select?: Prisma.AttributeDefinitionSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the AttributeDefinition
     */
    omit?: Prisma.AttributeDefinitionOmit<ExtArgs> | null;
    /**
     * The data used to create many AttributeDefinitions.
     */
    data: Prisma.AttributeDefinitionCreateManyInput | Prisma.AttributeDefinitionCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AttributeDefinitionIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * AttributeDefinition update
 */
export type AttributeDefinitionUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AttributeDefinition
     */
    select?: Prisma.AttributeDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AttributeDefinition
     */
    omit?: Prisma.AttributeDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AttributeDefinitionInclude<ExtArgs> | null;
    /**
     * The data needed to update a AttributeDefinition.
     */
    data: Prisma.XOR<Prisma.AttributeDefinitionUpdateInput, Prisma.AttributeDefinitionUncheckedUpdateInput>;
    /**
     * Choose, which AttributeDefinition to update.
     */
    where: Prisma.AttributeDefinitionWhereUniqueInput;
};
/**
 * AttributeDefinition updateMany
 */
export type AttributeDefinitionUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update AttributeDefinitions.
     */
    data: Prisma.XOR<Prisma.AttributeDefinitionUpdateManyMutationInput, Prisma.AttributeDefinitionUncheckedUpdateManyInput>;
    /**
     * Filter which AttributeDefinitions to update
     */
    where?: Prisma.AttributeDefinitionWhereInput;
    /**
     * Limit how many AttributeDefinitions to update.
     */
    limit?: number;
};
/**
 * AttributeDefinition updateManyAndReturn
 */
export type AttributeDefinitionUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AttributeDefinition
     */
    select?: Prisma.AttributeDefinitionSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the AttributeDefinition
     */
    omit?: Prisma.AttributeDefinitionOmit<ExtArgs> | null;
    /**
     * The data used to update AttributeDefinitions.
     */
    data: Prisma.XOR<Prisma.AttributeDefinitionUpdateManyMutationInput, Prisma.AttributeDefinitionUncheckedUpdateManyInput>;
    /**
     * Filter which AttributeDefinitions to update
     */
    where?: Prisma.AttributeDefinitionWhereInput;
    /**
     * Limit how many AttributeDefinitions to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AttributeDefinitionIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * AttributeDefinition upsert
 */
export type AttributeDefinitionUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AttributeDefinition
     */
    select?: Prisma.AttributeDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AttributeDefinition
     */
    omit?: Prisma.AttributeDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AttributeDefinitionInclude<ExtArgs> | null;
    /**
     * The filter to search for the AttributeDefinition to update in case it exists.
     */
    where: Prisma.AttributeDefinitionWhereUniqueInput;
    /**
     * In case the AttributeDefinition found by the `where` argument doesn't exist, create a new AttributeDefinition with this data.
     */
    create: Prisma.XOR<Prisma.AttributeDefinitionCreateInput, Prisma.AttributeDefinitionUncheckedCreateInput>;
    /**
     * In case the AttributeDefinition was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.AttributeDefinitionUpdateInput, Prisma.AttributeDefinitionUncheckedUpdateInput>;
};
/**
 * AttributeDefinition delete
 */
export type AttributeDefinitionDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AttributeDefinition
     */
    select?: Prisma.AttributeDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AttributeDefinition
     */
    omit?: Prisma.AttributeDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AttributeDefinitionInclude<ExtArgs> | null;
    /**
     * Filter which AttributeDefinition to delete.
     */
    where: Prisma.AttributeDefinitionWhereUniqueInput;
};
/**
 * AttributeDefinition deleteMany
 */
export type AttributeDefinitionDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which AttributeDefinitions to delete
     */
    where?: Prisma.AttributeDefinitionWhereInput;
    /**
     * Limit how many AttributeDefinitions to delete.
     */
    limit?: number;
};
/**
 * AttributeDefinition without action
 */
export type AttributeDefinitionDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AttributeDefinition
     */
    select?: Prisma.AttributeDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AttributeDefinition
     */
    omit?: Prisma.AttributeDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AttributeDefinitionInclude<ExtArgs> | null;
};
export {};
//# sourceMappingURL=AttributeDefinition.d.ts.map