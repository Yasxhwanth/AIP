"use client";
import { useState } from "react";
import {
    LayoutGrid, Plus, Eye, EyeOff, ChevronDown, ChevronRight,
    Table2, BarChart2, MousePointerClick, FormInput, Brain,
    SlidersHorizontal, Type, Image, LayoutTemplate, Layers,
    Check, X, Settings, Grip, Trash2, Copy, Monitor, Smartphone,
    Code2, RefreshCw, Link2, Database, Users, Lock, Unlock, ZoomIn
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
type WidgetType =
    | "object-table" | "time-series-chart" | "bar-chart"
    | "button" | "text-input" | "dropdown" | "date-picker"
    | "aip-agent" | "loop-layout" | "tabs"
    | "text-heading" | "image" | "kpi-card";

type BindingType = "object-set" | "object-property" | "action" | "variable" | "none";
type RoleKey = "admin" | "commander" | "operator" | "analyst" | "viewer";
type PreviewDevice = "desktop" | "mobile";

interface EntityBinding {
    type: BindingType;
    objectType?: string;
    property?: string;
    actionName?: string;
    variableName?: string;
}

interface RoleVisibility {
    admin: boolean;
    commander: boolean;
    operator: boolean;
    analyst: boolean;
    viewer: boolean;
}

interface Widget {
    id: string;
    type: WidgetType;
    label: string;
    binding: EntityBinding;
    colSpan: 1 | 2 | 3;
    rowSpan: 1 | 2;
    configOpen?: boolean;
}

interface Section {
    id: string;
    name: string;
    columns: 1 | 2 | 3;
    widgets: Widget[];
    roleVisibility: RoleVisibility;
    collapsed: boolean;
}

interface AppPage {
    id: string;
    name: string;
    icon: string;
    sections: Section[];
}

interface WorkshopApp {
    id: string;
    name: string;
    description: string;
    status: "published" | "draft" | "staging";
    pages: AppPage[];
}

// ── Constants ──────────────────────────────────────────────────────────────────
const OBJECT_TYPES = ["Drone", "Mission", "Pilot", "Equipment", "Alert", "WorkOrder"];
const OBJECT_PROPS: Record<string, string[]> = {
    Drone: ["id", "batteryLevel", "status", "altitude", "speed"],
    Mission: ["id", "name", "status", "priority", "progressPct"],
    Pilot: ["id", "name", "availability", "responseTime"],
    Equipment: ["id", "type", "errorRate", "downtimeHrs", "temperature"],
    Alert: ["id", "severity", "status", "message"],
    WorkOrder: ["id", "status", "priority", "description"],
};
const ACTION_TYPES = ["EscalateMission", "CreateWorkOrder", "AssignPilot", "DecommissionDrone", "RunRiskAssessmentAI"];
const ROLES: { key: RoleKey; label: string; color: string }[] = [
    { key: "admin", label: "Admin", color: "#C23030" },
    { key: "commander", label: "Mission Commander", color: "#7157D9" },
    { key: "operator", label: "Operator", color: "#137CBD" },
    { key: "analyst", label: "Analyst", color: "#0D8050" },
    { key: "viewer", label: "Viewer", color: "#5C7080" },
];

const WIDGET_META: Record<WidgetType, { label: string; icon: React.ElementType; color: string; category: string }> = {
    "object-table": { label: "Object Table", icon: Table2, color: "#137CBD", category: "Data" },
    "time-series-chart": { label: "Time Series", icon: BarChart2, color: "#7157D9", category: "Charts" },
    "bar-chart": { label: "Bar Chart", icon: BarChart2, color: "#D9822B", category: "Charts" },
    "kpi-card": { label: "KPI Card", icon: SlidersHorizontal, color: "#0D8050", category: "Data" },
    "button": { label: "Action Button", icon: MousePointerClick, color: "#C23030", category: "Actions" },
    "text-input": { label: "Text Input", icon: FormInput, color: "#5C7080", category: "Forms" },
    "dropdown": { label: "Dropdown", icon: ChevronDown, color: "#5C7080", category: "Forms" },
    "date-picker": { label: "Date Picker", icon: SlidersHorizontal, color: "#5C7080", category: "Forms" },
    "aip-agent": { label: "AIP Agent", icon: Brain, color: "#7157D9", category: "AI" },
    "loop-layout": { label: "Loop / Grid", icon: LayoutTemplate, color: "#137CBD", category: "Layout" },
    "tabs": { label: "Tabs", icon: Layers, color: "#D9822B", category: "Layout" },
    "text-heading": { label: "Text / Heading", icon: Type, color: "#5C7080", category: "Content" },
    "image": { label: "Image", icon: Image, color: "#5C7080", category: "Content" },
};

const PALETTE_CATEGORIES = ["Data", "Charts", "Actions", "Forms", "AI", "Layout", "Content"];

// ── Seed data ──────────────────────────────────────────────────────────────────
function allRoles(val = true): RoleVisibility {
    return { admin: val, commander: val, operator: val, analyst: val, viewer: val };
}

const SEED_APPS: WorkshopApp[] = [
    {
        id: "app1", name: "Mission Operations Center", status: "published",
        description: "Primary ops dashboard for mission commanders and operators.",
        pages: [
            {
                id: "pg1", name: "Overview", icon: "📊",
                sections: [
                    {
                        id: "s1", name: "KPI Header", columns: 3, collapsed: false,
                        roleVisibility: allRoles(true),
                        widgets: [
                            { id: "w1", type: "kpi-card", label: "Active Missions", colSpan: 1, rowSpan: 1, binding: { type: "object-set", objectType: "Mission" } },
                            { id: "w2", type: "kpi-card", label: "Fleet Health", colSpan: 1, rowSpan: 1, binding: { type: "object-property", objectType: "Drone", property: "batteryLevel" } },
                            { id: "w3", type: "kpi-card", label: "Open Alerts", colSpan: 1, rowSpan: 1, binding: { type: "object-set", objectType: "Alert" } },
                        ],
                    },
                    {
                        id: "s2", name: "Mission Table", columns: 2, collapsed: false,
                        roleVisibility: allRoles(true),
                        widgets: [
                            { id: "w4", type: "object-table", label: "Active Missions", colSpan: 2, rowSpan: 2, binding: { type: "object-set", objectType: "Mission" } },
                        ],
                    },
                    {
                        id: "s3", name: "Drone Fleet Status", columns: 2, collapsed: false,
                        roleVisibility: { admin: true, commander: true, operator: true, analyst: false, viewer: false },
                        widgets: [
                            { id: "w5", type: "time-series-chart", label: "Battery Over Time", colSpan: 1, rowSpan: 2, binding: { type: "object-set", objectType: "Drone" } },
                            { id: "w6", type: "loop-layout", label: "Drone Cards", colSpan: 1, rowSpan: 2, binding: { type: "object-set", objectType: "Drone" } },
                        ],
                    },
                ],
            },
            {
                id: "pg2", name: "Alerts", icon: "🚨",
                sections: [
                    {
                        id: "s4", name: "Alert Stream", columns: 1, collapsed: false,
                        roleVisibility: allRoles(true),
                        widgets: [
                            { id: "w7", type: "object-table", label: "Alert List", colSpan: 1, rowSpan: 2, binding: { type: "object-set", objectType: "Alert" } },
                        ],
                    },
                    {
                        id: "s5", name: "Admin Actions", columns: 2, collapsed: false,
                        roleVisibility: { admin: true, commander: true, operator: false, analyst: false, viewer: false },
                        widgets: [
                            { id: "w8", type: "button", label: "Escalate Mission", colSpan: 1, rowSpan: 1, binding: { type: "action", actionName: "EscalateMission" } },
                            { id: "w9", type: "aip-agent", label: "Risk Assistant", colSpan: 1, rowSpan: 1, binding: { type: "variable", variableName: "missionRiskAgent" } },
                        ],
                    },
                ],
            },
            {
                id: "pg3", name: "AI Insights", icon: "🤖",
                sections: [
                    {
                        id: "s6", name: "AIP Agent Panel", columns: 1, collapsed: false,
                        roleVisibility: { admin: true, commander: true, operator: false, analyst: false, viewer: false },
                        widgets: [
                            { id: "w10", type: "aip-agent", label: "Mission Ops Assistant", colSpan: 1, rowSpan: 2, binding: { type: "variable", variableName: "missionOpsAgent" } },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: "app2", name: "Equipment Maintenance Portal", status: "draft",
        description: "Self-service maintenance portal for operators and technicians.",
        pages: [
            {
                id: "pg4", name: "Equipment", icon: "🔧",
                sections: [
                    {
                        id: "s7", name: "Equipment List", columns: 1, collapsed: false,
                        roleVisibility: allRoles(true),
                        widgets: [
                            { id: "w11", type: "object-table", label: "Equipment Registry", colSpan: 1, rowSpan: 2, binding: { type: "object-set", objectType: "Equipment" } },
                        ],
                    },
                ],
            },
        ],
    },
];

// ── Shared helpers ─────────────────────────────────────────────────────────────
const btn = (primary = false, danger = false, sm = false): React.CSSProperties => ({
    height: sm ? 24 : 28, padding: sm ? "0 8px" : "0 11px",
    borderRadius: 3, fontSize: sm ? 11 : 12, fontWeight: 600, cursor: "pointer",
    border: danger ? "1px solid #C23030" : primary ? "none" : "1px solid #CED9E0",
    background: danger ? "rgba(194,48,48,0.08)" : primary ? "#137CBD" : "#fff",
    color: danger ? "#C23030" : primary ? "#fff" : "#394B59",
    display: "flex", alignItems: "center", gap: 5,
});
const lbl = (t: string) => (
    <div style={{ fontSize: 10, fontWeight: 700, color: "#5C7080", textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: 4 }}>{t}</div>
);

// ── Widget preview renderer ────────────────────────────────────────────────────
function WidgetPreview({ w, preview }: { w: Widget; preview: boolean }) {
    const meta = WIDGET_META[w.type];
    const Icon = meta.icon;

    if (preview) {
        // Render realistic widget previews
        if (w.type === "object-table") return (
            <div style={{ width: "100%", height: "100%", minHeight: 120 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#182026", marginBottom: 6 }}>{w.label}</div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
                    <thead><tr style={{ background: "#F5F8FA" }}>
                        {(OBJECT_PROPS[w.binding.objectType ?? OBJECT_TYPES[0]] ?? ["id", "name", "status"]).slice(0, 4).map(p => (
                            <th key={p} style={{ padding: "4px 8px", textAlign: "left", color: "#5C7080", fontWeight: 700, borderBottom: "1px solid #CED9E0" }}>{p}</th>
                        ))}
                    </tr></thead>
                    <tbody>{[1, 2, 3].map(i => (
                        <tr key={i} style={{ borderBottom: "1px solid #EBF1F5" }}>
                            {(OBJECT_PROPS[w.binding.objectType ?? OBJECT_TYPES[0]] ?? ["id"]).slice(0, 4).map(p => (
                                <td key={p} style={{ padding: "4px 8px", color: "#182026" }}>
                                    {p === "status" ? <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: "#E6F7F0", color: "#0D8050", fontWeight: 700 }}>ACTIVE</span>
                                        : p === "batteryLevel" || p === "progressPct" ? `${Math.floor(Math.random() * 100)}%`
                                            : p === "id" ? `${w.binding.objectType?.substring(0, 3).toUpperCase()}-${1000 + i}`
                                                : `Sample ${i}`}
                                </td>
                            ))}
                        </tr>
                    ))}</tbody>
                </table>
            </div>
        );
        if (w.type === "kpi-card") return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 12, height: "100%", minHeight: 72 }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: "#182026" }}>{Math.floor(Math.random() * 100 + 10)}</div>
                <div style={{ fontSize: 11, color: "#5C7080", fontWeight: 600, marginTop: 2 }}>{w.label}</div>
                <div style={{ fontSize: 10, color: "#0D8050", marginTop: 3 }}>↑ 12% vs last hour</div>
            </div>
        );
        if (w.type === "time-series-chart") {
            const pts = [40, 55, 48, 62, 70, 58, 80, 74, 88, 76];
            const max = Math.max(...pts); const min = Math.min(...pts);
            const norm = (v: number) => 1 - (v - min) / (max - min);
            const w_ = 220; const h_ = 80;
            const pathD = pts.map((v, i) => `${i === 0 ? "M" : "L"}${(i / (pts.length - 1)) * w_},${norm(v) * h_}`).join(" ");
            return (
                <div style={{ width: "100%", height: "100%", minHeight: 100, padding: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#182026", marginBottom: 6 }}>{w.label}</div>
                    <svg width="100%" height={h_} viewBox={`0 0 ${w_} ${h_}`} preserveAspectRatio="none">
                        <defs><linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#7157D9" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#7157D9" stopOpacity="0" />
                        </linearGradient></defs>
                        <path d={`${pathD} L${w_},${h_} L0,${h_} Z`} fill="url(#grad)" />
                        <path d={pathD} fill="none" stroke="#7157D9" strokeWidth="2" />
                    </svg>
                </div>
            );
        }
        if (w.type === "button") return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 48 }}>
                <button style={{
                    padding: "8px 20px", background: "#C23030", color: "#fff", border: "none",
                    borderRadius: 3, fontSize: 12, fontWeight: 700, cursor: "pointer"
                }}>
                    {w.label}
                </button>
            </div>
        );
        if (w.type === "aip-agent") return (
            <div style={{
                width: "100%", height: "100%", minHeight: 100, display: "flex", flexDirection: "column",
                background: "rgba(113,87,217,0.04)", borderRadius: 4, padding: 8
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
                    <Brain style={{ width: 12, height: 12, color: "#7157D9" }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#7157D9" }}>{w.label}</span>
                </div>
                <div style={{
                    fontSize: 10, color: "#5C7080", background: "#fff", borderRadius: 4, padding: 6,
                    border: "1px solid #CED9E0"
                }}>How can I help with this mission?</div>
                <input style={{
                    marginTop: 6, padding: "4px 6px", border: "1px solid #CED9E0", borderRadius: 4,
                    fontSize: 10, width: "100%", boxSizing: "border-box" as const
                }} placeholder="Ask the agent…" />
            </div>
        );
        if (w.type === "bar-chart") {
            const bars = [60, 80, 40, 90, 50, 70];
            return (
                <div style={{ width: "100%", height: "100%", minHeight: 90, padding: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#182026", marginBottom: 6 }}>{w.label}</div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 60 }}>
                        {bars.map((v, i) => (
                            <div key={i} style={{ flex: 1, height: `${v}%`, background: "#D9822B", borderRadius: "2px 2px 0 0", opacity: 0.8 + i * 0.03 }} />
                        ))}
                    </div>
                </div>
            );
        }
        if (w.type === "loop-layout") return (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, padding: 6, minHeight: 100 }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{ background: "#fff", border: "1px solid #CED9E0", borderRadius: 4, padding: 6 }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: "#182026" }}>{w.binding.objectType}-{1000 + i}</div>
                        <div style={{ fontSize: 9, color: "#0D8050" }}>● Active</div>
                    </div>
                ))}
            </div>
        );
        // default
        return (
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: 10, color: "#5C7080" }}>
                <Icon style={{ width: 14, height: 14, color: meta.color }} />
                <span style={{ fontSize: 11 }}>{w.label}</span>
            </div>
        );
    }

    // Builder mode: widget placeholder
    return (
        <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            height: "100%", minHeight: 72, gap: 6, opacity: 0.8
        }}>
            <div style={{
                width: 28, height: 28, borderRadius: 5, background: meta.color + "15",
                display: "flex", alignItems: "center", justifyContent: "center"
            }}>
                <Icon style={{ width: 15, height: 15, color: meta.color }} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 600, color: "#182026" }}>{w.label}</span>
            {w.binding.type !== "none" && (
                <span style={{ fontSize: 9, color: "#5C7080" }}>
                    {w.binding.objectType ?? w.binding.actionName ?? w.binding.variableName}
                </span>
            )}
        </div>
    );
}

