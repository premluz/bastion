import { useState } from 'react';
import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl';
import { AssetPriceHeader } from '../nodes/AssetPriceHeader';
import { AssetKeyStatsTable } from './AssetKeyStatsTable';
import { AnalystConsensus } from '../nodes/AnalystConsensus';
import { EarningsHistoryChart } from '../nodes/EarningsHistoryChart';
import { PriceMovementTimeline } from '../nodes/PriceMovementTimeline';
import { KeyIssuesCard } from '../nodes/KeyIssuesCard';
import { AiRationaleRail } from '../nodes/AiRationaleRail';
import { TrendChart } from '../nodes/TrendChart';
import { Panel } from '../nodes/Panel';
import { PanelWithAction } from './PanelWithAction';
import { RelatedEntitiesStrip } from './RelatedEntitiesStrip';
import { StoriesAndAnalysisCard } from './StoriesAndAnalysisCard';
import { AnimatedListItem } from './AnimatedListItem';
import type { TradableAsset } from '../../contracts/tradableAsset';
import styles from './AssetOverviewTab.module.css';

const ASSET_CLASS_LABEL: Record<string, string> = {
  'equity-token': 'Equity',
  'crypto-native': 'Crypto',
  'tokenized-rwa': 'Tokenized RWA',
};

interface AssetOverviewTabProps {
  asset: TradableAsset;
  onOpenTab: (tab: 'analysis' | 'earnings' | 'news') => void;
  onOpenRelated: (id: string) => void;
}

