import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
/**
 * Model ActionDefinition
 *
 */
export type ActionDefinitionModel = runtime.Types.Result.DefaultSelection<Prisma.$ActionDefinitionPayload>;
export type AggregateActionDefinition = {
    _count: ActionDefinitionCountAggregateOutputType | null;
    _min: ActionDefinitionMinAggregateOutputType | null;
    _max: ActionDefinitionMaxAggregateOutputType | null;
};
export type ActionDefinitionMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    type: string | null;
    createdAt: Date | null;
};
export type ActionDefinitionMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    type: string | null;
    createdAt: Date | null;
};
export type ActionDefinitionCountAggregateOutputType = {
    id: number;
    name: number;
    type: number;
    config: number;
    createdAt: number;
    _all: number;
};
export type ActionDefinitionMinAggregateInputType = {
    id?: true;
    name?: true;
    type?: true;
    createdAt?: true;
};
export type ActionDefinitionMaxAggregateInputType = {
    id?: true;
    name?: true;
    type?: true;
    createdAt?: true;
};
export type ActionDefinitionCountAggregateInputType = {
    id?: true;
    name?: true;
    type?: true;
    config?: true;
    createdAt?: true;
    _all?: true;
};
export type ActionDefinitionAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which ActionDefinition to aggregate.
     */
    where?: Prisma.ActionDefinitionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ActionDefinitions to fetch.
     */
    orderBy?: Prisma.ActionDefinitionOrderByWithRelationInput | Prisma.ActionDefinitionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.ActionDefinitionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ActionDefinitions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ActionDefinitions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned ActionDefinitions
    **/
    _count?: true | ActionDefinitionCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: ActionDefinitionMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: ActionDefinitionMaxAggregateInputType;
};
export type GetActionDefinitionAggregateType<T extends ActionDefinitionAggregateArgs> = {
    [P in keyof T & keyof AggregateActionDefinition]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateActionDefinition[P]> : Prisma.GetScalarType<T[P], AggregateActionDefinition[P]>;
};
export type ActionDefinitionGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ActionDefinitionWhereInput;
    orderBy?: Prisma.ActionDefinitionOrderByWithAggregationInput | Prisma.ActionDefinitionOrderByWithAggregationInput[];
    by: Prisma.ActionDefinitionScalarFieldEnum[] | Prisma.ActionDefinitionScalarFieldEnum;
    having?: Prisma.ActionDefinitionScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ActionDefinitionCountAggregateInputType | true;
    _min?: ActionDefinitionMinAggregateInputType;
    _max?: ActionDefinitionMaxAggregateInputType;
};
export type ActionDefinitionGroupByOutputType = {
    id: string;
    name: string;
    type: string;
    config: runtime.JsonValue;
    createdAt: Date;
    _count: ActionDefinitionCountAggregateOutputType | null;
    _min: ActionDefinitionMinAggregateOutputType | null;
    _max: ActionDefinitionMaxAggregateOutputType | null;
};
type GetActionDefinitionGroupByPayload<T extends ActionDefinitionGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ActionDefinitionGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ActionDefinitionGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ActionDefinitionGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ActionDefinitionGroupByOutputType[P]>;
}>>;
export type ActionDefinitionWhereInput = {
    AND?: Prisma.ActionDefinitionWhereInput | Prisma.ActionDefinitionWhereInput[];
    OR?: Prisma.ActionDefinitionWhereInput[];
    NOT?: Prisma.ActionDefinitionWhereInput | Prisma.ActionDefinitionWhereInput[];
    id?: Prisma.StringFilter<"ActionDefinition"> | string;
    name?: Prisma.StringFilter<"ActionDefinition"> | string;
    type?: Prisma.StringFilter<"ActionDefinition"> | string;
    config?: Prisma.JsonFilter<"ActionDefinition">;
    createdAt?: Prisma.DateTimeFilter<"ActionDefinition"> | Date | string;
    executionPlans?: Prisma.ExecutionPlanListRelationFilter;
};
export type ActionDefinitionOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    config?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    executionPlans?: Prisma.ExecutionPlanOrderByRelationAggregateInput;
};
export type ActionDefinitionWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    name?: string;
    AND?: Prisma.ActionDefinitionWhereInput | Prisma.ActionDefinitionWhereInput[];
    OR?: Prisma.ActionDefinitionWhereInput[];
    NOT?: Prisma.ActionDefinitionWhereInput | Prisma.ActionDefinitionWhereInput[];
    type?: Prisma.StringFilter<"ActionDefinition"> | string;
    config?: Prisma.JsonFilter<"ActionDefinition">;
    createdAt?: Prisma.DateTimeFilter<"ActionDefinition"> | Date | string;
    executionPlans?: Prisma.ExecutionPlanListRelationFilter;
}, "id" | "name">;
export type ActionDefinitionOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    config?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.ActionDefinitionCountOrderByAggregateInput;
    _max?: Prisma.ActionDefinitionMaxOrderByAggregateInput;
    _min?: Prisma.ActionDefinitionMinOrderByAggregateInput;
};
export type ActionDefinitionScalarWhereWithAggregatesInput = {
    AND?: Prisma.ActionDefinitionScalarWhereWithAggregatesInput | Prisma.ActionDefinitionScalarWhereWithAggregatesInput[];
    OR?: Prisma.ActionDefinitionScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ActionDefinitionScalarWhereWithAggregatesInput | Prisma.ActionDefinitionScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"ActionDefinition"> | string;
    name?: Prisma.StringWithAggregatesFilter<"ActionDefinition"> | string;
    type?: Prisma.StringWithAggregatesFilter<"ActionDefinition"> | string;
    config?: Prisma.JsonWithAggregatesFilter<"ActionDefinition">;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"ActionDefinition"> | Date | string;
};
export type ActionDefinitionCreateInput = {
    id?: string;
    name: string;
    type: string;
    config: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    executionPlans?: Prisma.ExecutionPlanCreateNestedManyWithoutActionDefinitionInput;
};
export type ActionDefinitionUncheckedCreateInput = {
    id?: string;
    name: string;
    type: string;
    config: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    executionPlans?: Prisma.ExecutionPlanUncheckedCreateNestedManyWithoutActionDefinitionInput;
};
export type ActionDefinitionUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.StringFieldUpdateOperationsInput | string;
    config?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    executionPlans?: Prisma.ExecutionPlanUpdateManyWithoutActionDefinitionNestedInput;
};
export type ActionDefinitionUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.StringFieldUpdateOperationsInput | string;
    config?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    executionPlans?: Prisma.ExecutionPlanUncheckedUpdateManyWithoutActionDefinitionNestedInput;
};
export type ActionDefinitionCreateManyInput = {
    id?: string;
    name: string;
    type: string;
    config: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
};
export type ActionDefinitionUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.StringFieldUpdateOperationsInput | string;
    config?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ActionDefinitionUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.StringFieldUpdateOperationsInput | string;
    config?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ActionDefinitionCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    config?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type ActionDefinitionMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type ActionDefinitionMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type ActionDefinitionScalarRelationFilter = {
    is?: Prisma.ActionDefinitionWhereInput;
    isNot?: Prisma.ActionDefinitionWhereInput;
};
export type ActionDefinitionCreateNestedOneWithoutExecutionPlansInput = {
    create?: Prisma.XOR<Prisma.ActionDefinitionCreateWithoutExecutionPlansInput, Prisma.ActionDefinitionUncheckedCreateWithoutExecutionPlansInput>;
    connectOrCreate?: Prisma.ActionDefinitionCreateOrConnectWithoutExecutionPlansInput;
    connect?: Prisma.ActionDefinitionWhereUniqueInput;
};
export type ActionDefinitionUpdateOneRequiredWithoutExecutionPlansNestedInput = {
    create?: Prisma.XOR<Prisma.ActionDefinitionCreateWithoutExecutionPlansInput, Prisma.ActionDefinitionUncheckedCreateWithoutExecutionPlansInput>;
    connectOrCreate?: Prisma.ActionDefinitionCreateOrConnectWithoutExecutionPlansInput;
    upsert?: Prisma.ActionDefinitionUpsertWithoutExecutionPlansInput;
    connect?: Prisma.ActionDefinitionWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ActionDefinitionUpdateToOneWithWhereWithoutExecutionPlansInput, Prisma.ActionDefinitionUpdateWithoutExecutionPlansInput>, Prisma.ActionDefinitionUncheckedUpdateWithoutExecutionPlansInput>;
};
export type ActionDefinitionCreateWithoutExecutionPlansInput = {
    id?: string;
    name: string;
    type: string;
    config: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
};
export type ActionDefinitionUncheckedCreateWithoutExecutionPlansInput = {
    id?: string;
    name: string;
    type: string;
    config: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
};
export type ActionDefinitionCreateOrConnectWithoutExecutionPlansInput = {
    where: Prisma.ActionDefinitionWhereUniqueInput;
    create: Prisma.XOR<Prisma.ActionDefinitionCreateWithoutExecutionPlansInput, Prisma.ActionDefinitionUncheckedCreateWithoutExecutionPlansInput>;
};
export type ActionDefinitionUpsertWithoutExecutionPlansInput = {
    update: Prisma.XOR<Prisma.ActionDefinitionUpdateWithoutExecutionPlansInput, Prisma.ActionDefinitionUncheckedUpdateWithoutExecutionPlansInput>;
    create: Prisma.XOR<Prisma.ActionDefinitionCreateWithoutExecutionPlansInput, Prisma.ActionDefinitionUncheckedCreateWithoutExecutionPlansInput>;
    where?: Prisma.ActionDefinitionWhereInput;
};
export type ActionDefinitionUpdateToOneWithWhereWithoutExecutionPlansInput = {
    where?: Prisma.ActionDefinitionWhereInput;
    data: Prisma.XOR<Prisma.ActionDefinitionUpdateWithoutExecutionPlansInput, Prisma.ActionDefinitionUncheckedUpdateWithoutExecutionPlansInput>;
};
export type ActionDefinitionUpdateWithoutExecutionPlansInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.StringFieldUpdateOperationsInput | string;
    config?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ActionDefinitionUncheckedUpdateWithoutExecutionPlansInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.StringFieldUpdateOperationsInput | string;
    config?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
