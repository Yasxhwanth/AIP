import { PrismaClient } from './generated/prisma/client';

// ── Safe Expression Parser ───────────────────────────────────────
// A recursive descent parser for simple math expressions.
// Supports: +, -, *, /, %, parentheses, numeric literals, variable references.
// NO eval() — fully sandboxed.

type Token =
    | { type: 'NUMBER'; value: number }
    | { type: 'VAR'; name: string }
    | { type: 'OP'; op: string }
    | { type: 'LPAREN' }
    | { type: 'RPAREN' };

function tokenize(expr: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;

    while (i < expr.length) {
        const ch = expr[i]!;

        // Whitespace
        if (/\s/.test(ch)) { i++; continue; }

        // Number (including decimals)
        if (/[0-9.]/.test(ch)) {
            let num = '';
            while (i < expr.length && /[0-9.]/.test(expr[i]!)) {
                num += expr[i]!;
                i++;
            }
            tokens.push({ type: 'NUMBER', value: parseFloat(num) });
            continue;
        }

        // Variable name (alphanumeric + underscore)
        if (/[a-zA-Z_]/.test(ch)) {
            let name = '';
            while (i < expr.length && /[a-zA-Z0-9_]/.test(expr[i]!)) {
                name += expr[i]!;
                i++;
            }
            tokens.push({ type: 'VAR', name });
            continue;
        }

        // Operators
        if ('+-*/%'.includes(ch)) {
            tokens.push({ type: 'OP', op: ch });
            i++;
            continue;
        }

        // Parentheses
        if (ch === '(') { tokens.push({ type: 'LPAREN' }); i++; continue; }
        if (ch === ')') { tokens.push({ type: 'RPAREN' }); i++; continue; }

        throw new Error(`Unexpected character '${ch}' in expression at position ${i}`);
    }

    return tokens;
}

// Recursive descent parser: expression → term → factor → atom
class Parser {
    private pos = 0;

    constructor(private tokens: Token[]) { }

    parse(): number {
        const result = this.parseExpression();
        if (this.pos < this.tokens.length) {
            throw new Error('Unexpected tokens after expression');
        }
        return result;
    }

    private peek(): Token | undefined {
        return this.tokens[this.pos];
    }

    private consume(): Token {
        const tok = this.tokens[this.pos];
        if (!tok) throw new Error('Unexpected end of expression');
        this.pos++;
        return tok;
    }

    // expression = term (('+' | '-') term)*
    private parseExpression(): number {
        let left = this.parseTerm();

        while (this.peek()?.type === 'OP' && (this.peek() as any).op === '+' || this.peek()?.type === 'OP' && (this.peek() as any).op === '-') {
            const op = (this.consume() as { type: 'OP'; op: string }).op;
            const right = this.parseTerm();
            left = op === '+' ? left + right : left - right;
        }

        return left;
    }

    // term = factor (('*' | '/' | '%') factor)*
    private parseTerm(): number {
        let left = this.parseFactor();

        while (this.peek()?.type === 'OP' && ['*', '/', '%'].includes((this.peek() as any).op)) {
            const op = (this.consume() as { type: 'OP'; op: string }).op;
            const right = this.parseFactor();
            if (op === '*') left = left * right;
            else if (op === '/') {
                if (right === 0) throw new Error('Division by zero');
                left = left / right;
            }
            else left = left % right;
        }

        return left;
    }

    // factor = NUMBER | VAR | '(' expression ')'
    private parseFactor(): number {
        const tok = this.peek();

        if (!tok) throw new Error('Unexpected end of expression');

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
            const val = this.variables[tok.name];
            if (val === undefined || val === null) {
                throw new Error(`Variable '${tok.name}' is not defined`);
            }
            if (typeof val !== 'number') {
                throw new Error(`Variable '${tok.name}' is not a number (got ${typeof val})`);
            }
            return val;
        }

        if (tok.type === 'LPAREN') {
            this.consume();
            const result = this.parseExpression();
            const closing = this.consume();
            if (closing.type !== 'RPAREN') {
                throw new Error('Expected closing parenthesis');
            }
            return result;
        }

        throw new Error(`Unexpected token: ${JSON.stringify(tok)}`);
    }

    // Variables are set externally before parsing
    public variables: Record<string, unknown> = {};
}

// ── Public API ───────────────────────────────────────────────────

/**
 * Evaluates a math expression with variable substitution.
 * Safe — no eval(), uses a custom parser.
 *
 * @example
 *   evaluateExpression("output / input * 100", { output: 80, input: 100 })
 *   // → 80
 */
export function evaluateExpression(
    expression: string,
    variables: Record<string, unknown>,
): number {
    const tokens = tokenize(expression);
    const parser = new Parser(tokens);
    parser.variables = variables;
    return parser.parse();
}

/**
 * Evaluates all computed metrics for a given entity type against an entity's data.
 * Returns an array of { name, value, unit, error? } for each metric.
 */
export async function evaluateComputedMetrics(
    entityTypeId: string,
    entityData: Record<string, unknown>,
    prisma: PrismaClient,
): Promise<{ name: string; value: number | null; unit: string | null; error?: string }[]> {
    const definitions = await prisma.computedMetricDefinition.findMany({
        where: { entityTypeId, enabled: true },
    });

    return definitions.map((def) => {
        try {
            const value = evaluateExpression(def.expression, entityData);
            return { name: def.name, value, unit: def.unit };
        } catch (err) {
            return { name: def.name, value: null, unit: def.unit, error: String(err) };
        }
    });
}
