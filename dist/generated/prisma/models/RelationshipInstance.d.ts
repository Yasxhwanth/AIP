import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
/**
 * Model RelationshipInstance
 *
 */
export type RelationshipInstanceModel = runtime.Types.Result.DefaultSelection<Prisma.$RelationshipInstancePayload>;
export type AggregateRelationshipInstance = {
    _count: RelationshipInstanceCountAggregateOutputType | null;
    _min: RelationshipInstanceMinAggregateOutputType | null;
    _max: RelationshipInstanceMaxAggregateOutputType | null;
};
export type RelationshipInstanceMinAggregateOutputType = {
    id: string | null;
    relationshipDefinitionId: string | null;
    sourceLogicalId: string | null;
    targetLogicalId: string | null;
    validFrom: Date | null;
    validTo: Date | null;
    transactionTime: Date | null;
};
export type RelationshipInstanceMaxAggregateOutputType = {
    id: string | null;
    relationshipDefinitionId: string | null;
    sourceLogicalId: string | null;
    targetLogicalId: string | null;
    validFrom: Date | null;
    validTo: Date | null;
    transactionTime: Date | null;
};
export type RelationshipInstanceCountAggregateOutputType = {
    id: number;
    relationshipDefinitionId: number;
    sourceLogicalId: number;
    targetLogicalId: number;
    properties: number;
    validFrom: number;
    validTo: number;
    transactionTime: number;
    _all: number;
};
export type RelationshipInstanceMinAggregateInputType = {
    id?: true;
    relationshipDefinitionId?: true;
    sourceLogicalId?: true;
    targetLogicalId?: true;
    validFrom?: true;
    validTo?: true;
    transactionTime?: true;
};
export type RelationshipInstanceMaxAggregateInputType = {
    id?: true;
    relationshipDefinitionId?: true;
    sourceLogicalId?: true;
    targetLogicalId?: true;
    validFrom?: true;
    validTo?: true;
    transactionTime?: true;
};
export type RelationshipInstanceCountAggregateInputType = {
    id?: true;
    relationshipDefinitionId?: true;
    sourceLogicalId?: true;
    targetLogicalId?: true;
    properties?: true;
    validFrom?: true;
    validTo?: true;
    transactionTime?: true;
    _all?: true;
};
export type RelationshipInstanceAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which RelationshipInstance to aggregate.
     */
    where?: Prisma.RelationshipInstanceWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of RelationshipInstances to fetch.
     */
    orderBy?: Prisma.RelationshipInstanceOrderByWithRelationInput | Prisma.RelationshipInstanceOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.RelationshipInstanceWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` RelationshipInstances from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` RelationshipInstances.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned RelationshipInstances
    **/
    _count?: true | RelationshipInstanceCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: RelationshipInstanceMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: RelationshipInstanceMaxAggregateInputType;
};
export type GetRelationshipInstanceAggregateType<T extends RelationshipInstanceAggregateArgs> = {
    [P in keyof T & keyof AggregateRelationshipInstance]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateRelationshipInstance[P]> : Prisma.GetScalarType<T[P], AggregateRelationshipInstance[P]>;
};
export type RelationshipInstanceGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RelationshipInstanceWhereInput;
    orderBy?: Prisma.RelationshipInstanceOrderByWithAggregationInput | Prisma.RelationshipInstanceOrderByWithAggregationInput[];
    by: Prisma.RelationshipInstanceScalarFieldEnum[] | Prisma.RelationshipInstanceScalarFieldEnum;
    having?: Prisma.RelationshipInstanceScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: RelationshipInstanceCountAggregateInputType | true;
    _min?: RelationshipInstanceMinAggregateInputType;
    _max?: RelationshipInstanceMaxAggregateInputType;
};
export type RelationshipInstanceGroupByOutputType = {
    id: string;
    relationshipDefinitionId: string;
    sourceLogicalId: string;
    targetLogicalId: string;
    properties: runtime.JsonValue | null;
    validFrom: Date;
    validTo: Date | null;
    transactionTime: Date;
    _count: RelationshipInstanceCountAggregateOutputType | null;
    _min: RelationshipInstanceMinAggregateOutputType | null;
    _max: RelationshipInstanceMaxAggregateOutputType | null;
};
type GetRelationshipInstanceGroupByPayload<T extends RelationshipInstanceGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<RelationshipInstanceGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof RelationshipInstanceGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], RelationshipInstanceGroupByOutputType[P]> : Prisma.GetScalarType<T[P], RelationshipInstanceGroupByOutputType[P]>;
}>>;
export type RelationshipInstanceWhereInput = {
    AND?: Prisma.RelationshipInstanceWhereInput | Prisma.RelationshipInstanceWhereInput[];
    OR?: Prisma.RelationshipInstanceWhereInput[];
    NOT?: Prisma.RelationshipInstanceWhereInput | Prisma.RelationshipInstanceWhereInput[];
    id?: Prisma.StringFilter<"RelationshipInstance"> | string;
    relationshipDefinitionId?: Prisma.StringFilter<"RelationshipInstance"> | string;
    sourceLogicalId?: Prisma.StringFilter<"RelationshipInstance"> | string;
    targetLogicalId?: Prisma.StringFilter<"RelationshipInstance"> | string;
    properties?: Prisma.JsonNullableFilter<"RelationshipInstance">;
    validFrom?: Prisma.DateTimeFilter<"RelationshipInstance"> | Date | string;
    validTo?: Prisma.DateTimeNullableFilter<"RelationshipInstance"> | Date | string | null;
    transactionTime?: Prisma.DateTimeFilter<"RelationshipInstance"> | Date | string;
    relationshipDef?: Prisma.XOR<Prisma.RelationshipDefinitionScalarRelationFilter, Prisma.RelationshipDefinitionWhereInput>;
};
export type RelationshipInstanceOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    relationshipDefinitionId?: Prisma.SortOrder;
    sourceLogicalId?: Prisma.SortOrder;
    targetLogicalId?: Prisma.SortOrder;
    properties?: Prisma.SortOrderInput | Prisma.SortOrder;
    validFrom?: Prisma.SortOrder;
    validTo?: Prisma.SortOrderInput | Prisma.SortOrder;
    transactionTime?: Prisma.SortOrder;
    relationshipDef?: Prisma.RelationshipDefinitionOrderByWithRelationInput;
};
export type RelationshipInstanceWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.RelationshipInstanceWhereInput | Prisma.RelationshipInstanceWhereInput[];
    OR?: Prisma.RelationshipInstanceWhereInput[];
    NOT?: Prisma.RelationshipInstanceWhereInput | Prisma.RelationshipInstanceWhereInput[];
    relationshipDefinitionId?: Prisma.StringFilter<"RelationshipInstance"> | string;
    sourceLogicalId?: Prisma.StringFilter<"RelationshipInstance"> | string;
    targetLogicalId?: Prisma.StringFilter<"RelationshipInstance"> | string;
    properties?: Prisma.JsonNullableFilter<"RelationshipInstance">;
    validFrom?: Prisma.DateTimeFilter<"RelationshipInstance"> | Date | string;
    validTo?: Prisma.DateTimeNullableFilter<"RelationshipInstance"> | Date | string | null;
    transactionTime?: Prisma.DateTimeFilter<"RelationshipInstance"> | Date | string;
    relationshipDef?: Prisma.XOR<Prisma.RelationshipDefinitionScalarRelationFilter, Prisma.RelationshipDefinitionWhereInput>;
}, "id">;
export type RelationshipInstanceOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    relationshipDefinitionId?: Prisma.SortOrder;
    sourceLogicalId?: Prisma.SortOrder;
    targetLogicalId?: Prisma.SortOrder;
    properties?: Prisma.SortOrderInput | Prisma.SortOrder;
    validFrom?: Prisma.SortOrder;
    validTo?: Prisma.SortOrderInput | Prisma.SortOrder;
    transactionTime?: Prisma.SortOrder;
    _count?: Prisma.RelationshipInstanceCountOrderByAggregateInput;
    _max?: Prisma.RelationshipInstanceMaxOrderByAggregateInput;
    _min?: Prisma.RelationshipInstanceMinOrderByAggregateInput;
};
export type RelationshipInstanceScalarWhereWithAggregatesInput = {
    AND?: Prisma.RelationshipInstanceScalarWhereWithAggregatesInput | Prisma.RelationshipInstanceScalarWhereWithAggregatesInput[];
    OR?: Prisma.RelationshipInstanceScalarWhereWithAggregatesInput[];
    NOT?: Prisma.RelationshipInstanceScalarWhereWithAggregatesInput | Prisma.RelationshipInstanceScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"RelationshipInstance"> | string;
    relationshipDefinitionId?: Prisma.StringWithAggregatesFilter<"RelationshipInstance"> | string;
    sourceLogicalId?: Prisma.StringWithAggregatesFilter<"RelationshipInstance"> | string;
    targetLogicalId?: Prisma.StringWithAggregatesFilter<"RelationshipInstance"> | string;
    properties?: Prisma.JsonNullableWithAggregatesFilter<"RelationshipInstance">;
    validFrom?: Prisma.DateTimeWithAggregatesFilter<"RelationshipInstance"> | Date | string;
    validTo?: Prisma.DateTimeNullableWithAggregatesFilter<"RelationshipInstance"> | Date | string | null;
    transactionTime?: Prisma.DateTimeWithAggregatesFilter<"RelationshipInstance"> | Date | string;
};
export type RelationshipInstanceCreateInput = {
    id?: string;
    sourceLogicalId: string;
    targetLogicalId: string;
    properties?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    validFrom: Date | string;
    validTo?: Date | string | null;
    transactionTime?: Date | string;
    relationshipDef: Prisma.RelationshipDefinitionCreateNestedOneWithoutInstancesInput;
};
export type RelationshipInstanceUncheckedCreateInput = {
    id?: string;
    relationshipDefinitionId: string;
    sourceLogicalId: string;
    targetLogicalId: string;
    properties?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    validFrom: Date | string;
    validTo?: Date | string | null;
    transactionTime?: Date | string;
};
export type RelationshipInstanceUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceLogicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    targetLogicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    properties?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    validFrom?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    validTo?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    transactionTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    relationshipDef?: Prisma.RelationshipDefinitionUpdateOneRequiredWithoutInstancesNestedInput;
};
export type RelationshipInstanceUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    relationshipDefinitionId?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceLogicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    targetLogicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    properties?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    validFrom?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    validTo?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    transactionTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RelationshipInstanceCreateManyInput = {
    id?: string;
    relationshipDefinitionId: string;
    sourceLogicalId: string;
    targetLogicalId: string;
    properties?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    validFrom: Date | string;
    validTo?: Date | string | null;
    transactionTime?: Date | string;
};
export type RelationshipInstanceUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceLogicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    targetLogicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    properties?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    validFrom?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    validTo?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    transactionTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RelationshipInstanceUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    relationshipDefinitionId?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceLogicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    targetLogicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    properties?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    validFrom?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    validTo?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    transactionTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RelationshipInstanceListRelationFilter = {
    every?: Prisma.RelationshipInstanceWhereInput;
    some?: Prisma.RelationshipInstanceWhereInput;
    none?: Prisma.RelationshipInstanceWhereInput;
};
export type RelationshipInstanceOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type RelationshipInstanceCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    relationshipDefinitionId?: Prisma.SortOrder;
    sourceLogicalId?: Prisma.SortOrder;
    targetLogicalId?: Prisma.SortOrder;
    properties?: Prisma.SortOrder;
    validFrom?: Prisma.SortOrder;
    validTo?: Prisma.SortOrder;
    transactionTime?: Prisma.SortOrder;
};
export type RelationshipInstanceMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    relationshipDefinitionId?: Prisma.SortOrder;
    sourceLogicalId?: Prisma.SortOrder;
    targetLogicalId?: Prisma.SortOrder;
    validFrom?: Prisma.SortOrder;
    validTo?: Prisma.SortOrder;
    transactionTime?: Prisma.SortOrder;
};
export type RelationshipInstanceMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    relationshipDefinitionId?: Prisma.SortOrder;
    sourceLogicalId?: Prisma.SortOrder;
    targetLogicalId?: Prisma.SortOrder;
    validFrom?: Prisma.SortOrder;
    validTo?: Prisma.SortOrder;
    transactionTime?: Prisma.SortOrder;
};
export type RelationshipInstanceCreateNestedManyWithoutRelationshipDefInput = {
    create?: Prisma.XOR<Prisma.RelationshipInstanceCreateWithoutRelationshipDefInput, Prisma.RelationshipInstanceUncheckedCreateWithoutRelationshipDefInput> | Prisma.RelationshipInstanceCreateWithoutRelationshipDefInput[] | Prisma.RelationshipInstanceUncheckedCreateWithoutRelationshipDefInput[];
    connectOrCreate?: Prisma.RelationshipInstanceCreateOrConnectWithoutRelationshipDefInput | Prisma.RelationshipInstanceCreateOrConnectWithoutRelationshipDefInput[];
    createMany?: Prisma.RelationshipInstanceCreateManyRelationshipDefInputEnvelope;
    connect?: Prisma.RelationshipInstanceWhereUniqueInput | Prisma.RelationshipInstanceWhereUniqueInput[];
};
export type RelationshipInstanceUncheckedCreateNestedManyWithoutRelationshipDefInput = {
    create?: Prisma.XOR<Prisma.RelationshipInstanceCreateWithoutRelationshipDefInput, Prisma.RelationshipInstanceUncheckedCreateWithoutRelationshipDefInput> | Prisma.RelationshipInstanceCreateWithoutRelationshipDefInput[] | Prisma.RelationshipInstanceUncheckedCreateWithoutRelationshipDefInput[];
    connectOrCreate?: Prisma.RelationshipInstanceCreateOrConnectWithoutRelationshipDefInput | Prisma.RelationshipInstanceCreateOrConnectWithoutRelationshipDefInput[];
    createMany?: Prisma.RelationshipInstanceCreateManyRelationshipDefInputEnvelope;
    connect?: Prisma.RelationshipInstanceWhereUniqueInput | Prisma.RelationshipInstanceWhereUniqueInput[];
};
export type RelationshipInstanceUpdateManyWithoutRelationshipDefNestedInput = {
    create?: Prisma.XOR<Prisma.RelationshipInstanceCreateWithoutRelationshipDefInput, Prisma.RelationshipInstanceUncheckedCreateWithoutRelationshipDefInput> | Prisma.RelationshipInstanceCreateWithoutRelationshipDefInput[] | Prisma.RelationshipInstanceUncheckedCreateWithoutRelationshipDefInput[];
    connectOrCreate?: Prisma.RelationshipInstanceCreateOrConnectWithoutRelationshipDefInput | Prisma.RelationshipInstanceCreateOrConnectWithoutRelationshipDefInput[];
    upsert?: Prisma.RelationshipInstanceUpsertWithWhereUniqueWithoutRelationshipDefInput | Prisma.RelationshipInstanceUpsertWithWhereUniqueWithoutRelationshipDefInput[];
    createMany?: Prisma.RelationshipInstanceCreateManyRelationshipDefInputEnvelope;
    set?: Prisma.RelationshipInstanceWhereUniqueInput | Prisma.RelationshipInstanceWhereUniqueInput[];
    disconnect?: Prisma.RelationshipInstanceWhereUniqueInput | Prisma.RelationshipInstanceWhereUniqueInput[];
    delete?: Prisma.RelationshipInstanceWhereUniqueInput | Prisma.RelationshipInstanceWhereUniqueInput[];
    connect?: Prisma.RelationshipInstanceWhereUniqueInput | Prisma.RelationshipInstanceWhereUniqueInput[];
    update?: Prisma.RelationshipInstanceUpdateWithWhereUniqueWithoutRelationshipDefInput | Prisma.RelationshipInstanceUpdateWithWhereUniqueWithoutRelationshipDefInput[];
    updateMany?: Prisma.RelationshipInstanceUpdateManyWithWhereWithoutRelationshipDefInput | Prisma.RelationshipInstanceUpdateManyWithWhereWithoutRelationshipDefInput[];
    deleteMany?: Prisma.RelationshipInstanceScalarWhereInput | Prisma.RelationshipInstanceScalarWhereInput[];
};
export type RelationshipInstanceUncheckedUpdateManyWithoutRelationshipDefNestedInput = {
    create?: Prisma.XOR<Prisma.RelationshipInstanceCreateWithoutRelationshipDefInput, Prisma.RelationshipInstanceUncheckedCreateWithoutRelationshipDefInput> | Prisma.RelationshipInstanceCreateWithoutRelationshipDefInput[] | Prisma.RelationshipInstanceUncheckedCreateWithoutRelationshipDefInput[];
    connectOrCreate?: Prisma.RelationshipInstanceCreateOrConnectWithoutRelationshipDefInput | Prisma.RelationshipInstanceCreateOrConnectWithoutRelationshipDefInput[];
    upsert?: Prisma.RelationshipInstanceUpsertWithWhereUniqueWithoutRelationshipDefInput | Prisma.RelationshipInstanceUpsertWithWhereUniqueWithoutRelationshipDefInput[];
    createMany?: Prisma.RelationshipInstanceCreateManyRelationshipDefInputEnvelope;
    set?: Prisma.RelationshipInstanceWhereUniqueInput | Prisma.RelationshipInstanceWhereUniqueInput[];
    disconnect?: Prisma.RelationshipInstanceWhereUniqueInput | Prisma.RelationshipInstanceWhereUniqueInput[];
    delete?: Prisma.RelationshipInstanceWhereUniqueInput | Prisma.RelationshipInstanceWhereUniqueInput[];
    connect?: Prisma.RelationshipInstanceWhereUniqueInput | Prisma.RelationshipInstanceWhereUniqueInput[];
    update?: Prisma.RelationshipInstanceUpdateWithWhereUniqueWithoutRelationshipDefInput | Prisma.RelationshipInstanceUpdateWithWhereUniqueWithoutRelationshipDefInput[];
    updateMany?: Prisma.RelationshipInstanceUpdateManyWithWhereWithoutRelationshipDefInput | Prisma.RelationshipInstanceUpdateManyWithWhereWithoutRelationshipDefInput[];
    deleteMany?: Prisma.RelationshipInstanceScalarWhereInput | Prisma.RelationshipInstanceScalarWhereInput[];
};
export type RelationshipInstanceCreateWithoutRelationshipDefInput = {
    id?: string;
    sourceLogicalId: string;
    targetLogicalId: string;
    properties?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    validFrom: Date | string;
    validTo?: Date | string | null;
    transactionTime?: Date | string;
};
export type RelationshipInstanceUncheckedCreateWithoutRelationshipDefInput = {
    id?: string;
    sourceLogicalId: string;
    targetLogicalId: string;
    properties?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    validFrom: Date | string;
    validTo?: Date | string | null;
    transactionTime?: Date | string;
};
export type RelationshipInstanceCreateOrConnectWithoutRelationshipDefInput = {
    where: Prisma.RelationshipInstanceWhereUniqueInput;
    create: Prisma.XOR<Prisma.RelationshipInstanceCreateWithoutRelationshipDefInput, Prisma.RelationshipInstanceUncheckedCreateWithoutRelationshipDefInput>;
};
export type RelationshipInstanceCreateManyRelationshipDefInputEnvelope = {
    data: Prisma.RelationshipInstanceCreateManyRelationshipDefInput | Prisma.RelationshipInstanceCreateManyRelationshipDefInput[];
    skipDuplicates?: boolean;
};
export type RelationshipInstanceUpsertWithWhereUniqueWithoutRelationshipDefInput = {
    where: Prisma.RelationshipInstanceWhereUniqueInput;
    update: Prisma.XOR<Prisma.RelationshipInstanceUpdateWithoutRelationshipDefInput, Prisma.RelationshipInstanceUncheckedUpdateWithoutRelationshipDefInput>;
    create: Prisma.XOR<Prisma.RelationshipInstanceCreateWithoutRelationshipDefInput, Prisma.RelationshipInstanceUncheckedCreateWithoutRelationshipDefInput>;
};
export type RelationshipInstanceUpdateWithWhereUniqueWithoutRelationshipDefInput = {
    where: Prisma.RelationshipInstanceWhereUniqueInput;
    data: Prisma.XOR<Prisma.RelationshipInstanceUpdateWithoutRelationshipDefInput, Prisma.RelationshipInstanceUncheckedUpdateWithoutRelationshipDefInput>;
};
export type RelationshipInstanceUpdateManyWithWhereWithoutRelationshipDefInput = {
    where: Prisma.RelationshipInstanceScalarWhereInput;
    data: Prisma.XOR<Prisma.RelationshipInstanceUpdateManyMutationInput, Prisma.RelationshipInstanceUncheckedUpdateManyWithoutRelationshipDefInput>;
};
export type RelationshipInstanceScalarWhereInput = {
    AND?: Prisma.RelationshipInstanceScalarWhereInput | Prisma.RelationshipInstanceScalarWhereInput[];
    OR?: Prisma.RelationshipInstanceScalarWhereInput[];
    NOT?: Prisma.RelationshipInstanceScalarWhereInput | Prisma.RelationshipInstanceScalarWhereInput[];
    id?: Prisma.StringFilter<"RelationshipInstance"> | string;
    relationshipDefinitionId?: Prisma.StringFilter<"RelationshipInstance"> | string;
    sourceLogicalId?: Prisma.StringFilter<"RelationshipInstance"> | string;
    targetLogicalId?: Prisma.StringFilter<"RelationshipInstance"> | string;
    properties?: Prisma.JsonNullableFilter<"RelationshipInstance">;
    validFrom?: Prisma.DateTimeFilter<"RelationshipInstance"> | Date | string;
    validTo?: Prisma.DateTimeNullableFilter<"RelationshipInstance"> | Date | string | null;
    transactionTime?: Prisma.DateTimeFilter<"RelationshipInstance"> | Date | string;
};
export type RelationshipInstanceCreateManyRelationshipDefInput = {
    id?: string;
    sourceLogicalId: string;
    targetLogicalId: string;
    properties?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    validFrom: Date | string;
    validTo?: Date | string | null;
    transactionTime?: Date | string;
};
export type RelationshipInstanceUpdateWithoutRelationshipDefInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceLogicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    targetLogicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    properties?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    validFrom?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    validTo?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    transactionTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RelationshipInstanceUncheckedUpdateWithoutRelationshipDefInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceLogicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    targetLogicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    properties?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    validFrom?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    validTo?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    transactionTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RelationshipInstanceUncheckedUpdateManyWithoutRelationshipDefInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceLogicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    targetLogicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    properties?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    validFrom?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    validTo?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    transactionTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RelationshipInstanceSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    relationshipDefinitionId?: boolean;
    sourceLogicalId?: boolean;
    targetLogicalId?: boolean;
    properties?: boolean;
    validFrom?: boolean;
    validTo?: boolean;
    transactionTime?: boolean;
    relationshipDef?: boolean | Prisma.RelationshipDefinitionDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["relationshipInstance"]>;
