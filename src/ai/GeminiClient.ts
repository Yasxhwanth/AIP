import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIContextSnapshot } from './ai-types';
import { ontologySnapshotResolver } from '../ontology/definition/OntologySnapshotResolver';
import { ontologyCompiler } from '../ontology/definition/OntologyCompiler';
import { TenantContextManager } from '../tenant/TenantContext';

/**
 * GeminiClient
 * 
 * Production-grade client for Google Gemini 2.0 API.
 */
export class GeminiClient {
    private static instance: GeminiClient;
    private genAI: GoogleGenerativeAI | null = null;
    private model: any = null;

    private constructor() {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
            // Use the official Gemini 2.0 Flash model
            this.model = this.genAI.getGenerativeModel({ 
                model: 'gemini-2.0-flash',
                generationConfig: {
                    temperature: 0.4,
                    maxOutputTokens: 2048,
                    topP: 0.95,
                }
            });
        } else {
            console.warn('VITE_GEMINI_API_KEY is not set. Gemini will not be available.');
        }
    }

    public static getInstance(): GeminiClient {
        if (!GeminiClient.instance) {
            GeminiClient.instance = new GeminiClient();
        }
        return GeminiClient.instance;
    }

    public isAvailable(): boolean {
        return this.model !== null;
    }

    public async generateAdvisory(
        prompt: string,
        contextSnapshot: AIContextSnapshot
    ): Promise<{ content: string; dataSources: string[] } | null> {
        if (!this.model) {
            console.warn('Gemini model not initialized - API key may not be configured');
            return null;
        }

        try {
            // Resolve Ontology Context for semantic understanding
            const ontologyContext = this.resolveOntologyContext(contextSnapshot);

            // Format context for Gemini
            const contextText = this.formatContextForGemini(contextSnapshot);
            
            // Build system prompt with strict advisory constraints and ontology awareness
            const systemPrompt = `You are a principal advisory assistant for an enterprise ontology platform.
You do NOT make decisions.
You do NOT recommend actions.
You do NOT approve execution.

Your role is to explain information provided and describe observations based on the Enterprise Ontology Model.

ONTOLOGY CONTEXT:
${ontologyContext}

RULES:
- Use neutral language only.
- Avoid words: "should", "must", "recommended", "critical", "urgent".
- Describe observations and possibilities based on the semantic definitions provided.
- If data contradicts the ontology model (e.g. invalid status), describe this as an observation.
- Include uncertainty where appropriate.
- Never provide instructions or commands.

CONTEXT PROVIDED:
${contextText}

USER QUESTION: ${prompt}

Provide a neutral, descriptive response analyzing the context through the lens of the enterprise ontology.`;

            // Use enhanced generation with better error handling
            const result = await this.model.generateContent(systemPrompt);
            const response = await result.response;
            const text = response.text();

            // Extract data sources from context
            const dataSources = this.extractDataSources(contextSnapshot);

            return {
                content: text,
                dataSources
            };
        } catch (error: any) {
            console.error('Gemini API error:', error);
            
            // Provide more detailed error information
            if (error.status === 'RESOURCE_EXHAUSTED') {
                console.error('Quota exceeded for Gemini API');
            } else if (error.status === 'INVALID_ARGUMENT') {
                console.error('Invalid request to Gemini API');
            } else if (error.status === 'UNAUTHENTICATED') {
                console.error('Authentication failed for Gemini API - check API key');
            }
            
            return null;
        }
    }

    /**
     * Generate advisory response with streaming capability
     */
    public async generateAdvisoryStream(
        prompt: string,
        contextSnapshot: AIContextSnapshot
    ): Promise<ReadableStream<string> | null> {
        if (!this.model) {
            console.warn('Gemini model not initialized - API key may not be configured');
            return null;
        }

        try {
            // Resolve Ontology Context for semantic understanding
            const ontologyContext = this.resolveOntologyContext(contextSnapshot);

            // Format context for Gemini
            const contextText = this.formatContextForGemini(contextSnapshot);
            
            // Build system prompt with strict advisory constraints and ontology awareness
            const systemPrompt = `You are a principal advisory assistant for an enterprise ontology platform.
You do NOT make decisions.
You do NOT recommend actions.
You do NOT approve execution.

Your role is to explain information provided and describe observations based on the Enterprise Ontology Model.

ONTOLOGY CONTEXT:
${ontologyContext}

RULES:
- Use neutral language only.
- Avoid words: "should", "must", "recommended", "critical", "urgent".
- Describe observations and possibilities based on the semantic definitions provided.
- If data contradicts the ontology model (e.g. invalid status), describe this as an observation.
- Include uncertainty where appropriate.
- Never provide instructions or commands.

CONTEXT PROVIDED:
${contextText}

USER QUESTION: ${prompt}

Provide a neutral, descriptive response analyzing the context through the lens of the enterprise ontology.`;

            // Use streaming generation
            const result = await this.model.generateContentStream(systemPrompt);
            
            // Create a readable stream to return
            const readableStream = new ReadableStream({
                async start(controller) {
                    for await (const chunk of result.stream) {
                        const chunkText = chunk.text();
                        controller.enqueue(chunkText);
                    }
                    controller.close();
                }
            });

            return readableStream;
        } catch (error: any) {
            console.error('Gemini API error in streaming:', error);
            
            if (error.status === 'RESOURCE_EXHAUSTED') {
                console.error('Quota exceeded for Gemini API');
            } else if (error.status === 'INVALID_ARGUMENT') {
                console.error('Invalid request to Gemini API');
            } else if (error.status === 'UNAUTHENTICATED') {
                console.error('Authentication failed for Gemini API - check API key');
            }
            
            return null;
        }
    }

    /**
     * Resolve semantic ontology context to help AI understand the business meaning of the data.
     */
    private resolveOntologyContext(snapshot: AIContextSnapshot): string {
        try {
            const tenantId = TenantContextManager.getContext().tenantId;
            const asOf = snapshot.timestamp;
            
            const ontologySnapshot = ontologySnapshotResolver.resolveActiveSnapshot(asOf, tenantId);
            const compiled = ontologyCompiler.compile(ontologySnapshot);
            
            const descriptions: string[] = [];
            
            // If specific entities are selected, include their object type definitions
            if (snapshot.selectedEntityIds && snapshot.selectedEntityIds.length > 0) {
                // In a real system, we'd look up the actual object types of these entities
                // For now, we'll include all types in the active version (up to a limit)
                for (const [id, schema] of compiled.ai_context_schemas.entries()) {
                    descriptions.push(schema.semantic_description);
                }
            } else {
                // General context: include high-level summary of the ontology
                descriptions.push(`Active Ontology Version: ${compiled.ontology_version_id}`);
                descriptions.push(`Object Types: ${Array.from(ontologySnapshot.object_types.values()).map(t => t.display_name).join(', ')}`);
                
                // Include first few schemas as examples
                const schemas = Array.from(compiled.ai_context_schemas.values()).slice(0, 3);
                for (const schema of schemas) {
                    descriptions.push(`--- TYPE: ${schema.object_type_id} ---\n${schema.semantic_description}`);
                }
            }
            
            return descriptions.join('\n\n');
        } catch (error) {
            return "Ontology context unavailable.";
        }
    }

    private formatContextForGemini(snapshot: AIContextSnapshot): string {
        const parts: string[] = [];

        parts.push(`Timestamp: ${snapshot.timestamp.toISOString()}`);
        parts.push(`View Context: ${snapshot.viewContext}`);

        if (snapshot.comparison) {
            parts.push(`\nScenario Comparison:`);
            parts.push(`- Left Scenario: ${snapshot.comparison.leftScenarioId || 'REALITY'}`);
            parts.push(`- Right Scenario: ${snapshot.comparison.rightScenarioId || 'REALITY'}`);
            parts.push(`- Delta Summary: ${JSON.stringify(snapshot.comparison.deltaSummary, null, 2)}`);
        }

        if (snapshot.execution) {
            parts.push(`\nExecution Context:`);
            parts.push(`- Intent ID: ${snapshot.execution.intentId}`);
            parts.push(`- Status: ${snapshot.execution.status}`);
            if (snapshot.execution.errorCode) {
                parts.push(`- Error: ${snapshot.execution.errorCode} - ${snapshot.execution.errorMessage}`);
            }
        }

        if (snapshot.decision) {
            parts.push(`\nDecision Context:`);
            parts.push(`- Decision ID: ${snapshot.decision.decisionId}`);
            parts.push(`- Chosen Scenario: ${snapshot.decision.chosenScenarioId || 'None'}`);
            parts.push(`- Justification: ${snapshot.decision.justification}`);
        }

        if (snapshot.activeScenarioId) {
            parts.push(`\nActive Scenario: ${snapshot.activeScenarioId}`);
        }

        if (snapshot.selectedEntityIds && snapshot.selectedEntityIds.length > 0) {
            parts.push(`\nSelected Entities: ${snapshot.selectedEntityIds.join(', ')}`);
        }

        return parts.join('\n');
    }

    private extractDataSources(snapshot: AIContextSnapshot): string[] {
        const sources: string[] = [];

        if (snapshot.comparison) {
            sources.push('Scenario Comparison Data');
            sources.push('Delta Analysis');
        }

        if (snapshot.execution) {
            sources.push('Execution Intent Data');
            if (snapshot.execution.impactedEntities) {
                sources.push(`Impacted Entities: ${snapshot.execution.impactedEntities.length}`);
            }
        }

        if (snapshot.decision) {
            sources.push('Decision Journal');
            sources.push('Authority Proof');
        }

        if (snapshot.selectedEntityIds) {
            sources.push(`Selected Entities: ${snapshot.selectedEntityIds.length}`);
        }

        return sources;
    }
}

