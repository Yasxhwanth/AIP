import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
/**
 * Model DecisionRule
 *
 */
export type DecisionRuleModel = runtime.Types.Result.DefaultSelection<Prisma.$DecisionRulePayload>;
export type AggregateDecisionRule = {
    _count: DecisionRuleCountAggregateOutputType | null;
    _avg: DecisionRuleAvgAggregateOutputType | null;
    _sum: DecisionRuleSumAggregateOutputType | null;
    _min: DecisionRuleMinAggregateOutputType | null;
    _max: DecisionRuleMaxAggregateOutputType | null;
};
export type DecisionRuleAvgAggregateOutputType = {
    priority: number | null;
    confidenceThreshold: number | null;
};
export type DecisionRuleSumAggregateOutputType = {
    priority: number | null;
    confidenceThreshold: number | null;
};
export type DecisionRuleMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    entityTypeId: string | null;
    logicOperator: string | null;
    priority: number | null;
    autoExecute: boolean | null;
    confidenceThreshold: number | null;
    enabled: boolean | null;
    createdAt: Date | null;
};
export type DecisionRuleMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    entityTypeId: string | null;
    logicOperator: string | null;
    priority: number | null;
    autoExecute: boolean | null;
    confidenceThreshold: number | null;
    enabled: boolean | null;
    createdAt: Date | null;
};
export type DecisionRuleCountAggregateOutputType = {
    id: number;
    name: number;
    entityTypeId: number;
    conditions: number;
    logicOperator: number;
    priority: number;
    autoExecute: number;
    confidenceThreshold: number;
    enabled: number;
    createdAt: number;
    _all: number;
};
export type DecisionRuleAvgAggregateInputType = {
    priority?: true;
    confidenceThreshold?: true;
};
export type DecisionRuleSumAggregateInputType = {
    priority?: true;
    confidenceThreshold?: true;
};
export type DecisionRuleMinAggregateInputType = {
    id?: true;
    name?: true;
    entityTypeId?: true;
    logicOperator?: true;
    priority?: true;
    autoExecute?: true;
    confidenceThreshold?: true;
    enabled?: true;
    createdAt?: true;
};
export type DecisionRuleMaxAggregateInputType = {
    id?: true;
    name?: true;
    entityTypeId?: true;
    logicOperator?: true;
    priority?: true;
    autoExecute?: true;
    confidenceThreshold?: true;
    enabled?: true;
    createdAt?: true;
};
export type DecisionRuleCountAggregateInputType = {
    id?: true;
    name?: true;
    entityTypeId?: true;
    conditions?: true;
    logicOperator?: true;
    priority?: true;
    autoExecute?: true;
    confidenceThreshold?: true;
    enabled?: true;
    createdAt?: true;
    _all?: true;
};
export type DecisionRuleAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which DecisionRule to aggregate.
     */
    where?: Prisma.DecisionRuleWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DecisionRules to fetch.
     */
    orderBy?: Prisma.DecisionRuleOrderByWithRelationInput | Prisma.DecisionRuleOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.DecisionRuleWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DecisionRules from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DecisionRules.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned DecisionRules
    **/
    _count?: true | DecisionRuleCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: DecisionRuleAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: DecisionRuleSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: DecisionRuleMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: DecisionRuleMaxAggregateInputType;
};
export type GetDecisionRuleAggregateType<T extends DecisionRuleAggregateArgs> = {
    [P in keyof T & keyof AggregateDecisionRule]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateDecisionRule[P]> : Prisma.GetScalarType<T[P], AggregateDecisionRule[P]>;
};
export type DecisionRuleGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DecisionRuleWhereInput;
    orderBy?: Prisma.DecisionRuleOrderByWithAggregationInput | Prisma.DecisionRuleOrderByWithAggregationInput[];
    by: Prisma.DecisionRuleScalarFieldEnum[] | Prisma.DecisionRuleScalarFieldEnum;
    having?: Prisma.DecisionRuleScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: DecisionRuleCountAggregateInputType | true;
    _avg?: DecisionRuleAvgAggregateInputType;
    _sum?: DecisionRuleSumAggregateInputType;
    _min?: DecisionRuleMinAggregateInputType;
    _max?: DecisionRuleMaxAggregateInputType;
};
export type DecisionRuleGroupByOutputType = {
    id: string;
    name: string;
    entityTypeId: string;
    conditions: runtime.JsonValue;
    logicOperator: string;
    priority: number;
    autoExecute: boolean;
    confidenceThreshold: number | null;
    enabled: boolean;
    createdAt: Date;
    _count: DecisionRuleCountAggregateOutputType | null;
    _avg: DecisionRuleAvgAggregateOutputType | null;
    _sum: DecisionRuleSumAggregateOutputType | null;
    _min: DecisionRuleMinAggregateOutputType | null;
    _max: DecisionRuleMaxAggregateOutputType | null;
};
type GetDecisionRuleGroupByPayload<T extends DecisionRuleGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<DecisionRuleGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof DecisionRuleGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], DecisionRuleGroupByOutputType[P]> : Prisma.GetScalarType<T[P], DecisionRuleGroupByOutputType[P]>;
}>>;
export type DecisionRuleWhereInput = {
    AND?: Prisma.DecisionRuleWhereInput | Prisma.DecisionRuleWhereInput[];
    OR?: Prisma.DecisionRuleWhereInput[];
    NOT?: Prisma.DecisionRuleWhereInput | Prisma.DecisionRuleWhereInput[];
    id?: Prisma.StringFilter<"DecisionRule"> | string;
    name?: Prisma.StringFilter<"DecisionRule"> | string;
    entityTypeId?: Prisma.StringFilter<"DecisionRule"> | string;
    conditions?: Prisma.JsonFilter<"DecisionRule">;
    logicOperator?: Prisma.StringFilter<"DecisionRule"> | string;
    priority?: Prisma.IntFilter<"DecisionRule"> | number;
    autoExecute?: Prisma.BoolFilter<"DecisionRule"> | boolean;
    confidenceThreshold?: Prisma.FloatNullableFilter<"DecisionRule"> | number | null;
    enabled?: Prisma.BoolFilter<"DecisionRule"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"DecisionRule"> | Date | string;
    entityType?: Prisma.XOR<Prisma.EntityTypeScalarRelationFilter, Prisma.EntityTypeWhereInput>;
    executionPlans?: Prisma.ExecutionPlanListRelationFilter;
    decisionLogs?: Prisma.DecisionLogListRelationFilter;
};
export type DecisionRuleOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    entityTypeId?: Prisma.SortOrder;
    conditions?: Prisma.SortOrder;
    logicOperator?: Prisma.SortOrder;
    priority?: Prisma.SortOrder;
    autoExecute?: Prisma.SortOrder;
    confidenceThreshold?: Prisma.SortOrderInput | Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    entityType?: Prisma.EntityTypeOrderByWithRelationInput;
    executionPlans?: Prisma.ExecutionPlanOrderByRelationAggregateInput;
    decisionLogs?: Prisma.DecisionLogOrderByRelationAggregateInput;
};
export type DecisionRuleWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    name?: string;
    AND?: Prisma.DecisionRuleWhereInput | Prisma.DecisionRuleWhereInput[];
    OR?: Prisma.DecisionRuleWhereInput[];
    NOT?: Prisma.DecisionRuleWhereInput | Prisma.DecisionRuleWhereInput[];
    entityTypeId?: Prisma.StringFilter<"DecisionRule"> | string;
    conditions?: Prisma.JsonFilter<"DecisionRule">;
    logicOperator?: Prisma.StringFilter<"DecisionRule"> | string;
    priority?: Prisma.IntFilter<"DecisionRule"> | number;
    autoExecute?: Prisma.BoolFilter<"DecisionRule"> | boolean;
    confidenceThreshold?: Prisma.FloatNullableFilter<"DecisionRule"> | number | null;
    enabled?: Prisma.BoolFilter<"DecisionRule"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"DecisionRule"> | Date | string;
    entityType?: Prisma.XOR<Prisma.EntityTypeScalarRelationFilter, Prisma.EntityTypeWhereInput>;
    executionPlans?: Prisma.ExecutionPlanListRelationFilter;
    decisionLogs?: Prisma.DecisionLogListRelationFilter;
}, "id" | "name">;
export type DecisionRuleOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    entityTypeId?: Prisma.SortOrder;
    conditions?: Prisma.SortOrder;
    logicOperator?: Prisma.SortOrder;
    priority?: Prisma.SortOrder;
    autoExecute?: Prisma.SortOrder;
    confidenceThreshold?: Prisma.SortOrderInput | Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.DecisionRuleCountOrderByAggregateInput;
    _avg?: Prisma.DecisionRuleAvgOrderByAggregateInput;
    _max?: Prisma.DecisionRuleMaxOrderByAggregateInput;
    _min?: Prisma.DecisionRuleMinOrderByAggregateInput;
    _sum?: Prisma.DecisionRuleSumOrderByAggregateInput;
};
export type DecisionRuleScalarWhereWithAggregatesInput = {
    AND?: Prisma.DecisionRuleScalarWhereWithAggregatesInput | Prisma.DecisionRuleScalarWhereWithAggregatesInput[];
    OR?: Prisma.DecisionRuleScalarWhereWithAggregatesInput[];
    NOT?: Prisma.DecisionRuleScalarWhereWithAggregatesInput | Prisma.DecisionRuleScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"DecisionRule"> | string;
    name?: Prisma.StringWithAggregatesFilter<"DecisionRule"> | string;
    entityTypeId?: Prisma.StringWithAggregatesFilter<"DecisionRule"> | string;
    conditions?: Prisma.JsonWithAggregatesFilter<"DecisionRule">;
    logicOperator?: Prisma.StringWithAggregatesFilter<"DecisionRule"> | string;
    priority?: Prisma.IntWithAggregatesFilter<"DecisionRule"> | number;
    autoExecute?: Prisma.BoolWithAggregatesFilter<"DecisionRule"> | boolean;
    confidenceThreshold?: Prisma.FloatNullableWithAggregatesFilter<"DecisionRule"> | number | null;
    enabled?: Prisma.BoolWithAggregatesFilter<"DecisionRule"> | boolean;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"DecisionRule"> | Date | string;
};
export type DecisionRuleCreateInput = {
    id?: string;
    name: string;
    conditions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicOperator?: string;
    priority?: number;
    autoExecute?: boolean;
    confidenceThreshold?: number | null;
    enabled?: boolean;
    createdAt?: Date | string;
    entityType: Prisma.EntityTypeCreateNestedOneWithoutDecisionRulesInput;
    executionPlans?: Prisma.ExecutionPlanCreateNestedManyWithoutDecisionRuleInput;
    decisionLogs?: Prisma.DecisionLogCreateNestedManyWithoutDecisionRuleInput;
};
export type DecisionRuleUncheckedCreateInput = {
    id?: string;
    name: string;
    entityTypeId: string;
    conditions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicOperator?: string;
    priority?: number;
    autoExecute?: boolean;
    confidenceThreshold?: number | null;
    enabled?: boolean;
    createdAt?: Date | string;
    executionPlans?: Prisma.ExecutionPlanUncheckedCreateNestedManyWithoutDecisionRuleInput;
    decisionLogs?: Prisma.DecisionLogUncheckedCreateNestedManyWithoutDecisionRuleInput;
};
export type DecisionRuleUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    conditions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicOperator?: Prisma.StringFieldUpdateOperationsInput | string;
    priority?: Prisma.IntFieldUpdateOperationsInput | number;
    autoExecute?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    confidenceThreshold?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    entityType?: Prisma.EntityTypeUpdateOneRequiredWithoutDecisionRulesNestedInput;
    executionPlans?: Prisma.ExecutionPlanUpdateManyWithoutDecisionRuleNestedInput;
    decisionLogs?: Prisma.DecisionLogUpdateManyWithoutDecisionRuleNestedInput;
};
export type DecisionRuleUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    entityTypeId?: Prisma.StringFieldUpdateOperationsInput | string;
    conditions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicOperator?: Prisma.StringFieldUpdateOperationsInput | string;
    priority?: Prisma.IntFieldUpdateOperationsInput | number;
    autoExecute?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    confidenceThreshold?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    executionPlans?: Prisma.ExecutionPlanUncheckedUpdateManyWithoutDecisionRuleNestedInput;
    decisionLogs?: Prisma.DecisionLogUncheckedUpdateManyWithoutDecisionRuleNestedInput;
};
export type DecisionRuleCreateManyInput = {
    id?: string;
    name: string;
    entityTypeId: string;
    conditions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicOperator?: string;
    priority?: number;
    autoExecute?: boolean;
    confidenceThreshold?: number | null;
    enabled?: boolean;
    createdAt?: Date | string;
};
export type DecisionRuleUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    conditions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicOperator?: Prisma.StringFieldUpdateOperationsInput | string;
    priority?: Prisma.IntFieldUpdateOperationsInput | number;
    autoExecute?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    confidenceThreshold?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DecisionRuleUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    entityTypeId?: Prisma.StringFieldUpdateOperationsInput | string;
    conditions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicOperator?: Prisma.StringFieldUpdateOperationsInput | string;
    priority?: Prisma.IntFieldUpdateOperationsInput | number;
    autoExecute?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    confidenceThreshold?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DecisionRuleListRelationFilter = {
    every?: Prisma.DecisionRuleWhereInput;
    some?: Prisma.DecisionRuleWhereInput;
    none?: Prisma.DecisionRuleWhereInput;
};
export type DecisionRuleOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type DecisionRuleCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    entityTypeId?: Prisma.SortOrder;
    conditions?: Prisma.SortOrder;
    logicOperator?: Prisma.SortOrder;
    priority?: Prisma.SortOrder;
    autoExecute?: Prisma.SortOrder;
    confidenceThreshold?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type DecisionRuleAvgOrderByAggregateInput = {
    priority?: Prisma.SortOrder;
    confidenceThreshold?: Prisma.SortOrder;
};
export type DecisionRuleMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    entityTypeId?: Prisma.SortOrder;
    logicOperator?: Prisma.SortOrder;
    priority?: Prisma.SortOrder;
    autoExecute?: Prisma.SortOrder;
    confidenceThreshold?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type DecisionRuleMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    entityTypeId?: Prisma.SortOrder;
    logicOperator?: Prisma.SortOrder;
    priority?: Prisma.SortOrder;
    autoExecute?: Prisma.SortOrder;
    confidenceThreshold?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type DecisionRuleSumOrderByAggregateInput = {
    priority?: Prisma.SortOrder;
    confidenceThreshold?: Prisma.SortOrder;
};
export type DecisionRuleScalarRelationFilter = {
    is?: Prisma.DecisionRuleWhereInput;
    isNot?: Prisma.DecisionRuleWhereInput;
};
export type DecisionRuleCreateNestedManyWithoutEntityTypeInput = {
    create?: Prisma.XOR<Prisma.DecisionRuleCreateWithoutEntityTypeInput, Prisma.DecisionRuleUncheckedCreateWithoutEntityTypeInput> | Prisma.DecisionRuleCreateWithoutEntityTypeInput[] | Prisma.DecisionRuleUncheckedCreateWithoutEntityTypeInput[];
    connectOrCreate?: Prisma.DecisionRuleCreateOrConnectWithoutEntityTypeInput | Prisma.DecisionRuleCreateOrConnectWithoutEntityTypeInput[];
    createMany?: Prisma.DecisionRuleCreateManyEntityTypeInputEnvelope;
    connect?: Prisma.DecisionRuleWhereUniqueInput | Prisma.DecisionRuleWhereUniqueInput[];
};
export type DecisionRuleUncheckedCreateNestedManyWithoutEntityTypeInput = {
    create?: Prisma.XOR<Prisma.DecisionRuleCreateWithoutEntityTypeInput, Prisma.DecisionRuleUncheckedCreateWithoutEntityTypeInput> | Prisma.DecisionRuleCreateWithoutEntityTypeInput[] | Prisma.DecisionRuleUncheckedCreateWithoutEntityTypeInput[];
    connectOrCreate?: Prisma.DecisionRuleCreateOrConnectWithoutEntityTypeInput | Prisma.DecisionRuleCreateOrConnectWithoutEntityTypeInput[];
    createMany?: Prisma.DecisionRuleCreateManyEntityTypeInputEnvelope;
    connect?: Prisma.DecisionRuleWhereUniqueInput | Prisma.DecisionRuleWhereUniqueInput[];
};
export type DecisionRuleUpdateManyWithoutEntityTypeNestedInput = {
    create?: Prisma.XOR<Prisma.DecisionRuleCreateWithoutEntityTypeInput, Prisma.DecisionRuleUncheckedCreateWithoutEntityTypeInput> | Prisma.DecisionRuleCreateWithoutEntityTypeInput[] | Prisma.DecisionRuleUncheckedCreateWithoutEntityTypeInput[];
    connectOrCreate?: Prisma.DecisionRuleCreateOrConnectWithoutEntityTypeInput | Prisma.DecisionRuleCreateOrConnectWithoutEntityTypeInput[];
    upsert?: Prisma.DecisionRuleUpsertWithWhereUniqueWithoutEntityTypeInput | Prisma.DecisionRuleUpsertWithWhereUniqueWithoutEntityTypeInput[];
    createMany?: Prisma.DecisionRuleCreateManyEntityTypeInputEnvelope;
    set?: Prisma.DecisionRuleWhereUniqueInput | Prisma.DecisionRuleWhereUniqueInput[];
    disconnect?: Prisma.DecisionRuleWhereUniqueInput | Prisma.DecisionRuleWhereUniqueInput[];
    delete?: Prisma.DecisionRuleWhereUniqueInput | Prisma.DecisionRuleWhereUniqueInput[];
    connect?: Prisma.DecisionRuleWhereUniqueInput | Prisma.DecisionRuleWhereUniqueInput[];
    update?: Prisma.DecisionRuleUpdateWithWhereUniqueWithoutEntityTypeInput | Prisma.DecisionRuleUpdateWithWhereUniqueWithoutEntityTypeInput[];
    updateMany?: Prisma.DecisionRuleUpdateManyWithWhereWithoutEntityTypeInput | Prisma.DecisionRuleUpdateManyWithWhereWithoutEntityTypeInput[];
    deleteMany?: Prisma.DecisionRuleScalarWhereInput | Prisma.DecisionRuleScalarWhereInput[];
};
export type DecisionRuleUncheckedUpdateManyWithoutEntityTypeNestedInput = {
    create?: Prisma.XOR<Prisma.DecisionRuleCreateWithoutEntityTypeInput, Prisma.DecisionRuleUncheckedCreateWithoutEntityTypeInput> | Prisma.DecisionRuleCreateWithoutEntityTypeInput[] | Prisma.DecisionRuleUncheckedCreateWithoutEntityTypeInput[];
    connectOrCreate?: Prisma.DecisionRuleCreateOrConnectWithoutEntityTypeInput | Prisma.DecisionRuleCreateOrConnectWithoutEntityTypeInput[];
    upsert?: Prisma.DecisionRuleUpsertWithWhereUniqueWithoutEntityTypeInput | Prisma.DecisionRuleUpsertWithWhereUniqueWithoutEntityTypeInput[];
    createMany?: Prisma.DecisionRuleCreateManyEntityTypeInputEnvelope;
    set?: Prisma.DecisionRuleWhereUniqueInput | Prisma.DecisionRuleWhereUniqueInput[];
    disconnect?: Prisma.DecisionRuleWhereUniqueInput | Prisma.DecisionRuleWhereUniqueInput[];
    delete?: Prisma.DecisionRuleWhereUniqueInput | Prisma.DecisionRuleWhereUniqueInput[];
    connect?: Prisma.DecisionRuleWhereUniqueInput | Prisma.DecisionRuleWhereUniqueInput[];
    update?: Prisma.DecisionRuleUpdateWithWhereUniqueWithoutEntityTypeInput | Prisma.DecisionRuleUpdateWithWhereUniqueWithoutEntityTypeInput[];
    updateMany?: Prisma.DecisionRuleUpdateManyWithWhereWithoutEntityTypeInput | Prisma.DecisionRuleUpdateManyWithWhereWithoutEntityTypeInput[];
    deleteMany?: Prisma.DecisionRuleScalarWhereInput | Prisma.DecisionRuleScalarWhereInput[];
};
export type DecisionRuleCreateNestedOneWithoutExecutionPlansInput = {
    create?: Prisma.XOR<Prisma.DecisionRuleCreateWithoutExecutionPlansInput, Prisma.DecisionRuleUncheckedCreateWithoutExecutionPlansInput>;
    connectOrCreate?: Prisma.DecisionRuleCreateOrConnectWithoutExecutionPlansInput;
    connect?: Prisma.DecisionRuleWhereUniqueInput;
};
export type DecisionRuleUpdateOneRequiredWithoutExecutionPlansNestedInput = {
    create?: Prisma.XOR<Prisma.DecisionRuleCreateWithoutExecutionPlansInput, Prisma.DecisionRuleUncheckedCreateWithoutExecutionPlansInput>;
    connectOrCreate?: Prisma.DecisionRuleCreateOrConnectWithoutExecutionPlansInput;
    upsert?: Prisma.DecisionRuleUpsertWithoutExecutionPlansInput;
    connect?: Prisma.DecisionRuleWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.DecisionRuleUpdateToOneWithWhereWithoutExecutionPlansInput, Prisma.DecisionRuleUpdateWithoutExecutionPlansInput>, Prisma.DecisionRuleUncheckedUpdateWithoutExecutionPlansInput>;
};
export type DecisionRuleCreateNestedOneWithoutDecisionLogsInput = {
    create?: Prisma.XOR<Prisma.DecisionRuleCreateWithoutDecisionLogsInput, Prisma.DecisionRuleUncheckedCreateWithoutDecisionLogsInput>;
    connectOrCreate?: Prisma.DecisionRuleCreateOrConnectWithoutDecisionLogsInput;
    connect?: Prisma.DecisionRuleWhereUniqueInput;
};
export type DecisionRuleUpdateOneRequiredWithoutDecisionLogsNestedInput = {
    create?: Prisma.XOR<Prisma.DecisionRuleCreateWithoutDecisionLogsInput, Prisma.DecisionRuleUncheckedCreateWithoutDecisionLogsInput>;
    connectOrCreate?: Prisma.DecisionRuleCreateOrConnectWithoutDecisionLogsInput;
    upsert?: Prisma.DecisionRuleUpsertWithoutDecisionLogsInput;
    connect?: Prisma.DecisionRuleWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.DecisionRuleUpdateToOneWithWhereWithoutDecisionLogsInput, Prisma.DecisionRuleUpdateWithoutDecisionLogsInput>, Prisma.DecisionRuleUncheckedUpdateWithoutDecisionLogsInput>;
};
export type DecisionRuleCreateWithoutEntityTypeInput = {
    id?: string;
    name: string;
    conditions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicOperator?: string;
    priority?: number;
    autoExecute?: boolean;
    confidenceThreshold?: number | null;
    enabled?: boolean;
    createdAt?: Date | string;
    executionPlans?: Prisma.ExecutionPlanCreateNestedManyWithoutDecisionRuleInput;
    decisionLogs?: Prisma.DecisionLogCreateNestedManyWithoutDecisionRuleInput;
};
export type DecisionRuleUncheckedCreateWithoutEntityTypeInput = {
    id?: string;
    name: string;
    conditions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicOperator?: string;
    priority?: number;
    autoExecute?: boolean;
    confidenceThreshold?: number | null;
    enabled?: boolean;
    createdAt?: Date | string;
    executionPlans?: Prisma.ExecutionPlanUncheckedCreateNestedManyWithoutDecisionRuleInput;
    decisionLogs?: Prisma.DecisionLogUncheckedCreateNestedManyWithoutDecisionRuleInput;
};
export type DecisionRuleCreateOrConnectWithoutEntityTypeInput = {
    where: Prisma.DecisionRuleWhereUniqueInput;
    create: Prisma.XOR<Prisma.DecisionRuleCreateWithoutEntityTypeInput, Prisma.DecisionRuleUncheckedCreateWithoutEntityTypeInput>;
};
export type DecisionRuleCreateManyEntityTypeInputEnvelope = {
    data: Prisma.DecisionRuleCreateManyEntityTypeInput | Prisma.DecisionRuleCreateManyEntityTypeInput[];
    skipDuplicates?: boolean;
};
export type DecisionRuleUpsertWithWhereUniqueWithoutEntityTypeInput = {
    where: Prisma.DecisionRuleWhereUniqueInput;
    update: Prisma.XOR<Prisma.DecisionRuleUpdateWithoutEntityTypeInput, Prisma.DecisionRuleUncheckedUpdateWithoutEntityTypeInput>;
    create: Prisma.XOR<Prisma.DecisionRuleCreateWithoutEntityTypeInput, Prisma.DecisionRuleUncheckedCreateWithoutEntityTypeInput>;
};
export type DecisionRuleUpdateWithWhereUniqueWithoutEntityTypeInput = {
    where: Prisma.DecisionRuleWhereUniqueInput;
    data: Prisma.XOR<Prisma.DecisionRuleUpdateWithoutEntityTypeInput, Prisma.DecisionRuleUncheckedUpdateWithoutEntityTypeInput>;
};
export type DecisionRuleUpdateManyWithWhereWithoutEntityTypeInput = {
    where: Prisma.DecisionRuleScalarWhereInput;
    data: Prisma.XOR<Prisma.DecisionRuleUpdateManyMutationInput, Prisma.DecisionRuleUncheckedUpdateManyWithoutEntityTypeInput>;
};
export type DecisionRuleScalarWhereInput = {
    AND?: Prisma.DecisionRuleScalarWhereInput | Prisma.DecisionRuleScalarWhereInput[];
    OR?: Prisma.DecisionRuleScalarWhereInput[];
    NOT?: Prisma.DecisionRuleScalarWhereInput | Prisma.DecisionRuleScalarWhereInput[];
    id?: Prisma.StringFilter<"DecisionRule"> | string;
    name?: Prisma.StringFilter<"DecisionRule"> | string;
    entityTypeId?: Prisma.StringFilter<"DecisionRule"> | string;
    conditions?: Prisma.JsonFilter<"DecisionRule">;
    logicOperator?: Prisma.StringFilter<"DecisionRule"> | string;
    priority?: Prisma.IntFilter<"DecisionRule"> | number;
    autoExecute?: Prisma.BoolFilter<"DecisionRule"> | boolean;
    confidenceThreshold?: Prisma.FloatNullableFilter<"DecisionRule"> | number | null;
    enabled?: Prisma.BoolFilter<"DecisionRule"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"DecisionRule"> | Date | string;
};
export type DecisionRuleCreateWithoutExecutionPlansInput = {
    id?: string;
    name: string;
    conditions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicOperator?: string;
    priority?: number;
    autoExecute?: boolean;
    confidenceThreshold?: number | null;
    enabled?: boolean;
    createdAt?: Date | string;
    entityType: Prisma.EntityTypeCreateNestedOneWithoutDecisionRulesInput;
    decisionLogs?: Prisma.DecisionLogCreateNestedManyWithoutDecisionRuleInput;
};
export type DecisionRuleUncheckedCreateWithoutExecutionPlansInput = {
    id?: string;
    name: string;
    entityTypeId: string;
    conditions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicOperator?: string;
    priority?: number;
    autoExecute?: boolean;
    confidenceThreshold?: number | null;
    enabled?: boolean;
    createdAt?: Date | string;
    decisionLogs?: Prisma.DecisionLogUncheckedCreateNestedManyWithoutDecisionRuleInput;
};
export type DecisionRuleCreateOrConnectWithoutExecutionPlansInput = {
    where: Prisma.DecisionRuleWhereUniqueInput;
    create: Prisma.XOR<Prisma.DecisionRuleCreateWithoutExecutionPlansInput, Prisma.DecisionRuleUncheckedCreateWithoutExecutionPlansInput>;
};
export type DecisionRuleUpsertWithoutExecutionPlansInput = {
    update: Prisma.XOR<Prisma.DecisionRuleUpdateWithoutExecutionPlansInput, Prisma.DecisionRuleUncheckedUpdateWithoutExecutionPlansInput>;
    create: Prisma.XOR<Prisma.DecisionRuleCreateWithoutExecutionPlansInput, Prisma.DecisionRuleUncheckedCreateWithoutExecutionPlansInput>;
    where?: Prisma.DecisionRuleWhereInput;
};
export type DecisionRuleUpdateToOneWithWhereWithoutExecutionPlansInput = {
    where?: Prisma.DecisionRuleWhereInput;
    data: Prisma.XOR<Prisma.DecisionRuleUpdateWithoutExecutionPlansInput, Prisma.DecisionRuleUncheckedUpdateWithoutExecutionPlansInput>;
};
export type DecisionRuleUpdateWithoutExecutionPlansInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    conditions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicOperator?: Prisma.StringFieldUpdateOperationsInput | string;
    priority?: Prisma.IntFieldUpdateOperationsInput | number;
    autoExecute?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    confidenceThreshold?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    entityType?: Prisma.EntityTypeUpdateOneRequiredWithoutDecisionRulesNestedInput;
    decisionLogs?: Prisma.DecisionLogUpdateManyWithoutDecisionRuleNestedInput;
};
export type DecisionRuleUncheckedUpdateWithoutExecutionPlansInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    entityTypeId?: Prisma.StringFieldUpdateOperationsInput | string;
    conditions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicOperator?: Prisma.StringFieldUpdateOperationsInput | string;
    priority?: Prisma.IntFieldUpdateOperationsInput | number;
    autoExecute?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    confidenceThreshold?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    decisionLogs?: Prisma.DecisionLogUncheckedUpdateManyWithoutDecisionRuleNestedInput;
};
export type DecisionRuleCreateWithoutDecisionLogsInput = {
    id?: string;
    name: string;
    conditions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicOperator?: string;
    priority?: number;
    autoExecute?: boolean;
    confidenceThreshold?: number | null;
    enabled?: boolean;
    createdAt?: Date | string;
    entityType: Prisma.EntityTypeCreateNestedOneWithoutDecisionRulesInput;
    executionPlans?: Prisma.ExecutionPlanCreateNestedManyWithoutDecisionRuleInput;
};
export type DecisionRuleUncheckedCreateWithoutDecisionLogsInput = {
    id?: string;
    name: string;
    entityTypeId: string;
    conditions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicOperator?: string;
    priority?: number;
    autoExecute?: boolean;
    confidenceThreshold?: number | null;
    enabled?: boolean;
    createdAt?: Date | string;
    executionPlans?: Prisma.ExecutionPlanUncheckedCreateNestedManyWithoutDecisionRuleInput;
};
export type DecisionRuleCreateOrConnectWithoutDecisionLogsInput = {
    where: Prisma.DecisionRuleWhereUniqueInput;
    create: Prisma.XOR<Prisma.DecisionRuleCreateWithoutDecisionLogsInput, Prisma.DecisionRuleUncheckedCreateWithoutDecisionLogsInput>;
};
export type DecisionRuleUpsertWithoutDecisionLogsInput = {
    update: Prisma.XOR<Prisma.DecisionRuleUpdateWithoutDecisionLogsInput, Prisma.DecisionRuleUncheckedUpdateWithoutDecisionLogsInput>;
    create: Prisma.XOR<Prisma.DecisionRuleCreateWithoutDecisionLogsInput, Prisma.DecisionRuleUncheckedCreateWithoutDecisionLogsInput>;
    where?: Prisma.DecisionRuleWhereInput;
};
export type DecisionRuleUpdateToOneWithWhereWithoutDecisionLogsInput = {
    where?: Prisma.DecisionRuleWhereInput;
    data: Prisma.XOR<Prisma.DecisionRuleUpdateWithoutDecisionLogsInput, Prisma.DecisionRuleUncheckedUpdateWithoutDecisionLogsInput>;
};
export type DecisionRuleUpdateWithoutDecisionLogsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    conditions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicOperator?: Prisma.StringFieldUpdateOperationsInput | string;
    priority?: Prisma.IntFieldUpdateOperationsInput | number;
    autoExecute?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    confidenceThreshold?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    entityType?: Prisma.EntityTypeUpdateOneRequiredWithoutDecisionRulesNestedInput;
    executionPlans?: Prisma.ExecutionPlanUpdateManyWithoutDecisionRuleNestedInput;
};
export type DecisionRuleUncheckedUpdateWithoutDecisionLogsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    entityTypeId?: Prisma.StringFieldUpdateOperationsInput | string;
    conditions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicOperator?: Prisma.StringFieldUpdateOperationsInput | string;
    priority?: Prisma.IntFieldUpdateOperationsInput | number;
    autoExecute?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    confidenceThreshold?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    executionPlans?: Prisma.ExecutionPlanUncheckedUpdateManyWithoutDecisionRuleNestedInput;
};
export type DecisionRuleCreateManyEntityTypeInput = {
    id?: string;
    name: string;
    conditions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicOperator?: string;
    priority?: number;
    autoExecute?: boolean;
    confidenceThreshold?: number | null;
    enabled?: boolean;
    createdAt?: Date | string;
};
export type DecisionRuleUpdateWithoutEntityTypeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    conditions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicOperator?: Prisma.StringFieldUpdateOperationsInput | string;
    priority?: Prisma.IntFieldUpdateOperationsInput | number;
    autoExecute?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    confidenceThreshold?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    executionPlans?: Prisma.ExecutionPlanUpdateManyWithoutDecisionRuleNestedInput;
    decisionLogs?: Prisma.DecisionLogUpdateManyWithoutDecisionRuleNestedInput;
};
export type DecisionRuleUncheckedUpdateWithoutEntityTypeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    conditions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicOperator?: Prisma.StringFieldUpdateOperationsInput | string;
    priority?: Prisma.IntFieldUpdateOperationsInput | number;
    autoExecute?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    confidenceThreshold?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    executionPlans?: Prisma.ExecutionPlanUncheckedUpdateManyWithoutDecisionRuleNestedInput;
    decisionLogs?: Prisma.DecisionLogUncheckedUpdateManyWithoutDecisionRuleNestedInput;
};
export type DecisionRuleUncheckedUpdateManyWithoutEntityTypeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    conditions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logicOperator?: Prisma.StringFieldUpdateOperationsInput | string;
    priority?: Prisma.IntFieldUpdateOperationsInput | number;
    autoExecute?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    confidenceThreshold?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
