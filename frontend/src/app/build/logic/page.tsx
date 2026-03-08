"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import ReactFlow, {
    Background, Controls, MiniMap, Node, Edge,
    useNodesState, useEdgesState, addEdge, Connection,
    Handle, Position, BackgroundVariant, NodeProps, EdgeProps,
    getBezierPath, MarkerType
} from "reactflow";
import "reactflow/dist/style.css";
import {
    Brain, Search, Zap, GitBranch, Play, Save, Plus, Trash2, X, ChevronDown,
    ChevronRight, Loader2, Check, AlertCircle, RefreshCw, CheckCircle2, XCircle,
    Sparkles, Database, Code2, ArrowRight, Settings2, Terminal, Activity, Cpu
} from "lucide-react";
import { useWebSocket } from "@/hooks/useWebSocket";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
async function apiFetch(path: string, opts?: RequestInit) {
    const r = await fetch(`${API}${path}`, { headers: { "Content-Type": "application/json" }, ...opts });
    if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error ?? r.statusText); }
    return r.json();
}

// ── Node Type Colours & Icons ─────────────────────────────────────────────────
const NODE_TYPES_CONFIG: Record<string, { label: string; icon: any; color: string; darkColor: string; description: string }> = {
    llmPrompt: { label: "LLM Prompt", icon: Brain, color: "#7C3AED", darkColor: "#5B21B6", description: "Call an LLM with a templated prompt" },
    ontologyQuery: { label: "Ontology Query", icon: Database, color: "#0369A1", darkColor: "#075985", description: "Fetch live entity data from the Ontology" },
    functionCall: { label: "Function Call", icon: Code2, color: "#0F9960", darkColor: "#065F46", description: "Execute a stored AIP Function" },
    actionTrigger: { label: "Action Trigger", icon: Zap, color: "#B45309", darkColor: "#92400E", description: "Invoke an Ontology Action" },
    condition: { label: "Condition", icon: GitBranch, color: "#BE185D", darkColor: "#9D174D", description: "Branch on a JS expression (true/false)" },
    output: { label: "Output", icon: ArrowRight, color: "#374151", darkColor: "#1F2937", description: "Collect final output, optionally write to Ontology" },
};

// ── Custom Node Renderer ───────────────────────────────────────────────────────
function WorkflowNode({ data, selected, type: nodeType }: NodeProps) {
    const cfg = NODE_TYPES_CONFIG[nodeType] ?? NODE_TYPES_CONFIG["output"];
    const Icon = cfg.icon;
    const statusColor = data._status === "running" ? "#3B82F6" : data._status === "success" ? "#10B981" : data._status === "failed" ? "#EF4444" : null;

    return (
        <div style={{ border: `2px solid ${selected ? "#F59E0B" : statusColor || cfg.color}`, boxShadow: selected ? `0 0 0 3px #F59E0B33` : statusColor ? `0 0 12px ${statusColor}44` : `0 2px 8px #0002` }}
            className="rounded-xl overflow-hidden min-w-[200px] bg-white select-none transition-all duration-200">
            <Handle type="target" position={Position.Left} style={{ background: cfg.color, width: 10, height: 10, left: -5 }} />
            <div style={{ background: `linear-gradient(135deg, ${cfg.color}, ${cfg.darkColor})` }} className="px-3 py-2 flex items-center gap-2">
                <Icon className="w-4 h-4 text-white shrink-0" />
                <span className="font-bold text-white text-[12px] truncate">{data.label || cfg.label}</span>
                {data._status === "running" && <RefreshCw className="w-3.5 h-3.5 text-white/70 animate-spin ml-auto shrink-0" />}
                {data._status === "success" && <Check className="w-3.5 h-3.5 text-green-300 ml-auto shrink-0" />}
                {data._status === "failed" && <X className="w-3.5 h-3.5 text-red-300 ml-auto shrink-0" />}
            </div>
            <div className="px-3 py-1.5 text-[10px] text-gray-500 border-t border-gray-100">{cfg.description}</div>
            {data._output !== undefined && (
                <div className="px-3 py-1 bg-gray-50 border-t border-gray-100 text-[9px] font-mono text-gray-600 truncate">
                    ↳ {typeof data._output === "string" ? data._output.slice(0, 60) : JSON.stringify(data._output).slice(0, 60)}
                </div>
            )}
            <Handle type="source" position={Position.Right} style={{ background: cfg.color, width: 10, height: 10, right: -5 }} />
        </div>
    );
}

