/**
 * =============================================================================
 * ONTOLOGY COMPILER
 * =============================================================================
 * 
 * Converts ontology metadata into runtime-optimized structures:
 * - Runtime validators
 * - Query plans
 * - UI schemas
 * - Workflow contracts
 * - AI context schemas
 * 
 * This is what makes the system truly dynamic - no hardcoded logic.
 * 
 * INVARIANTS:
 * - Deterministic: same input always produces same output
 * - Cached per version: compiled snapshots are cached
 * - Pure function: no side effects
 */

import {
    CompiledOntologySnapshot,
    OntologySnapshot,
    OntologyVersionId,
    ObjectTypeDefinitionId,
    AttributeDefinitionId,
    ObjectTypeDefinition,
    AttributeDefinition,
    RelationshipTypeDefinition,
    CompiledValidator,
    CompiledUISchema,
    CompiledAIContextSchema,
    ValidationResult,
    ValidationError,
    FormFieldDefinition,
    DisplayConfiguration,
    DetailViewSection,
    AttributeDataType,
    EntityConstraintDefinition,
    ConstraintType
} from './ontology-definition-types';
import { ontologySnapshotResolver } from './OntologySnapshotResolver';
import { ontologySnapshotHasher } from './OntologySnapshotHash';

export class OntologyCompiler {
    private compiledCache: Map<string, CompiledOntologySnapshot> = new Map();

    /**
     * Compile ontology snapshot into runtime artifacts.
     * 
     * @param snapshot - The ontology snapshot to compile
     * @returns Compiled ontology snapshot with runtime artifacts
     */
    public compile(snapshot: OntologySnapshot): CompiledOntologySnapshot {
        // Check cache
        const cacheKey = `${snapshot.ontology_version_id}|${snapshot.as_of.toISOString()}`;
        const cached = this.compiledCache.get(cacheKey);
        if (cached) {
            return cached;
        }

        // Compile validators
        const validators = this.compileValidators(snapshot);

        // Compile UI schemas
        const uiSchemas = this.compileUISchemas(snapshot);

        // Compile AI context schemas
        const aiContextSchemas = this.compileAIContextSchemas(snapshot);

        // Compile query plans
        const queryPlans = this.compileQueryPlans(snapshot);

        // Compile workflow contracts
        const workflowContracts = this.compileWorkflowContracts(snapshot);

        // Compute deterministic snapshot hash
        const hashResult = ontologySnapshotHasher.computeHash(snapshot);

        const compiled: CompiledOntologySnapshot = {
            ontology_version_id: snapshot.ontology_version_id,
            compiled_at: new Date(),
            snapshot: snapshot,
            snapshot_hash: hashResult.snapshot_hash,
            validators: validators,
            query_plans: queryPlans,
            ui_schemas: uiSchemas,
            workflow_contracts: workflowContracts,
            ai_context_schemas: aiContextSchemas
        };

        // Cache compiled snapshot
        if (this.compiledCache.size > 100) {
            // Clear oldest 50%
            const entries = Array.from(this.compiledCache.entries());
            entries.sort((a, b) => a[1].compiled_at.getTime() - b[1].compiled_at.getTime());
            const toRemove = entries.slice(0, Math.floor(entries.length / 2));
            toRemove.forEach(([key]) => this.compiledCache.delete(key));
        }
        this.compiledCache.set(cacheKey, compiled);

        return compiled;
    }

    /**
     * Compile validators for all object types.
     */
    private compileValidators(snapshot: OntologySnapshot): Map<ObjectTypeDefinitionId, CompiledValidator> {
        const validators = new Map<ObjectTypeDefinitionId, CompiledValidator>();

        for (const objectType of snapshot.object_types.values()) {
            const attributes = snapshot.attributes_by_object_type.get(objectType.id) || [];

            const validate = (entity: Record<string, unknown>): ValidationResult => {
                const errors: ValidationError[] = [];

                // 1. Validate each attribute
                for (const attr of attributes) {
                    const value = entity[attr.name];

                    // Required check
                    if (attr.is_required && (value === undefined || value === null || value === '')) {
                        errors.push({
                            attribute_id: attr.id,
                            message: `${attr.display_name} is required`,
                            code: 'REQUIRED'
                        });
                        continue;
                    }

                    // Skip validation if value is null/undefined and not required
                    if (value === undefined || value === null) {
                        continue;
                    }

                    // Type validation
                    const typeError = this.validateAttributeType(value, attr);
                    if (typeError) {
                        errors.push(typeError);
                        continue;
                    }

                    // Constraint validation
                    const constraintErrors = this.validateAttributeConstraints(value, attr);
                    errors.push(...constraintErrors);
                }

                // 2. Validate entity-level constraints
                const constraints = snapshot.constraints_by_object_type.get(objectType.id) || [];
                for (const constraint of constraints) {
                    const constraintError = this.validateEntityConstraint(entity, constraint);
                    if (constraintError) {
                        errors.push(constraintError);
                    }
                }

                return {
                    valid: errors.length === 0,
                    errors: errors
                };
            };

            validators.set(objectType.id, {
                object_type_id: objectType.id,
                validate: validate
            });
        }

        return validators;
    }

