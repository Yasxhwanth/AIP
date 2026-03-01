"use client";

import { useState, useCallback } from "react";
import ReactFlow, {
    Background, Controls, Node, Edge, useNodesState, useEdgesState,
    Handle, Position, BackgroundVariant, NodeProps, MiniMap,
    BaseEdge, getSmoothStepPath
} from "reactflow";
import "reactflow/dist/style.css";
import {
    MousePointer2, LayoutGrid, Undo2, Eraser, Maximize2,
    Palette, Search, Trash2, AlignCenter, Eye, ChevronRight,
    ChevronLeft, Layers, History, Code2, Activity, AlertCircle,
    ArrowRightLeft, Plus, X, Filter, BookOpen, Settings, Link2,
    Database, GitBranch, RefreshCw, Zap, Monitor
} from "lucide-react";

// ─── Palantir AIP style constants ─────────────────────────────────────────────
// Matches /build/ontology and /build/actions
const C = {
    bg: "#F5F8FA",
    white: "#FFFFFF",
    border: "#CED9E0",
    text: "#182026",
    sub: "#5C7080",
    accent: "#137CBD",
    pill: "#EBF1F5",
    red: "#DB3737",
    green: "#0F9960",
    amber: "#D9822B",
};

// ─── Node type styling (for graph canvas — stays dark for readability) ────────
const NODE_TYPES: Record<string, { border: string; bg: string; text: string; label: string }> = {
    raw: { border: "#3B82F6", bg: "#EBF1F5", text: "#1D4ED8", label: "Dataset" },
    transform: { border: "#BE185D", bg: "#FDF2F8", text: "#9D174D", label: "Transform" },
    ontology: { border: "#059669", bg: "#ECFDF5", text: "#065F46", label: "Ontology Output" },
    training: { border: "#6B7280", bg: "#F9FAFB", text: "#374151", label: "Training Object" },
    workshop: { border: "#D97706", bg: "#FFFBEB", text: "#92400E", label: "Workshop App" },
};

// ─── Source bead groups ───────────────────────────────────────────────────────
const SOURCE_GROUPS = [
    { id: "gcss", name: "GCSS-A", color: "#E87678", count: 4 },
    { id: "fms", name: "FMS", color: "#A78BFA", count: 54 },
    { id: "dtms", name: "DTMS", color: "#60A5FA", count: 10 },
    { id: "atrrs", name: "ATRRS", color: "#34D399", count: 22 },
    { id: "gomo", name: "GOMO", color: "#FBBF24", count: 2 },
    { id: "core", name: "CORE ELEMENTS", color: "#818CF8", count: 10 },
    { id: "liw", name: "LIW", color: "#F472B6", count: 14 },
    { id: "tapdb", name: "TAPDB", color: "#C084FC", count: 196 },
    { id: "medpros", name: "MEDPROS/MODS", color: "#86EFAC", count: 25 },
    { id: "dapmis", name: "DAPMIS", color: "#FCA5A5", count: 2 },
    { id: "iperms", name: "iPerms", color: "#4ADE80", count: 2 },
    { id: "integ", name: "Integration", color: "#FB7185", count: 62 },
];
const SRC_MAP = Object.fromEntries(SOURCE_GROUPS.map(s => [s.id, s]));

