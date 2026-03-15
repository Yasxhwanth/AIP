
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Activity,
    Shield,
    Zap,
    Filter,
    ChevronRight,
    AlertTriangle,
    Loader2,
    Database,
    Boxes,
    Fingerprint,
    Search,
    Clock,
    Crosshair
} from 'lucide-react';
import { BattlefieldOverview } from '@/components/BattlefieldOverview';
import { ApiClient } from '@/lib/apiClient';
import { Card } from '@/components/ui/Card';
import { MiniList, MiniListItem } from '@/components/ui/MiniList';
import { SeverityChip } from '@/components/ui/SeverityChip';

interface MissionMetrics {
    readiness: string;
    throughput: string;
    activeAlerts: number;
    latency: string;
}

export default function MavenPage() {
    const [mavenOpen, setMavenOpen] = useState(true);
    const [metrics, setMetrics] = useState<MissionMetrics | null>(null);
    const [alerts, setAlerts] = useState<any[]>([]);

    // Initial Data Fetch & Polling
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [m, a] = await Promise.all([
                    ApiClient.get<MissionMetrics>('/api/v1/maven/metrics'),
                    ApiClient.get<any[]>('/api/v1/maven/alerts')
                ]);
                setMetrics(m);
                setAlerts(a);
            } catch (err) {
                console.error('Failed to fetch mission data:', err);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative flex flex-col h-full bg-pt-bg overflow-hidden font-sans">
            {/* ── Background Tactical Intelligence Layer ── */}
            <div className="absolute inset-0 z-0 opacity-40 grayscale hover:grayscale-0 transition-opacity duration-1000">
                <BattlefieldOverview
                    layers={{ aip: true, flights: true, satellites: true }}
                    visualMode="ctos" // This will be the high-fidelity strategic mode
                />
            </div>

            {/* ── Strategic HUD Overlay ── */}
            <div className="relative flex-1 flex flex-col z-10 p-4 pointer-events-none">
                <header className="flex justify-between items-start w-full mb-4">
                    <div className="space-y-4 w-80 pointer-events-auto">
                        <Card
                            title="Mission Strategic Readiness"
                            pill="Operational"
                            pillColor="success"
                            className="shadow-2xl backdrop-blur-md bg-pt-bg-panel/70"
                        >
                            <div className="p-4 space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[10px] text-pt-text-muted font-black uppercase tracking-widest">Global Fleet Health</span>
                                        <span className="text-[14px] font-mono font-bold text-pt-intent-primary">{metrics?.readiness || '0%'}</span>
                                    </div>
                                    <div className="h-1.5 bg-pt-bg rounded-full overflow-hidden border border-pt-border">
                                        <div
                                            className="h-full bg-pt-intent-primary shadow-[0_0_10px_rgba(16,107,163,0.8)] transition-all duration-1000"
                                            style={{ width: metrics?.readiness || '0%' }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-t border-pt-border/30 pt-4">
                                    <div className="space-y-1">
                                        <div className="text-[8px] text-pt-text-muted uppercase font-black tracking-widest">Active Alerts</div>
                                        <div className={`text-[18px] font-mono font-bold ${(metrics?.activeAlerts || 0) > 0 ? 'text-pt-intent-danger' : 'text-pt-intent-success'}`}>
                                            {String(metrics?.activeAlerts || 0).padStart(2, '0')}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[8px] text-pt-text-muted uppercase font-black tracking-widest">Network Latency</div>
                                        <div className="text-[18px] font-mono font-bold text-pt-text">{metrics?.latency || '32ms'}</div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* High-Density Alerts Feed */}
                        <Card title="Tactical Incident Feed" className="max-h-[500px] overflow-hidden backdrop-blur-md bg-pt-bg-panel/60">
                            <MiniList className="overflow-y-auto max-h-[468px] custom-scrollbar">
                                {alerts.map((alert) => (
                                    <MiniListItem
                                        key={alert.id}
                                        label={alert.alertType}
                                        value={<SeverityChip severity={alert.severity} />}
                                        metadata={`${alert.logicalId} • ${alert.id.slice(0, 8).toUpperCase()}`}
                                        icon={alert.severity === 'CRITICAL' ? AlertTriangle : Shield}
                                    />
                                ))}
                            </MiniList>
                        </Card>
                    </div>

                    {/* Right Side Stats */}
                    <div className="w-56 space-y-3 pointer-events-auto">
                        <Card className="bg-pt-bg-panel/70 backdrop-blur-md p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap size={12} className="text-pt-intent-primary" />
                                <span className="text-[9px] text-pt-text-muted font-black uppercase tracking-widest">Satellite Throughput</span>
                            </div>
                            <div className="text-[24px] font-mono font-bold text-pt-intent-primary tabular-nums">
                                {metrics?.throughput || '1.4GB'}
                                <span className="text-[10px] ml-1 opacity-50">/ S</span>
                            </div>
                        </Card>

                        <Card className="bg-pt-bg-panel/70 backdrop-blur-md p-3 border-l-pt-intent-warning border-l-2">
                            <div className="flex items-center gap-2 mb-2">
                                <Activity size={12} className="text-pt-intent-warning" />
                                <span className="text-[9px] text-pt-text-muted font-black uppercase tracking-widest">Ingestion Priority</span>
                            </div>
                            <div className="text-[20px] font-mono font-bold text-pt-intent-warning">NORMAL</div>
                            <div className="mt-2 h-1 bg-pt-bg rounded-full overflow-hidden">
                                <div className="h-full w-2/3 bg-pt-intent-warning animate-pulse" />
                            </div>
                        </Card>

                        <button className="w-full bg-pt-bg-panel/80 border border-pt-border hover:border-pt-intent-primary hover:bg-pt-bg-hover transition-all p-3 flex items-center justify-between group">
                            <div className="flex items-center gap-2">
                                <Crosshair size={14} className="text-pt-text-muted group-hover:text-pt-intent-primary" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-pt-text-muted group-hover:text-pt-text">Recenter Map</span>
                            </div>
                            <Clock size={12} className="text-pt-text-muted opacity-30" />
                        </button>
                    </div>
                </header>
            </div>

            {/* ── Contextual Action Bar ── */}
            <footer className="h-10 border-t border-pt-border bg-pt-bg-panel/80 backdrop-blur-xl flex items-center px-4 justify-between z-20">
                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2 text-[10px] uppercase font-black tracking-[0.2em] text-pt-intent-primary font-sans">
                        <Filter size={12} />
                        <span>Intelligence Context:</span>
                    </div>
                    <div className="flex space-x-6">
                        {['Mission Scope', 'Entity Registry', 'Active Assets', 'Communication Log'].map(tab => (
                            <button key={tab} className="text-[9px] uppercase font-black tracking-widest text-pt-text-muted hover:text-pt-text transition-colors border-b-2 border-transparent hover:border-pt-intent-primary pb-px">
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-pt-intent-success shadow-[0_0_8px_rgba(13,128,80,0.6)]" />
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Ontology Sync</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-pt-intent-primary shadow-[0_0_8px_rgba(16,107,163,0.6)]" />
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Maven Link</span>
                        </div>
                    </div>
                    <div className="h-4 w-px bg-pt-border" />
                    <button
                        onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, shiftKey: true, key: 'u' }))}
                        className="h-6 px-4 bg-pt-intent-primary hover:shadow-[0_0_15px_rgba(16,107,163,0.4)] text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-sm transition-all flex items-center gap-2 group"
                    >
                        <Zap size={10} className="group-hover:scale-125 transition-transform" />
                        <span>Tactical Commands</span>
                    </button>
                </div>
            </footer>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
}
