import React, { useState, useEffect } from 'react';
import { QueryClient } from '../../adapters/query/QueryClient';
import { WorkflowStepTask, WorkflowTaskStatus } from '../../execution/workflow-runtime-types';
import { IdentityContext } from '../../identity/IdentityContext';
import { workflowEngine } from '../../execution/WorkflowEngine';
import { CheckCircle, XCircle, Clock, FileText, Shield, User } from 'lucide-react';

export const MyTasksPanel: React.FC = () => {
    const [tasks, setTasks] = useState<WorkflowStepTask[]>([]);
    const [selectedTask, setSelectedTask] = useState<WorkflowStepTask | null>(null);
    const [justification, setJustification] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTasks = () => {
        try {
            const context = IdentityContext.getInstance().getCurrentContext();
            // Assuming current user is 'user-1' for now as per mock data
            // In real app, use context.actor_id
            const actorId = 'user-1';
            const data = QueryClient.getMyWorkflowTasks(new Date(), actorId, context.tenant_id);
            setTasks(data);
        } catch (e) {
            console.error("Failed to fetch tasks", e);
        }
    };

    useEffect(() => {
        fetchTasks();
        const interval = setInterval(fetchTasks, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleDecision = async (decision: 'APPROVE' | 'REJECT') => {
        if (!selectedTask) return;
        if (!justification.trim()) {
            setError('Justification is required for all decisions.');
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            const context = IdentityContext.getInstance().getCurrentContext();
            workflowEngine.completeHumanTask({
                taskId: selectedTask.id,
                decision,
                justification,
                actorId: 'user-1' // Mock actor ID
            });

            // Refresh list and clear selection
            fetchTasks();
            setSelectedTask(null);
            setJustification('');
        } catch (e: any) {
            setError(e.message || 'Failed to submit decision');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100%', overflow: 'hidden', backgroundColor: 'var(--background)', color: 'var(--text-primary)' }}>
            {/* Task List */}
            <div style={{
                width: '320px',
                borderRight: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'var(--surface-1)'
            }}>
                <div style={{
                    padding: '16px',
                    borderBottom: '1px solid var(--border)',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--text-secondary)',
                    letterSpacing: '0.05em',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle size={16} color="var(--accent)" />
                        My Tasks
                    </div>
                    <span style={{
                        backgroundColor: 'rgba(0, 102, 255, 0.1)',
                        color: 'var(--accent)',
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '999px'
                    }}>
                        {tasks.length}
                    </span>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {tasks.length === 0 && (
                        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px', fontStyle: 'italic' }}>
                            No pending tasks.
                        </div>
                    )}
                    {tasks.map(task => (
                        <div
                            key={task.id}
                            onClick={() => setSelectedTask(task)}
                            style={{
                                padding: '16px',
                                borderBottom: '1px solid var(--border)',
                                cursor: 'pointer',
                                backgroundColor: selectedTask?.id === task.id ? 'rgba(0, 102, 255, 0.05)' : 'transparent',
                                borderLeft: selectedTask?.id === task.id ? '3px solid var(--accent)' : '3px solid transparent',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                <span style={{ fontWeight: 600, fontSize: '13px', color: selectedTask?.id === task.id ? 'var(--accent)' : 'var(--text-primary)' }}>{task.step_id}</span>
                                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Clock size={10} />
                                    {new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
                                {task.workflow_instance_id}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '10px', backgroundColor: 'var(--surface-2)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                                    {task.step_type}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Task Detail */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--background)' }}>
                {selectedTask ? (
                    <>
                        <div style={{
                            padding: '24px',
                            borderBottom: '1px solid var(--border)',
                            backgroundColor: 'var(--surface-1)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                <Shield size={14} /> Authority Required: APPROVE_WORKFLOW_TASK
                            </div>
                            <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>{selectedTask.step_id}</h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={14} /> Workflow: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{selectedTask.workflow_instance_id}</span></span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} /> Assigned to you</span>
                            </div>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                            {/* Context Snapshot */}
                            <div style={{
                                backgroundColor: 'var(--surface-2)',
                                borderRadius: '8px',
                                padding: '16px',
                                border: '1px solid var(--border)',
                                marginBottom: '24px'
                            }}>
                                <h3 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>Context Snapshot</h3>
                                {selectedTask.context_snapshot ? (
                                    <pre style={{
                                        fontSize: '12px',
                                        fontFamily: 'var(--font-mono)',
                                        color: '#A3E635', // Lime green for code
                                        backgroundColor: 'rgba(0,0,0,0.3)',
                                        padding: '16px',
                                        borderRadius: '4px',
                                        overflow: 'auto',
                                        maxHeight: '240px',
                                        border: '1px solid var(--border)'
                                    }}>
                                        {JSON.stringify(selectedTask.context_snapshot, null, 2)}
                                    </pre>
                                ) : (
                                    <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '13px' }}>No context snapshot available.</div>
                                )}
                            </div>

                            {/* Decision Input */}
                            <div style={{
                                backgroundColor: 'var(--surface-2)',
                                borderRadius: '8px',
                                padding: '16px',
                                border: '1px solid var(--border)'
                            }}>
                                <h3 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>Decision</h3>

                                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Justification (Required)</label>
                                <textarea
                                    style={{
                                        width: '100%',
                                        backgroundColor: 'var(--bg-base)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '4px',
                                        padding: '12px',
                                        fontSize: '14px',
                                        color: 'var(--text-primary)',
                                        minHeight: '100px',
                                        marginBottom: '16px',
                                        fontFamily: 'inherit',
                                        resize: 'vertical'
                                    }}
                                    placeholder="Explain your decision..."
                                    value={justification}
                                    onChange={e => setJustification(e.target.value)}
                                />

                                {error && (
                                    <div style={{
                                        backgroundColor: 'rgba(248, 113, 113, 0.1)',
                                        border: '1px solid rgba(248, 113, 113, 0.3)',
                                        color: '#F87171',
                                        padding: '12px',
                                        borderRadius: '4px',
                                        marginBottom: '16px',
                                        fontSize: '13px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <AlertCircle size={16} />
                                        {error}
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        onClick={() => handleDecision('APPROVE')}
                                        disabled={processing}
                                        style={{
                                            flex: 1,
                                            backgroundColor: '#059669', // Emerald 600
                                            color: 'white',
                                            padding: '10px',
                                            borderRadius: '4px',
                                            fontWeight: 600,
                                            fontSize: '14px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            opacity: processing ? 0.5 : 1,
                                            cursor: processing ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        <CheckCircle size={18} />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleDecision('REJECT')}
                                        disabled={processing}
                                        style={{
                                            flex: 1,
                                            backgroundColor: '#DC2626', // Red 600
                                            color: 'white',
                                            padding: '10px',
                                            borderRadius: '4px',
                                            fontWeight: 600,
                                            fontSize: '14px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            opacity: processing ? 0.5 : 1,
                                            cursor: processing ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        <XCircle size={18} />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', gap: '16px' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircle size={32} color="var(--text-muted)" />
                        </div>
                        <p style={{ fontSize: '14px' }}>Select a task to view details and take action.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper for error display
import { AlertCircle } from 'lucide-react';