// ─── Lineage graph data ───────────────────────────────────────────────────────
const LINEAGE_NODES: Node[] = [
    { id: "n1", position: { x: 40, y: 50 }, data: { label: "airports/timeseries", type: "raw" }, type: "lineage" },
    { id: "n2", position: { x: 40, y: 100 }, data: { label: "enriched_airports", type: "raw" }, type: "lineage" },
    { id: "n3", position: { x: 40, y: 150 }, data: { label: "airport.Planes", type: "raw" }, type: "lineage" },
    { id: "n4", position: { x: 40, y: 220 }, data: { label: "precomputed.reports", type: "raw" }, type: "lineage" },
    { id: "n5", position: { x: 40, y: 320 }, data: { label: "enrichedFlights_ts_nonexp", type: "raw" }, type: "lineage" },
    { id: "n6", position: { x: 40, y: 390 }, data: { label: "raw_flights", type: "raw" }, type: "lineage" },
    { id: "n7", position: { x: 40, y: 460 }, data: { label: "class/flight_alerts", type: "raw" }, type: "lineage" },
    { id: "t1", position: { x: 260, y: 100 }, data: { label: "Ontology Proj: AvroMeta", type: "transform" }, type: "lineage" },
    { id: "t2", position: { x: 260, y: 200 }, data: { label: "Transform: Flight Delays", type: "transform" }, type: "lineage" },
    { id: "t3", position: { x: 260, y: 340 }, data: { label: "Ontology: AircraftFlights", type: "transform" }, type: "lineage" },
    { id: "t4", position: { x: 430, y: 270 }, data: { label: "flight_alerts_solved", type: "raw" }, type: "lineage" },
    { id: "t5", position: { x: 260, y: 430 }, data: { label: "envSched/flight_alerts", type: "transform" }, type: "lineage" },
    { id: "t6", position: { x: 430, y: 380 }, data: { label: "Transform: FlightDelays/fights", type: "transform" }, type: "lineage" },
    { id: "t7", position: { x: 430, y: 460 }, data: { label: "airline_codes", type: "raw" }, type: "lineage" },
    { id: "t8", position: { x: 430, y: 540 }, data: { label: "Strategy: AircraftRoutes", type: "transform" }, type: "lineage" },
    { id: "t9", position: { x: 260, y: 540 }, data: { label: "class/Aircraft", type: "raw" }, type: "lineage" },
    { id: "o1", position: { x: 620, y: 50 }, data: { label: "[Training] Airport", type: "ontology" }, type: "lineage" },
    { id: "o2", position: { x: 620, y: 120 }, data: { label: "[Training] Runway", type: "ontology" }, type: "lineage" },
    { id: "o3", position: { x: 620, y: 190 }, data: { label: "Ontology: AircraftFlight", type: "ontology" }, type: "lineage" },
    { id: "o4", position: { x: 620, y: 270 }, data: { label: "[Training] Flight Alert", type: "ontology" }, type: "lineage" },
    { id: "o5", position: { x: 620, y: 350 }, data: { label: "[Training] Delay", type: "ontology" }, type: "lineage" },
    { id: "o6", position: { x: 620, y: 420 }, data: { label: "[Training] Flight", type: "ontology" }, type: "lineage" },
    { id: "o7", position: { x: 620, y: 490 }, data: { label: "[Training] Aircraft", type: "ontology" }, type: "lineage" },
    { id: "o8", position: { x: 620, y: 560 }, data: { label: "[Training] Airline", type: "ontology" }, type: "lineage" },
    { id: "w1", position: { x: 840, y: 50 }, data: { label: "Aircraft Overview Tab", type: "workshop" }, type: "lineage" },
    { id: "w2", position: { x: 840, y: 270 }, data: { label: "Sample Workshop Module", type: "workshop" }, type: "lineage" },
    { id: "w3", position: { x: 840, y: 420 }, data: { label: "Route Context Tab", type: "workshop" }, type: "lineage" },
    { id: "w4", position: { x: 840, y: 560 }, data: { label: "Refine Fleet...", type: "workshop" }, type: "lineage" },
];

const LINEAGE_EDGES: Edge[] = [
    { id: "e1", source: "n1", target: "t1" }, { id: "e2", source: "n2", target: "t1" }, { id: "e3", source: "n3", target: "t1" },
    { id: "e4", source: "n4", target: "t2" }, { id: "e5", source: "t1", target: "o1" }, { id: "e6", source: "t1", target: "o2" },
    { id: "e7", source: "t2", target: "o3" }, { id: "e8", source: "t2", target: "t4" }, { id: "e9", source: "t4", target: "o4" },
    { id: "e10", source: "n5", target: "t3" }, { id: "e11", source: "t3", target: "o5" }, { id: "e12", source: "t6", target: "o6" },
    { id: "e13", source: "t5", target: "t6" }, { id: "e14", source: "n6", target: "t5" }, { id: "e15", source: "n7", target: "t5" },
    { id: "e16", source: "t7", target: "o8" }, { id: "e17", source: "t8", target: "o7" }, { id: "e18", source: "t9", target: "t8" },
    { id: "e19", source: "o1", target: "w1" }, { id: "e20", source: "o4", target: "w2" }, { id: "e21", source: "o5", target: "w3" },
    { id: "e22", source: "o6", target: "w4" },
].map(e => ({ ...e, type: "lineage", data: {} }));

