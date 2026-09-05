import { useState } from 'react';
import { Table } from '@astryxdesign/core/Table';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import styles from './EntityAssetTable.module.css';
import type { MarketAsset } from '../../engine/assetDiscovery';
import { type Row, buildSortableHeader, buildAssetCell, buildDeltaCell, buildWatchCell } from './EntityAssetTableCells';
import { buildCryptoColumns } from './EntityAssetTableCryptoColumns';
import { buildBondColumns, buildRealEstateColumns, buildDefaultColumns } from './EntityAssetTableColumns';

interface EntityAssetTableProps {
  assets: MarketAsset[];
  onOpenDetail: (id: string) => void;
  category?: string;
}

// Table view (default per direct feedback, 2026-07-26): same asset data,
// row shape, and click law as EntityAssetGrid — click anywhere on the
// Asset cell opens EntityDetailPage ("browse first, investigate second",
// Phase 16), Watch stays a trailing action, the up/down delta indicator
// is informational only, no CTA beside it (node-vocabulary.md's Entities
// entry, restated on EntityAssetGrid). Astryx's Table has no row-click
// prop of its own (composition via renderCell is the documented pattern,
// @astryxdesign/core/Table's own doc comment) — the Asset cell's own
// button is the row's click target, matching ClickableCard's role
// elsewhere on this page. Reuses Table directly rather than the
// scene-generic `data-table` registry node: that node's cell types
// (string/number/boolean/date/sparkline/entity) have no slot for a
// trailing Watch action or a click that opens EntityDetailPage instead of
// submitting an investigation — genuinely different job from an
// evidentiary in-scene table, same reasoning EntityAssetGrid itself
// doesn't route through a generic scene node either.
//
// Column definitions live in EntityAssetTableCells.tsx (shared Asset/
// Delta/Watch cells) and EntityAssetTableColumns.tsx (category-specific
// sets) — split out to stay under the file budget; this file owns only
// sort state and assembly.
export function EntityAssetTable({ assets, onOpenDetail, category }: EntityAssetTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  if (assets.length === 0) {
    return <EmptyState title="No assets in this category" description="Try a different filter." />;
  }

  const handleHeaderClick = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedAssets = sortKey
    ? [...assets].sort((a, b) => {
        const aVal = a[sortKey as keyof typeof a];
        const bVal = b[sortKey as keyof typeof b];
        if (aVal === undefined || aVal === null) return 1;
        if (bVal === undefined || bVal === null) return -1;
        const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : assets;

  // Category-specific column rendering: crypto/stocks/commodities use CMC-style price-ticker
  // register (Price, 24h%, 7d%, Market Cap, Volume); bonds/real-estate use yield-first
  // register (yield, rating, outstanding). All category shows cross-asset defaults.
  const isCryptoOrStockOrCommodity = category === 'crypto' || category === 'commodities' || category === 'asset';
  const isBondOrCreditFund = category === 'covered-bond' || category === 'credit-fund';
  const isRealEstate = category === 'real-estate';

  const sortableHeader = buildSortableHeader(sortKey, sortDir, handleHeaderClick);
  const assetCell = buildAssetCell(onOpenDetail, sortableHeader);
  const watchCell = buildWatchCell();

  const categoryColumns = isCryptoOrStockOrCommodity
    ? buildCryptoColumns(category, sortableHeader)
    : isBondOrCreditFund
      ? buildBondColumns(sortableHeader)
      : isRealEstate
        ? buildRealEstateColumns(sortableHeader)
        : buildDefaultColumns(sortableHeader, buildDeltaCell(isCryptoOrStockOrCommodity));

  const columns = [assetCell, ...categoryColumns, watchCell];
  const rows: Row[] = sortedAssets.map((asset) => ({ ...asset }));

  return (
    <div className={styles.root}>
      <div className={styles.animatedTable}>
        <Table<Row> data={rows} columns={columns} density="compact" dividers="rows" hasHover textOverflow="wrap" />
      </div>
    </div>
  );
}
