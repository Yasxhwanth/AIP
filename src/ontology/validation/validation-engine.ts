/**
 * =============================================================================
 * VALIDATION ENGINE
 * Phase 1B - Ontology Structural Validation
 * =============================================================================
 * 
 * The core validation engine that orchestrates attribute-level and entity-level
 * validation. All validation is metadata-driven - no hard-coded business logic.
 * 
 * Usage:
 *   const engine = new ValidationEngine();
 *   const result = engine.validateEntity(entityValue, entityType, attributes, constraints);
 * =============================================================================
 */

import {
    AttributeDataType,
    type AttributeDefinition,
    type EntityConstraint,
    type EntityType,
    ConstraintType,
    isUniqueTogetherConfig,
    isConditionalRequiredConfig,
    isMutualExclusionConfig,
} from '../types.js';

import {
    OntologySnapshot,
    CompiledOntologySnapshot,
    ObjectTypeDefinitionId,
    ValidationResult as OntologyValidationResult
} from '../definition/ontology-definition-types';
import { ontologyCompiler } from '../definition/OntologyCompiler';

import {
    type ValidationResult,
    type ValidationContext,
    type AttributeValidatorFn,
    AttributeValidationErrorCode,
    ConstraintValidationErrorCode,
    validResult,
    invalidResult,
    mergeResults,
} from './validation-types.js';

import { validatorRegistry } from './validators/index.js';

/**
 * Main validation engine for ontology entities.
 * 
 * Validates:
 * 1. Required attributes (is_required = true)
 * 2. Data type matching (value matches data_type)
 * 3. Validation rules (type-specific rules from validation_rules)
 * 4. Entity constraints (cross-attribute constraints)
 */
export class ValidationEngine {
    /**
     * Validates an entity value against its type definition.
     * 
     * @param entityValue - The entity data to validate
     * @param entityType - The entity type definition
     * @param attributes - All attribute definitions for this entity type
     * @param constraints - All entity constraints for this entity type
     * @returns Validation result with all errors
     */
    validateEntity(
        entityValue: Record<string, unknown>,
        entityType: EntityType,
        attributes: AttributeDefinition[],
        constraints: EntityConstraint[]
    ): ValidationResult {
        const context: ValidationContext = {
            entityType,
            attributes,
            constraints,
            entityValue,
        };

        const results: ValidationResult[] = [];

        // 1. Validate each attribute
        for (const attribute of attributes) {
            const value = entityValue[attribute.name];
            const attributeResult = this.validateAttribute(value, attribute, context);
            results.push(attributeResult);
        }

        // 2. Validate entity-level constraints
        for (const constraint of constraints) {
            const constraintResult = this.validateConstraint(entityValue, constraint, context);
            results.push(constraintResult);
        }

        return mergeResults(...results);
    }

    /**
     * Validates an entity against a compiled ontology snapshot.
     * This is the preferred way to validate in the new ontology engine.
     */
    validateAgainstOntology(
        entityValue: Record<string, unknown>,
        objectTypeId: ObjectTypeDefinitionId,
        compiledSnapshot: CompiledOntologySnapshot
    ): ValidationResult {
        const validator = compiledSnapshot.validators.get(objectTypeId);
        if (!validator) {
            return invalidResult(
                'object_type',
                AttributeValidationErrorCode.INVALID_TYPE,
                `Object type ${objectTypeId} not found in compiled snapshot`
            );
        }

        const result = validator.validate(entityValue);

        if (result.valid) {
            return validResult();
        } else {
            const errors = result.errors.map(err => ({
                path: err.attribute_id || 'unknown',
                code: err.code as any,
                message: err.message
            }));

            return {
                valid: false,
                errors: errors
            };
        }
    }

    /**
     * Validates a single attribute value.
     */
    private validateAttribute(
        value: unknown,
        attribute: AttributeDefinition,
        context: ValidationContext
    ): ValidationResult {
        const path = attribute.name;
        const results: ValidationResult[] = [];

        // Check required
        const isNullOrUndefined = value === null || value === undefined;

        if (attribute.is_required && isNullOrUndefined) {
            return invalidResult(
                path,
                AttributeValidationErrorCode.REQUIRED,
                `${attribute.display_name} is required`
            );
        }

        // Skip further validation if value is null/undefined and not required
        if (isNullOrUndefined) {
            return validResult();
        }

        // Get the appropriate validator
        const validator = this.getValidator(attribute.data_type);
        if (validator) {
            const typeResult = validator(value, attribute, context);
            results.push(typeResult);
        }

        if (results.length === 0) {
            return validResult();
        }

        return mergeResults(...results);
    }

