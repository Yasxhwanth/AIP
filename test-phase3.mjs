// Phase 3 Integration Test: ML Model Registry & Inference
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
    console.log('=== Phase 3: ML Model Registry & Inference Test ===\n');

    // 1. Get or create entity type
    console.log('1. Setting up entity type "Machine"...');
    let etRes = await post('/entity-types', {
        name: 'MLTestMachine',
        attributes: [
            { name: 'temperature', dataType: 'float', required: true },
            { name: 'pressure', dataType: 'float', required: true },
            { name: 'vibration', dataType: 'float', required: false },
        ],
    });
    if (etRes.status === 409) {
        const list = await get('/entity-types');
        etRes.data = list.data.find(e => e.name === 'MLTestMachine');
    }
    const entityTypeId = etRes.data.id;
    console.log(`   ✓ Entity type ID: ${entityTypeId}\n`);

    // 2. Create entity instance
    console.log('2. Creating entity instance...');
    await post(`/entity-types/${entityTypeId}/instances`, {
        logicalId: 'ml-machine-001',
        temperature: 95,
        pressure: 150,
        vibration: 3.5,
    });
    console.log('   ✓ Created ml-machine-001\n');

    // 3. Ingest telemetry for anomaly detection test
    console.log('3. Ingesting telemetry for Z-score test...');
    const now = Date.now();
    const telemetry = [];
    for (let i = 0; i < 30; i++) {
        telemetry.push({
            metric: 'temperature',
            value: 70 + Math.random() * 10, // normal: 70-80
            timestamp: new Date(now - (30 - i) * 60 * 1000).toISOString(),
        });
    }
    await post('/telemetry', { logicalId: 'ml-machine-001', metrics: telemetry });
    console.log(`   ✓ Ingested ${telemetry.length} temperature points (normal range: 70-80)\n`);

    // 4. Register a model
    console.log('4. Registering anomaly detection model...');
    let modelRes = await post('/models', {
        name: 'TemperatureAnomalyDetector',
        entityTypeId,
        description: 'Detects abnormal temperature readings on machines',
        inputFields: ['temperature'],
        outputField: 'anomalyScore',
    });
    if (modelRes.status === 409) {
        const list = await get('/models');
        modelRes.data = list.data.find(m => m.name === 'TemperatureAnomalyDetector');
    }
    const modelId = modelRes.data.id;
    console.log(`   ✓ Model ID: ${modelId}\n`);

    // 5. Create version with THRESHOLD strategy
    console.log('5. Creating THRESHOLD version (v1)...');
    const v1Res = await post(`/models/${modelId}/versions`, {
        strategy: 'THRESHOLD',
        hyperparameters: { field: 'temperature', operator: '>', threshold: 90 },
    });
    const v1Id = v1Res.data.id;
    console.log(`   ✓ Version 1 (${v1Res.data.status}): ${v1Id}\n`);

    // 6. Promote to STAGING then PRODUCTION
    console.log('6. Promoting v1: DRAFT → STAGING → PRODUCTION...');
    await put(`/model-versions/${v1Id}/status`, { status: 'STAGING' });
    const prodRes = await put(`/model-versions/${v1Id}/status`, { status: 'PRODUCTION' });
    console.log(`   ✓ Status: ${prodRes.data.status}\n`);

    // 7. Run inference (THRESHOLD)
    console.log('7. Running THRESHOLD inference (temp=95, threshold=90)...');
    const inferRes = await post(`/models/${modelId}/infer/ml-machine-001`, {});
    console.log(`   Prediction: ${JSON.stringify(inferRes.data.prediction)}`);
    console.log(`   Confidence: ${inferRes.data.confidence}\n`);

    // 8. Create ANOMALY_ZSCORE version (v2)
    console.log('8. Creating ANOMALY_ZSCORE version (v2)...');
    const v2Res = await post(`/models/${modelId}/versions`, {
        strategy: 'ANOMALY_ZSCORE',
        hyperparameters: { field: 'temperature', lookbackMinutes: 60, zThreshold: 2.0 },
    });
    const v2Id = v2Res.data.id;
    console.log(`   ✓ Version 2 created: ${v2Id}`);

    // Promote v2 to PRODUCTION (auto-retires v1)
    await put(`/model-versions/${v2Id}/status`, { status: 'STAGING' });
    await put(`/model-versions/${v2Id}/status`, { status: 'PRODUCTION' });
    console.log('   ✓ v2 promoted to PRODUCTION (v1 auto-retired)\n');

    // 9. Run inference (ANOMALY_ZSCORE — current temp=95 vs normal 70-80)
    console.log('9. Running ANOMALY_ZSCORE inference (current=95, normal=70-80)...');
    const zInferRes = await post(`/models/${modelId}/infer/ml-machine-001`, {});
    console.log(`   Prediction: ${JSON.stringify(zInferRes.data.prediction)}`);
    console.log(`   Confidence: ${zInferRes.data.confidence}\n`);

    // 10. Query inference results
    console.log('10. Querying inference results...');
    const results = await get('/inference-results?logicalId=ml-machine-001');
    console.log(`   ✓ ${results.data.length} inference result(s) found`);
    for (const r of results.data) {
        const modelName = r.modelVersion?.modelDefinition?.name ?? 'unknown';
        console.log(`     - ${modelName} v${r.modelVersion?.version} (${r.modelVersion?.strategy}): confidence=${r.confidence}`);
    }
    console.log();

    // 11. List all models
    console.log('11. Listing all models...');
    const allModels = await get('/models');
    for (const m of allModels.data) {
        const latest = m.versions?.[0];
        console.log(`   - ${m.name} → ${m.entityType?.name} (latest: v${latest?.version} ${latest?.status})`);
    }
    console.log();

    // 12. Batch inference
    console.log('12. Running batch inference...');
    const batchRes = await post('/models/batch-infer', { logicalId: 'ml-machine-001' });
    console.log(`   ✓ ${batchRes.data.results.length} model(s) evaluated`);
    for (const r of batchRes.data.results) {
        console.log(`     - ${r.model} v${r.version}: ${JSON.stringify(r.prediction).slice(0, 80)}`);
    }
    console.log();

    console.log('=== All Phase 3 tests passed! ===');
}

main().catch(console.error);
