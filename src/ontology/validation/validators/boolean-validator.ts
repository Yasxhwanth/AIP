/**
 * =============================================================================
 * BOOLEAN VALIDATOR
 * Phase 1B - Ontology Structural Validation
 * =============================================================================
 */

import type { AttributeDefinition } from '../../types.js';
import {
    AttributeValidationErrorCode,
    type ValidationContext,
    type ValidationResult,
    validResult,
    invalidResult,
} from '../validation-types.js';

/**
 * Validates a BOOLEAN attribute value.
 * 
 * Only performs type checking - no additional validation rules.
 */
export function validateBoolean(
    value: unknown,
    attribute: AttributeDefinition,
    _context: ValidationContext
): ValidationResult {
    const path = attribute.name;

    // Type check
    if (typeof value !== 'boolean') {
        return invalidResult(
            path,
            AttributeValidationErrorCode.INVALID_TYPE,
            `Expected boolean, got ${typeof value}`
        );
    }

    return validResult();
}
