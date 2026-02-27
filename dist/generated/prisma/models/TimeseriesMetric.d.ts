import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
/**
 * Model TimeseriesMetric
 *
 */
export type TimeseriesMetricModel = runtime.Types.Result.DefaultSelection<Prisma.$TimeseriesMetricPayload>;
export type AggregateTimeseriesMetric = {
    _count: TimeseriesMetricCountAggregateOutputType | null;
    _avg: TimeseriesMetricAvgAggregateOutputType | null;
    _sum: TimeseriesMetricSumAggregateOutputType | null;
    _min: TimeseriesMetricMinAggregateOutputType | null;
    _max: TimeseriesMetricMaxAggregateOutputType | null;
};
export type TimeseriesMetricAvgAggregateOutputType = {
    value: number | null;
};
export type TimeseriesMetricSumAggregateOutputType = {
    value: number | null;
};
export type TimeseriesMetricMinAggregateOutputType = {
    id: string | null;
    logicalId: string | null;
    metric: string | null;
    value: number | null;
    timestamp: Date | null;
};
export type TimeseriesMetricMaxAggregateOutputType = {
    id: string | null;
    logicalId: string | null;
    metric: string | null;
    value: number | null;
    timestamp: Date | null;
};
export type TimeseriesMetricCountAggregateOutputType = {
    id: number;
    logicalId: number;
    metric: number;
    value: number;
    timestamp: number;
    _all: number;
};
export type TimeseriesMetricAvgAggregateInputType = {
    value?: true;
};
export type TimeseriesMetricSumAggregateInputType = {
    value?: true;
};
export type TimeseriesMetricMinAggregateInputType = {
    id?: true;
    logicalId?: true;
    metric?: true;
    value?: true;
    timestamp?: true;
};
export type TimeseriesMetricMaxAggregateInputType = {
    id?: true;
    logicalId?: true;
    metric?: true;
    value?: true;
    timestamp?: true;
};
export type TimeseriesMetricCountAggregateInputType = {
    id?: true;
    logicalId?: true;
    metric?: true;
    value?: true;
    timestamp?: true;
    _all?: true;
};
export type TimeseriesMetricAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which TimeseriesMetric to aggregate.
     */
    where?: Prisma.TimeseriesMetricWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of TimeseriesMetrics to fetch.
     */
    orderBy?: Prisma.TimeseriesMetricOrderByWithRelationInput | Prisma.TimeseriesMetricOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.TimeseriesMetricWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` TimeseriesMetrics from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` TimeseriesMetrics.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned TimeseriesMetrics
    **/
    _count?: true | TimeseriesMetricCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: TimeseriesMetricAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: TimeseriesMetricSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: TimeseriesMetricMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: TimeseriesMetricMaxAggregateInputType;
};
export type GetTimeseriesMetricAggregateType<T extends TimeseriesMetricAggregateArgs> = {
    [P in keyof T & keyof AggregateTimeseriesMetric]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateTimeseriesMetric[P]> : Prisma.GetScalarType<T[P], AggregateTimeseriesMetric[P]>;
};
export type TimeseriesMetricGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TimeseriesMetricWhereInput;
    orderBy?: Prisma.TimeseriesMetricOrderByWithAggregationInput | Prisma.TimeseriesMetricOrderByWithAggregationInput[];
    by: Prisma.TimeseriesMetricScalarFieldEnum[] | Prisma.TimeseriesMetricScalarFieldEnum;
    having?: Prisma.TimeseriesMetricScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: TimeseriesMetricCountAggregateInputType | true;
    _avg?: TimeseriesMetricAvgAggregateInputType;
    _sum?: TimeseriesMetricSumAggregateInputType;
    _min?: TimeseriesMetricMinAggregateInputType;
    _max?: TimeseriesMetricMaxAggregateInputType;
};
export type TimeseriesMetricGroupByOutputType = {
    id: string;
    logicalId: string;
    metric: string;
    value: number;
    timestamp: Date;
    _count: TimeseriesMetricCountAggregateOutputType | null;
    _avg: TimeseriesMetricAvgAggregateOutputType | null;
    _sum: TimeseriesMetricSumAggregateOutputType | null;
    _min: TimeseriesMetricMinAggregateOutputType | null;
    _max: TimeseriesMetricMaxAggregateOutputType | null;
};
type GetTimeseriesMetricGroupByPayload<T extends TimeseriesMetricGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<TimeseriesMetricGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof TimeseriesMetricGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], TimeseriesMetricGroupByOutputType[P]> : Prisma.GetScalarType<T[P], TimeseriesMetricGroupByOutputType[P]>;
}>>;
export type TimeseriesMetricWhereInput = {
    AND?: Prisma.TimeseriesMetricWhereInput | Prisma.TimeseriesMetricWhereInput[];
    OR?: Prisma.TimeseriesMetricWhereInput[];
    NOT?: Prisma.TimeseriesMetricWhereInput | Prisma.TimeseriesMetricWhereInput[];
    id?: Prisma.StringFilter<"TimeseriesMetric"> | string;
    logicalId?: Prisma.StringFilter<"TimeseriesMetric"> | string;
    metric?: Prisma.StringFilter<"TimeseriesMetric"> | string;
    value?: Prisma.FloatFilter<"TimeseriesMetric"> | number;
    timestamp?: Prisma.DateTimeFilter<"TimeseriesMetric"> | Date | string;
};
export type TimeseriesMetricOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    logicalId?: Prisma.SortOrder;
    metric?: Prisma.SortOrder;
    value?: Prisma.SortOrder;
    timestamp?: Prisma.SortOrder;
};
export type TimeseriesMetricWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.TimeseriesMetricWhereInput | Prisma.TimeseriesMetricWhereInput[];
    OR?: Prisma.TimeseriesMetricWhereInput[];
    NOT?: Prisma.TimeseriesMetricWhereInput | Prisma.TimeseriesMetricWhereInput[];
    logicalId?: Prisma.StringFilter<"TimeseriesMetric"> | string;
    metric?: Prisma.StringFilter<"TimeseriesMetric"> | string;
    value?: Prisma.FloatFilter<"TimeseriesMetric"> | number;
    timestamp?: Prisma.DateTimeFilter<"TimeseriesMetric"> | Date | string;
}, "id">;
export type TimeseriesMetricOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    logicalId?: Prisma.SortOrder;
    metric?: Prisma.SortOrder;
    value?: Prisma.SortOrder;
    timestamp?: Prisma.SortOrder;
    _count?: Prisma.TimeseriesMetricCountOrderByAggregateInput;
    _avg?: Prisma.TimeseriesMetricAvgOrderByAggregateInput;
    _max?: Prisma.TimeseriesMetricMaxOrderByAggregateInput;
    _min?: Prisma.TimeseriesMetricMinOrderByAggregateInput;
    _sum?: Prisma.TimeseriesMetricSumOrderByAggregateInput;
};
export type TimeseriesMetricScalarWhereWithAggregatesInput = {
    AND?: Prisma.TimeseriesMetricScalarWhereWithAggregatesInput | Prisma.TimeseriesMetricScalarWhereWithAggregatesInput[];
    OR?: Prisma.TimeseriesMetricScalarWhereWithAggregatesInput[];
    NOT?: Prisma.TimeseriesMetricScalarWhereWithAggregatesInput | Prisma.TimeseriesMetricScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"TimeseriesMetric"> | string;
    logicalId?: Prisma.StringWithAggregatesFilter<"TimeseriesMetric"> | string;
    metric?: Prisma.StringWithAggregatesFilter<"TimeseriesMetric"> | string;
    value?: Prisma.FloatWithAggregatesFilter<"TimeseriesMetric"> | number;
    timestamp?: Prisma.DateTimeWithAggregatesFilter<"TimeseriesMetric"> | Date | string;
};
export type TimeseriesMetricCreateInput = {
    id?: string;
    logicalId: string;
    metric: string;
    value: number;
    timestamp?: Date | string;
};
export type TimeseriesMetricUncheckedCreateInput = {
    id?: string;
    logicalId: string;
    metric: string;
    value: number;
    timestamp?: Date | string;
};
export type TimeseriesMetricUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    logicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    metric?: Prisma.StringFieldUpdateOperationsInput | string;
    value?: Prisma.FloatFieldUpdateOperationsInput | number;
    timestamp?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TimeseriesMetricUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    logicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    metric?: Prisma.StringFieldUpdateOperationsInput | string;
    value?: Prisma.FloatFieldUpdateOperationsInput | number;
    timestamp?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TimeseriesMetricCreateManyInput = {
    id?: string;
    logicalId: string;
    metric: string;
    value: number;
    timestamp?: Date | string;
};
export type TimeseriesMetricUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    logicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    metric?: Prisma.StringFieldUpdateOperationsInput | string;
    value?: Prisma.FloatFieldUpdateOperationsInput | number;
    timestamp?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TimeseriesMetricUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    logicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    metric?: Prisma.StringFieldUpdateOperationsInput | string;
    value?: Prisma.FloatFieldUpdateOperationsInput | number;
    timestamp?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TimeseriesMetricCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    logicalId?: Prisma.SortOrder;
    metric?: Prisma.SortOrder;
    value?: Prisma.SortOrder;
    timestamp?: Prisma.SortOrder;
};
export type TimeseriesMetricAvgOrderByAggregateInput = {
    value?: Prisma.SortOrder;
};
export type TimeseriesMetricMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    logicalId?: Prisma.SortOrder;
    metric?: Prisma.SortOrder;
    value?: Prisma.SortOrder;
    timestamp?: Prisma.SortOrder;
};
export type TimeseriesMetricMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    logicalId?: Prisma.SortOrder;
    metric?: Prisma.SortOrder;
    value?: Prisma.SortOrder;
    timestamp?: Prisma.SortOrder;
};
export type TimeseriesMetricSumOrderByAggregateInput = {
    value?: Prisma.SortOrder;
};
export type TimeseriesMetricSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    logicalId?: boolean;
    metric?: boolean;
    value?: boolean;
    timestamp?: boolean;
}, ExtArgs["result"]["timeseriesMetric"]>;
export type TimeseriesMetricSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    logicalId?: boolean;
    metric?: boolean;
    value?: boolean;
    timestamp?: boolean;
}, ExtArgs["result"]["timeseriesMetric"]>;
export type TimeseriesMetricSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    logicalId?: boolean;
    metric?: boolean;
    value?: boolean;
    timestamp?: boolean;
}, ExtArgs["result"]["timeseriesMetric"]>;
export type TimeseriesMetricSelectScalar = {
    id?: boolean;
    logicalId?: boolean;
    metric?: boolean;
    value?: boolean;
    timestamp?: boolean;
};
export type TimeseriesMetricOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "logicalId" | "metric" | "value" | "timestamp", ExtArgs["result"]["timeseriesMetric"]>;
export type $TimeseriesMetricPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "TimeseriesMetric";
    objects: {};
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        logicalId: string;
        metric: string;
        value: number;
        timestamp: Date;
    }, ExtArgs["result"]["timeseriesMetric"]>;
    composites: {};
};
export type TimeseriesMetricGetPayload<S extends boolean | null | undefined | TimeseriesMetricDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$TimeseriesMetricPayload, S>;
export type TimeseriesMetricCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<TimeseriesMetricFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: TimeseriesMetricCountAggregateInputType | true;
};
export interface TimeseriesMetricDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['TimeseriesMetric'];
        meta: {
            name: 'TimeseriesMetric';
        };
    };
    /**
     * Find zero or one TimeseriesMetric that matches the filter.
     * @param {TimeseriesMetricFindUniqueArgs} args - Arguments to find a TimeseriesMetric
     * @example
     * // Get one TimeseriesMetric
     * const timeseriesMetric = await prisma.timeseriesMetric.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TimeseriesMetricFindUniqueArgs>(args: Prisma.SelectSubset<T, TimeseriesMetricFindUniqueArgs<ExtArgs>>): Prisma.Prisma__TimeseriesMetricClient<runtime.Types.Result.GetResult<Prisma.$TimeseriesMetricPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one TimeseriesMetric that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TimeseriesMetricFindUniqueOrThrowArgs} args - Arguments to find a TimeseriesMetric
     * @example
     * // Get one TimeseriesMetric
     * const timeseriesMetric = await prisma.timeseriesMetric.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TimeseriesMetricFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, TimeseriesMetricFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__TimeseriesMetricClient<runtime.Types.Result.GetResult<Prisma.$TimeseriesMetricPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first TimeseriesMetric that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TimeseriesMetricFindFirstArgs} args - Arguments to find a TimeseriesMetric
     * @example
     * // Get one TimeseriesMetric
     * const timeseriesMetric = await prisma.timeseriesMetric.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TimeseriesMetricFindFirstArgs>(args?: Prisma.SelectSubset<T, TimeseriesMetricFindFirstArgs<ExtArgs>>): Prisma.Prisma__TimeseriesMetricClient<runtime.Types.Result.GetResult<Prisma.$TimeseriesMetricPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first TimeseriesMetric that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TimeseriesMetricFindFirstOrThrowArgs} args - Arguments to find a TimeseriesMetric
     * @example
     * // Get one TimeseriesMetric
     * const timeseriesMetric = await prisma.timeseriesMetric.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TimeseriesMetricFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, TimeseriesMetricFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__TimeseriesMetricClient<runtime.Types.Result.GetResult<Prisma.$TimeseriesMetricPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more TimeseriesMetrics that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TimeseriesMetricFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TimeseriesMetrics
     * const timeseriesMetrics = await prisma.timeseriesMetric.findMany()
     *
     * // Get first 10 TimeseriesMetrics
     * const timeseriesMetrics = await prisma.timeseriesMetric.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const timeseriesMetricWithIdOnly = await prisma.timeseriesMetric.findMany({ select: { id: true } })
     *
     */
    findMany<T extends TimeseriesMetricFindManyArgs>(args?: Prisma.SelectSubset<T, TimeseriesMetricFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TimeseriesMetricPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a TimeseriesMetric.
     * @param {TimeseriesMetricCreateArgs} args - Arguments to create a TimeseriesMetric.
     * @example
     * // Create one TimeseriesMetric
     * const TimeseriesMetric = await prisma.timeseriesMetric.create({
     *   data: {
     *     // ... data to create a TimeseriesMetric
     *   }
     * })
     *
     */
    create<T extends TimeseriesMetricCreateArgs>(args: Prisma.SelectSubset<T, TimeseriesMetricCreateArgs<ExtArgs>>): Prisma.Prisma__TimeseriesMetricClient<runtime.Types.Result.GetResult<Prisma.$TimeseriesMetricPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many TimeseriesMetrics.
     * @param {TimeseriesMetricCreateManyArgs} args - Arguments to create many TimeseriesMetrics.
     * @example
     * // Create many TimeseriesMetrics
     * const timeseriesMetric = await prisma.timeseriesMetric.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends TimeseriesMetricCreateManyArgs>(args?: Prisma.SelectSubset<T, TimeseriesMetricCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many TimeseriesMetrics and returns the data saved in the database.
     * @param {TimeseriesMetricCreateManyAndReturnArgs} args - Arguments to create many TimeseriesMetrics.
     * @example
     * // Create many TimeseriesMetrics
     * const timeseriesMetric = await prisma.timeseriesMetric.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many TimeseriesMetrics and only return the `id`
     * const timeseriesMetricWithIdOnly = await prisma.timeseriesMetric.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends TimeseriesMetricCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, TimeseriesMetricCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TimeseriesMetricPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a TimeseriesMetric.
     * @param {TimeseriesMetricDeleteArgs} args - Arguments to delete one TimeseriesMetric.
     * @example
     * // Delete one TimeseriesMetric
     * const TimeseriesMetric = await prisma.timeseriesMetric.delete({
     *   where: {
     *     // ... filter to delete one TimeseriesMetric
     *   }
     * })
     *
     */
    delete<T extends TimeseriesMetricDeleteArgs>(args: Prisma.SelectSubset<T, TimeseriesMetricDeleteArgs<ExtArgs>>): Prisma.Prisma__TimeseriesMetricClient<runtime.Types.Result.GetResult<Prisma.$TimeseriesMetricPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one TimeseriesMetric.
     * @param {TimeseriesMetricUpdateArgs} args - Arguments to update one TimeseriesMetric.
     * @example
     * // Update one TimeseriesMetric
     * const timeseriesMetric = await prisma.timeseriesMetric.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends TimeseriesMetricUpdateArgs>(args: Prisma.SelectSubset<T, TimeseriesMetricUpdateArgs<ExtArgs>>): Prisma.Prisma__TimeseriesMetricClient<runtime.Types.Result.GetResult<Prisma.$TimeseriesMetricPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more TimeseriesMetrics.
     * @param {TimeseriesMetricDeleteManyArgs} args - Arguments to filter TimeseriesMetrics to delete.
     * @example
     * // Delete a few TimeseriesMetrics
     * const { count } = await prisma.timeseriesMetric.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends TimeseriesMetricDeleteManyArgs>(args?: Prisma.SelectSubset<T, TimeseriesMetricDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more TimeseriesMetrics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TimeseriesMetricUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TimeseriesMetrics
     * const timeseriesMetric = await prisma.timeseriesMetric.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends TimeseriesMetricUpdateManyArgs>(args: Prisma.SelectSubset<T, TimeseriesMetricUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more TimeseriesMetrics and returns the data updated in the database.
     * @param {TimeseriesMetricUpdateManyAndReturnArgs} args - Arguments to update many TimeseriesMetrics.
     * @example
     * // Update many TimeseriesMetrics
     * const timeseriesMetric = await prisma.timeseriesMetric.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more TimeseriesMetrics and only return the `id`
     * const timeseriesMetricWithIdOnly = await prisma.timeseriesMetric.updateManyAndReturn({
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
    updateManyAndReturn<T extends TimeseriesMetricUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, TimeseriesMetricUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TimeseriesMetricPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one TimeseriesMetric.
     * @param {TimeseriesMetricUpsertArgs} args - Arguments to update or create a TimeseriesMetric.
     * @example
     * // Update or create a TimeseriesMetric
     * const timeseriesMetric = await prisma.timeseriesMetric.upsert({
     *   create: {
     *     // ... data to create a TimeseriesMetric
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TimeseriesMetric we want to update
     *   }
     * })
     */
    upsert<T extends TimeseriesMetricUpsertArgs>(args: Prisma.SelectSubset<T, TimeseriesMetricUpsertArgs<ExtArgs>>): Prisma.Prisma__TimeseriesMetricClient<runtime.Types.Result.GetResult<Prisma.$TimeseriesMetricPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of TimeseriesMetrics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TimeseriesMetricCountArgs} args - Arguments to filter TimeseriesMetrics to count.
     * @example
     * // Count the number of TimeseriesMetrics
     * const count = await prisma.timeseriesMetric.count({
     *   where: {
     *     // ... the filter for the TimeseriesMetrics we want to count
     *   }
     * })
    **/
    count<T extends TimeseriesMetricCountArgs>(args?: Prisma.Subset<T, TimeseriesMetricCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], TimeseriesMetricCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a TimeseriesMetric.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TimeseriesMetricAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends TimeseriesMetricAggregateArgs>(args: Prisma.Subset<T, TimeseriesMetricAggregateArgs>): Prisma.PrismaPromise<GetTimeseriesMetricAggregateType<T>>;
    /**
     * Group by TimeseriesMetric.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TimeseriesMetricGroupByArgs} args - Group by arguments.
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
    groupBy<T extends TimeseriesMetricGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: TimeseriesMetricGroupByArgs['orderBy'];
    } : {
        orderBy?: TimeseriesMetricGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, TimeseriesMetricGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTimeseriesMetricGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the TimeseriesMetric model
     */
    readonly fields: TimeseriesMetricFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for TimeseriesMetric.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__TimeseriesMetricClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
 * Fields of the TimeseriesMetric model
 */
export interface TimeseriesMetricFieldRefs {
    readonly id: Prisma.FieldRef<"TimeseriesMetric", 'String'>;
    readonly logicalId: Prisma.FieldRef<"TimeseriesMetric", 'String'>;
    readonly metric: Prisma.FieldRef<"TimeseriesMetric", 'String'>;
    readonly value: Prisma.FieldRef<"TimeseriesMetric", 'Float'>;
    readonly timestamp: Prisma.FieldRef<"TimeseriesMetric", 'DateTime'>;
}
/**
 * TimeseriesMetric findUnique
 */
export type TimeseriesMetricFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimeseriesMetric
     */
    select?: Prisma.TimeseriesMetricSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TimeseriesMetric
     */
    omit?: Prisma.TimeseriesMetricOmit<ExtArgs> | null;
    /**
     * Filter, which TimeseriesMetric to fetch.
     */
    where: Prisma.TimeseriesMetricWhereUniqueInput;
};
/**
 * TimeseriesMetric findUniqueOrThrow
 */
export type TimeseriesMetricFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimeseriesMetric
     */
    select?: Prisma.TimeseriesMetricSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TimeseriesMetric
     */
    omit?: Prisma.TimeseriesMetricOmit<ExtArgs> | null;
    /**
     * Filter, which TimeseriesMetric to fetch.
     */
    where: Prisma.TimeseriesMetricWhereUniqueInput;
};
/**
 * TimeseriesMetric findFirst
 */
export type TimeseriesMetricFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimeseriesMetric
     */
    select?: Prisma.TimeseriesMetricSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TimeseriesMetric
     */
    omit?: Prisma.TimeseriesMetricOmit<ExtArgs> | null;
    /**
     * Filter, which TimeseriesMetric to fetch.
     */
    where?: Prisma.TimeseriesMetricWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of TimeseriesMetrics to fetch.
     */
    orderBy?: Prisma.TimeseriesMetricOrderByWithRelationInput | Prisma.TimeseriesMetricOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for TimeseriesMetrics.
     */
    cursor?: Prisma.TimeseriesMetricWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` TimeseriesMetrics from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` TimeseriesMetrics.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of TimeseriesMetrics.
     */
    distinct?: Prisma.TimeseriesMetricScalarFieldEnum | Prisma.TimeseriesMetricScalarFieldEnum[];
};
/**
 * TimeseriesMetric findFirstOrThrow
 */
export type TimeseriesMetricFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimeseriesMetric
     */
    select?: Prisma.TimeseriesMetricSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TimeseriesMetric
     */
    omit?: Prisma.TimeseriesMetricOmit<ExtArgs> | null;
    /**
     * Filter, which TimeseriesMetric to fetch.
     */
    where?: Prisma.TimeseriesMetricWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of TimeseriesMetrics to fetch.
     */
    orderBy?: Prisma.TimeseriesMetricOrderByWithRelationInput | Prisma.TimeseriesMetricOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for TimeseriesMetrics.
     */
    cursor?: Prisma.TimeseriesMetricWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` TimeseriesMetrics from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` TimeseriesMetrics.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of TimeseriesMetrics.
     */
    distinct?: Prisma.TimeseriesMetricScalarFieldEnum | Prisma.TimeseriesMetricScalarFieldEnum[];
};
/**
 * TimeseriesMetric findMany
 */
export type TimeseriesMetricFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimeseriesMetric
     */
    select?: Prisma.TimeseriesMetricSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TimeseriesMetric
     */
    omit?: Prisma.TimeseriesMetricOmit<ExtArgs> | null;
    /**
     * Filter, which TimeseriesMetrics to fetch.
     */
    where?: Prisma.TimeseriesMetricWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of TimeseriesMetrics to fetch.
     */
    orderBy?: Prisma.TimeseriesMetricOrderByWithRelationInput | Prisma.TimeseriesMetricOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing TimeseriesMetrics.
     */
    cursor?: Prisma.TimeseriesMetricWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` TimeseriesMetrics from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` TimeseriesMetrics.
     */
    skip?: number;
    distinct?: Prisma.TimeseriesMetricScalarFieldEnum | Prisma.TimeseriesMetricScalarFieldEnum[];
};
/**
 * TimeseriesMetric create
 */