/**
 * Count Type DecisionRuleCountOutputType
 */
export type DecisionRuleCountOutputType = {
    executionPlans: number;
    decisionLogs: number;
};
export type DecisionRuleCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    executionPlans?: boolean | DecisionRuleCountOutputTypeCountExecutionPlansArgs;
    decisionLogs?: boolean | DecisionRuleCountOutputTypeCountDecisionLogsArgs;
};
/**
 * DecisionRuleCountOutputType without action
 */
export type DecisionRuleCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DecisionRuleCountOutputType
     */
    select?: Prisma.DecisionRuleCountOutputTypeSelect<ExtArgs> | null;
};
/**
 * DecisionRuleCountOutputType without action
 */
export type DecisionRuleCountOutputTypeCountExecutionPlansArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ExecutionPlanWhereInput;
};
/**
 * DecisionRuleCountOutputType without action
 */
export type DecisionRuleCountOutputTypeCountDecisionLogsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DecisionLogWhereInput;
};
export type DecisionRuleSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    entityTypeId?: boolean;
    conditions?: boolean;
    logicOperator?: boolean;
    priority?: boolean;
    autoExecute?: boolean;
    confidenceThreshold?: boolean;
    enabled?: boolean;
    createdAt?: boolean;
    entityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
    executionPlans?: boolean | Prisma.DecisionRule$executionPlansArgs<ExtArgs>;
    decisionLogs?: boolean | Prisma.DecisionRule$decisionLogsArgs<ExtArgs>;
    _count?: boolean | Prisma.DecisionRuleCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["decisionRule"]>;
