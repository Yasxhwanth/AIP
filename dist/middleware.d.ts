import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { PrismaClient } from './generated/prisma';
import logger from './logger';
export interface AuthContext {
    apiKeyId: string;
    apiKeyName: string;
    role: string;
    projectId?: string | null;
}
declare global {
    namespace Express {
        interface Request {
            correlationId: string;
            auth?: AuthContext | undefined;
            log: ReturnType<typeof logger.child>;
        }
    }
}
export declare function correlationId(): (req: Request, res: Response, next: NextFunction) => void;
export declare function requestLogger(): (req: Request, res: Response, next: NextFunction) => void;
export declare function hashApiKey(rawKey: string): string;
export declare function generateJwt(payload: AuthContext): string;
export declare function apiKeyAuth(prisma: PrismaClient): (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare function requireRole(...roles: string[]): (req: Request, res: Response, next: NextFunction) => void;
export declare function createRateLimiter(windowMs?: number, max?: number): import("express-rate-limit").RateLimitRequestHandler;
export declare function validate(schema: ZodSchema): (req: Request, res: Response, next: NextFunction) => void;
export declare function errorHandler(): (err: Error, req: Request, res: Response, _next: NextFunction) => void;
//# sourceMappingURL=middleware.d.ts.map