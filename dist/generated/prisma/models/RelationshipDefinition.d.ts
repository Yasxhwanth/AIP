import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
/**
 * Model RelationshipDefinition
 *
 */
export type RelationshipDefinitionModel = runtime.Types.Result.DefaultSelection<Prisma.$RelationshipDefinitionPayload>;
export type AggregateRelationshipDefinition = {
    _count: RelationshipDefinitionCountAggregateOutputType | null;
    _min: RelationshipDefinitionMinAggregateOutputType | null;
    _max: RelationshipDefinitionMaxAggregateOutputType | null;
};
export type RelationshipDefinitionMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    createdAt: Date | null;
    sourceEntityTypeId: string | null;
    targetEntityTypeId: string | null;
};
export type RelationshipDefinitionMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    createdAt: Date | null;
    sourceEntityTypeId: string | null;
    targetEntityTypeId: string | null;
};
export type RelationshipDefinitionCountAggregateOutputType = {
    id: number;
    name: number;
    createdAt: number;
    sourceEntityTypeId: number;
    targetEntityTypeId: number;
    _all: number;
};
export type RelationshipDefinitionMinAggregateInputType = {
    id?: true;
    name?: true;
    createdAt?: true;
    sourceEntityTypeId?: true;
    targetEntityTypeId?: true;
};
export type RelationshipDefinitionMaxAggregateInputType = {
    id?: true;
    name?: true;
    createdAt?: true;
    sourceEntityTypeId?: true;
    targetEntityTypeId?: true;
};
export type RelationshipDefinitionCountAggregateInputType = {
    id?: true;
    name?: true;
    createdAt?: true;
    sourceEntityTypeId?: true;
    targetEntityTypeId?: true;
    _all?: true;
};
export type RelationshipDefinitionAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which RelationshipDefinition to aggregate.
     */
    where?: Prisma.RelationshipDefinitionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of RelationshipDefinitions to fetch.
     */
    orderBy?: Prisma.RelationshipDefinitionOrderByWithRelationInput | Prisma.RelationshipDefinitionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.RelationshipDefinitionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` RelationshipDefinitions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` RelationshipDefinitions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned RelationshipDefinitions
    **/
    _count?: true | RelationshipDefinitionCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: RelationshipDefinitionMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: RelationshipDefinitionMaxAggregateInputType;
};
export type GetRelationshipDefinitionAggregateType<T extends RelationshipDefinitionAggregateArgs> = {
    [P in keyof T & keyof AggregateRelationshipDefinition]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateRelationshipDefinition[P]> : Prisma.GetScalarType<T[P], AggregateRelationshipDefinition[P]>;
};
export type RelationshipDefinitionGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RelationshipDefinitionWhereInput;
    orderBy?: Prisma.RelationshipDefinitionOrderByWithAggregationInput | Prisma.RelationshipDefinitionOrderByWithAggregationInput[];
    by: Prisma.RelationshipDefinitionScalarFieldEnum[] | Prisma.RelationshipDefinitionScalarFieldEnum;
    having?: Prisma.RelationshipDefinitionScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: RelationshipDefinitionCountAggregateInputType | true;
    _min?: RelationshipDefinitionMinAggregateInputType;
    _max?: RelationshipDefinitionMaxAggregateInputType;
};
export type RelationshipDefinitionGroupByOutputType = {
    id: string;
    name: string;
    createdAt: Date;
    sourceEntityTypeId: string;
    targetEntityTypeId: string;
    _count: RelationshipDefinitionCountAggregateOutputType | null;
    _min: RelationshipDefinitionMinAggregateOutputType | null;
    _max: RelationshipDefinitionMaxAggregateOutputType | null;
};
type GetRelationshipDefinitionGroupByPayload<T extends RelationshipDefinitionGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<RelationshipDefinitionGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof RelationshipDefinitionGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], RelationshipDefinitionGroupByOutputType[P]> : Prisma.GetScalarType<T[P], RelationshipDefinitionGroupByOutputType[P]>;
}>>;
export type RelationshipDefinitionWhereInput = {
    AND?: Prisma.RelationshipDefinitionWhereInput | Prisma.RelationshipDefinitionWhereInput[];
    OR?: Prisma.RelationshipDefinitionWhereInput[];
    NOT?: Prisma.RelationshipDefinitionWhereInput | Prisma.RelationshipDefinitionWhereInput[];
    id?: Prisma.StringFilter<"RelationshipDefinition"> | string;
    name?: Prisma.StringFilter<"RelationshipDefinition"> | string;
    createdAt?: Prisma.DateTimeFilter<"RelationshipDefinition"> | Date | string;
    sourceEntityTypeId?: Prisma.StringFilter<"RelationshipDefinition"> | string;
    targetEntityTypeId?: Prisma.StringFilter<"RelationshipDefinition"> | string;
    sourceEntityType?: Prisma.XOR<Prisma.EntityTypeScalarRelationFilter, Prisma.EntityTypeWhereInput>;
    targetEntityType?: Prisma.XOR<Prisma.EntityTypeScalarRelationFilter, Prisma.EntityTypeWhereInput>;
    instances?: Prisma.RelationshipInstanceListRelationFilter;
};
export type RelationshipDefinitionOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    sourceEntityTypeId?: Prisma.SortOrder;
    targetEntityTypeId?: Prisma.SortOrder;
    sourceEntityType?: Prisma.EntityTypeOrderByWithRelationInput;
    targetEntityType?: Prisma.EntityTypeOrderByWithRelationInput;
    instances?: Prisma.RelationshipInstanceOrderByRelationAggregateInput;
};
export type RelationshipDefinitionWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.RelationshipDefinitionWhereInput | Prisma.RelationshipDefinitionWhereInput[];
    OR?: Prisma.RelationshipDefinitionWhereInput[];
    NOT?: Prisma.RelationshipDefinitionWhereInput | Prisma.RelationshipDefinitionWhereInput[];
    name?: Prisma.StringFilter<"RelationshipDefinition"> | string;
    createdAt?: Prisma.DateTimeFilter<"RelationshipDefinition"> | Date | string;
    sourceEntityTypeId?: Prisma.StringFilter<"RelationshipDefinition"> | string;
    targetEntityTypeId?: Prisma.StringFilter<"RelationshipDefinition"> | string;
    sourceEntityType?: Prisma.XOR<Prisma.EntityTypeScalarRelationFilter, Prisma.EntityTypeWhereInput>;
    targetEntityType?: Prisma.XOR<Prisma.EntityTypeScalarRelationFilter, Prisma.EntityTypeWhereInput>;
    instances?: Prisma.RelationshipInstanceListRelationFilter;
}, "id">;
export type RelationshipDefinitionOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    sourceEntityTypeId?: Prisma.SortOrder;
    targetEntityTypeId?: Prisma.SortOrder;
    _count?: Prisma.RelationshipDefinitionCountOrderByAggregateInput;
    _max?: Prisma.RelationshipDefinitionMaxOrderByAggregateInput;
    _min?: Prisma.RelationshipDefinitionMinOrderByAggregateInput;
};
export type RelationshipDefinitionScalarWhereWithAggregatesInput = {
    AND?: Prisma.RelationshipDefinitionScalarWhereWithAggregatesInput | Prisma.RelationshipDefinitionScalarWhereWithAggregatesInput[];
    OR?: Prisma.RelationshipDefinitionScalarWhereWithAggregatesInput[];
    NOT?: Prisma.RelationshipDefinitionScalarWhereWithAggregatesInput | Prisma.RelationshipDefinitionScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"RelationshipDefinition"> | string;
    name?: Prisma.StringWithAggregatesFilter<"RelationshipDefinition"> | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"RelationshipDefinition"> | Date | string;
    sourceEntityTypeId?: Prisma.StringWithAggregatesFilter<"RelationshipDefinition"> | string;
    targetEntityTypeId?: Prisma.StringWithAggregatesFilter<"RelationshipDefinition"> | string;
};
export type RelationshipDefinitionCreateInput = {
    id?: string;
    name: string;
    createdAt?: Date | string;
    sourceEntityType: Prisma.EntityTypeCreateNestedOneWithoutOutgoingRelationshipsInput;
    targetEntityType: Prisma.EntityTypeCreateNestedOneWithoutIncomingRelationshipsInput;
    instances?: Prisma.RelationshipInstanceCreateNestedManyWithoutRelationshipDefInput;
};
export type RelationshipDefinitionUncheckedCreateInput = {
    id?: string;
    name: string;
    createdAt?: Date | string;
    sourceEntityTypeId: string;
    targetEntityTypeId: string;
    instances?: Prisma.RelationshipInstanceUncheckedCreateNestedManyWithoutRelationshipDefInput;
};
export type RelationshipDefinitionUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    sourceEntityType?: Prisma.EntityTypeUpdateOneRequiredWithoutOutgoingRelationshipsNestedInput;
    targetEntityType?: Prisma.EntityTypeUpdateOneRequiredWithoutIncomingRelationshipsNestedInput;
    instances?: Prisma.RelationshipInstanceUpdateManyWithoutRelationshipDefNestedInput;
};
export type RelationshipDefinitionUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    sourceEntityTypeId?: Prisma.StringFieldUpdateOperationsInput | string;
    targetEntityTypeId?: Prisma.StringFieldUpdateOperationsInput | string;
    instances?: Prisma.RelationshipInstanceUncheckedUpdateManyWithoutRelationshipDefNestedInput;
};
export type RelationshipDefinitionCreateManyInput = {
    id?: string;
    name: string;
    createdAt?: Date | string;
    sourceEntityTypeId: string;
    targetEntityTypeId: string;
};
export type RelationshipDefinitionUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RelationshipDefinitionUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    sourceEntityTypeId?: Prisma.StringFieldUpdateOperationsInput | string;
    targetEntityTypeId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type RelationshipDefinitionListRelationFilter = {
    every?: Prisma.RelationshipDefinitionWhereInput;
    some?: Prisma.RelationshipDefinitionWhereInput;
    none?: Prisma.RelationshipDefinitionWhereInput;
};
export type RelationshipDefinitionOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type RelationshipDefinitionCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    sourceEntityTypeId?: Prisma.SortOrder;
    targetEntityTypeId?: Prisma.SortOrder;
};
export type RelationshipDefinitionMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    sourceEntityTypeId?: Prisma.SortOrder;
    targetEntityTypeId?: Prisma.SortOrder;
};
export type RelationshipDefinitionMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    sourceEntityTypeId?: Prisma.SortOrder;
    targetEntityTypeId?: Prisma.SortOrder;
};
export type RelationshipDefinitionScalarRelationFilter = {
    is?: Prisma.RelationshipDefinitionWhereInput;
    isNot?: Prisma.RelationshipDefinitionWhereInput;
};
export type RelationshipDefinitionCreateNestedManyWithoutSourceEntityTypeInput = {
    create?: Prisma.XOR<Prisma.RelationshipDefinitionCreateWithoutSourceEntityTypeInput, Prisma.RelationshipDefinitionUncheckedCreateWithoutSourceEntityTypeInput> | Prisma.RelationshipDefinitionCreateWithoutSourceEntityTypeInput[] | Prisma.RelationshipDefinitionUncheckedCreateWithoutSourceEntityTypeInput[];
    connectOrCreate?: Prisma.RelationshipDefinitionCreateOrConnectWithoutSourceEntityTypeInput | Prisma.RelationshipDefinitionCreateOrConnectWithoutSourceEntityTypeInput[];
    createMany?: Prisma.RelationshipDefinitionCreateManySourceEntityTypeInputEnvelope;
    connect?: Prisma.RelationshipDefinitionWhereUniqueInput | Prisma.RelationshipDefinitionWhereUniqueInput[];
};
export type RelationshipDefinitionCreateNestedManyWithoutTargetEntityTypeInput = {
    create?: Prisma.XOR<Prisma.RelationshipDefinitionCreateWithoutTargetEntityTypeInput, Prisma.RelationshipDefinitionUncheckedCreateWithoutTargetEntityTypeInput> | Prisma.RelationshipDefinitionCreateWithoutTargetEntityTypeInput[] | Prisma.RelationshipDefinitionUncheckedCreateWithoutTargetEntityTypeInput[];
    connectOrCreate?: Prisma.RelationshipDefinitionCreateOrConnectWithoutTargetEntityTypeInput | Prisma.RelationshipDefinitionCreateOrConnectWithoutTargetEntityTypeInput[];
    createMany?: Prisma.RelationshipDefinitionCreateManyTargetEntityTypeInputEnvelope;
    connect?: Prisma.RelationshipDefinitionWhereUniqueInput | Prisma.RelationshipDefinitionWhereUniqueInput[];
};
export type RelationshipDefinitionUncheckedCreateNestedManyWithoutSourceEntityTypeInput = {
    create?: Prisma.XOR<Prisma.RelationshipDefinitionCreateWithoutSourceEntityTypeInput, Prisma.RelationshipDefinitionUncheckedCreateWithoutSourceEntityTypeInput> | Prisma.RelationshipDefinitionCreateWithoutSourceEntityTypeInput[] | Prisma.RelationshipDefinitionUncheckedCreateWithoutSourceEntityTypeInput[];
    connectOrCreate?: Prisma.RelationshipDefinitionCreateOrConnectWithoutSourceEntityTypeInput | Prisma.RelationshipDefinitionCreateOrConnectWithoutSourceEntityTypeInput[];
    createMany?: Prisma.RelationshipDefinitionCreateManySourceEntityTypeInputEnvelope;
    connect?: Prisma.RelationshipDefinitionWhereUniqueInput | Prisma.RelationshipDefinitionWhereUniqueInput[];
};
export type RelationshipDefinitionUncheckedCreateNestedManyWithoutTargetEntityTypeInput = {
    create?: Prisma.XOR<Prisma.RelationshipDefinitionCreateWithoutTargetEntityTypeInput, Prisma.RelationshipDefinitionUncheckedCreateWithoutTargetEntityTypeInput> | Prisma.RelationshipDefinitionCreateWithoutTargetEntityTypeInput[] | Prisma.RelationshipDefinitionUncheckedCreateWithoutTargetEntityTypeInput[];
    connectOrCreate?: Prisma.RelationshipDefinitionCreateOrConnectWithoutTargetEntityTypeInput | Prisma.RelationshipDefinitionCreateOrConnectWithoutTargetEntityTypeInput[];
    createMany?: Prisma.RelationshipDefinitionCreateManyTargetEntityTypeInputEnvelope;
    connect?: Prisma.RelationshipDefinitionWhereUniqueInput | Prisma.RelationshipDefinitionWhereUniqueInput[];
};
export type RelationshipDefinitionUpdateManyWithoutSourceEntityTypeNestedInput = {
    create?: Prisma.XOR<Prisma.RelationshipDefinitionCreateWithoutSourceEntityTypeInput, Prisma.RelationshipDefinitionUncheckedCreateWithoutSourceEntityTypeInput> | Prisma.RelationshipDefinitionCreateWithoutSourceEntityTypeInput[] | Prisma.RelationshipDefinitionUncheckedCreateWithoutSourceEntityTypeInput[];
    connectOrCreate?: Prisma.RelationshipDefinitionCreateOrConnectWithoutSourceEntityTypeInput | Prisma.RelationshipDefinitionCreateOrConnectWithoutSourceEntityTypeInput[];
    upsert?: Prisma.RelationshipDefinitionUpsertWithWhereUniqueWithoutSourceEntityTypeInput | Prisma.RelationshipDefinitionUpsertWithWhereUniqueWithoutSourceEntityTypeInput[];
    createMany?: Prisma.RelationshipDefinitionCreateManySourceEntityTypeInputEnvelope;
    set?: Prisma.RelationshipDefinitionWhereUniqueInput | Prisma.RelationshipDefinitionWhereUniqueInput[];
    disconnect?: Prisma.RelationshipDefinitionWhereUniqueInput | Prisma.RelationshipDefinitionWhereUniqueInput[];
    delete?: Prisma.RelationshipDefinitionWhereUniqueInput | Prisma.RelationshipDefinitionWhereUniqueInput[];
    connect?: Prisma.RelationshipDefinitionWhereUniqueInput | Prisma.RelationshipDefinitionWhereUniqueInput[];
    update?: Prisma.RelationshipDefinitionUpdateWithWhereUniqueWithoutSourceEntityTypeInput | Prisma.RelationshipDefinitionUpdateWithWhereUniqueWithoutSourceEntityTypeInput[];
    updateMany?: Prisma.RelationshipDefinitionUpdateManyWithWhereWithoutSourceEntityTypeInput | Prisma.RelationshipDefinitionUpdateManyWithWhereWithoutSourceEntityTypeInput[];
    deleteMany?: Prisma.RelationshipDefinitionScalarWhereInput | Prisma.RelationshipDefinitionScalarWhereInput[];
};
export type RelationshipDefinitionUpdateManyWithoutTargetEntityTypeNestedInput = {
    create?: Prisma.XOR<Prisma.RelationshipDefinitionCreateWithoutTargetEntityTypeInput, Prisma.RelationshipDefinitionUncheckedCreateWithoutTargetEntityTypeInput> | Prisma.RelationshipDefinitionCreateWithoutTargetEntityTypeInput[] | Prisma.RelationshipDefinitionUncheckedCreateWithoutTargetEntityTypeInput[];
    connectOrCreate?: Prisma.RelationshipDefinitionCreateOrConnectWithoutTargetEntityTypeInput | Prisma.RelationshipDefinitionCreateOrConnectWithoutTargetEntityTypeInput[];
    upsert?: Prisma.RelationshipDefinitionUpsertWithWhereUniqueWithoutTargetEntityTypeInput | Prisma.RelationshipDefinitionUpsertWithWhereUniqueWithoutTargetEntityTypeInput[];
    createMany?: Prisma.RelationshipDefinitionCreateManyTargetEntityTypeInputEnvelope;
    set?: Prisma.RelationshipDefinitionWhereUniqueInput | Prisma.RelationshipDefinitionWhereUniqueInput[];
    disconnect?: Prisma.RelationshipDefinitionWhereUniqueInput | Prisma.RelationshipDefinitionWhereUniqueInput[];
    delete?: Prisma.RelationshipDefinitionWhereUniqueInput | Prisma.RelationshipDefinitionWhereUniqueInput[];
    connect?: Prisma.RelationshipDefinitionWhereUniqueInput | Prisma.RelationshipDefinitionWhereUniqueInput[];
    update?: Prisma.RelationshipDefinitionUpdateWithWhereUniqueWithoutTargetEntityTypeInput | Prisma.RelationshipDefinitionUpdateWithWhereUniqueWithoutTargetEntityTypeInput[];
    updateMany?: Prisma.RelationshipDefinitionUpdateManyWithWhereWithoutTargetEntityTypeInput | Prisma.RelationshipDefinitionUpdateManyWithWhereWithoutTargetEntityTypeInput[];
    deleteMany?: Prisma.RelationshipDefinitionScalarWhereInput | Prisma.RelationshipDefinitionScalarWhereInput[];
};
export type RelationshipDefinitionUncheckedUpdateManyWithoutSourceEntityTypeNestedInput = {
    create?: Prisma.XOR<Prisma.RelationshipDefinitionCreateWithoutSourceEntityTypeInput, Prisma.RelationshipDefinitionUncheckedCreateWithoutSourceEntityTypeInput> | Prisma.RelationshipDefinitionCreateWithoutSourceEntityTypeInput[] | Prisma.RelationshipDefinitionUncheckedCreateWithoutSourceEntityTypeInput[];
    connectOrCreate?: Prisma.RelationshipDefinitionCreateOrConnectWithoutSourceEntityTypeInput | Prisma.RelationshipDefinitionCreateOrConnectWithoutSourceEntityTypeInput[];
    upsert?: Prisma.RelationshipDefinitionUpsertWithWhereUniqueWithoutSourceEntityTypeInput | Prisma.RelationshipDefinitionUpsertWithWhereUniqueWithoutSourceEntityTypeInput[];
    createMany?: Prisma.RelationshipDefinitionCreateManySourceEntityTypeInputEnvelope;
    set?: Prisma.RelationshipDefinitionWhereUniqueInput | Prisma.RelationshipDefinitionWhereUniqueInput[];
    disconnect?: Prisma.RelationshipDefinitionWhereUniqueInput | Prisma.RelationshipDefinitionWhereUniqueInput[];
    delete?: Prisma.RelationshipDefinitionWhereUniqueInput | Prisma.RelationshipDefinitionWhereUniqueInput[];
    connect?: Prisma.RelationshipDefinitionWhereUniqueInput | Prisma.RelationshipDefinitionWhereUniqueInput[];
    update?: Prisma.RelationshipDefinitionUpdateWithWhereUniqueWithoutSourceEntityTypeInput | Prisma.RelationshipDefinitionUpdateWithWhereUniqueWithoutSourceEntityTypeInput[];
    updateMany?: Prisma.RelationshipDefinitionUpdateManyWithWhereWithoutSourceEntityTypeInput | Prisma.RelationshipDefinitionUpdateManyWithWhereWithoutSourceEntityTypeInput[];
    deleteMany?: Prisma.RelationshipDefinitionScalarWhereInput | Prisma.RelationshipDefinitionScalarWhereInput[];
};
export type RelationshipDefinitionUncheckedUpdateManyWithoutTargetEntityTypeNestedInput = {
    create?: Prisma.XOR<Prisma.RelationshipDefinitionCreateWithoutTargetEntityTypeInput, Prisma.RelationshipDefinitionUncheckedCreateWithoutTargetEntityTypeInput> | Prisma.RelationshipDefinitionCreateWithoutTargetEntityTypeInput[] | Prisma.RelationshipDefinitionUncheckedCreateWithoutTargetEntityTypeInput[];
    connectOrCreate?: Prisma.RelationshipDefinitionCreateOrConnectWithoutTargetEntityTypeInput | Prisma.RelationshipDefinitionCreateOrConnectWithoutTargetEntityTypeInput[];
    upsert?: Prisma.RelationshipDefinitionUpsertWithWhereUniqueWithoutTargetEntityTypeInput | Prisma.RelationshipDefinitionUpsertWithWhereUniqueWithoutTargetEntityTypeInput[];
    createMany?: Prisma.RelationshipDefinitionCreateManyTargetEntityTypeInputEnvelope;
    set?: Prisma.RelationshipDefinitionWhereUniqueInput | Prisma.RelationshipDefinitionWhereUniqueInput[];
    disconnect?: Prisma.RelationshipDefinitionWhereUniqueInput | Prisma.RelationshipDefinitionWhereUniqueInput[];
    delete?: Prisma.RelationshipDefinitionWhereUniqueInput | Prisma.RelationshipDefinitionWhereUniqueInput[];
    connect?: Prisma.RelationshipDefinitionWhereUniqueInput | Prisma.RelationshipDefinitionWhereUniqueInput[];
    update?: Prisma.RelationshipDefinitionUpdateWithWhereUniqueWithoutTargetEntityTypeInput | Prisma.RelationshipDefinitionUpdateWithWhereUniqueWithoutTargetEntityTypeInput[];
    updateMany?: Prisma.RelationshipDefinitionUpdateManyWithWhereWithoutTargetEntityTypeInput | Prisma.RelationshipDefinitionUpdateManyWithWhereWithoutTargetEntityTypeInput[];
    deleteMany?: Prisma.RelationshipDefinitionScalarWhereInput | Prisma.RelationshipDefinitionScalarWhereInput[];
};
export type RelationshipDefinitionCreateNestedOneWithoutInstancesInput = {
    create?: Prisma.XOR<Prisma.RelationshipDefinitionCreateWithoutInstancesInput, Prisma.RelationshipDefinitionUncheckedCreateWithoutInstancesInput>;
    connectOrCreate?: Prisma.RelationshipDefinitionCreateOrConnectWithoutInstancesInput;
    connect?: Prisma.RelationshipDefinitionWhereUniqueInput;
};
export type RelationshipDefinitionUpdateOneRequiredWithoutInstancesNestedInput = {
    create?: Prisma.XOR<Prisma.RelationshipDefinitionCreateWithoutInstancesInput, Prisma.RelationshipDefinitionUncheckedCreateWithoutInstancesInput>;
    connectOrCreate?: Prisma.RelationshipDefinitionCreateOrConnectWithoutInstancesInput;
    upsert?: Prisma.RelationshipDefinitionUpsertWithoutInstancesInput;
    connect?: Prisma.RelationshipDefinitionWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.RelationshipDefinitionUpdateToOneWithWhereWithoutInstancesInput, Prisma.RelationshipDefinitionUpdateWithoutInstancesInput>, Prisma.RelationshipDefinitionUncheckedUpdateWithoutInstancesInput>;
};
export type RelationshipDefinitionCreateWithoutSourceEntityTypeInput = {
    id?: string;
    name: string;
    createdAt?: Date | string;
    targetEntityType: Prisma.EntityTypeCreateNestedOneWithoutIncomingRelationshipsInput;
    instances?: Prisma.RelationshipInstanceCreateNestedManyWithoutRelationshipDefInput;
};
export type RelationshipDefinitionUncheckedCreateWithoutSourceEntityTypeInput = {
    id?: string;
    name: string;
    createdAt?: Date | string;
    targetEntityTypeId: string;
    instances?: Prisma.RelationshipInstanceUncheckedCreateNestedManyWithoutRelationshipDefInput;
};
export type RelationshipDefinitionCreateOrConnectWithoutSourceEntityTypeInput = {
    where: Prisma.RelationshipDefinitionWhereUniqueInput;
    create: Prisma.XOR<Prisma.RelationshipDefinitionCreateWithoutSourceEntityTypeInput, Prisma.RelationshipDefinitionUncheckedCreateWithoutSourceEntityTypeInput>;
};
export type RelationshipDefinitionCreateManySourceEntityTypeInputEnvelope = {
    data: Prisma.RelationshipDefinitionCreateManySourceEntityTypeInput | Prisma.RelationshipDefinitionCreateManySourceEntityTypeInput[];
    skipDuplicates?: boolean;
};
export type RelationshipDefinitionCreateWithoutTargetEntityTypeInput = {
    id?: string;
    name: string;
    createdAt?: Date | string;
    sourceEntityType: Prisma.EntityTypeCreateNestedOneWithoutOutgoingRelationshipsInput;
    instances?: Prisma.RelationshipInstanceCreateNestedManyWithoutRelationshipDefInput;
};
export type RelationshipDefinitionUncheckedCreateWithoutTargetEntityTypeInput = {
    id?: string;
    name: string;
    createdAt?: Date | string;
    sourceEntityTypeId: string;
    instances?: Prisma.RelationshipInstanceUncheckedCreateNestedManyWithoutRelationshipDefInput;
};
export type RelationshipDefinitionCreateOrConnectWithoutTargetEntityTypeInput = {
    where: Prisma.RelationshipDefinitionWhereUniqueInput;
    create: Prisma.XOR<Prisma.RelationshipDefinitionCreateWithoutTargetEntityTypeInput, Prisma.RelationshipDefinitionUncheckedCreateWithoutTargetEntityTypeInput>;
};
export type RelationshipDefinitionCreateManyTargetEntityTypeInputEnvelope = {
    data: Prisma.RelationshipDefinitionCreateManyTargetEntityTypeInput | Prisma.RelationshipDefinitionCreateManyTargetEntityTypeInput[];
    skipDuplicates?: boolean;
};
export type RelationshipDefinitionUpsertWithWhereUniqueWithoutSourceEntityTypeInput = {
    where: Prisma.RelationshipDefinitionWhereUniqueInput;
    update: Prisma.XOR<Prisma.RelationshipDefinitionUpdateWithoutSourceEntityTypeInput, Prisma.RelationshipDefinitionUncheckedUpdateWithoutSourceEntityTypeInput>;
    create: Prisma.XOR<Prisma.RelationshipDefinitionCreateWithoutSourceEntityTypeInput, Prisma.RelationshipDefinitionUncheckedCreateWithoutSourceEntityTypeInput>;
};
export type RelationshipDefinitionUpdateWithWhereUniqueWithoutSourceEntityTypeInput = {
    where: Prisma.RelationshipDefinitionWhereUniqueInput;
    data: Prisma.XOR<Prisma.RelationshipDefinitionUpdateWithoutSourceEntityTypeInput, Prisma.RelationshipDefinitionUncheckedUpdateWithoutSourceEntityTypeInput>;
};
export type RelationshipDefinitionUpdateManyWithWhereWithoutSourceEntityTypeInput = {
    where: Prisma.RelationshipDefinitionScalarWhereInput;
    data: Prisma.XOR<Prisma.RelationshipDefinitionUpdateManyMutationInput, Prisma.RelationshipDefinitionUncheckedUpdateManyWithoutSourceEntityTypeInput>;
};
export type RelationshipDefinitionScalarWhereInput = {
    AND?: Prisma.RelationshipDefinitionScalarWhereInput | Prisma.RelationshipDefinitionScalarWhereInput[];
    OR?: Prisma.RelationshipDefinitionScalarWhereInput[];
    NOT?: Prisma.RelationshipDefinitionScalarWhereInput | Prisma.RelationshipDefinitionScalarWhereInput[];
    id?: Prisma.StringFilter<"RelationshipDefinition"> | string;
    name?: Prisma.StringFilter<"RelationshipDefinition"> | string;
    createdAt?: Prisma.DateTimeFilter<"RelationshipDefinition"> | Date | string;
    sourceEntityTypeId?: Prisma.StringFilter<"RelationshipDefinition"> | string;
    targetEntityTypeId?: Prisma.StringFilter<"RelationshipDefinition"> | string;
};
export type RelationshipDefinitionUpsertWithWhereUniqueWithoutTargetEntityTypeInput = {
    where: Prisma.RelationshipDefinitionWhereUniqueInput;
    update: Prisma.XOR<Prisma.RelationshipDefinitionUpdateWithoutTargetEntityTypeInput, Prisma.RelationshipDefinitionUncheckedUpdateWithoutTargetEntityTypeInput>;
    create: Prisma.XOR<Prisma.RelationshipDefinitionCreateWithoutTargetEntityTypeInput, Prisma.RelationshipDefinitionUncheckedCreateWithoutTargetEntityTypeInput>;
};
export type RelationshipDefinitionUpdateWithWhereUniqueWithoutTargetEntityTypeInput = {
    where: Prisma.RelationshipDefinitionWhereUniqueInput;
    data: Prisma.XOR<Prisma.RelationshipDefinitionUpdateWithoutTargetEntityTypeInput, Prisma.RelationshipDefinitionUncheckedUpdateWithoutTargetEntityTypeInput>;
};
export type RelationshipDefinitionUpdateManyWithWhereWithoutTargetEntityTypeInput = {
    where: Prisma.RelationshipDefinitionScalarWhereInput;
    data: Prisma.XOR<Prisma.RelationshipDefinitionUpdateManyMutationInput, Prisma.RelationshipDefinitionUncheckedUpdateManyWithoutTargetEntityTypeInput>;
};
export type RelationshipDefinitionCreateWithoutInstancesInput = {
    id?: string;
    name: string;
    createdAt?: Date | string;
    sourceEntityType: Prisma.EntityTypeCreateNestedOneWithoutOutgoingRelationshipsInput;
    targetEntityType: Prisma.EntityTypeCreateNestedOneWithoutIncomingRelationshipsInput;
};
export type RelationshipDefinitionUncheckedCreateWithoutInstancesInput = {
    id?: string;
    name: string;
    createdAt?: Date | string;
    sourceEntityTypeId: string;
    targetEntityTypeId: string;
};
export type RelationshipDefinitionCreateOrConnectWithoutInstancesInput = {
    where: Prisma.RelationshipDefinitionWhereUniqueInput;
    create: Prisma.XOR<Prisma.RelationshipDefinitionCreateWithoutInstancesInput, Prisma.RelationshipDefinitionUncheckedCreateWithoutInstancesInput>;
};
export type RelationshipDefinitionUpsertWithoutInstancesInput = {
    update: Prisma.XOR<Prisma.RelationshipDefinitionUpdateWithoutInstancesInput, Prisma.RelationshipDefinitionUncheckedUpdateWithoutInstancesInput>;
    create: Prisma.XOR<Prisma.RelationshipDefinitionCreateWithoutInstancesInput, Prisma.RelationshipDefinitionUncheckedCreateWithoutInstancesInput>;
    where?: Prisma.RelationshipDefinitionWhereInput;
};
export type RelationshipDefinitionUpdateToOneWithWhereWithoutInstancesInput = {
    where?: Prisma.RelationshipDefinitionWhereInput;
    data: Prisma.XOR<Prisma.RelationshipDefinitionUpdateWithoutInstancesInput, Prisma.RelationshipDefinitionUncheckedUpdateWithoutInstancesInput>;
};
export type RelationshipDefinitionUpdateWithoutInstancesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    sourceEntityType?: Prisma.EntityTypeUpdateOneRequiredWithoutOutgoingRelationshipsNestedInput;
    targetEntityType?: Prisma.EntityTypeUpdateOneRequiredWithoutIncomingRelationshipsNestedInput;
};
export type RelationshipDefinitionUncheckedUpdateWithoutInstancesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    sourceEntityTypeId?: Prisma.StringFieldUpdateOperationsInput | string;
    targetEntityTypeId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type RelationshipDefinitionCreateManySourceEntityTypeInput = {
    id?: string;
    name: string;
    createdAt?: Date | string;
    targetEntityTypeId: string;
};
export type RelationshipDefinitionCreateManyTargetEntityTypeInput = {
    id?: string;
    name: string;
    createdAt?: Date | string;
    sourceEntityTypeId: string;
};
export type RelationshipDefinitionUpdateWithoutSourceEntityTypeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    targetEntityType?: Prisma.EntityTypeUpdateOneRequiredWithoutIncomingRelationshipsNestedInput;
    instances?: Prisma.RelationshipInstanceUpdateManyWithoutRelationshipDefNestedInput;
};
export type RelationshipDefinitionUncheckedUpdateWithoutSourceEntityTypeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    targetEntityTypeId?: Prisma.StringFieldUpdateOperationsInput | string;
    instances?: Prisma.RelationshipInstanceUncheckedUpdateManyWithoutRelationshipDefNestedInput;
};
export type RelationshipDefinitionUncheckedUpdateManyWithoutSourceEntityTypeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    targetEntityTypeId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type RelationshipDefinitionUpdateWithoutTargetEntityTypeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    sourceEntityType?: Prisma.EntityTypeUpdateOneRequiredWithoutOutgoingRelationshipsNestedInput;
    instances?: Prisma.RelationshipInstanceUpdateManyWithoutRelationshipDefNestedInput;
};
export type RelationshipDefinitionUncheckedUpdateWithoutTargetEntityTypeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    sourceEntityTypeId?: Prisma.StringFieldUpdateOperationsInput | string;
    instances?: Prisma.RelationshipInstanceUncheckedUpdateManyWithoutRelationshipDefNestedInput;
};
export type RelationshipDefinitionUncheckedUpdateManyWithoutTargetEntityTypeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    sourceEntityTypeId?: Prisma.StringFieldUpdateOperationsInput | string;
};
/**
 * Count Type RelationshipDefinitionCountOutputType
 */
