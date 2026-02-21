import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
/**
 * Model EntityType
 *
 */
export type EntityTypeModel = runtime.Types.Result.DefaultSelection<Prisma.$EntityTypePayload>;
export type AggregateEntityType = {
    _count: EntityTypeCountAggregateOutputType | null;
    _avg: EntityTypeAvgAggregateOutputType | null;
    _sum: EntityTypeSumAggregateOutputType | null;
    _min: EntityTypeMinAggregateOutputType | null;
    _max: EntityTypeMaxAggregateOutputType | null;
};
export type EntityTypeAvgAggregateOutputType = {
    version: number | null;
};
export type EntityTypeSumAggregateOutputType = {
    version: number | null;
};
export type EntityTypeMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    version: number | null;
    createdAt: Date | null;
};
export type EntityTypeMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    version: number | null;
    createdAt: Date | null;
};
export type EntityTypeCountAggregateOutputType = {
    id: number;
    name: number;
    version: number;
    createdAt: number;
    _all: number;
};
export type EntityTypeAvgAggregateInputType = {
    version?: true;
};
export type EntityTypeSumAggregateInputType = {
    version?: true;
};
export type EntityTypeMinAggregateInputType = {
    id?: true;
    name?: true;
    version?: true;
    createdAt?: true;
};
export type EntityTypeMaxAggregateInputType = {
    id?: true;
    name?: true;
    version?: true;
    createdAt?: true;
};
export type EntityTypeCountAggregateInputType = {
    id?: true;
    name?: true;
    version?: true;
    createdAt?: true;
    _all?: true;
};
export type EntityTypeAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which EntityType to aggregate.
     */
    where?: Prisma.EntityTypeWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of EntityTypes to fetch.
     */
    orderBy?: Prisma.EntityTypeOrderByWithRelationInput | Prisma.EntityTypeOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.EntityTypeWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` EntityTypes from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` EntityTypes.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned EntityTypes
    **/
    _count?: true | EntityTypeCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: EntityTypeAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: EntityTypeSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: EntityTypeMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: EntityTypeMaxAggregateInputType;
};
export type GetEntityTypeAggregateType<T extends EntityTypeAggregateArgs> = {
    [P in keyof T & keyof AggregateEntityType]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateEntityType[P]> : Prisma.GetScalarType<T[P], AggregateEntityType[P]>;
};
export type EntityTypeGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EntityTypeWhereInput;
    orderBy?: Prisma.EntityTypeOrderByWithAggregationInput | Prisma.EntityTypeOrderByWithAggregationInput[];
    by: Prisma.EntityTypeScalarFieldEnum[] | Prisma.EntityTypeScalarFieldEnum;
    having?: Prisma.EntityTypeScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: EntityTypeCountAggregateInputType | true;
    _avg?: EntityTypeAvgAggregateInputType;
    _sum?: EntityTypeSumAggregateInputType;
    _min?: EntityTypeMinAggregateInputType;
    _max?: EntityTypeMaxAggregateInputType;
};
export type EntityTypeGroupByOutputType = {
    id: string;
    name: string;
    version: number;
    createdAt: Date;
    _count: EntityTypeCountAggregateOutputType | null;
    _avg: EntityTypeAvgAggregateOutputType | null;
    _sum: EntityTypeSumAggregateOutputType | null;
    _min: EntityTypeMinAggregateOutputType | null;
    _max: EntityTypeMaxAggregateOutputType | null;
};
type GetEntityTypeGroupByPayload<T extends EntityTypeGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<EntityTypeGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof EntityTypeGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], EntityTypeGroupByOutputType[P]> : Prisma.GetScalarType<T[P], EntityTypeGroupByOutputType[P]>;
}>>;
export type EntityTypeWhereInput = {
    AND?: Prisma.EntityTypeWhereInput | Prisma.EntityTypeWhereInput[];
    OR?: Prisma.EntityTypeWhereInput[];
    NOT?: Prisma.EntityTypeWhereInput | Prisma.EntityTypeWhereInput[];
    id?: Prisma.StringFilter<"EntityType"> | string;
    name?: Prisma.StringFilter<"EntityType"> | string;
    version?: Prisma.IntFilter<"EntityType"> | number;
    createdAt?: Prisma.DateTimeFilter<"EntityType"> | Date | string;
    attributes?: Prisma.AttributeDefinitionListRelationFilter;
    instances?: Prisma.EntityInstanceListRelationFilter;
    outgoingRelationships?: Prisma.RelationshipDefinitionListRelationFilter;
    incomingRelationships?: Prisma.RelationshipDefinitionListRelationFilter;
};
export type EntityTypeOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    version?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    attributes?: Prisma.AttributeDefinitionOrderByRelationAggregateInput;
    instances?: Prisma.EntityInstanceOrderByRelationAggregateInput;
    outgoingRelationships?: Prisma.RelationshipDefinitionOrderByRelationAggregateInput;
    incomingRelationships?: Prisma.RelationshipDefinitionOrderByRelationAggregateInput;
};
export type EntityTypeWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    name_version?: Prisma.EntityTypeNameVersionCompoundUniqueInput;
    AND?: Prisma.EntityTypeWhereInput | Prisma.EntityTypeWhereInput[];
    OR?: Prisma.EntityTypeWhereInput[];
    NOT?: Prisma.EntityTypeWhereInput | Prisma.EntityTypeWhereInput[];
    name?: Prisma.StringFilter<"EntityType"> | string;
    version?: Prisma.IntFilter<"EntityType"> | number;
    createdAt?: Prisma.DateTimeFilter<"EntityType"> | Date | string;
    attributes?: Prisma.AttributeDefinitionListRelationFilter;
    instances?: Prisma.EntityInstanceListRelationFilter;
    outgoingRelationships?: Prisma.RelationshipDefinitionListRelationFilter;
    incomingRelationships?: Prisma.RelationshipDefinitionListRelationFilter;
}, "id" | "name_version">;
export type EntityTypeOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    version?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.EntityTypeCountOrderByAggregateInput;
    _avg?: Prisma.EntityTypeAvgOrderByAggregateInput;
    _max?: Prisma.EntityTypeMaxOrderByAggregateInput;
    _min?: Prisma.EntityTypeMinOrderByAggregateInput;
    _sum?: Prisma.EntityTypeSumOrderByAggregateInput;
};
export type EntityTypeScalarWhereWithAggregatesInput = {
    AND?: Prisma.EntityTypeScalarWhereWithAggregatesInput | Prisma.EntityTypeScalarWhereWithAggregatesInput[];
    OR?: Prisma.EntityTypeScalarWhereWithAggregatesInput[];
    NOT?: Prisma.EntityTypeScalarWhereWithAggregatesInput | Prisma.EntityTypeScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"EntityType"> | string;
    name?: Prisma.StringWithAggregatesFilter<"EntityType"> | string;
    version?: Prisma.IntWithAggregatesFilter<"EntityType"> | number;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"EntityType"> | Date | string;
};
export type EntityTypeCreateInput = {
    id?: string;
    name: string;
    version: number;
    createdAt?: Date | string;
    attributes?: Prisma.AttributeDefinitionCreateNestedManyWithoutEntityTypeInput;
    instances?: Prisma.EntityInstanceCreateNestedManyWithoutEntityTypeInput;
    outgoingRelationships?: Prisma.RelationshipDefinitionCreateNestedManyWithoutSourceEntityTypeInput;
    incomingRelationships?: Prisma.RelationshipDefinitionCreateNestedManyWithoutTargetEntityTypeInput;
};
export type EntityTypeUncheckedCreateInput = {
    id?: string;
    name: string;
    version: number;
    createdAt?: Date | string;
    attributes?: Prisma.AttributeDefinitionUncheckedCreateNestedManyWithoutEntityTypeInput;
    instances?: Prisma.EntityInstanceUncheckedCreateNestedManyWithoutEntityTypeInput;
    outgoingRelationships?: Prisma.RelationshipDefinitionUncheckedCreateNestedManyWithoutSourceEntityTypeInput;
    incomingRelationships?: Prisma.RelationshipDefinitionUncheckedCreateNestedManyWithoutTargetEntityTypeInput;
};
export type EntityTypeUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    attributes?: Prisma.AttributeDefinitionUpdateManyWithoutEntityTypeNestedInput;
    instances?: Prisma.EntityInstanceUpdateManyWithoutEntityTypeNestedInput;
    outgoingRelationships?: Prisma.RelationshipDefinitionUpdateManyWithoutSourceEntityTypeNestedInput;
    incomingRelationships?: Prisma.RelationshipDefinitionUpdateManyWithoutTargetEntityTypeNestedInput;
};
export type EntityTypeUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    attributes?: Prisma.AttributeDefinitionUncheckedUpdateManyWithoutEntityTypeNestedInput;
    instances?: Prisma.EntityInstanceUncheckedUpdateManyWithoutEntityTypeNestedInput;
    outgoingRelationships?: Prisma.RelationshipDefinitionUncheckedUpdateManyWithoutSourceEntityTypeNestedInput;
    incomingRelationships?: Prisma.RelationshipDefinitionUncheckedUpdateManyWithoutTargetEntityTypeNestedInput;
};
export type EntityTypeCreateManyInput = {
    id?: string;
    name: string;
    version: number;
    createdAt?: Date | string;
};
export type EntityTypeUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type EntityTypeUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type EntityTypeNameVersionCompoundUniqueInput = {
    name: string;
    version: number;
};
export type EntityTypeCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    version?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type EntityTypeAvgOrderByAggregateInput = {
    version?: Prisma.SortOrder;
};
export type EntityTypeMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    version?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type EntityTypeMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    version?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type EntityTypeSumOrderByAggregateInput = {
    version?: Prisma.SortOrder;
};
export type EntityTypeScalarRelationFilter = {
    is?: Prisma.EntityTypeWhereInput;
    isNot?: Prisma.EntityTypeWhereInput;
};
export type StringFieldUpdateOperationsInput = {
    set?: string;
};
export type IntFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
};
export type EntityTypeCreateNestedOneWithoutAttributesInput = {
    create?: Prisma.XOR<Prisma.EntityTypeCreateWithoutAttributesInput, Prisma.EntityTypeUncheckedCreateWithoutAttributesInput>;
    connectOrCreate?: Prisma.EntityTypeCreateOrConnectWithoutAttributesInput;
    connect?: Prisma.EntityTypeWhereUniqueInput;
};
export type EntityTypeUpdateOneRequiredWithoutAttributesNestedInput = {
    create?: Prisma.XOR<Prisma.EntityTypeCreateWithoutAttributesInput, Prisma.EntityTypeUncheckedCreateWithoutAttributesInput>;
    connectOrCreate?: Prisma.EntityTypeCreateOrConnectWithoutAttributesInput;
    upsert?: Prisma.EntityTypeUpsertWithoutAttributesInput;
    connect?: Prisma.EntityTypeWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.EntityTypeUpdateToOneWithWhereWithoutAttributesInput, Prisma.EntityTypeUpdateWithoutAttributesInput>, Prisma.EntityTypeUncheckedUpdateWithoutAttributesInput>;
};
export type EntityTypeCreateNestedOneWithoutOutgoingRelationshipsInput = {
    create?: Prisma.XOR<Prisma.EntityTypeCreateWithoutOutgoingRelationshipsInput, Prisma.EntityTypeUncheckedCreateWithoutOutgoingRelationshipsInput>;
    connectOrCreate?: Prisma.EntityTypeCreateOrConnectWithoutOutgoingRelationshipsInput;
    connect?: Prisma.EntityTypeWhereUniqueInput;
};
export type EntityTypeCreateNestedOneWithoutIncomingRelationshipsInput = {
    create?: Prisma.XOR<Prisma.EntityTypeCreateWithoutIncomingRelationshipsInput, Prisma.EntityTypeUncheckedCreateWithoutIncomingRelationshipsInput>;
    connectOrCreate?: Prisma.EntityTypeCreateOrConnectWithoutIncomingRelationshipsInput;
    connect?: Prisma.EntityTypeWhereUniqueInput;
};
export type EntityTypeUpdateOneRequiredWithoutOutgoingRelationshipsNestedInput = {
    create?: Prisma.XOR<Prisma.EntityTypeCreateWithoutOutgoingRelationshipsInput, Prisma.EntityTypeUncheckedCreateWithoutOutgoingRelationshipsInput>;
    connectOrCreate?: Prisma.EntityTypeCreateOrConnectWithoutOutgoingRelationshipsInput;
    upsert?: Prisma.EntityTypeUpsertWithoutOutgoingRelationshipsInput;
    connect?: Prisma.EntityTypeWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.EntityTypeUpdateToOneWithWhereWithoutOutgoingRelationshipsInput, Prisma.EntityTypeUpdateWithoutOutgoingRelationshipsInput>, Prisma.EntityTypeUncheckedUpdateWithoutOutgoingRelationshipsInput>;
};
export type EntityTypeUpdateOneRequiredWithoutIncomingRelationshipsNestedInput = {
    create?: Prisma.XOR<Prisma.EntityTypeCreateWithoutIncomingRelationshipsInput, Prisma.EntityTypeUncheckedCreateWithoutIncomingRelationshipsInput>;
    connectOrCreate?: Prisma.EntityTypeCreateOrConnectWithoutIncomingRelationshipsInput;
    upsert?: Prisma.EntityTypeUpsertWithoutIncomingRelationshipsInput;
    connect?: Prisma.EntityTypeWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.EntityTypeUpdateToOneWithWhereWithoutIncomingRelationshipsInput, Prisma.EntityTypeUpdateWithoutIncomingRelationshipsInput>, Prisma.EntityTypeUncheckedUpdateWithoutIncomingRelationshipsInput>;
};
export type EntityTypeCreateNestedOneWithoutInstancesInput = {
    create?: Prisma.XOR<Prisma.EntityTypeCreateWithoutInstancesInput, Prisma.EntityTypeUncheckedCreateWithoutInstancesInput>;
    connectOrCreate?: Prisma.EntityTypeCreateOrConnectWithoutInstancesInput;
    connect?: Prisma.EntityTypeWhereUniqueInput;
};
export type EntityTypeUpdateOneRequiredWithoutInstancesNestedInput = {
    create?: Prisma.XOR<Prisma.EntityTypeCreateWithoutInstancesInput, Prisma.EntityTypeUncheckedCreateWithoutInstancesInput>;
    connectOrCreate?: Prisma.EntityTypeCreateOrConnectWithoutInstancesInput;
    upsert?: Prisma.EntityTypeUpsertWithoutInstancesInput;
    connect?: Prisma.EntityTypeWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.EntityTypeUpdateToOneWithWhereWithoutInstancesInput, Prisma.EntityTypeUpdateWithoutInstancesInput>, Prisma.EntityTypeUncheckedUpdateWithoutInstancesInput>;
};
export type EntityTypeCreateWithoutAttributesInput = {
    id?: string;
    name: string;
    version: number;
    createdAt?: Date | string;
    instances?: Prisma.EntityInstanceCreateNestedManyWithoutEntityTypeInput;
    outgoingRelationships?: Prisma.RelationshipDefinitionCreateNestedManyWithoutSourceEntityTypeInput;
    incomingRelationships?: Prisma.RelationshipDefinitionCreateNestedManyWithoutTargetEntityTypeInput;
};
export type EntityTypeUncheckedCreateWithoutAttributesInput = {
    id?: string;
    name: string;
    version: number;
    createdAt?: Date | string;
    instances?: Prisma.EntityInstanceUncheckedCreateNestedManyWithoutEntityTypeInput;
    outgoingRelationships?: Prisma.RelationshipDefinitionUncheckedCreateNestedManyWithoutSourceEntityTypeInput;
    incomingRelationships?: Prisma.RelationshipDefinitionUncheckedCreateNestedManyWithoutTargetEntityTypeInput;
};
export type EntityTypeCreateOrConnectWithoutAttributesInput = {
    where: Prisma.EntityTypeWhereUniqueInput;
    create: Prisma.XOR<Prisma.EntityTypeCreateWithoutAttributesInput, Prisma.EntityTypeUncheckedCreateWithoutAttributesInput>;
};
export type EntityTypeUpsertWithoutAttributesInput = {
    update: Prisma.XOR<Prisma.EntityTypeUpdateWithoutAttributesInput, Prisma.EntityTypeUncheckedUpdateWithoutAttributesInput>;
    create: Prisma.XOR<Prisma.EntityTypeCreateWithoutAttributesInput, Prisma.EntityTypeUncheckedCreateWithoutAttributesInput>;
    where?: Prisma.EntityTypeWhereInput;
};
export type EntityTypeUpdateToOneWithWhereWithoutAttributesInput = {
    where?: Prisma.EntityTypeWhereInput;
    data: Prisma.XOR<Prisma.EntityTypeUpdateWithoutAttributesInput, Prisma.EntityTypeUncheckedUpdateWithoutAttributesInput>;
};
export type EntityTypeUpdateWithoutAttributesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    instances?: Prisma.EntityInstanceUpdateManyWithoutEntityTypeNestedInput;
    outgoingRelationships?: Prisma.RelationshipDefinitionUpdateManyWithoutSourceEntityTypeNestedInput;
    incomingRelationships?: Prisma.RelationshipDefinitionUpdateManyWithoutTargetEntityTypeNestedInput;
};
export type EntityTypeUncheckedUpdateWithoutAttributesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    instances?: Prisma.EntityInstanceUncheckedUpdateManyWithoutEntityTypeNestedInput;
    outgoingRelationships?: Prisma.RelationshipDefinitionUncheckedUpdateManyWithoutSourceEntityTypeNestedInput;
    incomingRelationships?: Prisma.RelationshipDefinitionUncheckedUpdateManyWithoutTargetEntityTypeNestedInput;
};
export type EntityTypeCreateWithoutOutgoingRelationshipsInput = {
    id?: string;
    name: string;
    version: number;
    createdAt?: Date | string;
    attributes?: Prisma.AttributeDefinitionCreateNestedManyWithoutEntityTypeInput;
    instances?: Prisma.EntityInstanceCreateNestedManyWithoutEntityTypeInput;
    incomingRelationships?: Prisma.RelationshipDefinitionCreateNestedManyWithoutTargetEntityTypeInput;
};
export type EntityTypeUncheckedCreateWithoutOutgoingRelationshipsInput = {
    id?: string;
    name: string;
    version: number;
    createdAt?: Date | string;
    attributes?: Prisma.AttributeDefinitionUncheckedCreateNestedManyWithoutEntityTypeInput;
    instances?: Prisma.EntityInstanceUncheckedCreateNestedManyWithoutEntityTypeInput;
    incomingRelationships?: Prisma.RelationshipDefinitionUncheckedCreateNestedManyWithoutTargetEntityTypeInput;
};
export type EntityTypeCreateOrConnectWithoutOutgoingRelationshipsInput = {
    where: Prisma.EntityTypeWhereUniqueInput;
    create: Prisma.XOR<Prisma.EntityTypeCreateWithoutOutgoingRelationshipsInput, Prisma.EntityTypeUncheckedCreateWithoutOutgoingRelationshipsInput>;
};
export type EntityTypeCreateWithoutIncomingRelationshipsInput = {
    id?: string;
    name: string;
    version: number;
    createdAt?: Date | string;
    attributes?: Prisma.AttributeDefinitionCreateNestedManyWithoutEntityTypeInput;
    instances?: Prisma.EntityInstanceCreateNestedManyWithoutEntityTypeInput;
    outgoingRelationships?: Prisma.RelationshipDefinitionCreateNestedManyWithoutSourceEntityTypeInput;
};
export type EntityTypeUncheckedCreateWithoutIncomingRelationshipsInput = {
    id?: string;
    name: string;
    version: number;
    createdAt?: Date | string;
    attributes?: Prisma.AttributeDefinitionUncheckedCreateNestedManyWithoutEntityTypeInput;
    instances?: Prisma.EntityInstanceUncheckedCreateNestedManyWithoutEntityTypeInput;
    outgoingRelationships?: Prisma.RelationshipDefinitionUncheckedCreateNestedManyWithoutSourceEntityTypeInput;
};
export type EntityTypeCreateOrConnectWithoutIncomingRelationshipsInput = {
    where: Prisma.EntityTypeWhereUniqueInput;
    create: Prisma.XOR<Prisma.EntityTypeCreateWithoutIncomingRelationshipsInput, Prisma.EntityTypeUncheckedCreateWithoutIncomingRelationshipsInput>;
};
export type EntityTypeUpsertWithoutOutgoingRelationshipsInput = {
    update: Prisma.XOR<Prisma.EntityTypeUpdateWithoutOutgoingRelationshipsInput, Prisma.EntityTypeUncheckedUpdateWithoutOutgoingRelationshipsInput>;
    create: Prisma.XOR<Prisma.EntityTypeCreateWithoutOutgoingRelationshipsInput, Prisma.EntityTypeUncheckedCreateWithoutOutgoingRelationshipsInput>;
    where?: Prisma.EntityTypeWhereInput;
};
export type EntityTypeUpdateToOneWithWhereWithoutOutgoingRelationshipsInput = {
    where?: Prisma.EntityTypeWhereInput;
    data: Prisma.XOR<Prisma.EntityTypeUpdateWithoutOutgoingRelationshipsInput, Prisma.EntityTypeUncheckedUpdateWithoutOutgoingRelationshipsInput>;
};
export type EntityTypeUpdateWithoutOutgoingRelationshipsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    attributes?: Prisma.AttributeDefinitionUpdateManyWithoutEntityTypeNestedInput;
    instances?: Prisma.EntityInstanceUpdateManyWithoutEntityTypeNestedInput;
    incomingRelationships?: Prisma.RelationshipDefinitionUpdateManyWithoutTargetEntityTypeNestedInput;
};
export type EntityTypeUncheckedUpdateWithoutOutgoingRelationshipsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    attributes?: Prisma.AttributeDefinitionUncheckedUpdateManyWithoutEntityTypeNestedInput;
    instances?: Prisma.EntityInstanceUncheckedUpdateManyWithoutEntityTypeNestedInput;
    incomingRelationships?: Prisma.RelationshipDefinitionUncheckedUpdateManyWithoutTargetEntityTypeNestedInput;
};
export type EntityTypeUpsertWithoutIncomingRelationshipsInput = {
    update: Prisma.XOR<Prisma.EntityTypeUpdateWithoutIncomingRelationshipsInput, Prisma.EntityTypeUncheckedUpdateWithoutIncomingRelationshipsInput>;
    create: Prisma.XOR<Prisma.EntityTypeCreateWithoutIncomingRelationshipsInput, Prisma.EntityTypeUncheckedCreateWithoutIncomingRelationshipsInput>;
    where?: Prisma.EntityTypeWhereInput;
};
export type EntityTypeUpdateToOneWithWhereWithoutIncomingRelationshipsInput = {
    where?: Prisma.EntityTypeWhereInput;
    data: Prisma.XOR<Prisma.EntityTypeUpdateWithoutIncomingRelationshipsInput, Prisma.EntityTypeUncheckedUpdateWithoutIncomingRelationshipsInput>;
};
export type EntityTypeUpdateWithoutIncomingRelationshipsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    attributes?: Prisma.AttributeDefinitionUpdateManyWithoutEntityTypeNestedInput;
    instances?: Prisma.EntityInstanceUpdateManyWithoutEntityTypeNestedInput;
    outgoingRelationships?: Prisma.RelationshipDefinitionUpdateManyWithoutSourceEntityTypeNestedInput;
};
export type EntityTypeUncheckedUpdateWithoutIncomingRelationshipsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    attributes?: Prisma.AttributeDefinitionUncheckedUpdateManyWithoutEntityTypeNestedInput;
    instances?: Prisma.EntityInstanceUncheckedUpdateManyWithoutEntityTypeNestedInput;
    outgoingRelationships?: Prisma.RelationshipDefinitionUncheckedUpdateManyWithoutSourceEntityTypeNestedInput;
};
export type EntityTypeCreateWithoutInstancesInput = {
    id?: string;
    name: string;
    version: number;
    createdAt?: Date | string;
    attributes?: Prisma.AttributeDefinitionCreateNestedManyWithoutEntityTypeInput;
    outgoingRelationships?: Prisma.RelationshipDefinitionCreateNestedManyWithoutSourceEntityTypeInput;
    incomingRelationships?: Prisma.RelationshipDefinitionCreateNestedManyWithoutTargetEntityTypeInput;
};
export type EntityTypeUncheckedCreateWithoutInstancesInput = {
    id?: string;
    name: string;
    version: number;
    createdAt?: Date | string;
    attributes?: Prisma.AttributeDefinitionUncheckedCreateNestedManyWithoutEntityTypeInput;
    outgoingRelationships?: Prisma.RelationshipDefinitionUncheckedCreateNestedManyWithoutSourceEntityTypeInput;
    incomingRelationships?: Prisma.RelationshipDefinitionUncheckedCreateNestedManyWithoutTargetEntityTypeInput;
};
export type EntityTypeCreateOrConnectWithoutInstancesInput = {
    where: Prisma.EntityTypeWhereUniqueInput;
    create: Prisma.XOR<Prisma.EntityTypeCreateWithoutInstancesInput, Prisma.EntityTypeUncheckedCreateWithoutInstancesInput>;
};
export type EntityTypeUpsertWithoutInstancesInput = {
    update: Prisma.XOR<Prisma.EntityTypeUpdateWithoutInstancesInput, Prisma.EntityTypeUncheckedUpdateWithoutInstancesInput>;
    create: Prisma.XOR<Prisma.EntityTypeCreateWithoutInstancesInput, Prisma.EntityTypeUncheckedCreateWithoutInstancesInput>;
    where?: Prisma.EntityTypeWhereInput;
};
export type EntityTypeUpdateToOneWithWhereWithoutInstancesInput = {
    where?: Prisma.EntityTypeWhereInput;
    data: Prisma.XOR<Prisma.EntityTypeUpdateWithoutInstancesInput, Prisma.EntityTypeUncheckedUpdateWithoutInstancesInput>;
};
export type EntityTypeUpdateWithoutInstancesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    attributes?: Prisma.AttributeDefinitionUpdateManyWithoutEntityTypeNestedInput;
    outgoingRelationships?: Prisma.RelationshipDefinitionUpdateManyWithoutSourceEntityTypeNestedInput;
    incomingRelationships?: Prisma.RelationshipDefinitionUpdateManyWithoutTargetEntityTypeNestedInput;
};
export type EntityTypeUncheckedUpdateWithoutInstancesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    attributes?: Prisma.AttributeDefinitionUncheckedUpdateManyWithoutEntityTypeNestedInput;
    outgoingRelationships?: Prisma.RelationshipDefinitionUncheckedUpdateManyWithoutSourceEntityTypeNestedInput;
    incomingRelationships?: Prisma.RelationshipDefinitionUncheckedUpdateManyWithoutTargetEntityTypeNestedInput;
};
/**
 * Count Type EntityTypeCountOutputType
 */
