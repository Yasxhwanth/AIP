# Ontology Structural Metadata — Invariants

This document defines all invariants that must be maintained by the ontology runtime.

---

## 1. Ontology Version Invariants

| ID | Invariant | Enforcement |
|----|-----------|-------------|
| OV-1 | Version string must be unique among non-deleted records | Partial unique index on `(version) WHERE deleted_at IS NULL` |
| OV-2 | DRAFT versions are mutable | Application + trigger allows all changes |
| OV-3 | PUBLISHED versions are immutable | Trigger `prevent_published_version_modification` blocks changes |
| OV-4 | Status transitions: DRAFT → PUBLISHED → DEPRECATED only | Application-level enforcement |
| OV-5 | `published_at` is set when status changes to PUBLISHED | Trigger `set_published_at` |
| OV-6 | Soft-deleted versions can still be read | Queries must explicitly exclude `deleted_at IS NOT NULL` |

---

## 2. Entity Type Invariants

| ID | Invariant | Enforcement |
|----|-----------|-------------|
| ET-1 | Name must be unique per ontology version (non-deleted) | Partial unique index on `(ontology_version_id, name) WHERE deleted_at IS NULL` |
| ET-2 | Name must match pattern `^[a-z][a-z0-9_]*$` | CHECK constraint `entity_type_name_format` |
| ET-3 | Must reference an existing ontology version | FK to `ontology_version(id)` with `ON DELETE RESTRICT` |
| ET-4 | Cannot be deleted if referenced by attributes | FK from `attribute_definition` with `ON DELETE RESTRICT` |
| ET-5 | Cannot be deleted if referenced by relationships | FK from `relationship_type` with `ON DELETE RESTRICT` |
| ET-6 | Entity types in PUBLISHED version are immutable | Inherited from OV-3 via application logic |

---

## 3. Attribute Definition Invariants

| ID | Invariant | Enforcement |
|----|-----------|-------------|
| AD-1 | Name must be unique per entity type (non-deleted) | Partial unique index on `(entity_type_id, name) WHERE deleted_at IS NULL` |
| AD-2 | Name must match pattern `^[a-z][a-z0-9_]*$` | CHECK constraint `attribute_definition_name_format` |
| AD-3 | Must reference an existing entity type | FK to `entity_type(id)` with `ON DELETE RESTRICT` |
| AD-4 | `data_type` must be a valid enum value | PostgreSQL ENUM type enforces this |
| AD-5 | `default_value` type must match `data_type` | Application-level validation |
| AD-6 | `validation_rules` schema must match `data_type` | Application-level validation |
| AD-7 | REFERENCE type must have `target_entity_type_id` in `validation_rules` | Application-level validation |
| AD-8 | ARRAY type must have `element_type` in `validation_rules` | Application-level validation |
| AD-9 | Attributes in PUBLISHED version are immutable | Inherited from OV-3 via application logic |

---

## 4. Relationship Type Invariants

| ID | Invariant | Enforcement |
|----|-----------|-------------|
| RT-1 | Name must be unique per ontology version (non-deleted) | Partial unique index on `(ontology_version_id, name) WHERE deleted_at IS NULL` |
| RT-2 | Name must match pattern `^[a-z][a-z0-9_]*$` | CHECK constraint `relationship_type_name_format` |
| RT-3 | `inverse_name` must match pattern or be NULL | CHECK constraint `relationship_type_inverse_name_format` |
| RT-4 | Must reference an existing ontology version | FK to `ontology_version(id)` with `ON DELETE RESTRICT` |
| RT-5 | Source entity type must exist | FK to `entity_type(id)` with `ON DELETE RESTRICT` |
| RT-6 | Target entity type must exist | FK to `entity_type(id)` with `ON DELETE RESTRICT` |
| RT-7 | Source and target must belong to same ontology version | Application-level validation |
| RT-8 | Self-referential relationships are allowed | No constraint prevents `source = target` |
| RT-9 | `cardinality` must be a valid enum value | PostgreSQL ENUM type enforces this |
| RT-10 | Relationships in PUBLISHED version are immutable | Inherited from OV-3 via application logic |

---

## 5. Cross-Cutting Invariants

