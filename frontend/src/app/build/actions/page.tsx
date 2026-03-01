"use client";
import { useState } from "react";
import {
    Zap, Plus, Shield, Check, X, AlertTriangle, Info,
    ChevronDown, Play, Copy, RefreshCw, Eye, Lock, Edit3,
    Trash2, Link2, Settings, Users, ToggleLeft, ToggleRight, ArrowRight
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type ActionCategory = "create" | "edit" | "delete" | "link" | "function-backed";
type RiskTier = "low" | "medium" | "high" | "critical";
type ActionStatus = "active" | "draft" | "deprecated";
type ParamType = "string" | "number" | "boolean" | "object-reference" | "enum" | "timestamp";
type ValidState = "VALID" | "INVALID" | "PENDING" | null;

interface ActionParam {
    id: string;
    name: string;
    type: ParamType;
    required: boolean;
    description: string;
    validation?: string; // submission criterion
    enumValues?: string[];
    value: string; // current sim value
    validState: ValidState;
    errorMsg?: string;
}

interface RbacEntry {
    role: string;
    canView: boolean;
    canEdit: boolean;
    canApply: boolean;
    canAdmin: boolean;
}

interface ApprovalRule {
    id: string;
    condition: string;
    approvers: string;
    minApprovals: number;
    timeout: string;
}

interface ActionType {
    id: string;
    name: string;
    category: ActionCategory;
    objectType: string;
    description: string;
    status: ActionStatus;
    riskTier: RiskTier;
    usages: number;
    lastUsed: string;
    params: ActionParam[];
    rbac: RbacEntry[];
    approvalRules: ApprovalRule[];
    writesTo: string[];
}

// ── Constants ─────────────────────────────────────────────────────────────────
const OBJECT_TYPES = ["Drone", "Mission", "Pilot", "Equipment", "Alert", "WorkOrder"];
const ROLES = ["Admin", "Mission Commander", "Operator", "Analyst", "Viewer"];

const RISK_CONFIG: Record<RiskTier, { label: string; bg: string; fg: string; border: string; desc: string; approvals: number }> = {
    low: { label: "Low", bg: "#E6F7F0", fg: "#0D8050", border: "#0D8050", desc: "Self-approve. No review required.", approvals: 0 },
    medium: { label: "Medium", bg: "#EBF4FC", fg: "#137CBD", border: "#137CBD", desc: "Peer review required from 1 approver.", approvals: 1 },
    high: { label: "High", bg: "#FFF3E0", fg: "#D9822B", border: "#D9822B", desc: "Dual approval required + audit log entry.", approvals: 2 },
    critical: { label: "Critical", bg: "rgba(194,48,48,0.08)", fg: "#C23030", border: "#C23030", desc: "Mission Commander + Admin must both approve. Irreversible.", approvals: 3 },
};

const CAT_META: Record<ActionCategory, { icon: React.ElementType; color: string }> = {
    "create": { icon: Plus, color: "#0D8050" },
    "edit": { icon: Edit3, color: "#137CBD" },
    "delete": { icon: Trash2, color: "#C23030" },
    "link": { icon: Link2, color: "#7157D9" },
    "function-backed": { icon: Zap, color: "#D9822B" },
};

const STATUS_STYLE: Record<ActionStatus, [string, string]> = {
    active: ["#E6F7F0", "#0D8050"],
    draft: ["#EBF4FC", "#137CBD"],
    deprecated: ["#EBF1F5", "#5C7080"],
};

// ── Seed action types ─────────────────────────────────────────────────────────
const SEED_ACTIONS: ActionType[] = [
    {
        id: "a1", name: "EscalateMission", category: "edit",
        objectType: "Mission", description: "Escalates a mission to critical priority and notifies the Mission Commander.",
        status: "active", riskTier: "high", usages: 312, lastUsed: "4 min ago",
        writesTo: ["Mission.priority", "Mission.escalatedAt", "Alert (create)"],
        params: [
            { id: "p1", name: "missionId", type: "object-reference", required: true, description: "Target mission to escalate", validation: "mission.status != 'COMPLETED'", value: "MSN-8821", validState: "VALID" },
            { id: "p2", name: "reason", type: "string", required: true, description: "Escalation justification (min 20 chars)", validation: "reason.length >= 20", value: "Engine failure confirmed in sector 4", validState: "VALID" },
            { id: "p3", name: "notifyPilot", type: "boolean", required: false, description: "Send push notification to assigned pilot", value: "true", validState: "VALID" },
            { id: "p4", name: "newPriority", type: "enum", required: true, description: "New priority level", enumValues: ["high", "critical"], validation: "newPriority in ['high','critical']", value: "critical", validState: "VALID" },
        ],
        rbac: [
            { role: "Admin", canView: true, canEdit: true, canApply: true, canAdmin: true },
            { role: "Mission Commander", canView: true, canEdit: true, canApply: true, canAdmin: false },
            { role: "Operator", canView: true, canEdit: false, canApply: true, canAdmin: false },
            { role: "Analyst", canView: true, canEdit: false, canApply: false, canAdmin: false },
            { role: "Viewer", canView: true, canEdit: false, canApply: false, canAdmin: false },
        ],
        approvalRules: [
            { id: "ar1", condition: "Always", approvers: "Mission Commander", minApprovals: 1, timeout: "30 min" },
            { id: "ar2", condition: "If priority == critical", approvers: "Admin", minApprovals: 1, timeout: "15 min" },
        ],
    },
    {
        id: "a2", name: "DecommissionDrone", category: "delete",
        objectType: "Drone", description: "Permanently decommissions a drone from the fleet. Irreversible.",
        status: "active", riskTier: "critical", usages: 14, lastUsed: "2 hr ago",
        writesTo: ["Drone.status", "Drone.decommissionedAt", "Equipment (unlink)"],
        params: [
            { id: "p5", name: "droneId", type: "object-reference", required: true, description: "Drone to decommission", validation: "drone.status == 'GROUNDED'", value: "", validState: null },
            { id: "p6", name: "reason", type: "enum", required: true, description: "Reason for decommission", enumValues: ["End of Life", "Damage", "Missing", "Incident"], value: "Damage", validState: "VALID" },
            { id: "p7", name: "confirmCheckbox", type: "boolean", required: true, description: "Confirm: this action is irreversible", validation: "confirmCheckbox == true", value: "false", validState: "INVALID", errorMsg: "You must confirm this is irreversible" },
        ],
        rbac: [
            { role: "Admin", canView: true, canEdit: true, canApply: true, canAdmin: true },
            { role: "Mission Commander", canView: true, canEdit: false, canApply: false, canAdmin: false },
            { role: "Operator", canView: true, canEdit: false, canApply: false, canAdmin: false },
            { role: "Analyst", canView: true, canEdit: false, canApply: false, canAdmin: false },
            { role: "Viewer", canView: true, canEdit: false, canApply: false, canAdmin: false },
        ],
        approvalRules: [
            { id: "ar3", condition: "Always", approvers: "Mission Commander + Admin", minApprovals: 2, timeout: "1 hr" },
        ],
    },
    {
        id: "a3", name: "AssignPilot", category: "link",
        objectType: "Mission", description: "Links a pilot to a mission and updates their availability status.",
        status: "active", riskTier: "medium", usages: 891, lastUsed: "9 min ago",
        writesTo: ["Mission.assignedPilotId", "Pilot.availability"],
        params: [
            { id: "p8", name: "missionId", type: "object-reference", required: true, description: "Target mission", value: "MSN-7201", validState: "VALID" },
            { id: "p9", name: "pilotId", type: "object-reference", required: true, description: "Pilot to assign", validation: "pilot.availability == 'AVAILABLE'", value: "", validState: null },
        ],
        rbac: [
            { role: "Admin", canView: true, canEdit: true, canApply: true, canAdmin: true },
            { role: "Mission Commander", canView: true, canEdit: true, canApply: true, canAdmin: false },
            { role: "Operator", canView: true, canEdit: false, canApply: true, canAdmin: false },
            { role: "Analyst", canView: true, canEdit: false, canApply: false, canAdmin: false },
            { role: "Viewer", canView: true, canEdit: false, canApply: false, canAdmin: false },
        ],
        approvalRules: [
            { id: "ar4", condition: "Always", approvers: "Mission Commander", minApprovals: 1, timeout: "1 hr" },
        ],
    },
    {
        id: "a4", name: "CreateWorkOrder", category: "create",
        objectType: "WorkOrder", description: "Creates a maintenance work order for a piece of equipment.",
        status: "active", riskTier: "low", usages: 2041, lastUsed: "1 min ago",
        writesTo: ["WorkOrder (create)", "Equipment.maintenanceDue"],
        params: [
            { id: "p10", name: "equipmentId", type: "object-reference", required: true, description: "Target equipment", value: "EQP-0041", validState: "VALID" },
            { id: "p11", name: "priority", type: "enum", required: true, description: "Work order priority", enumValues: ["low", "medium", "high", "critical"], value: "medium", validState: "VALID" },
            { id: "p12", name: "description", type: "string", required: true, description: "What needs to be done (min 10 chars)", validation: "description.length >= 10", value: "Replace battery pack", validState: "VALID" },
            { id: "p13", name: "dueDate", type: "timestamp", required: false, description: "Target completion date", value: "2025-07-05T09:00:00Z", validState: "VALID" },
        ],
        rbac: [
            { role: "Admin", canView: true, canEdit: true, canApply: true, canAdmin: true },
            { role: "Mission Commander", canView: true, canEdit: true, canApply: true, canAdmin: false },
            { role: "Operator", canView: true, canEdit: false, canApply: true, canAdmin: false },
            { role: "Analyst", canView: true, canEdit: false, canApply: false, canAdmin: false },
            { role: "Viewer", canView: true, canEdit: false, canApply: false, canAdmin: false },
        ],
        approvalRules: [],
    },
    {
        id: "a5", name: "RunRiskAssessmentAI", category: "function-backed",
        objectType: "Mission", description: "Invokes an AIP Logic function to compute mission risk score using LLM + ontology context.",
        status: "draft", riskTier: "medium", usages: 0, lastUsed: "never",
        writesTo: ["Mission.riskScore", "Mission.riskSummary"],
        params: [
            { id: "p14", name: "missionId", type: "object-reference", required: true, description: "Mission to assess", value: "", validState: null },
            { id: "p15", name: "modelId", type: "enum", required: true, description: "AIP model to use", enumValues: ["gpt-4o", "claude-3-opus", "gemini-1.5-pro"], value: "gpt-4o", validState: "VALID" },
        ],
        rbac: [
            { role: "Admin", canView: true, canEdit: true, canApply: true, canAdmin: true },
            { role: "Mission Commander", canView: true, canEdit: false, canApply: true, canAdmin: false },
            { role: "Operator", canView: true, canEdit: false, canApply: false, canAdmin: false },
            { role: "Analyst", canView: true, canEdit: false, canApply: false, canAdmin: false },
            { role: "Viewer", canView: true, canEdit: false, canApply: false, canAdmin: false },
        ],
        approvalRules: [
            { id: "ar5", condition: "Always", approvers: "Mission Commander", minApprovals: 1, timeout: "2 hr" },
        ],
    },
];

// ── Shared styles ─────────────────────────────────────────────────────────────
const btn = (primary = false, danger = false): React.CSSProperties => ({
    height: 28, padding: "0 11px", borderRadius: 3, fontSize: 12, fontWeight: 600,
    cursor: "pointer",
    border: danger ? "1px solid #C23030" : primary ? "none" : "1px solid #CED9E0",
    background: danger ? "rgba(194,48,48,0.08)" : primary ? "#137CBD" : "#fff",
    color: danger ? "#C23030" : primary ? "#fff" : "#394B59",
    display: "flex", alignItems: "center", gap: 5,
});
const tabStyle = (active: boolean): React.CSSProperties => ({
    fontSize: 12, padding: "6px 14px", cursor: "pointer", border: "none",
    background: "transparent",
    borderBottom: active ? "2px solid #137CBD" : "2px solid transparent",
    color: active ? "#137CBD" : "#5C7080", fontWeight: active ? 600 : 400,
});
const label = (text: string): React.ReactNode => (
    <div style={{
        fontSize: 10, fontWeight: 700, color: "#5C7080",
        textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4
    }}>
        {text}
    </div>
);

// ── Payload preview generator ──────────────────────────────────────────────────
function buildPayload(action: ActionType): string {
    const params: Record<string, unknown> = {};
    action.params.forEach(p => {
        if (p.type === "boolean") params[p.name] = p.value === "true";
        else if (p.type === "number") params[p.name] = Number(p.value) || 0;
        else params[p.name] = p.value || null;
    });
    return JSON.stringify({
        actionType: action.name,
        objectType: action.objectType,
        parameters: params,
        metadata: {
            requestedBy: "current-user",
            timestamp: new Date().toISOString(),
            riskTier: action.riskTier,
        }
    }, null, 2);
}

function validatePayload(params: ActionParam[]): ActionParam[] {
    return params.map(p => {
        if (p.required && !p.value) {
            return { ...p, validState: "INVALID" as ValidState, errorMsg: `${p.name} is required` };
        }
        if (p.validation?.includes("length >= ")) {
            const min = parseInt(p.validation.split("length >= ")[1]);
            if (p.value.length < min) {
                return { ...p, validState: "INVALID" as ValidState, errorMsg: `Must be at least ${min} characters` };
            }
        }
        if (p.name === "confirmCheckbox" && p.value !== "true") {
            return { ...p, validState: "INVALID" as ValidState, errorMsg: "You must confirm this is irreversible" };
        }
        if (p.value) return { ...p, validState: "VALID" as ValidState, errorMsg: undefined };
        return p;
    });
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ActionsPage() {
    const [actions, setActions] = useState<ActionType[]>(SEED_ACTIONS);
    const [sel, setSel] = useState<ActionType>(SEED_ACTIONS[0]);
    const [tab, setTab] = useState<"general" | "schema" | "permissions" | "risk" | "simulation">("general");
    const [simRun, setSimRun] = useState(false);
    const [copied, setCopied] = useState(false);

    const updateSel = (a: ActionType) => {
        setSel(a);
        setActions(prev => prev.map(x => x.id === a.id ? a : x));
    };

    const updateParam = (idx: number, patch: Partial<ActionParam>) => {
        const params = [...sel.params];
        params[idx] = { ...params[idx], ...patch };
        updateSel({ ...sel, params });
    };

    const toggleRbac = (roleIdx: number, field: keyof RbacEntry) => {
        const rbac = sel.rbac.map((r, i) => i === roleIdx ? { ...r, [field]: !(r as Record<keyof RbacEntry, boolean | string>)[field] } : r);
        updateSel({ ...sel, rbac });
    };

    const runSim = () => {
        const validated = validatePayload(sel.params);
        updateSel({ ...sel, params: validated });
        setSimRun(true);
        setTab("simulation");
    };

    const allValid = sel.params.filter(p => p.required).every(p => p.validState === "VALID");
    const hasErrors = sel.params.some(p => p.validState === "INVALID");
    const risk = RISK_CONFIG[sel.riskTier];
    const CatIcon = CAT_META[sel.category].icon;
    const catColor = CAT_META[sel.category].color;
    const [stBg, stFg] = STATUS_STYLE[sel.status];
    const payload = buildPayload(sel);

    return (
        <div style={{
            display: "flex", flexDirection: "column", height: "100%",
            background: "#F5F8FA", fontFamily: "Inter, sans-serif"
        }}>

            {/* ── Top bar ── */}
            <div style={{
                height: 44, display: "flex", alignItems: "center", padding: "0 14px",
                background: "#fff", borderBottom: "1px solid #CED9E0", gap: 8, flexShrink: 0
            }}>
                <Zap style={{ width: 16, height: 16, color: "#D9822B" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#182026" }}>Actions</span>
                <div style={{ width: 1, height: 16, background: "#CED9E0", margin: "0 4px" }} />
                <span style={{ fontSize: 11, color: "#5C7080" }}>Ontology Manager · Action Types</span>
                <div style={{ flex: 1 }} />
                <button style={btn()}>
                    <RefreshCw style={{ width: 12, height: 12 }} /> Refresh
                </button>
                <button onClick={() => {
                    const a: ActionType = {
                        id: `a${Date.now()}`, name: "NewAction", category: "edit",
                        objectType: "Drone", description: "", status: "draft",
                        riskTier: "low", usages: 0, lastUsed: "never",
                        params: [], rbac: ROLES.map(r => ({ role: r, canView: true, canEdit: false, canApply: false, canAdmin: false })),
                        approvalRules: [], writesTo: [],
                    };
                    setActions(prev => [...prev, a]);
                    setSel(a); setSimRun(false);
                }} style={btn(true)}>
                    <Plus style={{ width: 13, height: 13 }} /> New Action Type
                </button>
            </div>

            <div style={{ flex: 1, display: "flex", minHeight: 0 }}>

                {/* ── Action List ── */}
                <div style={{
                    width: 265, background: "#fff", borderRight: "1px solid #CED9E0",
                    display: "flex", flexDirection: "column", flexShrink: 0
                }}>
                    <div style={{
                        padding: "8px 12px", fontSize: 10, fontWeight: 700, color: "#5C7080",
                        letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: "1px solid #EBF1F5"
                    }}>
                        Action Types ({actions.length})
                    </div>
                    <div style={{ flex: 1, overflowY: "auto" }}>
                        {actions.map(a => {
                            const R = RISK_CONFIG[a.riskTier];
                            const CI = CAT_META[a.category].icon;
                            const cc = CAT_META[a.category].color;
                            return (
                                <div key={a.id} onClick={() => { setSel(a); setSimRun(false); }}
                                    style={{
                                        padding: "10px 12px", cursor: "pointer", borderBottom: "1px solid #EBF1F5",
                                        borderLeft: sel.id === a.id ? "2px solid #D9822B" : "2px solid transparent",
                                        background: sel.id === a.id ? "rgba(217,130,43,0.04)" : "transparent"
                                    }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <div style={{
                                            width: 20, height: 20, borderRadius: 3, background: cc + "18",
                                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                                        }}>
                                            <CI style={{ width: 11, height: 11, color: cc }} />
                                        </div>
                                        <span style={{
                                            fontSize: 12, fontWeight: 600, color: "#182026", flex: 1,
                                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                                        }}>
                                            {a.name}
                                        </span>
                                        <span style={{
                                            fontSize: 9, padding: "1px 5px", borderRadius: 3, fontWeight: 700,
                                            background: R.bg, color: R.fg, whiteSpace: "nowrap"
                                        }}>
                                            {R.label}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 10, color: "#5C7080", marginTop: 2, paddingLeft: 26 }}>
                                        {a.objectType} · {a.category} · {a.usages.toLocaleString()} uses
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Right Panel ── */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

                    {/* Action header */}
                    <div style={{
                        display: "flex", alignItems: "center", gap: 8, padding: "0 16px",
                        height: 44, background: "#fff", borderBottom: "1px solid #CED9E0", flexShrink: 0
                    }}>
                        <div style={{
                            width: 24, height: 24, borderRadius: 4, display: "flex",
                            alignItems: "center", justifyContent: "center", background: catColor + "18"
                        }}>
                            <CatIcon style={{ width: 14, height: 14, color: catColor }} />
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#182026" }}>{sel.name}</span>
                        <span style={{ fontSize: 11, color: "#8A9BA8" }}>·</span>
                        <span style={{ fontSize: 11, color: "#5C7080" }}>{sel.objectType}</span>
                        <span style={{
                            fontSize: 9, padding: "1px 6px", borderRadius: 3, fontWeight: 700,
                            background: stBg, color: stFg
                        }}>{sel.status}</span>
                        <div style={{ flex: 1 }} />

                        {/* Risk tier badge */}
                        <div style={{
                            display: "flex", alignItems: "center", gap: 5,
                            padding: "3px 10px", borderRadius: 3, border: `1px solid ${risk.border}`,
                            background: risk.bg
                        }}>
                            <Shield style={{ width: 12, height: 12, color: risk.fg }} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: risk.fg }}>{risk.label} Risk</span>
                        </div>

                        {/* Validation */}
                        {allValid && (
                            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#0D8050" }}>
                                <Check style={{ width: 13, height: 13 }} /> VALID
                            </div>
                        )}
                        {hasErrors && (
                            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#C23030" }}>
                                <AlertTriangle style={{ width: 13, height: 13 }} /> INVALID
                            </div>
                        )}

                        <button onClick={runSim} style={btn()}>
                            <Play style={{ width: 12, height: 12 }} /> Simulate
                        </button>
                        <button style={btn(true)}>Save</button>
                    </div>

                    {/* Tabs */}
                    <div style={{
                        display: "flex", background: "#fff", borderBottom: "1px solid #CED9E0",
                        padding: "0 4px", flexShrink: 0
                    }}>
                        {(["general", "schema", "permissions", "risk", "simulation"] as const).map(t => (
                            <button key={t} onClick={() => setTab(t)} style={tabStyle(tab === t)}>
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                        ))}
                        <div style={{ flex: 1 }} />
                        <div style={{
                            display: "flex", alignItems: "center", gap: 12, padding: "0 12px",
                            fontSize: 11, color: "#5C7080"
                        }}>
                            <span>Last used: {sel.lastUsed}</span>
                            <span>{sel.usages.toLocaleString()} executions</span>
                        </div>
                    </div>

                    <div style={{ flex: 1, overflow: "auto", padding: 20 }}>

                        {/* ── GENERAL ── */}
                        {tab === "general" && (
                            <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 14 }}>
                                {/* Name */}
                                <div>
                                    {label("Action Name")}
                                    <input value={sel.name} onChange={e => updateSel({ ...sel, name: e.target.value })}
                                        style={{
                                            width: "100%", padding: "6px 10px", border: "1px solid #CED9E0",
                                            borderRadius: 3, fontSize: 13, background: "#fff"
                                        }} />
                                </div>
                                {/* Category */}
                                <div>
                                    {label("Action Category")}
                                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                        {(Object.entries(CAT_META) as [ActionCategory, { icon: React.ElementType; color: string }][]).map(([cat, meta]) => {
                                            const CI = meta.icon;
                                            return (
                                                <button key={cat} onClick={() => updateSel({ ...sel, category: cat })}
                                                    style={{
                                                        display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                                                        borderRadius: 3, cursor: "pointer", fontSize: 11, fontWeight: 600,
                                                        border: `1.5px solid ${sel.category === cat ? meta.color : "#CED9E0"}`,
                                                        background: sel.category === cat ? meta.color + "12" : "#fff",
                                                        color: sel.category === cat ? meta.color : "#5C7080"
                                                    }}>
                                                    <CI style={{ width: 12, height: 12 }} /> {cat}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                {/* Object type */}
                                <div>
                                    {label("Target Object Type")}
                                    <select value={sel.objectType} onChange={e => updateSel({ ...sel, objectType: e.target.value })}
                                        style={{
                                            width: "100%", padding: "6px 10px", border: "1px solid #CED9E0",
                                            borderRadius: 3, fontSize: 12, background: "#fff"
                                        }}>
                                        {OBJECT_TYPES.map(o => <option key={o}>{o}</option>)}
                                    </select>
                                </div>
                                {/* Description */}
                                <div>
                                    {label("Description")}
                                    <textarea value={sel.description} onChange={e => updateSel({ ...sel, description: e.target.value })}
                                        rows={3} style={{
                                            width: "100%", padding: "6px 10px", border: "1px solid #CED9E0",
                                            borderRadius: 3, fontSize: 12, background: "#fff", resize: "vertical",
                                            fontFamily: "Inter, sans-serif"
                                        }} />
                                </div>
                                {/* Writes to */}
                                <div>
                                    {label("Writes To (Properties / Object Types)")}
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                        {sel.writesTo.map(w => (
                                            <span key={w} style={{
                                                fontSize: 11, padding: "2px 8px", borderRadius: 3,
                                                background: "#EBF4FC", color: "#137CBD", border: "1px solid #B3D7F5"
                                            }}>
                                                {w}
                                            </span>
                                        ))}
                                        <button style={{ ...btn(), height: 24, fontSize: 11, padding: "0 8px" }}>
                                            <Plus style={{ width: 10, height: 10 }} /> Add
                                        </button>
                                    </div>
                                </div>
                                {/* Status */}
                                <div>
                                    {label("Status")}
                                    <select value={sel.status} onChange={e => updateSel({ ...sel, status: e.target.value as ActionStatus })}
                                        style={{
                                            width: "100%", padding: "6px 10px", border: "1px solid #CED9E0",
                                            borderRadius: 3, fontSize: 12, background: "#fff"
                                        }}>
                                        {["active", "draft", "deprecated"].map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                                <button style={btn(true)}>Save General</button>
                            </div>
                        )}

                        {/* ── SCHEMA (Parameters) ── */}
                        {tab === "schema" && (
                            <div style={{ maxWidth: 780 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: "#182026" }}>Input Parameters</span>
                                    <span style={{ fontSize: 11, color: "#5C7080" }}>{sel.params.length} params</span>
                                    <div style={{ flex: 1 }} />
                                    <button style={{ ...btn(), fontSize: 11 }}>
                                        <Plus style={{ width: 11, height: 11 }} /> Add Parameter
                                    </button>
                                </div>

                                {sel.params.map((p, i) => (
                                    <div key={p.id} style={{
                                        background: "#fff", border: `1px solid ${p.validState === "INVALID" ? "#C23030" : "#CED9E0"}`,
                                        borderRadius: 4, marginBottom: 10, overflow: "hidden"
                                    }}>
                                        {/* Param header */}
                                        <div style={{
                                            display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
                                            background: "#F5F8FA", borderBottom: "1px solid #EBF1F5"
                                        }}>
                                            <span style={{ fontSize: 12, fontWeight: 700, color: "#182026", flex: 1 }}>{p.name}</span>
                                            <span style={{
                                                fontSize: 10, padding: "1px 6px", borderRadius: 3,
                                                background: p.type === "object-reference" ? "rgba(113,87,217,0.1)" : "rgba(19,124,189,0.1)",
                                                color: p.type === "object-reference" ? "#7157D9" : "#137CBD", fontWeight: 700
                                            }}>
                                                {p.type}
                                            </span>
                                            {p.required && (
                                                <span style={{
                                                    fontSize: 9, padding: "1px 5px", borderRadius: 3,
                                                    background: "rgba(194,48,48,0.1)", color: "#C23030", fontWeight: 700
                                                }}>REQUIRED</span>
                                            )}
                                            {p.validState === "VALID" && <Check style={{ width: 14, height: 14, color: "#0D8050" }} />}
                                            {p.validState === "INVALID" && <AlertTriangle style={{ width: 14, height: 14, color: "#C23030" }} />}
                                        </div>

                                        {/* Param config */}
                                        <div style={{ padding: "10px 14px", display: "flex", gap: 16, flexWrap: "wrap" }}>
                                            <div style={{ flex: "1 1 160px" }}>
                                                {label("Type")}
                                                <select value={p.type} onChange={e => updateParam(i, { type: e.target.value as ParamType })}
                                                    style={{
                                                        width: "100%", padding: "5px 8px", border: "1px solid #CED9E0",
                                                        borderRadius: 3, fontSize: 11, background: "#fff"
                                                    }}>
                                                    {["string", "number", "boolean", "object-reference", "enum", "timestamp"].map(t => <option key={t}>{t}</option>)}
                                                </select>
                                            </div>
                                            <div style={{ flex: "2 1 280px" }}>
                                                {label("Description")}
                                                <input value={p.description} onChange={e => updateParam(i, { description: e.target.value })}
                                                    style={{
                                                        width: "100%", padding: "5px 8px", border: "1px solid #CED9E0",
                                                        borderRadius: 3, fontSize: 11, background: "#fff"
                                                    }} />
                                            </div>
                                            <div style={{ flex: "1 1 160px" }}>
                                                {label("Required")}
                                                <button onClick={() => updateParam(i, { required: !p.required })}
                                                    style={{
                                                        display: "flex", alignItems: "center", gap: 5, padding: "5px 10px",
                                                        cursor: "pointer", borderRadius: 3, fontSize: 11, fontWeight: 600,
                                                        border: `1px solid ${p.required ? "#0D8050" : "#CED9E0"}`,
                                                        background: p.required ? "#E6F7F0" : "#fff",
                                                        color: p.required ? "#0D8050" : "#5C7080"
                                                    }}>
                                                    {p.required ? <ToggleRight style={{ width: 14, height: 14 }} /> : <ToggleLeft style={{ width: 14, height: 14 }} />}
                                                    {p.required ? "Required" : "Optional"}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Submission criterion */}
                                        {p.validation && (
                                            <div style={{ padding: "0 14px 10px", display: "flex", gap: 8, alignItems: "center" }}>
                                                <div style={{ flex: 1 }}>
                                                    {label("Submission Criterion")}
                                                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                                        <input value={p.validation}
                                                            onChange={e => updateParam(i, { validation: e.target.value })}
                                                            style={{
                                                                flex: 1, padding: "5px 8px", border: "1px solid #B3D7F5",
                                                                borderRadius: 3, fontSize: 11, background: "#EBF4FC", color: "#137CBD", fontFamily: "monospace"
                                                            }} />
                                                        {p.validState === "INVALID" && (
                                                            <span style={{ fontSize: 10, color: "#C23030" }}>{p.errorMsg}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ── PERMISSIONS (RBAC Matrix) ── */}
                        {tab === "permissions" && (
                            <div style={{ maxWidth: 700 }}>
                                <div style={{ marginBottom: 16 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: "#182026", marginBottom: 4 }}>RBAC Permissions Matrix</div>
                                    <div style={{ fontSize: 11, color: "#5C7080" }}>
                                        Defines who can View, Edit, Apply (submit), and Admin this action type.
                                        Based on Foundry RBAC roles: Owner / Editor / Viewer / Discoverer model.
                                    </div>
                                </div>

                                <div style={{ background: "#fff", border: "1px solid #CED9E0", borderRadius: 4, overflow: "hidden" }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                        <thead>
                                            <tr style={{ background: "#F5F8FA" }}>
                                                <th style={{
                                                    padding: "10px 16px", textAlign: "left", fontSize: 11,
                                                    fontWeight: 700, color: "#5C7080", borderBottom: "1px solid #CED9E0",
                                                    borderRight: "1px solid #EBF1F5", width: 180
                                                }}>Role</th>
                                                {["View", "Edit", "Apply", "Admin"].map(h => (
                                                    <th key={h} style={{
                                                        padding: "10px 0", textAlign: "center", width: 90,
                                                        fontSize: 11, fontWeight: 700, color: "#5C7080",
                                                        borderBottom: "1px solid #CED9E0", borderRight: "1px solid #EBF1F5"
                                                    }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sel.rbac.map((r, ri) => (
                                                <tr key={r.role} style={{
                                                    borderBottom: "1px solid #EBF1F5",
                                                    background: ri % 2 === 0 ? "#fff" : "#FAFBFC"
                                                }}>
                                                    <td style={{
                                                        padding: "10px 16px", fontWeight: 500, fontSize: 12,
                                                        color: "#182026", borderRight: "1px solid #EBF1F5"
                                                    }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                            <Users style={{ width: 12, height: 12, color: "#5C7080" }} />
                                                            {r.role}
                                                        </div>
                                                    </td>
                                                    {(["canView", "canEdit", "canApply", "canAdmin"] as (keyof RbacEntry)[]).map(field => (
                                                        <td key={field} style={{
                                                            padding: "10px 0", textAlign: "center",
                                                            borderRight: "1px solid #EBF1F5"
                                                        }}>
                                                            <button
                                                                onClick={() => field !== "canView" && toggleRbac(ri, field)}
                                                                disabled={field === "canView"}
                                                                style={{
                                                                    width: 24, height: 24, borderRadius: 4, border: "none",
                                                                    cursor: field === "canView" ? "default" : "pointer",
                                                                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                                                                    background: r[field] ? "#E6F7F0" : "#EBF1F5",
                                                                    opacity: field === "canView" ? 0.6 : 1
                                                                }}>
                                                                {r[field]
                                                                    ? <Check style={{ width: 13, height: 13, color: "#0D8050" }} />
                                                                    : <X style={{ width: 13, height: 13, color: "#B3BEC5" }} />}
                                                            </button>
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Info */}
                                <div style={{
                                    marginTop: 12, padding: "8px 12px", background: "#EBF4FC",
                                    border: "1px solid #B3D7F5", borderRadius: 4,
                                    display: "flex", gap: 8, alignItems: "flex-start"
                                }}>
                                    <Info style={{ width: 14, height: 14, color: "#137CBD", flexShrink: 0, marginTop: 1 }} />
                                    <span style={{ fontSize: 11, color: "#1F4E79", lineHeight: 1.5 }}>
                                        "View" is always enabled. "Apply" requires the action's submission criteria to pass.
                                        "Admin" grants full configuration rights including deletion.
                                    </span>
                                </div>
                                <div style={{ marginTop: 12 }}>
                                    <button style={btn(true)}>Save Permissions</button>
                                </div>
                            </div>
                        )}

                        {/* ── RISK ── */}
                        {tab === "risk" && (
                            <div style={{ maxWidth: 640 }}>
                                <div style={{ marginBottom: 16 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: "#182026", marginBottom: 4 }}>Risk Tier Classification</div>
                                    <div style={{ fontSize: 11, color: "#5C7080" }}>
                                        Determines what approval workflow is triggered when this action is submitted.
                                    </div>
                                </div>

                                {/* Risk tier selector */}
                                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                                    {(Object.entries(RISK_CONFIG) as [RiskTier, typeof RISK_CONFIG[RiskTier]][]).map(([tier, cfg]) => (
                                        <div key={tier} onClick={() => updateSel({ ...sel, riskTier: tier })}
                                            style={{
                                                display: "flex", alignItems: "flex-start", gap: 14, padding: "12px 16px",
                                                cursor: "pointer", borderRadius: 4,
                                                border: `1.5px solid ${sel.riskTier === tier ? cfg.border : "#CED9E0"}`,
                                                background: sel.riskTier === tier ? cfg.bg : "#fff",
                                                position: "relative"
                                            }}>
                                            {sel.riskTier === tier && (
                                                <div style={{ position: "absolute", top: 12, right: 14 }}>
                                                    <Check style={{ width: 14, height: 14, color: cfg.fg }} />
                                                </div>
                                            )}
                                            <div style={{
                                                width: 32, height: 32, borderRadius: 6, background: cfg.fg + "18",
                                                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                                            }}>
                                                <Shield style={{ width: 16, height: 16, color: cfg.fg }} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: "#182026", marginBottom: 2 }}>
                                                    {cfg.label} Risk
                                                </div>
                                                <div style={{ fontSize: 11, color: "#5C7080", lineHeight: 1.5 }}>{cfg.desc}</div>
                                                {cfg.approvals > 0 && (
                                                    <div style={{ fontSize: 10, fontWeight: 700, color: cfg.fg, marginTop: 4 }}>
                                                        Requires {cfg.approvals} approval{cfg.approvals > 1 ? "s" : ""}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Approval rules */}
                                <div style={{ fontSize: 12, fontWeight: 700, color: "#182026", marginBottom: 10 }}>
                                    Approval Rules ({sel.approvalRules.length})
                                </div>
                                {sel.approvalRules.length === 0 && (
                                    <div style={{
                                        padding: 16, background: "#F5F8FA", border: "1px dashed #CED9E0",
                                        borderRadius: 4, fontSize: 12, color: "#5C7080", textAlign: "center", marginBottom: 12
                                    }}>
                                        No approval rules (Low Risk — auto-approved)
                                    </div>
                                )}
                                {sel.approvalRules.map((ar, i) => (
                                    <div key={ar.id} style={{
                                        background: "#fff", border: "1px solid #CED9E0",
                                        borderRadius: 4, padding: "10px 14px", marginBottom: 8, display: "flex",
                                        gap: 16, alignItems: "center"
                                    }}>
                                        <div style={{
                                            width: 24, height: 24, borderRadius: "50%", background: risk.bg,
                                            color: risk.fg, fontSize: 11, fontWeight: 700, display: "flex",
                                            alignItems: "center", justifyContent: "center", flexShrink: 0
                                        }}>
                                            {i + 1}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: "#182026", marginBottom: 2 }}>
                                                {ar.condition}
                                            </div>
                                            <div style={{ fontSize: 11, color: "#5C7080" }}>
                                                Approvers: <strong>{ar.approvers}</strong>
                                                {" · "} Min approvals: <strong>{ar.minApprovals}</strong>
                                                {" · "} Timeout: <strong>{ar.timeout}</strong>
                                            </div>
                                        </div>
                                        <button style={{
                                            ...btn(), padding: "0 6px", border: "none",
                                            background: "transparent", color: "#8A9BA8"
                                        }}>
                                            <Settings style={{ width: 13, height: 13 }} />
                                        </button>
                                    </div>
                                ))}
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button style={{ ...btn(), fontSize: 11 }}>
                                        <Plus style={{ width: 11, height: 11 }} /> Add Approval Rule
                                    </button>
                                    <button style={btn(true)}>Save Risk Config</button>
                                </div>
                            </div>
                        )}

                        {/* ── SIMULATION (Payload Preview + Validate) ── */}
                        {tab === "simulation" && (
                            <div style={{ display: "flex", gap: 20, maxWidth: 900, flexWrap: "wrap" }}>

                                {/* Left: param inputs */}
                                <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: 12 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: "#182026" }}>Simulation Inputs</div>

                                    {sel.params.map((p, i) => (
                                        <div key={p.id}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                                                <label style={{ fontSize: 11, fontWeight: 600, color: "#182026" }}>{p.name}</label>
                                                {p.required && <span style={{ fontSize: 9, color: "#C23030", fontWeight: 700 }}>*</span>}
                                                <span style={{ fontSize: 9, color: "#5C7080", marginLeft: "auto" }}>{p.type}</span>
                                            </div>

                                            {p.type === "boolean" ? (
                                                <button onClick={() => updateParam(i, { value: p.value === "true" ? "false" : "true", validState: null })}
                                                    style={{
                                                        display: "flex", alignItems: "center", gap: 6, padding: "6px 10px",
                                                        cursor: "pointer", borderRadius: 3, fontSize: 11, fontWeight: 600,
                                                        border: `1px solid ${p.value === "true" ? "#0D8050" : "#CED9E0"}`,
                                                        background: p.value === "true" ? "#E6F7F0" : "#fff",
                                                        color: p.value === "true" ? "#0D8050" : "#5C7080"
                                                    }}>
                                                    {p.value === "true" ? <ToggleRight style={{ width: 14, height: 14 }} /> : <ToggleLeft style={{ width: 14, height: 14 }} />}
                                                    {p.value === "true" ? "true" : "false"}
                                                </button>
                                            ) : p.type === "enum" ? (
                                                <select value={p.value} onChange={e => updateParam(i, { value: e.target.value, validState: null })}
                                                    style={{
                                                        width: "100%", padding: "6px 8px", border: `1px solid ${p.validState === "INVALID" ? "#C23030" : "#CED9E0"}`,
                                                        borderRadius: 3, fontSize: 12, background: "#fff"
                                                    }}>
                                                    {p.enumValues?.map(v => <option key={v}>{v}</option>)}
                                                </select>
                                            ) : (
                                                <input value={p.value} onChange={e => updateParam(i, { value: e.target.value, validState: null })}
                                                    placeholder={p.description}
                                                    style={{
                                                        width: "100%", padding: "6px 8px",
                                                        border: `1px solid ${p.validState === "INVALID" ? "#C23030" : "#CED9E0"}`,
                                                        borderRadius: 3, fontSize: 12, background: "#fff", boxSizing: "border-box"
                                                    }} />
                                            )}

                                            {/* Inline validation state */}
                                            {p.validState === "VALID" && (
                                                <div style={{
                                                    display: "flex", alignItems: "center", gap: 4,
                                                    fontSize: 10, color: "#0D8050", marginTop: 3
                                                }}>
                                                    <Check style={{ width: 10, height: 10 }} /> Valid
                                                </div>
                                            )}
                                            {p.validState === "INVALID" && (
                                                <div style={{
                                                    display: "flex", alignItems: "center", gap: 4,
                                                    fontSize: 10, color: "#C23030", marginTop: 3
                                                }}>
                                                    <AlertTriangle style={{ width: 10, height: 10 }} /> {p.errorMsg}
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                                        <button onClick={runSim} style={btn(true)}>
                                            <Play style={{ width: 12, height: 12 }} /> Validate
                                        </button>
                                        <button style={btn()}>Reset</button>
                                    </div>

                                    {/* Validation summary banner */}
                                    {simRun && (
                                        <div style={{
                                            padding: "10px 12px", borderRadius: 4,
                                            background: allValid ? "#E6F7F0" : "rgba(194,48,48,0.08)",
                                            border: `1px solid ${allValid ? "#0D8050" : "#C23030"}`,
                                            display: "flex", alignItems: "center", gap: 8
                                        }}>
                                            {allValid
                                                ? <><Check style={{ width: 14, height: 14, color: "#0D8050" }} />
                                                    <div>
                                                        <div style={{ fontSize: 12, fontWeight: 700, color: "#0D8050" }}>VALID</div>
                                                        <div style={{ fontSize: 10, color: "#5C7080" }}>All submission criteria passed</div>
                                                    </div></>
                                                : <><AlertTriangle style={{ width: 14, height: 14, color: "#C23030" }} />
                                                    <div>
                                                        <div style={{ fontSize: 12, fontWeight: 700, color: "#C23030" }}>INVALID</div>
                                                        <div style={{ fontSize: 10, color: "#5C7080" }}>
                                                            {sel.params.filter(p => p.validState === "INVALID").length} criteria failed
                                                        </div>
                                                    </div></>}
                                        </div>
                                    )}

                                    {/* Approval workflow */}
                                    {simRun && allValid && sel.approvalRules.length > 0 && (
                                        <div style={{ padding: 12, background: "#fff", border: "1px solid #CED9E0", borderRadius: 4 }}>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: "#182026", marginBottom: 8 }}>
                                                Approval Workflow Triggered
                                            </div>
                                            {sel.approvalRules.map((ar, i) => (
                                                <div key={ar.id} style={{
                                                    display: "flex", alignItems: "center", gap: 8,
                                                    padding: "5px 0", borderBottom: "1px solid #EBF1F5", fontSize: 11
                                                }}>
                                                    <div style={{
                                                        width: 16, height: 16, borderRadius: "50%",
                                                        background: risk.bg, color: risk.fg, fontSize: 9, fontWeight: 700,
                                                        display: "flex", alignItems: "center", justifyContent: "center"
                                                    }}>
                                                        {i + 1}
                                                    </div>
                                                    <span style={{ flex: 1, color: "#182026" }}>{ar.approvers}</span>
                                                    <span style={{ color: "#5C7080" }}>{ar.timeout}</span>
                                                    <span style={{
                                                        fontSize: 9, padding: "1px 5px", borderRadius: 3,
                                                        background: "#EBF4FC", color: "#137CBD", fontWeight: 700
                                                    }}>PENDING</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Right: Payload Preview */}
                                <div style={{ flex: "1 1 320px", display: "flex", flexDirection: "column" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: "#182026" }}>Payload Preview</span>
                                        <span style={{
                                            fontSize: 10, padding: "1px 6px", borderRadius: 3,
                                            background: allValid ? "#E6F7F0" : "#EBF1F5",
                                            color: allValid ? "#0D8050" : "#5C7080", fontWeight: 700
                                        }}>
                                            {simRun ? (allValid ? "VALID" : "INVALID") : "NOT VALIDATED"}
                                        </span>
                                        <div style={{ flex: 1 }} />
                                        <button onClick={() => { navigator.clipboard.writeText(payload); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                                            style={{ ...btn(), height: 24, fontSize: 10 }}>
                                            <Copy style={{ width: 10, height: 10 }} /> {copied ? "Copied!" : "Copy"}
                                        </button>
                                    </div>
                                    <pre style={{
                                        flex: 1, margin: 0, padding: "12px 14px",
                                        background: "#0E0E18", color: "#E2E8F0", fontSize: 11, lineHeight: 1.7,
                                        borderRadius: 4, overflowY: "auto", fontFamily: "monospace",
                                        border: `1px solid ${allValid && simRun ? "#0D8050" : "#CED9E0"}`
                                    }}>
                                        {payload.split("\n").map((line, i) => {
                                            // Syntax coloring
                                            const colored = line
                                                .replace(/"([^"]+)":/g, '<span style="color:#93C5FD">"$1":</span>')
                                                .replace(/: "([^"]+)"/g, ': <span style="color:#86EFAC">"$1"</span>')
                                                .replace(/: (true|false)/g, ': <span style="color:#FCA5A5">$1</span>')
                                                .replace(/: (\d+)/g, ': <span style="color:#FCD34D">$1</span>');
                                            return <span key={i} dangerouslySetInnerHTML={{ __html: colored + "\n" }} />;
                                        })}
                                    </pre>

                                    {/* API endpoint reference */}
                                    <div style={{
                                        marginTop: 10, padding: "8px 12px", background: "#F5F8FA",
                                        border: "1px solid #EBF1F5", borderRadius: 4, fontSize: 10, color: "#5C7080"
                                    }}>
                                        <span style={{ fontWeight: 700, color: "#182026" }}>Validate Endpoint: </span>
                                        <code style={{ color: "#137CBD" }}>
                                            POST /api/v2/ontology/actions/{sel.name}/validate
                                        </code>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
