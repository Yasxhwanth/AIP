-- Stage 3: Harden RLS with FORCE ROW LEVEL SECURITY
-- This ensures that even the Prisma service role (which is the table owner)
-- cannot bypass RLS policies. Without FORCE, table owners bypass RLS by default
-- in PostgreSQL.
--
-- ⚠  Run this ONCE after `20260315_enable_rls.sql` has been applied.
-- ⚠  Only run this if the Prisma app user (aip_user) is the table owner.
--    If using a separate superuser, do NOT run this or Prisma migrations will fail.

DO $$
DECLARE
    t text;
    tables_to_force text[] := ARRAY[
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
    FOREACH t IN ARRAY tables_to_force
    LOOP
        -- FORCE RLS applies the policy even to the table owner (i.e., the app user)
        EXECUTE format('ALTER TABLE "%s" FORCE ROW LEVEL SECURITY', t);
    END LOOP;
END $$;

-- Create a dedicated read-only role for analytics / reporting that bypasses RLS
-- (it is the caller's responsibility to apply their own WHERE projectId = X filters)
-- DO NOT grant this to the application service account.
-- CREATE ROLE aip_analytics BYPASSRLS;