export type RelationshipDefinitionCountOutputType = {
    instances: number;
};
export type RelationshipDefinitionCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    instances?: boolean | RelationshipDefinitionCountOutputTypeCountInstancesArgs;
};
/**
 * RelationshipDefinitionCountOutputType without action
 */
export type RelationshipDefinitionCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RelationshipDefinitionCountOutputType
     */
    select?: Prisma.RelationshipDefinitionCountOutputTypeSelect<ExtArgs> | null;
};
/**
 * RelationshipDefinitionCountOutputType without action
 */
export type RelationshipDefinitionCountOutputTypeCountInstancesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RelationshipInstanceWhereInput;
};
export type RelationshipDefinitionSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    createdAt?: boolean;
    sourceEntityTypeId?: boolean;
    targetEntityTypeId?: boolean;
    sourceEntityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
    targetEntityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
    instances?: boolean | Prisma.RelationshipDefinition$instancesArgs<ExtArgs>;
    _count?: boolean | Prisma.RelationshipDefinitionCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["relationshipDefinition"]>;
export type RelationshipDefinitionSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    createdAt?: boolean;
    sourceEntityTypeId?: boolean;
    targetEntityTypeId?: boolean;
    sourceEntityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
    targetEntityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["relationshipDefinition"]>;
export type RelationshipDefinitionSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    createdAt?: boolean;
    sourceEntityTypeId?: boolean;
    targetEntityTypeId?: boolean;
    sourceEntityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
    targetEntityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["relationshipDefinition"]>;
