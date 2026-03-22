$file = "c:\Users\YASHWANTH\Projects\AIP\src\server.ts"
$content = [System.IO.File]::ReadAllText($file)

# Track changes
$changed = $false

# --- Patch 1: Make semantic reasoner async ---
$old1 = "    const result = await runFullReasoner(projectId, prisma);" + [char]13 + [char]10 + "    return res.json({ success: true, ...result });"
$new1 = "    const job = await orchestrator.enqueue(" + [char]13 + [char]10 + "      'SEMANTIC_REASONING'," + [char]13 + [char]10 + "      { projectId }," + [char]13 + [char]10 + "      { projectId, idempotencyKey: ``semantic-reasoning:`${projectId}:`${Date.now()}`` }" + [char]13 + [char]10 + "    );" + [char]13 + [char]10 + "    return res.status(202).json({" + [char]13 + [char]10 + "      message: 'Semantic reasoning job enqueued. Monitor via SRE Jobs dashboard.'," + [char]13 + [char]10 + "      jobId: job.id," + [char]13 + [char]10 + "      status: job.status," + [char]13 + [char]10 + "    });"

if ($content.Contains($old1)) {
    $content = $content.Replace($old1, $new1)
    Write-Host "Patch 1 applied: semantic reasoner -> async"
    $changed = $true
}
else {
    Write-Host "Patch 1 SKIP: marker not found"
}

# --- Patch 2: Remove the old 'const now = new Date();' in bulk ingestion ---
$old2 = "    const items = req.body as Array<Record<string, unknown>>;" + [char]13 + [char]10 + "    const now = new Date();" + [char]13 + [char]10 + "    const metaFields"
$new2 = "    const items = req.body as Array<Record<string, unknown>>;" + [char]13 + [char]10 + "    const metaFields"

if ($content.Contains($old2)) {
    $content = $content.Replace($old2, $new2)
    Write-Host "Patch 2 applied: removed 'const now' from bulk"
    $changed = $true
}
else {
    Write-Host "Patch 2 SKIP: marker not found"
}

# --- Patch 3: Replace '// 1. Validation phase' label in bulk ---
$old3 = "    // 1. Validation phase" + [char]13 + [char]10 + "    for (const item of items) {"
$new3 = "    // 1. Validation phase (sync - keep fast feedback for callers)" + [char]13 + [char]10 + "    for (const item of items) {"

if ($content.Contains($old3)) {
    $content = $content.Replace($old3, $new3)
    Write-Host "Patch 3 applied: updated bulk validation comment"
    $changed = $true
}
else {
    Write-Host "Patch 3 SKIP: marker not found"
}

# --- Patch 4: Replace the synchronous execution phase with async enqueue ---
$old4 = "    // 2. Execution phase (in transaction)"
$endMarker = "    return res.status(201).json({ success: true, count: results.createdInstances.length });"

$startIdx = $content.IndexOf($old4)
$endIdx = $content.IndexOf($endMarker)

if ($startIdx -ge 0 -and $endIdx -ge 0) {
    $endOfBlock = $endIdx + $endMarker.Length
    $replacement = "    // 2. Enqueue background job - heavy lifting done in Orchestrator worker" + [char]13 + [char]10 +
    "    const bulkProjectId = req.auth?.projectId ?? req.header('X-Project-Id') ?? (global as any).DEFAULT_PROJECT_ID;" + [char]13 + [char]10 +
    "    const bulkJob = await orchestrator.enqueue(" + [char]13 + [char]10 +
    "      'BULK_INGESTION'," + [char]13 + [char]10 +
    "      { entityTypeId: entityType.id, projectId: bulkProjectId, actor: req.auth?.apiKeyName ?? 'api', items }," + [char]13 + [char]10 +
    "      { projectId: bulkProjectId, idempotencyKey: ``bulk-ingest:`${entityType.id}:`${Date.now()}``, priority: 8 }" + [char]13 + [char]10 +
    "    );" + [char]13 + [char]10 +
    "    return res.status(202).json({" + [char]13 + [char]10 +
    "      message: ``Bulk ingestion of `${items.length} records enqueued. Monitor via SRE Jobs dashboard.``," + [char]13 + [char]10 +
    "      jobId: bulkJob.id, status: bulkJob.status, recordCount: items.length," + [char]13 + [char]10 +
    "    });"
    
    $content = $content.Substring(0, $startIdx) + $replacement + $content.Substring($endOfBlock)
    Write-Host "Patch 4 applied: bulk sync execution -> async enqueue"
    $changed = $true
}
else {
    if ($startIdx -lt 0) { Write-Host "Patch 4 SKIP: start marker not found" }
    if ($endIdx -lt 0) { Write-Host "Patch 4 SKIP: end marker not found" }
}

if ($changed) {
    [System.IO.File]::WriteAllText($file, $content, [System.Text.Encoding]::UTF8)
    Write-Host "File saved."
}
else {
    Write-Host "No changes made."
}
