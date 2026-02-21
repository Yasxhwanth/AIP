import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
/**
 * Model EntityInstance
 *
 */
export type EntityInstanceModel = runtime.Types.Result.DefaultSelection<Prisma.$EntityInstancePayload>;
export type AggregateEntityInstance = {
    _count: EntityInstanceCountAggregateOutputType | null;
    _avg: EntityInstanceAvgAggregateOutputType | null;
    _sum: EntityInstanceSumAggregateOutputType | null;
    _min: EntityInstanceMinAggregateOutputType | null;
    _max: EntityInstanceMaxAggregateOutputType | null;
};
export type EntityInstanceAvgAggregateOutputType = {
    entityVersion: number | null;
};
export type EntityInstanceSumAggregateOutputType = {
    entityVersion: number | null;
};
export type EntityInstanceMinAggregateOutputType = {
    id: string | null;
    entityTypeId: string | null;
    entityVersion: number | null;
    validFrom: Date | null;
    validTo: Date | null;
    transactionTime: Date | null;
};
export type EntityInstanceMaxAggregateOutputType = {
    id: string | null;
    entityTypeId: string | null;
    entityVersion: number | null;
    validFrom: Date | null;
    validTo: Date | null;
    transactionTime: Date | null;
};
export type EntityInstanceCountAggregateOutputType = {
    id: number;
    entityTypeId: number;
    entityVersion: number;
    data: number;
    validFrom: number;
    validTo: number;
    transactionTime: number;
    _all: number;
};
export type EntityInstanceAvgAggregateInputType = {
    entityVersion?: true;
};
export type EntityInstanceSumAggregateInputType = {
    entityVersion?: true;
};
export type EntityInstanceMinAggregateInputType = {
    id?: true;
    entityTypeId?: true;
    entityVersion?: true;
    validFrom?: true;
    validTo?: true;
    transactionTime?: true;
};
export type EntityInstanceMaxAggregateInputType = {
    id?: true;
    entityTypeId?: true;
    entityVersion?: true;
    validFrom?: true;
    validTo?: true;
    transactionTime?: true;
};
export type EntityInstanceCountAggregateInputType = {
    id?: true;
    entityTypeId?: true;
    entityVersion?: true;
    data?: true;
    validFrom?: true;
    validTo?: true;
    transactionTime?: true;
    _all?: true;
};
export type EntityInstanceAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which EntityInstance to aggregate.
     */
    where?: Prisma.EntityInstanceWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of EntityInstances to fetch.
     */
    orderBy?: Prisma.EntityInstanceOrderByWithRelationInput | Prisma.EntityInstanceOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.EntityInstanceWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` EntityInstances from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` EntityInstances.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned EntityInstances
    **/
    _count?: true | EntityInstanceCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: EntityInstanceAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: EntityInstanceSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: EntityInstanceMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: EntityInstanceMaxAggregateInputType;
};
export type GetEntityInstanceAggregateType<T extends EntityInstanceAggregateArgs> = {
    [P in keyof T & keyof AggregateEntityInstance]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateEntityInstance[P]> : Prisma.GetScalarType<T[P], AggregateEntityInstance[P]>;
};
export type EntityInstanceGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EntityInstanceWhereInput;
    orderBy?: Prisma.EntityInstanceOrderByWithAggregationInput | Prisma.EntityInstanceOrderByWithAggregationInput[];
    by: Prisma.EntityInstanceScalarFieldEnum[] | Prisma.EntityInstanceScalarFieldEnum;
    having?: Prisma.EntityInstanceScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: EntityInstanceCountAggregateInputType | true;
    _avg?: EntityInstanceAvgAggregateInputType;
    _sum?: EntityInstanceSumAggregateInputType;
    _min?: EntityInstanceMinAggregateInputType;
    _max?: EntityInstanceMaxAggregateInputType;
};
export type EntityInstanceGroupByOutputType = {
    id: string;
    entityTypeId: string;
    entityVersion: number;
    data: runtime.JsonValue;
    validFrom: Date;
    validTo: Date | null;
    transactionTime: Date;
    _count: EntityInstanceCountAggregateOutputType | null;
    _avg: EntityInstanceAvgAggregateOutputType | null;
    _sum: EntityInstanceSumAggregateOutputType | null;
    _min: EntityInstanceMinAggregateOutputType | null;
    _max: EntityInstanceMaxAggregateOutputType | null;
};
type GetEntityInstanceGroupByPayload<T extends EntityInstanceGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<EntityInstanceGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof EntityInstanceGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], EntityInstanceGroupByOutputType[P]> : Prisma.GetScalarType<T[P], EntityInstanceGroupByOutputType[P]>;
}>>;
export type EntityInstanceWhereInput = {
    AND?: Prisma.EntityInstanceWhereInput | Prisma.EntityInstanceWhereInput[];
    OR?: Prisma.EntityInstanceWhereInput[];
    NOT?: Prisma.EntityInstanceWhereInput | Prisma.EntityInstanceWhereInput[];
    id?: Prisma.StringFilter<"EntityInstance"> | string;
    entityTypeId?: Prisma.StringFilter<"EntityInstance"> | string;
    entityVersion?: Prisma.IntFilter<"EntityInstance"> | number;
    data?: Prisma.JsonFilter<"EntityInstance">;
    validFrom?: Prisma.DateTimeFilter<"EntityInstance"> | Date | string;
    validTo?: Prisma.DateTimeNullableFilter<"EntityInstance"> | Date | string | null;
    transactionTime?: Prisma.DateTimeFilter<"EntityInstance"> | Date | string;
    entityType?: Prisma.XOR<Prisma.EntityTypeScalarRelationFilter, Prisma.EntityTypeWhereInput>;
};
export type EntityInstanceOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    entityTypeId?: Prisma.SortOrder;
    entityVersion?: Prisma.SortOrder;
    data?: Prisma.SortOrder;
    validFrom?: Prisma.SortOrder;
    validTo?: Prisma.SortOrderInput | Prisma.SortOrder;
    transactionTime?: Prisma.SortOrder;
    entityType?: Prisma.EntityTypeOrderByWithRelationInput;
};
export type EntityInstanceWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.EntityInstanceWhereInput | Prisma.EntityInstanceWhereInput[];
    OR?: Prisma.EntityInstanceWhereInput[];
    NOT?: Prisma.EntityInstanceWhereInput | Prisma.EntityInstanceWhereInput[];
    entityTypeId?: Prisma.StringFilter<"EntityInstance"> | string;
    entityVersion?: Prisma.IntFilter<"EntityInstance"> | number;
    data?: Prisma.JsonFilter<"EntityInstance">;
    validFrom?: Prisma.DateTimeFilter<"EntityInstance"> | Date | string;
    validTo?: Prisma.DateTimeNullableFilter<"EntityInstance"> | Date | string | null;
    transactionTime?: Prisma.DateTimeFilter<"EntityInstance"> | Date | string;
    entityType?: Prisma.XOR<Prisma.EntityTypeScalarRelationFilter, Prisma.EntityTypeWhereInput>;
}, "id">;
export type EntityInstanceOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    entityTypeId?: Prisma.SortOrder;
    entityVersion?: Prisma.SortOrder;
    data?: Prisma.SortOrder;
    validFrom?: Prisma.SortOrder;
    validTo?: Prisma.SortOrderInput | Prisma.SortOrder;
    transactionTime?: Prisma.SortOrder;
    _count?: Prisma.EntityInstanceCountOrderByAggregateInput;
    _avg?: Prisma.EntityInstanceAvgOrderByAggregateInput;
    _max?: Prisma.EntityInstanceMaxOrderByAggregateInput;
    _min?: Prisma.EntityInstanceMinOrderByAggregateInput;
    _sum?: Prisma.EntityInstanceSumOrderByAggregateInput;
};
export type EntityInstanceScalarWhereWithAggregatesInput = {
    AND?: Prisma.EntityInstanceScalarWhereWithAggregatesInput | Prisma.EntityInstanceScalarWhereWithAggregatesInput[];
    OR?: Prisma.EntityInstanceScalarWhereWithAggregatesInput[];
    NOT?: Prisma.EntityInstanceScalarWhereWithAggregatesInput | Prisma.EntityInstanceScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"EntityInstance"> | string;
    entityTypeId?: Prisma.StringWithAggregatesFilter<"EntityInstance"> | string;
    entityVersion?: Prisma.IntWithAggregatesFilter<"EntityInstance"> | number;
    data?: Prisma.JsonWithAggregatesFilter<"EntityInstance">;
    validFrom?: Prisma.DateTimeWithAggregatesFilter<"EntityInstance"> | Date | string;
    validTo?: Prisma.DateTimeNullableWithAggregatesFilter<"EntityInstance"> | Date | string | null;
    transactionTime?: Prisma.DateTimeWithAggregatesFilter<"EntityInstance"> | Date | string;
};
export type EntityInstanceCreateInput = {
    id?: string;
    entityVersion: number;
    data: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    validFrom: Date | string;
    validTo?: Date | string | null;
    transactionTime?: Date | string;
    entityType: Prisma.EntityTypeCreateNestedOneWithoutInstancesInput;
};
export type EntityInstanceUncheckedCreateInput = {
    id?: string;
    entityTypeId: string;
    entityVersion: number;
    data: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    validFrom: Date | string;
    validTo?: Date | string | null;
    transactionTime?: Date | string;
};
export type EntityInstanceUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    entityVersion?: Prisma.IntFieldUpdateOperationsInput | number;
    data?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    validFrom?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    validTo?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    transactionTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    entityType?: Prisma.EntityTypeUpdateOneRequiredWithoutInstancesNestedInput;
};
export type EntityInstanceUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    entityTypeId?: Prisma.StringFieldUpdateOperationsInput | string;
    entityVersion?: Prisma.IntFieldUpdateOperationsInput | number;
    data?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    validFrom?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    validTo?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    transactionTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type EntityInstanceCreateManyInput = {
    id?: string;
    entityTypeId: string;
    entityVersion: number;
    data: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    validFrom: Date | string;
    validTo?: Date | string | null;
    transactionTime?: Date | string;
};
export type EntityInstanceUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    entityVersion?: Prisma.IntFieldUpdateOperationsInput | number;
    data?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    validFrom?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    validTo?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    transactionTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type EntityInstanceUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    entityTypeId?: Prisma.StringFieldUpdateOperationsInput | string;
    entityVersion?: Prisma.IntFieldUpdateOperationsInput | number;
    data?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    validFrom?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    validTo?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    transactionTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type EntityInstanceListRelationFilter = {
    every?: Prisma.EntityInstanceWhereInput;
    some?: Prisma.EntityInstanceWhereInput;
    none?: Prisma.EntityInstanceWhereInput;
};
export type EntityInstanceOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type EntityInstanceCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    entityTypeId?: Prisma.SortOrder;
    entityVersion?: Prisma.SortOrder;
    data?: Prisma.SortOrder;
    validFrom?: Prisma.SortOrder;
    validTo?: Prisma.SortOrder;
    transactionTime?: Prisma.SortOrder;
};
export type EntityInstanceAvgOrderByAggregateInput = {
    entityVersion?: Prisma.SortOrder;
};
export type EntityInstanceMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    entityTypeId?: Prisma.SortOrder;
    entityVersion?: Prisma.SortOrder;
    validFrom?: Prisma.SortOrder;
    validTo?: Prisma.SortOrder;
    transactionTime?: Prisma.SortOrder;
};
export type EntityInstanceMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    entityTypeId?: Prisma.SortOrder;
    entityVersion?: Prisma.SortOrder;
    validFrom?: Prisma.SortOrder;
    validTo?: Prisma.SortOrder;
    transactionTime?: Prisma.SortOrder;
};
export type EntityInstanceSumOrderByAggregateInput = {
    entityVersion?: Prisma.SortOrder;
};
export type EntityInstanceCreateNestedManyWithoutEntityTypeInput = {
    create?: Prisma.XOR<Prisma.EntityInstanceCreateWithoutEntityTypeInput, Prisma.EntityInstanceUncheckedCreateWithoutEntityTypeInput> | Prisma.EntityInstanceCreateWithoutEntityTypeInput[] | Prisma.EntityInstanceUncheckedCreateWithoutEntityTypeInput[];
    connectOrCreate?: Prisma.EntityInstanceCreateOrConnectWithoutEntityTypeInput | Prisma.EntityInstanceCreateOrConnectWithoutEntityTypeInput[];
    createMany?: Prisma.EntityInstanceCreateManyEntityTypeInputEnvelope;
    connect?: Prisma.EntityInstanceWhereUniqueInput | Prisma.EntityInstanceWhereUniqueInput[];
};
export type EntityInstanceUncheckedCreateNestedManyWithoutEntityTypeInput = {
    create?: Prisma.XOR<Prisma.EntityInstanceCreateWithoutEntityTypeInput, Prisma.EntityInstanceUncheckedCreateWithoutEntityTypeInput> | Prisma.EntityInstanceCreateWithoutEntityTypeInput[] | Prisma.EntityInstanceUncheckedCreateWithoutEntityTypeInput[];
    connectOrCreate?: Prisma.EntityInstanceCreateOrConnectWithoutEntityTypeInput | Prisma.EntityInstanceCreateOrConnectWithoutEntityTypeInput[];
    createMany?: Prisma.EntityInstanceCreateManyEntityTypeInputEnvelope;
    connect?: Prisma.EntityInstanceWhereUniqueInput | Prisma.EntityInstanceWhereUniqueInput[];
};
export type EntityInstanceUpdateManyWithoutEntityTypeNestedInput = {
    create?: Prisma.XOR<Prisma.EntityInstanceCreateWithoutEntityTypeInput, Prisma.EntityInstanceUncheckedCreateWithoutEntityTypeInput> | Prisma.EntityInstanceCreateWithoutEntityTypeInput[] | Prisma.EntityInstanceUncheckedCreateWithoutEntityTypeInput[];
    connectOrCreate?: Prisma.EntityInstanceCreateOrConnectWithoutEntityTypeInput | Prisma.EntityInstanceCreateOrConnectWithoutEntityTypeInput[];
    upsert?: Prisma.EntityInstanceUpsertWithWhereUniqueWithoutEntityTypeInput | Prisma.EntityInstanceUpsertWithWhereUniqueWithoutEntityTypeInput[];
    createMany?: Prisma.EntityInstanceCreateManyEntityTypeInputEnvelope;
    set?: Prisma.EntityInstanceWhereUniqueInput | Prisma.EntityInstanceWhereUniqueInput[];
    disconnect?: Prisma.EntityInstanceWhereUniqueInput | Prisma.EntityInstanceWhereUniqueInput[];
    delete?: Prisma.EntityInstanceWhereUniqueInput | Prisma.EntityInstanceWhereUniqueInput[];
    connect?: Prisma.EntityInstanceWhereUniqueInput | Prisma.EntityInstanceWhereUniqueInput[];
    update?: Prisma.EntityInstanceUpdateWithWhereUniqueWithoutEntityTypeInput | Prisma.EntityInstanceUpdateWithWhereUniqueWithoutEntityTypeInput[];
    updateMany?: Prisma.EntityInstanceUpdateManyWithWhereWithoutEntityTypeInput | Prisma.EntityInstanceUpdateManyWithWhereWithoutEntityTypeInput[];
    deleteMany?: Prisma.EntityInstanceScalarWhereInput | Prisma.EntityInstanceScalarWhereInput[];
};
export type EntityInstanceUncheckedUpdateManyWithoutEntityTypeNestedInput = {
    create?: Prisma.XOR<Prisma.EntityInstanceCreateWithoutEntityTypeInput, Prisma.EntityInstanceUncheckedCreateWithoutEntityTypeInput> | Prisma.EntityInstanceCreateWithoutEntityTypeInput[] | Prisma.EntityInstanceUncheckedCreateWithoutEntityTypeInput[];
    connectOrCreate?: Prisma.EntityInstanceCreateOrConnectWithoutEntityTypeInput | Prisma.EntityInstanceCreateOrConnectWithoutEntityTypeInput[];
    upsert?: Prisma.EntityInstanceUpsertWithWhereUniqueWithoutEntityTypeInput | Prisma.EntityInstanceUpsertWithWhereUniqueWithoutEntityTypeInput[];
    createMany?: Prisma.EntityInstanceCreateManyEntityTypeInputEnvelope;
    set?: Prisma.EntityInstanceWhereUniqueInput | Prisma.EntityInstanceWhereUniqueInput[];
    disconnect?: Prisma.EntityInstanceWhereUniqueInput | Prisma.EntityInstanceWhereUniqueInput[];
    delete?: Prisma.EntityInstanceWhereUniqueInput | Prisma.EntityInstanceWhereUniqueInput[];
    connect?: Prisma.EntityInstanceWhereUniqueInput | Prisma.EntityInstanceWhereUniqueInput[];
    update?: Prisma.EntityInstanceUpdateWithWhereUniqueWithoutEntityTypeInput | Prisma.EntityInstanceUpdateWithWhereUniqueWithoutEntityTypeInput[];
    updateMany?: Prisma.EntityInstanceUpdateManyWithWhereWithoutEntityTypeInput | Prisma.EntityInstanceUpdateManyWithWhereWithoutEntityTypeInput[];
    deleteMany?: Prisma.EntityInstanceScalarWhereInput | Prisma.EntityInstanceScalarWhereInput[];
};
export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null;
};
export type EntityInstanceCreateWithoutEntityTypeInput = {
    id?: string;
    entityVersion: number;
    data: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    validFrom: Date | string;
    validTo?: Date | string | null;
    transactionTime?: Date | string;
};
export type EntityInstanceUncheckedCreateWithoutEntityTypeInput = {
    id?: string;
    entityVersion: number;
    data: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    validFrom: Date | string;
    validTo?: Date | string | null;
    transactionTime?: Date | string;
};
export type EntityInstanceCreateOrConnectWithoutEntityTypeInput = {
    where: Prisma.EntityInstanceWhereUniqueInput;
    create: Prisma.XOR<Prisma.EntityInstanceCreateWithoutEntityTypeInput, Prisma.EntityInstanceUncheckedCreateWithoutEntityTypeInput>;
};
export type EntityInstanceCreateManyEntityTypeInputEnvelope = {
    data: Prisma.EntityInstanceCreateManyEntityTypeInput | Prisma.EntityInstanceCreateManyEntityTypeInput[];
    skipDuplicates?: boolean;
};
export type EntityInstanceUpsertWithWhereUniqueWithoutEntityTypeInput = {
    where: Prisma.EntityInstanceWhereUniqueInput;
    update: Prisma.XOR<Prisma.EntityInstanceUpdateWithoutEntityTypeInput, Prisma.EntityInstanceUncheckedUpdateWithoutEntityTypeInput>;
    create: Prisma.XOR<Prisma.EntityInstanceCreateWithoutEntityTypeInput, Prisma.EntityInstanceUncheckedCreateWithoutEntityTypeInput>;
};
export type EntityInstanceUpdateWithWhereUniqueWithoutEntityTypeInput = {
    where: Prisma.EntityInstanceWhereUniqueInput;
    data: Prisma.XOR<Prisma.EntityInstanceUpdateWithoutEntityTypeInput, Prisma.EntityInstanceUncheckedUpdateWithoutEntityTypeInput>;
};
export type EntityInstanceUpdateManyWithWhereWithoutEntityTypeInput = {
    where: Prisma.EntityInstanceScalarWhereInput;
    data: Prisma.XOR<Prisma.EntityInstanceUpdateManyMutationInput, Prisma.EntityInstanceUncheckedUpdateManyWithoutEntityTypeInput>;
};
export type EntityInstanceScalarWhereInput = {
    AND?: Prisma.EntityInstanceScalarWhereInput | Prisma.EntityInstanceScalarWhereInput[];
    OR?: Prisma.EntityInstanceScalarWhereInput[];
    NOT?: Prisma.EntityInstanceScalarWhereInput | Prisma.EntityInstanceScalarWhereInput[];
    id?: Prisma.StringFilter<"EntityInstance"> | string;
    entityTypeId?: Prisma.StringFilter<"EntityInstance"> | string;
    entityVersion?: Prisma.IntFilter<"EntityInstance"> | number;
    data?: Prisma.JsonFilter<"EntityInstance">;
    validFrom?: Prisma.DateTimeFilter<"EntityInstance"> | Date | string;
    validTo?: Prisma.DateTimeNullableFilter<"EntityInstance"> | Date | string | null;
    transactionTime?: Prisma.DateTimeFilter<"EntityInstance"> | Date | string;
};
export type EntityInstanceCreateManyEntityTypeInput = {
    id?: string;
    entityVersion: number;
    data: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    validFrom: Date | string;
    validTo?: Date | string | null;
    transactionTime?: Date | string;
};
export type EntityInstanceUpdateWithoutEntityTypeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    entityVersion?: Prisma.IntFieldUpdateOperationsInput | number;
    data?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    validFrom?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    validTo?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    transactionTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type EntityInstanceUncheckedUpdateWithoutEntityTypeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    entityVersion?: Prisma.IntFieldUpdateOperationsInput | number;
    data?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    validFrom?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    validTo?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    transactionTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type EntityInstanceUncheckedUpdateManyWithoutEntityTypeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    entityVersion?: Prisma.IntFieldUpdateOperationsInput | number;
    data?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    validFrom?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    validTo?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    transactionTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type EntityInstanceSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    entityTypeId?: boolean;
    entityVersion?: boolean;
    data?: boolean;
    validFrom?: boolean;
    validTo?: boolean;
    transactionTime?: boolean;
    entityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["entityInstance"]>;
