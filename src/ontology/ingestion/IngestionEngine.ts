/**
 * =============================================================================
 * INGESTION ENGINE
 * Phase 22 - Data Ingestion & Streaming
 * =============================================================================
 * 
 * The core engine responsible for accepting external data, normalizing it,
 * validating it, and producing Candidate Truth objects.
 * 
 * Enforces strict isolation: External data never becomes truth automatically.
 */

import {
    IngestionSource,
    IngestionSourceVersion,
    IngestionEvent,
    CandidateTruth,
    IngestionEventStatus,
    CandidateType,
    IngestionEventId,
    CandidateTruthId
} from './ingestion-types.js';

import { normalizePayload } from './normalization.js';
import { validationEngine } from '../validation/validation-engine.js';
import { EntityType, AttributeDefinition, EntityConstraint } from '../types.js';
import {
    ObjectTypeDefinitionId,
    OntologyVersionId
} from '../definition/ontology-definition-types';
import { ontologySnapshotResolver } from '../definition/OntologySnapshotResolver';
import { ontologyCompiler } from '../definition/OntologyCompiler';

export class IngestionEngine {
    // In-memory store for demo purposes (would be DB in production)
    private eventStore: Map<string, IngestionEvent> = new Map();
    private candidateStore: Map<string, CandidateTruth> = new Map();

    /**
     * Main entry point for external data (Legacy API).
     */
    public async ingest(
        payload: Record<string, unknown>,
        source: IngestionSource,
        version: IngestionSourceVersion,
        entityType: EntityType,
        attributes: AttributeDefinition[],
        constraints: EntityConstraint[]
    ): Promise<IngestionEvent> {
        // 1. Generate Checksum & Idempotency Key
        const checksum = this.generateChecksum(payload);

        // 2. Create Ingestion Event (Immutable Raw Record)
        const event: IngestionEvent = {
            id: crypto.randomUUID() as IngestionEventId,
            tenant_id: source.tenant_id,
            source_version_id: version.id,
            received_at: new Date(),
            raw_payload: payload,
            checksum: checksum,
            status: IngestionEventStatus.RECEIVED
        };

        // 3. Persist Raw Event
        this.persistEvent(event);

        // 4. Normalize Payload
        let normalizedData: Record<string, unknown>;
        try {
            normalizedData = normalizePayload(payload, version.mapping_rules);
        } catch (error) {
            return this.rejectEvent(event, ['Normalization Failed', String(error)]);
        }

        // 5. Validate against Ontology
        const validationResult = validationEngine.validateEntity(
            normalizedData,
            entityType,
            attributes,
            constraints
        );

        if (!validationResult.valid) {
            return this.rejectEvent(event, validationResult.errors);
        }

        // 6. Create Candidate Truth
        const candidate: CandidateTruth = {
            id: crypto.randomUUID() as CandidateTruthId,
            tenant_id: source.tenant_id,
            candidate_type: CandidateType.ENTITY,
            proposed_data: normalizedData,
            derived_from_event_id: event.id,
            created_at: new Date()
        };

        // 7. Persist Candidate & Update Event
        this.persistCandidate(candidate);

        const processedEvent: IngestionEvent = {
            ...event,
            status: IngestionEventStatus.PROCESSED,
            candidate_ids: [candidate.id]
        };
        this.persistEvent(processedEvent);

        return processedEvent;
    }

    /**
     * Ingest data using the new ontology system.
     */
    public async ingestWithOntology(
        payload: Record<string, unknown>,
        source: IngestionSource,
        version: IngestionSourceVersion,
        objectTypeId: ObjectTypeDefinitionId,
        ontologyVersionId: OntologyVersionId
    ): Promise<IngestionEvent> {
        // 1. Resolve & Compile Ontology
        const snapshot = ontologySnapshotResolver.resolveSnapshot(
            ontologyVersionId,
            new Date(),
            source.tenant_id
        );
        const compiled = ontologyCompiler.compile(snapshot);

        // 2. Generate Checksum
        const checksum = this.generateChecksum(payload);

        // 3. Create Event
        const event: IngestionEvent = {
            id: crypto.randomUUID() as IngestionEventId,
            tenant_id: source.tenant_id,
            source_version_id: version.id,
            received_at: new Date(),
            raw_payload: payload,
            checksum: checksum,
            status: IngestionEventStatus.RECEIVED
        };
        this.persistEvent(event);

        // 4. Normalize
        let normalizedData: Record<string, unknown>;
        try {
            normalizedData = normalizePayload(payload, version.mapping_rules);
        } catch (error) {
            return this.rejectEvent(event, ['Normalization Failed', String(error)]);
        }

        // 5. Validate against Ontology
        const validationResult = validationEngine.validateAgainstOntology(
            normalizedData,
            objectTypeId,
            compiled
        );

        if (!validationResult.valid) {
            return this.rejectEvent(event, validationResult.errors);
        }

        // 6. Create Candidate
        const candidate: CandidateTruth = {
            id: crypto.randomUUID() as CandidateTruthId,
            tenant_id: source.tenant_id,
            candidate_type: CandidateType.ENTITY,
            proposed_data: normalizedData,
            derived_from_event_id: event.id,
            created_at: new Date()
        };
        this.persistCandidate(candidate);

        const processedEvent: IngestionEvent = {
            ...event,
            status: IngestionEventStatus.PROCESSED,
            candidate_ids: [candidate.id]
        };
        this.persistEvent(processedEvent);

        return processedEvent;
    }

    /**
     * Replays a historical event with a (potentially new) configuration.
     */
    public async replayEvent(
        eventId: string,
        newVersion: IngestionSourceVersion,
        entityType: EntityType,
        attributes: AttributeDefinition[],
        constraints: EntityConstraint[]
    ): Promise<IngestionEvent> {
        const originalEvent = this.eventStore.get(eventId);
        if (!originalEvent) {
            throw new Error(`Event ${eventId} not found`);
        }

        const mockSource: IngestionSource = {
            id: 'replay-source' as any,
            tenant_id: originalEvent.tenant_id,
            name: 'Replay',
            source_type: 'MANUAL' as any,
            status: 'ACTIVE' as any,
            created_at: new Date(),
            created_by: null,
            description: 'Replay'
        };

        return this.ingest(
            originalEvent.raw_payload,
            mockSource,
            newVersion,
            entityType,
            attributes,
            constraints
        );
    }

    private generateChecksum(payload: Record<string, unknown>): string {
        const str = JSON.stringify(payload);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString(16);
    }

    private persistEvent(event: IngestionEvent): void {
        this.eventStore.set(event.id, event);
    }

    private persistCandidate(candidate: CandidateTruth): void {
        this.candidateStore.set(candidate.id, candidate);
    }

    private rejectEvent(event: IngestionEvent, errors: unknown[]): IngestionEvent {
        const rejectedEvent: IngestionEvent = {
            ...event,
            status: IngestionEventStatus.REJECTED,
            validation_errors: errors
        };
        this.persistEvent(rejectedEvent);
        return rejectedEvent;
    }

    public getEvent(id: string): IngestionEvent | undefined {
        return this.eventStore.get(id);
    }

    public getCandidate(id: string): CandidateTruth | undefined {
        return this.candidateStore.get(id);
    }
}