// ── Binding Panel ─────────────────────────────────────────────────────────────
function BindingPanel({ widget, onChange }: { widget: Widget; onChange: (b: EntityBinding) => void }) {
    const b = widget.binding;
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {lbl("Binding Type")}
            <select value={b.type} onChange={e => onChange({ ...b, type: e.target.value as BindingType })}
                style={{ width: "100%", padding: "5px 8px", border: "1px solid #CED9E0", borderRadius: 3, fontSize: 11, background: "#fff" }}>
                <option value="none">None</option>
                <option value="object-set">Object Set</option>
                <option value="object-property">Object Property</option>
                <option value="action">Action Type</option>
                <option value="variable">Variable</option>
            </select>

            {(b.type === "object-set" || b.type === "object-property") && (
                <>
                    {lbl("Object Type")}
                    <select value={b.objectType ?? ""} onChange={e => onChange({ ...b, objectType: e.target.value })}
                        style={{ width: "100%", padding: "5px 8px", border: "1px solid #CED9E0", borderRadius: 3, fontSize: 11, background: "#fff" }}>
                        <option value="">— Select —</option>
                        {OBJECT_TYPES.map(o => <option key={o}>{o}</option>)}
                    </select>
                </>
            )}

            {b.type === "object-property" && b.objectType && (
                <>
                    {lbl("Property")}
                    <select value={b.property ?? ""} onChange={e => onChange({ ...b, property: e.target.value })}
                        style={{ width: "100%", padding: "5px 8px", border: "1px solid #CED9E0", borderRadius: 3, fontSize: 11, background: "#fff" }}>
                        <option value="">— Select —</option>
                        {(OBJECT_PROPS[b.objectType] ?? []).map(p => <option key={p}>{p}</option>)}
                    </select>
                </>
            )}

            {b.type === "action" && (
                <>
                    {lbl("Action Type")}
                    <select value={b.actionName ?? ""} onChange={e => onChange({ ...b, actionName: e.target.value })}
                        style={{ width: "100%", padding: "5px 8px", border: "1px solid #CED9E0", borderRadius: 3, fontSize: 11, background: "#fff" }}>
                        <option value="">— Select —</option>
                        {ACTION_TYPES.map(a => <option key={a}>{a}</option>)}
                    </select>
                </>
            )}

            {b.type === "variable" && (
                <>
                    {lbl("Variable Name")}
                    <input value={b.variableName ?? ""} onChange={e => onChange({ ...b, variableName: e.target.value })}
                        placeholder="e.g. missionVariable" style={{
                            width: "100%", padding: "5px 8px",
                            border: "1px solid #CED9E0", borderRadius: 3, fontSize: 11, background: "#fff"
                        }} />
                </>
            )}

            {/* Binding status indicator */}
            <div style={{
                display: "flex", alignItems: "center", gap: 5, padding: "5px 8px",
                background: b.type !== "none" && (b.objectType || b.actionName || b.variableName)
                    ? "#E6F7F0" : "#EBF1F5",
                borderRadius: 3, border: "1px solid",
                borderColor: b.type !== "none" && (b.objectType || b.actionName || b.variableName) ? "#0D8050" : "#CED9E0"
            }}>
                {b.type !== "none" && (b.objectType || b.actionName || b.variableName)
                    ? <><Check style={{ width: 11, height: 11, color: "#0D8050" }} /><span style={{ fontSize: 10, color: "#0D8050", fontWeight: 600 }}>Bound to Ontology</span></>
                    : <><Link2 style={{ width: 11, height: 11, color: "#8A9BA8" }} /><span style={{ fontSize: 10, color: "#8A9BA8" }}>Not bound</span></>
                }
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ApplicationsPage() {
    const [apps, setApps] = useState<WorkshopApp[]>(SEED_APPS);
    const [selApp, setSelApp] = useState<WorkshopApp>(SEED_APPS[0]);
    const [selPage, setSelPage] = useState<AppPage>(SEED_APPS[0].pages[0]);
    const [selWidget, setSelWidget] = useState<Widget | null>(null);
    const [selSection, setSelSection] = useState<Section | null>(null);
    const [preview, setPreview] = useState(false);
    const [device, setDevice] = useState<PreviewDevice>("desktop");
    const [rightTab, setRightTab] = useState<"palette" | "config" | "binding" | "visibility">("palette");
    const [dragType, setDragType] = useState<WidgetType | null>(null);

    // ── Helpers ──────────────────────────────────────────────────────────────────
    const updateApp = (a: WorkshopApp) => { setSelApp(a); setApps(p => p.map(x => x.id === a.id ? a : x)); };
    const updatePage = (pg: AppPage) => {
        const pages = selApp.pages.map(p => p.id === pg.id ? pg : p);
        const newApp = { ...selApp, pages };
        setSelPage(pg); updateApp(newApp);
    };
    const updateSection = (s: Section) => {
        const sections = selPage.sections.map(x => x.id === s.id ? x = s : x);
        updatePage({ ...selPage, sections });
        if (selSection?.id === s.id) setSelSection(s);
    };
    const updateWidget = (sectionId: string, w: Widget) => {
        const sections = selPage.sections.map(s =>
            s.id !== sectionId ? s : { ...s, widgets: s.widgets.map(x => x.id === w.id ? w : x) }
        );
        updatePage({ ...selPage, sections });
        setSelWidget(w);
    };
    const deleteWidget = (sectionId: string, widgetId: string) => {
        const sections = selPage.sections.map(s =>
            s.id !== sectionId ? s : { ...s, widgets: s.widgets.filter(w => w.id !== widgetId) }
        );
        updatePage({ ...selPage, sections });
        setSelWidget(null);
    };
    const addWidgetToSection = (section: Section, type: WidgetType) => {
        const meta = WIDGET_META[type];
        const w: Widget = {
            id: `w${Date.now()}`, type, label: meta.label,
            colSpan: 1, rowSpan: 1, binding: { type: "none" },
        };
        updateSection({ ...section, widgets: [...section.widgets, w] });
        setSelWidget(w); setSelSection(section); setRightTab("binding");
    };
    const addSection = () => {
        const s: Section = {
            id: `s${Date.now()}`, name: "New Section", columns: 2, collapsed: false,
            widgets: [], roleVisibility: allRoles(true),
        };
        updatePage({ ...selPage, sections: [...selPage.sections, s] });
        setSelSection(s);
    };

    const currentPage = selApp.pages.find(p => p.id === selPage.id) ?? selApp.pages[0];
    const statusColors: Record<string, string[]> = {
        published: ["#E6F7F0", "#0D8050"],
        draft: ["#EBF4FC", "#137CBD"],
        staging: ["#FFF3E0", "#D9822B"],
    };
    const [sbg, sfg] = statusColors[selApp.status];

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#F5F8FA", fontFamily: "Inter,sans-serif" }}>

            {/* Top bar */}
            <div style={{
                height: 44, display: "flex", alignItems: "center", padding: "0 14px",
                background: "#fff", borderBottom: "1px solid #CED9E0", gap: 8, flexShrink: 0
            }}>
                <LayoutGrid style={{ width: 16, height: 16, color: "#137CBD" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#182026" }}>Workshop</span>
                <div style={{ width: 1, height: 16, background: "#CED9E0", margin: "0 4px" }} />
                {/* App selector */}
                <select value={selApp.id} onChange={e => {
                    const a = apps.find(x => x.id === e.target.value)!;
                    setSelApp(a); setSelPage(a.pages[0]); setSelWidget(null); setSelSection(null);
                }} style={{
                    border: "1px solid #CED9E0", borderRadius: 3, fontSize: 12, padding: "0 8px",
                    height: 26, background: "#fff", fontWeight: 600, color: "#182026"
                }}>
                    {apps.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, fontWeight: 700, background: sbg, color: sfg }}>
                    {selApp.status}
                </span>
                <div style={{ flex: 1 }} />

                {/* Device toggle */}
                {preview && (
                    <div style={{ display: "flex", border: "1px solid #CED9E0", borderRadius: 3, overflow: "hidden" }}>
                        {(["desktop", "mobile"] as PreviewDevice[]).map(d => (
                            <button key={d} onClick={() => setDevice(d)}
                                style={{
                                    padding: "0 10px", height: 28, cursor: "pointer", fontSize: 11, fontWeight: 600, border: "none",
                                    background: device === d ? "#137CBD" : "#fff",
                                    color: device === d ? "#fff" : "#5C7080"
                                }}>
                                {d === "desktop" ? <Monitor style={{ width: 13, height: 13 }} /> : <Smartphone style={{ width: 13, height: 13 }} />}
                            </button>
                        ))}
                    </div>
                )}

                <button onClick={() => { setPreview(p => !p); setSelWidget(null); }}
                    style={{
                        ...btn(), background: preview ? "#E6F7F0" : "#fff",
                        borderColor: preview ? "#0D8050" : "#CED9E0",
                        color: preview ? "#0D8050" : "#394B59"
                    }}>
                    {preview ? <><EyeOff style={{ width: 13, height: 13 }} /> Edit</> : <><Eye style={{ width: 13, height: 13 }} /> Preview</>}
                </button>
                <button onClick={() => {
                    const a: WorkshopApp = {
                        id: `app${Date.now()}`, name: "New Workshop App", status: "draft",
                        description: "", pages: [{ id: `pg${Date.now()}`, name: "Page 1", icon: "📄", sections: [] }],
                    };
                    setApps(p => [...p, a]); setSelApp(a); setSelPage(a.pages[0]);
                }} style={btn(true)}><Plus style={{ width: 13, height: 13 }} /> New App</button>
            </div>

            <div style={{ flex: 1, display: "flex", minHeight: 0 }}>

                {/* ── Left: Structure Panel ── */}
                <div style={{
                    width: 220, background: "#fff", borderRight: "1px solid #CED9E0",
                    display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden"
                }}>

                    {/* Pages */}
                    <div style={{
                        padding: "8px 10px", fontSize: 10, fontWeight: 700, color: "#5C7080",
                        letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: "1px solid #EBF1F5",
                        display: "flex", alignItems: "center", justifyContent: "space-between"
                    }}>
                        Pages
                        <button onClick={() => {
                            const pg: AppPage = { id: `pg${Date.now()}`, name: "New Page", icon: "📄", sections: [] };
                            const newApp = { ...selApp, pages: [...selApp.pages, pg] };
                            updateApp(newApp); setSelPage(pg);
                        }} style={{ border: "none", background: "transparent", cursor: "pointer", color: "#137CBD", display: "flex" }}>
                            <Plus style={{ width: 13, height: 13 }} />
                        </button>
                    </div>
                    <div style={{ borderBottom: "1px solid #CED9E0" }}>
                        {selApp.pages.map(pg => (
                            <div key={pg.id} onClick={() => { setSelPage(pg); setSelWidget(null); }}
                                style={{
                                    display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", cursor: "pointer",
                                    borderLeft: selPage.id === pg.id ? "2px solid #137CBD" : "2px solid transparent",
                                    background: selPage.id === pg.id ? "rgba(19,124,189,0.05)" : "transparent"
                                }}>
                                <span style={{ fontSize: 13 }}>{pg.icon}</span>
                                <span style={{ fontSize: 12, fontWeight: selPage.id === pg.id ? 700 : 400, color: "#182026" }}>{pg.name}</span>
                            </div>
                        ))}
                    </div>

                    {/* Sections tree */}
                    <div style={{
                        padding: "8px 10px", fontSize: 10, fontWeight: 700, color: "#5C7080",
                        letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: "1px solid #EBF1F5",
                        display: "flex", alignItems: "center", justifyContent: "space-between"
                    }}>
                        Sections
                        <button onClick={addSection}
                            style={{ border: "none", background: "transparent", cursor: "pointer", color: "#137CBD", display: "flex" }}>
                            <Plus style={{ width: 13, height: 13 }} />
                        </button>
                    </div>
                    <div style={{ flex: 1, overflow: "auto" }}>
                        {currentPage.sections.map(s => (
                            <div key={s.id}>
                                <div onClick={() => { setSelSection(s); setSelWidget(null); setRightTab("config"); }}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", cursor: "pointer",
                                        background: selSection?.id === s.id && !selWidget ? "rgba(19,124,189,0.06)" : "transparent",
                                        borderLeft: selSection?.id === s.id && !selWidget ? "2px solid #137CBD" : "2px solid transparent"
                                    }}>
                                    <button onClick={e => { e.stopPropagation(); updateSection({ ...s, collapsed: !s.collapsed }); }}
                                        style={{ border: "none", background: "transparent", cursor: "pointer", padding: 0, display: "flex" }}>
                                        {s.collapsed
                                            ? <ChevronRight style={{ width: 11, height: 11, color: "#8A9BA8" }} />
                                            : <ChevronDown style={{ width: 11, height: 11, color: "#8A9BA8" }} />}
                                    </button>
                                    <Layers style={{ width: 11, height: 11, color: "#137CBD", flexShrink: 0 }} />
                                    <span style={{
                                        fontSize: 11, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                        color: "#182026", fontWeight: 500
                                    }}>{s.name}</span>
                                    {/* Role visibility indicator */}
                                    {!Object.values(s.roleVisibility).every(Boolean) && (
                                        <Lock style={{ width: 10, height: 10, color: "#D9822B" }} />
                                    )}
                                </div>
                                {!s.collapsed && s.widgets.map(w => {
                                    const WIcon = WIDGET_META[w.type].icon;
                                    return (
                                        <div key={w.id} onClick={() => { setSelWidget(w); setSelSection(s); setRightTab("binding"); }}
                                            style={{
                                                display: "flex", alignItems: "center", gap: 5, padding: "4px 10px 4px 26px",
                                                cursor: "pointer", borderLeft: selWidget?.id === w.id ? "2px solid #7157D9" : "2px solid transparent",
                                                background: selWidget?.id === w.id ? "rgba(113,87,217,0.06)" : "transparent"
                                            }}>
                                            <WIcon style={{ width: 10, height: 10, color: WIDGET_META[w.type].color, flexShrink: 0 }} />
                                            <span style={{ fontSize: 10, color: "#182026", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.label}</span>
                                            {w.binding.type !== "none" && (w.binding.objectType || w.binding.actionName || w.binding.variableName) && (
                                                <Database style={{ width: 8, height: 8, color: "#0D8050" }} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Center: Canvas ── */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>

                    {/* Page tab bar */}
                    <div style={{
                        display: "flex", background: "#fff", borderBottom: "1px solid #CED9E0",
                        padding: "0 4px", flexShrink: 0, alignItems: "center"
                    }}>
                        {selApp.pages.map(pg => (
                            <button key={pg.id} onClick={() => { setSelPage(pg); setSelWidget(null); }}
                                style={{
                                    fontSize: 12, padding: "6px 14px", cursor: "pointer", border: "none",
                                    background: "transparent",
                                    borderBottom: selPage.id === pg.id ? "2px solid #137CBD" : "2px solid transparent",
                                    color: selPage.id === pg.id ? "#137CBD" : "#5C7080",
                                    fontWeight: selPage.id === pg.id ? 600 : 400, display: "flex", alignItems: "center", gap: 5
                                }}>
                                <span>{pg.icon}</span> {pg.name}
                            </button>
                        ))}
                        <div style={{ flex: 1 }} />
                        {preview && <span style={{ fontSize: 10, color: "#0D8050", padding: "0 8px", fontWeight: 700 }}>
                            ● Live Preview — {device}
                        </span>}
                    </div>

                    {/* Canvas area */}
                    <div style={{
                        flex: 1, overflow: "auto", padding: 20,
                        background: preview ? "#fff" : "repeating-linear-gradient(0deg,transparent,transparent 19px,#EBF1F5 20px), repeating-linear-gradient(90deg,transparent,transparent 19px,#EBF1F5 20px)"
                    }}>
                        <div style={{ maxWidth: preview && device === "mobile" ? 375 : "100%", margin: "0 auto" }}>

                            {currentPage.sections.map(s => (
                                <div key={s.id} onClick={() => { if (!preview) { setSelSection(s); setSelWidget(null); setRightTab("config"); } }}
                                    style={{
                                        marginBottom: 16,
                                        outline: !preview && selSection?.id === s.id && !selWidget ? "2px solid #137CBD" : "none",
                                        borderRadius: 4, position: "relative"
                                    }}>

                                    {/* Section label (builder mode) */}
                                    {!preview && (
                                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                                            <span style={{
                                                fontSize: 10, fontWeight: 700, color: "#5C7080", textTransform: "uppercase",
                                                letterSpacing: "0.07em"
                                            }}>§ {s.name}</span>
                                            <span style={{ fontSize: 9, color: "#8A9BA8" }}>{s.columns}-col</span>
                                            {!Object.values(s.roleVisibility).every(Boolean) && (
                                                <span style={{
                                                    fontSize: 9, padding: "1px 5px", borderRadius: 3,
                                                    background: "rgba(217,130,43,0.1)", color: "#D9822B", fontWeight: 700
                                                }}>
                                                    RESTRICTED
                                                </span>
                                            )}
                                            <button onClick={e => { e.stopPropagation(); updateSection({ ...s, collapsed: !s.collapsed }); }}
                                                style={{ border: "none", background: "transparent", cursor: "pointer", color: "#8A9BA8", marginLeft: "auto" }}>
                                                {s.collapsed ? <ChevronRight style={{ width: 12, height: 12 }} /> : <ChevronDown style={{ width: 12, height: 12 }} />}
                                            </button>
                                        </div>
                                    )}

                                    {!s.collapsed && (
                                        <div style={{
                                            display: "grid",
                                            gridTemplateColumns: `repeat(${s.columns}, 1fr)`, gap: 10
                                        }}>
                                            {s.widgets.map(w => (
                                                <div key={w.id}
                                                    style={{
                                                        gridColumn: `span ${Math.min(w.colSpan, s.columns)}`,
                                                        background: "#fff",
                                                        border: !preview && selWidget?.id === w.id ? "2px solid #7157D9"
                                                            : !preview ? "1px dashed #CED9E0" : "1px solid #EBF1F5",
                                                        borderRadius: 4, cursor: preview ? "default" : "pointer",
                                                        minHeight: preview ? undefined : 80, overflow: "hidden",
                                                        boxShadow: preview ? "0 1px 4px rgba(0,0,0,0.06)" : "none"
                                                    }}
                                                    onClick={e => { e.stopPropagation(); if (!preview) { setSelWidget(w); setSelSection(s); setRightTab("binding"); } }}>
                                                    <WidgetPreview w={w} preview={preview} />
                                                    {/* Delete button in builder mode */}
                                                    {!preview && selWidget?.id === w.id && (
                                                        <div style={{
                                                            display: "flex", gap: 4, padding: "4px 6px",
                                                            borderTop: "1px solid #EBF1F5", background: "#F5F8FA"
                                                        }}>
                                                            <button onClick={e => { e.stopPropagation(); deleteWidget(s.id, w.id); }}
                                                                style={{ ...btn(false, true, true), flex: 1 }}>
                                                                <Trash2 style={{ width: 10, height: 10 }} /> Remove
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}

                                            {/* Drop zone */}
                                            {!preview && (
                                                <div
                                                    onDragOver={e => e.preventDefault()}
                                                    onDrop={e => { e.preventDefault(); if (dragType) addWidgetToSection(s, dragType); }}
                                                    onClick={() => setRightTab("palette")}
                                                    style={{
                                                        gridColumn: `span 1`, minHeight: 80,
                                                        border: "1.5px dashed #CED9E0", borderRadius: 4,
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                        cursor: "pointer", color: "#8A9BA8", fontSize: 11, gap: 5,
                                                        background: dragType ? "rgba(19,124,189,0.04)" : "transparent",
                                                        transition: "background 0.15s"
                                                    }}>
                                                    <Plus style={{ width: 14, height: 14 }} /> Add widget
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Add section button */}
                            {!preview && (
                                <button onClick={addSection}
                                    style={{
                                        width: "100%", padding: "12px", border: "1.5px dashed #CED9E0",
                                        borderRadius: 4, background: "transparent", cursor: "pointer",
                                        color: "#8A9BA8", fontSize: 12, display: "flex", alignItems: "center",
                                        justifyContent: "center", gap: 6
                                    }}>
                                    <Plus style={{ width: 14, height: 14 }} /> Add section
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Right: Palette / Config ── */}
                {!preview && (
                    <div style={{
                        width: 252, background: "#fff", borderLeft: "1px solid #CED9E0",
                        display: "flex", flexDirection: "column", flexShrink: 0
                    }}>

                        {/* Right panel tabs */}
                        <div style={{ display: "flex", borderBottom: "1px solid #CED9E0" }}>
                            {([
                                { key: "palette", label: "Widgets" },
                                { key: "binding", label: "Bind" },
                                { key: "config", label: "Section" },
                                { key: "visibility", label: "Roles" },
                            ] as { key: typeof rightTab; label: string }[]).map(t => (
                                <button key={t.key} onClick={() => setRightTab(t.key)}
                                    style={{
                                        flex: 1, fontSize: 10, padding: "7px 0", cursor: "pointer", border: "none",
                                        background: "transparent", fontWeight: 700, letterSpacing: "0.04em",
                                        borderBottom: rightTab === t.key ? "2px solid #137CBD" : "2px solid transparent",
                                        color: rightTab === t.key ? "#137CBD" : "#5C7080"
                                    }}>
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        <div style={{ flex: 1, overflow: "auto" }}>

                            {/* ── WIDGET PALETTE ── */}
                            {rightTab === "palette" && (
                                <div style={{ padding: 10 }}>
                                    {PALETTE_CATEGORIES.map(cat => (
                                        <div key={cat} style={{ marginBottom: 14 }}>
                                            <div style={{
                                                fontSize: 9, fontWeight: 700, color: "#5C7080", textTransform: "uppercase",
                                                letterSpacing: "0.08em", marginBottom: 6
                                            }}>{cat}</div>
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                                                {(Object.entries(WIDGET_META) as [WidgetType, (typeof WIDGET_META)[WidgetType]][])
                                                    .filter(([, m]) => m.category === cat)
                                                    .map(([type, m]) => {
                                                        const Icon = m.icon;
                                                        return (
                                                            <div key={type} draggable
                                                                onDragStart={() => setDragType(type)}
                                                                onDragEnd={() => setDragType(null)}
                                                                onClick={() => { if (selSection) addWidgetToSection(selSection, type); else setRightTab("palette"); }}
                                                                style={{
                                                                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                                                                    padding: "8px 4px", border: "1px solid #CED9E0", borderRadius: 4,
                                                                    cursor: "grab", background: dragType === type ? m.color + "08" : "#fff",
                                                                    transition: "all 0.15s"
                                                                }}
                                                                title={`Drag to canvas or click to add to selected section`}>
                                                                <div style={{
                                                                    width: 26, height: 26, borderRadius: 5, background: m.color + "15",
                                                                    display: "flex", alignItems: "center", justifyContent: "center"
                                                                }}>
                                                                    <Icon style={{ width: 14, height: 14, color: m.color }} />
                                                                </div>
                                                                <span style={{ fontSize: 9, fontWeight: 600, color: "#182026", textAlign: "center", lineHeight: 1.2 }}>{m.label}</span>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                    ))}
                                    <div style={{
                                        marginTop: 4, padding: "8px 8px", background: "#F5F8FA",
                                        border: "1px solid #EBF1F5", borderRadius: 4, fontSize: 10, color: "#5C7080"
                                    }}>
                                        <strong>Tip:</strong> Drag onto the canvas or click to add to the selected section.
                                    </div>
                                </div>
                            )}

                            {/* ── BINDING ── */}
                            {rightTab === "binding" && (
                                <div style={{ padding: 12 }}>
                                    {selWidget ? (
                                        <>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: "#182026", marginBottom: 2 }}>{selWidget.label}</div>
                                            <div style={{ fontSize: 10, color: "#5C7080", marginBottom: 12 }}>
                                                {WIDGET_META[selWidget.type].label} · Ontology Data Binding
                                            </div>

                                            <BindingPanel widget={selWidget} onChange={b => {
                                                if (selSection) updateWidget(selSection.id, { ...selWidget, binding: b });
                                            }} />

                                            <div style={{ height: 1, background: "#EBF1F5", margin: "14px 0" }} />

                                            {lbl("Widget Label")}
                                            <input value={selWidget.label}
                                                onChange={e => { if (selSection) updateWidget(selSection.id, { ...selWidget, label: e.target.value }); }}
                                                style={{
                                                    width: "100%", padding: "5px 8px", border: "1px solid #CED9E0",
                                                    borderRadius: 3, fontSize: 11, background: "#fff", boxSizing: "border-box" as const, marginBottom: 10
                                                }} />

                                            {lbl("Column Span")}
                                            <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
                                                {([1, 2, 3] as const).map(c => (
                                                    <button key={c} onClick={() => { if (selSection) updateWidget(selSection.id, { ...selWidget, colSpan: c }); }}
                                                        style={{
                                                            flex: 1, padding: "4px 0", borderRadius: 3, cursor: "pointer", fontSize: 11, fontWeight: 600,
                                                            border: `1px solid ${selWidget.colSpan === c ? "#137CBD" : "#CED9E0"}`,
                                                            background: selWidget.colSpan === c ? "#EBF4FC" : "#fff",
                                                            color: selWidget.colSpan === c ? "#137CBD" : "#5C7080"
                                                        }}>{c}</button>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div style={{ padding: 20, textAlign: "center", color: "#8A9BA8", fontSize: 11 }}>
                                            Click a widget on the canvas to configure its data binding
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── SECTION CONFIG ── */}
                            {rightTab === "config" && (
                                <div style={{ padding: 12 }}>
                                    {selSection ? (
                                        <>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: "#182026", marginBottom: 12 }}>Section Settings</div>

                                            {lbl("Section Name")}
                                            <input value={selSection.name}
                                                onChange={e => updateSection({ ...selSection, name: e.target.value })}
                                                style={{
                                                    width: "100%", padding: "5px 8px", border: "1px solid #CED9E0",
                                                    borderRadius: 3, fontSize: 11, background: "#fff", boxSizing: "border-box" as const, marginBottom: 10
                                                }} />

                                            {lbl("Column Count")}
                                            <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
                                                {([1, 2, 3] as const).map(c => (
                                                    <button key={c} onClick={() => updateSection({ ...selSection, columns: c })}
                                                        style={{
                                                            flex: 1, padding: "6px 0", borderRadius: 3, cursor: "pointer", fontSize: 12, fontWeight: 600,
                                                            border: `1px solid ${selSection.columns === c ? "#137CBD" : "#CED9E0"}`,
                                                            background: selSection.columns === c ? "#EBF4FC" : "#fff",
                                                            color: selSection.columns === c ? "#137CBD" : "#5C7080"
                                                        }}>
                                                        {c}
                                                    </button>
                                                ))}
                                            </div>

                                            <button onClick={() => { setRightTab("visibility"); }}
                                                style={{ ...btn(false, false, true), width: "100%", justifyContent: "center", marginBottom: 8 }}>
                                                <Lock style={{ width: 11, height: 11 }} /> Configure Role Visibility
                                            </button>
                                            <button onClick={() => { const sections = currentPage.sections.filter(x => x.id !== selSection.id); updatePage({ ...selPage, sections }); setSelSection(null); }}
                                                style={{ ...btn(false, true, true), width: "100%", justifyContent: "center" }}>
                                                <Trash2 style={{ width: 11, height: 11 }} /> Delete Section
                                            </button>
                                        </>
                                    ) : (
                                        <div style={{ padding: 20, textAlign: "center", color: "#8A9BA8", fontSize: 11 }}>
                                            Click a section header to configure it
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── ROLE VISIBILITY ── */}
                            {rightTab === "visibility" && (
                                <div style={{ padding: 12 }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: "#182026", marginBottom: 4 }}>Role Visibility Matrix</div>
                                    <div style={{ fontSize: 10, color: "#5C7080", marginBottom: 12, lineHeight: 1.5 }}>
                                        Controls which roles can see each section. Implemented via boolean variables backed by group membership.
                                    </div>

                                    {currentPage.sections.map(s => (
                                        <div key={s.id} style={{
                                            background: "#fff", border: "1px solid #CED9E0",
                                            borderRadius: 4, marginBottom: 10, overflow: "hidden"
                                        }}>
                                            <div style={{
                                                padding: "7px 10px", background: "#F5F8FA", borderBottom: "1px solid #EBF1F5",
                                                fontSize: 11, fontWeight: 700, color: "#182026", display: "flex", alignItems: "center", gap: 6
                                            }}>
                                                <Layers style={{ width: 11, height: 11, color: "#137CBD" }} /> {s.name}
                                                {Object.values(s.roleVisibility).every(Boolean)
                                                    ? <Unlock style={{ width: 10, height: 10, color: "#0D8050", marginLeft: "auto" }} />
                                                    : <Lock style={{ width: 10, height: 10, color: "#D9822B", marginLeft: "auto" }} />}
                                            </div>
                                            <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 5 }}>
                                                {ROLES.map(r => (
                                                    <div key={r.key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: r.color, flexShrink: 0 }} />
                                                        <span style={{ fontSize: 11, flex: 1, color: "#182026" }}>{r.label}</span>
                                                        <button onClick={() => {
                                                            updateSection({ ...s, roleVisibility: { ...s.roleVisibility, [r.key]: !s.roleVisibility[r.key] } });
                                                        }} style={{
                                                            width: 22, height: 22, borderRadius: 4, border: "none", cursor: "pointer",
                                                            display: "flex", alignItems: "center", justifyContent: "center",
                                                            background: s.roleVisibility[r.key] ? "#E6F7F0" : "#EBF1F5"
                                                        }}>
                                                            {s.roleVisibility[r.key]
                                                                ? <Eye style={{ width: 11, height: 11, color: "#0D8050" }} />
                                                                : <EyeOff style={{ width: 11, height: 11, color: "#8A9BA8" }} />}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


