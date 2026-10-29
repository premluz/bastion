import { Text } from '@astryxdesign/core/Text';
import { CoinLogo } from './CoinLogo';
import { fiatFlag } from '../../assets/identity/artwork';
import styles from './ContributingBalanceRow.module.css';

export interface ContributingBalance {
  id: string;
  code: string;
  amount: number;
  assetId?: string;
}

export interface ContributingBalanceRowProps { balances: readonly ContributingBalance[] }

export function ContributingBalanceRow({ balances }: ContributingBalanceRowProps) {
  return (
    <div className={styles.track} role="list" aria-label="Contributing balances">
      {balances.map((balance) => (
        <div key={balance.id} className={styles.card} role="listitem">
          <span className={styles.logo} aria-hidden="true">
            {balance.assetId ? <CoinLogo entityId={balance.assetId} label={balance.code} />
              : fiatFlag(balance.code) ? <img className={styles.flag} src={fiatFlag(balance.code)} alt="" /> : balance.code}
          </span>
          <span className={styles.body}>
            <Text type="supporting" color="secondary">{balance.code}</Text>
            <Text type="body" weight="medium" hasTabularNumbers className={styles.amount}>
              ${balance.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </span>
        </div>
      ))}
    </div>
  );
}
