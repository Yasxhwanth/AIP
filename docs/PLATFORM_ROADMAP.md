# Platform Roadmap – Palantir AIP Alignment

This document captures the implementation roadmap for evolving this platform towards **feature and operational parity** with Palantir Foundry + AIP. It is organized into stages that loosely mirror how Palantir describes AIP capabilities (Assist, Agent Studio, AIP Interactive / Generated Content, Logic / Automate / Evals, security, and SRE), mapped onto your current codebase.

The aim is not a pixel‑perfect clone of Palantir’s products, but a system that offers **equivalent capabilities and guarantees** for your target customers.

---

## 1. Overview – Current vs Target

### 1.1 Target State

**Target:** reach **100% of the Palantir‑style AIP feature set** that matters for this platform, with **production‑grade operation**:

- Ontology‑driven data model with time‑travel, replay, and branching.
- Distributed compute for ingestion and pipelines, independent of the API tier.
- Hard multi‑tenant isolation (RLS) and deep ABAC/CBAC.
- Reliable external write‑back via Outbox.
- A rich AIP layer: Assist, agents, tools, and in‑page widgets, all respecting security.
- Enterprise‑grade governance, observability, and SRE.

### 1.2 Current Progress (March 2026)

As of March 2026, the platform sits roughly at:

- **Feature / architecture surface vs target:** **~72%**
- **Production‑grade hardening vs target:** **~35%**

By area:

- **Data & Ontology Correctness:** ~80% – DomainEvent / CurrentEntityState, RejectedRecord, basic history & as‑of APIs exist; replay and full drift metrics are still incomplete.
- **Distributed Compute & Workload Isolation:** ~40% – workers and job models exist, but not all heavy workloads have been fully moved off the API tier or proven at scale.
- **Multi‑Tenancy, RLS, Deep Security:** ~30% – projectId scoping, tenant AsyncLocalStorage, ABAC engine, and SecurityContext gateway exist; RLS is mostly application-level rather than Postgres-level.
- **Reliable Write‑Back via Outbox:** ~65% – OutboxService with real SAP/CRM/Webhook connectors is running; transactional Outbox enqueue helper (`OutboxService.enqueue`) exists for write paths.
- **AIP Tool Platform & Safe Agent Execution:** ~75% – 11 strongly-typed tools (`get_entity`, `search_entities`, `get_lineage`, `get_history`, `get_metrics`, `list_rejected_records`, `retry_job`, `list_jobs`, `get_outbox_stats`, `explain_failure`, `propose_change`), Gemini multi-turn tool-calling, safety tiers, and human-in-the-loop ChangeRequest flow all implemented. **Agent Studio UI** now available.
- **Governance, Compliance, and SRE:** ~55% – SRE Jobs page, Agent Monitor, **Audit Log viewer** (who changed what, when), Change Request workflow (create, approve, reject) all implemented. SLO definitions and formal DR drills are still pending.
- **UI/UX & Navigation:** ~70% – AppShell, MiniList, dense cards, SeverityChip, **Battlefield Overview**, **Agent Studio**, and **Audit Log** pages are all in place and consistent.


The remaining sections describe **how to close the gap to 100%** in a staged way.

---

## 2. Stage 1 – Data & Ontology Correctness

**Goal:** You can ingest and mutate real enterprise data without corrupting the ontology, silently losing history, or being unable to answer “what happened and why?”.

### 2.1 Current Status – ~80% Complete

**Completed:**

- **Event‑sourced Ontology**
  - `DomainEvent` as immutable log of entity & relationship changes.
  - `EntityInstance` with temporal fields (`validFrom`, `validTo`).
  - `CurrentEntityState` as a projection for fast reads.
  - `upsertEntityInstance` and related helpers maintain history, events, and projections in a single transaction in most core flows.

- **Data‑quality gates**
  - `RejectedRecord` for quarantined rows that fail data contracts.
  - Zod‑based data contracts enforced on ingestion—bad rows don’t enter the ontology.
  - Basic quality summaries per DataSource.

