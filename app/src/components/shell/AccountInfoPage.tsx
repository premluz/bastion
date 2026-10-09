import { Text } from '@astryxdesign/core/Text';
import { Item } from '@astryxdesign/core/Item';
import { Switch } from '@astryxdesign/core/Switch';
import { useShowTouchesStore } from '../../engine/stores/showTouchesStore';
import type { HistoryEntry } from '../../contracts/props/history-item';
import type { AccountScreen, PreviewAccount } from './accountTypes';
import { formatHistoryAmount } from './accountHistory';
import { InstallAppRow } from './InstallAppRow';
import styles from './AccountPages.module.css';

const copy: Partial<Record<AccountScreen, [string, string]>> = {
  profile: ['@bastion.demo', 'Your Bastion demo profile'],
  chats: ['No saved chats yet', 'Your conversations will appear here.'],
  watchlist: ['Your watchlist is empty', 'Assets you follow will appear here.'],
  help: ['Welcome to Bastion', 'Explore your accounts and activity. This preview uses simulated data.'],
};

export function AccountInfoPage({ screen, account, entry, update }: {
  screen: AccountScreen; account: PreviewAccount; entry: HistoryEntry | undefined;
  update: (patch: Partial<PreviewAccount>) => void;
}) {
  const showTouches = useShowTouchesStore();
  return <div className={styles.body}>
    {screen === 'addresses' && <><Text color="secondary">Demo addresses for {account.name}</Text>
      <Item className={styles.row} label="Ethereum" description="0x7c0e…afd3" />
      <Item className={styles.row} label="Solana" description="7YkP…c9mQ" /></>}
    {screen === 'settings' && <>
      <Switch label="Account notifications" value={account.notifications}
        onChange={(notifications) => update({ notifications })} />
      <Switch label="Show touches" description="Draw a dot under each finger, for demos and recordings."
        value={showTouches.enabled} onChange={showTouches.setEnabled} />
      <InstallAppRow />
    </>}
    {screen === 'transaction' && entry && <>
      <Text type="display-1">{formatHistoryAmount(entry) || entry.title}</Text>
      {[['Activity', entry.title], ['Details', entry.detail], ['Network', entry.network], ['Status', entry.status],
        ['Date', new Date(entry.occurredAt).toLocaleString('en-US', { timeZone: 'UTC' }) + ' UTC']].map(([label, value]) =>
        <div className={styles.detail} key={label}><Text color="secondary">{label}</Text><Text>{value}</Text></div>)}
    </>}
    {copy[screen] && <><Text type="large">{copy[screen][0]}</Text><Text color="secondary">{copy[screen][1]}</Text></>}
  </div>;
}