export type DecisionRuleSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    entityTypeId?: boolean;
    conditions?: boolean;
    logicOperator?: boolean;
    priority?: boolean;
    autoExecute?: boolean;
    confidenceThreshold?: boolean;
    enabled?: boolean;
    createdAt?: boolean;
    entityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["decisionRule"]>;
export type DecisionRuleSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    entityTypeId?: boolean;
    conditions?: boolean;
    logicOperator?: boolean;
    priority?: boolean;
    autoExecute?: boolean;
    confidenceThreshold?: boolean;
    enabled?: boolean;
    createdAt?: boolean;
    entityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["decisionRule"]>;
export type DecisionRuleSelectScalar = {
    id?: boolean;
    name?: boolean;
    entityTypeId?: boolean;
    conditions?: boolean;
    logicOperator?: boolean;
    priority?: boolean;
    autoExecute?: boolean;
    confidenceThreshold?: boolean;
    enabled?: boolean;
    createdAt?: boolean;
};
export type DecisionRuleOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "name" | "entityTypeId" | "conditions" | "logicOperator" | "priority" | "autoExecute" | "confidenceThreshold" | "enabled" | "createdAt", ExtArgs["result"]["decisionRule"]>;
export type DecisionRuleInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    entityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
    executionPlans?: boolean | Prisma.DecisionRule$executionPlansArgs<ExtArgs>;
    decisionLogs?: boolean | Prisma.DecisionRule$decisionLogsArgs<ExtArgs>;
    _count?: boolean | Prisma.DecisionRuleCountOutputTypeDefaultArgs<ExtArgs>;
};
export type DecisionRuleIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    entityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
};
export type DecisionRuleIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    entityType?: boolean | Prisma.EntityTypeDefaultArgs<ExtArgs>;
};
export type $DecisionRulePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "DecisionRule";
    objects: {
        entityType: Prisma.$EntityTypePayload<ExtArgs>;
        executionPlans: Prisma.$ExecutionPlanPayload<ExtArgs>[];
        decisionLogs: Prisma.$DecisionLogPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        name: string;
        entityTypeId: string;
        conditions: runtime.JsonValue;
        logicOperator: string;
        priority: number;
        autoExecute: boolean;
        confidenceThreshold: number | null;
        enabled: boolean;
        createdAt: Date;
    }, ExtArgs["result"]["decisionRule"]>;
    composites: {};
};
export type DecisionRuleGetPayload<S extends boolean | null | undefined | DecisionRuleDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$DecisionRulePayload, S>;
export type DecisionRuleCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<DecisionRuleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: DecisionRuleCountAggregateInputType | true;
};
export interface DecisionRuleDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['DecisionRule'];
        meta: {
            name: 'DecisionRule';
        };
    };
    /**
     * Find zero or one DecisionRule that matches the filter.
     * @param {DecisionRuleFindUniqueArgs} args - Arguments to find a DecisionRule
     * @example
     * // Get one DecisionRule
     * const decisionRule = await prisma.decisionRule.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DecisionRuleFindUniqueArgs>(args: Prisma.SelectSubset<T, DecisionRuleFindUniqueArgs<ExtArgs>>): Prisma.Prisma__DecisionRuleClient<runtime.Types.Result.GetResult<Prisma.$DecisionRulePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one DecisionRule that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DecisionRuleFindUniqueOrThrowArgs} args - Arguments to find a DecisionRule
     * @example
     * // Get one DecisionRule
     * const decisionRule = await prisma.decisionRule.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DecisionRuleFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, DecisionRuleFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__DecisionRuleClient<runtime.Types.Result.GetResult<Prisma.$DecisionRulePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first DecisionRule that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DecisionRuleFindFirstArgs} args - Arguments to find a DecisionRule
     * @example
     * // Get one DecisionRule
     * const decisionRule = await prisma.decisionRule.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DecisionRuleFindFirstArgs>(args?: Prisma.SelectSubset<T, DecisionRuleFindFirstArgs<ExtArgs>>): Prisma.Prisma__DecisionRuleClient<runtime.Types.Result.GetResult<Prisma.$DecisionRulePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first DecisionRule that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DecisionRuleFindFirstOrThrowArgs} args - Arguments to find a DecisionRule
     * @example
     * // Get one DecisionRule
     * const decisionRule = await prisma.decisionRule.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DecisionRuleFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, DecisionRuleFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__DecisionRuleClient<runtime.Types.Result.GetResult<Prisma.$DecisionRulePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more DecisionRules that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DecisionRuleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DecisionRules
     * const decisionRules = await prisma.decisionRule.findMany()
     *
     * // Get first 10 DecisionRules
     * const decisionRules = await prisma.decisionRule.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const decisionRuleWithIdOnly = await prisma.decisionRule.findMany({ select: { id: true } })
     *
     */
    findMany<T extends DecisionRuleFindManyArgs>(args?: Prisma.SelectSubset<T, DecisionRuleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DecisionRulePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a DecisionRule.
     * @param {DecisionRuleCreateArgs} args - Arguments to create a DecisionRule.
     * @example
     * // Create one DecisionRule
     * const DecisionRule = await prisma.decisionRule.create({
     *   data: {
     *     // ... data to create a DecisionRule
     *   }
     * })
     *
     */
    create<T extends DecisionRuleCreateArgs>(args: Prisma.SelectSubset<T, DecisionRuleCreateArgs<ExtArgs>>): Prisma.Prisma__DecisionRuleClient<runtime.Types.Result.GetResult<Prisma.$DecisionRulePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many DecisionRules.
     * @param {DecisionRuleCreateManyArgs} args - Arguments to create many DecisionRules.
     * @example
     * // Create many DecisionRules
     * const decisionRule = await prisma.decisionRule.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends DecisionRuleCreateManyArgs>(args?: Prisma.SelectSubset<T, DecisionRuleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many DecisionRules and returns the data saved in the database.
     * @param {DecisionRuleCreateManyAndReturnArgs} args - Arguments to create many DecisionRules.
     * @example
     * // Create many DecisionRules
     * const decisionRule = await prisma.decisionRule.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many DecisionRules and only return the `id`
     * const decisionRuleWithIdOnly = await prisma.decisionRule.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends DecisionRuleCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, DecisionRuleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DecisionRulePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a DecisionRule.
     * @param {DecisionRuleDeleteArgs} args - Arguments to delete one DecisionRule.
     * @example
     * // Delete one DecisionRule
     * const DecisionRule = await prisma.decisionRule.delete({
     *   where: {
     *     // ... filter to delete one DecisionRule
     *   }
     * })
     *
     */
    delete<T extends DecisionRuleDeleteArgs>(args: Prisma.SelectSubset<T, DecisionRuleDeleteArgs<ExtArgs>>): Prisma.Prisma__DecisionRuleClient<runtime.Types.Result.GetResult<Prisma.$DecisionRulePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one DecisionRule.
     * @param {DecisionRuleUpdateArgs} args - Arguments to update one DecisionRule.
     * @example
     * // Update one DecisionRule
     * const decisionRule = await prisma.decisionRule.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends DecisionRuleUpdateArgs>(args: Prisma.SelectSubset<T, DecisionRuleUpdateArgs<ExtArgs>>): Prisma.Prisma__DecisionRuleClient<runtime.Types.Result.GetResult<Prisma.$DecisionRulePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more DecisionRules.
     * @param {DecisionRuleDeleteManyArgs} args - Arguments to filter DecisionRules to delete.
     * @example
     * // Delete a few DecisionRules
     * const { count } = await prisma.decisionRule.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends DecisionRuleDeleteManyArgs>(args?: Prisma.SelectSubset<T, DecisionRuleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more DecisionRules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DecisionRuleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DecisionRules
     * const decisionRule = await prisma.decisionRule.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends DecisionRuleUpdateManyArgs>(args: Prisma.SelectSubset<T, DecisionRuleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more DecisionRules and returns the data updated in the database.
     * @param {DecisionRuleUpdateManyAndReturnArgs} args - Arguments to update many DecisionRules.
     * @example
     * // Update many DecisionRules
     * const decisionRule = await prisma.decisionRule.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more DecisionRules and only return the `id`
     * const decisionRuleWithIdOnly = await prisma.decisionRule.updateManyAndReturn({
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
    updateManyAndReturn<T extends DecisionRuleUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, DecisionRuleUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DecisionRulePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one DecisionRule.
     * @param {DecisionRuleUpsertArgs} args - Arguments to update or create a DecisionRule.
     * @example
     * // Update or create a DecisionRule
     * const decisionRule = await prisma.decisionRule.upsert({
     *   create: {
     *     // ... data to create a DecisionRule
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DecisionRule we want to update
     *   }
     * })
     */
    upsert<T extends DecisionRuleUpsertArgs>(args: Prisma.SelectSubset<T, DecisionRuleUpsertArgs<ExtArgs>>): Prisma.Prisma__DecisionRuleClient<runtime.Types.Result.GetResult<Prisma.$DecisionRulePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of DecisionRules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DecisionRuleCountArgs} args - Arguments to filter DecisionRules to count.
     * @example
     * // Count the number of DecisionRules
     * const count = await prisma.decisionRule.count({
     *   where: {
     *     // ... the filter for the DecisionRules we want to count
     *   }
     * })
    **/
    count<T extends DecisionRuleCountArgs>(args?: Prisma.Subset<T, DecisionRuleCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], DecisionRuleCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a DecisionRule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DecisionRuleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends DecisionRuleAggregateArgs>(args: Prisma.Subset<T, DecisionRuleAggregateArgs>): Prisma.PrismaPromise<GetDecisionRuleAggregateType<T>>;
    /**
     * Group by DecisionRule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DecisionRuleGroupByArgs} args - Group by arguments.
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
    groupBy<T extends DecisionRuleGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: DecisionRuleGroupByArgs['orderBy'];
    } : {
        orderBy?: DecisionRuleGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, DecisionRuleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDecisionRuleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the DecisionRule model
     */
    readonly fields: DecisionRuleFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for DecisionRule.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__DecisionRuleClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    entityType<T extends Prisma.EntityTypeDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.EntityTypeDefaultArgs<ExtArgs>>): Prisma.Prisma__EntityTypeClient<runtime.Types.Result.GetResult<Prisma.$EntityTypePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    executionPlans<T extends Prisma.DecisionRule$executionPlansArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.DecisionRule$executionPlansArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ExecutionPlanPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    decisionLogs<T extends Prisma.DecisionRule$decisionLogsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.DecisionRule$decisionLogsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DecisionLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
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
 * Fields of the DecisionRule model
 */
export interface DecisionRuleFieldRefs {
    readonly id: Prisma.FieldRef<"DecisionRule", 'String'>;
    readonly name: Prisma.FieldRef<"DecisionRule", 'String'>;
    readonly entityTypeId: Prisma.FieldRef<"DecisionRule", 'String'>;
    readonly conditions: Prisma.FieldRef<"DecisionRule", 'Json'>;
    readonly logicOperator: Prisma.FieldRef<"DecisionRule", 'String'>;
    readonly priority: Prisma.FieldRef<"DecisionRule", 'Int'>;
    readonly autoExecute: Prisma.FieldRef<"DecisionRule", 'Boolean'>;
    readonly confidenceThreshold: Prisma.FieldRef<"DecisionRule", 'Float'>;
    readonly enabled: Prisma.FieldRef<"DecisionRule", 'Boolean'>;
    readonly createdAt: Prisma.FieldRef<"DecisionRule", 'DateTime'>;
}
/**
 * DecisionRule findUnique
 */
export type DecisionRuleFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DecisionRule
     */
    select?: Prisma.DecisionRuleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DecisionRule
     */
    omit?: Prisma.DecisionRuleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DecisionRuleInclude<ExtArgs> | null;
    /**
     * Filter, which DecisionRule to fetch.
     */
    where: Prisma.DecisionRuleWhereUniqueInput;
};
/**
 * DecisionRule findUniqueOrThrow
 */
export type DecisionRuleFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DecisionRule
     */
    select?: Prisma.DecisionRuleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DecisionRule
     */
    omit?: Prisma.DecisionRuleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DecisionRuleInclude<ExtArgs> | null;
    /**
     * Filter, which DecisionRule to fetch.
     */
    where: Prisma.DecisionRuleWhereUniqueInput;
};
/**
 * DecisionRule findFirst
 */
export type DecisionRuleFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DecisionRule
     */
    select?: Prisma.DecisionRuleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DecisionRule
     */
    omit?: Prisma.DecisionRuleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DecisionRuleInclude<ExtArgs> | null;
    /**
     * Filter, which DecisionRule to fetch.
     */
    where?: Prisma.DecisionRuleWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DecisionRules to fetch.
     */
    orderBy?: Prisma.DecisionRuleOrderByWithRelationInput | Prisma.DecisionRuleOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for DecisionRules.
     */
    cursor?: Prisma.DecisionRuleWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DecisionRules from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DecisionRules.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of DecisionRules.
     */
    distinct?: Prisma.DecisionRuleScalarFieldEnum | Prisma.DecisionRuleScalarFieldEnum[];
};
/**
 * DecisionRule findFirstOrThrow
 */
export type DecisionRuleFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DecisionRule
     */
    select?: Prisma.DecisionRuleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DecisionRule
     */
    omit?: Prisma.DecisionRuleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DecisionRuleInclude<ExtArgs> | null;
    /**
     * Filter, which DecisionRule to fetch.
     */
    where?: Prisma.DecisionRuleWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DecisionRules to fetch.
     */
    orderBy?: Prisma.DecisionRuleOrderByWithRelationInput | Prisma.DecisionRuleOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for DecisionRules.
     */
    cursor?: Prisma.DecisionRuleWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DecisionRules from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DecisionRules.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of DecisionRules.
     */
    distinct?: Prisma.DecisionRuleScalarFieldEnum | Prisma.DecisionRuleScalarFieldEnum[];
};
/**
 * DecisionRule findMany
 */
