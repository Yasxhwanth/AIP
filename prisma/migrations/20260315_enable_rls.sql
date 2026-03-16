-- Enable RLS for all multi-tenant tables
-- This policy ensures that a session can only access rows where projectId matches the session-level 'aip.tenant_id' GUC.

DO $$
DECLARE
    t text;
    tables_to_secure text[] := ARRAY[
        'EntityType', 'AttributeDefinition', 'RelationshipDefinition', 'RelationshipInstance',
        'EntityInstance', 'EntityAlias', 'MatchCandidate', 'MatchResolutionHistory',
        'AuditLog', 'ProvenanceRecord', 'LineageEdge', 'DomainEvent', 'OutboxEvent',
        'PolicyDefinition', 'AbacPolicy', 'ChangeRequest', 'Alert', 'CurrentEntityState',
        'CurrentGraph', 'TimeseriesMetric', 'DataSource', 'RejectedRecord', 'Pipeline',
        'PipelineRun', 'IntegrationJob', 'JobQueue', 'ComputedMetricDefinition',
        'TelemetryRollup', 'ModelDefinition', 'InferenceResult', 'DecisionRule',
        'DecisionLog', 'ExecutionTrace', 'ExecutionStep', 'ApiKey', 'Dashboard',
        'DashboardWidget', 'ProjectRelease', 'OntologyRule', 'AIPAgent', 'AIPFunction',
        'AIPAction', 'AIPActionExecution', 'AIPMetric', 'WorkshopApp', 'AIPAutomate',
        'AIPAutomateRun', 'AIWorkflow', 'AIWorkflowRun', 'AIPEval', 'AIPEvalRun',
        'FunctionVersion', 'SparkJob', 'SparkJobRun', 'SparkJobStage',
        'CryptoProvenanceChain', 'CryptoProvenanceSeal'
    ];
BEGIN
    FOREACH t IN ARRAY tables_to_secure
    LOOP
        EXECUTE format('ALTER TABLE "%s" ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('DROP POLICY IF EXISTS tenant_isolation_policy ON "%s"', t);
        EXECUTE format('CREATE POLICY tenant_isolation_policy ON "%s" USING ("projectId"::text = current_setting(''aip.tenant_id'', true))', t);
    END LOOP;
END $$;
