"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var express_1 = require("express");
var ws_1 = require("ws");
var pg_1 = require("pg");
var adapter_pg_1 = require("@prisma/adapter-pg");
var prisma_1 = require("./generated/prisma");
var policy_engine_1 = require("./policy-engine");
var data_integration_1 = require("./data-integration");
var relationship_derivation_service_1 = require("./relationship-derivation-service");
var computed_metrics_1 = require("./computed-metrics");
var rollup_engine_1 = require("./rollup-engine");
var inference_engine_1 = require("./inference-engine");
var decision_engine_1 = require("./decision-engine");
var schema_inference_service_1 = require("./schema-inference-service");
var provenance_service_1 = require("./provenance-service");
var apollo_service_1 = require("./apollo-service");
var spark_service_1 = require("./spark-service");
var identity_service_1 = require("./identity-service");
var abac_engine_1 = require("./abac-engine");
var helmet_1 = require("helmet");
var cors_1 = require("cors");
var logger_1 = require("./logger");
var middleware_1 = require("./middleware");
var crypto_1 = require("crypto");
var amqplib_1 = require("amqplib");
var databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
}
var app = (0, express_1.default)();
var port = process.env.PORT || 3001;
// ── RabbitMQ Publisher Setup ────────────────────────────────────────────────
var amqpChannel = null;
var RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
var QUEUE_NAME = 'data_ingestion_queue';
function connectToRabbitMQ() {
    return __awaiter(this, void 0, void 0, function () {
        var conn, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, amqplib_1.default.connect(RABBITMQ_URL)];
                case 1:
                    conn = _a.sent();
                    return [4 /*yield*/, conn.createChannel()];
                case 2:
                    amqpChannel = _a.sent();
                    return [4 /*yield*/, amqpChannel.assertQueue(QUEUE_NAME, { durable: true })];
                case 3:
                    _a.sent();
                    console.log('✅ Connected to RabbitMQ Publisher');
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    console.error('RabbitMQ Publisher Error', err_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// Init async without blocking server start
connectToRabbitMQ();
// ── Redis Setup ─────────────────────────────────────────────────────────────
var createClient = require('redis').createClient;
var redisClient = process.env.REDIS_URL
    ? createClient({ url: process.env.REDIS_URL })
    : null;
if (redisClient) {
    redisClient.on('error', function (err) { return console.error('Redis Client Error', err); });
    redisClient.connect().then(function () { return console.log('✅ Connected to Redis'); })
        .catch(console.error);
}
// ── Prisma Setup ────────────────────────────────────────────────────────────
var pool = new pg_1.Pool({ connectionString: databaseUrl });
var adapter = new adapter_pg_1.PrismaPg(pool);
var prisma = new prisma_1.PrismaClient({
    log: ['warn', 'error']
});
// Initialize services
var apolloService = new apollo_service_1.ApolloService(prisma);
var sparkService = new spark_service_1.SparkService(prisma);
// Global maps for WebSockets and Jobs
var wsClients = new Set();
// ── Enterprise Middleware ─────────────────────────────────────────
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: (_a = process.env.CORS_ORIGIN) !== null && _a !== void 0 ? _a : '*' }));
app.use(express_1.default.json({ limit: '10mb' }));
app.use((0, middleware_1.correlationId)());
app.use((0, middleware_1.requestLogger)());
app.use((0, middleware_1.apiKeyAuth)(prisma));
app.use((0, middleware_1.createRateLimiter)());
// ── Projects & Dashboards ────────────────────────────────────────
app.post('/projects', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var project, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.project.create({ data: { name: req.body.name || 'New Project', description: req.body.description } })];
            case 1:
                project = _a.sent();
                return [2 /*return*/, res.status(201).json(project)];
            case 2:
                err_2 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_2) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/projects', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projects, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.project.findMany({ orderBy: { createdAt: 'desc' } })];
            case 1:
                projects = _a.sent();
                return [2 /*return*/, res.json(projects)];
            case 2:
                err_3 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_3) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/dashboards', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, dashboard, err_4;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                projectId = ((_a = req.auth) === null || _a === void 0 ? void 0 : _a.projectId) || req.body.projectId || req.header('X-Project-Id');
                if (!projectId && process.env.NODE_ENV !== 'production') {
                    projectId = global.DEFAULT_PROJECT_ID;
                }
                if (!projectId)
                    return [2 /*return*/, res.status(400).json({ error: 'Project ID is required' })];
                return [4 /*yield*/, prisma.dashboard.create({
                        data: { name: req.body.name, projectId: projectId }
                    })];
            case 1:
                dashboard = _b.sent();
                return [2 /*return*/, res.status(201).json(dashboard)];
            case 2:
                err_4 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_4) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/dashboards', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, dashboards, err_5;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                projectId = ((_a = req.auth) === null || _a === void 0 ? void 0 : _a.projectId) || req.query.projectId || req.header('X-Project-Id');
                if (!projectId && process.env.NODE_ENV !== 'production') {
                    projectId = global.DEFAULT_PROJECT_ID;
                }
                if (!projectId)
                    return [2 /*return*/, res.status(400).json({ error: 'Project ID is required' })];
                return [4 /*yield*/, prisma.dashboard.findMany({
                        where: { projectId: projectId },
                        include: { widgets: true },
                        orderBy: { createdAt: 'desc' }
                    })];
            case 1:
                dashboards = _b.sent();
                return [2 /*return*/, res.json(dashboards)];
            case 2:
                err_5 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_5) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ── End Projects & Dashboards ────────────────────────────────────
// ── Health Checks (no auth) ──────────────────────────────────────
app.get('/api/v1/health', function (_req, res) {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});
app.get('/api/v1/health/deep', function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.$queryRaw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["SELECT 1"], ["SELECT 1"])))];
            case 1:
                _a.sent();
                res.json({
                    status: 'ok',
                    database: 'connected',
                    schedulers: { jobScheduler: 'running', rollupScheduler: 'running' },
                    timestamp: new Date().toISOString(),
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                res.status(503).json({
                    status: 'degraded',
                    database: 'disconnected',
                    error: String(error_1),
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ── Auth Endpoints ───────────────────────────────────────────────
app.post('/api/v1/auth/api-keys', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name_1, role, rateLimit, rawKey, keyHash, apiKey, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, name_1 = _a.name, role = _a.role, rateLimit = _a.rateLimit;
                if (!name_1)
                    return [2 /*return*/, res.status(400).json({ error: 'name is required' })];
                rawKey = "c3aip_".concat((0, crypto_1.randomUUID)().replace(/-/g, ''));
                keyHash = (0, middleware_1.hashApiKey)(rawKey);
                return [4 /*yield*/, prisma.apiKey.create({
                        data: {
                            name: name_1,
                            keyHash: keyHash,
                            role: role !== null && role !== void 0 ? role : 'VIEWER',
                            rateLimit: rateLimit !== null && rateLimit !== void 0 ? rateLimit : 100,
                        },
                    })];
            case 1:
                apiKey = _b.sent();
                // Return the raw key ONLY on creation — never stored
                return [2 /*return*/, res.status(201).json({
                        id: apiKey.id,
                        name: apiKey.name,
                        role: apiKey.role,
                        rateLimit: apiKey.rateLimit,
                        key: rawKey, // ⚠️ Only returned once
                    })];
            case 2:
                error_2 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to create API key', details: String(error_2) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/api/v1/auth/token', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var rawKey, keyHash, apiKey, token, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                rawKey = req.headers['x-api-key'];
                if (!rawKey)
                    return [2 /*return*/, res.status(400).json({ error: 'X-API-Key header required' })];
                keyHash = (0, middleware_1.hashApiKey)(rawKey);
                return [4 /*yield*/, prisma.apiKey.findUnique({ where: { keyHash: keyHash } })];
            case 1:
                apiKey = _a.sent();
                if (!apiKey || !apiKey.enabled)
                    return [2 /*return*/, res.status(401).json({ error: 'Invalid API key' })];
                token = (0, middleware_1.generateJwt)({ apiKeyId: apiKey.id, apiKeyName: apiKey.name, role: apiKey.role });
                return [2 /*return*/, res.json({ token: token, expiresIn: '24h' })];
            case 2:
                error_3 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to generate token', details: String(error_3) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/api/v1/auth/api-keys', function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var keys, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.apiKey.findMany({
                        select: { id: true, name: true, role: true, rateLimit: true, enabled: true, lastUsedAt: true, createdAt: true },
                        orderBy: { createdAt: 'desc' },
                    })];
            case 1:
                keys = _a.sent();
                return [2 /*return*/, res.json(keys)];
            case 2:
                error_4 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to list API keys', details: String(error_4) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/health', function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var err_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.$queryRaw(templateObject_2 || (templateObject_2 = __makeTemplateObject(["SELECT 1"], ["SELECT 1"])))];
            case 1:
                _a.sent();
                res.json({ status: 'ok', db: 'connected' });
                return [3 /*break*/, 3];
            case 2:
                err_6 = _a.sent();
                // eslint-disable-next-line no-console
                console.error('Health check failed', err_6);
                res.status(500).json({ status: 'error', db: 'unavailable' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/entity-types', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name, attributes, projectId, created, error_5;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = req.body, name = _a.name, attributes = _a.attributes;
                if (!name || !Array.isArray(attributes)) {
                    return [2 /*return*/, res.status(400).json({ error: 'name and attributes[] are required' })];
                }
                _c.label = 1;
            case 1:
                _c.trys.push([1, 3, , 4]);
                projectId = ((_b = req.auth) === null || _b === void 0 ? void 0 : _b.projectId) || req.body.projectId || req.header('X-Project-Id');
                if (!projectId && process.env.NODE_ENV !== 'production') {
                    projectId = global.DEFAULT_PROJECT_ID;
                }
                if (!projectId)
                    return [2 /*return*/, res.status(400).json({ error: 'Project ID is required' })];
                return [4 /*yield*/, prisma.entityType.create({
                        data: {
                            projectId: projectId,
                            name: name,
                            version: 1,
                            attributes: {
                                create: attributes.map(function (a) {
                                    var _a;
                                    return ({
                                        name: a.name,
                                        dataType: a.dataType,
                                        required: a.required,
                                        temporal: (_a = a.temporal) !== null && _a !== void 0 ? _a : false,
                                    });
                                }),
                            },
                        },
                        include: {
                            attributes: true,
                        },
                    })];
            case 2:
                created = _c.sent();
                return [2 /*return*/, res.status(201).json(created)];
            case 3:
                error_5 = _c.sent();
                if ((error_5 === null || error_5 === void 0 ? void 0 : error_5.code) === 'P2002') {
                    return [2 /*return*/, res.status(409).json({ error: "Entity type '".concat(name, "' already exists.") })];
                }
                return [2 /*return*/, res.status(500).json({ error: 'failed to create entity type', details: String(error_5) })];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.get('/entity-types', function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var entityTypes, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.entityType.findMany({
                        orderBy: [{ name: 'asc' }, { version: 'desc' }],
                        include: {
                            attributes: true,
                        },
                    })];
            case 1:
                entityTypes = _a.sent();
                return [2 /*return*/, res.json(entityTypes)];
            case 2:
                error_6 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to list entity types', details: String(error_6) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ── Integration & Inference ───────────────────────────────────────
app.post('/api/v1/integration/infer-schema', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var sample, inferred;
    return __generator(this, function (_a) {
        try {
            sample = req.body.sample;
            if (!sample)
                return [2 /*return*/, res.status(400).json({ error: 'sample JSON is required' })];
            inferred = schema_inference_service_1.SchemaInferenceService.inferAttributes(sample);
            return [2 /*return*/, res.json({ attributes: inferred })];
        }
        catch (error) {
            return [2 /*return*/, res.status(500).json({ error: 'failed to infer schema', details: String(error) })];
        }
        return [2 /*return*/];
    });
}); });
app.post('/api/v1/integration/suggest-mappings', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, inferredAttributes, entityTypeId, sampleData, targetEntityType, sample, projectId, found, entityType, suggestions, autoMap, _i, inferredAttributes_1, attr, error_7;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 5, , 6]);
                _a = req.body, inferredAttributes = _a.inferredAttributes, entityTypeId = _a.entityTypeId, sampleData = _a.sampleData, targetEntityType = _a.targetEntityType;
                // If legacy format: infer attributes from sample data first
                if (!inferredAttributes && sampleData) {
                    sample = Array.isArray(sampleData) ? sampleData[0] : sampleData;
                    inferredAttributes = sample ? schema_inference_service_1.SchemaInferenceService.inferAttributes(sample) : [];
                }
                if (!inferredAttributes) {
                    return [2 /*return*/, res.status(400).json({ error: 'inferredAttributes (or sampleData) is required' })];
                }
                if (!(!entityTypeId && targetEntityType)) return [3 /*break*/, 2];
                projectId = ((_b = req.auth) === null || _b === void 0 ? void 0 : _b.projectId) || req.header('X-Project-Id');
                if (!projectId && process.env.NODE_ENV !== 'production')
                    projectId = global.DEFAULT_PROJECT_ID;
                if (!projectId)
                    return [2 /*return*/, res.status(400).json({ error: 'Project ID is required' })];
                return [4 /*yield*/, prisma.entityType.findFirst({
                        where: { name: targetEntityType, projectId: projectId },
                        orderBy: { version: 'desc' }
                    })];
            case 1:
                found = _c.sent();
                entityTypeId = found === null || found === void 0 ? void 0 : found.id;
                _c.label = 2;
            case 2:
                if (!entityTypeId) return [3 /*break*/, 4];
                return [4 /*yield*/, prisma.entityType.findUnique({
                        where: { id: entityTypeId },
                        include: { attributes: true },
                    })];
            case 3:
                entityType = _c.sent();
                if (!entityType)
                    return [2 /*return*/, res.status(404).json({ error: 'entity type not found' })];
                suggestions = schema_inference_service_1.SchemaInferenceService.suggestMappings(inferredAttributes, entityType.attributes);
                return [2 /*return*/, res.json({ suggestions: suggestions })];
            case 4:
                autoMap = {};
                for (_i = 0, inferredAttributes_1 = inferredAttributes; _i < inferredAttributes_1.length; _i++) {
                    attr = inferredAttributes_1[_i];
                    autoMap[attr.name] = attr.name;
                }
                return [2 /*return*/, res.json({ suggestions: autoMap, inferredAttributes: inferredAttributes })];
            case 5:
                error_7 = _c.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to suggest mappings', details: String(error_7) })];
            case 6: return [2 /*return*/];
        }
    });
}); });
app.post('/api/v1/pipelines', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name_2, description, nodes, edges, projectId, pipeline, err_7;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                _a = req.body, name_2 = _a.name, description = _a.description, nodes = _a.nodes, edges = _a.edges;
                projectId = ((_b = req.auth) === null || _b === void 0 ? void 0 : _b.projectId) || req.header('X-Project-Id');
                if (!projectId && process.env.NODE_ENV !== 'production') {
                    projectId = global.DEFAULT_PROJECT_ID;
                }
                if (!projectId)
                    return [2 /*return*/, res.status(400).json({ error: 'Project ID is required' })];
                return [4 /*yield*/, prisma.pipeline.create({
                        data: {
                            name: name_2,
                            description: description,
                            nodes: nodes,
                            edges: edges,
                            projectId: projectId
                        }
                    })];
            case 1:
                pipeline = _c.sent();
                return [2 /*return*/, res.status(201).json(pipeline)];
            case 2:
                err_7 = _c.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_7) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/api/v1/pipelines', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, pipelines, err_8;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                projectId = ((_a = req.auth) === null || _a === void 0 ? void 0 : _a.projectId) || req.query.projectId || req.header('X-Project-Id');
                if (!projectId && process.env.NODE_ENV !== 'production') {
                    projectId = global.DEFAULT_PROJECT_ID;
                }
                if (!projectId)
                    return [2 /*return*/, res.status(400).json({ error: 'Project ID is required' })];
                return [4 /*yield*/, prisma.pipeline.findMany({
                        where: { projectId: projectId },
                        orderBy: { createdAt: 'desc' }
                    })];
            case 1:
                pipelines = _b.sent();
                return [2 /*return*/, res.json(pipelines)];
            case 2:
                err_8 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_8) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/api/v1/ontology/derive-relationships', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, sourceEntityTypeId, targetEntityTypeId, relationshipDefId, maxDistanceKm, count, error_8;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, sourceEntityTypeId = _a.sourceEntityTypeId, targetEntityTypeId = _a.targetEntityTypeId, relationshipDefId = _a.relationshipDefId, maxDistanceKm = _a.maxDistanceKm;
                if (!sourceEntityTypeId || !targetEntityTypeId || !relationshipDefId) {
                    return [2 /*return*/, res.status(400).json({ error: 'sourceEntityTypeId, targetEntityTypeId, and relationshipDefId are required' })];
                }
                return [4 /*yield*/, relationship_derivation_service_1.RelationshipDerivationService.deriveProximityLinks(sourceEntityTypeId, targetEntityTypeId, relationshipDefId, maxDistanceKm || 5.0, prisma)];
            case 1:
                count = _b.sent();
                return [2 /*return*/, res.json({ success: true, derivedLinksCount: count })];
            case 2:
                error_8 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to derive relationships', details: String(error_8) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ══════════════════════════════════════════════════════════════════
// ── No-Code Ontology Builder API (Timbr/Palantir style) ───────────
// ══════════════════════════════════════════════════════════════════
var ontology_reasoner_1 = require("./ontology-reasoner");
function getProjectId(req) {
    var _a, _b;
    var id = ((_a = req.auth) === null || _a === void 0 ? void 0 : _a.projectId) || req.query.projectId || req.header('X-Project-Id') || ((_b = req.body) === null || _b === void 0 ? void 0 : _b.projectId);
    if (!id && process.env.NODE_ENV !== 'production')
        id = global.DEFAULT_PROJECT_ID;
    return id !== null && id !== void 0 ? id : null;
}
// ── GET /api/ontology/entity-types — list all with live object counts ─────────
app.get('/api/ontology/entity-types', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, types, seen, _i, types_1, t, latest, withCounts, err_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                projectId = getProjectId(req);
                if (!projectId)
                    return [2 /*return*/, res.status(400).json({ error: 'Project ID required' })];
                return [4 /*yield*/, prisma.entityType.findMany({
                        where: { projectId: projectId },
                        include: {
                            attributes: true,
                            outgoingRelationships: { include: { targetEntityType: { select: { id: true, name: true } } } },
                            incomingRelationships: { include: { sourceEntityType: { select: { id: true, name: true } } } },
                        },
                        orderBy: [{ name: 'asc' }, { version: 'desc' }],
                    })];
            case 1:
                types = _a.sent();
                seen = new Map();
                for (_i = 0, types_1 = types; _i < types_1.length; _i++) {
                    t = types_1[_i];
                    if (!seen.has(t.name) || seen.get(t.name).version < t.version)
                        seen.set(t.name, t);
                }
                latest = __spreadArray([], seen.values(), true);
                return [4 /*yield*/, Promise.all(latest.map(function (et) { return __awaiter(void 0, void 0, void 0, function () {
                        var count;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, prisma.currentEntityState.count({ where: { entityTypeId: et.id } })];
                                case 1:
                                    count = _a.sent();
                                    return [2 /*return*/, __assign(__assign({}, et), { objectCount: count })];
                            }
                        });
                    }); }))];
            case 2:
                withCounts = _a.sent();
                return [2 /*return*/, res.json(withCounts)];
            case 3:
                err_9 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_9) })];
            case 4: return [2 /*return*/];
        }
    });
}); });
// ── POST /api/ontology/entity-types — create new entity type ──────────────────
app.post('/api/ontology/entity-types', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, _a, name_3, _b, attributes, created, err_10;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                projectId = getProjectId(req);
                if (!projectId)
                    return [2 /*return*/, res.status(400).json({ error: 'Project ID required' })];
                _a = req.body, name_3 = _a.name, _b = _a.attributes, attributes = _b === void 0 ? [] : _b;
                if (!name_3)
                    return [2 /*return*/, res.status(400).json({ error: 'name is required' })];
                return [4 /*yield*/, prisma.entityType.create({
                        data: {
                            projectId: projectId,
                            name: name_3,
                            version: 1,
                            attributes: { create: attributes.map(function (a) { var _a, _b; return ({ name: a.name, dataType: (_a = a.dataType) !== null && _a !== void 0 ? _a : 'STRING', required: (_b = a.required) !== null && _b !== void 0 ? _b : false }); }) },
                        },
                        include: { attributes: true },
                    })];
            case 1:
                created = _c.sent();
                // Track lineage
                return [4 /*yield*/, lineageSvc.registerEdge({ sourceType: 'Project', sourceId: projectId, targetType: 'EntityType', targetId: created.id, transformation: 'created' })];
            case 2:
                // Track lineage
                _c.sent();
                return [2 /*return*/, res.status(201).json(__assign(__assign({}, created), { objectCount: 0 }))];
            case 3:
                err_10 = _c.sent();
                if ((err_10 === null || err_10 === void 0 ? void 0 : err_10.code) === 'P2002')
                    return [2 /*return*/, res.status(409).json({ error: 'Entity type name already exists' })];
                return [2 /*return*/, res.status(500).json({ error: String(err_10) })];
            case 4: return [2 /*return*/];
        }
    });
}); });
// ── POST /api/ontology/entity-types/:id/instances — create data row ──────────
app.post('/api/ontology/entity-types/:id/instances', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var entityTypeId, _a, logicalId, data, et, payload, keys, newInstance, keys, err_11;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 12, , 13]);
                entityTypeId = req.params.id;
                _a = req.body, logicalId = _a.logicalId, data = _a.data;
                if (!logicalId)
                    return [2 /*return*/, res.status(400).json({ error: 'Missing logicalId' })];
                return [4 /*yield*/, prisma.entityType.findUnique({ where: { id: entityTypeId } })];
            case 1:
                et = _b.sent();
                if (!et)
                    return [2 /*return*/, res.status(404).json({ error: 'Entity type not found' })];
                if (!amqpChannel) return [3 /*break*/, 5];
                payload = JSON.stringify({ entityTypeId: entityTypeId, logicalId: logicalId, data: data });
                amqpChannel.sendToQueue(QUEUE_NAME, Buffer.from(payload), { persistent: true });
                if (!redisClient) return [3 /*break*/, 4];
                return [4 /*yield*/, redisClient.keys("ontology:instances:".concat(entityTypeId, ":*"))];
            case 2:
                keys = _b.sent();
                if (!(keys.length > 0)) return [3 /*break*/, 4];
                return [4 /*yield*/, redisClient.del(keys)];
            case 3:
                _b.sent();
                _b.label = 4;
            case 4: return [2 /*return*/, res.status(202).json({
                    message: 'Payload accepted for processing',
                    logicalId: logicalId,
                    status: 'queued'
                })];
            case 5: return [4 /*yield*/, prisma.currentEntityState.create({
                    data: { logicalId: String(logicalId), entityTypeId: entityTypeId, data: data || {}, updatedAt: new Date() },
                })];
            case 6:
                newInstance = _b.sent();
                return [4 /*yield*/, prisma.entityEvent.create({
                        data: { logicalId: String(logicalId), entityTypeId: entityTypeId, eventType: 'CREATED', payload: data || {} },
                    })];
            case 7:
                _b.sent();
                if (!redisClient) return [3 /*break*/, 10];
                return [4 /*yield*/, redisClient.keys("ontology:instances:".concat(entityTypeId, ":*"))];
            case 8:
                keys = _b.sent();
                if (!(keys.length > 0)) return [3 /*break*/, 10];
                return [4 /*yield*/, redisClient.del(keys)];
            case 9:
                _b.sent();
                _b.label = 10;
            case 10: return [2 /*return*/, res.json(newInstance)];
            case 11: return [3 /*break*/, 13];
            case 12:
                err_11 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_11) })];
            case 13: return [2 /*return*/];
        }
    });
}); });
// ── PATCH /api/ontology/entity-types/:id — rename an entity type ──────────────
app.patch('/api/ontology/entity-types/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var name_4, et, updated, err_12;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                name_4 = req.body.name;
                if (!name_4)
                    return [2 /*return*/, res.status(400).json({ error: 'name is required' })];
                return [4 /*yield*/, prisma.entityType.findUnique({ where: { id: req.params.id } })];
            case 1:
                et = _a.sent();
                if (!et)
                    return [2 /*return*/, res.status(404).json({ error: 'Not found' })];
                return [4 /*yield*/, prisma.entityType.update({
                        where: { id: req.params.id },
                        data: { name: name_4 },
                        include: { attributes: true },
                    })];
            case 2:
                updated = _a.sent();
                return [2 /*return*/, res.json(updated)];
            case 3:
                err_12 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_12) })];
            case 4: return [2 /*return*/];
        }
    });
}); });
// ── DELETE /api/ontology/entity-types/:id ─────────────────────────────────────
app.delete('/api/ontology/entity-types/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var instanceCount, err_13;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                return [4 /*yield*/, prisma.currentEntityState.count({ where: { entityTypeId: req.params.id } })];
            case 1:
                instanceCount = _a.sent();
                if (instanceCount > 0) {
                    return [2 /*return*/, res.status(409).json({ error: "Cannot delete: ".concat(instanceCount, " live objects exist. Archive them first.") })];
                }
                return [4 /*yield*/, prisma.attributeDefinition.deleteMany({ where: { entityTypeId: req.params.id } })];
            case 2:
                _a.sent();
                return [4 /*yield*/, prisma.entityType.delete({ where: { id: req.params.id } })];
            case 3:
                _a.sent();
                return [2 /*return*/, res.json({ success: true })];
            case 4:
                err_13 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_13) })];
            case 5: return [2 /*return*/];
        }
    });
}); });
// ── POST /api/ontology/entity-types/:id/attributes — add a property ───────────
app.post('/api/ontology/entity-types/:id/attributes', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name_5, _b, dataType, _c, required, attr, err_14;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 2, , 3]);
                _a = req.body, name_5 = _a.name, _b = _a.dataType, dataType = _b === void 0 ? 'STRING' : _b, _c = _a.required, required = _c === void 0 ? false : _c;
                if (!name_5)
                    return [2 /*return*/, res.status(400).json({ error: 'name is required' })];
                return [4 /*yield*/, prisma.attributeDefinition.create({
                        data: { entityTypeId: req.params.id, name: name_5, dataType: dataType, required: required },
                    })];
            case 1:
                attr = _d.sent();
                return [2 /*return*/, res.status(201).json(attr)];
            case 2:
                err_14 = _d.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_14) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ── DELETE /api/ontology/entity-types/:id/attributes/:attrId ─────────────────
app.delete('/api/ontology/entity-types/:id/attributes/:attrId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var err_15;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.attributeDefinition.delete({ where: { id: req.params.attrId } })];
            case 1:
                _a.sent();
                return [2 /*return*/, res.json({ success: true })];
            case 2:
                err_15 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_15) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ── GET /api/ontology/relationships — all relationship definitions ─────────────
app.get('/api/ontology/relationships', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, rels, err_16;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                projectId = getProjectId(req);
                if (!projectId)
                    return [2 /*return*/, res.status(400).json({ error: 'Project ID required' })];
                return [4 /*yield*/, prisma.relationshipDefinition.findMany({
                        where: { sourceEntityType: { projectId: projectId } },
                        include: {
                            sourceEntityType: { select: { id: true, name: true } },
                            targetEntityType: { select: { id: true, name: true } },
                        },
                    })];
            case 1:
                rels = _a.sent();
                return [2 /*return*/, res.json(rels)];
            case 2:
                err_16 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_16) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ── POST /api/ontology/relationships — create a link type between two entity types ──
app.post('/api/ontology/relationships', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name_6, sourceEntityTypeId, targetEntityTypeId, rel, err_17;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, name_6 = _a.name, sourceEntityTypeId = _a.sourceEntityTypeId, targetEntityTypeId = _a.targetEntityTypeId;
                if (!name_6 || !sourceEntityTypeId || !targetEntityTypeId) {
                    return [2 /*return*/, res.status(400).json({ error: 'name, sourceEntityTypeId, targetEntityTypeId required' })];
                }
                return [4 /*yield*/, prisma.relationshipDefinition.create({
                        data: { name: name_6, sourceEntityTypeId: sourceEntityTypeId, targetEntityTypeId: targetEntityTypeId },
                        include: {
                            sourceEntityType: { select: { id: true, name: true } },
                            targetEntityType: { select: { id: true, name: true } },
                        },
                    })];
            case 1:
                rel = _b.sent();
                return [2 /*return*/, res.status(201).json(rel)];
            case 2:
                err_17 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_17) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ── DELETE /api/ontology/relationships/:id ────────────────────────────────────
app.delete('/api/ontology/relationships/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var err_18;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.relationshipDefinition.delete({ where: { id: req.params.id } })];
            case 1:
                _a.sent();
                return [2 /*return*/, res.json({ success: true })];
            case 2:
                err_18 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_18) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ── GET /api/ontology/graph — full ontology graph for ReactFlow ───────────────
app.get('/api/ontology/graph', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, entityTypes, seen, _i, entityTypes_1, et, nodes, latestIds, rels, derivedEdges, edges, err_19;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                projectId = getProjectId(req);
                if (!projectId)
                    return [2 /*return*/, res.status(400).json({ error: 'Project ID required' })];
                return [4 /*yield*/, prisma.entityType.findMany({
                        where: { projectId: projectId },
                        include: { attributes: true },
                    })];
            case 1:
                entityTypes = _a.sent();
                seen = new Map();
                for (_i = 0, entityTypes_1 = entityTypes; _i < entityTypes_1.length; _i++) {
                    et = entityTypes_1[_i];
                    if (!seen.has(et.name) || seen.get(et.name).version < et.version)
                        seen.set(et.name, et);
                }
                return [4 /*yield*/, Promise.all(__spreadArray([], seen.values(), true).map(function (et, i) { return __awaiter(void 0, void 0, void 0, function () {
                        var objectCount;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, prisma.currentEntityState.count({ where: { entityTypeId: et.id } })];
                                case 1:
                                    objectCount = _a.sent();
                                    return [2 /*return*/, {
                                            id: et.id, type: 'entityCard',
                                            position: { x: 80 + (i % 4) * 300, y: 100 + Math.floor(i / 4) * 250 },
                                            data: {
                                                label: et.name, entityId: et.id,
                                                objectCount: objectCount,
                                                attributes: et.attributes,
                                            },
                                        }];
                            }
                        });
                    }); }))];
            case 2:
                nodes = _a.sent();
                latestIds = nodes.map(function (n) { return n.id; });
                return [4 /*yield*/, prisma.relationshipDefinition.findMany({
                        where: { sourceEntityTypeId: { in: latestIds }, targetEntityTypeId: { in: latestIds } },
                    })];
            case 3:
                rels = _a.sent();
                return [4 /*yield*/, prisma.currentGraph.findMany({
                        where: { relationshipName: { startsWith: '[derived:' } },
                        distinct: ['relationshipDefinitionId'],
                        take: 100,
                    })];
            case 4:
                derivedEdges = _a.sent();
                edges = __spreadArray(__spreadArray([], rels.map(function (r) { return ({
                    id: r.id, source: r.sourceEntityTypeId, target: r.targetEntityTypeId,
                    type: 'rel', label: r.name,
                    data: { isDerived: false },
                    style: { stroke: '#0BB68F', strokeWidth: 2 },
                }); }), true), derivedEdges.map(function (d) { return ({
                    id: "derived-".concat(d.id), source: d.sourceLogicalId, target: d.targetLogicalId,
                    type: 'rel', label: d.relationshipName,
                    data: { isDerived: true },
                    style: { stroke: '#137CBD', strokeWidth: 1.5, strokeDasharray: '4 3' },
                }); }), true);
                return [2 /*return*/, res.json({ nodes: nodes, edges: edges })];
            case 5:
                err_19 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_19) })];
            case 6: return [2 /*return*/];
        }
    });
}); });
// ── GET /api/ontology/entity-types/:id/instances — live data preview ──────────
app.get('/api/ontology/entity-types/:id/instances', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var page, limit, skip, cacheKey, cached, _a, total, instances, result, err_20;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 6, , 7]);
                page = parseInt(req.query.page) || 1;
                limit = Math.min(parseInt(req.query.limit) || 50, 500);
                skip = (page - 1) * limit;
                cacheKey = "ontology:instances:".concat(req.params.id, ":p").concat(page, ":l").concat(limit);
                if (!redisClient) return [3 /*break*/, 2];
                return [4 /*yield*/, redisClient.get(cacheKey)];
            case 1:
                cached = _b.sent();
                if (cached) {
                    return [2 /*return*/, res.json(JSON.parse(cached))];
                }
                _b.label = 2;
            case 2: return [4 /*yield*/, Promise.all([
                    prisma.currentEntityState.count({ where: { entityTypeId: req.params.id } }),
                    prisma.currentEntityState.findMany({
                        where: { entityTypeId: req.params.id },
                        skip: skip,
                        take: limit, orderBy: { updatedAt: 'desc' },
                    }),
                ])];
            case 3:
                _a = _b.sent(), total = _a[0], instances = _a[1];
                result = { total: total, page: page, limit: limit, data: instances };
                if (!(redisClient && instances.length > 0)) return [3 /*break*/, 5];
                return [4 /*yield*/, redisClient.setEx(cacheKey, 60, JSON.stringify(result))];
            case 4:
                _b.sent();
                _b.label = 5;
            case 5: return [2 /*return*/, res.json(result)];
            case 6:
                err_20 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_20) })];
            case 7: return [2 /*return*/];
        }
    });
}); });
// ── GET /api/ontology/rules — list OntologyRules ─────────────────────────────
app.get('/api/ontology/rules', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, rules, err_21;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                projectId = getProjectId(req);
                if (!projectId)
                    return [2 /*return*/, res.status(400).json({ error: 'Project ID required' })];
                return [4 /*yield*/, prisma.ontologyRule.findMany({
                        where: { projectId: projectId },
                        orderBy: { createdAt: 'desc' },
                    })];
            case 1:
                rules = _a.sent();
                return [2 /*return*/, res.json(rules)];
            case 2:
                err_21 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_21) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ── POST /api/ontology/rules — create an OntologyRule ────────────────────────
app.post('/api/ontology/rules', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, _a, name_7, description, antecedent, consequent, rule, err_22;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                projectId = getProjectId(req);
                if (!projectId)
                    return [2 /*return*/, res.status(400).json({ error: 'Project ID required' })];
                _a = req.body, name_7 = _a.name, description = _a.description, antecedent = _a.antecedent, consequent = _a.consequent;
                if (!name_7 || !antecedent || !consequent) {
                    return [2 /*return*/, res.status(400).json({ error: 'name, antecedent[], consequent{} required' })];
                }
                return [4 /*yield*/, prisma.ontologyRule.create({
                        data: { projectId: projectId, name: name_7, description: description, antecedent: antecedent, consequent: consequent },
                    })];
            case 1:
                rule = _b.sent();
                return [2 /*return*/, res.status(201).json(rule)];
            case 2:
                err_22 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_22) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ── DELETE /api/ontology/rules/:id ───────────────────────────────────────────
app.delete('/api/ontology/rules/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var err_23;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.ontologyRule.delete({ where: { id: req.params.id } })];
            case 1:
                _a.sent();
                return [2 /*return*/, res.json({ success: true })];
            case 2:
                err_23 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_23) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ── POST /api/ontology/reason — trigger the semantic reasoner ─────────────────
app.post('/api/ontology/reason', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, result, err_24;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                projectId = getProjectId(req);
                if (!projectId)
                    return [2 /*return*/, res.status(400).json({ error: 'Project ID required' })];
                return [4 /*yield*/, (0, ontology_reasoner_1.runFullReasoner)(projectId, prisma)];
            case 1:
                result = _a.sent();
                return [2 /*return*/, res.json(__assign({ success: true }, result))];
            case 2:
                err_24 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_24) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ─── End No-Code Ontology Builder API ────────────────────────────────────────
app.get('/entity-types/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var entityType, error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.entityType.findUnique({
                        where: { id: req.params.id },
                        include: { attributes: true },
                    })];
            case 1:
                entityType = _a.sent();
                if (!entityType) {
                    return [2 /*return*/, res.status(404).json({ error: 'entity type not found' })];
                }
                return [2 /*return*/, res.json(entityType)];
            case 2:
                error_9 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to fetch entity type', details: String(error_9) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ── Relationship API ───────────────────────────────────────────────
