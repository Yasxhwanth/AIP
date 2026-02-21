import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
/**
 * Model PolicyDefinition
 *
 */
export type PolicyDefinitionModel = runtime.Types.Result.DefaultSelection<Prisma.$PolicyDefinitionPayload>;
export type AggregatePolicyDefinition = {
    _count: PolicyDefinitionCountAggregateOutputType | null;
    _avg: PolicyDefinitionAvgAggregateOutputType | null;
    _sum: PolicyDefinitionSumAggregateOutputType | null;
    _min: PolicyDefinitionMinAggregateOutputType | null;
    _max: PolicyDefinitionMaxAggregateOutputType | null;
};
export type PolicyDefinitionAvgAggregateOutputType = {
    version: number | null;
};
export type PolicyDefinitionSumAggregateOutputType = {
    version: number | null;
};
export type PolicyDefinitionMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    description: string | null;
    entityTypeId: string | null;
    eventType: string | null;
    actionType: string | null;
    version: number | null;
    enabled: boolean | null;
    createdAt: Date | null;
};
export type PolicyDefinitionMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    description: string | null;
    entityTypeId: string | null;
    eventType: string | null;
    actionType: string | null;
    version: number | null;
    enabled: boolean | null;
    createdAt: Date | null;
};
export type PolicyDefinitionCountAggregateOutputType = {
    id: number;
    name: number;
    description: number;
    entityTypeId: number;
    eventType: number;
    condition: number;
    actionType: number;
    actionConfig: number;
    version: number;
    enabled: number;
    createdAt: number;
    _all: number;
};
export type PolicyDefinitionAvgAggregateInputType = {
    version?: true;
};
export type PolicyDefinitionSumAggregateInputType = {
    version?: true;
};
export type PolicyDefinitionMinAggregateInputType = {
    id?: true;
    name?: true;
    description?: true;
    entityTypeId?: true;
    eventType?: true;
    actionType?: true;
    version?: true;
    enabled?: true;
    createdAt?: true;
};
export type PolicyDefinitionMaxAggregateInputType = {
    id?: true;
    name?: true;
    description?: true;
    entityTypeId?: true;
    eventType?: true;
    actionType?: true;
    version?: true;
    enabled?: true;
    createdAt?: true;
};
export type PolicyDefinitionCountAggregateInputType = {
    id?: true;
    name?: true;
    description?: true;
    entityTypeId?: true;
    eventType?: true;
    condition?: true;
    actionType?: true;
    actionConfig?: true;
    version?: true;
    enabled?: true;
    createdAt?: true;
    _all?: true;
};
export type PolicyDefinitionAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which PolicyDefinition to aggregate.
     */
    where?: Prisma.PolicyDefinitionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PolicyDefinitions to fetch.
     */
    orderBy?: Prisma.PolicyDefinitionOrderByWithRelationInput | Prisma.PolicyDefinitionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.PolicyDefinitionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PolicyDefinitions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PolicyDefinitions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned PolicyDefinitions
    **/
    _count?: true | PolicyDefinitionCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: PolicyDefinitionAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: PolicyDefinitionSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: PolicyDefinitionMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: PolicyDefinitionMaxAggregateInputType;
};
export type GetPolicyDefinitionAggregateType<T extends PolicyDefinitionAggregateArgs> = {
    [P in keyof T & keyof AggregatePolicyDefinition]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregatePolicyDefinition[P]> : Prisma.GetScalarType<T[P], AggregatePolicyDefinition[P]>;
};
export type PolicyDefinitionGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PolicyDefinitionWhereInput;
    orderBy?: Prisma.PolicyDefinitionOrderByWithAggregationInput | Prisma.PolicyDefinitionOrderByWithAggregationInput[];
    by: Prisma.PolicyDefinitionScalarFieldEnum[] | Prisma.PolicyDefinitionScalarFieldEnum;
    having?: Prisma.PolicyDefinitionScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: PolicyDefinitionCountAggregateInputType | true;
    _avg?: PolicyDefinitionAvgAggregateInputType;
    _sum?: PolicyDefinitionSumAggregateInputType;
    _min?: PolicyDefinitionMinAggregateInputType;
    _max?: PolicyDefinitionMaxAggregateInputType;
};
export type PolicyDefinitionGroupByOutputType = {
    id: string;
    name: string;
    description: string | null;
    entityTypeId: string;
    eventType: string;
    condition: runtime.JsonValue;
    actionType: string;
    actionConfig: runtime.JsonValue | null;
    version: number;
    enabled: boolean;
    createdAt: Date;
    _count: PolicyDefinitionCountAggregateOutputType | null;
    _avg: PolicyDefinitionAvgAggregateOutputType | null;
    _sum: PolicyDefinitionSumAggregateOutputType | null;
    _min: PolicyDefinitionMinAggregateOutputType | null;
    _max: PolicyDefinitionMaxAggregateOutputType | null;
};
type GetPolicyDefinitionGroupByPayload<T extends PolicyDefinitionGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<PolicyDefinitionGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof PolicyDefinitionGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], PolicyDefinitionGroupByOutputType[P]> : Prisma.GetScalarType<T[P], PolicyDefinitionGroupByOutputType[P]>;
}>>;
export type PolicyDefinitionWhereInput = {
    AND?: Prisma.PolicyDefinitionWhereInput | Prisma.PolicyDefinitionWhereInput[];
    OR?: Prisma.PolicyDefinitionWhereInput[];
    NOT?: Prisma.PolicyDefinitionWhereInput | Prisma.PolicyDefinitionWhereInput[];
    id?: Prisma.StringFilter<"PolicyDefinition"> | string;
    name?: Prisma.StringFilter<"PolicyDefinition"> | string;
    description?: Prisma.StringNullableFilter<"PolicyDefinition"> | string | null;
    entityTypeId?: Prisma.StringFilter<"PolicyDefinition"> | string;
    eventType?: Prisma.StringFilter<"PolicyDefinition"> | string;
    condition?: Prisma.JsonFilter<"PolicyDefinition">;
    actionType?: Prisma.StringFilter<"PolicyDefinition"> | string;
    actionConfig?: Prisma.JsonNullableFilter<"PolicyDefinition">;
    version?: Prisma.IntFilter<"PolicyDefinition"> | number;
    enabled?: Prisma.BoolFilter<"PolicyDefinition"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"PolicyDefinition"> | Date | string;
};
export type PolicyDefinitionOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    entityTypeId?: Prisma.SortOrder;
    eventType?: Prisma.SortOrder;
    condition?: Prisma.SortOrder;
    actionType?: Prisma.SortOrder;
    actionConfig?: Prisma.SortOrderInput | Prisma.SortOrder;
    version?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type PolicyDefinitionWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    name?: string;
    AND?: Prisma.PolicyDefinitionWhereInput | Prisma.PolicyDefinitionWhereInput[];
    OR?: Prisma.PolicyDefinitionWhereInput[];
    NOT?: Prisma.PolicyDefinitionWhereInput | Prisma.PolicyDefinitionWhereInput[];
    description?: Prisma.StringNullableFilter<"PolicyDefinition"> | string | null;
    entityTypeId?: Prisma.StringFilter<"PolicyDefinition"> | string;
    eventType?: Prisma.StringFilter<"PolicyDefinition"> | string;
    condition?: Prisma.JsonFilter<"PolicyDefinition">;
    actionType?: Prisma.StringFilter<"PolicyDefinition"> | string;
    actionConfig?: Prisma.JsonNullableFilter<"PolicyDefinition">;
    version?: Prisma.IntFilter<"PolicyDefinition"> | number;
    enabled?: Prisma.BoolFilter<"PolicyDefinition"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"PolicyDefinition"> | Date | string;
}, "id" | "name">;
export type PolicyDefinitionOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    entityTypeId?: Prisma.SortOrder;
    eventType?: Prisma.SortOrder;
    condition?: Prisma.SortOrder;
    actionType?: Prisma.SortOrder;
    actionConfig?: Prisma.SortOrderInput | Prisma.SortOrder;
    version?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.PolicyDefinitionCountOrderByAggregateInput;
    _avg?: Prisma.PolicyDefinitionAvgOrderByAggregateInput;
    _max?: Prisma.PolicyDefinitionMaxOrderByAggregateInput;
    _min?: Prisma.PolicyDefinitionMinOrderByAggregateInput;
    _sum?: Prisma.PolicyDefinitionSumOrderByAggregateInput;
};
export type PolicyDefinitionScalarWhereWithAggregatesInput = {
    AND?: Prisma.PolicyDefinitionScalarWhereWithAggregatesInput | Prisma.PolicyDefinitionScalarWhereWithAggregatesInput[];
    OR?: Prisma.PolicyDefinitionScalarWhereWithAggregatesInput[];
    NOT?: Prisma.PolicyDefinitionScalarWhereWithAggregatesInput | Prisma.PolicyDefinitionScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"PolicyDefinition"> | string;
    name?: Prisma.StringWithAggregatesFilter<"PolicyDefinition"> | string;
    description?: Prisma.StringNullableWithAggregatesFilter<"PolicyDefinition"> | string | null;
    entityTypeId?: Prisma.StringWithAggregatesFilter<"PolicyDefinition"> | string;
    eventType?: Prisma.StringWithAggregatesFilter<"PolicyDefinition"> | string;
    condition?: Prisma.JsonWithAggregatesFilter<"PolicyDefinition">;
    actionType?: Prisma.StringWithAggregatesFilter<"PolicyDefinition"> | string;
    actionConfig?: Prisma.JsonNullableWithAggregatesFilter<"PolicyDefinition">;
    version?: Prisma.IntWithAggregatesFilter<"PolicyDefinition"> | number;
    enabled?: Prisma.BoolWithAggregatesFilter<"PolicyDefinition"> | boolean;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"PolicyDefinition"> | Date | string;
};
export type PolicyDefinitionCreateInput = {
    id?: string;
    name: string;
    description?: string | null;
    entityTypeId: string;
    eventType?: string;
    condition: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionType?: string;
    actionConfig?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    version?: number;
    enabled?: boolean;
    createdAt?: Date | string;
};
export type PolicyDefinitionUncheckedCreateInput = {
    id?: string;
    name: string;
    description?: string | null;
    entityTypeId: string;
    eventType?: string;
    condition: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionType?: string;
    actionConfig?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    version?: number;
    enabled?: boolean;
    createdAt?: Date | string;
};
export type PolicyDefinitionUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    entityTypeId?: Prisma.StringFieldUpdateOperationsInput | string;
    eventType?: Prisma.StringFieldUpdateOperationsInput | string;
    condition?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionType?: Prisma.StringFieldUpdateOperationsInput | string;
    actionConfig?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    version?: Prisma.IntFieldUpdateOperationsInput | number;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PolicyDefinitionUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    entityTypeId?: Prisma.StringFieldUpdateOperationsInput | string;
    eventType?: Prisma.StringFieldUpdateOperationsInput | string;
    condition?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionType?: Prisma.StringFieldUpdateOperationsInput | string;
    actionConfig?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    version?: Prisma.IntFieldUpdateOperationsInput | number;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PolicyDefinitionCreateManyInput = {
    id?: string;
    name: string;
    description?: string | null;
    entityTypeId: string;
    eventType?: string;
    condition: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionType?: string;
    actionConfig?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    version?: number;
    enabled?: boolean;
    createdAt?: Date | string;
};
export type PolicyDefinitionUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    entityTypeId?: Prisma.StringFieldUpdateOperationsInput | string;
    eventType?: Prisma.StringFieldUpdateOperationsInput | string;
    condition?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionType?: Prisma.StringFieldUpdateOperationsInput | string;
    actionConfig?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    version?: Prisma.IntFieldUpdateOperationsInput | number;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PolicyDefinitionUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    entityTypeId?: Prisma.StringFieldUpdateOperationsInput | string;
    eventType?: Prisma.StringFieldUpdateOperationsInput | string;
    condition?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionType?: Prisma.StringFieldUpdateOperationsInput | string;
    actionConfig?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    version?: Prisma.IntFieldUpdateOperationsInput | number;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PolicyDefinitionCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    entityTypeId?: Prisma.SortOrder;
    eventType?: Prisma.SortOrder;
    condition?: Prisma.SortOrder;
    actionType?: Prisma.SortOrder;
    actionConfig?: Prisma.SortOrder;
    version?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type PolicyDefinitionAvgOrderByAggregateInput = {
    version?: Prisma.SortOrder;
};
export type PolicyDefinitionMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    entityTypeId?: Prisma.SortOrder;
    eventType?: Prisma.SortOrder;
    actionType?: Prisma.SortOrder;
    version?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type PolicyDefinitionMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    entityTypeId?: Prisma.SortOrder;
    eventType?: Prisma.SortOrder;
    actionType?: Prisma.SortOrder;
    version?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type PolicyDefinitionSumOrderByAggregateInput = {
    version?: Prisma.SortOrder;
};
export type PolicyDefinitionSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    description?: boolean;
    entityTypeId?: boolean;
    eventType?: boolean;
    condition?: boolean;
    actionType?: boolean;
    actionConfig?: boolean;
    version?: boolean;
    enabled?: boolean;
    createdAt?: boolean;
}, ExtArgs["result"]["policyDefinition"]>;
export type PolicyDefinitionSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    description?: boolean;
    entityTypeId?: boolean;
    eventType?: boolean;
    condition?: boolean;
    actionType?: boolean;
    actionConfig?: boolean;
    version?: boolean;
    enabled?: boolean;
    createdAt?: boolean;
}, ExtArgs["result"]["policyDefinition"]>;
export type PolicyDefinitionSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    description?: boolean;
    entityTypeId?: boolean;
    eventType?: boolean;
    condition?: boolean;
    actionType?: boolean;
    actionConfig?: boolean;
    version?: boolean;
    enabled?: boolean;
    createdAt?: boolean;
}, ExtArgs["result"]["policyDefinition"]>;
export type PolicyDefinitionSelectScalar = {
    id?: boolean;
    name?: boolean;
    description?: boolean;
    entityTypeId?: boolean;
    eventType?: boolean;
    condition?: boolean;
    actionType?: boolean;
    actionConfig?: boolean;
    version?: boolean;
    enabled?: boolean;
    createdAt?: boolean;
};
export type PolicyDefinitionOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "name" | "description" | "entityTypeId" | "eventType" | "condition" | "actionType" | "actionConfig" | "version" | "enabled" | "createdAt", ExtArgs["result"]["policyDefinition"]>;
export type $PolicyDefinitionPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "PolicyDefinition";
    objects: {};
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        name: string;
        description: string | null;
        entityTypeId: string;
        eventType: string;
        condition: runtime.JsonValue;
        actionType: string;
        actionConfig: runtime.JsonValue | null;
        version: number;
        enabled: boolean;
        createdAt: Date;
    }, ExtArgs["result"]["policyDefinition"]>;
    composites: {};
};
export type PolicyDefinitionGetPayload<S extends boolean | null | undefined | PolicyDefinitionDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$PolicyDefinitionPayload, S>;
export type PolicyDefinitionCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<PolicyDefinitionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: PolicyDefinitionCountAggregateInputType | true;
};
export interface PolicyDefinitionDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['PolicyDefinition'];
        meta: {
            name: 'PolicyDefinition';
        };
    };
    /**
     * Find zero or one PolicyDefinition that matches the filter.
     * @param {PolicyDefinitionFindUniqueArgs} args - Arguments to find a PolicyDefinition
     * @example
     * // Get one PolicyDefinition
     * const policyDefinition = await prisma.policyDefinition.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PolicyDefinitionFindUniqueArgs>(args: Prisma.SelectSubset<T, PolicyDefinitionFindUniqueArgs<ExtArgs>>): Prisma.Prisma__PolicyDefinitionClient<runtime.Types.Result.GetResult<Prisma.$PolicyDefinitionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one PolicyDefinition that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PolicyDefinitionFindUniqueOrThrowArgs} args - Arguments to find a PolicyDefinition
     * @example
     * // Get one PolicyDefinition
     * const policyDefinition = await prisma.policyDefinition.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PolicyDefinitionFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, PolicyDefinitionFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__PolicyDefinitionClient<runtime.Types.Result.GetResult<Prisma.$PolicyDefinitionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first PolicyDefinition that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PolicyDefinitionFindFirstArgs} args - Arguments to find a PolicyDefinition
     * @example
     * // Get one PolicyDefinition
     * const policyDefinition = await prisma.policyDefinition.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PolicyDefinitionFindFirstArgs>(args?: Prisma.SelectSubset<T, PolicyDefinitionFindFirstArgs<ExtArgs>>): Prisma.Prisma__PolicyDefinitionClient<runtime.Types.Result.GetResult<Prisma.$PolicyDefinitionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first PolicyDefinition that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PolicyDefinitionFindFirstOrThrowArgs} args - Arguments to find a PolicyDefinition
     * @example
     * // Get one PolicyDefinition
     * const policyDefinition = await prisma.policyDefinition.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PolicyDefinitionFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, PolicyDefinitionFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__PolicyDefinitionClient<runtime.Types.Result.GetResult<Prisma.$PolicyDefinitionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more PolicyDefinitions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PolicyDefinitionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PolicyDefinitions
     * const policyDefinitions = await prisma.policyDefinition.findMany()
     *
     * // Get first 10 PolicyDefinitions
     * const policyDefinitions = await prisma.policyDefinition.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const policyDefinitionWithIdOnly = await prisma.policyDefinition.findMany({ select: { id: true } })
     *
     */
    findMany<T extends PolicyDefinitionFindManyArgs>(args?: Prisma.SelectSubset<T, PolicyDefinitionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PolicyDefinitionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a PolicyDefinition.
     * @param {PolicyDefinitionCreateArgs} args - Arguments to create a PolicyDefinition.
     * @example
     * // Create one PolicyDefinition
     * const PolicyDefinition = await prisma.policyDefinition.create({
     *   data: {
     *     // ... data to create a PolicyDefinition
     *   }
     * })
     *
     */
    create<T extends PolicyDefinitionCreateArgs>(args: Prisma.SelectSubset<T, PolicyDefinitionCreateArgs<ExtArgs>>): Prisma.Prisma__PolicyDefinitionClient<runtime.Types.Result.GetResult<Prisma.$PolicyDefinitionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many PolicyDefinitions.
     * @param {PolicyDefinitionCreateManyArgs} args - Arguments to create many PolicyDefinitions.
     * @example
     * // Create many PolicyDefinitions
     * const policyDefinition = await prisma.policyDefinition.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends PolicyDefinitionCreateManyArgs>(args?: Prisma.SelectSubset<T, PolicyDefinitionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many PolicyDefinitions and returns the data saved in the database.
     * @param {PolicyDefinitionCreateManyAndReturnArgs} args - Arguments to create many PolicyDefinitions.
     * @example
     * // Create many PolicyDefinitions
     * const policyDefinition = await prisma.policyDefinition.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many PolicyDefinitions and only return the `id`
     * const policyDefinitionWithIdOnly = await prisma.policyDefinition.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends PolicyDefinitionCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, PolicyDefinitionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PolicyDefinitionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a PolicyDefinition.
     * @param {PolicyDefinitionDeleteArgs} args - Arguments to delete one PolicyDefinition.
     * @example
     * // Delete one PolicyDefinition
     * const PolicyDefinition = await prisma.policyDefinition.delete({
     *   where: {
     *     // ... filter to delete one PolicyDefinition
     *   }
     * })
     *
     */
    delete<T extends PolicyDefinitionDeleteArgs>(args: Prisma.SelectSubset<T, PolicyDefinitionDeleteArgs<ExtArgs>>): Prisma.Prisma__PolicyDefinitionClient<runtime.Types.Result.GetResult<Prisma.$PolicyDefinitionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one PolicyDefinition.
     * @param {PolicyDefinitionUpdateArgs} args - Arguments to update one PolicyDefinition.
     * @example
     * // Update one PolicyDefinition
     * const policyDefinition = await prisma.policyDefinition.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends PolicyDefinitionUpdateArgs>(args: Prisma.SelectSubset<T, PolicyDefinitionUpdateArgs<ExtArgs>>): Prisma.Prisma__PolicyDefinitionClient<runtime.Types.Result.GetResult<Prisma.$PolicyDefinitionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more PolicyDefinitions.
     * @param {PolicyDefinitionDeleteManyArgs} args - Arguments to filter PolicyDefinitions to delete.
     * @example
     * // Delete a few PolicyDefinitions
     * const { count } = await prisma.policyDefinition.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends PolicyDefinitionDeleteManyArgs>(args?: Prisma.SelectSubset<T, PolicyDefinitionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more PolicyDefinitions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PolicyDefinitionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PolicyDefinitions
     * const policyDefinition = await prisma.policyDefinition.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends PolicyDefinitionUpdateManyArgs>(args: Prisma.SelectSubset<T, PolicyDefinitionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more PolicyDefinitions and returns the data updated in the database.
     * @param {PolicyDefinitionUpdateManyAndReturnArgs} args - Arguments to update many PolicyDefinitions.
     * @example
     * // Update many PolicyDefinitions
     * const policyDefinition = await prisma.policyDefinition.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more PolicyDefinitions and only return the `id`
     * const policyDefinitionWithIdOnly = await prisma.policyDefinition.updateManyAndReturn({
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
    updateManyAndReturn<T extends PolicyDefinitionUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, PolicyDefinitionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PolicyDefinitionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one PolicyDefinition.
     * @param {PolicyDefinitionUpsertArgs} args - Arguments to update or create a PolicyDefinition.
     * @example
     * // Update or create a PolicyDefinition
     * const policyDefinition = await prisma.policyDefinition.upsert({
     *   create: {
     *     // ... data to create a PolicyDefinition
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PolicyDefinition we want to update
     *   }
     * })
     */
    upsert<T extends PolicyDefinitionUpsertArgs>(args: Prisma.SelectSubset<T, PolicyDefinitionUpsertArgs<ExtArgs>>): Prisma.Prisma__PolicyDefinitionClient<runtime.Types.Result.GetResult<Prisma.$PolicyDefinitionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of PolicyDefinitions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PolicyDefinitionCountArgs} args - Arguments to filter PolicyDefinitions to count.
     * @example
     * // Count the number of PolicyDefinitions
     * const count = await prisma.policyDefinition.count({
     *   where: {
     *     // ... the filter for the PolicyDefinitions we want to count
     *   }
     * })
    **/
    count<T extends PolicyDefinitionCountArgs>(args?: Prisma.Subset<T, PolicyDefinitionCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], PolicyDefinitionCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a PolicyDefinition.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PolicyDefinitionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends PolicyDefinitionAggregateArgs>(args: Prisma.Subset<T, PolicyDefinitionAggregateArgs>): Prisma.PrismaPromise<GetPolicyDefinitionAggregateType<T>>;
    /**
     * Group by PolicyDefinition.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PolicyDefinitionGroupByArgs} args - Group by arguments.
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
    groupBy<T extends PolicyDefinitionGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: PolicyDefinitionGroupByArgs['orderBy'];
    } : {
        orderBy?: PolicyDefinitionGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, PolicyDefinitionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPolicyDefinitionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the PolicyDefinition model
     */
    readonly fields: PolicyDefinitionFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for PolicyDefinition.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__PolicyDefinitionClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
 * Fields of the PolicyDefinition model
 */
export interface PolicyDefinitionFieldRefs {
    readonly id: Prisma.FieldRef<"PolicyDefinition", 'String'>;
    readonly name: Prisma.FieldRef<"PolicyDefinition", 'String'>;
    readonly description: Prisma.FieldRef<"PolicyDefinition", 'String'>;
    readonly entityTypeId: Prisma.FieldRef<"PolicyDefinition", 'String'>;
    readonly eventType: Prisma.FieldRef<"PolicyDefinition", 'String'>;
    readonly condition: Prisma.FieldRef<"PolicyDefinition", 'Json'>;
    readonly actionType: Prisma.FieldRef<"PolicyDefinition", 'String'>;
    readonly actionConfig: Prisma.FieldRef<"PolicyDefinition", 'Json'>;
    readonly version: Prisma.FieldRef<"PolicyDefinition", 'Int'>;
    readonly enabled: Prisma.FieldRef<"PolicyDefinition", 'Boolean'>;
    readonly createdAt: Prisma.FieldRef<"PolicyDefinition", 'DateTime'>;
}
/**
 * PolicyDefinition findUnique
 */
export type PolicyDefinitionFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyDefinition
     */
    select?: Prisma.PolicyDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PolicyDefinition
     */
    omit?: Prisma.PolicyDefinitionOmit<ExtArgs> | null;
    /**
     * Filter, which PolicyDefinition to fetch.
     */
    where: Prisma.PolicyDefinitionWhereUniqueInput;
};
/**
 * PolicyDefinition findUniqueOrThrow
 */
export type PolicyDefinitionFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyDefinition
     */
    select?: Prisma.PolicyDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PolicyDefinition
     */
    omit?: Prisma.PolicyDefinitionOmit<ExtArgs> | null;
    /**
     * Filter, which PolicyDefinition to fetch.
     */
    where: Prisma.PolicyDefinitionWhereUniqueInput;
};
/**
 * PolicyDefinition findFirst
 */
export type PolicyDefinitionFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyDefinition
     */
    select?: Prisma.PolicyDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PolicyDefinition
     */
    omit?: Prisma.PolicyDefinitionOmit<ExtArgs> | null;
    /**
     * Filter, which PolicyDefinition to fetch.
     */
    where?: Prisma.PolicyDefinitionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PolicyDefinitions to fetch.
     */
    orderBy?: Prisma.PolicyDefinitionOrderByWithRelationInput | Prisma.PolicyDefinitionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for PolicyDefinitions.
     */
    cursor?: Prisma.PolicyDefinitionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PolicyDefinitions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PolicyDefinitions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of PolicyDefinitions.
     */
    distinct?: Prisma.PolicyDefinitionScalarFieldEnum | Prisma.PolicyDefinitionScalarFieldEnum[];
};
/**
 * PolicyDefinition findFirstOrThrow
 */
export type PolicyDefinitionFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyDefinition
     */
    select?: Prisma.PolicyDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PolicyDefinition
     */
    omit?: Prisma.PolicyDefinitionOmit<ExtArgs> | null;
    /**
     * Filter, which PolicyDefinition to fetch.
     */
    where?: Prisma.PolicyDefinitionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PolicyDefinitions to fetch.
     */
    orderBy?: Prisma.PolicyDefinitionOrderByWithRelationInput | Prisma.PolicyDefinitionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for PolicyDefinitions.
     */
    cursor?: Prisma.PolicyDefinitionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PolicyDefinitions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PolicyDefinitions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of PolicyDefinitions.
     */
    distinct?: Prisma.PolicyDefinitionScalarFieldEnum | Prisma.PolicyDefinitionScalarFieldEnum[];
};
/**
 * PolicyDefinition findMany
 */
export type PolicyDefinitionFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyDefinition
     */
    select?: Prisma.PolicyDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PolicyDefinition
     */
    omit?: Prisma.PolicyDefinitionOmit<ExtArgs> | null;
    /**
     * Filter, which PolicyDefinitions to fetch.
     */
    where?: Prisma.PolicyDefinitionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PolicyDefinitions to fetch.
     */
    orderBy?: Prisma.PolicyDefinitionOrderByWithRelationInput | Prisma.PolicyDefinitionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing PolicyDefinitions.
     */
    cursor?: Prisma.PolicyDefinitionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PolicyDefinitions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PolicyDefinitions.
     */
    skip?: number;
    distinct?: Prisma.PolicyDefinitionScalarFieldEnum | Prisma.PolicyDefinitionScalarFieldEnum[];
};
/**
 * PolicyDefinition create
 */
