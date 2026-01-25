/**
 * =============================================================================
 * REFERENCE VALIDATOR
 * Phase 1B - Ontology Structural Validation
 * =============================================================================
 */

import type { AttributeDefinition } from '../../types.js';
import { isReferenceValidationRules } from '../../types.js';
import {
    AttributeValidationErrorCode,
    type ValidationContext,
    type ValidationResult,
    validResult,
    invalidResult,
} from '../validation-types.js';

/**
 * Validates a REFERENCE attribute value.
 * 
 * References are stored as entity IDs (UUID strings).
 * 
 * Supports:
 * - target_entity_type_id: The entity type that this reference points to
 * 
 * Note: Actual referential integrity (checking the entity exists) 
 * must be done at the API layer with database access.
 */
export function validateReference(
    value: unknown,
    attribute: AttributeDefinition,
    _context: ValidationContext
): ValidationResult {
    const path = attribute.name;
    const rules = attribute.validation_rules;

    // Type check - references are UUID strings
    if (typeof value !== 'string') {
        return invalidResult(
            path,
            AttributeValidationErrorCode.INVALID_TYPE,
            `Expected string (UUID reference), got ${typeof value}`
        );
    }

    // UUID format validation (loose check)
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(value)) {
        return invalidResult(
            path,
            AttributeValidationErrorCode.INVALID_REFERENCE,
            `Reference must be a valid UUID`,
            { actual: value }
        );
    }

    // Validate that target_entity_type_id is specified
    if (!isReferenceValidationRules(rules)) {
        return invalidResult(
            path,
            AttributeValidationErrorCode.INVALID_REFERENCE,
            `Reference attribute must specify target_entity_type_id in validation_rules`
        );
    }

    // Note: We cannot validate that the referenced entity actually exists
    // without database access. That validation happens at the API layer.

    return validResult();
}
