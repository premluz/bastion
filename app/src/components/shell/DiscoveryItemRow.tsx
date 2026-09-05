import { Item } from '@astryxdesign/core/Item';
import { Text } from '@astryxdesign/core/Text';
import { AssetTrendGlyph, seriesIsUp } from '../nodes/AssetTrendGlyph';
import { AssetLogo } from '../nodes/AssetLogo';
import { TrendDelta } from '../nodes/TrendDelta';
import styles from './DiscoveryItemRow.module.css';

export interface DiscoveryRow {
  id: string;
  name: string;
  detail: string;
  value: string;
  sparklinePoints?: { x: string; y: number }[];
  // Point-over-point delta (deltaRecent — see EntitiesPage.tsx's
  // isMomentumCategory), rendered via TrendDelta as a percentage
  // regardless of the underlying metric (direct feedback, 2026-08-01: one
  // consistent "%" reading, no "pp" variant). Populated only for crypto/
  // asset/commodities rows (mostly crypto and equity) — bonds/real-estate/
  // credit-funds have no comparable momentum metric, so this stays unset
  // there rather than showing a meaningless trend.
  deltaPercent?: number;
}

// The Item row shared by every "entity + trend" list on the site
// (2026-08-19, direct feedback: "actually in related use item comp that
// is used in notable movers... if we have this as comp that item that's
// great lets have it in peers") — extracted out of EntityDiscoveryStrips.
// tsx's own DiscoveryStripList, which now imports this instead of
// authoring the row inline; RelatedEntitiesStrip.tsx (Peers) is the
// second real consumer this was extracted FOR, not a speculative reuse.
// AssetLogo startContent, name/detail label/description, sparkline+value+
// delta endContent, exactly as Notable Movers/Trending/Newly Added
// already established. Click always browses to the entity's own detail
// page (onOpenDetail(row.id)) — same "browse first" law both existing
// consumers already followed.
//
// Sparkline hides responsively when the row's own container gets too
// narrow to show it alongside the value/delta column legibly (2026-08-19,
// same-round follow-up: "if not enough room (width) then sparkline should
// be hidden as responsive behaviour") — a NEW need this component
// introduces: the three original strips always sat in a 440px-minimum
// column (EntityDiscoveryStrips.module.css's own floor), wide enough that
// the sparkline was never actually threatened there, but Peers sits in a
// narrower half-width pairRow column on Entity Detail, genuinely tight
// enough to need this. container-type on .container (a wrapper around
// EACH row, not a shared list-level container) — querying and containing
// must be different elements, the same finding this app confirmed live
// multiple times this same day; putting container-type on the row itself
// and querying its own child would repeat that exact bug.
export function DiscoveryItemRow({ row, onOpenDetail }: { row: DiscoveryRow; onOpenDetail: (id: string) => void }) {
  return (
    <div className={styles.container}>
      <Item
        density="compact"
        startContent={<AssetLogo id={row.id} />}
        label={row.name}
        description={row.detail}
        endContent={
          <div className={styles.endContent}>
            {row.sparklinePoints && (
              <div className={styles.sparklineSlot}>
                {/* AssetTrendGlyph, not the registry Sparkline node
                    (2026-08-30): the four entity surfaces — this strip,
                    the Discover table, the Discover card, Entity Detail —
                    now share one directional gradient treatment.

                    Direction follows the SAME value this row displays as
                    its delta, never a separately-derived one: a glyph
                    coloured by the series' own first-to-last direction
                    while the delta beside it reads point-over-point
                    produces rows that visibly contradict themselves (found
                    live in the table, where a red "-0.12pp" sat next to a
                    green glyph). Rows with no delta shown have nothing to
                    contradict, so those fall back to the series direction. */}
                <AssetTrendGlyph
                  variant="inline"
                  points={row.sparklinePoints}
                  isUp={row.deltaPercent !== undefined ? row.deltaPercent >= 0 : seriesIsUp(row.sparklinePoints)}
                />
              </div>
            )}
            <div className={styles.valueColumn}>
              <Text hasTabularNumbers>{row.value}</Text>
              {row.deltaPercent !== undefined && <TrendDelta value={row.deltaPercent} />}
            </div>
          </div>
        }
        className={styles.clickable}
        onClick={() => onOpenDetail(row.id)}
      />
    </div>
  );
}
