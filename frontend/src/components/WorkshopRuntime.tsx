"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Brain, RefreshCw, ChevronRight, Check, AlertCircle, Zap, Database, Search, X } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// ── Variable Store (inter-widget state) ───────────────────────────────────────
// Each entry: { value, sourceWidgetId, type: "selectedRow" | "filterValue" | "kpi" }
type VarEntry = { value: any; sourceWidgetId: string; type: string };
type VariableStore = Record<string, VarEntry>; // key = variableName

// ── Widget Data (from /api/workshop/:id/widget-data) ─────────────────────────
export type WidgetData = {
    type: string;
    hasData: boolean;
    rows?: Record<string, any>[];
    columns?: string[];
    total?: number;
    value?: number | null;
    property?: string;
    series?: { label: string; value: number }[];
};

// ── Live query helper ─────────────────────────────────────────────────────────
async function queryEntities(entityType: string, filterProperty?: string, filterValue?: any, limit = 100) {
    const r = await fetch(`${API}/api/workshop/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType, filterProperty, filterValue, limit })
    });
    if (!r.ok) return { rows: [], columns: [], total: 0, hasData: false };
    return r.json();
}

// ── Inline SVG Sparkline ──────────────────────────────────────────────────────
function Sparkline({ series, color = "#7C3AED" }: { series: number[]; color?: string }) {
    if (series.length < 2) return null;
    const W = 120, H = 36;
    const max = Math.max(...series), min = Math.min(...series);
    const scX = (i: number) => (i / (series.length - 1)) * W;
    const scY = (v: number) => H - ((v - min) / (max - min + 0.001)) * H;
    const path = series.map((v, i) => `${i === 0 ? "M" : "L"}${scX(i).toFixed(1)},${scY(v).toFixed(1)}`).join(" ");
    return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
            <defs>
                <linearGradient id={`spg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={`${path} L${W},${H} L0,${H} Z`} fill={`url(#spg-${color.replace("#", "")})`} />
            <path d={path} fill="none" stroke={color} strokeWidth="1.5" />
        </svg>
    );
}

