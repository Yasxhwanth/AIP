'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { ApiClient } from '@/lib/apiClient';

// ─── Public Types ─────────────────────────────────────────────────────────────
export type VisualMode = 'normal' | 'nightvision' | 'flir' | 'crt';

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

// ─── Demo Mode ────────────────────────────────────────────────────────────────
const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
const MOCK_ENTITIES = [
    { logicalId: 'DEMO-001', data: { latitude: 38.8719, longitude: -77.0563, altitude: 100 } },
    { logicalId: 'DEMO-002', data: { latitude: 51.5074, longitude: -0.1278, altitude: 50 } },
    { logicalId: 'DEMO-003', data: { latitude: 35.6762, longitude: 139.6503, altitude: 200 } },
    { logicalId: 'DEMO-004', data: { latitude: 28.6139, longitude: 77.2090, altitude: 300 } },
    { logicalId: 'DEMO-005', data: { latitude: -33.8688, longitude: 151.2093, altitude: 0 } },
    { logicalId: 'DEMO-006', data: { latitude: 48.8566, longitude: 2.3522, altitude: 150 } },
    { logicalId: 'DEMO-007', data: { latitude: 25.2048, longitude: 55.2708, altitude: 80 } },
    { logicalId: 'DEMO-008', data: { latitude: 55.7558, longitude: 37.6173, altitude: 250 } },
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
    layers: Record<string, boolean>;
    visualMode: VisualMode;
    onLayerCountChange?: (id: string, count: number) => void;
    flyToRef?: React.MutableRefObject<((lat: number, lng: number, alt: number) => void) | null>;
    onEntitySelect?: (id: string | null) => void;
    trackedEntities?: string[]; // array of raw IDs to render time trails for
}

// ─── Visual Filters ───────────────────────────────────────────────────────────
const FILTER_MAP: Record<VisualMode, string> = {
    normal: 'none',
    nightvision: 'brightness(0.9) hue-rotate(90deg) saturate(4) contrast(1.4) sepia(0.6)',
    flir: 'brightness(0.7) sepia(1) hue-rotate(180deg) saturate(6) contrast(1.8)',
    crt: 'contrast(1.2) brightness(0.85) saturate(1.3)',
};

// ─── Canvas Icon Builders ─────────────────────────────────────────────────────
let _planeIconUrl: string | null = null;
function getPlaneIconUrl(): string {
    if (_planeIconUrl) return _planeIconUrl;
    const c = document.createElement('canvas');
    c.width = 48; c.height = 48;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, 48, 48);
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#22d3ee';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✈', 24, 26);
    _planeIconUrl = c.toDataURL();
    return _planeIconUrl;
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
let _satRefreshTimer: ReturnType<typeof setInterval> | null = null;
let _renderSeq = 0;

