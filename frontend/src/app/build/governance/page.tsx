"use client";
import { useState } from "react";
import {
    Shield, Plus, AlertTriangle, Check, X, Info, ChevronDown,
    ChevronRight, Clock, Tag, Layers, Zap, Brain, Database,
    Eye, Trash2, Archive, ToggleRight, ToggleLeft, AlertCircle,
    Users, Search, Globe, Lock, Unlock
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
type PolicyCategory = "data-retention" | "ai-risk" | "access-control" | "privacy" | "compliance";
type PolicyStatus = "active" | "draft" | "suspended";
type EnforcementAction = "auto-enforce" | "notify" | "require-approval" | "block";
type AIRiskTier = "unacceptable" | "high" | "limited" | "minimal";
type RetentionAction = "hard-delete" | "soft-delete" | "archive" | "anonymize";
type EscalationLevel = "L1-automated" | "L2-notify" | "L3-approval" | "L4-block";

interface ComplianceTag {
    id: string; label: string; framework: string; color: string;
}

interface EscalationStep {
    level: EscalationLevel;
    trigger: string;
    notifyRoles: string[];
    slaHours: number;
    enabled: boolean;
}

interface RetentionRule {
    objectType: string;
    retentionDays: number;
    action: RetentionAction;
    piiField: boolean;
    legalHold: boolean;
}

interface Policy {
    id: string;
    name: string;
    category: PolicyCategory;
    status: PolicyStatus;
    description: string;
    owner: string;
    lastReviewedAt: string;
    complianceTags: string[];
    enforcementAction: EnforcementAction;
    scope: string[];
    aiRiskTier?: AIRiskTier;
    escalation: EscalationStep[];
    retention?: RetentionRule[];
    conditions: { field: string; operator: string; value: string }[];
}

// ── Constants ──────────────────────────────────────────────────────────────────
const COMPLIANCE_TAGS: ComplianceTag[] = [
    { id: "gdpr-15", label: "GDPR Art.15", framework: "GDPR", color: "#137CBD" },
    { id: "gdpr-17", label: "GDPR Art.17", framework: "GDPR", color: "#137CBD" },
    { id: "ccpa", label: "CCPA", framework: "CCPA", color: "#0D8050" },
    { id: "eu-ai", label: "EU AI Act", framework: "EU-AI-ACT", color: "#7157D9" },
    { id: "nist-53", label: "NIST 800-53", framework: "NIST", color: "#D9822B" },
    { id: "nist-171", label: "NIST 800-171", framework: "NIST", color: "#D9822B" },
    { id: "iso-27", label: "ISO 27001", framework: "ISO", color: "#C23030" },
    { id: "soc2", label: "SOC 2", framework: "SOC", color: "#5C7080" },
];

const AI_RISK_META: Record<AIRiskTier, { label: string; color: string; bg: string; eu: string; guardrails: string[] }> = {
    unacceptable: {
        label: "Unacceptable Risk", color: "#C23030", bg: "rgba(194,48,48,0.08)",
        eu: "EU AI Act — Prohibited",
        guardrails: ["Blocked from deployment", "Cannot be approved", "Immediate audit required", "Legal review mandatory"],
    },
    high: {
        label: "High Risk", color: "#D9822B", bg: "rgba(217,130,43,0.08)",
        eu: "EU AI Act — Art. 6-51 (Annex III)",
        guardrails: ["Mandatory human oversight", "Conformity assessment required", "Audit trail for all decisions", "Bias monitoring active", "Approval workflow: L3+"],
    },
    limited: {
        label: "Limited Risk", color: "#7157D9", bg: "rgba(113,87,217,0.08)",
        eu: "EU AI Act — Transparency obligations",
        guardrails: ["Must disclose AI interaction to users", "Output must be identifiable as AI", "Risk register entry required"],
    },
    minimal: {
        label: "Minimal Risk", color: "#0D8050", bg: "rgba(13,128,80,0.08)",
        eu: "EU AI Act — No mandatory requirements",
        guardrails: ["Standard monitoring applies", "Voluntary code of conduct", "Periodic review recommended"],
    },
};

const ENFORCEMENT_META: Record<EnforcementAction, { label: string; color: string; icon: React.ElementType }> = {
    "auto-enforce": { label: "Auto Enforce", color: "#0D8050", icon: Check },
    "notify": { label: "Notify", color: "#137CBD", icon: Eye },
    "require-approval": { label: "Require Approval", color: "#D9822B", icon: AlertTriangle },
    "block": { label: "Block", color: "#C23030", icon: X },
};

const CAT_META: Record<PolicyCategory, { label: string; color: string; icon: React.ElementType }> = {
    "data-retention": { label: "Data Retention", color: "#137CBD", icon: Archive },
    "ai-risk": { label: "AI Risk", color: "#7157D9", icon: Brain },
    "access-control": { label: "Access Control", color: "#C23030", icon: Lock },
    "privacy": { label: "Privacy", color: "#0D8050", icon: Shield },
    "compliance": { label: "Compliance", color: "#D9822B", icon: Globe },
};

const SEED_POLICIES: Policy[] = [
    {
        id: "p1", name: "PII Retention — 90 Day Purge", category: "data-retention",
        status: "active", owner: "data-governance@org", lastReviewedAt: "2026-01-15",
        description: "Personally identifiable information must be hard-deleted 90 days after processing purpose is fulfilled, per GDPR Art.17.",
        complianceTags: ["gdpr-17", "ccpa"],
        enforcementAction: "auto-enforce",
        scope: ["Pilot", "WorkOrder"],
        escalation: [
            { level: "L1-automated", trigger: "Record age > 90 days", notifyRoles: [], slaHours: 0, enabled: true },
            { level: "L2-notify", trigger: "Deletion failed", notifyRoles: ["data-steward"], slaHours: 4, enabled: true },
            { level: "L3-approval", trigger: "Legal hold detected", notifyRoles: ["legal-team", "data-governance"], slaHours: 24, enabled: true },
            { level: "L4-block", trigger: "System override attempted", notifyRoles: ["security", "ciso"], slaHours: 1, enabled: false },
        ],
        retention: [
            { objectType: "Pilot", retentionDays: 90, action: "hard-delete", piiField: true, legalHold: false },
            { objectType: "WorkOrder", retentionDays: 365, action: "archive", piiField: false, legalHold: false },
        ],
        conditions: [
            { field: "processingPurposeFulfilled", operator: "==", value: "true" },
            { field: "dataClass", operator: "==", value: "PII" },
        ],
    },
    {
        id: "p2", name: "Mission AI — High Risk Classification", category: "ai-risk",
        status: "active", owner: "ai-governance@org", lastReviewedAt: "2026-02-01",
        description: "Autonomous mission assignment AI agents classified as High Risk under EU AI Act Annex III. Mandatory human oversight and conformity assessment required.",
        complianceTags: ["eu-ai", "nist-53"],
        enforcementAction: "require-approval",
        scope: ["Mission Ops Assistant", "Fleet Risk Analyst"],
        aiRiskTier: "high",
        escalation: [
            { level: "L1-automated", trigger: "Agent execution triggered", notifyRoles: [], slaHours: 0, enabled: true },
            { level: "L2-notify", trigger: "Decision confidence < 80%", notifyRoles: ["mission-commander"], slaHours: 0, enabled: true },
            { level: "L3-approval", trigger: "High-impact action suggested", notifyRoles: ["mission-commander", "ai-governance"], slaHours: 2, enabled: true },
            { level: "L4-block", trigger: "Unacceptable risk detected", notifyRoles: ["ciso", "legal-team"], slaHours: 0, enabled: true },
        ],
        conditions: [
            { field: "agentScope", operator: "includes", value: "execute-actions" },
            { field: "targetObjectType", operator: "==", value: "Mission" },
        ],
    },
    {
        id: "p3", name: "Data Access — Audit Log Retention", category: "compliance",
        status: "active", owner: "compliance@org", lastReviewedAt: "2026-01-20",
        description: "All data access events must be retained for 7 years for SOC 2 and NIST 800-53 compliance. Immutable audit records only.",
        complianceTags: ["soc2", "nist-53", "iso-27"],
        enforcementAction: "auto-enforce",
        scope: ["AuditLog", "AccessEvent"],
        escalation: [
            { level: "L1-automated", trigger: "Audit record created", notifyRoles: [], slaHours: 0, enabled: true },
            { level: "L2-notify", trigger: "Retention gap detected", notifyRoles: ["compliance"], slaHours: 24, enabled: true },
            { level: "L3-approval", trigger: "Early deletion requested", notifyRoles: ["compliance", "ciso"], slaHours: 48, enabled: true },
            { level: "L4-block", trigger: "Tamper attempt detected", notifyRoles: ["security", "ciso"], slaHours: 0, enabled: true },
        ],
        retention: [
            { objectType: "AuditLog", retentionDays: 2555, action: "archive", piiField: false, legalHold: true },
        ],
        conditions: [
            { field: "eventType", operator: "in", value: "[data-access,action-applied,login]" },
        ],
    },
    {
        id: "p4", name: "Equipment Diagnostics AI — Minimal Risk", category: "ai-risk",
        status: "draft", owner: "ai-governance@org", lastReviewedAt: "2026-02-10",
        description: "Predictive maintenance AI classified as minimal risk. No mandatory EU AI Act requirements. Standard monitoring applies.",
        complianceTags: ["eu-ai"],
        enforcementAction: "notify",
        scope: ["Equipment Diagnostics AI"],
        aiRiskTier: "minimal",
        escalation: [
            { level: "L1-automated", trigger: "Anomaly detected", notifyRoles: [], slaHours: 0, enabled: true },
            { level: "L2-notify", trigger: "Maintenance suggested", notifyRoles: ["operator"], slaHours: 4, enabled: true },
            { level: "L3-approval", trigger: "Override requested", notifyRoles: ["supervisor"], slaHours: 12, enabled: false },
            { level: "L4-block", trigger: "Critical failure risk", notifyRoles: ["safety-officer"], slaHours: 0, enabled: false },
        ],
        conditions: [
            { field: "agentType", operator: "==", value: "Equipment Diagnostics AI" },
        ],
    },
    {
        id: "p5", name: "GDPR Data Subject Access Rights", category: "privacy",
        status: "active", owner: "privacy@org", lastReviewedAt: "2026-01-28",
        description: "Respond to GDPR Art.15 (right of access) requests within 30 days. Automated data extraction for subject, review by DPO before delivery.",
        complianceTags: ["gdpr-15", "gdpr-17", "ccpa"],
        enforcementAction: "require-approval",
        scope: ["Pilot", "WorkOrder", "Alert"],
        escalation: [
            { level: "L1-automated", trigger: "DSAR submitted", notifyRoles: ["dpo"], slaHours: 0, enabled: true },
            { level: "L2-notify", trigger: "Data extraction complete", notifyRoles: ["dpo"], slaHours: 48, enabled: true },
            { level: "L3-approval", trigger: "DPO review required before delivery", notifyRoles: ["dpo", "legal-team"], slaHours: 720, enabled: true },
            { level: "L4-block", trigger: "Request disputed — legal hold", notifyRoles: ["legal-team"], slaHours: 0, enabled: true },
        ],
        conditions: [
            { field: "requestType", operator: "==", value: "DSAR" },
            { field: "dataSubjectVerified", operator: "==", value: "true" },
        ],
    },
];

// ── Helpers ─────────────────────────────────────────────────────────────────────
const STATUS_C: Record<PolicyStatus, [string, string]> = {
    active: ["#E6F7F0", "#0D8050"],
    draft: ["#EBF4FC", "#137CBD"],
    suspended: ["#EBF1F5", "#5C7080"],
};

const ESCALATION_META: Record<EscalationLevel, { label: string; color: string }> = {
    "L1-automated": { label: "L1 — Automated", color: "#0D8050" },
    "L2-notify": { label: "L2 — Notify", color: "#137CBD" },
    "L3-approval": { label: "L3 — Require Approval", color: "#D9822B" },
    "L4-block": { label: "L4 — Block", color: "#C23030" },
};

const RETENTION_ACTION_C: Record<RetentionAction, string> = {
    "hard-delete": "#C23030", "soft-delete": "#D9822B", "archive": "#137CBD", "anonymize": "#7157D9",
};

const btn = (primary = false, danger = false, sm = false): React.CSSProperties => ({
    height: sm ? 24 : 28, padding: sm ? "0 8px" : "0 11px", borderRadius: 3, fontSize: sm ? 11 : 12,
    fontWeight: 600, cursor: "pointer",
    border: danger ? "1px solid #C23030" : primary ? "none" : "1px solid #CED9E0",
    background: danger ? "rgba(194,48,48,0.08)" : primary ? "#137CBD" : "#fff",
    color: danger ? "#C23030" : primary ? "#fff" : "#394B59",
    display: "flex", alignItems: "center", gap: 5,
});

const tabSt = (a: boolean): React.CSSProperties => ({
    fontSize: 12, padding: "7px 14px", cursor: "pointer", border: "none", background: "transparent",
    borderBottom: a ? "2px solid #137CBD" : "2px solid transparent",
    color: a ? "#137CBD" : "#5C7080", fontWeight: a ? 700 : 400,
});

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function GovernancePage() {
    const [policies, setPolicies] = useState<Policy[]>(SEED_POLICIES);
    const [sel, setSel] = useState<Policy>(SEED_POLICIES[0]);
    const [tab, setTab] = useState<"general" | "conditions" | "enforcement" | "escalation" | "compliance">("general");
    const [catFilter, setCatFilter] = useState<PolicyCategory | "all">("all");
    const [search, setSearch] = useState("");

    const updateSel = (p: Policy) => { setSel(p); setPolicies(prev => prev.map(x => x.id === p.id ? p : x)); };

    const toggleEscalation = (i: number) => {
        const escalation = sel.escalation.map((e, idx) => idx === i ? { ...e, enabled: !e.enabled } : e);
        updateSel({ ...sel, escalation });
    };

    const updateEscalationSLA = (i: number, slaHours: number) => {
        const escalation = sel.escalation.map((e, idx) => idx === i ? { ...e, slaHours } : e);
        updateSel({ ...sel, escalation });
    };

    const toggleComplianceTag = (tagId: string) => {
        const complianceTags = sel.complianceTags.includes(tagId)
            ? sel.complianceTags.filter(t => t !== tagId)
            : [...sel.complianceTags, tagId];
        updateSel({ ...sel, complianceTags });
    };

    const filtered = policies.filter(p =>
        (catFilter === "all" || p.category === catFilter) &&
        (p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()))
    );

    const [sbg, sfg] = STATUS_C[sel.status];
    const catM = CAT_META[sel.category];
    const CatIcon = catM.icon;
    const enfM = ENFORCEMENT_META[sel.enforcementAction];
    const EnfIcon = enfM.icon;

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#F5F8FA", fontFamily: "Inter,sans-serif" }}>

            {/* Top bar */}
            <div style={{
                height: 44, display: "flex", alignItems: "center", padding: "0 14px",
                background: "#fff", borderBottom: "1px solid #CED9E0", gap: 8, flexShrink: 0
            }}>
                <Shield style={{ width: 16, height: 16, color: "#7157D9" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#182026" }}>Governance</span>
                <div style={{ width: 1, height: 16, background: "#CED9E0", margin: "0 4px" }} />
                <span style={{ fontSize: 11, color: "#5C7080" }}>Policy Registry · AI Risk · Escalation · Compliance · Retention</span>
                <div style={{ flex: 1 }} />
                <button onClick={() => {
                    const p: Policy = {
                        id: `p${Date.now()}`, name: "New Policy", category: "compliance", status: "draft",
                        owner: "governance@org", lastReviewedAt: new Date().toISOString().split("T")[0],
                        description: "", complianceTags: [], enforcementAction: "notify", scope: [],
                        escalation: [
                            { level: "L1-automated", trigger: "", notifyRoles: [], slaHours: 0, enabled: true },
                            { level: "L2-notify", trigger: "", notifyRoles: [], slaHours: 4, enabled: false },
                            { level: "L3-approval", trigger: "", notifyRoles: [], slaHours: 24, enabled: false },
                            { level: "L4-block", trigger: "", notifyRoles: [], slaHours: 0, enabled: false },
                        ],
                        conditions: [{ field: "", operator: "==", value: "" }],
                    };
                    setPolicies(prev => [...prev, p]); setSel(p); setTab("general");
                }} style={btn(true)}><Plus style={{ width: 13, height: 13 }} /> New Policy</button>
            </div>

            <div style={{ flex: 1, display: "flex", minHeight: 0 }}>

                {/* ── Left: Policy List ── */}
                <div style={{ width: 260, background: "#fff", borderRight: "1px solid #CED9E0", display: "flex", flexDirection: "column", flexShrink: 0 }}>
                    {/* Search */}
                    <div style={{ padding: "8px 10px", borderBottom: "1px solid #EBF1F5" }}>
                        <div style={{
                            display: "flex", alignItems: "center", gap: 6, padding: "4px 8px",
                            border: "1px solid #CED9E0", borderRadius: 3, background: "#F5F8FA"
                        }}>
                            <Search style={{ width: 12, height: 12, color: "#8A9BA8", flexShrink: 0 }} />
                            <input value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search policies…" style={{
                                    border: "none", background: "transparent",
                                    fontSize: 11, outline: "none", flex: 1, color: "#182026"
                                }} />
                        </div>
                    </div>
                    {/* Category filter */}
                    <div style={{ padding: "6px 10px", borderBottom: "1px solid #EBF1F5", display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {(["all", ...Object.keys(CAT_META)] as (PolicyCategory | "all")[]).map(c => {
                            const active = catFilter === c;
                            const col = c === "all" ? "#5C7080" : CAT_META[c as PolicyCategory].color;
                            return (
                                <button key={c} onClick={() => setCatFilter(c)}
                                    style={{
                                        padding: "2px 7px", borderRadius: 12, border: `1px solid ${active ? col : "#CED9E0"}`,
                                        background: active ? `${col}15` : "transparent", color: active ? col : "#8A9BA8",
                                        fontSize: 9, fontWeight: 700, cursor: "pointer", textTransform: "uppercase" as const
                                    }}>
                                    {c === "all" ? "All" : CAT_META[c as PolicyCategory].label.split(" ")[0]}
                                </button>
                            );
                        })}
                    </div>

                    <div style={{ padding: "5px 10px 3px", fontSize: 9, fontWeight: 700, color: "#5C7080", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        Policies ({filtered.length})
                    </div>
                    <div style={{ flex: 1, overflow: "auto" }}>
                        {filtered.map(p => {
                            const cm = CAT_META[p.category]; const CI = cm.icon;
                            const [pb, pf] = STATUS_C[p.status];
                            return (
                                <div key={p.id} onClick={() => { setSel(p); setTab("general"); }}
                                    style={{
                                        padding: "9px 12px", cursor: "pointer", borderBottom: "1px solid #EBF1F5",
                                        borderLeft: sel.id === p.id ? "2px solid #7157D9" : "2px solid transparent",
                                        background: sel.id === p.id ? "rgba(113,87,217,0.04)" : "transparent"
                                    }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <div style={{
                                            width: 22, height: 22, borderRadius: 4, background: `${cm.color}15`,
                                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                                        }}>
                                            <CI style={{ width: 12, height: 12, color: cm.color }} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 11, fontWeight: 600, color: "#182026", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                                                <span style={{ fontSize: 8, padding: "1px 4px", borderRadius: 3, background: pb, color: pf, fontWeight: 700 }}>{p.status}</span>
                                                <span style={{ fontSize: 8, color: "#8A9BA8" }}>{p.complianceTags.length} tags</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Right: Policy Editor ── */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                    {/* Policy header */}
                    <div style={{ padding: "10px 16px", background: "#fff", borderBottom: "1px solid #CED9E0", flexShrink: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <CatIcon style={{ width: 15, height: 15, color: catM.color }} />
                            <span style={{ fontSize: 15, fontWeight: 700, color: "#182026" }}>{sel.name}</span>
                            <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, fontWeight: 700, background: sbg, color: sfg }}>{sel.status}</span>
                            <span style={{
                                fontSize: 9, padding: "2px 6px", borderRadius: 3, fontWeight: 700,
                                background: `${catM.color}12`, color: catM.color, border: `1px solid ${catM.color}`
                            }}>
                                {catM.label}
                            </span>
                            <div style={{ flex: 1 }} />
                            <span style={{
                                fontSize: 10, padding: "3px 10px", borderRadius: 3,
                                border: `1px solid ${enfM.color}`, background: `${enfM.color}10`, color: enfM.color,
                                display: "flex", alignItems: "center", gap: 4, fontWeight: 700
                            }}>
                                <EnfIcon style={{ width: 11, height: 11 }} />{enfM.label}
                            </span>
                            <button onClick={() => updateSel({ ...sel, status: sel.status === "active" ? "suspended" : "active" })}
                                style={btn(sel.status !== "active")}>
                                {sel.status === "active" ? "Suspend" : "Activate"}
                            </button>
                            <button style={btn(true)}>Save</button>
                        </div>
                        <div style={{ display: "flex", gap: 5, marginTop: 6, flexWrap: "wrap" as const }}>
                            {sel.complianceTags.map(tid => {
                                const t = COMPLIANCE_TAGS.find(x => x.id === tid);
                                if (!t) return null;
                                return <span key={tid} style={{
                                    fontSize: 9, padding: "2px 6px", borderRadius: 3, fontWeight: 700,
                                    border: `1px solid ${t.color}`, background: `${t.color}12`, color: t.color
                                }}>{t.label}</span>;
                            })}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: "flex", background: "#fff", borderBottom: "1px solid #CED9E0", flexShrink: 0 }}>
                        {(["general", "conditions", "enforcement", "escalation", "compliance"] as const).map(t => (
                            <button key={t} onClick={() => setTab(t)} style={tabSt(tab === t)}>
                                {t === "general" ? "General" : t === "conditions" ? "Conditions" : t === "enforcement" ? "Enforcement / Retention" : t === "escalation" ? "Escalation Workflow" : "Compliance Tags"}
                            </button>
                        ))}
                    </div>

                    <div style={{ flex: 1, overflow: "auto", padding: 20 }}>

                        {/* ── GENERAL ── */}
                        {tab === "general" && (
                            <div style={{ maxWidth: 620, display: "flex", flexDirection: "column", gap: 14 }}>
                                <div>
                                    <div style={{ fontSize: 9, fontWeight: 700, color: "#5C7080", textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: 4 }}>Policy Name</div>
                                    <input value={sel.name} onChange={e => updateSel({ ...sel, name: e.target.value })}
                                        style={{ width: "100%", padding: "6px 10px", border: "1px solid #CED9E0", borderRadius: 3, fontSize: 13, background: "#fff", boxSizing: "border-box" as const }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: 9, fontWeight: 700, color: "#5C7080", textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: 4 }}>Category</div>
                                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                                        {(Object.keys(CAT_META) as PolicyCategory[]).map(c => {
                                            const cm = CAT_META[c]; const CI = cm.icon;
                                            return (
                                                <button key={c} onClick={() => updateSel({ ...sel, category: c })}
                                                    style={{
                                                        display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 3,
                                                        cursor: "pointer", fontSize: 11, fontWeight: 600,
                                                        border: `1.5px solid ${sel.category === c ? cm.color : "#CED9E0"}`,
                                                        background: sel.category === c ? `${cm.color}10` : "#fff",
                                                        color: sel.category === c ? cm.color : "#5C7080"
                                                    }}>
                                                    <CI style={{ width: 12, height: 12 }} />{cm.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                {sel.category === "ai-risk" && (
                                    <div>
                                        <div style={{ fontSize: 9, fontWeight: 700, color: "#5C7080", textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: 8 }}>AI Risk Tier (EU AI Act)</div>
                                        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
                                            {(["unacceptable", "high", "limited", "minimal"] as AIRiskTier[]).map(tier => {
                                                const rm = AI_RISK_META[tier]; const active = sel.aiRiskTier === tier;
                                                return (
                                                    <div key={tier} onClick={() => updateSel({ ...sel, aiRiskTier: tier })}
                                                        style={{
                                                            padding: "10px 14px", border: `1.5px solid ${active ? rm.color : "#CED9E0"}`,
                                                            borderRadius: 4, cursor: "pointer", background: active ? rm.bg : "#fff"
                                                        }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: rm.color, flexShrink: 0 }} />
                                                            <span style={{ fontSize: 12, fontWeight: 700, color: rm.color }}>{rm.label}</span>
                                                            <span style={{ fontSize: 10, color: "#5C7080", marginLeft: "auto" }}>{rm.eu}</span>
                                                        </div>
                                                        {active && (
                                                            <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap" as const, gap: 5 }}>
                                                                {rm.guardrails.map(g => (
                                                                    <span key={g} style={{
                                                                        fontSize: 9, padding: "2px 7px", borderRadius: 3,
                                                                        background: `${rm.color}10`, color: rm.color, border: `1px solid ${rm.color}`, fontWeight: 600
                                                                    }}>{g}</span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <div style={{ fontSize: 9, fontWeight: 700, color: "#5C7080", textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: 4 }}>Description</div>
                                    <textarea value={sel.description} rows={4} onChange={e => updateSel({ ...sel, description: e.target.value })}
                                        style={{
                                            width: "100%", padding: "8px 10px", border: "1px solid #CED9E0", borderRadius: 3,
                                            fontSize: 12, background: "#fff", resize: "vertical" as const, fontFamily: "Inter,sans-serif",
                                            lineHeight: 1.6, boxSizing: "border-box" as const
                                        }} />
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                    <div>
                                        <div style={{ fontSize: 9, fontWeight: 700, color: "#5C7080", textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: 4 }}>Policy Owner</div>
                                        <input value={sel.owner} onChange={e => updateSel({ ...sel, owner: e.target.value })}
                                            style={{ width: "100%", padding: "6px 10px", border: "1px solid #CED9E0", borderRadius: 3, fontSize: 12, background: "#fff", boxSizing: "border-box" as const }} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 9, fontWeight: 700, color: "#5C7080", textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: 4 }}>Last Reviewed</div>
                                        <input value={sel.lastReviewedAt} type="date" onChange={e => updateSel({ ...sel, lastReviewedAt: e.target.value })}
                                            style={{ width: "100%", padding: "6px 10px", border: "1px solid #CED9E0", borderRadius: 3, fontSize: 12, background: "#fff", boxSizing: "border-box" as const }} />
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 9, fontWeight: 700, color: "#5C7080", textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: 4 }}>Enforcement Action</div>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        {(Object.keys(ENFORCEMENT_META) as EnforcementAction[]).map(a => {
                                            const em = ENFORCEMENT_META[a]; const EI = em.icon; const active = sel.enforcementAction === a;
                                            return (
                                                <button key={a} onClick={() => updateSel({ ...sel, enforcementAction: a })}
                                                    style={{
                                                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                                                        padding: "6px 4px", borderRadius: 3, cursor: "pointer", fontSize: 10, fontWeight: 600,
                                                        border: `1.5px solid ${active ? em.color : "#CED9E0"}`,
                                                        background: active ? `${em.color}10` : "#fff", color: active ? em.color : "#5C7080"
                                                    }}>
                                                    <EI style={{ width: 11, height: 11 }} />{em.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── CONDITIONS ── */}
                        {tab === "conditions" && (
                            <div style={{ maxWidth: 640 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#182026", marginBottom: 4 }}>Policy Conditions</div>
                                <div style={{ fontSize: 11, color: "#5C7080", marginBottom: 16 }}>
                                    Define when this policy applies. Conditions use dataset selectors and transaction selectors.
                                </div>
                                {sel.conditions.map((cond, i) => (
                                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                                        <input value={cond.field} onChange={e => {
                                            const conditions = sel.conditions.map((c, j) => j === i ? { ...c, field: e.target.value } : c);
                                            updateSel({ ...sel, conditions });
                                        }} placeholder="field" style={{ flex: 2, padding: "6px 10px", border: "1px solid #CED9E0", borderRadius: 3, fontSize: 12, background: "#fff" }} />
                                        <select value={cond.operator} onChange={e => {
                                            const conditions = sel.conditions.map((c, j) => j === i ? { ...c, operator: e.target.value } : c);
                                            updateSel({ ...sel, conditions });
                                        }} style={{ flex: 1, padding: "6px 8px", border: "1px solid #CED9E0", borderRadius: 3, fontSize: 12, background: "#fff" }}>
                                            {["==", "!=", ">", "<", ">=", "<=", "in", "includes", "not-in"].map(o => <option key={o}>{o}</option>)}
                                        </select>
                                        <input value={cond.value} onChange={e => {
                                            const conditions = sel.conditions.map((c, j) => j === i ? { ...c, value: e.target.value } : c);
                                            updateSel({ ...sel, conditions });
                                        }} placeholder="value" style={{ flex: 2, padding: "6px 10px", border: "1px solid #CED9E0", borderRadius: 3, fontSize: 12, background: "#fff" }} />
                                        <button onClick={() => {
                                            const conditions = sel.conditions.filter((_, j) => j !== i);
                                            updateSel({ ...sel, conditions });
                                        }} style={{ border: "none", background: "transparent", cursor: "pointer", color: "#C23030", display: "flex" }}>
                                            <X style={{ width: 14, height: 14 }} />
                                        </button>
                                    </div>
                                ))}
                                <button onClick={() => updateSel({ ...sel, conditions: [...sel.conditions, { field: "", operator: "==", value: "" }] })}
                                    style={{ ...btn(false, false, true), marginTop: 4 }}>
                                    <Plus style={{ width: 11, height: 11 }} /> Add condition
                                </button>

                                <div style={{ marginTop: 16, padding: "8px 12px", background: "#EBF4FC", border: "1px solid #B3D7F5", borderRadius: 4, display: "flex", gap: 8 }}>
                                    <Info style={{ width: 13, height: 13, color: "#137CBD", flexShrink: 0 }} />
                                    <span style={{ fontSize: 11, color: "#1F4E79", lineHeight: 1.5 }}>
                                        Conditions evaluate against Ontology object fields. Use transaction selectors to scope to specific data versions or time windows.
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* ── ENFORCEMENT / RETENTION ── */}
                        {tab === "enforcement" && (
                            <div style={{ maxWidth: 720 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#182026", marginBottom: 4 }}>Enforcement Scope & Retention</div>
                                <div style={{ fontSize: 11, color: "#5C7080", marginBottom: 16 }}>
                                    Defines which object types this policy applies to, and configures data retention rules per type.
                                </div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: "#182026", marginBottom: 8 }}>Enforcement Scope</div>
                                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, marginBottom: 16 }}>
                                    {sel.scope.map(s => (
                                        <span key={s} style={{
                                            display: "flex", alignItems: "center", gap: 4, padding: "3px 10px",
                                            borderRadius: 12, border: "1px solid #CED9E0", background: "#F5F8FA", fontSize: 11
                                        }}>
                                            {s}
                                            <button onClick={() => updateSel({ ...sel, scope: sel.scope.filter(x => x !== s) })}
                                                style={{ border: "none", background: "transparent", cursor: "pointer", display: "flex", color: "#8A9BA8" }}>
                                                <X style={{ width: 10, height: 10 }} />
                                            </button>
                                        </span>
                                    ))}
                                    <input placeholder="Add object type…" onKeyDown={e => {
                                        if (e.key === "Enter" && e.currentTarget.value.trim()) {
                                            updateSel({ ...sel, scope: [...sel.scope, e.currentTarget.value.trim()] });
                                            e.currentTarget.value = "";
                                        }
                                    }} style={{
                                        padding: "3px 10px", border: "1px dashed #CED9E0", borderRadius: 12, fontSize: 11,
                                        background: "transparent", outline: "none", width: 140
                                    }} />
                                </div>

                                {sel.retention && sel.retention.length > 0 && (
                                    <>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: "#182026", marginBottom: 8 }}>Retention Rules</div>
                                        <div style={{ background: "#fff", border: "1px solid #CED9E0", borderRadius: 4, overflow: "hidden" }}>
                                            <div style={{
                                                display: "grid", gridTemplateColumns: "140px 100px 110px 80px 80px",
                                                background: "#F5F8FA", borderBottom: "1px solid #CED9E0"
                                            }}>
                                                {["Object Type", "Retention (days)", "Action", "PII", "Legal Hold"].map(h => (
                                                    <div key={h} style={{ padding: "8px 12px", fontSize: 9, fontWeight: 700, color: "#5C7080", textTransform: "uppercase" as const }}>{h}</div>
                                                ))}
                                            </div>
                                            {sel.retention.map((r, ri) => {
                                                const rc = RETENTION_ACTION_C[r.action];
                                                return (
                                                    <div key={ri} style={{
                                                        display: "grid", gridTemplateColumns: "140px 100px 110px 80px 80px",
                                                        borderBottom: "1px solid #EBF1F5", alignItems: "center"
                                                    }}>
                                                        <div style={{ padding: "8px 12px", fontSize: 12, fontWeight: 600, color: "#182026" }}>{r.objectType}</div>
                                                        <div style={{ padding: "6px 12px" }}>
                                                            <input type="number" value={r.retentionDays}
                                                                onChange={e => {
                                                                    const retention = sel.retention!.map((x, j) => j === ri ? { ...x, retentionDays: Number(e.target.value) } : x);
                                                                    updateSel({ ...sel, retention });
                                                                }}
                                                                style={{ width: "80%", padding: "4px 6px", border: "1px solid #CED9E0", borderRadius: 3, fontSize: 12, background: "#fff" }} />
                                                        </div>
                                                        <div style={{ padding: "6px 8px" }}>
                                                            <select value={r.action} onChange={e => {
                                                                const retention = sel.retention!.map((x, j) => j === ri ? { ...x, action: e.target.value as RetentionAction } : x);
                                                                updateSel({ ...sel, retention });
                                                            }} style={{
                                                                width: "100%", padding: "4px 6px", border: `1px solid ${rc}`, borderRadius: 3,
                                                                fontSize: 11, background: `${rc}10`, color: rc, fontWeight: 700
                                                            }}>
                                                                {(["hard-delete", "soft-delete", "archive", "anonymize"] as RetentionAction[]).map(a => (
                                                                    <option key={a} value={a}>{a}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div style={{ padding: "8px 12px", display: "flex", justifyContent: "center" as const }}>
                                                            <button onClick={() => {
                                                                const retention = sel.retention!.map((x, j) => j === ri ? { ...x, piiField: !x.piiField } : x);
                                                                updateSel({ ...sel, retention });
                                                            }} style={{ border: "none", background: "transparent", cursor: "pointer" }}>
                                                                {r.piiField
                                                                    ? <ToggleRight style={{ width: 18, height: 18, color: "#C23030" }} />
                                                                    : <ToggleLeft style={{ width: 18, height: 18, color: "#8A9BA8" }} />}
                                                            </button>
                                                        </div>
                                                        <div style={{ padding: "8px 12px", display: "flex", justifyContent: "center" as const }}>
                                                            <button onClick={() => {
                                                                const retention = sel.retention!.map((x, j) => j === ri ? { ...x, legalHold: !x.legalHold } : x);
                                                                updateSel({ ...sel, retention });
                                                            }} style={{ border: "none", background: "transparent", cursor: "pointer" }}>
                                                                {r.legalHold
                                                                    ? <Lock style={{ width: 14, height: 14, color: "#D9822B" }} />
                                                                    : <Unlock style={{ width: 14, height: 14, color: "#8A9BA8" }} />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <button onClick={() => updateSel({
                                            ...sel, retention: [...(sel.retention || []),
                                            { objectType: "", retentionDays: 365, action: "archive", piiField: false, legalHold: false }]
                                        })}
                                            style={{ ...btn(false, false, true), marginTop: 8 }}>
                                            <Plus style={{ width: 11, height: 11 }} /> Add retention rule
                                        </button>
                                    </>
                                )}

                                {!sel.retention || sel.retention.length === 0 && (
                                    <button onClick={() => updateSel({ ...sel, retention: [{ objectType: sel.scope[0] ?? "", retentionDays: 365, action: "archive", piiField: false, legalHold: false }] })}
                                        style={btn()}>
                                        <Plus style={{ width: 12, height: 12 }} /> Add retention rules
                                    </button>
                                )}

                                <div style={{
                                    marginTop: 14, padding: "8px 12px", background: "rgba(194,48,48,0.06)",
                                    border: "1px solid rgba(194,48,48,0.25)", borderRadius: 4, display: "flex", gap: 8
                                }}>
                                    <AlertCircle style={{ width: 13, height: 13, color: "#C23030", flexShrink: 0 }} />
                                    <span style={{ fontSize: 11, color: "#8A1818", lineHeight: 1.5 }}>
                                        <strong>Hard Delete</strong> is irrecoverable. Legal Hold overrides retention timers — data cannot be deleted until the hold is lifted. PII fields require GDPR Art.17 review before deletion.
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* ── ESCALATION WORKFLOW ── */}
                        {tab === "escalation" && (
                            <div style={{ maxWidth: 680 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#182026", marginBottom: 4 }}>Escalation Workflow</div>
                                <div style={{ fontSize: 11, color: "#5C7080", marginBottom: 16 }}>
                                    4-tier escalation chain: L1 automated enforcement → L2 notifications → L3 human approval → L4 hard block.
                                    Each tier activates if the previous tier has not resolved the violation within its SLA.
                                </div>

                                {/* Visual escalation ladder */}
                                {sel.escalation.map((step, i) => {
                                    const em = ESCALATION_META[step.level];
                                    return (
                                        <div key={step.level} style={{ position: "relative" as const }}>
                                            {i < sel.escalation.length - 1 && (
                                                <div style={{
                                                    position: "absolute" as const, left: 16, top: 52, width: 2, height: 20,
                                                    background: step.enabled ? "#CED9E0" : "#EBF1F5", zIndex: 0
                                                }} />
                                            )}
                                            <div style={{
                                                background: "#fff", border: `1.5px solid ${step.enabled ? em.color : "#CED9E0"}`,
                                                borderRadius: 4, marginBottom: 24, opacity: step.enabled ? 1 : 0.55,
                                                position: "relative" as const, zIndex: 1
                                            }}>
                                                <div style={{
                                                    padding: "10px 14px", background: step.enabled ? `${em.color}08` : "#F5F8FA",
                                                    borderBottom: "1px solid #EBF1F5", display: "flex", alignItems: "center", gap: 10
                                                }}>
                                                    <div style={{
                                                        width: 30, height: 30, borderRadius: "50%",
                                                        background: step.enabled ? em.color : "#CED9E0",
                                                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                                                    }}>
                                                        <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{i + 1}</span>
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: 12, fontWeight: 700, color: step.enabled ? em.color : "#8A9BA8" }}>{em.label}</div>
                                                        <div style={{ fontSize: 10, color: "#5C7080" }}>
                                                            {step.slaHours === 0 ? "Immediate" : step.slaHours < 24 ? `${step.slaHours}h SLA` : `${Math.floor(step.slaHours / 24)}d SLA`}
                                                        </div>
                                                    </div>
                                                    <button onClick={() => toggleEscalation(i)}
                                                        style={{ border: "none", background: "transparent", cursor: "pointer", display: "flex" }}>
                                                        {step.enabled
                                                            ? <ToggleRight style={{ width: 22, height: 22, color: em.color }} />
                                                            : <ToggleLeft style={{ width: 22, height: 22, color: "#8A9BA8" }} />}
                                                    </button>
                                                </div>
                                                {step.enabled && (
                                                    <div style={{ padding: "10px 14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                                        <div>
                                                            <div style={{ fontSize: 9, fontWeight: 700, color: "#5C7080", textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: 4 }}>Trigger Condition</div>
                                                            <input value={step.trigger}
                                                                onChange={e => {
                                                                    const escalation = sel.escalation.map((s, j) => j === i ? { ...s, trigger: e.target.value } : s);
                                                                    updateSel({ ...sel, escalation });
                                                                }}
                                                                placeholder="e.g. Record age > 90 days"
                                                                style={{
                                                                    width: "100%", padding: "5px 8px", border: "1px solid #CED9E0",
                                                                    borderRadius: 3, fontSize: 11, background: "#fff", boxSizing: "border-box" as const
                                                                }} />
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: 9, fontWeight: 700, color: "#5C7080", textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: 4 }}>
                                                                SLA (hours, 0=immediate)
                                                            </div>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                                <input type="range" min={0} max={168} value={step.slaHours}
                                                                    onChange={e => updateEscalationSLA(i, Number(e.target.value))}
                                                                    style={{ flex: 1, accentColor: em.color, cursor: "pointer" }} />
                                                                <span style={{ fontSize: 11, fontWeight: 700, color: em.color, width: 35 }}>
                                                                    {step.slaHours === 0 ? "Now" : `${step.slaHours}h`}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {step.notifyRoles.length > 0 && (
                                                            <div style={{ gridColumn: "1 / -1" }}>
                                                                <div style={{ fontSize: 9, fontWeight: 700, color: "#5C7080", textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: 4 }}>Notify Roles</div>
                                                                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" as const }}>
                                                                    {step.notifyRoles.map(r => (
                                                                        <span key={r} style={{
                                                                            padding: "2px 8px", borderRadius: 12, border: `1px solid ${em.color}`,
                                                                            background: `${em.color}10`, color: em.color, fontSize: 10, fontWeight: 600
                                                                        }}>
                                                                            <Users style={{ width: 9, height: 9, display: "inline", marginRight: 3 }} />{r}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* ── COMPLIANCE TAGS ── */}
                        {tab === "compliance" && (
                            <div style={{ maxWidth: 600 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#182026", marginBottom: 4 }}>Compliance Tags</div>
                                <div style={{ fontSize: 11, color: "#5C7080", marginBottom: 16 }}>
                                    Tag this policy against regulatory frameworks. Tags are used for compliance reporting and audit trail cross-referencing.
                                </div>

                                {/* Grouped by framework */}
                                {["GDPR", "CCPA", "EU-AI-ACT", "NIST", "ISO", "SOC"].map(fw => {
                                    const tags = COMPLIANCE_TAGS.filter(t => t.framework === fw);
                                    if (!tags.length) return null;
                                    return (
                                        <div key={fw} style={{ marginBottom: 16 }}>
                                            <div style={{
                                                fontSize: 10, fontWeight: 700, color: "#5C7080", textTransform: "uppercase" as const,
                                                letterSpacing: "0.08em", marginBottom: 8
                                            }}>{fw}</div>
                                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                                                {tags.map(t => {
                                                    const active = sel.complianceTags.includes(t.id);
                                                    return (
                                                        <button key={t.id} onClick={() => toggleComplianceTag(t.id)}
                                                            style={{
                                                                display: "flex", alignItems: "center", gap: 6, padding: "6px 14px",
                                                                borderRadius: 4, cursor: "pointer", fontSize: 11, fontWeight: 600,
                                                                border: `1.5px solid ${active ? t.color : "#CED9E0"}`,
                                                                background: active ? `${t.color}12` : "#fff",
                                                                color: active ? t.color : "#5C7080"
                                                            }}>
                                                            {active && <Check style={{ width: 11, height: 11 }} />}
                                                            {t.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}

                                <div style={{
                                    marginTop: 16, padding: "10px 14px", background: "#fff",
                                    border: "1px solid #CED9E0", borderRadius: 4
                                }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: "#182026", marginBottom: 8 }}>
                                        Active Tags ({sel.complianceTags.length})
                                    </div>
                                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                                        {sel.complianceTags.length === 0
                                            ? <span style={{ fontSize: 11, color: "#8A9BA8" }}>No compliance tags assigned</span>
                                            : sel.complianceTags.map(tid => {
                                                const t = COMPLIANCE_TAGS.find(x => x.id === tid);
                                                if (!t) return null;
                                                return (
                                                    <span key={tid} style={{
                                                        display: "flex", alignItems: "center", gap: 4,
                                                        padding: "4px 10px", borderRadius: 12, border: `1px solid ${t.color}`,
                                                        background: `${t.color}12`, color: t.color, fontSize: 11, fontWeight: 600
                                                    }}>
                                                        <Tag style={{ width: 10, height: 10 }} />{t.label}
                                                        <button onClick={() => toggleComplianceTag(tid)}
                                                            style={{
                                                                border: "none", background: "transparent", cursor: "pointer",
                                                                color: t.color, display: "flex", padding: 0, marginLeft: 2
                                                            }}>
                                                            <X style={{ width: 10, height: 10 }} />
                                                        </button>
                                                    </span>
                                                );
                                            })}
                                    </div>
                                </div>

                                <div style={{
                                    marginTop: 12, padding: "8px 12px", background: "#FFF3E0",
                                    border: "1px solid #F5C894", borderRadius: 4, display: "flex", gap: 8
                                }}>
                                    <AlertTriangle style={{ width: 13, height: 13, color: "#D9822B", flexShrink: 0 }} />
                                    <span style={{ fontSize: 11, color: "#77450D", lineHeight: 1.5 }}>
                                        Compliance tags appear in Audit Log events and are used for regulatory reporting exports.
                                        EU AI Act tags trigger mandatory risk tier assignment.
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


