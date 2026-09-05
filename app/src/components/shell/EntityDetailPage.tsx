import { useEffect, useState } from 'react';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import { ToggleButtonGroup, ToggleButton } from '@astryxdesign/core/ToggleButton';
import { AnalystConsensus } from '../nodes/AnalystConsensus';
import { EarningsHistoryChart } from '../nodes/EarningsHistoryChart';
import { PriceMovementTimeline } from '../nodes/PriceMovementTimeline';
import { AiRationaleRail } from '../nodes/AiRationaleRail';
import { TrendChart } from '../nodes/TrendChart';
import { Panel } from '../nodes/Panel';
import { resolveTradableAsset } from '../../engine/tradableAsset';
import { useWatchlistStore } from '../../engine/stores/watchlistStore';
import { usePageStore } from '../../engine/stores/pageStore';
import { PageShell } from './PageShell';
import { EntityPaneTitle } from './EntityPaneTitle';
import { AssetOverviewTab } from './AssetOverviewTab';
import { AssetKeyStatsTable } from './AssetKeyStatsTable';
import { AssetSnippetCard } from './AssetSnippetCard';
import { AnimatedListItem } from './AnimatedListItem';

type AssetDetailTab = 'overview' | 'financials' | 'analysis' | 'earnings' | 'news' | 'historical-data';

// Page (Phase 20 WO-1) — replaces the EntityDetail-driven page (Phase 16/
// 19). Overview is a set of PREVIEW cards (AssetOverviewTab.tsx), each
// deep-linking into its own tab with the referenced item pre-selected —
// Perplexity Finance/CoinGecko's own pattern, per the order's IA law:
// nothing on Overview is a dead end. Only entities with a TradableAsset
// fixture render here (engine/tradableAsset.ts, two golden fixtures at
// this proof-of-concept stage) — every other entity shows an honest "not
// yet available" empty state rather than a dead click or a silent
// fallback to the retired EntityDetail shape (2026-08-15 ruling). No
// SceneRenderer, no trail, no submitQuery — same static-page posture as
// Holdings/DashboardPage. No trade/buy-sell surface anywhere.
export function EntityDetailPage() {
  const selectedEntityId = usePageStore((state) => state.selectedEntityId);
  const entityDetailTarget = usePageStore((state) => state.entityDetailTarget);
  const clearEntityDetailTarget = usePageStore((state) => state.clearEntityDetailTarget);
  const openEntityDetail = usePageStore((state) => state.openEntityDetail);
  const watch = useWatchlistStore((state) => state.watch);

  const asset = selectedEntityId ? resolveTradableAsset(selectedEntityId) : undefined;

  const [activeTab, setActiveTab] = useState<AssetDetailTab>('overview');

  // Deep-link consumption (Phase 20 WO-1): an Overview preview card sets
  // entityDetailTarget via openEntityDetail's own target param; this page
  // reads it once, switches to the named tab, then clears it — same
  // one-shot pattern as focusModule (InvestigationsPage's own consumer).
  useEffect(() => {
    if (entityDetailTarget) {
      setActiveTab(entityDetailTarget.tab as AssetDetailTab);
      clearEntityDetailTarget();
    }
  }, [entityDetailTarget, clearEntityDetailTarget]);

  if (!asset) {
    return (
      <PageShell title="Asset">
        <EmptyState
          title="Not yet available in the new asset view"
          description="This entity doesn't have a TradableAsset fixture yet — South Bow Corp and Zenith Protocol are the two proof-of-concept assets currently available."
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title={asset.name}
      titleContent={<EntityPaneTitle id={asset.id} name={asset.name} symbol={asset.symbol} />}
      titleEndContent={
        <IconButton
          label={`Watch ${asset.name}`}
          tooltip="Add to watchlist"
          icon={<Icon icon="checkDouble" size="sm" />}
          variant="ghost"
          size="sm"
          onClick={() => watch(asset.id, asset.name, 'manual')}
        />
      }
    >
      {/* ToggleButtonGroup, not TabList (2026-08-23 direct feedback: "tabs
          should be same style as the ones in discover asset (no
          underline) selected is just bg") — matches
          DiscoverAssetsSection.tsx's own category filter exactly: pill
          buttons, no underline indicator, selected reads as a filled
          background. Same controlled single-select API shape as TabList
          (value/onChange), so activeTab state below is unchanged. */}
      <ToggleButtonGroup
        label="Asset detail sections"
        type="single"
        value={activeTab}
        onChange={(value) => setActiveTab((value ?? 'overview') as AssetDetailTab)}
      >
        <ToggleButton value="overview" label="Overview">
          Overview
        </ToggleButton>
        <ToggleButton value="financials" label="Financials">
          Financials
        </ToggleButton>
        {asset.analystConsensus && (
          <ToggleButton value="analysis" label="Analysis">
            Analysis
          </ToggleButton>
        )}
        {asset.earningsHistory && (
          <ToggleButton value="earnings" label="Earnings">
            Earnings
          </ToggleButton>
        )}
        <ToggleButton value="news" label="News">
          News
        </ToggleButton>
        <ToggleButton value="historical-data" label="Historical Data">
          Historical Data
        </ToggleButton>
      </ToggleButtonGroup>

      {activeTab === 'overview' && (
        <AssetOverviewTab asset={asset} onOpenTab={setActiveTab} onOpenRelated={openEntityDetail} />
      )}

      {activeTab === 'financials' && (
        <>
          <AnimatedListItem index={0}>
            <AssetKeyStatsTable title="Key statistics" stats={asset.keyStatsTable} />
          </AnimatedListItem>
          <AnimatedListItem index={1}>
            <AssetSnippetCard snippet={asset.snippet} />
          </AnimatedListItem>
        </>
      )}

      {activeTab === 'analysis' && asset.analystConsensus && (
        <AnimatedListItem index={0}>
          <Panel title="Analyst consensus">
            <AnalystConsensus consensus={asset.analystConsensus} />
          </Panel>
        </AnimatedListItem>
      )}

      {activeTab === 'earnings' && asset.earningsHistory && (
        <AnimatedListItem index={0}>
          <EarningsHistoryChart title="Earnings history" points={asset.earningsHistory} />
        </AnimatedListItem>
      )}

      {activeTab === 'news' && (
        <>
          <AnimatedListItem index={0}>
            <Panel title="Why is this moving?">
              <AiRationaleRail summary={asset.aiRationale.summary} sources={asset.aiRationale.sources} asOf={asset.aiRationale.asOf} />
            </Panel>
          </AnimatedListItem>
          <AnimatedListItem index={1}>
            <PriceMovementTimeline title="Notable price movement" entries={asset.priceMovementTimeline} />
          </AnimatedListItem>
        </>
      )}

      {activeTab === 'historical-data' && (
        <AnimatedListItem index={0}>
          <TrendChart
            title="Price"
            series={asset.trendChart.series}
            periods={asset.trendChart.periods}
            {...(asset.trendChart.intraday ? { intraday: asset.trendChart.intraday } : {})}
            {...(asset.trendChart.intradayFine ? { intradayFine: asset.trendChart.intradayFine } : {})}
            {...(asset.trendChart.compareSeries ? { compareSeries: asset.trendChart.compareSeries } : {})}
          />
        </AnimatedListItem>
      )}
    </PageShell>
  );
}
