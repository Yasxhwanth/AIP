import { EntitySnapshot, OntologyQueryService } from './query/types.js';
import { EntityVersionId } from './types.js';
import {
    ConditionExpression,
    RuleVersion,
    DomainEvent,
    RuleStatus,
    LogicalOperator,
    ComparisonOperator,
} from './rule-types.js';

/**
 * Persistence service for rule state and events.
 */
export interface RulePersistenceService {
    /** Gets the last evaluation result for a rule/object pair */
    getPreviousResult(
        ruleVersionId: string,
        targetObjectId: string,
        asOf: Date
    ): Promise<boolean | null>;

    /** Saves the evaluation result */
    saveEvaluationState(
        ruleVersionId: string,
        targetObjectId: string,
        targetObjectType: 'ENTITY' | 'RELATIONSHIP',
        asOf: Date,
        result: boolean
    ): Promise<void>;

    /** Saves a domain event */
    saveEvent(event: DomainEvent): Promise<void>;

    /** Gets all published rule versions for an ontology version */
    getPublishedRules(ontologyVersionId: string): Promise<RuleVersion[]>;
}

/**
 * Core engine for evaluating declarative rules against ontology snapshots.
 */
export class RuleEvaluationEngine {
    constructor(
        private queryService: OntologyQueryService,
        private persistenceService: RulePersistenceService
    ) { }

    /**
     * Main entry point for processing an entity update.
     * 
     * @param entityVersionId The version of the entity that was just created/updated.
     * @param asOf The time at which to evaluate rules.
     */
    public async processEntityUpdate(entityVersionId: EntityVersionId, asOf: Date): Promise<void> {
        // 1. Resolve Metadata Context (RE-6)
        const ontologyVersionId = await this.queryService.resolveMetadataVersion(asOf);

        // 2. Fetch Entity Snapshot
        // We need to find the entity ID first. This assumes we can get it from the version ID.
        // For this implementation, we'll assume the query service can get a snapshot by version ID.
        const snapshot = await this.queryService.getEntityByVersion(entityVersionId);
        if (!snapshot) return;

        // 3. Get Published Rules for this Ontology Version
        const rules = await this.persistenceService.getPublishedRules(ontologyVersionId);

        // 4. Evaluate each rule
        for (const rule of rules) {
            // Resolve previous result (RE-7)
            const previousResult = await this.persistenceService.getPreviousResult(
                rule.id,
                snapshot.id,
                asOf
            );

            // Evaluate transition
            const event = await this.evaluateRule(rule, snapshot, previousResult);

            // 5. Record State and Emit Event (RE-3, RE-5)
            const currentResult = this.evaluateCondition(rule.configuration, snapshot);

            await this.persistenceService.saveEvaluationState(
                rule.id,
                snapshot.id,
                'ENTITY',
                asOf,
                currentResult
            );

            if (event) {
                await this.persistenceService.saveEvent(event);
            }
        }
    }

    /**
     * Evaluates a condition expression against an entity snapshot.
     * 
     * @invariant RE-1: Rules are declarative and contain no executable code.
     * @invariant RE-2: Evaluation does not modify any ontology data.
     */
    public evaluateCondition(condition: ConditionExpression, snapshot: EntitySnapshot): boolean {
        const { operator, expressions, path, comparison, value } = condition;

        // Logical Operators
        if (operator) {
            if (!expressions || expressions.length === 0) {
                throw new Error(`Logical operator ${operator} requires expressions`);
            }

            switch (operator) {
                case 'AND':
                    return expressions.every(expr => expr && this.evaluateCondition(expr, snapshot));
                case 'OR':
                    return expressions.some(expr => expr && this.evaluateCondition(expr, snapshot));
                case 'NOT':
                    if (expressions.length !== 1 || !expressions[0]) {
                        throw new Error('NOT operator requires exactly one expression');
                    }
                    return !this.evaluateCondition(expressions[0], snapshot);
                default:
                    throw new Error(`Unsupported logical operator: ${operator}`);
            }
        }

        // Comparison Operators
        if (path && comparison) {
            const actualValue = this.resolvePath(snapshot, path);
            return this.compare(actualValue, comparison, value);
        }

        throw new Error('Invalid condition expression: must have operator or path/comparison');
    }

    /**
     * Compares current result with previous state to detect transitions and emit events.
     * 
     * @invariant RE-5: Idempotent per rule_version and entity_version.
     * @invariant RE-7: Time-scoped state for replayability.
     */
    public async evaluateRule(
        rule: RuleVersion,
        snapshot: EntitySnapshot,
        previousResult: boolean | null
    ): Promise<DomainEvent | null> {
        const currentResult = this.evaluateCondition(rule.configuration, snapshot);

        // Transition Detection: false -> true
        if (currentResult === true && previousResult === false) {
            return {
                id: crypto.randomUUID(),
                rule_version_id: rule.id,
                entity_version_id: snapshot.version_id,
                event_type: 'RULE_TRIGGERED',
                payload: {
                    rule_id: rule.id,
                    entity_id: snapshot.id,
                    asOf: snapshot.valid_from,
                },
                created_at: new Date(),
            };
        }

        return null;
    }

    /**
     * Resolves a path (e.g., "attributes.status") against a snapshot.
     */
    private resolvePath(snapshot: any, path: string): any {
        const parts = path.split('.');
        let current = snapshot;

        for (const part of parts) {
            if (current === null || current === undefined) {
                return undefined;
            }
            current = current[part];
        }

        return current;
    }

    /**
     * Performs comparison between actual and expected values.
     */
    private compare(actual: any, operator: ComparisonOperator, expected: any): boolean {
        switch (operator) {
            case 'EQUALS':
                return actual === expected;
            case 'NOT_EQUALS':
                return actual !== expected;
            case 'GREATER_THAN':
                return actual > expected;
            case 'LESS_THAN':
                return actual < expected;
            case 'CONTAINS':
                if (Array.isArray(actual)) {
                    return actual.includes(expected);
                }
                if (typeof actual === 'string') {
                    return actual.includes(expected);
                }
                return false;
            case 'EXISTS':
                return actual !== undefined && actual !== null;
            default:
                throw new Error(`Unsupported comparison operator: ${operator}`);
        }
    }
}