export type RelationshipDefinitionSelectScalar = {
    id?: boolean;
    name?: boolean;
    createdAt?: boolean;
    sourceEntityTypeId?: boolean;
    targetEntityTypeId?: boolean;
};
export type RelationshipDefinitionOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "name" | "createdAt" | "sourceEntityTypeId" | "targetEntityTypeId", ExtArgs["result"]["relationshipDefinition"]>;
export type RelationshipDefinitionInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    sourceEntityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
    targetEntityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
    instances?: boolean | Prisma.RelationshipDefinition$instancesArgs<ExtArgs>;
    _count?: boolean | Prisma.RelationshipDefinitionCountOutputTypeDefaultArgs<ExtArgs>;
};
export type RelationshipDefinitionIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    sourceEntityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
    targetEntityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
};
export type RelationshipDefinitionIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    sourceEntityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
    targetEntityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
};
export type $RelationshipDefinitionPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "RelationshipDefinition";
    objects: {
        sourceEntityType: Prisma.$EntityTypePayload<ExtArgs>;
        targetEntityType: Prisma.$EntityTypePayload<ExtArgs>;
        instances: Prisma.$RelationshipInstancePayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        name: string;
        createdAt: Date;
        sourceEntityTypeId: string;
        targetEntityTypeId: string;
    }, ExtArgs["result"]["relationshipDefinition"]>;
    composites: {};
};
export type RelationshipDefinitionGetPayload<S extends boolean | null | undefined | RelationshipDefinitionDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$RelationshipDefinitionPayload, S>;
export type RelationshipDefinitionCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<RelationshipDefinitionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: RelationshipDefinitionCountAggregateInputType | true;
};
export interface RelationshipDefinitionDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['RelationshipDefinition'];
        meta: {
            name: 'RelationshipDefinition';
        };
    };
    /**
     * Find zero or one RelationshipDefinition that matches the filter.
     * @param {RelationshipDefinitionFindUniqueArgs} args - Arguments to find a RelationshipDefinition
     * @example
     * // Get one RelationshipDefinition
     * const relationshipDefinition = await prisma.relationshipDefinition.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RelationshipDefinitionFindUniqueArgs>(args: Prisma.SelectSubset<T, RelationshipDefinitionFindUniqueArgs<ExtArgs>>): Prisma.Prisma__RelationshipDefinitionClient<runtime.Types.Result.GetResult<Prisma.$RelationshipDefinitionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one RelationshipDefinition that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RelationshipDefinitionFindUniqueOrThrowArgs} args - Arguments to find a RelationshipDefinition
     * @example
     * // Get one RelationshipDefinition
     * const relationshipDefinition = await prisma.relationshipDefinition.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RelationshipDefinitionFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, RelationshipDefinitionFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__RelationshipDefinitionClient<runtime.Types.Result.GetResult<Prisma.$RelationshipDefinitionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first RelationshipDefinition that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RelationshipDefinitionFindFirstArgs} args - Arguments to find a RelationshipDefinition
     * @example
     * // Get one RelationshipDefinition
     * const relationshipDefinition = await prisma.relationshipDefinition.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RelationshipDefinitionFindFirstArgs>(args?: Prisma.SelectSubset<T, RelationshipDefinitionFindFirstArgs<ExtArgs>>): Prisma.Prisma__RelationshipDefinitionClient<runtime.Types.Result.GetResult<Prisma.$RelationshipDefinitionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first RelationshipDefinition that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RelationshipDefinitionFindFirstOrThrowArgs} args - Arguments to find a RelationshipDefinition
     * @example
     * // Get one RelationshipDefinition
     * const relationshipDefinition = await prisma.relationshipDefinition.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RelationshipDefinitionFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, RelationshipDefinitionFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__RelationshipDefinitionClient<runtime.Types.Result.GetResult<Prisma.$RelationshipDefinitionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more RelationshipDefinitions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RelationshipDefinitionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RelationshipDefinitions
     * const relationshipDefinitions = await prisma.relationshipDefinition.findMany()
     *
     * // Get first 10 RelationshipDefinitions
     * const relationshipDefinitions = await prisma.relationshipDefinition.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const relationshipDefinitionWithIdOnly = await prisma.relationshipDefinition.findMany({ select: { id: true } })
     *
     */
    findMany<T extends RelationshipDefinitionFindManyArgs>(args?: Prisma.SelectSubset<T, RelationshipDefinitionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RelationshipDefinitionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a RelationshipDefinition.
     * @param {RelationshipDefinitionCreateArgs} args - Arguments to create a RelationshipDefinition.
     * @example
     * // Create one RelationshipDefinition
     * const RelationshipDefinition = await prisma.relationshipDefinition.create({
     *   data: {
     *     // ... data to create a RelationshipDefinition
     *   }
     * })
     *
     */
    create<T extends RelationshipDefinitionCreateArgs>(args: Prisma.SelectSubset<T, RelationshipDefinitionCreateArgs<ExtArgs>>): Prisma.Prisma__RelationshipDefinitionClient<runtime.Types.Result.GetResult<Prisma.$RelationshipDefinitionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many RelationshipDefinitions.
     * @param {RelationshipDefinitionCreateManyArgs} args - Arguments to create many RelationshipDefinitions.
     * @example
     * // Create many RelationshipDefinitions
     * const relationshipDefinition = await prisma.relationshipDefinition.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends RelationshipDefinitionCreateManyArgs>(args?: Prisma.SelectSubset<T, RelationshipDefinitionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many RelationshipDefinitions and returns the data saved in the database.
     * @param {RelationshipDefinitionCreateManyAndReturnArgs} args - Arguments to create many RelationshipDefinitions.
     * @example
     * // Create many RelationshipDefinitions
     * const relationshipDefinition = await prisma.relationshipDefinition.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many RelationshipDefinitions and only return the `id`
     * const relationshipDefinitionWithIdOnly = await prisma.relationshipDefinition.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends RelationshipDefinitionCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, RelationshipDefinitionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RelationshipDefinitionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a RelationshipDefinition.
     * @param {RelationshipDefinitionDeleteArgs} args - Arguments to delete one RelationshipDefinition.
     * @example
     * // Delete one RelationshipDefinition
     * const RelationshipDefinition = await prisma.relationshipDefinition.delete({
     *   where: {
     *     // ... filter to delete one RelationshipDefinition
     *   }
     * })
     *
     */
    delete<T extends RelationshipDefinitionDeleteArgs>(args: Prisma.SelectSubset<T, RelationshipDefinitionDeleteArgs<ExtArgs>>): Prisma.Prisma__RelationshipDefinitionClient<runtime.Types.Result.GetResult<Prisma.$RelationshipDefinitionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one RelationshipDefinition.
     * @param {RelationshipDefinitionUpdateArgs} args - Arguments to update one RelationshipDefinition.
     * @example
     * // Update one RelationshipDefinition
     * const relationshipDefinition = await prisma.relationshipDefinition.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends RelationshipDefinitionUpdateArgs>(args: Prisma.SelectSubset<T, RelationshipDefinitionUpdateArgs<ExtArgs>>): Prisma.Prisma__RelationshipDefinitionClient<runtime.Types.Result.GetResult<Prisma.$RelationshipDefinitionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more RelationshipDefinitions.
     * @param {RelationshipDefinitionDeleteManyArgs} args - Arguments to filter RelationshipDefinitions to delete.
     * @example
     * // Delete a few RelationshipDefinitions
     * const { count } = await prisma.relationshipDefinition.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends RelationshipDefinitionDeleteManyArgs>(args?: Prisma.SelectSubset<T, RelationshipDefinitionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more RelationshipDefinitions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RelationshipDefinitionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RelationshipDefinitions
     * const relationshipDefinition = await prisma.relationshipDefinition.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends RelationshipDefinitionUpdateManyArgs>(args: Prisma.SelectSubset<T, RelationshipDefinitionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more RelationshipDefinitions and returns the data updated in the database.
     * @param {RelationshipDefinitionUpdateManyAndReturnArgs} args - Arguments to update many RelationshipDefinitions.
     * @example
     * // Update many RelationshipDefinitions
     * const relationshipDefinition = await prisma.relationshipDefinition.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more RelationshipDefinitions and only return the `id`
     * const relationshipDefinitionWithIdOnly = await prisma.relationshipDefinition.updateManyAndReturn({
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
    updateManyAndReturn<T extends RelationshipDefinitionUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, RelationshipDefinitionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RelationshipDefinitionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one RelationshipDefinition.
     * @param {RelationshipDefinitionUpsertArgs} args - Arguments to update or create a RelationshipDefinition.
     * @example
     * // Update or create a RelationshipDefinition
     * const relationshipDefinition = await prisma.relationshipDefinition.upsert({
     *   create: {
     *     // ... data to create a RelationshipDefinition
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RelationshipDefinition we want to update
     *   }
     * })
     */
    upsert<T extends RelationshipDefinitionUpsertArgs>(args: Prisma.SelectSubset<T, RelationshipDefinitionUpsertArgs<ExtArgs>>): Prisma.Prisma__RelationshipDefinitionClient<runtime.Types.Result.GetResult<Prisma.$RelationshipDefinitionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of RelationshipDefinitions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RelationshipDefinitionCountArgs} args - Arguments to filter RelationshipDefinitions to count.
     * @example
     * // Count the number of RelationshipDefinitions
     * const count = await prisma.relationshipDefinition.count({
     *   where: {
     *     // ... the filter for the RelationshipDefinitions we want to count
     *   }
     * })
    **/
    count<T extends RelationshipDefinitionCountArgs>(args?: Prisma.Subset<T, RelationshipDefinitionCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], RelationshipDefinitionCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a RelationshipDefinition.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RelationshipDefinitionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends RelationshipDefinitionAggregateArgs>(args: Prisma.Subset<T, RelationshipDefinitionAggregateArgs>): Prisma.PrismaPromise<GetRelationshipDefinitionAggregateType<T>>;
    /**
     * Group by RelationshipDefinition.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RelationshipDefinitionGroupByArgs} args - Group by arguments.
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
    groupBy<T extends RelationshipDefinitionGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: RelationshipDefinitionGroupByArgs['orderBy'];
    } : {
        orderBy?: RelationshipDefinitionGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, RelationshipDefinitionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRelationshipDefinitionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the RelationshipDefinition model
     */
    readonly fields: RelationshipDefinitionFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for RelationshipDefinition.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__RelationshipDefinitionClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    sourceEntityType<T extends Prisma.EntityTypeDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.EntityTypeDefaultArgs<ExtArgs>>): Prisma.Prisma__EntityTypeClient<runtime.Types.Result.GetResult<Prisma.$EntityTypePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    targetEntityType<T extends Prisma.EntityTypeDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.EntityTypeDefaultArgs<ExtArgs>>): Prisma.Prisma__EntityTypeClient<runtime.Types.Result.GetResult<Prisma.$EntityTypePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    instances<T extends Prisma.RelationshipDefinition$instancesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.RelationshipDefinition$instancesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RelationshipInstancePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
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
 * Fields of the RelationshipDefinition model
 */
export interface RelationshipDefinitionFieldRefs {
    readonly id: Prisma.FieldRef<"RelationshipDefinition", 'String'>;
    readonly name: Prisma.FieldRef<"RelationshipDefinition", 'String'>;
    readonly createdAt: Prisma.FieldRef<"RelationshipDefinition", 'DateTime'>;
    readonly sourceEntityTypeId: Prisma.FieldRef<"RelationshipDefinition", 'String'>;
    readonly targetEntityTypeId: Prisma.FieldRef<"RelationshipDefinition", 'String'>;
}
/**
 * RelationshipDefinition findUnique
 */
export type RelationshipDefinitionFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RelationshipDefinition
     */
    select?: Prisma.RelationshipDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RelationshipDefinition
     */
    omit?: Prisma.RelationshipDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RelationshipDefinitionInclude<ExtArgs> | null;
    /**
     * Filter, which RelationshipDefinition to fetch.
     */
    where: Prisma.RelationshipDefinitionWhereUniqueInput;
};
/**
 * RelationshipDefinition findUniqueOrThrow
 */
export type RelationshipDefinitionFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RelationshipDefinition
     */
    select?: Prisma.RelationshipDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RelationshipDefinition
     */
    omit?: Prisma.RelationshipDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RelationshipDefinitionInclude<ExtArgs> | null;
    /**
     * Filter, which RelationshipDefinition to fetch.
     */
    where: Prisma.RelationshipDefinitionWhereUniqueInput;
};
/**
 * RelationshipDefinition findFirst
 */
export type RelationshipDefinitionFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RelationshipDefinition
     */
    select?: Prisma.RelationshipDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RelationshipDefinition
     */
    omit?: Prisma.RelationshipDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RelationshipDefinitionInclude<ExtArgs> | null;
    /**
     * Filter, which RelationshipDefinition to fetch.
     */
    where?: Prisma.RelationshipDefinitionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of RelationshipDefinitions to fetch.
     */
    orderBy?: Prisma.RelationshipDefinitionOrderByWithRelationInput | Prisma.RelationshipDefinitionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for RelationshipDefinitions.
     */
    cursor?: Prisma.RelationshipDefinitionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` RelationshipDefinitions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` RelationshipDefinitions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of RelationshipDefinitions.
     */
    distinct?: Prisma.RelationshipDefinitionScalarFieldEnum | Prisma.RelationshipDefinitionScalarFieldEnum[];
};
/**
 * RelationshipDefinition findFirstOrThrow
 */