export type RelationshipInstanceSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    relationshipDefinitionId?: boolean;
    sourceLogicalId?: boolean;
    targetLogicalId?: boolean;
    properties?: boolean;
    validFrom?: boolean;
    validTo?: boolean;
    transactionTime?: boolean;
    relationshipDef?: boolean | Prisma.RelationshipDefinitionDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["relationshipInstance"]>;
export type RelationshipInstanceSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    relationshipDefinitionId?: boolean;
    sourceLogicalId?: boolean;
    targetLogicalId?: boolean;
    properties?: boolean;
    validFrom?: boolean;
    validTo?: boolean;
    transactionTime?: boolean;
    relationshipDef?: boolean | Prisma.RelationshipDefinitionDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["relationshipInstance"]>;
export type RelationshipInstanceSelectScalar = {
    id?: boolean;
    relationshipDefinitionId?: boolean;
    sourceLogicalId?: boolean;
    targetLogicalId?: boolean;
    properties?: boolean;
    validFrom?: boolean;
    validTo?: boolean;
    transactionTime?: boolean;
};
export type RelationshipInstanceOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "relationshipDefinitionId" | "sourceLogicalId" | "targetLogicalId" | "properties" | "validFrom" | "validTo" | "transactionTime", ExtArgs["result"]["relationshipInstance"]>;
export type RelationshipInstanceInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    relationshipDef?: boolean | Prisma.RelationshipDefinitionDefaultArgs<ExtArgs>;
};
export type RelationshipInstanceIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    relationshipDef?: boolean | Prisma.RelationshipDefinitionDefaultArgs<ExtArgs>;
};
export type RelationshipInstanceIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    relationshipDef?: boolean | Prisma.RelationshipDefinitionDefaultArgs<ExtArgs>;
};
export type $RelationshipInstancePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "RelationshipInstance";
    objects: {
        relationshipDef: Prisma.$RelationshipDefinitionPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        relationshipDefinitionId: string;
        sourceLogicalId: string;
        targetLogicalId: string;
        properties: runtime.JsonValue | null;
        validFrom: Date;
        validTo: Date | null;
        transactionTime: Date;
    }, ExtArgs["result"]["relationshipInstance"]>;
    composites: {};
};
export type RelationshipInstanceGetPayload<S extends boolean | null | undefined | RelationshipInstanceDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$RelationshipInstancePayload, S>;
export type RelationshipInstanceCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<RelationshipInstanceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: RelationshipInstanceCountAggregateInputType | true;
};
export interface RelationshipInstanceDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['RelationshipInstance'];
        meta: {
            name: 'RelationshipInstance';
        };
    };
    /**
     * Find zero or one RelationshipInstance that matches the filter.
     * @param {RelationshipInstanceFindUniqueArgs} args - Arguments to find a RelationshipInstance
     * @example
     * // Get one RelationshipInstance
     * const relationshipInstance = await prisma.relationshipInstance.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RelationshipInstanceFindUniqueArgs>(args: Prisma.SelectSubset<T, RelationshipInstanceFindUniqueArgs<ExtArgs>>): Prisma.Prisma__RelationshipInstanceClient<runtime.Types.Result.GetResult<Prisma.$RelationshipInstancePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one RelationshipInstance that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RelationshipInstanceFindUniqueOrThrowArgs} args - Arguments to find a RelationshipInstance
     * @example
     * // Get one RelationshipInstance
     * const relationshipInstance = await prisma.relationshipInstance.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RelationshipInstanceFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, RelationshipInstanceFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__RelationshipInstanceClient<runtime.Types.Result.GetResult<Prisma.$RelationshipInstancePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first RelationshipInstance that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RelationshipInstanceFindFirstArgs} args - Arguments to find a RelationshipInstance
     * @example
     * // Get one RelationshipInstance
     * const relationshipInstance = await prisma.relationshipInstance.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RelationshipInstanceFindFirstArgs>(args?: Prisma.SelectSubset<T, RelationshipInstanceFindFirstArgs<ExtArgs>>): Prisma.Prisma__RelationshipInstanceClient<runtime.Types.Result.GetResult<Prisma.$RelationshipInstancePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first RelationshipInstance that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RelationshipInstanceFindFirstOrThrowArgs} args - Arguments to find a RelationshipInstance
     * @example
     * // Get one RelationshipInstance
     * const relationshipInstance = await prisma.relationshipInstance.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RelationshipInstanceFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, RelationshipInstanceFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__RelationshipInstanceClient<runtime.Types.Result.GetResult<Prisma.$RelationshipInstancePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more RelationshipInstances that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RelationshipInstanceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RelationshipInstances
     * const relationshipInstances = await prisma.relationshipInstance.findMany()
     *
     * // Get first 10 RelationshipInstances
     * const relationshipInstances = await prisma.relationshipInstance.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const relationshipInstanceWithIdOnly = await prisma.relationshipInstance.findMany({ select: { id: true } })
     *
     */
    findMany<T extends RelationshipInstanceFindManyArgs>(args?: Prisma.SelectSubset<T, RelationshipInstanceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RelationshipInstancePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a RelationshipInstance.
     * @param {RelationshipInstanceCreateArgs} args - Arguments to create a RelationshipInstance.
     * @example
     * // Create one RelationshipInstance
     * const RelationshipInstance = await prisma.relationshipInstance.create({
     *   data: {
     *     // ... data to create a RelationshipInstance
     *   }
     * })
     *
     */
    create<T extends RelationshipInstanceCreateArgs>(args: Prisma.SelectSubset<T, RelationshipInstanceCreateArgs<ExtArgs>>): Prisma.Prisma__RelationshipInstanceClient<runtime.Types.Result.GetResult<Prisma.$RelationshipInstancePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many RelationshipInstances.
     * @param {RelationshipInstanceCreateManyArgs} args - Arguments to create many RelationshipInstances.
     * @example
     * // Create many RelationshipInstances
     * const relationshipInstance = await prisma.relationshipInstance.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends RelationshipInstanceCreateManyArgs>(args?: Prisma.SelectSubset<T, RelationshipInstanceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many RelationshipInstances and returns the data saved in the database.
     * @param {RelationshipInstanceCreateManyAndReturnArgs} args - Arguments to create many RelationshipInstances.
     * @example
     * // Create many RelationshipInstances
     * const relationshipInstance = await prisma.relationshipInstance.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many RelationshipInstances and only return the `id`
     * const relationshipInstanceWithIdOnly = await prisma.relationshipInstance.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends RelationshipInstanceCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, RelationshipInstanceCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RelationshipInstancePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a RelationshipInstance.
     * @param {RelationshipInstanceDeleteArgs} args - Arguments to delete one RelationshipInstance.
     * @example
     * // Delete one RelationshipInstance
     * const RelationshipInstance = await prisma.relationshipInstance.delete({
     *   where: {
     *     // ... filter to delete one RelationshipInstance
     *   }
     * })
     *
     */
    delete<T extends RelationshipInstanceDeleteArgs>(args: Prisma.SelectSubset<T, RelationshipInstanceDeleteArgs<ExtArgs>>): Prisma.Prisma__RelationshipInstanceClient<runtime.Types.Result.GetResult<Prisma.$RelationshipInstancePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one RelationshipInstance.
     * @param {RelationshipInstanceUpdateArgs} args - Arguments to update one RelationshipInstance.
     * @example
     * // Update one RelationshipInstance
     * const relationshipInstance = await prisma.relationshipInstance.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends RelationshipInstanceUpdateArgs>(args: Prisma.SelectSubset<T, RelationshipInstanceUpdateArgs<ExtArgs>>): Prisma.Prisma__RelationshipInstanceClient<runtime.Types.Result.GetResult<Prisma.$RelationshipInstancePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more RelationshipInstances.
     * @param {RelationshipInstanceDeleteManyArgs} args - Arguments to filter RelationshipInstances to delete.
     * @example
     * // Delete a few RelationshipInstances
     * const { count } = await prisma.relationshipInstance.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends RelationshipInstanceDeleteManyArgs>(args?: Prisma.SelectSubset<T, RelationshipInstanceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more RelationshipInstances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RelationshipInstanceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RelationshipInstances
     * const relationshipInstance = await prisma.relationshipInstance.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends RelationshipInstanceUpdateManyArgs>(args: Prisma.SelectSubset<T, RelationshipInstanceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more RelationshipInstances and returns the data updated in the database.
     * @param {RelationshipInstanceUpdateManyAndReturnArgs} args - Arguments to update many RelationshipInstances.
     * @example
     * // Update many RelationshipInstances
     * const relationshipInstance = await prisma.relationshipInstance.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more RelationshipInstances and only return the `id`
     * const relationshipInstanceWithIdOnly = await prisma.relationshipInstance.updateManyAndReturn({
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
    updateManyAndReturn<T extends RelationshipInstanceUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, RelationshipInstanceUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RelationshipInstancePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one RelationshipInstance.
     * @param {RelationshipInstanceUpsertArgs} args - Arguments to update or create a RelationshipInstance.
     * @example
     * // Update or create a RelationshipInstance
     * const relationshipInstance = await prisma.relationshipInstance.upsert({
     *   create: {
     *     // ... data to create a RelationshipInstance
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RelationshipInstance we want to update
     *   }
     * })
     */
    upsert<T extends RelationshipInstanceUpsertArgs>(args: Prisma.SelectSubset<T, RelationshipInstanceUpsertArgs<ExtArgs>>): Prisma.Prisma__RelationshipInstanceClient<runtime.Types.Result.GetResult<Prisma.$RelationshipInstancePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of RelationshipInstances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RelationshipInstanceCountArgs} args - Arguments to filter RelationshipInstances to count.
     * @example
     * // Count the number of RelationshipInstances
     * const count = await prisma.relationshipInstance.count({
     *   where: {
     *     // ... the filter for the RelationshipInstances we want to count
     *   }
     * })
    **/
    count<T extends RelationshipInstanceCountArgs>(args?: Prisma.Subset<T, RelationshipInstanceCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], RelationshipInstanceCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a RelationshipInstance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RelationshipInstanceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends RelationshipInstanceAggregateArgs>(args: Prisma.Subset<T, RelationshipInstanceAggregateArgs>): Prisma.PrismaPromise<GetRelationshipInstanceAggregateType<T>>;
    /**
     * Group by RelationshipInstance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RelationshipInstanceGroupByArgs} args - Group by arguments.
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
    groupBy<T extends RelationshipInstanceGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: RelationshipInstanceGroupByArgs['orderBy'];
    } : {
        orderBy?: RelationshipInstanceGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, RelationshipInstanceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRelationshipInstanceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the RelationshipInstance model
     */
    readonly fields: RelationshipInstanceFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for RelationshipInstance.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__RelationshipInstanceClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    relationshipDef<T extends Prisma.RelationshipDefinitionDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.RelationshipDefinitionDefaultArgs<ExtArgs>>): Prisma.Prisma__RelationshipDefinitionClient<runtime.Types.Result.GetResult<Prisma.$RelationshipDefinitionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
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
 * Fields of the RelationshipInstance model
 */
export interface RelationshipInstanceFieldRefs {
    readonly id: Prisma.FieldRef<"RelationshipInstance", 'String'>;
    readonly relationshipDefinitionId: Prisma.FieldRef<"RelationshipInstance", 'String'>;
    readonly sourceLogicalId: Prisma.FieldRef<"RelationshipInstance", 'String'>;
    readonly targetLogicalId: Prisma.FieldRef<"RelationshipInstance", 'String'>;
    readonly properties: Prisma.FieldRef<"RelationshipInstance", 'Json'>;
    readonly validFrom: Prisma.FieldRef<"RelationshipInstance", 'DateTime'>;
    readonly validTo: Prisma.FieldRef<"RelationshipInstance", 'DateTime'>;
    readonly transactionTime: Prisma.FieldRef<"RelationshipInstance", 'DateTime'>;
}
/**
 * RelationshipInstance findUnique
 */
export type RelationshipInstanceFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RelationshipInstance
     */
    select?: Prisma.RelationshipInstanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RelationshipInstance
     */
    omit?: Prisma.RelationshipInstanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RelationshipInstanceInclude<ExtArgs> | null;
    /**
     * Filter, which RelationshipInstance to fetch.
     */
    where: Prisma.RelationshipInstanceWhereUniqueInput;
};
/**
 * RelationshipInstance findUniqueOrThrow
 */
export type RelationshipInstanceFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RelationshipInstance
     */
    select?: Prisma.RelationshipInstanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RelationshipInstance
     */
    omit?: Prisma.RelationshipInstanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RelationshipInstanceInclude<ExtArgs> | null;
    /**
     * Filter, which RelationshipInstance to fetch.
     */
    where: Prisma.RelationshipInstanceWhereUniqueInput;
};
/**
 * RelationshipInstance findFirst
 */
export type RelationshipInstanceFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RelationshipInstance
     */
    select?: Prisma.RelationshipInstanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RelationshipInstance
     */
    omit?: Prisma.RelationshipInstanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RelationshipInstanceInclude<ExtArgs> | null;
    /**
     * Filter, which RelationshipInstance to fetch.
     */
    where?: Prisma.RelationshipInstanceWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of RelationshipInstances to fetch.
     */
    orderBy?: Prisma.RelationshipInstanceOrderByWithRelationInput | Prisma.RelationshipInstanceOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for RelationshipInstances.
     */
    cursor?: Prisma.RelationshipInstanceWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` RelationshipInstances from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` RelationshipInstances.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of RelationshipInstances.
     */
    distinct?: Prisma.RelationshipInstanceScalarFieldEnum | Prisma.RelationshipInstanceScalarFieldEnum[];
};
/**
 * RelationshipInstance findFirstOrThrow
 */
export type RelationshipInstanceFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RelationshipInstance
     */
    select?: Prisma.RelationshipInstanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RelationshipInstance
     */
    omit?: Prisma.RelationshipInstanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RelationshipInstanceInclude<ExtArgs> | null;
    /**
     * Filter, which RelationshipInstance to fetch.
     */
    where?: Prisma.RelationshipInstanceWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of RelationshipInstances to fetch.
     */
    orderBy?: Prisma.RelationshipInstanceOrderByWithRelationInput | Prisma.RelationshipInstanceOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for RelationshipInstances.
     */
    cursor?: Prisma.RelationshipInstanceWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` RelationshipInstances from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` RelationshipInstances.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of RelationshipInstances.
     */
    distinct?: Prisma.RelationshipInstanceScalarFieldEnum | Prisma.RelationshipInstanceScalarFieldEnum[];
};
/**
 * RelationshipInstance findMany
 */
