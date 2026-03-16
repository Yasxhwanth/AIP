"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbacEngine = void 0;
/**
 * Attribute-Based Access Control (ABAC) Engine
 * Evaluates a request against stored AbacPolicy definitions.
 */
class AbacEngine {
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Main evaluation function.
     * Returns whether the actor is allowed to perform the action on the resource.
     * Deny by default if no matching ALLOW policies are found, or if a DENY policy matches.
     */
    async evaluate(actor, action, resource) {
        // Fetch all relevant policies
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
        const matchedAllow = [];
        const matchedDeny = [];
        const maskedFields = new Set();
        for (const policy of policies) {
            const matches = this.evaluateCondition(policy.condition, actor, resource);
            if (matches) {
                if (policy.effect === 'DENY') {
                    matchedDeny.push(policy.name);
                }
                else if (policy.effect === 'ALLOW') {
                    matchedAllow.push(policy.name);
                    isAllowed = true;
                    // Collect masked fields from policy metadata if present
                    const metadata = policy.metadata;
                    if (metadata?.maskedFields) {
                        metadata.maskedFields.forEach(f => maskedFields.add(f));
                    }
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
                matchedPolicies: matchedAllow,
                maskedFields: Array.from(maskedFields)
            };
        }
        return {
            allowed: false,
            reason: 'Implicit Deny: No ALLOW policies condition matched.',
            matchedPolicies: []
        };
    }
    /**
     * Redact sensitive fields from a data object based on the evaluation result.
     */
    mask(data, maskedFields) {
        if (!maskedFields || maskedFields.length === 0 || !data) {
            return data;
        }
        const deepClone = JSON.parse(JSON.stringify(data));
        const maskValue = (val) => {
            if (typeof val === 'string')
                return '[REDACTED]';
            if (typeof val === 'number')
                return 0;
            if (typeof val === 'boolean')
                return false;
            return null;
        };
        maskedFields.forEach(field => {
            const parts = field.split('.');
            let current = deepClone;
            for (let i = 0; i < parts.length - 1; i++) {
                if (current[parts[i]]) {
                    current = current[parts[i]];
                }
                else {
                    return;
                }
            }
            const lastPart = parts[parts.length - 1];
            if (current && lastPart in current) {
                current[lastPart] = maskValue(current[lastPart]);
            }
        });
        return deepClone;
    }
    /**
     * Evaluates the JSON condition tree against the request context.
     * E.g. { "actor.role": "ADMIN" } or { "actor.clearanceLevel": { ">=": "resource.classification" } }
     */
    evaluateCondition(condition, actor, resource) {
        if (!condition || Object.keys(condition).length === 0) {
            // Empty condition means it matches everything within the action/resource scope
            return true;
        }
        // Build a flat context for simple property resolution
        const context = {
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
                const op = Object.keys(expectedValue)[0];
                if (!op)
                    return false;
                const opVal = expectedValue[op];
                // Allow dynamic resolution of expected value if it's a string path like "resource.classification"
                const resolvedOpVal = (typeof opVal === 'string' && opVal.startsWith('resource.')) ?
                    this.resolvePath(opVal, context) : opVal;
                switch (op) {
                    case 'eq':
                        if (actualValue !== resolvedOpVal)
                            return false;
                        break;
                    case 'neq':
                        if (actualValue === resolvedOpVal)
                            return false;
                        break;
                    case 'gt':
                        if (actualValue <= resolvedOpVal)
                            return false;
                        break;
                    case 'gte':
                        if (actualValue < resolvedOpVal)
                            return false;
                        break;
                    case 'lt':
                        if (actualValue >= resolvedOpVal)
                            return false;
                        break;
                    case 'lte':
                        if (actualValue > resolvedOpVal)
                            return false;
                        break;
                    case 'in':
                        if (!Array.isArray(resolvedOpVal) || !resolvedOpVal.includes(actualValue))
                            return false;
                        break;
                    default: return false; // unknown operator
                }
            }
            else {
                // Simple equality
                if (actualValue !== expectedValue)
                    return false;
            }
        }
        return true;
    }
    /**
     * Safely resolve dot notation paths (e.g., "actor.role" -> "ADMIN")
     */
    resolvePath(path, obj) {
        // @ts-ignore
        return path.split('.').reduce((prev, curr) => (prev && typeof prev === 'object' ? prev[curr] : undefined), obj);
    }
}
exports.AbacEngine = AbacEngine;
//# sourceMappingURL=abac-engine.js.map