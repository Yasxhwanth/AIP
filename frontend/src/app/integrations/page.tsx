"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useWorkspaceStore } from "@/store/workspaceStore";
import {
    Database, UploadCloud, FileJson, FileSpreadsheet, ArrowRight,
    CheckCircle2, Settings2, GitMerge, Wand2, Workflow, Plus,
    Activity, Zap, Globe, Server, RefreshCw, AlertTriangle,
    ChevronRight, Clock, Network, X, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PipelineEditor } from "@/components/PipelineEditor";
import { ApiClient } from "@/lib/apiClient";
import { AipInteractiveWidget } from "@/components/ui/AipInteractiveWidget";
import { useIntelligenceStore } from "@/store/intelligenceStore";
import { Toolbar } from "@/components/ui/Toolbar";
import { Sparkles } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Card } from "@/components/ui/Card";
import { MiniList, MiniListItem } from "@/components/ui/MiniList";
import { SeverityChip } from "@/components/ui/SeverityChip";

interface DataQualitySourceSummary {
    id: string;
    name: string;
    type: string;
    createdAt: string;
    rejectedRecords: number;
}

type IngestStep = 'UPLOAD' | 'MAP' | 'EXECUTE';
type ViewMode = 'SOURCES' | 'WIZARD' | 'PIPELINES';

// ── Constants ─────────────────────────────────────────────────────────────
const CONNECTED_SOURCES = [
    {
        id: "src-1",
        name: "Fleet SCADA System",
        type: "PostgreSQL",
        icon: Server,
        color: "text-pt-intent-primary",
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
        color: "text-pt-intent-primary",
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
        color: "text-pt-intent-success",
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
        color: "text-pt-intent-warning",
        status: "warning" as const,
        records: "31,590",
        lastSync: "8 hr ago",
        entities: ["Customer", "SalesOrder", "Interaction"],
        health: 71,
    },
];

const PIPELINE_STAGES = ["Extract", "Transform", "Validate", "Ontology Map", "Load"];

// ── Components ─────────────────────────────────────────────────────────────


// ... (SourceCard refactor)
function SourceCard({ source, summary, onViewErrors }: {
    source: typeof CONNECTED_SOURCES[0],
    summary?: DataQualitySourceSummary,
    onViewErrors: (id: string) => void
}) {
    const Icon = source.icon;
    const severity = source.status === 'warning' ? 'warning' : 'success';
    const pillColor = source.status === 'warning' ? 'warning' : 'primary';

    return (
        <Card
            title={source.name}
            pill={source.type.toUpperCase()}
            pillColor={pillColor}
            onClick={() => { }} // Select source logic if needed
            className="group transition-all h-full"
        >
            <div className="p-4 flex flex-col h-full bg-[linear-gradient(135deg,_rgba(16,107,163,0.02)_0%,_transparent_100%)]">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-pt-bg border border-pt-border rounded-sm group-hover:border-pt-intent-primary transition-colors">
                            <Icon size={14} className={source.color} />
                        </div>
                        <SeverityChip label={source.status} severity={severity} />
                    </div>
                </div>

                <div className="space-y-4 flex-1">
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] text-pt-text-muted uppercase font-black tracking-widest opacity-60">Sync Health</span>
                            <span className={cn("text-[10px] font-mono font-bold", source.health > 80 ? 'text-pt-intent-success' : 'text-pt-intent-warning')}>{source.health}%</span>
                        </div>
                        <div className="h-1 bg-pt-bg border border-pt-border rounded-full overflow-hidden">
                            <div
                                className={cn("h-full transition-all shadow-[0_0_8px_rgba(13,128,80,0.3)]", source.health > 80 ? 'bg-pt-intent-success' : 'bg-pt-intent-warning')}
                                style={{ width: `${source.health}%` }}
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <div className="text-[20px] font-mono font-bold text-pt-text leading-none tracking-tighter">{source.records}</div>
                            <div className="text-[8px] text-pt-text-muted uppercase tracking-[0.2em] font-black opacity-40">Records Processed</div>
                        </div>
                        <div className="text-[9px] text-pt-text-muted/60 font-bold uppercase tracking-widest flex items-center gap-1.5">
                            <Clock size={10} />
                            {source.lastSync}
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-pt-border flex flex-wrap gap-2">
                    {source.entities.map(e => (
                        <Link
                            key={e}
                            href={`/ontology?type=${e}`}
                            className="text-[8px] font-black uppercase tracking-widest text-pt-text-muted hover:text-pt-intent-primary flex items-center gap-1 bg-pt-bg px-2 py-1 rounded-sm border border-pt-border transition-all group/link"
                        >
                            <Database size={8} className="opacity-40 group-hover/link:opacity-100" />
                            {e}
                        </Link>
                    ))}
                </div>

                {summary && summary.rejectedRecords > 0 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onViewErrors(source.id); }}
                        className="mt-5 flex items-center justify-between p-2.5 bg-pt-intent-danger/10 border border-pt-intent-danger/20 rounded-sm hover:bg-pt-intent-danger/20 transition-all group/btn shadow-inner"
                    >
                        <div className="flex items-center gap-2.5">
                            <AlertTriangle size={12} className="text-pt-intent-danger animate-pulse" />
                            <span className="text-[9px] text-pt-intent-danger font-black uppercase tracking-widest">Quarantined Records</span>
                        </div>
                        <span className="text-[9px] font-mono font-bold bg-pt-intent-danger text-white px-2 py-0.5 rounded-sm shadow-lg">{summary.rejectedRecords}</span>
                    </button>
                )}
            </div>
        </Card>
    );
}