export type TimeseriesMetricCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimeseriesMetric
     */
    select?: Prisma.TimeseriesMetricSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TimeseriesMetric
     */
    omit?: Prisma.TimeseriesMetricOmit<ExtArgs> | null;
    /**
     * The data needed to create a TimeseriesMetric.
     */
    data: Prisma.XOR<Prisma.TimeseriesMetricCreateInput, Prisma.TimeseriesMetricUncheckedCreateInput>;
};
/**
 * TimeseriesMetric createMany
 */
export type TimeseriesMetricCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many TimeseriesMetrics.
     */
    data: Prisma.TimeseriesMetricCreateManyInput | Prisma.TimeseriesMetricCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * TimeseriesMetric createManyAndReturn
 */
export type TimeseriesMetricCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimeseriesMetric
     */
    select?: Prisma.TimeseriesMetricSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the TimeseriesMetric
     */
    omit?: Prisma.TimeseriesMetricOmit<ExtArgs> | null;
    /**
     * The data used to create many TimeseriesMetrics.
     */
    data: Prisma.TimeseriesMetricCreateManyInput | Prisma.TimeseriesMetricCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * TimeseriesMetric update
 */
export type TimeseriesMetricUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimeseriesMetric
     */
    select?: Prisma.TimeseriesMetricSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TimeseriesMetric
     */
    omit?: Prisma.TimeseriesMetricOmit<ExtArgs> | null;
    /**
     * The data needed to update a TimeseriesMetric.
     */
    data: Prisma.XOR<Prisma.TimeseriesMetricUpdateInput, Prisma.TimeseriesMetricUncheckedUpdateInput>;
    /**
     * Choose, which TimeseriesMetric to update.
     */
    where: Prisma.TimeseriesMetricWhereUniqueInput;
};
/**
 * TimeseriesMetric updateMany
 */
