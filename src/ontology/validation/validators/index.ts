/**
 * =============================================================================
 * VALIDATOR REGISTRY
 * Phase 1B - Ontology Structural Validation
 * =============================================================================
 * 
 * Central registry that maps attribute data types to their validators.
 * This enables metadata-driven validation without hard-coded type checks.
 * =============================================================================
 */

import { AttributeDataType } from '../../types.js';
import type { AttributeValidatorFn, ValidatorRegistry } from '../validation-types.js';

import { validateString } from './string-validator.js';
import { validateNumeric } from './numeric-validator.js';
import { validateBoolean } from './boolean-validator.js';
import { validateDate } from './date-validator.js';
import { createArrayValidator } from './array-validator.js';
import { validateReference } from './reference-validator.js';
import { validateJson } from './json-validator.js';

/**
 * Gets the validator for a specific attribute data type.
 */
function getValidator(type: AttributeDataType): AttributeValidatorFn | undefined {
    return validatorRegistry.get(type);
}

/**
 * Registry mapping data types to their validator functions.
 * 
 * This registry is the core of the metadata-driven validation system.
 * To add support for a new data type:
 * 1. Add the type to AttributeDataType enum
 * 2. Create a validator function
 * 3. Register it here
 */
export const validatorRegistry: ValidatorRegistry = new Map([
    [AttributeDataType.STRING, validateString],
    [AttributeDataType.INTEGER, validateNumeric],
    [AttributeDataType.FLOAT, validateNumeric],
    [AttributeDataType.BOOLEAN, validateBoolean],
    [AttributeDataType.DATE, validateDate],
    [AttributeDataType.DATETIME, validateDate],
    [AttributeDataType.ARRAY, createArrayValidator(getValidator)],
    [AttributeDataType.REFERENCE, validateReference],
    [AttributeDataType.JSON, validateJson],
]);

// Re-export individual validators for direct use
export { validateString } from './string-validator.js';
export { validateNumeric } from './numeric-validator.js';
export { validateBoolean } from './boolean-validator.js';
export { validateDate } from './date-validator.js';
export { createArrayValidator } from './array-validator.js';
export { validateReference } from './reference-validator.js';
export { validateJson } from './json-validator.js';
