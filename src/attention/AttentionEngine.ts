import { SignalSeries, SignalType } from '../analysis/signal-types';
import {
  AttentionItem,
  AttentionSeverity,
  AttentionSnapshot,
  AttentionType,
} from './attention-types';

interface ComputeAttentionArgs {
  tenantId: string;
  asOf: Date;
  signals: SignalSeries[];
}

export class AttentionEngine {
  /**
   * Pure, deterministic computation of attention items from signal series.
   * No external reads, writes, or side effects.
   */
  static computeAttention({ tenantId, asOf, signals }: ComputeAttentionArgs): AttentionSnapshot {
    const items: AttentionItem[] = [];

    // Group series by signal type for pattern detection.
    const byType = new Map<SignalType, SignalSeries[]>();
    signals.forEach((series) => {
      const list = byType.get(series.signalType) || [];
      list.push(series);
      byType.set(series.signalType, list);
    });

    byType.forEach((seriesList, signalType) => {
      seriesList.forEach((series) => {
        const values = series.points.map((p) => p.value);
        if (values.length < 2) return;

        const deltas = this.computeDeltas(values);
        const netDelta = values[values.length - 1] - values[0];

        // SIGNAL_ACCELERATION
        const accelerationSeverity = this.detectAcceleration(deltas);
        if (accelerationSeverity) {
          items.push(
            this.buildItem({
              tenantId,
              asOf,
              type: AttentionType.SIGNAL_ACCELERATION,
              severity: accelerationSeverity,
              signalType,
              window: series.window,
              values,
              delta: netDelta,
              summary: `Observed change acceleration in ${signalType} over ${series.window}.`,
            }),
          );
        }

        // BACKLOG_GROWTH (only for backlog signal)
        if (signalType === SignalType.ADMISSION_BACKLOG_CHANGE) {
          const backlogSeverity = this.detectBacklogGrowth(deltas);
          if (backlogSeverity) {
            items.push(
              this.buildItem({
                tenantId,
                asOf,
                type: AttentionType.BACKLOG_GROWTH,
                severity: backlogSeverity,
                signalType,
                window: series.window,
                values,
                delta: netDelta,
                summary: `Observed increase in admission backlog over ${series.window}.`,
              }),
            );
          }
        }

        // FAILURE_CONCENTRATION (only for failure signal)
        if (signalType === SignalType.EXECUTION_FAILURE_SPIKE) {
          const failureSeverity = this.detectFailureConcentration(values);
          if (failureSeverity) {
            items.push(
              this.buildItem({
                tenantId,
                asOf,
                type: AttentionType.FAILURE_CONCENTRATION,
                severity: failureSeverity,
                signalType,
                window: series.window,
                values,
                delta: netDelta,
                summary: `Observed concentration of execution failures within part of the ${series.window} window.`,
              }),
            );
          }
        }

        // RAPID_STATE_CHANGE
        const rapidSeverity = this.detectRapidChange(deltas);
        if (rapidSeverity) {
          items.push(
            this.buildItem({
              tenantId,
              asOf,
              type: AttentionType.RAPID_STATE_CHANGE,
              severity: rapidSeverity,
              signalType,
              window: series.window,
              values,
              delta: netDelta,
              summary: `Observed rapid state change in ${signalType} within ${series.window}.`,
            }),
          );
        }

        // PROLONGED_STAGNATION
        const stagnationSeverity = this.detectStagnation(deltas);
        if (stagnationSeverity) {
          items.push(
            this.buildItem({
              tenantId,
              asOf,
              type: AttentionType.PROLONGED_STAGNATION,
              severity: stagnationSeverity,
              signalType,
              window: series.window,
              values,
              delta: netDelta,
              summary: `Observed extended period with limited change in ${signalType}.`,
            }),
          );
        }
      });
    });

    return {
      tenantId,
      asOf,
      // Deterministic: tie computed_at to asOf rather than wall clock.
      computed_at: new Date(asOf.getTime()),
      items,
    };
  }

  private static computeDeltas(values: number[]): number[] {
    const deltas: number[] = [];
    for (let i = 1; i < values.length; i++) {
      deltas.push(values[i] - values[i - 1]);
    }
    return deltas;
  }

  private static mean(values: number[]): number {
    if (!values.length) return 0;
    const sum = values.reduce((acc, v) => acc + v, 0);
    return sum / values.length;
  }

