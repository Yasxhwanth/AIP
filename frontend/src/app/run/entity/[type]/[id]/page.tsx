"use client";

import { use, useState, useMemo } from "react";
import { useBuilderStore } from "@/store/builderStore";
import { useRuntimeStore } from "@/store/runtimeStore";
import {
    Database, Activity, Zap, CheckCircle2, ShieldAlert,
    ChevronLeft, ChevronRight, Clock, History, Cpu, FileJson, AlertTriangle
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
        <div className="flex-1 overflow-y-auto bg-[#060A12] text-slate-300 font-sans p-8">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header Back Link & Title */}
                <div>
                    <Link href={`/run/entity/${type}`} className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors mb-4 bg-blue-500/10 px-3 py-1.5 rounded border border-blue-500/20">
                        <ChevronLeft className="w-3.5 h-3.5" /> Back to {entityType.name}s
                    </Link>

                    <div className="flex justify-between items-end">
                        <div className="flex gap-4 items-center">
                            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center shrink-0">
                                <Database className="w-8 h-8 text-blue-400" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] uppercase font-black tracking-[0.1em] text-slate-500">Instance of {entityType.name}</span>
                                </div>
                                <h1 className="text-3xl font-black text-white font-mono">{instance.id}</h1>
                            </div>
                        </div>

                        {/* Status Badge Mock Logic based on properties mapped */}
                        {instance.properties.status === 'CRITICAL' ? (
                            <div className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg flex items-center gap-2 font-bold text-sm uppercase">
                                <ShieldAlert className="w-5 h-5 mt-0.5" /> {instance.properties.status}
                            </div>
                        ) : instance.properties.status === 'WARNING' ? (
                            <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg flex items-center gap-2 font-bold text-sm uppercase">
                                <AlertTriangle className="w-5 h-5 mt-0.5" /> {instance.properties.status}
                            </div>
                        ) : (
                            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg flex items-center gap-2 font-bold text-sm uppercase">
                                <CheckCircle2 className="w-5 h-5 mt-0.5" /> {instance.properties.status || 'Active'}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column: Properties & Metrics */}
                    <div className="col-span-2 space-y-6">

                        {/* Properties Card */}
                        <div className="bg-[#0B1220] border border-white/5 rounded-2xl p-6 shadow-xl space-y-4">
                            <h2 className="text-xs uppercase font-bold text-slate-400 tracking-widest flex items-center gap-2 border-b border-white/5 pb-3">
                                <FileJson className="w-4 h-4 text-blue-400" /> Object Properties
                            </h2>
                            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                {entityType.properties.map(p => (
                                    <div key={p.id}>
                                        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">{p.name}</div>
                                        <div className="text-sm text-slate-200 font-mono">{instance.properties[p.name] !== undefined ? String(instance.properties[p.name]) : '—'}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Telemetry Metrics Card */}
                        {entityType.metrics.length > 0 && (
                            <div className="bg-[#0B1220] border border-white/5 rounded-2xl p-6 shadow-xl space-y-4">
                                <h2 className="text-xs uppercase font-bold text-slate-400 tracking-widest flex items-center gap-2 border-b border-white/5 pb-3">
                                    <Activity className="w-4 h-4 text-emerald-400" /> Live Telemetry
                                </h2>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                                    {entityType.metrics.map(m => (
                                        <div key={m.id} className="bg-black/20 rounded-xl border border-white/5 p-4 flex flex-col justify-between">
                                            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">{m.name}</div>
                                            <div className="text-3xl font-black text-emerald-400 font-mono">
                                                {instance.metrics[m.name] !== undefined ? instance.metrics[m.name] : '0'} <span className="text-sm font-sans text-emerald-500/50">{m.unit}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Activity Timeline */}
                        <div className="bg-[#0B1220] border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
                            <h2 className="text-xs uppercase font-bold text-slate-400 tracking-widest flex items-center gap-2 border-b border-white/5 pb-3">
                                <History className="w-4 h-4 text-amber-400" /> Object Activity Log
                            </h2>
                            <div className="space-y-6">
                                {instanceActivity.map((act, idx) => (
                                    <div key={act.id} className="relative pl-6">
                                        {idx !== instanceActivity.length - 1 && (
                                            <div className="absolute left-[11px] top-6 bottom-[-24px] w-px bg-white/10" />
                                        )}
                                        <div className={`absolute left-0 top-1.5 w-[22px] h-[22px] rounded-full flex items-center justify-center border-2 border-[#0B1220] ${act.type === 'action_executed' ? 'bg-emerald-500' : 'bg-slate-600'
                                            }`}>
                                            <div className="w-1.5 h-1.5 bg-[#0B1220] rounded-full" />
                                        </div>

                                        <div className="text-[10px] text-slate-500 font-mono mb-1">{new Date(act.timestamp).toLocaleString()}</div>
                                        <div className="text-sm font-bold text-slate-200 mb-0.5">{act.title}</div>
                                        <div className="text-xs text-slate-400 mb-2 leading-relaxed">{act.description}</div>
                                        <span className="text-[10px] px-2 py-0.5 bg-white/5 rounded text-slate-500 font-bold uppercase tracking-wider">
                                            Operator: {act.actor}
                                        </span>
                                    </div>
                                ))}
                                {instanceActivity.length === 0 && (
                                    <div className="text-center text-xs text-slate-500 italic py-8">No activity history for this object.</div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Operative Actions */}
                    <div className="col-span-1 space-y-6">
                        <div className="bg-blue-900/10 border border-blue-500/20 rounded-2xl flex flex-col overflow-hidden shadow-xl sticky top-8">
                            <div className="p-5 border-b border-blue-500/20 bg-blue-600/5 flex justify-between items-center">
                                <h2 className="text-sm font-bold text-blue-300 flex items-center gap-2">
                                    <Zap className="w-4 h-4" /> Operational Actions
                                </h2>
                            </div>
                            <div className="p-5 space-y-3">
                                {instanceActions.map(act => (
                                    <button key={act.id} onClick={() => setExecAction(act.id)}
                                        className="w-full flex justify-between items-center p-4 rounded-xl bg-black/40 border border-white/10 hover:border-blue-500/50 hover:bg-white/5 transition-all text-left group">
                                        <div>
                                            <div className="text-sm font-bold text-slate-200 font-sans group-hover:text-blue-300 transition-colors">{act.name}</div>
                                            <div className="text-[10px] text-slate-500 font-sans mt-0.5 flex gap-2">
                                                <span>{act.rules?.length ?? 0} rules</span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                                    </button>
                                ))}
                                {instanceActions.length === 0 && (
                                    <div className="text-center text-xs text-slate-500 font-sans py-8">No authorized actions bound to this ontology object.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Execution Modal */}
            {execAction && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50 animate-in fade-in duration-200">
                    <div className="bg-[#111827] border border-blue-500/30 rounded-2xl w-full max-w-lg shadow-2xl p-6">
                        {(() => {
                            const action = actions.find(a => a.id === execAction);
                            if (!action) return null;
                            return (
                                <>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                                                <Zap className="w-6 h-6 text-blue-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-white font-sans">{action.name}</h3>
                                                <p className="text-xs text-slate-400 font-sans mt-1">Executing payload against <code className="text-blue-300">{instance.id}</code></p>
                                            </div>
                                        </div>
                                    </div>



                                    <div className="flex justify-end gap-3 font-sans mt-8 pt-6 border-t border-white/10">
                                        <button onClick={() => setExecAction(null)} disabled={isExecuting} className="px-5 py-2.5 rounded-lg text-sm font-bold text-slate-300 hover:bg-white/5 transition-colors">Cancel</button>
                                        <button onClick={handleExecute} disabled={isExecuting} className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50">
                                            {isExecuting ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Zap className="w-4 h-4" />}
                                            {isExecuting ? 'Committing...' : 'Commit Action'}
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