export type DecisionRuleFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DecisionRule
     */
    select?: Prisma.DecisionRuleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DecisionRule
     */
    omit?: Prisma.DecisionRuleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DecisionRuleInclude<ExtArgs> | null;
    /**
     * Filter, which DecisionRules to fetch.
     */
    where?: Prisma.DecisionRuleWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DecisionRules to fetch.
     */
    orderBy?: Prisma.DecisionRuleOrderByWithRelationInput | Prisma.DecisionRuleOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing DecisionRules.
     */
    cursor?: Prisma.DecisionRuleWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DecisionRules from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DecisionRules.
     */
    skip?: number;
    distinct?: Prisma.DecisionRuleScalarFieldEnum | Prisma.DecisionRuleScalarFieldEnum[];
};
/**
 * DecisionRule create
 */
export type DecisionRuleCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DecisionRule
     */
    select?: Prisma.DecisionRuleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DecisionRule
     */
    omit?: Prisma.DecisionRuleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DecisionRuleInclude<ExtArgs> | null;
    /**
     * The data needed to create a DecisionRule.
     */
    data: Prisma.XOR<Prisma.DecisionRuleCreateInput, Prisma.DecisionRuleUncheckedCreateInput>;
};
/**
 * DecisionRule createMany
 */
export type DecisionRuleCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many DecisionRules.
     */
    data: Prisma.DecisionRuleCreateManyInput | Prisma.DecisionRuleCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * DecisionRule createManyAndReturn
 */
