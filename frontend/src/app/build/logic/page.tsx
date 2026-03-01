"use client";
import { useState, useCallback } from "react";
import {
    GitBranch, Plus, Play, ChevronDown, ChevronRight,
    X, Check, AlertTriangle, Info, ToggleLeft, ToggleRight,
    Filter, Zap, Database, Link2, Layers, Clock, RefreshCw,
    ArrowRight, Copy, Trash2, Settings
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type LogicBlockType = "filter" | "expression" | "aggregate" | "join";
type RuleStatus = "active" | "draft" | "paused" | "error";
type ConditionOp = "<" | "<=" | ">" | ">=" | "==" | "!=" | "contains" | "is_null" | "not_null";
type LogicOp = "AND" | "OR";

interface Condition {
    id: string;
    field: string;
    op: ConditionOp;
    value: string;
    valid: boolean | null; // null = not validated yet
    error?: string;
}

interface LogicBlock {
    id: string;
    type: LogicBlockType;
    label: string;
    conditions: Condition[];
    logicOp: LogicOp;
}

interface AutomationRule {
    id: string;
    name: string;
    objectType: string;
    trigger: string;
    effect: string;
    status: RuleStatus;
    evaluations: number;
    fires: number;
    lastFired: string;
    blocks: LogicBlock[];
}

// ─── Ontology types available for rules ───────────────────────────────────────
const OBJECT_TYPES = ["Drone", "Mission", "Pilot", "Equipment", "Alert", "WorkOrder"];

const OBJECT_FIELDS: Record<string, { name: string; type: string }[]> = {
    Drone: [{ name: "batteryLevel", type: "number" }, { name: "status", type: "string" }, { name: "flightHours", type: "number" }, { name: "altitude", type: "number" }, { name: "assignedMissionId", type: "string" }],
    Mission: [{ name: "status", type: "string" }, { name: "priority", type: "string" }, { name: "delayMinutes", type: "number" }, { name: "progressPct", type: "number" }],
    Pilot: [{ name: "availability", type: "string" }, { name: "responseTime", type: "number" }, { name: "certificationLevel", type: "string" }],
    Equipment: [{ name: "errorRate", type: "number" }, { name: "downtimeHrs", type: "number" }, { name: "temperature", type: "number" }, { name: "maintenanceDue", type: "boolean" }],
    Alert: [{ name: "severity", type: "string" }, { name: "status", type: "string" }, { name: "openCount", type: "number" }, { name: "resolutionTime", type: "number" }],
    WorkOrder: [{ name: "status", type: "string" }, { name: "priority", type: "string" }, { name: "daysOpen", type: "number" }],
};

const TRIGGERS = [
    "Object property changes",
    "Object created",
    "Object deleted",
    "Time-based schedule",
    "Stream event arrives",
    "Action submitted",
    "Manual trigger",
];

const EFFECTS = [
    "Create Alert object",
    "Submit Action: EscalateMission",
    "Submit Action: CreateWorkOrder",
    "Submit Action: NotifyPilot",
    "Run AIP Logic function",
    "Send webhook notification",
    "Update object property",
];

// ─── Seed rules ───────────────────────────────────────────────────────────────
const SEED_RULES: AutomationRule[] = [
    {
        id: "r1", name: "Low Battery Auto-Alert",
        objectType: "Drone", trigger: "Object property changes",
        effect: "Create Alert object", status: "active",
        evaluations: 28401, fires: 84, lastFired: "2 min ago",
        blocks: [
            {
                id: "b1", type: "filter", label: "Battery Threshold Filter", logicOp: "AND",
                conditions: [
                    { id: "c1", field: "batteryLevel", op: "<", value: "20", valid: true },
                    { id: "c2", field: "status", op: "==", value: "IN_FLIGHT", valid: true },
                ],
            },
        ],
    },
    {
        id: "r2", name: "Mission Escalation",
        objectType: "Mission", trigger: "Object property changes",
        effect: "Submit Action: EscalateMission", status: "active",
        evaluations: 9203, fires: 21, lastFired: "14 min ago",
        blocks: [
            {
                id: "b2", type: "filter", label: "Delay Filter", logicOp: "AND",
                conditions: [
                    { id: "c3", field: "delayMinutes", op: ">", value: "120", valid: true },
                    { id: "c4", field: "priority", op: "==", value: "critical", valid: true },
                ],
            },
        ],
    },
    {
        id: "r3", name: "Maintenance Due Alert",
        objectType: "Equipment", trigger: "Time-based schedule",
        effect: "Submit Action: CreateWorkOrder", status: "paused",
        evaluations: 1204, fires: 5, lastFired: "3 hr ago",
        blocks: [
            {
                id: "b3", type: "filter", label: "Maintenance Filter", logicOp: "OR",
                conditions: [
                    { id: "c5", field: "downtimeHrs", op: ">", value: "8", valid: true },
                    { id: "c6", field: "errorRate", op: ">", value: "0.05", valid: true },
                ],
            },
        ],
    },
    {
        id: "r4", name: "Pilot Response SLA",
        objectType: "Pilot", trigger: "Action submitted",
        effect: "Send webhook notification", status: "draft",
        evaluations: 0, fires: 0, lastFired: "never",
        blocks: [
            {
                id: "b4", type: "filter", label: "SLA Filter", logicOp: "AND",
                conditions: [
                    { id: "c7", field: "responseTime", op: ">", value: "120", valid: null },
                    { id: "c8", field: "availability", op: "==", value: "ON_DUTY", valid: null },
                ],
            },
        ],
    },
];

// ─── Simulation sample data: computed from rule fields, not hardcoded display ──
function simulateRule(rule: AutomationRule): { id: string; values: Record<string, string>; fires: boolean }[] {
    const fields = rule.blocks[0]?.conditions.map(c => c.field) ?? [];
    const seed = rule.id.charCodeAt(1);
    return Array.from({ length: 12 }, (_, i) => {
        // Generate numeric/string values deterministically based on rule seed
        const values: Record<string, string> = {};
        fields.forEach((f, fi) => {
            const base = (seed + i * 7 + fi * 13) % 100;
            values[f] = OBJECT_FIELDS[rule.objectType]?.find(x => x.name === f)?.type === "string"
                ? ["ACTIVE", "IN_FLIGHT", "GROUNDED", "critical", "high", "ON_DUTY"][base % 6]
                : String(base + fi * 5);
        });
        // Fire logic: check all conditions
        let fires = true;
        rule.blocks[0]?.conditions.forEach(c => {
            if (!c.valid) return;
            const v = parseFloat(values[c.field]);
            const t = parseFloat(c.value);
            if (!isNaN(v) && !isNaN(t)) {
                if (c.op === "<" && !(v < t)) fires = false;
                if (c.op === ">" && !(v > t)) fires = false;
                if (c.op === "==" && !(values[c.field] === c.value)) fires = false;
            }
        });
        return { id: `${rule.objectType}-${String(i + 1).padStart(3, "0")}`, values, fires };
    });
}

// ─── Shared styles ─────────────────────────────────────────────────────────────
const btn = (primary = false, danger = false): React.CSSProperties => ({
    height: 28, padding: "0 11px", borderRadius: 3, fontSize: 12, fontWeight: 600,
    cursor: "pointer",
    border: danger ? "1px solid #C23030" : primary ? "none" : "1px solid #CED9E0",
    background: danger ? "rgba(194,48,48,0.08)" : primary ? "#137CBD" : "#fff",
    color: danger ? "#C23030" : primary ? "#fff" : "#394B59",
    display: "flex", alignItems: "center", gap: 5,
});

const BLOCK_ICONS: Record<LogicBlockType, React.ElementType> = {
    filter: Filter, expression: Zap, aggregate: Layers, join: Link2,
};

const BLOCK_COLORS: Record<LogicBlockType, string> = {
    filter: "#137CBD", expression: "#D9822B", aggregate: "#7157D9", join: "#0D8050",
};

const STATUS_STYLE: Record<RuleStatus, [string, string]> = {
    active: ["#E6F7F0", "#0D8050"],
    draft: ["#EBF4FC", "#137CBD"],
    paused: ["#FFF3E0", "#D9822B"],
    error: ["rgba(194,48,48,0.1)", "#C23030"],
};

// ─── Condition Row ─────────────────────────────────────────────────────────────
function ConditionRow({ cond, fields, onChange, onRemove, index, logicOp, totalConds }:
    {
        cond: Condition; fields: { name: string; type: string }[]; onChange: (c: Condition) => void;
        onRemove: () => void; index: number; logicOp: LogicOp; totalConds: number
    }) {

    const validate = (c: Condition): Condition => {
        // inline validation logic
        if (!c.field) return { ...c, valid: false, error: "Field is required" };
        if (!c.value && c.op !== "is_null" && c.op !== "not_null")
            return { ...c, valid: false, error: "Value is required" };
        const fieldType = fields.find(f => f.name === c.field)?.type;
        if (fieldType === "number" && isNaN(Number(c.value)) && c.op !== "is_null" && c.op !== "not_null")
            return { ...c, valid: false, error: "Must be a number" };
        return { ...c, valid: true, error: undefined };
    };

    const numericOps: ConditionOp[] = ["<", "<=", ">", ">=", "==", "!="];
    const stringOps: ConditionOp[] = ["==", "!=", "contains", "is_null", "not_null"];
    const fieldType = fields.find(f => f.name === cond.field)?.type ?? "string";
    const ops = fieldType === "number" ? numericOps : stringOps;

    return (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            {/* AND/OR badge or IF */}
            <div style={{
                width: 36, textAlign: "center", fontSize: 10, fontWeight: 700,
                color: index === 0 ? "#5C7080" : "#137CBD", flexShrink: 0
            }}>
                {index === 0 ? "IF" : logicOp}
            </div>

            {/* Field */}
            <select value={cond.field}
                onChange={e => onChange(validate({ ...cond, field: e.target.value }))}
                style={{
                    flex: 1, padding: "5px 8px", border: `1px solid ${cond.valid === false ? "#C23030" : "#CED9E0"}`,
                    borderRadius: 3, fontSize: 12, background: "#fff", color: "#137CBD", fontWeight: 500
                }}>
                {fields.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
            </select>

            {/* Operator */}
            <select value={cond.op}
                onChange={e => onChange(validate({ ...cond, op: e.target.value as ConditionOp }))}
                style={{
                    width: 90, padding: "5px 6px", border: "1px solid #CED9E0",
                    borderRadius: 3, fontSize: 13, background: "#fff"
                }}>
                {ops.map(o => <option key={o} value={o}>{o}</option>)}
            </select>

            {/* Value */}
            {cond.op !== "is_null" && cond.op !== "not_null" && (
                <input value={cond.value}
                    onChange={e => onChange(validate({ ...cond, value: e.target.value }))}
                    placeholder="value"
                    style={{
                        width: 90, padding: "5px 8px",
                        border: `1px solid ${cond.valid === false ? "#C23030" : "#CED9E0"}`,
                        borderRadius: 3, fontSize: 12, background: "#fff"
                    }} />
            )}

            {/* Inline validation badge */}
            <div style={{ width: 18, flexShrink: 0 }}>
                {cond.valid === true && <Check style={{ width: 13, height: 13, color: "#0D8050" }} />}
                {cond.valid === false && <AlertTriangle style={{ width: 13, height: 13, color: "#C23030" }} />}
            </div>

            {/* Tooltip error */}
            {cond.valid === false && (
                <span style={{ fontSize: 10, color: "#C23030", whiteSpace: "nowrap" }}>{cond.error}</span>
            )}

            {/* Remove */}
            {totalConds > 1 && (
                <button onClick={onRemove} style={{
                    ...btn(false, false), padding: "0 4px",
                    border: "none", background: "transparent", color: "#8A9BA8"
                }}>
                    <X style={{ width: 12, height: 12 }} />
                </button>
            )}
        </div>
    );
}

// ─── Logic Block ───────────────────────────────────────────────────────────────
function LogicBlockCard({ block, objType, onUpdate, onRemove }:
    { block: LogicBlock; objType: string; onUpdate: (b: LogicBlock) => void; onRemove: () => void }) {

    const fields = OBJECT_FIELDS[objType] ?? [];
    const Icon = BLOCK_ICONS[block.type];
    const color = BLOCK_COLORS[block.type];

    const addCond = () => {
        const newCond: Condition = {
            id: `c${Date.now()}`, field: fields[0]?.name ?? "", op: ">", value: "", valid: null,
        };
        onUpdate({ ...block, conditions: [...block.conditions, newCond] });
    };

    const updateCond = (idx: number, c: Condition) => {
        const conditions = [...block.conditions];
        conditions[idx] = c;
        onUpdate({ ...block, conditions });
    };

    const removeCond = (idx: number) => {
        onUpdate({ ...block, conditions: block.conditions.filter((_, i) => i !== idx) });
    };

    const hasErrors = block.conditions.some(c => c.valid === false);

    return (
        <div style={{
            background: "#fff", border: `1px solid ${hasErrors ? "#C23030" : "#CED9E0"}`,
            borderRadius: 4, marginBottom: 12, overflow: "hidden"
        }}>
            {/* Block header */}
            <div style={{
                display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
                background: `rgba(${color === "#137CBD" ? "19,124,189" : color === "#D9822B" ? "217,130,43" : color === "#7157D9" ? "113,87,217" : "13,128,80"},0.06)`,
                borderBottom: "1px solid #EBF1F5"
            }}>
                <div style={{
                    width: 22, height: 22, borderRadius: 4, background: color + "20",
                    display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                    <Icon style={{ width: 13, height: 13, color }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#182026", flex: 1 }}>{block.label}</span>
                <span style={{
                    fontSize: 10, padding: "1px 6px", borderRadius: 3, background: color + "15",
                    color, fontWeight: 700, textTransform: "uppercase" as const
                }}>{block.type}</span>

                {/* AND / OR toggle */}
                <button onClick={() => onUpdate({ ...block, logicOp: block.logicOp === "AND" ? "OR" : "AND" })}
                    style={{ ...btn(), padding: "0 8px", height: 22, fontSize: 10 }}>
                    {block.logicOp}
                </button>
                <button onClick={onRemove} style={{
                    ...btn(false, false), padding: "0 4px", border: "none",
                    background: "transparent", color: "#8A9BA8", height: "auto"
                }}>
                    <Trash2 style={{ width: 12, height: 12 }} />
                </button>
            </div>

            {/* Conditions */}
            <div style={{ padding: "10px 14px" }}>
                {block.conditions.map((c, i) => (
                    <ConditionRow key={c.id} cond={c} fields={fields} index={i}
                        logicOp={block.logicOp} totalConds={block.conditions.length}
                        onChange={nc => updateCond(i, nc)}
                        onRemove={() => removeCond(i)} />
                ))}
                <button onClick={addCond} style={{ ...btn(), fontSize: 11, height: 24, marginTop: 2 }}>
                    <Plus style={{ width: 11, height: 11 }} /> Add condition
                </button>
            </div>
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function LogicPage() {
    const [rules, setRules] = useState<AutomationRule[]>(SEED_RULES);
    const [sel, setSel] = useState<AutomationRule>(SEED_RULES[0]);
    const [rightTab, setRightTab] = useState<"builder" | "simulation" | "settings">("builder");
    const [simRan, setSimRan] = useState(false);
    const [simResults, setSimResults] = useState<ReturnType<typeof simulateRule>>([]);

    const updateSel = useCallback((r: AutomationRule) => {
        setSel(r);
        setRules(prev => prev.map(x => x.id === r.id ? r : x));
    }, []);

    const toggleStatus = () => {
        const next: RuleStatus = sel.status === "active" ? "paused" : "active";
        updateSel({ ...sel, status: next });
    };

    const updateBlock = (idx: number, b: LogicBlock) => {
        const blocks = [...sel.blocks];
        blocks[idx] = b;
        updateSel({ ...sel, blocks });
    };

    const removeBlock = (idx: number) => {
        updateSel({ ...sel, blocks: sel.blocks.filter((_, i) => i !== idx) });
    };

    const addBlock = (type: LogicBlockType) => {
        const fields = OBJECT_FIELDS[sel.objectType];
        const newBlock: LogicBlock = {
            id: `b${Date.now()}`, type,
            label: `${type.charAt(0).toUpperCase() + type.slice(1)} Block`,
            logicOp: "AND",
            conditions: [{ id: `c${Date.now()}`, field: fields?.[0]?.name ?? "", op: ">", value: "", valid: null }],
        };
        updateSel({ ...sel, blocks: [...sel.blocks, newBlock] });
    };

    const runSimulation = () => {
        setSimResults(simulateRule(sel));
        setSimRan(true);
        setRightTab("simulation");
    };

    const allValid = sel.blocks.every(b => b.conditions.every(c => c.valid === true));
    const hasErrors = sel.blocks.some(b => b.conditions.some(c => c.valid === false));

    const [statusBg, statusFg] = STATUS_STYLE[sel.status];

    return (
        <div style={{
            display: "flex", flexDirection: "column", height: "100%",
            background: "#F5F8FA", fontFamily: "Inter, sans-serif"
        }}>

            {/* ── Top bar ───────────────────────────────────────────────────────── */}
            <div style={{
                height: 44, display: "flex", alignItems: "center", padding: "0 14px",
                background: "#fff", borderBottom: "1px solid #CED9E0", gap: 8, flexShrink: 0
            }}>
                <GitBranch style={{ width: 16, height: 16, color: "#137CBD" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#182026" }}>Logic</span>
                <div style={{ width: 1, height: 16, background: "#CED9E0", margin: "0 4px" }} />
                <span style={{ fontSize: 11, color: "#5C7080" }}>Automation Rules · Foundry Rules Engine</span>
                <div style={{ flex: 1 }} />
                <button style={btn()}><RefreshCw style={{ width: 12, height: 12 }} /> Refresh</button>
                <button onClick={() => {
                    const r: AutomationRule = {
                        id: `r${Date.now()}`, name: "New Rule",
                        objectType: "Drone", trigger: TRIGGERS[0], effect: EFFECTS[0],
                        status: "draft", evaluations: 0, fires: 0, lastFired: "never",
                        blocks: [],
                    };
                    setRules(prev => [...prev, r]);
                    setSel(r);
                }} style={btn(true)}>
                    <Plus style={{ width: 13, height: 13 }} /> New Rule
                </button>
            </div>

            <div style={{ flex: 1, display: "flex", minHeight: 0 }}>

                {/* ── Rule List ──────────────────────────────────────────────────── */}
                <div style={{
                    width: 265, background: "#fff", borderRight: "1px solid #CED9E0",
                    display: "flex", flexDirection: "column", flexShrink: 0
                }}>
                    <div style={{
                        padding: "8px 12px", fontSize: 10, fontWeight: 700, color: "#5C7080",
                        letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: "1px solid #EBF1F5"
                    }}>
                        Automation Rules ({rules.length})
                    </div>
                    <div style={{ flex: 1, overflowY: "auto" }}>
                        {rules.map(r => {
                            const [bg, fg] = STATUS_STYLE[r.status];
                            return (
                                <div key={r.id} onClick={() => { setSel(r); setSimRan(false); }}
                                    style={{
                                        padding: "10px 12px", cursor: "pointer", borderBottom: "1px solid #EBF1F5",
                                        borderLeft: sel.id === r.id ? "2px solid #137CBD" : "2px solid transparent",
                                        background: sel.id === r.id ? "rgba(19,124,189,0.04)" : "transparent"
                                    }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: "#182026", flex: 1 }}>{r.name}</span>
                                        <span style={{
                                            fontSize: 9, padding: "1px 6px", borderRadius: 10, fontWeight: 700,
                                            background: bg, color: fg, whiteSpace: "nowrap", marginLeft: 6
                                        }}>
                                            {r.status}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 10, color: "#5C7080", marginTop: 2 }}>
                                        {r.objectType} · {r.trigger.split(" ").slice(0, 2).join(" ")}
                                    </div>
                                    <div style={{ display: "flex", gap: 10, marginTop: 3, fontSize: 10, color: "#8A9BA8" }}>
                                        <span>{r.evaluations.toLocaleString()} evals</span>
                                        <span style={{ color: r.fires > 0 ? "#C23030" : "#8A9BA8" }}>{r.fires} fires</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Right Panel ────────────────────────────────────────────────── */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

                    {/* Rule header bar */}
                    <div style={{
                        display: "flex", alignItems: "center", gap: 8, padding: "0 16px",
                        height: 44, background: "#fff", borderBottom: "1px solid #CED9E0", flexShrink: 0
                    }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#182026" }}>{sel.name}</span>
                        <span style={{ fontSize: 11, color: "#8A9BA8" }}>·</span>
                        <span style={{ fontSize: 11, color: "#5C7080" }}>{sel.objectType}</span>
                        <div style={{ flex: 1 }} />

                        {/* Activation toggle */}
                        <button onClick={toggleStatus} style={{
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "4px 10px", borderRadius: 3, cursor: "pointer", fontWeight: 600, fontSize: 12,
                            border: `1px solid ${sel.status === "active" ? "#0D8050" : "#CED9E0"}`,
                            background: sel.status === "active" ? "#E6F7F0" : "#fff",
                            color: sel.status === "active" ? "#0D8050" : "#5C7080"
                        }}>
                            {sel.status === "active"
                                ? <ToggleRight style={{ width: 16, height: 16 }} />
                                : <ToggleLeft style={{ width: 16, height: 16 }} />}
                            {sel.status === "active" ? "Active" : sel.status === "paused" ? "Paused" : sel.status}
                        </button>

                        {/* Validation status */}
                        {allValid && sel.blocks.length > 0 && (
                            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#0D8050" }}>
                                <Check style={{ width: 13, height: 13 }} /> Valid
                            </div>
                        )}
                        {hasErrors && (
                            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#C23030" }}>
                                <AlertTriangle style={{ width: 13, height: 13 }} /> Fix errors
                            </div>
                        )}

                        <button onClick={runSimulation} style={btn()}>
                            <Play style={{ width: 12, height: 12 }} /> Run Simulation
                        </button>
                        <button style={btn(true)} disabled={hasErrors || sel.blocks.length === 0}>
                            Save Rule
                        </button>
                    </div>

                    {/* Tab bar */}
                    <div style={{
                        display: "flex", background: "#fff", borderBottom: "1px solid #CED9E0",
                        padding: "0 4px", flexShrink: 0
                    }}>
                        {(["builder", "simulation", "settings"] as const).map(t => (
                            <button key={t} onClick={() => setRightTab(t)} style={{
                                fontSize: 12, padding: "6px 14px", cursor: "pointer", border: "none",
                                background: "transparent",
                                borderBottom: rightTab === t ? "2px solid #137CBD" : "2px solid transparent",
                                color: rightTab === t ? "#137CBD" : "#5C7080",
                                fontWeight: rightTab === t ? 600 : 400,
                                textTransform: "capitalize",
                            }}>{t === "simulation" ? "Simulation" : t === "builder" ? "Condition Builder" : "Settings"}</button>
                        ))}
                        <div style={{ flex: 1 }} />
                        {/* Stats */}
                        <div style={{
                            display: "flex", alignItems: "center", gap: 12, padding: "0 12px",
                            fontSize: 11, color: "#5C7080"
                        }}>
                            <span>⏱ {sel.lastFired}</span>
                            <span style={{ color: sel.fires > 0 ? "#C23030" : "#5C7080" }}>🔥 {sel.fires} fires</span>
                        </div>
                    </div>

                    <div style={{ flex: 1, overflow: "auto", padding: 20 }}>

                        {/* ── CONDITION BUILDER ── */}
                        {rightTab === "builder" && (
                            <div style={{ maxWidth: 720 }}>
                                {/* Trigger + Effect banner */}
                                <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                                    <div style={{
                                        flex: 1, padding: 12, background: "#fff", border: "1px solid #CED9E0",
                                        borderRadius: 4
                                    }}>
                                        <label style={{
                                            fontSize: 10, fontWeight: 700, color: "#5C7080",
                                            textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 4
                                        }}>
                                            Trigger (WHEN)
                                        </label>
                                        <select value={sel.trigger}
                                            onChange={e => updateSel({ ...sel, trigger: e.target.value })}
                                            style={{
                                                width: "100%", padding: "6px 10px", border: "1px solid #CED9E0",
                                                borderRadius: 3, fontSize: 12, background: "#fff"
                                            }}>
                                            {TRIGGERS.map(t => <option key={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <ArrowRight style={{ width: 18, height: 18, color: "#5C7080" }} />
                                    </div>
                                    <div style={{
                                        flex: 1, padding: 12, background: "#fff", border: "1px solid #CED9E0",
                                        borderRadius: 4
                                    }}>
                                        <label style={{
                                            fontSize: 10, fontWeight: 700, color: "#5C7080",
                                            textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 4
                                        }}>
                                            Effect (THEN)
                                        </label>
                                        <select value={sel.effect}
                                            onChange={e => updateSel({ ...sel, effect: e.target.value })}
                                            style={{
                                                width: "100%", padding: "6px 10px", border: "1px solid #CED9E0",
                                                borderRadius: 3, fontSize: 12, background: "#fff", color: "#0D8050", fontWeight: 600
                                            }}>
                                            {EFFECTS.map(e => <option key={e}>{e}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Object type + scope */}
                                <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                                    <div style={{ flex: 1, padding: 12, background: "#fff", border: "1px solid #CED9E0", borderRadius: 4 }}>
                                        <label style={{
                                            fontSize: 10, fontWeight: 700, color: "#5C7080",
                                            textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 4
                                        }}>
                                            Object Type (Scope)
                                        </label>
                                        <select value={sel.objectType}
                                            onChange={e => updateSel({
                                                ...sel, objectType: e.target.value,
                                                blocks: sel.blocks.map(b => ({
                                                    ...b,
                                                    conditions: b.conditions.map(c => ({
                                                        ...c,
                                                        field: OBJECT_FIELDS[e.target.value]?.[0]?.name ?? "", valid: null
                                                    }))
                                                }))
                                            })}
                                            style={{
                                                width: "100%", padding: "6px 10px", border: "1px solid #CED9E0",
                                                borderRadius: 3, fontSize: 12, background: "#fff"
                                            }}>
                                            {OBJECT_TYPES.map(o => <option key={o}>{o}</option>)}
                                        </select>
                                    </div>
                                    <div style={{ flex: 1, padding: 12, background: "#fff", border: "1px solid #CED9E0", borderRadius: 4 }}>
                                        <label style={{
                                            fontSize: 10, fontWeight: 700, color: "#5C7080",
                                            textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 4
                                        }}>
                                            Execution Mode
                                        </label>
                                        <select style={{
                                            width: "100%", padding: "6px 10px", border: "1px solid #CED9E0",
                                            borderRadius: 3, fontSize: 12, background: "#fff"
                                        }}>
                                            <option>Incremental (new objects only)</option>
                                            <option>Full scan (all objects)</option>
                                            <option>Manual trigger only</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Logic Blocks */}
                                <div style={{
                                    fontSize: 11, fontWeight: 700, color: "#5C7080",
                                    textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10
                                }}>
                                    IF Conditions
                                </div>

                                {sel.blocks.length === 0 && (
                                    <div style={{
                                        padding: 20, background: "#fff", border: "1px dashed #CED9E0",
                                        borderRadius: 4, textAlign: "center", color: "#5C7080", fontSize: 12, marginBottom: 12
                                    }}>
                                        No condition blocks yet. Add a block below to define your rule logic.
                                    </div>
                                )}

                                {sel.blocks.map((b, i) => (
                                    <div key={b.id}>
                                        <LogicBlockCard block={b} objType={sel.objectType}
                                            onUpdate={nb => updateBlock(i, nb)}
                                            onRemove={() => removeBlock(i)} />
                                        {i < sel.blocks.length - 1 && (
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                                                <div style={{ flex: 1, height: 1, background: "#EBF1F5" }} />
                                                <span style={{
                                                    fontSize: 10, fontWeight: 700, color: "#137CBD",
                                                    padding: "2px 8px", border: "1px solid #137CBD",
                                                    borderRadius: 3, background: "#EBF4FC"
                                                }}>AND</span>
                                                <div style={{ flex: 1, height: 1, background: "#EBF1F5" }} />
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Add block */}
                                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                                    {(["filter", "expression", "aggregate", "join"] as LogicBlockType[]).map(type => {
                                        const Icon = BLOCK_ICONS[type];
                                        const color = BLOCK_COLORS[type];
                                        return (
                                            <button key={type} onClick={() => addBlock(type)} style={{
                                                display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                                                border: `1px dashed ${color}`, borderRadius: 3, cursor: "pointer",
                                                background: `${color}08`, color,
                                                fontSize: 11, fontWeight: 600,
                                            }}>
                                                <Icon style={{ width: 12, height: 12 }} />
                                                + {type}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Rule preview */}
                                {sel.blocks.length > 0 && (
                                    <div style={{
                                        marginTop: 16, padding: 12, background: "#F5F8FA",
                                        border: "1px solid #EBF1F5", borderRadius: 4
                                    }}>
                                        <div style={{
                                            fontSize: 10, fontWeight: 700, color: "#5C7080",
                                            textTransform: "uppercase", marginBottom: 6
                                        }}>Rule Preview</div>
                                        <code style={{ fontSize: 11, color: "#182026", lineHeight: 1.8 }}>
                                            <span style={{ color: "#D9822B", fontWeight: 700 }}>WHEN</span>{" "}
                                            <span style={{ color: "#137CBD" }}>{sel.trigger}</span>{" "}
                                            <span style={{ color: "#D9822B", fontWeight: 700 }}>ON</span>{" "}
                                            <span style={{ color: "#7157D9" }}>{sel.objectType}</span>
                                            <br />
                                            {sel.blocks.map((b, bi) => (
                                                <span key={b.id}>
                                                    {bi > 0 && <><span style={{ color: "#D9822B", fontWeight: 700 }}> AND </span></>}
                                                    <span style={{ color: "#D9822B", fontWeight: 700 }}>IF </span>
                                                    {b.conditions.map((c, ci) => (
                                                        <span key={c.id}>
                                                            {ci > 0 && <span style={{ color: "#137CBD", fontWeight: 700 }}> {b.logicOp} </span>}
                                                            <span style={{ color: "#7157D9" }}>{c.field}</span>
                                                            {" "}<span style={{ color: "#C23030" }}>{c.op}</span>
                                                            {" "}<span style={{ color: "#0D8050" }}>{c.value}</span>
                                                        </span>
                                                    ))}
                                                    <br />
                                                </span>
                                            ))}
                                            <span style={{ color: "#D9822B", fontWeight: 700 }}>THEN </span>
                                            <span style={{ color: "#0D8050", fontWeight: 600 }}>{sel.effect}</span>
                                        </code>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── SIMULATION ── */}
                        {rightTab === "simulation" && (
                            <div style={{ maxWidth: 780 }}>
                                {/* Backtest header */}
                                <div style={{
                                    display: "flex", alignItems: "center", gap: 12, marginBottom: 16,
                                    padding: 14, background: "#fff", border: "1px solid #CED9E0", borderRadius: 4
                                }}>
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: "#182026" }}>Backtest on Historical Data</span>
                                        <span style={{ fontSize: 11, color: "#5C7080", marginTop: 2 }}>
                                            Simulate rule logic against existing {sel.objectType} objects before activating.
                                        </span>
                                    </div>
                                    <div style={{ flex: 1 }} />
                                    <select style={{ padding: "5px 8px", border: "1px solid #CED9E0", borderRadius: 3, fontSize: 12 }}>
                                        <option>Last 7 days</option>
                                        <option>Last 30 days</option>
                                        <option>Last 90 days</option>
                                    </select>
                                    <button onClick={runSimulation} style={btn(true)}>
                                        <Play style={{ width: 12, height: 12 }} /> Run
                                    </button>
                                </div>

                                {!simRan ? (
                                    <div style={{
                                        padding: 32, textAlign: "center", color: "#5C7080",
                                        background: "#fff", border: "1px dashed #CED9E0", borderRadius: 4
                                    }}>
                                        <Play style={{ width: 32, height: 32, marginBottom: 8, opacity: 0.3 }} />
                                        <div style={{ fontSize: 13, fontWeight: 600 }}>No simulation run yet</div>
                                        <div style={{ fontSize: 11, marginTop: 4 }}>Click "Run Simulation" to backtest against historical data</div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Summary stats */}
                                        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                                            {[
                                                ["Objects Evaluated", simResults.length, "#182026"],
                                                ["Would Fire", simResults.filter(r => r.fires).length, "#C23030"],
                                                ["Pass", simResults.filter(r => !r.fires).length, "#0D8050"],
                                                ["Fire Rate", `${((simResults.filter(r => r.fires).length / simResults.length) * 100).toFixed(0)}%`, "#D9822B"],
                                            ].map(([label, val, color]) => (
                                                <div key={String(label)} style={{
                                                    flex: 1, padding: 12, background: "#fff",
                                                    border: "1px solid #CED9E0", borderRadius: 4, textAlign: "center"
                                                }}>
                                                    <div style={{ fontSize: 20, fontWeight: 700, color: String(color) }}>{val}</div>
                                                    <div style={{ fontSize: 10, color: "#5C7080", marginTop: 2 }}>{label}</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Warning banner */}
                                        <div style={{
                                            marginBottom: 12, padding: "8px 12px", background: "#EBF4FC",
                                            border: "1px solid #B3D7F5", borderRadius: 4, display: "flex", gap: 8
                                        }}>
                                            <Info style={{ width: 14, height: 14, color: "#137CBD", flexShrink: 0 }} />
                                            <span style={{ fontSize: 12, color: "#1F4E79" }}>
                                                This simulation uses sampled object data. Actual production results may differ.
                                                Activate the rule only after reviewing the fire rate.
                                            </span>
                                        </div>

                                        {/* Results table */}
                                        <div style={{ background: "#fff", border: "1px solid #CED9E0", borderRadius: 4, overflow: "hidden" }}>
                                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, fontFamily: "monospace" }}>
                                                <thead>
                                                    <tr style={{ background: "#F5F8FA" }}>
                                                        <th style={{
                                                            padding: "8px 12px", textAlign: "left", borderBottom: "1px solid #CED9E0",
                                                            color: "#5C7080", fontWeight: 600, borderRight: "1px solid #EBF1F5"
                                                        }}>Object ID</th>
                                                        {sel.blocks[0]?.conditions.map(c => (
                                                            <th key={c.id} style={{
                                                                padding: "8px 10px", textAlign: "left",
                                                                borderBottom: "1px solid #CED9E0", color: "#5C7080",
                                                                fontWeight: 600, borderRight: "1px solid #EBF1F5"
                                                            }}>
                                                                {c.field}
                                                            </th>
                                                        ))}
                                                        <th style={{
                                                            padding: "8px 12px", textAlign: "center",
                                                            borderBottom: "1px solid #CED9E0", color: "#5C7080", fontWeight: 600
                                                        }}>Result</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {simResults.map((row, i) => (
                                                        <tr key={row.id} style={{
                                                            borderBottom: "1px solid #EBF1F5",
                                                            background: i % 2 === 0 ? "#fff" : "#FAFBFC"
                                                        }}>
                                                            <td style={{
                                                                padding: "6px 12px", color: "#137CBD",
                                                                borderRight: "1px solid #EBF1F5", fontWeight: 500
                                                            }}>{row.id}</td>
                                                            {sel.blocks[0]?.conditions.map(c => (
                                                                <td key={c.id} style={{
                                                                    padding: "6px 10px",
                                                                    borderRight: "1px solid #EBF1F5", color: "#182026"
                                                                }}>
                                                                    {row.values[c.field] ?? "—"}
                                                                </td>
                                                            ))}
                                                            <td style={{ padding: "6px 12px", textAlign: "center" }}>
                                                                {row.fires
                                                                    ? <span style={{ color: "#C23030", fontWeight: 700, fontSize: 10 }}>🔥 FIRES</span>
                                                                    : <span style={{ color: "#0D8050", fontWeight: 700, fontSize: 10 }}>✓ PASS</span>}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* ── SETTINGS ── */}
                        {rightTab === "settings" && (
                            <div style={{ maxWidth: 500, display: "flex", flexDirection: "column", gap: 14 }}>
                                {[
                                    ["Rule Name", <input key="name" value={sel.name}
                                        onChange={e => updateSel({ ...sel, name: e.target.value })}
                                        style={{
                                            width: "100%", padding: "6px 10px", border: "1px solid #CED9E0",
                                            borderRadius: 3, fontSize: 13, background: "#fff"
                                        }} />],
                                    ["Status", <select key="status" value={sel.status}
                                        onChange={e => updateSel({ ...sel, status: e.target.value as RuleStatus })}
                                        style={{
                                            width: "100%", padding: "6px 10px", border: "1px solid #CED9E0",
                                            borderRadius: 3, fontSize: 12, background: "#fff"
                                        }}>
                                        {["active", "draft", "paused"].map(s => <option key={s}>{s}</option>)}
                                    </select>],
                                ].map(([label, control]) => (
                                    <div key={String(label)}>
                                        <label style={{
                                            fontSize: 10, fontWeight: 700, color: "#5C7080", display: "block",
                                            marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em"
                                        }}>{label}</label>
                                        {control}
                                    </div>
                                ))}

                                <div style={{ padding: 12, background: "#fff", border: "1px solid #CED9E0", borderRadius: 4 }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: "#182026", marginBottom: 8 }}>Evaluation Stats</div>
                                    {[
                                        ["Total Evaluations", sel.evaluations.toLocaleString()],
                                        ["Total Fires", sel.fires],
                                        ["Last Fired", sel.lastFired],
                                        ["Fire Rate", sel.evaluations > 0 ? `${((sel.fires / sel.evaluations) * 100).toFixed(2)}%` : "N/A"],
                                    ].map(([k, v]) => (
                                        <div key={String(k)} style={{
                                            display: "flex", justifyContent: "space-between",
                                            padding: "4px 0", borderBottom: "1px solid #EBF1F5", fontSize: 12
                                        }}>
                                            <span style={{ color: "#5C7080" }}>{k}</span>
                                            <span style={{ color: "#182026", fontWeight: 500 }}>{v}</span>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: "flex", gap: 8 }}>
                                    <button style={btn(true)}>Save Settings</button>
                                    <button style={btn(false, true)}>
                                        <Trash2 style={{ width: 12, height: 12 }} /> Delete Rule
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
