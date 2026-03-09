"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaInferenceService = void 0;
/**
 * SchemaInferenceService analyzes external JSON samples and suggests
 * mappings to the C3 AIP core ontology.
 */
var SchemaInferenceService = /** @class */ (function () {
    function SchemaInferenceService() {
    }
    /**
     * Infers ontology attributes from a sample JSON record.
     */
    SchemaInferenceService.inferAttributes = function (sample) {
        return Object.entries(sample).map(function (_a) {
            var key = _a[0], value = _a[1];
            var dataType = 'STRING';
            if (typeof value === 'number')
                dataType = 'DOUBLE';
            else if (typeof value === 'boolean')
                dataType = 'BOOLEAN';
            else if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value))))
                dataType = 'DATETIME';
            // Clean the key name for ontology suitability (e.g. 'icao_24' -> 'icao24')
            var sanitizedName = key.replace(/[^a-zA-Z0-9]/g, '');
            return {
                name: sanitizedName || key,
                dataType: dataType,
                required: true
            };
        });
    };
    /**
     * Suggests mappings between an inferred schema and an existing EntityType.
     */
    SchemaInferenceService.suggestMappings = function (inferred, existingAttributes) {
        var mapping = {};
        var _loop_1 = function (inf) {
            // Basic exact match for now
            var match = existingAttributes.find(function (attr) { return attr.name.toLowerCase() === inf.name.toLowerCase(); });
            if (match) {
                mapping[inf.name] = match.name;
            }
        };
        for (var _i = 0, inferred_1 = inferred; _i < inferred_1.length; _i++) {
            var inf = inferred_1[_i];
            _loop_1(inf);
        }
        return mapping;
    };
    return SchemaInferenceService;
}());
exports.SchemaInferenceService = SchemaInferenceService;
