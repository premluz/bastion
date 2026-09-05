import { proportional, type TableColumn } from '@astryxdesign/core/Table';
import { Text } from '@astryxdesign/core/Text';
import { AssetTrendGlyph } from '../nodes/AssetTrendGlyph';
import type { Row, SortableHeader } from './EntityAssetTableCells';

// Category-specific column sets (EntityAssetTable.tsx's own comment):
// bonds/real-estate use yield-first register (yield, rating, outstanding);
// the default/all-category set falls back to price-or-yield. Crypto's own
// (larger) CMC-style set lives in EntityAssetTableCryptoColumns.tsx — split
// out separately to stay under the 200-line file budget. Pure functions,
// no state, same column shapes as before extraction. Widths use
// `proportional(n)` (relative share), not raw percent strings — see
// EntityAssetTableCells.tsx's own comment on why.
//
// Trend column passes `seed={asset.id}` (2026-08-31, direct feedback:
// "sparklines in table Discover Assets should also be generated like
// those in cards") — matching AssetCardVisual.tsx's own AssetTrendGlyph
// call exactly, so table rows draw from the same generateWalk generator
// as card rows rather than asset.sparklinePoints (a differently-shaped
// mockSparkline series carried on the Row itself).

// Bonds/Credit Funds: Yield, Credit Rating, Outstanding, Trend
export function buildBondColumns(sortableHeader: SortableHeader): TableColumn<Row>[] {
  return [
    {
      key: 'yield',
      header: sortableHeader('yield', 'Yield'),
      width: proportional(13),
      align: 'end',
      renderCell: (asset: Row) => (
        <Text type="body" weight="semibold" hasTabularNumbers>
          {asset.yield !== undefined ? `${asset.yield.toFixed(1)}%` : '—'}
        </Text>
      ),
    },
    {
      key: 'rating',
      header: sortableHeader('creditRating', 'Rating'),
      width: proportional(12),
      align: 'center',
      renderCell: (asset: Row) => <Text type="supporting" color="secondary">{asset.creditRating ?? '—'}</Text>,
    },
    {
      key: 'outstanding',
      header: sortableHeader('outstanding', 'Outstanding'),
      width: proportional(13),
      align: 'end',
      renderCell: (asset: Row) => (
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {asset.outstanding ?? '—'}
        </Text>
      ),
    },
    {
      key: 'trend',
      header: 'Trend',
      width: proportional(14),
      renderCell: (asset: Row) => <AssetTrendGlyph variant="inline" seed={asset.id} isUp={asset.deltaRecent >= 0} />,
    },
  ];
}

// Real Estate: Yield, Distribution Frequency, Outstanding, Trend
export function buildRealEstateColumns(sortableHeader: SortableHeader): TableColumn<Row>[] {
  return [
    {
      key: 'yield',
      header: sortableHeader('yield', 'Yield'),
      width: proportional(13),
      align: 'end',
      renderCell: (asset: Row) => (
        <Text type="body" weight="semibold" hasTabularNumbers>
          {asset.yield !== undefined ? `${asset.yield.toFixed(1)}%` : '—'}
        </Text>
      ),
    },
    {
      key: 'frequency',
      header: sortableHeader('distributionFrequency', 'Distribution'),
      width: proportional(13),
      align: 'center',
      renderCell: (asset: Row) => <Text type="supporting" color="secondary">{asset.distributionFrequency ?? '—'}</Text>,
    },
    {
      key: 'outstanding',
      header: sortableHeader('outstanding', 'Outstanding'),
      width: proportional(13),
      align: 'end',
      renderCell: (asset: Row) => (
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {asset.outstanding ?? '—'}
        </Text>
      ),
    },
    {
      key: 'trend',
      header: 'Trend',
      width: proportional(14),
      renderCell: (asset: Row) => <AssetTrendGlyph variant="inline" seed={asset.id} isUp={asset.deltaRecent >= 0} />,
    },
  ];
}

// All/View-all: Price-or-Yield, 24h Δ (deltaCell, built by the caller), Trend
export function buildDefaultColumns(sortableHeader: SortableHeader, deltaCell: TableColumn<Row>): TableColumn<Row>[] {
  return [
    {
      key: 'priceOrYield',
      header: sortableHeader('price', 'Price/Yield'),
      width: proportional(18),
      align: 'end',
      renderCell: (asset: Row) => (
        <Text type="body" weight="semibold" hasTabularNumbers>
          {asset.price ? `$${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `${asset.yield?.toFixed(1) ?? '—'}%`}
        </Text>
      ),
    },
    deltaCell,
    {
      key: 'trend',
      header: 'Trend',
      width: proportional(16),
      renderCell: (asset: Row) => <AssetTrendGlyph variant="inline" seed={asset.id} isUp={asset.deltaRecent >= 0} />,
    },
  ];
}