export type DecisionRuleCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DecisionRule
     */
    select?: Prisma.DecisionRuleSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the DecisionRule
     */
    omit?: Prisma.DecisionRuleOmit<ExtArgs> | null;
    /**
     * The data used to create many DecisionRules.
     */
    data: Prisma.DecisionRuleCreateManyInput | Prisma.DecisionRuleCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DecisionRuleIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * DecisionRule update
 */
export type DecisionRuleUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DecisionRule
     */
    select?: Prisma.DecisionRuleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DecisionRule
     */
    omit?: Prisma.DecisionRuleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DecisionRuleInclude<ExtArgs> | null;
    /**
     * The data needed to update a DecisionRule.
     */
    data: Prisma.XOR<Prisma.DecisionRuleUpdateInput, Prisma.DecisionRuleUncheckedUpdateInput>;
    /**
     * Choose, which DecisionRule to update.
     */
    where: Prisma.DecisionRuleWhereUniqueInput;
};
/**
 * DecisionRule updateMany
 */
export type DecisionRuleUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update DecisionRules.
     */
    data: Prisma.XOR<Prisma.DecisionRuleUpdateManyMutationInput, Prisma.DecisionRuleUncheckedUpdateManyInput>;
    /**
     * Filter which DecisionRules to update
     */
    where?: Prisma.DecisionRuleWhereInput;
    /**
     * Limit how many DecisionRules to update.
     */
    limit?: number;
};
/**
 * DecisionRule updateManyAndReturn
 */
