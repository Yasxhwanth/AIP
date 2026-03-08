"use client";
import { useState, useEffect, useCallback } from "react";
import {
    Zap, Plus, Play, Square, Clock, Globe, Webhook, Hand,
    RefreshCw, Trash2, ChevronDown, ChevronRight, Check,
    X, AlertTriangle, Settings, Activity, BarChart2, Code2,
    Calendar, Bell, Layers, Database
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// ── Types ─────────────────────────────────────────────────────────────────────
type TriggerType = "schedule" | "event" | "webhook" | "manual";
type AutomateStatus = "active" | "inactive" | "paused";

interface AIPAutomate {
    id: string;
    name: string;
    description: string;
    status: AutomateStatus;
    triggerType: TriggerType;
    cronExpr: string | null;
    eventType: string | null;
    eventFilter: any;
    webhookPath: string | null;
    functionId: string | null;
    actionId: string | null;
    inputParams: any;
    totalRuns: number;
    successRuns: number;
    failedRuns: number;
    lastRunAt: string | null;
    nextRunAt: string | null;
    createdAt: string;
    updatedAt: string;
}

interface AutomateRun {
    id: string;
    automationId: string;
    status: "running" | "success" | "failed" | "timeout";
    trigger: string;
    inputData: any;
    outputData: any;
    errorMessage: string | null;
    startedAt: string;
    finishedAt: string | null;
    duration: number | null;
}

// ── Seed automations ─────────────────────────────────────────────────────────
const SEED_AUTOMATIONS = [
    {
        name: "Battery Alert Monitor",
        description: "Scans all drones every 5 minutes and flags units below 20% battery.",
        triggerType: "schedule" as TriggerType,
        cronExpr: "*/5 * * * *",
        eventType: null,
        status: "active" as AutomateStatus,
        inputParams: { threshold: 20, objectType: "Drone" },
    },
    {
        name: "Mission Status Sync",
        description: "Fires when a Mission entity is updated — syncs downstream alerts.",
        triggerType: "event" as TriggerType,
        eventType: "entity.updated",
        eventFilter: { objectType: "Mission" },
        cronExpr: null,
        status: "active" as AutomateStatus,
        inputParams: {},
    },
    {
        name: "Nightly Data Quality Report",
        description: "Runs at midnight to detect stale or missing entity records.",
        triggerType: "schedule" as TriggerType,
        cronExpr: "0 0 * * *",
        eventType: null,
        status: "inactive" as AutomateStatus,
        inputParams: { maxAgeHours: 24 },
    },
    {
        name: "Action Audit Webhook",
        description: "Receives inbound webhook from external systems when an action is triggered.",
        triggerType: "webhook" as TriggerType,
        webhookPath: "action-audit",
        cronExpr: null,
        eventType: null,
        status: "active" as AutomateStatus,
        inputParams: {},
    },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const btn = (primary = false, danger = false): React.CSSProperties => ({
    height: 28, padding: "0 11px", borderRadius: 3, fontSize: 12, fontWeight: 600, cursor: "pointer",
    border: danger ? "1px solid #C23030" : primary ? "none" : "1px solid #CED9E0",
    background: danger ? "rgba(194,48,48,0.08)" : primary ? "#137CBD" : "#fff",
    color: danger ? "#C23030" : primary ? "#fff" : "#394B59",
    display: "flex", alignItems: "center", gap: 5,
});

const statusBadge = (status: AutomateStatus | string) => {
    const cfg: Record<string, [string, string]> = {
        active: ["#E6F7F0", "#0D8050"],
        inactive: ["#EBF1F5", "#5C7080"],
        paused: ["#FFF3E0", "#D9822B"],
        running: ["#EBF4FC", "#137CBD"],
        success: ["#E6F7F0", "#0D8050"],
        failed: ["rgba(194,48,48,0.08)", "#C23030"],
        timeout: ["rgba(194,48,48,0.08)", "#C23030"],
    };
    const [bg, fg] = cfg[status] ?? ["#EBF1F5", "#5C7080"];
    return (
        <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, fontWeight: 700, background: bg, color: fg, textTransform: "uppercase" as const }}>
            {status}
        </span>
    );
};

