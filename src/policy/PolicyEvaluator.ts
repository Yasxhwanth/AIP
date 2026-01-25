import {
    PolicyDefinition,
    PolicyProposal,
    PolicyEvaluationResult,
    PolicyEvaluationStatus,
    PolicyConditionType,
    PolicySeverity
} from './policy-types';
import { AuthoritySnapshot } from '../authority/authority-types';

/**
 * Pure, read-only engine for evaluating policies.
 * 
 * CRITICAL SAFETY RULE:
 * This evaluator MUST NOT accept actor identity.
 * It evaluates the PROPOSAL against the SNAPSHOT.
 */
export class PolicyEvaluator {
    // In-memory policy store for demo purposes
    private policies: PolicyDefinition[] = [];

    /**
     * Evaluates all applicable policies for a given proposal.
     */
    public evaluate(
        proposal: PolicyProposal,
        snapshot: AuthoritySnapshot, // Authority is already resolved, but we might check constraints
        asOf: Date
    ): PolicyEvaluationResult[] {
        const results: PolicyEvaluationResult[] = [];

        // 1. Filter applicable policies
        const applicablePolicies = this.policies.filter(policy =>
            this.isPolicyApplicable(policy, proposal)
        );

        // 2. Evaluate each policy
        for (const policy of applicablePolicies) {
            const result = this.evaluatePolicy(policy, proposal, asOf);
            results.push(result);
        }

        return results;
    }

    private isPolicyApplicable(policy: PolicyDefinition, proposal: PolicyProposal): boolean {
        // Check Tenant
        if (policy.scope.tenantId !== proposal.tenantId) return false;

        // Check Intent/Action Type
        // If policy applies to specific intents, check if proposal.actionType matches
        // (Assuming actionType maps to intent for now, or we pass intent in proposal)
        // For simplicity, let's assume actionType IS the intent or mapped to it.
        if (policy.appliesToIntentTypes.length > 0 && !policy.appliesToIntentTypes.includes(proposal.actionType)) {
            return false;
        }

        return true;
    }

    private evaluatePolicy(
        policy: PolicyDefinition,
        proposal: PolicyProposal,
        asOf: Date
    ): PolicyEvaluationResult {
        let status = PolicyEvaluationStatus.PASS;
        let explanation = 'All conditions met.';
        const evidence: Record<string, any> = {};

        for (const condition of policy.conditions) {
            const conditionResult = this.evaluateCondition(condition, proposal, asOf);
            if (!conditionResult.pass) {
                status = policy.severity === PolicySeverity.BLOCKING ? PolicyEvaluationStatus.BLOCK : PolicyEvaluationStatus.WARN;
                explanation = `Condition failed: ${condition.type}. ${conditionResult.reason}`;
                evidence[condition.type] = conditionResult.evidence;
                // Fail fast on first blocking condition? Or collect all?
                // Let's collect all but status is determined by worst case.
                break;
            }
        }

        return {
            policyId: policy.policyId,
            policyName: policy.name,
            status,
            explanation,
            evidence
        };
    }

    private evaluateCondition(
        condition: { type: PolicyConditionType; parameters: any },
        proposal: PolicyProposal,
        asOf: Date
    ): { pass: boolean; reason?: string; evidence?: any } {
        switch (condition.type) {
            case PolicyConditionType.TIME_WINDOW:
                return this.evaluateTimeWindow(condition.parameters, asOf);
            case PolicyConditionType.REGION:
                // Placeholder: requires region in proposal parameters
                return { pass: true };
            case PolicyConditionType.RISK_LEVEL:
                // Placeholder: requires risk in proposal parameters
                return { pass: true };
            default:
                return { pass: true }; // Unknown conditions pass by default (or should they fail?)
        }
    }

    private evaluateTimeWindow(
        params: { startTime?: string; endTime?: string; daysOfWeek?: number[] },
        asOf: Date
    ): { pass: boolean; reason?: string; evidence?: any } {
        const currentHour = asOf.getHours();
        const currentDay = asOf.getDay(); // 0 = Sunday

        if (params.daysOfWeek && !params.daysOfWeek.includes(currentDay)) {
            return {
                pass: false,
                reason: `Operation not allowed on day ${currentDay}`,
                evidence: { currentDay, allowedDays: params.daysOfWeek }
            };
        }

        if (params.startTime && params.endTime) {
            const start = parseInt(params.startTime.split(':')[0]);
            const end = parseInt(params.endTime.split(':')[0]);
            if (currentHour < start || currentHour >= end) {
                return {
                    pass: false,
                    reason: `Operation outside allowed hours (${params.startTime}-${params.endTime})`,
                    evidence: { currentHour, window: `${params.startTime}-${params.endTime}` }
                };
            }
        }

        return { pass: true };
    }

    // Method to seed policies for testing/demo
    public addPolicy(policy: PolicyDefinition) {
        this.policies.push(policy);
    }
}

export const policyEvaluator = new PolicyEvaluator();
