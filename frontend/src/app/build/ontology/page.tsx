"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import ReactFlow, {
    Background, Controls, Node, Edge, ConnectionLineType,
    useNodesState, useEdgesState, Handle, Position, BackgroundVariant,
    addEdge, Connection, EdgeLabelRenderer, BaseEdge, getSmoothStepPath,
    NodeProps, MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";
import {
    Plus, Trash2, Search, RefreshCw, Zap, Settings, Hash,
    Database, GitBranch, X, ChevronDown, ChevronRight, Eye,
    AlertCircle, Check, Loader2, Activity, Link2, BookOpen,
    Sparkles, MoreHorizontal, ArrowRightLeft, Key
} from "lucide-react";
import { PreFlightModal } from "@/components/PreFlightModal";

// ─── Constants ────────────────────────────────────────────────────────────────
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const COLORS = ["#0BB68F", "#137CBD", "#8B5CF6", "#D9822B", "#DB3737", "#E1BB48", "#15B371", "#4580E6"];
const DATA_TYPES = ["STRING", "INTEGER", "DOUBLE", "BOOLEAN", "DATETIME", "JSON"];
const FETCH_TIMEOUT_MS = 10_000;

// ─── Types ───────────────────────────────────────────────────────────────────
interface Attribute { id: string; name: string; dataType: string; required: boolean; }
interface EntityType {
    id: string; name: string; version: number; objectCount: number;
    attributes: Attribute[];
    outgoingRelationships: Array<{ id: string; name: string; targetEntityType: { id: string; name: string } }>;
    incomingRelationships: Array<{ id: string; name: string; sourceEntityType: { id: string; name: string } }>;
}
interface Rule { id: string; name: string; description?: string; antecedent: any[]; consequent: any; enabled: boolean; createdAt: string; }

// ─── API helpers ─────────────────────────────────────────────────────────────
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
        if (e.name === 'AbortError') throw new Error(`Request timed out after ${FETCH_TIMEOUT_MS / 1000}s — is the backend running on ${API}?`);
        throw e;
    } finally {
        clearTimeout(timer);
    }
}

// ─── Custom Node: Entity Card ────────────────────────────────────────────────
function EntityCardNode({ data, selected }: NodeProps) {
    const d = data as any;
    const color = d.color ?? "var(--pt-intent-primary)";
    return (
        <div className={`bg-pt-bg-panel text-[11px] shadow-2xl rounded-lg overflow-hidden transition-all select-none border border-pt-border ${selected ? "ring-2 ring-pt-intent-primary border-transparent shadow-[0_0_15px_rgb(var(--pt-intent-primary) / 0.3)]" : "hover:border-pt-border-hover"}`}
            style={{ minWidth: 220 }}>
            <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 border-2 border-pt-bg-panel" style={{ background: color, left: -5 }} />
            {/* Header */}
            <div className="flex items-center gap-2.5 px-3 py-3" style={{ borderLeft: `4px solid ${color}`, borderBottom: "1px solid var(--pt-border)" }}>
                <div className="w-6 h-6 rounded flex items-center justify-center shrink-0 bg-pt-bg border border-pt-border shadow-inner">
                    <Database className="w-3.5 h-3.5" style={{ color }} />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="font-black text-[11px] text-pt-text uppercase tracking-tight truncate">{d.label}</div>
                    <div className="text-[9px] text-pt-text-muted font-bold tracking-widest">{d.objectCount?.toLocaleString() ?? "0"} OBJS · V{d.version ?? 1}</div>
                </div>
            </div>
            {/* Properties preview */}
            <div className="px-3 py-2 space-y-1 bg-pt-bg/30">
                {(d.attributes ?? []).slice(0, 4).map((a: Attribute) => (
                    <div key={a.id} className="flex items-center gap-2 py-0.5">
                        {a.required ? <Key className="w-2.5 h-2.5 text-pt-intent-primary shrink-0" /> : <Hash className="w-2.5 h-2.5 text-pt-text-muted shrink-0 opacity-50" />}
                        <span className="text-[10px] text-pt-text font-mono truncate flex-1">{a.name}</span>
                        <span className="text-[8px] bg-pt-bg-panel border border-pt-border text-pt-text-muted px-1.5 py-0.5 rounded font-black tracking-tighter">{a.dataType}</span>
                    </div>
                ))}
                {(d.attributes ?? []).length > 4 && (
                    <div className="text-[9px] text-pt-text-muted font-black uppercase tracking-[0.2em] pt-1 opacity-50">+{d.attributes.length - 4} SIG-INPUTS</div>
                )}
                {(d.attributes ?? []).length === 0 && (
                    <div className="text-[9px] text-pt-text-muted py-2 text-center italic opacity-40">No attributes defined</div>
                )}
            </div>
            <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 border-2 border-pt-bg-panel" style={{ background: "var(--pt-intent-primary)", right: -5 }} />
        </div>
    );
}

