import { useState, type ReactNode, type Ref } from 'react';
import { Icon } from '@astryxdesign/core/Icon';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Text } from '@astryxdesign/core/Text';
import { HomeIcon, MagnifyingGlassIcon, Squares2X2Icon, WalletIcon } from '@heroicons/react/24/outline';
import { AssistantOrb, type AssistantActivity } from './AssistantOrb';
import { DockMenu, type DockMenuItem } from './DockMenu';
import { PLUS_TRIGGER_ICON, QUICK_ACTIONS } from './PillNavigation';
import type { TabDestination } from './TabBar';
import pillStyles from './PillNavigation.module.css';
import '../../theme/agent-dock.css';
import styles from './AgentDock.module.css';

const USER_FIRST_NAME = 'Prem';
const NAV_ICON = <Icon icon={Squares2X2Icon} size="lg" />;
const DESTINATIONS = [
  { id: 'home', label: 'Home', icon: HomeIcon }, { id: 'markets', label: 'Explore', icon: MagnifyingGlassIcon },
  { id: 'assets', label: 'Wallet', icon: WalletIcon },
] as const;
const isDestination = (id: string): id is TabDestination => DESTINATIONS.some((item) => item.id === id);

function greeting(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export interface AgentDockProps {
  isAwake: boolean;
  activeTab: TabDestination;
  onWake: () => void;
  onSleep: () => void;
  onNavigate: (tab: TabDestination) => void;
  /** The conversation since waking; it takes the page's place once there is one. */
  thread: ReactNode;
  isWorking: boolean;
  /** What the assistant hears or is doing, under the orb while awake. */
  caption: string;
  activity: AssistantActivity;
  speaking: boolean;
  threadRef?: Ref<HTMLDivElement>;
  orbRef?: Ref<HTMLButtonElement>;
}

// Persistent nav + assistant (2026-10-09, direct feedback): the orb lives in
// the dock asleep; tapping it wakes voice mode right here — the side menus
// give way to a stop button and a live caption, and nothing opens over the
// page. The page only gives way once there is a command to work on.
export function AgentDock({ isAwake, activeTab, onWake, onSleep, onNavigate, thread, isWorking, caption, activity, speaking, threadRef, orbRef }: AgentDockProps) {
  const [navOpen, setNavOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const destinations: DockMenuItem[] = DESTINATIONS.map((item) => ({ ...item, isCurrent: item.id === activeTab }));
  return <>
    {(navOpen || actionsOpen) && <button type="button" className={pillStyles.scrim} aria-hidden="true" tabIndex={-1}
      onClick={() => { setNavOpen(false); setActionsOpen(false); }} />}
    {isWorking && <div ref={threadRef} className={styles.thread} role="log" aria-label="Assistant transcript" tabIndex={0}>{thread}</div>}
    <div className={styles.dock} data-awake={isAwake}>
      <button ref={orbRef} type="button" className={styles.orb} onClick={isAwake ? undefined : onWake}
        aria-label={isAwake ? 'Assistant is listening' : 'Wake the assistant'} aria-disabled={isAwake}>
        <AssistantOrb activity={isAwake ? activity : 'listening'} expanded speaking={isAwake && speaking} />
      </button>
      <div className={`${pillStyles.root} ${styles.row}`} data-open={actionsOpen}>
        {isAwake ? <>
          <IconButton label="Stop the assistant" icon={<Icon icon="close" />} variant="secondary" className={`${pillStyles.toggle} ${styles.navToggle}`} onClick={onSleep} />
          <Text type="body" className={styles.greeting} aria-live="polite">{caption}</Text>
          <span aria-hidden="true" />
        </> : <>
          <DockMenu label="Navigation" items={destinations} isOpen={navOpen} onOpenChange={setNavOpen} alignment="start"
            onSelect={(id) => { if (isDestination(id)) onNavigate(id); }} triggerIcon={NAV_ICON} className={styles.navToggle} />
          <Text type="body" className={styles.greeting}>{greeting(new Date().getHours())} {USER_FIRST_NAME}</Text>
          <DockMenu label="Quick actions" items={QUICK_ACTIONS} isOpen={actionsOpen} onOpenChange={setActionsOpen} alignment="end"
            onSelect={() => undefined} triggerIcon={PLUS_TRIGGER_ICON} className={styles.plusToggle} />
        </>}
      </div>
    </div>
  </>;
}
