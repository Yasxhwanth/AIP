# Page Journeys and Route Checklist

## Purpose
This document translates the UX navigation blueprint into route-by-route implementation tasks.

Use this as the execution board for stabilizing the platform to alpha quality.

## Journey 1: Builder (Data to App)

### Goal
Create a reliable data flow and expose it in an operational app.

### Route travel
1. `/workspace/[projectId]`
2. `/ontology`
3. `/integrations`
4. `/build/data`
5. `/build/logic`
6. `/build/applications`
7. `/run/dashboard`

### Required page behavior by step
1. `/workspace/[projectId]`
- project context and environment are explicit.
- next-step button leads to `/ontology`.

2. `/ontology`
- object explorer, schema inspector, and history panel are functional.
- selecting object updates URL and shared store.
- next-step button leads to `/integrations`.

3. `/integrations`
- source list, ingest status, quality failures, and retry actions are visible.
- next-step button leads to `/build/data`.

4. `/build/data`
- data lineage and transformation status are visible.
- validation errors link back to source and ontology object.
- next-step button leads to `/build/logic`.

5. `/build/logic`
- logic function list, version, and run history are visible.
- next-step button leads to `/build/applications`.

6. `/build/applications`
- app list with status and last deploy details.
- launch shortcut leads to `/run/dashboard`.

7. `/run/dashboard`
- operational state is visible and linked to source entities.
- next-step button leads to `/sre/jobs` for reliability checks.

## Journey 2: Operator (Mission runtime)

### Goal
Monitor assets, react to incidents, and execute controlled actions.

### Route travel
1. `/run/dashboard`
2. `/maven`
3. `/telemetry`
4. `/resolve`
5. `/audit`

### Required page behavior by step
1. `/run/dashboard`
- active assets table supports filter, selection, and drilldown.
- selected asset is synchronized to shared store.

2. `/maven`
- tactical map and roster stay synchronized.
- AI can set selected asset, filters, and map layers via store vars.
- critical actions require confirmation.

3. `/telemetry`
- metrics and signal trends are linked to selected asset.
- returning to `/maven` keeps context.

4. `/resolve`
- incident workflow captures owner, status, and remediation action.
- next-step button leads to `/audit`.

5. `/audit`
- all high-risk actions are searchable and traceable to actor/time/resource.

## Journey 3: Governor (Policy and reliability)

### Goal
Ensure secure operation and policy compliance.

### Route travel
1. `/policy`
2. `/sre/jobs`
3. `/sre/agent-monitor`
4. `/sre/governance`
5. `/admin/agent-studio`

### Required page behavior by step
1. `/policy`
- policy list, decision explainability, and simulation are visible.

2. `/sre/jobs`
- queue depth, retries, failures, and long-running jobs are visible.

3. `/sre/agent-monitor`
- agent call volume, latency, success rates, and tool failures are visible.

4. `/sre/governance`
- approvals and blocked actions are visible.

5. `/admin/agent-studio`
- agent configuration is versioned and tied to environment.

## Core Route Checklist (P0)
These routes must be production-usable before alpha release.

### Global checks for every P0 route
- page uses shared scaffold (header, context bar, pane split).
- route has loading, empty, error, and data states.
- route updates URL and shared store for selection/filter context.
- route has a valid next-step link.
- assist actions can navigate and set route variables.

### P0 route list
- `/ontology`
- `/integrations`
- `/run/dashboard`
- `/maven`
- `/telemetry`
- `/workshop`
- `/sre/jobs`

## Extended Route Checklist (P1)
These routes must be coherent but can follow P0.

- `/build/actions`
- `/build/agents`
- `/build/ai`
- `/build/apollo`
- `/build/app`
- `/build/applications`
- `/build/audit`
- `/build/automate`
- `/build/data`
- `/build/evals`
- `/build/governance`
- `/build/logic`
- `/build/metrics`
- `/build/ontology`
- `/build/provenance`
- `/build/publish`
- `/build/security`
- `/build/sources`
- `/build/spark`
- `/policy`
- `/audit`
- `/resolve`
- `/projects`
- `/files`
- `/geo`
- `/inbox`
- `/terminal`
- `/apps`
- `/apps/agent-studio`

## Route Implementation Tasks (execution order)

### Sprint 1: Navigation and shell parity
- add route metadata config for all routes.
- enforce breadcrumb and next-step rendering from metadata.
- ensure command palette indexes metadata routes only.
- add role visibility flags on rail entries.

### Sprint 2: P0 layout stabilization
- migrate each P0 route to shared page scaffold.
- remove ad-hoc spacing and overflow overrides.
- add missing loading and error states.

### Sprint 3: P0 interaction parity
- implement URL-query binding for selected entities and tabs.
- map AI actions to typed dispatcher for all P0 routes.
- add confirmation UX for write actions.

### Sprint 4: P1 normalization
- migrate all P1 routes to scaffold.
- align table/list/card patterns.
- add next-step links for each route.

### Sprint 5: Regression and acceptance
- add smoke test for each P0 route:
  - open route,
  - load data,
  - change selection,
  - navigate to next-step route.
- add E2E tests for three core journeys.

## Acceptance Test Matrix

### Builder journey acceptance
- can go from project to run dashboard with no dead-end page.
- each page preserves context into the next page.

### Operator journey acceptance
- selected asset context survives run -> maven -> telemetry transitions.
- action confirmations appear for write operations.

### Governor journey acceptance
- policy and monitoring pages show consistent context and links.
- agent and job failures are traceable to source actions.

## Immediate Engineering Backlog
Start these now:
1. Create `routeMeta.ts` with title, bucket, role, and next-step for every route.
2. Create shared `PageScaffold` component and migrate P0 routes.
3. Create `uiActionDispatcher.ts` and map assist actions to dispatcher.
4. Add smoke tests for P0 routes and route transitions.

## Alpha Exit Criteria
Do not declare UI alpha-ready until:
- all P0 routes pass smoke tests,
- three core journeys pass E2E,
- route dead-end rate is below 5 percent,
- task completion for core journeys is above 85 percent.
