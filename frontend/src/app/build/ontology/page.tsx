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
    const color = d.color ?? "#0BB68F";
    return (
        <div className={`bg-white text-[12px] shadow-md rounded-lg overflow-hidden transition-all select-none ${selected ? "ring-2 ring-[#137CBD]" : "ring-1 ring-[#CED9E0] hover:ring-[#9FB3BE]"}`}
            style={{ minWidth: 210 }}>
            <Handle type="target" position={Position.Left} style={{ background: color, left: -5, width: 10, height: 10, border: "2px solid white", borderRadius: "50%" }} />
            {/* Header */}
            <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderLeft: `4px solid ${color}`, borderBottom: "1px solid #EBF1F5" }}>
                <div className="w-6 h-6 rounded flex items-center justify-center shrink-0" style={{ background: color }}>
                    <Database className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="font-bold text-[12px] text-[#182026] truncate">{d.label}</div>
                    <div className="text-[9px] text-[#5C7080]">{d.objectCount?.toLocaleString() ?? "0"} objects · v{d.version ?? 1}</div>
                </div>
            </div>
            {/* Properties preview */}
            <div className="px-2 py-1">
                {(d.attributes ?? []).slice(0, 4).map((a: Attribute) => (
                    <div key={a.id} className="flex items-center gap-1.5 py-0.5">
                        {a.required ? <Key className="w-2.5 h-2.5 text-[#137CBD] shrink-0" /> : <Hash className="w-2.5 h-2.5 text-[#5C7080] shrink-0" />}
                        <span className="text-[10px] text-[#182026] truncate flex-1">{a.name}</span>
                        <span className="text-[9px] bg-[#EBF1F5] text-[#5C7080] px-1 rounded font-mono">{a.dataType}</span>
                    </div>
                ))}
                {(d.attributes ?? []).length > 4 && (
                    <div className="text-[9px] text-[#5C7080] py-0.5 pl-4">+{d.attributes.length - 4} more…</div>
                )}
                {(d.attributes ?? []).length === 0 && (
                    <div className="text-[9px] text-[#5C7080] py-1 text-center italic">No properties yet</div>
                )}
            </div>
            <Handle type="source" position={Position.Right} style={{ background: "#137CBD", right: -5, width: 10, height: 10, border: "2px solid white", borderRadius: "50%" }} />
        </div>
    );
}

