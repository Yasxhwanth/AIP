import React from 'react';
import { Node } from 'reactflow';

interface WorkflowNodeInspectorProps {
    node: Node;
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
}

export const WorkflowNodeInspector: React.FC<WorkflowNodeInspectorProps> = ({ node, setNodes }) => {
    const onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = evt.target;
        setNodes((nds) =>
            nds.map((n) => {
                if (n.id === node.id) {
                    return {
                        ...n,
                        data: {
                            ...n.data,
                            [name]: value,
                        },
                    };
                }
                return n;
            })
        );
    };

    return (
        <div className="p-4 flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase text-secondary">Node Inspector</h3>
            <div className="flex flex-col gap-2">
                <label className="text-xs text-secondary">Label</label>
                <input
                    type="text"
                    name="label"
                    value={node.data.label}
                    onChange={onChange}
                    className="bg-surface-2 border border-border rounded p-2 text-sm text-primary"
                />
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-xs text-secondary">ID</label>
                <input
                    type="text"
                    value={node.id}
                    disabled
                    className="bg-surface-2 border border-border rounded p-2 text-sm text-secondary cursor-not-allowed"
                />
            </div>
            {/* Add more fields as needed based on node type */}
        </div>
    );
};
