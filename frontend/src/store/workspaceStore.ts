import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ResourceType = 'ontology' | 'action' | 'logic' | 'workshop' | 'folder';

export interface Project {
    id: string;
    name: string;
    description: string;
    createdAt: string;
}

export interface Resource {
    id: string;
    projectId: string;
    parentId: string | null; // For hierarchical folders
    type: ResourceType;
    name: string;
    createdAt: string;
    updatedAt: string;
    // definition stores the raw JSON configuration of the specific resource
    definition: any;
}

interface WorkspaceState {
    projects: Project[];
    resources: Resource[];

    // Actions
    createProject: (name: string, description: string) => Project;
    deleteProject: (id: string) => void;

    createResource: (projectId: string, parentId: string | null, type: ResourceType, name: string) => Resource;
    updateResource: (id: string, definition: any) => void;
    deleteResource: (id: string) => void;
}

const DEMO_PROJECT_ID = 'proj-demo-fleet';

export const useWorkspaceStore = create<WorkspaceState>()(
    persist(
        (set, get) => ({
            projects: [
                {
                    id: DEMO_PROJECT_ID,
                    name: 'Drone Fleet Intelligence',
                    description: 'Global logistics and tactical drone operation workspace.',
                    createdAt: new Date().toISOString()
                }
            ],
            resources: [
                {
                    id: 'res-folder-data',
                    projectId: DEMO_PROJECT_ID,
                    parentId: null,
                    type: 'folder',
                    name: 'Data Foundation',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    definition: {}
                },
                {
                    id: 'res-ont-drone',
                    projectId: DEMO_PROJECT_ID,
                    parentId: 'res-folder-data',
                    type: 'ontology',
                    name: 'Drone Object Schema',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    definition: {
                        metrics: ['battery', 'speed', 'altitude'],
                        properties: ['status', 'model']
                    }
                },
                {
                    id: 'res-logic-copilot',
                    projectId: DEMO_PROJECT_ID,
                    parentId: null,
                    type: 'logic',
                    name: 'Fleet Dispatch Copilot',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    definition: { model: 'GPT-4-AIP' }
                },
                {
                    id: 'res-workshop-ops',
                    projectId: DEMO_PROJECT_ID,
                    parentId: null,
                    type: 'workshop',
                    name: 'Regional Operations Center',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    definition: { layout: [] }
                }
            ],

            createProject: (name, description) => {
                const newProject: Project = {
                    id: `proj-${Date.now()}`,
                    name,
                    description,
                    createdAt: new Date().toISOString()
                };
                set(state => ({ projects: [...state.projects, newProject] }));
                return newProject;
            },

            deleteProject: (id) => {
                set(state => ({
                    projects: state.projects.filter(p => p.id !== id),
                    resources: state.resources.filter(r => r.projectId !== id)
                }));
            },

            createResource: (projectId, parentId, type, name) => {
                const newResource: Resource = {
                    id: `res-${Date.now()}`,
                    projectId,
                    parentId,
                    type,
                    name,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    definition: {} // Empty baseline
                };
                set(state => ({ resources: [...state.resources, newResource] }));
                return newResource;
            },

            updateResource: (id, definition) => {
                set(state => ({
                    resources: state.resources.map(r =>
                        r.id === id ? { ...r, definition, updatedAt: new Date().toISOString() } : r
                    )
                }));
            },

            deleteResource: (id) => {
                // Also delete all children if it's a folder
                set(state => {
                    const toDelete = new Set([id]);
                    const collectChildren = (parentId: string) => {
                        state.resources.forEach(r => {
                            if (r.parentId === parentId) {
                                toDelete.add(r.id);
                                if (r.type === 'folder') collectChildren(r.id);
                            }
                        });
                    };
                    collectChildren(id);

                    return {
                        resources: state.resources.filter(r => !toDelete.has(r.id))
                    };
                });
            }
        }),
        {
            name: 'aip-workspace-storage'
        }
    )
);
