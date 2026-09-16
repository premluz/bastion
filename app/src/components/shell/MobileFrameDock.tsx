import { useId, useState } from 'react';
import { PillNavigation, type PillAction, type PillDestination } from './PillNavigation';
import { MobileFrameComposer } from './MobileFrameComposer';
import { TabBar, type TabDestination } from './TabBar';
import type { useMobileFrame } from './useMobileFrame';
import styles from './MobileFrame.module.css';

const pillDestinations: Record<TabDestination, PillDestination> = { home: 'home', markets: 'explore', assets: 'assets', trade: 'explore' };
const actionDrafts: Record<PillAction, string> = {
  'add-cash': 'I want to add cash', send: 'I want to send crypto', receive: 'I want to receive crypto', trade: 'I want to trade crypto',
};

export function MobileFrameDock({ state, variant }: { state: ReturnType<typeof useMobileFrame>; variant: 'pill' | 'classic' }) {
  const composerId = useId();
  const [actionsOpen, setActionsOpen] = useState(false);
  const navigate = (item: PillDestination) => {
    if (item === 'assistant') state.toggleComposer();
    else state.selectTab(item === 'explore' ? 'markets' : item);
  };
  if (variant === 'pill') return <PillNavigation activeItem={state.mode === 'idle' ? pillDestinations[state.activeTab] : 'assistant'}
    onNavigate={navigate} isActionsOpen={actionsOpen} onActionsOpenChange={setActionsOpen}
    onAction={(action) => { state.setValue(actionDrafts[action]); state.setMode('composer'); }}
    isComposerOpen={state.mode === 'composer'} isConversation={state.mode === 'conversation'}
    assistantRef={state.assistantRef} composer={<MobileFrameComposer state={state} />} />;
  return <footer className={styles.dock}>
    <TabBar activeTab={state.activeTab} onTabChange={state.selectTab} isComposerOpen={state.mode !== 'idle'}
      isConversation={state.mode === 'conversation'} onAssistantPress={state.toggleComposer}
      composerId={composerId} assistantRef={state.assistantRef} />
    <section id={composerId} className={styles.composer} inert={state.mode !== 'composer'}
      aria-hidden={state.mode !== 'composer'} aria-label="Assistant composer">
      <div className={styles.composerClip}><div className={styles.composerBody}><MobileFrameComposer state={state} /></div></div>
    </section>
  </footer>;
}
