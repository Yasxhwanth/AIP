"use client";

import React, { useState, useRef, useEffect } from "react";
import {
    Send, Brain, Shield, Eye, Lock, ChevronRight, CheckCircle2,
    AlertTriangle, Zap, MapPin, BarChart3, Globe, Clock,
    ChevronDown, ChevronUp, X, Activity, Cpu, Layers, Terminal
} from "lucide-react";
import dynamic from "next/dynamic";
import { MetricsDashboard } from "@/components/MetricsDashboard";
import { ApiClient } from "@/lib/apiClient";

const BattlefieldOverview = dynamic(
    () => import("@/components/BattlefieldOverview").then(m => ({ default: m.BattlefieldOverview })),
    { ssr: false }
);

// ── Types ─────────────────────────────────────────────────────────────────────
type CanvasMode = 'map' | 'metrics' | 'coa' | 'imagery' | 'tail';

interface DataSource {
    id: string;
    classification: string;
    type: string;
    recordsRead: number;
}
interface PolicyEvent {
    action: 'ALLOW' | 'BLOCK';
    resource: string;
    reason: string;
}
interface ModelHandoff {
    chain: string[];
    handoffVerified: boolean;
}
interface AiMessage {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    timestamp: string;
    classification?: string;
    sources?: DataSource[];
    policyEvents?: PolicyEvent[];
    modelChain?: ModelHandoff;
    canvasMode?: CanvasMode;
    coa?: COACard[];
    confidence?: number;
}
interface COACard {
    id: string;
    title: string;
    risk: string;
    confidence: number;
    actions: string[];
}