// ─── Object types for grouped view ───────────────────────────────────────────
const OBJECT_TYPES = [
    {
        id: "esn", name: "Equipment Serial Number", icon: Settings,
        chains: [
            ["gcss", "fms", "dtms", "atrrs", "gomo", "core", "liw", "tapdb", "medpros", "dapmis", "iperms", "integ"],
            ["gcss", "fms", "dtms", "atrrs", "gomo"],
        ],
        relCount: 1, relTarget: "Unit",
        totalObjects: 116534,
        preview: [
            { BASE: "KIRTLAND", COMPONENT: "Reserve", CONDITION: "FMC", COUNTRY: "USA", STATE: "NEW MEXICO" },
            { BASE: "HOHENFELS", COMPONENT: "Active", CONDITION: "FMC", COUNTRY: "GERMANY", STATE: "Unlisted" },
            { BASE: "HOHENFELS", COMPONENT: "Active", CONDITION: "FMC", COUNTRY: "GERMANY", STATE: "Unlisted" },
        ]
    },
    {
        id: "unit", name: "Unit", icon: GitBranch,
        chains: [["gcss", "fms", "dtms", "atrrs", "gomo", "core", "liw", "tapdb"]],
        relCount: 2, relTarget: "Soldier",
        totalObjects: 8342,
        preview: [
            { BASE: "FORSCOM", COMPONENT: "Active", CONDITION: "FMC", COUNTRY: "USA", STATE: "GEORGIA" },
            { BASE: "USAREUR", COMPONENT: "Active", CONDITION: "FMC", COUNTRY: "GERMANY", STATE: "Unlisted" },
        ]
    },
    {
        id: "soldier", name: "Soldier", icon: Eye,
        chains: [["dtms", "atrrs", "core", "liw", "medpros", "dapmis", "iperms", "integ"]],
        relCount: null, relTarget: null,
        totalObjects: 479281,
        preview: [
            { BASE: "BRAGG", COMPONENT: "Active", CONDITION: "FMC", COUNTRY: "USA", STATE: "NORTH CAROLINA" },
        ]
    },
];

