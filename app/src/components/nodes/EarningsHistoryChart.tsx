import { CartesianGrid, Line, LineChart, ResponsiveContainer } from 'recharts';
import { Text } from '@astryxdesign/core/Text';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import type { EarningsHistoryChartProps } from '../../contracts/props/earnings-history-chart';
import styles from './EarningsHistoryChart.module.css';

function formatDelta(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}`;
}

// "How has this company's actual performance tracked what analysts
// expected, quarter over quarter?" (node-vocabulary.md) — the vocabulary
// entry names bars OR lines as the pairing; reskinned to a dual-line card
// (2026-08-29, direct order, reference: a dense "Earnings Trends" card —
// sub-header states the current quarter's Estimate/Actual reading, the
// chart below is a bare dual-line comparison with no axis chrome, the
// footer restates the same beat/miss the old bar chart encoded spatially
// as plain per-quarter delta text instead). Same data (`points`), same
// registration — this is a visual reskin, not a new node.
// Estimate stays muted (--viz-2, a series-identity color, principle 8's
// default, unchanged from the bar version). Actual moves from PER-BAR
// beat/miss coloring (--delta-up/-down) to a single consistent
// --accent-signal line, matching the reference's one-hue Actual line and
// TrendChart's own primary-series convention (Phase 21's own precedent:
// a chart's primary series reads as the subject, not a verdict on it) —
// beat/miss is still a fact, just relocated to the footer's delta text
// rather than encoded as line/segment color.
export function EarningsHistoryChart({ title, points }: EarningsHistoryChartProps) {
  if (points.length === 0) {
    return <EmptyState title="No earnings history" description="No reported quarters available for this asset." />;
  }

  const rows = points.map((point) => ({
    period: point.period,
    epsActual: point.epsActual,
    epsEstimate: point.epsEstimate,
  }));

  const current = points[points.length - 1];
  // Footer: 3 most recent quarters as plain delta text — the same
  // beat/miss the old bar chart encoded as bar color, now a stat row.
  const footerQuarters = points.slice(-3);

  return (
    <div className={styles.root}>
      <Text type="label">{title ?? 'Earnings Trends'}</Text>
      {current && (
        <div className={styles.subHeader}>
          <Text type="body" weight="medium">
            {current.period}
          </Text>
          <div className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.legendDotEstimate}`} />
            <Text type="supporting" color="secondary">
              Estimate {formatDelta(current.epsEstimate)}
            </Text>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.legendDotActual}`} />
            <Text type="supporting" color="secondary">
              Actual {formatDelta(current.epsActual)}
            </Text>
          </div>
        </div>
      )}
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={rows}>
          <CartesianGrid stroke="var(--edge)" strokeDasharray="3 3" vertical={false} />
          <Line
            dataKey="epsEstimate"
            name="EPS estimate"
            stroke="var(--viz-2)"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            dataKey="epsActual"
            name="EPS actual"
            stroke="var(--accent-signal)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className={styles.footerRow}>
        {footerQuarters.map((point) => (
          <div key={point.period} className={styles.footerColumn}>
            <Text type="supporting" color="secondary">
              {point.period}
            </Text>
            <Text
              type="body"
              weight="medium"
              hasTabularNumbers
              className={point.epsActual >= point.epsEstimate ? styles.deltaOk : styles.deltaAlert}
            >
              {formatDelta(point.epsActual - point.epsEstimate)}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}
