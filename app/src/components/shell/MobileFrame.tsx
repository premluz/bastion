import { useId } from 'react';
import { Avatar } from '@astryxdesign/core/Avatar';
import { ChatMessage, ChatMessageBubble } from '@astryxdesign/core/Chat';
import { Icon } from '@astryxdesign/core/Icon';
import { IconButton } from '@astryxdesign/core/IconButton';
import { TextInput } from '@astryxdesign/core/TextInput';
import { SignalIcon } from '@heroicons/react/24/outline';
import { AssetsHomePage } from './AssetsHomePage';
import { ChatBarComposer } from './ChatBarComposer';
import { ConversationModeOverlay } from './ConversationModeOverlay';
import { TabBar } from './TabBar';
import { useMobileFrame, type MobileFrameProps } from './useMobileFrame';
import styles from './MobileFrame.module.css';

// Bastion's mobile app shell — the counterpart to Merlin's Frame.tsx, and
// the single story entry point (Shell/MobileFrame) through which every page
// is reached by navigating the TabBar, exactly as Merlin's pages are reached
// inside Shell/Frame rather than as standalone page stories. Navigation state
// is local (useMobileFrame) until ScreenStack/pageStore lands in Phase 3.
export function MobileFrame(props: MobileFrameProps) {
  const state = useMobileFrame(props);
  const composerId = useId();
  const transcript = state.messages.map(({ id, text }) => (
    <ChatMessage sender="user" key={id}><ChatMessageBubble>{text}</ChatMessageBubble></ChatMessage>
  ));
  // Home tab (2026-09-12, revised 2026-09-13): renders AssetsHomePage below
  // the SAME shared avatar/search header every other tab uses, rather than
  // a second copy of it — direct feedback clarified the fixed region is
  // just avatar+search, with "All mainnets"/balance/action row scrolling
  // away with the rest of the content, same as any other tab's body. The
  // prior version had AssetsHomePage bring its own duplicate identity row
  // pinned above ITS OWN copy of the balance/actions, which fixed the
  // wrong boundary. .header's own ::after fade (below) already does
  // exactly the soft-scroll-under effect asked for — reused here, not
  // rebuilt a second time inside AssetsHomePage.
  //
  // Depends on the tab alone, never the mode: gating this on mode too
  // unmounted the page the instant the assistant opened, so the recede
  // had nothing left to animate and the content vanished outright
  // instead of scaling and blurring back.
  const isHome = state.activeTab === 'home';
  return (
    <div className={styles.stage}>
      <div className={styles.phone} data-testid="mobile-shell" data-mode={state.mode}>
        <div className={styles.chrome} inert={state.mode === 'conversation'} aria-hidden={state.mode === 'conversation'}>
          <header className={styles.header} aria-label="Asset search">
            <Avatar name="Preview user" size="small" />
            <TextInput label="Search assets" isLabelHidden startIcon="search" value="" placeholder="Search assets" isDisabled />
          </header>
          {isHome ? (
            <main className={styles.page} aria-label="Home" tabIndex={0}>
              <AssetsHomePage />
            </main>
          ) : (
            <main className={styles.content} aria-label="Preview transcript" tabIndex={0}>{transcript}</main>
          )}
          <footer className={styles.dock}>
            <TabBar activeTab={state.activeTab} onTabChange={state.selectTab} isComposerOpen={state.mode !== 'idle'}
              isConversation={state.mode === 'conversation'} onAssistantPress={state.toggleComposer}
              composerId={composerId} assistantRef={state.assistantRef} />
            <section id={composerId} className={styles.composer} inert={state.mode !== 'composer'}
              aria-hidden={state.mode !== 'composer'} aria-label="Assistant composer">
              <div className={styles.composerClip}><div className={styles.composerBody}>
              <ChatBarComposer value={state.value} onChange={state.setValue} onSubmit={state.submit}
                placeholder="Ask anything" inputRef={state.inputRef}
                footerActions={<IconButton label="Close composer" tooltip="Close composer" icon={<Icon icon="close" />}
                  variant="ghost" onClick={state.closeComposer} />}
                sendActions={<>
                  <IconButton label="Microphone unavailable in preview" icon={<Icon icon="microphone" />} variant="ghost" isDisabled />
                  <IconButton label="Start conversation mode" tooltip="Start conversation mode" icon={<Icon icon={SignalIcon} />}
                    variant="ghost" onClick={state.openConversation} ref={state.conversationRef} />
                </>} /></div></div>
            </section>
          </footer></div></div>
      <ConversationModeOverlay isOpen={state.mode === 'conversation'} onClose={() => state.setMode('composer')} sharedOrb>
        {transcript}
      </ConversationModeOverlay>
    </div>
  );
}
