"use client";

import { useState } from "react";
import {
    Brain, Search, ChevronRight, CheckCircle2, Cpu, Shield,
    Lock, Globe, Activity, BarChart3, RefreshCw, Play, Clock,
    Layers, AlignLeft, Zap, Database, Eye, ArrowRight
} from "lucide-react";

// ── Hardcoded Model Chains ────────────────────────────────────────────────────
const MODEL_CHAINS = [
    {
        id: "chain-ops",
        name: "Operational Intelligence Chain",
        description: "Primary COA planning and threat assessment pipeline. Routes from LLM reasoning through computer vision imagery analysis and JCATS simulation.",
        classification: "SECRET",
        status: "ACTIVE",
        models: [
            { id: "m1", name: "GPT-4-AIP", type: "LARGE LANGUAGE MODEL", clearance: "SECRET", deployment: "HQ Data Center", status: "DEPLOYED", accuracy: null, latency: "~1.8s" },
            { id: "m2", name: "TargetID-CV-v2", type: "COMPUTER VISION", clearance: "SECRET", deployment: "SECRET Enclave-7", status: "DEPLOYED", accuracy: "94.1%", latency: "~0.4s" },
            { id: "m3", name: "JCATS-Sim", type: "SIMULATION", clearance: "SECRET", deployment: "HPC Cluster", status: "DEPLOYED", accuracy: null, latency: "~12s" },
            { id: "m4", name: "AFIRE-Effects", type: "EFFECTS PAIRING", clearance: "SECRET", deployment: "Restricted Enclave", status: "RECOMMEND-ONLY", accuracy: null, latency: "~0.9s" },
        ],
        handoffs: [
            { from: "GPT-4-AIP", to: "TargetID-CV-v2", trigger: "Imagery analysis requested", policy: "HP-03", verified: true },
            { from: "TargetID-CV-v2", to: "JCATS-Sim", trigger: "Target confirmed; simulation needed", policy: "HP-04", verified: true },
            { from: "JCATS-Sim", to: "AFIRE-Effects", trigger: "COA finalized; effects recommendation requested", policy: "HP-05", verified: true },
        ],
        inference24h: 1247,
        avgChainLatency: "~15.1s",
    },
    {
        id: "chain-nav",
        name: "Advanced Position & Navigation Chain",
        description: "Tactical edge position estimation using GPS-denied navigation models paired with terrain analysis.",
        classification: "TS//SI",
        status: "SHADOW",
        models: [
            { id: "m5", name: "GPT-4-AIP", type: "LARGE LANGUAGE MODEL", clearance: "TS//SI", deployment: "HQ Data Center", status: "DEPLOYED", accuracy: null, latency: "~1.8s" },
            { id: "m6", name: "NavDenied-v1", type: "NAVIGATION MODEL", clearance: "TS//SI", deployment: "Tactical Edge Node", status: "SHADOW", accuracy: "88.4%", latency: "~0.2s" },
            { id: "m7", name: "Terrain-CV-v1", type: "COMPUTER VISION", clearance: "SECRET", deployment: "Edge Node-3", status: "SHADOW", accuracy: "91.2%", latency: "~0.3s" },
        ],
        handoffs: [
            { from: "GPT-4-AIP", to: "NavDenied-v1", trigger: "GPS-denied navigation query", policy: "HP-11", verified: true },
            { from: "NavDenied-v1", to: "Terrain-CV-v1", trigger: "Terrain confirmation needed", policy: "HP-12", verified: true },
        ],
        inference24h: 84,
        avgChainLatency: "~2.3s",
    },
];

type Chain = typeof MODEL_CHAINS[0];
type ModelDef = Chain['models'][0];
type HandoffDef = Chain['handoffs'][0];

function ClassBadge({ level }: { level: string }) {
    const styles: Record<string, string> = {
        "TS//SI": "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30",
        SECRET: "bg-red-500/15 text-red-300 border border-red-500/30",
        UNCLASSIFIED: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
    };
    return <span className={`text-[9px] font-black px-1.5 py-0.5 rounded font-mono ${styles[level] || "bg-slate-700 text-slate-400 border border-slate-600"}`}>{level}</span>;
}