    /**
     * Validates an entity-level constraint.
     */
    private validateConstraint(
        entity: Record<string, unknown>,
        constraint: EntityConstraint,
        context: ValidationContext
    ): ValidationResult {
        switch (constraint.constraint_type) {
            case ConstraintType.UNIQUE_TOGETHER:
                return this.validateUniqueTogetherConstraint(entity, constraint, context);

            case ConstraintType.CONDITIONAL_REQUIRED:
                return this.validateConditionalRequiredConstraint(entity, constraint, context);

            case ConstraintType.MUTUAL_EXCLUSION:
                return this.validateMutualExclusionConstraint(entity, constraint, context);

            case ConstraintType.CUSTOM_EXPRESSION:
                // Custom expressions are not implemented yet
                return validResult();

            default:
                return validResult();
        }
    }

    /**
     * Validates UNIQUE_TOGETHER constraint.
     * Note: This only validates the structure - actual uniqueness check requires DB access.
     */
    private validateUniqueTogetherConstraint(
        entity: Record<string, unknown>,
        constraint: EntityConstraint,
        _context: ValidationContext
    ): ValidationResult {
        const config = constraint.configuration;

        if (!isUniqueTogetherConfig(config)) {
            return validResult();
        }

        // Validate that all referenced attributes exist and have values
        // Actual uniqueness check must be done at the API layer with DB access
        for (const attrName of config.attribute_names) {
            if (!(attrName in entity)) {
                return invalidResult(
                    constraint.name,
                    ConstraintValidationErrorCode.UNIQUE_TOGETHER_VIOLATED,
                    `Unique together constraint references unknown attribute: ${attrName}`,
                    { attribute_names: config.attribute_names }
                );
            }
        }

        return validResult();
    }

    /**
     * Validates CONDITIONAL_REQUIRED constraint.
     */
    private validateConditionalRequiredConstraint(
        entity: Record<string, unknown>,
        constraint: EntityConstraint,
        _context: ValidationContext
    ): ValidationResult {
        const config = constraint.configuration;

        if (!isConditionalRequiredConfig(config)) {
            return validResult();
        }

        const triggerValue = entity[config.if_attribute];

        // Check if condition is met
        const conditionMet = config.if_value === null
            ? triggerValue !== null && triggerValue !== undefined
            : triggerValue === config.if_value;

        if (!conditionMet) {
            return validResult();
        }

        // Condition is met - check that required fields have values
        const missingFields: string[] = [];
        for (const requiredAttr of config.then_required) {
            const value = entity[requiredAttr];
            if (value === null || value === undefined) {
                missingFields.push(requiredAttr);
            }
        }

        if (missingFields.length > 0) {
            const message = constraint.error_message ??
                `When ${config.if_attribute} is set, ${missingFields.join(', ')} must also be provided`;

            return invalidResult(
                constraint.name,
                ConstraintValidationErrorCode.CONDITIONAL_REQUIRED_VIOLATED,
                message,
                { missing_fields: missingFields, trigger_attribute: config.if_attribute }
            );
        }

        return validResult();
    }

    /**
     * Validates MUTUAL_EXCLUSION constraint.
     */
    private validateMutualExclusionConstraint(
        entity: Record<string, unknown>,
        constraint: EntityConstraint,
        _context: ValidationContext
    ): ValidationResult {
        const config = constraint.configuration;

        if (!isMutualExclusionConfig(config)) {
            return validResult();
        }

        // Count how many of the mutually exclusive fields have values
        const fieldsWithValues: string[] = [];
        for (const attrName of config.attribute_names) {
            const value = entity[attrName];
            if (value !== null && value !== undefined) {
                fieldsWithValues.push(attrName);
            }
        }

        if (fieldsWithValues.length > 1) {
            const message = constraint.error_message ??
                `Only one of ${config.attribute_names.join(', ')} can have a value`;

            return invalidResult(
                constraint.name,
                ConstraintValidationErrorCode.MUTUAL_EXCLUSION_VIOLATED,
                message,
                { conflicting_fields: fieldsWithValues }
            );
        }

        return validResult();
    }

    /**
     * Gets the validator for a specific data type from the registry.
     */
    private getValidator(dataType: AttributeDataType): AttributeValidatorFn | undefined {
        return validatorRegistry.get(dataType);
    }
}

// Export singleton instance for convenience
export const validationEngine = new ValidationEngine();
