import React, { useState, useEffect, useRef } from 'react';
import { X, Send, ShieldAlert, Copy, Check, Sparkles, Eye } from 'lucide-react';
import { AIAdvisoryService } from '../ai/AIAdvisoryService';
import { AIAdvisorySession, AIAdvisoryResponse } from '../ai/ai-types';
import { AIContextVisualization } from './AIContextVisualization';

interface AIAdvisoryPanelProps {
    isOpen: boolean;
    onClose: () => void;
    session: AIAdvisorySession | null;
}

export const AIAdvisoryPanel: React.FC<AIAdvisoryPanelProps> = ({ isOpen, onClose, session }) => {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<{ type: 'user' | 'ai'; content: string | AIAdvisoryResponse }[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [showContext, setShowContext] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (session) {
            const loadedHistory = session.history.flatMap(h => [
                { type: 'user' as const, content: h.request.prompt },
                { type: 'ai' as const, content: h.response }
            ]);
            setHistory(loadedHistory);
        } else {
            setHistory([]);
        }
    }, [session]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, isTyping]);

    const handleSend = async () => {
        if (!input.trim() || !session) return;

        const userPrompt = input;
        setInput('');
        setHistory(prev => [...prev, { type: 'user', content: userPrompt }]);
        setIsTyping(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            const response = await AIAdvisoryService.submitRequest(session.sessionId, userPrompt);
            setHistory(prev => [...prev, { type: 'ai', content: response }]);
        } catch (error) {
            console.error("AI Request failed", error);
            setHistory(prev => [...prev, {
                type: 'ai',
                content: {
                    responseType: 'observation',
                    content: "Error: Unable to process request. Please try again.",
                    confidenceLevel: 'low',
                    disclaimer: "Advisory only — not a recommendation or decision",
                    supportingSignals: []
                }
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    if (!isOpen) return null;

    return (
        <div
            className="glass-panel animate-slide-in"
            style={{
                position: 'fixed',
                top: '80px',
                right: '24px',
                width: 'min(420px, 90vw)',
                maxHeight: 'calc(100vh - 120px)',
                zIndex: 2000,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                border: '1px solid var(--accent)',
                boxShadow: '0 0 30px rgba(0, 122, 255, 0.15)'
            }}
        >
            {/* Header */}
            <div style={{
                height: '48px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px',
                backgroundColor: 'var(--surface-2)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#A855F7' }}>
                    <Sparkles size={18} />
                    <span style={{ fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Advisory — informational only</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button 
                        onClick={() => setShowContext(!showContext)} 
                        style={{ 
                            color: showContext ? 'var(--accent)' : 'var(--text-secondary)', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px'
                        }}
                        title="Show context visualization"
                    >
                        <Eye size={14} />
                    </button>
                    <button onClick={onClose} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Warning Banner */}
            <div style={{
                backgroundColor: 'rgba(0, 102, 255, 0.1)',
                borderBottom: '1px solid rgba(0, 102, 255, 0.2)',
                padding: '12px',
                display: 'flex',
                alignItems: 'start',
                gap: '12px'
            }}>
                <ShieldAlert size={16} style={{ color: 'var(--accent)', marginTop: '2px', flexShrink: 0 }} />
                <div style={{ fontSize: '11px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                    <strong>No Actions Executed.</strong> AI provides advisory analysis only.
                    Outputs are ephemeral and must be manually verified.
                </div>
            </div>

            {/* Context Visualization Toggle */}
            {showContext && (
                <div style={{
                    borderBottom: '1px solid var(--border)',
                    maxHeight: '40%',
                    overflowY: 'auto',
                    backgroundColor: 'var(--bg-base)'
                }}>
                    <AIContextVisualization session={session} />
                </div>
            )}

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {session && (
                    <div style={{ textAlign: 'center', fontSize: '10px', color: 'var(--text-muted)', margin: '16px 0' }}>
                        Session ID: {session.sessionId.slice(0, 8)} • Source: {session.invocationSource}
                    </div>
                )}

                {history.map((msg, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start' }}>
                        {msg.type === 'user' ? (
                            <div style={{
                                backgroundColor: 'var(--surface-2)',
                                color: 'var(--text-primary)',
                                padding: '8px 12px',
                                borderRadius: '8px 8px 0 8px',
                                maxWidth: '85%',
                                fontSize: '13px',
                                border: '1px solid var(--border)'
                            }}>
                                {msg.content as string}
                            </div>
                        ) : (
                            <div style={{
                                backgroundColor: 'var(--bg-base)',
                                border: '1px solid var(--border)',
                                borderRadius: '0 8px 8px 8px',
                                maxWidth: '90%',
                                width: '100%',
                                overflow: 'hidden'
                            }}>
                                <div style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', width: '100%', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span style={{
                                                fontSize: '10px',
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                backgroundColor: (msg.content as AIAdvisoryResponse).confidenceLevel === 'high' ? 'rgba(16, 185, 129, 0.1)' :
                                                    (msg.content as AIAdvisoryResponse).confidenceLevel === 'medium' ? 'rgba(245, 158, 11, 0.1)' :
                                                        'rgba(239, 68, 68, 0.1)',
                                                color: (msg.content as AIAdvisoryResponse).confidenceLevel === 'high' ? '#10B981' :
                                                    (msg.content as AIAdvisoryResponse).confidenceLevel === 'medium' ? '#F59E0B' :
                                                        '#EF4444'
                                            }}>
                                                {(msg.content as AIAdvisoryResponse).confidenceLevel} Confidence
                                            </span>
                                            <span style={{
                                                fontSize: '10px',
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                                color: 'var(--text-muted)',
                                                borderLeft: '1px solid var(--border)',
                                                paddingLeft: '8px'
                                            }}>
                                                AI {(msg.content as AIAdvisoryResponse).responseType === 'observation' ? 'Observation' :
                                                    (msg.content as AIAdvisoryResponse).responseType === 'explanation' ? 'Explanation' :
                                                        'Analysis'}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleCopy((msg.content as AIAdvisoryResponse).content, idx)}
                                            style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}
                                            title="Copy to clipboard"
                                        >
                                            {copiedIndex === idx ? <Check size={14} /> : <Copy size={14} />}
                                        </button>
                                    </div>

                                    <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                        {(msg.content as AIAdvisoryResponse).content}
                                    </p>

                                    {/* Supporting Signals */}
                                    {(msg.content as AIAdvisoryResponse).supportingSignals.length > 0 && (
                                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                                            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>Supporting Signals</div>
                                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                {(msg.content as AIAdvisoryResponse).supportingSignals.map((signal, sIdx) => (
                                                    <li key={sIdx} style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'start', gap: '6px' }}>
                                                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--text-muted)', marginTop: '6px', flexShrink: 0 }} />
                                                        {signal}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', padding: '8px', fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', borderTop: '1px solid var(--border)', fontStyle: 'italic' }}>
                                    {(msg.content as AIAdvisoryResponse).disclaimer}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {isTyping && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <div style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: '0 8px 8px 8px', padding: '12px', display: 'flex', gap: '8px' }}>
                            <div className="animate-bounce" style={{ width: '6px', height: '6px', backgroundColor: 'var(--accent)', borderRadius: '50%' }} />
                            <div className="animate-bounce" style={{ width: '6px', height: '6px', backgroundColor: 'var(--accent)', borderRadius: '50%', animationDelay: '0.1s' }} />
                            <div className="animate-bounce" style={{ width: '6px', height: '6px', backgroundColor: 'var(--accent)', borderRadius: '50%', animationDelay: '0.2s' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: '16px', backgroundColor: 'var(--surface-2)', borderTop: '1px solid var(--border)' }}>
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask for an explanation or analysis of the current context..."
                        style={{
                            width: '100%',
                            backgroundColor: 'var(--bg-base)',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            padding: '10px 40px 10px 12px',
                            fontSize: '13px',
                            color: 'var(--text-primary)',
                            outline: 'none'
                        }}
                        disabled={!session || isTyping}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || !session || isTyping}
                        style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--accent)',
                            opacity: (!input.trim() || !session || isTyping) ? 0.5 : 1,
                            cursor: 'pointer'
                        }}
                    >
                        <Send size={18} />
                    </button>
                </div>
                {!session && (
                    <div style={{ fontSize: '10px', color: '#EF4444', marginTop: '8px', textAlign: 'center' }}>
                        No active session. Please initiate analysis from a view.
                    </div>
                )}
            </div>
        </div>
    );
};
