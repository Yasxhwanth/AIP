"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApolloService = void 0;
var ApolloService = /** @class */ (function () {
    function ApolloService(prisma) {
        this.prisma = prisma;
    }
    /**
     * Seeds initial environments if none exist (useful for a fresh project workspace)
     */
    ApolloService.prototype.ensureEnvironments = function () {
        return __awaiter(this, void 0, void 0, function () {
            var count;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.apolloEnvironment.count()];
                    case 1:
                        count = _a.sent();
                        if (!(count === 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.prisma.apolloEnvironment.createMany({
                                data: [
                                    { name: "Dev", tier: "cloud", description: "Integration & testing", active: true },
                                    { name: "Staging", tier: "cloud", description: "Pre-prod dry run", active: true },
                                    { name: "Production", tier: "cloud", description: "Live customer traffic", active: true },
                                    { name: "Classified (SCIF)", tier: "air-gap", description: "Air-gapped secure facility", active: true }
                                ]
                            })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Creates a new deployment for an environment, which conceptually pushes a new snapshot of logic/rules to it.
     */
    ApolloService.prototype.deployRelease = function (environmentId, releaseVersion, canaryPercent, deployedBy) {
        return __awaiter(this, void 0, void 0, function () {
            var payloadSnapshot, deployment;
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = {
                            timestamp: new Date().toISOString()
                        };
                        return [4 /*yield*/, this.prisma.aIPMetric.count()];
                    case 1:
                        _a.metrics = _b.sent();
                        return [4 /*yield*/, this.prisma.aIPFunction.count()];
                    case 2:
                        _a.functions = _b.sent();
                        return [4 /*yield*/, this.prisma.aIPAutomate.count()];
                    case 3:
                        payloadSnapshot = (_a.automations = _b.sent(),
                            _a);
                        return [4 /*yield*/, this.prisma.apolloDeployment.create({
                                data: {
                                    environmentId: environmentId,
                                    releaseVersion: releaseVersion,
                                    strategy: canaryPercent < 100 ? "canary" : "rolling",
                                    canaryPercent: canaryPercent,
                                    payload: payloadSnapshot,
                                    status: "deploying",
                                    deployedBy: deployedBy
                                }
                            })];
                    case 4:
                        deployment = _b.sent();
                        // Simulate deployment asynchronously
                        setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                            var finalStatus, err_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        finalStatus = Math.random() < 0.05 ? "degraded" : "healthy";
                                        return [4 /*yield*/, this.prisma.apolloDeployment.update({
                                                where: { id: deployment.id },
                                                data: { status: finalStatus, completedAt: new Date() }
                                            })];
                                    case 1:
                                        _a.sent();
                                        return [3 /*break*/, 3];
                                    case 2:
                                        err_1 = _a.sent();
                                        console.error("Deploy sim error", err_1);
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); }, 3000);
                        return [2 /*return*/, deployment];
                }
            });
        });
    };
    /**
     * Rollback to a previous deployment version. Conceptually restores that old JSON payload to active use.
     */
    ApolloService.prototype.rollback = function (deploymentId, revertedBy) {
        return __awaiter(this, void 0, void 0, function () {
            var targetDeploy, newRollbackDeploy;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.apolloDeployment.findUnique({
                            where: { id: deploymentId }
                        })];
                    case 1:
                        targetDeploy = _a.sent();
                        if (!targetDeploy)
                            throw new Error("Deployment not found");
                        return [4 /*yield*/, this.prisma.apolloDeployment.create({
                                data: {
                                    environmentId: targetDeploy.environmentId,
                                    releaseVersion: targetDeploy.releaseVersion + "-rollback",
                                    strategy: "immediate",
                                    canaryPercent: 100,
                                    payload: targetDeploy.payload,
                                    status: "deploying",
                                    deployedBy: revertedBy,
                                    rollbackFrom: targetDeploy.id,
                                    notes: "Automatic rollback to ".concat(targetDeploy.releaseVersion)
                                }
                            })];
                    case 2:
                        newRollbackDeploy = _a.sent();
                        // Sim
                        setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.prisma.apolloDeployment.update({
                                            where: { id: newRollbackDeploy.id },
                                            data: { status: "healthy", completedAt: new Date() }
                                        })];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); }, 1500);
                        return [2 /*return*/, newRollbackDeploy];
                }
            });
        });
    };
    /**
     * Simulates external agents reporting health back to the control plane
     */
    ApolloService.prototype.runHealthHeartbeat = function () {
        return __awaiter(this, void 0, void 0, function () {
            var envs, services, _i, envs_1, env, count, oldConfigs, _a, services_1, svc, isDown, isDegraded;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.prisma.apolloEnvironment.findMany({ where: { active: true } })];
                    case 1:
                        envs = _b.sent();
                        services = ["api-server", "pipeline-worker", "ws-broker"];
                        _i = 0, envs_1 = envs;
                        _b.label = 2;
                    case 2:
                        if (!(_i < envs_1.length)) return [3 /*break*/, 11];
                        env = envs_1[_i];
                        return [4 /*yield*/, this.prisma.apolloHealthCheck.count({ where: { environmentId: env.id } })];
                    case 3:
                        count = _b.sent();
                        if (!(count > 100)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.prisma.apolloHealthCheck.findMany({
                                where: { environmentId: env.id },
                                orderBy: { checkedAt: 'asc' },
                                take: 50
                            })];
                    case 4:
                        oldConfigs = _b.sent();
                        if (!(oldConfigs.length > 0)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.prisma.apolloHealthCheck.deleteMany({
                                where: { id: { in: oldConfigs.map(function (c) { return c.id; }) } }
                            })];
                    case 5:
                        _b.sent();
                        _b.label = 6;
                    case 6:
                        _a = 0, services_1 = services;
                        _b.label = 7;
                    case 7:
                        if (!(_a < services_1.length)) return [3 /*break*/, 10];
                        svc = services_1[_a];
                        isDown = Math.random() < 0.02;
                        isDegraded = !isDown && Math.random() < 0.10;
                        return [4 /*yield*/, this.prisma.apolloHealthCheck.create({
                                data: {
                                    environmentId: env.id,
                                    service: svc,
                                    status: isDown ? "down" : isDegraded ? "degraded" : "ok",
                                    latencyMs: isDown ? 0 : Math.floor(Math.random() * (isDegraded ? 800 : 50)) + 10,
                                    cpuPercent: isDown ? 0 : Math.random() * (isDegraded ? 95 : 40) + 5,
                                    memPercent: isDown ? 0 : Math.random() * (isDegraded ? 90 : 50) + 10,
                                    errorMessage: isDown ? "Connection timeout" : isDegraded ? "High latency detected" : null
                                }
                            })];
                    case 8:
                        _b.sent();
                        _b.label = 9;
                    case 9:
                        _a++;
                        return [3 /*break*/, 7];
                    case 10:
                        _i++;
                        return [3 /*break*/, 2];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    return ApolloService;
}());
exports.ApolloService = ApolloService;
