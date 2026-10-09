import { useRef, type ReactNode } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Popover } from '@astryxdesign/core/Popover';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import type { HomeIcon } from '@heroicons/react/24/outline';
import { PROTOTYPE_NOTICE, notifyPrototypeUnavailable } from './PrototypeNotice';
import styles from './PillNavigation.module.css';

export interface DockMenuItem {
  id: string;
  label: string;
  icon: typeof HomeIcon;
  /** Not built in this prototype: selecting it shows the prototype notice. */
  isPrototype?: boolean;
  isCurrent?: boolean;
}

function DockMenuAction({ item, onSelect }: { item: DockMenuItem; onSelect: (item: DockMenuItem) => void }) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  return <>
    <Button ref={buttonRef} label={item.label} endContent={<Icon icon={item.icon} size="lg" />} variant="ghost" className={styles.action}
      aria-current={item.isCurrent ? 'page' : undefined} onClick={() => onSelect(item)} />
    {item.isPrototype && <Tooltip anchorRef={buttonRef} content={PROTOTYPE_NOTICE} placement="above" hasHoverIndication={false} />}
  </>;
}

export interface DockMenuProps {
  label: string;
  items: readonly DockMenuItem[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (id: string) => void;
  /** Icon inside the round glass trigger. */
  triggerIcon: ReactNode;
  alignment: 'start' | 'end';
  className?: string | undefined;
}

// The dock's glass popover menu (2026-10-09, lifted out of PillNavigation so
// the agent home's left nav menu and right + menu share one implementation):
// liquid-glass panel popping from its trigger corner, items rising in.
export function DockMenu({ label, items, isOpen, onOpenChange, onSelect, triggerIcon, alignment, className }: DockMenuProps) {
  const select = (item: DockMenuItem) => {
    onOpenChange(false);
    if (item.isPrototype) notifyPrototypeUnavailable();
    onSelect(item.id);
  };
  const menu = <div className={styles.menu} data-alignment={alignment}>
    {items.map((item) => <DockMenuAction key={item.id} item={item} onSelect={select} />)}
  </div>;
  return (
    <Popover label={label} placement="above" alignment={alignment} width="var(--pill-menu-width)"
      isOpen={isOpen} onOpenChange={onOpenChange} content={menu} className={alignment === 'start' ? `${styles.popover} ${styles.popoverStart}` : styles.popover}>
      {(trigger) => <IconButton {...trigger} label={isOpen ? `Close ${label.toLowerCase()}` : `Open ${label.toLowerCase()}`} variant="secondary"
        className={`${styles.toggle}${className ? ` ${className}` : ''}`} icon={triggerIcon} />}
    </Popover>
  );
}
