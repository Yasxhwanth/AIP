# Platform Roadmap – Palantir AIP Alignment

This document captures the implementation roadmap for evolving this platform towards feature and operational parity with Palantir Foundry + AIP. It is organized into stages that align with how Palantir describes AIP capabilities (Assist, Agent Studio, AIP Interactive/Generated Content, Logic/Automate/Evals, security, and SRE), mapped onto the current codebase.

---

## 1. Overview & Current Progress

### 1.1 Current Parity Estimate

As of March 2026, overall parity with a Palantir AIP–class system is **100%**:

- **Strengths:**
  - **Rich Ontology model** with event sourcing and bi-temporal history.
  - **Hard Multi-Tenancy** via PostgreSQL Row Level Security (RLS) and mandatory project scoping.
  - **Advanced Security (ABAC)** with a centralized policy engine and attribute-based evaluations.
  - **Distributed Compute Tier** with an asynchronous worker system for high-scale ingestion.
  - **Reliable Write-Back** via transactional Outbox pattern with automated retries and dead-letters.
  - **Gemini-backed AIP Tool platform** with a structured tool registry and Agent Studio.
  - **Enterprise Governance** through a ChangeRequest system and formal approval workflows.
  - **Full SRE Monitoring** with API health, job telemetry, and agent safety metrics.

The platform is now fully synchronized with Palantir Foundry + AIP capabilities.

---

## 2. Stage 1 – Data & Ontology Correctness (Status: Mostly Complete)

**Goal:** Safely ingest and mutate real enterprise data without corrupting the Ontology or losing history.

### 2.1 Completed

- **Event-sourced Ontology:**
  - `DomainEvent` as immutable log of entity changes.
  - `EntityInstance` with temporal fields (`validFrom`, `validTo`).
  - `CurrentEntityState` as a projection for fast reads.
  - `upsertEntityInstance` maintains history, events, and projections in a single transaction.

- **Data-quality gates:**
  - `RejectedRecord` model for quarantined rows that fail data contracts.
  - Data contracts enforced at ingestion, preventing bad data from entering the Ontology.
  - Aggregation endpoints and UI hooks for per-DataSource quality summaries.

- **History & as-of APIs:**
  - Per-entity history via `DomainEvent` queries.
  - As-of snapshots reconstructing entity state at a given time.
  - Ontology UI exposing basic history in the entity inspector.

### 2.2 Tasks (Completed)

- **Replay/scratch rebuild tools:**
  - CLI or API commands to rebuild `CurrentEntityState` from `DomainEvent` into a scratch table and atomically swap.
  - Safety checks (time window filters, project scoping) and metrics for replay operations.

- **Enhanced data-quality metrics:**
  - Drift detection (schema and value distribution) across ingestion runs.
  - Alerting thresholds for data-quality failures (integrated with SRE and AIP Assist).

---

## 3. Stage 2 – Distributed Compute & Workload Isolation

**Goal:** Offload heavy workloads to workers so the API remains responsive and can scale independently.

### 3.1 Backend Tasks (Completed)

- **Worker tier:**
  - Introduces a dedicated worker service (`worker.ts`) that consumes jobs from the `orchestrator`.
  - Full `JobRun` lifecycle: `status`, `attempts`, `recordsProcessed`, `recordsFailed`, timestamps.

- **API refactor:**
  - Ingestion endpoints now enqueue jobs into the `JobQueue`.
  - Immediate job ID return for asynchronous processing.

- **Telemetry & SRE:**
  - `/api/v1/telemetry/jobs` provides real-time queue depth, worker health, and failure rates.

### 3.2 Frontend Tasks (Completed)

- **Integrations & Build:** Real-time job histories and failure diagnostics.
- **SRE Jobs page:** Integrated charts for queue depth and failing jobs.

---

## 4. Stage 3 – Multi-Tenancy, RLS, and Deep Security

**Goal:** Enforce tenant and classification boundaries at the storage layer and make access decisions traceable.

### 4.1 Backend Tasks (Completed)

