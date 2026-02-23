import { PrismaClient } from './generated/prisma/client';
interface ConditionResult {
    field: string;
    operator: string;
    expected: unknown;
    actual: unknown;
    passed: boolean;
}
interface ActionResult {
    actionName: string;
    actionType: string;
    stepOrder: number;
    success: boolean;
    result?: unknown | undefined;
    error?: string | undefined;
}
/**
 * Execute a decision for a specific rule against an entity.
 * Full pipeline: evaluate conditions → decide → execute actions → log.
 */
export declare function executeDecision(ruleId: string, logicalId: string, triggerType: string, triggerData: Record<string, unknown>, prisma: PrismaClient, simulate?: boolean): Promise<{
    decisionLogId: string;
    decision: string;
    status: string;
    conditionResults: ConditionResult[];
    executionResults: ActionResult[];
}>;
/**
 * Evaluate ALL enabled rules for an entity. Runs rules in priority order.
 */
export declare function evaluateAllRules(logicalId: string, triggerType: string, triggerData: Record<string, unknown>, prisma: PrismaClient, simulate?: boolean): Promise<{
    rulesEvaluated: number;
    rulesFired: number;
    results: {
        ruleName: string;
        decision: string;
        status: string;
        decisionLogId: string;
    }[];
}>;
export {};
//# sourceMappingURL=decision-engine.d.ts.map