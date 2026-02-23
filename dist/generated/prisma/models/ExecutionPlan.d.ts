import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
/**
 * Model ExecutionPlan
 *
 */
export type ExecutionPlanModel = runtime.Types.Result.DefaultSelection<Prisma.$ExecutionPlanPayload>;
export type AggregateExecutionPlan = {
    _count: ExecutionPlanCountAggregateOutputType | null;
    _avg: ExecutionPlanAvgAggregateOutputType | null;
    _sum: ExecutionPlanSumAggregateOutputType | null;
    _min: ExecutionPlanMinAggregateOutputType | null;
    _max: ExecutionPlanMaxAggregateOutputType | null;
};
export type ExecutionPlanAvgAggregateOutputType = {
    stepOrder: number | null;
};
export type ExecutionPlanSumAggregateOutputType = {
    stepOrder: number | null;
};
export type ExecutionPlanMinAggregateOutputType = {
    id: string | null;
    decisionRuleId: string | null;
    actionDefinitionId: string | null;
    stepOrder: number | null;
    continueOnFailure: boolean | null;
};
export type ExecutionPlanMaxAggregateOutputType = {
    id: string | null;
    decisionRuleId: string | null;
    actionDefinitionId: string | null;
    stepOrder: number | null;
    continueOnFailure: boolean | null;
};
export type ExecutionPlanCountAggregateOutputType = {
    id: number;
    decisionRuleId: number;
    actionDefinitionId: number;
    stepOrder: number;
    continueOnFailure: number;
    _all: number;
};
export type ExecutionPlanAvgAggregateInputType = {
    stepOrder?: true;
};
export type ExecutionPlanSumAggregateInputType = {
    stepOrder?: true;
};
export type ExecutionPlanMinAggregateInputType = {
    id?: true;
    decisionRuleId?: true;
    actionDefinitionId?: true;
    stepOrder?: true;
    continueOnFailure?: true;
};
export type ExecutionPlanMaxAggregateInputType = {
    id?: true;
    decisionRuleId?: true;
    actionDefinitionId?: true;
    stepOrder?: true;
    continueOnFailure?: true;
};
export type ExecutionPlanCountAggregateInputType = {
    id?: true;
    decisionRuleId?: true;
    actionDefinitionId?: true;
    stepOrder?: true;
    continueOnFailure?: true;
    _all?: true;
};
export type ExecutionPlanAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which ExecutionPlan to aggregate.
     */
    where?: Prisma.ExecutionPlanWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ExecutionPlans to fetch.
     */
    orderBy?: Prisma.ExecutionPlanOrderByWithRelationInput | Prisma.ExecutionPlanOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.ExecutionPlanWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ExecutionPlans from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ExecutionPlans.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned ExecutionPlans
    **/
    _count?: true | ExecutionPlanCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: ExecutionPlanAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: ExecutionPlanSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: ExecutionPlanMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: ExecutionPlanMaxAggregateInputType;
};
export type GetExecutionPlanAggregateType<T extends ExecutionPlanAggregateArgs> = {
    [P in keyof T & keyof AggregateExecutionPlan]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateExecutionPlan[P]> : Prisma.GetScalarType<T[P], AggregateExecutionPlan[P]>;
};
export type ExecutionPlanGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ExecutionPlanWhereInput;
    orderBy?: Prisma.ExecutionPlanOrderByWithAggregationInput | Prisma.ExecutionPlanOrderByWithAggregationInput[];
    by: Prisma.ExecutionPlanScalarFieldEnum[] | Prisma.ExecutionPlanScalarFieldEnum;
    having?: Prisma.ExecutionPlanScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ExecutionPlanCountAggregateInputType | true;
    _avg?: ExecutionPlanAvgAggregateInputType;
    _sum?: ExecutionPlanSumAggregateInputType;
    _min?: ExecutionPlanMinAggregateInputType;
    _max?: ExecutionPlanMaxAggregateInputType;
};
export type ExecutionPlanGroupByOutputType = {
    id: string;
    decisionRuleId: string;
    actionDefinitionId: string;
    stepOrder: number;
    continueOnFailure: boolean;
    _count: ExecutionPlanCountAggregateOutputType | null;
    _avg: ExecutionPlanAvgAggregateOutputType | null;
    _sum: ExecutionPlanSumAggregateOutputType | null;
    _min: ExecutionPlanMinAggregateOutputType | null;
    _max: ExecutionPlanMaxAggregateOutputType | null;
};
type GetExecutionPlanGroupByPayload<T extends ExecutionPlanGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ExecutionPlanGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ExecutionPlanGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ExecutionPlanGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ExecutionPlanGroupByOutputType[P]>;
}>>;
export type ExecutionPlanWhereInput = {
    AND?: Prisma.ExecutionPlanWhereInput | Prisma.ExecutionPlanWhereInput[];
    OR?: Prisma.ExecutionPlanWhereInput[];
    NOT?: Prisma.ExecutionPlanWhereInput | Prisma.ExecutionPlanWhereInput[];
    id?: Prisma.StringFilter<"ExecutionPlan"> | string;
    decisionRuleId?: Prisma.StringFilter<"ExecutionPlan"> | string;
    actionDefinitionId?: Prisma.StringFilter<"ExecutionPlan"> | string;
    stepOrder?: Prisma.IntFilter<"ExecutionPlan"> | number;
    continueOnFailure?: Prisma.BoolFilter<"ExecutionPlan"> | boolean;
    decisionRule?: Prisma.XOR<Prisma.DecisionRuleScalarRelationFilter, Prisma.DecisionRuleWhereInput>;
    actionDefinition?: Prisma.XOR<Prisma.ActionDefinitionScalarRelationFilter, Prisma.ActionDefinitionWhereInput>;
};
export type ExecutionPlanOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    decisionRuleId?: Prisma.SortOrder;
    actionDefinitionId?: Prisma.SortOrder;
    stepOrder?: Prisma.SortOrder;
    continueOnFailure?: Prisma.SortOrder;
    decisionRule?: Prisma.DecisionRuleOrderByWithRelationInput;
    actionDefinition?: Prisma.ActionDefinitionOrderByWithRelationInput;
};
export type ExecutionPlanWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    decisionRuleId_stepOrder?: Prisma.ExecutionPlanDecisionRuleIdStepOrderCompoundUniqueInput;
    AND?: Prisma.ExecutionPlanWhereInput | Prisma.ExecutionPlanWhereInput[];
    OR?: Prisma.ExecutionPlanWhereInput[];
    NOT?: Prisma.ExecutionPlanWhereInput | Prisma.ExecutionPlanWhereInput[];
    decisionRuleId?: Prisma.StringFilter<"ExecutionPlan"> | string;
    actionDefinitionId?: Prisma.StringFilter<"ExecutionPlan"> | string;
    stepOrder?: Prisma.IntFilter<"ExecutionPlan"> | number;
    continueOnFailure?: Prisma.BoolFilter<"ExecutionPlan"> | boolean;
    decisionRule?: Prisma.XOR<Prisma.DecisionRuleScalarRelationFilter, Prisma.DecisionRuleWhereInput>;
    actionDefinition?: Prisma.XOR<Prisma.ActionDefinitionScalarRelationFilter, Prisma.ActionDefinitionWhereInput>;
}, "id" | "decisionRuleId_stepOrder">;
export type ExecutionPlanOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    decisionRuleId?: Prisma.SortOrder;
    actionDefinitionId?: Prisma.SortOrder;
    stepOrder?: Prisma.SortOrder;
    continueOnFailure?: Prisma.SortOrder;
    _count?: Prisma.ExecutionPlanCountOrderByAggregateInput;
    _avg?: Prisma.ExecutionPlanAvgOrderByAggregateInput;
    _max?: Prisma.ExecutionPlanMaxOrderByAggregateInput;
    _min?: Prisma.ExecutionPlanMinOrderByAggregateInput;
    _sum?: Prisma.ExecutionPlanSumOrderByAggregateInput;
};
export type ExecutionPlanScalarWhereWithAggregatesInput = {
    AND?: Prisma.ExecutionPlanScalarWhereWithAggregatesInput | Prisma.ExecutionPlanScalarWhereWithAggregatesInput[];
    OR?: Prisma.ExecutionPlanScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ExecutionPlanScalarWhereWithAggregatesInput | Prisma.ExecutionPlanScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"ExecutionPlan"> | string;
    decisionRuleId?: Prisma.StringWithAggregatesFilter<"ExecutionPlan"> | string;
    actionDefinitionId?: Prisma.StringWithAggregatesFilter<"ExecutionPlan"> | string;
    stepOrder?: Prisma.IntWithAggregatesFilter<"ExecutionPlan"> | number;
    continueOnFailure?: Prisma.BoolWithAggregatesFilter<"ExecutionPlan"> | boolean;
};
export type ExecutionPlanCreateInput = {
    id?: string;
    stepOrder: number;
    continueOnFailure?: boolean;
    decisionRule: Prisma.DecisionRuleCreateNestedOneWithoutExecutionPlansInput;
    actionDefinition: Prisma.ActionDefinitionCreateNestedOneWithoutExecutionPlansInput;
};
export type ExecutionPlanUncheckedCreateInput = {
    id?: string;
    decisionRuleId: string;
    actionDefinitionId: string;
    stepOrder: number;
    continueOnFailure?: boolean;
};
export type ExecutionPlanUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    stepOrder?: Prisma.IntFieldUpdateOperationsInput | number;
    continueOnFailure?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    decisionRule?: Prisma.DecisionRuleUpdateOneRequiredWithoutExecutionPlansNestedInput;
    actionDefinition?: Prisma.ActionDefinitionUpdateOneRequiredWithoutExecutionPlansNestedInput;
};
export type ExecutionPlanUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    decisionRuleId?: Prisma.StringFieldUpdateOperationsInput | string;
    actionDefinitionId?: Prisma.StringFieldUpdateOperationsInput | string;
    stepOrder?: Prisma.IntFieldUpdateOperationsInput | number;
    continueOnFailure?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type ExecutionPlanCreateManyInput = {
    id?: string;
    decisionRuleId: string;
    actionDefinitionId: string;
    stepOrder: number;
    continueOnFailure?: boolean;
};
export type ExecutionPlanUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    stepOrder?: Prisma.IntFieldUpdateOperationsInput | number;
    continueOnFailure?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type ExecutionPlanUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    decisionRuleId?: Prisma.StringFieldUpdateOperationsInput | string;
    actionDefinitionId?: Prisma.StringFieldUpdateOperationsInput | string;
    stepOrder?: Prisma.IntFieldUpdateOperationsInput | number;
    continueOnFailure?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type ExecutionPlanListRelationFilter = {
    every?: Prisma.ExecutionPlanWhereInput;
    some?: Prisma.ExecutionPlanWhereInput;
    none?: Prisma.ExecutionPlanWhereInput;
};
export type ExecutionPlanOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ExecutionPlanDecisionRuleIdStepOrderCompoundUniqueInput = {
    decisionRuleId: string;
    stepOrder: number;
};
export type ExecutionPlanCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    decisionRuleId?: Prisma.SortOrder;
    actionDefinitionId?: Prisma.SortOrder;
    stepOrder?: Prisma.SortOrder;
    continueOnFailure?: Prisma.SortOrder;
};
export type ExecutionPlanAvgOrderByAggregateInput = {
    stepOrder?: Prisma.SortOrder;
};
export type ExecutionPlanMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    decisionRuleId?: Prisma.SortOrder;
    actionDefinitionId?: Prisma.SortOrder;
    stepOrder?: Prisma.SortOrder;
    continueOnFailure?: Prisma.SortOrder;
};
export type ExecutionPlanMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    decisionRuleId?: Prisma.SortOrder;
    actionDefinitionId?: Prisma.SortOrder;
    stepOrder?: Prisma.SortOrder;
    continueOnFailure?: Prisma.SortOrder;
};
export type ExecutionPlanSumOrderByAggregateInput = {
    stepOrder?: Prisma.SortOrder;
};
export type ExecutionPlanCreateNestedManyWithoutDecisionRuleInput = {
    create?: Prisma.XOR<Prisma.ExecutionPlanCreateWithoutDecisionRuleInput, Prisma.ExecutionPlanUncheckedCreateWithoutDecisionRuleInput> | Prisma.ExecutionPlanCreateWithoutDecisionRuleInput[] | Prisma.ExecutionPlanUncheckedCreateWithoutDecisionRuleInput[];
    connectOrCreate?: Prisma.ExecutionPlanCreateOrConnectWithoutDecisionRuleInput | Prisma.ExecutionPlanCreateOrConnectWithoutDecisionRuleInput[];
    createMany?: Prisma.ExecutionPlanCreateManyDecisionRuleInputEnvelope;
    connect?: Prisma.ExecutionPlanWhereUniqueInput | Prisma.ExecutionPlanWhereUniqueInput[];
};
export type ExecutionPlanUncheckedCreateNestedManyWithoutDecisionRuleInput = {
    create?: Prisma.XOR<Prisma.ExecutionPlanCreateWithoutDecisionRuleInput, Prisma.ExecutionPlanUncheckedCreateWithoutDecisionRuleInput> | Prisma.ExecutionPlanCreateWithoutDecisionRuleInput[] | Prisma.ExecutionPlanUncheckedCreateWithoutDecisionRuleInput[];
    connectOrCreate?: Prisma.ExecutionPlanCreateOrConnectWithoutDecisionRuleInput | Prisma.ExecutionPlanCreateOrConnectWithoutDecisionRuleInput[];
    createMany?: Prisma.ExecutionPlanCreateManyDecisionRuleInputEnvelope;
    connect?: Prisma.ExecutionPlanWhereUniqueInput | Prisma.ExecutionPlanWhereUniqueInput[];
};
export type ExecutionPlanUpdateManyWithoutDecisionRuleNestedInput = {
    create?: Prisma.XOR<Prisma.ExecutionPlanCreateWithoutDecisionRuleInput, Prisma.ExecutionPlanUncheckedCreateWithoutDecisionRuleInput> | Prisma.ExecutionPlanCreateWithoutDecisionRuleInput[] | Prisma.ExecutionPlanUncheckedCreateWithoutDecisionRuleInput[];
    connectOrCreate?: Prisma.ExecutionPlanCreateOrConnectWithoutDecisionRuleInput | Prisma.ExecutionPlanCreateOrConnectWithoutDecisionRuleInput[];
    upsert?: Prisma.ExecutionPlanUpsertWithWhereUniqueWithoutDecisionRuleInput | Prisma.ExecutionPlanUpsertWithWhereUniqueWithoutDecisionRuleInput[];
    createMany?: Prisma.ExecutionPlanCreateManyDecisionRuleInputEnvelope;
    set?: Prisma.ExecutionPlanWhereUniqueInput | Prisma.ExecutionPlanWhereUniqueInput[];
    disconnect?: Prisma.ExecutionPlanWhereUniqueInput | Prisma.ExecutionPlanWhereUniqueInput[];
    delete?: Prisma.ExecutionPlanWhereUniqueInput | Prisma.ExecutionPlanWhereUniqueInput[];
    connect?: Prisma.ExecutionPlanWhereUniqueInput | Prisma.ExecutionPlanWhereUniqueInput[];
    update?: Prisma.ExecutionPlanUpdateWithWhereUniqueWithoutDecisionRuleInput | Prisma.ExecutionPlanUpdateWithWhereUniqueWithoutDecisionRuleInput[];
    updateMany?: Prisma.ExecutionPlanUpdateManyWithWhereWithoutDecisionRuleInput | Prisma.ExecutionPlanUpdateManyWithWhereWithoutDecisionRuleInput[];
    deleteMany?: Prisma.ExecutionPlanScalarWhereInput | Prisma.ExecutionPlanScalarWhereInput[];
};
export type ExecutionPlanUncheckedUpdateManyWithoutDecisionRuleNestedInput = {
    create?: Prisma.XOR<Prisma.ExecutionPlanCreateWithoutDecisionRuleInput, Prisma.ExecutionPlanUncheckedCreateWithoutDecisionRuleInput> | Prisma.ExecutionPlanCreateWithoutDecisionRuleInput[] | Prisma.ExecutionPlanUncheckedCreateWithoutDecisionRuleInput[];
    connectOrCreate?: Prisma.ExecutionPlanCreateOrConnectWithoutDecisionRuleInput | Prisma.ExecutionPlanCreateOrConnectWithoutDecisionRuleInput[];
    upsert?: Prisma.ExecutionPlanUpsertWithWhereUniqueWithoutDecisionRuleInput | Prisma.ExecutionPlanUpsertWithWhereUniqueWithoutDecisionRuleInput[];
    createMany?: Prisma.ExecutionPlanCreateManyDecisionRuleInputEnvelope;
    set?: Prisma.ExecutionPlanWhereUniqueInput | Prisma.ExecutionPlanWhereUniqueInput[];
    disconnect?: Prisma.ExecutionPlanWhereUniqueInput | Prisma.ExecutionPlanWhereUniqueInput[];
    delete?: Prisma.ExecutionPlanWhereUniqueInput | Prisma.ExecutionPlanWhereUniqueInput[];
    connect?: Prisma.ExecutionPlanWhereUniqueInput | Prisma.ExecutionPlanWhereUniqueInput[];
    update?: Prisma.ExecutionPlanUpdateWithWhereUniqueWithoutDecisionRuleInput | Prisma.ExecutionPlanUpdateWithWhereUniqueWithoutDecisionRuleInput[];
    updateMany?: Prisma.ExecutionPlanUpdateManyWithWhereWithoutDecisionRuleInput | Prisma.ExecutionPlanUpdateManyWithWhereWithoutDecisionRuleInput[];
    deleteMany?: Prisma.ExecutionPlanScalarWhereInput | Prisma.ExecutionPlanScalarWhereInput[];
};
export type ExecutionPlanCreateNestedManyWithoutActionDefinitionInput = {
    create?: Prisma.XOR<Prisma.ExecutionPlanCreateWithoutActionDefinitionInput, Prisma.ExecutionPlanUncheckedCreateWithoutActionDefinitionInput> | Prisma.ExecutionPlanCreateWithoutActionDefinitionInput[] | Prisma.ExecutionPlanUncheckedCreateWithoutActionDefinitionInput[];
    connectOrCreate?: Prisma.ExecutionPlanCreateOrConnectWithoutActionDefinitionInput | Prisma.ExecutionPlanCreateOrConnectWithoutActionDefinitionInput[];
    createMany?: Prisma.ExecutionPlanCreateManyActionDefinitionInputEnvelope;
    connect?: Prisma.ExecutionPlanWhereUniqueInput | Prisma.ExecutionPlanWhereUniqueInput[];
};
export type ExecutionPlanUncheckedCreateNestedManyWithoutActionDefinitionInput = {
    create?: Prisma.XOR<Prisma.ExecutionPlanCreateWithoutActionDefinitionInput, Prisma.ExecutionPlanUncheckedCreateWithoutActionDefinitionInput> | Prisma.ExecutionPlanCreateWithoutActionDefinitionInput[] | Prisma.ExecutionPlanUncheckedCreateWithoutActionDefinitionInput[];
    connectOrCreate?: Prisma.ExecutionPlanCreateOrConnectWithoutActionDefinitionInput | Prisma.ExecutionPlanCreateOrConnectWithoutActionDefinitionInput[];
    createMany?: Prisma.ExecutionPlanCreateManyActionDefinitionInputEnvelope;
    connect?: Prisma.ExecutionPlanWhereUniqueInput | Prisma.ExecutionPlanWhereUniqueInput[];
};
export type ExecutionPlanUpdateManyWithoutActionDefinitionNestedInput = {
    create?: Prisma.XOR<Prisma.ExecutionPlanCreateWithoutActionDefinitionInput, Prisma.ExecutionPlanUncheckedCreateWithoutActionDefinitionInput> | Prisma.ExecutionPlanCreateWithoutActionDefinitionInput[] | Prisma.ExecutionPlanUncheckedCreateWithoutActionDefinitionInput[];
    connectOrCreate?: Prisma.ExecutionPlanCreateOrConnectWithoutActionDefinitionInput | Prisma.ExecutionPlanCreateOrConnectWithoutActionDefinitionInput[];
    upsert?: Prisma.ExecutionPlanUpsertWithWhereUniqueWithoutActionDefinitionInput | Prisma.ExecutionPlanUpsertWithWhereUniqueWithoutActionDefinitionInput[];
    createMany?: Prisma.ExecutionPlanCreateManyActionDefinitionInputEnvelope;
    set?: Prisma.ExecutionPlanWhereUniqueInput | Prisma.ExecutionPlanWhereUniqueInput[];
    disconnect?: Prisma.ExecutionPlanWhereUniqueInput | Prisma.ExecutionPlanWhereUniqueInput[];
    delete?: Prisma.ExecutionPlanWhereUniqueInput | Prisma.ExecutionPlanWhereUniqueInput[];
    connect?: Prisma.ExecutionPlanWhereUniqueInput | Prisma.ExecutionPlanWhereUniqueInput[];
    update?: Prisma.ExecutionPlanUpdateWithWhereUniqueWithoutActionDefinitionInput | Prisma.ExecutionPlanUpdateWithWhereUniqueWithoutActionDefinitionInput[];
    updateMany?: Prisma.ExecutionPlanUpdateManyWithWhereWithoutActionDefinitionInput | Prisma.ExecutionPlanUpdateManyWithWhereWithoutActionDefinitionInput[];
    deleteMany?: Prisma.ExecutionPlanScalarWhereInput | Prisma.ExecutionPlanScalarWhereInput[];
};
export type ExecutionPlanUncheckedUpdateManyWithoutActionDefinitionNestedInput = {
    create?: Prisma.XOR<Prisma.ExecutionPlanCreateWithoutActionDefinitionInput, Prisma.ExecutionPlanUncheckedCreateWithoutActionDefinitionInput> | Prisma.ExecutionPlanCreateWithoutActionDefinitionInput[] | Prisma.ExecutionPlanUncheckedCreateWithoutActionDefinitionInput[];
    connectOrCreate?: Prisma.ExecutionPlanCreateOrConnectWithoutActionDefinitionInput | Prisma.ExecutionPlanCreateOrConnectWithoutActionDefinitionInput[];
    upsert?: Prisma.ExecutionPlanUpsertWithWhereUniqueWithoutActionDefinitionInput | Prisma.ExecutionPlanUpsertWithWhereUniqueWithoutActionDefinitionInput[];
    createMany?: Prisma.ExecutionPlanCreateManyActionDefinitionInputEnvelope;
    set?: Prisma.ExecutionPlanWhereUniqueInput | Prisma.ExecutionPlanWhereUniqueInput[];
    disconnect?: Prisma.ExecutionPlanWhereUniqueInput | Prisma.ExecutionPlanWhereUniqueInput[];
    delete?: Prisma.ExecutionPlanWhereUniqueInput | Prisma.ExecutionPlanWhereUniqueInput[];
    connect?: Prisma.ExecutionPlanWhereUniqueInput | Prisma.ExecutionPlanWhereUniqueInput[];
    update?: Prisma.ExecutionPlanUpdateWithWhereUniqueWithoutActionDefinitionInput | Prisma.ExecutionPlanUpdateWithWhereUniqueWithoutActionDefinitionInput[];
    updateMany?: Prisma.ExecutionPlanUpdateManyWithWhereWithoutActionDefinitionInput | Prisma.ExecutionPlanUpdateManyWithWhereWithoutActionDefinitionInput[];
    deleteMany?: Prisma.ExecutionPlanScalarWhereInput | Prisma.ExecutionPlanScalarWhereInput[];
};
export type ExecutionPlanCreateWithoutDecisionRuleInput = {
    id?: string;
    stepOrder: number;
    continueOnFailure?: boolean;
    actionDefinition: Prisma.ActionDefinitionCreateNestedOneWithoutExecutionPlansInput;
};
export type ExecutionPlanUncheckedCreateWithoutDecisionRuleInput = {
    id?: string;
    actionDefinitionId: string;
    stepOrder: number;
    continueOnFailure?: boolean;
};
export type ExecutionPlanCreateOrConnectWithoutDecisionRuleInput = {
    where: Prisma.ExecutionPlanWhereUniqueInput;
    create: Prisma.XOR<Prisma.ExecutionPlanCreateWithoutDecisionRuleInput, Prisma.ExecutionPlanUncheckedCreateWithoutDecisionRuleInput>;
};
export type ExecutionPlanCreateManyDecisionRuleInputEnvelope = {
    data: Prisma.ExecutionPlanCreateManyDecisionRuleInput | Prisma.ExecutionPlanCreateManyDecisionRuleInput[];
    skipDuplicates?: boolean;
};
export type ExecutionPlanUpsertWithWhereUniqueWithoutDecisionRuleInput = {
    where: Prisma.ExecutionPlanWhereUniqueInput;
    update: Prisma.XOR<Prisma.ExecutionPlanUpdateWithoutDecisionRuleInput, Prisma.ExecutionPlanUncheckedUpdateWithoutDecisionRuleInput>;
    create: Prisma.XOR<Prisma.ExecutionPlanCreateWithoutDecisionRuleInput, Prisma.ExecutionPlanUncheckedCreateWithoutDecisionRuleInput>;
};
export type ExecutionPlanUpdateWithWhereUniqueWithoutDecisionRuleInput = {
    where: Prisma.ExecutionPlanWhereUniqueInput;
    data: Prisma.XOR<Prisma.ExecutionPlanUpdateWithoutDecisionRuleInput, Prisma.ExecutionPlanUncheckedUpdateWithoutDecisionRuleInput>;
};
export type ExecutionPlanUpdateManyWithWhereWithoutDecisionRuleInput = {
    where: Prisma.ExecutionPlanScalarWhereInput;
    data: Prisma.XOR<Prisma.ExecutionPlanUpdateManyMutationInput, Prisma.ExecutionPlanUncheckedUpdateManyWithoutDecisionRuleInput>;
};
export type ExecutionPlanScalarWhereInput = {
    AND?: Prisma.ExecutionPlanScalarWhereInput | Prisma.ExecutionPlanScalarWhereInput[];
    OR?: Prisma.ExecutionPlanScalarWhereInput[];
    NOT?: Prisma.ExecutionPlanScalarWhereInput | Prisma.ExecutionPlanScalarWhereInput[];
    id?: Prisma.StringFilter<"ExecutionPlan"> | string;
    decisionRuleId?: Prisma.StringFilter<"ExecutionPlan"> | string;
    actionDefinitionId?: Prisma.StringFilter<"ExecutionPlan"> | string;
    stepOrder?: Prisma.IntFilter<"ExecutionPlan"> | number;
    continueOnFailure?: Prisma.BoolFilter<"ExecutionPlan"> | boolean;
};
export type ExecutionPlanCreateWithoutActionDefinitionInput = {
    id?: string;
    stepOrder: number;
    continueOnFailure?: boolean;
    decisionRule: Prisma.DecisionRuleCreateNestedOneWithoutExecutionPlansInput;
};
export type ExecutionPlanUncheckedCreateWithoutActionDefinitionInput = {
    id?: string;
    decisionRuleId: string;
    stepOrder: number;
    continueOnFailure?: boolean;
};
export type ExecutionPlanCreateOrConnectWithoutActionDefinitionInput = {
    where: Prisma.ExecutionPlanWhereUniqueInput;
    create: Prisma.XOR<Prisma.ExecutionPlanCreateWithoutActionDefinitionInput, Prisma.ExecutionPlanUncheckedCreateWithoutActionDefinitionInput>;
};
export type ExecutionPlanCreateManyActionDefinitionInputEnvelope = {
    data: Prisma.ExecutionPlanCreateManyActionDefinitionInput | Prisma.ExecutionPlanCreateManyActionDefinitionInput[];
    skipDuplicates?: boolean;
};
export type ExecutionPlanUpsertWithWhereUniqueWithoutActionDefinitionInput = {
    where: Prisma.ExecutionPlanWhereUniqueInput;
    update: Prisma.XOR<Prisma.ExecutionPlanUpdateWithoutActionDefinitionInput, Prisma.ExecutionPlanUncheckedUpdateWithoutActionDefinitionInput>;
    create: Prisma.XOR<Prisma.ExecutionPlanCreateWithoutActionDefinitionInput, Prisma.ExecutionPlanUncheckedCreateWithoutActionDefinitionInput>;
};
export type ExecutionPlanUpdateWithWhereUniqueWithoutActionDefinitionInput = {
    where: Prisma.ExecutionPlanWhereUniqueInput;
    data: Prisma.XOR<Prisma.ExecutionPlanUpdateWithoutActionDefinitionInput, Prisma.ExecutionPlanUncheckedUpdateWithoutActionDefinitionInput>;
};
export type ExecutionPlanUpdateManyWithWhereWithoutActionDefinitionInput = {
    where: Prisma.ExecutionPlanScalarWhereInput;
    data: Prisma.XOR<Prisma.ExecutionPlanUpdateManyMutationInput, Prisma.ExecutionPlanUncheckedUpdateManyWithoutActionDefinitionInput>;
};
export type ExecutionPlanCreateManyDecisionRuleInput = {
    id?: string;
    actionDefinitionId: string;
    stepOrder: number;
    continueOnFailure?: boolean;
};
export type ExecutionPlanUpdateWithoutDecisionRuleInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    stepOrder?: Prisma.IntFieldUpdateOperationsInput | number;
    continueOnFailure?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    actionDefinition?: Prisma.ActionDefinitionUpdateOneRequiredWithoutExecutionPlansNestedInput;
};
export type ExecutionPlanUncheckedUpdateWithoutDecisionRuleInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    actionDefinitionId?: Prisma.StringFieldUpdateOperationsInput | string;
    stepOrder?: Prisma.IntFieldUpdateOperationsInput | number;
    continueOnFailure?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type ExecutionPlanUncheckedUpdateManyWithoutDecisionRuleInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    actionDefinitionId?: Prisma.StringFieldUpdateOperationsInput | string;
    stepOrder?: Prisma.IntFieldUpdateOperationsInput | number;
    continueOnFailure?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type ExecutionPlanCreateManyActionDefinitionInput = {
    id?: string;
    decisionRuleId: string;
    stepOrder: number;
    continueOnFailure?: boolean;
};
export type ExecutionPlanUpdateWithoutActionDefinitionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    stepOrder?: Prisma.IntFieldUpdateOperationsInput | number;
    continueOnFailure?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    decisionRule?: Prisma.DecisionRuleUpdateOneRequiredWithoutExecutionPlansNestedInput;
};
export type ExecutionPlanUncheckedUpdateWithoutActionDefinitionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    decisionRuleId?: Prisma.StringFieldUpdateOperationsInput | string;
    stepOrder?: Prisma.IntFieldUpdateOperationsInput | number;
    continueOnFailure?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type ExecutionPlanUncheckedUpdateManyWithoutActionDefinitionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    decisionRuleId?: Prisma.StringFieldUpdateOperationsInput | string;
    stepOrder?: Prisma.IntFieldUpdateOperationsInput | number;
    continueOnFailure?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type ExecutionPlanSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    decisionRuleId?: boolean;
    actionDefinitionId?: boolean;
    stepOrder?: boolean;
    continueOnFailure?: boolean;
    decisionRule?: boolean | Prisma.DecisionRuleDefaultArgs<ExtArgs>;
    actionDefinition?: boolean | Prisma.ActionDefinitionDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["executionPlan"]>;
