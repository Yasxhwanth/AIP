"use client";

import { use, useState } from "react";
import { useBuilderStore } from "@/store/builderStore";
import { useRuntimeStore } from "@/store/runtimeStore";
import {
    Database, Activity, Zap, CheckCircle2, ShieldAlert,
    ChevronLeft, ChevronRight, Clock, History, Cpu, FileJson,
    AlertTriangle, Fingerprint, Command, ShieldCheck, RefreshCcw
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default function EntityDetailView({ params }: { params: Promise<{ type: string; id: string }> }) {
    const { type, id } = use(params);
    const { entityTypes, actions } = useBuilderStore();
    const { instances, activity, executeAction } = useRuntimeStore();

    const entityType = entityTypes.find(e => e.id === type);
    const instance = instances.find(i => i.id === id);

    if (!entityType || !instance) return notFound();

    const instanceActions = actions.filter(a => a.targetEntityTypeId === type);
    const instanceActivity = activity.filter(a => a.entityInstanceId === id);

    // Modal state for Action Execution
    const [execAction, setExecAction] = useState<string | null>(null);
    const [execPayload, setExecPayload] = useState<Record<string, any>>({});
    const [isExecuting, setIsExecuting] = useState(false);

    const handleExecute = async () => {
        if (!execAction) return;
        setIsExecuting(true);
        await executeAction(execAction, instance.id, execPayload);
        setIsExecuting(false);
        setExecAction(null);
        setExecPayload({});
    };

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-pt-bg text-pt-text font-mono p-10 overflow-y-auto custom-scrollbar">
            <div className="max-w-7xl mx-auto w-full space-y-10">

                {/* Header Back Link & Title Matrix */}
                <div className="space-y-6">
                    <Link href={`/run/entity/${type}`} className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-pt-intent-primary hover:brightness-110 transition-all bg-pt-intent-primary/10 px-4 py-2 rounded-lg border border-pt-intent-primary/20 group">
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Registry: {entityType.name}s
                    </Link>

                    <div className="flex justify-between items-end border-b border-pt-border pb-10">
                        <div className="flex gap-6 items-center">
                            <div className="w-20 h-20 rounded-2xl bg-pt-bg-panel border border-pt-border flex items-center justify-center shrink-0 shadow-2xl relative">
                                <Fingerprint className="w-10 h-10 text-pt-intent-primary opacity-50" />
                                <div className="absolute inset-0 border border-pt-intent-primary/20 rounded-2xl animate-pulse" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-[10px] uppercase font-black tracking-[0.4em] text-pt-text-muted opacity-40">Operational Node ID</span>
                                    <div className="h-px w-8 bg-pt-border" />
                                </div>
                                <h1 className="text-4xl font-black text-pt-text tracking-tighter font-mono">{instance.id}</h1>
                            </div>
                        </div>

                        {/* Status Badge Registry logic */}
                        <div className="flex flex-col items-end gap-3">
                            <span className="text-[10px] font-black text-pt-text-muted uppercase tracking-[0.3em] opacity-40">Lattice Health Status</span>
                            {instance.properties.status === 'CRITICAL' ? (
                                <div className="px-6 py-3 bg-pt-intent-danger/10 border border-pt-intent-danger/30 text-pt-intent-danger rounded-xl flex items-center gap-3 font-black text-[12px] uppercase tracking-widest shadow-lg shadow-pt-intent-danger/20">
                                    <ShieldAlert className="w-5 h-5" /> {instance.properties.status}
                                </div>
                            ) : instance.properties.status === 'WARNING' || instance.properties.status === 'CONFLICT' ? (
                                <div className="px-6 py-3 bg-pt-intent-warning/10 border border-pt-intent-warning/30 text-pt-intent-warning rounded-xl flex items-center gap-3 font-black text-[12px] uppercase tracking-widest shadow-lg shadow-pt-intent-warning/20">
                                    <AlertTriangle className="w-5 h-5" /> {instance.properties.status}
                                </div>
                            ) : (
                                <div className="px-6 py-3 bg-pt-intent-success/10 border border-pt-intent-success/30 text-pt-intent-success rounded-xl flex items-center gap-3 font-black text-[12px] uppercase tracking-widest shadow-lg shadow-pt-intent-success/20">
                                    <ShieldCheck className="w-5 h-5" /> {instance.properties.status || 'NOMINAL'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* Left Column: Properties & Telemetry Matrix */}
                    <div className="lg:col-span-2 space-y-10">

                        {/* Properties Card Matrix */}
                        <div className="bg-pt-bg-panel border border-pt-border rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.02]">
                                <FileJson size={120} />
                            </div>
                            <h2 className="text-[11px] uppercase font-black text-pt-text-muted tracking-[0.4em] flex items-center gap-3 border-b border-pt-border pb-6 mb-8">
                                <Database className="w-4 h-4 text-pt-intent-primary" /> Static Object Registry
                            </h2>
                            <div className="grid grid-cols-2 gap-x-16 gap-y-10">
                                {entityType.properties.map(p => (
                                    <div key={p.id}>
                                        <div className="text-[10px] text-pt-text-muted uppercase tracking-[0.2em] font-black mb-2 opacity-40">{p.name}</div>
                                        <div className="text-[13px] text-pt-text font-black tracking-tight font-mono border-l-2 border-pt-border pl-4">
                                            {instance.properties[p.name] !== undefined ? String(instance.properties[p.name]) : '—'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Telemetry Sensor Card */}
                        {entityType.metrics.length > 0 && (
                            <div className="bg-pt-bg-panel border border-pt-border rounded-2xl p-8 shadow-2xl space-y-8">
                                <h2 className="text-[11px] uppercase font-black text-pt-text-muted tracking-[0.4em] flex items-center gap-3 border-b border-pt-border pb-6">
                                    <Activity className="w-4 h-4 text-pt-intent-success" /> Live Telemetry Matrix
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {entityType.metrics.map(m => (
                                        <div key={m.id} className="bg-pt-bg rounded-xl border border-pt-border p-6 flex flex-col justify-between group hover:border-pt-intent-success/30 transition-all shadow-inner">
                                            <div className="text-[9px] text-pt-text-muted uppercase tracking-[0.2em] font-black mb-4 opacity-40">{m.name}</div>
                                            <div className="text-4xl font-black text-pt-intent-success font-mono tracking-tighter">
                                                {instance.metrics[m.name] !== undefined ? instance.metrics[m.name] : '0'}
                                                <span className="text-xs font-black uppercase tracking-widest text-pt-intent-success/40 ml-2">{m.unit}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Activity Audit Timeline */}
                        <div className="bg-pt-bg-panel border border-pt-border rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.02]">
                                <History size={120} />
                            </div>
                            <h2 className="text-[11px] uppercase font-black text-pt-text-muted tracking-[0.4em] flex items-center gap-3 border-b border-pt-border pb-6 mb-8">
                                <Clock className="w-4 h-4 text-pt-intent-warning" /> Node Activity Audit
                            </h2>
                            <div className="space-y-10">
                                {instanceActivity.map((act, idx) => (
                                    <div key={act.id} className="relative pl-10 group">
                                        {idx !== instanceActivity.length - 1 && (
                                            <div className="absolute left-[13px] top-8 bottom-[-40px] w-0.5 bg-pt-border/30 group-hover:bg-pt-intent-primary/20 transition-all" />
                                        )}
                                        <div className={`absolute left-0 top-1.5 w-[28px] h-[28px] rounded-lg flex items-center justify-center border border-pt-border bg-pt-bg shadow-xl group-hover:border-pt-intent-primary transition-all z-10`}>
                                            <div className={`w-2 h-2 rounded-full ${act.type === 'action_executed' ? 'bg-pt-intent-success shadow-[0_0_8px_rgb(var(--pt-intent-success) / 0.5)]' : 'bg-pt-text-muted'}`} />
                                        </div>

                                        <div className="flex justify-between items-center mb-2">
                                            <div className="text-[12px] font-black text-pt-text uppercase tracking-tight group-hover:text-pt-intent-primary transition-colors">{act.title}</div>
                                            <div className="text-[9px] text-pt-text-muted font-black tracking-widest opacity-40 bg-pt-bg px-2 py-1 rounded border border-pt-border">{new Date(act.timestamp).toLocaleString()}</div>
                                        </div>
                                        <div className="text-[11px] text-pt-text-muted font-bold mb-4 leading-relaxed bg-pt-bg/20 p-4 rounded-xl border border-transparent group-hover:border-pt-border/50 transition-all">{act.description}</div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[9px] px-3 py-1 bg-pt-bg border border-pt-border rounded-lg text-pt-text-muted font-black uppercase tracking-widest">
                                                ID: {act.id}
                                            </span>
                                            <span className="text-[9px] px-3 py-1 bg-pt-bg border border-pt-border rounded-lg text-pt-text-muted font-black uppercase tracking-widest">
                                                Operator: <span className="text-pt-text">{act.actor}</span>
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {instanceActivity.length === 0 && (
                                    <div className="text-center py-20 flex flex-col items-center gap-4 opacity-20">
                                        <History size={40} />
                                        <span className="text-[11px] font-black uppercase tracking-[0.5em]">No Activity Records Found</span>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Tactical Overrides */}
                    <div className="lg:col-span-1">
                        <div className="bg-pt-bg-panel border border-pt-intent-primary/30 rounded-2xl flex flex-col overflow-hidden shadow-2xl sticky top-8">
                            <div className="p-6 border-b border-pt-intent-primary/20 bg-pt-intent-primary/5 flex justify-between items-center">
                                <h2 className="text-[11px] font-black text-pt-intent-primary uppercase tracking-[0.3em] flex items-center gap-3">
                                    <Zap className="w-5 h-5 animate-pulse" /> Mission Overrides
                                </h2>
                            </div>
                            <div className="p-6 space-y-4 bg-[linear-gradient(180deg,_transparent_0%,_rgb(var(--pt-intent-primary) / 0.02)_100%)]">
                                {instanceActions.map(act => (
                                    <button key={act.id} onClick={() => setExecAction(act.id)}
                                        className="w-full flex justify-between items-center p-5 rounded-xl bg-pt-bg border border-pt-border hover:border-pt-intent-primary/50 hover:bg-pt-bg-panel transition-all text-left group shadow-lg active:scale-95">
                                        <div className="flex flex-col gap-1">
                                            <div className="text-[12px] font-black text-pt-text uppercase tracking-tight group-hover:text-pt-intent-primary transition-colors">{act.name}</div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-[8px] text-pt-text-muted font-black uppercase tracking-[0.2em] opacity-40">Rule Count: {act.rules?.length ?? 0}</div>
                                                <div className="h-1 w-1 rounded-full bg-pt-border" />
                                                <div className="text-[8px] text-pt-text-muted font-black uppercase tracking-[0.2em] opacity-40">ID: {act.id}</div>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-pt-text-muted group-hover:text-pt-intent-primary transition-all group-hover:translate-x-1" />
                                    </button>
                                ))}
                                {instanceActions.length === 0 && (
                                    <div className="text-center py-12 flex flex-col items-center gap-4 opacity-20 bg-pt-bg/50 rounded-xl border border-pt-border border-dashed">
                                        <ShieldAlert size={32} />
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">No Actions Authorized</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-6 border-t border-pt-border bg-pt-bg flex items-center justify-center gap-3 opacity-30">
                                <Command size={12} />
                                <span className="text-[8px] font-black uppercase tracking-[0.3em]">RBAC-Restricted Access Zone</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* HIGH-LEVEL INTERVENTION AUTHORIZATION MODAL */}
            {execAction && (
                <div className="fixed inset-0 bg-pt-bg/95 backdrop-blur-md flex items-center justify-center p-8 z-[100] animate-in fade-in duration-300">
                    <div className="bg-pt-bg-panel border border-pt-intent-primary/30 rounded-2xl w-full max-w-xl shadow-[0_0_100px_rgb(var(--pt-intent-primary) / 0.2)] p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Zap size={120} className="text-pt-intent-primary" />
                        </div>

                        {(() => {
                            const action = actions.find(a => a.id === execAction);
                            if (!action) return null;
                            return (
                                <>
                                    <div className="flex gap-6 mb-10 relative z-10">
                                        <div className="w-16 h-16 rounded-2xl bg-pt-intent-primary/10 flex items-center justify-center shrink-0 border border-pt-intent-primary/40 shadow-2xl">
                                            <Zap className="w-8 h-8 text-pt-intent-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-pt-text uppercase tracking-tighter">Commit Protocol Mutation</h3>
                                            <p className="text-[10px] text-pt-text-muted font-black tracking-widest mt-2 opacity-60 uppercase leading-relaxed">
                                                Manual deployment of <span className="text-pt-intent-primary">{action.name}</span> <br />
                                                Target Node: <span className="text-pt-intent-primary font-mono">{instance.id}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-pt-intent-warning/5 border border-pt-intent-warning/30 rounded-xl p-5 mb-10 flex items-start gap-4 relative z-10">
                                        <AlertTriangle className="w-5 h-5 text-pt-intent-warning shrink-0 mt-0.5" />
                                        <div>
                                            <div className="text-[10px] font-black text-pt-intent-warning uppercase tracking-[0.2em] mb-1">State Integrity Risk</div>
                                            <div className="text-[11px] text-pt-text-muted font-bold leading-relaxed opacity-80 uppercase tracking-tight">
                                                Execution will permanently alter the lattice state for this node. Traceability is enabled.
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-4 mt-10 pt-8 border-t border-pt-border relative z-10">
                                        <button onClick={() => setExecAction(null)} disabled={isExecuting}
                                            className="px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-pt-text-muted hover:text-pt-text hover:bg-pt-bg transition-all">
                                            Abort Cycle
                                        </button>
                                        <button onClick={handleExecute} disabled={isExecuting}
                                            className="flex items-center gap-3 px-8 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-pt-intent-primary text-pt-bg transition-all shadow-2xl shadow-pt-intent-primary/20 hover:brightness-110 active:scale-95 disabled:opacity-50">
                                            {isExecuting ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                            {isExecuting ? 'Committing…' : 'Finalize Commit'}
                                        </button>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}
        </div>
    );
}
