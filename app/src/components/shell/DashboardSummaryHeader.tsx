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
// Card variant "panelFlat" (direct feedback, 2026-08-08: "still see
// recommended in portfolio as old panel with bg rather than like Book
// summary" — Book summary is a Panel node, panelFlat, outline-only). This
// header had been left on Astryx's bare `default` variant since Phase 13
// first wrote it — a separate component from SceneSummary, so an earlier
// pass's fix never reached this one. Was briefly panelProvisional (a
// same-day intermediate fix) before that class was retired entirely by
// direct order — see theme.default.css's own note on panelFlat. Label color
// dropped from accent to plain ink for the same reason as the other two
// fixes: accent is reserved for real signal, not a routine section label.
export function DashboardSummaryHeader({ recommendation, confidence, confidenceLabel, sourceRefs, assumptions, caveat }: DashboardSummaryHeaderProps) {
  return (
    <Card variant="default" padding={4} className="panelFlat">
      <div style={{ display: 'grid', gap: 'var(--space-12)' }}>
        <Text type="label">Recommended</Text>
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
