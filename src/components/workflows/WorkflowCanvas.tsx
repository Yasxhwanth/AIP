import React, { useCallback, useState, useMemo, useEffect } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    NodeTypes,
    ReactFlowProvider,
    Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import { WorkflowNode, WorkflowNodeType } from '../../workflows/workflow-graph-types';
import { WorkflowNodeInspector } from './WorkflowNodeInspector';
import { WorkflowCustomNode } from './WorkflowCustomNode';
import { workflowDefinitionStore } from '../../ontology/definition/WorkflowDefinitionStore';
import { ontologySnapshotResolver } from '../../ontology/definition/OntologySnapshotResolver';
import { DomainEventType } from '../../ontology/event-types';
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

const initialNodes: Node[] = [
    {
        id: '1',
        position: { x: 250, y: 100 },
        data: { label: 'Start Process', nodeType: WorkflowNodeType.START },
        type: 'custom'
    },
];
const initialEdges: Edge[] = [];

interface WorkflowCanvasProps {
    workflowId: string | null;
}

const getNodeIcon = (type: WorkflowNodeType) => {
    switch (type) {
        case WorkflowNodeType.START: return <Play size={14} />;
        case WorkflowNodeType.TASK: return <CheckSquare size={14} />;
        case WorkflowNodeType.APPROVAL: return <UserCheck size={14} />;
        case WorkflowNodeType.DECISION: return <GitFork size={14} />;
        case WorkflowNodeType.AI_REVIEW: return <Brain size={14} />;
        case WorkflowNodeType.ACTION: return <Zap size={14} />;
        case WorkflowNodeType.WAIT: return <Clock size={14} />;
        case WorkflowNodeType.END: return <StopCircle size={14} />;
        default: return <HelpCircle size={14} />;
    }
};

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ workflowId }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null);

    const nodeTypes = useMemo(() => ({ custom: WorkflowCustomNode }), []);

    // Load workflow if ID provided
    useEffect(() => {
        if (workflowId && workflowId !== currentWorkflowId) {
            const workflow = workflowDefinitionStore.getWorkflowDefinition(workflowId as any);
            if (workflow) {
                // Convert graph to ReactFlow format
                const flowNodes = workflow.graph.nodes.map(node => ({
                    id: node.id,
                    type: 'custom',
                    position: node.position,
                    data: { label: node.label, nodeType: node.type }
                }));
                const flowEdges = workflow.graph.edges.map(edge => ({
                    id: edge.id,
                    source: edge.from,
                    target: edge.to,
                    label: edge.condition,
                    animated: true,
                    style: { stroke: '#484F58', strokeWidth: 2 }
                }));
                setNodes(flowNodes);
                setEdges(flowEdges);
                setCurrentWorkflowId(workflowId);
            }
        }
    }, [workflowId, currentWorkflowId, setNodes, setEdges]);

    const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#484F58', strokeWidth: 2 } }, eds)), [setEdges]);

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, []);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow') as WorkflowNodeType;

            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = {
                x: event.clientX - 200, // Adjust for sidebar
                y: event.clientY - 64,  // Adjust for header
            };

            const newNode: Node = {
                id: `${type}-${nodes.length + 1}`,
                type: 'custom',
                position,
                data: { label: `New ${type}`, nodeType: type },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [nodes, setNodes]
    );

    const onSave = () => {
        console.log('Saving workflow:', workflowId);
        
        // Convert ReactFlow format back to WorkflowGraph
        const graphNodes: WorkflowNode[] = nodes.map(node => ({
            id: node.id,
            type: node.data.nodeType || WorkflowNodeType.TASK,
            label: node.data.label || node.id,
            position: node.position,
            config: node.data.config || {}
        }));

        const graphEdges = edges.map(edge => ({
            id: edge.id,
            from: edge.source,
            to: edge.target,
            condition: (edge.label as string) || undefined
        }));

        if (workflowId) {
            // Update existing workflow
            const workflow = workflowDefinitionStore.getWorkflowDefinition(workflowId as any);
            if (workflow) {
                workflow.graph.nodes = graphNodes;
                workflow.graph.edges = graphEdges;
                console.log('Updated workflow:', workflow.id);
            }
        } else {
            // Create new workflow
            const tenantId = 'tenant-1'; // TODO: Get from context
            const snapshot = ontologySnapshotResolver.resolveActiveSnapshot(new Date(), tenantId);
            
            const newWorkflow = workflowDefinitionStore.createWorkflowDefinition(
                tenantId,
                snapshot.ontology_version_id,
                `workflow_${Date.now()}`,
                'New Workflow',
                {
                    event_type: DomainEventType.ADMISSION_CASE_CREATED,
                    condition: {}
                },
                {
                    id: crypto.randomUUID(),
                    tenant_id: tenantId,
                    version: 1,
                    created_at: new Date(),
                    nodes: graphNodes,
                    edges: graphEdges
                },
                'system'
            );
            console.log('Created workflow:', newWorkflow.id);
            setCurrentWorkflowId(newWorkflow.id);
        }
    };

    return (
        <div className="flex h-full w-full relative" style={{ height: '100%', width: '100%', display: 'flex', position: 'relative' }}>
            <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button className="btn-secondary bg-surface-1 shadow-lg" onClick={onSave}>
                    Save Version
                </button>
            </div>
            <div className="flex-1 h-full" style={{ flex: 1, height: '100%', width: '100%' }} onDragOver={onDragOver} onDrop={onDrop}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    onPaneClick={onPaneClick}
                    nodeTypes={nodeTypes}
                    fitView
                    style={{ backgroundColor: '#0A0B0D' }}
                >
                    <Controls style={{ backgroundColor: '#14161A', border: '1px solid #2D3139', borderRadius: '4px' }} />
                    <MiniMap style={{ backgroundColor: '#14161A', border: '1px solid #2D3139' }} nodeColor="#2D3139" maskColor="rgba(0,0,0,0.6)" />
                    <Background gap={20} size={1} color="#2D3139" />
                    <Panel position="top-left" className="bg-surface-1 p-2 rounded border border-border" style={{ backgroundColor: '#14161A', padding: '12px', borderRadius: '8px', border: '1px solid #2D3139', color: '#E1E4E8', width: '160px' }}>
                        <div className="text-xs font-bold mb-3 text-[#8B949E] uppercase tracking-wider">Node Library</div>
                        <div className="flex flex-col gap-2">
                            {Object.values(WorkflowNodeType).map((type) => (
                                <div
                                    key={type}
                                    className="flex items-center gap-3 p-2 rounded cursor-grab hover:bg-[#1C1F24] transition-colors border border-transparent hover:border-[#2D3139]"
                                    style={{ backgroundColor: '#1C1F24', border: '1px solid #2D3139', padding: '8px', marginBottom: '4px', cursor: 'grab' }}
                                    onDragStart={(event) => event.dataTransfer.setData('application/reactflow', type)}
                                    draggable
                                >
                                    <div className="text-[#0066FF] opacity-80">
                                        {getNodeIcon(type)}
                                    </div>
                                    <span className="text-xs font-medium">{type}</span>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </ReactFlow>
            </div>
            {selectedNode && (
                <div className="w-80 border-l border-border bg-surface-1" style={{ width: '320px', borderLeft: '1px solid #2D3139', backgroundColor: '#14161A' }}>
                    <WorkflowNodeInspector node={selectedNode} setNodes={setNodes} />
                </div>
            )}
        </div>
    );
};

export const WorkflowCanvasWrapper: React.FC<{ workflowId?: string }> = ({ workflowId }) => (
    <ReactFlowProvider>
        <WorkflowCanvas workflowId={workflowId || null} />
    </ReactFlowProvider>
);
