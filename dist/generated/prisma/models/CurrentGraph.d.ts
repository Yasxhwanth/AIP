import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
/**
 * Model CurrentGraph
 *
 */
export type CurrentGraphModel = runtime.Types.Result.DefaultSelection<Prisma.$CurrentGraphPayload>;
export type AggregateCurrentGraph = {
    _count: CurrentGraphCountAggregateOutputType | null;
    _min: CurrentGraphMinAggregateOutputType | null;
    _max: CurrentGraphMaxAggregateOutputType | null;
};
export type CurrentGraphMinAggregateOutputType = {
    id: string | null;
    relationshipDefinitionId: string | null;
    relationshipName: string | null;
    sourceLogicalId: string | null;
    targetLogicalId: string | null;
};
export type CurrentGraphMaxAggregateOutputType = {
    id: string | null;
    relationshipDefinitionId: string | null;
    relationshipName: string | null;
    sourceLogicalId: string | null;
    targetLogicalId: string | null;
};
export type CurrentGraphCountAggregateOutputType = {
    id: number;
    relationshipDefinitionId: number;
    relationshipName: number;
    sourceLogicalId: number;
    targetLogicalId: number;
    properties: number;
    _all: number;
};
export type CurrentGraphMinAggregateInputType = {
    id?: true;
    relationshipDefinitionId?: true;
    relationshipName?: true;
    sourceLogicalId?: true;
    targetLogicalId?: true;
};
export type CurrentGraphMaxAggregateInputType = {
    id?: true;
    relationshipDefinitionId?: true;
    relationshipName?: true;
    sourceLogicalId?: true;
    targetLogicalId?: true;
};
export type CurrentGraphCountAggregateInputType = {
    id?: true;
    relationshipDefinitionId?: true;
    relationshipName?: true;
    sourceLogicalId?: true;
    targetLogicalId?: true;
    properties?: true;
    _all?: true;
};
export type CurrentGraphAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which CurrentGraph to aggregate.
     */
    where?: Prisma.CurrentGraphWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of CurrentGraphs to fetch.
     */
    orderBy?: Prisma.CurrentGraphOrderByWithRelationInput | Prisma.CurrentGraphOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.CurrentGraphWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` CurrentGraphs from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` CurrentGraphs.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned CurrentGraphs
    **/
    _count?: true | CurrentGraphCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: CurrentGraphMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: CurrentGraphMaxAggregateInputType;
};
export type GetCurrentGraphAggregateType<T extends CurrentGraphAggregateArgs> = {
    [P in keyof T & keyof AggregateCurrentGraph]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateCurrentGraph[P]> : Prisma.GetScalarType<T[P], AggregateCurrentGraph[P]>;
};
export type CurrentGraphGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CurrentGraphWhereInput;
    orderBy?: Prisma.CurrentGraphOrderByWithAggregationInput | Prisma.CurrentGraphOrderByWithAggregationInput[];
    by: Prisma.CurrentGraphScalarFieldEnum[] | Prisma.CurrentGraphScalarFieldEnum;
    having?: Prisma.CurrentGraphScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: CurrentGraphCountAggregateInputType | true;
    _min?: CurrentGraphMinAggregateInputType;
    _max?: CurrentGraphMaxAggregateInputType;
};
export type CurrentGraphGroupByOutputType = {
    id: string;
    relationshipDefinitionId: string;
    relationshipName: string;
    sourceLogicalId: string;
    targetLogicalId: string;
    properties: runtime.JsonValue | null;
    _count: CurrentGraphCountAggregateOutputType | null;
    _min: CurrentGraphMinAggregateOutputType | null;
    _max: CurrentGraphMaxAggregateOutputType | null;
};
type GetCurrentGraphGroupByPayload<T extends CurrentGraphGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<CurrentGraphGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof CurrentGraphGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], CurrentGraphGroupByOutputType[P]> : Prisma.GetScalarType<T[P], CurrentGraphGroupByOutputType[P]>;
}>>;
export type CurrentGraphWhereInput = {
    AND?: Prisma.CurrentGraphWhereInput | Prisma.CurrentGraphWhereInput[];
    OR?: Prisma.CurrentGraphWhereInput[];
    NOT?: Prisma.CurrentGraphWhereInput | Prisma.CurrentGraphWhereInput[];
    id?: Prisma.StringFilter<"CurrentGraph"> | string;
    relationshipDefinitionId?: Prisma.StringFilter<"CurrentGraph"> | string;
    relationshipName?: Prisma.StringFilter<"CurrentGraph"> | string;
    sourceLogicalId?: Prisma.StringFilter<"CurrentGraph"> | string;
    targetLogicalId?: Prisma.StringFilter<"CurrentGraph"> | string;
    properties?: Prisma.JsonNullableFilter<"CurrentGraph">;
};
export type CurrentGraphOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    relationshipDefinitionId?: Prisma.SortOrder;
    relationshipName?: Prisma.SortOrder;
    sourceLogicalId?: Prisma.SortOrder;
    targetLogicalId?: Prisma.SortOrder;
    properties?: Prisma.SortOrderInput | Prisma.SortOrder;
};
export type CurrentGraphWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    relationshipDefinitionId_sourceLogicalId_targetLogicalId?: Prisma.CurrentGraphRelationshipDefinitionIdSourceLogicalIdTargetLogicalIdCompoundUniqueInput;
    AND?: Prisma.CurrentGraphWhereInput | Prisma.CurrentGraphWhereInput[];
    OR?: Prisma.CurrentGraphWhereInput[];
    NOT?: Prisma.CurrentGraphWhereInput | Prisma.CurrentGraphWhereInput[];
    relationshipDefinitionId?: Prisma.StringFilter<"CurrentGraph"> | string;
    relationshipName?: Prisma.StringFilter<"CurrentGraph"> | string;
    sourceLogicalId?: Prisma.StringFilter<"CurrentGraph"> | string;
    targetLogicalId?: Prisma.StringFilter<"CurrentGraph"> | string;
    properties?: Prisma.JsonNullableFilter<"CurrentGraph">;
}, "id" | "relationshipDefinitionId_sourceLogicalId_targetLogicalId">;
export type CurrentGraphOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    relationshipDefinitionId?: Prisma.SortOrder;
    relationshipName?: Prisma.SortOrder;
    sourceLogicalId?: Prisma.SortOrder;
    targetLogicalId?: Prisma.SortOrder;
    properties?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.CurrentGraphCountOrderByAggregateInput;
    _max?: Prisma.CurrentGraphMaxOrderByAggregateInput;
    _min?: Prisma.CurrentGraphMinOrderByAggregateInput;
};
export type CurrentGraphScalarWhereWithAggregatesInput = {
    AND?: Prisma.CurrentGraphScalarWhereWithAggregatesInput | Prisma.CurrentGraphScalarWhereWithAggregatesInput[];
    OR?: Prisma.CurrentGraphScalarWhereWithAggregatesInput[];
    NOT?: Prisma.CurrentGraphScalarWhereWithAggregatesInput | Prisma.CurrentGraphScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"CurrentGraph"> | string;
    relationshipDefinitionId?: Prisma.StringWithAggregatesFilter<"CurrentGraph"> | string;
    relationshipName?: Prisma.StringWithAggregatesFilter<"CurrentGraph"> | string;
    sourceLogicalId?: Prisma.StringWithAggregatesFilter<"CurrentGraph"> | string;
    targetLogicalId?: Prisma.StringWithAggregatesFilter<"CurrentGraph"> | string;
    properties?: Prisma.JsonNullableWithAggregatesFilter<"CurrentGraph">;
};
export type CurrentGraphCreateInput = {
    id?: string;
    relationshipDefinitionId: string;
    relationshipName: string;
    sourceLogicalId: string;
    targetLogicalId: string;
    properties?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
};
export type CurrentGraphUncheckedCreateInput = {
    id?: string;
    relationshipDefinitionId: string;
    relationshipName: string;
    sourceLogicalId: string;
    targetLogicalId: string;
    properties?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
};
export type CurrentGraphUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    relationshipDefinitionId?: Prisma.StringFieldUpdateOperationsInput | string;
    relationshipName?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceLogicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    targetLogicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    properties?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
};
export type CurrentGraphUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    relationshipDefinitionId?: Prisma.StringFieldUpdateOperationsInput | string;
    relationshipName?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceLogicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    targetLogicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    properties?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
};
export type CurrentGraphCreateManyInput = {
    id?: string;
    relationshipDefinitionId: string;
    relationshipName: string;
    sourceLogicalId: string;
    targetLogicalId: string;
    properties?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
};
export type CurrentGraphUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    relationshipDefinitionId?: Prisma.StringFieldUpdateOperationsInput | string;
    relationshipName?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceLogicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    targetLogicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    properties?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
};
export type CurrentGraphUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    relationshipDefinitionId?: Prisma.StringFieldUpdateOperationsInput | string;
    relationshipName?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceLogicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    targetLogicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    properties?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
};
export type CurrentGraphRelationshipDefinitionIdSourceLogicalIdTargetLogicalIdCompoundUniqueInput = {
    relationshipDefinitionId: string;
    sourceLogicalId: string;
    targetLogicalId: string;
};
export type CurrentGraphCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    relationshipDefinitionId?: Prisma.SortOrder;
    relationshipName?: Prisma.SortOrder;
    sourceLogicalId?: Prisma.SortOrder;
    targetLogicalId?: Prisma.SortOrder;
    properties?: Prisma.SortOrder;
};
export type CurrentGraphMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    relationshipDefinitionId?: Prisma.SortOrder;
    relationshipName?: Prisma.SortOrder;
    sourceLogicalId?: Prisma.SortOrder;
    targetLogicalId?: Prisma.SortOrder;
};
export type CurrentGraphMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    relationshipDefinitionId?: Prisma.SortOrder;
    relationshipName?: Prisma.SortOrder;
    sourceLogicalId?: Prisma.SortOrder;
    targetLogicalId?: Prisma.SortOrder;
};
export type CurrentGraphSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    relationshipDefinitionId?: boolean;
    relationshipName?: boolean;
    sourceLogicalId?: boolean;
    targetLogicalId?: boolean;
    properties?: boolean;
}, ExtArgs["result"]["currentGraph"]>;
export type CurrentGraphSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    relationshipDefinitionId?: boolean;
    relationshipName?: boolean;
    sourceLogicalId?: boolean;
    targetLogicalId?: boolean;
    properties?: boolean;
}, ExtArgs["result"]["currentGraph"]>;
export type CurrentGraphSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    relationshipDefinitionId?: boolean;
    relationshipName?: boolean;
    sourceLogicalId?: boolean;
    targetLogicalId?: boolean;
    properties?: boolean;
}, ExtArgs["result"]["currentGraph"]>;
export type CurrentGraphSelectScalar = {
    id?: boolean;
    relationshipDefinitionId?: boolean;
    relationshipName?: boolean;
    sourceLogicalId?: boolean;
    targetLogicalId?: boolean;
    properties?: boolean;
};
export type CurrentGraphOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "relationshipDefinitionId" | "relationshipName" | "sourceLogicalId" | "targetLogicalId" | "properties", ExtArgs["result"]["currentGraph"]>;
export type $CurrentGraphPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "CurrentGraph";
    objects: {};
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        relationshipDefinitionId: string;
        relationshipName: string;
        sourceLogicalId: string;
        targetLogicalId: string;
        properties: runtime.JsonValue | null;
    }, ExtArgs["result"]["currentGraph"]>;
    composites: {};
};
export type CurrentGraphGetPayload<S extends boolean | null | undefined | CurrentGraphDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$CurrentGraphPayload, S>;
export type CurrentGraphCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<CurrentGraphFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: CurrentGraphCountAggregateInputType | true;
};
export interface CurrentGraphDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['CurrentGraph'];
        meta: {
            name: 'CurrentGraph';
        };
    };
    /**
     * Find zero or one CurrentGraph that matches the filter.
     * @param {CurrentGraphFindUniqueArgs} args - Arguments to find a CurrentGraph
     * @example
     * // Get one CurrentGraph
     * const currentGraph = await prisma.currentGraph.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CurrentGraphFindUniqueArgs>(args: Prisma.SelectSubset<T, CurrentGraphFindUniqueArgs<ExtArgs>>): Prisma.Prisma__CurrentGraphClient<runtime.Types.Result.GetResult<Prisma.$CurrentGraphPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one CurrentGraph that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CurrentGraphFindUniqueOrThrowArgs} args - Arguments to find a CurrentGraph
     * @example
     * // Get one CurrentGraph
     * const currentGraph = await prisma.currentGraph.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CurrentGraphFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, CurrentGraphFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__CurrentGraphClient<runtime.Types.Result.GetResult<Prisma.$CurrentGraphPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first CurrentGraph that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CurrentGraphFindFirstArgs} args - Arguments to find a CurrentGraph
     * @example
     * // Get one CurrentGraph
     * const currentGraph = await prisma.currentGraph.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CurrentGraphFindFirstArgs>(args?: Prisma.SelectSubset<T, CurrentGraphFindFirstArgs<ExtArgs>>): Prisma.Prisma__CurrentGraphClient<runtime.Types.Result.GetResult<Prisma.$CurrentGraphPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first CurrentGraph that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CurrentGraphFindFirstOrThrowArgs} args - Arguments to find a CurrentGraph
     * @example
     * // Get one CurrentGraph
     * const currentGraph = await prisma.currentGraph.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CurrentGraphFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, CurrentGraphFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__CurrentGraphClient<runtime.Types.Result.GetResult<Prisma.$CurrentGraphPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more CurrentGraphs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CurrentGraphFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CurrentGraphs
     * const currentGraphs = await prisma.currentGraph.findMany()
     *
     * // Get first 10 CurrentGraphs
     * const currentGraphs = await prisma.currentGraph.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const currentGraphWithIdOnly = await prisma.currentGraph.findMany({ select: { id: true } })
     *
     */
    findMany<T extends CurrentGraphFindManyArgs>(args?: Prisma.SelectSubset<T, CurrentGraphFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CurrentGraphPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a CurrentGraph.
     * @param {CurrentGraphCreateArgs} args - Arguments to create a CurrentGraph.
     * @example
     * // Create one CurrentGraph
     * const CurrentGraph = await prisma.currentGraph.create({
     *   data: {
     *     // ... data to create a CurrentGraph
     *   }
     * })
     *
     */
    create<T extends CurrentGraphCreateArgs>(args: Prisma.SelectSubset<T, CurrentGraphCreateArgs<ExtArgs>>): Prisma.Prisma__CurrentGraphClient<runtime.Types.Result.GetResult<Prisma.$CurrentGraphPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many CurrentGraphs.
     * @param {CurrentGraphCreateManyArgs} args - Arguments to create many CurrentGraphs.
     * @example
     * // Create many CurrentGraphs
     * const currentGraph = await prisma.currentGraph.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends CurrentGraphCreateManyArgs>(args?: Prisma.SelectSubset<T, CurrentGraphCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many CurrentGraphs and returns the data saved in the database.
     * @param {CurrentGraphCreateManyAndReturnArgs} args - Arguments to create many CurrentGraphs.
     * @example
     * // Create many CurrentGraphs
     * const currentGraph = await prisma.currentGraph.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many CurrentGraphs and only return the `id`
     * const currentGraphWithIdOnly = await prisma.currentGraph.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends CurrentGraphCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, CurrentGraphCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CurrentGraphPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a CurrentGraph.
     * @param {CurrentGraphDeleteArgs} args - Arguments to delete one CurrentGraph.
     * @example
     * // Delete one CurrentGraph
     * const CurrentGraph = await prisma.currentGraph.delete({
     *   where: {
     *     // ... filter to delete one CurrentGraph
     *   }
     * })
     *
     */
    delete<T extends CurrentGraphDeleteArgs>(args: Prisma.SelectSubset<T, CurrentGraphDeleteArgs<ExtArgs>>): Prisma.Prisma__CurrentGraphClient<runtime.Types.Result.GetResult<Prisma.$CurrentGraphPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one CurrentGraph.
     * @param {CurrentGraphUpdateArgs} args - Arguments to update one CurrentGraph.
     * @example
     * // Update one CurrentGraph
     * const currentGraph = await prisma.currentGraph.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends CurrentGraphUpdateArgs>(args: Prisma.SelectSubset<T, CurrentGraphUpdateArgs<ExtArgs>>): Prisma.Prisma__CurrentGraphClient<runtime.Types.Result.GetResult<Prisma.$CurrentGraphPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more CurrentGraphs.
     * @param {CurrentGraphDeleteManyArgs} args - Arguments to filter CurrentGraphs to delete.
     * @example
     * // Delete a few CurrentGraphs
     * const { count } = await prisma.currentGraph.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends CurrentGraphDeleteManyArgs>(args?: Prisma.SelectSubset<T, CurrentGraphDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more CurrentGraphs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CurrentGraphUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CurrentGraphs
     * const currentGraph = await prisma.currentGraph.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends CurrentGraphUpdateManyArgs>(args: Prisma.SelectSubset<T, CurrentGraphUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more CurrentGraphs and returns the data updated in the database.
     * @param {CurrentGraphUpdateManyAndReturnArgs} args - Arguments to update many CurrentGraphs.
     * @example
     * // Update many CurrentGraphs
     * const currentGraph = await prisma.currentGraph.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more CurrentGraphs and only return the `id`
     * const currentGraphWithIdOnly = await prisma.currentGraph.updateManyAndReturn({
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
    updateManyAndReturn<T extends CurrentGraphUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, CurrentGraphUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CurrentGraphPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one CurrentGraph.
     * @param {CurrentGraphUpsertArgs} args - Arguments to update or create a CurrentGraph.
     * @example
     * // Update or create a CurrentGraph
     * const currentGraph = await prisma.currentGraph.upsert({
     *   create: {
     *     // ... data to create a CurrentGraph
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CurrentGraph we want to update
     *   }
     * })
     */
    upsert<T extends CurrentGraphUpsertArgs>(args: Prisma.SelectSubset<T, CurrentGraphUpsertArgs<ExtArgs>>): Prisma.Prisma__CurrentGraphClient<runtime.Types.Result.GetResult<Prisma.$CurrentGraphPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of CurrentGraphs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CurrentGraphCountArgs} args - Arguments to filter CurrentGraphs to count.
     * @example
     * // Count the number of CurrentGraphs
     * const count = await prisma.currentGraph.count({
     *   where: {
     *     // ... the filter for the CurrentGraphs we want to count
     *   }
     * })
    **/
    count<T extends CurrentGraphCountArgs>(args?: Prisma.Subset<T, CurrentGraphCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], CurrentGraphCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a CurrentGraph.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CurrentGraphAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends CurrentGraphAggregateArgs>(args: Prisma.Subset<T, CurrentGraphAggregateArgs>): Prisma.PrismaPromise<GetCurrentGraphAggregateType<T>>;
    /**
     * Group by CurrentGraph.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CurrentGraphGroupByArgs} args - Group by arguments.
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
    groupBy<T extends CurrentGraphGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: CurrentGraphGroupByArgs['orderBy'];
    } : {
        orderBy?: CurrentGraphGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, CurrentGraphGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCurrentGraphGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the CurrentGraph model
     */
    readonly fields: CurrentGraphFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for CurrentGraph.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__CurrentGraphClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
 * Fields of the CurrentGraph model
 */
export interface CurrentGraphFieldRefs {
    readonly id: Prisma.FieldRef<"CurrentGraph", 'String'>;
    readonly relationshipDefinitionId: Prisma.FieldRef<"CurrentGraph", 'String'>;
    readonly relationshipName: Prisma.FieldRef<"CurrentGraph", 'String'>;
    readonly sourceLogicalId: Prisma.FieldRef<"CurrentGraph", 'String'>;
    readonly targetLogicalId: Prisma.FieldRef<"CurrentGraph", 'String'>;
    readonly properties: Prisma.FieldRef<"CurrentGraph", 'Json'>;
}
/**
 * CurrentGraph findUnique
 */
export type CurrentGraphFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CurrentGraph
     */
    select?: Prisma.CurrentGraphSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CurrentGraph
     */
    omit?: Prisma.CurrentGraphOmit<ExtArgs> | null;
    /**
     * Filter, which CurrentGraph to fetch.
     */
    where: Prisma.CurrentGraphWhereUniqueInput;
};
/**
 * CurrentGraph findUniqueOrThrow
 */
export type CurrentGraphFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CurrentGraph
     */
    select?: Prisma.CurrentGraphSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CurrentGraph
     */
    omit?: Prisma.CurrentGraphOmit<ExtArgs> | null;
    /**
     * Filter, which CurrentGraph to fetch.
     */
    where: Prisma.CurrentGraphWhereUniqueInput;
};
/**
 * CurrentGraph findFirst
 */
export type CurrentGraphFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CurrentGraph
     */
    select?: Prisma.CurrentGraphSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CurrentGraph
     */
    omit?: Prisma.CurrentGraphOmit<ExtArgs> | null;
    /**
     * Filter, which CurrentGraph to fetch.
     */
    where?: Prisma.CurrentGraphWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of CurrentGraphs to fetch.
     */
    orderBy?: Prisma.CurrentGraphOrderByWithRelationInput | Prisma.CurrentGraphOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for CurrentGraphs.
     */
    cursor?: Prisma.CurrentGraphWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` CurrentGraphs from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` CurrentGraphs.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of CurrentGraphs.
     */
    distinct?: Prisma.CurrentGraphScalarFieldEnum | Prisma.CurrentGraphScalarFieldEnum[];
};
/**
 * CurrentGraph findFirstOrThrow
 */
export type CurrentGraphFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CurrentGraph
     */
    select?: Prisma.CurrentGraphSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CurrentGraph
     */
    omit?: Prisma.CurrentGraphOmit<ExtArgs> | null;
    /**
     * Filter, which CurrentGraph to fetch.
     */
    where?: Prisma.CurrentGraphWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of CurrentGraphs to fetch.
     */
    orderBy?: Prisma.CurrentGraphOrderByWithRelationInput | Prisma.CurrentGraphOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for CurrentGraphs.
     */
    cursor?: Prisma.CurrentGraphWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` CurrentGraphs from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` CurrentGraphs.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of CurrentGraphs.
     */
    distinct?: Prisma.CurrentGraphScalarFieldEnum | Prisma.CurrentGraphScalarFieldEnum[];
};
/**
 * CurrentGraph findMany
 */
export type CurrentGraphFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CurrentGraph
     */
    select?: Prisma.CurrentGraphSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CurrentGraph
     */
    omit?: Prisma.CurrentGraphOmit<ExtArgs> | null;
    /**
     * Filter, which CurrentGraphs to fetch.
     */
    where?: Prisma.CurrentGraphWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of CurrentGraphs to fetch.
     */
    orderBy?: Prisma.CurrentGraphOrderByWithRelationInput | Prisma.CurrentGraphOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing CurrentGraphs.
     */
    cursor?: Prisma.CurrentGraphWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` CurrentGraphs from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` CurrentGraphs.
     */
    skip?: number;
    distinct?: Prisma.CurrentGraphScalarFieldEnum | Prisma.CurrentGraphScalarFieldEnum[];
};
/**
 * CurrentGraph create
 */
