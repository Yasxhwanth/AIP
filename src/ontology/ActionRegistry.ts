import { Mutation, MutationType, EntityId, AttributeDefinitionId, EntityTypeId } from './types';
import { mutationEngine } from './MutationEngine';

export interface ActionContext {
    tenantId: string;
    userId: string;
    parameters: Record<string, any>;
}

export type ActionLogic = (ctx: ActionContext) => Mutation[];

export class ActionRegistry {
    private static actions: Map<string, ActionLogic> = new Map();

    public static registerAction(name: string, logic: ActionLogic): void {
        this.actions.set(name, logic);
    }

    public static executeAction(name: string, ctx: ActionContext): void {
        const logic = this.actions.get(name);
        if (!logic) throw new Error(`Action ${name} not found in registry`);

        const mutations = logic(ctx);

        // Apply mutations atomically (simulated)
        mutations.forEach(m => mutationEngine.applyMutation(m));
    }
}

// Register some default actions for Phase 35 demo
ActionRegistry.registerAction('update_entity_status', (ctx) => {
    const { entityId, status } = ctx.parameters;
    return [{
        type: MutationType.UPDATE_ATTRIBUTE,
        tenant_id: ctx.tenantId,
        entity_id: entityId as EntityId,
        attribute_definition_id: 'status' as AttributeDefinitionId,
        newValue: status
    }];
});

ActionRegistry.registerAction('create_location', (ctx) => {
    const { name, x, y } = ctx.parameters;
    return [{
        type: MutationType.CREATE_ENTITY,
        tenant_id: ctx.tenantId,
        entity_type_id: 'LOCATION' as EntityTypeId,
        newValue: {
            name,
            x,
            y,
            status: 'ACTIVE'
        }
    }];
});
