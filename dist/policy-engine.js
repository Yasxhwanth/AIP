"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluatePolicies = evaluatePolicies;
exports.simulatePolicy = simulatePolicy;
// ── Condition Evaluator ──────────────────────────────────────────
function evaluateCondition(condition, data) {
    const actual = data[condition.field];
    if (actual === undefined || actual === null)
        return false;
    const { operator, value } = condition;
    switch (operator) {
        case '>': return actual > value;
        case '<': return actual < value;
        case '>=': return actual >= value;
        case '<=': return actual <= value;
        case '==': return actual === value;
        case '!=': return actual !== value;
        default: return false;
    }
}
async function evaluatePolicies(event, prisma) {
    try {
        // Load all enabled policies matching this entity type + event type
        const policies = await prisma.policyDefinition.findMany({
            where: {
                entityTypeId: event.entityTypeId,
                eventType: event.eventType,
                enabled: true,
            },
        });
        if (policies.length === 0)
            return;
        const newState = event.payload.newState;
        for (const policy of policies) {
            const condition = policy.condition;
            const fieldValue = newState[condition.field];
            const matched = evaluateCondition(condition, newState);
            // Build evaluation trace for auditability
            const evaluationTrace = {
                condition: policy.condition,
                fieldValue,
                result: matched,
                evaluatedAt: new Date().toISOString(),
            };
            if (matched) {
                const config = (policy.actionConfig ?? {});
                const alertType = config.alertType ?? `${policy.name}Alert`;
                const severity = config.severity ?? 'warning';
                // Idempotency: check if alert already exists for this eventId + policyId
                const existing = await prisma.alert.findUnique({
                    where: {
                        eventId_policyId: {
                            eventId: event.eventId,
                            policyId: policy.id,
                        },
                    },
                });
                if (existing) {
                    // eslint-disable-next-line no-console
                    console.log(`[PolicyEngine] Skipping duplicate alert for event ${event.eventId} + policy "${policy.name}"`);
                    continue;
                }
                await prisma.alert.create({
                    data: {
                        alertType,
                        severity,
                        policyId: policy.id,
                        policyVersion: policy.version,
                        eventId: event.eventId,
                        entityTypeId: event.entityTypeId,
                        logicalId: event.logicalId,
                        evaluationTrace: evaluationTrace,
                        payload: {
                            policyName: policy.name,
                            condition: policy.condition,
                            triggeredBy: newState,
                            previousState: event.payload.previousState,
                            validFrom: event.payload.validFrom,
                        },
                    },
                });
                // eslint-disable-next-line no-console
                console.log(`[PolicyEngine] Alert fired: ${alertType} (${severity}) for ${event.logicalId} — policy "${policy.name}" v${policy.version}`);
            }
        }
    }
    catch (error) {
        // Policy evaluation must never crash the main request
        // eslint-disable-next-line no-console
        console.error('[PolicyEngine] Error evaluating policies:', error);
    }
}
async function simulatePolicy(policyId, dataPayload, prisma) {
    try {
        const policy = await prisma.policyDefinition.findUnique({ where: { id: policyId } });
        if (!policy) {
            return { matched: false, trace: {}, error: 'Policy not found' };
        }
        const condition = policy.condition;
        const fieldValue = dataPayload[condition.field];
        const matched = evaluateCondition(condition, dataPayload);
        return {
            matched,
            trace: {
                condition: policy.condition,
                fieldValue,
                result: matched,
                evaluatedAt: new Date().toISOString(),
            }
        };
    }
    catch (error) {
        return { matched: false, trace: {}, error: String(error) };
    }
}
//# sourceMappingURL=policy-engine.js.map