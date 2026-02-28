"use client";

import { useState, useRef, useEffect } from "react";
import { useRuntimeStore } from "@/store/runtimeStore";
import { useBuilderStore } from "@/store/builderStore";
import {
    BrainCircuit, Send, User, ChevronRight, Database,
    Zap, AlertTriangle, CheckCircle2, ShieldAlert
} from "lucide-react";

interface ChatMessage {
    id: string;
    role: "user" | "ai";
    content: string;
    actionProposal?: {
        actionId: string;
        instanceId: string;
        confidence: number;
    };
    queriedEntities?: string[];
}

export default function RuntimeAiConsole() {
    const { instances, executeAction } = useRuntimeStore();
    const { agents, actions, entityTypes } = useBuilderStore();

    // Pick the first agent that has ai-triggerable actions (for demo mapping)
    const activeAgent = agents.find(a => a.entityScopes.length > 0) || agents[0];

    const [messages, setMessages] = useState<ChatMessage[]>([{
        id: 'msg-1',
        role: 'ai',
        content: `AIP Operations Copilot online. I am running the **${activeAgent?.model || 'GPT-4-AIP'}** model with access to your restricted operational ontology. How can I assist you today?`
    }]);

    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Modal state for Action Execution
    const [execProposal, setExecProposal] = useState<{ actionId: string, instanceId: string } | null>(null);
    const [execPayload, setExecPayload] = useState<Record<string, any>>({});
    const [isExecuting, setIsExecuting] = useState(false);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !activeAgent) return;

        const userMsg = input.trim();
        setInput("");
        setMessages(prev => [...prev, { id: `msg-${Date.now()}`, role: 'user', content: userMsg }]);
        setIsTyping(true);

        // Mock AI logic based on user input
        setTimeout(() => {
            let aiResponse: ChatMessage = {
                id: `ai-${Date.now()}`,
                role: 'ai',
                content: "I've analyzed your request against the current ontology."
            };

            const lowerInput = userMsg.toLowerCase();

            if (lowerInput.includes("risk") || lowerInput.includes("critical") || lowerInput.includes("drone")) {
                // Find critical drones
                const criticalDrones = instances.filter(i => i.entityTypeId === 'ent-drone' && i.properties.status === 'CRITICAL');

                if (criticalDrones.length > 0) {
                    const target = criticalDrones[0];
                    // Find an AI-triggerable action for drones
                    const validAction = actions.find(a => a.targetEntityTypeId === 'ent-drone' && activeAgent.allowedActions.includes(a.id));

                    aiResponse.content = `I queried the **Drone** entity table. We currently have **${criticalDrones.length}** drone(s) in CRITICAL status. Drone \`${target.id}\` is reporting a dangerously low battery level (${target.properties.batteryLevel}%).`;
                    aiResponse.queriedEntities = ['ent-drone'];

                    if (validAction) {
                        aiResponse.content += `\n\nI recommend executing a recall protocol immediately to prevent structural loss.`;
                        aiResponse.actionProposal = {
                            actionId: validAction.id,
                            instanceId: target.id,
                            confidence: 94
                        };
                    } else {
                        aiResponse.content += `\n\nNo AI-triggerable actions are bound to this entity in my current agent scope. Manual intervention is required.`;
                    }
                } else {
                    aiResponse.content = "All drones are currently operating within nominal parameters. No critical risks detected.";
                    aiResponse.queriedEntities = ['ent-drone'];
                }
            } else if (lowerInput.includes("mission") || lowerInput.includes("conflict")) {
                const conflictMissions = instances.filter(i => i.entityTypeId === 'ent-mission' && i.properties.status === 'CONFLICT');
                aiResponse.content = `I found **${conflictMissions.length}** mission conflict(s) in the active roster. Would you like me to analyze potential rerouting options?`;
                aiResponse.queriedEntities = ['ent-mission'];
            } else {
                aiResponse.content = "I didn't recognize any specific operational parameters in that request. You can ask me about at-risk drones, mission conflicts, or general fleet analytics.";
            }

            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
        }, 1500);
    };

    const handleExecuteAction = async () => {
        if (!execProposal) return;
        setIsExecuting(true);
        await executeAction(execProposal.actionId, execProposal.instanceId, execPayload);
        setIsExecuting(false);
        setExecProposal(null);
        setExecPayload({});

        // Add follow-up message
        setMessages(prev => [...prev, {
            id: `sys-${Date.now()}`,
            role: 'ai',
            content: `Execution confirmed. System payload committed to **${execProposal.instanceId}** via the API layer.`
        }]);
    };

    if (!activeAgent) {
        return <div className="flex-1 flex items-center justify-center bg-[#060A12] text-slate-500 font-sans">No AI Agents configured in Builder mode.</div>;
    }

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-[#060A12] text-slate-300 font-sans relative">

            {/* Header */}
            <div className="border-b border-white/5 bg-[#0B1220] p-4 flex justify-between items-center shrink-0 z-10">
                <div>
                    <div className="flex items-center gap-2">
                        <BrainCircuit className="w-5 h-5 text-blue-400" />
                        <h1 className="text-lg font-black text-white">AI Operations Console</h1>
                        <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded text-[10px] uppercase font-bold tracking-wider ml-2">
                            {activeAgent.model}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Bound to {activeAgent.entityScopes.length} Ontology Entities • {activeAgent.allowedActions.length} Actions Authorized</p>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="max-w-4xl mx-auto space-y-8">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${msg.role === 'user'
                                ? 'bg-[#0B1220] border-white/10'
                                : 'bg-blue-600/20 border-blue-500/30'
                                }`}>
                                {msg.role === 'user' ? <User className="w-5 h-5 text-slate-400" /> : <BrainCircuit className="w-5 h-5 text-blue-400" />}
                            </div>

                            <div className={`max-w-[85%] ${msg.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                                <div className={`px-5 py-4 text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-[#1E3A8A]/50 border border-blue-500/20 text-blue-50 rounded-2xl rounded-tr-sm'
                                    : 'bg-[#0B1220] border border-white/5 text-slate-300 rounded-2xl rounded-tl-sm shadow-xl'
                                    }`}>

                                    {/* System Context Badges */}
                                    {msg.queriedEntities && (
                                        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/5 text-[10px] font-mono text-slate-500">
                                            <Database className="w-3.5 h-3.5 text-blue-400/50" />
                                            <span>Queried Source Sets: {msg.queriedEntities.map(id => entityTypes.find(e => e.id === id)?.name).join(', ')}</span>
                                        </div>
                                    )}

                                    {/* Text Content */}
                                    <div className="whitespace-pre-wrap">{msg.content}</div>

                                    {/* Proposed Action Card */}
                                    {msg.actionProposal && (
                                        <div className="mt-4 bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 shadow-lg flex flex-col gap-3">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-bold text-blue-400 uppercase tracking-widest">Proposed Action</span>
                                                <span className="text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                                    Confidence {msg.actionProposal.confidence}%
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <div className="text-slate-300 text-sm">Target: <code className="text-blue-300 font-mono text-xs">{msg.actionProposal.instanceId}</code></div>
                                            </div>

                                            <button
                                                onClick={() => setExecProposal(msg.actionProposal!)}
                                                className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-blue-600/20 relative overflow-hidden group">
                                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                                <Zap className="w-4 h-4 relative z-10" />
                                                <span className="relative z-10">Execute {actions.find(a => a.id === msg.actionProposal?.actionId)?.name || 'Command'}</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                                <BrainCircuit className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="px-5 py-4 bg-[#0B1220] border border-white/5 rounded-2xl rounded-tl-sm flex items-center gap-2">
                                <span className="text-xs text-slate-500 font-mono">Traversing Ontology</span>
                                <div className="flex gap-1 ml-2">
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="p-6 bg-gradient-to-t from-[#060A12] via-[#060A12] to-transparent shrink-0">
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative group">
                    <input
                        value={input} onChange={e => setInput(e.target.value)}
                        placeholder="Query operations data or request manual actions..."
                        className="w-full bg-[#0B1220] border border-white/10 rounded-2xl pl-6 pr-14 py-4 text-sm text-white focus:border-blue-500/50 outline-none shadow-2xl transition-colors group-hover:border-white/20" />
                    <button
                        type="submit" disabled={!input.trim() || isTyping}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 text-white disabled:text-slate-500 rounded-xl transition-colors">
                        <Send className="w-4 h-4" />
                    </button>
                </form>
                <div className="text-center mt-3 text-[10px] text-slate-600 font-sans tracking-wide">
                    AI responses are constrained by RBAC and Ontology Access Scope.
                </div>
            </div>

            {/* Action Execution Confirmation Modal */}
            {execProposal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50 animate-in fade-in duration-200">
                    <div className="bg-[#111827] border border-blue-500/30 rounded-2xl w-full max-w-lg shadow-2xl p-6">
                        {(() => {
                            const action = actions.find(a => a.id === execProposal.actionId);
                            if (!action) return null;
                            return (
                                <>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                                                <Zap className="w-6 h-6 text-blue-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-white font-sans">Confirm AI Proposed Action</h3>
                                                <p className="text-xs text-slate-400 font-sans mt-1">AI agent is attempting to execute <code className="text-blue-300">{action.name}</code> against <code className="text-blue-300">{execProposal.instanceId}</code>.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {activeAgent.confirmBeforeExecute && (
                                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
                                            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                            <div>
                                                <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Human-in-the-Loop Required</div>
                                                <div className="text-xs text-slate-400 font-sans leading-relaxed">The AI Agent is requesting your explicit authorization to commit this transaction to the state graph.</div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-3 font-sans mt-8 pt-6 border-t border-white/10">
                                        <button onClick={() => setExecProposal(null)} disabled={isExecuting} className="px-5 py-2.5 rounded-lg text-sm font-bold text-slate-300 hover:bg-white/5 transition-colors">Abort</button>
                                        <button onClick={handleExecuteAction} disabled={isExecuting} className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50">
                                            {isExecuting ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Zap className="w-4 h-4" />}
                                            {isExecuting ? 'Committing...' : 'Confirm & Execute'}
                                        </button>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}

        </div>
    );
}
