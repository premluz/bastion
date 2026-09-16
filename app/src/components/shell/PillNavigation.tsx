import { useId, type ReactNode, type Ref } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import { Popover } from '@astryxdesign/core/Popover';
import { HomeIcon, MagnifyingGlassIcon, WalletIcon, SparklesIcon, PlusIcon,
  BanknotesIcon, ArrowUpRightIcon, ArrowDownLeftIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import '../../theme/pill-navigation.css';
import styles from './PillNavigation.module.css';

const destinations = [
  { id: 'home', label: 'Home', icon: HomeIcon }, { id: 'explore', label: 'Explore', icon: MagnifyingGlassIcon },
  { id: 'assets', label: 'Assets', icon: WalletIcon }, { id: 'assistant', label: 'Assistant', icon: SparklesIcon },
] as const;
const actions = [
  { id: 'add-cash', label: 'Add cash', icon: BanknotesIcon }, { id: 'send', label: 'Send', icon: ArrowUpRightIcon },
  { id: 'receive', label: 'Receive', icon: ArrowDownLeftIcon }, { id: 'trade', label: 'Trade', icon: ArrowsRightLeftIcon },
] as const;
export type PillDestination = (typeof destinations)[number]['id'];
export type PillAction = (typeof actions)[number]['id'];
export interface PillNavigationProps {
  assistantRef?: Ref<HTMLButtonElement>;
  composer?: ReactNode; isComposerOpen?: boolean;
  activeItem: PillDestination; onNavigate: (destination: PillDestination) => void;
  isActionsOpen: boolean; onActionsOpenChange: (open: boolean) => void; onAction: (action: PillAction) => void;
}

export function PillNavigation({ activeItem, onNavigate, isActionsOpen, onActionsOpenChange, onAction, composer, isComposerOpen = false, assistantRef }: PillNavigationProps) {
  const composerId = useId();
  const menu = <div className={styles.menu}>{actions.map(({ id, label, icon }) =>
    <Button key={id} label={label} endContent={<Icon icon={icon} size="lg" />} variant="ghost" className={styles.action}
      onClick={() => { onActionsOpenChange(false); onAction(id); }} />)}</div>;
  return <div className={styles.dock} data-composer-open={isComposerOpen}>
    <div className={styles.root} data-open={isActionsOpen} data-testid="pill-navigation">
    <nav className={styles.pill} aria-label="Pill navigation" inert={isActionsOpen}>
      <span className={styles.track} aria-hidden="true"><span className={styles.indicator} data-active={activeItem}>
        <span key={activeItem} className={styles.highlight} />
      </span></span>
      {destinations.map(({ id, label, icon }) => <IconButton key={id} label={label} variant="ghost" className={styles.destination}
        {...(id === 'assistant' && assistantRef ? { ref: assistantRef } : {})}
        {...(id === 'assistant' && composer ? { 'aria-expanded': isComposerOpen, 'aria-controls': composerId } : {})}
        icon={<Icon icon={icon} size="lg" />} aria-current={activeItem === id ? 'page' : undefined} onClick={() => onNavigate(id)} />)}
    </nav>
    <Popover label="Quick actions" placement="above" alignment="end" width="var(--pill-menu-width)"
      isOpen={isActionsOpen} onOpenChange={onActionsOpenChange} content={menu} className={`${styles.popover}`}>
      {(trigger) => <IconButton {...trigger} label={isActionsOpen ? 'Close quick actions' : 'Open quick actions'} variant="secondary"
        className={styles.toggle} icon={<span className={styles.plus}><Icon icon={PlusIcon} size="lg" /></span>} />}
    </Popover>
    </div>
    <section id={composerId} className={styles.composer} aria-label="Assistant composer" inert={!isComposerOpen} aria-hidden={!isComposerOpen}>
      <div className={styles.composerClip}><div className={styles.composerBody}>{composer}</div></div>
    </section>
  </div>;
}
