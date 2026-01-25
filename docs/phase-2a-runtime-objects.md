# Phase 2A — Ontology Runtime Doc

## Summary

Implements runtime ontology objects instantiated from metadata:

- **Entity** — Runtime instance of EntityType
- **EntityVersion** — Immutable snapshot for version history
- **AttributeValue** — Typed attribute storage
- **Relationship** — Runtime instance of RelationshipType
- **RelationshipVersion** — Immutable snapshot with properties

---

## Files Created/Modified

| File | Changes |
|------|---------|
| [schema.sql](file:///c:/Users/YASHWANTH/Projects/AIP/src/ontology/schema.sql) | +300 lines: entity, entity_version, attribute_value, relationship, relationship_version tables |
| [types.ts](file:///c:/Users/YASHWANTH/Projects/AIP/src/ontology/types.ts) | +210 lines: branded IDs, interfaces, factory functions |

---

## Key Features

### Version History
```sql
-- Get entity as of a specific time
SELECT * FROM entity_version ev
WHERE ev.entity_id = $id
  AND ev.valid_from <= $as_of_time
  AND (ev.valid_to IS NULL OR ev.valid_to > $as_of_time);
```

### Typed Attribute Storage
| Column | PostgreSQL Type | Use For |
|--------|----------------|---------|
| `value_string` | TEXT | STRING |
| `value_integer` | BIGINT | INTEGER |
| `value_float` | DOUBLE PRECISION | FLOAT |
| `value_boolean` | BOOLEAN | BOOLEAN |
| `value_date` | DATE | DATE |
| `value_datetime` | TIMESTAMPTZ | DATETIME |
| `value_json` | JSONB | JSON, ARRAY, REFERENCE |

### Provenance
- `source_system` — Origin system for data lineage
- `change_reason` — Why version was created
- `created_by` — User who made the change

---

## Verification

```
npm run check
> tsc --noEmit
(no errors)
```

✅ All TypeScript compiles with strict settings.