export type DecisionRuleUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DecisionRule
     */
    select?: Prisma.DecisionRuleSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the DecisionRule
     */
    omit?: Prisma.DecisionRuleOmit<ExtArgs> | null;
    /**
     * The data used to update DecisionRules.
     */
    data: Prisma.XOR<Prisma.DecisionRuleUpdateManyMutationInput, Prisma.DecisionRuleUncheckedUpdateManyInput>;
    /**
     * Filter which DecisionRules to update
     */
    where?: Prisma.DecisionRuleWhereInput;
    /**
     * Limit how many DecisionRules to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DecisionRuleIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * DecisionRule upsert
 */
export type DecisionRuleUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DecisionRule
     */
    select?: Prisma.DecisionRuleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DecisionRule
     */
    omit?: Prisma.DecisionRuleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DecisionRuleInclude<ExtArgs> | null;
    /**
     * The filter to search for the DecisionRule to update in case it exists.
     */
    where: Prisma.DecisionRuleWhereUniqueInput;
    /**
     * In case the DecisionRule found by the `where` argument doesn't exist, create a new DecisionRule with this data.
     */
    create: Prisma.XOR<Prisma.DecisionRuleCreateInput, Prisma.DecisionRuleUncheckedCreateInput>;
    /**
     * In case the DecisionRule was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.DecisionRuleUpdateInput, Prisma.DecisionRuleUncheckedUpdateInput>;
};
/**
 * DecisionRule delete
 */
