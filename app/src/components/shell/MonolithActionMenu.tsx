import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Popover } from '@astryxdesign/core/Popover';
import { notifyPrototypeUnavailable } from './PrototypeNotice';
import { PLUS_TRIGGER_ICON, QUICK_ACTIONS } from './PillNavigation';
import pillStyles from './PillNavigation.module.css';
import styles from './MonolithNavMenu.module.css';

interface MonolithActionMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string | undefined;
}

export function MonolithActionMenu({ isOpen, onOpenChange, className }: MonolithActionMenuProps) {
  const select = () => { onOpenChange(false); notifyPrototypeUnavailable(); };
  const menu = <div className={styles.menu} data-testid="monolith-action-menu">
    {QUICK_ACTIONS.map(({ id, label, icon }) => <Button key={id} label={label} icon={<Icon icon={icon} size="md" />}
      variant="ghost" className={styles.item} onClick={select} />)}
  </div>;
  return <Popover label="Quick actions" placement="above" alignment="end" width="var(--pill-menu-width)"
    isOpen={isOpen} onOpenChange={onOpenChange} content={menu} className={`${styles.popover} ${styles.popoverEnd}`}>
    {(trigger) => <IconButton {...trigger} label={isOpen ? 'Close quick actions' : 'Open quick actions'} variant="secondary"
      className={`${pillStyles.toggle}${className ? ` ${className}` : ''}`} icon={PLUS_TRIGGER_ICON} />}
  </Popover>;
}
