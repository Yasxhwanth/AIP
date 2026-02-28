"use client";

import { useState, useRef } from "react";
import { useWorkspaceStore } from "@/store/workspace";
import {
    Database, UploadCloud, FileJson, FileSpreadsheet, ArrowRight,
    CheckCircle2, Settings2, GitMerge, Wand2, Workflow, Plus,
    Activity, Zap, Globe, Server, RefreshCw, AlertTriangle,
    ChevronRight, Clock, Network, X, Loader2
} from "lucide-react";
import Papa from 'papaparse';
import { PipelineEditor } from "@/components/PipelineEditor";
import { ApiClient } from "@/lib/apiClient";

type IngestStep = 'UPLOAD' | 'MAP' | 'EXECUTE';
type ViewMode = 'SOURCES' | 'WIZARD' | 'PIPELINES';

// ── Hardcoded Connected Sources ───────────────────────────────────────────────
const CONNECTED_SOURCES = [
    {
        id: "src-1",
        name: "Fleet SCADA System",
        type: "PostgreSQL",
        icon: Server,
        color: "text-cyan-400",
        dot: "bg-cyan-400",
        status: "live" as const,
        records: "4,521",
        lastSync: "2 min ago",
        entities: ["FleetAsset", "WorkOrder", "MaintenanceLog"],
        health: 98,
    },
    {
        id: "src-2",
        name: "Supplier Portal API",
        type: "REST API",
        icon: Globe,
        color: "text-violet-400",
        dot: "bg-violet-400",
        status: "live" as const,
        records: "1,204",
        lastSync: "5 min ago",
        entities: ["Supplier", "PurchaseOrder", "Contract"],
        health: 94,
    },
    {
        id: "src-3",
        name: "Employee HR Dataset",
        type: "CSV (Static)",
        icon: FileSpreadsheet,
        color: "text-emerald-400",
        dot: "bg-emerald-400",
        status: "synced" as const,
        records: "892",
        lastSync: "3 hr ago",
        entities: ["Employee", "Department"],
        health: 100,
    },
    {
        id: "src-4",
        name: "Customer CRM Export",
        type: "JSON File",
        icon: FileJson,
        color: "text-amber-400",
        dot: "bg-amber-400",
        status: "warning" as const,
        records: "31,590",
        lastSync: "8 hr ago",
        entities: ["Customer", "SalesOrder", "Interaction"],
        health: 71,
    },
];

// ── Pipeline Stages ───────────────────────────────────────────────────────────
const PIPELINE_STAGES = ["Extract", "Transform", "Validate", "Ontology Map", "Load"];

function SourceCard({ source }: { source: typeof CONNECTED_SOURCES[0] }) {
    const Icon = source.icon;
    const statusColors = { live: "bg-emerald-400", synced: "bg-cyan-400", warning: "bg-amber-400" };
    const statusLabels = { live: "Live", synced: "Synced", warning: "Warning" };
    return (
        <div className="bg-[#0E1623] border border-white/8 hover:border-white/20 rounded-xl p-4 transition-all group cursor-pointer">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Icon className={`w-4 h-4 ${source.color}`} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">{source.name}</h3>
                        <p className="text-[10px] text-slate-500 font-mono">{source.type}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${statusColors[source.status]} ${source.status === 'live' ? 'animate-pulse' : ''}`} />
                    <span className={`text-[10px] font-bold ${source.status === 'warning' ? 'text-amber-400' : 'text-slate-400'}`}>{statusLabels[source.status]}</span>
                </div>
            </div>

            {/* Health bar */}
            <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-600">Pipeline Health</span>
                    <span className={`text-[10px] font-bold ${source.health > 90 ? 'text-emerald-400' : source.health > 75 ? 'text-amber-400' : 'text-red-400'}`}>{source.health}%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${source.health > 90 ? 'bg-emerald-400' : source.health > 75 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${source.health}%` }} />
                </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-[10px] mb-3">
                <span className="text-slate-500"><span className="text-white font-bold">{source.records}</span> records</span>
                <span className="flex items-center gap-1 text-slate-600"><Clock className="w-3 h-3" />Synced {source.lastSync}</span>
            </div>

            {/* Entity tags */}
            <div className="flex flex-wrap gap-1">
                {source.entities.map(e => (
                    <span key={e} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/5 border border-white/8 text-slate-500">{e}</span>
                ))}
            </div>
        </div>
    );
}