export type CurrentGraphCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CurrentGraph
     */
    select?: Prisma.CurrentGraphSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CurrentGraph
     */
    omit?: Prisma.CurrentGraphOmit<ExtArgs> | null;
    /**
     * The data needed to create a CurrentGraph.
     */
    data: Prisma.XOR<Prisma.CurrentGraphCreateInput, Prisma.CurrentGraphUncheckedCreateInput>;
};
/**
 * CurrentGraph createMany
 */
export type CurrentGraphCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many CurrentGraphs.
     */
    data: Prisma.CurrentGraphCreateManyInput | Prisma.CurrentGraphCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * CurrentGraph createManyAndReturn
 */
export type CurrentGraphCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CurrentGraph
     */
    select?: Prisma.CurrentGraphSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the CurrentGraph
     */
    omit?: Prisma.CurrentGraphOmit<ExtArgs> | null;
    /**
     * The data used to create many CurrentGraphs.
     */
    data: Prisma.CurrentGraphCreateManyInput | Prisma.CurrentGraphCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * CurrentGraph update
 */
export type CurrentGraphUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CurrentGraph
     */
    select?: Prisma.CurrentGraphSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CurrentGraph
     */
    omit?: Prisma.CurrentGraphOmit<ExtArgs> | null;
    /**
     * The data needed to update a CurrentGraph.
     */
    data: Prisma.XOR<Prisma.CurrentGraphUpdateInput, Prisma.CurrentGraphUncheckedUpdateInput>;
    /**
     * Choose, which CurrentGraph to update.
     */
    where: Prisma.CurrentGraphWhereUniqueInput;
};
/**
 * CurrentGraph updateMany
 */
