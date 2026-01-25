import React from 'react';
import { useTime } from '../state/time/useTime';
import { TenantContextManager } from '../tenant/TenantContext';
import { QueryClient } from '../adapters/query/QueryClient';
import { SignalPoint, SignalSeries, SignalType, SignalWindow } from '../analysis/signal-types';

const WINDOWS: SignalWindow[] = ['1h', '6h', '24h'];

interface UseSignalSeriesResult {
  series: SignalSeries | null;
  isLoading: boolean;
  error: string | null;
  window: SignalWindow;
  setWindow: (w: SignalWindow) => void;
}

const useSignalSeries = (signalType: SignalType, initialWindow: SignalWindow): UseSignalSeriesResult => {
  const { asOf } = useTime();
  const [window, setWindow] = React.useState<SignalWindow>(initialWindow);
  const [series, setSeries] = React.useState<SignalSeries | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const { tenantId } = TenantContextManager.getContext();
    setIsLoading(true);
    setError(null);

    try {
      const result = QueryClient.getSignalSeries(signalType, window, asOf, tenantId);
      setSeries(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to compute signals');
    } finally {
      setIsLoading(false);
    }
  }, [signalType, window, asOf]);

  return { series, isLoading, error, window, setWindow };
};

const LineChart: React.FC<{ points: SignalPoint[]; labelFormatter?: (v: number) => string }> = ({
  points,
}) => {
  if (!points.length) {
    return (
      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
        No data available for this window.
      </div>
    );
  }

  const width = 260;
  const height = 80;

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const stepX = points.length > 1 ? width / (points.length - 1) : 0;

  const d = points
    .map((p, i) => {
      const x = i * stepX;
      const y = height - ((p.value - min) / range) * height;
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <path d={d} fill="none" stroke="var(--accent)" strokeWidth="2" />
    </svg>
  );
};

const BarChart: React.FC<{ points: SignalPoint[] }> = ({ points }) => {
  if (!points.length) {
    return (
      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
        No data available for this window.
      </div>
    );
  }

  const width = 260;
  const height = 80;
  const barWidth = points.length ? width / points.length : width;

  const values = points.map((p) => p.value);
  const max = Math.max(...values, 1);

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      {points.map((p, i) => {
        const x = i * barWidth;
        const barHeight = (p.value / max) * height;
        const y = height - barHeight;
        return (
          <rect
            key={p.time.toISOString()}
            x={x + 1}
            y={y}
            width={Math.max(1, barWidth - 2)}
            height={barHeight}
            fill="var(--accent)"
            opacity={0.8}
          />
        );
      })}
    </svg>
  );
};

const PanelShell: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section
    style={{
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid var(--border)',
      backgroundColor: 'var(--surface-2)',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    }}
  >
    <div
      style={{
        fontSize: '12px',
        fontWeight: 700,
        textTransform: 'uppercase',
        color: 'var(--text-secondary)',
      }}
    >
      {title}
    </div>
    {children}
  </section>
);

const WindowSelector: React.FC<{ value: SignalWindow; onChange: (w: SignalWindow) => void }> = ({
  value,
  onChange,
}) => (
  <div style={{ display: 'flex', gap: '4px', fontSize: '10px' }}>
    {WINDOWS.map((w) => (
      <button
        key={w}
        onClick={() => onChange(w)}
        style={{
          padding: '4px 8px',
          borderRadius: '4px',
          border: '1px solid var(--border)',
          backgroundColor: value === w ? 'var(--accent)' : 'transparent',
          color: value === w ? '#ffffff' : 'var(--text-secondary)',
          cursor: 'pointer',
        }}
      >
        {w}
      </button>
    ))}
  </div>
);

const SignalsDashboard: React.FC = () => {
  const { asOf } = useTime();

  const entitySignals = useSignalSeries(SignalType.ENTITY_COUNT_CHANGE, '24h');
  const decisionSignals = useSignalSeries(SignalType.DECISION_RATE_CHANGE, '24h');
  const executionSignals = useSignalSeries(SignalType.EXECUTION_FAILURE_SPIKE, '24h');
  const admissionSignals = useSignalSeries(SignalType.ADMISSION_BACKLOG_CHANGE, '24h');

  const anyLoading =
    entitySignals.isLoading ||
    decisionSignals.isLoading ||
    executionSignals.isLoading ||
    admissionSignals.isLoading;

  const anyError =
    entitySignals.error || decisionSignals.error || executionSignals.error || admissionSignals.error;

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--background)',
        color: 'var(--text-primary)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--surface-1)',
        }}
      >
        <div>
          <div style={{ fontSize: '16px', fontWeight: 700 }}>Signals</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Trends and rates derived from historical truth
          </div>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'right' }}>
          <div>AS OF: {asOf.toISOString().replace('T', ' ').split('.')[0]} UTC</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', overflow: 'auto' }}>
        {anyLoading && !entitySignals.series && !decisionSignals.series && !executionSignals.series && !admissionSignals.series && (
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Computing signals…</div>
        )}

        {anyError && (
          <div
            style={{
              gridColumn: '1 / -1',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface-2)',
              color: 'var(--text-secondary)',
              fontSize: '11px',
            }}
          >
            {entitySignals.error ||
              decisionSignals.error ||
              executionSignals.error ||
              admissionSignals.error}
          </div>
        )}

        <PanelShell title="Entity Count Over Time">
          <WindowSelector value={entitySignals.window} onChange={entitySignals.setWindow} />
          {entitySignals.series && (
            <>
              <LineChart points={entitySignals.series.points} />
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Latest value: {entitySignals.series.points.at(-1)?.value ?? 0}
              </div>
            </>
          )}
        </PanelShell>

        <PanelShell title="Decision Velocity">
          <WindowSelector value={decisionSignals.window} onChange={decisionSignals.setWindow} />
          {decisionSignals.series && (
            <>
              <BarChart points={decisionSignals.series.points} />
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Total decisions in window: {decisionSignals.series.points.reduce((sum, p) => sum + p.value, 0)}
              </div>
            </>
          )}
        </PanelShell>

        <PanelShell title="Execution Failures Trend">
          <WindowSelector value={executionSignals.window} onChange={executionSignals.setWindow} />
          {executionSignals.series && (
            <>
              <BarChart points={executionSignals.series.points} />
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Latest failures count: {executionSignals.series.points.at(-1)?.value ?? 0}
              </div>
            </>
          )}
        </PanelShell>

        <PanelShell title="Admission Backlog Trend">
          <WindowSelector value={admissionSignals.window} onChange={admissionSignals.setWindow} />
          {admissionSignals.series && (
            <>
              <LineChart points={admissionSignals.series.points} />
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Latest pending cases: {admissionSignals.series.points.at(-1)?.value ?? 0}
              </div>
            </>
          )}
        </PanelShell>
      </div>
    </div>
  );
};

export default SignalsDashboard;



