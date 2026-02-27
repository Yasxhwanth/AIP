"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaInferenceService = void 0;
/**
 * SchemaInferenceService analyzes external JSON samples and suggests
 * mappings to the C3 AIP core ontology.
 */
class SchemaInferenceService {
    /**
     * Infers ontology attributes from a sample JSON record.
     */
    static inferAttributes(sample) {
        return Object.entries(sample).map(([key, value]) => {
            let dataType = 'STRING';
            if (typeof value === 'number')
                dataType = 'DOUBLE';
            else if (typeof value === 'boolean')
                dataType = 'BOOLEAN';
            else if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value))))
                dataType = 'DATETIME';
            // Clean the key name for ontology suitability (e.g. 'icao_24' -> 'icao24')
            const sanitizedName = key.replace(/[^a-zA-Z0-9]/g, '');
            return {
                name: sanitizedName || key,
                dataType,
                required: true
            };
        });
    }
    /**
     * Suggests mappings between an inferred schema and an existing EntityType.
     */
    static suggestMappings(inferred, existingAttributes) {
        const mapping = {};
        for (const inf of inferred) {
            // Basic exact match for now
            const match = existingAttributes.find(attr => attr.name.toLowerCase() === inf.name.toLowerCase());
            if (match) {
                mapping[inf.name] = match.name;
            }
        }
        return mapping;
    }
}
exports.SchemaInferenceService = SchemaInferenceService;
//# sourceMappingURL=schema-inference-service.js.map