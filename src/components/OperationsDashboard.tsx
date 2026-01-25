import React from 'react';
import { useTime } from '../state/time/useTime';
import { TenantContextManager } from '../tenant/TenantContext';
import { QueryClient } from '../adapters/query/QueryClient';
import { OperationalMetricsSnapshot } from '../analysis/metrics-types';

const useOperationalMetrics = () => {
  const { asOf } = useTime();
  const [snapshot, setSnapshot] = React.useState<OperationalMetricsSnapshot | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const { tenantId } = TenantContextManager.getContext();
    setIsLoading(true);
    setError(null);

    try {
      const result = QueryClient.getOperationalMetrics(asOf, tenantId);
      setSnapshot(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to compute operational metrics');
    } finally {
      setIsLoading(false);
    }
  }, [asOf]);

  return { snapshot, isLoading, error, asOf };
};

const MetricTile: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div
    style={{
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid var(--border)',
      backgroundColor: 'var(--surface-2)',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    }}
  >
    <div style={{ fontSize: '24px', fontWeight: 600 }}>{value}</div>
    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label}
    </div>
  </div>
);

const OperationsDashboard: React.FC = () => {
  const { snapshot, isLoading, error, asOf } = useOperationalMetrics();

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
          <div style={{ fontSize: '16px', fontWeight: 700 }}>Operations Overview</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Snapshot of system state and activity</div>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'right' }}>
          <div>AS OF: {asOf.toISOString().replace('T', ' ').split('.')[0]} UTC</div>
          {snapshot && (
            <div>COMPUTED: {snapshot.computed_at.toISOString().replace('T', ' ').split('.')[0]} UTC</div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', padding: '24px', gap: '24px', overflow: 'auto' }}>
        {isLoading && !snapshot && (
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Computing metrics…</div>
        )}

        {error && (
          <div
            style={{
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #FF4D4D',
              backgroundColor: 'rgba(255, 77, 77, 0.05)',
              color: '#FFB3B3',
            }}
          >
            {error}
          </div>
        )}

        {snapshot && (
          <>
            {/* Left column: System health & distribution */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {snapshot.semantic_metrics && snapshot.semantic_metrics.length > 0 && (
                <section>
                  <h3
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: 'var(--text-secondary)',
                      marginBottom: '12px',
                    }}
                  >
                    Ontology-Defined Metrics
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px' }}>
                    {snapshot.semantic_metrics.map(metric => (
                      <MetricTile 
                        key={metric.metric_id} 
                        label={metric.display_name} 
                        value={`${metric.value}${metric.unit ? ` ${metric.unit}` : ''}`} 
                      />
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h3
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--text-secondary)',
                    marginBottom: '12px',
                  }}
                >
                  System Health Overview
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px' }}>
                  <MetricTile label="Total Entities" value={snapshot.entities.totalEntities} />
                  <MetricTile
                    label="Active Entities"
                    value={snapshot.entities.byStatus['ACTIVE'] || 0}
                  />
                  <MetricTile
                    label="Degraded / At-Risk"
                    value={
                      (snapshot.entities.byStatus['DEGRADED'] || 0) +
                      (snapshot.entities.byStatus['AT_RISK'] || 0)
                    }
                  />
                  <MetricTile label="Decisions (24h)" value={snapshot.decisions.totalDecisions} />
                  <MetricTile label="Execution Attempts" value={(snapshot.execution.attemptsByMode['DRY_RUN'] || 0) + (snapshot.execution.attemptsByMode['REAL_RUN'] || 0)} />
                  <MetricTile label="Admission Cases" value={snapshot.admission.totalCases} />
                </div>
              </section>

              <section>
                <h3
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--text-secondary)',
                    marginBottom: '12px',
                  }}
                >
                  Entity Distribution
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {Object.entries(snapshot.entities.byType).map(([type, count]) => (
                    <div
                      key={type}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '11px',
                      }}
                    >
                      <span style={{ width: '140px', color: 'var(--text-secondary)' }}>{type}</span>
                      <div
                        style={{
                          flex: 1,
                          height: '6px',
                          borderRadius: '999px',
                          background:
                            'linear-gradient(90deg, rgba(0,102,255,0.5), rgba(0,204,255,0.4))',
                          transformOrigin: 'left' as const,
                        }}
                      />
                      <span style={{ width: '32px', textAlign: 'right' }}>{count}</span>
                    </div>
                  ))}
                  {Object.keys(snapshot.entities.byType).length === 0 && (
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                      No entities available for this tenant at the selected time.
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Right column: risk, funnel, decisions */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <section>
                <h3
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--text-secondary)',
                    marginBottom: '12px',
                  }}
                >
                  Risk Summary
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {Object.entries(snapshot.risk.buckets).map(([bucket, count]) => (
                    <div
                      key={bucket}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '999px',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--surface-2)',
                        fontSize: '11px',
                      }}
                    >
                      <span style={{ color: 'var(--text-secondary)', marginRight: '6px' }}>{bucket}</span>
                      <span style={{ fontWeight: 600 }}>{count}</span>
                    </div>
                  ))}
                  {Object.keys(snapshot.risk.buckets).length === 0 && (
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                      No risk-related classifications available.
                    </div>
                  )}
                </div>
              </section>

              <section>
                <h3
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--text-secondary)',
                    marginBottom: '12px',
                  }}
                >
                  Ingestion → Truth Funnel
                </h3>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    fontSize: '11px',
                  }}
                >
                  {Object.entries(snapshot.admission.byStatus).map(([status, count]) => (
                    <div key={status} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{status}</span>
                      <span style={{ fontWeight: 600 }}>{count}</span>
                    </div>
                  ))}
                  {Object.keys(snapshot.admission.byStatus).length === 0 && (
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                      No admission cases recorded.
                    </div>
                  )}
                </div>
              </section>

              <section>
                <h3
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--text-secondary)',
                    marginBottom: '12px',
                  }}
                >
                  Decisions Over Time (Last 24h)
                </h3>
                <div
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--surface-2)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '4px',
                    height: '120px',
                  }}
                >
                  {snapshot.decisions.points.length > 0 ? (
                    snapshot.decisions.points.map((p) => (
                      <div
                        key={p.bucketStart.toISOString()}
                        title={`${p.bucketStart.toISOString()} • ${p.count} decisions`}
                        style={{
                          flex: 1,
                          background:
                            'linear-gradient(180deg, rgba(0,102,255,0.7), rgba(0,102,255,0.1))',
                          borderRadius: '3px 3px 0 0',
                          height: `${Math.min(100, p.count * 20)}%`,
                        }}
                      />
                    ))
                  ) : (
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                      No decisions recorded in this window.
                    </div>
                  )}
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OperationsDashboard;


