import { PrismaClient } from './generated/prisma';
export interface AbacActor {
    apiKeyId: string;
    apiKeyName: string;
    role: string;
    clearanceLevel?: number;
}
export interface AbacResource {
    type: string;
    id?: string;
    attributes?: Record<string, any>;
}
export interface PolicyEvaluationResult {
    allowed: boolean;
    reason: string;
    matchedPolicies: string[];
}
/**
 * Attribute-Based Access Control (ABAC) Engine
 * Evaluates a request against stored AbacPolicy definitions.
 */
export declare class AbacEngine {
    private prisma;
    constructor(prisma: PrismaClient);
    /**
     * Main evaluation function.
     * Returns whether the actor is allowed to perform the action on the resource.
     * Deny by default if no matching ALLOW policies are found, or if a DENY policy matches.
     */
    evaluate(actor: AbacActor, action: string, resource: AbacResource): Promise<PolicyEvaluationResult>;
    /**
     * Evaluates the JSON condition tree against the request context.
     * E.g. { "actor.role": "ADMIN" } or { "actor.clearanceLevel": { ">=": "resource.classification" } }
     */
    private evaluateCondition;
    /**
     * Safely resolve dot notation paths (e.g., "actor.role" -> "ADMIN")
     */
    private resolvePath;
}
//# sourceMappingURL=abac-engine.d.ts.map