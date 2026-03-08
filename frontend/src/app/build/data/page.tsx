"use client";

import { useState, useCallback, useEffect } from "react";
import ReactFlow, {
    Background, Controls, Node, Edge, useNodesState, useEdgesState,
    Handle, Position, BackgroundVariant, NodeProps, MiniMap,
    BaseEdge, getSmoothStepPath, addEdge, Connection
} from "reactflow";
import "reactflow/dist/style.css";
import {
    Database, Server, FileJson, Play, Save, ChevronRight, X, AlertCircle, Check,
    Loader2, Key, Hash, Activity, RefreshCw, MoveRight, Layers, ArrowRightLeft, DatabaseZap, Clock, FileText, CheckCircle2, XCircle
} from "lucide-react";
import { useWebSocket } from "@/hooks/useWebSocket";

// ─── Constants ────────────────────────────────────────────────────────────────
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const FETCH_TIMEOUT_MS = 10_000;

const C = {
    bg: "#F5F8FA", white: "#FFFFFF", border: "#CED9E0", text: "#182026",
    sub: "#5C7080", accent: "#137CBD", pill: "#EBF1F5", red: "#DB3737", green: "#0F9960"
};

// ─── API Helper ──────────────────────────────────────────────────────────────
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
        if (e.name === 'AbortError') throw new Error(`Request timed out`);
        throw e;
    } finally {
        clearTimeout(timer);
    }
}

// ─── Custom Custom Nodes ─────────────────────────────────────────────────────

const DataSourceNode = ({ data, selected }: NodeProps) => (
    <div className={`bg-white shadow-sm rounded overflow-hidden min-w-[200px] transition-all select-none ${selected ? "ring-2 ring-[#137CBD]" : "ring-1 ring-[#CED9E0]"}`}>
        <div className="px-3 py-2 border-b border-[#CED9E0] bg-[#F5F8FA] flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-[#5C7080]" />
                <span className="font-bold text-[12px] text-[#182026]">{data.label}</span>
            </div>
            <span className="text-[9px] bg-white border border-[#CED9E0] px-1 rounded text-[#5C7080] font-mono">{data.type}</span>
        </div>
        <Handle type="source" position={Position.Right} style={{ background: "#137CBD", right: -4, width: 8, height: 8 }} />
    </div>
);

const EntityTargetNode = ({ data, selected }: NodeProps) => (
    <div className={`bg-white shadow-sm rounded overflow-hidden min-w-[200px] transition-all select-none ${selected ? "ring-2 ring-[#137CBD]" : "ring-1 ring-[#CED9E0]"}`}>
        <Handle type="target" position={Position.Left} style={{ background: "#0F9960", left: -4, width: 8, height: 8 }} />
        <div className="px-3 py-2 border-b border-[#CED9E0] bg-[#ECFDF5] flex items-center gap-2">
            <Database className="w-4 h-4 text-[#0F9960]" />
            <span className="font-bold text-[12px] text-[#065F46]">{data.label}</span>
        </div>
        <div className="px-3 py-1.5 text-[10px] text-[#5C7080] flex justify-between">
            <span>Attributes:</span><span className="font-bold">{data.attributes?.length || 0}</span>
        </div>
    </div>
);

const CsvUploadNode = ({ data, selected }: NodeProps) => (
    <div className={`bg-white shadow-sm rounded overflow-hidden min-w-[200px] transition-all select-none ${selected ? "ring-2 ring-[#137CBD]" : "ring-1 ring-[#CED9E0]"}`}>
        <div className="px-3 py-2 border-b border-[#CED9E0] bg-[#F5F8FA] flex items-center justify-between">
            <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#137CBD]" />
                <span className="font-bold text-[12px] text-[#182026]">{data.label || 'CSV Upload'}</span>
            </div>
            <span className="text-[9px] bg-white border border-[#CED9E0] px-1 rounded text-[#5C7080] font-mono">source</span>
        </div>
        <Handle type="source" position={Position.Right} style={{ background: "#137CBD", right: -4, width: 8, height: 8 }} />
    </div>
);

