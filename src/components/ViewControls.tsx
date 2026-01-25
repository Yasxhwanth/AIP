import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useVisualization } from '../context/VisualizationContext';
import { MapModeToggle } from './MapModeToggle';

const ViewControls: React.FC = () => {
    const { isOverlayOpen, toggleOverlay } = useVisualization();

    return (
        <div style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            zIndex: 900, // Ensure it's above the canvas but below TopBar (1000)
            alignItems: 'flex-end'
        }}>
            <MapModeToggle />
            <button
                onClick={toggleOverlay}
                title={isOverlayOpen ? "Hide Overlays" : "Show Overlays"}
                style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    color: isOverlayOpen ? 'var(--accent)' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
            >
                {isOverlayOpen ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
        </div>
    );
};

export default ViewControls;
