import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import styles from './AllocationBar.module.css';

// One segment per real holding (2026-09-16, direct feedback: "the
// allocation totals [more than the headline]... show allocation across
// its holdings — BTC, ETH, SOL, etc. Money shouldn't reappear here") —
// takes the SAME rows resolveAssetsHomeSummary already computed for the
// list below, rather than a separately-fetched or fabricated category
// breakdown (Crypto/Stablecoins/Yield), which is exactly what let the
// total drift out of sync with the real headline balance.
const SEGMENT_TOKENS = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)', 'var(--viz-4)', 'var(--viz-5)', 'var(--viz-6)'];

export interface AllocationSegment { id: string; label: string; value: number }
export interface AllocationBarProps { segments: readonly AllocationSegment[] }

// Label + bar only, no per-holding breakdown (2026-09-16 follow-up, direct
// feedback: "allocation would not show breakdown, just label allocation
// and bar below") — AssetsHomeList right below already shows every
// holding's own value, so the legend was a second listing of the same
// numbers. Same placeholder-href/chevron pattern ContentGroup.tsx already
// uses for the Coins heading (styles.headingLink below mirrors its own
// .headingLink) — Home has no delegated data-explore-link listener here
// either, so this is honestly inert until a real allocation-detail screen
// exists to open.
export function AllocationBar({ segments }: AllocationBarProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const withPercent = segments.map((segment, index) => ({
    ...segment,
    percent: total > 0 ? (segment.value / total) * 100 : 0,
    color: SEGMENT_TOKENS[index % SEGMENT_TOKENS.length]!,
  }));

  return (
    <div className={styles.root}>
      <Button label="Allocation" href="#investments/allocation" data-explore-link="#investments/allocation"
        variant="ghost" className={styles.headingLink} endContent={<Icon icon={ChevronRightIcon} size="sm" />} />
      <div role="img" aria-label={withPercent.map((segment) => `${segment.label} ${segment.percent.toFixed(0)}%`).join(', ')}
        className={styles.bar}>
        {withPercent.map((segment) => segment.percent > 0 && (
          <div key={segment.id} className={styles.segment}
            style={{ '--segment-percent': `${segment.percent}%`, '--segment-color': segment.color } as React.CSSProperties} />
        ))}
      </div>
    </div>
  );
}