export type DecisionRuleDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DecisionRule
     */
    select?: Prisma.DecisionRuleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DecisionRule
     */
    omit?: Prisma.DecisionRuleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DecisionRuleInclude<ExtArgs> | null;
    /**
     * Filter which DecisionRule to delete.
     */
    where: Prisma.DecisionRuleWhereUniqueInput;
};
/**
 * DecisionRule deleteMany
 */
export type DecisionRuleDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which DecisionRules to delete
     */
    where?: Prisma.DecisionRuleWhereInput;
    /**
     * Limit how many DecisionRules to delete.
     */
    limit?: number;
};
/**
 * DecisionRule.executionPlans
 */
export type DecisionRule$executionPlansArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
 * DecisionRule.decisionLogs
 */
export type DecisionRule$decisionLogsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DecisionLog
     */
    select?: Prisma.DecisionLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DecisionLog
     */
    omit?: Prisma.DecisionLogOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DecisionLogInclude<ExtArgs> | null;
    where?: Prisma.DecisionLogWhereInput;
    orderBy?: Prisma.DecisionLogOrderByWithRelationInput | Prisma.DecisionLogOrderByWithRelationInput[];
    cursor?: Prisma.DecisionLogWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.DecisionLogScalarFieldEnum | Prisma.DecisionLogScalarFieldEnum[];
};
/**
 * DecisionRule without action
 */
export type DecisionRuleDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DecisionRule
     */
    select?: Prisma.DecisionRuleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DecisionRule
     */
    omit?: Prisma.DecisionRuleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DecisionRuleInclude<ExtArgs> | null;
};
export {};
//# sourceMappingURL=DecisionRule.d.ts.map