import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
/**
 * Model CurrentEntityState
 *
 */
export type CurrentEntityStateModel = runtime.Types.Result.DefaultSelection<Prisma.$CurrentEntityStatePayload>;
export type AggregateCurrentEntityState = {
    _count: CurrentEntityStateCountAggregateOutputType | null;
    _min: CurrentEntityStateMinAggregateOutputType | null;
    _max: CurrentEntityStateMaxAggregateOutputType | null;
};
export type CurrentEntityStateMinAggregateOutputType = {
    logicalId: string | null;
    entityTypeId: string | null;
    updatedAt: Date | null;
};
export type CurrentEntityStateMaxAggregateOutputType = {
    logicalId: string | null;
    entityTypeId: string | null;
    updatedAt: Date | null;
};
export type CurrentEntityStateCountAggregateOutputType = {
    logicalId: number;
    entityTypeId: number;
    data: number;
    updatedAt: number;
    _all: number;
};
export type CurrentEntityStateMinAggregateInputType = {
    logicalId?: true;
    entityTypeId?: true;
    updatedAt?: true;
};
export type CurrentEntityStateMaxAggregateInputType = {
    logicalId?: true;
    entityTypeId?: true;
    updatedAt?: true;
};
export type CurrentEntityStateCountAggregateInputType = {
    logicalId?: true;
    entityTypeId?: true;
    data?: true;
    updatedAt?: true;
    _all?: true;
};
export type CurrentEntityStateAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which CurrentEntityState to aggregate.
     */
    where?: Prisma.CurrentEntityStateWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of CurrentEntityStates to fetch.
     */
    orderBy?: Prisma.CurrentEntityStateOrderByWithRelationInput | Prisma.CurrentEntityStateOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.CurrentEntityStateWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` CurrentEntityStates from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` CurrentEntityStates.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned CurrentEntityStates
    **/
    _count?: true | CurrentEntityStateCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: CurrentEntityStateMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: CurrentEntityStateMaxAggregateInputType;
};
export type GetCurrentEntityStateAggregateType<T extends CurrentEntityStateAggregateArgs> = {
    [P in keyof T & keyof AggregateCurrentEntityState]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateCurrentEntityState[P]> : Prisma.GetScalarType<T[P], AggregateCurrentEntityState[P]>;
};
export type CurrentEntityStateGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CurrentEntityStateWhereInput;
    orderBy?: Prisma.CurrentEntityStateOrderByWithAggregationInput | Prisma.CurrentEntityStateOrderByWithAggregationInput[];
    by: Prisma.CurrentEntityStateScalarFieldEnum[] | Prisma.CurrentEntityStateScalarFieldEnum;
    having?: Prisma.CurrentEntityStateScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: CurrentEntityStateCountAggregateInputType | true;
    _min?: CurrentEntityStateMinAggregateInputType;
    _max?: CurrentEntityStateMaxAggregateInputType;
};
export type CurrentEntityStateGroupByOutputType = {
    logicalId: string;
    entityTypeId: string;
    data: runtime.JsonValue;
    updatedAt: Date;
    _count: CurrentEntityStateCountAggregateOutputType | null;
    _min: CurrentEntityStateMinAggregateOutputType | null;
    _max: CurrentEntityStateMaxAggregateOutputType | null;
};
type GetCurrentEntityStateGroupByPayload<T extends CurrentEntityStateGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<CurrentEntityStateGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof CurrentEntityStateGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], CurrentEntityStateGroupByOutputType[P]> : Prisma.GetScalarType<T[P], CurrentEntityStateGroupByOutputType[P]>;
}>>;
export type CurrentEntityStateWhereInput = {
    AND?: Prisma.CurrentEntityStateWhereInput | Prisma.CurrentEntityStateWhereInput[];
    OR?: Prisma.CurrentEntityStateWhereInput[];
    NOT?: Prisma.CurrentEntityStateWhereInput | Prisma.CurrentEntityStateWhereInput[];
    logicalId?: Prisma.StringFilter<"CurrentEntityState"> | string;
    entityTypeId?: Prisma.StringFilter<"CurrentEntityState"> | string;
    data?: Prisma.JsonFilter<"CurrentEntityState">;
    updatedAt?: Prisma.DateTimeFilter<"CurrentEntityState"> | Date | string;
};
export type CurrentEntityStateOrderByWithRelationInput = {
    logicalId?: Prisma.SortOrder;
    entityTypeId?: Prisma.SortOrder;
    data?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type CurrentEntityStateWhereUniqueInput = Prisma.AtLeast<{
    logicalId?: string;
    AND?: Prisma.CurrentEntityStateWhereInput | Prisma.CurrentEntityStateWhereInput[];
    OR?: Prisma.CurrentEntityStateWhereInput[];
    NOT?: Prisma.CurrentEntityStateWhereInput | Prisma.CurrentEntityStateWhereInput[];
    entityTypeId?: Prisma.StringFilter<"CurrentEntityState"> | string;
    data?: Prisma.JsonFilter<"CurrentEntityState">;
    updatedAt?: Prisma.DateTimeFilter<"CurrentEntityState"> | Date | string;
}, "logicalId">;
export type CurrentEntityStateOrderByWithAggregationInput = {
    logicalId?: Prisma.SortOrder;
    entityTypeId?: Prisma.SortOrder;
    data?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.CurrentEntityStateCountOrderByAggregateInput;
    _max?: Prisma.CurrentEntityStateMaxOrderByAggregateInput;
    _min?: Prisma.CurrentEntityStateMinOrderByAggregateInput;
};
export type CurrentEntityStateScalarWhereWithAggregatesInput = {
    AND?: Prisma.CurrentEntityStateScalarWhereWithAggregatesInput | Prisma.CurrentEntityStateScalarWhereWithAggregatesInput[];
    OR?: Prisma.CurrentEntityStateScalarWhereWithAggregatesInput[];
    NOT?: Prisma.CurrentEntityStateScalarWhereWithAggregatesInput | Prisma.CurrentEntityStateScalarWhereWithAggregatesInput[];
    logicalId?: Prisma.StringWithAggregatesFilter<"CurrentEntityState"> | string;
    entityTypeId?: Prisma.StringWithAggregatesFilter<"CurrentEntityState"> | string;
    data?: Prisma.JsonWithAggregatesFilter<"CurrentEntityState">;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"CurrentEntityState"> | Date | string;
};
export type CurrentEntityStateCreateInput = {
    logicalId: string;
    entityTypeId: string;
    data: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    updatedAt: Date | string;
};
export type CurrentEntityStateUncheckedCreateInput = {
    logicalId: string;
    entityTypeId: string;
    data: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    updatedAt: Date | string;
};
export type CurrentEntityStateUpdateInput = {
    logicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    entityTypeId?: Prisma.StringFieldUpdateOperationsInput | string;
    data?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CurrentEntityStateUncheckedUpdateInput = {
    logicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    entityTypeId?: Prisma.StringFieldUpdateOperationsInput | string;
    data?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CurrentEntityStateCreateManyInput = {
    logicalId: string;
    entityTypeId: string;
    data: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    updatedAt: Date | string;
};
export type CurrentEntityStateUpdateManyMutationInput = {
    logicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    entityTypeId?: Prisma.StringFieldUpdateOperationsInput | string;
    data?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CurrentEntityStateUncheckedUpdateManyInput = {
    logicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    entityTypeId?: Prisma.StringFieldUpdateOperationsInput | string;
    data?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CurrentEntityStateCountOrderByAggregateInput = {
    logicalId?: Prisma.SortOrder;
    entityTypeId?: Prisma.SortOrder;
    data?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type CurrentEntityStateMaxOrderByAggregateInput = {
    logicalId?: Prisma.SortOrder;
    entityTypeId?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type CurrentEntityStateMinOrderByAggregateInput = {
    logicalId?: Prisma.SortOrder;
    entityTypeId?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type CurrentEntityStateSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    logicalId?: boolean;
    entityTypeId?: boolean;
    data?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["currentEntityState"]>;
export type CurrentEntityStateSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    logicalId?: boolean;
    entityTypeId?: boolean;
    data?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["currentEntityState"]>;
export type CurrentEntityStateSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    logicalId?: boolean;
    entityTypeId?: boolean;
    data?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["currentEntityState"]>;
export type CurrentEntityStateSelectScalar = {
    logicalId?: boolean;
    entityTypeId?: boolean;
    data?: boolean;
    updatedAt?: boolean;
};
export type CurrentEntityStateOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"logicalId" | "entityTypeId" | "data" | "updatedAt", ExtArgs["result"]["currentEntityState"]>;
export type $CurrentEntityStatePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "CurrentEntityState";
    objects: {};
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        logicalId: string;
        entityTypeId: string;
        data: runtime.JsonValue;
        updatedAt: Date;
    }, ExtArgs["result"]["currentEntityState"]>;
    composites: {};
};
export type CurrentEntityStateGetPayload<S extends boolean | null | undefined | CurrentEntityStateDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$CurrentEntityStatePayload, S>;
export type CurrentEntityStateCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<CurrentEntityStateFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: CurrentEntityStateCountAggregateInputType | true;
};
export interface CurrentEntityStateDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['CurrentEntityState'];
        meta: {
            name: 'CurrentEntityState';
        };
    };
    /**
     * Find zero or one CurrentEntityState that matches the filter.
     * @param {CurrentEntityStateFindUniqueArgs} args - Arguments to find a CurrentEntityState
     * @example
     * // Get one CurrentEntityState
     * const currentEntityState = await prisma.currentEntityState.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CurrentEntityStateFindUniqueArgs>(args: Prisma.SelectSubset<T, CurrentEntityStateFindUniqueArgs<ExtArgs>>): Prisma.Prisma__CurrentEntityStateClient<runtime.Types.Result.GetResult<Prisma.$CurrentEntityStatePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one CurrentEntityState that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CurrentEntityStateFindUniqueOrThrowArgs} args - Arguments to find a CurrentEntityState
     * @example
     * // Get one CurrentEntityState
     * const currentEntityState = await prisma.currentEntityState.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CurrentEntityStateFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, CurrentEntityStateFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__CurrentEntityStateClient<runtime.Types.Result.GetResult<Prisma.$CurrentEntityStatePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first CurrentEntityState that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CurrentEntityStateFindFirstArgs} args - Arguments to find a CurrentEntityState
     * @example
     * // Get one CurrentEntityState
     * const currentEntityState = await prisma.currentEntityState.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CurrentEntityStateFindFirstArgs>(args?: Prisma.SelectSubset<T, CurrentEntityStateFindFirstArgs<ExtArgs>>): Prisma.Prisma__CurrentEntityStateClient<runtime.Types.Result.GetResult<Prisma.$CurrentEntityStatePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first CurrentEntityState that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CurrentEntityStateFindFirstOrThrowArgs} args - Arguments to find a CurrentEntityState
     * @example
     * // Get one CurrentEntityState
     * const currentEntityState = await prisma.currentEntityState.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CurrentEntityStateFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, CurrentEntityStateFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__CurrentEntityStateClient<runtime.Types.Result.GetResult<Prisma.$CurrentEntityStatePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more CurrentEntityStates that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CurrentEntityStateFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CurrentEntityStates
     * const currentEntityStates = await prisma.currentEntityState.findMany()
     *
     * // Get first 10 CurrentEntityStates
     * const currentEntityStates = await prisma.currentEntityState.findMany({ take: 10 })
     *
     * // Only select the `logicalId`
     * const currentEntityStateWithLogicalIdOnly = await prisma.currentEntityState.findMany({ select: { logicalId: true } })
     *
     */
    findMany<T extends CurrentEntityStateFindManyArgs>(args?: Prisma.SelectSubset<T, CurrentEntityStateFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CurrentEntityStatePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a CurrentEntityState.
     * @param {CurrentEntityStateCreateArgs} args - Arguments to create a CurrentEntityState.
     * @example
     * // Create one CurrentEntityState
     * const CurrentEntityState = await prisma.currentEntityState.create({
     *   data: {
     *     // ... data to create a CurrentEntityState
     *   }
     * })
     *
     */
    create<T extends CurrentEntityStateCreateArgs>(args: Prisma.SelectSubset<T, CurrentEntityStateCreateArgs<ExtArgs>>): Prisma.Prisma__CurrentEntityStateClient<runtime.Types.Result.GetResult<Prisma.$CurrentEntityStatePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many CurrentEntityStates.
     * @param {CurrentEntityStateCreateManyArgs} args - Arguments to create many CurrentEntityStates.
     * @example
     * // Create many CurrentEntityStates
     * const currentEntityState = await prisma.currentEntityState.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends CurrentEntityStateCreateManyArgs>(args?: Prisma.SelectSubset<T, CurrentEntityStateCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many CurrentEntityStates and returns the data saved in the database.
     * @param {CurrentEntityStateCreateManyAndReturnArgs} args - Arguments to create many CurrentEntityStates.
     * @example
     * // Create many CurrentEntityStates
     * const currentEntityState = await prisma.currentEntityState.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many CurrentEntityStates and only return the `logicalId`
     * const currentEntityStateWithLogicalIdOnly = await prisma.currentEntityState.createManyAndReturn({
     *   select: { logicalId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends CurrentEntityStateCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, CurrentEntityStateCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CurrentEntityStatePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a CurrentEntityState.
     * @param {CurrentEntityStateDeleteArgs} args - Arguments to delete one CurrentEntityState.
     * @example
     * // Delete one CurrentEntityState
     * const CurrentEntityState = await prisma.currentEntityState.delete({
     *   where: {
     *     // ... filter to delete one CurrentEntityState
     *   }
     * })
     *
     */
    delete<T extends CurrentEntityStateDeleteArgs>(args: Prisma.SelectSubset<T, CurrentEntityStateDeleteArgs<ExtArgs>>): Prisma.Prisma__CurrentEntityStateClient<runtime.Types.Result.GetResult<Prisma.$CurrentEntityStatePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one CurrentEntityState.
     * @param {CurrentEntityStateUpdateArgs} args - Arguments to update one CurrentEntityState.
     * @example
     * // Update one CurrentEntityState
     * const currentEntityState = await prisma.currentEntityState.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends CurrentEntityStateUpdateArgs>(args: Prisma.SelectSubset<T, CurrentEntityStateUpdateArgs<ExtArgs>>): Prisma.Prisma__CurrentEntityStateClient<runtime.Types.Result.GetResult<Prisma.$CurrentEntityStatePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more CurrentEntityStates.
     * @param {CurrentEntityStateDeleteManyArgs} args - Arguments to filter CurrentEntityStates to delete.
     * @example
     * // Delete a few CurrentEntityStates
     * const { count } = await prisma.currentEntityState.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends CurrentEntityStateDeleteManyArgs>(args?: Prisma.SelectSubset<T, CurrentEntityStateDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more CurrentEntityStates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CurrentEntityStateUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CurrentEntityStates
     * const currentEntityState = await prisma.currentEntityState.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends CurrentEntityStateUpdateManyArgs>(args: Prisma.SelectSubset<T, CurrentEntityStateUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more CurrentEntityStates and returns the data updated in the database.
     * @param {CurrentEntityStateUpdateManyAndReturnArgs} args - Arguments to update many CurrentEntityStates.
     * @example
     * // Update many CurrentEntityStates
     * const currentEntityState = await prisma.currentEntityState.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more CurrentEntityStates and only return the `logicalId`
     * const currentEntityStateWithLogicalIdOnly = await prisma.currentEntityState.updateManyAndReturn({
     *   select: { logicalId: true },
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
    updateManyAndReturn<T extends CurrentEntityStateUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, CurrentEntityStateUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CurrentEntityStatePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one CurrentEntityState.
     * @param {CurrentEntityStateUpsertArgs} args - Arguments to update or create a CurrentEntityState.
     * @example
     * // Update or create a CurrentEntityState
     * const currentEntityState = await prisma.currentEntityState.upsert({
     *   create: {
     *     // ... data to create a CurrentEntityState
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CurrentEntityState we want to update
     *   }
     * })
     */
    upsert<T extends CurrentEntityStateUpsertArgs>(args: Prisma.SelectSubset<T, CurrentEntityStateUpsertArgs<ExtArgs>>): Prisma.Prisma__CurrentEntityStateClient<runtime.Types.Result.GetResult<Prisma.$CurrentEntityStatePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of CurrentEntityStates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CurrentEntityStateCountArgs} args - Arguments to filter CurrentEntityStates to count.
     * @example
     * // Count the number of CurrentEntityStates
     * const count = await prisma.currentEntityState.count({
     *   where: {
     *     // ... the filter for the CurrentEntityStates we want to count
     *   }
     * })
    **/
    count<T extends CurrentEntityStateCountArgs>(args?: Prisma.Subset<T, CurrentEntityStateCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], CurrentEntityStateCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a CurrentEntityState.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CurrentEntityStateAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends CurrentEntityStateAggregateArgs>(args: Prisma.Subset<T, CurrentEntityStateAggregateArgs>): Prisma.PrismaPromise<GetCurrentEntityStateAggregateType<T>>;
    /**
     * Group by CurrentEntityState.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CurrentEntityStateGroupByArgs} args - Group by arguments.
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
    groupBy<T extends CurrentEntityStateGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: CurrentEntityStateGroupByArgs['orderBy'];
    } : {
        orderBy?: CurrentEntityStateGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, CurrentEntityStateGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCurrentEntityStateGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the CurrentEntityState model
     */
    readonly fields: CurrentEntityStateFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for CurrentEntityState.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__CurrentEntityStateClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
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
 * Fields of the CurrentEntityState model
 */
export interface CurrentEntityStateFieldRefs {
    readonly logicalId: Prisma.FieldRef<"CurrentEntityState", 'String'>;
    readonly entityTypeId: Prisma.FieldRef<"CurrentEntityState", 'String'>;
    readonly data: Prisma.FieldRef<"CurrentEntityState", 'Json'>;
    readonly updatedAt: Prisma.FieldRef<"CurrentEntityState", 'DateTime'>;
}
/**
 * CurrentEntityState findUnique
 */
export type CurrentEntityStateFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CurrentEntityState
     */
    select?: Prisma.CurrentEntityStateSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CurrentEntityState
     */
    omit?: Prisma.CurrentEntityStateOmit<ExtArgs> | null;
    /**
     * Filter, which CurrentEntityState to fetch.
     */
    where: Prisma.CurrentEntityStateWhereUniqueInput;
};
/**
 * CurrentEntityState findUniqueOrThrow
 */
export type CurrentEntityStateFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CurrentEntityState
     */
    select?: Prisma.CurrentEntityStateSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CurrentEntityState
     */
    omit?: Prisma.CurrentEntityStateOmit<ExtArgs> | null;
    /**
     * Filter, which CurrentEntityState to fetch.
     */
    where: Prisma.CurrentEntityStateWhereUniqueInput;
};
/**
 * CurrentEntityState findFirst
 */
export type CurrentEntityStateFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CurrentEntityState
     */
    select?: Prisma.CurrentEntityStateSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CurrentEntityState
     */
    omit?: Prisma.CurrentEntityStateOmit<ExtArgs> | null;
    /**
     * Filter, which CurrentEntityState to fetch.
     */
    where?: Prisma.CurrentEntityStateWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of CurrentEntityStates to fetch.
     */
    orderBy?: Prisma.CurrentEntityStateOrderByWithRelationInput | Prisma.CurrentEntityStateOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for CurrentEntityStates.
     */
    cursor?: Prisma.CurrentEntityStateWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` CurrentEntityStates from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` CurrentEntityStates.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of CurrentEntityStates.
     */
    distinct?: Prisma.CurrentEntityStateScalarFieldEnum | Prisma.CurrentEntityStateScalarFieldEnum[];
};
/**
 * CurrentEntityState findFirstOrThrow
 */
export type CurrentEntityStateFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CurrentEntityState
     */
    select?: Prisma.CurrentEntityStateSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CurrentEntityState
     */
    omit?: Prisma.CurrentEntityStateOmit<ExtArgs> | null;
    /**
     * Filter, which CurrentEntityState to fetch.
     */
    where?: Prisma.CurrentEntityStateWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of CurrentEntityStates to fetch.
     */
    orderBy?: Prisma.CurrentEntityStateOrderByWithRelationInput | Prisma.CurrentEntityStateOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for CurrentEntityStates.
     */
    cursor?: Prisma.CurrentEntityStateWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` CurrentEntityStates from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` CurrentEntityStates.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of CurrentEntityStates.
     */
    distinct?: Prisma.CurrentEntityStateScalarFieldEnum | Prisma.CurrentEntityStateScalarFieldEnum[];
};
/**
 * CurrentEntityState findMany
 */
export type CurrentEntityStateFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CurrentEntityState
     */
    select?: Prisma.CurrentEntityStateSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CurrentEntityState
     */
    omit?: Prisma.CurrentEntityStateOmit<ExtArgs> | null;
    /**
     * Filter, which CurrentEntityStates to fetch.
     */
    where?: Prisma.CurrentEntityStateWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of CurrentEntityStates to fetch.
     */
    orderBy?: Prisma.CurrentEntityStateOrderByWithRelationInput | Prisma.CurrentEntityStateOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing CurrentEntityStates.
     */
    cursor?: Prisma.CurrentEntityStateWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` CurrentEntityStates from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` CurrentEntityStates.
     */
    skip?: number;
    distinct?: Prisma.CurrentEntityStateScalarFieldEnum | Prisma.CurrentEntityStateScalarFieldEnum[];
};
/**
 * CurrentEntityState create
 */
export type CurrentEntityStateCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CurrentEntityState
     */
    select?: Prisma.CurrentEntityStateSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CurrentEntityState
     */
    omit?: Prisma.CurrentEntityStateOmit<ExtArgs> | null;
    /**
     * The data needed to create a CurrentEntityState.
     */
    data: Prisma.XOR<Prisma.CurrentEntityStateCreateInput, Prisma.CurrentEntityStateUncheckedCreateInput>;
};
/**
 * CurrentEntityState createMany
 */
export type CurrentEntityStateCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many CurrentEntityStates.
     */
    data: Prisma.CurrentEntityStateCreateManyInput | Prisma.CurrentEntityStateCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * CurrentEntityState createManyAndReturn
 */
export type CurrentEntityStateCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CurrentEntityState
     */
    select?: Prisma.CurrentEntityStateSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the CurrentEntityState
     */
    omit?: Prisma.CurrentEntityStateOmit<ExtArgs> | null;
    /**
     * The data used to create many CurrentEntityStates.
     */
    data: Prisma.CurrentEntityStateCreateManyInput | Prisma.CurrentEntityStateCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * CurrentEntityState update
 */
export type CurrentEntityStateUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CurrentEntityState
     */
    select?: Prisma.CurrentEntityStateSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CurrentEntityState
     */
    omit?: Prisma.CurrentEntityStateOmit<ExtArgs> | null;
    /**
     * The data needed to update a CurrentEntityState.
     */
    data: Prisma.XOR<Prisma.CurrentEntityStateUpdateInput, Prisma.CurrentEntityStateUncheckedUpdateInput>;
    /**
     * Choose, which CurrentEntityState to update.
     */
    where: Prisma.CurrentEntityStateWhereUniqueInput;
};
/**
 * CurrentEntityState updateMany
 */
export type CurrentEntityStateUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update CurrentEntityStates.
     */
    data: Prisma.XOR<Prisma.CurrentEntityStateUpdateManyMutationInput, Prisma.CurrentEntityStateUncheckedUpdateManyInput>;
    /**
     * Filter which CurrentEntityStates to update
     */
    where?: Prisma.CurrentEntityStateWhereInput;
    /**
     * Limit how many CurrentEntityStates to update.
     */
    limit?: number;
};
/**
 * CurrentEntityState updateManyAndReturn
 */
export type CurrentEntityStateUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CurrentEntityState
     */
    select?: Prisma.CurrentEntityStateSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the CurrentEntityState
     */
    omit?: Prisma.CurrentEntityStateOmit<ExtArgs> | null;
    /**
     * The data used to update CurrentEntityStates.
     */
    data: Prisma.XOR<Prisma.CurrentEntityStateUpdateManyMutationInput, Prisma.CurrentEntityStateUncheckedUpdateManyInput>;
    /**
     * Filter which CurrentEntityStates to update
     */
    where?: Prisma.CurrentEntityStateWhereInput;
    /**
     * Limit how many CurrentEntityStates to update.
     */
    limit?: number;
};
/**
 * CurrentEntityState upsert
 */
export type CurrentEntityStateUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CurrentEntityState
     */
    select?: Prisma.CurrentEntityStateSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CurrentEntityState
     */
    omit?: Prisma.CurrentEntityStateOmit<ExtArgs> | null;
    /**
     * The filter to search for the CurrentEntityState to update in case it exists.
     */
    where: Prisma.CurrentEntityStateWhereUniqueInput;
    /**
     * In case the CurrentEntityState found by the `where` argument doesn't exist, create a new CurrentEntityState with this data.
     */
    create: Prisma.XOR<Prisma.CurrentEntityStateCreateInput, Prisma.CurrentEntityStateUncheckedCreateInput>;
    /**
     * In case the CurrentEntityState was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.CurrentEntityStateUpdateInput, Prisma.CurrentEntityStateUncheckedUpdateInput>;
};
/**
 * CurrentEntityState delete
 */
export type CurrentEntityStateDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CurrentEntityState
     */
    select?: Prisma.CurrentEntityStateSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CurrentEntityState
     */
    omit?: Prisma.CurrentEntityStateOmit<ExtArgs> | null;
    /**
     * Filter which CurrentEntityState to delete.
     */
    where: Prisma.CurrentEntityStateWhereUniqueInput;
};
/**
 * CurrentEntityState deleteMany
 */
export type CurrentEntityStateDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which CurrentEntityStates to delete
     */
    where?: Prisma.CurrentEntityStateWhereInput;
    /**
     * Limit how many CurrentEntityStates to delete.
     */
    limit?: number;
};
/**
 * CurrentEntityState without action
 */
export type CurrentEntityStateDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CurrentEntityState
     */
    select?: Prisma.CurrentEntityStateSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CurrentEntityState
     */
    omit?: Prisma.CurrentEntityStateOmit<ExtArgs> | null;
};
export {};
//# sourceMappingURL=CurrentEntityState.d.ts.map