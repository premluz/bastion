import type { Ref } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import { Text } from '@astryxdesign/core/Text';
import { ArrowsRightLeftIcon, ChartBarIcon, HomeIcon, WalletIcon } from '@heroicons/react/24/outline';
import { AssistantOrb } from './AssistantOrb';
import styles from './TabBar.module.css';

// Provisional labels only; §10.9 still owns the final destinations.
const DESTINATIONS = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'markets', label: 'Markets', icon: ChartBarIcon },
  { id: 'trade', label: 'Trade', icon: ArrowsRightLeftIcon },
  { id: 'assets', label: 'Assets', icon: WalletIcon },
] as const;
export type TabDestination = (typeof DESTINATIONS)[number]['id'];

export interface TabBarProps {
  activeTab: TabDestination;
  onTabChange: (tab: TabDestination) => void;
  isComposerOpen: boolean;
  onAssistantPress: () => void;
  composerId: string;
  assistantRef?: Ref<HTMLButtonElement>;
  isConversation?: boolean;
}

// Mixed destinations and a composer action are intentionally not ARIA tabs.
export function TabBar({ activeTab, onTabChange, isComposerOpen, onAssistantPress, composerId, assistantRef, isConversation = false }: TabBarProps) {
  const destinations = DESTINATIONS.map(({ id, label, icon }) => (
    <Button key={id} label={label} variant="ghost" className={styles.item}
      aria-current={activeTab === id ? 'page' : undefined} onClick={() => onTabChange(id)}>
      <span className={styles.itemContent}>
        <span className={styles.iconSlot}><Icon icon={icon} size="lg" /></span>
        <Text type="supporting" color="inherit">{label}</Text>
      </span>
    </Button>
  ));
  return (
    <nav aria-label="Primary navigation" className={styles.root} data-conversation={isConversation}>
      {destinations.slice(0, 2)}
      <Button label="Assistant" variant="ghost" className={`${styles.item} ${styles.assistant}`}
        aria-expanded={isComposerOpen} aria-controls={composerId} onClick={onAssistantPress} {...(assistantRef ? { ref: assistantRef } : {})}>
        <span className={styles.itemContent}>
          <AssistantOrb activity={isComposerOpen ? 'listening' : 'idle'} expanded={isConversation} />
          <Text type="supporting" color="inherit" className={styles.assistantLabel}>Assistant</Text>
        </span>
      </Button>
      {destinations.slice(2)}
    </nav>
  );
}
