/**
 * =============================================================================
 * TRUTH MATERIALIZATION TYPES
 * Phase 24 - Truth Materialization Engine
 * =============================================================================
 */

import { Brand } from '../types';
import { AdmissionCaseId, RelationshipAdmissionCaseId } from '../admission/truth-admission-types';

export type MaterializationJobId = Brand<string, 'MaterializationJobId'>;

export enum MaterializationStatus {
    PENDING = 'PENDING',
    APPLIED = 'APPLIED',
    FAILED = 'FAILED'
}

export interface MaterializationJob {
    readonly id: MaterializationJobId;
    readonly admission_case_id: AdmissionCaseId | RelationshipAdmissionCaseId;
    readonly decision_journal_id: string;
    status: MaterializationStatus;
    readonly created_at: Date;
    applied_at?: Date;
    error_message?: string;
}

export interface MaterializationResult {
    readonly job_id: MaterializationJobId;
    readonly entity_versions_created: string[];
    readonly relationship_versions_created: string[];
    readonly attribute_values_created: string[];
}