/**
 * Count Type ActionDefinitionCountOutputType
 */
export type ActionDefinitionCountOutputType = {
    executionPlans: number;
};
export type ActionDefinitionCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    executionPlans?: boolean | ActionDefinitionCountOutputTypeCountExecutionPlansArgs;
};
/**
 * ActionDefinitionCountOutputType without action
 */
export type ActionDefinitionCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActionDefinitionCountOutputType
     */
    select?: Prisma.ActionDefinitionCountOutputTypeSelect<ExtArgs> | null;
};
/**
 * ActionDefinitionCountOutputType without action
 */
export type ActionDefinitionCountOutputTypeCountExecutionPlansArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ExecutionPlanWhereInput;
};
export type ActionDefinitionSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    type?: boolean;
    config?: boolean;
    createdAt?: boolean;
    executionPlans?: boolean | Prisma.ActionDefinition$executionPlansArgs<ExtArgs>;
    _count?: boolean | Prisma.ActionDefinitionCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["actionDefinition"]>;
export type ActionDefinitionSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    type?: boolean;
    config?: boolean;
    createdAt?: boolean;
}, ExtArgs["result"]["actionDefinition"]>;
export type ActionDefinitionSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    type?: boolean;
    config?: boolean;
    createdAt?: boolean;
}, ExtArgs["result"]["actionDefinition"]>;
export type ActionDefinitionSelectScalar = {
    id?: boolean;
    name?: boolean;
    type?: boolean;
    config?: boolean;
    createdAt?: boolean;
};
export type ActionDefinitionOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "name" | "type" | "config" | "createdAt", ExtArgs["result"]["actionDefinition"]>;
export type ActionDefinitionInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    executionPlans?: boolean | Prisma.ActionDefinition$executionPlansArgs<ExtArgs>;
    _count?: boolean | Prisma.ActionDefinitionCountOutputTypeDefaultArgs<ExtArgs>;
};
export type ActionDefinitionIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type ActionDefinitionIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $ActionDefinitionPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ActionDefinition";
    objects: {
        executionPlans: Prisma.$ExecutionPlanPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        name: string;
        type: string;
        config: runtime.JsonValue;
        createdAt: Date;
    }, ExtArgs["result"]["actionDefinition"]>;
    composites: {};
};
export type ActionDefinitionGetPayload<S extends boolean | null | undefined | ActionDefinitionDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ActionDefinitionPayload, S>;
export type ActionDefinitionCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ActionDefinitionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ActionDefinitionCountAggregateInputType | true;
};
export interface ActionDefinitionDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ActionDefinition'];
        meta: {
            name: 'ActionDefinition';
        };
    };
    /**
     * Find zero or one ActionDefinition that matches the filter.
     * @param {ActionDefinitionFindUniqueArgs} args - Arguments to find a ActionDefinition
     * @example
     * // Get one ActionDefinition
     * const actionDefinition = await prisma.actionDefinition.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ActionDefinitionFindUniqueArgs>(args: Prisma.SelectSubset<T, ActionDefinitionFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ActionDefinitionClient<runtime.Types.Result.GetResult<Prisma.$ActionDefinitionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one ActionDefinition that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ActionDefinitionFindUniqueOrThrowArgs} args - Arguments to find a ActionDefinition
     * @example
     * // Get one ActionDefinition
     * const actionDefinition = await prisma.actionDefinition.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ActionDefinitionFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ActionDefinitionFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ActionDefinitionClient<runtime.Types.Result.GetResult<Prisma.$ActionDefinitionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first ActionDefinition that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActionDefinitionFindFirstArgs} args - Arguments to find a ActionDefinition
     * @example
     * // Get one ActionDefinition
     * const actionDefinition = await prisma.actionDefinition.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ActionDefinitionFindFirstArgs>(args?: Prisma.SelectSubset<T, ActionDefinitionFindFirstArgs<ExtArgs>>): Prisma.Prisma__ActionDefinitionClient<runtime.Types.Result.GetResult<Prisma.$ActionDefinitionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first ActionDefinition that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActionDefinitionFindFirstOrThrowArgs} args - Arguments to find a ActionDefinition
     * @example
     * // Get one ActionDefinition
     * const actionDefinition = await prisma.actionDefinition.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ActionDefinitionFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ActionDefinitionFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ActionDefinitionClient<runtime.Types.Result.GetResult<Prisma.$ActionDefinitionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more ActionDefinitions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActionDefinitionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ActionDefinitions
     * const actionDefinitions = await prisma.actionDefinition.findMany()
     *
     * // Get first 10 ActionDefinitions
     * const actionDefinitions = await prisma.actionDefinition.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const actionDefinitionWithIdOnly = await prisma.actionDefinition.findMany({ select: { id: true } })
     *
     */
    findMany<T extends ActionDefinitionFindManyArgs>(args?: Prisma.SelectSubset<T, ActionDefinitionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ActionDefinitionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a ActionDefinition.
     * @param {ActionDefinitionCreateArgs} args - Arguments to create a ActionDefinition.
     * @example
     * // Create one ActionDefinition
     * const ActionDefinition = await prisma.actionDefinition.create({
     *   data: {
     *     // ... data to create a ActionDefinition
     *   }
     * })
     *
     */
    create<T extends ActionDefinitionCreateArgs>(args: Prisma.SelectSubset<T, ActionDefinitionCreateArgs<ExtArgs>>): Prisma.Prisma__ActionDefinitionClient<runtime.Types.Result.GetResult<Prisma.$ActionDefinitionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many ActionDefinitions.
     * @param {ActionDefinitionCreateManyArgs} args - Arguments to create many ActionDefinitions.
     * @example
     * // Create many ActionDefinitions
     * const actionDefinition = await prisma.actionDefinition.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends ActionDefinitionCreateManyArgs>(args?: Prisma.SelectSubset<T, ActionDefinitionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many ActionDefinitions and returns the data saved in the database.
     * @param {ActionDefinitionCreateManyAndReturnArgs} args - Arguments to create many ActionDefinitions.
     * @example
     * // Create many ActionDefinitions
     * const actionDefinition = await prisma.actionDefinition.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many ActionDefinitions and only return the `id`
     * const actionDefinitionWithIdOnly = await prisma.actionDefinition.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends ActionDefinitionCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ActionDefinitionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ActionDefinitionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a ActionDefinition.
     * @param {ActionDefinitionDeleteArgs} args - Arguments to delete one ActionDefinition.
     * @example
     * // Delete one ActionDefinition
     * const ActionDefinition = await prisma.actionDefinition.delete({
     *   where: {
     *     // ... filter to delete one ActionDefinition
     *   }
     * })
     *
     */
    delete<T extends ActionDefinitionDeleteArgs>(args: Prisma.SelectSubset<T, ActionDefinitionDeleteArgs<ExtArgs>>): Prisma.Prisma__ActionDefinitionClient<runtime.Types.Result.GetResult<Prisma.$ActionDefinitionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one ActionDefinition.
     * @param {ActionDefinitionUpdateArgs} args - Arguments to update one ActionDefinition.
     * @example
     * // Update one ActionDefinition
     * const actionDefinition = await prisma.actionDefinition.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends ActionDefinitionUpdateArgs>(args: Prisma.SelectSubset<T, ActionDefinitionUpdateArgs<ExtArgs>>): Prisma.Prisma__ActionDefinitionClient<runtime.Types.Result.GetResult<Prisma.$ActionDefinitionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more ActionDefinitions.
     * @param {ActionDefinitionDeleteManyArgs} args - Arguments to filter ActionDefinitions to delete.
     * @example
     * // Delete a few ActionDefinitions
     * const { count } = await prisma.actionDefinition.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends ActionDefinitionDeleteManyArgs>(args?: Prisma.SelectSubset<T, ActionDefinitionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more ActionDefinitions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActionDefinitionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ActionDefinitions
     * const actionDefinition = await prisma.actionDefinition.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends ActionDefinitionUpdateManyArgs>(args: Prisma.SelectSubset<T, ActionDefinitionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more ActionDefinitions and returns the data updated in the database.
     * @param {ActionDefinitionUpdateManyAndReturnArgs} args - Arguments to update many ActionDefinitions.
     * @example
     * // Update many ActionDefinitions
     * const actionDefinition = await prisma.actionDefinition.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more ActionDefinitions and only return the `id`
     * const actionDefinitionWithIdOnly = await prisma.actionDefinition.updateManyAndReturn({
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
    updateManyAndReturn<T extends ActionDefinitionUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ActionDefinitionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ActionDefinitionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one ActionDefinition.
     * @param {ActionDefinitionUpsertArgs} args - Arguments to update or create a ActionDefinition.
     * @example
     * // Update or create a ActionDefinition
     * const actionDefinition = await prisma.actionDefinition.upsert({
     *   create: {
     *     // ... data to create a ActionDefinition
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ActionDefinition we want to update
     *   }
     * })
     */
    upsert<T extends ActionDefinitionUpsertArgs>(args: Prisma.SelectSubset<T, ActionDefinitionUpsertArgs<ExtArgs>>): Prisma.Prisma__ActionDefinitionClient<runtime.Types.Result.GetResult<Prisma.$ActionDefinitionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of ActionDefinitions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActionDefinitionCountArgs} args - Arguments to filter ActionDefinitions to count.
     * @example
     * // Count the number of ActionDefinitions
     * const count = await prisma.actionDefinition.count({
     *   where: {
     *     // ... the filter for the ActionDefinitions we want to count
     *   }
     * })
    **/
    count<T extends ActionDefinitionCountArgs>(args?: Prisma.Subset<T, ActionDefinitionCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ActionDefinitionCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a ActionDefinition.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActionDefinitionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ActionDefinitionAggregateArgs>(args: Prisma.Subset<T, ActionDefinitionAggregateArgs>): Prisma.PrismaPromise<GetActionDefinitionAggregateType<T>>;
    /**
     * Group by ActionDefinition.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActionDefinitionGroupByArgs} args - Group by arguments.
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
    groupBy<T extends ActionDefinitionGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ActionDefinitionGroupByArgs['orderBy'];
    } : {
        orderBy?: ActionDefinitionGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ActionDefinitionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetActionDefinitionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the ActionDefinition model
     */
    readonly fields: ActionDefinitionFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for ActionDefinition.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__ActionDefinitionClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    executionPlans<T extends Prisma.ActionDefinition$executionPlansArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ActionDefinition$executionPlansArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ExecutionPlanPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
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
 * Fields of the ActionDefinition model
 */
export interface ActionDefinitionFieldRefs {
    readonly id: Prisma.FieldRef<"ActionDefinition", 'String'>;
    readonly name: Prisma.FieldRef<"ActionDefinition", 'String'>;
    readonly type: Prisma.FieldRef<"ActionDefinition", 'String'>;
    readonly config: Prisma.FieldRef<"ActionDefinition", 'Json'>;
    readonly createdAt: Prisma.FieldRef<"ActionDefinition", 'DateTime'>;
}
/**
 * ActionDefinition findUnique
 */
export type ActionDefinitionFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActionDefinition
     */
    select?: Prisma.ActionDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ActionDefinition
     */
    omit?: Prisma.ActionDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ActionDefinitionInclude<ExtArgs> | null;
    /**
     * Filter, which ActionDefinition to fetch.
     */
    where: Prisma.ActionDefinitionWhereUniqueInput;
};
/**
 * ActionDefinition findUniqueOrThrow
 */
export type ActionDefinitionFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActionDefinition
     */
    select?: Prisma.ActionDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ActionDefinition
     */
    omit?: Prisma.ActionDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ActionDefinitionInclude<ExtArgs> | null;
    /**
     * Filter, which ActionDefinition to fetch.
     */
    where: Prisma.ActionDefinitionWhereUniqueInput;
};
/**
 * ActionDefinition findFirst
 */
export type ActionDefinitionFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActionDefinition
     */
    select?: Prisma.ActionDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ActionDefinition
     */
    omit?: Prisma.ActionDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ActionDefinitionInclude<ExtArgs> | null;
    /**
     * Filter, which ActionDefinition to fetch.
     */
    where?: Prisma.ActionDefinitionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ActionDefinitions to fetch.
     */
    orderBy?: Prisma.ActionDefinitionOrderByWithRelationInput | Prisma.ActionDefinitionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ActionDefinitions.
     */
    cursor?: Prisma.ActionDefinitionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ActionDefinitions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ActionDefinitions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ActionDefinitions.
     */
    distinct?: Prisma.ActionDefinitionScalarFieldEnum | Prisma.ActionDefinitionScalarFieldEnum[];
};
/**
 * ActionDefinition findFirstOrThrow
 */
export type ActionDefinitionFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActionDefinition
     */
    select?: Prisma.ActionDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ActionDefinition
     */
    omit?: Prisma.ActionDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ActionDefinitionInclude<ExtArgs> | null;
    /**
     * Filter, which ActionDefinition to fetch.
     */
    where?: Prisma.ActionDefinitionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ActionDefinitions to fetch.
     */
    orderBy?: Prisma.ActionDefinitionOrderByWithRelationInput | Prisma.ActionDefinitionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ActionDefinitions.
     */
    cursor?: Prisma.ActionDefinitionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ActionDefinitions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ActionDefinitions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ActionDefinitions.
     */
    distinct?: Prisma.ActionDefinitionScalarFieldEnum | Prisma.ActionDefinitionScalarFieldEnum[];
};
/**
 * ActionDefinition findMany
 */
export type ActionDefinitionFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActionDefinition
     */
    select?: Prisma.ActionDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ActionDefinition
     */
    omit?: Prisma.ActionDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ActionDefinitionInclude<ExtArgs> | null;
    /**
     * Filter, which ActionDefinitions to fetch.
     */
    where?: Prisma.ActionDefinitionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ActionDefinitions to fetch.
     */
    orderBy?: Prisma.ActionDefinitionOrderByWithRelationInput | Prisma.ActionDefinitionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing ActionDefinitions.
     */
    cursor?: Prisma.ActionDefinitionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ActionDefinitions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ActionDefinitions.
     */
    skip?: number;
    distinct?: Prisma.ActionDefinitionScalarFieldEnum | Prisma.ActionDefinitionScalarFieldEnum[];
};
/**
 * ActionDefinition create
 */
export type ActionDefinitionCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActionDefinition
     */
    select?: Prisma.ActionDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ActionDefinition
     */
    omit?: Prisma.ActionDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ActionDefinitionInclude<ExtArgs> | null;
    /**
     * The data needed to create a ActionDefinition.
     */
    data: Prisma.XOR<Prisma.ActionDefinitionCreateInput, Prisma.ActionDefinitionUncheckedCreateInput>;
};
/**
 * ActionDefinition createMany
 */
