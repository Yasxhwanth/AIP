"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProvenanceService = void 0;
/**
 * ProvenanceService handles the recording of lineage for every attribute in the ontology.
 * This ensures we can trace every data point back to its source system and record ID.
 */
class ProvenanceService {
    /**
     * Records provenance for a single entity instance or its fields.
     */
    static async recordLineage(entityInstanceId, sourceSystem, sourceRecordId, sourceTimestamp, attributeNames, prisma // Use any to allow both PrismaClient and transaction (tx)
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
exports.ProvenanceService = ProvenanceService;
//# sourceMappingURL=provenance-service.js.map