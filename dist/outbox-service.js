"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutboxService = void 0;
const logger_1 = __importDefault(require("./logger"));
const axios_1 = __importDefault(require("axios"));
class OutboxService {
    constructor(prisma, config) {
        this.prisma = prisma;
        this.isRunning = false;
        this.timer = null;
        this.config = {
            pollIntervalMs: config?.pollIntervalMs || 5000,
            maxRetries: config?.maxRetries || 5
        };
    }
    /**
     * Start the background dispatcher loop
     */
    start() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        logger_1.default.info('🚀 Outbox Dispatcher started');
        this.poll();
    }
    /**
     * Stop the background dispatcher loop
     */
    stop() {
        this.isRunning = false;
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        logger_1.default.info('🛑 Outbox Dispatcher stopped');
    }
    async poll() {
        if (!this.isRunning)
            return;
        try {
            await this.processEvents();
        }
        catch (err) {
            logger_1.default.error({ err }, 'Outbox polling error');
        }
        this.timer = setTimeout(() => this.poll(), this.config.pollIntervalMs);
    }
    async processEvents() {
        // Fetch pending events
        const events = await this.prisma.outboxEvent.findMany({
            where: { status: 'PENDING' },
            take: 10,
            orderBy: { createdAt: 'asc' }
        });
        if (events.length === 0)
            return;
        logger_1.default.debug(`Processing ${events.length} outbox events`);
        for (const event of events) {
            await this.dispatchEvent(event);
        }
    }
    async dispatchEvent(event) {
        try {
            // Update status to PROCESSING to avoid double-processing (basic lock)
            // In a multi-worker setup, we would use a more robust locking mechanism
            await this.prisma.outboxEvent.update({
                where: { id: event.id },
                data: { status: 'PROCESSING' }
            });
            // Route to connector based on target system
            switch (event.targetSystem) {
                case 'WEBHOOK':
                    await this.sendWebhook(event);
                    break;
                case 'ERP_SAP':
                    await this.syncToSap(event);
                    break;
                case 'CRM_SALESFORCE':
                    await this.syncToCrm(event);
                    break;
                default:
                    throw new Error(`Unsupported target system: ${event.targetSystem}`);
            }
            // Mark as sent
            await this.prisma.outboxEvent.update({
                where: { id: event.id },
                data: { status: 'SENT' }
            });
            logger_1.default.info({ eventId: event.id }, 'Outbox event sent successfully');
        }
        catch (err) {
            const retryCount = event.retryCount + 1;
            const status = retryCount >= this.config.maxRetries ? 'DEAD_LETTER' : 'PENDING';
            await this.prisma.outboxEvent.update({
                where: { id: event.id },
                data: {
                    status,
                    retryCount,
                    lastError: err.message || String(err),
                    updatedAt: new Date()
                }
            });
            logger_1.default.warn({
                eventId: event.id,
                retryCount,
                status,
                err: err.message
            }, 'Outbox event dispatch failed');
        }
    }
    async syncToSap(event) {
        logger_1.default.info({ eventId: event.id, projectId: event.projectId }, '🔄 Syncing to SAP ERP via S/4HANA OData API (Mock)');
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        // In reality, this would use a dedicated SAP client or direct axios call
        if (event.payload.logicalId?.includes('fail-sap'))
            throw new Error('SAP Connection Refused: 401 Unauthorized');
    }
    async syncToCrm(event) {
        logger_1.default.info({ eventId: event.id, projectId: event.projectId }, '🔄 Syncing to Salesforce CRM via REST API (Mock)');
        await new Promise(resolve => setTimeout(resolve, 600));
        if (event.payload.logicalId?.includes('fail-crm'))
            throw new Error('Salesforce Limit Exceeded: Daily API Request Limit');
    }
    async sendWebhook(event) {
        const payload = event.payload;
        const url = payload.url || process.env.DEFAULT_WEBHOOK_URL;
        const method = payload.method || 'POST';
        if (!url) {
            logger_1.default.warn({ eventId: event.id }, '⚠️ Webhook URL missing in payload and no default configured. Skipping.');
            return;
        }
        logger_1.default.info({ url, eventId: event.id }, 'Sending outbox webhook');
        await (0, axios_1.default)({
            method,
            url,
            data: event.payload,
            timeout: 10000,
            headers: {
                'X-AIP-Event-Id': event.id,
                'X-AIP-Project-Id': event.projectId,
                'Content-Type': 'application/json'
            }
        });
    }
    /**
     * Helper to create an outbox event atomically.
     * Should be called within a transaction that modifies the ontology.
     */
    static async enqueue(tx, data) {
        return tx.outboxEvent.create({
            data: {
                ...data,
                status: 'PENDING'
            }
        });
    }
}
exports.OutboxService = OutboxService;
//# sourceMappingURL=outbox-service.js.map