export type ExecutionPlanSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    decisionRuleId?: boolean;
    actionDefinitionId?: boolean;
    stepOrder?: boolean;
    continueOnFailure?: boolean;
    decisionRule?: boolean | Prisma.DecisionRuleDefaultArgs<ExtArgs>;
    actionDefinition?: boolean | Prisma.ActionDefinitionDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["executionPlan"]>;
export type ExecutionPlanSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    decisionRuleId?: boolean;
    actionDefinitionId?: boolean;
    stepOrder?: boolean;
    continueOnFailure?: boolean;
    decisionRule?: boolean | Prisma.DecisionRuleDefaultArgs<ExtArgs>;
    actionDefinition?: boolean | Prisma.ActionDefinitionDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["executionPlan"]>;
export type ExecutionPlanSelectScalar = {
    id?: boolean;
    decisionRuleId?: boolean;
    actionDefinitionId?: boolean;
    stepOrder?: boolean;
    continueOnFailure?: boolean;
};
export type ExecutionPlanOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "decisionRuleId" | "actionDefinitionId" | "stepOrder" | "continueOnFailure", ExtArgs["result"]["executionPlan"]>;
export type ExecutionPlanInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    decisionRule?: boolean | Prisma.DecisionRuleDefaultArgs<ExtArgs>;
    actionDefinition?: boolean | Prisma.ActionDefinitionDefaultArgs<ExtArgs>;
};
export type ExecutionPlanIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    decisionRule?: boolean | Prisma.DecisionRuleDefaultArgs<ExtArgs>;
    actionDefinition?: boolean | Prisma.ActionDefinitionDefaultArgs<ExtArgs>;
};
export type ExecutionPlanIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    decisionRule?: boolean | Prisma.DecisionRuleDefaultArgs<ExtArgs>;
    actionDefinition?: boolean | Prisma.ActionDefinitionDefaultArgs<ExtArgs>;
};
export type $ExecutionPlanPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ExecutionPlan";
    objects: {
        decisionRule: Prisma.$DecisionRulePayload<ExtArgs>;
        actionDefinition: Prisma.$ActionDefinitionPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        decisionRuleId: string;
        actionDefinitionId: string;
        stepOrder: number;
        continueOnFailure: boolean;
    }, ExtArgs["result"]["executionPlan"]>;
    composites: {};
};
export type ExecutionPlanGetPayload<S extends boolean | null | undefined | ExecutionPlanDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ExecutionPlanPayload, S>;
export type ExecutionPlanCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ExecutionPlanFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ExecutionPlanCountAggregateInputType | true;
};
export interface ExecutionPlanDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ExecutionPlan'];
        meta: {
            name: 'ExecutionPlan';
        };
    };
    /**
     * Find zero or one ExecutionPlan that matches the filter.
     * @param {ExecutionPlanFindUniqueArgs} args - Arguments to find a ExecutionPlan
     * @example
     * // Get one ExecutionPlan
     * const executionPlan = await prisma.executionPlan.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ExecutionPlanFindUniqueArgs>(args: Prisma.SelectSubset<T, ExecutionPlanFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ExecutionPlanClient<runtime.Types.Result.GetResult<Prisma.$ExecutionPlanPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one ExecutionPlan that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ExecutionPlanFindUniqueOrThrowArgs} args - Arguments to find a ExecutionPlan
     * @example
     * // Get one ExecutionPlan
     * const executionPlan = await prisma.executionPlan.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ExecutionPlanFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ExecutionPlanFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ExecutionPlanClient<runtime.Types.Result.GetResult<Prisma.$ExecutionPlanPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first ExecutionPlan that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExecutionPlanFindFirstArgs} args - Arguments to find a ExecutionPlan
     * @example
     * // Get one ExecutionPlan
     * const executionPlan = await prisma.executionPlan.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ExecutionPlanFindFirstArgs>(args?: Prisma.SelectSubset<T, ExecutionPlanFindFirstArgs<ExtArgs>>): Prisma.Prisma__ExecutionPlanClient<runtime.Types.Result.GetResult<Prisma.$ExecutionPlanPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first ExecutionPlan that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExecutionPlanFindFirstOrThrowArgs} args - Arguments to find a ExecutionPlan
     * @example
     * // Get one ExecutionPlan
     * const executionPlan = await prisma.executionPlan.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ExecutionPlanFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ExecutionPlanFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ExecutionPlanClient<runtime.Types.Result.GetResult<Prisma.$ExecutionPlanPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more ExecutionPlans that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExecutionPlanFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ExecutionPlans
     * const executionPlans = await prisma.executionPlan.findMany()
     *
     * // Get first 10 ExecutionPlans
     * const executionPlans = await prisma.executionPlan.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const executionPlanWithIdOnly = await prisma.executionPlan.findMany({ select: { id: true } })
     *
     */
    findMany<T extends ExecutionPlanFindManyArgs>(args?: Prisma.SelectSubset<T, ExecutionPlanFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ExecutionPlanPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a ExecutionPlan.
     * @param {ExecutionPlanCreateArgs} args - Arguments to create a ExecutionPlan.
     * @example
     * // Create one ExecutionPlan
     * const ExecutionPlan = await prisma.executionPlan.create({
     *   data: {
     *     // ... data to create a ExecutionPlan
     *   }
     * })
     *
     */
    create<T extends ExecutionPlanCreateArgs>(args: Prisma.SelectSubset<T, ExecutionPlanCreateArgs<ExtArgs>>): Prisma.Prisma__ExecutionPlanClient<runtime.Types.Result.GetResult<Prisma.$ExecutionPlanPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many ExecutionPlans.
     * @param {ExecutionPlanCreateManyArgs} args - Arguments to create many ExecutionPlans.
     * @example
     * // Create many ExecutionPlans
     * const executionPlan = await prisma.executionPlan.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends ExecutionPlanCreateManyArgs>(args?: Prisma.SelectSubset<T, ExecutionPlanCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many ExecutionPlans and returns the data saved in the database.
     * @param {ExecutionPlanCreateManyAndReturnArgs} args - Arguments to create many ExecutionPlans.
     * @example
     * // Create many ExecutionPlans
     * const executionPlan = await prisma.executionPlan.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many ExecutionPlans and only return the `id`
     * const executionPlanWithIdOnly = await prisma.executionPlan.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends ExecutionPlanCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ExecutionPlanCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ExecutionPlanPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a ExecutionPlan.
     * @param {ExecutionPlanDeleteArgs} args - Arguments to delete one ExecutionPlan.
     * @example
     * // Delete one ExecutionPlan
     * const ExecutionPlan = await prisma.executionPlan.delete({
     *   where: {
     *     // ... filter to delete one ExecutionPlan
     *   }
     * })
     *
     */
    delete<T extends ExecutionPlanDeleteArgs>(args: Prisma.SelectSubset<T, ExecutionPlanDeleteArgs<ExtArgs>>): Prisma.Prisma__ExecutionPlanClient<runtime.Types.Result.GetResult<Prisma.$ExecutionPlanPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one ExecutionPlan.
     * @param {ExecutionPlanUpdateArgs} args - Arguments to update one ExecutionPlan.
     * @example
     * // Update one ExecutionPlan
     * const executionPlan = await prisma.executionPlan.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends ExecutionPlanUpdateArgs>(args: Prisma.SelectSubset<T, ExecutionPlanUpdateArgs<ExtArgs>>): Prisma.Prisma__ExecutionPlanClient<runtime.Types.Result.GetResult<Prisma.$ExecutionPlanPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more ExecutionPlans.
     * @param {ExecutionPlanDeleteManyArgs} args - Arguments to filter ExecutionPlans to delete.
     * @example
     * // Delete a few ExecutionPlans
     * const { count } = await prisma.executionPlan.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends ExecutionPlanDeleteManyArgs>(args?: Prisma.SelectSubset<T, ExecutionPlanDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more ExecutionPlans.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExecutionPlanUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ExecutionPlans
     * const executionPlan = await prisma.executionPlan.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends ExecutionPlanUpdateManyArgs>(args: Prisma.SelectSubset<T, ExecutionPlanUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more ExecutionPlans and returns the data updated in the database.
     * @param {ExecutionPlanUpdateManyAndReturnArgs} args - Arguments to update many ExecutionPlans.
     * @example
     * // Update many ExecutionPlans
     * const executionPlan = await prisma.executionPlan.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more ExecutionPlans and only return the `id`
     * const executionPlanWithIdOnly = await prisma.executionPlan.updateManyAndReturn({
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
    updateManyAndReturn<T extends ExecutionPlanUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ExecutionPlanUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ExecutionPlanPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one ExecutionPlan.
     * @param {ExecutionPlanUpsertArgs} args - Arguments to update or create a ExecutionPlan.
     * @example
     * // Update or create a ExecutionPlan
     * const executionPlan = await prisma.executionPlan.upsert({
     *   create: {
     *     // ... data to create a ExecutionPlan
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ExecutionPlan we want to update
     *   }
     * })
     */
    upsert<T extends ExecutionPlanUpsertArgs>(args: Prisma.SelectSubset<T, ExecutionPlanUpsertArgs<ExtArgs>>): Prisma.Prisma__ExecutionPlanClient<runtime.Types.Result.GetResult<Prisma.$ExecutionPlanPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of ExecutionPlans.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExecutionPlanCountArgs} args - Arguments to filter ExecutionPlans to count.
     * @example
     * // Count the number of ExecutionPlans
     * const count = await prisma.executionPlan.count({
     *   where: {
     *     // ... the filter for the ExecutionPlans we want to count
     *   }
     * })
    **/
    count<T extends ExecutionPlanCountArgs>(args?: Prisma.Subset<T, ExecutionPlanCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ExecutionPlanCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a ExecutionPlan.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExecutionPlanAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ExecutionPlanAggregateArgs>(args: Prisma.Subset<T, ExecutionPlanAggregateArgs>): Prisma.PrismaPromise<GetExecutionPlanAggregateType<T>>;
    /**
     * Group by ExecutionPlan.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExecutionPlanGroupByArgs} args - Group by arguments.
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
    groupBy<T extends ExecutionPlanGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ExecutionPlanGroupByArgs['orderBy'];
    } : {
        orderBy?: ExecutionPlanGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ExecutionPlanGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetExecutionPlanGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the ExecutionPlan model
     */
    readonly fields: ExecutionPlanFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for ExecutionPlan.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__ExecutionPlanClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    decisionRule<T extends Prisma.DecisionRuleDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.DecisionRuleDefaultArgs<ExtArgs>>): Prisma.Prisma__DecisionRuleClient<runtime.Types.Result.GetResult<Prisma.$DecisionRulePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    actionDefinition<T extends Prisma.ActionDefinitionDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ActionDefinitionDefaultArgs<ExtArgs>>): Prisma.Prisma__ActionDefinitionClient<runtime.Types.Result.GetResult<Prisma.$ActionDefinitionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
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
 * Fields of the ExecutionPlan model
 */
export interface ExecutionPlanFieldRefs {
    readonly id: Prisma.FieldRef<"ExecutionPlan", 'String'>;
    readonly decisionRuleId: Prisma.FieldRef<"ExecutionPlan", 'String'>;
    readonly actionDefinitionId: Prisma.FieldRef<"ExecutionPlan", 'String'>;
    readonly stepOrder: Prisma.FieldRef<"ExecutionPlan", 'Int'>;
    readonly continueOnFailure: Prisma.FieldRef<"ExecutionPlan", 'Boolean'>;
}
/**
 * ExecutionPlan findUnique
 */
export type ExecutionPlanFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which ExecutionPlan to fetch.
     */
    where: Prisma.ExecutionPlanWhereUniqueInput;
};
/**
 * ExecutionPlan findUniqueOrThrow
 */
export type ExecutionPlanFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which ExecutionPlan to fetch.
     */
    where: Prisma.ExecutionPlanWhereUniqueInput;
};
/**
 * ExecutionPlan findFirst
 */
export type ExecutionPlanFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which ExecutionPlan to fetch.
     */
    where?: Prisma.ExecutionPlanWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ExecutionPlans to fetch.
     */
    orderBy?: Prisma.ExecutionPlanOrderByWithRelationInput | Prisma.ExecutionPlanOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ExecutionPlans.
     */
    cursor?: Prisma.ExecutionPlanWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ExecutionPlans from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ExecutionPlans.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ExecutionPlans.
     */
    distinct?: Prisma.ExecutionPlanScalarFieldEnum | Prisma.ExecutionPlanScalarFieldEnum[];
};
/**
 * ExecutionPlan findFirstOrThrow
 */
export type ExecutionPlanFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which ExecutionPlan to fetch.
     */
    where?: Prisma.ExecutionPlanWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ExecutionPlans to fetch.
     */
    orderBy?: Prisma.ExecutionPlanOrderByWithRelationInput | Prisma.ExecutionPlanOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ExecutionPlans.
     */
    cursor?: Prisma.ExecutionPlanWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ExecutionPlans from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ExecutionPlans.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ExecutionPlans.
     */
    distinct?: Prisma.ExecutionPlanScalarFieldEnum | Prisma.ExecutionPlanScalarFieldEnum[];
};
/**
 * ExecutionPlan findMany
 */
