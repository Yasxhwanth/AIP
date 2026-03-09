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
exports.evaluateExpression = evaluateExpression;
exports.evaluateComputedMetrics = evaluateComputedMetrics;
function tokenize(expr) {
    var tokens = [];
    var i = 0;
    while (i < expr.length) {
        var ch = expr[i];
        // Whitespace
        if (/\s/.test(ch)) {
            i++;
            continue;
        }
        // Number (including decimals)
        if (/[0-9.]/.test(ch)) {
            var num = '';
            while (i < expr.length && /[0-9.]/.test(expr[i])) {
                num += expr[i];
                i++;
            }
            tokens.push({ type: 'NUMBER', value: parseFloat(num) });
            continue;
        }
        // Variable name (alphanumeric + underscore)
        if (/[a-zA-Z_]/.test(ch)) {
            var name_1 = '';
            while (i < expr.length && /[a-zA-Z0-9_]/.test(expr[i])) {
                name_1 += expr[i];
                i++;
            }
            tokens.push({ type: 'VAR', name: name_1 });
            continue;
        }
        // Operators
        if ('+-*/%'.includes(ch)) {
            tokens.push({ type: 'OP', op: ch });
            i++;
            continue;
        }
        // Parentheses
        if (ch === '(') {
            tokens.push({ type: 'LPAREN' });
            i++;
            continue;
        }
        if (ch === ')') {
            tokens.push({ type: 'RPAREN' });
            i++;
            continue;
        }
        throw new Error("Unexpected character '".concat(ch, "' in expression at position ").concat(i));
    }
    return tokens;
}
// Recursive descent parser: expression → term → factor → atom
var Parser = /** @class */ (function () {
    function Parser(tokens) {
        this.tokens = tokens;
        this.pos = 0;
        // Variables are set externally before parsing
        this.variables = {};
    }
    Parser.prototype.parse = function () {
        var result = this.parseExpression();
        if (this.pos < this.tokens.length) {
            throw new Error('Unexpected tokens after expression');
        }
        return result;
    };
    Parser.prototype.peek = function () {
        return this.tokens[this.pos];
    };
    Parser.prototype.consume = function () {
        var tok = this.tokens[this.pos];
        if (!tok)
            throw new Error('Unexpected end of expression');
        this.pos++;
        return tok;
    };
    // expression = term (('+' | '-') term)*
    Parser.prototype.parseExpression = function () {
        var _a, _b;
        var left = this.parseTerm();
        while (((_a = this.peek()) === null || _a === void 0 ? void 0 : _a.type) === 'OP' && this.peek().op === '+' || ((_b = this.peek()) === null || _b === void 0 ? void 0 : _b.type) === 'OP' && this.peek().op === '-') {
            var op = this.consume().op;
            var right = this.parseTerm();
            left = op === '+' ? left + right : left - right;
        }
        return left;
    };
    // term = factor (('*' | '/' | '%') factor)*
    Parser.prototype.parseTerm = function () {
        var _a;
        var left = this.parseFactor();
        while (((_a = this.peek()) === null || _a === void 0 ? void 0 : _a.type) === 'OP' && ['*', '/', '%'].includes(this.peek().op)) {
            var op = this.consume().op;
            var right = this.parseFactor();
            if (op === '*')
                left = left * right;
            else if (op === '/') {
                if (right === 0)
                    throw new Error('Division by zero');
                left = left / right;
            }
            else
                left = left % right;
        }
        return left;
    };
    // factor = NUMBER | VAR | '(' expression ')'
    Parser.prototype.parseFactor = function () {
        var tok = this.peek();
        if (!tok)
            throw new Error('Unexpected end of expression');
        // Unary minus
        if (tok.type === 'OP' && tok.op === '-') {
            this.consume();
            return -this.parseFactor();
        }
        if (tok.type === 'NUMBER') {
            this.consume();
            return tok.value;
        }
        if (tok.type === 'VAR') {
            this.consume();
            var val = this.variables[tok.name];
            if (val === undefined || val === null) {
                throw new Error("Variable '".concat(tok.name, "' is not defined"));
            }
            if (typeof val !== 'number') {
                throw new Error("Variable '".concat(tok.name, "' is not a number (got ").concat(typeof val, ")"));
            }
            return val;
        }
        if (tok.type === 'LPAREN') {
            this.consume();
            var result = this.parseExpression();
            var closing = this.consume();
            if (closing.type !== 'RPAREN') {
                throw new Error('Expected closing parenthesis');
            }
            return result;
        }
        throw new Error("Unexpected token: ".concat(JSON.stringify(tok)));
    };
    return Parser;
}());
// ── Public API ───────────────────────────────────────────────────
/**
 * Evaluates a math expression with variable substitution.
 * Safe — no eval(), uses a custom parser.
 *
 * @example
 *   evaluateExpression("output / input * 100", { output: 80, input: 100 })
 *   // → 80
 */
function evaluateExpression(expression, variables) {
    var tokens = tokenize(expression);
    var parser = new Parser(tokens);
    parser.variables = variables;
    return parser.parse();
}
/**
 * Evaluates all computed metrics for a given entity type against an entity's data.
 * Returns an array of { name, value, unit, error? } for each metric.
 */
function evaluateComputedMetrics(entityTypeId, entityData, prisma) {
    return __awaiter(this, void 0, void 0, function () {
        var definitions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.computedMetricDefinition.findMany({
                        where: { entityTypeId: entityTypeId, enabled: true },
                    })];
                case 1:
                    definitions = _a.sent();
                    return [2 /*return*/, definitions.map(function (def) {
                            try {
                                var value = evaluateExpression(def.expression, entityData);
                                return { name: def.name, value: value, unit: def.unit };
                            }
                            catch (err) {
                                return { name: def.name, value: null, unit: def.unit, error: String(err) };
                            }
                        })];
            }
        });
    });
}
