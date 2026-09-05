import { ClickableCard } from '@astryxdesign/core/ClickableCard';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { DashboardLayout } from '../nodes/DashboardLayout';
import { AssetCardVisual } from '../nodes/AssetCardVisual';
import { AnimatedListItem } from './AnimatedListItem';
import { WatchToggleButton } from './WatchToggleButton';
import type { MarketAsset } from '../../engine/assetDiscovery';
import { config } from '../../config';
import styles from './EntityAssetGrid.module.css';

interface EntityAssetGridProps {
  assets: MarketAsset[];
  onOpenDetail: (id: string) => void;
}

// Direct feedback (2026-07-20): a plain directional triangle next to the
// delta, reversing this file's earlier "no color-coded delta" stance —
// the earlier rule (still true in spirit, restated in node-vocabulary.md)
// was against price-action FRAMING — a Buy/Sell CTA, a wallet-connect
// prompt, an "invitation to transact" sitting next to the number. A
// plain up/down indicator with no action beside it doesn't cross that
// line, and the architect asked for it directly with a reference
// example.
//
// Card visual itself lives in AssetCardVisual.tsx (Phase 21, 2026-08-30) —
// extracted so the SAME card renders both here and from the new
// asset-card-grid registry node (Scene-JSON-driven inline results,
// CLAUDE.md's own Phase 21 law: "one card system serves both human
// browsing and assistant generation"). This function only maps
// MarketAsset's own category/price/yield split onto AssetCardVisual's
// plain, engine-agnostic row shape.
function assetToCardRow(asset: MarketAsset): { id: string; name: string; type: string; formattedValue: string; deltaPercent: number } {
  const isCryptoOrStockOrCommodity = asset.category === 'crypto' || asset.category === 'commodities' || asset.category === 'asset';
  const primaryValue = isCryptoOrStockOrCommodity ? asset.price : asset.yield;
  const deltaPercent = isCryptoOrStockOrCommodity ? (asset.delta24hPercent ?? 0) : (asset.deltaRecent ?? 0);
  const formattedValue = isCryptoOrStockOrCommodity
    ? `$${primaryValue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '—'}`
    : `${primaryValue?.toFixed(1) ?? '—'}%`;
  return { id: asset.id, name: asset.name, type: asset.type, formattedValue, deltaPercent };
}

// Grid view (Phase 14, card redesign follow-up 2026-07-20, click-through
// follow-up Phase 16, category filter lifted to DiscoverAssetsSection
// 2026-07-26 so it's shared with the table view, density follow-up
// 2026-08-30 raised 3→4 per row, RESPONSIVE follow-up same day: "panes
// should be responsive and fluid... on mobile or small space stack" —
// columns={4} stayed 4-per-row even on a narrow pane/mobile, cramming
// each card; now columns={{minWidth, max}} via config.assetCardGrid,
// which genuinely reflows down to fewer columns — and stacks to one —
// as the container narrows, capped at 4 on wide screens): DashboardLayout
// is authored for heterogeneous dashboard panels (Phase 12), reused here
// uniformly — every child gets span 1 (dashboard-layout's own
// columns/spans are scene-JSON-decoupled by design, Phase 12 WO-1.5, so
// passing explicit values here rather than config.ts's shared dashboard
// defaults is correct, not a workaround). No Buy/Sell/Trade
// affordance anywhere on a card, no wallet connect — the directional
// triangle is informational, not a CTA (see AssetCardContent's own
// comment) — order's exclusion restated in node-vocabulary.md's Entities
// entry. Every card is clickable (Phase 16: "browse first, investigate
// second") — click opens EntityDetailPage regardless of whether the
// entity carries an investigation intent; Investigate itself moved to
// that page's own header action.
export function EntityAssetGrid({ assets, onOpenDetail }: EntityAssetGridProps) {
  if (assets.length === 0) {
    return <EmptyState title="No assets in this category" description="Try a different filter." />;
  }

  return (
    <DashboardLayout columns={config.assetCardGrid} spans={assets.map(() => 1)}>
      {assets.map((asset, index) => (
        <AnimatedListItem key={asset.id} index={index}>
          {/* watchHoverReveal (WatchToggleButton.module.css's own global
              selector) — bottom-left corner (2026-09-02, direct feedback:
              "change position on card bottom left corner not top right"). */}
          <div className={`${styles.cardWrapper} watchHoverReveal`}>
            <ClickableCard label={`Open ${asset.name}`} variant="default" padding={4} className="cardSurface1" onClick={() => onOpenDetail(asset.id)}>
              <AssetCardVisual {...assetToCardRow(asset)} />
            </ClickableCard>
            <div className={styles.watchSlot}>
              <WatchToggleButton entityId={asset.id} name={asset.name} />
            </div>
          </div>
        </AnimatedListItem>
      ))}
    </DashboardLayout>
  );
}
