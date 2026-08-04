import { Card } from '@astryxdesign/core/Card';
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
            <Text type="large" weight="semibold" display="block">
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

      {/* Summary + Recommendation row — 2 columns */}
      <div className={styles.summaryRecommendationRow}>
        {/* Summary pane — left */}
        {investigationSummary && (
          <Card variant="default" padding={4} className="panelProvisional">
            <div className={styles.paneContent}>
              <div className={styles.kicker}>Reasoning</div>
              <div className={styles.voiceFace}>
                <Text type="body">{investigationSummary}</Text>
              </div>
            </div>
          </Card>
        )}
        {/* Recommendation pane — right */}
        <Card variant="default" padding={4} className="panelProvisional">
          <div className={styles.paneContent}>
            <div className={styles.kicker}>Recommended</div>
            <div className={styles.voiceFace}>
              <Text type="body">{recommendation}</Text>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
