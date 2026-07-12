import { Blockquote } from '@astryxdesign/core/Blockquote';
import { Text } from '@astryxdesign/core/Text';
import { confidenceQualifier } from '../../contracts/thinking';
import type { RecommendationProps } from '../../contracts/props/recommendation';

// Voice face (Phase 8E, three-voice ruling) applies to the recommendation
// prose itself only — never the "Recommended" label, never confidence/
// caveat (those are data/UI facts about the recommendation, not the
// agent's interpretive language).
export function Recommendation({ text, confidence, caveat }: RecommendationProps) {
  return (
    <div style={{ display: 'grid', gap: 'var(--space-8)' }}>
      <Text type="label" color="accent">
        Recommended
      </Text>
      <Blockquote style={{ fontFamily: 'var(--face-voice)' }}>{text}</Blockquote>
      {confidence !== undefined && (
        <Text type="supporting" hasTabularNumbers>
          {`Confidence: ${confidence.toFixed(2)} (${confidenceQualifier(confidence)})`}
        </Text>
      )}
      {caveat && <Text type="supporting">{caveat}</Text>}
    </div>
  );
}
