import { Avatar } from '@astryxdesign/core/Avatar';
import { avatarProps } from '../../avatars';
import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import { Text } from '@astryxdesign/core/Text';
import { UserCircleIcon, ChatBubbleLeftIcon, HeartIcon, ClockIcon, Cog6ToothIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import type { AccountScreen } from './accountTypes';
import { notifyPrototypeUnavailable } from './PrototypeNotice';
import styles from './AccountExperience.module.css';

const links = [
  ['profile', 'Profile', UserCircleIcon], ['chats', 'Chats', ChatBubbleLeftIcon],
  ['watchlist', 'Watchlist', HeartIcon], ['history', 'History', ClockIcon],
  ['settings', 'Settings', Cog6ToothIcon], ['help', 'Help & support', QuestionMarkCircleIcon],
] as const;

export function AccountMenu({ name, onNavigate }: { name: string; onNavigate: (screen: AccountScreen) => void }) {
  return <nav className={styles.menu} aria-label="Account menu">
    <Avatar {...avatarProps('Bastion demo')} size="medium" />
    <Text type="large">@bastion.demo</Text>
    <Button label={name} variant="ghost" icon={<Icon icon="chevronDown" />} onClick={notifyPrototypeUnavailable} />
    {links.map(([screen, label, icon]) => <Button key={screen} label={label} variant="ghost"
      className={screen === 'settings' ? styles.bottomLink : undefined}
      icon={<Icon icon={icon} />} onClick={screen === 'settings' ? () => onNavigate(screen) : notifyPrototypeUnavailable} />)}
  </nav>;
}
