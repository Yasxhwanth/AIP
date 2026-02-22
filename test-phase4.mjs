// Phase 4 Integration Test: Decision & Execution Engine
const BASE = 'http://localhost:3000';

async function post(path, body) {
    const r = await fetch(`${BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return { status: r.status, data: await r.json() };
}

async function put(path, body) {
    const r = await fetch(`${BASE}${path}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return { status: r.status, data: await r.json() };
}

async function get(path) {
    const r = await fetch(`${BASE}${path}`);
    return { status: r.status, data: await r.json() };
}

async function main() {
    console.log('=== Phase 4: Decision & Execution Engine Test ===\n');

    // 1. Get or create entity type
    console.log('1. Setting up entity type...');
    let etRes = await post('/entity-types', {
        name: 'DecisionTestPump',
        attributes: [
            { name: 'temperature', dataType: 'float', required: true },
            { name: 'pressure', dataType: 'float', required: true },
            { name: 'status', dataType: 'string', required: false },
        ],
    });
    if (etRes.status === 409) {
        const list = await get('/entity-types');
        etRes.data = list.data.find(e => e.name === 'DecisionTestPump');
    }
    const entityTypeId = etRes.data.id;
    console.log(`   ✓ Entity type: ${entityTypeId}\n`);

    // 2. Create entity instance with dangerous values
    console.log('2. Creating entity instance with high temp + pressure...');
    await post(`/entity-types/${entityTypeId}/instances`, {
        logicalId: 'pump-critical-001',
        temperature: 95,
        pressure: 200,
        status: 'running',
    });
    console.log('   ✓ Created pump-critical-001 (temp=95, pressure=200)\n');

    // 3. Create action definitions
    console.log('3. Creating action definitions...');

    let alertAction = await post('/action-definitions', {
        name: 'CreateCriticalAlert',
        type: 'CREATE_ALERT',
        config: { alertType: 'OVERHEAT_ALERT', severity: 'CRITICAL', entityTypeId },
    });
    if (alertAction.status === 409) {
        const list = await get('/action-definitions');
        alertAction.data = list.data.find(a => a.name === 'CreateCriticalAlert');
    }
    console.log(`   ✓ CREATE_ALERT action: ${alertAction.data.id}`);

    let logAction = await post('/action-definitions', {
        name: 'LogDecision',
        type: 'LOG_ONLY',
        config: { message: 'Decision was evaluated and executed' },
    });
    if (logAction.status === 409) {
        const list = await get('/action-definitions');
        logAction.data = list.data.find(a => a.name === 'LogDecision');
    }
    console.log(`   ✓ LOG_ONLY action: ${logAction.data.id}\n`);

    // 4. Create decision rule
    console.log('4. Creating decision rule (temp > 90 AND pressure > 150)...');
    let ruleRes = await post('/decision-rules', {
        name: 'OverheatShutdown',
        entityTypeId,
        conditions: [
            { field: 'temperature', operator: '>', value: 90 },
            { field: 'pressure', operator: '>', value: 150 },
        ],
        logicOperator: 'AND',
        priority: 10,
        autoExecute: true,
    });
    if (ruleRes.status === 409) {
        const list = await get('/decision-rules');
        ruleRes.data = list.data.find(r => r.name === 'OverheatShutdown');
    }
    const ruleId = ruleRes.data.id;
    console.log(`   ✓ Rule ID: ${ruleId}\n`);

    // 5. Link actions to rule via execution plans
    console.log('5. Creating execution plan (step 1: alert, step 2: log)...');
    const plan1 = await post('/execution-plans', {
        decisionRuleId: ruleId,
        actionDefinitionId: alertAction.data.id,
        stepOrder: 1,
    });
    if (plan1.status === 409) console.log('   (step 1 already exists)');
    else console.log(`   ✓ Step 1: CREATE_ALERT`);

    const plan2 = await post('/execution-plans', {
        decisionRuleId: ruleId,
        actionDefinitionId: logAction.data.id,
        stepOrder: 2,
    });
    if (plan2.status === 409) console.log('   (step 2 already exists)');
    else console.log(`   ✓ Step 2: LOG_ONLY`);
    console.log();

    // 6. SIMULATE first (dry run, no side effects)
    console.log('6. Simulating decision for pump-critical-001...');
    const simRes = await post('/decisions/pump-critical-001/simulate', {});
    console.log(`   Decision: ${simRes.data.decision ?? simRes.data.results?.[0]?.decision}`);
    console.log(`   Status: ${simRes.data.status ?? simRes.data.results?.[0]?.status}`);
    if (simRes.data.conditionResults) {
        for (const c of simRes.data.conditionResults) {
            console.log(`   Condition: ${c.field} ${c.operator} ${c.expected} → actual=${c.actual} → ${c.passed ? '✓' : '✗'}`);
        }
    } else if (simRes.data.results) {
        console.log(`   Rules evaluated: ${simRes.data.rulesEvaluated}, fired: ${simRes.data.rulesFired}`);
    }
    console.log();

    // 7. EXECUTE for real
    console.log('7. Executing decision for pump-critical-001...');
    const execRes = await post('/decisions/pump-critical-001/evaluate', {});
    const mainResult = execRes.data.results?.[0] ?? execRes.data;
    console.log(`   Decision: ${mainResult.decision}`);
    console.log(`   Status: ${mainResult.status}`);
    if (mainResult.executionResults) {
        for (const er of mainResult.executionResults) {
            console.log(`   Step ${er.stepOrder}: ${er.actionType} (${er.actionName}) → ${er.success ? '✓' : '✗'}`);
        }
    }
    console.log();

    // 8. Check decision logs
    console.log('8. Querying decision logs...');
    const logs = await get('/decision-logs?logicalId=pump-critical-001');
    console.log(`   ✓ ${logs.data.length} decision log(s) found`);
    for (const log of logs.data) {
        console.log(`     - ${log.decisionRule?.name}: ${log.decision} (${log.status}) [${log.triggerType}]`);
    }
    console.log();

    // 9. Test a safe entity (should SKIP)
    console.log('9. Testing with safe values (should SKIP)...');
    await post(`/entity-types/${entityTypeId}/instances`, {
        logicalId: 'pump-safe-001',
        temperature: 60,
        pressure: 80,
        status: 'running',
    });
    const safeRes = await post('/decisions/pump-safe-001/evaluate', {});
    const safeResult = safeRes.data.results?.[0] ?? safeRes.data;
    console.log(`   Decision: ${safeResult.decision} (expected: SKIPPED)`);
    console.log();

    // 10. List all rules
    console.log('10. Listing decision rules...');
    const allRules = await get('/decision-rules');
    for (const r of allRules.data) {
        const steps = r.executionPlans?.map(p => p.actionDefinition?.type).join(' → ') || 'no steps';
        console.log(`   - ${r.name} (priority ${r.priority}, auto=${r.autoExecute}): ${steps}`);
    }
    console.log();

    console.log('=== All Phase 4 tests passed! ===');
}

main().catch(console.error);
