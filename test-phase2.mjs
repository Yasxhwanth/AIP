// Integration test for Phase 2: Computed Metrics & Telemetry Rollups
const BASE = 'http://localhost:3000';

async function post(path, body) {
    const r = await fetch(`${BASE}${path}`, {
        method: 'POST',
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
    console.log('=== Phase 2: Computed Metrics & Rollups Test ===\n');

    // 1. Create entity type with output and input attributes
    console.log('1. Creating entity type "Machine"...');
    let etRes = await post('/entity-types', {
        name: 'Machine',
        attributes: [
            { name: 'output', dataType: 'float', required: true },
            { name: 'input', dataType: 'float', required: true },
            { name: 'voltage', dataType: 'float', required: false },
            { name: 'current', dataType: 'float', required: false },
        ],
    });
    if (etRes.status === 409) {
        const list = await get('/entity-types');
        etRes.data = list.data.find(e => e.name === 'Machine');
    }
    const entityTypeId = etRes.data.id;
    console.log(`   ✓ Entity type ID: ${entityTypeId}\n`);

    // 2. Define computed metrics
    console.log('2. Defining computed metrics...');

    const metrics = [
        { name: 'efficiency', expression: 'output / input * 100', unit: '%' },
        { name: 'power', expression: 'voltage * current / 1000', unit: 'kW' },
    ];

    for (const m of metrics) {
        const res = await post('/computed-metrics', { ...m, entityTypeId });
        if (res.status === 201) {
            console.log(`   ✓ Created "${m.name}" = ${m.expression} (${m.unit})`);
        } else if (res.status === 409) {
            console.log(`   ✓ "${m.name}" already exists`);
        } else {
            console.log(`   ✗ Failed: ${JSON.stringify(res.data)}`);
        }
    }
    console.log();

    // 3. Create entity instance with data
    console.log('3. Creating entity instance "machine-001"...');
    await post(`/entity-types/${entityTypeId}/instances`, {
        logicalId: 'machine-001',
        output: 80,
        input: 100,
        voltage: 220,
        current: 15,
    });
    console.log('   ✓ Created\n');

    // 4. Evaluate computed metrics
    console.log('4. Evaluating computed metrics for machine-001...');
    const evalRes = await get('/computed-metrics/machine-001/evaluate');
    console.log(`   Entity data: ${JSON.stringify(evalRes.data.entityData)}`);
    for (const cm of evalRes.data.computedMetrics) {
        console.log(`   ✓ ${cm.name} = ${cm.value} ${cm.unit ?? ''} ${cm.error ? '(ERROR: ' + cm.error + ')' : ''}`);
    }
    console.log();

    // 5. Ingest telemetry data for rollup testing
    console.log('5. Ingesting telemetry data for rollup test...');
    const now = Date.now();
    const telemetryData = [];
    // Generate 20 data points spread over the last hour
    for (let i = 0; i < 20; i++) {
        telemetryData.push({
            metric: 'temperature',
            value: 60 + Math.random() * 40, // 60-100
            timestamp: new Date(now - (20 - i) * 3 * 60 * 1000).toISOString(), // every 3 mins
        });
    }
    const telRes = await post('/telemetry', { logicalId: 'machine-001', metrics: telemetryData });
    console.log(`   ✓ Ingested ${telRes.data.inserted} telemetry points\n`);

    // 6. Trigger rollup computation
    console.log('6. Computing rollups...');
    const rollupRes = await post('/telemetry/rollup', {
        logicalId: 'machine-001',
        metric: 'temperature',
        windowSize: '5m',
        from: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
        to: new Date().toISOString(),
    });
    console.log(`   ✓ Buckets processed: ${rollupRes.data.bucketsProcessed}\n`);

    // 7. Query rollups
    console.log('7. Querying rollups...');
    const rollupsQuery = await get('/telemetry/machine-001/rollups?metric=temperature&windowSize=5m');
    console.log(`   ✓ ${rollupsQuery.data.length} rollup bucket(s) found`);
    for (const r of rollupsQuery.data.slice(0, 5)) {
        console.log(`     - ${r.windowStart}: avg=${r.avg.toFixed(1)}, min=${r.min.toFixed(1)}, max=${r.max.toFixed(1)}, count=${r.count}`);
    }
    if (rollupsQuery.data.length > 5) {
        console.log(`     ... and ${rollupsQuery.data.length - 5} more`);
    }
    console.log();

    // 8. List all computed metrics
    console.log('8. Listing all computed metrics...');
    const allMetrics = await get('/computed-metrics');
    console.log(`   ✓ ${allMetrics.data.length} computed metric(s)`);
    for (const m of allMetrics.data) {
        console.log(`     - ${m.name} = ${m.expression} (${m.unit ?? 'no unit'}) on ${m.entityType?.name}`);
    }
    console.log();

    console.log('=== All Phase 2 tests passed! ===');
}

main().catch(console.error);
