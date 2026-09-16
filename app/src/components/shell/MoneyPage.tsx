import { Heading } from '@astryxdesign/core/Heading';
import { Icon } from '@astryxdesign/core/Icon';
import { Text } from '@astryxdesign/core/Text';
import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl';
import { WalletActionRow } from './WalletActionRow';
import { ContributingBalanceRow } from './ContributingBalanceRow';
import { CardDeck } from './CardDeck';
import { VirtualCardPlaceholder } from './VirtualCardPlaceholder';
import { WalletCardTile } from './WalletCardTile';
import { HistoryItem } from './HistoryItem';
import { InvestmentsTab } from './InvestmentsTab';
import { groupAccountHistory } from './accountHistory';
import { MONEY_HISTORY } from './moneyHistoryData';
import { MONEY_PLACEHOLDER } from './moneySummary';
import { WALLET_CARDS } from './cardData';
import heroBalanceStyles from '../../theme/heroBalance.module.css';
import styles from './MoneyPage.module.css';

// Made-up contributing balances (2026-09-15, direct feedback: "small
// scrollable cards with logo (flag USA) USD, USDT, USDC — basically
// these contributing balances") — no real fiat sub-account breakdown
// exists in the universe seed, same authored-stand-in posture as
// MONEY_PLACEHOLDER; these three sum to MONEY_PLACEHOLDER.value.
const CONTRIBUTING_BALANCES = [
  { id: 'usd', code: 'USD', amount: 1024.11, flag: '🇺🇸' },
  { id: 'usdt', code: 'USDT', amount: 1850.00, assetId: 'usdt' },
  { id: 'usdc', code: 'USDC', amount: 601.34, assetId: 'usdc' },
] as const;

export type WalletTab = 'money' | 'crypto';
export interface MoneyPageProps {
  tab: WalletTab;
  onTabChange: (tab: WalletTab) => void;
  onCardOpen?: (id: string, rect: DOMRect) => void;
}

// Portfolio/Wallet nav destination (2026-09-15, direct feedback: "this is
// essentially Portfolio item in the nav (Wallet)") — reached both from the
// Wallet nav icon directly and from Home's "Money" BalanceCategoryCard
// (which opens straight to the Money tab). Its own page, not a sheet
// (2026-09-14 ruling, unchanged): keeps MobileFrame's shared avatar/
// search header exactly as every other tab does. No back arrow (2026-09-15
// ruling): a real nav tab like Home/Explore, not a drill-down screen —
// leaving is switching tabs via the nav bar, same as leaving any other tab.
//
// tab/onTabChange are lifted to useMobileFrame, not local state
// (2026-09-15) — Home's "Money" card needs to preset this page's tab to
// Money from outside, which a page-internal useState couldn't be told.
//
// "Crypto" tab renamed to "Investments" (2026-09-16, direct feedback) —
// internal id stays 'crypto' (WalletTab/useMobileFrame/HoldingsPage all
// key off it; only the visible label changed, an unrelated rename across
// those files would be its own out-of-scope diff). Its body now lives in
// InvestmentsTab.tsx, not inlined here — a full value/chart/timeframe/
// allocation/holdings build-out pushed this file well past a page-shell's
// worth of JSX, same file-budget reasoning AssetsHomePage.tsx already
// follows as its own file rather than living inside MobileFrame.tsx.
export function MoneyPage({ tab, onTabChange, onCardOpen }: MoneyPageProps) {
  const groups = groupAccountHistory(MONEY_HISTORY, 'all');

  return (
    <div className={styles.root}>
      <div className={styles.tabRow}>
        <SegmentedControl value={tab} onChange={(value) => onTabChange(value as WalletTab)} label="Wallet section"
          layout="fill" size="lg" className={styles.tabs}>
          <SegmentedControlItem value="money" label="Money" />
          <SegmentedControlItem value="crypto" label="Investments" />
        </SegmentedControl>
      </div>
      {tab === 'money' ? (
        <>
          <div className={styles.balanceBlock}>
            <Heading level={1} type="display-1" className={heroBalanceStyles.heroBalance}>
              ${MONEY_PLACEHOLDER.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Heading>
            <div className={styles.apyRow}>
              <Text type="supporting" weight="semibold" className={styles.apy}>{MONEY_PLACEHOLDER.apy}% APY</Text>
              <Text type="supporting" color="secondary">· mUSD</Text>
              <Icon icon="info" size="sm" color="secondary" />
              {/* Estimated earnings section removed (2026-09-15, direct
                  feedback: "hide Estimated earnings section... add to
                  line 4%... 4% APY Est. annual $139.02") — the annual
                  figure now lives inline on the APY row instead of its
                  own card; Monthly is dropped, not folded in, since the
                  request only asked for the annual number here. */}
              <Text type="supporting" color="secondary">· Est. annual</Text>
              <Text type="supporting" weight="semibold" hasTabularNumbers className={styles.apy}>
                ${MONEY_PLACEHOLDER.annualEarnings.toFixed(2)}
              </Text>
            </div>
          </div>
          <ContributingBalanceRow balances={CONTRIBUTING_BALANCES} />
          <WalletActionRow variant="money" shape="circle" />
          <div className={styles.section}>
            <CardDeck aria-label="Cards"
              renderDetails={(activeIndex) => <WalletCardTile card={WALLET_CARDS[activeIndex]!} />}
              {...(onCardOpen ? { onCardOpen: (index: number, rect: DOMRect) => onCardOpen(WALLET_CARDS[index]!.id, rect) } : {})}>
              {WALLET_CARDS.map((card) => (
                <VirtualCardPlaceholder key={card.id} lastFourDigits={card.lastFourDigits} />
              ))}
            </CardDeck>
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
        </>
      ) : (
        <InvestmentsTab />
      )}
    </div>
  );
}