export type RelationshipInstanceFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RelationshipInstance
     */
    select?: Prisma.RelationshipInstanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RelationshipInstance
     */
    omit?: Prisma.RelationshipInstanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RelationshipInstanceInclude<ExtArgs> | null;
    /**
     * Filter, which RelationshipInstances to fetch.
     */
    where?: Prisma.RelationshipInstanceWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of RelationshipInstances to fetch.
     */
    orderBy?: Prisma.RelationshipInstanceOrderByWithRelationInput | Prisma.RelationshipInstanceOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing RelationshipInstances.
     */
    cursor?: Prisma.RelationshipInstanceWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` RelationshipInstances from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` RelationshipInstances.
     */
    skip?: number;
    distinct?: Prisma.RelationshipInstanceScalarFieldEnum | Prisma.RelationshipInstanceScalarFieldEnum[];
};
/**
 * RelationshipInstance create
 */
export type RelationshipInstanceCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RelationshipInstance
     */
    select?: Prisma.RelationshipInstanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RelationshipInstance
     */
    omit?: Prisma.RelationshipInstanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RelationshipInstanceInclude<ExtArgs> | null;
    /**
     * The data needed to create a RelationshipInstance.
     */
    data: Prisma.XOR<Prisma.RelationshipInstanceCreateInput, Prisma.RelationshipInstanceUncheckedCreateInput>;
};
/**
 * RelationshipInstance createMany
 */
