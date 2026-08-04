import { Fragment } from 'react';
import { Item } from '@astryxdesign/core/Item';
import { Divider } from '@astryxdesign/core/Divider';
import { Badge } from '@astryxdesign/core/Badge';
import { Text } from '@astryxdesign/core/Text';
import { Sparkline } from '../nodes/Sparkline';
import { AssetLogo } from './AssetLogo';
import { AnimatedListItem } from './AnimatedListItem';
import { TrendDelta } from './TrendDelta';

export interface DiscoveryRow {
  id: string;
  name: string;
  detail: string;
  value: string;
  sparklinePoints?: { x: string; y: number }[];
  intent?: string;
  // Point-over-point delta (deltaRecent — see EntitiesPage.tsx's
  // isMomentumCategory), rendered via TrendDelta as a percentage
  // regardless of the underlying metric (direct feedback, 2026-08-01: one
  // consistent "%" reading, no "pp" variant). Populated only for crypto/
  // asset/commodities rows (mostly crypto and equity) — bonds/real-estate/
  // credit-funds have no comparable momentum metric, so this stays unset
  // there rather than showing a meaningless trend.
  deltaPercent?: number;
}

interface EntityDiscoveryStripsProps {
  movers: DiscoveryRow[];
  trending: DiscoveryRow[];
  newlyAdded: DiscoveryRow[];
  onInvestigate: (intent: string) => void;
}

// Three top strips (Phase 14; unified-template + naming follow-up,
// 2026-07-20), one shared row shape (DiscoveryRow) and one shared row
// renderer — direct feedback asked for the same "item" template
// everywhere rather than Notable movers alone having the rich treatment.
// Row anatomy: AssetLogo (rounded-square color swatch — no real logos
// exist, see that file's own comment) as startContent, name + detail as
// label/description, Sparkline + value as endContent (moved to the
// right per feedback; previously left). Each row wraps in AnimatedListItem
// for staggered entrance. A Divider (Astryx's own separator, not a
// hand-rolled border) sits between rows, not after the last one. Every row
// hovers — even the ones with nothing to click (`.astryx-item:hover` in
// theme.default.css, unconditional/all-themes, same "consumed as-is"
// precedent as the list-item hover rule beside it) — a deliberate,
// explicit exception to the earlier "no hover implying an action that
// isn't there" rule (WatchlistPage.tsx): here hover is honestly just
// "this row is legible/scannable," never framed as a click affordance via
// cursor, so the two rules don't actually conflict.
function DiscoveryStripList({
  rows,
  emptyLabel,
  onInvestigate,
  startIndex,
}: {
  rows: DiscoveryRow[];
  emptyLabel: string;
  onInvestigate: (intent: string) => void;
  startIndex: number;
}) {
  if (rows.length === 0) {
    return (
      <Text type="supporting" color="secondary">
        {emptyLabel}
      </Text>
    );
  }
  return (
    <>
      {rows.map((row, index) => {
        const intent = row.intent;
        const animationIndex = startIndex + index;
        return (
          <Fragment key={row.id}>
            {index > 0 && <Divider variant="subtle" />}
            <AnimatedListItem index={animationIndex}>
              <Item
                density="compact"
                startContent={<AssetLogo id={row.id} />}
                label={row.name}
                description={row.detail}
                endContent={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
                    {row.sparklinePoints && <Sparkline points={row.sparklinePoints} />}
                    <div style={{ display: 'grid', justifyItems: 'end', gap: 'var(--space-4)' }}>
                      <Text hasTabularNumbers>{row.value}</Text>
                      {row.deltaPercent !== undefined && <TrendDelta value={row.deltaPercent} />}
                    </div>
                  </div>
                }
                style={intent ? { cursor: 'pointer' } : undefined}
                {...(intent ? { onClick: () => onInvestigate(intent) } : {})}
              />
            </AnimatedListItem>
          </Fragment>
        );
      })}
    </>
  );
}

export function EntityDiscoveryStrips({ movers, trending, newlyAdded, onInvestigate }: EntityDiscoveryStripsProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-24)' }}>
      <div style={{ display: 'grid', gap: 'var(--space-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
          <Text type="label">Notable movers</Text>
          <Badge variant="neutral" label="24H" />
        </div>
        <DiscoveryStripList rows={movers} emptyLabel="No market data this session." onInvestigate={onInvestigate} startIndex={0} />
      </div>

      <div style={{ display: 'grid', gap: 'var(--space-8)' }}>
        <Text type="label">Trending</Text>
        <DiscoveryStripList rows={trending} emptyLabel="Nothing cited yet this session." onInvestigate={onInvestigate} startIndex={movers.length} />
      </div>

      <div style={{ display: 'grid', gap: 'var(--space-8)' }}>
        <Text type="label">Newly Added</Text>
        <DiscoveryStripList rows={newlyAdded} emptyLabel="Nothing to show." onInvestigate={onInvestigate} startIndex={movers.length + trending.length} />
      </div>
    </div>
  );
}
