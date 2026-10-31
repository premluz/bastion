import { useState, type ReactNode } from 'react';
import { Heading } from '@astryxdesign/core/Heading';
import { Icon } from '@astryxdesign/core/Icon';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Text } from '@astryxdesign/core/Text';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { resolveAssetsHomeSummary } from '../../engine/assetsHome';
import { homeAccounts } from '../../engine/homeAccounts';
import { BalanceCategoryCard } from './BalanceCategoryCard';
import { HomePromos } from './HomePromos';
import { MONEY_PLACEHOLDER } from './moneySummary';
import heroBalanceStyles from '../../theme/heroBalance.module.css';
import agentStyles from './AgentHomePage.module.css';
import styles from './CalmHomePage.module.css';

export interface CalmHomePageProps {
  onSelectMoney: () => void;
  onSelectInvestments: () => void;
  /** The assistant has a request to work on: the contents leave, bottom-up (AgentHomePage.module.css). */
  isReceding: boolean;
  /** What needs the user, then the insights (AttentionSection). */
  attention: ReactNode;
}

const usd = (value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// The calm home (2026-10-30, direct feedback with a brief and a reference: airy, quiet, an assistant's home). In order of
// what the user needs first: the day and a greeting, everything they own (and a way to hide it), their two accounts,
// what needs them, what the assistant noticed, and only then a promotion.
export function CalmHomePage({ onSelectMoney, onSelectInvestments, isReceding, attention }: CalmHomePageProps) {
  const summary = resolveAssetsHomeSummary();
  const accounts = homeAccounts(MONEY_PLACEHOLDER.value, summary.totalValue);
  const [isHidden, setIsHidden] = useState(false);
  return (
    <div className={`${agentStyles.root} ${styles.root}`} data-receding={isReceding ? '' : undefined} inert={isReceding} aria-hidden={isReceding || undefined}>
      <section className={styles.total} aria-label="Total assets" data-recede-step="6">
        <div className={styles.totalLabel}>
          <Text type="label" color="secondary" data-eyebrow>Total assets</Text>
          <IconButton label={isHidden ? 'Show balances' : 'Hide balances'} variant="ghost" size="sm" className={styles.eye}
            icon={<Icon icon={isHidden ? EyeSlashIcon : EyeIcon} size="sm" />} aria-pressed={isHidden} onClick={() => setIsHidden((value) => !value)} />
        </div>
        {/* The same figure style as the Money and Investments pages' main balance (2026-10-31, direct feedback). */}
        <Heading level={2} type="display-1" className={heroBalanceStyles.heroBalance}>{isHidden ? '••••••' : usd(accounts.total)}</Heading>
      </section>
      <div className={styles.accounts} data-recede-step="5">
        <BalanceCategoryCard label="Money" value={accounts.money} changeAbs={MONEY_PLACEHOLDER.changeAbs} changePercent={MONEY_PLACEHOLDER.changePercent}
          earningRate={MONEY_PLACEHOLDER.earningRate} isMasked={isHidden} onClick={onSelectMoney} />
        <BalanceCategoryCard label="Investments" value={accounts.investments} changeAbs={summary.changeAbs} changePercent={summary.changePercent}
          glow isMasked={isHidden} onClick={onSelectInvestments} />
      </div>
      {attention}
      <div className={styles.promo}><HomePromos /></div>
    </div>
  );
}
