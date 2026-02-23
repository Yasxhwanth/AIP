"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.correlationId = correlationId;
exports.requestLogger = requestLogger;
exports.hashApiKey = hashApiKey;
exports.generateJwt = generateJwt;
exports.apiKeyAuth = apiKeyAuth;
exports.requireRole = requireRole;
exports.createRateLimiter = createRateLimiter;
exports.validate = validate;
exports.errorHandler = errorHandler;
const crypto_1 = require("crypto");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const logger_1 = __importDefault(require("./logger"));
// ── Correlation ID ───────────────────────────────────────────────
function correlationId() {
    return (req, res, next) => {
        const id = req.headers['x-correlation-id'] ?? (0, crypto_1.randomUUID)();
        req.correlationId = id;
        req.log = logger_1.default.child({ correlationId: id });
        res.setHeader('X-Correlation-Id', id);
        next();
    };
}
// ── Request Logger ───────────────────────────────────────────────
function requestLogger() {
    return (req, res, next) => {
        const start = Date.now();
        res.on('finish', () => {
            const duration = Date.now() - start;
            const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
            req.log[level]({
                method: req.method,
                path: req.path,
                statusCode: res.statusCode,
                duration: `${duration}ms`,
                userAgent: req.headers['user-agent'],
                ip: req.ip,
                ...(req.auth ? { apiKey: req.auth.apiKeyName, role: req.auth.role } : {}),
            }, `${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`);
        });
        next();
    };
}
// ── API Key Auth ─────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET ?? 'c3-aip-dev-secret-change-in-production';
const AUTH_REQUIRED = false; // Forced false for local testing
function hashApiKey(rawKey) {
    return (0, crypto_1.createHash)('sha256').update(rawKey).digest('hex');
}
function generateJwt(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}
function apiKeyAuth(prisma) {
    return async (req, res, next) => {
        // Skip auth for health checks and auth endpoints
        if (req.path === '/api/v1/health' || req.path === '/api/v1/health/deep' || req.path === '/api/v1/auth/token' || req.path === '/telemetry') {
            next();
            return;
        }
        if (!AUTH_REQUIRED) {
            // Dev mode: attach a mock admin context
            req.auth = { apiKeyId: 'dev', apiKeyName: 'dev-mode', role: 'ADMIN' };
            next();
            return;
        }
        // Check for API key header
        const rawKey = req.headers['x-api-key'];
        // Check for Bearer token
        const authHeader = req.headers.authorization;
        if (rawKey) {
            const keyHash = hashApiKey(rawKey);
            const apiKey = await prisma.apiKey.findUnique({ where: { keyHash } });
            if (!apiKey || !apiKey.enabled) {
                res.status(401).json({ error: 'Invalid or disabled API key' });
                return;
            }
            // Update last used
            await prisma.apiKey.update({
                where: { id: apiKey.id },
                data: { lastUsedAt: new Date() },
            });
            req.auth = { apiKeyId: apiKey.id, apiKeyName: apiKey.name, role: apiKey.role };
            next();
            return;
        }
        if (authHeader?.startsWith('Bearer ')) {
            try {
                const token = authHeader.slice(7);
                const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                req.auth = decoded;
                next();
            }
            catch {
                res.status(401).json({ error: 'Invalid or expired token' });
            }
            return;
        }
        res.status(401).json({ error: 'Authentication required. Provide X-API-Key or Bearer token.' });
    };
}
// ── Role Guard ───────────────────────────────────────────────────
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.auth) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        if (!roles.includes(req.auth.role)) {
            res.status(403).json({ error: `Requires role: ${roles.join(' or ')}` });
            return;
        }
        next();
    };
}
// ── Rate Limiter ─────────────────────────────────────────────────
function createRateLimiter(windowMs = 60000, max = 100) {
    return (0, express_rate_limit_1.default)({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => {
            return req.auth?.apiKeyId ?? req.ip ?? 'anonymous';
        },
        handler: (_req, res) => {
            res.status(429).json({
                error: 'Rate limit exceeded',
                retryAfter: Math.ceil(windowMs / 1000),
            });
        },
    });
}
// ── Zod Validation ───────────────────────────────────────────────
function validate(schema) {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                res.status(400).json({
                    error: 'Validation failed',
                    details: error.issues.map((e) => ({
                        field: e.path.join('.'),
                        message: e.message,
                    })),
                });
            }
            else {
                next(error);
            }
        }
    };
}
// ── Error Handler ────────────────────────────────────────────────
function errorHandler() {
    return (err, req, res, _next) => {
        const correlationId = req.correlationId ?? 'unknown';
        req.log?.error({ err, correlationId }, 'Unhandled error');
        const isProduction = process.env.NODE_ENV === 'production';
        res.status(500).json({
            error: 'Internal server error',
            correlationId,
            ...(isProduction ? {} : { message: err.message, stack: err.stack }),
        });
    };
}
//# sourceMappingURL=middleware.js.map