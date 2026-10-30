import { useEffect, useState } from 'react';
import { Icon } from '@astryxdesign/core/Icon';
import { IconButton } from '@astryxdesign/core/IconButton';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { ROOT_DOCK, type DockContext } from './dockContext';
import { MonolithActionMenu } from './MonolithActionMenu';
import { MonolithNavMenu } from './MonolithNavMenu';
import type { TabDestination } from './TabBar';
import agentStyles from './AgentDock.module.css';
import pillStyles from './PillNavigation.module.css';
import '../../theme/dock-context.css';
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
  /** What the dock offers: the navigation, or a page's way back (dockContext.ts). */
  context?: DockContext;
}

// The menu, the cube and the + (2026-10-29), or, while a page has the dock (2026-10-30), that page's way back. The way
// back takes the menu's own place, bottom left: the button stays where it is and only its icon changes, while the cube
// and the + leave around it (theme/dock-context.css). Both states stay mounted, so either way the swap is live motion.
export function MonolithNavigation({ activeTab, walletTab, onNavigate, onMoney, onInvestments, onOpen, isComposerOpen, working, context = ROOT_DOCK }: MonolithNavigationProps) {
  const [navOpen, setNavOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const isRoot = context.kind === 'root';
  useEffect(() => {
    if (isComposerOpen || !isRoot) { setNavOpen(false); setActionsOpen(false); }
  }, [isComposerOpen, isRoot]);
  return <>
    {(navOpen || actionsOpen) && <button type="button" className={styles.scrim} aria-label="Close menu backdrop" tabIndex={-1}
      data-testid="monolith-menu-scrim"
      onClick={() => { setNavOpen(false); setActionsOpen(false); }} />}
    <div className={`${agentStyles.dock} ${styles.dock}`} data-menu-open={navOpen || actionsOpen} data-composer-open={isComposerOpen}
      data-dock-context={context.kind}>
      <div className={`${pillStyles.root} ${agentStyles.row} ${styles.row}`} data-open={actionsOpen} data-testid="monolith-navigation">
        <div className={styles.lead}>
          <span className={styles.menu} inert={!isRoot}>
            <MonolithNavMenu activeTab={activeTab} walletTab={walletTab} onNavigate={onNavigate} onMoney={onMoney} onInvestments={onInvestments} isOpen={navOpen}
              onOpenChange={(open) => { setNavOpen(open); if (open) setActionsOpen(false); }} className={`${agentStyles.navToggle} ${styles.button}`} />
          </span>
          <span className={styles.back} inert={context.kind !== 'back'}>
            <IconButton label={context.kind === 'back' ? context.label : 'Back'} variant="ghost" className={styles.backButton}
              icon={<Icon icon={ArrowLeftIcon} size="lg" />} {...(context.kind === 'back' ? { onClick: context.onBack } : {})} />
          </span>
        </div>
        <div className={`${agentStyles.center} ${styles.leaves}`} inert={!isRoot} data-leave-order="2">
          <button type="button" className={`${agentStyles.orb} ${styles.slot}`} aria-label="Open assistant"
            data-dock-cube="" data-cube-working={working} onClick={onOpen} />
        </div>
        <span className={styles.leaves} inert={!isRoot} data-leave-order="1">
          <MonolithActionMenu isOpen={actionsOpen}
            onOpenChange={(open) => { setActionsOpen(open); if (open) setNavOpen(false); }}
            className={`${agentStyles.plusToggle} ${styles.button}`} />
        </span>
      </div>
    </div>
  </>;
}
