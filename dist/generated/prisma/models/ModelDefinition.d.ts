import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
/**
 * Model ModelDefinition
 *
 */
export type ModelDefinitionModel = runtime.Types.Result.DefaultSelection<Prisma.$ModelDefinitionPayload>;
export type AggregateModelDefinition = {
    _count: ModelDefinitionCountAggregateOutputType | null;
    _min: ModelDefinitionMinAggregateOutputType | null;
    _max: ModelDefinitionMaxAggregateOutputType | null;
};
export type ModelDefinitionMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    entityTypeId: string | null;
    description: string | null;
    outputField: string | null;
    createdAt: Date | null;
};
export type ModelDefinitionMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    entityTypeId: string | null;
    description: string | null;
    outputField: string | null;
    createdAt: Date | null;
};
export type ModelDefinitionCountAggregateOutputType = {
    id: number;
    name: number;
    entityTypeId: number;
    description: number;
    inputFields: number;
    outputField: number;
    createdAt: number;
    _all: number;
};
export type ModelDefinitionMinAggregateInputType = {
    id?: true;
    name?: true;
    entityTypeId?: true;
    description?: true;
    outputField?: true;
    createdAt?: true;
};
export type ModelDefinitionMaxAggregateInputType = {
    id?: true;
    name?: true;
    entityTypeId?: true;
    description?: true;
    outputField?: true;
    createdAt?: true;
};
export type ModelDefinitionCountAggregateInputType = {
    id?: true;
    name?: true;
    entityTypeId?: true;
    description?: true;
    inputFields?: true;
    outputField?: true;
    createdAt?: true;
    _all?: true;
};
export type ModelDefinitionAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which ModelDefinition to aggregate.
     */
    where?: Prisma.ModelDefinitionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ModelDefinitions to fetch.
     */
    orderBy?: Prisma.ModelDefinitionOrderByWithRelationInput | Prisma.ModelDefinitionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.ModelDefinitionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ModelDefinitions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ModelDefinitions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned ModelDefinitions
    **/
    _count?: true | ModelDefinitionCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: ModelDefinitionMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: ModelDefinitionMaxAggregateInputType;
};
export type GetModelDefinitionAggregateType<T extends ModelDefinitionAggregateArgs> = {
    [P in keyof T & keyof AggregateModelDefinition]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateModelDefinition[P]> : Prisma.GetScalarType<T[P], AggregateModelDefinition[P]>;
};
export type ModelDefinitionGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ModelDefinitionWhereInput;
    orderBy?: Prisma.ModelDefinitionOrderByWithAggregationInput | Prisma.ModelDefinitionOrderByWithAggregationInput[];
    by: Prisma.ModelDefinitionScalarFieldEnum[] | Prisma.ModelDefinitionScalarFieldEnum;
    having?: Prisma.ModelDefinitionScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ModelDefinitionCountAggregateInputType | true;
    _min?: ModelDefinitionMinAggregateInputType;
    _max?: ModelDefinitionMaxAggregateInputType;
};
export type ModelDefinitionGroupByOutputType = {
    id: string;
    name: string;
    entityTypeId: string;
    description: string | null;
    inputFields: runtime.JsonValue;
    outputField: string;
    createdAt: Date;
    _count: ModelDefinitionCountAggregateOutputType | null;
    _min: ModelDefinitionMinAggregateOutputType | null;
    _max: ModelDefinitionMaxAggregateOutputType | null;
};
type GetModelDefinitionGroupByPayload<T extends ModelDefinitionGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ModelDefinitionGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ModelDefinitionGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ModelDefinitionGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ModelDefinitionGroupByOutputType[P]>;
}>>;
export type ModelDefinitionWhereInput = {
    AND?: Prisma.ModelDefinitionWhereInput | Prisma.ModelDefinitionWhereInput[];
    OR?: Prisma.ModelDefinitionWhereInput[];
    NOT?: Prisma.ModelDefinitionWhereInput | Prisma.ModelDefinitionWhereInput[];
    id?: Prisma.StringFilter<"ModelDefinition"> | string;
    name?: Prisma.StringFilter<"ModelDefinition"> | string;
    entityTypeId?: Prisma.StringFilter<"ModelDefinition"> | string;
    description?: Prisma.StringNullableFilter<"ModelDefinition"> | string | null;
    inputFields?: Prisma.JsonFilter<"ModelDefinition">;
    outputField?: Prisma.StringFilter<"ModelDefinition"> | string;
    createdAt?: Prisma.DateTimeFilter<"ModelDefinition"> | Date | string;
    entityType?: Prisma.XOR<Prisma.EntityTypeScalarRelationFilter, Prisma.EntityTypeWhereInput>;
    versions?: Prisma.ModelVersionListRelationFilter;
};
export type ModelDefinitionOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    entityTypeId?: Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    inputFields?: Prisma.SortOrder;
    outputField?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    entityType?: Prisma.EntityTypeOrderByWithRelationInput;
    versions?: Prisma.ModelVersionOrderByRelationAggregateInput;
};
export type ModelDefinitionWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    name?: string;
    AND?: Prisma.ModelDefinitionWhereInput | Prisma.ModelDefinitionWhereInput[];
    OR?: Prisma.ModelDefinitionWhereInput[];
    NOT?: Prisma.ModelDefinitionWhereInput | Prisma.ModelDefinitionWhereInput[];
    entityTypeId?: Prisma.StringFilter<"ModelDefinition"> | string;
    description?: Prisma.StringNullableFilter<"ModelDefinition"> | string | null;
    inputFields?: Prisma.JsonFilter<"ModelDefinition">;
    outputField?: Prisma.StringFilter<"ModelDefinition"> | string;
    createdAt?: Prisma.DateTimeFilter<"ModelDefinition"> | Date | string;
    entityType?: Prisma.XOR<Prisma.EntityTypeScalarRelationFilter, Prisma.EntityTypeWhereInput>;
    versions?: Prisma.ModelVersionListRelationFilter;
}, "id" | "name">;
export type ModelDefinitionOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    entityTypeId?: Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    inputFields?: Prisma.SortOrder;
    outputField?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.ModelDefinitionCountOrderByAggregateInput;
    _max?: Prisma.ModelDefinitionMaxOrderByAggregateInput;
    _min?: Prisma.ModelDefinitionMinOrderByAggregateInput;
};
export type ModelDefinitionScalarWhereWithAggregatesInput = {
    AND?: Prisma.ModelDefinitionScalarWhereWithAggregatesInput | Prisma.ModelDefinitionScalarWhereWithAggregatesInput[];
    OR?: Prisma.ModelDefinitionScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ModelDefinitionScalarWhereWithAggregatesInput | Prisma.ModelDefinitionScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"ModelDefinition"> | string;
    name?: Prisma.StringWithAggregatesFilter<"ModelDefinition"> | string;
    entityTypeId?: Prisma.StringWithAggregatesFilter<"ModelDefinition"> | string;
    description?: Prisma.StringNullableWithAggregatesFilter<"ModelDefinition"> | string | null;
    inputFields?: Prisma.JsonWithAggregatesFilter<"ModelDefinition">;
    outputField?: Prisma.StringWithAggregatesFilter<"ModelDefinition"> | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"ModelDefinition"> | Date | string;
};
export type ModelDefinitionCreateInput = {
    id?: string;
    name: string;
    description?: string | null;
    inputFields: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    outputField: string;
    createdAt?: Date | string;
    entityType: Prisma.EntityTypeCreateNestedOneWithoutModelDefinitionsInput;
    versions?: Prisma.ModelVersionCreateNestedManyWithoutModelDefinitionInput;
};
export type ModelDefinitionUncheckedCreateInput = {
    id?: string;
    name: string;
    entityTypeId: string;
    description?: string | null;
    inputFields: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    outputField: string;
    createdAt?: Date | string;
    versions?: Prisma.ModelVersionUncheckedCreateNestedManyWithoutModelDefinitionInput;
};
export type ModelDefinitionUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    inputFields?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    outputField?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    entityType?: Prisma.EntityTypeUpdateOneRequiredWithoutModelDefinitionsNestedInput;
    versions?: Prisma.ModelVersionUpdateManyWithoutModelDefinitionNestedInput;
};
export type ModelDefinitionUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    entityTypeId?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    inputFields?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    outputField?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    versions?: Prisma.ModelVersionUncheckedUpdateManyWithoutModelDefinitionNestedInput;
};
export type ModelDefinitionCreateManyInput = {
    id?: string;
    name: string;
    entityTypeId: string;
    description?: string | null;
    inputFields: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    outputField: string;
    createdAt?: Date | string;
};
export type ModelDefinitionUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    inputFields?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    outputField?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ModelDefinitionUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    entityTypeId?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    inputFields?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    outputField?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ModelDefinitionListRelationFilter = {
    every?: Prisma.ModelDefinitionWhereInput;
    some?: Prisma.ModelDefinitionWhereInput;
    none?: Prisma.ModelDefinitionWhereInput;
};
export type ModelDefinitionOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ModelDefinitionCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    entityTypeId?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    inputFields?: Prisma.SortOrder;
    outputField?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type ModelDefinitionMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    entityTypeId?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    outputField?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type ModelDefinitionMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    entityTypeId?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    outputField?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type ModelDefinitionScalarRelationFilter = {
    is?: Prisma.ModelDefinitionWhereInput;
    isNot?: Prisma.ModelDefinitionWhereInput;
};
export type ModelDefinitionCreateNestedManyWithoutEntityTypeInput = {
    create?: Prisma.XOR<Prisma.ModelDefinitionCreateWithoutEntityTypeInput, Prisma.ModelDefinitionUncheckedCreateWithoutEntityTypeInput> | Prisma.ModelDefinitionCreateWithoutEntityTypeInput[] | Prisma.ModelDefinitionUncheckedCreateWithoutEntityTypeInput[];
    connectOrCreate?: Prisma.ModelDefinitionCreateOrConnectWithoutEntityTypeInput | Prisma.ModelDefinitionCreateOrConnectWithoutEntityTypeInput[];
    createMany?: Prisma.ModelDefinitionCreateManyEntityTypeInputEnvelope;
    connect?: Prisma.ModelDefinitionWhereUniqueInput | Prisma.ModelDefinitionWhereUniqueInput[];
};
export type ModelDefinitionUncheckedCreateNestedManyWithoutEntityTypeInput = {
    create?: Prisma.XOR<Prisma.ModelDefinitionCreateWithoutEntityTypeInput, Prisma.ModelDefinitionUncheckedCreateWithoutEntityTypeInput> | Prisma.ModelDefinitionCreateWithoutEntityTypeInput[] | Prisma.ModelDefinitionUncheckedCreateWithoutEntityTypeInput[];
    connectOrCreate?: Prisma.ModelDefinitionCreateOrConnectWithoutEntityTypeInput | Prisma.ModelDefinitionCreateOrConnectWithoutEntityTypeInput[];
    createMany?: Prisma.ModelDefinitionCreateManyEntityTypeInputEnvelope;
    connect?: Prisma.ModelDefinitionWhereUniqueInput | Prisma.ModelDefinitionWhereUniqueInput[];
};
export type ModelDefinitionUpdateManyWithoutEntityTypeNestedInput = {
    create?: Prisma.XOR<Prisma.ModelDefinitionCreateWithoutEntityTypeInput, Prisma.ModelDefinitionUncheckedCreateWithoutEntityTypeInput> | Prisma.ModelDefinitionCreateWithoutEntityTypeInput[] | Prisma.ModelDefinitionUncheckedCreateWithoutEntityTypeInput[];
    connectOrCreate?: Prisma.ModelDefinitionCreateOrConnectWithoutEntityTypeInput | Prisma.ModelDefinitionCreateOrConnectWithoutEntityTypeInput[];
    upsert?: Prisma.ModelDefinitionUpsertWithWhereUniqueWithoutEntityTypeInput | Prisma.ModelDefinitionUpsertWithWhereUniqueWithoutEntityTypeInput[];
    createMany?: Prisma.ModelDefinitionCreateManyEntityTypeInputEnvelope;
    set?: Prisma.ModelDefinitionWhereUniqueInput | Prisma.ModelDefinitionWhereUniqueInput[];
    disconnect?: Prisma.ModelDefinitionWhereUniqueInput | Prisma.ModelDefinitionWhereUniqueInput[];
    delete?: Prisma.ModelDefinitionWhereUniqueInput | Prisma.ModelDefinitionWhereUniqueInput[];
    connect?: Prisma.ModelDefinitionWhereUniqueInput | Prisma.ModelDefinitionWhereUniqueInput[];
    update?: Prisma.ModelDefinitionUpdateWithWhereUniqueWithoutEntityTypeInput | Prisma.ModelDefinitionUpdateWithWhereUniqueWithoutEntityTypeInput[];
    updateMany?: Prisma.ModelDefinitionUpdateManyWithWhereWithoutEntityTypeInput | Prisma.ModelDefinitionUpdateManyWithWhereWithoutEntityTypeInput[];
    deleteMany?: Prisma.ModelDefinitionScalarWhereInput | Prisma.ModelDefinitionScalarWhereInput[];
};
export type ModelDefinitionUncheckedUpdateManyWithoutEntityTypeNestedInput = {
    create?: Prisma.XOR<Prisma.ModelDefinitionCreateWithoutEntityTypeInput, Prisma.ModelDefinitionUncheckedCreateWithoutEntityTypeInput> | Prisma.ModelDefinitionCreateWithoutEntityTypeInput[] | Prisma.ModelDefinitionUncheckedCreateWithoutEntityTypeInput[];
    connectOrCreate?: Prisma.ModelDefinitionCreateOrConnectWithoutEntityTypeInput | Prisma.ModelDefinitionCreateOrConnectWithoutEntityTypeInput[];
    upsert?: Prisma.ModelDefinitionUpsertWithWhereUniqueWithoutEntityTypeInput | Prisma.ModelDefinitionUpsertWithWhereUniqueWithoutEntityTypeInput[];
    createMany?: Prisma.ModelDefinitionCreateManyEntityTypeInputEnvelope;
    set?: Prisma.ModelDefinitionWhereUniqueInput | Prisma.ModelDefinitionWhereUniqueInput[];
    disconnect?: Prisma.ModelDefinitionWhereUniqueInput | Prisma.ModelDefinitionWhereUniqueInput[];
    delete?: Prisma.ModelDefinitionWhereUniqueInput | Prisma.ModelDefinitionWhereUniqueInput[];
    connect?: Prisma.ModelDefinitionWhereUniqueInput | Prisma.ModelDefinitionWhereUniqueInput[];
    update?: Prisma.ModelDefinitionUpdateWithWhereUniqueWithoutEntityTypeInput | Prisma.ModelDefinitionUpdateWithWhereUniqueWithoutEntityTypeInput[];
    updateMany?: Prisma.ModelDefinitionUpdateManyWithWhereWithoutEntityTypeInput | Prisma.ModelDefinitionUpdateManyWithWhereWithoutEntityTypeInput[];
    deleteMany?: Prisma.ModelDefinitionScalarWhereInput | Prisma.ModelDefinitionScalarWhereInput[];
};
export type ModelDefinitionCreateNestedOneWithoutVersionsInput = {
    create?: Prisma.XOR<Prisma.ModelDefinitionCreateWithoutVersionsInput, Prisma.ModelDefinitionUncheckedCreateWithoutVersionsInput>;
    connectOrCreate?: Prisma.ModelDefinitionCreateOrConnectWithoutVersionsInput;
    connect?: Prisma.ModelDefinitionWhereUniqueInput;
};
export type ModelDefinitionUpdateOneRequiredWithoutVersionsNestedInput = {
    create?: Prisma.XOR<Prisma.ModelDefinitionCreateWithoutVersionsInput, Prisma.ModelDefinitionUncheckedCreateWithoutVersionsInput>;
    connectOrCreate?: Prisma.ModelDefinitionCreateOrConnectWithoutVersionsInput;
    upsert?: Prisma.ModelDefinitionUpsertWithoutVersionsInput;
    connect?: Prisma.ModelDefinitionWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ModelDefinitionUpdateToOneWithWhereWithoutVersionsInput, Prisma.ModelDefinitionUpdateWithoutVersionsInput>, Prisma.ModelDefinitionUncheckedUpdateWithoutVersionsInput>;
};
export type ModelDefinitionCreateWithoutEntityTypeInput = {
    id?: string;
    name: string;
    description?: string | null;
    inputFields: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    outputField: string;
    createdAt?: Date | string;
    versions?: Prisma.ModelVersionCreateNestedManyWithoutModelDefinitionInput;
};
export type ModelDefinitionUncheckedCreateWithoutEntityTypeInput = {
    id?: string;
    name: string;
    description?: string | null;
    inputFields: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    outputField: string;
    createdAt?: Date | string;
    versions?: Prisma.ModelVersionUncheckedCreateNestedManyWithoutModelDefinitionInput;
};
export type ModelDefinitionCreateOrConnectWithoutEntityTypeInput = {
    where: Prisma.ModelDefinitionWhereUniqueInput;
    create: Prisma.XOR<Prisma.ModelDefinitionCreateWithoutEntityTypeInput, Prisma.ModelDefinitionUncheckedCreateWithoutEntityTypeInput>;
};
export type ModelDefinitionCreateManyEntityTypeInputEnvelope = {
    data: Prisma.ModelDefinitionCreateManyEntityTypeInput | Prisma.ModelDefinitionCreateManyEntityTypeInput[];
    skipDuplicates?: boolean;
};
export type ModelDefinitionUpsertWithWhereUniqueWithoutEntityTypeInput = {
    where: Prisma.ModelDefinitionWhereUniqueInput;
    update: Prisma.XOR<Prisma.ModelDefinitionUpdateWithoutEntityTypeInput, Prisma.ModelDefinitionUncheckedUpdateWithoutEntityTypeInput>;
    create: Prisma.XOR<Prisma.ModelDefinitionCreateWithoutEntityTypeInput, Prisma.ModelDefinitionUncheckedCreateWithoutEntityTypeInput>;
};
export type ModelDefinitionUpdateWithWhereUniqueWithoutEntityTypeInput = {
    where: Prisma.ModelDefinitionWhereUniqueInput;
    data: Prisma.XOR<Prisma.ModelDefinitionUpdateWithoutEntityTypeInput, Prisma.ModelDefinitionUncheckedUpdateWithoutEntityTypeInput>;
};
export type ModelDefinitionUpdateManyWithWhereWithoutEntityTypeInput = {
    where: Prisma.ModelDefinitionScalarWhereInput;
    data: Prisma.XOR<Prisma.ModelDefinitionUpdateManyMutationInput, Prisma.ModelDefinitionUncheckedUpdateManyWithoutEntityTypeInput>;
};
export type ModelDefinitionScalarWhereInput = {
    AND?: Prisma.ModelDefinitionScalarWhereInput | Prisma.ModelDefinitionScalarWhereInput[];
    OR?: Prisma.ModelDefinitionScalarWhereInput[];
    NOT?: Prisma.ModelDefinitionScalarWhereInput | Prisma.ModelDefinitionScalarWhereInput[];
    id?: Prisma.StringFilter<"ModelDefinition"> | string;
    name?: Prisma.StringFilter<"ModelDefinition"> | string;
    entityTypeId?: Prisma.StringFilter<"ModelDefinition"> | string;
    description?: Prisma.StringNullableFilter<"ModelDefinition"> | string | null;
    inputFields?: Prisma.JsonFilter<"ModelDefinition">;
    outputField?: Prisma.StringFilter<"ModelDefinition"> | string;
    createdAt?: Prisma.DateTimeFilter<"ModelDefinition"> | Date | string;
};
export type ModelDefinitionCreateWithoutVersionsInput = {
    id?: string;
    name: string;
    description?: string | null;
    inputFields: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    outputField: string;
    createdAt?: Date | string;
    entityType: Prisma.EntityTypeCreateNestedOneWithoutModelDefinitionsInput;
};
export type ModelDefinitionUncheckedCreateWithoutVersionsInput = {
    id?: string;
    name: string;
    entityTypeId: string;
    description?: string | null;
    inputFields: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    outputField: string;
    createdAt?: Date | string;
};
export type ModelDefinitionCreateOrConnectWithoutVersionsInput = {
    where: Prisma.ModelDefinitionWhereUniqueInput;
    create: Prisma.XOR<Prisma.ModelDefinitionCreateWithoutVersionsInput, Prisma.ModelDefinitionUncheckedCreateWithoutVersionsInput>;
};
export type ModelDefinitionUpsertWithoutVersionsInput = {
    update: Prisma.XOR<Prisma.ModelDefinitionUpdateWithoutVersionsInput, Prisma.ModelDefinitionUncheckedUpdateWithoutVersionsInput>;
    create: Prisma.XOR<Prisma.ModelDefinitionCreateWithoutVersionsInput, Prisma.ModelDefinitionUncheckedCreateWithoutVersionsInput>;
    where?: Prisma.ModelDefinitionWhereInput;
};
export type ModelDefinitionUpdateToOneWithWhereWithoutVersionsInput = {
    where?: Prisma.ModelDefinitionWhereInput;
    data: Prisma.XOR<Prisma.ModelDefinitionUpdateWithoutVersionsInput, Prisma.ModelDefinitionUncheckedUpdateWithoutVersionsInput>;
};
export type ModelDefinitionUpdateWithoutVersionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    inputFields?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    outputField?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    entityType?: Prisma.EntityTypeUpdateOneRequiredWithoutModelDefinitionsNestedInput;
};
export type ModelDefinitionUncheckedUpdateWithoutVersionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    entityTypeId?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    inputFields?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    outputField?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ModelDefinitionCreateManyEntityTypeInput = {
    id?: string;
    name: string;
    description?: string | null;
    inputFields: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    outputField: string;
    createdAt?: Date | string;
};
export type ModelDefinitionUpdateWithoutEntityTypeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    inputFields?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    outputField?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    versions?: Prisma.ModelVersionUpdateManyWithoutModelDefinitionNestedInput;
};
export type ModelDefinitionUncheckedUpdateWithoutEntityTypeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    inputFields?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    outputField?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    versions?: Prisma.ModelVersionUncheckedUpdateManyWithoutModelDefinitionNestedInput;
};
export type ModelDefinitionUncheckedUpdateManyWithoutEntityTypeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    inputFields?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    outputField?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
/**
 * Count Type ModelDefinitionCountOutputType
 */