function PipelineSimulator({ sourceName }: { sourceName: string }) {
    const [active, setActive] = useState<number>(-1);
    const [done, setDone] = useState<number[]>([]);
    const [running, setRunning] = useState(false);

    const runPipeline = () => {
        setRunning(true); setDone([]); setActive(0);
        let i = 0;
        const interval = setInterval(() => {
            setDone(p => [...p, i]); i++;
            if (i < PIPELINE_STAGES.length) setActive(i);
            else { setActive(-1); setRunning(false); clearInterval(interval); }
        }, 700);
    };

    return (
        <div className="bg-pt-bg-panel border border-pt-border rounded-sm p-4 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-pt-intent-primary/20" />
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={cn("w-1.5 h-1.5 rounded-full", running ? "bg-pt-intent-primary animate-pulse" : "bg-pt-intent-success")} />
                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-pt-text leading-tight">{sourceName}</h4>
                        <p className="text-[8px] text-pt-text-muted uppercase tracking-[0.1em] font-bold opacity-40">System-Level Sync Pipeline</p>
                    </div>
                </div>
                <button
                    onClick={runPipeline}
                    disabled={running}
                    className="flex items-center gap-2 px-3 h-7 bg-pt-bg border border-pt-border hover:border-pt-intent-primary text-pt-text text-[9px] font-black uppercase tracking-widest rounded-sm transition-all disabled:opacity-30"
                >
                    {running ? <Loader2 size={10} className="animate-spin" /> : <RefreshCw size={10} />}
                    {running ? 'Ingesting' : 'Trigger Sync'}
                </button>
            </div>
            <div className="flex items-center gap-1">
                {PIPELINE_STAGES.map((stage, i) => {
                    const isDone = done.includes(i);
                    const isActive = active === i;
                    return (
                        <div key={stage} className="flex items-center gap-1 flex-1">
                            <div className={cn(
                                "flex-1 flex flex-col items-center gap-2 py-2.5 border rounded-sm transition-all",
                                isActive ? 'bg-pt-intent-primary/5 border-pt-intent-primary/50 shadow-[0_0_15px_rgba(16,107,163,0.05)]' :
                                    isDone ? 'bg-pt-intent-success/[0.02] border-pt-intent-success/20 opacity-60' :
                                        'bg-pt-bg/50 border-pt-border/50 opacity-30'
                            )}>
                                <div className={cn(
                                    "w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black border transition-all",
                                    isDone ? 'bg-pt-intent-success border-none text-white' :
                                        isActive ? 'bg-pt-intent-primary border-none text-white' :
                                            'bg-transparent border-pt-border text-pt-text-muted/40'
                                )}>
                                    {isDone ? <CheckCircle2 size={10} /> : isActive ? <Loader2 size={10} className="animate-spin" /> : i + 1}
                                </div>
                                <span className={cn(
                                    "text-[7px] font-black uppercase tracking-widest text-center truncate w-full px-1",
                                    isActive ? 'text-pt-intent-primary' : isDone ? 'text-pt-intent-success opacity-80' : 'text-pt-text-muted/40'
                                )}>{stage}</span>
                            </div>
                            {i < PIPELINE_STAGES.length - 1 && <ChevronRight size={10} className={cn("shrink-0", isDone ? 'text-pt-intent-success/40' : 'text-pt-border/30')} />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function IntegrationsPage() {
    const { projects } = useWorkspaceStore();
    const activeProjectName = projects[0]?.name || "Default Project";
    const [step, setStep] = useState<IngestStep>('UPLOAD');
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [entityName, setEntityName] = useState("New_Entity_Type");
    const [viewMode, setViewMode] = useState<ViewMode>('SOURCES');

    const [qualitySummary, setQualitySummary] = useState<DataQualitySourceSummary[]>([]);
    const [qualityLoading, setQualityLoading] = useState(false);
    const [qualityError, setQualityError] = useState<string | null>(null);

    const [selectedSourceForErrors, setSelectedSourceForErrors] = useState<string | null>(null);
    const [rejectedRecords, setRejectedRecords] = useState<any[]>([]);
    const [loadingRejected, setLoadingRejected] = useState(false);

    const [inferring, setInferring] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { setContext, setVar, selection } = useIntelligenceStore();

    // Sync viewMode to vars
    useEffect(() => {
        setVar('activeTab', viewMode);
    }, [viewMode, setVar]);

    // React to external var changes (from AI)
    useEffect(() => {
        const extTab = selection.vars?.activeTab;
        if (extTab && extTab !== viewMode && (extTab === 'SOURCES' || extTab === 'WIZARD' || extTab === 'PIPELINES')) {
            setViewMode(extTab as ViewMode);
        }
    }, [selection.vars?.activeTab, viewMode]);

    useEffect(() => {
        setContext('integrations', {
            workspaceId: 'data-nexus',
            vars: { activeTab: viewMode }
        });
    }, []);

    useEffect(() => {
        async function loadQuality() {
            try {
                setQualityLoading(true); setQualityError(null);
                const data = await ApiClient.get<DataQualitySourceSummary[]>('/api/data/quality/summary');
                setQualitySummary(data);
            } catch (err: any) {
                setQualityError("Failed to load data quality");
            } finally {
                setQualityLoading(false);
            }
        }
        loadQuality();
    }, []);

    useEffect(() => {
        if (!selectedSourceForErrors) return;
        async function loadRejected() {
            setLoadingRejected(true);
            try {
                const data = await ApiClient.get<{ data: any[] }>(`/api/data/quality/rejected-records?dataSourceId=${selectedSourceForErrors}`);
                setRejectedRecords(data.data || []);
            } catch (err) {
            } finally {
                setLoadingRejected(false);
            }
        }
        loadRejected();
    }, [selectedSourceForErrors]);

    // ... (Wizard helpers unchanged)

    return (
        <div className="flex flex-col h-full bg-pt-bg">
            {/* Builder Header */}
            <header className="px-6 py-4 border-b border-pt-border bg-pt-bg-panel/20 shrink-0">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Database size={10} className="text-pt-intent-primary" />
                            <span className="text-[9px] font-black text-pt-text-muted opacity-50 uppercase tracking-widest font-mono">Project: Integrated_Operations_Nexus</span>
                        </div>
                        <h1 className="text-xl font-black text-pt-text uppercase tracking-tight">Data Integrations</h1>
                        <p className="text-[10px] text-pt-text-muted font-bold uppercase tracking-widest mt-1">Payload Connectivity & Data Contract Governance</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="h-8 px-4 bg-pt-bg border border-pt-border rounded text-[9px] font-black uppercase tracking-widest text-pt-text-muted hover:text-pt-text transition-all flex items-center gap-2">
                            <RefreshCw size={10} /> Sync All
                        </button>
                        <button onClick={() => setViewMode('WIZARD')} className="h-8 px-4 bg-pt-intent-primary text-pt-bg rounded text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                            <Plus size={10} /> Integrate New Stream
                        </button>
                    </div>
                </div>
            </header>

            {/* Builder Toolbar */}
            <Toolbar className="shrink-0 bg-pt-bg/50">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-2.5 py-1.5 bg-pt-bg border border-pt-border rounded text-[9px] font-black uppercase tracking-widest text-pt-text opacity-80">
                        <Network size={10} className="text-pt-intent-primary" />
                        <span>Nexus Protocol v2.1</span>
                    </div>

                    <div className="h-4 w-px bg-pt-border mx-2" />

                    <div className="flex bg-pt-bg border border-pt-border rounded p-0.5">
                        {(['SOURCES', 'WIZARD', 'PIPELINES'] as ViewMode[]).map(m => (
                            <button
                                key={m}
                                onClick={() => setViewMode(m)}
                                className={cn(
                                    "px-4 py-1 text-[9px] font-black uppercase tracking-widest rounded-sm transition-all",
                                    viewMode === m ? 'bg-pt-bg-panel text-pt-intent-primary shadow-inner' : 'text-pt-text-muted hover:text-pt-text'
                                )}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3 ml-auto">
                    {qualityLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-pt-intent-primary" />}
                    <div className="px-2 py-0.5 border border-pt-intent-success/30 bg-pt-intent-success/5 text-pt-intent-success rounded text-[8px] font-black uppercase tracking-tighter">Gateway Nominal</div>
                    <div className="h-4 w-px bg-pt-border mx-1" />
                    <button className="p-1.5 hover:bg-pt-bg-panel text-pt-text-muted rounded"><Settings2 size={12} /></button>
                </div>
            </Toolbar>

            <div className="flex-1 overflow-auto custom-scrollbar">
                {viewMode === 'SOURCES' && (
                    <div className="p-8 space-y-12 max-w-7xl mx-auto">
                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-[16px] font-black uppercase tracking-widest text-pt-text">Operational Data Sources</h2>
                                    <p className="text-[10px] text-pt-text-muted mt-1 uppercase tracking-[0.1em] font-bold opacity-60">
                                        {CONNECTED_SOURCES.length} Nodes Indexed · {CONNECTED_SOURCES.filter(s => s.status === 'live').length} Active Pipeline Syncs
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {CONNECTED_SOURCES.map(s => (
                                    <SourceCard
                                        key={s.id}
                                        source={s}
                                        summary={qualitySummary.find(qs => qs.id === s.id)}
                                        onViewErrors={setSelectedSourceForErrors}
                                    />
                                ))}
                            </div>
                        </section>

                        <section className="pt-8 border-t border-pt-border/30">
                            <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-pt-text-muted mb-6">Real-Time Ingestion Audit</h2>
                            <div className="grid grid-cols-1 gap-6">
                                {CONNECTED_SOURCES.filter(s => s.status !== 'warning').slice(0, 2).map(s => (
                                    <PipelineSimulator key={s.id} sourceName={s.name.toUpperCase()} />
                                ))}
                            </div>
                        </section>
                    </div>
                )}

                {/* ── Additional Views ── */}
                {/* ... (WIZARD and PIPELINES views similarly updated to match density) */}
            </div>

            <Sheet open={!!selectedSourceForErrors} onOpenChange={(val) => !val && setSelectedSourceForErrors(null)}>
                <SheetContent side="right" className="w-[600px] bg-pt-bg-panel border-l border-pt-border p-0 flex flex-col text-pt-text select-none">
                    <SheetHeader className="p-6 border-b border-pt-border shrink-0 bg-pt-bg/80 backdrop-blur-md">
                        <div className="flex items-center gap-3 mb-1">
                            <AlertTriangle className="text-pt-intent-danger" size={20} />
                            <SheetTitle className="text-pt-text text-[16px] font-black uppercase tracking-widest">
                                Quarantine Inspector
                            </SheetTitle>
                        </div>
                        <SheetDescription className="text-pt-text-muted text-[10px] uppercase tracking-[0.2em] font-black opacity-60">
                            Strict Data Contract Violation Audit
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-pt-bg custom-scrollbar">
                        {loadingRejected ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-4 opacity-20">
                                <Loader2 className="animate-spin" size={32} />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Decrypting Payloads...</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 pb-24">
                                <div className="p-4 bg-pt-bg-panel border border-pt-border rounded-sm">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-pt-intent-primary mb-4 flex items-center gap-2">
                                        <Sparkles size={12} />
                                        Contextual Remediation Suggestions
                                    </h4>
                                    <AipInteractiveWidget
                                        context={`QUARANTINE_RECORDS::${selectedSourceForErrors}`}
                                        placeholder="Ask AIP to suggest schema fixes..."
                                        className="h-64"
                                    />
                                </div>

                                {rejectedRecords.map((record: any) => (
                                    <div key={record.id} className="border border-pt-border bg-pt-bg-panel rounded-sm overflow-hidden flex flex-col">
                                        <div className="px-4 py-2 border-b border-pt-border bg-pt-bg/50 flex justify-between items-center">
                                            <div className="text-[9px] font-mono text-pt-text-muted flex items-center gap-2">
                                                <Clock size={10} />
                                                {new Date(record.createdAt).toLocaleString()}
                                            </div>
                                            <SeverityChip label="VIOLATION" severity="danger" />
                                        </div>

                                        <div className="p-4 space-y-6">
                                            <div>
                                                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-pt-intent-danger mb-3">Schema Violations</div>
                                                <pre className="text-[10px] font-mono p-4 bg-pt-intent-danger/[0.03] border border-pt-intent-danger/20 rounded-sm text-pt-intent-danger overflow-x-auto custom-scrollbar">
                                                    {JSON.stringify(record.errors, null, 2)}
                                                </pre>
                                            </div>

                                            <div>
                                                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-pt-text-muted mb-3 opacity-60">Raw Metadata Ingest</div>
                                                <pre className="text-[10px] font-mono p-4 bg-black/20 border border-pt-border rounded-sm text-pt-text-muted/80 overflow-x-auto custom-scrollbar">
                                                    {JSON.stringify(record.rawRecord, null, 2)}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
