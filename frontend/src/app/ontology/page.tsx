"use client";

import { useState, useCallback, useEffect } from "react";
import ReactFlow, {
    Background, Controls, Node, Edge, useNodesState, useEdgesState,
    Handle, Position, BackgroundVariant, NodeProps, MiniMap,
    BaseEdge, getSmoothStepPath
} from "reactflow";
import "reactflow/dist/style.css";
import Link from "next/link";
import {
    MousePointer2, LayoutGrid, Undo2, Eraser, Maximize2,
    Palette, Search, Trash2, AlignCenter, Eye, ChevronRight,
    ChevronLeft, Layers, History, Code2, Activity, AlertCircle,
    ArrowRightLeft, Plus, X, Filter, BookOpen, Settings, Link2,
    Database, GitBranch, RefreshCw, Zap, Monitor, Key, Hash,
    Loader2, GitPullRequest
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const FETCH_TIMEOUT_MS = 10_000;

// Matches /build/ontology and /build/actions
const C = {
    bg: "#F5F8FA", white: "#FFFFFF", border: "#CED9E0",
    text: "#182026", sub: "#5C7080", accent: "#137CBD",
    pill: "#EBF1F5", red: "#DB3737", green: "#0F9960", amber: "#D9822B",
};

// ─── API helper ──────────────────────────────────────────────────────────────
async function apiFetch(path: string, opts?: RequestInit) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
        const r = await fetch(`${API}${path}`, {
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            ...opts,
        });
        if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error ?? r.statusText); }
        return r.json();
    } catch (e: any) {
        if (e.name === 'AbortError') throw new Error(`Request timed out after ${FETCH_TIMEOUT_MS / 1000}s`);
        throw e;
    } finally {
        clearTimeout(timer);
    }
}

// ─── Custom Custom Node for Live Ontology Graph ──────────────────────────────
const LineageNode = ({ data, selected }: NodeProps) => {
    const d = data as any;
    const isDerived = d.isDerived;
    return (
        <div className={`bg-white shadow-sm rounded overflow-hidden min-w-[200px] transition-all select-none ${selected ? "ring-2 ring-[#137CBD]" : "ring-1 ring-[#CED9E0] hover:ring-[#9FB3BE]"}`}>
            <Handle type="target" position={Position.Left} style={{ background: "#5C7080", left: -4, width: 8, height: 8 }} />
            <div className={`px-2 py-1.5 border-b border-[#CED9E0] flex items-center justify-between ${isDerived ? "bg-[#EBF1F5]" : "bg-white"}`}>
                <div className="flex items-center gap-1.5">
                    {isDerived ? <Zap className="w-3.5 h-3.5 text-[#D9822B]" /> : <Database className="w-3.5 h-3.5 text-[#137CBD]" />}
                    <span className="font-bold text-[11px] text-[#182026]">{d.label}</span>
                </div>
                <span className="text-[9px] text-[#5C7080] font-mono">v{d.version ?? 1}</span>
            </div>
            <div className="px-2 py-1 flex items-center justify-between text-[10px] text-[#5C7080]">
                <span>Objects:</span>
                <span className="font-bold text-[#182026]">{d.objectCount?.toLocaleString() ?? 0}</span>
            </div>
            <Handle type="source" position={Position.Right} style={{ background: "#5C7080", right: -4, width: 8, height: 8 }} />
        </div>
    );
};

