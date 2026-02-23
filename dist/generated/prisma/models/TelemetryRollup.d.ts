import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
/**
 * Model TelemetryRollup
 *
 */
export type TelemetryRollupModel = runtime.Types.Result.DefaultSelection<Prisma.$TelemetryRollupPayload>;
export type AggregateTelemetryRollup = {
    _count: TelemetryRollupCountAggregateOutputType | null;
    _avg: TelemetryRollupAvgAggregateOutputType | null;
    _sum: TelemetryRollupSumAggregateOutputType | null;
    _min: TelemetryRollupMinAggregateOutputType | null;
    _max: TelemetryRollupMaxAggregateOutputType | null;
};
export type TelemetryRollupAvgAggregateOutputType = {
    avg: number | null;
    min: number | null;
    max: number | null;
    sum: number | null;
    count: number | null;
};
export type TelemetryRollupSumAggregateOutputType = {
    avg: number | null;
    min: number | null;
    max: number | null;
    sum: number | null;
    count: number | null;
};
export type TelemetryRollupMinAggregateOutputType = {
    id: string | null;
    logicalId: string | null;
    metric: string | null;
    windowSize: string | null;
    windowStart: Date | null;
    avg: number | null;
    min: number | null;
    max: number | null;
    sum: number | null;
    count: number | null;
};
export type TelemetryRollupMaxAggregateOutputType = {
    id: string | null;
    logicalId: string | null;
    metric: string | null;
    windowSize: string | null;
    windowStart: Date | null;
    avg: number | null;
    min: number | null;
    max: number | null;
    sum: number | null;
    count: number | null;
};
export type TelemetryRollupCountAggregateOutputType = {
    id: number;
    logicalId: number;
    metric: number;
    windowSize: number;
    windowStart: number;
    avg: number;
    min: number;
    max: number;
    sum: number;
    count: number;
    _all: number;
};
export type TelemetryRollupAvgAggregateInputType = {
    avg?: true;
    min?: true;
    max?: true;
    sum?: true;
    count?: true;
};
export type TelemetryRollupSumAggregateInputType = {
    avg?: true;
    min?: true;
    max?: true;
    sum?: true;
    count?: true;
};
export type TelemetryRollupMinAggregateInputType = {
    id?: true;
    logicalId?: true;
    metric?: true;
    windowSize?: true;
    windowStart?: true;
    avg?: true;
    min?: true;
    max?: true;
    sum?: true;
    count?: true;
};
export type TelemetryRollupMaxAggregateInputType = {
    id?: true;
    logicalId?: true;
    metric?: true;
    windowSize?: true;
    windowStart?: true;
    avg?: true;
    min?: true;
    max?: true;
    sum?: true;
    count?: true;
};
export type TelemetryRollupCountAggregateInputType = {
    id?: true;
    logicalId?: true;
    metric?: true;
    windowSize?: true;
    windowStart?: true;
    avg?: true;
    min?: true;
    max?: true;
    sum?: true;
    count?: true;
    _all?: true;
};
export type TelemetryRollupAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which TelemetryRollup to aggregate.
     */
    where?: Prisma.TelemetryRollupWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of TelemetryRollups to fetch.
     */
    orderBy?: Prisma.TelemetryRollupOrderByWithRelationInput | Prisma.TelemetryRollupOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.TelemetryRollupWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` TelemetryRollups from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` TelemetryRollups.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned TelemetryRollups
    **/
    _count?: true | TelemetryRollupCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: TelemetryRollupAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: TelemetryRollupSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: TelemetryRollupMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: TelemetryRollupMaxAggregateInputType;
};
export type GetTelemetryRollupAggregateType<T extends TelemetryRollupAggregateArgs> = {
    [P in keyof T & keyof AggregateTelemetryRollup]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateTelemetryRollup[P]> : Prisma.GetScalarType<T[P], AggregateTelemetryRollup[P]>;
};
export type TelemetryRollupGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TelemetryRollupWhereInput;
    orderBy?: Prisma.TelemetryRollupOrderByWithAggregationInput | Prisma.TelemetryRollupOrderByWithAggregationInput[];
    by: Prisma.TelemetryRollupScalarFieldEnum[] | Prisma.TelemetryRollupScalarFieldEnum;
    having?: Prisma.TelemetryRollupScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: TelemetryRollupCountAggregateInputType | true;
    _avg?: TelemetryRollupAvgAggregateInputType;
    _sum?: TelemetryRollupSumAggregateInputType;
    _min?: TelemetryRollupMinAggregateInputType;
    _max?: TelemetryRollupMaxAggregateInputType;
};
export type TelemetryRollupGroupByOutputType = {
    id: string;
    logicalId: string;
    metric: string;
    windowSize: string;
    windowStart: Date;
    avg: number;
    min: number;
    max: number;
    sum: number;
    count: number;
    _count: TelemetryRollupCountAggregateOutputType | null;
    _avg: TelemetryRollupAvgAggregateOutputType | null;
    _sum: TelemetryRollupSumAggregateOutputType | null;
    _min: TelemetryRollupMinAggregateOutputType | null;
    _max: TelemetryRollupMaxAggregateOutputType | null;
};
type GetTelemetryRollupGroupByPayload<T extends TelemetryRollupGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<TelemetryRollupGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof TelemetryRollupGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], TelemetryRollupGroupByOutputType[P]> : Prisma.GetScalarType<T[P], TelemetryRollupGroupByOutputType[P]>;
}>>;
export type TelemetryRollupWhereInput = {
    AND?: Prisma.TelemetryRollupWhereInput | Prisma.TelemetryRollupWhereInput[];
    OR?: Prisma.TelemetryRollupWhereInput[];
    NOT?: Prisma.TelemetryRollupWhereInput | Prisma.TelemetryRollupWhereInput[];
    id?: Prisma.StringFilter<"TelemetryRollup"> | string;
    logicalId?: Prisma.StringFilter<"TelemetryRollup"> | string;
    metric?: Prisma.StringFilter<"TelemetryRollup"> | string;
    windowSize?: Prisma.StringFilter<"TelemetryRollup"> | string;
    windowStart?: Prisma.DateTimeFilter<"TelemetryRollup"> | Date | string;
    avg?: Prisma.FloatFilter<"TelemetryRollup"> | number;
    min?: Prisma.FloatFilter<"TelemetryRollup"> | number;
    max?: Prisma.FloatFilter<"TelemetryRollup"> | number;
    sum?: Prisma.FloatFilter<"TelemetryRollup"> | number;
    count?: Prisma.IntFilter<"TelemetryRollup"> | number;
};
export type TelemetryRollupOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    logicalId?: Prisma.SortOrder;
    metric?: Prisma.SortOrder;
    windowSize?: Prisma.SortOrder;
    windowStart?: Prisma.SortOrder;
    avg?: Prisma.SortOrder;
    min?: Prisma.SortOrder;
    max?: Prisma.SortOrder;
    sum?: Prisma.SortOrder;
    count?: Prisma.SortOrder;
};
export type TelemetryRollupWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    logicalId_metric_windowSize_windowStart?: Prisma.TelemetryRollupLogicalIdMetricWindowSizeWindowStartCompoundUniqueInput;
    AND?: Prisma.TelemetryRollupWhereInput | Prisma.TelemetryRollupWhereInput[];
    OR?: Prisma.TelemetryRollupWhereInput[];
    NOT?: Prisma.TelemetryRollupWhereInput | Prisma.TelemetryRollupWhereInput[];
    logicalId?: Prisma.StringFilter<"TelemetryRollup"> | string;
    metric?: Prisma.StringFilter<"TelemetryRollup"> | string;
    windowSize?: Prisma.StringFilter<"TelemetryRollup"> | string;
    windowStart?: Prisma.DateTimeFilter<"TelemetryRollup"> | Date | string;
    avg?: Prisma.FloatFilter<"TelemetryRollup"> | number;
    min?: Prisma.FloatFilter<"TelemetryRollup"> | number;
    max?: Prisma.FloatFilter<"TelemetryRollup"> | number;
    sum?: Prisma.FloatFilter<"TelemetryRollup"> | number;
    count?: Prisma.IntFilter<"TelemetryRollup"> | number;
}, "id" | "logicalId_metric_windowSize_windowStart">;
export type TelemetryRollupOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    logicalId?: Prisma.SortOrder;
    metric?: Prisma.SortOrder;
    windowSize?: Prisma.SortOrder;
    windowStart?: Prisma.SortOrder;
    avg?: Prisma.SortOrder;
    min?: Prisma.SortOrder;
    max?: Prisma.SortOrder;
    sum?: Prisma.SortOrder;
    count?: Prisma.SortOrder;
    _count?: Prisma.TelemetryRollupCountOrderByAggregateInput;
    _avg?: Prisma.TelemetryRollupAvgOrderByAggregateInput;
    _max?: Prisma.TelemetryRollupMaxOrderByAggregateInput;
    _min?: Prisma.TelemetryRollupMinOrderByAggregateInput;
    _sum?: Prisma.TelemetryRollupSumOrderByAggregateInput;
};
export type TelemetryRollupScalarWhereWithAggregatesInput = {
    AND?: Prisma.TelemetryRollupScalarWhereWithAggregatesInput | Prisma.TelemetryRollupScalarWhereWithAggregatesInput[];
    OR?: Prisma.TelemetryRollupScalarWhereWithAggregatesInput[];
    NOT?: Prisma.TelemetryRollupScalarWhereWithAggregatesInput | Prisma.TelemetryRollupScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"TelemetryRollup"> | string;
    logicalId?: Prisma.StringWithAggregatesFilter<"TelemetryRollup"> | string;
    metric?: Prisma.StringWithAggregatesFilter<"TelemetryRollup"> | string;
    windowSize?: Prisma.StringWithAggregatesFilter<"TelemetryRollup"> | string;
    windowStart?: Prisma.DateTimeWithAggregatesFilter<"TelemetryRollup"> | Date | string;
    avg?: Prisma.FloatWithAggregatesFilter<"TelemetryRollup"> | number;
    min?: Prisma.FloatWithAggregatesFilter<"TelemetryRollup"> | number;
    max?: Prisma.FloatWithAggregatesFilter<"TelemetryRollup"> | number;
    sum?: Prisma.FloatWithAggregatesFilter<"TelemetryRollup"> | number;
    count?: Prisma.IntWithAggregatesFilter<"TelemetryRollup"> | number;
};
export type TelemetryRollupCreateInput = {
    id?: string;
    logicalId: string;
    metric: string;
    windowSize: string;
    windowStart: Date | string;
    avg: number;
    min: number;
    max: number;
    sum: number;
    count: number;
};
export type TelemetryRollupUncheckedCreateInput = {
    id?: string;
    logicalId: string;
    metric: string;
    windowSize: string;
    windowStart: Date | string;
    avg: number;
    min: number;
    max: number;
    sum: number;
    count: number;
};
export type TelemetryRollupUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    logicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    metric?: Prisma.StringFieldUpdateOperationsInput | string;
    windowSize?: Prisma.StringFieldUpdateOperationsInput | string;
    windowStart?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    avg?: Prisma.FloatFieldUpdateOperationsInput | number;
    min?: Prisma.FloatFieldUpdateOperationsInput | number;
    max?: Prisma.FloatFieldUpdateOperationsInput | number;
    sum?: Prisma.FloatFieldUpdateOperationsInput | number;
    count?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type TelemetryRollupUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    logicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    metric?: Prisma.StringFieldUpdateOperationsInput | string;
    windowSize?: Prisma.StringFieldUpdateOperationsInput | string;
    windowStart?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    avg?: Prisma.FloatFieldUpdateOperationsInput | number;
    min?: Prisma.FloatFieldUpdateOperationsInput | number;
    max?: Prisma.FloatFieldUpdateOperationsInput | number;
    sum?: Prisma.FloatFieldUpdateOperationsInput | number;
    count?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type TelemetryRollupCreateManyInput = {
    id?: string;
    logicalId: string;
    metric: string;
    windowSize: string;
    windowStart: Date | string;
    avg: number;
    min: number;
    max: number;
    sum: number;
    count: number;
};
export type TelemetryRollupUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    logicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    metric?: Prisma.StringFieldUpdateOperationsInput | string;
    windowSize?: Prisma.StringFieldUpdateOperationsInput | string;
    windowStart?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    avg?: Prisma.FloatFieldUpdateOperationsInput | number;
    min?: Prisma.FloatFieldUpdateOperationsInput | number;
    max?: Prisma.FloatFieldUpdateOperationsInput | number;
    sum?: Prisma.FloatFieldUpdateOperationsInput | number;
    count?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type TelemetryRollupUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    logicalId?: Prisma.StringFieldUpdateOperationsInput | string;
    metric?: Prisma.StringFieldUpdateOperationsInput | string;
    windowSize?: Prisma.StringFieldUpdateOperationsInput | string;
    windowStart?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    avg?: Prisma.FloatFieldUpdateOperationsInput | number;
    min?: Prisma.FloatFieldUpdateOperationsInput | number;
    max?: Prisma.FloatFieldUpdateOperationsInput | number;
    sum?: Prisma.FloatFieldUpdateOperationsInput | number;
    count?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type TelemetryRollupLogicalIdMetricWindowSizeWindowStartCompoundUniqueInput = {
    logicalId: string;
    metric: string;
    windowSize: string;
    windowStart: Date | string;
};
export type TelemetryRollupCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    logicalId?: Prisma.SortOrder;
    metric?: Prisma.SortOrder;
    windowSize?: Prisma.SortOrder;
    windowStart?: Prisma.SortOrder;
    avg?: Prisma.SortOrder;
    min?: Prisma.SortOrder;
    max?: Prisma.SortOrder;
    sum?: Prisma.SortOrder;
    count?: Prisma.SortOrder;
};
export type TelemetryRollupAvgOrderByAggregateInput = {
    avg?: Prisma.SortOrder;
    min?: Prisma.SortOrder;
    max?: Prisma.SortOrder;
    sum?: Prisma.SortOrder;
    count?: Prisma.SortOrder;
};
export type TelemetryRollupMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    logicalId?: Prisma.SortOrder;
    metric?: Prisma.SortOrder;
    windowSize?: Prisma.SortOrder;
    windowStart?: Prisma.SortOrder;
    avg?: Prisma.SortOrder;
    min?: Prisma.SortOrder;
    max?: Prisma.SortOrder;
    sum?: Prisma.SortOrder;
    count?: Prisma.SortOrder;
};
export type TelemetryRollupMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    logicalId?: Prisma.SortOrder;
    metric?: Prisma.SortOrder;
    windowSize?: Prisma.SortOrder;
    windowStart?: Prisma.SortOrder;
    avg?: Prisma.SortOrder;
    min?: Prisma.SortOrder;
    max?: Prisma.SortOrder;
    sum?: Prisma.SortOrder;
    count?: Prisma.SortOrder;
};
export type TelemetryRollupSumOrderByAggregateInput = {
    avg?: Prisma.SortOrder;
    min?: Prisma.SortOrder;
    max?: Prisma.SortOrder;
    sum?: Prisma.SortOrder;
    count?: Prisma.SortOrder;
};
export type TelemetryRollupSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    logicalId?: boolean;
    metric?: boolean;
    windowSize?: boolean;
    windowStart?: boolean;
    avg?: boolean;
    min?: boolean;
    max?: boolean;
    sum?: boolean;
    count?: boolean;
}, ExtArgs["result"]["telemetryRollup"]>;
export type TelemetryRollupSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    logicalId?: boolean;
    metric?: boolean;
    windowSize?: boolean;
    windowStart?: boolean;
    avg?: boolean;
    min?: boolean;
    max?: boolean;
    sum?: boolean;
    count?: boolean;
}, ExtArgs["result"]["telemetryRollup"]>;
export type TelemetryRollupSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    logicalId?: boolean;
    metric?: boolean;
    windowSize?: boolean;
    windowStart?: boolean;
    avg?: boolean;
    min?: boolean;
    max?: boolean;
    sum?: boolean;
    count?: boolean;
}, ExtArgs["result"]["telemetryRollup"]>;
export type TelemetryRollupSelectScalar = {
    id?: boolean;
    logicalId?: boolean;
    metric?: boolean;
    windowSize?: boolean;
    windowStart?: boolean;
    avg?: boolean;
    min?: boolean;
    max?: boolean;
    sum?: boolean;
    count?: boolean;
};
export type TelemetryRollupOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "logicalId" | "metric" | "windowSize" | "windowStart" | "avg" | "min" | "max" | "sum" | "count", ExtArgs["result"]["telemetryRollup"]>;
export type $TelemetryRollupPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "TelemetryRollup";
    objects: {};
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        logicalId: string;
        metric: string;
        windowSize: string;
        windowStart: Date;
        avg: number;
        min: number;
        max: number;
        sum: number;
        count: number;
    }, ExtArgs["result"]["telemetryRollup"]>;
    composites: {};
};
export type TelemetryRollupGetPayload<S extends boolean | null | undefined | TelemetryRollupDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$TelemetryRollupPayload, S>;
export type TelemetryRollupCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<TelemetryRollupFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: TelemetryRollupCountAggregateInputType | true;
};
export interface TelemetryRollupDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['TelemetryRollup'];
        meta: {
            name: 'TelemetryRollup';
        };
    };
    /**
     * Find zero or one TelemetryRollup that matches the filter.
     * @param {TelemetryRollupFindUniqueArgs} args - Arguments to find a TelemetryRollup
     * @example
     * // Get one TelemetryRollup
     * const telemetryRollup = await prisma.telemetryRollup.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TelemetryRollupFindUniqueArgs>(args: Prisma.SelectSubset<T, TelemetryRollupFindUniqueArgs<ExtArgs>>): Prisma.Prisma__TelemetryRollupClient<runtime.Types.Result.GetResult<Prisma.$TelemetryRollupPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one TelemetryRollup that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TelemetryRollupFindUniqueOrThrowArgs} args - Arguments to find a TelemetryRollup
     * @example
     * // Get one TelemetryRollup
     * const telemetryRollup = await prisma.telemetryRollup.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TelemetryRollupFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, TelemetryRollupFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__TelemetryRollupClient<runtime.Types.Result.GetResult<Prisma.$TelemetryRollupPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first TelemetryRollup that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TelemetryRollupFindFirstArgs} args - Arguments to find a TelemetryRollup
     * @example
     * // Get one TelemetryRollup
     * const telemetryRollup = await prisma.telemetryRollup.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TelemetryRollupFindFirstArgs>(args?: Prisma.SelectSubset<T, TelemetryRollupFindFirstArgs<ExtArgs>>): Prisma.Prisma__TelemetryRollupClient<runtime.Types.Result.GetResult<Prisma.$TelemetryRollupPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first TelemetryRollup that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TelemetryRollupFindFirstOrThrowArgs} args - Arguments to find a TelemetryRollup
     * @example
     * // Get one TelemetryRollup
     * const telemetryRollup = await prisma.telemetryRollup.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TelemetryRollupFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, TelemetryRollupFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__TelemetryRollupClient<runtime.Types.Result.GetResult<Prisma.$TelemetryRollupPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more TelemetryRollups that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TelemetryRollupFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TelemetryRollups
     * const telemetryRollups = await prisma.telemetryRollup.findMany()
     *
     * // Get first 10 TelemetryRollups
     * const telemetryRollups = await prisma.telemetryRollup.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const telemetryRollupWithIdOnly = await prisma.telemetryRollup.findMany({ select: { id: true } })
     *
     */
    findMany<T extends TelemetryRollupFindManyArgs>(args?: Prisma.SelectSubset<T, TelemetryRollupFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TelemetryRollupPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a TelemetryRollup.
     * @param {TelemetryRollupCreateArgs} args - Arguments to create a TelemetryRollup.
     * @example
     * // Create one TelemetryRollup
     * const TelemetryRollup = await prisma.telemetryRollup.create({
     *   data: {
     *     // ... data to create a TelemetryRollup
     *   }
     * })
     *
     */
    create<T extends TelemetryRollupCreateArgs>(args: Prisma.SelectSubset<T, TelemetryRollupCreateArgs<ExtArgs>>): Prisma.Prisma__TelemetryRollupClient<runtime.Types.Result.GetResult<Prisma.$TelemetryRollupPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many TelemetryRollups.
     * @param {TelemetryRollupCreateManyArgs} args - Arguments to create many TelemetryRollups.
     * @example
     * // Create many TelemetryRollups
     * const telemetryRollup = await prisma.telemetryRollup.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends TelemetryRollupCreateManyArgs>(args?: Prisma.SelectSubset<T, TelemetryRollupCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many TelemetryRollups and returns the data saved in the database.
     * @param {TelemetryRollupCreateManyAndReturnArgs} args - Arguments to create many TelemetryRollups.
     * @example
     * // Create many TelemetryRollups
     * const telemetryRollup = await prisma.telemetryRollup.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many TelemetryRollups and only return the `id`
     * const telemetryRollupWithIdOnly = await prisma.telemetryRollup.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends TelemetryRollupCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, TelemetryRollupCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TelemetryRollupPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a TelemetryRollup.
     * @param {TelemetryRollupDeleteArgs} args - Arguments to delete one TelemetryRollup.
     * @example
     * // Delete one TelemetryRollup
     * const TelemetryRollup = await prisma.telemetryRollup.delete({
     *   where: {
     *     // ... filter to delete one TelemetryRollup
     *   }
     * })
     *
     */
    delete<T extends TelemetryRollupDeleteArgs>(args: Prisma.SelectSubset<T, TelemetryRollupDeleteArgs<ExtArgs>>): Prisma.Prisma__TelemetryRollupClient<runtime.Types.Result.GetResult<Prisma.$TelemetryRollupPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one TelemetryRollup.
     * @param {TelemetryRollupUpdateArgs} args - Arguments to update one TelemetryRollup.
     * @example
     * // Update one TelemetryRollup
     * const telemetryRollup = await prisma.telemetryRollup.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends TelemetryRollupUpdateArgs>(args: Prisma.SelectSubset<T, TelemetryRollupUpdateArgs<ExtArgs>>): Prisma.Prisma__TelemetryRollupClient<runtime.Types.Result.GetResult<Prisma.$TelemetryRollupPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more TelemetryRollups.
     * @param {TelemetryRollupDeleteManyArgs} args - Arguments to filter TelemetryRollups to delete.
     * @example
     * // Delete a few TelemetryRollups
     * const { count } = await prisma.telemetryRollup.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends TelemetryRollupDeleteManyArgs>(args?: Prisma.SelectSubset<T, TelemetryRollupDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more TelemetryRollups.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TelemetryRollupUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TelemetryRollups
     * const telemetryRollup = await prisma.telemetryRollup.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends TelemetryRollupUpdateManyArgs>(args: Prisma.SelectSubset<T, TelemetryRollupUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more TelemetryRollups and returns the data updated in the database.
     * @param {TelemetryRollupUpdateManyAndReturnArgs} args - Arguments to update many TelemetryRollups.
     * @example
     * // Update many TelemetryRollups
     * const telemetryRollup = await prisma.telemetryRollup.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more TelemetryRollups and only return the `id`
     * const telemetryRollupWithIdOnly = await prisma.telemetryRollup.updateManyAndReturn({
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
    updateManyAndReturn<T extends TelemetryRollupUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, TelemetryRollupUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TelemetryRollupPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one TelemetryRollup.
     * @param {TelemetryRollupUpsertArgs} args - Arguments to update or create a TelemetryRollup.
     * @example
     * // Update or create a TelemetryRollup
     * const telemetryRollup = await prisma.telemetryRollup.upsert({
     *   create: {
     *     // ... data to create a TelemetryRollup
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TelemetryRollup we want to update
     *   }
     * })
     */
    upsert<T extends TelemetryRollupUpsertArgs>(args: Prisma.SelectSubset<T, TelemetryRollupUpsertArgs<ExtArgs>>): Prisma.Prisma__TelemetryRollupClient<runtime.Types.Result.GetResult<Prisma.$TelemetryRollupPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of TelemetryRollups.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TelemetryRollupCountArgs} args - Arguments to filter TelemetryRollups to count.
     * @example
     * // Count the number of TelemetryRollups
     * const count = await prisma.telemetryRollup.count({
     *   where: {
     *     // ... the filter for the TelemetryRollups we want to count
     *   }
     * })
    **/
    count<T extends TelemetryRollupCountArgs>(args?: Prisma.Subset<T, TelemetryRollupCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], TelemetryRollupCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a TelemetryRollup.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TelemetryRollupAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends TelemetryRollupAggregateArgs>(args: Prisma.Subset<T, TelemetryRollupAggregateArgs>): Prisma.PrismaPromise<GetTelemetryRollupAggregateType<T>>;
    /**
     * Group by TelemetryRollup.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TelemetryRollupGroupByArgs} args - Group by arguments.
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
    groupBy<T extends TelemetryRollupGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: TelemetryRollupGroupByArgs['orderBy'];
    } : {
        orderBy?: TelemetryRollupGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, TelemetryRollupGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTelemetryRollupGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the TelemetryRollup model
     */
    readonly fields: TelemetryRollupFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for TelemetryRollup.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__TelemetryRollupClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
 * Fields of the TelemetryRollup model
 */
export interface TelemetryRollupFieldRefs {
    readonly id: Prisma.FieldRef<"TelemetryRollup", 'String'>;
    readonly logicalId: Prisma.FieldRef<"TelemetryRollup", 'String'>;
    readonly metric: Prisma.FieldRef<"TelemetryRollup", 'String'>;
    readonly windowSize: Prisma.FieldRef<"TelemetryRollup", 'String'>;
    readonly windowStart: Prisma.FieldRef<"TelemetryRollup", 'DateTime'>;
    readonly avg: Prisma.FieldRef<"TelemetryRollup", 'Float'>;
    readonly min: Prisma.FieldRef<"TelemetryRollup", 'Float'>;
    readonly max: Prisma.FieldRef<"TelemetryRollup", 'Float'>;
    readonly sum: Prisma.FieldRef<"TelemetryRollup", 'Float'>;
    readonly count: Prisma.FieldRef<"TelemetryRollup", 'Int'>;
}
/**
 * TelemetryRollup findUnique
 */
export type TelemetryRollupFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TelemetryRollup
     */
    select?: Prisma.TelemetryRollupSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TelemetryRollup
     */
    omit?: Prisma.TelemetryRollupOmit<ExtArgs> | null;
    /**
     * Filter, which TelemetryRollup to fetch.
     */
    where: Prisma.TelemetryRollupWhereUniqueInput;
};
/**
 * TelemetryRollup findUniqueOrThrow
 */
export type TelemetryRollupFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TelemetryRollup
     */
    select?: Prisma.TelemetryRollupSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TelemetryRollup
     */
    omit?: Prisma.TelemetryRollupOmit<ExtArgs> | null;
    /**
     * Filter, which TelemetryRollup to fetch.
     */
    where: Prisma.TelemetryRollupWhereUniqueInput;
};
/**
 * TelemetryRollup findFirst
 */
export type TelemetryRollupFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TelemetryRollup
     */
    select?: Prisma.TelemetryRollupSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TelemetryRollup
     */
    omit?: Prisma.TelemetryRollupOmit<ExtArgs> | null;
    /**
     * Filter, which TelemetryRollup to fetch.
     */
    where?: Prisma.TelemetryRollupWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of TelemetryRollups to fetch.
     */
    orderBy?: Prisma.TelemetryRollupOrderByWithRelationInput | Prisma.TelemetryRollupOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for TelemetryRollups.
     */
    cursor?: Prisma.TelemetryRollupWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` TelemetryRollups from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` TelemetryRollups.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of TelemetryRollups.
     */
    distinct?: Prisma.TelemetryRollupScalarFieldEnum | Prisma.TelemetryRollupScalarFieldEnum[];
};
/**
 * TelemetryRollup findFirstOrThrow
 */
export type TelemetryRollupFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TelemetryRollup
     */
    select?: Prisma.TelemetryRollupSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TelemetryRollup
     */
    omit?: Prisma.TelemetryRollupOmit<ExtArgs> | null;
    /**
     * Filter, which TelemetryRollup to fetch.
     */
    where?: Prisma.TelemetryRollupWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of TelemetryRollups to fetch.
     */
    orderBy?: Prisma.TelemetryRollupOrderByWithRelationInput | Prisma.TelemetryRollupOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for TelemetryRollups.
     */
    cursor?: Prisma.TelemetryRollupWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` TelemetryRollups from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` TelemetryRollups.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of TelemetryRollups.
     */
    distinct?: Prisma.TelemetryRollupScalarFieldEnum | Prisma.TelemetryRollupScalarFieldEnum[];
};
/**
 * TelemetryRollup findMany
 */
export type TelemetryRollupFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TelemetryRollup
     */
    select?: Prisma.TelemetryRollupSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TelemetryRollup
     */
    omit?: Prisma.TelemetryRollupOmit<ExtArgs> | null;
    /**
     * Filter, which TelemetryRollups to fetch.
     */
    where?: Prisma.TelemetryRollupWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of TelemetryRollups to fetch.
     */
    orderBy?: Prisma.TelemetryRollupOrderByWithRelationInput | Prisma.TelemetryRollupOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing TelemetryRollups.
     */
    cursor?: Prisma.TelemetryRollupWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` TelemetryRollups from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` TelemetryRollups.
     */
    skip?: number;
    distinct?: Prisma.TelemetryRollupScalarFieldEnum | Prisma.TelemetryRollupScalarFieldEnum[];
};
/**
 * TelemetryRollup create
 */
