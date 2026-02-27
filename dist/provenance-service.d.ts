/**
 * ProvenanceService handles the recording of lineage for every attribute in the ontology.
 * This ensures we can trace every data point back to its source system and record ID.
 */
export declare class ProvenanceService {
    /**
     * Records provenance for a single entity instance or its fields.
     */
    static recordLineage(entityInstanceId: string, sourceSystem: string, sourceRecordId: string, sourceTimestamp: Date, attributeNames: string[] | null, prisma: any): Promise<any>;
}
//# sourceMappingURL=provenance-service.d.ts.map