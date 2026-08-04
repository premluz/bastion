import { proportional, type TableColumn } from '@astryxdesign/core/Table';
import { Text } from '@astryxdesign/core/Text';
import { Sparkline } from '../nodes/Sparkline';
import { TrendDelta } from './TrendDelta';
import type { Row, SortableHeader } from './EntityAssetTableCells';

// Crypto/Commodities: CMC-style columns — Price, 24h %, 7d % (with
// sparkline), Market Cap, Volume, Circulating Supply (crypto only). Split
// out of EntityAssetTableColumns.tsx (itself split out of
// EntityAssetTable.tsx) to keep every file under the 200-line budget —
// this is the single largest category column set. Widths use
// `proportional(n)`, not raw percent strings — see EntityAssetTableCells.
// tsx's own comment on why.
export function buildCryptoColumns(category: string | undefined, sortableHeader: SortableHeader): TableColumn<Row>[] {
  const columns: TableColumn<Row>[] = [
    {
      // Price + 24h delta merged into one cell (direct feedback,
      // 2026-08-01): the 24h %/7d % columns are gone as separate columns;
      // 7d % is dropped entirely, 24h's arrow+value moves underneath the
      // price instead of its own column.
      key: 'price',
      header: sortableHeader('price', 'Price'),
      width: proportional(12, { minWidth: 90 }),
      align: 'end',
      renderCell: (asset: Row) => (
        <div style={{ display: 'grid', justifyItems: 'end', gap: 'var(--space-4)' }}>
          <Text type="body" weight="semibold" hasTabularNumbers>
            {asset.price ? `$${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
          </Text>
          <TrendDelta value={asset.delta24hPercent ?? 0} />
        </div>
      ),
    },
    {
      key: 'trend',
      header: 'Trend',
      width: proportional(9, { minWidth: 64 }),
      renderCell: (asset: Row) => <Sparkline points={asset.sparklinePoints} />,
    },
    {
      key: 'marketCap',
      header: sortableHeader('marketCap', 'Market Cap'),
      width: proportional(13),
      align: 'end',
      renderCell: (asset: Row) => (
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {asset.marketCap ? `$${(asset.marketCap / 1000000000).toFixed(2)}B` : '—'}
        </Text>
      ),
    },
    {
      key: 'volume',
      header: sortableHeader('volume', 'Volume (24h)'),
      width: proportional(13),
      align: 'end',
      renderCell: (asset: Row) => (
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {asset.volume ? `$${(asset.volume / 1000000).toFixed(1)}M` : '—'}
        </Text>
      ),
    },
  ];

  // Circulating Supply only for crypto, not commodities
  if (category === 'crypto') {
    columns.push({
      key: 'supply',
      header: sortableHeader('circulatingSupply', 'Circulating Supply'),
      width: proportional(13),
      align: 'end',
      renderCell: (asset: Row) => (
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {asset.circulatingSupply ? `${(asset.circulatingSupply / 1000000).toFixed(1)}M` : '—'}
        </Text>
      ),
    });
  }

  return columns;
}
