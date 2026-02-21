-- DropIndex
DROP INDEX "idx_one_active_entity";

-- DropIndex
DROP INDEX "idx_one_active_relationship";

-- CreateTable
CREATE TABLE "TimeseriesMetric" (
    "id" TEXT NOT NULL,
    "logicalId" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimeseriesMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TimeseriesMetric_logicalId_metric_timestamp_idx" ON "TimeseriesMetric"("logicalId", "metric", "timestamp" DESC);

-- RenameIndex
ALTER INDEX "CurrentGraph_relationshipDefinitionId_sourceLogicalId_targetLog" RENAME TO "CurrentGraph_relationshipDefinitionId_sourceLogicalId_targe_key";
