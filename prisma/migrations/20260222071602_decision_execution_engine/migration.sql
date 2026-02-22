-- CreateTable
CREATE TABLE "DecisionRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "entityTypeId" TEXT NOT NULL,
    "conditions" JSONB NOT NULL,
    "logicOperator" TEXT NOT NULL DEFAULT 'AND',
    "priority" INTEGER NOT NULL DEFAULT 100,
    "autoExecute" BOOLEAN NOT NULL DEFAULT false,
    "confidenceThreshold" DOUBLE PRECISION,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DecisionRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionDefinition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActionDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutionPlan" (
    "id" TEXT NOT NULL,
    "decisionRuleId" TEXT NOT NULL,
    "actionDefinitionId" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "continueOnFailure" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ExecutionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DecisionLog" (
    "id" TEXT NOT NULL,
    "decisionRuleId" TEXT NOT NULL,
    "logicalId" TEXT NOT NULL,
    "triggerType" TEXT NOT NULL,
    "triggerData" JSONB NOT NULL,
    "conditionResults" JSONB NOT NULL,
    "decision" TEXT NOT NULL,
    "executionResults" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DecisionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DecisionRule_name_key" ON "DecisionRule"("name");

-- CreateIndex
CREATE INDEX "DecisionRule_entityTypeId_enabled_idx" ON "DecisionRule"("entityTypeId", "enabled");

-- CreateIndex
CREATE UNIQUE INDEX "ActionDefinition_name_key" ON "ActionDefinition"("name");

-- CreateIndex
CREATE INDEX "ExecutionPlan_decisionRuleId_stepOrder_idx" ON "ExecutionPlan"("decisionRuleId", "stepOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionPlan_decisionRuleId_stepOrder_key" ON "ExecutionPlan"("decisionRuleId", "stepOrder");

-- CreateIndex
CREATE INDEX "DecisionLog_decisionRuleId_createdAt_idx" ON "DecisionLog"("decisionRuleId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "DecisionLog_logicalId_createdAt_idx" ON "DecisionLog"("logicalId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "DecisionRule" ADD CONSTRAINT "DecisionRule_entityTypeId_fkey" FOREIGN KEY ("entityTypeId") REFERENCES "EntityType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionPlan" ADD CONSTRAINT "ExecutionPlan_decisionRuleId_fkey" FOREIGN KEY ("decisionRuleId") REFERENCES "DecisionRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionPlan" ADD CONSTRAINT "ExecutionPlan_actionDefinitionId_fkey" FOREIGN KEY ("actionDefinitionId") REFERENCES "ActionDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionLog" ADD CONSTRAINT "DecisionLog_decisionRuleId_fkey" FOREIGN KEY ("decisionRuleId") REFERENCES "DecisionRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
