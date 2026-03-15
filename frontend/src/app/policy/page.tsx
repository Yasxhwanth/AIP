"use client";

import { useState } from "react";
import {
    Shield, Lock, Eye, CheckCircle2, AlertTriangle, Plus, ToggleLeft,
    ToggleRight, Brain, ChevronRight, Clock, Filter, X, Loader2,
    Globe, Database, Activity, Layers, Zap
} from "lucide-react";

// ── Hardcoded Policy Rules ────────────────────────────────────────────────────
const INITIAL_RULES = [
    {
        id: "P-01", name: "SECRET Layer Read — LLM", resource: "SECRET-LAYER", model: "GPT-4-AIP",
        action: "READ", effect: "ALLOW", priority: 1, enabled: true,
        notes: "Permits LLM to read SECRET-classified entities under active user clearance.",
    },
    {
        id: "P-02", name: "TS//SI Read — LLM (User authorized)", resource: "SatIntel-447", model: "GPT-4-AIP",
        action: "READ", effect: "ALLOW", priority: 2, enabled: true,
        notes: "Permits access to SatIntel-447 when operator holds TS//SI clearance.",
    },
    {
        id: "P-03", name: "OSINT Public Feed — Unrestricted", resource: "OSINT-Feed-*", model: "*",
        action: "READ", effect: "ALLOW", priority: 3, enabled: true,
        notes: "All models may read UNCLASSIFIED OSINT feeds without restriction.",
    },
    {
        id: "P-04", name: "Soldier Health Data — BLOCKED", resource: "SOLDIER-HEALTH-DATA", model: "*",
        action: "READ/WRITE", effect: "DENY", priority: 4, enabled: true,
        notes: "NO model may access health data. Handoff to human medical officer required.",
    },
    {
        id: "P-05", name: "COA Execution — Human handoff required", resource: "COA-EXECUTE-*", model: "*",
        action: "EXECUTE", effect: "DENY", priority: 5, enabled: true,
        notes: "AI cannot autonomously execute COAs. Human approval via Decision Inbox required.",
    },
    {
        id: "P-06", name: "SIGINT Raw Feed — Pending approval", resource: "SIGINT-RAW", model: "GPT-4-AIP",
        action: "READ", effect: "DENY", priority: 6, enabled: true,
        notes: "Policy P-11 governs SIGINT RAW access. Separate need-to-know approval required.",
    },
    {
        id: "P-07", name: "Force Disposition DB — COA Planning", resource: "ForceDisposition-DB", model: "GPT-4-AIP",
        action: "READ", effect: "ALLOW", priority: 7, enabled: true,
        notes: "LLM may read force disposition for COA generation tasks.",
    },
    {
        id: "P-08", name: "Effects Pairing — LLM Recommend Only", resource: "AFIRE-Effects", model: "AFIRE-Effects",
        action: "RECOMMEND", effect: "ALLOW", priority: 8, enabled: true,
        notes: "AFIRE model can recommend effects pairings. Final authorization requires human.",
    },
];

// ── Live Policy Evaluation Log ────────────────────────────────────────────────
const EVAL_LOG = [
    { id: "ev1", ts: "08:31:44", policy: "P-04", model: "GPT-4-AIP", resource: "SOLDIER-HEALTH-DATA", effect: "DENY", user: "OPR-001", sessionId: "SES-8821" },
    { id: "ev2", ts: "08:31:42", policy: "P-01", model: "GPT-4-AIP", resource: "FleetTracker-Live", effect: "ALLOW", user: "OPR-001", sessionId: "SES-8821" },
    { id: "ev3", ts: "08:31:40", policy: "P-02", model: "GPT-4-AIP", resource: "SatIntel-447", effect: "ALLOW", user: "OPR-001", sessionId: "SES-8821" },
    { id: "ev4", ts: "08:31:38", policy: "P-05", model: "*", resource: "COA-EXECUTE-ALPHA", effect: "DENY", user: "SYSTEM", sessionId: "SES-8821" },
    { id: "ev5", ts: "08:30:12", policy: "P-03", model: "GPT-4-AIP", resource: "OSINT-Feed-12", effect: "ALLOW", user: "OPR-002", sessionId: "SES-8819" },
    { id: "ev6", ts: "08:28:55", policy: "P-06", model: "GPT-4-AIP", resource: "SIGINT-RAW", effect: "DENY", user: "OPR-001", sessionId: "SES-8818" },
    { id: "ev7", ts: "08:27:30", policy: "P-07", model: "GPT-4-AIP", resource: "ForceDisposition-DB", effect: "ALLOW", user: "OPR-001", sessionId: "SES-8817" },
];

