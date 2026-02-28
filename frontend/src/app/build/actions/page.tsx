"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import ReactFlow, {
    Background, Controls, Node, Edge,
    useNodesState, useEdgesState, BackgroundVariant,
    Handle, Position, ConnectionLineType
} from "reactflow";
import "reactflow/dist/style.css";
import { useBuilderStore, AppAction, ActionParameter, ActionRule } from "@/store/builderStore";
import {
    ArrowLeft, ChevronDown, Plus, Trash2, GripVertical,
    Monitor, Pencil, FormInput, RotateCcw, ClipboardList, ShieldCheck,
    AlertTriangle, MoreHorizontal, Search, Save, X, RefreshCw,
    Target, User, Plane, Activity, Database, Network, Zap, Box,
    Info, CheckCircle, ToggleLeft, Hash, Quote, Calendar, List
} from "lucide-react";

// ─── Icon map ───────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, any> = {
    RefreshCw, Target, Trash2, Plane, User, Activity, Network, Zap, Box, Database
};

// ─── Left nav tabs ───────────────────────────────────────────────────────────
const NAV_TABS = [
    { id: "overview", label: "Overview", icon: Monitor },
    { id: "rules", label: "Rules", icon: Pencil },
    { id: "form", label: "Form", icon: FormInput },
    { id: "log", label: "Log", icon: ClipboardList },
    { id: "security", label: "Security & Submission Criteria", icon: ShieldCheck },
] as const;
type Tab = typeof NAV_TABS[number]["id"];

// ─── Operation labels ────────────────────────────────────────────────────────
const OP_LABELS: Record<string, string> = {
    modify: "Modify property", create: "Create object", delete: "Delete object",
    link: "Link objects", unlink: "Unlink objects"
};

// ─── Graph node types (Action Graph view) ───────────────────────────────────
const GraphNode = ({ data }: any) => (
    <div className={`rounded px-3 py-2 text-white text-[11px] font-bold shadow border ${data.borderCls}`}
        style={{ background: data.color, minWidth: 160 }}>
        <Handle type="target" position={Position.Left} className="!w-2 !h-2 !border-white/50" />
        <div className="flex items-center gap-2">
            {data.Icon && <data.Icon className="w-3.5 h-3.5 opacity-80 shrink-0" />}
            <span className="truncate">{data.label}</span>
        </div>
        <div className="text-[9px] text-white/60 mt-0.5">{data.sub}</div>
        <div className="flex items-center gap-1.5 mt-1.5 text-[9px] text-white/70">
            {data.links !== undefined && <span>🔗 {data.links}</span>}
            {data.fx !== undefined && <span>fx {data.fx}</span>}
            {data.objects !== undefined && <span>📊 {data.objects}</span>}
        </div>
        <Handle type="source" position={Position.Right} className="!w-2 !h-2 !border-white/50" />
    </div>
);
const graphNodeTypes = { g: GraphNode };

