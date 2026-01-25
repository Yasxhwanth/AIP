import React, { useState, useEffect } from 'react';
import { QueryClient } from '../adapters/query/QueryClient';
import { useOntology } from '../context/OntologyContext';
import { useTime } from '../state/time/TimeContext';
import { useScenario } from '../context/ScenarioContext';
import { TenantContextManager } from '../tenant/TenantContext';

interface EntityBrowserProps { }

interface EntityRow {
  id: string;
  [key: string]: any;
}

const EntityBrowser: React.FC<EntityBrowserProps> = () => {
  const { compiledOntology, isLoading: ontologyLoading, error: ontologyError } = useOntology();
  const { asOf } = useTime();
  const { activeScenario } = useScenario();
  const [selectedObjectType, setSelectedObjectType] = useState<string | null>(null);
  const [entities, setEntities] = useState<EntityRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 20,
    totalCount: 0
  });

  // Initialize query client
  const queryClient = new QueryClient();

  // Load entities when object type changes
  useEffect(() => {
    if (!selectedObjectType || !compiledOntology) return;

    const loadEntities = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get the tenant context
        const tenantId = TenantContextManager.getContext().tenantId;

        // Query entities of selected type using available QueryClient methods
        const allEntities = QueryClient.getEntities(asOf, tenantId);

        // Filter entities by object type (using the entity_type_id)
        const filteredEntities = allEntities.filter(entity =>
          entity.entity_type_id === selectedObjectType
        );

        // Apply pagination
        const paginatedEntities = filteredEntities.slice(
          (pagination.currentPage - 1) * pagination.pageSize,
          pagination.currentPage * pagination.pageSize
        );

        // Get entity snapshots with attributes
        const transformedEntities: EntityRow[] = paginatedEntities.map(entity => {
          const snapshot = QueryClient.getEntitySnapshot(entity.id, asOf, tenantId);
          return {
            id: entity.id,
            ...snapshot?.attributes // Include attributes from the snapshot
          };
        });

        setEntities(transformedEntities);
        setPagination(prev => ({
          ...prev,
          totalCount: filteredEntities.length
        }));
      } catch (err: any) {
        console.error('Error loading entities:', err);
        setError(err.message || 'Failed to load entities');
      } finally {
        setLoading(false);
      }
    };

    loadEntities();
  }, [selectedObjectType, compiledOntology, asOf, activeScenario, pagination.currentPage, pagination.pageSize]);

  if (ontologyLoading) {
    return (
      <div>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
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

  const availableObjectTypes = compiledOntology?.snapshot.object_types || new Map();

  return (
    <div className="entity-browser">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Entity Browser</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Object Type
          </label>
          <select
            value={selectedObjectType || ''}
            onChange={(e) => {
              setSelectedObjectType(e.target.value || null);
              setPagination({ ...pagination, currentPage: 1 }); // Reset to first page
            }}
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
      </div>

      {selectedObjectType && (
        <div className="entity-list">
          {loading && (
            <div className="animate-pulse mb-4">
              <div className="h-10 bg-gray-200 rounded mb-2"></div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded mb-2"></div>
              ))}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-md mb-4">
              <h3 className="text-red-800 font-medium">Error Loading Entities</h3>
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      {(() => {
                        // Get UI schema for the selected object type to determine columns
                        const uiSchema = compiledOntology?.ui_schemas.get(selectedObjectType as any);
                        if (!uiSchema) return null;

                        return uiSchema.display_config.list_view_columns.map((attrId) => {
                          const attr = compiledOntology?.snapshot.attributes.get(attrId);
                          return (
                            <th key={attrId} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {attr?.display_name || attr?.name || attrId}
                            </th>
                          );
                        });
                      })()}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {entities.map((entity) => (
                      <tr key={entity.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {entity.id}
                        </td>
                        {(() => {
                          // Get UI schema for the selected object type to determine columns
                          const uiSchema = compiledOntology?.ui_schemas.get(selectedObjectType as any);
                          if (!uiSchema) return null;

                          return uiSchema.display_config.list_view_columns.map((attrId) => {
                            const attr = compiledOntology?.snapshot.attributes.get(attrId);
                            const value = entity[attr?.name || ''];
                            return (
                              <td key={attrId} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {value !== undefined ? String(value) : 'N/A'}
                              </td>
                            );
                          });
                        })()}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.pageSize + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.totalCount}</span> results
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
                    disabled={pagination.currentPage <= 1}
                    className={`px-4 py-2 rounded-md ${pagination.currentPage <= 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                  >
                    Previous
                  </button>

                  <button
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.min(Math.ceil(prev.totalCount / prev.pageSize), prev.currentPage + 1) }))}
                    disabled={pagination.currentPage >= Math.ceil(pagination.totalCount / pagination.pageSize)}
                    className={`px-4 py-2 rounded-md ${pagination.currentPage >= Math.ceil(pagination.totalCount / pagination.pageSize)
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {!selectedObjectType && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
          <p className="text-gray-500">Select an object type to browse entities</p>
        </div>
      )}
    </div>
  );
};

export default EntityBrowser;