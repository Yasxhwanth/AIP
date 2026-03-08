"use client";
import { useState, useEffect, useCallback } from "react";
import {
    BarChart2, Filter, RefreshCw, Plus, X, ChevronDown,
    Database, TrendingUp, Table2, Layers, Download, Search, Activity
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function post(path: string, body: any) {
    const r = await fetch(`${API}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return r.json();
}
async function get(path: string) {
    const r = await fetch(`${API}${path}`);
    return r.json();
}

const AGGREGATIONS = ["COUNT", "SUM", "AVG", "MIN", "MAX", "P95"];
const FILTER_OPS = ["=", "!=", ">", "<", "contains"];

interface Filter { property: string; op: string; value: string; }
interface EntitySummary { name: string; count: number; numericProps: string[]; lastUpdated: string | null; }

// ── Inline SVG chart ──────────────────────────────────────────────────────────
function BarChart({ data, valueKey = "value", labelKey = "group", color = "#7C3AED" }: { data: any[]; valueKey?: string; labelKey?: string; color?: string }) {
    if (!data.length) return <div className="flex items-center justify-center h-32 text-gray-400 text-sm">No data</div>;
    const max = Math.max(...data.map(d => d[valueKey] ?? 0)) || 1;
    return (
        <div className="flex items-end gap-1 h-32 px-2 overflow-x-auto">
            {data.slice(0, 30).map((d, i) => {
                const pct = ((d[valueKey] ?? 0) / max) * 100;
                return (
                    <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0" style={{ minWidth: 28 }}>
                        <div className="text-[8px] text-gray-500 font-mono">{d[valueKey]?.toFixed?.(1) ?? d[valueKey]}</div>
                        <div style={{ height: `${Math.max(4, pct)}%`, width: 22, background: color, borderRadius: "3px 3px 0 0", minHeight: 4 }} />
                        <div className="text-[8px] text-gray-500 truncate w-6 text-center" title={d[labelKey]}>{String(d[labelKey]).slice(0, 6)}</div>
                    </div>
                );
            })}
        </div>
    );
}

function LineChart({ series, color = "#0369A1" }: { series: { value: number | null; label: string }[]; color?: string }) {
    const vals = series.map(s => s.value ?? 0);
    if (!vals.length) return <div className="flex items-center justify-center h-24 text-gray-400 text-sm">No series data</div>;
    const W = 400, H = 80, pad = { l: 28, r: 8, t: 8, b: 18 };
    const iW = W - pad.l - pad.r, iH = H - pad.t - pad.b;
    const max = Math.max(...vals), min = Math.min(...vals);
    const scX = (i: number) => pad.l + (i / (vals.length - 1)) * iW;
    const scY = (v: number) => pad.t + iH - ((v - min) / (max - min + 0.001)) * iH;
    const path = vals.map((v, i) => `${i === 0 ? "M" : "L"}${scX(i).toFixed(1)},${scY(v).toFixed(1)}`).join(" ");
    const area = `${path} L${scX(vals.length - 1)},${pad.t + iH} L${pad.l},${pad.t + iH} Z`;
    return (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
            <defs>
                <linearGradient id="lgrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            {[min, (min + max) / 2, max].map((v, i) => (
                <g key={i}>
                    <line x1={pad.l} y1={scY(v)} x2={pad.l + iW} y2={scY(v)} stroke="#E2E8F0" strokeWidth="0.5" />
                    <text x={pad.l - 3} y={scY(v) + 3} textAnchor="end" fontSize="6" fill="#94A3B8">{v.toFixed(1)}</text>
                </g>
            ))}
            <path d={area} fill="url(#lgrad)" />
            <path d={path} fill="none" stroke={color} strokeWidth="1.5" />
        </svg>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function QuiverPage() {
    const [summaries, setSummaries] = useState<EntitySummary[]>([]);
    const [selEntity, setSelEntity] = useState("");
    const [columns, setColumns] = useState<string[]>([]);
    const [groupBy, setGroupBy] = useState("");
    const [aggregation, setAggregation] = useState("COUNT");
    const [property, setProperty] = useState("");
    const [filters, setFilters] = useState<Filter[]>([]);
    const [resultRows, setResultRows] = useState<any[]>([]);
    const [resultCols, setResultCols] = useState<string[]>([]);
    const [resultTotal, setResultTotal] = useState(0);
    const [tseries, setTseries] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<"table" | "bar" | "line">("bar");
    const [rawRows, setRawRows] = useState<any[]>([]);
    const [rawCols, setRawCols] = useState<string[]>([]);

    useEffect(() => {
        get("/api/analytics/entity-summary").then(d => {
            setSummaries(Array.isArray(d) ? d : []);
            if (d?.length > 0) {
                setSelEntity(d[0].name);
                setColumns([]);
            }
        }).catch(() => { });
    }, []);

    // Load raw columns when entity changes
    useEffect(() => {
        if (!selEntity) return;
        post("/api/analytics/query", { entityType: selEntity, limit: 5 }).then(d => {
            setColumns(d.columns ?? []);
            setRawCols(d.columns ?? []);
            if (d.columns?.[0]) setGroupBy(d.columns[0]);
        }).catch(() => { });
    }, [selEntity]);

    const run = useCallback(async () => {
        if (!selEntity) return;
        setLoading(true);
        try {
            const [qRes, tsRes] = await Promise.all([
                post("/api/analytics/query", { entityType: selEntity, groupBy: groupBy || undefined, aggregation, property: property || undefined, filters, limit: 50 }),
                property ? post("/api/analytics/timeseries", { entityType: selEntity, property, filters }) : Promise.resolve({ series: [] })
            ]);
            setResultRows(qRes.rows ?? []);
            setResultCols(qRes.columns ?? []);
            setResultTotal(qRes.total ?? 0);
            setTseries(tsRes.series ?? []);
        } finally { setLoading(false); }
    }, [selEntity, groupBy, aggregation, property, filters]);

    // Fetch raw table rows
    const runRaw = useCallback(async () => {
        if (!selEntity) return;
        const d = await post("/api/analytics/query", { entityType: selEntity, filters, limit: 100 });
        setRawRows(d.rows ?? []);
        setRawCols(d.columns ?? []);
    }, [selEntity, filters]);

    const addFilter = () => setFilters(f => [...f, { property: columns[0] ?? "", op: "=", value: "" }]);
    const removeFilter = (i: number) => setFilters(f => f.filter((_, j) => j !== i));
    const updateFilter = (i: number, patch: Partial<Filter>) => setFilters(f => f.map((fi, j) => j === i ? { ...fi, ...patch } : fi));

    const selSummary = summaries.find(s => s.name === selEntity);

    return (
        <div className="flex h-[calc(100vh-48px)] bg-slate-50 font-sans text-gray-900 overflow-hidden">

            {/* ── LEFT SIDEBAR: Entity picker + stats ── */}
            <div className="w-56 bg-white border-r border-gray-200 flex flex-col shadow-sm flex-shrink-0">
                <div className="p-3 border-b border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                        <BarChart2 className="w-4 h-4 text-violet-600" />
                        <span className="font-bold text-sm text-gray-800">Quiver</span>
                    </div>
                    <div className="text-[9px] uppercase font-bold text-gray-400 mb-1.5 tracking-wider">Entity Types</div>
                    <div className="space-y-0.5">
                        {summaries.map(s => (
                            <button key={s.name} onClick={() => { setSelEntity(s.name); setResultRows([]); }}
                                className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${selEntity === s.name ? "bg-violet-100 text-violet-700" : "text-gray-600 hover:bg-gray-100"}`}>
                                <div className="flex items-center justify-between">
                                    <span className="truncate">{s.name}</span>
                                    <span className="text-[9px] font-mono text-gray-400">{s.count}</span>
                                </div>
                                {s.numericProps.length > 0 && (
                                    <div className="text-[9px] text-gray-400 mt-0.5 truncate">{s.numericProps.slice(0, 3).join(", ")}</div>
                                )}
                            </button>
                        ))}
                        {summaries.length === 0 && (
                            <div className="text-xs text-gray-400 text-center py-4">No entity types found</div>
                        )}
                    </div>
                </div>

                {/* Quick stats */}
                {selSummary && (
                    <div className="p-3 border-b border-gray-100">
                        <div className="text-[9px] uppercase font-bold text-gray-400 mb-2 tracking-wider">Quick Stats</div>
                        <div className="space-y-2">
                            <div className="bg-violet-50 rounded-lg p-2">
                                <div className="text-[9px] text-violet-500 font-bold">TOTAL ENTITIES</div>
                                <div className="text-xl font-bold text-violet-700">{selSummary.count}</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2">
                                <div className="text-[9px] text-gray-500 font-bold">NUMERIC PROPS</div>
                                <div className="text-xs text-gray-700">{selSummary.numericProps.join(", ") || "none"}</div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="p-3 flex-1 overflow-y-auto">
                    <div className="text-[9px] uppercase font-bold text-gray-400 mb-1.5 tracking-wider">View Modes</div>
                    {[["bar", "Bar Chart", BarChart2], ["line", "Line Chart", TrendingUp], ["table", "Data Table", Table2]].map(([v, label, Icon]: any) => (
                        <button key={v} onClick={() => setViewMode(v)}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-lg mb-0.5 ${viewMode === v ? "bg-violet-100 text-violet-700 font-bold" : "text-gray-600 hover:bg-gray-100"}`}>
                            <Icon className="w-3 h-3" />{label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── CENTER: Config + Results ── */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Toolbar */}
                <div className="h-11 bg-white border-b border-gray-200 flex items-center gap-3 px-4 flex-shrink-0 shadow-sm">
                    <Activity className="w-4 h-4 text-violet-600" />
                    <span className="font-bold text-sm text-gray-800">{selEntity || "Select Entity"}</span>
                    <div className="w-px h-4 bg-gray-200" />
                    <span className="text-xs text-gray-400 font-mono">{resultTotal} results</span>
                    <div className="flex-1" />
                    <button onClick={runRaw} className="h-7 px-3 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-1.5">
                        <Table2 className="w-3.5 h-3.5" /> Raw Table
                    </button>
                    <button onClick={run} disabled={loading || !selEntity}
                        className="h-7 px-3 text-xs font-bold rounded-lg bg-violet-600 hover:bg-violet-700 text-white flex items-center gap-1.5 disabled:opacity-40">
                        {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <BarChart2 className="w-3.5 h-3.5" />}
                        Run Analysis
                    </button>
                </div>

                {/* Query builder row */}
                <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center flex-wrap gap-3 flex-shrink-0">
                    {/* GROUP BY */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Group By</span>
                        <select value={groupBy} onChange={e => setGroupBy(e.target.value)}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:ring-2 focus:ring-violet-400 outline-none">
                            <option value="">(none)</option>
                            {columns.map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                    {/* AGGREGATION */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Aggregate</span>
                        <select value={aggregation} onChange={e => setAggregation(e.target.value)}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:ring-2 focus:ring-violet-400 outline-none">
                            {AGGREGATIONS.map(a => <option key={a}>{a}</option>)}
                        </select>
                    </div>
                    {/* PROPERTY */}
                    {aggregation !== "COUNT" && (
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Property</span>
                            <select value={property} onChange={e => setProperty(e.target.value)}
                                className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:ring-2 focus:ring-violet-400 outline-none">
                                <option value="">—</option>
                                {selSummary?.numericProps.map(p => <option key={p}>{p}</option>)}
                                {columns.filter(c => !selSummary?.numericProps.includes(c)).map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                    )}

                    {/* Filters */}
                    {filters.map((f, i) => (
                        <div key={i} className="flex items-center gap-1 bg-violet-50 border border-violet-200 rounded-lg px-2 py-1">
                            <select value={f.property} onChange={e => updateFilter(i, { property: e.target.value })}
                                className="text-[10px] border-none bg-transparent outline-none font-medium text-violet-700">
                                {columns.map(c => <option key={c}>{c}</option>)}
                            </select>
                            <select value={f.op} onChange={e => updateFilter(i, { op: e.target.value })}
                                className="text-[10px] border-none bg-transparent outline-none font-mono text-violet-600">
                                {FILTER_OPS.map(o => <option key={o}>{o}</option>)}
                            </select>
                            <input value={f.value} onChange={e => updateFilter(i, { value: e.target.value })}
                                placeholder="value" className="text-[10px] w-16 bg-transparent outline-none border-b border-violet-300 text-violet-800" />
                            <button onClick={() => removeFilter(i)} className="text-violet-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                        </div>
                    ))}
                    <button onClick={addFilter} className="h-7 px-2 text-[10px] font-bold border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-violet-400 hover:text-violet-600 flex items-center gap-1">
                        <Filter className="w-3 h-3" /> Add Filter
                    </button>
                </div>

                {/* Results area */}
                <div className="flex-1 overflow-auto p-4">
                    {resultRows.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-4">
                            <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-700">
                                    {aggregation}({property || "count"}) by {groupBy || "all"} · {resultTotal} groups
                                </span>
                                <div className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 bg-violet-100 text-violet-600 rounded-md">LIVE</div>
                            </div>

                            {/* Chart visualization */}
                            {viewMode === "bar" && (
                                <div className="p-4">
                                    <BarChart data={resultRows} valueKey="value" labelKey="group" />
                                </div>
                            )}
                            {viewMode === "line" && tseries.length > 0 && (
                                <div className="p-4">
                                    <LineChart series={tseries} />
                                </div>
                            )}

                            {/* Result table */}
                            <div className="overflow-x-auto max-h-64">
                                <table className="w-full text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 sticky top-0">
                                            {resultCols.map(c => (
                                                <th key={c} className="px-3 py-2 text-left font-bold text-gray-500 border-b border-gray-200 whitespace-nowrap">{c}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {resultRows.map((row, i) => (
                                            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                                                {resultCols.map(c => {
                                                    const v = row[c];
                                                    const isNum = typeof v === "number";
                                                    return (
                                                        <td key={c} className="px-3 py-1.5 text-gray-800">
                                                            {isNum ? (
                                                                <span className="font-mono font-bold text-violet-700">{v.toFixed?.(2) ?? v}</span>
                                                            ) : (
                                                                <span className="truncate block max-w-[140px]">{String(v ?? "—")}</span>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Time series panel */}
                    {tseries.length > 0 && property && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-4">
                            <div className="px-4 py-2.5 border-b border-gray-100">
                                <span className="text-xs font-bold text-gray-700">Time Series · {property} over {tseries.length} buckets</span>
                            </div>
                            <div className="p-4">
                                <LineChart series={tseries} color="#0369A1" />
                            </div>
                        </div>
                    )}

                    {/* Raw data table */}
                    {rawRows.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                            <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-700">Raw Entity Data · {rawRows.length} rows</span>
                                <button className="text-[10px] text-gray-400 hover:text-gray-600 flex items-center gap-1"><Download className="w-3 h-3" /> Export</button>
                            </div>
                            <div className="overflow-x-auto max-h-96">
                                <table className="w-full text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 sticky top-0">
                                            {rawCols.map(c => (
                                                <th key={c} className="px-3 py-2 text-left font-bold text-gray-500 border-b border-gray-200 whitespace-nowrap">{c}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rawRows.map((row, i) => (
                                            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                                                {rawCols.map(c => (
                                                    <td key={c} className="px-3 py-1.5 text-gray-700 truncate max-w-[120px]">
                                                        {String(row[c] ?? "—")}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {resultRows.length === 0 && rawRows.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-4">
                            <BarChart2 className="w-16 h-16 opacity-10" />
                            <div className="text-sm font-bold opacity-30">Ready to Analyse</div>
                            <div className="text-xs opacity-20 text-center max-w-xs">
                                Select an entity type from the left, configure Group By + Aggregation, then click Run Analysis.<br />
                                Or click Raw Table to browse all entities.
                            </div>
                            {selEntity && (
                                <div className="flex gap-2">
                                    <button onClick={run} className="px-4 py-2 bg-violet-600 text-white text-xs font-bold rounded-lg hover:bg-violet-700">
                                        Run Analysis
                                    </button>
                                    <button onClick={runRaw} className="px-4 py-2 border border-gray-200 text-xs font-semibold rounded-lg hover:bg-gray-50">
                                        Browse Raw Data
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
