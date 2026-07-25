import { Card } from '@astryxdesign/core/Card';
import { Blockquote } from '@astryxdesign/core/Blockquote';
import { Text } from '@astryxdesign/core/Text';
import { SourceChip } from '../trail/SourceChip';
import { ConfidenceMeter } from './ConfidenceMeter';
import type { SceneSummaryProps } from '../../contracts/props/scene-summary';
import styles from './SceneSummary.module.css';

export function SceneSummary({
  recommendation,
  investigationSummary,
  confidence,
  confidenceLabel,
  sourceRefs,
  assumptions,
  caveat
}: SceneSummaryProps) {
  return (
    <div style={{ display: 'grid', gap: 'var(--space-12)' }}>
      {/* Confidence pane — full width, top */}
      <Card variant="default" padding={4}>
        <div style={{ display: 'grid', gap: 'var(--space-12)' }}>
          {/* Row 1: Confidence chart (left) + Details table (right) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-12)' }}>
            <div>
              <ConfidenceMeter label={confidenceLabel} value={confidence} />
            </div>
            <div style={{ display: 'grid', gap: 'var(--space-8)' }}>
              <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)' }}>
                  <div>
                    <Text type="supporting" color="secondary">Sources</Text>
                    <Text type="supporting">{sourceRefs.length > 0 ? sourceRefs.length : '—'}</Text>
                  </div>
                  <div>
                    <Text type="supporting" color="secondary">Assumptions</Text>
                    <Text type="supporting">{assumptions?.length || 0}</Text>
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                <Text type="supporting" color="secondary">Unknowns</Text>
                <Text type="supporting">—</Text>
              </div>
            </div>
          </div>
          {/* Row 2: Caveat + sources caption */}
          {(caveat || sourceRefs.length > 0) && (
            <div style={{ display: 'grid', gap: 'var(--space-8)' }}>
              {caveat && <Text type="supporting">{caveat}</Text>}
              {sourceRefs.length > 0 && (
                <div className={styles.sources}>
                  {sourceRefs.map((name) => (
                    <SourceChip key={name} name={name} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Summary + Recommendation row — 2 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-12)' }}>
        {/* Summary pane — left */}
        {investigationSummary && (
          <Card variant="default" padding={4}>
            <div style={{ display: 'grid', gap: 'var(--space-8)' }}>
              <Text type="label" color="accent">
                Summary
              </Text>
              <Text type="body" style={{ fontFamily: 'var(--face-voice)' }}>
                {investigationSummary}
              </Text>
            </div>
          </Card>
        )}
        {/* Recommendation pane — right */}
        <Card variant="default" padding={4}>
          <div style={{ display: 'grid', gap: 'var(--space-8)' }}>
            <Text type="label" color="accent">
              Recommended
            </Text>
            <Blockquote style={{ fontFamily: 'var(--face-voice)' }}>{recommendation}</Blockquote>
          </div>
        </Card>
      </div>
    </div>
  );
}
