import { useState, type MouseEvent } from 'react';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { DropdownMenu } from '@astryxdesign/core/DropdownMenu';
import { TrendChart } from '../nodes/TrendChart';
import { TrendDelta } from '../nodes/TrendDelta';
import { LinkChips } from '../nodes/LinkChips';
import { AssetsHomeList } from './AssetsHomeList';
import { AllocationBar } from './AllocationBar';
import { WalletActionRow } from './WalletActionRow';
import {
  resolveAssetsHomeSummary,
  resolveInvestmentsSeries,
  resolveInvestmentsPeriodDelta,
  investmentsPeriodHasCoverage,
  densifyForDisplay,
  INVESTMENTS_PERIODS,
  type InvestmentsPeriod,
} from '../../engine/assetsHome';
import heroBalanceStyles from '../../theme/heroBalance.module.css';
import styles from './InvestmentsTab.module.css';

// Renamed from "Crypto" (2026-09-16, direct feedback: "let's change it to
// Investments"), rebuilt against a reference mockup with four corrections
// against that mockup rather than a straight port:
// 1. Timeframe (1D·1W·1M·1Y·All → this app's own 24H/7D/1M/1Y/MAX
//    vocabulary, TrendChart's existing enum, not a parallel one) drives
//    BOTH the chart and the headline delta from the same selected period.
// 2. Allocation is built from resolveAssetsHomeSummary's own real holding
//    rows (BTC/ETH/SOL/etc.), never a separately-fetched or fabricated
//    Crypto/Stablecoins/Yield split — that mismatch (allocation totaling
//    more than the headline balance) is exactly the bug being fixed.
// 3. TrendChart with its normal glow/gradient (2026-09-16 follow-up:
//    quiet mode read as flat next to Explore's own gradient charts) and a
//    short bleedHeight, so the chart supports the balance rather than
//    dominating the screen.
// 4. Compact WalletActionRow + a smaller allocation summary, holdings
//    pulled up in the reading order: value+return → chart+timeframe →
//    actions → allocation → holdings (this order was a direct request).
//
// Real history is a single 7-day window per holding (universe/
// datasets.json's own *-price-volume-90d fixtures, 7 daily points despite
// the filename) — no intraday/month/year data exists anywhere yet. Per
// this project's own no-fabrication discipline, 24H/7D render the real
// window; 1M/1Y/MAX render an honest empty state instead of silently
// reusing the same week under a longer label (2026-09-16 ruling).
const DEFAULT_PERIOD: InvestmentsPeriod = '7D';

// Chart line only, not the headline/delta (2026-09-16 follow-up, direct
// feedback against a reference chart: "need more mocked points to be
// more like this chart not so smooth") — densifyForDisplay's own comment
// has the full reasoning: this inserts noisy interpolated steps between
// the real points for visual texture, landing exactly on every real
// point's own real value/date. periodDelta below is computed from the
// real `series`, never the densified one.
const CHART_DISPLAY_SEED = 'investments-chart';

// Same category set as Discover's own "Explore Categories" row (2026-09-16,
// direct feedback: "we need tabs on crypto portfolio same as on discover —
// All Crypto Stocks Perps Commodities") — visual-only for now, confirmed:
// every current holding is crypto (no stocks/perps/commodities exist
// anywhere in the universe seed), so this doesn't filter yet. Uses
// LinkChips directly (the exact component/markup Discover's own row is),
// with its own local "#investments/..." href namespace and a local
// delegated click handler — same two-line data-explore-link pattern
// useExploreNavigation.ts already uses, just updating LOCAL state instead
// of navigating, since this page has no delegated listener of its own the
// way Explore/Markets' .page does. variant="tabs", not "chips" (2026-09-16
// follow-up bug fix, direct feedback: "should not wrap this tab style and
// be scrollable") — Discover's own row uses "tabs" too (confirmed against
// its real scene JSON): ExploreComponents.module.css's .chips wraps
// (flex-wrap: wrap), .tabs scrolls horizontally with no wrap
// (overflow-x: auto). "chips" was the wrong variant here from the start.
const CATEGORY_CHIPS = [
  { id: 'all', label: 'All', href: '#investments/category/all' },
  { id: 'crypto', label: 'Crypto', href: '#investments/category/crypto' },
  { id: 'stocks', label: 'Stocks', href: '#investments/category/stocks' },
  { id: 'perps', label: 'Perps', href: '#investments/category/perps' },
  { id: 'commodities', label: 'Commodities', href: '#investments/category/commodities' },
] as const;