const STATUS_DOT: Record<string, string> = {
    DEPLOYED: "bg-emerald-400",
    SHADOW: "bg-amber-400",
    "RECOMMEND-ONLY": "bg-blue-400",
    ACTIVE: "bg-emerald-400",
};
const STATUS_TEXT: Record<string, string> = {
    DEPLOYED: "text-emerald-400",
    SHADOW: "text-amber-400",
    "RECOMMEND-ONLY": "text-blue-400",
    ACTIVE: "text-emerald-400",
};

function ModelNode({ model }: { model: ModelDef }) {
    return (
        <div className="bg-white/2 border border-white/10 rounded-xl p-3 w-44 shrink-0">
            <div className="flex items-center gap-1.5 mb-2">
                <div className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[model.status] || 'bg-slate-500'}`} />
                <span className={`text-[10px] font-bold font-mono ${STATUS_TEXT[model.status]}`}>{model.status}</span>
            </div>
            <p className="text-xs font-bold text-white font-mono mb-0.5">{model.name}</p>
            <p className="text-[10px] text-slate-500 mb-2">{model.type}</p>
            <ClassBadge level={model.clearance} />
            <div className="mt-2 space-y-0.5">
                <div className="text-[10px] text-slate-600 font-sans"><span className="text-slate-500">Deploy:</span> {model.deployment}</div>
                {model.accuracy && <div className="text-[10px] text-slate-600 font-sans"><span className="text-slate-500">Acc:</span> <span className="text-emerald-400">{model.accuracy}</span></div>}
                <div className="text-[10px] text-slate-600 font-sans"><span className="text-slate-500">Latency:</span> {model.latency}</div>
            </div>
        </div>
    );
}

function HandoffArrow({ handoff }: { handoff: HandoffDef }) {
    return (
        <div className="flex flex-col items-center justify-center shrink-0 w-20">
            <div className="w-full flex items-center">
                <div className="flex-1 h-px bg-blue-500/30" />
                <ArrowRight className="w-4 h-4 text-blue-400 shrink-0" />
            </div>
            <div className="mt-1 text-center">
                <code className="text-[9px] text-blue-400">{handoff.policy}</code>
                {handoff.verified && <div className="text-[9px] text-emerald-400 flex items-center justify-center gap-0.5 mt-0.5"><CheckCircle2 className="w-2.5 h-2.5" />verified</div>}
            </div>
            <p className="text-[9px] text-slate-700 text-center leading-tight mt-0.5">{handoff.trigger}</p>
        </div>
    );
}

export default function ModelOrchestration() {
    const [selectedChain, setSelectedChain] = useState<Chain>(MODEL_CHAINS[0]);

    return (
        <div className="h-full flex flex-col font-mono" style={{ background: "#060A12", color: "#CBD5E1" }}>

            {/* Classification Banner */}
            <div className="shrink-0 text-center py-1 text-[10px] font-black tracking-[0.2em] uppercase bg-red-700 text-white">
                ██ SECRET ██ MODEL ORCHESTRATION — SECURE HANDOFF MANAGEMENT ██
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/8 shrink-0" style={{ background: "rgba(0,0,0,0.4)" }}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-600/15 border border-purple-500/25 flex items-center justify-center">
                        <Brain className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-white">Model Orchestration</h1>
                        <p className="text-[10px] text-slate-500">Multi-model chains with secure handoff · Classification-scoped access</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-emerald-400 font-bold">{MODEL_CHAINS.filter(c => c.status === 'ACTIVE').length} ACTIVE</span>
                    <span className="text-amber-400 font-bold">{MODEL_CHAINS.filter(c => c.status === 'SHADOW').length} SHADOW</span>
                    <span className="text-blue-400 font-bold">{MODEL_CHAINS.reduce((a, c) => a + c.inference24h, 0).toLocaleString()} inferences / 24hr</span>
                </div>
            </div>

            <div className="flex-1 flex min-h-0">

                {/* Left: Chain list */}
                <div className="w-72 border-r border-white/8 flex flex-col shrink-0" style={{ background: "rgba(0,0,0,0.2)" }}>
                    <div className="p-3 border-b border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Model Chains ({MODEL_CHAINS.length})</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {MODEL_CHAINS.map(chain => (
                            <div key={chain.id} onClick={() => setSelectedChain(chain)}
                                className={`p-3 rounded-xl cursor-pointer border transition-all ${selectedChain.id === chain.id ? 'border-purple-500/25 bg-purple-500/8' : 'border-transparent hover:border-white/8 hover:bg-white/2'}`}>
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-2 h-2 rounded-full mt-0.5 ${STATUS_DOT[chain.status] || 'bg-slate-500'}`} />
                                        <code className={`text-[10px] font-bold ${STATUS_TEXT[chain.status]}`}>{chain.status}</code>
                                    </div>
                                    <ClassBadge level={chain.classification} />
                                </div>
                                <p className="text-xs font-bold text-white mb-1">{chain.name}</p>
                                <p className="text-[10px] text-slate-500 line-clamp-2 font-sans">{chain.description}</p>
                                <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-600">
                                    <span><span className="text-blue-400">{chain.models.length}</span> models</span>
                                    <span><span className="text-slate-400">{chain.inference24h}</span> inf/24h</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main: Chain Detail */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-base font-bold text-white">{selectedChain.name}</h2>
                            <ClassBadge level={selectedChain.classification} />
                            <code className={`text-[10px] font-bold ${STATUS_TEXT[selectedChain.status]}`}>{selectedChain.status}</code>
                        </div>
                        <p className="text-[11px] text-slate-500 font-sans">{selectedChain.description}</p>
                    </div>

                    {/* KPI Row */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: "Models in Chain", value: selectedChain.models.length, icon: Brain, color: "text-purple-400" },
                            { label: "Inferences (24h)", value: selectedChain.inference24h.toLocaleString(), icon: Activity, color: "text-blue-400" },
                            { label: "Avg Chain Latency", value: selectedChain.avgChainLatency, icon: Clock, color: "text-amber-400" },
                        ].map(k => (
                            <div key={k.label} className="bg-white/2 border border-white/6 rounded-xl p-4">
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-600 mb-2 uppercase tracking-wider font-sans">
                                    <k.icon className={`w-3.5 h-3.5 ${k.color}`} />{k.label}
                                </div>
                                <div className="text-xl font-bold text-white font-mono">{k.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Model Chain Diagram */}
                    <div>
                        <h3 className="text-[10px] text-slate-500 uppercase tracking-widest mb-4 font-sans">Model Chain — Secure Handoff Flow</h3>
                        <div className="p-5 border border-blue-500/15 rounded-xl overflow-x-auto" style={{ background: "rgba(37,99,235,0.04)" }}>
                            <div className="flex items-start gap-0 min-w-max">
                                {selectedChain.models.map((model, i) => (
                                    <div key={model.id} className="flex items-center">
                                        <ModelNode model={model} />
                                        {i < selectedChain.models.length - 1 && (
                                            <HandoffArrow handoff={selectedChain.handoffs[i]} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Handoff Detail Table */}
                    <div>
                        <h3 className="text-[10px] text-slate-500 uppercase tracking-widest mb-3 font-sans">Handoff Policies</h3>
                        <div className="border border-white/6 rounded-xl overflow-hidden">
                            <div className="grid grid-cols-4 px-4 py-2 bg-white/2 border-b border-white/6 text-[10px] text-slate-600 uppercase tracking-wider font-sans">
                                <span>From → To</span><span>Trigger Condition</span><span>Policy</span><span>Status</span>
                            </div>
                            {selectedChain.handoffs.map((h, i) => (
                                <div key={i} className="grid grid-cols-4 px-4 py-3 border-b border-white/4 last:border-0 items-center text-[11px] hover:bg-white/2 transition-colors">
                                    <div className="flex items-center gap-1">
                                        <code className="text-purple-300">{h.from}</code>
                                        <ArrowRight className="w-3 h-3 text-slate-600" />
                                        <code className="text-blue-300">{h.to}</code>
                                    </div>
                                    <span className="text-slate-400 font-sans text-[10px] pr-3">{h.trigger}</span>
                                    <code className="text-blue-400">{h.policy}</code>
                                    {h.verified
                                        ? <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" />Verified</span>
                                        : <span className="flex items-center gap-1 text-amber-400">Pending</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