    /**
     * Validate attribute value type.
     */
    private validateAttributeType(
        value: unknown,
        attr: AttributeDefinition
    ): ValidationError | null {
        switch (attr.data_type) {
            case AttributeDataType.STRING:
                if (typeof value !== 'string') {
                    return {
                        attribute_id: attr.id,
                        message: `${attr.display_name} must be a string`,
                        code: 'TYPE_MISMATCH'
                    };
                }
                break;

            case AttributeDataType.INTEGER:
                if (typeof value !== 'number' || !Number.isInteger(value)) {
                    return {
                        attribute_id: attr.id,
                        message: `${attr.display_name} must be an integer`,
                        code: 'TYPE_MISMATCH'
                    };
                }
                break;

            case AttributeDataType.FLOAT:
                if (typeof value !== 'number') {
                    return {
                        attribute_id: attr.id,
                        message: `${attr.display_name} must be a number`,
                        code: 'TYPE_MISMATCH'
                    };
                }
                break;

            case AttributeDataType.BOOLEAN:
                if (typeof value !== 'boolean') {
                    return {
                        attribute_id: attr.id,
                        message: `${attr.display_name} must be a boolean`,
                        code: 'TYPE_MISMATCH'
                    };
                }
                break;

            case AttributeDataType.DATE:
            case AttributeDataType.DATETIME:
                if (!(value instanceof Date) && typeof value !== 'string') {
                    return {
                        attribute_id: attr.id,
                        message: `${attr.display_name} must be a date`,
                        code: 'TYPE_MISMATCH'
                    };
                }
                break;

            case AttributeDataType.JSON:
                // JSON can be any object/array
                if (typeof value !== 'object' || value === null) {
                    return {
                        attribute_id: attr.id,
                        message: `${attr.display_name} must be a JSON object`,
                        code: 'TYPE_MISMATCH'
                    };
                }
                break;

            case AttributeDataType.ARRAY:
                if (!Array.isArray(value)) {
                    return {
                        attribute_id: attr.id,
                        message: `${attr.display_name} must be an array`,
                        code: 'TYPE_MISMATCH'
                    };
                }
                break;

            case AttributeDataType.ENUM:
                if (typeof value !== 'string') {
                    return {
                        attribute_id: attr.id,
                        message: `${attr.display_name} must be a string (enum value)`,
                        code: 'TYPE_MISMATCH'
                    };
                }
                break;

            case AttributeDataType.REFERENCE:
                if (typeof value !== 'string') {
                    return {
                        attribute_id: attr.id,
                        message: `${attr.display_name} must be an entity ID (reference)`,
                        code: 'TYPE_MISMATCH'
                    };
                }
                break;

            case AttributeDataType.GEO_POINT:
                if (typeof value !== 'object' || value === null || !('lat' in value) || !('lng' in value)) {
                    return {
                        attribute_id: attr.id,
                        message: `${attr.display_name} must be a GeoPoint {lat, lng}`,
                        code: 'TYPE_MISMATCH'
                    };
                }
                break;

            case AttributeDataType.GEO_POLYGON:
                if (!Array.isArray(value)) {
                    return {
                        attribute_id: attr.id,
                        message: `${attr.display_name} must be an array of GeoPoints`,
                        code: 'TYPE_MISMATCH'
                    };
                }
                break;

            default:
                // Unknown type - skip validation
                break;
        }

        return null;
    }

