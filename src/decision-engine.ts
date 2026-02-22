import { PrismaClient, Prisma } from './generated/prisma/client';
import { runInferenceByModel } from './inference-engine';
import { upsertEntityInstance } from './data-integration';

// ── Condition Evaluator ──────────────────────────────────────────

interface Condition {
    field: string;
    operator: '>' | '<' | '>=' | '<=' | '==' | '!=' | 'contains' | 'exists';
    value: unknown;
}

interface ConditionResult {
    field: string;
    operator: string;
    expected: unknown;
    actual: unknown;
    passed: boolean;
}

/**
 * Evaluate a single condition against entity/trigger data.
 */
function evaluateCondition(data: Record<string, unknown>, condition: Condition): ConditionResult {
    const actual = data[condition.field];
    let passed = false;

    switch (condition.operator) {
        case '>': passed = Number(actual) > Number(condition.value); break;
        case '<': passed = Number(actual) < Number(condition.value); break;
        case '>=': passed = Number(actual) >= Number(condition.value); break;
        case '<=': passed = Number(actual) <= Number(condition.value); break;
        case '==': passed = actual == condition.value; break;
        case '!=': passed = actual != condition.value; break;
        case 'contains':
            passed = typeof actual === 'string' && actual.includes(String(condition.value));
            break;
        case 'exists':
            passed = actual !== undefined && actual !== null;
            break;
    }

    return {
        field: condition.field,
        operator: condition.operator,
        expected: condition.value,
        actual,
        passed,
    };
}

/**
 * Evaluate all conditions for a rule using AND/OR logic.
 */
function evaluateConditions(
    data: Record<string, unknown>,
    conditions: Condition[],
    logicOperator: string,
): { allPassed: boolean; results: ConditionResult[] } {
    const results = conditions.map((c) => evaluateCondition(data, c));
    const allPassed =
        logicOperator === 'OR'
            ? results.some((r) => r.passed)
            : results.every((r) => r.passed);

    return { allPassed, results };
}

// ── Action Executors ─────────────────────────────────────────────

interface ActionResult {
    actionName: string;
    actionType: string;
    stepOrder: number;
    success: boolean;
    result?: unknown | undefined;
    error?: string | undefined;
}

type ActionExecutor = (
    config: Record<string, unknown>,
    context: { logicalId: string; triggerData: Record<string, unknown>; prisma: PrismaClient },
) => Promise<{ success: boolean; result?: unknown | undefined; error?: string | undefined }>;

const actionExecutors: Record<string, ActionExecutor> = {
    /**
     * WEBHOOK — POST to external URL.
     */
    WEBHOOK: async (config, context) => {
        const url = config.url as string;
        if (!url) return { success: false, error: 'WEBHOOK config missing "url"' };

        try {
            const resp = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(config.headers as Record<string, string> ?? {}),
                },
                body: JSON.stringify({
                    logicalId: context.logicalId,
                    triggerData: context.triggerData,
                    timestamp: new Date().toISOString(),
                }),
            });

            return {
                success: resp.ok,
                result: { status: resp.status, statusText: resp.statusText },
                error: resp.ok ? undefined : `HTTP ${resp.status}`,
            };
        } catch (err) {
            return { success: false, error: String(err) };
        }
    },

    /**
     * UPDATE_ENTITY — Modify entity attributes.
     */
    UPDATE_ENTITY: async (config, context) => {
        const fields = config.fields as Record<string, unknown>;
        if (!fields) return { success: false, error: 'UPDATE_ENTITY config missing "fields"' };

        try {
            // Get current state and merge updates
            const current = await context.prisma.currentEntityState.findUnique({
                where: { logicalId: context.logicalId },
            });
            if (!current) {
                return { success: false, error: `Entity "${context.logicalId}" not found` };
            }

            const entityType = await context.prisma.entityType.findUnique({
                where: { id: current.entityTypeId },
            });
            if (!entityType) return { success: false, error: 'Entity type not found' };

            const currentData = current.data as Record<string, unknown>;
            const updatedData = { ...currentData, ...fields };

            const result = await upsertEntityInstance(
                { id: entityType.id, version: entityType.version, name: entityType.name },
                context.logicalId,
                updatedData,
                context.prisma,
            );

            return { success: result.success, result: { updatedFields: fields }, error: result.error ?? undefined };
        } catch (err) {
            return { success: false, error: String(err) };
        }
    },

    /**
     * CREATE_ALERT — Create a platform alert.
     */
    CREATE_ALERT: async (config, context) => {
        try {
            const alert = await context.prisma.alert.create({
                data: {
                    alertType: (config.alertType as string) ?? 'DECISION_ACTION',
                    severity: (config.severity as string) ?? 'MEDIUM',
                    policyId: (config.policyId as string) ?? 'decision-engine',
                    entityTypeId: (config.entityTypeId as string) ?? 'unknown',
                    logicalId: context.logicalId,
                    payload: { source: 'decision-engine', triggerData: context.triggerData } as Prisma.InputJsonValue,
                    evaluationTrace: context.triggerData as Prisma.InputJsonValue,
                    acknowledged: false,
                },
            });

            return { success: true, result: { alertId: alert.id, severity: alert.severity } };
        } catch (err) {
            return { success: false, error: String(err) };
        }
    },

    /**
     * RUN_INFERENCE — Trigger another model's inference.
     */
    RUN_INFERENCE: async (config, context) => {
        const modelId = config.modelDefinitionId as string;
        if (!modelId) return { success: false, error: 'RUN_INFERENCE config missing "modelDefinitionId"' };

        try {
            const result = await runInferenceByModel(modelId, context.logicalId, context.prisma);
            return { success: true, result };
        } catch (err) {
            return { success: false, error: String(err) };
        }
    },

    /**
     * LOG_ONLY — Just record, no side effects.
     */
    LOG_ONLY: async (config, context) => {
        return {
            success: true,
            result: {
                message: (config.message as string) ?? 'Action logged',
                logicalId: context.logicalId,
                timestamp: new Date().toISOString(),
            },
        };
    },
};

