import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Entity Types ───────────────────────────────────────────────────────────

export interface EntityProperty {
    id: string;
    name: string;
    type: 'string' | 'number' | 'boolean' | 'enum' | 'datetime' | 'json';
    required: boolean;
    indexed: boolean;
    validation?: string;
}

export interface EntityRelationship {
    id: string;
    targetEntityId: string;
    type: '1:1' | '1:N' | 'N:N';
    direction: 'outbound' | 'inbound' | 'bidirectional';
    cascade: 'none' | 'delete' | 'nullify';
}

export interface EntityMetric {
    id: string;
    name: string;
    type: 'number';
    unit: string;
    aggregation: 'avg' | 'sum' | 'last' | 'peak';
}

export interface EntityType {
    id: string;
    name: string;
    description: string;
    icon: string;
    properties: EntityProperty[];
    relationships: EntityRelationship[];
    metrics: EntityMetric[];
    sourceDatasetId?: string;
    sourceColumnMapping?: Record<string, string>;
}

// ── Actions ────────────────────────────────────────────────────────────────

export interface ActionParameter {
    id: string;
    name: string;
    type: 'string' | 'number' | 'boolean' | 'enum' | 'entity_ref';
    required: boolean;
    usedIn: ('rules' | 'form' | 'security')[];
    defaultValue?: string;
    enumValues?: string[];
    description?: string;
    isNew?: boolean;
}

export interface ActionRule {
    id: string;
    operation: 'modify' | 'create' | 'delete' | 'link' | 'unlink';
    targetEntityTypeId: string;
    propertyId?: string;
    value?: string; // can reference a param: "@param.paramName"
}

export interface ActionSubmissionCriteria {
    id: string;
    condition: string;       // e.g. "drone.status == 'Grounded'"
    description: string;
    enabled: boolean;
}

export interface ActionLogEntry {
    id: string;
    user: string;
    timestamp: string;
    summary: string;
    parameterValues: Record<string, string>;
    succeeded: boolean;
}

export interface AppAction {
    id: string;
    name: string;
    description: string;
    icon: string;        // lucide icon name
    iconColor: string;   // hex
    targetEntityTypeId: string;
    parameters: ActionParameter[];
    rules: ActionRule[];
    submissionCriteria: ActionSubmissionCriteria[];
    logEntries: ActionLogEntry[];
    editCount: number;
    hasWarnings: boolean;
    customSubmitLabel?: string;
    customSuccessMessage?: string;
}

// ── AI Agents ──────────────────────────────────────────────────────────────

export interface AiAgent {
    id: string;
    name: string;
    model: string;
    entityScopes: { entityId: string; read: boolean; write: boolean }[];
    allowedActions: string[];
    confirmBeforeExecute: boolean;
}

// ── App Pages ──────────────────────────────────────────────────────────────

export interface AppPage {
    id: string;
    name: string;
    type: 'list' | 'detail' | 'dashboard' | 'case' | 'ai-console';
    boundEntityId?: string;
    layout?: any[];
}

// ── Pipeline ───────────────────────────────────────────────────────────────

export interface PipelineNode {
    id: string;
    type: 'dataset' | 'python' | 'sql' | 'sync';
    name: string;
    position: { x: number; y: number };
    status?: 'up-to-date' | 'out-of-date';
    hasSchedule?: boolean;
    columns?: number;
}

export interface PipelineEdge {
    id: string;
    source: string;
    target: string;
}

// ── Validation ─────────────────────────────────────────────────────────────

export type ValidationStatus = 'valid' | 'warnings' | 'errors';

export interface ValidationIssue {
    type: 'error' | 'warning';
    step: 'ontology' | 'actions' | 'ai' | 'app';
    message: string;
}

// ── Store Interface ────────────────────────────────────────────────────────

interface BuilderState {
    version: 'draft' | 'v1.0';
    entityTypes: EntityType[];
    actions: AppAction[];
    agents: AiAgent[];
    pages: AppPage[];
    pipelineNodes: PipelineNode[];
    pipelineEdges: PipelineEdge[];

    addEntityType: (entity: EntityType) => void;
    updateEntityType: (id: string, entity: Partial<EntityType>) => void;
    deleteEntityType: (id: string) => void;