export type ExecutionPlanFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which ExecutionPlans to fetch.
     */
    where?: Prisma.ExecutionPlanWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ExecutionPlans to fetch.
     */
    orderBy?: Prisma.ExecutionPlanOrderByWithRelationInput | Prisma.ExecutionPlanOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing ExecutionPlans.
     */
    cursor?: Prisma.ExecutionPlanWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ExecutionPlans from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ExecutionPlans.
     */
    skip?: number;
    distinct?: Prisma.ExecutionPlanScalarFieldEnum | Prisma.ExecutionPlanScalarFieldEnum[];
};
/**
 * ExecutionPlan create
 */
export type ExecutionPlanCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The data needed to create a ExecutionPlan.
     */
    data: Prisma.XOR<Prisma.ExecutionPlanCreateInput, Prisma.ExecutionPlanUncheckedCreateInput>;
};
/**
 * ExecutionPlan createMany
 */
export type ExecutionPlanCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many ExecutionPlans.
     */
    data: Prisma.ExecutionPlanCreateManyInput | Prisma.ExecutionPlanCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * ExecutionPlan createManyAndReturn
 */
export type ExecutionPlanCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExecutionPlan
     */
    select?: Prisma.ExecutionPlanSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the ExecutionPlan
     */
    omit?: Prisma.ExecutionPlanOmit<ExtArgs> | null;
    /**
     * The data used to create many ExecutionPlans.
     */
    data: Prisma.ExecutionPlanCreateManyInput | Prisma.ExecutionPlanCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ExecutionPlanIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * ExecutionPlan update
 */
