import React, { useState } from 'react';
import { WorkflowList } from './workflows/WorkflowList';
import { WorkflowCanvasWrapper } from './workflows/WorkflowCanvas';

export const WorkflowManager: React.FC = () => {
    // Simple state-based routing for now
    const [view, setView] = useState<'list' | 'canvas'>('list');
    const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);

    const handleOpenCanvas = (id: string) => {
        setSelectedWorkflowId(id);
        setView('canvas');
    };

    const handleBackToList = () => {
        setView('list');
        setSelectedWorkflowId(null);
    };

    if (view === 'canvas') {
        return (
            <div className="flex flex-col h-full">
                <div className="h-12 bg-surface-1 border-b border-border flex items-center px-4 gap-4">
                    <button onClick={handleBackToList} className="text-secondary hover:text-primary text-sm">
                        ← Back to Workflows
                    </button>
                    <div className="h-4 w-px bg-border" />
                    <span className="font-bold text-sm">Workflow Editor</span>
                </div>
                <div className="flex-1 overflow-hidden">
                    <WorkflowCanvasWrapper workflowId={selectedWorkflowId || undefined} />
                </div>
            </div>
        );
    }

    return <WorkflowList onOpenCanvas={handleOpenCanvas} />;
};
