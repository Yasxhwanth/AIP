'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { ApiClient } from '@/lib/apiClient';

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
        let threatPos: { lat: number, lng: number } | null = null;
        let unitPos: { lat: number, lng: number } | null = null;

        if (layers['aip'] && aipRaw) {
            const isCtos = visualMode === 'ctos';
            for (const ent of (aipRaw as any[])) {
                const { latitude, longitude, location, type, model, callsign, vehicle } = ent.data ?? {};
                const lat = location?.lat ?? latitude;
                const lng = location?.lng ?? longitude;
                if (!lat || !lng) continue;

                let color = Cesium.Color.CYAN;
                let isThreat = ent.logicalId.startsWith('threat');
                let isUnit = ent.logicalId.startsWith('unit');
                let isAsset = ent.logicalId.startsWith('asset');

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

                entitiesToAdd.push({
                    id: `aip-${ent.logicalId}`,
                    position: Cesium.Cartesian3.fromDegrees(lng, lat, 0),
                    point: isCtos ? {
                        pixelSize: 8,
                        color: Cesium.Color.WHITE,
                        outlineColor: color.withAlpha(0.6),
                        outlineWidth: 2,
                        disableDepthTestDistance: Number.POSITIVE_INFINITY
                    } : { pixelSize: 12, color, outlineColor: Cesium.Color.WHITE, outlineWidth: 2, disableDepthTestDistance: Number.POSITIVE_INFINITY },
                    label: {
                        text: isCtos ? `${displayName.toUpperCase()}\nNODE ${ent.logicalId.substring(0, 6)} [${(Math.random() * 999).toFixed(2)}]` : displayName,
                        font: isCtos ? '900 10px monospace' : '12px monospace',
                        fillColor: isCtos ? Cesium.Color.WHITE : Cesium.Color.WHITE,
                        showBackground: true,
                        backgroundColor: Cesium.Color.fromCssColorString(isCtos ? '#000000cc' : '#0f172a99'),
                        backgroundPadding: new Cesium.Cartesian2(4, 2),
                        pixelOffset: new Cesium.Cartesian2(0, -25),
                        disableDepthTestDistance: Number.POSITIVE_INFINITY
                    },
                });

                // Add radii
                if (isAsset && ent.logicalId.includes('drone')) {
                    entitiesToAdd.push({
                        id: `radius-${ent.logicalId}`,
                        position: Cesium.Cartesian3.fromDegrees(lng, lat, 0),
                        ellipse: {
                            semiMinorAxis: 15000,
                            semiMajorAxis: 15000,
                            material: Cesium.Color.fromCssColorString('#3b82f6').withAlpha(0.15),
                            outline: true,
                            outlineColor: Cesium.Color.fromCssColorString('#3b82f6').withAlpha(0.8)
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
            }

            // ── Network Web (ctOS Special) ──────────────────────────────────
            if (isCtos) {
                const nodes = (aipRaw as any[]).map(ent => {
                    const { latitude, longitude, location } = ent.data ?? {};
                    return { lat: location?.lat ?? latitude, lng: location?.lng ?? longitude };
                }).filter(n => n.lat && n.lng);

                for (let i = 0; i < nodes.length; i++) {
                    for (let j = i + 1; j < Math.min(i + 5, nodes.length); j++) { // Connect to next few nodes
                        entitiesToAdd.push({
                            id: `net-web-${i}-${j}`,
                            polyline: {
                                positions: Cesium.Cartesian3.fromDegreesArray([nodes[i].lng, nodes[i].lat, nodes[j].lng, nodes[j].lat]),
                                width: 1,
                                material: Cesium.Color.CYAN.withAlpha(0.15)
                            }
                        });
                    }
                }
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

        viewer.scene.requestRender();
    }, [layers, onLayerCountChange, visualMode]);

    // Real-time refresh: flights every 30s, full render every 60s
    useEffect(() => {
        const t = setTimeout(renderLayers, 800);
        return () => clearTimeout(t);
    }, [renderLayers]);

    useEffect(() => {
        const id = setInterval(renderLayers, 60_000); // full refresh every 60s
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
        }, 30_000);
        return () => clearInterval(id);
    }, [layers, visualMode]);


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
