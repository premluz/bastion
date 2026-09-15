import { Text } from '@astryxdesign/core/Text';
import styles from './AllocationBar.module.css';

// One segment per real holding (2026-09-16, direct feedback: "the
// allocation totals [more than the headline]... show allocation across
// its holdings — BTC, ETH, SOL, etc. Money shouldn't reappear here") —
// takes the SAME rows resolveAssetsHomeSummary already computed for the
// list below, rather than a separately-fetched or fabricated category
// breakdown (Crypto/Stablecoins/Yield), which is exactly what let the
// total drift out of sync with the real headline balance.
const SEGMENT_TOKENS = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)', 'var(--viz-4)', 'var(--viz-5)', 'var(--viz-6)'];

export interface AllocationSegment { id: string; label: string; value: number }
export interface AllocationBarProps { segments: readonly AllocationSegment[] }

export function AllocationBar({ segments }: AllocationBarProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const withPercent = segments.map((segment, index) => ({
    ...segment,
    percent: total > 0 ? (segment.value / total) * 100 : 0,
    color: SEGMENT_TOKENS[index % SEGMENT_TOKENS.length]!,
  }));

  return (
    <div className={styles.root}>
      <Text type="label" color="secondary">Allocation</Text>
      <div role="img" aria-label={withPercent.map((segment) => `${segment.label} ${segment.percent.toFixed(0)}%`).join(', ')}
        className={styles.bar}>
        {withPercent.map((segment) => segment.percent > 0 && (
          <div key={segment.id} className={styles.segment}
            style={{ '--segment-percent': `${segment.percent}%`, '--segment-color': segment.color } as React.CSSProperties} />
        ))}
      </div>
      <div className={styles.legend}>
        {withPercent.map((segment) => (
          <div key={segment.id} className={styles.legendRow}>
            <span className={styles.swatch} style={{ '--segment-color': segment.color } as React.CSSProperties} />
            <Text type="supporting">{segment.label}</Text>
            <Text type="supporting" weight="semibold" hasTabularNumbers className={styles.legendValue}>
              ${segment.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <Text type="supporting" color="secondary" hasTabularNumbers>{segment.percent.toFixed(0)}%</Text>
          </div>
        ))}
      </div>
    </div>
  );
}
