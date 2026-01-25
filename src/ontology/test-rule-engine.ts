import { RuleEvaluationEngine } from './rule-engine.js';
import { EntitySnapshot } from './query/types.js';
import { ConditionExpression, RuleVersion } from './rule-types.js';

// Mock Query Service
const mockQueryService: any = {
    resolveMetadataVersion: async () => 'v1',
    getEntityByVersion: async () => testSnapshot,
};

// Mock Persistence Service
const mockPersistenceService: any = {
    getPreviousResult: async () => null,
    saveEvaluationState: async () => { },
    saveEvent: async () => { },
    getPublishedRules: async () => [],
};

const engine = new RuleEvaluationEngine(mockQueryService, mockPersistenceService);

const testSnapshot: EntitySnapshot = {
    id: 'e1' as any,
    version_id: 'ev1' as any,
    type_id: 'et1' as any,
    attributes: {
        status: 'ACTIVE',
        priority: 10,
        tags: ['urgent', 'internal'],
    },
    metadata: {
        source: 'manual',
    },
    valid_from: new Date(),
    valid_to: null,
};

async function runTests() {
    console.log('Running Rule Engine Tests...\n');

    // 1. Simple Comparison
    const cond1: ConditionExpression = {
        path: 'attributes.status',
        comparison: 'EQUALS',
        value: 'ACTIVE',
    };
    console.log('Test 1 (Simple EQUALS):', engine.evaluateCondition(cond1, testSnapshot) === true ? 'PASSED' : 'FAILED');

    const cond2: ConditionExpression = {
        path: 'attributes.priority',
        comparison: 'GREATER_THAN',
        value: 5,
    };
    console.log('Test 2 (Simple GREATER_THAN):', engine.evaluateCondition(cond2, testSnapshot) === true ? 'PASSED' : 'FAILED');

    // 2. Logical AND
    const cond3: ConditionExpression = {
        operator: 'AND',
        expressions: [cond1, cond2],
    };
    console.log('Test 3 (Logical AND):', engine.evaluateCondition(cond3, testSnapshot) === true ? 'PASSED' : 'FAILED');

    // 3. Logical OR
    const cond4: ConditionExpression = {
        operator: 'OR',
        expressions: [
            { path: 'attributes.status', comparison: 'EQUALS', value: 'INACTIVE' },
            { path: 'attributes.priority', comparison: 'EQUALS', value: 10 },
        ],
    };
    console.log('Test 4 (Logical OR):', engine.evaluateCondition(cond4, testSnapshot) === true ? 'PASSED' : 'FAILED');

    // 4. Logical NOT
    const cond5: ConditionExpression = {
        operator: 'NOT',
        expressions: [
            { path: 'attributes.status', comparison: 'EQUALS', value: 'INACTIVE' },
        ],
    };
    console.log('Test 5 (Logical NOT):', engine.evaluateCondition(cond5, testSnapshot) === true ? 'PASSED' : 'FAILED');

    // 5. Nested Expressions
    const cond6: ConditionExpression = {
        operator: 'AND',
        expressions: [
            { path: 'metadata.source', comparison: 'EQUALS', value: 'manual' },
            {
                operator: 'OR',
                expressions: [
                    { path: 'attributes.tags', comparison: 'CONTAINS', value: 'urgent' },
                    { path: 'attributes.priority', comparison: 'LESS_THAN', value: 5 },
                ],
            },
        ],
    };
    console.log('Test 6 (Nested AND/OR):', engine.evaluateCondition(cond6, testSnapshot) === true ? 'PASSED' : 'FAILED');

    // 6. Transition Detection
    const rule: RuleVersion = {
        id: 'r1',
        rule_id: 'rd1',
        ontology_version_id: 'v1' as any,
        version_number: 1,
        configuration: cond1,
        created_at: new Date(),
    };

    const event1 = await engine.evaluateRule(rule, testSnapshot, false);
    console.log('Test 7 (Transition false -> true):', event1 !== null ? 'PASSED' : 'FAILED');

    const event2 = await engine.evaluateRule(rule, testSnapshot, true);
    console.log('Test 8 (Transition true -> true):', event2 === null ? 'PASSED' : 'FAILED');

    const event3 = await engine.evaluateRule(rule, testSnapshot, null);
    console.log('Test 9 (Transition null -> true):', event3 === null ? 'PASSED' : 'FAILED');

    // 7. Idempotency (Conceptual)
    // In a real scenario, the persistence service would prevent duplicate events.
    // Here we verify that the engine logic itself doesn't emit if current == previous.
    const event4 = await engine.evaluateRule(rule, testSnapshot, true);
    console.log('Test 10 (Idempotency - no event if already true):', event4 === null ? 'PASSED' : 'FAILED');

    // 8. Time-scoped state (Conceptual)
    // Verify that the engine uses the provided asOf time for state resolution.
    let resolvedAsOf: Date | null = null;
    const timeScopedPersistence: any = {
        getPreviousResult: async (rvid: string, toid: string, asOf: Date) => {
            resolvedAsOf = asOf;
            return false;
        },
        saveEvaluationState: async () => { },
        saveEvent: async () => { },
        getPublishedRules: async () => [rule],
    };
    const timeScopedEngine = new RuleEvaluationEngine(mockQueryService, timeScopedPersistence);
    const targetAsOf = new Date('2026-01-01T00:00:00Z');

    await timeScopedEngine.processEntityUpdate('ev1' as any, targetAsOf);
    const passed = resolvedAsOf && (resolvedAsOf as Date).getTime() === targetAsOf.getTime();
    console.log('Test 11 (Time-scoped state resolution):', passed ? 'PASSED' : 'FAILED');

    console.log('\nTests Completed.');
}

runTests().catch(console.error);
