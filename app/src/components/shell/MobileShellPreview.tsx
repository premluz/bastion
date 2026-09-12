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
import { useMobileShellPreview, type MobileShellPreviewProps } from './useMobileShellPreview';
import styles from './MobileShellPreview.module.css';

// This harness is imported by stories only; it is not the mobile Frame or ScreenStack.
export function MobileShellPreview(props: MobileShellPreviewProps) {
  const state = useMobileShellPreview(props);
  const composerId = useId();
  const transcript = state.messages.map(({ id, text }) => (
    <ChatMessage sender="user" key={id}><ChatMessageBubble>{text}</ChatMessageBubble></ChatMessage>
  ));
  // Home tab (2026-09-12): renders AssetsHomePage instead of the assistant
  // transcript — AssetsHomePage brings its own avatar/search row (glow
  // header), so the harness's own plain .header is skipped here rather
  // than stacking two search rows. Any other tab, or the composer/
  // conversation assistant modes regardless of tab, keep the prior
  // transcript-only placeholder — Markets/Trade/Assets pages are out of
  // this task's scope.
  const isHome = state.activeTab === 'home' && state.mode === 'idle';
  return (
    <div className={styles.stage}>
      <div className={styles.phone} data-testid="mobile-shell" data-mode={state.mode}>
        <div className={styles.chrome} inert={state.mode === 'conversation'} aria-hidden={state.mode === 'conversation'}>
          {isHome ? (
            <main className={styles.content} aria-label="Home" tabIndex={0}>
              <AssetsHomePage />
            </main>
          ) : (
            <>
              <header className={styles.header} aria-label="Asset search">
                <Avatar name="Preview user" size="small" />
                <TextInput label="Search assets" isLabelHidden startIcon="search" value="" placeholder="Search assets" isDisabled />
              </header>
              <main className={styles.content} aria-label="Preview transcript" tabIndex={0}>{transcript}</main>
            </>
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
