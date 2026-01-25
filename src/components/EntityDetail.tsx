import React, { useState, useEffect } from 'react';
import { QueryClient } from '../adapters/query/QueryClient';
import { useOntology } from '../context/OntologyContext';
import { useTime } from '../state/time/TimeContext';
import { TenantContextManager } from '../tenant/TenantContext';
import AIRecommendation from './AIRecommendation';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Info,
  AlertTriangle,
  Activity,
  Link2,
  BarChart3,
  FileSearch,
  ExternalLink
} from 'lucide-react';

interface EntityDetailProps {
  entityId: string | null;
}

interface EntityDetailData {
  id: string;
  entity_type_id: string;
  attributes: Record<string, any>;
  relationships: any[];
  lineage: {
    created_at: Date;
    updated_at: Date;
    version_history: any[];
  };
}

const EntityDetail: React.FC<EntityDetailProps> = ({ entityId }) => {
  const { compiledOntology, isLoading: ontologyLoading, error: ontologyError } = useOntology();
  const { asOf: asOfTime } = useTime();
  const [entityDetail, setEntityDetail] = useState<EntityDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [justificationOpen, setJustificationOpen] = useState(true);

  useEffect(() => {
    if (!entityId || !compiledOntology) {
      setEntityDetail(null);
      return;
    }

    const loadEntityDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        const tenantId = TenantContextManager.getContext().tenantId;

        // Get entity snapshot with attributes
        const snapshot = QueryClient.getEntitySnapshot(entityId, asOfTime, tenantId);
        if (!snapshot) {
          throw new Error('Entity not found');
        }

        // Get basic entity info
        const entityInfo = QueryClient.getEntities(asOfTime, tenantId).find(e => e.id === entityId);

        // Get relationships for this entity
        const relationships = QueryClient.getEntityRelationships(entityId, asOfTime, tenantId);

        // Prepare entity detail data
        const detailData: EntityDetailData = {
          id: entityId,
          entity_type_id: entityInfo?.entity_type_id || '',
          attributes: snapshot.attributes || {},
          relationships: relationships,
          lineage: {
            created_at: snapshot.created_at || new Date(),
            updated_at: snapshot.updated_at || new Date(),
            version_history: snapshot.version_history || []
          }
        };

        setEntityDetail(detailData);
      } catch (err: any) {
        console.error('Error loading entity detail:', err);
        setError(err.message || 'Failed to load entity detail');
        setEntityDetail(null);
      } finally {
        setLoading(false);
      }
    };

    loadEntityDetail();
  }, [entityId, compiledOntology, asOfTime]);

  if (ontologyLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-surface-2 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-6 bg-surface-2 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (ontologyError) {
    return (
      <div className="p-4">
        <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-md">
          <h3 className="text-red-400 font-medium">Ontology Error</h3>
          <p className="text-red-300 text-sm">{ontologyError}</p>
        </div>
      </div>
    );
  }

  if (!entityId) {
    return (
      <div className="p-8 text-center">
        <p className="text-text-secondary">Select an entity to view details</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-surface-2 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-surface-2 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-surface-2 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-md">
          <h3 className="text-red-400 font-medium">Error Loading Entity</h3>
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!entityDetail) {
    return (
      <div className="p-8 text-center">
        <p className="text-text-secondary">Entity not found</p>
      </div>
    );
  }

  const objectType = compiledOntology?.snapshot.object_types.get(entityDetail.entity_type_id as any);
  const status = entityDetail.attributes['status'] || 'Operational';
  const isDegraded = status === 'Degraded' || status === 'Critical';

  return (
    <div className="entity-detail flex flex-col h-full bg-bg-surface border-l border-border">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-surface-1">
        <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
          SELECTED ENTITY: {entityDetail.id}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Entity Card */}
        <div className="p-4">
          <div className="bg-surface-2 border-l-4 border-accent rounded-r-md p-4 mb-6 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-text-primary">
                  {objectType?.display_name || 'Entity'}
                  {entityDetail.attributes['type'] === 'Primary' && <span className="text-text-secondary font-normal text-sm ml-2">(Primary)</span>}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${isDegraded ? 'bg-red-500' : 'bg-green-500'}`}></div>
                  <span className={`text-sm ${isDegraded ? 'text-red-400' : 'text-text-secondary'}`}>
                    Status: {status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Analyst Briefing */}
          <AIRecommendation />

          {/* Traceability */}
          <div className="mb-6 mt-6">
            <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">TRACEABILITY</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs group cursor-pointer hover:bg-surface-2 p-1 rounded transition-colors">
                <div className="flex items-center gap-2 text-text-secondary group-hover:text-text-primary">
                  <Link2 size={14} />
                  <span>Evidence: Inventory Logs</span>
                </div>
                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 text-text-muted" />
              </div>
              <div className="flex items-center justify-between text-xs group cursor-pointer hover:bg-surface-2 p-1 rounded transition-colors">
                <div className="flex items-center gap-2 text-text-secondary group-hover:text-text-primary">
                  <BarChart3 size={14} />
                  <span>Simulation: Impact Analysis</span>
                </div>
                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 text-text-muted" />
              </div>
              <div className="flex items-center justify-between text-xs group cursor-pointer hover:bg-surface-2 p-1 rounded transition-colors">
                <div className="flex items-center gap-2 text-text-secondary group-hover:text-text-primary">
                  <FileSearch size={14} />
                  <span>Reasoning: Demand Forecast</span>
                </div>
                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 text-text-muted" />
              </div>
            </div>
          </div>
        </div>

        {/* Justification Section */}
        <div className="border-t border-border">
          <button
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-2 transition-colors"
            onClick={() => setJustificationOpen(!justificationOpen)}
          >
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">JUSTIFICATION</span>
            {justificationOpen ? <ChevronUp size={14} className="text-text-muted" /> : <ChevronDown size={14} className="text-text-muted" />}
          </button>

          {justificationOpen && (
            <div className="px-4 pb-4 space-y-4">
              <div className="flex gap-3">
                <div className="mt-0.5">
                  <CheckCircle size={16} className="text-accent" />
                </div>
                <div>
                  <div className="text-sm font-medium text-text-primary">Rule triggered</div>
                  <div className="text-xs text-text-secondary mt-0.5">Inventory Level &lt; 15% threshold for Component X-99.</div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="mt-0.5">
                  <Info size={16} className="text-blue-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-text-primary">Pattern observed</div>
                  <div className="text-xs text-text-secondary mt-0.5">Unusual spike in outbound air freight demand from HUB-NY-01.</div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="mt-0.5">
                  <Activity size={16} className="text-blue-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-text-primary">Historical comparison</div>
                  <div className="text-xs text-text-secondary mt-0.5">Current demand exceeds Q4 peak by 12%.</div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="mt-0.5">
                  <AlertTriangle size={16} className="text-yellow-500" />
                </div>
                <div>
                  <div className="text-sm font-medium text-text-primary">Constraint identified</div>
                  <div className="text-xs text-text-secondary mt-0.5">Alternative route via HUB-LDN-02 has 24h delay.</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EntityDetail;