// ─── Custom ReactFlow nodes ───────────────────────────────────────────────────
const LineageNode = ({ data, selected }: NodeProps) => {
    const d = data as any;
    const st = NODE_TYPES[d.type] || NODE_TYPES.raw;
    return (
        <div style={{
            padding: "3px 10px", borderRadius: 3, fontSize: 10, fontWeight: 600,
            background: st.bg, border: `1.5px solid ${selected ? C.accent : st.border}`,
            color: st.text, whiteSpace: "nowrap", maxWidth: 220,
            boxShadow: selected ? `0 0 0 2px ${C.accent}40` : "0 1px 3px rgba(0,0,0,0.08)",
            cursor: "pointer", fontFamily: "Inter, sans-serif"
        }}>
            <Handle type="target" position={Position.Left}
                style={{ background: st.border, width: 6, height: 6, left: -3, border: `1px solid white` }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>{d.label}</span>
            <Handle type="source" position={Position.Right}
                style={{ background: st.border, width: 6, height: 6, right: -3, border: `1px solid white` }} />
        </div>
    );
};

const LineageEdge = ({ id, sourceX, sourceY, targetX, targetY, markerEnd }: any) => {
    const [path] = getSmoothStepPath({ sourceX, sourceY, targetX, targetY, borderRadius: 4 });
    return <BaseEdge id={id} path={path} style={{ stroke: C.border, strokeWidth: 1.5 }} markerEnd={markerEnd} />;
};

const nodeTypes = { lineage: LineageNode };
const edgeTypes = { lineage: LineageEdge };

// ─── Main component ───────────────────────────────────────────────────────────
export default function DataLineagePage() {
    const [view, setView] = useState<"lineage" | "grouped">("lineage");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [bottomTab, setBottomTab] = useState<"preview" | "history" | "code" | "build" | "health">("preview");
    const [showBottom, setShowBottom] = useState(false);
    const [showLegend, setShowLegend] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const edgesWithMarker = LINEAGE_EDGES.map(e => ({
        ...e, markerEnd: { type: "arrowclosed" as any, color: C.border, width: 12, height: 12 }
    }));

    const [nodes, , onNodesChange] = useNodesState(LINEAGE_NODES);
    const [edges, , onEdgesChange] = useEdgesState(edgesWithMarker);

    const onNodeClick = useCallback((_: any, node: Node) => {
        setSelectedId(prev => prev === node.id ? null : node.id);
        setShowBottom(true);
        setBottomTab("preview");
    }, []);

    const selectedOT = OBJECT_TYPES.find(o => o.id === selectedId);
    const selectedLN = LINEAGE_NODES.find(n => n.id === selectedId);

    const TOOL_GROUPS = [
        [MousePointer2, "Tools"], [LayoutGrid, "Layout"], [Undo2, "Undo/redo"],
        [Eraser, "Clean"], [MousePointer2, "Select"], [Maximize2, "Expand"],
        [Palette, "Color"], [Search, "Find"], [Trash2, "Remove"],
        [AlignCenter, "Align"], [ArrowRightLeft, "Flow"],
    ] as const;

    return (
        <div className="flex flex-col h-full w-full overflow-hidden"
            style={{ background: C.bg, color: C.text, fontFamily: "Inter, sans-serif" }}>

            {/* ── TOOLBAR ── */}
            <div className="h-11 shrink-0 flex items-center px-2 gap-0.5 border-b bg-white"
                style={{ borderColor: C.border }}>

                {/* View toggle - same style as /build/ontology mode toggle */}
                <div className="flex bg-[#F5F8FA] border border-[#CED9E0] rounded overflow-hidden text-[11px] mr-2">
                    {(["lineage", "grouped"] as const).map(m => (
                        <button key={m} onClick={() => { setView(m); setSelectedId(null); setShowBottom(false); }}
                            className={`px-3 h-7 font-bold capitalize transition-colors ${view === m ? "bg-[#137CBD] text-white" : "text-[#5C7080] hover:bg-[#E4E8ED]"}`}>
                            {m === "lineage" ? "Full Lineage" : "Grouped by Source"}
                        </button>
                    ))}
                </div>

                {/* Tool buttons */}
                <div className="flex items-center h-full border-r border-[#CED9E0] pr-2 mr-1">
                    {TOOL_GROUPS.map(([Icon, label]) => (
                        <button key={label} title={label}
                            className="flex flex-col items-center justify-center w-10 h-full gap-0.5 hover:bg-[#F5F8FA] hover:text-[#182026] rounded"
                            style={{ fontSize: 9, color: C.sub, fontWeight: 700 }}>
                            <Icon className="w-3.5 h-3.5" />{label}
                        </button>
                    ))}
                </div>

                {/* Right controls */}
                <div className="ml-auto flex items-center gap-2">
                    <div className="flex items-center h-7 border rounded px-1 gap-1" style={{ borderColor: C.border }}>
                        <button title="Layout by color" className="p-1 rounded hover:bg-[#F5F8FA]"><LayoutGrid className="w-3.5 h-3.5 text-[#5C7080]" /></button>
                        <button title="Group by color" className="p-1 rounded hover:bg-[#F5F8FA]"><Layers className="w-3.5 h-3.5 text-[#5C7080]" /></button>
                        <button title="Legend" onClick={() => setShowLegend(v => !v)} className="p-1 rounded hover:bg-[#F5F8FA]">
                            <Eye className={`w-3.5 h-3.5 ${showLegend ? "text-[#137CBD]" : "text-[#5C7080]"}`} />
                        </button>
                        <div className="w-px h-4 bg-[#CED9E0] mx-0.5" />
                        <span className="text-[9px] font-bold text-[#5C7080] pr-1">Node color options</span>
                    </div>
                    <button className="h-7 flex items-center gap-1 px-3 rounded text-[11px] font-bold text-white"
                        style={{ background: C.green }}>
                        Custom color <ChevronRight className="w-3 h-3" />
                    </button>
                    {view === "lineage" && (
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#5C7080]" />
                            <input placeholder="Search…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                className="h-7 pl-6 pr-2 text-[11px] border rounded focus:outline-none focus:border-[#137CBD]"
                                style={{ borderColor: C.border }} />
                        </div>
                    )}
                </div>
            </div>

            {/* ── BODY ── */}
            <div className="flex-1 flex min-h-0">

                {/* ── FULL LINEAGE VIEW ── */}
                {view === "lineage" && (
                    <div className="flex-1 relative">
                        <ReactFlow
                            nodes={nodes.map(n => ({ ...n, data: { ...n.data, selected: n.id === selectedId } }))}
                            edges={edges}
                            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
                            onNodeClick={onNodeClick}
                            nodeTypes={nodeTypes} edgeTypes={edgeTypes}
                            fitView fitViewOptions={{ padding: 0.15 }}
                            proOptions={{ hideAttribution: false }}>
                            <Background variant={BackgroundVariant.Dots} gap={24} size={1} color={C.border} />
                            <Controls showInteractive={false}
                                className="!bg-white !border-[#CED9E0] !rounded !shadow-sm" />
                            <MiniMap nodeColor={n => NODE_TYPES[(n.data as any).type]?.border || C.border}
                                style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: 4 }} />
                        </ReactFlow>

                        {/* Legend */}
                        {showLegend && (
                            <div className="absolute top-3 left-3 z-10 bg-white rounded shadow border text-[10px] p-3"
                                style={{ borderColor: C.border }}>
                                <div className="font-bold text-[#5C7080] uppercase tracking-wider mb-2 text-[9px]">Node Types</div>
                                {Object.values(NODE_TYPES).map(s => (
                                    <div key={s.label} className="flex items-center gap-2 mb-1">
                                        <span className="w-3 h-2 rounded-sm shrink-0" style={{ background: s.border }} />
                                        <span style={{ color: s.text }}>{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Node detail panel (right) */}
                        {selectedLN && (
                            <div className="absolute top-3 right-3 z-10 bg-white rounded shadow border w-56 p-3"
                                style={{ borderColor: C.border }}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[11px] font-bold text-[#182026]">Node Details</span>
                                    <button onClick={() => setSelectedId(null)} className="hover:text-[#DB3737]">
                                        <X className="w-3.5 h-3.5 text-[#5C7080]" />
                                    </button>
                                </div>
                                <div className="text-[10px] text-[#182026] mb-2 font-medium">{(selectedLN.data as any).label}</div>
                                <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold"
                                    style={{ background: NODE_TYPES[(selectedLN.data as any).type]?.bg, color: NODE_TYPES[(selectedLN.data as any).type]?.text, border: `1px solid ${NODE_TYPES[(selectedLN.data as any).type]?.border}` }}>
                                    {NODE_TYPES[(selectedLN.data as any).type]?.label}
                                </span>
                                <div className="mt-2 text-[9px] text-[#5C7080] flex gap-3">
                                    <span>{edges.filter(e => e.target === selectedId).length} upstream</span>
                                    <span>{edges.filter(e => e.source === selectedId).length} downstream</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── GROUPED BY SOURCE VIEW ── */}
                {view === "grouped" && (
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="flex-1 relative overflow-hidden" style={{ minHeight: showBottom ? "50%" : "100%" }}>
                            {/* Canvas area */}
                            <div className="absolute inset-0 overflow-auto p-10" style={{ background: C.bg }}>
                                {OBJECT_TYPES.map(ot => {
                                    const Icon = ot.icon;
                                    const isSelected = selectedId === ot.id;
                                    return (
                                        <div key={ot.id} className="mb-14 relative">
                                            {/* Bead chains */}
                                            {ot.chains.map((chain, ci) => (
                                                <div key={ci} className="flex items-center mb-2 pl-4">
                                                    {chain.map((sid, bi) => {
                                                        const s = SRC_MAP[sid];
                                                        return (
                                                            <div key={sid} className="flex items-center">
                                                                <div title={s?.name}
                                                                    style={{
                                                                        width: 12, height: 12, borderRadius: "50%",
                                                                        background: s?.color || "#888",
                                                                        border: `1.5px solid white`,
                                                                        boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                                                                        cursor: "pointer"
                                                                    }} />
                                                                {bi < chain.length - 1 && (
                                                                    <div style={{ width: 10, height: 1.5, background: C.border }} />
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                    {/* dash line to entity */}
                                                    <div style={{ flex: 1, height: 1.5, background: C.border, maxWidth: 80, marginLeft: 8 }} />
                                                </div>
                                            ))}

                                            {/* Entity pill + relation badge */}
                                            <div className="flex items-center absolute" style={{ top: "50%", transform: "translateY(-50%)", left: 740 }}>
                                                {/* Left connector dot */}
                                                <div className="w-2.5 h-2.5 rounded-full border mr-2"
                                                    style={{ background: C.bg, borderColor: C.border }} />

                                                {/* Pill */}
                                                <button
                                                    onClick={() => { setSelectedId(isSelected ? null : ot.id); setShowBottom(true); }}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded font-bold text-[12px] transition-all shadow-sm"
                                                    style={{
                                                        background: isSelected ? "#EBF5FF" : "white",
                                                        border: `1.5px solid ${isSelected ? C.accent : C.border}`,
                                                        color: isSelected ? C.accent : C.text,
                                                        boxShadow: isSelected ? `0 0 0 2px ${C.accent}30` : "0 1px 3px rgba(0,0,0,0.08)"
                                                    }}>
                                                    <ChevronLeft className="w-3 h-3 opacity-50" />
                                                    <Icon className="w-3.5 h-3.5 shrink-0" />
                                                    <span>{ot.name}</span>
                                                    <ChevronRight className="w-3 h-3 opacity-50" />
                                                    <Settings className="w-3 h-3 opacity-30 ml-1" />
                                                    <Link2 className="w-3 h-3 opacity-30" />
                                                </button>

                                                {/* Right connector dot */}
                                                <div className="w-2.5 h-2.5 rounded-full border ml-2"
                                                    style={{ background: C.bg, borderColor: C.border }} />

                                                {/* Relationship count */}
                                                {ot.relCount && (
                                                    <div className="flex flex-col items-center ml-3 text-[#5C7080]">
                                                        <div className="text-[9px] font-bold">⇄{ot.relCount}</div>
                                                        <ArrowRightLeft className="w-3 h-3" />
                                                        <Link2 className="w-3 h-3" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Legend panel */}
                            {showLegend && (
                                <div className="absolute top-3 right-3 z-20 bg-white rounded shadow border overflow-hidden"
                                    style={{ borderColor: C.border, minWidth: 280 }}>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 p-3">
                                        {SOURCE_GROUPS.map(sg => (
                                            <div key={sg.id} className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: sg.color }} />
                                                <span className="text-[11px] text-[#182026]">{sg.name}</span>
                                                <span className="text-[10px] text-[#5C7080] ml-auto">({sg.count})</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="px-3 py-2 border-t" style={{ borderColor: C.border }}>
                                        <button className="text-[11px] font-bold flex items-center gap-1 text-[#137CBD]">
                                            Show Color Group Editor ▾
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* 1 node selected badge */}
                            {selectedId && (
                                <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded text-[11px] font-bold bg-white shadow border"
                                    style={{ borderColor: C.accent, color: C.accent }}>
                                    1 node selected
                                </div>
                            )}
                        </div>

                        {/* ── BOTTOM PANEL ── */}
                        <div className="border-t shrink-0 flex flex-col bg-white" style={{ borderColor: C.border, height: showBottom ? 240 : "auto" }}>
                            <div className="flex items-center h-8 px-2 gap-0.5 border-b shrink-0" style={{ borderColor: C.border }}>
                                {[
                                    { id: "preview" as const, label: "Preview", icon: Eye },
                                    { id: "history" as const, label: "History", icon: History },
                                    { id: "code" as const, label: "Code", icon: Code2 },
                                    { id: "build" as const, label: "Build timeline", icon: Activity },
                                    { id: "health" as const, label: "Data health", icon: AlertCircle },
                                ].map(t => (
                                    <button key={t.id}
                                        onClick={() => { setBottomTab(t.id); setShowBottom(true); }}
                                        className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold transition-colors border-b-2"
                                        style={{
                                            color: bottomTab === t.id && showBottom ? C.accent : C.sub,
                                            borderColor: bottomTab === t.id && showBottom ? C.accent : "transparent"
                                        }}>
                                        <t.icon className="w-3 h-3" />{t.label}
                                    </button>
                                ))}
                                <button onClick={() => setShowBottom(v => !v)} className="ml-auto p-1 hover:bg-[#F5F8FA] rounded">
                                    <ChevronRight className={`w-3.5 h-3.5 text-[#5C7080] transition-transform ${showBottom ? "rotate-90" : "-rotate-90"}`} />
                                </button>
                            </div>

                            {showBottom && bottomTab === "preview" && (
                                <div className="flex-1 flex flex-col overflow-hidden">
                                    <div className="flex items-center gap-3 px-4 py-2 border-b shrink-0"
                                        style={{ borderColor: C.border, background: C.bg }}>
                                        {selectedOT ? (
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-3 h-3 rounded-sm" style={{ background: C.accent }} />
                                                    <span className="text-[12px] font-bold text-[#182026]">{selectedOT.name}</span>
                                                </div>
                                                <select className="text-[11px] border rounded px-2 py-0.5 ml-auto font-bold focus:outline-none focus:border-[#137CBD]"
                                                    style={{ borderColor: C.border, color: C.sub, background: "white" }}>
                                                    <option>Showing all property types</option>
                                                </select>
                                                <span className="text-[11px] text-[#5C7080]">
                                                    Showing 1000 of {selectedOT.totalObjects.toLocaleString()} objects
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-[12px] text-[#5C7080]">Click a node to preview its data</span>
                                        )}
                                    </div>
                                    {selectedOT ? (
                                        <div className="flex-1 overflow-auto">
                                            <table className="w-full text-[11px]" style={{ borderCollapse: "collapse" }}>
                                                <thead>
                                                    <tr style={{ background: C.bg, position: "sticky", top: 0 }}>
                                                        {Object.keys(selectedOT.preview[0]).map(col => (
                                                            <th key={col} className="text-left px-4 py-2 border-b font-bold"
                                                                style={{ color: C.sub, borderColor: C.border }}>
                                                                {col.replace(/_/g, " ")}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedOT.preview.map((row, i) => (
                                                        <tr key={i} className="border-b hover:bg-[#F5F8FA]"
                                                            style={{ borderColor: C.border }}>
                                                            {Object.values(row).map((v, j) => (
                                                                <td key={j} className="px-4 py-1.5"
                                                                    style={{ color: v ? C.text : C.border }}>
                                                                    {v ? (j === 2
                                                                        ? <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: "#ECFDF5", color: "#065F46", border: "1px solid #059669" }}>{v as string}</span>
                                                                        : v as string)
                                                                        : <span style={{ color: C.border }}>No value</span>}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                    {[0, 1].map(gi => (
                                                        <tr key={`g${gi}`} className="border-b" style={{ borderColor: C.border, opacity: 0.3 }}>
                                                            {Object.keys(selectedOT.preview[0]).map(col => (
                                                                <td key={col} className="px-4 py-1.5 text-[11px]" style={{ color: C.border }}>No value</td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center text-[#5C7080] text-sm">
                                            Select a node on the graph to preview its data
                                        </div>
                                    )}
                                </div>
                            )}
                            {showBottom && bottomTab !== "preview" && (
                                <div className="flex-1 flex items-center justify-center text-[#5C7080] text-sm">
                                    {bottomTab.charAt(0).toUpperCase() + bottomTab.slice(1)} panel
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
