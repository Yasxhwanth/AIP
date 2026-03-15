
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Zap,
    X,
    Send,
    Loader2,
    LayoutList,
    Database,
    Terminal,
    Command,
    Fingerprint,
    Search,
    ChevronRight,
    Sparkles,
    Shield
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { ApiClient } from '@/lib/apiClient';
import { PageId, AipContextSelection, AipAssistRequest, AipAssistResponse } from '@/lib/aipTypes';
import { useIntelligenceStore } from '@/store/intelligenceStore';
import { useWorkspaceStore } from '@/store/workspaceStore';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    context?: any;
    links?: AipAssistResponse['links'];
    trace?: AipAssistResponse['trace'];
    actions?: AipAssistResponse['actions'];
}

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AipAssistSidebar = ({ isOpen, onClose }: SidebarProps) => {
    const router = useRouter();
    const { activePage, selection } = useIntelligenceStore();
    const { projects } = useWorkspaceStore();
    const projectId = projects[0]?.id || 'proj-demo';

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll when messages update
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            context: selection
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const request: AipAssistRequest = {
                page: activePage,
                projectId,
                vars: selection,
                message: input
            };

            const response = await ApiClient.post<AipAssistResponse>('/api/v1/aip/assist', request);

            const aiMsg: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: response.answer,
                links: response.links,
                trace: response.trace
            };
            setMessages(prev => [...prev, aiMsg]);

            // Execute AI Actions or Stage for Confirmation
            if (response.actions && response.actions.length > 0) {
                const highRiskActions = response.actions.filter(a => a.risk === 'HIGH');
                const lowRiskActions = response.actions.filter(a => a.risk !== 'HIGH');

                // Execute low-priority actions immediately
                lowRiskActions.forEach(action => {
                    if (action.type === 'navTo') {
                        router.push(action.target);
                    } else if (action.type === 'updateVar') {
                        useIntelligenceStore.getState().setVar(action.target, action.payload);
                    }
                });

                // Stage high-risk actions for human-in-the-loop confirmation
                if (highRiskActions.length > 0) {
                    const aiMsg: Message = {
                        id: (Date.now() + 1).toString(),
                        role: 'assistant',
                        content: "Operational Warning: Proposed high-risk actions detected. Manual confirmation required.",
                        actions: highRiskActions
                    };
                    setMessages(prev => [...prev, aiMsg]);
                }
            }
        } catch (err: any) {
            const errorMsg: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: "Correction required: Failed to establish link with Maven backend. Ensure operational connectivity."
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <aside
            className={`
                fixed top-0 right-0 bottom-0 z-[100] bg-pt-bg border-l border-pt-border flex flex-col transition-all duration-300 shadow-[-10px_0_50px_rgba(0,0,0,0.5)]
                ${isOpen ? 'w-[400px] translate-x-0' : 'w-[400px] translate-x-full pointer-events-none'}
            `}
        >
            {/* Header */}
            <header className="h-10 border-b border-pt-border flex items-center px-4 justify-between bg-pt-bg/80 backdrop-blur-md shrink-0">
                <div className="flex items-center space-x-2">
                    <Zap size={14} className="text-pt-intent-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] font-sans">AIP Assist</span>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="flex items-center gap-1.5 opacity-40">
                        <div className="w-1.5 h-1.5 rounded-full bg-pt-intent-success shadow-[0_0_5px_rgba(13,128,80,0.5)]" />
                        <span className="text-[8px] font-mono tracking-tighter">SYNCHRONIZED</span>
                    </div>
                    <button onClick={onClose} className="text-pt-text-muted hover:text-pt-text transition-colors">
                        <X size={14} />
                    </button>
                </div>
            </header>

            {/* Application Context Banner -- with subtle ctos-scanline effect */}
            <div className="px-4 py-2 bg-pt-intent-primary/5 border-b border-pt-border flex items-center justify-between shrink-0 relative overflow-hidden group">
                <div className="absolute inset-x-0 top-0 h-px bg-pt-intent-primary opacity-20 animate-scanline" />
                <div className="flex items-center gap-2 overflow-hidden relative z-10">
                    <LayoutList size={10} className="text-pt-intent-primary shrink-0" />
                    <span className="text-[9px] font-black text-pt-text-muted uppercase tracking-widest truncate">
                        ACTIVE CONTEXT: {activePage?.toUpperCase() || 'GENERAL'}
                    </span>
                </div>
                <div className="flex gap-1 relative z-10">
                    <div className="w-1 h-1 rounded-full bg-pt-intent-primary opacity-50" />
                    <div className="w-1 h-1 rounded-full bg-pt-intent-primary opacity-20" />
                </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[linear-gradient(180deg,_rgba(16,107,163,0.02)_0%,_transparent_100%)] custom-scrollbar">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 pointer-events-none space-y-4">
                        <div className="relative">
                            <Sparkles size={48} className="text-pt-intent-primary animate-pulse" />
                            <div className="absolute inset-0 border border-pt-intent-primary/20 rounded-full animate-ping" />
                        </div>
                        <div className="text-center">
                            <p className="text-[11px] font-black uppercase tracking-[0.4em]">Integrated Intelligence</p>
                            <p className="text-[9px] font-bold uppercase tracking-widest mt-1">Ready to coordinate...</p>
                        </div>
                    </div>
                )}

                {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                        <div className="flex items-center gap-2 px-1">
                            <span className="text-[8px] font-black uppercase tracking-widest text-pt-text-muted opacity-40">
                                {msg.role === 'user' ? 'Operator' : 'Maven Assist'}
                            </span>
                        </div>
                        <div
                            className={`
                                max-w-[90%] p-3 text-[11px] font-medium leading-relaxed border
                                ${msg.role === 'user'
                                    ? 'bg-pt-bg border-pt-intent-primary/30 text-pt-text rounded-tl-xl rounded-tr-sm rounded-br-sm rounded-bl-xl shadow-lg shadow-pt-intent-primary/5'
                                    : 'bg-pt-bg-panel border-pt-border text-pt-text-muted rounded-tr-xl rounded-tl-sm rounded-bl-sm rounded-br-xl'
                                }
                            `}
                        >
                            {msg.content}

                            {msg.trace && msg.trace.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-pt-border/30 space-y-2">
                                    <div className="flex items-center gap-2 opacity-40 mb-2">
                                        <Terminal size={10} className="text-pt-intent-primary" />
                                        <span className="text-[8px] font-black uppercase tracking-widest">Execution Trace</span>
                                    </div>
                                    {msg.trace.map((t, idx) => (
                                        <div key={idx} className="bg-black/20 border border-pt-border/30 rounded px-2 py-1.5 font-mono text-[9px] group/trace">
                                            <div className="flex items-center justify-between pointer-events-none">
                                                <span className="text-pt-intent-primary font-bold">{t.tool}()</span>
                                                <ChevronRight size={8} className="text-pt-text-muted opacity-20" />
                                            </div>
                                            <div className="mt-1 opacity-40 group-hover/trace:opacity-80 transition-opacity overflow-hidden text-ellipsis whitespace-nowrap">
                                                {JSON.stringify(t.args)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {msg.actions && msg.actions.length > 0 && (
                                <div className="mt-4 p-3 bg-pt-intent-warning/10 border border-pt-intent-warning/30 rounded-sm space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Shield size={12} className="text-pt-intent-warning" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-pt-intent-warning">Action Sequence Required</span>
                                    </div>
                                    <div className="space-y-1">
                                        {msg.actions.map((act, idx) => (
                                            <div key={idx} className="flex items-center justify-between text-[10px] bg-pt-bg/50 px-2 py-1 rounded">
                                                <span className="font-mono opacity-60">{act.type}::{act.target}</span>
                                                <Fingerprint size={10} className="opacity-20" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                msg.actions?.forEach(action => {
                                                    if (action.type === 'navTo') router.push(action.target);
                                                    else if (action.type === 'updateVar') useIntelligenceStore.getState().setVar(action.target, action.payload);
                                                });
                                                setMessages(prev => prev.filter(m => m.id !== msg.id));
                                            }}
                                            className="flex-1 py-1.5 bg-pt-intent-warning text-white text-[9px] font-black uppercase tracking-widest rounded hover:bg-pt-intent-warning/80 transition-all shadow-lg shadow-pt-intent-warning/20"
                                        >
                                            Authorize
                                        </button>
                                        <button
                                            onClick={() => setMessages(prev => prev.filter(m => m.id !== msg.id))}
                                            className="px-3 py-1.5 bg-pt-bg border border-pt-border text-pt-text-muted text-[9px] font-black uppercase tracking-widest rounded hover:text-pt-text transition-all"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                </div>
                            )}

                            {msg.links && msg.links.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-pt-border/30 flex flex-wrap gap-2">
                                    {msg.links.map((link, idx) => (
                                        <button
                                            key={idx}
                                            className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-pt-bg border border-pt-border rounded hover:border-pt-intent-primary transition-all text-pt-text-muted hover:text-pt-text flex items-center gap-1.5"
                                        >
                                            <Database size={8} className="text-pt-intent-primary opacity-50" />
                                            {link.label}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {msg.context && msg.role === 'user' && (
                                <div className="mt-2 pt-2 border-t border-pt-border/30 flex items-center gap-1.5 opacity-40">
                                    <Search size={8} />
                                    <span className="text-[8px] font-mono tracking-tighter uppercase">
                                        CTX: {JSON.stringify(msg.context).slice(0, 40)}...
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex flex-col items-start space-y-1.5 animate-pulse">
                        <div className="flex items-center gap-2 px-1">
                            <span className="text-[8px] font-black uppercase tracking-widest text-pt-text-muted opacity-40 text-pt-intent-primary">Maven Thinking...</span>
                        </div>
                        <div className="bg-pt-bg-panel border border-pt-border text-pt-text-muted p-3 rounded-tr-xl rounded-tl-sm rounded-bl-sm rounded-br-xl flex gap-1">
                            <div className="w-1 h-1 bg-pt-intent-primary rounded-full animate-bounce" />
                            <div className="w-1 h-1 bg-pt-intent-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-1 h-1 bg-pt-intent-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input Footer */}
            <div className="p-4 border-t border-pt-border bg-pt-bg">
                <form onSubmit={handleSend} className="relative group">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Inquire across workspace context…"
                        className="w-full bg-pt-bg-panel border border-pt-border rounded px-4 py-3 text-[11px] font-bold focus:outline-none focus:border-pt-intent-primary transition-all shadow-inner placeholder:opacity-20 placeholder:font-black placeholder:uppercase placeholder:tracking-widest"
                        disabled={isTyping}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        className="absolute right-2 top-2 bottom-2 px-3 bg-pt-bg border border-pt-border rounded text-pt-intent-primary transition-all hover:bg-pt-intent-primary hover:text-white disabled:opacity-10 shadow-sm"
                    >
                        {isTyping ? <Loader2 size={12} className="animate-spin" /> : <ChevronRight size={14} />}
                    </button>

                    <div className="mt-2 flex items-center justify-between px-1">
                        <div className="flex items-center gap-2 opacity-30 text-[8px] font-black uppercase tracking-widest">
                            <Command size={8} />
                            <span>Dispatch Link 001-A</span>
                        </div>
                        <div className="flex gap-1.5">
                            <div className="w-1 h-1 rounded-full bg-pt-intent-primary shadow-[0_0_5px_rgba(16,107,163,0.5)]" />
                            <div className="w-1 h-1 rounded-full bg-pt-intent-success opacity-50" />
                        </div>
                    </div>
                </form>
            </div>
        </aside>
    );
};