export type EntityTypeCountOutputType = {
    attributes: number;
    instances: number;
    outgoingRelationships: number;
    incomingRelationships: number;
};
export type EntityTypeCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    attributes?: boolean | EntityTypeCountOutputTypeCountAttributesArgs;
    instances?: boolean | EntityTypeCountOutputTypeCountInstancesArgs;
    outgoingRelationships?: boolean | EntityTypeCountOutputTypeCountOutgoingRelationshipsArgs;
    incomingRelationships?: boolean | EntityTypeCountOutputTypeCountIncomingRelationshipsArgs;
};
/**
 * EntityTypeCountOutputType without action
 */
export type EntityTypeCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntityTypeCountOutputType
     */
    select?: Prisma.EntityTypeCountOutputTypeSelect<ExtArgs> | null;
};
/**
 * EntityTypeCountOutputType without action
 */
export type EntityTypeCountOutputTypeCountAttributesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AttributeDefinitionWhereInput;
};
/**
 * EntityTypeCountOutputType without action
 */
export type EntityTypeCountOutputTypeCountInstancesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EntityInstanceWhereInput;
};
/**
 * EntityTypeCountOutputType without action
 */
export type EntityTypeCountOutputTypeCountOutgoingRelationshipsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RelationshipDefinitionWhereInput;
};
/**
 * EntityTypeCountOutputType without action
 */
