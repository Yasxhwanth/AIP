import React, { useMemo } from 'react';
import { useEntities } from '../state/entities/useEntities';
import { useOntologyQuery } from '../adapters/query/useOntologyQuery';
import { usePlayback } from '../state/playback/PlaybackContext';
import { MovementEngine } from '../ontology/MovementEngine';

const MapView: React.FC = () => {
    const { selectedEntityId, selectEntity } = useEntities();
    const { entities, getEntityRelationships, getSpatialSnapshots, asOf } = useOntologyQuery();
    const { renderTime } = usePlayback();

    // Get spatial state (View Projection) via Interpolation
    const spatialState = useMemo(() => {
        return entities.map(entity => {
            const snapshots = getSpatialSnapshots(entity.id);
            const position = MovementEngine.interpolate(snapshots, renderTime);

            if (!position) return null;

            return {
                entityId: entity.id,
                x: position.x,
                y: position.y
            };
        }).filter((s): s is { entityId: string; x: number; y: number } => s !== null);
    }, [entities, renderTime, getSpatialSnapshots]);

    const relationships = selectedEntityId ? getEntityRelationships(selectedEntityId) : [];

    // Helper to get color based on status
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Operational': return '#10B981'; // Green
            case 'Degraded': return '#F59E0B'; // Orange
            case 'Construction': return '#3B82F6'; // Blue
            case 'In Transit': return '#8B5CF6'; // Purple
            case 'Arrived': return '#10B981'; // Green
            default: return '#6B7280'; // Gray
        }
    };

    return (
        <div className="panel-center fade-in" style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#0A0B0D',
            color: 'var(--text-secondary)',
            fontFamily: 'JetBrains Mono, monospace',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Map Area - Virtual World Coordinates (0-1000, 0-600) */}
            <div style={{
                flex: 1,
                position: 'relative',
                backgroundColor: '#111827',
                border: '1px solid var(--border)',
                margin: '16px',
                borderRadius: '4px',
                overflow: 'hidden'
            }}>
                <svg
                    viewBox="0 0 1000 600"
                    style={{ width: '100%', height: '100%', display: 'block' }}
                    preserveAspectRatio="xMidYMid meet"
                >
                    {/* Grid Lines */}
                    <defs>
                        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />

                    {/* Relationships */}
                    {relationships.map((r, i) => {
                        const sourceProj = spatialState.find(s => s.entityId === r.source);
                        const targetProj = spatialState.find(s => s.entityId === r.target);

                        if (!sourceProj || !targetProj) return null;

                        return (
                            <line
                                key={i}
                                x1={sourceProj.x}
                                y1={sourceProj.y}
                                x2={targetProj.x}
                                y2={targetProj.y}
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth="2"
                                strokeDasharray="5,5"
                            />
                        );
                    })}

                    {/* Entities */}
                    {spatialState.map(proj => {
                        const entity = entities.find(e => e.id === proj.entityId);
                        if (!entity) return null;

                        const isSelected = entity.id === selectedEntityId;
                        const isRelated = relationships.some(r => r.source === entity.id || r.target === entity.id);
                        const color = getStatusColor(entity.status);

                        return (
                            <g
                                key={entity.id}
                                onClick={() => selectEntity(entity.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                {/* Selection Glow */}
                                {isSelected && (
                                    <circle
                                        cx={proj.x}
                                        cy={proj.y}
                                        r="20"
                                        fill="none"
                                        stroke="white"
                                        strokeOpacity="0.5"
                                        strokeWidth="2"
                                    />
                                )}

                                {/* Entity Marker */}
                                <circle
                                    cx={proj.x}
                                    cy={proj.y}
                                    r={isSelected ? 8 : 6}
                                    fill={color}
                                    stroke={isSelected ? 'white' : isRelated ? 'rgba(255,255,255,0.5)' : 'none'}
                                    strokeWidth={isSelected ? 2 : 1}
                                />

                                {/* Label */}
                                <text
                                    x={proj.x}
                                    y={proj.y + 20}
                                    textAnchor="middle"
                                    fill={isSelected ? 'white' : 'rgba(255,255,255,0.7)'}
                                    fontSize="12"
                                    pointerEvents="none"
                                    style={{ textShadow: '0 1px 2px black' }}
                                >
                                    {entity.id}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* Info Overlay */}
            <div style={{
                position: 'absolute',
                top: '24px',
                right: '24px',
                backgroundColor: 'rgba(10, 11, 13, 0.9)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                padding: '12px',
                width: '240px',
                backdropFilter: 'blur(4px)'
            }}>
                <div style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 700, marginBottom: '4px' }}>TEMPORAL STATE</div>
                <div style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '12px' }}>
                    {renderTime.toISOString().replace('T', ' ').split('.')[0]} UTC
                </div>

                <div style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 700, marginBottom: '4px' }}>SELECTED</div>
                <div style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '12px' }}>
                    {selectedEntityId || 'None'}
                </div>

                {selectedEntityId && (
                    <>
                        <div style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 700, marginBottom: '4px' }}>STATUS</div>
                        <div style={{ fontSize: '14px', color: getStatusColor(entities.find(e => e.id === selectedEntityId)?.status || ''), marginBottom: '12px' }}>
                            {entities.find(e => e.id === selectedEntityId)?.status || 'Unknown'}
                        </div>
                    </>
                )}
            </div>

            <div style={{
                position: 'absolute',
                bottom: '24px',
                left: '24px',
                fontSize: '10px',
                color: 'var(--text-secondary)',
                opacity: 0.7
            }}>
                PHASE 12A: SPATIAL ARCHITECTURE REFACTORED
            </div>
        </div>
    );
};

export default MapView;