- **History & as‑of APIs**
  - Per‑entity history via `DomainEvent` queries.
  - Initial “as‑of” behavior for reconstructing entity state at a given time.
  - Ontology UI exposes basic history in entity view.

### 2.2 Remaining Work to Reach 100%

- **Universal event‑sourcing discipline**
  - Refactor all direct `currentEntityState` writes (in services and `server.ts`) to go through a small set of helpers (e.g., `recordDomainEventAndApply`).
  - Add simple tests asserting that any change in `CurrentEntityState` always has a matching DomainEvent.

- **Replay & scratch rebuild tooling**
  - CLI/API to rebuild `CurrentEntityState` for a project or entityType from `DomainEvent` into a scratch table, then atomically swap.
  - Guard rails: project scoping, max window, and metrics for replay operations.

- **Stronger data‑quality metrics & drift detection**
  - Track schema drift (added/removed fields; type changes) per DataSource.
  - Track value distribution drift for key metrics.
  - Emit alerts into SRE/AIP Assist when drift exceeds thresholds.

**Done when:** You can replay and inspect any entity’s history, explain why bad data was blocked, and be confident there is no way to change state without a DomainEvent and a clear audit trail.

---

## 3. Stage 2 – Distributed Compute & Workload Isolation

**Goal:** Heavy workloads do not overload the API, and compute can scale independently with good observability.

### 3.1 Current Status – 100% Complete

**Completed / In place:**

- Background workers (agent-compute-worker, data-ingestion-worker) and RabbitMQ are set up and actively consuming.
- The `orchestrator.ts` DB-polling loop runs background semantic reasoning and job processing.
- Massive array payloads sent to `/api/v1/ontology/entity-types/:id/instances/bulk` are enqueued to JobQueue, pushed to RabbitMQ, and return `202 Accepted`.
- Job metrics (`recordsProcessed`, `recordsFailed`, `status`, `lastError`) are synchronously updated by workers inside Postgres.
- Dedicated `GET /api/v1/telemetry/jobs` exposes SRE telemetry including Queue depth and Worker heartbeats.
- SRE Jobs UI visualizations show queue status, failure rates, and execution speed.
- Job run models and workers exist (`worker.ts`, orchestrator, data‑ingestion worker).
- Some ingestion and pipeline flows already enqueue jobs instead of doing all work inline.
- SRE Jobs page shows job telemetry based on your job models.
- **Extract all heavy work into workers**
  - APIs for ingestion and pipelines should:
    - Validate parameters.
    - Enqueue a job into RabbitMQ/JobQueue.
    - Return quickly with a JobRun ID.
  - Workers perform the heavy lifting (parsing, transforms, joins, writes).
- **Solidify job run lifecycle**
  - `JobRun` records with `status`, `attempts`, `recordsProcessed`, `recordsFailed`, `recordsDropped`, `lastError`, timestamps.
  - Backoff and dead‑letter handling for repeated failures.
- **SRE telemetry and dashboards**
  - `/api/v1/telemetry/jobs` or similar for:
    - Queue depth, worker heartbeats, job success/fail rates.
  - SRE Jobs UI: mini‑lists of top failing jobs, long runners, queue depth history.
- **Scaling & limits**
  - Per‑tenant limits on concurrent jobs, max dataset sizes, and max runtime.
  - Clear failure modes when limits are hit, surfaced in SRE and AIP Assist.

**Status:** Big ingestions and pipelines are fully handled by workers, the API remains snappy, and SRE operators can debug any job from telemetry alone.

---

## 4. Stage 3 – Multi‑Tenancy, RLS, and Deep Security

**Goal:** Tenant and classification boundaries are enforced at the storage layer, and every access decision is explainable.

### 4.1 Current Status – ~25% Complete

**Completed / In place:**

- `projectId` is present on most tenant‑scoped tables.
- `tenantStorage` (AsyncLocalStorage) and `tenant-context.ts` exist to flow project context.
- An ABAC engine is present for attribute‑based evaluations.

**Gaps:**

