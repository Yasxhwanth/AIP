import { PrismaClient } from './generated/prisma';

export type OutboxStatus = 'PENDING' | 'SENT' | 'FAILED' | 'DEAD_LETTER';

const MAX_RETRIES = 5;

export async function dispatchPendingOutboxEvents(prisma: PrismaClient): Promise<void> {
  const pending = await prisma.outboxEvent.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
    take: 50,
  });

  for (const event of pending) {
    try {
      // Placeholder: in the future, route by targetSystem and call external connectors.
      // For now we simply mark the event as SENT to unblock local development.
      await prisma.outboxEvent.update({
        where: { id: event.id },
        data: {
          status: 'SENT',
          retryCount: event.retryCount,
          lastError: null,
        },
      });
    } catch (err) {
      const nextRetry = event.retryCount + 1;
      await prisma.outboxEvent.update({
        where: { id: event.id },
        data: {
          status: nextRetry >= MAX_RETRIES ? 'DEAD_LETTER' : 'FAILED',
          retryCount: nextRetry,
          lastError: String(err),
        },
      });
    }
  }
}

