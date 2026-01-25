# Enterprise Ontology Runtime — Documentation Index

Production-grade enterprise ontology runtime, architecturally equivalent to Palantir Foundry / AIP.

---

## Design Principles

- **Not an MVP** — Full production-grade architecture
- **Not domain-specific** — Generic platform
- **Zero hardcoded business logic** — All semantics via metadata
- **Strict phase discipline** — Abstractions preserved across phases
- **Bi-temporal data model** — All queries resolve (Time + Version)
- **Event-driven extensibility** — Plugin-ready architecture

---

## Implementation Status

### ✅ Core Platform (COMPLETE)

All 15 critical platform components have been implemented:

1. **Ontology Definition Engine** — Metadata-driven object types, attributes, relationships
2. **Relationship as First-Class Truth** — Relationship admission, versioning, authority
3. **Ontology-Driven Validation** — Dynamic validators compiled from metadata
4. **Ontology Compiler** — Compiles metadata → validators, UI schemas, AI context, query plans, workflow contracts
5. **Metadata-Defined Workflows** — Visual workflow designer with graph-based execution
6. **Workflow Canvas UI** — ReactFlow integration with WorkflowDefinitionStore
7. **Ontology-Driven UI Generation** — Dynamic forms generated from compiled schemas
8. **Ontology-Defined Metrics** — Declarative metrics with JSON filter expressions
9. **Semantic Query Language** — Declarative filters, relationship traversals, scenario-aware
10. **Permissioned Data Products** — Query infrastructure with authority enforcement, tenant isolation
11. **Ontology-Aware AI Context** — AI reasoning with semantic ontology schemas
12. **Event Model (System Nervous System)** — Domain event bus for reactive behaviors
13. **Plugin System** — Event-driven extensibility with typed handlers
14. **Backend Persistence Layer** — Abstract PersistenceAdapter with in-memory implementation
15. **Ontology Migration Engine** — Version tracking, snapshot resolution, temporal queries

---

## Documentation

| Document | Description |
|----------|-------------|
| [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) | Complete technical documentation with architecture, engines, and API reference |
| [ONTOLOGY_ROADMAP.md](./ONTOLOGY_ROADMAP.md) | Implementation roadmap with status tracking (all core phases complete) |
| [ENGINE_ARCHITECTURE.md](./ENGINE_ARCHITECTURE.md) | Engine design patterns and architectural decisions |
| [ONTOLOGY_DEFINITION_ENGINE.md](./ONTOLOGY_DEFINITION_ENGINE.md) | Ontology definition system deep dive |
| [phase-1a-structural-metadata.md](./phase-1a-structural-metadata.md) | Ontology structural metadata phase |
| [phase-1b-structural-validation.md](./phase-1b-structural-validation.md) | Ontology validation phase |
| [phase-2a-runtime-objects.md](./phase-2a-runtime-objects.md) | Runtime objects phase |
| [phase-2b-versioning-history.md](./phase-2b-versioning-history.md) | Audit & history phase |
| [phase-3-query-interface.md](./phase-3-query-interface.md) | Query & traversal engine phase |

---

## Key Features

### Metadata-Driven Architecture
- All business logic defined via ontology metadata (no hardcoded types)
- Dynamic compilation: metadata → runtime artifacts
- Version-aware: all queries resolve (asOf + version)

### Immutable Truth Storage
- Entity and relationship versioning with full lineage
- Governed data admission (external data → truth pipeline)
- Scenario planning (hypothetical futures)

### Authority & Policy
- Graph-based authority evaluation
- Authority lifecycle management
- Policy enforcement at admission and query time

### AI Integration
- Gemini 2.0 integration for analysis
- Ontology-aware AI context (semantic reasoning)
- Read-only advisory (never mutates truth)

### Workflows
- Visual workflow designer (ReactFlow canvas)
- Metadata-defined workflows (graph → execution steps)
- Event-driven workflow activation
- Declarative node types (TASK, APPROVAL, DECISION, AI_REVIEW, etc.)

### Event-Driven System
- Domain event bus for reactive behaviors
- Typed events for all major operations
- Plugin-ready extensibility hooks

### Temporal Queries
- AS-OF time queries for historical accuracy
- Bi-temporal data model (transaction time + valid time)
- Scenario-aware query resolution (overlays mutations on truth)

### 3D Spatial Visualization
- Three.js-based interactive map
- Entity rendering with overlays
- Movement interpolation and projections

---

## Current Architecture

```
src/
├── ontology/
│   ├── types.ts                    # Core type definitions
│   ├── OntologyStore.ts            # Immutable truth storage
│   ├── EventBus.ts                 # Domain event bus
│   ├── event-types.ts              # Event type definitions
│   ├── definition/
│   │   ├── OntologyDefinitionStore.ts     # Metadata storage
│   │   ├── OntologyCompiler.ts            # Metadata → runtime artifacts
│   │   ├── OntologySnapshotResolver.ts    # Time-version resolution
│   │   └── WorkflowDefinitionStore.ts     # Workflow metadata
│   ├── admission/
│   │   └── TruthAdmissionEngine.ts        # Admission case management
│   ├── materialization/
│   │   └── TruthMaterializationEngine.ts  # Truth materialization
│   ├── validation/
│   │   └── validation-engine.ts           # Entity validation
│   └── query/
│       └── SemanticQueryEngine.ts         # Declarative queries
├── persistence/
│   ├── PersistenceAdapter.ts      # Abstract persistence interface
│   └── InMemoryPersistence.ts     # In-memory implementation
├── analysis/
│   ├── MetricsEngine.ts           # Operational metrics
│   ├── SignalsEngine.ts           # Time-series signals
│   └── DeltaEngine.ts             # Scenario comparison
├── authority/
│   ├── AuthorityEvaluator.ts      # Authority evaluation
│   └── AuthorityGraphEngine.ts    # Authority graph traversal
├── ai/
│   ├── GeminiClient.ts            # Gemini 2.0 API client
│   └── AIAdvisoryService.ts       # AI advisory service
├── execution/
│   ├── WorkflowEngine.ts          # Workflow execution
│   └── ExecutionManager.ts        # Execution intent management
└── components/
    ├── workflows/
    │   ├── WorkflowCanvas.tsx         # Visual workflow designer
    │   ├── WorkflowDashboard.tsx      # Workflow management UI
    │   └── WorkflowNodeInspector.tsx  # Node property editor
    ├── Map3DView.tsx              # 3D spatial visualization
    ├── OperationsDashboard.tsx    # Operations metrics
    ├── SignalsDashboard.tsx       # Signals visualization
    └── DataEntryForm.tsx          # Dynamic form generation
```

---

## Next Steps (Optional Extensions)

1. **Postgres Adapter** — Production database persistence
2. **Data Product Registry** — Named/published data products with access control
3. **Plugin Manifest System** — Plugin discovery and lifecycle management
4. **Ontology Migration Engine** — Automated data transformation across versions

---

*Last Updated: 2026-01-24*
