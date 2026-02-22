import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

export const logger = pino({
    level: process.env.LOG_LEVEL ?? (isProduction ? 'info' : 'debug'),
    ...(isProduction
        ? {}
        : {
            transport: {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    translateTime: 'SYS:HH:MM:ss.l',
                    ignore: 'pid,hostname',
                },
            },
        }),
});

/**
 * Create a child logger with correlation ID bound.
 */
export function createRequestLogger(correlationId: string) {
    return logger.child({ correlationId });
}

export default logger;
