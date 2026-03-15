
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2, ChevronRight, Command } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ApiClient } from '@/lib/apiClient';

interface AipInteractiveWidgetProps {
    context: string;
    placeholder?: string;
    onAction?: (action: string, payload: any) => void;
    className?: string;
}

export const AipInteractiveWidget = ({
    context,
    placeholder = "Ask about this context...",
    onAction,
    className
}: AipInteractiveWidgetProps) => {
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsg = { role: 'user' as const, content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        ApiClient.post<{ message: string }>('/api/v1/aip/assist', {
            message: input,
            context: {
                pathname: context, // Use the provided context string as a virtual pathname/context hint
                type: 'interactive-widget'
            }
        }).then(response => {
            const aiMsg = {
                role: 'assistant' as const,
                content: response.message
            };
            setMessages(prev => [...prev, aiMsg]);
        }).catch(() => {
            const errorMsg = {
                role: 'assistant' as const,
                content: "Mission alert: Assist terminal disconnected."
            };
            setMessages(prev => [...prev, errorMsg]);
        }).finally(() => {
            setIsTyping(false);
        });
    };

    return (
        <div className={cn("flex flex-col h-full bg-pt-bg-panel/40 border border-pt-border rounded-sm overflow-hidden", className)}>
            <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-2 py-8">
                        <Sparkles size={24} className="text-pt-intent-primary" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-center px-4">
                            Interactive Assistant Active for {context}
                        </span>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div key={i} className={cn(
                        "flex flex-col space-y-1 animate-in fade-in slide-in-from-bottom-1 duration-200",
                        msg.role === 'user' ? "items-end" : "items-start"
                    )}>
                        <div className={cn(
                            "max-w-[95%] p-2.5 text-[10px] leading-relaxed border rounded-sm",
                            msg.role === 'user'
                                ? "bg-pt-bg border-pt-intent-primary/20 text-pt-text"
                                : "bg-pt-bg-panel border-pt-border text-pt-text-muted"
                        )}>
                            {msg.content}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex gap-1 items-center p-2">
                        <div className="w-1 h-1 bg-pt-intent-primary rounded-full animate-bounce" />
                        <div className="w-1 h-1 bg-pt-intent-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-1 h-1 bg-pt-intent-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            <form onSubmit={handleSend} className="p-2 border-t border-pt-border bg-pt-bg/50">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={placeholder}
                        className="w-full bg-pt-bg border border-pt-border rounded px-3 py-2 text-[10px] font-bold focus:outline-none focus:border-pt-intent-primary transition-all pr-8 uppercase tracking-tight placeholder:opacity-30"
                        disabled={isTyping}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        className="absolute right-1 top-1 bottom-1 px-2 text-pt-intent-primary hover:text-pt-text transition-colors disabled:opacity-0"
                    >
                        {isTyping ? <Loader2 size={10} className="animate-spin" /> : <ChevronRight size={12} />}
                    </button>
                </div>
                <div className="mt-1.5 flex items-center justify-between px-1 opacity-20">
                    <div className="flex items-center gap-1">
                        <Command size={8} />
                        <span className="text-[7px] font-black uppercase tracking-tighter">Enter to send</span>
                    </div>
                    <span className="text-[7px] font-mono tracking-tighter">AIP-WIDGET-v1</span>
                </div>
            </form>
        </div>
    );
};
