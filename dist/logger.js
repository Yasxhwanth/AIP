"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.createRequestLogger = createRequestLogger;
const pino_1 = __importDefault(require("pino"));
const isProduction = process.env.NODE_ENV === 'production';
exports.logger = (0, pino_1.default)({
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
function createRequestLogger(correlationId) {
    return exports.logger.child({ correlationId });
}
exports.default = exports.logger;
//# sourceMappingURL=logger.js.map