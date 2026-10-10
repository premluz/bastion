import { Card } from '@astryxdesign/core/Card';
import { Icon } from '@astryxdesign/core/Icon';
import { Text } from '@astryxdesign/core/Text';
import { ChevronRightIcon, CircleStackIcon } from '@heroicons/react/24/outline';
import { TrendDelta } from '../nodes/TrendDelta';
import '../../theme/balance-glass.css';
import styles from './BalanceCategoryCard.module.css';

interface BalanceCategoryCardProps {
  label: string;
  value: number;
  changeAbs: number;
  changePercent: number;
  // When set, an "Earning N%" pill replaces the change row (2026-10-06,
  // direct feedback, Money tile on Home).
  earningRate?: number;
  onClick?: () => void;
}

// One category's own balance summary (2026-09-13, direct feedback: "two
// [cards] on top category crypto/money with caret, value, and underneath
// up or down") — Home renders two of these side by side (Crypto, Money).
// Filled, not outlined (2026-09-16, direct feedback: "make it fill not
// just outline") — panelFlat (border + transparent background) is now
// dropped in favour of this component's own --surface-2 fill, the same
// filled-card treatment ContributingBalanceRow/HistoryItem already use
// on this page. Still Card, not a bare div: Card is what makes
// className/padding/onClick actually apply as a real interactive
// surface (confirmed earlier this session Card spreads ...props,
// unlike RadioList).
export function BalanceCategoryCard({ label, value, changeAbs, changePercent, earningRate, onClick }: BalanceCategoryCardProps) {
  const isUp = changeAbs >= 0;
  return (
    <Card className={`${styles.root}`} padding={6} {...(onClick ? { onClick } : {})}>
      <div className={styles.labelRow}>
        {/* supporting, not label (2026-09-13 follow-up, direct feedback:
            "crypto and money labels in balances smaller") — one step down
            on the type ramp. */}
        <Text type="supporting" color="secondary" data-eyebrow>
          {label}
        </Text>
        <Icon icon={ChevronRightIcon} size="sm" color="secondary" />
      </div>
      {/* large + semibold (2026-09-13, second follow-up: "balance cards
          balances slight larger, 1 scale up") — one step up from body on
          Astryx's own type ramp (body < large < display-3), landing
          between the earlier display-3 (too close to the page's own Total
          balance hero) and body (read too small once compared directly
          against the hero card next to it). */}
      <Text type="large" weight="semibold" hasTabularNumbers className={styles.value}>
        ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </Text>
      {earningRate !== undefined ? <span className={styles.earning}>
        <Icon icon={CircleStackIcon} size="sm" />
        <Text type="supporting" hasTabularNumbers className={styles.earningText}>Earning {earningRate}%</Text>
      </span> : <div className={styles.changeRow}>
        <Text type="supporting" hasTabularNumbers className={isUp ? styles.deltaUp : styles.deltaDown}>
          {isUp ? '+' : ''}
          {changeAbs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
        <TrendDelta value={changePercent} />
      </div>}
    </Card>
  );
}
