"use client";

import { useState } from "react";
import {
    Lock, Eye, Brain, CheckCircle2, AlertTriangle, Search,
    Filter, Clock, ChevronDown, ChevronUp, Download, Shield,
    Zap, Activity, Database
} from "lucide-react";

// ── Hardcoded Audit Entries ───────────────────────────────────────────────────
const AUDIT_ENTRIES = [
    {
        id: "AUD-0091",
        ts: "2026-02-28T08:31:44Z",
        type: "POLICY_BLOCK",
        model: "GPT-4-AIP",
        user: "OPR-001",
        sessionId: "SES-8821",
        classification: "SECRET",
        summary: "LLM access to SOLDIER-HEALTH-DATA blocked by Policy P-04",
        detail: { policy: "P-04", resource: "SOLDIER-HEALTH-DATA", reason: "LLM models restricted from health data. Requires human medical officer handoff.", outcome: "ACCESS DENIED" },
        sources: [],
        linkedPrompt: "Show me soldier readiness data for Alpha Company",
        linkedResponse: "[BLOCKED] Access to SOLDIER-HEALTH-DATA denied (Policy P-04). Please contact medical officer directly.",
    },
    {
        id: "AUD-0090",
        ts: "2026-02-28T08:31:41Z",
        type: "MODEL_HANDOFF",
        model: "GPT-4-AIP → TargetID-CV-v2",
        user: "OPR-001",
        sessionId: "SES-8821",
        classification: "SECRET",
        summary: "Secure handoff from LLM to TargetID-CV-v2 for imagery analysis of Grid 47-N",
        detail: { handoffPolicy: "HP-03", enclave: "SECRET-ENCLAVE-7", verificationToken: "HTK-A4921", outcome: "HANDOFF VERIFIED" },
        sources: ["SatIntel-447 [TS//SI]"],
        linkedPrompt: "Show current threat positions on map",
        linkedResponse: "Traversed FleetTracker-Live and SatIntel-447. Threat actor concentration in Grid 47-N increased 34%...",
    },
    {
        id: "AUD-0089",
        ts: "2026-02-28T08:31:38Z",
        type: "DATA_ACCESS",
        model: "GPT-4-AIP",
        user: "OPR-001",
        sessionId: "SES-8821",
        classification: "SECRET",
        summary: "Read access to FleetTracker-Live — 312 entity records traversed",
        detail: { recordsRead: 312, filter: "entity_type=VEHICLE AND status=ACTIVE", clearanceUsed: "SECRET", entitiesModified: 0, outcome: "READ COMPLETE" },
        sources: ["FleetTracker-Live [SECRET]"],
        linkedPrompt: "Show current threat positions on map",
        linkedResponse: null,
    },
    {
        id: "AUD-0088",
        ts: "2026-02-28T08:31:30Z",
        type: "COA_GENERATED",
        model: "GPT-4-AIP / JCATS-Sim",
        user: "OPR-001",
        sessionId: "SES-8821",
        classification: "SECRET",
        summary: "3 COA options generated and queued for human approval (COA-ALPHA, BRAVO, CHARLIE)",
        detail: { coasGenerated: 3, simulationRuns: 500, topConfidence: "94% (COA-BRAVO)", handoffRequired: "YES — Decision Inbox", outcome: "PENDING HUMAN APPROVAL" },
        sources: ["ForceDisposition-DB [SECRET]", "ThreatAssessment-Live [SECRET]"],
        linkedPrompt: "Generate COA for Grid 47-N situation",
        linkedResponse: "Generated three Courses of Action based on current threat assessment...",
    },
    {
        id: "AUD-0087",
        ts: "2026-02-28T08:31:22Z",
        type: "DATA_ACCESS",
        model: "GPT-4-AIP",
        user: "OPR-001",
        sessionId: "SES-8821",
        classification: "TS//SI",
        summary: "Read access to SatIntel-447 — 3 anomalies detected and flagged",
        detail: { recordsRead: 142, anomaliesDetected: 3, filter: "feed=SIGINT AND grid=47-N", clearanceUsed: "TS//SI", outcome: "READ COMPLETE — ANOMALIES FLAGGED" },
        sources: ["SatIntel-447 [TS//SI]"],
        linkedPrompt: "Show current threat positions on map",
        linkedResponse: null,
    },
    {
        id: "AUD-0086",
        ts: "2026-02-28T08:30:14Z",
        type: "SESSION_START",
        model: "SYSTEM",
        user: "OPR-001",
        sessionId: "SES-8821",
        classification: "UNCLASSIFIED",
        summary: "Operator OPR-001 authenticated. Session SES-8821 started. Clearance: SECRET",
        detail: { clearance: "SECRET", mfaVerified: true, ipHash: "SHA256:A4F92...", policyVersion: "v2.4.1", outcome: "SESSION ACTIVE" },
        sources: [],
        linkedPrompt: null,
        linkedResponse: null,
    },
    {
        id: "AUD-0085",
        ts: "2026-02-28T08:28:55Z",
        type: "POLICY_BLOCK",
        model: "GPT-4-AIP",
        user: "OPR-001",
        sessionId: "SES-8818",
        classification: "SECRET",
        summary: "LLM access to SIGINT-RAW blocked — Policy P-11 pending approval",
        detail: { policy: "P-11", resource: "SIGINT-RAW", reason: "Raw SIGINT access requires separate NTK approval. Contact your ISSO.", outcome: "ACCESS DENIED" },
        sources: [],
        linkedPrompt: "Give me the raw SIGINT data from the past 2 hours",
        linkedResponse: "[BLOCKED] SIGINT-RAW access requires Policy P-11 authorization. Contact your ISSO.",
    },
];