| ID | Invariant | Enforcement |
|----|-----------|-------------|
| CC-1 | All timestamps are in UTC | PostgreSQL `TIMESTAMPTZ` + application convention |
| CC-2 | `updated_at` is auto-updated on every change | Triggers on all tables |
| CC-3 | Soft-deleted records are excluded from uniqueness | Partial unique indexes with `WHERE deleted_at IS NULL` |
| CC-4 | `created_at` is immutable after insert | No trigger, application must not modify |
| CC-5 | All IDs are UUIDs | PostgreSQL UUID type + defaults |

---

## 6. Soft Delete Semantics

### Query Behavior

```sql
-- Default query (excludes deleted):
SELECT * FROM entity_type WHERE deleted_at IS NULL;

-- Include deleted (archive/history queries):
SELECT * FROM entity_type;

-- Only deleted:
SELECT * FROM entity_type WHERE deleted_at IS NOT NULL;
```

### Cascade Behavior

Soft delete does **not** cascade. When an entity type is soft-deleted:
- Its attributes remain but become "orphaned"
- Relationships referencing it remain but become invalid

**Application must handle:** When soft-deleting an entity type, also soft-delete:
- All attribute definitions for that entity type
- All relationship types where it is source or target

### Undelete

Setting `deleted_at = NULL` restores the record. However:
- Uniqueness constraints apply — restore will fail if name conflicts
- Referenced records must also be restored first

---

## 7. Immutability Rules for Published Versions

Once an ontology version status is `PUBLISHED`:

| Operation | Allowed? |
|-----------|----------|
| Modify version metadata | ❌ No |
| Add new entity types | ❌ No |
| Modify existing entity types | ❌ No |
| Add new attributes | ❌ No |
| Modify existing attributes | ❌ No |
| Add new relationship types | ❌ No |
| Modify existing relationship types | ❌ No |
| Soft-delete version | ✅ Yes |
| Change status to DEPRECATED | ✅ Yes |
| Read all data | ✅ Yes |

**Recommended workflow:**
1. Clone PUBLISHED version to new DRAFT
2. Make modifications in DRAFT
3. Publish new version
4. Deprecate old version (optional)

---

## 8. Entity Constraint Invariants (Phase 1B)

| ID | Invariant | Enforcement |
|----|-----------|-------------|
| EC-1 | Name must be unique per entity type (non-deleted) | Partial unique index on `(entity_type_id, name) WHERE deleted_at IS NULL` |
| EC-2 | Name must match pattern `^[a-z][a-z0-9_]*$` | CHECK constraint `entity_constraint_name_format` |
| EC-3 | Must reference an existing entity type | FK to `entity_type(id)` with `ON DELETE RESTRICT` |
| EC-4 | `constraint_type` must be a valid enum value | PostgreSQL ENUM type enforces this |
| EC-5 | `configuration` schema must match `constraint_type` | Application-level validation |
| EC-6 | UNIQUE_TOGETHER requires non-empty `attribute_names` array | Application-level validation |
| EC-7 | CONDITIONAL_REQUIRED requires `if_attribute` and `then_required` | Application-level validation |
| EC-8 | MUTUAL_EXCLUSION requires at least 2 `attribute_names` | Application-level validation |
| EC-9 | Constraints in PUBLISHED version are immutable | Inherited from OV-3 via application logic |

---

## 9. Relationship Cardinality Limits (Phase 1B)

| ID | Invariant | Enforcement |
|----|-----------|-------------|
| RC-1 | `source_min_count` must be >= 0 | DEFAULT 0, NOT NULL |
| RC-2 | `source_max_count` NULL means unlimited | Application interprets NULL as no limit |
| RC-3 | `target_min_count` must be >= 0 | DEFAULT 0, NOT NULL |
| RC-4 | `target_max_count` NULL means unlimited | Application interprets NULL as no limit |
| RC-5 | `source_min_count <= source_max_count` (when max is not NULL) | Application-level validation |
| RC-6 | `target_min_count <= target_max_count` (when max is not NULL) | Application-level validation |

---

## 10. Validation Engine Invariants (Phase 1B)

| ID | Invariant | Enforcement |
|----|-----------|-------------|
| VE-1 | Required attributes must have non-null values | ValidationEngine checks `is_required` |
| VE-2 | Attribute values must match declared `data_type` | Per-type validators in registry |
| VE-3 | Attribute values must pass `validation_rules` checks | Per-type validators apply rules |
| VE-4 | Entity constraints are evaluated after attribute validation | ValidationEngine order of operations |
| VE-5 | UNIQUE_TOGETHER uniqueness is checked at API/DB layer | Engine validates structure only |
| VE-6 | All validation errors are collected, not fail-fast | `mergeResults()` aggregates errors |

