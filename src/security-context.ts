import { PrismaClient } from './generated/prisma';
import { AbacEngine, AbacActor, AbacResource, PolicyEvaluationResult } from './abac-engine';
import { AuditService } from './audit-service';

export interface SecurityContextOptions {
    actor: AbacActor;
    action: 'READ' | 'WRITE' | 'DELETE' | 'ADMIN';
    resource: AbacResource;
    /** If provided, audit a GRANTED decision as well as DENIED ones */
    auditSuccess?: boolean;
}

export interface SecurityDecision extends PolicyEvaluationResult {
    actor: AbacActor;
    action: string;
    resource: AbacResource;
}

/**
 * SecurityContext — Central ABAC Gateway
 *
 * All sensitive data access operations should flow through this service.
 * It assembles the actor + resource context, calls the ABAC engine,
 * and audit-logs the decision.
 *
 * Usage:
 *   const decision = await securityCtx.check({ actor, action: 'WRITE', resource });
 *   if (!decision.allowed) return res.status(403).json({ error: decision.reason });
 *   const maskedData = securityCtx.applyMasks(data, decision);
 */
export class SecurityContext {
    private abac: AbacEngine;
    private audit: AuditService;

    constructor(private prisma: PrismaClient) {
        this.abac = new AbacEngine(prisma);
        this.audit = new AuditService(prisma);
    }

    /**
     * Evaluate the access decision for the given context.
     * @throws Never — returns a SecurityDecision. Callers must check `.allowed`.
     */
    async check(opts: SecurityContextOptions): Promise<SecurityDecision> {
        const result = await this.abac.evaluate(opts.actor, opts.action, opts.resource);

        // Audit denied decisions (AbacEngine already logs these internally)
        // Optionally audit granted decisions for high-sensitivity operations
        if (result.allowed && opts.auditSuccess) {
            await this.audit.logAction({
                actor: opts.actor.apiKeyName,
                action: `SECURITY_GRANT_${opts.action}`,
                resourceType: opts.resource.type,
                resourceId: opts.resource.id,
                explanation: { reason: result.reason, matchedPolicies: result.matchedPolicies },
                metadata: {
                    role: opts.actor.apiKeyName,
                    action: opts.action,
                    status: 'GRANTED',
                }
            });
        }


        return {
            ...result,
            actor: opts.actor,
            action: opts.action,
            resource: opts.resource,
        };
    }

    /**
     * Assembles an AbacActor from express request auth context.
     */
    static actorFromRequest(req: any): AbacActor {
        return {
            apiKeyId: req.auth?.apiKeyId ?? 'anonymous',
            apiKeyName: req.auth?.apiKeyName ?? 'anonymous',
            role: req.auth?.role ?? 'VIEWER',
            clearanceLevel: req.auth?.clearanceLevel,
        };
    }

    /**
     * Apply field masks returned by the ABAC engine to a data object.
     */
    applyMasks(data: any, decision: SecurityDecision): any {
        return this.abac.mask(data, decision.maskedFields);
    }

    /**
     * Convenience: check WRITE access from a raw express request.
     * Throws 403 JSON response if denied (call inside route handlers).
     * Returns the SecurityDecision if allowed so caller can apply masks.
     */
    async enforceFromRequest(
        req: any,
        res: any,
        action: SecurityContextOptions['action'],
        resource: AbacResource
    ): Promise<SecurityDecision | null> {
        const actor = SecurityContext.actorFromRequest(req);
        const decision = await this.check({ actor, action, resource });

        if (!decision.allowed) {
            res.status(403).json({
                error: 'Forbidden',
                reason: decision.reason,
                correlationId: req.correlationId,
            });
            return null;
        }
        return decision;
    }
}