export type TelemetryRollupCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TelemetryRollup
     */
    select?: Prisma.TelemetryRollupSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TelemetryRollup
     */
    omit?: Prisma.TelemetryRollupOmit<ExtArgs> | null;
    /**
     * The data needed to create a TelemetryRollup.
     */
    data: Prisma.XOR<Prisma.TelemetryRollupCreateInput, Prisma.TelemetryRollupUncheckedCreateInput>;
};
/**
 * TelemetryRollup createMany
 */
export type TelemetryRollupCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many TelemetryRollups.
     */
    data: Prisma.TelemetryRollupCreateManyInput | Prisma.TelemetryRollupCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * TelemetryRollup createManyAndReturn
 */
export type TelemetryRollupCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TelemetryRollup
     */
    select?: Prisma.TelemetryRollupSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the TelemetryRollup
     */
    omit?: Prisma.TelemetryRollupOmit<ExtArgs> | null;
    /**
     * The data used to create many TelemetryRollups.
     */
    data: Prisma.TelemetryRollupCreateManyInput | Prisma.TelemetryRollupCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * TelemetryRollup update
 */
export type TelemetryRollupUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TelemetryRollup
     */
    select?: Prisma.TelemetryRollupSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TelemetryRollup
     */
    omit?: Prisma.TelemetryRollupOmit<ExtArgs> | null;
    /**
     * The data needed to update a TelemetryRollup.
     */
    data: Prisma.XOR<Prisma.TelemetryRollupUpdateInput, Prisma.TelemetryRollupUncheckedUpdateInput>;
    /**
     * Choose, which TelemetryRollup to update.
     */
    where: Prisma.TelemetryRollupWhereUniqueInput;
};
/**
 * TelemetryRollup updateMany
 */
