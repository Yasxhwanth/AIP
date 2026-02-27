import { PrismaClient } from './generated/prisma';
/**
 * Evaluates a math expression with variable substitution.
 * Safe — no eval(), uses a custom parser.
 *
 * @example
 *   evaluateExpression("output / input * 100", { output: 80, input: 100 })
 *   // → 80
 */
export declare function evaluateExpression(expression: string, variables: Record<string, unknown>): number;
/**
 * Evaluates all computed metrics for a given entity type against an entity's data.
 * Returns an array of { name, value, unit, error? } for each metric.
 */
export declare function evaluateComputedMetrics(entityTypeId: string, entityData: Record<string, unknown>, prisma: PrismaClient): Promise<{
    name: string;
    value: number | null;
    unit: string | null;
    error?: string;
}[]>;
//# sourceMappingURL=computed-metrics.d.ts.map