import { Text } from '@astryxdesign/core/Text';
import { SourceChip } from '../trail/SourceChip';
import { ConfidenceMeter } from './ConfidenceMeter';
import { Metric } from './Metric';
import { Panel } from './Panel';
import { confidenceQualifier } from '../../contracts/thinking';
import type { SceneSummaryProps } from '../../contracts/props/scene-summary';
import styles from './SceneSummary.module.css';

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function SceneSummary({
  recommendation,
  investigationSummary,
  confidence,
  confidenceLabel,
  sourceRefs,
  assumptions,
  unknowns,
  caveat
}: SceneSummaryProps) {
  return (
    <div className={styles.root}>
      {/* Confidence pane — full width, top (2026-07-29 order, second pass).
          The Panel's own title carries confidenceLabel now, so the ring no
          longer needs a label underneath — just the one-word qualifier, set
          at Metric's compact value size (large/semibold) without a label
          above it: it's a description of the ring, not a metric of its own.
          Caveat text moves out of the left column entirely — it reads across
          the full width below the two-column row, ordinary body text, not
          scoped to confidence specifically. */}
      <Panel title={confidenceLabel}>
        <div className={styles.confidenceMetricsRow}>
          <div className={styles.confidenceColumn}>
            <ConfidenceMeter label={confidenceLabel} value={confidence} hideCaption />
            {/* body, not large (direct feedback, 2026-08-08: "value Moderate
                should be smaller scale... same as [EntityStatistics's
                Metric size='compact' values]") — Metric.tsx's own compact
                branch is exactly this: body + semibold, one step below the
                large (17px) this used before. Matches the confidence pane's
                sibling metrics (Sources/Unknowns/Assumptions, all
                size="compact") rather than standing out a step larger. */}
            <Text type="body" weight="semibold" display="block">
              {capitalize(confidenceQualifier(confidence))}
            </Text>
          </div>
          <div className={styles.metadataColumn}>
            <Metric label="Sources" value={sourceRefs.length} size="compact" />
            <Metric label="Unknowns" value={unknowns?.length ?? 0} size="compact" />
            <Metric label="Assumptions" value={assumptions?.length ?? 0} size="compact" />
          </div>
        </div>
        {caveat && <Text type="body">{caveat}</Text>}
        {sourceRefs.length > 0 && (
          <div className={styles.sources}>
            {sourceRefs.map((name) => (
              <SourceChip key={name} name={name} />
            ))}
          </div>
        )}
      </Panel>

      {/* Summary + Recommendation row — 2 columns. Uses Panel itself now
          (direct feedback, 2026-08-08: "these titles should be like others
          not upper case not grey") rather than a hand-rolled Card + .kicker
          div trying to imitate Panel's title styling in parallel — the
          .kicker class had already drifted once (accent color, then
          uppercase+letter-spacing on top of that) precisely because it was
          a second implementation of the same visual idea instead of a
          shared one. Panel's own <Text type="label"> title is what every
          other section (confidence pane above, page sections elsewhere)
          renders, so reusing it structurally guarantees the match instead
          of re-copying values that can drift again. */}
      <div className={styles.summaryRecommendationRow}>
        {/* Summary pane — left */}
        {investigationSummary && (
          <Panel title="Reasoning">
            <div className={styles.voiceFace}>
              <Text type="body">{investigationSummary}</Text>
            </div>
          </Panel>
        )}
        {/* Recommendation pane — right */}
        <Panel title="Recommended">
          <div className={styles.voiceFace}>
            <Text type="body">{recommendation}</Text>
          </div>
        </Panel>
      </div>
    </div>
  );
}
