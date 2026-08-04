import { TimeSeries } from '../nodes/TimeSeries';
import { Panel } from '../nodes/Panel';
import type { EntityDetail } from '../../engine/entityDetail';

function formatDelta(deltaRecent: number): string {
  const sign = deltaRecent > 0 ? '+' : '';
  return `${sign}${deltaRecent.toFixed(2)}`;
}

// Split out of EntityTrendStats.tsx (2026-07-29 order: Statistics and
// About sit side by side as flex columns in one row — Statistics can no
// longer be bundled with Trend as one vertically-stacked unit). Trend
// keeps its own file; EntityStatistics.tsx is its sibling. The two no
// longer share a derivation step — Trend only needs `primaryLabel` for
// its stat-strip caption, a one-line computation not worth a shared
// module for (EntityStatistics.tsx recomputes its own, larger
// derivation independently).
export function EntityTrend({ entity }: { entity: EntityDetail }) {
  if (!entity.primary || entity.primary.points.length < 2) return null;

  const primaryLabel = entity.isUniverseEntity ? (entity.primary?.label ?? 'Value') : 'Trend';
  const primaryKeyword = primaryLabel.split(' ')[0]?.toLowerCase();

  return (
    <Panel title="Trend">
      <TimeSeries
        data={{ kind: 'series', series: entity.secondary ? [entity.primary, entity.secondary] : [entity.primary] }}
        {...(entity.secondary ? { rightAxisSeriesId: entity.secondary.id } : {})}
        statStrip={[
          ...(entity.primaryLatest !== undefined ? [{ label: `Latest ${primaryKeyword}`, value: entity.primaryLatest.toFixed(2) }] : []),
          ...(entity.deltaRecent !== undefined ? [{ label: 'Recent move', value: formatDelta(entity.deltaRecent) }] : []),
        ]}
      />
    </Panel>
  );
}