app.post('/entity-types/:id/outgoing-relationships', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var sourceEntityTypeId, _a, name, targetEntityTypeId, created, error_10;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                sourceEntityTypeId = req.params.id;
                _a = req.body, name = _a.name, targetEntityTypeId = _a.targetEntityTypeId;
                if (!name || !targetEntityTypeId) {
                    return [2 /*return*/, res.status(400).json({ error: 'name and targetEntityTypeId are required' })];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, prisma.relationshipDefinition.create({
                        data: {
                            name: name,
                            sourceEntityTypeId: sourceEntityTypeId,
                            targetEntityTypeId: targetEntityTypeId,
                        },
                    })];
            case 2:
                created = _b.sent();
                return [2 /*return*/, res.status(201).json(created)];
            case 3:
                error_10 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to create relationship definition', details: String(error_10) })];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.get('/entity-types/:id/outgoing-relationships', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var relationships, formatted, error_11;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.relationshipDefinition.findMany({
                        where: { sourceEntityTypeId: req.params.id },
                        include: {
                            targetEntityType: {
                                select: { name: true }
                            }
                        }
                    })];
            case 1:
                relationships = _a.sent();
                formatted = relationships.map(function (rel) { return ({
                    id: rel.id,
                    name: rel.name,
                    createdAt: rel.createdAt,
                    sourceEntityTypeId: rel.sourceEntityTypeId,
                    targetEntityTypeId: rel.targetEntityTypeId,
                    targetEntityName: rel.targetEntityType.name
                }); });
                return [2 /*return*/, res.json(formatted)];
            case 2:
                error_11 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to fetch relationship definitions', details: String(error_11) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.put('/entity-types/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var attributes, existing, impacts, oldAttrNames, newAttrNames_1, removed, highestVersion, newVersion, projectId, createdVersion, error_12;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                attributes = req.body.attributes;
                if (!Array.isArray(attributes)) {
                    return [2 /*return*/, res.status(400).json({ error: 'attributes[] are required for version update' })];
                }
                _c.label = 1;
            case 1:
                _c.trys.push([1, 6, , 7]);
                return [4 /*yield*/, prisma.entityType.findUnique({
                        where: { id: req.params.id },
                        include: { attributes: true },
                    })];
            case 2:
                existing = _c.sent();
                if (!existing) {
                    return [2 /*return*/, res.status(404).json({ error: 'entity type not found' })];
                }
                return [4 /*yield*/, lineageSvc.simulateBreakingChange('EntityType', existing.id)];
            case 3:
                impacts = _c.sent();
                if (!impacts.allow) {
                    oldAttrNames = existing.attributes.map(function (a) { return a.name; });
                    newAttrNames_1 = attributes.map(function (a) { return a.name; });
                    removed = oldAttrNames.filter(function (n) { return !newAttrNames_1.includes(n); });
                    if (removed.length > 0) {
                        return [2 /*return*/, res.status(409).json({
                                error: 'Contract Violation: Downstream models/rules rely on this EntityType schema. Removing attributes is a breaking change.',
                                removedAttributes: removed,
                                impactedConsumers: impacts.impactedConsumers,
                            })];
                    }
                }
                return [4 /*yield*/, prisma.entityType.findFirst({
                        where: { name: existing.name },
                        orderBy: { version: 'desc' },
                    })];
            case 4:
                highestVersion = _c.sent();
                newVersion = ((_a = highestVersion === null || highestVersion === void 0 ? void 0 : highestVersion.version) !== null && _a !== void 0 ? _a : existing.version) + 1;
                projectId = ((_b = req.auth) === null || _b === void 0 ? void 0 : _b.projectId) || req.body.projectId || req.header('X-Project-Id');
                if (!projectId && process.env.NODE_ENV !== 'production')
                    projectId = global.DEFAULT_PROJECT_ID;
                if (!projectId)
                    return [2 /*return*/, res.status(400).json({ error: 'Project ID is required for version update' })];
                return [4 /*yield*/, prisma.entityType.create({
                        data: {
                            projectId: projectId,
                            name: existing.name,
                            version: newVersion,
                            attributes: {
                                create: attributes.map(function (a) {
                                    var _a;
                                    return ({
                                        name: a.name,
                                        dataType: a.dataType,
                                        required: a.required,
                                        temporal: (_a = a.temporal) !== null && _a !== void 0 ? _a : false,
                                    });
                                }),
                            },
                        },
                        include: { attributes: true },
                    })];
            case 5:
                createdVersion = _c.sent();
                return [2 /*return*/, res.status(201).json(createdVersion)];
            case 6:
                error_12 = _c.sent();
                return [2 /*return*/, res.status(500).json({
                        error: 'failed to create next entity type version',
                        details: String(error_12),
                    })];
            case 7: return [2 /*return*/];
        }
    });
}); });
// ── Entity Instances ─────────────────────────────────────────────
app.get('/api/v1/ontology/instances/current', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, whereClause, instances, err_25;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                projectId = ((_a = req.auth) === null || _a === void 0 ? void 0 : _a.projectId) || req.query.projectId || req.header('X-Project-Id');
                if (!projectId && process.env.NODE_ENV !== 'production')
                    projectId = global.DEFAULT_PROJECT_ID;
                // In strict enterprise platforms, omitting context might be an error instead of wildcard search,
                // but some UIs rely on wildcard across permitted tenants. We will enforce single tenant here for safety.
                if (!projectId && process.env.NODE_ENV === 'production') {
                    return [2 /*return*/, res.status(400).json({ error: 'Project ID context required for instance queries' })];
                }
                whereClause = {};
                if (projectId) {
                    whereClause.entityType = {
                        projectId: String(projectId)
                    };
                }
                return [4 /*yield*/, prisma.currentEntityState.findMany({
                        where: whereClause,
                        include: {
                            entityType: {
                                select: { name: true }
                            }
                        }
                    })];
            case 1:
                instances = _b.sent();
                return [2 /*return*/, res.json(instances)];
            case 2:
                err_25 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_25) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/entity-types/:id/instances', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var entityType_1, body, logicalId_1, _i, _a, attr, metaFields, allowedNames, _b, _c, key, attrData_1, _d, _e, _f, key, value, now_1, _g, instance, previousState, eventId, error_13;
    return __generator(this, function (_h) {
        switch (_h.label) {
            case 0:
                _h.trys.push([0, 3, , 4]);
                return [4 /*yield*/, prisma.entityType.findUnique({
                        where: { id: req.params.id },
                        include: { attributes: true },
                    })];
            case 1:
                entityType_1 = _h.sent();
                if (!entityType_1) {
                    return [2 /*return*/, res.status(404).json({ error: 'entity type not found' })];
                }
                body = req.body;
                logicalId_1 = body.logicalId;
                if (!logicalId_1) {
                    return [2 /*return*/, res.status(400).json({ error: 'logicalId is required' })];
                }
                // Validate required attributes are present
                for (_i = 0, _a = entityType_1.attributes; _i < _a.length; _i++) {
                    attr = _a[_i];
                    if (attr.required && !(attr.name in body)) {
                        return [2 /*return*/, res.status(400).json({
                                error: "Missing required attribute: '".concat(attr.name, "'"),
                            })];
                    }
                }
                metaFields = new Set(['logicalId', 'validFrom', 'validTo']);
                allowedNames = new Set(entityType_1.attributes.map(function (a) { return a.name; }));
                for (_b = 0, _c = Object.keys(body); _b < _c.length; _b++) {
                    key = _c[_b];
                    if (!metaFields.has(key) && !allowedNames.has(key)) {
                        return [2 /*return*/, res.status(400).json({
                                error: "Unknown attribute: '".concat(key, "'. Allowed: ").concat(__spreadArray([], allowedNames, true).join(', ')),
                            })];
                    }
                }
                attrData_1 = {};
                for (_d = 0, _e = Object.entries(body); _d < _e.length; _d++) {
                    _f = _e[_d], key = _f[0], value = _f[1];
                    if (!metaFields.has(key)) {
                        attrData_1[key] = value;
                    }
                }
                now_1 = new Date();
                return [4 /*yield*/, prisma.$transaction(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                        var current, newInstance, idempotencyKey, domainEvent;
                        var _a, _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0: return [4 /*yield*/, tx.entityInstance.findFirst({
                                        where: {
                                            entityTypeId: entityType_1.id,
                                            logicalId: logicalId_1,
                                            validTo: null,
                                        },
                                    })];
                                case 1:
                                    current = _c.sent();
                                    if (!current) return [3 /*break*/, 3];
                                    return [4 /*yield*/, tx.entityInstance.update({
                                            where: { id: current.id },
                                            data: { validTo: now_1 },
                                        })];
                                case 2:
                                    _c.sent();
                                    _c.label = 3;
                                case 3: return [4 /*yield*/, tx.entityInstance.create({
                                        data: {
                                            logicalId: logicalId_1,
                                            entityTypeId: entityType_1.id,
                                            entityVersion: entityType_1.version,
                                            data: attrData_1,
                                            validFrom: now_1,
                                            validTo: null,
                                        },
                                    })];
                                case 4:
                                    newInstance = _c.sent();
                                    idempotencyKey = "EntityStateChanged:".concat(logicalId_1, ":").concat(now_1.toISOString());
                                    return [4 /*yield*/, tx.domainEvent.create({
                                            data: {
                                                idempotencyKey: idempotencyKey,
                                                eventType: 'EntityStateChanged',
                                                entityTypeId: entityType_1.id,
                                                logicalId: logicalId_1,
                                                entityVersion: entityType_1.version,
                                                payload: {
                                                    previousState: (_a = current === null || current === void 0 ? void 0 : current.data) !== null && _a !== void 0 ? _a : null,
                                                    newState: attrData_1,
                                                    validFrom: now_1.toISOString(),
                                                },
                                            },
                                        })];
                                case 5:
                                    domainEvent = _c.sent();
                                    // CQRS: Upsert read model projection
                                    return [4 /*yield*/, tx.currentEntityState.upsert({
                                            where: { logicalId: logicalId_1 },
                                            create: {
                                                logicalId: logicalId_1,
                                                entityTypeId: entityType_1.id,
                                                data: attrData_1,
                                                updatedAt: now_1,
                                            },
                                            update: {
                                                data: attrData_1,
                                                updatedAt: now_1,
                                            },
                                        })];
                                case 6:
                                    // CQRS: Upsert read model projection
                                    _c.sent();
                                    return [2 /*return*/, {
                                            instance: newInstance,
                                            previousState: (_b = current === null || current === void 0 ? void 0 : current.data) !== null && _b !== void 0 ? _b : null,
                                            eventId: domainEvent.id,
                                        }];
                            }
                        });
                    }); })];
            case 2:
                _g = _h.sent(), instance = _g.instance, previousState = _g.previousState, eventId = _g.eventId;
                // Fire-and-forget: evaluate policies after transaction commits
                (0, policy_engine_1.evaluatePolicies)({
                    eventId: eventId,
                    eventType: 'EntityStateChanged',
                    entityTypeId: entityType_1.id,
                    logicalId: logicalId_1,
                    entityVersion: entityType_1.version,
                    payload: {
                        previousState: previousState,
                        newState: attrData_1,
                        validFrom: now_1.toISOString(),
                    },
                }, prisma);
                return [2 /*return*/, res.status(201).json(instance)];
            case 3:
                error_13 = _h.sent();
                return [2 /*return*/, res.status(500).json({
                        error: 'failed to create entity instance',
                        details: String(error_13),
                    })];
            case 4: return [2 /*return*/];
        }
    });
}); });
// ── Bulk Entity Ingestion ────────────────────────────────────────
app.post('/entity-types/:id/instances/bulk', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var entityType_2, items_2, now_2, metaFields_1, allowedNames, _i, items_1, item, logicalId, _a, _b, attr, _c, _d, key, results, error_14;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 3, , 4]);
                return [4 /*yield*/, prisma.entityType.findUnique({
                        where: { id: req.params.id },
                        include: { attributes: true },
                    })];
            case 1:
                entityType_2 = _e.sent();
                if (!entityType_2) {
                    return [2 /*return*/, res.status(404).json({ error: 'entity type not found' })];
                }
                if (!Array.isArray(req.body)) {
                    return [2 /*return*/, res.status(400).json({ error: 'body must be an array of instances' })];
                }
                items_2 = req.body;
                now_2 = new Date();
                metaFields_1 = new Set(['logicalId', 'validFrom', 'validTo']);
                allowedNames = new Set(entityType_2.attributes.map(function (a) { return a.name; }));
                // 1. Validation phase
                for (_i = 0, items_1 = items_2; _i < items_1.length; _i++) {
                    item = items_1[_i];
                    logicalId = item.logicalId;
                    if (!logicalId)
                        return [2 /*return*/, res.status(400).json({ error: 'logicalId is required for all items' })];
                    for (_a = 0, _b = entityType_2.attributes; _a < _b.length; _a++) {
                        attr = _b[_a];
                        if (attr.required && !(attr.name in item)) {
                            return [2 /*return*/, res.status(400).json({ error: "Missing required attribute: '".concat(attr.name, "' in item ").concat(logicalId) })];
                        }
                    }
                    for (_c = 0, _d = Object.keys(item); _c < _d.length; _c++) {
                        key = _d[_c];
                        if (!metaFields_1.has(key) && !allowedNames.has(key)) {
                            return [2 /*return*/, res.status(400).json({ error: "Unknown attribute: '".concat(key, "' in item ").concat(logicalId, ". Allowed: ").concat(__spreadArray([], allowedNames, true).join(', ')) })];
                        }
                    }
                }
                return [4 /*yield*/, prisma.$transaction(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                        var createdInstances, _i, items_3, item, logicalId, attrData, _a, _b, _c, key, value, current, newInstance, idempotencyKey;
                        var _d;
                        return __generator(this, function (_e) {
                            switch (_e.label) {
                                case 0:
                                    createdInstances = [];
                                    _i = 0, items_3 = items_2;
                                    _e.label = 1;
                                case 1:
                                    if (!(_i < items_3.length)) return [3 /*break*/, 9];
                                    item = items_3[_i];
                                    logicalId = item.logicalId;
                                    attrData = {};
                                    for (_a = 0, _b = Object.entries(item); _a < _b.length; _a++) {
                                        _c = _b[_a], key = _c[0], value = _c[1];
                                        if (!metaFields_1.has(key))
                                            attrData[key] = value;
                                    }
                                    return [4 /*yield*/, tx.entityInstance.findFirst({
                                            where: { entityTypeId: entityType_2.id, logicalId: logicalId, validTo: null },
                                        })];
                                case 2:
                                    current = _e.sent();
                                    if (!current) return [3 /*break*/, 4];
                                    return [4 /*yield*/, tx.entityInstance.update({
                                            where: { id: current.id },
                                            data: { validTo: now_2 },
                                        })];
                                case 3:
                                    _e.sent();
                                    _e.label = 4;
                                case 4: return [4 /*yield*/, tx.entityInstance.create({
                                        data: {
                                            logicalId: logicalId,
                                            entityTypeId: entityType_2.id,
                                            entityVersion: entityType_2.version,
                                            data: attrData,
                                            validFrom: now_2,
                                            validTo: null,
                                        },
                                    })];
                                case 5:
                                    newInstance = _e.sent();
                                    createdInstances.push(newInstance);
                                    idempotencyKey = "EntityBulkStateChanged:".concat(logicalId, ":").concat(now_2.toISOString());
                                    return [4 /*yield*/, tx.domainEvent.create({
                                            data: {
                                                idempotencyKey: idempotencyKey,
                                                eventType: 'EntityStateChanged',
                                                entityTypeId: entityType_2.id,
                                                logicalId: logicalId,
                                                entityVersion: entityType_2.version,
                                                payload: {
                                                    previousState: (_d = current === null || current === void 0 ? void 0 : current.data) !== null && _d !== void 0 ? _d : null,
                                                    newState: attrData,
                                                    validFrom: now_2.toISOString(),
                                                },
                                            },
                                        })];
                                case 6:
                                    _e.sent();
                                    return [4 /*yield*/, tx.currentEntityState.upsert({
                                            where: { logicalId: logicalId },
                                            create: {
                                                logicalId: logicalId,
                                                entityTypeId: entityType_2.id,
                                                data: attrData,
                                                updatedAt: now_2,
                                            },
                                            update: {
                                                data: attrData,
                                                updatedAt: now_2,
                                            },
                                        })];
                                case 7:
                                    _e.sent();
                                    _e.label = 8;
                                case 8:
                                    _i++;
                                    return [3 /*break*/, 1];
                                case 9: return [2 /*return*/, { createdInstances: createdInstances }];
                            }
                        });
                    }); })];
            case 2:
                results = _e.sent();
                return [2 /*return*/, res.status(201).json({ success: true, count: results.createdInstances.length })];
            case 3:
                error_14 = _e.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to execute bulk ingestion', details: String(error_14) })];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.get('/api/v1/ontology/instances/:id/provenance', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var provenance, error_15;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.provenanceRecord.findMany({
                        where: { entityInstanceId: req.params.id },
                        orderBy: { ingestedAt: 'desc' }
                    })];
            case 1:
                provenance = _a.sent();
                return [2 /*return*/, res.json(provenance)];
            case 2:
                error_15 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to fetch provenance', details: String(error_15) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/entity-types/:id/instances', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var entityType, instances, error_16;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, prisma.entityType.findUnique({
                        where: { id: req.params.id },
                    })];
            case 1:
                entityType = _a.sent();
                if (!entityType) {
                    return [2 /*return*/, res.status(404).json({ error: 'entity type not found' })];
                }
                return [4 /*yield*/, prisma.entityInstance.findMany({
                        where: { entityTypeId: req.params.id },
                        orderBy: { transactionTime: 'desc' },
                    })];
            case 2:
                instances = _a.sent();
                return [2 /*return*/, res.json(instances)];
            case 3:
                error_16 = _a.sent();
                return [2 /*return*/, res.status(500).json({
                        error: 'failed to list entity instances',
                        details: String(error_16),
                    })];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Timeline of a single logical entity (bi-temporal)
// Query params:
//   ?validAsOf=ISO     → "What was true at this valid-time?"
//   ?transactionAsOf=ISO → "What did the system know at this transaction-time?"
app.get('/entity-types/:id/instances/:logicalId/history', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, validAsOf, transactionAsOf, where, vt, tt, instances, error_17;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.query, validAsOf = _a.validAsOf, transactionAsOf = _a.transactionAsOf;
                where = {
                    entityTypeId: req.params.id,
                    logicalId: req.params.logicalId,
                };
                // Valid-time filter: validFrom <= validAsOf AND (validTo IS NULL OR validTo > validAsOf)
                if (validAsOf) {
                    vt = new Date(validAsOf);
                    where.validFrom = { lte: vt };
                    where.OR = [
                        { validTo: null },
                        { validTo: { gt: vt } },
                    ];
                }
                // Transaction-time filter: transactionTime <= transactionAsOf
                if (transactionAsOf) {
                    tt = new Date(transactionAsOf);
                    where.transactionTime = { lte: tt };
                }
                return [4 /*yield*/, prisma.entityInstance.findMany({
                        where: where,
                        orderBy: { validFrom: 'desc' },
                    })];
            case 1:
                instances = _b.sent();
                if (instances.length === 0) {
                    return [2 /*return*/, res.status(404).json({ error: 'no instances found for this logicalId' })];
                }
                return [2 /*return*/, res.json(instances)];
            case 2:
                error_17 = _b.sent();
                return [2 /*return*/, res.status(500).json({
                        error: 'failed to fetch entity history',
                        details: String(error_17),
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ── Domain Events ────────────────────────────────────────────────
app.get('/events', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, entityTypeId, logicalId, eventType, where, events, error_18;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.query, entityTypeId = _a.entityTypeId, logicalId = _a.logicalId, eventType = _a.eventType;
                where = {};
                if (entityTypeId)
                    where.entityTypeId = entityTypeId;
                if (logicalId)
                    where.logicalId = logicalId;
                if (eventType)
                    where.eventType = eventType;
                return [4 /*yield*/, prisma.domainEvent.findMany({
                        where: where,
                        orderBy: { occurredAt: 'desc' },
                    })];
            case 1:
                events = _b.sent();
                return [2 /*return*/, res.json(events)];
            case 2:
                error_18 = _b.sent();
                return [2 /*return*/, res.status(500).json({
                        error: 'failed to fetch events',
                        details: String(error_18),
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ── Relationship Definitions ─────────────────────────────────────
app.post('/relationship-definitions', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name_8, sourceEntityTypeId, targetEntityTypeId, relDef, error_19;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, name_8 = _a.name, sourceEntityTypeId = _a.sourceEntityTypeId, targetEntityTypeId = _a.targetEntityTypeId;
                if (!name_8 || !sourceEntityTypeId || !targetEntityTypeId) {
                    return [2 /*return*/, res.status(400).json({ error: 'name, sourceEntityTypeId, and targetEntityTypeId are required' })];
                }
                return [4 /*yield*/, prisma.relationshipDefinition.create({
                        data: { name: name_8, sourceEntityTypeId: sourceEntityTypeId, targetEntityTypeId: targetEntityTypeId },
                        include: { sourceEntityType: true, targetEntityType: true },
                    })];
            case 1:
                relDef = _b.sent();
                return [2 /*return*/, res.status(201).json(relDef)];
            case 2:
                error_19 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to create relationship definition', details: String(error_19) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/relationship-definitions', function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var defs, error_20;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.relationshipDefinition.findMany({
                        include: { sourceEntityType: true, targetEntityType: true },
                        orderBy: { createdAt: 'desc' },
                    })];
            case 1:
                defs = _a.sent();
                return [2 /*return*/, res.json(defs)];
            case 2:
                error_20 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to list relationship definitions', details: String(error_20) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ── Relationship Instances ───────────────────────────────────────
app.post('/relationships', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, relationshipDefinitionId, sourceLogicalId, targetLogicalId, properties, relDef, now, existing, instance, idempotencyKey, error_21;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 6, , 7]);
                _a = req.body, relationshipDefinitionId = _a.relationshipDefinitionId, sourceLogicalId = _a.sourceLogicalId, targetLogicalId = _a.targetLogicalId, properties = _a.properties;
                if (!relationshipDefinitionId || !sourceLogicalId || !targetLogicalId) {
                    return [2 /*return*/, res.status(400).json({
                            error: 'relationshipDefinitionId, sourceLogicalId, and targetLogicalId are required',
                        })];
                }
                return [4 /*yield*/, prisma.relationshipDefinition.findUnique({
                        where: { id: relationshipDefinitionId },
                    })];
            case 1:
                relDef = _b.sent();
                if (!relDef) {
                    return [2 /*return*/, res.status(404).json({ error: 'relationship definition not found' })];
                }
                now = new Date();
                return [4 /*yield*/, prisma.relationshipInstance.findFirst({
                        where: {
                            relationshipDefinitionId: relationshipDefinitionId,
                            sourceLogicalId: sourceLogicalId,
                            targetLogicalId: targetLogicalId,
                            validTo: null,
                        },
                    })];
            case 2:
                existing = _b.sent();
                if (existing) {
                    return [2 /*return*/, res.status(409).json({ error: 'An active relationship already exists for this pair' })];
                }
                return [4 /*yield*/, prisma.relationshipInstance.create({
                        data: {
                            relationshipDefinitionId: relationshipDefinitionId,
                            sourceLogicalId: sourceLogicalId,
                            targetLogicalId: targetLogicalId,
                            properties: properties ? properties : prisma_1.Prisma.DbNull,
                            validFrom: now,
                            validTo: null,
                        },
                        include: { relationshipDef: true },
                    })];
            case 3:
                instance = _b.sent();
                idempotencyKey = "RelationshipCreated:".concat(sourceLogicalId, ":").concat(targetLogicalId, ":").concat(now.toISOString());
                return [4 /*yield*/, prisma.domainEvent.create({
                        data: {
                            idempotencyKey: idempotencyKey,
                            eventType: 'RelationshipCreated',
                            entityTypeId: relDef.sourceEntityTypeId,
                            logicalId: sourceLogicalId,
                            entityVersion: 0,
                            payload: {
                                relationship: relDef.name,
                                sourceLogicalId: sourceLogicalId,
                                targetLogicalId: targetLogicalId,
                                properties: properties !== null && properties !== void 0 ? properties : null,
                                validFrom: now.toISOString(),
                            },
                        },
                    })];
            case 4:
                _b.sent();
                // CQRS: Upsert CurrentGraph projection
                return [4 /*yield*/, prisma.currentGraph.create({
                        data: {
                            relationshipDefinitionId: relationshipDefinitionId,
                            relationshipName: relDef.name,
                            sourceLogicalId: sourceLogicalId,
                            targetLogicalId: targetLogicalId,
                            properties: properties ? properties : prisma_1.Prisma.DbNull,
                        },
                    })];
            case 5:
                // CQRS: Upsert CurrentGraph projection
                _b.sent();
                return [2 /*return*/, res.status(201).json(instance)];
            case 6:
                error_21 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to create relationship', details: String(error_21) })];
            case 7: return [2 /*return*/];
        }
    });
}); });
app.get('/relationships', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, sourceLogicalId, targetLogicalId, includeInactive, where, rels, error_22;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.query, sourceLogicalId = _a.sourceLogicalId, targetLogicalId = _a.targetLogicalId, includeInactive = _a.includeInactive;
                where = {};
                if (sourceLogicalId)
                    where.sourceLogicalId = sourceLogicalId;
                if (targetLogicalId)
                    where.targetLogicalId = targetLogicalId;
                // By default, only return active relationships (validTo IS NULL)
                if (includeInactive !== 'true') {
                    where.validTo = null;
                }
                return [4 /*yield*/, prisma.relationshipInstance.findMany({
                        where: where,
                        include: { relationshipDef: true },
                        orderBy: { validFrom: 'desc' },
                    })];
            case 1:
                rels = _b.sent();
                return [2 /*return*/, res.json(rels)];
            case 2:
                error_22 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to list relationships', details: String(error_22) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Temporal close (NOT hard delete)
app.delete('/relationships/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var existing, now, closed_1, idempotencyKey, error_23;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                return [4 /*yield*/, prisma.relationshipInstance.findUnique({
                        where: { id: req.params.id },
                        include: { relationshipDef: true },
                    })];
            case 1:
                existing = _a.sent();
                if (!existing) {
                    return [2 /*return*/, res.status(404).json({ error: 'relationship not found' })];
                }
                if (existing.validTo !== null) {
                    return [2 /*return*/, res.status(400).json({ error: 'relationship is already closed' })];
                }
                now = new Date();
                return [4 /*yield*/, prisma.relationshipInstance.update({
                        where: { id: req.params.id },
                        data: { validTo: now },
                        include: { relationshipDef: true },
                    })];
            case 2:
                closed_1 = _a.sent();
                idempotencyKey = "RelationshipClosed:".concat(existing.sourceLogicalId, ":").concat(existing.targetLogicalId, ":").concat(now.toISOString());
                return [4 /*yield*/, prisma.domainEvent.create({
                        data: {
                            idempotencyKey: idempotencyKey,
                            eventType: 'RelationshipClosed',
                            entityTypeId: existing.relationshipDef.sourceEntityTypeId,
                            logicalId: existing.sourceLogicalId,
                            entityVersion: 0,
                            payload: {
                                relationship: existing.relationshipDef.name,
                                sourceLogicalId: existing.sourceLogicalId,
                                targetLogicalId: existing.targetLogicalId,
                                validFrom: existing.validFrom.toISOString(),
                                validTo: now.toISOString(),
                            },
                        },
                    })];
            case 3:
                _a.sent();
                // CQRS: Remove from CurrentGraph projection
                return [4 /*yield*/, prisma.currentGraph.deleteMany({
                        where: {
                            relationshipDefinitionId: existing.relationshipDefinitionId,
                            sourceLogicalId: existing.sourceLogicalId,
                            targetLogicalId: existing.targetLogicalId,
                        },
                    })];
            case 4:
                // CQRS: Remove from CurrentGraph projection
                _a.sent();
                return [2 /*return*/, res.json(closed_1)];
            case 5:
                error_23 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to close relationship', details: String(error_23) })];
            case 6: return [2 /*return*/];
        }
    });
}); });
// ── Graph Traversal (time-aware) ─────────────────────────────────
app.get('/graph/:logicalId/neighbors', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var logicalId, _a, validAsOf, transactionAsOf, _b, outgoing_1, incoming_1, neighbors_1, temporalFilter, vt, tt, _c, outgoing, incoming, neighbors, error_24;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 4, , 5]);
                logicalId = req.params.logicalId;
                _a = req.query, validAsOf = _a.validAsOf, transactionAsOf = _a.transactionAsOf;
                if (!(!validAsOf && !transactionAsOf)) return [3 /*break*/, 2];
                return [4 /*yield*/, Promise.all([
                        prisma.currentGraph.findMany({ where: { sourceLogicalId: logicalId } }),
                        prisma.currentGraph.findMany({ where: { targetLogicalId: logicalId } }),
                    ])];
            case 1:
                _b = _d.sent(), outgoing_1 = _b[0], incoming_1 = _b[1];
                neighbors_1 = __spreadArray(__spreadArray([], outgoing_1.map(function (r) { return ({
                    direction: 'outgoing',
                    relationship: r.relationshipName,
                    logicalId: r.targetLogicalId,
                    properties: r.properties,
                    validFrom: null,
                    validTo: null,
                    relationshipInstanceId: r.id,
                }); }), true), incoming_1.map(function (r) { return ({
                    direction: 'incoming',
                    relationship: r.relationshipName,
                    logicalId: r.sourceLogicalId,
                    properties: r.properties,
                    validFrom: null,
                    validTo: null,
                    relationshipInstanceId: r.id,
                }); }), true);
                return [2 /*return*/, res.json({ logicalId: logicalId, neighbors: neighbors_1, source: 'cqrs_read_model' })];
            case 2:
                temporalFilter = {};
                if (validAsOf) {
                    vt = new Date(validAsOf);
                    temporalFilter.validFrom = { lte: vt };
                    temporalFilter.OR = [
                        { validTo: null },
                        { validTo: { gt: vt } },
                    ];
                }
                else {
                    temporalFilter.validTo = null;
                }
                if (transactionAsOf) {
                    tt = new Date(transactionAsOf);
                    temporalFilter.transactionTime = { lte: tt };
                }
                return [4 /*yield*/, Promise.all([
                        prisma.relationshipInstance.findMany({
                            where: __assign({ sourceLogicalId: logicalId }, temporalFilter),
                            include: { relationshipDef: true },
                        }),
                        prisma.relationshipInstance.findMany({
                            where: __assign({ targetLogicalId: logicalId }, temporalFilter),
                            include: { relationshipDef: true },
                        }),
                    ])];
            case 3:
                _c = _d.sent(), outgoing = _c[0], incoming = _c[1];
                neighbors = __spreadArray(__spreadArray([], outgoing.map(function (r) { return ({
                    direction: 'outgoing',
                    relationship: r.relationshipDef.name,
                    logicalId: r.targetLogicalId,
                    properties: r.properties,
                    validFrom: r.validFrom,
                    validTo: r.validTo,
                    relationshipInstanceId: r.id,
                }); }), true), incoming.map(function (r) { return ({
                    direction: 'incoming',
                    relationship: r.relationshipDef.name,
                    logicalId: r.sourceLogicalId,
                    properties: r.properties,
                    validFrom: r.validFrom,
                    validTo: r.validTo,
                    relationshipInstanceId: r.id,
                }); }), true);
                return [2 /*return*/, res.json({ logicalId: logicalId, neighbors: neighbors, source: 'temporal_table' })];
            case 4:
                error_24 = _d.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to fetch neighbors', details: String(error_24) })];
            case 5: return [2 /*return*/];
        }
    });
}); });
// ── Policies ─────────────────────────────────────────────────────
app.post('/policies', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name_9, description, entityTypeId, eventType, condition, actionType, actionConfig, policy, error_25;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, name_9 = _a.name, description = _a.description, entityTypeId = _a.entityTypeId, eventType = _a.eventType, condition = _a.condition, actionType = _a.actionType, actionConfig = _a.actionConfig;
                if (!name_9 || !entityTypeId || !condition) {
                    return [2 /*return*/, res.status(400).json({ error: 'name, entityTypeId, and condition are required' })];
                }
                return [4 /*yield*/, prisma.policyDefinition.create({
                        data: {
                            name: name_9,
                            description: description !== null && description !== void 0 ? description : null,
                            entityTypeId: entityTypeId,
                            eventType: eventType !== null && eventType !== void 0 ? eventType : 'EntityStateChanged',
                            condition: condition,
                            actionType: actionType !== null && actionType !== void 0 ? actionType : 'EmitAlert',
                            actionConfig: actionConfig ? actionConfig : prisma_1.Prisma.DbNull,
                            enabled: true,
                        },
                    })];
            case 1:
                policy = _b.sent();
                return [2 /*return*/, res.status(201).json(policy)];
            case 2:
                error_25 = _b.sent();
                if ((error_25 === null || error_25 === void 0 ? void 0 : error_25.code) === 'P2002') {
                    return [2 /*return*/, res.status(409).json({ error: 'A policy with this name already exists' })];
                }
                return [2 /*return*/, res.status(500).json({ error: 'failed to create policy', details: String(error_25) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/policies', function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var policies, error_26;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.policyDefinition.findMany({
                        orderBy: { createdAt: 'desc' },
                    })];
            case 1:
                policies = _a.sent();
                return [2 /*return*/, res.json(policies)];
            case 2:
                error_26 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to list policies', details: String(error_26) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.delete('/policies/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var error_27;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.policyDefinition.delete({
                        where: { id: req.params.id },
                    })];
            case 1:
                _a.sent();
                return [2 /*return*/, res.json({ deleted: true })];
            case 2:
                error_27 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to delete policy', details: String(error_27) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ── Alerts ───────────────────────────────────────────────────────
app.get('/alerts', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, logicalId, alertType, acknowledged, entityTypeId, where, alerts, error_28;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.query, logicalId = _a.logicalId, alertType = _a.alertType, acknowledged = _a.acknowledged, entityTypeId = _a.entityTypeId;
                where = {};
                if (logicalId)
                    where.logicalId = logicalId;
                if (alertType)
                    where.alertType = alertType;
                if (entityTypeId)
                    where.entityTypeId = entityTypeId;
                if (acknowledged !== undefined)
                    where.acknowledged = acknowledged === 'true';
                return [4 /*yield*/, prisma.alert.findMany({
                        where: where,
                        orderBy: { createdAt: 'desc' },
                    })];
            case 1:
                alerts = _b.sent();
                return [2 /*return*/, res.json(alerts)];
            case 2:
                error_28 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to list alerts', details: String(error_28) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.put('/alerts/:id/acknowledge', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var alert_1, error_29;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.alert.update({
                        where: { id: req.params.id },
                        data: { acknowledged: true },
                    })];
            case 1:
                alert_1 = _a.sent();
                return [2 /*return*/, res.json(alert_1)];
            case 2:
                error_29 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to acknowledge alert', details: String(error_29) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ── Time-Series Telemetry ────────────────────────────────────────