    addAction: (act: AppAction) => void;
    updateAction: (id: string, act: Partial<AppAction>) => void;
    deleteAction: (id: string) => void;

    addActionParameter: (actionId: string, param: ActionParameter) => void;
    updateActionParameter: (actionId: string, paramId: string, param: Partial<ActionParameter>) => void;
    deleteActionParameter: (actionId: string, paramId: string) => void;
    reorderActionParameters: (actionId: string, params: ActionParameter[]) => void;

    addActionRule: (actionId: string, rule: ActionRule) => void;
    updateActionRule: (actionId: string, ruleId: string, rule: Partial<ActionRule>) => void;
    deleteActionRule: (actionId: string, ruleId: string) => void;

    addSubmissionCriteria: (actionId: string, criteria: ActionSubmissionCriteria) => void;
    updateSubmissionCriteria: (actionId: string, criteriaId: string, criteria: Partial<ActionSubmissionCriteria>) => void;
    deleteSubmissionCriteria: (actionId: string, criteriaId: string) => void;

    addAgent: (agent: AiAgent) => void;
    updateAgent: (id: string, agent: Partial<AiAgent>) => void;
    deleteAgent: (id: string) => void;

    addPage: (page: AppPage) => void;
    updatePage: (id: string, page: Partial<AppPage>) => void;
    deletePage: (id: string) => void;

    updatePipelineNodes: (nodes: PipelineNode[]) => void;
    updatePipelineEdges: (edges: PipelineEdge[]) => void;

    validateSystem: () => { status: ValidationStatus; issues: ValidationIssue[] };
}

// ── Seed Data ──────────────────────────────────────────────────────────────

const SEED_ENTITY_TYPES: EntityType[] = [
    {
        id: 'ent-drone', name: 'Drone', description: 'Autonomous aerial vehicle', icon: 'Plane',
        sourceDatasetId: 'src-2',
        sourceColumnMapping: { p1: 'battery_pct', p2: 'status', p3: 'lat_long' },
        properties: [
            { id: 'p1', name: 'batteryLevel', type: 'number', required: true, indexed: false },
            { id: 'p2', name: 'status', type: 'enum', required: true, indexed: true },
            { id: 'p3', name: 'coordinates', type: 'string', required: true, indexed: false },
        ],
        relationships: [
            { id: 'r1', targetEntityId: 'ent-mission', type: '1:N', direction: 'outbound', cascade: 'none' },
        ],
        metrics: [{ id: 'm1', name: 'flightTime', type: 'number', unit: 'hrs', aggregation: 'sum' }],
    },
    {
        id: 'ent-mission', name: 'Mission', description: 'Drone mission or flight task', icon: 'Target',
        properties: [
            { id: 'pm1', name: 'missionId', type: 'string', required: true, indexed: true },
            { id: 'pm2', name: 'objective', type: 'string', required: true, indexed: false },
            { id: 'pm3', name: 'startTime', type: 'datetime', required: true, indexed: false },
        ],
        relationships: [
            { id: 'r2', targetEntityId: 'ent-pilot', type: '1:1', direction: 'outbound', cascade: 'none' },
        ],
        metrics: [{ id: 'mm1', name: 'successRate', type: 'number', unit: '%', aggregation: 'avg' }],
    },
    {
        id: 'ent-pilot', name: 'Pilot', description: 'Drone operator', icon: 'User',
        properties: [
            { id: 'pp1', name: 'pilotId', type: 'string', required: true, indexed: true },
            { id: 'pp2', name: 'callsign', type: 'string', required: true, indexed: false },
            { id: 'pp3', name: 'clearanceLevel', type: 'number', required: false, indexed: false },
        ],
        relationships: [],
        metrics: [],
    },
];

