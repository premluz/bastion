import { useMemo } from 'react';
import { List, ListItem } from '@astryxdesign/core/List';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Icon } from '@astryxdesign/core/Icon';
import { ToggleButton, ToggleButtonGroup } from '@astryxdesign/core/ToggleButton';
import entitiesJson from '../../../universe/entities.json';
import { useWatchlistStore } from '../../engine/stores/watchlistStore';
import { usePageStore } from '../../engine/stores/pageStore';
import { submitQuery } from '../../engine/submitQuery';
import { createKeywordResolver } from '../../engine/resolver/keywordResolver';
import { findMarketAsset } from '../../engine/assetDiscovery';
import { PageShell } from './PageShell';
import { PageSection } from './PageSection';
import { EntityAssetGrid } from './EntityAssetGrid';
import { EntityAssetTable } from './EntityAssetTable';
import { GridViewIcon } from './GridViewIcon';
import animatedItemStyles from './AnimatedListItem.module.css';

interface UniverseEntityRecord {
  intent?: string;
}

const intentById = new Map(
  Object.entries(entitiesJson as Record<string, UniverseEntityRecord>).map(([id, record]) => [id, record.intent]),
);

const SOURCE_LABEL = { seeded: 'Seeded', manual: 'Added', alert: 'From alert' } as const;

type View = 'table' | 'grid';
const PAGE_UI_KEY = 'watchlist';

function isView(value: unknown): value is View {
  return value === 'table' || value === 'grid';
}

// Page (Phase 8H, rehomed verbatim from Phase 8G's WatchlistPane; grid/
// table follow-up 2026-09-02, direct feedback: "watchlist page itself
// should have grid and table mode and default to grid mode"). Seeded
// entities (universe/watchlist.json, fictional statuses authored there)
// plus anything watched this session — from an entity-header, the
// Entities page, or automatically once a Monitor-module turn lands
// (presentScene.ts). Session-scoped: nothing here survives a reset,
// stated in the empty state's own copy, not a modal.
//
// Split by real data availability, not lumped together: findMarketAsset
// only resolves entities in assetDiscovery.ts's own MARKET_ENTITY_IDS
// list (real authored price/yield series) — a watched entity from
// elsewhere (e.g. the seeded "kestrel-holdings," alert-tracked entities)
// has no price/type/category/sparkline to render as a Discover-style
// card/row at all. Those render in the existing plain-List section below
// the grid/table (2026-09-02 confirmed: "keep them in a simple list
// section," not silently dropped) — the same honest "not yet available"
// posture Entity Detail's own missing-TradableAsset state already holds,
// not a fabricated fallback.
export function WatchlistPage() {
  const items = useWatchlistStore((state) => state.items);
  const resolver = useMemo(() => createKeywordResolver(), []);
  const openEntityDetail = usePageStore((state) => state.openEntityDetail);
  const storedView = usePageStore((state) => state.pageUiState[PAGE_UI_KEY]?.view);
  const view = isView(storedView) ? storedView : 'grid';
  const setPageUiState = usePageStore((state) => state.setPageUiState);
  const setView = (value: View) => setPageUiState(PAGE_UI_KEY, { view: value });

  const rows = useMemo(() => Object.values(items).sort((a, b) => b.watchedAt.localeCompare(a.watchedAt)), [items]);

  const { marketAssets, plainRows } = useMemo(() => {
    const resolved: NonNullable<ReturnType<typeof findMarketAsset>>[] = [];
    const plain: typeof rows = [];
    for (const item of rows) {
      const asset = findMarketAsset(item.entityId);
      if (asset) resolved.push(asset);
      else plain.push(item);
    }
    return { marketAssets: resolved, plainRows: plain };
  }, [rows]);

  if (rows.length === 0) {
    return (
      <PageShell title="Watchlist">
        <EmptyState
          title="Nothing watched yet"
          description="Watch an entity from its header or the Entities page to track it here — session-scoped, nothing persists after a reset."
        />
      </PageShell>
    );
  }

  const viewToggle = (
    <ToggleButtonGroup label="Switch view" type="single" value={view} onChange={(value) => setView(value === 'table' ? 'table' : 'grid')}>
      <ToggleButton value="table" label="Table view" isIconOnly icon={<Icon icon="viewColumns" size="sm" />} />
      <ToggleButton value="grid" label="Grid view" isIconOnly icon={<Icon icon={GridViewIcon} size="sm" />} />
    </ToggleButtonGroup>
  );

  return (
    <PageShell title="Watchlist">
      {marketAssets.length > 0 && (
        <PageSection title="Watched assets" actions={viewToggle}>
          {view === 'table' ? (
            <EntityAssetTable assets={marketAssets} onOpenDetail={openEntityDetail} />
          ) : (
            <EntityAssetGrid assets={marketAssets} onOpenDetail={openEntityDetail} />
          )}
        </PageSection>
      )}

      {plainRows.length > 0 && (
        <PageSection title="Other tracked entities">
          <List hasDividers density="compact">
            {plainRows.map((item, index) => {
              const intent = intentById.get(item.entityId);
              return (
                <ListItem
                  key={item.entityId}
                  className={animatedItemStyles.animatedItem}
                  style={{ '--item-index': index } as React.CSSProperties}
                  label={item.label}
                  description={`${item.status} · ${SOURCE_LABEL[item.source]}`}
                  endContent={intent ? <Icon icon="externalLink" size="sm" /> : undefined}
                  {...(intent ? { onClick: () => void submitQuery(intent, resolver) } : {})}
                />
              );
            })}
          </List>
        </PageSection>
      )}
    </PageShell>
  );
}
