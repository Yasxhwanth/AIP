import React, { useCallback, useState, useEffect } from 'react';
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
import { Database, Filter, Layers, Share2, Play, Plus, Loader2 } from 'lucide-react';
import { ApiClient } from '@/lib/apiClient';

const nodeStyles = "shadow-2xl rounded-lg bg-[#181C25] min-w-[220px] overflow-hidden font-sans border border-[#2B3B52]";
const headerStyles = "flex items-center justify-between px-3 py-2 border-b border-black/50";
const contentStyles = "p-3 bg-[#0D1017]";

const SourceNode = ({ data }: any) => (
    <div className={`${nodeStyles}`}>
        <div className={`${headerStyles} bg-cyan-900/30`}>
            <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-100">Source</div>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
        </div>
        <div className={contentStyles}>
            <div className="text-sm font-semibold text-slate-200 mb-1">{data.label}</div>
            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                <span className="text-cyan-400/70">{`{`}</span> {data.type} <span className="text-cyan-400/70">{`}`}</span>
            </div>
        </div>
        <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-cyan-500 border-2 border-[#181C25]" />
    </div>
);

const TransformNode = ({ data }: any) => (
    <div className={`${nodeStyles}`}>
        <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-yellow-500 border-2 border-[#181C25]" />
        <div className={`${headerStyles} bg-yellow-900/30`}>
            <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-yellow-500" />
                <div className="text-[10px] font-bold uppercase tracking-wider text-yellow-100">Transform</div>
            </div>
            <div className="text-[9px] font-mono text-yellow-500/50 bg-yellow-500/10 px-1.5 py-0.5 rounded">OP</div>
        </div>
        <div className={contentStyles}>
            <div className="text-sm font-semibold text-slate-200 mb-1.5">{data.label}</div>
            <div className="bg-[#181C25] border border-white/5 rounded px-2 py-1.5">
                <div className="text-[10px] text-yellow-400 font-mono tracking-tight leading-relaxed">{data.op}</div>
            </div>
        </div>
        <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-yellow-500 border-2 border-[#181C25]" />
    </div>
);

const OntologyNode = ({ data }: any) => (
    <div className={`${nodeStyles} ring-1 ring-purple-500/30`}>
        <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-purple-500 border-2 border-[#181C25]" />
        <div className={`${headerStyles} bg-gradient-to-r from-purple-900/40 to-[#181C25]`}>
            <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <div className="text-[10px] font-bold uppercase tracking-wider text-purple-200">Ontology Sink</div>
            </div>
        </div>
        <div className={contentStyles}>
            <div className="text-sm font-semibold text-white mb-1.5">{data.label}</div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-purple-500/10 border border-purple-500/20 rounded px-2 py-1">
                <span className="font-medium text-purple-300">Entity:</span>
                <span className="font-mono text-white">{data.entityType}</span>
            </div>
        </div>
    </div>
);

const nodeTypes = {
    source: SourceNode,
    transform: TransformNode,
    ontology: OntologyNode,
};

// ── Main Component ───────────────────────────────────────────────

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export const PipelineEditor: React.FC = () => {
    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);
    const [loading, setLoading] = useState(true);
    const [pipelineId, setPipelineId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Initial Load - For demo purposes we just grab the first pipeline, or create one if none exist
    useEffect(() => {
        let mounted = true;

        async function loadOrCreatePipeline() {
            try {
                const pipelines = await ApiClient.get<any[]>('/api/v1/pipelines');
                if (pipelines.length > 0) {
                    const pl = pipelines[0];
                    if (mounted) {
                        setPipelineId(pl.id);
                        if (pl.nodes?.length > 0) setNodes(pl.nodes);
                        if (pl.edges?.length > 0) setEdges(pl.edges);
                        setLoading(false);
                    }
                } else {
                    // Create demo pipeline to start
                    const demoNodes = [
                        { id: '1', type: 'source', data: { label: 'OpenSky live', type: 'REST_API' }, position: { x: 100, y: 100 } },
                        { id: '2', type: 'transform', data: { label: 'Filter Military', op: 'WHERE isMilitary = true' }, position: { x: 400, y: 100 } },
                        { id: '3', type: 'ontology', data: { label: 'Aircraft Registry', entityType: 'Aircraft' }, position: { x: 700, y: 100 } },
                    ];
                    const demoEdges = [
                        { id: 'e1-2', source: '1', target: '2' },
                        { id: 'e2-3', source: '2', target: '3' },
                    ];

                    const newPl = await ApiClient.post<any>('/api/v1/pipelines', {
                        name: 'Default Pipeline',
                        description: 'AIP Auto-generated Pipeline',
                        nodes: demoNodes,
                        edges: demoEdges
                    });

                    if (mounted) {
                        setPipelineId(newPl.id);
                        setNodes(demoNodes);
                        setEdges(demoEdges);
                        setLoading(false);
                    }
                }
            } catch (err) {
                console.error("Failed to load pipeline:", err);
                if (mounted) setLoading(false);
            }
        }

        loadOrCreatePipeline();

        return () => { mounted = false; };
    }, []);

    const handleSave = async () => {
        if (!pipelineId) return;
        setSaving(true);
        try {
            await ApiClient.put(`/api/v1/pipelines/${pipelineId}`, { nodes, edges });
        } catch (e) {
            console.error("Failed to save pipeline:", e);
        } finally {
            setSaving(false);
        }
    };

    const handleAddNode = () => {
        // A minimal helper to drop a new node in for the user to wire up
        const id = Date.now().toString();
        const newNode: Node = {
            id,
            type: 'transform',
            data: { label: 'New Transform', op: 'SELECT *' },
            position: { x: 400, y: 250 }
        };
        setNodes(nds => [...nds, newNode]);
    };

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

    if (loading) {
        return <div className="w-full h-full flex items-center justify-center bg-black/40"><Loader2 className="w-8 h-8 animate-spin text-cyan-500" /></div>;
    }

    return (
        <div className="flex flex-col w-full h-full bg-[#11141A] font-sans">
            {/* Top Toolbar */}
            <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 bg-[#181C25] shrink-0 z-20">
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
                    <span className="text-cyan-400">Tools</span>
                    <span className="hover:text-white cursor-pointer transition-colors">Layout</span>
                    <span className="hover:text-white cursor-pointer transition-colors">Undo/redo</span>
                    <span className="hover:text-white cursor-pointer transition-colors">Clean</span>
                    <span className="hover:text-white cursor-pointer transition-colors">Select</span>
                    <span className="hover:text-white cursor-pointer transition-colors">Color</span>
                    <span className="hover:text-white cursor-pointer transition-colors">Find</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleSave} disabled={saving} className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded text-[10px] font-bold flex items-center gap-2 shadow-lg transition-all border border-cyan-400/30">
                        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Share2 className="w-3 h-3" />}
                        {saving ? 'SAVING...' : 'SAVE PIPELINE'}
                    </button>
                    <button onClick={handleAddNode} className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded text-[10px] font-bold flex items-center gap-2 backdrop-blur-md transition-all border border-white/10">
                        <Plus className="w-3 h-3" /> ADD NODE
                    </button>
                    <button disabled className="bg-white/5 text-slate-500 px-3 py-1.5 rounded text-[10px] font-bold flex items-center gap-2 border border-white/5 cursor-not-allowed">
                        <Play className="w-3 h-3" /> DRY RUN
                    </button>
                </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex flex-1 overflow-hidden relative">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    fitView
                    className="flex-1 bg-[#090B0F]"
                >
                    <Background color="#1D283A" gap={24} size={2} />
                    <Controls showInteractive={false} className="border-white/10 fill-white/50" />
                </ReactFlow>

                {/* Right Panel - Legend matching screenshot */}
                <div className="w-64 border-l border-white/10 bg-[#161B22] flex-col hidden lg:flex shrink-0">
                    <div className="h-10 border-b border-white/5 flex items-center px-4 justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-4 bg-slate-700 rounded-sm"></div>
                            <span className="text-xs text-slate-300 font-medium tracking-wide">Custom color</span>
                        </div>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="text-[10px] font-semibold uppercase text-slate-500 tracking-widest border-b border-white/5 pb-2">Legend</div>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[10px] text-slate-300 font-medium">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#c59c88]"></div> GCSS-A (4)</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#c18696]"></div> LIW (14)</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#a484c1]"></div> FMS (54)</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#8799c4]"></div> TAPDB (196)</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#5176c1]"></div> DTMS (10)</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#5aa292]"></div> MEDPROS (25)</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#70aa5a]"></div> ATRRS (22)</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#97ad5a]"></div> DAPMIS (2)</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Data Table Pane */}
            <div className="h-[280px] border-t border-white/10 bg-[#161B22] flex flex-col shrink-0">
                <div className="flex border-b border-white/5 items-center justify-between text-xs font-semibold text-slate-400 bg-[#0F131A]">
                    <div className="flex items-center">
                        <button className="flex items-center gap-1.5 px-4 py-2 border-b-2 border-[#215EBE] text-white bg-white/5 transition-colors"><div className="w-3 h-3 bg-[#215EBE] rounded-sm"></div> Preview</button>
                        <button className="flex items-center gap-1.5 px-4 py-2 hover:text-slate-200 transition-colors">History</button>
                        <button className="flex items-center gap-1.5 px-4 py-2 hover:text-slate-200 transition-colors">Code</button>
                        <button className="flex items-center gap-1.5 px-4 py-2 hover:text-slate-200 transition-colors">Build timeline</button>
                        <button className="flex items-center gap-1.5 px-4 py-2 hover:text-slate-200 transition-colors">Data health</button>
                    </div>
                    <div className="px-4 text-[11px] text-amber-500">1 node selected</div>
                </div>

                <div className="flex items-center border-b border-white/5 px-4 py-2.5 justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                        <div className="w-3.5 h-3.5 bg-blue-500 rounded-sm shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div> Equipment Serial Number
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="hover:text-white cursor-pointer transition-colors">Showing all property types ▼</span>
                        <span className="hover:text-white cursor-pointer border-l border-white/10 pl-4 transition-colors">Showing 1000 of 116,534 objects</span>
                    </div>
                </div>

                <div className="flex-1 overflow-auto bg-[#090B0F]">
                    <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-[#1C232E] text-[10px] text-slate-400 uppercase tracking-wider sticky top-0 border-b border-white/10 shadow-sm">
                            <tr>
                                <th className="px-5 py-2.5 font-semibold">Classification</th>
                                <th className="px-5 py-2.5 font-semibold">Base</th>
                                <th className="px-5 py-2.5 font-semibold">Component</th>
                                <th className="px-5 py-2.5 font-semibold">Condition</th>
                                <th className="px-5 py-2.5 font-semibold">Control Unit Country</th>
                                <th className="px-5 py-2.5 font-semibold">Control Unit State</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {[1, 2, 3].map(i => (
                                <tr key={i} className="hover:bg-white/5 cursor-pointer transition-colors">
                                    <td className="px-5 py-3.5">-</td>
                                    <td className="px-5 py-3.5">HOHENFELS</td>
                                    <td className="px-5 py-3.5">Active</td>
                                    <td className="px-5 py-3.5"><span className="border border-emerald-500/40 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded shadow-sm">FMC</span></td>
                                    <td className="px-5 py-3.5">GERMANY</td>
                                    <td className="px-5 py-3.5">Unlisted</td>
                                </tr>
                            ))}
                            <tr className="hover:bg-white/5 cursor-pointer transition-colors">
                                <td className="px-5 py-3.5 text-slate-600 italic">No value</td>
                                <td className="px-5 py-3.5 text-slate-600 italic">No value</td>
                                <td className="px-5 py-3.5 text-slate-600 italic">No value</td>
                                <td className="px-5 py-3.5"><span className="border border-emerald-500/40 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded shadow-sm">FMC</span></td>
                                <td className="px-5 py-3.5 text-slate-600 italic">No value</td>
                                <td className="px-5 py-3.5 text-slate-600 italic">No value</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
