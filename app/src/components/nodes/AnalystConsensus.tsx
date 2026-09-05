import { Text } from '@astryxdesign/core/Text';
import type { AnalystConsensusProps } from '../../contracts/props/analyst-consensus';
import styles from './AnalystConsensus.module.css';

// Bearish/neutral/bullish, in that fixed left-to-right order — matches how
// every reference sentiment bar in this register reads (worst to best,
// left to right), and keeps the segment order stable regardless of which
// count happens to be largest.
//
// Bearish/bullish colored --delta-down-bg/--delta-up-bg (2026-08-15,
// direct feedback: "same shade as the gradient"; 2026-08-16 follow-up:
// "too strong contrast... should use same as bg of bullish/bearish tags,
// more toned down") — a confirmed, deliberate SECOND exception to
// principle 8's own "no red/green performance framing" rule this session
// (the first was KeyIssuesCard's own badges). Superseding this file's own
// prior stance (muted --viz-1/--accent-signal, chosen specifically to
// avoid red/green): the architect re-confirmed red/green explicitly via
// AskUserQuestion before this change, so this is a real, acknowledged
// reversal, not a silent drift. --delta-up-bg/-down-bg (not the plain
// --delta-up/-down used for small text/lines elsewhere) — a large opaque
// fill needs the SAME toned-down treatment Astryx's own Badge already
// gives its background (--color-background-green/-red, ~20% alpha of the
// base hue, confirmed by reading Badge's source), not the brighter
// small-text variant; theme.default.css's own comment on --delta-up-bg
// has the full reasoning. Neutral stays --viz-2 (no natural third delta
// color for a "no opinion" segment).
const SEGMENT_TOKENS = {
  bearish: 'var(--delta-down-bg)',
  neutral: 'var(--viz-2)',
  bullish: 'var(--delta-up-bg)',
} as const;

// "What do outside analysts collectively think, and where does the current
// price sit against their range?" (node-vocabulary.md, Phase 19) — two
// facts read together: a proportional sentiment bar (bearish/bullish now
// on the sanctioned --delta-down/--delta-up exception, see SEGMENT_TOKENS'
// own comment — this WAS concentration-map's "share, not performance"
// discipline until the 2026-08-15 reversal) and a labeled price-position
// axis (low/average/high/current). Facts register, permanent, never
// rendered in the voice face (principle 2) — this is third-party opinion,
// never Merlin's own recommendation.
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
