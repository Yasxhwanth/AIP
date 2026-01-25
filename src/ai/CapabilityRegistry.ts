/**
 * CapabilityRegistry
 * 
 * Makes the system aware of Gemini's capabilities.
 * This allows the UI to show users what the AI can and cannot do.
 * 
 * INVARIANTS:
 * - Capabilities are descriptive, not prescriptive
 * - No hardcoded business logic
 * - Capabilities work with any ontology structure
 */
export interface AICapability {
    id: string;
    name: string;
    description: string;
    available: boolean;
    category: 'analysis' | 'validation' | 'explanation' | 'visualization';
}

export class CapabilityRegistry {
    private static capabilities: AICapability[] = [
        {
            id: 'text-analysis',
            name: 'Text Analysis',
            description: 'Analyze and explain text-based data, summaries, and descriptions',
            available: true,
            category: 'analysis'
        },
        {
            id: 'fast-response',
            name: 'Fast Response',
            description: 'Quick processing and response for time-sensitive queries',
            available: true,
            category: 'analysis'
        },
        {
            id: 'pattern-recognition',
            name: 'Pattern Recognition',
            description: 'Identify patterns and trends in entity data, signals, and metrics',
            available: true,
            category: 'analysis'
        },
        {
            id: 'trend-identification',
            name: 'Trend Identification',
            description: 'Detect and describe trends in time-series data and signals',
            available: true,
            category: 'analysis'
        },
        {
            id: 'context-understanding',
            name: 'Context Understanding',
            description: 'Understand relationships between entities, scenarios, and decisions',
            available: true,
            category: 'explanation'
        },
        {
            id: 'data-validation',
            name: 'Data Validation',
            description: 'Validate data completeness, consistency, and detect anomalies',
            available: true,
            category: 'validation'
        },
        {
            id: 'explanation-generation',
            name: 'Explanation Generation',
            description: 'Generate explanations for system state, decisions, and changes',
            available: true,
            category: 'explanation'
        },
        {
            id: 'multi-modal',
            name: 'Multi-Modal Analysis',
            description: 'Analyze images, charts, and visual data (future capability)',
            available: false,
            category: 'visualization'
        },
        {
            id: 'code-generation',
            name: 'Code Generation',
            description: 'Generate code or queries (not available - advisory only)',
            available: false,
            category: 'analysis'
        },
        {
            id: 'action-execution',
            name: 'Action Execution',
            description: 'Execute actions or workflows (not available - advisory only)',
            available: false,
            category: 'analysis'
        }
    ];

    /**
     * Get all capabilities
     */
    public static getAllCapabilities(): AICapability[] {
        return [...this.capabilities];
    }

    /**
     * Get available capabilities only
     */
    public static getAvailableCapabilities(): AICapability[] {
        return this.capabilities.filter(c => c.available);
    }

    /**
     * Get capabilities by category
     */
    public static getCapabilitiesByCategory(category: AICapability['category']): AICapability[] {
        return this.capabilities.filter(c => c.category === category);
    }

    /**
     * Check if a specific capability is available
     */
    public static hasCapability(capabilityId: string): boolean {
        const cap = this.capabilities.find(c => c.id === capabilityId);
        return cap?.available ?? false;
    }

    /**
     * Get capability description
     */
    public static getCapabilityDescription(capabilityId: string): string | null {
        const cap = this.capabilities.find(c => c.id === capabilityId);
        return cap?.description ?? null;
    }
}