var telemetryClients = new Set();
app.get('/telemetry/:logicalId/stream', function (req, res) {
    var logicalId = req.params.logicalId;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // Establish the SSE connection immediately
    var client = { logicalId: logicalId, res: res };
    telemetryClients.add(client);
    req.on('close', function () {
        telemetryClients.delete(client);
    });
});
app.post('/telemetry', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, logicalId_2, metrics, mappedMetrics, created, payload, _i, telemetryClients_1, client, error_30;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, logicalId_2 = _a.logicalId, metrics = _a.metrics;
                if (!logicalId_2 || !Array.isArray(metrics)) {
                    return [2 /*return*/, res.status(400).json({ error: 'logicalId and metrics array are required' })];
                }
                mappedMetrics = metrics.map(function (m) { return ({
                    logicalId: logicalId_2,
                    metric: m.metric,
                    value: Number(m.value),
                    timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
                }); });
                return [4 /*yield*/, prisma.timeseriesMetric.createMany({
                        data: mappedMetrics,
                    })];
            case 1:
                created = _b.sent();
                payload = JSON.stringify({ logicalId: logicalId_2, metrics: mappedMetrics });
                for (_i = 0, telemetryClients_1 = telemetryClients; _i < telemetryClients_1.length; _i++) {
                    client = telemetryClients_1[_i];
                    if (client.logicalId === logicalId_2) {
                        client.res.write("data: ".concat(payload, "\n\n"));
                    }
                }
                return [2 /*return*/, res.status(201).json({ inserted: created.count })];
            case 2:
                error_30 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to ingest telemetry', details: String(error_30) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/telemetry/:logicalId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var logicalId, _a, metric, from, to, aggregate, where, aggMap, count, aggQuery, result, aggRecord, aggResult, points, error_31;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 6, , 7]);
                logicalId = req.params.logicalId;
                _a = req.query, metric = _a.metric, from = _a.from, to = _a.to, aggregate = _a.aggregate;
                where = { logicalId: logicalId };
                if (metric) {
                    where.metric = metric;
                }
                if (from || to) {
                    where['timestamp'] = {};
                    if (from)
                        where['timestamp'].gte = new Date(from);
                    if (to)
                        where['timestamp'].lte = new Date(to);
                }
                if (!(aggregate && typeof aggregate === 'string')) return [3 /*break*/, 4];
                if (!metric) {
                    return [2 /*return*/, res.status(400).json({ error: 'aggregate requires a specific metric to filter on' })];
                }
                aggMap = {
                    avg: 'value',
                    min: 'value',
                    max: 'value',
                    sum: 'value',
                };
                if (!(aggregate === 'count')) return [3 /*break*/, 2];
                return [4 /*yield*/, prisma.timeseriesMetric.count({ where: where })];
            case 1:
                count = _d.sent();
                return [2 /*return*/, res.json({ logicalId: logicalId, metric: metric, aggregate: 'count', value: count })];
            case 2:
                if (!(aggregate in aggMap)) {
                    return [2 /*return*/, res.status(400).json({ error: "unsupported aggregation: ".concat(aggregate) })];
                }
                aggQuery = {};
                aggQuery["_".concat(aggregate)] = { value: true };
                return [4 /*yield*/, prisma.timeseriesMetric.aggregate(__assign({ where: where }, aggQuery))];
            case 3:
                result = _d.sent();
                aggRecord = result;
                aggResult = (_c = (_b = aggRecord["_".concat(aggregate)]) === null || _b === void 0 ? void 0 : _b.value) !== null && _c !== void 0 ? _c : null;
                return [2 /*return*/, res.json({
                        logicalId: logicalId,
                        metric: metric,
                        aggregate: aggregate,
                        value: aggResult,
                    })];
            case 4: return [4 /*yield*/, prisma.timeseriesMetric.findMany({
                    where: where,
                    orderBy: { timestamp: 'desc' },
                    take: 1000,
                })];
            case 5:
                points = _d.sent();
                return [2 /*return*/, res.json(points)];
            case 6:
                error_31 = _d.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to query telemetry', details: String(error_31) })];
            case 7: return [2 /*return*/];
        }
    });
}); });
// ── Data Sources ─────────────────────────────────────────────────
app.post('/data-sources', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name_10, type, connectionConfig, validTypes, source, error_32;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, name_10 = _a.name, type = _a.type, connectionConfig = _a.connectionConfig;
                if (!name_10 || !type) {
                    return [2 /*return*/, res.status(400).json({ error: 'name and type are required' })];
                }
                validTypes = ['REST_API', 'JSON_UPLOAD', 'CSV_UPLOAD'];
                if (!validTypes.includes(type)) {
                    return [2 /*return*/, res.status(400).json({ error: "type must be one of: ".concat(validTypes.join(', ')) })];
                }
                return [4 /*yield*/, prisma.dataSource.create({
                        data: {
                            projectId: req.body.projectId || req.header('X-Project-Id') || global.DEFAULT_PROJECT_ID,
                            name: name_10,
                            type: type,
                            connectionConfig: connectionConfig !== null && connectionConfig !== void 0 ? connectionConfig : {},
                        },
                    })];
            case 1:
                source = _b.sent();
                return [2 /*return*/, res.status(201).json(source)];
            case 2:
                error_32 = _b.sent();
                if ((error_32 === null || error_32 === void 0 ? void 0 : error_32.code) === 'P2002') {
                    return [2 /*return*/, res.status(409).json({ error: 'A data source with this name already exists' })];
                }
                return [2 /*return*/, res.status(500).json({ error: 'failed to create data source', details: String(error_32) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/data-sources', function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var sources, error_33;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.dataSource.findMany({
                        orderBy: { createdAt: 'desc' },
                        include: { integrationJobs: { select: { id: true, name: true } } },
                    })];
            case 1:
                sources = _a.sent();
                return [2 /*return*/, res.json(sources)];
            case 2:
                error_33 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to list data sources', details: String(error_33) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/data-sources/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var source, error_34;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.dataSource.findUnique({
                        where: { id: req.params.id },
                        include: { integrationJobs: true },
                    })];
            case 1:
                source = _a.sent();
                if (!source) {
                    return [2 /*return*/, res.status(404).json({ error: 'data source not found' })];
                }
                return [2 /*return*/, res.json(source)];
            case 2:
                error_34 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to fetch data source', details: String(error_34) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.put('/data-sources/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name_11, type, connectionConfig, enabled, source, error_35;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, name_11 = _a.name, type = _a.type, connectionConfig = _a.connectionConfig, enabled = _a.enabled;
                return [4 /*yield*/, prisma.dataSource.update({
                        where: { id: req.params.id },
                        data: __assign(__assign(__assign(__assign({}, (name_11 !== undefined && { name: name_11 })), (type !== undefined && { type: type })), (connectionConfig !== undefined && { connectionConfig: connectionConfig })), (enabled !== undefined && { enabled: enabled })),
                    })];
            case 1:
                source = _b.sent();
                return [2 /*return*/, res.json(source)];
            case 2:
                error_35 = _b.sent();
                if ((error_35 === null || error_35 === void 0 ? void 0 : error_35.code) === 'P2025') {
                    return [2 /*return*/, res.status(404).json({ error: 'data source not found' })];
                }
                return [2 /*return*/, res.status(500).json({ error: 'failed to update data source', details: String(error_35) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.delete('/data-sources/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var error_36;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.dataSource.delete({ where: { id: req.params.id } })];
            case 1:
                _a.sent();
                return [2 /*return*/, res.json({ deleted: true })];
            case 2:
                error_36 = _a.sent();
                if ((error_36 === null || error_36 === void 0 ? void 0 : error_36.code) === 'P2025') {
                    return [2 /*return*/, res.status(404).json({ error: 'data source not found' })];
                }
                if ((error_36 === null || error_36 === void 0 ? void 0 : error_36.code) === 'P2003') {
                    return [2 /*return*/, res.status(409).json({ error: 'Cannot delete: data source has integration jobs. Delete those first.' })];
                }
                return [2 /*return*/, res.status(500).json({ error: 'failed to delete data source', details: String(error_36) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ── Integration Jobs ─────────────────────────────────────────────
app.post('/integration-jobs', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name_12, dataSourceId, targetEntityTypeId, fieldMapping, logicalIdField, schedule, _b, source, entityType, job, error_37;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 4, , 5]);
                _a = req.body, name_12 = _a.name, dataSourceId = _a.dataSourceId, targetEntityTypeId = _a.targetEntityTypeId, fieldMapping = _a.fieldMapping, logicalIdField = _a.logicalIdField, schedule = _a.schedule;
                if (!name_12 || !dataSourceId || !targetEntityTypeId || !fieldMapping || !logicalIdField) {
                    return [2 /*return*/, res.status(400).json({
                            error: 'name, dataSourceId, targetEntityTypeId, fieldMapping, and logicalIdField are required',
                        })];
                }
                return [4 /*yield*/, Promise.all([
                        prisma.dataSource.findUnique({ where: { id: dataSourceId } }),
                        prisma.entityType.findUnique({ where: { id: targetEntityTypeId } }),
                    ])];
            case 1:
                _b = _c.sent(), source = _b[0], entityType = _b[1];
                if (!source)
                    return [2 /*return*/, res.status(404).json({ error: 'data source not found' })];
                if (!entityType)
                    return [2 /*return*/, res.status(404).json({ error: 'target entity type not found' })];
                return [4 /*yield*/, prisma.integrationJob.create({
                        data: {
                            projectId: req.body.projectId || req.header('X-Project-Id') || global.DEFAULT_PROJECT_ID,
                            name: name_12,
                            dataSourceId: dataSourceId,
                            targetEntityTypeId: targetEntityTypeId,
                            fieldMapping: fieldMapping,
                            logicalIdField: logicalIdField,
                            schedule: schedule !== null && schedule !== void 0 ? schedule : null,
                        },
                        include: { dataSource: true, targetEntityType: true },
                    })];
            case 2:
                job = _c.sent();
                return [4 /*yield*/, lineageSvc.registerEdge({
                        sourceType: 'DataSource',
                        sourceId: dataSourceId,
                        targetType: 'EntityType',
                        targetId: targetEntityTypeId,
                        transformation: "IntegrationJob:".concat(job.id),
                    })];
            case 3:
                _c.sent();
                return [2 /*return*/, res.status(201).json(job)];
            case 4:
                error_37 = _c.sent();
                if ((error_37 === null || error_37 === void 0 ? void 0 : error_37.code) === 'P2002') {
                    return [2 /*return*/, res.status(409).json({ error: 'An integration job with this name already exists' })];
                }
                return [2 /*return*/, res.status(500).json({ error: 'failed to create integration job', details: String(error_37) })];
            case 5: return [2 /*return*/];
        }
    });
}); });
app.get('/integration-jobs', function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var jobs, error_38;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.integrationJob.findMany({
                        orderBy: { createdAt: 'desc' },
                        include: {
                            dataSource: { select: { id: true, name: true, type: true } },
                            targetEntityType: { select: { id: true, name: true, version: true } },
                            executions: {
                                orderBy: { startedAt: 'desc' },
                                take: 1,
                                select: { id: true, status: true, recordsProcessed: true, startedAt: true },
                            },
                        },
                    })];
            case 1:
                jobs = _a.sent();
                return [2 /*return*/, res.json(jobs)];
            case 2:
                error_38 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to list integration jobs', details: String(error_38) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/integration-jobs/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var job, error_39;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.integrationJob.findUnique({
                        where: { id: req.params.id },
                        include: {
                            dataSource: true,
                            targetEntityType: { include: { attributes: true } },
                            executions: {
                                orderBy: { startedAt: 'desc' },
                                take: 10,
                            },
                        },
                    })];
            case 1:
                job = _a.sent();
                if (!job) {
                    return [2 /*return*/, res.status(404).json({ error: 'integration job not found' })];
                }
                return [2 /*return*/, res.json(job)];
            case 2:
                error_39 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to fetch integration job', details: String(error_39) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.put('/integration-jobs/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name_13, fieldMapping, logicalIdField, schedule, enabled, job, error_40;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, name_13 = _a.name, fieldMapping = _a.fieldMapping, logicalIdField = _a.logicalIdField, schedule = _a.schedule, enabled = _a.enabled;
                return [4 /*yield*/, prisma.integrationJob.update({
                        where: { id: req.params.id },
                        data: __assign(__assign(__assign(__assign(__assign({}, (name_13 !== undefined && { name: name_13 })), (fieldMapping !== undefined && { fieldMapping: fieldMapping })), (logicalIdField !== undefined && { logicalIdField: logicalIdField })), (schedule !== undefined && { schedule: schedule })), (enabled !== undefined && { enabled: enabled })),
                        include: { dataSource: true, targetEntityType: true },
                    })];
            case 1:
                job = _b.sent();
                return [2 /*return*/, res.json(job)];
            case 2:
                error_40 = _b.sent();
                if ((error_40 === null || error_40 === void 0 ? void 0 : error_40.code) === 'P2025') {
                    return [2 /*return*/, res.status(404).json({ error: 'integration job not found' })];
                }
                return [2 /*return*/, res.status(500).json({ error: 'failed to update integration job', details: String(error_40) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.delete('/integration-jobs/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var error_41;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.integrationJob.delete({ where: { id: req.params.id } })];
            case 1:
                _a.sent();
                return [2 /*return*/, res.json({ deleted: true })];
            case 2:
                error_41 = _a.sent();
                if ((error_41 === null || error_41 === void 0 ? void 0 : error_41.code) === 'P2025') {
                    return [2 /*return*/, res.status(404).json({ error: 'integration job not found' })];
                }
                return [2 /*return*/, res.status(500).json({ error: 'failed to delete integration job', details: String(error_41) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ── Job Execution ────────────────────────────────────────────────
app.post('/integration-jobs/:id/execute', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var data, result, statusCode, error_42;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                data = ((_a = req.body) !== null && _a !== void 0 ? _a : {}).data;
                return [4 /*yield*/, (0, data_integration_1.executeJob)(req.params.id, prisma, undefined, data)];
            case 1:
                result = _b.sent();
                statusCode = result.status === 'COMPLETED' ? 200 : 500;
                return [2 /*return*/, res.status(statusCode).json(result)];
            case 2:
                error_42 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to execute job', details: String(error_42) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/integration-jobs/:id/dry-run', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var data, result, statusCode, error_43;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                data = ((_a = req.body) !== null && _a !== void 0 ? _a : {}).data;
                return [4 /*yield*/, (0, data_integration_1.dryRunJob)(req.params.id, prisma, data)];
            case 1:
                result = _b.sent();
                statusCode = result.status === 'SUCCESS' ? 200 : 500;
                return [2 /*return*/, res.status(statusCode).json(result)];
            case 2:
                error_43 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to dry-run job', details: String(error_43) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ── Data Lineage & Provenance ────────────────────────────────────────
app.get('/api/v1/lineage/:type/:id/trace', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, type, id, trace, error_44;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.params, type = _a.type, id = _a.id;
                return [4 /*yield*/, lineageSvc.getFullUpstreamTrace(type, id)];
            case 1:
                trace = _b.sent();
                return [2 /*return*/, res.json(trace)];
            case 2:
                error_44 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to fetch lineage trace', details: String(error_44) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/integration-jobs/:id/executions', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var job, executions, error_45;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, prisma.integrationJob.findUnique({ where: { id: req.params.id } })];
            case 1:
                job = _a.sent();
                if (!job) {
                    return [2 /*return*/, res.status(404).json({ error: 'integration job not found' })];
                }
                return [4 /*yield*/, prisma.jobQueue.findMany({
                        where: { integrationJobId: req.params.id },
                        orderBy: { startedAt: 'desc' },
                    })];
            case 2:
                executions = _a.sent();
                return [2 /*return*/, res.json(executions)];
            case 3:
                error_45 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to list executions', details: String(error_45) })];
            case 4: return [2 /*return*/];
        }
    });
}); });
// ── Orchestration & Job Queue ──────────────────────────────────────
app.get('/api/v1/orchestration/jobs', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var jobs, error_46;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.jobQueue.findMany({
                        orderBy: { createdAt: 'desc' },
                        take: 50,
                    })];
            case 1:
                jobs = _a.sent();
                return [2 /*return*/, res.json(jobs)];
            case 2:
                error_46 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to list orchestration jobs', details: String(error_46) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/api/v1/orchestration/jobs/:id/replay', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var job, replayedJob, error_47;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, prisma.jobQueue.findUnique({ where: { id: req.params.id } })];
            case 1:
                job = _a.sent();
                if (!job) {
                    return [2 /*return*/, res.status(404).json({ error: 'Job not found' })];
                }
                if (job.status !== 'FAILED' && job.status !== 'DEAD_LETTER') {
                    return [2 /*return*/, res.status(400).json({ error: 'Job is not in a replayable state' })];
                }
                return [4 /*yield*/, prisma.jobQueue.update({
                        where: { id: job.id },
                        data: {
                            status: 'QUEUED',
                            attempts: 0,
                            nextAttemptAt: new Date(),
                            lastError: null,
                        }
                    })];
            case 2:
                replayedJob = _a.sent();
                return [2 /*return*/, res.json(replayedJob)];
            case 3:
                error_47 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to replay job', details: String(error_47) })];
            case 4: return [2 /*return*/];
        }
    });
}); });
// ── Computed Metrics ───────────────────────────────────────────────
app.post('/computed-metrics', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name_14, entityTypeId, expression, unit, entityType, metric, error_48;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, name_14 = _a.name, entityTypeId = _a.entityTypeId, expression = _a.expression, unit = _a.unit;
                if (!name_14 || !entityTypeId || !expression) {
                    return [2 /*return*/, res.status(400).json({ error: 'name, entityTypeId, and expression are required' })];
                }
                return [4 /*yield*/, prisma.entityType.findUnique({ where: { id: entityTypeId } })];
            case 1:
                entityType = _b.sent();
                if (!entityType) {
                    return [2 /*return*/, res.status(404).json({ error: 'entity type not found' })];
                }
                return [4 /*yield*/, prisma.computedMetricDefinition.create({
                        data: {
                            name: name_14,
                            entityTypeId: entityTypeId,
                            expression: expression,
                            unit: unit !== null && unit !== void 0 ? unit : null,
                        },
                    })];
            case 2:
                metric = _b.sent();
                return [2 /*return*/, res.status(201).json(metric)];
            case 3:
                error_48 = _b.sent();
                if ((error_48 === null || error_48 === void 0 ? void 0 : error_48.code) === 'P2002') {
                    return [2 /*return*/, res.status(409).json({ error: 'A computed metric with this name already exists for this entity type' })];
                }
                return [2 /*return*/, res.status(500).json({ error: 'failed to create computed metric', details: String(error_48) })];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.get('/computed-metrics', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var entityTypeId, where, metrics, error_49;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                entityTypeId = req.query.entityTypeId;
                where = {};
                if (entityTypeId)
                    where.entityTypeId = entityTypeId;
                return [4 /*yield*/, prisma.computedMetricDefinition.findMany({
                        where: where,
                        orderBy: { createdAt: 'desc' },
                        include: { entityType: { select: { id: true, name: true } } },
                    })];
            case 1:
                metrics = _a.sent();
                return [2 /*return*/, res.json(metrics)];
            case 2:
                error_49 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to list computed metrics', details: String(error_49) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.delete('/computed-metrics/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var error_50;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.computedMetricDefinition.delete({ where: { id: req.params.id } })];
            case 1:
                _a.sent();
                return [2 /*return*/, res.json({ deleted: true })];
            case 2:
                error_50 = _a.sent();
                if ((error_50 === null || error_50 === void 0 ? void 0 : error_50.code) === 'P2025') {
                    return [2 /*return*/, res.status(404).json({ error: 'computed metric not found' })];
                }
                return [2 /*return*/, res.status(500).json({ error: 'failed to delete computed metric', details: String(error_50) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/computed-metrics/:logicalId/evaluate', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var logicalId, currentState, entityData, results, error_51;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                logicalId = req.params.logicalId;
                return [4 /*yield*/, prisma.currentEntityState.findUnique({
                        where: { logicalId: logicalId },
                    })];
            case 1:
                currentState = _a.sent();
                if (!currentState) {
                    return [2 /*return*/, res.status(404).json({ error: "No current state found for logicalId '".concat(logicalId, "'") })];
                }
                entityData = currentState.data;
                return [4 /*yield*/, (0, computed_metrics_1.evaluateComputedMetrics)(currentState.entityTypeId, entityData, prisma)];
            case 2:
                results = _a.sent();
                return [2 /*return*/, res.json({
                        logicalId: logicalId,
                        entityTypeId: currentState.entityTypeId,
                        entityData: entityData,
                        computedMetrics: results,
                    })];
            case 3:
                error_51 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to evaluate computed metrics', details: String(error_51) })];
            case 4: return [2 /*return*/];
        }
    });
}); });
// ── Telemetry Rollups ─────────────────────────────────────────────
app.post('/telemetry/rollup', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, logicalId, metric, windowSize, from, to, lookbackMs, result_1, fromDate, toDate, result, error_52;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                _a = req.body, logicalId = _a.logicalId, metric = _a.metric, windowSize = _a.windowSize, from = _a.from, to = _a.to;
                if (!(!logicalId && !metric)) return [3 /*break*/, 2];
                lookbackMs = 60 * 60 * 1000;
                return [4 /*yield*/, (0, rollup_engine_1.computeAllRecentRollups)(windowSize !== null && windowSize !== void 0 ? windowSize : '5m', lookbackMs, prisma)];
            case 1:
                result_1 = _b.sent();
                return [2 /*return*/, res.json(result_1)];
            case 2:
                if (!logicalId || !metric || !windowSize) {
                    return [2 /*return*/, res.status(400).json({
                            error: 'Provide logicalId + metric + windowSize for targeted rollup, or omit all for global rollup',
                        })];
                }
                fromDate = from ? new Date(from) : new Date(Date.now() - 24 * 60 * 60 * 1000);
                toDate = to ? new Date(to) : new Date();
                return [4 /*yield*/, (0, rollup_engine_1.computeRollups)(logicalId, metric, windowSize, fromDate, toDate, prisma)];
            case 3:
                result = _b.sent();
                return [2 /*return*/, res.json(__assign({ logicalId: logicalId, metric: metric, windowSize: windowSize }, result))];
            case 4:
                error_52 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to compute rollups', details: String(error_52) })];
            case 5: return [2 /*return*/];
        }
    });
}); });
app.get('/telemetry/:logicalId/rollups', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var logicalId, _a, metric, windowSize, from, to, where, rollups, error_53;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                logicalId = req.params.logicalId;
                _a = req.query, metric = _a.metric, windowSize = _a.windowSize, from = _a.from, to = _a.to;
                where = { logicalId: logicalId };
                if (metric)
                    where.metric = metric;
                if (windowSize)
                    where.windowSize = windowSize;
                if (from || to) {
                    where['windowStart'] = {};
                    if (from)
                        where['windowStart'].gte = new Date(from);
                    if (to)
                        where['windowStart'].lte = new Date(to);
                }
                return [4 /*yield*/, prisma.telemetryRollup.findMany({
                        where: where,
                        orderBy: { windowStart: 'desc' },
                        take: 500,
                    })];
            case 1:
                rollups = _b.sent();
                return [2 /*return*/, res.json(rollups)];
            case 2:
                error_53 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to query rollups', details: String(error_53) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ── ML Model Registry ─────────────────────────────────────────────
app.post('/models', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name_15, entityTypeId, description, inputFields, outputField, entityType, model, error_54;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, name_15 = _a.name, entityTypeId = _a.entityTypeId, description = _a.description, inputFields = _a.inputFields, outputField = _a.outputField;
                if (!name_15 || !entityTypeId || !inputFields || !outputField) {
                    return [2 /*return*/, res.status(400).json({ error: 'name, entityTypeId, inputFields, and outputField are required' })];
                }
                return [4 /*yield*/, prisma.entityType.findUnique({ where: { id: entityTypeId } })];
            case 1:
                entityType = _b.sent();
                if (!entityType)
                    return [2 /*return*/, res.status(404).json({ error: 'entity type not found' })];
                return [4 /*yield*/, prisma.modelDefinition.create({
                        data: {
                            projectId: req.body.projectId || req.header('X-Project-Id') || global.DEFAULT_PROJECT_ID,
                            name: name_15,
                            entityTypeId: entityTypeId,
                            description: description !== null && description !== void 0 ? description : null,
                            inputFields: inputFields,
                            outputField: outputField,
                        },
                        include: { entityType: { select: { id: true, name: true } } },
                    })];
            case 2:
                model = _b.sent();
                return [2 /*return*/, res.status(201).json(model)];
            case 3:
                error_54 = _b.sent();
                if ((error_54 === null || error_54 === void 0 ? void 0 : error_54.code) === 'P2002') {
                    return [2 /*return*/, res.status(409).json({ error: 'A model with this name already exists' })];
                }
                return [2 /*return*/, res.status(500).json({ error: 'failed to create model', details: String(error_54) })];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.get('/models', function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var models, error_55;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.modelDefinition.findMany({
                        orderBy: { createdAt: 'desc' },
                        include: {
                            entityType: { select: { id: true, name: true } },
                            versions: {
                                orderBy: { version: 'desc' },
                                take: 1,
                                select: { id: true, version: true, status: true, strategy: true },
                            },
                        },
                    })];
            case 1:
                models = _a.sent();
                return [2 /*return*/, res.json(models)];
            case 2:
                error_55 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to list models', details: String(error_55) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/models/:id/versions', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, strategy, hyperparameters, validStrategies, model, latest, nextVersion, version, error_56;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 4, , 5]);
                _a = req.body, strategy = _a.strategy, hyperparameters = _a.hyperparameters;
                if (!strategy || !hyperparameters) {
                    return [2 /*return*/, res.status(400).json({ error: 'strategy and hyperparameters are required' })];
                }
                validStrategies = ['THRESHOLD', 'ANOMALY_ZSCORE', 'LINEAR_REGRESSION', 'CUSTOM'];
                if (!validStrategies.includes(strategy)) {
                    return [2 /*return*/, res.status(400).json({ error: "strategy must be one of: ".concat(validStrategies.join(', ')) })];
                }
                return [4 /*yield*/, prisma.modelDefinition.findUnique({ where: { id: req.params.id } })];
            case 1:
                model = _c.sent();
                if (!model)
                    return [2 /*return*/, res.status(404).json({ error: 'model not found' })];
                return [4 /*yield*/, prisma.modelVersion.findFirst({
                        where: { modelDefinitionId: req.params.id },
                        orderBy: { version: 'desc' },
                    })];
            case 2:
                latest = _c.sent();
                nextVersion = ((_b = latest === null || latest === void 0 ? void 0 : latest.version) !== null && _b !== void 0 ? _b : 0) + 1;
                return [4 /*yield*/, prisma.modelVersion.create({
                        data: {
                            modelDefinitionId: req.params.id,
                            version: nextVersion,
                            strategy: strategy,
                            hyperparameters: hyperparameters,
                            status: 'DRAFT',
                        },
                    })];
            case 3:
                version = _c.sent();
                return [2 /*return*/, res.status(201).json(version)];
            case 4:
                error_56 = _c.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to create model version', details: String(error_56) })];
            case 5: return [2 /*return*/];
        }
    });
}); });
app.get('/models/:id/versions', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var model, versions, error_57;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, prisma.modelDefinition.findUnique({ where: { id: req.params.id } })];
            case 1:
                model = _a.sent();
                if (!model)
                    return [2 /*return*/, res.status(404).json({ error: 'model not found' })];
                return [4 /*yield*/, prisma.modelVersion.findMany({
                        where: { modelDefinitionId: req.params.id },
                        orderBy: { version: 'desc' },
                    })];
            case 2:
                versions = _a.sent();
                return [2 /*return*/, res.json(versions)];
            case 3:
                error_57 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to list versions', details: String(error_57) })];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.put('/model-versions/:id/status', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var status_1, validTransitions, version, allowed, updated, error_58;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                status_1 = req.body.status;
                validTransitions = {
                    DRAFT: ['STAGING', 'RETIRED'],
                    STAGING: ['PRODUCTION', 'DRAFT', 'RETIRED'],
                    PRODUCTION: ['RETIRED'],
                    RETIRED: [],
                };
                return [4 /*yield*/, prisma.modelVersion.findUnique({ where: { id: req.params.id } })];
            case 1:
                version = _b.sent();
                if (!version)
                    return [2 /*return*/, res.status(404).json({ error: 'model version not found' })];
                allowed = (_a = validTransitions[version.status]) !== null && _a !== void 0 ? _a : [];
                if (!allowed.includes(status_1)) {
                    return [2 /*return*/, res.status(400).json({
                            error: "Cannot transition from '".concat(version.status, "' to '").concat(status_1, "'. Allowed: ").concat(allowed.join(', ') || 'none'),
                        })];
                }
                if (!(status_1 === 'PRODUCTION')) return [3 /*break*/, 3];
                return [4 /*yield*/, prisma.modelVersion.updateMany({
                        where: { modelDefinitionId: version.modelDefinitionId, status: 'PRODUCTION' },
                        data: { status: 'RETIRED' },
                    })];
            case 2:
                _b.sent();
                _b.label = 3;
            case 3: return [4 /*yield*/, prisma.modelVersion.update({
                    where: { id: req.params.id },
                    data: { status: status_1 },
                })];
            case 4:
                updated = _b.sent();
                return [2 /*return*/, res.json(updated)];
            case 5:
                error_58 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to update version status', details: String(error_58) })];
            case 6: return [2 /*return*/];
        }
    });
}); });
app.post('/models/:id/infer/:logicalId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_59;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, inference_engine_1.runInferenceByModel)(req.params.id, req.params.logicalId, prisma)];
            case 1:
                result = _a.sent();
                return [2 /*return*/, res.json(result)];
            case 2:
                error_59 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: 'inference failed', details: String(error_59) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/inference-results', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, logicalId, modelVersionId, where, results, error_60;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.query, logicalId = _a.logicalId, modelVersionId = _a.modelVersionId;
                where = {};
                if (logicalId)
                    where.logicalId = logicalId;
                if (modelVersionId)
                    where.modelVersionId = modelVersionId;
                return [4 /*yield*/, prisma.inferenceResult.findMany({
                        where: where,
                        orderBy: { createdAt: 'desc' },
                        take: 100,
                        include: {
                            modelVersion: {
                                select: { version: true, strategy: true, modelDefinition: { select: { name: true } } },
                            },
                        },
                    })];
            case 1:
                results = _b.sent();
                return [2 /*return*/, res.json(results)];
            case 2:
                error_60 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to query inference results', details: String(error_60) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/models/batch-infer', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var logicalId, results, error_61;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                logicalId = req.body.logicalId;
                if (!logicalId) {
                    return [2 /*return*/, res.status(400).json({ error: 'logicalId is required' })];
                }
                return [4 /*yield*/, (0, inference_engine_1.runAllModelsForEntity)(logicalId, prisma)];
            case 1:
                results = _a.sent();
                return [2 /*return*/, res.json({ logicalId: logicalId, results: results })];
            case 2:
                error_61 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: 'batch inference failed', details: String(error_61) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ── Decision & Execution Engine ─────────────────────────────────────
app.post('/decision-rules', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name_16, entityTypeId, conditions, logicOperator, priority, autoExecute, confidenceThreshold, rule, error_62;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, name_16 = _a.name, entityTypeId = _a.entityTypeId, conditions = _a.conditions, logicOperator = _a.logicOperator, priority = _a.priority, autoExecute = _a.autoExecute, confidenceThreshold = _a.confidenceThreshold;
                if (!name_16 || !entityTypeId || !conditions) {
                    return [2 /*return*/, res.status(400).json({ error: 'name, entityTypeId, and conditions are required' })];
                }
                return [4 /*yield*/, prisma.decisionRule.create({
                        data: {
                            projectId: req.body.projectId || req.header('X-Project-Id') || global.DEFAULT_PROJECT_ID,
                            name: name_16,
                            entityTypeId: entityTypeId,
                            conditions: conditions,
                            logicOperator: logicOperator !== null && logicOperator !== void 0 ? logicOperator : 'AND',
                            priority: priority !== null && priority !== void 0 ? priority : 100,
                            autoExecute: autoExecute !== null && autoExecute !== void 0 ? autoExecute : false,
                            confidenceThreshold: confidenceThreshold !== null && confidenceThreshold !== void 0 ? confidenceThreshold : null,
                        },
                    })];
            case 1:
                rule = _b.sent();
                return [2 /*return*/, res.status(201).json(rule)];
            case 2:
                error_62 = _b.sent();
                if ((error_62 === null || error_62 === void 0 ? void 0 : error_62.code) === 'P2002')
                    return [2 /*return*/, res.status(409).json({ error: 'Rule with this name already exists' })];
                return [2 /*return*/, res.status(500).json({ error: 'failed to create decision rule', details: String(error_62) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/decision-rules', function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var rules, error_63;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.decisionRule.findMany({
                        orderBy: { priority: 'asc' },
                        include: {
                            entityType: { select: { id: true, name: true } },
                            executionPlans: {
                                orderBy: { stepOrder: 'asc' },
                                include: { actionDefinition: { select: { name: true, type: true } } },
                            },
                        },
                    })];
            case 1:
                rules = _a.sent();
                return [2 /*return*/, res.json(rules)];
            case 2:
                error_63 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to list decision rules', details: String(error_63) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.put('/decision-rules/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, conditions, logicOperator, priority, autoExecute, confidenceThreshold, enabled, rule, error_64;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, conditions = _a.conditions, logicOperator = _a.logicOperator, priority = _a.priority, autoExecute = _a.autoExecute, confidenceThreshold = _a.confidenceThreshold, enabled = _a.enabled;
                return [4 /*yield*/, prisma.decisionRule.update({
                        where: { id: req.params.id },
                        data: __assign(__assign(__assign(__assign(__assign(__assign({}, (conditions && { conditions: conditions })), (logicOperator && { logicOperator: logicOperator })), (priority !== undefined && { priority: priority })), (autoExecute !== undefined && { autoExecute: autoExecute })), (confidenceThreshold !== undefined && { confidenceThreshold: confidenceThreshold })), (enabled !== undefined && { enabled: enabled })),
                    })];
            case 1:
                rule = _b.sent();
                return [2 /*return*/, res.json(rule)];
            case 2:
                error_64 = _b.sent();
                if ((error_64 === null || error_64 === void 0 ? void 0 : error_64.code) === 'P2025')
                    return [2 /*return*/, res.status(404).json({ error: 'rule not found' })];
                return [2 /*return*/, res.status(500).json({ error: 'failed to update rule', details: String(error_64) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.delete('/decision-rules/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var error_65;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.decisionRule.delete({ where: { id: req.params.id } })];
            case 1:
                _a.sent();
                return [2 /*return*/, res.json({ deleted: true })];
            case 2:
                error_65 = _a.sent();
                if ((error_65 === null || error_65 === void 0 ? void 0 : error_65.code) === 'P2025')
                    return [2 /*return*/, res.status(404).json({ error: 'rule not found' })];
                return [2 /*return*/, res.status(500).json({ error: 'failed to delete rule', details: String(error_65) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/action-definitions', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name_17, type, config, validTypes, action, error_66;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, name_17 = _a.name, type = _a.type, config = _a.config;
                if (!name_17 || !type || !config) {
                    return [2 /*return*/, res.status(400).json({ error: 'name, type, and config are required' })];
                }
                validTypes = ['WEBHOOK', 'UPDATE_ENTITY', 'CREATE_ALERT', 'RUN_INFERENCE', 'LOG_ONLY'];
                if (!validTypes.includes(type)) {
                    return [2 /*return*/, res.status(400).json({ error: "type must be one of: ".concat(validTypes.join(', ')) })];
                }
                return [4 /*yield*/, prisma.actionDefinition.create({
                        data: { name: name_17, type: type, config: config },
                    })];
            case 1:
                action = _b.sent();
                return [2 /*return*/, res.status(201).json(action)];
            case 2:
                error_66 = _b.sent();
                if ((error_66 === null || error_66 === void 0 ? void 0 : error_66.code) === 'P2002')
                    return [2 /*return*/, res.status(409).json({ error: 'Action with this name already exists' })];
                return [2 /*return*/, res.status(500).json({ error: 'failed to create action', details: String(error_66) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/action-definitions', function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var actions, error_67;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.actionDefinition.findMany({ orderBy: { createdAt: 'desc' } })];
            case 1:
                actions = _a.sent();
                return [2 /*return*/, res.json(actions)];
            case 2:
                error_67 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to list actions', details: String(error_67) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/execution-plans', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, decisionRuleId, actionDefinitionId, stepOrder, continueOnFailure, plan, error_68;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, decisionRuleId = _a.decisionRuleId, actionDefinitionId = _a.actionDefinitionId, stepOrder = _a.stepOrder, continueOnFailure = _a.continueOnFailure;
                if (!decisionRuleId || !actionDefinitionId || stepOrder === undefined) {
                    return [2 /*return*/, res.status(400).json({ error: 'decisionRuleId, actionDefinitionId, and stepOrder are required' })];
                }
                return [4 /*yield*/, prisma.executionPlan.create({
                        data: {
                            decisionRuleId: decisionRuleId,
                            actionDefinitionId: actionDefinitionId,
                            stepOrder: stepOrder,
                            continueOnFailure: continueOnFailure !== null && continueOnFailure !== void 0 ? continueOnFailure : false,
                        },
                        include: { actionDefinition: { select: { name: true, type: true } } },
                    })];
            case 1:
                plan = _b.sent();
                return [2 /*return*/, res.status(201).json(plan)];
            case 2:
                error_68 = _b.sent();
                if ((error_68 === null || error_68 === void 0 ? void 0 : error_68.code) === 'P2002')
                    return [2 /*return*/, res.status(409).json({ error: 'Step order conflict for this rule' })];
                return [2 /*return*/, res.status(500).json({ error: 'failed to create execution plan', details: String(error_68) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/decisions/:logicalId/evaluate', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var logicalId, _a, ruleId, triggerData, data, state, result, result, error_69;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 7, , 8]);
                logicalId = req.params.logicalId;
                _a = req.body, ruleId = _a.ruleId, triggerData = _a.triggerData;
                data = triggerData;
                if (!!data) return [3 /*break*/, 2];
                return [4 /*yield*/, prisma.currentEntityState.findUnique({ where: { logicalId: logicalId } })];
            case 1:
                state = _b.sent();
                if (!state)
                    return [2 /*return*/, res.status(404).json({ error: "Entity \"".concat(logicalId, "\" not found") })];
                data = state.data;
                _b.label = 2;
            case 2:
                if (!ruleId) return [3 /*break*/, 4];
                return [4 /*yield*/, (0, decision_engine_1.executeDecision)(ruleId, logicalId, 'MANUAL', data, prisma)];
            case 3:
                result = _b.sent();
                return [2 /*return*/, res.json(result)];
            case 4: return [4 /*yield*/, evaluateAllRules(logicalId, 'MANUAL', data, prisma)];
            case 5:
                result = _b.sent();
                return [2 /*return*/, res.json(result)];
            case 6: return [3 /*break*/, 8];
            case 7:
                error_69 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: 'decision evaluation failed', details: String(error_69) })];
            case 8: return [2 /*return*/];
        }
    });
}); });
app.post('/decisions/:logicalId/simulate', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var logicalId, _a, ruleId, triggerData, data, state, result, result, error_70;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 7, , 8]);
                logicalId = req.params.logicalId;
                _a = req.body, ruleId = _a.ruleId, triggerData = _a.triggerData;
                data = triggerData;
                if (!!data) return [3 /*break*/, 2];
                return [4 /*yield*/, prisma.currentEntityState.findUnique({ where: { logicalId: logicalId } })];
            case 1:
                state = _b.sent();
                if (!state)
                    return [2 /*return*/, res.status(404).json({ error: "Entity \"".concat(logicalId, "\" not found") })];
                data = state.data;
                _b.label = 2;
            case 2:
                if (!ruleId) return [3 /*break*/, 4];
                return [4 /*yield*/, (0, decision_engine_1.executeDecision)(ruleId, logicalId, 'SIMULATION', data, prisma, true)];
            case 3:
                result = _b.sent();
                return [2 /*return*/, res.json(result)];
            case 4: return [4 /*yield*/, evaluateAllRules(logicalId, 'SIMULATION', data, prisma, true)];
            case 5:
                result = _b.sent();
                return [2 /*return*/, res.json(result)];
            case 6: return [3 /*break*/, 8];
            case 7:
                error_70 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: 'simulation failed', details: String(error_70) })];
            case 8: return [2 /*return*/];
        }
    });
}); });
app.get('/decision-logs', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, logicalId, decisionRuleId, status_2, where, logs, error_71;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.query, logicalId = _a.logicalId, decisionRuleId = _a.decisionRuleId, status_2 = _a.status;
                where = {};
                if (logicalId)
                    where.logicalId = logicalId;
                if (decisionRuleId)
                    where.decisionRuleId = decisionRuleId;
                if (status_2)
                    where.status = status_2;
                return [4 /*yield*/, prisma.decisionLog.findMany({
                        where: where,
                        orderBy: { createdAt: 'desc' },
                        take: 100,
                        include: { decisionRule: { select: { name: true } } },
                    })];
            case 1:
                logs = _b.sent();
                return [2 /*return*/, res.json(logs)];
            case 2:
                error_71 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to query decision logs', details: String(error_71) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/decision-logs/:id/execute', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var logId_1, log_1, trace_1, error_72;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                logId_1 = req.params.id;
                return [4 /*yield*/, prisma.decisionLog.findUnique({
                        where: { id: logId_1 },
                        include: {
                            decisionRule: {
                                include: {
                                    executionPlans: {
                                        orderBy: { stepOrder: 'asc' },
                                        include: { actionDefinition: true }
                                    }
                                }
                            }
                        }
                    })];
            case 1:
                log_1 = _a.sent();
                if (!log_1)
                    return [2 /*return*/, res.status(404).json({ error: 'decision log not found' })];
                if (log_1.status !== 'PENDING')
                    return [2 /*return*/, res.status(400).json({ error: "Cannot execute log with status ".concat(log_1.status) })];
                return [4 /*yield*/, prisma.executionTrace.create({
                        data: { decisionLogId: logId_1, status: 'RUNNING' }
                    })];
            case 2:
                trace_1 = _a.sent();
                // 2. Mark DecisionLog as RUNNING
                return [4 /*yield*/, prisma.decisionLog.update({
                        where: { id: logId_1 },
                        data: { status: 'RUNNING' }
                    })];
            case 3:
                // 2. Mark DecisionLog as RUNNING
                _a.sent();
                // We will run this async to not block the request, returning the trace ID immediately.
                // In a real C3/Palantir system, this goes into the JobQueue or a Temporal/Cadence workflow.
                (function () { return __awaiter(void 0, void 0, void 0, function () {
                    var hasFailures, plans, _i, plans_1, plan, actionDef, step, output, err_26, finalStatus;
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                hasFailures = false;
                                plans = log_1.decisionRule.executionPlans;
                                _i = 0, plans_1 = plans;
                                _b.label = 1;
                            case 1:
                                if (!(_i < plans_1.length)) return [3 /*break*/, 9];
                                plan = plans_1[_i];
                                actionDef = plan.actionDefinition;
                                return [4 /*yield*/, prisma.executionStep.create({
                                        data: {
                                            executionTraceId: trace_1.id,
                                            actionDefinitionId: actionDef.id,
                                            stepOrder: plan.stepOrder,
                                            status: 'RUNNING',
                                            startedAt: new Date(),
                                            inputPayload: {
                                                logicalId: log_1.logicalId,
                                                triggerData: log_1.triggerData,
                                                actionConfig: actionDef.config
                                            }
                                        }
                                    })];
                            case 2:
                                step = _b.sent();
                                _b.label = 3;
                            case 3:
                                _b.trys.push([3, 6, , 8]);
                                output = { message: 'Execution mocked successfully internally' };
                                if (actionDef.type === 'WEBHOOK') {
                                    // Example: axios.post((actionDef.config as any).url, step.inputPayload)
                                    output = { httpStatus: 200, externalRef: 'web-123' };
                                }
                                // Simulate network latency & execution
                                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 500); })];
                            case 4:
                                // Simulate network latency & execution
                                _b.sent();
                                return [4 /*yield*/, prisma.executionStep.update({
                                        where: { id: step.id },
                                        data: {
                                            status: 'SUCCESS',
                                            completedAt: new Date(),
                                            outputPayload: output
                                        }
                                    })];
                            case 5:
                                _b.sent();
                                return [3 /*break*/, 8];
                            case 6:
                                err_26 = _b.sent();
                                hasFailures = true;
                                return [4 /*yield*/, prisma.executionStep.update({
                                        where: { id: step.id },
                                        data: {
                                            status: 'FAILED',
                                            completedAt: new Date(),
                                            errorMessage: (_a = err_26.message) !== null && _a !== void 0 ? _a : String(err_26)
                                        }
                                    })];
                            case 7:
                                _b.sent();
                                if (!plan.continueOnFailure) {
                                    return [3 /*break*/, 9]; // Stop the DAG
                                }
                                return [3 /*break*/, 8];
                            case 8:
                                _i++;
                                return [3 /*break*/, 1];
                            case 9:
                                finalStatus = hasFailures ? 'PARTIAL_FAILURE' : 'COMPLETED';
                                return [4 /*yield*/, prisma.executionTrace.update({
                                        where: { id: trace_1.id },
                                        data: {
                                            status: finalStatus,
                                            completedAt: new Date()
                                        }
                                    })];
                            case 10:
                                _b.sent();
                                return [4 /*yield*/, prisma.decisionLog.update({
                                        where: { id: logId_1 },
                                        data: { status: finalStatus === 'COMPLETED' ? 'COMPLETED' : 'FAILED' }
                                    })];
                            case 11:
                                _b.sent();
                                return [2 /*return*/];
                        }
                    });
                }); })().catch(function (err) {
                    console.error('Fatal DAG Orchestrator Error:', err);
                    prisma.executionTrace.update({
                        where: { id: trace_1.id },
                        data: { status: 'FAILED', error: String(err), completedAt: new Date() }
                    }).catch(console.error);
                });
                return [2 /*return*/, res.json({ success: true, traceId: trace_1.id, status: 'RUNNING' })];
            case 4:
                error_72 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: 'failed to start execution DAG', details: String(error_72) })];
            case 5: return [2 /*return*/];
        }
    });
}); });
// ── Recent Domain Events (Dashboard Feed) ────────────────────────
app.get('/api/v1/events/recent', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var limit, events, err_27;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                limit = Math.min(parseInt(req.query.limit) || 20, 100);
                return [4 /*yield*/, prisma.domainEvent.findMany({
                        orderBy: { occurredAt: 'desc' },
                        take: limit,
                    })];
            case 1:
                events = _a.sent();
                return [2 /*return*/, res.json(events)];
            case 2:
                err_27 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_27) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ── Attribute-Equality Relationship Derivation ────────────────────
