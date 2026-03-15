export interface LlmMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface LlmChatOptions {
    systemPrompt?: string;
    messages: LlmMessage[];
    tools?: any[];
    temperature?: number;
    model?: string;
}

export interface LlmChatResponse {
    answer: string;
    toolCalls?: Array<{
        name: string;
        arguments: any;
    }>;
}

export interface LlmClient {
    chat(opts: LlmChatOptions): Promise<LlmChatResponse>;
}
