import { DecisionJournal, DecisionJournalInput } from './decision-types';
import { authorityEvaluator } from '../authority/AuthorityEvaluator';
import { AuthorityIntent, AuthorityStatus } from '../authority/authority-types';
import { TenantContextManager } from '../tenant/TenantContext';
import { IdentityContext } from '../identity/IdentityContext';

export class DecisionJournalManager {
    private decisions: DecisionJournal[] = [];

    constructor() {
        // Initialize with some dummy data if needed, or empty
    }

    submitDecision(input: DecisionJournalInput): DecisionJournal {
        // 1. Check Authority
        const result = authorityEvaluator.evaluate({
            actorId: input.author, // Assuming author string is the ID
            intentType: AuthorityIntent.DECIDE_SCENARIO,
            targetEntityId: input.chosenScenarioId || undefined,
            context: {
                asOf: input.context.asOf,
                ...input.context.comparisonMetadata // Pass other context if available
            }
        });

        if (result.status !== AuthorityStatus.ALLOWED) {
            throw new Error(`Decision blocked: ${result.reason?.message} (Code: ${result.reason?.code})`);
        }

        const identityContext = IdentityContext.getInstance().getCurrentContext();
        if (identityContext.tenant_id !== TenantContextManager.getContext().tenantId) {
            throw new Error('Identity context tenant mismatch');
        }

        const decision: DecisionJournal = {
            id: crypto.randomUUID(),
            tenantId: identityContext.tenant_id,
            timestamp: new Date(),
            author: input.author, // Should validate against identityContext.actor_id
            performedBySessionId: identityContext.session_id,
            justification: input.justification,
            chosenScenarioId: input.chosenScenarioId,
            context: input.context, // Snapshot the context
            authorityProof: result.proof!,
            admissionDecision: input.admissionDecision
        };

        // Append-only, in-memory storage
        this.decisions.push(decision);

        // In a real app, this would persist to backend
        console.log('Decision submitted:', decision);

        return decision;
    }

    getDecision(decisionId: string): DecisionJournal | undefined {
        return this.decisions.find(d => d.id === decisionId);
    }

    getAllDecisions(): DecisionJournal[] {
        // Return a copy to prevent mutation of the internal array, 
        // although objects inside are still mutable unless deep frozen.
        // For this phase, shallow copy is sufficient to prevent array mutation.
        return [...this.decisions].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
}

export const decisionManager = new DecisionJournalManager();
