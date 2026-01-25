/**
 * =============================================================================
 * NUMERIC VALIDATOR
 * Phase 1B - Ontology Structural Validation
 * =============================================================================
 */

import type { AttributeDefinition } from '../../types.js';
import { isNumericValidationRules } from '../../types.js';
import {
    AttributeValidationErrorCode,
    type ValidationContext,
    type ValidationResult,
    validResult,
    invalidResult,
    mergeResults,
} from '../validation-types.js';

/**
 * Validates INTEGER and FLOAT attribute values.
 * 
 * Supports:
 * - min: Minimum value (inclusive)
 * - max: Maximum value (inclusive)
 * - decimal_places: Maximum decimal places (FLOAT only)
 */
export function validateNumeric(
    value: unknown,
    attribute: AttributeDefinition,
    _context: ValidationContext
): ValidationResult {
    const path = attribute.name;
    const rules = attribute.validation_rules;

    // Type check
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        return invalidResult(
            path,
            AttributeValidationErrorCode.INVALID_TYPE,
            `Expected number, got ${typeof value}`
        );
    }

    // Integer check for INTEGER type
    if (attribute.data_type === 'INTEGER' && !Number.isInteger(value)) {
        return invalidResult(
            path,
            AttributeValidationErrorCode.INVALID_TYPE,
            `Expected integer, got float`
        );
    }

    if (!isNumericValidationRules(rules)) {
        return validResult();
    }

    const results: ValidationResult[] = [];

    // min validation
    if (rules.min !== undefined && value < rules.min) {
        results.push(invalidResult(
            path,
            AttributeValidationErrorCode.NUMBER_TOO_SMALL,
            `Value must be at least ${rules.min}`,
            { min: rules.min, actual: value }
        ));
    }

    // max validation
    if (rules.max !== undefined && value > rules.max) {
        results.push(invalidResult(
            path,
            AttributeValidationErrorCode.NUMBER_TOO_LARGE,
            `Value must be at most ${rules.max}`,
            { max: rules.max, actual: value }
        ));
    }

    // decimal_places validation
    if (rules.decimal_places !== undefined) {
        const decimalStr = value.toString().split('.')[1];
        const actualDecimals = decimalStr ? decimalStr.length : 0;
        if (actualDecimals > rules.decimal_places) {
            results.push(invalidResult(
                path,
                AttributeValidationErrorCode.TOO_MANY_DECIMALS,
                `Value must have at most ${rules.decimal_places} decimal places`,
                { max_decimals: rules.decimal_places, actual: actualDecimals }
            ));
        }
    }

    if (results.length === 0) {
        return validResult();
    }

    return mergeResults(...results);
}