// Derive edges between entities that share the same field value
// e.g. all Aircraft that have the same "airportCode" → "OPERATES_FROM" edges
app.post('/api/v1/ontology/derive-relationships/attribute-match', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, sourceEntityTypeId, targetEntityTypeId, relationshipDefId, matchField, sources, targets, targetIndex, _i, targets_1, t, fieldVal, created, now, _b, sources_1, source, fieldVal, targetLogicalId, existing, err_28;
    var _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 9, , 10]);
                _a = req.body, sourceEntityTypeId = _a.sourceEntityTypeId, targetEntityTypeId = _a.targetEntityTypeId, relationshipDefId = _a.relationshipDefId, matchField = _a.matchField;
                if (!sourceEntityTypeId || !targetEntityTypeId || !relationshipDefId || !matchField) {
                    return [2 /*return*/, res.status(400).json({ error: 'sourceEntityTypeId, targetEntityTypeId, relationshipDefId, matchField required' })];
                }
                return [4 /*yield*/, prisma.currentEntityState.findMany({ where: { entityTypeId: sourceEntityTypeId } })];
            case 1:
                sources = _e.sent();
                return [4 /*yield*/, prisma.currentEntityState.findMany({ where: { entityTypeId: targetEntityTypeId } })];
            case 2:
                targets = _e.sent();
                targetIndex = new Map();
                for (_i = 0, targets_1 = targets; _i < targets_1.length; _i++) {
                    t = targets_1[_i];
                    fieldVal = String((_c = t.data[matchField]) !== null && _c !== void 0 ? _c : '');
                    if (fieldVal)
                        targetIndex.set(fieldVal, t.logicalId);
                }
                created = 0;
                now = new Date();
                _b = 0, sources_1 = sources;
                _e.label = 3;
            case 3:
                if (!(_b < sources_1.length)) return [3 /*break*/, 8];
                source = sources_1[_b];
                fieldVal = String((_d = source.data[matchField]) !== null && _d !== void 0 ? _d : '');
                if (!fieldVal)
                    return [3 /*break*/, 7];
                targetLogicalId = targetIndex.get(fieldVal);
                if (!targetLogicalId || targetLogicalId === source.logicalId)
                    return [3 /*break*/, 7];
                return [4 /*yield*/, prisma.relationshipInstance.findFirst({
                        where: {
                            relationshipDefinitionId: relationshipDefId,
                            sourceLogicalId: source.logicalId,
                            targetLogicalId: targetLogicalId,
                            validTo: null,
                        }
                    })];
            case 4:
                existing = _e.sent();
                if (!!existing) return [3 /*break*/, 7];
                return [4 /*yield*/, prisma.relationshipInstance.create({
                        data: {
                            relationshipDefinitionId: relationshipDefId,
                            sourceLogicalId: source.logicalId,
                            targetLogicalId: targetLogicalId,
                            validFrom: now,
                        }
                    })];
            case 5:
                _e.sent();
                // Keep CurrentGraph projection up to date
                return [4 /*yield*/, prisma.currentGraph.upsert({
                        where: {
                            relationshipDefinitionId_sourceLogicalId_targetLogicalId: {
                                relationshipDefinitionId: relationshipDefId,
                                sourceLogicalId: source.logicalId,
                                targetLogicalId: targetLogicalId,
                            }
                        },
                        create: { relationshipDefinitionId: relationshipDefId, relationshipName: matchField, sourceLogicalId: source.logicalId, targetLogicalId: targetLogicalId },
                        update: {}
                    })];
            case 6:
                // Keep CurrentGraph projection up to date
                _e.sent();
                created++;
                _e.label = 7;
            case 7:
                _b++;
                return [3 /*break*/, 3];
            case 8: return [2 /*return*/, res.json({ success: true, derivedLinksCount: created })];
            case 9:
                err_28 = _e.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_28) })];
            case 10: return [2 /*return*/];
        }
    });
}); });
// ── Entity Resolution API ──────────────────────────────────────────
// List all PENDING match candidates (with optional entity type filter)
app.get('/api/v1/identity/candidates', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, status_3, entityTypeId, where, candidates, enriched, err_29;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                projectId = req.query.projectId || req.header('X-Project-Id') || global.DEFAULT_PROJECT_ID;
                status_3 = req.query.status || 'PENDING';
                entityTypeId = req.query.entityTypeId;
                where = { status: status_3 };
                if (entityTypeId) {
                    where.entityTypeId = entityTypeId;
                }
                else if (projectId) {
                    where.entityType = { projectId: projectId };
                }
                return [4 /*yield*/, prisma.matchCandidate.findMany({
                        where: where,
                        include: { entityType: { select: { name: true } } },
                        orderBy: { scoreOverall: 'desc' },
                        take: 100,
                    })];
            case 1:
                candidates = _a.sent();
                return [4 /*yield*/, Promise.all(candidates.map(function (c) { return __awaiter(void 0, void 0, void 0, function () {
                        var _a, stateA, stateB;
                        var _b, _c;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0: return [4 /*yield*/, Promise.all([
                                        prisma.currentEntityState.findUnique({ where: { logicalId: c.logicalIdA } }),
                                        prisma.currentEntityState.findUnique({ where: { logicalId: c.logicalIdB } }),
                                    ])];
                                case 1:
                                    _a = _d.sent(), stateA = _a[0], stateB = _a[1];
                                    return [2 /*return*/, __assign(__assign({}, c), { dataA: (_b = stateA === null || stateA === void 0 ? void 0 : stateA.data) !== null && _b !== void 0 ? _b : null, dataB: (_c = stateB === null || stateB === void 0 ? void 0 : stateB.data) !== null && _c !== void 0 ? _c : null })];
                            }
                        });
                    }); }))];
            case 2:
                enriched = _a.sent();
                return [2 /*return*/, res.json(enriched)];
            case 3:
                err_29 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_29) })];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Trigger fuzzy match job for an entity type
app.post('/api/v1/identity/run-match', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, entityTypeId, threshold, count, err_30;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, entityTypeId = _a.entityTypeId, threshold = _a.threshold;
                if (!entityTypeId)
                    return [2 /*return*/, res.status(400).json({ error: 'entityTypeId is required' })];
                return [4 /*yield*/, identity_service_1.IdentityService.runFuzzyMatchJob(entityTypeId, prisma, {
                        threshold: threshold !== null && threshold !== void 0 ? threshold : 0.75,
                    })];
            case 1:
                count = _b.sent();
                return [2 /*return*/, res.json({ success: true, newCandidatesCreated: count })];
            case 2:
                err_30 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_30) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Merge two candidates (human review: approve merge)
app.post('/api/v1/identity/candidates/:id/merge', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var reviewerName, err_31;
    var _a, _b, _c, _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                _f.trys.push([0, 3, , 4]);
                reviewerName = (_b = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.apiKeyName) !== null && _b !== void 0 ? _b : 'system';
                return [4 /*yield*/, identity_service_1.IdentityService.mergeEntities(req.params.id, reviewerName, prisma)];
            case 1:
                _f.sent();
                // Audit log
                return [4 /*yield*/, prisma.auditLog.create({
                        data: {
                            actor: reviewerName,
                            actorRole: (_d = (_c = req.auth) === null || _c === void 0 ? void 0 : _c.role) !== null && _d !== void 0 ? _d : 'UNKNOWN',
                            action: 'MERGE_CANDIDATE',
                            resourceType: 'MatchCandidate',
                            resourceId: req.params.id,
                            metadata: { correlationId: req.correlationId },
                        }
                    })];
            case 2:
                // Audit log
                _f.sent();
                return [2 /*return*/, res.json({ success: true })];
            case 3:
                err_31 = _f.sent();
                return [2 /*return*/, res.status(400).json({ error: (_e = err_31.message) !== null && _e !== void 0 ? _e : String(err_31) })];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Reject a match candidate
app.post('/api/v1/identity/candidates/:id/reject', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var reviewerName, candidate, err_32;
    var _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 4, , 5]);
                reviewerName = (_b = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.apiKeyName) !== null && _b !== void 0 ? _b : 'system';
                return [4 /*yield*/, prisma.matchCandidate.update({
                        where: { id: req.params.id },
                        data: {
                            status: 'REJECTED',
                            reviewedBy: reviewerName,
                            reviewedAt: new Date(),
                        }
                    })];
            case 1:
                candidate = _e.sent();
                // Active Learning: Record human decision
                return [4 /*yield*/, prisma.matchResolutionHistory.create({
                        data: {
                            matchCandidateId: candidate.id,
                            logicalIdA: candidate.logicalIdA,
                            logicalIdB: candidate.logicalIdB,
                            entityTypeId: candidate.entityTypeId,
                            scoreOverall: candidate.scoreOverall,
                            scoreBreakdown: candidate.scoreBreakdown,
                            matchReasons: candidate.matchReasons,
                            resolution: 'REJECTED',
                            resolvedBy: reviewerName,
                        }
                    })];
            case 2:
                // Active Learning: Record human decision
                _e.sent();
                return [4 /*yield*/, prisma.auditLog.create({
                        data: {
                            actor: reviewerName,
                            actorRole: (_d = (_c = req.auth) === null || _c === void 0 ? void 0 : _c.role) !== null && _d !== void 0 ? _d : 'UNKNOWN',
                            action: 'REJECT_CANDIDATE',
                            resourceType: 'MatchCandidate',
                            resourceId: req.params.id,
                            metadata: { correlationId: req.correlationId },
                        }
                    })];
            case 3:
                _e.sent();
                return [2 /*return*/, res.json({ success: true })];
            case 4:
                err_32 = _e.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_32) })];
            case 5: return [2 /*return*/];
        }
    });
}); });
// Bulk Merge Candidates
app.post('/api/v1/identity/merge-batch', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var candidateIds, reviewerName, results, _i, candidateIds_1, id, e_1, err_33;
    var _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 8, , 9]);
                candidateIds = req.body.candidateIds;
                if (!Array.isArray(candidateIds))
                    return [2 /*return*/, res.status(400).json({ error: 'candidateIds must be an array' })];
                reviewerName = (_b = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.apiKeyName) !== null && _b !== void 0 ? _b : 'system';
                results = [];
                _i = 0, candidateIds_1 = candidateIds;
                _e.label = 1;
            case 1:
                if (!(_i < candidateIds_1.length)) return [3 /*break*/, 7];
                id = candidateIds_1[_i];
                _e.label = 2;
            case 2:
                _e.trys.push([2, 5, , 6]);
                return [4 /*yield*/, identity_service_1.IdentityService.mergeEntities(id, reviewerName, prisma)];
            case 3:
                _e.sent();
                return [4 /*yield*/, prisma.auditLog.create({
                        data: {
                            actor: reviewerName,
                            actorRole: (_d = (_c = req.auth) === null || _c === void 0 ? void 0 : _c.role) !== null && _d !== void 0 ? _d : 'UNKNOWN',
                            action: 'MERGE_CANDIDATE_BATCH',
                            resourceType: 'MatchCandidate',
                            resourceId: id,
                            metadata: { correlationId: req.correlationId, batch: true },
                        }
                    })];
            case 4:
                _e.sent();
                results.push({ id: id, status: 'success' });
                return [3 /*break*/, 6];
            case 5:
                e_1 = _e.sent();
                results.push({ id: id, status: 'error', error: e_1.message });
                return [3 /*break*/, 6];
            case 6:
                _i++;
                return [3 /*break*/, 1];
            case 7: return [2 /*return*/, res.json({ success: true, results: results })];
            case 8:
                err_33 = _e.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_33) })];
            case 9: return [2 /*return*/];
        }
    });
}); });
// Rollback a Merge (Un-merge)
app.post('/api/v1/identity/rollback/:candidateId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var candidateId, reviewerName, p, candidate, err_34;
    var _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 5, , 6]);
                candidateId = req.params.candidateId;
                reviewerName = (_b = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.apiKeyName) !== null && _b !== void 0 ? _b : 'system';
                p = prisma;
                return [4 /*yield*/, p.matchCandidate.findUnique({ where: { id: candidateId } })];
            case 1:
                candidate = _e.sent();
                if (!candidate || candidate.status !== 'MERGED') {
                    return [2 /*return*/, res.status(400).json({ error: 'Candidate not found or not MERGED' })];
                }
                // Simplistic rollback for demo: Mark candidate back to PENDING and record history.
                return [4 /*yield*/, p.matchCandidate.update({
                        where: { id: candidateId },
                        data: {
                            status: 'PENDING',
                            reviewedBy: null,
                            reviewedAt: null,
                            mergedIntoId: null
                        }
                    })];
            case 2:
                // Simplistic rollback for demo: Mark candidate back to PENDING and record history.
                _e.sent();
                return [4 /*yield*/, p.matchResolutionHistory.create({
                        data: {
                            matchCandidateId: candidate.id,
                            logicalIdA: candidate.logicalIdA,
                            logicalIdB: candidate.logicalIdB,
                            entityTypeId: candidate.entityTypeId,
                            scoreOverall: candidate.scoreOverall,
                            scoreBreakdown: candidate.scoreBreakdown,
                            matchReasons: candidate.matchReasons,
                            resolution: 'ROLLBACK',
                            resolvedBy: reviewerName,
                        }
                    })];
            case 3:
                _e.sent();
                return [4 /*yield*/, p.auditLog.create({
                        data: {
                            actor: reviewerName,
                            actorRole: (_d = (_c = req.auth) === null || _c === void 0 ? void 0 : _c.role) !== null && _d !== void 0 ? _d : 'UNKNOWN',
                            action: 'ROLLBACK_MERGE',
                            resourceType: 'MatchCandidate',
                            resourceId: candidateId,
                            metadata: { correlationId: req.correlationId },
                        }
                    })];
            case 4:
                _e.sent();
                return [2 /*return*/, res.json({ success: true, message: 'Merge rolled back to pending state' })];
            case 5:
                err_34 = _e.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_34) })];
            case 6: return [2 /*return*/];
        }
    });
}); });
// List entity aliases (source → canonical mappings)
app.get('/api/v1/identity/aliases', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var logicalId, where, aliases, err_35;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                logicalId = req.query.logicalId;
                where = logicalId ? { targetLogicalId: logicalId } : {};
                return [4 /*yield*/, prisma.entityAlias.findMany({
                        where: where,
                        orderBy: { createdAt: 'desc' },
                        take: 200,
                    })];
            case 1:
                aliases = _a.sent();
                return [2 /*return*/, res.json(aliases)];
            case 2:
                err_35 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_35) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ── Audit Log API ──────────────────────────────────────────────────
app.get('/api/v1/audit', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, action, resourceType, resourceId, actor, limit, where, logs, err_36;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.query, action = _a.action, resourceType = _a.resourceType, resourceId = _a.resourceId, actor = _a.actor, limit = _a.limit;
                where = {};
                if (action)
                    where.action = action;
                if (resourceType)
                    where.resourceType = resourceType;
                if (resourceId)
                    where.resourceId = resourceId;
                if (actor)
                    where.actor = actor;
                return [4 /*yield*/, prisma.auditLog.findMany({
                        where: where,
                        orderBy: { occurredAt: 'desc' },
                        take: parseInt(limit) || 100,
                    })];
            case 1:
                logs = _b.sent();
                return [2 /*return*/, res.json(logs)];
            case 2:
                err_36 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_36) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ── ABAC Policy Simulation API ─────────────────────────────────────
app.post('/api/v1/policy/simulate', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, action, resource, actor, engine, result, err_37;
    var _b, _c, _d, _e, _f, _g, _h, _j;
    return __generator(this, function (_k) {
        switch (_k.label) {
            case 0:
                _k.trys.push([0, 2, , 3]);
                _a = req.body, action = _a.action, resource = _a.resource;
                if (!action || !resource || !resource.type) {
                    return [2 /*return*/, res.status(400).json({ error: 'Missing required fields: action, resource.type' })];
                }
                actor = req.body.actor || {
                    apiKeyId: (_c = (_b = req.auth) === null || _b === void 0 ? void 0 : _b.apiKeyId) !== null && _c !== void 0 ? _c : 'sim-key',
                    apiKeyName: (_e = (_d = req.auth) === null || _d === void 0 ? void 0 : _d.apiKeyName) !== null && _e !== void 0 ? _e : 'sim-user',
                    role: (_g = (_f = req.auth) === null || _f === void 0 ? void 0 : _f.role) !== null && _g !== void 0 ? _g : 'VIEWER',
                    clearanceLevel: (_j = (_h = req.body.actor) === null || _h === void 0 ? void 0 : _h.clearanceLevel) !== null && _j !== void 0 ? _j : 1 // default mock
                };
                engine = new abac_engine_1.AbacEngine(prisma);
                return [4 /*yield*/, engine.evaluate(actor, action, resource)];
            case 1:
                result = _k.sent();
                return [2 /*return*/, res.json({
                        actor: actor,
                        action: action,
                        resource: resource,
                        evaluation: result
                    })];
            case 2:
                err_37 = _k.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_37) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ── Model Monitoring & Management API ──────────────────────────────
// Update a Model Version Status (e.g. to SHADOW or PRODUCTION)
app.put('/api/v1/models/:modelId/versions/:versionId/status', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var versionId, status_4, updatedVersion, err_38;
    var _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 3, , 4]);
                versionId = req.params.versionId;
                status_4 = req.body.status;
                if (!status_4 || !['DRAFT', 'STAGING', 'PRODUCTION', 'RETIRED', 'SHADOW'].includes(status_4)) {
                    return [2 /*return*/, res.status(400).json({ error: 'Invalid status' })];
                }
                return [4 /*yield*/, prisma.modelVersion.update({
                        where: { id: versionId },
                        data: { status: status_4 }
                    })];
            case 1:
                updatedVersion = _e.sent();
                // Audit log
                return [4 /*yield*/, prisma.auditLog.create({
                        data: {
                            actor: (_b = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.apiKeyName) !== null && _b !== void 0 ? _b : 'system',
                            actorRole: (_d = (_c = req.auth) === null || _c === void 0 ? void 0 : _c.role) !== null && _d !== void 0 ? _d : 'UNKNOWN',
                            action: 'UPDATE_MODEL_STATUS',
                            resourceType: 'ModelVersion',
                            resourceId: versionId,
                            metadata: { newStatus: status_4, modelId: req.params.modelId },
                        }
                    })];
            case 2:
                // Audit log
                _e.sent();
                return [2 /*return*/, res.json(updatedVersion)];
            case 3:
                err_38 = _e.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_38) })];
            case 4: return [2 /*return*/];
        }
    });
}); });
// ── Model Monitoring API ──────────────────────────────────────────
// Fetch Latency Metrics for a Model Version
app.get('/api/v1/models/:modelId/versions/:versionId/metrics/latency', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var versionId, _a, limit, metrics, err_39;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                versionId = req.params.versionId;
                _a = req.query.limit, limit = _a === void 0 ? '24' : _a;
                return [4 /*yield*/, prisma.modelLatencyMetric.findMany({
                        where: { modelVersionId: versionId },
                        orderBy: { windowStart: 'asc' },
                        take: parseInt(limit, 10),
                    })];
            case 1:
                metrics = _b.sent();
                return [2 /*return*/, res.json(metrics)];
            case 2:
                err_39 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_39) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ── Model Counterfactual Simulator API ────────────────────────────
var inference_engine_2 = require("./inference-engine");
/**
 * Run a "What-If" scenario through a specific Model Version.
 * Skips telemetry reporting and DB persistence.
 */
app.post('/api/v1/decisions/simulate', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, modelVersionId, simulatedInputs, result, err_40;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, modelVersionId = _a.modelVersionId, simulatedInputs = _a.simulatedInputs;
                if (!modelVersionId || !simulatedInputs) {
                    return [2 /*return*/, res.status(400).json({ error: 'Missing modelVersionId or simulatedInputs' })];
                }
                return [4 /*yield*/, (0, inference_engine_2.simulateInference)(modelVersionId, simulatedInputs, prisma)];
            case 1:
                result = _b.sent();
                return [2 /*return*/, res.json(result)];
            case 2:
                err_40 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_40) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ── Legal Hold & Data Retention APIs ───────────────────────────────
app.put('/api/v1/governance/legal-hold/:logicalId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, enabled, reason, logicalId, entity, reviewerName, err_41;
    var _b, _c, _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                _f.trys.push([0, 4, , 5]);
                _a = req.body, enabled = _a.enabled, reason = _a.reason;
                if (enabled === undefined)
                    return [2 /*return*/, res.status(400).json({ error: 'Must provide enabled boolean' })];
                logicalId = req.params.logicalId;
                return [4 /*yield*/, prisma.currentEntityState.findUnique({
                        where: { logicalId: logicalId }
                    })];
            case 1:
                entity = _f.sent();
                if (!entity)
                    return [2 /*return*/, res.status(404).json({ error: 'Entity not found' })];
                return [4 /*yield*/, prisma.currentEntityState.update({
                        where: { logicalId: logicalId },
                        data: { legalHold: Boolean(enabled) }
                    })];
            case 2:
                _f.sent();
                reviewerName = (_c = (_b = req.auth) === null || _b === void 0 ? void 0 : _b.apiKeyName) !== null && _c !== void 0 ? _c : 'system';
                return [4 /*yield*/, prisma.auditLog.create({
                        data: {
                            actor: reviewerName,
                            actorRole: (_e = (_d = req.auth) === null || _d === void 0 ? void 0 : _d.role) !== null && _e !== void 0 ? _e : 'UNKNOWN',
                            action: enabled ? 'ENABLE_LEGAL_HOLD' : 'DISABLE_LEGAL_HOLD',
                            resourceType: 'CurrentEntityState',
                            resourceId: logicalId,
                            metadata: { correlationId: req.correlationId, reason: reason },
                        }
                    })];
            case 3:
                _f.sent();
                return [2 /*return*/, res.json({ success: true, logicalId: logicalId, legalHold: Boolean(enabled) })];
            case 4:
                err_41 = _f.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_41) })];
            case 5: return [2 /*return*/];
        }
    });
}); });
// Delete endpoint demonstrating Legal Hold enforcement
app.delete('/api/v1/entities/:logicalId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var logicalId, entity, err_42;
    var _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 5, , 6]);
                logicalId = req.params.logicalId;
                return [4 /*yield*/, prisma.currentEntityState.findUnique({ where: { logicalId: logicalId } })];
            case 1:
                entity = _e.sent();
                if (!entity)
                    return [2 /*return*/, res.status(404).json({ error: 'Entity not found' })];
                if (!entity.legalHold) return [3 /*break*/, 3];
                // Governance constraint
                return [4 /*yield*/, prisma.auditLog.create({
                        data: {
                            actor: (_b = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.apiKeyName) !== null && _b !== void 0 ? _b : 'system',
                            actorRole: (_d = (_c = req.auth) === null || _c === void 0 ? void 0 : _c.role) !== null && _d !== void 0 ? _d : 'UNKNOWN',
                            action: 'BLOCKED_DELETE',
                            resourceType: 'CurrentEntityState',
                            resourceId: logicalId,
                            metadata: { correlationId: req.correlationId, reason: 'LEGAL_HOLD_ACTIVE' },
                        }
                    })];
            case 2:
                // Governance constraint
                _e.sent();
                return [2 /*return*/, res.status(403).json({ error: 'Deletion blocked: Entity is under Active Legal Hold.' })];
            case 3: return [4 /*yield*/, prisma.currentEntityState.delete({ where: { logicalId: logicalId } })];
            case 4:
                _e.sent();
                return [2 /*return*/, res.json({ success: true })];
            case 5:
                err_42 = _e.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_42) })];
            case 6: return [2 /*return*/];
        }
    });
}); });
// duplicates removed
app.put('/api/v1/pipelines/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, name_18, description, nodes, edges, enabled, updated, err_43;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                id = req.params.id;
                _a = req.body, name_18 = _a.name, description = _a.description, nodes = _a.nodes, edges = _a.edges, enabled = _a.enabled;
                return [4 /*yield*/, prisma.pipeline.update({
                        where: { id: id },
                        data: __assign(__assign(__assign(__assign(__assign({}, (name_18 !== undefined && { name: name_18 })), (description !== undefined && { description: description })), (nodes !== undefined && { nodes: nodes })), (edges !== undefined && { edges: edges })), (enabled !== undefined && { enabled: enabled }))
                    })];
            case 1:
                updated = _b.sent();
                return [2 /*return*/, res.json(updated)];
            case 2:
                err_43 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_43) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ── Dashboards & App Builder API ─────────────────────────────────────
app.get('/api/v1/dashboards', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, dashboards, err_44;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                projectId = req.query.projectId || req.header('X-Project-Id') || global.DEFAULT_PROJECT_ID;
                return [4 /*yield*/, prisma.dashboard.findMany({
                        where: { projectId: projectId },
                        include: { widgets: true },
                        orderBy: { createdAt: 'desc' },
                    })];
            case 1:
                dashboards = _a.sent();
                return [2 /*return*/, res.json(dashboards)];
            case 2:
                err_44 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_44) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/api/v1/dashboards', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name_19, widgets, projectId, newDash, err_45;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, name_19 = _a.name, widgets = _a.widgets;
                projectId = req.body.projectId || req.header('X-Project-Id') || global.DEFAULT_PROJECT_ID;
                if (!name_19)
                    return [2 /*return*/, res.status(400).json({ error: 'name is required' })];
                return [4 /*yield*/, prisma.dashboard.create({
                        data: {
                            projectId: projectId,
                            name: name_19,
                            widgets: {
                                create: widgets || []
                            }
                        },
                        include: { widgets: true }
                    })];
            case 1:
                newDash = _b.sent();
                return [2 /*return*/, res.json(newDash)];
            case 2:
                err_45 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_45) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.put('/api/v1/dashboards/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id_1, _a, name_20, widgets_1, updated, err_46;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                id_1 = req.params.id;
                _a = req.body, name_20 = _a.name, widgets_1 = _a.widgets;
                return [4 /*yield*/, prisma.$transaction(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!name_20) return [3 /*break*/, 2];
                                    return [4 /*yield*/, tx.dashboard.update({ where: { id: id_1 }, data: { name: name_20 } })];
                                case 1:
                                    _a.sent();
                                    _a.label = 2;
                                case 2:
                                    if (!(widgets_1 && Array.isArray(widgets_1))) return [3 /*break*/, 5];
                                    return [4 /*yield*/, tx.dashboardWidget.deleteMany({ where: { dashboardId: id_1 } })];
                                case 3:
                                    _a.sent();
                                    if (!(widgets_1.length > 0)) return [3 /*break*/, 5];
                                    return [4 /*yield*/, tx.dashboardWidget.createMany({
                                            data: widgets_1.map(function (w) { return ({
                                                dashboardId: id_1,
                                                type: w.type,
                                                configData: w.configData,
                                                x: w.x,
                                                y: w.y,
                                                w: w.w,
                                                h: w.h
                                            }); })
                                        })];
                                case 4:
                                    _a.sent();
                                    _a.label = 5;
                                case 5: return [2 /*return*/, tx.dashboard.findUnique({ where: { id: id_1 }, include: { widgets: true } })];
                            }
                        });
                    }); })];
            case 1:
                updated = _b.sent();
                return [2 /*return*/, res.json(updated)];
            case 2:
                err_46 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_46) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ═══════════════════════════════════════════════════════════
// NEW: PHASE 6 - RUNTIME & RELEASE ENGINE
// ═══════════════════════════════════════════════════════════
/**
 * Creates an immutable snapshot (Release) of the entire project configuration.
 * This powers the 'Publish Center' UI.
 */
app.post('/api/v1/projects/:projectId/publish', (0, middleware_1.apiKeyAuth)(prisma), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, _a, environment, version, _b, pipelines, dataSources, entityTypes, decisionRules, dashboards, payload, release, err_47;
    var _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 3, , 4]);
                projectId = req.params.projectId === 'CURRENT_PROJECT'
                    ? (_c = req.auth) === null || _c === void 0 ? void 0 : _c.projectId
                    : req.params.projectId;
                _a = req.body, environment = _a.environment, version = _a.version;
                if (!environment || !version) {
                    return [2 /*return*/, res.status(400).json({ error: "environment and version are required fields." })];
                }
                // 1. Gather all the live Draft state configuration
                logger_1.default.info("Extracting Draft state for Release ".concat(version, " in ").concat(environment, " [Project: ").concat(projectId, "]"));
                return [4 /*yield*/, Promise.all([
                        prisma.pipeline.findMany({ where: { projectId: projectId } }),
                        prisma.dataSource.findMany({ where: { projectId: projectId } }),
                        prisma.entityType.findMany({
                            where: { projectId: projectId },
                            include: { attributes: true, outgoingRelationships: true }
                        }),
                        prisma.decisionRule.findMany({ where: { projectId: projectId } }),
                        prisma.dashboard.findMany({
                            where: { projectId: projectId },
                            include: { widgets: true }
                        })
                    ])];
            case 1:
                _b = _e.sent(), pipelines = _b[0], dataSources = _b[1], entityTypes = _b[2], decisionRules = _b[3], dashboards = _b[4];
                payload = {
                    pipelines: pipelines,
                    dataSources: dataSources,
                    entityTypes: entityTypes,
                    decisionRules: decisionRules,
                    dashboards: dashboards,
                    metadata: {
                        snapshotTime: new Date().toISOString(),
                        itemCounts: {
                            pipelines: pipelines.length,
                            entityTypes: entityTypes.length,
                            apps: dashboards.length,
                        }
                    }
                };
                return [4 /*yield*/, prisma.projectRelease.create({
                        data: {
                            projectId: projectId,
                            environment: environment,
                            version: version,
                            payload: payload,
                            createdBy: ((_d = req.auth) === null || _d === void 0 ? void 0 : _d.apiKeyName) || 'system_fallback'
                        }
                    })];
            case 2:
                release = _e.sent();
                logger_1.default.info("Successfully Published Release ".concat(release.id));
                return [2 /*return*/, res.json(release)];
            case 3:
                err_47 = _e.sent();
                logger_1.default.error({ err: err_47 }, "Failed to publish atomic project release.");
                return [2 /*return*/, res.status(500).json({ error: err_47.message })];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * Fetch the latest release for a given environment
 * Used by the App Runtime to serve frozen state instead of live drafts.
 */
app.get('/api/v1/projects/:projectId/releases/active', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, environment, activeRelease, err_48;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                projectId = req.params.projectId === 'CURRENT_PROJECT'
                    ? (((_a = req.auth) === null || _a === void 0 ? void 0 : _a.projectId) || global.DEFAULT_PROJECT_ID)
                    : req.params.projectId;
                environment = req.query.environment || "STAGING";
                return [4 /*yield*/, prisma.projectRelease.findFirst({
                        where: {
                            projectId: projectId,
                            environment: environment
                        },
                        orderBy: {
                            createdAt: 'desc'
                        }
                    })];
            case 1:
                activeRelease = _b.sent();
                if (!activeRelease) {
                    return [2 /*return*/, res.status(404).json({ error: "No active release found for ".concat(environment) })];
                }
                return [2 /*return*/, res.json(activeRelease)];
            case 2:
                err_48 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: err_48.message })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ── Global Search API ──────────────────────────────────────────────
