import { PrismaClient } from './generated/prisma';
import { AbacActor, AbacResource, PolicyEvaluationResult } from './abac-engine';
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
export declare class SecurityContext {
    private prisma;
    private abac;
    private audit;
    constructor(prisma: PrismaClient);
    /**
     * Evaluate the access decision for the given context.
     * @throws Never — returns a SecurityDecision. Callers must check `.allowed`.
     */
    check(opts: SecurityContextOptions): Promise<SecurityDecision>;
    /**
     * Assembles an AbacActor from express request auth context.
     */
    static actorFromRequest(req: any): AbacActor;
    /**
     * Apply field masks returned by the ABAC engine to a data object.
     */
    applyMasks(data: any, decision: SecurityDecision): any;
    /**
     * Convenience: check WRITE access from a raw express request.
     * Throws 403 JSON response if denied (call inside route handlers).
     * Returns the SecurityDecision if allowed so caller can apply masks.
     */
    enforceFromRequest(req: any, res: any, action: SecurityContextOptions['action'], resource: AbacResource): Promise<SecurityDecision | null>;
}
//# sourceMappingURL=security-context.d.ts.map