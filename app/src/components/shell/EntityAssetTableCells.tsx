import type { ReactNode } from 'react';
import { pixel, proportional, type TableColumn } from '@astryxdesign/core/Table';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import { Text } from '@astryxdesign/core/Text';
import { AssetIdentity } from './AssetIdentity';
import type { MarketAsset } from '../../engine/assetDiscovery';

// Astryx's Table<T> constrains T to Record<string, unknown> — MarketAsset
// (a plain domain interface, engine/assetDiscovery.ts) has no index
// signature of its own. Redeclaring it here as an interface extension
// (not a cast) is the standard TS pattern for satisfying a generic
// constraint on an existing type without touching its source, which is
// shared by grid/strips/other consumers that have no need for this.
export interface Row extends MarketAsset {
  [key: string]: unknown;
}

export type SortableHeader = (key: string, label: string) => ReactNode;

// Column widths use Table's `proportional(n)` (relative share, ~fr unit),
// not raw percent strings — ColumnWidth only accepts ProportionalWidth |
// PixelWidth. The `n` values below carry over the original percentages
// as relative shares, preserving the same visual ratios.

// Sortable header renderer with click handler and sort indicator. Shared
// by every category's column set (EntityAssetTableColumns.tsx) and the
// Asset column below.
export function buildSortableHeader(sortKey: string | null, sortDir: 'asc' | 'desc', onHeaderClick: (key: string) => void): SortableHeader {
  return (key, label) => (
    <button
      onClick={() => onHeaderClick(key)}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        color: 'inherit',
        fontSize: 'inherit',
        fontWeight: 'inherit',
        whiteSpace: 'nowrap',
      }}
      type="button"
    >
      {label}
      {sortKey === key && (
        <Icon icon={sortDir === 'asc' ? 'arrowUp' : 'arrowDown'} size="sm" style={{ marginLeft: 'var(--space-4)', color: 'var(--accent-signal)' }} />
      )}
    </button>
  );
}

// Asset cell (always present, every category) — fixed 260px. No longer
// pinned to the table's start edge (removed 2026-08-07, direct feedback) —
// scrolls with the rest of the row like every other column.
export function buildAssetCell(onOpenDetail: (id: string) => void, sortableHeader: SortableHeader): TableColumn<Row> {
  return {
    key: 'name',
    header: sortableHeader('name', 'Asset'),
    width: pixel(260),
    align: 'start',
    renderCell: (asset: Row) => (
      <button
        type="button"
        onClick={() => onOpenDetail(asset.id)}
        style={{ display: 'block', width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
      >
        <AssetIdentity id={asset.id} name={asset.name} type={asset.type} />
      </button>
    ),
  };
}

// Delta cell (directional for crypto/commodities, muted for others) — used
// only by the default/all-category column set; crypto's own 24h/7d
// columns (EntityAssetTableColumns.tsx) are distinct metrics, not this.
export function buildDeltaCell(isCryptoOrStockOrCommodity: boolean): TableColumn<Row> {
  return {
    key: 'delta',
    header: '24h Δ',
    width: proportional(18),
    align: 'end',
    renderCell: (asset: Row) => {
      const isUp = asset.deltaRecent >= 0;
      const sign = asset.deltaRecent > 0 ? '+' : '';
      // Text's own `color` prop has no semantic success/error member (only
      // primary/secondary/disabled/placeholder/accent/inherit) — a direct
      // CSS-var style is the workaround, same as the crypto column set.
      const deltaColor = isCryptoOrStockOrCommodity ? (isUp ? 'var(--delta-up)' : 'var(--delta-down)') : undefined;
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--space-4)' }}>
          <Icon icon={isUp ? 'arrowUp' : 'arrowDown'} size="sm" color={isUp ? 'success' : 'error'} />
          <Text type="supporting" color={deltaColor ? 'inherit' : 'secondary'} style={deltaColor ? { color: deltaColor } : undefined} hasTabularNumbers>
            {sign}
            {asset.deltaRecent.toFixed(2)}pp
          </Text>
        </div>
      );
    },
  };
}

// Watch cell (always present, every category)
export function buildWatchCell(onWatch: (id: string, name: string) => void): TableColumn<Row> {
  return {
    key: 'watch',
    header: '',
    width: proportional(12),
    align: 'end',
    renderCell: (asset: Row) => (
      <IconButton label={`Watch ${asset.name}`} tooltip="Add to watchlist" icon={<Icon icon="checkDouble" size="sm" />} variant="ghost" size="sm" onClick={() => onWatch(asset.id, asset.name)} />
    ),
  };
}