// ── Decision Engine Core ─────────────────────────────────────────

/**
 * Execute a decision for a specific rule against an entity.
 * Full pipeline: evaluate conditions → decide → execute actions → log.
 */
export async function executeDecision(
    ruleId: string,
    logicalId: string,
    triggerType: string,
    triggerData: Record<string, unknown>,
    prisma: PrismaClient,
    simulate = false,
): Promise<{
    decisionLogId: string;
    decision: string;
    status: string;
    conditionResults: ConditionResult[];
    executionResults: ActionResult[];
}> {
    // Load rule with execution plan
    const rule = await prisma.decisionRule.findUnique({
        where: { id: ruleId },
        include: {
            executionPlans: {
                orderBy: { stepOrder: 'asc' },
                include: { actionDefinition: true },
            },
        },
    });

    if (!rule) throw new Error(`Decision rule "${ruleId}" not found`);
    if (!rule.enabled) throw new Error(`Decision rule "${rule.name}" is disabled`);

    // Evaluate conditions
    const conditions = rule.conditions as unknown as Condition[];
    const { allPassed, results: conditionResults } = evaluateConditions(triggerData, conditions, rule.logicOperator);

    // Determine decision
    let decision: string;
    if (!allPassed) {
        decision = 'SKIPPED';
    } else if (simulate) {
        decision = 'SIMULATED';
    } else if (!rule.autoExecute) {
        decision = 'PENDING_APPROVAL';
    } else {
        decision = 'EXECUTE';
    }

    // Execute actions (only if decision is EXECUTE)
    const executionResults: ActionResult[] = [];

    if (decision === 'EXECUTE') {
        for (const plan of rule.executionPlans) {
            const executor = actionExecutors[plan.actionDefinition.type];
            if (!executor) {
                executionResults.push({
                    actionName: plan.actionDefinition.name,
                    actionType: plan.actionDefinition.type,
                    stepOrder: plan.stepOrder,
                    success: false,
                    error: `Unknown action type: ${plan.actionDefinition.type}`,
                });
                if (!plan.continueOnFailure) break;
                continue;
            }

            const actionConfig = plan.actionDefinition.config as Record<string, unknown>;
            const actionResult = await executor(actionConfig, { logicalId, triggerData, prisma });

            executionResults.push({
                actionName: plan.actionDefinition.name,
                actionType: plan.actionDefinition.type,
                stepOrder: plan.stepOrder,
                success: actionResult.success,
                result: actionResult.result,
                error: actionResult.error,
            });

            if (!actionResult.success && !plan.continueOnFailure) break;
        }
    } else if (decision === 'SIMULATED') {
        // Dry-run: list actions that would have been executed
        for (const plan of rule.executionPlans) {
            executionResults.push({
                actionName: plan.actionDefinition.name,
                actionType: plan.actionDefinition.type,
                stepOrder: plan.stepOrder,
                success: true,
                result: { simulated: true, wouldExecute: plan.actionDefinition.type },
            });
        }
    }

    // Determine overall status
    const status = simulate
        ? 'SIMULATED'
        : decision === 'SKIPPED'
            ? 'COMPLETED'
            : decision === 'PENDING_APPROVAL'
                ? 'PENDING'
                : executionResults.every((r) => r.success)
                    ? 'COMPLETED'
                    : 'FAILED';

    // Store decision log
    const log = await prisma.decisionLog.create({
        data: {
            decisionRuleId: ruleId,
            logicalId,
            triggerType: simulate ? 'SIMULATION' : triggerType,
            triggerData: triggerData as Prisma.InputJsonValue,
            conditionResults: conditionResults as unknown as Prisma.InputJsonValue,
            decision,
            executionResults: executionResults as unknown as Prisma.InputJsonValue,
            status,
        },
    });

    return {
        decisionLogId: log.id,
        decision,
        status,
        conditionResults,
        executionResults,
    };
}

/**
 * Evaluate ALL enabled rules for an entity. Runs rules in priority order.
 */
export async function evaluateAllRules(
    logicalId: string,
    triggerType: string,
    triggerData: Record<string, unknown>,
    prisma: PrismaClient,
    simulate = false,
): Promise<{
    rulesEvaluated: number;
    rulesFired: number;
    results: { ruleName: string; decision: string; status: string; decisionLogId: string }[];
}> {
    // Get entity type
    const entityState = await prisma.currentEntityState.findUnique({
        where: { logicalId },
    });
    if (!entityState) throw new Error(`No current state for "${logicalId}"`);

    // Load all enabled rules for this entity type, sorted by priority
    const rules = await prisma.decisionRule.findMany({
        where: { entityTypeId: entityState.entityTypeId, enabled: true },
        orderBy: { priority: 'asc' },
    });

    const results: { ruleName: string; decision: string; status: string; decisionLogId: string }[] = [];
    let rulesFired = 0;

    for (const rule of rules) {
        const result = await executeDecision(rule.id, logicalId, triggerType, triggerData, prisma, simulate);
        results.push({
            ruleName: rule.name,
            decision: result.decision,
            status: result.status,
            decisionLogId: result.decisionLogId,
        });
        if (result.decision === 'EXECUTE' || result.decision === 'SIMULATED') {
            rulesFired++;
        }
    }

    return { rulesEvaluated: rules.length, rulesFired, results };
}
