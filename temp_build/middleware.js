"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _a;
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
var crypto_1 = require("crypto");
var express_rate_limit_1 = require("express-rate-limit");
var jsonwebtoken_1 = require("jsonwebtoken");
var zod_1 = require("zod");
var logger_1 = require("./logger");
// ── Correlation ID ───────────────────────────────────────────────
function correlationId() {
    return function (req, res, next) {
        var _a;
        var id = (_a = req.headers['x-correlation-id']) !== null && _a !== void 0 ? _a : (0, crypto_1.randomUUID)();
        req.correlationId = id;
        req.log = logger_1.default.child({ correlationId: id });
        res.setHeader('X-Correlation-Id', id);
        next();
    };
}
// ── Request Logger ───────────────────────────────────────────────
function requestLogger() {
    return function (req, res, next) {
        var start = Date.now();
        res.on('finish', function () {
            var duration = Date.now() - start;
            var level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
            req.log[level](__assign({ method: req.method, path: req.path, statusCode: res.statusCode, duration: "".concat(duration, "ms"), userAgent: req.headers['user-agent'], ip: req.ip }, (req.auth ? { apiKey: req.auth.apiKeyName, role: req.auth.role } : {})), "".concat(req.method, " ").concat(req.path, " \u2192 ").concat(res.statusCode, " (").concat(duration, "ms)"));
        });
        next();
    };
}
// ── API Key Auth ─────────────────────────────────────────────────
var JWT_SECRET = (_a = process.env.JWT_SECRET) !== null && _a !== void 0 ? _a : 'c3-aip-dev-secret-change-in-production';
// Auth: Secure by default. Must explicitly turn off if running local unit tests.
var AUTH_REQUIRED = process.env.AUTH_REQUIRED !== 'false';
function hashApiKey(rawKey) {
    return (0, crypto_1.createHash)('sha256').update(rawKey).digest('hex');
}
function generateJwt(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}
var AUTH_SKIP_PATHS = new Set([
    '/api/v1/health',
    '/api/v1/health/deep',
    '/api/v1/auth/token',
    '/telemetry',
    '/health',
]);
function apiKeyAuth(prisma) {
    var _this = this;
    return function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
        var rawKey, authHeader, keyHash, apiKey, token, decoded;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Skip auth for health checks, auth endpoints, and ontology builder API (dev)
                    if (AUTH_SKIP_PATHS.has(req.path) || req.path.startsWith('/api/ontology/')) {
                        next();
                        return [2 /*return*/];
                    }
                    if (!AUTH_REQUIRED && process.env.NODE_ENV !== 'production') {
                        // ONLY explicitly allowed when BOTH AUTH_REQUIRED=false AND not in production
                        req.auth = { apiKeyId: 'dev', apiKeyName: 'dev-mode', role: 'ADMIN', projectId: global.DEFAULT_PROJECT_ID };
                        next();
                        return [2 /*return*/];
                    }
                    rawKey = req.headers['x-api-key'];
                    authHeader = req.headers.authorization;
                    if (!rawKey) return [3 /*break*/, 3];
                    keyHash = hashApiKey(rawKey);
                    return [4 /*yield*/, prisma.apiKey.findUnique({ where: { keyHash: keyHash } })];
                case 1:
                    apiKey = _a.sent();
                    if (!apiKey || !apiKey.enabled) {
                        res.status(401).json({ error: 'Invalid or disabled API key' });
                        return [2 /*return*/];
                    }
                    // Update last used
                    return [4 /*yield*/, prisma.apiKey.update({
                            where: { id: apiKey.id },
                            data: { lastUsedAt: new Date() },
                        })];
                case 2:
                    // Update last used
                    _a.sent();
                    req.auth = {
                        apiKeyId: apiKey.id,
                        apiKeyName: apiKey.name,
                        role: apiKey.role,
                        projectId: apiKey.projectId
                    };
                    next();
                    return [2 /*return*/];
                case 3:
                    if (authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer ')) {
                        try {
                            token = authHeader.slice(7);
                            decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                            req.auth = decoded;
                            next();
                        }
                        catch (_b) {
                            res.status(401).json({ error: 'Invalid or expired token' });
                        }
                        return [2 /*return*/];
                    }
                    res.status(401).json({ error: 'Authentication required. Provide X-API-Key or Bearer token.' });
                    return [2 /*return*/];
            }
        });
    }); };
}
// ── Role Guard ───────────────────────────────────────────────────
function requireRole() {
    var roles = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        roles[_i] = arguments[_i];
    }
    return function (req, res, next) {
        if (!req.auth) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        if (!roles.includes(req.auth.role)) {
            res.status(403).json({ error: "Requires role: ".concat(roles.join(' or ')) });
            return;
        }
        next();
    };
}
// ── Rate Limiter ─────────────────────────────────────────────────
function createRateLimiter(windowMs, max) {
    if (windowMs === void 0) { windowMs = 60000; }
    if (max === void 0) { max = 100; }
    return (0, express_rate_limit_1.default)({
        windowMs: windowMs,
        max: max,
        standardHeaders: true,
        legacyHeaders: false,
        validate: {
            ip: false
        },
        keyGenerator: function (req) {
            var _a, _b;
            return (_b = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.apiKeyId) !== null && _b !== void 0 ? _b : 'anonymous';
        },
        handler: function (_req, res) {
            res.status(429).json({
                error: 'Rate limit exceeded',
                retryAfter: Math.ceil(windowMs / 1000),
            });
        },
    });
}
// ── Zod Validation ───────────────────────────────────────────────
function validate(schema) {
    return function (req, res, next) {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                res.status(400).json({
                    error: 'Validation failed',
                    details: error.issues.map(function (e) { return ({
                        field: e.path.join('.'),
                        message: e.message,
                    }); }),
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
    return function (err, req, res, _next) {
        var _a, _b;
        var correlationId = (_a = req.correlationId) !== null && _a !== void 0 ? _a : 'unknown';
        (_b = req.log) === null || _b === void 0 ? void 0 : _b.error({ err: err, correlationId: correlationId }, 'Unhandled error');
        var isProduction = process.env.NODE_ENV === 'production';
        res.status(500).json(__assign({ error: 'Internal server error', correlationId: correlationId }, (isProduction ? {} : { message: err.message, stack: err.stack })));
    };
}