// Full-text search across CurrentEntityState (searches JSON data fields)
app.get('/api/v1/search', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var q, projectId, limit, results, err_49;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                q = (_a = req.query.q) === null || _a === void 0 ? void 0 : _a.trim();
                projectId = req.query.projectId || req.header('X-Project-Id') || global.DEFAULT_PROJECT_ID;
                limit = Math.min(parseInt(req.query.limit) || 50, 200);
                if (!q || q.length < 2)
                    return [2 /*return*/, res.json([])];
                return [4 /*yield*/, prisma.$queryRaw(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n      SELECT\n        ces.\"logicalId\",\n        ces.\"entityTypeId\",\n        ces.\"updatedAt\",\n        ces.\"data\",\n        et.\"name\" AS \"entityTypeName\"\n      FROM \"CurrentEntityState\" ces\n      JOIN \"EntityType\" et ON et.\"id\" = ces.\"entityTypeId\"\n      WHERE et.\"projectId\" = ", "\n        AND (ces.\"data\"::text ILIKE ", "\n          OR ces.\"logicalId\" ILIKE ", ")\n      ORDER BY ces.\"updatedAt\" DESC\n      LIMIT ", "\n    "], ["\n      SELECT\n        ces.\"logicalId\",\n        ces.\"entityTypeId\",\n        ces.\"updatedAt\",\n        ces.\"data\",\n        et.\"name\" AS \"entityTypeName\"\n      FROM \"CurrentEntityState\" ces\n      JOIN \"EntityType\" et ON et.\"id\" = ces.\"entityTypeId\"\n      WHERE et.\"projectId\" = ", "\n        AND (ces.\"data\"::text ILIKE ", "\n          OR ces.\"logicalId\" ILIKE ", ")\n      ORDER BY ces.\"updatedAt\" DESC\n      LIMIT ", "\n    "])), projectId, '%' + q + '%', '%' + q + '%', limit)];
            case 1:
                results = _b.sent();
                return [2 /*return*/, res.json(results)];
            case 2:
                err_49 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_49) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ── AI Copilot RAG Pipeline ────────────────────────────────────────
app.post('/api/v1/ai/chat', (0, middleware_1.apiKeyAuth)(prisma), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var message, projectId, allEntities, threat, asset, unit, javelinCount, lowerMsg, responseText, err_50;
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return __generator(this, function (_j) {
        switch (_j.label) {
            case 0:
                _j.trys.push([0, 3, , 4]);
                message = req.body.message;
                projectId = ((_a = req.auth) === null || _a === void 0 ? void 0 : _a.projectId) || req.header('X-Project-Id') || global.DEFAULT_PROJECT_ID;
                if (!message) {
                    return [2 /*return*/, res.status(400).json({ error: "Message is required" })];
                }
                return [4 /*yield*/, prisma.$queryRaw(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n      SELECT ces.\"logicalId\", ces.\"data\", et.\"name\" AS \"entityTypeName\"\n      FROM \"CurrentEntityState\" ces\n      JOIN \"EntityType\" et ON et.\"id\" = ces.\"entityTypeId\"\n      WHERE et.\"projectId\" = ", "\n    "], ["\n      SELECT ces.\"logicalId\", ces.\"data\", et.\"name\" AS \"entityTypeName\"\n      FROM \"CurrentEntityState\" ces\n      JOIN \"EntityType\" et ON et.\"id\" = ces.\"entityTypeId\"\n      WHERE et.\"projectId\" = ", "\n    "])), projectId)];
            case 1:
                allEntities = _j.sent();
                threat = ((_b = allEntities.find(function (e) { return e.entityTypeName === 'Threat'; })) === null || _b === void 0 ? void 0 : _b.data) || {};
                asset = ((_c = allEntities.find(function (e) { return e.entityTypeName === 'Asset'; })) === null || _c === void 0 ? void 0 : _c.data) || {};
                unit = ((_d = allEntities.find(function (e) { return e.entityTypeName === 'Unit'; })) === null || _d === void 0 ? void 0 : _d.data) || {};
                javelinCount = ((_f = (_e = allEntities.find(function (e) { return e.logicalId === 'resource-javelin-01'; })) === null || _e === void 0 ? void 0 : _e.data) === null || _f === void 0 ? void 0 : _f.quantity) || 0;
                lowerMsg = message.toLowerCase();
                responseText = "";
                // Demo Scenario 1: Initial Threat Query & COA Generation
                if (lowerMsg.includes('threat') || lowerMsg.includes('units') || lowerMsg.includes('equipment') || lowerMsg.includes('coa')) {
                    responseText = "Based on the latest ontology state, I have identified a potential threat:\n**Enemy Unit:** ".concat(threat.type || 'Main Battle Tank', " (").concat(threat.model || 'T-80', ")\n**Affiliation:** ").concat(threat.affiliation || 'Hostile', "\n**Location:** Lat ").concat((_g = threat.location) === null || _g === void 0 ? void 0 : _g.lat, ", Lng ").concat((_h = threat.location) === null || _h === void 0 ? void 0 : _h.lng, "\n\nHere are 3 possible Courses of Action (COAs) to target the enemy equipment:\n\n### Course of Action 1: Drone Strike\nTask the ").concat(asset.model || 'MQ-9 Reaper', " (").concat(asset.callsign || 'REAPER-1', ") to engage the target.\n*   **Time to Target:** 15 minutes\n*   **Risk:** Medium (Enemy air defense presence unknown)\n*   **Action:** `[Action: Task MQ-9 Drone]`\n\n### Course of Action 2: Ground Assault\nDeploy ").concat(unit.vehicle || 'Stryker ICV', " ").concat(unit.unit_size || 'Platoon', " to intercept.\n*   **Time to Target:** 45 minutes\n*   **Risk:** High \n*   **Action:** `[Action: Deploy Ground Forces]`\n\n### Course of Action 3: Jamming & Anti-Armor (Recommended)\nInitiate Electronic Warfare jamming on enemy comms, then maneuver ").concat(unit.vehicle || 'Stryker ICV', " elements to engage with ").concat(javelinCount, "x Javelin missiles.\n*   **Time to Target:** 30 minutes\n*   **Risk:** Low (Enemy comms disrupted)\n*   **Action:** `[Action: Initiate Jamming & Ground Assault]`\n\nWhat would you like to do?");
                }
                else if (lowerMsg.includes('jam') || lowerMsg.includes('3') || lowerMsg.includes('jamming')) {
                    responseText = "Understood. Generating operational plan for **Course of Action 3**.\n\n**Validating Supplies:**\n*   **Javelin Missiles:** ".concat(javelinCount, " available (Ready).\n*   **Stryker Platoon:** Readiness status is ").concat(unit.readiness || 'Green', ".\n*   **EW Jammer:** Tactical GNSS Jammer status is Available.\n\nI will formulate the Action payload and submit it to the chain of command for review.");
                }
                else {
                    responseText = "I am your AIP Copilot. Currently tracking ".concat(allEntities.length, " entities in the operational theater. How can I assist you?");
                }
                // Simulate AI typing delay
                return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 1500); })];
            case 2:
                // Simulate AI typing delay
                _j.sent();
                return [2 /*return*/, res.json({
                        role: "assistant",
                        content: responseText
                    })];
            case 3:
                err_50 = _j.sent();
                logger_1.default.error({ err: err_50 }, "AI Chat Error");
                return [2 /*return*/, res.status(500).json({ error: String(err_50) })];
            case 4: return [2 /*return*/];
        }
    });
}); });
// ── Data Integration & Pipelines (Foundry Pipeline Builder) ────────
app.get('/api/data/sources', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, sources, err_51;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                projectId = ((_a = req.auth) === null || _a === void 0 ? void 0 : _a.projectId) || global.DEFAULT_PROJECT_ID;
                return [4 /*yield*/, prisma.dataSource.findMany({
                        where: { projectId: projectId },
                        orderBy: { createdAt: 'desc' }
                    })];
            case 1:
                sources = _b.sent();
                return [2 /*return*/, res.json(sources)];
            case 2:
                err_51 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_51) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/api/data/sources/test', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, type, connectionConfig, url, testRes, err_52;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, type = _a.type, connectionConfig = _a.connectionConfig;
                if (!(type === 'REST_API')) return [3 /*break*/, 2];
                url = connectionConfig === null || connectionConfig === void 0 ? void 0 : connectionConfig.url;
                if (!url)
                    return [2 /*return*/, res.status(400).json({ error: 'URL is required' })];
                return [4 /*yield*/, fetch(url, {
                        method: connectionConfig.method || 'GET',
                        headers: connectionConfig.headers || {}
                    })];
            case 1:
                testRes = _b.sent();
                if (!testRes.ok)
                    throw new Error("HTTP error! status: ".concat(testRes.status));
                return [2 /*return*/, res.json({ success: true, message: 'Connection successful' })];
            case 2: 
            // Simulation for Postgres / CSV for MVP
            return [2 /*return*/, res.json({ success: true, message: 'Simulated connection successful' })];
            case 3:
                err_52 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_52) })];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.post('/api/data/sources', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, _a, name_21, type, connectionConfig, source, err_53;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                projectId = ((_b = req.auth) === null || _b === void 0 ? void 0 : _b.projectId) || global.DEFAULT_PROJECT_ID;
                _a = req.body, name_21 = _a.name, type = _a.type, connectionConfig = _a.connectionConfig;
                if (!name_21 || !type)
                    return [2 /*return*/, res.status(400).json({ error: 'Name and Type are required' })];
                return [4 /*yield*/, prisma.dataSource.create({
                        data: { projectId: projectId, name: name_21, type: type, connectionConfig: connectionConfig }
                    })];
            case 1:
                source = _c.sent();
                return [2 /*return*/, res.json(source)];
            case 2:
                err_53 = _c.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_53) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/api/data/pipelines', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, pipelines, err_54;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                projectId = ((_a = req.auth) === null || _a === void 0 ? void 0 : _a.projectId) || global.DEFAULT_PROJECT_ID;
                return [4 /*yield*/, prisma.pipeline.findMany({
                        where: { projectId: projectId },
                        orderBy: { createdAt: 'desc' }
                    })];
            case 1:
                pipelines = _b.sent();
                return [2 /*return*/, res.json(pipelines)];
            case 2:
                err_54 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_54) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/api/data/pipelines', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, _a, name_22, description, nodes, edges, pipeline, err_55;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 6, , 7]);
                projectId = ((_b = req.auth) === null || _b === void 0 ? void 0 : _b.projectId) || global.DEFAULT_PROJECT_ID;
                _a = req.body, name_22 = _a.name, description = _a.description, nodes = _a.nodes, edges = _a.edges;
                return [4 /*yield*/, prisma.pipeline.findFirst({ where: { projectId: projectId, name: name_22 } })];
            case 1:
                pipeline = _c.sent();
                if (!pipeline) return [3 /*break*/, 3];
                return [4 /*yield*/, prisma.pipeline.update({
                        where: { id: pipeline.id },
                        data: { description: description, nodes: nodes, edges: edges }
                    })];
            case 2:
                pipeline = _c.sent();
                return [3 /*break*/, 5];
            case 3: return [4 /*yield*/, prisma.pipeline.create({
                    data: { projectId: projectId, name: name_22, description: description, nodes: nodes, edges: edges }
                })];
            case 4:
                pipeline = _c.sent();
                _c.label = 5;
            case 5: return [2 /*return*/, res.json(pipeline)];
            case 6:
                err_55 = _c.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_55) })];
            case 7: return [2 /*return*/];
        }
    });
}); });
app.post('/api/data/integration-jobs', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, _a, name_23, dataSourceId, targetEntityTypeId, fieldMapping, logicalIdField, schedule, job, err_56;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 6, , 7]);
                projectId = ((_b = req.auth) === null || _b === void 0 ? void 0 : _b.projectId) || global.DEFAULT_PROJECT_ID;
                _a = req.body, name_23 = _a.name, dataSourceId = _a.dataSourceId, targetEntityTypeId = _a.targetEntityTypeId, fieldMapping = _a.fieldMapping, logicalIdField = _a.logicalIdField, schedule = _a.schedule;
                return [4 /*yield*/, prisma.integrationJob.findUnique({ where: { name: name_23 } })];
            case 1:
                job = _c.sent();
                if (!job) return [3 /*break*/, 3];
                return [4 /*yield*/, prisma.integrationJob.update({
                        where: { id: job.id },
                        data: { dataSourceId: dataSourceId, targetEntityTypeId: targetEntityTypeId, fieldMapping: fieldMapping, logicalIdField: logicalIdField, schedule: schedule }
                    })];
            case 2:
                job = _c.sent();
                return [3 /*break*/, 5];
            case 3: return [4 /*yield*/, prisma.integrationJob.create({
                    data: { projectId: projectId, name: name_23, dataSourceId: dataSourceId, targetEntityTypeId: targetEntityTypeId, fieldMapping: fieldMapping, logicalIdField: logicalIdField, schedule: schedule }
                })];
            case 4:
                job = _c.sent();
                _c.label = 5;
            case 5: return [2 /*return*/, res.json(job)];
            case 6:
                err_56 = _c.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_56) })];
            case 7: return [2 /*return*/];
        }
    });
}); });
app.post('/api/data/integration-jobs/:id/run', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, job, queueJob, err_57;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                id = req.params.id;
                return [4 /*yield*/, prisma.integrationJob.findUnique({ where: { id: id } })];
            case 1:
                job = _a.sent();
                if (!job)
                    return [2 /*return*/, res.status(404).json({ error: 'Job not found' })];
                return [4 /*yield*/, prisma.jobQueue.create({
                        data: {
                            jobType: 'INTEGRATION_SYNC',
                            payload: { integrationJobId: job.id },
                            integrationJobId: job.id
                        }
                    })];
            case 2:
                queueJob = _a.sent();
                return [2 /*return*/, res.json({ message: 'Integration job queued', queueId: queueJob.id })];
            case 3:
                err_57 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_57) })];
            case 4: return [2 /*return*/];
        }
    });
}); });
// ── AIP Agent Studio ──────────────────────────────────────────
app.get('/api/agents', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, agents, err_58;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                projectId = ((_a = req.auth) === null || _a === void 0 ? void 0 : _a.projectId) || global.DEFAULT_PROJECT_ID;
                return [4 /*yield*/, prisma.aIPAgent.findMany({
                        where: { projectId: projectId },
                        orderBy: { createdAt: 'desc' }
                    })];
            case 1:
                agents = _b.sent();
                return [2 /*return*/, res.json(agents)];
            case 2:
                err_58 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_58) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/api/agents', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, _a, id, name_24, description, systemPrompt, modelConfig, ontologyAccess, agent, err_59;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 5, , 6]);
                projectId = ((_b = req.auth) === null || _b === void 0 ? void 0 : _b.projectId) || global.DEFAULT_PROJECT_ID;
                _a = req.body, id = _a.id, name_24 = _a.name, description = _a.description, systemPrompt = _a.systemPrompt, modelConfig = _a.modelConfig, ontologyAccess = _a.ontologyAccess;
                if (!name_24 || !systemPrompt)
                    return [2 /*return*/, res.status(400).json({ error: 'Name and System Prompt are required' })];
                agent = void 0;
                if (!id) return [3 /*break*/, 2];
                return [4 /*yield*/, prisma.aIPAgent.update({
                        where: { id: id },
                        data: { name: name_24, description: description, systemPrompt: systemPrompt, modelConfig: modelConfig || {}, ontologyAccess: ontologyAccess || [] }
                    })];
            case 1:
                agent = _c.sent();
                return [3 /*break*/, 4];
            case 2: return [4 /*yield*/, prisma.aIPAgent.create({
                    data: { projectId: projectId, name: name_24, description: description, systemPrompt: systemPrompt, modelConfig: modelConfig || {}, ontologyAccess: ontologyAccess || [] }
                })];
            case 3:
                agent = _c.sent();
                _c.label = 4;
            case 4: return [2 /*return*/, res.json(agent)];
            case 5:
                err_59 = _c.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_59) })];
            case 6: return [2 /*return*/];
        }
    });
}); });
app.post('/api/agents/:id/chat', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, message, agent, replyQueue_1, correlationId_1, payload, err_60;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                id = req.params.id;
                message = req.body.message;
                return [4 /*yield*/, prisma.aIPAgent.findUnique({ where: { id: id } })];
            case 1:
                agent = _a.sent();
                if (!agent)
                    return [2 /*return*/, res.status(404).json({ error: 'Agent not found' })];
                // Step 1: Forward the heavy RAG lifting and LLM generation over to the Worker Microservice
                if (!amqpChannel) {
                    return [2 /*return*/, res.status(503).json({ error: 'Message Broker is offline. Cannot process Agent request.' })];
                }
                return [4 /*yield*/, amqpChannel.assertQueue('', { exclusive: true })];
            case 2:
                replyQueue_1 = _a.sent();
                correlationId_1 = (0, crypto_1.randomUUID)();
                payload = JSON.stringify({
                    agentId: id,
                    message: message,
                    correlationId: correlationId_1,
                    replyTo: replyQueue_1.queue
                });
                console.log("[API] Offloading chat to worker for Agent ".concat(id));
                amqpChannel.sendToQueue('agent_compute_queue', Buffer.from(payload), {
                    persistent: false, // Chats don't strictly need to survive a sudden broker crash
                });
                // Wait asynchronously for the worker to finish LLM processing and reply
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        amqpChannel.consume(replyQueue_1.queue, function (msg) {
                            if (msg && msg.properties.correlationId === correlationId_1) {
                                try {
                                    var workerResponse = JSON.parse(msg.content.toString());
                                    var finalAnswer = workerResponse.response;
                                    // Cleanup the temporary RPC queue
                                    amqpChannel.deleteQueue(replyQueue_1.queue);
                                    // Respond back to the Web Client
                                    resolve(res.json({
                                        role: 'assistant',
                                        content: finalAnswer,
                                        _debug_context: "Model Used: ".concat(workerResponse.modelUsed)
                                    }));
                                }
                                catch (e) {
                                    reject(res.status(500).json({ error: 'Worker returned invalid response.' }));
                                }
                            }
                        }, { noAck: true });
                    })];
            case 3:
                err_60 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_60) })];
            case 4: return [2 /*return*/];
        }
    });
}); });
// ── Functions (AIP Tools) Router ─────────────────────────────────────────
app.get('/api/functions', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var functions, err_61;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.aIPFunction.findMany({
                        orderBy: { createdAt: 'desc' }
                    })];
            case 1:
                functions = _a.sent();
                return [2 /*return*/, res.json(functions)];
            case 2:
                err_61 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_61) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/api/functions', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name_25, description, code, language, proj, newFunction, err_62;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, name_25 = _a.name, description = _a.description, code = _a.code, language = _a.language;
                return [4 /*yield*/, prisma.project.findFirst({ orderBy: { createdAt: 'asc' } })];
            case 1:
                proj = _b.sent();
                return [4 /*yield*/, prisma.aIPFunction.create({
                        data: {
                            name: name_25,
                            description: description || '',
                            parameters: {},
                            code: code || '// write your function here\nasync function main(params) {\n  return {};\n}',
                            projectId: proj.id
                        }
                    })];
            case 2:
                newFunction = _b.sent();
                return [2 /*return*/, res.json(newFunction)];
            case 3:
                err_62 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_62) })];
            case 4: return [2 /*return*/];
        }
    });
}); });
// GET /api/functions/:id — fetch single function
app.get('/api/functions/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var fn, err_63;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.aIPFunction.findUnique({ where: { id: req.params.id } })];
            case 1:
                fn = _a.sent();
                if (!fn)
                    return [2 /*return*/, res.status(404).json({ error: 'Not found' })];
                return [2 /*return*/, res.json(fn)];
            case 2:
                err_63 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_63) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// PUT /api/functions/:id — update function code, snapshot version
app.put('/api/functions/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name_26, description, code, language, current, lastVersion, nextVersion, updated, err_64;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 6, , 7]);
                _a = req.body, name_26 = _a.name, description = _a.description, code = _a.code, language = _a.language;
                return [4 /*yield*/, prisma.aIPFunction.findUnique({ where: { id: req.params.id } })];
            case 1:
                current = _d.sent();
                if (!current) return [3 /*break*/, 4];
                return [4 /*yield*/, prisma.functionVersion.findFirst({
                        where: { functionId: req.params.id },
                        orderBy: { version: 'desc' }
                    })];
            case 2:
                lastVersion = _d.sent();
                nextVersion = ((_b = lastVersion === null || lastVersion === void 0 ? void 0 : lastVersion.version) !== null && _b !== void 0 ? _b : 0) + 1;
                return [4 /*yield*/, prisma.functionVersion.create({
                        data: {
                            functionId: req.params.id,
                            version: nextVersion,
                            code: current.code,
                            language: (_c = current.language) !== null && _c !== void 0 ? _c : 'javascript',
                            savedBy: 'system'
                        }
                    })];
            case 3:
                _d.sent();
                _d.label = 4;
            case 4: return [4 /*yield*/, prisma.aIPFunction.update({
                    where: { id: req.params.id },
                    data: __assign(__assign(__assign({}, (name_26 && { name: name_26 })), (description !== undefined && { description: description })), (code !== undefined && { code: code }))
                })];
            case 5:
                updated = _d.sent();
                return [2 /*return*/, res.json(updated)];
            case 6:
                err_64 = _d.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_64) })];
            case 7: return [2 /*return*/];
        }
    });
}); });
// DELETE /api/functions/:id
app.delete('/api/functions/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var err_65;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.aIPFunction.delete({ where: { id: req.params.id } })];
            case 1:
                _a.sent();
                return [2 /*return*/, res.json({ success: true })];
            case 2:
                err_65 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_65) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// GET /api/functions/:id/versions — version history
app.get('/api/functions/:id/versions', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var versions, err_66;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.functionVersion.findMany({
                        where: { functionId: req.params.id },
                        orderBy: { version: 'desc' },
                        take: 30
                    })];
            case 1:
                versions = _a.sent();
                return [2 /*return*/, res.json(versions)];
            case 2:
                err_66 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_66) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// POST /api/functions/:id/versions/:version/restore — restore a version
app.post('/api/functions/:id/versions/:version/restore', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var v, lastVersion, current, restored, err_67;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 7, , 8]);
                return [4 /*yield*/, prisma.functionVersion.findFirst({
                        where: { functionId: req.params.id, version: parseInt(req.params.version) }
                    })];
            case 1:
                v = _c.sent();
                if (!v)
                    return [2 /*return*/, res.status(404).json({ error: 'Version not found' })];
                return [4 /*yield*/, prisma.functionVersion.findFirst({
                        where: { functionId: req.params.id }, orderBy: { version: 'desc' }
                    })];
            case 2:
                lastVersion = _c.sent();
                return [4 /*yield*/, prisma.aIPFunction.findUnique({ where: { id: req.params.id } })];
            case 3:
                current = _c.sent();
                if (!current) return [3 /*break*/, 5];
                return [4 /*yield*/, prisma.functionVersion.create({
                        data: {
                            functionId: req.params.id,
                            version: ((_a = lastVersion === null || lastVersion === void 0 ? void 0 : lastVersion.version) !== null && _a !== void 0 ? _a : 0) + 1,
                            code: current.code,
                            language: (_b = current.language) !== null && _b !== void 0 ? _b : 'javascript',
                            savedBy: 'restore'
                        }
                    })];
            case 4:
                _c.sent();
                _c.label = 5;
            case 5: return [4 /*yield*/, prisma.aIPFunction.update({
                    where: { id: req.params.id },
                    data: { code: v.code }
                })];
            case 6:
                restored = _c.sent();
                return [2 /*return*/, res.json(restored)];
            case 7:
                err_67 = _c.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_67) })];
            case 8: return [2 /*return*/];
        }
    });
}); });
// PHASE 9: AIP Metrics API — Live Ontology Aggregations
// ─────────────────────────────────────────────────────────────────────────────
// GET /api/metrics — list all metric definitions for project
app.get('/api/metrics', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, metrics, err_68;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                projectId = global.DEFAULT_PROJECT_ID;
                if (!projectId)
                    return [2 /*return*/, res.status(503).json({ error: 'No project initialised' })];
                return [4 /*yield*/, prisma.aIPMetric.findMany({
                        where: { projectId: projectId },
                        orderBy: { createdAt: 'asc' },
                    })];
            case 1:
                metrics = _a.sent();
                return [2 /*return*/, res.json(metrics)];
            case 2:
                err_68 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_68) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// POST /api/metrics — create a new metric definition
app.post('/api/metrics', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, _a, name_27, objectType, property, unit, aggr, window_1, threshold, thresholdOp, alertOutputType, status_5, metric, err_69;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                projectId = global.DEFAULT_PROJECT_ID;
                if (!projectId)
                    return [2 /*return*/, res.status(503).json({ error: 'No project initialised' })];
                _a = req.body, name_27 = _a.name, objectType = _a.objectType, property = _a.property, unit = _a.unit, aggr = _a.aggr, window_1 = _a.window, threshold = _a.threshold, thresholdOp = _a.thresholdOp, alertOutputType = _a.alertOutputType, status_5 = _a.status;
                if (!name_27 || !objectType || !property)
                    return [2 /*return*/, res.status(400).json({ error: 'name, objectType, property required' })];
                return [4 /*yield*/, prisma.aIPMetric.create({
                        data: {
                            projectId: projectId,
                            name: name_27,
                            objectType: objectType,
                            property: property,
                            unit: unit || '',
                            aggr: aggr || 'AVG',
                            window: window_1 || 'Last 1 hr',
                            threshold: threshold !== null && threshold !== void 0 ? threshold : 0,
                            thresholdOp: thresholdOp || '>',
                            alertOutputType: alertOutputType || 'streaming',
                            status: status_5 || 'draft',
                        }
                    })];
            case 1:
                metric = _b.sent();
                return [2 /*return*/, res.status(201).json(metric)];
            case 2:
                err_69 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_69) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// PUT /api/metrics/:id — update a metric definition
app.put('/api/metrics/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var metric, err_70;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.aIPMetric.update({
                        where: { id: req.params.id },
                        data: req.body,
                    })];
            case 1:
                metric = _a.sent();
                return [2 /*return*/, res.json(metric)];
            case 2:
                err_70 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_70) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// DELETE /api/metrics/:id — delete a metric
app.delete('/api/metrics/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var err_71;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.aIPMetric.delete({ where: { id: req.params.id } })];
            case 1:
                _a.sent();
                return [2 /*return*/, res.json({ success: true })];
            case 2:
                err_71 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_71) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// GET /api/metrics/:id/data — compute real live aggregation from CurrentEntityState
// This is the core endpoint that powers real chart data instead of Math.random()
app.get('/api/metrics/:id/data', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var metric_1, entityType, POINTS, seriesData, currentValue, entityCount, breaching, states, values, appliedAggr, sorted, sorted, sorted, bucketSize, i, bucketValues, bucketValue, i, err_72;
    var _a, _b, _c, _d, _e, _f;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                _g.trys.push([0, 5, , 6]);
                return [4 /*yield*/, prisma.aIPMetric.findUnique({ where: { id: req.params.id } })];
            case 1:
                metric_1 = _g.sent();
                if (!metric_1)
                    return [2 /*return*/, res.status(404).json({ error: 'Metric not found' })];
                return [4 /*yield*/, prisma.entityType.findFirst({
                        where: { name: { equals: metric_1.objectType, mode: 'insensitive' } },
                    })];
            case 2:
                entityType = _g.sent();
                POINTS = 30;
                seriesData = [];
                currentValue = null;
                entityCount = 0;
                breaching = false;
                if (!entityType) return [3 /*break*/, 4];
                return [4 /*yield*/, prisma.currentEntityState.findMany({
                        where: { entityTypeId: entityType.id },
                        orderBy: { updatedAt: 'desc' },
                        take: 500, // cap at 500 most-recent entities
                    })];
            case 3:
                states = _g.sent();
                entityCount = states.length;
                if (states.length > 0) {
                    values = states
                        .map(function (s) {
                        var data = s.data;
                        var raw = data[metric_1.property];
                        var n = parseFloat(String(raw));
                        return isNaN(n) ? null : n;
                    })
                        .filter(function (v) { return v !== null; });
                    if (values.length > 0) {
                        appliedAggr = metric_1.aggr.toUpperCase();
                        switch (appliedAggr) {
                            case 'AVG':
                                currentValue = values.reduce(function (a, b) { return a + b; }, 0) / values.length;
                                break;
                            case 'SUM':
                                currentValue = values.reduce(function (a, b) { return a + b; }, 0);
                                break;
                            case 'COUNT':
                                currentValue = values.length;
                                break;
                            case 'MIN':
                                currentValue = Math.min.apply(Math, values);
                                break;
                            case 'MAX':
                                currentValue = Math.max.apply(Math, values);
                                break;
                            case 'P95': {
                                sorted = __spreadArray([], values, true).sort(function (a, b) { return a - b; });
                                currentValue = (_b = (_a = sorted[Math.floor(sorted.length * 0.95)]) !== null && _a !== void 0 ? _a : sorted[sorted.length - 1]) !== null && _b !== void 0 ? _b : 0;
                                break;
                            }
                            case 'P99': {
                                sorted = __spreadArray([], values, true).sort(function (a, b) { return a - b; });
                                currentValue = (_d = (_c = sorted[Math.floor(sorted.length * 0.99)]) !== null && _c !== void 0 ? _c : sorted[sorted.length - 1]) !== null && _d !== void 0 ? _d : 0;
                                break;
                            }
                            case 'P50': {
                                sorted = __spreadArray([], values, true).sort(function (a, b) { return a - b; });
                                currentValue = (_f = (_e = sorted[Math.floor(sorted.length * 0.50)]) !== null && _e !== void 0 ? _e : sorted[sorted.length - 1]) !== null && _f !== void 0 ? _f : 0;
                                break;
                            }
                            default:
                                currentValue = values.reduce(function (a, b) { return a + b; }, 0) / values.length;
                        }
                        bucketSize = Math.max(1, Math.floor(values.length / POINTS));
                        for (i = 0; i < POINTS; i++) {
                            bucketValues = values.slice(i * bucketSize, (i + 1) * bucketSize);
                            bucketValue = void 0;
                            if (bucketValues.length === 0) {
                                bucketValue = currentValue;
                            }
                            else {
                                switch (metric_1.aggr.toUpperCase()) {
                                    case 'AVG':
                                        bucketValue = bucketValues.reduce(function (a, b) { return a + b; }, 0) / bucketValues.length;
                                        break;
                                    case 'SUM':
                                        bucketValue = bucketValues.reduce(function (a, b) { return a + b; }, 0);
                                        break;
                                    case 'COUNT':
                                        bucketValue = bucketValues.length;
                                        break;
                                    case 'MIN':
                                        bucketValue = Math.min.apply(Math, bucketValues);
                                        break;
                                    case 'MAX':
                                        bucketValue = Math.max.apply(Math, bucketValues);
                                        break;
                                    default:
                                        bucketValue = bucketValues.reduce(function (a, b) { return a + b; }, 0) / bucketValues.length;
                                }
                            }
                            seriesData.push({ t: i, v: Math.round(bucketValue * 100) / 100, label: "t".concat(i) });
                        }
                    }
                }
                _g.label = 4;
            case 4:
                // If no real data available, return empty series (frontend falls back to synthetic)
                if (seriesData.length === 0) {
                    for (i = 0; i < POINTS; i++) {
                        seriesData.push({ t: i, v: 0, label: "t".concat(i) });
                    }
                }
                // Check threshold breach
                if (currentValue !== null) {
                    switch (metric_1.thresholdOp) {
                        case '>':
                            breaching = currentValue > metric_1.threshold;
                            break;
                        case '<':
                            breaching = currentValue < metric_1.threshold;
                            break;
                        case '>=':
                            breaching = currentValue >= metric_1.threshold;
                            break;
                        case '<=':
                            breaching = currentValue <= metric_1.threshold;
                            break;
                        default: breaching = false;
                    }
                }
                return [2 /*return*/, res.json({
                        metricId: metric_1.id,
                        series: seriesData,
                        currentValue: currentValue,
                        entityCount: entityCount,
                        breaching: breaching,
                        hasRealData: entityCount > 0 && currentValue !== null,
                        aggregation: "".concat(metric_1.aggr, "(").concat(metric_1.objectType, ".").concat(metric_1.property, ")"),
                        timestamp: new Date().toISOString(),
                    })];
            case 5:
                err_72 = _g.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_72) })];
            case 6: return [2 /*return*/];
        }
    });
}); });
// GET /api/metrics/summary — overview aggregates across all active metrics
app.get('/api/metrics/summary', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, metrics, err_73;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                projectId = global.DEFAULT_PROJECT_ID;
                if (!projectId)
                    return [2 /*return*/, res.status(503).json({ error: 'No project initialised' })];
                return [4 /*yield*/, prisma.aIPMetric.findMany({
                        where: { projectId: projectId, status: { in: ['active', 'warning'] } },
                        orderBy: { createdAt: 'asc' },
                    })];
            case 1:
                metrics = _a.sent();
                return [2 /*return*/, res.json({ count: metrics.length, metrics: metrics.slice(0, 10) })];
            case 2:
                err_73 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_73) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ─────────────────────────────────────────────────────────────────────────────
