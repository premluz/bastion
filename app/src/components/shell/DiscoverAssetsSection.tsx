import { useMemo, useState, type SVGProps } from 'react';
import { ToggleButton, ToggleButtonGroup } from '@astryxdesign/core/ToggleButton';
import { Icon } from '@astryxdesign/core/Icon';
import { Text } from '@astryxdesign/core/Text';
import { EntityAssetGrid } from './EntityAssetGrid';
import { EntityAssetTable } from './EntityAssetTable';
import type { MarketAsset } from '../../engine/assetDiscovery';
import { CATEGORY_LABELS } from '../../engine/assetDiscoveryMock';

interface DiscoverAssetsSectionProps {
  assets: MarketAsset[];
  onWatch: (id: string, name: string) => void;
  onOpenDetail: (id: string) => void;
}

const ALL_CATEGORY = 'all';
type View = 'table' | 'grid';

// Astryx's semantic icon set (checked via `astryx docs icons`, the full
// catalog — no grid/card-view name exists in it) has no fit for "grid
// view"; its own docs sanction passing a custom SVG component directly
// for exactly this case ("For icons not in the semantic list, pass an
// SVG component directly"). Stroke-based, 1.5px, currentColor — matching
// the semantic set's own default SVGs so it doesn't look like a foreign
// icon style next to them.
function GridViewIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}

// Category filter and view mode share one header row (direct feedback,
// 2026-07-26: table view added, default view, switch on the right) —
// filter (which assets show) and view (how they're displayed) are
// orthogonal, so both live here rather than duplicated inside
// EntityAssetGrid/EntityAssetTable, which now just render whatever
// `assets` they're given.
export function DiscoverAssetsSection({ assets, onWatch, onOpenDetail }: DiscoverAssetsSectionProps) {
  const categories = useMemo(() => Array.from(new Set(assets.map((asset) => asset.category))), [assets]);
  const [category, setCategory] = useState<string>(ALL_CATEGORY);
  const [view, setView] = useState<View>('table');

  const filtered = category === ALL_CATEGORY ? assets : assets.filter((asset) => asset.category === category);

  return (
    <div style={{ display: 'grid', gap: 'var(--space-12)' }}>
      <Text type="label">Discover Assets</Text>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-16)' }}>
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
        <ToggleButtonGroup label="Switch view" type="single" value={view} onChange={(value) => setView(value === 'grid' ? 'grid' : 'table')}>
          <ToggleButton value="table" label="Table view" isIconOnly icon={<Icon icon="viewColumns" size="sm" />} />
          <ToggleButton value="grid" label="Grid view" isIconOnly icon={<Icon icon={GridViewIcon} size="sm" />} />
        </ToggleButtonGroup>
      </div>

      {view === 'table' ? (
        <EntityAssetTable assets={filtered} onWatch={onWatch} onOpenDetail={onOpenDetail} {...(category !== ALL_CATEGORY ? { category } : {})} />
      ) : (
        <EntityAssetGrid assets={filtered} onWatch={onWatch} onOpenDetail={onOpenDetail} />
      )}
    </div>
  );
}
