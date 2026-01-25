import React from 'react';
import { useVisualization, MapMode } from '../context/VisualizationContext';
import { Globe, Box } from 'lucide-react';

export const MapModeToggle: React.FC = () => {
    const { mapMode, setMapMode } = useVisualization();

    return (
        <div style={{
            display: 'flex',
            backgroundColor: '#111827',
            borderRadius: '6px',
            padding: '2px',
            border: '1px solid var(--border)',
            height: '32px'
        }}>
            <ModeButton
                active={mapMode === 'ABSTRACT'}
                onClick={() => setMapMode('ABSTRACT')}
                icon={<Box size={14} />}
                label="ABSTRACT"
            />
            <ModeButton
                active={mapMode === 'GEOGRAPHIC'}
                onClick={() => setMapMode('GEOGRAPHIC')}
                icon={<Globe size={14} />}
                label="GEOGRAPHIC"
            />
        </div>
    );
};

const ModeButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0 12px',
            borderRadius: '4px',
            backgroundColor: active ? '#374151' : 'transparent',
            color: active ? 'white' : '#9CA3AF',
            border: 'none',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            height: '100%',
            transition: 'all 0.2s'
        }}
    >
        {icon}
        <span>{label}</span>
    </button>
);
