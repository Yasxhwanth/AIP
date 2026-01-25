import { DomainEvent, DomainEventType, EventHandler } from './event-types';

/**
 * Simple, in-memory synchronous/asynchronous Event Bus.
 * Supports typed events and handlers.
 */
export class EventBus {
    private handlers: Map<DomainEventType, Set<EventHandler<any>>> = new Map();

    /**
     * Subscribe to a specific event type.
     */
    public subscribe<T extends DomainEvent>(
        type: DomainEventType,
        handler: EventHandler<T>
    ): () => void {
        if (!this.handlers.has(type)) {
            this.handlers.set(type, new Set());
        }
        this.handlers.get(type)!.add(handler);

        // Return unsubscribe function
        return () => {
            this.handlers.get(type)?.delete(handler);
        };
    }

    /**
     * Emit an event. All registered handlers will be called.
     * Handlers are called in parallel but we don't wait for them 
     * unless explicitly requested (e.g. for audit logs).
     */
    public emit<T extends DomainEvent>(event: T): void {
        const typeHandlers = this.handlers.get(event.type);
        if (!typeHandlers) return;

        console.log(`[EventBus] Emitting ${event.type}: ${event.eventId}`);

        typeHandlers.forEach(handler => {
            try {
                // Execute handler
                const result = handler(event);
                
                // If handler returns a promise, handle its rejection
                if (result instanceof Promise) {
                    result.catch(err => {
                        console.error(`[EventBus] Async handler for ${event.type} failed:`, err);
                    });
                }
            } catch (err) {
                console.error(`[EventBus] Sync handler for ${event.type} failed:`, err);
            }
        });
    }

    /**
     * For testing: clear all handlers.
     */
    public clear(): void {
        this.handlers.clear();
    }
}

export const eventBus = new EventBus();
