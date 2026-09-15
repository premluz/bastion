import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { TrendDelta } from '../nodes/TrendDelta';
import { BalanceCategoryCard } from './BalanceCategoryCard';
import glowStyles from '../../theme/glow.module.css';
import heroBalanceStyles from '../../theme/heroBalance.module.css';
import styles from './AssetsHomeHeader.module.css';

// Fixed, non-zero placeholder (2026-09-13, direct feedback): no "Money"/
// fiat balance concept exists anywhere in the universe seed —
// resolveAssetsHomeSummary computes one crypto total only. Rather than
// mirror Crypto's real numbers (which would misread as a second real
// balance) or show a bare $0.00 (which reads as broken, not "not built
// yet"), this is an authored stand-in distinct from Crypto's own figures,
// flagged here rather than silently treated as real data. Replace with a
// real fiat/cash balance source if one is ever added to the universe.
//
// Shared with MoneyPage.tsx (2026-09-14) — the Money card on Home and the
// Money page it opens must show the same balance; sourced from
// moneySummary.ts rather than duplicated as two independent numbers.
import { MONEY_PLACEHOLDER } from './moneySummary';

// Action row (Buy/Send/Receive/Stake/Swap) moved out to its own
// WalletActionRow.tsx component (2026-09-13, direct feedback: "remove
// from homepage buttons buy spend receive (keep as comp)") — extracted,
// not deleted; just no longer rendered here.

interface AssetsHomeHeaderProps {
  totalValue: number;
  changeAbs: number;
  changePercent: number;
  onSelectMoney?: () => void;
}

// Balance glow (2026-09-12): reuses theme/glow.module.css's existing
// .topLeft + .topRight primitive combination rather than a new glow shape.
// Colour tracks the portfolio's own direction — --delta-up when the
// balance is up, --delta-down when it's down — so the screen's ambient
// light says which way the day went before any number is read. These are
// the same two tokens TrendDelta already uses, defined in all five
// registered themes, so no theme falls back silently.
//
// No longer renders the avatar/search row (2026-09-13, direct feedback:
// "header is avatar and search... scrollable is everything in the middle
// including all mainnets, portfolio value, and buttons"). That row now
// lives in MobileFrame's own shared <header> — fixed above every tab,
// avatar+search only, same element every other tab already used. This
// component is the part that scrolls: glow + total balance + category cards.
//
// Category cards added below the hero figure (2026-09-13, direct
// feedback: "balance cards, two on top, category crypto/money with caret,
// value, underneath up or down — below balances, promo cards" — i.e. this
// order: total balance, then the two cards, then the promo carousel one
// level up in AssetsHomePage.tsx). Crypto uses the same real totals as the
// hero figure above it (one summary, two presentations); Money is the
// placeholder documented above.
export function AssetsHomeHeader({ totalValue, changeAbs, changePercent, onSelectMoney }: AssetsHomeHeaderProps) {
  const isUp = changeAbs >= 0;
  // unclipped, not clipped (2026-09-13): .clipped puts overflow:hidden on
  // the glow host, and that host is only as tall as the balance block
  // (measured: 253px), so the blurred ::before was sliced flat at that
  // boundary — a hard rectangular edge below the balance. Unclipped lets
  // the 40px blur fall off naturally instead.
  return (
    <div
      className={`${styles.root} ${glowStyles.root} ${glowStyles.topLeft} ${glowStyles.topRight} ${glowStyles.unclipped}`}
      style={{
        '--glow-color': isUp ? 'var(--delta-up)' : 'var(--delta-down)',
        '--glow-strength': 'var(--tint-subtle)',
      } as React.CSSProperties}
    >
      <div className={glowStyles.content}>
        <div className={styles.portfolio}>
          <Text type="label" color="secondary">
            Total balance
          </Text>
          <Heading level={1} type="display-1" className={heroBalanceStyles.heroBalance}>
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Heading>
          <div className={styles.changeRow}>
            <Text type="supporting" hasTabularNumbers className={isUp ? styles.deltaUp : styles.deltaDown}>
              {isUp ? '+' : ''}
              {changeAbs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <TrendDelta value={changePercent} />
          </div>
        </div>
        <div className={styles.categoryRow}>
          <BalanceCategoryCard label="Crypto" value={totalValue} changeAbs={changeAbs} changePercent={changePercent} />
          <BalanceCategoryCard label="Money" value={MONEY_PLACEHOLDER.value} changeAbs={MONEY_PLACEHOLDER.changeAbs}
            changePercent={MONEY_PLACEHOLDER.changePercent} {...(onSelectMoney ? { onClick: onSelectMoney } : {})} />
        </div>
      </div>
    </div>
  );
}