export type RelationshipDefinitionFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RelationshipDefinition
     */
    select?: Prisma.RelationshipDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RelationshipDefinition
     */
    omit?: Prisma.RelationshipDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RelationshipDefinitionInclude<ExtArgs> | null;
    /**
     * Filter, which RelationshipDefinition to fetch.
     */
    where?: Prisma.RelationshipDefinitionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of RelationshipDefinitions to fetch.
     */
    orderBy?: Prisma.RelationshipDefinitionOrderByWithRelationInput | Prisma.RelationshipDefinitionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for RelationshipDefinitions.
     */
    cursor?: Prisma.RelationshipDefinitionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` RelationshipDefinitions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` RelationshipDefinitions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of RelationshipDefinitions.
     */
    distinct?: Prisma.RelationshipDefinitionScalarFieldEnum | Prisma.RelationshipDefinitionScalarFieldEnum[];
};
/**
 * RelationshipDefinition findMany
 */
export type RelationshipDefinitionFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RelationshipDefinition
     */
    select?: Prisma.RelationshipDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RelationshipDefinition
     */
    omit?: Prisma.RelationshipDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RelationshipDefinitionInclude<ExtArgs> | null;
    /**
     * Filter, which RelationshipDefinitions to fetch.
     */
    where?: Prisma.RelationshipDefinitionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of RelationshipDefinitions to fetch.
     */
    orderBy?: Prisma.RelationshipDefinitionOrderByWithRelationInput | Prisma.RelationshipDefinitionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing RelationshipDefinitions.
     */
    cursor?: Prisma.RelationshipDefinitionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` RelationshipDefinitions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` RelationshipDefinitions.
     */
    skip?: number;
    distinct?: Prisma.RelationshipDefinitionScalarFieldEnum | Prisma.RelationshipDefinitionScalarFieldEnum[];
};
/**
 * RelationshipDefinition create
 */
