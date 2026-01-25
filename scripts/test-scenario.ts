import { ScenarioManager } from '../src/ontology/ScenarioManager';
import { ScenarioAwareQueryResolver } from '../src/ontology/ScenarioAwareQueryResolver';
import { QueryClient } from '../src/adapters/query/QueryClient';

console.log('Running Phase 14 Verification...');

// 1. Setup Truth
const asOf = new Date('2026-01-23T10:00:00Z');
const truthEntities = QueryClient.getEntities(asOf);
const targetEntity = truthEntities[0];

if (!targetEntity) {
    console.error('FAIL: No truth entities found.');
    process.exit(1);
}

console.log(`Target Entity: ${targetEntity.id}, Status: ${targetEntity.status}`);

// 2. Create Scenario
const scenario = ScenarioManager.createScenario(asOf, "v1.0.0", "TEST", "Test Scenario");
console.log(`Created Scenario: ${scenario.scenarioId}`);

// 3. Verify Isolation (Before Mutation)
const resolvedBefore = ScenarioAwareQueryResolver.resolveEntities(asOf, scenario.scenarioId, "v1.0.0");
const resolvedTargetBefore = resolvedBefore.find(e => e.id === targetEntity.id);

if (resolvedTargetBefore?.status !== targetEntity.status) {
    console.error('FAIL: Scenario should match truth before mutation.');
    process.exit(1);
}

// 4. Add Mutation
console.log('Adding Mutation: STATUS_CHANGE -> Degraded');
ScenarioManager.addMutation(scenario.scenarioId, targetEntity.id, 'STATUS_CHANGE', 'Degraded', asOf);

// 5. Verify Resolution (After Mutation)
const resolvedAfter = ScenarioAwareQueryResolver.resolveEntities(asOf, scenario.scenarioId, "v1.0.0");
const resolvedTargetAfter = resolvedAfter.find(e => e.id === targetEntity.id);

if (resolvedTargetAfter?.status !== 'Degraded') {
    console.error(`FAIL: Expected status 'Degraded', got '${resolvedTargetAfter?.status}'`);
    process.exit(1);
}

// 6. Verify Truth Remains Unchanged
const truthAfter = QueryClient.getEntities(asOf);
const truthTargetAfter = truthAfter.find(e => e.id === targetEntity.id);

if (truthTargetAfter?.status !== targetEntity.status) {
    console.error('FAIL: Truth was mutated! CRITICAL FAILURE.');
    process.exit(1);
}

console.log('SUCCESS: Scenario isolation and resolution verified.');