// ─── Custom Straight Edge with Label ─────────────────────────────────────────
const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, label, data, markerEnd }: any) => {
    const [path, lx, ly] = getSmoothStepPath({ sourceX, sourceY, targetX, targetY, borderRadius: 0 });
    const isDerived = data?.isDerived;
    return (
        <>
            <BaseEdge id={id} path={path} markerEnd={markerEnd}
                style={{
                    stroke: isDerived ? C.accent : C.sub,
                    strokeDasharray: isDerived ? "5 5" : undefined,
                    strokeWidth: 1.5
                }} />
            {label && (
                <div style={{
                    position: "absolute",
                    transform: `translate(-50%,-50%) translate(${lx}px,${ly}px)`,
                    pointerEvents: "all"
                }} className={`bg-white border text-[9px] font-bold px-1 rounded shadow-sm ${isDerived ? "border-[#137CBD] text-[#137CBD]" : "border-[#CED9E0] text-[#5C7080]"}`}>
                    {isDerived && <Zap className="w-2.5 h-2.5 inline mr-0.5" />}{label}
                </div>
            )}
        </>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OntologyPage() {
    const [viewMode, setViewMode] = useState<"graph" | "list">("list");
    const [sidebarTab, setSidebarTab] = useState("preview"); // preview, rules, properties

    // Live Data State
    const [entityTypes, setEntityTypes] = useState<any[]>([]);
    const [graphData, setGraphData] = useState<{ nodes: any[], edges: any[] }>({ nodes: [], edges: [] });
    const [branches, setBranches] = useState<string[]>(["main"]);
    const [selectedBranch, setSelectedBranch] = useState("main");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Selection state
    const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [selectedLogicalId, setSelectedLogicalId] = useState<string | null>(null);
    const [historyEvents, setHistoryEvents] = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState<string | null>(null);

    // ReactFlow hooks
    const [rfNodes, setRfNodes, onNodesChange] = useNodesState([]);
    const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState([]);

    // ── DATA FETCHING ──
    const loadOntology = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            // Fetch branches, entity types, and graph
            const [branchesRes, etRes, graphRes] = await Promise.all([
                apiFetch("/api/ontology/branches"),
                apiFetch(`/api/ontology/entity-types?branch=${selectedBranch}`),
                apiFetch(`/api/ontology/graph?branch=${selectedBranch}`)
            ]);
            setBranches(branchesRes);
            setEntityTypes(etRes);
            setGraphData(graphRes);

            // layout graph
            const nodes: Node[] = graphRes.nodes.map((n: any, i: number) => ({
                id: n.id, type: "lineage",
                position: { x: 100 + (i % 3) * 350, y: 100 + Math.floor(i / 3) * 150 },
                data: { label: n.label, version: n.version, objectCount: n.objectCount, isDerived: false }
            }));

            const edges: Edge[] = graphRes.edges.map((e: any) => ({
                id: e.id, source: e.source, target: e.target,
                type: "customEdge", label: e.label,
                data: { isDerived: e.isDerived },
                style: { strokeWidth: 1.5, stroke: e.isDerived ? C.accent : C.sub, strokeDasharray: e.isDerived ? "4 4" : undefined },
                markerEnd: { type: "arrowclosed" as any, color: e.isDerived ? C.accent : C.sub }
            }));

            setRfNodes(nodes);
            setRfEdges(edges);

            // If the selected entity is no longer in the list (branch switch), clear it or pick first
            if (selectedEntityId && !etRes.find((t: any) => t.id === selectedEntityId)) {
                setSelectedEntityId(etRes.length > 0 ? etRes[0].id : null);
            } else if (etRes.length > 0 && !selectedEntityId) {
                setSelectedEntityId(etRes[0].id);
            }
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [selectedBranch, selectedEntityId]);

    useEffect(() => { loadOntology(); }, [loadOntology]);

    // ── LOAD PREVIEW DATA ──
    useEffect(() => {
        const loadPreview = async () => {
            if (!selectedEntityId) return;
            setPreviewLoading(true);
            try {
                const res = await apiFetch(`/api/ontology/entity-types/${selectedEntityId}/instances?limit=50`);
                setPreviewData(res.data ?? []);
                setSelectedLogicalId(null);
                setHistoryEvents([]);
                setHistoryError(null);
            } catch {
                setPreviewData([]);
            } finally {
                setPreviewLoading(false);
            }
        };
        loadPreview();
    }, [selectedEntityId]);

    // â”€â”€ LOAD HISTORY FOR SELECTED ENTITY INSTANCE â”€â”€
    useEffect(() => {
        const loadHistory = async () => {
            if (sidebarTab !== "history") return;
            if (!selectedEntityId || !selectedLogicalId) return;
            setHistoryLoading(true);
            setHistoryError(null);
            try {
                const events = await apiFetch(`/api/ontology/entity-types/${selectedEntityId}/instances/${selectedLogicalId}/history`);
                setHistoryEvents(events || []);
            } catch (e: any) {
                setHistoryEvents([]);
                setHistoryError(e.message ?? "Failed to load history");
            } finally {
                setHistoryLoading(false);
            }
        };
        loadHistory();
    }, [sidebarTab, selectedEntityId, selectedLogicalId]);

    const handleNodeClick = (_: any, node: Node) => {
        setSelectedEntityId(node.id);
        setSidebarTab("preview");
    };

    const selectedEntity = entityTypes.find(e => e.id === selectedEntityId) || graphData.nodes.find(n => n.id === selectedEntityId);

    return (
        <div className="flex h-screen w-full bg-[#182026] text-white font-[Inter,sans-serif] overflow-hidden">
            {/* ── LEFT NAV / HEADER (Palantir App Chrome) ── */}
            <div className="w-14 bg-[#10161A] border-r border-[#293742] flex flex-col items-center py-3 shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold mb-6">AIP</div>
                <button className="w-10 h-10 flex items-center justify-center text-[#A7B6C2] hover:text-white mb-2"><LayoutGrid className="w-5 h-5" /></button>
                <div className="w-8 h-px bg-[#293742] my-2" />
                <button className="w-10 h-10 flex items-center justify-center text-[#A7B6C2] hover:text-white group relative">
                    <Database className="w-5 h-5" />
                    <div className="absolute left-12 bg-[#394B59] text-[11px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none transition-opacity">Ontology</div>
                </button>
            </div>

            <div className="flex-1 flex flex-col min-w-0 bg-[#F5F8FA] text-[#182026]">
                {/* ── HEADER ── */}
                <div className="h-12 bg-white border-b border-[#CED9E0] flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Database className="w-4 h-4 text-[#5C7080]" />
                            <span className="font-bold text-[14px]">Ontology Manager</span>
                        </div>
                        <div className="h-4 w-px bg-[#CED9E0]" />
                        <div className="flex bg-[#EBF1F5] p-0.5 rounded">
                            <button onClick={() => setViewMode("list")} className={`px-3 py-1 text-[11px] font-bold rounded transition-colors ${viewMode === "list" ? "bg-white shadow text-[#182026]" : "text-[#5C7080] hover:text-[#182026]"}`}>Object Types</button>
                            <button onClick={() => setViewMode("graph")} className={`px-3 py-1 text-[11px] font-bold rounded transition-colors ${viewMode === "graph" ? "bg-white shadow text-[#182026]" : "text-[#5C7080] hover:text-[#182026]"}`}>Full Lineage</button>
                        </div>
                        <div className="h-4 w-px bg-[#CED9E0]" />
                        <div className="flex items-center gap-1.5 px-2 py-1 hover:bg-[#EBF1F5] rounded cursor-pointer group transition-colors">
                            <GitBranch className="w-3.5 h-3.5 text-[#5C7080] group-hover:text-[#137CBD]" />
                            <select
                                value={selectedBranch}
                                onChange={(e) => setSelectedBranch(e.target.value)}
                                className="bg-transparent text-[11px] font-bold text-[#182026] outline-none border-none cursor-pointer p-0"
                            >
                                {branches.map(b => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {loading && <Loader2 className="w-4 h-4 text-[#5C7080] animate-spin" />}
                        <Link href="/ontology/change-requests" className="flex items-center gap-1.5 px-3 h-7 border border-[#CED9E0] hover:bg-[#EBF1F5] text-[#5C7080] text-[11px] font-bold rounded transition-colors shadow-sm">
                            <GitPullRequest className="w-3.5 h-3.5" />
                            CRs
                        </Link>
                        <button onClick={loadOntology} className="p-1.5 hover:bg-[#EBF1F5] rounded text-[#5C7080]"><RefreshCw className="w-4 h-4" /></button>
                        <button className="h-7 px-3 bg-[#137CBD] hover:bg-[#0E6694] text-white text-[11px] font-bold rounded transition-colors shadow-sm">Save Changes</button>
                    </div>
                </div>

                {/* ── WORKSPACE ── */}
                <div className="flex-1 flex min-h-0 relative">

                    {error && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#DB3737] text-white px-4 py-2 rounded shadow-lg text-[12px] font-bold flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}

                    {viewMode === "graph" ? (
                        <div className="flex-1 relative">
                            {rfNodes.length === 0 && !loading ? (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center text-[#5C7080]">
                                        <GitBranch className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                        <div className="text-[14px] font-bold">Empty Graph</div>
                                        <div className="text-[12px] mt-1">Go to /build/ontology to build your ontology graph.</div>
                                    </div>
                                </div>
                            ) : (
                                <ReactFlow
                                    nodes={rfNodes.map(n => ({ ...n, data: { ...n.data, selected: n.id === selectedEntityId } }))}
                                    edges={rfEdges}
                                    onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onNodeClick={handleNodeClick}
                                    nodeTypes={{ lineage: LineageNode }} edgeTypes={{ customEdge: CustomEdge }}
                                    fitView minZoom={0.2} maxZoom={2} proOptions={{ hideAttribution: true }}>
                                    <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#CED9E0" />
                                    <Controls showInteractive={false} className="!bg-white !border-[#CED9E0] !shadow-sm" />
                                    <MiniMap style={{ border: '1px solid #CED9E0', borderRadius: 4, background: 'white' }} />
                                </ReactFlow>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col min-w-0 bg-[#F5F8FA]">
                            <div className="p-4 border-b border-[#CED9E0] bg-white shrink-0">
                                <div className="text-[16px] font-bold">All Object Types ({entityTypes.length})</div>
                                <div className="text-[12px] text-[#5C7080] mt-1">Select an object type to view live connected data instances.</div>
                            </div>
                            <div className="flex-1 overflow-auto p-4 max-w-4xl space-y-2">
                                {loading && entityTypes.length === 0 && <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-[#5C7080]" /></div>}
                                {entityTypes.map(et => (
                                    <div key={et.id} onClick={() => { setSelectedEntityId(et.id); setSidebarTab("preview"); }}
                                        className={`bg-white border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all flex items-center gap-4 ${selectedEntityId === et.id ? "border-[#137CBD] ring-1 ring-[#137CBD]" : "border-[#CED9E0]"}`}>
                                        <div className="w-10 h-10 bg-[#EBF1F5] rounded flex items-center justify-center shrink-0">
                                            <Database className="w-5 h-5 text-[#137CBD]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-[14px]">{et.name} <span className="text-[#5C7080] font-normal text-[11px] ml-1">v{et.version}</span></div>
                                            <div className="text-[11px] text-[#5C7080] flex items-center gap-3 mt-1">
                                                <span>{et.attributes?.length || 0} properties</span>
                                                <span>{(et.incomingRelationships?.length || 0) + (et.outgoingRelationships?.length || 0)} relations</span>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="font-bold text-[18px] font-mono">{et.objectCount.toLocaleString()}</div>
                                            <div className="text-[10px] text-[#5C7080] uppercase tracking-wider font-bold">Objects</div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-[#CED9E0]" />
                                    </div>
                                ))}
                                {!loading && entityTypes.length === 0 && (
                                    <div className="text-center text-[#5C7080] py-10 bg-white border border-[#CED9E0] rounded border-dashed">No object types defined. Build them in /build/ontology</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── RIGHT PANEL (Details / Preview) ── */}
                    <div className="w-96 bg-white border-l border-[#CED9E0] flex flex-col shrink-0">
                        {selectedEntity ? (
                            <>
                                <div className="p-4 border-b border-[#CED9E0]">
                                    <div className="text-[16px] font-bold text-[#182026]">{selectedEntity.name || selectedEntity.label}</div>
                                    <div className="text-[11px] text-[#5C7080]">{selectedEntity.objectCount?.toLocaleString() ?? 0} total objects</div>
                                </div>
                                <div className="flex border-b border-[#CED9E0] bg-[#F5F8FA] text-[11px] font-bold">
                                    <button onClick={() => setSidebarTab("preview")} className={`flex-1 py-2 border-b-2 text-center ${sidebarTab === "preview" ? "border-[#137CBD] text-[#137CBD]" : "border-transparent text-[#5C7080] hover:text-[#182026]"}`}>Live Preview</button>
                                    <button onClick={() => setSidebarTab("history")} className={`flex-1 py-2 border-b-2 text-center ${sidebarTab === "history" ? "border-[#137CBD] text-[#137CBD]" : "border-transparent text-[#5C7080] hover:text-[#182026]"}`}>History</button>
                                    <button onClick={() => setSidebarTab("properties")} className={`flex-1 py-2 border-b-2 text-center ${sidebarTab === "properties" ? "border-[#137CBD] text-[#137CBD]" : "border-transparent text-[#5C7080] hover:text-[#182026]"}`}>Properties</button>
                                    <button onClick={() => setSidebarTab("lineage")} className={`flex-1 py-2 border-b-2 text-center ${sidebarTab === "lineage" ? "border-[#137CBD] text-[#137CBD]" : "border-transparent text-[#5C7080] hover:text-[#182026]"}`}>Relations</button>
                                </div>

                                <div className="flex-1 overflow-auto bg-white">
                                    {sidebarTab === "preview" && (
                                        <div className="p-0">
                                            {previewLoading ? (
                                                <div className="p-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-[#5C7080]" /></div>
                                            ) : previewData.length === 0 ? (
                                                <div className="p-8 text-center text-[#5C7080] text-[12px]">No data indexed yet.</div>
                                            ) : (
                                                <table className="w-full text-[11px]">
                                                    <thead className="bg-[#F5F8FA] sticky top-0 border-b border-[#CED9E0] shadow-sm">
                                                        <tr>
                                                            <th className="px-3 py-2 text-left font-bold text-[#5C7080] min-w-[120px]">logicalId</th>
                                                            {Object.keys(previewData[0]?.data || {}).map(k => (
                                                                <th key={k} className="px-3 py-2 text-left font-bold text-[#5C7080] min-w-[80px]">{k}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {previewData.map((row, i) => (
                                                            <tr key={i} className="border-b border-[#CED9E0]/40 hover:bg-[#F5F8FA] cursor-pointer" onClick={() => { setSelectedLogicalId(row.logicalId); setSidebarTab("history"); }}>
                                                                <td className="px-3 py-1.5 font-mono text-[#5C7080]">{row.logicalId}</td>
                                                                {Object.keys(previewData[0]?.data || {}).map(k => (
                                                                    <td key={k} className="px-3 py-1.5 font-mono">{String(row.data?.[k] ?? "—")}</td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    )}

                                    {sidebarTab === "history" && (
                                        <div className="p-0 h-full flex flex-col pt-2">
                                            {!selectedLogicalId ? (
                                                <div className="p-8 text-center text-[#5C7080] text-[12px]">
                                                    <History className="w-8 h-8 mx-auto mb-3 opacity-20" />
                                                    Select a row in Live Preview to view its history timeline.
                                                </div>
                                            ) : historyLoading ? (
                                                <div className="p-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-[#5C7080]" /></div>
                                            ) : historyError ? (
                                                <div className="p-4 text-center text-[#DB3737] text-[12px]">{historyError}</div>
                                            ) : historyEvents.length === 0 ? (
                                                <div className="p-8 text-center text-[#5C7080] text-[12px]">No history found.</div>
                                            ) : (
                                                <div className="flex-1 overflow-auto p-4 space-y-4">
                                                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#CED9E0]">
                                                        <span className="font-bold text-[12px]">Timeline for</span>
                                                        <span className="bg-[#EBF1F5] text-[#5C7080] px-1.5 py-0.5 rounded font-mono text-[10px]">{selectedLogicalId}</span>
                                                    </div>
                                                    <div className="relative border-l border-[#CED9E0] ml-2 space-y-6">
                                                        {historyEvents.map((ev, i) => (
                                                            <div key={i} className="relative pl-4">
                                                                <div className="absolute w-2 h-2 bg-[#137CBD] rounded-full -left-[4.5px] top-1.5 ring-2 ring-white" />
                                                                <div className="text-[10px] font-mono text-[#5C7080] mb-0.5">{new Date(ev.occurredAt).toLocaleString()}</div>
                                                                <div className="bg-[#F5F8FA] border border-[#CED9E0] rounded p-2 shadow-sm">
                                                                    <div className="flex justify-between items-center mb-1">
                                                                        <span className="font-bold text-[#182026] text-[11px]">{ev.eventType}</span>
                                                                        <span className="text-[9px] bg-white border border-[#CED9E0] px-1 rounded text-[#5C7080] font-mono">v{ev.version}</span>
                                                                    </div>
                                                                    <pre className="text-[9px] font-mono text-[#5C7080] bg-white p-1.5 rounded border border-[#CED9E0] overflow-x-auto">
                                                                        {JSON.stringify(ev.payload, null, 2)}
                                                                    </pre>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {sidebarTab === "properties" && (
                                        <div className="p-3 space-y-1">
                                            {(selectedEntity.attributes || []).map((a: any) => (
                                                <div key={a.id} className="flex justify-between items-center bg-[#F5F8FA] border border-[#CED9E0]/50 p-2 rounded">
                                                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#182026]">
                                                        {a.required ? <Key className="w-3 h-3 text-[#137CBD]" /> : <Hash className="w-3 h-3 text-[#5C7080]" />}
                                                        {a.name}
                                                    </div>
                                                    <span className="text-[9px] bg-white border border-[#CED9E0] px-1.5 py-0.5 rounded text-[#5C7080]">{a.dataType}</span>
                                                </div>
                                            ))}
                                            {(!selectedEntity.attributes || selectedEntity.attributes.length === 0) && (
                                                <div className="p-4 text-center text-[11px] text-[#5C7080]">No properties loaded.</div>
                                            )}
                                        </div>
                                    )}

                                    {sidebarTab === "lineage" && (
                                        <div className="p-4 text-center text-[12px] text-[#5C7080]">
                                            <div className="mb-2"><strong>Incoming:</strong> {selectedEntity.incomingRelationships?.length || 0} Links</div>
                                            <div><strong>Outgoing:</strong> {selectedEntity.outgoingRelationships?.length || 0} Links</div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-center p-8 text-[#5C7080]">
                                <div>
                                    <div className="w-12 h-12 bg-[#F5F8FA] rounded-full flex items-center justify-center mx-auto mb-3">
                                        <MousePointer2 className="w-5 h-5" />
                                    </div>
                                    <div className="text-[14px] font-bold text-[#182026]">No Object Selected</div>
                                    <div className="text-[12px] mt-1">Select an object from the graph or list to view its live data and attributes.</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
