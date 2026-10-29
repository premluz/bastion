import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Popover } from '@astryxdesign/core/Popover';
import { ArrowTrendingUpIcon, GlobeAltIcon, HomeIcon, MagnifyingGlassIcon, Squares2X2Icon, WalletIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { notifyPrototypeUnavailable } from './PrototypeNotice';
import type { TabDestination } from './TabBar';
import pillStyles from './PillNavigation.module.css';
import styles from './MonolithNavMenu.module.css';

interface MonolithNavMenuProps {
  activeTab: TabDestination;
  walletTab: 'money' | 'crypto';
  onNavigate: (tab: TabDestination) => void;
  onMoney: () => void;
  onInvestments: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string | undefined;
}

export function MonolithNavMenu({ activeTab, walletTab, onNavigate, onMoney, onInvestments, isOpen, onOpenChange, className }: MonolithNavMenuProps) {
  const navigate = (tab: TabDestination) => { onOpenChange(false); onNavigate(tab); };
  const openMoney = () => { onOpenChange(false); onMoney(); };
  const openInvestments = () => { onOpenChange(false); onInvestments(); };
  const search = () => { onOpenChange(false); notifyPrototypeUnavailable(); };
  const menu = <div className={styles.menu} data-testid="monolith-nav-menu">
    <Button label="Search" icon={<Icon icon={MagnifyingGlassIcon} size="md" />} variant="ghost" className={styles.item} onClick={search} />
    <Button label="Explore" icon={<Icon icon={GlobeAltIcon} size="md" />} variant="ghost" className={styles.item}
      aria-current={activeTab === 'markets' ? 'page' : undefined} onClick={() => navigate('markets')} />
    <Button label="Money" icon={<Icon icon={WalletIcon} size="md" />} variant="ghost" className={styles.item}
      aria-current={activeTab === 'assets' && walletTab === 'money' ? 'page' : undefined} onClick={openMoney} />
    <Button label="Investments" icon={<Icon icon={ArrowTrendingUpIcon} size="md" />} variant="ghost" className={styles.item}
      aria-current={activeTab === 'assets' && walletTab === 'crypto' ? 'page' : undefined} onClick={openInvestments} />
    <Button label="Home" icon={<Icon icon={HomeIcon} size="md" />} variant="ghost" className={styles.item}
      aria-current={activeTab === 'home' ? 'page' : undefined} onClick={() => navigate('home')} />
  </div>;
  return <Popover label="Navigation" placement="above" alignment="start" width="var(--pill-menu-width)"
    isOpen={isOpen} onOpenChange={onOpenChange} content={menu} className={styles.popover}>
    {(trigger) => <IconButton {...trigger} label={isOpen ? 'Close navigation' : 'Open navigation'} variant="secondary"
      className={`${pillStyles.toggle}${className ? ` ${className}` : ''}`}
      icon={<Icon icon={isOpen ? XMarkIcon : Squares2X2Icon} size="lg" />} />}
  </Popover>;
}
