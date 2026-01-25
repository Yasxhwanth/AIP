import React from 'react';
import { Eye, Layers, AlertTriangle, Ghost } from 'lucide-react';
import { useProjection } from '../context/ProjectionContext';
import { useVisualization } from '../context/VisualizationContext';

/**
 * VisualizationControls
 * 
 * UI-VC-1 (Visualization Purity): Projection toggles must never influence truth or scenario state.
 * 
 * Redesigned as a compact checkbox panel positioned in the top-right area
 */
const VisualizationControls: React.FC = () => {
    const { enabled, toggleProjection, horizonMinutes, setHorizonMinutes } = useProjection();
    const { riskMarkersEnabled, setRiskMarkersEnabled, ghostPathsEnabled, setGhostPathsEnabled } = useVisualization();

    const CheckboxItem = ({
        icon: Icon,
        label,
        checked,
        onChange
    }: {
        icon: React.ElementType;
        label: string;
        checked: boolean;
        onChange: () => void;
    }) => (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 0'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--text-primary)' }}>
                <Icon size={14} style={{ opacity: 0.7 }} />
                {label}
            </div>
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                style={{
                    width: '16px',
                    height: '16px',
                    accentColor: 'var(--accent)',
                    cursor: 'pointer'
                }}
            />
        </div>
    );

    return (
        <div className="glass-panel" style={{
            padding: '16px',
            width: '200px'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-secondary)',
                marginBottom: '12px',
                paddingBottom: '12px',
                borderBottom: '1px solid var(--border)'
            }}>
                <Eye size={14} />
                Visual Overlays
            </div>

            {/* Checkbox Items */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <CheckboxItem
                    icon={Layers}
                    label="Predictive Futures"
                    checked={enabled}
                    onChange={toggleProjection}
                />
                <CheckboxItem
                    icon={AlertTriangle}
                    label="Risk Markers"
                    checked={riskMarkersEnabled ?? true}
                    onChange={() => setRiskMarkersEnabled?.(!riskMarkersEnabled)}
                />
                <CheckboxItem
                    icon={Ghost}
                    label="Ghost Paths"
                    checked={ghostPathsEnabled ?? false}
                    onChange={() => setGhostPathsEnabled?.(!ghostPathsEnabled)}
                />
            </div>

            {/* Horizon Selector (when predictive enabled) */}
            {enabled && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        Horizon
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {[15, 30, 60].map(m => (
                            <button
                                key={m}
                                onClick={() => setHorizonMinutes(m)}
                                style={{
                                    flex: 1,
                                    padding: '6px',
                                    fontSize: '10px',
                                    borderRadius: '4px',
                                    border: '1px solid var(--border)',
                                    backgroundColor: horizonMinutes === m ? 'var(--accent)' : 'transparent',
                                    color: horizonMinutes === m ? 'white' : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                +{m}m
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VisualizationControls;
