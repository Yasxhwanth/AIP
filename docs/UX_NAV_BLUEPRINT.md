# UX Navigation Blueprint

## Purpose
This blueprint defines how users should move through the platform as they progress from onboarding to operations, using a Palantir-like interaction model adapted to this codebase.

It is implementation-focused. Every section is written so engineering can execute it directly.

## Target Outcome
Build a production-grade navigation and interaction system where:
- users always know where they are,
- users always know the next best action,
- AI actions update the same shared state the UI uses,
- core pages follow one layout and behavior contract,
- operators can complete end-to-end workflows without dead ends.

## Source Pattern Baseline (public docs)
This blueprint uses patterns from public Palantir docs and maps them to this repo:
- AIP Assist context-aware support
- Agent Studio application state variables
- Workshop layouts and variable-backed pages
- AIP Interactive style in-page agent widgets
- Controlled release lifecycle via product channels

Reference links:
- https://www.palantir.com/docs/foundry/assist/overview
- https://www.palantir.com/docs/foundry/agent-studio/application-state
- https://www.palantir.com/docs/foundry/workshop/overview
- https://www.palantir.com/docs/foundry/workshop/variable-backed-layouts
- https://www.palantir.com/docs/foundry/foundry-devops/manage-products/index.html

## Information Architecture

### Global structure
Use one top-level travel model across all users:
1. Explore
2. Build
3. Operate
4. Govern

Map current app routes into those buckets:
- Explore: `/ontology`, `/files`, `/projects`, `/geo`
- Build: `/integrations`, `/build/*`, `/apps`, `/apps/agent-studio`
- Operate: `/run/*`, `/maven`, `/telemetry`, `/resolve`, `/workshop`
- Govern: `/policy`, `/audit`, `/sre/*`, `/admin/*`

### Progressive user travel
Users should progress in this order for first-value and repeat-value loops:
1. Select workspace/project and mission scope.
2. Explore ontology objects and current state.
3. Connect ingestion sources and run quality checks.
4. Validate computed data and build operational views.
5. Operate in run-time pages (run dashboard, maven, telemetry).
6. Apply governance, approvals, and monitor reliability.

Every core page must expose:
- current step in this progression,
- previous step shortcut,
- next recommended step shortcut.

## Navigation System Contract

### Left rail (global)
The rail must be stable and role-aware:
- fixed core entries by IA bucket,
- active route highlight,
- per-role hidden items,
- no route that opens to incomplete dead-end by default.

Required behavior:
- route changes update breadcrumbs and page context,
- keyboard mnemonics remain globally available,
- command palette can navigate to all non-hidden routes.

### Top bar (global)
Top bar must always include:
- workspace/project selector,
- environment and classification indicator,
- page path breadcrumb,
- global search and command trigger,
- assist toggle.

### Breadcrumb and next action
Each page header includes:
- breadcrumb path,
- single `Primary Action` button,
- single `Next Step` button.

If no next step exists, page must show `Workflow complete` state.

### URL and state invariants
Navigation state must live in URL and shared store.

Required URL shape:
- selected object IDs in query params,
- selected tabs in query params,
- pagination and filters in query params.

Required store shape:
- `activePage`
- `workspaceId`
- `selected entity/pipeline/job`
- `vars` for AI and UI synchronization.

Rule:
- UI controls update URL and store.
- AI actions update store and URL through one action dispatcher.

## Page Layout Contract
All core pages must use one structure:
1. Header row (title, scope, primary action, next step)
2. Context toolbar (filters, status chips, quick commands)
3. Main pane split (primary work area + secondary inspector)
4. Optional footer command strip

Layout rules:
- each pane must set `min-h-0` where scrollable,
- each scroll region must be explicit,
- no nested hidden overflow without a visible scroll target,
- cards/lists/tables use shared primitives only.

## AI and UI Reaction Model

### Shared action protocol
All AI and system actions must resolve to this typed protocol:
- `navTo(route)`
- `setFilter(key, value)`
- `focusEntity(entityTypeId, logicalId)`
- `openPanel(panelId)`
- `setVar(name, value)`
- `triggerJob(jobType, payload)`

Actions run through one dispatcher that:
- validates payload schema,
- applies store updates,
- syncs URL,
- logs action for audit.

### Safety
For any write or external effect:
- show confirmation drawer,
- show impacted entities/resources,
- require explicit user confirmation,
- log to audit trail.

## UX Quality Bar for Alpha

### Must pass
- no overlapping panes at 1280x720 and above,
- no route with broken primary navigation,
- all core pages have valid loading/empty/error/data states,
- every action outcome is visible in-page,
- keyboard navigation works for search and core route jumps.

### Must not ship
- orphan routes with placeholder text as primary content,
- controls that do not mutate UI or backend state,
- hidden critical actions only available through AI,
- inconsistent card/list spacing causing merged visuals.

## Implementation Plan (production-ready)

### Phase A: IA and routing baseline (Week 1)
Deliverables:
- canonical route map,
- left rail regrouped by IA buckets,
- breadcrumb + next-step component,
- route metadata config (`title`, `bucket`, `nextStep`, `requiredRole`).

Acceptance:
- every route appears in route metadata,
- no 404 route reachable from shell navigation.

### Phase B: Shared layout and design primitives (Week 2)
Deliverables:
- page layout wrapper (`PageScaffold`),
- stable panel split utility,
- standardized table and empty-state components,
- spacing scale applied across core pages.

Acceptance:
- core pages render without overlap at desktop breakpoints.

### Phase C: Core workflow pages (Weeks 3-4)
Deliverables:
- `/ontology`, `/integrations`, `/run/dashboard`, `/maven`, `/telemetry`, `/workshop` updated to PageScaffold,
- header + context bar + primary/secondary pane parity,
- next-step links between these pages.

Acceptance:
- full workflow from ontology to operate without leaving scaffolded pages.

### Phase D: AI-state integration (Weeks 5-6)
Deliverables:
- global action dispatcher,
- AI actions mapped to typed protocol,
- URL synchronization for AI-driven navigation,
- user confirmation for write actions.

Acceptance:
- AI-assisted workflow updates same state as manual UI workflow.

### Phase E: Usability hardening and test coverage (Weeks 7-8)
Deliverables:
- smoke tests for route transitions,
- E2E tests for core user journeys,
- UX telemetry events (task start/completion, dead-end, backtrack, action latency).

Acceptance:
- all smoke and E2E tests green,
- measurable reduction in dead-end and backtrack rate.

### Phase F: Release readiness (Week 9)
Deliverables:
- feature flags for nav rewrite,
- staged rollout plan,
- regression checklist for shell and core routes.

Acceptance:
- can deploy nav rewrite to alpha users with rollback path.

## Required Metrics
Track per route and per journey:
- task completion rate,
- median time to complete,
- number of navigation hops,
- backtracking count,
- AI action acceptance rate,
- error-state frequency,
- empty-state frequency.

Use these metrics to prioritize weekly UX fixes.

## Definition of Done
Navigation and UX are production-ready when:
- users can complete all core workflows without guidance,
- AI and manual actions remain in sync,
- route-level tests prevent regressions,
- page-level contracts are consistent across all core routes,
- measured task completion and speed meet target SLOs.