    /**
     * Validate attribute constraints.
     */
    private validateAttributeConstraints(
        value: unknown,
        attr: AttributeDefinition
    ): ValidationError[] {
        const errors: ValidationError[] = [];

        if (attr.data_type === AttributeDataType.STRING && typeof value === 'string') {
            // Min length
            if (attr.min_length !== undefined && value.length < attr.min_length) {
                errors.push({
                    attribute_id: attr.id,
                    message: `${attr.display_name} must be at least ${attr.min_length} characters`,
                    code: 'MIN_LENGTH'
                });
            }

            // Max length
            if (attr.max_length !== undefined && value.length > attr.max_length) {
                errors.push({
                    attribute_id: attr.id,
                    message: `${attr.display_name} must be at most ${attr.max_length} characters`,
                    code: 'MAX_LENGTH'
                });
            }

            // Pattern
            if (attr.pattern) {
                const regex = new RegExp(attr.pattern);
                if (!regex.test(value)) {
                    errors.push({
                        attribute_id: attr.id,
                        message: `${attr.display_name} does not match required pattern`,
                        code: 'PATTERN_MISMATCH'
                    });
                }
            }
        }

        if ((attr.data_type === AttributeDataType.INTEGER || attr.data_type === AttributeDataType.FLOAT) && typeof value === 'number') {
            // Min value
            if (attr.min_value !== undefined && value < attr.min_value) {
                errors.push({
                    attribute_id: attr.id,
                    message: `${attr.display_name} must be at least ${attr.min_value}`,
                    code: 'MIN_VALUE'
                });
            }

            // Max value
            if (attr.max_value !== undefined && value > attr.max_value) {
                errors.push({
                    attribute_id: attr.id,
                    message: `${attr.display_name} must be at most ${attr.max_value}`,
                    code: 'MAX_VALUE'
                });
            }
        }

        if (attr.data_type === AttributeDataType.ARRAY && Array.isArray(value)) {
            // Min items
            if (attr.min_length !== undefined && value.length < attr.min_length) {
                errors.push({
                    attribute_id: attr.id,
                    message: `${attr.display_name} must have at least ${attr.min_length} items`,
                    code: 'MIN_ITEMS'
                });
            }

            // Max items
            if (attr.max_length !== undefined && value.length > attr.max_length) {
                errors.push({
                    attribute_id: attr.id,
                    message: `${attr.display_name} must have at most ${attr.max_length} items`,
                    code: 'MAX_ITEMS'
                });
            }
        }

        if (attr.data_type === AttributeDataType.ENUM && typeof value === 'string') {
            if (attr.enum_values && !attr.enum_values.includes(value)) {
                errors.push({
                    attribute_id: attr.id,
                    message: `${attr.display_name} must be one of: ${attr.enum_values.join(', ')}`,
                    code: 'NOT_IN_ENUM'
                });
            }
        }

        return errors;
    }

    /**
     * Validate entity-level constraint.
     */
    private validateEntityConstraint(
        entity: Record<string, unknown>,
        constraint: EntityConstraintDefinition
    ): ValidationError | null {
        const config = constraint.configuration;

        switch (constraint.constraint_type) {
            case ConstraintType.UNIQUE_TOGETHER: {
                const attributeNames = config.attribute_names as string[];
                if (!attributeNames) return null;

                for (const name of attributeNames) {
                    if (!(name in entity)) {
                        return {
                            message: `Unique together constraint references unknown attribute: ${name}`,
                            code: 'UNIQUE_TOGETHER_VIOLATED'
                        };
                    }
                }
                break;
            }

            case ConstraintType.CONDITIONAL_REQUIRED: {
                const ifAttribute = config.if_attribute as string;
                const ifValue = config.if_value;
                const thenRequired = config.then_required as string[];

                if (!ifAttribute || !thenRequired) return null;

                const triggerValue = entity[ifAttribute];
                const conditionMet = ifValue === null
                    ? triggerValue !== null && triggerValue !== undefined
                    : triggerValue === ifValue;

                if (conditionMet) {
                    for (const requiredAttr of thenRequired) {
                        const value = entity[requiredAttr];
                        if (value === null || value === undefined || value === '') {
                            return {
                                message: constraint.error_message || `When ${ifAttribute} is set, ${requiredAttr} must also be provided`,
                                code: 'CONDITIONAL_REQUIRED_VIOLATED'
                            };
                        }
                    }
                }
                break;
            }

            case ConstraintType.MUTUAL_EXCLUSION: {
                const attributeNames = config.attribute_names as string[];
                if (!attributeNames) return null;

                const fieldsWithValues = attributeNames.filter(name => {
                    const value = entity[name];
                    return value !== null && value !== undefined && value !== '';
                });

                if (fieldsWithValues.length > 1) {
                    return {
                        message: constraint.error_message || `Only one of ${attributeNames.join(', ')} can have a value`,
                        code: 'MUTUAL_EXCLUSION_VIOLATED'
                    };
                }
                break;
            }

            default:
                break;
        }

        return null;
    }