function PipelineSimulator({ sourceName }: { sourceName: string }) {
    const [active, setActive] = useState<number>(-1);
    const [done, setDone] = useState<number[]>([]);
    const [running, setRunning] = useState(false);

    const runPipeline = () => {
        setRunning(true);
        setDone([]);
        setActive(0);
        let i = 0;
        const interval = setInterval(() => {
            setDone(p => [...p, i]);
            i++;
            if (i < PIPELINE_STAGES.length) {
                setActive(i);
            } else {
                setActive(-1);
                setRunning(false);
                clearInterval(interval);
            }
        }, 700);
    };

    return (
        <div className="bg-[#0E1623] border border-white/8 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h4 className="text-xs font-bold text-white">{sourceName}</h4>
                    <p className="text-[10px] text-slate-500">Data pipeline</p>
                </div>
                <button
                    onClick={runPipeline}
                    disabled={running}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-400 text-xs font-bold rounded-lg disabled:opacity-50 transition-all"
                >
                    {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    {running ? 'Running...' : 'Run Pipeline'}
                </button>
            </div>
            <div className="flex items-center gap-1">
                {PIPELINE_STAGES.map((stage, i) => {
                    const isDone = done.includes(i);
                    const isActive = active === i;
                    return (
                        <div key={stage} className="flex items-center gap-1 flex-1">
                            <div className={`flex-1 flex flex-col items-center gap-1.5 py-2 px-1 rounded-lg transition-all ${isActive ? 'bg-cyan-500/10 border border-cyan-500/30' : isDone ? 'bg-emerald-500/8 border border-emerald-500/20' : 'bg-white/3 border border-white/5'}`}>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isActive ? 'bg-cyan-500 text-black' : isDone ? 'bg-emerald-500 text-black' : 'bg-white/10 text-slate-600'}`}>
                                    {isDone ? <CheckCircle2 className="w-3 h-3" /> : isActive ? <Loader2 className="w-3 h-3 animate-spin" /> : <span className="text-[10px] font-bold">{i + 1}</span>}
                                </div>
                                <span className={`text-[9px] font-bold text-center ${isActive ? 'text-cyan-400' : isDone ? 'text-emerald-400' : 'text-slate-600'}`}>{stage}</span>
                            </div>
                            {i < PIPELINE_STAGES.length - 1 && <ArrowRight className={`w-3 h-3 shrink-0 ${isDone ? 'text-emerald-400' : 'text-slate-700'}`} />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function IntegrationsPage() {
    const { activeProjectName } = useWorkspaceStore();
    const [step, setStep] = useState<IngestStep>('UPLOAD');
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [entityName, setEntityName] = useState("New_Entity_Type");
    const [viewMode, setViewMode] = useState<ViewMode>('SOURCES');
    const [inferring, setInferring] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;
        setFile(selected);
        if (selected.name.endsWith('.csv')) {
            Papa.parse(selected, {
                header: true, preview: 5,
                complete: (results) => { setColumns(results.meta.fields || []); setPreviewData(results.data); setStep('MAP'); }
            });
        } else if (selected.name.endsWith('.json')) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const json = JSON.parse(ev.target?.result as string);
                    const arr = Array.isArray(json) ? json : [json];
                    setColumns(Object.keys(arr[0] || {})); setPreviewData(arr.slice(0, 5)); setStep('MAP');
                } catch { alert("Invalid JSON"); }
            };
            reader.readAsText(selected);
        }
    };

    const executePipeline = () => {
        setStep('EXECUTE');
        setTimeout(() => { setStep('UPLOAD'); setFile(null); }, 2500);
    };

    const handleAutoInfer = async () => {
        if (!previewData.length) return;
        setInferring(true);
        try {
            const sample = previewData[0];
            const inferResult = await ApiClient.post<{ attributes: { name: string; dataType: string }[] }>('/api/v1/integration/infer-schema', { sample });
            const suggestResult = await ApiClient.post<{ suggestions: Record<string, string> }>('/api/v1/integration/suggest-mappings', { inferredAttributes: inferResult.attributes, sampleData: previewData, targetEntityType: entityName });
            const newMapping: Record<string, string> = { ...mapping };
            const suggestions = suggestResult.suggestions ?? {};
            for (const col of columns) {
                const key = col.replace(/[^a-zA-Z0-9]/g, '');
                if (suggestions[key]) newMapping[col] = suggestions[key];
                else if (suggestions[col]) newMapping[col] = suggestions[col];
            }
            for (const attr of inferResult.attributes) {
                const origCol = columns.find(c => c.replace(/[^a-zA-Z0-9]/g, '') === attr.name || c === attr.name);
                if (origCol && !newMapping[origCol]) newMapping[origCol] = attr.dataType;
            }
            setMapping(newMapping);
        } catch { } finally { setInferring(false); }
    };

    return (
        <div className="flex flex-col h-full text-white overflow-hidden" style={{ background: "linear-gradient(180deg,#070b14 0%,#050910 100%)" }}>

            {/* Header */}
            <div className="border-b border-white/8 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center">
                        <Database className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-white">Data Integration</h1>
                        <p className="text-[11px] text-slate-500">Connect sources and build your ontology graph</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/8">
                    {(['SOURCES', 'WIZARD', 'PIPELINES'] as ViewMode[]).map(m => (
                        <button key={m} onClick={() => setViewMode(m)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === m ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                            {m}
                        </button>
                    ))}
                </div>
                {viewMode === 'SOURCES' && (
                    <button onClick={() => setViewMode('WIZARD')} className="flex items-center gap-2 px-4 py-2 bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400 text-xs font-bold rounded-xl transition-all">
                        <Plus className="w-4 h-4" /> Add Source
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">

                {/* ── SOURCES VIEW ── */}
                {viewMode === 'SOURCES' && (
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-bold text-white">Connected Data Sources</h2>
                                <p className="text-xs text-slate-500 mt-0.5">{CONNECTED_SOURCES.length} sources · {CONNECTED_SOURCES.filter(s => s.status === 'live').length} live</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                            {CONNECTED_SOURCES.map(s => <SourceCard key={s.id} source={s} />)}
                        </div>

                        {/* Pipeline simulators */}
                        <div>
                            <h2 className="text-sm font-bold text-white mb-3">Active Pipelines</h2>
                            <div className="space-y-3">
                                {CONNECTED_SOURCES.filter(s => s.status !== 'warning').map(s => (
                                    <PipelineSimulator key={s.id} sourceName={s.name} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── WIZARD VIEW ── */}
                {viewMode === 'WIZARD' && (
                    <div className="p-6">
                        <div className="max-w-4xl mx-auto">
                            {/* Step indicator */}
                            <div className="flex items-center gap-3 mb-6">
                                {(['UPLOAD', 'MAP', 'EXECUTE'] as IngestStep[]).map((s, i) => (
                                    <div key={s} className="flex items-center gap-2">
                                        <div className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center transition-all ${step === s ? 'bg-orange-500 text-black' : step === 'EXECUTE' || (step === 'MAP' && i === 0) ? 'bg-emerald-500 text-black' : 'bg-white/8 text-slate-500'}`}>
                                            {i + 1}
                                        </div>
                                        <span className={`text-xs font-semibold ${step === s ? 'text-white' : 'text-slate-600'}`}>{s}</span>
                                        {i < 2 && <ArrowRight className="w-3.5 h-3.5 text-slate-700" />}
                                    </div>
                                ))}
                            </div>

                            {step === 'UPLOAD' && (
                                <div
                                    className="border-2 border-dashed border-white/10 hover:border-orange-500/40 rounded-2xl h-72 flex flex-col items-center justify-center cursor-pointer transition-all group"
                                    style={{ background: "rgba(255,255,255,0.02)" }}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input type="file" className="hidden" ref={fileInputRef} accept=".csv,.json" onChange={handleFileUpload} />
                                    <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <UploadCloud className="w-8 h-8 text-orange-400" />
                                    </div>
                                    <h2 className="text-lg font-bold text-white mb-1">Drop your dataset here</h2>
                                    <p className="text-slate-500 text-sm mb-5">Supports .CSV and .JSON formats</p>
                                    <div className="flex gap-3">
                                        {[{ icon: FileSpreadsheet, label: ".csv", color: "text-emerald-400" }, { icon: FileJson, label: ".json", color: "text-blue-400" }].map(f => (
                                            <div key={f.label} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
                                                <f.icon className={`w-4 h-4 ${f.color}`} />
                                                <span className="text-xs text-slate-400 font-mono">{f.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {step === 'MAP' && (
                                <div className="border border-white/10 rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
                                    <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                                            <div>
                                                <p className="text-sm font-bold text-white">{file?.name}</p>
                                                <p className="text-[10px] text-slate-500">{(file?.size || 0) / 1000}KB · {columns.length} columns detected</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input value={entityName} onChange={e => setEntityName(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-orange-500/50" placeholder="Entity type name" />
                                            <button onClick={executePipeline} className="flex items-center gap-1.5 px-4 py-1.5 bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold rounded-lg transition-all">
                                                Build Ontology <ArrowRight className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex min-h-[300px]">
                                        <div className="w-72 border-r border-white/8 p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-400 uppercase">Column Mapping</span>
                                                <button onClick={handleAutoInfer} disabled={inferring} className="p-1.5 bg-violet-500/10 border border-violet-500/20 rounded-lg text-violet-400 hover:bg-violet-500/20">
                                                    <Wand2 className={`w-3.5 h-3.5 ${inferring ? 'animate-spin' : ''}`} />
                                                </button>
                                            </div>
                                            {columns.map(col => (
                                                <div key={col} className="bg-white/3 rounded-lg p-2.5 border border-white/5">
                                                    <p className="text-xs font-mono text-slate-300 mb-1.5 truncate">{col}</p>
                                                    <select value={mapping[col] || "STRING"} onChange={e => setMapping(prev => ({ ...prev, [col]: e.target.value }))}
                                                        className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-[11px] text-slate-300 outline-none focus:border-orange-500/50">
                                                        <option value="ID">Primary Key</option>
                                                        <option value="STRING">Text</option>
                                                        <option value="NUMBER">Number</option>
                                                        <option value="BOOLEAN">Boolean</option>
                                                        <option value="DATETIME">Timestamp</option>
                                                        <option value="IGNORE">Ignore</option>
                                                    </select>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex-1 p-4 overflow-auto">
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-3">Data Preview</p>
                                            <div className="border border-white/8 rounded-xl overflow-hidden">
                                                <table className="w-full text-left whitespace-nowrap text-xs">
                                                    <thead className="bg-white/3 border-b border-white/8">
                                                        <tr>{columns.map(c => <th key={c} className="px-3 py-2 text-slate-400 font-bold">{c}<span className="block text-orange-400 font-mono text-[9px]">{mapping[c] || "STRING"}</span></th>)}</tr>
                                                    </thead>
                                                    <tbody>
                                                        {previewData.map((row, i) => (
                                                            <tr key={i} className="border-b border-white/5 hover:bg-white/2">
                                                                {columns.map(c => <td key={c} className="px-3 py-2 text-slate-400 font-mono">{String(row[c] || '')}</td>)}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 'EXECUTE' && (
                                <div className="flex flex-col items-center justify-center py-20 gap-5">
                                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                                    </div>
                                    <div className="text-center">
                                        <h2 className="text-lg font-bold text-white mb-1">Building Ontology Graph...</h2>
                                        <p className="text-slate-500 text-sm">Entity nodes and relationships are being compiled.</p>
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        {PIPELINE_STAGES.map((s, i) => (
                                            <div key={s} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                                <span className="text-[10px] font-bold text-emerald-400">{s}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── PIPELINES VIEW ── */}
                {viewMode === 'PIPELINES' && <PipelineEditor />}
            </div>
        </div>
    );
}
