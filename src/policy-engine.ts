import { PrismaClient, Prisma } from './generated/prisma/client';

// ── Condition Types ──────────────────────────────────────────────

type Operator = '>' | '<' | '>=' | '<=' | '==' | '!=';

interface PolicyCondition {
    field: string;
    operator: Operator;
    value: number | string | boolean;
}

// ── Condition Evaluator ──────────────────────────────────────────

function evaluateCondition(condition: PolicyCondition, data: Record<string, unknown>): boolean {
    const actual = data[condition.field];
    if (actual === undefined || actual === null) return false;

    const { operator, value } = condition;

    switch (operator) {
        case '>': return (actual as number) > (value as number);
        case '<': return (actual as number) < (value as number);
        case '>=': return (actual as number) >= (value as number);
        case '<=': return (actual as number) <= (value as number);
        case '==': return actual === value;
        case '!=': return actual !== value;
        default: return false;
    }
}

// ── Policy Engine ────────────────────────────────────────────────

interface DomainEventPayload {
    previousState: Record<string, unknown> | null;
    newState: Record<string, unknown>;
    validFrom: string;
}

interface EventContext {
    eventId: string;      // DomainEvent.id for dedup
    eventType: string;
    entityTypeId: string;
    logicalId: string;
    entityVersion: number;
    payload: DomainEventPayload;
}

export async function evaluatePolicies(
    event: EventContext,
    prisma: PrismaClient,
): Promise<void> {
    try {
        // Load all enabled policies matching this entity type + event type
        const policies = await prisma.policyDefinition.findMany({
            where: {
                entityTypeId: event.entityTypeId,
                eventType: event.eventType,
                enabled: true,
            },
        });

        if (policies.length === 0) return;

        const newState = event.payload.newState;

        for (const policy of policies) {
            const condition = policy.condition as unknown as PolicyCondition;
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
                const config = (policy.actionConfig ?? {}) as Record<string, unknown>;
                const alertType = (config.alertType as string) ?? `${policy.name}Alert`;
                const severity = (config.severity as string) ?? 'warning';

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
                    console.log(
                        `[PolicyEngine] Skipping duplicate alert for event ${event.eventId} + policy "${policy.name}"`,
                    );
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
                        evaluationTrace: evaluationTrace as unknown as Prisma.InputJsonValue,
                        payload: {
                            policyName: policy.name,
                            condition: policy.condition,
                            triggeredBy: newState,
                            previousState: event.payload.previousState,
                            validFrom: event.payload.validFrom,
                        } as unknown as Prisma.InputJsonValue,
                    },
                });

                // eslint-disable-next-line no-console
                console.log(
                    `[PolicyEngine] Alert fired: ${alertType} (${severity}) for ${event.logicalId} — policy "${policy.name}" v${policy.version}`,
                );
            }
        }
    } catch (error) {
        // Policy evaluation must never crash the main request
        // eslint-disable-next-line no-console
        console.error('[PolicyEngine] Error evaluating policies:', error);
    }
}