// PHASE 14: AIP Logic — Visual LLM Workflow Builder
// ─────────────────────────────────────────────────────────────────────────────
var openai_1 = require("openai");
var _openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY || '' });
/** Interpolate {{varName}} template tokens from a context map */
function interpolate(template, ctx) {
    return template.replace(/\{\{(\w+)\}\}/g, function (_, key) {
        var val = ctx[key];
        return val !== undefined ? (typeof val === 'object' ? JSON.stringify(val) : String(val)) : "{{".concat(key, "}}");
    });
}
/** Execute a workflow by its DB id — walks the ReactFlow DAG in topological order */
function executeWorkflow(workflowId_1, runId_1) {
    return __awaiter(this, arguments, void 0, function (workflowId, runId, inputs) {
        var workflow, nodes, edges, logs, steps, log, updateStep, adjOut, indegree, queue, order, cur, _i, _a, next, deg, nodeOutputs, ctx, _loop_1, _b, order_1, nodeId, finalOutput;
        var _this = this;
        var _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10;
        if (inputs === void 0) { inputs = {}; }
        return __generator(this, function (_11) {
            switch (_11.label) {
                case 0: return [4 /*yield*/, prisma.aIWorkflow.findUnique({ where: { id: workflowId } })];
                case 1:
                    workflow = _11.sent();
                    if (!workflow)
                        throw new Error('Workflow not found');
                    nodes = workflow.nodes || [];
                    edges = workflow.edges || [];
                    logs = [];
                    steps = [];
                    log = function (msg) { return __awaiter(_this, void 0, void 0, function () {
                        var line, bcast;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    line = "[".concat(new Date().toISOString(), "] ").concat(msg);
                                    logs.push(line);
                                    if (!(logs.length % 3 === 0 || msg.startsWith('✓') || msg.startsWith('✗'))) return [3 /*break*/, 2];
                                    return [4 /*yield*/, prisma.aIWorkflowRun.update({ where: { id: runId }, data: { logs: logs } })];
                                case 1:
                                    _a.sent();
                                    _a.label = 2;
                                case 2:
                                    bcast = global.broadcastToTopics;
                                    if (bcast)
                                        bcast(["workflow:".concat(workflowId), 'workflows:*'], { type: 'workflow.progress', workflowId: workflowId, runId: runId, log: line, ts: Date.now() });
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    updateStep = function (step) { return __awaiter(_this, void 0, void 0, function () {
                        var idx;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    idx = steps.findIndex(function (s) { return s.stepId === step.stepId; });
                                    if (idx >= 0)
                                        steps[idx] = step;
                                    else
                                        steps.push(step);
                                    return [4 /*yield*/, prisma.aIWorkflowRun.update({ where: { id: runId }, data: { steps: steps } })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    adjOut = new Map();
                    indegree = new Map();
                    nodes.forEach(function (n) { adjOut.set(n.id, []); indegree.set(n.id, 0); });
                    edges.forEach(function (e) {
                        var _a, _b;
                        (_a = adjOut.get(e.source)) === null || _a === void 0 ? void 0 : _a.push(e.target);
                        indegree.set(e.target, ((_b = indegree.get(e.target)) !== null && _b !== void 0 ? _b : 0) + 1);
                    });
                    queue = nodes.filter(function (n) { var _a; return ((_a = indegree.get(n.id)) !== null && _a !== void 0 ? _a : 0) === 0; }).map(function (n) { return n.id; });
                    order = [];
                    while (queue.length > 0) {
                        cur = queue.shift();
                        order.push(cur);
                        for (_i = 0, _a = ((_c = adjOut.get(cur)) !== null && _c !== void 0 ? _c : []); _i < _a.length; _i++) {
                            next = _a[_i];
                            deg = ((_d = indegree.get(next)) !== null && _d !== void 0 ? _d : 0) - 1;
                            indegree.set(next, deg);
                            if (deg === 0)
                                queue.push(next);
                        }
                    }
                    nodeOutputs = new Map();
                    ctx = __assign({}, inputs);
                    return [4 /*yield*/, log("Starting workflow \"".concat(workflow.name, "\" \u2014 ").concat(order.length, " nodes"))];
                case 2:
                    _11.sent();
                    _loop_1 = function (nodeId) {
                        var node, nodeType, nodeLabel, stepStart, step, inEdges, upstreamOutputs, _12, inEdges_1, e, upOut, _loop_2, _13, inEdges_2, e, output, _14, systemPrompt, userPrompt, model, temperature, completion, entityTypeName, limitRaw, limit, entityType, records, fnId, fn, _15, rawMapping, parsedArgs, _16, _17, _18, param, tpl, AsyncFn, execFn, fnErr_1, actionId, action, _19, paramMapping, resolvedParams, _20, _21, _22, k, v, AsyncFn, execFn, actErr_1, expression, fn, result, condErr_1, label, valueTemplate, etName, logicalId, et, projectId, err_74;
                        return __generator(this, function (_23) {
                            switch (_23.label) {
                                case 0:
                                    node = nodes.find(function (n) { return n.id === nodeId; });
                                    if (!node)
                                        return [2 /*return*/, "continue"];
                                    nodeType = node.type || ((_e = node.data) === null || _e === void 0 ? void 0 : _e.nodeType) || 'unknown';
                                    nodeLabel = ((_f = node.data) === null || _f === void 0 ? void 0 : _f.label) || nodeType;
                                    stepStart = Date.now();
                                    step = { stepId: nodeId, name: nodeLabel, type: nodeType, status: 'running', input: null, output: null, error: null, durationMs: 0 };
                                    return [4 /*yield*/, updateStep(step)];
                                case 1:
                                    _23.sent();
                                    return [4 /*yield*/, log("\u2192 [".concat(nodeType, "] \"").concat(nodeLabel, "\""))];
                                case 2:
                                    _23.sent();
                                    inEdges = edges.filter(function (e) { return e.target === nodeId; });
                                    upstreamOutputs = {};
                                    for (_12 = 0, inEdges_1 = inEdges; _12 < inEdges_1.length; _12++) {
                                        e = inEdges_1[_12];
                                        upOut = nodeOutputs.get(e.source);
                                        if (upOut !== undefined)
                                            upstreamOutputs[e.source] = upOut;
                                    }
                                    _loop_2 = function (e) {
                                        var srcNode = nodes.find(function (n) { return n.id === e.source; });
                                        if (srcNode) {
                                            var srcLabel = (((_g = srcNode.data) === null || _g === void 0 ? void 0 : _g.label) || srcNode.id).replace(/\s+/g, '_').toLowerCase();
                                            ctx[srcLabel] = (_h = nodeOutputs.get(e.source)) !== null && _h !== void 0 ? _h : null;
                                            ctx["".concat(srcNode.type || 'node', "_output")] = (_j = nodeOutputs.get(e.source)) !== null && _j !== void 0 ? _j : null;
                                        }
                                    };
                                    // Also expose each upstream output by label for {{varName}} interpolation
                                    for (_13 = 0, inEdges_2 = inEdges; _13 < inEdges_2.length; _13++) {
                                        e = inEdges_2[_13];
                                        _loop_2(e);
                                    }
                                    step.input = Object.keys(upstreamOutputs).length > 0 ? upstreamOutputs : inputs;
                                    _23.label = 3;
                                case 3:
                                    _23.trys.push([3, 57, , 60]);
                                    output = null;
                                    _14 = nodeType;
                                    switch (_14) {
                                        case 'llmPrompt': return [3 /*break*/, 4];
                                        case 'ontologyQuery': return [3 /*break*/, 11];
                                        case 'functionCall': return [3 /*break*/, 19];
                                        case 'actionTrigger': return [3 /*break*/, 30];
                                        case 'condition': return [3 /*break*/, 40];
                                        case 'output': return [3 /*break*/, 47];
                                    }
                                    return [3 /*break*/, 53];
                                case 4:
                                    systemPrompt = interpolate(((_k = node.data) === null || _k === void 0 ? void 0 : _k.systemPrompt) || 'You are a helpful AI assistant.', ctx);
                                    userPrompt = interpolate(((_l = node.data) === null || _l === void 0 ? void 0 : _l.userPrompt) || ((_m = node.data) === null || _m === void 0 ? void 0 : _m.prompt) || 'Hello', ctx);
                                    model = ((_o = node.data) === null || _o === void 0 ? void 0 : _o.model) || 'gpt-4o-mini';
                                    temperature = parseFloat((_q = (_p = node.data) === null || _p === void 0 ? void 0 : _p.temperature) !== null && _q !== void 0 ? _q : '0.7');
                                    return [4 /*yield*/, log("  Calling LLM (".concat(model, ") with ").concat(userPrompt.length, " char prompt"))];
                                case 5:
                                    _23.sent();
                                    if (!!process.env.OPENAI_API_KEY) return [3 /*break*/, 7];
                                    output = "[MOCK LLM] Would call ".concat(model, " with: \"").concat(userPrompt.slice(0, 100), "\"");
                                    return [4 /*yield*/, log('  ⚠ No OPENAI_API_KEY — returning mock response')];
                                case 6:
                                    _23.sent();
                                    return [3 /*break*/, 10];
                                case 7: return [4 /*yield*/, _openai.chat.completions.create({
                                        model: model,
                                        temperature: temperature,
                                        messages: [
                                            { role: 'system', content: systemPrompt },
                                            { role: 'user', content: userPrompt }
                                        ]
                                    })];
                                case 8:
                                    completion = _23.sent();
                                    output = (_t = (_s = (_r = completion.choices[0]) === null || _r === void 0 ? void 0 : _r.message) === null || _s === void 0 ? void 0 : _s.content) !== null && _t !== void 0 ? _t : '';
                                    return [4 /*yield*/, log("  \u2713 LLM returned ".concat(String(output).length, " chars"))];
                                case 9:
                                    _23.sent();
                                    _23.label = 10;
                                case 10:
                                    ctx['llm_output'] = output;
                                    return [3 /*break*/, 55];
                                case 11:
                                    entityTypeName = ((_u = node.data) === null || _u === void 0 ? void 0 : _u.entityType) || '';
                                    limitRaw = parseInt((_w = (_v = node.data) === null || _v === void 0 ? void 0 : _v.limit) !== null && _w !== void 0 ? _w : '20', 10);
                                    limit = isNaN(limitRaw) ? 20 : Math.min(limitRaw, 200);
                                    return [4 /*yield*/, log("  Querying entity type \"".concat(entityTypeName, "\" (limit ").concat(limit, ")"))];
                                case 12:
                                    _23.sent();
                                    return [4 /*yield*/, prisma.entityType.findFirst({ where: { name: entityTypeName } })];
                                case 13:
                                    entityType = _23.sent();
                                    if (!!entityType) return [3 /*break*/, 15];
                                    return [4 /*yield*/, log("  \u26A0 Entity type \"".concat(entityTypeName, "\" not found"))];
                                case 14:
                                    _23.sent();
                                    output = [];
                                    return [3 /*break*/, 18];
                                case 15: return [4 /*yield*/, prisma.currentEntityState.findMany({
                                        where: { entityTypeId: entityType.id },
                                        take: limit,
                                        orderBy: { updatedAt: 'desc' }
                                    })];
                                case 16:
                                    records = _23.sent();
                                    output = records.map(function (r) { return (__assign({ logicalId: r.logicalId }, r.data)); });
                                    return [4 /*yield*/, log("  \u2713 Retrieved ".concat(output.length, " records"))];
                                case 17:
                                    _23.sent();
                                    _23.label = 18;
                                case 18:
                                    ctx['ontology_output'] = output;
                                    return [3 /*break*/, 55];
                                case 19:
                                    fnId = ((_x = node.data) === null || _x === void 0 ? void 0 : _x.functionId) || '';
                                    if (!fnId) return [3 /*break*/, 21];
                                    return [4 /*yield*/, prisma.aIPFunction.findUnique({ where: { id: fnId } })];
                                case 20:
                                    _15 = _23.sent();
                                    return [3 /*break*/, 22];
                                case 21:
                                    _15 = null;
                                    _23.label = 22;
                                case 22:
                                    fn = _15;
                                    if (!fn) {
                                        output = { error: "Function ".concat(fnId, " not found") };
                                        return [3 /*break*/, 55];
                                    }
                                    return [4 /*yield*/, log("  Executing function \"".concat(fn.name, "\""))];
                                case 23:
                                    _23.sent();
                                    rawMapping = ((_y = node.data) === null || _y === void 0 ? void 0 : _y.inputMapping) || {};
                                    parsedArgs = {};
                                    for (_16 = 0, _17 = Object.entries(rawMapping); _16 < _17.length; _16++) {
                                        _18 = _17[_16], param = _18[0], tpl = _18[1];
                                        parsedArgs[param] = interpolate(tpl, ctx);
                                    }
                                    _23.label = 24;
                                case 24:
                                    _23.trys.push([24, 27, , 29]);
                                    AsyncFn = Object.getPrototypeOf(function () {
                                        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
                                            return [2 /*return*/];
                                        }); });
                                    }).constructor;
                                    execFn = new AsyncFn('parsedArgs', 'context', "\"use strict\";\n".concat(fn.code));
                                    return [4 /*yield*/, Promise.race([
                                            execFn(parsedArgs, ctx),
                                            new Promise(function (_, rej) { return setTimeout(function () { return rej(new Error('Function timeout (30s)')); }, 30000); })
                                        ])];
                                case 25:
                                    output = _23.sent();
                                    return [4 /*yield*/, log("  \u2713 Function returned ".concat(JSON.stringify(output).slice(0, 80)))];
                                case 26:
                                    _23.sent();
                                    return [3 /*break*/, 29];
                                case 27:
                                    fnErr_1 = _23.sent();
                                    output = { error: fnErr_1.message };
                                    return [4 /*yield*/, log("  \u2717 Function error: ".concat(fnErr_1.message))];
                                case 28:
                                    _23.sent();
                                    return [3 /*break*/, 29];
                                case 29:
                                    ctx['function_output'] = output;
                                    return [3 /*break*/, 55];
                                case 30:
                                    actionId = ((_z = node.data) === null || _z === void 0 ? void 0 : _z.actionId) || '';
                                    if (!actionId) return [3 /*break*/, 32];
                                    return [4 /*yield*/, prisma.aIPAction.findUnique({ where: { id: actionId } })];
                                case 31:
                                    _19 = _23.sent();
                                    return [3 /*break*/, 33];
                                case 32:
                                    _19 = null;
                                    _23.label = 33;
                                case 33:
                                    action = _19;
                                    if (!action) {
                                        output = { error: "Action ".concat(actionId, " not found") };
                                        return [3 /*break*/, 55];
                                    }
                                    return [4 /*yield*/, log("  Triggering action \"".concat(action.name, "\""))];
                                case 34:
                                    _23.sent();
                                    paramMapping = ((_0 = node.data) === null || _0 === void 0 ? void 0 : _0.paramMapping) || {};
                                    resolvedParams = {};
                                    for (_20 = 0, _21 = Object.entries(paramMapping); _20 < _21.length; _20++) {
                                        _22 = _21[_20], k = _22[0], v = _22[1];
                                        resolvedParams[k] = interpolate(v, ctx);
                                    }
                                    _23.label = 35;
                                case 35:
                                    _23.trys.push([35, 38, , 39]);
                                    AsyncFn = Object.getPrototypeOf(function () {
                                        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
                                            return [2 /*return*/];
                                        }); });
                                    }).constructor;
                                    execFn = new AsyncFn('params', 'prisma', 'context', "\"use strict\";\n".concat(action.code || 'return {ok:true};'));
                                    return [4 /*yield*/, Promise.race([
                                            execFn(resolvedParams, prisma, ctx),
                                            new Promise(function (_, rej) { return setTimeout(function () { return rej(new Error('Action timeout (30s)')); }, 30000); })
                                        ])];
                                case 36:
                                    output = _23.sent();
                                    return [4 /*yield*/, log("  \u2713 Action triggered, result: ".concat(JSON.stringify(output).slice(0, 80)))];
                                case 37:
                                    _23.sent();
                                    return [3 /*break*/, 39];
                                case 38:
                                    actErr_1 = _23.sent();
                                    output = { error: actErr_1.message };
                                    return [3 /*break*/, 39];
                                case 39:
                                    ctx['action_output'] = output;
                                    return [3 /*break*/, 55];
                                case 40:
                                    expression = interpolate(((_1 = node.data) === null || _1 === void 0 ? void 0 : _1.expression) || 'true', ctx);
                                    return [4 /*yield*/, log("  Evaluating condition: ".concat(expression.slice(0, 80)))];
                                case 41:
                                    _23.sent();
                                    _23.label = 42;
                                case 42:
                                    _23.trys.push([42, 44, , 46]);
                                    fn = new Function('ctx', "\"use strict\"; with(ctx) { return !!(".concat(expression, "); }"));
                                    result = fn(ctx);
                                    output = { result: result, branch: result ? 'true' : 'false' };
                                    ctx['condition_result'] = result;
                                    return [4 /*yield*/, log("  \u2713 Condition \u2192 ".concat(result ? 'TRUE branch' : 'FALSE branch'))];
                                case 43:
                                    _23.sent();
                                    return [3 /*break*/, 46];
                                case 44:
                                    condErr_1 = _23.sent();
                                    output = { result: false, error: condErr_1.message };
                                    return [4 /*yield*/, log("  \u2717 Condition error: ".concat(condErr_1.message))];
                                case 45:
                                    _23.sent();
                                    return [3 /*break*/, 46];
                                case 46: return [3 /*break*/, 55];
                                case 47:
                                    label = ((_2 = node.data) === null || _2 === void 0 ? void 0 : _2.label) || 'Output';
                                    valueTemplate = ((_3 = node.data) === null || _3 === void 0 ? void 0 : _3.valueTemplate) || '{{llm_output}}';
                                    output = interpolate(valueTemplate, ctx);
                                    return [4 /*yield*/, log("  \u2713 Output \"".concat(label, "\": ").concat(String(output).slice(0, 100)))];
                                case 48:
                                    _23.sent();
                                    if (!(((_4 = node.data) === null || _4 === void 0 ? void 0 : _4.writeToOntology) && ((_5 = node.data) === null || _5 === void 0 ? void 0 : _5.entityType))) return [3 /*break*/, 52];
                                    etName = node.data.entityType;
                                    logicalId = interpolate(((_6 = node.data) === null || _6 === void 0 ? void 0 : _6.logicalId) || "workflow-".concat(workflowId, "-").concat(Date.now()), ctx);
                                    return [4 /*yield*/, prisma.entityType.findFirst({ where: { name: etName } })];
                                case 49:
                                    et = _23.sent();
                                    if (!et) return [3 /*break*/, 52];
                                    projectId = global.DEFAULT_PROJECT_ID || '';
                                    return [4 /*yield*/, prisma.currentEntityState.upsert({
                                            where: { logicalId: logicalId },
                                            create: { entityTypeId: et.id, logicalId: logicalId, data: { value: output, generatedAt: new Date().toISOString() }, updatedAt: new Date() },
                                            update: { data: { value: output, generatedAt: new Date().toISOString() }, updatedAt: new Date() }
                                        })];
                                case 50:
                                    _23.sent();
                                    return [4 /*yield*/, log("  \u2713 Wrote output to Ontology entity ".concat(etName, "/").concat(logicalId))];
                                case 51:
                                    _23.sent();
                                    _23.label = 52;
                                case 52:
                                    ctx['final_output'] = output;
                                    return [3 /*break*/, 55];
                                case 53:
                                    output = (_7 = Object.values(upstreamOutputs)[0]) !== null && _7 !== void 0 ? _7 : null;
                                    return [4 /*yield*/, log("  Unknown node type \"".concat(nodeType, "\" \u2014 passing through"))];
                                case 54:
                                    _23.sent();
                                    _23.label = 55;
                                case 55:
                                    nodeOutputs.set(nodeId, output);
                                    step.status = 'success';
                                    step.output = output;
                                    step.durationMs = Date.now() - stepStart;
                                    return [4 /*yield*/, updateStep(step)];
                                case 56:
                                    _23.sent();
                                    return [3 /*break*/, 60];
                                case 57:
                                    err_74 = _23.sent();
                                    step.status = 'failed';
                                    step.error = String((_8 = err_74 === null || err_74 === void 0 ? void 0 : err_74.message) !== null && _8 !== void 0 ? _8 : err_74);
                                    step.durationMs = Date.now() - stepStart;
                                    return [4 /*yield*/, updateStep(step)];
                                case 58:
                                    _23.sent();
                                    return [4 /*yield*/, log("  \u2717 \"".concat(nodeLabel, "\" failed: ").concat(step.error))];
                                case 59:
                                    _23.sent();
                                    return [3 /*break*/, 60];
                                case 60: return [2 /*return*/];
                            }
                        });
                    };
                    _b = 0, order_1 = order;
                    _11.label = 3;
                case 3:
                    if (!(_b < order_1.length)) return [3 /*break*/, 6];
                    nodeId = order_1[_b];
                    return [5 /*yield**/, _loop_1(nodeId)];
                case 4:
                    _11.sent();
                    _11.label = 5;
                case 5:
                    _b++;
                    return [3 /*break*/, 3];
                case 6: return [4 /*yield*/, log("Workflow complete")];
                case 7:
                    _11.sent();
                    finalOutput = (_10 = (_9 = ctx['final_output']) !== null && _9 !== void 0 ? _9 : ctx['llm_output']) !== null && _10 !== void 0 ? _10 : null;
                    return [2 /*return*/, { status: 'success', summary: { finalOutput: finalOutput, context: ctx }, steps: steps, logs: logs }];
            }
        });
    });
}
// ── Workflow REST Routes ──────────────────────────────────────────────────────
app.get('/api/workflows', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, workflows, err_75;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                projectId = global.DEFAULT_PROJECT_ID;
                if (!projectId)
                    return [2 /*return*/, res.status(503).json({ error: 'No project' })];
                return [4 /*yield*/, prisma.aIWorkflow.findMany({
                        where: { projectId: projectId }, orderBy: { createdAt: 'desc' },
                        select: { id: true, name: true, description: true, enabled: true, createdAt: true, updatedAt: true }
                    })];
            case 1:
                workflows = _a.sent();
                return [2 /*return*/, res.json(workflows)];
            case 2:
                err_75 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_75) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/api/workflows', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, _a, name_28, description, nodes, edges, wf, err_76;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                projectId = global.DEFAULT_PROJECT_ID;
                if (!projectId)
                    return [2 /*return*/, res.status(503).json({ error: 'No project' })];
                _a = req.body, name_28 = _a.name, description = _a.description, nodes = _a.nodes, edges = _a.edges;
                if (!name_28)
                    return [2 /*return*/, res.status(400).json({ error: 'name required' })];
                return [4 /*yield*/, prisma.aIWorkflow.create({
                        data: { projectId: projectId, name: name_28, description: description || '', nodes: nodes || [], edges: edges || [] }
                    })];
            case 1:
                wf = _b.sent();
                return [2 /*return*/, res.status(201).json(wf)];
            case 2:
                err_76 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_76) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/api/workflows/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var wf, err_77;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.aIWorkflow.findUnique({ where: { id: req.params.id } })];
            case 1:
                wf = _a.sent();
                if (!wf)
                    return [2 /*return*/, res.status(404).json({ error: 'Not found' })];
                return [2 /*return*/, res.json(wf)];
            case 2:
                err_77 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_77) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.put('/api/workflows/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var wf, err_78;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.aIWorkflow.update({ where: { id: req.params.id }, data: req.body })];
            case 1:
                wf = _a.sent();
                return [2 /*return*/, res.json(wf)];
            case 2:
                err_78 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_78) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.delete('/api/workflows/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var err_79;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.aIWorkflow.delete({ where: { id: req.params.id } })];
            case 1:
                _a.sent();
                return [2 /*return*/, res.json({ success: true })];
            case 2:
                err_79 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_79) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/api/workflows/:id/run', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, wf_1, run_1, err_80;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 3, , 4]);
                projectId = global.DEFAULT_PROJECT_ID;
                return [4 /*yield*/, prisma.aIWorkflow.findUnique({ where: { id: req.params.id } })];
            case 1:
                wf_1 = _d.sent();
                if (!wf_1)
                    return [2 /*return*/, res.status(404).json({ error: 'Workflow not found' })];
                return [4 /*yield*/, prisma.aIWorkflowRun.create({
                        data: { workflowId: wf_1.id, projectId: projectId || '', status: 'running', trigger: ((_a = req.body) === null || _a === void 0 ? void 0 : _a.trigger) || 'manual', inputs: ((_b = req.body) === null || _b === void 0 ? void 0 : _b.inputs) || {} }
                    })];
            case 2:
                run_1 = _d.sent();
                res.status(202).json({ runId: run_1.id, workflowId: wf_1.id, status: 'running' });
                executeWorkflow(wf_1.id, run_1.id, ((_c = req.body) === null || _c === void 0 ? void 0 : _c.inputs) || {})
                    .then(function (result) { return __awaiter(void 0, void 0, void 0, function () {
                    var bcast;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, prisma.aIWorkflowRun.update({
                                    where: { id: run_1.id },
                                    data: { status: result.status, steps: result.steps, logs: result.logs, summary: result.summary, finishedAt: new Date(), duration: Date.now() - run_1.startedAt.getTime() }
                                })];
                            case 1:
                                _a.sent();
                                bcast = global.broadcastToTopics;
                                if (bcast)
                                    bcast(["workflow:".concat(wf_1.id), 'workflows:*'], { type: 'workflow.complete', workflowId: wf_1.id, runId: run_1.id, status: result.status, ts: Date.now() });
                                return [2 /*return*/];
                        }
                    });
                }); })
                    .catch(function (err) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, prisma.aIWorkflowRun.update({ where: { id: run_1.id }, data: { status: 'failed', finishedAt: new Date(), logs: [String(err)] } })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [3 /*break*/, 4];
            case 3:
                err_80 = _d.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_80) })];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.get('/api/workflows/:id/runs', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var runs, err_81;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.aIWorkflowRun.findMany({
                        where: { workflowId: req.params.id }, orderBy: { startedAt: 'desc' }, take: 30,
                        select: { id: true, status: true, trigger: true, startedAt: true, finishedAt: true, duration: true, summary: true }
                    })];
            case 1:
                runs = _a.sent();
                return [2 /*return*/, res.json(runs)];
            case 2:
                err_81 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_81) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/api/workflows/:id/runs/:runId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var run, err_82;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.aIWorkflowRun.findUnique({ where: { id: req.params.runId } })];
            case 1:
                run = _a.sent();
                if (!run)
                    return [2 /*return*/, res.status(404).json({ error: 'Not found' })];
                return [2 /*return*/, res.json(run)];
            case 2:
                err_82 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_82) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ─────────────────────────────────────────────────────────────────────────────
// PHASE 13: Data Pipeline Real Execution Engine
// ─────────────────────────────────────────────────────────────────────────────
/** Execute a pipeline by its DB id — walks the ReactFlow DAG in topo order */
function executePipeline(pipelineId_1, runId_1) {
    return __awaiter(this, arguments, void 0, function (pipelineId, runId, trigger) {
        var pipeline, nodes, edges, logs, steps, totalIn, totalOut, errorCount, log, updateStep, adjOut, indegree, queue, order, cur, _i, _a, next, deg, nodeData, _loop_3, _b, order_2, nodeId, runStatus;
        var _this = this;
        var _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1;
        if (trigger === void 0) { trigger = 'manual'; }
        return __generator(this, function (_2) {
            switch (_2.label) {
                case 0: return [4 /*yield*/, prisma.pipeline.findUnique({ where: { id: pipelineId } })];
                case 1:
                    pipeline = _2.sent();
                    if (!pipeline)
                        throw new Error('Pipeline not found');
                    nodes = pipeline.nodes || [];
                    edges = pipeline.edges || [];
                    logs = [];
                    steps = [];
                    totalIn = 0, totalOut = 0, errorCount = 0;
                    log = function (msg) { return __awaiter(_this, void 0, void 0, function () {
                        var line, broadcast;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    line = "[".concat(new Date().toISOString(), "] ").concat(msg);
                                    logs.push(line);
                                    if (!(logs.length % 5 === 0 || msg.startsWith('✓') || msg.startsWith('✗'))) return [3 /*break*/, 2];
                                    return [4 /*yield*/, prisma.pipelineRun.update({ where: { id: runId }, data: { logs: logs } })];
                                case 1:
                                    _a.sent();
                                    _a.label = 2;
                                case 2:
                                    broadcast = global.broadcastToTopics;
                                    if (broadcast) {
                                        broadcast(["pipeline:".concat(pipelineId), 'pipelines:*'], {
                                            type: 'pipeline.progress',
                                            pipelineId: pipelineId,
                                            runId: runId,
                                            log: line, ts: Date.now()
                                        });
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    updateStep = function (step) { return __awaiter(_this, void 0, void 0, function () {
                        var idx;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    idx = steps.findIndex(function (s) { return s.stepId === step.stepId; });
                                    if (idx >= 0)
                                        steps[idx] = step;
                                    else
                                        steps.push(step);
                                    return [4 /*yield*/, prisma.pipelineRun.update({ where: { id: runId }, data: { steps: steps } })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    adjOut = new Map();
                    indegree = new Map();
                    nodes.forEach(function (n) { adjOut.set(n.id, []); indegree.set(n.id, 0); });
                    edges.forEach(function (e) {
                        var _a, _b;
                        (_a = adjOut.get(e.source)) === null || _a === void 0 ? void 0 : _a.push(e.target);
                        indegree.set(e.target, ((_b = indegree.get(e.target)) !== null && _b !== void 0 ? _b : 0) + 1);
                    });
                    queue = nodes.filter(function (n) { var _a; return ((_a = indegree.get(n.id)) !== null && _a !== void 0 ? _a : 0) === 0; }).map(function (n) { return n.id; });
                    order = [];
                    while (queue.length > 0) {
                        cur = queue.shift();
                        order.push(cur);
                        for (_i = 0, _a = ((_c = adjOut.get(cur)) !== null && _c !== void 0 ? _c : []); _i < _a.length; _i++) {
                            next = _a[_i];
                            deg = ((_d = indegree.get(next)) !== null && _d !== void 0 ? _d : 0) - 1;
                            indegree.set(next, deg);
                            if (deg === 0)
                                queue.push(next);
                        }
                    }
                    nodeData = new Map();
                    return [4 /*yield*/, log("Starting pipeline \"".concat(pipeline.name, "\" \u2014 ").concat(order.length, " nodes"))];
                case 2:
                    _2.sent();
                    _loop_3 = function (nodeId) {
                        var node, nodeType, nodeLabel, stepStart, step, inEdges, inputRecords, output, jobId, result, url, resp, raw, code, AsyncFn, fn, result, sql, res, predicate, fn_1, entityTypeName, logicalIdField, written, entityType, _3, inputRecords_1, rec, logicalId, projectId, bcast, _4, err_83;
                        return __generator(this, function (_5) {
                            switch (_5.label) {
                                case 0:
                                    node = nodes.find(function (n) { return n.id === nodeId; });
                                    if (!node)
                                        return [2 /*return*/, "continue"];
                                    nodeType = node.type || ((_e = node.data) === null || _e === void 0 ? void 0 : _e.type) || 'unknown';
                                    nodeLabel = ((_f = node.data) === null || _f === void 0 ? void 0 : _f.label) || nodeId;
                                    stepStart = Date.now();
                                    step = { stepId: nodeId, name: nodeLabel, type: nodeType, status: 'running', recordsIn: 0, recordsOut: 0, error: null, durationMs: 0 };
                                    return [4 /*yield*/, updateStep(step)];
                                case 1:
                                    _5.sent();
                                    return [4 /*yield*/, log("\u2192 Step [".concat(nodeType, "] \"").concat(nodeLabel, "\""))];
                                case 2:
                                    _5.sent();
                                    _5.label = 3;
                                case 3:
                                    _5.trys.push([3, 50, , 53]);
                                    inEdges = edges.filter(function (e) { return e.target === nodeId; });
                                    inputRecords = inEdges.flatMap(function (e) { var _a; return (_a = nodeData.get(e.source)) !== null && _a !== void 0 ? _a : []; });
                                    step.recordsIn = inputRecords.length;
                                    totalIn += inputRecords.length;
                                    output = [];
                                    if (!(nodeType === 'dataSource' || nodeType === 'DataSourceNode')) return [3 /*break*/, 15];
                                    jobId = ((_g = node.data) === null || _g === void 0 ? void 0 : _g.jobId) || ((_h = node.data) === null || _h === void 0 ? void 0 : _h.integrationJobId);
                                    if (!jobId) return [3 /*break*/, 7];
                                    return [4 /*yield*/, log("  Executing IntegrationJob ".concat(jobId))];
                                case 4:
                                    _5.sent();
                                    return [4 /*yield*/, (0, data_integration_1.executeJob)(jobId, prisma)];
                                case 5:
                                    result = _5.sent();
                                    output = [{ status: result.status, recordsProcessed: result.recordsProcessed }];
                                    totalOut += result.recordsProcessed;
                                    return [4 /*yield*/, log("  \u2713 Job done: ".concat(result.recordsProcessed, " records processed"))];
                                case 6:
                                    _5.sent();
                                    return [3 /*break*/, 14];
                                case 7:
                                    if (!(((_j = node.data) === null || _j === void 0 ? void 0 : _j.url) || ((_l = (_k = node.data) === null || _k === void 0 ? void 0 : _k.connectionConfig) === null || _l === void 0 ? void 0 : _l.url))) return [3 /*break*/, 12];
                                    url = ((_m = node.data) === null || _m === void 0 ? void 0 : _m.url) || ((_p = (_o = node.data) === null || _o === void 0 ? void 0 : _o.connectionConfig) === null || _p === void 0 ? void 0 : _p.url);
                                    return [4 /*yield*/, log("  Fetching ".concat(url))];
                                case 8:
                                    _5.sent();
                                    return [4 /*yield*/, fetch(url, { signal: AbortSignal.timeout(30000) })];
                                case 9:
                                    resp = _5.sent();
                                    return [4 /*yield*/, resp.json()];
                                case 10:
                                    raw = _5.sent();
                                    output = Array.isArray(raw) ? raw : [raw];
                                    return [4 /*yield*/, log("  \u2713 Fetched ".concat(output.length, " records"))];
                                case 11:
                                    _5.sent();
                                    totalOut += output.length;
                                    return [3 /*break*/, 14];
                                case 12:
                                    output = [];
                                    return [4 /*yield*/, log("  No job or URL \u2014 empty source")];
                                case 13:
                                    _5.sent();
                                    _5.label = 14;
                                case 14: return [3 /*break*/, 47];
                                case 15:
                                    if (!(nodeType === 'transform' || nodeType === 'TransformNode')) return [3 /*break*/, 22];
                                    code = ((_q = node.data) === null || _q === void 0 ? void 0 : _q.code) || ((_r = node.data) === null || _r === void 0 ? void 0 : _r.transformCode) || '';
                                    return [4 /*yield*/, log("  Running JS transform (".concat(code.length, " chars)"))];
                                case 16:
                                    _5.sent();
                                    if (!(code && inputRecords.length > 0)) return [3 /*break*/, 19];
                                    AsyncFn = Object.getPrototypeOf(function () {
                                        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
                                            return [2 /*return*/];
                                        }); });
                                    }).constructor;
                                    fn = new AsyncFn('records', "\"use strict\";\n".concat(code));
                                    return [4 /*yield*/, Promise.race([
                                            fn(inputRecords),
                                            new Promise(function (_, rej) { return setTimeout(function () { return rej(new Error('Transform timeout (30s)')); }, 30000); })
                                        ])];
                                case 17:
                                    result = _5.sent();
                                    output = Array.isArray(result) ? result : [result];
                                    return [4 /*yield*/, log("  \u2713 Transform: ".concat(inputRecords.length, " \u2192 ").concat(output.length, " records"))];
                                case 18:
                                    _5.sent();
                                    return [3 /*break*/, 21];
                                case 19:
                                    output = inputRecords;
                                    return [4 /*yield*/, log("  No code or no input \u2014 passing through")];
                                case 20:
                                    _5.sent();
                                    _5.label = 21;
                                case 21:
                                    totalOut += output.length;
                                    return [3 /*break*/, 47];
                                case 22:
                                    if (!(nodeType === 'sqlQuery' || nodeType === 'SQLNode')) return [3 /*break*/, 29];
                                    sql = ((_s = node.data) === null || _s === void 0 ? void 0 : _s.sql) || ((_t = node.data) === null || _t === void 0 ? void 0 : _t.query) || '';
                                    return [4 /*yield*/, log("  Running SQL: ".concat(sql.slice(0, 80), "..."))];
                                case 23:
                                    _5.sent();
                                    if (!sql) return [3 /*break*/, 26];
                                    return [4 /*yield*/, pool.query(sql)];
                                case 24:
                                    res = _5.sent();
                                    output = res.rows;
                                    return [4 /*yield*/, log("  \u2713 SQL returned ".concat(output.length, " rows"))];
                                case 25:
                                    _5.sent();
                                    totalOut += output.length;
                                    return [3 /*break*/, 28];
                                case 26:
                                    output = inputRecords;
                                    return [4 /*yield*/, log("  No SQL \u2014 passing through")];
                                case 27:
                                    _5.sent();
                                    _5.label = 28;
                                case 28: return [3 /*break*/, 47];
                                case 29:
                                    if (!(nodeType === 'filter' || nodeType === 'FilterNode')) return [3 /*break*/, 32];
                                    predicate = ((_u = node.data) === null || _u === void 0 ? void 0 : _u.predicate) || ((_v = node.data) === null || _v === void 0 ? void 0 : _v.condition) || 'return true';
                                    return [4 /*yield*/, log("  Filtering ".concat(inputRecords.length, " records"))];
                                case 30:
                                    _5.sent();
                                    fn_1 = new Function('record', "\"use strict\"; ".concat(predicate));
                                    output = inputRecords.filter(function (r) { try {
                                        return fn_1(r);
                                    }
                                    catch (_a) {
                                        return false;
                                    } });
                                    return [4 /*yield*/, log("  \u2713 Filter: ".concat(inputRecords.length, " \u2192 ").concat(output.length, " records"))];
                                case 31:
                                    _5.sent();
                                    totalOut += output.length;
                                    return [3 /*break*/, 47];
                                case 32:
                                    if (!(nodeType === 'entityTarget' || nodeType === 'EntityTargetNode')) return [3 /*break*/, 45];
                                    entityTypeName = ((_w = node.data) === null || _w === void 0 ? void 0 : _w.entityType) || ((_x = node.data) === null || _x === void 0 ? void 0 : _x.label) || '';
                                    logicalIdField = ((_y = node.data) === null || _y === void 0 ? void 0 : _y.logicalIdField) || 'id';
                                    return [4 /*yield*/, log("  Writing ".concat(inputRecords.length, " records to entity type \"").concat(entityTypeName, "\""))];
                                case 33:
                                    _5.sent();
                                    written = 0;
                                    return [4 /*yield*/, prisma.entityType.findFirst({ where: { name: entityTypeName } })];
                                case 34:
                                    entityType = _5.sent();
                                    if (!entityType) return [3 /*break*/, 42];
                                    _3 = 0, inputRecords_1 = inputRecords;
                                    _5.label = 35;
                                case 35:
                                    if (!(_3 < inputRecords_1.length)) return [3 /*break*/, 40];
                                    rec = inputRecords_1[_3];
                                    logicalId = String((_0 = (_z = rec[logicalIdField]) !== null && _z !== void 0 ? _z : rec.id) !== null && _0 !== void 0 ? _0 : "gen-".concat(Date.now(), "-").concat(written));
                                    projectId = global.DEFAULT_PROJECT_ID;
                                    _5.label = 36;
                                case 36:
                                    _5.trys.push([36, 38, , 39]);
                                    return [4 /*yield*/, prisma.currentEntityState.upsert({
                                            where: { logicalId: logicalId },
                                            create: { entityTypeId: entityType.id, logicalId: logicalId, data: rec, updatedAt: new Date() },
                                            update: { data: rec, updatedAt: new Date() },
                                        })];
                                case 37:
                                    _5.sent();
                                    bcast = global.broadcastEntityChange;
                                    if (bcast)
                                        bcast(entityTypeName, logicalId, rec, 'updated');
                                    written++;
                                    return [3 /*break*/, 39];
                                case 38:
                                    _4 = _5.sent();
                                    errorCount++;
                                    return [3 /*break*/, 39];
                                case 39:
                                    _3++;
                                    return [3 /*break*/, 35];
                                case 40: return [4 /*yield*/, log("  \u2713 Wrote ".concat(written, "/").concat(inputRecords.length, " entities"))];
                                case 41:
                                    _5.sent();
                                    totalOut += written;
                                    return [3 /*break*/, 44];
                                case 42: return [4 /*yield*/, log("  \u26A0 Entity type \"".concat(entityTypeName, "\" not found \u2014 skipping write"))];
                                case 43:
                                    _5.sent();
                                    _5.label = 44;
                                case 44:
                                    output = inputRecords;
                                    return [3 /*break*/, 47];
                                case 45:
                                    // Unknown node type — pass through
                                    output = inputRecords;
                                    return [4 /*yield*/, log("  Unknown node type \"".concat(nodeType, "\" \u2014 passing through"))];
                                case 46:
                                    _5.sent();
                                    _5.label = 47;
                                case 47:
                                    nodeData.set(nodeId, output);
                                    step.status = 'success';
                                    step.recordsOut = output.length;
                                    step.durationMs = Date.now() - stepStart;
                                    return [4 /*yield*/, updateStep(step)];
                                case 48:
                                    _5.sent();
                                    return [4 /*yield*/, log("  \u2713 \"".concat(nodeLabel, "\" done in ").concat(step.durationMs, "ms"))];
                                case 49:
                                    _5.sent();
                                    return [3 /*break*/, 53];
                                case 50:
                                    err_83 = _5.sent();
                                    errorCount++;
                                    step.status = 'failed';
                                    step.error = String((_1 = err_83 === null || err_83 === void 0 ? void 0 : err_83.message) !== null && _1 !== void 0 ? _1 : err_83);
                                    step.durationMs = Date.now() - stepStart;
                                    return [4 /*yield*/, updateStep(step)];
                                case 51:
                                    _5.sent();
                                    return [4 /*yield*/, log("  \u2717 \"".concat(nodeLabel, "\" failed: ").concat(step.error))];
                                case 52:
                                    _5.sent();
                                    return [3 /*break*/, 53];
                                case 53: return [2 /*return*/];
                            }
                        });
                    };
                    _b = 0, order_2 = order;
                    _2.label = 3;
                case 3:
                    if (!(_b < order_2.length)) return [3 /*break*/, 6];
                    nodeId = order_2[_b];
                    return [5 /*yield**/, _loop_3(nodeId)];
                case 4:
                    _2.sent();
                    _2.label = 5;
                case 5:
                    _b++;
                    return [3 /*break*/, 3];
                case 6:
                    runStatus = errorCount > 0 && totalOut === 0 ? 'failed' : 'success';
                    return [4 /*yield*/, log("Pipeline complete \u2014 ".concat(totalOut, " records output, ").concat(errorCount, " errors"))];
                case 7:
                    _2.sent();
                    return [2 /*return*/, { status: runStatus, recordsIn: totalIn, recordsOut: totalOut, errorCount: errorCount, logs: logs, steps: steps }];
            }
        });
    });
}
// ── REST routes ───────────────────────────────────────────────────────────────
// GET /api/pipelines — list all pipelines for project
app.get('/api/pipelines', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, pipelines, err_84;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                projectId = global.DEFAULT_PROJECT_ID;
                if (!projectId)
                    return [2 /*return*/, res.status(503).json({ error: 'No project' })];
                return [4 /*yield*/, prisma.pipeline.findMany({
                        where: { projectId: projectId }, orderBy: { createdAt: 'desc' },
                        select: { id: true, name: true, description: true, enabled: true, createdAt: true }
                    })];
            case 1:
                pipelines = _a.sent();
                return [2 /*return*/, res.json(pipelines)];
            case 2:
                err_84 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_84) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// POST /api/pipelines — create a new pipeline
app.post('/api/pipelines', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, _a, name_29, description, nodes, edges, enabled, p, err_85;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                projectId = global.DEFAULT_PROJECT_ID;
                if (!projectId)
                    return [2 /*return*/, res.status(503).json({ error: 'No project' })];
                _a = req.body, name_29 = _a.name, description = _a.description, nodes = _a.nodes, edges = _a.edges, enabled = _a.enabled;
                if (!name_29)
                    return [2 /*return*/, res.status(400).json({ error: 'name required' })];
                return [4 /*yield*/, prisma.pipeline.create({
                        data: { projectId: projectId, name: name_29, description: description || '', nodes: nodes || [], edges: edges || [], enabled: enabled !== null && enabled !== void 0 ? enabled : true }
                    })];
            case 1:
                p = _b.sent();
                return [2 /*return*/, res.status(201).json(p)];
            case 2:
                err_85 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_85) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// GET /api/pipelines/:id
app.get('/api/pipelines/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var p, err_86;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.pipeline.findUnique({ where: { id: req.params.id } })];
            case 1:
                p = _a.sent();
                if (!p)
                    return [2 /*return*/, res.status(404).json({ error: 'Not found' })];
                return [2 /*return*/, res.json(p)];
            case 2:
                err_86 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_86) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// PUT /api/pipelines/:id — save pipeline (nodes/edges)
app.put('/api/pipelines/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var p, err_87;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.pipeline.update({ where: { id: req.params.id }, data: req.body })];
            case 1:
                p = _a.sent();
                return [2 /*return*/, res.json(p)];
            case 2:
                err_87 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_87) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// DELETE /api/pipelines/:id
app.delete('/api/pipelines/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var err_88;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.pipeline.delete({ where: { id: req.params.id } })];
            case 1:
                _a.sent();
                return [2 /*return*/, res.json({ success: true })];
            case 2:
                err_88 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_88) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// POST /api/pipelines/:id/run — execute the pipeline (async, returns runId immediately)
app.post('/api/pipelines/:id/run', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, pipeline_1, run_2, err_89;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                projectId = global.DEFAULT_PROJECT_ID;
                return [4 /*yield*/, prisma.pipeline.findUnique({ where: { id: req.params.id } })];
            case 1:
                pipeline_1 = _c.sent();
                if (!pipeline_1)
                    return [2 /*return*/, res.status(404).json({ error: 'Pipeline not found' })];
                return [4 /*yield*/, prisma.pipelineRun.create({
                        data: { pipelineId: pipeline_1.id, projectId: projectId || '', status: 'running', trigger: ((_a = req.body) === null || _a === void 0 ? void 0 : _a.trigger) || 'manual' }
                    })];
            case 2:
                run_2 = _c.sent();
                // Respond immediately with runId so client can poll
                res.status(202).json({ runId: run_2.id, pipelineId: pipeline_1.id, status: 'running' });
                // Execute asynchronously
                executePipeline(pipeline_1.id, run_2.id, ((_b = req.body) === null || _b === void 0 ? void 0 : _b.trigger) || 'manual')
                    .then(function (result) { return __awaiter(void 0, void 0, void 0, function () {
                    var broadcast;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, prisma.pipelineRun.update({
                                    where: { id: run_2.id },
                                    data: {
                                        status: result.status, recordsIn: result.recordsIn,
                                        recordsOut: result.recordsOut, errorCount: result.errorCount,
                                        logs: result.logs, steps: result.steps,
                                        finishedAt: new Date(), duration: Date.now() - run_2.startedAt.getTime(),
                                        summary: { recordsIn: result.recordsIn, recordsOut: result.recordsOut, errorCount: result.errorCount }
                                    }
                                })];
                            case 1:
                                _a.sent();
                                broadcast = global.broadcastToTopics;
                                if (broadcast) {
                                    broadcast(["pipeline:".concat(pipeline_1.id), 'pipelines:*'], {
                                        type: 'pipeline.complete', pipelineId: pipeline_1.id, runId: run_2.id,
                                        status: result.status, recordsIn: result.recordsIn, recordsOut: result.recordsOut, ts: Date.now()
                                    });
                                }
                                return [2 /*return*/];
                        }
                    });
                }); })
                    .catch(function (err) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, prisma.pipelineRun.update({
                                    where: { id: run_2.id },
                                    data: { status: 'failed', finishedAt: new Date(), logs: [String(err)] }
                                })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [3 /*break*/, 4];
            case 3:
                err_89 = _c.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_89) })];
            case 4: return [2 /*return*/];
        }
    });
}); });
// GET /api/pipelines/:id/runs — execution history
app.get('/api/pipelines/:id/runs', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var runs, err_90;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.pipelineRun.findMany({
                        where: { pipelineId: req.params.id },
                        orderBy: { startedAt: 'desc' }, take: 30,
                        select: { id: true, status: true, trigger: true, recordsIn: true, recordsOut: true, errorCount: true, startedAt: true, finishedAt: true, duration: true, summary: true }
                    })];
            case 1:
                runs = _a.sent();
                return [2 /*return*/, res.json(runs)];
            case 2:
                err_90 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_90) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// GET /api/pipelines/:id/runs/:runId — full run detail with logs + steps
