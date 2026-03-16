import { PrismaClient } from './generated/prisma';
import logger from './logger';
import axios from 'axios';

export interface OutboxConfig {
    pollIntervalMs: number;
    maxRetries: number;
}

export class OutboxService {
    private isRunning = false;
    private timer: NodeJS.Timeout | null = null;
    private config: OutboxConfig;

    constructor(private prisma: PrismaClient, config?: Partial<OutboxConfig>) {
        this.config = {
            pollIntervalMs: config?.pollIntervalMs || 5000,
            maxRetries: config?.maxRetries || 5
        };
    }

    /**
     * Start the background dispatcher loop
     */
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        logger.info('🚀 Outbox Dispatcher started');
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
        logger.info('🛑 Outbox Dispatcher stopped');
    }

    private async poll() {
        if (!this.isRunning) return;

        try {
            await this.processEvents();
        } catch (err) {
            logger.error({ err }, 'Outbox polling error');
        }

        this.timer = setTimeout(() => this.poll(), this.config.pollIntervalMs);
    }

    private async processEvents() {
        // Fetch pending events
        const events = await this.prisma.outboxEvent.findMany({
            where: { status: 'PENDING' },
            take: 10,
            orderBy: { createdAt: 'asc' }
        });

        if (events.length === 0) return;

        logger.debug(`Processing ${events.length} outbox events`);

        for (const event of events) {
            await this.dispatchEvent(event);
        }
    }

    private async dispatchEvent(event: any) {
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
            logger.info({ eventId: event.id }, 'Outbox event sent successfully');

        } catch (err: any) {
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

            logger.warn({
                eventId: event.id,
                retryCount,
                status,
                err: err.message
            }, 'Outbox event dispatch failed');
        }
    }

    private async syncToSap(event: any) {
        logger.info({ eventId: event.id, projectId: event.projectId }, '🔄 Syncing to SAP ERP via S/4HANA OData API (Mock)');
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        // In reality, this would use a dedicated SAP client or direct axios call
        if (event.payload.logicalId?.includes('fail-sap')) throw new Error('SAP Connection Refused: 401 Unauthorized');
    }

    private async syncToCrm(event: any) {
        logger.info({ eventId: event.id, projectId: event.projectId }, '🔄 Syncing to Salesforce CRM via REST API (Mock)');
        await new Promise(resolve => setTimeout(resolve, 600));
        if (event.payload.logicalId?.includes('fail-crm')) throw new Error('Salesforce Limit Exceeded: Daily API Request Limit');
    }

    private async sendWebhook(event: any) {
        const payload = event.payload as any;
        const url = payload.url || process.env.DEFAULT_WEBHOOK_URL;
        const method = payload.method || 'POST';

        if (!url) {
            logger.warn({ eventId: event.id }, '⚠️ Webhook URL missing in payload and no default configured. Skipping.');
            return;
        }

        logger.info({ url, eventId: event.id }, 'Sending outbox webhook');

        await axios({
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
    static async enqueue(tx: any, data: {
        projectId: string;
        aggregateType: string;
        aggregateId: string;
        eventType: string;
        targetSystem: string;
        payload: any;
        domainEventId?: string;
    }) {
        return tx.outboxEvent.create({
            data: {
                ...data,
                status: 'PENDING'
            }
        });
    }
}