export type ModelDefinitionCountOutputType = {
    versions: number;
};
export type ModelDefinitionCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    versions?: boolean | ModelDefinitionCountOutputTypeCountVersionsArgs;
};
/**
 * ModelDefinitionCountOutputType without action
 */
export type ModelDefinitionCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModelDefinitionCountOutputType
     */
    select?: Prisma.ModelDefinitionCountOutputTypeSelect<ExtArgs> | null;
};
/**
 * ModelDefinitionCountOutputType without action
 */
export type ModelDefinitionCountOutputTypeCountVersionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ModelVersionWhereInput;
};
export type ModelDefinitionSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    entityTypeId?: boolean;
    description?: boolean;
    inputFields?: boolean;
    outputField?: boolean;
    createdAt?: boolean;
    entityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
    versions?: boolean | Prisma.ModelDefinition$versionsArgs<ExtArgs>;
    _count?: boolean | Prisma.ModelDefinitionCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["modelDefinition"]>;
export type ModelDefinitionSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    entityTypeId?: boolean;
    description?: boolean;
    inputFields?: boolean;
    outputField?: boolean;
    createdAt?: boolean;
    entityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["modelDefinition"]>;
export type ModelDefinitionSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    entityTypeId?: boolean;
    description?: boolean;
    inputFields?: boolean;
    outputField?: boolean;
    createdAt?: boolean;
    entityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["modelDefinition"]>;
