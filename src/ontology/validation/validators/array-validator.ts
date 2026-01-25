/**
 * =============================================================================
 * ARRAY VALIDATOR
 * Phase 1B - Ontology Structural Validation
 * =============================================================================
 */

import type { AttributeDefinition } from '../../types.js';
import { AttributeDataType, isArrayValidationRules } from '../../types.js';
import {
    AttributeValidationErrorCode,
    type ValidationContext,
    type ValidationResult,
    type AttributeValidatorFn,
    validResult,
    invalidResult,
    mergeResults,
} from '../validation-types.js';

/**
 * Validates an ARRAY attribute value.
 * 
 * Supports:
 * - element_type: Data type of array elements
 * - min_items: Minimum number of items
 * - max_items: Maximum number of items
 * - unique_items: Whether items must be unique
 * - element_rules: Validation rules for elements
 * 
 * @param getValidator - Function to get validator for element type (injected to avoid circular deps)
 */
export function createArrayValidator(
    getValidator: (type: AttributeDataType) => AttributeValidatorFn | undefined
): AttributeValidatorFn {
    return function validateArray(
        value: unknown,
        attribute: AttributeDefinition,
        context: ValidationContext
    ): ValidationResult {
        const path = attribute.name;
        const rules = attribute.validation_rules;

        // Type check
        if (!Array.isArray(value)) {
            return invalidResult(
                path,
                AttributeValidationErrorCode.INVALID_TYPE,
                `Expected array, got ${typeof value}`
            );
        }

        if (!isArrayValidationRules(rules)) {
            return validResult();
        }

        const results: ValidationResult[] = [];

        // min_items validation
        if (rules.min_items !== undefined && value.length < rules.min_items) {
            results.push(invalidResult(
                path,
                AttributeValidationErrorCode.ARRAY_TOO_SHORT,
                `Array must have at least ${rules.min_items} items`,
                { min_items: rules.min_items, actual: value.length }
            ));
        }

        // max_items validation
        if (rules.max_items !== undefined && value.length > rules.max_items) {
            results.push(invalidResult(
                path,
                AttributeValidationErrorCode.ARRAY_TOO_LONG,
                `Array must have at most ${rules.max_items} items`,
                { max_items: rules.max_items, actual: value.length }
            ));
        }

        // unique_items validation
        if (rules.unique_items === true) {
            const seen = new Set<string>();
            for (let i = 0; i < value.length; i++) {
                const key = JSON.stringify(value[i]);
                if (seen.has(key)) {
                    results.push(invalidResult(
                        path,
                        AttributeValidationErrorCode.ARRAY_NOT_UNIQUE,
                        `Array items must be unique`,
                        { duplicate_index: i }
                    ));
                    break;
                }
                seen.add(key);
            }
        }

        // element validation
        const elementValidator = getValidator(rules.element_type);
        if (elementValidator) {
            // Create a synthetic attribute definition for element validation
            const elementAttribute: AttributeDefinition = {
                ...attribute,
                name: `${path}[]`,
                data_type: rules.element_type,
                validation_rules: rules.element_rules ?? {},
            };

            for (let i = 0; i < value.length; i++) {
                const elementResult = elementValidator(value[i], elementAttribute, context);
                if (!elementResult.valid) {
                    // Remap paths to include array index
                    const remappedErrors = elementResult.errors.map(error => ({
                        ...error,
                        path: `${path}[${i}]`,
                        code: AttributeValidationErrorCode.ARRAY_ELEMENT_INVALID,
                    }));
                    results.push({ valid: false, errors: remappedErrors });
                }
            }
        }

        if (results.length === 0) {
            return validResult();
        }

        return mergeResults(...results);
    };
}
