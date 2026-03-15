"use client";

import { useState } from "react";
import {
    Zap, Plus, Save, Trash2, Terminal, Code,
    Shield, Settings2, Sparkles, ChevronRight,
    Search, Filter, Activity, LayoutGrid
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Toolbar } from "@/components/ui/Toolbar";
import { MiniList, MiniListItem } from "@/components/ui/MiniList";
import { SeverityChip } from "@/components/ui/SeverityChip";
import { cn } from "@/lib/utils";
import { AipAgent } from "@/lib/aipTypes";

const MOCK_AGENTS: AipAgent[] = [
    {
        id: "agt-fleet-commander",
        name: "Fleet Mission Coordinator",
        description: "Optimizes drone deployment and explains telemetry anomalies.",
        systemPrompt: "You are the Fleet Mission Coordinator. Focus on asset safety and operational efficiency.",
        allowedTools: ["telemetry-analyzer", "drone-dispatch", "ontology-search"],
        model: "gpt-4o"
    },
    {
        id: "agt-data-steward",
        name: "Ontology Architect",
        description: "Assists in structural object modeling and data contract remediation.",
        systemPrompt: "You are the Ontology Architect. Enforce semantic consistency and remediate schema violations.",
        allowedTools: ["ontology-search", "contract-remediator"],
        model: "gpt-4o"
    }
];

const AVAILABLE_TOOLS = [
    { id: "telemetry-analyzer", name: "Telemetry Analyzer", description: "Deep analysis of time-series data" },
    { id: "drone-dispatch", name: "Drone Dispatch", description: "Mutate flight paths and mission state" },
    { id: "ontology-search", name: "Ontology Search", description: "Query the semantic object registry" },
    { id: "contract-remediator", name: "Contract Remediator", description: "Propose fixes for data quality errors" },
    { id: "job-debugger", name: "SRE Job Debugger", description: "Analyze stack traces and logs" }
];

