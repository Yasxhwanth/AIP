import { PrismaClient } from './generated/prisma';
import logger from './logger';
import { OntologyService } from './ontology-service';

type DroneConfig = {
    logicalId: string;
    callsign: string;
    dockId: string;
    baseLat: number;
    baseLng: number;
    orbitRadiusMeters: number;
};

const DRONES: DroneConfig[] = [
    { logicalId: 'drone-dfr-1', callsign: 'DFR 1', dockId: 'Dock: DFR 1', baseLat: 37.7895, baseLng: -122.3967, orbitRadiusMeters: 100 },
    { logicalId: 'drone-dfr-2', callsign: 'DFR 2', dockId: 'Dock: DFR 2', baseLat: 37.7880, baseLng: -122.4005, orbitRadiusMeters: 150 },
];

function metersToLatLngOffset(latDeg: number, dxMeters: number, dyMeters: number) {
    const earthRadius = 6371000; // meters
    const dLat = dyMeters / earthRadius;
    const dLng = dxMeters / (earthRadius * Math.cos((latDeg * Math.PI) / 180));

    const latOffset = (dLat * 180) / Math.PI;
    const lngOffset = (dLng * 180) / Math.PI;
    return { latOffset, lngOffset };
}

async function ensureProject(prisma: PrismaClient) {
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
        logger.info({ projectId: project.id }, '[DroneSim] Created Maven project');
    }
    return project;
}

async function ensureDroneEntityType(prisma: PrismaClient, projectId: string) {
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
        logger.info({ projectId, entityTypeId: et.id }, '[DroneSim] Created Drone entity type');
    }
    return et;
}

async function seedInitialStates(prisma: PrismaClient, projectId: string, entityTypeId: string, ontologySvc: OntologyService) {
    const now = new Date();

    for (const cfg of DRONES) {
        const { logicalId, callsign, dockId, baseLat, baseLng } = cfg;
        await ontologySvc.recordDomainEventAndApply({
            eventType: 'EntityCreated',
            logicalId,
            entityTypeId,
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
                gimbal: { pitch: 0, roll: 0, yaw: 0 },
                video_url: null,
            },
            projectId,
            actor: 'drone-simulator'
        });
    }
}

export async function startDroneTelemetry(prisma: PrismaClient) {
    if (process.env.ENABLE_DRONE_SIM !== 'true') {
        logger.info('[DroneSim] Skipping drone simulator (ENABLE_DRONE_SIM is not true)');
        return;
    }

    try {
        const project = await ensureProject(prisma);
        const projectId = project.id;
        const et = await ensureDroneEntityType(prisma, projectId);
        const ontologySvc = new OntologyService(prisma);

        await seedInitialStates(prisma, projectId, et.id, ontologySvc);

        const broadcast = (global as any).broadcastEntityChange as
            | ((objectType: string, logicalId: string, data: any, changeType?: 'created' | 'updated' | 'deleted') => void)
            | undefined;

        const start = Date.now();
        logger.info('[DroneSim] Starting in-process 10Hz tactical drone telemetry simulator');

        setInterval(async () => {
            const now = new Date();
            const t = (Date.now() - start) / 1000;

            for (let i = 0; i < DRONES.length; i++) {
                const cfg = DRONES[i];
                // Slower "Roaming" path for street-level scanning (120s period)
                const angle = (t / 120) * 2 * Math.PI + (i * Math.PI / 2);
                const complexAngle = angle + 0.3 * Math.sin(angle * 2.5);

                const dx = Math.sin(complexAngle) * cfg.orbitRadiusMeters * (1 + 0.2 * Math.cos(t / 15));
                const dy = Math.cos(complexAngle) * cfg.orbitRadiusMeters * (1 + 0.2 * Math.sin(t / 10));

                const { latOffset, lngOffset } = metersToLatLngOffset(cfg.baseLat, dx, dy);
                const lat = cfg.baseLat + latOffset;
                const lng = cfg.baseLng + lngOffset;

                // 3-axis gimbal simulation
                const gimbalPitch = -45 + 5 * Math.sin(t * 1.5); // Look down mostly
                const gimbalRoll = 2 * Math.sin(t * 2);       // Slight wind wobble
                const gimbalYaw = (t * 15) % 360;             // Continuous scanning

                const altitudeFt = 150 + 20 * Math.sin(t / 5);
                const speedMph = 35 + 10 * Math.cos(t / 8);
                const headingDeg = (angle * 180) / Math.PI + 90;

                const batteryPct = Math.max(5, 100 - Math.floor(t / 120));
                const status = 'flying';

                const data = {
                    type: 'Drone',
                    callsign: cfg.callsign,
                    label: cfg.callsign,
                    dockId: cfg.dockId,
                    status,
                    battery_pct: batteryPct,
                    location: { lat, lng },
                    position: { lat, lng, alt_ft: altitudeFt },
                    speed_mph: speedMph,
                    heading_deg: headingDeg,
                    gimbal: { pitch: gimbalPitch, roll: gimbalRoll, yaw: gimbalYaw },
                    video_url: null
                };

                /* ALERT GENERATION DISABLED BY USER REQUEST
                if (Math.random() < 0.003) {
                    ...
                }
                */

                await ontologySvc.recordDomainEventAndApply({
                    eventType: 'EntityStateChanged',
                    logicalId: cfg.logicalId,
                    entityTypeId: et.id,
                    data,
                    projectId,
                    actor: 'drone-simulator'
                });

                if (broadcast) {
                    broadcast('Drone', cfg.logicalId, data, 'updated');
                }
            }
        }, 250); // 4Hz \u2014 provides dense sample stream for Hermite degree-3 interpolation; client renders at 60Hz
    } catch (err: any) {
        logger.error({ err }, '[DroneSim] Failed to start drone telemetry simulator');
    }
}

