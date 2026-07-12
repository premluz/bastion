import { Text } from '@astryxdesign/core/Text';
import { confidenceQualifier, type Confidence } from '../../contracts/thinking';

// Trail-side sibling of the (Phase 7) confidence-meter node — same
// instrument register, smaller form. Compact value + qualifier, never a
// gauge here.
export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  return (
    <Text type="supporting" hasTabularNumbers>
      {`${confidence.toFixed(2)} · ${confidenceQualifier(confidence)}`}
    </Text>
  );
}
