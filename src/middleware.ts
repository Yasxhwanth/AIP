import { Request, Response, NextFunction } from 'express';
import { createHash, randomUUID } from 'crypto';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { ZodSchema, ZodError } from 'zod';
import { PrismaClient } from './generated/prisma/client';
import logger from './logger';

// ── Types ────────────────────────────────────────────────────────

export interface AuthContext {
    apiKeyId: string;
    apiKeyName: string;
    role: string;
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

const JWT_SECRET = process.env.JWT_SECRET ?? 'c3-aip-dev-secret-change-in-production';
const AUTH_REQUIRED = process.env.AUTH_REQUIRED !== 'false'; // default: true

export function hashApiKey(rawKey: string): string {
    return createHash('sha256').update(rawKey).digest('hex');
}

export function generateJwt(payload: AuthContext): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function apiKeyAuth(prisma: PrismaClient) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        // Skip auth for health checks and auth endpoints
        if (req.path === '/api/v1/health' || req.path === '/api/v1/health/deep' || req.path === '/api/v1/auth/token') {
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

            // Update last used
            await prisma.apiKey.update({
                where: { id: apiKey.id },
                data: { lastUsedAt: new Date() },
            });

            req.auth = { apiKeyId: apiKey.id, apiKeyName: apiKey.name, role: apiKey.role };
            next();
        } else if (authHeader?.startsWith('Bearer ')) {
            try {
                const token = authHeader.slice(7);
                const decoded = jwt.verify(token, JWT_SECRET) as AuthContext;
                req.auth = decoded;
                next();
            } catch {
                res.status(401).json({ error: 'Invalid or expired token' });
            }
        } else {
            res.status(401).json({ error: 'Authentication required. Provide X-API-Key or Bearer token.' });
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
        keyGenerator: (req: Request) => {
            return req.auth?.apiKeyId ?? req.ip ?? 'anonymous';
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
