/**
 * SchemaInferenceService analyzes external JSON samples and suggests
 * mappings to the C3 AIP core ontology.
 */
export declare class SchemaInferenceService {
    /**
     * Infers ontology attributes from a sample JSON record.
     */
    static inferAttributes(sample: Record<string, any>): Array<{
        name: string;
        dataType: string;
        required: boolean;
    }>;
    /**
     * Suggests mappings between an inferred schema and an existing EntityType.
     */
    static suggestMappings(inferred: Array<{
        name: string;
    }>, existingAttributes: Array<{
        name: string;
    }>): Record<string, string>;
}
//# sourceMappingURL=schema-inference-service.d.ts.map