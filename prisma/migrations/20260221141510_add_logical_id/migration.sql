-- CreateTable
CREATE TABLE "EntityType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntityType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttributeDefinition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL,
    "temporal" BOOLEAN NOT NULL DEFAULT false,
    "entityTypeId" TEXT NOT NULL,

    CONSTRAINT "AttributeDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RelationshipDefinition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceEntityTypeId" TEXT NOT NULL,
    "targetEntityTypeId" TEXT NOT NULL,

    CONSTRAINT "RelationshipDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntityInstance" (
    "id" TEXT NOT NULL,
    "logicalId" TEXT NOT NULL,
    "entityTypeId" TEXT NOT NULL,
    "entityVersion" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3),
    "transactionTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntityInstance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EntityType_name_version_key" ON "EntityType"("name", "version");

-- CreateIndex
CREATE INDEX "RelationshipDefinition_sourceEntityTypeId_idx" ON "RelationshipDefinition"("sourceEntityTypeId");

-- CreateIndex
CREATE INDEX "RelationshipDefinition_targetEntityTypeId_idx" ON "RelationshipDefinition"("targetEntityTypeId");

-- CreateIndex
CREATE INDEX "EntityInstance_entityTypeId_logicalId_idx" ON "EntityInstance"("entityTypeId", "logicalId");

-- CreateIndex
CREATE INDEX "EntityInstance_validFrom_validTo_transactionTime_idx" ON "EntityInstance"("validFrom", "validTo", "transactionTime");

-- AddForeignKey
ALTER TABLE "AttributeDefinition" ADD CONSTRAINT "AttributeDefinition_entityTypeId_fkey" FOREIGN KEY ("entityTypeId") REFERENCES "EntityType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelationshipDefinition" ADD CONSTRAINT "RelationshipDefinition_sourceEntityTypeId_fkey" FOREIGN KEY ("sourceEntityTypeId") REFERENCES "EntityType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelationshipDefinition" ADD CONSTRAINT "RelationshipDefinition_targetEntityTypeId_fkey" FOREIGN KEY ("targetEntityTypeId") REFERENCES "EntityType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityInstance" ADD CONSTRAINT "EntityInstance_entityTypeId_fkey" FOREIGN KEY ("entityTypeId") REFERENCES "EntityType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
