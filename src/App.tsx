import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import AppLayout from './AppLayout';
import ContextPanel from './components/ContextPanel';
import SpatialViewRouter from './components/SpatialViewRouter';
import EntityDetail from './components/EntityDetail';
import GuidedDemo from './components/GuidedDemo';
import { TimeProvider } from './state/time/TimeContext';
import { EntityProvider } from './state/entities/EntityStore';
import { PlaybackProvider } from './state/playback/PlaybackContext';
import { ProjectionProvider } from './context/ProjectionContext';
import { ScenarioProvider } from './context/ScenarioContext';
import { VisualizationProvider } from './context/VisualizationContext';
import { DecisionProvider } from './context/DecisionContext';
import { ReplayProvider } from './context/ReplayContext';
import { AIAdvisoryProvider } from './context/AIAdvisoryContext';
import { OntologyProvider } from './context/OntologyContext';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { Login } from './components/Login';
import { useOntologyQuery } from './adapters/query/useOntologyQuery';
import { Loader2 } from 'lucide-react';
import { MockLogin } from './identity/MockLogin';
import { ontologyDefinitionStore } from './ontology/definition/OntologyDefinitionStore';
import { ontologySnapshotResolver } from './ontology/definition/OntologySnapshotResolver';

function AppContent() {
  const location = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isLoading, error, entities } = useOntologyQuery();

  // Initialize mock identity context on app startup
  useEffect(() => {
    // Initialize mock identity for development
    MockLogin.login(
      'dev-tenant-1' as any,
      'dev-user-1' as any,
      'Development User'
    );
    
    // Seed initial ontology if none exists
    const seedInitialOntology = () => {
      try {
        const existingActiveVersion = ontologyDefinitionStore.getActiveVersion('dev-tenant-1');
        if (!existingActiveVersion) {
          // Create an initial ontology version
          const version = ontologyDefinitionStore.createOntologyVersion(
            'dev-tenant-1',
            'Initial Development Ontology',
            null,
            'dev-user-1'
          );
          
          // Create a basic 'Asset' object type
          const assetType = ontologyDefinitionStore.createObjectType(
            version.id,
            'Asset',
            'Asset',
            'dev-user-1'
          );
          
          // Create a basic 'Location' object type
          const locationType = ontologyDefinitionStore.createObjectType(
            version.id,
            'Location',
            'Location',
            'dev-user-1'
          );
          
          // Add some attributes to Asset
          ontologyDefinitionStore.createAttribute(
            version.id,
            assetType.id,
            'name',
            'Name',
            'STRING',
            'dev-user-1'
          );
          
          ontologyDefinitionStore.createAttribute(
            version.id,
            assetType.id,
            'status',
            'Status',
            'STRING',
            'dev-user-1'
          );
          
          // Add some attributes to Location
          ontologyDefinitionStore.createAttribute(
            version.id,
            locationType.id,
            'name',
            'Name',
            'STRING',
            'dev-user-1'
          );
          
          ontologyDefinitionStore.createAttribute(
            version.id,
            locationType.id,
            'address',
            'Address',
            'STRING',
            'dev-user-1'
          );
          
          // Create a relationship type between Asset and Location
          ontologyDefinitionStore.createRelationshipType(
            version.id,
            'located_at',
            'Located At',
            assetType.id,
            locationType.id,
            'OUTBOUND',
            'ONE_TO_MANY',
            'dev-user-1'
          );
          
          // Activate the version
          ontologyDefinitionStore.activateVersion(version.id, 'dev-tenant-1');
          
          console.log('Seeded initial ontology for development tenant');
        }
      } catch (error) {
        console.error('Error seeding initial ontology:', error);
      }
    };
    
    seedInitialOntology();
    
    // Clear resolver cache to ensure fresh data
    ontologySnapshotResolver.clearCache();
  }, []);

  // Check if we're on the demo route
  if (location.pathname.startsWith('/demo')) {
    return <GuidedDemo />;
  }

  // Show login if not authenticated
  if (!authLoading && !isAuthenticated) {
    return <Login />;
  }

  if (authLoading) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--background)',
        color: 'var(--text-secondary)'
      }}>
        <Loader2 size={48} className="animate-spin" style={{ color: 'var(--accent)', marginBottom: '16px' }} />
        <div style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '0.1em' }}>AUTHENTICATING...</div>
      </div>
    );
  }

  if (isLoading && entities.length === 0) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--background)',
        color: 'var(--text-secondary)'
      }}>
        <Loader2 size={48} className="animate-spin" style={{ color: 'var(--accent)', marginBottom: '16px' }} />
        <div style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '0.1em' }}>INITIALIZING ONTOLOGY TRUTH...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--background)',
        color: '#FF4D4D'
      }}>
        <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>CRITICAL SYSTEM ERROR</div>
        <div style={{ fontSize: '12px', opacity: 0.8 }}>{error}</div>
      </div>
    );
  }

  return (
    <AppLayout>
      <SpatialViewRouter />
    </AppLayout>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <TimeProvider>
          <EntityProvider>
            <PlaybackProvider>
              <ScenarioProvider>
                <ProjectionProvider>
                  <VisualizationProvider>
                    <DecisionProvider>
                      <ReplayProvider>
                        <AIAdvisoryProvider>
                          <OntologyProvider>
                            <div className="app-root">
                              <AppContent />
                            </div>
                          </OntologyProvider>
                        </AIAdvisoryProvider>
                      </ReplayProvider>
                    </DecisionProvider>
                  </VisualizationProvider>
                </ProjectionProvider>
              </ScenarioProvider>
            </PlaybackProvider>
          </EntityProvider>
        </TimeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
