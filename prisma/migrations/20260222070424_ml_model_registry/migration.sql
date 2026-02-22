-- CreateTable
CREATE TABLE "ModelDefinition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "entityTypeId" TEXT NOT NULL,
    "description" TEXT,
    "inputFields" JSONB NOT NULL,
    "outputField" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModelDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelVersion" (
    "id" TEXT NOT NULL,
    "modelDefinitionId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "strategy" TEXT NOT NULL,
    "hyperparameters" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModelVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InferenceResult" (
    "id" TEXT NOT NULL,
    "modelVersionId" TEXT NOT NULL,
    "logicalId" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "output" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InferenceResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ModelDefinition_name_key" ON "ModelDefinition"("name");

-- CreateIndex
CREATE INDEX "ModelDefinition_entityTypeId_idx" ON "ModelDefinition"("entityTypeId");

-- CreateIndex
CREATE INDEX "ModelVersion_modelDefinitionId_status_idx" ON "ModelVersion"("modelDefinitionId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ModelVersion_modelDefinitionId_version_key" ON "ModelVersion"("modelDefinitionId", "version");

-- CreateIndex
CREATE INDEX "InferenceResult_modelVersionId_createdAt_idx" ON "InferenceResult"("modelVersionId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "InferenceResult_logicalId_createdAt_idx" ON "InferenceResult"("logicalId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "ModelDefinition" ADD CONSTRAINT "ModelDefinition_entityTypeId_fkey" FOREIGN KEY ("entityTypeId") REFERENCES "EntityType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelVersion" ADD CONSTRAINT "ModelVersion_modelDefinitionId_fkey" FOREIGN KEY ("modelDefinitionId") REFERENCES "ModelDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InferenceResult" ADD CONSTRAINT "InferenceResult_modelVersionId_fkey" FOREIGN KEY ("modelVersionId") REFERENCES "ModelVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
