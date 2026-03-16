import { PrismaClient } from './generated/prisma';
export type OutboxStatus = 'PENDING' | 'SENT' | 'FAILED' | 'DEAD_LETTER';
export declare function dispatchPendingOutboxEvents(prisma: PrismaClient): Promise<void>;
//# sourceMappingURL=outbox-dispatcher.d.ts.map