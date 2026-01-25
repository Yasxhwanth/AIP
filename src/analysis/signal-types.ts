export enum SignalType {
  ENTITY_COUNT_CHANGE = 'ENTITY_COUNT_CHANGE',
  DECISION_RATE_CHANGE = 'DECISION_RATE_CHANGE',
  EXECUTION_FAILURE_SPIKE = 'EXECUTION_FAILURE_SPIKE',
  ADMISSION_BACKLOG_CHANGE = 'ADMISSION_BACKLOG_CHANGE',
}

export type SignalWindow = '1h' | '6h' | '24h';

export interface SignalPoint {
  time: Date;
  value: number;
}

export interface SignalSeries {
  tenantId: string;
  signalType: SignalType;
  window: SignalWindow;
  points: SignalPoint[];
  computed_at: Date;
}

export type SignalDirection = 'UP' | 'DOWN' | 'FLAT';

export interface SignalSummary {
  signalType: SignalType;
  direction: SignalDirection;
  delta: number;
  currentValue: number;
}



