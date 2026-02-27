"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeDecision = executeDecision;
exports.evaluateAllRules = evaluateAllRules;
const inference_engine_1 = require("./inference-engine");
const data_integration_1 = require("./data-integration");
/**
 * Evaluate a single condition against entity/trigger data.
 */
function evaluateCondition(data, condition) {
    const actual = data[condition.field];
    let passed = false;
    switch (condition.operator) {
        case '>':
            passed = Number(actual) > Number(condition.value);
            break;
        case '<':
            passed = Number(actual) < Number(condition.value);
            break;
        case '>=':
            passed = Number(actual) >= Number(condition.value);
            break;
        case '<=':
            passed = Number(actual) <= Number(condition.value);
            break;
        case '==':
            passed = actual == condition.value;
            break;
        case '!=':
            passed = actual != condition.value;
            break;
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
function evaluateConditions(data, conditions, logicOperator) {
    const results = conditions.map((c) => evaluateCondition(data, c));
    const allPassed = logicOperator === 'OR'
        ? results.some((r) => r.passed)
        : results.every((r) => r.passed);
    return { allPassed, results };
}
const actionExecutors = {
    /**
     * WEBHOOK — POST to external URL.
     */
    WEBHOOK: async (config, context) => {
        const url = config.url;
        if (!url)
            return { success: false, error: 'WEBHOOK config missing "url"' };
        try {
            const resp = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(config.headers ?? {}),
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
        }
        catch (err) {
            return { success: false, error: String(err) };
        }
    },
    /**
     * UPDATE_ENTITY — Modify entity attributes.
     */
    UPDATE_ENTITY: async (config, context) => {
        const fields = config.fields;
        if (!fields)
            return { success: false, error: 'UPDATE_ENTITY config missing "fields"' };
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
            if (!entityType)
                return { success: false, error: 'Entity type not found' };
            const currentData = current.data;
            const updatedData = { ...currentData, ...fields };
            const result = await (0, data_integration_1.upsertEntityInstance)({ id: entityType.id, version: entityType.version, name: entityType.name }, context.logicalId, updatedData, context.prisma);
            return { success: result.success, result: { updatedFields: fields }, error: result.error ?? undefined };
        }
        catch (err) {
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
                    alertType: config.alertType ?? 'DECISION_ACTION',
                    severity: config.severity ?? 'MEDIUM',
                    policyId: config.policyId ?? 'decision-engine',
                    entityTypeId: config.entityTypeId ?? 'unknown',
                    logicalId: context.logicalId,
                    payload: { source: 'decision-engine', triggerData: context.triggerData },
                    evaluationTrace: context.triggerData,
                    acknowledged: false,
                },
            });
            return { success: true, result: { alertId: alert.id, severity: alert.severity } };
        }
        catch (err) {
            return { success: false, error: String(err) };
        }
    },
    /**
     * RUN_INFERENCE — Trigger another model's inference.
     */
    RUN_INFERENCE: async (config, context) => {
        const modelId = config.modelDefinitionId;
        if (!modelId)
            return { success: false, error: 'RUN_INFERENCE config missing "modelDefinitionId"' };
        try {
            const result = await (0, inference_engine_1.runInferenceByModel)(modelId, context.logicalId, context.prisma);
            return { success: true, result };
        }
        catch (err) {
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
                message: config.message ?? 'Action logged',
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
async function executeDecision(ruleId, logicalId, triggerType, triggerData, prisma, simulate = false) {
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
    if (!rule)
        throw new Error(`Decision rule "${ruleId}" not found`);
    if (!rule.enabled)
        throw new Error(`Decision rule "${rule.name}" is disabled`);
    // Evaluate conditions
    const conditions = rule.conditions;
    const { allPassed, results: conditionResults } = evaluateConditions(triggerData, conditions, rule.logicOperator);
    // Extract confidence from triggerData if present (often injected by inference-engine)
    let triggeredConfidence = null;
    if (typeof triggerData.confidence === 'number') {
        triggeredConfidence = triggerData.confidence;
    }
    // Determine decision
    let decision;
    if (!allPassed) {
        decision = 'SKIPPED';
    }
    else if (simulate) {
        decision = 'SIMULATED';
    }
    else if (rule.confidenceThreshold !== null && triggeredConfidence !== null && triggeredConfidence < rule.confidenceThreshold) {
        decision = 'PENDING_ESCALATION'; // Falls below confidence, human review needed
    }
    else if (!rule.autoExecute) {
        decision = 'PENDING_APPROVAL';
    }
    else {
        decision = 'EXECUTE';
    }
    // Execute actions (only if decision is EXECUTE)
    const executionResults = [];
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
                if (!plan.continueOnFailure)
                    break;
                continue;
            }
            const actionConfig = plan.actionDefinition.config;
            const actionResult = await executor(actionConfig, { logicalId, triggerData, prisma });
            executionResults.push({
                actionName: plan.actionDefinition.name,
                actionType: plan.actionDefinition.type,
                stepOrder: plan.stepOrder,
                success: actionResult.success,
                result: actionResult.result,
                error: actionResult.error,
            });
            if (!actionResult.success && !plan.continueOnFailure)
                break;
        }
    }
    else if (decision === 'SIMULATED') {
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
            : (decision === 'PENDING_APPROVAL' || decision === 'PENDING_ESCALATION')
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
            triggerData: triggerData,
            conditionResults: conditionResults,
            decision,
            executionResults: executionResults,
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
async function evaluateAllRules(logicalId, triggerType, triggerData, prisma, simulate = false) {
    // Get entity type
    const entityState = await prisma.currentEntityState.findUnique({
        where: { logicalId },
    });
    if (!entityState)
        throw new Error(`No current state for "${logicalId}"`);
    // Load all enabled rules for this entity type, sorted by priority
    const rules = await prisma.decisionRule.findMany({
        where: { entityTypeId: entityState.entityTypeId, enabled: true },
        orderBy: { priority: 'asc' },
    });
    const results = [];
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
//# sourceMappingURL=decision-engine.js.map