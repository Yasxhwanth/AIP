import { LlmClient, LlmChatOptions, LlmChatResponse } from './llm-client';
export declare class GeminiClient implements LlmClient {
    private genAI;
    constructor();
    chat(opts: LlmChatOptions): Promise<LlmChatResponse>;
    private mapMessagesToGemini;
}
//# sourceMappingURL=gemini-client.d.ts.map