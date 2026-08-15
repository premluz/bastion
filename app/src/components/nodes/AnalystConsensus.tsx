import { Text } from '@astryxdesign/core/Text';
import type { AnalystConsensusProps } from '../../contracts/props/analyst-consensus';
import styles from './AnalystConsensus.module.css';

// Bearish/neutral/bullish, in that fixed left-to-right order — matches how
// every reference sentiment bar in this register reads (worst to best,
// left to right), and keeps the segment order stable regardless of which
// count happens to be largest.
const SEGMENT_TOKENS = {
  bearish: 'var(--viz-1)',
  neutral: 'var(--viz-2)',
  bullish: 'var(--accent-signal)',
} as const;

// "What do outside analysts collectively think, and where does the current
// price sit against their range?" (node-vocabulary.md, Phase 19) — two
// facts read together: a proportional sentiment bar (bearish/neutral/
// bullish, muted per-segment hues, no red/green performance framing per
// principle 8 — this is concentration-map's own "share, not performance"
// discipline applied to a linear bar instead of a treemap) and a labeled
// price-position axis (low/average/high/current). Facts register,
// permanent, never rendered in the voice face (principle 2) — this is
// third-party opinion, never Merlin's own recommendation.
export function AnalystConsensus({ consensus }: AnalystConsensusProps) {
  const { distribution, priceTargets } = consensus;
  const total = distribution.bearish + distribution.neutral + distribution.bullish;
  const segments = (['bearish', 'neutral', 'bullish'] as const).map((key) => ({
    key,
    count: distribution[key],
    percent: total > 0 ? (distribution[key] / total) * 100 : 0,
  }));

  const { low, average, high, current } = priceTargets;
  const axisMin = Math.min(low, current);
  const axisMax = Math.max(high, current);
  const axisSpan = axisMax - axisMin || 1;
  const positionPercent = (value: number) => ((value - axisMin) / axisSpan) * 100;

  return (
    <div className={styles.root}>
      <div className={styles.section}>
        <div className={styles.headerRow}>
          <Text type="label" color="secondary">
            Analyst consensus
          </Text>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {total} analyst{total === 1 ? '' : 's'}
          </Text>
        </div>
        <div
          role="img"
          aria-label={`${distribution.bearish} bearish, ${distribution.neutral} neutral, ${distribution.bullish} bullish`}
          className={styles.distributionBar}
        >
          {segments.map(
            (segment) =>
              segment.percent > 0 && (
                <div
                  key={segment.key}
                  className={styles.segment}
                  style={
                    {
                      '--segment-percent': `${segment.percent}%`,
                      '--segment-color': SEGMENT_TOKENS[segment.key],
                    } as React.CSSProperties
                  }
                />
              ),
          )}
        </div>
        <div className={styles.legendRow}>
          {segments.map((segment) => (
            <Text key={segment.key} type="supporting" color="secondary" hasTabularNumbers>
              {segment.count} {segment.key}
            </Text>
          ))}
        </div>
      </div>

      <div className={styles.axisSection}>
        <div
          role="img"
          aria-label={`Low ${low}, average ${average}, high ${high}, current ${current}`}
          className={styles.axisTrack}
        >
          {(['low', 'average', 'high'] as const).map((key) => (
            <div
              key={key}
              className={styles.axisMarker}
              style={{ '--marker-percent': `${positionPercent(priceTargets[key])}%` } as React.CSSProperties}
            />
          ))}
          <div
            className={styles.axisMarkerCurrent}
            style={{ '--marker-percent': `${positionPercent(current)}%` } as React.CSSProperties}
          />
        </div>
        <div className={styles.targetGrid}>
          <div className={styles.targetCell}>
            <Text type="supporting" color="secondary">
              Low
            </Text>
            <Text type="body" hasTabularNumbers>
              ${low.toFixed(2)}
            </Text>
          </div>
          <div className={styles.targetCell}>
            <Text type="supporting" color="secondary">
              Average
            </Text>
            <Text type="body" hasTabularNumbers>
              ${average.toFixed(2)}
            </Text>
          </div>
          <div className={styles.targetCell}>
            <Text type="supporting" color="secondary">
              High
            </Text>
            <Text type="body" hasTabularNumbers>
              ${high.toFixed(2)}
            </Text>
          </div>
          <div className={styles.targetCell}>
            <Text type="supporting" color="secondary">
              Current
            </Text>
            <Text type="body" weight="medium" hasTabularNumbers>
              ${current.toFixed(2)}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