export type TelemetryRollupUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update TelemetryRollups.
     */
    data: Prisma.XOR<Prisma.TelemetryRollupUpdateManyMutationInput, Prisma.TelemetryRollupUncheckedUpdateManyInput>;
    /**
     * Filter which TelemetryRollups to update
     */
    where?: Prisma.TelemetryRollupWhereInput;
    /**
     * Limit how many TelemetryRollups to update.
     */
    limit?: number;
};
/**
 * TelemetryRollup updateManyAndReturn
 */
export type TelemetryRollupUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TelemetryRollup
     */
    select?: Prisma.TelemetryRollupSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the TelemetryRollup
     */
    omit?: Prisma.TelemetryRollupOmit<ExtArgs> | null;
    /**
     * The data used to update TelemetryRollups.
     */
    data: Prisma.XOR<Prisma.TelemetryRollupUpdateManyMutationInput, Prisma.TelemetryRollupUncheckedUpdateManyInput>;
    /**
     * Filter which TelemetryRollups to update
     */
    where?: Prisma.TelemetryRollupWhereInput;
    /**
     * Limit how many TelemetryRollups to update.
     */
    limit?: number;
};
/**
 * TelemetryRollup upsert
 */
export type TelemetryRollupUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TelemetryRollup
     */
    select?: Prisma.TelemetryRollupSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TelemetryRollup
     */
    omit?: Prisma.TelemetryRollupOmit<ExtArgs> | null;
    /**
     * The filter to search for the TelemetryRollup to update in case it exists.
     */
    where: Prisma.TelemetryRollupWhereUniqueInput;
    /**
     * In case the TelemetryRollup found by the `where` argument doesn't exist, create a new TelemetryRollup with this data.
     */
    create: Prisma.XOR<Prisma.TelemetryRollupCreateInput, Prisma.TelemetryRollupUncheckedCreateInput>;
    /**
     * In case the TelemetryRollup was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.TelemetryRollupUpdateInput, Prisma.TelemetryRollupUncheckedUpdateInput>;
};
/**
 * TelemetryRollup delete
 */
export type TelemetryRollupDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TelemetryRollup
     */
    select?: Prisma.TelemetryRollupSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TelemetryRollup
     */
    omit?: Prisma.TelemetryRollupOmit<ExtArgs> | null;
    /**
     * Filter which TelemetryRollup to delete.
     */
    where: Prisma.TelemetryRollupWhereUniqueInput;
};
/**
 * TelemetryRollup deleteMany
 */
export type TelemetryRollupDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which TelemetryRollups to delete
     */
    where?: Prisma.TelemetryRollupWhereInput;
    /**
     * Limit how many TelemetryRollups to delete.
     */
    limit?: number;
};
/**
 * TelemetryRollup without action
 */
export type TelemetryRollupDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TelemetryRollup
     */
    select?: Prisma.TelemetryRollupSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TelemetryRollup
     */
    omit?: Prisma.TelemetryRollupOmit<ExtArgs> | null;
};
export {};
//# sourceMappingURL=TelemetryRollup.d.ts.map