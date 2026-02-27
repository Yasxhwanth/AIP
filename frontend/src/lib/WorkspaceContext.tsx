"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ApiClient } from "@/lib/apiClient";

export interface Project {
    id: string;
    name: string;
    description?: string;
}

interface WorkspaceContextType {
    projects: Project[];
    activeProject: Project | null;
    setActiveProject: (p: Project) => void;
    createProject: (name: string, description?: string) => Promise<void>;
    loading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [activeProject, setActiveState] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    // When activeProject changes, inject its UUID into the ApiClient globally
    const setActiveProject = (p: Project) => {
        setActiveState(p);
        ApiClient.setProjectId(p.id);
        localStorage.setItem('aip_active_project_id', p.id);
    };

    const loadProjects = async () => {
        try {
            const data = await ApiClient.get<Project[]>('/projects');
            setProjects(data);

            if (data.length > 0) {
                // Try restoring from LocalStorage first
                const savedId = localStorage.getItem('aip_active_project_id');
                const found = data.find(p => p.id === savedId);

                if (found) {
                    setActiveProject(found);
                } else {
                    setActiveProject(data[0]);
                }
            }
        } catch (err) {
            console.error("Failed to load workspace projects", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProjects();
    }, []);

    const createProject = async (name: string, description?: string) => {
        const newProj = await ApiClient.post<Project>('/projects', { name, description });
        setProjects(prev => [newProj, ...prev]);
        setActiveProject(newProj);
    };

    return (
        <WorkspaceContext.Provider value={{ projects, activeProject, setActiveProject, createProject, loading }}>
            {children}
        </WorkspaceContext.Provider>
    );
}

export function useWorkspace() {
    const context = useContext(WorkspaceContext);
    if (context === undefined) {
        throw new Error("useWorkspace must be used within a WorkspaceProvider");
    }
    return context;
}
