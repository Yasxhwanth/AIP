/**
 * =============================================================================
 * STRING VALIDATOR
 * Phase 1B - Ontology Structural Validation
 * =============================================================================
 */

import type { AttributeDefinition } from '../../types.js';
import { isStringValidationRules } from '../../types.js';
import {
    AttributeValidationErrorCode,
    type ValidationContext,
    type ValidationResult,
    validResult,
    invalidResult,
    mergeResults,
} from '../validation-types.js';

/**
 * Validates a STRING attribute value.
 * 
 * Supports:
 * - min_length: Minimum string length
 * - max_length: Maximum string length  
 * - pattern: Regex pattern to match
 * - enum_values: List of allowed values
 */
export function validateString(
    value: unknown,
    attribute: AttributeDefinition,
    _context: ValidationContext
): ValidationResult {
    const path = attribute.name;
    const rules = attribute.validation_rules;

    // Type check
    if (typeof value !== 'string') {
        return invalidResult(
            path,
            AttributeValidationErrorCode.INVALID_TYPE,
            `Expected string, got ${typeof value}`
        );
    }

    if (!isStringValidationRules(rules)) {
        return validResult();
    }

    const results: ValidationResult[] = [];

    // min_length validation
    if (rules.min_length !== undefined && value.length < rules.min_length) {
        results.push(invalidResult(
            path,
            AttributeValidationErrorCode.STRING_TOO_SHORT,
            `String must be at least ${rules.min_length} characters`,
            { min_length: rules.min_length, actual: value.length }
        ));
    }

    // max_length validation
    if (rules.max_length !== undefined && value.length > rules.max_length) {
        results.push(invalidResult(
            path,
            AttributeValidationErrorCode.STRING_TOO_LONG,
            `String must be at most ${rules.max_length} characters`,
            { max_length: rules.max_length, actual: value.length }
        ));
    }

    // pattern validation
    if (rules.pattern !== undefined) {
        const regex = new RegExp(rules.pattern);
        if (!regex.test(value)) {
            results.push(invalidResult(
                path,
                AttributeValidationErrorCode.PATTERN_MISMATCH,
                `String does not match pattern: ${rules.pattern}`,
                { pattern: rules.pattern }
            ));
        }
    }

    // enum_values validation
    if (rules.enum_values !== undefined && !rules.enum_values.includes(value)) {
        results.push(invalidResult(
            path,
            AttributeValidationErrorCode.NOT_IN_ENUM,
            `Value must be one of: ${rules.enum_values.join(', ')}`,
            { allowed: rules.enum_values }
        ));
    }

    if (results.length === 0) {
        return validResult();
    }

    return mergeResults(...results);
}