export type ExecutionPlanUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The data needed to update a ExecutionPlan.
     */
    data: Prisma.XOR<Prisma.ExecutionPlanUpdateInput, Prisma.ExecutionPlanUncheckedUpdateInput>;
    /**
     * Choose, which ExecutionPlan to update.
     */
    where: Prisma.ExecutionPlanWhereUniqueInput;
};
/**
 * ExecutionPlan updateMany
 */
export type ExecutionPlanUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update ExecutionPlans.
     */
    data: Prisma.XOR<Prisma.ExecutionPlanUpdateManyMutationInput, Prisma.ExecutionPlanUncheckedUpdateManyInput>;
    /**
     * Filter which ExecutionPlans to update
     */
    where?: Prisma.ExecutionPlanWhereInput;
    /**
     * Limit how many ExecutionPlans to update.
     */
    limit?: number;
};
/**
 * ExecutionPlan updateManyAndReturn
 */
export type ExecutionPlanUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExecutionPlan
     */
    select?: Prisma.ExecutionPlanSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the ExecutionPlan
     */
    omit?: Prisma.ExecutionPlanOmit<ExtArgs> | null;
    /**
     * The data used to update ExecutionPlans.
     */
    data: Prisma.XOR<Prisma.ExecutionPlanUpdateManyMutationInput, Prisma.ExecutionPlanUncheckedUpdateManyInput>;
    /**
     * Filter which ExecutionPlans to update
     */
    where?: Prisma.ExecutionPlanWhereInput;
    /**
     * Limit how many ExecutionPlans to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ExecutionPlanIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * ExecutionPlan upsert
 */
export type ExecutionPlanUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The filter to search for the ExecutionPlan to update in case it exists.
     */
    where: Prisma.ExecutionPlanWhereUniqueInput;
    /**
     * In case the ExecutionPlan found by the `where` argument doesn't exist, create a new ExecutionPlan with this data.
     */
    create: Prisma.XOR<Prisma.ExecutionPlanCreateInput, Prisma.ExecutionPlanUncheckedCreateInput>;
    /**
     * In case the ExecutionPlan was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.ExecutionPlanUpdateInput, Prisma.ExecutionPlanUncheckedUpdateInput>;
};
/**
 * ExecutionPlan delete
 */
export type ExecutionPlanDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter which ExecutionPlan to delete.
     */
    where: Prisma.ExecutionPlanWhereUniqueInput;
};
/**
 * ExecutionPlan deleteMany
 */
export type ExecutionPlanDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which ExecutionPlans to delete
     */
    where?: Prisma.ExecutionPlanWhereInput;
    /**
     * Limit how many ExecutionPlans to delete.
     */
    limit?: number;
};
/**
 * ExecutionPlan without action
 */
export type ExecutionPlanDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
};
export {};
//# sourceMappingURL=ExecutionPlan.d.ts.map