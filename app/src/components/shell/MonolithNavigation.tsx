import { useEffect, useState } from 'react';
import { DockMenu } from './DockMenu';
import { DockNavMenu } from './DockNavMenu';
import { PLUS_TRIGGER_ICON, QUICK_ACTIONS } from './PillNavigation';
import type { TabDestination } from './TabBar';
import agentStyles from './AgentDock.module.css';
import pillStyles from './PillNavigation.module.css';
import styles from './MonolithNavigation.module.css';

interface MonolithNavigationProps {
  activeTab: TabDestination;
  onNavigate: (tab: TabDestination) => void;
  onOpen: () => void;
  isComposerOpen: boolean;
  working: boolean;
}

export function MonolithNavigation({ activeTab, onNavigate, onOpen, isComposerOpen, working }: MonolithNavigationProps) {
  const [navOpen, setNavOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  useEffect(() => {
    if (isComposerOpen) { setNavOpen(false); setActionsOpen(false); }
  }, [isComposerOpen]);
  return <>
    {(navOpen || actionsOpen) && <button type="button" className={pillStyles.scrim} aria-hidden="true" tabIndex={-1}
      onClick={() => { setNavOpen(false); setActionsOpen(false); }} />}
    <div className={`${agentStyles.dock} ${styles.dock}`} data-menu-open={navOpen || actionsOpen} data-composer-open={isComposerOpen}>
      <div className={`${pillStyles.root} ${agentStyles.row} ${styles.row}`} data-open={actionsOpen} data-testid="monolith-navigation">
        <DockNavMenu activeTab={activeTab} onNavigate={onNavigate} isOpen={navOpen}
          onOpenChange={(open) => { setNavOpen(open); if (open) setActionsOpen(false); }} className={agentStyles.navToggle} />
        <div className={agentStyles.center}>
          <button type="button" className={`${agentStyles.orb} ${styles.slot}`} aria-label="Open assistant"
            data-dock-cube="" data-cube-working={working} onClick={onOpen} />
        </div>
        <DockMenu label="Quick actions" items={QUICK_ACTIONS} isOpen={actionsOpen}
          onOpenChange={(open) => { setActionsOpen(open); if (open) setNavOpen(false); }}
          onSelect={() => undefined} triggerIcon={PLUS_TRIGGER_ICON} alignment="end" className={agentStyles.plusToggle} />
      </div>
    </div>
  </>;
}