export type PolicyDefinitionCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyDefinition
     */
    select?: Prisma.PolicyDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PolicyDefinition
     */
    omit?: Prisma.PolicyDefinitionOmit<ExtArgs> | null;
    /**
     * The data needed to create a PolicyDefinition.
     */
    data: Prisma.XOR<Prisma.PolicyDefinitionCreateInput, Prisma.PolicyDefinitionUncheckedCreateInput>;
};
/**
 * PolicyDefinition createMany
 */
export type PolicyDefinitionCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many PolicyDefinitions.
     */
    data: Prisma.PolicyDefinitionCreateManyInput | Prisma.PolicyDefinitionCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * PolicyDefinition createManyAndReturn
 */
export type PolicyDefinitionCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyDefinition
     */
    select?: Prisma.PolicyDefinitionSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the PolicyDefinition
     */
    omit?: Prisma.PolicyDefinitionOmit<ExtArgs> | null;
    /**
     * The data used to create many PolicyDefinitions.
     */
    data: Prisma.PolicyDefinitionCreateManyInput | Prisma.PolicyDefinitionCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * PolicyDefinition update
 */
export type PolicyDefinitionUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyDefinition
     */
    select?: Prisma.PolicyDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PolicyDefinition
     */
    omit?: Prisma.PolicyDefinitionOmit<ExtArgs> | null;
    /**
     * The data needed to update a PolicyDefinition.
     */
    data: Prisma.XOR<Prisma.PolicyDefinitionUpdateInput, Prisma.PolicyDefinitionUncheckedUpdateInput>;
    /**
     * Choose, which PolicyDefinition to update.
     */
    where: Prisma.PolicyDefinitionWhereUniqueInput;
};
/**
 * PolicyDefinition updateMany
 */