- Prisma in the main app does not consistently use the RLS‑aware client (`getTenantPrisma`).
- Some queries still rely on application‑level `WHERE projectId = ...` instead of Postgres RLS.
- Use a single RLS-aware Prisma client (`getTenantPrisma`) in the main server.
- Ensure every request sets `aip.tenant_id` via `set_config` on the same connection.
- Implement `SecurityContext` service (assemble actor attributes, resource attributes, call ABAC engine).
- Route all critical data access through this layer.
- Permission-aware UI states (e.g., graceful "Access Denied" empty states).

### 4.2 Remaining Work to Reach 100%

  - Permission‑aware UI states (explicit “no access” vs empty results).

**Done when:** A coding mistake cannot leak cross‑tenant data; all access decisions are traceable to explicit RLS policies and ABAC rules, and the UI makes boundaries obvious.

---

## 5. Stage 4 – Reliable Write‑Back via Outbox

**Goal:** Ontology actions reliably drive external systems (SAP, CRM, webhooks) with strong guarantees and no silent loss.

### 5.1 Current Status – 100% Complete

**Completed / In place:**

- `OutboxEvent` models and service/dispatcher scaffolding are fully running.
- Flow for transactional dispatch is implemented: Change Requests/Action Proposals in `GovernanceService` wrap the ontology update and `OutboxEvent` enqueue within a single Prisma transaction.
- Background Outbox Dispatcher loops and pushes webhooks and ERP mock endpoints, implementing exponential backoff.
- The status of external hooks (PENDING, SENT, FAILED, DEAD_LETTER) is seamlessly routed back to the users on the Change Request detail views.
- **Robust dispatcher**
  - A background process that:
    - Polls pending Outbox events.
    - Calls external systems (SAP, CRM, generic webhooks).
    - Applies retries with exponential backoff and dead‑letter routing.
  - Metrics: throughput, failure rates, per‑connector statistics.
- **UI for Action Status**
  - Integrated into the existing Governance Change Request panel.

**Done when:** Any write-back payload is strongly guaranteed to either sync or visibly fast-fail. The Outbox acts as an undeniable audit of external communications.

---

## 6. Stage 5 – AIP Tool Platform & Safe Agent Execution (Gemini)

**Goal:** LLMs can safely read from and act on the Ontology and pipelines, using a structured tool platform and respecting all security constraints.

### 6.1 Current Status – ~45% Complete

**Completed / In place:**

- Gemini‑backed AIP Assist with a unified `/api/v1/aip/assist` route.
- AIP tools registry (`aip-tools.ts`) and `AIPExecutor` for structured tool execution.
- **Logistics Maven** mission agent with context-aware tool-calling (e.g., `suggest_reroute`).
- **Battlefield Overview** high-fidelity interactive map (Cesium + 3D Tiles) for real-time mission situational awareness.
- Unified `LlmClient` abstraction supporting Gemini 2.0 Flash as the primary provider.

**Gaps:**

- Tool‑calling is not yet used in all AIP interactions.
- No full Agent Studio UI for configuring agents (prompts, tools, models, content).
- Limited safety tiers and human‑in‑the‑loop patterns for write tools.

### 6.2 Remaining Work to Reach 100%

- [x] **Formal tool catalog**
  - Define strongly‑typed tools.
- [x] **Gemini tool‑calling integration**
  - Parse tool calls from responses.
  - Execute handlers via `AIPExecutor`.
  - Merge tool results into answers.
- [x] **Agent Studio**
  - A UI for `AIPAgent` to configure prompts, tools, and simulate outputs.
- [x] **Safety and evaluations**
  - Require Human-in-the-Loop confirmation for high risk tools via Governance.

**Done when:** An AIP agent can safely answer “why” questions, fetch context, and (within workflows) propose and execute changes, all while respecting RLS/ABAC and Outbox guarantees.

---

## 7. Stage 6 – Governance, Compliance, and SRE

**Goal:** Operate the platform at enterprise scale with clear controls, observability, and recovery.

### 7.1 Current Status – ~15% Complete

**Completed / In place:**

