/**
 * =============================================================================
 * RELATIONSHIP TYPE EDITOR
 * =============================================================================
 * 
 * Structured form for defining relationship types.
 * Shows relationship graph preview.
 * 
 * RULES:
 * - Only DRAFT versions
 * - All writes via OntologyDefinitionStore
 * - Validates before save
 */

import React, { useState } from 'react';
import {
    RelationshipTypeDefinition,
    ObjectTypeDefinition,
    OntologyVersionId,
    RelationshipCardinality,
    RelationshipDirection
} from '../../ontology/definition/ontology-definition-types';
import { ontologyDefinitionStore } from '../../ontology/definition/OntologyDefinitionStore';

interface RelationshipTypeEditorProps {
    tenantId: string;
    ontologyVersionId: OntologyVersionId;
    relationshipType?: RelationshipTypeDefinition;
    onSave: () => void;
    onCancel: () => void;
    objectTypes: ObjectTypeDefinition[];
}

export const RelationshipTypeEditor: React.FC<RelationshipTypeEditorProps> = ({
    tenantId,
    ontologyVersionId,
    relationshipType,
    onSave,
    onCancel,
    objectTypes
}) => {
    const [name, setName] = useState(relationshipType?.name || '');
    const [displayName, setDisplayName] = useState(relationshipType?.display_name || '');
    const [description, setDescription] = useState(relationshipType?.description || '');
    const [fromTypeId, setFromTypeId] = useState(relationshipType?.from_type_id || '');
    const [toTypeId, setToTypeId] = useState(relationshipType?.to_type_id || '');
    const [cardinality, setCardinality] = useState(relationshipType?.cardinality || RelationshipCardinality.ONE_TO_MANY);
    const [direction, setDirection] = useState(relationshipType?.direction || RelationshipDirection.BIDIRECTIONAL);
    const [isTemporal, setIsTemporal] = useState(relationshipType?.is_temporal || false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = () => {
        // Validation
        if (!name || !displayName) {
            setError('Relationship name and display name are required');
            return;
        }

        if (!fromTypeId || !toTypeId) {
            setError('Both FROM and TO object types must be selected');
            return;
        }

        if (!/^[a-z_][a-z0-9_]*$/i.test(name)) {
            setError('Name must be valid identifier (letters, numbers, underscores only)');
            return;
        }

        try {
            if (relationshipType) {
                // Update not supported - relationships are immutable after creation
                alert('Update not yet implemented - ACTIVE versions cannot be edited');
            } else {
                // Create new relationship
                const newRelationship = ontologyDefinitionStore.createRelationshipType(
                    ontologyVersionId,
                    name,
                    displayName,
                    fromTypeId as any,
                    toTypeId as any,
                    direction,
                    cardinality,
                    'system' // TODO: Replace with actual user
                );

                // Update description if provided
                if (description) {
                    // Note: Description updates would require a separate method in the store
                }
            }

            onSave();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save relationship type');
        }
    };

    return (
        <div className="relationship-type-editor bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {relationshipType ? 'Edit' : 'Create'} Relationship Type
            </h2>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name (Machine-Readable) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="located_at"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={!!relationshipType} // Cannot change name after creation
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Must be lowercase, alphanumeric with underscores only
                    </p>
                </div>

                {/* Display Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Display Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Located At"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe this relationship..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* From/To Object Types */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            From Object Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={fromTypeId}
                            onChange={(e) => setFromTypeId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={!!relationshipType}
                        >
                            <option value="">Select Object Type</option>
                            {objectTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.display_name} ({type.name})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            To Object Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={toTypeId}
                            onChange={(e) => setToTypeId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={!!relationshipType}
                        >
                            <option value="">Select Object Type</option>
                            {objectTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.display_name} ({type.name})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Cardinality and Direction */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cardinality <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={cardinality}
                            onChange={(e) => setCardinality(e.target.value as RelationshipCardinality)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {Object.values(RelationshipCardinality).map((card) => (
                                <option key={card} value={card}>
                                    {card.replace('_', ' ')}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Direction <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={direction}
                            onChange={(e) => setDirection(e.target.value as RelationshipDirection)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {Object.values(RelationshipDirection).map((dir) => (
                                <option key={dir} value={dir}>
                                    {dir.replace('_', ' ')}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Temporal */}
                <div>
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={isTemporal}
                            onChange={(e) => setIsTemporal(e.target.checked)}
                            className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-700">Temporal Relationship</span>
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                        Check if this relationship has time-varying validity
                    </p>
                </div>

                {/* Relationship Preview */}
                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Relationship Preview</h3>
                    <div className="flex items-center justify-center py-4">
                        <div className="text-center">
                            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded font-medium">
                                {objectTypes.find(t => t.id === fromTypeId)?.display_name || 'FROM'}
                            </div>
                            <div className="my-2 flex items-center">
                                <div className="h-px bg-gray-400 flex-grow"></div>
                                <div className="mx-2 text-gray-600 font-medium text-sm">
                                    {displayName || 'RELATIONSHIP'}
                                </div>
                                <div className="h-px bg-gray-400 flex-grow"></div>
                            </div>
                            <div className="bg-green-100 text-green-800 px-3 py-1 rounded font-medium">
                                {objectTypes.find(t => t.id === toTypeId)?.display_name || 'TO'}
                            </div>
                        </div>
                    </div>
                    <div className="text-center mt-3 text-sm text-gray-600">
                        {cardinality} | {direction} | {isTemporal ? 'Temporal' : 'Static'}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
                <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                >
                    Save Relationship Type
                </button>
                <button
                    onClick={onCancel}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};
