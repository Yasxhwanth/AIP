'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { ApiClient } from '@/lib/apiClient';
import { useLiveEntities, useDronePositionStream } from '@/hooks/useWebSocket';

// Set CESIUM_BASE_URL at module evaluation time — before any import('cesium') call.
// Cesium reads this global during its own module init to locate web workers & assets.
// Setting it inside the async init() is too late and leaves imagery web workers broken.
if (typeof window !== 'undefined') {
    (window as any).CESIUM_BASE_URL = '/cesium/';
}

// ─── Public Types ─────────────────────────────────────────────────────────────
export type VisualMode = 'normal' | 'nightvision' | 'flir' | 'crt' | 'ctos';

export const LANDMARKS = [
    { label: 'New York', lat: 40.7128, lng: -74.0060, alt: 500000 },
    { label: 'London', lat: 51.5074, lng: -0.1278, alt: 400000 },
    { label: 'Tokyo', lat: 35.6762, lng: 139.6503, alt: 400000 },
    { label: 'Delhi', lat: 28.6139, lng: 77.2090, alt: 500000 },
    { label: 'Moscow', lat: 55.7558, lng: 37.6173, alt: 400000 },
    { label: 'Dubai', lat: 25.2048, lng: 55.2708, alt: 300000 },
    { label: 'Pentagon', lat: 38.8719, lng: -77.0563, alt: 15000 },
    { label: 'Global', lat: 20, lng: 0, alt: 20000000 },
];

// Simple utility to convert meter offsets to lat/lon offsets.
function metersToLatLngOffset(latDeg: number, dxMeters: number, dyMeters: number) {
    const earthRadius = 6371000; // meters
    const dLat = dyMeters / earthRadius;
    const dLng = dxMeters / (earthRadius * Math.cos((latDeg * Math.PI) / 180));

    const latOffset = (dLat * 180) / Math.PI;
    const lngOffset = (dLng * 180) / Math.PI;
    return { latOffset, lngOffset };
}

// Approximate CTOS-style boundary polygon around the San Francisco Bay area.
// Format: [lng1, lat1, lng2, lat2, ...]
const CTOS_BAY_BOUNDARY: number[] = [
    -122.55, 37.90,
    -122.30, 37.95,
    -122.15, 37.85,
    -122.05, 37.70,
    -122.05, 37.55,
    -122.25, 37.45,
    -122.45, 37.45,
    -122.60, 37.60,
    -122.60, 37.80,
    -122.55, 37.90, // close the loop
];

// ─── Demo Mode ────────────────────────────────────────────────────────────────
const IS_DEMO = (process.env.NEXT_PUBLIC_DEMO_MODE ?? '').toLowerCase() === 'true';
const MOCK_ENTITIES = [
    { logicalId: 'DEMO-001', data: { type: 'Drone', latitude: 38.8719, longitude: -77.0563, altitude: 100 } },
    { logicalId: 'DEMO-002', data: { type: 'Drone', latitude: 51.5074, longitude: -0.1278, altitude: 50 } },
    { logicalId: 'DEMO-003', data: { type: 'Drone', latitude: 35.6762, longitude: 139.6503, altitude: 200 } },
    { logicalId: 'DEMO-004', data: { type: 'Drone', latitude: 28.6139, longitude: 77.2090, altitude: 300 } },
    { logicalId: 'DEMO-005', data: { type: 'Drone', latitude: -33.8688, longitude: 151.2093, altitude: 0 } },
    { logicalId: 'DEMO-006', data: { type: 'Drone', latitude: 48.8566, longitude: 2.3522, altitude: 150 } },
    { logicalId: 'DEMO-007', data: { type: 'Drone', latitude: 25.2048, longitude: 55.2708, altitude: 80 } },
    { logicalId: 'DEMO-008', data: { type: 'Drone', latitude: 55.7558, longitude: 37.6173, altitude: 250 } },
];

// ─── Props ────────────────────────────────────────────────────────────────────
export interface DroneAlertEvent {
    id: string;
    logicalId: string;
    callsign: string;
    type: 'BATTERY_CRITICAL' | 'BATTERY_LOW' | 'RTB' | 'GEOFENCE_BREACH' | 'SIGNAL_LOST' | 'SPEED_LIMIT' | 'OBSTACLE_AVOID' | 'MISSION_ALERT';
    severity: 'critical' | 'warning' | 'info';
    message: string;
    ts: number; // epoch ms
    lat?: number;
    lon?: number;
}

interface Props {
    layers: Record<string, boolean>;
    visualMode: VisualMode;
    onLayerCountChange?: (id: string, count: number) => void;
    flyToRef?: React.MutableRefObject<((lat: number, lng: number, alt: number) => void) | null>;
    onEntitySelect?: (id: string | null) => void;
    trackedEntities?: string[]; // array of raw IDs to render time trails for
    projectId?: string;
    onAlert?: (alert: DroneAlertEvent) => void; // Skydio-style alert callback
    popoverRenderer?: (id: string) => React.ReactNode; // Renders custom popover content for selected entity
}

// ─── Visual Filters ───────────────────────────────────────────────────────────
const FILTER_MAP: Record<VisualMode, string> = {
    normal: 'none',
    nightvision: 'brightness(0.9) hue-rotate(90deg) saturate(4) contrast(1.4) sepia(0.6)',
    flir: 'brightness(0.7) sepia(1) hue-rotate(180deg) saturate(6) contrast(1.8)',
    crt: 'contrast(1.2) brightness(0.85) saturate(1.3)',
    ctos: 'brightness(0.8) contrast(2.2) grayscale(1) invert(0.02) opacity(0.9)',
};

// ─── Canvas Icon Builders ─────────────────────────────────────────────────────
function getPlaneIconUrl(color: string = '#22d3ee'): string {
    const key = `plane-${color}`;
    if ((window as any)[key]) return (window as any)[key];
    const c = document.createElement('canvas');
    c.width = 64; c.height = 64;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, 64, 64);
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.fillStyle = color;
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✈', 32, 34);
    const url = c.toDataURL();
    (window as any)[key] = url;
    return url;
}

// ─── TLE Parsing ──────────────────────────────────────────────────────────────
function parseTleText(raw: string) {
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    const out: Array<{ name: string; tle1: string; tle2: string; norad: string; meanMotion: number }> = [];
    for (let i = 0; i + 2 < lines.length; i += 3) {
        const [name, tle1, tle2] = [lines[i], lines[i + 1], lines[i + 2]];
        if (tle1.startsWith('1') && tle2.startsWith('2')) {
            const norad = tle1.substring(2, 7).trim();
            const meanMotion = parseFloat(tle2.substring(52, 63).trim()) || 15; // rev/day
            out.push({ name, tle1, tle2, norad, meanMotion });
        }
    }
    return out;
}

// Propagate TLE to a given JS Date — returns ECEF position in km or null
function propagateAt(satjs: any, tle1: string, tle2: string, date: Date) {
    try {
        const satrec = satjs.twoline2satrec(tle1, tle2);
        const pv = satjs.propagate(satrec, date);
        if (!pv?.position || typeof pv.position === 'boolean') return null;
        const gmst = satjs.gstime(date);
        return satjs.eciToEcf(pv.position as any, gmst) as { x: number; y: number; z: number };
    } catch { return null; }
}

// ─── Singleton Guards ─────────────────────────────────────────────────────────
function sortByProximity<T extends { lat: number; lng: number }>(
    items: T[], camLat: number, camLng: number
) {
    return [...items].sort((a, b) =>
        Math.hypot(a.lat - camLat, a.lng - camLng) -
        Math.hypot(b.lat - camLat, b.lng - camLng)
    );
}

// ─── Singleton Guards ─────────────────────────────────────────────────────────
let _bodyCanvasEl: HTMLDivElement | null = null;
let _viewer: any = null;
let _googleTileset: any = null;
let _satRefreshTimer: ReturnType<typeof setInterval> | null = null;
let _renderSeq = 0;