  private static medianAbsoluteStep(deltas: number[]): number {
    if (!deltas.length) return 0;
    const abs = deltas.map((d) => Math.abs(d)).sort((a, b) => a - b);
    const mid = Math.floor(abs.length - 1) / 2;
    const lower = abs[Math.floor(mid)];
    const upper = abs[Math.ceil(mid)];
    return (lower + upper) / 2;
  }

  private static detectAcceleration(deltas: number[]): AttentionSeverity | null {
    if (deltas.length < 4) return null;
    const midpoint = Math.floor(deltas.length / 2);
    const first = deltas.slice(0, midpoint);
    const second = deltas.slice(midpoint);

    const firstMean = this.mean(first);
    const secondMean = this.mean(second);

    // Consider acceleration if magnitude of recent mean is greater.
    const base = Math.abs(firstMean);
    const recent = Math.abs(secondMean);
    if (recent <= base) return null;

    const ratio = base === 0 ? Infinity : recent / (base || 1);

    if (ratio > 2) return AttentionSeverity.HIGH;
    if (ratio > 1.2) return AttentionSeverity.MEDIUM;
    return AttentionSeverity.LOW;
  }

  private static detectBacklogGrowth(deltas: number[]): AttentionSeverity | null {
    const positiveRuns = deltas.filter((d) => d > 0).length;
    const net = deltas.reduce((acc, v) => acc + v, 0);
    if (net <= 0 || positiveRuns < 2) return null;

    const avg = net / deltas.length;

    if (avg > 5) return AttentionSeverity.HIGH;
    if (avg > 1) return AttentionSeverity.MEDIUM;
    return AttentionSeverity.LOW;
  }

  private static detectFailureConcentration(values: number[]): AttentionSeverity | null {
    const total = values.reduce((acc, v) => acc + v, 0);
    if (total === 0) return null;

    const third = Math.max(1, Math.floor(values.length / 3));
    const recent = values.slice(values.length - third);
    const recentTotal = recent.reduce((acc, v) => acc + v, 0);
    const fraction = recentTotal / total;

    if (fraction > 0.7) return AttentionSeverity.HIGH;
    if (fraction > 0.5) return AttentionSeverity.MEDIUM;
    if (fraction > 0.3) return AttentionSeverity.LOW;
    return null;
  }

  private static detectRapidChange(deltas: number[]): AttentionSeverity | null {
    const baseline = this.medianAbsoluteStep(deltas);
    const epsilon = 1e-6;
    if (baseline < epsilon) return null;

    const maxStep = Math.max(...deltas.map((d) => Math.abs(d)));
    const ratio = maxStep / baseline;

    if (ratio > 5) return AttentionSeverity.HIGH;
    if (ratio > 3) return AttentionSeverity.MEDIUM;
    if (ratio > 1.5) return AttentionSeverity.LOW;
    return null;
  }

  private static detectStagnation(deltas: number[]): AttentionSeverity | null {
    const maxAbs = Math.max(...deltas.map((d) => Math.abs(d)));
    const epsilon = 1e-3;
    if (maxAbs < epsilon) {
      return AttentionSeverity.MEDIUM;
    }
    return null;
  }

  private static buildItem(args: {
    tenantId: string;
    asOf: Date;
    type: AttentionType;
    severity: AttentionSeverity;
    signalType: SignalType;
    window: SignalSeries['window'];
    values: number[];
    delta: number;
    summary: string;
  }): AttentionItem {
    const { tenantId, asOf, type, severity, signalType, window, values, delta, summary } = args;
    const idSource = `${tenantId}|${asOf.toISOString()}|${type}|${signalType}|${window}`;
    const id = this.simpleHash(idSource);

    return {
      id,
      tenantId,
      asOf: new Date(asOf.getTime()),
      type,
      severity,
      sourceSignalType: signalType,
      summary,
      evidence: {
        window,
        values: [...values],
        delta,
      },
      created_at: new Date(asOf.getTime()),
    };
  }

  private static simpleHash(input: string): string {
    let hash = 5381;
    for (let i = 0; i < input.length; i++) {
      hash = (hash * 33) ^ input.charCodeAt(i);
    }
    return (hash >>> 0).toString(16);
  }
}



