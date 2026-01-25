/**
 * =============================================================================
 * JSON VALIDATOR
 * Phase 1B - Ontology Structural Validation
 * =============================================================================
 */

import type { AttributeDefinition, JsonValidationRules } from '../../types.js';
import {
    AttributeValidationErrorCode,
    type ValidationContext,
    type ValidationResult,
    validResult,
    invalidResult,
} from '../validation-types.js';

/**
 * Type guard for JSON validation rules.
 */
function isJsonValidationRules(
    rules: unknown
): rules is JsonValidationRules {
    if (!rules || typeof rules !== 'object') return false;
    return 'json_schema' in rules;
}

/**
 * Validates a JSON attribute value.
 * 
 * Accepts any valid JSON value (object, array, string, number, boolean, null).
 * 
 * Supports:
 * - json_schema: JSON Schema for structural validation (basic implementation)
 * 
 * Note: Full JSON Schema validation would require a library like ajv.
 * This implementation provides basic type checking.
 */
export function validateJson(
    value: unknown,
    attribute: AttributeDefinition,
    _context: ValidationContext
): ValidationResult {
    const path = attribute.name;
    const rules = attribute.validation_rules;

    // JSON values can be any valid JSON type
    // We just need to ensure it's serializable
    try {
        JSON.stringify(value);
    } catch {
        return invalidResult(
            path,
            AttributeValidationErrorCode.INVALID_TYPE,
            `Value is not valid JSON`
        );
    }

    if (!isJsonValidationRules(rules) || !rules.json_schema) {
        return validResult();
    }

    // Basic JSON Schema validation
    // For full schema validation, integrate ajv or similar library
    const schema = rules.json_schema;

    // Type validation
    if (schema['type'] !== undefined) {
        const expectedType = schema['type'];
        const actualType = getJsonType(value);

        if (expectedType !== actualType) {
            return invalidResult(
                path,
                AttributeValidationErrorCode.JSON_SCHEMA_MISMATCH,
                `Expected JSON type '${String(expectedType)}', got '${actualType}'`,
                { expected: expectedType, actual: actualType }
            );
        }
    }

    // Required properties (for objects)
    if (schema['required'] !== undefined && typeof value === 'object' && value !== null) {
        const required = schema['required'] as string[];
        const obj = value as Record<string, unknown>;

        for (const prop of required) {
            if (!(prop in obj)) {
                return invalidResult(
                    path,
                    AttributeValidationErrorCode.JSON_SCHEMA_MISMATCH,
                    `Missing required property: ${prop}`,
                    { missing: prop }
                );
            }
        }
    }

    return validResult();
}

/**
 * Gets the JSON Schema type string for a value.
 */
function getJsonType(value: unknown): string {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
}