export type RelationshipDefinitionCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RelationshipDefinition
     */
    select?: Prisma.RelationshipDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RelationshipDefinition
     */
    omit?: Prisma.RelationshipDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RelationshipDefinitionInclude<ExtArgs> | null;
    /**
     * The data needed to create a RelationshipDefinition.
     */
    data: Prisma.XOR<Prisma.RelationshipDefinitionCreateInput, Prisma.RelationshipDefinitionUncheckedCreateInput>;
};
/**
 * RelationshipDefinition createMany
 */
export type RelationshipDefinitionCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many RelationshipDefinitions.
     */
    data: Prisma.RelationshipDefinitionCreateManyInput | Prisma.RelationshipDefinitionCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * RelationshipDefinition createManyAndReturn
 */
export type RelationshipDefinitionCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RelationshipDefinition
     */
    select?: Prisma.RelationshipDefinitionSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the RelationshipDefinition
     */
    omit?: Prisma.RelationshipDefinitionOmit<ExtArgs> | null;
    /**
     * The data used to create many RelationshipDefinitions.
     */
    data: Prisma.RelationshipDefinitionCreateManyInput | Prisma.RelationshipDefinitionCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RelationshipDefinitionIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * RelationshipDefinition update
 */
export type RelationshipDefinitionUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RelationshipDefinition
     */
    select?: Prisma.RelationshipDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RelationshipDefinition
     */
    omit?: Prisma.RelationshipDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RelationshipDefinitionInclude<ExtArgs> | null;
    /**
     * The data needed to update a RelationshipDefinition.
     */
    data: Prisma.XOR<Prisma.RelationshipDefinitionUpdateInput, Prisma.RelationshipDefinitionUncheckedUpdateInput>;
    /**
     * Choose, which RelationshipDefinition to update.
     */
    where: Prisma.RelationshipDefinitionWhereUniqueInput;
};
/**
 * RelationshipDefinition updateMany
 */
