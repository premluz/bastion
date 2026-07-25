import { useMemo, useState } from 'react';
import { ClickableCard } from '@astryxdesign/core/ClickableCard';
import { ToggleButton, ToggleButtonGroup } from '@astryxdesign/core/ToggleButton';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import { Text } from '@astryxdesign/core/Text';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Sparkline } from '../nodes/Sparkline';
import { DashboardLayout } from '../nodes/DashboardLayout';
import { AssetLogo } from './AssetLogo';
import type { MarketAsset } from '../../engine/assetDiscovery';
import { CATEGORY_LABELS } from '../../engine/assetDiscoveryMock';

interface EntityAssetGridProps {
  assets: MarketAsset[];
  onWatch: (id: string, name: string) => void;
  onOpenDetail: (id: string) => void;
}

const ALL_CATEGORY = 'all';

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
  const isUp = asset.deltaRecent >= 0;
  const sign = asset.deltaRecent > 0 ? '+' : '';
  return (
    <div style={{ display: 'grid', gap: 'var(--space-8)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
        <AssetLogo id={asset.id} />
        <div>
          <Text type="body" weight="semibold" display="block">
            {asset.name}
          </Text>
          <Text type="supporting" color="secondary">
            {asset.type}
          </Text>
        </div>
      </div>
      <Sparkline points={asset.sparklinePoints} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text type="body" weight="semibold" hasTabularNumbers>
          {asset.yield.toFixed(1)}%
        </Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <Icon icon={isUp ? 'arrowUp' : 'arrowDown'} size="lg" color={isUp ? 'success' : 'error'} />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {sign}
            {asset.deltaRecent.toFixed(2)}pp
          </Text>
        </div>
      </div>
    </div>
  );
}

// Grid view (Phase 14, card redesign follow-up 2026-07-20, click-through
// follow-up Phase 16): DashboardLayout is authored for heterogeneous
// dashboard panels (Phase 12), reused here uniformly — every child gets
// span 1, columns fixed at 3 (dashboard-layout's own columns/spans are
// scene-JSON-decoupled by design, Phase 12 WO-1.5, so passing explicit
// values here rather than config.ts's shared dashboard defaults is
// correct, not a workaround). No Buy/Sell/Trade affordance anywhere on
// a card, no wallet connect — the directional triangle is informational,
// not a CTA (see AssetCardContent's own comment) — order's exclusion
// restated in node-vocabulary.md's Entities entry. Every card is now
// clickable (Phase 16: "browse first, investigate second") — click opens
// EntityDetailPage regardless of whether the entity carries an
// investigation intent; Investigate itself moved to that page's own
// header action.
export function EntityAssetGrid({ assets, onWatch, onOpenDetail }: EntityAssetGridProps) {
  const categories = useMemo(() => Array.from(new Set(assets.map((asset) => asset.category))), [assets]);
  const [category, setCategory] = useState<string>(ALL_CATEGORY);

  const filtered = category === ALL_CATEGORY ? assets : assets.filter((asset) => asset.category === category);

  return (
    <div style={{ display: 'grid', gap: 'var(--space-16)' }}>
      <ToggleButtonGroup label="Filter assets by category" type="single" value={category} onChange={(value) => setCategory(value ?? ALL_CATEGORY)}>
        <ToggleButton value={ALL_CATEGORY} label="All">
          All
        </ToggleButton>
        {categories.map((cat) => (
          <ToggleButton key={cat} value={cat} label={CATEGORY_LABELS[cat] ?? cat}>
            {CATEGORY_LABELS[cat] ?? cat}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {filtered.length === 0 ? (
        <EmptyState title="No assets in this category" description="Try a different filter." />
      ) : (
        <DashboardLayout columns={3} spans={filtered.map(() => 1)}>
          {filtered.map((asset) => (
            <div key={asset.id} style={{ position: 'relative' }}>
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
          ))}
        </DashboardLayout>
      )}
    </div>
  );
}
