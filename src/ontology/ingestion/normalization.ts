/**
 * =============================================================================
 * INGESTION NORMALIZATION
 * Phase 22 - Data Ingestion & Streaming
 * =============================================================================
 * 
 * Handles the transformation of raw external payloads into normalized,
 * ontology-compliant objects using declarative mapping rules.
 */

import { MappingRules, FieldMapping, ComplexFieldMapping } from './ingestion-types.js';

/**
 * Normalizes a raw payload according to the provided mapping rules.
 * 
 * @param payload - The raw JSON payload
 * @param mapping - The declarative mapping rules
 * @returns A normalized object matching the target entity structure
 */
export function normalizePayload(
    payload: Record<string, unknown>,
    mapping: MappingRules
): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [targetField, fieldMapping] of Object.entries(mapping.field_mappings)) {
        const value = resolveValue(payload, fieldMapping);
        if (value !== undefined) {
            result[targetField] = value;
        }
    }

    return result;
}

/**
 * Resolves a single field value based on the mapping configuration.
 */
function resolveValue(
    payload: Record<string, unknown>,
    mapping: FieldMapping
): unknown {
    // Handle simple string mapping (direct path)
    if (typeof mapping === 'string') {
        return getDeepValue(payload, mapping);
    }

    // Handle complex mapping
    const complexMapping = mapping as ComplexFieldMapping;

    // 1. Try static value first
    if (complexMapping.static_value !== undefined) {
        return complexMapping.static_value;
    }

    // 2. Extract from source path
    let value: unknown = undefined;
    if (complexMapping.source_path) {
        value = getDeepValue(payload, complexMapping.source_path);
    }

    // 3. Apply default if missing
    if (value === undefined || value === null) {
        if (complexMapping.default_value !== undefined) {
            value = complexMapping.default_value;
        }
    }

    // 4. Apply transformations
    if (value !== undefined && value !== null && complexMapping.transform) {
        value = applyTransform(value, complexMapping.transform);
    }

    return value;
}

/**
 * Extracts a value from a nested object using dot notation.
 * e.g., "user.address.city"
 */
function getDeepValue(obj: Record<string, unknown>, path: string): unknown {
    const parts = path.split('.');
    let current: any = obj;

    for (const part of parts) {
        if (current === null || current === undefined) {
            return undefined;
        }
        current = current[part];
    }

    return current;
}

/**
 * Applies a supported transformation function.
 * 
 * RESTRICTION: Only whitelisted transformations are allowed.
 * No arbitrary code execution.
 */
function applyTransform(value: unknown, transformName: string): unknown {
    switch (transformName) {
        case 'toUpperCase':
            return String(value).toUpperCase();
        case 'toLowerCase':
            return String(value).toLowerCase();
        case 'trim':
            return String(value).trim();
        case 'toNumber':
            const num = Number(value);
            return isNaN(num) ? null : num;
        case 'toBoolean':
            return Boolean(value);
        case 'toISOString':
            try {
                return new Date(String(value)).toISOString();
            } catch {
                return null;
            }
        default:
            console.warn(`Unknown transform: ${transformName}`);
            return value;
    }
}
