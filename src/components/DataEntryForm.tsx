import React, { useState, useEffect } from 'react';
import { IngestionEngine } from '../ontology/ingestion/IngestionEngine';
import { useOntology } from '../context/OntologyContext';
import { TenantContextManager } from '../tenant/TenantContext';

interface DataEntryFormProps {
  objectType?: string; // Optional: if provided, pre-selects the object type
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormData {
  [key: string]: any;
}

const DataEntryForm: React.FC<DataEntryFormProps> = ({ objectType: propObjectType, onSuccess, onCancel }) => {
  const { compiledOntology, isLoading: ontologyLoading, error: ontologyError } = useOntology();
  const [selectedObjectType, setSelectedObjectType] = useState<string | null>(propObjectType || null);
  const [formData, setFormData] = useState<FormData>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reset form when object type changes
  useEffect(() => {
    setFormData({});
    setSuccessMessage(null);
    setError(null);
  }, [selectedObjectType]);

  if (ontologyLoading) {
    return (
      <div>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (ontologyError) {
    return (
      <div>
        <div className="bg-red-50 border border-red-200 p-4 rounded-md">
          <h3 className="text-red-800 font-medium">Ontology Error</h3>
          <p className="text-red-600">{ontologyError}</p>
        </div>
      </div>
    );
  }

  // Get available object types from ontology
  const availableObjectTypes = compiledOntology?.snapshot.object_types || new Map();

  // Get UI schema for the selected object type
  const uiSchema = selectedObjectType ? compiledOntology?.ui_schemas.get(selectedObjectType as any) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Validate form data against compiled validator
      if (selectedObjectType) {
        const validator = compiledOntology?.validators.get(selectedObjectType as any);
        if (validator) {
          const validationResult = validator.validate(formData);
          if (!validationResult.valid) {
            throw new Error(`Validation failed: ${validationResult.errors.map(err => err.message).join(', ')}`);
          }
        }
      }

      // Get tenant context
      const tenantId = TenantContextManager.getContext().tenantId;

      // Get the object type definition to extract required info
      const objectTypeDef = compiledOntology?.snapshot.object_types.get(selectedObjectType as any);
      if (!objectTypeDef) {
        throw new Error('Object type not found in ontology');
      }

      // Create a mock ingestion source
      const ingestionSource = {
        id: 'ui-form' as any,
        tenant_id: tenantId,
        name: 'UI Form Submission',
        source_type: 'MANUAL' as any,
        status: 'ACTIVE' as any,
        created_at: new Date(),
        created_by: null,
        description: 'Data entered via UI form'
      };

      // Create a mock source version
      const sourceVersion = {
        id: 'form-v1' as any,
        ingestion_source_id: 'ui-form' as any,
        mapping_rules: {
          target_entity_type_id: selectedObjectType as any,
          field_mappings: {} // No specific mappings needed for direct form input
        },
        created_at: new Date(),
        created_by: null
      };

      // Submit to IngestionEngine using the ontology-aware method
      const ingestionEngine = new IngestionEngine();
      const result = await ingestionEngine.ingestWithOntology(
        formData,
        ingestionSource,
        sourceVersion,
        selectedObjectType as any,
        objectTypeDef.ontology_version_id
      );

      if (result.status === 'PROCESSED') {
        setSuccessMessage('Data submitted successfully! It will be reviewed in the Admission Queue.');
        if (onSuccess) {
          onSuccess();
        }
        // Reset form after successful submission
        setFormData({});
      } else {
        throw new Error(Array.isArray(result.validation_errors) && result.validation_errors.length > 0 ? String(result.validation_errors[0]) : 'Submission failed');
      }
    } catch (err: any) {
      console.error('Error submitting form:', err);
      setError(err.message || 'Failed to submit data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (attributeId: string, value: any) => {
    const attributeDef = compiledOntology?.snapshot.attributes.get(attributeId as any);
    if (!attributeDef) return;

    // Convert value based on attribute data type
    let convertedValue: any = value;
    switch (attributeDef.data_type) {
      case 'INTEGER':
        convertedValue = value ? parseInt(value, 10) : null;
        if (isNaN(convertedValue)) convertedValue = null;
        break;
      case 'FLOAT':
        convertedValue = value ? parseFloat(value) : null;
        if (isNaN(convertedValue)) convertedValue = null;
        break;
      case 'BOOLEAN':
        convertedValue = value === true || value === 'true';
        break;
      case 'DATE':
      case 'DATETIME':
        convertedValue = value ? new Date(value) : null;
        break;
      default:
        convertedValue = value;
    }

    setFormData(prev => ({
      ...prev,
      [attributeDef.name]: convertedValue
    }));
  };

  const renderFormField = (fieldDef: any) => {
    const attributeDef = compiledOntology?.snapshot.attributes.get(fieldDef.attribute_id);
    if (!attributeDef) return null;

    const currentValue = formData[attributeDef.name];

    switch (fieldDef.field_type) {
      case 'checkbox':
        return (
          <div key={fieldDef.attribute_id} className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={!!currentValue}
                onChange={(e) => handleInputChange(fieldDef.attribute_id, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">{fieldDef.label}</span>
            </label>
            {fieldDef.required && !currentValue && (
              <p className="mt-1 text-xs text-red-600">This field is required</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={fieldDef.attribute_id} className="mb-4">
            <label htmlFor={fieldDef.attribute_id} className="block text-sm font-medium text-gray-700 mb-1">
              {fieldDef.label} {fieldDef.required ? '*' : ''}
            </label>
            <select
              id={fieldDef.attribute_id}
              value={currentValue || ''}
              onChange={(e) => handleInputChange(fieldDef.attribute_id, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select...</option>
              {attributeDef.enum_values?.map((val: string) => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
            {fieldDef.required && !currentValue && (
              <p className="mt-1 text-xs text-red-600">This field is required</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={fieldDef.attribute_id} className="mb-4">
            <label htmlFor={fieldDef.attribute_id} className="block text-sm font-medium text-gray-700 mb-1">
              {fieldDef.label} {fieldDef.required ? '*' : ''}
            </label>
            <textarea
              id={fieldDef.attribute_id}
              value={currentValue || ''}
              onChange={(e) => handleInputChange(fieldDef.attribute_id, e.target.value)}
              placeholder={fieldDef.placeholder}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={4}
            />
            {fieldDef.required && !currentValue && (
              <p className="mt-1 text-xs text-red-600">This field is required</p>
            )}
          </div>
        );

      case 'date':
        return (
          <div key={fieldDef.attribute_id} className="mb-4">
            <label htmlFor={fieldDef.attribute_id} className="block text-sm font-medium text-gray-700 mb-1">
              {fieldDef.label} {fieldDef.required ? '*' : ''}
            </label>
            <input
              type="date"
              id={fieldDef.attribute_id}
              value={currentValue ? new Date(currentValue).toISOString().split('T')[0] : ''}
              onChange={(e) => handleInputChange(fieldDef.attribute_id, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            {fieldDef.required && !currentValue && (
              <p className="mt-1 text-xs text-red-600">This field is required</p>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={fieldDef.attribute_id} className="mb-4">
            <label htmlFor={fieldDef.attribute_id} className="block text-sm font-medium text-gray-700 mb-1">
              {fieldDef.label} {fieldDef.required ? '*' : ''}
            </label>
            <input
              type="number"
              id={fieldDef.attribute_id}
              value={currentValue || ''}
              onChange={(e) => handleInputChange(fieldDef.attribute_id, e.target.value)}
              placeholder={fieldDef.placeholder}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            {fieldDef.required && !currentValue && (
              <p className="mt-1 text-xs text-red-600">This field is required</p>
            )}
          </div>
        );

      default: // text, etc.
        return (
          <div key={fieldDef.attribute_id} className="mb-4">
            <label htmlFor={fieldDef.attribute_id} className="block text-sm font-medium text-gray-700 mb-1">
              {fieldDef.label} {fieldDef.required ? '*' : ''}
            </label>
            <input
              type="text"
              id={fieldDef.attribute_id}
              value={currentValue || ''}
              onChange={(e) => handleInputChange(fieldDef.attribute_id, e.target.value)}
              placeholder={fieldDef.placeholder}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            {fieldDef.required && !currentValue && (
              <p className="mt-1 text-xs text-red-600">This field is required</p>
            )}
          </div>
        );
    }
  };

  return (
    <div className="data-entry-form">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Data Entry Form</h2>
        <p className="text-gray-600 text-sm">Enter data according to the selected ontology schema</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md mb-4">
          <h3 className="text-red-800 font-medium">Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-md mb-4">
          <h3 className="text-green-800 font-medium">Success!</h3>
          <p className="text-green-600">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {!propObjectType && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Object Type
            </label>
            <select
              value={selectedObjectType || ''}
              onChange={(e) => setSelectedObjectType(e.target.value || null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose an object type...</option>
              {Array.from(availableObjectTypes.values()).map((objType) => (
                <option key={objType.id} value={objType.id}>
                  {objType.display_name} ({objType.name})
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedObjectType && !uiSchema && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mb-4">
            <h3 className="text-yellow-800 font-medium">No UI Schema</h3>
            <p className="text-yellow-600">This object type does not have a defined UI schema.</p>
          </div>
        )}

        {selectedObjectType && uiSchema && (
          <div className="form-fields mb-6">
            {uiSchema.form_fields.map(fieldDef => renderFormField(fieldDef))}
          </div>
        )}

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading || !selectedObjectType || !uiSchema}
            className={`px-4 py-2 rounded-md text-white ${loading || !selectedObjectType || !uiSchema
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            {loading ? 'Submitting...' : 'Submit for Review'}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {!selectedObjectType && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center mt-6">
          <p className="text-gray-500">Select an object type to begin entering data</p>
        </div>
      )}
    </div>
  );
};

export default DataEntryForm;