export type ActionDefinitionCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many ActionDefinitions.
     */
    data: Prisma.ActionDefinitionCreateManyInput | Prisma.ActionDefinitionCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * ActionDefinition createManyAndReturn
 */
export type ActionDefinitionCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActionDefinition
     */
    select?: Prisma.ActionDefinitionSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the ActionDefinition
     */
    omit?: Prisma.ActionDefinitionOmit<ExtArgs> | null;
    /**
     * The data used to create many ActionDefinitions.
     */
    data: Prisma.ActionDefinitionCreateManyInput | Prisma.ActionDefinitionCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * ActionDefinition update
 */
export type ActionDefinitionUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActionDefinition
     */
    select?: Prisma.ActionDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ActionDefinition
     */
    omit?: Prisma.ActionDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ActionDefinitionInclude<ExtArgs> | null;
    /**
     * The data needed to update a ActionDefinition.
     */
    data: Prisma.XOR<Prisma.ActionDefinitionUpdateInput, Prisma.ActionDefinitionUncheckedUpdateInput>;
    /**
     * Choose, which ActionDefinition to update.
     */
    where: Prisma.ActionDefinitionWhereUniqueInput;
};
/**
 * ActionDefinition updateMany
 */
export type ActionDefinitionUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update ActionDefinitions.
     */
    data: Prisma.XOR<Prisma.ActionDefinitionUpdateManyMutationInput, Prisma.ActionDefinitionUncheckedUpdateManyInput>;
    /**
     * Filter which ActionDefinitions to update
     */
    where?: Prisma.ActionDefinitionWhereInput;
    /**
     * Limit how many ActionDefinitions to update.
     */
    limit?: number;
};
/**
 * ActionDefinition updateManyAndReturn
 */
