import { useState } from 'react';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Button } from '@astryxdesign/core/Button';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import { Item } from '@astryxdesign/core/Item';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Switch } from '@astryxdesign/core/Switch';
import { Text } from '@astryxdesign/core/Text';
import { PlusIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import type { AccountScreen, PreviewAccount } from './accountTypes';
import styles from './AccountPages.module.css';

export function AccountManagePage({ accounts, account, screen, navigate, select, update }: {
  accounts: PreviewAccount[]; account: PreviewAccount; screen: AccountScreen;
  navigate: (screen: AccountScreen) => void; select: (id: string) => void;
  update: (patch: Partial<PreviewAccount>) => void;
}) {
  const [name, setName] = useState(account.name);
  return <div className={styles.body}>
    {screen === 'accounts' ? <>
      <Button label="Add account" icon={<Icon icon={PlusIcon} />} onClick={() => navigate('add')} />
      {accounts.map((item) => <div className={styles.accountRow} key={item.id}>
        <Button label={item.name} variant="ghost" className={styles.selectAccount} onClick={() => select(item.id)}
          icon={<Avatar name={item.initials} size="small" />} />
        {item.id === account.id && <Icon icon="check" />}
        <IconButton label={`Addresses for ${item.name}`} icon={<Icon icon={QrCodeIcon} />} variant="ghost"
          onClick={() => { select(item.id); navigate('addresses'); }} />
        <IconButton label={`Edit ${item.name}`} icon={<Icon icon="moreHorizontal" />} variant="ghost"
          onClick={() => { select(item.id); navigate('edit'); }} />
      </div>)}
    </> : <>
      <div className={styles.avatarHero}><span className={styles.largeAvatar}><Text type="display-1">{account.initials}</Text></span></div>
      <TextInput label="Account name" value={name} onChange={(value) => setName(value.slice(0, 40))} />
      <Button label="Save name" isDisabled={!name.trim() || name.trim() === account.name} onClick={() => update({ name: name.trim() })} />
      <Item className={styles.row} label="Account addresses" endContent={<Icon icon="chevronRight" />} onClick={() => navigate('addresses')} />
      <Switch label="Notifications" value={account.notifications} onChange={(value) => update({ notifications: value })} />
      <Item className={styles.row} label="Show recovery phrase" description="Demo accounts have no recovery phrase." isDisabled />
    </>}
  </div>;
}