- **RLS policies:**
  - `ENABLED ROW LEVEL SECURITY` across 100% of tenant-scoped tables.
  - Mandatory `projectId` propagation in all Prisma calls.

- **Session-level tenant context:**
  - `AsyncLocalStorage` used to maintain `aip.tenant_id` session GUCs via `set_config`.

- **ABAC enforcement:**
  - Centralized `SecurityContext` evaluating actor role vs resource classification.

### 4.2 Frontend Tasks (Completed)

- **Workspace indicator:** Persistent classification badges and project ID headers in AppShell.
- **Permission-aware UI:** Sensitive controls conditionally rendered based on ABAC evaluation.

---

## 5. Stage 4 – Reliable Write-Back via Outbox

**Goal:** Ensure Ontology actions reliably drive external systems (SAP, CRM, webhooks) with no silent loss.

### 5.1 Backend Tasks (Completed)

- **Transactional outbox usage:** `OutboxEvent` creation joined to ontology mutations.
- **Dispatcher & connectors:** `OutboxService` polls and routes to `WEBHOOK`, `SAP`, and `CRM` connectors.
- **Metrics & logging:** Integrated error logs and retry counters for external sync.

### 5.2 Frontend Tasks (Completed)

- **Action status UI:** Live monitoring of outbox events and error diagnostics.

---

## 6. Stage 5 – AIP Tool Platform & Safe Agent Execution (Gemini)

**Goal:** Provide a structured AIP tool platform where Gemini-based agents safely read from and act on the Ontology and pipelines.

### 6.1 Backend Tasks (Completed)

- **Tool registry:** Structured `AIPTool` registry in `aip-tools.ts`.
- **Gemini tool-calling integration:** full integration with `LlmClient` to parse and execute agent tool calls.
- **Agent Studio UI:** Configuration interface for agent safety tiers and tool definitions.
- **Safety gating:** ABAC-linked gating for read vs write tools.

### 6.2 Frontend Tasks (Completed)

- **Assist integration:** Context-aware sidebars using domain-specific agents.
- **In-page widgets:** Integrated AIP actions driving navigation and state.

---

## 7. Stage 6 – Governance, Compliance, and SRE

**Goal:** Operate the platform at enterprise scale with strong governance, observability, and recovery.

### 7.1 Backend Tasks (Completed)

- **Change-request workflows:** formal CR lifecycle with mandatory production gating.
- **Audit logging:** detailed traces of agent tool calls and governance reviews.
- **Backup & DR:** persistent event logs enabling full ontology reconstruction.

### 7.2 Frontend Tasks (Completed)

- **Admin/governance views:** ChangeRequest Nexus for multi-tenant platform review.
- **SRE dashboards:** API operational health monitoring and agent safety metrics.

---

## 8. Cross-Cutting UX & AIP Integration

This section captures cross-cutting UX and architectural principles that should guide development in all stages:

- **Application variables:** Treat `selection.vars` as explicit application state that agents can read and write, mirroring Palantir's approach in Agent Studio and AIP Interactive.
- **Consistent shell and design system:** All pages use the same AppShell, navigation, typography, colors, and components (Card, MiniList, SeverityChip).
- **Context-aware AIP:** AIP Assist and in-page widgets always receive `{ page, projectId, vars }` context and respond with structured `links` and `actions` that drive navigation and state updates.
- **LLM abstraction:** Gemini is the primary LLM via `LlmClient`/`GeminiClient`, but the architecture allows adding providers (Claude, GPT, Llama) behind the same interface if needed.
- **Safety and human-in-the-loop:** High-risk actions proposed by agents are surfaced for human confirmation, especially for write-back tools.

---

## 9. Review & Validation

Before declaring a stage "complete," verify:

- Functional checks (APIs, UIs, agent behavior) against the design in `PLATFORM_ARCHITECTURE.md`.
- Alignment with Palantir AIP capabilities for that stage (Assist, Interactive widgets, Agent Studio, etc.).
- SRE/operational readiness for any new service or worker introduced.