// ─── Component ────────────────────────────────────────────────────────────────
export const BattlefieldOverview: React.FC<Props> = ({
    layers, visualMode, onLayerCountChange, flyToRef, onEntitySelect, trackedEntities = [], projectId, onAlert, popoverRenderer
}) => {
    const viewerRef = useRef<any>(null);
    const lastActiveEntities = useRef<Set<string>>(new Set());
    const sampledPositions = useRef<Map<string, any>>(new Map());
    // Stable ref so the async init closure can read the initial 3D tiles preference
    const layers3dTilesRef = useRef(!!layers['3dtiles']);

    const [selectedEntitySysId, setSelectedEntitySysId] = useState<string | null>(null);
    const [popoverPos, setPopoverPos] = useState<{ x: number, y: number } | null>(null);

    // ── Direct-feed drone position stream (bypasses React state for 60fps) ────
    const cesiumRef = useRef<any>(null);
    const droneEntityInitRef = useRef<Set<string>>(new Set());

    // Full 3-axis drone state cache — updated at 4Hz, read by CallbackProperties at 60fps
    // Using a flat scalar store (no objects) to keep the write path as cheap as possible
    const droneStateRef = useRef<Record<string, {
        headingDeg: number;    // flight heading (yaw of airframe)
        gimbalYaw: number;     // gimbal yaw relative to airframe
        gimbalPitch: number;   // gimbal pitch (negative = looking down)
        gimbalRoll: number;    // gimbal roll (lateral tilt)
        battery: number;
        status: string;
        lat: number;
        lon: number;
        altM: number;
        signalFrames: number;  // incremented each packet, reset on parse; >10 missing = signal lost
    }>>({})

    // Alert dedup: track which alert types have been fired per drone to avoid spam
    const alertedRef = useRef<Record<string, Set<string>>>({});
    const onAlertRef = useRef(onAlert);
    useEffect(() => { onAlertRef.current = onAlert; });

    // This callback is called directly from the WS onmessage handler — no setState!
    const onDronePosition = useCallback((logicalId: string, data: any) => {
        const viewer = _viewer;
        if (!viewer || viewer.isDestroyed()) return;
        const Cesium = cesiumRef.current;
        if (!Cesium) return;

        const loc = data.location || {};
        const posData = data.position || {};
        const lat = loc.lat ?? posData.lat;
        const lon = loc.lng ?? posData.lng;
        if (lat == null || lon == null) return;
        const altM = (posData.alt_ft || 120) * 0.3048;
        const entityId = `aip-${logicalId}`;

        const ent = viewer.entities.getById(entityId);
        if (!ent) return;

        // ─ Initialise SampledPositionProperty on first encounter ─
        if (!droneEntityInitRef.current.has(entityId)) {
            droneEntityInitRef.current.add(entityId);
            const sp = new Cesium.SampledPositionProperty(Cesium.ReferenceFrame.FIXED);
            sp.setInterpolationOptions({
                interpolationDegree: 3,
                interpolationAlgorithm: Cesium.HermitePolynomialApproximation,
            });
            sp.forwardExtrapolationType = Cesium.ExtrapolationType.HOLD;
            sp.backwardExtrapolationType = Cesium.ExtrapolationType.HOLD;
            ent.position = sp;
        }

        const sp = ent.position as any;
        if (sp instanceof Cesium.SampledPositionProperty) {
            const now = Cesium.JulianDate.now();
            sp.addSample(now, Cesium.Cartesian3.fromDegrees(lon, lat, altM));
            sp.removeSamplesBefore(Cesium.JulianDate.addSeconds(now, -60, new Cesium.JulianDate()));
        }

        // ─ Cache full 3-axis gimbal state ─
        const gimbal = data.gimbal || {};
        const gimbalYaw = gimbal.yaw ?? data.gimbal_yaw ?? 0;
        const gimbalPitch = gimbal.pitch ?? data.gimbal_pitch ?? -45;
        const gimbalRoll = gimbal.roll ?? data.gimbal_roll ?? 0;
        const headingDeg = data.heading_deg ?? 0;
        const battery = data.battery_pct ?? 100;
        const status = data.status ?? 'flying';
        const callsign = data.callsign || logicalId;

        if (!droneStateRef.current[logicalId]) {
            droneStateRef.current[logicalId] = { headingDeg, gimbalYaw, gimbalPitch, gimbalRoll, battery, status, lat, lon, altM, signalFrames: 0 };
        } else {
            const s = droneStateRef.current[logicalId];
            s.headingDeg = headingDeg; s.gimbalYaw = gimbalYaw;
            s.gimbalPitch = gimbalPitch; s.gimbalRoll = gimbalRoll;
            s.battery = battery; s.status = status;
            s.lat = lat; s.lon = lon; s.altM = altM;
            s.signalFrames = (s.signalFrames + 1) % 1000;
        }

        // ─ Update entity label with live data ─
        if (ent.label) {
            const bStr = battery != null ? `${Math.round(battery)}%` : '--';
            const altFt = Math.round(altM * 3.28084);
            ent.label.text = new Cesium.ConstantProperty(`${callsign}\n${bStr} │ ${altFt}ft`);
        }

        // ─ Skydio-style alert engine (fires at 4Hz, deduped per condition) ─
        if (!alertedRef.current[logicalId]) alertedRef.current[logicalId] = new Set();
        const alerted = alertedRef.current[logicalId];
        const emit = (type: DroneAlertEvent['type'], sev: DroneAlertEvent['severity'], msg: string) => {
            if (alerted.has(type)) return;
            alerted.add(type);
            // Auto-clear after 30s so the alert can re-fire if condition persists
            setTimeout(() => alerted.delete(type), 30000);
            onAlertRef.current?.({
                id: `${logicalId}-${type}-${Date.now()}`,
                logicalId, callsign, type, severity: sev, message: msg, ts: Date.now(), lat, lon
            });
        };

        if (battery <= 10) emit('BATTERY_CRITICAL', 'critical', `${callsign}: Battery CRITICAL — ${Math.round(battery)}%`);
        else if (battery <= 25) emit('BATTERY_LOW', 'warning', `${callsign}: Battery LOW — ${Math.round(battery)}%`);
        if (status === 'rtb') emit('RTB', 'warning', `${callsign}: Returning to base (battery ${Math.round(battery)}%)`);
        // Geofence breach: if drone strays more than 2km from any known base lat (simplified)
        const driftKm = Math.hypot(lat - 37.7895, lon + 122.3967) * 111;
        if (driftKm > 1.8) emit('GEOFENCE_BREACH', 'critical', `${callsign}: Geofence breach detected (${driftKm.toFixed(1)} km from base)`);
    }, []);

    useDronePositionStream(onDronePosition);

    // Preload Cesium module into ref so the hot path (onDronePosition) is synchronous
    useEffect(() => {
        import('cesium').then(C => { cesiumRef.current = C; });
    }, []);

    // ── Cesium init ───────────────────────────────────────────────────────────
    useEffect(() => {
        if (typeof window === 'undefined') return;
        let resizeHandler: (() => void) | null = null;

        if (_bodyCanvasEl) {
            viewerRef.current = _viewer;
            if (flyToRef && _viewer) {
                import('cesium').then(Cesium => {
                    flyToRef.current = (lat, lng, alt) =>
                        _viewer?.camera.flyTo({
                            destination: Cesium.Cartesian3.fromDegrees(lng, lat, alt),
                            duration: 2,
                        });
                });
            }
            return;
        }

        const el = document.createElement('div');
        el.id = 'cesium-root';
        Object.assign(el.style, {
            position: 'fixed', top: '0', left: '0',
            width: '100vw', height: '100vh',
            zIndex: '0', background: '#000',
            overflow: 'hidden', pointerEvents: 'auto',
        });
        document.body.appendChild(el);
        _bodyCanvasEl = el;

        const init = async () => {
            const Cesium = await import('cesium');
            // CESIUM_BASE_URL is already set at module level above — do NOT re-set it here
            // because that would overwrite it after Cesium has already used it.

            const tok = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;
            const gkey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
            if (tok) Cesium.Ion.defaultAccessToken = tok;

            // ── Base Imagery: Google Maps Satellite via Next.js server proxy ─
            // Browser proxy blocks direct calls to tile.googleapis.com, but Node.js
            // (Next.js server) can reach Google directly. We proxy tiles through
            // /api/tiles/{z}/{x}/{y} so Cesium gets real Google satellite imagery.
            // Falls back to local NaturalEarthII if the API key or proxy fails.
            if (gkey) Cesium.GoogleMaps.defaultApiKey = gkey;

            let baseImageryProvider: any;
            if (gkey) {
                try {
                    // Fire session warmup in the background — do NOT await.
                    // Cesium will retry any tiles that arrive before the session is ready.
                    fetch('/api/tiles/1/0/0').catch(() => { });

                    baseImageryProvider = new Cesium.UrlTemplateImageryProvider({
                        url: `${window.location.origin}/api/tiles/{z}/{x}/{y}`,
                        credit: 'Map data ©2025 Google',
                        tileWidth: 256,
                        tileHeight: 256,
                        minimumLevel: 0,
                        maximumLevel: 20,
                        // Google Maps uses Web Mercator (EPSG:3857)
                        tilingScheme: new Cesium.WebMercatorTilingScheme(),
                    });
                    console.info('[Cesium] Google Maps satellite imagery via proxy ready ✓');
                } catch (e) {
                    console.warn('[Cesium] Google Maps proxy failed, falling back to NaturalEarthII:', e);
                }
            }
            // Fallback: local NaturalEarthII (zero network, bundled with Cesium)
            if (!baseImageryProvider) {
                try {
                    baseImageryProvider = await Cesium.TileMapServiceImageryProvider.fromUrl(
                        '/cesium/Assets/Textures/NaturalEarthII'
                    );
                    console.info('[Cesium] Using local NaturalEarthII fallback imagery ✓');
                } catch (e) {
                    baseImageryProvider = new Cesium.OpenStreetMapImageryProvider({ url: 'https://tile.openstreetmap.org/' });
                }
            }

            const viewer = new Cesium.Viewer(el, {
                timeline: false, animation: false, baseLayerPicker: false,
                geocoder: false, homeButton: false, navigationHelpButton: false,
                sceneModePicker: false, infoBox: false, selectionIndicator: false,
                terrainProvider: new Cesium.EllipsoidTerrainProvider(),
                baseLayer: new Cesium.ImageryLayer(baseImageryProvider),
                creditContainer: document.createElement('div'),
                requestRenderMode: false,
                shouldAnimate: true,
            });

            // ── Google Photorealistic 3D Tiles via server proxy ────────────────
            // Tiles render ON TOP of the globe as an additive 3D mesh.
            // The globe (with Google Maps satellite imagery) stays ALWAYS visible —
            // NEVER set globe.show=false: at global zoom the tiles don't load and
            // the user only sees the atmosphere ring (the "circumference" bug).
            if (gkey) {
                try {
                    const rootGoogleUrl = `https://tile.googleapis.com/v1/3dtiles/root.json?key=${gkey}`;
                    const proxiedRoot = `${window.location.origin}/api/3dtiles-proxy?url=${encodeURIComponent(rootGoogleUrl)}`;
                    _googleTileset = await Cesium.Cesium3DTileset.fromUrl(proxiedRoot);
                    viewer.scene.primitives.add(_googleTileset);
                    _googleTileset.show = !!layers3dTilesRef.current;
                    // depthTest=false lets the tile mesh sit on the ellipsoid without z-fighting
                    viewer.scene.globe.depthTestAgainstTerrain = false;
                    console.info('[Cesium] Google Photorealistic 3D Tiles (proxied) loaded ✓');
                } catch (e) {
                    console.warn('[Cesium] Google 3D Tiles unavailable:', e);
                }
            }

            // ── Ion Bing Aerial — skip when we already have Google Maps proxy ─
            // Only attempt if no Google key (rare fallback scenario)
            if (tok && !gkey) {
                try {
                    const ionImagery = await Cesium.IonImageryProvider.fromAssetId(2);
                    viewer.imageryLayers.removeAll();
                    viewer.imageryLayers.addImageryProvider(ionImagery);
                    console.info('[Cesium] Ion Bing aerial loaded as fallback ✓');
                } catch (imgErr) {
                    console.warn('[Cesium] Ion imagery unavailable:', imgErr);
                }
            }

            // ── Performance settings ───────────────────────────────────────────
            viewer.resolutionScale = 1.0;
            viewer.scene.msaaSamples = 1;
            // Lower SSE = more tiles loaded per frame = sharper imagery on zoom
            viewer.scene.globe.maximumScreenSpaceError = 2;
            // Larger tile cache so tiles don't reload when panning/zooming back
            viewer.scene.globe.tileCacheSize = 200;
            viewer.scene.fog.enabled = false;
            viewer.scene.postProcessStages.fxaa.enabled = false;

            // Pin clock: 0.8s lag behind real-time so interpolation always has a future sample
            viewer.clock.currentTime = Cesium.JulianDate.addSeconds(Cesium.JulianDate.now(), -0.8, new Cesium.JulianDate());
            viewer.clock.multiplier = 1.0;
            viewer.clock.shouldAnimate = true;

            Object.assign(viewer.canvas.style, {
                width: '100%', height: '100%',
                position: 'absolute', top: '0', left: '0',
            });
            viewer.resize();
            viewer.render();

            (viewer.cesiumWidget.creditContainer as HTMLElement).style.display = 'none';

            viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(0, 20, 3_000_000),
                duration: 0,
            });
            viewer.resize();
            viewer.render();

            _viewer = viewer;
            viewerRef.current = viewer;

            // ── Click handler ─────────────────────────────────────────────────
            const _clickContext: { selectedOrbitId: string | null } = { selectedOrbitId: null };

            new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
                .setInputAction((click: any) => {
                    const picked = viewer.scene.pick(click.position);

                    // Clicked NOTHING (reset)
                    if (!picked?.id?.id) {
                        try {
                            if (_clickContext.selectedOrbitId) {
                                const oldOrbit = viewer.entities.getById(_clickContext.selectedOrbitId);
                                if (oldOrbit) {
                                    oldOrbit.polyline!.material = new Cesium.PolylineGlowMaterialProperty({ glowPower: 0.1, color: Cesium.Color.fromCssColorString('#4ade80').withAlpha(0.35) });
                                    oldOrbit.polyline!.width = new Cesium.ConstantProperty(1);
                                    (oldOrbit as any).__highlighted = false;
                                }
                                _clickContext.selectedOrbitId = null;
                            }
                        } catch (e) { }

                        // Fire React event (unselect)
                        setSelectedEntitySysId(null);
                        if (onEntitySelect) {
                            setTimeout(() => onEntitySelect(null), 0);
                        }
                        return;
                    }

                    // Clicked SOMETHING
                    const id: string = picked.id.id;

                    // 1. Pass selection to React
                    setSelectedEntitySysId(id);
                    if (onEntitySelect) {
                        setTimeout(() => onEntitySelect(id), 0);
                    }

                    // 2. Satellite specific: toggle highlight on the corresponding orbit entity
                    if (id.startsWith('sat-')) {
                        const orbitId = `orbit-${id}`;
                        const orbitEntity = viewer.entities.getById(orbitId);
                        if (!orbitEntity) return;

                        // Un-highlight previous orbit if it exists and is different
                        if (_clickContext.selectedOrbitId && _clickContext.selectedOrbitId !== orbitId) {
                            const oldOrbit = viewer.entities.getById(_clickContext.selectedOrbitId);
                            if (oldOrbit) {
                                oldOrbit.polyline!.material = new Cesium.PolylineGlowMaterialProperty({ glowPower: 0.1, color: Cesium.Color.fromCssColorString('#4ade80').withAlpha(0.35) });
                                oldOrbit.polyline!.width = new Cesium.ConstantProperty(1);
                                (oldOrbit as any).__highlighted = false;
                            }
                        }

                        const isHighlighted = (orbitEntity as any).__highlighted;
                        if (isHighlighted) {
                            // Dim it back
                            orbitEntity.polyline!.material = new Cesium.PolylineGlowMaterialProperty({
                                glowPower: 0.1,
                                color: Cesium.Color.fromCssColorString('#4ade80').withAlpha(0.35),
                            });
                            orbitEntity.polyline!.width = new Cesium.ConstantProperty(1);
                            (orbitEntity as any).__highlighted = false;
                            _clickContext.selectedOrbitId = null;
                        } else {
                            // Highlight: bright green, fly to satellite
                            orbitEntity.polyline!.material = new Cesium.PolylineGlowMaterialProperty({
                                glowPower: 0.3,
                                color: Cesium.Color.fromCssColorString('#84cc16').withAlpha(0.9),
                            });
                            orbitEntity.polyline!.width = new Cesium.ConstantProperty(2.5);
                            (orbitEntity as any).__highlighted = true;
                            _clickContext.selectedOrbitId = orbitId;

                            const satEntity = viewer.entities.getById(id);
                            const pos = satEntity?.position?.getValue(Cesium.JulianDate.now());
                            if (pos) {
                                viewer.camera.flyTo({
                                    destination: Cesium.Cartesian3.fromElements(
                                        (pos as any).x, (pos as any).y, (pos as any).z
                                    ),
                                    duration: 2,
                                });
                            }
                        }
                    } else {
                        // Zoom to Non-satellite entity
                        const ent = viewer.entities.getById(id);
                        const pos = ent?.position?.getValue(Cesium.JulianDate.now());
                        if (pos && !id.startsWith('orbit-')) {
                            viewer.camera.flyTo({
                                destination: Cesium.Cartesian3.fromElements(
                                    (pos as any).x, (pos as any).y, (pos as any).z
                                ),
                                duration: 2,
                                // Provide offset so it doesn't zoom INSIDE the entity
                                offset: new Cesium.HeadingPitchRange(0, -Math.PI / 4, 25000)
                            } as any);
                        }
                    }
                    viewer.scene.requestRender();
                }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

            if (flyToRef) {
                flyToRef.current = (lat, lng, alt) => {
                    if (!_viewer || _viewer.isDestroyed()) return;
                    import('cesium').then(Cesium => {
                        _viewer.camera.flyTo({
                            destination: Cesium.Cartesian3.fromDegrees(lng, lat, alt),
                            duration: 2,
                        });
                    });
                };
            }

            resizeHandler = () => {
                if (!viewer.isDestroyed()) viewer.resize();
            };
            window.addEventListener('resize', resizeHandler);
        };

        init().catch(err => console.error('[Cesium] init error:', err));
        return () => {
            if (resizeHandler) {
                window.removeEventListener('resize', resizeHandler);
            }
            if (_satRefreshTimer) {
                clearInterval(_satRefreshTimer);
                _satRefreshTimer = null;
            }
            try {
                if (_viewer && !_viewer.isDestroyed?.()) {
                    _viewer.destroy();
                }
            } catch {
                // ignore destroy errors during route transitions
            }
            _viewer = null;
            _googleTileset = null;
            viewerRef.current = null;
            if (_bodyCanvasEl?.parentNode) {
                _bodyCanvasEl.parentNode.removeChild(_bodyCanvasEl);
            }
            _bodyCanvasEl = null;
            if (flyToRef) {
                flyToRef.current = null;
            }
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Note: Drone positions are now driven by useDronePositionStream (see above),
    // which feeds Cesium.SampledPositionProperty directly from the WS onmessage
    // handler — zero React setState in the hot path = no frame drops.

    // Apply visual mode filter
    useEffect(() => {
        if (_bodyCanvasEl) _bodyCanvasEl.style.filter = FILTER_MAP[visualMode];
    }, [visualMode]);

    // ── Google 3D Tiles Reactivity (toggle show/hide only) ──────────────────
    useEffect(() => {
        layers3dTilesRef.current = !!layers['3dtiles'];
        const viewer = _viewer;
        if (!viewer || viewer.isDestroyed()) return;
        const show = !!layers['3dtiles'];
        if (_googleTileset) {
            // Toggle the 3D tile mesh. Globe ALWAYS stays visible — it provides
            // the Google Maps satellite base layer. 3D tiles add mesh detail on top.
            _googleTileset.show = show;
            viewer.scene.requestRender();
        }
    }, [layers]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Layer rendering ───────────────────────────────────────────────────────
    const renderLayers = useCallback(async () => {
        const viewer = _viewer;
        if (!viewer || viewer.isDestroyed()) return;

        const seq = ++_renderSeq;
        const Cesium = await import('cesium');
        const satjs = await import('satellite.js');
        if (seq !== _renderSeq) return;

        const isCtos = visualMode === 'ctos';

        // 1. Parallel Data Fetching
        const fetchPromises = [];
        const pId = projectId || localStorage.getItem('aip_active_project_id') || 'default';

        if (layers['aip']) {
            fetchPromises.push(IS_DEMO ? Promise.resolve(MOCK_ENTITIES) : ApiClient.get<any[]>('/api/v1/ontology/instances/current', { projectId: pId }).catch(() => []));
        } else { fetchPromises.push(Promise.resolve([])); }

        if (layers['flights']) {
            fetchPromises.push(fetch('https://opensky-network.org/api/states/all').then(r => r.ok ? r.json() : null).catch(() => null));
        } else { fetchPromises.push(Promise.resolve(null)); }

        if (layers['satellites']) {
            fetchPromises.push(fetch('/api/tle?group=visual').then(r => r.ok ? r.text() : '').catch(() => ''));
        } else { fetchPromises.push(Promise.resolve('')); }

        // Fetch telemetry paths for tracked entities
        if (trackedEntities.length > 0) {
            const mockTrails = trackedEntities.map(id => {
                const ent = MOCK_ENTITIES.find(m => m.logicalId === id) || { data: { latitude: 0, longitude: 0, altitude: 0 } };
                const { latitude: lat, longitude: lng, altitude: alt } = (ent.data as any) || {};
                const pts = [];
                for (let i = 0; i < 10; i++) pts.push({ lat: (lat || 0) - i * 0.1, lng: (lng || 0) - i * 0.1, alt: (alt || 0) + i * 1000 });
                return { id, points: pts };
            });
            fetchPromises.push(Promise.resolve(mockTrails));
        } else {
            fetchPromises.push(Promise.resolve([]));
        }

        // Fetch tactical alerts (Stage 10) - DISABLED BY OPERATOR REQUEST
        // fetchPromises.push(ApiClient.get<any[]>('/api/v1/alerts', { projectId: pId, limit: '10' }).catch(() => []));

        const [aipRaw, flightsRaw, tleRaw, trailsRaw] = await Promise.all(fetchPromises);
        const alertsRaw: any[] = []; // DISABLED
        if (seq !== _renderSeq) return;

        // 2. Data Processing (Synchronous)
        const entitiesToAdd: any[] = [];
        const camCart = viewer.camera.positionCartographic;
        const camLat = Cesium.Math.toDegrees(camCart?.latitude ?? 0);
        const camLng = Cesium.Math.toDegrees(camCart?.longitude ?? 0);
        const now = new Date();

        // ── AIP Processing ────────────────────────────────────────────────────
        let threatPos: { lat: number, lng: number } | null = null;
        let unitPos: { lat: number, lng: number } | null = null;

        if (layers['aip'] && aipRaw) {
            for (const ent of (aipRaw as any[])) {
                const { latitude, longitude, location, type, model, callsign, vehicle, position, heading_deg, headingDeg } = ent.data ?? {};
                const lat = location?.lat ?? latitude;
                const lng = location?.lng ?? longitude;
                if (!lat || !lng) continue;

                let color = Cesium.Color.CYAN;
                let isThreat = ent.logicalId.startsWith('threat');
                let isUnit = ent.logicalId.startsWith('unit');
                let isAsset = ent.logicalId.startsWith('asset');
                const isDrone = (type === 'Drone') || ent.logicalId.startsWith('drone') || ent.logicalId.startsWith('DEMO');

                // If demo mode or isolated frontend, ensure FOV telemetry state exists
                if (isDrone && !droneStateRef.current[ent.logicalId]) {
                    droneStateRef.current[ent.logicalId] = {
                        headingDeg: 0, gimbalYaw: 0, gimbalPitch: -45, gimbalRoll: 0,
                        battery: 100, status: 'flying', lat, lon: lng, altM: (position?.alt_ft ?? 120) * 0.3048,
                        signalFrames: 0
                    };
                }

                if (isThreat) {
                    color = Cesium.Color.RED;
                    threatPos = { lat, lng };
                } else if (isUnit) {
                    color = Cesium.Color.fromCssColorString('#4ade80'); // Green
                    unitPos = { lat, lng };
                } else if (isAsset) {
                    color = Cesium.Color.fromCssColorString('#3b82f6'); // Blue
                }

                const displayName = model || callsign || vehicle || type || ent.logicalId;

                const altFt = position?.alt_ft ?? 120;
                const altMeters = altFt * 0.3048;

                entitiesToAdd.push({
                    id: `aip-${ent.logicalId}`,
                    position: Cesium.Cartesian3.fromDegrees(lng, lat, isDrone ? altMeters : 0),
                    point: isDrone ? {
                        pixelSize: 14,
                        color: Cesium.Color.WHITE,
                        outlineColor: Cesium.Color.CYAN,
                        outlineWidth: 3,
                        disableDepthTestDistance: Number.POSITIVE_INFINITY
                    } : (isCtos ? {
                        pixelSize: 10,
                        color: Cesium.Color.WHITE,
                        outlineColor: color.withAlpha(0.8),
                        outlineWidth: 2,
                        disableDepthTestDistance: Number.POSITIVE_INFINITY
                    } : { pixelSize: 12, color, outlineColor: Cesium.Color.WHITE, outlineWidth: 2, disableDepthTestDistance: Number.POSITIVE_INFINITY }),
                    label: {
                        text: isCtos ? `${displayName.toUpperCase()}\n${(isDrone && ent.data.battery_pct) ? `${ent.data.battery_pct}%` : `NODE ${ent.logicalId.substring(0, 6)}`}` : displayName,
                        font: isCtos ? '900 11px monospace' : '12px monospace',
                        fillColor: isCtos ? Cesium.Color.WHITE : Cesium.Color.WHITE,
                        showBackground: true,
                        backgroundColor: Cesium.Color.fromCssColorString(isCtos ? '#000000cc' : '#0f172a99'),
                        backgroundPadding: new Cesium.Cartesian2(4, 2),
                        pixelOffset: new Cesium.Cartesian2(0, -28),
                        disableDepthTestDistance: Number.POSITIVE_INFINITY
                    },
                });

                if (isDrone) {
                    // Full 3-Axis Gimbal FOV Frustum (Skydio-style)
                    // We read live Pitch/Roll/Yaw from the 4Hz cache and project a 3D frustum to the ground.
                    const fovH = Cesium.Math.toRadians(60); // 60 deg horizontal FOV
                    const fovV = Cesium.Math.toRadians(40); // 40 deg vertical FOV

                    // Helper to compute the 4 ground intersection points of the camera frustum at 60fps
                    const getFrustumGroundPoints = (time: any, logicalId: string, defaultPos: import('cesium').Cartesian3) => {
                        const state = droneStateRef.current[logicalId];
                        const liveEnt = viewer.entities.getById(`aip-${logicalId}`);
                        const dronePos = liveEnt?.position?.getValue(time) || defaultPos;
                        const cart = Cesium.Cartographic.fromCartesian(dronePos);
                        const alt = cart.height;

                        // Fallback degenerate points if landed or missing state
                        const zeroFp = [dronePos, dronePos, dronePos, dronePos];

                        if (!state || alt < 1 || state.gimbalPitch >= 0) return { apex: dronePos, points: zeroFp };

                        // To avoid expensive raycasting every frame for 4 corners, we use a flattened projection 
                        // that correctly models roll skew and pitch elongation.
                        const dLat = Cesium.Math.toDegrees(cart.latitude);
                        const dLng = Cesium.Math.toDegrees(cart.longitude);

                        const pitchRad = Math.abs(Cesium.Math.toRadians(state.gimbalPitch));
                        const rollRad = Cesium.Math.toRadians(state.gimbalRoll);
                        const yawRad = Cesium.Math.toRadians(state.headingDeg + state.gimbalYaw);

                        // Center line distance to ground
                        const centerDist = alt * Math.tan(Math.PI / 2 - pitchRad);
                        // Approximate range bound
                        const rangeMeters = Math.max(alt * 1.5, 100);

                        const fpPoints: import('cesium').Cartesian3[] = [];

                        // 4 corners of screen
                        const corners = [
                            { x: -1, y: 1 },  // FL
                            { x: 1, y: 1 },   // FR
                            { x: 1, y: -1 },  // BR
                            { x: -1, y: -1 }  // BL
                        ];

                        for (const c of corners) {
                            // Apply roll (rotates x/y in camera plane)
                            const rx = c.x * Math.cos(rollRad) - c.y * Math.sin(rollRad);
                            const ry = c.x * Math.sin(rollRad) + c.y * Math.cos(rollRad);

                            // Apply FOV scaling
                            const a = yawRad + rx * (fovH / 2);
                            const d = Math.max(0, centerDist + ry * (rangeMeters * 0.8)); // simple skew

                            const dx = Math.sin(a) * d;
                            const dy = Math.cos(a) * d;

                            const { latOffset, lngOffset } = metersToLatLngOffset(dLat, dx, dy);
                            fpPoints.push(Cesium.Cartesian3.fromDegrees(dLng + lngOffset, dLat + latOffset, 0));
                        }

                        return { apex: dronePos, points: fpPoints };
                    };

                    // 1. Dynamic FOV Prism Volume
                    entitiesToAdd.push({
                        id: `fov-${ent.logicalId}`,
                        polygon: {
                            hierarchy: new Cesium.CallbackProperty((time: any) => {
                                const defaultPos = Cesium.Cartesian3.fromDegrees(lng, lat, altMeters);
                                const fov = getFrustumGroundPoints(time, ent.logicalId, defaultPos);

                                return new Cesium.PolygonHierarchy([
                                    fov.apex,
                                    fov.points[0], fov.points[1], fov.points[2], fov.points[3]
                                ]);
                            }, false),
                            perPositionHeight: true,
                            material: Cesium.Color.fromCssColorString('#22d3ee').withAlpha(0.12),
                            outline: false
                        }
                    });

                    // 2. Dynamic Skeleton (Directly bound to footprint)
                    for (let i = 0; i < 4; i++) {
                        entitiesToAdd.push({
                            id: `fov-edge-${ent.logicalId}-${i}`,
                            polyline: {
                                positions: new Cesium.CallbackProperty((time: any) => {
                                    const defaultPos = Cesium.Cartesian3.fromDegrees(lng, lat, altMeters);
                                    const fov = getFrustumGroundPoints(time, ent.logicalId, defaultPos);
                                    return [fov.apex, fov.points[i]];
                                }, false),
                                width: 1.2,
                                material: Cesium.Color.fromCssColorString('#22d3ee').withAlpha(0.3)
                            }
                        });
                    }

                    // 3. Dynamic Ground footprint outline
                    entitiesToAdd.push({
                        id: `fov-footprint-${ent.logicalId}`,
                        polyline: {
                            positions: new Cesium.CallbackProperty((time: any) => {
                                const defaultPos = Cesium.Cartesian3.fromDegrees(lng, lat, altMeters);
                                const fov = getFrustumGroundPoints(time, ent.logicalId, defaultPos);
                                // Ground path is a closed loop of the 4 points
                                return [fov.points[0], fov.points[1], fov.points[2], fov.points[3], fov.points[0]];
                            }, false),
                            width: 2.0,
                            material: new Cesium.PolylineDashMaterialProperty({
                                color: Cesium.Color.fromCssColorString('#22d3ee').withAlpha(0.8),
                                dashLength: 16.0
                            })
                        }
                    });
                }

                if (isThreat) {
                    entitiesToAdd.push({
                        id: `radius-threat-${ent.logicalId}`,
                        position: Cesium.Cartesian3.fromDegrees(lng, lat, 0),
                        ellipse: {
                            semiMinorAxis: 8000,
                            semiMajorAxis: 8000,
                            material: Cesium.Color.RED.withAlpha(0.15),
                            outline: true,
                            outlineColor: Cesium.Color.RED.withAlpha(0.6)
                        }
                    });
                }
            }
        }

        // Draw assault route between Unit and Threat if valid
        if (threatPos && unitPos) {
            // Generate a slight bend in the route to simulate road/terrain traversal
            const midLat = (threatPos.lat + unitPos.lat) / 2 + 0.01;
            const midLng = (threatPos.lng + unitPos.lng) / 2 + 0.01;

            entitiesToAdd.push({
                id: 'assault-route',
                polyline: {
                    positions: Cesium.Cartesian3.fromDegreesArray([
                        unitPos.lng, unitPos.lat,
                        midLng, midLat,
                        threatPos.lng, threatPos.lat
                    ]),
                    width: 4,
                    material: new Cesium.PolylineDashMaterialProperty({
                        color: Cesium.Color.fromCssColorString('#4ade80'), // Green dashed line
                        gapColor: Cesium.Color.TRANSPARENT,
                        dashLength: 16
                    }),
                    arcType: Cesium.ArcType.GEODESIC
                }
            });

            // Cross-ontology alerting: "Drone battery low + Convoy in danger" automatically triggers a Maven mission alert.
            const rawStates = Object.entries(droneStateRef.current);
            const lowBatteryDrone = rawStates.find(([_, state]) => state.battery <= 25);
            if (lowBatteryDrone) {
                const [drId, drState] = lowBatteryDrone;
                const alertKey = 'CROSS_ONTOLOGY_DANGER';
                if (!alertedRef.current[drId]) alertedRef.current[drId] = new Set();

                if (!alertedRef.current[drId].has(alertKey)) {
                    alertedRef.current[drId].add(alertKey);
                    setTimeout(() => alertedRef.current[drId].delete(alertKey), 60000); // 1m expiry

                    onAlertRef.current?.({
                        id: `cross-${drId}-${Date.now()}`,
                        logicalId: drId,
                        callsign: drId,
                        type: 'MISSION_ALERT',
                        severity: 'critical',
                        message: `MISSION ALERT: Convoy engaged while ${drId} has LOW BATTERY!`,
                        ts: Date.now(),
                        lat: drState.lat,
                        lon: drState.lon
                    });
                }
            }
        }

        // ── Network Web + CTOS overlays (Watch_Dogs-style) ───────────────
        if (isCtos) {
            const nodes = (aipRaw as any[]).map(ent => {
                const { latitude, longitude, location } = ent.data ?? {};
                return { lat: location?.lat ?? latitude, lng: location?.lng ?? longitude };
            }).filter(n => n.lat && n.lng);

            // Light network web between nearby ontology nodes
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < Math.min(i + 5, nodes.length); j++) {
                    entitiesToAdd.push({
                        id: `net-web-${i}-${j}`,
                        polyline: {
                            positions: Cesium.Cartesian3.fromDegreesArray([
                                nodes[i].lng, nodes[i].lat,
                                nodes[j].lng, nodes[j].lat
                            ]),
                            width: 1,
                            material: Cesium.Color.CYAN.withAlpha(0.15)
                        }
                    });
                }
            }

            // Red dashed perimeter roughly around the SF Bay area
            entitiesToAdd.push({
                id: 'ctos-bay-outline',
                polyline: {
                    positions: Cesium.Cartesian3.fromDegreesArray(CTOS_BAY_BOUNDARY),
                    width: 2,
                    material: new Cesium.PolylineDashMaterialProperty({
                        color: Cesium.Color.fromCssColorString('#f97316').withAlpha(0.9),
                        dashLength: 24
                    })
                }
            });

            // Hatched fill inside the perimeter to mimic CTOS "zone" visuals
            entitiesToAdd.push({
                id: 'ctos-bay-hatch',
                polygon: {
                    hierarchy: Cesium.Cartesian3.fromDegreesArray(CTOS_BAY_BOUNDARY),
                    material: new Cesium.StripeMaterialProperty({
                        evenColor: Cesium.Color.TRANSPARENT,
                        oddColor: Cesium.Color.fromCssColorString('#020617').withAlpha(0.5),
                        repeat: 40,
                        offset: (now.getTime() / 4000) % 1,
                    }),
                    outline: false
                }
            });

            // Local CTOS grid centered around the camera
            const spanDeg = 1.2;
            const stepDeg = 0.2;
            const latStart = camLat - spanDeg;
            const latEnd = camLat + spanDeg;
            const lngStart = camLng - spanDeg;
            const lngEnd = camLng + spanDeg;

            for (let latLine = Math.ceil(latStart / stepDeg) * stepDeg; latLine <= latEnd; latLine += stepDeg) {
                entitiesToAdd.push({
                    id: `ctos-grid-h-${latLine.toFixed(2)}`,
                    polyline: {
                        positions: Cesium.Cartesian3.fromDegreesArray([
                            lngStart, latLine,
                            lngEnd, latLine
                        ]),
                        width: 0.75,
                        material: Cesium.Color.fromCssColorString('#0f172a').withAlpha(0.8)
                    }
                });
            }

            for (let lngLine = Math.ceil(lngStart / stepDeg) * stepDeg; lngLine <= lngEnd; lngLine += stepDeg) {
                entitiesToAdd.push({
                    id: `ctos-grid-v-${lngLine.toFixed(2)}`,
                    polyline: {
                        positions: Cesium.Cartesian3.fromDegreesArray([
                            lngLine, latStart,
                            lngLine, latEnd
                        ]),
                        width: 0.75,
                        material: Cesium.Color.fromCssColorString('#0f172a').withAlpha(0.8)
                    }
                });
            }
        }

        // ── Trails Processing ──────────────────────────────────────────────────
        if (trailsRaw && (trailsRaw as any[]).length > 0) {
            for (const trail of (trailsRaw as any[])) {
                if (!trail.points || trail.points.length < 2) continue;
                const pts = trail.points.map((p: any) => Cesium.Cartesian3.fromDegrees(p.lng, p.lat, p.alt));
                entitiesToAdd.push({
                    id: `trail-${trail.id}`,
                    polyline: {
                        positions: pts,
                        width: 3,
                        material: new Cesium.PolylineGlowMaterialProperty({
                            glowPower: 0.2,
                            color: Cesium.Color.fromCssColorString('#06b6d4').withAlpha(0.7)
                        }),
                        arcType: Cesium.ArcType.NONE
                    },
                });
            }
        }

        // ── Flights Processing ────────────────────────────────────────────────
        if (layers['flights'] && flightsRaw) {
            const flights: any[] = [];
            for (const s of (flightsRaw.states ?? [])) {
                const [icao, cs, , , , lng, lat, altBaro, , velocity, , , , trueTrack] = s;
                if (!lat || !lng) continue;
                flights.push({ id: icao, callsign: (cs ?? icao ?? '').trim() || icao, lat, lng, alt: Math.max(altBaro ?? 8000, 200), heading: trueTrack ?? 0, kts: Math.round((velocity ?? 0) * 1.944), fl: Math.round((altBaro ?? 8000) / 30.48) });
            }
            const isCtos = visualMode === 'ctos';
            const planeUrl = getPlaneIconUrl(isCtos ? '#ff3e3e' : '#22d3ee');
            const sorted = sortByProximity(flights, camLat, camLng).slice(0, 6000);
            for (const f of sorted) {
                entitiesToAdd.push({
                    id: `fl-${f.id}`,
                    position: Cesium.Cartesian3.fromDegrees(f.lng, f.lat, f.alt),
                    billboard: { image: planeUrl, width: isCtos ? 32 : 24, height: isCtos ? 32 : 24, rotation: -Cesium.Math.toRadians(f.heading), alignedAxis: Cesium.Cartesian3.ZERO, disableDepthTestDistance: Number.POSITIVE_INFINITY, sizeInMeters: false },
                    label: {
                        text: isCtos ? `${f.callsign}\nVEC ${f.kts} ALT ${f.fl}00` : `${f.callsign} · FL${f.fl} · ${f.kts} kts`,
                        font: '10px monospace',
                        fillColor: Cesium.Color.fromCssColorString(isCtos ? '#ff3e3e' : '#22d3ee'),
                        showBackground: true,
                        backgroundColor: Cesium.Color.fromCssColorString('#000000cc'),
                        backgroundPadding: new Cesium.Cartesian2(4, 2),
                        pixelOffset: new Cesium.Cartesian2(0, isCtos ? -32 : -28),
                        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5000000),
                        disableDepthTestDistance: Number.POSITIVE_INFINITY
                    },
                });

                if (isCtos) {
                    // Add dashed path for ctOS flights
                    entitiesToAdd.push({
                        id: `fl-path-${f.id}`,
                        polyline: {
                            positions: Cesium.Cartesian3.fromDegreesArrayHeights([
                                f.lng - Math.sin(Cesium.Math.toRadians(f.heading)) * 0.5, f.lat - Math.cos(Cesium.Math.toRadians(f.heading)) * 0.5, f.alt,
                                f.lng, f.lat, f.alt
                            ]),
                            width: 2,
                            material: new Cesium.PolylineDashMaterialProperty({
                                color: Cesium.Color.fromCssColorString('#ff3e3e').withAlpha(0.6),
                                dashLength: 12
                            })
                        }
                    });
                }
            }
        }

        // ── Satellites Processing ─────────────────────────────────────────────
        const satSorted: any[] = [];
        if (layers['satellites']) {
            let tleText = (tleRaw as string);
            if (!tleText || tleText.trim().length < 30) tleText = BUILTIN_TLES;
            const sats = parseTleText(tleText).slice(0, 300);
            const plotList: any[] = [];

            for (const { name, tle1, tle2, norad, meanMotion } of sats) {
                const satrec = satjs.twoline2satrec(tle1, tle2);
                const ecef = propagateAt(satjs, tle1, tle2, now);
                if (!ecef) continue;

                const altKm = Math.sqrt(ecef.x ** 2 + ecef.y ** 2 + ecef.z ** 2) - 6371;
                const gmst = satjs.gstime(now);
                const eciPos = satjs.propagate(satrec, now)?.position;
                const geo = eciPos && typeof eciPos !== 'boolean' ? satjs.eciToGeodetic(eciPos as any, gmst) : null;
                const lat = geo ? Cesium.Math.toDegrees(geo.latitude ?? 0) : 0;
                const lng = geo ? Cesium.Math.toDegrees(geo.longitude ?? 0) : 0;

                const orbitPts: any[] = [];
                const stepSec = (86400 / meanMotion) / 72;
                for (let i = 0; i < 72; i++) {
                    const ep = propagateAt(satjs, tle1, tle2, new Date(now.getTime() + i * stepSec * 1000));
                    if (ep) orbitPts.push(Cesium.Cartesian3.fromElements(ep.x * 1000, ep.y * 1000, ep.z * 1000));
                }
                if (orbitPts.length < 8) continue;

                plotList.push({ id: `sat-${norad}`, name: name.trim(), norad, tle1, tle2, lat, lng, cesPos: Cesium.Cartesian3.fromElements(ecef.x * 1000, ecef.y * 1000, ecef.z * 1000), altKm, isGeo: altKm > 35000, orbitPts, satrec });
            }

            const sorted = sortByProximity(plotList, camLat, camLng);
            satSorted.push(...sorted);
            for (const sat of sorted) {
                entitiesToAdd.push({
                    id: sat.id, position: sat.cesPos,
                    point: { pixelSize: sat.isGeo ? 9 : 7, color: sat.isGeo ? Cesium.Color.GOLD : Cesium.Color.fromCssColorString('#e2e8f0'), outlineColor: sat.isGeo ? Cesium.Color.ORANGE : Cesium.Color.CYAN, outlineWidth: 1.5, disableDepthTestDistance: Number.POSITIVE_INFINITY },
                    label: { text: `${sat.name}\n${sat.altKm.toFixed(0)} km · NORAD ${sat.norad}`, font: '9px monospace', fillColor: sat.isGeo ? Cesium.Color.GOLD : Cesium.Color.fromCssColorString('#e2e8f0'), showBackground: true, backgroundColor: Cesium.Color.fromCssColorString('#000000cc'), backgroundPadding: new Cesium.Cartesian2(5, 3), pixelOffset: new Cesium.Cartesian2(0, -18), distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 40000000), disableDepthTestDistance: Number.POSITIVE_INFINITY },
                });
                entitiesToAdd.push({
                    id: `orbit-${sat.id}`,
                    polyline: { positions: sat.orbitPts, width: 1, material: new Cesium.PolylineGlowMaterialProperty({ glowPower: 0.1, color: Cesium.Color.fromCssColorString('#4ade80').withAlpha(0.35) }), arcType: Cesium.ArcType.NONE },
                });
            }
        }

        // ── Alerts Processing (Tactical HUD) ──────────────────────────────────
        /* ALERTS DISABLED BY USER REQUEST FOR NOW
        if (alertsRaw && Array.isArray(alertsRaw)) {
            for (const alert of alertsRaw) {
                const { lat, lng, description } = alert.payload ?? {};
                if (!lat || !lng) continue;
         
                const isNew = (new Date().getTime() - new Date(alert.createdAt).getTime()) < 60000;
                const blink = Math.sin(now.getTime() / 200);
         
                entitiesToAdd.push({
                    id: `alert-${alert.id}`,
                    position: Cesium.Cartesian3.fromDegrees(lng, lat, 20),
                    point: {
                        pixelSize: isNew ? 22 + 6 * blink : 14,
                        color: Cesium.Color.RED.withAlpha(isNew ? 0.7 + 0.3 * blink : 0.8),
                        outlineColor: Cesium.Color.WHITE,
                        outlineWidth: 2,
                        disableDepthTestDistance: Number.POSITIVE_INFINITY
                    },
                    label: {
                        text: `\u26a0 ${alert.alertType}\n${description || ''}`,
                        font: 'bold 12px monospace',
                        fillColor: Cesium.Color.WHITE,
                        outlineColor: Cesium.Color.BLACK,
                        outlineWidth: 2,
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        showBackground: true,
                        backgroundColor: Cesium.Color.RED.withAlpha(0.6),
                        pixelOffset: new Cesium.Cartesian2(0, -40),
                        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                        disableDepthTestDistance: Number.POSITIVE_INFINITY
                    }
                });
            }
        }
        */

        // 3. Differential Map Update
        if (seq !== _renderSeq) return;

        const currentIds = new Set(entitiesToAdd.map(e => e.id));

        // Remove entities that are no longer in our set (but keep system entities prefixed with __)
        const allEntities = viewer.entities.values as any[];
        for (const e of allEntities) {
            const sid = String(e.id ?? '');
            if (!sid.startsWith('__') && !currentIds.has(sid)) {
                viewer.entities.remove(e);
            }
        }

        // Upsert new/existing entities
        for (const config of entitiesToAdd) {
            let existing = viewer.entities.getById(config.id);
            if (!existing) {
                viewer.entities.add(config);
            } else {
                // Update position IF it's not a live tracked sampled position
                if (config.position && !(existing.position instanceof Cesium.SampledPositionProperty)) {
                    existing.position = new Cesium.ConstantPositionProperty(config.position);
                }

                // Update other properties derived from config
                if (config.label && existing.label) {
                    if (config.label.text) existing.label.text = config.label.text;
                }
                if (config.polyline && existing.polyline) {
                    if (config.polyline.positions) existing.polyline.positions = config.polyline.positions;
                    if (config.polyline.width) existing.polyline.width = config.polyline.width;
                    if (config.polyline.material) existing.polyline.material = config.polyline.material;
                }
                if (config.polygon && existing.polygon) {
                    if (config.polygon.hierarchy) existing.polygon.hierarchy = config.polygon.hierarchy;
                    if (config.polygon.material) existing.polygon.material = config.polygon.material;
                }
                if (config.ellipse && existing.ellipse) {
                    if (config.ellipse.semiMinorAxis) existing.ellipse.semiMinorAxis = config.ellipse.semiMinorAxis;
                    if (config.ellipse.semiMajorAxis) existing.ellipse.semiMajorAxis = config.ellipse.semiMajorAxis;
                }
                if (config.point && existing.point) {
                    if (config.point.pixelSize) existing.point.pixelSize = config.point.pixelSize;
                }
                if (config.box && existing.box) {
                    if (config.box.dimensions) existing.box.dimensions = config.box.dimensions;
                }
            }
        }

        onLayerCountChange?.('aip', (aipRaw as any[])?.length || 0);
        onLayerCountChange?.('flights', (flightsRaw?.states?.length) || 0);
        onLayerCountChange?.('satellites', satSorted.length);

        // 4. Position Refresh Timer
        if (_satRefreshTimer) clearInterval(_satRefreshTimer);
        if (layers['satellites'] && satSorted.length > 0) {
            _satRefreshTimer = setInterval(async () => {
                if (!_viewer || _viewer.isDestroyed()) return;
                const C = await import('cesium');
                const now2 = new Date();
                for (const sat of satSorted) {
                    const satEntity = _viewer.entities.getById(sat.id);
                    if (!satEntity) continue;
                    const ecef2 = propagateAt(satjs, sat.tle1, sat.tle2, now2);
                    if (ecef2) satEntity.position = new C.ConstantPositionProperty(C.Cartesian3.fromElements(ecef2.x * 1000, ecef2.y * 1000, ecef2.z * 1000)) as any;
                }
                _viewer.scene.requestRender();
            }, 30000);
        }

        // ── ctOS 2.0 Full Overlay System ────────────────────────────────────
        if (visualMode === 'ctos') {

            // 1. LARGE REGIONAL LABELS (perspective-aligned, fades with altitude)
            const regions = [
                { name: 'GREATER SAN FRANCISCO\nBAY AREA', lat: 37.7749, lng: -122.4194 },
                { name: 'SILICON VALLEY HUB', lat: 37.3382, lng: -121.8863 },
                { name: 'OAKLAND\nINDUSTRIAL SECTOR', lat: 37.8044, lng: -122.2712 },
                { name: 'NEW YORK\nMETRO GRID', lat: 40.7128, lng: -74.0060 },
                { name: 'LONDON\nCENTRAL NODE', lat: 51.5074, lng: -0.1278 },
                { name: 'TOKYO\nKANTO DATA-STREAM', lat: 35.6762, lng: 139.6503 },
                { name: 'DUBAI\nFINANCIAL NEXUS', lat: 25.2048, lng: 55.2708 },
                { name: 'MOSCOW\nCOMMAND GRID', lat: 55.7558, lng: 37.6173 },
            ];
            for (const reg of regions) {
                entitiesToAdd.push({
                    id: `reg-${reg.name}`,
                    position: Cesium.Cartesian3.fromDegrees(reg.lng, reg.lat, 0),
                    label: {
                        text: reg.name,
                        font: '900 64px "Arial Narrow", Arial, sans-serif',
                        fillColor: Cesium.Color.WHITE.withAlpha(0.75),
                        outlineColor: Cesium.Color.BLACK.withAlpha(0.8),
                        outlineWidth: 6,
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                        verticalOrigin: Cesium.VerticalOrigin.CENTER,
                        disableDepthTestDistance: Number.POSITIVE_INFINITY,
                        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 2_500_000),
                        translucencyByDistance: new Cesium.NearFarScalar(300_000, 1.0, 2_500_000, 0.0),
                    }
                });
            }

            // 2. DENSE CITY-WIDE DATA NODE GRID + □ NUMERIC LABELS
            // Generate a grid of nodes around the camera based on current zoom
            const cameraAlt = viewer.camera.positionCartographic?.height ?? 1_000_000;
            const gridDensity = cameraAlt < 200_000 ? 0.05 : cameraAlt < 800_000 ? 0.2 : 0.8;
            const gridExtent = cameraAlt < 200_000 ? 0.8 : cameraAlt < 800_000 ? 3 : 10;

            // Use a seeded RNG for stable random values that don't change on re-render
            const seed = (lat: number, lng: number) => {
                const x = Math.sin(lat * 127.1 + lng * 311.7) * 43758.5453;
                return x - Math.floor(x);
            };

            let nodeCount = 0;
            for (let dLat = -gridExtent; dLat <= gridExtent; dLat += gridDensity) {
                for (let dLng = -gridExtent; dLng <= gridExtent; dLng += gridDensity) {
                    const nLat = camLat + dLat;
                    const nLng = camLng + dLng;
                    const r = seed(nLat, nLng);
                    if (r < 0.6) continue; // sparse — only ~40% of grid points
                    const dataVal = (seed(nLat + 1, nLng + 1) * 999).toFixed(2);
                    const nodeId = `ctos-node-${nLat.toFixed(3)}-${nLng.toFixed(3)}`;
                    nodeCount++;
                    entitiesToAdd.push({
                        id: nodeId,
                        position: Cesium.Cartesian3.fromDegrees(nLng, nLat, 0),
                        point: {
                            pixelSize: 4,
                            color: Cesium.Color.CYAN.withAlpha(0.8),
                            outlineColor: Cesium.Color.WHITE.withAlpha(0.3),
                            outlineWidth: 1,
                            disableDepthTestDistance: Number.POSITIVE_INFINITY,
                            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, cameraAlt * 2),
                        },
                        label: {
                            text: `\u25a1 ${dataVal}`,
                            font: '700 10px monospace',
                            fillColor: Cesium.Color.WHITE.withAlpha(0.85),
                            showBackground: true,
                            backgroundColor: Cesium.Color.fromCssColorString('#000000bb'),
                            backgroundPadding: new Cesium.Cartesian2(3, 2),
                            pixelOffset: new Cesium.Cartesian2(10, -8),
                            disableDepthTestDistance: Number.POSITIVE_INFINITY,
                            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, cameraAlt * 1.5),
                        }
                    });
                }
            }

            // 3. CYAN NETWORK WEB — connect nearby nodes
            const allNodePositions: Array<{ lat: number; lng: number }> = [];
            for (let dLat = -gridExtent; dLat <= gridExtent; dLat += gridDensity) {
                for (let dLng = -gridExtent; dLng <= gridExtent; dLng += gridDensity) {
                    const nLat = camLat + dLat;
                    const nLng = camLng + dLng;
                    if (seed(nLat, nLng) >= 0.6) allNodePositions.push({ lat: nLat, lng: nLng });
                }
            }
            // Connect each node to neighbors (limit to nearest 2-3 to avoid overload)
            let webCount = 0;
            for (let i = 0; i < allNodePositions.length && webCount < 400; i++) {
                const a = allNodePositions[i];
                for (let j = i + 1; j < Math.min(i + 4, allNodePositions.length) && webCount < 400; j++) {
                    const b = allNodePositions[j];
                    const dist = Math.hypot(a.lat - b.lat, a.lng - b.lng);
                    if (dist > gridDensity * 2.5) continue;
                    webCount++;
                    entitiesToAdd.push({
                        id: `ctos-web-${i}-${j}`,
                        polyline: {
                            positions: Cesium.Cartesian3.fromDegreesArray([a.lng, a.lat, b.lng, b.lat]),
                            width: 1,
                            material: Cesium.Color.CYAN.withAlpha(0.25),
                        }
                    });
                }
            }

            // 4. ZONE PERIMETERS — red dashed polygons around key city zones
            const zones = [
                {
                    id: 'zone-sf',
                    points: [
                        [-122.52, 37.83], [-122.35, 37.83], [-122.35, 37.72],
                        [-122.52, 37.72], [-122.52, 37.83]
                    ]
                },
                {
                    id: 'zone-oak',
                    points: [
                        [-122.35, 37.86], [-122.19, 37.86], [-122.19, 37.75],
                        [-122.35, 37.75], [-122.35, 37.86]
                    ]
                },
                {
                    id: 'zone-ny',
                    points: [
                        [-74.06, 40.78], [-73.92, 40.78], [-73.92, 40.68],
                        [-74.06, 40.68], [-74.06, 40.78]
                    ]
                },
                {
                    id: 'zone-ldn',
                    points: [
                        [-0.22, 51.56], [0.00, 51.56], [0.00, 51.46],
                        [-0.22, 51.46], [-0.22, 51.56]
                    ]
                },
            ];
            for (const zone of zones) {
                const coords: number[] = [];
                for (const [lng, lat] of zone.points) { coords.push(lng, lat); }
                entitiesToAdd.push({
                    id: `ctos-zone-${zone.id}`,
                    polyline: {
                        positions: Cesium.Cartesian3.fromDegreesArray(coords),
                        width: 2,
                        material: new Cesium.PolylineDashMaterialProperty({
                            color: Cesium.Color.fromCssColorString('#ff3e3e').withAlpha(0.85),
                            dashLength: 16,
                            dashPattern: 255,
                        }),
                        clampToGround: true,
                        arcType: Cesium.ArcType.GEODESIC,
                    }
                });
            }

            // 5. RADAR SCAN LINES — red diagonal lines emanating from zone centers
            const scanCenters = [
                { lat: 37.7749, lng: -122.4194, id: 'sf' },
                { lat: 40.7128, lng: -74.0060, id: 'ny' },
                { lat: 51.5074, lng: -0.1278, id: 'ldn' },
            ];
            const scanAngles = [35, 120, 210, 290]; // degrees
            const scanLen = 2.5; // degrees
            for (const center of scanCenters) {
                for (const angle of scanAngles) {
                    const rad = (angle * Math.PI) / 180;
                    const endLat = center.lat + Math.cos(rad) * scanLen;
                    const endLng = center.lng + Math.sin(rad) * scanLen;
                    entitiesToAdd.push({
                        id: `ctos-scan-${center.id}-${angle}`,
                        polyline: {
                            positions: Cesium.Cartesian3.fromDegreesArray([
                                center.lng, center.lat,
                                endLng, endLat,
                            ]),
                            width: 1.5,
                            material: new Cesium.PolylineDashMaterialProperty({
                                color: Cesium.Color.fromCssColorString('#ff3e3e').withAlpha(0.6),
                                dashLength: 20,
                            }),
                        }
                    });
                }
            }

        } else {
            // Non-ctos regional labels were already handled inline in the AIP section
        }

        _viewer.scene.requestRender();
    }, [layers, visualMode, projectId, onEntitySelect, trackedEntities]);

    // Real-time refresh: flights every 30s, full render every 60s
    useEffect(() => {
        const t = setTimeout(renderLayers, 800);
        return () => clearTimeout(t);
    }, [renderLayers]);

    useEffect(() => {
        const id = setInterval(renderLayers, 1000); // 1Hz refresh is enough for metadata; positions are handled via WebSockets & RAF
        return () => clearInterval(id);
    }, [renderLayers]);

    // Fast flight position updater — re-fetch flights every 30s independently
    useEffect(() => {
        if (!layers['flights']) return;
        const id = setInterval(async () => {
            if (!_viewer || _viewer.isDestroyed()) return;
            try {
                const Cesium = await import('cesium');
                const res = await fetch('https://opensky-network.org/api/states/all');
                if (!res.ok) return;
                const data = await res.json();
                const isCtos = visualMode === 'ctos';
                for (const s of (data.states ?? [])) {
                    const [icao, , , , , lng, lat, altBaro, , , , , , trueTrack] = s;
                    if (!lat || !lng) continue;
                    const ent = _viewer.entities.getById(`fl-${icao}`);
                    if (ent) {
                        ent.position = new Cesium.ConstantPositionProperty(
                            Cesium.Cartesian3.fromDegrees(lng, lat, Math.max(altBaro ?? 8000, 200))
                        ) as any;
                        if (ent.billboard) {
                            (ent.billboard as any).rotation = new Cesium.ConstantProperty(-Cesium.Math.toRadians(trueTrack ?? 0));
                        }
                    }
                }
                _viewer.scene.requestRender();
            } catch { /* silently ignore network errors */ }
        }, 500);
        return () => clearInterval(id);
    }, [layers, visualMode, projectId]);


    // ── Popover continuous position tracker ─────────────────────────────────────
    useEffect(() => {
        if (!selectedEntitySysId || !popoverRenderer || !_viewer) {
            setPopoverPos(null);
            return;
        }

        let frameId: number;
        const updatePos = () => {
            if (_viewer && !_viewer.isDestroyed()) {
                const Cesium = cesiumRef.current;
                if (!Cesium) return;
                const ent = _viewer.entities.getById(selectedEntitySysId);
                if (ent && ent.position) {
                    const pos3d = ent.position.getValue(Cesium.JulianDate.now());
                    if (pos3d) {
                        const pos2d = Cesium.SceneTransforms.wgs84ToWindowCoordinates(_viewer.scene, pos3d);
                        if (pos2d) {
                            setPopoverPos({ x: pos2d.x, y: pos2d.y });
                        } else {
                            setPopoverPos(null);
                        }
                    } else { setPopoverPos(null); }
                } else { setPopoverPos(null); }
            }
            frameId = requestAnimationFrame(updatePos);
        };
        frameId = requestAnimationFrame(updatePos);

        return () => cancelAnimationFrame(frameId);
    }, [selectedEntitySysId, popoverRenderer]);

    const popoverContent = (popoverRenderer && selectedEntitySysId && popoverPos) ? (
        <div
            className="absolute z-50 pointer-events-auto"
            style={{
                left: popoverPos.x, top: popoverPos.y,
                transform: 'translate(-50%, -100%)',
                marginTop: '-24px' // offset above the entity point
            }}
        >
            {popoverRenderer(selectedEntitySysId)}
        </div>
    ) : null;

    return (
        <>
            {_bodyCanvasEl && popoverContent && createPortal(popoverContent, _bodyCanvasEl)}
        </>
    );
};

