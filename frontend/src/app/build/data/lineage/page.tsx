"use client";
import { useState, useCallback, useEffect } from "react";
import ReactFlow, { Background, Controls, MarkerType, Node, Edge } from "reactflow";
import "reactflow/dist/style.css";
import { GitMerge, Search, Layers, Database, ArrowRight, PlayCircle } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const nodeTypes = {
    entityType: ({ data }: any) => (
        <div className="bg-white border-2 border-indigo-500 rounded-lg shadow-md min-w-[180px]">
            <div className="bg-indigo-50 px-3 py-1.5 border-b border-indigo-100 rounded-t-md flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-[10px] uppercase tracking-wider">
                    <Database className="w-3 h-3" /> Entity Type
                </div>
            </div>
            <div className="p-3 text-center">
                <div className="font-bold text-gray-900 text-sm">{data.label}</div>
            </div>
        </div>
    ),
    pipeline: ({ data }: any) => (
        <div className="bg-white border hover:border-blue-500 border-gray-200 rounded-lg shadow-sm min-w-[180px] transition-colors">
            <div className="bg-gray-50 px-3 py-1.5 border-b border-gray-100 rounded-t-md flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-gray-500 font-bold text-[10px] uppercase tracking-wider">
                    <GitMerge className="w-3 h-3" /> Data Pipeline
                </div>
            </div>
            <div className="p-3">
                <div className="font-bold text-gray-800 text-xs">{data.label}</div>
            </div>
        </div>
    )
};

export default function LineagePage() {
    const [search, setSearch] = useState("");
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [loading, setLoading] = useState(false);
    const [runs, setRuns] = useState<any[]>([]);

    const loadLineage = async (entityName: string) => {
        if (!entityName) return;
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/lineage/${entityName}`).then(r => r.json());
            setRuns(res.recentRuns || []);

            const newNodes: Node[] = [];
            const newEdges: Edge[] = [];

            // Center Entity
            newNodes.push({
                id: `entity-${entityName}`,
                type: "entityType",
                position: { x: 400, y: 200 },
                data: { label: entityName }
            });

            // Upstream Pipelines (Writes TO entity)
            res.upstreamPipelines?.forEach((p: any, i: number) => {
                const id = `pipe-${p.id}`;
                newNodes.push({
                    id, type: "pipeline",
                    position: { x: 50, y: 100 + i * 100 },
                    data: { label: p.name }
                });
                newEdges.push({
                    id: `e-${id}-entity`,
                    source: id, target: `entity-${entityName}`,
                    animated: true,
                    style: { stroke: "#6366f1", strokeWidth: 2 },
                    markerEnd: { type: MarkerType.ArrowClosed, color: "#6366f1" }
                });
            });

            // Downstream Pipelines (Reads FROM entity)
            res.downstreamPipelines?.forEach((p: any, i: number) => {
                const id = `pipe-${p.id}`;
                newNodes.push({
                    id, type: "pipeline",
                    position: { x: 750, y: 100 + i * 100 },
                    data: { label: p.name }
                });
                newEdges.push({
                    id: `e-entity-${id}`,
                    source: `entity-${entityName}`, target: id,
                    animated: true,
                    style: { stroke: "#3b82f6", strokeWidth: 2, strokeDasharray: "5,5" },
                    markerEnd: { type: MarkerType.ArrowClosed, color: "#3b82f6" }
                });
            });

            setNodes(newNodes);
            setEdges(newEdges);
        } catch (e) { }
        setLoading(false);
    };

    return (
        <div className="flex h-[calc(100vh-48px)] bg-gray-50 flex-col">
            {/* Topbar */}
            <div className="h-14 bg-white border-b border-gray-200 flex items-center px-6 gap-6 shadow-sm z-10">
                <div className="flex items-center gap-2 text-indigo-600 font-bold">
                    <Layers className="w-5 h-5" /> Data Lineage
                </div>

                <div className="flex items-center bg-gray-100 rounded-lg px-3 py-1.5 w-80 focus-within:ring-2 ring-indigo-500/20">
                    <Search className="w-4 h-4 text-gray-400 mr-2" />
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && loadLineage(search)}
                        placeholder="Search EntityType (e.g. Drone)..."
                        className="bg-transparent border-none outline-none text-sm w-full font-medium"
                    />
                </div>
                <button onClick={() => loadLineage(search)} disabled={!search || loading}
                    className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50">
                    Explore Graph
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* ReactFlow Canvas */}
                <div className="flex-1 h-full relative border-r border-gray-200">
                    {nodes.length > 0 ? (
                        <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView minZoom={0.5} maxZoom={1.5}>
                            <Background gap={16} size={1} color="#e5e7eb" />
                            <Controls className="bg-white shadow-md border border-gray-200 rounded-md overflow-hidden [&>button]:border-gray-100" />
                        </ReactFlow>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                            <GitMerge className="w-16 h-16 opacity-20 mb-4" />
                            <div className="font-bold text-gray-500">Search for an Entity Type to view its provenance graph.</div>
                            <div className="text-sm mt-1">See which pipelines generate the data, and which pipelines consume it.</div>
                        </div>
                    )}
                </div>

                {/* Right Sidebar: Run History */}
                {nodes.length > 0 && (
                    <div className="w-72 bg-white flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-gray-100 font-bold text-sm text-gray-800 flex items-center gap-2">
                            <PlayCircle className="w-4 h-4 text-indigo-600" /> Recent Writes
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {runs.map(r => (
                                <div key={r.id} className="text-xs border border-gray-200 rounded-lg p-3 hover:bg-gray-50 bg-white shadow-sm">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[9px] uppercase tracking-widest ${r.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {r.status}
                                        </span>
                                        <span className="text-gray-400 font-medium">{new Date(r.startedAt).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="font-mono text-gray-600 text-[10px] break-all">{r.pipelineId.split('-')[0]}...</div>
                                </div>
                            ))}
                            {runs.length === 0 && <div className="text-gray-400 text-xs text-center py-4">No recent writes found.</div>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