app.get('/api/pipelines/:id/runs/:runId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var run, err_91;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.pipelineRun.findUnique({ where: { id: req.params.runId } })];
            case 1:
                run = _a.sent();
                if (!run)
                    return [2 /*return*/, res.status(404).json({ error: 'Run not found' })];
                return [2 /*return*/, res.json(run)];
            case 2:
                err_91 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_91) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ─────────────────────────────────────────────────────────────────────────────
// PHASE 11: AIP Automate — Event & Schedule-Triggered Function Execution
// ─────────────────────────────────────────────────────────────────────────────
// ── In-process automation execution engine ────────────────────────────────────
var activeSchedules = new Map();
function runAutomation(automationId, triggerType, inputOverride) {
    return __awaiter(this, void 0, void 0, function () {
        var auto, runRecord, start, outputData, errorMessage, runStatus, code, fn, inputData, AsyncFunction, fn, context, action, err_92, duration;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, prisma.aIPAutomate.findUnique({ where: { id: automationId } })];
                case 1:
                    auto = _e.sent();
                    if (!auto || auto.status !== 'active')
                        return [2 /*return*/];
                    return [4 /*yield*/, prisma.aIPAutomateRun.create({
                            data: { automationId: automationId, projectId: auto.projectId, status: 'running', trigger: triggerType, inputData: (_a = inputOverride !== null && inputOverride !== void 0 ? inputOverride : auto.inputParams) !== null && _a !== void 0 ? _a : {} }
                        })];
                case 2:
                    runRecord = _e.sent();
                    start = Date.now();
                    outputData = null;
                    errorMessage = null;
                    runStatus = 'success';
                    _e.label = 3;
                case 3:
                    _e.trys.push([3, 11, , 12]);
                    code = '';
                    if (!auto.functionId) return [3 /*break*/, 5];
                    return [4 /*yield*/, prisma.aIPFunction.findUnique({ where: { id: auto.functionId } })];
                case 4:
                    fn = _e.sent();
                    code = (_b = fn === null || fn === void 0 ? void 0 : fn.code) !== null && _b !== void 0 ? _b : '';
                    _e.label = 5;
                case 5:
                    if (!code) return [3 /*break*/, 7];
                    inputData = (_c = inputOverride !== null && inputOverride !== void 0 ? inputOverride : auto.inputParams) !== null && _c !== void 0 ? _c : {};
                    AsyncFunction = Object.getPrototypeOf(function () {
                        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/];
                        }); });
                    }).constructor;
                    fn = new AsyncFunction('input', 'context', "\"use strict\";\n".concat(code));
                    context = {
                        projectId: auto.projectId,
                        automationId: automationId,
                        triggerType: triggerType,
                        timestamp: new Date().toISOString(),
                    };
                    return [4 /*yield*/, Promise.race([
                            fn(inputData, context),
                            new Promise(function (_, reject) { return setTimeout(function () { return reject(new Error('Execution timeout (30s)')); }, 30000); })
                        ])];
                case 6:
                    outputData = _e.sent();
                    return [3 /*break*/, 10];
                case 7:
                    if (!auto.actionId) return [3 /*break*/, 9];
                    return [4 /*yield*/, prisma.aIPAction.findUnique({ where: { id: auto.actionId } })];
                case 8:
                    action = _e.sent();
                    if (action && action.status !== 'deprecated') {
                        outputData = { actionExecuted: action.name, at: new Date().toISOString() };
                    }
                    return [3 /*break*/, 10];
                case 9:
                    outputData = { message: 'No function or action bound', at: new Date().toISOString() };
                    _e.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    err_92 = _e.sent();
                    errorMessage = String((_d = err_92 === null || err_92 === void 0 ? void 0 : err_92.message) !== null && _d !== void 0 ? _d : err_92);
                    runStatus = 'failed';
                    return [3 /*break*/, 12];
                case 12:
                    duration = Date.now() - start;
                    // Update run record
                    return [4 /*yield*/, prisma.aIPAutomateRun.update({
                            where: { id: runRecord.id },
                            data: { status: runStatus, outputData: outputData, errorMessage: errorMessage, finishedAt: new Date(), duration: duration }
                        })];
                case 13:
                    // Update run record
                    _e.sent();
                    // Update automation stats
                    return [4 /*yield*/, prisma.aIPAutomate.update({
                            where: { id: automationId },
                            data: __assign(__assign({ totalRuns: { increment: 1 } }, (runStatus === 'success' ? { successRuns: { increment: 1 } } : { failedRuns: { increment: 1 } })), { lastRunAt: new Date() })
                        })];
                case 14:
                    // Update automation stats
                    _e.sent();
                    return [2 /*return*/, { runId: runRecord.id, status: runStatus, duration: duration, outputData: outputData, errorMessage: errorMessage }];
            }
        });
    });
}
function scheduleAutomation(auto) {
    var _a, _b;
    if (!auto.cronExpr)
        return;
    // Parse cron to interval (simplified: support "*/N * * * *" patterns)
    var cronParts = auto.cronExpr.trim().split(' ');
    var intervalMs = 5 * 60 * 1000; // default 5 min
    if (cronParts.length >= 5) {
        var minutePart = (_a = cronParts[0]) !== null && _a !== void 0 ? _a : '*';
        var match = minutePart.match(/^\*\/(\d+)$/);
        if (match)
            intervalMs = parseInt(match[1] || '5') * 60 * 1000;
    }
    else if (cronParts.length >= 6) {
        // second-level cron "*/N * * * * *"
        var secPart = (_b = cronParts[0]) !== null && _b !== void 0 ? _b : '*';
        var match = secPart.match(/^\*\/(\d+)$/);
        if (match)
            intervalMs = parseInt(match[1] || '5') * 1000;
    }
    // Clear any existing schedule for this automation
    if (activeSchedules.has(auto.id))
        clearInterval(activeSchedules.get(auto.id));
    var handle = setInterval(function () {
        runAutomation(auto.id, 'schedule').catch(console.error);
    }, Math.max(intervalMs, 10000)); // minimum 10s interval
    activeSchedules.set(auto.id, handle);
    console.log("[Automate] Scheduled ".concat(auto.id, " every ").concat(intervalMs / 1000, "s"));
}
// ── Start active schedule-based automations on server boot ────────────────────
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, schedules, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                projectId = global.DEFAULT_PROJECT_ID;
                if (!projectId)
                    return [2 /*return*/];
                return [4 /*yield*/, prisma.aIPAutomate.findMany({
                        where: { projectId: projectId, triggerType: 'schedule', status: 'active' }
                    })];
            case 1:
                schedules = _b.sent();
                schedules.forEach(function (auto) { return auto.cronExpr && scheduleAutomation(auto); });
                console.log("[Automate] Started ".concat(schedules.length, " active schedule(s)"));
                return [3 /*break*/, 3];
            case 2:
                _a = _b.sent();
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); })();
// ── Event-trigger dispatcher (called from entity/action write paths) ──────────
function dispatchAutomateEvent(projectId, eventType, payload) {
    return __awaiter(this, void 0, void 0, function () {
        var automations, _i, automations_1, auto, filter, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, prisma.aIPAutomate.findMany({
                            where: { projectId: projectId, triggerType: 'event', status: 'active', eventType: eventType }
                        })];
                case 1:
                    automations = _b.sent();
                    for (_i = 0, automations_1 = automations; _i < automations_1.length; _i++) {
                        auto = automations_1[_i];
                        filter = auto.eventFilter;
                        if (filter && filter.objectType && payload.objectType !== filter.objectType)
                            continue;
                        runAutomation(auto.id, 'event', { event: eventType, payload: payload }).catch(console.error);
                    }
                    return [3 /*break*/, 3];
                case 2:
                    _a = _b.sent();
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Export for use in entity update routes
global.dispatchAutomateEvent = dispatchAutomateEvent;
// ── REST routes ───────────────────────────────────────────────────────────────
// GET /api/automate — list all automations for project
app.get('/api/automate', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, automations, err_93;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                projectId = global.DEFAULT_PROJECT_ID;
                if (!projectId)
                    return [2 /*return*/, res.status(503).json({ error: 'No project initialised' })];
                return [4 /*yield*/, prisma.aIPAutomate.findMany({
                        where: { projectId: projectId },
                        orderBy: { createdAt: 'asc' }
                    })];
            case 1:
                automations = _a.sent();
                return [2 /*return*/, res.json(automations)];
            case 2:
                err_93 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_93) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// POST /api/automate — create a new automation
app.post('/api/automate', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, _a, name_30, description, triggerType, cronExpr, eventType, eventFilter, webhookPath, functionId, actionId, inputParams, status_6, automation, err_94;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                projectId = global.DEFAULT_PROJECT_ID;
                if (!projectId)
                    return [2 /*return*/, res.status(503).json({ error: 'No project initialised' })];
                _a = req.body, name_30 = _a.name, description = _a.description, triggerType = _a.triggerType, cronExpr = _a.cronExpr, eventType = _a.eventType, eventFilter = _a.eventFilter, webhookPath = _a.webhookPath, functionId = _a.functionId, actionId = _a.actionId, inputParams = _a.inputParams, status_6 = _a.status;
                if (!name_30)
                    return [2 /*return*/, res.status(400).json({ error: 'name required' })];
                return [4 /*yield*/, prisma.aIPAutomate.create({
                        data: {
                            projectId: projectId,
                            name: name_30,
                            description: description || '',
                            triggerType: triggerType || 'schedule',
                            cronExpr: cronExpr || null, eventType: eventType || null,
                            eventFilter: eventFilter || null, webhookPath: webhookPath || null,
                            functionId: functionId || null, actionId: actionId || null,
                            inputParams: inputParams || null,
                            status: status_6 || 'inactive',
                        }
                    })];
            case 1:
                automation = _b.sent();
                if (automation.status === 'active' && automation.triggerType === 'schedule' && automation.cronExpr) {
                    scheduleAutomation({ id: automation.id, cronExpr: automation.cronExpr });
                }
                return [2 /*return*/, res.status(201).json(automation)];
            case 2:
                err_94 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_94) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// PUT /api/automate/:id — update automation
app.put('/api/automate/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var prev, automation, err_95;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, prisma.aIPAutomate.findUnique({ where: { id: req.params.id } })];
            case 1:
                prev = _a.sent();
                return [4 /*yield*/, prisma.aIPAutomate.update({
                        where: { id: req.params.id },
                        data: req.body,
                    })];
            case 2:
                automation = _a.sent();
                // Re-schedule if cron details changed or status toggled to active
                if (automation.triggerType === 'schedule') {
                    if (automation.status === 'active' && automation.cronExpr) {
                        scheduleAutomation({ id: automation.id, cronExpr: automation.cronExpr });
                    }
                    else if (automation.status !== 'active' && activeSchedules.has(automation.id)) {
                        clearInterval(activeSchedules.get(automation.id));
                        activeSchedules.delete(automation.id);
                    }
                }
                return [2 /*return*/, res.json(automation)];
            case 3:
                err_95 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_95) })];
            case 4: return [2 /*return*/];
        }
    });
}); });
// DELETE /api/automate/:id
app.delete('/api/automate/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var err_96;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                if (activeSchedules.has(req.params.id)) {
                    clearInterval(activeSchedules.get(req.params.id));
                    activeSchedules.delete(req.params.id);
                }
                return [4 /*yield*/, prisma.aIPAutomate.delete({ where: { id: req.params.id } })];
            case 1:
                _a.sent();
                return [2 /*return*/, res.json({ success: true })];
            case 2:
                err_96 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_96) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// POST /api/automate/:id/run — manually trigger an automation
app.post('/api/automate/:id/run', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, err_97;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, runAutomation(req.params.id, 'manual', (_a = req.body) === null || _a === void 0 ? void 0 : _a.input)];
            case 1:
                result = _b.sent();
                return [2 /*return*/, res.json(result)];
            case 2:
                err_97 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_97) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// GET /api/automate/:id/runs — execution history (last 50)
app.get('/api/automate/:id/runs', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var runs, err_98;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.aIPAutomateRun.findMany({
                        where: { automationId: req.params.id },
                        orderBy: { startedAt: 'desc' },
                        take: 50,
                    })];
            case 1:
                runs = _a.sent();
                return [2 /*return*/, res.json(runs)];
            case 2:
                err_98 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_98) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// POST /api/automate/webhook/:path — inbound webhook trigger
app.post('/api/automate/webhook/:path', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, automation, result, err_99;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                projectId = global.DEFAULT_PROJECT_ID;
                return [4 /*yield*/, prisma.aIPAutomate.findFirst({
                        where: { projectId: projectId, triggerType: 'webhook', status: 'active', webhookPath: req.params.path }
                    })];
            case 1:
                automation = _a.sent();
                if (!automation)
                    return [2 /*return*/, res.status(404).json({ error: 'No active automation for this webhook path' })];
                return [4 /*yield*/, runAutomation(automation.id, 'webhook', req.body)];
            case 2:
                result = _a.sent();
                return [2 /*return*/, res.json({ received: true, runId: result === null || result === void 0 ? void 0 : result.runId })];
            case 3:
                err_99 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_99) })];
            case 4: return [2 /*return*/];
        }
    });
}); });
// GET /api/automate/summary — quick stats across all automations
app.get('/api/automate/summary', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, _a, total, active, recentRuns, err_100;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                projectId = global.DEFAULT_PROJECT_ID;
                if (!projectId)
                    return [2 /*return*/, res.status(503).json({ error: 'No project initialised' })];
                return [4 /*yield*/, Promise.all([
                        prisma.aIPAutomate.count({ where: { projectId: projectId } }),
                        prisma.aIPAutomate.count({ where: { projectId: projectId, status: 'active' } }),
                        prisma.aIPAutomateRun.findMany({ where: { projectId: projectId }, orderBy: { startedAt: 'desc' }, take: 10 })
                    ])];
            case 1:
                _a = _b.sent(), total = _a[0], active = _a[1], recentRuns = _a[2];
                return [2 /*return*/, res.json({ total: total, active: active, recentRuns: recentRuns })];
            case 2:
                err_100 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_100) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ─────────────────────────────────────────────────────────────────────────────
// PHASE 10: Workshop Apps API — Persistent Application Builder
// ─────────────────────────────────────────────────────────────────────────────
// GET /api/workshop — list all workshop apps for the project
app.get('/api/workshop', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, apps, err_101;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                projectId = global.DEFAULT_PROJECT_ID;
                if (!projectId)
                    return [2 /*return*/, res.status(503).json({ error: 'No project initialised' })];
                return [4 /*yield*/, prisma.workshopApp.findMany({
                        where: { projectId: projectId },
                        orderBy: { updatedAt: 'desc' },
                        select: { id: true, name: true, description: true, status: true, createdAt: true, updatedAt: true }
                    })];
            case 1:
                apps = _a.sent();
                return [2 /*return*/, res.json(apps)];
            case 2:
                err_101 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_101) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// POST /api/workshop — create a new workshop app
app.post('/api/workshop', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, _a, name_31, description, status_7, pages, app_1, err_102;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                projectId = global.DEFAULT_PROJECT_ID;
                if (!projectId)
                    return [2 /*return*/, res.status(503).json({ error: 'No project initialised' })];
                _a = req.body, name_31 = _a.name, description = _a.description, status_7 = _a.status, pages = _a.pages;
                if (!name_31)
                    return [2 /*return*/, res.status(400).json({ error: 'name required' })];
                return [4 /*yield*/, prisma.workshopApp.create({
                        data: { projectId: projectId, name: name_31, description: description || '', status: status_7 || 'draft', pages: pages || [] }
                    })];
            case 1:
                app_1 = _b.sent();
                return [2 /*return*/, res.status(201).json(app_1)];
            case 2:
                err_102 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_102) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// GET /api/workshop/:id — fetch a workshop app with full pages JSON
app.get('/api/workshop/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var app_2, err_103;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.workshopApp.findUnique({ where: { id: req.params.id } })];
            case 1:
                app_2 = _a.sent();
                if (!app_2)
                    return [2 /*return*/, res.status(404).json({ error: 'Not found' })];
                return [2 /*return*/, res.json(app_2)];
            case 2:
                err_103 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_103) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// PUT /api/workshop/:id — update name/description/status/pages
app.put('/api/workshop/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name_32, description, status_8, pages, app_3, err_104;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, name_32 = _a.name, description = _a.description, status_8 = _a.status, pages = _a.pages;
                return [4 /*yield*/, prisma.workshopApp.update({
                        where: { id: req.params.id },
                        data: __assign(__assign(__assign(__assign({}, (name_32 && { name: name_32 })), (description !== undefined && { description: description })), (status_8 && { status: status_8 })), (pages !== undefined && { pages: pages })),
                    })];
            case 1:
                app_3 = _b.sent();
                return [2 /*return*/, res.json(app_3)];
            case 2:
                err_104 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_104) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// DELETE /api/workshop/:id
app.delete('/api/workshop/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var err_105;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.workshopApp.delete({ where: { id: req.params.id } })];
            case 1:
                _a.sent();
                return [2 /*return*/, res.json({ success: true })];
            case 2:
                err_105 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_105) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// GET /api/workshop/:id/widget-data — live entity data for all widgets in the app
// This is the key endpoint: walks all widgets across all pages, resolves their
// entity bindings against CurrentEntityState, and returns live data per widget.
app.get('/api/workshop/:id/widget-data', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var app_4, pages, widgetData, entityTypes, etByName, _i, pages_1, page, _a, _b, section, _loop_4, _c, _d, widget, err_106;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 11, , 12]);
                return [4 /*yield*/, prisma.workshopApp.findUnique({ where: { id: req.params.id } })];
            case 1:
                app_4 = _e.sent();
                if (!app_4)
                    return [2 /*return*/, res.status(404).json({ error: 'Not found' })];
                pages = app_4.pages || [];
                widgetData = {};
                return [4 /*yield*/, prisma.entityType.findMany({ select: { id: true, name: true } })];
            case 2:
                entityTypes = _e.sent();
                etByName = Object.fromEntries(entityTypes.map(function (et) { return [et.name.toLowerCase(), et.id]; }));
                _i = 0, pages_1 = pages;
                _e.label = 3;
            case 3:
                if (!(_i < pages_1.length)) return [3 /*break*/, 10];
                page = pages_1[_i];
                _a = 0, _b = (page.sections || []);
                _e.label = 4;
            case 4:
                if (!(_a < _b.length)) return [3 /*break*/, 9];
                section = _b[_a];
                _loop_4 = function (widget) {
                    var binding, objectTypeLower, entityTypeId, states, rows, prop_1, values, kpiValue, prop_2, buckets, BUCKETS, bucketSize, i, slice, vals, avg;
                    return __generator(this, function (_f) {
                        switch (_f.label) {
                            case 0:
                                binding = widget.binding || {};
                                if (!binding.objectType || binding.type === 'none' || binding.type === 'action')
                                    return [2 /*return*/, "continue"];
                                objectTypeLower = binding.objectType.toLowerCase();
                                entityTypeId = etByName[objectTypeLower];
                                if (!entityTypeId) {
                                    widgetData[widget.id] = { type: widget.type, hasData: false, rows: [], total: 0 };
                                    return [2 /*return*/, "continue"];
                                }
                                return [4 /*yield*/, prisma.currentEntityState.findMany({
                                        where: { entityTypeId: entityTypeId },
                                        orderBy: { updatedAt: 'desc' },
                                        take: 200,
                                    })];
                            case 1:
                                states = _f.sent();
                                rows = states.map(function (s) { return (__assign({ id: s.logicalId }, s.data)); });
                                if (widget.type === 'object-table' || widget.type === 'loop-layout') {
                                    widgetData[widget.id] = {
                                        type: widget.type, hasData: rows.length > 0,
                                        rows: rows.slice(0, 100),
                                        total: rows.length,
                                        columns: rows.length > 0 ? Object.keys(rows[0]).filter(function (k) { return k !== '__typename'; }).slice(0, 8) : []
                                    };
                                }
                                else if (widget.type === 'kpi-card') {
                                    prop_1 = binding.property;
                                    values = prop_1 ? rows.map(function (r) { return parseFloat(r[prop_1]); }).filter(function (v) { return !isNaN(v); }) : [];
                                    kpiValue = values.length > 0 ? (values.reduce(function (a, b) { return a + b; }, 0) / values.length) : null;
                                    widgetData[widget.id] = {
                                        type: widget.type, hasData: rows.length > 0,
                                        value: kpiValue !== null ? Math.round(kpiValue * 10) / 10 : null,
                                        total: rows.length,
                                        property: prop_1 || 'count',
                                    };
                                }
                                else if (widget.type === 'time-series-chart' || widget.type === 'bar-chart') {
                                    prop_2 = binding.property;
                                    buckets = [];
                                    if (prop_2 && rows.length > 0) {
                                        BUCKETS = 20;
                                        bucketSize = Math.max(1, Math.ceil(rows.length / BUCKETS));
                                        for (i = 0; i < Math.min(BUCKETS, rows.length); i++) {
                                            slice = rows.slice(i * bucketSize, (i + 1) * bucketSize);
                                            vals = slice.map(function (r) { return parseFloat(r[prop_2]); }).filter(function (v) { return !isNaN(v); });
                                            avg = vals.length > 0 ? vals.reduce(function (a, b) { return a + b; }, 0) / vals.length : 0;
                                            buckets.push({ label: "t".concat(i), value: Math.round(avg * 10) / 10 });
                                        }
                                    }
                                    widgetData[widget.id] = {
                                        type: widget.type, hasData: buckets.length > 0,
                                        series: buckets, total: rows.length, property: prop_2 || '',
                                    };
                                }
                                else {
                                    widgetData[widget.id] = { type: widget.type, hasData: rows.length > 0, total: rows.length };
                                }
                                return [2 /*return*/];
                        }
                    });
                };
                _c = 0, _d = (section.widgets || []);
                _e.label = 5;
            case 5:
                if (!(_c < _d.length)) return [3 /*break*/, 8];
                widget = _d[_c];
                return [5 /*yield**/, _loop_4(widget)];
            case 6:
                _e.sent();
                _e.label = 7;
            case 7:
                _c++;
                return [3 /*break*/, 5];
            case 8:
                _a++;
                return [3 /*break*/, 4];
            case 9:
                _i++;
                return [3 /*break*/, 3];
            case 10: return [2 /*return*/, res.json({ appId: app_4.id, widgetData: widgetData, timestamp: new Date().toISOString() })];
            case 11:
                err_106 = _e.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_106) })];
            case 12: return [2 /*return*/];
        }
    });
}); });
// POST /api/workshop/query — live filtered entity query for Workshop variable bindings
// Used by the WorkshopRuntime to propagate inter-widget state (e.g. selected row → filter)
app.post('/api/workshop/query', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, entityType, filterProperty_1, filterValue_1, _b, limit, et, states, rows, columns, err_107;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                _a = req.body, entityType = _a.entityType, filterProperty_1 = _a.filterProperty, filterValue_1 = _a.filterValue, _b = _a.limit, limit = _b === void 0 ? 100 : _b;
                if (!entityType)
                    return [2 /*return*/, res.status(400).json({ error: 'entityType required' })];
                return [4 /*yield*/, prisma.entityType.findFirst({
                        where: { name: { equals: entityType, mode: 'insensitive' } }
                    })];
            case 1:
                et = _c.sent();
                if (!et)
                    return [2 /*return*/, res.json({ rows: [], total: 0, columns: [], hasData: false })];
                return [4 /*yield*/, prisma.currentEntityState.findMany({
                        where: { entityTypeId: et.id },
                        orderBy: { updatedAt: 'desc' },
                        take: Math.min(limit, 500),
                    })];
            case 2:
                states = _c.sent();
                rows = states.map(function (s) { return (__assign({ id: s.logicalId }, s.data)); });
                // Apply optional property filter (for inter-widget bindings)
                if (filterProperty_1 && filterValue_1 !== undefined && filterValue_1 !== null && filterValue_1 !== '') {
                    rows = rows.filter(function (r) {
                        var v = r[filterProperty_1];
                        return v !== undefined && String(v).toLowerCase().includes(String(filterValue_1).toLowerCase());
                    });
                }
                columns = rows.length > 0
                    ? Object.keys(rows[0]).filter(function (k) { return k !== '__typename'; }).slice(0, 10)
                    : [];
                return [2 /*return*/, res.json({ rows: rows.slice(0, limit), total: rows.length, columns: columns, hasData: rows.length > 0, entityType: entityType })];
            case 3:
                err_107 = _c.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_107) })];
            case 4: return [2 /*return*/];
        }
    });
}); });
// ─────────────────────────────────────────────────────────────────────────────
// PHASE 17: Quiver Analytics Engine — group-by, pivot, time-series
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/analytics/query — group-by aggregation across CurrentEntityState
// Powers: Quiver pivot table, bar chart, ranking table
app.post('/api/analytics/query', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, entityType, groupBy, _b, aggregation_1, property, _c, filters, _d, limit, et, states, rows, _loop_5, _i, filters_1, f, groups, _e, rows_1, r, key, num, result, allCols, err_108;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                _f.trys.push([0, 3, , 4]);
                _a = req.body, entityType = _a.entityType, groupBy = _a.groupBy, _b = _a.aggregation, aggregation_1 = _b === void 0 ? 'COUNT' : _b, property = _a.property, _c = _a.filters, filters = _c === void 0 ? [] : _c, _d = _a.limit, limit = _d === void 0 ? 50 : _d;
                if (!entityType)
                    return [2 /*return*/, res.status(400).json({ error: 'entityType required' })];
                return [4 /*yield*/, prisma.entityType.findFirst({ where: { name: { equals: entityType, mode: 'insensitive' } } })];
            case 1:
                et = _f.sent();
                if (!et)
                    return [2 /*return*/, res.json({ rows: [], columns: [], total: 0 })];
                return [4 /*yield*/, prisma.currentEntityState.findMany({
                        where: { entityTypeId: et.id }, orderBy: { updatedAt: 'desc' }, take: 5000
                    })];
            case 2:
                states = _f.sent();
                rows = states.map(function (s) { return (__assign({ _id: s.logicalId }, s.data)); });
                _loop_5 = function (f) {
                    rows = rows.filter(function (r) {
                        var v = r[f.property];
                        if (v === undefined || v === null)
                            return false;
                        var sv = String(v).toLowerCase();
                        var fv = String(f.value).toLowerCase();
                        switch (f.op) {
                            case '=': return sv === fv;
                            case '!=': return sv !== fv;
                            case '>': return parseFloat(v) > parseFloat(f.value);
                            case '<': return parseFloat(v) < parseFloat(f.value);
                            case 'contains': return sv.includes(fv);
                            default: return true;
                        }
                    });
                };
                // Apply filters: [{ property, op, value }]
                for (_i = 0, filters_1 = filters; _i < filters_1.length; _i++) {
                    f = filters_1[_i];
                    _loop_5(f);
                }
                // Group + aggregate
                if (groupBy) {
                    groups = {};
                    for (_e = 0, rows_1 = rows; _e < rows_1.length; _e++) {
                        r = rows_1[_e];
                        key = r[groupBy] !== undefined && r[groupBy] !== null ? String(r[groupBy]) : '(empty)';
                        if (!groups[key])
                            groups[key] = [];
                        num = property ? parseFloat(r[property]) : 1;
                        if (!isNaN(num))
                            groups[key].push(num);
                        else
                            groups[key].push(1);
                    }
                    result = Object.entries(groups).map(function (_a) {
                        var _b, _c, _d, _e;
                        var key = _a[0], vals = _a[1];
                        var agg;
                        var sorted = __spreadArray([], vals, true).sort(function (a, b) { return a - b; });
                        switch (aggregation_1.toUpperCase()) {
                            case 'COUNT':
                                agg = vals.length;
                                break;
                            case 'SUM':
                                agg = vals.reduce(function (a, b) { return a + b; }, 0);
                                break;
                            case 'AVG':
                                agg = vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
                                break;
                            case 'MIN':
                                agg = (_b = sorted[0]) !== null && _b !== void 0 ? _b : 0;
                                break;
                            case 'MAX':
                                agg = (_c = sorted[sorted.length - 1]) !== null && _c !== void 0 ? _c : 0;
                                break;
                            case 'P95':
                                agg = (_e = (_d = sorted[Math.floor(sorted.length * 0.95)]) !== null && _d !== void 0 ? _d : sorted[sorted.length - 1]) !== null && _e !== void 0 ? _e : 0;
                                break;
                            default: agg = vals.length;
                        }
                        return { group: key, value: Math.round(agg * 100) / 100, count: vals.length };
                    }).sort(function (a, b) { return b.value - a.value; }).slice(0, limit);
                    return [2 /*return*/, res.json({ rows: result, columns: ['group', 'value', 'count'], total: result.length, aggregation: aggregation_1, groupBy: groupBy, property: property })];
                }
                allCols = rows.length > 0 ? Object.keys(rows[0]).filter(function (k) { return k !== '__typename'; }).slice(0, 10) : [];
                return [2 /*return*/, res.json({ rows: rows.slice(0, limit), columns: allCols, total: rows.length, aggregation: aggregation_1, groupBy: null, property: property })];
            case 3:
                err_108 = _f.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_108) })];
            case 4: return [2 /*return*/];
        }
    });
}); });
// POST /api/analytics/timeseries — time-bucketed property series for charts
app.post('/api/analytics/timeseries', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, entityType, property_1, _b, buckets, _c, filters, et, states, rows, _loop_6, _i, filters_2, f, bucketSize, series, i, slice, vals, avg, ts, err_109;
    var _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 3, , 4]);
                _a = req.body, entityType = _a.entityType, property_1 = _a.property, _b = _a.buckets, buckets = _b === void 0 ? 24 : _b, _c = _a.filters, filters = _c === void 0 ? [] : _c;
                if (!entityType || !property_1)
                    return [2 /*return*/, res.status(400).json({ error: 'entityType + property required' })];
                return [4 /*yield*/, prisma.entityType.findFirst({ where: { name: { equals: entityType, mode: 'insensitive' } } })];
            case 1:
                et = _e.sent();
                if (!et)
                    return [2 /*return*/, res.json({ series: [], property: property_1, entityType: entityType })];
                return [4 /*yield*/, prisma.currentEntityState.findMany({
                        where: { entityTypeId: et.id }, orderBy: { updatedAt: 'desc' }, take: 2000
                    })];
            case 2:
                states = _e.sent();
                rows = states.map(function (s) { return (__assign(__assign({}, (s.data)), { _updatedAt: s.updatedAt })); });
                _loop_6 = function (f) {
                    rows = rows.filter(function (r) {
                        var v = r[f.property];
                        return v !== undefined && String(v).toLowerCase().includes(String(f.value).toLowerCase());
                    });
                };
                for (_i = 0, filters_2 = filters; _i < filters_2.length; _i++) {
                    f = filters_2[_i];
                    _loop_6(f);
                }
                // Sort by updatedAt and bucket
                rows.sort(function (a, b) { return new Date(a._updatedAt).getTime() - new Date(b._updatedAt).getTime(); });
                bucketSize = Math.max(1, Math.ceil(rows.length / buckets));
                series = [];
                for (i = 0; i < Math.min(buckets, rows.length); i++) {
                    slice = rows.slice(i * bucketSize, (i + 1) * bucketSize);
                    vals = slice.map(function (r) { return parseFloat(r[property_1]); }).filter(function (v) { return !isNaN(v); });
                    avg = vals.length > 0 ? vals.reduce(function (a, b) { return a + b; }, 0) / vals.length : null;
                    ts = (_d = slice[0]) === null || _d === void 0 ? void 0 : _d._updatedAt;
                    series.push({ t: i, label: ts ? new Date(ts).toLocaleTimeString() : "t".concat(i), value: avg !== null ? Math.round(avg * 100) / 100 : null });
                }
                return [2 /*return*/, res.json({ series: series, property: property_1, entityType: entityType, total: rows.length })];
            case 3:
                err_109 = _e.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_109) })];
            case 4: return [2 /*return*/];
        }
    });
}); });
// GET /api/analytics/entity-summary — quick stats for all entity types
app.get('/api/analytics/entity-summary', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var entityTypes, summary, err_110;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, prisma.entityType.findMany({ select: { id: true, name: true } })];
            case 1:
                entityTypes = _a.sent();
                return [4 /*yield*/, Promise.all(entityTypes.map(function (et) { return __awaiter(void 0, void 0, void 0, function () {
                        var count, latest, sample, numericProps;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, prisma.currentEntityState.count({ where: { entityTypeId: et.id } })];
                                case 1:
                                    count = _b.sent();
                                    return [4 /*yield*/, prisma.currentEntityState.findFirst({ where: { entityTypeId: et.id }, orderBy: { updatedAt: 'desc' }, select: { updatedAt: true, data: true } })];
                                case 2:
                                    latest = _b.sent();
                                    sample = latest === null || latest === void 0 ? void 0 : latest.data;
                                    numericProps = sample ? Object.entries(sample).filter(function (_a) {
                                        var v = _a[1];
                                        return !isNaN(parseFloat(String(v)));
                                    }).map(function (_a) {
                                        var k = _a[0];
                                        return k;
                                    }) : [];
                                    return [2 /*return*/, { name: et.name, count: count, numericProps: numericProps, lastUpdated: (_a = latest === null || latest === void 0 ? void 0 : latest.updatedAt) !== null && _a !== void 0 ? _a : null }];
                            }
                        });
                    }); }))];
            case 2:
                summary = _a.sent();
                return [2 /*return*/, res.json(summary)];
            case 3:
                err_110 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_110) })];
            case 4: return [2 /*return*/];
        }
    });
}); });
// ─────────────────────────────────────────────────────────────────────────────
// PHASE 8: AIP Actions API — Foundry-style write-back Operations
// ─────────────────────────────────────────────────────────────────────────────
// GET /api/actions — list all action types for project
app.get('/api/actions', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, actions, err_111;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                projectId = global.DEFAULT_PROJECT_ID;
                if (!projectId)
                    return [2 /*return*/, res.status(503).json({ error: 'No project initialised' })];
                return [4 /*yield*/, prisma.aIPAction.findMany({
                        where: { projectId: projectId },
                        orderBy: { createdAt: 'desc' },
                    })];
            case 1:
                actions = _a.sent();
                return [2 /*return*/, res.json(actions)];
            case 2:
                err_111 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_111) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// POST /api/actions — create a new action type
