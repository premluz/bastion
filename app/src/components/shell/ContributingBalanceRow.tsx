import { Text } from '@astryxdesign/core/Text';
import { CoinLogo } from './CoinLogo';
import styles from './ContributingBalanceRow.module.css';

export interface ContributingBalance {
  id: string;
  code: string;
  amount: number;
  assetId?: string;
  flag?: string;
}

export interface ContributingBalanceRowProps { balances: readonly ContributingBalance[] }

// Small horizontal scroll row under the Money balance (2026-09-15, direct
// feedback: "small scrollable cards with logo (flag USA) USD, USDT, USDC
// so basically these contributing balances"). Real placeholders, not
// fabricated logos: assetId reuses CoinLogo's own real USDT/USDC SVGs;
// plain fiat USD has no coin logo, so a flag emoji stands in until real
// art is provided — same "authored stand-in, not invented imagery"
// posture PromoCard/PromoCardFull already hold for their own art blocks.
export function ContributingBalanceRow({ balances }: ContributingBalanceRowProps) {
  return (
    <div className={styles.track} role="list" aria-label="Contributing balances">
      {balances.map((balance) => (
        <div key={balance.id} className={styles.card} role="listitem">
          <span className={styles.logo} aria-hidden="true">
            {balance.assetId ? <CoinLogo entityId={balance.assetId} label={balance.code} /> : balance.flag}
          </span>
          <span className={styles.body}>
            <Text type="supporting" color="secondary">{balance.code}</Text>
            <Text type="body" weight="semibold" hasTabularNumbers>
              ${balance.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </span>
        </div>
      ))}
    </div>
  );
}
