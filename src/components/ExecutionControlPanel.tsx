import React, { useState, useEffect } from 'react';
import { executionManager } from '../execution/ExecutionManager';
import { ExecutionIntent, ExecutionStatus, ExecutionAttempt } from '../execution/execution-types';
import { AuthorityVisualizer } from './AuthorityVisualizer';
import { AuthorityStatus } from '../authority/authority-types';
import { useAIAdvisory } from '../context/AIAdvisoryContext';
import { Brain, Zap, Shield, Terminal, AlertCircle, CheckCircle2, Play, Activity } from 'lucide-react';

interface ExecutionControlPanelProps {
    intentId: string;
    actorId: string;
}

export const ExecutionControlPanel: React.FC<ExecutionControlPanelProps> = ({ intentId, actorId }) => {
    const [intent, setIntent] = useState<ExecutionIntent | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [lastAttempt, setLastAttempt] = useState<ExecutionAttempt | null>(null);
    const { invokeAI } = useAIAdvisory();

    useEffect(() => {
        loadIntent();
    }, [intentId]);

    const loadIntent = () => {
        try {
            const data = executionManager.getIntent(intentId);
            setIntent({ ...data }); // Clone to trigger re-render
        } catch (e: any) {
            setError(e.message);
        }
    };

    const handleDryRun = async () => {
        setLoading(true);
        setError(null);
        try {
            const attempt = await executionManager.runDryRun(intentId, actorId);
            setLastAttempt(attempt);
            setLogs(attempt.result.logs || []);
            loadIntent();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleExecute = async () => {
        setLoading(true);
        setError(null);
        try {
            executionManager.approveExecution(intentId, actorId);
            const attempt = await executionManager.executeRealRun(intentId, actorId);
            setLastAttempt(attempt);
            setLogs(attempt.result.logs || []);
            loadIntent();
        } catch (e: any) {
            setError(e.message);
            loadIntent();
        } finally {
            setLoading(false);
        }
    };

    const handleAskAI = () => {
        if (!intent) return;
        const isFailure = intent.status === ExecutionStatus.FAILED;
        const purpose = isFailure ? "Explain execution failure" : "Analyze dry-run risks";

        invokeAI(
            isFailure ? 'manual' : 'dry-run',
            purpose,
            {
                timestamp: new Date(),
                viewContext: isFailure ? 'manual' : 'dry-run',
                execution: {
                    intentId,
                    status: intent.status,
                    dryRunOutput: lastAttempt?.result,
                    errorCode: isFailure ? error || 'UNKNOWN_ERROR' : undefined,
                    errorMessage: isFailure ? lastAttempt?.result?.logs?.join('\n') : undefined,
                    impactedEntities: intent.targetEntities,
                    warnings: lastAttempt?.result?.logs?.filter(l => l.toLowerCase().includes('warning'))
                }
            }
        );
    };

    if (!intent) return <div className="p-8 text-center text-secondary">Loading intent...</div>;

    return (
        <div className="glass-panel animate-slide-in" style={{
            padding: '24px',
            borderRadius: 'var(--panel-radius)',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
        }}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center glow-accent">
                        <Zap size={20} fill="currentColor" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: 700 }} className="text-gradient">Execution Control</h2>
                        <div style={{ fontSize: '11px' }} className="text-secondary">Intent ID: {intent.intentId.slice(0, 8)}...</div>
                    </div>
                </div>
                <div className={`badge badge-${getStatusTheme(intent.status)}`}>
                    {intent.status}
                </div>
            </div>

            {/* Action Details */}
            <div className="glass-card" style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                    <div style={{ fontSize: '10px', fontWeight: 700 }} className="text-secondary uppercase mb-1">Action Type</div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{intent.actionType}</div>
                </div>
                <div>
                    <div style={{ fontSize: '10px', fontWeight: 700 }} className="text-secondary uppercase mb-1">Target Entities</div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{intent.targetEntities.length} Objects</div>
                </div>
            </div>

            {/* Authority Proof */}
            {lastAttempt?.executionAuthorityProofSnapshot && (
                <div className="glass-card" style={{ padding: '16px' }}>
                    <div className="flex items-center gap-2 mb-3">
                        <Shield size={14} className="text-accent" />
                        <span style={{ fontSize: '11px', fontWeight: 700 }} className="text-secondary uppercase">Authority Proof</span>
                    </div>
                    <AuthorityVisualizer
                        status={AuthorityStatus.ALLOWED}
                        proof={lastAttempt.executionAuthorityProofSnapshot}
                    />
                </div>
            )}

            {/* Error State */}
            {error && (
                <div style={{
                    padding: '12px 16px',
                    background: 'rgba(255, 69, 58, 0.1)',
                    border: '1px solid var(--danger)',
                    borderRadius: '8px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start'
                }}>
                    <AlertCircle size={18} className="text-danger" />
                    <div style={{ fontSize: '13px', color: 'var(--danger)' }}>
                        <div style={{ fontWeight: 700 }}>Execution Failed</div>
                        <div style={{ opacity: 0.8 }}>{error}</div>
                    </div>
                </div>
            )}

            {/* Console Output */}
            {logs.length > 0 && (
                <div style={{
                    background: '#000',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid var(--border)'
                }}>
                    <div className="flex items-center gap-2 mb-3 text-secondary" style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>
                        <Terminal size={12} />
                        <span>Execution Logs</span>
                    </div>
                    <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        color: '#10B981',
                        maxHeight: '160px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                    }}>
                        {logs.map((log, i) => (
                            <div key={i} className="flex gap-3">
                                <span style={{ opacity: 0.3 }}>{i + 1}</span>
                                <span>{log}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                    <button
                        className="btn-secondary flex-1"
                        onClick={handleDryRun}
                        disabled={loading || intent.status !== ExecutionStatus.PENDING}
                    >
                        {loading ? <Activity size={18} className="animate-spin" /> : <Play size={18} />}
                        <span>Simulate (Dry Run)</span>
                    </button>

                    <button
                        className="btn-primary flex-1"
                        onClick={handleExecute}
                        disabled={loading || intent.status !== ExecutionStatus.DRY_RUN_COMPLETED}
                        style={{ background: intent.status === ExecutionStatus.DRY_RUN_COMPLETED ? 'var(--danger)' : 'var(--accent)', boxShadow: 'none' }}
                    >
                        <CheckCircle2 size={18} />
                        <span>Commit to Truth</span>
                    </button>
                </div>

                {(intent.status === ExecutionStatus.DRY_RUN_COMPLETED || intent.status === ExecutionStatus.FAILED) && (
                    <button className="btn-secondary w-full" onClick={handleAskAI} style={{ borderStyle: 'dashed' }}>
                        <Brain size={18} className="text-accent" />
                        <span>Analyze with AI Advisor</span>
                    </button>
                )}
            </div>
        </div>
    );
};

function getStatusTheme(status: ExecutionStatus): string {
    switch (status) {
        case ExecutionStatus.PENDING: return 'warning';
        case ExecutionStatus.DRY_RUN_COMPLETED: return 'accent';
        case ExecutionStatus.EXECUTED: return 'success';
        case ExecutionStatus.FAILED: return 'danger';
        default: return 'muted';
    }
}
