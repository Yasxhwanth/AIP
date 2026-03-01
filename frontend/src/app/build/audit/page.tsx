"use client";
import { useState, useMemo } from "react";
import {
    FileText, Search, Download, Filter, User, Brain, Server, Settings,
    ChevronDown, ChevronRight, Shield, Database, Zap, Layers, Eye,
    AlertTriangle, Check, X, Clock, Hash, GitBranch, Tag, Copy,
    RefreshCw, Lock, Globe, Info
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type ActorType = "human" | "ai-agent" | "service-account" | "system";
type EventCategory = "schema" | "action" | "data-access" | "ai" | "security" | "publish" | "governance" | "role";
type Severity = "info" | "warning" | "critical";
type DiffOp = "added" | "removed" | "modified" | "unchanged";

interface FieldDiff {
    field: string;
    op: DiffOp;
    before?: string | number | boolean | null;
    after?: string | number | boolean | null;
}

interface VersionStamp {
    txnId: string;         // e.g. "txn-2f4a9c"
    rid: string;           // Foundry RID
    branch: string;        // e.g. "master"
    commitHash: string;    // short hash
}

interface AuditEvent {
    id: string;
    timestamp: string;       // ISO
    actorType: ActorType;
    actorName: string;       // display name
    actorId: string;         // e.g. user RID or agent ID
    category: EventCategory;
    eventType: string;       // e.g. "ObjectType.PropertyAdded"
    description: string;
    resource: string;        // affected resource name
    resourceType: string;    // e.g. "ObjectType", "ActionType"
    severity: Severity;
    version: VersionStamp;
    diff: FieldDiff[];
    complianceTags: string[];
    immutable: true;         // always true — synthetic const
    sessionId: string;
    ipAddress: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const ACTOR_META: Record<ActorType, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    "human": { label: "Human", color: "#137CBD", bg: "rgba(19,124,189,0.1)", icon: User },
    "ai-agent": { label: "AI Agent", color: "#7157D9", bg: "rgba(113,87,217,0.1)", icon: Brain },
    "service-account": { label: "Service", color: "#D9822B", bg: "rgba(217,130,43,0.1)", icon: Server },
    "system": { label: "System", color: "#5C7080", bg: "rgba(92,112,128,0.1)", icon: Settings },
};

const CAT_META: Record<EventCategory, { label: string; color: string; icon: React.ElementType }> = {
    "schema": { label: "Schema", color: "#137CBD", icon: Database },
    "action": { label: "Action", color: "#C23030", icon: Zap },
    "data-access": { label: "Data Access", color: "#0D8050", icon: Eye },
    "ai": { label: "AI", color: "#7157D9", icon: Brain },
    "security": { label: "Security", color: "#C23030", icon: Shield },
    "publish": { label: "Publish", color: "#D9822B", icon: Globe },
    "governance": { label: "Governance", color: "#5C7080", icon: FileText },
    "role": { label: "Role", color: "#7157D9", icon: Layers },
};

const SEV_META: Record<Severity, { color: string; bg: string }> = {
    info: { color: "#5C7080", bg: "#EBF1F5" },
    warning: { color: "#D9822B", bg: "rgba(217,130,43,0.1)" },
    critical: { color: "#C23030", bg: "rgba(194,48,48,0.1)" },
};

const DIFF_OP_STYLE: Record<DiffOp, { bg: string; fg: string; prefix: string }> = {
    added: { bg: "#E6F7F0", fg: "#0D8050", prefix: "+" },
    removed: { bg: "#FFF0F0", fg: "#C23030", prefix: "−" },
    modified: { bg: "#FFF3E0", fg: "#D9822B", prefix: "~" },
    unchanged: { bg: "#F5F8FA", fg: "#8A9BA8", prefix: " " },
};

// ── Seed Data (Palantir audit.3 schema–accurate, static IDs to prevent SSR hydration mismatch) ───
const SEED_EVENTS: AuditEvent[] = [
    {
        id: "e1", timestamp: "2026-03-01T10:41:22.311Z",
        actorType: "human", actorName: "Sarah Chen", actorId: "usr.abc123",
        category: "schema", eventType: "ObjectType.PropertyAdded",
        description: "Added property `responseTimeSec` (Float64) to ObjectType `Pilot`",
        resource: "Pilot", resourceType: "ObjectType", severity: "info",
        version: { txnId: "txn-4fa9c1", rid: "ri.foundry-catalog.api.ontology-metadata.main.a1b2c3d4", branch: "master", commitHash: "f3a9c12" },
        diff: [
            { field: "properties.responseTimeSec", op: "added", before: null, after: "Float64" },
            { field: "properties.responseTimeSec.nullable", op: "added", before: null, after: true },
            { field: "metadata.updatedAt", op: "modified", before: "2026-02-28T09:00:00Z", after: "2026-03-01T10:41:22Z" },
        ],
        complianceTags: ["NIST 800-53"], sessionId: "sess_q1w2e3r4t5y6", ipAddress: "10.0.1.42", immutable: true,
    },
    {
        id: "e2", timestamp: "2026-03-01T10:35:14.089Z",
        actorType: "ai-agent", actorName: "Mission Ops Assistant", actorId: "agent.mission-ops-v2",
        category: "action", eventType: "Action.Applied",
        description: "Applied action `EscalateMission` on Mission `OP-7741` (confidence: 94%)",
        resource: "EscalateMission", resourceType: "ActionType", severity: "warning",
        version: { txnId: "txn-8imi31", rid: "ri.foundry-catalog.api.action-log.main.b2c3d4e5", branch: "master", commitHash: "hqgwuqk" },
        diff: [
            { field: "Mission.status", op: "modified", before: "ACTIVE", after: "ESCALATED" },
            { field: "Mission.priority", op: "modified", before: "MEDIUM", after: "CRITICAL" },
            { field: "Mission.escalatedBy", op: "added", before: null, after: "ai-agent:mission-ops-v2" },
            { field: "Mission.approvedBy", op: "added", before: null, after: "usr.cmd-harris" },
        ],
        complianceTags: ["EU AI Act", "NIST 800-53"], sessionId: "sess_tpcrgzx3on", ipAddress: "10.0.2.11", immutable: true,
    },
    {
        id: "e3", timestamp: "2026-03-01T10:28:55.400Z",
        actorType: "human", actorName: "James Okoro", actorId: "usr.jokoro",
        category: "role", eventType: "Role.PermissionGranted",
        description: "Granted `edit` permission on ObjectType `Mission` to role `Operator`",
        resource: "Mission", resourceType: "RolePermission", severity: "warning",
        version: { txnId: "txn-c3d4e5", rid: "ri.foundry-catalog.api.access-control.main.c3d4e5f6", branch: "master", commitHash: "2b7f9a1" },
        diff: [
            { field: "role.Operator.Mission.edit", op: "added", before: "none", after: "limited" },
            { field: "role.Operator.Mission.view", op: "unchanged", before: "full", after: "full" },
        ],
        complianceTags: ["SOC 2", "NIST 800-53"], sessionId: "sess_a1s2d3f4g5h6", ipAddress: "10.0.1.88", immutable: true,
    },
    {
        id: "e4", timestamp: "2026-03-01T10:15:03.772Z",
        actorType: "ai-agent", actorName: "Fleet Risk Analyst", actorId: "agent.fleet-risk-v1",
        category: "data-access", eventType: "Dataset.Read",
        description: "Read 1,847 rows from Dataset `drone_telemetry_live` (batch query)",
        resource: "drone_telemetry_live", resourceType: "Dataset", severity: "info",
        version: { txnId: "txn-7u1i54", rid: "ri.foundry-catalog.api.dataset.main.d4e5f6a7", branch: "master", commitHash: "9c3f2b8" },
        diff: [
            { field: "query.rowsRead", op: "added", before: null, after: 1847 },
            { field: "query.duration_ms", op: "added", before: null, after: 312 },
            { field: "query.filter", op: "added", before: null, after: "status=ACTIVE" },
        ],
        complianceTags: ["GDPR Art.30"], sessionId: "sess_z1x2c3v4b5n6", ipAddress: "10.0.3.01", immutable: true,
    },
    {
        id: "e5", timestamp: "2026-03-01T09:58:40.201Z",
        actorType: "human", actorName: "Priya Sharma", actorId: "usr.psharma",
        category: "ai", eventType: "Agent.GuardrailUpdated",
        description: "Updated token limit for `Mission Ops Assistant` from 4096 → 8192",
        resource: "Mission Ops Assistant", resourceType: "AIPAgent", severity: "info",
        version: { txnId: "txn-e5f6a7", rid: "ri.foundry-catalog.api.aip-agent.main.e5f6a7b8", branch: "master", commitHash: "1d4e7c9" },
        diff: [
            { field: "guardrails.maxTokens", op: "modified", before: 4096, after: 8192 },
            { field: "guardrails.piiRedact", op: "unchanged", before: true, after: true },
            { field: "metadata.updatedBy", op: "modified", before: "usr.admin", after: "usr.psharma" },
        ],
        complianceTags: ["EU AI Act"], sessionId: "sess_m1n2b3v4c5x6", ipAddress: "10.0.1.55", immutable: true,
    },
    {
        id: "e6", timestamp: "2026-03-01T09:44:12.900Z",
        actorType: "service-account", actorName: "data-pipeline-svc", actorId: "svc.data-pipeline",
        category: "schema", eventType: "Dataset.SchemaEvolved",
        description: "Schema evolution on `drone_telemetry_live`: added column `batteryTempC` (Float32)",
        resource: "drone_telemetry_live", resourceType: "Dataset", severity: "info",
        version: { txnId: "txn-f6a7b8", rid: "ri.foundry-catalog.api.dataset.main.f6a7b8c9", branch: "master", commitHash: "4e8f1a3" },
        diff: [
            { field: "schema.batteryTempC", op: "added", before: null, after: "Float32" },
            { field: "schema.version", op: "modified", before: "v14", after: "v15" },
        ],
        complianceTags: [], sessionId: "sess_l1k2j3h4g5f6", ipAddress: "10.0.4.22", immutable: true,
    },
    {
        id: "e7", timestamp: "2026-03-01T09:30:00.500Z",
        actorType: "human", actorName: "Sarah Chen", actorId: "usr.abc123",
        category: "security", eventType: "Marking.Revoked",
        description: "Revoked marking `CONFIDENTIAL` from role `Operator`",
        resource: "Operator", resourceType: "Role", severity: "critical",
        version: { txnId: "txn-a7b8c9", rid: "ri.foundry-catalog.api.access-control.main.a7b8c9d0", branch: "master", commitHash: "7f2a9d4" },
        diff: [
            { field: "role.Operator.markings.CONFIDENTIAL", op: "removed", before: "granted", after: null },
            { field: "effectiveAt", op: "added", before: null, after: "2026-03-01T09:30:00Z" },
        ],
        complianceTags: ["SOC 2", "ISO 27001", "NIST 800-53"], sessionId: "sess_p1o2i3u4y5t6", ipAddress: "10.0.1.42", immutable: true,
    },
    {
        id: "e8", timestamp: "2026-03-01T09:12:33.811Z",
        actorType: "human", actorName: "James Okoro", actorId: "usr.jokoro",
        category: "publish", eventType: "App.Published",
        description: "Published Workshop app `Mission Operations Center` (v2.4.1) to Production",
        resource: "Mission Operations Center", resourceType: "WorkshopApp", severity: "info",
        version: { txnId: "txn-b8c9d0", rid: "ri.foundry-catalog.api.workshop.main.b8c9d0e1", branch: "master", commitHash: "3b6e8f2" },
        diff: [
            { field: "app.version", op: "modified", before: "2.4.0", after: "2.4.1" },
            { field: "app.environment", op: "modified", before: "staging", after: "production" },
            { field: "app.publishedAt", op: "added", before: null, after: "2026-03-01T09:12:33Z" },
        ],
        complianceTags: [], sessionId: "sess_r1e2w3q4a5s6", ipAddress: "10.0.1.88", immutable: true,
    },
    {
        id: "e9", timestamp: "2026-03-01T08:55:19.102Z",
        actorType: "system", actorName: "Foundry Platform", actorId: "sys.foundry",
        category: "governance", eventType: "Policy.AutoEnforced",
        description: "Auto-enforced policy `PII Retention — 90 Day Purge` on 14 Pilot records",
        resource: "PII Retention — 90 Day Purge", resourceType: "GovernancePolicy", severity: "warning",
        version: { txnId: "txn-c9d0e1", rid: "ri.foundry-catalog.api.governance.main.c9d0e1f2", branch: "master", commitHash: "6c1d5a7" },
        diff: [
            { field: "deletedRecords.count", op: "added", before: null, after: 14 },
            { field: "deletedRecords.objectType", op: "added", before: null, after: "Pilot" },
            { field: "policy.lastEnforcedAt", op: "modified", before: "2026-02-28", after: "2026-03-01" },
        ],
        complianceTags: ["GDPR Art.17", "CCPA"], sessionId: "sess_d1f2g3h4j5k6", ipAddress: "10.0.0.1", immutable: true,
    },
    {
        id: "e10", timestamp: "2026-03-01T08:40:07.338Z",
        actorType: "ai-agent", actorName: "Mission Ops Assistant", actorId: "agent.mission-ops-v2",
        category: "action", eventType: "Action.SuggestedRejected",
        description: "Human rejected AI suggestion: `AssignPilot` for Mission `OP-7739` (reason: schedule conflict)",
        resource: "AssignPilot", resourceType: "ActionType", severity: "info",
        version: { txnId: "txn-wrx9ob", rid: "ri.foundry-catalog.api.action-log.main.d0e1f2a3", branch: "master", commitHash: "5b9a2e1" },
        diff: [
            { field: "suggestion.status", op: "modified", before: "PENDING", after: "REJECTED" },
            { field: "suggestion.rejectedBy", op: "added", before: null, after: "usr.cmd-harris" },
            { field: "suggestion.reason", op: "added", before: null, after: "schedule conflict" },
        ],
        complianceTags: ["EU AI Act"], sessionId: "sess_n1m2b3v4c5x6", ipAddress: "10.0.2.11", immutable: true,
    },
    {
        id: "e11", timestamp: "2026-03-01T08:22:45.901Z",
        actorType: "human", actorName: "Priya Sharma", actorId: "usr.psharma",
        category: "schema", eventType: "ActionType.ParameterModified",
        description: "Modified `EscalateMission` parameter `priority`: type changed String → Enum[LOW,MEDIUM,HIGH,CRITICAL]",
        resource: "EscalateMission", resourceType: "ActionType", severity: "warning",
        version: { txnId: "txn-e1f2a3", rid: "ri.foundry-catalog.api.ontology-metadata.main.e1f2a3b4", branch: "master", commitHash: "2a7d4f8" },
        diff: [
            { field: "param.priority.type", op: "modified", before: "String", after: "Enum" },
            { field: "param.priority.enumValues", op: "added", before: null, after: "[LOW,MEDIUM,HIGH,CRITICAL]" },
            { field: "param.priority.default", op: "modified", before: null, after: "MEDIUM" },
        ],
        complianceTags: [], sessionId: "sess_t1y2u3i4o5p6", ipAddress: "10.0.1.55", immutable: true,
    },
    {
        id: "e12", timestamp: "2026-03-01T08:01:11.299Z",
        actorType: "service-account", actorName: "metrics-aggregator-svc", actorId: "svc.metrics-agg",
        category: "data-access", eventType: "Dataset.Write",
        description: "Wrote 4,210 aggregated rows to Dataset `mission_kpi_daily`",
        resource: "mission_kpi_daily", resourceType: "Dataset", severity: "info",
        version: { txnId: "txn-f2a3b4", rid: "ri.foundry-catalog.api.dataset.main.f2a3b4c5", branch: "master", commitHash: "9e3b6c1" },
        diff: [
            { field: "write.rowsInserted", op: "added", before: null, after: 4210 },
            { field: "write.duration_ms", op: "added", before: null, after: 891 },
            { field: "dataset.lastBuildAt", op: "modified", before: "2026-02-28T23:59:00Z", after: "2026-03-01T08:01:11Z" },
        ],
        complianceTags: [], sessionId: "sess_g1h2j3k4l5m6", ipAddress: "10.0.4.30", immutable: true,
    },
];

// ── Export helpers ──────────────────────────────────────────────────────────––
function exportJSON(events: AuditEvent[]) {
    const lines = events.map(e => JSON.stringify({
        id: e.id, timestamp: e.timestamp, actorType: e.actorType, actorName: e.actorName,
        actorId: e.actorId, category: e.category, eventType: e.eventType, description: e.description,
        resource: e.resource, severity: e.severity, txnId: e.version.txnId, branch: e.version.branch,
        commitHash: e.version.commitHash, complianceTags: e.complianceTags,
    }));
    const blob = new Blob([lines.join("\n")], { type: "application/json-lines" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `foundry-audit-${Date.now()}.jsonl`; a.click();
}

function exportCSV(events: AuditEvent[]) {
    const header = "id,timestamp,actorType,actorName,actorId,category,eventType,resource,severity,txnId";
    const rows = events.map(e =>
        [e.id, e.timestamp, e.actorType, e.actorName, e.actorId, e.category, e.eventType, e.resource, e.severity, e.version.txnId]
            .map(v => `"${v}"`).join(",")
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `foundry-audit-${Date.now()}.csv`; a.click();
}

// ── UI helpers ────────────────────────────────────────────────────────────────
const chip = (color: string): React.CSSProperties => ({
    fontSize: 9, padding: "2px 6px", borderRadius: 3, fontWeight: 700,
    border: `1px solid ${color}`, background: `${color}15`, color, flexShrink: 0,
});

function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).catch(() => { });
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AuditPage() {
    const [sel, setSel] = useState<AuditEvent | null>(SEED_EVENTS[0]);
    const [searchQ, setSearchQ] = useState("");
    const [filterActor, setFilterActor] = useState<ActorType | "all">("all");
    const [filterCat, setFilterCat] = useState<EventCategory | "all">("all");
    const [filterSev, setFilterSev] = useState<Severity | "all">("all");
    const [filterDate, setFilterDate] = useState<"today" | "week" | "month" | "all">("all");
    const [showFilters, setShowFilters] = useState(false);

    const filtered = useMemo(() => {
        const now = new Date("2026-03-01T16:11:06+05:30");
        return SEED_EVENTS.filter(e => {
            if (filterActor !== "all" && e.actorType !== filterActor) return false;
            if (filterCat !== "all" && e.category !== filterCat) return false;
            if (filterSev !== "all" && e.severity !== filterSev) return false;
            if (searchQ && !e.description.toLowerCase().includes(searchQ.toLowerCase()) &&
                !e.actorName.toLowerCase().includes(searchQ.toLowerCase()) &&
                !e.resource.toLowerCase().includes(searchQ.toLowerCase())) return false;
            if (filterDate !== "all") {
                const evD = new Date(e.timestamp);
                const diff = now.getTime() - evD.getTime();
                if (filterDate === "today" && diff > 86_400_000) return false;
                if (filterDate === "week" && diff > 604_800_000) return false;
                if (filterDate === "month" && diff > 2_592_000_000) return false;
            }
            return true;
        });
    }, [filterActor, filterCat, filterSev, filterDate, searchQ]);

    const fmtTime = (ts: string) => {
        const d = new Date(ts);
        return d.toLocaleString("en-GB", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    };
    const fmtVal = (v: string | number | boolean | null | undefined): string => {
        if (v === null || v === undefined) return "null";
        return String(v);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#F5F8FA", fontFamily: "Inter,sans-serif" }}>

            {/* Top bar */}
            <div style={{
                height: 44, display: "flex", alignItems: "center", padding: "0 14px",
                background: "#fff", borderBottom: "1px solid #CED9E0", gap: 8, flexShrink: 0
            }}>
                <FileText style={{ width: 16, height: 16, color: "#137CBD" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#182026" }}>Audit Log</span>
                <div style={{ width: 1, height: 16, background: "#CED9E0", margin: "0 4px" }} />
                <span style={{ fontSize: 11, color: "#5C7080" }}>Immutable · audit.3 schema · {SEED_EVENTS.length} events</span>

                <div style={{ flex: 1 }} />

                {/* Filter toggle */}
                <button onClick={() => setShowFilters(p => !p)}
                    style={{
                        height: 28, padding: "0 10px", borderRadius: 3, border: `1px solid ${showFilters ? "#137CBD" : "#CED9E0"}`,
                        background: showFilters ? "rgba(19,124,189,0.06)" : "#fff", color: showFilters ? "#137CBD" : "#5C7080",
                        fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5
                    }}>
                    <Filter style={{ width: 13, height: 13 }} /> Filters
                    {filterActor !== "all" || filterCat !== "all" || filterSev !== "all" || filterDate !== "all" ? (
                        <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 8, background: "#137CBD", color: "#fff", fontWeight: 700 }}>
                            {[filterActor, filterCat, filterSev, filterDate].filter(f => f !== "all").length}
                        </span>
                    ) : null}
                </button>

                {/* Export */}
                <div style={{ position: "relative" }}>
                    <button onClick={() => exportJSON(filtered)}
                        style={{
                            height: 28, padding: "0 10px", borderRadius: "3px 0 0 3px", border: "1px solid #CED9E0",
                            background: "#fff", color: "#394B59", fontSize: 12, fontWeight: 600, cursor: "pointer",
                            display: "flex", alignItems: "center", gap: 5, borderRight: "none"
                        }}>
                        <Download style={{ width: 13, height: 13 }} /> Export JSON
                    </button>
                </div>
                <button onClick={() => exportCSV(filtered)}
                    style={{
                        height: 28, padding: "0 10px", borderRadius: "0 3px 3px 0", border: "1px solid #CED9E0",
                        background: "#fff", color: "#394B59", fontSize: 12, fontWeight: 600, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 5
                    }}>
                    CSV
                </button>

                {/* Immutable lock badge */}
                <div style={{
                    display: "flex", alignItems: "center", gap: 4, padding: "3px 8px",
                    borderRadius: 3, border: "1px solid #0D8050", background: "#E6F7F0"
                }}>
                    <Lock style={{ width: 11, height: 11, color: "#0D8050" }} />
                    <span style={{ fontSize: 10, color: "#0D8050", fontWeight: 700 }}>IMMUTABLE</span>
                </div>
            </div>

            {/* Filter bar */}
            {showFilters && (
                <div style={{
                    padding: "8px 14px", background: "#fff", borderBottom: "1px solid #CED9E0",
                    display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", flexShrink: 0
                }}>

                    {/* Actor type */}
                    <div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: "#5C7080", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Actor</div>
                        <div style={{ display: "flex", gap: 4 }}>
                            {(["all", "human", "ai-agent", "service-account", "system"] as const).map(a => {
                                const active = filterActor === a;
                                const color = a === "all" ? "#5C7080" : ACTOR_META[a].color;
                                return (
                                    <button key={a} onClick={() => setFilterActor(a)}
                                        style={{
                                            padding: "3px 8px", borderRadius: 3, border: `1px solid ${active ? color : "#CED9E0"}`,
                                            background: active ? `${color}12` : "#fff", color: active ? color : "#8A9BA8",
                                            fontSize: 10, fontWeight: 600, cursor: "pointer"
                                        }}>
                                        {a === "all" ? "All" : ACTOR_META[a].label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: "#5C7080", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Category</div>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {(["all", ...Object.keys(CAT_META)] as (EventCategory | "all")[]).map(c => {
                                const active = filterCat === c;
                                const color = c === "all" ? "#5C7080" : CAT_META[c as EventCategory].color;
                                return (
                                    <button key={c} onClick={() => setFilterCat(c)}
                                        style={{
                                            padding: "3px 8px", borderRadius: 3, border: `1px solid ${active ? color : "#CED9E0"}`,
                                            background: active ? `${color}12` : "#fff", color: active ? color : "#8A9BA8",
                                            fontSize: 10, fontWeight: 600, cursor: "pointer"
                                        }}>
                                        {c === "all" ? "All" : CAT_META[c as EventCategory].label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Severity */}
                    <div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: "#5C7080", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Severity</div>
                        <div style={{ display: "flex", gap: 4 }}>
                            {(["all", "info", "warning", "critical"] as const).map(s => {
                                const active = filterSev === s;
                                const color = s === "all" ? "#5C7080" : SEV_META[s].color;
                                return (
                                    <button key={s} onClick={() => setFilterSev(s)}
                                        style={{
                                            padding: "3px 8px", borderRadius: 3, border: `1px solid ${active ? color : "#CED9E0"}`,
                                            background: active ? SEV_META[s === "all" ? "info" : s].bg : "#fff",
                                            color: active ? color : "#8A9BA8", fontSize: 10, fontWeight: 600, cursor: "pointer"
                                        }}>
                                        {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Date range */}
                    <div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: "#5C7080", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Date Range</div>
                        <div style={{ display: "flex", gap: 4 }}>
                            {(["all", "today", "week", "month"] as const).map(d => {
                                const active = filterDate === d;
                                return (
                                    <button key={d} onClick={() => setFilterDate(d)}
                                        style={{
                                            padding: "3px 8px", borderRadius: 3, border: `1px solid ${active ? "#137CBD" : "#CED9E0"}`,
                                            background: active ? "rgba(19,124,189,0.08)" : "#fff",
                                            color: active ? "#137CBD" : "#8A9BA8", fontSize: 10, fontWeight: 600, cursor: "pointer"
                                        }}>
                                        {d === "all" ? "All time" : d.charAt(0).toUpperCase() + d.slice(1)}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Reset */}
                    {(filterActor !== "all" || filterCat !== "all" || filterSev !== "all" || filterDate !== "all") && (
                        <button onClick={() => { setFilterActor("all"); setFilterCat("all"); setFilterSev("all"); setFilterDate("all"); }}
                            style={{
                                alignSelf: "flex-end", padding: "3px 8px", border: "1px solid #CED9E0", borderRadius: 3,
                                background: "#fff", color: "#C23030", fontSize: 10, fontWeight: 600, cursor: "pointer",
                                display: "flex", alignItems: "center", gap: 4
                            }}>
                            <X style={{ width: 10, height: 10 }} /> Reset
                        </button>
                    )}
                </div>
            )}

            {/* Search */}
            <div style={{ padding: "8px 14px", background: "#fff", borderBottom: "1px solid #CED9E0", flexShrink: 0 }}>
                <div style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "5px 10px",
                    border: "1px solid #CED9E0", borderRadius: 3, background: "#F5F8FA", maxWidth: 480
                }}>
                    <Search style={{ width: 13, height: 13, color: "#8A9BA8", flexShrink: 0 }} />
                    <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                        placeholder="Search events by description, actor, or resource…"
                        style={{ border: "none", background: "transparent", fontSize: 12, outline: "none", flex: 1, color: "#182026" }} />
                    {searchQ && <button onClick={() => setSearchQ("")} style={{ border: "none", background: "transparent", cursor: "pointer", display: "flex", color: "#8A9BA8" }}>
                        <X style={{ width: 12, height: 12 }} />
                    </button>}
                </div>
            </div>

            {/* Main content */}
            <div style={{ flex: 1, display: "flex", minHeight: 0 }}>

                {/* ── Timeline ── */}
                <div style={{
                    width: 440, background: "#fff", borderRight: "1px solid #CED9E0",
                    display: "flex", flexDirection: "column", flexShrink: 0
                }}>
                    <div style={{
                        padding: "6px 14px", fontSize: 9, fontWeight: 700, color: "#5C7080",
                        textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid #EBF1F5",
                        display: "flex", justifyContent: "space-between"
                    }}>
                        <span>Timeline ({filtered.length} events)</span>
                        <span style={{ color: "#0D8050" }}>↓ Newest first</span>
                    </div>

                    <div style={{ flex: 1, overflow: "auto" }}>
                        {filtered.length === 0 && (
                            <div style={{ padding: 24, textAlign: "center", color: "#8A9BA8", fontSize: 12 }}>
                                No events match the current filters.
                            </div>
                        )}
                        {filtered.map((ev, idx) => {
                            const am = ACTOR_META[ev.actorType];
                            const cm = CAT_META[ev.category];
                            const sm = SEV_META[ev.severity];
                            const ActorIcon = am.icon;
                            const CatIcon = cm.icon;
                            const isSel = sel?.id === ev.id;
                            return (
                                <div key={ev.id} onClick={() => setSel(ev)}
                                    style={{
                                        padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid #EBF1F5",
                                        borderLeft: isSel ? "3px solid #137CBD" : "3px solid transparent",
                                        background: isSel ? "rgba(19,124,189,0.04)" : "transparent",
                                        position: "relative"
                                    }}>

                                    {/* Severity bar */}
                                    {ev.severity !== "info" && (
                                        <div style={{
                                            position: "absolute", right: 0, top: 0, bottom: 0, width: 3,
                                            background: sm.color
                                        }} />
                                    )}

                                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                                        {/* Actor icon */}
                                        <div style={{
                                            width: 26, height: 26, borderRadius: "50%", background: am.bg,
                                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1
                                        }}>
                                            <ActorIcon style={{ width: 13, height: 13, color: am.color }} />
                                        </div>

                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            {/* Header row */}
                                            <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                                                <span style={{ fontSize: 11, fontWeight: 700, color: "#182026" }}>{ev.actorName}</span>
                                                <span style={chip(am.color)}>{am.label}</span>
                                                <span style={chip(cm.color)}>{cm.label}</span>
                                                {ev.severity !== "info" && (
                                                    <span style={chip(sm.color)}>{ev.severity.toUpperCase()}</span>
                                                )}
                                            </div>

                                            {/* Event type */}
                                            <div style={{ fontSize: 10, color: "#137CBD", fontFamily: "monospace", marginTop: 2 }}>
                                                {ev.eventType}
                                            </div>

                                            {/* Description */}
                                            <div style={{
                                                fontSize: 11, color: "#5C7080", marginTop: 3, lineHeight: 1.4,
                                                overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box",
                                                WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const
                                            }}>
                                                {ev.description}
                                            </div>

                                            {/* Footer */}
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                                                <span style={{ fontSize: 9, color: "#8A9BA8", fontFamily: "monospace" }}>
                                                    <Clock style={{ width: 9, height: 9, display: "inline" }} /> {fmtTime(ev.timestamp)}
                                                </span>
                                                <span style={{ fontSize: 9, color: "#8A9BA8", fontFamily: "monospace" }}>
                                                    {ev.version.txnId}
                                                </span>
                                                {ev.complianceTags.length > 0 && (
                                                    <span style={{ fontSize: 9, color: "#7157D9" }}>
                                                        <Tag style={{ width: 9, height: 9, display: "inline" }} /> {ev.complianceTags[0]}
                                                        {ev.complianceTags.length > 1 ? ` +${ev.complianceTags.length - 1}` : ""}
                                                    </span>
                                                )}
                                                <span style={{ marginLeft: "auto", fontSize: 9, color: "#CED9E0" }}>#{ev.id}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Detail / Diff Viewer ── */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                    {!sel ? (
                        <div style={{
                            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#8A9BA8", fontSize: 13
                        }}>
                            Select an event to view details and diff
                        </div>
                    ) : (
                        <>
                            {/* Detail header */}
                            <div style={{ padding: "12px 16px", background: "#fff", borderBottom: "1px solid #CED9E0", flexShrink: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                    {(() => {
                                        const am = ACTOR_META[sel.actorType]; const AI = am.icon;
                                        return <div style={{
                                            width: 28, height: 28, borderRadius: "50%", background: am.bg,
                                            display: "flex", alignItems: "center", justifyContent: "center"
                                        }}>
                                            <AI style={{ width: 14, height: 14, color: am.color }} /></div>;
                                    })()}
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: "#182026" }}>{sel.actorName}</div>
                                        <div style={{ fontSize: 10, color: "#5C7080", fontFamily: "monospace" }}>{sel.actorId}</div>
                                    </div>
                                    <div style={{ display: "flex", gap: 5, marginLeft: 4 }}>
                                        <span style={chip(ACTOR_META[sel.actorType].color)}>{ACTOR_META[sel.actorType].label}</span>
                                        <span style={chip(CAT_META[sel.category].color)}>{CAT_META[sel.category].label}</span>
                                        <span style={chip(SEV_META[sel.severity].color)}>{sel.severity.toUpperCase()}</span>
                                    </div>
                                    <div style={{ flex: 1 }} />
                                    <div style={{
                                        display: "flex", alignItems: "center", gap: 4, padding: "3px 8px",
                                        borderRadius: 3, border: "1px solid #0D8050", background: "#E6F7F0"
                                    }}>
                                        <Lock style={{ width: 10, height: 10, color: "#0D8050" }} />
                                        <span style={{ fontSize: 9, color: "#0D8050", fontWeight: 700 }}>IMMUTABLE RECORD</span>
                                    </div>
                                </div>

                                {/* Event type */}
                                <div style={{ fontSize: 11, color: "#137CBD", fontFamily: "monospace", marginBottom: 4 }}>
                                    {sel.eventType}
                                </div>
                                <div style={{ fontSize: 12, color: "#182026", lineHeight: 1.5 }}>{sel.description}</div>

                                {/* Compliance tags */}
                                {sel.complianceTags.length > 0 && (
                                    <div style={{ display: "flex", gap: 5, marginTop: 6, flexWrap: "wrap" }}>
                                        {sel.complianceTags.map(t => <span key={t} style={chip("#7157D9")}><Tag style={{ width: 9, height: 9, display: "inline" }} /> {t}</span>)}
                                    </div>
                                )}
                            </div>

                            {/* Version stamp */}
                            <div style={{
                                padding: "8px 16px", background: "#F5F8FA", borderBottom: "1px solid #CED9E0",
                                display: "flex", gap: 16, alignItems: "center", flexShrink: 0
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                    <Hash style={{ width: 11, height: 11, color: "#8A9BA8" }} />
                                    <span style={{ fontSize: 10, color: "#5C7080" }}>Txn:</span>
                                    <span style={{ fontSize: 10, color: "#182026", fontFamily: "monospace", fontWeight: 700 }}>{sel.version.txnId}</span>
                                    <button onClick={() => copyToClipboard(sel.version.txnId)}
                                        style={{ border: "none", background: "transparent", cursor: "pointer", display: "flex", color: "#8A9BA8" }}>
                                        <Copy style={{ width: 10, height: 10 }} />
                                    </button>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                    <GitBranch style={{ width: 11, height: 11, color: "#8A9BA8" }} />
                                    <span style={{ fontSize: 10, color: "#5C7080" }}>Branch:</span>
                                    <span style={{ fontSize: 10, color: "#182026", fontFamily: "monospace", fontWeight: 700 }}>{sel.version.branch}</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                    <GitBranch style={{ width: 11, height: 11, color: "#8A9BA8" }} />
                                    <span style={{ fontSize: 10, color: "#5C7080" }}>Commit:</span>
                                    <span style={{ fontSize: 10, color: "#182026", fontFamily: "monospace" }}>{sel.version.commitHash}</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                    <Clock style={{ width: 11, height: 11, color: "#8A9BA8" }} />
                                    <span style={{ fontSize: 10, color: "#5C7080", fontFamily: "monospace" }}>{sel.timestamp}</span>
                                </div>
                                <div style={{ flex: 1 }} />
                                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                    <Globe style={{ width: 11, height: 11, color: "#8A9BA8" }} />
                                    <span style={{ fontSize: 10, color: "#5C7080", fontFamily: "monospace" }}>{sel.ipAddress}</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                    <Settings style={{ width: 11, height: 11, color: "#8A9BA8" }} />
                                    <span style={{ fontSize: 10, color: "#5C7080", fontFamily: "monospace" }}>{sel.sessionId}</span>
                                </div>
                            </div>

                            {/* RID */}
                            <div style={{
                                padding: "4px 16px", background: "#F5F8FA", borderBottom: "1px solid #CED9E0",
                                display: "flex", alignItems: "center", gap: 6, flexShrink: 0
                            }}>
                                <span style={{ fontSize: 9, color: "#8A9BA8", fontWeight: 700, textTransform: "uppercase" }}>Resource RID</span>
                                <span style={{
                                    fontSize: 9, color: "#5C7080", fontFamily: "monospace", flex: 1,
                                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                                }}>{sel.version.rid}</span>
                                <button onClick={() => copyToClipboard(sel.version.rid)}
                                    style={{ border: "none", background: "transparent", cursor: "pointer", display: "flex", color: "#8A9BA8" }}>
                                    <Copy style={{ width: 10, height: 10 }} />
                                </button>
                            </div>

                            {/* Diff viewer */}
                            <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
                                <div style={{
                                    fontSize: 11, fontWeight: 700, color: "#182026", marginBottom: 12,
                                    display: "flex", alignItems: "center", gap: 8
                                }}>
                                    Field-level Diff
                                    <span style={{
                                        fontSize: 9, padding: "2px 6px", borderRadius: 3,
                                        background: "#EBF1F5", color: "#5C7080", fontWeight: 600
                                    }}>
                                        {sel.diff.length} field{sel.diff.length !== 1 ? "s" : ""}
                                    </span>
                                    <div style={{ display: "flex", gap: 8, marginLeft: 8 }}>
                                        {(["added", "removed", "modified", "unchanged"] as DiffOp[]).map(op => {
                                            const ds = DIFF_OP_STYLE[op]; const count = sel.diff.filter(d => d.op === op).length;
                                            if (!count) return null;
                                            return <span key={op} style={{ fontSize: 9, display: "flex", alignItems: "center", gap: 3 }}>
                                                <span style={{ fontSize: 11, color: ds.fg, fontWeight: 700 }}>{ds.prefix}</span>
                                                <span style={{ color: ds.fg }}>{count} {op}</span>
                                            </span>;
                                        })}
                                    </div>
                                </div>

                                {/* Diff table */}
                                <div style={{ background: "#fff", border: "1px solid #CED9E0", borderRadius: 4, overflow: "hidden", fontFamily: "monospace" }}>
                                    {/* Header */}
                                    <div style={{
                                        display: "grid", gridTemplateColumns: "28px 220px 1fr 1fr",
                                        background: "#F5F8FA", borderBottom: "1px solid #CED9E0"
                                    }}>
                                        <div style={{ padding: "6px 8px" }} />
                                        {["Field", "Before", "After"].map(h => (
                                            <div key={h} style={{
                                                padding: "6px 12px", fontSize: 9, fontWeight: 700,
                                                color: "#5C7080", textTransform: "uppercase", letterSpacing: "0.07em"
                                            }}>{h}</div>
                                        ))}
                                    </div>
                                    {sel.diff.map((d, i) => {
                                        const ds = DIFF_OP_STYLE[d.op];
                                        return (
                                            <div key={i} style={{
                                                display: "grid", gridTemplateColumns: "28px 220px 1fr 1fr",
                                                borderBottom: "1px solid #EBF1F5", background: ds.bg + "60"
                                            }}>
                                                {/* Op prefix */}
                                                <div style={{
                                                    padding: "7px 8px", display: "flex", alignItems: "center",
                                                    justifyContent: "center", fontSize: 14, color: ds.fg, fontWeight: 700
                                                }}>
                                                    {ds.prefix}
                                                </div>
                                                {/* Field name */}
                                                <div style={{
                                                    padding: "7px 12px", fontSize: 11, color: "#182026", fontWeight: 600,
                                                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                                                }}>
                                                    {d.field}
                                                </div>
                                                {/* Before */}
                                                <div style={{
                                                    padding: "7px 12px", fontSize: 11,
                                                    color: d.op === "removed" || d.op === "modified" ? "#C23030" : "#8A9BA8",
                                                    background: d.op === "removed" ? "rgba(194,48,48,0.06)" : d.op === "modified" ? "rgba(194,48,48,0.04)" : "transparent",
                                                    borderLeft: "1px solid #EBF1F5"
                                                }}>
                                                    {d.op === "added" ? <span style={{ color: "#8A9BA8", fontStyle: "italic" }}>—</span> : fmtVal(d.before)}
                                                </div>
                                                {/* After */}
                                                <div style={{
                                                    padding: "7px 12px", fontSize: 11,
                                                    color: d.op === "added" || d.op === "modified" ? "#0D8050" : "#8A9BA8",
                                                    background: d.op === "added" ? "rgba(13,128,80,0.06)" : d.op === "modified" ? "rgba(13,128,80,0.04)" : "transparent",
                                                    borderLeft: "1px solid #EBF1F5"
                                                }}>
                                                    {d.op === "removed" ? <span style={{ color: "#8A9BA8", fontStyle: "italic" }}>—</span> : fmtVal(d.after)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* SIEM export info */}
                                <div style={{
                                    marginTop: 16, padding: "8px 12px", background: "#EBF4FC",
                                    border: "1px solid #B3D7F5", borderRadius: 4, display: "flex", gap: 8
                                }}>
                                    <Info style={{ width: 13, height: 13, color: "#137CBD", flexShrink: 0 }} />
                                    <span style={{ fontSize: 11, color: "#1F4E79", lineHeight: 1.5 }}>
                                        <strong>SIEM Integration:</strong> audit.3 events can be ingested into SIEM systems via the Foundry API ({" "}
                                        <span style={{ fontFamily: "monospace", fontSize: 10 }}>GET /api/v1/audit/events?schema=3</span>{" "}).
                                        Events are append-only and cryptographically signed — deletion or modification is impossible.
                                    </span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
