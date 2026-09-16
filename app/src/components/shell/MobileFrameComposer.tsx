import { Icon } from '@astryxdesign/core/Icon';
import { IconButton } from '@astryxdesign/core/IconButton';
import { SignalIcon, ClockIcon } from '@heroicons/react/24/outline';
import { ChatBarComposer } from './ChatBarComposer';
import type { useMobileFrame } from './useMobileFrame';
import styles from './MobileFrameComposer.module.css';

// Top header (2026-09-16, direct feedback: "on composer these X and
// history should be on top, and in conversation mode we shouldn't have
// those on top") — this header lives HERE, on the composer screen only;
// ConversationModeOverlay (voice/conversation mode) deliberately has no
// top header at all, back to its original bottom-controls-only layout.
// The composer's own former footer close button (bottom-left, inside
// ChatBarComposer's footerActions) is removed as redundant now that this
// top X does the same job.
export function MobileFrameComposer({ state }: { state: ReturnType<typeof useMobileFrame> }) {
  return <div className={styles.root}>
    <div className={styles.header}>
      <IconButton label="Close assistant" tooltip="Close assistant" icon={<Icon icon="close" />}
        variant="ghost" onClick={state.closeComposer} />
      <IconButton label="Chat history" icon={<Icon icon={ClockIcon} />} variant="ghost" />
    </div>
    <ChatBarComposer value={state.value} onChange={state.setValue} onSubmit={state.submit}
      placeholder="Ask anything" inputRef={state.inputRef}
      sendActions={<>
        <IconButton label="Microphone unavailable in preview" icon={<Icon icon="microphone" />} variant="ghost" isDisabled />
        <IconButton label="Start conversation mode" tooltip="Start conversation mode" icon={<Icon icon={SignalIcon} />}
          variant="ghost" onClick={state.openConversation} ref={state.conversationRef} />
      </>} />
  </div>;
}
