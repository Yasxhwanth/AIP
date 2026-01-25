import { SignalType, SignalWindow } from '../analysis/signal-types';

export enum AttentionType {
  SIGNAL_ACCELERATION = 'SIGNAL_ACCELERATION',
  BACKLOG_GROWTH = 'BACKLOG_GROWTH',
  FAILURE_CONCENTRATION = 'FAILURE_CONCENTRATION',
  RAPID_STATE_CHANGE = 'RAPID_STATE_CHANGE',
  PROLONGED_STAGNATION = 'PROLONGED_STAGNATION',
}

export enum AttentionSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface AttentionEvidence {
  window: SignalWindow;
  values: number[];
  delta: number;
}

export interface AttentionItem {
  id: string;
  tenantId: string;
  asOf: Date;
  type: AttentionType;
  severity: AttentionSeverity;
  sourceSignalType: SignalType;
  summary: string;
  evidence: AttentionEvidence;
  created_at: Date;
}

export interface AttentionSnapshot {
  tenantId: string;
  asOf: Date;
  computed_at: Date;
  items: AttentionItem[];
}



