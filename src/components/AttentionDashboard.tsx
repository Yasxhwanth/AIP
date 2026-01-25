import React from 'react';
import { useTime } from '../state/time/useTime';
import { TenantContextManager } from '../tenant/TenantContext';
import { QueryClient } from '../adapters/query/QueryClient';
import { AttentionItem, AttentionSnapshot } from '../attention/attention-types';

const useAttentionSnapshot = () => {
  const { asOf } = useTime();
  const [snapshot, setSnapshot] = React.useState<AttentionSnapshot | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const { tenantId } = TenantContextManager.getContext();
    setIsLoading(true);
    setError(null);
    try {
      const next = QueryClient.getAttentionSnapshot(asOf, tenantId);
      setSnapshot(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to compute attention snapshot');
    } finally {
      setIsLoading(false);
    }
  }, [asOf]);

  return { snapshot, isLoading, error, asOf };
};

const EvidenceChart: React.FC<{ values: number[] }> = ({ values }) => {
  if (!values.length) {
    return (
      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
        No evidence values available.
      </div>
    );
  }

  const width = 260;
  const height = 80;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const stepX = values.length > 1 ? width / (values.length - 1) : 0;

  const d = values
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * height;
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <path d={d} fill="none" stroke="var(--accent)" strokeWidth={2} />
    </svg>
  );
};

const AttentionDashboard: React.FC = () => {
  const { snapshot, isLoading, error, asOf } = useAttentionSnapshot();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const items = snapshot?.items ?? [];
  const selected: AttentionItem | undefined =
    items.find((i) => i.id === selectedId) || items[0];

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
          <div style={{ fontSize: '16px', fontWeight: 700 }}>Operational Attention</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Derived observations — not alerts or recommendations
          </div>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'right' }}>
          <div>AS OF: {asOf.toISOString().replace('T', ' ').split('.')[0]} UTC</div>
          {snapshot && (
            <div>
              COMPUTED: {snapshot.computed_at.toISOString().replace('T', ' ').split('.')[0]} UTC
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          gap: '0',
          overflow: 'hidden',
        }}
      >
        {/* Items list */}
        <div
          style={{
            borderRight: '1px solid var(--border)',
            padding: '16px',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--text-secondary)',
              marginBottom: '8px',
            }}
          >
            Attention Items
          </div>

          {isLoading && !snapshot && (
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Computing…</div>
          )}

          {error && (
            <div
              style={{
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface-2)',
                fontSize: '11px',
                color: 'var(--text-secondary)',
              }}
            >
              {error}
            </div>
          )}

          {!isLoading && items.length === 0 && !error && (
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              No notable patterns detected for the current window.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                style={{
                  textAlign: 'left',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  backgroundColor:
                    selected && selected.id === item.id ? 'var(--surface-2)' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--text-secondary)',
                    marginBottom: '4px',
                  }}
                >
                  {item.type.replace(/_/g, ' ')}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600 }}>{item.summary}</div>
                <div
                  style={{
                    marginTop: '4px',
                    fontSize: '10px',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span>Severity: {item.severity}</span>
                  <span>Signal: {item.sourceSignalType}</span>
                  <span>Window: {item.evidence.window}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Evidence panel */}
        <div
          style={{
            padding: '16px 24px',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--text-secondary)',
              marginBottom: '8px',
            }}
          >
            Evidence
          </div>

          {selected ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                maxWidth: '520px',
              }}
            >
              <div
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--surface-2)',
                  fontSize: '12px',
                }}
              >
                <div style={{ marginBottom: '4px' }}>{selected.summary}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Change over window: {selected.evidence.delta >= 0 ? '+' : ''}
                  {selected.evidence.delta}
                </div>
              </div>

              <EvidenceChart values={selected.evidence.values} />

              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div>
                  Observed values:{' '}
                  {selected.evidence.values.map((v, idx) => (
                    <span key={idx}>
                      {idx > 0 && ', '}
                      {v}
                    </span>
                  ))}
                </div>
                <div>
                  Interpretation is left to the human operator; this view highlights patterns only.
                </div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              Select an attention item to view supporting evidence.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttentionDashboard;



