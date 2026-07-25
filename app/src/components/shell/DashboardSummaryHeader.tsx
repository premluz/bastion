import { Card } from '@astryxdesign/core/Card';
import { Blockquote } from '@astryxdesign/core/Blockquote';
import { Text } from '@astryxdesign/core/Text';
import { SourceChip } from '../trail/SourceChip';
import { ConfidenceMeter } from '../nodes/ConfidenceMeter';
import styles from './DashboardSummaryHeader.module.css';

interface DashboardSummaryHeaderProps {
  recommendation: string;
  confidence: number;
  confidenceLabel: string;
  sourceRefs: string[];
  assumptions?: string[];
  caveat?: string;
}

// Phase 13: the same header pattern as scene-summary (recommendation +
// confidence + sources) for trust-architecture consistency, but NOT the
// scene-summary registry node — a dashboard page isn't a scene, has no
// Scene JSON, no Zod prop validation, no reveal choreography. Sanctioned
// by CLAUDE.md rule 1's own exception ("No component is ever mounted
// from application code outside the renderer, EXCEPT the app shell") —
// this file lives in components/shell/, not components/nodes/, and is
// never registered; it imports ConfidenceMeter/SourceChip directly, the
// same reuse scene-summary itself already makes, rather than
// reimplementing either rendering. Flagged for architect review: this is
// a new application of the shell exception beyond "chat bar, theme
// switch, frame."
export function DashboardSummaryHeader({ recommendation, confidence, confidenceLabel, sourceRefs, assumptions, caveat }: DashboardSummaryHeaderProps) {
  return (
    <Card variant="default" padding={4}>
      <div style={{ display: 'grid', gap: 'var(--space-12)' }}>
        <Text type="label" color="accent">
          Recommended
        </Text>
        <Blockquote style={{ fontFamily: 'var(--face-voice)' }}>{recommendation}</Blockquote>
        <ConfidenceMeter label={confidenceLabel} value={confidence} />
        {assumptions && assumptions.length > 0 && (
          <div className={styles.assumptions}>
            <Text type="supporting" color="secondary">
              Assumptions
            </Text>
            {assumptions.map((assumption) => (
              <Text key={assumption} type="supporting">
                {assumption}
              </Text>
            ))}
          </div>
        )}
        {caveat && <Text type="supporting">{caveat}</Text>}
        {sourceRefs.length > 0 && (
          <div className={styles.sources}>
            {sourceRefs.map((name) => (
              <SourceChip key={name} name={name} />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
