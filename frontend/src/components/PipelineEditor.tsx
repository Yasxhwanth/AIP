import React, { useCallback, useState } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    Node,
    Edge,
    Connection,
    EdgeChange,
    NodeChange,
    Handle,
    Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Database, Filter, Layers, Share2, Play } from 'lucide-react';

// ── Custom Node Components ───────────────────────────────────────

const SourceNode = ({ data }: any) => (
    <div className="px-4 py-2 shadow-md rounded-md bg-zinc-900 border-2 border-cyan-500 text-white w-48">
        <div className="flex items-center border-b border-white/10 pb-2 mb-2">
            <Database className="w-4 h-4 mr-2 text-cyan-400" />
            <div className="text-xs font-bold uppercase tracking-tighter">Source</div>
        </div>
        <div className="text-[10px] opacity-70 mb-1">{data.label}</div>
        <div className="text-[9px] text-cyan-300 font-mono">{data.type}</div>
        <Handle type="source" position={Position.Right} className="w-2 h-2 bg-cyan-500" />
    </div>
);

const TransformNode = ({ data }: any) => (
    <div className="px-4 py-2 shadow-md rounded-md bg-zinc-900 border-2 border-yellow-500 text-white w-48">
        <Handle type="target" position={Position.Left} className="w-2 h-2 bg-yellow-500" />
        <div className="flex items-center border-b border-white/10 pb-2 mb-2">
            <Filter className="w-4 h-4 mr-2 text-yellow-400" />
            <div className="text-xs font-bold uppercase tracking-tighter">Transform</div>
        </div>
        <div className="text-[10px] opacity-70 mb-1">{data.label}</div>
        <div className="text-[9px] text-yellow-300 font-mono">{data.op}</div>
        <Handle type="source" position={Position.Right} className="w-2 h-2 bg-yellow-500" />
    </div>
);

const OntologyNode = ({ data }: any) => (
    <div className="px-4 py-2 shadow-md rounded-md bg-zinc-900 border-2 border-purple-500 text-white w-48">
        <Handle type="target" position={Position.Left} className="w-2 h-2 bg-purple-500" />
        <div className="flex items-center border-b border-white/10 pb-2 mb-2">
            <Layers className="w-4 h-4 mr-2 text-purple-400" />
            <div className="text-xs font-bold uppercase tracking-tighter">Ontology</div>
        </div>
        <div className="text-[10px] opacity-80 mb-1">{data.label}</div>
        <div className="text-[9px] text-purple-300 font-mono">Target: {data.entityType}</div>
    </div>
);

const nodeTypes = {
    source: SourceNode,
    transform: TransformNode,
    ontology: OntologyNode,
};

// ── Main Component ───────────────────────────────────────────────

const initialNodes: Node[] = [
    {
        id: '1',
        type: 'source',
        data: { label: 'OpenSky live', type: 'REST_API' },
        position: { x: 100, y: 100 }
    },
    {
        id: '2',
        type: 'transform',
        data: { label: 'Filter Military', op: 'WHERE isMilitary = true' },
        position: { x: 400, y: 100 }
    },
    {
        id: '3',
        type: 'ontology',
        data: { label: 'Aircraft Registry', entityType: 'Aircraft' },
        position: { x: 700, y: 100 }
    },
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3' },
];

export const PipelineEditor: React.FC = () => {
    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );
    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );
    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        []
    );

    return (
        <div className="w-full h-full bg-black/40 relative">
            <div className="absolute top-4 left-4 z-10 flex gap-2">
                <button className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded text-[10px] font-bold flex items-center gap-2 shadow-lg transition-all border border-cyan-400/30">
                    <Share2 className="w-3 h-3" /> SAVE PIPELINE
                </button>
                <button className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded text-[10px] font-bold flex items-center gap-2 backdrop-blur-md transition-all border border-white/10">
                    <Play className="w-3 h-3 text-green-400" /> DRY RUN
                </button>
            </div>

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
            >
                <Background color="#333" gap={16} />
                <Controls showInteractive={false} />
                <MiniMap nodeStrokeColor={() => '#333'} nodeColor={(n) => {
                    if (n.type === 'source') return '#00cfd5';
                    if (n.type === 'transform') return '#facc15';
                    if (n.type === 'ontology') return '#a855f7';
                    return '#eee';
                }} />
            </ReactFlow>

            {/* Grid Overlay Vibe */}
            <div className="absolute inset-0 pointer-events-none border border-white/5 opacity-50"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        </div>
    );
};