export type EntityInstanceSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    entityTypeId?: boolean;
    entityVersion?: boolean;
    data?: boolean;
    validFrom?: boolean;
    validTo?: boolean;
    transactionTime?: boolean;
    entityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["entityInstance"]>;
export type EntityInstanceSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    entityTypeId?: boolean;
    entityVersion?: boolean;
    data?: boolean;
    validFrom?: boolean;
    validTo?: boolean;
    transactionTime?: boolean;
    entityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["entityInstance"]>;
export type EntityInstanceSelectScalar = {
    id?: boolean;
    entityTypeId?: boolean;
    entityVersion?: boolean;
    data?: boolean;
    validFrom?: boolean;
    validTo?: boolean;
    transactionTime?: boolean;
};
export type EntityInstanceOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "entityTypeId" | "entityVersion" | "data" | "validFrom" | "validTo" | "transactionTime", ExtArgs["result"]["entityInstance"]>;
export type EntityInstanceInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    entityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
};
export type EntityInstanceIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    entityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
};
export type EntityInstanceIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    entityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
};
export type $EntityInstancePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "EntityInstance";
    objects: {
        entityType: Prisma.$EntityTypePayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        entityTypeId: string;
        entityVersion: number;
        data: runtime.JsonValue;
        validFrom: Date;
        validTo: Date | null;
        transactionTime: Date;
    }, ExtArgs["result"]["entityInstance"]>;
    composites: {};
};
export type EntityInstanceGetPayload<S extends boolean | null | undefined | EntityInstanceDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$EntityInstancePayload, S>;
export type EntityInstanceCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<EntityInstanceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: EntityInstanceCountAggregateInputType | true;
};
export interface EntityInstanceDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['EntityInstance'];
        meta: {
            name: 'EntityInstance';
        };
    };
    /**
     * Find zero or one EntityInstance that matches the filter.
     * @param {EntityInstanceFindUniqueArgs} args - Arguments to find a EntityInstance
     * @example
     * // Get one EntityInstance
     * const entityInstance = await prisma.entityInstance.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EntityInstanceFindUniqueArgs>(args: Prisma.SelectSubset<T, EntityInstanceFindUniqueArgs<ExtArgs>>): Prisma.Prisma__EntityInstanceClient<runtime.Types.Result.GetResult<Prisma.$EntityInstancePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one EntityInstance that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {EntityInstanceFindUniqueOrThrowArgs} args - Arguments to find a EntityInstance
     * @example
     * // Get one EntityInstance
     * const entityInstance = await prisma.entityInstance.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EntityInstanceFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, EntityInstanceFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__EntityInstanceClient<runtime.Types.Result.GetResult<Prisma.$EntityInstancePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first EntityInstance that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EntityInstanceFindFirstArgs} args - Arguments to find a EntityInstance
     * @example
     * // Get one EntityInstance
     * const entityInstance = await prisma.entityInstance.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EntityInstanceFindFirstArgs>(args?: Prisma.SelectSubset<T, EntityInstanceFindFirstArgs<ExtArgs>>): Prisma.Prisma__EntityInstanceClient<runtime.Types.Result.GetResult<Prisma.$EntityInstancePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first EntityInstance that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EntityInstanceFindFirstOrThrowArgs} args - Arguments to find a EntityInstance
     * @example
     * // Get one EntityInstance
     * const entityInstance = await prisma.entityInstance.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EntityInstanceFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, EntityInstanceFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__EntityInstanceClient<runtime.Types.Result.GetResult<Prisma.$EntityInstancePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more EntityInstances that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EntityInstanceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all EntityInstances
     * const entityInstances = await prisma.entityInstance.findMany()
     *
     * // Get first 10 EntityInstances
     * const entityInstances = await prisma.entityInstance.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const entityInstanceWithIdOnly = await prisma.entityInstance.findMany({ select: { id: true } })
     *
     */
    findMany<T extends EntityInstanceFindManyArgs>(args?: Prisma.SelectSubset<T, EntityInstanceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EntityInstancePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a EntityInstance.
     * @param {EntityInstanceCreateArgs} args - Arguments to create a EntityInstance.
     * @example
     * // Create one EntityInstance
     * const EntityInstance = await prisma.entityInstance.create({
     *   data: {
     *     // ... data to create a EntityInstance
     *   }
     * })
     *
     */
    create<T extends EntityInstanceCreateArgs>(args: Prisma.SelectSubset<T, EntityInstanceCreateArgs<ExtArgs>>): Prisma.Prisma__EntityInstanceClient<runtime.Types.Result.GetResult<Prisma.$EntityInstancePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many EntityInstances.
     * @param {EntityInstanceCreateManyArgs} args - Arguments to create many EntityInstances.
     * @example
     * // Create many EntityInstances
     * const entityInstance = await prisma.entityInstance.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends EntityInstanceCreateManyArgs>(args?: Prisma.SelectSubset<T, EntityInstanceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many EntityInstances and returns the data saved in the database.
     * @param {EntityInstanceCreateManyAndReturnArgs} args - Arguments to create many EntityInstances.
     * @example
     * // Create many EntityInstances
     * const entityInstance = await prisma.entityInstance.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many EntityInstances and only return the `id`
     * const entityInstanceWithIdOnly = await prisma.entityInstance.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends EntityInstanceCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, EntityInstanceCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EntityInstancePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a EntityInstance.
     * @param {EntityInstanceDeleteArgs} args - Arguments to delete one EntityInstance.
     * @example
     * // Delete one EntityInstance
     * const EntityInstance = await prisma.entityInstance.delete({
     *   where: {
     *     // ... filter to delete one EntityInstance
     *   }
     * })
     *
     */
    delete<T extends EntityInstanceDeleteArgs>(args: Prisma.SelectSubset<T, EntityInstanceDeleteArgs<ExtArgs>>): Prisma.Prisma__EntityInstanceClient<runtime.Types.Result.GetResult<Prisma.$EntityInstancePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one EntityInstance.
     * @param {EntityInstanceUpdateArgs} args - Arguments to update one EntityInstance.
     * @example
     * // Update one EntityInstance
     * const entityInstance = await prisma.entityInstance.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends EntityInstanceUpdateArgs>(args: Prisma.SelectSubset<T, EntityInstanceUpdateArgs<ExtArgs>>): Prisma.Prisma__EntityInstanceClient<runtime.Types.Result.GetResult<Prisma.$EntityInstancePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more EntityInstances.
     * @param {EntityInstanceDeleteManyArgs} args - Arguments to filter EntityInstances to delete.
     * @example
     * // Delete a few EntityInstances
     * const { count } = await prisma.entityInstance.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends EntityInstanceDeleteManyArgs>(args?: Prisma.SelectSubset<T, EntityInstanceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more EntityInstances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EntityInstanceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many EntityInstances
     * const entityInstance = await prisma.entityInstance.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends EntityInstanceUpdateManyArgs>(args: Prisma.SelectSubset<T, EntityInstanceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more EntityInstances and returns the data updated in the database.
     * @param {EntityInstanceUpdateManyAndReturnArgs} args - Arguments to update many EntityInstances.
     * @example
     * // Update many EntityInstances
     * const entityInstance = await prisma.entityInstance.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more EntityInstances and only return the `id`
     * const entityInstanceWithIdOnly = await prisma.entityInstance.updateManyAndReturn({
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
    updateManyAndReturn<T extends EntityInstanceUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, EntityInstanceUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EntityInstancePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one EntityInstance.
     * @param {EntityInstanceUpsertArgs} args - Arguments to update or create a EntityInstance.
     * @example
     * // Update or create a EntityInstance
     * const entityInstance = await prisma.entityInstance.upsert({
     *   create: {
     *     // ... data to create a EntityInstance
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the EntityInstance we want to update
     *   }
     * })
     */
    upsert<T extends EntityInstanceUpsertArgs>(args: Prisma.SelectSubset<T, EntityInstanceUpsertArgs<ExtArgs>>): Prisma.Prisma__EntityInstanceClient<runtime.Types.Result.GetResult<Prisma.$EntityInstancePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of EntityInstances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EntityInstanceCountArgs} args - Arguments to filter EntityInstances to count.
     * @example
     * // Count the number of EntityInstances
     * const count = await prisma.entityInstance.count({
     *   where: {
     *     // ... the filter for the EntityInstances we want to count
     *   }
     * })
    **/
    count<T extends EntityInstanceCountArgs>(args?: Prisma.Subset<T, EntityInstanceCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], EntityInstanceCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a EntityInstance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EntityInstanceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends EntityInstanceAggregateArgs>(args: Prisma.Subset<T, EntityInstanceAggregateArgs>): Prisma.PrismaPromise<GetEntityInstanceAggregateType<T>>;
    /**
     * Group by EntityInstance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EntityInstanceGroupByArgs} args - Group by arguments.
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
    groupBy<T extends EntityInstanceGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: EntityInstanceGroupByArgs['orderBy'];
    } : {
        orderBy?: EntityInstanceGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, EntityInstanceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEntityInstanceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the EntityInstance model
     */
    readonly fields: EntityInstanceFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for EntityInstance.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__EntityInstanceClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
 * Fields of the EntityInstance model
 */
export interface EntityInstanceFieldRefs {
    readonly id: Prisma.FieldRef<"EntityInstance", 'String'>;
    readonly entityTypeId: Prisma.FieldRef<"EntityInstance", 'String'>;
    readonly entityVersion: Prisma.FieldRef<"EntityInstance", 'Int'>;
    readonly data: Prisma.FieldRef<"EntityInstance", 'Json'>;
    readonly validFrom: Prisma.FieldRef<"EntityInstance", 'DateTime'>;
    readonly validTo: Prisma.FieldRef<"EntityInstance", 'DateTime'>;
    readonly transactionTime: Prisma.FieldRef<"EntityInstance", 'DateTime'>;
}
/**
 * EntityInstance findUnique
 */
export type EntityInstanceFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntityInstance
     */
    select?: Prisma.EntityInstanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the EntityInstance
     */
    omit?: Prisma.EntityInstanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.EntityInstanceInclude<ExtArgs> | null;
    /**
     * Filter, which EntityInstance to fetch.
     */
    where: Prisma.EntityInstanceWhereUniqueInput;
};
/**
 * EntityInstance findUniqueOrThrow
 */
export type EntityInstanceFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntityInstance
     */
    select?: Prisma.EntityInstanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the EntityInstance
     */
    omit?: Prisma.EntityInstanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.EntityInstanceInclude<ExtArgs> | null;
    /**
     * Filter, which EntityInstance to fetch.
     */
    where: Prisma.EntityInstanceWhereUniqueInput;
};
/**
 * EntityInstance findFirst
 */
export type EntityInstanceFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntityInstance
     */
    select?: Prisma.EntityInstanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the EntityInstance
     */
    omit?: Prisma.EntityInstanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.EntityInstanceInclude<ExtArgs> | null;
    /**
     * Filter, which EntityInstance to fetch.
     */
    where?: Prisma.EntityInstanceWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of EntityInstances to fetch.
     */
    orderBy?: Prisma.EntityInstanceOrderByWithRelationInput | Prisma.EntityInstanceOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for EntityInstances.
     */
    cursor?: Prisma.EntityInstanceWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` EntityInstances from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` EntityInstances.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of EntityInstances.
     */
    distinct?: Prisma.EntityInstanceScalarFieldEnum | Prisma.EntityInstanceScalarFieldEnum[];
};
/**
 * EntityInstance findFirstOrThrow
 */
export type EntityInstanceFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntityInstance
     */
    select?: Prisma.EntityInstanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the EntityInstance
     */
    omit?: Prisma.EntityInstanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.EntityInstanceInclude<ExtArgs> | null;
    /**
     * Filter, which EntityInstance to fetch.
     */
    where?: Prisma.EntityInstanceWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of EntityInstances to fetch.
     */
    orderBy?: Prisma.EntityInstanceOrderByWithRelationInput | Prisma.EntityInstanceOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for EntityInstances.
     */
    cursor?: Prisma.EntityInstanceWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` EntityInstances from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` EntityInstances.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of EntityInstances.
     */
    distinct?: Prisma.EntityInstanceScalarFieldEnum | Prisma.EntityInstanceScalarFieldEnum[];
};
/**
 * EntityInstance findMany
 */
export type EntityInstanceFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntityInstance
     */
    select?: Prisma.EntityInstanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the EntityInstance
     */
    omit?: Prisma.EntityInstanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.EntityInstanceInclude<ExtArgs> | null;
    /**
     * Filter, which EntityInstances to fetch.
     */
    where?: Prisma.EntityInstanceWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of EntityInstances to fetch.
     */
    orderBy?: Prisma.EntityInstanceOrderByWithRelationInput | Prisma.EntityInstanceOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing EntityInstances.
     */
    cursor?: Prisma.EntityInstanceWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` EntityInstances from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` EntityInstances.
     */
    skip?: number;
    distinct?: Prisma.EntityInstanceScalarFieldEnum | Prisma.EntityInstanceScalarFieldEnum[];
};
/**
 * EntityInstance create
 */
