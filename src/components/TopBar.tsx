import React, { useState } from 'react';
import { ChevronDown, Globe, FlaskConical, LogOut, User } from 'lucide-react';
import { useScenario } from '../context/ScenarioContext';
import { useTime } from '../state/time/useTime';
import { useAuth } from '../auth/AuthContext';

/**
 * TopBar
 * 
 * UI-RC-1 (Reality Mode Authority): Only the Top Bar may switch between REALITY and SCENARIO.
 * 
 * Contains:
 * - Mode Dropdown (REALITY / SCENARIO)
 * - Scenario Banner
 */
const TopBar: React.FC = () => {
    const { activeScenario, createScenario, exitScenario } = useScenario();
    const { asOf } = useTime();
    const { user, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleModeSelect = (mode: 'REALITY' | 'SCENARIO') => {
        if (mode === 'REALITY') {
            exitScenario();
        } else {
            // In a real app, this might open a modal to select or create a scenario.
            // For now, we'll just create a new one if none is active.
            if (!activeScenario) {
                createScenario("New Analysis");
            }
        }
        setIsDropdownOpen(false);
    };

    return (
        <div className="top-bar" style={{
            height: '64px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 var(--bar-padding-x)',
            backgroundColor: 'var(--surface-1)',
            justifyContent: 'space-between',
            zIndex: 1000,
            flexShrink: 0 // Prevent shrinking in flex container
        }}>
            {/* Left: Branding / Breadcrumbs (Placeholder) */}
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                AIP <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>/ Logistics Overview</span>
            </div>

            {/* Center: Scenario Banner (if active) */}
            {activeScenario && (
                <div style={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#FF9800',
                    color: '#1a1a1a',
                    padding: '4px 16px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                    <FlaskConical size={14} />
                    SCENARIO MODE — Hypothetical Changes Only
                </div>
            )}

            {/* Right: User Menu & Mode Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* User Menu */}
                {user && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 12px',
                        backgroundColor: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: 'var(--text-primary)'
                    }}>
                        <User size={14} />
                        <span>{user.displayName || user.email || 'User'}</span>
                        <button
                            onClick={logout}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontSize: '11px',
                                borderRadius: '3px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                                e.currentTarget.style.color = '#EF4444';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = 'var(--text-secondary)';
                            }}
                            title="Logout"
                        >
                            <LogOut size={12} />
                        </button>
                    </div>
                )}

                {/* Mode Switcher */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: activeScenario ? 'rgba(255, 152, 0, 0.1)' : 'var(--surface-2)',
                            border: `1px solid ${activeScenario ? '#FF9800' : 'var(--border)'}`,
                            borderRadius: '4px',
                            padding: '6px 12px',
                            color: activeScenario ? '#FF9800' : 'var(--text-primary)',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600
                        }}
                    >
                        {activeScenario ? <FlaskConical size={14} /> : <Globe size={14} />}
                        Mode: {activeScenario ? 'SCENARIO' : 'REALITY'}
                        <ChevronDown size={14} />
                    </button>

                    {isDropdownOpen && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '4px',
                            width: '200px',
                            backgroundColor: 'var(--surface-2)',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                            overflow: 'hidden'
                        }}>
                            <div
                                onClick={() => handleModeSelect('REALITY')}
                                style={{
                                    padding: '10px 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: 'pointer',
                                    backgroundColor: !activeScenario ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                                    color: 'var(--text-primary)',
                                    fontSize: '12px'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = !activeScenario ? 'rgba(255, 255, 255, 0.05)' : 'transparent'}
                            >
                                <Globe size={14} />
                                <div>
                                    <div style={{ fontWeight: 600 }}>REALITY</div>
                                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Live production data</div>
                                </div>
                            </div>
                            <div
                                onClick={() => handleModeSelect('SCENARIO')}
                                style={{
                                    padding: '10px 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: 'pointer',
                                    backgroundColor: activeScenario ? 'rgba(255, 152, 0, 0.1)' : 'transparent',
                                    color: activeScenario ? '#FF9800' : 'var(--text-primary)',
                                    fontSize: '12px',
                                    borderTop: '1px solid var(--border)'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 152, 0, 0.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = activeScenario ? 'rgba(255, 152, 0, 0.1)' : 'transparent'}
                            >
                                <FlaskConical size={14} />
                                <div>
                                    <div style={{ fontWeight: 600 }}>SCENARIO</div>
                                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Hypothetical sandbox</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TopBar;
