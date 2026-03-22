'use client';

import React, { useEffect, useState } from 'react';
import { ApiClient } from '@/lib/apiClient';
import {
    Bot,
    Brain,
    ChevronRight,
    Eye,
    EyeOff,
    Lock,
    RefreshCcw,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Wrench,
    Zap,
    AlertCircle,
    Edit3,
    Save,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { SeverityChip } from '@/components/ui/SeverityChip';
import { Toolbar } from '@/components/ui/Toolbar';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AIPAgent {
    id: string;
    name: string;
    description?: string;
    systemPrompt?: string;
    allowedTools: string[];
    modelId?: string;
    safetyTier?: string;
    enabled: boolean;
    updatedAt: string;
    createdAt: string;
}

// ─── Safety Tier Badge ────────────────────────────────────────────────────────
const SafetyBadge = ({ tier }: { tier: string }) => {
    const isWrite = tier === 'WRITE_CAPABLE';
    return (
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest border ${isWrite
                ? 'bg-pt-intent-warning/10 border-pt-intent-warning/30 text-pt-intent-warning'
                : 'bg-pt-intent-success/10 border-pt-intent-success/30 text-pt-intent-success'
            }`}>
            {isWrite ? <ShieldAlert size={10} /> : <ShieldCheck size={10} />}
            {isWrite ? 'WRITE_CAPABLE' : 'READ_ONLY'}
        </div>
    );
};

// ─── Tool Chip ─────────────────────────────────────────────────────────────────
const ToolChip = ({ name }: { name: string }) => (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-pt-bg border border-pt-border rounded text-[8px] font-mono text-pt-text-muted uppercase">
        <Wrench size={8} />
        {name}
    </span>
);

// ─── Agent Detail Panel ────────────────────────────────────────────────────────
const AgentDetailPanel = ({
    agent,
    onUpdate
}: {
    agent: AIPAgent;
    onUpdate: (id: string, patch: Partial<AIPAgent>) => void;
}) => {
    const [editingPrompt, setEditingPrompt] = useState(false);
    const [promptDraft, setPromptDraft] = useState(agent.systemPrompt || '');
    const [saving, setSaving] = useState(false);

    const handleSavePrompt = async () => {
        setSaving(true);
        try {
            await ApiClient.put(`/api/v1/agents/${agent.id}`, { systemPrompt: promptDraft });
            onUpdate(agent.id, { systemPrompt: promptDraft });
            setEditingPrompt(false);
        } finally {
            setSaving(false);
        }
    };

    const handleToggleSafety = async () => {
        const next = agent.safetyTier === 'WRITE_CAPABLE' ? 'READ_ONLY' : 'WRITE_CAPABLE';
        setSaving(true);
        try {
            await ApiClient.put(`/api/v1/agents/${agent.id}`, { safetyTier: next });
            onUpdate(agent.id, { safetyTier: next });
        } finally {
            setSaving(false);
        }
    };

    const handleToggleEnabled = async () => {
        const next = !agent.enabled;
        setSaving(true);
        try {
            await ApiClient.put(`/api/v1/agents/${agent.id}`, { enabled: next });
            onUpdate(agent.id, { enabled: next });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col min-h-0">
            <header className="p-6 border-b border-pt-border">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded flex items-center justify-center ${agent.enabled ? 'bg-pt-intent-primary/20' : 'bg-pt-bg-hover'}`}>
                            <Bot size={16} className={agent.enabled ? 'text-pt-intent-primary' : 'text-pt-text-muted'} />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-pt-text uppercase tracking-tight">{agent.name}</h2>
                            <p className="text-[9px] text-pt-text-muted font-mono opacity-50 mt-0.5">ID: {agent.id.slice(0, 16)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <SafetyBadge tier={agent.safetyTier || 'READ_ONLY'} />
                    </div>
                </div>
                {agent.description && (
                    <p className="text-[10px] text-pt-text-muted font-bold mt-2 opacity-70 uppercase tracking-tight">{agent.description}</p>
                )}
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {/* Controls */}
                <div className="flex items-center gap-3 flex-wrap">
                    <button
                        onClick={handleToggleSafety}
                        disabled={saving}
                        className="flex items-center gap-2 px-3 py-1.5 bg-pt-bg border border-pt-border rounded text-[9px] font-black uppercase hover:border-pt-intent-primary/50 transition-all disabled:opacity-50"
                    >
                        <Shield size={12} className="text-pt-text-muted" />
                        Toggle Safety Tier
                    </button>
                    <button
                        onClick={handleToggleEnabled}
                        disabled={saving}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded text-[9px] font-black uppercase border transition-all disabled:opacity-50 ${agent.enabled
                                ? 'bg-pt-intent-success/10 border-pt-intent-success/30 text-pt-intent-success hover:bg-pt-intent-success/20'
                                : 'bg-pt-intent-danger/10 border-pt-intent-danger/30 text-pt-intent-danger hover:bg-pt-intent-danger/20'
                            }`}
                    >
                        {agent.enabled ? <Eye size={12} /> : <EyeOff size={12} />}
                        {agent.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                </div>

                {/* System Prompt */}
                <Card title="System Prompt" pill="CONTEXT_INJECTION">
                    <div className="space-y-3">
                        {editingPrompt ? (
                            <>
                                <textarea
                                    value={promptDraft}
                                    onChange={(e) => setPromptDraft(e.target.value)}
                                    className="w-full h-48 bg-pt-bg border border-pt-intent-primary/40 rounded p-3 text-[10px] font-mono text-pt-text focus:outline-none focus:border-pt-intent-primary transition-colors resize-none"
                                />
                                <div className="flex items-center gap-2 justify-end">
                                    <button
                                        onClick={() => setEditingPrompt(false)}
                                        className="px-3 py-1 text-[9px] font-black uppercase text-pt-text-muted hover:text-pt-text"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSavePrompt}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-4 py-1.5 bg-pt-intent-primary text-white rounded text-[9px] font-black uppercase disabled:opacity-50"
                                    >
                                        <Save size={10} />
                                        {saving ? 'Saving…' : 'Save Prompt'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="bg-pt-bg border border-pt-border rounded p-3 max-h-48 overflow-y-auto">
                                    <pre className="text-[10px] font-mono text-pt-text-muted whitespace-pre-wrap opacity-80">
                                        {agent.systemPrompt || 'No system prompt configured.'}
                                    </pre>
                                </div>
                                <button
                                    onClick={() => { setPromptDraft(agent.systemPrompt || ''); setEditingPrompt(true); }}
                                    className="flex items-center gap-2 text-[9px] font-black uppercase text-pt-text-muted hover:text-pt-intent-primary transition-colors"
                                >
                                    <Edit3 size={10} />
                                    Edit Prompt
                                </button>
                            </>
                        )}
                    </div>
                </Card>

                {/* Tool Grants */}
                <Card title="Allowed Tools" pill={`${agent.allowedTools?.length || 0} GRANTED`}>
                    <div className="flex flex-wrap gap-2">
                        {(agent.allowedTools || []).length > 0 ? (
                            agent.allowedTools.map(t => <ToolChip key={t} name={t} />)
                        ) : (
                            <span className="text-[9px] text-pt-text-muted opacity-30 uppercase font-black tracking-widest">No tools granted — defaults to registry</span>
                        )}
                    </div>
                </Card>

                {/* Meta */}
                <Card title="Model & Configuration" pill="RUNTIME_CONFIG">
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'Model', value: agent.modelId || 'gemini-2.0-flash (default)' },
                            { label: 'Safety Tier', value: agent.safetyTier || 'READ_ONLY' },
                            { label: 'Last Updated', value: formatDistanceToNow(new Date(agent.updatedAt), { addSuffix: true }) },
                            { label: 'Created', value: new Date(agent.createdAt).toLocaleDateString() },
                        ].map(({ label, value }) => (
                            <div key={label} className="space-y-1">
                                <div className="text-[8px] font-black text-pt-text-muted uppercase tracking-widest">{label}</div>
                                <div className="text-[10px] font-bold text-pt-text uppercase">{value}</div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AgentStudioPage() {
    const [agents, setAgents] = useState<AIPAgent[]>([]);
    const [tools, setTools] = useState<{ name: string; safetyTier: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<AIPAgent | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [agentData, toolData] = await Promise.all([
                ApiClient.get<AIPAgent[]>('/api/v1/agents'),
                ApiClient.get<any[]>('/api/v1/aip/tools'),
            ]);
            setAgents(agentData);
            setTools(toolData);
            if (agentData.length > 0 && !selected) setSelected(agentData[0]);
            setError(null);
        } catch (e) {
            setError('AGENT_STUDIO_LOAD_FAILURE');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleUpdate = (id: string, patch: Partial<AIPAgent>) => {
        setAgents(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a));
        setSelected(prev => prev?.id === id ? { ...prev, ...patch } : prev);
    };

    if (loading && agents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-pt-bg">
                <RefreshCcw className="w-10 h-10 animate-spin text-pt-intent-primary" />
                <p className="mt-6 text-[11px] font-black uppercase tracking-[0.4em] animate-pulse">Initializing Agent Studio</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-pt-bg">
            {/* Header */}
            <header className="px-6 py-4 border-b border-pt-border bg-pt-bg-panel/20 shrink-0">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <SeverityChip severity="info" label="AIP_AGENT_STUDIO" className="text-[8px]" />
                            <span className="text-[9px] font-mono text-pt-text-muted opacity-50">
                                {tools.length} TOOLS_REGISTERED · {agents.filter(a => a.enabled).length}/{agents.length} AGENTS_ACTIVE
                            </span>
                        </div>
                        <h1 className="text-xl font-black text-pt-text uppercase tracking-tight">Agent Studio</h1>
                        <p className="text-[10px] text-pt-text-muted font-bold uppercase tracking-widest mt-1">
                            Configure agents, prompts, tools, and safety tiers
                        </p>
                    </div>
                    <button onClick={fetchData} className="flex items-center gap-2 bg-pt-bg border border-pt-border px-3 py-1.5 rounded text-[9px] font-black uppercase text-pt-text-muted hover:text-pt-text transition-all">
                        <RefreshCcw size={12} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>
            </header>

            {/* Tool Catalog Strip */}
            <Toolbar className="shrink-0 bg-pt-bg/50 flex-wrap gap-2">
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-pt-text-muted mr-2">
                    <Zap size={10} className="text-pt-intent-primary" />
                    Tool Catalog:
                </div>
                {tools.map(t => (
                    <div key={t.name} className={`flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-mono border ${t.safetyTier === 'WRITE'
                            ? 'border-pt-intent-warning/30 text-pt-intent-warning bg-pt-intent-warning/5'
                            : 'border-pt-border text-pt-text-muted bg-pt-bg'
                        }`}>
                        <Wrench size={8} />
                        {t.name}
                    </div>
                ))}
            </Toolbar>

            {error && (
                <div className="mx-6 mt-4 flex items-center gap-3 p-3 rounded border border-pt-intent-danger/30 bg-pt-intent-danger/5 text-pt-intent-danger">
                    <AlertCircle size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
                </div>
            )}

            {/* Main Layout: list + detail */}
            <main className="flex-1 overflow-hidden flex p-6 gap-6">
                {/* Agent List */}
                <div className="w-72 shrink-0 flex flex-col min-h-0 bg-pt-bg-panel/40 border border-pt-border rounded">
                    <div className="p-3 border-b border-pt-border bg-pt-bg/30 flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-pt-text-muted">Registered Agents</span>
                        <span className="text-[9px] font-black text-pt-intent-primary">{agents.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {agents.map(agent => (
                            <div
                                key={agent.id}
                                onClick={() => setSelected(agent)}
                                className={`p-4 border-b border-pt-border/30 cursor-pointer transition-all group ${selected?.id === agent.id
                                        ? 'bg-pt-intent-primary/[0.05] border-l-2 border-l-pt-intent-primary'
                                        : 'hover:bg-pt-intent-primary/[0.02]'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Bot size={12} className={agent.enabled ? 'text-pt-intent-primary' : 'text-pt-text-muted'} />
                                        <span className="text-[11px] font-black uppercase text-pt-text">{agent.name}</span>
                                    </div>
                                    <ChevronRight size={12} className="text-pt-text-muted group-hover:translate-x-1 transition-transform" />
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <SafetyBadge tier={agent.safetyTier || 'READ_ONLY'} />
                                    {!agent.enabled && (
                                        <span className="text-[8px] font-black uppercase text-pt-text-muted opacity-40">DISABLED</span>
                                    )}
                                </div>
                                <div className="mt-2 text-[8px] text-pt-text-muted opacity-40 font-mono">
                                    {agent.allowedTools?.length || 0} tools · updated {formatDistanceToNow(new Date(agent.updatedAt), { addSuffix: true })}
                                </div>
                            </div>
                        ))}
                        {agents.length === 0 && !loading && (
                            <div className="p-12 text-center opacity-20">
                                <Brain size={32} className="mx-auto mb-4" />
                                <p className="text-[9px] font-black uppercase tracking-[0.4em]">No Agents Registered</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Detail Panel */}
                <div className="flex-1 flex flex-col min-h-0 bg-pt-bg-panel/40 border border-pt-border rounded overflow-hidden">
                    {selected ? (
                        <AgentDetailPanel agent={selected} onUpdate={handleUpdate} />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center opacity-20">
                            <Bot size={48} className="mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-[0.5em]">Select an Agent to Configure</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