// ─── Seed graph nodes/edges ─────────────────────────────────────────────────
const GRAPH_NODES: Node[] = [
    { id: "gn1", type: "g", position: { x: 40, y: 60 }, data: { label: "Update Drone Status", sub: "Action", color: "#D9822B", borderCls: "border-[#BF6A00]", Icon: RefreshCw, links: 1, fx: 1, objects: 3 } },
    { id: "gn2", type: "g", position: { x: 40, y: 160 }, data: { label: "Assign Mission", sub: "Action", color: "#D9822B", borderCls: "border-[#BF6A00]", Icon: Target, links: 2, fx: 2, objects: 2 } },
    { id: "gn3", type: "g", position: { x: 40, y: 260 }, data: { label: "Retire Drone", sub: "Action", color: "#D9534F", borderCls: "border-[#A02020]", Icon: Trash2, links: 1, fx: 0, objects: 1 } },
    { id: "gn4", type: "g", position: { x: 340, y: 110 }, data: { label: "sendStatusAlert", sub: "Function", color: "#D9822B", borderCls: "border-[#BF6A00]", Icon: Activity, fx: 2, objects: 2 } },
    { id: "gn5", type: "g", position: { x: 340, y: 210 }, data: { label: "validateMission", sub: "Function", color: "#D9822B", borderCls: "border-[#BF6A00]", Icon: Activity, fx: 1, objects: 1 } },
    { id: "gn6", type: "g", position: { x: 600, y: 140 }, data: { label: "Fleet Monitor", sub: "Application", color: "#7B4FBC", borderCls: "border-[#5A3A8C]", Icon: Monitor, links: 2, fx: 3 } },
    { id: "gn7", type: "g", position: { x: 40, y: 360 }, data: { label: "Drone", sub: "16 properties", color: "#D9534F", borderCls: "border-[#A02020]", Icon: Plane, links: 5, fx: 6, objects: 4 } },
    { id: "gn8", type: "g", position: { x: 340, y: 360 }, data: { label: "[Log] Update Status", sub: "11 properties", color: "#5C7080", borderCls: "border-[#3D4F5C]", Icon: ClipboardList, links: 2, fx: 2 } },
    { id: "gn9", type: "g", position: { x: 600, y: 300 }, data: { label: "AIP Logic", sub: "Logic node", color: "#137CBD", borderCls: "border-[#0A5C8A]", Icon: Zap, fx: 3 } },
];
const GRAPH_EDGES: Edge[] = [
    { id: "ge1", source: "gn1", target: "gn4", style: { stroke: "#CED9E0" } },
    { id: "ge2", source: "gn1", target: "gn4", style: { stroke: "#CED9E0" } },
    { id: "ge3", source: "gn2", target: "gn5", style: { stroke: "#CED9E0" } },
    { id: "ge4", source: "gn4", target: "gn6", style: { stroke: "#CED9E0" } },
    { id: "ge5", source: "gn5", target: "gn6", style: { stroke: "#CED9E0" } },
    { id: "ge6", source: "gn7", target: "gn8", style: { stroke: "#CED9E0" } },
    { id: "ge7", source: "gn6", target: "gn9", style: { stroke: "#CED9E0" } },
];

// ─── Param type icon ─────────────────────────────────────────────────────────
const ParamTypeIcon = ({ type }: { type: string }) => {
    if (type === "number") return <Hash className="w-3 h-3 text-[#5C7080]" />;
    if (type === "boolean") return <ToggleLeft className="w-3 h-3 text-[#5C7080]" />;
    if (type === "datetime") return <Calendar className="w-3 h-3 text-[#5C7080]" />;
    if (type === "enum") return <List className="w-3 h-3 text-[#5C7080]" />;
    if (type === "entity_ref") return <Database className="w-3 h-3 text-[#5C7080]" />;
    return <Quote className="w-3 h-3 text-[#5C7080]" />;
};