export type TimeseriesMetricUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update TimeseriesMetrics.
     */
    data: Prisma.XOR<Prisma.TimeseriesMetricUpdateManyMutationInput, Prisma.TimeseriesMetricUncheckedUpdateManyInput>;
    /**
     * Filter which TimeseriesMetrics to update
     */
    where?: Prisma.TimeseriesMetricWhereInput;
    /**
     * Limit how many TimeseriesMetrics to update.
     */
    limit?: number;
};
/**
 * TimeseriesMetric updateManyAndReturn
 */
export type TimeseriesMetricUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimeseriesMetric
     */
    select?: Prisma.TimeseriesMetricSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the TimeseriesMetric
     */
    omit?: Prisma.TimeseriesMetricOmit<ExtArgs> | null;
    /**
     * The data used to update TimeseriesMetrics.
     */
    data: Prisma.XOR<Prisma.TimeseriesMetricUpdateManyMutationInput, Prisma.TimeseriesMetricUncheckedUpdateManyInput>;
    /**
     * Filter which TimeseriesMetrics to update
     */
    where?: Prisma.TimeseriesMetricWhereInput;
    /**
     * Limit how many TimeseriesMetrics to update.
     */
    limit?: number;
};
/**
 * TimeseriesMetric upsert
 */
export type TimeseriesMetricUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimeseriesMetric
     */
    select?: Prisma.TimeseriesMetricSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TimeseriesMetric
     */
    omit?: Prisma.TimeseriesMetricOmit<ExtArgs> | null;
    /**
     * The filter to search for the TimeseriesMetric to update in case it exists.
     */
    where: Prisma.TimeseriesMetricWhereUniqueInput;
    /**
     * In case the TimeseriesMetric found by the `where` argument doesn't exist, create a new TimeseriesMetric with this data.
     */
    create: Prisma.XOR<Prisma.TimeseriesMetricCreateInput, Prisma.TimeseriesMetricUncheckedCreateInput>;
    /**
     * In case the TimeseriesMetric was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.TimeseriesMetricUpdateInput, Prisma.TimeseriesMetricUncheckedUpdateInput>;
};
/**
 * TimeseriesMetric delete
 */
export type TimeseriesMetricDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimeseriesMetric
     */
    select?: Prisma.TimeseriesMetricSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TimeseriesMetric
     */
    omit?: Prisma.TimeseriesMetricOmit<ExtArgs> | null;
    /**
     * Filter which TimeseriesMetric to delete.
     */
    where: Prisma.TimeseriesMetricWhereUniqueInput;
};
/**
 * TimeseriesMetric deleteMany
 */
export type TimeseriesMetricDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which TimeseriesMetrics to delete
     */
    where?: Prisma.TimeseriesMetricWhereInput;
    /**
     * Limit how many TimeseriesMetrics to delete.
     */
    limit?: number;
};
/**
 * TimeseriesMetric without action
 */
export type TimeseriesMetricDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimeseriesMetric
     */
    select?: Prisma.TimeseriesMetricSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TimeseriesMetric
     */
    omit?: Prisma.TimeseriesMetricOmit<ExtArgs> | null;
};
export {};
//# sourceMappingURL=TimeseriesMetric.d.ts.map