---

## 11. Entity Invariants (Phase 2A)

| ID | Invariant | Enforcement |
|----|-----------|-------------|
| EN-1 | Must reference an existing, non-deleted entity type | FK to `entity_type(id)` with `ON DELETE RESTRICT` |
| EN-2 | `external_id` should be unique per entity type (non-deleted) | Partial index `(entity_type_id, external_id) WHERE deleted_at IS NULL` |
| EN-3 | `current_version_id` must reference own version | FK to `entity_version(id)` |
| EN-4 | Soft-deleted entities excluded from default queries | Index with `WHERE deleted_at IS NULL` |

---

## 12. Entity Version Invariants (Phase 2A)

| ID | Invariant | Enforcement |
|----|-----------|-------------|
| EV-1 | `version_number` must be positive | CHECK constraint `version_number > 0` |
| EV-2 | `version_number` must be sequential per entity | Application-level enforcement |
| EV-3 | Only current version has `valid_to IS NULL` | Application sets `valid_to` on supersede |
| EV-4 | Versions are immutable after creation | No UPDATE trigger, application must not modify |

---

## 13. Attribute Value Invariants (Phase 2A)

| ID | Invariant | Enforcement |
|----|-----------|-------------|
| AV-1 | One attribute value per entity version per attribute | Unique index on `(entity_version_id, attribute_definition_id)` |
| AV-2 | Only one `value_*` column populated per data type | Application-level validation |
| AV-3 | `is_null = true` means explicit NULL | Application uses this to distinguish from "not set" |
| AV-4 | Cascades delete with parent version | FK with `ON DELETE CASCADE` |

---

## 14. Relationship Invariants (Phase 2A)

| ID | Invariant | Enforcement |
|----|-----------|-------------|
| RL-1 | Source and target must match relationship type's entity types | Application-level validation |
| RL-2 | Source and target must be non-deleted entities | Application-level validation |
| RL-3 | `current_version_id` must reference own version | FK to `relationship_version(id)` |
| RL-4 | Soft-deleted relationships excluded from traversal | Index with `WHERE deleted_at IS NULL` |

---

## 15. Audit Log Invariants (Phase 2B)

| ID | Invariant | Enforcement |
|----|-----------|-------------|
| AL-1 | Audit log records are immutable | No UPDATE/DELETE allowed (application convention + append-only table) |
| AL-2 | Must reference a valid operation type | `audit_operation` ENUM |
| AL-3 | `performed_at` must be set by the system | DEFAULT NOW() |
| AL-4 | `changes` must capture old and new values for updates | Application-level enforcement |

---

## 16. Deletion Record Invariants (Phase 2B)

| ID | Invariant | Enforcement |
|----|-----------|-------------|
| DR-1 | Deletion records are immutable once created | No UPDATE/DELETE allowed (except for restoration fields) |
| DR-2 | `snapshot` must contain full record state at deletion | Application-level enforcement |
| DR-3 | `restorable` flag indicates if record can be undeleted | DEFAULT TRUE |
| DR-4 | `restored_at` is set only when record is restored | Application-level enforcement |
---

## 17. Governance Invariants (Phase 4)

| ID | Invariant | Enforcement |
|----|-----------|-------------|
| GV-1 | Governance metadata is passive only | Ontology layer must never interpret or evaluate governance fields |
| GV-2 | No governance on `ontology_version` | Schema snapshot must remain structurally pure and non-political |
| GV-3 | Governance hooks exist on metadata and runtime objects | `owner_id`, `visibility`, `policy_bindings` columns |
| GV-4 | `visibility` defaults to `INTERNAL` | DEFAULT 'INTERNAL' in schema |
| GV-5 | `policy_bindings` defaults to empty | DEFAULT '{}' in schema |
| GV-6 | Audit log captures governance context | `governance_context` field for future engine decisions |

---

## 18. Time-Consistent Query Invariants (Phase 5)

| ID | Invariant | Enforcement |
|----|-----------|-------------|
| TC-0 | Metadata schema must come from `ontology_version` PUBLISHED at `asOf` time | Query layer resolves latest PUBLISHED version <= `asOf` |
| TC-1 | All objects in a single query result must be consistent with the same `asOf` timestamp | Query layer injects `asOf` into all version resolutions |
| TC-2 | Relationship traversal must only connect entities that both existed at the `asOf` time | Version resolution logic filters by `valid_from` and `valid_to` |
| TC-3 | `relationship_version` must connect `entity_versions` valid at same `asOf` | Traversal logic joins on version validity ranges |
| TC-4 | Traversal direction must respect `relationship_type` directionality | Query engine uses `is_directional` and `inverse_name` for navigation |

