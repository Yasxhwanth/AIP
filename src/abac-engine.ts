import { PrismaClient, Prisma } from './generated/prisma';

export interface AbacActor {
    apiKeyId: string;
    apiKeyName: string;
    role: string;
    clearanceLevel?: number; // Example of a dynamic attribute
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
export class AbacEngine {
    constructor(private prisma: PrismaClient) { }

    /**
     * Main evaluation function.
     * Returns whether the actor is allowed to perform the action on the resource.
     * Deny by default if no matching ALLOW policies are found, or if a DENY policy matches.
     */
    async evaluate(
        actor: AbacActor,
        action: string,
        resource: AbacResource
    ): Promise<PolicyEvaluationResult> {
        // Fetch all relevant policies
        // We look for policies that match the action OR "*" and resourceType OR "*"
        const policies = await this.prisma.abacPolicy.findMany({
            where: {
                OR: [
                    { action },
                    { action: '*' }
                ],
                AND: [
                    {
                        OR: [
                            { resourceType: resource.type },
                            { resourceType: '*' }
                        ]
                    }
                ]
            }
        });

        if (policies.length === 0) {
            return {
                allowed: false,
                reason: 'Implicit Deny: No matching policies found.',
                matchedPolicies: []
            };
        }

        let isAllowed = false;
        const matchedAllow: string[] = [];
        const matchedDeny: string[] = [];

        for (const policy of policies) {
            const matches = this.evaluateCondition(policy.condition as Record<string, any>, actor, resource);
            if (matches) {
                if (policy.effect === 'DENY') {
                    matchedDeny.push(policy.name);
                } else if (policy.effect === 'ALLOW') {
                    matchedAllow.push(policy.name);
                    isAllowed = true;
                }
            }
        }

        // Explicit DENY always overrides ALLOW
        if (matchedDeny.length > 0) {
            return {
                allowed: false,
                reason: `Explicit Deny: Policy [${matchedDeny.join(', ')}] evaluated to DENY.`,
                matchedPolicies: matchedDeny
            };
        }

        if (isAllowed) {
            return {
                allowed: true,
                reason: `Explicit Allow: Policy [${matchedAllow.join(', ')}] evaluated to ALLOW.`,
                matchedPolicies: matchedAllow
            };
        }

        return {
            allowed: false,
            reason: 'Implicit Deny: No ALLOW policies condition matched.',
            matchedPolicies: []
        };
    }

    /**
     * Evaluates the JSON condition tree against the request context.
     * E.g. { "actor.role": "ADMIN" } or { "actor.clearanceLevel": { ">=": "resource.classification" } }
     */
    private evaluateCondition(
        condition: Record<string, any> | null,
        actor: AbacActor,
        resource: AbacResource
    ): boolean {
        if (!condition || Object.keys(condition).length === 0) {
            // Empty condition means it matches everything within the action/resource scope
            return true;
        }

        // Build a flat context for simple property resolution
        const context: Record<string, any> = {
            actor: actor,
            resource: resource.attributes || {},
            env: {
                timeOfDay: new Date().getHours(), // example
            }
        };

        // Simplified rule engine for JSON conditions
        // Iterate over object keys. All top-level keys are implicitly AND'ed.
        for (const [key, expectedValue] of Object.entries(condition)) {
            const actualValue = this.resolvePath(key, context);

            if (typeof expectedValue === 'object' && expectedValue !== null) {
                // Complex operators (e.g. { "in": ["A", "B"] }, { ">=": 3 })
                const op = Object.keys(expectedValue)[0] as string;
                if (!op) return false;
                const opVal = (expectedValue as Record<string, any>)[op];

                // Allow dynamic resolution of expected value if it's a string path like "resource.classification"
                const resolvedOpVal = (typeof opVal === 'string' && opVal.startsWith('resource.')) ?
                    this.resolvePath(opVal, context) : opVal;

                switch (op) {
                    case 'eq': if (actualValue !== resolvedOpVal) return false; break;
                    case 'neq': if (actualValue === resolvedOpVal) return false; break;
                    case 'gt': if (actualValue <= resolvedOpVal) return false; break;
                    case 'gte': if (actualValue < resolvedOpVal) return false; break;
                    case 'lt': if (actualValue >= resolvedOpVal) return false; break;
                    case 'lte': if (actualValue > resolvedOpVal) return false; break;
                    case 'in': if (!Array.isArray(resolvedOpVal) || !resolvedOpVal.includes(actualValue)) return false; break;
                    default: return false; // unknown operator
                }
            } else {
                // Simple equality
                if (actualValue !== expectedValue) return false;
            }
        }

        return true;
    }

    /**
     * Safely resolve dot notation paths (e.g., "actor.role" -> "ADMIN")
     */
    private resolvePath(path: string, obj: any): any {
        // @ts-ignore
        return path.split('.').reduce((prev, curr) => (prev && typeof prev === 'object' ? (prev as Record<string, any>)[curr] : undefined), obj);
    }
}