const nodeTypes = Object.fromEntries(Object.keys(NODE_TYPES_CONFIG).map((k) => [k, WorkflowNode]));

// ── Inspector panel for each node type ────────────────────────────────────────
function NodeInspector({ node, entityTypes, functions, actions, onChange }: any) {
    if (!node) return (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm gap-3 p-6">
            <Settings2 className="w-10 h-10 opacity-20" />
            <span>Select a node to configure it</span>
        </div>
    );
    const cfg = NODE_TYPES_CONFIG[node.type] ?? NODE_TYPES_CONFIG["output"];
    const Icon = cfg.icon;
    const d = node.data;

    const upd = (key: string, val: any) => onChange({ ...d, [key]: val });

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <div style={{ background: cfg.color }} className="p-1.5 rounded-lg"><Icon className="w-4 h-4 text-white" /></div>
                <div>
                    <div className="font-bold text-sm text-gray-800">{cfg.label}</div>
                    <div className="text-xs text-gray-400">{cfg.description}</div>
                </div>
            </div>

            {/* Label */}
            <Field label="Node Label">
                <input className="w-full text-sm p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-400 focus:border-transparent outline-none"
                    value={d.label || ""} onChange={e => upd("label", e.target.value)} placeholder={cfg.label} />
            </Field>

            {/* LLM Prompt specific */}
            {node.type === "llmPrompt" && (<>
                <Field label="Model">
                    <select className="w-full text-sm p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-400 outline-none"
                        value={d.model || "gpt-4o-mini"} onChange={e => upd("model", e.target.value)}>
                        <option value="gpt-4o-mini">gpt-4o-mini (fast)</option>
                        <option value="gpt-4o">gpt-4o (smart)</option>
                        <option value="gpt-4-turbo">gpt-4-turbo</option>
                    </select>
                </Field>
                <Field label="System Prompt">
                    <textarea rows={3} className="w-full text-sm p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-400 outline-none font-mono resize-none"
                        value={d.systemPrompt || "You are a helpful AI assistant."} onChange={e => upd("systemPrompt", e.target.value)} />
                </Field>
                <Field label="User Prompt" hint="Use {{variable}} to inject upstream outputs">
                    <textarea rows={5} className="w-full text-sm p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-400 outline-none font-mono resize-none"
                        value={d.userPrompt || ""} onChange={e => upd("userPrompt", e.target.value)}
                        placeholder="Summarize the following data:\n{{ontology_output}}" />
                </Field>
                <Field label="Temperature">
                    <input type="range" min="0" max="1" step="0.05" className="w-full accent-violet-600"
                        value={d.temperature ?? 0.7} onChange={e => upd("temperature", e.target.value)} />
                    <span className="text-xs text-gray-400">{d.temperature ?? 0.7}</span>
                </Field>
            </>)}

            {/* Ontology Query specific */}
            {node.type === "ontologyQuery" && (<>
                <Field label="Entity Type">
                    <select className="w-full text-sm p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                        value={d.entityType || ""} onChange={e => upd("entityType", e.target.value)}>
                        <option value="">Select entity type...</option>
                        {entityTypes.map((et: any) => <option key={et.id} value={et.name}>{et.name}</option>)}
                    </select>
                </Field>
                <Field label="Result Limit">
                    <input type="number" min={1} max={200} className="w-full text-sm p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                        value={d.limit || 20} onChange={e => upd("limit", e.target.value)} />
                </Field>
            </>)}

            {/* Function Call specific */}
            {node.type === "functionCall" && (<>
                <Field label="Function">
                    <select className="w-full text-sm p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
                        value={d.functionId || ""} onChange={e => upd("functionId", e.target.value)}>
                        <option value="">Select function...</option>
                        {functions.map((fn: any) => <option key={fn.id} value={fn.id}>{fn.name}</option>)}
                    </select>
                </Field>
                <Field label="Input Mapping (JSON)" hint='{"paramName": "{{variable}}"}'>
                    <textarea rows={4} className="w-full text-sm p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-400 outline-none font-mono resize-none"
                        value={JSON.stringify(d.inputMapping || {}, null, 2)} onChange={e => { try { upd("inputMapping", JSON.parse(e.target.value)); } catch { } }} />
                </Field>
            </>)}

            {/* Action Trigger specific */}
            {node.type === "actionTrigger" && (<>
                <Field label="Action">
                    <select className="w-full text-sm p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none"
                        value={d.actionId || ""} onChange={e => upd("actionId", e.target.value)}>
                        <option value="">Select action...</option>
                        {actions.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                </Field>
                <Field label="Param Mapping (JSON)" hint='{"paramName": "{{variable}}"}'>
                    <textarea rows={4} className="w-full text-sm p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none font-mono resize-none"
                        value={JSON.stringify(d.paramMapping || {}, null, 2)} onChange={e => { try { upd("paramMapping", JSON.parse(e.target.value)); } catch { } }} />
                </Field>
            </>)}

            {/* Condition specific */}
            {node.type === "condition" && (
                <Field label="JS Expression" hint="Access context via variable name. e.g. ontology_output.length > 0">
                    <textarea rows={4} className="w-full text-sm p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-400 outline-none font-mono resize-none"
                        value={d.expression || "true"} onChange={e => upd("expression", e.target.value)} />
                </Field>
            )}

            {/* Output specific */}
            {node.type === "output" && (<>
                <Field label="Value Template" hint="Use {{variable}} — e.g. {{llm_output}} or {{ontology_output}}">
                    <textarea rows={4} className="w-full text-sm p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 outline-none font-mono resize-none"
                        value={d.valueTemplate || "{{llm_output}}"} onChange={e => upd("valueTemplate", e.target.value)} />
                </Field>
                <div className="flex items-center gap-2">
                    <input type="checkbox" id="wto" checked={!!d.writeToOntology} onChange={e => upd("writeToOntology", e.target.checked)} className="accent-gray-700" />
                    <label htmlFor="wto" className="text-sm text-gray-600">Write back to Ontology</label>
                </div>
                {d.writeToOntology && <>
                    <Field label="Target Entity Type">
                        <select className="w-full text-sm p-2 border border-gray-200 rounded-lg outline-none"
                            value={d.entityType || ""} onChange={e => upd("entityType", e.target.value)}>
                            <option value="">Select...</option>
                            {entityTypes.map((et: any) => <option key={et.id} value={et.name}>{et.name}</option>)}
                        </select>
                    </Field>
                    <Field label="Logical ID Template">
                        <input className="w-full text-sm p-2 border border-gray-200 rounded-lg outline-none font-mono"
                            value={d.logicalId || ""} onChange={e => upd("logicalId", e.target.value)} placeholder="e.g. summary-{{input_id}}" />
                    </Field>
                </>}
            </>)}
        </div>
    );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: any }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">{label}</label>
            {hint && <div className="text-[10px] text-gray-400 mb-1 font-mono">{hint}</div>}
            {children}
        </div>
    );
}

