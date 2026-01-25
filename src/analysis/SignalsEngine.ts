import { MetricsEngine } from './MetricsEngine';
import { AdmissionStatus } from '../ontology/admission/truth-admission-types';
import {
  OperationalMetricsSnapshot,
} from './metrics-types';
import {
  SignalDirection,
  SignalPoint,
  SignalSeries,
  SignalSummary,
  SignalType,
  SignalWindow,
} from './signal-types';

type WindowConfig = {
  hours: number;
  buckets: number;
};

const WINDOW_CONFIG: Record<SignalWindow, WindowConfig> = {
  '1h': { hours: 1, buckets: 12 },
  '6h': { hours: 6, buckets: 12 },
  '24h': { hours: 24, buckets: 12 },
};

export interface ComputeSignalsArgs {
  tenantId: string;
  asOf: Date;
  // The following are included for transparency, but we rely on MetricsEngine
  // singletons internally to avoid propagating mutable state.
  ontologyStore?: unknown;
  metricsEngine?: typeof MetricsEngine;
  decisionManager?: unknown;
  executionManager?: unknown;
  truthAdmissionEngine?: unknown;
}

export interface AllSignals {
  series: Record<SignalType, Record<SignalWindow, SignalSeries>>;
  summaries: Record<SignalType, Record<SignalWindow, SignalSummary>>;
}

export class SignalsEngine {
  /**
   * Compute all signal series and summaries for a tenant at a given asOf time.
   * Pure aggregation: no writes, caching, or side effects.
   */
  static computeSignals(args: ComputeSignalsArgs): AllSignals {
    const { tenantId, asOf } = args;

    const resultSeries: Partial<Record<SignalType, Partial<Record<SignalWindow, SignalSeries>>>> = {};
    const resultSummaries: Partial<Record<SignalType, Partial<Record<SignalWindow, SignalSummary>>>> =
      {};

    const signalTypes: SignalType[] = [
      SignalType.ENTITY_COUNT_CHANGE,
      SignalType.DECISION_RATE_CHANGE,
      SignalType.EXECUTION_FAILURE_SPIKE,
      SignalType.ADMISSION_BACKLOG_CHANGE,
    ];

    const windows: SignalWindow[] = ['1h', '6h', '24h'];

    signalTypes.forEach((type) => {
      resultSeries[type] = resultSeries[type] || {};
      resultSummaries[type] = resultSummaries[type] || {};

      windows.forEach((window) => {
        const series = this.computeSeriesFor(type, window, tenantId, asOf);
        const summary = this.computeSummary(series);
        (resultSeries[type] as Record<SignalWindow, SignalSeries>)[window] = series;
        (resultSummaries[type] as Record<SignalWindow, SignalSummary>)[window] = summary;
      });
    });

    return {
      series: resultSeries as Record<SignalType, Record<SignalWindow, SignalSeries>>,
      summaries: resultSummaries as Record<SignalType, Record<SignalWindow, SignalSummary>>,
    };
  }

  /**
   * Compute a single SignalSeries for a given type/window.
   * Used by QueryClient to serve UI requests.
   */
  static computeSeriesFor(
    signalType: SignalType,
    window: SignalWindow,
    tenantId: string,
    asOf: Date,
  ): SignalSeries {
    const config = WINDOW_CONFIG[window];
    const bucketMs = (config.hours * 60 * 60 * 1000) / config.buckets;
    const endTime = asOf.getTime();

    const points: SignalPoint[] = [];

    for (let i = config.buckets - 1; i >= 0; i--) {
      const bucketEnd = new Date(endTime - i * bucketMs);
      const snapshot = MetricsEngine.computeOperationalMetrics(bucketEnd, tenantId);
      const value = this.valueForSignal(signalType, snapshot);
      points.push({ time: bucketEnd, value });
    }

    const computed_at = new Date();

    return {
      tenantId,
      signalType,
      window,
      points,
      computed_at,
    };
  }

  private static valueForSignal(
    signalType: SignalType,
    snapshot: OperationalMetricsSnapshot,
  ): number {
    switch (signalType) {
      case SignalType.ENTITY_COUNT_CHANGE:
        return snapshot.entities.totalEntities;
      case SignalType.DECISION_RATE_CHANGE:
        // Total decisions in the last 24h window as a simple velocity proxy.
        return snapshot.decisions.totalDecisions;
      case SignalType.EXECUTION_FAILURE_SPIKE:
        return snapshot.execution.attemptsFailure;
      case SignalType.ADMISSION_BACKLOG_CHANGE:
        return snapshot.admission.byStatus[AdmissionStatus.PENDING] || 0;
      default:
        return 0;
    }
  }

  private static computeSummary(series: SignalSeries): SignalSummary {
    if (series.points.length === 0) {
      return {
        signalType: series.signalType,
        direction: 'FLAT',
        delta: 0,
        currentValue: 0,
      };
    }

    const first = series.points[0].value;
    const last = series.points[series.points.length - 1].value;
    const delta = last - first;

    let direction: SignalDirection = 'FLAT';
    const epsilon = 1e-6;
    if (delta > epsilon) direction = 'UP';
    else if (delta < -epsilon) direction = 'DOWN';

    return {
      signalType: series.signalType,
      direction,
      delta,
      currentValue: last,
    };
  }
}