// ─── Form Preview renders a realistic form ───────────────────────────────────
const FormPreview = ({ action, entityTypes }: { action: AppAction; entityTypes: any[] }) => {
    const formParams = action.parameters.filter(p => p.usedIn.includes("form"));
    const issuesCount = action.parameters.filter(p => p.required && !p.defaultValue && p.isNew).length;
    return (
        <div className="bg-white border border-[#CED9E0] rounded shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-[#CED9E0]">
                <h3 className="text-[14px] font-bold text-[#182026]">{action.name}</h3>
                {action.description && <p className="text-[11px] text-[#5C7080] mt-0.5">{action.description}</p>}
            </div>
            <div className="p-4 space-y-3">
                {formParams.map(p => (
                    <div key={p.id}>
                        <label className="block text-[12px] font-bold text-[#182026] mb-1">
                            {p.name} {p.required && <span className="text-[#D9534F]">*</span>}
                        </label>
                        {p.type === "entity_ref" ? (
                            <div className="w-full border border-[#CED9E0] rounded px-2 py-1.5 text-[12px] text-[#5C7080] flex items-center justify-between cursor-pointer hover:border-[#137CBD]">
                                <span>Select an option…</span>
                                <ChevronDown className="w-3.5 h-3.5" />
                            </div>
                        ) : p.type === "enum" ? (
                            <div className="w-full border border-[#CED9E0] rounded px-2 py-1.5 text-[12px] text-[#5C7080] flex items-center justify-between cursor-pointer hover:border-[#137CBD]">
                                <span>Choose…</span>
                                <ChevronDown className="w-3.5 h-3.5" />
                            </div>
                        ) : p.type === "boolean" ? (
                            <input type="checkbox" className="w-4 h-4 accent-[#137CBD]" />
                        ) : (
                            <input type={p.type === "number" ? "number" : "text"}
                                placeholder={p.description || ""}
                                className="w-full border border-[#CED9E0] rounded px-2 py-1.5 text-[12px] focus:outline-none focus:border-[#137CBD] focus:ring-1 focus:ring-[#137CBD]/20" />
                        )}
                    </div>
                ))}
                {formParams.length === 0 && (
                    <p className="text-[11px] text-[#5C7080] text-center py-4">No form parameters yet.</p>
                )}
            </div>
            <div className="px-4 py-2.5 border-t border-[#CED9E0] bg-[#F5F8FA] flex items-center justify-between">
                {issuesCount > 0 ? (
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#D9534F]">
                        <AlertTriangle className="w-3.5 h-3.5" /> {issuesCount} issue{issuesCount > 1 ? "s" : ""}
                    </div>
                ) : <div />}
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 text-[12px] font-bold text-[#182026] bg-white border border-[#CED9E0] rounded hover:bg-[#EBF1F5]">Cancel</button>
                    <button className="px-3 py-1.5 text-[12px] font-bold text-white bg-[#0F9960] hover:bg-[#0A6640] rounded">
                        {action.customSubmitLabel || "Submit"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ActionsBuilder() {
    const {
        actions, entityTypes, addAction, updateAction, deleteAction,
        addActionParameter, updateActionParameter, deleteActionParameter, reorderActionParameters,
        addActionRule, updateActionRule, deleteActionRule,
        addSubmissionCriteria, updateSubmissionCriteria, deleteSubmissionCriteria
    } = useBuilderStore();

    const [selectedId, setSelectedId] = useState<string>(actions[0]?.id || "");
    const [activeTab, setActiveTab] = useState<Tab>("overview");
    const [viewMode, setViewMode] = useState<"config" | "graph">("config");
    const [dragOverId, setDragOverId] = useState<string | null>(null);
    const dragParamId = useRef<string | null>(null);

    // Graph state
    const [gNodes, , onGNodesChange] = useNodesState(GRAPH_NODES);
    const [gEdges, , onGEdgesChange] = useEdgesState(GRAPH_EDGES);

    const action = actions.find(a => a.id === selectedId) || actions[0];
    if (!action) return <div className="flex-1 flex items-center justify-center text-[#5C7080]">No actions. Create one.</div>;

    const targetEntity = entityTypes.find(e => e.id === action.targetEntityTypeId);
    const ActionIcon = ICON_MAP[action.icon] || Network;

    // ── Param drag-to-reorder ────────────────────────────────────────────────
    const handleParamDragStart = (paramId: string) => { dragParamId.current = paramId; };
    const handleParamDrop = (targetId: string) => {
        if (!dragParamId.current || dragParamId.current === targetId) return;
        const params = [...action.parameters];
        const fromIdx = params.findIndex(p => p.id === dragParamId.current);
        const toIdx = params.findIndex(p => p.id === targetId);
        if (fromIdx < 0 || toIdx < 0) return;
        const [moved] = params.splice(fromIdx, 1);
        params.splice(toIdx, 0, moved);
        reorderActionParameters(action.id, params);
        setDragOverId(null);
        dragParamId.current = null;
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#F5F8FA] overflow-hidden">

            {/* ── HEADER ── */}
            <div className="h-11 bg-white border-b border-[#CED9E0] flex items-center justify-between px-4 shrink-0 z-20">
                <div className="flex items-center gap-2 text-[11px] text-[#5C7080] font-bold">
                    <span className="text-[#137CBD]">Ontology</span>
                    <ChevronDown className="w-3 h-3" />
                    <span className="bg-[#EBF1F5] px-2 py-0.5 rounded text-[#182026]">Actions</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#5C7080]" />
                        <input placeholder="Search…" className="pl-6 pr-2 py-1 text-[11px] border border-[#CED9E0] rounded focus:outline-none focus:border-[#137CBD] w-36" />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-[#5C7080] font-mono">⌘K</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {action.hasWarnings && (
                        <div className="flex items-center gap-1 text-[11px] text-[#D9822B] font-bold">
                            <AlertTriangle className="w-3.5 h-3.5" /> {action.editCount} edits ⚠{1}
                        </div>
                    )}
                    {!action.hasWarnings && (
                        <span className="text-[11px] text-[#5C7080]">{action.editCount} edits</span>
                    )}
                    <button className="h-7 px-3 border border-[#CED9E0] rounded text-[11px] font-bold text-[#182026] hover:bg-[#EBF1F5]">Discard</button>
                    <button className="h-7 px-3 bg-[#0F9960] hover:bg-[#0A6640] text-white rounded text-[11px] font-bold">Save</button>
                </div>
            </div>

            <div className="flex-1 flex min-h-0">

                {/* ── LEFT PANEL ── */}
                <div className="w-64 bg-white border-r border-[#CED9E0] flex flex-col shrink-0">
                    {/* Action header */}
                    <div className="p-3 border-b border-[#CED9E0]">
                        <button className="flex items-center gap-1.5 text-[11px] text-[#5C7080] hover:text-[#182026] mb-3">
                            <ArrowLeft className="w-3.5 h-3.5" /> Back home
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded flex items-center justify-center shrink-0" style={{ background: action.iconColor }}>
                                <ActionIcon className="w-4 h-4 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <input
                                    value={action.name}
                                    onChange={e => updateAction(action.id, { name: e.target.value })}
                                    className="font-bold text-[13px] text-[#182026] bg-transparent outline-none w-full truncate focus:bg-[#F5F8FA] rounded px-1"
                                />
                            </div>
                            {action.hasWarnings && <AlertTriangle className="w-3.5 h-3.5 text-[#D9822B] shrink-0" />}
                            <button className="text-[#5C7080] hover:text-[#182026] shrink-0"><MoreHorizontal className="w-4 h-4" /></button>
                        </div>
                    </div>

                    {/* View toggle: Config | Graph */}
                    <div className="flex px-3 py-1.5 gap-1 border-b border-[#CED9E0] bg-[#F5F8FA]">
                        {(["config", "graph"] as const).map(v => (
                            <button key={v} onClick={() => setViewMode(v)}
                                className={`flex-1 py-1 text-[11px] font-bold rounded capitalize transition-colors ${viewMode === v ? "bg-[#137CBD] text-white" : "text-[#5C7080] hover:bg-[#EBF1F5]"}`}
                            >{v}</button>
                        ))}
                    </div>

                    {/* Nav tabs */}
                    <div className="flex-1 overflow-y-auto">
                        {NAV_TABS.map(tab => {
                            const ruleBadge = tab.id === "rules" && action.rules.length === 0;
                            const hasLogBeta = tab.id === "log";
                            return (
                                <button key={tab.id}
                                    onClick={() => { setActiveTab(tab.id); setViewMode("config"); }}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-[12px] border-b border-[#CED9E0]/50 transition-colors ${activeTab === tab.id && viewMode === "config"
                                            ? "bg-[#EBF1F5] border-l-2 border-[#137CBD] text-[#137CBD] font-bold"
                                            : "text-[#5C7080] hover:bg-[#F5F8FA] border-l-2 border-transparent"
                                        }`}
                                >
                                    <tab.icon className="w-3.5 h-3.5 shrink-0" />
                                    <span className="flex-1 text-left">{tab.label}</span>
                                    {ruleBadge && <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">No rules</span>}
                                    {hasLogBeta && <span className="text-[8px] font-bold bg-[#EBF1F5] text-[#5C7080] px-1.5 py-0.5 rounded">Beta</span>}
                                </button>
                            );
                        })}

                        {/* Divider + action list */}
                        <div className="px-3 pt-3 pb-1 flex items-center justify-between">
                            <span className="text-[9px] font-bold text-[#5C7080] uppercase tracking-wider">All Actions</span>
                            <button onClick={() => {
                                const newId = `act-${Date.now()}`;
                                addAction({
                                    id: newId, name: "New Action", description: "", icon: "Network", iconColor: "#137CBD",
                                    targetEntityTypeId: entityTypes[0]?.id || "", parameters: [], rules: [],
                                    submissionCriteria: [], logEntries: [], editCount: 0, hasWarnings: false
                                });
                                setSelectedId(newId);
                            }} className="p-0.5 hover:bg-[#EBF1F5] rounded text-[#137CBD]">
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        {actions.map(a => {
                            const AIcon = ICON_MAP[a.icon] || Network;
                            return (
                                <button key={a.id} onClick={() => setSelectedId(a.id)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] border-l-2 transition-colors ${selectedId === a.id ? "bg-[#EBF1F5] border-[#137CBD] text-[#182026] font-bold" : "border-transparent text-[#5C7080] hover:bg-[#F5F8FA]"
                                        }`}>
                                    <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ background: a.iconColor }}>
                                        <AIcon className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="truncate flex-1 text-left">{a.name}</span>
                                    {a.hasWarnings && <AlertTriangle className="w-3 h-3 text-[#D9822B] shrink-0" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── CENTER + RIGHT CONTENT ── */}
                {viewMode === "graph" ? (
                    /* Action Graph View */
                    <div className="flex-1 relative">
                        <ReactFlow nodes={gNodes} edges={gEdges} onNodesChange={onGNodesChange} onEdgesChange={onGEdgesChange}
                            nodeTypes={graphNodeTypes} connectionLineType={ConnectionLineType.SmoothStep}
                            fitView fitViewOptions={{ padding: 0.2 }} proOptions={{ hideAttribution: false }}>
                            <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="#D8E1E8" />
                            <Controls showInteractive={false} className="!bg-white !border-[#CED9E0] !rounded !shadow-sm" />
                        </ReactFlow>
                        {/* Legend */}
                        <div className="absolute top-4 right-4 bg-white/95 border border-[#CED9E0] rounded shadow px-3 py-2 z-10">
                            <div className="flex items-center gap-3 text-[10px] flex-wrap">
                                {[["#137CBD", "Logic", (1)], ["#7B4FBC", "Application", (1)], ["#D9822B", "Functions/Actions", (7)], ["#D9534F", "Outage Alert", (1)]].map(([col, lbl, cnt]) => (
                                    <div key={lbl as string} className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-sm" style={{ background: col as string }} />
                                        <span className="text-[#182026] font-medium">{lbl as string}</span>
                                        <span className="text-[#5C7080]">({cnt})</span>
                                    </div>
                                ))}
                                <button className="flex items-center gap-1 text-[#137CBD] font-bold hover:underline ml-2">
                                    <Plus className="w-3 h-3" /> Add
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Config View */
                    <div className="flex-1 flex min-w-0">

                        {/* Center content area */}
                        <div className={`flex-1 flex flex-col overflow-hidden bg-white ${activeTab === "form" ? "border-r border-[#CED9E0]" : ""}`}>

                            {/* ── OVERVIEW TAB ── */}
                            {activeTab === "overview" && (
                                <div className="flex-1 overflow-y-auto p-6 max-w-2xl">
                                    <div className="mb-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded flex items-center justify-center" style={{ background: action.iconColor }}>
                                                <ActionIcon className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <div className="text-[16px] font-black text-[#182026]">{action.name}</div>
                                                <div className="text-[11px] text-[#5C7080]">Action Type · {action.editCount} edits</div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-[11px] font-bold text-[#5C7080] uppercase tracking-wider mb-1">Description</label>
                                                <textarea
                                                    value={action.description}
                                                    onChange={e => updateAction(action.id, { description: e.target.value })}
                                                    rows={3}
                                                    className="w-full border border-[#CED9E0] rounded px-3 py-2 text-[12px] text-[#182026] focus:outline-none focus:border-[#137CBD] resize-none"
                                                    placeholder="Describe what this action does…"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-[#5C7080] uppercase tracking-wider mb-1">Target Entity Type</label>
                                                <select value={action.targetEntityTypeId}
                                                    onChange={e => updateAction(action.id, { targetEntityTypeId: e.target.value })}
                                                    className="w-full border border-[#CED9E0] rounded px-3 py-2 text-[12px] text-[#182026] focus:outline-none focus:border-[#137CBD] bg-white">
                                                    {entityTypes.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="pt-4 border-t border-[#CED9E0]">
                                                <label className="block text-[11px] font-bold text-[#5C7080] uppercase tracking-wider mb-2">Summary</label>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {[
                                                        { label: "Parameters", value: action.parameters.length },
                                                        { label: "Rules", value: action.rules.length },
                                                        { label: "Criteria", value: action.submissionCriteria.length },
                                                    ].map(s => (
                                                        <div key={s.label} className="border border-[#CED9E0] rounded p-3 text-center">
                                                            <div className="text-[20px] font-black text-[#182026]">{s.value}</div>
                                                            <div className="text-[10px] text-[#5C7080] font-bold uppercase">{s.label}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── RULES TAB ── */}
                            {activeTab === "rules" && (
                                <div className="flex-1 overflow-y-auto">
                                    <div className="p-4 border-b border-[#CED9E0] bg-[#F5F8FA] flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-[#5C7080] uppercase tracking-wider">Ontology Mutations ({action.rules.length})</span>
                                        <button onClick={() => addActionRule(action.id, { id: `rule-${Date.now()}`, operation: "modify", targetEntityTypeId: action.targetEntityTypeId })}
                                            className="flex items-center gap-1 text-[11px] text-[#137CBD] font-bold hover:underline">
                                            <Plus className="w-3.5 h-3.5" /> Add rule
                                        </button>
                                    </div>
                                    {action.rules.length === 0 && (
                                        <div className="p-12 text-center">
                                            <Pencil className="w-8 h-8 mx-auto mb-3 text-[#CED9E0]" />
                                            <p className="text-[13px] font-bold text-[#182026] mb-1">No rules yet</p>
                                            <p className="text-[11px] text-[#5C7080]">Add rules to define what this action modifies in the ontology.</p>
                                        </div>
                                    )}
                                    {action.rules.map((rule, idx) => {
                                        const ruleEntity = entityTypes.find(e => e.id === rule.targetEntityTypeId);
                                        return (
                                            <div key={rule.id} className="flex items-start gap-3 px-4 py-3 border-b border-[#CED9E0]/50 hover:bg-[#F5F8FA] group">
                                                <span className="text-[10px] text-[#5C7080] font-bold w-4 pt-1.5 shrink-0">{idx + 1}</span>
                                                <div className="flex-1 grid grid-cols-3 gap-2">
                                                    <select value={rule.operation}
                                                        onChange={e => updateActionRule(action.id, rule.id, { operation: e.target.value as any })}
                                                        className="border border-[#CED9E0] rounded px-2 py-1.5 text-[11px] text-[#182026] bg-white focus:outline-none focus:border-[#137CBD]">
                                                        {Object.entries(OP_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                                    </select>
                                                    <select value={rule.targetEntityTypeId}
                                                        onChange={e => updateActionRule(action.id, rule.id, { targetEntityTypeId: e.target.value })}
                                                        className="border border-[#CED9E0] rounded px-2 py-1.5 text-[11px] text-[#182026] bg-white focus:outline-none focus:border-[#137CBD]">
                                                        {entityTypes.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                                    </select>
                                                    {rule.operation === "modify" ? (
                                                        <div className="flex gap-1">
                                                            <select value={rule.propertyId || ""}
                                                                onChange={e => updateActionRule(action.id, rule.id, { propertyId: e.target.value })}
                                                                className="flex-1 border border-[#CED9E0] rounded px-2 py-1.5 text-[11px] text-[#182026] bg-white focus:outline-none focus:border-[#137CBD]">
                                                                <option value="">property…</option>
                                                                {ruleEntity?.properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                            </select>
                                                        </div>
                                                    ) : (
                                                        <div className="border border-[#CED9E0] rounded px-2 py-1.5 text-[11px] text-[#5C7080]">{OP_LABELS[rule.operation]}</div>
                                                    )}
                                                </div>
                                                {rule.operation === "modify" && (
                                                    <div className="w-full col-span-3 mt-1 pl-7">
                                                        <input value={rule.value || ""}
                                                            onChange={e => updateActionRule(action.id, rule.id, { value: e.target.value })}
                                                            placeholder="value or @param.name"
                                                            className="w-full border border-[#CED9E0] rounded px-2 py-1.5 text-[11px] font-mono focus:outline-none focus:border-[#137CBD]" />
                                                    </div>
                                                )}
                                                <button onClick={() => deleteActionRule(action.id, rule.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded text-[#D9534F] shrink-0">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* ── FORM TAB ── */}
                            {activeTab === "form" && (
                                <div className="flex-1 overflow-y-auto">
                                    {/* Form Content header */}
                                    <div className="px-4 py-3 border-b border-[#CED9E0] bg-[#F5F8FA] flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <FormInput className="w-4 h-4 text-[#5C7080]" />
                                            <span className="text-[11px] font-bold text-[#5C7080] uppercase tracking-wider">Form Content</span>
                                        </div>
                                        {action.parameters.filter(p => p.usedIn.includes("form")).length > 0 && (
                                            <CheckCircle className="w-4 h-4 text-[#0BB68F]" />
                                        )}
                                    </div>

                                    {/* Parameter rows */}
                                    <div className="divide-y divide-[#CED9E0]/50">
                                        {action.parameters.map(p => {
                                            const usedInLabels = p.usedIn.map(u => u === "rules" ? "Used in Rules" : u === "security" ? "Used in Security" : "").filter(Boolean);
                                            return (
                                                <div key={p.id}
                                                    draggable
                                                    onDragStart={() => handleParamDragStart(p.id)}
                                                    onDragOver={e => { e.preventDefault(); setDragOverId(p.id); }}
                                                    onDrop={() => handleParamDrop(p.id)}
                                                    onDragLeave={() => setDragOverId(null)}
                                                    className={`flex items-center gap-2 px-3 py-2.5 hover:bg-[#F5F8FA] cursor-grab group transition-colors ${dragOverId === p.id ? "border-t-2 border-[#137CBD]" : ""}`}>
                                                    <GripVertical className="w-3.5 h-3.5 text-[#CED9E0] hover:text-[#5C7080] shrink-0 cursor-grab" />
                                                    <div className="w-6 h-6 rounded flex items-center justify-center bg-[#EBF1F5] shrink-0">
                                                        <ParamTypeIcon type={p.type} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <input value={p.name}
                                                                onChange={e => updateActionParameter(action.id, p.id, { name: e.target.value })}
                                                                className="font-bold text-[12px] text-[#182026] bg-transparent outline-none focus:bg-white focus:ring-1 focus:ring-[#137CBD] rounded px-1" />
                                                            {usedInLabels.map(l => (
                                                                <span key={l} className="text-[9px] text-[#5C7080] bg-[#EBF1F5] px-1.5 py-0.5 rounded">{l}</span>
                                                            ))}
                                                            {p.isNew && <span className="text-[9px] font-bold text-white bg-[#137CBD] px-1.5 py-0.5 rounded">New</span>}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <select value={p.type}
                                                                onChange={e => updateActionParameter(action.id, p.id, { type: e.target.value as any })}
                                                                className="text-[9px] text-[#5C7080] bg-transparent outline-none cursor-pointer border border-transparent hover:border-[#CED9E0] rounded">
                                                                <option value="string">String</option>
                                                                <option value="number">Number</option>
                                                                <option value="boolean">Boolean</option>
                                                                <option value="enum">Enum</option>
                                                                <option value="entity_ref">Entity Ref</option>
                                                            </select>
                                                            {p.required && <span className="text-[9px] text-[#D9822B] font-bold">Required</span>}
                                                        </div>
                                                    </div>
                                                    <button onClick={() => deleteActionParameter(action.id, p.id)}
                                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded text-[#D9534F] shrink-0">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Add parameter / section */}
                                    <div className="p-3 border-b border-[#CED9E0] flex items-center gap-2">
                                        <button
                                            onClick={() => addActionParameter(action.id, { id: `par-${Date.now()}`, name: "new_parameter", type: "string", required: false, usedIn: ["form"], isNew: true })}
                                            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#CED9E0] rounded text-[11px] font-bold text-[#182026] hover:bg-[#EBF1F5]">
                                            <Plus className="w-3.5 h-3.5 text-[#137CBD]" /> Add new parameter
                                        </button>
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 border border-[#CED9E0] rounded text-[11px] font-bold text-[#182026] hover:bg-[#EBF1F5]">
                                            Add section
                                        </button>
                                    </div>

                                    {/* Customization toggles */}
                                    <div className="divide-y divide-[#CED9E0]/50">
                                        {[
                                            { label: "Customize submit button", value: !!action.customSubmitLabel },
                                            { label: "Customize success message", value: !!action.customSuccessMessage },
                                        ].map(item => (
                                            <div key={item.label} className="flex items-center justify-between px-4 py-3 hover:bg-[#F5F8FA] cursor-pointer group">
                                                <span className="text-[12px] text-[#182026] font-medium">{item.label}</span>
                                                <div className={`w-9 h-5 rounded-full relative transition-colors ${item.value ? "bg-[#137CBD]" : "bg-[#CED9E0]"}`}>
                                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${item.value ? "left-4" : "left-0.5"}`} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── LOG TAB ── */}
                            {activeTab === "log" && (
                                <div className="flex-1 overflow-y-auto">
                                    <div className="px-4 py-3 border-b border-[#CED9E0] bg-[#F5F8FA]">
                                        <span className="text-[11px] font-bold text-[#5C7080] uppercase tracking-wider">Submission Log ({action.logEntries.length})</span>
                                    </div>
                                    {action.logEntries.length === 0 && (
                                        <div className="p-12 text-center">
                                            <ClipboardList className="w-8 h-8 mx-auto mb-3 text-[#CED9E0]" />
                                            <p className="text-[13px] font-bold text-[#182026] mb-1">No submissions yet</p>
                                            <p className="text-[11px] text-[#5C7080]">Action submissions will appear here.</p>
                                        </div>
                                    )}
                                    {action.logEntries.map(entry => (
                                        <div key={entry.id} className="flex items-start gap-3 px-4 py-3 border-b border-[#CED9E0]/50 hover:bg-[#F5F8FA]">
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 shrink-0 ${entry.succeeded ? "bg-emerald-100" : "bg-red-100"}`}>
                                                {entry.succeeded
                                                    ? <CheckCircle className="w-3 h-3 text-emerald-600" />
                                                    : <X className="w-3 h-3 text-red-500" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[12px] font-bold text-[#182026]">{entry.summary}</div>
                                                <div className="text-[10px] text-[#5C7080] mt-0.5">{entry.user} · {new Date(entry.timestamp).toLocaleString()}</div>
                                                <div className="flex gap-1.5 flex-wrap mt-1">
                                                    {Object.entries(entry.parameterValues).map(([k, v]) => (
                                                        <span key={k} className="text-[9px] font-mono bg-[#EBF1F5] text-[#5C7080] px-1.5 py-0.5 rounded">{k}: {v}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* ── SECURITY TAB ── */}
                            {activeTab === "security" && (
                                <div className="flex-1 overflow-y-auto">
                                    <div className="px-4 py-3 border-b border-[#CED9E0] bg-[#F5F8FA] flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-[#5C7080] uppercase tracking-wider">Submission Criteria ({action.submissionCriteria.length})</span>
                                        <button onClick={() => addSubmissionCriteria(action.id, { id: `sc-${Date.now()}`, condition: "", description: "", enabled: true })}
                                            className="flex items-center gap-1 text-[11px] text-[#137CBD] font-bold hover:underline">
                                            <Plus className="w-3.5 h-3.5" /> Add criteria
                                        </button>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-[11px] text-[#5C7080] mb-4">Define conditions that must be true for this action to be available. Combine contextual information (user, parameters) with static data.</p>
                                        {action.submissionCriteria.length === 0 && (
                                            <div className="text-center py-8">
                                                <ShieldCheck className="w-8 h-8 mx-auto mb-3 text-[#CED9E0]" />
                                                <p className="text-[12px] font-bold text-[#182026] mb-1">No criteria defined</p>
                                                <p className="text-[11px] text-[#5C7080]">This action can always be submitted.</p>
                                            </div>
                                        )}
                                        <div className="space-y-3">
                                            {action.submissionCriteria.map((sc, idx) => (
                                                <div key={sc.id} className="border border-[#CED9E0] rounded p-3 bg-white group hover:border-[#137CBD]/30">
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-[10px] font-bold text-[#5C7080] mt-2 shrink-0 w-4">{idx + 1}</span>
                                                        <div className="flex-1 space-y-2">
                                                            <div>
                                                                <label className="text-[9px] font-bold text-[#5C7080] uppercase tracking-wider">Condition</label>
                                                                <input value={sc.condition}
                                                                    onChange={e => updateSubmissionCriteria(action.id, sc.id, { condition: e.target.value })}
                                                                    placeholder="e.g. drone.status == 'Grounded'"
                                                                    className="w-full border border-[#CED9E0] rounded px-2 py-1.5 text-[11px] font-mono mt-1 focus:outline-none focus:border-[#137CBD]" />
                                                            </div>
                                                            <div>
                                                                <label className="text-[9px] font-bold text-[#5C7080] uppercase tracking-wider">Description</label>
                                                                <input value={sc.description}
                                                                    onChange={e => updateSubmissionCriteria(action.id, sc.id, { description: e.target.value })}
                                                                    placeholder="Explain what this criteria enforces…"
                                                                    className="w-full border border-[#CED9E0] rounded px-2 py-1.5 text-[11px] mt-1 focus:outline-none focus:border-[#137CBD]" />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0 mt-1">
                                                            <div onClick={() => updateSubmissionCriteria(action.id, sc.id, { enabled: !sc.enabled })}
                                                                className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors ${sc.enabled ? "bg-[#137CBD]" : "bg-[#CED9E0]"}`}>
                                                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${sc.enabled ? "left-4" : "left-0.5"}`} />
                                                            </div>
                                                            <button onClick={() => deleteSubmissionCriteria(action.id, sc.id)}
                                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded text-[#D9534F]">
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── RIGHT: Form Preview (Form tab only) ── */}
                        {activeTab === "form" && (
                            <div className="w-80 bg-[#F5F8FA] border-l border-[#CED9E0] flex flex-col shrink-0">
                                <div className="px-4 py-3 border-b border-[#CED9E0] bg-white">
                                    <div className="flex items-center gap-2">
                                        <Monitor className="w-3.5 h-3.5 text-[#5C7080]" />
                                        <span className="text-[11px] font-bold text-[#5C7080] uppercase tracking-wider">Form Preview</span>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4">
                                    <FormPreview action={action} entityTypes={entityTypes} />
                                </div>
                            </div>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
}
