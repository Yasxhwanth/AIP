import { DecisionJournal } from '../decision/decision-types';
import {
    ReplayTimeline,
    TimelineEvent,
    SystemContextPayload,
    BaseRealitySnapshotPayload,
    ScenarioBranchesPayload,
    ComparisonViewPayload,
    HumanDecisionPayload
} from './replay-types';

/**
 * ReplayEngine
 * 
 * Responsible for ASSEMBLING a deterministic replay timeline from a recorded decision.
 * 
 * INVARIANTS:
 * - Must NOT infer or compute new state.
 * - Must NOT re-run analysis.
 * - Must strictly order events.
 * - Must use recorded snapshots.
 */
export class ReplayEngine {

    static assembleTimeline(decision: DecisionJournal): ReplayTimeline {
        const events: TimelineEvent[] = [];
        let eventIndex = 0;

        // 1. SYSTEM CONTEXT
        // Reconstructs the environment state at the moment of decision.
        events.push({
            eventIndex: eventIndex++,
            eventType: 'SYSTEM_CONTEXT',
            timestamp: decision.context.asOf, // The 'asOf' time is when the context was valid
            payload: {
                asOf: decision.context.asOf,
                user: decision.author,
                environment: 'Production' // Hardcoded for now, would come from env config
            } as SystemContextPayload
        });

        // 2. BASE REALITY SNAPSHOT
        // Establishes the immutable truth baseline.
        events.push({
            eventIndex: eventIndex++,
            eventType: 'BASE_REALITY_SNAPSHOT',
            timestamp: decision.context.asOf,
            payload: {
                asOf: decision.context.asOf,
                ontologyVersion: 'v1.0.0' // Should ideally be captured in DecisionContext
            } as BaseRealitySnapshotPayload
        });

        // 3. SCENARIO BRANCHES
        // Identifies which hypothetical futures were active.
        const activeScenarios = [];
        if (decision.context.leftScenarioId) activeScenarios.push({ id: decision.context.leftScenarioId, name: 'Left Scenario' }); // Name should be looked up if possible, or stored
        if (decision.context.rightScenarioId) activeScenarios.push({ id: decision.context.rightScenarioId, name: 'Right Scenario' });

        events.push({
            eventIndex: eventIndex++,
            eventType: 'SCENARIO_BRANCHES',
            timestamp: decision.context.asOf,
            payload: {
                activeScenarios
            } as ScenarioBranchesPayload
        });

        // 4. COMPARISON VIEW
        // The exact delta intelligence presented to the human.
        events.push({
            eventIndex: eventIndex++,
            eventType: 'COMPARISON_VIEW',
            timestamp: decision.context.asOf,
            payload: {
                leftScenarioId: decision.context.leftScenarioId,
                rightScenarioId: decision.context.rightScenarioId,
                deltaSummary: decision.context.deltaSummary
            } as ComparisonViewPayload
        });

        // 5. AI EXPLANATION (Optional)
        // If the decision had AI reasoning attached, it would go here.
        // For now, we skip as it's not in the basic DecisionJournal yet.

        // 6. HUMAN DECISION
        // The final commitment.
        events.push({
            eventIndex: eventIndex++,
            eventType: 'HUMAN_DECISION',
            timestamp: decision.timestamp, // This is the actual submission time
            payload: {
                chosenScenarioId: decision.chosenScenarioId,
                justification: decision.justification,
                author: decision.author
            } as HumanDecisionPayload
        });

        return {
            decisionId: decision.id,
            decidedAt: decision.timestamp,
            events
        };
    }
}