export type EntityTypeCountOutputTypeCountIncomingRelationshipsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RelationshipDefinitionWhereInput;
};
export type EntityTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    version?: boolean;
    createdAt?: boolean;
    attributes?: boolean | Prisma.EntityType$attributesArgs<ExtArgs>;
    instances?: boolean | Prisma.EntityType$instancesArgs<ExtArgs>;
    outgoingRelationships?: boolean | Prisma.EntityType$outgoingRelationshipsArgs<ExtArgs>;
    incomingRelationships?: boolean | Prisma.EntityType$incomingRelationshipsArgs<ExtArgs>;
    _count?: boolean | Prisma.EntityTypeCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["entityType"]>;
export type EntityTypeSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    version?: boolean;
    createdAt?: boolean;
}, ExtArgs["result"]["entityType"]>;
export type EntityTypeSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    version?: boolean;
    createdAt?: boolean;
}, ExtArgs["result"]["entityType"]>;
export type EntityTypeSelectScalar = {
    id?: boolean;
    name?: boolean;
    version?: boolean;
    createdAt?: boolean;
};
export type EntityTypeOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "name" | "version" | "createdAt", ExtArgs["result"]["entityType"]>;
export type EntityTypeInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    attributes?: boolean | Prisma.EntityType$attributesArgs<ExtArgs>;
    instances?: boolean | Prisma.EntityType$instancesArgs<ExtArgs>;
    outgoingRelationships?: boolean | Prisma.EntityType$outgoingRelationshipsArgs<ExtArgs>;
    incomingRelationships?: boolean | Prisma.EntityType$incomingRelationshipsArgs<ExtArgs>;
    _count?: boolean | Prisma.EntityTypeCountOutputTypeDefaultArgs<ExtArgs>;
};
export type EntityTypeIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type EntityTypeIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $EntityTypePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "EntityType";
    objects: {
        attributes: Prisma.$AttributeDefinitionPayload<ExtArgs>[];
        instances: Prisma.$EntityInstancePayload<ExtArgs>[];
        outgoingRelationships: Prisma.$RelationshipDefinitionPayload<ExtArgs>[];
        incomingRelationships: Prisma.$RelationshipDefinitionPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        name: string;
        version: number;
        createdAt: Date;
    }, ExtArgs["result"]["entityType"]>;
    composites: {};
};
export type EntityTypeGetPayload<S extends boolean | null | undefined | EntityTypeDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$EntityTypePayload, S>;
export type EntityTypeCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<EntityTypeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: EntityTypeCountAggregateInputType | true;
};
export interface EntityTypeDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['EntityType'];
        meta: {
            name: 'EntityType';
        };
    };
    /**
     * Find zero or one EntityType that matches the filter.
     * @param {EntityTypeFindUniqueArgs} args - Arguments to find a EntityType
     * @example
     * // Get one EntityType
     * const entityType = await prisma.entityType.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EntityTypeFindUniqueArgs>(args: Prisma.SelectSubset<T, EntityTypeFindUniqueArgs<ExtArgs>>): Prisma.Prisma__EntityTypeClient<runtime.Types.Result.GetResult<Prisma.$EntityTypePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one EntityType that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {EntityTypeFindUniqueOrThrowArgs} args - Arguments to find a EntityType
     * @example
     * // Get one EntityType
     * const entityType = await prisma.entityType.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EntityTypeFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, EntityTypeFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__EntityTypeClient<runtime.Types.Result.GetResult<Prisma.$EntityTypePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first EntityType that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EntityTypeFindFirstArgs} args - Arguments to find a EntityType
     * @example
     * // Get one EntityType
     * const entityType = await prisma.entityType.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EntityTypeFindFirstArgs>(args?: Prisma.SelectSubset<T, EntityTypeFindFirstArgs<ExtArgs>>): Prisma.Prisma__EntityTypeClient<runtime.Types.Result.GetResult<Prisma.$EntityTypePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first EntityType that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EntityTypeFindFirstOrThrowArgs} args - Arguments to find a EntityType
     * @example
     * // Get one EntityType
     * const entityType = await prisma.entityType.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EntityTypeFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, EntityTypeFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__EntityTypeClient<runtime.Types.Result.GetResult<Prisma.$EntityTypePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more EntityTypes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EntityTypeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all EntityTypes
     * const entityTypes = await prisma.entityType.findMany()
     *
     * // Get first 10 EntityTypes
     * const entityTypes = await prisma.entityType.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const entityTypeWithIdOnly = await prisma.entityType.findMany({ select: { id: true } })
     *
     */
    findMany<T extends EntityTypeFindManyArgs>(args?: Prisma.SelectSubset<T, EntityTypeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EntityTypePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a EntityType.
     * @param {EntityTypeCreateArgs} args - Arguments to create a EntityType.
     * @example
     * // Create one EntityType
     * const EntityType = await prisma.entityType.create({
     *   data: {
     *     // ... data to create a EntityType
     *   }
     * })
     *
     */
    create<T extends EntityTypeCreateArgs>(args: Prisma.SelectSubset<T, EntityTypeCreateArgs<ExtArgs>>): Prisma.Prisma__EntityTypeClient<runtime.Types.Result.GetResult<Prisma.$EntityTypePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many EntityTypes.
     * @param {EntityTypeCreateManyArgs} args - Arguments to create many EntityTypes.
     * @example
     * // Create many EntityTypes
     * const entityType = await prisma.entityType.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends EntityTypeCreateManyArgs>(args?: Prisma.SelectSubset<T, EntityTypeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many EntityTypes and returns the data saved in the database.
     * @param {EntityTypeCreateManyAndReturnArgs} args - Arguments to create many EntityTypes.
     * @example
     * // Create many EntityTypes
     * const entityType = await prisma.entityType.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many EntityTypes and only return the `id`
     * const entityTypeWithIdOnly = await prisma.entityType.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends EntityTypeCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, EntityTypeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EntityTypePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a EntityType.
     * @param {EntityTypeDeleteArgs} args - Arguments to delete one EntityType.
     * @example
     * // Delete one EntityType
     * const EntityType = await prisma.entityType.delete({
     *   where: {
     *     // ... filter to delete one EntityType
     *   }
     * })
     *
     */
    delete<T extends EntityTypeDeleteArgs>(args: Prisma.SelectSubset<T, EntityTypeDeleteArgs<ExtArgs>>): Prisma.Prisma__EntityTypeClient<runtime.Types.Result.GetResult<Prisma.$EntityTypePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one EntityType.
     * @param {EntityTypeUpdateArgs} args - Arguments to update one EntityType.
     * @example
     * // Update one EntityType
     * const entityType = await prisma.entityType.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends EntityTypeUpdateArgs>(args: Prisma.SelectSubset<T, EntityTypeUpdateArgs<ExtArgs>>): Prisma.Prisma__EntityTypeClient<runtime.Types.Result.GetResult<Prisma.$EntityTypePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more EntityTypes.
     * @param {EntityTypeDeleteManyArgs} args - Arguments to filter EntityTypes to delete.
     * @example
     * // Delete a few EntityTypes
     * const { count } = await prisma.entityType.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends EntityTypeDeleteManyArgs>(args?: Prisma.SelectSubset<T, EntityTypeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more EntityTypes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EntityTypeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many EntityTypes
     * const entityType = await prisma.entityType.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends EntityTypeUpdateManyArgs>(args: Prisma.SelectSubset<T, EntityTypeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more EntityTypes and returns the data updated in the database.
     * @param {EntityTypeUpdateManyAndReturnArgs} args - Arguments to update many EntityTypes.
     * @example
     * // Update many EntityTypes
     * const entityType = await prisma.entityType.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more EntityTypes and only return the `id`
     * const entityTypeWithIdOnly = await prisma.entityType.updateManyAndReturn({
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
    updateManyAndReturn<T extends EntityTypeUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, EntityTypeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EntityTypePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one EntityType.
     * @param {EntityTypeUpsertArgs} args - Arguments to update or create a EntityType.
     * @example
     * // Update or create a EntityType
     * const entityType = await prisma.entityType.upsert({
     *   create: {
     *     // ... data to create a EntityType
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the EntityType we want to update
     *   }
     * })
     */
    upsert<T extends EntityTypeUpsertArgs>(args: Prisma.SelectSubset<T, EntityTypeUpsertArgs<ExtArgs>>): Prisma.Prisma__EntityTypeClient<runtime.Types.Result.GetResult<Prisma.$EntityTypePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of EntityTypes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EntityTypeCountArgs} args - Arguments to filter EntityTypes to count.
     * @example
     * // Count the number of EntityTypes
     * const count = await prisma.entityType.count({
     *   where: {
     *     // ... the filter for the EntityTypes we want to count
     *   }
     * })
    **/
    count<T extends EntityTypeCountArgs>(args?: Prisma.Subset<T, EntityTypeCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], EntityTypeCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a EntityType.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EntityTypeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends EntityTypeAggregateArgs>(args: Prisma.Subset<T, EntityTypeAggregateArgs>): Prisma.PrismaPromise<GetEntityTypeAggregateType<T>>;
    /**
     * Group by EntityType.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EntityTypeGroupByArgs} args - Group by arguments.
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
    groupBy<T extends EntityTypeGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: EntityTypeGroupByArgs['orderBy'];
    } : {
        orderBy?: EntityTypeGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, EntityTypeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEntityTypeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the EntityType model
     */
    readonly fields: EntityTypeFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for EntityType.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__EntityTypeClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    attributes<T extends Prisma.EntityType$attributesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.EntityType$attributesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AttributeDefinitionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    instances<T extends Prisma.EntityType$instancesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.EntityType$instancesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EntityInstancePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    outgoingRelationships<T extends Prisma.EntityType$outgoingRelationshipsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.EntityType$outgoingRelationshipsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RelationshipDefinitionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    incomingRelationships<T extends Prisma.EntityType$incomingRelationshipsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.EntityType$incomingRelationshipsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RelationshipDefinitionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
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
 * Fields of the EntityType model
 */
export interface EntityTypeFieldRefs {
    readonly id: Prisma.FieldRef<"EntityType", 'String'>;
    readonly name: Prisma.FieldRef<"EntityType", 'String'>;
    readonly version: Prisma.FieldRef<"EntityType", 'Int'>;
    readonly createdAt: Prisma.FieldRef<"EntityType", 'DateTime'>;
}
/**
 * EntityType findUnique
 */
export type EntityTypeFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntityType
     */
    select?: Prisma.EntityTypeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the EntityType
     */
    omit?: Prisma.EntityTypeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.EntityTypeInclude<ExtArgs> | null;
    /**
     * Filter, which EntityType to fetch.
     */
    where: Prisma.EntityTypeWhereUniqueInput;
};
/**
 * EntityType findUniqueOrThrow
 */
export type EntityTypeFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntityType
     */
    select?: Prisma.EntityTypeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the EntityType
     */
    omit?: Prisma.EntityTypeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.EntityTypeInclude<ExtArgs> | null;
    /**
     * Filter, which EntityType to fetch.
     */
    where: Prisma.EntityTypeWhereUniqueInput;
};
/**
 * EntityType findFirst
 */
export type EntityTypeFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntityType
     */
    select?: Prisma.EntityTypeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the EntityType
     */
    omit?: Prisma.EntityTypeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.EntityTypeInclude<ExtArgs> | null;
    /**
     * Filter, which EntityType to fetch.
     */
    where?: Prisma.EntityTypeWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of EntityTypes to fetch.
     */
    orderBy?: Prisma.EntityTypeOrderByWithRelationInput | Prisma.EntityTypeOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for EntityTypes.
     */
    cursor?: Prisma.EntityTypeWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` EntityTypes from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` EntityTypes.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of EntityTypes.
     */
    distinct?: Prisma.EntityTypeScalarFieldEnum | Prisma.EntityTypeScalarFieldEnum[];
};
/**
 * EntityType findFirstOrThrow
 */
export type EntityTypeFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntityType
     */
    select?: Prisma.EntityTypeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the EntityType
     */
    omit?: Prisma.EntityTypeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.EntityTypeInclude<ExtArgs> | null;
    /**
     * Filter, which EntityType to fetch.
     */
    where?: Prisma.EntityTypeWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of EntityTypes to fetch.
     */
    orderBy?: Prisma.EntityTypeOrderByWithRelationInput | Prisma.EntityTypeOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for EntityTypes.
     */
    cursor?: Prisma.EntityTypeWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` EntityTypes from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` EntityTypes.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of EntityTypes.
     */
    distinct?: Prisma.EntityTypeScalarFieldEnum | Prisma.EntityTypeScalarFieldEnum[];
};
/**
 * EntityType findMany
 */
export type EntityTypeFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntityType
     */
    select?: Prisma.EntityTypeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the EntityType
     */
    omit?: Prisma.EntityTypeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.EntityTypeInclude<ExtArgs> | null;
    /**
     * Filter, which EntityTypes to fetch.
     */
    where?: Prisma.EntityTypeWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of EntityTypes to fetch.
     */
    orderBy?: Prisma.EntityTypeOrderByWithRelationInput | Prisma.EntityTypeOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing EntityTypes.
     */
    cursor?: Prisma.EntityTypeWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` EntityTypes from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` EntityTypes.
     */
    skip?: number;
    distinct?: Prisma.EntityTypeScalarFieldEnum | Prisma.EntityTypeScalarFieldEnum[];
};
/**
 * EntityType create
 */
