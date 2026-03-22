'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
    Activity,
    AlertTriangle,
    Clock,
    Crosshair,
    Filter,
    Search,
    Shield,
    Signal,
    Zap,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import { ApiClient } from '@/lib/apiClient';
import { BattlefieldOverview } from '@/components/BattlefieldOverview';
import { Card } from '@/components/ui/Card';
import { MiniList, MiniListItem } from '@/components/ui/MiniList';
import { SeverityChip } from '@/components/ui/SeverityChip';
import { useLiveEntities } from '@/hooks/useWebSocket';
import { useIntelligenceStore } from '@/store/intelligenceStore';

type LayerState = {
    aip: boolean;
    flights: boolean;
    satellites: boolean;
};

interface MissionMetrics {
    readiness: string;
    throughput: string;
    activeAlerts: number;
    latency: string;
}

interface MavenDrone {
    id: string;
    callsign: string;
    label: string;
    status: string;
    batteryPct: number | null;
    lat: number | null;
    lon: number | null;
    altitudeFt: number | null;
    speedMph: number | null;
    headingDeg: number | null;
    dockId?: string | null;
    lastSeen: string;
    videoUrl?: string | null;
}

function normalizeDrone(raw: any): MavenDrone {
    const location = raw.location ?? {};
    const position = raw.position ?? {};

    return {
        id: raw.id,
        callsign: raw.callsign || raw.name || raw.id,
        label: raw.label || raw.dockId || raw.id,
        status: raw.status || 'unknown',
        batteryPct: typeof raw.batteryPct === 'number' ? raw.batteryPct : typeof raw.battery_pct === 'number' ? raw.battery_pct : null,
        lat: raw.lat ?? location.lat ?? position.lat ?? null,
        lon: raw.lon ?? location.lng ?? position.lng ?? null,
        altitudeFt: raw.altitudeFt ?? position.alt_ft ?? null,
        speedMph: raw.speedMph ?? raw.speed_mph ?? null,
        headingDeg: raw.headingDeg ?? raw.heading_deg ?? null,
        dockId: raw.dockId ?? null,
        lastSeen: raw.lastSeen || raw.ts || new Date().toISOString(),
        videoUrl: raw.videoUrl || raw.video_url || null,
    };
}

