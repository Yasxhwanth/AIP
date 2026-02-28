"use client";
import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import ReactFlow, {
    Background, Controls, Node, Edge, ConnectionLineType,
    useNodesState, useEdgesState, Handle, Position, BackgroundVariant,
    addEdge, Connection, EdgeLabelRenderer, BaseEdge, getSmoothStepPath,
    NodeProps,
} from "reactflow";
import "reactflow/dist/style.css";
import { useBuilderStore } from "@/store/builderStore";
import {
    GitBranch, Search, Maximize, Undo, Redo, MousePointer2,
    Trash2, AlignCenter, LayoutGrid, Eye, ChevronDown, Database,
    Layers, Activity, Code2, History, X, Calendar, Play,
    BookOpen, AlertCircle, RefreshCw, Settings, Hash, Quote,
    Key, Plus, Plane, Target, User, Zap, ChevronRight,
    Shuffle, Link2, Table, Pencil, FileOutput, ChevronLeft,
    Sparkles, MoreHorizontal, Clock, ArrowRightLeft
} from "lucide-react";

const ENT_COLORS: Record<string, string> = {
    "ent-drone": "#0BB68F", "ent-mission": "#137CBD", "ent-pilot": "#8B5CF6",
};

// ─── Ontology Entity Card Node ───────────────────────────────────────────────
const EntityCardNode = ({ data, selected }: NodeProps) => {
    const accent = ENT_COLORS[(data as any).entityId] || "#0BB68F";
    const Icon = (data as any).icon === "Plane" ? Plane : (data as any).icon === "Target" ? Target : User;
    return (
        <div className={`bg-white text-[12px] shadow rounded overflow-hidden ${selected ? "ring-2 ring-[#137CBD]" : "ring-1 ring-[#CED9E0]"}`} style={{ minWidth: 200 }}>
            <Handle type="target" position={Position.Left} style={{ background: accent, left: -5, width: 10, height: 10, border: "2px solid white" }} />
            <div className="flex items-center gap-2 px-3 py-2 border-b border-[#CED9E0]" style={{ borderLeft: `4px solid ${accent}` }}>
                <div className="w-6 h-6 rounded flex items-center justify-center shrink-0" style={{ background: accent }}>
                    <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                    <div className="font-bold text-[12px] text-[#182026]">{(data as any).label}</div>
                    <div className="text-[9px] text-[#5C7080]">{(data as any).objectCount || "7,284"} objects</div>
                </div>
            </div>
            {(data as any).props?.slice(0, 3).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between px-3 py-1 border-b border-[#F5F8FA]">
                    <span className="text-[10px] text-[#5C7080] truncate">{p.name}</span>
                    <span className="text-[9px] font-mono bg-[#EBF1F5] text-[#5C7080] px-1 rounded">{p.type}</span>
                </div>
            ))}
            <Handle type="source" position={Position.Right} style={{ background: "#137CBD", right: -5, width: 10, height: 10, border: "2px solid white" }} />
        </div>
    );
};

// ─── Pipeline Dataset/Transform Node (Palantir style) ────────────────────────
const PipelineNode = ({ data, selected }: NodeProps) => {
    const d = data as any;
    const colorMap: Record<string, { bg: string; border: string; icon: string }> = {
        dataset: { bg: "#EBF1F5", border: "#C5D5E0", icon: "#3A7BBE" },
        python: { bg: "#FFF8E6", border: "#D9A320", icon: "#A67800" },
        sql: { bg: "#FFF2E3", border: "#D9822B", icon: "#BF6A00" },
        sync: { bg: "#E6F7EE", border: "#0F9960", icon: "#0A6640" },
    };
    const c = colorMap[d.type] || colorMap.dataset;
    const TypeIcon = d.type === "python" ? Zap : d.type === "sql" ? Database : d.type === "sync" ? RefreshCw : Database;
    return (
        <div className={`bg-white border rounded shadow-sm text-[11px] font-sans ${selected ? "border-[#137CBD] ring-1 ring-[#137CBD]/30" : "border-[#CED9E0]"}`}
            style={{ minWidth: 160 }}>
            <Handle type="target" position={Position.Left}
                style={{ background: "#C5D5E0", borderColor: "white", borderWidth: 2, width: 10, height: 10, borderRadius: "50%", left: -5 }} />
            <div className="flex items-center gap-2 px-3 py-2" style={{ borderLeft: `3px solid ${c.icon}` }}>
                <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ background: c.bg }}>
                    <TypeIcon className="w-3 h-3" style={{ color: c.icon }} />
                </div>
                <div className="min-w-0">
                    <div className="font-bold text-[11px] text-[#182026] truncate max-w-[130px]">{d.label}</div>
                    <div className="text-[9px] text-[#5C7080]">{d.columns ?? "—"} columns</div>
                </div>
                {d.hasSchedule && <Clock className="w-3 h-3 text-[#5C7080] ml-auto shrink-0" />}
            </div>
            {d.status === "out-of-date" && (
                <div className="px-3 py-0.5 bg-amber-50 border-t border-amber-100 text-[9px] text-amber-700 font-bold flex items-center gap-1">
                    <AlertCircle className="w-2.5 h-2.5" /> Out of date
                </div>
            )}
            <Handle type="source" position={Position.Right}
                style={{ background: "#137CBD", borderColor: "white", borderWidth: 2, width: 10, height: 10, borderRadius: "50%", right: -5 }} />
        </div>
    );
};