export type RelationshipInstanceCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many RelationshipInstances.
     */
    data: Prisma.RelationshipInstanceCreateManyInput | Prisma.RelationshipInstanceCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * RelationshipInstance createManyAndReturn
 */
export type RelationshipInstanceCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RelationshipInstance
     */
    select?: Prisma.RelationshipInstanceSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the RelationshipInstance
     */
    omit?: Prisma.RelationshipInstanceOmit<ExtArgs> | null;
    /**
     * The data used to create many RelationshipInstances.
     */
    data: Prisma.RelationshipInstanceCreateManyInput | Prisma.RelationshipInstanceCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RelationshipInstanceIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * RelationshipInstance update
 */
export type RelationshipInstanceUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RelationshipInstance
     */
    select?: Prisma.RelationshipInstanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RelationshipInstance
     */
    omit?: Prisma.RelationshipInstanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RelationshipInstanceInclude<ExtArgs> | null;
    /**
     * The data needed to update a RelationshipInstance.
     */
    data: Prisma.XOR<Prisma.RelationshipInstanceUpdateInput, Prisma.RelationshipInstanceUncheckedUpdateInput>;
    /**
     * Choose, which RelationshipInstance to update.
     */
    where: Prisma.RelationshipInstanceWhereUniqueInput;
};
/**
 * RelationshipInstance updateMany
 */