// ── Classification Badge ──────────────────────────────────────────────────────
function ClassBadge({ level }: { level: string }) {
    const styles: Record<string, string> = {
        "TS//SI": "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30",
        "SECRET": "bg-red-500/15 text-red-300 border border-red-500/30",
        "UNCLASSIFIED": "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
    };
    return (
        <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded font-mono ${styles[level] || "bg-slate-700/50 text-slate-400 border border-slate-500/30"}`}>
            {level}
        </span>
    );
}

// ── AI Response Engine ────────────────────────────────────────────────────────
function computeAIResponse(input: string, currentCanvas: CanvasMode): AiMessage {
    const q = input.toLowerCase();
    const ts = new Date().toISOString().substring(11, 19) + "Z";
    const id = `ai-${Date.now()}`;

    // Threats / map / geo
    if (q.match(/\b(threat|position|grid|map|location|where|geo|hostile|enemy|force)\b/)) {
        return {
            id, role: 'assistant', timestamp: ts,
            classification: "SECRET",
            text: "Traversed FleetTracker-Live and SatIntel-447. Threat actor concentration in Grid 47-N increased 34% over the past 6 hours. Three correlated flight path anomalies detected. Geo canvas updated with current tracks and classification-marked entity overlays.",
            sources: [
                { id: "SatIntel-447", classification: "TS//SI", type: "SIGINT", recordsRead: 142 },
                { id: "FleetTracker-Live", classification: "SECRET", type: "GEOINT", recordsRead: 312 },
                { id: "OSINT-Feed-12", classification: "UNCLASSIFIED", type: "OSINT", recordsRead: 47 },
            ],
            policyEvents: [
                { action: 'ALLOW', resource: "SatIntel-447", reason: "User clearance TS//SI verified" },
                { action: 'ALLOW', resource: "FleetTracker-Live", reason: "Group policy GP-03 permits SECRET read" },
            ],
            modelChain: { chain: ["GPT-4-AIP", "TargetID-CV-v2"], handoffVerified: true },
            canvasMode: 'map',
            confidence: 94.2,
        };
    }

    // COA
    if (q.match(/\b(coa|course|action|plan|recommend|option|maneuver|strategy)\b/)) {
        return {
            id, role: 'assistant', timestamp: ts,
            classification: "SECRET",
            text: "Generated three Courses of Action (COA) based on current threat assessment and force disposition. Each COA has been scored for risk and confidence using JCATS simulation model. Human approval required before execution.",
            sources: [
                { id: "ForceDisposition-DB", classification: "SECRET", type: "ORBAT", recordsRead: 89 },
                { id: "ThreatAssessment-Live", classification: "SECRET", type: "ALLSOURCE", recordsRead: 56 },
            ],
            policyEvents: [
                { action: 'ALLOW', resource: "ForceDisposition-DB", reason: "COA planning authorized (GP-07)" },
                { action: 'BLOCK', resource: "SOLDIER-HEALTH-DATA", reason: "Policy P-04: LLM access denied" },
            ],
            modelChain: { chain: ["GPT-4-AIP", "JCATS-Sim", "AFIRE-Effects"], handoffVerified: true },
            canvasMode: 'coa',
            confidence: 91.0,
            coa: [
                { id: "COA-ALPHA", title: "Reposition convoy WP-2291 via Route BRAVO — avoids Grid 47-N", risk: "LOW", confidence: 89, actions: ["Move WP-2291", "Alert Route BRAVO QRF", "ISR coverage"] },
                { id: "COA-BRAVO", title: "Deploy UAV ISR to Grid 47-N for 4-hour continuous surveillance", risk: "LOW", confidence: 94, actions: ["Launch UAV-Raven-3", "Relay feed to TOC", "Set alert threshold"] },
                { id: "COA-CHARLIE", title: "Escalate threat actors to TIER-1 watch — increase patrol frequency", risk: "MEDIUM", confidence: 82, actions: ["Update TIER-1 list", "Brief patrol commanders", "Set 2hr check-in"] },
            ],
        };
    }

    // Simulation
    if (q.match(/\b(simulat|model|predict|forecast|run|jcats|scenario)\b/)) {
        return {
            id, role: 'assistant', timestamp: ts,
            classification: "SECRET",
            text: "JCATS simulation executed across 500 Monte Carlo runs for the current operational scenario. Highest-probability outcome: 78% probability of threat actor advance in next 6-12 hours without friendly force repositioning. Simulation results visualized on metrics canvas.",
            sources: [
                { id: "JCATS-Terrain-DB", classification: "UNCLASSIFIED", type: "TERRAIN", recordsRead: 1024 },
                { id: "ThreatModel-v3", classification: "SECRET", type: "THREAT", recordsRead: 203 },
            ],
            policyEvents: [
                { action: 'ALLOW', resource: "JCATS-Terrain-DB", reason: "Simulation authorized (SIM-POLICY-01)" },
                { action: 'ALLOW', resource: "ThreatModel-v3", reason: "Need-to-know verified" },
            ],
            modelChain: { chain: ["GPT-4-AIP", "JCATS-Sim"], handoffVerified: true },
            canvasMode: 'metrics',
            confidence: 78.4,
        };
    }

    // Policy check / access
    if (q.match(/\b(policy|access|can you see|permission|block|restrict|classified|clearance)\b/)) {
        return {
            id, role: 'assistant', timestamp: ts,
            classification: "UNCLASSIFIED",
            text: "Current session policy state retrieved from Policy Engine. I have read access to SECRET and below resources under your active session. SOLDIER-HEALTH-DATA is blocked (Policy P-04). SIGINT raw feeds require separate approval under Policy P-11.",
            sources: [
                { id: "PolicyEngine-v2", classification: "UNCLASSIFIED", type: "POLICY", recordsRead: 12 },
            ],
            policyEvents: [
                { action: 'ALLOW', resource: "SECRET-LAYER", reason: "Active user clearance" },
                { action: 'BLOCK', resource: "SOLDIER-HEALTH-DATA", reason: "Policy P-04 — LLM restricted" },
                { action: 'BLOCK', resource: "SIGINT-RAW", reason: "Policy P-11 — Pending approval" },
            ],
            modelChain: { chain: ["GPT-4-AIP"], handoffVerified: true },
            canvasMode: currentCanvas,
            confidence: 100,
        };
    }

    // Metrics / stats
    if (q.match(/\b(stat|metric|chart|kpi|performance|analytic|report|dashboard)\b/)) {
        return {
            id, role: 'assistant', timestamp: ts,
            classification: "SECRET",
            text: "Operational metrics retrieved from real-time data foundation. Fleet readiness at 91.2%, down 2.1% from yesterday. Supplier convoy risk elevated: 2 convoys in amber status. AI model inference throughput: 1,247 decisions in last 24hr with 96.8% average confidence.",
            sources: [
                { id: "OpsMetrics-Live", classification: "SECRET", type: "METRICS", recordsRead: 847 },
                { id: "FleetTracker-Live", classification: "SECRET", type: "GEOINT", recordsRead: 312 },
            ],
            policyEvents: [
                { action: 'ALLOW', resource: "OpsMetrics-Live", reason: "Metrics access authorized" },
            ],
            modelChain: { chain: ["GPT-4-AIP"], handoffVerified: true },
            canvasMode: 'metrics',
            confidence: 99.1,
        };
    }

    // Default
    return {
        id, role: 'assistant', timestamp: ts,
        classification: "UNCLASSIFIED",
        text: "Ready to assist. I can query classified data sources to provide threat assessments, generate Courses of Action, run simulations, or display operational metrics. All responses are policy-checked and logged to the secure audit trail. What do you need?",
        sources: [],
        policyEvents: [],
        modelChain: { chain: ["GPT-4-AIP"], handoffVerified: true },
        canvasMode: currentCanvas,
        confidence: 100,
    };
}

// ── Source Citations Component ─────────────────────────────────────────────────
function SourceList({ sources }: { sources: DataSource[] }) {
    if (!sources.length) return null;
    return (
        <div className="mt-2 space-y-1">
            <span className="text-[10px] text-slate-600 uppercase tracking-widest font-mono block">Data Sources</span>
            {sources.map(s => (
                <div key={s.id} className="flex items-center gap-2 py-1 px-2 rounded border border-white/6 bg-white/2">
                    <Eye className="w-3 h-3 text-slate-600 shrink-0" />
                    <code className="text-[11px] text-slate-300">{s.id}</code>
                    <ClassBadge level={s.classification} />
                    <span className="text-[10px] text-slate-600 font-mono ml-auto">{s.type} · {s.recordsRead} records</span>
                </div>
            ))}
        </div>
    );
}

// ── Policy Events Component ────────────────────────────────────────────────────
function PolicyEvents({ events }: { events: PolicyEvent[] }) {
    if (!events.length) return null;
    return (
        <div className="mt-2 space-y-1">
            <span className="text-[10px] text-slate-600 uppercase tracking-widest font-mono block">Policy Check</span>
            {events.map((e, i) => (
                <div key={i} className={`flex items-center gap-2 py-1 px-2 rounded border text-[11px] font-mono ${e.action === 'ALLOW' ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' : 'border-red-500/20 bg-red-500/5 text-red-400'}`}>
                    {e.action === 'ALLOW' ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <Lock className="w-3 h-3 shrink-0" />}
                    <span className="font-bold">{e.action}</span>
                    <span className="text-slate-500">·</span>
                    <code>{e.resource}</code>
                    <span className="ml-auto text-[10px] text-slate-600 font-sans">{e.reason}</span>
                </div>
            ))}
        </div>
    );
}

