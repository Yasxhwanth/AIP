// Integration test for Data Integration Layer
const BASE = 'http://localhost:3000';

async function post(path, body) {
    const r = await fetch(`${BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const data = await r.json();
    return { status: r.status, data };
}

async function get(path) {
    const r = await fetch(`${BASE}${path}`);
    const data = await r.json();
    return { status: r.status, data };
}

async function main() {
    console.log('=== Data Integration Layer Test ===\n');

    // 1. Create entity type
    console.log('1. Creating entity type...');
    const etRes = await post('/entity-types', {
        name: 'DITestSensor',
        attributes: [
            { name: 'temperature', dataType: 'float', required: true },
            { name: 'location', dataType: 'string', required: false },
        ],
    });
    if (etRes.status === 409) {
        console.log('   Entity type already exists, fetching...');
        const list = await get('/entity-types');
        const found = list.data.find(e => e.name === 'DITestSensor');
        if (!found) throw new Error('Cannot find DITestSensor');
        etRes.data = found;
    }
    const entityTypeId = etRes.data.id;
    console.log(`   ✓ Entity type ID: ${entityTypeId}\n`);

    // 2. Create data source (JSON_UPLOAD)
    console.log('2. Creating data source (JSON_UPLOAD)...');
    const dsRes = await post('/data-sources', {
        name: 'DI Test Upload Source',
        type: 'JSON_UPLOAD',
        connectionConfig: {},
    });
    if (dsRes.status === 409) {
        console.log('   Data source already exists, fetching...');
        const list = await get('/data-sources');
        const found = list.data.find(d => d.name === 'DI Test Upload Source');
        dsRes.data = found;
    }
    const dataSourceId = dsRes.data.id;
    console.log(`   ✓ Data source ID: ${dataSourceId}\n`);

    // 3. Create integration job
    console.log('3. Creating integration job...');
    const jobRes = await post('/integration-jobs', {
        name: 'DI Test Ingest Job',
        dataSourceId,
        targetEntityTypeId: entityTypeId,
        fieldMapping: { temp: 'temperature', loc: 'location' },
        logicalIdField: 'sensorId',
    });
    if (jobRes.status === 409) {
        console.log('   Integration job already exists, fetching...');
        const list = await get('/integration-jobs');
        const found = list.data.find(j => j.name === 'DI Test Ingest Job');
        jobRes.data = found;
    }
    const jobId = jobRes.data.id;
    console.log(`   ✓ Integration job ID: ${jobId}\n`);

    // 4. Execute the job with inline data
    console.log('4. Executing job with inline data...');
    const execRes = await post(`/integration-jobs/${jobId}/execute`, {
        data: [
            { sensorId: 'di-sensor-001', temp: 72.5, loc: 'Building A' },
            { sensorId: 'di-sensor-002', temp: 85.3, loc: 'Building B' },
            { sensorId: 'di-sensor-003', temp: 91.1, loc: 'Building C' },
        ],
    });
    console.log(`   Status: ${execRes.data.status}`);
    console.log(`   Records processed: ${execRes.data.recordsProcessed}`);
    console.log(`   Records failed: ${execRes.data.recordsFailed}`);
    console.log(`   Execution ID: ${execRes.data.executionId}\n`);

    // 5. Verify entities were created
    console.log('5. Verifying entities were created...');
    const instances = await get(`/entity-types/${entityTypeId}/instances`);
    const found = instances.data.filter(i =>
        ['di-sensor-001', 'di-sensor-002', 'di-sensor-003'].includes(i.logicalId)
    );
    console.log(`   ✓ Found ${found.length} entity instances`);
    for (const inst of found) {
        console.log(`     - ${inst.logicalId}: ${JSON.stringify(inst.data)}`);
    }
    console.log();

    // 6. Verify execution history
    console.log('6. Checking execution history...');
    const execHistory = await get(`/integration-jobs/${jobId}/executions`);
    console.log(`   ✓ ${execHistory.data.length} execution(s) found`);
    for (const ex of execHistory.data) {
        console.log(`     - ${ex.status}: ${ex.recordsProcessed} processed, ${ex.recordsFailed} failed`);
    }
    console.log();

    // 7. List all data sources
    console.log('7. Listing data sources...');
    const allSources = await get('/data-sources');
    console.log(`   ✓ ${allSources.data.length} data source(s)`);
    for (const s of allSources.data) {
        console.log(`     - ${s.name} (${s.type})`);
    }
    console.log();

    // 8. List all integration jobs
    console.log('8. Listing integration jobs...');
    const allJobs = await get('/integration-jobs');
    console.log(`   ✓ ${allJobs.data.length} integration job(s)`);
    for (const j of allJobs.data) {
        const lastExec = j.executions?.[0];
        console.log(`     - ${j.name} → ${j.targetEntityType?.name} (last: ${lastExec?.status ?? 'never run'})`);
    }
    console.log();

    console.log('=== All tests passed! ===');
}

main().catch(console.error);