export default function AgentStudio() {
    const [agents, setAgents] = useState<AipAgent[]>(MOCK_AGENTS);
    const [selectedId, setSelectedId] = useState<string | null>(agents[0].id);
    const [searchQuery, setSearchQuery] = useState("");

    const selectedAgent = agents.find(a => a.id === selectedId);

    return (
        <div className="flex flex-col h-full bg-pt-bg">
            {/* Header */}
            <header className="px-6 py-4 border-b border-pt-border bg-pt-bg-panel/20 shrink-0">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Shield size={10} className="text-pt-intent-primary" />
                            <span className="text-[9px] font-black text-pt-text-muted opacity-50 uppercase tracking-widest font-mono">Platform_Engineering_Hub</span>
                        </div>
                        <h1 className="text-xl font-black text-pt-text uppercase tracking-tight">AIP Agent Studio</h1>
                        <p className="text-[10px] text-pt-text-muted font-bold uppercase tracking-widest mt-1">Configure Autonomous Operations & Cognitive Routing</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="h-8 px-4 bg-pt-intent-primary text-pt-bg rounded text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg hover:bg-pt-intent-primary/90 transition-all">
                            <Plus size={10} /> Register New Agent
                        </button>
                    </div>
                </div>
            </header>

            <Toolbar className="shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-2.5 py-1.5 bg-pt-bg border border-pt-border rounded text-[9px] font-black uppercase tracking-widest text-pt-text opacity-80">
                        <Zap size={10} className="text-pt-intent-primary" />
                        <span>Runtime: Production_AIP_Cluster</span>
                    </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <SeverityChip label="Cluster Global" severity="info" />
                </div>
            </Toolbar>

            <div className="flex-1 flex overflow-hidden">
                {/* Agent List */}
                <aside className="w-[320px] border-r border-pt-border flex flex-col bg-pt-bg select-none">
                    <div className="p-3 border-b border-pt-border bg-pt-bg/30">
                        <div className="relative group">
                            <Search className="w-3 h-3 absolute left-2 top-2.5 text-pt-text-muted opacity-40 group-focus-within:opacity-100 transition-opacity" />
                            <input
                                type="text"
                                placeholder="FILTER AGENTS..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-pt-bg-panel border border-pt-border rounded px-7 py-1.5 text-[10px] font-bold focus:outline-none focus:border-pt-intent-primary placeholder:opacity-20 uppercase tracking-widest"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto custom-scrollbar">
                        <MiniList>
                            {agents.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase())).map(agent => (
                                <MiniListItem
                                    key={agent.id}
                                    label={agent.name}
                                    metadata={agent.model}
                                    active={selectedId === agent.id}
                                    onClick={() => setSelectedId(agent.id)}
                                    icon={Sparkles}
                                />
                            ))}
                        </MiniList>
                    </div>
                </aside>

                {/* Main Config Area */}
                <main className="flex-1 flex flex-col bg-[radial-gradient(circle_at_center,_var(--pt-bg-panel)_0%,_var(--pt-bg)_100%)] overflow-hidden">
                    {selectedAgent ? (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="p-6 border-b border-pt-border flex justify-between items-center bg-pt-bg-panel/50">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-lg font-black text-pt-text uppercase tracking-tight">{selectedAgent.name}</h2>
                                        <SeverityChip label="Active" severity="success" />
                                    </div>
                                    <p className="text-[10px] text-pt-text-muted font-bold uppercase tracking-widest">{selectedAgent.description}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 hover:bg-pt-bg-hover text-pt-text-muted hover:text-pt-intent-danger transition-all rounded">
                                        <Trash2 size={16} />
                                    </button>
                                    <button className="flex items-center gap-2 px-4 h-9 bg-pt-bg border border-pt-border hover:border-pt-intent-primary text-pt-text text-[9px] font-black uppercase tracking-widest rounded transition-all">
                                        <Save size={14} /> Commit Changes
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto p-6 space-y-8 custom-scrollbar">
                                {/* Prompt Engineering */}
                                <section className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Terminal size={12} className="text-pt-intent-primary" />
                                        <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-pt-text-muted">Core Behavior Prompt</h3>
                                    </div>
                                    <textarea
                                        className="w-full h-48 bg-pt-bg border border-pt-border rounded p-4 font-mono text-[11px] text-pt-text-muted focus:outline-none focus:border-pt-intent-primary transition-all resize-none shadow-inner"
                                        value={selectedAgent.systemPrompt}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setAgents(prev => prev.map(a => a.id === selectedId ? { ...a, systemPrompt: val } : a));
                                        }}
                                    />
                                </section>

                                {/* Tool Permissions */}
                                <section className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Settings2 size={12} className="text-pt-intent-primary" />
                                        <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-pt-text-muted">Operational Tools</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {AVAILABLE_TOOLS.map(tool => {
                                            const isEnabled = selectedAgent.allowedTools.includes(tool.id);
                                            return (
                                                <div
                                                    key={tool.id}
                                                    onClick={() => {
                                                        const newTools = isEnabled
                                                            ? selectedAgent.allowedTools.filter(t => t !== tool.id)
                                                            : [...selectedAgent.allowedTools, tool.id];
                                                        setAgents(prev => prev.map(a => a.id === selectedId ? { ...a, allowedTools: newTools } : a));
                                                    }}
                                                    className={cn(
                                                        "p-3 border rounded cursor-pointer transition-all flex items-center justify-between group",
                                                        isEnabled
                                                            ? "bg-pt-intent-primary/5 border-pt-intent-primary/30"
                                                            : "bg-pt-bg border-pt-border hover:border-pt-border-dark"
                                                    )}
                                                >
                                                    <div className="space-y-1">
                                                        <div className="text-[10px] font-black uppercase tracking-widest text-pt-text">{tool.name}</div>
                                                        <div className="text-[8px] text-pt-text-muted font-bold uppercase opacity-50">{tool.description}</div>
                                                    </div>
                                                    <div className={cn(
                                                        "w-2 h-2 rounded-full transition-all",
                                                        isEnabled ? "bg-pt-intent-primary box-glow" : "bg-pt-border"
                                                    )} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center opacity-20 grayscale">
                            <Sparkles size={64} />
                            <span className="text-[12px] font-black uppercase tracking-[0.4em] mt-4">Select Agent to Configure</span>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
