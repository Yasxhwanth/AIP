# Ontology Definition Engine - Implementation Plan

## Overview

The Ontology Definition Engine is the **MOST IMPORTANT** component. It provides the foundation for making the system truly dynamic and metadata-driven.

## Status: ✅ Foundation Complete

### Completed Components

1. **Ontology Definition Types** (`ontology-definition-types.ts`)
   - `ObjectTypeDefinition` - Defines entity types
   - `AttributeDefinition` - Defines attributes with full type system
   - `RelationshipTypeDefinition` - Defines relationship types
   - `OntologyVersion` - Version management
   - `OntologySnapshot` - Resolved snapshot at (version + time)
   - `CompiledOntologySnapshot` - Runtime-optimized artifacts

2. **Ontology Definition Store** (`OntologyDefinitionStore.ts`)
   - CRUD operations for all definition types
   - Version management
   - Tenant isolation
   - Indexes for fast lookup

3. **Ontology Snapshot Resolver** (`OntologySnapshotResolver.ts`)
   - Resolves snapshots for (version + asOf time)
   - Critical for replay determinism
   - Caching for performance

4. **Ontology Compiler** (`OntologyCompiler.ts`)
   - Compiles metadata → runtime validators
   - Compiles metadata → UI schemas
   - Compiles metadata → AI context schemas
   - Deterministic output
   - Cached per version

## Next Steps (Priority Order)

### 1. Integrate with Existing Validation Engine
- Replace hardcoded validation with compiled validators
- Update `ValidationEngine` to use `CompiledOntologySnapshot`

### 2. Integrate with Ingestion Engine
- Update `IngestionEngine` to lookup ontology from `OntologyDefinitionStore`
- Use compiled validators instead of hardcoded logic

### 3. Build Ontology-Driven UI Components
- Create `DynamicEntityForm` component that uses `CompiledUISchema`
- Create `DynamicEntityList` component
- Create `DynamicEntityDetail` component

### 4. Relationship as First-Class Truth
- Add relationship admission cases
- Add relationship versioning
- Add relationship authority checks
- Add relationship lineage tracking

### 5. Semantic Query Language
- Build query parser
- Build query executor that uses ontology snapshots
- Support: `SELECT Asset WHERE status = "DEGRADED" AS OF T`

### 6. Ontology-Defined Metrics
- Create `MetricDefinition` type
- Update `MetricsEngine` to execute metric expressions from metadata

### 7. Event Model
- Define domain events
- Implement event bus
- Emit events for ontology changes

### 8. Backend Persistence
- Migrate stores to database
- Implement versioned schema migrations

## Key Files Created

```
src/ontology/definition/
├── ontology-definition-types.ts      # Core type definitions
├── OntologyDefinitionStore.ts        # Store for all definitions
├── OntologySnapshotResolver.ts       # Resolves (version + time) → snapshot
└── OntologyCompiler.ts               # Compiles metadata → runtime artifacts
```

## Usage Example

```typescript
import { ontologyDefinitionStore } from './ontology/definition/OntologyDefinitionStore';
import { ontologySnapshotResolver } from './ontology/definition/OntologySnapshotResolver';
import { ontologyCompiler } from './ontology/definition/OntologyCompiler';

// 1. Create ontology version
const version = ontologyDefinitionStore.createOntologyVersion(
    'tenant-1',
    'v1.0.0',
    null, // no parent
    'user-123'
);

// 2. Create object type
const assetType = ontologyDefinitionStore.createObjectType(
    version.id,
    'asset',
    'Asset',
    'user-123'
);

// 3. Create attributes
const nameAttr = ontologyDefinitionStore.createAttribute(
    version.id,
    assetType.id,
    'name',
    'Name',
    'STRING',
    'user-123'
);

// 4. Activate version
ontologyDefinitionStore.activateVersion(version.id, 'tenant-1');

// 5. Resolve snapshot
const snapshot = ontologySnapshotResolver.resolveActiveSnapshot(
    new Date(),
    'tenant-1'
);

// 6. Compile to runtime artifacts
const compiled = ontologyCompiler.compile(snapshot);

// 7. Use compiled validator
const validator = compiled.validators.get(assetType.id);
const result = validator.validate({ name: 'Test Asset' });

// 8. Use compiled UI schema
const uiSchema = compiled.ui_schemas.get(assetType.id);
// Render form using uiSchema.form_fields
```

## Integration Points

### With Ingestion Engine
```typescript
// Before: Hardcoded
validateEntity(entity, entityType, attributes, constraints)

// After: Ontology-driven
const snapshot = ontologySnapshotResolver.resolveActiveSnapshot(asOf, tenantId);
const compiled = ontologyCompiler.compile(snapshot);
const validator = compiled.validators.get(entityType.id);
const result = validator.validate(entity);
```

### With UI Components
```typescript
// Before: Hardcoded form
<input name="name" type="text" />

// After: Dynamic form
const uiSchema = compiled.ui_schemas.get(objectTypeId);
uiSchema.form_fields.forEach(field => {
    renderField(field); // Renders based on field.field_type
});
```

### With AI Context
```typescript
// Before: Raw JSON
const context = { entity: {...} };

// After: Schema-aware
const aiSchema = compiled.ai_context_schemas.get(objectTypeId);
const context = {
    entity: {...},
    schema: aiSchema.semantic_description,
    attributes: aiSchema.attribute_descriptions,
    relationships: aiSchema.relationship_descriptions
};
```

## Remaining Work

See TODO list for prioritized implementation order.

