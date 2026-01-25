import { ActorContext } from './identity-types';

export class IdentityContext {
    private static instance: IdentityContext;
    private currentContext: ActorContext | null = null;

    private constructor() { }

    static getInstance(): IdentityContext {
        if (!IdentityContext.instance) {
            IdentityContext.instance = new IdentityContext();
        }
        return IdentityContext.instance;
    }

    setCurrentContext(context: ActorContext): void {
        this.currentContext = context;
    }

    getCurrentContext(): ActorContext {
        if (!this.currentContext) {
            throw new Error('No active IdentityContext found. Ensure a session is active.');
        }
        return this.currentContext;
    }

    clear(): void {
        this.currentContext = null;
    }
}