const ApiPollingNode = ({ data, selected }: NodeProps) => (
    <div className={`bg-white shadow-sm rounded overflow-hidden min-w-[200px] transition-all select-none ${selected ? "ring-2 ring-[#137CBD]" : "ring-1 ring-[#CED9E0]"}`}>
        <div className="px-3 py-2 border-b border-[#CED9E0] bg-[#F5F8FA] flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#137CBD]" />
                <span className="font-bold text-[12px] text-[#182026]">{data.label || 'API Polling'}</span>
            </div>
            <span className="text-[9px] bg-white border border-[#CED9E0] px-1 rounded text-[#5C7080] font-mono">source</span>
        </div>
        <Handle type="source" position={Position.Right} style={{ background: "#137CBD", right: -4, width: 8, height: 8 }} />
    </div>
);

const WebhookSourceNode = ({ data, selected }: NodeProps) => (
    <div className={`bg-white shadow-sm rounded overflow-hidden min-w-[200px] transition-all select-none ${selected ? "ring-2 ring-[#137CBD]" : "ring-1 ring-[#CED9E0]"}`}>
        <div className="px-3 py-2 border-b border-[#CED9E0] bg-[#F5F8FA] flex items-center justify-between">
            <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-[#137CBD]" />
                <span className="font-bold text-[12px] text-[#182026]">{data.label || 'Webhook'}</span>
            </div>
            <span className="text-[9px] bg-white border border-[#CED9E0] px-1 rounded text-[#5C7080] font-mono">source</span>
        </div>
        <Handle type="source" position={Position.Right} style={{ background: "#137CBD", right: -4, width: 8, height: 8 }} />
    </div>
);

const DataTransformNode = ({ data, selected }: NodeProps) => (
    <div className={`bg-white shadow-sm rounded overflow-hidden min-w-[200px] transition-all select-none ${selected ? "ring-2 ring-[#137CBD]" : "ring-1 ring-[#CED9E0]"}`}>
        <Handle type="target" position={Position.Left} style={{ background: "#5C7080", left: -4, width: 8, height: 8 }} />
        <div className="px-3 py-2 border-b border-[#CED9E0] bg-[#F5F8FA] flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#137CBD]" />
                <span className="font-bold text-[12px] text-[#182026]">{data.label || 'Transform'}</span>
            </div>
            <span className="text-[9px] bg-white border border-[#CED9E0] px-1 rounded text-[#5C7080] font-mono">transform</span>
        </div>
        <Handle type="source" position={Position.Right} style={{ background: "#137CBD", right: -4, width: 8, height: 8 }} />
    </div>
);

const MappingEdge = ({ id, sourceX, sourceY, targetX, targetY, style, markerEnd, selected }: any) => {
    const [path, lx, ly] = getSmoothStepPath({ sourceX, sourceY, targetX, targetY, borderRadius: 0 });
    return (
        <>
            <BaseEdge id={id} path={path} markerEnd={markerEnd}
                style={{ stroke: selected ? '#137CBD' : '#CED9E0', strokeWidth: selected ? 2 : 1.5, ...style }} />
            <div style={{ position: "absolute", transform: `translate(-50%,-50%) translate(${lx}px,${ly}px)`, pointerEvents: "all" }}>
                <div className={`w-6 h-6 rounded flex items-center justify-center shadow-sm cursor-pointer transition-colors ${selected ? "bg-[#137CBD] text-white" : "bg-white border border-[#CED9E0] text-[#5C7080] hover:bg-[#EBF1F5]"}`}>
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                </div>
            </div>
        </>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PipelineBuilder() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: "err" | "ok" | "info" } | null>(null);

    // Sidebar Data
    const [sources, setSources] = useState<any[]>([]);
    const [entityTypes, setEntityTypes] = useState<any[]>([]);

    // Pipeline State
    const [currentPipelineId, setCurrentPipelineId] = useState<string>("default");
    const [integrationJob, setIntegrationJob] = useState<any>(null); // DB synced job
    const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({}); // local state for right panel
    const [logicalIdField, setLogicalIdField] = useState<string>("_id");

    // ReactFlow
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

    // Runs History
    const [runPanelOpen, setRunPanelOpen] = useState(false);
    const [runs, setRuns] = useState<any[]>([]);
    const [selectedRun, setSelectedRun] = useState<any>(null);

    useWebSocket(["pipelines:*"], {
        onEvent: (ev) => {
            if (ev.pipelineId !== currentPipelineId) return;
            if (ev.type === "pipeline.progress" || ev.type === "pipeline.complete") {
                fetchRuns(currentPipelineId);
                if (selectedRun && selectedRun.id === ev.runId) {
                    apiFetch(`/api/pipelines/${currentPipelineId}/runs/${ev.runId}`).then(setSelectedRun).catch(() => { });
                }
            }
        }
    });

    const showToast = (msg: string, type: "err" | "ok" | "info") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchRuns = async (pipelineId: string) => {
        try {
            const data = await apiFetch(`/api/pipelines/${pipelineId}/runs`);
            setRuns(data);
        } catch { }
    };

    // ── DATA FETCHING ──
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                // Fetch library data
                const [srcs, ets, pipes] = await Promise.all([
                    apiFetch("/api/data/sources"),
                    apiFetch("/api/ontology/entity-types"),
                    apiFetch("/api/data/pipelines")
                ]);
                setSources(srcs);
                setEntityTypes(ets);

                if (pipes.length > 0) {
                    const p = pipes[0];
                    setCurrentPipelineId(p.id);
                    if (p.nodes) setNodes(p.nodes);
                    if (p.edges) setEdges(p.edges);
                    fetchRuns(p.id);
                }
            } catch (e: any) {
                showToast(e.message, "err");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // ── REACTFLOW ACTIONS ──
    const onConnect = useCallback((params: Connection) => {
        setEdges((eds) => addEdge({ ...params, type: "mappingEdge" }, eds));
    }, [setEdges]);

    const onEdgeClick = (_: any, edge: Edge) => {
        setSelectedEdgeId(edge.id);
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);

        if (sourceNode && targetNode) {
            // Find if there's already an integration job mapped
            const jobName = `Sync_${sourceNode.id}_to_${targetNode.id}`;
            apiFetch(`/api/data/pipelines`).then(() => {
                // For simplicity in UI, we manage state locally then save
                if (!fieldMapping.logicalIdField) setLogicalIdField("id");
            }).catch(() => { });
        }
    };

    const handleDragStart = (e: any, item: any, type: string) => {
        e.dataTransfer.setData("application/reactflow", JSON.stringify({ item, type }));
        e.dataTransfer.effectAllowed = "move";
    };

    const onDrop = useCallback((e: any) => {
        e.preventDefault();
        const reactFlowBounds = document.querySelector('.react-flow')?.getBoundingClientRect();
        if (!reactFlowBounds) return;

        const dataStr = e.dataTransfer.getData("application/reactflow");
        if (!dataStr) return;
        const { item, type } = JSON.parse(dataStr);

        const position = {
            x: e.clientX - reactFlowBounds.left - 100,
            y: e.clientY - reactFlowBounds.top - 25,
        };

        const newNode: Node = {
            id: `${type}-${item.id}-${Date.now()}`,
            type: type === "source" ? "dataSource" : type === "target" ? "entityTarget" : type,
            position,
            data: { ...item, label: item.name },
        };
        setNodes((nds) => nds.concat(newNode));
    }, [nodes, setNodes]);

    const onDragOver = useCallback((e: any) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    }, []);

    // ── DB SAVE & RUN ──
    const handleSavePipeline = async () => {
        setSaving(true);
        try {
            if (currentPipelineId && currentPipelineId !== "default") {
                await apiFetch(`/api/pipelines/${currentPipelineId}`, {
                    method: "PUT",
                    body: JSON.stringify({ nodes, edges })
                });
            } else {
                const p = await apiFetch("/api/pipelines", {
                    method: "POST",
                    body: JSON.stringify({ name: "Default_Pipeline", description: "Auto-generated", nodes, edges })
                });
                setCurrentPipelineId(p.id);
            }
            showToast("Pipeline saved successfully", "ok");
        } catch (e: any) {
            showToast(e.message, "err");
        } finally {
            setSaving(false);
        }
    };

    const handleRunJob = async () => {
        if (!currentPipelineId || currentPipelineId === "default") {
            showToast("Please save the pipeline first before running.", "err");
            return;
        }
        try {
            showToast("Triggering Pipeline Execution...", "info");
            setRunPanelOpen(true);
            const { runId } = await apiFetch(`/api/pipelines/${currentPipelineId}/run`, { method: "POST" });
            fetchRuns(currentPipelineId);
            const run = await apiFetch(`/api/pipelines/${currentPipelineId}/runs/${runId}`);
            setSelectedRun(run);
        } catch (e: any) {
            showToast(e.message, "err");
        }
    };

    // Right panel data
    const selectedEdge = edges.find(e => e.id === selectedEdgeId);
    const selectedTargetNode = nodes.find(n => n.id === selectedEdge?.target);
    const targetAttributes = selectedTargetNode?.data?.attributes || [];

    return (
        <div className="flex h-screen w-full bg-[#182026] text-white font-[Inter,sans-serif] overflow-hidden">
            {/* ── LEFT NAV (App Chrome) ── */}
            <div className="w-14 bg-[#10161A] border-r border-[#293742] flex flex-col items-center py-3 shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold mb-6">AIP</div>
                <button className="w-10 h-10 flex flex-col items-center justify-center text-[#137CBD] group relative">
                    <Layers className="w-5 h-5 mb-1" />
                    <span className="text-[9px] font-bold">Data</span>
                </button>
            </div>

            <div className="flex-1 flex flex-col min-w-0 bg-[#F5F8FA] text-[#182026]">
                {/* ── HEADER ── */}
                <div className="h-12 bg-white border-b border-[#CED9E0] flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
                    <div className="flex items-center gap-3">
                        <DatabaseZap className="w-4 h-4 text-[#5C7080]" />
                        <span className="font-bold text-[14px]">Data Connection / Pipeline Builder</span>
                    </div>
                    <div className="flex items-center gap-3">
                        {saving && <Loader2 className="w-4 h-4 text-[#5C7080] animate-spin" />}
                        <button onClick={() => setRunPanelOpen(!runPanelOpen)} className="h-7 px-3 bg-white border border-[#CED9E0] hover:bg-[#EBF1F5] text-[#182026] text-[11px] font-bold rounded shadow-sm transition-colors flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> History</button>
                        <button onClick={handleSavePipeline} className="h-7 px-3 bg-white border border-[#CED9E0] hover:bg-[#EBF1F5] text-[#182026] text-[11px] font-bold rounded shadow-sm transition-colors flex items-center gap-1.5"><Save className="w-3.5 h-3.5" /> Save</button>
                        <button onClick={handleRunJob} className="h-7 px-3 bg-[#0F9960] hover:bg-[#0A6640] text-white text-[11px] font-bold rounded shadow-sm transition-colors flex items-center gap-1.5"><Play className="w-3.5 h-3.5" /> Run Pipeline</button>
                    </div>
                </div>

                {/* ── WORKSPACE ── */}
                <div className="flex-1 flex min-h-0 relative">
                    {/* Toast Notification */}
                    {toast && (
                        <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded shadow-lg text-[12px] font-bold flex items-center gap-2 text-white ${toast.type === "err" ? "bg-[#DB3737]" : toast.type === "ok" ? "bg-[#0F9960]" : "bg-[#137CBD]"}`}>
                            {toast.type === "err" ? <AlertCircle className="w-4 h-4" /> : toast.type === "ok" ? <Check className="w-4 h-4" /> : <Activity className="w-4 h-4 animate-pulse" />} {toast.msg}
                        </div>
                    )}

                    {/* Left Sidebar (Library) */}
                    <div className="w-64 bg-white border-r border-[#CED9E0] flex flex-col shrink-0">
                        <div className="p-3 border-b border-[#CED9E0] bg-[#F5F8FA] text-[11px] font-bold text-[#5C7080] uppercase tracking-wider">
                            Pipeline Nodes
                        </div>
                        <div className="p-3 space-y-2 overflow-auto max-h-[40%] border-b border-[#CED9E0]">
                            <div draggable onDragStart={(e) => handleDragStart(e, { id: 'new-csv', name: 'CSV Upload' }, "csvUpload")} className="p-2 border border-[#CED9E0] rounded bg-white text-[12px] cursor-grab active:cursor-grabbing hover:border-[#137CBD] flex items-center justify-between">
                                <div className="flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-[#137CBD]" /> <span className="font-bold">CSV Upload</span></div>
                            </div>
                            <div draggable onDragStart={(e) => handleDragStart(e, { id: 'new-api', name: 'API Polling' }, "apiPolling")} className="p-2 border border-[#CED9E0] rounded bg-white text-[12px] cursor-grab active:cursor-grabbing hover:border-[#137CBD] flex items-center justify-between">
                                <div className="flex items-center gap-2"><Activity className="w-3.5 h-3.5 text-[#137CBD]" /> <span className="font-bold">API Polling</span></div>
                            </div>
                            <div draggable onDragStart={(e) => handleDragStart(e, { id: 'new-webhook', name: 'Webhook Event' }, "webhookSource")} className="p-2 border border-[#CED9E0] rounded bg-white text-[12px] cursor-grab active:cursor-grabbing hover:border-[#137CBD] flex items-center justify-between">
                                <div className="flex items-center gap-2"><ArrowRightLeft className="w-3.5 h-3.5 text-[#137CBD]" /> <span className="font-bold">Webhook Event</span></div>
                            </div>
                            <div draggable onDragStart={(e) => handleDragStart(e, { id: 'new-transform', name: 'Data Transform' }, "dataTransform")} className="p-2 border border-[#CED9E0] rounded bg-white text-[12px] cursor-grab active:cursor-grabbing hover:border-[#137CBD] flex items-center justify-between">
                                <div className="flex items-center gap-2"><Layers className="w-3.5 h-3.5 text-[#137CBD]" /> <span className="font-bold">Data Transform</span></div>
                            </div>
                        </div>

                        <div className="p-3 border-b border-[#CED9E0] bg-[#F5F8FA] text-[11px] font-bold text-[#5C7080] uppercase tracking-wider">
                            Data Sources
                        </div>
                        <div className="p-3 space-y-2 overflow-auto max-h-[30%] border-b border-[#CED9E0]">
                            {loading ? <Loader2 className="w-5 h-5 mx-auto animate-spin text-[#5C7080]" /> : null}
                            {sources.map(s => (
                                <div key={s.id} draggable onDragStart={(e) => handleDragStart(e, s, "dataSource")} className="p-2 border border-[#CED9E0] rounded bg-white text-[12px] cursor-grab active:cursor-grabbing hover:border-[#137CBD] flex items-center justify-between">
                                    <div className="flex items-center gap-2"><Server className="w-3.5 h-3.5 text-[#137CBD]" /> <span className="font-bold">{s.name}</span></div>
                                </div>
                            ))}
                        </div>
                        <div className="p-3 border-b border-[#CED9E0] bg-[#F5F8FA] text-[11px] font-bold text-[#5C7080] uppercase tracking-wider mt-auto">
                            Ontology Targets
                        </div>
                        <div className="p-3 space-y-2 overflow-auto flex-1">
                            {entityTypes.map(et => (
                                <div key={et.id} draggable onDragStart={(e) => handleDragStart(e, et, "target")} className="p-2 border border-[#CED9E0] rounded bg-white text-[12px] cursor-grab active:cursor-grabbing hover:border-[#0F9960] flex items-center justify-between">
                                    <div className="flex items-center gap-2"><Database className="w-3.5 h-3.5 text-[#0F9960]" /> <span className="font-bold">{et.name}</span></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* React Flow Canvas */}
                    <div className="flex-1 relative react-flow-wrapper" onDrop={onDrop} onDragOver={onDragOver}>
                        <ReactFlow
                            nodes={nodes} edges={edges.map(e => ({ ...e, style: { strokeWidth: 1.5, stroke: '#CED9E0' }, type: 'mappingEdge' }))}
                            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onEdgeClick={onEdgeClick} onPaneClick={() => setSelectedEdgeId(null)}
                            nodeTypes={{ dataSource: DataSourceNode, entityTarget: EntityTargetNode, csvUpload: CsvUploadNode, apiPolling: ApiPollingNode, webhookSource: WebhookSourceNode, dataTransform: DataTransformNode }} edgeTypes={{ mappingEdge: MappingEdge }}
                            fitView minZoom={0.2} maxZoom={2} proOptions={{ hideAttribution: true }}>
                            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#CED9E0" />
                            <Controls showInteractive={false} className="!bg-white !border-[#CED9E0] !shadow-sm" />
                        </ReactFlow>
                    </div>

                    {/* Right Sidebar (Field Mapping) */}
                    {selectedEdgeId && (
                        <div className="w-[350px] bg-white border-l border-[#CED9E0] flex flex-col shrink-0">
                            <div className="p-4 border-b border-[#CED9E0] flex justify-between items-center bg-[#F5F8FA]">
                                <div className="font-bold text-[14px]">Field Mapping</div>
                                <button className="text-[#5C7080] hover:text-[#182026]" onClick={() => setSelectedEdgeId(null)}><X className="w-4 h-4" /></button>
                            </div>
                            <div className="flex-1 overflow-auto p-4 space-y-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-[#5C7080] mb-1 uppercase tracking-wider">Primary Key (Logical ID)</label>
                                    <div className="text-[11px] text-[#5C7080] mb-2 leading-tight">Specify the JSON property from the raw data that uniquely identifies each row.</div>
                                    <input type="text" value={logicalIdField} onChange={e => setLogicalIdField(e.target.value)} placeholder="e.g. id, flight_id" className="w-full text-[12px] font-mono p-2 border border-[#CED9E0] rounded focus:outline-none focus:border-[#137CBD] focus:ring-1 focus:ring-[#137CBD]" />
                                </div>

                                <div className="pt-2">
                                    <label className="block text-[11px] font-bold text-[#5C7080] mb-1 uppercase tracking-wider">Property Mappings</label>
                                    <div className="text-[11px] text-[#5C7080] mb-3 leading-tight">Map raw JSON paths (left) to the physical semantic Ontology properties (right).</div>

                                    <div className="space-y-3">
                                        {targetAttributes.map((attr: any) => (
                                            <div key={attr.id} className="bg-[#F5F8FA] border border-[#CED9E0] rounded p-2">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-bold text-[12px] text-[#182026] flex items-center gap-1.5">{attr.required ? <Key className="w-3 h-3 text-[#137CBD]" /> : <Hash className="w-3 h-3 text-[#5C7080]" />} {attr.name}</span>
                                                    <span className="text-[9px] bg-white border border-[#CED9E0] px-1 rounded text-[#5C7080]">{attr.dataType}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1">
                                                        <input type="text" placeholder="json_field_name" value={fieldMapping[attr.name] || ""} onChange={e => {
                                                            const newMapping = { ...fieldMapping };
                                                            if (e.target.value) newMapping[attr.name] = e.target.value;
                                                            else delete newMapping[attr.name];
                                                            // Flip the dictionary because DB expects { "external_field": "ontology_property" }
                                                            const dbMapping: Record<string, string> = {};
                                                            for (const [oProp, eProp] of Object.entries(newMapping)) { dbMapping[eProp] = oProp; }
                                                            setFieldMapping(dbMapping);
                                                        }} className="w-full text-[12px] font-mono p-1.5 border border-[#CED9E0] rounded focus:outline-none focus:border-[#137CBD]" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {targetAttributes.length === 0 && (
                                        <div className="p-4 border border-dashed border-[#CED9E0] rounded text-center text-[11px] text-[#5C7080]">
                                            No attributes defined on target object.
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="p-4 border-t border-[#CED9E0] bg-[#F5F8FA]">
                                <button onClick={handleSavePipeline} className="w-full h-8 bg-[#137CBD] hover:bg-[#0E6694] text-white font-bold text-[12px] rounded shadow-sm transition-colors">
                                    Save Mapping
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Right Sidebar (Runs Panel) */}
                    {runPanelOpen && !selectedEdgeId && (
                        <div className="w-[400px] bg-white border-l border-[#CED9E0] flex flex-col shrink-0">
                            <div className="p-4 border-b border-[#CED9E0] flex justify-between items-center bg-[#F5F8FA]">
                                <div className="font-bold text-[14px]">Run History</div>
                                <button className="text-[#5C7080] hover:text-[#182026]" onClick={() => setRunPanelOpen(false)}><X className="w-4 h-4" /></button>
                            </div>
                            <div className="flex flex-col flex-1 min-h-0">
                                <div className="max-h-[30%] overflow-y-auto border-b border-[#CED9E0] p-2 space-y-1 bg-[#F5F8FA]">
                                    {runs.length === 0 ? <div className="p-4 text-center text-[#5C7080] text-[11px]">No runs yet.</div> : null}
                                    {runs.map(r => (
                                        <div key={r.id} onClick={() => {
                                            apiFetch(`/api/pipelines/${currentPipelineId}/runs/${r.id}`).then(setSelectedRun).catch(() => { });
                                        }} className={`flex items-center justify-between p-2 rounded cursor-pointer text-[12px] border ${selectedRun?.id === r.id ? "bg-white border-[#137CBD] shadow-sm" : "border-transparent hover:bg-[#EBF1F5]"}`}>
                                            <div className="flex items-center gap-2">
                                                {r.status === "running" ? <RefreshCw className="w-3.5 h-3.5 text-[#137CBD] animate-spin" /> : r.status === "success" ? <CheckCircle2 className="w-3.5 h-3.5 text-[#0F9960]" /> : <XCircle className="w-3.5 h-3.5 text-[#DB3737]" />}
                                                <span className="font-bold text-[#182026]">Run {r.id.slice(0, 5)}</span>
                                            </div>
                                            <span className="text-[#5C7080] font-mono text-[10px]">{new Date(r.startedAt).toLocaleTimeString()}</span>
                                        </div>
                                    ))}
                                </div>
                                {selectedRun && (
                                    <div className="flex-1 overflow-auto bg-[#182026] text-[#E1E8ED] flex flex-col">
                                        <div className="p-3 border-b border-[#293742] flex justify-between items-center bg-[#10161A]">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A9BA8]">Run {selectedRun.id.slice(0, 5)} Detail</span>
                                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${selectedRun.status === "running" ? "bg-[#137CBD]/20 text-[#48AFF0]" : selectedRun.status === "success" ? "bg-[#0F9960]/20 text-[#3DCC91]" : "bg-[#DB3737]/20 text-[#FF7373]"}`}>{selectedRun.status} ({selectedRun.duration ?? 0}ms)</span>
                                        </div>
                                        <div className="p-3 space-y-3">
                                            {selectedRun.steps && Array.isArray(selectedRun.steps) && selectedRun.steps.map((s: any, i: number) => (
                                                <div key={i} className="flex flex-col gap-1 border border-[#293742] rounded p-2 bg-[#1C2127]">
                                                    <div className="flex justify-between items-center text-[12px]">
                                                        <span className="font-bold flex items-center gap-1.5">{s.status === "success" ? <Check className="w-3 h-3 text-[#3DCC91]" /> : s.status === "failed" ? <X className="w-3 h-3 text-[#FF7373]" /> : <RefreshCw className="w-3 h-3 text-[#48AFF0] animate-spin" />} {s.name}</span>
                                                        <span className="text-[10px] text-[#A7B6C2] font-mono">{s.durationMs}ms</span>
                                                    </div>
                                                    <div className="text-[10px] text-[#A7B6C2] flex gap-3">
                                                        <span>In: <span className="text-[#E1E8ED] font-mono">{s.recordsIn}</span></span>
                                                        <span>Out: <span className="text-[#E1E8ED] font-mono">{s.recordsOut}</span></span>
                                                    </div>
                                                    {s.error && <div className="text-[#FF7373] text-[10px] font-mono mt-1 break-all bg-[#DB3737]/10 p-1 rounded border border-[#DB3737]/20">{s.error}</div>}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-3 bg-[#10161A] border-t border-[#293742] flex-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A9BA8] mb-2 block">Logs</span>
                                            <div className="font-mono text-[10px] text-[#A7B6C2] space-y-1 break-all">
                                                {selectedRun.logs && Array.isArray(selectedRun.logs) ? selectedRun.logs.map((log: string, i: number) => (
                                                    <div key={i}>{log}</div>
                                                )) : "No logs."}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
