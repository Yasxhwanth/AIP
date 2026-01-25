import React, { useState } from 'react';
import { OverlayType } from '../../visualization/OverlayTypes';

interface OverlayControlPanelProps {
    activeOverlays: OverlayType[];
    onToggleOverlay: (type: OverlayType) => void;
}

export const OverlayControlPanel: React.FC<OverlayControlPanelProps> = ({
    activeOverlays,
    onToggleOverlay
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggles = [
        { type: OverlayType.AUTHORITY_COVERAGE, label: 'Authority Coverage' },
        { type: OverlayType.POLICY_CONSTRAINT, label: 'Policy Constraints' },
        { type: OverlayType.AUTHORITY_GAP, label: 'Authority Gaps' },
        { type: OverlayType.EMERGENCY_AUTHORITY, label: 'Emergency Authority' },
        { type: OverlayType.MOVEMENT_HISTORY, label: 'Movement History' },
        { type: OverlayType.AI_ANALYZED, label: 'AI Analyzed Entities' }
    ];

    return (
        <div style={{
            position: 'absolute',
            top: '24px',
            left: '24px',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start'
        }}>
            {/* Trigger Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: 'rgba(10, 11, 13, 0.9)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: isOpen ? 'var(--accent)' : 'var(--text-secondary)',
                    backdropFilter: 'blur(4px)',
                    transition: 'all 0.2s'
                }}
                title="Map Overlays"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div style={{
                    marginTop: '8px',
                    backgroundColor: 'rgba(10, 11, 13, 0.95)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    padding: '12px',
                    width: '200px',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    <div style={{
                        fontSize: '10px',
                        color: 'var(--accent)',
                        fontWeight: 700,
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        Governance Overlays
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {toggles.map(({ type, label }) => {
                            const isActive = activeOverlays.includes(type);
                            return (
                                <div
                                    key={type}
                                    onClick={() => onToggleOverlay(type)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        cursor: 'pointer',
                                        opacity: isActive ? 1 : 0.6,
                                        transition: 'opacity 0.2s'
                                    }}
                                >
                                    <div style={{
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '2px',
                                        border: `1px solid ${isActive ? 'var(--accent)' : 'var(--text-secondary)'}`,
                                        backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {isActive && <div style={{ width: '6px', height: '6px', backgroundColor: '#000' }} />}
                                    </div>
                                    <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
