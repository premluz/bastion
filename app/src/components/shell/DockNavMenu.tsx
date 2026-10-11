import { Icon } from '@astryxdesign/core/Icon';
import { HomeIcon, MagnifyingGlassIcon, Squares2X2Icon, WalletIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { DockMenu, type DockMenuItem } from './DockMenu';
import type { TabDestination } from './TabBar';
import styles from './DockNavMenu.module.css';

const DESTINATIONS = [
  { id: 'home', label: 'Home', icon: HomeIcon }, { id: 'markets', label: 'Explore', icon: MagnifyingGlassIcon },
  { id: 'assets', label: 'Wallet', icon: WalletIcon },
] as const;
const isDestination = (id: string): id is TabDestination => DESTINATIONS.some((item) => item.id === id);

// The left trigger turns into an X while its menu is open, as the right one's +
// does (2026-10-10, direct feedback): the grid turns away as the X turns in.
function NavTriggerIcon({ isOpen }: { isOpen: boolean }) {
  return <span className={styles.icon} data-open={isOpen}>
    <span className={styles.grid}><Icon icon={Squares2X2Icon} size="lg" /></span>
    <span className={styles.close}><Icon icon={XMarkIcon} size="lg" /></span>
  </span>;
}

export interface DockNavMenuProps {
  activeTab: TabDestination;
  onNavigate: (tab: TabDestination) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string | undefined;
}

// The dock's left button and its destinations menu, shared by the agent and glow
// homes. Listed bottom-up: the menu opens above its button, so the last item sits
// nearest it and Home ends up at the bottom (2026-10-10, direct feedback).
export function DockNavMenu({ activeTab, onNavigate, isOpen, onOpenChange, className }: DockNavMenuProps) {
  const items: DockMenuItem[] = DESTINATIONS.map((item) => ({ ...item, isCurrent: item.id === activeTab })).reverse();
  return <DockMenu label="Navigation" items={items} isOpen={isOpen} onOpenChange={onOpenChange} alignment="start"
    onSelect={(id) => { if (isDestination(id)) onNavigate(id); }} triggerIcon={<NavTriggerIcon isOpen={isOpen} />} className={className} />;
}
