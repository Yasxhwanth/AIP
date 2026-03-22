import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma';
import { OntologyService } from '../ontology-service';

const baseUrl = process.env.DATABASE_URL || '';
const databaseUrl = baseUrl.replace('aip_app:aip_password', 'aip_user:aip_password');
const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const ontologySvc = new OntologyService(prisma);

type DroneConfig = {
    logicalId: string;
    callsign: string;
    dockId: string;
    baseLat: number;
    baseLng: number;
    orbitRadiusMeters: number;
};

// Configurable, but kept here so real integrations can replace this
const DRONES: DroneConfig[] = [
    { logicalId: 'drone-dfr-1', callsign: 'DFR 1', dockId: 'Dock: DFR 1', baseLat: 37.7749, baseLng: -122.4194, orbitRadiusMeters: 800 },
    { logicalId: 'drone-dfr-2', callsign: 'DFR 2', dockId: 'Dock: DFR 2', baseLat: 37.7710, baseLng: -122.4050, orbitRadiusMeters: 1200 },
];

async function getOrCreateMavenProject() {
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
    }
    return project;
}

async function getOrCreateDroneEntityType(projectId: string) {
    let et = await prisma.entityType.findFirst({
        where: {
            projectId,
            name: 'Drone',
            version: 1,
            branchName: 'main'
        }
    });

    if (!et) {
        et = await prisma.entityType.create({
            data: {
                projectId,
                name: 'Drone',
                version: 1,
            }
        });
    }

    return et;
}

function metersToLatLngOffset(latDeg: number, dxMeters: number, dyMeters: number) {
    const earthRadius = 6371000; // meters
    const dLat = dyMeters / earthRadius;
    const dLng = dxMeters / (earthRadius * Math.cos((latDeg * Math.PI) / 180));

    const latOffset = (dLat * 180) / Math.PI;
    const lngOffset = (dLng * 180) / Math.PI;
    return { latOffset, lngOffset };
}

async function seedInitialDrones(projectId: string, entityTypeId: string) {
    const now = new Date();

    for (const drone of DRONES) {
        const { logicalId, callsign, dockId, baseLat, baseLng } = drone;

        await ontologySvc.recordDomainEventAndApply({
            eventType: 'EntityCreated',
            logicalId,
            entityTypeId,
            projectId,
            actor: 'system-mock-stream',
            data: {
                type: 'Drone',
                callsign,
                label: dockId,
                dockId,
                status: 'ready',
                battery_pct: 100,
                location: { lat: baseLat, lng: baseLng },
                position: { lat: baseLat, lng: baseLng, alt_ft: 60 },
                speed_mph: 0,
                heading_deg: 0,
                video_url: null,
            }
        });
    }
}

async function updateLoop(projectId: string, entityTypeId: string) {
    console.log('Starting mock drone telemetry loop for Maven mission...');

    const start = Date.now();
    let tick = 0;

    while (true) {
        tick++;
        const now = new Date();

        for (let i = 0; i < DRONES.length; i++) {
            const cfg = DRONES[i];
            const t = (Date.now() - start) / 1000; // seconds

            // Simple circular orbit around baseLat/baseLng
            const angle = (t / 60) * 2 * Math.PI + (i * Math.PI / 4);
            const dx = Math.cos(angle) * cfg.orbitRadiusMeters;
            const dy = Math.sin(angle) * cfg.orbitRadiusMeters;

            const { latOffset, lngOffset } = metersToLatLngOffset(cfg.baseLat, dx, dy);
            const lat = cfg.baseLat + latOffset;
            const lng = cfg.baseLng + lngOffset;

            const altitudeFt = 80 + 40 * Math.sin(angle * 2);
            const speedMph = 20 + 5 * Math.cos(angle * 1.5);
            const headingDeg = (angle * 180) / Math.PI;

            // Battery drain over ~20 minutes of flight
            const batteryPct = Math.max(5, 100 - Math.floor(t / 12));
            const status = batteryPct > 25 ? 'flying' : batteryPct > 10 ? 'rtb' : 'charging';

            // Simulated gimbal "look around" (independent of flight heading)
            const gimbalYaw = (Math.sin(t / 5) * 45); // Sweeping 45 degrees left/right
            const gimbalPitch = -30 + (Math.cos(t / 7) * 20); // Looking between -10 and -50 deg

            await ontologySvc.recordDomainEventAndApply({
                eventType: 'EntityStateChanged',
                logicalId: cfg.logicalId,
                entityTypeId,
                projectId,
                actor: 'system-mock-stream',
                data: {
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
                    gimbal_yaw: gimbalYaw,
                    gimbal_pitch: gimbalPitch,
                    video_url: null,
                }
            });
        }

        // Update every 500ms for "silky smooth" experience
        await new Promise((resolve) => setTimeout(resolve, 500));
    }
}

async function main() {
    const project = await getOrCreateMavenProject();
    const droneType = await getOrCreateDroneEntityType(project.id);
    await seedInitialDrones(project.id, droneType.id);
    await updateLoop(project.id, droneType.id);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
