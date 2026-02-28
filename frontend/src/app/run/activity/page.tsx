"use client";

import { useRuntimeStore } from "@/store/runtimeStore";
import { History, Clock, FileJson } from "lucide-react";

export default function ActivityLogPage() {
    const { activity } = useRuntimeStore();

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-[#060A12] text-slate-300 font-sans p-8">
            <div className="max-w-4xl mx-auto w-full space-y-6">

                <div className="flex justify-between items-end mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-blue-400 mb-2">
                            <History className="w-5 h-5" />
                            <span className="text-[10px] uppercase font-black tracking-[0.2em]">Immutable Ledger</span>
                        </div>
                        <h1 className="text-3xl font-black text-white">Global Activity Log</h1>
                        <p className="text-sm text-slate-500 mt-1">Immutable tracking of all ontology alterations, telemetry updates, and AI actions.</p>
                    </div>
                </div>

                <div className="bg-[#0B1220] border border-white/5 rounded-2xl p-6 shadow-xl space-y-8">
                    {activity.map((act, idx) => (
                        <div key={act.id} className="relative pl-8">
                            {idx !== activity.length - 1 && (
                                <div className="absolute left-[15px] top-6 bottom-[-32px] w-px bg-white/10" />
                            )}
                            <div className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#0B1220] ${act.type === 'ai_triggered' ? 'bg-blue-500' :
                                    act.type === 'action_executed' ? 'bg-emerald-500' :
                                        act.type === 'case_created' ? 'bg-amber-500' :
                                            'bg-slate-600'
                                }`}>
                                <div className="w-2.5 h-2.5 bg-[#0B1220] rounded-full" />
                            </div>

                            <div className="flex justify-between items-start mb-1">
                                <div className="text-sm font-bold text-slate-200">{act.title}</div>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                                    <Clock className="w-3 h-3" /> {new Date(act.timestamp).toLocaleString()}
                                </div>
                            </div>

                            <div className="text-xs text-slate-400 leading-relaxed mb-3 max-w-2xl">{act.description}</div>

                            <div className="flex flex-wrap items-center gap-3">
                                <span className="text-[10px] px-2 py-1 bg-white/5 border border-white/10 rounded flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider">
                                    <FileJson className="w-3 h-3 text-blue-400" /> Target: {act.entityInstanceId}
                                </span>
                                <span className="text-[10px] px-2 py-1 bg-white/5 border border-white/10 rounded text-slate-400 font-bold uppercase tracking-wider">
                                    Actor: <span className="text-white">{act.actor}</span>
                                </span>
                                <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-1 rounded font-mono border border-blue-500/20 uppercase">
                                    {act.type.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                    ))}
                    {activity.length === 0 && (
                        <div className="text-center text-sm text-slate-500 italic py-12">System log is entirely empty.</div>
                    )}
                </div>

            </div>
        </div>
    );
}