export type EntityTypeCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntityType
     */
    select?: Prisma.EntityTypeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the EntityType
     */
    omit?: Prisma.EntityTypeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.EntityTypeInclude<ExtArgs> | null;
    /**
     * The data needed to create a EntityType.
     */
    data: Prisma.XOR<Prisma.EntityTypeCreateInput, Prisma.EntityTypeUncheckedCreateInput>;
};
/**
 * EntityType createMany
 */
export type EntityTypeCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many EntityTypes.
     */
    data: Prisma.EntityTypeCreateManyInput | Prisma.EntityTypeCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * EntityType createManyAndReturn
 */
export type EntityTypeCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntityType
     */
    select?: Prisma.EntityTypeSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the EntityType
     */
    omit?: Prisma.EntityTypeOmit<ExtArgs> | null;
    /**
     * The data used to create many EntityTypes.
     */
    data: Prisma.EntityTypeCreateManyInput | Prisma.EntityTypeCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * EntityType update
 */
export type EntityTypeUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntityType
     */
    select?: Prisma.EntityTypeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the EntityType
     */
    omit?: Prisma.EntityTypeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.EntityTypeInclude<ExtArgs> | null;
    /**
     * The data needed to update a EntityType.
     */
    data: Prisma.XOR<Prisma.EntityTypeUpdateInput, Prisma.EntityTypeUncheckedUpdateInput>;
    /**
     * Choose, which EntityType to update.
     */
    where: Prisma.EntityTypeWhereUniqueInput;
};
/**
 * EntityType updateMany
 */
