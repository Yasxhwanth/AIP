# Enterprise Ontology Platform - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Core Engines](#core-engines)
4. [Data Flow](#data-flow)
5. [File Structure](#file-structure)
6. [Key Components](#key-components)
7. [API Reference](#api-reference)
8. [Usage Examples](#usage-examples)

---

## Project Overview

This is a **production-grade enterprise ontology runtime platform**, architecturally equivalent to Palantir Foundry/AIP. The system provides:

- **Metadata-Driven Architecture**: All business logic defined via ontology metadata (object types, attributes, relationships, metrics, workflows)
- **Immutable Truth Storage**: Versioned entity and relationship data with full lineage tracking
- **Governed Data Admission**: All external data must be reviewed before becoming truth
- **Scenario Planning**: Hypothetical futures without affecting reality
- **Authority & Policy Enforcement**: Fine-grained access control with graph-based authority evaluation
- **AI Advisory Layer**: Gemini 2.0 integration for analysis (read-only, ontology-aware)
- **Temporal Queries**: AS-OF time queries for historical accuracy (bi-temporal data model)
- **3D Spatial Visualization**: Interactive map with overlays, projections, and movement interpolation
- **Declarative Workflows**: Visual workflow designer with metadata-defined execution
- **Event-Driven Architecture**: Domain event bus for reactive system behavior and extensibility
- **Decision Journaling**: Immutable audit trail of all decisions with authority tracking
- **Semantic Query Engine**: Declarative filters, relationship traversals, scenario-aware resolution
- **Dynamic UI Generation**: Forms and dashboards generated from compiled ontology schemas
- **Pluggable Persistence**: Abstract persistence layer supporting in-memory and database backends

### Key Principles

1. **No Hardcoded Business Logic**: All business meaning is user-defined via metadata
2. **Read-Only Analytical Layers**: Metrics, Signals, Attention never mutate truth
3. **Deterministic & Replayable**: Same inputs always produce same outputs
4. **Tenant Isolation**: All data scoped to tenant boundaries
5. **Production-Grade**: Not an MVP, built for enterprise scale
6. **Bi-Temporal Data Model**: All queries resolve (Time + Version) for auditability
7. **Event-Driven Extensibility**: Plugin-ready architecture via domain events

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    UI Layer (React)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │   Map    │  │Operations│  │ Signals  │  │Attention│     │
│  │  3D View │  │Dashboard │  │Dashboard │  │Dashboard│     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Query Client (Read-Only Adapter)                │
│  - getEntities(asOf, tenantId)                              │
│  - getOperationalMetrics(asOf, tenantId)                    │
│  - getSignalSeries(signalType, window, asOf, tenantId)      │
│  - getAttentionSnapshot(asOf, tenantId)                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Analytical Engines (Pure Functions)             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ MetricsEngine│  │SignalsEngine │  │AttentionEngine│      │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Ontology Store (Immutable Truth)                │
│  - Entity Versions (temporal)                               │
│  - Relationship Versions                                     │
│  - Attribute Values                                          │
│  - Spatial Snapshots                                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│         Ingestion → Admission → Materialization              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │IngestionEngine│  │AdmissionEngine│ │Materialization│     │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**External Data → Truth:**
1. **Ingestion**: External data normalized and validated → `CandidateTruth`
2. **Admission**: `CandidateTruth` reviewed → `AdmissionCase` created
3. **Decision**: Human approves/rejects → `DecisionJournal` entry
4. **Materialization**: Approved cases → `EntityVersion` created

**Query Flow:**
1. UI requests data with `asOf` time, `tenantId`, and optional `scenarioId`.
2. `QueryClient` routes to `SemanticQueryEngine`.
3. Engine resolves materialized entities by overlaying scenario mutations on truth.
4. Declarative filters and traversals are executed against the materialized state.
5. Results returned as immutable entity snapshots.

---

## Core Engines

### 1. Ingestion Engine

**File**: `src/ontology/ingestion/IngestionEngine.ts`

**Purpose**: Accepts external data, normalizes it, validates it, and produces `CandidateTruth` objects.

**Key Code**:
```typescript
export class IngestionEngine {
    public async ingest(
        payload: Record<string, unknown>,
        source: IngestionSource,
        version: IngestionSourceVersion,
        entityType: EntityType,
        attributes: AttributeDefinition[],
        constraints: EntityConstraint[]
    ): Promise<IngestionEvent> {
        // 1. Generate Checksum & Idempotency Key
        const checksum = this.generateChecksum(payload);

        // 2. Create Ingestion Event (Immutable Raw Record)
        const event: IngestionEvent = {
            id: crypto.randomUUID() as IngestionEventId,
            tenant_id: source.tenant_id,
            source_version_id: version.id,
            received_at: new Date(),
            raw_payload: payload,
            checksum: checksum,
            status: IngestionEventStatus.RECEIVED
        };

        // 3. Normalize Payload
        const normalizedData = normalizePayload(payload, version.mapping_rules);

        // 4. Validate against Ontology
        const validationResult = validationEngine.validateEntity(
            normalizedData,
            entityType,
            attributes,
            constraints
        );

        if (!validationResult.valid) {
            return this.rejectEvent(event, validationResult.errors);
        }

        // 5. Create Candidate Truth
        const candidate: CandidateTruth = {
            id: crypto.randomUUID() as CandidateTruthId,
            tenant_id: source.tenant_id,
            candidate_type: CandidateType.ENTITY,
            proposed_data: normalizedData,
            derived_from_event_id: event.id,
            created_at: new Date()
        };

        return processedEvent;
    }
}
```

**Invariants**:
- External data never becomes truth automatically
- All events are immutable
- Validation happens before candidate creation

---

### 2. Truth Admission Engine

**File**: `src/ontology/admission/TruthAdmissionEngine.ts`

**Purpose**: Creates admission cases from candidate truth, computes diffs, and records decisions.

**Key Code**:
```typescript
export class TruthAdmissionEngine {
    public createAdmissionCase(candidate: CandidateTruth, currentEntity?: Entity): AdmissionCase {
        const diff = this.computeDiff(candidate, currentEntity);

        const admissionCase: AdmissionCase = {
            id: crypto.randomUUID() as AdmissionCaseId,
            tenant_id: candidate.tenant_id,
            candidate_id: candidate.id,
            status: AdmissionStatus.PENDING,
            diff: diff,
            created_at: new Date(),
            resolution: null
        };

        this.persistCase(admissionCase);
        return admissionCase;
    }

    public async submitDecision(
        caseId: AdmissionCaseId,
        decision: AdmissionDecision,
        justification: string,
        author: string
    ): Promise<AdmissionCase> {
        // Check Authority
        const snapshot = authorityGraphEngine.resolveAuthoritySnapshot(
            author,
            admissionCase.tenant_id,
            new Date()
        );

        // Create Decision Journal Entry
        const journalEntry = decisionManager.submitDecision(journalInput);

        // Update Case Status
        const updatedCase: AdmissionCase = {
            ...admissionCase,
            status: AdmissionStatus.RESOLVED,
            resolution: resolution
        };

        return updatedCase;
    }
}
```

**Invariants**:
- NEVER mutates ontology directly
- ONLY records decisions
- Authority checked before decision acceptance

---

### 3. Truth Materialization Engine

**File**: `src/ontology/materialization/TruthMaterializationEngine.ts`

**Purpose**: Materializes approved admission decisions into the ontology.

**Key Code**:
```typescript
export class TruthMaterializationEngine {
    public async applyAdmissionDecision(admissionCaseId: AdmissionCaseId): Promise<MaterializationResult> {
        // 1. Check for existing job (Idempotency)
        const existingJob = Array.from(this.jobStore.values())
            .find(j => j.admission_case_id === admissionCaseId);
        if (existingJob && existingJob.status === MaterializationStatus.APPLIED) {
            return this.getJobResult(existingJob.id);
        }

        // 2. Load and Verify Admission Case
        const admissionCase = truthAdmissionEngine.getCase(admissionCaseId);
        if (admissionCase.status !== AdmissionStatus.RESOLVED) {
            throw new Error(`Admission case ${admissionCaseId} is not resolved`);
        }

        // 3. Compute Mutations
        const result = await this.executeMaterialization(job, admissionCase);

        // 4. Create Entity Version
        const version: EntityVersion = {
            id: versionId,
            entity_id: entityId,
            version_number: versionNumber,
            valid_from: new Date(),
            valid_to: null,
            change_reason: resolution?.justification || 'Materialized from admission',
            source_system: 'TruthMaterializationEngine',
            created_at: new Date(),
            created_by: resolution?.decided_by || null,
            metadata: {},
            // Lineage Metadata
            admission_case_id: admissionCase.id,
            decision_journal_id: journalId,
            candidate_truth_id: candidate_id,
        };

        // 5. Write to OntologyStore
        ontologyStore.addEntityVersion(version, attributes);

        return result;
    }
}
```

**Invariants**:
- Idempotent: safe to retry
- Forward-only: never updates existing versions
- Full lineage: every version tracks its source

---

### 4. Metrics Engine

**File**: `src/analysis/MetricsEngine.ts`

**Purpose**: Computes operational metrics from ontology truth (read-only).

**Key Code**:
```typescript
export class MetricsEngine {
    static computeOperationalMetrics(asOf: Date, tenantId: string): OperationalMetricsSnapshot {
        const entities = ontologyStore.getEntities(asOf, tenantId);
        const decisions = decisionManager.getDecisions(tenantId);
        const executions = executionManager.getAllIntents();
        const admissionCases = truthAdmissionEngine.getAllCases();

        // Entity Count Metrics
        const entityCounts: EntityCountMetrics = {
            total: entities.length,
            byType: this.countByType(entities),
            byStatus: this.countByStatus(entities)
        };

        // Risk Distribution
        const riskDistribution: RiskDistributionMetrics = {
            atRisk: entities.filter(e => e.status === 'DEGRADED').length,
            healthy: entities.filter(e => e.status === 'OPERATIONAL').length
        };

        // Admission Flow
        const admissionFlow: AdmissionFlowMetrics = {
            pending: admissionCases.filter(c => c.status === AdmissionStatus.PENDING).length,
            approved: admissionCases.filter(c => 
                c.resolution?.decision === AdmissionDecision.APPROVED
            ).length,
            rejected: admissionCases.filter(c => 
                c.resolution?.decision === AdmissionDecision.REJECTED
            ).length
        };

        return {
            tenantId,
            asOf,
            computed_at: new Date(),
            entityCounts,
            riskDistribution,
            admissionFlow,
            executionOutcomes: this.computeExecutionOutcomes(executions),
            decisionVelocity: this.computeDecisionVelocity(decisions, asOf)
        };
    }
}
```

**Invariants**:
- Pure function: no side effects
- Deterministic: same inputs → same outputs
- Read-only: never mutates truth

---

### 5. Signals Engine

**File**: `src/analysis/SignalsEngine.ts`

**Purpose**: Generates time-series signals from historical metrics.

**Key Code**:
```typescript
export class SignalsEngine {
    static computeSeriesFor(
        signalType: SignalType,
        window: SignalWindow,
        tenantId: string,
        asOf: Date
    ): SignalSeries {
        const points: SignalPoint[] = [];
        const windowMs = this.getWindowMs(window);
        const bucketSize = windowMs / 20; // 20 buckets

        // Sample metrics over time window
        for (let i = 0; i < 20; i++) {
            const sampleTime = new Date(asOf.getTime() - windowMs + (i * bucketSize));
            const metrics = MetricsEngine.computeOperationalMetrics(sampleTime, tenantId);
            
            const value = this.extractSignalValue(signalType, metrics);
            
            points.push({
                timestamp: sampleTime,
                value: value
            });
        }

        // Compute summary
        const summary: SignalSummary = {
            current: points[points.length - 1]?.value || 0,
            min: Math.min(...points.map(p => p.value)),
            max: Math.max(...points.map(p => p.value)),
            trend: this.computeTrend(points),
            volatility: this.computeVolatility(points)
        };

        return {
            signalType,
            window,
            tenantId,
            asOf,
            points,
            summary
        };
    }
}
```

**Invariants**:
- Time-bound: all points have explicit timestamps
- Deterministic: replay produces same signals
- Derived-only: never introduces new truth

---

### 6. Attention Engine

**File**: `src/attention/AttentionEngine.ts`

**Purpose**: Identifies which signals deserve human attention (read-only).

**Key Code**:
```typescript
export class AttentionEngine {
    static computeAttention({
        tenantId,
        asOf,
        signals
    }: {
        tenantId: string;
        asOf: Date;
        signals: SignalSeries[];
    }): AttentionSnapshot {
        const items: AttentionItem[] = [];

        for (const signal of signals) {
            // Detect acceleration
            if (this.detectAcceleration(signal)) {
                items.push({
                    id: crypto.randomUUID(),
                    tenantId,
                    asOf,
                    type: AttentionType.SIGNAL_ACCELERATION,
                    severity: this.computeSeverity(signal),
                    sourceSignalType: signal.signalType,
                    summary: `Observed acceleration in ${signal.signalType}`,
                    evidence: {
                        window: signal.window,
                        values: signal.points.map(p => p.value),
                        delta: signal.summary.current - signal.points[0]?.value || 0
                    },
                    created_at: new Date()
                });
            }

            // Detect backlog growth
            if (this.detectBacklogGrowth(signal)) {
                items.push({
                    id: crypto.randomUUID(),
                    tenantId,
                    asOf,
                    type: AttentionType.BACKLOG_GROWTH,
                    severity: AttentionSeverity.MEDIUM,
                    sourceSignalType: signal.signalType,
                    summary: `Backlog growth detected in ${signal.signalType}`,
                    evidence: {
                        window: signal.window,
                        values: signal.points.map(p => p.value),
                        delta: signal.summary.current - signal.points[0]?.value || 0
                    },
                    created_at: new Date()
                });
            }
        }

        return {
            tenantId,
            asOf,
            computed_at: new Date(),
            items: items.sort((a, b) => {
                const severityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
                return severityOrder[b.severity] - severityOrder[a.severity];
            })
        };
    }
}
```

**Invariants**:
- Descriptive only: never prescriptive
- No alerts: produces "attention items", not notifications
- Deterministic: replay produces same attention items

---

### 7. Authority Evaluator

**File**: `src/authority/AuthorityEvaluator.ts`

**Purpose**: Evaluates whether an actor has authority to perform an action.

**Key Code**:
```typescript
export class AuthorityEvaluator {
    public evaluate(request: EvaluationRequest): EvaluationResult {
        const { actorId, intentType, targetEntityId, context } = request;

        // 1. Check if actor exists
        const actor = this.nodes.get(actorId);
        if (!actor) {
            return this.deny(DenialReasonCode.NO_AUTHORITY_PATH, 
                `Actor ${actorId} not found`);
        }

        // 2. Find authority path
        const proof = this.findAuthorityPath(actorId, request, 0);

        if (proof) {
            return {
                status: AuthorityStatus.ALLOWED,
                proof: {
                    evaluatedAt: new Date().toISOString(),
                    evaluatorVersion: '1.0.0',
                    ...proof
                }
            };
        }

        return this.deny(DenialReasonCode.NO_AUTHORITY_PATH, 
            `No valid authority path found`);
    }

    private findAuthorityPath(
        currentActorId: string,
        request: EvaluationRequest,
        depth: number
    ): AuthorityProofSnapshot | null {
        if (depth > this.MAX_DELEGATION_DEPTH) return null;

        // Check DIRECT edges
        for (const edge of activeEdges) {
            if (edge.type === AuthorityEdgeType.DIRECT && 
                edge.intent === request.intentType) {
                if (this.matchesScope(edge, request) && 
                    this.passesConstraints(edge, request)) {
                    return {
                        matchedEdgeId: edge.edgeId,
                        constraintsChecked: edge.constraints
                    };
                }
            }
        }

        // Check DELEGATED edges (recursive)
        for (const edge of activeEdges) {
            if (edge.type === AuthorityEdgeType.DELEGATED) {
                const delegateeProof = this.findAuthorityPath(
                    edge.toNodeId, request, depth + 1
                );
                if (delegateeProof) {
                    return {
                        matchedEdgeId: delegateeProof.matchedEdgeId,
                        delegationChainIds: [edge.edgeId, ...delegateeProof.delegationChainIds || []],
                        constraintsChecked: delegateeProof.constraintsChecked
                    };
                }
            }
        }

        return null;
    }
}
```

**Invariants**:
- Graph-based: authority is a graph, not a flat list
- Delegation support: actors can delegate authority
- Constraint checking: time windows, cost limits, etc.

---

### 8. Gemini AI Client

**File**: `src/ai/GeminiClient.ts`

**Purpose**: Integrates with Google Gemini 2.0 API for advisory analysis.

**Key Code**:
```typescript
export class GeminiClient {
    private genAI: GoogleGenerativeAI | null = null;
    private model: any = null;

    private constructor() {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ 
                model: 'gemini-2.0-flash-exp' 
            });
        }
    }

    public async generateAdvisory(
        prompt: string,
        contextSnapshot: AIContextSnapshot
    ): Promise<{ content: string; dataSources: string[] } | null> {
        if (!this.model) return null;

        // Format context for Gemini
        const contextText = this.formatContextForGemini(contextSnapshot);
        
        // Build system prompt with strict advisory constraints
        const systemPrompt = `You are an advisory assistant for an enterprise ontology platform.
You do NOT make decisions.
You do NOT recommend actions.
You do NOT approve execution.

Your role is to explain information provided and describe observations.

Rules:
- Use neutral language only
- Avoid words: "should", "must", "recommended", "critical", "urgent"
- Describe observations and possibilities
- Include uncertainty where appropriate
- Never provide instructions or commands

Context provided:
${contextText}

User question: ${prompt}

Provide a neutral, descriptive response analyzing the context.`;

        const result = await this.model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();

        // Extract data sources from context
        const dataSources = this.extractDataSources(contextSnapshot);

        return {
            content: text,
            dataSources
        };
    }
}
```

**Invariants**:
- Advisory only: never executes actions
- Tracks data sources: transparency into what AI analyzed
- Fallback to mock: works without API key

---

### 9. Semantic Query Engine

**File**: `src/ontology/query/SemanticQueryEngine.ts`

**Purpose**: Executes declarative ontology queries, including complex filters and relationship traversals.

**Key Code**:
```typescript
export class SemanticQueryEngine {
    public async searchEntities(query: EntityQuery): Promise<Entity[]> {
        // 1. Resolve Active Ontology Version
        const snapshot = ontologySnapshotResolver.resolveActiveSnapshot(asOf, tenantId);
        
        // 2. Resolve Materialized Entities (Truth + Scenario Overlays)
        const allEntities = ScenarioAwareQueryResolver.resolveMaterializedEntities(
            asOf, scenarioId, ontologyVersionId, tenantId
        );

        // 3. Apply Filters
        let filtered = allEntities.filter(e => e.entity_type_id === query.entityType);
        if (query.filter) {
            filtered = filtered.filter(e => this.evaluateFilter(e, query.filter!));
        }

        return filtered;
    }
}
```

**Invariants**:
- Scenario-aware: always respects uncommitted scenario mutations
- Time-consistent: all queries tied to specific `asOf` timestamp
- Metadata-driven: filtering logic based on user-defined attribute types

---

### 10. Ontology Compiler

**File**: `src/ontology/definition/OntologyCompiler.ts`

**Purpose**: Compiles raw ontology metadata into runtime artifacts for dynamic system behavior.

**Key Features**:
- **Validators**: Generates `CompiledValidator` for each object type with attribute type checking, constraint validation, and entity-level constraint enforcement.
- **UI Schemas**: Compiles `CompiledUISchema` for dynamic form rendering with field definitions, layouts, and validation rules.
- **AI Context Schemas**: Creates `CompiledAIContextSchema` with semantic descriptions for AI reasoning.
- **Query Plans**: Pre-computes index selection, relationship traversal paths, and optimization hints for query execution.
- **Workflow Contracts**: Defines input/output contracts for workflows, including required attributes and mutable fields.
- **Deterministic & Cached**: Same input always produces same output, results cached per ontology version.

**Key Code**:
```typescript
export class OntologyCompiler {
    public compile(snapshot: OntologySnapshot): CompiledOntologySnapshot {
        // Generate runtime artifacts
        const validators = this.compileValidators(snapshot);
        const uiSchemas = this.compileUISchemas(snapshot);
        const aiContextSchemas = this.compileAIContextSchemas(snapshot);
        const queryPlans = this.compileQueryPlans(snapshot);
        const workflowContracts = this.compileWorkflowContracts(snapshot);

        return {
            ontology_version_id: snapshot.ontology_version_id,
            compiled_at: new Date(),
            snapshot: snapshot,
            validators: validators,
            query_plans: queryPlans,
            ui_schemas: uiSchemas,
            workflow_contracts: workflowContracts,
            ai_context_schemas: aiContextSchemas
        };
    }

    private compileQueryPlans(snapshot: OntologySnapshot): Map<string, any> {
        // Pre-compute indexed attributes and relationship traversal paths
        // Enables optimized query execution
    }

    private compileWorkflowContracts(snapshot: OntologySnapshot): Map<string, any> {
        // Define workflow input/output contracts
        // Validates workflow compatibility with object types
    }
}
```

**Invariants**:
- Pure function: no side effects during compilation
- Version-specific: compiled artifacts tied to ontology version
- Cache management: automatic LRU eviction when cache exceeds 100 entries

---

### 11. Ontology Snapshot Resolver

**File**: `src/ontology/definition/OntologySnapshotResolver.ts`

**Purpose**: Resolves the correct state of the ontology for any given (Time + Version) pair.

**Key Features**:
- Handles deprecation logic (filters out definitions not active at `asOf` time).
- Indexes definitions by name and object type for fast runtime access.
- Critical for bi-temporal replay and auditability.

---

### 12. Event Bus (System Nervous System)

**File**: `src/ontology/EventBus.ts`

**Purpose**: Decoupled event-driven architecture for system-wide notifications and reactive behaviors.

**Key Features**:
- Typed domain events for all major operations
- Subscribe/emit pattern with async handler support
- Enables plugin-style extensibility without modifying core engines
- Event handlers execute in parallel (non-blocking)

**Domain Events**:
```typescript
enum DomainEventType {
    ONTOLOGY_ACTIVATED,          // New ontology version activated
    TRUTH_MATERIALIZED,          // Entity version created
    RELATIONSHIP_MATERIALIZED,   // Relationship version created
    ADMISSION_CASE_CREATED,      // New admission case created
    DECISION_TAKEN,              // Decision recorded in journal
    EXECUTION_COMPLETED          // Workflow/action execution completed
}
```

**Key Code**:
```typescript
export class EventBus {
    private handlers: Map<DomainEventType, Set<EventHandler<any>>> = new Map();

    public subscribe<T extends DomainEvent>(
        type: DomainEventType,
        handler: EventHandler<T>
    ): () => void {
        const handlers = this.handlers.get(type) || new Set();
        handlers.add(handler);
        this.handlers.set(type, handlers);

        // Return unsubscribe function
        return () => handlers.delete(handler);
    }

    public emit<T extends DomainEvent>(event: T): void {
        const handlers = this.handlers.get(event.type) || new Set();
        handlers.forEach(handler => {
            handler(event).catch(err => console.error('Event handler error:', err));
        });
    }
}
```

**Integration Points**:
- `TruthMaterializationEngine`: Emits TRUTH_MATERIALIZED and RELATIONSHIP_MATERIALIZED events
- `OntologyDefinitionStore`: Emits ONTOLOGY_ACTIVATED when version is published
- `TruthAdmissionEngine`: Emits ADMISSION_CASE_CREATED when new cases are created

**Invariants**:
- Non-blocking: event emission never blocks main execution flow
- Error-isolated: handler failures don't affect other handlers or emit caller
- Type-safe: TypeScript ensures handlers match event types

---

### 13. Workflow Definition Store

**File**: `src/ontology/definition/WorkflowDefinitionStore.ts`

**Purpose**: Metadata-driven workflow management with versioning, publishing, and graph-to-execution conversion.

**Key Features**:
- **Graph-Based Design**: Workflows defined as visual graphs (nodes + edges)
- **Declarative Node Types**: START, TASK, APPROVAL, DECISION, AI_REVIEW, ACTION, WAIT, END
- **Automatic Conversion**: Graph structure converted to linear execution steps
- **Version Snapshots**: Immutable execution artifacts on publish (DRAFT → PUBLISHED)
- **Event Triggers**: Workflows triggered by domain events (event-driven activation)
- **Ontology-Scoped**: Workflows tied to specific ontology versions

**Key Code**:
```typescript
export class WorkflowDefinitionStore {
    public createWorkflowDefinition(
        tenantId: string,
        ontologyVersionId: OntologyVersionId,
        name: string,
        displayName: string,
        triggerConfig: WorkflowTriggerConfig,
        graph: WorkflowGraph,
        createdBy: string | null
    ): WorkflowDefinition {
        const steps = this.convertGraphToSteps(graph);
        
        const workflow: WorkflowDefinition = {
            id: crypto.randomUUID() as WorkflowDefinitionId,
            tenant_id: tenantId,
            ontology_version_id: ontologyVersionId,
            name: name,
            display_name: displayName,
            version: 1,
            status: 'DRAFT',
            trigger_config: triggerConfig,
            graph: graph,
            steps: steps,
            created_at: new Date(),
            created_by: createdBy,
            updated_at: new Date()
        };

        this.workflows.set(workflow.id, workflow);
        return workflow;
    }

    private convertGraphToSteps(graph: WorkflowGraph): any[] {
        return graph.nodes.map(node => ({
            id: node.id,
            type: node.type as any,
            config: node.config,
            transitions: this.buildTransitions(node.id, graph)
        }));
    }

    public publishWorkflow(workflowId: WorkflowDefinitionId): WorkflowDefinition {
        // Immutable snapshot on publish
        const workflow = this.getWorkflowDefinition(workflowId);
        workflow.status = 'PUBLISHED';
        workflow.published_at = new Date();
        return workflow;
    }
}
```

**Integration with Canvas**:
- `WorkflowCanvas.tsx` loads workflows from store for editing
- Visual changes saved back to store (bidirectional sync)
- ReactFlow graph → domain graph conversion handled automatically

**Invariants**:
- Immutable on publish: published workflows cannot be edited (version instead)
- Version-scoped: workflows tied to ontology version for consistency
- Deterministic conversion: same graph always produces same execution steps

---

### 14. Persistence Adapter

**File**: `src/persistence/PersistenceAdapter.ts`

**Purpose**: Abstract interface for all persistence operations, enabling swappable backend implementations.

**Key Features**:
- **Database-Agnostic**: Abstract interface works with any backend (in-memory, Postgres, Cockroach)
- **Transaction Support**: Begin/commit/rollback for atomic operations
- **Temporal Queries**: AsOf snapshot retrieval for historical queries
- **Full CRUD**: Entity, relationship, ontology, and workflow persistence
- **Type-Safe**: All operations typed with ontology IDs

**Key Code**:
```typescript
export interface PersistenceAdapter {
    // Entity Operations
    saveEntity(entity: Entity): Promise<void>;
    saveEntityVersion(version: EntityVersion, attributes: AttributeValue[]): Promise<void>;
    getEntitySnapshot(entityId: string, asOf: Date, tenantId: string): Promise<any | null>;
    
    // Relationship Operations
    saveRelationship(relationship: Relationship): Promise<void>;
    saveRelationshipVersion(version: RelationshipVersion): Promise<void>;
    
    // Ontology Operations
    saveObjectTypeDefinition(objectType: ObjectTypeDefinition): Promise<void>;
    saveAttributeDefinition(attribute: AttributeDefinition): Promise<void>;
    saveRelationshipTypeDefinition(relType: RelationshipTypeDefinition): Promise<void>;
    
    // Workflow Operations
    saveWorkflowDefinition(workflow: WorkflowDefinition): Promise<void>;
    getWorkflowDefinition(workflowId: string): Promise<WorkflowDefinition | null>;
    
    // Transaction Management
    beginTransaction(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
}
```

**Implementations**:
- **InMemoryPersistence**: Fast in-memory storage for development/testing
- **PostgresAdapter** (future): Production Postgres implementation with connection pooling
- **CockroachAdapter** (future): Distributed CockroachDB for global scale

**Usage Pattern**:
```typescript
const persistence: PersistenceAdapter = new InMemoryPersistence();

await persistence.beginTransaction();
try {
    await persistence.saveEntity(entity);
    await persistence.saveEntityVersion(version, attributes);
    await persistence.commit();
} catch (err) {
    await persistence.rollback();
    throw err;
}
```

**Invariants**:
- Transaction-safe: all writes atomic within transaction boundary
- Tenant-isolated: all queries enforce tenant filtering
- Immutable writes: versions never updated, only created

---

## File Structure

### Core Ontology
```
src/ontology/
├── types.ts                    # Core type definitions
├── OntologyStore.ts            # Immutable truth storage
├── MutationEngine.ts           # Applies mutations to store
├── ProjectionEngine.ts         # Future state projection
├── MovementEngine.ts           # Temporal interpolation
├── ScenarioManager.ts          # Scenario branch management
├── rule-engine.ts              # Declarative rule evaluation
├── workflow-engine.ts          # Workflow execution
├── EventBus.ts                 # Domain event bus
├── event-types.ts              # Domain event type definitions
├── query/
│   ├── SemanticQueryEngine.ts  # Declarative ontology queries
│   └── query-types.ts          # Query DSL types
├── definition/
│   ├── OntologyDefinitionStore.ts # Metadata storage
│   ├── OntologyCompiler.ts     # Metadata -> Runtime artifacts
│   ├── OntologySnapshotResolver.ts # Time-version resolution
│   ├── WorkflowDefinitionStore.ts # Workflow metadata storage
│   └── seed-ontology.ts        # Initial metadata seeding
├── SideEffectManager.ts        # Side effect handlers
├── ingestion/
│   ├── IngestionEngine.ts      # External data ingestion
│   └── ingestion-types.ts      # Ingestion types
├── admission/
│   ├── TruthAdmissionEngine.ts # Admission case management
│   └── truth-admission-types.ts
├── materialization/
│   ├── TruthMaterializationEngine.ts # Materialization
│   └── materialization-types.ts
└── validation/
    ├── validation-engine.ts    # Entity validation
    └── validators/             # Type-specific validators
```

### Persistence Layer
```
src/persistence/
├── PersistenceAdapter.ts       # Abstract persistence interface
└── InMemoryPersistence.ts      # In-memory implementation (dev)
```

### Analytical Layers
```
src/analysis/
├── MetricsEngine.ts            # Operational metrics
├── metrics-types.ts
├── SignalsEngine.ts            # Time-series signals
├── signal-types.ts
├── DeltaEngine.ts              # Scenario comparison
└── delta-types.ts

src/attention/
├── AttentionEngine.ts          # Attention item computation
└── attention-types.ts
```

### Authority & Policy
```
src/authority/
├── AuthorityEvaluator.ts       # Authority evaluation
├── AuthorityGraphEngine.ts     # Authority graph traversal
├── AuthorityLifecycleManager.ts # Authority lifecycle
└── authority-types.ts

src/policy/
├── PolicyEvaluator.ts          # Policy evaluation
└── policy-types.ts
```

### AI Integration
```
src/ai/
├── GeminiClient.ts             # Gemini 2.0 API client
├── AIAdvisoryService.ts        # AI advisory service
├── CapabilityRegistry.ts       # AI capabilities
├── AIPromptRegistry.ts         # Prompt formatting
└── ai-types.ts                 # AI type definitions
```

### Execution & Workflows
```
src/execution/
├── ExecutionManager.ts         # Execution intent management
├── WorkflowEngine.ts           # Workflow execution
├── Executors.ts                # Executor implementations
└── workflow-runtime-types.ts

src/ontology/
├── workflow-engine.ts          # Core workflow execution logic
├── workflow-types.ts           # Workflow type definitions
└── definition/
    └── WorkflowDefinitionStore.ts # Metadata-defined workflows

src/workflows/
└── workflow-graph-types.ts     # Graph structure for visual workflows

src/decision/
├── DecisionJournalManager.ts   # Decision journaling
└── decision-types.ts

src/components/workflows/
├── WorkflowCanvas.tsx          # Visual workflow designer (ReactFlow)
├── WorkflowCustomNode.tsx      # Custom node rendering
├── WorkflowNodeInspector.tsx   # Node property editor
├── WorkflowDashboard.tsx       # Workflow management UI
├── WorkflowList.tsx            # Workflow listing
├── WorkflowInstanceView.tsx    # Workflow instance details
└── MyTasksPanel.tsx            # User task queue
```

### Identity & Authentication
```
src/identity/
├── IdentityContext.ts          # Identity context singleton
├── IdentityStore.ts            # Actor and session storage
├── identity-types.ts
└── MockLogin.ts                # Mock login (dev)

src/auth/
├── AuthService.ts               # Authentication service
└── AuthContext.tsx              # React auth context

src/tenant/
├── TenantContext.ts             # Tenant context management
└── tenant-types.ts
```

### UI Components
```
src/components/
├── Map3DView.tsx              # 3D map view
├── MapView.tsx                 # 2D map view
├── OperationsDashboard.tsx     # Operations metrics
├── SignalsDashboard.tsx        # Signals visualization
├── AttentionDashboard.tsx      # Attention items
├── DataEntryForm.tsx           # AI-governed data entry
├── AIAdvisoryPanel.tsx        # AI advisory UI
├── AIContextVisualization.tsx  # AI context display
├── Login.tsx                   # Login form
├── TopBar.tsx                  # Top navigation
├── BottomBar.tsx               # Time controls
└── Map/
    ├── OverlayControlPanel.tsx # Overlay controls
    └── GeoMapRenderer.tsx      # Geographic map
```

### Rendering
```
src/rendering3d/
├── SceneManager.ts             # Three.js scene management
├── EntityRenderer.ts           # Entity rendering
├── OverlayRenderer.ts          # Overlay rendering
├── CameraController.ts         # Camera controls
├── ModelRegistry.ts            # 3D model registry
└── GeoProjectionEngine.ts      # Geographic projection
```

### Query & Adapters
```
src/adapters/query/
├── QueryClient.ts              # Read-only query adapter
└── useOntologyQuery.ts         # React hook for queries
```

### State Management
```
src/state/
├── time/
│   ├── TimeContext.tsx         # Global time context
│   └── useTime.ts              # Time hook
├── entities/
│   ├── EntityStore.tsx         # Entity selection state
│   └── useEntities.ts          # Entity hook
└── playback/
    └── PlaybackContext.tsx      # Playback controls
```

### Context Providers
```
src/context/
├── ScenarioContext.tsx         # Scenario state
├── ProjectionContext.tsx       # Projection settings
├── VisualizationContext.tsx    # Visualization state
├── DecisionContext.tsx         # Decision state
├── ReplayContext.tsx           # Replay mode
└── AIAdvisoryContext.tsx       # AI advisory state
```

---

## Key Components

### 1. OntologyStore

**File**: `src/ontology/OntologyStore.ts`

The central immutable truth store. All entity and relationship data is versioned.

**Key Methods**:
```typescript
class OntologyStore {
    // Get entities valid at a specific time
    getEntities(asOf: Date, tenantId: string): Entity[]
    
    // Get entity snapshot at specific time
    getEntitySnapshot(entityId: EntityId, asOf: Date, tenantId: string): EntitySnapshot | null
    
    // Add new entity version (immutable)
    addEntityVersion(version: EntityVersion, attributes: AttributeValue[]): void
    
    // Get spatial snapshots for movement interpolation
    getSpatialSnapshots(entityId: EntityId, tenantId: string): SpatialSnapshot[]
}
```

**Invariants**:
- Immutable: versions never change
- Temporal: all queries require `asOf` time
- Tenant-isolated: all data scoped to tenant

---

### 2. QueryClient

**File**: `src/adapters/query/QueryClient.ts`

Read-only adapter layer that enforces tenant isolation and provides analytical queries.

**Key Methods**:
```typescript
class QueryClient {
    // Get entities at specific time
    static getEntities(asOf: Date, tenantId: string): Entity[]
    
    // Semantic Search (Scenario-aware)
    static async searchEntities(query: EntityQuery): Promise<Entity[]>
    
    // Relationship Traversal
    static async traverse(query: TraversalQuery): Promise<Entity[]>
    
    // Get operational metrics
    static getOperationalMetrics(asOf: Date, tenantId: string): OperationalMetricsSnapshot
    
    // Get signal series
    static getSignalSeries(
        signalType: SignalType,
        window: SignalWindow,
        asOf: Date,
        tenantId: string
    ): SignalSeries
    
    // Get attention snapshot
    static getAttentionSnapshot(asOf: Date, tenantId: string): AttentionSnapshot
}
```

**Invariants**:
- Read-only: never mutates truth
- Tenant-enforced: cross-tenant access denied
- Time-bound: all queries require `asOf`

---

### 3. Map3DView

**File**: `src/components/Map3DView.tsx`

3D spatial visualization using Three.js with entity rendering, overlays, and projections.

**Key Features**:
- Entity rendering with status-based colors
- Overlay system (authority, policy, AI-analyzed)
- Projection visualization (future paths)
- Temporal interpolation (smooth movement)
- Click-to-select entities

**Code Structure**:
```typescript
const Map3DView: React.FC = () => {
    // Initialize Three.js scene
    useEffect(() => {
        const sceneManager = new SceneManager(containerRef.current);
        const entityRenderer = new EntityRenderer(sceneManager);
        const overlayRenderer = new OverlayRenderer(sceneManager);
        
        // Animation loop
        sceneManager.start((time) => {
            // Interpolate positions
            const projectedEntities = entities.map(entity => {
                const snapshots = getSpatialSnapshots(entity.id);
                return MovementEngine.interpolate(snapshots, renderTime);
            });
            
            // Update renderers
            entityRenderer.update(projectedEntities, selectedEntityId);
            overlayRenderer.update(overlays, entityPositions);
        });
    }, []);
    
    return <div ref={containerRef} onClick={handleClick} />;
};
```

---

### 4. Operations Dashboard

**File**: `src/components/OperationsDashboard.tsx`

Executive-grade dashboard showing system health, metrics, and throughput.

**Displays**:
- System health overview
- **Semantic Metrics**: Dynamically calculated metrics defined in the ontology (e.g., Total Assets, Degraded Assets).
- Entity distribution by type/status
- Risk summary
- Ingestion → Admission → Materialization funnel
- Decision velocity

**Code Example**:
```typescript
export const OperationsDashboard: React.FC = () => {
    const { asOf } = useTime();
    const { tenantId } = TenantContextManager.getContext();
    
    const metrics = QueryClient.getOperationalMetrics(asOf, tenantId);
    
    return (
        <div>
            <MetricCard
                title="Total Entities"
                value={metrics.entityCounts.total}
            />
            <MetricCard
                title="At Risk"
                value={metrics.riskDistribution.atRisk}
            />
            {/* More metrics... */}
        </div>
    );
};
```

---

### 5. AI Advisory Service

**File**: `src/ai/AIAdvisoryService.ts`

Service for creating AI advisory sessions and submitting requests.

**Key Code**:
```typescript
export class AIAdvisoryService {
    public static createSession(
        userId: string,
        source: AIInvocationSource,
        purpose: string,
        snapshot: AIContextSnapshot
    ): AIAdvisorySession {
        const sessionId = crypto.randomUUID();
        const session: AIAdvisorySession = {
            sessionId,
            createdAt: new Date(),
            createdBy: userId,
            invocationSource: source,
            purpose,
            contextSnapshot: Object.freeze({ ...snapshot }),
            history: []
        };
        
        this.sessions.set(sessionId, session);
        return session;
    }
    
    public static async submitRequest(
        sessionId: string,
        userPrompt: string
    ): Promise<AIAdvisoryResponse> {
        const session = this.sessions.get(sessionId);
        
        // Try Gemini first
        const geminiClient = GeminiClient.getInstance();
        if (geminiClient.isAvailable()) {
            const result = await geminiClient.generateAdvisory(
                userPrompt, 
                session.contextSnapshot
            );
            if (result) {
                return {
                    responseType: 'analysis',
                    content: result.content,
                    confidenceLevel: 'high',
                    disclaimer: "Advisory only — not a recommendation or decision",
                    supportingSignals: result.dataSources
                };
            }
        }
        
        // Fallback to mock
        return this.generateMockResponse(...);
    }
}
```

---

### 6. Authentication System

**File**: `src/auth/AuthService.ts`

Production-grade authentication with session management.

**Key Code**:
```typescript
export class AuthService {
    static async login(credentials: LoginCredentials): Promise<AuthResult> {
        // Find or create actor
        let actor = this.store.getActor(credentials.email);
        if (!actor) {
            actor = this.store.createActor(
                credentials.tenantId || 'tenant-default',
                'HUMAN_USER',
                credentials.email.split('@')[0],
                credentials.email
            );
        }
        
        // Create session
        const session = this.store.createSession(actor.id, 3600000);
        
        // Set contexts
        TenantContextManager.setContext({
            tenantId: session.tenant_id,
            userId: actor.id,
            role: 'ADMIN',
            sessionId: session.id
        });
        
        IdentityContext.getInstance().setCurrentContext({
            tenant_id: session.tenant_id,
            actor_id: actor.id,
            session_id: session.id,
            actor_type: actor.type
        });
        
        // Persist to localStorage
        localStorage.setItem('auth_session', session.id);
        
        return { success: true, sessionId: session.id };
    }
    
    static restoreSession(): AuthResult {
        const sessionId = localStorage.getItem('auth_session');
        const tenantId = localStorage.getItem('auth_tenant');
        const actorId = localStorage.getItem('auth_actor');
        
        if (!sessionId || !tenantId || !actorId) {
            return { success: false, error: 'No saved session' };
        }
        
        // Validate and restore
        const context = this.store.resolveSession(sessionId, tenantId);
        // Restore contexts...
        
        return { success: true, sessionId };
    }
}
```

---

## API Reference

### QueryClient API

```typescript
// Get all entities at a specific time
QueryClient.getEntities(asOf: Date, tenantId: string): Entity[]

// Get entity snapshot
QueryClient.getEntitySnapshot(id: string, asOf: Date, tenantId: string): EntitySnapshot | null

// Get operational metrics
QueryClient.getOperationalMetrics(asOf: Date, tenantId: string): OperationalMetricsSnapshot

// Get signal series
QueryClient.getSignalSeries(
    signalType: SignalType,
    window: SignalWindow,
    asOf: Date,
    tenantId: string
): SignalSeries

// Get attention snapshot
QueryClient.getAttentionSnapshot(asOf: Date, tenantId: string): AttentionSnapshot
```

### AI Advisory API

```typescript
// Create advisory session
AIAdvisoryService.createSession(
    userId: string,
    source: AIInvocationSource,
    purpose: string,
    snapshot: AIContextSnapshot
): AIAdvisorySession

// Submit request
AIAdvisoryService.submitRequest(
    sessionId: string,
    userPrompt: string
): Promise<AIAdvisoryResponse>

// Get session
AIAdvisoryService.getSession(sessionId: string): AIAdvisorySession | undefined
```

### Authentication API

```typescript
// Login
AuthService.login(credentials: LoginCredentials): Promise<AuthResult>

// Logout
AuthService.logout(): void

// Restore session
AuthService.restoreSession(): AuthResult

// Check authentication
AuthService.isAuthenticated(): boolean

// Get current user
AuthService.getCurrentUser(): UserInfo | null
```

---

## Usage Examples

### Example 1: Querying Entities

```typescript
import { QueryClient } from './adapters/query/QueryClient';
import { TenantContextManager } from './tenant/TenantContext';

// Get entities at current time
const asOf = new Date();
const tenantId = TenantContextManager.getContext().tenantId;

const entities = QueryClient.getEntities(asOf, tenantId);

// Get entity snapshot
const entity = QueryClient.getEntitySnapshot('entity-123', asOf, tenantId);
```

### Example 2: Creating AI Advisory Session

```typescript
import { AIAdvisoryService } from './ai/AIAdvisoryService';
import { useAIAdvisory } from './context/AIAdvisoryContext';

const { invokeAI } = useAIAdvisory();

// Invoke AI from UI
invokeAI(
    'manual',
    'User requested analysis',
    {
        timestamp: new Date(),
        viewContext: 'manual',
        selectedEntityIds: ['entity-1', 'entity-2']
    }
);

// Submit request
const response = await AIAdvisoryService.submitRequest(
    sessionId,
    'What patterns do you see in these entities?'
);
```

### Example 3: Data Entry with AI Validation

```typescript
import { DataEntryForm } from './components/DataEntryForm';

// Form automatically:
// 1. Validates with Gemini
// 2. Creates CandidateTruth
// 3. Creates AdmissionCase
// 4. User can approve/reject

<DataEntryForm />
```

### Example 4: Scenario Comparison

```typescript
import { DeltaEngine } from './analysis/DeltaEngine';

const delta = DeltaEngine.compare({
    asOf: new Date(),
    leftScenarioId: null, // Reality
    rightScenarioId: 'scenario-123',
    ontologyVersion: 'v1.0.0',
    tenantId: 'tenant-1'
});

// delta contains:
// - entityDeltas: what changed
// - metricDeltas: metric differences
// - summary: high-level stats
```

---

## Environment Variables

```env
# Gemini API Key (optional - falls back to mock if not set)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# API Base URL (for future backend integration)
VITE_API_BASE_URL=http://localhost:3000/api
```

---

## Key Invariants

### Truth Invariants
- **TR-1**: Truth is immutable - versions never change
- **TR-2**: All truth is versioned with `valid_from` and `valid_to`
- **TR-3**: All truth is tenant-isolated
- **TR-4**: All truth queries require explicit `asOf` time

### Admission Invariants
- **ADM-1**: External data never becomes truth automatically
- **ADM-2**: All candidates require explicit approval
- **ADM-3**: Admission cases are immutable once resolved
- **ADM-4**: Authority checked before decision acceptance

### Analytical Invariants
- **AN-1**: Analytical layers are read-only
- **AN-2**: Analytical layers are deterministic
- **AN-3**: Analytical layers are replayable
- **AN-4**: Analytical layers never introduce new truth

### AI Invariants
- **AI-1**: AI is advisory only - never executes actions
- **AI-2**: AI responses are descriptive, not prescriptive
- **AI-3**: AI tracks data sources for transparency
- **AI-4**: AI never bypasses governance

---

## Testing

### Running the Application

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Key Test Files

- `src/ontology/test-mutation-engine.ts`
- `src/ontology/test-rule-engine.ts`
- `src/authority/test-authority-evaluator.ts`
- `src/identity/test-identity-core.ts`
- `src/tenant/test-tenant-isolation.ts`

---

## Future Enhancements

1. **Backend API**: Move stores to database
2. **Real-time Updates**: WebSocket support for live data
3. **Multi-modal AI**: Image/chart analysis
4. **Advanced Projections**: ML-based future state prediction
5. **Distributed Authority**: Cross-tenant authority delegation
6. **Audit Logging**: Comprehensive audit trail
7. **Performance Optimization**: Query optimization, caching

---

## License & Credits

Built as a production-grade enterprise ontology platform.
Architecture inspired by Palantir Foundry/AIP principles.

---

## Detailed Code Examples

### OntologyStore - Complete Implementation

**File**: `src/ontology/OntologyStore.ts`

```typescript
export class OntologyStore {
    private entities: Map<string, Entity> = new Map();
    private versions: Map<string, EntityVersion[]> = new Map();
    private attributes: Map<string, AttributeValue[]> = new Map();
    private relationships: Map<string, Relationship> = new Map();
    private relationshipVersions: Map<string, RelationshipVersion[]> = new Map();

    public addEntityVersion(version: EntityVersion, attributes: AttributeValue[]) {
        const entityVersions = this.versions.get(version.entity_id) || [];
        entityVersions.push(version);
        entityVersions.sort((a, b) => a.version_number - b.version_number);
        this.versions.set(version.entity_id, entityVersions);
        this.attributes.set(version.id, attributes);
    }

    public getEntities(asOf: Date, tenantId: string): Entity[] {
        return Array.from(this.entities.values())
            .filter(e => e.tenant_id === tenantId)
            .filter(e => {
                const versions = this.versions.get(e.id);
                if (!versions) return false;
                return versions.some(v => 
                    v.valid_from <= asOf && (!v.valid_to || v.valid_to > asOf)
                );
            });
    }

    public getEntitySnapshot(id: string, asOf: Date, tenantId: string): any | null {
        const entity = this.entities.get(id);
        if (!entity || entity.tenant_id !== tenantId) return null;

        const versions = this.versions.get(id);
        if (!versions) return null;

        const version = versions.find(v => 
            v.valid_from <= asOf && (!v.valid_to || v.valid_to > asOf)
        );
        if (!version) return null;

        const attrs = this.attributes.get(version.id) || [];
        const data: Record<string, any> = {};
        attrs.forEach(a => {
            const value = a.value_string ?? a.value_integer ?? a.value_float ?? 
                         a.value_boolean ?? a.value_date ?? a.value_datetime ?? a.value_json;
            data[a.attribute_definition_id as any] = value;
        });

        return {
            id: entity.id,
            tenant_id: entity.tenant_id,
            type: entity.entity_type_id,
            ...data,
            _version: version
        };
    }

    public getSpatialSnapshots(entityId: string, tenantId: string): 
        { time: Date; x: number; y: number }[] {
        const entity = this.entities.get(entityId);
        if (!entity || entity.tenant_id !== tenantId) return [];

        const versions = this.versions.get(entityId) || [];
        const snapshots: { time: Date; x: number; y: number }[] = [];

        versions.forEach(v => {
            const attrs = this.attributes.get(v.id) || [];
            const xAttr = attrs.find(a => a.attribute_definition_id as any === 'x');
            const yAttr = attrs.find(a => a.attribute_definition_id as any === 'y');

            if (xAttr && yAttr) {
                const x = xAttr.value_integer ?? xAttr.value_float;
                const y = yAttr.value_integer ?? yAttr.value_float;
                if (x !== null && y !== null) {
                    snapshots.push({ time: v.valid_from, x, y });
                }
            }
        });

        return snapshots;
    }
}
```

### MetricsEngine - Complete Implementation

**File**: `src/analysis/MetricsEngine.ts`

```typescript
export class MetricsEngine {
    static computeOperationalMetrics(asOf: Date, tenantId: string): OperationalMetricsSnapshot {
        const computed_at = new Date();

        const entitiesMetrics = this.computeEntityCounts(asOf, tenantId, computed_at);
        const riskMetrics = this.computeRiskDistribution(entitiesMetrics);
        const admissionMetrics = this.computeAdmissionFlow(asOf, tenantId, computed_at);
        const executionMetrics = this.computeExecutionOutcomes(asOf, tenantId, computed_at);
        const decisionMetrics = this.computeDecisionVelocity(asOf, tenantId, computed_at);

        return {
            tenantId,
            asOf,
            computed_at,
            entities: entitiesMetrics,
            risk: riskMetrics,
            admission: admissionMetrics,
            execution: executionMetrics,
            decisions: decisionMetrics,
        };
    }

    private static computeEntityCounts(asOf: Date, tenantId: string, computed_at: Date): EntityCountMetrics {
        const entities = ontologyStore.getEntities(asOf, tenantId);

        const byType: Record<string, number> = {};
        const byStatus: Record<string, number> = {};

        entities.forEach((e) => {
            byType[e.entity_type_id] = (byType[e.entity_type_id] || 0) + 1;
            const status = (e as any).status || 'UNKNOWN';
            byStatus[status] = (byStatus[status] || 0) + 1;
        });

        return {
            tenantId,
            asOf,
            computed_at,
            totalEntities: entities.length,
            byType,
            byStatus,
        };
    }

    private static computeDecisionVelocity(asOf: Date, tenantId: string, computed_at: Date): DecisionVelocityMetrics {
        const windowHours = 24;
        const windowStart = new Date(asOf.getTime() - windowHours * 60 * 60 * 1000);

        const decisions = decisionManager
            .getAllDecisions()
            .filter((d) => d.tenantId === tenantId)
            .filter((d) => d.timestamp >= windowStart && d.timestamp <= asOf);

        const bucketMs = 60 * 60 * 1000; // 1 hour
        const buckets: Record<number, number> = {};

        decisions.forEach((d) => {
            const offset = d.timestamp.getTime() - windowStart.getTime();
            const bucketIndex = Math.floor(offset / bucketMs);
            buckets[bucketIndex] = (buckets[bucketIndex] || 0) + 1;
        });

        const points = Object.keys(buckets)
            .map((key) => parseInt(key, 10))
            .sort((a, b) => a - b)
            .map((index) => ({
                bucketStart: new Date(windowStart.getTime() + index * bucketMs),
                count: buckets[index],
            }));

        return {
            tenantId,
            asOf,
            computed_at,
            windowHours,
            points,
            totalDecisions: decisions.length,
        };
    }
}
```

### SignalsEngine - Complete Implementation

**File**: `src/analysis/SignalsEngine.ts`

```typescript
export class SignalsEngine {
    static computeSeriesFor(
        signalType: SignalType,
        window: SignalWindow,
        tenantId: string,
        asOf: Date
    ): SignalSeries {
        const config = WINDOW_CONFIG[window];
        const bucketMs = (config.hours * 60 * 60 * 1000) / config.buckets;
        const endTime = asOf.getTime();

        const points: SignalPoint[] = [];

        for (let i = config.buckets - 1; i >= 0; i--) {
            const bucketEnd = new Date(endTime - i * bucketMs);
            const snapshot = MetricsEngine.computeOperationalMetrics(bucketEnd, tenantId);
            const value = this.valueForSignal(signalType, snapshot);
            points.push({ time: bucketEnd, value });
        }

        return {
            tenantId,
            signalType,
            window,
            points,
            computed_at: new Date(),
        };
    }

    private static valueForSignal(
        signalType: SignalType,
        snapshot: OperationalMetricsSnapshot
    ): number {
        switch (signalType) {
            case SignalType.ENTITY_COUNT_CHANGE:
                return snapshot.entities.totalEntities;
            case SignalType.DECISION_RATE_CHANGE:
                return snapshot.decisions.totalDecisions;
            case SignalType.EXECUTION_FAILURE_SPIKE:
                return snapshot.execution.attemptsFailure;
            case SignalType.ADMISSION_BACKLOG_CHANGE:
                return snapshot.admission.byStatus[AdmissionStatus.PENDING] || 0;
            default:
                return 0;
        }
    }
}
```

### AttentionEngine - Pattern Detection

**File**: `src/attention/AttentionEngine.ts`

```typescript
export class AttentionEngine {
    static computeAttention({ tenantId, asOf, signals }: ComputeAttentionArgs): AttentionSnapshot {
        const items: AttentionItem[] = [];

        signals.forEach((series) => {
            const values = series.points.map((p) => p.value);
            if (values.length < 2) return;

            const deltas = this.computeDeltas(values);
            const netDelta = values[values.length - 1] - values[0];

            // Detect acceleration
            const accelerationSeverity = this.detectAcceleration(deltas);
            if (accelerationSeverity) {
                items.push({
                    id: crypto.randomUUID(),
                    tenantId,
                    asOf,
                    type: AttentionType.SIGNAL_ACCELERATION,
                    severity: accelerationSeverity,
                    sourceSignalType: series.signalType,
                    summary: `Observed change acceleration in ${series.signalType} over ${series.window}.`,
                    evidence: {
                        window: series.window,
                        values: [...values],
                        delta: netDelta
                    },
                    created_at: new Date()
                });
            }

            // Detect backlog growth
            if (series.signalType === SignalType.ADMISSION_BACKLOG_CHANGE) {
                const backlogSeverity = this.detectBacklogGrowth(deltas);
                if (backlogSeverity) {
                    items.push({
                        id: crypto.randomUUID(),
                        tenantId,
                        asOf,
                        type: AttentionType.BACKLOG_GROWTH,
                        severity: backlogSeverity,
                        sourceSignalType: series.signalType,
                        summary: `Observed increase in admission backlog over ${series.window}.`,
                        evidence: {
                            window: series.window,
                            values: [...values],
                            delta: netDelta
                        },
                        created_at: new Date()
                    });
                }
            }
        });

        return {
            tenantId,
            asOf,
            computed_at: new Date(asOf.getTime()),
            items: items.sort((a, b) => {
                const severityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
                return severityOrder[b.severity] - severityOrder[a.severity];
            })
        };
    }

    private static detectAcceleration(deltas: number[]): AttentionSeverity | null {
        if (deltas.length < 4) return null;
        const midpoint = Math.floor(deltas.length / 2);
        const first = deltas.slice(0, midpoint);
        const second = deltas.slice(midpoint);

        const firstMean = this.mean(first);
        const secondMean = this.mean(second);

        const base = Math.abs(firstMean);
        const recent = Math.abs(secondMean);
        if (recent <= base) return null;

        const ratio = base === 0 ? Infinity : recent / (base || 1);

        if (ratio > 2) return AttentionSeverity.HIGH;
        if (ratio > 1.2) return AttentionSeverity.MEDIUM;
        return AttentionSeverity.LOW;
    }
}
```

### ExecutionManager - Authority-Enforced Execution

**File**: `src/execution/ExecutionManager.ts`

```typescript
export class ExecutionManager {
    private intents: Map<string, ExecutionIntent> = new Map();
    private attempts: ExecutionAttempt[] = [];

    public createIntent(
        decisionId: string,
        actionType: string,
        targetEntities: string[],
        parameters: Record<string, any>,
        requestedBy: string,
        targetScenarioId?: string
    ): ExecutionIntent {
        const { tenantId } = TenantContextManager.getContext();
        const identityContext = IdentityContext.getInstance().getCurrentContext();
        
        // Check Authority: REQUEST_EXECUTION
        const snapshot = authorityGraphEngine.resolveAuthoritySnapshot(
            requestedBy, 
            tenantId, 
            new Date()
        );

        const hasPermission = snapshot.permissions.some(p =>
            p.authority_type === 'EXECUTE' &&
            (p.scope.action_definition_id === actionType || !p.scope.action_definition_id)
        );

        if (!hasPermission) {
            throw new Error(`Unauthorized to request execution: No EXECUTE authority found for ${actionType}`);
        }

        const intent: ExecutionIntent = {
            intentId: globalThis.crypto.randomUUID(),
            tenantId,
            decisionId,
            actionType,
            targetEntities,
            parameters,
            idempotencyKey: this.generateIdempotencyKey(decisionId, actionType, targetEntities, parameters),
            requestedBy,
            performedBySessionId: identityContext.session_id,
            authority_snapshot_id: snapshot.id,
            requestedAt: new Date().toISOString(),
            targetScenarioId,
            status: ExecutionStatus.PENDING,
            statusHistory: [{
                status: ExecutionStatus.PENDING,
                timestamp: new Date().toISOString(),
                changedBy: requestedBy
            }]
        };

        this.intents.set(intent.intentId, intent);
        return intent;
    }

    public async executeRealRun(intentId: string, actorId: string): Promise<ExecutionAttempt> {
        const intent = this.getIntent(intentId);

        if (intent.status !== ExecutionStatus.APPROVED) {
            throw new Error(`Cannot execute. Intent is not APPROVED. Current status: ${intent.status}`);
        }

        // Final Authority Check (Snapshot)
        const authResult = authorityEvaluator.evaluate({
            actorId: actorId,
            intentType: AuthorityIntent.APPROVE_EXECUTION,
            targetEntityId: intent.targetEntities[0],
            context: { asOf: new Date() }
        });

        if (authResult.status !== AuthorityStatus.ALLOWED) {
            this.updateStatus(intent, ExecutionStatus.FAILED, actorId);
            throw new Error(`Execution blocked: Authority revoked since approval.`);
        }

        const command: ExecutionCommand = {
            intentId: intent.intentId,
            tenantId: intent.tenantId,
            actionType: intent.actionType,
            parameters: intent.parameters,
            idempotencyKey: intent.idempotencyKey,
            mode: ExecutionMode.REAL_RUN,
            targetScenarioId: intent.targetScenarioId
        };

        const result = await this.realRunExecutor.execute(command);
        const attempt = this.recordAttempt(intent, ExecutionMode.REAL_RUN, result, authResult.proof);

        if (result.success) {
            this.updateStatus(intent, ExecutionStatus.EXECUTED, actorId);
        } else {
            this.updateStatus(intent, ExecutionStatus.FAILED, actorId);
        }

        return attempt;
    }
}
```

### DecisionJournalManager - Immutable Decision Logging

**File**: `src/decision/DecisionJournalManager.ts`

```typescript
export class DecisionJournalManager {
    private decisions: DecisionJournal[] = [];

    submitDecision(input: DecisionJournalInput): DecisionJournal {
        // 1. Check Authority
        const result = authorityEvaluator.evaluate({
            actorId: input.author,
            intentType: AuthorityIntent.DECIDE_SCENARIO,
            targetEntityId: input.chosenScenarioId || undefined,
            context: {
                asOf: input.context.asOf,
                ...input.context.comparisonMetadata
            }
        });

        if (result.status !== AuthorityStatus.ALLOWED) {
            throw new Error(`Decision blocked: ${result.reason?.message} (Code: ${result.reason?.code})`);
        }

        const identityContext = IdentityContext.getInstance().getCurrentContext();

        const decision: DecisionJournal = {
            id: crypto.randomUUID(),
            tenantId: identityContext.tenant_id,
            timestamp: new Date(),
            author: input.author,
            performedBySessionId: identityContext.session_id,
            justification: input.justification,
            chosenScenarioId: input.chosenScenarioId,
            context: input.context,
            authorityProof: result.proof!,
            admissionDecision: input.admissionDecision
        };

        // Append-only, in-memory storage
        this.decisions.push(decision);
        return decision;
    }

    getAllDecisions(): DecisionJournal[] {
        return [...this.decisions].sort((a, b) => 
            b.timestamp.getTime() - a.timestamp.getTime()
        );
    }
}
```

### SceneManager - 3D Rendering Setup

**File**: `src/rendering3d/SceneManager.ts`

```typescript
export class SceneManager {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;

    constructor(container: HTMLElement) {
        this.container = container;
        this.scene = new THREE.Scene();
        
        // Add world map background
        const worldMapGeometry = new THREE.PlaneGeometry(2000, 1200);
        const worldMapMaterial = new THREE.MeshBasicMaterial({
            color: 0x1a3a52, // Ocean blue
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.3
        });
        const worldMapPlane = new THREE.Mesh(worldMapGeometry, worldMapMaterial);
        worldMapPlane.rotation.x = Math.PI / 2;
        worldMapPlane.position.set(500, 300, -50);
        this.scene.add(worldMapPlane);
        
        // Add continent outlines
        this.addContinentOutlines();
        
        this.scene.background = new THREE.Color('#0A0B0D');

        // Initialize Camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            container.clientWidth / container.clientHeight,
            0.1,
            5000
        );
        this.camera.position.set(500, 300, 800);
        this.camera.lookAt(500, 300, 0);

        // Initialize Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(this.renderer.domElement);

        // Add Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(200, 500, 400);
        this.scene.add(directionalLight);
    }

    public start(onFrame: (time: number) => void) {
        this.onFrame = onFrame;
        if (!this.animationId) {
            this.animate();
        }
    }

    private animate = () => {
        this.animationId = requestAnimationFrame(this.animate);
        const time = performance.now();
        if (this.onFrame) {
            this.onFrame(time);
        }
        this.renderer.render(this.scene, this.camera);
    };
}
```

### EntityRenderer - Entity Visualization

**File**: `src/rendering3d/EntityRenderer.ts`

```typescript
export class EntityRenderer {
    private scene: THREE.Scene;
    private meshes: Map<string, THREE.Mesh> = new Map();

    public update(
        entities: { entityId: string; type: string; status: string; x: number; y: number }[],
        selectedEntityId: string | null
    ) {
        const currentIds = new Set<string>();

        entities.forEach(entity => {
            currentIds.add(entity.entityId);

            let mesh = this.meshes.get(entity.entityId);

            if (!mesh) {
                mesh = ModelRegistry.createMesh(entity.type, entity.status);
                mesh.userData = { entityId: entity.entityId };
                this.scene.add(mesh);
                this.meshes.set(entity.entityId, mesh);
            }

            // Update Position (invert Y to match SVG coordinate system)
            mesh.position.set(entity.x, 600 - entity.y, 0);

            // Update Status/Selection
            ModelRegistry.updateMaterial(mesh, entity.status, entity.entityId === selectedEntityId);
        });

        // Remove stale meshes
        for (const [id, mesh] of this.meshes) {
            if (!currentIds.has(id)) {
                this.scene.remove(mesh);
                if (mesh.geometry) mesh.geometry.dispose();
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach(m => m.dispose());
                } else {
                    mesh.material.dispose();
                }
                this.meshes.delete(id);
            }
        }
    }

    public updateProjections(paths: { points: { x: number; y: number; t: Date }[] }[]) {
        this.clearProjections();

        paths.forEach(path => {
            if (path.points.length < 2) return;

            const points = path.points.map(p => new THREE.Vector3(p.x, 600 - p.y, 0));
            const geometry = new THREE.BufferGeometry().setFromPoints(points);

            const material = new THREE.LineDashedMaterial({
                color: 0x00FFFF, // Cyan for future
                linewidth: 1,
                dashSize: 10,
                gapSize: 5,
                opacity: 0.35,
                transparent: true
            });

            const line = new THREE.Line(geometry, material);
            line.computeLineDistances();
            this.scene.add(line);
            this.projectionLines.push(line);
        });
    }
}
```

### GeminiClient - AI Integration

**File**: `src/ai/GeminiClient.ts`

```typescript
export class GeminiClient {
    private static instance: GeminiClient;
    private genAI: GoogleGenerativeAI | null = null;
    private model: any = null;

    private constructor() {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ 
                model: 'gemini-2.0-flash-exp' 
            });
        }
    }

    public async generateAdvisory(
        prompt: string,
        contextSnapshot: AIContextSnapshot
    ): Promise<{ content: string; dataSources: string[] } | null> {
        if (!this.model) return null;

        const contextText = this.formatContextForGemini(contextSnapshot);
        
        const systemPrompt = `You are an advisory assistant for an enterprise ontology platform.
You do NOT make decisions.
You do NOT recommend actions.
You do NOT approve execution.

Your role is to explain information provided and describe observations.

Rules:
- Use neutral language only
- Avoid words: "should", "must", "recommended", "critical", "urgent"
- Describe observations and possibilities
- Include uncertainty where appropriate
- Never provide instructions or commands

Context provided:
${contextText}

User question: ${prompt}

Provide a neutral, descriptive response analyzing the context.`;

        const result = await this.model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();

        const dataSources = this.extractDataSources(contextSnapshot);

        return {
            content: text,
            dataSources
        };
    }
}
```

### AuthService - Authentication

**File**: `src/auth/AuthService.ts`

```typescript
export class AuthService {
    private static store = new IdentityStore();
    private static currentSessionId: string | null = null;

    static async login(credentials: LoginCredentials): Promise<AuthResult> {
        try {
            const tenantId = credentials.tenantId || 'tenant-default';
            
            let actor = Array.from(this.store['actors'].values()).find(
                a => a.email === credentials.email && a.tenant_id === tenantId
            );

            if (!actor) {
                actor = this.store.createActor(
                    tenantId,
                    'HUMAN_USER',
                    credentials.email.split('@')[0],
                    credentials.email
                );
            }

            const session = this.store.createSession(actor.id, 3600000);
            this.currentSessionId = session.id;

            TenantContextManager.setContext({
                tenantId: tenantId,
                userId: actor.id,
                role: 'ADMIN',
                sessionId: session.id
            });

            IdentityContext.getInstance().setCurrentContext({
                tenant_id: tenantId,
                actor_id: actor.id,
                session_id: session.id,
                actor_type: actor.type
            });

            localStorage.setItem('auth_session', session.id);
            localStorage.setItem('auth_tenant', tenantId);
            localStorage.setItem('auth_actor', actor.id);

            return { success: true, sessionId: session.id };
        } catch (error: any) {
            return { success: false, error: error.message || 'Authentication failed' };
        }
    }

    static restoreSession(): AuthResult {
        try {
            const sessionId = localStorage.getItem('auth_session');
            const tenantId = localStorage.getItem('auth_tenant');
            const actorId = localStorage.getItem('auth_actor');

            if (!sessionId || !tenantId || !actorId) {
                return { success: false, error: 'No saved session' };
            }

            const context = this.store.resolveSession(sessionId, tenantId);
            this.currentSessionId = sessionId;

            TenantContextManager.setContext({
                tenantId: tenantId,
                userId: actorId,
                role: 'ADMIN',
                sessionId: sessionId
            });

            IdentityContext.getInstance().setCurrentContext(context);

            return { success: true, sessionId };
        } catch (error: any) {
            localStorage.removeItem('auth_session');
            localStorage.removeItem('auth_tenant');
            localStorage.removeItem('auth_actor');
            return { success: false, error: error.message || 'Session expired' };
        }
    }
}
```

### OverlayResolver - AI Analyzed Entities

**File**: `src/visualization/OverlayResolver.ts`

```typescript
export class OverlayResolver {
    private resolveAIAnalyzedEntities(asOf: Date, entities: Entity[]): OverlayDescriptor[] {
        const overlays: OverlayDescriptor[] = [];
        const aiAnalyzedEntityIds = new Set<string>();
        
        try {
            const recentSessions = Array.from((AIAdvisoryService as any).sessions?.values() || []);
            
            recentSessions.forEach((session: any) => {
                if (session.contextSnapshot?.selectedEntityIds) {
                    session.contextSnapshot.selectedEntityIds.forEach((id: string) => {
                        aiAnalyzedEntityIds.add(id);
                    });
                }
            });
        } catch (error) {
            return [];
        }

        entities.forEach(entity => {
            if (aiAnalyzedEntityIds.has(entity.id)) {
                overlays.push({
                    id: `ai-analyzed-${entity.id}`,
                    type: OverlayType.AI_ANALYZED,
                    geometry: {
                        type: 'entity_highlight',
                        entityId: entity.id,
                        radius: 15
                    },
                    style: {
                        fillColor: '#A855F7', // Purple for AI
                        strokeColor: '#A855F7',
                        fillOpacity: 0.2,
                        strokeOpacity: 0.8,
                        pattern: 'pulse'
                    },
                    explanation: 'Entity analyzed by AI in recent advisory session',
                    sourceIds: [],
                    validAt: asOf.toISOString()
                });
            }
        });

        return overlays;
    }
}
```

---

*Last Updated: 2026-01-23*

