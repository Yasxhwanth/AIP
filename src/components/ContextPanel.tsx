import React, { useMemo } from 'react';
import { Search, Filter, AlertCircle, Loader2 } from 'lucide-react';
import { useEntities } from '../state/entities/useEntities';
import { useOntologyQuery } from '../adapters/query/useOntologyQuery';

/**
 * Get status color and style based on entity status
 */
const getStatusStyle = (status: string) => {
    switch (status) {
        case 'Operational':
            return { bg: 'rgba(0, 200, 83, 0.15)', color: '#00C853', border: '1px solid rgba(0, 200, 83, 0.3)' };
        case 'Degraded':
            return { bg: 'rgba(255, 77, 77, 0.15)', color: '#FF4D4D', border: '1px solid rgba(255, 77, 77, 0.3)' };
        case 'In Transit':
            return { bg: 'rgba(0, 200, 255, 0.15)', color: '#00C8FF', border: '1px solid rgba(0, 200, 255, 0.3)' };
        case 'Construction':
            return { bg: 'rgba(255, 152, 0, 0.15)', color: '#FF9800', border: '1px solid rgba(255, 152, 0, 0.3)' };
        default:
            return { bg: 'rgba(100, 100, 100, 0.15)', color: '#888', border: '1px solid rgba(100, 100, 100, 0.3)' };
    }
};

const ContextPanel: React.FC = () => {
    const { selectedEntityId, selectEntity } = useEntities();
    const { entities, isLoading, error, compiledSnapshot } = useOntologyQuery();

    // Group entities by object type
    const groupedEntities = useMemo(() => {
        const groups = new Map<string, any[]>();
        entities.forEach(e => {
            const type = e.entity_type_id || 'unknown';
            if (!groups.has(type)) groups.set(type, []);
            groups.get(type)!.push(e);
        });
        return groups;
    }, [entities]);

    return (
        <div className="panel-left fade-in">
            <div className="panel-header">
                <span>ONTOLOGY EXPLORER</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Search size={14} style={{ cursor: 'pointer' }} />
                    <Filter size={14} style={{ cursor: 'pointer' }} />
                </div>
            </div>

            <div style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
                <div style={{
                    backgroundColor: 'var(--surface-2)',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border)'
                }}>
                    <Search size={14} style={{ opacity: 0.6 }} />
                    <input
                        type="text"
                        placeholder="Search Ontology..."
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            width: '100%',
                            fontSize: '12px'
                        }}
                    />
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
                {isLoading ? (
                    <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                        <Loader2 size={24} className="animate-spin" />
                    </div>
                ) : error ? (
                    <div style={{ padding: '16px', color: '#FF4D4D', fontSize: '12px' }}>
                        {error}
                    </div>
                ) : entities.length === 0 ? (
                    <div style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '12px', textAlign: 'center' }}>
                        No entities found at this time.
                    </div>
                ) : (
                    Array.from(groupedEntities.entries()).map(([typeId, typeEntities]: [string, any[]]) => {
                        const typeDef = compiledSnapshot?.snapshot.object_types.get(typeId as any);
                        const displayName = typeDef?.display_name || typeId.toUpperCase();
                        
                        return (
                            <div key={typeId}>
                                <div style={{
                                    padding: '8px 16px',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    color: 'var(--text-muted)',
                                    backgroundColor: 'rgba(255,255,255,0.02)',
                                    borderBottom: '1px solid var(--border)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span>{displayName} ({typeEntities.length})</span>
                                </div>
                                {typeEntities.map((entity: any) => {
                                    const entityStatus = (entity as any).status || '';
                                    const entityRisk = (entity as any).risk;
                                    const statusStyle = getStatusStyle(entityStatus);
                                    const isSelected = entity.id === selectedEntityId;
                                    const primaryAttrId = compiledSnapshot?.ui_schemas.get(typeId as any)?.display_config.primary_attribute_id;
                                    const primaryAttrName = primaryAttrId ? compiledSnapshot.snapshot.attributes.get(primaryAttrId)?.name : 'name';
                                    const label = entity[primaryAttrName || 'name'] || entity.id;

                                    return (
                                        <div
                                            key={entity.id}
                                            onClick={() => selectEntity(entity.id)}
                                            style={{
                                                padding: '12px 16px',
                                                borderBottom: '1px solid var(--border)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                backgroundColor: isSelected ? 'rgba(0, 122, 255, 0.08)' : 'transparent',
                                                borderLeft: isSelected ? '3px solid var(--accent)' : '3px solid transparent'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                                <div style={{
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                                                }}>
                                                    {label}
                                                </div>
                                                {entityRisk === 'High' && (
                                                    <AlertCircle size={14} style={{ color: '#FF4D4D' }} />
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                                                    {entity.id.slice(0, 8)}...
                                                </div>
                                                {entityStatus && (
                                                    <div style={{
                                                        fontSize: '8px',
                                                        padding: '2px 6px',
                                                        borderRadius: '3px',
                                                        backgroundColor: statusStyle.bg,
                                                        color: statusStyle.color,
                                                        border: statusStyle.border,
                                                        fontWeight: 700,
                                                        textTransform: 'uppercase',
                                                    }}>
                                                        {entityStatus}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })
                )}
            </div>

            {/* System Health */}
            <div style={{ padding: '16px', borderTop: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px', letterSpacing: '0.05em' }}>
                    SYSTEM HEALTH
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--surface-2)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: '92%', height: '100%', backgroundColor: '#00C853', borderRadius: '3px' }}></div>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#00C853' }}>92%</span>
                </div>
            </div>

            {/* Phase Indicator */}
            <div style={{
                padding: '12px 16px',
                borderTop: '1px solid var(--border)',
                fontSize: '10px',
                color: 'var(--text-muted)',
                letterSpacing: '0.05em'
            }}>
                PHASE 12C: 3D SPATIAL RENDERING
            </div>
        </div>
    );
};

export default ContextPanel;