export type RelationshipDefinitionUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update RelationshipDefinitions.
     */
    data: Prisma.XOR<Prisma.RelationshipDefinitionUpdateManyMutationInput, Prisma.RelationshipDefinitionUncheckedUpdateManyInput>;
    /**
     * Filter which RelationshipDefinitions to update
     */
    where?: Prisma.RelationshipDefinitionWhereInput;
    /**
     * Limit how many RelationshipDefinitions to update.
     */
    limit?: number;
};
/**
 * RelationshipDefinition updateManyAndReturn
 */
export type RelationshipDefinitionUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RelationshipDefinition
     */
    select?: Prisma.RelationshipDefinitionSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the RelationshipDefinition
     */
    omit?: Prisma.RelationshipDefinitionOmit<ExtArgs> | null;
    /**
     * The data used to update RelationshipDefinitions.
     */
    data: Prisma.XOR<Prisma.RelationshipDefinitionUpdateManyMutationInput, Prisma.RelationshipDefinitionUncheckedUpdateManyInput>;
    /**
     * Filter which RelationshipDefinitions to update
     */
    where?: Prisma.RelationshipDefinitionWhereInput;
    /**
     * Limit how many RelationshipDefinitions to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RelationshipDefinitionIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * RelationshipDefinition upsert
 */