// ── Run history panel ─────────────────────────────────────────────────────────
function RunPanel({ workflowId, runs, selectedRun, setSelectedRun, fetchRuns }: any) {
    return (
        <div className="flex flex-col h-full">
            <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Run History</span>
                <button onClick={fetchRuns} className="text-gray-400 hover:text-gray-600"><RefreshCw className="w-3.5 h-3.5" /></button>
            </div>
            <div className="max-h-40 overflow-y-auto border-b border-gray-100">
                {runs.length === 0 && <div className="p-4 text-center text-xs text-gray-400">No runs yet. Click ▶ Run to start.</div>}
                {runs.map((r: any) => (
                    <button key={r.id} onClick={() => apiFetch(`/api/workflows/${workflowId}/runs/${r.id}`).then(setSelectedRun).catch(() => { })}
                        className={`w-full flex items-center justify-between p-2.5 text-xs border-b border-gray-50 hover:bg-gray-50 transition-colors ${selectedRun?.id === r.id ? "bg-violet-50 border-violet-200" : ""}`}>
                        <div className="flex items-center gap-1.5">
                            {r.status === "running" ? <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                                : r.status === "success" ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                    : <XCircle className="w-3.5 h-3.5 text-red-500" />}
                            <span className="font-mono font-bold text-gray-700">Run {r.id.slice(0, 7)}</span>
                        </div>
                        <span className="text-gray-400">{new Date(r.startedAt).toLocaleTimeString()} · {r.duration ?? "..."}ms</span>
                    </button>
                ))}
            </div>
            {selectedRun && (
                <div className="flex-1 overflow-y-auto bg-slate-900 text-green-300 flex flex-col">
                    <div className="p-2 border-b border-slate-700 flex justify-between items-center bg-slate-800">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Run Detail</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${selectedRun.status === "running" ? "bg-blue-900 text-blue-300"
                            : selectedRun.status === "success" ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}>
                            {selectedRun.status} {selectedRun.duration ? `· ${selectedRun.duration}ms` : ""}
                        </span>
                    </div>

                    {/* Step cards */}
                    <div className="p-2 space-y-1.5">
                        {Array.isArray(selectedRun.steps) && selectedRun.steps.map((s: any, i: number) => {
                            const sCfg = NODE_TYPES_CONFIG[s.type] ?? NODE_TYPES_CONFIG["output"];
                            return (
                                <div key={i} className="border border-slate-700 rounded bg-slate-800 p-2 text-[10px]">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="flex items-center gap-1 font-bold text-slate-200">
                                            {s.status === "success" ? <Check className="w-3 h-3 text-green-400" />
                                                : s.status === "failed" ? <X className="w-3 h-3 text-red-400" />
                                                    : <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" />}
                                            {s.name}
                                        </span>
                                        <span className="font-mono text-slate-400">{s.durationMs}ms</span>
                                    </div>
                                    {s.output !== null && s.output !== undefined && (
                                        <div className="font-mono text-[9px] text-green-300 bg-slate-900 rounded p-1 mt-1 max-h-20 overflow-auto break-all">
                                            {typeof s.output === "string" ? s.output : JSON.stringify(s.output, null, 2)}
                                        </div>
                                    )}
                                    {s.error && <div className="mt-1 text-red-400 font-mono text-[9px] break-all">{s.error}</div>}
                                </div>
                            );
                        })}
                    </div>

                    {/* Final output highlight */}
                    {selectedRun.summary?.finalOutput && (
                        <div className="p-2 border-t border-slate-700 bg-slate-800">
                            <div className="text-[9px] uppercase tracking-wider text-slate-400 mb-1">Final Output</div>
                            <div className="font-mono text-[10px] text-yellow-300 bg-slate-900 rounded p-2 break-all max-h-32 overflow-auto">
                                {String(selectedRun.summary.finalOutput)}
                            </div>
                        </div>
                    )}

                    {/* Logs */}
                    <div className="p-2 border-t border-slate-700 flex-1">
                        <div className="text-[9px] uppercase tracking-wider text-slate-400 mb-1">Logs</div>
                        <div className="font-mono text-[9px] text-slate-400 space-y-0.5 break-all">
                            {Array.isArray(selectedRun.logs) ? selectedRun.logs.map((l: string, i: number) => (
                                <div key={i}>{l}</div>
                            )) : "No logs"}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AIPLogicPage() {
    const [workflows, setWorkflows] = useState<any[]>([]);
    const [activeWfId, setActiveWfId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [running, setRunning] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" | "info" } | null>(null);

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [rightTab, setRightTab] = useState<"inspect" | "runs">("inspect");

    const [entityTypes, setEntityTypes] = useState<any[]>([]);
    const [functions, setFunctions] = useState<any[]>([]);
    const [actions, setActions] = useState<any[]>([]);
    const [runs, setRuns] = useState<any[]>([]);
    const [selectedRun, setSelectedRun] = useState<any>(null);

    const showToast = (msg: string, type: "ok" | "err" | "info" = "info") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    // WebSocket: live progress
    useWebSocket(activeWfId ? [`workflow:${activeWfId}`] : [], {
        onEvent: (ev) => {
            if (ev.type === "workflow.progress" || ev.type === "workflow.complete") {
                if (ev.runId && activeWfId) {
                    apiFetch(`/api/workflows/${activeWfId}/runs/${ev.runId}`).then((run) => {
                        setSelectedRun(run);
                        // Update node visual state
                        if (Array.isArray(run.steps)) {
                            setNodes(nds => nds.map(nd => {
                                const s = run.steps.find((st: any) => st.stepId === nd.id);
                                if (s) return { ...nd, data: { ...nd.data, _status: s.status, _output: s.output } };
                                return nd;
                            }));
                        }
                    }).catch(() => { });
                    fetchRuns(activeWfId);
                }
            }
        }
    });

    // Load data
    useEffect(() => {
        Promise.all([
            apiFetch("/api/workflows").catch(() => []),
            apiFetch("/api/ontology/entity-types").catch(() => []),
            apiFetch("/api/functions").catch(() => []),
            apiFetch("/api/actions").catch(() => []),
        ]).then(([wfs, ets, fns, acts]) => {
            setWorkflows(wfs);
            setEntityTypes(ets);
            setFunctions(fns);
            setActions(acts);
            if (wfs.length > 0) loadWorkflow(wfs[0].id);
        });
    }, []);

    const loadWorkflow = async (id: string) => {
        const wf = await apiFetch(`/api/workflows/${id}`);
        setActiveWfId(wf.id);
        setNodes(Array.isArray(wf.nodes) ? wf.nodes : []);
        setEdges(Array.isArray(wf.edges) ? wf.edges : []);
        fetchRuns(wf.id);
    };

    const fetchRuns = async (wfId: string) => {
        const r = await apiFetch(`/api/workflows/${wfId}/runs`).catch(() => []);
        setRuns(r);
    };

    const handleNewWorkflow = async () => {
        const name = prompt("Workflow name:");
        if (!name) return;
        const wf = await apiFetch("/api/workflows", { method: "POST", body: JSON.stringify({ name, description: "" }) });
        setWorkflows(prev => [wf, ...prev]);
        setActiveWfId(wf.id);
        setNodes([]);
        setEdges([]);
        setRuns([]);
        setSelectedRun(null);
    };

    const handleSave = async () => {
        if (!activeWfId) return;
        setSaving(true);
        try {
            await apiFetch(`/api/workflows/${activeWfId}`, { method: "PUT", body: JSON.stringify({ nodes, edges }) });
            showToast("Workflow saved", "ok");
        } catch (e: any) {
            showToast(e.message, "err");
        } finally { setSaving(false); }
    };

    const handleRun = async () => {
        if (!activeWfId) return;
        await handleSave();
        setRunning(true);
        setRightTab("runs");
        try {
            // Clear node status
            setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, _status: undefined, _output: undefined } })));
            const { runId } = await apiFetch(`/api/workflows/${activeWfId}/run`, { method: "POST" });
            showToast("Workflow running...", "info");
            fetchRuns(activeWfId);
            // Poll initially for immediate status
            const run = await apiFetch(`/api/workflows/${activeWfId}/runs/${runId}`);
            setSelectedRun(run);
        } catch (e: any) {
            showToast(e.message, "err");
        } finally {
            setRunning(false);
        }
    };

    const onConnect = useCallback((params: Connection) =>
        setEdges(eds => addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed }, style: { strokeWidth: 1.5, stroke: "#94A3B8" } }, eds)), [setEdges]);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const nodeType = e.dataTransfer.getData("application/aip-node-type");
        if (!nodeType) return;
        const bounds = document.querySelector(".react-flow")?.getBoundingClientRect();
        if (!bounds) return;
        const cfg = NODE_TYPES_CONFIG[nodeType];
        const id = `${nodeType}-${Date.now()}`;
        const newNode: Node = {
            id, type: nodeType,
            position: { x: e.clientX - bounds.left - 100, y: e.clientY - bounds.top - 30 },
            data: { label: cfg.label }
        };
        setNodes(nds => nds.concat(newNode));
        setSelectedNodeId(id);
    }, [setNodes]);

    const onDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };

    const selectedNode = nodes.find(n => n.id === selectedNodeId) ?? null;

    const handleNodeDataChange = (newData: any) => {
        if (!selectedNodeId) return;
        setNodes(nds => nds.map(n => n.id === selectedNodeId ? { ...n, data: newData } : n));
    };

    const handleDeleteNode = () => {
        if (!selectedNodeId) return;
        setNodes(nds => nds.filter(n => n.id !== selectedNodeId));
        setEdges(eds => eds.filter(e => e.source !== selectedNodeId && e.target !== selectedNodeId));
        setSelectedNodeId(null);
    };

    return (
        <div className="flex h-[calc(100vh-48px)] bg-gray-50 font-sans overflow-hidden">

            {/* ── LEFT: Node Palette + Workflow Switcher ───────────────────── */}
            <div className="w-56 border-r border-gray-200 bg-white flex flex-col shadow-sm z-10">
                {/* Workflow Switcher */}
                <div className="p-3 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Workflows</span>
                        <button onClick={handleNewWorkflow} className="p-1 rounded bg-violet-600 hover:bg-violet-700 text-white shadow-sm"><Plus className="w-3 h-3" /></button>
                    </div>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                        {workflows.map(wf => (
                            <button key={wf.id} onClick={() => loadWorkflow(wf.id)}
                                className={`w-full text-left text-xs px-2 py-1.5 rounded-lg truncate font-medium transition-colors ${activeWfId === wf.id ? "bg-violet-100 text-violet-700" : "text-gray-600 hover:bg-gray-100"}`}>
                                {wf.name}
                            </button>
                        ))}
                        {workflows.length === 0 && <div className="text-[10px] text-gray-400 text-center py-4">No workflows. Create one!</div>}
                    </div>
                </div>

                {/* Node Type Palette */}
                <div className="p-3 flex-1 overflow-y-auto">
                    <div className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">Node Types</div>
                    <div className="space-y-1.5">
                        {Object.entries(NODE_TYPES_CONFIG).map(([type, cfg]) => {
                            const Icon = cfg.icon;
                            return (
                                <div key={type} draggable
                                    onDragStart={e => e.dataTransfer.setData("application/aip-node-type", type)}
                                    style={{ borderLeft: `3px solid ${cfg.color}` }}
                                    className="px-2 py-2 rounded-r-lg bg-gray-50 hover:bg-white hover:shadow-sm cursor-grab active:cursor-grabbing transition-all border border-l-0 border-gray-100 select-none">
                                    <div className="flex items-center gap-2">
                                        <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: cfg.color }} />
                                        <span className="text-xs font-semibold text-gray-700">{cfg.label}</span>
                                    </div>
                                    <div className="text-[9px] text-gray-400 mt-0.5 leading-tight">{cfg.description}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── CENTER: ReactFlow Canvas ─────────────────────────────────── */}
            <div className="flex-1 flex flex-col relative">
                {/* Toolbar */}
                <div className="h-11 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm z-10">
                    <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-violet-600" />
                        <span className="font-bold text-sm text-gray-800">{workflows.find(w => w.id === activeWfId)?.name ?? "AIP Logic"}</span>
                        <span className="text-xs text-gray-400 font-mono ml-1">{nodes.length} nodes · {edges.length} edges</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedNodeId && (
                            <button onClick={handleDeleteNode} className="h-7 px-2.5 text-xs font-semibold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-1">
                                <Trash2 className="w-3.5 h-3.5" /> Delete Node
                            </button>
                        )}
                        {saving ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" /> : null}
                        <button onClick={handleSave} disabled={!activeWfId || saving}
                            className="h-7 px-3 text-xs font-bold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 flex items-center gap-1.5 disabled:opacity-40">
                            <Save className="w-3.5 h-3.5" /> Save
                        </button>
                        <button onClick={handleRun} disabled={!activeWfId || running}
                            className="h-7 px-3 text-xs font-bold rounded-lg bg-violet-600 hover:bg-violet-700 text-white shadow-sm flex items-center gap-1.5 disabled:opacity-40 transition-all">
                            {running ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                            {running ? "Running..." : "▶ Run Workflow"}
                        </button>
                    </div>
                </div>

                {/* Toast */}
                {toast && (
                    <div className={`absolute top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2 text-white ${toast.type === "err" ? "bg-red-500" : toast.type === "ok" ? "bg-green-500" : "bg-violet-500"}`}>
                        {toast.type === "ok" ? <Check className="w-3.5 h-3.5" /> : toast.type === "err" ? <AlertCircle className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                        {toast.msg}
                    </div>
                )}

                {/* Empty state */}
                {!activeWfId && (
                    <div className="flex-1 flex items-center justify-center text-center text-gray-400 flex-col gap-3">
                        <Cpu className="w-14 h-14 opacity-10" />
                        <div className="text-lg font-bold opacity-30">No Workflow Selected</div>
                        <div className="text-xs opacity-30">Create a new workflow from the left panel to get started.</div>
                    </div>
                )}

                {activeWfId && (
                    <div className="flex-1" onDrop={onDrop} onDragOver={onDragOver}>
                        <ReactFlow
                            nodes={nodes} edges={edges}
                            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            onNodeClick={(_, node) => { setSelectedNodeId(node.id); setRightTab("inspect"); }}
                            onPaneClick={() => setSelectedNodeId(null)}
                            nodeTypes={nodeTypes}
                            fitView minZoom={0.2} maxZoom={2}
                            proOptions={{ hideAttribution: true }}>
                            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#E2E8F0" />
                            <Controls />
                            <MiniMap nodeColor={n => NODE_TYPES_CONFIG[n.type!]?.color ?? "#94A3B8"} className="!bg-white !border-gray-200 !rounded-xl" />
                        </ReactFlow>
                    </div>
                )}
            </div>

            {/* ── RIGHT: Inspector / Run Panel ─────────────────────────────── */}
            <div className="w-72 border-l border-gray-200 bg-white flex flex-col shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.04)] z-10">
                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                    {[["inspect", "Inspector", Settings2], ["runs", "Runs", Activity]].map(([tab, label, Icon]: any) => (
                        <button key={tab} onClick={() => setRightTab(tab as any)}
                            className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${rightTab === tab ? "text-violet-600 border-b-2 border-violet-600 -mb-px" : "text-gray-400 hover:text-gray-600"}`}>
                            <Icon className="w-3.5 h-3.5" />{label}
                        </button>
                    ))}
                </div>

                {rightTab === "inspect" ? (
                    <NodeInspector node={selectedNode} entityTypes={entityTypes} functions={functions} actions={actions} onChange={handleNodeDataChange} />
                ) : (
                    <RunPanel workflowId={activeWfId} runs={runs} selectedRun={selectedRun} setSelectedRun={setSelectedRun} fetchRuns={() => fetchRuns(activeWfId!)} />
                )}
            </div>
        </div>
    );
}
