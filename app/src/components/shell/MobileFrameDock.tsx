import { useState, type ReactNode } from 'react';
import { PillNavigation, type PillDestination, type PillDestinationSet } from './PillNavigation';
import { TabBar, type TabDestination } from './TabBar';
import type { useMobileFrame } from './useMobileFrame';
import styles from './MobileFrame.module.css';

const pillDestinations: Record<TabDestination, PillDestination> = { home: 'home', markets: 'explore', assets: 'assets', trade: 'explore' };
// The composer's own UI is a full-screen ComposerModeOverlay (mounted in
// MobileFrame.tsx, same level as ConversationModeOverlay), not rendered
// inside this dock at all (2026-09-16 follow-up, caught live from a
// screenshot: a header rendered inside the dock's own expanding panel
// sits wherever that panel grows to — near the bottom, not the true
// screen top). Both nav variants' own dock now only ever renders the
// destinations/tab bar itself; isComposerOpen still flows through purely
// to drive each dock's own halo/fade cues.
export interface MobileFrameDockProps {
  state: ReturnType<typeof useMobileFrame>;
  variant: 'pill' | 'classic';
  /** The pill's destinations; `glow` splits the wallet into Cash and Investments and drops Assistant. */
  destinationSet?: PillDestinationSet;
  /** The pill's + slot, taken by something else (the attention home's orb). */
  trailing?: ReactNode;
}

export function MobileFrameDock({ state, variant, destinationSet = 'standard', trailing }: MobileFrameDockProps) {
  const [actionsOpen, setActionsOpen] = useState(false);
  const isGlow = destinationSet === 'glow';
  const navigate = (item: PillDestination) => {
    if (item === 'assistant') state.toggleComposer();
    else if (item === 'cash') state.openMoney();
    else if (item === 'investments') state.openInvestments();
    else if (item === 'explore') state.selectTab('markets');
    else state.selectTab(item);
  };
  const walletItem: PillDestination = state.walletTab === 'money' ? 'cash' : 'investments';
  const active: PillDestination = isGlow ? (state.activeTab === 'assets' ? walletItem : pillDestinations[state.activeTab])
    : state.mode === 'idle' ? pillDestinations[state.activeTab] : 'assistant';
  if (variant === 'pill') return <PillNavigation activeItem={active} destinationSet={destinationSet}
    onNavigate={navigate} isActionsOpen={actionsOpen} onActionsOpenChange={setActionsOpen}
    onAction={() => undefined}
    isComposerOpen={state.mode !== 'idle'} assistantRef={state.assistantRef} {...(trailing ? { trailing } : {})} />;
  return <footer className={styles.dock}>
    <TabBar activeTab={state.activeTab} onTabChange={state.selectTab} isComposerOpen={state.mode !== 'idle'}
      isConversation={state.mode === 'conversation'} onAssistantPress={() => state.toggleComposer()}
      assistantRef={state.assistantRef} />
  </footer>;
}
