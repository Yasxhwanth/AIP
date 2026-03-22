'use client';

import React, { useEffect, useState } from 'react';
import { ApiClient } from '@/lib/apiClient';
import {
    BrainCircuit,
    Save,
    Plus,
    Wrench,
    Shield,
    AlertTriangle,
    MessageSquare,
    Play
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Toolbar } from '@/components/ui/Toolbar';

interface AIPAgent {
    id: string;
    projectId: string;
    name: string;
    description?: string;
    systemPrompt?: string;
    allowedTools: string[];
    createdAt: string;
    updatedAt: string;
}

interface AIPToolMeta {
    name: string;
    description: string;
    safetyTier: 'READ' | 'WRITE';
}

export default function AgentStudioPage() {
    const [agents, setAgents] = useState<AIPAgent[]>([]);
    const [tools, setTools] = useState<AIPToolMeta[]>([]);
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<AIPAgent>>({});

    // Chat Simulator
    const [chatInput, setChatInput] = useState('');
    const [chatLog, setChatLog] = useState<{ role: string, content: string }[]>([]);
    const [isSimulating, setIsSimulating] = useState(false);

    useEffect(() => {
        fetchAgents();
        fetchTools();
    }, []);

    const fetchAgents = async () => {
        try {
            const data = await ApiClient.get<AIPAgent[]>('/api/v1/agents');
            setAgents(data);
        } catch (err) {
            console.error('Failed to fetch agents:', err);
        }
    };

    const fetchTools = async () => {
        try {
            const data = await ApiClient.get<AIPToolMeta[]>('/api/v1/aip/tools');
            setTools(data);
        } catch (err) {
            console.error('Failed to fetch tools:', err);
        }
    };

    const handleSelectAgent = (agent: AIPAgent) => {
        setSelectedAgentId(agent.id);
        setFormData({
            name: agent.name,
            description: agent.description,
            systemPrompt: agent.systemPrompt,
            allowedTools: agent.allowedTools || []
        });
        setChatLog([]);
    };

    const handleCreateNew = () => {
        setSelectedAgentId('NEW');
        setFormData({
            name: 'New Agent',
            description: '',
            systemPrompt: 'You are a helpful AI assistant.',
            allowedTools: []
        });
        setChatLog([]);
    };

    const toggleTool = (toolName: string) => {
        const current = formData.allowedTools || [];
        if (current.includes(toolName)) {
            setFormData({ ...formData, allowedTools: current.filter(t => t !== toolName) });
        } else {
            setFormData({ ...formData, allowedTools: [...current, toolName] });
        }
    };

    const handleSave = async () => {
        if (!formData.name) return;
        setIsSaving(true);
        try {
            if (selectedAgentId === 'NEW') {
                const created = await ApiClient.post<AIPAgent>('/api/v1/agents', {
                    projectId: 'global', // Or active project
                    ...formData
                });
                setAgents([created, ...agents]);
                setSelectedAgentId(created.id);
            } else if (selectedAgentId) {
                const updated = await ApiClient.put<AIPAgent>(`/api/v1/agents/${selectedAgentId}`, formData);
                setAgents(agents.map(a => a.id === updated.id ? updated : a));
            }
        } catch (err) {
            alert('Failed to save agent');
        } finally {
            setIsSaving(false);
        }
    };

    const simulateChat = async () => {
        if (!chatInput.trim() || !selectedAgentId || selectedAgentId === 'NEW') return;
        const msg = chatInput;
        setChatInput('');
        setChatLog(prev => [...prev, { role: 'user', content: msg }]);
        setIsSimulating(true);

        try {
            const res = await ApiClient.post<{ answer: string; toolCalls?: any[] }>('/api/v1/aip/assist', {
                message: msg,
                agentId: selectedAgentId,
                page: 'agent-studio'
            });

            setChatLog(prev => [...prev, { role: 'assistant', content: res.answer }]);
        } catch (err: any) {
            setChatLog(prev => [...prev, { role: 'assistant', content: `[Error: ${err.message}]` }]);
        } finally {
            setIsSimulating(false);
        }
    };

    // Calculate dynamic safety tier based on current active formData
    const selectedToolsSet = new Set(formData.allowedTools || []);
    const hasWriteTool = tools.some(t => selectedToolsSet.has(t.name) && t.safetyTier === 'WRITE');
    const safetyTier = hasWriteTool ? 'WRITE_CAPABLE' : 'READ_ONLY';

    return (
        <div className="p-8 h-[calc(100vh-64px)] overflow-hidden flex flex-col">
            <div className="mb-6 flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-2xl font-semibold flex items-center gap-3">
                        <BrainCircuit className="w-7 h-7 text-indigo-400" />
                        Agent Studio
                    </h1>
                    <p className="text-pt-text-muted mt-1">Configure and simulate AI Agents with attached tool calling capabilities.</p>
                </div>
                <Toolbar>
                    <button onClick={handleCreateNew} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm text-white font-medium">
                        <Plus className="w-4 h-4" /> New Agent
                    </button>
                    {selectedAgentId && (
                        <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded text-sm text-white font-medium disabled:opacity-50">
                            <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Agent'}
                        </button>
                    )}
                </Toolbar>
            </div>

            <div className="flex gap-6 h-full min-h-0 bg-pt-bg rounded border border-pt-border">
                {/* LEFT: Agent List */}
                <div className="w-64 border-r border-pt-border overflow-y-auto bg-black/20 shrink-0">
                    <div className="p-4 text-xs font-semibold text-pt-text-muted uppercase tracking-wider">Agents</div>
                    {agents.map(agent => (
                        <button
                            key={agent.id}
                            onClick={() => handleSelectAgent(agent)}
                            className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-pt-border/50 transition-colors border-l-2 ${selectedAgentId === agent.id ? 'border-primary bg-primary/5' : 'border-transparent'}`}
                        >
                            <BrainCircuit className={`w-5 h-5 shrink-0 mt-0.5 ${selectedAgentId === agent.id ? 'text-primary' : 'text-pt-text-muted opacity-50'}`} />
                            <div>
                                <div className="font-medium text-sm text-pt-text">{agent.name}</div>
                                <div className="text-xs text-pt-text-muted mt-0.5" title={agent.description || 'No description'}>
                                    {agent.description ? agent.description.substring(0, 30) + '...' : 'No description'}
                                </div>
                            </div>
                        </button>
                    ))}
                    {selectedAgentId === 'NEW' && (
                        <div className="px-4 py-3 border-l-2 border-primary bg-primary/5 flex items-start gap-3">
                            <Plus className="w-5 h-5 shrink-0 mt-0.5 text-primary" />
                            <div className="font-medium text-sm text-pt-text">New Agent</div>
                        </div>
                    )}
                </div>

                {/* MIDDLE/RIGHT Layout depending on selection */}
                {selectedAgentId ? (
                    <div className="flex-1 flex overflow-hidden">
                        {/* Configuration Form */}
                        <div className="w-1/2 p-6 overflow-y-auto border-r border-pt-border space-y-6">

                            <div className="flex items-center justify-between pb-4 border-b border-pt-border">
                                <h2 className="text-lg font-medium">Configuration</h2>
                                <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${safetyTier === 'WRITE_CAPABLE' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                                    {safetyTier === 'WRITE_CAPABLE' ? <AlertTriangle className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                                    {safetyTier} Safety Tier
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-pt-text-muted mb-1.5">Agent Name</label>
                                    <input
                                        type="text"
                                        value={formData.name || ''}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-black/40 border border-pt-border rounded px-3 py-2 text-sm text-pt-text focus:outline-none focus:border-primary"
                                        placeholder="e.g. Maven Logistics Agent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-pt-text-muted mb-1.5">Description (Internal)</label>
                                    <input
                                        type="text"
                                        value={formData.description || ''}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-black/40 border border-pt-border rounded px-3 py-2 text-sm text-pt-text focus:outline-none focus:border-primary"
                                        placeholder="What does this agent do?"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-pt-text-muted mb-1.5">System Prompt</label>
                                    <textarea
                                        value={formData.systemPrompt || ''}
                                        onChange={e => setFormData({ ...formData, systemPrompt: e.target.value })}
                                        className="w-full h-32 bg-black/40 border border-pt-border rounded px-3 py-2 text-sm font-mono text-pt-text focus:outline-none focus:border-primary resize-none"
                                        placeholder="You are a helpful AI..."
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-pt-border">
                                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                                    <Wrench className="w-4 h-4 text-pt-text-muted" /> Allowed Tools
                                </h3>
                                <div className="space-y-2">
                                    {tools.map(tool => (
                                        <label key={tool.name} className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors ${selectedToolsSet.has(tool.name) ? 'bg-primary/5 border-primary/30' : 'bg-black/20 border-pt-border hover:border-pt-border/80'}`}>
                                            <input
                                                type="checkbox"
                                                className="mt-1"
                                                checked={selectedToolsSet.has(tool.name)}
                                                onChange={() => toggleTool(tool.name)}
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <div className="font-medium text-sm">{tool.name}</div>
                                                    {tool.safetyTier === 'WRITE' && (
                                                        <span className="text-[10px] uppercase font-bold text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded">Write</span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-pt-text-muted mt-1 leading-relaxed">{tool.description}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Simulator */}
                        <div className="flex-1 flex flex-col bg-black/40 relative">
                            <div className="p-4 border-b border-pt-border flex items-center gap-2 shadow-sm bg-pt-bg/50">
                                <MessageSquare className="w-4 h-4 text-pt-text-muted" />
                                <span className="text-sm font-medium">Simulation Sandbox</span>
                            </div>

                            <div className="flex-1 p-6 overflow-y-auto space-y-4">
                                {chatLog.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-pt-text-muted opacity-50 space-y-3">
                                        <BrainCircuit className="w-12 h-12" />
                                        <p className="text-sm">Save your agent and send a message to test its tools.</p>
                                    </div>
                                ) : (
                                    chatLog.map((msg, i) => (
                                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] rounded p-3 text-sm ${msg.role === 'user'
                                                    ? 'bg-blue-600/20 text-blue-100 border border-blue-500/30'
                                                    : 'bg-pt-bg border border-pt-border text-pt-text'
                                                }`}>
                                                <div className="font-semibold text-xs mb-1 opacity-60 uppercase">{msg.role}</div>
                                                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                                {isSimulating && (
                                    <div className="flex justify-start">
                                        <div className="bg-pt-bg border border-pt-border text-pt-text max-w-[85%] rounded p-3 text-sm flex items-center gap-2">
                                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-75" />
                                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-pt-border bg-pt-bg">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={e => setChatInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && simulateChat()}
                                        placeholder="Ask the agent to do something..."
                                        className="w-full bg-black/50 border border-pt-border rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-primary shadow-inner"
                                        disabled={isSimulating || selectedAgentId === 'NEW'}
                                    />
                                    <button
                                        onClick={simulateChat}
                                        disabled={!chatInput.trim() || isSimulating || selectedAgentId === 'NEW'}
                                        className="absolute right-1.5 top-1.5 bottom-1.5 w-10 flex items-center justify-center bg-primary hover:bg-primary/90 text-white rounded-full disabled:opacity-50 transition-colors"
                                    >
                                        <Play className="w-4 h-4 ml-0.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-pt-text-muted">
                        <BrainCircuit className="w-16 h-16 mb-4 opacity-20" />
                        <h2 className="text-xl font-medium mb-2">Agent Studio</h2>
                        <p>Select an agent to configure or create a new one.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
