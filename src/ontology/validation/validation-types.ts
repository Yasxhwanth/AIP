/**
 * =============================================================================
 * VALIDATION TYPES
 * Phase 1B - Ontology Structural Validation
 * =============================================================================
 * 
 * Core types for the metadata-driven validation engine.
 * All validation is declarative - no hard-coded business logic.
 * =============================================================================
 */

import type {
    AttributeDataType,
    AttributeDefinition,
    EntityConstraint,
    EntityType,
    ValidationRules,
} from '../types.js';

// =============================================================================
// ERROR CODES
// =============================================================================
// Standardized error codes for programmatic handling and i18n.

/**
 * Validation error codes for attribute-level validation.
 */
export enum AttributeValidationErrorCode {
    /** Value is required but missing or null */
    REQUIRED = 'REQUIRED',

    /** Value type does not match expected data type */
    INVALID_TYPE = 'INVALID_TYPE',

    /** String value is shorter than min_length */
    STRING_TOO_SHORT = 'STRING_TOO_SHORT',

    /** String value is longer than max_length */
    STRING_TOO_LONG = 'STRING_TOO_LONG',

    /** String value does not match pattern */
    PATTERN_MISMATCH = 'PATTERN_MISMATCH',

    /** String value is not in allowed enum values */
    NOT_IN_ENUM = 'NOT_IN_ENUM',

    /** Numeric value is less than min */
    NUMBER_TOO_SMALL = 'NUMBER_TOO_SMALL',

    /** Numeric value is greater than max */
    NUMBER_TOO_LARGE = 'NUMBER_TOO_LARGE',

    /** Numeric value has too many decimal places */
    TOO_MANY_DECIMALS = 'TOO_MANY_DECIMALS',

    /** Date value is before min_date */
    DATE_TOO_EARLY = 'DATE_TOO_EARLY',

    /** Date value is after max_date */
    DATE_TOO_LATE = 'DATE_TOO_LATE',

    /** Array has fewer items than min_items */
    ARRAY_TOO_SHORT = 'ARRAY_TOO_SHORT',

    /** Array has more items than max_items */
    ARRAY_TOO_LONG = 'ARRAY_TOO_LONG',

    /** Array items are not unique when unique_items is true */
    ARRAY_NOT_UNIQUE = 'ARRAY_NOT_UNIQUE',

    /** Array element failed validation */
    ARRAY_ELEMENT_INVALID = 'ARRAY_ELEMENT_INVALID',

    /** Reference target entity type is invalid */
    INVALID_REFERENCE = 'INVALID_REFERENCE',

    /** JSON value does not match json_schema */
    JSON_SCHEMA_MISMATCH = 'JSON_SCHEMA_MISMATCH',
}

/**
 * Validation error codes for entity-level constraints.
 */
export enum ConstraintValidationErrorCode {
    /** UNIQUE_TOGETHER constraint violated */
    UNIQUE_TOGETHER_VIOLATED = 'UNIQUE_TOGETHER_VIOLATED',

    /** CONDITIONAL_REQUIRED constraint violated */
    CONDITIONAL_REQUIRED_VIOLATED = 'CONDITIONAL_REQUIRED_VIOLATED',

    /** MUTUAL_EXCLUSION constraint violated */
    MUTUAL_EXCLUSION_VIOLATED = 'MUTUAL_EXCLUSION_VIOLATED',

    /** CUSTOM_EXPRESSION constraint violated */
    CUSTOM_EXPRESSION_VIOLATED = 'CUSTOM_EXPRESSION_VIOLATED',
}

// =============================================================================
// VALIDATION ERRORS
// =============================================================================

/**
 * Represents a single validation error.
 */
export interface ValidationError {
    /** Path to the invalid value (e.g., "email", "items[0].name") */
    path: string;

    /** Error code for programmatic handling */
    code: AttributeValidationErrorCode | ConstraintValidationErrorCode;

    /** Human-readable error message */
    message: string;

    /** The invalid value (may be omitted for security) */
    value?: unknown;

    /** Additional context (e.g., constraint name, expected values) */
    context?: Record<string, unknown>;
}

/**
 * Result of validation operation.
 */
export interface ValidationResult {
    /** Whether validation passed */
    valid: boolean;

    /** List of validation errors (empty if valid) */
    errors: ValidationError[];
}

// =============================================================================
// VALIDATION CONTEXT
// =============================================================================

/**
 * Context passed to validators for cross-attribute validation.
 */
export interface ValidationContext {
    /** The entity type being validated */
    entityType: EntityType;

    /** All attribute definitions for this entity type */
    attributes: AttributeDefinition[];

    /** All entity constraints for this entity type */
    constraints: EntityConstraint[];

    /** The complete entity value (for cross-attribute access) */
    entityValue: Record<string, unknown>;
}

// =============================================================================
// VALIDATOR FUNCTION TYPES
// =============================================================================

/**
 * Validator function for a single attribute value.
 * 
 * @param value - The value to validate
 * @param attribute - The attribute definition
 * @param context - Validation context
 * @returns Validation result
 */
export type AttributeValidatorFn = (
    value: unknown,
    attribute: AttributeDefinition,
    context: ValidationContext
) => ValidationResult;

/**
 * Validator function for an entity-level constraint.
 * 
 * @param entity - The complete entity value
 * @param constraint - The constraint definition
 * @param context - Validation context
 * @returns Validation result
 */
export type ConstraintValidatorFn = (
    entity: Record<string, unknown>,
    constraint: EntityConstraint,
    context: ValidationContext
) => ValidationResult;

/**
 * Registry mapping data types to their validators.
 */
export type ValidatorRegistry = Map<AttributeDataType, AttributeValidatorFn>;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Creates a successful validation result.
 */
export function validResult(): ValidationResult {
    return { valid: true, errors: [] };
}

/**
 * Creates a failed validation result with a single error.
 */
export function invalidResult(
    path: string,
    code: AttributeValidationErrorCode | ConstraintValidationErrorCode,
    message: string,
    context?: Record<string, unknown>
): ValidationResult {
    const error: ValidationError = { path, code, message };
    if (context !== undefined) {
        error.context = context;
    }
    return {
        valid: false,
        errors: [error],
    };
}

/**
 * Merges multiple validation results into one.
 */
export function mergeResults(...results: ValidationResult[]): ValidationResult {
    const errors = results.flatMap(r => r.errors);
    return {
        valid: errors.length === 0,
        errors,
    };
}
