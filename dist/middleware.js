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
exports.tenantContext = tenantContext;
exports.requireRole = requireRole;
exports.createRateLimiter = createRateLimiter;
exports.validate = validate;
exports.enforceIdempotency = enforceIdempotency;
exports.auditMiddleware = auditMiddleware;
exports.errorHandler = errorHandler;
const crypto_1 = require("crypto");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const logger_1 = __importDefault(require("./logger"));
const tenant_context_1 = require("./tenant-context");
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
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('CRITICAL: JWT_SECRET environment variable is missing.');
    process.exit(1);
}
// Auth: Secure by default. Must explicitly turn off if running local unit tests.
const AUTH_REQUIRED = process.env.AUTH_REQUIRED !== 'false';
function hashApiKey(rawKey) {
    return (0, crypto_1.createHash)('sha256').update(rawKey).digest('hex');
}
function generateJwt(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}
const AUTH_SKIP_PATHS = new Set([
    '/api/v1/health',
    '/api/v1/health/deep',
    '/api/v1/auth/token',
    '/telemetry',
    '/health',
]);
function apiKeyAuth(prisma) {
    return async (req, res, next) => {
        // Skip auth for health checks and auth endpoints
        if (AUTH_SKIP_PATHS.has(req.path)) {
            next();
            return;
        }
        if (!AUTH_REQUIRED && process.env.NODE_ENV !== 'production') {
            // ONLY explicitly allowed when BOTH AUTH_REQUIRED=false AND not in production
            req.auth = { apiKeyId: 'dev', apiKeyName: 'dev-mode', role: 'ADMIN', projectId: global.DEFAULT_PROJECT_ID };
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
            if (!apiKey.projectId && req.path !== '/projects' && req.method !== 'POST') {
                // Allow project creation without a projectId, otherwise require it
                res.status(401).json({ error: 'API key is not associated with a project' });
                return;
            }
            // Update last used
            await prisma.apiKey.update({
                where: { id: apiKey.id },
                data: { lastUsedAt: new Date() },
            });
            req.auth = {
                apiKeyId: apiKey.id,
                apiKeyName: apiKey.name,
                role: apiKey.role,
                projectId: apiKey.projectId
            };
            next();
            return;
        }
        if (authHeader?.startsWith('Bearer ')) {
            try {
                const token = authHeader.slice(7);
                const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                if (!decoded.projectId && req.path !== '/projects' && req.method !== 'POST') {
                    res.status(401).json({ error: 'Token is missing tenant context (projectId)' });
                    return;
                }
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
// ── Tenant Context ───────────────────────────────────────────────
function tenantContext() {
    return (req, _res, next) => {
        const projectId = req.auth?.projectId;
        if (projectId) {
            tenant_context_1.tenantStorage.run({ projectId }, () => next());
        }
        else {
            next();
        }
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
        validate: {
            ip: false
        },
        keyGenerator: (req) => {
            return req.auth?.apiKeyId ?? 'anonymous';
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
// ── Idempotency Middleware ───────────────────────────────────────
/**
 * Ensures that a request with a given X-Idempotency-Key header is only processed once.
 * Creates a stub DomainEvent to hold the idempotency key lock.
 */
function enforceIdempotency(prisma) {
    return async (req, res, next) => {
        const idempotencyKey = req.headers['x-idempotency-key'];
        if (!idempotencyKey) {
            // If they don't provide a key, let the downstream handler deal with it (or ignore)
            return next();
        }
        try {
            await prisma.domainEvent.create({
                data: {
                    idempotencyKey,
                    eventType: 'IdempotencyLock',
                    entityTypeId: 'System',
                    logicalId: 'System',
                    entityVersion: 1,
                    payload: { path: req.path, method: req.method },
                }
            });
            next();
        }
        catch (error) {
            if (error?.code === 'P2002') {
                res.status(409).json({
                    error: 'Conflict: This request has already been processed (duplicate X-Idempotency-Key)',
                    idempotencyKey
                });
            }
            else {
                next(error);
            }
        }
    };
}
// ── Audit Middleware ───────────────────────────────────────────────
/**
 * Automatically logs all mutating API calls (POST, PUT, DELETE, PATCH)
 * for security and compliance.
 */
function auditMiddleware(prisma) {
    return (req, res, next) => {
        const mutations = new Set(['POST', 'PUT', 'DELETE', 'PATCH']);
        if (!mutations.has(req.method)) {
            return next();
        }
        console.log(`[AuditMiddleware] Intercepted ${req.method} ${req.path}`);
        res.on('finish', async () => {
            // We want to log successes and specific security denials (403).
            // Skip 404s, 400s, etc. to avoid noise, but keep 403 and 500.
            const shouldLog = res.statusCode === 200 || res.statusCode === 201 || res.statusCode === 403 || res.statusCode === 500;
            if (!shouldLog)
                return;
            const status = res.statusCode >= 400 ? (res.statusCode === 403 ? 'DENIED' : 'FAILED') : 'SUCCESS';
            try {
                const log = await prisma.auditLog.create({
                    data: {
                        actor: req.auth?.apiKeyName || 'anonymous',
                        actorRole: req.auth?.role || 'user',
                        action: `API_${req.method}_${req.path.split('/').filter(Boolean).join('_').toUpperCase()}`,
                        resourceType: 'API_ENDPOINT',
                        resourceId: req.path,
                        status: status,
                        metadata: {
                            ip: req.ip,
                            correlationId: req.correlationId,
                            method: req.method,
                            statusCode: res.statusCode,
                            body: req.method !== 'GET' ? req.body : undefined
                        },
                        projectId: req.auth?.projectId
                    }
                });
                console.log(`[AuditMiddleware] AuditLog created: ${log.id} [${status}]`);
            }
            catch (err) {
                console.error(`[AuditMiddleware] Failed to write audit log: ${err.message}`);
                logger_1.default.error({ err }, 'Failed to write global audit log');
            }
        });
        next();
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