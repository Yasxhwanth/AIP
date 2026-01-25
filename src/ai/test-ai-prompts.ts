import { AIPromptRegistry } from './AIPromptRegistry';
import { AIContextSnapshot } from './ai-types';

const mockSnapshot: AIContextSnapshot = {
    timestamp: new Date(),
    viewContext: 'comparison',
    comparison: {
        asOf: new Date(),
        leftScenarioId: 'scenario-1',
        rightScenarioId: 'scenario-2',
        deltaSummary: { changes: 5 },
        topEntityDeltas: []
    }
};

function testFormatting() {
    console.log("Testing AI Prompt Formatting...\n");

    const sources: any[] = ['comparison', 'dry-run', 'failure', 'decision'];

    sources.forEach(source => {
        console.log(`--- Source: ${source} ---`);
        const formatted = AIPromptRegistry.formatPrompt(source, "What are the risks?", mockSnapshot);

        // Verify structure
        const hasSystemContext = formatted.includes("SYSTEM CONTEXT");
        const hasInputSnapshot = formatted.includes("INPUT SNAPSHOT");
        const hasUserQuestion = formatted.includes("USER QUESTION");
        const hasResponseRules = formatted.includes("RESPONSE RULES");

        console.log(`Structure Check: ${hasSystemContext && hasInputSnapshot && hasUserQuestion && hasResponseRules ? "PASS" : "FAIL"}`);

        // Verify neutral language rules in prompt
        const hasNeutralRules = formatted.includes("- Do not use words: “should”, “must”, “recommended”");
        console.log(`Neutral Rules Check: ${hasNeutralRules ? "PASS" : "FAIL"}`);

        console.log("\n");
    });
}

testFormatting();