// ─── Relationship Edge ───────────────────────────────────────────────────────
const RelEdge = ({ id, sourceX, sourceY, targetX, targetY, label, style, markerEnd, data }: any) => {
    const [path, lx, ly] = getSmoothStepPath({ sourceX, sourceY, targetX, targetY });
    const [hov, setHov] = useState(false);
    return (
        <>
            <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />
            <path d={path} strokeWidth={14} stroke="transparent" fill="none"
                onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ cursor: "pointer" }} />
            {label && (
                <EdgeLabelRenderer>
                    <div style={{ position: "absolute", transform: `translate(-50%,-50%) translate(${lx}px,${ly}px)`, pointerEvents: "all" }}
                        className={`bg-white border text-[9px] font-mono px-1.5 py-0.5 rounded transition-all ${hov ? "border-[#0BB68F] text-[#0BB68F]" : "border-[#CED9E0] text-[#5C7080]"}`}
                        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
                        {label}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
};

const nodeTypes = { foundry: PipelineNode, entityCard: EntityCardNode };
const edgeTypes = { rel: RelEdge };

// ─── Context Menu ────────────────────────────────────────────────────────────
const ContextMenu = ({ x, y, node, onClose, onAction }: { x: number; y: number; node: Node; onClose: () => void; onAction: (a: string) => void }) => {
    const items = [
        { icon: ArrowRightLeft, label: "Transform", color: "#137CBD" },
        { icon: Link2, label: "Join", color: "#137CBD" },
        { icon: Shuffle, label: "Union", color: "#D9534F" },
        { icon: Sparkles, label: "Explain", color: "#A855F7" },
        { icon: FileOutput, label: "Add output", color: "#0BB68F" },
        { icon: Pencil, label: "Edit", color: "#5C7080" },
        { icon: Eye, label: "Preview", color: "#5C7080" },
    ];
    return (
        <div className="fixed z-50 bg-white rounded shadow-lg border border-[#CED9E0] py-1 text-[12px]"
            style={{ top: y, left: x }} onMouseLeave={onClose}>
            {items.map(item => (
                <button key={item.label} onClick={() => { onAction(item.label); onClose(); }}
                    className="flex items-center gap-2.5 w-full px-3 py-1.5 hover:bg-[#EBF1F5] text-left">
                    <item.icon className="w-3.5 h-3.5 shrink-0" style={{ color: item.color }} />
                    <span className="font-medium text-[#182026]">{item.label}</span>
                </button>
            ))}
        </div>
    );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function OntologyBuilder() {
    const { entityTypes, updateEntityType, pipelineNodes, pipelineEdges, updatePipelineNodes, updatePipelineEdges } = useBuilderStore();

    const [graphMode, setGraphMode] = useState<"ontology" | "pipeline">("ontology");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [detailTab, setDetailTab] = useState<"properties" | "relationships" | "metrics">("properties");
    const [rightTab, setRightTab] = useState<"info" | "search" | "builds" | "layers">("info");
    const [topTab, setTopTab] = useState<"graph" | "proposals" | "history">("graph");
    const [bottomTab, setBottomTab] = useState<string | null>(null);
    const [showLegend, setShowLegend] = useState(true);
    const [outputsOpen, setOutputsOpen] = useState(false);
    const [buildStatus, setBuildStatus] = useState<"idle" | "running" | "done">("idle");
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: Node } | null>(null);
    const [showDatasets, setShowDatasets] = useState(true);
    const [forceRebuild, setForceRebuild] = useState(false);

    // Ontology nodes/edges
    const entityIdSet = useMemo(() => new Set(entityTypes.map(e => e.id)), [entityTypes]);
    const ENT_POS: Record<string, { x: number; y: number }> = {
        "ent-drone": { x: 60, y: 130 },
        "ent-mission": { x: 420, y: 30 },
        "ent-pilot": { x: 420, y: 270 },
    };
    const ontNodes = useMemo(() => entityTypes.map((ent, i): Node => ({
        id: ent.id, type: "entityCard",
        position: ENT_POS[ent.id] || { x: 60 + i * 360, y: 130 },
        data: {
            label: ent.name, entityId: ent.id, icon: ent.icon,
            objectCount: ent.id === "ent-drone" ? "7,284" : ent.id === "ent-mission" ? "412" : "89",
            props: ent.properties
        }
    })), [entityTypes]);

    const ontEdges = useMemo(() => pipelineEdges
        .filter(pe => entityIdSet.has(pe.source) && entityIdSet.has(pe.target))
        .map(pe => ({
            id: pe.id, source: pe.source, target: pe.target, type: "rel",
            label: `${pe.source.replace("ent-", "")} → ${pe.target.replace("ent-", "")}`,
            style: { stroke: "#0BB68F", strokeWidth: 2 }
        })), [pipelineEdges, entityIdSet]);

    // Pipeline nodes/edges
    const pipNodes = useMemo(() => pipelineNodes.map(pn => ({
        id: pn.id, type: "foundry", position: pn.position,
        data: { label: pn.name, type: pn.type, status: pn.status, hasSchedule: pn.hasSchedule, columns: (pn as any).columns }
    })), [pipelineNodes]);

    const pipEdges = useMemo(() => pipelineEdges
        .filter(pe => !entityIdSet.has(pe.source) || !entityIdSet.has(pe.target))
        .map(pe => ({
            id: pe.id, source: pe.source, target: pe.target,
            type: "smoothstep", style: { stroke: "#A9B8C2", strokeWidth: 1.5 },
            animated: buildStatus === "running"
        })), [pipelineEdges, entityIdSet, buildStatus]);

    const activeNodes = graphMode === "ontology" ? ontNodes : pipNodes;
    const activeEdges = graphMode === "ontology" ? ontEdges : pipEdges;

    const [nodes, setNodes, onNodesChange] = useNodesState(activeNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(activeEdges);
    useEffect(() => { setNodes(activeNodes); }, [activeNodes]);
    useEffect(() => { setEdges(activeEdges); }, [activeEdges]);

    const onConnect = useCallback((params: Edge | Connection) =>
        setEdges(eds => addEdge({ ...params, type: "smoothstep", style: { stroke: "#A9B8C2", strokeWidth: 1.5 } }, eds)), []);

    const onSelectionChange = useCallback(({ nodes: ns }: { nodes: Node[] }) =>
        setSelectedId(ns.length > 0 ? ns[0].id : null), []);

    const selectedNode = nodes.find(n => n.id === selectedId);
    const activeEntity = selectedNode ? entityTypes.find(e => e.id === selectedNode.data.entityId) : null;

    // Right-click context menu
    const onNodeContextMenu = useCallback((e: React.MouseEvent, node: Node) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, node });
    }, []);

    const handleContextAction = (action: string) => {
        if (action === "Preview") setBottomTab("Preview");
        if (action === "Join") setBottomTab("Join");
    };

    const handleRunBuild = () => {
        setBuildStatus("running");
        setRightTab("builds");
        setTimeout(() => setBuildStatus("done"), 3000);
    };

    const BUILD_DATASETS = [
        { name: "drone_telemetry_raw", path: "/aip/foundry/datasets/telemetry/drone_telemetry_raw", lastBuilt: "2/28/26 08:04" },
        { name: "clean_gps_coords", path: "/aip/foundry/transforms-python/src/fleet/clean_gps_coords", lastBuilt: "2/28/26 08:12" },
        { name: "battery_anomalies", path: "/aip/foundry/transforms-sql/src/fleet/battery_anomalies", lastBuilt: "2/28/26 07:51" },
    ];

    // Pipeline output nodes (those that feed entity nodes)
    const outputDatasets = pipelineNodes.filter(n => pipelineEdges.some(e => e.source === n.id && entityIdSet.has(e.target)));

    return (
        <div className="flex flex-col h-full w-full bg-[#F5F8FA] overflow-hidden" onClick={() => setContextMenu(null)}>

            {/* Context menu */}
            {contextMenu && (
                <ContextMenu x={contextMenu.x} y={contextMenu.y} node={contextMenu.node}
                    onClose={() => setContextMenu(null)} onAction={handleContextAction} />
            )}

            {/* ── TOP TAB BAR (Pipeline mode) ── */}
            {graphMode === "pipeline" && (
                <div className="h-9 bg-white border-b border-[#CED9E0] flex items-center px-4 gap-1 shrink-0 z-20">
                    {(["graph", "proposals", "history"] as const).map(t => (
                        <button key={t} onClick={() => setTopTab(t)}
                            className={`px-4 h-full capitalize text-[12px] font-bold border-b-2 transition-colors ${topTab === t ? "border-[#137CBD] text-[#137CBD]" : "border-transparent text-[#5C7080] hover:text-[#182026]"}`}
                        >{t}</button>
                    ))}
                    <div className="ml-auto flex items-center gap-1 text-[11px] text-[#5C7080]">
                        <span className="px-2 py-0.5 bg-[#EBF1F5] rounded font-bold text-[#182026]">Batch</span>
                        <span className="ml-2 text-[10px]">⚡ 26 changes</span>
                    </div>
                </div>
            )}

            {/* ── TOOLBAR ── */}
            <div className="h-11 bg-white border-b border-[#CED9E0] flex items-center justify-between px-2 shrink-0 z-10">
                <div className="flex items-center h-full gap-0.5">

                    {/* Tools group */}
                    <div className="flex items-center h-full border-r border-[#CED9E0] pr-2 mr-1">
                        {[{ icon: MousePointer2, label: "Tools" }, { icon: Trash2, label: "Remove" }, { icon: LayoutGrid, label: "Layout" }].map(({ icon: Icon, label }) => (
                            <button key={label} title={label}
                                className="flex flex-col items-center justify-center w-10 h-full gap-0.5 text-[9px] font-bold text-[#5C7080] hover:bg-[#F5F8FA] hover:text-[#182026]">
                                <Icon className="w-3.5 h-3.5" />{label}
                            </button>
                        ))}
                    </div>

                    {/* Mode toggle */}
                    <div className="flex items-center h-full px-2 border-r border-[#CED9E0] mr-1">
                        <div className="flex bg-[#F5F8FA] border border-[#CED9E0] rounded overflow-hidden text-[11px]">
                            {(["ontology", "pipeline"] as const).map(m => (
                                <button key={m} onClick={() => { setGraphMode(m); setSelectedId(null); }}
                                    className={`px-3 h-7 font-bold capitalize transition-colors ${graphMode === m ? "bg-[#137CBD] text-white" : "text-[#5C7080] hover:bg-[#E4E8ED]"}`}>{m}</button>
                            ))}
                        </div>
                    </div>

                    {/* Pipeline-specific toolbar */}
                    {graphMode === "pipeline" && (
                        <>
                            <button className="h-7 flex items-center gap-1.5 px-3 border border-[#CED9E0] rounded text-[11px] font-bold text-[#182026] hover:bg-[#EBF1F5] mr-1">
                                <Plus className="w-3 h-3 text-[#137CBD]" /> Add data <ChevronDown className="w-3 h-3" />
                            </button>
                            <button className="h-7 flex items-center gap-1.5 px-2 border border-[#CED9E0] rounded text-[11px] font-bold text-[#182026] hover:bg-[#EBF1F5] mr-1">
                                <span className="text-[10px] font-mono text-[#5C7080]">fx</span> Reusables <ChevronDown className="w-3 h-3" />
                            </button>
                            {/* Transform group */}
                            <div className="flex items-center h-full border-r border-[#CED9E0] pr-2 mr-1">
                                {[
                                    { icon: ArrowRightLeft, label: "Transform", color: "#137CBD" },
                                    { icon: Link2, label: "Join", color: "#137CBD" },
                                    { icon: Shuffle, label: "Union", color: "#D9534F" },
                                ].map(({ icon: Icon, label, color }) => (
                                    <button key={label} title={label}
                                        className="flex flex-col items-center justify-center w-10 h-full gap-0.5 text-[9px] font-bold text-[#5C7080] hover:bg-[#F5F8FA]">
                                        <Icon className="w-3.5 h-3.5" style={{ color }} />{label}
                                    </button>
                                ))}
                                <button title="AIF" className="flex flex-col items-center justify-center w-10 h-full gap-0.5 text-[9px] font-bold text-[#5C7080] hover:bg-[#F5F8FA]">
                                    <Sparkles className="w-3.5 h-3.5 text-[#A855F7]" />AIF
                                </button>
                            </div>
                            <button className="h-7 flex items-center gap-1.5 px-2 border border-[#CED9E0] rounded text-[11px] font-bold text-[#A855F7] hover:bg-purple-50 mr-1">
                                <Sparkles className="w-3.5 h-3.5" /> Explain <ChevronDown className="w-3 h-3" />
                            </button>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {buildStatus === "idle" && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 rounded text-[11px] font-bold text-amber-700">
                            <AlertCircle className="w-3.5 h-3.5" /> Out-of-date
                        </div>
                    )}
                    {buildStatus === "running" && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded text-[11px] font-bold text-blue-600">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Building…
                        </div>
                    )}
                    {buildStatus === "done" && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 border border-emerald-200 rounded text-[11px] font-bold text-emerald-600">
                            ✓ Up to date
                        </div>
                    )}
                    {graphMode === "pipeline" && (
                        <>
                            <button className="h-7 px-2 border border-[#CED9E0] rounded text-[11px] font-bold text-[#182026] hover:bg-[#EBF1F5] flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5" /> Legend <ChevronDown className="w-3 h-3" />
                            </button>
                            <button className="h-7 px-2 border border-[#CED9E0] rounded text-[11px] font-bold text-[#182026] hover:bg-[#EBF1F5] flex items-center gap-1.5">
                                <Search className="w-3.5 h-3.5" /> Search <ChevronDown className="w-3 h-3" />
                            </button>
                            <button onClick={handleRunBuild}
                                className="h-7 bg-[#0F9960] hover:bg-[#0A6640] text-white px-3 rounded font-bold text-[11px] flex items-center gap-1">
                                Save <ChevronDown className="w-3 h-3" />
                            </button>
                        </>
                    )}
                    {graphMode === "ontology" && (
                        <>
                            <div className="h-7 flex items-center border border-[#CED9E0] rounded px-2 hover:bg-[#EBF1F5] cursor-pointer gap-1">
                                <GitBranch className="w-3.5 h-3.5 text-[#5C7080]" />
                                <span className="text-[11px] font-bold">master</span>
                                <ChevronDown className="w-3 h-3 text-[#5C7080]" />
                            </div>
                            <button onClick={handleRunBuild} className="h-7 bg-[#0F9960] hover:bg-[#0A6640] text-white px-3 rounded font-bold text-[11px] flex items-center gap-1">
                                Save <ChevronDown className="w-3 h-3" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* ── BODY ── */}
            <div className="flex-1 flex min-h-0">

                {/* LEFT PANEL */}
                <div className="w-52 bg-white border-r border-[#CED9E0] flex flex-col shrink-0">
                    <div className="p-2 border-b border-[#CED9E0]">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#5C7080]" />
                            <input placeholder="Search…" className="w-full pl-6 pr-2 py-1 text-[11px] border border-[#CED9E0] rounded focus:outline-none focus:border-[#137CBD]" />
                        </div>
                    </div>
                    <div className="overflow-y-auto flex-1">
                        <div className="px-2 pt-2 pb-1 text-[9px] font-bold text-[#5C7080] uppercase tracking-wider">
                            {graphMode === "ontology" ? "Entity Types" : "Inputs"}
                        </div>
                        {graphMode === "ontology" && entityTypes.map(ent => (
                            <button key={ent.id} onClick={() => { setSelectedId(ent.id); }}
                                className={`w-full flex items-center gap-2 px-2 py-1.5 text-[11px] border-l-2 mb-px transition-colors ${selectedId === ent.id ? "border-[#137CBD] bg-[#EBF1F5] text-[#182026]" : "border-transparent text-[#5C7080] hover:bg-[#F5F8FA]"}`}>
                                <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: ENT_COLORS[ent.id] || "#5C7080" }} />
                                <span className="font-medium truncate flex-1">{ent.name}</span>
                                <span className="text-[9px] text-[#5C7080]">{ent.properties.length}p</span>
                            </button>
                        ))}
                        {graphMode === "pipeline" && pipelineNodes.map(pn => (
                            <button key={pn.id} onClick={() => setSelectedId(pn.id)}
                                className={`w-full flex items-center gap-2 px-2 py-1.5 text-[11px] border-l-2 mb-px transition-colors ${selectedId === pn.id ? "border-[#137CBD] bg-[#EBF1F5] text-[#182026]" : "border-transparent text-[#5C7080] hover:bg-[#F5F8FA]"}`}>
                                <span className={`w-2 h-2 rounded-sm shrink-0 ${pn.type === "python" ? "bg-[#F2D06B]" : pn.type === "sql" ? "bg-[#E3AA65]" : pn.type === "sync" ? "bg-[#189F5C]" : "bg-[#3A7BBE]"}`} />
                                <span className="truncate flex-1 text-left font-medium">{pn.name}</span>
                            </button>
                        ))}
                    </div>
                    <div className="p-2 border-t border-[#CED9E0]">
                        <button className="w-full flex items-center justify-center gap-1 text-[11px] text-[#137CBD] font-bold hover:bg-[#EBF1F5] py-1.5 rounded">
                            <Plus className="w-3.5 h-3.5" /> {graphMode === "ontology" ? "Add Entity" : "Add Input"}
                        </button>
                    </div>
                </div>

                {/* CENTER + RIGHT */}
                <div className="flex-1 flex flex-col min-w-0 relative">

                    {/* Pipeline outputs panel (right side, collapsible) */}
                    <div className="flex flex-1 min-h-0">
                        <div className="flex-1 relative flex flex-col">
                            {/* ReactFlow canvas */}
                            <div className="flex-1 relative">
                                <ReactFlow
                                    nodes={nodes} edges={edges}
                                    onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
                                    onConnect={onConnect} onSelectionChange={onSelectionChange}
                                    onNodeContextMenu={graphMode === "pipeline" ? onNodeContextMenu : undefined}
                                    nodeTypes={nodeTypes} edgeTypes={edgeTypes}
                                    connectionLineType={ConnectionLineType.SmoothStep}
                                    fitView fitViewOptions={{ padding: 0.3 }}
                                    proOptions={{ hideAttribution: false }}>
                                    <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="#D8E1E8" />
                                    <Controls showInteractive={false} className="!bg-white !border-[#CED9E0] !rounded !shadow-sm" />
                                </ReactFlow>

                                {/* Ontology right panel */}
                                {graphMode === "ontology" && (
                                    <div className="absolute top-3 right-3 bottom-3 w-72 bg-white border border-[#CED9E0] rounded shadow overflow-hidden flex flex-col z-10">
                                        {/* Sub-tabs */}
                                        <div className="flex border-b border-[#CED9E0] bg-[#F5F8FA] shrink-0">
                                            {(["properties", "relationships", "metrics"] as const).map(t => (
                                                <button key={t} onClick={() => setDetailTab(t)}
                                                    className={`px-3 py-2 text-[10px] font-bold capitalize border-b-2 transition-colors ${detailTab === t ? "border-[#137CBD] text-[#137CBD]" : "border-transparent text-[#5C7080]"}`}>{t}</button>
                                            ))}
                                        </div>
                                        {!activeEntity ? (
                                            <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                                                <MousePointer2 className="w-7 h-7 mb-2 text-[#CED9E0]" />
                                                <p className="text-[12px] font-bold text-[#182026]">No Entity Selected</p>
                                                <p className="text-[10px] text-[#5C7080] mt-1">Click an entity node to inspect it.</p>
                                            </div>
                                        ) : (
                                            <div className="flex-1 overflow-y-auto">
                                                <div className="p-3 border-b border-[#CED9E0]">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded flex items-center justify-center shrink-0" style={{ background: ENT_COLORS[activeEntity.id] || "#0BB68F" }}>
                                                            {activeEntity.icon === "Plane" ? <Plane className="w-3.5 h-3.5 text-white" /> : activeEntity.icon === "Target" ? <Target className="w-3.5 h-3.5 text-white" /> : <User className="w-3.5 h-3.5 text-white" />}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-[12px] text-[#182026]">{activeEntity.name}</div>
                                                            <div className="text-[9px] text-[#5C7080]">{activeEntity.id === "ent-drone" ? "7,284" : activeEntity.id === "ent-mission" ? "412" : "89"} objects</div>
                                                        </div>
                                                        <Link href={`/build/ontology/${activeEntity.id}`} className="ml-auto text-[10px] text-[#137CBD] hover:underline font-bold">Schema →</Link>
                                                    </div>
                                                </div>
                                                {detailTab === "properties" && activeEntity.properties.map(p => (
                                                    <div key={p.id} className="flex items-center gap-2 px-3 py-2 border-b border-[#CED9E0]/40 hover:bg-[#F5F8FA]">
                                                        <span className="text-[10px] font-mono text-[#182026] font-bold flex-1">{p.name}</span>
                                                        <span className="text-[9px] bg-[#EBF1F5] text-[#5C7080] px-1 rounded">{p.type}</span>
                                                        {p.indexed && <Key className="w-2.5 h-2.5 text-[#137CBD]" />}
                                                    </div>
                                                ))}
                                                {detailTab === "relationships" && activeEntity.relationships.map(rel => {
                                                    const tgt = entityTypes.find(e => e.id === rel.targetEntityId);
                                                    return (
                                                        <div key={rel.id} className="flex items-center gap-2 px-3 py-2.5 border-b border-[#CED9E0]/40 hover:bg-[#F5F8FA]">
                                                            <span className="text-[9px] font-bold text-[#0BB68F] bg-[#0BB68F]/10 px-1.5 py-0.5 rounded">{rel.type}</span>
                                                            <span className="text-[11px] text-[#182026] font-medium">{activeEntity.name} → {tgt?.name || rel.targetEntityId}</span>
                                                        </div>
                                                    );
                                                })}
                                                {detailTab === "metrics" && activeEntity.metrics.map(m => (
                                                    <div key={m.id} className="flex items-center gap-2 px-3 py-2 border-b border-[#CED9E0]/40 hover:bg-[#F5F8FA]">
                                                        <Activity className="w-3 h-3 text-[#137CBD]" />
                                                        <span className="text-[11px] text-[#182026] font-medium">{m.name}</span>
                                                        <span className="ml-auto text-[9px] text-[#5C7080]">{m.aggregation} · {m.unit}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Bottom tabs (Pipeline mode) */}
                            {graphMode === "pipeline" && (
                                <div className="border-t border-[#CED9E0] bg-white shrink-0">
                                    <div className="flex items-center h-8 px-2 gap-1">
                                        {["Selection preview", "Preview", "Join"].map(t => (
                                            <button key={t} onClick={() => setBottomTab(bottomTab === t ? null : t)}
                                                className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded transition-colors ${bottomTab === t ? "text-[#137CBD] bg-[#EBF1F5]" : "text-[#5C7080] hover:text-[#182026]"}`}>
                                                {t === "Preview" && <Eye className="w-3 h-3" />}
                                                {t === "Join" && <Link2 className="w-3 h-3" />}
                                                {t === "Selection preview" && <Table className="w-3 h-3" />}
                                                {t}
                                            </button>
                                        ))}
                                        <button className="ml-auto p-1 hover:bg-[#F5F8FA] rounded text-[#5C7080]">
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    {bottomTab && (
                                        <div className="border-t border-[#CED9E0] bg-[#F5F8FA] p-4 max-h-36 overflow-y-auto">
                                            {bottomTab === "Code" && (
                                                <pre className="text-[10px] font-mono text-[#182026]">{`# clean_gps_coords.py
from transforms.api import transform, Input, Output

@transform(output=Output("/aip/ontology/fleet"),
           source=Input("/aip/foundry/datasets/telemetry/raw"))
def compute(source, output):
    df = source.dataframe()
    output.write_dataframe(df)`}</pre>
                                            )}
                                            {bottomTab === "Selection preview" && selectedNode && (
                                                <div>
                                                    <div className="text-[11px] font-bold text-[#182026] mb-2">{selectedNode.data.label}</div>
                                                    <table className="w-full text-[10px] border-collapse">
                                                        <thead><tr className="bg-[#EBF1F5]">
                                                            {["column_id", "value", "timestamp"].map(c => <th key={c} className="border border-[#CED9E0] px-2 py-1 text-left font-bold text-[#5C7080]">{c}</th>)}
                                                        </tr></thead>
                                                        <tbody>{[1, 2, 3].map(i => <tr key={i}>
                                                            {["id_" + i, "val_" + i, "2026-02-28"].map(c => <td key={c} className="border border-[#CED9E0] px-2 py-0.5 text-[#182026]">{c}</td>)}
                                                        </tr>)}</tbody>
                                                    </table>
                                                </div>
                                            )}
                                            {bottomTab !== "Selection preview" && bottomTab !== "Code" && (
                                                <div className="text-center text-[11px] text-[#5C7080]">{bottomTab} panel</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Ontology bottom tabs */}
                            {graphMode === "ontology" && (
                                <div className="border-t border-[#CED9E0] bg-white shrink-0">
                                    <div className="flex items-center h-8 px-2 gap-1">
                                        {["Preview", "History", "Code", "Data health", "Build timeline"].map(t => (
                                            <button key={t} onClick={() => setBottomTab(bottomTab === t ? null : t)}
                                                className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded transition-colors ${bottomTab === t ? "text-[#137CBD] bg-[#EBF1F5]" : "text-[#5C7080] hover:text-[#182026]"}`}>
                                                {t === "Preview" && <Eye className="w-3 h-3" />}
                                                {t === "History" && <History className="w-3 h-3" />}
                                                {t === "Code" && <Code2 className="w-3 h-3" />}
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                    {bottomTab && (
                                        <div className="border-t border-[#CED9E0] bg-[#F5F8FA] p-4 max-h-36 overflow-y-auto text-[12px] text-[#5C7080] text-center">
                                            {bottomTab} panel
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Pipeline outputs right panel */}
                        {graphMode === "pipeline" && (
                            <div className={`border-l border-[#CED9E0] bg-white flex flex-col shrink-0 transition-all ${outputsOpen ? "w-52" : "w-7"}`}>
                                <button onClick={() => setOutputsOpen(v => !v)}
                                    className="flex items-center justify-center w-7 h-8 shrink-0 border-b border-[#CED9E0] hover:bg-[#F5F8FA]">
                                    {outputsOpen ? <ChevronRight className="w-3.5 h-3.5 text-[#5C7080]" /> : <ChevronLeft className="w-3.5 h-3.5 text-[#5C7080]" />}
                                </button>
                                {!outputsOpen && (
                                    <div className="flex-1 flex items-center justify-center">
                                        <span className="text-[9px] font-bold text-[#5C7080] uppercase tracking-widest"
                                            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                                            Pipeline outputs
                                        </span>
                                    </div>
                                )}
                                {outputsOpen && (
                                    <div className="flex-1 overflow-y-auto p-2">
                                        <div className="text-[9px] font-bold text-[#5C7080] uppercase tracking-wider mb-2">Pipeline Outputs</div>
                                        {outputDatasets.length === 0 && (
                                            <div className="text-[10px] text-[#5C7080] text-center py-4">No outputs defined</div>
                                        )}
                                        {outputDatasets.map(ds => (
                                            <div key={ds.id} className="border border-[#CED9E0] rounded p-2 mb-2 hover:bg-[#F5F8FA]">
                                                <div className="font-bold text-[11px] text-[#182026] truncate">{ds.name}</div>
                                                <div className="text-[9px] text-[#5C7080] mt-0.5">{(ds as any).columns ?? "—"} cols</div>
                                            </div>
                                        ))}
                                        <button className="w-full flex items-center justify-center gap-1 text-[10px] text-[#137CBD] font-bold py-1.5 border border-dashed border-[#CED9E0] rounded hover:bg-[#EBF1F5]">
                                            <Plus className="w-3 h-3" /> Add output
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
