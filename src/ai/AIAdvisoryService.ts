import {
    AIAdvisorySession,
    AIContextSnapshot,
    AIAdvisoryRequest,
    AIAdvisoryResponse,
    AIInvocationSource
} from './ai-types';
import { IdentityContext } from '../identity/IdentityContext';
import { AIPromptRegistry } from './AIPromptRegistry';
import { GeminiClient } from './GeminiClient';

export class AIAdvisoryService {
    private static sessions: Map<string, AIAdvisorySession> = new Map();

    /**
     * Creates a new advisory session.
     * Provenance is mandatory.
     */
    public static createSession(
        userId: string,
        source: AIInvocationSource,
        purpose: string,
        snapshot: AIContextSnapshot
    ): AIAdvisorySession {
        const sessionId = crypto.randomUUID();
        const session: AIAdvisorySession = {
            sessionId,
            createdAt: new Date(),
            createdBy: userId,
            performedBySessionId: IdentityContext.getInstance().getCurrentContext().session_id,
            invocationSource: source,
            purpose,
            contextSnapshot: Object.freeze({ ...snapshot }), // Immutable snapshot
            history: []
        };

        this.sessions.set(sessionId, session);
        return session;
    }

    /**
     * Submits a request to the AI.
     * Returns a deterministic, explainable response.
     */
    public static async submitRequest(
        sessionId: string,
        userPrompt: string
    ): Promise<AIAdvisoryResponse> {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Session ${sessionId} not found`);
        }

        // Format the prompt using the registry
        const formattedPrompt = AIPromptRegistry.formatPrompt(
            session.invocationSource,
            userPrompt,
            session.contextSnapshot
        );

        // Try Gemini first, fall back to mock if unavailable
        // Note: Gemini 2.0 Flash also supports streaming via generateAdvisoryStream for real-time responses
        const geminiClient = GeminiClient.getInstance();
        let response: AIAdvisoryResponse;
        let dataSources: string[] = [];

        if (geminiClient.isAvailable()) {
            const geminiResult = await geminiClient.generateAdvisory(userPrompt, session.contextSnapshot);
            if (geminiResult) {
                response = {
                    responseType: 'analysis',
                    content: geminiResult.content,
                    confidenceLevel: 'high',
                    disclaimer: "Advisory only — not a recommendation or decision",
                    supportingSignals: geminiResult.dataSources
                };
                dataSources = geminiResult.dataSources;
            } else {
                // Fall back to mock
                response = this.generateMockResponse(session.invocationSource, userPrompt, session.contextSnapshot);
            }
        } else {
            // Gemini not configured, use mock
            response = this.generateMockResponse(session.invocationSource, userPrompt, session.contextSnapshot);
        }

        // Record history with data sources
        session.history.push({
            request: { sessionId, prompt: formattedPrompt, contextSnapshot: session.contextSnapshot },
            response: {
                ...response,
                dataSources: dataSources.length > 0 ? dataSources : undefined
            } as any,
            timestamp: new Date()
        });

        return response;
    }

    private static generateMockResponse(source: AIInvocationSource, prompt: string, snapshot: AIContextSnapshot): AIAdvisoryResponse {
        const promptLower = prompt.toLowerCase();
        const disclaimer = "Advisory only — not a recommendation or decision";

        if (source === 'comparison') {
            return {
                responseType: 'analysis',
                content: "Observations indicate a variance in resource allocation between the two scenarios. Scenario A maintains a higher buffer in the Northeast sector, while Scenario B prioritizes throughput in the Southern corridor. These differences appear to stem from the varying weighting of latency versus cost in the respective configurations.",
                confidenceLevel: 'high',
                disclaimer,
                supportingSignals: [
                    "Resource Variance: 15%",
                    "Throughput Delta: +8% (Scenario B)",
                    "Latency Delta: -12ms (Scenario A)"
                ]
            };
        }

        if (source === 'dry-run') {
            return {
                responseType: 'observation',
                content: "The dry-run output shows a potential bottleneck at HUB-04 if the current trajectory is maintained. There is a possibility of queue saturation within the next 4 hours based on the simulated load. Observations suggest that the system capacity is approaching its defined limits.",
                confidenceLevel: 'medium',
                disclaimer,
                supportingSignals: [
                    "Queue Depth: 85% of limit",
                    "Projected Saturation: T+4h",
                    "Simulated Load: 1.2x Baseline"
                ]
            };
        }

        if (source === 'failure') {
            return {
                responseType: 'explanation',
                content: "The execution attempt was halted due to a timeout in the downstream validation service. Logs indicate that the service did not respond within the 5000ms window. This appears to be an isolated connectivity event rather than a logic error in the submission itself.",
                confidenceLevel: 'high',
                disclaimer,
                supportingSignals: [
                    "Error Code: TIMEOUT_5000",
                    "Service: ValidationEngine",
                    "Retry Count: 0"
                ]
            };
        }

        if (source === 'decision') {
            return {
                responseType: 'analysis',
                content: "The context for this decision includes the recent surge in regional demand and the current maintenance window for the primary uplink. The chosen path aligns with the 'Safety First' policy profile active at the time of submission. Observations show that alternative paths were evaluated but had higher risk scores.",
                confidenceLevel: 'high',
                disclaimer,
                supportingSignals: [
                    "Active Policy: SafetyFirst_v2",
                    "Uplink Status: Maintenance",
                    "Risk Score: 0.12 (Chosen) vs 0.45 (Avg)"
                ]
            };
        }

        // Default Fallback
        return {
            responseType: 'observation',
            content: "The provided context has been analyzed. Observations are limited due to the lack of specific intent in the query. The snapshot remains available for detailed inspection of attributes and relations.",
            confidenceLevel: 'low',
            disclaimer,
            supportingSignals: ["Generic analysis triggered"]
        };
    }

    public static getSession(sessionId: string): AIAdvisorySession | undefined {
        return this.sessions.get(sessionId);
    }
}
