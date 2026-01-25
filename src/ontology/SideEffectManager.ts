import { Mutation, MutationType } from './types';

export type SideEffectHandler = (mutation: Mutation) => void;

export class SideEffectManager {
    private static handlers: Map<MutationType, SideEffectHandler[]> = new Map();

    public static registerHandler(type: MutationType, handler: SideEffectHandler): void {
        const typeHandlers = this.handlers.get(type) || [];
        typeHandlers.push(handler);
        this.handlers.set(type, typeHandlers);
    }

    public static triggerEffects(mutation: Mutation): void {
        const typeHandlers = this.handlers.get(mutation.type) || [];
        typeHandlers.forEach(handler => {
            try {
                handler(mutation);
            } catch (err) {
                console.error(`[SideEffectManager] Error in handler for ${mutation.type}:`, err);
            }
        });
    }
}

// Example side effect: Log all attribute updates
SideEffectManager.registerHandler(MutationType.UPDATE_ATTRIBUTE, (m) => {
    console.log(`[SideEffect] Attribute ${m.attribute_definition_id} updated for entity ${m.entity_id}`);
});
