import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { TenantContextManager } from './tenant/TenantContext'
import { seedOntology } from './ontology/definition/seed-ontology'

// Initialize a default tenant context for the UI runtime.
// In a real application, this would be derived from authentication/session data.
const DEFAULT_TENANT_ID = 'tenant-default';

TenantContextManager.setContext({
  tenantId: DEFAULT_TENANT_ID,
  userId: 'demo-user',
  role: 'ADMIN',
  sessionId: 'demo-session',
})

// Seed ontology for the demo
seedOntology(DEFAULT_TENANT_ID);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
