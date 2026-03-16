import { Request, Response, NextFunction } from 'express';
import { createHash, randomUUID } from 'crypto';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { ZodSchema, ZodError } from 'zod';
import { PrismaClient } from './generated/prisma';
import logger from './logger';
import { tenantStorage } from './tenant-context';
import { AbacEngine } from './abac-engine';

// ── Types ────────────────────────────────────────────────────────

export interface AuthContext {
    apiKeyId: string;
    apiKeyName: string;
    role: string;
    projectId?: string | null; // Tenant isolation
}

// Extend Express Request
declare global {
    namespace Express {
        interface Request {
            correlationId: string;
            auth?: AuthContext | undefined;
            log: ReturnType<typeof logger.child>;
        }
    }
}

// ── Correlation ID ───────────────────────────────────────────────

export function correlationId() {
    return (req: Request, res: Response, next: NextFunction): void => {
        const id = (req.headers['x-correlation-id'] as string) ?? randomUUID();
        req.correlationId = id;
        req.log = logger.child({ correlationId: id });
        res.setHeader('X-Correlation-Id', id);
        next();
    };
}

// ── Request Logger ───────────────────────────────────────────────

export function requestLogger() {
    return (req: Request, res: Response, next: NextFunction): void => {
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

export function hashApiKey(rawKey: string): string {
    return createHash('sha256').update(rawKey).digest('hex');
}

export function generateJwt(payload: AuthContext): string {
    return jwt.sign(payload, JWT_SECRET as string, { expiresIn: '24h' });
}

const AUTH_SKIP_PATHS = new Set([
    '/api/v1/health',
    '/api/v1/health/deep',
    '/api/v1/auth/token',
    '/telemetry',
    '/health',
]);

export function apiKeyAuth(prisma: PrismaClient) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        // Skip auth for health checks and auth endpoints
        if (AUTH_SKIP_PATHS.has(req.path)) {
            next();
            return;
        }

        if (!AUTH_REQUIRED && process.env.NODE_ENV !== 'production') {
            // ONLY explicitly allowed when BOTH AUTH_REQUIRED=false AND not in production
            req.auth = { apiKeyId: 'dev', apiKeyName: 'dev-mode', role: 'ADMIN', projectId: (global as any).DEFAULT_PROJECT_ID };
            next();
            return;
        }

        // Check for API key header
        const rawKey = req.headers['x-api-key'] as string;
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
                const decoded = jwt.verify(token, JWT_SECRET as string) as unknown as AuthContext;

                if (!decoded.projectId && req.path !== '/projects' && req.method !== 'POST') {
                    res.status(401).json({ error: 'Token is missing tenant context (projectId)' });
                    return;
                }

                req.auth = decoded;
                next();
            } catch {
                res.status(401).json({ error: 'Invalid or expired token' });
            }
            return;
        }

        res.status(401).json({ error: 'Authentication required. Provide X-API-Key or Bearer token.' });
    };
}

// ── Tenant Context ───────────────────────────────────────────────

export function tenantContext() {
    return (req: Request, _res: Response, next: NextFunction): void => {
        const projectId = req.auth?.projectId;
        if (projectId) {
            tenantStorage.run({ projectId }, () => next());
        } else {
            next();
        }
    };
}

// ── Security Guard (ABAC) ────────────────────────────────────────

export function securityGuard(abac: AbacEngine) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        if (!req.auth) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        // Simple resource inference for demonstration
        let resourceType = '*';
        const path = req.path;
        if (path.includes('/entity-types')) resourceType = 'EntityType';
        if (path.includes('/change-requests')) resourceType = 'ChangeRequest';
        if (path.includes('/pipelines')) resourceType = 'Pipeline';
        if (path.includes('/data-sources')) resourceType = 'DataSource';

        const actionMapping: Record<string, string> = {
            'GET': 'READ',
            'POST': 'WRITE',
            'PUT': 'WRITE',
            'PATCH': 'WRITE',
            'DELETE': 'DELETE'
        };
        const action = actionMapping[req.method] || 'READ';

        try {
            const result = await abac.evaluate(req.auth as any, action, {
                type: resourceType,
                id: req.params.id as string,
                attributes: req.body
            });

            if (!result.allowed) {
                res.status(403).json({
                    error: 'Forbidden: ABAC Policy Denial',
                    reason: result.reason,
                    correlationId: req.correlationId
                });
                return;
            }

            next();
        } catch (err) {
            req.log.error({ err }, 'ABAC evaluation failed');
            next();
        }
    };
}

// ── Role Guard ───────────────────────────────────────────────────

export function requireRole(...roles: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
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

export function createRateLimiter(windowMs = 60_000, max = 100) {
    return rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        validate: {
            ip: false
        },
        keyGenerator: (req: Request) => {
            return req.auth?.apiKeyId ?? 'anonymous';
        },
        handler: (_req: Request, res: Response) => {
            res.status(429).json({
                error: 'Rate limit exceeded',
                retryAfter: Math.ceil(windowMs / 1000),
            });
        },
    });
}

// ── Zod Validation ───────────────────────────────────────────────

// ── Zod Validation ───────────────────────────────────────────────

export function validate(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    error: 'Validation failed',
                    details: error.issues.map((e: any) => ({
                        field: e.path.join('.'),
                        message: e.message,
                    })),
                });
            } else {
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
export function enforceIdempotency(prisma: PrismaClient) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const idempotencyKey = req.headers['x-idempotency-key'] as string | undefined;

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
                    projectId: req.auth?.projectId || 'system',
                }
            });
            next();
        } catch (error: any) {
            if (error?.code === 'P2002') {
                res.status(409).json({
                    error: 'Conflict: This request has already been processed (duplicate X-Idempotency-Key)',
                    idempotencyKey
                });
            } else {
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
export function auditMiddleware(prisma: PrismaClient) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const mutations = new Set(['POST', 'PUT', 'DELETE', 'PATCH']);
        if (!mutations.has(req.method)) {
            return next();
        }

        console.log(`[AuditMiddleware] Intercepted ${req.method} ${req.path}`);

        res.on('finish', async () => {
            // We want to log successes and specific security denials (403).
            // Skip 404s, 400s, etc. to avoid noise, but keep 403 and 500.
            const shouldLog = res.statusCode === 200 || res.statusCode === 201 || res.statusCode === 403 || res.statusCode === 500;
            if (!shouldLog) return;

            const status = res.statusCode >= 400 ? (res.statusCode === 403 ? 'DENIED' : 'FAILED') : 'SUCCESS';

            try {
                const log = await (prisma as any).auditLog.create({
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
            } catch (err: any) {
                console.error(`[AuditMiddleware] Failed to write audit log: ${err.message}`);
                logger.error({ err }, 'Failed to write global audit log');
            }
        });

        next();
    };
}

// ── Error Handler ────────────────────────────────────────────────

export function errorHandler() {
    return (err: Error, req: Request, res: Response, _next: NextFunction): void => {
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
