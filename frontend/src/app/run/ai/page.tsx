"use client";

import { useState, useRef, useEffect } from "react";
import { useRuntimeStore } from "@/store/runtimeStore";
import { useBuilderStore } from "@/store/builderStore";
import {
    BrainCircuit, Send, User, ChevronRight, Database,
    Zap, AlertTriangle, CheckCircle2, ShieldAlert, Cpu,
    Terminal, MoreHorizontal, Command, Sparkles, AlertCircle,
    Settings, RefreshCcw
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
        content: `AIP Operations Copilot online. I am running the **${activeAgent?.model || 'GPT-4-PT'}** mission-tuned model with access to your high-integrity operational ontology. How can I assist with your objectives today?`
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
                content: "I've analyzed your telemetry request against the active operational lattice."
            };

            const lowerInput = userMsg.toLowerCase();

            if (lowerInput.includes("risk") || lowerInput.includes("critical") || lowerInput.includes("drone")) {
                const criticalDrones = instances.filter(i => i.entityTypeId === 'ent-drone' && i.properties.status === 'CRITICAL');

                if (criticalDrones.length > 0) {
                    const target = criticalDrones[0];
                    const validAction = actions.find(a => a.targetEntityTypeId === 'ent-drone' && activeAgent.allowedActions.includes(a.id));

                    aiResponse.content = `I queried the **Drone** registry. We have **${criticalDrones.length}** vector(s) in CRITICAL state. Vector \`${target.id}\` is reporting power depletion (${target.properties.batteryLevel}%).`;
                    aiResponse.queriedEntities = ['ent-drone'];

                    if (validAction) {
                        aiResponse.content += `\n\nI recommend immediate execution of the recall protocol to maintain asset integrity.`;
                        aiResponse.actionProposal = {
                            actionId: validAction.id,
                            instanceId: target.id,
                            confidence: 94
                        };
                    } else {
                        aiResponse.content += `\n\nNo authorized mission overrides are bound to this vector in my current scope. Escalating to Manual Intervention.`;
                    }
                } else {
                    aiResponse.content = "All registered assets are currently operating within nominal parameters. No high-threat risks detected.";
                    aiResponse.queriedEntities = ['ent-drone'];
                }
            } else if (lowerInput.includes("mission") || lowerInput.includes("conflict")) {
                const conflictMissions = instances.filter(i => i.entityTypeId === 'ent-mission' && i.properties.status === 'CONFLICT');
                aiResponse.content = `I have identified **${conflictMissions.length}** trajectory conflict(s) in the mission roster. Initiate re-route analysis?`;
                aiResponse.queriedEntities = ['ent-mission'];
            } else {
                aiResponse.content = "Awaiting valid operational parameters. You can query at-risk drones, mission trajectory conflicts, or request comprehensive fleet analytics.";
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
            content: `Transaction committed. State change successfully broadcast to vector **${execProposal.instanceId}** via the API bridge.`
        }]);
    };

    if (!activeAgent) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-pt-bg text-pt-text-muted font-mono gap-4">
                <ShieldAlert size={48} className="opacity-20" />
                <div className="text-[11px] font-black uppercase tracking-[0.4em]">Intelligence Layer Offline</div>
                <p className="text-[10px] opacity-40 uppercase tracking-widest text-center max-w-xs">No AI Agents initialized in Builder mode. Interface restricted.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-pt-bg text-pt-text font-mono relative overflow-hidden">

            {/* Tactical Header Overlay */}
            <div className="h-16 border-b border-pt-border bg-pt-bg-panel flex items-center justify-between px-6 shrink-0 z-20 shadow-xl">
                <div className="flex items-center gap-4">
                    <div className="w-9 h-9 bg-pt-intent-primary/10 border border-pt-intent-primary/30 rounded-lg flex items-center justify-center">
                        <BrainCircuit className="w-5 h-5 text-pt-intent-primary" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-sm font-black text-pt-text uppercase tracking-widest">AIP Intelligence Console</h1>
                            <div className="h-4 w-px bg-pt-border mx-1" />
                            <span className="px-2 py-0.5 bg-pt-intent-primary border border-pt-intent-primary text-pt-bg rounded text-[8px] font-black uppercase tracking-[0.2em] shadow-lg">
                                {activeAgent.model}
                            </span>
                        </div>
                        <p className="text-[9px] text-pt-text-muted font-bold tracking-widest mt-1 opacity-50 uppercase leading-none">
                            Bound: {activeAgent.entityScopes.length} Entity Sets • {activeAgent.allowedActions.length} Actions Authorized
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-2 text-pt-text-muted hover:text-pt-text transition-all">
                        <Settings size={16} />
                    </button>
                    <button className="p-2 text-pt-text-muted hover:text-pt-text transition-all">
                        <MoreHorizontal size={16} />
                    </button>
                </div>
            </div>

            {/* Chat Vector Area */}
            <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                <div className="max-w-4xl mx-auto space-y-12">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            {/* Avatar */}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-2xl transition-all ${msg.role === 'user'
                                ? 'bg-pt-bg-panel border-pt-border group-hover:border-pt-text transition-colors'
                                : 'bg-pt-intent-primary/10 border-pt-intent-primary/40'
                                }`}>
                                {msg.role === 'user' ? <User className="w-5 h-5 text-pt-text-muted" /> : <Cpu className="w-5 h-5 text-pt-intent-primary" />}
                            </div>

                            {/* Message Bubble */}
                            <div className={`max-w-[80%] ${msg.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                                <div className={`relative px-6 py-5 text-[12px] leading-relaxed shadow-2xl transition-all ${msg.role === 'user'
                                    ? 'bg-pt-intent-primary/20 border border-pt-intent-primary/30 text-pt-text rounded-2xl rounded-tr-sm'
                                    : 'bg-pt-bg-panel border border-pt-border text-pt-text rounded-2xl rounded-tl-sm'
                                    }`}>

                                    {/* Data Query Persistence Trace */}
                                    {msg.queriedEntities && (
                                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-pt-border/30 text-[9px] font-black text-pt-text-muted uppercase tracking-[0.2em]">
                                            <Database className="w-3.5 h-3.5 text-pt-intent-primary opacity-50" />
                                            <span>Telemetry Bridge: {msg.queriedEntities.map(id => entityTypes.find(e => e.id === id)?.name).join(', ')}</span>
                                        </div>
                                    )}

                                    {/* Text Content */}
                                    <div className="font-bold tracking-tight whitespace-pre-wrap">{msg.content}</div>

                                    {/* Proposed Logic Overrides (Action Card) */}
                                    {msg.actionProposal && (
                                        <div className="mt-6 bg-pt-bg border border-pt-intent-primary/30 rounded-xl p-5 shadow-2xl flex flex-col gap-4 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-3 opacity-5">
                                                <Zap size={48} className="text-pt-intent-primary" />
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                                <span className="text-pt-intent-primary flex items-center gap-2"><Zap size={12} /> Proposed Intervention</span>
                                                <span className="text-pt-intent-success bg-pt-intent-success/10 px-2 py-1 rounded border border-pt-intent-success/30">
                                                    94% Reliability
                                                </span>
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                <div className="text-pt-text-muted text-[10px] font-black uppercase tracking-widest opacity-40">Target Vector</div>
                                                <div className="text-pt-text font-black text-[13px] tracking-tight">{msg.actionProposal.instanceId}</div>
                                            </div>

                                            <button
                                                onClick={() => setExecProposal(msg.actionProposal!)}
                                                className="w-full h-11 flex justify-center items-center gap-2.5 bg-pt-intent-primary text-pt-bg rounded-lg text-[10px] font-black uppercase tracking-widest shadow-xl relative overflow-hidden active:scale-95 transition-all">
                                                <Zap className="w-4 h-4" />
                                                Execute {actions.find(a => a.id === msg.actionProposal?.actionId)?.name || 'Command'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* AI Loading State */}
                    {isTyping && (
                        <div className="flex gap-6">
                            <div className="w-10 h-10 rounded-xl bg-pt-intent-primary/10 border border-pt-intent-primary/40 flex items-center justify-center shrink-0">
                                <Cpu className="w-5 h-5 text-pt-intent-primary animate-pulse" />
                            </div>
                            <div className="px-6 py-5 bg-pt-bg-panel border border-pt-border rounded-2xl rounded-tl-sm flex items-center gap-3">
                                <span className="text-[10px] text-pt-text-muted font-black uppercase tracking-[0.3em]">Traversing Lattice</span>
                                <div className="flex gap-1.5 ml-2">
                                    <div className="w-1.5 h-1.5 bg-pt-intent-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-1.5 h-1.5 bg-pt-intent-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-1.5 h-1.5 bg-pt-intent-primary rounded-full animate-bounce" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>
            </div>

            {/* Input Buffer */}
            <div className="p-8 bg-gradient-to-t from-pt-bg via-pt-bg to-transparent shrink-0">
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-3 pointer-events-none opacity-40 group-focus-within:opacity-100 transition-opacity">
                        <Terminal size={14} className="text-pt-intent-primary" />
                    </div>
                    <input
                        value={input} onChange={e => setInput(e.target.value)}
                        placeholder="ISSUE COMMAND OR QUERY TELEMETRY…"
                        className="w-full bg-pt-bg-panel border border-pt-border rounded-2xl pl-14 pr-16 py-5 text-[11px] font-black uppercase tracking-widest text-pt-text focus:border-pt-intent-primary outline-none shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all placeholder:opacity-20" />
                    <button
                        type="submit" disabled={!input.trim() || isTyping}
                        className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 bg-pt-intent-primary disabled:bg-pt-border disabled:opacity-20 text-pt-bg rounded-xl transition-all active:scale-90 flex items-center justify-center shadow-lg">
                        <Send size={16} />
                    </button>
                </form>
                <div className="flex items-center justify-center gap-6 mt-4 opacity-30">
                    <div className="flex items-center gap-2">
                        <Command size={10} className="text-pt-text-muted" />
                        <span className="text-[9px] font-black text-pt-text-muted uppercase tracking-widest">Logic Constraint: RBAC_ON</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Sparkles size={10} className="text-pt-intent-primary" />
                        <span className="text-[9px] font-black text-pt-text-muted uppercase tracking-widest">Ontology Scope: FULL</span>
                    </div>
                </div>
            </div>

            {/* HIGH-LEVEL INTERVENTION AUTHORIZATION MODAL */}
            {execProposal && (
                <div className="fixed inset-0 bg-pt-bg/95 backdrop-blur-md flex items-center justify-center p-8 z-[100] animate-in fade-in duration-300">
                    <div className="bg-pt-bg-panel border border-pt-intent-primary/30 rounded-2xl w-full max-w-xl shadow-[0_0_100px_rgb(var(--pt-intent-primary) / 0.2)] p-8 relative overflow-hidden">
                        {/* Background warning pattern */}
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <ShieldAlert size={120} className="text-pt-intent-primary" />
                        </div>

                        {(() => {
                            const action = actions.find(a => a.id === execProposal.actionId);
                            if (!action) return null;
                            return (
                                <>
                                    <div className="flex gap-6 mb-10 relative z-10">
                                        <div className="w-16 h-16 rounded-2xl bg-pt-intent-primary/10 flex items-center justify-center shrink-0 border border-pt-intent-primary/40 shadow-2xl">
                                            <Zap className="w-8 h-8 text-pt-intent-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-pt-text uppercase tracking-tighter">Intervention Authorized</h3>
                                            <p className="text-[10px] text-pt-text-muted font-black tracking-widest mt-2 opacity-60 uppercase leading-relaxed">
                                                Commit protocol <span className="text-pt-intent-primary">{action.name}</span> <br />
                                                Target Object: <span className="text-pt-intent-primary">{execProposal.instanceId}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {activeAgent.confirmBeforeExecute && (
                                        <div className="bg-pt-intent-warning/5 border border-pt-intent-warning/30 rounded-xl p-5 mb-10 flex items-start gap-4">
                                            <AlertCircle className="w-5 h-5 text-pt-intent-warning shrink-0 mt-0.5" />
                                            <div>
                                                <div className="text-[10px] font-black text-pt-intent-warning uppercase tracking-[0.2em] mb-1">Human-in-the-Loop Constraint</div>
                                                <div className="text-[11px] text-pt-text-muted font-bold leading-relaxed opacity-80 uppercase tracking-tight">
                                                    Manual override required for cross-lattice state mutations.
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-4 mt-10 pt-8 border-t border-pt-border">
                                        <button onClick={() => setExecProposal(null)} disabled={isExecuting}
                                            className="px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-pt-text-muted hover:text-pt-text hover:bg-pt-bg transition-all">
                                            Abort Cycle
                                        </button>
                                        <button onClick={handleExecuteAction} disabled={isExecuting}
                                            className="flex items-center gap-3 px-8 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-pt-intent-primary text-pt-bg transition-all shadow-2xl shadow-pt-intent-primary/20 hover:brightness-110 active:scale-95 disabled:opacity-50">
                                            {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                            {isExecuting ? 'Committing…' : 'Finalize Override'}
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

// Simple Loader component for the modal
function Loader2({ className, size }: { className?: string, size?: number }) {
    return <RefreshCcw className={className} size={size} />;
}
