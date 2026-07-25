import { Fragment } from 'react';
import { Item } from '@astryxdesign/core/Item';
import { Divider } from '@astryxdesign/core/Divider';
import { Badge } from '@astryxdesign/core/Badge';
import { Text } from '@astryxdesign/core/Text';
import { Sparkline } from '../nodes/Sparkline';
import { AssetLogo } from './AssetLogo';

export interface DiscoveryRow {
  id: string;
  name: string;
  detail: string;
  value: string;
  sparklinePoints?: { x: string; y: number }[];
  intent?: string;
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
// right per feedback; previously left). A Divider (Astryx's own
// separator, not a hand-rolled border) sits between rows, not after the
// last one. Every row hovers — even the ones with nothing to click
// (`.astryx-item:hover` in theme.default.css, unconditional/all-themes,
// same "consumed as-is" precedent as the list-item hover rule beside
// it) — a deliberate, explicit exception to the earlier "no hover
// implying an action that isn't there" rule (WatchlistPage.tsx): here
// hover is honestly just "this row is legible/scannable," never framed
// as a click affordance via cursor, so the two rules don't actually
// conflict — this one just isn't cursor-driven. Rows that do carry a
// real intent additionally get a genuine onClick, which layers Item's
// own native interactive styling on top for free.
function DiscoveryStripList({
  rows,
  emptyLabel,
  onInvestigate,
}: {
  rows: DiscoveryRow[];
  emptyLabel: string;
  onInvestigate: (intent: string) => void;
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
        return (
          <Fragment key={row.id}>
            {index > 0 && <Divider variant="subtle" />}
            <Item
              density="compact"
              startContent={<AssetLogo id={row.id} />}
              label={row.name}
              description={row.detail}
              endContent={
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
                  {row.sparklinePoints && <Sparkline points={row.sparklinePoints} />}
                  <Text hasTabularNumbers>{row.value}</Text>
                </div>
              }
              {...(intent ? { onClick: () => onInvestigate(intent) } : {})}
            />
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
        <DiscoveryStripList rows={movers} emptyLabel="No market data this session." onInvestigate={onInvestigate} />
      </div>

      <div style={{ display: 'grid', gap: 'var(--space-8)' }}>
        <Text type="label">Trending</Text>
        <DiscoveryStripList rows={trending} emptyLabel="Nothing cited yet this session." onInvestigate={onInvestigate} />
      </div>

      <div style={{ display: 'grid', gap: 'var(--space-8)' }}>
        <Text type="label">Newly Added</Text>
        <DiscoveryStripList rows={newlyAdded} emptyLabel="Nothing to show." onInvestigate={onInvestigate} />
      </div>
    </div>
  );
}