// ── Live Object Table ─────────────────────────────────────────────────────────
function LiveObjectTable({ widgetId, entityType, widgetLabel, widgetData, onRowSelect, selectedRowId, variableStore }: {
    widgetId: string; entityType: string; widgetLabel: string;
    widgetData?: WidgetData; onRowSelect?: (rowId: string, row: any) => void;
    selectedRowId?: string; variableStore: VariableStore;
}) {
    const [rows, setRows] = useState<any[]>(widgetData?.rows ?? []);
    const [columns, setColumns] = useState<string[]>(widgetData?.columns ?? []);
    const [total, setTotal] = useState(widgetData?.total ?? 0);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedCol, setSelectedCol] = useState<string | null>(null);

    // Check if this widget is filtered by a variable
    const appliedFilter = Object.values(variableStore).find(v =>
        v.type === "selectedRow" && v.value && v.sourceWidgetId !== widgetId
    );

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await queryEntities(entityType, selectedCol ?? undefined, search || undefined);
            setRows(res.rows ?? []);
            setColumns(res.columns ?? []);
            setTotal(res.total ?? 0);
        } finally { setLoading(false); }
    }, [entityType, search, selectedCol]);

    useEffect(() => {
        if (widgetData?.hasData) {
            setRows(widgetData.rows ?? []);
            setColumns(widgetData.columns ?? []);
            setTotal(widgetData.total ?? 0);
        } else {
            load();
        }
    }, [widgetData]);

    useEffect(() => {
        if (search !== "" || selectedCol) load();
    }, [search, selectedCol]);

    const displayRows = rows.slice(0, 50);

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 180 }}>
            {/* Table toolbar */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", borderBottom: "1px solid #EBF1F5", background: "#FAFBFC" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#182026", flex: 1 }}>{widgetLabel}</span>
                {loading && <RefreshCw style={{ width: 12, height: 12, color: "#8A9BA8" }} className="animate-spin" />}
                <span style={{ fontSize: 10, color: "#8A9BA8" }}>{total} rows</span>
                {widgetData?.hasData && <span style={{ fontSize: 8, padding: "1px 4px", background: "#7C3AED", color: "#fff", borderRadius: 3, fontWeight: 700 }}>LIVE</span>}
                <button onClick={load} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    <RefreshCw style={{ width: 12, height: 12, color: "#8A9BA8" }} />
                </button>
            </div>
            {/* Search + filter row */}
            <div style={{ display: "flex", gap: 4, padding: "4px 8px", borderBottom: "1px solid #EBF1F5" }}>
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4, background: "#EBF1F5", borderRadius: 3, padding: "2px 6px" }}>
                    <Search style={{ width: 10, height: 10, color: "#8A9BA8", flexShrink: 0 }} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter rows..."
                        style={{ flex: 1, border: "none", background: "transparent", fontSize: 10, outline: "none", color: "#182026" }} />
                    {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}><X style={{ width: 8, height: 8 }} /></button>}
                </div>
                {columns.length > 0 && (
                    <select value={selectedCol ?? ""} onChange={e => setSelectedCol(e.target.value || null)}
                        style={{ fontSize: 10, border: "1px solid #CED9E0", borderRadius: 3, padding: "2px 4px", background: "#fff" }}>
                        <option value="">All columns</option>
                        {columns.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                )}
            </div>
            {/* Table body */}
            <div style={{ flex: 1, overflowY: "auto" }}>
                {displayRows.length === 0 ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 60, color: "#8A9BA8", fontSize: 11 }}>
                        <Database style={{ width: 14, height: 14, marginRight: 6 }} />
                        {loading ? "Loading entities..." : `No ${entityType} entities found`}
                    </div>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
                        <thead>
                            <tr style={{ background: "#F5F8FA", position: "sticky", top: 0 }}>
                                {columns.slice(0, 6).map(col => (
                                    <th key={col} style={{ padding: "4px 8px", textAlign: "left", color: "#5C7080", fontWeight: 700, borderBottom: "1px solid #CED9E0", whiteSpace: "nowrap" }}>{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {displayRows.map((row, i) => {
                                const rowId = row.id ?? String(i);
                                const isSelected = selectedRowId === rowId;
                                return (
                                    <tr key={rowId} onClick={() => onRowSelect?.(rowId, row)}
                                        style={{ borderBottom: "1px solid #EBF1F5", cursor: onRowSelect ? "pointer" : "default", background: isSelected ? "rgba(124,58,237,0.07)" : "transparent", transition: "background 0.1s" }}>
                                        {columns.slice(0, 6).map(col => {
                                            const v = row[col];
                                            const isStatus = col === "status" || col === "state";
                                            const statusColor = isStatus ? (String(v).toLowerCase().includes("active") || String(v).toLowerCase().includes("ok") ? "#0D8050" : "#C23030") : null;
                                            return (
                                                <td key={col} style={{ padding: "4px 8px", color: isStatus ? statusColor! : "#182026", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {isStatus ? (
                                                        <span style={{ fontSize: 8, padding: "1px 5px", borderRadius: 3, background: statusColor + "15", color: statusColor!, fontWeight: 700 }}>
                                                            {String(v).toUpperCase()}
                                                        </span>
                                                    ) : v !== null && v !== undefined ? String(v) : "—"}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

// ── Live KPI Card ─────────────────────────────────────────────────────────────
function LiveKpiCard({ widgetLabel, entityType, property, widgetData, color = "#0D8050" }: {
    widgetLabel: string; entityType: string; property?: string; widgetData?: WidgetData; color?: string;
}) {
    const hasReal = widgetData?.hasData;
    const value = widgetData?.value;
    const total = widgetData?.total ?? 0;
    const displayValue = property && value !== null && value !== undefined ? value : total;

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 12, height: "100%", minHeight: 80, textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#182026", lineHeight: 1 }}>
                {hasReal ? (property ? displayValue?.toFixed?.(1) : total) : "—"}
            </div>
            <div style={{ fontSize: 11, color: "#5C7080", fontWeight: 600, marginTop: 4 }}>{widgetLabel}</div>
            {hasReal ? (
                <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
                    <span style={{ fontSize: 9, color: "#10B981", fontWeight: 700 }}>LIVE · {entityType}</span>
                </div>
            ) : (
                <div style={{ fontSize: 9, color: "#8A9BA8", marginTop: 4 }}>No {entityType} data</div>
            )}
        </div>
    );
}

// ── Live Time Series Chart ────────────────────────────────────────────────────
function LiveChart({ widgetLabel, widgetData, color = "#7157D9", type = "line" }: {
    widgetLabel: string; widgetData?: WidgetData; color?: string; type?: "line" | "bar";
}) {
    const series = widgetData?.series?.map(s => s.value) ?? [];
    const hasReal = widgetData?.hasData && series.length > 0;

    return (
        <div style={{ width: "100%", height: "100%", minHeight: 100, padding: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#182026" }}>{widgetLabel}</span>
                {hasReal && <span style={{ fontSize: 8, padding: "1px 4px", background: color + "20", color, borderRadius: 3, fontWeight: 700 }}>LIVE</span>}
            </div>
            {hasReal ? (
                type === "bar" ? (
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 60 }}>
                        {series.slice(0, 20).map((v, i) => {
                            const max = Math.max(...series) || 1;
                            return <div key={i} style={{ flex: 1, height: `${Math.max(4, (v / max) * 100)}%`, background: color, borderRadius: "2px 2px 0 0", opacity: 0.8 }} />;
                        })}
                    </div>
                ) : (
                    <Sparkline series={series.slice(0, 20)} color={color} />
                )
            ) : (
                <div style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "center", color: "#8A9BA8", fontSize: 10, background: "#F5F8FA", borderRadius: 4 }}>
                    No chart data
                </div>
            )}
            {widgetData?.property && <div style={{ fontSize: 9, color: "#8A9BA8", marginTop: 4 }}>{widgetData.property}</div>}
        </div>
    );
}

// ── Selected Row Detail Panel ─────────────────────────────────────────────────
function SelectedRowPanel({ row, entityType, onClose }: { row: any; entityType: string; onClose: () => void }) {
    if (!row) return null;
    const entries = Object.entries(row).slice(0, 12);
    return (
        <div style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: 280, background: "#fff", borderLeft: "1px solid #CED9E0", zIndex: 100, display: "flex", flexDirection: "column", boxShadow: "-4px 0 20px rgba(0,0,0,0.08)" }}>
            <div style={{ padding: "10px 14px", background: "#F5F8FA", borderBottom: "1px solid #CED9E0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#182026" }}>{entityType} Detail</div>
                    <div style={{ fontSize: 10, color: "#8A9BA8" }}>ID: {row.id ?? "—"}</div>
                </div>
                <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
                    <X style={{ width: 14, height: 14, color: "#8A9BA8" }} />
                </button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
                {entries.map(([k, v]) => (
                    <div key={k} style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: "#5C7080", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>{k}</div>
                        <div style={{ fontSize: 12, color: "#182026", background: "#F5F8FA", borderRadius: 3, padding: "4px 8px", fontFamily: "monospace", wordBreak: "break-all" }}>
                            {v !== null && v !== undefined ? String(v) : "—"}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Main WorkshopRuntime ──────────────────────────────────────────────────────
interface WorkshopRuntimeProps {
    appId: string;
    appName: string;
    pages: any[];
    mode?: "preview" | "run";
}

export function WorkshopRuntime({ appId, appName, pages, mode = "preview" }: WorkshopRuntimeProps) {
    const [widgetDataMap, setWidgetDataMap] = useState<Record<string, WidgetData>>({});
    const [variables, setVariables] = useState<VariableStore>({});
    const [selectedRows, setSelectedRows] = useState<Record<string, string>>({}); // widgetId → rowId
    const [selectedRowData, setSelectedRowData] = useState<{ widgetId: string; rowId: string; row: any; entityType: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastRefreshed, setLastRefreshed] = useState(new Date());

    const loadWidgetData = useCallback(async () => {
        if (!appId) return;
        setLoading(true);
        try {
            const r = await fetch(`${API}/api/workshop/${appId}/widget-data`);
            if (r.ok) {
                const data = await r.json();
                setWidgetDataMap(data.widgetData ?? {});
                setLastRefreshed(new Date());
            }
        } finally { setLoading(false); }
    }, [appId]);

    useEffect(() => { loadWidgetData(); }, [loadWidgetData]);

    // Inter-widget: row selection handler propagates to variable store
    const handleRowSelect = useCallback((widgetId: string, rowId: string, row: any, entityType: string) => {
        setSelectedRows(prev => ({ ...prev, [widgetId]: rowId }));
        setSelectedRowData({ widgetId, rowId, row, entityType });
        // Set a variable that other widgets can use as a filter
        setVariables(prev => ({
            ...prev,
            [`${widgetId}_selected`]: { value: row, sourceWidgetId: widgetId, type: "selectedRow" },
            [`${widgetId}_selectedId`]: { value: rowId, sourceWidgetId: widgetId, type: "selectedId" }
        }));
    }, []);

    const renderWidget = (widget: any, sectionColumns: number) => {
        const wData = widgetDataMap[widget.id];
        const binding = widget.binding ?? {};
        const entityType = binding.objectType ?? "";
        const selectedRowId = selectedRows[widget.id];

        const style: React.CSSProperties = {
            gridColumn: `span ${Math.min(widget.colSpan ?? 1, sectionColumns)}`,
            gridRow: `span ${widget.rowSpan ?? 1}`,
            background: "#fff",
            border: "1px solid #CED9E0",
            borderRadius: 4,
            overflow: "hidden",
            minHeight: (widget.rowSpan ?? 1) > 1 ? 200 : 100,
            position: "relative",
        };

        if (widget.type === "object-table" || widget.type === "loop-layout") {
            return (
                <div key={widget.id} style={style}>
                    <LiveObjectTable
                        widgetId={widget.id}
                        entityType={entityType}
                        widgetLabel={widget.label}
                        widgetData={wData}
                        selectedRowId={selectedRowId}
                        variableStore={variables}
                        onRowSelect={(rowId, row) => handleRowSelect(widget.id, rowId, row, entityType)}
                    />
                </div>
            );
        }

        if (widget.type === "kpi-card") {
            return (
                <div key={widget.id} style={style}>
                    <LiveKpiCard
                        widgetLabel={widget.label}
                        entityType={entityType}
                        property={binding.property}
                        widgetData={wData}
                    />
                </div>
            );
        }

        if (widget.type === "time-series-chart") {
            return (
                <div key={widget.id} style={style}>
                    <LiveChart widgetLabel={widget.label} widgetData={wData} color="#7157D9" type="line" />
                </div>
            );
        }

        if (widget.type === "bar-chart") {
            return (
                <div key={widget.id} style={style}>
                    <LiveChart widgetLabel={widget.label} widgetData={wData} color="#D9822B" type="bar" />
                </div>
            );
        }

        if (widget.type === "button") {
            return (
                <div key={widget.id} style={{ ...style, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <button style={{ padding: "8px 20px", background: "#C23030", color: "#fff", border: "none", borderRadius: 3, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        <Zap style={{ width: 12, height: 12, display: "inline", marginRight: 4 }} />
                        {widget.label}
                    </button>
                </div>
            );
        }

        if (widget.type === "aip-agent") {
            return (
                <div key={widget.id} style={{ ...style, padding: 10, background: "rgba(113,87,217,0.03)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
                        <Brain style={{ width: 12, height: 12, color: "#7157D9" }} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#7157D9" }}>{widget.label}</span>
                    </div>
                    <div style={{ fontSize: 10, color: "#5C7080", background: "#fff", borderRadius: 4, padding: 6, border: "1px solid #CED9E0" }}>How can I help with this operation?</div>
                    <input style={{ marginTop: 6, padding: "4px 6px", border: "1px solid #CED9E0", borderRadius: 4, fontSize: 10, width: "100%", boxSizing: "border-box" }} placeholder="Ask the agent…" />
                </div>
            );
        }

        if (widget.type === "text-heading") {
            return (
                <div key={widget.id} style={{ ...style, display: "flex", alignItems: "center", padding: "8px 12px" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#182026" }}>{widget.label}</span>
                </div>
            );
        }

        // Generic fallback
        return (
            <div key={widget.id} style={{ ...style, display: "flex", alignItems: "center", justifyContent: "center", padding: 10, color: "#8A9BA8", fontSize: 11 }}>
                {widget.label}
            </div>
        );
    };

    const [activePage, setActivePage] = useState(0);
    const page = pages[activePage];

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#F5F8FA", fontFamily: "Inter, sans-serif" }}>
            {/* Runtime toolbar */}
            <div style={{ height: 40, background: "#fff", borderBottom: "1px solid #CED9E0", display: "flex", alignItems: "center", gap: 8, padding: "0 12px", flexShrink: 0 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#182026" }}>{appName}</span>
                <div style={{ flex: 1 }} />
                {loading && <RefreshCw style={{ width: 12, height: 12, color: "#8A9BA8" }} />}
                <span style={{ fontSize: 10, color: "#8A9BA8" }}>⟳ {lastRefreshed.toLocaleTimeString()}</span>
                <button onClick={loadWidgetData} style={{ fontSize: 10, padding: "3px 8px", border: "1px solid #CED9E0", borderRadius: 3, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                    <RefreshCw style={{ width: 10, height: 10 }} /> Refresh
                </button>
                {Object.keys(variables).length > 0 && (
                    <span style={{ fontSize: 9, padding: "2px 6px", background: "#EDE9FE", color: "#7C3AED", borderRadius: 3, fontWeight: 700 }}>
                        {Object.keys(variables).length} vars active
                    </span>
                )}
            </div>

            {/* Page tabs */}
            {pages.length > 1 && (
                <div style={{ display: "flex", background: "#fff", borderBottom: "1px solid #CED9E0", padding: "0 12px", gap: 2, flexShrink: 0 }}>
                    {pages.map((pg: any, i: number) => (
                        <button key={pg.id} onClick={() => setActivePage(i)}
                            style={{ fontSize: 11, padding: "6px 12px", border: "none", background: "transparent", cursor: "pointer", borderBottom: `2px solid ${activePage === i ? "#137CBD" : "transparent"}`, color: activePage === i ? "#137CBD" : "#5C7080", fontWeight: activePage === i ? 700 : 400 }}>
                            {pg.icon} {pg.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Variable binding active indicator */}
            {selectedRowData && (
                <div style={{ padding: "4px 12px", background: "rgba(124,58,237,0.05)", borderBottom: "1px solid rgba(124,58,237,0.15)", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    <Check style={{ width: 11, height: 11, color: "#7C3AED" }} />
                    <span style={{ fontSize: 10, color: "#7C3AED", fontWeight: 600 }}>
                        Row selected: <strong>{selectedRowData.entityType}</strong> / {selectedRowData.rowId}
                        {" · "}Inter-widget binding active
                    </span>
                    <button onClick={() => { setSelectedRowData(null); setSelectedRows({}); setVariables({}); }}
                        style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#8A9BA8", fontSize: 10 }}>✕ Clear</button>
                </div>
            )}

            {/* Page content */}
            <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
                {page?.sections?.map((section: any) => (
                    <div key={section.id} style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#5C7080", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
                            {section.name}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: `repeat(${section.columns ?? 1}, 1fr)`, gap: 10 }}>
                            {section.widgets?.map((w: any) => renderWidget(w, section.columns ?? 1))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Selected row detail panel */}
            {selectedRowData && (
                <SelectedRowPanel
                    row={selectedRowData.row}
                    entityType={selectedRowData.entityType}
                    onClose={() => { setSelectedRowData(null); setSelectedRows({}); setVariables({}); }}
                />
            )}
        </div>
    );
}