export default function MavenPage() {
    const [metrics, setMetrics] = useState<MissionMetrics | null>(null);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [proposals, setProposals] = useState<any[]>([]);
    const [httpDrones, setHttpDrones] = useState<MavenDrone[]>([]);
    const [selectedDroneId, setSelectedDroneId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [layers, setLayers] = useState<LayerState>({ aip: true, flights: true, satellites: true });
    const [sensorMode, setSensorMode] = useState<'day' | 'flir' | 'nvg'>('day');
    const { selection, setContext, updateSelection, setVar } = useIntelligenceStore();

    const { entities: liveDroneEntities } = useLiveEntities('Drone');

    useEffect(() => {
        let cancelled = false;

        const fetchData = async () => {
            try {
                const [metricsData, alertsData, dronesData, proposalsData] = await Promise.all([
                    ApiClient.get<MissionMetrics>('/api/v1/maven/metrics'),
                    ApiClient.get<any[]>('/api/v1/maven/alerts'),
                    ApiClient.get<any[]>('/api/v1/maven/drones'),
                    ApiClient.get<any[]>('/api/v1/maven/proposals'),
                ]);

                if (cancelled) return;
                setMetrics(metricsData);
                setAlerts(alertsData);
                setProposals(proposalsData);
                setHttpDrones(dronesData.map((row) => normalizeDrone(row)));
            } catch (error) {
                console.error('Failed to fetch Maven data', error);
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData, 5000);
        return () => {
            cancelled = true;
            clearInterval(intervalId);
        };
    }, []);

    const wsDrones = useMemo(() => {
        return (liveDroneEntities as any[]).map((row) => normalizeDrone(row));
    }, [liveDroneEntities]);

    const drones = useMemo(() => {
        const map = new Map<string, MavenDrone>();
        for (const drone of httpDrones) map.set(drone.id, drone);
        for (const drone of wsDrones) map.set(drone.id, { ...map.get(drone.id), ...drone });
        return Array.from(map.values()).sort((left, right) => left.callsign.localeCompare(right.callsign));
    }, [httpDrones, wsDrones]);

    useEffect(() => {
        if (drones.length === 0) {
            setSelectedDroneId(null);
            return;
        }

        if (!selectedDroneId || !drones.some((drone) => drone.id === selectedDroneId)) {
            setSelectedDroneId(drones[0].id);
        }
    }, [drones, selectedDroneId]);

    useEffect(() => {
        setContext('maven', {
            workspaceId: 'maven-mission-center',
            vars: { selectedDroneId: selectedDroneId || '', droneSearch: search, layers },
        });
    }, [layers, search, selectedDroneId, setContext]);

    useEffect(() => {
        setVar('selectedDroneId', selectedDroneId || '');
        setVar('droneSearch', search);
        setVar('layers', layers);
    }, [layers, search, selectedDroneId, setVar]);

    useEffect(() => {
        if (selectedDroneId) {
            updateSelection({ entityTypeId: 'Drone', logicalId: selectedDroneId });
        }
    }, [selectedDroneId, updateSelection]);

    useEffect(() => {
        const extSelectedDrone = selection.vars?.selectedDroneId;
        if (typeof extSelectedDrone === 'string' && extSelectedDrone && extSelectedDrone !== selectedDroneId) {
            setSelectedDroneId(extSelectedDrone);
        }

        const extSearch = selection.vars?.droneSearch;
        if (typeof extSearch === 'string' && extSearch !== search) {
            setSearch(extSearch);
        }

        const extLayers = selection.vars?.layers;
        if (
            extLayers &&
            typeof extLayers === 'object' &&
            typeof extLayers.aip === 'boolean' &&
            typeof extLayers.flights === 'boolean' &&
            typeof extLayers.satellites === 'boolean'
        ) {
            const nextLayers = extLayers as LayerState;
            if (
                nextLayers.aip !== layers.aip ||
                nextLayers.flights !== layers.flights ||
                nextLayers.satellites !== layers.satellites
            ) {
                setLayers(nextLayers);
            }
        }
    }, [layers, search, selectedDroneId, selection.vars]);

    const filteredDrones = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return drones;

        return drones.filter((drone) => {
            return (
                drone.callsign.toLowerCase().includes(query) ||
                drone.label.toLowerCase().includes(query) ||
                (drone.dockId || '').toLowerCase().includes(query)
            );
        });
    }, [drones, search]);

    const flyingDrones = filteredDrones.filter((drone) => drone.status.toLowerCase() === 'flying');
    const nonFlyingDrones = filteredDrones.filter((drone) => drone.status.toLowerCase() !== 'flying');
    const selectedDrone = drones.find((drone) => drone.id === selectedDroneId) ?? null;

    return (
        <div className="aip-page relative overflow-hidden">
            <div className="absolute inset-0 z-0">
                <BattlefieldOverview
                    layers={layers}
                    visualMode="ctos"
                    onEntitySelect={(id) => {
                        if (!id) setSelectedDroneId(null);
                        else if (id.startsWith('aip-')) setSelectedDroneId(id.slice(4));
                        else setSelectedDroneId(id);
                    }}
                    onAlert={(alert) => {
                        // Persist to backend so it shows up for all commanders
                        ApiClient.post('/api/v1/maven/alerts', {
                            alertType: alert.type,
                            severity: alert.severity.toUpperCase(),
                            logicalId: alert.logicalId,
                            entityTypeId: 'Drone', // Contextual
                            message: alert.message,
                            payload: { lat: alert.lat, lon: alert.lon, callsign: alert.callsign }
                        }).then((newAlert) => {
                            setAlerts(prev => [newAlert, ...prev].slice(0, 50));
                        }).catch(console.error);
                    }}
                    popoverRenderer={(sysId) => {
                        const logicalId = sysId.startsWith('aip-') ? sysId.slice(4) : sysId;
                        const hoverDrone = drones.find(d => d.id === logicalId);
                        if (!hoverDrone || !hoverDrone.videoUrl) return null;

                        return (
                            <div className="w-64 border border-pt-border bg-black/80 rounded overflow-hidden shadow-2xl backdrop-blur-md">
                                <div className="bg-pt-bg-panel px-2 py-1 text-[9px] uppercase tracking-widest font-black text-pt-text-muted flex justify-between">
                                    <span>{hoverDrone.callsign}</span>
                                    <span className="text-pt-intent-primary">{sensorMode.toUpperCase()}</span>
                                </div>
                                <div className="relative aspect-video">
                                    <video
                                        className="w-full h-full object-cover"
                                        style={{
                                            filter: sensorMode === 'flir'
                                                ? 'invert(0.8) grayscale(1) brightness(1.2) contrast(1.5) sepia(0.2) hue-rotate(180deg)'
                                                : sensorMode === 'nvg'
                                                    ? 'brightness(1.5) contrast(1.3) sepia(1) hue-rotate(70deg) saturate(4)'
                                                    : 'none'
                                        }}
                                        src={hoverDrone.videoUrl}
                                        autoPlay muted loop playsInline
                                    />
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-[8px] font-mono text-white/70 flex justify-between">
                                        <span>BATT: {hoverDrone.batteryPct ?? '-'}%</span>
                                        <span>ALT: {hoverDrone.altitudeFt?.toFixed(0) ?? '-'}ft</span>
                                    </div>
                                </div>
                            </div>
                        );
                    }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(4,8,13,0.2),rgba(2,4,8,0.75)_70%,rgba(2,4,8,0.95))]" />
            </div>

            <div className="relative z-10 flex-1 min-h-0 grid grid-cols-12 gap-3 p-3 pointer-events-none">
                <section className="pointer-events-auto col-span-12 xl:col-span-3 flex flex-col gap-3 min-h-0">
                    <Card title="Mission Readiness" pill="Operational" pillColor="success" className="bg-pt-bg-panel/78 backdrop-blur-md">
                        <div className="p-3 space-y-4">
                            <div>
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.16em] text-pt-text-muted mb-1.5">
                                    <span>Global Fleet Health</span>
                                    <span className="text-pt-intent-primary text-[12px] font-mono">{metrics?.readiness || '0%'}</span>
                                </div>
                                <div className="h-1.5 bg-pt-bg rounded-full overflow-hidden border border-pt-border">
                                    <div
                                        className="h-full bg-pt-intent-primary transition-all duration-700"
                                        style={{ width: metrics?.readiness || '0%' }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-[10px]">
                                <div>
                                    <div className="text-pt-text-muted uppercase tracking-widest font-black">Active Alerts</div>
                                    <div className="font-mono text-[18px] leading-tight text-pt-intent-danger">
                                        {String(metrics?.activeAlerts ?? 0).padStart(2, '0')}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-pt-text-muted uppercase tracking-widest font-black">Latency</div>
                                    <div className="font-mono text-[18px] leading-tight text-pt-text">{metrics?.latency || '0ms'}</div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card title="Drone Roster" pill={`${drones.length} Live`} pillColor="primary" className="flex-1 min-h-0 bg-pt-bg-panel/76 backdrop-blur-md">
                        <div className="p-3 border-b border-pt-border/60">
                            <div className="relative">
                                <Search size={12} className="absolute left-2 top-2 text-pt-text-muted" />
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    className="w-full h-7 bg-pt-bg border border-pt-border rounded pl-6 pr-2 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-pt-intent-primary"
                                    placeholder="Search callsign"
                                />
                            </div>
                        </div>

                        <div className="flex-1 min-h-0 grid grid-rows-[auto_minmax(0,1fr)_auto_minmax(0,1fr)]">
                            <div className="px-3 py-2 text-[9px] uppercase tracking-[0.2em] font-black text-pt-text-muted">Currently Flying</div>
                            <MiniList className="overflow-auto custom-scrollbar">
                                {flyingDrones.map((drone) => (
                                    <MiniListItem
                                        key={drone.id}
                                        label={drone.callsign}
                                        value={`${drone.batteryPct ?? '-'}%`}
                                        metadata={drone.label}
                                        icon={Activity}
                                        active={drone.id === selectedDroneId}
                                        onClick={() => setSelectedDroneId(drone.id)}
                                    />
                                ))}
                                {flyingDrones.length === 0 && (
                                    <div className="px-3 py-2 text-[10px] text-pt-text-muted/70">No flying drones in current filter.</div>
                                )}
                            </MiniList>

                            <div className="px-3 py-2 text-[9px] uppercase tracking-[0.2em] font-black text-pt-text-muted border-t border-pt-border/60">Online</div>
                            <MiniList className="overflow-auto custom-scrollbar">
                                {nonFlyingDrones.map((drone) => (
                                    <MiniListItem
                                        key={drone.id}
                                        label={drone.callsign}
                                        value={`${drone.batteryPct ?? '-'}%`}
                                        metadata={drone.label}
                                        icon={Shield}
                                        active={drone.id === selectedDroneId}
                                        onClick={() => setSelectedDroneId(drone.id)}
                                    />
                                ))}
                                {nonFlyingDrones.length === 0 && (
                                    <div className="px-3 py-2 text-[10px] text-pt-text-muted/70">No online drones in current filter.</div>
                                )}
                            </MiniList>
                        </div>
                    </Card>
                </section>

                <section className="pointer-events-auto col-span-12 xl:col-span-6 flex flex-col gap-3 min-h-0">
                    <Card title="Tactical Map Overlay" pill="CTOS" pillColor="primary" className="bg-pt-bg-panel/74 backdrop-blur-md">
                        <div className="p-3 grid grid-cols-1 lg:grid-cols-4 gap-3 items-center">
                            <div className="lg:col-span-2 text-[10px] text-pt-text-muted leading-relaxed">
                                Live map overlays are bound to ontology and telemetry streams. Toggle layers to control visual density and preserve operator focus.
                            </div>
                            <div className="lg:col-span-2 grid grid-cols-3 gap-2">
                                {([
                                    ['aip', 'Ontology'],
                                    ['flights', 'Flights'],
                                    ['satellites', 'Satellites'],
                                ] as Array<[keyof LayerState, string]>).map(([key, label]) => (
                                    <button
                                        key={key}
                                        onClick={() => setLayers((prev) => ({ ...prev, [key]: !prev[key] }))}
                                        className={`h-8 border rounded text-[9px] font-black uppercase tracking-widest transition-all ${layers[key]
                                            ? 'bg-pt-intent-primary/20 border-pt-intent-primary text-pt-text'
                                            : 'bg-pt-bg border-pt-border text-pt-text-muted hover:border-pt-border-dark'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Card>

                    <Card title="Tactical Incident Feed" className="flex-1 min-h-0 bg-pt-bg-panel/72 backdrop-blur-md">
                        <MiniList className="overflow-auto custom-scrollbar">
                            {alerts.map((alert) => (
                                <MiniListItem
                                    key={alert.id}
                                    label={alert.alertType}
                                    value={<SeverityChip severity={alert.severity || 'INFO'} />}
                                    metadata={`${alert.logicalId || 'unknown'} | ${String(alert.id).slice(0, 8).toUpperCase()}`}
                                    icon={alert.severity === 'CRITICAL' ? AlertTriangle : Signal}
                                />
                            ))}
                            {alerts.length === 0 && (
                                <div className="px-3 py-2 text-[10px] text-pt-text-muted/70">No active tactical incidents.</div>
                            )}
                        </MiniList>
                    </Card>

                    <Card title="Mission Action Proposals" pill={String(proposals.filter(p => p.status === 'PENDING').length)} pillColor="warning" className="flex-1 min-h-[30vh] bg-pt-bg-panel/72 backdrop-blur-md">
                        <div className="overflow-auto custom-scrollbar p-2 flex flex-col gap-2">
                            {proposals.map(proposal => (
                                <div key={proposal.id} className="bg-black/40 border border-pt-border/50 rounded p-2 text-[10px] space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div className="font-bold uppercase tracking-wide text-pt-intent-primary">{proposal.title}</div>
                                        <div className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${proposal.status === 'PENDING' ? 'bg-orange-500/20 text-orange-400' : proposal.status === 'EXECUTED' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {proposal.status}
                                        </div>
                                    </div>
                                    <div className="text-pt-text-muted">{proposal.description}</div>
                                    {proposal.status === 'PENDING' && (
                                        <div className="flex gap-2 pt-1 border-t border-pt-border/30 mt-2">
                                            <button onClick={() => {
                                                ApiClient.post(`/api/v1/maven/proposals/${proposal.id}/approve`, {}).then(() => setProposals(prev => prev.map(p => p.id === proposal.id ? { ...p, status: 'EXECUTED' } : p)));
                                            }} className="flex-1 py-1.5 mt-1 bg-pt-intent-primary/20 text-pt-intent-primary border border-pt-intent-primary/30 rounded hover:bg-pt-intent-primary hover:text-white transition flex items-center justify-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-pt-intent-primary">
                                                <CheckCircle size={10} /> Commit
                                            </button>
                                            <button onClick={() => {
                                                ApiClient.post(`/api/v1/maven/proposals/${proposal.id}/reject`, { reason: 'Dismissed.' }).then(() => setProposals(prev => prev.map(p => p.id === proposal.id ? { ...p, status: 'REJECTED' } : p)));
                                            }} className="flex-1 py-1.5 mt-1 bg-black/40 text-pt-text-muted border border-pt-border rounded hover:bg-black/60 transition flex items-center justify-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-pt-border">
                                                <XCircle size={10} /> Override
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {proposals.length === 0 && (
                                <div className="p-2 text-[10px] text-pt-text-muted/70">No pending action proposals.</div>
                            )}
                        </div>
                    </Card>
                </section>

                <section className="pointer-events-auto col-span-12 xl:col-span-3 flex flex-col gap-3 min-h-0">
                    <Card title="Mission Throughput" className="bg-pt-bg-panel/78 backdrop-blur-md p-3">
                        <div className="flex items-center justify-between">
                            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-pt-text-muted">Satellite Throughput</div>
                            <Zap size={12} className="text-pt-intent-primary" />
                        </div>
                        <div className="mt-2 text-[28px] leading-none font-mono text-pt-intent-primary">
                            {metrics?.throughput || '0'}
                            <span className="text-[11px] text-pt-text-muted ml-1">/S</span>
                        </div>
                    </Card>

                    <Card title="Live Sensor Feed" className="flex-1 min-h-0 bg-pt-bg-panel/82 backdrop-blur-md">
                        <div className="p-3 border-b border-pt-border/60 flex items-center justify-between gap-2">
                            <div className="text-[10px] uppercase tracking-[0.16em] font-black text-pt-text-muted">
                                {selectedDrone ? selectedDrone.callsign : 'No drone selected'}
                            </div>
                            <div className="flex gap-1">
                                {(['day', 'flir', 'nvg'] as const).map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => setSensorMode(m)}
                                        className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border rounded-sm transition-all ${sensorMode === m
                                            ? 'bg-pt-intent-primary text-white border-pt-intent-primary'
                                            : 'text-pt-text-muted border-pt-border hover:text-pt-text'
                                            }`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-3 flex-1 min-h-0 flex flex-col gap-3">
                            <div className="flex-1 min-h-[180px] border border-pt-border bg-black/70 rounded relative overflow-hidden group/video">
                                {selectedDrone ? (
                                    selectedDrone.videoUrl ? (
                                        <>
                                            <video
                                                className={`h-full w-full object-cover transition-all duration-500`}
                                                style={{
                                                    filter: sensorMode === 'flir'
                                                        ? 'invert(0.8) grayscale(1) brightness(1.2) contrast(1.5) sepia(0.2) hue-rotate(180deg)'
                                                        : sensorMode === 'nvg'
                                                            ? 'brightness(1.5) contrast(1.3) sepia(1) hue-rotate(70deg) saturate(4)'
                                                            : 'none'
                                                }}
                                                src={selectedDrone.videoUrl}
                                                autoPlay muted loop playsInline
                                            />
                                            {/* Tactical HUD Overlay */}
                                            <div className="absolute inset-0 pointer-events-none border-[20px] border-transparent group-hover/video:border-white/5 transition-all duration-700">
                                                <div className="absolute top-2 left-2 text-[8px] font-mono text-white/40 uppercase tracking-widest flex flex-col gap-0.5">
                                                    <span>ISO 800 | 1/500s</span>
                                                    <span>LENS 24mm f/1.8</span>
                                                </div>
                                                <div className="absolute top-2 right-2 text-[8px] font-mono text-white/40 uppercase tracking-widest text-right">
                                                    <span>REC ●</span>
                                                    <div className="mt-1">{new Date().toISOString().substring(11, 19)}</div>
                                                </div>
                                                {/* Crosshair */}
                                                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                                                    <div className="w-10 h-px bg-white" />
                                                    <div className="h-10 w-px bg-white" />
                                                    <div className="absolute w-20 h-20 border border-white rounded-full opacity-50" />
                                                </div>
                                                {/* Rangefinder */}
                                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
                                                    <div className="w-40 h-1 bg-white/20 rounded-full overflow-hidden">
                                                        <div className="h-full bg-white w-2/3" />
                                                    </div>
                                                    <span className="text-[9px] font-mono text-white">RANGE: 1,482m</span>
                                                </div>
                                            </div>
                                            {/* Sensor Mode Label */}
                                            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/60 border border-white/10 rounded text-[8px] font-mono text-white/60 uppercase tracking-widest">
                                                MODE_{sensorMode.toUpperCase()}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-pt-text-muted opacity-40">
                                            <Activity size={24} />
                                            <span className="text-[10px] uppercase tracking-widest">No Signal</span>
                                        </div>
                                    )
                                ) : (
                                    <span>Select a drone from roster to inspect telemetry and stream.</span>
                                )}
                            </div>

                            {selectedDrone && (
                                <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-pt-text-muted">
                                    <div className="aip-panel p-2">Battery: {selectedDrone.batteryPct ?? '-'}%</div>
                                    <div className="aip-panel p-2">Alt: {selectedDrone.altitudeFt ? `${selectedDrone.altitudeFt.toFixed(0)} ft` : '-'}</div>
                                    <div className="aip-panel p-2">Speed: {selectedDrone.speedMph ? `${selectedDrone.speedMph.toFixed(1)} mph` : '-'}</div>
                                    <div className="aip-panel p-2">Heading: {selectedDrone.headingDeg ? `${selectedDrone.headingDeg.toFixed(0)} deg` : '-'}</div>
                                    <div className="aip-panel p-2 col-span-2">Position: {selectedDrone.lat?.toFixed(5) ?? '-'}, {selectedDrone.lon?.toFixed(5) ?? '-'}</div>
                                </div>
                            )}
                        </div>
                    </Card>
                </section>
            </div>

            <footer className="relative z-20 h-10 border-t border-pt-border bg-pt-bg-panel/85 backdrop-blur-md flex items-center justify-between px-4 pointer-events-auto">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-black text-pt-intent-primary">
                        <Filter size={12} />
                        <span>Intelligence Context</span>
                    </div>
                    <div className="hidden md:flex items-center gap-4 text-[9px] uppercase tracking-widest font-black text-pt-text-muted">
                        <span>Mission Scope</span>
                        <span>Entity Registry</span>
                        <span>Active Assets</span>
                        <span>Communication Log</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-black text-pt-text-muted">
                        <Clock size={10} />
                        <span>{new Date().toLocaleTimeString()}</span>
                    </div>
                    <button
                        onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, shiftKey: true, key: 'u' }))}
                        className="h-6 px-3 bg-pt-intent-primary text-white text-[9px] uppercase tracking-[0.18em] font-black rounded-sm hover:brightness-110 transition-all flex items-center gap-2"
                    >
                        <Crosshair size={10} />
                        Tactical Commands
                    </button>
                </div>
            </footer>
        </div>
    );
}
