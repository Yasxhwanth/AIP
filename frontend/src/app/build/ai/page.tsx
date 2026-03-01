"use client";
import { useState, useRef, useEffect } from "react";
import {
    Brain, Plus, Shield, Check, X, AlertTriangle, Info,
    ChevronDown, Play, RefreshCw, Eye, Lock, Zap, Database,
    GitBranch, Terminal, Settings, Users, ToggleLeft, ToggleRight,
    MessageSquare, AlertCircle, Clock, Cpu
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type AgentType = "standard" | "assist";
type ToolType = "object-query" | "action" | "function" | "command";
type GuardrailLevel = "strict" | "moderate" | "permissive";
type AccessMode = "read" | "write" | "none";
type MsgRole = "user" | "agent" | "tool-call" | "tool-result";

interface OntologyAccess {
    objectType: string;
    read: boolean;
    write: boolean;
    properties: string[];
    allowedWriteProperties: string[];
}

interface AgentTool {
    id: string;
    type: ToolType;
    name: string;
    description: string;
    enabled: boolean;
    requiresApproval: boolean;
}

interface Guardrail {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    value?: number;
    max?: number;
    unit?: string;
}

interface ConsoleMsg {
    id: string;
    role: MsgRole;
    content: string;
    toolName?: string;
    approved?: boolean;
    timestamp: string;
}

interface AIPAgent {
    id: string;
    name: string;
    type: AgentType;
    model: string;
    temperature: number;
    systemPrompt: string;
    status: "active" | "draft" | "deprecated";
    ontologyAccess: OntologyAccess[];
    tools: AgentTool[];
    guardrails: Guardrail[];
}

// ── Constants ─────────────────────────────────────────────────────────────────
const MODELS = ["gpt-4o", "gpt-4o-mini", "claude-3-5-sonnet", "claude-3-haiku", "gemini-1.5-pro", "gemini-1.5-flash", "llama-3.1-405b"];

const OBJECT_TYPES_META: Record<string, string[]> = {
    Drone: ["id", "batteryLevel", "status", "altitude", "speed", "assignedMissionId"],
    Mission: ["id", "name", "status", "priority", "progressPct", "delayMinutes", "assignedPilotId"],
    Pilot: ["id", "name", "availability", "responseTime", "certificationLevel"],
    Equipment: ["id", "type", "errorRate", "downtimeHrs", "temperature", "maintenanceDue"],
    Alert: ["id", "severity", "status", "message", "openCount", "resolutionTime"],
    WorkOrder: ["id", "status", "priority", "description", "dueDate", "assignedTo"],
};

// ── Seed agents ───────────────────────────────────────────────────────────────
const SEED_AGENTS: AIPAgent[] = [
    {
        id: "ag1", name: "Mission Ops Assistant", type: "assist",
        model: "gpt-4o", temperature: 0.2, status: "active",
        systemPrompt: "You are an intelligent mission operations assistant. Analyze drone and mission data from the Ontology, surface actionable insights, and suggest (never auto-execute) remediation actions. Always explain your reasoning before proposing an action.",
        ontologyAccess: [
            { objectType: "Drone", read: true, write: false, properties: ["id", "batteryLevel", "status", "altitude", "speed", "assignedMissionId"], allowedWriteProperties: [] },
            { objectType: "Mission", read: true, write: true, properties: ["id", "name", "status", "priority", "progressPct", "delayMinutes", "assignedPilotId"], allowedWriteProperties: ["priority", "status"] },
            { objectType: "Alert", read: true, write: true, properties: ["id", "severity", "status", "message", "openCount", "resolutionTime"], allowedWriteProperties: ["status"] },
            { objectType: "Pilot", read: true, write: false, properties: ["id", "name", "availability", "responseTime"], allowedWriteProperties: [] },
        ],
        tools: [
            { id: "t1", type: "object-query", name: "QueryDrones", description: "Retrieve drone objects and their properties", enabled: true, requiresApproval: false },
            { id: "t2", type: "object-query", name: "QueryMissions", description: "Retrieve mission objects and their properties", enabled: true, requiresApproval: false },
            { id: "t3", type: "action", name: "EscalateMission", description: "Escalate a mission — requires human approval", enabled: true, requiresApproval: true },
            { id: "t4", type: "action", name: "CreateWorkOrder", description: "Create maintenance work order — requires human approval", enabled: true, requiresApproval: true },
            { id: "t5", type: "function", name: "ComputeRiskScore", description: "AIP Logic function: compute mission risk 0-100", enabled: true, requiresApproval: false },
            { id: "t6", type: "command", name: "OpenAlert", description: "Navigate user to alert detail view", enabled: false, requiresApproval: false },
        ],
        guardrails: [
            { id: "g1", name: "Max Output Tokens", description: "Hard cap on LLM output length", enabled: true, value: 2048, max: 8192, unit: "tokens" },
            { id: "g2", name: "Content Safety Filter", description: "Block harmful or inappropriate content", enabled: true },
            { id: "g3", name: "PII Redaction", description: "Auto-redact personally identifiable info", enabled: true },
            { id: "g4", name: "Rate Limit", description: "Max requests per user per hour", enabled: true, value: 60, max: 500, unit: "req/hr" },
            { id: "g5", name: "Auto-Execute Actions", description: "Allow agent to submit actions without approval", enabled: false },
            { id: "g6", name: "Max Context Window", description: "Maximum tokens in conversation context", enabled: true, value: 32000, max: 128000, unit: "tokens" },
        ],
    },
    {
        id: "ag2", name: "Equipment Diagnostics AI", type: "standard",
        model: "claude-3-5-sonnet", temperature: 0.1, status: "active",
        systemPrompt: "You are an equipment diagnostics expert. Analyze sensor data, identify anomalies, and recommend preventive maintenance. Never modify equipment records directly — always surface a work order suggestion for human review.",
        ontologyAccess: [
            { objectType: "Equipment", read: true, write: false, properties: ["id", "type", "errorRate", "downtimeHrs", "temperature", "maintenanceDue"], allowedWriteProperties: [] },
            { objectType: "WorkOrder", read: true, write: true, properties: ["id", "status", "priority", "description", "dueDate", "assignedTo"], allowedWriteProperties: ["priority", "status"] },
        ],
        tools: [
            { id: "t7", type: "object-query", name: "QueryEquipment", description: "Retrieve equipment sensor data", enabled: true, requiresApproval: false },
            { id: "t8", type: "function", name: "AnomalyDetection", description: "AIP Logic: ML anomaly detection on metrics", enabled: true, requiresApproval: false },
            { id: "t9", type: "action", name: "CreateWorkOrder", description: "Suggest maintenance work order", enabled: true, requiresApproval: true },
        ],
        guardrails: [
            { id: "g7", name: "Max Output Tokens", description: "Hard cap on output", enabled: true, value: 1024, max: 8192, unit: "tokens" },
            { id: "g8", name: "Content Safety Filter", description: "Block harmful content", enabled: true },
            { id: "g9", name: "Auto-Execute Actions", description: "Allow direct Ontology writes without human approval", enabled: false },
        ],
    },
    {
        id: "ag3", name: "Fleet Risk Analyst", type: "standard",
        model: "gemini-1.5-pro", temperature: 0.3, status: "draft",
        systemPrompt: "Analyze fleet-wide risk posture. Cross-reference drone health, mission criticality, and pilot availability to surface emerging risk patterns. Suggest proactive interventions.",
        ontologyAccess: [
            { objectType: "Drone", read: true, write: false, properties: ["id", "batteryLevel", "status", "altitude", "speed"], allowedWriteProperties: [] },
            { objectType: "Mission", read: true, write: false, properties: ["id", "name", "status", "priority", "progressPct"], allowedWriteProperties: [] },
            { objectType: "Pilot", read: true, write: false, properties: ["id", "name", "availability", "responseTime"], allowedWriteProperties: [] },
            { objectType: "Alert", read: true, write: false, properties: ["id", "severity", "status", "message"], allowedWriteProperties: [] },
        ],
        tools: [
            { id: "t10", type: "object-query", name: "QueryDrones", description: "Full drone fleet read", enabled: true, requiresApproval: false },
            { id: "t11", type: "object-query", name: "QueryMissions", description: "All active missions", enabled: true, requiresApproval: false },
            { id: "t12", type: "function", name: "ComputeRiskScore", description: "Fleet-level risk computation", enabled: true, requiresApproval: false },
        ],
        guardrails: [
            { id: "g10", name: "Max Output Tokens", description: "Output cap", enabled: true, value: 4096, max: 8192, unit: "tokens" },
            { id: "g11", name: "Auto-Execute Actions", description: "Direct writes block", enabled: false },
        ],
    },
];

// ── Simulation conversation seeds ─────────────────────────────────────────────
function seedConversation(agent: AIPAgent): ConsoleMsg[] {
    const t = () => new Date().toLocaleTimeString();
    return [
        { id: "s1", role: "user", content: "What's the current status of our active missions?", timestamp: t() },
        { id: "s2", role: "tool-call", content: "", toolName: "QueryMissions", timestamp: t() },
        { id: "s3", role: "tool-result", content: "Returned 7 active missions. MSN-8821: CRITICAL priority, 94 min delay.", timestamp: t() },
        { id: "s4", role: "agent", content: `Based on the Ontology data:\n\n• **7 active missions** currently running\n• **MSN-8821** is flagged: CRITICAL priority with a **94-minute delay**\n• 2 drones (DRN-104, DRN-209) report battery < 20% while in-flight\n\n⚠️ **Suggested Action** — I recommend escalating MSN-8821. Do you want me to prepare an **EscalateMission** action for your review?`, timestamp: t() },
    ];
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const btn = (primary = false, sm = false): React.CSSProperties => ({
    height: sm ? 24 : 28, padding: sm ? "0 8px" : "0 11px",
    borderRadius: 3, fontSize: sm ? 11 : 12, fontWeight: 600, cursor: "pointer",
    border: primary ? "none" : "1px solid #CED9E0",
    background: primary ? "#137CBD" : "#fff",
    color: primary ? "#fff" : "#394B59",
    display: "flex", alignItems: "center", gap: 5,
});
const tabStyle = (active: boolean): React.CSSProperties => ({
    fontSize: 12, padding: "6px 14px", cursor: "pointer", border: "none",
    background: "transparent",
    borderBottom: active ? "2px solid #137CBD" : "2px solid transparent",
    color: active ? "#137CBD" : "#5C7080", fontWeight: active ? 600 : 400,
});
const lbl = (t: string) => (
    <div style={{
        fontSize: 10, fontWeight: 700, color: "#5C7080",
        textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: 4
    }}>{t}</div>
);

const TOOL_ICON: Record<ToolType, React.ElementType> = {
    "object-query": Database, action: Zap, function: GitBranch, command: Terminal,
};
const TOOL_COLOR: Record<ToolType, string> = {
    "object-query": "#137CBD", action: "#D9822B", function: "#7157D9", command: "#0D8050",
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AIPage() {
    const [agents, setAgents] = useState<AIPAgent[]>(SEED_AGENTS);
    const [sel, setSel] = useState<AIPAgent>(SEED_AGENTS[0]);
    const [tab, setTab] = useState<"scope" | "tools" | "guardrails" | "config" | "console">("scope");
    const [msgs, setMsgs] = useState<ConsoleMsg[]>(() => seedConversation(SEED_AGENTS[0]));
    const [input, setInput] = useState("");
    const [typing, setTyping] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    const updateSel = (a: AIPAgent) => { setSel(a); setAgents(p => p.map(x => x.id === a.id ? a : x)); };

    const toggleAccess = (oi: number, field: "read" | "write") => {
        const ontologyAccess = [...sel.ontologyAccess];
        ontologyAccess[oi] = { ...ontologyAccess[oi], [field]: !ontologyAccess[oi][field] };
        updateSel({ ...sel, ontologyAccess });
    };

    const toggleProp = (oi: number, prop: string) => {
        const ontologyAccess = [...sel.ontologyAccess];
        const curr = ontologyAccess[oi].properties;
        ontologyAccess[oi] = {
            ...ontologyAccess[oi],
            properties: curr.includes(prop) ? curr.filter(p => p !== prop) : [...curr, prop]
        };
        updateSel({ ...sel, ontologyAccess });
    };

    const toggleTool = (ti: number, field: "enabled" | "requiresApproval") => {
        const tools = sel.tools.map((t, i) => i === ti ? { ...t, [field]: !t[field] } : t);
        updateSel({ ...sel, tools });
    };

    const toggleGuardrail = (gi: number) => {
        const guardrails = sel.guardrails.map((g, i) => i === gi ? { ...g, enabled: !g.enabled } : g);
        updateSel({ ...sel, guardrails });
    };

    const updateGuardrailValue = (gi: number, value: number) => {
        const guardrails = sel.guardrails.map((g, i) => i === gi ? { ...g, value } : g);
        updateSel({ ...sel, guardrails });
    };

    // Simulate console
    const sendMessage = () => {
        if (!input.trim()) return;
        const userMsg: ConsoleMsg = { id: `m${Date.now()}`, role: "user", content: input, timestamp: new Date().toLocaleTimeString() };
        setMsgs(p => [...p, userMsg]);
        setInput(""); setTyping(true);

        // Pick a relevant enabled tool for simulation
        const queryTool = sel.tools.find(t => t.type === "object-query" && t.enabled);
        const actionTool = sel.tools.find(t => t.type === "action" && t.enabled);
        const hasActionWord = /escalat|creat|updat|assign|fix/i.test(input);

        setTimeout(() => {
            const followUp: ConsoleMsg[] = [];
            if (queryTool) {
                followUp.push({ id: `m${Date.now()}a`, role: "tool-call", content: "", toolName: queryTool.name, timestamp: new Date().toLocaleTimeString() });
                followUp.push({ id: `m${Date.now()}b`, role: "tool-result", content: `Query executed. ${Math.floor(Math.random() * 50) + 5} objects returned from Ontology.`, timestamp: new Date().toLocaleTimeString() });
            }
            followUp.push({
                id: `m${Date.now()}c`, role: "agent", timestamp: new Date().toLocaleTimeString(),
                content: hasActionWord && actionTool
                    ? `I've analyzed the data. Based on current Ontology state:\n\n• Identified ${Math.floor(Math.random() * 5) + 1} objects matching your criteria\n• Conditions meet the threshold for **${actionTool.name}**\n\n⚠️ **Suggested Action** — This requires your approval before execution. I cannot auto-execute writes to the Ontology. Shall I prepare the action payload for your review?`
                    : `I analyzed the latest Ontology data.\n\nKey observations:\n• ${Math.floor(Math.random() * 8) + 2} active records retrieved\n• No anomalies detected beyond existing alerts\n• Recommend reviewing the top-priority items\n\nWould you like me to drill down further or surface a specific action?`,
                approved: hasActionWord && actionTool ? false : undefined,
            });
            setMsgs(p => [...p, ...followUp]);
            setTyping(false);
        }, 1200);
    };

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

    const statusColors: Record<string, [string, string]> = {
        active: ["#E6F7F0", "#0D8050"], draft: ["#EBF4FC", "#137CBD"], deprecated: ["#EBF1F5", "#5C7080"],
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#F5F8FA", fontFamily: "Inter,sans-serif" }}>

            {/* Top bar */}
            <div style={{ height: 44, display: "flex", alignItems: "center", padding: "0 14px", background: "#fff", borderBottom: "1px solid #CED9E0", gap: 8, flexShrink: 0 }}>
                <Brain style={{ width: 16, height: 16, color: "#7157D9" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#182026" }}>AI</span>
                <div style={{ width: 1, height: 16, background: "#CED9E0", margin: "0 4px" }} />
                <span style={{ fontSize: 11, color: "#5C7080" }}>AIP Agent Studio · Guardrails · Scope Configuration</span>
                <div style={{ flex: 1 }} />
                <button style={btn()}><RefreshCw style={{ width: 12, height: 12 }} /> Refresh</button>
                <button onClick={() => {
                    const a: AIPAgent = {
                        id: `ag${Date.now()}`, name: "New Agent", type: "standard", model: "gpt-4o",
                        temperature: 0.2, status: "draft",
                        systemPrompt: "You are a helpful assistant with access to the Palantir Ontology.",
                        ontologyAccess: [], tools: [], guardrails: [
                            { id: "gn1", name: "Auto-Execute Actions", description: "Block auto-execute", enabled: false },
                            { id: "gn2", name: "Content Safety Filter", description: "Content filter", enabled: true },
                        ],
                    };
                    setAgents(p => [...p, a]); setSel(a); setMsgs([]);
                }} style={btn(true)}><Plus style={{ width: 13, height: 13 }} /> New Agent</button>
            </div>

            <div style={{ flex: 1, display: "flex", minHeight: 0 }}>

                {/* Agent list */}
                <div style={{ width: 255, background: "#fff", borderRight: "1px solid #CED9E0", display: "flex", flexDirection: "column", flexShrink: 0 }}>
                    <div style={{ padding: "8px 12px", fontSize: 10, fontWeight: 700, color: "#5C7080", letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: "1px solid #EBF1F5" }}>
                        AIP Agents ({agents.length})
                    </div>
                    <div style={{ flex: 1, overflowY: "auto" }}>
                        {agents.map(a => {
                            const [sbg, sfg] = statusColors[a.status];
                            return (
                                <div key={a.id} onClick={() => { setSel(a); setMsgs(seedConversation(a)); setTab("scope"); }}
                                    style={{
                                        padding: "10px 12px", cursor: "pointer", borderBottom: "1px solid #EBF1F5",
                                        borderLeft: sel.id === a.id ? "2px solid #7157D9" : "2px solid transparent",
                                        background: sel.id === a.id ? "rgba(113,87,217,0.05)" : "transparent"
                                    }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <div style={{
                                            width: 22, height: 22, borderRadius: 4, background: "rgba(113,87,217,0.12)",
                                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                                        }}>
                                            <Brain style={{ width: 12, height: 12, color: "#7157D9" }} />
                                        </div>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: "#182026", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</span>
                                        <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, fontWeight: 700, background: sbg, color: sfg }}>{a.status}</span>
                                    </div>
                                    <div style={{ fontSize: 10, color: "#5C7080", marginTop: 2, paddingLeft: 28 }}>
                                        {a.model} · {a.type} · {a.tools.filter(t => t.enabled).length} tools
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right panel */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

                    {/* Agent header */}
                    <div style={{
                        height: 44, display: "flex", alignItems: "center", gap: 8, padding: "0 16px",
                        background: "#fff", borderBottom: "1px solid #CED9E0", flexShrink: 0
                    }}>
                        <Brain style={{ width: 16, height: 16, color: "#7157D9" }} />
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#182026" }}>{sel.name}</span>
                        <span style={{ fontSize: 11, color: "#8A9BA8" }}>·</span>
                        <span style={{ fontSize: 11, color: "#5C7080" }}>{sel.model}</span>
                        <span style={{
                            fontSize: 9, padding: "1px 6px", borderRadius: 3, fontWeight: 700,
                            background: statusColors[sel.status][0], color: statusColors[sel.status][1]
                        }}>{sel.status}</span>
                        <div style={{ flex: 1 }} />
                        {/* Auto-execute guardrail indicator */}
                        {sel.guardrails.find(g => g.name === "Auto-Execute Actions")?.enabled === false && (
                            <div style={{
                                display: "flex", alignItems: "center", gap: 5, padding: "3px 10px",
                                borderRadius: 3, border: "1px solid #0D8050", background: "#E6F7F0"
                            }}>
                                <Shield style={{ width: 12, height: 12, color: "#0D8050" }} />
                                <span style={{ fontSize: 11, fontWeight: 700, color: "#0D8050" }}>Human-in-the-Loop</span>
                            </div>
                        )}
                        <button onClick={() => setTab("console")} style={btn()}>
                            <Play style={{ width: 12, height: 12 }} /> Test Agent
                        </button>
                        <button style={btn(true)}>Save</button>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: "flex", background: "#fff", borderBottom: "1px solid #CED9E0", padding: "0 4px", flexShrink: 0 }}>
                        {(["scope", "tools", "guardrails", "config", "console"] as const).map(t => (
                            <button key={t} onClick={() => setTab(t)} style={tabStyle(tab === t)}>
                                {t === "scope" ? "Scope / Entity Access" : t === "tools" ? "Tool Access" :
                                    t === "guardrails" ? "Guardrails" : t === "config" ? "Configuration" : "Simulation Console"}
                            </button>
                        ))}
                    </div>

                    <div style={{ flex: 1, overflow: "auto", padding: tab === "console" ? 0 : 20 }}>

                        {/* ── SCOPE / ENTITY ACCESS MATRIX ── */}
                        {tab === "scope" && (
                            <div style={{ maxWidth: 800 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#182026", marginBottom: 4 }}>Entity Access Matrix</div>
                                <div style={{ fontSize: 11, color: "#5C7080", marginBottom: 14 }}>
                                    Controls which Ontology object types the agent can read or write. Write access only applies via governed Action Types — never raw SQL.
                                </div>

                                {sel.ontologyAccess.map((oa, oi) => {
                                    const allProps = OBJECT_TYPES_META[oa.objectType] ?? oa.properties;
                                    return (
                                        <div key={oa.objectType} style={{ background: "#fff", border: "1px solid #CED9E0", borderRadius: 4, marginBottom: 12, overflow: "hidden" }}>
                                            {/* Row header */}
                                            <div style={{
                                                display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                                                background: "#F5F8FA", borderBottom: "1px solid #EBF1F5"
                                            }}>
                                                <div style={{
                                                    width: 24, height: 24, borderRadius: 4, background: "rgba(19,124,189,0.1)",
                                                    display: "flex", alignItems: "center", justifyContent: "center"
                                                }}>
                                                    <Database style={{ width: 13, height: 13, color: "#137CBD" }} />
                                                </div>
                                                <span style={{ fontSize: 13, fontWeight: 700, color: "#182026", flex: 1 }}>{oa.objectType}</span>

                                                {/* Read toggle */}
                                                {[{ label: "Read", field: "read" as const, color: "#137CBD", bg: "#EBF4FC" },
                                                { label: "Write", field: "write" as const, color: "#D9822B", bg: "#FFF3E0" }].map(({ label, field, color, bg }) => (
                                                    <button key={field} onClick={() => toggleAccess(oi, field)}
                                                        style={{
                                                            display: "flex", alignItems: "center", gap: 5, padding: "4px 10px",
                                                            borderRadius: 3, cursor: "pointer", fontSize: 11, fontWeight: 600,
                                                            border: `1px solid ${oa[field] ? color : "#CED9E0"}`,
                                                            background: oa[field] ? bg : "#fff", color: oa[field] ? color : "#5C7080"
                                                        }}>
                                                        {oa[field]
                                                            ? <Check style={{ width: 11, height: 11 }} />
                                                            : <X style={{ width: 11, height: 11 }} />}
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Property toggles */}
                                            <div style={{ padding: "10px 14px" }}>
                                                <div style={{ fontSize: 9, fontWeight: 700, color: "#5C7080", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
                                                    Visible Properties
                                                </div>
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                                    {allProps.map(prop => {
                                                        const active = oa.properties.includes(prop);
                                                        const isWritable = oa.write && oa.allowedWriteProperties.includes(prop);
                                                        return (
                                                            <button key={prop} onClick={() => toggleProp(oi, prop)}
                                                                style={{
                                                                    display: "flex", alignItems: "center", gap: 4, padding: "3px 9px",
                                                                    borderRadius: 12, fontSize: 10, fontWeight: 500, cursor: "pointer",
                                                                    border: `1px solid ${active ? "#137CBD" : "#CED9E0"}`,
                                                                    background: active ? "rgba(19,124,189,0.08)" : "#fff",
                                                                    color: active ? "#137CBD" : "#8A9BA8"
                                                                }}>
                                                                {prop}
                                                                {isWritable && <span style={{ fontSize: 8, color: "#D9822B", fontWeight: 700 }}>W</span>}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                {oa.write && (
                                                    <div style={{ marginTop: 8, fontSize: 10, color: "#D9822B" }}>
                                                        ⚠ Write-enabled properties: <strong>{oa.allowedWriteProperties.join(", ") || "none"}</strong> — only via Action Types
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Add object type */}
                                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                    <select style={{ padding: "5px 10px", border: "1px solid #CED9E0", borderRadius: 3, fontSize: 12, background: "#fff" }}>
                                        {Object.keys(OBJECT_TYPES_META).filter(o => !sel.ontologyAccess.find(a => a.objectType === o)).map(o => <option key={o}>{o}</option>)}
                                    </select>
                                    <button onClick={() => {
                                        const sel2 = (document.querySelector("select") as HTMLSelectElement)?.value;
                                        if (!sel2 || sel.ontologyAccess.find(a => a.objectType === sel2)) return;
                                        updateSel({
                                            ...sel, ontologyAccess: [...sel.ontologyAccess, {
                                                objectType: sel2, read: true, write: false,
                                                properties: OBJECT_TYPES_META[sel2] ?? [],
                                                allowedWriteProperties: [],
                                            }]
                                        });
                                    }} style={{ ...btn(), fontSize: 11 }}><Plus style={{ width: 11, height: 11 }} /> Add Object Type</button>
                                </div>

                                {/* Info banner */}
                                <div style={{
                                    marginTop: 14, padding: "8px 12px", background: "#EBF4FC", border: "1px solid #B3D7F5",
                                    borderRadius: 4, display: "flex", gap: 8
                                }}>
                                    <Info style={{ width: 14, height: 14, color: "#137CBD", flexShrink: 0 }} />
                                    <span style={{ fontSize: 11, color: "#1F4E79", lineHeight: 1.5 }}>
                                        The LLM is only provided data for which the current user has appropriate permissions.
                                        Write operations require a registered Action Type with its own approval workflow.
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* ── TOOL ACCESS ── */}
                        {tab === "tools" && (
                            <div style={{ maxWidth: 720 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#182026", marginBottom: 4 }}>Tool Access Configuration</div>
                                <div style={{ fontSize: 11, color: "#5C7080", marginBottom: 16 }}>
                                    Tools expose Object Queries (read), Actions (write-via-approval), AIP Logic Functions, and Commands to the agent.
                                </div>

                                {/* Summary by type */}
                                <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                                    {(["object-query", "action", "function", "command"] as ToolType[]).map(type => {
                                        const Icon = TOOL_ICON[type]; const color = TOOL_COLOR[type];
                                        const count = sel.tools.filter(t => t.type === type && t.enabled).length;
                                        const total = sel.tools.filter(t => t.type === type).length;
                                        return (
                                            <div key={type} style={{
                                                flex: 1, padding: "10px 12px", background: "#fff",
                                                border: "1px solid #CED9E0", borderRadius: 4, textAlign: "center"
                                            }}>
                                                <Icon style={{ width: 16, height: 16, color, marginBottom: 4 }} />
                                                <div style={{ fontSize: 18, fontWeight: 700, color }}>{count}/{total}</div>
                                                <div style={{ fontSize: 9, color: "#5C7080", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                                    {type.replace("-", " ")}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {sel.tools.map((tool, ti) => {
                                    const Icon = TOOL_ICON[tool.type]; const color = TOOL_COLOR[tool.type];
                                    return (
                                        <div key={tool.id} style={{
                                            background: "#fff", border: "1px solid #CED9E0",
                                            borderRadius: 4, marginBottom: 8, padding: "10px 14px",
                                            opacity: tool.enabled ? 1 : 0.6
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <div style={{
                                                    width: 26, height: 26, borderRadius: 4, background: color + "18",
                                                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                                                }}>
                                                    <Icon style={{ width: 14, height: 14, color }} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                        <span style={{ fontSize: 12, fontWeight: 700, color: "#182026" }}>{tool.name}</span>
                                                        <span style={{
                                                            fontSize: 9, padding: "1px 5px", borderRadius: 3,
                                                            background: color + "15", color, fontWeight: 700, textTransform: "uppercase"
                                                        }}>
                                                            {tool.type.replace("-", " ")}
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: 11, color: "#5C7080", marginTop: 1 }}>{tool.description}</div>
                                                </div>

                                                {/* Requires approval badge */}
                                                {tool.type === "action" && (
                                                    <button onClick={() => toggleTool(ti, "requiresApproval")}
                                                        style={{
                                                            display: "flex", alignItems: "center", gap: 4, padding: "3px 8px",
                                                            borderRadius: 3, cursor: "pointer", fontSize: 10, fontWeight: 700,
                                                            border: `1px solid ${tool.requiresApproval ? "#D9822B" : "#CED9E0"}`,
                                                            background: tool.requiresApproval ? "#FFF3E0" : "#fff",
                                                            color: tool.requiresApproval ? "#D9822B" : "#5C7080"
                                                        }}>
                                                        <Shield style={{ width: 10, height: 10 }} />
                                                        {tool.requiresApproval ? "Requires Approval" : "Auto (⚠ off)"}
                                                    </button>
                                                )}

                                                {/* Enable toggle */}
                                                <button onClick={() => toggleTool(ti, "enabled")}
                                                    style={{
                                                        display: "flex", alignItems: "center", gap: 5, padding: "4px 10px",
                                                        borderRadius: 3, cursor: "pointer", fontSize: 11, fontWeight: 600,
                                                        border: `1px solid ${tool.enabled ? "#0D8050" : "#CED9E0"}`,
                                                        background: tool.enabled ? "#E6F7F0" : "#fff",
                                                        color: tool.enabled ? "#0D8050" : "#5C7080"
                                                    }}>
                                                    {tool.enabled
                                                        ? <ToggleRight style={{ width: 14, height: 14 }} />
                                                        : <ToggleLeft style={{ width: 14, height: 14 }} />}
                                                    {tool.enabled ? "Enabled" : "Disabled"}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}

                                <div style={{
                                    marginTop: 10, padding: "8px 12px", background: "#FFF3E0",
                                    border: "1px solid #F5C894", borderRadius: 4, display: "flex", gap: 8
                                }}>
                                    <AlertTriangle style={{ width: 14, height: 14, color: "#D9822B", flexShrink: 0 }} />
                                    <span style={{ fontSize: 11, color: "#77450D", lineHeight: 1.5 }}>
                                        Action tools require human approval before execution. The agent surfaces suggestions only.
                                        Disabling "Requires Approval" on any action removes this safeguard.
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* ── GUARDRAILS ── */}
                        {tab === "guardrails" && (
                            <div style={{ maxWidth: 620 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#182026", marginBottom: 4 }}>Guardrail Configuration</div>
                                <div style={{ fontSize: 11, color: "#5C7080", marginBottom: 16 }}>
                                    Configured in the AIP Control Panel. Controls LLM output constraints, safety filters, and behavioral limits.
                                </div>

                                {sel.guardrails.map((g, gi) => (
                                    <div key={g.id} style={{
                                        background: "#fff", border: `1px solid ${g.enabled && g.name === "Auto-Execute Actions" ? "#C23030" : "#CED9E0"}`,
                                        borderRadius: 4, marginBottom: 10, padding: "12px 16px"
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                                                    <span style={{ fontSize: 12, fontWeight: 700, color: "#182026" }}>{g.name}</span>
                                                    {g.name === "Auto-Execute Actions" && g.enabled && (
                                                        <span style={{
                                                            fontSize: 9, padding: "1px 5px", borderRadius: 3,
                                                            background: "rgba(194,48,48,0.1)", color: "#C23030", fontWeight: 700
                                                        }}>
                                                            ⚠ RISK
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: 11, color: "#5C7080" }}>{g.description}</div>
                                            </div>

                                            {/* Toggle */}
                                            <button onClick={() => toggleGuardrail(gi)}
                                                style={{
                                                    display: "flex", alignItems: "center", gap: 5, padding: "4px 10px",
                                                    borderRadius: 3, cursor: "pointer", fontSize: 11, fontWeight: 600,
                                                    border: `1px solid ${g.enabled ? (g.name === "Auto-Execute Actions" ? "#C23030" : "#0D8050") : "#CED9E0"}`,
                                                    background: g.enabled ? (g.name === "Auto-Execute Actions" ? "rgba(194,48,48,0.08)" : "#E6F7F0") : "#fff",
                                                    color: g.enabled ? (g.name === "Auto-Execute Actions" ? "#C23030" : "#0D8050") : "#5C7080"
                                                }}>
                                                {g.enabled ? <ToggleRight style={{ width: 14, height: 14 }} /> : <ToggleLeft style={{ width: 14, height: 14 }} />}
                                                {g.enabled ? "On" : "Off"}
                                            </button>
                                        </div>

                                        {/* Slider for numeric guardrails */}
                                        {g.value !== undefined && g.max !== undefined && g.enabled && (
                                            <div style={{ marginTop: 10 }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#5C7080", marginBottom: 4 }}>
                                                    <span>0</span>
                                                    <span style={{ fontWeight: 700, color: "#182026" }}>{g.value?.toLocaleString()} {g.unit}</span>
                                                    <span>{g.max?.toLocaleString()}</span>
                                                </div>
                                                <input type="range" min={0} max={g.max} value={g.value}
                                                    onChange={e => updateGuardrailValue(gi, Number(e.target.value))}
                                                    style={{ width: "100%", accentColor: "#7157D9", cursor: "pointer" }} />
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Auto-execute warning */}
                                {sel.guardrails.find(g => g.name === "Auto-Execute Actions")?.enabled && (
                                    <div style={{
                                        padding: "10px 12px", background: "rgba(194,48,48,0.08)",
                                        border: "1px solid #C23030", borderRadius: 4, display: "flex", gap: 8
                                    }}>
                                        <AlertCircle style={{ width: 14, height: 14, color: "#C23030", flexShrink: 0 }} />
                                        <span style={{ fontSize: 11, color: "#8A1818", lineHeight: 1.5, fontWeight: 500 }}>
                                            Auto-Execute is ON. The agent can write to the Ontology without human confirmation.
                                            This is strongly discouraged for production agents.
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── CONFIG ── */}
                        {tab === "config" && (
                            <div style={{ maxWidth: 540, display: "flex", flexDirection: "column", gap: 14 }}>
                                <div>
                                    {lbl("Agent Name")}
                                    <input value={sel.name} onChange={e => updateSel({ ...sel, name: e.target.value })}
                                        style={{ width: "100%", padding: "6px 10px", border: "1px solid #CED9E0", borderRadius: 3, fontSize: 13, background: "#fff" }} />
                                </div>
                                <div>
                                    {lbl("Agent Type")}
                                    <div style={{ display: "flex", gap: 8 }}>
                                        {(["standard", "assist"] as AgentType[]).map(t => (
                                            <button key={t} onClick={() => updateSel({ ...sel, type: t })}
                                                style={{
                                                    flex: 1, padding: "8px 12px", borderRadius: 3, cursor: "pointer", fontSize: 12, fontWeight: 600,
                                                    border: `1.5px solid ${sel.type === t ? "#7157D9" : "#CED9E0"}`,
                                                    background: sel.type === t ? "rgba(113,87,217,0.08)" : "#fff",
                                                    color: sel.type === t ? "#7157D9" : "#5C7080"
                                                }}>
                                                {t === "standard" ? "🤖 Standard Agent" : "💬 AIP Assist Agent"}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    {lbl("Foundation Model")}
                                    <select value={sel.model} onChange={e => updateSel({ ...sel, model: e.target.value })}
                                        style={{ width: "100%", padding: "6px 10px", border: "1px solid #CED9E0", borderRadius: 3, fontSize: 12, background: "#fff" }}>
                                        {MODELS.map(m => <option key={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div>
                                    {lbl(`Temperature: ${sel.temperature} (${sel.temperature <= 0.2 ? "Deterministic" : sel.temperature <= 0.5 ? "Balanced" : "Creative"})`)}
                                    <input type="range" min={0} max={1} step={0.05} value={sel.temperature}
                                        onChange={e => updateSel({ ...sel, temperature: parseFloat(e.target.value) })}
                                        style={{ width: "100%", accentColor: "#7157D9", cursor: "pointer" }} />
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#8A9BA8", marginTop: 3 }}>
                                        <span>0 — Deterministic</span><span>1.0 — Creative</span>
                                    </div>
                                </div>
                                <div>
                                    {lbl("System Prompt")}
                                    <textarea value={sel.systemPrompt} rows={6}
                                        onChange={e => updateSel({ ...sel, systemPrompt: e.target.value })}
                                        style={{
                                            width: "100%", padding: "8px 10px", border: "1px solid #CED9E0",
                                            borderRadius: 3, fontSize: 12, background: "#fff", resize: "vertical",
                                            lineHeight: 1.6, fontFamily: "Inter,sans-serif"
                                        }} />
                                </div>
                                <div>
                                    {lbl("Status")}
                                    <select value={sel.status} onChange={e => updateSel({ ...sel, status: e.target.value as AIPAgent["status"] })}
                                        style={{ width: "100%", padding: "6px 10px", border: "1px solid #CED9E0", borderRadius: 3, fontSize: 12, background: "#fff" }}>
                                        {["active", "draft", "deprecated"].map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                                <button style={btn(true)}>Save Configuration</button>
                            </div>
                        )}

                        {/* ── SIMULATION CONSOLE ── */}
                        {tab === "console" && (
                            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                                {/* Console header */}
                                <div style={{
                                    display: "flex", alignItems: "center", gap: 8, padding: "8px 16px",
                                    background: "#fff", borderBottom: "1px solid #CED9E0", flexShrink: 0
                                }}>
                                    <Terminal style={{ width: 14, height: 14, color: "#7157D9" }} />
                                    <span style={{ fontSize: 12, fontWeight: 700, color: "#182026" }}>AIP Agent Simulation Console</span>
                                    <span style={{ fontSize: 10 }}>·</span>
                                    <span style={{ fontSize: 11, color: "#5C7080" }}>{sel.name} · {sel.model}</span>
                                    <div style={{ flex: 1 }} />
                                    <div style={{
                                        display: "flex", alignItems: "center", gap: 5, padding: "3px 8px",
                                        borderRadius: 3, background: "#E6F7F0", border: "1px solid #0D8050"
                                    }}>
                                        <Shield style={{ width: 11, height: 11, color: "#0D8050" }} />
                                        <span style={{ fontSize: 10, fontWeight: 700, color: "#0D8050" }}>Suggestion-Only Mode</span>
                                    </div>
                                    <button onClick={() => setMsgs(seedConversation(sel))} style={btn(false, true)}>
                                        <RefreshCw style={{ width: 11, height: 11 }} /> Reset
                                    </button>
                                </div>

                                {/* Messages */}
                                <div style={{ flex: 1, overflow: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10, background: "#F5F8FA" }}>
                                    {msgs.map(m => {
                                        if (m.role === "tool-call") return (
                                            <div key={m.id} style={{
                                                display: "flex", alignItems: "center", gap: 6, padding: "5px 10px",
                                                background: "rgba(113,87,217,0.06)", borderRadius: 4, border: "1px solid rgba(113,87,217,0.2)",
                                                width: "fit-content", maxWidth: "60%"
                                            }}>
                                                <Cpu style={{ width: 12, height: 12, color: "#7157D9" }} />
                                                <code style={{ fontSize: 10, color: "#7157D9", fontWeight: 600 }}>→ calling {m.toolName}()</code>
                                                <Clock style={{ width: 10, height: 10, color: "#8A9BA8" }} />
                                                <span style={{ fontSize: 9, color: "#8A9BA8" }}>{m.timestamp}</span>
                                            </div>
                                        );
                                        if (m.role === "tool-result") return (
                                            <div key={m.id} style={{
                                                display: "flex", alignItems: "flex-start", gap: 6, padding: "5px 10px",
                                                background: "rgba(13,128,80,0.05)", borderRadius: 4, border: "1px solid rgba(13,128,80,0.2)",
                                                width: "fit-content", maxWidth: "70%"
                                            }}>
                                                <Check style={{ width: 12, height: 12, color: "#0D8050", marginTop: 1 }} />
                                                <span style={{ fontSize: 11, color: "#0D8050" }}>{m.content}</span>
                                            </div>
                                        );
                                        const isUser = m.role === "user";
                                        return (
                                            <div key={m.id} style={{
                                                display: "flex", flexDirection: "column",
                                                alignItems: isUser ? "flex-end" : "flex-start", gap: 4
                                            }}>
                                                <div style={{
                                                    maxWidth: "75%", padding: "10px 14px", borderRadius: 8,
                                                    background: isUser ? "#137CBD" : "#fff",
                                                    color: isUser ? "#fff" : "#182026",
                                                    border: isUser ? "none" : "1px solid #CED9E0",
                                                    fontSize: 12, lineHeight: 1.6,
                                                    whiteSpace: "pre-wrap",
                                                }}>
                                                    {m.content}
                                                </div>

                                                {/* Suggested action approval */}
                                                {m.approved === false && !isUser && (
                                                    <div style={{ display: "flex", gap: 6, marginLeft: 2 }}>
                                                        <div style={{
                                                            padding: "5px 10px", background: "#FFF3E0",
                                                            border: "1px solid #F5C894", borderRadius: 4, fontSize: 11, color: "#77450D",
                                                            display: "flex", alignItems: "center", gap: 5
                                                        }}>
                                                            <AlertTriangle style={{ width: 11, height: 11, color: "#D9822B" }} />
                                                            Action pending your approval
                                                        </div>
                                                        <button onClick={() => setMsgs(p => p.map(x => x.id === m.id ? { ...x, approved: true } : x))}
                                                            style={{ ...btn(true, true), height: 26, fontSize: 11 }}>
                                                            <Check style={{ width: 11, height: 11 }} /> Approve
                                                        </button>
                                                        <button onClick={() => setMsgs(p => p.map(x => x.id === m.id ? { ...x, approved: undefined } : x))}
                                                            style={{
                                                                height: 26, padding: "0 10px", borderRadius: 3, cursor: "pointer",
                                                                border: "1px solid #C23030", background: "rgba(194,48,48,0.08)",
                                                                color: "#C23030", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4
                                                            }}>
                                                            <X style={{ width: 11, height: 11 }} /> Reject
                                                        </button>
                                                    </div>
                                                )}
                                                {m.approved === true && (
                                                    <div style={{ fontSize: 10, color: "#0D8050", display: "flex", alignItems: "center", gap: 4 }}>
                                                        <Check style={{ width: 10, height: 10 }} /> Action approved and submitted to Ontology
                                                    </div>
                                                )}

                                                <span style={{ fontSize: 9, color: "#8A9BA8" }}>{m.timestamp}</span>
                                            </div>
                                        );
                                    })}
                                    {typing && (
                                        <div style={{
                                            display: "flex", alignItems: "center", gap: 6, padding: "10px 14px",
                                            background: "#fff", borderRadius: 8, border: "1px solid #CED9E0",
                                            width: "fit-content"
                                        }}>
                                            <Brain style={{ width: 12, height: 12, color: "#7157D9" }} />
                                            <span style={{ fontSize: 11, color: "#5C7080" }}>Agent is thinking…</span>
                                            <div style={{ display: "flex", gap: 3 }}>
                                                {[0, 1, 2].map(i => <div key={i} style={{
                                                    width: 5, height: 5, borderRadius: "50%", background: "#7157D9",
                                                    animation: `bounce 1s ease-in-out ${i * 0.2}s infinite`
                                                }} />)}
                                            </div>
                                        </div>
                                    )}
                                    <div ref={bottomRef} />
                                </div>

                                {/* Input bar */}
                                <div style={{
                                    padding: "10px 16px", background: "#fff", borderTop: "1px solid #CED9E0",
                                    display: "flex", gap: 8, flexShrink: 0
                                }}>
                                    <input value={input} onChange={e => setInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                                        placeholder={`Ask ${sel.name}…  (Enter to send)`}
                                        style={{
                                            flex: 1, padding: "8px 12px", border: "1px solid #CED9E0", borderRadius: 6,
                                            fontSize: 12, background: "#F5F8FA", outline: "none"
                                        }} />
                                    <button onClick={sendMessage} disabled={!input.trim()} style={btn(true)}>
                                        <Play style={{ width: 12, height: 12 }} /> Send
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
