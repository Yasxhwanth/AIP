"use client";

import { use, useState, useEffect } from "react";
import { notFound, useRouter } from "next/navigation";
import {
    LayoutTemplate, ArrowLeft, Database,
    Activity, Zap, Loader2, AlertTriangle, Bot, Send
} from "lucide-react";
import Link from "next/link";
import { useRuntimeStore } from "@/store/runtimeStore";
import { ApiClient } from "@/lib/apiClient";
import { BattlefieldOverview } from '@/components/BattlefieldOverview';

// --- Copilot Chat Component ---
function AICopilotChat() {
    const [messages, setMessages] = useState<{ role: string, content: string }[]>([
        { role: 'assistant', content: 'I am your AIP Copilot. Currently tracking entities in the operational theater. How can I assist you?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim() || loading) return;
        const msg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: msg }]);
        setLoading(true);

        try {
            const res = await ApiClient.post<any>('/api/v1/ai/chat', { message: msg });
            if (res.role) {
                setMessages(prev => [...prev, { role: res.role, content: res.content }]);
            }
        } catch (e) {
            setMessages(prev => [...prev, { role: 'assistant', content: '**Error**: Could not connect to AI Engine.' }]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col h-[500px] bg-[#0B1220] border border-blue-500/20 rounded-2xl overflow-hidden shadow-xl mt-4">
            <div className="px-6 py-4 border-b border-blue-500/20 bg-blue-900/10 flex items-center gap-3">
                <Bot className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-slate-200 tracking-wider">AIP OPERATIONAL COPILOT</span>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${m.role === 'user' ? 'bg-blue-600/90 text-white rounded-br-none' : 'bg-white/5 border border-white/10 text-slate-300 rounded-bl-none font-sans'}`} style={{ whiteSpace: 'pre-wrap' }}>
                            {m.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white/5 border border-white/10 text-slate-300 rounded-2xl rounded-bl-none px-5 py-3 text-sm flex gap-2 items-center">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-400" /> Gathering ontology state...
                        </div>
                    </div>
                )}
            </div>
            <div className="p-4 border-t border-white/5 bg-black/20 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Ask Copilot to analyze threats or generate actions..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50"
                />
                <button onClick={handleSend} disabled={loading} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center disabled:opacity-50">
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

export default function LiveApplication({ params }: { params: Promise<{ appId: string }> }) {
    const { appId } = use(params);
    const { instances, executeAction } = useRuntimeStore();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [appConfig, setAppConfig] = useState<any | null>(null);
    const [activeVersion, setActiveVersion] = useState<string>("Draft (Fallback)");

    // ── Phase 6: Runtime Engine (Read from ProjectRelease) ──
    useEffect(() => {
        async function fetchRelease() {
            try {
                setIsLoading(true);
                // In a real multi-env setup, we would read the domain or query param to know if it's STAGING vs PROD
                const release = await ApiClient.get<any>('/api/v1/projects/CURRENT_PROJECT/releases/active?environment=STAGING');

                if (release && release.payload && release.payload.dashboards) {
                    const matchedApp = release.payload.dashboards.find((d: any) => d.id === appId);
                    if (matchedApp) {
                        setAppConfig(matchedApp);
                        setActiveVersion(`${release.version} (${release.environment})`);
                    } else {
                        setError(`Application ID ${appId} was not found in the current Release payload.`);
                    }
                } else {
                    setError(`Release payload is deformed or empty.`);
                }
            } catch (err: any) {
                console.error("Failed to fetch Active Release:", err);
                setError(err.message || "Failed to load the active deployment. Has this project been Published?");
            } finally {
                setIsLoading(false);
            }
        }
        fetchRelease();
    }, [appId]);

    // Handle initial loading states
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#060A12] flex flex-col items-center justify-center p-8">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <div className="text-white font-bold tracking-widest uppercase">Initializing Runtime Execution Engine</div>
                <div className="text-slate-500 text-sm mt-2">Pulling Atomic Configuration Payload...</div>
            </div>
        );
    }

    if (error || !appConfig) {
        return (
            <div className="min-h-screen bg-[#060A12] flex flex-col items-center justify-center p-8 text-center">
                <AlertTriangle className="w-16 h-16 text-yellow-500 mb-6" />
                <h1 className="text-2xl font-black text-white mb-3">Runtime Environment Unavailable</h1>
                <p className="text-slate-400 max-w-lg mb-8 leading-relaxed">
                    {error || "Application not found in the active release."}
                </p>
                <div className="flex gap-4">
                    <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg font-bold transition-all">Retry Launch</button>
                    <Link href={`/build/publish`} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg transition-all flex items-center gap-2">
                        Go to Publish Center <ArrowLeft className="w-4 h-4 rotate-180" />
                    </Link>
                </div>
            </div>
        );
    }

    // Map `DashboardWidgets` from the DB payload into the generic `layout` array renderer
    const layout = appConfig.widgets || [];

    // --- Runtime Execution Handlers ---
    const handleActionClick = (actionId: string) => {
        if (!actionId) return;
        // In a real app, this would open a payload modal or fire directly to the Action Engine
        alert(`Dispatched Action: ${actionId} to Ontology Runtime.`);
        // executeAction(actionId, "mock-instance", {}); 
    };

    // --- Recursive Runtime Renderer ---
    const renderWidget = (w: any) => {
        switch (w.type) {
            case 'Section':
                return (
                    <div key={w.id} className="w-full flex flex-col gap-6">
                        {w.children ? w.children.map(renderWidget) : null}
                    </div>
                );
            case 'Text':
                return (
                    <div key={w.id} className={`${w.properties.variant === 'h1' ? 'text-4xl font-black text-white' : 'text-base text-slate-300'} font-sans`}>
                        {w.properties.content}
                    </div>
                );
            case 'MetricCard':
                return (
                    <div key={w.id} className="bg-[#0B1220] border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col justify-between h-32 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-emerald-500/10 transition-colors" />
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest relative z-10">
                            <Activity className="w-4 h-4 text-emerald-400" /> {w.name}
                        </div>
                        <div className="text-4xl font-black text-white font-mono relative z-10">
                            {w.properties.value || '0'}
                        </div>
                    </div>
                );
            case 'ObjectTable':
                // In Runtime, we would parse the Bound Variable and fetch actual instances.
                // For this demo, if boundVariable contains 'drone', we fetch drones.
                const boundVar = (w.properties.boundVariable || '').toLowerCase();
                const isDrone = boundVar.includes('drone');
                const tableData = isDrone ? instances.filter(i => i.entityTypeId === 'ent-drone') : instances.slice(0, 5);

                return (
                    <div key={w.id} className="bg-[#0B1220] border border-white/5 rounded-2xl overflow-hidden shadow-xl mt-4">
                        <div className="px-6 py-4 border-b border-white/5 bg-black/20 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
                                <Database className="w-4 h-4 text-blue-400" /> {w.name}
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10 uppercase">
                                Bound: {w.properties.boundVariable || 'Unbound'}
                            </span>
                        </div>
                        <div className="overflow-x-auto w-full">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-white/2 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                    <tr>
                                        <th className="px-6 py-3">Identifier</th>
                                        <th className="px-6 py-3">Type</th>
                                        <th className="px-6 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData.map(i => (
                                        <tr key={i.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => router.push(`/run/entity/${i.entityTypeId}/${i.id}`)}>
                                            <td className="px-6 py-4 font-mono font-bold text-blue-400">{i.id}</td>
                                            <td className="px-6 py-4 text-slate-400 capitalize bg-white/5 px-2 py-0.5 rounded inline-block mt-2 ml-4 text-[10px]">{i.entityTypeId.replace('ent-', '')}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${i.properties.status === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                                    {i.properties.status || 'Active'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {tableData.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-8 text-center text-slate-500 italic text-xs">No records available in the Ontology.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'ActionButton':
                return (
                    <button key={w.id} onClick={() => handleActionClick(w.properties.actionId)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 group mt-4 w-fit">
                        <Zap className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" /> {w.properties.label || 'Execute Action'}
                    </button>
                );
            case 'Map':
                return (
                    <div key={w.id} className="w-full h-[600px] border border-white/10 rounded-2xl overflow-hidden shadow-2xl mt-6 relative">
                        <BattlefieldOverview layers={{ aip: true, satellites: false, flights: false }} visualMode="normal" />
                    </div>
                );
            case 'CopilotChat':
                return <AICopilotChat key={w.id} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#060A12] text-slate-300 font-sans flex flex-col">

            {/* Live App Navigation Bar (Isolated from Builder) */}
            <div className="h-14 border-b border-white/5 bg-[#03060C] flex items-center justify-between px-6 shrink-0 sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <Link href={`/projects`} className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg">
                        <LayoutTemplate className="w-4 h-4" />
                    </Link>
                    <div className="h-4 w-px bg-white/10" />
                    <span className="font-black text-white tracking-widest uppercase text-sm">{appConfig.name}</span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Deployment: {activeVersion}
                    </div>
                </div>
            </div>

            {/* The Live Rendered Application Area */}
            <div className="flex-1 overflow-y-auto w-full relative">
                <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }} />

                <div className="max-w-6xl mx-auto py-12 px-6 relative z-10 w-full flex flex-col gap-6">
                    {layout.map(renderWidget)}

                    {layout.length === 0 && (
                        <div className="mt-32 p-16 border border-white/5 bg-[#0B1220] rounded-3xl shadow-xl flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
                            <LayoutTemplate className="w-16 h-16 text-slate-600 mb-6" />
                            <h2 className="text-2xl font-black text-white mb-2">Blank Deployment</h2>
                            <p className="text-sm text-slate-400 font-sans leading-relaxed">
                                This Application has no configured UI widgets inside the active Project Release. Return to the Builder to map UI components, then Publish a new version to STAGING to see them here.
                            </p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
