import { PrismaClient } from './generated/prisma/client';

/**
 * ProvenanceService handles the recording of lineage for every attribute in the ontology.
 * This ensures we can trace every data point back to its source system and record ID.
 */
export class ProvenanceService {
    /**
     * Records provenance for a single entity instance or its fields.
     */
    static async recordLineage(
        entityInstanceId: string,
        sourceSystem: string,
        sourceRecordId: string,
        sourceTimestamp: Date,
        attributeNames: string[] | null,
        prisma: any // Use any to allow both PrismaClient and transaction (tx)
    ) {
        if (!attributeNames) {
            // Record-level provenance (the entire record came from this source)
            return prisma.provenanceRecord.create({
                data: {
                    entityInstanceId,
                    sourceSystem,
                    sourceRecordId,
                    sourceTimestamp,
                    attributeName: null
                }
            });
        }

        // Field-level provenance
        const records = attributeNames.map(attr => ({
            entityInstanceId,
            sourceSystem,
            sourceRecordId,
            sourceTimestamp,
            attributeName: attr
        }));

        return prisma.provenanceRecord.createMany({
            data: records
        });
    }
}