export type ActionDefinitionUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActionDefinition
     */
    select?: Prisma.ActionDefinitionSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the ActionDefinition
     */
    omit?: Prisma.ActionDefinitionOmit<ExtArgs> | null;
    /**
     * The data used to update ActionDefinitions.
     */
    data: Prisma.XOR<Prisma.ActionDefinitionUpdateManyMutationInput, Prisma.ActionDefinitionUncheckedUpdateManyInput>;
    /**
     * Filter which ActionDefinitions to update
     */
    where?: Prisma.ActionDefinitionWhereInput;
    /**
     * Limit how many ActionDefinitions to update.
     */
    limit?: number;
};
/**
 * ActionDefinition upsert
 */
export type ActionDefinitionUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActionDefinition
     */
    select?: Prisma.ActionDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ActionDefinition
     */
    omit?: Prisma.ActionDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ActionDefinitionInclude<ExtArgs> | null;
    /**
     * The filter to search for the ActionDefinition to update in case it exists.
     */
    where: Prisma.ActionDefinitionWhereUniqueInput;
    /**
     * In case the ActionDefinition found by the `where` argument doesn't exist, create a new ActionDefinition with this data.
     */
    create: Prisma.XOR<Prisma.ActionDefinitionCreateInput, Prisma.ActionDefinitionUncheckedCreateInput>;
    /**
     * In case the ActionDefinition was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.ActionDefinitionUpdateInput, Prisma.ActionDefinitionUncheckedUpdateInput>;
};
/**
 * ActionDefinition delete
 */
