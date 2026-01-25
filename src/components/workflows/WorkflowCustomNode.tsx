import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import {
    Play,
    CheckSquare,
    UserCheck,
    GitFork,
    Brain,
    Zap,
    Clock,
    StopCircle,
    HelpCircle
} from 'lucide-react';
import { WorkflowNodeType } from '../../workflows/workflow-graph-types';

const getNodeIcon = (type: WorkflowNodeType) => {
    switch (type) {
        case WorkflowNodeType.START: return <Play size={16} className="text-green-400" />;
        case WorkflowNodeType.TASK: return <CheckSquare size={16} className="text-blue-400" />;
        case WorkflowNodeType.APPROVAL: return <UserCheck size={16} className="text-purple-400" />;
        case WorkflowNodeType.DECISION: return <GitFork size={16} className="text-orange-400" />;
        case WorkflowNodeType.AI_REVIEW: return <Brain size={16} className="text-pink-400" />;
        case WorkflowNodeType.ACTION: return <Zap size={16} className="text-yellow-400" />;
        case WorkflowNodeType.WAIT: return <Clock size={16} className="text-gray-400" />;
        case WorkflowNodeType.END: return <StopCircle size={16} className="text-red-400" />;
        default: return <HelpCircle size={16} className="text-gray-500" />;
    }
};

const getNodeStyle = (type: WorkflowNodeType) => {
    const baseStyle = "px-4 py-3 rounded-md shadow-lg border min-w-[150px] bg-[#1C1F24] transition-all duration-200";

    switch (type) {
        case WorkflowNodeType.START: return `${baseStyle} border-green-500/50 hover:border-green-500`;
        case WorkflowNodeType.END: return `${baseStyle} border-red-500/50 hover:border-red-500`;
        case WorkflowNodeType.AI_REVIEW: return `${baseStyle} border-pink-500/50 hover:border-pink-500 bg-pink-500/5`;
        case WorkflowNodeType.DECISION: return `${baseStyle} border-orange-500/50 hover:border-orange-500`;
        default: return `${baseStyle} border-[#2D3139] hover:border-[#0066FF]`;
    }
};

export const WorkflowCustomNode = memo(({ data, type, selected }: NodeProps) => {
    // We map the reactflow type to our internal WorkflowNodeType if possible, 
    // or rely on data.type if we store it there. 
    // For this implementation, we'll assume the 'type' prop passed to the custom node 
    // might be 'custom', so we look at data.nodeType.
    const nodeType = data.nodeType as WorkflowNodeType || WorkflowNodeType.TASK;

    return (
        <div className={`${getNodeStyle(nodeType)} ${selected ? 'ring-2 ring-[#0066FF] ring-offset-2 ring-offset-[#0A0B0D]' : ''}`}>
            {nodeType !== WorkflowNodeType.START && (
                <Handle type="target" position={Position.Top} className="!bg-[#484F58] !w-3 !h-3" />
            )}

            <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-[#0A0B0D] border border-[#2D3139]">
                    {getNodeIcon(nodeType)}
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#E1E4E8] uppercase tracking-wider">{nodeType}</span>
                    <span className="text-sm text-[#8B949E] font-medium truncate max-w-[120px]">{data.label}</span>
                </div>
            </div>

            {nodeType !== WorkflowNodeType.END && (
                <Handle type="source" position={Position.Bottom} className="!bg-[#484F58] !w-3 !h-3" />
            )}
        </div>
    );
});
