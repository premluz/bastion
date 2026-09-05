import { Text } from '@astryxdesign/core/Text';
import { MetricGrid } from '../nodes/MetricGrid';
import { Metric } from '../nodes/Metric';
import { Panel } from '../nodes/Panel';
import type { KeyStat } from '../../contracts/tradableAsset';

// Shell-level component, NOT a registry node (Phase 20 scope correction,
// logged in node-vocabulary.md/STATE.md) — KeyStat is a label/value fact
// grid, the exact shape EntityAbout.tsx/EntityStatistics.tsx already
// established a reuse pattern for (MetricGrid+Metric, Merlin's own
// existing registry nodes). Building a second label/value primitive
// would violate "search before you create."
export function AssetKeyStatsTable({ title, stats }: { title: string; stats: KeyStat[] }) {
  return (
    <Panel title={title}>
      {stats.length === 0 ? (
        <Text type="supporting" color="secondary">
          No statistics authored for this asset.
        </Text>
      ) : (
        <MetricGrid minWidth={120} maxColumns={6}>
          {stats.map((stat) => (
            <Metric key={stat.label} label={stat.label} value={stat.value} size="compact" />
          ))}
        </MetricGrid>
      )}
    </Panel>
  );
}
