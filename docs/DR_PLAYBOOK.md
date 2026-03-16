# AIP Platform Disaster Recovery (DR) Playbook

## 1. Overview
This playbook provides procedures for recovering the AIP platform and reconciling the Ontology in the event of partial or total data loss.

## 2. Infrastructure Backup
### 2.1 PostgreSQL
- **Daily Backups**: Managed via AWS RDS Snapshots or `pg_dump`.
- **Retention**: 30 days.
- **Restoration**: Restore snapshot to a new instance and update `DATABASE_URL`.

### 2.2 Event Store (DomainEvents)
The `DomainEvent` table is our source of truth. Even if `CurrentEntityState` is corrupted, the system can be reconstructed.

## 3. Ontology Reconstruction
If the projections (`CurrentEntityState`) are inconsistent with the event log:
1. Identify the affected `projectId`.
2. Trigger the Rebuild API:
   ```bash
   curl -X POST https://api.aip.enterprise.com/api/v1/ontology/rebuild \
     -H "X-Project-Id: <PROJECT_ID>" \
     -H "Authorization: Bearer <ADMIN_TOKEN>"
   ```
3. The `OntologyRebuilder` service will:
   - Clear the `CurrentEntityState` for the project.
   - Replay all `DomainEvents` in chronological order.
   - Re-populate the projection.

## 4. Recovering External Sync (Outbox)
In case of connectivity failure to SAP, CRM, or Webhooks:
1. Monitor the Dead Letter Queue:
   ```bash
   curl https://api.aip.enterprise.com/api/v1/jobs/dead-letter?jobType=INTEGRATION_SYNC
   ```
2. Replay specific jobs:
   ```bash
   curl -X POST https://api.aip.enterprise.com/api/v1/jobs/replay/<JOB_ID>
   ```

## 5. Verification Checklist
- [ ] Check SRE Dashboard for API latency and error rates.
- [ ] Verify `Ontology` object counts match pre-incident levels.
- [ ] Ensure `Outbox` throughput is positive.
- [ ] Confirm `Agent Studio` playground responses are consistent.