const SEED_ACTIONS: AppAction[] = [
    {
        id: 'act-update-status',
        name: 'Update Drone Status',
        description: 'Changes the operational status of a drone and optionally adds a note.',
        icon: 'RefreshCw',
        iconColor: '#137CBD',
        targetEntityTypeId: 'ent-drone',
        editCount: 4,
        hasWarnings: false,
        parameters: [
            { id: 'par-drone', name: 'drone', type: 'entity_ref', required: true, usedIn: ['rules', 'security'], description: 'The drone to update' },
            { id: 'par-status', name: 'newStatus', type: 'enum', required: true, usedIn: ['rules', 'form'], enumValues: ['Active', 'Grounded', 'Maintenance', 'Retired'], description: 'Target status' },
            { id: 'par-note', name: 'statusNote', type: 'string', required: false, usedIn: ['form'], description: 'Optional note', isNew: true },
        ],
        rules: [
            { id: 'rule-1', operation: 'modify', targetEntityTypeId: 'ent-drone', propertyId: 'p2', value: '@param.newStatus' },
        ],
        submissionCriteria: [
            { id: 'sc-1', condition: "drone.status != newStatus", description: 'Status must actually change', enabled: true },
        ],
        logEntries: [
            { id: 'log-1', user: 'operator@aip.mil', timestamp: '2026-02-28T08:04:00Z', summary: 'Changed status: Active → Grounded', parameterValues: { drone: 'DRONE-042', newStatus: 'Grounded' }, succeeded: true },
            { id: 'log-2', user: 'cp.tango@aip.mil', timestamp: '2026-02-28T07:51:00Z', summary: 'Changed status: Maintenance → Active', parameterValues: { drone: 'DRONE-017', newStatus: 'Active' }, succeeded: true },
        ],
        customSubmitLabel: 'Update Status',
        customSuccessMessage: 'Drone status updated successfully.',
    },
    {
        id: 'act-assign-mission',
        name: 'Assign Mission',
        description: 'Links a drone to a new mission and records the pilot.',
        icon: 'Target',
        iconColor: '#0BB68F',
        targetEntityTypeId: 'ent-drone',
        editCount: 18,
        hasWarnings: true,
        parameters: [
            { id: 'par-am-drone', name: 'drone', type: 'entity_ref', required: true, usedIn: ['rules', 'security'], description: 'The drone to assign' },
            { id: 'par-am-mission', name: 'mission', type: 'entity_ref', required: true, usedIn: ['rules', 'form'], description: 'The mission to assign', isNew: true },
            { id: 'par-am-pilot', name: 'pilot', type: 'entity_ref', required: true, usedIn: ['rules', 'form'], description: 'Pilot for this mission' },
        ],
        rules: [
            { id: 'rule-am-1', operation: 'link', targetEntityTypeId: 'ent-drone', value: '@param.mission' },
            { id: 'rule-am-2', operation: 'modify', targetEntityTypeId: 'ent-drone', propertyId: 'p2', value: 'Active' },
        ],
        submissionCriteria: [
            { id: 'sc-am-1', condition: "drone.status == 'Grounded'", description: 'Drone must be grounded before assignment', enabled: true },
            { id: 'sc-am-2', condition: "mission.objective != null", description: 'Mission must have an objective', enabled: true },
        ],
        logEntries: [
            { id: 'log-am-1', user: 'commander@aip.mil', timestamp: '2026-02-28T09:00:00Z', summary: 'Assigned DRONE-042 → MISSION-007', parameterValues: { drone: 'DRONE-042', mission: 'MISSION-007', pilot: 'PILOT-012' }, succeeded: true },
        ],
    },
    {
        id: 'act-retire-drone',
        name: 'Retire Drone',
        description: 'Permanently retires a drone from service, delinking all missions.',
        icon: 'Trash2',
        iconColor: '#D9534F',
        targetEntityTypeId: 'ent-drone',
        editCount: 2,
        hasWarnings: false,
        parameters: [
            { id: 'par-rd-drone', name: 'drone', type: 'entity_ref', required: true, usedIn: ['rules', 'form', 'security'], description: 'The drone to retire' },
            { id: 'par-rd-reason', name: 'retirementReason', type: 'string', required: true, usedIn: ['form'], description: 'Reason for retirement' },
        ],
        rules: [
            { id: 'rule-rd-1', operation: 'modify', targetEntityTypeId: 'ent-drone', propertyId: 'p2', value: 'Retired' },
            { id: 'rule-rd-2', operation: 'unlink', targetEntityTypeId: 'ent-drone' },
        ],
        submissionCriteria: [
            { id: 'sc-rd-1', condition: "drone.status != 'Active'", description: 'Cannot retire a drone that is currently active', enabled: true },
        ],
        logEntries: [],
    },
];