type Rule = typeof INITIAL_RULES[0];

function ClassBadge({ level }: { level: string }) {
    const styles: Record<string, string> = {
        "TS//SI": "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30",
        SECRET: "bg-red-500/15 text-red-300 border border-red-500/30",
        UNCLASSIFIED: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
    };
    return <span className={`text-[9px] font-black px-1.5 py-0.5 rounded font-mono ${styles[level] || "bg-slate-700 text-slate-400 border border-slate-600"}`}>{level}</span>;
}

function EffectBadge({ effect }: { effect: string }) {
    return (
        <span className={`text-[10px] font-black px-2 py-0.5 rounded font-mono tracking-wider ${effect === 'ALLOW' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'}`}>
            {effect}
        </span>
    );
}

// ─── Main Component ─────────────────────────────────────────
export default function PolicyEngine() {
    const [rules, setRules] = useState<Rule[]>(INITIAL_RULES);
    const [selectedRule, setSelectedRule] = useState<Rule | null>(INITIAL_RULES[0]);
    const [view, setView] = useState<'rules' | 'evallog'>('rules');

    const toggleRule = (id: string) => {
        setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
        if (selectedRule?.id === id) setSelectedRule(r => r ? { ...r, enabled: !r.enabled } : r);
    };

    const allowedCount = rules.filter(r => r.effect === 'ALLOW' && r.enabled).length;
    const deniedCount = rules.filter(r => r.effect === 'DENY' && r.enabled).length;

    return (
        <div className="h-full flex flex-col bg-pt-bg text-pt-text font-mono">
            {/* Classification Header */}
            <div className="shrink-0 text-center py-1 text-[10px] font-black tracking-[0.3em] uppercase bg-pt-intent-danger text-white">
                SECRET // NOFORN // AIP POLICY ENGINE ACCESS AUTHORIZED
            </div>

            {/* Tactical Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-pt-border bg-pt-bg-panel/50 backdrop-blur">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-pt-intent-primary/10 border border-pt-intent-primary/30 flex items-center justify-center shadow-lg shadow-pt-intent-primary/5">
                        <Shield className="w-5 h-5 text-pt-intent-primary" />
                    </div>
                    <div>
                        <h1 className="text-sm font-black uppercase tracking-widest text-pt-text">Governance & Policy</h1>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-[9px] font-bold text-pt-text-muted uppercase tracking-tighter">AI Guardrail Enforcement</span>
                            <div className="w-1 h-1 rounded-full bg-pt-border" />
                            <span className="text-[9px] font-mono text-pt-intent-primary">v2.4.9-STABLE</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4 bg-pt-bg px-4 py-2 border border-pt-border rounded shadow-inner">
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black text-pt-text-muted uppercase">Allowed</span>
                            <span className="text-xs font-mono font-black text-pt-intent-success">{allowedCount}</span>
                        </div>
                        <div className="w-px h-6 bg-pt-border" />
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black text-pt-text-muted uppercase">Blocked</span>
                            <span className="text-xs font-mono font-black text-pt-intent-danger">{deniedCount}</span>
                        </div>
                    </div>

                    <div className="flex p-1 bg-pt-bg-panel border border-pt-border rounded-lg">
                        {(['rules', 'evallog'] as const).map(v => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={`px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-all ${view === v ? 'bg-pt-intent-primary text-white shadow-lg' : 'text-pt-text-muted hover:text-pt-text'
                                    }`}
                            >
                                {v === 'rules' ? 'Policy Deck' : 'Audit Trail'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex min-h-0">
                {/* Left Rails: Rule Selector */}
                <div className="w-80 border-r border-pt-border bg-pt-bg-panel/30 flex flex-col shrink-0">
                    <div className="px-4 py-3 border-b border-pt-border flex items-center justify-between bg-pt-bg-panel/50">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-pt-text-muted">Directives</span>
                        <button className="w-6 h-6 rounded bg-pt-intent-primary/20 border border-pt-intent-primary/30 flex items-center justify-center hover:bg-pt-intent-primary/30 transition-all">
                            <Plus className="w-3.5 h-3.5 text-pt-intent-primary" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {rules.map(rule => (
                            <button
                                key={rule.id}
                                onClick={() => setSelectedRule(rule)}
                                className={`w-full text-left p-3 rounded border transition-all relative overflow-hidden group ${selectedRule?.id === rule.id
                                        ? 'bg-pt-intent-primary/10 border-pt-intent-primary/40'
                                        : 'bg-transparent border-transparent hover:bg-pt-bg-panel hover:border-pt-border'
                                    }`}
                            >
                                {selectedRule?.id === rule.id && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-pt-intent-primary shadow-lg shadow-pt-intent-primary/50" />
                                )}
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[9px] font-mono text-pt-intent-primary font-black uppercase">{rule.id}</span>
                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${rule.effect === 'ALLOW'
                                            ? 'bg-pt-intent-success/10 text-pt-intent-success border-pt-intent-success/30'
                                            : 'bg-pt-intent-danger/10 text-pt-intent-danger border-pt-intent-danger/30'
                                        }`}>
                                        {rule.effect}
                                    </span>
                                </div>
                                <div className="text-[11px] font-bold text-pt-text truncate">{rule.name}</div>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-[9px] font-mono text-pt-text-muted opacity-50 lowercase">{rule.resource}</span>
                                    <div className={`w-1.5 h-1.5 rounded-full ${rule.enabled ? 'bg-pt-intent-success animate-pulse' : 'bg-pt-border'}`} />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Center Rails: Detail View */}
                {view === 'rules' && selectedRule ? (
                    <div className="flex-1 overflow-y-auto p-8 bg-pt-bg space-y-8 custom-scrollbar">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-mono text-pt-intent-primary font-black">{selectedRule.id}</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-pt-border" />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${selectedRule.enabled ? 'text-pt-intent-success' : 'text-pt-text-muted'}`}>
                                        {selectedRule.enabled ? 'ACTIVE' : 'DEACTIVATED'}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-black text-pt-text uppercase tracking-tight">{selectedRule.name}</h2>
                                <p className="text-xs text-pt-text-muted leading-relaxed max-w-2xl">{selectedRule.notes}</p>
                            </div>

                            <button
                                onClick={() => toggleRule(selectedRule.id)}
                                className={`px-5 py-2 rounded font-black text-[10px] uppercase tracking-[0.2em] border transition-all ${selectedRule.enabled
                                        ? 'border-pt-intent-danger text-pt-intent-danger hover:bg-pt-intent-danger/10'
                                        : 'border-pt-intent-success text-pt-intent-success hover:bg-pt-intent-success/10'
                                    }`}
                            >
                                {selectedRule.enabled ? 'Revoke Directive' : 'Approve Directive'}
                            </button>
                        </div>

                        {/* Attribute Grid */}
                        <div className="grid grid-cols-4 gap-4">
                            {[
                                { label: "Target Resource", value: selectedRule.resource, icon: Database },
                                { label: "Executing Model", value: selectedRule.model, icon: Brain },
                                { label: "Operation", value: selectedRule.action, icon: Zap },
                                { label: "Authority Level", value: `LEVEL-${selectedRule.priority}`, icon: Shield },
                            ].map((f, i) => (
                                <div key={i} className="bg-pt-bg-panel border border-pt-border p-4 rounded shadow-sm hover:border-pt-border-hover transition-colors">
                                    <div className="flex items-center gap-2 text-[8px] font-black text-pt-text-muted uppercase tracking-widest mb-2">
                                        <f.icon className="w-3 h-3" />
                                        {f.label}
                                    </div>
                                    <div className="text-[11px] font-mono font-bold text-pt-text truncate">{f.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Impact Assessment */}
                        <div className={`p-6 border rounded-lg flex gap-4 ${selectedRule.effect === 'ALLOW'
                                ? 'bg-pt-intent-success/5 border-pt-intent-success/20'
                                : 'bg-pt-intent-danger/5 border-pt-intent-danger/20'
                            }`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${selectedRule.effect === 'ALLOW'
                                    ? 'bg-pt-intent-success/10 border-pt-intent-success/30 text-pt-intent-success'
                                    : 'bg-pt-intent-danger/10 border-pt-intent-danger/30 text-pt-intent-danger'
                                }`}>
                                {selectedRule.effect === 'ALLOW' ? <CheckCircle2 size={20} /> : <Lock size={20} />}
                            </div>
                            <div>
                                <h3 className="text-[11px] font-black uppercase tracking-widest text-pt-text mb-1">Impact Analysis</h3>
                                <p className="text-xs text-pt-text-muted font-sans leading-relaxed">
                                    {selectedRule.effect === 'ALLOW'
                                        ? `AIP Core will permit "${selectedRule.model}" to perform ${selectedRule.action} operations on "${selectedRule.resource}". All interactions are cryptographically signed and archived for audit.`
                                        : `Security barrier will block all ${selectedRule.action} attempts from "${selectedRule.model}" against "${selectedRule.resource}". Violation alerts will be dispatched to Strategic Operations.`}
                                </p>
                            </div>
                        </div>

                        {/* Recent Evaluations */}
                        <div className="space-y-4">
                            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-pt-text-muted">Telemetry Log (Recent Evaluations)</h3>
                            <div className="bg-pt-bg-panel border border-pt-border rounded-lg overflow-hidden shadow-inner">
                                {EVAL_LOG.filter(e => e.policy === selectedRule.id).length > 0 ? (
                                    EVAL_LOG.filter(e => e.policy === selectedRule.id).slice(0, 5).map(e => (
                                        <div key={e.id} className="grid grid-cols-5 px-5 py-3 border-b border-pt-border last:border-0 hover:bg-pt-bg-panel/50 transition-colors items-center">
                                            <span className="text-[10px] font-mono text-pt-text-muted">{e.ts}</span>
                                            <span className={`text-[9px] font-black uppercase ${e.effect === 'ALLOW' ? 'text-pt-intent-success' : 'text-pt-intent-danger'}`}>{e.effect}</span>
                                            <span className="text-[10px] font-mono text-pt-text truncate">{e.model}</span>
                                            <span className="text-[10px] font-mono text-pt-text-muted">{e.user}</span>
                                            <span className="text-[9px] font-mono text-pt-text-muted text-right uppercase opacity-40">{e.sessionId}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center text-[10px] text-pt-text-muted uppercase tracking-widest opacity-30 italic">No evaluated events for this Directive</div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-6 bg-pt-bg custom-scrollbar">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex flex-col gap-1">
                                <h2 className="text-sm font-black uppercase tracking-widest text-pt-text">Policy Audit Trail</h2>
                                <p className="text-[10px] text-pt-text-muted font-mono lowercase">monitoring real-time evaluation flow</p>
                            </div>
                            <div className="flex items-center gap-2 bg-pt-intent-success/10 px-3 py-1 border border-pt-intent-success/20 rounded">
                                <Activity className="w-3.5 h-3.5 text-pt-intent-success animate-pulse" />
                                <span className="text-[9px] font-black text-pt-intent-success uppercase tracking-widest">Live Telemetry</span>
                            </div>
                        </div>

                        <div className="bg-pt-bg-panel border border-pt-border rounded-xl overflow-hidden shadow-2xl">
                            <div className="grid grid-cols-7 px-5 py-3 bg-pt-bg border-b border-pt-border text-[8px] font-black text-pt-text-muted uppercase tracking-[0.2em]">
                                <span>Timestamp</span><span>Policy ID</span><span>Subject</span><span>Object</span><span>Action</span><span>Identity</span><span>Token</span>
                            </div>
                            <div className="divide-y divide-pt-border">
                                {EVAL_LOG.map(e => (
                                    <div key={e.id} className="grid grid-cols-7 px-5 py-3 hover:bg-pt-bg-panel/50 text-[10px] items-center transition-colors font-mono">
                                        <span className="text-pt-text-muted">{e.ts}</span>
                                        <span className="text-pt-intent-primary font-bold">{e.policy}</span>
                                        <span className="text-pt-text truncate pr-2">{e.model}</span>
                                        <span className="text-pt-text truncate pr-2">{e.resource}</span>
                                        <span className={`font-black uppercase tracking-tighter ${e.effect === 'ALLOW' ? 'text-pt-intent-success' : 'text-pt-intent-danger'}`}>{e.effect}</span>
                                        <span className="text-pt-text-muted">{e.user}</span>
                                        <span className="text-pt-text-muted opacity-40 text-right">{e.sessionId}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