export type RelationshipDefinitionUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RelationshipDefinition
     */
    select?: Prisma.RelationshipDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RelationshipDefinition
     */
    omit?: Prisma.RelationshipDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RelationshipDefinitionInclude<ExtArgs> | null;
    /**
     * The filter to search for the RelationshipDefinition to update in case it exists.
     */
    where: Prisma.RelationshipDefinitionWhereUniqueInput;
    /**
     * In case the RelationshipDefinition found by the `where` argument doesn't exist, create a new RelationshipDefinition with this data.
     */
    create: Prisma.XOR<Prisma.RelationshipDefinitionCreateInput, Prisma.RelationshipDefinitionUncheckedCreateInput>;
    /**
     * In case the RelationshipDefinition was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.RelationshipDefinitionUpdateInput, Prisma.RelationshipDefinitionUncheckedUpdateInput>;
};
/**
 * RelationshipDefinition delete
 */
export type RelationshipDefinitionDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RelationshipDefinition
     */
    select?: Prisma.RelationshipDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RelationshipDefinition
     */
    omit?: Prisma.RelationshipDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RelationshipDefinitionInclude<ExtArgs> | null;
    /**
     * Filter which RelationshipDefinition to delete.
     */
    where: Prisma.RelationshipDefinitionWhereUniqueInput;
};
/**
 * RelationshipDefinition deleteMany
 */
export type RelationshipDefinitionDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which RelationshipDefinitions to delete
     */
    where?: Prisma.RelationshipDefinitionWhereInput;
    /**
     * Limit how many RelationshipDefinitions to delete.
     */
    limit?: number;
};
/**
 * RelationshipDefinition.instances
 */
export type RelationshipDefinition$instancesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    where?: Prisma.RelationshipInstanceWhereInput;
    orderBy?: Prisma.RelationshipInstanceOrderByWithRelationInput | Prisma.RelationshipInstanceOrderByWithRelationInput[];
    cursor?: Prisma.RelationshipInstanceWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RelationshipInstanceScalarFieldEnum | Prisma.RelationshipInstanceScalarFieldEnum[];
};
/**
 * RelationshipDefinition without action
 */
export type RelationshipDefinitionDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RelationshipDefinition
     */
    select?: Prisma.RelationshipDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RelationshipDefinition
     */
    omit?: Prisma.RelationshipDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RelationshipDefinitionInclude<ExtArgs> | null;
};
export {};
//# sourceMappingURL=RelationshipDefinition.d.ts.map