export type EntityInstanceCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntityInstance
     */
    select?: Prisma.EntityInstanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the EntityInstance
     */
    omit?: Prisma.EntityInstanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.EntityInstanceInclude<ExtArgs> | null;
    /**
     * The data needed to create a EntityInstance.
     */
    data: Prisma.XOR<Prisma.EntityInstanceCreateInput, Prisma.EntityInstanceUncheckedCreateInput>;
};
/**
 * EntityInstance createMany
 */
export type EntityInstanceCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many EntityInstances.
     */
    data: Prisma.EntityInstanceCreateManyInput | Prisma.EntityInstanceCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * EntityInstance createManyAndReturn
 */
export type EntityInstanceCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntityInstance
     */
    select?: Prisma.EntityInstanceSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the EntityInstance
     */
    omit?: Prisma.EntityInstanceOmit<ExtArgs> | null;
    /**
     * The data used to create many EntityInstances.
     */
    data: Prisma.EntityInstanceCreateManyInput | Prisma.EntityInstanceCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.EntityInstanceIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * EntityInstance update
 */
export type EntityInstanceUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntityInstance
     */
    select?: Prisma.EntityInstanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the EntityInstance
     */
    omit?: Prisma.EntityInstanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.EntityInstanceInclude<ExtArgs> | null;
    /**
     * The data needed to update a EntityInstance.
     */
    data: Prisma.XOR<Prisma.EntityInstanceUpdateInput, Prisma.EntityInstanceUncheckedUpdateInput>;
    /**
     * Choose, which EntityInstance to update.
     */
    where: Prisma.EntityInstanceWhereUniqueInput;
};
/**
 * EntityInstance updateMany
 */