export type ActionDefinitionDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActionDefinition
     */
    select?: Prisma.ActionDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ActionDefinition
     */
    omit?: Prisma.ActionDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ActionDefinitionInclude<ExtArgs> | null;
    /**
     * Filter which ActionDefinition to delete.
     */
    where: Prisma.ActionDefinitionWhereUniqueInput;
};
/**
 * ActionDefinition deleteMany
 */
export type ActionDefinitionDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which ActionDefinitions to delete
     */
    where?: Prisma.ActionDefinitionWhereInput;
    /**
     * Limit how many ActionDefinitions to delete.
     */
    limit?: number;
};
/**
 * ActionDefinition.executionPlans
 */
export type ActionDefinition$executionPlansArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExecutionPlan
     */
    select?: Prisma.ExecutionPlanSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ExecutionPlan
     */
    omit?: Prisma.ExecutionPlanOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ExecutionPlanInclude<ExtArgs> | null;
    where?: Prisma.ExecutionPlanWhereInput;
    orderBy?: Prisma.ExecutionPlanOrderByWithRelationInput | Prisma.ExecutionPlanOrderByWithRelationInput[];
    cursor?: Prisma.ExecutionPlanWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ExecutionPlanScalarFieldEnum | Prisma.ExecutionPlanScalarFieldEnum[];
};
/**
 * ActionDefinition without action
 */
export type ActionDefinitionDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActionDefinition
     */
    select?: Prisma.ActionDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ActionDefinition
     */
    omit?: Prisma.ActionDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ActionDefinitionInclude<ExtArgs> | null;
};
export {};
//# sourceMappingURL=ActionDefinition.d.ts.map