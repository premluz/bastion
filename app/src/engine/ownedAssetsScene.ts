import type { HydratedScene } from '../contracts/scene';
import type { AssetHomeRow } from './assetsHome';

export function ownedAssetsScene(rows: AssetHomeRow[], selectedAssetId?: string | null): HydratedScene {
  return { id: 'owned-assets', title: 'Your assets', intents: [], thinking: [], data: {},
    layout: { id: 'owned-assets', type: 'content-group', props: { layout: 'rows' }, children: rows.map((row, index) => ({
      // Rows cascade in after their group (reveal 0) when the host animates.
      id: row.entityId, type: 'asset-row', reveal: index + 1, props: {
        variant: 'owned', entityId: row.entityId, name: row.name, symbol: row.symbol,
        value: `$${row.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        quantity: String(row.quantity), deltaPercent: row.deltaPercent,
        href: `#owned/${row.entityId}`, selected: row.entityId === selectedAssetId,
      },
    })) },
  };
}
