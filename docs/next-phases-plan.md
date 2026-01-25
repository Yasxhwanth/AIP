# Next Phases Implementation Plan

## Overview
This document outlines the implementation plan for integrating Gemini 2.0, enhancing visualizations, adding authentication, and building AI-governed data entry.

---

## Phase 29: Gemini 2.0 Integration & Capability Registry

### Goals
- Replace mock AI with real Gemini 2.0 API
- Make system aware of Gemini's capabilities
- Track what data AI uses for responses

### Implementation

#### 1. Gemini Client (`src/ai/GeminiClient.ts`)
```typescript
- Integrate @google/generative-ai SDK
- Handle API key via environment variables
- Implement streaming responses
- Error handling and retries
```

#### 2. Capability Registry (`src/ai/CapabilityRegistry.ts`)
```typescript
- Define Gemini capabilities:
  * Text analysis
  * Pattern recognition
  * Trend identification
  * Context understanding
  * Multi-modal (future: images, charts)
- Expose capabilities to UI
- Show what AI can/cannot do
```

#### 3. Update AIAdvisoryService
- Replace `generateMockResponse` with Gemini API calls
- Pass ontology context (entities, signals, metrics) to Gemini
- Track which data sources were used
- Maintain advisory-only constraints (no actions)

#### 4. Data Source Tracking
- Log which entities/signals/metrics were analyzed
- Visualize in UI what AI "saw"
- Add transparency panel

---

## Phase 30: AI Context Visualization

### Goals
- Show users exactly what data AI analyzed
- Visual representation of AI's "view" of the system
- Transparency into AI decision-making

### Implementation

#### 1. AI Context Panel (`src/components/AIContextVisualization.tsx`)
- Display entities analyzed
- Show signals/metrics referenced
- Timeline of data points used
- Highlight relevant relationships

#### 2. Data Source Overlay
- On map: highlight entities AI analyzed
- In signals dashboard: mark data points used
- In operations: show metrics referenced

#### 3. Context Snapshot Viewer
- Expandable view of full context sent to AI
- JSON viewer for technical users
- Simplified summary for business users

---

## Phase 31: Enhanced Map Layer

### Goals
- Better spatial visualization
- AI-annotated overlays
- Interactive entity exploration

### Implementation

#### 1. Map Enhancements
- Add clustering for dense areas
- Heat maps for signal intensity
- Time-lapse playback
- Entity relationship lines

#### 2. AI Overlays
- Highlight entities AI is analyzing
- Show AI-detected patterns
- Display attention items on map
- Risk zones visualization

#### 3. Interactive Features
- Click to see AI analysis of entity
- Hover for quick context
- Filter by AI-relevant entities

---

## Phase 32: Authentication System

### Goals
- Secure user authentication
- Session management
- Role-based access (future)

### Implementation

#### 1. Auth Service (`src/auth/AuthService.ts`)
- JWT token management
- Login/logout flows
- Token refresh
- Session persistence

#### 2. Login UI (`src/components/Login.tsx`)
- Email/password form
- OAuth providers (optional)
- Error handling
- Loading states

#### 3. Protected Routes
- Wrap app in auth guard
- Redirect to login if unauthenticated
- Store auth state in context

#### 4. Update IdentityContext
- Integrate with AuthService
- Set user context on login
- Clear on logout

---

## Phase 33: AI-Governed Data Entry

### Goals
- User-friendly data entry form
- AI validation before admission
- Suggestions and corrections
- Integration with TruthAdmissionEngine

### Implementation

#### 1. Data Entry Form (`src/components/DataEntryForm.tsx`)
- Dynamic form based on entity type
- Field validation
- Real-time AI suggestions
- Preview before submission

#### 2. AI Validation Service
- Send candidate data to Gemini
- Check for:
  * Completeness
  * Consistency
  * Anomalies
  * Suggested improvements
- Return validation results

#### 3. Admission Flow Integration
- Create CandidateTruth from form
- Show AI validation results
- User can accept/reject suggestions
- Submit to TruthAdmissionEngine
- Track AI involvement in admission

#### 4. AI Suggestions Panel
- Show what AI detected
- Explain why suggestions were made
- Allow user to override
- Log AI involvement

---

## Implementation Order (Recommended)

### Sprint 1: Foundation
1. **Phase 32: Authentication** (enables user tracking)
2. **Phase 29: Gemini Integration** (core AI capability)

### Sprint 2: Visualization
3. **Phase 30: AI Context Visualization** (transparency)
4. **Phase 31: Enhanced Map** (better UX)

### Sprint 3: Data Entry
5. **Phase 33: AI-Governed Data Entry** (complete the loop)

---

## Technical Requirements

### Dependencies to Add
```json
{
  "@google/generative-ai": "^0.x.x",
  "jsonwebtoken": "^9.x.x",
  "react-router-dom": "^6.x.x" // For protected routes
}
```

### Environment Variables
```env
VITE_GEMINI_API_KEY=your_key_here
VITE_AUTH_JWT_SECRET=your_secret_here
VITE_API_BASE_URL=http://localhost:3000/api
```

### Security Considerations
- Never expose API keys in frontend code
- Use backend proxy for Gemini calls (recommended)
- Store tokens securely (httpOnly cookies)
- Validate all user inputs
- Rate limit AI requests

---

## Success Metrics

- ✅ Gemini successfully analyzes ontology data
- ✅ Users can see what data AI used
- ✅ Map shows AI-relevant entities
- ✅ Users can authenticate securely
- ✅ Data entry uses AI validation
- ✅ All AI interactions are logged/auditable

---

## Next Steps

1. **Start with Phase 32 (Auth)** - Foundation for everything else
2. **Then Phase 29 (Gemini)** - Core AI capability
3. **Then visualization phases**
4. **Finally Phase 33 (Data Entry)** - Complete the workflow

Would you like me to start implementing Phase 32 (Authentication) first?

