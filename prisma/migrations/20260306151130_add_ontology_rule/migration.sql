/*
  Warnings:

  - You are about to drop the column `executionResults` on the `DecisionLog` table. All the data in the column will be lost.
  - You are about to drop the `JobExecution` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[projectId,name,version]` on the table `EntityType` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `projectId` to the `DataSource` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectId` to the `DecisionRule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectId` to the `EntityType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectId` to the `IntegrationJob` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectId` to the `ModelDefinition` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "JobExecution" DROP CONSTRAINT "JobExecution_integrationJobId_fkey";

-- DropIndex
DROP INDEX "EntityType_name_version_key";

-- AlterTable
ALTER TABLE "ApiKey" ADD COLUMN     "projectId" TEXT;

-- AlterTable
ALTER TABLE "CurrentEntityState" ADD COLUMN     "legalHold" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "CurrentGraph" ADD COLUMN     "baseConfidence" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
ADD COLUMN     "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
ADD COLUMN     "decayRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "lastObservedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "DataSource" ADD COLUMN     "projectId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DecisionLog" DROP COLUMN "executionResults";

-- AlterTable
ALTER TABLE "DecisionRule" ADD COLUMN     "projectId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "EntityInstance" ADD COLUMN     "confidenceScore" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
ADD COLUMN     "reviewStatus" TEXT NOT NULL DEFAULT 'APPROVED';

-- AlterTable
ALTER TABLE "EntityType" ADD COLUMN     "projectId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "IntegrationJob" ADD COLUMN     "projectId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ModelDefinition" ADD COLUMN     "projectId" TEXT NOT NULL;

-- DropTable
DROP TABLE "JobExecution";

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntityAlias" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "sourceSystem" TEXT NOT NULL,
    "targetLogicalId" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntityAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchCandidate" (
    "id" TEXT NOT NULL,
    "logicalIdA" TEXT NOT NULL,
    "logicalIdB" TEXT NOT NULL,
    "entityTypeId" TEXT NOT NULL,
    "scoreOverall" DOUBLE PRECISION NOT NULL,
    "scoreBreakdown" JSONB NOT NULL,
    "matchReasons" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "mergedIntoId" TEXT,
    "sourceJobId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchResolutionHistory" (
    "id" TEXT NOT NULL,
    "matchCandidateId" TEXT NOT NULL,
    "logicalIdA" TEXT NOT NULL,
    "logicalIdB" TEXT NOT NULL,
    "entityTypeId" TEXT NOT NULL,
    "scoreOverall" DOUBLE PRECISION NOT NULL,
    "scoreBreakdown" JSONB NOT NULL,
    "matchReasons" JSONB NOT NULL,
    "resolution" TEXT NOT NULL,
    "resolvedBy" TEXT NOT NULL,
    "resolvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchResolutionHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "before" JSONB,
    "after" JSONB,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProvenanceRecord" (
    "id" TEXT NOT NULL,
    "entityInstanceId" TEXT NOT NULL,
    "attributeName" TEXT,
    "sourceSystem" TEXT NOT NULL,
    "sourceRecordId" TEXT NOT NULL,
    "sourceTimestamp" TIMESTAMP(3) NOT NULL,
    "ingestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProvenanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineageEdge" (
    "id" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "transformation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LineageEdge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AbacPolicy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "effect" TEXT NOT NULL DEFAULT 'ALLOW',
    "condition" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AbacPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pipeline" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "nodes" JSONB NOT NULL,
    "edges" JSONB NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "Pipeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobWorker" (
    "id" TEXT NOT NULL,
    "hostname" TEXT NOT NULL,
    "pid" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastHeartbeat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobWorker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobQueue" (
    "id" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "payload" JSONB NOT NULL,
    "idempotencyKey" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "lockedAt" TIMESTAMP(3),
    "lockedByWorkerId" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "nextAttemptAt" TIMESTAMP(3),
    "lastError" TEXT,
    "recordsProcessed" INTEGER NOT NULL DEFAULT 0,
    "recordsFailed" INTEGER NOT NULL DEFAULT 0,
    "integrationJobId" TEXT,
    "parentJobId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelDriftMetric" (
    "id" TEXT NOT NULL,
    "modelVersionId" TEXT NOT NULL,
    "featureName" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "referenceStart" TIMESTAMP(3) NOT NULL,
    "referenceEnd" TIMESTAMP(3) NOT NULL,
    "currentStart" TIMESTAMP(3) NOT NULL,
    "currentEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModelDriftMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelLatencyMetric" (
    "id" TEXT NOT NULL,
    "modelVersionId" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "windowSize" TEXT NOT NULL,
    "p50" DOUBLE PRECISION NOT NULL,
    "p90" DOUBLE PRECISION NOT NULL,
    "p95" DOUBLE PRECISION NOT NULL,
    "p99" DOUBLE PRECISION NOT NULL,
    "avg" DOUBLE PRECISION NOT NULL,
    "requestCount" INTEGER NOT NULL,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModelLatencyMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutionTrace" (
    "id" TEXT NOT NULL,
    "decisionLogId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "error" TEXT,

    CONSTRAINT "ExecutionTrace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutionStep" (
    "id" TEXT NOT NULL,
    "executionTraceId" TEXT NOT NULL,
    "actionDefinitionId" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "inputPayload" JSONB,
    "outputPayload" JSONB,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ExecutionStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dashboard" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dashboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardWidget" (
    "id" TEXT NOT NULL,
    "dashboardId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "configData" JSONB NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "w" INTEGER NOT NULL,
    "h" INTEGER NOT NULL,

    CONSTRAINT "DashboardWidget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectRelease" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectRelease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OntologyRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "antecedent" JSONB NOT NULL,
    "consequent" JSONB NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "OntologyRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EntityAlias_targetLogicalId_idx" ON "EntityAlias"("targetLogicalId");

-- CreateIndex
CREATE UNIQUE INDEX "EntityAlias_sourceSystem_externalId_key" ON "EntityAlias"("sourceSystem", "externalId");

-- CreateIndex
CREATE INDEX "MatchCandidate_entityTypeId_status_idx" ON "MatchCandidate"("entityTypeId", "status");

-- CreateIndex
CREATE INDEX "MatchCandidate_logicalIdA_idx" ON "MatchCandidate"("logicalIdA");

-- CreateIndex
CREATE INDEX "MatchCandidate_logicalIdB_idx" ON "MatchCandidate"("logicalIdB");

-- CreateIndex
CREATE UNIQUE INDEX "MatchCandidate_logicalIdA_logicalIdB_entityTypeId_key" ON "MatchCandidate"("logicalIdA", "logicalIdB", "entityTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "MatchResolutionHistory_matchCandidateId_key" ON "MatchResolutionHistory"("matchCandidateId");

-- CreateIndex
CREATE INDEX "MatchResolutionHistory_entityTypeId_resolution_idx" ON "MatchResolutionHistory"("entityTypeId", "resolution");

-- CreateIndex
CREATE INDEX "MatchResolutionHistory_resolvedAt_idx" ON "MatchResolutionHistory"("resolvedAt");

-- CreateIndex
CREATE INDEX "AuditLog_actor_occurredAt_idx" ON "AuditLog"("actor", "occurredAt" DESC);

-- CreateIndex
CREATE INDEX "AuditLog_resourceType_resourceId_occurredAt_idx" ON "AuditLog"("resourceType", "resourceId", "occurredAt" DESC);

-- CreateIndex
CREATE INDEX "AuditLog_action_occurredAt_idx" ON "AuditLog"("action", "occurredAt" DESC);

-- CreateIndex
CREATE INDEX "ProvenanceRecord_entityInstanceId_attributeName_idx" ON "ProvenanceRecord"("entityInstanceId", "attributeName");

-- CreateIndex
CREATE INDEX "LineageEdge_sourceType_sourceId_idx" ON "LineageEdge"("sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "LineageEdge_targetType_targetId_idx" ON "LineageEdge"("targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "LineageEdge_sourceType_sourceId_targetType_targetId_key" ON "LineageEdge"("sourceType", "sourceId", "targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "AbacPolicy_name_key" ON "AbacPolicy"("name");

-- CreateIndex
CREATE INDEX "AbacPolicy_action_resourceType_idx" ON "AbacPolicy"("action", "resourceType");

-- CreateIndex
CREATE INDEX "Pipeline_projectId_idx" ON "Pipeline"("projectId");

-- CreateIndex
CREATE INDEX "JobWorker_status_lastHeartbeat_idx" ON "JobWorker"("status", "lastHeartbeat" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "JobQueue_idempotencyKey_key" ON "JobQueue"("idempotencyKey");

-- CreateIndex
CREATE INDEX "JobQueue_status_nextAttemptAt_idx" ON "JobQueue"("status", "nextAttemptAt");

-- CreateIndex
CREATE INDEX "JobQueue_jobType_status_idx" ON "JobQueue"("jobType", "status");

-- CreateIndex
CREATE INDEX "JobQueue_integrationJobId_startedAt_idx" ON "JobQueue"("integrationJobId", "startedAt" DESC);

-- CreateIndex
CREATE INDEX "ModelDriftMetric_modelVersionId_featureName_createdAt_idx" ON "ModelDriftMetric"("modelVersionId", "featureName", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ModelLatencyMetric_modelVersionId_windowStart_idx" ON "ModelLatencyMetric"("modelVersionId", "windowStart" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionTrace_decisionLogId_key" ON "ExecutionTrace"("decisionLogId");

-- CreateIndex
CREATE INDEX "ExecutionTrace_status_startedAt_idx" ON "ExecutionTrace"("status", "startedAt" DESC);

-- CreateIndex
CREATE INDEX "ExecutionStep_executionTraceId_status_idx" ON "ExecutionStep"("executionTraceId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionStep_executionTraceId_stepOrder_key" ON "ExecutionStep"("executionTraceId", "stepOrder");

-- CreateIndex
CREATE INDEX "Dashboard_projectId_idx" ON "Dashboard"("projectId");

-- CreateIndex
CREATE INDEX "DashboardWidget_dashboardId_idx" ON "DashboardWidget"("dashboardId");

-- CreateIndex
CREATE INDEX "OntologyRule_projectId_enabled_idx" ON "OntologyRule"("projectId", "enabled");

-- CreateIndex
CREATE UNIQUE INDEX "OntologyRule_projectId_name_key" ON "OntologyRule"("projectId", "name");

-- CreateIndex
CREATE INDEX "ApiKey_projectId_idx" ON "ApiKey"("projectId");

-- CreateIndex
CREATE INDEX "DataSource_projectId_idx" ON "DataSource"("projectId");

-- CreateIndex
CREATE INDEX "DecisionRule_projectId_idx" ON "DecisionRule"("projectId");

-- CreateIndex
CREATE INDEX "EntityType_projectId_idx" ON "EntityType"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "EntityType_projectId_name_version_key" ON "EntityType"("projectId", "name", "version");

-- CreateIndex
CREATE INDEX "IntegrationJob_projectId_idx" ON "IntegrationJob"("projectId");

-- CreateIndex
CREATE INDEX "ModelDefinition_projectId_idx" ON "ModelDefinition"("projectId");

-- AddForeignKey
ALTER TABLE "EntityType" ADD CONSTRAINT "EntityType_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProvenanceRecord" ADD CONSTRAINT "ProvenanceRecord_entityInstanceId_fkey" FOREIGN KEY ("entityInstanceId") REFERENCES "EntityInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrentEntityState" ADD CONSTRAINT "CurrentEntityState_entityTypeId_fkey" FOREIGN KEY ("entityTypeId") REFERENCES "EntityType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataSource" ADD CONSTRAINT "DataSource_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pipeline" ADD CONSTRAINT "Pipeline_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationJob" ADD CONSTRAINT "IntegrationJob_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobQueue" ADD CONSTRAINT "JobQueue_integrationJobId_fkey" FOREIGN KEY ("integrationJobId") REFERENCES "IntegrationJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobQueue" ADD CONSTRAINT "JobQueue_parentJobId_fkey" FOREIGN KEY ("parentJobId") REFERENCES "JobQueue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelDefinition" ADD CONSTRAINT "ModelDefinition_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelDriftMetric" ADD CONSTRAINT "ModelDriftMetric_modelVersionId_fkey" FOREIGN KEY ("modelVersionId") REFERENCES "ModelVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelLatencyMetric" ADD CONSTRAINT "ModelLatencyMetric_modelVersionId_fkey" FOREIGN KEY ("modelVersionId") REFERENCES "ModelVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionRule" ADD CONSTRAINT "DecisionRule_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionTrace" ADD CONSTRAINT "ExecutionTrace_decisionLogId_fkey" FOREIGN KEY ("decisionLogId") REFERENCES "DecisionLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionStep" ADD CONSTRAINT "ExecutionStep_executionTraceId_fkey" FOREIGN KEY ("executionTraceId") REFERENCES "ExecutionTrace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionStep" ADD CONSTRAINT "ExecutionStep_actionDefinitionId_fkey" FOREIGN KEY ("actionDefinitionId") REFERENCES "ActionDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dashboard" ADD CONSTRAINT "Dashboard_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardWidget" ADD CONSTRAINT "DashboardWidget_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "Dashboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectRelease" ADD CONSTRAINT "ProjectRelease_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OntologyRule" ADD CONSTRAINT "OntologyRule_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
