import { Text } from '@astryxdesign/core/Text';
import { MetricGrid } from '../nodes/MetricGrid';
import { Metric } from '../nodes/Metric';
import { Panel } from '../nodes/Panel';
import type { EntityDetail } from '../../engine/entityDetail';

// Split out of EntityDetailPage.tsx (2026-07-29: Statistics + About in a
// two-column flex row pushed the page over the 200-line budget) — same
// extraction reasoning as EntityTrend.tsx/EntityStatistics.tsx.
export function EntityAbout({ entity }: { entity: EntityDetail }) {
  return (
    <Panel title="About">
      {entity.attributes.length === 0 ? (
        <Text type="supporting" color="secondary">
          No further profile authored for this entry.
        </Text>
      ) : (
        // Same component as Trend/Statistics (direct order, 2026-07-27:
        // "use the same component wherever this is used") — compact size
        // (smaller numeral than Statistics' hero display-3) and a wider,
        // denser grid (up to 6 columns vs Statistics' 4, auto-fit
        // reflows down to ~3 on a narrower column) fit this page's
        // fuller fact list without shrinking to illegible text.
        <MetricGrid minWidth={120} maxColumns={6}>
          {entity.attributes.map((attribute) => (
            <Metric key={attribute.label} label={attribute.label} value={attribute.value} size="compact" />
          ))}
        </MetricGrid>
      )}
    </Panel>
  );
}
