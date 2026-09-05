import { findMarketAsset } from '../../engine/assetDiscovery';
import { DiscoveryItemRow } from './DiscoveryItemRow';

interface RelatedEntity {
  id: string;
  name: string;
  type: string;
}

// "Related/compare" strip (Phase 16 revision), Peers on Entity Detail —
// venue peers or sector peers. Own "Related" label REMOVED 2026-08-19
// (direct feedback: "related should not have title in comp, pane would
// have as now duplicate") — this component's only real consumer,
// AssetOverviewTab.tsx, already wraps it in `<Panel title="Peers">`,
// which rendered its own title row above this one's identical-purpose
// "Related" label, a genuine stacked duplicate.
//
// Now built from DiscoveryItemRow (2026-08-19, same round, direct
// feedback: "actually in related use item comp that is used in notable
// movers... each item has also sparkline and price and change, if we
// have this as comp that item that's great lets have it in peers") —
// the same row Notable Movers/Trending/Newly Added already use, not a
// second bespoke card layout. Each related entity's own market data
// (price, point-over-point delta, sparkline) is looked up live via
// findMarketAsset (assetDiscovery.ts's own single-entity lookup, the
// same helper EntityDetailPage.tsx already calls) — TradableAsset's own
// `related` field only ever carried {id, name, assetClass} (no price
// data authored there), so this is a real data join at render time, not
// a passthrough. An entity outside MARKET_ENTITY_IDS (e.g. South Bow
// Corp's own related "halberg-materials," which findMarketAsset can't
// resolve) still renders — DiscoveryItemRow already handles an absent
// sparklinePoints/deltaPercent honestly (no fabricated glyph or number),
// same "never fabricate" posture as every other row on this page — it
// just shows name/detail with a plain "—" value instead of a crash or a
// silently-dropped row.
export function RelatedEntitiesStrip({ entities, onOpen }: { entities: RelatedEntity[]; onOpen: (id: string) => void }) {
  if (entities.length === 0) return null;
  return (
    <div style={{ display: 'grid' }}>
      {entities.map((related) => {
        const asset = findMarketAsset(related.id);
        const value = asset?.price !== undefined ? `$${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';
        return (
          <DiscoveryItemRow
            key={related.id}
            row={{
              id: related.id,
              name: related.name,
              detail: related.type,
              value,
              ...(asset?.sparklinePoints && asset.sparklinePoints.length > 0 ? { sparklinePoints: asset.sparklinePoints } : {}),
              ...(asset?.deltaRecent !== undefined ? { deltaPercent: asset.deltaRecent } : {}),
            }}
            onOpenDetail={onOpen}
          />
        );
      })}
    </div>
  );
}