// ─── Custom Edge: Relationship ────────────────────────────────────────────────
function RelEdge({ id, sourceX, sourceY, targetX, targetY, label, data, markerEnd }: any) {
    const [path, lx, ly] = getSmoothStepPath({ sourceX, sourceY, targetX, targetY, borderRadius: 12 });
    const isDerived = data?.isDerived;
    const [hov, setHov] = useState(false);
    return (
        <>
            <BaseEdge id={id} path={path} markerEnd={markerEnd}
                style={{ stroke: isDerived ? "var(--pt-intent-primary)" : "var(--pt-intent-success)", strokeWidth: hov ? 3 : 1.5, strokeDasharray: isDerived ? "6 4" : undefined, transition: "stroke-width 0.2s" }} />
            <path d={path} strokeWidth={20} stroke="transparent" fill="none"
                onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} className="cursor-pointer" />
            {label && (
                <EdgeLabelRenderer>
                    <div style={{ position: "absolute", transform: `translate(-50%,-50%) translate(${lx}px,${ly}px)`, pointerEvents: "all" }}
                        className={`bg-pt-bg-panel border text-[9px] font-black uppercase tracking-[0.1em] px-2 py-1 rounded transition-all shadow-xl ${hov ? "border-pt-intent-success text-pt-intent-success shadow-[0_0_10px_rgb(var(--pt-intent-success) / 0.2)]" : "border-pt-border text-pt-text-muted"}`}
                        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
                        {isDerived ? "⚡ " : ""}{label}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
}

const nodeTypes = { entityCard: EntityCardNode };
const edgeTypes = { rel: RelEdge };

// ─── Inline Input Component ───────────────────────────────────────────────────
function InlineInput({ placeholder, onCommit, onCancel }: { placeholder: string; onCommit: (v: string) => void; onCancel: () => void }) {
    const [val, setVal] = useState("");
    const ref = useRef<HTMLInputElement>(null);
    useEffect(() => { ref.current?.focus(); }, []);
    return (
        <input ref={ref} value={val} onChange={e => setVal(e.target.value)} placeholder={placeholder}
            onKeyDown={e => { if (e.key === "Enter" && val.trim()) onCommit(val.trim()); if (e.key === "Escape") onCancel(); }}
            onBlur={() => { if (val.trim()) onCommit(val.trim()); else onCancel(); }}
            className="border border-pt-intent-primary rounded px-3 py-1.5 text-[11px] outline-none w-full bg-pt-bg text-pt-text shadow-inner font-mono" />
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function NoCodeOntologyBuilder() {
    const [entityTypes, setEntityTypes] = useState<EntityType[]>([]);
    const [rules, setRules] = useState<Rule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [rightTab, setRightTab] = useState<"properties" | "relationships" | "rules">("properties");
    const [bottomTab, setBottomTab] = useState<string | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
    const [reasonerRunning, setReasonerRunning] = useState(false);
    const [addingEntity, setAddingEntity] = useState(false);
    const [addingProp, setAddingProp] = useState(false);
    const [addingRule, setAddingRule] = useState(false);
    const [newPropType, setNewPropType] = useState("STRING");
    const [searchTerm, setSearchTerm] = useState("");
    const [graphMode, setGraphMode] = useState<"ontology" | "pipeline">("ontology");

    // Pre-Flight Modal State
    const [preFlight, setPreFlight] = useState<{
        isOpen: boolean;
        targetId: string;
        targetName: string;
    } | null>(null);

    // ReactFlow state
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const showToast = (msg: string, type: "ok" | "err" = "ok") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ── Load entity types ──────────────────────────────────────────────────────
    const loadEntityTypes = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const data: EntityType[] = await apiFetch("/api/ontology/entity-types");
            setEntityTypes(data);

            // Build ReactFlow nodes
            const colors: Record<string, string> = {};
            const rfNodes: Node[] = data.map((et, i) => {
                const color = COLORS[i % COLORS.length];
                colors[et.id] = color;
                return {
                    id: et.id, type: "entityCard",
                    position: { x: 80 + (i % 4) * 310, y: 100 + Math.floor(i / 4) * 260 },
                    data: { label: et.name, entityId: et.id, version: et.version, objectCount: et.objectCount, attributes: et.attributes, color },
                };
            });
            setNodes(rfNodes);

            // Build ReactFlow edges from relationships
            const rfEdges: Edge[] = [];
            for (const et of data) {
                for (const rel of et.outgoingRelationships) {
                    rfEdges.push({
                        id: rel.id, source: et.id, target: rel.targetEntityType.id,
                        type: "rel", label: rel.name,
                        data: { isDerived: false },
                        markerEnd: { type: "arrowclosed" as any, color: "var(--pt-intent-success)", width: 14, height: 14 },
                    });
                }
            }
            setEdges(rfEdges);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadRules = useCallback(async () => {
        try { setRules(await apiFetch("/api/ontology/rules")); } catch { /* silent */ }
    }, []);

    useEffect(() => { loadEntityTypes(); loadRules(); }, []);

    // ── Create entity type ─────────────────────────────────────────────────────
    const handleCreateEntity = async (name: string) => {
        setAddingEntity(false);
        try {
            await apiFetch("/api/ontology/entity-types", { method: "POST", body: JSON.stringify({ name }) });
            showToast(`✓ Created "${name}"`);
            loadEntityTypes();
        } catch (e: any) { showToast(e.message, "err"); }
    };

    // ── Delete entity type ─────────────────────────────────────────────────────
    const handleDeleteEntity = (id: string, name: string) => {
        setPreFlight({ isOpen: true, targetId: id, targetName: name });
    };

    const confirmDeleteEntity = async () => {
        if (!preFlight) return;
        const { targetId, targetName } = preFlight;
        setPreFlight({ ...preFlight, isOpen: false });
        try {
            await apiFetch(`/api/ontology/entity-types/${targetId}`, { method: "DELETE" });
            showToast(`Deleted "${targetName}"`);
            setSelectedId(null);
            loadEntityTypes();
            setPreFlight(null);
        } catch (e: any) {
            showToast(e.message, "err");
            setPreFlight(null);
        }
    };

    // ── Add property ───────────────────────────────────────────────────────────
    const handleAddProperty = async (entityId: string, propName: string) => {
        setAddingProp(false);
        try {
            await apiFetch(`/api/ontology/entity-types/${entityId}/attributes`, {
                method: "POST", body: JSON.stringify({ name: propName, dataType: newPropType, required: false }),
            });
            showToast(`Property "${propName}" added`);
            loadEntityTypes();
        } catch (e: any) { showToast(e.message, "err"); }
    };

    // ── Delete property ────────────────────────────────────────────────────────
    const handleDeleteProp = async (entityId: string, attrId: string) => {
        try {
            await apiFetch(`/api/ontology/entity-types/${entityId}/attributes/${attrId}`, { method: "DELETE" });
            showToast("Property removed");
            loadEntityTypes();
        } catch (e: any) { showToast(e.message, "err"); }
    };

    // ── Create relationship by dragging ───────────────────────────────────────
    const onConnect = useCallback(async (params: Edge | Connection) => {
        const relName = prompt("Link name (e.g. 'hosts_module', 'linked_to'):");
        if (!relName?.trim()) return;
        try {
            const rel = await apiFetch("/api/ontology/relationships", {
                method: "POST",
                body: JSON.stringify({ name: relName.trim(), sourceEntityTypeId: params.source, targetEntityTypeId: params.target }),
            });
            showToast(`Link "${relName}" created`);
            setEdges(eds => addEdge({
                ...params, id: rel.id, type: "rel", label: relName,
                data: { isDerived: false },
                markerEnd: { type: "arrowclosed" as any, color: "var(--pt-intent-success)", width: 14, height: 14 },
            }, eds));
            loadEntityTypes();
        } catch (e: any) { showToast(e.message, "err"); }
    }, []);

    // ── Delete relationship ────────────────────────────────────────────────────
    const handleDeleteRel = async (relId: string) => {
        try {
            await apiFetch(`/api/ontology/relationships/${relId}`, { method: "DELETE" });
            showToast("Relationship removed");
            setEdges(eds => eds.filter(e => e.id !== relId));
            loadEntityTypes();
        } catch (e: any) { showToast(e.message, "err"); }
    };

    // ── Run Reasoner ──────────────────────────────────────────────────────────
    const handleRunReasoner = async () => {
        setReasonerRunning(true);
        try {
            const result = await apiFetch("/api/ontology/reason", { method: "POST" });
            showToast(`Reasoner: ${result.derivedNew} target links found (${result.derivedTotal} total)`);
            loadEntityTypes();
        } catch (e: any) { showToast(e.message, "err"); }
        finally { setReasonerRunning(false); }
    };

    // ── Add Rule ──────────────────────────────────────────────────────────────
    const handleAddRule = async (name: string) => {
        setAddingRule(false);
        try {
            await apiFetch("/api/ontology/rules", {
                method: "POST",
                body: JSON.stringify({
                    name, description: "Logical inference chain configuration",
                    antecedent: [], consequent: { relDefId: "", confidence: 0.9, decayRate: 0 },
                }),
            });
            showToast(`Rule "${name}" initialized`);
            loadRules();
        } catch (e: any) { showToast(e.message, "err"); }
    };

    // ── Preview instances ─────────────────────────────────────────────────────
    const loadPreview = useCallback(async (id: string) => {
        setPreviewLoading(true);
        try {
            const result = await apiFetch(`/api/ontology/entity-types/${id}/instances?limit=10`);
            setPreviewData(result.data ?? []);
        } catch { setPreviewData([]); }
        finally { setPreviewLoading(false); }
    }, []);

    const selectedEntity = entityTypes.find(e => e.id === selectedId);
    const filteredTypes = entityTypes.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="flex flex-col h-full w-full bg-pt-bg text-pt-text overflow-hidden font-mono">

            {/* ── TOAST ── */}
            {toast && (
                <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3 rounded border shadow-2xl text-[11px] font-black uppercase tracking-widest transition-all ${toast.type === "ok" ? "bg-pt-intent-success/90 border-pt-intent-success text-white" : "bg-pt-intent-danger/90 border-pt-intent-danger text-white"}`}>
                    {toast.type === "ok" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {toast.msg}
                </div>
            )}

            {/* ── PRE-FLIGHT MODAL ── */}
            {preFlight && (
                <PreFlightModal
                    isOpen={preFlight.isOpen}
                    onClose={() => setPreFlight(null)}
                    onConfirm={confirmDeleteEntity}
                    actionType="DELETE_ENTITY_TYPE"
                    targetId={preFlight.targetId}
                    actionDescription={`WIPE OBJECT SCHEMA: ${preFlight.targetName}`}
                />
            )}

            {/* ── COMMAND TOOLBAR ── */}
            <div className="h-14 bg-pt-bg-panel border-b border-pt-border flex items-center justify-between px-6 shrink-0 z-20 shadow-lg">
                <div className="flex items-center gap-4">
                    {/* Mode toggle */}
                    <div className="flex bg-pt-bg border border-pt-border rounded-lg overflow-hidden p-0.5">
                        {(["ontology", "pipeline"] as const).map(m => (
                            <button key={m} onClick={() => setGraphMode(m)}
                                className={`px-4 h-8 text-[10px] font-black uppercase tracking-widest transition-all rounded ${graphMode === m ? "bg-pt-intent-primary text-pt-bg shadow-inner" : "text-pt-text-muted hover:text-pt-text hover:bg-pt-bg-panel"}`}>{m}</button>
                        ))}
                    </div>

                    <div className="h-6 w-px bg-pt-border mx-2" />

                    {/* Add entity */}
                    {addingEntity ? (
                        <div className="w-56">
                            <InlineInput placeholder="SCHEMA NAME…" onCommit={handleCreateEntity} onCancel={() => setAddingEntity(false)} />
                        </div>
                    ) : (
                        <button onClick={() => setAddingEntity(true)}
                            className="h-9 flex items-center gap-2 px-4 bg-pt-bg border border-pt-border rounded-lg text-[10px] font-black uppercase tracking-tighter text-pt-text hover:bg-pt-bg-panel hover:border-pt-border-hover transition-all group">
                            <Plus className="w-3.5 h-3.5 text-pt-intent-primary group-hover:scale-110 transition-transform" />
                            Register Object Class
                        </button>
                    )}

                    <button onClick={loadEntityTypes} title="Refresh System"
                        className="h-9 w-9 flex items-center justify-center border border-pt-border rounded-lg hover:bg-pt-bg-panel transition-all active:scale-95">
                        <RefreshCw className={`w-4 h-4 text-pt-text-muted ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    {/* Object Search */}
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-pt-text-muted group-focus-within:text-pt-intent-primary transition-colors" />
                        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            placeholder="SEARCH SCHEMA…" className="h-9 pl-10 pr-4 text-[11px] font-bold border border-pt-border rounded-lg focus:outline-none focus:border-pt-intent-primary bg-pt-bg text-pt-text placeholder:opacity-30 w-64 transition-all" />
                    </div>

                    {/* Global Actions */}
                    <button onClick={handleRunReasoner} disabled={reasonerRunning}
                        className={`h-9 flex items-center gap-2 px-5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border shadow-lg ${reasonerRunning ? 'bg-pt-bg-panel border-pt-border text-pt-text-muted' : 'bg-pt-intent-primary border-pt-intent-primary text-pt-bg hover:brightness-110 active:scale-95'}`}>
                        {reasonerRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {reasonerRunning ? "REASONING…" : "Compute Logic"}
                    </button>

                    <button className="h-9 flex items-center gap-2 px-5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-pt-intent-success text-pt-bg border border-pt-intent-success hover:brightness-110 transition-all active:scale-95">
                        Deploy <ChevronDown className="w-4 h-4 opacity-50" />
                    </button>
                </div>
            </div>

            {/* ── BODY ── */}
            <div className="flex-1 flex min-h-0 bg-pt-bg">

                {/* LEFT NAV: SCHEMA BROWSER */}
                <div className="w-60 bg-pt-bg-panel border-r border-pt-border flex flex-col shrink-0 shadow-2xl z-10">
                    <div className="px-5 py-4 flex items-center justify-between border-b border-pt-border bg-pt-bg-panel/50">
                        <div className="text-[10px] font-black text-pt-text-muted uppercase tracking-[0.2em] opacity-40">
                            Registry ({filteredTypes.length})
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-0.5">
                        {loading && (
                            <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-30">
                                <Loader2 className="w-6 h-6 animate-spin text-pt-intent-primary" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Initialising…</span>
                            </div>
                        )}
                        {error && (
                            <div className="m-3 p-4 bg-pt-intent-danger/10 border border-pt-intent-danger/30 rounded-lg text-[10px] text-pt-intent-danger font-bold leading-relaxed">
                                <AlertCircle className="w-4 h-4 mb-2" />
                                CORE_ERROR: {error}
                            </div>
                        )}
                        {!loading && filteredTypes.map((et, i) => (
                            <button key={et.id} onClick={() => { setSelectedId(et.id); setRightTab("properties"); }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-[11px] rounded-md transition-all group relative overflow-hidden ${selectedId === et.id ? "bg-pt-intent-primary/10 text-pt-text" : "text-pt-text-muted hover:bg-pt-bg hover:text-pt-text"}`}>
                                {selectedId === et.id && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-pt-intent-primary" />
                                )}
                                <span className="w-2 h-2 rounded-full shrink-0 shadow-[0_0_8px_rgb(var(--pt-intent-primary) / 0.3)]" style={{ background: COLORS[i % COLORS.length] }} />
                                <span className="font-bold uppercase tracking-tight truncate flex-1 text-left">{et.name}</span>
                                <span className="text-[9px] font-mono text-pt-text-muted px-1 border border-pt-border rounded opacity-40 group-hover:opacity-100 transition-opacity">{et.attributes.length}P</span>
                            </button>
                        ))}
                    </div>
                    {/* Add entity QuickAction */}
                    <div className="p-3 border-t border-pt-border bg-pt-bg">
                        {addingEntity ? (
                            <InlineInput placeholder="CLASS NAME…" onCommit={handleCreateEntity} onCancel={() => setAddingEntity(false)} />
                        ) : (
                            <button onClick={() => setAddingEntity(true)}
                                className="w-full flex items-center justify-center gap-2 text-[10px] text-pt-intent-primary font-black uppercase tracking-widest hover:bg-pt-intent-primary/10 py-2.5 rounded-lg border border-dashed border-pt-intent-primary/30 transition-all active:scale-95 leading-none">
                                <Plus size={14} /> Add Class
                            </button>
                        )}
                    </div>
                </div>

                {/* CENTER: ONTOLOGY CANVAS */}
                <div className="flex-1 flex flex-col min-w-0 relative">
                    <div className="flex-1 relative bg-[radial-gradient(circle_at_center,_var(--pt-bg-panel)_0%,_var(--pt-bg)_100%)]">
                        {loading && !nodes.length ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-pt-bg">
                                <div className="flex flex-col items-center gap-4 text-pt-intent-primary">
                                    <div className="relative">
                                        <div className="absolute inset-0 animate-ping bg-pt-intent-primary opacity-20 rounded-full" />
                                        <Loader2 className="w-12 h-12 animate-spin relative" />
                                    </div>
                                    <span className="text-[11px] font-black uppercase tracking-[0.4em] animate-pulse">Syncing Lattice</span>
                                </div>
                            </div>
                        ) : (
                            <ReactFlow
                                nodes={nodes.map(n => ({ ...n, data: { ...n.data, selected: n.id === selectedId } }))}
                                edges={edges}
                                onNodesChange={onNodesChange}
                                onEdgesChange={onEdgesChange}
                                onConnect={onConnect}
                                onNodeClick={(_, node) => { setSelectedId(node.id); setRightTab("properties"); }}
                                onPaneClick={() => setSelectedId(null)}
                                nodeTypes={nodeTypes} edgeTypes={edgeTypes}
                                connectionLineType={ConnectionLineType.SmoothStep}
                                fitView fitViewOptions={{ padding: 0.2 }}
                                proOptions={{ hideAttribution: true }}>
                                <Background variant={BackgroundVariant.Lines} gap={40} size={1} color="var(--pt-border)" className="opacity-20" />
                                <Controls showInteractive={false} className="!bg-pt-bg-panel !border-pt-border !rounded-lg !shadow-2xl !fill-pt-text" />
                                <MiniMap
                                    nodeColor={n => COLORS[entityTypes.findIndex(e => e.id === n.id) % COLORS.length] ?? "var(--pt-border)"}
                                    maskColor="rgba(6, 10, 18, 0.8)"
                                    className="!bg-pt-bg-panel !border-pt-border !rounded-lg"
                                />
                            </ReactFlow>
                        )}

                        {/* Interactive Grid Overlay for high-density feel */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90 binary #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                    </div>

                    {/* ── FOOTER: TELEMETRY & PREVIEW ── */}
                    <div className="border-t border-pt-border bg-pt-bg-panel shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20 transition-all">
                        <div className="flex items-center h-10 px-4 gap-2">
                            {["Preview", "Lineage", "Health", "Audit"].map(t => (
                                <button key={t} onClick={() => {
                                    setBottomTab(bottomTab === t ? null : t);
                                    if (t === "Preview" && selectedId) loadPreview(selectedId);
                                }}
                                    className={`flex items-center gap-2 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] rounded-t border-b-2 transition-all ${bottomTab === t ? "text-pt-intent-primary border-pt-intent-primary bg-pt-intent-primary/5" : "text-pt-text-muted hover:text-pt-text border-transparent"}`}>
                                    {t === "Preview" && <Eye size={12} />}
                                    {t === "Lineage" && <Activity size={12} />}
                                    {t === "Health" && <AlertCircle size={12} />}
                                    {t === "Audit" && <BookOpen size={12} />}
                                    {t}
                                </button>
                            ))}
                            <div className="ml-auto flex items-center gap-4 text-[9px] font-bold text-pt-text-muted uppercase tracking-widest opacity-50">
                                <span>LATTICE_OK</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-pt-intent-success animate-pulse" />
                            </div>
                        </div>
                        {bottomTab === "Preview" && (
                            <div className="border-t border-pt-border bg-pt-bg max-h-56 overflow-auto custom-scrollbar">
                                {!selectedEntity && (
                                    <div className="p-10 text-center flex flex-col items-center gap-4">
                                        <Database size={24} className="text-pt-text-muted opacity-20" />
                                        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-pt-text-muted">AWAITING OBJECT TARGETING</div>
                                    </div>
                                )}
                                {selectedEntity && previewLoading && (
                                    <div className="p-10 flex flex-col items-center gap-4">
                                        <Loader2 className="w-6 h-6 animate-spin text-pt-intent-primary" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Hydrating Preview Buffer…</span>
                                    </div>
                                )}
                                {selectedEntity && !previewLoading && previewData.length === 0 && (
                                    <div className="p-10 text-center text-[11px] text-pt-text-muted font-black uppercase tracking-widest opacity-40">CLASS "{selectedEntity.name}" CONTAINS NO VECTORS</div>
                                )}
                                {selectedEntity && !previewLoading && previewData.length > 0 && (() => {
                                    const cols = Object.keys(previewData[0].data ?? {});
                                    return (
                                        <table className="w-full text-[11px]" style={{ borderCollapse: "collapse" }}>
                                            <thead className="sticky top-0 z-10">
                                                <tr className="bg-pt-bg-panel border-b border-pt-border">
                                                    <th className="px-6 py-2.5 text-left text-[9px] font-black text-pt-text-muted uppercase tracking-[0.2em]">VECTOR_ID</th>
                                                    {cols.map(c => <th key={c} className="px-6 py-2.5 text-left text-[9px] font-black text-pt-text-muted uppercase tracking-[0.2em]">{c}</th>)}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-pt-border/30">
                                                {previewData.map((row, i) => (
                                                    <tr key={i} className="hover:bg-pt-intent-primary/5 transition-colors">
                                                        <td className="px-6 py-2.5 text-pt-intent-primary font-mono text-[10px] font-bold">{row.logicalId}</td>
                                                        {cols.map(c => <td key={c} className="px-6 py-2.5 text-pt-text font-mono font-medium">{String(row.data?.[c] ?? "NULL")}</td>)}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    );
                                })()}
                            </div>
                        )}
                        {bottomTab && bottomTab !== "Preview" && (
                            <div className="border-t border-pt-border p-10 text-center">
                                <span className="text-[11px] font-black uppercase tracking-[0.5em] text-pt-text-muted animate-pulse">{bottomTab}_STREAM_ACTIVE</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT PANEL: SCHEMA INSPECTOR */}
                {selectedEntity && (
                    <div className="w-80 bg-pt-bg-panel border-l border-pt-border flex flex-col shrink-0 overflow-hidden shadow-[-10px_0_40px_rgba(0,0,0,0.5)] z-20">
                        {/* Tab Switcher */}
                        <div className="flex border-b border-pt-border bg-pt-bg/50 shrink-0 p-1 gap-1">
                            {(["properties", "relationships", "rules"] as const).map(t => (
                                <button key={t} onClick={() => setRightTab(t)}
                                    className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded transition-all ${rightTab === t ? "bg-pt-intent-primary text-pt-bg shadow-inner" : "text-pt-text-muted hover:text-pt-text hover:bg-pt-bg-panel"}`}>
                                    {t}
                                </button>
                            ))}
                        </div>

                        {/* Inspector Header */}
                        <div className="px-5 py-5 border-b border-pt-border bg-[linear-gradient(135deg,_var(--pt-bg-panel)_0%,_var(--pt-bg)_100%)]">
                            <div className="flex items-start justify-between">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Database size={14} className="text-pt-intent-primary" />
                                        <div className="font-black text-[15px] text-pt-text uppercase tracking-tight truncate leading-none">{selectedEntity.name}</div>
                                    </div>
                                    <div className="text-[9px] text-pt-text-muted font-bold tracking-[0.2em] font-mono">{selectedEntity.id}</div>
                                    <div className="mt-3 flex items-center gap-3">
                                        <div className="px-2 py-0.5 bg-pt-bg-panel border border-pt-border rounded text-[8px] font-black text-pt-text-muted uppercase">V{selectedEntity.version}</div>
                                        <div className="px-2 py-0.5 bg-pt-intent-success/10 border border-pt-intent-success/30 rounded text-[8px] font-black text-pt-intent-success uppercase tracking-widest">Production</div>
                                    </div>
                                </div>
                                <button onClick={() => handleDeleteEntity(selectedEntity.id, selectedEntity.name)}
                                    className="p-2 bg-pt-intent-danger/5 hover:bg-pt-intent-danger/20 hover:text-pt-intent-danger rounded-lg transition-all text-pt-text-muted/50 border border-transparent hover:border-pt-intent-danger/40 group">
                                    <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>

                        {/* Inspector Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {/* Properties tab */}
                            {rightTab === "properties" && (
                                <div className="p-2 space-y-1">
                                    <div className="px-3 py-2 text-[9px] font-black text-pt-text-muted uppercase tracking-[0.2em] opacity-40">Inputs & Schema</div>
                                    {selectedEntity.attributes.map(a => (
                                        <div key={a.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent hover:bg-pt-bg hover:border-pt-border group transition-all">
                                            {a.required ? <Key className="w-3.5 h-3.5 text-pt-intent-primary shrink-0 drop-shadow-[0_0_5px_rgb(var(--pt-intent-primary) / 0.4)]" /> : <Hash className="w-3.5 h-3.5 text-pt-text-muted shrink-0 opacity-30" />}
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[11px] text-pt-text font-bold truncate font-mono tracking-tight uppercase">{a.name}</div>
                                                <div className="text-[8px] text-pt-text-muted font-black tracking-widest opacity-50">{a.dataType}</div>
                                            </div>
                                            <button onClick={() => handleDeleteProp(selectedEntity.id, a.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-pt-intent-danger/20 hover:text-pt-intent-danger rounded-md transition-all text-pt-text-muted">
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {/* Add property injector */}
                                    <div className="p-3 mt-4 border border-dashed border-pt-border rounded-xl bg-pt-bg/30">
                                        {addingProp ? (
                                            <div className="space-y-2">
                                                <div className="text-[9px] font-black text-pt-text-muted uppercase tracking-widest mb-1">Select Data Type</div>
                                                <div className="grid grid-cols-2 gap-1 mb-2">
                                                    {DATA_TYPES.map(t => (
                                                        <button key={t} onClick={() => setNewPropType(t)} className={`text-[9px] font-black px-2 py-1.5 rounded transition-all border ${newPropType === t ? 'bg-pt-intent-primary border-pt-intent-primary text-pt-bg shadow-inner' : 'bg-pt-bg border-pt-border text-pt-text-muted hover:border-pt-border-hover'}`}>
                                                            {t}
                                                        </button>
                                                    ))}
                                                </div>
                                                <InlineInput placeholder="DEFINING ATTR…"
                                                    onCommit={(v) => handleAddProperty(selectedEntity.id, v)}
                                                    onCancel={() => setAddingProp(false)} />
                                            </div>
                                        ) : (
                                            <button onClick={() => setAddingProp(true)}
                                                className="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-pt-intent-primary hover:text-pt-text transition-all py-1">
                                                <Plus size={14} /> Inject Attribute
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Relationships tab */}
                            {rightTab === "relationships" && (
                                <div className="p-4 space-y-6 text-mono">
                                    {selectedEntity.outgoingRelationships.length === 0 && selectedEntity.incomingRelationships.length === 0 && (
                                        <div className="py-20 text-center flex flex-col items-center gap-4 border border-dashed border-pt-border rounded-2xl bg-pt-bg/20">
                                            <Link2 size={24} className="text-pt-text-muted opacity-10" />
                                            <div className="text-[10px] font-bold text-pt-text-muted opacity-30 uppercase tracking-widest leading-loose">
                                                LATENT STATE<br />NO ACTIVE LINKS
                                            </div>
                                        </div>
                                    )}
                                    {selectedEntity.outgoingRelationships.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="text-[9px] font-black text-pt-intent-success uppercase tracking-[0.2em] opacity-60 mb-3 px-1">Outgoing Projections</div>
                                            {selectedEntity.outgoingRelationships.map(rel => (
                                                <div key={rel.id} className="flex items-center gap-3 px-4 py-3 bg-pt-bg border border-pt-border rounded-xl group hover:border-pt-intent-success/50 transition-all">
                                                    <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-pt-intent-success shadow-[0_0_8px_rgb(var(--pt-intent-success) / 0.5)]" />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-[10px] font-black text-pt-intent-success uppercase tracking-widest truncate">{rel.name}</div>
                                                        <div className="text-[11px] font-bold text-pt-text leading-none mt-1 uppercase tracking-tight truncate">{rel.targetEntityType.name}</div>
                                                    </div>
                                                    <button onClick={() => handleDeleteRel(rel.id)}
                                                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-pt-intent-danger/10 hover:text-pt-intent-danger rounded-lg transition-all text-pt-text-muted">
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {selectedEntity.incomingRelationships.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="text-[9px] font-black text-pt-intent-primary uppercase tracking-[0.2em] opacity-60 mb-3 px-1">Incoming Dependencies</div>
                                            {selectedEntity.incomingRelationships.map(rel => (
                                                <div key={rel.id} className="flex items-center gap-3 px-4 py-3 bg-pt-bg border border-pt-border rounded-xl group hover:border-pt-intent-primary/50 transition-all opacity-80">
                                                    <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-pt-intent-primary shadow-[0_0_8px_rgb(var(--pt-intent-primary) / 0.5)]" />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-[10px] font-black text-pt-intent-primary uppercase tracking-widest truncate">{rel.name}</div>
                                                        <div className="text-[11px] font-bold text-pt-text leading-none mt-1 uppercase tracking-tight truncate">{rel.sourceEntityType.name}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Rules tab */}
                            {rightTab === "rules" && (
                                <div className="p-4 space-y-4">
                                    <div className="p-4 rounded-xl bg-pt-intent-primary/5 border border-pt-intent-primary/20 text-[10px] text-pt-text-muted leading-relaxed font-bold uppercase tracking-wide opacity-80">
                                        Logic gates automate vector inference. Running the reasoner executes the heuristic chain defined below.
                                    </div>
                                    {rules.map(rule => (
                                        <div key={rule.id} className="p-4 bg-pt-bg border border-pt-border rounded-xl hover:border-pt-intent-primary/50 transition-all group">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="font-black text-[12px] text-pt-text uppercase tracking-tight">{rule.name}</div>
                                                <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${rule.enabled ? "bg-pt-intent-success/10 text-pt-intent-success border border-pt-intent-success/30" : "bg-pt-bg-panel text-pt-text-muted border border-pt-border opacity-40"}`}>
                                                    {rule.enabled ? "ACTIVE" : "STANDBY"}
                                                </div>
                                            </div>
                                            {rule.description && <div className="text-[10px] text-pt-text-muted font-bold opacity-60 leading-tight uppercase tracking-tight">{rule.description}</div>}
                                            <div className="mt-4 flex justify-between items-center pt-3 border-t border-pt-border">
                                                <span className="text-[8px] font-mono text-pt-text-muted opacity-40 uppercase">GATE_ID: {rule.id.slice(0, 8)}</span>
                                                <button className="opacity-0 group-hover:opacity-100 p-1 hover:text-pt-intent-primary transition-all text-pt-text-muted">
                                                    <Settings size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {rules.length === 0 && (
                                        <div className="py-20 text-center flex flex-col items-center gap-4 opacity-30">
                                            <Sparkles size={24} className="text-pt-intent-primary" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">NO LOGIC GATES DEFINED</span>
                                        </div>
                                    )}
                                    <div className="mt-6">
                                        {addingRule ? (
                                            <InlineInput placeholder="RULE_IDENTIFIER…" onCommit={handleAddRule} onCancel={() => setAddingRule(false)} />
                                        ) : (
                                            <button onClick={() => setAddingRule(true)}
                                                className="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-pt-intent-primary hover:bg-pt-intent-primary/10 py-3 rounded-xl border border-pt-intent-primary/30 transition-all border-dashed">
                                                <Plus size={14} /> INITIALIZE RULE
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
