import { useState } from 'react';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl';
import { TrendChart } from '../nodes/TrendChart';
import { TrendDelta } from '../nodes/TrendDelta';
import { AssetsHomeList } from './AssetsHomeList';
import { AllocationBar } from './AllocationBar';
import { WalletActionRow } from './WalletActionRow';
import {
  resolveAssetsHomeSummary,
  resolveInvestmentsSeries,
  resolveInvestmentsPeriodDelta,
  investmentsPeriodHasCoverage,
  isInvestmentsPeriod,
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
// 3. TrendChart's quiet mode (no glow pane) + a short bleedHeight, so the
//    chart supports the balance rather than dominating the screen.
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

export function InvestmentsTab() {
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [period, setPeriod] = useState<InvestmentsPeriod>(DEFAULT_PERIOD);
  const summary = resolveAssetsHomeSummary();
  const series = resolveInvestmentsSeries();
  const hasCoverage = investmentsPeriodHasCoverage(period);
  const periodDelta = resolveInvestmentsPeriodDelta(period, series);
  const isUp = (periodDelta?.changeAbs ?? 0) >= 0;

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
            header's period row. */}
        <SegmentedControl label="Period" value={period}
          onChange={(value) => { if (isInvestmentsPeriod(value)) setPeriod(value); }}>
          {INVESTMENTS_PERIODS.map((candidate) => (
            <SegmentedControlItem key={candidate} value={candidate} label={candidate} />
          ))}
        </SegmentedControl>
        <TrendChart series={hasCoverage ? series : []} periods={[...INVESTMENTS_PERIODS]}
          activePeriod={period} onPeriodChange={(value) => { if (isInvestmentsPeriod(value)) setPeriod(value); }} bleedHeight={120} quiet />
      </div>

      <WalletActionRow variant="wallet" shape="circle" size="compact" />

      {summary.rows.length > 0 && (
        <AllocationBar segments={summary.rows.map((row) => ({ id: row.entityId, label: row.symbol, value: row.value }))} />
      )}

      {summary.rows.length > 0 ? (
        <AssetsHomeList rows={summary.rows} selectedAssetId={selectedAssetId} onSelectAsset={setSelectedAssetId} />
      ) : (
        <EmptyState title="No assets yet" description="Connect a wallet to see your crypto holdings here." />
      )}
    </>
  );
}
