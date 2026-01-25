# Phase 2B — Ontology Versioning & History

## Summary

Extends the runtime models with full audit capability, replayable state, and immutable history tracking. This phase builds on the bi-temporal versioning introduced in Phase 2A by adding an explicit audit trail and specialized deletion tracking.

---

## Architecture

### 1. Audit Log (`audit_log`)
An append-only, immutable record of every operation performed on the ontology runtime.
- **Operations**: `CREATE`, `UPDATE`, `DELETE`, `RESTORE`.
- **Changes**: Captures a JSON diff of modified fields.
- **Context**: Tracks `request_id`, `client_ip`, and `user_agent` for compliance.

### 2. Deletion Tracking (`deletion_record`)
Specialized tracking for soft-deleted objects to facilitate audit and recovery.
- **Snapshot**: Stores the full state of the record at the moment of deletion.
- **Restoration**: Tracks if and when a record was restored.

---

## Historical Reconstruction

Reconstructing the state of an entity at any point in time ($T$) follows a two-step process:

1.  **Temporal Lookup**: Query the `entity_version` table for the version where `valid_from <= T` and (`valid_to IS NULL` or `valid_to > T`).
2.  **State Assembly**: Join with `attribute_value` to retrieve all attributes associated with that specific version.

If no version is found at $T$, the system checks the `deletion_record` to determine if the entity was deleted at that time.

---

## Files Created/Modified

| File | Changes |
|------|---------|
| [schema.sql](file:///c:/Users/YASHWANTH/Projects/AIP/src/ontology/schema.sql) | Added `audit_operation` enum, `audit_log` and `deletion_record` tables. |
| [types.ts](file:///c:/Users/YASHWANTH/Projects/AIP/src/ontology/types.ts) | Added `AuditLogId`, `DeletionRecordId`, `AuditOperation` enum, `AuditLog` and `DeletionRecord` interfaces. |
| [history.ts](file:///c:/Users/YASHWANTH/Projects/AIP/src/ontology/history.ts) | **NEW**: Interfaces for history reconstruction and temporal query utilities. |

---

## Verification

```bash
npm run check
```
✅ TypeScript compilation passed.
