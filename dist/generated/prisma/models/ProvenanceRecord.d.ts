import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
/**
 * Model ProvenanceRecord
 *
 */
export type ProvenanceRecordModel = runtime.Types.Result.DefaultSelection<Prisma.$ProvenanceRecordPayload>;
export type AggregateProvenanceRecord = {
    _count: ProvenanceRecordCountAggregateOutputType | null;
    _min: ProvenanceRecordMinAggregateOutputType | null;
    _max: ProvenanceRecordMaxAggregateOutputType | null;
};
export type ProvenanceRecordMinAggregateOutputType = {
    id: string | null;
    entityInstanceId: string | null;
    attributeName: string | null;
    sourceSystem: string | null;
    sourceRecordId: string | null;
    sourceTimestamp: Date | null;
    ingestedAt: Date | null;
};
export type ProvenanceRecordMaxAggregateOutputType = {
    id: string | null;
    entityInstanceId: string | null;
    attributeName: string | null;
    sourceSystem: string | null;
    sourceRecordId: string | null;
    sourceTimestamp: Date | null;
    ingestedAt: Date | null;
};
export type ProvenanceRecordCountAggregateOutputType = {
    id: number;
    entityInstanceId: number;
    attributeName: number;
    sourceSystem: number;
    sourceRecordId: number;
    sourceTimestamp: number;
    ingestedAt: number;
    _all: number;
};
export type ProvenanceRecordMinAggregateInputType = {
    id?: true;
    entityInstanceId?: true;
    attributeName?: true;
    sourceSystem?: true;
    sourceRecordId?: true;
    sourceTimestamp?: true;
    ingestedAt?: true;
};
export type ProvenanceRecordMaxAggregateInputType = {
    id?: true;
    entityInstanceId?: true;
    attributeName?: true;
    sourceSystem?: true;
    sourceRecordId?: true;
    sourceTimestamp?: true;
    ingestedAt?: true;
};
export type ProvenanceRecordCountAggregateInputType = {
    id?: true;
    entityInstanceId?: true;
    attributeName?: true;
    sourceSystem?: true;
    sourceRecordId?: true;
    sourceTimestamp?: true;
    ingestedAt?: true;
    _all?: true;
};
export type ProvenanceRecordAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which ProvenanceRecord to aggregate.
     */
    where?: Prisma.ProvenanceRecordWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ProvenanceRecords to fetch.
     */
    orderBy?: Prisma.ProvenanceRecordOrderByWithRelationInput | Prisma.ProvenanceRecordOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.ProvenanceRecordWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ProvenanceRecords from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ProvenanceRecords.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned ProvenanceRecords
    **/
    _count?: true | ProvenanceRecordCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: ProvenanceRecordMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: ProvenanceRecordMaxAggregateInputType;
};
export type GetProvenanceRecordAggregateType<T extends ProvenanceRecordAggregateArgs> = {
    [P in keyof T & keyof AggregateProvenanceRecord]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateProvenanceRecord[P]> : Prisma.GetScalarType<T[P], AggregateProvenanceRecord[P]>;
};
export type ProvenanceRecordGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ProvenanceRecordWhereInput;
    orderBy?: Prisma.ProvenanceRecordOrderByWithAggregationInput | Prisma.ProvenanceRecordOrderByWithAggregationInput[];
    by: Prisma.ProvenanceRecordScalarFieldEnum[] | Prisma.ProvenanceRecordScalarFieldEnum;
    having?: Prisma.ProvenanceRecordScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ProvenanceRecordCountAggregateInputType | true;
    _min?: ProvenanceRecordMinAggregateInputType;
    _max?: ProvenanceRecordMaxAggregateInputType;
};
export type ProvenanceRecordGroupByOutputType = {
    id: string;
    entityInstanceId: string;
    attributeName: string | null;
    sourceSystem: string;
    sourceRecordId: string;
    sourceTimestamp: Date;
    ingestedAt: Date;
    _count: ProvenanceRecordCountAggregateOutputType | null;
    _min: ProvenanceRecordMinAggregateOutputType | null;
    _max: ProvenanceRecordMaxAggregateOutputType | null;
};
type GetProvenanceRecordGroupByPayload<T extends ProvenanceRecordGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ProvenanceRecordGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ProvenanceRecordGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ProvenanceRecordGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ProvenanceRecordGroupByOutputType[P]>;
}>>;
export type ProvenanceRecordWhereInput = {
    AND?: Prisma.ProvenanceRecordWhereInput | Prisma.ProvenanceRecordWhereInput[];
    OR?: Prisma.ProvenanceRecordWhereInput[];
    NOT?: Prisma.ProvenanceRecordWhereInput | Prisma.ProvenanceRecordWhereInput[];
    id?: Prisma.StringFilter<"ProvenanceRecord"> | string;
    entityInstanceId?: Prisma.StringFilter<"ProvenanceRecord"> | string;
    attributeName?: Prisma.StringNullableFilter<"ProvenanceRecord"> | string | null;
    sourceSystem?: Prisma.StringFilter<"ProvenanceRecord"> | string;
    sourceRecordId?: Prisma.StringFilter<"ProvenanceRecord"> | string;
    sourceTimestamp?: Prisma.DateTimeFilter<"ProvenanceRecord"> | Date | string;
    ingestedAt?: Prisma.DateTimeFilter<"ProvenanceRecord"> | Date | string;
    entityInstance?: Prisma.XOR<Prisma.EntityInstanceScalarRelationFilter, Prisma.EntityInstanceWhereInput>;
};
export type ProvenanceRecordOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    entityInstanceId?: Prisma.SortOrder;
    attributeName?: Prisma.SortOrderInput | Prisma.SortOrder;
    sourceSystem?: Prisma.SortOrder;
    sourceRecordId?: Prisma.SortOrder;
    sourceTimestamp?: Prisma.SortOrder;
    ingestedAt?: Prisma.SortOrder;
    entityInstance?: Prisma.EntityInstanceOrderByWithRelationInput;
};
export type ProvenanceRecordWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.ProvenanceRecordWhereInput | Prisma.ProvenanceRecordWhereInput[];
    OR?: Prisma.ProvenanceRecordWhereInput[];
    NOT?: Prisma.ProvenanceRecordWhereInput | Prisma.ProvenanceRecordWhereInput[];
    entityInstanceId?: Prisma.StringFilter<"ProvenanceRecord"> | string;
    attributeName?: Prisma.StringNullableFilter<"ProvenanceRecord"> | string | null;
    sourceSystem?: Prisma.StringFilter<"ProvenanceRecord"> | string;
    sourceRecordId?: Prisma.StringFilter<"ProvenanceRecord"> | string;
    sourceTimestamp?: Prisma.DateTimeFilter<"ProvenanceRecord"> | Date | string;
    ingestedAt?: Prisma.DateTimeFilter<"ProvenanceRecord"> | Date | string;
    entityInstance?: Prisma.XOR<Prisma.EntityInstanceScalarRelationFilter, Prisma.EntityInstanceWhereInput>;
}, "id">;
export type ProvenanceRecordOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    entityInstanceId?: Prisma.SortOrder;
    attributeName?: Prisma.SortOrderInput | Prisma.SortOrder;
    sourceSystem?: Prisma.SortOrder;
    sourceRecordId?: Prisma.SortOrder;
    sourceTimestamp?: Prisma.SortOrder;
    ingestedAt?: Prisma.SortOrder;
    _count?: Prisma.ProvenanceRecordCountOrderByAggregateInput;
    _max?: Prisma.ProvenanceRecordMaxOrderByAggregateInput;
    _min?: Prisma.ProvenanceRecordMinOrderByAggregateInput;
};
export type ProvenanceRecordScalarWhereWithAggregatesInput = {
    AND?: Prisma.ProvenanceRecordScalarWhereWithAggregatesInput | Prisma.ProvenanceRecordScalarWhereWithAggregatesInput[];
    OR?: Prisma.ProvenanceRecordScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ProvenanceRecordScalarWhereWithAggregatesInput | Prisma.ProvenanceRecordScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"ProvenanceRecord"> | string;
    entityInstanceId?: Prisma.StringWithAggregatesFilter<"ProvenanceRecord"> | string;
    attributeName?: Prisma.StringNullableWithAggregatesFilter<"ProvenanceRecord"> | string | null;
    sourceSystem?: Prisma.StringWithAggregatesFilter<"ProvenanceRecord"> | string;
    sourceRecordId?: Prisma.StringWithAggregatesFilter<"ProvenanceRecord"> | string;
    sourceTimestamp?: Prisma.DateTimeWithAggregatesFilter<"ProvenanceRecord"> | Date | string;
    ingestedAt?: Prisma.DateTimeWithAggregatesFilter<"ProvenanceRecord"> | Date | string;
};
export type ProvenanceRecordCreateInput = {
    id?: string;
    attributeName?: string | null;
    sourceSystem: string;
    sourceRecordId: string;
    sourceTimestamp: Date | string;
    ingestedAt?: Date | string;
    entityInstance: Prisma.EntityInstanceCreateNestedOneWithoutProvenanceRecordsInput;
};
export type ProvenanceRecordUncheckedCreateInput = {
    id?: string;
    entityInstanceId: string;
    attributeName?: string | null;
    sourceSystem: string;
    sourceRecordId: string;
    sourceTimestamp: Date | string;
    ingestedAt?: Date | string;
};
export type ProvenanceRecordUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    attributeName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    sourceSystem?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRecordId?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceTimestamp?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    ingestedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    entityInstance?: Prisma.EntityInstanceUpdateOneRequiredWithoutProvenanceRecordsNestedInput;
};
export type ProvenanceRecordUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    entityInstanceId?: Prisma.StringFieldUpdateOperationsInput | string;
    attributeName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    sourceSystem?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRecordId?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceTimestamp?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    ingestedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ProvenanceRecordCreateManyInput = {
    id?: string;
    entityInstanceId: string;
    attributeName?: string | null;
    sourceSystem: string;
    sourceRecordId: string;
    sourceTimestamp: Date | string;
    ingestedAt?: Date | string;
};
export type ProvenanceRecordUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    attributeName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    sourceSystem?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRecordId?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceTimestamp?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    ingestedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ProvenanceRecordUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    entityInstanceId?: Prisma.StringFieldUpdateOperationsInput | string;
    attributeName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    sourceSystem?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRecordId?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceTimestamp?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    ingestedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ProvenanceRecordListRelationFilter = {
    every?: Prisma.ProvenanceRecordWhereInput;
    some?: Prisma.ProvenanceRecordWhereInput;
    none?: Prisma.ProvenanceRecordWhereInput;
};
export type ProvenanceRecordOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ProvenanceRecordCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    entityInstanceId?: Prisma.SortOrder;
    attributeName?: Prisma.SortOrder;
    sourceSystem?: Prisma.SortOrder;
    sourceRecordId?: Prisma.SortOrder;
    sourceTimestamp?: Prisma.SortOrder;
    ingestedAt?: Prisma.SortOrder;
};
export type ProvenanceRecordMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    entityInstanceId?: Prisma.SortOrder;
    attributeName?: Prisma.SortOrder;
    sourceSystem?: Prisma.SortOrder;
    sourceRecordId?: Prisma.SortOrder;
    sourceTimestamp?: Prisma.SortOrder;
    ingestedAt?: Prisma.SortOrder;
};
export type ProvenanceRecordMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    entityInstanceId?: Prisma.SortOrder;
    attributeName?: Prisma.SortOrder;
    sourceSystem?: Prisma.SortOrder;
    sourceRecordId?: Prisma.SortOrder;
    sourceTimestamp?: Prisma.SortOrder;
    ingestedAt?: Prisma.SortOrder;
};
export type ProvenanceRecordCreateNestedManyWithoutEntityInstanceInput = {
    create?: Prisma.XOR<Prisma.ProvenanceRecordCreateWithoutEntityInstanceInput, Prisma.ProvenanceRecordUncheckedCreateWithoutEntityInstanceInput> | Prisma.ProvenanceRecordCreateWithoutEntityInstanceInput[] | Prisma.ProvenanceRecordUncheckedCreateWithoutEntityInstanceInput[];
    connectOrCreate?: Prisma.ProvenanceRecordCreateOrConnectWithoutEntityInstanceInput | Prisma.ProvenanceRecordCreateOrConnectWithoutEntityInstanceInput[];
    createMany?: Prisma.ProvenanceRecordCreateManyEntityInstanceInputEnvelope;
    connect?: Prisma.ProvenanceRecordWhereUniqueInput | Prisma.ProvenanceRecordWhereUniqueInput[];
};
export type ProvenanceRecordUncheckedCreateNestedManyWithoutEntityInstanceInput = {
    create?: Prisma.XOR<Prisma.ProvenanceRecordCreateWithoutEntityInstanceInput, Prisma.ProvenanceRecordUncheckedCreateWithoutEntityInstanceInput> | Prisma.ProvenanceRecordCreateWithoutEntityInstanceInput[] | Prisma.ProvenanceRecordUncheckedCreateWithoutEntityInstanceInput[];
    connectOrCreate?: Prisma.ProvenanceRecordCreateOrConnectWithoutEntityInstanceInput | Prisma.ProvenanceRecordCreateOrConnectWithoutEntityInstanceInput[];
    createMany?: Prisma.ProvenanceRecordCreateManyEntityInstanceInputEnvelope;
    connect?: Prisma.ProvenanceRecordWhereUniqueInput | Prisma.ProvenanceRecordWhereUniqueInput[];
};
export type ProvenanceRecordUpdateManyWithoutEntityInstanceNestedInput = {
    create?: Prisma.XOR<Prisma.ProvenanceRecordCreateWithoutEntityInstanceInput, Prisma.ProvenanceRecordUncheckedCreateWithoutEntityInstanceInput> | Prisma.ProvenanceRecordCreateWithoutEntityInstanceInput[] | Prisma.ProvenanceRecordUncheckedCreateWithoutEntityInstanceInput[];
    connectOrCreate?: Prisma.ProvenanceRecordCreateOrConnectWithoutEntityInstanceInput | Prisma.ProvenanceRecordCreateOrConnectWithoutEntityInstanceInput[];
    upsert?: Prisma.ProvenanceRecordUpsertWithWhereUniqueWithoutEntityInstanceInput | Prisma.ProvenanceRecordUpsertWithWhereUniqueWithoutEntityInstanceInput[];
    createMany?: Prisma.ProvenanceRecordCreateManyEntityInstanceInputEnvelope;
    set?: Prisma.ProvenanceRecordWhereUniqueInput | Prisma.ProvenanceRecordWhereUniqueInput[];
    disconnect?: Prisma.ProvenanceRecordWhereUniqueInput | Prisma.ProvenanceRecordWhereUniqueInput[];
    delete?: Prisma.ProvenanceRecordWhereUniqueInput | Prisma.ProvenanceRecordWhereUniqueInput[];
    connect?: Prisma.ProvenanceRecordWhereUniqueInput | Prisma.ProvenanceRecordWhereUniqueInput[];
    update?: Prisma.ProvenanceRecordUpdateWithWhereUniqueWithoutEntityInstanceInput | Prisma.ProvenanceRecordUpdateWithWhereUniqueWithoutEntityInstanceInput[];
    updateMany?: Prisma.ProvenanceRecordUpdateManyWithWhereWithoutEntityInstanceInput | Prisma.ProvenanceRecordUpdateManyWithWhereWithoutEntityInstanceInput[];
    deleteMany?: Prisma.ProvenanceRecordScalarWhereInput | Prisma.ProvenanceRecordScalarWhereInput[];
};
export type ProvenanceRecordUncheckedUpdateManyWithoutEntityInstanceNestedInput = {
    create?: Prisma.XOR<Prisma.ProvenanceRecordCreateWithoutEntityInstanceInput, Prisma.ProvenanceRecordUncheckedCreateWithoutEntityInstanceInput> | Prisma.ProvenanceRecordCreateWithoutEntityInstanceInput[] | Prisma.ProvenanceRecordUncheckedCreateWithoutEntityInstanceInput[];
    connectOrCreate?: Prisma.ProvenanceRecordCreateOrConnectWithoutEntityInstanceInput | Prisma.ProvenanceRecordCreateOrConnectWithoutEntityInstanceInput[];
    upsert?: Prisma.ProvenanceRecordUpsertWithWhereUniqueWithoutEntityInstanceInput | Prisma.ProvenanceRecordUpsertWithWhereUniqueWithoutEntityInstanceInput[];
    createMany?: Prisma.ProvenanceRecordCreateManyEntityInstanceInputEnvelope;
    set?: Prisma.ProvenanceRecordWhereUniqueInput | Prisma.ProvenanceRecordWhereUniqueInput[];
    disconnect?: Prisma.ProvenanceRecordWhereUniqueInput | Prisma.ProvenanceRecordWhereUniqueInput[];
    delete?: Prisma.ProvenanceRecordWhereUniqueInput | Prisma.ProvenanceRecordWhereUniqueInput[];
    connect?: Prisma.ProvenanceRecordWhereUniqueInput | Prisma.ProvenanceRecordWhereUniqueInput[];
    update?: Prisma.ProvenanceRecordUpdateWithWhereUniqueWithoutEntityInstanceInput | Prisma.ProvenanceRecordUpdateWithWhereUniqueWithoutEntityInstanceInput[];
    updateMany?: Prisma.ProvenanceRecordUpdateManyWithWhereWithoutEntityInstanceInput | Prisma.ProvenanceRecordUpdateManyWithWhereWithoutEntityInstanceInput[];
    deleteMany?: Prisma.ProvenanceRecordScalarWhereInput | Prisma.ProvenanceRecordScalarWhereInput[];
};
export type ProvenanceRecordCreateWithoutEntityInstanceInput = {
    id?: string;
    attributeName?: string | null;
    sourceSystem: string;
    sourceRecordId: string;
    sourceTimestamp: Date | string;
    ingestedAt?: Date | string;
};
export type ProvenanceRecordUncheckedCreateWithoutEntityInstanceInput = {
    id?: string;
    attributeName?: string | null;
    sourceSystem: string;
    sourceRecordId: string;
    sourceTimestamp: Date | string;
    ingestedAt?: Date | string;
};
export type ProvenanceRecordCreateOrConnectWithoutEntityInstanceInput = {
    where: Prisma.ProvenanceRecordWhereUniqueInput;
    create: Prisma.XOR<Prisma.ProvenanceRecordCreateWithoutEntityInstanceInput, Prisma.ProvenanceRecordUncheckedCreateWithoutEntityInstanceInput>;
};
export type ProvenanceRecordCreateManyEntityInstanceInputEnvelope = {
    data: Prisma.ProvenanceRecordCreateManyEntityInstanceInput | Prisma.ProvenanceRecordCreateManyEntityInstanceInput[];
    skipDuplicates?: boolean;
};
export type ProvenanceRecordUpsertWithWhereUniqueWithoutEntityInstanceInput = {
    where: Prisma.ProvenanceRecordWhereUniqueInput;
    update: Prisma.XOR<Prisma.ProvenanceRecordUpdateWithoutEntityInstanceInput, Prisma.ProvenanceRecordUncheckedUpdateWithoutEntityInstanceInput>;
    create: Prisma.XOR<Prisma.ProvenanceRecordCreateWithoutEntityInstanceInput, Prisma.ProvenanceRecordUncheckedCreateWithoutEntityInstanceInput>;
};
export type ProvenanceRecordUpdateWithWhereUniqueWithoutEntityInstanceInput = {
    where: Prisma.ProvenanceRecordWhereUniqueInput;
    data: Prisma.XOR<Prisma.ProvenanceRecordUpdateWithoutEntityInstanceInput, Prisma.ProvenanceRecordUncheckedUpdateWithoutEntityInstanceInput>;
};
export type ProvenanceRecordUpdateManyWithWhereWithoutEntityInstanceInput = {
    where: Prisma.ProvenanceRecordScalarWhereInput;
    data: Prisma.XOR<Prisma.ProvenanceRecordUpdateManyMutationInput, Prisma.ProvenanceRecordUncheckedUpdateManyWithoutEntityInstanceInput>;
};
export type ProvenanceRecordScalarWhereInput = {
    AND?: Prisma.ProvenanceRecordScalarWhereInput | Prisma.ProvenanceRecordScalarWhereInput[];
    OR?: Prisma.ProvenanceRecordScalarWhereInput[];
    NOT?: Prisma.ProvenanceRecordScalarWhereInput | Prisma.ProvenanceRecordScalarWhereInput[];
    id?: Prisma.StringFilter<"ProvenanceRecord"> | string;
    entityInstanceId?: Prisma.StringFilter<"ProvenanceRecord"> | string;
    attributeName?: Prisma.StringNullableFilter<"ProvenanceRecord"> | string | null;
    sourceSystem?: Prisma.StringFilter<"ProvenanceRecord"> | string;
    sourceRecordId?: Prisma.StringFilter<"ProvenanceRecord"> | string;
    sourceTimestamp?: Prisma.DateTimeFilter<"ProvenanceRecord"> | Date | string;
    ingestedAt?: Prisma.DateTimeFilter<"ProvenanceRecord"> | Date | string;
};
export type ProvenanceRecordCreateManyEntityInstanceInput = {
    id?: string;
    attributeName?: string | null;
    sourceSystem: string;
    sourceRecordId: string;
    sourceTimestamp: Date | string;
    ingestedAt?: Date | string;
};
export type ProvenanceRecordUpdateWithoutEntityInstanceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    attributeName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    sourceSystem?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRecordId?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceTimestamp?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    ingestedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ProvenanceRecordUncheckedUpdateWithoutEntityInstanceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    attributeName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    sourceSystem?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRecordId?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceTimestamp?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    ingestedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ProvenanceRecordUncheckedUpdateManyWithoutEntityInstanceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    attributeName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    sourceSystem?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRecordId?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceTimestamp?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    ingestedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ProvenanceRecordSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    entityInstanceId?: boolean;
    attributeName?: boolean;
    sourceSystem?: boolean;
    sourceRecordId?: boolean;
    sourceTimestamp?: boolean;
    ingestedAt?: boolean;
    entityInstance?: boolean | Prisma.EntityInstanceDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["provenanceRecord"]>;
