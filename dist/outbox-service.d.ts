import { PrismaClient } from './generated/prisma';
export interface OutboxConfig {
    pollIntervalMs: number;
    maxRetries: number;
}
export declare class OutboxService {
    private prisma;
    private isRunning;
    private timer;
    private config;
    constructor(prisma: PrismaClient, config?: Partial<OutboxConfig>);
    /**
     * Start the background dispatcher loop
     */
    start(): void;
    /**
     * Stop the background dispatcher loop
     */
    stop(): void;
    private poll;
    private processEvents;
    private dispatchEvent;
    private syncToSap;
    private syncToCrm;
    private sendWebhook;
    /**
     * Helper to create an outbox event atomically.
     * Should be called within a transaction that modifies the ontology.
     */
    static enqueue(tx: any, data: {
        projectId: string;
        aggregateType: string;
        aggregateId: string;
        eventType: string;
        targetSystem: string;
        payload: any;
        domainEventId?: string;
    }): Promise<any>;
}
//# sourceMappingURL=outbox-service.d.ts.map