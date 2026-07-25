import { Text } from '@astryxdesign/core/Text';
import { TimeSeries } from '../nodes/TimeSeries';
import { MetricGrid } from '../nodes/MetricGrid';
import { Metric } from '../nodes/Metric';
import { Panel } from '../nodes/Panel';
import type { EntityDetail } from '../../engine/entityDetail';

const STATS_ATTRIBUTE_COUNT = 4;

function formatDelta(deltaRecent: number): string {
  const sign = deltaRecent > 0 ? '+' : '';
  return `${sign}${deltaRecent.toFixed(2)}`;
}

// Split out of EntityDetailPage.tsx (Phase 16 revision) to stay under the
// 200-line file budget — Trend (dual-axis time-series, real second
// dimension when the dataset has one) and the denser Statistics
// metric-grid share the same "what's the primary number" derivation, so
// they stay one component rather than two that would each re-derive it.
export function EntityTrendStats({ entity }: { entity: EntityDetail }) {
  const primaryLabel = entity.isUniverseEntity ? entity.primary?.label ?? 'Value' : 'Trend';
  const primaryKeyword = primaryLabel.split(' ')[0]?.toLowerCase();
  // Drop the one attribute that exactly restates the primary metric
  // already shown above — matched by VALUE, not label wording. A label
  // test was tried first and got it wrong twice live: an exact-string
  // match missed South Bow's own "Latest price" attribute (same $40.34
  // the chart already shows, different wording); a substring match
  // over-corrected and also dropped its genuinely distinct "Dividend
  // yield" fact. The two facts that are actually duplicates always share
  // the same number once formatting (currency signs, %, commas) is
  // stripped — that's the real test, not what the label happens to say.
  const primaryValueText = entity.primaryLatest !== undefined ? entity.primaryLatest.toFixed(2) : undefined;
  function isDuplicateOfPrimary(value: string | number): boolean {
    if (primaryValueText === undefined) return false;
    const numeric = Number(String(value).replace(/[^0-9.-]/g, ''));
    return !Number.isNaN(numeric) && numeric.toFixed(2) === primaryValueText;
  }
  // Drop long-form values too (South Bow's own "Sector" description ran
  // to a full sentence and broke the metric-grid's terse-numeral layout,
  // also caught live) — Metric is built for short facts; a paragraph-
  // length value belongs in About only, where it already is.
  const statsAttributes = entity.attributes
    .filter((attribute) => !isDuplicateOfPrimary(attribute.value))
    .filter((attribute) => String(attribute.value).length <= 24)
    .slice(0, STATS_ATTRIBUTE_COUNT);

  return (
    <>
      {entity.primary && entity.primary.points.length >= 2 && (
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
      )}

      <Panel title="Statistics">
        {entity.primaryLatest !== undefined || statsAttributes.length > 0 ? (
          <MetricGrid>
            {entity.primaryLatest !== undefined && <Metric label={primaryLabel} value={entity.primaryLatest.toFixed(2)} />}
            {entity.deltaRecent !== undefined && <Metric label="Recent move" value={formatDelta(entity.deltaRecent)} />}
            {statsAttributes.map((attribute) => (
              <Metric key={attribute.label} label={attribute.label} value={attribute.value} />
            ))}
          </MetricGrid>
        ) : (
          <Text type="supporting" color="secondary">
            No statistics available for this entry.
          </Text>
        )}
      </Panel>
    </>
  );
}