export type EntityTypeUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update EntityTypes.
     */
    data: Prisma.XOR<Prisma.EntityTypeUpdateManyMutationInput, Prisma.EntityTypeUncheckedUpdateManyInput>;
    /**
     * Filter which EntityTypes to update
     */
    where?: Prisma.EntityTypeWhereInput;
    /**
     * Limit how many EntityTypes to update.
     */
    limit?: number;
};
/**
 * EntityType updateManyAndReturn
 */
export type EntityTypeUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntityType
     */
    select?: Prisma.EntityTypeSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the EntityType
     */
    omit?: Prisma.EntityTypeOmit<ExtArgs> | null;
    /**
     * The data used to update EntityTypes.
     */
    data: Prisma.XOR<Prisma.EntityTypeUpdateManyMutationInput, Prisma.EntityTypeUncheckedUpdateManyInput>;
    /**
     * Filter which EntityTypes to update
     */
    where?: Prisma.EntityTypeWhereInput;
    /**
     * Limit how many EntityTypes to update.
     */
    limit?: number;
};
/**
 * EntityType upsert
 */
export type EntityTypeUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntityType
     */
    select?: Prisma.EntityTypeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the EntityType
     */
    omit?: Prisma.EntityTypeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.EntityTypeInclude<ExtArgs> | null;
    /**
     * The filter to search for the EntityType to update in case it exists.
     */
    where: Prisma.EntityTypeWhereUniqueInput;
    /**
     * In case the EntityType found by the `where` argument doesn't exist, create a new EntityType with this data.
     */
    create: Prisma.XOR<Prisma.EntityTypeCreateInput, Prisma.EntityTypeUncheckedCreateInput>;
    /**
     * In case the EntityType was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.EntityTypeUpdateInput, Prisma.EntityTypeUncheckedUpdateInput>;
};
/**
 * EntityType delete
 */