// ─── Custom Edge: Relationship ────────────────────────────────────────────────
function RelEdge({ id, sourceX, sourceY, targetX, targetY, label, data, markerEnd }: any) {
    const [path, lx, ly] = getSmoothStepPath({ sourceX, sourceY, targetX, targetY, borderRadius: 8 });
    const isDerived = data?.isDerived;
    const [hov, setHov] = useState(false);
    return (
        <>
            <BaseEdge id={id} path={path} markerEnd={markerEnd}
                style={{ stroke: isDerived ? "#137CBD" : "#0BB68F", strokeWidth: hov ? 2.5 : 1.8, strokeDasharray: isDerived ? "5 4" : undefined, transition: "stroke-width 0.15s" }} />
            <path d={path} strokeWidth={16} stroke="transparent" fill="none"
                onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ cursor: "pointer" }} />
            {label && (
                <EdgeLabelRenderer>
                    <div style={{ position: "absolute", transform: `translate(-50%,-50%) translate(${lx}px,${ly}px)`, pointerEvents: "all" }}
                        className={`bg-white border text-[9px] font-mono px-1.5 py-0.5 rounded transition-all ${hov ? "border-[#0BB68F] text-[#0BB68F] shadow" : "border-[#CED9E0] text-[#5C7080]"}`}
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
            className="border border-[#137CBD] rounded px-2 py-0.5 text-[11px] outline-none w-full bg-white shadow-sm" />
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
                        markerEnd: { type: "arrowclosed" as any, color: "#0BB68F", width: 12, height: 12 },
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
        const relName = prompt("Relationship name (e.g. 'hasPilot', 'belongsTo'):");
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
                markerEnd: { type: "arrowclosed" as any, color: "#0BB68F", width: 12, height: 12 },
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
            showToast(`Reasoner: ${result.derivedNew} new derived relationships (${result.derivedTotal} total)`);
            loadEntityTypes();
        } catch (e: any) { showToast(e.message, "err"); }
        finally { setReasonerRunning(false); }
    };

    // ── Add Rule ──────────────────────────────────────────────────────────────
    const handleAddRule = async (name: string) => {
        setAddingRule(false);
        // Simple scaffold rule — user can configure via API later
        try {
            await apiFetch("/api/ontology/rules", {
                method: "POST",
                body: JSON.stringify({
                    name, description: "Configure antecedent and consequent via API",
                    antecedent: [], consequent: { relDefId: "", confidence: 0.9, decayRate: 0 },
                }),
            });
            showToast(`Rule "${name}" created`);
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
        <div className="flex flex-col h-full w-full bg-[#F5F8FA] overflow-hidden font-[Inter,sans-serif]">

            {/* ── TOAST ── */}
            {toast && (
                <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg text-[12px] font-bold text-white transition-all ${toast.type === "ok" ? "bg-[#0F9960]" : "bg-[#DB3737]"}`}>
                    {toast.type === "ok" ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
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
                    actionDescription={`Drop Ontology Entity: ${preFlight.targetName}`}
                />
            )}

            {/* ── TOOLBAR ── */}
            <div className="h-11 bg-white border-b border-[#CED9E0] flex items-center justify-between px-3 shrink-0 z-10">
                <div className="flex items-center gap-2">
                    {/* Mode toggle */}
                    <div className="flex bg-[#F5F8FA] border border-[#CED9E0] rounded overflow-hidden text-[11px]">
                        {(["ontology", "pipeline"] as const).map(m => (
                            <button key={m} onClick={() => setGraphMode(m)}
                                className={`px-3 h-7 font-bold capitalize transition-colors ${graphMode === m ? "bg-[#137CBD] text-white" : "text-[#5C7080] hover:bg-[#E4E8ED]"}`}>{m}</button>
                        ))}
                    </div>

                    <div className="h-5 w-px bg-[#CED9E0]" />

                    {/* Add entity */}
                    {addingEntity ? (
                        <div className="w-44">
                            <InlineInput placeholder="Entity name…" onCommit={handleCreateEntity} onCancel={() => setAddingEntity(false)} />
                        </div>
                    ) : (
                        <button onClick={() => setAddingEntity(true)}
                            className="h-7 flex items-center gap-1.5 px-3 border border-[#CED9E0] rounded text-[11px] font-bold text-[#182026] hover:bg-[#EBF1F5] hover:border-[#9FB3BE] transition-colors">
                            <Plus className="w-3 h-3 text-[#137CBD]" /> Add Object Type
                        </button>
                    )}

                    <button onClick={loadEntityTypes} title="Refresh"
                        className="h-7 w-7 flex items-center justify-center border border-[#CED9E0] rounded hover:bg-[#EBF1F5] transition-colors">
                        <RefreshCw className={`w-3.5 h-3.5 text-[#5C7080] ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#5C7080]" />
                        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search objects…" className="h-7 pl-6 pr-2 text-[11px] border border-[#CED9E0] rounded focus:outline-none focus:border-[#137CBD] bg-white" />
                    </div>

                    {/* Run Reasoner */}
                    <button onClick={handleRunReasoner} disabled={reasonerRunning}
                        className="h-7 flex items-center gap-1.5 px-3 rounded text-[11px] font-bold text-white transition-all disabled:opacity-60"
                        style={{ background: reasonerRunning ? "#5C7080" : "#137CBD" }}>
                        {reasonerRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        {reasonerRunning ? "Running…" : "Run Reasoner"}
                    </button>

                    <button className="h-7 flex items-center gap-1.5 px-3 rounded text-[11px] font-bold text-white" style={{ background: "#0F9960" }}>
                        Save <ChevronDown className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* ── BODY ── */}
            <div className="flex-1 flex min-h-0">

                {/* LEFT SIDEBAR */}
                <div className="w-52 bg-white border-r border-[#CED9E0] flex flex-col shrink-0">
                    <div className="px-2 pt-2 pb-1 text-[9px] font-bold text-[#5C7080] uppercase tracking-wider">
                        Object Types ({filteredTypes.length})
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {loading && (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-4 h-4 animate-spin text-[#5C7080]" />
                            </div>
                        )}
                        {error && (
                            <div className="mx-2 p-2 bg-red-50 border border-red-200 rounded text-[10px] text-red-600">
                                <AlertCircle className="w-3 h-3 inline mr-1" />{error}
                            </div>
                        )}
                        {!loading && filteredTypes.map((et, i) => (
                            <button key={et.id} onClick={() => { setSelectedId(et.id); setRightTab("properties"); }}
                                className={`w-full flex items-center gap-2 px-2 py-2 text-[11px] border-l-2 mb-px transition-colors ${selectedId === et.id ? "border-[#137CBD] bg-[#EBF1F5] text-[#182026]" : "border-transparent text-[#5C7080] hover:bg-[#F5F8FA]"}`}>
                                <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                                <span className="font-medium truncate flex-1 text-left">{et.name}</span>
                                <span className="text-[9px] text-[#5C7080]">{et.attributes.length}p</span>
                            </button>
                        ))}
                        {!loading && filteredTypes.length === 0 && !error && (
                            <div className="px-3 py-6 text-center text-[11px] text-[#5C7080]">
                                <Database className="w-6 h-6 mx-auto mb-2 opacity-30" />
                                No object types yet.<br />Click "Add Object Type" to start.
                            </div>
                        )}
                    </div>
                    {/* Add entity shortcut */}
                    <div className="p-2 border-t border-[#CED9E0]">
                        {addingEntity ? (
                            <InlineInput placeholder="Type name…" onCommit={handleCreateEntity} onCancel={() => setAddingEntity(false)} />
                        ) : (
                            <button onClick={() => setAddingEntity(true)}
                                className="w-full flex items-center justify-center gap-1 text-[11px] text-[#137CBD] font-bold hover:bg-[#EBF1F5] py-1.5 rounded transition-colors">
                                <Plus className="w-3.5 h-3.5" /> Add Object Type
                            </button>
                        )}
                    </div>
                </div>

                {/* CENTER — ReactFlow canvas */}
                <div className="flex-1 flex flex-col min-w-0 relative">
                    <div className="flex-1 relative">
                        {loading && !nodes.length ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-3 text-[#5C7080]">
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                    <span className="text-[12px] font-bold">Loading ontology…</span>
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
                                proOptions={{ hideAttribution: false }}>
                                <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="#D8E1E8" />
                                <Controls showInteractive={false} className="!bg-white !border-[#CED9E0] !rounded !shadow-sm" />
                                <MiniMap nodeColor={n => COLORS[entityTypes.findIndex(e => e.id === n.id) % COLORS.length] ?? "#CED9E0"}
                                    style={{ background: "white", border: "1px solid #CED9E0", borderRadius: 4 }} />
                            </ReactFlow>
                        )}

                        {/* Empty state overlay */}
                        {!loading && nodes.length === 0 && !error && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-[#EBF1F5] flex items-center justify-center mx-auto mb-4">
                                        <GitBranch className="w-8 h-8 text-[#5C7080]" />
                                    </div>
                                    <p className="text-[14px] font-bold text-[#182026]">No Object Types</p>
                                    <p className="text-[11px] text-[#5C7080] mt-1">Use the toolbar to add your first object type,<br />then drag to connect them.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── BOTTOM PANEL ── */}
                    <div className="border-t border-[#CED9E0] bg-white shrink-0">
                        <div className="flex items-center h-8 px-2 gap-1">
                            {["Preview", "Lineage", "Health"].map(t => (
                                <button key={t} onClick={() => {
                                    setBottomTab(bottomTab === t ? null : t);
                                    if (t === "Preview" && selectedId) loadPreview(selectedId);
                                }}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded transition-colors ${bottomTab === t ? "text-[#137CBD] bg-[#EBF1F5]" : "text-[#5C7080] hover:text-[#182026]"}`}>
                                    {t === "Preview" && <Eye className="w-3 h-3" />}
                                    {t === "Lineage" && <Activity className="w-3 h-3" />}
                                    {t === "Health" && <AlertCircle className="w-3 h-3" />}
                                    {t}
                                </button>
                            ))}
                        </div>
                        {bottomTab === "Preview" && (
                            <div className="border-t border-[#CED9E0] max-h-44 overflow-auto">
                                {!selectedEntity && <div className="p-4 text-center text-[11px] text-[#5C7080]">Select an object type on the canvas to preview its data</div>}
                                {selectedEntity && previewLoading && <div className="p-4 flex justify-center"><Loader2 className="w-4 h-4 animate-spin text-[#5C7080]" /></div>}
                                {selectedEntity && !previewLoading && previewData.length === 0 && (
                                    <div className="p-4 text-center text-[11px] text-[#5C7080]">No data yet for "{selectedEntity.name}"</div>
                                )}
                                {selectedEntity && !previewLoading && previewData.length > 0 && (() => {
                                    const cols = Object.keys(previewData[0].data ?? {});
                                    return (
                                        <table className="w-full text-[11px]" style={{ borderCollapse: "collapse" }}>
                                            <thead>
                                                <tr style={{ background: "#F5F8FA", position: "sticky", top: 0 }}>
                                                    <th className="px-3 py-1.5 border-b text-left text-[10px] font-bold text-[#5C7080] border-[#CED9E0]">logicalId</th>
                                                    {cols.map(c => <th key={c} className="px-3 py-1.5 border-b text-left text-[10px] font-bold text-[#5C7080] border-[#CED9E0]">{c}</th>)}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {previewData.map((row, i) => (
                                                    <tr key={i} className="border-b hover:bg-[#F5F8FA] border-[#CED9E0]">
                                                        <td className="px-3 py-1 text-[#5C7080] font-mono text-[10px]">{row.logicalId}</td>
                                                        {cols.map(c => <td key={c} className="px-3 py-1 text-[#182026]">{String(row.data?.[c] ?? "—")}</td>)}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    );
                                })()}
                            </div>
                        )}
                        {bottomTab && bottomTab !== "Preview" && (
                            <div className="border-t border-[#CED9E0] p-4 text-center text-[11px] text-[#5C7080]">{bottomTab} panel</div>
                        )}
                    </div>
                </div>

                {/* RIGHT PANEL — Details */}
                {selectedEntity && (
                    <div className="w-72 bg-white border-l border-[#CED9E0] flex flex-col shrink-0 overflow-hidden">
                        {/* Tabs */}
                        <div className="flex border-b border-[#CED9E0] bg-[#F5F8FA] shrink-0">
                            {(["properties", "relationships", "rules"] as const).map(t => (
                                <button key={t} onClick={() => setRightTab(t)}
                                    className={`flex-1 py-2 text-[10px] font-bold capitalize border-b-2 transition-colors ${rightTab === t ? "border-[#137CBD] text-[#137CBD] bg-white" : "border-transparent text-[#5C7080] hover:text-[#182026]"}`}>
                                    {t}
                                </button>
                            ))}
                        </div>

                        {/* Entity header */}
                        <div className="px-3 py-2.5 border-b border-[#CED9E0]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-[13px] text-[#182026]">{selectedEntity.name}</div>
                                    <div className="text-[10px] text-[#5C7080]">{selectedEntity.objectCount.toLocaleString()} objects · v{selectedEntity.version}</div>
                                </div>
                                <button onClick={() => handleDeleteEntity(selectedEntity.id, selectedEntity.name)}
                                    className="p-1 hover:bg-red-50 hover:text-red-600 rounded transition-colors text-[#5C7080]">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Properties tab */}
                        {rightTab === "properties" && (
                            <div className="flex-1 overflow-y-auto">
                                {selectedEntity.attributes.map(a => (
                                    <div key={a.id} className="flex items-center gap-2 px-3 py-2 border-b border-[#CED9E0]/40 hover:bg-[#F5F8FA] group">
                                        {a.required ? <Key className="w-3 h-3 text-[#137CBD] shrink-0" /> : <Hash className="w-3 h-3 text-[#5C7080] shrink-0" />}
                                        <span className="text-[11px] text-[#182026] font-medium flex-1 font-mono">{a.name}</span>
                                        <span className="text-[9px] bg-[#EBF1F5] text-[#5C7080] px-1.5 py-0.5 rounded">{a.dataType}</span>
                                        <button onClick={() => handleDeleteProp(selectedEntity.id, a.id)}
                                            className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-500 transition-all text-[#5C7080]">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                {/* Add property */}
                                <div className="px-3 py-2 border-b border-[#CED9E0]/40">
                                    {addingProp ? (
                                        <div className="space-y-1.5">
                                            <select value={newPropType} onChange={e => setNewPropType(e.target.value)}
                                                className="w-full text-[11px] border border-[#CED9E0] rounded px-2 py-0.5 focus:outline-none focus:border-[#137CBD] bg-white">
                                                {DATA_TYPES.map(t => <option key={t}>{t}</option>)}
                                            </select>
                                            <InlineInput placeholder="Property name…"
                                                onCommit={(v) => handleAddProperty(selectedEntity.id, v)}
                                                onCancel={() => setAddingProp(false)} />
                                        </div>
                                    ) : (
                                        <button onClick={() => setAddingProp(true)}
                                            className="w-full flex items-center gap-1 text-[11px] text-[#137CBD] font-bold py-0.5 hover:text-[#0E6694] transition-colors">
                                            <Plus className="w-3 h-3" /> Add Property
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Relationships tab */}
                        {rightTab === "relationships" && (
                            <div className="flex-1 overflow-y-auto">
                                {selectedEntity.outgoingRelationships.length === 0 && selectedEntity.incomingRelationships.length === 0 && (
                                    <div className="p-4 text-center text-[11px] text-[#5C7080]">
                                        <Link2 className="w-5 h-5 mx-auto mb-1 opacity-30" />
                                        No relationships yet.<br />Drag from a node handle to connect objects.
                                    </div>
                                )}
                                {selectedEntity.outgoingRelationships.length > 0 && (
                                    <>
                                        <div className="px-3 pt-2 pb-1 text-[9px] font-bold text-[#5C7080] uppercase tracking-wider">Outgoing</div>
                                        {selectedEntity.outgoingRelationships.map(rel => (
                                            <div key={rel.id} className="flex items-center gap-2 px-3 py-2 border-b border-[#CED9E0]/40 hover:bg-[#F5F8FA] group">
                                                <span className="text-[9px] font-bold text-[#0BB68F] bg-[#0BB68F]/10 px-1.5 py-0.5 rounded">{rel.name}</span>
                                                <span className="text-[10px] text-[#5C7080] flex-1">→ {rel.targetEntityType.name}</span>
                                                <button onClick={() => handleDeleteRel(rel.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-500 text-[#5C7080]">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </>
                                )}
                                {selectedEntity.incomingRelationships.length > 0 && (
                                    <>
                                        <div className="px-3 pt-2 pb-1 text-[9px] font-bold text-[#5C7080] uppercase tracking-wider">Incoming</div>
                                        {selectedEntity.incomingRelationships.map(rel => (
                                            <div key={rel.id} className="flex items-center gap-2 px-3 py-2 border-b border-[#CED9E0]/40 hover:bg-[#F5F8FA]">
                                                <span className="text-[9px] font-bold text-[#137CBD] bg-[#137CBD]/10 px-1.5 py-0.5 rounded">{rel.name}</span>
                                                <span className="text-[10px] text-[#5C7080] flex-1">← {rel.sourceEntityType.name}</span>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}

                        {/* Rules tab */}
                        {rightTab === "rules" && (
                            <div className="flex-1 overflow-y-auto">
                                <div className="px-3 py-2 border-b border-[#CED9E0]/40 text-[10px] text-[#5C7080]">
                                    Rules automatically infer new relationships. When you click "Run Reasoner", the engine follows these rule chains to derive new connections.
                                </div>
                                {rules.map(rule => (
                                    <div key={rule.id} className="px-3 py-2 border-b border-[#CED9E0]/40 hover:bg-[#F5F8FA]">
                                        <div className="flex items-center justify-between">
                                            <div className="font-bold text-[11px] text-[#182026]">{rule.name}</div>
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${rule.enabled ? "bg-[#0BB68F]/10 text-[#0BB68F]" : "bg-gray-100 text-gray-400"}`}>
                                                {rule.enabled ? "Active" : "Off"}
                                            </span>
                                        </div>
                                        {rule.description && <div className="text-[9px] text-[#5C7080] mt-0.5">{rule.description}</div>}
                                    </div>
                                ))}
                                {rules.length === 0 && (
                                    <div className="p-4 text-center text-[11px] text-[#5C7080]">
                                        <Sparkles className="w-5 h-5 mx-auto mb-1 opacity-30" />
                                        No inference rules yet.
                                    </div>
                                )}
                                <div className="px-3 py-2">
                                    {addingRule ? (
                                        <InlineInput placeholder="Rule name…" onCommit={handleAddRule} onCancel={() => setAddingRule(false)} />
                                    ) : (
                                        <button onClick={() => setAddingRule(true)}
                                            className="w-full flex items-center gap-1 text-[11px] text-[#137CBD] font-bold py-0.5 hover:text-[#0E6694]">
                                            <Plus className="w-3 h-3" /> Add Rule
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
