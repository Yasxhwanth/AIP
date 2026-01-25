import React, { useState, useEffect } from 'react';
import { FlaskConical, Plus, X, GitMerge, AlertTriangle, CheckCircle2, History, Info } from 'lucide-react';
import { useScenario } from '../context/ScenarioContext';
import { useTime } from '../state/time/useTime';
import { ScenarioManager } from '../ontology/ScenarioManager';
import { ConflictReport } from '../ontology/scenario-types';

/**
 * ScenarioPanel
 * 
 * Redesigned as a premium "Branch Manager".
 * Handles sandboxed mutations, conflict detection, and promotion to truth.
 */
const ScenarioPanel: React.FC = () => {
    const { activeScenario, exitScenario, addMutation, mutations } = useScenario();
    const { asOf } = useTime();
    const [conflictReport, setConflictReport] = useState<ConflictReport | null>(null);
    const [isPromoting, setIsPromoting] = useState(false);
    const [promotionSuccess, setPromotionSuccess] = useState(false);

    useEffect(() => {
        if (activeScenario) {
            const report = ScenarioManager.detectConflicts(activeScenario.scenarioId);
            setConflictReport(report);
        }
    }, [activeScenario, mutations]);

    if (!activeScenario) return null;

    const handlePromote = async () => {
        setIsPromoting(true);
        try {
            // In a real system, this would be an async API call
            ScenarioManager.promoteScenario(activeScenario.scenarioId, 'SYSTEM_USER');
            setPromotionSuccess(true);
            setTimeout(() => {
                exitScenario();
            }, 2000);
        } catch (error) {
            console.error('Promotion failed', error);
        } finally {
            setIsPromoting(false);
        }
    };

    return (
        <div className="glass-panel animate-slide-in" style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 'var(--panel-radius)',
            overflow: 'hidden',
            border: '1px solid var(--warning)'
        }}>
            {/* Header */}
            <div className="panel-header" style={{ background: 'rgba(255, 159, 10, 0.1)', borderBottom: '1px solid var(--warning)' }}>
                <div className="flex items-center gap-2">
                    <FlaskConical size={16} className="text-warning" />
                    <span className="text-gradient" style={{ color: 'var(--warning)' }}>Branch Manager</span>
                    <div className="badge badge-warning" style={{ marginLeft: '8px' }}>Sandboxed</div>
                </div>
                <button onClick={exitScenario} className="btn-ghost"><X size={18} /></button>
            </div>

            {/* Branch Info */}
            <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>{activeScenario.description}</div>
                <div className="flex items-center gap-2 text-secondary" style={{ fontSize: '11px' }}>
                    <History size={12} />
                    <span>Branched from Truth @ {activeScenario.baseAsOfTime.toLocaleTimeString()}</span>
                </div>
            </div>

            {/* Conflict Status */}
            {conflictReport && conflictReport.conflicts.length > 0 && (
                <div style={{ padding: '12px 20px', background: 'rgba(255, 69, 58, 0.1)', borderBottom: '1px solid var(--danger)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <AlertTriangle size={18} className="text-danger" />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--danger)' }}>Conflicts Detected</div>
                        <div style={{ fontSize: '10px', color: 'var(--danger)', opacity: 0.8 }}>{conflictReport.conflicts.length} entities modified in Truth since branch.</div>
                    </div>
                </div>
            )}

            {/* Mutation List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                <div className="flex items-center justify-between mb-4">
                    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Staged Changes ({mutations.length})
                    </div>
                </div>

                {mutations.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Info size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                        <div style={{ fontSize: '13px' }}>No changes staged in this branch.</div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {mutations.map((m, i) => (
                            <div key={i} className="glass-card" style={{ padding: '12px' }}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="badge badge-accent">{m.mutationType}</span>
                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>#{m.sequence}</span>
                                </div>
                                <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>{m.targetEntityId}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '4px' }}>
                                    {JSON.stringify(m.proposedValue)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                    className="btn-secondary w-full"
                    onClick={() => addMutation('HUB-NY-01', 'STATUS_CHANGE', 'Degraded', asOf)}
                >
                    <Plus size={16} />
                    <span>Stage Test Mutation</span>
                </button>

                {promotionSuccess ? (
                    <div className="btn-primary w-full" style={{ background: 'var(--success)', boxShadow: 'none' }}>
                        <CheckCircle2 size={18} />
                        <span>Promoted to Truth</span>
                    </div>
                ) : (
                    <button
                        className="btn-primary w-full"
                        disabled={mutations.length === 0 || isPromoting}
                        onClick={handlePromote}
                        style={{ background: 'var(--warning)', boxShadow: '0 4px 12px var(--warning-glow)' }}
                    >
                        {isPromoting ? (
                            <div className="flex items-center gap-2">
                                <div className="animate-spin" style={{ width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} />
                                <span>Promoting...</span>
                            </div>
                        ) : (
                            <>
                                <GitMerge size={18} />
                                <span>Promote to Truth</span>
                            </>
                        )}
                    </button>
                )}

                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center' }}>
                    Promotion will permanently mutate the master ontology.
                </div>
            </div>
        </div>
    );
};

export default ScenarioPanel;
