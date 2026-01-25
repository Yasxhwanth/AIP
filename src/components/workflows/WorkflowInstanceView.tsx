import React from 'react';
import { WorkflowInstanceSummary, WorkflowStepTask, WorkflowTaskStatus } from '../../execution/workflow-runtime-types';
import { CheckCircle, Circle, XCircle, Clock, User } from 'lucide-react';

interface WorkflowInstanceViewProps {
    instance: WorkflowInstanceSummary;
    tasks: WorkflowStepTask[];
}

export const WorkflowInstanceView: React.FC<WorkflowInstanceViewProps> = ({ instance, tasks }) => {
    return (
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">Workflow: {instance.id}</h3>
                <span className={`px-2 py-1 rounded text-xs font-bold ${instance.status === 'COMPLETED' ? 'bg-green-900 text-green-400' :
                        instance.status === 'FAILED' ? 'bg-red-900 text-red-400' :
                            'bg-blue-900 text-blue-400'
                    }`}>
                    {instance.status}
                </span>
            </div>
            <div className="space-y-3">
                {tasks.map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-2 bg-gray-900 rounded border border-gray-800">
                        {task.status === WorkflowTaskStatus.COMPLETED ? <CheckCircle size={16} className="text-green-500" /> :
                            task.status === WorkflowTaskStatus.REJECTED ? <XCircle size={16} className="text-red-500" /> :
                                <Clock size={16} className="text-blue-500" />}
                        <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-200">{task.step_id}</div>
                            <div className="text-xs text-gray-500">{task.step_type}</div>
                        </div>
                        {task.assigned_actor_id && (
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                <User size={12} />
                                {task.assigned_actor_id}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
