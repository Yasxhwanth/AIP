"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const prisma_1 = require("../generated/prisma");
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new prisma_1.PrismaClient({ adapter });
async function main() {
    console.log('🖥️ Starting Military Dashboard Seed...');
    const project = await prisma.project.findFirst({
        where: { name: 'Military Operations' }
    });
    if (!project)
        throw new Error("Military Operations project not found. Run seed-military-demo.ts first.");
    // Check if the Actions exist
    const actionTaskDrone = await prisma.actionDefinition.findUnique({ where: { name: 'Task MQ-9 Drone' } });
    const actionJamming = await prisma.actionDefinition.findUnique({ where: { name: 'Initiate Jamming & Ground Assault' } });
    let dashboard = await prisma.dashboard.findFirst({
        where: { projectId: project.id, name: 'UAS Drone Fleet Dashboard' }
    });
    if (!dashboard) {
        dashboard = await prisma.dashboard.create({
            data: {
                projectId: project.id,
                name: 'UAS Drone Fleet Dashboard'
            }
        });
        console.log(`Created Dashboard: ${dashboard.name}`);
    }
    else {
        console.log(`Resetting widgets for Dashboard: ${dashboard.name}`);
        await prisma.dashboardWidget.deleteMany({
            where: { dashboardId: dashboard.id }
        });
    }
    const widgets = [
        {
            dashboardId: dashboard.id,
            type: 'Map',
            x: 0, y: 0, w: 12, h: 4,
            configData: { title: 'Global Operational Map' }
        },
        {
            dashboardId: dashboard.id,
            type: 'CopilotChat',
            x: 0, y: 4, w: 4, h: 3,
            configData: {}
        },
        {
            dashboardId: dashboard.id,
            type: 'ObjectTable',
            x: 4, y: 4, w: 8, h: 2,
            configData: {
                name: 'Active Threat Targets',
                boundVariable: 'Threat'
            }
        }
    ];
    if (actionTaskDrone) {
        widgets.push({
            dashboardId: dashboard.id,
            type: 'ActionButton',
            x: 4, y: 6, w: 4, h: 1,
            configData: {
                actionId: actionTaskDrone.id,
                label: 'EXECUTE: Task MQ-9 Reaper'
            }
        });
    }
    if (actionJamming) {
        widgets.push({
            dashboardId: dashboard.id,
            type: 'ActionButton',
            x: 8, y: 6, w: 4, h: 1,
            configData: {
                actionId: actionJamming.id,
                label: 'EXECUTE: Initiate Jamming & Ground Assault'
            }
        });
    }
    for (const widget of widgets) {
        await prisma.dashboardWidget.create({
            data: widget
        });
    }
    console.log(`✅ Fully seeded UAS Drone Fleet Dashboard with ${widgets.length} Widgets!`);
}
main()
    .catch(e => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-military-dashboards.js.map