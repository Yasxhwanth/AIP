import React, { useState, useEffect } from 'react';
import { QueryClient } from '../../adapters/query/QueryClient';
import { WorkflowInstanceSummary, WorkflowStatus } from '../../execution/workflow-runtime-types';
import { IdentityContext } from '../../identity/IdentityContext';
import { GitBranch, Clock, CheckCircle, AlertCircle, Play } from 'lucide-react';

export const WorkflowDashboard: React.FC = () => {
    const [instances, setInstances] = useState<WorkflowInstanceSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real app, this would be reactive or polled
        const fetchInstances = () => {
            try {
                const context = IdentityContext.getInstance().getCurrentContext();
                const data = QueryClient.getWorkflowInstances(new Date(), context.tenant_id);
                setInstances(data);
            } catch (e) {
                console.error("Failed to fetch workflows", e);
            } finally {
                setLoading(false);
            }
        };

        fetchInstances();
        const interval = setInterval(fetchInstances, 5000); // Poll for updates
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status: WorkflowStatus) => {
        switch (status) {
            case WorkflowStatus.RUNNING: return '#60A5FA'; // blue-400
            case WorkflowStatus.COMPLETED: return '#34D399'; // green-400
            case WorkflowStatus.FAILED: return '#F87171'; // red-400
            case WorkflowStatus.WAITING: return '#FBBF24'; // yellow-400
            default: return '#9CA3AF'; // gray-400
        }
    };

    const getStatusIcon = (status: WorkflowStatus) => {
        switch (status) {
            case WorkflowStatus.RUNNING: return <Play size={16} />;
            case WorkflowStatus.COMPLETED: return <CheckCircle size={16} />;
            case WorkflowStatus.FAILED: return <AlertCircle size={16} />;
            case WorkflowStatus.WAITING: return <Clock size={16} />;
            default: return <GitBranch size={16} />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-bg-base text-primary overflow-hidden">
            {/* Header */}
            <div className="panel-header bg-surface-1 h-16 px-6 border-b border-border flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md flex items-center justify-center text-accent" style={{ backgroundColor: 'rgba(0, 102, 255, 0.1)' }}>
                        <GitBranch size={18} />
                    </div>
                    <div>
                        <div className="text-base font-bold">Workflow Operations</div>
                        <div className="text-xs text-secondary">Active workflow instances and status</div>
                    </div>
                </div>
                <div className="text-xs text-secondary">
                    {loading ? 'Updating...' : `Last updated: ${new Date().toLocaleTimeString()}`}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
                <div className="bg-surface-2 border border-border rounded-lg overflow-hidden">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Workflow ID</th>
                                <th>Definition</th>
                                <th>Status</th>
                                <th>Current Step</th>
                                <th>Started</th>
                                <th>Last Update</th>
                            </tr>
                        </thead>
                        <tbody>
                            {instances.map(instance => (
                                <tr key={instance.id}>
                                    <td className="font-mono text-accent">{instance.id}</td>
                                    <td>
                                        {instance.workflow_definition_id}
                                        <span className="ml-2 text-xs text-secondary px-2 py-1 bg-white/5 rounded">
                                            v{instance.workflow_version}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2" style={{ color: getStatusColor(instance.status) }}>
                                            {getStatusIcon(instance.status)}
                                            <span>{instance.status}</span>
                                        </div>
                                    </td>
                                    <td className="text-secondary">{instance.current_step_id}</td>
                                    <td className="text-secondary">{new Date(instance.started_at).toLocaleString()}</td>
                                    <td className="text-secondary">{new Date(instance.updated_at).toLocaleString()}</td>
                                </tr>
                            ))}
                            {instances.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-secondary italic">
                                        No active workflows found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
