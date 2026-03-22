'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/apiClient';
import {
    Bot,
    Brain,
    ChevronRight,
    FlaskConical,
    ShieldCheck,
    ShieldAlert,
    Wrench,
    Zap,
    AlertCircle,
    RefreshCcw,
    Eye,
    BookOpen,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SeverityChip } from '@/components/ui/SeverityChip';

interface AIPAgent {
    id: string;
    name: string;
    description?: string;
    allowedTools: string[];
    safetyTier?: string;
    enabled: boolean;
    updatedAt: string;
}

interface Tool {
    name: string;
    description: string;
    safetyTier: string;
}

// ─── Quick-link card ──────────────────────────────────────────────────────────
const ActionCard = ({
    href, icon: Icon, label, description, pill, pillColor
}: {
    href: string;
    icon: React.ElementType;
    label: string;
    description: string;
    pill: string;
    pillColor: 'primary' | 'success' | 'warning';
}) => {
    const colors = {
        primary: 'border-pt-intent-primary/20 bg-pt-intent-primary/5 text-pt-intent-primary',
        success: 'border-pt-intent-success/20 bg-pt-intent-success/5 text-pt-intent-success',
        warning: 'border-pt-intent-warning/20 bg-pt-intent-warning/5 text-pt-intent-warning',
    };
    return (
        <Link href={href} className="group flex flex-col h-full bg-pt-bg-panel/40 border border-pt-border hover:border-pt-intent-primary/40 rounded p-5 transition-all hover:bg-pt-intent-primary/[0.02] cursor-pointer">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-9 h-9 rounded flex items-center justify-center border ${colors[pillColor]}`}>
                    <Icon size={18} />
                </div>
                <ChevronRight size={14} className="text-pt-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
            <div className="text-[12px] font-black uppercase tracking-tight text-pt-text mb-1">{label}</div>
            <div className="text-[10px] text-pt-text-muted font-bold opacity-60 leading-relaxed flex-1">{description}</div>
            <div className={`mt-4 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm border self-start ${colors[pillColor]}`}>
                {pill}
            </div>
        </Link>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AIPOverviewPage() {
    const [agents, setAgents] = useState<AIPAgent[]>([]);
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            ApiClient.get<AIPAgent[]>('/api/v1/agents'),
            ApiClient.get<Tool[]>('/api/v1/aip/tools'),
        ]).then(([a, t]) => {
            setAgents(a);
            setTools(t);
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    const enabledAgents = agents.filter(a => a.enabled);
    const writeTools = tools.filter(t => t.safetyTier === 'WRITE');
    const readTools = tools.filter(t => t.safetyTier !== 'WRITE');

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-pt-bg overflow-y-auto custom-scrollbar">
            {/* Hero Header */}
            <div className="px-8 py-8 border-b border-pt-border bg-gradient-to-br from-pt-bg-panel/40 to-transparent shrink-0">
                <div className="flex items-start justify-between max-w-5xl">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded bg-pt-intent-primary/20 border border-pt-intent-primary/30 flex items-center justify-center">
                                <FlaskConical size={20} className="text-pt-intent-primary" />
                            </div>
                            <div>
                                <SeverityChip severity="info" label="AIP_INTELLIGENCE_LAYER" className="text-[8px]" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-black text-pt-text uppercase tracking-tight mt-2">
                            AI Platform
                        </h1>
                        <p className="text-[11px] text-pt-text-muted font-bold uppercase tracking-widest mt-1.5 opacity-70">
                            Agents · Tools · Governance · Gemini-backed execution
                        </p>
                    </div>
                    <div className="flex gap-6 text-right">
                        {loading ? (
                            <RefreshCcw size={16} className="animate-spin text-pt-text-muted opacity-30 mt-2" />
                        ) : (
                            <>
                                <div>
                                    <div className="text-2xl font-black text-pt-text">{enabledAgents.length}</div>
                                    <div className="text-[8px] font-black text-pt-text-muted uppercase tracking-widest opacity-50">Active Agents</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-black text-pt-text">{tools.length}</div>
                                    <div className="text-[8px] font-black text-pt-text-muted uppercase tracking-widest opacity-50">Tools Registered</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-black text-pt-intent-warning">{writeTools.length}</div>
                                    <div className="text-[8px] font-black text-pt-text-muted uppercase tracking-widest opacity-50">Write-capable</div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="px-8 py-6 shrink-0">
                <div className="text-[9px] font-black uppercase tracking-[0.3em] text-pt-text-muted mb-4">Quick Access</div>
                <div className="grid grid-cols-3 gap-4 max-w-3xl">
                    <ActionCard
                        href="/aip/agent-studio"
                        icon={Bot}
                        label="Agent Studio"
                        description="Configure agent prompts, tool grants, and safety tiers."
                        pill="Configure"
                        pillColor="primary"
                    />
                    <ActionCard
                        href="/sre/governance"
                        icon={BookOpen}
                        label="Change Requests"
                        description="Review and approve pending agent or ontology change proposals."
                        pill="Governance"
                        pillColor="warning"
                    />
                    <ActionCard
                        href="/sre/audit"
                        icon={Eye}
                        label="Audit Trail"
                        description="Who changed what, when — immutable log of all agent actions."
                        pill="Compliance"
                        pillColor="success"
                    />
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="px-8 pb-8 grid grid-cols-5 gap-6">
                {/* Agent Roster */}
                <div className="col-span-2">
                    <Card title="Active Agents" pill={`${enabledAgents.length} ONLINE`}>
                        <div className="space-y-2">
                            {agents.length === 0 && !loading && (
                                <div className="py-8 text-center opacity-20">
                                    <Brain size={24} className="mx-auto mb-2" />
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em]">No agents registered</p>
                                </div>
                            )}
                            {agents.map(agent => (
                                <Link
                                    key={agent.id}
                                    href="/aip/agent-studio"
                                    className="flex items-center justify-between p-3 rounded bg-pt-bg border border-pt-border/50 hover:border-pt-intent-primary/30 transition-all group"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-2 h-2 rounded-full ${agent.enabled ? 'bg-pt-intent-success shadow-[0_0_4px_rgba(0,200,100,0.5)]' : 'bg-pt-text-muted opacity-30'}`} />
                                        <div>
                                            <div className="text-[10px] font-black uppercase text-pt-text">{agent.name}</div>
                                            <div className="text-[8px] font-mono text-pt-text-muted opacity-40 mt-0.5">{agent.allowedTools?.length || 0} tools</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {agent.safetyTier === 'WRITE_CAPABLE'
                                            ? <ShieldAlert size={10} className="text-pt-intent-warning" />
                                            : <ShieldCheck size={10} className="text-pt-intent-success opacity-50" />
                                        }
                                        <ChevronRight size={10} className="text-pt-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Tool Catalog */}
                <div className="col-span-3">
                    <Card title="Tool Catalog" pill={`${tools.length} REGISTERED`}>
                        {/* Safety summary */}
                        <div className="flex items-center gap-4 mb-4 p-3 rounded bg-pt-bg border border-pt-border/50">
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={12} className="text-pt-intent-success" />
                                <span className="text-[9px] font-black uppercase text-pt-intent-success">{readTools.length} Read-only</span>
                            </div>
                            <div className="w-px h-4 bg-pt-border" />
                            <div className="flex items-center gap-2">
                                <ShieldAlert size={12} className="text-pt-intent-warning" />
                                <span className="text-[9px] font-black uppercase text-pt-intent-warning">{writeTools.length} Write-capable (require approval)</span>
                            </div>
                        </div>
                        <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                            {tools.map(tool => (
                                <div key={tool.name} className="flex items-center gap-3 p-2.5 rounded bg-pt-bg border border-pt-border/40">
                                    <Wrench size={10} className={tool.safetyTier === 'WRITE' ? 'text-pt-intent-warning' : 'text-pt-text-muted opacity-40'} />
                                    <div className="flex-1 min-w-0">
                                        <span className={`text-[9px] font-black uppercase tracking-tight ${tool.safetyTier === 'WRITE' ? 'text-pt-intent-warning' : 'text-pt-text'}`}>
                                            {tool.name}
                                        </span>
                                        <p className="text-[8px] text-pt-text-muted opacity-50 mt-0.5 truncate">{tool.description}</p>
                                    </div>
                                    <div className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded-sm border ${tool.safetyTier === 'WRITE'
                                            ? 'border-pt-intent-warning/30 bg-pt-intent-warning/5 text-pt-intent-warning'
                                            : 'border-pt-border bg-pt-bg text-pt-text-muted'
                                        }`}>
                                        {tool.safetyTier}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