const triggerIcon = (type: TriggerType) => {
    if (type === "schedule") return <Clock style={{ width: 13, height: 13, color: "#7157D9" }} />;
    if (type === "event") return <Bell style={{ width: 13, height: 13, color: "#D9822B" }} />;
    if (type === "webhook") return <Globe style={{ width: 13, height: 13, color: "#0D8050" }} />;
    return <Hand style={{ width: 13, height: 13, color: "#137CBD" }} />;
};

const triggerLabel = (a: AIPAutomate) => {
    if (a.triggerType === "schedule") return a.cronExpr || "No schedule";
    if (a.triggerType === "event") return a.eventType || "No event";
    if (a.triggerType === "webhook") return `/api/automate/webhook/${a.webhookPath || "?"}`;
    return "Manual trigger";
};

const fmt = (ms: number | null) => ms === null ? "—" : ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
const fmtDate = (s: string | null) => s ? new Date(s).toLocaleString() : "—";

// ── Run Row Component ─────────────────────────────────────────────────────────
function RunRow({ run }: { run: AutomateRun }) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <tr onClick={() => setOpen(o => !o)} style={{ cursor: "pointer", borderBottom: "1px solid #EBF1F5", background: open ? "#F5F8FA" : "transparent" }}>
                <td style={{ padding: "5px 10px" }}>{statusBadge(run.status)}</td>
                <td style={{ padding: "5px 10px", fontSize: 11, color: "#5C7080" }}>{run.trigger}</td>
                <td style={{ padding: "5px 10px", fontSize: 11, color: "#182026" }}>{fmtDate(run.startedAt)}</td>
                <td style={{ padding: "5px 10px", fontSize: 11, color: "#182026" }}>{fmt(run.duration)}</td>
                <td style={{ padding: "5px 10px" }}>
                    {open ? <ChevronDown style={{ width: 12, height: 12, color: "#8A9BA8" }} /> : <ChevronRight style={{ width: 12, height: 12, color: "#8A9BA8" }} />}
                </td>
            </tr>
            {open && (
                <tr style={{ borderBottom: "1px solid #EBF1F5" }}>
                    <td colSpan={5} style={{ padding: "8px 12px" }}>
                        {run.errorMessage && (
                            <div style={{ padding: "6px 10px", background: "rgba(194,48,48,0.06)", borderRadius: 3, border: "1px solid #FFBCBC", fontSize: 11, color: "#C23030", marginBottom: 6 }}>
                                ⚠ {run.errorMessage}
                            </div>
                        )}
                        <div style={{ display: "flex", gap: 12 }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 9, fontWeight: 700, color: "#8A9BA8", marginBottom: 2, textTransform: "uppercase" }}>Input</div>
                                <pre style={{ margin: 0, fontSize: 10, background: "#F5F8FA", padding: "6px 8px", borderRadius: 3, overflow: "auto", maxHeight: 80 }}>
                                    {JSON.stringify(run.inputData, null, 2)}
                                </pre>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 9, fontWeight: 700, color: "#8A9BA8", marginBottom: 2, textTransform: "uppercase" }}>Output</div>
                                <pre style={{ margin: 0, fontSize: 10, background: "#F5F8FA", padding: "6px 8px", borderRadius: 3, overflow: "auto", maxHeight: 80 }}>
                                    {JSON.stringify(run.outputData, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AutomatePage() {
    const [automations, setAutomations] = useState<AIPAutomate[]>([]);
    const [sel, setSel] = useState<AIPAutomate | null>(null);
    const [runs, setRuns] = useState<AutomateRun[]>([]);
    const [tab, setTab] = useState<"config" | "runs" | "code">("config");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [running, setRunning] = useState(false);
    const [summary, setSummary] = useState<any>(null);

    // ── Fetch ──────────────────────────────────────────────────────────────────
    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            const [listRes, sumRes] = await Promise.all([
                fetch(`${API}/api/automate`),
                fetch(`${API}/api/automate/summary`),
            ]);
            if (listRes.ok) {
                const data: AIPAutomate[] = await listRes.json();
                if (data.length === 0) {
                    // Seed into DB on first load
                    for (const s of SEED_AUTOMATIONS) {
                        await fetch(`${API}/api/automate`, {
                            method: "POST", headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(s),
                        });
                    }
                    const refetch = await fetch(`${API}/api/automate`);
                    const seeded = await refetch.json();
                    setAutomations(seeded);
                    if (seeded.length > 0) setSel(seeded[0]);
                } else {
                    setAutomations(data);
                    if (!sel) setSel(data[0]);
                }
            }
            if (sumRes.ok) setSummary(await sumRes.json());
        } catch { /* ignore */ }
        finally { setLoading(false); }
    }, []);

    const fetchRuns = useCallback(async (id: string) => {
        try {
            const r = await fetch(`${API}/api/automate/${id}/runs`);
            if (r.ok) setRuns(await r.json());
        } catch { }
    }, []);

    useEffect(() => { fetchAll(); }, []);
    useEffect(() => { if (sel) { fetchRuns(sel.id); setTab("config"); } }, [sel?.id]);

    // ── Handlers ───────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!sel) return;
        setSaving(true);
        try {
            const res = await fetch(`${API}/api/automate/${sel.id}`, {
                method: "PUT", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: sel.name, description: sel.description, status: sel.status,
                    triggerType: sel.triggerType, cronExpr: sel.cronExpr, eventType: sel.eventType,
                    eventFilter: sel.eventFilter, webhookPath: sel.webhookPath,
                }),
            });
            if (res.ok) {
                const updated = await res.json();
                setAutomations(p => p.map(a => a.id === updated.id ? updated : a));
                setSel(updated);
            }
        } finally { setSaving(false); }
    };

    const handleToggleStatus = async () => {
        if (!sel) return;
        const newStatus = sel.status === "active" ? "inactive" : "active";
        const res = await fetch(`${API}/api/automate/${sel.id}`, {
            method: "PUT", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
        });
        if (res.ok) {
            const updated = await res.json();
            setAutomations(p => p.map(a => a.id === updated.id ? updated : a));
            setSel(updated);
        }
    };

    const handleRun = async () => {
        if (!sel) return;
        setRunning(true);
        try {
            await fetch(`${API}/api/automate/${sel.id}/run`, { method: "POST" });
            await new Promise(r => setTimeout(r, 600));
            await fetchRuns(sel.id);
            // Refresh stats
            const res = await fetch(`${API}/api/automate/${sel.id}`);
            if (res.ok) {
                const updated = await res.json();
                setAutomations(p => p.map(a => a.id === updated.id ? updated : a));
                setSel(updated);
            }
        } finally { setRunning(false); }
    };

    const handleNew = async () => {
        const res = await fetch(`${API}/api/automate`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "New Automation", triggerType: "manual", status: "inactive" }),
        });
        if (res.ok) {
            const created = await res.json();
            setAutomations(p => [created, ...p]);
            setSel(created);
        }
    };

    const handleDelete = async () => {
        if (!sel || !confirm(`Delete "${sel.name}"?`)) return;
        await fetch(`${API}/api/automate/${sel.id}`, { method: "DELETE" });
        const remaining = automations.filter(a => a.id !== sel.id);
        setAutomations(remaining);
        setSel(remaining[0] ?? null);
    };

    const upd = (patch: Partial<AIPAutomate>) => sel && setSel({ ...sel, ...patch });

    // ── UI helpers ─────────────────────────────────────────────────────────────
    const tabStyle = (active: boolean): React.CSSProperties => ({
        padding: "8px 14px", fontSize: 12, fontWeight: active ? 700 : 500,
        color: active ? "#1F4E79" : "#5C7080",
        borderBottom: active ? "2px solid #137CBD" : "2px solid transparent",
        background: "transparent", border: "none", cursor: "pointer",
    });

    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#5C7080", fontSize: 13, fontFamily: "Inter, sans-serif" }}>
            Loading automations...
        </div>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#F5F8FA", fontFamily: "Inter, sans-serif" }}>

            {/* ── Top bar ── */}
            <div style={{ height: 44, display: "flex", alignItems: "center", padding: "0 14px", background: "#fff", borderBottom: "1px solid #CED9E0", gap: 8, flexShrink: 0 }}>
                <Zap style={{ width: 16, height: 16, color: "#7157D9" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#182026" }}>Automate</span>
                <div style={{ width: 1, height: 16, background: "#CED9E0", margin: "0 4px" }} />
                <span style={{ fontSize: 11, color: "#5C7080" }}>Schedule · Event · Webhook triggers</span>
                <div style={{ flex: 1 }} />
                {/* Summary pills */}
                {summary && (
                    <>
                        <div style={{ fontSize: 11, color: "#0D8050", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                            <Activity style={{ width: 11, height: 11 }} /> {summary.active} active
                        </div>
                        <div style={{ fontSize: 11, color: "#5C7080", display: "flex", alignItems: "center", gap: 4 }}>
                            <BarChart2 style={{ width: 11, height: 11 }} /> {summary.total} total
                        </div>
                    </>
                )}
                <button onClick={fetchAll} style={btn()}><RefreshCw style={{ width: 12, height: 12 }} /> Refresh</button>
                <button onClick={handleNew} style={btn(true)}><Plus style={{ width: 13, height: 13 }} /> New Automation</button>
            </div>

            <div style={{ flex: 1, display: "flex", minHeight: 0 }}>

                {/* ── Left list ── */}
                <div style={{ width: 270, background: "#fff", borderRight: "1px solid #CED9E0", display: "flex", flexDirection: "column", flexShrink: 0 }}>
                    <div style={{ padding: "8px 12px", fontSize: 10, fontWeight: 700, color: "#5C7080", letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: "1px solid #EBF1F5" }}>
                        Automations ({automations.length})
                    </div>
                    <div style={{ flex: 1, overflowY: "auto" }}>
                        {automations.map(a => (
                            <div key={a.id} onClick={() => setSel(a)} style={{
                                padding: "9px 12px", cursor: "pointer", borderBottom: "1px solid #EBF1F5",
                                background: sel?.id === a.id ? "rgba(113,87,217,0.05)" : "transparent",
                                borderLeft: sel?.id === a.id ? "2px solid #7157D9" : "2px solid transparent",
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                                    <span style={{ fontSize: 12, fontWeight: 500, color: "#182026", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>{a.name}</span>
                                    {statusBadge(a.status)}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#8A9BA8" }}>
                                    {triggerIcon(a.triggerType)}
                                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 190 }}>{triggerLabel(a)}</span>
                                </div>
                                <div style={{ display: "flex", gap: 8, marginTop: 4, fontSize: 10, color: "#8A9BA8", alignItems: "center" }}>
                                    <span style={{ color: "#0D8050" }}>✓ {a.successRuns}</span>
                                    {a.failedRuns > 0 && <span style={{ color: "#C23030" }}>✗ {a.failedRuns}</span>}
                                    {a.lastRunAt && <span>Last: {new Date(a.lastRunAt).toLocaleTimeString()}</span>}
                                    {a.totalRuns > 0 && <span style={{ marginLeft: "auto", padding: "1px 6px", background: "#EBF1F5", borderRadius: 3, fontWeight: 700 }}>{a.totalRuns} runs</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Right detail ── */}
                {!sel ? (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#8A9BA8", fontSize: 13 }}>
                        Select an automation
                    </div>
                ) : (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

                        {/* Detail top bar */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderBottom: "1px solid #CED9E0", background: "#fff", flexShrink: 0 }}>
                            {triggerIcon(sel.triggerType)}
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#182026" }}>{sel.name}</span>
                            {statusBadge(sel.status)}
                            <div style={{ flex: 1 }} />
                            <button onClick={handleRun} disabled={running} style={{ ...btn(true), opacity: running ? 0.5 : 1 }}>
                                <Play style={{ width: 12, height: 12 }} /> {running ? "Running..." : "▶ Run Now"}
                            </button>
                            <button onClick={handleToggleStatus} style={{ ...btn(), borderColor: sel.status === "active" ? "#0D8050" : "#137CBD", color: sel.status === "active" ? "#0D8050" : "#137CBD" }}>
                                {sel.status === "active" ? <><Square style={{ width: 11, height: 11 }} /> Deactivate</> : <><Play style={{ width: 11, height: 11 }} /> Activate</>}
                            </button>
                            <button onClick={handleDelete} style={btn(false, true)}><Trash2 style={{ width: 11, height: 11 }} /> Delete</button>
                        </div>

                        {/* Tabs */}
                        <div style={{ display: "flex", background: "#fff", borderBottom: "1px solid #CED9E0", flexShrink: 0, padding: "0 4px" }}>
                            {(["config", "runs", "code"] as const).map(t => (
                                <button key={t} onClick={() => { setTab(t); if (t === "runs") fetchRuns(sel.id); }} style={tabStyle(tab === t)}>
                                    {t === "config" ? "Configuration" : t === "runs" ? `Run History (${runs.length})` : "Function Code"}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, overflow: "auto", padding: 20 }}>

                            {tab === "config" && (
                                <div style={{ display: "flex", gap: 20, maxWidth: 860, flexWrap: "wrap" }}>

                                    {/* Left: Trigger config */}
                                    <div style={{ flex: "1 1 340px", display: "flex", flexDirection: "column", gap: 14 }}>
                                        <div style={{ background: "#fff", border: "1px solid #CED9E0", borderRadius: 4, padding: 16 }}>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: "#182026", marginBottom: 12 }}>Trigger</div>

                                            <div style={{ marginBottom: 10 }}>
                                                <div style={{ fontSize: 10, fontWeight: 700, color: "#5C7080", textTransform: "uppercase", marginBottom: 4 }}>Trigger Type</div>
                                                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                                    {(["schedule", "event", "webhook", "manual"] as TriggerType[]).map(t => (
                                                        <button key={t} onClick={() => upd({ triggerType: t })} style={{
                                                            height: 28, padding: "0 10px", borderRadius: 3, fontSize: 11, fontWeight: 600, cursor: "pointer",
                                                            border: `1px solid ${sel.triggerType === t ? "#7157D9" : "#CED9E0"}`,
                                                            background: sel.triggerType === t ? "rgba(113,87,217,0.08)" : "#fff",
                                                            color: sel.triggerType === t ? "#7157D9" : "#5C7080",
                                                            display: "flex", alignItems: "center", gap: 5,
                                                        }}>
                                                            {triggerIcon(t)} {t}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {sel.triggerType === "schedule" && (
                                                <div>
                                                    <div style={{ fontSize: 10, fontWeight: 700, color: "#5C7080", textTransform: "uppercase", marginBottom: 4 }}>Cron Expression</div>
                                                    <input value={sel.cronExpr || ""} onChange={e => upd({ cronExpr: e.target.value })}
                                                        placeholder="*/5 * * * *  (every 5 min)"
                                                        style={{ width: "100%", padding: "6px 10px", border: "1px solid #CED9E0", borderRadius: 3, fontSize: 12, fontFamily: "monospace", background: "#F5F8FA" }} />
                                                    <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                                                        {[["Every 5 min", "*/5 * * * *"], ["Every hour", "0 * * * *"], ["Daily midnight", "0 0 * * *"], ["Every 30 min", "*/30 * * * *"]].map(([label, cron]) => (
                                                            <span key={label} onClick={() => upd({ cronExpr: cron })} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 3, background: "#EDE9FE", color: "#7157D9", cursor: "pointer", fontWeight: 600 }}>
                                                                {label}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {sel.triggerType === "event" && (
                                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                                    <div>
                                                        <div style={{ fontSize: 10, fontWeight: 700, color: "#5C7080", textTransform: "uppercase", marginBottom: 4 }}>Event Type</div>
                                                        <select value={sel.eventType || ""} onChange={e => upd({ eventType: e.target.value })}
                                                            style={{ width: "100%", padding: "6px 10px", border: "1px solid #CED9E0", borderRadius: 3, fontSize: 12, background: "#fff" }}>
                                                            <option value="">— Select event —</option>
                                                            <option value="entity.created">entity.created</option>
                                                            <option value="entity.updated">entity.updated</option>
                                                            <option value="entity.deleted">entity.deleted</option>
                                                            <option value="action.executed">action.executed</option>
                                                            <option value="metric.threshold_breached">metric.threshold_breached</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: 10, fontWeight: 700, color: "#5C7080", textTransform: "uppercase", marginBottom: 4 }}>Object Type Filter (optional)</div>
                                                        <input value={(sel.eventFilter as any)?.objectType || ""} onChange={e => upd({ eventFilter: { ...sel.eventFilter, objectType: e.target.value } })}
                                                            placeholder="e.g. Drone, Mission"
                                                            style={{ width: "100%", padding: "6px 10px", border: "1px solid #CED9E0", borderRadius: 3, fontSize: 12, background: "#fff" }} />
                                                    </div>
                                                </div>
                                            )}

                                            {sel.triggerType === "webhook" && (
                                                <div>
                                                    <div style={{ fontSize: 10, fontWeight: 700, color: "#5C7080", textTransform: "uppercase", marginBottom: 4 }}>Webhook Path</div>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 0, border: "1px solid #CED9E0", borderRadius: 3, overflow: "hidden" }}>
                                                        <span style={{ padding: "6px 8px", background: "#F5F8FA", fontSize: 11, color: "#8A9BA8", borderRight: "1px solid #CED9E0", whiteSpace: "nowrap" }}>
                                                            POST /api/automate/webhook/
                                                        </span>
                                                        <input value={sel.webhookPath || ""} onChange={e => upd({ webhookPath: e.target.value })}
                                                            placeholder="your-path"
                                                            style={{ flex: 1, padding: "6px 10px", border: "none", fontSize: 12, fontFamily: "monospace", background: "#fff", outline: "none" }} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Basic info */}
                                        <div style={{ background: "#fff", border: "1px solid #CED9E0", borderRadius: 4, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: "#182026", marginBottom: 4 }}>Details</div>
                                            <div>
                                                <div style={{ fontSize: 10, fontWeight: 700, color: "#5C7080", textTransform: "uppercase", marginBottom: 4 }}>Name</div>
                                                <input value={sel.name} onChange={e => upd({ name: e.target.value })}
                                                    style={{ width: "100%", padding: "6px 10px", border: "1px solid #CED9E0", borderRadius: 3, fontSize: 13, background: "#fff" }} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 10, fontWeight: 700, color: "#5C7080", textTransform: "uppercase", marginBottom: 4 }}>Description</div>
                                                <textarea value={sel.description} onChange={e => upd({ description: e.target.value })} rows={2}
                                                    style={{ width: "100%", padding: "6px 10px", border: "1px solid #CED9E0", borderRadius: 3, fontSize: 12, background: "#fff", resize: "vertical" }} />
                                            </div>
                                            <div style={{ display: "flex", gap: 8 }}>
                                                <button onClick={handleSave} disabled={saving} style={{ ...btn(true), opacity: saving ? 0.6 : 1 }}>{saving ? "Saving..." : "Save"}</button>
                                                <button style={btn()}>Discard</button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Stats */}
                                    <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: 12 }}>
                                        {/* Run stats */}
                                        <div style={{ background: "#fff", border: "1px solid #CED9E0", borderRadius: 4, padding: 16 }}>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: "#182026", marginBottom: 12 }}>Run Statistics</div>
                                            <div style={{ display: "flex", gap: 12 }}>
                                                <div style={{ flex: 1, textAlign: "center", padding: "10px 0", background: "#F5F8FA", borderRadius: 4 }}>
                                                    <div style={{ fontSize: 22, fontWeight: 700, color: "#182026" }}>{sel.totalRuns}</div>
                                                    <div style={{ fontSize: 10, color: "#8A9BA8", marginTop: 2 }}>Total</div>
                                                </div>
                                                <div style={{ flex: 1, textAlign: "center", padding: "10px 0", background: "#E6F7F0", borderRadius: 4 }}>
                                                    <div style={{ fontSize: 22, fontWeight: 700, color: "#0D8050" }}>{sel.successRuns}</div>
                                                    <div style={{ fontSize: 10, color: "#0D8050", marginTop: 2 }}>Success</div>
                                                </div>
                                                <div style={{ flex: 1, textAlign: "center", padding: "10px 0", background: sel.failedRuns > 0 ? "rgba(194,48,48,0.06)" : "#F5F8FA", borderRadius: 4 }}>
                                                    <div style={{ fontSize: 22, fontWeight: 700, color: sel.failedRuns > 0 ? "#C23030" : "#8A9BA8" }}>{sel.failedRuns}</div>
                                                    <div style={{ fontSize: 10, color: sel.failedRuns > 0 ? "#C23030" : "#8A9BA8", marginTop: 2 }}>Failed</div>
                                                </div>
                                            </div>
                                            {sel.successRuns + sel.failedRuns > 0 && (
                                                <div style={{ marginTop: 10 }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#8A9BA8", marginBottom: 3 }}>
                                                        <span>Success rate</span>
                                                        <span style={{ fontWeight: 700, color: "#0D8050" }}>{Math.round(sel.successRuns / sel.totalRuns * 100)}%</span>
                                                    </div>
                                                    <div style={{ height: 4, background: "#EBF1F5", borderRadius: 2 }}>
                                                        <div style={{ height: 4, background: "#0D8050", borderRadius: 2, width: `${sel.successRuns / sel.totalRuns * 100}%` }} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Last run info */}
                                        <div style={{ background: "#fff", border: "1px solid #CED9E0", borderRadius: 4, padding: 16 }}>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: "#182026", marginBottom: 10 }}>Timing</div>
                                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                    <span style={{ fontSize: 11, color: "#5C7080" }}>Last run</span>
                                                    <span style={{ fontSize: 11, fontWeight: 600, color: "#182026" }}>{fmtDate(sel.lastRunAt)}</span>
                                                </div>
                                                {sel.triggerType === "schedule" && sel.cronExpr && (
                                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                        <span style={{ fontSize: 11, color: "#5C7080" }}>Schedule</span>
                                                        <code style={{ fontSize: 11, fontWeight: 600, color: "#7157D9", background: "#EDE9FE", padding: "1px 6px", borderRadius: 3 }}>{sel.cronExpr}</code>
                                                    </div>
                                                )}
                                                {sel.triggerType === "webhook" && sel.webhookPath && (
                                                    <div style={{ padding: "6px 8px", background: "#E6F7F0", borderRadius: 3, fontSize: 10, color: "#0D8050", fontFamily: "monospace", wordBreak: "break-all" }}>
                                                        POST http://localhost:3001/api/automate/webhook/{sel.webhookPath}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Recent runs mini-list */}
                                        {runs.length > 0 && (
                                            <div style={{ background: "#fff", border: "1px solid #CED9E0", borderRadius: 4, padding: 12 }}>
                                                <div style={{ fontSize: 11, fontWeight: 700, color: "#182026", marginBottom: 8 }}>Recent Runs</div>
                                                {runs.slice(0, 5).map(r => (
                                                    <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: "1px solid #EBF1F5" }}>
                                                        {statusBadge(r.status)}
                                                        <span style={{ fontSize: 10, color: "#8A9BA8" }}>{new Date(r.startedAt).toLocaleTimeString()}</span>
                                                        <span style={{ fontSize: 10, color: "#182026" }}>{fmt(r.duration)}</span>
                                                    </div>
                                                ))}
                                                <button onClick={() => setTab("runs")} style={{ ...btn(), marginTop: 8, width: "100%", justifyContent: "center" }}>
                                                    View All Runs →
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {tab === "runs" && (
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: "#182026" }}>Execution History</span>
                                        <button onClick={() => fetchRuns(sel.id)} style={btn()}><RefreshCw style={{ width: 12, height: 12 }} /> Refresh</button>
                                    </div>
                                    {runs.length === 0 ? (
                                        <div style={{ padding: 32, textAlign: "center", color: "#8A9BA8", fontSize: 12, background: "#fff", borderRadius: 4, border: "1px solid #CED9E0" }}>
                                            No runs yet. Click <strong>Run Now</strong> to trigger the first execution.
                                        </div>
                                    ) : (
                                        <div style={{ background: "#fff", border: "1px solid #CED9E0", borderRadius: 4, overflow: "hidden" }}>
                                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                                <thead>
                                                    <tr style={{ background: "#F5F8FA", fontSize: 10, fontWeight: 700, color: "#5C7080", textTransform: "uppercase" }}>
                                                        <th style={{ padding: "6px 10px", textAlign: "left" }}>Status</th>
                                                        <th style={{ padding: "6px 10px", textAlign: "left" }}>Trigger</th>
                                                        <th style={{ padding: "6px 10px", textAlign: "left" }}>Started</th>
                                                        <th style={{ padding: "6px 10px", textAlign: "left" }}>Duration</th>
                                                        <th style={{ padding: "6px 10px", width: 20 }}></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {runs.map(r => <RunRow key={r.id} run={r} />)}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {tab === "code" && (
                                <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 760 }}>
                                    <div style={{ padding: "10px 14px", background: "#EDE9FE", borderRadius: 4, border: "1px solid #C4B5FD", fontSize: 12, color: "#4C1D95" }}>
                                        <strong>Function Binding</strong> — Bind an AIPFunction to this automation. The function code will execute on every trigger.
                                        Function ID: <code style={{ background: "#fff3", padding: "1px 6px", borderRadius: 3 }}>{sel.functionId || "(none)"}</code>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 10, fontWeight: 700, color: "#5C7080", textTransform: "uppercase", marginBottom: 4 }}>Function ID</div>
                                        <input value={sel.functionId || ""} onChange={e => upd({ functionId: e.target.value || null })}
                                            placeholder="Paste an AIPFunction UUID from /build/logic"
                                            style={{ width: "100%", padding: "6px 10px", border: "1px solid #CED9E0", borderRadius: 3, fontSize: 12, background: "#fff" }} />
                                    </div>
                                    <div style={{ background: "#1E1E2E", borderRadius: 4, padding: 16 }}>
                                        <div style={{ fontSize: 10, fontWeight: 700, color: "#7C6FAE", marginBottom: 8 }}>EXAMPLE FUNCTION CODE</div>
                                        <pre style={{ margin: 0, fontSize: 11, color: "#CDD6F4", lineHeight: 1.6 }}>{`// The function receives (input, context)
// input = { threshold: 20, objectType: "Drone" }
// context = { projectId, automationId, triggerType, timestamp }

async function main(input, context) {
  const drones = await fetch(
    "http://localhost:3001/api/ontology/entities?type=Drone"
  ).then(r => r.json());

  const lowBattery = drones.filter(d => d.batteryLevel < input.threshold);

  return {
    scanned: drones.length,
    flagged: lowBattery.length,
    ids: lowBattery.map(d => d.id),
  };
}
return main(input, context);`}</pre>
                                    </div>
                                    <button onClick={handleSave} disabled={saving} style={{ ...btn(true), opacity: saving ? 0.6 : 1 }}>
                                        {saving ? "Saving..." : "Save Binding"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