// ─── Component ────────────────────────────────────────────────────────────────
export const BattlefieldOverview: React.FC<Props> = ({
    layers, visualMode, onLayerCountChange, flyToRef, onEntitySelect, trackedEntities = []
}) => {
    const viewerRef = useRef<any>(null);

    // ── Cesium init ───────────────────────────────────────────────────────────
    useEffect(() => {
        if (typeof window === 'undefined') return;

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
            (window as any).CESIUM_BASE_URL = '/cesium/';

            const tok = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;
            const gkey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
            if (tok) Cesium.Ion.defaultAccessToken = tok;

            const osm = new Cesium.UrlTemplateImageryProvider({
                url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                maximumLevel: 19,
                credit: new Cesium.Credit('© OpenStreetMap contributors', false),
            });

            const viewer = new Cesium.Viewer(el, {
                timeline: false, animation: false, baseLayerPicker: false,
                geocoder: false, homeButton: false, navigationHelpButton: false,
                sceneModePicker: false, infoBox: false, selectionIndicator: false,
                baseLayer: new Cesium.ImageryLayer(osm),
                creditContainer: document.createElement('div'),
                requestRenderMode: false,
                shouldAnimate: false, // Keep clock paused — we update positions manually
            });

            // ── Google Photorealistic 3D Tiles ────────────────────────────────
            if (gkey) {
                try {
                    Cesium.GoogleMaps.defaultApiKey = gkey;
                    const tileset = await Cesium.createGooglePhotorealistic3DTileset();
                    viewer.scene.primitives.add(tileset);
                    console.info('[Cesium] Google 3D Tiles loaded ✓');
                } catch (e) {
                    console.warn('[Cesium] Google 3D Tiles unavailable, using OSM fallback:', e);
                }
            }

            // ── Performance settings ───────────────────────────────────────────
            viewer.resolutionScale = 1.0;
            viewer.scene.msaaSamples = 1;
            viewer.scene.globe.maximumScreenSpaceError = 3;
            viewer.scene.globe.tileCacheSize = 50;
            viewer.scene.fog.enabled = false;
            viewer.scene.postProcessStages.fxaa.enabled = false;

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
                        if (onEntitySelect) {
                            setTimeout(() => onEntitySelect(null), 0);
                        }
                        return;
                    }

                    // Clicked SOMETHING
                    const id: string = picked.id.id;

                    // 1. Pass selection to React
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

            window.addEventListener('resize', () => {
                if (!viewer.isDestroyed()) viewer.resize();
            });
        };

        init().catch(err => console.error('[Cesium] init error:', err));
        return () => { /* singleton survives remounts */ };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Apply visual mode filter
    useEffect(() => {
        if (_bodyCanvasEl) _bodyCanvasEl.style.filter = FILTER_MAP[visualMode];
    }, [visualMode]);

    // ── Layer rendering ───────────────────────────────────────────────────────
    const renderLayers = useCallback(async () => {
        const viewer = _viewer;
        if (!viewer || viewer.isDestroyed()) return;

        const seq = ++_renderSeq;
        const Cesium = await import('cesium');
        const satjs = await import('satellite.js');
        if (seq !== _renderSeq) return;

        // 1. Parallel Data Fetching
        const fetchPromises = [];
        const pId = localStorage.getItem('aip_active_project_id') || 'default';

        if (layers['aip']) {
            fetchPromises.push(IS_DEMO ? Promise.resolve(MOCK_ENTITIES) : ApiClient.get<any[]>('/api/v1/ontology/instances/current', { projectId: pId }));
        } else { fetchPromises.push(Promise.resolve([])); }

        if (layers['flights']) {
            fetchPromises.push(fetch('https://opensky-network.org/api/states/all').then(r => r.ok ? r.json() : null).catch(() => null));
        } else { fetchPromises.push(Promise.resolve(null)); }

        if (layers['satellites']) {
            fetchPromises.push(fetch('/api/tle?group=visual').then(r => r.ok ? r.text() : '').catch(() => ''));
        } else { fetchPromises.push(Promise.resolve('')); }

        // Fetch telemetry paths for tracked entities
        if (trackedEntities.length > 0) {
            // For real implementation: fetchPromises.push(ApiClient.post('/api/v1/telemetry/paths', { ids: trackedEntities }));
            // Mocking trails for now since we don't have a telemetry endpoints strictly for this yet
            const mockTrails = trackedEntities.map(id => {
                const ent = MOCK_ENTITIES.find(m => m.logicalId === id) || { data: { latitude: 0, longitude: 0, altitude: 0 } };
                const { latitude: lat, longitude: lng, altitude: alt } = ent.data;
                const pts = [];
                for (let i = 0; i < 10; i++) pts.push({ lat: lat - i * 0.1, lng: lng - i * 0.1, alt: (alt || 0) + i * 1000 });
                return { id, points: pts };
            });
            fetchPromises.push(Promise.resolve(mockTrails));
        } else {
            fetchPromises.push(Promise.resolve([]));
        }

        const [aipRaw, flightsRaw, tleRaw, trailsRaw] = await Promise.all(fetchPromises);
        if (seq !== _renderSeq) return;

        // 2. Data Processing (Synchronous)
        const entitiesToAdd: any[] = [];
        const camCart = viewer.camera.positionCartographic;
        const camLat = Cesium.Math.toDegrees(camCart?.latitude ?? 0);
        const camLng = Cesium.Math.toDegrees(camCart?.longitude ?? 0);
        const now = new Date();

        // ── AIP Processing ────────────────────────────────────────────────────
        if (layers['aip'] && aipRaw) {
            for (const ent of (aipRaw as any[])) {
                const { latitude: lat, longitude: lng, altitude: alt } = ent.data ?? {};
                if (!lat || !lng) continue;
                entitiesToAdd.push({
                    id: `aip-${ent.logicalId}`,
                    position: Cesium.Cartesian3.fromDegrees(lng, lat, alt ?? 0),
                    point: { pixelSize: 10, color: Cesium.Color.CYAN, outlineColor: Cesium.Color.WHITE, outlineWidth: 2, disableDepthTestDistance: Number.POSITIVE_INFINITY },
                    label: { text: ent.logicalId, font: '10px monospace', fillColor: Cesium.Color.WHITE, showBackground: true, backgroundColor: Cesium.Color.fromCssColorString('#0f172a99'), pixelOffset: new Cesium.Cartesian2(0, -20), disableDepthTestDistance: Number.POSITIVE_INFINITY },
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
            const planeUrl = getPlaneIconUrl();
            const sorted = sortByProximity(flights, camLat, camLng).slice(0, 6000);
            for (const f of sorted) {
                entitiesToAdd.push({
                    id: `fl-${f.id}`,
                    position: Cesium.Cartesian3.fromDegrees(f.lng, f.lat, f.alt),
                    billboard: { image: planeUrl, width: 24, height: 24, rotation: -Cesium.Math.toRadians(f.heading), alignedAxis: Cesium.Cartesian3.ZERO, disableDepthTestDistance: Number.POSITIVE_INFINITY, sizeInMeters: false },
                    label: { text: `${f.callsign} · FL${f.fl} · ${f.kts} kts`, font: '10px monospace', fillColor: Cesium.Color.fromCssColorString('#22d3ee'), showBackground: true, backgroundColor: Cesium.Color.fromCssColorString('#00000099'), backgroundPadding: new Cesium.Cartesian2(4, 2), pixelOffset: new Cesium.Cartesian2(0, -28), distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5000000), disableDepthTestDistance: Number.POSITIVE_INFINITY },
                });
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

        // 3. Atomic Map Update
        if (seq !== _renderSeq) return;
        const toRemove = (viewer.entities.values as any[]).filter(e => !String(e.id ?? '').startsWith('__'));
        for (const e of toRemove) viewer.entities.remove(e);
        for (const config of entitiesToAdd) viewer.entities.add(config);

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

        viewer.scene.requestRender();
    }, [layers, onLayerCountChange]);

    useEffect(() => {
        const t = setTimeout(renderLayers, 800);
        return () => clearTimeout(t);
    }, [renderLayers]);

    useEffect(() => {
        const id = setInterval(renderLayers, 90_000);
        return () => clearInterval(id);
    }, [renderLayers]);

    return <></>;
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