export type EntityInstanceUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update EntityInstances.
     */
    data: Prisma.XOR<Prisma.EntityInstanceUpdateManyMutationInput, Prisma.EntityInstanceUncheckedUpdateManyInput>;
    /**
     * Filter which EntityInstances to update
     */
    where?: Prisma.EntityInstanceWhereInput;
    /**
     * Limit how many EntityInstances to update.
     */
    limit?: number;
};
/**
 * EntityInstance updateManyAndReturn
 */
export type EntityInstanceUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntityInstance
     */
    select?: Prisma.EntityInstanceSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the EntityInstance
     */
    omit?: Prisma.EntityInstanceOmit<ExtArgs> | null;
    /**
     * The data used to update EntityInstances.
     */
    data: Prisma.XOR<Prisma.EntityInstanceUpdateManyMutationInput, Prisma.EntityInstanceUncheckedUpdateManyInput>;
    /**
     * Filter which EntityInstances to update
     */
    where?: Prisma.EntityInstanceWhereInput;
    /**
     * Limit how many EntityInstances to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.EntityInstanceIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * EntityInstance upsert
 */
export type EntityInstanceUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntityInstance
     */
    select?: Prisma.EntityInstanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the EntityInstance
     */
    omit?: Prisma.EntityInstanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.EntityInstanceInclude<ExtArgs> | null;
    /**
     * The filter to search for the EntityInstance to update in case it exists.
     */
    where: Prisma.EntityInstanceWhereUniqueInput;
    /**
     * In case the EntityInstance found by the `where` argument doesn't exist, create a new EntityInstance with this data.
     */
    create: Prisma.XOR<Prisma.EntityInstanceCreateInput, Prisma.EntityInstanceUncheckedCreateInput>;
    /**
     * In case the EntityInstance was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.EntityInstanceUpdateInput, Prisma.EntityInstanceUncheckedUpdateInput>;
};
/**
 * EntityInstance delete
 */
export type EntityInstanceDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntityInstance
     */
    select?: Prisma.EntityInstanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the EntityInstance
     */
    omit?: Prisma.EntityInstanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.EntityInstanceInclude<ExtArgs> | null;
    /**
     * Filter which EntityInstance to delete.
     */
    where: Prisma.EntityInstanceWhereUniqueInput;
};
/**
 * EntityInstance deleteMany
 */
export type EntityInstanceDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which EntityInstances to delete
     */
    where?: Prisma.EntityInstanceWhereInput;
    /**
     * Limit how many EntityInstances to delete.
     */
    limit?: number;
};
/**
 * EntityInstance without action
 */
export type EntityInstanceDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntityInstance
     */
    select?: Prisma.EntityInstanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the EntityInstance
     */
    omit?: Prisma.EntityInstanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.EntityInstanceInclude<ExtArgs> | null;
};
export {};
//# sourceMappingURL=EntityInstance.d.ts.map