export type PolicyDefinitionUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update PolicyDefinitions.
     */
    data: Prisma.XOR<Prisma.PolicyDefinitionUpdateManyMutationInput, Prisma.PolicyDefinitionUncheckedUpdateManyInput>;
    /**
     * Filter which PolicyDefinitions to update
     */
    where?: Prisma.PolicyDefinitionWhereInput;
    /**
     * Limit how many PolicyDefinitions to update.
     */
    limit?: number;
};
/**
 * PolicyDefinition updateManyAndReturn
 */
export type PolicyDefinitionUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyDefinition
     */
    select?: Prisma.PolicyDefinitionSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the PolicyDefinition
     */
    omit?: Prisma.PolicyDefinitionOmit<ExtArgs> | null;
    /**
     * The data used to update PolicyDefinitions.
     */
    data: Prisma.XOR<Prisma.PolicyDefinitionUpdateManyMutationInput, Prisma.PolicyDefinitionUncheckedUpdateManyInput>;
    /**
     * Filter which PolicyDefinitions to update
     */
    where?: Prisma.PolicyDefinitionWhereInput;
    /**
     * Limit how many PolicyDefinitions to update.
     */
    limit?: number;
};
/**
 * PolicyDefinition upsert
 */
export type PolicyDefinitionUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyDefinition
     */
    select?: Prisma.PolicyDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PolicyDefinition
     */
    omit?: Prisma.PolicyDefinitionOmit<ExtArgs> | null;
    /**
     * The filter to search for the PolicyDefinition to update in case it exists.
     */
    where: Prisma.PolicyDefinitionWhereUniqueInput;
    /**
     * In case the PolicyDefinition found by the `where` argument doesn't exist, create a new PolicyDefinition with this data.
     */
    create: Prisma.XOR<Prisma.PolicyDefinitionCreateInput, Prisma.PolicyDefinitionUncheckedCreateInput>;
    /**
     * In case the PolicyDefinition was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.PolicyDefinitionUpdateInput, Prisma.PolicyDefinitionUncheckedUpdateInput>;
};
/**
 * PolicyDefinition delete
 */
export type PolicyDefinitionDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyDefinition
     */
    select?: Prisma.PolicyDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PolicyDefinition
     */
    omit?: Prisma.PolicyDefinitionOmit<ExtArgs> | null;
    /**
     * Filter which PolicyDefinition to delete.
     */
    where: Prisma.PolicyDefinitionWhereUniqueInput;
};
/**
 * PolicyDefinition deleteMany
 */
export type PolicyDefinitionDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which PolicyDefinitions to delete
     */
    where?: Prisma.PolicyDefinitionWhereInput;
    /**
     * Limit how many PolicyDefinitions to delete.
     */
    limit?: number;
};
/**
 * PolicyDefinition without action
 */
export type PolicyDefinitionDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyDefinition
     */
    select?: Prisma.PolicyDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PolicyDefinition
     */
    omit?: Prisma.PolicyDefinitionOmit<ExtArgs> | null;
};
export {};
//# sourceMappingURL=PolicyDefinition.d.ts.map