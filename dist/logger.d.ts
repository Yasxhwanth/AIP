import pino from 'pino';
export declare const logger: pino.Logger<never, boolean>;
/**
 * Create a child logger with correlation ID bound.
 */
export declare function createRequestLogger(correlationId: string): pino.Logger<never, boolean>;
export default logger;
//# sourceMappingURL=logger.d.ts.map