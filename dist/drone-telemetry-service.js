"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startDroneTelemetry = startDroneTelemetry;
const logger_1 = __importDefault(require("./logger"));
const DRONES = [
    { logicalId: 'drone-dfr-1', callsign: 'DFR 1', dockId: 'Dock: DFR 1', baseLat: 37.7749, baseLng: -122.4194, orbitRadiusMeters: 600 },
    { logicalId: 'drone-dfr-2', callsign: 'DFR 2', dockId: 'Dock: DFR 2', baseLat: 37.7790, baseLng: -122.4313, orbitRadiusMeters: 450 },
    { logicalId: 'drone-dfr-3', callsign: 'DFR 3', dockId: 'Dock: DFR 3', baseLat: 37.7680, baseLng: -122.4080, orbitRadiusMeters: 500 },
    { logicalId: 'drone-dfr-4', callsign: 'DFR 4', dockId: 'Dock: DFR 4', baseLat: 37.7640, baseLng: -122.3950, orbitRadiusMeters: 700 },
    { logicalId: 'drone-dfr-5', callsign: 'DFR 5', dockId: 'Dock: DFR 5', baseLat: 37.7710, baseLng: -122.4050, orbitRadiusMeters: 550 },
];
function metersToLatLngOffset(latDeg, dxMeters, dyMeters) {
    const earthRadius = 6371000; // meters
    const dLat = dyMeters / earthRadius;
    const dLng = dxMeters / (earthRadius * Math.cos((latDeg * Math.PI) / 180));
    const latOffset = (dLat * 180) / Math.PI;
    const lngOffset = (dLng * 180) / Math.PI;
    return { latOffset, lngOffset };
}
async function ensureProject(prisma) {
    let project = await prisma.project.findFirst({
        where: { name: 'Global Logistics & Readiness' }
    });
    if (!project) {
        project = await prisma.project.create({
            data: {
                name: 'Global Logistics & Readiness',
                description: 'Autonomous mission command for global supply chain resilience and drone operations.'
            }
        });
        logger_1.default.info({ projectId: project.id }, '[DroneSim] Created Maven project');
    }
    return project;
}
async function ensureDroneEntityType(prisma, projectId) {
    let et = await prisma.entityType.findFirst({
        where: { projectId, name: 'Drone', version: 1, branchName: 'main' }
    });
    if (!et) {
        et = await prisma.entityType.create({
            data: {
                projectId,
                name: 'Drone',
                version: 1,
            }
        });
        logger_1.default.info({ projectId, entityTypeId: et.id }, '[DroneSim] Created Drone entity type');
    }
    return et;
}
async function seedInitialStates(prisma, projectId, entityTypeId) {
    const now = new Date();
    for (const cfg of DRONES) {
        const { logicalId, callsign, dockId, baseLat, baseLng } = cfg;
        await prisma.currentEntityState.upsert({
            where: { logicalId },
            update: {
                projectId,
                updatedAt: now,
                data: {
                    type: 'Drone',
                    callsign,
                    label: dockId,
                    dockId,
                    status: 'ready',
                    battery_pct: 100,
                    location: { lat: baseLat, lng: baseLng },
                    position: { lat: baseLat, lng: baseLng, alt_ft: 80 },
                    speed_mph: 0,
                    heading_deg: 0,
                    video_url: null,
                }
            },
            create: {
                logicalId,
                entityTypeId,
                projectId,
                updatedAt: now,
                data: {
                    type: 'Drone',
                    callsign,
                    label: dockId,
                    dockId,
                    status: 'ready',
                    battery_pct: 100,
                    location: { lat: baseLat, lng: baseLng },
                    position: { lat: baseLat, lng: baseLng, alt_ft: 80 },
                    speed_mph: 0,
                    heading_deg: 0,
                    video_url: null,
                }
            }
        });
    }
}
async function startDroneTelemetry(prisma) {
    if (process.env.ENABLE_DRONE_SIM !== 'true') {
        logger_1.default.info('[DroneSim] Skipping drone simulator (ENABLE_DRONE_SIM is not true)');
        return;
    }
    try {
        const project = await ensureProject(prisma);
        const projectId = project.id;
        const et = await ensureDroneEntityType(prisma, projectId);
        await seedInitialStates(prisma, projectId, et.id);
        const broadcast = global.broadcastEntityChange;
        const start = Date.now();
        logger_1.default.info('[DroneSim] Starting in-process drone telemetry simulator');
        setInterval(async () => {
            const now = new Date();
            const t = (Date.now() - start) / 1000;
            for (let i = 0; i < DRONES.length; i++) {
                const cfg = DRONES[i];
                const angle = (t / 60) * 2 * Math.PI + (i * Math.PI / 4);
                const dx = Math.sin(angle) * cfg.orbitRadiusMeters;
                const dy = Math.cos(angle) * cfg.orbitRadiusMeters;
                const { latOffset, lngOffset } = metersToLatLngOffset(cfg.baseLat, dx, dy);
                const lat = cfg.baseLat + latOffset;
                const lng = cfg.baseLng + lngOffset;
                const altitudeFt = 100 + 40 * Math.sin(angle * 2);
                const speedMph = 22 + 6 * Math.cos(angle * 1.7);
                const headingDeg = (angle * 180) / Math.PI;
                const flightMinutes = t / 60;
                const batteryPct = Math.max(5, 100 - Math.floor(flightMinutes * 5)); // simple drain rate
                const status = batteryPct > 25 ? 'flying' : batteryPct > 10 ? 'rtb' : 'charging';
                const data = {
                    type: 'Drone',
                    callsign: cfg.callsign,
                    label: cfg.dockId,
                    dockId: cfg.dockId,
                    status,
                    battery_pct: batteryPct,
                    location: { lat, lng },
                    position: { lat, lng, alt_ft: altitudeFt },
                    speed_mph: speedMph,
                    heading_deg: headingDeg,
                    video_url: null
                };
                await prisma.currentEntityState.upsert({
                    where: { logicalId: cfg.logicalId },
                    update: {
                        projectId,
                        updatedAt: now,
                        data
                    },
                    create: {
                        logicalId: cfg.logicalId,
                        entityTypeId: et.id,
                        projectId,
                        updatedAt: now,
                        data
                    }
                });
                if (broadcast) {
                    broadcast('Drone', cfg.logicalId, data, 'updated');
                }
            }
        }, 1000);
    }
    catch (err) {
        logger_1.default.error({ err }, '[DroneSim] Failed to start drone telemetry simulator');
    }
}
//# sourceMappingURL=drone-telemetry-service.js.map