export type ProvenanceRecordSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    entityInstanceId?: boolean;
    attributeName?: boolean;
    sourceSystem?: boolean;
    sourceRecordId?: boolean;
    sourceTimestamp?: boolean;
    ingestedAt?: boolean;
    entityInstance?: boolean | Prisma.EntityInstanceDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["provenanceRecord"]>;
export type ProvenanceRecordSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    entityInstanceId?: boolean;
    attributeName?: boolean;
    sourceSystem?: boolean;
    sourceRecordId?: boolean;
    sourceTimestamp?: boolean;
    ingestedAt?: boolean;
    entityInstance?: boolean | Prisma.EntityInstanceDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["provenanceRecord"]>;
export type ProvenanceRecordSelectScalar = {
    id?: boolean;
    entityInstanceId?: boolean;
    attributeName?: boolean;
    sourceSystem?: boolean;
    sourceRecordId?: boolean;
    sourceTimestamp?: boolean;
    ingestedAt?: boolean;
};
export type ProvenanceRecordOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "entityInstanceId" | "attributeName" | "sourceSystem" | "sourceRecordId" | "sourceTimestamp" | "ingestedAt", ExtArgs["result"]["provenanceRecord"]>;
export type ProvenanceRecordInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    entityInstance?: boolean | Prisma.EntityInstanceDefaultArgs<ExtArgs>;
};
export type ProvenanceRecordIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    entityInstance?: boolean | Prisma.EntityInstanceDefaultArgs<ExtArgs>;
};
export type ProvenanceRecordIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    entityInstance?: boolean | Prisma.EntityInstanceDefaultArgs<ExtArgs>;
};
export type $ProvenanceRecordPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ProvenanceRecord";
    objects: {
        entityInstance: Prisma.$EntityInstancePayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        entityInstanceId: string;
        attributeName: string | null;
        sourceSystem: string;
        sourceRecordId: string;
        sourceTimestamp: Date;
        ingestedAt: Date;
    }, ExtArgs["result"]["provenanceRecord"]>;
    composites: {};
};
export type ProvenanceRecordGetPayload<S extends boolean | null | undefined | ProvenanceRecordDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ProvenanceRecordPayload, S>;
export type ProvenanceRecordCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ProvenanceRecordFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ProvenanceRecordCountAggregateInputType | true;
};
export interface ProvenanceRecordDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ProvenanceRecord'];
        meta: {
            name: 'ProvenanceRecord';
        };
    };
    /**
     * Find zero or one ProvenanceRecord that matches the filter.
     * @param {ProvenanceRecordFindUniqueArgs} args - Arguments to find a ProvenanceRecord
     * @example
     * // Get one ProvenanceRecord
     * const provenanceRecord = await prisma.provenanceRecord.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProvenanceRecordFindUniqueArgs>(args: Prisma.SelectSubset<T, ProvenanceRecordFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ProvenanceRecordClient<runtime.Types.Result.GetResult<Prisma.$ProvenanceRecordPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one ProvenanceRecord that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ProvenanceRecordFindUniqueOrThrowArgs} args - Arguments to find a ProvenanceRecord
     * @example
     * // Get one ProvenanceRecord
     * const provenanceRecord = await prisma.provenanceRecord.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProvenanceRecordFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ProvenanceRecordFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ProvenanceRecordClient<runtime.Types.Result.GetResult<Prisma.$ProvenanceRecordPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first ProvenanceRecord that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProvenanceRecordFindFirstArgs} args - Arguments to find a ProvenanceRecord
     * @example
     * // Get one ProvenanceRecord
     * const provenanceRecord = await prisma.provenanceRecord.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProvenanceRecordFindFirstArgs>(args?: Prisma.SelectSubset<T, ProvenanceRecordFindFirstArgs<ExtArgs>>): Prisma.Prisma__ProvenanceRecordClient<runtime.Types.Result.GetResult<Prisma.$ProvenanceRecordPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first ProvenanceRecord that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProvenanceRecordFindFirstOrThrowArgs} args - Arguments to find a ProvenanceRecord
     * @example
     * // Get one ProvenanceRecord
     * const provenanceRecord = await prisma.provenanceRecord.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProvenanceRecordFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ProvenanceRecordFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ProvenanceRecordClient<runtime.Types.Result.GetResult<Prisma.$ProvenanceRecordPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more ProvenanceRecords that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProvenanceRecordFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ProvenanceRecords
     * const provenanceRecords = await prisma.provenanceRecord.findMany()
     *
     * // Get first 10 ProvenanceRecords
     * const provenanceRecords = await prisma.provenanceRecord.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const provenanceRecordWithIdOnly = await prisma.provenanceRecord.findMany({ select: { id: true } })
     *
     */
    findMany<T extends ProvenanceRecordFindManyArgs>(args?: Prisma.SelectSubset<T, ProvenanceRecordFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ProvenanceRecordPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a ProvenanceRecord.
     * @param {ProvenanceRecordCreateArgs} args - Arguments to create a ProvenanceRecord.
     * @example
     * // Create one ProvenanceRecord
     * const ProvenanceRecord = await prisma.provenanceRecord.create({
     *   data: {
     *     // ... data to create a ProvenanceRecord
     *   }
     * })
     *
     */
    create<T extends ProvenanceRecordCreateArgs>(args: Prisma.SelectSubset<T, ProvenanceRecordCreateArgs<ExtArgs>>): Prisma.Prisma__ProvenanceRecordClient<runtime.Types.Result.GetResult<Prisma.$ProvenanceRecordPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many ProvenanceRecords.
     * @param {ProvenanceRecordCreateManyArgs} args - Arguments to create many ProvenanceRecords.
     * @example
     * // Create many ProvenanceRecords
     * const provenanceRecord = await prisma.provenanceRecord.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends ProvenanceRecordCreateManyArgs>(args?: Prisma.SelectSubset<T, ProvenanceRecordCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many ProvenanceRecords and returns the data saved in the database.
     * @param {ProvenanceRecordCreateManyAndReturnArgs} args - Arguments to create many ProvenanceRecords.
     * @example
     * // Create many ProvenanceRecords
     * const provenanceRecord = await prisma.provenanceRecord.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many ProvenanceRecords and only return the `id`
     * const provenanceRecordWithIdOnly = await prisma.provenanceRecord.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends ProvenanceRecordCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ProvenanceRecordCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ProvenanceRecordPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a ProvenanceRecord.
     * @param {ProvenanceRecordDeleteArgs} args - Arguments to delete one ProvenanceRecord.
     * @example
     * // Delete one ProvenanceRecord
     * const ProvenanceRecord = await prisma.provenanceRecord.delete({
     *   where: {
     *     // ... filter to delete one ProvenanceRecord
     *   }
     * })
     *
     */
    delete<T extends ProvenanceRecordDeleteArgs>(args: Prisma.SelectSubset<T, ProvenanceRecordDeleteArgs<ExtArgs>>): Prisma.Prisma__ProvenanceRecordClient<runtime.Types.Result.GetResult<Prisma.$ProvenanceRecordPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one ProvenanceRecord.
     * @param {ProvenanceRecordUpdateArgs} args - Arguments to update one ProvenanceRecord.
     * @example
     * // Update one ProvenanceRecord
     * const provenanceRecord = await prisma.provenanceRecord.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends ProvenanceRecordUpdateArgs>(args: Prisma.SelectSubset<T, ProvenanceRecordUpdateArgs<ExtArgs>>): Prisma.Prisma__ProvenanceRecordClient<runtime.Types.Result.GetResult<Prisma.$ProvenanceRecordPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more ProvenanceRecords.
     * @param {ProvenanceRecordDeleteManyArgs} args - Arguments to filter ProvenanceRecords to delete.
     * @example
     * // Delete a few ProvenanceRecords
     * const { count } = await prisma.provenanceRecord.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends ProvenanceRecordDeleteManyArgs>(args?: Prisma.SelectSubset<T, ProvenanceRecordDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more ProvenanceRecords.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProvenanceRecordUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ProvenanceRecords
     * const provenanceRecord = await prisma.provenanceRecord.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends ProvenanceRecordUpdateManyArgs>(args: Prisma.SelectSubset<T, ProvenanceRecordUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more ProvenanceRecords and returns the data updated in the database.
     * @param {ProvenanceRecordUpdateManyAndReturnArgs} args - Arguments to update many ProvenanceRecords.
     * @example
     * // Update many ProvenanceRecords
     * const provenanceRecord = await prisma.provenanceRecord.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more ProvenanceRecords and only return the `id`
     * const provenanceRecordWithIdOnly = await prisma.provenanceRecord.updateManyAndReturn({
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
    updateManyAndReturn<T extends ProvenanceRecordUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ProvenanceRecordUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ProvenanceRecordPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one ProvenanceRecord.
     * @param {ProvenanceRecordUpsertArgs} args - Arguments to update or create a ProvenanceRecord.
     * @example
     * // Update or create a ProvenanceRecord
     * const provenanceRecord = await prisma.provenanceRecord.upsert({
     *   create: {
     *     // ... data to create a ProvenanceRecord
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ProvenanceRecord we want to update
     *   }
     * })
     */
    upsert<T extends ProvenanceRecordUpsertArgs>(args: Prisma.SelectSubset<T, ProvenanceRecordUpsertArgs<ExtArgs>>): Prisma.Prisma__ProvenanceRecordClient<runtime.Types.Result.GetResult<Prisma.$ProvenanceRecordPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of ProvenanceRecords.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProvenanceRecordCountArgs} args - Arguments to filter ProvenanceRecords to count.
     * @example
     * // Count the number of ProvenanceRecords
     * const count = await prisma.provenanceRecord.count({
     *   where: {
     *     // ... the filter for the ProvenanceRecords we want to count
     *   }
     * })
    **/
    count<T extends ProvenanceRecordCountArgs>(args?: Prisma.Subset<T, ProvenanceRecordCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ProvenanceRecordCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a ProvenanceRecord.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProvenanceRecordAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ProvenanceRecordAggregateArgs>(args: Prisma.Subset<T, ProvenanceRecordAggregateArgs>): Prisma.PrismaPromise<GetProvenanceRecordAggregateType<T>>;
    /**
     * Group by ProvenanceRecord.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProvenanceRecordGroupByArgs} args - Group by arguments.
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
    groupBy<T extends ProvenanceRecordGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ProvenanceRecordGroupByArgs['orderBy'];
    } : {
        orderBy?: ProvenanceRecordGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ProvenanceRecordGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProvenanceRecordGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the ProvenanceRecord model
     */
    readonly fields: ProvenanceRecordFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for ProvenanceRecord.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__ProvenanceRecordClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    entityInstance<T extends Prisma.EntityInstanceDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.EntityInstanceDefaultArgs<ExtArgs>>): Prisma.Prisma__EntityInstanceClient<runtime.Types.Result.GetResult<Prisma.$EntityInstancePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
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
 * Fields of the ProvenanceRecord model
 */
export interface ProvenanceRecordFieldRefs {
    readonly id: Prisma.FieldRef<"ProvenanceRecord", 'String'>;
    readonly entityInstanceId: Prisma.FieldRef<"ProvenanceRecord", 'String'>;
    readonly attributeName: Prisma.FieldRef<"ProvenanceRecord", 'String'>;
    readonly sourceSystem: Prisma.FieldRef<"ProvenanceRecord", 'String'>;
    readonly sourceRecordId: Prisma.FieldRef<"ProvenanceRecord", 'String'>;
    readonly sourceTimestamp: Prisma.FieldRef<"ProvenanceRecord", 'DateTime'>;
    readonly ingestedAt: Prisma.FieldRef<"ProvenanceRecord", 'DateTime'>;
}
/**
 * ProvenanceRecord findUnique
 */
export type ProvenanceRecordFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProvenanceRecord
     */
    select?: Prisma.ProvenanceRecordSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ProvenanceRecord
     */
    omit?: Prisma.ProvenanceRecordOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProvenanceRecordInclude<ExtArgs> | null;
    /**
     * Filter, which ProvenanceRecord to fetch.
     */
    where: Prisma.ProvenanceRecordWhereUniqueInput;
};
/**
 * ProvenanceRecord findUniqueOrThrow
 */
export type ProvenanceRecordFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProvenanceRecord
     */
    select?: Prisma.ProvenanceRecordSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ProvenanceRecord
     */
    omit?: Prisma.ProvenanceRecordOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProvenanceRecordInclude<ExtArgs> | null;
    /**
     * Filter, which ProvenanceRecord to fetch.
     */
    where: Prisma.ProvenanceRecordWhereUniqueInput;
};
/**
 * ProvenanceRecord findFirst
 */
export type ProvenanceRecordFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProvenanceRecord
     */
    select?: Prisma.ProvenanceRecordSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ProvenanceRecord
     */
    omit?: Prisma.ProvenanceRecordOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProvenanceRecordInclude<ExtArgs> | null;
    /**
     * Filter, which ProvenanceRecord to fetch.
     */
    where?: Prisma.ProvenanceRecordWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ProvenanceRecords to fetch.
     */
    orderBy?: Prisma.ProvenanceRecordOrderByWithRelationInput | Prisma.ProvenanceRecordOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ProvenanceRecords.
     */
    cursor?: Prisma.ProvenanceRecordWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ProvenanceRecords from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ProvenanceRecords.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ProvenanceRecords.
     */
    distinct?: Prisma.ProvenanceRecordScalarFieldEnum | Prisma.ProvenanceRecordScalarFieldEnum[];
};
/**
 * ProvenanceRecord findFirstOrThrow
 */
export type ProvenanceRecordFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProvenanceRecord
     */
    select?: Prisma.ProvenanceRecordSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ProvenanceRecord
     */
    omit?: Prisma.ProvenanceRecordOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProvenanceRecordInclude<ExtArgs> | null;
    /**
     * Filter, which ProvenanceRecord to fetch.
     */
    where?: Prisma.ProvenanceRecordWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ProvenanceRecords to fetch.
     */
    orderBy?: Prisma.ProvenanceRecordOrderByWithRelationInput | Prisma.ProvenanceRecordOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ProvenanceRecords.
     */
    cursor?: Prisma.ProvenanceRecordWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ProvenanceRecords from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ProvenanceRecords.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ProvenanceRecords.
     */
    distinct?: Prisma.ProvenanceRecordScalarFieldEnum | Prisma.ProvenanceRecordScalarFieldEnum[];
};
/**
 * ProvenanceRecord findMany
 */
export type ProvenanceRecordFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProvenanceRecord
     */
    select?: Prisma.ProvenanceRecordSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ProvenanceRecord
     */
    omit?: Prisma.ProvenanceRecordOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProvenanceRecordInclude<ExtArgs> | null;
    /**
     * Filter, which ProvenanceRecords to fetch.
     */
    where?: Prisma.ProvenanceRecordWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ProvenanceRecords to fetch.
     */
    orderBy?: Prisma.ProvenanceRecordOrderByWithRelationInput | Prisma.ProvenanceRecordOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing ProvenanceRecords.
     */
    cursor?: Prisma.ProvenanceRecordWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ProvenanceRecords from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ProvenanceRecords.
     */
    skip?: number;
    distinct?: Prisma.ProvenanceRecordScalarFieldEnum | Prisma.ProvenanceRecordScalarFieldEnum[];
};
/**
 * ProvenanceRecord create
 */