    /**
     * Compile UI schemas for all object types.
     */
    private compileUISchemas(snapshot: OntologySnapshot): Map<ObjectTypeDefinitionId, CompiledUISchema> {
        const uiSchemas = new Map<ObjectTypeDefinitionId, CompiledUISchema>();

        for (const objectType of snapshot.object_types.values()) {
            const attributes = snapshot.attributes_by_object_type.get(objectType.id) || [];

            // Compile form fields
            const formFields: FormFieldDefinition[] = attributes.map(attr => {
                let fieldType: FormFieldDefinition['field_type'] = 'text';

                switch (attr.data_type) {
                    case AttributeDataType.INTEGER:
                    case AttributeDataType.FLOAT:
                        fieldType = 'number';
                        break;
                    case AttributeDataType.BOOLEAN:
                        fieldType = 'checkbox';
                        break;
                    case AttributeDataType.DATE:
                    case AttributeDataType.DATETIME:
                        fieldType = 'date';
                        break;
                    case AttributeDataType.ENUM:
                        fieldType = 'select';
                        break;
                    case AttributeDataType.STRING:
                        if (attr.max_length && attr.max_length > 200) {
                            fieldType = 'textarea';
                        } else {
                            fieldType = 'text';
                        }
                        break;
                    default:
                        fieldType = 'text';
                }

                return {
                    attribute_id: attr.id,
                    field_type: fieldType,
                    label: attr.display_name,
                    placeholder: attr.description || undefined,
                    required: attr.is_required,
                    validation_rules: {
                        min_length: attr.min_length,
                        max_length: attr.max_length,
                        min_value: attr.min_value,
                        max_value: attr.max_value,
                        pattern: attr.pattern,
                        enum_values: attr.enum_values
                    }
                };
            });

            // Find primary display attribute
            const primaryAttr = attributes.find(a => a.is_primary_display) || attributes[0];
            const secondaryAttrs = attributes.filter(a =>
                a.id !== primaryAttr?.id && a.is_indexed
            ).slice(0, 3);

            // Compile list view columns (indexed attributes + primary)
            const listViewColumns = [
                primaryAttr?.id,
                ...attributes.filter(a => a.is_indexed && a.id !== primaryAttr?.id).map(a => a.id)
            ].filter((id): id is AttributeDefinitionId => id !== undefined).slice(0, 5);

            // Compile detail view sections
            const detailViewSections: DetailViewSection[] = [
                {
                    title: 'Overview',
                    attribute_ids: [primaryAttr?.id, ...secondaryAttrs.map(a => a.id)].filter((id): id is AttributeDefinitionId => id !== undefined)
                },
                {
                    title: 'Details',
                    attribute_ids: attributes
                        .filter(a => !a.is_primary_display && !a.is_indexed)
                        .map(a => a.id)
                }
            ].filter(section => section.attribute_ids.length > 0);

            const displayConfig: DisplayConfiguration = {
                primary_attribute_id: primaryAttr?.id || attributes[0]?.id || '' as any,
                secondary_attribute_ids: secondaryAttrs.map(a => a.id),
                list_view_columns: listViewColumns as any[],
                detail_view_sections: detailViewSections
            };

            uiSchemas.set(objectType.id, {
                object_type_id: objectType.id,
                form_fields: formFields,
                display_config: displayConfig
            });
        }

        return uiSchemas;
    }

    /**
     * Compile AI context schemas for all object types.
     */
    private compileAIContextSchemas(snapshot: OntologySnapshot): Map<ObjectTypeDefinitionId, CompiledAIContextSchema> {
        const aiSchemas = new Map<ObjectTypeDefinitionId, CompiledAIContextSchema>();

        for (const objectType of snapshot.object_types.values()) {
            const attributes = snapshot.attributes_by_object_type.get(objectType.id) || [];
            const relationships = [
                ...(snapshot.relationships_by_from_type.get(objectType.id) || []),
                ...(snapshot.relationships_by_to_type.get(objectType.id) || [])
            ];

            // Build semantic description
            const semanticDescription = this.buildSemanticDescription(objectType, attributes, relationships);

            // Build attribute descriptions
            const attributeDescriptions = new Map<string, string>();
            for (const attr of attributes) {
                attributeDescriptions.set(attr.name,
                    `${attr.display_name}${attr.description ? `: ${attr.description}` : ''} (${attr.data_type})`
                );
            }

            // Build relationship descriptions
            const relationshipDescriptions = new Map<string, string>();
            for (const rel of relationships) {
                const fromType = snapshot.object_types.get(rel.from_type_id);
                const toType = snapshot.object_types.get(rel.to_type_id);
                relationshipDescriptions.set(rel.name,
                    `${rel.display_name}: ${fromType?.display_name || 'Unknown'} → ${toType?.display_name || 'Unknown'} (${rel.cardinality})`
                );
            }

            aiSchemas.set(objectType.id, {
                object_type_id: objectType.id,
                semantic_description: semanticDescription,
                attribute_descriptions: attributeDescriptions,
                relationship_descriptions: relationshipDescriptions
            });
        }

        return aiSchemas;
    }