const SEED_PAGES: AppPage[] = [
    {
        id: 'page_1', name: 'Fleet Monitor', type: 'dashboard',
        layout: [
            {
                id: 'w_sec1', type: 'Section', name: 'Header Container', properties: {}, children: [
                    { id: 'w_t1', type: 'Text', name: 'Page Title', properties: { content: 'Drone Fleet Operations', variant: 'h1' } },
                    { id: 'w_m1', type: 'MetricCard', name: 'Active Drones', properties: { value: '142', delta: '+12%' } },
                ]
            },
            { id: 'w_obj1', type: 'ObjectTable', name: 'Fleet Telemetry', properties: { boundVariable: 'var_ActiveFleet' } },
        ],
    },
];

const SEED_PIPELINE_NODES: PipelineNode[] = [
    { id: 'src-1', type: 'dataset', name: 'drone_telemetry_raw', position: { x: 60, y: 200 }, columns: 12 },
    { id: 'src-2', type: 'python', name: 'clean_gps_coords', position: { x: 340, y: 100 }, hasSchedule: true, status: 'out-of-date', columns: 8 },
    { id: 'src-3', type: 'sql', name: 'battery_anomalies', position: { x: 340, y: 290 }, status: 'out-of-date', columns: 6 },
    { id: 'src-4', type: 'dataset', name: 'pilot_registry', position: { x: 60, y: 390 }, columns: 15 },
    { id: 'src-5', type: 'python', name: 'mission_join', position: { x: 600, y: 200 }, columns: 22 },
];

const SEED_PIPELINE_EDGES: PipelineEdge[] = [
    { id: 'e1-2', source: 'src-1', target: 'src-2' },
    { id: 'e1-3', source: 'src-1', target: 'src-3' },
    { id: 'e2-5', source: 'src-2', target: 'src-5' },
    { id: 'e3-5', source: 'src-3', target: 'src-5' },
    { id: 'e4-5', source: 'src-4', target: 'src-5' },
    { id: 'e2-ent-drone', source: 'src-2', target: 'ent-drone' },
    { id: 'e3-ent-drone', source: 'src-3', target: 'ent-drone' },
    { id: 'e-drone-mission', source: 'ent-drone', target: 'ent-mission' },
    { id: 'e-mission-pilot', source: 'ent-mission', target: 'ent-pilot' },
];

// ── Store ──────────────────────────────────────────────────────────────────