// Phase 21 redesign: two-column layout. Originally built on Astryx's
// Grid/GridSpan (2:1 split via columns={3}/columns={2|1}) — replaced
// with plain CSS Grid (styles.layout) after live verification found
// GridSpan hardcodes height:100% on itself ("make span fill grid cell
// and stretch children", its own doc comment), independent of the outer
// Grid's align-items: with genuinely different content heights per
// column, the shorter cell stretched to match the taller one, leaving
// visible empty space below its own last child (reported live,
// 2026-08-15) — a closed-component behavior with no prop to disable, so
// this layout no longer uses Grid/GridSpan at all. Left (wide): identity
// header, price + trend chart, Key Statistics, Key Issues, a paired
// Stories & Analysis + Peers row (moved in 2026-08-19, see .pairRow's own
// comment below). Right (narrow): Analyst consensus, Earnings, Why Is
// This Moving, Notable Price Movement (moved in from the left,
// 2026-08-19) — all still deep-link to their own tab, the WO-1 IA law
// stays in force, just re-laid into this shape (node-vocabulary.md's own
// Phase 21 section). Price+chart wrapped in a Panel
// again (2026-08-18, direct feedback: "the chart should have pane") —
// reverses the 2026-08-17 removal, but for a DIFFERENT reason than the
// 2026-08-15 addition that removal itself reversed: that round's Panel
// was rejected because the chart didn't bleed within it (a genuine
// bleed-math bug, fixed by removing the wrapper and reworking
// TrendChart.module.css's own .chartBleed to target PageShell's
// .paneBody directly). This round's ask is different — visual
// consistency: every OTHER block on this page (Key statistics, Analyst
// consensus, Earnings, Why is this moving) already sits in its own
// bordered Panel/PanelWithAction card; price+chart was the one block
// floating with no boundary at all, confirmed live via screenshot before
// making this change. .chartBleed's own margin-inline already hardcodes
// --space-16 directly (not a Card-specific variable), and Panel's Card
// uses the same --space-16 padding .paneBody does, so the bleed math
// still holds correctly with Panel reintroduced as the chart's direct
// parent — verified live below, not assumed from the shared value.
export function AssetOverviewTab({ asset, onOpenTab, onOpenRelated }: AssetOverviewTabProps) {
  const related = asset.related.map((entity) => ({
    id: entity.id,
    name: entity.name,
    type: ASSET_CLASS_LABEL[entity.assetClass] ?? entity.assetClass,
  }));

  // Period selector lifted out of TrendChart's own header row (2026-08-30,
  // direct feedback) so it can render top-right of AssetPriceHeader's
  // price row instead — TrendChart accepts it back as a controlled
  // activePeriod/onPeriodChange pair (see its own comment) and renders no
  // header row of its own here.
  const periods = asset.trendChart.periods;
  const [activePeriod, setActivePeriod] = useState(periods.at(-1) ?? 'MAX');

  return (
    <div className={styles.layoutContainer}>
      <div className={styles.layout}>
        <div className={styles.column}>
          {/* AssetIdentityHeader removed 2026-08-19 (direct feedback:
              "title of entity detail should be only the one pane title
              not the one below tabs") — the entity's name/logo/ticker
              now render exactly once, in EntityDetailPage.tsx's own pane
              title bar (EntityPaneTitle.tsx), not duplicated here. */}
          <AnimatedListItem index={0}>
            <Panel>
              <AssetPriceHeader
                lastPrice={asset.priceHeader.lastPrice}
                changeAbs={asset.priceHeader.changeAbs}
                changePct={asset.priceHeader.changePct}
                asOf={asset.priceHeader.asOf}
                dayRange={asset.priceHeader.dayRange}
                {...(asset.priceHeader.afterHours ? { afterHours: asset.priceHeader.afterHours } : {})}
                periodSelector={
                  <SegmentedControl label="Period" value={activePeriod} onChange={(value) => setActivePeriod((value ?? periods.at(-1) ?? 'MAX') as typeof activePeriod)}>
                    {periods.map((period) => (
                      <SegmentedControlItem key={period} value={period} label={period} />
                    ))}
                  </SegmentedControl>
                }
              />
              <TrendChart
                series={asset.trendChart.series}
                periods={asset.trendChart.periods}
                activePeriod={activePeriod}
                onPeriodChange={setActivePeriod}
                {...(asset.trendChart.intraday ? { intraday: asset.trendChart.intraday } : {})}
                {...(asset.trendChart.intradayFine ? { intradayFine: asset.trendChart.intradayFine } : {})}
              />
            </Panel>
          </AnimatedListItem>

          <AnimatedListItem index={1}>
            <AssetKeyStatsTable title="Key statistics" stats={asset.keyStatsTable} />
          </AnimatedListItem>

          {asset.keyIssues && asset.keyIssues.length > 0 && (
            <AnimatedListItem index={2}>
              <Panel title="Key issues">
                <KeyIssuesCard issues={asset.keyIssues} />
              </Panel>
            </AnimatedListItem>
          )}

          {/* Paired row (2026-08-19, direct feedback: "Peers should move to
              left pane, 2 column together with Stories & Analysis") —
              Stories & Analysis stays put, Peers moves in from the right
              column to sit beside it. .pairRow stretches both to the
              taller card's own height (see AssetOverviewTab.module.css's
              own comment) — the general "matched pair, same height" rule
              this round asked for, scoped to this local pair only, not
              the outer left/right split (that one stays independent-
              height on purpose, per its own 2026-08-15 comment). */}
          {asset.priceMovementTimeline.length > 0 && (
            <AnimatedListItem index={3}>
              <div className={styles.pairRow}>
                <StoriesAndAnalysisCard entries={asset.priceMovementTimeline.slice(0, 4)} />
                <Panel title="Peers">
                  <RelatedEntitiesStrip entities={related} onOpen={onOpenRelated} />
                </Panel>
              </div>
            </AnimatedListItem>
          )}
        </div>

        <div className={styles.column}>
          {asset.analystConsensus && (
            <AnimatedListItem index={0}>
              <PanelWithAction title="Analyst consensus" actionLabel="See all" onAction={() => onOpenTab('analysis')}>
                <AnalystConsensus consensus={asset.analystConsensus} />
              </PanelWithAction>
            </AnimatedListItem>
          )}

          {asset.earningsHistory && asset.earningsHistory.length > 0 && (
            <AnimatedListItem index={1}>
              <PanelWithAction title="Earnings" actionLabel="See all" onAction={() => onOpenTab('earnings')} glow>
                <EarningsHistoryChart points={asset.earningsHistory.slice(-4)} />
              </PanelWithAction>
            </AnimatedListItem>
          )}

          <AnimatedListItem index={2}>
            <PanelWithAction title="Why is this moving?" actionLabel="See all" onAction={() => onOpenTab('news')}>
              <AiRationaleRail summary={asset.aiRationale.summary} sources={asset.aiRationale.sources} asOf={asset.aiRationale.asOf} />
            </PanelWithAction>
          </AnimatedListItem>

          {/* Moved from the left column (2026-08-19, direct feedback:
              "Notable price movement should [move] to side pane [right]").
              glow now lives on PanelWithAction itself, not on
              PriceMovementTimeline (same-round follow-up, direct
              feedback: "the bottom gradient should be applied to pane
              (card) rather than component of timeline itself"). */}
          {asset.priceMovementTimeline.length > 0 && (
            <AnimatedListItem index={3}>
              <PanelWithAction title="Notable price movement" actionLabel="See all" onAction={() => onOpenTab('news')} glow>
                <PriceMovementTimeline entries={asset.priceMovementTimeline.slice(0, 3)} />
              </PanelWithAction>
            </AnimatedListItem>
          )}
        </div>
      </div>
    </div>
  );
}
