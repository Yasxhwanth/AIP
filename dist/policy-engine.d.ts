import { PrismaClient } from './generated/prisma';
interface DomainEventPayload {
    previousState: Record<string, unknown> | null;
    newState: Record<string, unknown>;
    validFrom: string;
}
interface EventContext {
    eventId: string;
    eventType: string;
    entityTypeId: string;
    logicalId: string;
    entityVersion: number;
    payload: DomainEventPayload;
}
export declare function evaluatePolicies(event: EventContext, prisma: PrismaClient): Promise<void>;
export declare function simulatePolicy(policyId: string, dataPayload: Record<string, unknown>, prisma: PrismaClient): Promise<{
    matched: boolean;
    trace: Record<string, unknown>;
    error?: string;
}>;
export {};
//# sourceMappingURL=policy-engine.d.ts.map