export type RelationshipInstanceUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update RelationshipInstances.
     */
    data: Prisma.XOR<Prisma.RelationshipInstanceUpdateManyMutationInput, Prisma.RelationshipInstanceUncheckedUpdateManyInput>;
    /**
     * Filter which RelationshipInstances to update
     */
    where?: Prisma.RelationshipInstanceWhereInput;
    /**
     * Limit how many RelationshipInstances to update.
     */
    limit?: number;
};
/**
 * RelationshipInstance updateManyAndReturn
 */
export type RelationshipInstanceUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RelationshipInstance
     */
    select?: Prisma.RelationshipInstanceSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the RelationshipInstance
     */
    omit?: Prisma.RelationshipInstanceOmit<ExtArgs> | null;
    /**
     * The data used to update RelationshipInstances.
     */
    data: Prisma.XOR<Prisma.RelationshipInstanceUpdateManyMutationInput, Prisma.RelationshipInstanceUncheckedUpdateManyInput>;
    /**
     * Filter which RelationshipInstances to update
     */
    where?: Prisma.RelationshipInstanceWhereInput;
    /**
     * Limit how many RelationshipInstances to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RelationshipInstanceIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * RelationshipInstance upsert
 */
export type RelationshipInstanceUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RelationshipInstance
     */
    select?: Prisma.RelationshipInstanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RelationshipInstance
     */
    omit?: Prisma.RelationshipInstanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RelationshipInstanceInclude<ExtArgs> | null;
    /**
     * The filter to search for the RelationshipInstance to update in case it exists.
     */
    where: Prisma.RelationshipInstanceWhereUniqueInput;
    /**
     * In case the RelationshipInstance found by the `where` argument doesn't exist, create a new RelationshipInstance with this data.
     */
    create: Prisma.XOR<Prisma.RelationshipInstanceCreateInput, Prisma.RelationshipInstanceUncheckedCreateInput>;
    /**
     * In case the RelationshipInstance was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.RelationshipInstanceUpdateInput, Prisma.RelationshipInstanceUncheckedUpdateInput>;
};
/**
 * RelationshipInstance delete
 */
export type RelationshipInstanceDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RelationshipInstance
     */
    select?: Prisma.RelationshipInstanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RelationshipInstance
     */
    omit?: Prisma.RelationshipInstanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RelationshipInstanceInclude<ExtArgs> | null;
    /**
     * Filter which RelationshipInstance to delete.
     */
    where: Prisma.RelationshipInstanceWhereUniqueInput;
};
/**
 * RelationshipInstance deleteMany
 */
export type RelationshipInstanceDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which RelationshipInstances to delete
     */
    where?: Prisma.RelationshipInstanceWhereInput;
    /**
     * Limit how many RelationshipInstances to delete.
     */
    limit?: number;
};
/**
 * RelationshipInstance without action
 */
export type RelationshipInstanceDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RelationshipInstance
     */
    select?: Prisma.RelationshipInstanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RelationshipInstance
     */
    omit?: Prisma.RelationshipInstanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RelationshipInstanceInclude<ExtArgs> | null;
};
export {};
//# sourceMappingURL=RelationshipInstance.d.ts.map