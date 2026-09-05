import { useMemo } from 'react';
import { ToggleButton, ToggleButtonGroup } from '@astryxdesign/core/ToggleButton';
import { Icon } from '@astryxdesign/core/Icon';
import { useScrollOverflow } from '@astryxdesign/core/hooks';
import { usePageStore } from '../../engine/stores/pageStore';
import { EntityAssetGrid } from './EntityAssetGrid';
import { EntityAssetTable } from './EntityAssetTable';
import { PageSection } from './PageSection';
import { GridViewIcon } from './GridViewIcon';
import type { MarketAsset } from '../../engine/assetDiscovery';
import { CATEGORY_LABELS } from '../../engine/assetDiscoveryMock';
import styles from './DiscoverAssetsSection.module.css';

interface DiscoverAssetsSectionProps {
  assets: MarketAsset[];
  onOpenDetail: (id: string) => void;
}

const ALL_CATEGORY = 'all';
type View = 'table' | 'grid';

// Category filter and view mode (2026-08-18 follow-up: view toggle moved
// into PageSection's own `source` slot — direct feedback: "grid list view
// should be in same line/row as title, similarly like artifacts pane has
// options there [close and expand]" — the same title-row action-slot
// pattern PageSection already exposes (its own comment: "byte-identical
// to Panel... every named page section wraps in this"), not a bespoke
// second row). Category filter stays below the title row, now horizontally
// scrollable with fade edges (useScrollOverflow, Astryx's own installed
// hook for exactly this job — its own doc comment: "used by Carousel for
// fade-edge and button state") since ToggleButtonGroup itself has no
// overflow handling and the category list can genuinely exceed the
// pane's width (confirmed live: "equity" cut off entirely at a
// realistic pane width with no way to reach it before this fix).
function CategoryFilterScroller({ categories, category, onChange }: { categories: string[]; category: string; onChange: (value: string) => void }) {
  const { scrollRef, overflowStart, overflowEnd } = useScrollOverflow();
  return (
    <div className={styles.wrapper}>
      <div className={styles.scrollRow} ref={scrollRef}>
        <ToggleButtonGroup label="Filter assets by category" type="single" value={category} onChange={(value) => onChange(value ?? ALL_CATEGORY)}>
          <ToggleButton value={ALL_CATEGORY} label="All">
            All
          </ToggleButton>
          {categories.map((cat) => (
            <ToggleButton key={cat} value={cat} label={CATEGORY_LABELS[cat] ?? cat}>
              {CATEGORY_LABELS[cat] ?? cat}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </div>
      {overflowStart && <div className={styles.fadeStart} />}
      {overflowEnd && <div className={styles.fadeEnd} />}
    </div>
  );
}

// Category filter + view mode lifted into pageStore's pageUiState (2026-08-30,
// direct feedback: browser back to Discover should restore the selected
// category/view, not just reset it) — was local useState, which is
// discarded on unmount; EntitiesPage (this component's one caller) fully
// unmounts on navigation (Frame.tsx's renderPage switch), so anything
// meant to survive a navigate-away/back round trip has to live in the
// store instead. Shares the "entities" key with PageShell's own
// scrollRestoreKey (EntitiesPage.tsx) — same "this page's remembered UI
// state" record, not a coincidence.
const PAGE_UI_KEY = 'entities';

function isView(value: unknown): value is View {
  return value === 'table' || value === 'grid';
}

export function DiscoverAssetsSection({ assets, onOpenDetail }: DiscoverAssetsSectionProps) {
  const categories = useMemo(() => Array.from(new Set(assets.map((asset) => asset.category))), [assets]);
  const storedCategory = usePageStore((state) => state.pageUiState[PAGE_UI_KEY]?.category);
  const storedView = usePageStore((state) => state.pageUiState[PAGE_UI_KEY]?.view);
  const category = typeof storedCategory === 'string' ? storedCategory : ALL_CATEGORY;
  const view = isView(storedView) ? storedView : 'table';
  const setPageUiState = usePageStore((state) => state.setPageUiState);
  const setCategory = (value: string) => setPageUiState(PAGE_UI_KEY, { category: value });
  const setView = (value: View) => setPageUiState(PAGE_UI_KEY, { view: value });

  const filtered = category === ALL_CATEGORY ? assets : assets.filter((asset) => asset.category === category);

  const viewToggle = (
    <ToggleButtonGroup label="Switch view" type="single" value={view} onChange={(value) => setView(value === 'grid' ? 'grid' : 'table')}>
      <ToggleButton value="table" label="Table view" isIconOnly icon={<Icon icon="viewColumns" size="sm" />} />
      <ToggleButton value="grid" label="Grid view" isIconOnly icon={<Icon icon={GridViewIcon} size="sm" />} />
    </ToggleButtonGroup>
  );

  return (
    <PageSection title="Discover Assets" actions={viewToggle}>
      <CategoryFilterScroller categories={categories} category={category} onChange={setCategory} />

      {view === 'table' ? (
        <EntityAssetTable assets={filtered} onOpenDetail={onOpenDetail} {...(category !== ALL_CATEGORY ? { category } : {})} />
      ) : (
        <EntityAssetGrid assets={filtered} onOpenDetail={onOpenDetail} />
      )}
    </PageSection>
  );
}