export type ProvenanceRecordCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProvenanceRecord
     */
    select?: Prisma.ProvenanceRecordSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ProvenanceRecord
     */
    omit?: Prisma.ProvenanceRecordOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProvenanceRecordInclude<ExtArgs> | null;
    /**
     * The data needed to create a ProvenanceRecord.
     */
    data: Prisma.XOR<Prisma.ProvenanceRecordCreateInput, Prisma.ProvenanceRecordUncheckedCreateInput>;
};
/**
 * ProvenanceRecord createMany
 */
export type ProvenanceRecordCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many ProvenanceRecords.
     */
    data: Prisma.ProvenanceRecordCreateManyInput | Prisma.ProvenanceRecordCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * ProvenanceRecord createManyAndReturn
 */
export type ProvenanceRecordCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProvenanceRecord
     */
    select?: Prisma.ProvenanceRecordSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the ProvenanceRecord
     */
    omit?: Prisma.ProvenanceRecordOmit<ExtArgs> | null;
    /**
     * The data used to create many ProvenanceRecords.
     */
    data: Prisma.ProvenanceRecordCreateManyInput | Prisma.ProvenanceRecordCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProvenanceRecordIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * ProvenanceRecord update
 */
export type ProvenanceRecordUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProvenanceRecord
     */
    select?: Prisma.ProvenanceRecordSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ProvenanceRecord
     */
    omit?: Prisma.ProvenanceRecordOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProvenanceRecordInclude<ExtArgs> | null;
    /**
     * The data needed to update a ProvenanceRecord.
     */
    data: Prisma.XOR<Prisma.ProvenanceRecordUpdateInput, Prisma.ProvenanceRecordUncheckedUpdateInput>;
    /**
     * Choose, which ProvenanceRecord to update.
     */
    where: Prisma.ProvenanceRecordWhereUniqueInput;
};
/**
 * ProvenanceRecord updateMany
 */