    /**
     * Build semantic description for AI context.
     */
    private buildSemanticDescription(
        objectType: ObjectTypeDefinition,
        attributes: AttributeDefinition[],
        relationships: RelationshipTypeDefinition[]
    ): string {
        const parts: string[] = [];

        parts.push(`${objectType.display_name} (${objectType.name})`);

        if (objectType.description) {
            parts.push(`Description: ${objectType.description}`);
        }

        parts.push(`Attributes (${attributes.length}):`);
        for (const attr of attributes.slice(0, 10)) { // Limit to first 10
            parts.push(`  - ${attr.display_name} (${attr.name}): ${attr.data_type}${attr.is_required ? ' [required]' : ''}`);
        }

        if (relationships.length > 0) {
            parts.push(`Relationships (${relationships.length}):`);
            for (const rel of relationships.slice(0, 10)) { // Limit to first 10
                parts.push(`  - ${rel.display_name} (${rel.name}): ${rel.cardinality}`);
            }
        }

        return parts.join('\n');
    }

    /**
     * Compile query plans for optimized query execution.
     * 
     * Pre-computes common query patterns for each object type:
     * - Index selection strategy
     * - Join order for relationships
     * - Filter optimization hints
     */
    private compileQueryPlans(snapshot: OntologySnapshot): Map<string, any> {
        const queryPlans = new Map<string, any>();

        for (const objectType of snapshot.object_types.values()) {
            const attributes = snapshot.attributes_by_object_type.get(objectType.id) || [];
            const relationships = [
                ...(snapshot.relationships_by_from_type.get(objectType.id) || []),
                ...(snapshot.relationships_by_to_type.get(objectType.id) || [])
            ];

            // Identify indexed attributes for fast lookups
            const indexedAttributes = attributes
                .filter(attr => attr.is_indexed || attr.is_unique)
                .map(attr => attr.name);

            // Pre-compute relationship traversal order
            const relationshipPaths = relationships.map(rel => ({
                relationship_id: rel.id,
                direction: rel.from_type_id === objectType.id ? 'outbound' : 'inbound',
                target_type_id: rel.from_type_id === objectType.id ? rel.to_type_id : rel.from_type_id,
                cardinality: rel.cardinality
            }));

            queryPlans.set(objectType.id, {
                object_type_id: objectType.id,
                indexed_attributes: indexedAttributes,
                relationship_paths: relationshipPaths,
                optimization_hints: {
                    prefer_index_scan: indexedAttributes.length > 0,
                    max_relationship_depth: 3 // Prevent infinite traversal
                }
            });
        }

        return queryPlans;
    }

    /**
     * Compile workflow contracts for runtime workflow validation.
     * 
     * Defines what workflows can operate on which object types:
     * - Input/output type contracts
     * - Required attributes for workflow steps
     * - Authority requirements per step
     */
    private compileWorkflowContracts(snapshot: OntologySnapshot): Map<string, any> {
        const workflowContracts = new Map<string, any>();

        for (const objectType of snapshot.object_types.values()) {
            const attributes = snapshot.attributes_by_object_type.get(objectType.id) || [];

            // Identify required attributes (must be present for workflow execution)
            const requiredAttributes = attributes
                .filter(attr => attr.is_required)
                .map(attr => ({
                    attribute_id: attr.id,
                    name: attr.name,
                    data_type: attr.data_type
                }));

            // Define workflow input contract
            const inputContract = {
                object_type_id: objectType.id,
                required_attributes: requiredAttributes,
                optional_attributes: attributes
                    .filter(attr => !attr.is_required)
                    .map(attr => attr.name)
            };

            // Define workflow output contract (what workflows can modify)
            const outputContract = {
                object_type_id: objectType.id,
                mutable_attributes: attributes
                    .filter(attr => !attr.is_primary_display) // Primary keys immutable
                    .map(attr => attr.name)
            };

            workflowContracts.set(objectType.id, {
                object_type_id: objectType.id,
                input_contract: inputContract,
                output_contract: outputContract,
                validation_strategy: 'pre_step' // Validate before each step
            });
        }

        return workflowContracts;
    }

    /**
     * Clear compilation cache.
     */
    public clearCache(): void {
        this.compiledCache.clear();
    }
}

export const ontologyCompiler = new OntologyCompiler();