// ── Model Chain Component ──────────────────────────────────────────────────────
function ModelChainDisplay({ chain }: { chain: ModelHandoff }) {
    return (
        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-slate-600 uppercase tracking-widest font-mono">Model Chain:</span>
            {chain.chain.map((m, i) => (
                <div key={m} className="flex items-center gap-1">
                    <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300 font-mono">{m}</span>
                    {i < chain.chain.length - 1 && <ChevronRight className="w-3 h-3 text-slate-600" />}
                </div>
            ))}
            {chain.handoffVerified && (
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-0.5 ml-1">
                    <CheckCircle2 className="w-3 h-3" /> Handoff verified
                </span>
            )}
        </div>
    );
}

// ── COA Canvas ────────────────────────────────────────────────────────────────
function COACanvas({ coas, onApprove }: { coas: COACard[]; onApprove: (id: string) => void }) {
    const [approved, setApproved] = useState<string[]>([]);
    const [denied, setDenied] = useState<string[]>([]);
    const handleApprove = (id: string) => { setApproved(p => [...p, id]); onApprove(id); };
    const handleDeny = (id: string) => setDenied(p => [...p, id]);
    return (
        <div className="h-full flex flex-col" style={{ background: "#070D19" }}>
            <div className="px-4 py-3 border-b border-white/8 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white font-sans">COURSES OF ACTION — HUMAN APPROVAL REQUIRED</span>
                <ClassBadge level="SECRET" />
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {coas.map(coa => {
                    const isApproved = approved.includes(coa.id);
                    const isDenied = denied.includes(coa.id);
                    return (
                        <div key={coa.id} className={`rounded-xl border p-4 transition-all ${isApproved ? 'border-emerald-500/40 bg-emerald-500/6' : isDenied ? 'border-red-500/30 bg-red-500/5 opacity-50' : 'border-white/10 bg-white/3'}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <code className="text-[11px] text-amber-400">{coa.id}</code>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-sans ${coa.risk === 'LOW' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}>{coa.risk} RISK</span>
                                <span className="text-[10px] text-blue-400 font-mono ml-auto">Conf: {coa.confidence}%</span>
                            </div>
                            <p className="text-sm text-slate-300 mb-3 font-sans leading-snug">{coa.title}</p>
                            <div className="space-y-1 mb-3">
                                {coa.actions.map((a, i) => (
                                    <div key={i} className="flex items-center gap-2 text-[11px] text-slate-500 font-sans">
                                        <span className="text-blue-500 font-mono">{i + 1}.</span> {a}
                                    </div>
                                ))}
                            </div>
                            {!isApproved && !isDenied ? (
                                <div className="flex gap-2">
                                    <button onClick={() => handleApprove(coa.id)} className="flex-1 py-2 text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg transition-all font-sans">✓ APPROVE EXECUTION</button>
                                    <button onClick={() => handleDeny(coa.id)} className="flex-1 py-2 text-xs font-bold bg-red-500/8 hover:bg-red-500/15 border border-red-500/20 text-red-400 rounded-lg transition-all font-sans">✗ DENY</button>
                                </div>
                            ) : isApproved ? (
                                <div className="py-2 text-center text-xs font-bold text-emerald-400 font-sans flex items-center justify-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> APPROVED — Logged to audit trail</div>
                            ) : (
                                <div className="py-2 text-center text-xs font-bold text-red-400 font-sans">DENIED — Response recorded</div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── Tail Log Canvas ─────────────────────────────────────────────────────────────
function TailLogCanvas() {
    const [logs, setLogs] = useState<any[]>([]);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const results = await ApiClient.get<any[]>('/api/v1/maven/audit/tail', { limit: "100" });
                setLogs(results);
            } catch (err) {
                console.error("Failed to fetch tail logs", err);
            }
        };
        fetchLogs();
        const interval = setInterval(fetchLogs, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-full flex flex-col bg-black text-[#00ff41] font-mono text-[10px] p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-4 border-b border-[#00ff41]/20 pb-2">
                <span className="flex items-center gap-2">
                    <Activity size={12} className="animate-pulse" />
                    MISSION_CRITICAL_AUDIT_STREAM_LIVE
                </span>
                <span className="opacity-50 uppercase tracking-widest">{new Date().toISOString()}</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar scroll-smooth">
                {logs.map((log, i) => (
                    <div key={log.id || i} className="flex gap-4 opacity-80 hover:opacity-100 transition-opacity">
                        <span className="text-white/30 shrink-0">[{new Date(log.occurredAt).toISOString().substring(11, 19)}]</span>
                        <span className="text-blue-400 shrink-0">[{log.actor.toUpperCase()}]</span>
                        <span className="text-amber-500 shrink-0">{log.action}</span>
                        <span className="text-white/60 shrink-0">{log.resourceType}://{log.resourceId?.substring(0, 8)}</span>
                        <span className="text-white truncate">&gt; {JSON.stringify(log.after || log.metadata || "").substring(0, 120)}</span>
                    </div>
                ))}
                {logs.length === 0 && (
                    <div className="h-full flex items-center justify-center opacity-20">
                        <span className="animate-pulse">AWAITING MISSION DATA...</span>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Message Bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: AiMessage }) {
    const [expanded, setExpanded] = useState(false);
    const isUser = msg.role === 'user';
    const hasDetail = !isUser && ((msg.sources?.length ?? 0) > 0 || (msg.policyEvents?.length ?? 0) > 0 || msg.modelChain);
    return (
        <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
            <div className="flex items-center gap-1.5 mb-0.5">
                {!isUser && <Brain className="w-3.5 h-3.5 text-blue-400" />}
                <span className="text-[10px] text-slate-600 font-mono">{isUser ? 'OPERATOR' : 'AIP-AI'} · {msg.timestamp}</span>
                {!isUser && msg.classification && <ClassBadge level={msg.classification} />}
                {!isUser && msg.confidence && <span className="text-[10px] text-blue-400/70 font-mono">Conf: {msg.confidence}%</span>}
                {isUser && <span className="text-[10px] text-slate-600 font-mono">OPERATOR</span>}
            </div>

            <div className={`max-w-[92%] rounded-xl px-4 py-3 text-sm border ${isUser ? 'bg-[#0F1E36] border-blue-500/20 text-blue-100 self-end' : 'bg-[#0D1520] border-white/8 text-slate-300'} font-sans leading-relaxed`}>
                {msg.text}
            </div>

            {/* Expandable detail panel */}
            {hasDetail && (
                <div className="max-w-[92%] w-full">
                    <button onClick={() => setExpanded(p => !p)} className="flex items-center gap-1.5 text-[10px] text-slate-600 hover:text-slate-400 font-mono mt-1 transition-colors">
                        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        {expanded ? 'Hide' : 'Show'} sources & policy check
                    </button>
                    {expanded && (
                        <div className="mt-1 rounded-xl border border-white/6 bg-black/30 p-3 space-y-2">
                            {msg.sources && <SourceList sources={msg.sources} />}
                            {msg.policyEvents && <PolicyEvents events={msg.policyEvents} />}
                            {msg.modelChain && <ModelChainDisplay chain={msg.modelChain} />}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AIPTerminal() {
    const [messages, setMessages] = useState<AiMessage[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [canvasMode, setCanvasMode] = useState<CanvasMode>('map');
    const [activeCOAs, setActiveCOAs] = useState<COACard[]>([]);
    const endRef = useRef<HTMLDivElement>(null);

    const SUGGESTED = [
        "Show current threat positions on map",
        "Generate COA for Grid 47-N situation",
        "Run JCATS simulation for threat advance",
        "Show current access policies",
        "Display mission readiness metrics",
    ];

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

    const handleSend = () => {
        if (!input.trim()) return;
        const userText = input.trim();
        setInput("");
        const userMsg: AiMessage = {
            id: `u-${Date.now()}`, role: 'user', text: userText,
            timestamp: new Date().toISOString().substring(11, 19) + "Z",
        };
        setMessages(p => [...p, userMsg]);
        setIsTyping(true);
        setTimeout(() => {
            const aiResp = computeAIResponse(userText, canvasMode);
            if (aiResp.canvasMode) setCanvasMode(aiResp.canvasMode);
            if (aiResp.coa) setActiveCOAs(aiResp.coa);
            setMessages(p => [...p, aiResp]);
            setIsTyping(false);
        }, 700 + Math.random() * 500);
    };

    return (
        <div className="flex flex-col w-full h-full bg-pt-bg text-pt-text overflow-hidden font-sans">
            {/* ── Sub-Header ── */}
            <div className="h-11 border-b border-pt-border flex items-center justify-between px-4 bg-pt-bg-panel/40 backdrop-blur-sm shrink-0">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <Terminal size={16} className="text-pt-intent-primary" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-pt-text">Intelligence Terminal</span>
                    </div>
                    <div className="h-4 w-px bg-pt-border" />
                    <div className="flex items-center space-x-2 text-[10px] font-mono text-pt-text-muted">
                        <Cpu size={12} className="opacity-50" />
                        <span>GPT-4-MAVEN-TACTICAL-V9</span>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={async () => {
                            try {
                                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/governance/sync/snapshot?projectId=proj-demo`, {
                                    headers: { 'X-Project-Id': 'proj-demo' }
                                });
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `mission-sync-${new Date().toISOString()}.aip`;
                                document.body.appendChild(a);
                                a.click();
                                a.remove();
                            } catch (err) {
                                console.error("Sync Snapshot failed", err);
                            }
                        }}
                        className="flex items-center space-x-1.5 px-2 py-0.5 rounded border border-pt-intent-primary/30 bg-pt-intent-primary/5 text-pt-intent-primary text-[9px] font-black uppercase tracking-widest hover:bg-pt-intent-primary/10 transition-all"
                    >
                        <Zap size={10} />
                        <span>Sync Snapshot</span>
                    </button>
                    <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded border border-pt-intent-success/30 bg-pt-intent-success/5 text-pt-intent-success text-[9px] font-black uppercase tracking-widest">
                        <Shield size={10} />
                        <span>Enforced</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex min-h-0">
                {/* ── Command Interface (Left) ── */}
                <section className="w-[450px] flex flex-col border-r border-pt-border bg-pt-bg">
                    {/* Chat Buffer */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar bg-pt-bg-panel/10">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center space-y-8 opacity-20 grayscale">
                                <div className="p-6 border-2 border-dashed border-pt-border rounded-full">
                                    <Brain size={48} className="text-pt-text-muted" />
                                </div>
                                <div className="space-y-4 w-full">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-center">Suggested Directives</p>
                                    <div className="grid gap-2">
                                        {SUGGESTED.map(s => (
                                            <button
                                                key={s}
                                                onClick={() => setInput(s)}
                                                className="text-[10px] text-left px-4 py-3 bg-pt-bg-panel/50 border border-pt-border hover:bg-pt-bg-panel transition-all font-mono text-pt-text-muted hover:text-pt-text"
                                            >
                                                &gt; {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {messages.map(msg => (
                            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-2`}>
                                <div className="flex items-center space-x-2 opacity-60">
                                    <span className="text-[9px] font-mono text-pt-text-muted uppercase font-bold">{msg.role === 'user' ? 'OPERATOR' : 'MAVEN'} · {msg.timestamp}</span>
                                    {msg.role !== 'user' && msg.classification && <ClassBadge level={msg.classification} />}
                                </div>
                                <div className={`max-w-[90%] p-4 text-[12px] leading-relaxed border ${msg.role === 'user'
                                    ? 'bg-pt-intent-primary/10 border-pt-intent-primary/30 text-pt-text'
                                    : 'bg-pt-bg-panel border-pt-border text-pt-text-muted'
                                    }`}>
                                    {msg.text}
                                </div>

                                {/* Detailed Signals (Metadata) */}
                                {msg.role !== 'assistant' && (msg.sources?.length || msg.policyEvents?.length) && (
                                    <div className="w-[90%] bg-pt-bg-panel/20 border-l-2 border-pt-border p-3 space-y-3">
                                        {msg.sources && <SourceList sources={msg.sources} />}
                                        {msg.policyEvents && <PolicyEvents events={msg.policyEvents} />}
                                    </div>
                                )}
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex flex-col items-start space-y-2">
                                <div className="text-[9px] font-mono text-pt-text-muted uppercase font-bold">Processing...</div>
                                <div className="flex space-x-1.5 p-3 bg-pt-bg-panel border border-pt-border">
                                    {[0, 1, 2].map(i => (
                                        <div key={i} className="w-1.5 h-1.5 bg-pt-intent-primary animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                                    ))}
                                </div>
                            </div>
                        )}
                        <div ref={endRef} />
                    </div>

                    {/* Command Console */}
                    <div className="p-4 bg-pt-bg border-t border-pt-border">
                        <div className="flex space-x-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                                    placeholder="Input tactical directive..."
                                    className="w-full bg-pt-bg-panel border border-pt-border px-4 py-3 text-[12px] font-mono focus:outline-none focus:border-pt-intent-primary transition-all text-pt-text"
                                />
                            </div>
                            <button
                                onClick={handleSend}
                                disabled={!input.trim()}
                                className="h-12 w-12 bg-pt-intent-primary hover:bg-pt-intent-primary-hover disabled:opacity-30 flex items-center justify-center transition-all shadow-lg"
                            >
                                <Send size={18} className="text-white" />
                            </button>
                        </div>
                    </div>
                </section>

                {/* ── Operational Visualizer (Right) ── */}
                <main className="flex-1 flex flex-col bg-pt-bg p-6">
                    <div className="h-full flex flex-col bg-pt-bg-panel/20 border border-pt-border rounded shadow-2xl overflow-hidden">
                        {/* Tab Switcher */}
                        <div className="h-10 border-b border-pt-border flex items-center px-4 justify-between bg-pt-bg-panel/40">
                            <div className="flex space-x-6">
                                {[
                                    { mode: 'map' as const, label: 'Geo Intelligence', icon: Globe },
                                    { mode: 'metrics' as const, label: 'Systems Health', icon: Activity },
                                    { mode: 'coa' as const, label: 'Strategic Options', icon: Layers },
                                    { mode: 'tail' as const, label: 'Mission Tail', icon: Terminal },
                                ].map(tab => (
                                    <button
                                        key={tab.mode}
                                        onClick={() => setCanvasMode(tab.mode)}
                                        className={`flex items-center space-x-2 h-10 border-b-2 transition-all ${canvasMode === tab.mode ? 'border-pt-intent-primary text-pt-text' : 'border-transparent text-pt-text-muted hover:text-pt-text'
                                            }`}
                                    >
                                        <tab.icon size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-pt-intent-primary animate-pulse" />
                                <span className="text-[9px] font-bold text-pt-intent-primary uppercase tracking-[0.2em]">Live Feed Active</span>
                            </div>
                        </div>

                        {/* Visualizer Content */}
                        <div className="flex-1 relative">
                            {canvasMode === 'map' && (
                                <BattlefieldOverview
                                    layers={{ aip: true, military: true, flights: true, satellites: false }}
                                    visualMode="normal"
                                />
                            )}
                            {canvasMode === 'metrics' && <MetricsDashboard />}
                            {canvasMode === 'coa' && (
                                activeCOAs.length > 0
                                    ? <COACanvas coas={activeCOAs} onApprove={(id) => console.log('Approved:', id)} />
                                    : (
                                        <div className="h-full flex items-center justify-center text-pt-text-muted opacity-30">
                                            <div className="text-center space-y-4">
                                                <Layers size={48} className="mx-auto" />
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Active COA Generated</p>
                                            </div>
                                        </div>
                                    )
                            )}
                            {canvasMode === 'tail' && <TailLogCanvas />}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

const isUser = false; // Internal flag for conditional rendering