export type EntityTypeDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntityType
     */
    select?: Prisma.EntityTypeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the EntityType
     */
    omit?: Prisma.EntityTypeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.EntityTypeInclude<ExtArgs> | null;
    /**
     * Filter which EntityType to delete.
     */
    where: Prisma.EntityTypeWhereUniqueInput;
};
/**
 * EntityType deleteMany
 */
export type EntityTypeDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which EntityTypes to delete
     */
    where?: Prisma.EntityTypeWhereInput;
    /**
     * Limit how many EntityTypes to delete.
     */
    limit?: number;
};
/**
 * EntityType.attributes
 */
export type EntityType$attributesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AttributeDefinition
     */
    select?: Prisma.AttributeDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AttributeDefinition
     */
    omit?: Prisma.AttributeDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AttributeDefinitionInclude<ExtArgs> | null;
    where?: Prisma.AttributeDefinitionWhereInput;
    orderBy?: Prisma.AttributeDefinitionOrderByWithRelationInput | Prisma.AttributeDefinitionOrderByWithRelationInput[];
    cursor?: Prisma.AttributeDefinitionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.AttributeDefinitionScalarFieldEnum | Prisma.AttributeDefinitionScalarFieldEnum[];
};
/**
 * EntityType.instances
 */
export type EntityType$instancesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    where?: Prisma.EntityInstanceWhereInput;
    orderBy?: Prisma.EntityInstanceOrderByWithRelationInput | Prisma.EntityInstanceOrderByWithRelationInput[];
    cursor?: Prisma.EntityInstanceWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.EntityInstanceScalarFieldEnum | Prisma.EntityInstanceScalarFieldEnum[];
};
/**
 * EntityType.outgoingRelationships
 */
