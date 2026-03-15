"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import ReactFlow, {
    Background, Controls, Node, Edge, useNodesState, useEdgesState,
    Handle, Position, BackgroundVariant, NodeProps,
    BaseEdge, getSmoothStepPath
} from "reactflow";
import "reactflow/dist/style.css";
import {
    Database, GitBranch, RefreshCw, Loader2, GitPullRequest,
    History, Key, Hash, ChevronRight, LayoutGrid, Eye, Search, Filter,
    Settings2, Clock, Box, Plus, MoreVertical, ChevronDown, Sparkles
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Toolbar } from "@/components/ui/Toolbar";
import { SeverityChip } from "@/components/ui/SeverityChip";
import { useIntelligenceStore } from "@/store/intelligenceStore";
import { MiniList, MiniListItem } from "@/components/ui/MiniList";
import { cn } from "@/lib/utils";
import { AipInteractiveWidget } from "@/components/ui/AipInteractiveWidget";

// ─── API helper ──────────────────────────────────────────────────────────────
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const FETCH_TIMEOUT_MS = 10_000;

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

// ─── Custom Node for Graph View ──────────────────────────────────────────────
const LineageNode = ({ data, selected }: NodeProps) => {
    const d = data as any;
    return (
        <div className={cn(
            "bg-pt-bg-panel border h-16 w-52 flex flex-col transition-all cursor-pointer relative",
            selected ? "border-pt-intent-primary border-2 shadow-[0_0_15px_rgba(16,107,163,0.3)]" : "border-pt-border hover:border-pt-border-dark"
        )}>
            {selected && <div className="absolute top-0 left-0 right-0 h-0.5 bg-pt-intent-primary" />}
            <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-pt-intent-primary border-none !opacity-50" />
            <div className="flex-1 flex flex-col px-3 justify-center">
                <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-tight text-pt-text truncate">{d.label}</span>
                    <span className="text-[8px] text-pt-text-muted font-mono bg-pt-bg border border-pt-border px-1 px-1 rounded-sm">v{d.version}</span>
                </div>
                <div className="text-[9px] text-pt-text-muted/60 uppercase font-black tracking-widest mt-1">
                    {d.objectCount?.toLocaleString()} INSTANCES
                </div>
            </div>
            <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-pt-intent-primary border-none !opacity-50" />
        </div>
    );
};

// ─── Custom Edge ─────────────────────────────────────────────────────────────
const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, markerEnd }: any) => {
    const [path] = getSmoothStepPath({ sourceX, sourceY, targetX, targetY, borderRadius: 0 });
    return <BaseEdge id={id} path={path} markerEnd={markerEnd} style={{ stroke: 'rgba(16, 107, 163, 0.2)', strokeWidth: 1 }} />;
};

export default function OntologyPage() {
    return (
        <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-pt-intent-primary" /></div>}>
            <OntologyPageContent />
        </Suspense>
    );
}

function OntologyPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [viewMode, setViewMode] = useState<"graph" | "list">("list");
    const [sidebarTab, setSidebarTab] = useState("preview");

    const [entityTypes, setEntityTypes] = useState<any[]>([]);
    const [graphData, setGraphData] = useState<{ nodes: any[], edges: any[] }>({ nodes: [], edges: [] });
    const [branches, setBranches] = useState<string[]>(["main"]);
    const [selectedBranch, setSelectedBranch] = useState("main");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [selectedLogicalId, setSelectedLogicalId] = useState<string | null>(null);
    const [historyEvents, setHistoryEvents] = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const [rfNodes, setRfNodes, onNodesChange] = useNodesState([]);
    const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState([]);

    const { setContext, updateSelection, setVar, selection } = useIntelligenceStore();

    // Sync tab to vars
    useEffect(() => {
        setVar('activeTab', sidebarTab);
    }, [sidebarTab, setVar]);

    // React to external var changes (from AI)
    useEffect(() => {
        const extTab = selection.vars?.activeTab;
        if (extTab && extTab !== sidebarTab) {
            setSidebarTab(extTab);
        }
    }, [selection.vars?.activeTab, sidebarTab]);

    useEffect(() => {
        setContext('ontology', {
            workspaceId: 'main-ontology',
            vars: { activeTab: sidebarTab }
        });
    }, []);

    useEffect(() => {
        if (selectedEntityId) {
            updateSelection({
                entityTypeId: selectedEntityId,
                logicalId: selectedLogicalId || undefined
            });
        }
    }, [selectedEntityId, selectedLogicalId]);

    const updateUrl = useCallback((typeId: string | null, logicalId: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (typeId) params.set('type', typeId);
        if (logicalId) params.set('id', logicalId);
        else params.delete('id');
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, [pathname, router, searchParams]);

    const loadOntology = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const [branchesRes, etRes, graphRes] = await Promise.all([
                apiFetch("/api/ontology/branches"),
                apiFetch(`/api/ontology/entity-types?branch=${selectedBranch}`),
                apiFetch(`/api/ontology/graph?branch=${selectedBranch}`)
            ]);
            setBranches(branchesRes);
            setEntityTypes(etRes);
            setGraphData(graphRes);

            const nodes: Node[] = graphRes.nodes.map((n: any, i: number) => ({
                id: n.id, type: "lineage",
                position: { x: 100 + (i % 3) * 300, y: 100 + Math.floor(i / 3) * 120 },
                data: { label: n.label, version: n.version, objectCount: n.objectCount }
            }));

            const edges: Edge[] = graphRes.edges.map((e: any) => ({
                id: e.id, source: e.source, target: e.target, type: "customEdge",
                markerEnd: { type: Position.Right as any, color: 'rgba(16, 107, 163, 0.4)' }
            }));

            setRfNodes(nodes);
            setRfEdges(edges);

            // Sync from URL on first load
            const urlType = searchParams.get('type');
            const urlId = searchParams.get('id');

            if (urlType) {
                setSelectedEntityId(urlType);
                if (urlId) {
                    setSelectedLogicalId(urlId);
                    setSidebarTab("history");
                }
            } else if (etRes.length > 0 && !selectedEntityId) {
                setSelectedEntityId(etRes[0].id);
            }
        } catch (e: any) { setError(e.message); }
        finally { setLoading(false); }
    }, [selectedBranch, searchParams]);

    useEffect(() => { loadOntology(); }, [loadOntology]);

    useEffect(() => {
        const loadPreview = async () => {
            if (!selectedEntityId) return;
            setPreviewLoading(true);
            try {
                const res = await apiFetch(`/api/ontology/entity-types/${selectedEntityId}/instances?limit=50`);
                setPreviewData(res.data ?? []);
            } catch { setPreviewData([]); }
            finally { setPreviewLoading(false); }
        };
        loadPreview();
    }, [selectedEntityId]);

    useEffect(() => {
        const loadHistory = async () => {
            if (sidebarTab !== "history" || !selectedLogicalId) return;
            setHistoryLoading(true);
            try {
                const events = await apiFetch(`/api/ontology/entity-types/${selectedEntityId}/instances/${selectedLogicalId}/history`);
                setHistoryEvents(events || []);
            } catch { setHistoryEvents([]); }
            finally { setHistoryLoading(false); }
        };
        loadHistory();
    }, [sidebarTab, selectedEntityId, selectedLogicalId]);

    const handleNodeClick = (_: any, node: Node) => {
        setSelectedEntityId(node.id);
        setSelectedLogicalId(null);
        setSidebarTab("preview");
        updateUrl(node.id, null);
    };

    const selectedEntity = entityTypes.find(e => e.id === selectedEntityId);

    return (
        <div className="flex flex-col h-full bg-pt-bg">
            {/* Builder Header */}
            <header className="px-6 py-4 border-b border-pt-border bg-pt-bg-panel/20 shrink-0">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Box size={10} className="text-pt-intent-primary" />
                            <span className="text-[9px] font-black text-pt-text-muted opacity-50 uppercase tracking-widest font-mono">Project: Integrated_Operations_Nexus</span>
                        </div>
                        <h1 className="text-xl font-black text-pt-text uppercase tracking-tight">Ontology Explorer</h1>
                        <p className="text-[10px] text-pt-text-muted font-bold uppercase tracking-widest mt-1">Object Modeling & Semantic Relation Matrix</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="h-8 px-4 bg-pt-bg border border-pt-border rounded text-[9px] font-black uppercase tracking-widest text-pt-text-muted hover:text-pt-text transition-all flex items-center gap-2">
                            <Plus size={10} /> Propose Type
                        </button>
                        <button className="h-8 px-4 bg-pt-intent-primary text-pt-bg rounded text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                            <Sparkles size={10} /> AIP Generate
                        </button>
                    </div>
                </div>
            </header>

            {/* Builder Toolbar */}
            <Toolbar className="shrink-0">
                <div className="flex items-center gap-4">
                    <div
                        className="flex items-center gap-2 px-2.5 py-1.5 bg-pt-bg border border-pt-border rounded cursor-pointer hover:border-pt-intent-primary transition-all group"
                        onClick={() => setSelectedBranch(selectedBranch === 'main' ? 'dev' : 'main')}
                    >
                        <GitBranch size={10} className="text-pt-intent-primary" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-pt-text opacity-80">{selectedBranch}</span>
                        <ChevronDown size={10} className="text-pt-text-muted group-hover:text-pt-text" />
                    </div>

                    <div className="h-4 w-px bg-pt-border mx-2" />

                    <div className="flex bg-pt-bg border border-pt-border rounded p-0.5">
                        <button
                            onClick={() => setViewMode("list")}
                            className={cn(
                                "px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-sm transition-all",
                                viewMode === "list" ? "bg-pt-bg-panel text-pt-intent-primary shadow-inner" : "text-pt-text-muted hover:text-pt-text"
                            )}
                        > Listing </button>
                        <button
                            onClick={() => setViewMode("graph")}
                            className={cn(
                                "px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-sm transition-all",
                                viewMode === "graph" ? "bg-pt-bg-panel text-pt-intent-primary shadow-inner" : "text-pt-text-muted hover:text-pt-text"
                            )}
                        > Lineage </button>
                    </div>
                </div>

                <div className="flex items-center gap-3 ml-auto">
                    <button
                        onClick={loadOntology}
                        className="p-1.5 hover:bg-pt-bg-panel text-pt-text-muted hover:text-pt-text rounded transition-all"
                        title="Sync Ontology"
                    >
                        <RefreshCw size={12} className={loading ? 'animate-spin text-pt-intent-primary' : ''} />
                    </button>
                    <div className="h-4 w-px bg-pt-border mx-1" />
                    <button className="p-1.5 hover:bg-pt-bg-panel text-pt-text-muted rounded"><Settings2 size={12} /></button>
                </div>
            </Toolbar>

            <div className="flex-1 flex overflow-hidden">
                {/* ── Left Navigation List ── */}
                <aside className="w-[280px] border-r border-pt-border flex flex-col bg-pt-bg select-none">
                    <div className="h-10 border-b border-pt-border flex items-center px-3 justify-between bg-pt-bg/50 backdrop-blur-md sticky top-0 z-10">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-pt-text-muted">Object Registry</span>
                        <div className="flex items-center gap-1">
                            <button onClick={loadOntology} className="p-1 hover:bg-pt-bg-hover text-pt-text-muted transition-colors rounded">
                                <RefreshCw size={12} className={loading ? 'animate-spin text-pt-intent-primary' : ''} />
                            </button>
                        </div>
                    </div>

                    <div className="p-3 border-b border-pt-border bg-pt-bg/30">
                        <div className="relative group">
                            <Search className="w-3 h-3 absolute left-2 top-2.5 text-pt-text-muted opacity-40 group-focus-within:opacity-100 transition-opacity" />
                            <input
                                type="text"
                                placeholder="FILTER ONTOLOGY NODES..."
                                className="w-full bg-pt-bg-panel border border-pt-border rounded px-7 py-1.5 text-[10px] font-bold focus:outline-none focus:border-pt-intent-primary placeholder:opacity-20 uppercase tracking-widest"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto custom-scrollbar">
                        <MiniList>
                            {entityTypes.map(et => (
                                <MiniListItem
                                    key={et.id}
                                    label={et.name}
                                    metadata={`v${et.version} • ${et.objectCount.toLocaleString()} ASSETS`}
                                    active={selectedEntityId === et.id}
                                    onClick={() => {
                                        setSelectedEntityId(et.id);
                                        setSelectedLogicalId(null);
                                        updateUrl(et.id, null);
                                    }}
                                    icon={Database}
                                />
                            ))}
                        </MiniList>
                    </div>

                    <div className="p-2 border-t border-pt-border bg-pt-bg/50 flex items-center justify-between">
                        <div className="flex items-center gap-2 px-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-pt-intent-success shadow-[0_0_5px_rgba(13,128,80,0.5)]" />
                            <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Branch: {selectedBranch}</span>
                        </div>
                        <button className="p-1 hover:bg-pt-bg-hover text-pt-text-muted rounded">
                            <Settings2 size={12} />
                        </button>
                    </div>
                </aside>

                {/* ── Main Viewport ── */}
                <main className="flex-1 relative flex flex-col overflow-hidden bg-[radial-gradient(circle_at_center,_var(--pt-bg-panel)_0%,_var(--pt-bg)_100%)]">

                    {viewMode === "graph" ? (
                        <div className="flex-1">
                            <ReactFlow
                                nodes={rfNodes.map(n => ({ ...n, data: { ...n.data, selected: n.id === selectedEntityId } }))}
                                edges={rfEdges}
                                onNodesChange={onNodesChange}
                                onEdgesChange={onEdgesChange}
                                onNodeClick={handleNodeClick}
                                nodeTypes={{ lineage: LineageNode }}
                                edgeTypes={{ customEdge: CustomEdge }}
                                fitView
                                proOptions={{ hideAttribution: true }}
                            >
                                <Background variant={BackgroundVariant.Lines} gap={40} size={1} color="rgba(255,255,255,0.03)" />
                                <Controls className="bg-pt-bg-panel border-pt-border fill-pt-text" />
                            </ReactFlow>
                        </div>
                    ) : (
                        <div className="flex-1 p-6 pt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 overflow-auto custom-scrollbar">
                            {entityTypes.map(et => (
                                <Card
                                    key={et.id}
                                    title={et.name}
                                    pill={`VERSION ${et.version}`}
                                    pillColor={selectedEntityId === et.id ? 'primary' : 'muted'}
                                    className={cn(
                                        "cursor-pointer hover:border-pt-intent-primary group transition-all h-36",
                                        selectedEntityId === et.id ? 'shadow-[0_0_30px_rgba(16,107,163,0.1)]' : ''
                                    )}
                                    onClick={() => {
                                        setSelectedEntityId(et.id);
                                        setSelectedLogicalId(null);
                                        updateUrl(et.id, null);
                                    }}
                                >
                                    <div className="p-4 flex flex-col justify-between h-full bg-[linear-gradient(135deg,_rgba(255,255,255,0.02)_0%,_transparent_100%)]">
                                        <div className="flex items-center space-x-2 text-[10px] text-pt-text-muted group-hover:text-pt-text transition-colors font-bold uppercase tracking-tight">
                                            <Hash size={12} className="opacity-40" />
                                            <span>{et.attributes?.length || 0} SCHEMA PROPERTIES</span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <div className="text-[24px] font-mono font-bold leading-none tracking-tighter text-pt-text">
                                                    {et.objectCount.toLocaleString()}
                                                </div>
                                                <div className="text-[8px] uppercase tracking-[0.2em] font-black text-pt-text-muted mt-2 opacity-50">
                                                    INDEXED ASSETS
                                                </div>
                                            </div>
                                            <div className="p-2 bg-pt-bg border border-pt-border rounded-sm group-hover:border-pt-intent-primary group-hover:bg-pt-intent-primary/10 transition-all">
                                                <ChevronRight size={14} className="text-pt-text-muted group-hover:text-pt-intent-primary" />
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </main>

                {/* ── Right Attributes/Analysis Pane ── */}
                <aside className="w-[450px] border-l border-pt-border flex flex-col bg-pt-bg select-none">
                    {selectedEntity ? (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-pt-border bg-pt-bg-panel/50 backdrop-blur-md">
                                <div className="flex items-center justify-between mb-1">
                                    <h2 className="text-[14px] font-black uppercase tracking-widest text-pt-text">{selectedEntity.name}</h2>
                                    <div className="flex gap-1.5">
                                        <button className="p-1 hover:bg-pt-bg-hover text-pt-text-muted rounded"><Eye size={12} /></button>
                                        <button className="p-1 hover:bg-pt-bg-hover text-pt-text-muted rounded"><GitBranch size={12} /></button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[9px] font-mono bg-pt-bg px-2 py-0.5 border border-pt-border rounded-sm text-pt-intent-primary font-bold">
                                        ONTOLOGY::{selectedEntity.id.slice(0, 12).toUpperCase()}
                                    </span>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-pt-text-muted opacity-50">Operational Schema</span>
                                </div>
                            </div>

                            <div className="flex border-b border-pt-border bg-pt-bg/50">
                                {['preview', 'properties', 'history', 'intelligence'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setSidebarTab(tab)}
                                        className={cn(
                                            "flex-1 px-4 py-3 text-[9px] font-black uppercase tracking-[0.15em] relative transition-all",
                                            sidebarTab === tab ? 'text-pt-intent-primary bg-pt-bg' : 'text-pt-text-muted hover:text-pt-text hover:bg-pt-bg-hover/50'
                                        )}
                                    >
                                        {tab}
                                        {sidebarTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pt-intent-primary shadow-[0_0_10px_rgba(16,107,163,0.5)]" />}
                                    </button>
                                ))}
                            </div>

                            <div className="flex-1 overflow-auto bg-[linear-gradient(180deg,_rgba(16,107,163,0.01)_0%,_transparent_100%)] custom-scrollbar">
                                {sidebarTab === 'preview' && (
                                    <div className="flex flex-col h-full bg-pt-bg-panel/10">
                                        {previewLoading ? (
                                            <div className="p-12 flex flex-col items-center gap-4 opacity-20">
                                                <Loader2 className="animate-spin" size={32} />
                                                <span className="text-[9px] font-black uppercase tracking-[0.3em]">Querying Cluster...</span>
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto h-full border-b border-pt-border">
                                                <table className="w-full text-left border-collapse border-b border-pt-border">
                                                    <thead className="bg-pt-bg border-b border-pt-border sticky top-0 z-10">
                                                        <tr>
                                                            <th className="px-4 py-2 text-[9px] font-black text-pt-text-muted uppercase tracking-widest border-r border-pt-border">Logical ID</th>
                                                            {Object.keys(previewData[0]?.data || {}).map(k => (
                                                                <th key={k} className="px-4 py-2 text-[9px] font-black text-pt-text-muted uppercase tracking-widest border-r border-pt-border">{k}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-pt-border/30">
                                                        {previewData.map((row, i) => (
                                                            <tr
                                                                key={i}
                                                                onClick={() => {
                                                                    setSelectedLogicalId(row.logicalId);
                                                                    setSidebarTab("history");
                                                                    updateUrl(selectedEntityId, row.logicalId);
                                                                }}
                                                                className={cn(
                                                                    "hover:bg-pt-intent-primary/5 cursor-pointer transition-colors group",
                                                                    selectedLogicalId === row.logicalId ? 'bg-pt-intent-primary/10' : ''
                                                                )}
                                                            >
                                                                <td className="px-4 py-2 font-mono text-pt-intent-primary font-bold text-[10px] border-r border-pt-border/10 truncate max-w-[120px]">{row.logicalId}</td>
                                                                {Object.keys(previewData[0]?.data || {}).map(k => (
                                                                    <td key={k} className="px-4 py-2 font-mono text-pt-text text-[10px] border-r border-pt-border/10 truncate max-w-[120px]">{String(row.data?.[k] ?? "—")}</td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {sidebarTab === 'intelligence' && (
                                    <div className="p-4 h-full flex flex-col">
                                        <AipInteractiveWidget
                                            context={`ONTOLOGY_TYPE::${selectedEntity.name}`}
                                            placeholder={`Analyze ${selectedEntity.name} schema...`}
                                        />
                                    </div>
                                )}

                                {sidebarTab === 'properties' && (
                                    <div className="flex flex-col divide-y divide-pt-border/30">
                                        {(selectedEntity.attributes || []).map((a: any) => (
                                            <div key={a.id} className="p-4 hover:bg-pt-bg-hover transition-colors flex items-center justify-between group cursor-default">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-8 h-8 bg-pt-bg border border-pt-border rounded-sm flex items-center justify-center text-pt-text-muted group-hover:text-pt-intent-primary transition-colors">
                                                        {a.required ? <Key size={14} className="text-pt-intent-warning opacity-60" /> : <Hash size={14} />}
                                                    </div>
                                                    <div>
                                                        <div className="text-[11px] font-black uppercase tracking-tight text-pt-text">{a.name}</div>
                                                        <div className="text-[8px] text-pt-text-muted font-mono uppercase tracking-tighter mt-0.5 opacity-50">{a.id}</div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-[9px] font-mono bg-pt-bg-panel px-2 py-0.5 border border-pt-border rounded-sm text-pt-intent-primary font-bold uppercase tracking-widest">{a.dataType}</span>
                                                    {a.required && <span className="text-[7px] font-black text-pt-intent-warning uppercase tracking-widest">Mandatory</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {sidebarTab === 'history' && (
                                    <div className="p-4 space-y-6">
                                        {!selectedLogicalId ? (
                                            <div className="flex flex-col items-center justify-center h-64 opacity-20 grayscale scale-75">
                                                <History size={48} />
                                                <span className="text-[10px] mt-4 uppercase font-black tracking-[0.3em]">Selection Required</span>
                                            </div>
                                        ) : (
                                            <div className="relative border-l border-pt-border/50 ml-2 py-2">
                                                {historyEvents.map((ev, i) => (
                                                    <div key={i} className="mb-8 relative pl-6">
                                                        <div className="absolute w-2 h-2 bg-pt-intent-primary rounded-full -left-[4.5px] top-1.5 ring-2 ring-pt-bg shadow-[0_0_8px_rgba(16,107,163,0.5)]" />
                                                        <div className="text-[8px] font-mono text-pt-text-muted mb-2 flex items-center gap-2 opacity-60">
                                                            <Clock size={10} />
                                                            {new Date(ev.occurredAt).toLocaleTimeString()} • {new Date(ev.occurredAt).toLocaleDateString()}
                                                        </div>
                                                        <div className="bg-pt-bg-panel border border-pt-border rounded-sm p-3 shadow-sm">
                                                            <div className="flex justify-between items-center mb-3">
                                                                <span className="font-black text-pt-text text-[10px] uppercase tracking-widest border-b border-pt-intent-primary/30 pb-0.5">{ev.eventType}</span>
                                                                <span className="text-[9px] bg-pt-bg px-2 py-0.5 border border-pt-border rounded-sm text-pt-text-muted font-mono">v{ev.version}</span>
                                                            </div>
                                                            <pre className="text-[10px] font-mono text-pt-text-muted/80 bg-pt-bg/50 p-3 rounded-sm border border-pt-border/30 overflow-x-auto custom-scrollbar">
                                                                {JSON.stringify(ev.payload, null, 2)}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-20 grayscale space-y-4">
                            <div className="p-6 bg-pt-bg-panel rounded-full border border-pt-border">
                                <Database size={48} className="text-pt-text-muted" />
                            </div>
                            <div className="space-y-1">
                                <div className="text-[12px] font-black uppercase tracking-[0.4em]">Node Idle</div>
                                <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">Select Operational Type to Inspect</p>
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}