// ─── Emergency offline TLE fallback ──────────────────────────────────────────
// These are correct format — positions will be approximate but satellites visible
const BUILTIN_TLES = `ISS (ZARYA)
1 25544U 98067A   25058.00000000  .00029053  00000+0  51864-3 0  9999
2 25544  51.6411  20.0000 0003000  80.0000 280.0000 15.50074000000001
HUBBLE
1 20580U 90037B   25058.00000000  .00002038  00000+0  10706-3 0  9999
2 20580  28.4699  20.0000 0001982 285.0000  74.0000 15.09715840000001
TIANGONG
1 48274U 21035A   25058.00000000  .00015697  00000+0  17962-3 0  9999
2 48274  41.4742  10.0000 0005691 345.0000  14.0000 15.62093120000001
NOAA-19
1 33591U 09005A   25058.00000000  .00000217  00000+0  13697-3 0  9999
2 33591  99.1907  10.0000 0013817 152.0000 207.0000 14.12343987000001
TERRA
1 25994U 99068A   25058.00000000  .00000080  00000+0  25217-4 0  9999
2 25994  98.2078  10.0000 0001226  89.0000 270.0000 14.57110012000001
SENTINEL-2A
1 40697U 15028A   25058.00000000  .00000171  00000+0  85697-4 0  9999
2 40697  98.5690  10.0000 0001049  89.5073 270.6240 14.30818138000001
LANDSAT-8
1 39084U 13008A   25058.00000000  .00000073  00000+0  17022-4 0  9999
2 39084  98.2193  10.0000 0001440  99.7053 260.4338 14.57143236000001`;
