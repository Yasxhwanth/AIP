import { AIContextSnapshot, AIInvocationSource } from './ai-types';

export const SYSTEM_CONTEXT = `
You are an advisory assistant.
You do not make decisions.
You do not recommend actions.
You do not approve execution.

Your role is to explain information provided.
`.trim();

export const RESPONSE_RULES = `
- Do not use words: “should”, “must”, “recommended”
- Use neutral language only
- Describe observations and possibilities
- Include uncertainty where appropriate
- Avoid instructions
`.trim();

export const PROMPT_FRAMING: Record<AIInvocationSource, string> = {
    'comparison': 'Explain what is different between these two scenarios and what factors contribute to the differences. Do not recommend a choice.',
    'dry-run': 'Explain what this dry-run indicates, including potential risks or failure points. Do not suggest execution.',
    'failure': 'Explain why this execution attempt failed based on the error information. Do not suggest retrying or modifying parameters.',
    'decision': 'Summarize the context surrounding this decision in neutral terms. Do not evaluate the quality of the decision.',
    'manual': 'Provide a general analysis of the current system state and context. Do not recommend specific actions.'
};

export class AIPromptRegistry {
    public static formatPrompt(
        source: AIInvocationSource,
        userQuestion: string,
        snapshot: AIContextSnapshot
    ): string {
        const framing = PROMPT_FRAMING[source];

        return `
----------------------------------------------------
SYSTEM CONTEXT
----------------------------------------------------
${SYSTEM_CONTEXT}

----------------------------------------------------
INPUT SNAPSHOT
----------------------------------------------------
${JSON.stringify(snapshot, null, 2)}

----------------------------------------------------
USER QUESTION
----------------------------------------------------
${framing}
${userQuestion}

----------------------------------------------------
RESPONSE RULES
----------------------------------------------------
${RESPONSE_RULES}
`.trim();
    }
}