export type ModelDefinitionSelectScalar = {
    id?: boolean;
    name?: boolean;
    entityTypeId?: boolean;
    description?: boolean;
    inputFields?: boolean;
    outputField?: boolean;
    createdAt?: boolean;
};
export type ModelDefinitionOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "name" | "entityTypeId" | "description" | "inputFields" | "outputField" | "createdAt", ExtArgs["result"]["modelDefinition"]>;
export type ModelDefinitionInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    entityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
    versions?: boolean | Prisma.ModelDefinition$versionsArgs<ExtArgs>;
    _count?: boolean | Prisma.ModelDefinitionCountOutputTypeDefaultArgs<ExtArgs>;
};
export type ModelDefinitionIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    entityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
};
export type ModelDefinitionIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    entityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
};
export type $ModelDefinitionPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ModelDefinition";
    objects: {
        entityType: Prisma.$EntityTypePayload<ExtArgs>;
        versions: Prisma.$ModelVersionPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        name: string;
        entityTypeId: string;
        description: string | null;
        inputFields: runtime.JsonValue;
        outputField: string;
        createdAt: Date;
    }, ExtArgs["result"]["modelDefinition"]>;
    composites: {};
};
export type ModelDefinitionGetPayload<S extends boolean | null | undefined | ModelDefinitionDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ModelDefinitionPayload, S>;
export type ModelDefinitionCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ModelDefinitionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ModelDefinitionCountAggregateInputType | true;
};
export interface ModelDefinitionDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ModelDefinition'];
        meta: {
            name: 'ModelDefinition';
        };
    };
    /**
     * Find zero or one ModelDefinition that matches the filter.
     * @param {ModelDefinitionFindUniqueArgs} args - Arguments to find a ModelDefinition
     * @example
     * // Get one ModelDefinition
     * const modelDefinition = await prisma.modelDefinition.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ModelDefinitionFindUniqueArgs>(args: Prisma.SelectSubset<T, ModelDefinitionFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ModelDefinitionClient<runtime.Types.Result.GetResult<Prisma.$ModelDefinitionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one ModelDefinition that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ModelDefinitionFindUniqueOrThrowArgs} args - Arguments to find a ModelDefinition
     * @example
     * // Get one ModelDefinition
     * const modelDefinition = await prisma.modelDefinition.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ModelDefinitionFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ModelDefinitionFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ModelDefinitionClient<runtime.Types.Result.GetResult<Prisma.$ModelDefinitionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first ModelDefinition that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModelDefinitionFindFirstArgs} args - Arguments to find a ModelDefinition
     * @example
     * // Get one ModelDefinition
     * const modelDefinition = await prisma.modelDefinition.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ModelDefinitionFindFirstArgs>(args?: Prisma.SelectSubset<T, ModelDefinitionFindFirstArgs<ExtArgs>>): Prisma.Prisma__ModelDefinitionClient<runtime.Types.Result.GetResult<Prisma.$ModelDefinitionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first ModelDefinition that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModelDefinitionFindFirstOrThrowArgs} args - Arguments to find a ModelDefinition
     * @example
     * // Get one ModelDefinition
     * const modelDefinition = await prisma.modelDefinition.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ModelDefinitionFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ModelDefinitionFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ModelDefinitionClient<runtime.Types.Result.GetResult<Prisma.$ModelDefinitionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more ModelDefinitions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModelDefinitionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ModelDefinitions
     * const modelDefinitions = await prisma.modelDefinition.findMany()
     *
     * // Get first 10 ModelDefinitions
     * const modelDefinitions = await prisma.modelDefinition.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const modelDefinitionWithIdOnly = await prisma.modelDefinition.findMany({ select: { id: true } })
     *
     */
    findMany<T extends ModelDefinitionFindManyArgs>(args?: Prisma.SelectSubset<T, ModelDefinitionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ModelDefinitionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a ModelDefinition.
     * @param {ModelDefinitionCreateArgs} args - Arguments to create a ModelDefinition.
     * @example
     * // Create one ModelDefinition
     * const ModelDefinition = await prisma.modelDefinition.create({
     *   data: {
     *     // ... data to create a ModelDefinition
     *   }
     * })
     *
     */
    create<T extends ModelDefinitionCreateArgs>(args: Prisma.SelectSubset<T, ModelDefinitionCreateArgs<ExtArgs>>): Prisma.Prisma__ModelDefinitionClient<runtime.Types.Result.GetResult<Prisma.$ModelDefinitionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many ModelDefinitions.
     * @param {ModelDefinitionCreateManyArgs} args - Arguments to create many ModelDefinitions.
     * @example
     * // Create many ModelDefinitions
     * const modelDefinition = await prisma.modelDefinition.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends ModelDefinitionCreateManyArgs>(args?: Prisma.SelectSubset<T, ModelDefinitionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many ModelDefinitions and returns the data saved in the database.
     * @param {ModelDefinitionCreateManyAndReturnArgs} args - Arguments to create many ModelDefinitions.
     * @example
     * // Create many ModelDefinitions
     * const modelDefinition = await prisma.modelDefinition.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many ModelDefinitions and only return the `id`
     * const modelDefinitionWithIdOnly = await prisma.modelDefinition.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends ModelDefinitionCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ModelDefinitionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ModelDefinitionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a ModelDefinition.
     * @param {ModelDefinitionDeleteArgs} args - Arguments to delete one ModelDefinition.
     * @example
     * // Delete one ModelDefinition
     * const ModelDefinition = await prisma.modelDefinition.delete({
     *   where: {
     *     // ... filter to delete one ModelDefinition
     *   }
     * })
     *
     */
    delete<T extends ModelDefinitionDeleteArgs>(args: Prisma.SelectSubset<T, ModelDefinitionDeleteArgs<ExtArgs>>): Prisma.Prisma__ModelDefinitionClient<runtime.Types.Result.GetResult<Prisma.$ModelDefinitionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one ModelDefinition.
     * @param {ModelDefinitionUpdateArgs} args - Arguments to update one ModelDefinition.
     * @example
     * // Update one ModelDefinition
     * const modelDefinition = await prisma.modelDefinition.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends ModelDefinitionUpdateArgs>(args: Prisma.SelectSubset<T, ModelDefinitionUpdateArgs<ExtArgs>>): Prisma.Prisma__ModelDefinitionClient<runtime.Types.Result.GetResult<Prisma.$ModelDefinitionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more ModelDefinitions.
     * @param {ModelDefinitionDeleteManyArgs} args - Arguments to filter ModelDefinitions to delete.
     * @example
     * // Delete a few ModelDefinitions
     * const { count } = await prisma.modelDefinition.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends ModelDefinitionDeleteManyArgs>(args?: Prisma.SelectSubset<T, ModelDefinitionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more ModelDefinitions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModelDefinitionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ModelDefinitions
     * const modelDefinition = await prisma.modelDefinition.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends ModelDefinitionUpdateManyArgs>(args: Prisma.SelectSubset<T, ModelDefinitionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more ModelDefinitions and returns the data updated in the database.
     * @param {ModelDefinitionUpdateManyAndReturnArgs} args - Arguments to update many ModelDefinitions.
     * @example
     * // Update many ModelDefinitions
     * const modelDefinition = await prisma.modelDefinition.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more ModelDefinitions and only return the `id`
     * const modelDefinitionWithIdOnly = await prisma.modelDefinition.updateManyAndReturn({
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
    updateManyAndReturn<T extends ModelDefinitionUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ModelDefinitionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ModelDefinitionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one ModelDefinition.
     * @param {ModelDefinitionUpsertArgs} args - Arguments to update or create a ModelDefinition.
     * @example
     * // Update or create a ModelDefinition
     * const modelDefinition = await prisma.modelDefinition.upsert({
     *   create: {
     *     // ... data to create a ModelDefinition
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ModelDefinition we want to update
     *   }
     * })
     */
    upsert<T extends ModelDefinitionUpsertArgs>(args: Prisma.SelectSubset<T, ModelDefinitionUpsertArgs<ExtArgs>>): Prisma.Prisma__ModelDefinitionClient<runtime.Types.Result.GetResult<Prisma.$ModelDefinitionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of ModelDefinitions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModelDefinitionCountArgs} args - Arguments to filter ModelDefinitions to count.
     * @example
     * // Count the number of ModelDefinitions
     * const count = await prisma.modelDefinition.count({
     *   where: {
     *     // ... the filter for the ModelDefinitions we want to count
     *   }
     * })
    **/
    count<T extends ModelDefinitionCountArgs>(args?: Prisma.Subset<T, ModelDefinitionCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ModelDefinitionCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a ModelDefinition.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModelDefinitionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ModelDefinitionAggregateArgs>(args: Prisma.Subset<T, ModelDefinitionAggregateArgs>): Prisma.PrismaPromise<GetModelDefinitionAggregateType<T>>;
    /**
     * Group by ModelDefinition.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModelDefinitionGroupByArgs} args - Group by arguments.
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
    groupBy<T extends ModelDefinitionGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ModelDefinitionGroupByArgs['orderBy'];
    } : {
        orderBy?: ModelDefinitionGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ModelDefinitionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetModelDefinitionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the ModelDefinition model
     */
    readonly fields: ModelDefinitionFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for ModelDefinition.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__ModelDefinitionClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    entityType<T extends Prisma.EntityTypeDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.EntityTypeDefaultArgs<ExtArgs>>): Prisma.Prisma__EntityTypeClient<runtime.Types.Result.GetResult<Prisma.$EntityTypePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    versions<T extends Prisma.ModelDefinition$versionsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ModelDefinition$versionsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ModelVersionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
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
 * Fields of the ModelDefinition model
 */
export interface ModelDefinitionFieldRefs {
    readonly id: Prisma.FieldRef<"ModelDefinition", 'String'>;
    readonly name: Prisma.FieldRef<"ModelDefinition", 'String'>;
    readonly entityTypeId: Prisma.FieldRef<"ModelDefinition", 'String'>;
    readonly description: Prisma.FieldRef<"ModelDefinition", 'String'>;
    readonly inputFields: Prisma.FieldRef<"ModelDefinition", 'Json'>;
    readonly outputField: Prisma.FieldRef<"ModelDefinition", 'String'>;
    readonly createdAt: Prisma.FieldRef<"ModelDefinition", 'DateTime'>;
}
/**
 * ModelDefinition findUnique
 */
export type ModelDefinitionFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which ModelDefinition to fetch.
     */
    where: Prisma.ModelDefinitionWhereUniqueInput;
};
/**
 * ModelDefinition findUniqueOrThrow
 */
export type ModelDefinitionFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which ModelDefinition to fetch.
     */
    where: Prisma.ModelDefinitionWhereUniqueInput;
};
/**
 * ModelDefinition findFirst
 */
export type ModelDefinitionFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which ModelDefinition to fetch.
     */
    where?: Prisma.ModelDefinitionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ModelDefinitions to fetch.
     */
    orderBy?: Prisma.ModelDefinitionOrderByWithRelationInput | Prisma.ModelDefinitionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ModelDefinitions.
     */
    cursor?: Prisma.ModelDefinitionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ModelDefinitions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ModelDefinitions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ModelDefinitions.
     */
    distinct?: Prisma.ModelDefinitionScalarFieldEnum | Prisma.ModelDefinitionScalarFieldEnum[];
};
/**
 * ModelDefinition findFirstOrThrow
 */
export type ModelDefinitionFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which ModelDefinition to fetch.
     */
    where?: Prisma.ModelDefinitionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ModelDefinitions to fetch.
     */
    orderBy?: Prisma.ModelDefinitionOrderByWithRelationInput | Prisma.ModelDefinitionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ModelDefinitions.
     */
    cursor?: Prisma.ModelDefinitionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ModelDefinitions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ModelDefinitions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ModelDefinitions.
     */
    distinct?: Prisma.ModelDefinitionScalarFieldEnum | Prisma.ModelDefinitionScalarFieldEnum[];
};
/**
 * ModelDefinition findMany
 */
export type ModelDefinitionFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which ModelDefinitions to fetch.
     */
    where?: Prisma.ModelDefinitionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ModelDefinitions to fetch.
     */
    orderBy?: Prisma.ModelDefinitionOrderByWithRelationInput | Prisma.ModelDefinitionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing ModelDefinitions.
     */
    cursor?: Prisma.ModelDefinitionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ModelDefinitions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ModelDefinitions.
     */
    skip?: number;
    distinct?: Prisma.ModelDefinitionScalarFieldEnum | Prisma.ModelDefinitionScalarFieldEnum[];
};
/**
 * ModelDefinition create
 */
