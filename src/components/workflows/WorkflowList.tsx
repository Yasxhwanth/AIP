import React from 'react';
import { GitBranch, Plus } from 'lucide-react';

// Mock data for now
const mockWorkflows = [
    { id: '1', name: 'Document Approval', version: 1, status: 'PUBLISHED', updated_at: new Date() },
    { id: '2', name: 'Incident Response', version: 3, status: 'DRAFT', updated_at: new Date() },
];

interface WorkflowListProps {
    onOpenCanvas: (id: string) => void;
}

export const WorkflowList: React.FC<WorkflowListProps> = ({ onOpenCanvas }) => {
    return (
        <div className="flex flex-col h-full bg-bg-base text-primary">
            <div className="panel-header bg-surface-1 h-16 px-6 border-b border-border flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md flex items-center justify-center text-accent" style={{ backgroundColor: 'rgba(0, 102, 255, 0.1)' }}>
                        <GitBranch size={18} />
                    </div>
                    <div>
                        <div className="text-base font-bold">Workflows</div>
                        <div className="text-xs text-secondary">Manage and design workflows</div>
                    </div>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => onOpenCanvas('new')}
                >
                    <Plus size={16} />
                    New Workflow
                </button>
            </div>

            <div className="flex-1 overflow-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mockWorkflows.map(workflow => (
                        <div
                            key={workflow.id}
                            className="card cursor-pointer hover:border-accent transition-colors"
                            onClick={() => onOpenCanvas(workflow.id)}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold">{workflow.name}</h3>
                                <span className={`text-xs px-2 py-1 rounded ${workflow.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                                    }`}>
                                    {workflow.status}
                                </span>
                            </div>
                            <div className="text-xs text-secondary mb-4">
                                Version {workflow.version} • Updated {workflow.updated_at.toLocaleDateString()}
                            </div>
                            <div className="flex justify-end">
                                <button className="text-accent text-sm font-medium hover:underline">
                                    Open Editor
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
