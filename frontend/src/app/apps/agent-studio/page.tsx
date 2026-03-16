'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { ApiClient } from '@/lib/apiClient';
import { SeverityChip } from '@/components/ui/SeverityChip';
import {
    Bot,
    Wrench,
    Save,
    Plus,
    ChevronRight,
    Terminal as TerminalIcon,
    Shield,
    LayoutGrid,
    SendHorizonal,
    Zap,
    CheckCircle2,
    AlertTriangle,
    RefreshCcw
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Agent {
    id: string;
    name: string;
    description: string;
    systemPrompt: string;
    allowedTools: string[];
    model: string;
    updatedAt: string;
}

interface ToolInfo {
    name: string;
    description: string;
    safetyTier?: 'READ' | 'WRITE';
}

interface PlaygroundMessage {
    role: 'user' | 'assistant';
    content: string;
    usedTools?: string[];
    requiresApproval?: boolean;
    proposalId?: string;
    trace?: any[];
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AgentStudio() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [tools, setTools] = useState<ToolInfo[]>([]);
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'config' | 'playground'>('config');

    // Playground state
    const [messages, setMessages] = useState<PlaygroundMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [testLoading, setTestLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchData = async () => {
        try {
            const [agentsData, toolsData] = await Promise.all([
                ApiClient.get<Agent[]>('/api/v1/agents'),
                ApiClient.get<ToolInfo[]>('/api/v1/aip/tools')
            ]);
            setAgents(agentsData);
            setTools(toolsData);
            if (agentsData.length > 0 && !selectedAgent) {
                setSelectedAgent(agentsData[0]);
            }
        } catch (err) {
            console.error('Failed to fetch Agent Studio data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedAgent) return;
        setSaving(true);
        try {
            if ((selectedAgent.id as string) === 'new') {
                const { id, ...data } = selectedAgent;
                const created = await ApiClient.post<Agent>('/api/v1/agents', data);
                setAgents([created, ...agents.filter(a => a.id !== 'new')]);
                setSelectedAgent(created);
            } else {
                const updated = await ApiClient.put<Agent>(`/api/v1/agents/${selectedAgent.id}`, selectedAgent);
                setAgents(agents.map(a => a.id === updated.id ? updated : a));
            }
        } catch (err) {
            console.error('Failed to save agent', err);
        } finally {
            setSaving(false);
        }
    };

    const handleNewAgent = () => {
        const newAgent: Agent = {
            id: 'new',
            name: 'New Assistant',
            description: 'A specialized AI assistant.',
            systemPrompt: 'You are a helpful assistant for the AIP platform.',
            allowedTools: [],
            model: 'gemini-2.0-flash',
            updatedAt: new Date().toISOString()
        };
        setSelectedAgent(newAgent);
        setMessages([]);
    };

    const toggleTool = (toolName: string) => {
        if (!selectedAgent) return;
        const updated = selectedAgent.allowedTools.includes(toolName)
            ? selectedAgent.allowedTools.filter(t => t !== toolName)
            : [...selectedAgent.allowedTools, toolName];
        setSelectedAgent({ ...selectedAgent, allowedTools: updated });
    };

    const handlePlaygroundSend = async () => {
        if (!inputText.trim() || testLoading || !selectedAgent) return;

        const userMsg: PlaygroundMessage = { role: 'user', content: inputText.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setTestLoading(true);

        try {
            const resp = await ApiClient.post<any>('/api/v1/aip/assist', {
                message: userMsg.content,
                page: 'agent-studio',
                agentId: selectedAgent.id !== 'new' ? selectedAgent.id : undefined,
                vars: { agentName: selectedAgent.name }
            });

            const assistantMsg: PlaygroundMessage = {
                role: 'assistant',
                content: resp.answer || 'No response.',
                usedTools: resp.usedTools || [],
                requiresApproval: resp.requiresApproval || false,
                proposalId: resp.proposalId,
                trace: resp.trace || []
            };
            setMessages(prev => [...prev, assistantMsg]);
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '⚠ Error contacting AIP assist endpoint.',
                usedTools: [],
                trace: []
            }]);
        } finally {
            setTestLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-pt-text-muted animate-pulse font-mono text-xs uppercase tracking-widest">Initializing Agent Studio...</div>;

    return (
        <div className="flex h-screen bg-pt-bg overflow-hidden">
            {/* ── LEFT NAV ── */}
            <div className="w-14 bg-[#10161A] border-r border-[#293742] flex flex-col items-center py-3 shrink-0 z-20">
                <div className="w-8 h-8 bg-pt-intent-primary rounded flex items-center justify-center font-black text-[9px] text-black mb-6">AIP</div>
                <button onClick={() => window.location.href = '/apps'} className="w-10 h-10 flex flex-col items-center justify-center text-[#5C7080] hover:text-white group mb-2">
                    <LayoutGrid className="w-5 h-5 mb-1" />
                    <span className="text-[8px] font-bold">Apps</span>
                </button>
                <button className="w-10 h-10 flex flex-col items-center justify-center text-pt-intent-primary bg-[#182026] group">
                    <Bot className="w-5 h-5 mb-1" />
                    <span className="text-[8px] font-bold">Studio</span>
                </button>
            </div>

            {/* ── SIDEBAR: Agent list ── */}
            <div className="w-60 border-r border-pt-border flex flex-col bg-pt-bg-panel/20 shrink-0">
                <div className="p-4 border-b border-pt-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-pt-intent-primary" />
                        <h2 className="text-[10px] font-black uppercase tracking-widest">Agent Studio</h2>
                    </div>
                    <button onClick={handleNewAgent} className="p-1 hover:bg-pt-bg-hover rounded text-pt-text-muted hover:text-pt-text">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {agents.map(agent => (
                        <div
                            key={agent.id}
                            onClick={() => { setSelectedAgent(agent); setMessages([]); }}
                            className={`p-3 cursor-pointer border-b border-pt-border/30 transition-colors ${selectedAgent?.id === agent.id ? 'bg-pt-bg-hover' : 'hover:bg-pt-bg-hover/50'}`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className={`text-[11px] font-bold truncate ${selectedAgent?.id === agent.id ? 'text-pt-text' : 'text-pt-text-muted'}`}>{agent.name}</span>
                                <ChevronRight className={`w-3 h-3 shrink-0 ${selectedAgent?.id === agent.id ? 'text-pt-intent-primary' : 'text-transparent'}`} />
                            </div>
                            <div className="text-[8px] text-pt-text-muted truncate uppercase tracking-tighter">
                                {agent.model} · {agent.allowedTools.length} tools
                            </div>
                        </div>
                    ))}
                    {agents.length === 0 && (
                        <div className="px-4 py-8 text-center text-[9px] text-pt-text-muted uppercase tracking-widest opacity-40">No agents</div>
                    )}
                </div>
            </div>

            {/* ── MAIN AREA ── */}
            {selectedAgent ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header + Tabs */}
                    <div className="px-6 pt-5 pb-0 border-b border-pt-border bg-pt-bg-panel/10 shrink-0">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <input
                                    className="bg-transparent text-lg font-black focus:outline-none border-b border-transparent focus:border-pt-border text-pt-text"
                                    value={selectedAgent.name}
                                    onChange={e => setSelectedAgent({ ...selectedAgent, name: e.target.value })}
                                />
                                <div className="text-[9px] text-pt-text-muted uppercase tracking-widest mt-0.5">{selectedAgent.model}</div>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 bg-pt-intent-primary text-black font-black text-[10px] uppercase rounded hover:shadow-lg disabled:opacity-50 transition-all"
                            >
                                <Save className="w-3 h-3" />
                                {saving ? 'Saving...' : 'Save Agent'}
                            </button>
                        </div>
                        <div className="flex gap-0">
                            {[
                                { id: 'config', label: 'Configuration', icon: Wrench },
                                { id: 'playground', label: 'Playground', icon: TerminalIcon }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-1.5 px-4 py-2 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === tab.id ? 'border-pt-intent-primary text-pt-text' : 'border-transparent text-pt-text-muted hover:text-pt-text'}`}
                                >
                                    <tab.icon className="w-3 h-3" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Configuration Tab ── */}
                    {activeTab === 'config' && (
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-3 gap-5 h-full">
                                {/* System Prompt */}
                                <div className="col-span-2 space-y-4">
                                    <Card className="p-4 bg-pt-bg-panel/40">
                                        <div className="flex items-center gap-2 mb-3">
                                            <TerminalIcon className="w-4 h-4 text-pt-text-muted" />
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-pt-text-muted">System Prompt</h3>
                                        </div>
                                        <textarea
                                            className="w-full h-56 bg-pt-bg border border-pt-border rounded p-3 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-pt-intent-primary resize-none"
                                            value={selectedAgent.systemPrompt}
                                            onChange={e => setSelectedAgent({ ...selectedAgent, systemPrompt: e.target.value })}
                                            placeholder="Define the agent's personality and instructions..."
                                        />
                                    </Card>

                                    {/* Model Config */}
                                    <Card className="p-4 bg-pt-bg-panel/40">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Shield className="w-4 h-4 text-pt-text-muted" />
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-pt-text-muted">Model & Safety</h3>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[8px] font-black text-pt-text-muted uppercase tracking-widest block mb-1">Model</label>
                                                <select
                                                    className="w-full bg-pt-bg border border-pt-border rounded px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-pt-intent-primary"
                                                    value={selectedAgent.model}
                                                    onChange={e => setSelectedAgent({ ...selectedAgent, model: e.target.value })}
                                                >
                                                    <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                                                    <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                                                    <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[8px] font-black text-pt-text-muted uppercase tracking-widest block mb-1">Safety Tier</label>
                                                <div className={`px-3 py-2 rounded border text-[10px] font-black uppercase ${selectedAgent.allowedTools.some(t => ['propose_change', 'run_pipeline'].includes(t)) ? 'border-pt-intent-warning/50 bg-pt-intent-warning/5 text-pt-intent-warning' : 'border-pt-intent-success/50 bg-pt-intent-success/5 text-pt-intent-success'}`}>
                                                    {selectedAgent.allowedTools.some(t => ['propose_change', 'run_pipeline'].includes(t)) ? '⚡ Write-Capable' : '🔒 Read-Only'}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </div>

                                {/* Tool Registry */}
                                <div className="space-y-4">
                                    <Card className="p-4 bg-pt-bg-panel/40">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Wrench className="w-4 h-4 text-pt-text-muted" />
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-pt-text-muted">Tool Registry</h3>
                                        </div>
                                        <div className="space-y-2">
                                            {tools.map(tool => {
                                                const isEnabled = selectedAgent.allowedTools.includes(tool.name);
                                                const isWrite = tool.safetyTier === 'WRITE';
                                                return (
                                                    <div
                                                        key={tool.name}
                                                        onClick={() => toggleTool(tool.name)}
                                                        className={`p-2 rounded border cursor-pointer transition-all ${isEnabled ? 'bg-pt-intent-primary/10 border-pt-intent-primary/50' : 'bg-pt-bg border-pt-border/50 hover:border-pt-border'}`}
                                                    >
                                                        <div className="flex items-center justify-between mb-0.5">
                                                            <span className="text-[10px] font-bold">{tool.name}</span>
                                                            <div className="flex items-center gap-1">
                                                                {isWrite && <span className="text-[7px] font-black text-pt-intent-warning uppercase">WRITE</span>}
                                                                {isEnabled && <div className="w-1.5 h-1.5 rounded-full bg-pt-intent-primary" />}
                                                            </div>
                                                        </div>
                                                        <div className="text-[8px] text-pt-text-muted line-clamp-1">{tool.description}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Playground Tab ── */}
                    {activeTab === 'playground' && (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-20">
                                        <Bot className="w-12 h-12" />
                                        <div className="text-[10px] font-black uppercase tracking-widest">Send a message to test {selectedAgent.name}</div>
                                        <div className="text-[8px] text-pt-text-muted">Tools: {selectedAgent.allowedTools.length > 0 ? selectedAgent.allowedTools.join(', ') : 'none selected'}</div>
                                    </div>
                                )}
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                                            <div className={`px-4 py-3 rounded-lg text-sm font-medium leading-relaxed ${msg.role === 'user' ? 'bg-pt-intent-primary text-black rounded-br-none' : 'bg-pt-bg-panel border border-pt-border text-pt-text rounded-bl-none'}`}>
                                                {msg.content}
                                            </div>

                                            {/* Tool trace chips */}
                                            {msg.usedTools && msg.usedTools.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {msg.usedTools.map(t => (
                                                        <div key={t} className="flex items-center gap-1 px-2 py-0.5 bg-pt-bg border border-pt-border/50 rounded-full text-[8px] font-black text-pt-text-muted uppercase">
                                                            <Zap className="w-2 h-2 text-pt-intent-warning" />
                                                            {t}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Approval required badge */}
                                            {msg.requiresApproval && (
                                                <div className="flex items-center gap-2 px-3 py-2 bg-pt-intent-warning/10 border border-pt-intent-warning/30 rounded text-[9px] font-black text-pt-intent-warning uppercase">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    Approval Required · Proposal: {msg.proposalId?.slice(0, 8)}...
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {testLoading && (
                                    <div className="flex justify-start">
                                        <div className="px-4 py-3 bg-pt-bg-panel border border-pt-border rounded-lg rounded-bl-none flex items-center gap-2">
                                            <RefreshCcw className="w-3 h-3 animate-spin text-pt-intent-primary" />
                                            <span className="text-[10px] font-black text-pt-text-muted uppercase tracking-widest">Thinking...</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="border-t border-pt-border p-4 bg-pt-bg-panel/10 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 flex items-center gap-2 bg-pt-bg border border-pt-border rounded-lg px-4 py-2 focus-within:ring-1 focus-within:ring-pt-intent-primary">
                                        <Bot className="w-4 h-4 text-pt-text-muted shrink-0" />
                                        <input
                                            type="text"
                                            className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-pt-text-muted"
                                            placeholder={`Message ${selectedAgent.name}...`}
                                            value={inputText}
                                            onChange={e => setInputText(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePlaygroundSend(); } }}
                                            disabled={testLoading}
                                        />
                                    </div>
                                    <button
                                        onClick={handlePlaygroundSend}
                                        disabled={testLoading || !inputText.trim()}
                                        className="p-2.5 bg-pt-intent-primary text-black rounded-lg hover:shadow-lg disabled:opacity-40 transition-all"
                                    >
                                        <SendHorizonal className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="mt-2 flex items-center gap-3 text-[8px] text-pt-text-muted font-bold uppercase">
                                    <div className="flex items-center gap-1">
                                        <CheckCircle2 className="w-2 h-2 text-pt-intent-success" />
                                        <span>{selectedAgent.allowedTools.length} Tools Active</span>
                                    </div>
                                    <div className="w-px h-3 bg-pt-border" />
                                    <span>{selectedAgent.model}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-pt-text-muted uppercase text-[10px] tracking-widest font-black">
                    Select an agent to begin
                </div>
            )}
        </div>
    );
}
