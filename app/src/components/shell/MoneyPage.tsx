import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { Icon } from '@astryxdesign/core/Icon';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Button } from '@astryxdesign/core/Button';
import { Text } from '@astryxdesign/core/Text';
import { WalletActionRow } from './WalletActionRow';
import { HistoryItem } from './HistoryItem';
import { groupAccountHistory } from './accountHistory';
import { MONEY_HISTORY } from './moneyHistoryData';
import { MONEY_PLACEHOLDER } from './moneySummary';
import styles from './MoneyPage.module.css';

export interface MoneyPageProps { onBack: () => void }

// Its own page, not a sheet (2026-09-14, direct feedback: "treat it like a
// page not sheet") — reached by tapping Home's "Money" BalanceCategoryCard,
// gated in useMobileFrame as its own homeScreen state rather than a new
// AccountExperience-style overlay. Keeps MobileFrame's shared avatar/
// search header exactly as every other tab does; this page supplies its
// own back control and title in its own scrolling body, same boundary
// AssetsHomePage already draws between the fixed header and its content.
export function MoneyPage({ onBack }: MoneyPageProps) {
  const groups = groupAccountHistory(MONEY_HISTORY, 'all');
  return (
    <div className={styles.root}>
      <div className={styles.titleRow}>
        <IconButton label="Back" icon={<Icon icon="chevronLeft" />} variant="ghost" onClick={onBack} />
        <Heading level={1} type="display-2">Money</Heading>
      </div>
      <div className={styles.balanceBlock}>
        <Heading level={2} type="display-1" className={styles.balance}>
          ${MONEY_PLACEHOLDER.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Heading>
        <div className={styles.apyRow}>
          <Text type="supporting" weight="semibold" className={styles.apy}>{MONEY_PLACEHOLDER.apy}% APY</Text>
          <Text type="supporting" color="secondary">· mUSD</Text>
          <Icon icon="info" size="sm" color="secondary" />
        </div>
      </div>
      <WalletActionRow variant="money" />
      <Card className={`${styles.earnings} panelFlat`} padding={4}>
        <div className={styles.earningsHeader}>
          <Text type="label" weight="semibold">Estimated earnings</Text>
          <Icon icon="info" size="sm" color="secondary" />
        </div>
        <div className={styles.earningsRow}>
          <Text type="body" color="secondary">Monthly</Text>
          <Text type="body" weight="semibold" hasTabularNumbers className={styles.earningsValue}>
            ${MONEY_PLACEHOLDER.monthlyEarnings.toFixed(2)}
          </Text>
        </div>
        <div className={styles.earningsRow}>
          <Text type="body" color="secondary">Annual</Text>
          <Text type="body" weight="semibold" hasTabularNumbers className={styles.earningsValue}>
            ${MONEY_PLACEHOLDER.annualEarnings.toFixed(2)}
          </Text>
        </div>
      </Card>
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Text type="label" weight="semibold">MetaMask Card</Text>
          <Icon icon="chevronRight" size="sm" color="secondary" />
        </div>
        <Card className={`${styles.cardPromo} panelFlat`} padding={4}>
          <div className={styles.cardArt} aria-hidden="true">
            <Text type="supporting" weight="semibold" className={styles.cardArtLabel}>MetaMask</Text>
          </div>
          <div className={styles.cardPromoBody}>
            <Text type="body" weight="semibold">Metal card</Text>
            <span className={styles.cardBadge}>
              <Text type="supporting" weight="semibold" className={styles.cardBadgeText}>3% mUSD back</Text>
            </span>
          </div>
          <Button label="Manage" variant="secondary" size="sm" className={styles.manageButton} />
        </Card>
      </div>
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Text type="label" weight="semibold">Activity</Text>
          <Icon icon="chevronRight" size="sm" color="secondary" />
        </div>
        <div className={styles.activityList}>
          {groups.map((group) => (
            <div key={group.day} className={styles.activityGroup}>
              <Text type="supporting" color="secondary">{group.label}</Text>
              {group.items.map((entry) => <HistoryItem key={entry.id} entry={entry} />)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