---

## 19. Rule & Event Engine Invariants (Phase 6)

| ID | Invariant | Enforcement |
|----|-----------|-------------|
| RE-1 | Rules must be declarative | JSON-based `ConditionExpression` with no executable code |
| RE-2 | Rule evaluation must not modify ontology data | Read-only access to `EntitySnapshot` and query layer |
| RE-3 | Events are immutable and append-only | No UPDATE/DELETE allowed on `domain_event` table |
| RE-4 | Evaluation must be deterministic and replayable | Logic depends only on immutable rule versions and snapshots |
| RE-5 | Rule evaluation is idempotent per `rule_version` + `entity_version` | Unique constraint on `domain_event` or evaluation fingerprint |
| RE-6 | Rules must reference `ontology_version` they were defined against | `rule_definition` binds to `ontology_version_id` |
| RE-7 | `rule_evaluation_state` must be time-scoped for replayability | State is scoped by `rule_version_id`, `object_id`, and `asOf` time |


---

## 20. Action & Integration Engine Invariants (Phase 8)

| ID | Invariant | Enforcement |
|----|-----------|-------------|
| AE-1 | Action definitions must be versioned | `action_definition_version` table stores immutable snapshots |
| AE-2 | Action intents reference workflow step execution | `workflow_instance_id` and `workflow_step_execution_id` fields |
| AE-3 | Idempotency enforced at database level | UNIQUE constraint on `(action_definition_version_id, idempotency_key)` |
| AE-4 | Action execution is single-consumer (locking required) | `locked_by` and `locked_at` fields for distributed locking |
| AE-5 | Successful execution is terminal | Application logic + status transition rules (SUCCESS is immutable) |
| AE-6 | Execution attempts are append-only | No UPDATE/DELETE allowed on `action_execution_attempt` |
| AE-7 | Action definitions must be versioned | `action_definition_version` table stores immutable snapshots |
| AE-8 | Action intents reference workflow step execution | `workflow_instance_id` and `workflow_step_execution_id` fields |
| AE-9 | Idempotency enforced at database level | UNIQUE constraint on `(action_definition_version_id, idempotency_key)` |
| AE-10 | Action execution is single-consumer (locking required) | `locked_by` and `locked_at` fields for distributed locking |
| AE-11 | Successful execution is terminal | Application logic + status transition rules (SUCCESS is immutable) |
---

## 21. AI Reasoning Layer Invariants (Phase 9)

| ID | Invariant | Enforcement |
|----|-----------|-------------|
| AR-1 | AI reasoning is strictly read-only | Application logic + tool interface isolation |
| AR-2 | Sessions must be bound to a specific `asOf` time | `as_of` field in `ai_reasoning_session` |
| AR-3 | Recommendations must include a structured explanation trace | `explanation_trace` field in `ai_recommendation` |
| AR-4 | AI cannot execute actions directly; it only suggests `RecommendedAction` | `action_proposal` is semantic JSON, not `ActionIntent` |
| AR-5 | Reasoning sessions and recommendations are immutable once finalized | Application logic + `reasoning_session_status` |
| AR-6 | Tool access must be logged for auditability | `ai_tool_access_log` table |
| AR-7 | AI explanations must not include chain-of-thought | `explanation_trace` schema (Evidence -> Reason -> Recommendation) |
| AR-8 | AI cannot construct executable ActionIntent | Separation of AI proposal from System intent creation |
| AR-9 | Simulation must use rule + workflow dry-run | Simulation logic invokes Phase 6/7 in dry-run mode |
| AR-10 | AI reasoning sessions are immutable snapshots | `ai_reasoning_session` table is append-only for history |

---

## 22. Predictive Overlay Invariants (Phase 13)

| ID | Invariant | Enforcement |
|----|-----------|-------------|
| PR-1 | Projections are not persisted | Output exists only in memory/rendering |
| PR-2 | ProjectionEngine is pure | No side effects, no API calls |
| PR-3 | No ontology mutation | Read-only access to snapshots |
| PR-4 | Deterministic output | Same inputs = same outputs |
| PR-5 | Projection layer is optional | Can be disabled without affecting core logic |