export type ModelDefinitionCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The data needed to create a ModelDefinition.
     */
    data: Prisma.XOR<Prisma.ModelDefinitionCreateInput, Prisma.ModelDefinitionUncheckedCreateInput>;
};
/**
 * ModelDefinition createMany
 */
export type ModelDefinitionCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many ModelDefinitions.
     */
    data: Prisma.ModelDefinitionCreateManyInput | Prisma.ModelDefinitionCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * ModelDefinition createManyAndReturn
 */
export type ModelDefinitionCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModelDefinition
     */
    select?: Prisma.ModelDefinitionSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the ModelDefinition
     */
    omit?: Prisma.ModelDefinitionOmit<ExtArgs> | null;
    /**
     * The data used to create many ModelDefinitions.
     */
    data: Prisma.ModelDefinitionCreateManyInput | Prisma.ModelDefinitionCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ModelDefinitionIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * ModelDefinition update
 */
export type ModelDefinitionUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The data needed to update a ModelDefinition.
     */
    data: Prisma.XOR<Prisma.ModelDefinitionUpdateInput, Prisma.ModelDefinitionUncheckedUpdateInput>;
    /**
     * Choose, which ModelDefinition to update.
     */
    where: Prisma.ModelDefinitionWhereUniqueInput;
};
/**
 * ModelDefinition updateMany
 */
