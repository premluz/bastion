import { ClickableCard } from '@astryxdesign/core/ClickableCard';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import { Text } from '@astryxdesign/core/Text';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Sparkline } from '../nodes/Sparkline';
import { DashboardLayout } from '../nodes/DashboardLayout';
import { AssetIdentity } from './AssetIdentity';
import { AnimatedListItem } from './AnimatedListItem';
import { TrendDelta } from './TrendDelta';
import type { MarketAsset } from '../../engine/assetDiscovery';

interface EntityAssetGridProps {
  assets: MarketAsset[];
  onWatch: (id: string, name: string) => void;
  onOpenDetail: (id: string) => void;
}

// Direct feedback (2026-07-20): a plain directional triangle next to the
// delta, reversing this file's earlier "no color-coded delta" stance —
// the earlier rule (still true in spirit, restated in node-vocabulary.md)
// was against price-action FRAMING — a Buy/Sell CTA, a wallet-connect
// prompt, an "invitation to transact" sitting next to the number. A
// plain up/down indicator with no action beside it doesn't cross that
// line, and the architect asked for it directly with a reference
// example. Colors reuse Icon's own semantic props (color="success"/
// "error", which this app's theme files already bridge to
// --accent-ok/--accent-alert) — not a new token, not a market-specific
// green/red convention invented for this one card.
function AssetCardContent({ asset }: { asset: MarketAsset }) {
  const isCryptoOrStockOrCommodity = asset.category === 'crypto' || asset.category === 'commodities' || asset.category === 'asset';
  const primaryValue = isCryptoOrStockOrCommodity ? asset.price : asset.yield;
  const delta = isCryptoOrStockOrCommodity ? (asset.delta24hPercent ?? 0) : (asset.deltaRecent ?? 0);

  return (
    <div style={{ display: 'grid', gap: 'var(--space-8)' }}>
      <AssetIdentity id={asset.id} name={asset.name} type={asset.type} />
      <Sparkline points={asset.sparklinePoints} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text type="body" weight="semibold" hasTabularNumbers>
          {isCryptoOrStockOrCommodity ? `$${primaryValue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '—'}` : `${primaryValue?.toFixed(1) ?? '—'}%`}
        </Text>
        <TrendDelta value={delta} />
      </div>
    </div>
  );
}

// Grid view (Phase 14, card redesign follow-up 2026-07-20, click-through
// follow-up Phase 16, category filter lifted to DiscoverAssetsSection
// 2026-07-26 so it's shared with the table view): DashboardLayout is
// authored for heterogeneous dashboard panels (Phase 12), reused here
// uniformly — every child gets span 1, columns fixed at 3 (dashboard-
// layout's own columns/spans are scene-JSON-decoupled by design, Phase 12
// WO-1.5, so passing explicit values here rather than config.ts's shared
// dashboard defaults is correct, not a workaround). No Buy/Sell/Trade
// affordance anywhere on a card, no wallet connect — the directional
// triangle is informational, not a CTA (see AssetCardContent's own
// comment) — order's exclusion restated in node-vocabulary.md's Entities
// entry. Every card is clickable (Phase 16: "browse first, investigate
// second") — click opens EntityDetailPage regardless of whether the
// entity carries an investigation intent; Investigate itself moved to
// that page's own header action.
export function EntityAssetGrid({ assets, onWatch, onOpenDetail }: EntityAssetGridProps) {
  if (assets.length === 0) {
    return <EmptyState title="No assets in this category" description="Try a different filter." />;
  }

  return (
    <DashboardLayout columns={3} spans={assets.map(() => 1)}>
      {assets.map((asset, index) => (
        <AnimatedListItem key={asset.id} index={index}>
          <div style={{ position: 'relative' }}>
            <ClickableCard label={`Open ${asset.name}`} variant="default" padding={4} onClick={() => onOpenDetail(asset.id)}>
              <AssetCardContent asset={asset} />
            </ClickableCard>
            <div style={{ position: 'absolute', top: 'var(--space-12)', right: 'var(--space-12)' }}>
              <IconButton
                label={`Watch ${asset.name}`}
                tooltip="Add to watchlist"
                icon={<Icon icon="checkDouble" size="sm" />}
                variant="ghost"
                size="sm"
                onClick={() => onWatch(asset.id, asset.name)}
              />
            </div>
          </div>
        </AnimatedListItem>
      ))}
    </DashboardLayout>
  );
}