---

## 23. Scenario Branching Invariants (Phase 14)

| ID | Invariant | Enforcement |
|----|-----------|-------------|
| SC-1 | Mutations are append-only | `ScenarioMutation` log is immutable |
| SC-2 | Sequence is monotonic | `sequence` counter ensures deterministic replay |
| SC-3 | No ontology mutation | Scenarios exist purely in overlay layer |
| SC-4 | No audit logs | Scenario actions do not trigger audit entries |
| SC-5 | UI creates mutations, never edits | Explicit "Simulate" semantics in UI |
| SC-6 | Scenario removal restores truth | Clearing scenario ID reverts to pure ontology |
| SC-7 | Scenario requires version match | `baseOntologyVersion` must match system version |

---

## 24. Signals & Attention Layer Invariants (Phase 27)

| ID | Invariant | Enforcement |
|----|-----------|-------------|
| SIG-1 | Signals derive only from historical truth and audit stores | SignalsEngine reads from OntologyStore, DecisionJournalManager, ExecutionManager, and TruthAdmissionEngine via MetricsEngine |
| SIG-2 | Signals never trigger actions, workflows, or decisions | UI exposes read-only visualizations with no intent or execution APIs |
| SIG-3 | Signals are replay-deterministic | SignalsEngine depends only on `(tenantId, asOf, store state)` and uses pure aggregation with no randomness or caching |
| SIG-4 | Visualization does not interpret | Signals dashboard uses neutral labels and avoids severity or prescriptive language |
| SIG-5 | All signals are bound to AS-OF | QueryClient.getSignalSeries requires `tenantId` and `asOf`, and TimeContext drives all signal computations |

---

## 25. Attention & Prioritization Invariants (Phase 28)

| ID | Invariant | Enforcement |
|----|-----------|-------------|
| ATT-1 | Attention items are derived-only | AttentionEngine consumes SignalSeries and does not write to ontology, metrics, signals, or decisions |
| ATT-2 | Attention items never trigger actions | QueryClient.getAttentionSnapshot and AttentionDashboard expose read-only data with no workflow or execution hooks |
| ATT-3 | Attention contains no recommendations | Attention summaries use neutral language and avoid prescriptive phrasing |
| ATT-4 | Attention is replay-deterministic | AttentionEngine is pure and deterministic for a given `(tenantId, asOf, signals)` set |
| ATT-5 | Attention is bound to AS-OF time | QueryClient.getAttentionSnapshot requires `tenantId` and `asOf`, driven by TimeContext and replay mode |
| ATT-6 | Attention language is descriptive only | Copy guidelines for AttentionDashboard prohibit urgency terms such as "critical" or "fix now" |

---

## 26. Identity & Attribution Invariants (Phase 29)

| ID | Invariant | Enforcement |
|----|-----------|-------------|
| ID-1 | Every system action must resolve to an Actor | `IdentityContext` throws if missing |
| ID-2 | Identity is tenant-scoped | `IdentityStore` and `IdentityContext` enforce tenant isolation |
| ID-3 | Sessions are immutable (append-only) | `IdentityStore` stores sessions in memory (for now) without updates |
| ID-4 | Revoked sessions cannot be reused | `IdentityStore.resolveSession` checks `revoked_at` |
| ID-5 | No authorization logic in identity layer | Pure attribution only; `AuthorityEvaluator` handles permissions |
| ID-6 | Cross-tenant access is blocked | `QueryClient` and managers validate `tenant_id` matches context |

---

## 27. Authority Graph Invariants (Phase 30)

| ID | Invariant | Enforcement |
|----|-----------|-------------|
| AUTH-1 | No implicit authority | `AuthorityGraphEngine` returns empty permissions by default |
| AUTH-2 | Authority is time-bound | `valid_from` and `valid_to` (expires_at) are enforced |
| AUTH-3 | Authority is snapshot-based | `AuthoritySnapshot` captures permissions at a specific time |
| AUTH-4 | Execution requires explicit EXECUTE authority | `ExecutionManager` validates snapshot before intent creation |
| AUTH-5 | Approval requires explicit APPROVE authority | `TruthAdmissionEngine` validates snapshot before decision |
| AUTH-6 | Delegation must be explicit | `AuthorityEdgeType.DELEGATED` required to grant authority to others |