export type ModelDefinitionUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update ModelDefinitions.
     */
    data: Prisma.XOR<Prisma.ModelDefinitionUpdateManyMutationInput, Prisma.ModelDefinitionUncheckedUpdateManyInput>;
    /**
     * Filter which ModelDefinitions to update
     */
    where?: Prisma.ModelDefinitionWhereInput;
    /**
     * Limit how many ModelDefinitions to update.
     */
    limit?: number;
};
/**
 * ModelDefinition updateManyAndReturn
 */
export type ModelDefinitionUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModelDefinition
     */
    select?: Prisma.ModelDefinitionSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the ModelDefinition
     */
    omit?: Prisma.ModelDefinitionOmit<ExtArgs> | null;
    /**
     * The data used to update ModelDefinitions.
     */
    data: Prisma.XOR<Prisma.ModelDefinitionUpdateManyMutationInput, Prisma.ModelDefinitionUncheckedUpdateManyInput>;
    /**
     * Filter which ModelDefinitions to update
     */
    where?: Prisma.ModelDefinitionWhereInput;
    /**
     * Limit how many ModelDefinitions to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ModelDefinitionIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * ModelDefinition upsert
 */
export type ModelDefinitionUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The filter to search for the ModelDefinition to update in case it exists.
     */
    where: Prisma.ModelDefinitionWhereUniqueInput;
    /**
     * In case the ModelDefinition found by the `where` argument doesn't exist, create a new ModelDefinition with this data.
     */
    create: Prisma.XOR<Prisma.ModelDefinitionCreateInput, Prisma.ModelDefinitionUncheckedCreateInput>;
    /**
     * In case the ModelDefinition was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.ModelDefinitionUpdateInput, Prisma.ModelDefinitionUncheckedUpdateInput>;
};
/**
 * ModelDefinition delete
 */
export type ModelDefinitionDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter which ModelDefinition to delete.
     */
    where: Prisma.ModelDefinitionWhereUniqueInput;
};
/**
 * ModelDefinition deleteMany
 */
export type ModelDefinitionDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which ModelDefinitions to delete
     */
    where?: Prisma.ModelDefinitionWhereInput;
    /**
     * Limit how many ModelDefinitions to delete.
     */
    limit?: number;
};
/**
 * ModelDefinition.versions
 */
export type ModelDefinition$versionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModelVersion
     */
    select?: Prisma.ModelVersionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ModelVersion
     */
    omit?: Prisma.ModelVersionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ModelVersionInclude<ExtArgs> | null;
    where?: Prisma.ModelVersionWhereInput;
    orderBy?: Prisma.ModelVersionOrderByWithRelationInput | Prisma.ModelVersionOrderByWithRelationInput[];
    cursor?: Prisma.ModelVersionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ModelVersionScalarFieldEnum | Prisma.ModelVersionScalarFieldEnum[];
};
/**
 * ModelDefinition without action
 */
export type ModelDefinitionDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
};
export {};
//# sourceMappingURL=ModelDefinition.d.ts.map