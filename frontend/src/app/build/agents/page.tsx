"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Database, Cpu, MessageSquare, Settings, Save, Trash2, Edit2, Play, Hash, Key, Loader2, Sparkles, ServerCrash, Bot, User, Code2 } from "lucide-react";
import { ApiClient } from "@/lib/apiClient";
import { useWorkspaceStore } from "@/store/workspace";

// ── Types ─────────────────────────────────────────────────────────────────
interface AIPAgent {
    id: string;
    name: string;
    description: string | null;
    systemPrompt: string;
    modelConfig: any;
    ontologyAccess: string[]; // Array of EntityType IDs
    tools?: string[]; // Array of AIPFunction string IDs
}

interface EntityType {
    id: string;
    name: string;
}

interface AIPFunction {
    id: string;
    name: string;
    description: string;
}

interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    _debug_context?: string;
}

export default function AgentStudioPage() {
    const { activeProjectId } = useWorkspaceStore();
    const [loading, setLoading] = useState(true);

    // Data
    const [agents, setAgents] = useState<AIPAgent[]>([]);
    const [entityTypes, setEntityTypes] = useState<EntityType[]>([]);
    const [availableTools, setAvailableTools] = useState<AIPFunction[]>([]);

    // Editor State
    const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form State for Active Agent
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [systemPrompt, setSystemPrompt] = useState("");
    const [ontologyAccess, setOntologyAccess] = useState<Set<string>>(new Set());
    const [selectedTools, setSelectedTools] = useState<Set<string>>(new Set());

    // Chat State
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState("");
    const [isChatting, setIsChatting] = useState(false);
    const chatBottomRef = useRef<HTMLDivElement>(null);

    // ── Load Initial Data ────────────────────────────────────────────────
    useEffect(() => {
        if (!activeProjectId) return;
        Promise.all([
            ApiClient.get<AIPAgent[]>("/api/agents"),
            ApiClient.get<EntityType[]>("/api/ontology/entity-types"),
            ApiClient.get<AIPFunction[]>("/api/functions")
        ]).then(([agts, ets, functs]) => {
            setAgents(agts);
            setEntityTypes(ets);
            setAvailableTools(functs);
            if (agts.length > 0) selectAgent(agts[0]);
        }).catch(console.error).finally(() => setLoading(false));
    }, [activeProjectId]);

    // ── Actions ────────────────────────────────────────────────────────
    const selectAgent = (agent: AIPAgent) => {
        setActiveAgentId(agent.id);
        setName(agent.name);
        setDescription(agent.description || "");
        setSystemPrompt(agent.systemPrompt);
        setOntologyAccess(new Set(agent.ontologyAccess || []));
        setSelectedTools(new Set(agent.tools || []));
        setChatMessages([{
            id: 'init', role: 'assistant',
            content: `Hello. I am ${agent.name}. How can I help you today?`
        }]);
    };

    const handleCreateNew = () => {
        setActiveAgentId(null);
        setName("New Agent");
        setDescription("");
        setSystemPrompt("You are a helpful assistant expert in analyzing the provided ontology data.");
        setOntologyAccess(new Set());
        setSelectedTools(new Set());
        setChatMessages([]);
    };

    const handleSave = async () => {
        if (!name || !systemPrompt) return alert("Name and System Prompt are required.");
        setIsSaving(true);
        try {
            const payload = {
                id: activeAgentId,
                name, description, systemPrompt,
                ontologyAccess: Array.from(ontologyAccess),
                tools: Array.from(selectedTools)
            };
            const savedAgent = await ApiClient.post<AIPAgent>("/api/agents", payload);

            // Update local state
            setAgents(prev => {
                const idx = prev.findIndex(a => a.id === savedAgent.id);
                if (idx >= 0) { const next = [...prev]; next[idx] = savedAgent; return next; }
                return [savedAgent, ...prev];
            });
            setActiveAgentId(savedAgent.id);
        } catch (e) {
            console.error(e);
            alert("Failed to save agent.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleOntology = (id: string) => {
        setOntologyAccess(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleToggleTool = (id: string) => {
        setSelectedTools(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    // ── Chat Interaction ──────────────────────────────────────────────────
    const handleSendMessage = async () => {
        if (!chatInput.trim() || !activeAgentId) return;

        const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', content: chatInput };
        setChatMessages(prev => [...prev, userMessage]);
        setChatInput("");
        setIsChatting(true);

        try {
            const res = await ApiClient.post<ChatMessage>(`/api/agents/${activeAgentId}/chat`, {
                message: userMessage.content
            });
            setChatMessages(prev => [...prev, { ...res, id: (Date.now() + 1).toString() }]);
        } catch (e: any) {
            setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: `[Error communicating with backing model: ${e?.message}]` }]);
        } finally {
            setIsChatting(false);
        }
    };

    // Auto-scroll chat
    useEffect(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages, isChatting]);

    // ── Views ─────────────────────────────────────────────────────────────
    if (loading) return <div className="h-full w-full bg-[#F5F8FA] text-[#182026] p-8">Loading AIP Agent Studio...</div>;

    const hasUnsavedChanges = false; // Simplified for now

    return (
        <div className="flex h-screen w-full bg-[#182026] text-white font-[Inter,sans-serif] overflow-hidden">

            {/* ── LEFT NAV (App Chrome) ── */}
            <div className="w-14 bg-[#10161A] border-r border-[#293742] flex flex-col items-center py-3 shrink-0 z-20">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold mb-6">AIP</div>
                <button className="w-10 h-10 flex flex-col items-center justify-center text-[#137CBD] group relative">
                    <Sparkles className="w-5 h-5 mb-1" />
                    <span className="text-[9px] font-bold">Agents</span>
                </button>
            </div>

            <div className="flex-1 flex bg-[#F5F8FA] text-[#182026]">
                {/* ── AGENT LIST SIDEBAR ── */}
                <div className="w-64 bg-white border-r border-[#CED9E0] flex flex-col shrink-0">
                    <div className="p-3 border-b border-[#CED9E0] bg-[#F5F8FA] flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#5C7080] uppercase tracking-wider">Agents</span>
                        <button onClick={handleCreateNew} className="text-[#137CBD] hover:bg-[#EBF1F5] p-1 rounded transition-colors"><Plus size={14} /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {agents.map(ag => (
                            <div
                                key={ag.id}
                                onClick={() => selectAgent(ag)}
                                className={`px-3 py-2.5 rounded cursor-pointer text-[12px] transition-colors flex items-center justify-between group ${activeAgentId === ag.id ? 'bg-[#EBF1F5] border-[#137CBD] border-l-2 text-[#182026] font-bold shadow-sm' : 'border-l-2 border-transparent hover:bg-[#F5F8FA] text-[#5C7080] font-medium'}`}
                            >
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <Bot size={14} className={activeAgentId === ag.id ? 'text-[#137CBD]' : 'text-[#5C7080]'} />
                                    <span className="truncate">{ag.name}</span>
                                </div>
                            </div>
                        ))}
                        {agents.length === 0 && (
                            <div className="p-4 text-center text-[11px] text-[#5C7080]">No agents created yet.</div>
                        )}
                    </div>
                </div>

                {/* ── CENTER CANVAS (Agent Config) ── */}
                <div className="flex-1 flex flex-col min-w-0 border-r border-[#CED9E0]">
                    {/* Header */}
                    <div className="h-12 bg-white border-b border-[#CED9E0] flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
                        <div className="flex items-center gap-3">
                            <h1 className="text-[15px] font-bold">{activeAgentId ? 'Configure Agent' : 'New Agent'}</h1>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="h-7 px-4 bg-[#137CBD] hover:bg-[#0E6694] text-white text-[11px] font-bold rounded shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                            Save Configuration
                        </button>
                    </div>

                    {/* Scrollable Config Area */}
                    <div className="flex-1 overflow-auto p-8">
                        <div className="max-w-2xl mx-auto space-y-8 pb-20">

                            {/* Basics */}
                            <section className="bg-white border border-[#CED9E0] shadow-sm rounded-lg overflow-hidden">
                                <div className="px-5 py-3 border-b border-[#CED9E0] bg-[#F5F8FA]">
                                    <h2 className="text-[12px] font-bold text-[#182026] flex items-center gap-2"><Settings size={14} className="text-[#5C7080]" /> Basic Information</h2>
                                </div>
                                <div className="p-5 space-y-4">
                                    <div>
                                        <label className="block text-[11px] font-bold text-[#5C7080] uppercase tracking-wider mb-1.5">Agent Name</label>
                                        <input
                                            type="text" value={name} onChange={e => setName(e.target.value)}
                                            placeholder="e.g. Logistics Analyst"
                                            className="w-full text-[13px] font-medium p-2 bg-white border border-[#CED9E0] rounded focus:outline-none focus:border-[#137CBD] focus:ring-1 focus:ring-[#137CBD]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-[#5C7080] uppercase tracking-wider mb-1.5">Description (Internal)</label>
                                        <input
                                            type="text" value={description} onChange={e => setDescription(e.target.value)}
                                            placeholder="What does this agent do?"
                                            className="w-full text-[12px] p-2 bg-white border border-[#CED9E0] rounded focus:outline-none focus:border-[#137CBD] focus:ring-1 focus:ring-[#137CBD]"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Prompts */}
                            <section className="bg-white border border-[#CED9E0] shadow-sm rounded-lg overflow-hidden">
                                <div className="px-5 py-3 border-b border-[#CED9E0] bg-[#F5F8FA]">
                                    <h2 className="text-[12px] font-bold text-[#182026] flex items-center gap-2"><Cpu size={14} className="text-[#5C7080]" /> System Instructions</h2>
                                </div>
                                <div className="p-5">
                                    <label className="block text-[11px] text-[#5C7080] mb-2">Define the persona, rules, and behavioral constraints for the LLM. It will follow these instructions implicitly.</label>
                                    <textarea
                                        value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)}
                                        rows={8}
                                        className="w-full text-[13px] font-mono leading-relaxed p-3 bg-white border border-[#CED9E0] rounded focus:outline-none focus:border-[#137CBD] focus:ring-1 focus:ring-[#137CBD] resize-y"
                                        placeholder="You are an expert assistant..."
                                    />
                                </div>
                            </section>

                            {/* Ontology Access (Tools) */}
                            <section className="bg-white border border-[#CED9E0] shadow-sm rounded-lg overflow-hidden">
                                <div className="px-5 py-3 border-b border-[#CED9E0] bg-[#F5F8FA]">
                                    <h2 className="text-[12px] font-bold text-[#182026] flex items-center gap-2"><Database size={14} className="text-[#5C7080]" /> Ontology Tools (RAG)</h2>
                                </div>
                                <div className="p-5">
                                    <label className="block text-[11px] text-[#5C7080] mb-3">Select the Enterprise Ontology objects this Agent is authorized to query to answer user questions.</label>

                                    <div className="grid grid-cols-2 gap-3">
                                        {entityTypes.map(et => (
                                            <div
                                                key={et.id}
                                                onClick={() => handleToggleOntology(et.id)}
                                                className={`p-3 border rounded cursor-pointer transition-all flex items-center gap-3 ${ontologyAccess.has(et.id) ? 'border-[#137CBD] bg-[#EBF1F5]' : 'border-[#CED9E0] bg-white hover:border-[#9FB3BE]'}`}
                                            >
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${ontologyAccess.has(et.id) ? 'bg-[#137CBD] border-[#137CBD]' : 'bg-white border-[#CED9E0]'}`}>
                                                    {ontologyAccess.has(et.id) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-bold text-[12px] text-[#182026] truncate">{et.name}</div>
                                                </div>
                                            </div>
                                        ))}
                                        {entityTypes.length === 0 && (
                                            <div className="col-span-2 p-4 text-center border border-dashed border-[#CED9E0] rounded text-[11px] text-[#5C7080]">No Ontology Objects exist yet.</div>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* AIP Logic (Tools) */}
                            <section className="bg-white border border-[#CED9E0] shadow-sm rounded-lg overflow-hidden">
                                <div className="px-5 py-3 border-b border-[#CED9E0] bg-[#F5F8FA]">
                                    <h2 className="text-[12px] font-bold text-[#182026] flex items-center gap-2"><Code2 size={14} className="text-[#5C7080]" /> AIP Logic (Actions)</h2>
                                </div>
                                <div className="p-5">
                                    <label className="block text-[11px] text-[#5C7080] mb-3">Select the Typescript Functions this Agent is authorized to execute on behalf of the user.</label>

                                    <div className="grid grid-cols-2 gap-3">
                                        {availableTools.map(tl => (
                                            <div
                                                key={tl.id}
                                                onClick={() => handleToggleTool(tl.id)}
                                                className={`p-3 border rounded cursor-pointer transition-all flex flex-col gap-1 ${selectedTools.has(tl.id) ? 'border-[#137CBD] bg-[#EBF1F5]' : 'border-[#CED9E0] bg-white hover:border-[#9FB3BE]'}`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${selectedTools.has(tl.id) ? 'bg-[#137CBD] border-[#137CBD]' : 'bg-white border-[#CED9E0]'}`}>
                                                        {selectedTools.has(tl.id) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                    </div>
                                                    <div className="font-bold text-[12px] text-[#182026] truncate">{tl.name}</div>
                                                </div>
                                                <div className="text-[10px] text-[#5C7080] truncate pl-6">{tl.description}</div>
                                            </div>
                                        ))}
                                        {availableTools.length === 0 && (
                                            <div className="col-span-2 p-4 text-center border border-dashed border-[#CED9E0] rounded text-[11px] text-[#5C7080]">No AIP Logic Functions deployed. Go to the Logic Builder to write one.</div>
                                        )}
                                    </div>
                                </div>
                            </section>

                        </div>
                    </div>
                </div>

                {/* ── RIGHT SIDEBAR (Live Test Chat) ── */}
                <div className="w-[400px] bg-white flex flex-col shrink-0 relative">
                    {/* Guard Overlay */}
                    {!activeAgentId ? (
                        <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center border-l border-[#CED9E0]">
                            <MessageSquare className="w-10 h-10 text-[#CED9E0] mb-3" />
                            <h3 className="font-bold text-[#182026] text-[14px]">Save Agent to Test</h3>
                            <p className="text-[12px] text-[#5C7080] mt-1">You must save your configuration before you can test the Agent.</p>
                        </div>
                    ) : null}

                    {/* Header */}
                    <div className="h-12 border-b border-[#CED9E0] bg-[#F5F8FA] flex items-center px-4 shrink-0 shadow-sm relative z-0">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#137CBD]" />
                            <span className="text-[13px] font-bold text-[#182026]">Test: {name}</span>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white relative z-0">
                        {chatMessages.map(msg => (
                            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[85%] rounded-[10px] px-3 py-2 text-[13px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-[#137CBD] text-white rounded-tr-none' : 'bg-[#F5F8FA] border border-[#CED9E0] text-[#182026] rounded-tl-none'
                                    }`}>
                                    {msg.content}
                                </div>
                                {msg._debug_context && (
                                    <div className="mt-1.5 max-w-[85%] bg-[#EBF1F5] p-2 rounded border border-[#CED9E0] text-[10px] font-mono text-[#5C7080] whitespace-pre-wrap">
                                        <b className="text-[#137CBD]">Context Injected by Tool:</b><br />{msg._debug_context}
                                    </div>
                                )}
                            </div>
                        ))}
                        {isChatting && (
                            <div className="flex items-start">
                                <div className="bg-[#F5F8FA] border border-[#CED9E0] rounded-[10px] rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-[#5C7080] rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                    <div className="w-1.5 h-1.5 bg-[#5C7080] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                                    <div className="w-1.5 h-1.5 bg-[#5C7080] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                                </div>
                            </div>
                        )}
                        <div ref={chatBottomRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-[#CED9E0] bg-white relative z-0">
                        <div className="relative">
                            <textarea
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                placeholder="Message the agent... (Press Enter to send)"
                                className="w-full bg-[#F5F8FA] border border-[#CED9E0] text-[#182026] text-[13px] rounded-lg pl-3 pr-10 py-3 focus:outline-none focus:border-[#137CBD] focus:ring-1 focus:ring-[#137CBD] resize-none"
                                rows={1}
                                style={{ minHeight: '44px', maxHeight: '120px' }}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!chatInput.trim() || isChatting}
                                className="absolute right-2 bottom-2 p-1.5 bg-[#137CBD] hover:bg-[#0E6694] text-white rounded transition-colors disabled:opacity-50 disabled:bg-[#CED9E0]"
                            >
                                <Play size={14} className="ml-0.5" />
                            </button>
                        </div>
                        <div className="text-center mt-2 text-[10px] text-[#5C7080]">
                            AI-generated responses may be inaccurate. Verify facts.
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
