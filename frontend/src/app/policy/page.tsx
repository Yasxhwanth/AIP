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

export default function PolicyEngine() {
    const [rules, setRules] = useState<Rule[]>(INITIAL_RULES);
    const [selectedRule, setSelectedRule] = useState<Rule | null>(INITIAL_RULES[0]);
    const [view, setView] = useState<'rules' | 'evallog'>('rules');

    const toggleRule = (id: string) => {
        setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
        if (selectedRule?.id === id) setSelectedRule(r => r ? { ...r, enabled: !r.enabled } : r);
    };

    const allowed = rules.filter(r => r.effect === 'ALLOW' && r.enabled).length;
    const denied = rules.filter(r => r.effect === 'DENY' && r.enabled).length;

    return (
        <div className="h-full flex flex-col font-mono" style={{ background: "#060A12", color: "#CBD5E1" }}>

            {/* Classification Banner */}
            <div className="shrink-0 text-center py-1 text-[10px] font-black tracking-[0.2em] uppercase bg-red-700 text-white">
                ██ SECRET ██ POLICY ENGINE ACCESS — AUTHORIZED ADMINISTRATORS ONLY ██
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/8" style={{ background: "rgba(0,0,0,0.4)" }}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-600/15 border border-blue-500/25 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-white">Policy Engine</h1>
                        <p className="text-[10px] text-slate-500">AI access controls, guardrails, and safe handoff rules</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3 text-[11px]">
                        <span className="text-emerald-400 font-bold">{allowed} ALLOW</span>
                        <span className="text-red-400 font-bold">{denied} DENY</span>
                        <span className="text-slate-600">{rules.length} total rules</span>
                    </div>
                    <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/8">
                        {(['rules', 'evallog'] as const).map(v => (
                            <button key={v} onClick={() => setView(v)}
                                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${view === v ? 'bg-white/10 text-white' : 'text-slate-600 hover:text-slate-400'}`}>
                                {v === 'rules' ? 'POLICY RULES' : 'EVAL LOG'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 flex min-h-0">

                {/* Left: Rule list */}
                <div className="w-80 border-r border-white/8 flex flex-col shrink-0" style={{ background: "rgba(0,0,0,0.2)" }}>
                    <div className="p-3 border-b border-white/5 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest">Access Rules</span>
                        <button className="w-6 h-6 rounded bg-blue-600/20 border border-blue-500/20 flex items-center justify-center hover:bg-blue-600/30 transition-all">
                            <Plus className="w-3.5 h-3.5 text-blue-400" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {rules.map(rule => (
                            <div key={rule.id}
                                onClick={() => setSelectedRule(rule)}
                                className={`p-3 rounded-xl cursor-pointer border transition-all ${selectedRule?.id === rule.id ? 'border-blue-500/25 bg-blue-500/8' : 'border-transparent hover:border-white/8 hover:bg-white/2'}`}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <code className="text-[10px] text-blue-400">{rule.id}</code>
                                    <EffectBadge effect={rule.effect} />
                                </div>
                                <p className="text-[11px] text-slate-300 leading-snug mb-1.5">{rule.name}</p>
                                <div className="flex items-center justify-between">
                                    <code className="text-[10px] text-slate-600">{rule.resource}</code>
                                    <button onClick={e => { e.stopPropagation(); toggleRule(rule.id); }}
                                        className={`transition-colors ${rule.enabled ? 'text-emerald-400' : 'text-slate-700'}`}>
                                        {rule.enabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Center: Rule detail */}
                {view === 'rules' && selectedRule && (
                    <div className="flex-1 overflow-y-auto p-6 space-y-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <code className="text-sm text-blue-400">{selectedRule.id}</code>
                                    <EffectBadge effect={selectedRule.effect} />
                                    {!selectedRule.enabled && <span className="text-[10px] text-slate-600 font-sans">(DISABLED)</span>}
                                </div>
                                <h2 className="text-lg font-bold text-white font-sans">{selectedRule.name}</h2>
                                <p className="text-[11px] text-slate-500 mt-0.5 font-sans">{selectedRule.notes}</p>
                            </div>
                            <button onClick={() => toggleRule(selectedRule.id)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold border font-sans transition-all ${selectedRule.enabled ? 'border-red-500/25 text-red-400 hover:bg-red-500/10' : 'border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/10'}`}>
                                {selectedRule.enabled ? 'Disable Rule' : 'Enable Rule'}
                            </button>
                        </div>

                        {/* Rule grid */}
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: "Resource", value: selectedRule.resource, icon: Database },
                                { label: "Model", value: selectedRule.model, icon: Brain },
                                { label: "Action", value: selectedRule.action, icon: Zap },
                                { label: "Priority", value: `P-${selectedRule.priority} (${selectedRule.priority === 1 ? 'highest' : 'normal'})`, icon: Layers },
                            ].map(f => (
                                <div key={f.label} className="bg-white/2 border border-white/6 rounded-xl p-4">
                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-600 mb-1.5 uppercase tracking-wider font-sans">
                                        <f.icon className="w-3.5 h-3.5" />{f.label}
                                    </div>
                                    <code className="text-sm text-white">{f.value}</code>
                                </div>
                            ))}
                        </div>

                        {/* Effect Preview */}
                        <div className={`rounded-xl border p-4 ${selectedRule.effect === 'ALLOW' ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                            <h3 className="text-[10px] text-slate-500 uppercase tracking-wider mb-3 font-sans">Effect Preview</h3>
                            <div className="flex items-start gap-3">
                                {selectedRule.effect === 'ALLOW'
                                    ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                    : <Lock className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
                                <p className="text-sm text-slate-300 font-sans leading-relaxed">
                                    {selectedRule.effect === 'ALLOW'
                                        ? `Model "${selectedRule.model}" is PERMITTED to ${selectedRule.action} resource "${selectedRule.resource}". Access logged to audit trail.`
                                        : `NO model matching "${selectedRule.model}" may ${selectedRule.action} resource "${selectedRule.resource}". Request blocked and logged. Operator notified.`}
                                </p>
                            </div>
                        </div>

                        {/* Recent evaluations for this rule */}
                        <div>
                            <h3 className="text-[10px] text-slate-500 uppercase tracking-wider mb-3 font-sans">Recent Evaluations</h3>
                            <div className="border border-white/6 rounded-xl overflow-hidden">
                                {EVAL_LOG.filter(e => e.policy === selectedRule.id).slice(0, 4).map(e => (
                                    <div key={e.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-white/4 last:border-0 hover:bg-white/2 transition-colors">
                                        <EffectBadge effect={e.effect} />
                                        <code className="text-[11px] text-slate-500">{e.ts} UTC</code>
                                        <code className="text-[11px] text-slate-400 flex-1 truncate">{e.model}</code>
                                        <code className="text-[10px] text-slate-600">{e.sessionId}</code>
                                    </div>
                                ))}
                                {EVAL_LOG.filter(e => e.policy === selectedRule.id).length === 0 && (
                                    <div className="py-4 text-center text-[11px] text-slate-700 font-sans">No recent evaluations</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Eval Log View */}
                {view === 'evallog' && (
                    <div className="flex-1 overflow-y-auto p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xs font-bold text-white font-sans">Live Policy Evaluation Log</h2>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[10px] text-emerald-400 font-mono">STREAMING</span>
                            </div>
                        </div>
                        <div className="border border-white/6 rounded-xl overflow-hidden">
                            <div className="grid grid-cols-7 px-4 py-2 bg-white/2 border-b border-white/6 text-[10px] text-slate-500 uppercase tracking-wider font-sans">
                                <span>Time</span><span>Policy</span><span>Model</span><span>Resource</span><span>Effect</span><span>User</span><span>Session</span>
                            </div>
                            {EVAL_LOG.map(e => (
                                <div key={e.id} className="grid grid-cols-7 px-4 py-3 border-b border-white/4 last:border-0 hover:bg-white/2 text-[11px] items-center transition-colors">
                                    <code className="text-slate-600">{e.ts}</code>
                                    <code className="text-blue-400">{e.policy}</code>
                                    <code className="text-slate-400 truncate">{e.model}</code>
                                    <code className="text-slate-400 truncate">{e.resource}</code>
                                    <EffectBadge effect={e.effect} />
                                    <code className="text-slate-500">{e.user}</code>
                                    <code className="text-slate-600">{e.sessionId}</code>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
