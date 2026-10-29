import { useEffect, useState } from 'react';
import { MonolithActionMenu } from './MonolithActionMenu';
import { MonolithNavMenu } from './MonolithNavMenu';
import type { TabDestination } from './TabBar';
import agentStyles from './AgentDock.module.css';
import pillStyles from './PillNavigation.module.css';
import styles from './MonolithNavigation.module.css';

interface MonolithNavigationProps {
  activeTab: TabDestination;
  walletTab: 'money' | 'crypto';
  onNavigate: (tab: TabDestination) => void;
  onMoney: () => void;
  onInvestments: () => void;
  onOpen: () => void;
  isComposerOpen: boolean;
  working: boolean;
}

export function MonolithNavigation({ activeTab, walletTab, onNavigate, onMoney, onInvestments, onOpen, isComposerOpen, working }: MonolithNavigationProps) {
  const [navOpen, setNavOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  useEffect(() => {
    if (isComposerOpen) { setNavOpen(false); setActionsOpen(false); }
  }, [isComposerOpen]);
  return <>
    {(navOpen || actionsOpen) && <button type="button" className={styles.scrim} aria-label="Close menu backdrop" tabIndex={-1}
      data-testid="monolith-menu-scrim"
      onClick={() => { setNavOpen(false); setActionsOpen(false); }} />}
    <div className={`${agentStyles.dock} ${styles.dock}`} data-menu-open={navOpen || actionsOpen} data-composer-open={isComposerOpen}>
      <div className={`${pillStyles.root} ${agentStyles.row} ${styles.row}`} data-open={actionsOpen} data-testid="monolith-navigation">
        <MonolithNavMenu activeTab={activeTab} walletTab={walletTab} onNavigate={onNavigate} onMoney={onMoney} onInvestments={onInvestments} isOpen={navOpen}
          onOpenChange={(open) => { setNavOpen(open); if (open) setActionsOpen(false); }} className={agentStyles.navToggle} />
        <div className={agentStyles.center}>
          <button type="button" className={`${agentStyles.orb} ${styles.slot}`} aria-label="Open assistant"
            data-dock-cube="" data-cube-working={working} onClick={onOpen} />
        </div>
        <MonolithActionMenu isOpen={actionsOpen}
          onOpenChange={(open) => { setActionsOpen(open); if (open) setNavOpen(false); }}
          className={agentStyles.plusToggle} />
      </div>
    </div>
  </>;
}
