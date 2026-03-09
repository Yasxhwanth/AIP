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
exports.AbacEngine = void 0;
/**
 * Attribute-Based Access Control (ABAC) Engine
 * Evaluates a request against stored AbacPolicy definitions.
 */
var AbacEngine = /** @class */ (function () {
    function AbacEngine(prisma) {
        this.prisma = prisma;
    }
    /**
     * Main evaluation function.
     * Returns whether the actor is allowed to perform the action on the resource.
     * Deny by default if no matching ALLOW policies are found, or if a DENY policy matches.
     */
    AbacEngine.prototype.evaluate = function (actor, action, resource) {
        return __awaiter(this, void 0, void 0, function () {
            var policies, isAllowed, matchedAllow, matchedDeny, _i, policies_1, policy, matches;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.abacPolicy.findMany({
                            where: {
                                OR: [
                                    { action: action },
                                    { action: '*' }
                                ],
                                AND: [
                                    {
                                        OR: [
                                            { resourceType: resource.type },
                                            { resourceType: '*' }
                                        ]
                                    }
                                ]
                            }
                        })];
                    case 1:
                        policies = _a.sent();
                        if (policies.length === 0) {
                            return [2 /*return*/, {
                                    allowed: false,
                                    reason: 'Implicit Deny: No matching policies found.',
                                    matchedPolicies: []
                                }];
                        }
                        isAllowed = false;
                        matchedAllow = [];
                        matchedDeny = [];
                        for (_i = 0, policies_1 = policies; _i < policies_1.length; _i++) {
                            policy = policies_1[_i];
                            matches = this.evaluateCondition(policy.condition, actor, resource);
                            if (matches) {
                                if (policy.effect === 'DENY') {
                                    matchedDeny.push(policy.name);
                                }
                                else if (policy.effect === 'ALLOW') {
                                    matchedAllow.push(policy.name);
                                    isAllowed = true;
                                }
                            }
                        }
                        // Explicit DENY always overrides ALLOW
                        if (matchedDeny.length > 0) {
                            return [2 /*return*/, {
                                    allowed: false,
                                    reason: "Explicit Deny: Policy [".concat(matchedDeny.join(', '), "] evaluated to DENY."),
                                    matchedPolicies: matchedDeny
                                }];
                        }
                        if (isAllowed) {
                            return [2 /*return*/, {
                                    allowed: true,
                                    reason: "Explicit Allow: Policy [".concat(matchedAllow.join(', '), "] evaluated to ALLOW."),
                                    matchedPolicies: matchedAllow
                                }];
                        }
                        return [2 /*return*/, {
                                allowed: false,
                                reason: 'Implicit Deny: No ALLOW policies condition matched.',
                                matchedPolicies: []
                            }];
                }
            });
        });
    };
    /**
     * Evaluates the JSON condition tree against the request context.
     * E.g. { "actor.role": "ADMIN" } or { "actor.clearanceLevel": { ">=": "resource.classification" } }
     */
    AbacEngine.prototype.evaluateCondition = function (condition, actor, resource) {
        if (!condition || Object.keys(condition).length === 0) {
            // Empty condition means it matches everything within the action/resource scope
            return true;
        }
        // Build a flat context for simple property resolution
        var context = {
            actor: actor,
            resource: resource.attributes || {},
            env: {
                timeOfDay: new Date().getHours(), // example
            }
        };
        // Simplified rule engine for JSON conditions
        // Iterate over object keys. All top-level keys are implicitly AND'ed.
        for (var _i = 0, _a = Object.entries(condition); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], expectedValue = _b[1];
            var actualValue = this.resolvePath(key, context);
            if (typeof expectedValue === 'object' && expectedValue !== null) {
                // Complex operators (e.g. { "in": ["A", "B"] }, { ">=": 3 })
                var op = Object.keys(expectedValue)[0];
                if (!op)
                    return false;
                var opVal = expectedValue[op];
                // Allow dynamic resolution of expected value if it's a string path like "resource.classification"
                var resolvedOpVal = (typeof opVal === 'string' && opVal.startsWith('resource.')) ?
                    this.resolvePath(opVal, context) : opVal;
                switch (op) {
                    case 'eq':
                        if (actualValue !== resolvedOpVal)
                            return false;
                        break;
                    case 'neq':
                        if (actualValue === resolvedOpVal)
                            return false;
                        break;
                    case 'gt':
                        if (actualValue <= resolvedOpVal)
                            return false;
                        break;
                    case 'gte':
                        if (actualValue < resolvedOpVal)
                            return false;
                        break;
                    case 'lt':
                        if (actualValue >= resolvedOpVal)
                            return false;
                        break;
                    case 'lte':
                        if (actualValue > resolvedOpVal)
                            return false;
                        break;
                    case 'in':
                        if (!Array.isArray(resolvedOpVal) || !resolvedOpVal.includes(actualValue))
                            return false;
                        break;
                    default: return false; // unknown operator
                }
            }
            else {
                // Simple equality
                if (actualValue !== expectedValue)
                    return false;
            }
        }
        return true;
    };
    /**
     * Safely resolve dot notation paths (e.g., "actor.role" -> "ADMIN")
     */
    AbacEngine.prototype.resolvePath = function (path, obj) {
        // @ts-ignore
        return path.split('.').reduce(function (prev, curr) { return (prev && typeof prev === 'object' ? prev[curr] : undefined); }, obj);
    };
    return AbacEngine;
}());
exports.AbacEngine = AbacEngine;