export function InvestmentsTab() {
  const [period, setPeriod] = useState<InvestmentsPeriod>(DEFAULT_PERIOD);
  const [category, setCategory] = useState('all');
  const summary = resolveAssetsHomeSummary();
  const series = resolveInvestmentsSeries();
  const hasCoverage = investmentsPeriodHasCoverage(period);
  const periodDelta = resolveInvestmentsPeriodDelta(period, series);
  const isUp = (periodDelta?.changeAbs ?? 0) >= 0;
  const displaySeries = hasCoverage ? densifyForDisplay(series, CHART_DISPLAY_SEED) : [];

  function onCategoryClick(event: MouseEvent<HTMLElement>) {
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest('[data-explore-link]');
    const href = link?.getAttribute('data-explore-link');
    if (!href?.startsWith('#investments/category/')) return;
    event.preventDefault();
    setCategory(href.split('/')[2] ?? 'all');
  }

  return (
    <>
      <div className={styles.balanceBlock}>
        <Heading level={1} type="display-1" className={heroBalanceStyles.heroBalance}>
          ${summary.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Heading>
        {periodDelta ? (
          <div className={styles.changeRow}>
            <Text type="supporting" hasTabularNumbers className={isUp ? styles.deltaUp : styles.deltaDown}>
              {isUp ? '+' : ''}
              {periodDelta.changeAbs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <TrendDelta value={periodDelta.changePercent} />
          </div>
        ) : (
          <Text type="supporting" color="secondary">—</Text>
        )}
      </div>

      <div className={styles.chartBlock}>
        {/* TrendChart's own header row (title + period selector) never
            renders in controlled mode (its own doc comment: "the caller is
            expected to render the SegmentedControl itself, elsewhere") —
            same pattern AssetOverviewTab.tsx already uses for its price
            header's period row.
            Dropdown, not a segmented row of pills (2026-09-16 follow-up,
            direct feedback: "should actually be a dropdown popover with
            options so single value showing") — DropdownMenu's own trigger
            button shows the one selected period, hasChevron's default
            true renders the indicator this needs with no extra markup. */}
        <DropdownMenu button={{ label: period, variant: 'secondary', className: styles.periodTrigger }}
          items={INVESTMENTS_PERIODS.map((candidate) => ({ label: candidate, onClick: () => setPeriod(candidate) }))} />
        {/* TrendChart's own internal day-count slicer (sliceByPeriod,
            DAYS_BACK) assumes roughly one point per day — densifyForDisplay
            above turns 7 real points into dozens, which '7D''s own
            slice(-7) would wrongly cut down to the last real day. 'YTD'
            also maps to DAYS_BACK 'all' (untouched slicing) WITHOUT being
            the literal string 'MAX', which matters: TrendChart's own
            isZoomedPeriod (activePeriod !== 'MAX') gates Y-axis auto-scale,
            and passing 'MAX' here flattened this narrow ~$150 range
            against a 0-anchored axis (caught live via screenshot — the
            chart nearly vanished). 'YTD' gets both: the whole densified
            array, AND an auto-scaled axis. Always requesting it internally
            decouples TrendChart's own slicing from OUR OWN period buttons
            above, which already decide what `displaySeries` even contains
            before it gets here. */}
        <TrendChart series={displaySeries} periods={['YTD']} activePeriod="YTD" onPeriodChange={() => {}} bleedHeight={120} />
      </div>

      <WalletActionRow variant="wallet" shape="circle" />

      {summary.rows.length > 0 && (
        <AllocationBar segments={summary.rows.map((row) => ({ id: row.entityId, label: row.symbol, value: row.value }))} />
      )}

      {/* Moved below Allocation (2026-09-16 follow-up, direct feedback:
          "these should be under allocation") — previously opened the
          page above the balance; same local category-filter behavior,
          just relocated in the reading order. */}
      <div onClick={onCategoryClick}>
        <LinkChips label="Investment categories" variant="tabs" active={category} links={[...CATEGORY_CHIPS]} />
      </div>

      {summary.rows.length > 0 ? (
        <AssetsHomeList rows={summary.rows} />
      ) : (
        <EmptyState title="No assets yet" description="Connect a wallet to see your crypto holdings here." />
      )}
    </>
  );
}