export const useBuilderStore = create<BuilderState>()(
    persist(
        (set, get) => ({
            version: 'draft',
            entityTypes: SEED_ENTITY_TYPES,
            actions: SEED_ACTIONS,
            agents: [],
            pages: SEED_PAGES,
            pipelineNodes: SEED_PIPELINE_NODES,
            pipelineEdges: SEED_PIPELINE_EDGES,

            // Entity
            addEntityType: (ent) => set((s) => ({ entityTypes: [...s.entityTypes, ent] })),
            updateEntityType: (id, ent) => set((s) => ({ entityTypes: s.entityTypes.map(e => e.id === id ? { ...e, ...ent } : e) })),
            deleteEntityType: (id) => set((s) => ({ entityTypes: s.entityTypes.filter(e => e.id !== id) })),

            // Action CRUD
            addAction: (act) => set((s) => ({ actions: [...s.actions, act] })),
            updateAction: (id, act) => set((s) => ({ actions: s.actions.map(a => a.id === id ? { ...a, ...act, editCount: (a.editCount || 0) + 1 } : a) })),
            deleteAction: (id) => set((s) => ({ actions: s.actions.filter(a => a.id !== id) })),

            // Action Parameters
            addActionParameter: (actionId, param) => set((s) => ({
                actions: s.actions.map(a => a.id === actionId ? { ...a, parameters: [...a.parameters, param], editCount: a.editCount + 1 } : a)
            })),
            updateActionParameter: (actionId, paramId, param) => set((s) => ({
                actions: s.actions.map(a => a.id === actionId ? {
                    ...a, editCount: a.editCount + 1,
                    parameters: a.parameters.map(p => p.id === paramId ? { ...p, ...param } : p)
                } : a)
            })),
            deleteActionParameter: (actionId, paramId) => set((s) => ({
                actions: s.actions.map(a => a.id === actionId ? {
                    ...a, editCount: a.editCount + 1,
                    parameters: a.parameters.filter(p => p.id !== paramId)
                } : a)
            })),
            reorderActionParameters: (actionId, params) => set((s) => ({
                actions: s.actions.map(a => a.id === actionId ? { ...a, parameters: params } : a)
            })),

            // Action Rules
            addActionRule: (actionId, rule) => set((s) => ({
                actions: s.actions.map(a => a.id === actionId ? { ...a, rules: [...a.rules, rule], editCount: a.editCount + 1 } : a)
            })),
            updateActionRule: (actionId, ruleId, rule) => set((s) => ({
                actions: s.actions.map(a => a.id === actionId ? {
                    ...a, editCount: a.editCount + 1,
                    rules: a.rules.map(r => r.id === ruleId ? { ...r, ...rule } : r)
                } : a)
            })),
            deleteActionRule: (actionId, ruleId) => set((s) => ({
                actions: s.actions.map(a => a.id === actionId ? {
                    ...a, editCount: a.editCount + 1,
                    rules: a.rules.filter(r => r.id !== ruleId)
                } : a)
            })),

            // Submission Criteria
            addSubmissionCriteria: (actionId, criteria) => set((s) => ({
                actions: s.actions.map(a => a.id === actionId ? { ...a, submissionCriteria: [...a.submissionCriteria, criteria], editCount: a.editCount + 1 } : a)
            })),
            updateSubmissionCriteria: (actionId, criteriaId, criteria) => set((s) => ({
                actions: s.actions.map(a => a.id === actionId ? {
                    ...a, editCount: a.editCount + 1,
                    submissionCriteria: a.submissionCriteria.map(sc => sc.id === criteriaId ? { ...sc, ...criteria } : sc)
                } : a)
            })),
            deleteSubmissionCriteria: (actionId, criteriaId) => set((s) => ({
                actions: s.actions.map(a => a.id === actionId ? {
                    ...a, editCount: a.editCount + 1,
                    submissionCriteria: a.submissionCriteria.filter(sc => sc.id !== criteriaId)
                } : a)
            })),

            // Agents
            addAgent: (ag) => set((s) => ({ agents: [...s.agents, ag] })),
            updateAgent: (id, ag) => set((s) => ({ agents: s.agents.map(a => a.id === id ? { ...a, ...ag } : a) })),
            deleteAgent: (id) => set((s) => ({ agents: s.agents.filter(a => a.id !== id) })),

            // Pages
            addPage: (p) => set((s) => ({ pages: [...s.pages, p] })),
            updatePage: (id, p) => set((s) => ({ pages: s.pages.map(page => page.id === id ? { ...page, ...p } : page) })),
            deletePage: (id) => set((s) => ({ pages: s.pages.filter(p => p.id !== id) })),

            // Pipeline
            updatePipelineNodes: (nodes) => set(() => ({ pipelineNodes: nodes })),
            updatePipelineEdges: (edges) => set(() => ({ pipelineEdges: edges })),

            // Validation
            validateSystem: () => {
                const state = get();
                const issues: ValidationIssue[] = [];
                if (state.entityTypes.length === 0)
                    issues.push({ type: 'error', step: 'ontology', message: 'At least one Entity Type must exist.' });
                else if (state.entityTypes.some(e => e.properties.length === 0))
                    issues.push({ type: 'error', step: 'ontology', message: 'All Entity Types must have at least one property.' });
                if (state.actions.length > 0 && state.entityTypes.length === 0)
                    issues.push({ type: 'error', step: 'actions', message: 'Cannot have actions without entity types.' });
                if (state.agents.length > 0 && state.actions.length === 0)
                    issues.push({ type: 'warning', step: 'ai', message: 'AI agents have no actions they can trigger.' });
                const status = issues.some(i => i.type === 'error') ? 'errors' : issues.length > 0 ? 'warnings' : 'valid';
                return { status, issues };
            }
        }),
        { name: 'aip-builder-storage-v2' }  // v2 key to avoid stale state
    )
);
