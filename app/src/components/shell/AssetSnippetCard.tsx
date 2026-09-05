import { Text } from '@astryxdesign/core/Text';
import { MetricGrid } from '../nodes/MetricGrid';
import { Metric } from '../nodes/Metric';
import { Panel } from '../nodes/Panel';
import type { Snippet } from '../../contracts/tradableAsset';

// Shell-level component, NOT a registry node — same reuse posture as
// AssetKeyStatsTable (Phase 20 scope correction). classSpecificFields is
// a KeyStat[] (label/value), the exact shape EntityAbout.tsx already
// established MetricGrid+Metric for.
export function AssetSnippetCard({ snippet }: { snippet: Snippet }) {
  return (
    <Panel title="About">
      <Text type="body">{snippet.description}</Text>
      {snippet.classSpecificFields.length > 0 && (
        <MetricGrid minWidth={120} maxColumns={6}>
          {snippet.classSpecificFields.map((field) => (
            <Metric key={field.label} label={field.label} value={field.value} size="compact" />
          ))}
        </MetricGrid>
      )}
    </Panel>
  );
}
