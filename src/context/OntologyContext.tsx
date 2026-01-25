import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ontologySnapshotResolver } from '../ontology/definition/OntologySnapshotResolver';
import { ontologyCompiler } from '../ontology/definition/OntologyCompiler';
import { TenantContextManager } from '../tenant/TenantContext';
import { CompiledOntologySnapshot } from '../ontology/definition/ontology-definition-types';

interface OntologyContextType {
  compiledOntology: CompiledOntologySnapshot | null;
  isLoading: boolean;
  error: string | null;
  refreshOntology: () => void;
}

const OntologyContext = createContext<OntologyContextType | undefined>(undefined);

interface OntologyProviderProps {
  children: ReactNode;
}

export const OntologyProvider: React.FC<OntologyProviderProps> = ({ children }) => {
  const [compiledOntology, setCompiledOntology] = useState<CompiledOntologySnapshot | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadOntology = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const tenantId = TenantContextManager.getContext().tenantId;
      const now = new Date();
      
      // Resolve active ontology version
      const activeSnapshot = ontologySnapshotResolver.resolveActiveSnapshot(now, tenantId);
      
      if (!activeSnapshot) {
        throw new Error('No active ontology snapshot found for tenant');
      }
      
      // Compile ontology
      const compiled = ontologyCompiler.compile(activeSnapshot);
      
      setCompiledOntology(compiled);
    } catch (err: any) {
      console.error('Error loading ontology:', err);
      setError(err.message || 'Failed to load ontology');
      setCompiledOntology(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOntology();
  }, []);

  const refreshOntology = () => {
    loadOntology();
  };

  const value = {
    compiledOntology,
    isLoading,
    error,
    refreshOntology
  };

  return (
    <OntologyContext.Provider value={value}>
      {children}
    </OntologyContext.Provider>
  );
};

export const useOntology = (): OntologyContextType => {
  const context = useContext(OntologyContext);
  if (context === undefined) {
    throw new Error('useOntology must be used within an OntologyProvider');
  }
  return context;
};