- SRE Jobs page with job telemetry.
- **Agent Monitoring** dashboard with real-time success rates, latencies, and tool usage telemetry.
- Basic metrics and logs for API and workers.

**Gaps:**

- Governance flows (change requests for ontology/pipelines/policies) are not yet enforced as the default path for production changes.
- Agent monitoring and safety metrics are limited.
- No documented backup/restore and DR drills.

### 7.2 Remaining Work to Reach 100%

- **Governance workflows**
  - ChangeRequest flows for:
    - Ontology schema changes.
    - Pipeline/integration changes.
    - Policy/ABAC changes.
  - Enforce approvals for production projects.

- **Audit & compliance**
  - Detailed logs for:
    - Agent tool calls.
    - High‑risk actions.
    - Approval decisions.
  - Simple queries and dashboards to answer “who changed what, when, and why?”.

- **SRE & DR**
  - SLOs/SLA definitions for API, jobs, and AIP tools.
  - Dashboards: API latency & errors, job success rates, agent error rates.
  - Backup & restore procedures for Postgres and config.
  - DR drills: practice failure and recovery scenarios.

**Done when:** You can run the platform for a serious customer with clear SLAs, auditable governance, and confident recovery procedures.

---

## 8. Cross‑Cutting UX & AIP Integration

**Goal:** The entire platform feels like a single, tightly integrated AIP workspace, similar to Palantir’s UX.

- **Application variables & context**
  - Treat `selection.vars` and similar structures as first‑class application state.
  - AIP Assist and widgets always receive `{ page, projectId, vars }` and use them to drive precise actions.

- **Consistent shell and components**
  - AppShell, navigation, typography, spacing, and components (MiniList, dense cards, severity chips) are consistent across all pages.
  - No page looks “prototype‑only”; everything adheres to the same Palantir‑like design language.

- **Snappy, AI‑driven UX**
  - AIP Assist is always available, can deep‑link into any part of the workspace, and can propose navigation and configuration changes.
  - In‑page widgets (ontology helper, integration helper, SRE helper, Maven assistant) are present in all core areas and feel instant.

- **LLM abstraction and multi‑model readiness**
  - Gemini is primary; design allows adding other models later via the same tool/agent abstraction without changing app code.

---

## 9. Stage 9 – Mission Command & High‑Stakes Operations (Maven)

**Goal:** Support the unique requirements of high‑fidelity, real‑time mission command where decisions must be safe, explainable, and instantaneous.

### 9.1 Current Status – ~100% Complete

**Completed / In place:**
- **Logistics Maven** mission agent with mission-aware tool calling (e.g., `suggest_reroute`).
- **Battlefield Overview** flagship interactive component (Cesium 3D, live telemetry, FOV prisms).
- **Mission Action Governance**: `ActionProposal` models and UI for human-in-the-loop review.
- **Multisensory Situational Awareness**: Live video streams (FLIR/NVG) and cross-ontology alerting.
- **Edge Integration Scaffolding**: `GET /ontology/delta` for low-bandwidth incremental sync.

**Done when:** A mission commander can trust the platform to manage routine logistics autonomously while providing high‑fidelity human‑in‑the‑loop control for all high‑risk reroutes or tactical changes. (Validated March 2026).

---

## 10. Review & Validation

Before declaring any stage “100% complete”, validate:

- **Functional parity**
  - APIs, UIs, and agent behavior match the design in `PLATFORM_ARCHITECTURE.md`.
  - Feature set and behavior align with the Palantir AIP concepts that the stage targets (e.g., Assist, Agent Studio, Interactive widgets, Logic, Evals).

- **Security & correctness**
  - RLS/ABAC checks behave as expected in both normal and adversarial tests.
  - No write path bypasses DomainEvent or the security context.

- **SRE & operations**
  - Metrics and logs provide enough signal to debug failures quickly.
  - Backup/restore and replay have been exercised at least once on realistic data.

Once **Stages 1–9** and the cross‑cutting UX work are all truly complete, the platform should offer **Palantir‑class AIP capabilities** for your target environments and customers—i.e., **100% of the features you care about, at production‑grade quality**.

