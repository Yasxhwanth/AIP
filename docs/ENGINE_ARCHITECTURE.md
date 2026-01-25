# Engine Architecture Summary

## Core Engines Built

### 1. **Ingestion Engine** (`src/ontology/ingestion/IngestionEngine.ts`)
- Accepts external data, normalizes, validates
- Produces `CandidateTruth` objects
- Enforces strict isolation (external data never becomes truth automatically)

### 2. **Truth Admission Engine** (`src/ontology/admission/TruthAdmissionEngine.ts`)
- Manages admission cases for candidate truth
- Creates diffs between candidates and current truth
- Handles approval/rejection workflow

### 3. **Truth Materialization Engine** (`src/ontology/materialization/TruthMaterializationEngine.ts`)
- Materializes approved admission decisions into ontology
- Ensures idempotency and forward-only mutations
- Attaches full lineage metadata

### 4. **Mutation Engine** (`src/ontology/MutationEngine.ts`)
- Applies mutations to OntologyStore
- Handles CREATE/UPDATE/DELETE for entities and relationships
- Triggers side effects

### 5. **Movement Engine** (`src/ontology/MovementEngine.ts`)
- Pure, stateless temporal interpolation
- Interpolates entity positions between snapshots
- No extrapolation (freezes at boundaries)

### 6. **Projection Engine** (`src/ontology/ProjectionEngine.ts`)
- Projects future state based on historical snapshots
- Deterministic, read-only, stateless
- Never persists outputs

### 7. **Delta Engine** (`src/analysis/DeltaEngine.ts`)
- Compares two scenario states
- Computes entity and metric deltas
- Pure functional, deterministic

### 8. **Metrics Engine** (`src/analysis/MetricsEngine.ts`)
- Aggregates operational metrics
- Entity counts, risk distribution, admission flow, execution outcomes
- Read-only, deterministic snapshots

### 9. **Signals Engine** (`src/analysis/SignalsEngine.ts`)
- Generates time-series signals from metrics
- Tracks trends and changes over time
- Pure, stateless, replayable

### 10. **Attention Engine** (`src/attention/AttentionEngine.ts`)
- Identifies signals deserving human attention
- Detects acceleration, backlog growth, failure concentration
- Descriptive only, no actions

### 11. **Rule Evaluation Engine** (`src/ontology/rule-engine.ts`)
- Evaluates declarative rules against entity snapshots
- Emits domain events on rule transitions
- No executable code, pure evaluation

### 12. **Workflow Engine** (`src/ontology/workflow-engine.ts` & `src/execution/WorkflowEngine.ts`)
- Executes declarative workflows
- Handles automated steps and human tasks
- Integrates with authority and decision journal

### 13. **Authority Evaluator** (`src/authority/AuthorityEvaluator.ts`)
- Evaluates authority requests
- Traverses authority graph to find permission paths
- Enforces AI safety constraints

### 14. **Authority Graph Engine** (`src/authority/AuthorityGraphEngine.ts`)
- Resolves authority snapshots for actors
- Pure, read-only traversal
- Handles delegation chains

### 15. **Replay Engine** (`src/replay/ReplayEngine.ts`)
- Assembles deterministic replay timelines
- Uses recorded snapshots only
- No inference or recomputation

### 16. **Execution Manager** (`src/execution/ExecutionManager.ts`)
- Manages execution intents and attempts
- Handles dry-run and real execution modes
- Integrates with authority evaluator

### 17. **Semantic Query Engine** (`src/ontology/query/SemanticQueryEngine.ts`)
- Executes declarative ontology queries (filters, sorts, pagination)
- Handles direction-aware relationship traversal
- Integrated with scenario overlays and temporal resolution
- Pure functional core logic

### 18. **Ontology Compiler** (`src/ontology/definition/OntologyCompiler.ts`)
- Metadata-to-Runtime transformation engine
- Generates validators, UI schemas, and AI context schemas
- Ensures no hardcoded business logic in the UI or AI layers

### 19. **Ontology Snapshot Resolver** (`src/ontology/definition/OntologySnapshotResolver.ts`)
- Bi-temporal metadata resolution
- Resolves (asOf + Version) -> OntologySnapshot
- Essential for historical replay across ontology versions

## Managers

### 1. **Scenario Manager** (`src/ontology/ScenarioManager.ts`)
- Manages scenario branches and mutations
- Detects conflicts
- Promotes scenarios to truth

### 2. **Decision Journal Manager** (`src/decision/DecisionJournalManager.ts`)
- Records all human decisions
- Immutable decision logs
- Supports replay

### 3. **Authority Lifecycle Manager** (`src/authority/AuthorityLifecycleManager.ts`)
- Manages authority edge lifecycle
- Handles creation, revocation, expiration

## Key Principles Observed

1. **Pure Functions**: Most engines are stateless and deterministic
2. **Read-Only Analytics**: Metrics, Signals, Attention are all derived views
3. **Immutable History**: All changes create new versions, never updates
4. **Tenant Isolation**: All operations are tenant-scoped
5. **Authority Enforcement**: All mutations require authority checks
6. **Metadata-Driven**: No hardcoded business logic

## Integration Points

- **QueryClient**: Main interface for querying ontology
- **OntologyStore**: In-memory store (would be DB in production)
- **IdentityContext**: Current user/session context
- **TenantContext**: Tenant isolation
- **TimeContext**: AS-OF time for temporal queries

## Next Steps

Now implementing:
1. ✅ Fixed spatial layer (world map background)
2. ✅ Semantic Query Engine (declarative DSL)
3. ✅ Metadata-Driven UI Generation (DataEntryForm)
4. ✅ Ontology-Aware AI Context Builder
5. 🔄 Gemini 2.0 integration (Advisory)
6. 🔄 Capability registry
7. 🔄 AI context visualization
8. 🔄 Enhanced map overlays
9. 🔄 Authentication system
10. 🔄 Ontology-Defined Metrics (Parsing & Execution)