export type EntityType$outgoingRelationshipsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RelationshipDefinition
     */
    select?: Prisma.RelationshipDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RelationshipDefinition
     */
    omit?: Prisma.RelationshipDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RelationshipDefinitionInclude<ExtArgs> | null;
    where?: Prisma.RelationshipDefinitionWhereInput;
    orderBy?: Prisma.RelationshipDefinitionOrderByWithRelationInput | Prisma.RelationshipDefinitionOrderByWithRelationInput[];
    cursor?: Prisma.RelationshipDefinitionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RelationshipDefinitionScalarFieldEnum | Prisma.RelationshipDefinitionScalarFieldEnum[];
};
/**
 * EntityType.incomingRelationships
 */
export type EntityType$incomingRelationshipsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RelationshipDefinition
     */
    select?: Prisma.RelationshipDefinitionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RelationshipDefinition
     */
    omit?: Prisma.RelationshipDefinitionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RelationshipDefinitionInclude<ExtArgs> | null;
    where?: Prisma.RelationshipDefinitionWhereInput;
    orderBy?: Prisma.RelationshipDefinitionOrderByWithRelationInput | Prisma.RelationshipDefinitionOrderByWithRelationInput[];
    cursor?: Prisma.RelationshipDefinitionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RelationshipDefinitionScalarFieldEnum | Prisma.RelationshipDefinitionScalarFieldEnum[];
};
/**
 * EntityType without action
 */
export type EntityTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntityType
     */
    select?: Prisma.EntityTypeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the EntityType
     */
    omit?: Prisma.EntityTypeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.EntityTypeInclude<ExtArgs> | null;
};
export {};
//# sourceMappingURL=EntityType.d.ts.map