export type CurrentGraphUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update CurrentGraphs.
     */
    data: Prisma.XOR<Prisma.CurrentGraphUpdateManyMutationInput, Prisma.CurrentGraphUncheckedUpdateManyInput>;
    /**
     * Filter which CurrentGraphs to update
     */
    where?: Prisma.CurrentGraphWhereInput;
    /**
     * Limit how many CurrentGraphs to update.
     */
    limit?: number;
};
/**
 * CurrentGraph updateManyAndReturn
 */
export type CurrentGraphUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CurrentGraph
     */
    select?: Prisma.CurrentGraphSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the CurrentGraph
     */
    omit?: Prisma.CurrentGraphOmit<ExtArgs> | null;
    /**
     * The data used to update CurrentGraphs.
     */
    data: Prisma.XOR<Prisma.CurrentGraphUpdateManyMutationInput, Prisma.CurrentGraphUncheckedUpdateManyInput>;
    /**
     * Filter which CurrentGraphs to update
     */
    where?: Prisma.CurrentGraphWhereInput;
    /**
     * Limit how many CurrentGraphs to update.
     */
    limit?: number;
};
/**
 * CurrentGraph upsert
 */
export type CurrentGraphUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CurrentGraph
     */
    select?: Prisma.CurrentGraphSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CurrentGraph
     */
    omit?: Prisma.CurrentGraphOmit<ExtArgs> | null;
    /**
     * The filter to search for the CurrentGraph to update in case it exists.
     */
    where: Prisma.CurrentGraphWhereUniqueInput;
    /**
     * In case the CurrentGraph found by the `where` argument doesn't exist, create a new CurrentGraph with this data.
     */
    create: Prisma.XOR<Prisma.CurrentGraphCreateInput, Prisma.CurrentGraphUncheckedCreateInput>;
    /**
     * In case the CurrentGraph was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.CurrentGraphUpdateInput, Prisma.CurrentGraphUncheckedUpdateInput>;
};
/**
 * CurrentGraph delete
 */
export type CurrentGraphDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CurrentGraph
     */
    select?: Prisma.CurrentGraphSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CurrentGraph
     */
    omit?: Prisma.CurrentGraphOmit<ExtArgs> | null;
    /**
     * Filter which CurrentGraph to delete.
     */
    where: Prisma.CurrentGraphWhereUniqueInput;
};
/**
 * CurrentGraph deleteMany
 */
export type CurrentGraphDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which CurrentGraphs to delete
     */
    where?: Prisma.CurrentGraphWhereInput;
    /**
     * Limit how many CurrentGraphs to delete.
     */
    limit?: number;
};
/**
 * CurrentGraph without action
 */
export type CurrentGraphDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CurrentGraph
     */
    select?: Prisma.CurrentGraphSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CurrentGraph
     */
    omit?: Prisma.CurrentGraphOmit<ExtArgs> | null;
};
export {};
//# sourceMappingURL=CurrentGraph.d.ts.map