-- AIP Stage 3: Manual Schema Expansion
-- This script adds the Project table and projectId columns to core tables.

-- 1. Create Project table first
CREATE TABLE IF NOT EXISTS "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- 2. Add projectId columns to core tables
DO $$
DECLARE
    t text;
    tables_to_update text[] := ARRAY[
        'EntityType',
        'AttributeDefinition',
        'RelationshipDefinition',
        'RelationshipInstance',
        'EntityInstance',
        'DomainEvent',
        'AuditLog',
        'CurrentEntityState',
        'DataSource',
        'RejectedRecord',
        'Pipeline',
        'PipelineRun',
        'IntegrationJob',
        'JobQueue',
        'ChangeRequest',
        'OutboxEvent',
        'Dashboard',
        'DashboardWidget',
        'AbacPolicy',
        'Alert',
        'PolicyDefinition',
        'ModelDefinition',
        'DecisionRule',
        'ApiKey',
        'OntologyRule',
        'AIPAgent',
        'AIPFunction',
        'AIPAction',
        'AIPMetric',
        'WorkshopApp',
        'AIPAutomate',
        'AIWorkflow',
        'AIPEval',
        'SparkJob'
    ];
BEGIN
    FOREACH t IN ARRAY tables_to_update
    LOOP
        -- Add the column if it doesn't exist
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS "projectId" TEXT', t);
        
        -- Add the foreign key constraint
        -- We ignore errors here in case it already exists or if the table doesn't have it yet
        BEGIN
            EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I_projectId_fkey FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE', t, t);
        EXCEPTION WHEN others THEN
            RAISE NOTICE 'Constraint already exists or failed for table: %', t;
        END;
        
        RAISE NOTICE 'projectId Column added/verified for table: %', t;
    END LOOP;
END $$;

-- 3. Fix EntityType unique constraint (projectId + name + version + branchName)
-- Drop old unique if it exists and create new one
ALTER TABLE "EntityType" DROP CONSTRAINT IF EXISTS "EntityType_name_version_branchName_key";
ALTER TABLE "EntityType" ADD CONSTRAINT "EntityType_projectId_name_version_branchName_key" UNIQUE ("projectId", "name", "version", "branchName");
