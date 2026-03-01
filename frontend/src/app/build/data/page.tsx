"use client";

import { useState, useCallback } from "react";
import ReactFlow, {
    Background, Controls, MiniMap,
    Node, Edge, NodeTypes,
    Handle, Position, useNodesState, useEdgesState,
    getBezierPath, EdgeProps
} from "reactflow";
import "reactflow/dist/style.css";
import {
    Database, GitBranch, Zap, Table2, RefreshCw, Plus,
    Search, Columns, Clock, ChevronDown, ChevronUp,
    CheckCircle2, AlertTriangle, XCircle, ExternalLink,
    Code2, History, BarChart2, Activity, Eye
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
//  SHARED STYLES
// ═══════════════════════════════════════════════════════════
const S = {
    topBar: {
        height: 44, display: "flex", alignItems: "center", padding: "0 14px",
        background: "#fff", borderBottom: "1px solid #CED9E0",
        gap: 8, flexShrink: 0, fontFamily: "Inter, sans-serif",
    } as React.CSSProperties,
    btn: (primary = false): React.CSSProperties => ({
        height: 28, padding: "0 12px", borderRadius: 3, fontSize: 12, fontWeight: 600,
        cursor: "pointer", border: primary ? "none" : "1px solid #CED9E0",
        background: primary ? "#137CBD" : "#fff",
        color: primary ? "#fff" : "#394B59",
        display: "flex", alignItems: "center", gap: 5,
    }),
    tab: (active: boolean): React.CSSProperties => ({
        fontSize: 12, fontWeight: 500, padding: "5px 12px", cursor: "pointer", borderRadius: 3,
        background: active ? "rgba(19,124,189,0.1)" : "transparent",
        color: active ? "#137CBD" : "#5C7080",
        border: "none",
    }),
};

// ═══════════════════════════════════════════════════════════
//  NODE TYPES — matching Palantir pipeline reference
// ═══════════════════════════════════════════════════════════
const NODE_COLORS: Record<string, { bg: string; border: string; label: string }> = {
    dataset: { bg: "#EBF1F5", border: "#137CBD", label: "Dataset" },
    sql: { bg: "#FFF3E0", border: "#D9822B", label: "SQL Transform" },
    python: { bg: "#FFFDE7", border: "#D9B504", label: "Python Transform" },
    fusion: { bg: "#E6F7F0", border: "#0D8050", label: "Fusion Sync" },
    output: { bg: "#F3E6FF", border: "#7157D9", label: "Ontology Output" },
};

function PipelineNode({ data }: { data: { label: string; type: string; cols?: number } }) {
    const style = NODE_COLORS[data.type] || NODE_COLORS.dataset;
    return (
        <div style={{
            background: style.bg, border: `1.5px solid ${style.border}`, borderRadius: 4,
            padding: "5px 12px", fontSize: 11, fontWeight: 600,
            color: "#182026", minWidth: 120, position: "relative",
            fontFamily: "Inter, sans-serif", boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            display: "flex", alignItems: "center", gap: 6,
        }}>
            <Handle type="target" position={Position.Left} style={{ width: 8, height: 8, background: style.border, border: "2px solid #fff" }} />
            <span style={{ color: style.border, fontSize: 11 }}>{"›"}</span>
            {data.label}
            <span style={{ color: style.border, fontSize: 11 }}>{"›"}</span>
            <Handle type="source" position={Position.Right} style={{ width: 8, height: 8, background: style.border, border: "2px solid #fff" }} />
        </div>
    );
}

const nodeTypes: NodeTypes = { pipeline: PipelineNode };

// ═══════════════ INITIAL PIPELINE DATA ════════════════════
const INIT_NODES: Node[] = [
    { id: "1", type: "pipeline", position: { x: 50, y: 120 }, data: { label: "drug_claims_golden_table", type: "dataset" } },
    { id: "2", type: "pipeline", position: { x: 280, y: 120 }, data: { label: "drug_claims_with_doctor_id", type: "sql" } },
    { id: "3", type: "pipeline", position: { x: 520, y: 100 }, data: { label: "antidepressant_drug_claims", type: "sql" } },
    { id: "4", type: "pipeline", position: { x: 50, y: 220 }, data: { label: "territory_manager_mapping", type: "fusion" } },
    { id: "5", type: "pipeline", position: { x: 280, y: 220 }, data: { label: "state_territory_mapping", type: "python" } },
    { id: "6", type: "pipeline", position: { x: 700, y: 160 }, data: { label: "drug_claims_ontology", type: "output" } },
];
const INIT_EDGES: Edge[] = [
    { id: "e1-2", source: "1", target: "2", type: "smoothstep" },
    { id: "e2-3", source: "2", target: "3", type: "smoothstep" },
    { id: "e3-6", source: "3", target: "6", type: "smoothstep" },
    { id: "e4-5", source: "4", target: "5", type: "smoothstep" },
    { id: "e5-6", source: "5", target: "6", type: "smoothstep" },
];

// ═══════════════════════════════════════════════════════════
//  TABS
// ═══════════════════════════════════════════════════════════
type DataTab = "pipeline" | "datasets" | "sources";

// ═══════════════════════════════════════════════════════════
//  DATASET TABLE (reference image 2)
// ═══════════════════════════════════════════════════════════
const AIRLINES = [
    { iata: "WN", name: "Southwest Airlines", bts: 19393, carrier: "Southwest Airlines Co", wac: "10", region: "Domestic" },
    { iata: "AC", name: "null", bts: 19531, carrier: "null", wac: "427", region: "International" },
    { iata: "AF", name: "Air France", bts: 19532, carrier: "Compagnie Natl Air F", wac: "427", region: "International" },
    { iata: "AI", name: "Air India Limited", bts: 19533, carrier: "National Aviation Co", wac: "733", region: "International" },
    { iata: "AM", name: "AeroMéxico", bts: 19534, carrier: "Aeromexcico", wac: "733", region: "International" },
    { iata: "AR", name: "Aerolíneas Argentina", bts: 19535, carrier: "Aerolíneas Argentina", wac: "433", region: "International" },
    { iata: "AT", name: "Royal Air Maroc", bts: 19536, carrier: "Royal Air Maroc", wac: "548", region: "International" },
    { iata: "AV", name: "Avianca Intl Col", bts: 19537, carrier: "Avianca Nncl de Col", wac: "327", region: "International" },
    { iata: "AY", name: "Finnair", bts: 19538, carrier: "Finnair Oy", wac: "507", region: "International" },
    { iata: "AZ", name: "Alitalia", bts: 19539, carrier: "Italia Transaero Am", wac: "507", region: "International" },
    { iata: "BA", name: "British Airways", bts: 19540, carrier: "British Airways Plc", wac: "493", region: "International" },
    { iata: "BD", name: "bmi", bts: 19541, carrier: "British Midland Airw", wac: "493", region: "International" },
    { iata: "BW", name: "Caribbean Airlines", bts: 19542, carrier: "Caribbean Airlines L", wac: "280", region: "International" },
];

const DATASETS = [
    { name: "airlines", type: "Dataset", rows: "481 rows", cols: "12 cols", status: "healthy", updated: "Jun 28, 2025" },
    { name: "drug_claims_golden_table", type: "Dataset", rows: "1.2M rows", cols: "24 cols", status: "healthy", updated: "Jun 27, 2025" },
    { name: "territory_manager_mapping", type: "Fusion", rows: "3.4K rows", cols: "8 cols", status: "healthy", updated: "Jun 26, 2025" },
    { name: "antidepressant_drug_claims", type: "SQL View", rows: "482K rows", cols: "18 cols", status: "warning", updated: "Jun 25, 2025" },
    { name: "state_territory_mapping", type: "Python", rows: "52 rows", cols: "5 cols", status: "healthy", updated: "Jun 24, 2025" },
    { name: "drug_claims_ontology", type: "Output", rows: "482K rows", cols: "22 cols", status: "healthy", updated: "Jun 23, 2025" },
];

// ═══════════════════════════════════════════════════════════
//  SOURCE TABLES (reference image 3)
// ═══════════════════════════════════════════════════════════
const SOURCE_TABLES = [
    "ApexPago", "ApexPageInfo", "ApexTestQueueItem", "ApexTestResult",
    "ApexTestResultITLimits", "ApexTestRunResult", "ApexTestSuite",
    "ApexTrigger", "ApiAnomalyEventStore", "ApiAnomalyEventStoreFeed",
    "ApiEvent", "ApiAnalyticsQueryRequest", "AppDefinition", "AppMenuItem",
    "AppTabMember", "App_Report__Tag", "App_Report__c",
    "AppDomainVerification", "Application__History", "Application__Share",
    "Application__Tag", "Application__c", "Approval", "Asset", "AssetFeed",
];

const PREVIEW_ROWS = [
    { id: "0171F000005wFv2QQA5", isDeleted: "false", accountId: "0011F00000qiCwUQAU", createdById: "0051F000000kJUMDQA4", createdDate: "2020-07-24 08:55:15.0", field: "Account_Status__c", dataType: "DynamicEnum" },
    { id: "0171F000005wFVhQAK", isDeleted: "false", accountId: "0011F00000qiD7YQAW", createdById: "0051F000000kJUMDQA4", createdDate: "2020-07-24 09:06:35.0", field: "Account_Status__c", dataType: "DynamicEnum" },
];

// ═══════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════
export default function DataPage() {
    const [tab, setTab] = useState<DataTab>("pipeline");
    const [nodes, , onNodesChange] = useNodesState(INIT_NODES);
    const [edges, , onEdgesChange] = useEdgesState(INIT_EDGES);
    const [bottomTab, setBottomTab] = useState("Preview");
    const [bottomOpen, setBottomOpen] = useState(true);
    const [selectedDataset, setSelectedDataset] = useState(DATASETS[0]);
    const [datasetTab, setDatasetTab] = useState("About");
    const [sourceTab, setSourceTab] = useState("Explore source");

    return (
        <div style={{
            display: "flex", flexDirection: "column", height: "100%",
            background: "#F5F8FA", fontFamily: "Inter, sans-serif"
        }}>

            {/* ── TOP BAR ── */}
            <div style={S.topBar}>
                <svg viewBox="0 0 16 16" style={{ width: 16, height: 16 }}>
                    <rect x="1" y="1" width="6" height="6" rx="1" fill="#137CBD" opacity="0.8" />
                    <rect x="9" y="1" width="6" height="6" rx="1" fill="#137CBD" opacity="0.5" />
                    <rect x="1" y="9" width="6" height="6" rx="1" fill="#137CBD" opacity="0.5" />
                    <rect x="9" y="9" width="6" height="6" rx="1" fill="#0D8050" opacity="0.7" />
                </svg>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#182026" }}>Data Layer</span>
                <div style={{ width: 1, height: 16, background: "#CED9E0", margin: "0 4px" }} />

                {/* Sub-tabs */}
                {(["pipeline", "datasets", "sources"] as DataTab[]).map(t => (
                    <button key={t} onClick={() => setTab(t)} style={S.tab(tab === t)}>
                        {t === "pipeline" ? "Pipeline Builder" : t === "datasets" ? "Datasets" : "Connections"}
                    </button>
                ))}

                <div style={{ flex: 1 }} />

                {/* Branch */}
                <div style={{
                    display: "flex", alignItems: "center", gap: 5, padding: "4px 10px",
                    background: "#fff", border: "1px solid #CED9E0", borderRadius: 3,
                    fontSize: 12, color: "#182026", cursor: "pointer"
                }}>
                    <GitBranch style={{ width: 12, height: 12, color: "#5C7080" }} />
                    master
                    <ChevronDown style={{ width: 11, height: 11, color: "#5C7080" }} />
                </div>
                <button style={S.btn()}>
                    <RefreshCw style={{ width: 12, height: 12 }} /> Sync
                </button>
                <button style={S.btn(true)}>
                    Save <ChevronDown style={{ width: 11, height: 11 }} />
                </button>
            </div>

            {/* ── CONTENT ── */}
            <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>

                {/* ── PIPELINE TAB ── */}
                {tab === "pipeline" && (
                    <>
                        {/* Toolbar */}
                        <div style={{
                            display: "flex", alignItems: "center", padding: "0 12px", height: 38,
                            background: "#fff", borderBottom: "1px solid #CED9E0", gap: 2, flexShrink: 0,
                        }}>
                            {["Tools", "Layout", "Undo/redo", "Clean", "Select", "Expand", "Color", "Find", "Remove", "Align"].map(t => (
                                <button key={t} style={{
                                    fontSize: 11, color: "#5C7080", padding: "3px 8px",
                                    cursor: "pointer", border: "none", background: "transparent",
                                    borderRadius: 3
                                }}>
                                    {t}
                                </button>
                            ))}
                            <div style={{ width: 1, height: 16, background: "#CED9E0", margin: "0 6px" }} />
                            {/* Layout / Group / Legend */}
                            {["Layout by color", "Group by color", "Legend"].map(t => (
                                <button key={t} style={{
                                    fontSize: 11, color: "#5C7080", padding: "3px 8px",
                                    cursor: "pointer", border: "none", background: "transparent", borderRadius: 3
                                }}>
                                    {t}
                                </button>
                            ))}
                            <div style={{ flex: 1 }} />
                            <button style={{ ...S.btn(), fontSize: 11 }}>
                                Resource type <ChevronDown style={{ width: 11, height: 11 }} />
                            </button>
                        </div>

                        {/* Legend */}
                        <div style={{
                            display: "flex", alignItems: "center", gap: 16, padding: "6px 16px",
                            background: "#fff", borderBottom: "1px solid #EBF1F5", flexShrink: 0, flexWrap: "wrap"
                        }}>
                            {Object.entries(NODE_COLORS).map(([k, v]) => (
                                <div key={k} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#182026" }}>
                                    <div style={{ width: 12, height: 12, borderRadius: 2, background: v.bg, border: `1.5px solid ${v.border}` }} />
                                    {v.label}
                                </div>
                            ))}
                        </div>

                        {/* Graph + Bottom */}
                        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
                            <div style={{ flex: 1, minHeight: 0 }}>
                                <ReactFlow
                                    nodes={nodes} edges={edges}
                                    onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
                                    nodeTypes={nodeTypes}
                                    fitView
                                    style={{ background: "#F5F8FA" }}>
                                    <Background color="#CED9E0" gap={20} size={1} />
                                    <Controls style={{ background: "#fff", border: "1px solid #CED9E0", borderRadius: 4 }} />
                                    <MiniMap style={{ background: "#EBF1F5", border: "1px solid #CED9E0", borderRadius: 4 }} />
                                </ReactFlow>
                            </div>

                            {/* Bottom panel */}
                            <div style={{
                                background: "#fff", borderTop: "1px solid #CED9E0",
                                height: bottomOpen ? 160 : 36, flexShrink: 0, transition: "height 0.2s"
                            }}>
                                <div style={{
                                    display: "flex", alignItems: "center", padding: "0 12px",
                                    height: 36, borderBottom: "1px solid #EBF1F5", gap: 4
                                }}>
                                    {["Preview", "History", "Code", "Data health", "Build timeline"].map(t => (
                                        <button key={t} onClick={() => setBottomTab(t)} style={S.tab(bottomTab === t)}>
                                            {t}
                                        </button>
                                    ))}
                                    <div style={{ flex: 1 }} />
                                    <button onClick={() => setBottomOpen(v => !v)} style={{ ...S.btn(), border: "none" }}>
                                        {bottomOpen ? <ChevronDown style={{ width: 14, height: 14 }} /> : <ChevronUp style={{ width: 14, height: 14 }} />}
                                    </button>
                                </div>
                                {bottomOpen && (
                                    <div style={{ padding: "10px 16px", fontSize: 12, color: "#5C7080" }}>
                                        {bottomTab === "Preview" && "Select a node to preview its output data."}
                                        {bottomTab === "History" && "No recent build history."}
                                        {bottomTab === "Code" && <code style={{ fontSize: 11, color: "#137CBD" }}>SELECT * FROM drug_claims_golden_table LIMIT 100</code>}
                                        {bottomTab === "Data health" && "All datasets passing quality checks ✓"}
                                        {bottomTab === "Build timeline" && "Last build: Jun 28, 2025 23:49 PM — 2m 14s"}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* ── DATASETS TAB ── */}
                {tab === "datasets" && (
                    <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
                        {/* Left dataset list */}
                        <div style={{
                            width: 220, background: "#fff", borderRight: "1px solid #CED9E0",
                            display: "flex", flexDirection: "column", flexShrink: 0
                        }}>
                            <div style={{ padding: "8px 10px", borderBottom: "1px solid #EBF1F5" }}>
                                <div style={{
                                    display: "flex", alignItems: "center", gap: 6,
                                    background: "#F5F8FA", border: "1px solid #CED9E0", borderRadius: 3,
                                    padding: "4px 8px"
                                }}>
                                    <Search style={{ width: 12, height: 12, color: "#5C7080" }} />
                                    <input placeholder="Filter datasets..." style={{
                                        border: "none", background: "transparent",
                                        fontSize: 12, width: "100%", outline: "none", color: "#182026"
                                    }} />
                                </div>
                            </div>
                            <div style={{ flex: 1, overflowY: "auto" }}>
                                {DATASETS.map(ds => (
                                    <div key={ds.name} onClick={() => setSelectedDataset(ds)}
                                        style={{
                                            padding: "8px 12px", cursor: "pointer", borderBottom: "1px solid #EBF1F5",
                                            background: selectedDataset.name === ds.name ? "rgba(19,124,189,0.06)" : "transparent"
                                        }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            <div style={{
                                                width: 8, height: 8, borderRadius: "50%",
                                                background: ds.status === "healthy" ? "#0D8050" : "#D9822B"
                                            }} />
                                            <span style={{
                                                fontSize: 12, fontWeight: 500, color: "#182026", overflow: "hidden",
                                                textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 150
                                            }}>
                                                {ds.name}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 10, color: "#5C7080", marginTop: 2, paddingLeft: 14 }}>
                                            {ds.type} · {ds.rows} · {ds.cols}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Metadata sidebar */}
                        <div style={{
                            width: 200, background: "#fff", borderRight: "1px solid #CED9E0",
                            display: "flex", flexDirection: "column", flexShrink: 0
                        }}>
                            <div style={{ display: "flex", borderBottom: "1px solid #CED9E0" }}>
                                {["About", "Columns", "Schedules"].map(t => (
                                    <button key={t} onClick={() => setDatasetTab(t)} style={{
                                        flex: 1, fontSize: 11, padding: "8px 0", cursor: "pointer",
                                        border: "none", background: "transparent",
                                        borderBottom: datasetTab === t ? "2px solid #137CBD" : "2px solid transparent",
                                        color: datasetTab === t ? "#137CBD" : "#5C7080", fontWeight: datasetTab === t ? 600 : 400,
                                    }}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                            <div style={{ flex: 1, overflowY: "auto", padding: 12, fontSize: 11 }}>
                                {datasetTab === "About" && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                        <div style={{
                                            padding: "8px", background: "#F5F8FA", borderRadius: 3,
                                            fontSize: 11, color: "#5C7080", lineHeight: 1.5
                                        }}>
                                            Airline reference dataset from Bureau of Transportation Statistics.
                                        </div>
                                        {[
                                            ["Type", selectedDataset.type],
                                            ["Updated", selectedDataset.updated],
                                            ["Rows", selectedDataset.rows],
                                            ["Columns", selectedDataset.cols],
                                            ["Status", selectedDataset.status],
                                        ].map(([k, v]) => (
                                            <div key={k}>
                                                <div style={{ color: "#8A9BA8", fontSize: 10, fontWeight: 600, textTransform: "uppercase", marginBottom: 1 }}>{k}</div>
                                                <div style={{ color: "#182026", fontSize: 12 }}>{v}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {datasetTab === "Columns" && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                        {["iata", "common_name", "bts_airline_id", "start_date_source", "carrier_name", "wac", "region"].map(c => (
                                            <div key={c} style={{
                                                display: "flex", justifyContent: "space-between",
                                                padding: "4px 0", borderBottom: "1px solid #EBF1F5"
                                            }}>
                                                <span style={{ color: "#182026", fontSize: 11 }}>{c}</span>
                                                <span style={{ color: "#8A9BA8", fontSize: 10 }}>String</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {datasetTab === "Schedules" && (
                                    <div style={{ color: "#5C7080", fontSize: 11 }}>No schedules configured.</div>
                                )}
                            </div>
                        </div>

                        {/* Data table */}
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                            {/* Table toolbar */}
                            <div style={{
                                display: "flex", alignItems: "center", padding: "0 12px", height: 38,
                                background: "#fff", borderBottom: "1px solid #CED9E0", gap: 8, flexShrink: 0
                            }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "#182026" }}>
                                    ⬛ {selectedDataset.name}
                                </span>
                                <span style={{ fontSize: 11, color: "#5C7080" }}>
                                    Showing {selectedDataset.rows} · {selectedDataset.cols}
                                </span>
                                <div style={{ flex: 1 }} />
                                <button style={S.btn()}>SQL preview</button>
                                <button style={S.btn()}>Analyze data <ChevronDown style={{ width: 11, height: 11 }} /></button>
                                <button style={S.btn()}>Explore pipeline <ChevronDown style={{ width: 11, height: 11 }} /></button>
                                <button style={S.btn(true)}>Build</button>
                            </div>

                            {/* Tabs */}
                            <div style={{
                                display: "flex", alignItems: "center", padding: "0 12px",
                                height: 34, background: "#fff", borderBottom: "1px solid #CED9E0", gap: 4, flexShrink: 0
                            }}>
                                {["Preview", "History", "Details", "Health ᵝ", "Compare"].map(t => (
                                    <button key={t} style={S.tab(t === "Preview")}>{t}</button>
                                ))}
                            </div>

                            {/* Table */}
                            <div style={{ flex: 1, overflow: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, fontFamily: "monospace" }}>
                                    <thead>
                                        <tr style={{ background: "#F5F8FA", position: "sticky", top: 0 }}>
                                            {["#", "iata\nString", "common_name\nString", "bts_airline_id\nInteger", "carrier_name\nString", "wac\nInteger", "region\nString"].map((h, i) => (
                                                <th key={i} style={{
                                                    padding: "6px 10px", textAlign: "left",
                                                    borderBottom: "1px solid #CED9E0", color: "#5C7080",
                                                    fontWeight: 500, fontSize: 10, whiteSpace: "pre-line",
                                                    borderRight: "1px solid #EBF1F5"
                                                }}>
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {AIRLINES.map((row, i) => (
                                            <tr key={row.iata} style={{
                                                borderBottom: "1px solid #EBF1F5",
                                                background: i % 2 === 0 ? "#fff" : "#FAFBFC"
                                            }}>
                                                <td style={{ padding: "5px 10px", color: "#8A9BA8", borderRight: "1px solid #EBF1F5" }}>{i + 1}</td>
                                                <td style={{ padding: "5px 10px", color: "#137CBD", fontWeight: 600, borderRight: "1px solid #EBF1F5" }}>{row.iata}</td>
                                                <td style={{ padding: "5px 10px", color: "#182026", borderRight: "1px solid #EBF1F5" }}>{row.name}</td>
                                                <td style={{ padding: "5px 10px", color: "#182026", borderRight: "1px solid #EBF1F5" }}>{row.bts}</td>
                                                <td style={{ padding: "5px 10px", color: "#182026", borderRight: "1px solid #EBF1F5", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.carrier}</td>
                                                <td style={{ padding: "5px 10px", color: "#182026", borderRight: "1px solid #EBF1F5" }}>{row.wac}</td>
                                                <td style={{ padding: "5px 10px", color: "#182026" }}>{row.region}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── CONNECTIONS TAB ── */}
                {tab === "sources" && (
                    <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
                        {/* Source list */}
                        <div style={{
                            width: 220, background: "#fff", borderRight: "1px solid #CED9E0",
                            display: "flex", flexDirection: "column", flexShrink: 0
                        }}>
                            <div style={{
                                padding: 10, borderBottom: "1px solid #EBF1F5", fontSize: 12,
                                fontWeight: 600, color: "#182026"
                            }}>Previewing source</div>
                            <div style={{ padding: "6px 10px", borderBottom: "1px solid #EBF1F5" }}>
                                <div style={{
                                    display: "flex", alignItems: "center", gap: 6,
                                    background: "#F5F8FA", border: "1px solid #CED9E0", borderRadius: 3,
                                    padding: "4px 8px"
                                }}>
                                    <Search style={{ width: 12, height: 12, color: "#5C7080" }} />
                                    <input placeholder="Filter by name..." style={{
                                        border: "none", background: "transparent",
                                        fontSize: 12, width: "100%", outline: "none", color: "#182026"
                                    }} />
                                </div>
                            </div>
                            <div style={{ flex: 1, overflowY: "auto" }}>
                                {SOURCE_TABLES.map((t, i) => (
                                    <div key={t} style={{
                                        padding: "6px 12px", fontSize: 11, cursor: "pointer",
                                        color: i === 1 ? "#137CBD" : "#182026",
                                        background: i === 1 ? "rgba(19,124,189,0.06)" : "transparent",
                                        borderBottom: "1px solid #EBF1F5",
                                        display: "flex", alignItems: "center", justifyContent: "space-between",
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                            <Database style={{ width: 11, height: 11, color: "#5C7080" }} />
                                            {t}
                                        </div>
                                        <Plus style={{ width: 12, height: 12, color: "#5C7080" }} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Preview table */}
                        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
                            {/* Info banner */}
                            <div style={{
                                padding: "8px 14px", background: "#EBF4FC", borderBottom: "1px solid #B3D7F5",
                                fontSize: 11, color: "#1F4E79", flexShrink: 0, display: "flex", gap: 6
                            }}>
                                <span style={{ color: "#137CBD" }}>ℹ</span>
                                You are previewing table resources on the remote system that have not been synced to Foundry yet.
                                Start by selecting table resources from the resource list then create a sync.
                            </div>

                            {/* Tab */}
                            <div style={{ display: "flex", background: "#fff", borderBottom: "1px solid #CED9E0", flexShrink: 0 }}>
                                {["Overview", "Connection settings", "Edit syncs", "Explore source"].map(t => (
                                    <button key={t} onClick={() => setSourceTab(t)} style={{
                                        ...S.tab(sourceTab === t), borderBottom: sourceTab === t ? "2px solid #137CBD" : "2px solid transparent",
                                        borderRadius: 0, padding: "8px 14px"
                                    }}>
                                        {t}
                                    </button>
                                ))}
                            </div>

                            <div style={{ flex: 1, overflow: "auto" }}>
                                <div style={{
                                    padding: "6px 12px", background: "#fff", borderBottom: "1px solid #CED9E0",
                                    fontWeight: 600, fontSize: 12, color: "#182026", display: "flex", justifyContent: "space-between"
                                }}>
                                    <span>AccountHistory — Previewing 20 rows · 9 columns</span>
                                    <span style={{ color: "#0D8050", fontSize: 11 }}>✓ Added to Sync</span>
                                </div>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10, fontFamily: "monospace" }}>
                                    <thead>
                                        <tr style={{ background: "#F5F8FA" }}>
                                            {["Id\nVARCHAR", "isDeleted\nBOOLEAN", "AccountId\nVARCHAR", "CreatedById\nVARCHAR", "CreatedDate\nTIMESTAMP", "Field\nVARCHAR", "DataType\nVARCHAR"].map((h, i) => (
                                                <th key={i} style={{
                                                    padding: "5px 8px", textAlign: "left", borderBottom: "1px solid #CED9E0",
                                                    color: "#5C7080", fontWeight: 500, whiteSpace: "pre-line", borderRight: "1px solid #EBF1F5"
                                                }}>
                                                    <div style={{ whiteSpace: "pre-line" }}>{h}</div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {PREVIEW_ROWS.map((row, i) => (
                                            <tr key={i} style={{ borderBottom: "1px solid #EBF1F5" }}>
                                                <td style={{ padding: "4px 8px", borderRight: "1px solid #EBF1F5", color: "#137CBD", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis" }}>{row.id}</td>
                                                <td style={{ padding: "4px 8px", borderRight: "1px solid #EBF1F5" }}>{row.isDeleted}</td>
                                                <td style={{ padding: "4px 8px", borderRight: "1px solid #EBF1F5", color: "#137CBD", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis" }}>{row.accountId}</td>
                                                <td style={{ padding: "4px 8px", borderRight: "1px solid #EBF1F5", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis" }}>{row.createdById}</td>
                                                <td style={{ padding: "4px 8px", borderRight: "1px solid #EBF1F5" }}>{row.createdDate}</td>
                                                <td style={{ padding: "4px 8px", borderRight: "1px solid #EBF1F5" }}>{row.field}</td>
                                                <td style={{ padding: "4px 8px" }}>{row.dataType}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Right: Sync panel */}
                        <div style={{
                            width: 200, background: "#fff", borderLeft: "1px solid #CED9E0",
                            display: "flex", flexDirection: "column", flexShrink: 0, padding: 12, gap: 10
                        }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "#182026" }}>Tables to sync into Foundry</div>
                            <div style={{ fontSize: 11, color: "#5C7080", lineHeight: 1.5 }}>
                                To complete synchronizing the data into Foundry, create a Sync.
                            </div>
                            <button style={{ ...S.btn(true), justifyContent: "center", height: 32 }}>
                                Create sync for 2 datasets →
                            </button>
                            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#182026", cursor: "pointer" }}>
                                <input type="checkbox" defaultChecked /> Run syncs after creating
                            </label>
                            <div style={{ borderTop: "1px solid #EBF1F5", paddingTop: 8 }}>
                                <div style={{ fontSize: 10, fontWeight: 600, color: "#5C7080", marginBottom: 4 }}>QUEUED</div>
                                {["AccountHistory", "User"].map(t => (
                                    <div key={t} style={{
                                        display: "flex", justifyContent: "space-between",
                                        fontSize: 11, color: "#182026", padding: "2px 0"
                                    }}>
                                        {t}
                                        <div style={{ display: "flex", gap: 6 }}>
                                            <span style={{ cursor: "pointer", color: "#5C7080" }}>✎</span>
                                            <span style={{ cursor: "pointer", color: "#5C7080" }}>⊖</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
