import { LlmClient } from './llm-client';
import { GeminiClient } from './gemini-client';

export function getLlmClient(): LlmClient {
    const provider = process.env.LLM_PROVIDER || 'gemini';

    if (provider === 'gemini') {
        return new GeminiClient();
    }

    // Fallback/OpenAI could go here
    return new GeminiClient();
}
