"use client";

import { useRuntimeStore } from "@/store/runtimeStore";
import { History, Clock, FileJson, Cpu, ShieldAlert, Zap, User, ArrowRight } from "lucide-react";

export default function ActivityLogPage() {
    const { activity } = useRuntimeStore();

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-pt-bg text-pt-text font-mono p-8 overflow-y-auto custom-scrollbar">
            <div className="max-w-4xl mx-auto w-full space-y-10">

                {/* Tactical Header */}
                <div className="flex justify-between items-end border-b border-pt-border pb-8">
                    <div>
                        <div className="flex items-center gap-3 text-pt-intent-primary mb-3">
                            <History className="w-5 h-5 animate-pulse" />
                            <span className="text-[10px] uppercase font-black tracking-[0.4em]">Audit Persistence Layer</span>
                        </div>
                        <h1 className="text-4xl font-black text-pt-text uppercase tracking-tighter">Global Activity Log</h1>
                        <p className="text-[11px] text-pt-text-muted font-bold tracking-[0.2em] mt-2 opacity-60 uppercase">
                            Immutable ledger documenting all operational vector shifts.
                        </p>
                    </div>
                </div>

                {/* Timeline Matrix */}
                <div className="bg-pt-bg-panel border border-pt-border rounded-xl p-8 shadow-2xl relative">
                    <div className="space-y-12">
                        {activity.map((act, idx) => {
                            const typeCfg =
                                act.type === 'ai_triggered' ? { color: 'text-pt-intent-primary', bg: 'bg-pt-intent-primary', icon: Zap } :
                                    act.type === 'action_executed' ? { color: 'text-pt-intent-success', bg: 'bg-pt-intent-success', icon: Activity } :
                                        act.type === 'case_created' ? { color: 'text-pt-intent-danger', bg: 'bg-pt-intent-danger', icon: ShieldAlert } :
                                            { color: 'text-pt-text-muted', bg: 'bg-pt-border', icon: History };

                            const Icon = typeCfg.icon;

                            return (
                                <div key={act.id} className="relative pl-12 group">
                                    {/* Connection Line */}
                                    {idx !== activity.length - 1 && (
                                        <div className="absolute left-[15px] top-8 bottom-[-48px] w-0.5 bg-pt-border/30 group-hover:bg-pt-intent-primary/20 transition-colors" />
                                    )}

                                    {/* Timeline Marker */}
                                    <div className={`absolute left-0 top-1 w-8 h-8 rounded-lg flex items-center justify-center border border-pt-border bg-pt-bg-panel shadow-lg group-hover:border-pt-intent-primary group-hover:shadow-[0_0_10px_rgba(var(--pt-intent-primary),0.2)] transition-all z-10`}>
                                        <Icon className={`w-3.5 h-3.5 ${typeCfg.color}`} />
                                    </div>

                                    {/* Content Header */}
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex flex-col">
                                            <div className="text-[13px] font-black text-pt-text uppercase tracking-tight leading-none group-hover:text-pt-intent-primary transition-colors">
                                                {act.title}
                                            </div>
                                            <div className="mt-2 flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-pt-text-muted opacity-40">
                                                <span>{act.id}</span>
                                                <span>•</span>
                                                <span className={`${typeCfg.color} font-black`}>{act.type.replace('_', ' ')}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1 bg-pt-bg border border-pt-border rounded text-[9px] text-pt-text-muted font-black tracking-widest shadow-inner">
                                            <Clock className="w-3 h-3 opacity-50" />
                                            {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </div>
                                    </div>

                                    {/* Description Body */}
                                    <div className="text-[11px] text-pt-text-muted font-bold leading-relaxed mb-5 max-w-2xl bg-pt-bg/20 p-3 rounded-lg border border-transparent group-hover:border-pt-border/50 transition-all">
                                        {act.description}
                                    </div>

                                    {/* Metadata Sensors */}
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="px-3 py-1 bg-pt-bg border border-pt-border rounded-lg flex items-center gap-2 group/meta cursor-pointer hover:border-pt-intent-primary transition-all">
                                            <FileJson className="w-3 h-3 text-pt-intent-primary opacity-50 group-hover/meta:opacity-100" />
                                            <span className="text-[9px] text-pt-text-muted font-black uppercase tracking-widest">
                                                Target: <span className="text-pt-text">{act.entityInstanceId}</span>
                                            </span>
                                        </div>
                                        <div className="px-3 py-1 bg-pt-bg border border-pt-border rounded-lg flex items-center gap-2">
                                            <User className="w-3 h-3 text-pt-text-muted opacity-30" />
                                            <span className="text-[9px] text-pt-text-muted font-black uppercase tracking-widest">
                                                Actor: <span className="text-pt-intent-success">{act.actor}</span>
                                            </span>
                                        </div>
                                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="flex items-center gap-2 text-[9px] font-black text-pt-intent-primary uppercase tracking-widest hover:brightness-110">
                                                Full Trace <ArrowRight size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {activity.length === 0 && (
                            <div className="text-center py-24 flex flex-col items-center gap-4 opacity-20">
                                <History size={40} />
                                <span className="text-[11px] font-black uppercase tracking-[0.5em]">Lattice Ledger Empty</span>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
