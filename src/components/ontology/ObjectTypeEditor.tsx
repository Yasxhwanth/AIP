/**
 * =============================================================================
 * OBJECT TYPE EDITOR
 * =============================================================================
 * 
 * Structured form for editing object type definitions.
 * DRAFT versions only.
 * 
 * RULES:
 * - No freeform JSON editing
 * - Structured forms only
 * - Validates before save
 * - Only works on DRAFT versions
 */

import React, { useState } from 'react';
import {
    AttributeDataType,
    ObjectTypeDefinition,
    AttributeDefinition,
    OntologyVersionId
} from '../../ontology/definition/ontology-definition-types';
import { ontologyDefinitionStore } from '../../ontology/definition/OntologyDefinitionStore';

interface ObjectTypeEditorProps {
    tenantId: string;
    ontologyVersionId: OntologyVersionId;
    objectType?: ObjectTypeDefinition;
    onSave: () => void;
    onCancel: () => void;
}

interface AttributeFormData {
    name: string;
    display_name: string;
    description: string;
    data_type: AttributeDataType;
    is_required: boolean;
    is_unique: boolean;
    is_indexed: boolean;
    is_primary_display: boolean;
    enum_values?: string[];
    min_length?: number;
    max_length?: number;
    min_value?: number;
    max_value?: number;
    pattern?: string;
}

export const ObjectTypeEditor: React.FC<ObjectTypeEditorProps> = ({
    tenantId,
    ontologyVersionId,
    objectType,
    onSave,
    onCancel
}) => {
    const [name, setName] = useState(objectType?.name || '');
    const [displayName, setDisplayName] = useState(objectType?.display_name || '');
    const [description, setDescription] = useState(objectType?.description || '');
    const [icon, setIcon] = useState(objectType?.icon || '');
    const [color, setColor] = useState(objectType?.color || '#3B82F6');
    const [attributes, setAttributes] = useState<AttributeFormData[]>([]);
    const [showAttributeForm, setShowAttributeForm] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAddAttribute = (attr: AttributeFormData) => {
        setAttributes([...attributes, attr]);
        setShowAttributeForm(false);
    };

    const handleRemoveAttribute = (index: number) => {
        setAttributes(attributes.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        // Validation
        if (!name || !displayName) {
            setError('Object Type name and display name are required');
            return;
        }

        if (!/^[a-z_][a-z0-9_]*$/i.test(name)) {
            setError('Name must be valid identifier (letters, numbers, underscores only)');
            return;
        }

        try {
            if (objectType) {
                // Update existing - not implemented yet
                alert('Update not yet implemented - ACTIVE versions cannot be edited');
            } else {
                // Create new object type
                const newObjectType = ontologyDefinitionStore.createObjectType(
                    ontologyVersionId,
                    name,
                    displayName,
                    'system' // TODO: Replace with actual user
                );

                // Create attributes
                for (const attr of attributes) {
                    ontologyDefinitionStore.createAttribute(
                        ontologyVersionId,
                        newObjectType.id,
                        attr.name,
                        attr.display_name,
                        attr.data_type,
                        'system' // TODO: Replace with actual user
                    );
                }
            }

            onSave();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save object type');
        }
    };

    return (
        <div className="object-type-editor bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {objectType ? 'Edit' : 'Create'} Object Type
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
                        placeholder="asset"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={!!objectType} // Cannot change name after creation
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
                        placeholder="Asset"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe this object type..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Icon & Color */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                        <input
                            type="text"
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                            placeholder="mdi:cube-outline"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-full h-10 px-1 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Attributes Section */}
                <div className="mt-6">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">Attributes</h3>
                        <button
                            onClick={() => setShowAttributeForm(true)}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            + Add Attribute
                        </button>
                    </div>

                    {attributes.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 border border-dashed border-gray-300 rounded">
                            No attributes defined. Add at least one attribute.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {attributes.map((attr, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded">
                                    <div>
                                        <div className="font-medium text-gray-900">{attr.display_name}</div>
                                        <div className="text-sm text-gray-600">
                                            <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                                                {attr.name}
                                            </code>{' '}
                                            • {attr.data_type}
                                            {attr.is_required && (
                                                <span className="ml-2 text-red-600 font-medium">REQUIRED</span>
                                            )}
                                            {attr.is_unique && (
                                                <span className="ml-2 text-blue-600 font-medium">UNIQUE</span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveAttribute(index)}
                                        className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
                <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                >
                    Save Object Type
                </button>
                <button
                    onClick={onCancel}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium"
                >
                    Cancel
                </button>
            </div>

            {/* Attribute Form Modal */}
            {showAttributeForm && (
                <AttributeFormModal
                    onSave={handleAddAttribute}
                    onCancel={() => setShowAttributeForm(false)}
                />
            )}
        </div>
    );
};

interface AttributeFormModalProps {
    onSave: (attr: AttributeFormData) => void;
    onCancel: () => void;
}

const AttributeFormModal: React.FC<AttributeFormModalProps> = ({ onSave, onCancel }) => {
    const [formData, setFormData] = useState<AttributeFormData>({
        name: '',
        display_name: '',
        description: '',
        data_type: AttributeDataType.STRING,
        is_required: false,
        is_unique: false,
        is_indexed: false,
        is_primary_display: false
    });

    const handleSubmit = () => {
        if (!formData.name || !formData.display_name) {
            alert('Name and display name are required');
            return;
        }
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Add Attribute</h3>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="status"
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Display Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.display_name}
                                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                                placeholder="Status"
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data Type</label>
                        <select
                            value={formData.data_type}
                            onChange={(e) =>
                                setFormData({ ...formData, data_type: e.target.value as AttributeDataType })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        >
                            {Object.values(AttributeDataType).map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={formData.is_required}
                                onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                                className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm text-gray-700">Required</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={formData.is_unique}
                                onChange={(e) => setFormData({ ...formData, is_unique: e.target.checked })}
                                className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm text-gray-700">Unique</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={formData.is_indexed}
                                onChange={(e) => setFormData({ ...formData, is_indexed: e.target.checked })}
                                className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm text-gray-700">Indexed</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={formData.is_primary_display}
                                onChange={(e) => setFormData({ ...formData, is_primary_display: e.target.checked })}
                                className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm text-gray-700">Primary Display</span>
                        </label>
                    </div>

                    {/* Type-specific constraints */}
                    {(formData.data_type === AttributeDataType.STRING ||
                        formData.data_type === AttributeDataType.ARRAY) && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Length</label>
                                    <input
                                        type="number"
                                        value={formData.min_length || ''}
                                        onChange={(e) =>
                                            setFormData({ ...formData, min_length: parseInt(e.target.value) || undefined })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Length</label>
                                    <input
                                        type="number"
                                        value={formData.max_length || ''}
                                        onChange={(e) =>
                                            setFormData({ ...formData, max_length: parseInt(e.target.value) || undefined })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded"
                                    />
                                </div>
                            </div>
                        )}

                    {(formData.data_type === AttributeDataType.INTEGER ||
                        formData.data_type === AttributeDataType.FLOAT) && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Value</label>
                                    <input
                                        type="number"
                                        value={formData.min_value || ''}
                                        onChange={(e) =>
                                            setFormData({ ...formData, min_value: parseFloat(e.target.value) || undefined })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Value</label>
                                    <input
                                        type="number"
                                        value={formData.max_value || ''}
                                        onChange={(e) =>
                                            setFormData({ ...formData, max_value: parseFloat(e.target.value) || undefined })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded"
                                    />
                                </div>
                            </div>
                        )}
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Add Attribute
                    </button>
                    <button onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};
