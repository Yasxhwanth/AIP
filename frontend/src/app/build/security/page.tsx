"use client";
import { useState } from "react";
import {
    Shield, Plus, Lock, Unlock, Check, X, AlertTriangle,
    ChevronDown, ChevronRight, Eye, Edit2, Zap, Brain,
    Database, Users, Settings, Info, Key, AlertCircle,
    ToggleLeft, ToggleRight, Search, Filter, Tag, Layers
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
type PermLevel = "full" | "limited" | "none";
type ActionGate = "execute" | "submit-for-approval" | "view-only" | "none";

// Palantir-style operations per permission domain
type EntityOp = "discover" | "view" | "edit" | "link" | "delete";
type ActionOp = "view" | "apply" | "approve" | "admin";
type AIScope = "query" | "suggest" | "execute-actions" | "full";

interface EntityPermRow {
    objectType: string;
    ops: Record<EntityOp, PermLevel>;
    marking: string | null;  // mandatory Marking override
}

interface ActionPermRow {
    actionName: string;
    category: string;
    ops: Record<ActionOp, PermLevel>;
    riskTier: "low" | "medium" | "high" | "critical";
    requiresApproval: boolean;
}

interface AIPermRow {
    agentName: string;
    model: string;
    scope: AIScope;
    maxObjectTypes: number | "all";
    canExecuteActions: boolean;
}

interface MarkingRow {
    id: string;
    name: string;
    description: string;
    type: "classification" | "organization" | "caveat";
    active: boolean;
}

interface Role {
    id: string;
    name: string;
    description: string;
    inherits: string[];  // parent role IDs
    custom: boolean;
    memberCount: number;
    entityPerms: EntityPermRow[];
    actionPerms: ActionPermRow[];
    aiPerms: AIPermRow[];
    markings: string[];  // Marking IDs with access
}

// ── Constants ──────────────────────────────────────────────────────────────────
const ENTITY_OPS: EntityOp[] = ["discover", "view", "edit", "link", "delete"];
const ACTION_OPS: ActionOp[] = ["view", "apply", "approve", "admin"];

const OPS_LABEL: Record<EntityOp | ActionOp, string> = {
    discover: "Discover", view: "View", edit: "Edit", link: "Link", delete: "Delete",
    apply: "Apply", approve: "Approve", admin: "Admin",
};

const RISK_COLORS: Record<string, string> = {
    low: "#0D8050", medium: "#D9822B", high: "#C23030", critical: "#7157D9",
};

const MARKINGS: MarkingRow[] = [
    { id: "mk1", name: "UNCLASSIFIED", description: "Public / unrestricted data", type: "classification", active: true },
    { id: "mk2", name: "CONFIDENTIAL", description: "Internal restricted data", type: "classification", active: true },
    { id: "mk3", name: "SECRET", description: "Sensitive operational data", type: "classification", active: false },
    { id: "mk4", name: "ORG:OPS-TEAM", description: "Operations team only", type: "organization", active: true },
    { id: "mk5", name: "ORG:AI-TEAM", description: "AI engineering team", type: "organization", active: true },
    { id: "mk6", name: "CAVEAT:NOFORN", description: "No foreign nationals", type: "caveat", active: false },
];

// ── Seed Roles ─────────────────────────────────────────────────────────────────
const ALL_ROLES: Role[] = [
    {
        id: "r1", name: "Mission Commander", description: "Full read + controlled write on mission and drone objects. Can approve actions.",
        inherits: ["r4"], custom: true, memberCount: 8,
        markings: ["mk1", "mk2", "mk4"],
        entityPerms: [
            { objectType: "Drone", marking: null, ops: { discover: "full", view: "full", edit: "none", link: "full", delete: "none" } },
            { objectType: "Mission", marking: null, ops: { discover: "full", view: "full", edit: "limited", link: "full", delete: "none" } },
            { objectType: "Alert", marking: null, ops: { discover: "full", view: "full", edit: "full", link: "full", delete: "none" } },
            { objectType: "Pilot", marking: null, ops: { discover: "full", view: "full", edit: "none", link: "limited", delete: "none" } },
            { objectType: "WorkOrder", marking: null, ops: { discover: "full", view: "full", edit: "limited", link: "limited", delete: "none" } },
        ],
        actionPerms: [
            { actionName: "EscalateMission", category: "Mission", riskTier: "high", requiresApproval: true, ops: { view: "full", apply: "full", approve: "full", admin: "none" } },
            { actionName: "AssignPilot", category: "Mission", riskTier: "medium", requiresApproval: false, ops: { view: "full", apply: "full", approve: "full", admin: "none" } },
            { actionName: "CreateWorkOrder", category: "Ops", riskTier: "low", requiresApproval: false, ops: { view: "full", apply: "full", approve: "none", admin: "none" } },
            { actionName: "DecommDrone", category: "Fleet", riskTier: "critical", requiresApproval: true, ops: { view: "full", apply: "limited", approve: "full", admin: "none" } },
            { actionName: "RunRiskAI", category: "AI", riskTier: "medium", requiresApproval: true, ops: { view: "full", apply: "full", approve: "full", admin: "none" } },
        ],
        aiPerms: [
            { agentName: "Mission Ops Assistant", model: "gpt-4o", scope: "suggest", maxObjectTypes: 4, canExecuteActions: false },
            { agentName: "Fleet Risk Analyst", model: "gemini-1.5-pro", scope: "query", maxObjectTypes: "all", canExecuteActions: false },
        ],
    },
    {
        id: "r2", name: "Operator", description: "Read access to missions/drones. Can apply low-risk actions only.",
        inherits: ["r4"], custom: false, memberCount: 24,
        markings: ["mk1", "mk4"],
        entityPerms: [
            { objectType: "Drone", marking: null, ops: { discover: "full", view: "full", edit: "none", link: "none", delete: "none" } },
            { objectType: "Mission", marking: null, ops: { discover: "full", view: "full", edit: "none", link: "none", delete: "none" } },
            { objectType: "Alert", marking: null, ops: { discover: "full", view: "full", edit: "none", link: "none", delete: "none" } },
            { objectType: "Pilot", marking: null, ops: { discover: "full", view: "limited", edit: "none", link: "none", delete: "none" } },
            { objectType: "WorkOrder", marking: null, ops: { discover: "full", view: "full", edit: "none", link: "none", delete: "none" } },
        ],
        actionPerms: [
            { actionName: "EscalateMission", category: "Mission", riskTier: "high", requiresApproval: true, ops: { view: "full", apply: "none", approve: "none", admin: "none" } },
            { actionName: "AssignPilot", category: "Mission", riskTier: "medium", requiresApproval: false, ops: { view: "full", apply: "none", approve: "none", admin: "none" } },
            { actionName: "CreateWorkOrder", category: "Ops", riskTier: "low", requiresApproval: false, ops: { view: "full", apply: "full", approve: "none", admin: "none" } },
            { actionName: "DecommDrone", category: "Fleet", riskTier: "critical", requiresApproval: true, ops: { view: "full", apply: "none", approve: "none", admin: "none" } },
            { actionName: "RunRiskAI", category: "AI", riskTier: "medium", requiresApproval: true, ops: { view: "full", apply: "none", approve: "none", admin: "none" } },
        ],
        aiPerms: [
            { agentName: "Mission Ops Assistant", model: "gpt-4o", scope: "query", maxObjectTypes: 2, canExecuteActions: false },
        ],
    },
    {
        id: "r3", name: "AI Engineer", description: "Full access to AIP agents and logic functions. No direct Ontology write.",
        inherits: ["r5"], custom: true, memberCount: 5,
        markings: ["mk1", "mk2", "mk5"],
        entityPerms: [
            { objectType: "Drone", marking: null, ops: { discover: "full", view: "full", edit: "none", link: "none", delete: "none" } },
            { objectType: "Mission", marking: null, ops: { discover: "full", view: "full", edit: "none", link: "none", delete: "none" } },
            { objectType: "Alert", marking: null, ops: { discover: "full", view: "full", edit: "none", link: "none", delete: "none" } },
            { objectType: "Equipment", marking: null, ops: { discover: "full", view: "full", edit: "none", link: "none", delete: "none" } },
        ],
        actionPerms: [
            { actionName: "RunRiskAI", category: "AI", riskTier: "medium", requiresApproval: true, ops: { view: "full", apply: "full", approve: "full", admin: "full" } },
            { actionName: "EscalateMission", category: "Mission", riskTier: "high", requiresApproval: true, ops: { view: "full", apply: "none", approve: "none", admin: "none" } },
        ],
        aiPerms: [
            { agentName: "Mission Ops Assistant", model: "gpt-4o", scope: "full", maxObjectTypes: "all", canExecuteActions: true },
            { agentName: "Equipment Diagnostics AI", model: "claude-3-5-sonnet", scope: "suggest", maxObjectTypes: 3, canExecuteActions: false },
            { agentName: "Fleet Risk Analyst", model: "gemini-1.5-pro", scope: "full", maxObjectTypes: "all", canExecuteActions: false },
        ],
    },
    {
        id: "r4", name: "Viewer", description: "Read-only access across all object types. Base role.",
        inherits: [], custom: false, memberCount: 41,
        markings: ["mk1"],
        entityPerms: [
            { objectType: "Drone", marking: null, ops: { discover: "full", view: "full", edit: "none", link: "none", delete: "none" } },
            { objectType: "Mission", marking: null, ops: { discover: "full", view: "full", edit: "none", link: "none", delete: "none" } },
            { objectType: "Alert", marking: null, ops: { discover: "full", view: "full", edit: "none", link: "none", delete: "none" } },
        ],
        actionPerms: [
            { actionName: "EscalateMission", category: "Mission", riskTier: "high", requiresApproval: true, ops: { view: "full", apply: "none", approve: "none", admin: "none" } },
            { actionName: "CreateWorkOrder", category: "Ops", riskTier: "low", requiresApproval: false, ops: { view: "full", apply: "none", approve: "none", admin: "none" } },
        ],
        aiPerms: [],
    },
    {
        id: "r5", name: "Owner", description: "Full administrative control over all resources and permissions.",
        inherits: [], custom: false, memberCount: 3,
        markings: ["mk1", "mk2", "mk3", "mk4", "mk5", "mk6"],
        entityPerms: [
            { objectType: "Drone", marking: null, ops: { discover: "full", view: "full", edit: "full", link: "full", delete: "full" } },
            { objectType: "Mission", marking: null, ops: { discover: "full", view: "full", edit: "full", link: "full", delete: "full" } },
            { objectType: "Alert", marking: null, ops: { discover: "full", view: "full", edit: "full", link: "full", delete: "full" } },
            { objectType: "Pilot", marking: null, ops: { discover: "full", view: "full", edit: "full", link: "full", delete: "full" } },
            { objectType: "Equipment", marking: null, ops: { discover: "full", view: "full", edit: "full", link: "full", delete: "full" } },
            { objectType: "WorkOrder", marking: null, ops: { discover: "full", view: "full", edit: "full", link: "full", delete: "full" } },
        ],
        actionPerms: [
            { actionName: "EscalateMission", category: "Mission", riskTier: "high", requiresApproval: true, ops: { view: "full", apply: "full", approve: "full", admin: "full" } },
            { actionName: "AssignPilot", category: "Mission", riskTier: "medium", requiresApproval: false, ops: { view: "full", apply: "full", approve: "full", admin: "full" } },
            { actionName: "CreateWorkOrder", category: "Ops", riskTier: "low", requiresApproval: false, ops: { view: "full", apply: "full", approve: "full", admin: "full" } },
            { actionName: "DecommDrone", category: "Fleet", riskTier: "critical", requiresApproval: true, ops: { view: "full", apply: "full", approve: "full", admin: "full" } },
            { actionName: "RunRiskAI", category: "AI", riskTier: "medium", requiresApproval: true, ops: { view: "full", apply: "full", approve: "full", admin: "full" } },
        ],
        aiPerms: [
            { agentName: "Mission Ops Assistant", model: "gpt-4o", scope: "full", maxObjectTypes: "all", canExecuteActions: true },
            { agentName: "Equipment Diagnostics AI", model: "claude-3-5-sonnet", scope: "full", maxObjectTypes: "all", canExecuteActions: true },
            { agentName: "Fleet Risk Analyst", model: "gemini-1.5-pro", scope: "full", maxObjectTypes: "all", canExecuteActions: true },
        ],
    },
];

// ── Helpers ─────────────────────────────────────────────────────────────────────
const PERM_COLORS: Record<PermLevel, { bg: string; fg: string; border: string }> = {
    full: { bg: "#E6F7F0", fg: "#0D8050", border: "#0D8050" },
    limited: { bg: "#FFF3E0", fg: "#D9822B", border: "#D9822B" },
    none: { bg: "#F5F8FA", fg: "#8A9BA8", border: "#CED9E0" },
};

const SCOPE_COLORS: Record<AIScope, { bg: string; fg: string }> = {
    "full": { bg: "rgba(194,48,48,0.08)", fg: "#C23030" },
    "execute-actions": { bg: "rgba(217,130,43,0.08)", fg: "#D9822B" },
    "suggest": { bg: "rgba(19,124,189,0.08)", fg: "#137CBD" },
    "query": { bg: "rgba(13,128,80,0.08)", fg: "#0D8050" },
};

// The key "Disabled not Hidden" button component
function PermCell({
    perm,
    onCycle,
}: {
    perm: PermLevel;
    onCycle: (next: PermLevel) => void;
}) {
    const c = PERM_COLORS[perm];
    const next: PermLevel = perm === "full" ? "limited" : perm === "limited" ? "none" : "full";
    return (
        <button
            onClick={() => onCycle(next)}
            title={perm === "none" ? "No access — click to grant" : `Access: ${perm} — click to cycle`}
            style={{
                width: 72, height: 28, cursor: "pointer", borderRadius: 3,
                border: `1.5px solid ${c.border}`, background: c.bg, color: c.fg,
                fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center",
                justifyContent: "center", gap: 4,
            }}
        >
            {perm === "full" ? <Check style={{ width: 11, height: 11 }} /> :
                perm === "limited" ? <Eye style={{ width: 11, height: 11 }} /> :
                    <X style={{ width: 11, height: 11 }} />}
            {perm === "full" ? "Full" : perm === "limited" ? "Ltd" : "None"}
        </button>
    );
}

// Disabled-not-hidden operation button
function OpButton({
    label,
    granted,
    disabled = false,
    disabledReason = "",
}: {
    label: string;
    granted: boolean;
    disabled?: boolean;
    disabledReason?: string;
}) {
    return (
        <button
            disabled={disabled}
            title={disabled ? `⛔ ${disabledReason}` : granted ? `✓ ${label} granted` : `✗ ${label} not granted`}
            style={{
                padding: "3px 9px", borderRadius: 4, fontSize: 10, fontWeight: 600,
                cursor: disabled ? "not-allowed" : "default",
                border: `1px solid ${granted ? "#0D8050" : disabled ? "#CED9E0" : "#C23030"}`,
                background: granted ? "#E6F7F0" : disabled ? "#F5F8FA" : "#FFF0F0",
                color: granted ? "#0D8050" : disabled ? "#AAB7C4" : "#C23030",
                opacity: disabled ? 0.55 : 1,
                textDecoration: disabled ? "line-through" : "none",
            }}
        >
            {label}
        </button>
    );
}

// ── Tab label styles ──────────────────────────────────────────────────────────
const tabSt = (active: boolean): React.CSSProperties => ({
    fontSize: 12, padding: "7px 16px", cursor: "pointer", border: "none",
    background: "transparent",
    borderBottom: active ? "2px solid #137CBD" : "2px solid transparent",
    color: active ? "#137CBD" : "#5C7080",
    fontWeight: active ? 700 : 400,
});
const lbl = (t: string) => (
    <div style={{ fontSize: 10, fontWeight: 700, color: "#5C7080", textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: 4 }}>{t}</div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SecurityPage() {
    const [roles, setRoles] = useState<Role[]>(ALL_ROLES);
    const [sel, setSel] = useState<Role>(ALL_ROLES[0]);
    const [tab, setTab] = useState<"entity" | "actions" | "ai" | "markings">("entity");
    const [simRole, setSimRole] = useState<string>(ALL_ROLES[0].id);
    const [search, setSearch] = useState("");

    const updateSel = (r: Role) => {
        setSel(r);
        setRoles(p => p.map(x => x.id === r.id ? r : x));
    };

    const cycleEntityOp = (oi: number, op: EntityOp, next: PermLevel) => {
        const entityPerms = sel.entityPerms.map((e, i) =>
            i !== oi ? e : { ...e, ops: { ...e.ops, [op]: next } }
        );
        updateSel({ ...sel, entityPerms });
    };

    const cycleActionOp = (ai: number, op: ActionOp, next: PermLevel) => {
        const actionPerms = sel.actionPerms.map((a, i) =>
            i !== ai ? a : { ...a, ops: { ...a.ops, [op]: next } }
        );
        updateSel({ ...sel, actionPerms });
    };

    const toggleAIExec = (ai: number) => {
        const aiPerms = sel.aiPerms.map((a, i) =>
            i !== ai ? a : { ...a, canExecuteActions: !a.canExecuteActions }
        );
        updateSel({ ...sel, aiPerms });
    };

    const setAIScope = (ai: number, scope: AIScope) => {
        const aiPerms = sel.aiPerms.map((a, i) =>
            i !== ai ? a : { ...a, scope }
        );
        updateSel({ ...sel, aiPerms });
    };

    const toggleMarking = (mkId: string) => {
        const markings = sel.markings.includes(mkId)
            ? sel.markings.filter(m => m !== mkId)
            : [...sel.markings, mkId];
        updateSel({ ...sel, markings });
    };

    // Simulate effective permissions for a given role (user perspective)
    const simRoleObj = roles.find(r => r.id === simRole) ?? roles[0];
    const filteredRoles = roles.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase())
    );

    const inheritedRole = sel.inherits.map(id => roles.find(r => r.id === id)?.name).filter(Boolean).join(", ");

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#F5F8FA", fontFamily: "Inter,sans-serif" }}>

            {/* Top bar */}
            <div style={{
                height: 44, display: "flex", alignItems: "center", padding: "0 14px",
                background: "#fff", borderBottom: "1px solid #CED9E0", gap: 8, flexShrink: 0
            }}>
                <Shield style={{ width: 16, height: 16, color: "#137CBD" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#182026" }}>Security</span>
                <div style={{ width: 1, height: 16, background: "#CED9E0", margin: "0 4px" }} />
                <span style={{ fontSize: 11, color: "#5C7080" }}>RBAC · Entity Permissions · Action Gates · AI Scope · Markings</span>
                <div style={{ flex: 1 }} />

                {/* Permission simulator selector */}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11, color: "#5C7080", fontWeight: 600 }}>Simulate as:</span>
                    <select value={simRole} onChange={e => setSimRole(e.target.value)}
                        style={{
                            padding: "0 8px", height: 28, border: "1px solid #CED9E0",
                            borderRadius: 3, fontSize: 11, background: "#fff"
                        }}>
                        {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                </div>

                <button onClick={() => {
                    const r: Role = {
                        id: `r${Date.now()}`, name: "New Role", description: "", inherits: [], custom: true,
                        memberCount: 0, markings: ["mk1"],
                        entityPerms: [], actionPerms: [], aiPerms: [],
                    };
                    setRoles(p => [...p, r]); setSel(r);
                }} style={{
                    height: 28, padding: "0 11px", borderRadius: 3, fontSize: 12, fontWeight: 600,
                    cursor: "pointer", border: "none", background: "#137CBD", color: "#fff",
                    display: "flex", alignItems: "center", gap: 5
                }}>
                    <Plus style={{ width: 13, height: 13 }} /> New Role
                </button>
            </div>

            <div style={{ flex: 1, display: "flex", minHeight: 0 }}>

                {/* ── Left: Role List ── */}
                <div style={{
                    width: 240, background: "#fff", borderRight: "1px solid #CED9E0",
                    display: "flex", flexDirection: "column", flexShrink: 0
                }}>
                    {/* Search */}
                    <div style={{ padding: "8px 10px", borderBottom: "1px solid #EBF1F5" }}>
                        <div style={{
                            display: "flex", alignItems: "center", gap: 6, padding: "4px 8px",
                            border: "1px solid #CED9E0", borderRadius: 3, background: "#F5F8FA"
                        }}>
                            <Search style={{ width: 12, height: 12, color: "#8A9BA8", flexShrink: 0 }} />
                            <input value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Filter roles…" style={{
                                    border: "none", background: "transparent",
                                    fontSize: 11, outline: "none", flex: 1, color: "#182026"
                                }} />
                        </div>
                    </div>

                    <div style={{
                        padding: "5px 10px 3px", fontSize: 9, fontWeight: 700, color: "#5C7080",
                        textTransform: "uppercase", letterSpacing: "0.08em"
                    }}>
                        Roles ({filteredRoles.length})
                    </div>

                    <div style={{ flex: 1, overflow: "auto" }}>
                        {filteredRoles.map(r => (
                            <div key={r.id} onClick={() => setSel(r)}
                                style={{
                                    padding: "9px 12px", cursor: "pointer", borderBottom: "1px solid #EBF1F5",
                                    borderLeft: sel.id === r.id ? "2px solid #137CBD" : "2px solid transparent",
                                    background: sel.id === r.id ? "rgba(19,124,189,0.05)" : "transparent"
                                }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <div style={{
                                        width: 22, height: 22, borderRadius: 4,
                                        background: r.custom ? "rgba(113,87,217,0.12)" : "rgba(19,124,189,0.1)",
                                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                                    }}>
                                        {r.custom ? <Key style={{ width: 12, height: 12, color: "#7157D9" }} />
                                            : <Shield style={{ width: 12, height: 12, color: "#137CBD" }} />}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                            <span style={{ fontSize: 12, fontWeight: 600, color: "#182026", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</span>
                                            {r.custom && <span style={{
                                                fontSize: 8, padding: "1px 4px", borderRadius: 3,
                                                background: "rgba(113,87,217,0.1)", color: "#7157D9", fontWeight: 700
                                            }}>CUSTOM</span>}
                                        </div>
                                        <div style={{ fontSize: 9, color: "#8A9BA8" }}>
                                            {r.memberCount} members{r.inherits.length > 0 ? ` · inherits ${r.inherits.map(id => roles.find(x => x.id === id)?.name).join(",")}` : ""}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Right: Permission Detail ── */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

                    {/* Role header */}
                    <div style={{ padding: "10px 16px", background: "#fff", borderBottom: "1px solid #CED9E0", flexShrink: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                            <span style={{ fontSize: 15, fontWeight: 700, color: "#182026" }}>{sel.name}</span>
                            {sel.custom && <span style={{
                                fontSize: 9, padding: "2px 6px", borderRadius: 3,
                                background: "rgba(113,87,217,0.1)", color: "#7157D9", fontWeight: 700
                            }}>CUSTOM ROLE</span>}
                            {inheritedRole && (
                                <span style={{ fontSize: 10, color: "#5C7080" }}>inherits: <strong>{inheritedRole}</strong></span>
                            )}
                            <div style={{ flex: 1 }} />
                            <span style={{ fontSize: 11, color: "#5C7080" }}>
                                <Users style={{ width: 12, height: 12, display: "inline" }} /> {sel.memberCount} members
                            </span>
                        </div>
                        <div style={{ fontSize: 11, color: "#5C7080" }}>{sel.description}</div>

                        {/* Mandatory Markings bar */}
                        {sel.markings.length > 0 && (
                            <div style={{ display: "flex", gap: 5, marginTop: 6, flexWrap: "wrap" }}>
                                {sel.markings.map(mkId => {
                                    const mk = MARKINGS.find(m => m.id === mkId);
                                    if (!mk) return null;
                                    const col = mk.type === "classification" ? "#C23030" : mk.type === "organization" ? "#137CBD" : "#D9822B";
                                    return (
                                        <span key={mkId} style={{
                                            fontSize: 9, padding: "2px 7px", borderRadius: 3, fontWeight: 700,
                                            border: `1px solid ${col}`, background: `${col}12`, color: col
                                        }}>
                                            {mk.name}
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Tabs */}
                    <div style={{ display: "flex", background: "#fff", borderBottom: "1px solid #CED9E0", flexShrink: 0 }}>
                        {(["entity", "actions", "ai", "markings"] as const).map(t => (
                            <button key={t} onClick={() => setTab(t)} style={tabSt(tab === t)}>
                                {t === "entity" ? "Entity Permissions" :
                                    t === "actions" ? "Action Gates" :
                                        t === "ai" ? "AI Scope" : "Markings & Controls"}
                            </button>
                        ))}
                    </div>

                    {/* ── TAB CONTENT ── */}
                    <div style={{ flex: 1, overflow: "auto", padding: 20 }}>

                        {/* ── ENTITY PERMISSIONS ── */}
                        {tab === "entity" && (
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#182026", marginBottom: 4 }}>Entity-Level Permissions</div>
                                <div style={{ fontSize: 11, color: "#5C7080", marginBottom: 16 }}>
                                    Controls object-level operations: Discover (aware of existence), View (read data), Edit (write properties), Link (create/remove links), Delete.
                                    Mandatory Markings override all role grants.
                                </div>

                                {/* Permission legend */}
                                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                                    {(["full", "limited", "none"] as PermLevel[]).map(p => {
                                        const c = PERM_COLORS[p];
                                        return (
                                            <div key={p} style={{
                                                display: "flex", alignItems: "center", gap: 5, padding: "4px 10px",
                                                borderRadius: 3, border: `1px solid ${c.border}`, background: c.bg
                                            }}>
                                                <span style={{ fontSize: 11, fontWeight: 600, color: c.fg }}>
                                                    {p === "full" ? "✓ Full" : p === "limited" ? "◑ Limited" : "✗ None"}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    <div style={{
                                        marginLeft: "auto", display: "flex", alignItems: "center", gap: 5,
                                        padding: "4px 10px", borderRadius: 3, background: "#EBF4FC", border: "1px solid #B3D7F5"
                                    }}>
                                        <Info style={{ width: 12, height: 12, color: "#137CBD" }} />
                                        <span style={{ fontSize: 10, color: "#137CBD" }}>Click a cell to cycle: Full → Limited → None</span>
                                    </div>
                                </div>

                                {/* Matrix table */}
                                <div style={{ background: "#fff", border: "1px solid #CED9E0", borderRadius: 4, overflow: "hidden" }}>
                                    {/* Header */}
                                    <div style={{
                                        display: "grid", gridTemplateColumns: "180px repeat(5, 80px)", background: "#F5F8FA",
                                        borderBottom: "1px solid #CED9E0"
                                    }}>
                                        <div style={{ padding: "8px 14px", fontSize: 10, fontWeight: 700, color: "#5C7080", textTransform: "uppercase" }}>
                                            Object Type
                                        </div>
                                        {ENTITY_OPS.map(op => (
                                            <div key={op} style={{
                                                padding: "8px 4px", fontSize: 10, fontWeight: 700,
                                                color: "#5C7080", textTransform: "uppercase", textAlign: "center" as const
                                            }}>
                                                {OPS_LABEL[op]}
                                            </div>
                                        ))}
                                    </div>

                                    {sel.entityPerms.map((ep, oi) => (
                                        <div key={ep.objectType} style={{
                                            display: "grid",
                                            gridTemplateColumns: "180px repeat(5, 80px)",
                                            borderBottom: "1px solid #EBF1F5", alignItems: "center"
                                        }}>
                                            <div style={{ padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                                                <div style={{
                                                    width: 20, height: 20, borderRadius: 3,
                                                    background: "rgba(19,124,189,0.1)", display: "flex",
                                                    alignItems: "center", justifyContent: "center"
                                                }}>
                                                    <Database style={{ width: 11, height: 11, color: "#137CBD" }} />
                                                </div>
                                                <span style={{ fontSize: 12, fontWeight: 600, color: "#182026" }}>{ep.objectType}</span>
                                                {ep.marking && (
                                                    <span style={{
                                                        fontSize: 8, padding: "1px 4px", borderRadius: 3,
                                                        background: "rgba(194,48,48,0.08)", color: "#C23030", fontWeight: 700
                                                    }}>
                                                        🔒 {ep.marking}
                                                    </span>
                                                )}
                                            </div>
                                            {ENTITY_OPS.map(op => (
                                                <div key={op} style={{ padding: "6px 4px", display: "flex", justifyContent: "center" as const }}>
                                                    <PermCell
                                                        perm={ep.ops[op]}
                                                        onCycle={next => cycleEntityOp(oi, op, next)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ))}

                                    {/* Add object type row */}
                                    <div style={{ padding: "8px 14px", borderTop: "1px solid #EBF1F5" }}>
                                        <button onClick={() => {
                                            const existing = sel.entityPerms.map(e => e.objectType);
                                            const available = ["Drone", "Mission", "Pilot", "Equipment", "Alert", "WorkOrder"].find(o => !existing.includes(o));
                                            if (!available) return;
                                            updateSel({
                                                ...sel,
                                                entityPerms: [...sel.entityPerms, {
                                                    objectType: available, marking: null,
                                                    ops: { discover: "none", view: "none", edit: "none", link: "none", delete: "none" },
                                                }],
                                            });
                                        }} style={{
                                            display: "flex", alignItems: "center", gap: 5, padding: "4px 10px",
                                            borderRadius: 3, border: "1px dashed #CED9E0", background: "transparent",
                                            cursor: "pointer", fontSize: 11, color: "#5C7080"
                                        }}>
                                            <Plus style={{ width: 12, height: 12 }} /> Add object type
                                        </button>
                                    </div>
                                </div>

                                {/* Palantir info box */}
                                <div style={{
                                    marginTop: 12, padding: "8px 12px", background: "#EBF4FC",
                                    border: "1px solid #B3D7F5", borderRadius: 4, display: "flex", gap: 8
                                }}>
                                    <Info style={{ width: 13, height: 13, color: "#137CBD", flexShrink: 0 }} />
                                    <span style={{ fontSize: 11, color: "#1F4E79", lineHeight: 1.5 }}>
                                        <strong>Palantir Foundry model:</strong> Permissions cascade from Project level. Mandatory controls (Organizations, Markings, CBAC) override all role grants.
                                        "Discover" lets users know an object exists but cannot read its properties.
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* ── ACTION GATES ── */}
                        {tab === "actions" && (
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#182026", marginBottom: 4 }}>Action-Level Permission Gates</div>
                                <div style={{ fontSize: 11, color: "#5C7080", marginBottom: 14 }}>
                                    Controls who can View, Apply, Approve, or Administer each Action Type.
                                    Unauthorized operations are <strong>disabled and visible</strong> — not hidden — so users understand their access level.
                                </div>

                                {/* "Simulate as" effective permissions banner */}
                                <div style={{
                                    padding: "8px 12px", background: "#F5F8FA", border: "1px solid #CED9E0",
                                    borderRadius: 4, marginBottom: 14, display: "flex", alignItems: "center", gap: 8
                                }}>
                                    <Eye style={{ width: 13, height: 13, color: "#5C7080" }} />
                                    <span style={{ fontSize: 11, color: "#5C7080" }}>
                                        Simulating as: <strong style={{ color: "#182026" }}>{simRoleObj.name}</strong> — showing effective button states below
                                    </span>
                                </div>

                                {sel.actionPerms.map((ap, ai) => {
                                    const rc = RISK_COLORS[ap.riskTier];
                                    // Effective perms for the simulated role
                                    const simPerm = simRoleObj.actionPerms.find(x => x.actionName === ap.actionName);
                                    return (
                                        <div key={ap.actionName} style={{
                                            background: "#fff", border: "1px solid #CED9E0",
                                            borderRadius: 4, marginBottom: 10, overflow: "hidden"
                                        }}>
                                            {/* Action header */}
                                            <div style={{
                                                padding: "10px 14px", background: "#F5F8FA", borderBottom: "1px solid #EBF1F5",
                                                display: "flex", alignItems: "center", gap: 10
                                            }}>
                                                <Zap style={{ width: 14, height: 14, color: rc }} />
                                                <span style={{ fontSize: 12, fontWeight: 700, color: "#182026" }}>{ap.actionName}</span>
                                                <span style={{ fontSize: 10, color: "#5C7080" }}>{ap.category}</span>
                                                <span style={{
                                                    fontSize: 9, padding: "2px 6px", borderRadius: 3, fontWeight: 700,
                                                    border: `1px solid ${rc}`, background: `${rc}12`, color: rc
                                                }}>
                                                    {ap.riskTier.toUpperCase()}
                                                </span>
                                                {ap.requiresApproval && (
                                                    <span style={{
                                                        fontSize: 9, padding: "2px 6px", borderRadius: 3, fontWeight: 700,
                                                        border: "1px solid #D9822B", background: "#FFF3E0", color: "#D9822B"
                                                    }}>
                                                        REQUIRES APPROVAL
                                                    </span>
                                                )}
                                                <div style={{ flex: 1 }} />
                                                <span style={{ fontSize: 10, color: "#5C7080" }}>Permissions for: <strong>{sel.name}</strong></span>
                                            </div>

                                            {/* Permission grid */}
                                            <div style={{ padding: "10px 14px" }}>
                                                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                                                    {ACTION_OPS.map(op => (
                                                        <div key={op}>
                                                            <div style={{
                                                                fontSize: 9, fontWeight: 700, color: "#5C7080",
                                                                textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5
                                                            }}>
                                                                {OPS_LABEL[op]}
                                                            </div>
                                                            <PermCell
                                                                perm={ap.ops[op]}
                                                                onCycle={next => cycleActionOp(ai, op, next)}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Disable-not-hide simulation */}
                                                {simPerm && (
                                                    <div style={{
                                                        marginTop: 12, padding: "8px 10px", background: "#F5F8FA",
                                                        border: "1px solid #EBF1F5", borderRadius: 3
                                                    }}>
                                                        <div style={{
                                                            fontSize: 9, fontWeight: 700, color: "#5C7080",
                                                            textTransform: "uppercase", marginBottom: 6
                                                        }}>
                                                            Effective UI (as {simRoleObj.name}) — disabled, not hidden
                                                        </div>
                                                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                                                            <OpButton
                                                                label="View"
                                                                granted={simPerm.ops.view === "full" || simPerm.ops.view === "limited"}
                                                                disabled={false}
                                                            />
                                                            <OpButton
                                                                label="Apply Action"
                                                                granted={simPerm.ops.apply === "full"}
                                                                disabled={simPerm.ops.apply === "none"}
                                                                disabledReason={`${simRoleObj.name} role does not have Apply permission for ${ap.actionName}`}
                                                            />
                                                            <OpButton
                                                                label={ap.requiresApproval ? "Approve (Required)" : "Approve"}
                                                                granted={simPerm.ops.approve === "full"}
                                                                disabled={simPerm.ops.approve === "none"}
                                                                disabledReason={`${simRoleObj.name} role cannot approve ${ap.actionName}`}
                                                            />
                                                            <OpButton
                                                                label="Admin"
                                                                granted={simPerm.ops.admin === "full"}
                                                                disabled={simPerm.ops.admin === "none"}
                                                                disabledReason={`${simRoleObj.name} is not an admin for ${ap.actionName}`}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Add action */}
                                <div style={{ padding: "10px 0" }}>
                                    <button onClick={() => {
                                        const ap: ActionPermRow = {
                                            actionName: "New Action", category: "Custom", riskTier: "low",
                                            requiresApproval: false,
                                            ops: { view: "full", apply: "none", approve: "none", admin: "none" },
                                        };
                                        updateSel({ ...sel, actionPerms: [...sel.actionPerms, ap] });
                                    }} style={{
                                        display: "flex", alignItems: "center", gap: 5, padding: "5px 12px",
                                        borderRadius: 3, border: "1px dashed #CED9E0", background: "transparent",
                                        cursor: "pointer", fontSize: 11, color: "#5C7080"
                                    }}>
                                        <Plus style={{ width: 12, height: 12 }} /> Add action permission
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ── AI SCOPE ── */}
                        {tab === "ai" && (
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#182026", marginBottom: 4 }}>AI Agent Scope Enforcement</div>
                                <div style={{ fontSize: 11, color: "#5C7080", marginBottom: 16 }}>
                                    Defines which AIP agents this role can interact with, at what scope level, and whether agents can execute actions on behalf of this role.
                                    Agents always inherit the user's data permissions — the scope only limits agent capabilities.
                                </div>

                                {/* Scope legend */}
                                <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" as const }}>
                                    {(["query", "suggest", "execute-actions", "full"] as AIScope[]).map(s => {
                                        const c = SCOPE_COLORS[s];
                                        return (
                                            <div key={s} style={{
                                                display: "flex", alignItems: "center", gap: 5, padding: "4px 10px",
                                                borderRadius: 3, background: c.bg, border: `1px solid ${c.fg}`
                                            }}>
                                                <span style={{ fontSize: 10, fontWeight: 700, color: c.fg }}>
                                                    {s === "query" ? "📖 Query Only" :
                                                        s === "suggest" ? "💬 Suggest" :
                                                            s === "execute-actions" ? "⚡ Execute Actions" :
                                                                "🔓 Full Access"}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {sel.aiPerms.length === 0 && (
                                    <div style={{
                                        padding: "24px", textAlign: "center", color: "#8A9BA8",
                                        border: "1px dashed #CED9E0", borderRadius: 4, fontSize: 12
                                    }}>
                                        No AI agent access configured for this role. Add agents below.
                                    </div>
                                )}

                                {sel.aiPerms.map((ap, ai) => {
                                    const sc = SCOPE_COLORS[ap.scope];
                                    return (
                                        <div key={ap.agentName} style={{
                                            background: "#fff", border: "1px solid #CED9E0",
                                            borderRadius: 4, marginBottom: 10, padding: "12px 16px"
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                                                <div style={{
                                                    width: 26, height: 26, borderRadius: 4,
                                                    background: "rgba(113,87,217,0.12)", display: "flex",
                                                    alignItems: "center", justifyContent: "center"
                                                }}>
                                                    <Brain style={{ width: 14, height: 14, color: "#7157D9" }} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: 12, fontWeight: 700, color: "#182026" }}>{ap.agentName}</div>
                                                    <div style={{ fontSize: 10, color: "#8A9BA8" }}>{ap.model}</div>
                                                </div>
                                                <span style={{
                                                    fontSize: 10, padding: "3px 8px", borderRadius: 3, fontWeight: 700,
                                                    background: sc.bg, color: sc.fg, border: `1px solid ${sc.fg}`
                                                }}>
                                                    {ap.scope}
                                                </span>
                                            </div>

                                            {/* Scope selector */}
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10 }}>
                                                <div>
                                                    <div style={{ fontSize: 9, fontWeight: 700, color: "#5C7080", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>Scope Level</div>
                                                    <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 5 }}>
                                                        {(["query", "suggest", "execute-actions", "full"] as AIScope[]).map(s => {
                                                            const c = SCOPE_COLORS[s];
                                                            return (
                                                                <button key={s} onClick={() => setAIScope(ai, s)}
                                                                    style={{
                                                                        padding: "3px 8px", borderRadius: 3, cursor: "pointer", fontSize: 10,
                                                                        fontWeight: ap.scope === s ? 700 : 400,
                                                                        border: `1px solid ${ap.scope === s ? c.fg : "#CED9E0"}`,
                                                                        background: ap.scope === s ? c.bg : "#fff",
                                                                        color: ap.scope === s ? c.fg : "#5C7080"
                                                                    }}>
                                                                    {s}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 9, fontWeight: 700, color: "#5C7080", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>Max Object Types</div>
                                                    <div style={{ fontSize: 13, fontWeight: 700, color: "#182026" }}>
                                                        {ap.maxObjectTypes === "all" ? "All" : ap.maxObjectTypes} object type{ap.maxObjectTypes !== 1 ? "s" : ""}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Execute actions toggle — disabled not hidden */}
                                            <div style={{
                                                display: "flex", alignItems: "center", gap: 8, padding: "8px 10px",
                                                background: ap.canExecuteActions ? "rgba(194,48,48,0.05)" : "#F5F8FA",
                                                border: `1px solid ${ap.canExecuteActions ? "#C23030" : "#CED9E0"}`,
                                                borderRadius: 3
                                            }}>
                                                <button onClick={() => toggleAIExec(ai)}
                                                    style={{ border: "none", background: "transparent", cursor: "pointer", display: "flex", padding: 0 }}>
                                                    {ap.canExecuteActions
                                                        ? <ToggleRight style={{ width: 20, height: 20, color: "#C23030" }} />
                                                        : <ToggleLeft style={{ width: 20, height: 20, color: "#8A9BA8" }} />}
                                                </button>
                                                <span style={{
                                                    fontSize: 11, fontWeight: 700,
                                                    color: ap.canExecuteActions ? "#C23030" : "#5C7080"
                                                }}>
                                                    {ap.canExecuteActions ? "⚠ Can Execute Actions" : "Suggestion-Only (Recommended)"}
                                                </span>
                                                {ap.canExecuteActions && (
                                                    <span style={{ fontSize: 10, color: "#C23030", marginLeft: "auto" }}>
                                                        Agent can write to Ontology on behalf of this role
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                <button onClick={() => {
                                    const ap: AIPermRow = {
                                        agentName: "New Agent", model: "gpt-4o", scope: "query",
                                        maxObjectTypes: 2, canExecuteActions: false,
                                    };
                                    updateSel({ ...sel, aiPerms: [...sel.aiPerms, ap] });
                                }} style={{
                                    display: "flex", alignItems: "center", gap: 5, padding: "5px 12px",
                                    borderRadius: 3, border: "1px dashed #CED9E0", background: "transparent",
                                    cursor: "pointer", fontSize: 11, color: "#5C7080", marginTop: 6
                                }}>
                                    <Plus style={{ width: 12, height: 12 }} /> Add agent access
                                </button>

                                {/* Warning */}
                                <div style={{
                                    marginTop: 14, padding: "8px 12px", background: "rgba(194,48,48,0.06)",
                                    border: "1px solid rgba(194,48,48,0.3)", borderRadius: 4, display: "flex", gap: 8
                                }}>
                                    <AlertCircle style={{ width: 13, height: 13, color: "#C23030", flexShrink: 0 }} />
                                    <span style={{ fontSize: 11, color: "#8A1818", lineHeight: 1.5 }}>
                                        <strong>AI Scope Enforcement:</strong> AIP agents only surface data that the authenticated user has "View" permission on.
                                        "Execute Actions" allows the agent to trigger Ontology writes on behalf of this role without per-action human approval. Use with extreme caution.
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* ── MARKINGS & MANDATORY CONTROLS ── */}
                        {tab === "markings" && (
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#182026", marginBottom: 4 }}>Markings & Mandatory Controls</div>
                                <div style={{ fontSize: 11, color: "#5C7080", marginBottom: 14, lineHeight: 1.6 }}>
                                    Markings are <strong>mandatory controls</strong> that override all RBAC role grants.
                                    A user cannot access a marked resource unless they hold that Marking, regardless of their role.
                                    Types: Classification (data sensitivity), Organization (team scope), Caveat (additional restrictions).
                                </div>

                                {/* Role's granted markings */}
                                <div style={{ fontSize: 12, fontWeight: 700, color: "#182026", marginBottom: 8 }}>
                                    Markings granted to: <em>{sel.name}</em>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    {MARKINGS.map(mk => {
                                        const granted = sel.markings.includes(mk.id);
                                        const col = mk.type === "classification" ? "#C23030" : mk.type === "organization" ? "#137CBD" : "#D9822B";
                                        return (
                                            <div key={mk.id} style={{
                                                display: "flex", alignItems: "center", gap: 12,
                                                padding: "10px 14px", background: "#fff",
                                                border: `1px solid ${granted ? col : "#CED9E0"}`,
                                                borderRadius: 4, opacity: mk.active ? 1 : 0.5
                                            }}>
                                                {/* Marking badge */}
                                                <div style={{ flexShrink: 0 }}>
                                                    <span style={{
                                                        fontSize: 9, padding: "3px 7px", borderRadius: 3, fontWeight: 700,
                                                        border: `1px solid ${col}`, background: `${col}12`, color: col
                                                    }}>
                                                        {mk.type === "classification" ? "CLASSIF" : mk.type === "organization" ? "ORG" : "CAVEAT"}
                                                    </span>
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: 12, fontWeight: 700, color: "#182026" }}>{mk.name}</div>
                                                    <div style={{ fontSize: 10, color: "#8A9BA8" }}>{mk.description}</div>
                                                    {!mk.active && <div style={{ fontSize: 9, color: "#D9822B", fontWeight: 700 }}>INACTIVE — not enforced on platform</div>}
                                                </div>

                                                {/* Grant/Revoke — disabled if marking inactive */}
                                                <button
                                                    disabled={!mk.active}
                                                    onClick={() => toggleMarking(mk.id)}
                                                    title={!mk.active ? "Marking is inactive on this platform" : granted ? "Revoke this marking" : "Grant this marking"}
                                                    style={{
                                                        padding: "4px 12px", borderRadius: 3, cursor: mk.active ? "pointer" : "not-allowed",
                                                        fontSize: 11, fontWeight: 600,
                                                        border: `1px solid ${granted ? col : "#CED9E0"}`,
                                                        background: granted ? `${col}12` : "#fff",
                                                        color: granted ? col : "#5C7080",
                                                        opacity: mk.active ? 1 : 0.45
                                                    }}>
                                                    {granted ? <><Check style={{ width: 11, height: 11, display: "inline" }} /> Granted</> : "Grant"}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div style={{
                                    marginTop: 14, padding: "8px 12px", background: "#FFF3E0",
                                    border: "1px solid #F5C894", borderRadius: 4, display: "flex", gap: 8
                                }}>
                                    <AlertTriangle style={{ width: 13, height: 13, color: "#D9822B", flexShrink: 0 }} />
                                    <span style={{ fontSize: 11, color: "#77450D", lineHeight: 1.5 }}>
                                        <strong>Foundry mandatory control:</strong> Markings use logical AND. A user needs ALL markings on a resource to access it.
                                        Organizations use logical AND. Removing a marking causes immediate loss of access to all resources bearing that marking.
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
