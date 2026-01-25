import {
    ReasoningSession,
    ReasoningSessionStatus,
    AIRecommendation,
    RecommendedAction,
    ExplanationTrace,
    SimulationResult,
    AITool,
} from './ai-types.js';
import { Metadata } from './types.js';

/**
 * Mock AI Reasoning Engine.
 */
export class AIReasoningEngine {
    private sessions: Record<string, ReasoningSession> = {};
    private recommendations: Record<string, AIRecommendation[]> = {};
    private toolLogs: any[] = [];

    /**
     * Starts a new reasoning session.
     */
    async startSession(ontologyVersionId: string, userId: string, asOf: Date): Promise<string> {
        const sessionId = 'session-' + Math.random().toString(36).substr(2, 9);
        this.sessions[sessionId] = {
            id: sessionId,
            ontology_version_id: ontologyVersionId as any,
            as_of: asOf,
            initiated_by: userId as any,
            status: ReasoningSessionStatus.ACTIVE,
            created_at: new Date(),
            finalized_at: null,
        };
        return sessionId;
    }

    /**
     * Executes a tool and logs access.
     * AR-1: Read-only.
     * AR-6: Logged.
     */
    async useTool(sessionId: string, tool: AITool, input: Metadata): Promise<Metadata> {
        const session = this.sessions[sessionId];
        if (!session || session.status !== ReasoningSessionStatus.ACTIVE) {
            throw new Error('Invalid or inactive session');
        }

        const output = await tool.execute(input, { as_of: session.as_of });

        this.toolLogs.push({
            session_id: sessionId,
            tool_name: tool.name,
            input_data: input,
            output_data: output,
            accessed_at: new Date(),
        });

        return output;
    }

    /**
     * Produces a recommendation with trace and simulation.
     * AR-3: Structured trace.
     * AR-7: No thought.
     * AR-8: Semantic proposal.
     * AR-9: Workflow simulation.
     */
    async produceRecommendation(
        sessionId: string,
        proposal: RecommendedAction,
        trace: ExplanationTrace,
        simulation: SimulationResult
    ): Promise<string> {
        const session = this.sessions[sessionId];
        if (!session || session.status !== ReasoningSessionStatus.ACTIVE) {
            throw new Error('Invalid or inactive session');
        }

        const recId = 'rec-' + Math.random().toString(36).substr(2, 9);
        const recommendation: AIRecommendation = {
            id: recId,
            session_id: sessionId,
            action_proposal: proposal,
            explanation_trace: trace,
            simulation_result: simulation,
            created_at: new Date(),
        };

        if (!this.recommendations[sessionId]) this.recommendations[sessionId] = [];
        this.recommendations[sessionId].push(recommendation);

        return recId;
    }

    /**
     * Finalizes a session.
     * AR-10: Immutable snapshot.
     */
    async finalizeSession(sessionId: string): Promise<void> {
        const session = this.sessions[sessionId];
        if (session) {
            session.status = ReasoningSessionStatus.FINALIZED;
            session.finalized_at = new Date();
        }
    }

    getSession(id: string) { return this.sessions[id]; }
    getRecommendations(sessionId: string) { return this.recommendations[sessionId] || []; }
    getToolLogs(sessionId: string) { return this.toolLogs.filter(l => l.session_id === sessionId); }
}

// --- TEST SUITE ---

async function runTests() {
    console.log('Running AI Reasoning Layer Tests...\n');

    const engine = new AIReasoningEngine();
    const asOf = new Date('2026-01-01T00:00:00Z');
    const sessionId = await engine.startSession('v1', 'u1', asOf);

    // 1. Test Tool Access & Logging
    console.log('Test 1: Read-only Tool Access & Logging...');
    const mockTool: AITool = {
        name: 'GetEntityState',
        description: 'Fetches entity state at a specific time',
        input_schema: {},
        execute: async (input, ctx) => {
            return { id: input.id, state: 'active', asOf: ctx.as_of.toISOString() };
        }
    };

    const output = await engine.useTool(sessionId, mockTool, { id: 'ent1' });
    console.log('- Tool output received:', output.state === 'active' ? 'PASSED' : 'FAILED');
    console.log('- Tool output respects asOf:', output.asOf === asOf.toISOString() ? 'PASSED' : 'FAILED');
    console.log('- Tool access logged:', engine.getToolLogs(sessionId).length === 1 ? 'PASSED' : 'FAILED');

    // 2. Test Recommendation & Trace (AR-7, AR-8)
    console.log('\nTest 2: Evidence-based Recommendation (No Thought)...');
    const proposal: RecommendedAction = {
        action_definition_version_id: 'adv1',
        rationale: 'Entity state is active, requiring maintenance.',
        proposed_input: { entity_id: 'ent1', action: 'maintain' },
    };

    const trace: ExplanationTrace = {
        steps: [{
            evidence: { entity_id: 'ent1', state: 'active' },
            reason: 'Active entities require periodic maintenance.',
            recommendation: 'Propose maintenance action.',
            expected_outcome: { maintenance_scheduled: true }
        }]
    };

    const simulation: SimulationResult = {
        triggered_workflows: ['maintenance-workflow'],
        fired_rules: ['maintenance-threshold-rule'],
        blocking_steps: ['manual-approval'],
        predicted_state: { maintenance_pending: true }
    };

    const recId = await engine.produceRecommendation(sessionId, proposal, trace, simulation);
    const recs = engine.getRecommendations(sessionId);

    console.log('- Recommendation created:', recId ? 'PASSED' : 'FAILED');
    console.log('- Trace has no "thought" field:', !((recs[0]?.explanation_trace.steps[0] as any)?.thought) ? 'PASSED' : 'FAILED');
    console.log('- Proposal is semantic (not ActionIntent):', !((recs[0]?.action_proposal as any)?.idempotency_key) ? 'PASSED' : 'FAILED');

    // 3. Test Session Immutability (AR-10)
    console.log('\nTest 3: Session Immutability...');
    await engine.finalizeSession(sessionId);
    console.log('- Session status is FINALIZED:', engine.getSession(sessionId)?.status === ReasoningSessionStatus.FINALIZED ? 'PASSED' : 'FAILED');

    try {
        await engine.useTool(sessionId, mockTool, { id: 'ent2' });
        console.log('- Error: Should not be able to use tool in finalized session: FAILED');
    } catch (err) {
        console.log('- Tool access blocked in finalized session: PASSED');
    }

    console.log('\nTests Completed.');
}

runTests().catch(console.error);
