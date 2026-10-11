import { useState, type ReactNode, type Ref } from 'react';
import { Icon } from '@astryxdesign/core/Icon';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Text } from '@astryxdesign/core/Text';
import { AssistantOrb, type AssistantActivity } from './AssistantOrb';
import { DockMenu } from './DockMenu';
import { DockNavMenu } from './DockNavMenu';
import { PLUS_TRIGGER_ICON, QUICK_ACTIONS } from './PillNavigation';
import type { TabDestination } from './TabBar';
import pillStyles from './PillNavigation.module.css';
import '../../theme/agent-dock.css';
import styles from './AgentDock.module.css';

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
  return <>
    {(navOpen || actionsOpen) && <button type="button" className={pillStyles.scrim} aria-hidden="true" tabIndex={-1}
      onClick={() => { setNavOpen(false); setActionsOpen(false); }} />}
    {isWorking && <div ref={threadRef} className={styles.thread} role="log" aria-label="Assistant transcript" tabIndex={0}>{thread}</div>}
    <div className={styles.dock} data-awake={isAwake} data-menu-open={navOpen || actionsOpen}>
      {/* One row (2026-10-10, direct feedback): the orb sits level with the two buttons,
          and the slot for what the user is saying rides above it — blank while asleep. */}
      <div className={`${pillStyles.root} ${styles.row}`} data-open={actionsOpen}>
        {isAwake
          ? <IconButton label="Stop the assistant" icon={<Icon icon="close" />} variant="secondary" className={`${pillStyles.toggle} ${styles.navToggle}`} onClick={onSleep} />
          : <DockNavMenu activeTab={activeTab} onNavigate={onNavigate} isOpen={navOpen} onOpenChange={setNavOpen} className={styles.navToggle} />}
        <div className={styles.center}>
          {isAwake && <Text type="body" className={styles.caption} aria-live="polite">{caption}</Text>}
          <button ref={orbRef} type="button" className={styles.orb} onClick={isAwake ? undefined : onWake}
            aria-label={isAwake ? 'Assistant is listening' : 'Wake the assistant'} aria-disabled={isAwake}>
            <AssistantOrb activity={isAwake ? activity : 'listening'} expanded speaking={isAwake && speaking} />
          </button>
        </div>
        {isAwake ? <span aria-hidden="true" />
          : <DockMenu label="Quick actions" items={QUICK_ACTIONS} isOpen={actionsOpen} onOpenChange={setActionsOpen} alignment="end"
            onSelect={() => undefined} triggerIcon={PLUS_TRIGGER_ICON} className={styles.plusToggle} />}
      </div>
    </div>
  </>;
}