type AuditEntry = typeof AUDIT_ENTRIES[0];

type EntryType = AuditEntry['type'];
const TYPE_STYLES: Record<EntryType, { bg: string; text: string; icon: typeof Lock }> = {
    POLICY_BLOCK: { bg: "bg-red-500/15 border-red-500/30", text: "text-red-400", icon: Lock },
    MODEL_HANDOFF: { bg: "bg-blue-500/15 border-blue-500/30", text: "text-blue-400", icon: Brain },
    DATA_ACCESS: { bg: "bg-slate-700/60 border-slate-600/40", text: "text-slate-400", icon: Eye },
    COA_GENERATED: { bg: "bg-amber-500/15 border-amber-500/30", text: "text-amber-400", icon: Zap },
    SESSION_START: { bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-400", icon: Activity },
};

function ClassBadge({ level }: { level: string }) {
    const styles: Record<string, string> = {
        "TS//SI": "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30",
        SECRET: "bg-red-500/15 text-red-300 border border-red-500/30",
        UNCLASSIFIED: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
    };
    return <span className={`text-[9px] font-black px-1.5 py-0.5 rounded font-mono ${styles[level] || "bg-slate-700 text-slate-400 border border-slate-600"}`}>{level}</span>;
}

function AuditRow({ entry, onClick, selected }: { entry: AuditEntry; onClick: () => void; selected: boolean }) {
    const style = TYPE_STYLES[entry.type] || TYPE_STYLES.DATA_ACCESS;
    const Icon = style.icon;
    return (
        <div onClick={onClick} className={`flex items-center gap-4 px-4 py-3 cursor-pointer border-b border-white/4 last:border-0 hover:bg-white/2 transition-colors ${selected ? 'bg-white/3 border-l-2 border-l-blue-500' : 'border-l-2 border-l-transparent'}`}>
            <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${style.bg}`}>
                <Icon className={`w-3.5 h-3.5 ${style.text}`} />
            </div>
            <code className={`text-[10px] shrink-0 ${style.text}`}>{entry.type.replace(/_/g, ' ')}</code>
            <span className="text-[11px] text-slate-400 flex-1 truncate font-sans">{entry.summary}</span>
            <ClassBadge level={entry.classification} />
            <code className="text-[10px] text-slate-600 shrink-0">{entry.ts.substring(11, 19)} UTC</code>
            <code className="text-[10px] text-slate-700 shrink-0">{entry.id}</code>
        </div>
    );
}

export default function AuditLog() {
    const [selected, setSelected] = useState<AuditEntry>(AUDIT_ENTRIES[0]);
    const [search, setSearch] = useState("");
    const filtered = AUDIT_ENTRIES.filter(e =>
        !search || e.summary.toLowerCase().includes(search.toLowerCase()) || e.type.toLowerCase().includes(search.toLowerCase()) || e.id.toLowerCase().includes(search.toLowerCase())
    );
    const style = TYPE_STYLES[selected.type] || TYPE_STYLES.DATA_ACCESS;
    const SelIcon = style.icon;

    return (
        <div className="h-full flex flex-col font-mono" style={{ background: "#060A12", color: "#CBD5E1" }}>

            {/* Classification Banner */}
            <div className="shrink-0 text-center py-1 text-[10px] font-black tracking-[0.2em] uppercase bg-red-700 text-white">
                ██ SECRET ██ SECURE AUDIT LOG — TAMPER-EVIDENT RECORD ██
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/8 shrink-0" style={{ background: "rgba(0,0,0,0.4)" }}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600/15 border border-emerald-500/25 flex items-center justify-center">
                        <Lock className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-white">Secure Audit Log</h1>
                        <p className="text-[10px] text-slate-500">Immutable record of all AI prompts, decisions, and data accesses</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 border border-emerald-500/20 bg-emerald-500/6 rounded-lg">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-400">LOGGING ACTIVE</span>
                    </div>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/4 border border-white/10 text-slate-400 text-[10px] font-bold rounded-lg hover:bg-white/8 transition-all font-sans">
                        <Download className="w-3.5 h-3.5" /> Export
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="px-4 py-2 border-b border-white/6 shrink-0" style={{ background: "rgba(0,0,0,0.2)" }}>
                <div className="relative max-w-md">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search audit entries..."
                        className="w-full pl-9 pr-3 py-2 bg-white/4 border border-white/8 rounded-xl text-[11px] text-slate-300 placeholder-slate-700 outline-none focus:border-blue-500/30 font-mono transition-all" />
                </div>
            </div>

            {/* Split view */}
            <div className="flex-1 flex min-h-0">

                {/* Left: Log List */}
                <div className="flex-1 overflow-y-auto border-r border-white/8">
                    {/* Column headers */}
                    <div className="sticky top-0 grid grid-cols-[28px_1fr_4fr_auto_120px_80px] gap-4 px-4 py-2 text-[10px] text-slate-600 uppercase tracking-wider border-b border-white/6" style={{ background: "#070C16" }}>
                        <span />
                        <span>Type</span>
                        <span>Summary</span>
                        <span>Class</span>
                        <span>Timestamp</span>
                        <span>Entry ID</span>
                    </div>
                    {filtered.map(e => (
                        <AuditRow key={e.id} entry={e} selected={selected?.id === e.id} onClick={() => setSelected(e)} />
                    ))}
                    {filtered.length === 0 && (
                        <div className="py-12 text-center text-slate-600 text-sm font-sans">No entries match your search</div>
                    )}
                </div>

                {/* Right: Detail panel */}
                <div className="w-96 shrink-0 overflow-y-auto p-5 space-y-4" style={{ background: "rgba(0,0,0,0.25)" }}>
                    <div className="flex items-center gap-2 mb-1">
                        <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${style.bg}`}>
                            <SelIcon className={`w-3.5 h-3.5 ${style.text}`} />
                        </div>
                        <div>
                            <code className={`text-xs font-bold ${style.text}`}>{selected.type.replace(/_/g, ' ')}</code>
                            <p className="text-[10px] text-slate-600">{selected.id}</p>
                        </div>
                        <ClassBadge level={selected.classification} />
                    </div>
                    <p className="text-sm text-slate-300 font-sans leading-relaxed">{selected.summary}</p>

                    {/* Meta */}
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { label: "Timestamp", value: selected.ts.replace('T', ' ').replace('Z', ' UTC') },
                            { label: "Session", value: selected.sessionId },
                            { label: "Model", value: selected.model },
                            { label: "User", value: selected.user },
                        ].map(f => (
                            <div key={f.label} className="bg-white/2 border border-white/6 rounded-lg p-2.5">
                                <p className="text-[9px] text-slate-600 uppercase tracking-wider font-sans mb-1">{f.label}</p>
                                <code className="text-[11px] text-white">{f.value}</code>
                            </div>
                        ))}
                    </div>

                    {/* Detail */}
                    <div>
                        <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-2 font-sans">Event Detail</p>
                        <div className="bg-black/40 border border-white/6 rounded-xl p-3 space-y-1.5">
                            {Object.entries(selected.detail).map(([k, v]) => (
                                <div key={k} className="flex items-start justify-between gap-2">
                                    <span className="text-[10px] text-slate-600 capitalize font-sans">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    <code className={`text-[10px] text-right ${String(v).includes('DENIED') || String(v).includes('BLOCK') ? 'text-red-400' : String(v).includes('ALLOW') || String(v).includes('COMPLETE') || String(v) === 'true' ? 'text-emerald-400' : 'text-slate-300'}`}>{String(v)}</code>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Linked prompt/response */}
                    {selected.linkedPrompt && (
                        <div>
                            <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-2 font-sans">Operator Prompt</p>
                            <div className="bg-blue-500/6 border border-blue-500/15 rounded-xl p-3">
                                <p className="text-[11px] text-blue-200 font-sans italic">"{selected.linkedPrompt}"</p>
                            </div>
                        </div>
                    )}
                    {selected.linkedResponse && (
                        <div>
                            <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-2 font-sans">AI Response (truncated)</p>
                            <div className="bg-white/2 border border-white/6 rounded-xl p-3">
                                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">{selected.linkedResponse}</p>
                            </div>
                        </div>
                    )}

                    {/* Sources */}
                    {selected.sources.length > 0 && (
                        <div>
                            <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-2 font-sans">Data Sources Accessed</p>
                            <div className="space-y-1.5">
                                {selected.sources.map((s, i) => (
                                    <div key={i} className="flex items-center gap-2 px-3 py-2 border border-white/6 bg-white/2 rounded-lg">
                                        <Eye className="w-3 h-3 text-slate-600" />
                                        <code className="text-[11px] text-slate-300">{s}</code>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
