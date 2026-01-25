/**
 * =============================================================================
 * DATE VALIDATOR
 * Phase 1B - Ontology Structural Validation
 * =============================================================================
 */

import type { AttributeDefinition, DateValidationRules } from '../../types.js';
import {
    AttributeValidationErrorCode,
    type ValidationContext,
    type ValidationResult,
    validResult,
    invalidResult,
    mergeResults,
} from '../validation-types.js';

/**
 * Type guard for date validation rules.
 */
function isDateValidationRules(
    rules: unknown
): rules is DateValidationRules {
    if (!rules || typeof rules !== 'object') return false;
    return 'min_date' in rules || 'max_date' in rules;
}

/**
 * Validates DATE and DATETIME attribute values.
 * 
 * Accepts:
 * - Date objects
 * - ISO 8601 date strings
 * 
 * Supports:
 * - min_date: Earliest allowed date (ISO 8601 string)
 * - max_date: Latest allowed date (ISO 8601 string)
 */
export function validateDate(
    value: unknown,
    attribute: AttributeDefinition,
    _context: ValidationContext
): ValidationResult {
    const path = attribute.name;
    const rules = attribute.validation_rules;

    // Parse value to Date
    let dateValue: Date;
    if (value instanceof Date) {
        dateValue = value;
    } else if (typeof value === 'string') {
        dateValue = new Date(value);
    } else {
        return invalidResult(
            path,
            AttributeValidationErrorCode.INVALID_TYPE,
            `Expected Date or ISO 8601 string, got ${typeof value}`
        );
    }

    // Check for invalid date
    if (isNaN(dateValue.getTime())) {
        return invalidResult(
            path,
            AttributeValidationErrorCode.INVALID_TYPE,
            `Invalid date value`
        );
    }

    if (!isDateValidationRules(rules)) {
        return validResult();
    }

    const results: ValidationResult[] = [];

    // min_date validation
    if (rules.min_date !== undefined) {
        const minDate = new Date(rules.min_date);
        if (dateValue < minDate) {
            results.push(invalidResult(
                path,
                AttributeValidationErrorCode.DATE_TOO_EARLY,
                `Date must be on or after ${rules.min_date}`,
                { min_date: rules.min_date, actual: dateValue.toISOString() }
            ));
        }
    }

    // max_date validation
    if (rules.max_date !== undefined) {
        const maxDate = new Date(rules.max_date);
        if (dateValue > maxDate) {
            results.push(invalidResult(
                path,
                AttributeValidationErrorCode.DATE_TOO_LATE,
                `Date must be on or before ${rules.max_date}`,
                { max_date: rules.max_date, actual: dateValue.toISOString() }
            ));
        }
    }

    if (results.length === 0) {
        return validResult();
    }

    return mergeResults(...results);
}
