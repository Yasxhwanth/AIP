"use client";

import { useState } from "react";
import { useBuilderStore } from "@/store/builderStore";
import {
    Rocket, CheckCircle2, AlertTriangle, AlertCircle,
    History, RotateCcw, GitBranch, ArrowRight
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function PublishPage() {
    const router = useRouter();
    const { validateSystem, version } = useBuilderStore();
    const [publishStatus, setPublishStatus] = useState<'idle' | 'publishing' | 'done'>('idle');

    const validation = validateSystem();
    const isPublishable = validation.status !== 'errors';

    const handlePublish = () => {
        if (!isPublishable) return;
        setPublishStatus('publishing');
        setTimeout(() => {
            setPublishStatus('done');
            useBuilderStore.setState({ version: 'v1.0' });
            setTimeout(() => router.push('/run'), 1500);
        }, 2000);
    };

    return (
        <div className="flex w-full h-full font-mono bg-[#060D19] text-slate-300">

            {/* Main Validation Space */}
            <div className="flex-1 flex flex-col min-w-0 p-8 overflow-y-auto">
                <div className="max-w-4xl mx-auto w-full space-y-8">

                    <div className="text-center space-y-2 mb-12">
                        <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
                            <Rocket className="w-8 h-8 text-blue-400" />
                        </div>
                        <h1 className="text-3xl font-black text-white font-sans">Deployment & Versioning</h1>
                        <p className="text-sm text-slate-500 font-sans">Validate your configuration and deploy the operational environment.</p>
                    </div>

                    {/* Pre-flight Checklist */}
                    <div className="bg-[#0B1220] border border-white/10 rounded-2xl p-6 shadow-xl">
                        <h2 className="text-xs uppercase font-bold text-slate-400 tracking-widest mb-6 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Pre-Flight System Validation
                        </h2>

                        <div className="space-y-4">
                            {validation.issues.length === 0 ? (
                                <div className="p-8 text-center text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 rounded-xl font-sans text-sm">
                                    All systems go! Ontology, Actions, AI Agents, and Application bindings are correctly configured and verified.
                                </div>
                            ) : (
                                validation.issues.map((issue, i) => (
                                    <div key={i} className={`p-4 rounded-xl border flex items-start gap-3 ${issue.type === 'error' ? 'bg-red-500/5 border-red-500/20' : 'bg-amber-500/5 border-amber-500/20'
                                        }`}>
                                        {issue.type === 'error' ? (
                                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                        ) : (
                                            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                        )}
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs font-bold uppercase ${issue.type === 'error' ? 'text-red-400' : 'text-amber-400'}`}>
                                                    [{issue.step}] {issue.type}
                                                </span>
                                            </div>
                                            <div className="text-sm text-slate-300 font-sans">{issue.message}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                            <div className="text-sm font-sans text-slate-400">
                                Current Version: <code className="text-blue-300 bg-white/5 px-2 py-0.5 rounded ml-1">{version.toUpperCase()}</code>
                            </div>

                            <button
                                onClick={handlePublish}
                                disabled={!isPublishable || publishStatus !== 'idle'}
                                className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-lg ${isPublishable
                                        ? publishStatus === 'idle'
                                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 hover:scale-105'
                                            : 'bg-emerald-600 text-white cursor-wait pointer-events-none'
                                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5 shadow-none'
                                    }`}>
                                {publishStatus === 'idle' ? (
                                    <><Rocket className="w-4 h-4" /> Publish Application</>
                                ) : publishStatus === 'publishing' ? (
                                    <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Publishing...</>
                                ) : (
                                    <><CheckCircle2 className="w-4 h-4" /> Published to Runtime</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel: Version History */}
            <div className="w-80 border-l border-white/6 bg-[#080F1A] flex flex-col shrink-0">
                <div className="p-4 border-b border-white/6 flex gap-2 items-center">
                    <History className="w-4 h-4 text-blue-400" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-blue-400 mt-0.5">Version History</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
                    {/* Activity line thread */}
                    <div className="absolute left-7 top-4 bottom-4 w-px bg-white/5 z-0" />

                    <div className="relative z-10 flex gap-4 opacity-50">
                        <div className="w-6 h-6 rounded border border-white/20 bg-[#0B1220] flex items-center justify-center shrink-0 mt-0.5">
                            <div className="w-2 h-2 rounded-full bg-slate-500" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-300 font-sans">Draft Configuration</span>
                                <span className="text-[10px] text-slate-500">Current</span>
                            </div>
                            <div className="text-xs text-slate-500 font-sans mt-0.5">In-progress changes to Ontology and AI Agents.</div>
                        </div>
                    </div>

                    {version === 'v1.0' && (
                        <div className="relative z-10 flex gap-4">
                            <div className="w-6 h-6 rounded border border-blue-500/40 bg-blue-600/20 flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_10px_rgba(37,99,235,0.2)]">
                                <div className="w-2 h-2 rounded-full bg-blue-400" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-blue-400 font-sans">Version 1.0</span>
                                    <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/20">LIVE</span>
                                </div>
                                <div className="text-xs text-slate-400 font-sans mt-0.5 mb-2">Deployed successfully.</div>

                                <button className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-slate-300 transition-colors uppercase font-bold tracking-wider px-2 py-1 bg-white/5 rounded border border-white/5">
                                    <RotateCcw className="w-3 h-3" /> Rollback to V1.0
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="relative z-10 flex gap-4 opacity-30 mt-8 pt-4 border-t border-dashed border-white/10">
                        <div className="w-6 h-6 rounded border border-white/10 bg-[#060D19] flex items-center justify-center shrink-0 mt-0.5">
                            <GitBranch className="w-3.5 h-3.5 text-slate-600" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-slate-500 font-sans">Platform Initialized</div>
                            <div className="text-xs text-slate-600 font-sans mt-0.5">Empty workspace created.</div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