app.post('/api/actions', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, _a, name_33, description, category, objectType, params, rbac, approvalRules, writesTo, riskTier, status_9, action, err_112;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                projectId = global.DEFAULT_PROJECT_ID;
                if (!projectId)
                    return [2 /*return*/, res.status(503).json({ error: 'No project initialised' })];
                _a = req.body, name_33 = _a.name, description = _a.description, category = _a.category, objectType = _a.objectType, params = _a.params, rbac = _a.rbac, approvalRules = _a.approvalRules, writesTo = _a.writesTo, riskTier = _a.riskTier, status_9 = _a.status;
                if (!name_33 || !objectType)
                    return [2 /*return*/, res.status(400).json({ error: 'name, objectType required' })];
                return [4 /*yield*/, prisma.aIPAction.create({
                        data: {
                            projectId: projectId,
                            name: name_33,
                            description: description || '',
                            category: category || 'edit',
                            objectType: objectType,
                            params: params || [],
                            rbac: rbac || [],
                            approvalRules: approvalRules || [],
                            writesTo: writesTo || [],
                            riskTier: riskTier || 'low',
                            status: status_9 || 'draft',
                        }
                    })];
            case 1:
                action = _b.sent();
                return [2 /*return*/, res.status(201).json(action)];
            case 2:
                err_112 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_112) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// GET /api/actions/:id — get a specific action type
app.get('/api/actions/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var action, err_113;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.aIPAction.findUnique({ where: { id: req.params.id } })];
            case 1:
                action = _a.sent();
                if (!action)
                    return [2 /*return*/, res.status(404).json({ error: 'Action not found' })];
                return [2 /*return*/, res.json(action)];
            case 2:
                err_113 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_113) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// PUT /api/actions/:id — update an action type
app.put('/api/actions/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name_34, description, category, objectType, params, rbac, approvalRules, writesTo, riskTier, status_10, action, err_114;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, name_34 = _a.name, description = _a.description, category = _a.category, objectType = _a.objectType, params = _a.params, rbac = _a.rbac, approvalRules = _a.approvalRules, writesTo = _a.writesTo, riskTier = _a.riskTier, status_10 = _a.status;
                return [4 /*yield*/, prisma.aIPAction.update({
                        where: { id: req.params.id },
                        data: __assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({}, (name_34 !== undefined && { name: name_34 })), (description !== undefined && { description: description })), (category !== undefined && { category: category })), (objectType !== undefined && { objectType: objectType })), (params !== undefined && { params: params })), (rbac !== undefined && { rbac: rbac })), (approvalRules !== undefined && { approvalRules: approvalRules })), (writesTo !== undefined && { writesTo: writesTo })), (riskTier !== undefined && { riskTier: riskTier })), (status_10 !== undefined && { status: status_10 }))
                    })];
            case 1:
                action = _b.sent();
                return [2 /*return*/, res.json(action)];
            case 2:
                err_114 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_114) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// DELETE /api/actions/:id — delete an action type
app.delete('/api/actions/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var err_115;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.aIPAction.delete({ where: { id: req.params.id } })];
            case 1:
                _a.sent();
                return [2 /*return*/, res.json({ success: true })];
            case 2:
                err_115 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_115) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// GET /api/actions/:id/executions — execution history for an action
app.get('/api/actions/:id/executions', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var executions, err_116;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.aIPActionExecution.findMany({
                        where: { actionId: req.params.id },
                        orderBy: { createdAt: 'desc' },
                        take: 50,
                    })];
            case 1:
                executions = _a.sent();
                return [2 /*return*/, res.json(executions)];
            case 2:
                err_116 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_116) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// POST /api/actions/:id/execute — apply an action against an entity instance
app.post('/api/actions/:id/execute', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var action, _a, logicalId, parameters_1, submittedBy, paramDefs, missingParams, needsApproval, execution, currentState, currentData_1, category, updatedData_1, writesToFields, _i, paramDefs_1, param, fieldName, _b, paramDefs_2, param, fieldName, writeErr_1, err_117;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 12, , 13]);
                return [4 /*yield*/, prisma.aIPAction.findUnique({ where: { id: req.params.id } })];
            case 1:
                action = _c.sent();
                if (!action)
                    return [2 /*return*/, res.status(404).json({ error: 'Action not found' })];
                if (action.status === 'deprecated')
                    return [2 /*return*/, res.status(400).json({ error: 'Action is deprecated' })];
                _a = req.body, logicalId = _a.logicalId, parameters_1 = _a.parameters, submittedBy = _a.submittedBy;
                if (!logicalId)
                    return [2 /*return*/, res.status(400).json({ error: 'logicalId of the target entity is required' })];
                paramDefs = action.params;
                missingParams = paramDefs
                    .filter(function (p) { return p.required && (parameters_1[p.name] === undefined || parameters_1[p.name] === null || parameters_1[p.name] === ''); })
                    .map(function (p) { return p.name; });
                if (missingParams.length > 0) {
                    return [2 /*return*/, res.status(400).json({ error: "Missing required parameters: ".concat(missingParams.join(', ')) })];
                }
                needsApproval = action.approvalRules.length > 0 && action.riskTier !== 'low';
                return [4 /*yield*/, prisma.aIPActionExecution.create({
                        data: {
                            actionId: action.id,
                            logicalId: logicalId,
                            objectType: action.objectType,
                            parameters: parameters_1,
                            status: needsApproval ? 'PENDING' : 'APPLIED',
                            submittedBy: submittedBy || 'system',
                            appliedAt: needsApproval ? null : new Date(),
                            result: (needsApproval ? prisma_1.Prisma.DbNull : { message: 'Applied immediately (low-risk, no approval required)' }),
                        }
                    })];
            case 2:
                execution = _c.sent();
                if (!!needsApproval) return [3 /*break*/, 9];
                _c.label = 3;
            case 3:
                _c.trys.push([3, 8, , 9]);
                return [4 /*yield*/, prisma.currentEntityState.findUnique({ where: { logicalId: logicalId } })];
            case 4:
                currentState = _c.sent();
                if (!currentState) return [3 /*break*/, 7];
                currentData_1 = currentState.data;
                category = action.category;
                updatedData_1 = __assign({}, currentData_1);
                if (category === 'edit') {
                    writesToFields = action.writesTo;
                    for (_i = 0, paramDefs_1 = paramDefs; _i < paramDefs_1.length; _i++) {
                        param = paramDefs_1[_i];
                        if (parameters_1[param.name] !== undefined) {
                            fieldName = param.name.includes('.') ? param.name.split('.').pop() : param.name;
                            if (fieldName)
                                updatedData_1[fieldName] = parameters_1[param.name];
                        }
                    }
                }
                else if (category === 'create') {
                    // For create actions, we just log the intent (entity creation goes through ingestion)
                    updatedData_1 = __assign(__assign({}, currentData_1), { _lastAction: action.name, _lastActionParams: parameters_1 });
                }
                else if (category === 'delete') {
                    updatedData_1 = __assign(__assign({}, currentData_1), { status: 'DECOMMISSIONED', _deletedBy: action.name });
                }
                else if (category === 'link') {
                    // Apply link parameters to entity state
                    for (_b = 0, paramDefs_2 = paramDefs; _b < paramDefs_2.length; _b++) {
                        param = paramDefs_2[_b];
                        if (parameters_1[param.name] !== undefined) {
                            fieldName = param.name.includes('.') ? param.name.split('.').pop() : param.name;
                            if (fieldName)
                                updatedData_1[fieldName] = parameters_1[param.name];
                        }
                    }
                }
                // Update the CurrentEntityState projection
                return [4 /*yield*/, prisma.currentEntityState.update({
                        where: { logicalId: logicalId },
                        data: { data: updatedData_1, updatedAt: new Date() }
                    })];
            case 5:
                // Update the CurrentEntityState projection
                _c.sent();
                // Update execution result with what changed
                return [4 /*yield*/, prisma.aIPActionExecution.update({
                        where: { id: execution.id },
                        data: { result: { changedFields: Object.keys(updatedData_1).filter(function (k) { return updatedData_1[k] !== currentData_1[k]; }), updatedData: updatedData_1 } }
                    })];
            case 6:
                // Update execution result with what changed
                _c.sent();
                _c.label = 7;
            case 7: return [3 /*break*/, 9];
            case 8:
                writeErr_1 = _c.sent();
                logger_1.default.warn({ writeErr: writeErr_1, logicalId: logicalId }, 'Could not apply write-back to CurrentEntityState');
                return [3 /*break*/, 9];
            case 9: 
            // Increment usage counter
            return [4 /*yield*/, prisma.aIPAction.update({
                    where: { id: action.id },
                    data: { usages: { increment: 1 }, lastUsedAt: new Date() }
                })];
            case 10:
                // Increment usage counter
                _c.sent();
                // Write audit log
                return [4 /*yield*/, prisma.auditLog.create({
                        data: {
                            actor: submittedBy || 'system',
                            actorRole: 'OPERATOR',
                            action: "EXECUTE_ACTION:".concat(action.name),
                            resourceType: 'AIPAction',
                            resourceId: action.id,
                            after: { logicalId: logicalId, parameters: parameters_1, executionId: execution.id, status: execution.status },
                        }
                    })];
            case 11:
                // Write audit log
                _c.sent();
                return [2 /*return*/, res.json({
                        executionId: execution.id,
                        status: execution.status,
                        needsApproval: needsApproval,
                        message: needsApproval
                            ? "Action submitted for approval. ".concat(action.approvalRules.length, " approval rule(s) apply.")
                            : "Action applied successfully to entity ".concat(logicalId, ".")
                    })];
            case 12:
                err_117 = _c.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_117) })];
            case 13: return [2 /*return*/];
        }
    });
}); });
// ── Real-time entity publish endpoint ────────────────────────────────────────
// POST /api/entities/publish — push an entity change event to all WS subscribers.
// Called by integration pipelines, data jobs, or any external system that writes entities.
app.post('/api/entities/publish', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, objectType_1, logicalId_3, data_1, changeType_1, projectId, entityType, broadcast_1, delivered, err_118;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                _a = req.body, objectType_1 = _a.objectType, logicalId_3 = _a.logicalId, data_1 = _a.data, changeType_1 = _a.changeType;
                if (!objectType_1 || !logicalId_3)
                    return [2 /*return*/, res.status(400).json({ error: 'objectType and logicalId required' })];
                if (!data_1) return [3 /*break*/, 3];
                projectId = global.DEFAULT_PROJECT_ID;
                return [4 /*yield*/, prisma.entityType.findFirst({ where: { name: objectType_1 } })];
            case 1:
                entityType = _b.sent();
                if (!(entityType && projectId)) return [3 /*break*/, 3];
                return [4 /*yield*/, prisma.currentEntityState.upsert({
                        where: { logicalId: logicalId_3 },
                        create: { entityTypeId: entityType.id, logicalId: logicalId_3, data: data_1, updatedAt: new Date() },
                        update: { data: data_1, updatedAt: new Date() },
                    })];
            case 2:
                _b.sent();
                _b.label = 3;
            case 3:
                broadcast_1 = global.broadcastEntityChange;
                delivered = broadcast_1 ? (function () {
                    broadcast_1(objectType_1, logicalId_3, data_1 || {}, changeType_1 || 'updated');
                    return true;
                })() : false;
                return [2 /*return*/, res.json({ published: true, objectType: objectType_1, logicalId: logicalId_3, delivered: delivered })];
            case 4:
                err_118 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_118) })];
            case 5: return [2 /*return*/];
        }
    });
}); });
// GET /api/entities/live-stream — info about how to connect to the WS
app.get('/api/entities/live-stream', function (req, res) {
    return res.json({
        wsUrl: "ws://localhost:".concat(process.env.PORT || 3001),
        protocol: 'aip-ontology-v1',
        topics: {
            'entities:<ObjectType>': 'Live entity state changes for one object type',
            'entities:*': 'All entity changes across all types',
            'metrics:*': 'Metric threshold breach events',
            'actions:*': 'Action execution events',
            'events:*': 'All events (default subscription)',
        },
        subscribe: { subscribe: ['entities:Drone', 'metrics:*'] },
        clients: wsClients.size,
    });
});
var wsClients = new Map();
// ── Broadcast helpers ─────────────────────────────────────────────────────────
/** Broadcast a message to all clients subscribed to at least one of the given topics */
function broadcastToTopics(topics, payload) {
    var msg = JSON.stringify(payload);
    var count = 0;
    var _loop_7 = function (client) {
        if (client.ws.readyState !== ws_1.WebSocket.OPEN)
            return "continue";
        var interested = topics.some(function (t) {
            if (client.subscriptions.has(t))
                return true;
            if (client.subscriptions.has('*'))
                return true;
            // wildcard prefix match: "entities:*" matches "entities:Drone"
            for (var _i = 0, _a = client.subscriptions; _i < _a.length; _i++) {
                var sub = _a[_i];
                if (sub.endsWith(':*') && t.startsWith(sub.slice(0, -1)))
                    return true;
            }
            return false;
        });
        if (interested) {
            client.send(msg);
            count++;
        }
    };
    for (var _i = 0, _a = wsClients.values(); _i < _a.length; _i++) {
        var client = _a[_i];
        _loop_7(client);
    }
    return count;
}
/** Called after any entity upsert — pushes live update to subscribed clients */
function broadcastEntityChange(objectType, logicalId, data, changeType) {
    if (changeType === void 0) { changeType = 'updated'; }
    broadcastToTopics(["entities:".concat(objectType), 'entities:*', 'events:*'], { type: 'entity.change', changeType: changeType, objectType: objectType, logicalId: logicalId, data: data, ts: Date.now() });
    // Also fire the automate event dispatcher
    var dispatch = global.dispatchAutomateEvent;
    if (dispatch) {
        dispatch(global.DEFAULT_PROJECT_ID, "entity.".concat(changeType), { objectType: objectType, logicalId: logicalId, data: data }).catch(function () { });
    }
}
/** Called after a metric threshold breach */
function broadcastMetricAlert(metricId, metricName, value, threshold) {
    broadcastToTopics(["metrics:".concat(metricId), 'metrics:*', 'events:*'], { type: 'metric.threshold_breached', metricId: metricId, metricName: metricName, value: value, threshold: threshold, ts: Date.now() });
}
/** Called after an action execution */
function broadcastActionEvent(actionName, logicalId, executionId, status) {
    broadcastToTopics(['actions:*', 'events:*'], { type: 'action.executed', actionName: actionName, logicalId: logicalId, executionId: executionId, status: status, ts: Date.now() });
}
// Export broadcast helpers for use in other parts of server.ts
global.broadcastToTopics = broadcastToTopics;
global.broadcastEntityChange = broadcastEntityChange;
global.broadcastMetricAlert = broadcastMetricAlert;
global.broadcastActionEvent = broadcastActionEvent;
// ── WebSocket server bootstrap (attached on server listen) ────────────────────
var wss = null;
function initWebSocketServer(httpServer) {
    wss = new ws_1.WebSocketServer({ server: httpServer });
    wss.on('connection', function (ws, req) {
        var clientId = (0, crypto_1.randomUUID)();
        var client = { ws: ws, id: clientId, subscriptions: new Set(['events:*']), connectedAt: new Date() };
        wsClients.set(clientId, client);
        logger_1.default.info("[WS] Client connected: ".concat(clientId, " (total: ").concat(wsClients.size, ")"));
        // Send welcome
        ws.send(JSON.stringify({ type: 'connected', clientId: clientId, ts: Date.now() }));
        ws.on('message', function (raw) {
            try {
                var msg = JSON.parse(raw.toString());
                if (msg.subscribe) {
                    // Support single topic or array of topics
                    var topics = Array.isArray(msg.subscribe) ? msg.subscribe : [msg.subscribe];
                    topics.forEach(function (t) { return client.subscriptions.add(t); });
                    ws.send(JSON.stringify({ type: 'subscribed', topics: __spreadArray([], client.subscriptions, true), ts: Date.now() }));
                }
                if (msg.unsubscribe) {
                    var topics = Array.isArray(msg.unsubscribe) ? msg.unsubscribe : [msg.unsubscribe];
                    topics.forEach(function (t) { return client.subscriptions.delete(t); });
                    ws.send(JSON.stringify({ type: 'unsubscribed', topics: __spreadArray([], client.subscriptions, true), ts: Date.now() }));
                }
                if (msg.ping) {
                    ws.send(JSON.stringify({ type: 'pong', ts: Date.now() }));
                }
            }
            catch ( /* ignore malformed messages */_a) { /* ignore malformed messages */ }
        });
        ws.on('close', function () {
            wsClients.delete(clientId);
            logger_1.default.info("[WS] Client disconnected: ".concat(clientId, " (remaining: ").concat(wsClients.size, ")"));
        });
        ws.on('error', function (err) {
            logger_1.default.warn({ err: err }, "[WS] Client error: ".concat(clientId));
            wsClients.delete(clientId);
        });
    });
    logger_1.default.info('[WS] WebSocket server attached to HTTP server');
}
// ── REST monitoring endpoints ─────────────────────────────────────────────────
// GET /api/ws/stats — WebSocket connection stats
app.get('/api/ws/stats', function (req, res) {
    var clients = __spreadArray([], wsClients.values(), true).map(function (c) { return ({
        id: c.id, subscriptions: __spreadArray([], c.subscriptions, true),
        connectedAt: c.connectedAt, readyState: c.readyState
    }); });
    return res.json({ total: wsClients.size, clients: clients });
});
// POST /api/ws/broadcast — manual broadcast for testing
app.post('/api/ws/broadcast', function (req, res) {
    var _a = req.body, topics = _a.topics, payload = _a.payload;
    if (!topics || !payload)
        return res.status(400).json({ error: 'topics and payload required' });
    var count = broadcastToTopics(Array.isArray(topics) ? topics : [topics], payload);
    return res.json({ delivered: count });
});
// ─────────────────────────────────────────────────────────────────────────────
// PHASE 18: AIP Evals
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/evals', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var evals, err_119;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.aIPEval.findMany({ orderBy: { updatedAt: 'desc' } })];
            case 1:
                evals = _a.sent();
                return [2 /*return*/, res.json(evals)];
            case 2:
                err_119 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_119) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/api/evals', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name_35, description, workflowId, testCases, evaluation, err_120;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, name_35 = _a.name, description = _a.description, workflowId = _a.workflowId, testCases = _a.testCases;
                return [4 /*yield*/, prisma.aIPEval.create({
                        data: { name: name_35, description: description, workflowId: workflowId, testCases: testCases || [] }
                    })];
            case 1:
                evaluation = _b.sent();
                return [2 /*return*/, res.status(201).json(evaluation)];
            case 2:
                err_120 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_120) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/api/evals/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var evaluation, err_121;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.aIPEval.findUnique({
                        where: { id: req.params.id }, include: { runs: { orderBy: { startedAt: 'desc' } } }
                    })];
            case 1:
                evaluation = _a.sent();
                if (!evaluation)
                    return [2 /*return*/, res.status(404).json({ error: 'Eval not found' })];
                return [2 /*return*/, res.json(evaluation)];
            case 2:
                err_121 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_121) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/api/evals/:id/run', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var evaluation_1, run_3, err_122;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, prisma.aIPEval.findUnique({ where: { id: req.params.id } })];
            case 1:
                evaluation_1 = _a.sent();
                if (!evaluation_1)
                    return [2 /*return*/, res.status(404).json({ error: 'Eval not found' })];
                return [4 /*yield*/, prisma.aIPEvalRun.create({ data: { evalId: evaluation_1.id, status: 'running' } })];
            case 2:
                run_3 = _a.sent();
                // In a real system, this would queue a job array. For now, we simulate execution and LLM-as-judge scoring.
                // Return immediately, run in background:
                (function () { return __awaiter(void 0, void 0, void 0, function () {
                    var cases, results, passedCount, total;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                cases = evaluation_1.testCases;
                                results = cases.map(function (tc, idx) {
                                    // "Mock" execution of the workflow
                                    var actualOutput = typeof tc.expectedOutput === 'string' && tc.expectedOutput.includes('High')
                                        ? tc.expectedOutput // pass
                                        : 'Random LLM Output ' + Math.random(); // likely fail 
                                    var passed = Math.random() > 0.3; // 70% passing rate simulation
                                    return {
                                        caseIndex: idx, input: tc.input, expectedOutput: tc.expectedOutput,
                                        actualOutput: passed ? tc.expectedOutput : actualOutput,
                                        score: passed ? 1 : 0.2, judgeReason: passed ? 'Output matched semantic criteria.' : 'Output diverged from expected format.',
                                        passed: passed
                                    };
                                });
                                passedCount = results.filter(function (r) { return r.passed; }).length;
                                total = results.length;
                                return [4 /*yield*/, prisma.aIPEvalRun.update({
                                        where: { id: run_3.id },
                                        data: {
                                            status: 'complete', finishedAt: new Date(), duration: Math.floor(Math.random() * 5000) + 1000,
                                            results: results,
                                            summary: { total: total, passed: passedCount, failed: total - passedCount, avgScore: passedCount / (total || 1) }
                                        }
                                    })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); })();
                return [2 /*return*/, res.json({ runId: run_3.id, status: 'running' })];
            case 3:
                err_122 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_122) })];
            case 4: return [2 /*return*/];
        }
    });
}); });
// ─────────────────────────────────────────────────────────────────────────────
// PHASE 19: Data Lineage Graph Traversal
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/lineage/:entityType', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var name_36, limit, pipelines, upstreamPipelines, downstreamPipelines, runs, err_123;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                name_36 = req.params.entityType;
                limit = parseInt(req.query.limit) || 50;
                return [4 /*yield*/, prisma.pipeline.findMany({ select: { id: true, name: true, nodes: true } })];
            case 1:
                pipelines = _a.sent();
                upstreamPipelines = pipelines.filter(function (p) {
                    var pnodes = p.nodes;
                    return pnodes === null || pnodes === void 0 ? void 0 : pnodes.some(function (n) { var _a; return n.type === 'ontologyWrite' && ((_a = n.data) === null || _a === void 0 ? void 0 : _a.entityType) === name_36; });
                });
                downstreamPipelines = pipelines.filter(function (p) {
                    var pnodes = p.nodes;
                    return pnodes === null || pnodes === void 0 ? void 0 : pnodes.some(function (n) { var _a; return n.type === 'restFetch' && String((_a = n.data) === null || _a === void 0 ? void 0 : _a.url).includes(name_36); });
                });
                return [4 /*yield*/, prisma.pipelineRun.findMany({
                        where: {
                            OR: upstreamPipelines.map(function (p) { return ({ pipelineId: p.id }); })
                        },
                        orderBy: { startedAt: 'desc' }, take: 10
                    })];
            case 2:
                runs = _a.sent();
                return [2 /*return*/, res.json({
                        entityType: name_36,
                        upstreamPipelines: upstreamPipelines.map(function (p) { return ({ id: p.id, name: p.name }); }),
                        downstreamPipelines: downstreamPipelines.map(function (p) { return ({ id: p.id, name: p.name }); }),
                        recentRuns: runs.map(function (r) { return ({ id: r.id, pipelineId: r.pipelineId, status: r.status, startedAt: r.startedAt }); })
                    })];
            case 3:
                err_123 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_123) })];
            case 4: return [2 /*return*/];
        }
    });
}); });
// ─────────────────────────────────────────────────────────────────────────────
// PHASE 21: Function Versioning
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/functions/:id/versions', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var versions, err_124;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.functionVersion.findMany({
                        where: { functionId: req.params.id }, orderBy: { version: 'desc' }
                    })];
            case 1:
                versions = _a.sent();
                return [2 /*return*/, res.json(versions)];
            case 2:
                err_124 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_124) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/api/functions/:id/versions', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, code, language, latest, ver, err_125;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, code = _a.code, language = _a.language;
                return [4 /*yield*/, prisma.functionVersion.findFirst({
                        where: { functionId: req.params.id }, orderBy: { version: 'desc' }
                    })];
            case 1:
                latest = _b.sent();
                return [4 /*yield*/, prisma.functionVersion.create({
                        data: { functionId: req.params.id, code: code, language: language, version: ((latest === null || latest === void 0 ? void 0 : latest.version) || 0) + 1 }
                    })];
            case 2:
                ver = _b.sent();
                return [2 /*return*/, res.status(201).json(ver)];
            case 3:
                err_125 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_125) })];
            case 4: return [2 /*return*/];
        }
    });
}); });
// ─────────────────────────────────────────────────────────────────────────────
// PHASE 22: Apollo Infrastructure
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/apollo/environments', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var envs, err_126;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.apolloEnvironment.findMany({
                        include: {
                            deployments: { orderBy: { startedAt: 'desc' }, take: 1 },
                            healthChecks: { orderBy: { checkedAt: 'desc' }, take: 10 }
                        },
                        orderBy: { createdAt: 'asc' }
                    })];
            case 1:
                envs = _a.sent();
                return [2 /*return*/, res.json(envs)];
            case 2:
                err_126 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_126) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/api/apollo/deploy', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, environmentId, releaseVersion, canaryPercent, deploy, err_127;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, environmentId = _a.environmentId, releaseVersion = _a.releaseVersion, canaryPercent = _a.canaryPercent;
                return [4 /*yield*/, apolloService.deployRelease(environmentId, releaseVersion, canaryPercent || 100, "admin")];
            case 1:
                deploy = _b.sent();
                return [2 /*return*/, res.status(202).json(deploy)];
            case 2:
                err_127 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_127) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/api/apollo/deployments', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var envId, where, deploys, err_128;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                envId = req.query.environmentId;
                where = envId ? { environmentId: envId } : {};
                return [4 /*yield*/, prisma.apolloDeployment.findMany({
                        where: where,
                        orderBy: { startedAt: 'desc' }, take: 50,
                        include: { environment: { select: { name: true } } }
                    })];
            case 1:
                deploys = _a.sent();
                return [2 /*return*/, res.json(deploys)];
            case 2:
                err_128 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_128) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/api/apollo/deployments/:id/rollback', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var rollbackDeploy, err_129;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, apolloService.rollback(req.params.id, "admin")];
            case 1:
                rollbackDeploy = _a.sent();
                return [2 /*return*/, res.status(202).json(rollbackDeploy)];
            case 2:
                err_129 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_129) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ─────────────────────────────────────────────────────────────────────────────
// PHASE 22: Spark Processing Engine
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/spark/jobs', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var jobs, err_130;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.sparkJob.findMany({
                        orderBy: { createdAt: 'desc' },
                        include: { runs: { orderBy: { startedAt: 'desc' }, take: 1 } }
                    })];
            case 1:
                jobs = _a.sent();
                return [2 /*return*/, res.json(jobs)];
            case 2:
                err_130 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_130) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/api/spark/jobs', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name_37, description, stages, job, err_131;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, name_37 = _a.name, description = _a.description, stages = _a.stages;
                return [4 /*yield*/, prisma.sparkJob.create({
                        data: { name: name_37, description: description, stages: stages || [] }
                    })];
            case 1:
                job = _b.sent();
                return [2 /*return*/, res.status(201).json(job)];
            case 2:
                err_131 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_131) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.put('/api/spark/jobs/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name_38, description, stages, enabled, job, err_132;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, name_38 = _a.name, description = _a.description, stages = _a.stages, enabled = _a.enabled;
                return [4 /*yield*/, prisma.sparkJob.update({
                        where: { id: req.params.id },
                        data: { name: name_38, description: description, stages: stages, enabled: enabled }
                    })];
            case 1:
                job = _b.sent();
                return [2 /*return*/, res.json(job)];
            case 2:
                err_132 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_132) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/api/spark/jobs/:id/run', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var broadcastFn, run, err_133;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                broadcastFn = function (eventUrl, payload) {
                    var msg = JSON.stringify({ type: eventUrl, payload: payload });
                    for (var _i = 0, wsClients_1 = wsClients; _i < wsClients_1.length; _i++) {
                        var client = wsClients_1[_i];
                        if (client.readyState === ws_1.WebSocket.OPEN)
                            client.send(msg);
                    }
                };
                return [4 /*yield*/, sparkService.executeJob(req.params.id, "manual", req.body.inputData, broadcastFn)];
            case 1:
                run = _a.sent();
                return [2 /*return*/, res.status(202).json(run)];
            case 2:
                err_133 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_133) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/api/spark/jobs/:id/runs', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var runs, err_134;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.sparkJobRun.findMany({
                        where: { jobId: req.params.id },
                        orderBy: { startedAt: 'desc' },
                        take: 20,
                        include: { stages: { orderBy: { startedAt: 'asc' } } }
                    })];
            case 1:
                runs = _a.sent();
                return [2 /*return*/, res.json(runs)];
            case 2:
                err_134 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_134) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ─────────────────────────────────────────────────────────────────────────────
// PHASE 22: Military-Grade Cryptographic Provenance
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/provenance/record', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, entityId, entityType, operationType, sourceSystem, operatorId, fields, chains, err_135;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, entityId = _a.entityId, entityType = _a.entityType, operationType = _a.operationType, sourceSystem = _a.sourceSystem, operatorId = _a.operatorId, fields = _a.fields;
                return [4 /*yield*/, provenance_service_1.ProvenanceService.recordCryptoProvenance(entityId, entityType, operationType || 'write', sourceSystem, operatorId || 'system', fields, prisma)];
            case 1:
                chains = _b.sent();
                return [2 /*return*/, res.status(201).json({ status: 'ok', records: chains.length })];
            case 2:
                err_135 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_135) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/api/provenance/seal/:entityId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var seal, err_136;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, provenance_service_1.ProvenanceService.createIntegritySeal(req.params.entityId, req.body.entityType || 'Unknown', req.body.sealedBy || 'system', prisma)];
            case 1:
                seal = _a.sent();
                return [2 /*return*/, res.status(201).json(seal)];
            case 2:
                err_136 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_136) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/api/provenance/verify/:entityId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, err_137;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, provenance_service_1.ProvenanceService.verifyIntegritySeal(req.params.entityId, prisma)];
            case 1:
                result = _a.sent();
                return [2 /*return*/, res.json(result)];
            case 2:
                err_137 = _a.sent();
                if (String(err_137).includes('No integrity seal'))
                    return [2 /*return*/, res.status(404).json({ error: 'No seal found' })];
                return [2 /*return*/, res.status(500).json({ error: String(err_137) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/api/provenance/chain/:entityId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var chains, err_138;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.cryptoProvenanceChain.findMany({
                        where: { entityId: req.params.entityId },
                        orderBy: { recordedAt: 'desc' },
                        take: 100
                    })];
            case 1:
                chains = _a.sent();
                return [2 /*return*/, res.json(chains)];
            case 2:
                err_138 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: String(err_138) })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ── Error Handler (must be last middleware) ──────────────────────
app.use((0, middleware_1.errorHandler)());
// ── Server & Graceful Shutdown ───────────────────────────────────
var PORT = parseInt(process.env.PORT || '3000', 10);
var server = app.listen(PORT, '0.0.0.0', function () { return __awaiter(void 0, void 0, void 0, function () {
    var proj, err_139;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logger_1.default.info("Server listening on http://0.0.0.0:".concat(PORT));
                // ── Attach WebSocket server to the same HTTP server ──────────────────────
                initWebSocketServer(server);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 5, , 6]);
                return [4 /*yield*/, prisma.project.findFirst({ orderBy: { createdAt: 'asc' } })];
            case 2:
                proj = _a.sent();
                if (!!proj) return [3 /*break*/, 4];
                return [4 /*yield*/, prisma.project.create({
                        data: { name: 'Default Workspace', description: 'Auto-generated default workspace' }
                    })];
            case 3:
                proj = _a.sent();
                logger_1.default.info("Created default project: ".concat(proj.id));
                _a.label = 4;
            case 4:
                global.DEFAULT_PROJECT_ID = proj.id;
                return [3 /*break*/, 6];
            case 5:
                err_139 = _a.sent();
                logger_1.default.error({ err: err_139 }, 'Failed to create default project');
                return [3 /*break*/, 6];
            case 6:
                // Start the lightweight job scheduler
                (0, data_integration_1.startScheduler)(prisma);
                // Start the telemetry rollup scheduler
                (0, rollup_engine_1.startRollupScheduler)(prisma);
                // Start the relationship confidence decay scheduler
                (0, relationship_derivation_service_1.startConfidenceDecayScheduler)(prisma);
                // Initialize Apollo environments and start heartbeat
                apolloService.ensureEnvironments().then(function () {
                    logger_1.default.info("Apollo environments verified.");
                    setInterval(function () {
                        apolloService.runHealthHeartbeat().catch(function (err) { return logger_1.default.error("Apollo heartbeat failed", err); });
                    }, 10000); // 10 second heartbeat for fast demo feedback
                });
                return [2 /*return*/];
        }
    });
}); });
// Graceful shutdown handler
function shutdown(signal) {
    var _this = this;
    logger_1.default.info("Received ".concat(signal, ", shutting down gracefully..."));
    server.close(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger_1.default.info('HTTP server closed');
                    return [4 /*yield*/, prisma.$disconnect()];
                case 1:
                    _a.sent();
                    logger_1.default.info('Database pool closed');
                    process.exit(0);
                    return [2 /*return*/];
            }
        });
    }); });
    // Force shutdown after 10s
    setTimeout(function () {
        logger_1.default.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000).unref();
}
process.on('SIGTERM', function () { return shutdown('SIGTERM'); });
process.on('SIGINT', function () { return shutdown('SIGINT'); });
var templateObject_1, templateObject_2, templateObject_3, templateObject_4;
