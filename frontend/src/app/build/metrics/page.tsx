"use client";
import { useState, useEffect } from "react";
import {
    BarChart2, Plus, Settings, Maximize2, X, ChevronDown,
    Play, AlertTriangle, Info, Check, RefreshCw, Share2
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type AlertOutputType = "batch" | "streaming";
type AggType = "AVG" | "SUM" | "COUNT" | "MIN" | "MAX" | "P50" | "P95" | "P99";
type MetricStatus = "active" | "draft" | "warning" | "inactive";

interface Metric {
    id: string;
    name: string;
    objectType: string;
    property: string;
    unit: string;
    aggr: AggType;
    window: string;
    threshold: number;
    thresholdOp: string;
    stream: string;
    alertOutputType: AlertOutputType;
    status: MetricStatus;
}

// ── Ontology object types (from the actual AIP ontology) ──────────────────────
const OBJECT_TYPES = ["Drone", "Mission", "Pilot", "Equipment", "Alert"];

const PROPERTIES: Record<string, { name: string; unit: string }[]> = {
    Drone: [{ name: "batteryLevel", unit: "%" }, { name: "flightHours", unit: "hr" }, { name: "altitude", unit: "m" }, { name: "speed", unit: "km/h" }],
    Mission: [{ name: "progressPct", unit: "%" }, { name: "delayMinutes", unit: "min" }, { name: "fuelUsed", unit: "L" }],
    Pilot: [{ name: "responseTime", unit: "s" }, { name: "missionCount", unit: "ct" }],
    Equipment: [{ name: "downtimeHrs", unit: "hr" }, { name: "errorRate", unit: "%" }, { name: "temperature", unit: "°C" }],
    Alert: [{ name: "openCount", unit: "ct" }, { name: "resolutionTime", unit: "min" }],
};

const WINDOWS = ["Last 5 min", "Last 15 min", "Last 1 hr", "Last 6 hr", "Last 24 hr", "Last 7 days"];
const STREAMS = ["Drone Telemetry Stream", "Mission Events Stream", "Alert Feed Stream", "Equipment Sensor Stream"];

// ── Seed metrics (no hardcoded chart values — chart is generated) ─────────────
const SEED_METRICS: Metric[] = [
    { id: "m1", name: "Drone Battery Level", objectType: "Drone", property: "batteryLevel", unit: "%", aggr: "AVG", window: "Last 15 min", threshold: 20, thresholdOp: "<", stream: "Drone Telemetry Stream", alertOutputType: "streaming", status: "active" },
    { id: "m2", name: "Mission Delay", objectType: "Mission", property: "delayMinutes", unit: "min", aggr: "P95", window: "Last 1 hr", threshold: 120, thresholdOp: ">", stream: "Mission Events Stream", alertOutputType: "batch", status: "warning" },
    { id: "m3", name: "Open Alert Count", objectType: "Alert", property: "openCount", unit: "ct", aggr: "COUNT", window: "Last 24 hr", threshold: 50, thresholdOp: ">", stream: "Alert Feed Stream", alertOutputType: "batch", status: "active" },
    { id: "m4", name: "Equipment Downtime", objectType: "Equipment", property: "downtimeHrs", unit: "hr", aggr: "SUM", window: "Last 7 days", threshold: 8, thresholdOp: ">", stream: "Equipment Sensor Stream", alertOutputType: "streaming", status: "inactive" },
    { id: "m5", name: "Equipment Error Rate", objectType: "Equipment", property: "errorRate", unit: "%", aggr: "AVG", window: "Last 1 hr", threshold: 5, thresholdOp: ">", stream: "Equipment Sensor Stream", alertOutputType: "streaming", status: "active" },
];

// ── Generate synthetic time-series data from metric params ────────────────────
function generateSeries(metric: Metric, points = 48): { t: number; v: number }[] {
    const seed = metric.id.charCodeAt(1);
    const base = metric.unit === "%" ? 60 : metric.unit === "hr" ? 4 : metric.unit === "min" ? 40 : 30;
    return Array.from({ length: points }, (_, i) => ({
        t: i,
        v: Math.max(0, base + Math.sin((i + seed) * 0.4) * (base * 0.3) + (Math.random() - 0.5) * (base * 0.2)),
    }));
}

// ── SVG Line Chart ────────────────────────────────────────────────────────────
function TimeSeriesChart({ metric }: { metric: Metric }) {
    const [series, setSeries] = useState(() => generateSeries(metric));

    useEffect(() => { setSeries(generateSeries(metric)); }, [metric.id]);

    const W = 480, H = 120;
    const pad = { t: 12, r: 8, b: 24, l: 36 };
    const iW = W - pad.l - pad.r, iH = H - pad.t - pad.b;

    const maxV = Math.max(...series.map(p => p.v), metric.threshold * 1.2);
    const minV = Math.min(...series.map(p => p.v), 0);
    const scX = (t: number) => pad.l + (t / (series.length - 1)) * iW;
    const scY = (v: number) => pad.t + iH - ((v - minV) / (maxV - minV + 0.001)) * iH;

    const linePath = series.map((p, i) => `${i === 0 ? "M" : "L"}${scX(p.t).toFixed(1)},${scY(p.v).toFixed(1)}`).join(" ");
    const areaPath = `${linePath} L${scX(series.length - 1).toFixed(1)},${(pad.t + iH).toFixed(1)} L${pad.l},${(pad.t + iH).toFixed(1)} Z`;
    const threshY = scY(metric.threshold);

    const yTicks = [minV, (minV + maxV) / 2, maxV].map(v => ({ v, y: scY(v) }));
    const xLabels = [0, Math.floor(series.length / 3), Math.floor((2 * series.length) / 3), series.length - 1];

    return (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }}>
            <defs>
                <linearGradient id={`grad-${metric.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
                </linearGradient>
            </defs>
            {/* Grid */}
            {yTicks.map(({ y }, i) => (
                <line key={i} x1={pad.l} y1={y} x2={pad.l + iW} y2={y} stroke="#EDE9FE" strokeWidth="0.7" />
            ))}
            {/* Y-axis labels */}
            {yTicks.map(({ v, y }) => (
                <text key={v} x={pad.l - 4} y={y + 3} textAnchor="end" fontSize="8" fill="#8B7EC8">{v.toFixed(0)}</text>
            ))}
            {/* X-axis labels */}
            {xLabels.map(i => (
                <text key={i} x={scX(i)} y={H - 4} textAnchor="middle" fontSize="7" fill="#8B7EC8">
                    {`${i}:${String(i % 60).padStart(2, "0")}`}
                </text>
            ))}
            {/* Area */}
            <path d={areaPath} fill={`url(#grad-${metric.id})`} />
            {/* Line */}
            <path d={linePath} fill="none" stroke="#7C3AED" strokeWidth="1.5" />
            {/* Threshold */}
            <line x1={pad.l} y1={threshY} x2={pad.l + iW} y2={threshY} stroke="#EF4444" strokeWidth="1" strokeDasharray="4,3" />
            <text x={pad.l + iW - 2} y={threshY - 3} textAnchor="end" fontSize="7" fill="#EF4444">
                threshold: {metric.threshold}{metric.unit}
            </text>
            {/* Y-axis unit */}
            <text x={8} y={pad.t + iH / 2} textAnchor="middle" fontSize="7" fill="#8B7EC8"
                transform={`rotate(-90, 8, ${pad.t + iH / 2})`}>{metric.unit}</text>
        </svg>
    );
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const btn = (primary = false): React.CSSProperties => ({
    height: 28, padding: "0 12px", borderRadius: 3, fontSize: 12, fontWeight: 600,
    cursor: "pointer", border: primary ? "none" : "1px solid #CED9E0",
    background: primary ? "#137CBD" : "#fff", color: primary ? "#fff" : "#394B59",
    display: "flex", alignItems: "center", gap: 5,
});

const tabStyle = (active: boolean): React.CSSProperties => ({
    fontSize: 12, padding: "5px 14px", cursor: "pointer", border: "none",
    background: "transparent", borderBottom: active ? "2px solid #137CBD" : "2px solid transparent",
    color: active ? "#137CBD" : "#5C7080", fontWeight: active ? 600 : 400,
});

const field = (label: string, children: React.ReactNode) => (
    <div key={label}>
        <label style={{
            fontSize: 10, fontWeight: 700, color: "#5C7080", display: "block",
            marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.07em"
        }}>{label}</label>
        {children}
    </div>
);

const select = (val: string, opts: string[], onChange: (v: string) => void) => (
    <select value={val} onChange={e => onChange(e.target.value)} style={{
        width: "100%", padding: "6px 10px", border: "1px solid #CED9E0",
        borderRadius: 3, fontSize: 12, background: "#fff", color: "#182026",
    }}>
        {opts.map(o => <option key={o}>{o}</option>)}
    </select>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MetricsPage() {
    const [metrics, setMetrics] = useState<Metric[]>(SEED_METRICS);
    const [sel, setSel] = useState<Metric>(SEED_METRICS[0]);
    const [tab, setTab] = useState("Definition");
    const [canvasTab, setCanvasTab] = useState("Time Series");

    const update = (patch: Partial<Metric>) => {
        const updated = { ...sel, ...patch };
        setSel(updated);
        setMetrics(m => m.map(x => x.id === sel.id ? updated : x));
    };

    const statusBadge = (s: MetricStatus) => {
        const c = { active: ["#E6F7F0", "#0D8050"], warning: ["#FFF3E0", "#D9822B"], draft: ["#EBF4FC", "#137CBD"], inactive: ["#EBF1F5", "#5C7080"] }[s];
        return <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 10, fontWeight: 700, background: c[0], color: c[1] }}>{s}</span>;
    };

    const objProps = PROPERTIES[sel.objectType] ?? [];

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#F5F8FA", fontFamily: "Inter, sans-serif" }}>

            {/* ── Top bar ── */}
            <div style={{
                height: 44, display: "flex", alignItems: "center", padding: "0 14px",
                background: "#fff", borderBottom: "1px solid #CED9E0", gap: 8, flexShrink: 0
            }}>
                <BarChart2 style={{ width: 16, height: 16, color: "#7C3AED" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#182026" }}>Metrics</span>
                <div style={{ width: 1, height: 16, background: "#CED9E0", margin: "0 4px" }} />
                <span style={{ fontSize: 11, color: "#5C7080" }}>Time-series thresholds · Alert automations</span>
                <div style={{ flex: 1 }} />
                <button style={btn()}><RefreshCw style={{ width: 12, height: 12 }} /> Refresh</button>
                <button style={btn()}><Share2 style={{ width: 12, height: 12 }} /> Share</button>
                <button style={btn(true)}><Plus style={{ width: 13, height: 13 }} /> New Metric</button>
            </div>

            {/* ── Body ── */}
            <div style={{ flex: 1, display: "flex", minHeight: 0 }}>

                {/* ── Metric list ── */}
                <div style={{ width: 260, background: "#fff", borderRight: "1px solid #CED9E0", display: "flex", flexDirection: "column", flexShrink: 0 }}>
                    <div style={{
                        padding: "8px 12px", fontSize: 10, fontWeight: 700, color: "#5C7080",
                        letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: "1px solid #EBF1F5"
                    }}>
                        Metric Definitions ({metrics.length})
                    </div>
                    <div style={{ flex: 1, overflowY: "auto" }}>
                        {metrics.map(m => (
                            <div key={m.id} onClick={() => setSel(m)}
                                style={{
                                    padding: "9px 12px", cursor: "pointer", borderBottom: "1px solid #EBF1F5",
                                    background: sel.id === m.id ? "rgba(124,58,237,0.05)" : "transparent",
                                    borderLeft: sel.id === m.id ? "2px solid #7C3AED" : "2px solid transparent"
                                }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: 12, fontWeight: 500, color: "#182026" }}>{m.name}</span>
                                    {statusBadge(m.status)}
                                </div>
                                <div style={{ fontSize: 10, color: "#8A9BA8", marginTop: 2 }}>
                                    {m.objectType}.{m.property} · {m.aggr} · {m.alertOutputType === "streaming" ? "⚡ stream" : "⏱ batch"}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Right panel ── */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

                    {/* Sub-tabs */}
                    <div style={{ display: "flex", background: "#fff", borderBottom: "1px solid #CED9E0", flexShrink: 0, padding: "0 4px" }}>
                        {["Definition", "Aggregation", "Alert Rules", "Streaming", "Preview"].map(t => (
                            <button key={t} onClick={() => setTab(t)} style={tabStyle(tab === t)}>{t}</button>
                        ))}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, overflow: "auto", padding: 20 }}>

                        {/* ── DEFINITION ── */}
                        {tab === "Definition" && (
                            <div style={{ display: "flex", gap: 20, maxWidth: 900, flexWrap: "wrap" }}>
                                <div style={{ flex: "1 1 340px", display: "flex", flexDirection: "column", gap: 14 }}>
                                    {field("Metric Name",
                                        <input value={sel.name} onChange={e => update({ name: e.target.value })}
                                            style={{ width: "100%", padding: "6px 10px", border: "1px solid #CED9E0", borderRadius: 3, fontSize: 13, background: "#fff" }} />
                                    )}
                                    {field("Object Type", select(sel.objectType, OBJECT_TYPES, v => update({ objectType: v, property: PROPERTIES[v]?.[0]?.name ?? "" })))}
                                    {field("Property", select(sel.property, objProps.map(p => p.name), v => update({ property: v, unit: objProps.find(p => p.name === v)?.unit ?? sel.unit })))}
                                    {field("Unit",
                                        <input value={sel.unit} onChange={e => update({ unit: e.target.value })}
                                            style={{ width: "100%", padding: "6px 10px", border: "1px solid #CED9E0", borderRadius: 3, fontSize: 12, background: "#fff" }} />
                                    )}
                                    {field("Status", select(sel.status, ["active", "draft", "warning", "inactive"], v => update({ status: v as MetricStatus })))}
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <button style={btn(true)}>Save Definition</button>
                                        <button style={btn()}>Discard</button>
                                    </div>
                                </div>

                                {/* Live chart preview */}
                                <div style={{ flex: "1 1 380px", background: "#fff", border: "1px solid #CED9E0", borderRadius: 4 }}>
                                    <div style={{
                                        display: "flex", alignItems: "center", justifyContent: "space-between",
                                        padding: "8px 12px", borderBottom: "1px solid #EBF1F5"
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            <span style={{ fontSize: 11, fontWeight: 700, color: "#182026" }}>
                                                {sel.objectType} · {sel.property}
                                            </span>
                                        </div>
                                        <div style={{ display: "flex", gap: 4 }}>
                                            <Settings style={{ width: 13, height: 13, color: "#5C7080", cursor: "pointer" }} />
                                            <Maximize2 style={{ width: 13, height: 13, color: "#5C7080", cursor: "pointer" }} />
                                        </div>
                                    </div>
                                    <div style={{ padding: "8px 12px" }}>
                                        <TimeSeriesChart metric={sel} />
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                                            <div style={{ width: 12, height: 2, background: "#7C3AED", borderRadius: 1 }} />
                                            <span style={{ fontSize: 10, color: "#5C7080" }}>{sel.aggr}({sel.property})</span>
                                            <div style={{ width: 12, height: 2, background: "#EF4444", borderRadius: 1, borderTop: "1px dashed #EF4444" }} />
                                            <span style={{ fontSize: 10, color: "#5C7080" }}>threshold</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── AGGREGATION ── */}
                        {tab === "Aggregation" && (
                            <div style={{ maxWidth: 480, display: "flex", flexDirection: "column", gap: 14 }}>
                                {field("Aggregation Type", select(sel.aggr, ["AVG", "SUM", "COUNT", "MIN", "MAX", "P50", "P95", "P99"], v => update({ aggr: v as AggType })))}
                                {field("Time Window", select(sel.window, WINDOWS, v => update({ window: v })))}
                                {field("Group By",
                                    <select style={{ width: "100%", padding: "6px 10px", border: "1px solid #CED9E0", borderRadius: 3, fontSize: 12, background: "#fff" }}>
                                        <option>No grouping</option>
                                        {OBJECT_TYPES.map(o => <option key={o}>By {o} instance</option>)}
                                    </select>
                                )}
                                <div style={{ padding: 12, background: "#F5F8FA", borderRadius: 3, border: "1px solid #EBF1F5" }}>
                                    <code style={{ fontSize: 11, color: "#182026" }}>
                                        <span style={{ color: "#7C3AED" }}>{sel.aggr}</span>({sel.objectType}.{sel.property})
                                        {" "}OVER <span style={{ color: "#137CBD" }}>{sel.window}</span>
                                    </code>
                                </div>

                                {/* Live preview */}
                                <div style={{ background: "#fff", border: "1px solid #CED9E0", borderRadius: 4, padding: 12 }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: "#182026", marginBottom: 8 }}>Historical Preview</div>
                                    <TimeSeriesChart metric={sel} />
                                </div>
                                <button style={btn(true)}>Save Aggregation</button>
                            </div>
                        )}

                        {/* ── ALERT RULES ── */}
                        {tab === "Alert Rules" && (
                            <div style={{ maxWidth: 620 }}>
                                {/* Trigger type header — matches reference image 1 */}
                                <div style={{
                                    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                                    padding: "12px 16px", background: "#fff", border: "1px solid #CED9E0",
                                    borderRadius: 4, marginBottom: 16
                                }}>
                                    <div style={{ display: "flex", gap: 12 }}>
                                        <div style={{
                                            width: 32, height: 32, borderRadius: 4, background: "rgba(124,58,237,0.1)",
                                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                                        }}>
                                            <BarChart2 style={{ width: 16, height: 16, color: "#7C3AED" }} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 700, color: "#182026" }}>Time series</div>
                                            <div style={{ fontSize: 12, color: "#5C7080" }}>Triggers when a time series threshold is crossed.</div>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <button style={{ ...btn(), color: "#7C3AED", borderColor: "#7C3AED" }}>
                                            <BarChart2 style={{ width: 12, height: 12 }} /> Time series <ChevronDown style={{ width: 11, height: 11 }} />
                                        </button>
                                        <button style={{ ...btn(), width: 32, padding: 0, justifyContent: "center" }}>⊞</button>
                                    </div>
                                </div>

                                {/* Alert output type — exact match to reference image 1 */}
                                <div style={{ background: "#fff", border: "1px solid #CED9E0", borderRadius: 4, padding: 16, marginBottom: 16 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: "#182026" }}>Alert output type</div>
                                            <div style={{ fontSize: 12, color: "#5C7080" }}>Choose the latency of outputting alerts.</div>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#137CBD", cursor: "pointer" }}>
                                            <BarChart2 style={{ width: 13, height: 13 }} /> Documentation
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
                                        {/* Batch */}
                                        <div onClick={() => update({ alertOutputType: "batch" })} style={{
                                            flex: 1, border: `1.5px solid ${sel.alertOutputType === "batch" ? "#137CBD" : "#CED9E0"}`,
                                            borderRadius: 4, padding: 16, cursor: "pointer", textAlign: "center",
                                            background: sel.alertOutputType === "batch" ? "rgba(19,124,189,0.04)" : "#fff",
                                            position: "relative",
                                        }}>
                                            {sel.alertOutputType === "batch" && (
                                                <Check style={{ position: "absolute", top: 10, right: 10, width: 14, height: 14, color: "#137CBD" }} />
                                            )}
                                            <div style={{ fontSize: 22, marginBottom: 8 }}>▦</div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: "#182026", marginBottom: 6 }}>Batch alerting</div>
                                            <div style={{ fontSize: 11, color: "#5C7080", lineHeight: 1.5 }}>
                                                Alerting inputs and outputs are updated on each deploy of inputs. Use to create alerts that are sent out periodically.
                                            </div>
                                        </div>
                                        {/* Streaming */}
                                        <div onClick={() => update({ alertOutputType: "streaming" })} style={{
                                            flex: 1, border: `1.5px solid ${sel.alertOutputType === "streaming" ? "#137CBD" : "#CED9E0"}`,
                                            borderRadius: 4, padding: 16, cursor: "pointer", textAlign: "center",
                                            background: sel.alertOutputType === "streaming" ? "rgba(19,124,189,0.04)" : "#fff",
                                            position: "relative",
                                        }}>
                                            {sel.alertOutputType === "streaming" && (
                                                <Check style={{ position: "absolute", top: 10, right: 10, width: 14, height: 14, color: "#137CBD" }} />
                                            )}
                                            <div style={{ fontSize: 22, marginBottom: 8 }}>▶</div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: "#182026", marginBottom: 6 }}>Streaming alerting</div>
                                            <div style={{ fontSize: 11, color: "#5C7080", lineHeight: 1.5 }}>
                                                Alerting inputs and outputs are updated continuously as new data is made available. Use to create alerts that are sent out with low latency.
                                            </div>
                                        </div>
                                    </div>

                                    {/* Warning banner — matches reference */}
                                    <div style={{
                                        marginTop: 14, padding: "8px 12px", background: "#EBF4FC", borderRadius: 3,
                                        border: "1px solid #B3D7F5", display: "flex", gap: 8, alignItems: "center"
                                    }}>
                                        <Info style={{ width: 14, height: 14, color: "#137CBD", flexShrink: 0 }} />
                                        <span style={{ fontSize: 12, color: "#1F4E79" }}>
                                            You will not be able to change the alert output type after the automation has been created.
                                        </span>
                                    </div>
                                </div>

                                {/* Threshold */}
                                <div style={{ background: "#fff", border: "1px solid #CED9E0", borderRadius: 4, padding: 16 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: "#182026", marginBottom: 12 }}>Threshold</div>
                                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                        <select value={sel.thresholdOp}
                                            onChange={e => update({ thresholdOp: e.target.value })}
                                            style={{ padding: "6px 8px", border: "1px solid #CED9E0", borderRadius: 3, fontSize: 13, background: "#fff" }}>
                                            {["<", "<=", ">", ">=", "==", "!="].map(o => <option key={o}>{o}</option>)}
                                        </select>
                                        <input type="number" value={sel.threshold}
                                            onChange={e => update({ threshold: Number(e.target.value) })}
                                            style={{ width: 90, padding: "6px 10px", border: "1px solid #CED9E0", borderRadius: 3, fontSize: 13, background: "#fff" }} />
                                        <span style={{ fontSize: 13, color: "#5C7080" }}>{sel.unit}</span>
                                    </div>
                                    <div style={{ marginTop: 10, padding: "8px 10px", background: "#F5F8FA", borderRadius: 3, fontSize: 11, color: "#5C7080" }}>
                                        Alert when <span style={{ color: "#182026", fontWeight: 600 }}>{sel.aggr}({sel.property})</span>{" "}
                                        <span style={{ color: "#EF4444", fontWeight: 700 }}>{sel.thresholdOp} {sel.threshold}{sel.unit}</span>
                                    </div>
                                    <button style={{ ...btn(true), marginTop: 12 }}>Save Alert Rule</button>
                                </div>
                            </div>
                        )}

                        {/* ── STREAMING ── */}
                        {tab === "Streaming" && (
                            <div style={{ maxWidth: 480, display: "flex", flexDirection: "column", gap: 14 }}>
                                <div style={{ padding: 12, background: "#EBF4FC", border: "1px solid #B3D7F5", borderRadius: 4, fontSize: 12, color: "#1F4E79" }}>
                                    <strong>Flink-based streaming binding</strong> — evaluates logic continuously as new data points arrive,
                                    typically within seconds. Requires a stream source configured in the Data layer.
                                </div>
                                {field("Stream Source", select(sel.stream, STREAMS, v => update({ stream: v })))}
                                {field("Evaluation Engine",
                                    <select style={{ width: "100%", padding: "6px 10px", border: "1px solid #CED9E0", borderRadius: 3, fontSize: 12, background: "#fff" }}>
                                        <option>Flink (streaming, low-latency)</option>
                                        <option>Spark (batch, scheduled)</option>
                                    </select>
                                )}
                                {field("Evaluation Frequency",
                                    <select style={{ width: "100%", padding: "6px 10px", border: "1px solid #CED9E0", borderRadius: 3, fontSize: 12, background: "#fff" }}>
                                        <option>Continuous (event-driven)</option>
                                        <option>Every 30 seconds</option>
                                        <option>Every 1 minute</option>
                                        <option>Every 5 minutes</option>
                                    </select>
                                )}
                                {field("Incremental Processing",
                                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#182026", cursor: "pointer" }}>
                                        <input type="checkbox" defaultChecked />
                                        Only process new data after initial run (recommended)
                                    </label>
                                )}
                                <div style={{
                                    display: "flex", alignItems: "center", gap: 6, padding: "8px 12px",
                                    background: sel.status === "active" ? "#E6F7F0" : "#EBF1F5",
                                    border: `1px solid ${sel.status === "active" ? "#0D8050" : "#CED9E0"}`, borderRadius: 4
                                }}>
                                    <div style={{
                                        width: 8, height: 8, borderRadius: "50%",
                                        background: sel.status === "active" ? "#0D8050" : "#5C7080"
                                    }} />
                                    <span style={{ fontSize: 12, fontWeight: 500, color: sel.status === "active" ? "#0D8050" : "#5C7080" }}>
                                        {sel.status === "active" ? `Streaming active on: ${sel.stream}` : "Not streaming"}
                                    </span>
                                </div>
                                <button style={btn(true)}>Bind Stream</button>
                            </div>
                        )}

                        {/* ── PREVIEW (Contour-style canvas) ── */}
                        {tab === "Preview" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 0, height: "100%" }}>
                                {/* Canvas toolbar */}
                                <div style={{
                                    display: "flex", alignItems: "center", gap: 6, padding: "0 12px", height: 38,
                                    background: "#fff", border: "1px solid #CED9E0", borderRadius: "4px 4px 0 0", flexShrink: 0
                                }}>
                                    <button style={{ ...btn(), fontSize: 12 }}>
                                        <Plus style={{ width: 12, height: 12 }} /> Add Data to Analysis
                                    </button>
                                    <div style={{ flex: 1 }} />
                                    <button style={btn()}>↺</button>
                                    <button style={btn()}>↻</button>
                                    <button style={btn()}><Settings style={{ width: 13, height: 13 }} /></button>
                                    <button style={btn(true)}>Save</button>
                                    <button style={btn()}><Share2 style={{ width: 12, height: 12 }} /> Share</button>
                                </div>

                                {/* Canvas sub-tabs */}
                                <div style={{
                                    display: "flex", background: "#fff", borderLeft: "1px solid #CED9E0",
                                    borderRight: "1px solid #CED9E0", padding: "0 8px", gap: 2
                                }}>
                                    {["Objects", "Time Series", "Charts", "Tables", "Numeric", "String", "Date/time"].map(t => (
                                        <button key={t} onClick={() => setCanvasTab(t)} style={{
                                            ...tabStyle(canvasTab === t), fontSize: 11,
                                        }}>{t}</button>
                                    ))}
                                    <div style={{ flex: 1 }} />
                                    <button style={{ ...btn(), fontSize: 11 }}>Canvas <ChevronDown style={{ width: 10, height: 10 }} /></button>
                                </div>

                                {/* Canvas body — 2-column widget layout */}
                                <div style={{
                                    flex: 1, display: "flex", gap: 12, padding: 12,
                                    background: "#F5F8FA", border: "1px solid #CED9E0", borderTop: "none",
                                    borderRadius: "0 0 4px 4px", overflow: "auto"
                                }}>

                                    {/* Object list widget */}
                                    <div style={{
                                        width: 220, background: "#fff", border: "1px solid #CED9E0",
                                        borderRadius: 3, flexShrink: 0, display: "flex", flexDirection: "column"
                                    }}>
                                        <div style={{
                                            display: "flex", alignItems: "center", padding: "6px 10px",
                                            background: "#F5F8FA", borderBottom: "1px solid #CED9E0", gap: 6
                                        }}>
                                            <span style={{
                                                fontSize: 9, fontWeight: 700, color: "#5C7080",
                                                background: "#EBF1F5", padding: "1px 5px", borderRadius: 2
                                            }}>$B</span>
                                            <span style={{ fontSize: 11, fontWeight: 600, color: "#182026", flex: 1 }}>{sel.objectType}s</span>
                                            <Settings style={{ width: 11, height: 11, color: "#8A9BA8", cursor: "pointer" }} />
                                            <X style={{ width: 11, height: 11, color: "#8A9BA8", cursor: "pointer" }} />
                                        </div>
                                        <div style={{ display: "flex", borderBottom: "1px solid #EBF1F5" }}>
                                            {["Table", "Configuration"].map(t => (
                                                <button key={t} style={{ ...tabStyle(t === "Table"), fontSize: 10, padding: "4px 10px" }}>{t}</button>
                                            ))}
                                        </div>
                                        <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
                                            <div style={{
                                                fontSize: 10, fontWeight: 700, color: "#5C7080", padding: "2px 4px",
                                                background: "#EBF1F5", borderRadius: 2, marginBottom: 4, textTransform: "uppercase"
                                            }}>
                                                {sel.objectType.toUpperCase()}
                                            </div>
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <div key={i} style={{
                                                    display: "flex", alignItems: "center", gap: 6,
                                                    padding: "4px 4px", borderBottom: "1px solid #EBF1F5", cursor: "pointer"
                                                }}>
                                                    <div style={{
                                                        width: 10, height: 10, borderRadius: 2, background: "#137CBD",
                                                        display: "flex", alignItems: "center", justifyContent: "center"
                                                    }}>
                                                        <span style={{ fontSize: 6, color: "#fff", fontWeight: 700 }}>O</span>
                                                    </div>
                                                    <span style={{ fontSize: 11, color: "#137CBD" }}>{sel.objectType} {100 + i}</span>
                                                </div>
                                            ))}
                                            <div style={{
                                                fontSize: 10, color: "#5C7080", padding: "6px 4px",
                                                borderTop: "1px solid #EBF1F5", marginTop: 2
                                            }}>
                                                🔷 {(Math.floor(Math.random() * 800) + 100)} {sel.objectType}s
                                                <span style={{ float: "right", color: "#137CBD", cursor: "pointer" }}>Properties</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Object selection widget */}
                                    <div style={{
                                        width: 200, background: "#fff", border: "1px solid #CED9E0",
                                        borderRadius: 3, flexShrink: 0
                                    }}>
                                        <div style={{
                                            display: "flex", alignItems: "center", padding: "6px 10px",
                                            background: "#F5F8FA", borderBottom: "1px solid #CED9E0", gap: 6
                                        }}>
                                            <span style={{
                                                fontSize: 9, fontWeight: 700, color: "#5C7080",
                                                background: "#EBF1F5", padding: "1px 5px", borderRadius: 2
                                            }}>$D</span>
                                            <span style={{ fontSize: 11, fontWeight: 600, color: "#182026", flex: 1 }}>Object selection of {sel.objectType}s</span>
                                            <X style={{ width: 11, height: 11, color: "#8A9BA8", cursor: "pointer" }} />
                                        </div>
                                        <div style={{ padding: 10 }}>
                                            <div style={{ fontSize: 10, color: "#5C7080", marginBottom: 4 }}>Select object</div>
                                            <select style={{
                                                width: "100%", padding: "5px 8px", border: "1px solid #CED9E0",
                                                borderRadius: 3, fontSize: 11, background: "#fff", color: "#137CBD"
                                            }}>
                                                {[1, 2, 3, 4, 5].map(i => <option key={i}>{sel.objectType} {i}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Time series chart widget */}
                                    <div style={{ flex: 1, background: "#fff", border: "1px solid #CED9E0", borderRadius: 3, minWidth: 0 }}>
                                        <div style={{
                                            display: "flex", alignItems: "center", padding: "6px 10px",
                                            background: "#F5F8FA", borderBottom: "1px solid #CED9E0", gap: 6
                                        }}>
                                            <span style={{
                                                fontSize: 9, fontWeight: 700, color: "#5C7080",
                                                background: "#EBF1F5", padding: "1px 5px", borderRadius: 2
                                            }}>$E</span>
                                            <span style={{ fontSize: 11, fontWeight: 600, color: "#182026", flex: 1 }}>{sel.objectType} {sel.property}</span>
                                            <button style={{ ...btn(), fontSize: 10, height: 22, padding: "0 6px" }}>+ Add plot</button>
                                            <X style={{ width: 11, height: 11, color: "#8A9BA8", cursor: "pointer" }} />
                                        </div>
                                        <div style={{ display: "flex", gap: 8, padding: "8px 12px" }}>
                                            <div style={{ flex: 1 }}>
                                                <TimeSeriesChart metric={sel} />
                                            </div>
                                            <div style={{ width: 80, flexShrink: 0 }}>
                                                <div style={{ fontSize: 9, fontWeight: 700, color: "#5C7080", marginBottom: 4 }}>Plots</div>
                                                <div style={{
                                                    display: "flex", alignItems: "center", gap: 4, padding: "3px 6px",
                                                    background: "rgba(124,58,237,0.1)", borderRadius: 3
                                                }}>
                                                    <div style={{ width: 18, height: 2, background: "#7C3AED", borderRadius: 1 }} />
                                                    <span style={{ fontSize: 9, color: "#182026" }}>{sel.property}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{
                                            display: "flex", alignItems: "center", padding: "4px 12px",
                                            borderTop: "1px solid #EBF1F5", gap: 8
                                        }}>
                                            <select style={{ fontSize: 9, border: "none", background: "transparent", color: "#5C7080" }}>
                                                {["5J", "15J", "1H", "6H", "24H"].map(t => <option key={t}>{t}</option>)}
                                            </select>
                                            <span style={{ fontSize: 9, color: "#5C7080" }}>⏱ Time</span>
                                            <Settings style={{ width: 9, height: 9, color: "#8A9BA8" }} />
                                        </div>
                                    </div>
                                </div>
                                <button style={{ ...btn(), marginTop: 8, alignSelf: "flex-start" }}>+ Canvas</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