export type ProvenanceRecordUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update ProvenanceRecords.
     */
    data: Prisma.XOR<Prisma.ProvenanceRecordUpdateManyMutationInput, Prisma.ProvenanceRecordUncheckedUpdateManyInput>;
    /**
     * Filter which ProvenanceRecords to update
     */
    where?: Prisma.ProvenanceRecordWhereInput;
    /**
     * Limit how many ProvenanceRecords to update.
     */
    limit?: number;
};
/**
 * ProvenanceRecord updateManyAndReturn
 */
export type ProvenanceRecordUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProvenanceRecord
     */
    select?: Prisma.ProvenanceRecordSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the ProvenanceRecord
     */
    omit?: Prisma.ProvenanceRecordOmit<ExtArgs> | null;
    /**
     * The data used to update ProvenanceRecords.
     */
    data: Prisma.XOR<Prisma.ProvenanceRecordUpdateManyMutationInput, Prisma.ProvenanceRecordUncheckedUpdateManyInput>;
    /**
     * Filter which ProvenanceRecords to update
     */
    where?: Prisma.ProvenanceRecordWhereInput;
    /**
     * Limit how many ProvenanceRecords to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProvenanceRecordIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * ProvenanceRecord upsert
 */
export type ProvenanceRecordUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProvenanceRecord
     */
    select?: Prisma.ProvenanceRecordSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ProvenanceRecord
     */
    omit?: Prisma.ProvenanceRecordOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProvenanceRecordInclude<ExtArgs> | null;
    /**
     * The filter to search for the ProvenanceRecord to update in case it exists.
     */
    where: Prisma.ProvenanceRecordWhereUniqueInput;
    /**
     * In case the ProvenanceRecord found by the `where` argument doesn't exist, create a new ProvenanceRecord with this data.
     */
    create: Prisma.XOR<Prisma.ProvenanceRecordCreateInput, Prisma.ProvenanceRecordUncheckedCreateInput>;
    /**
     * In case the ProvenanceRecord was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.ProvenanceRecordUpdateInput, Prisma.ProvenanceRecordUncheckedUpdateInput>;
};
/**
 * ProvenanceRecord delete
 */
export type ProvenanceRecordDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProvenanceRecord
     */
    select?: Prisma.ProvenanceRecordSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ProvenanceRecord
     */
    omit?: Prisma.ProvenanceRecordOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProvenanceRecordInclude<ExtArgs> | null;
    /**
     * Filter which ProvenanceRecord to delete.
     */
    where: Prisma.ProvenanceRecordWhereUniqueInput;
};
/**
 * ProvenanceRecord deleteMany
 */
export type ProvenanceRecordDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which ProvenanceRecords to delete
     */
    where?: Prisma.ProvenanceRecordWhereInput;
    /**
     * Limit how many ProvenanceRecords to delete.
     */
    limit?: number;
};
/**
 * ProvenanceRecord without action
 */
export type ProvenanceRecordDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProvenanceRecord
     */
    select?: Prisma.ProvenanceRecordSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ProvenanceRecord
     */
    omit?: Prisma.ProvenanceRecordOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProvenanceRecordInclude<ExtArgs> | null;
};
export {};
//# sourceMappingURL=ProvenanceRecord.d.ts.map