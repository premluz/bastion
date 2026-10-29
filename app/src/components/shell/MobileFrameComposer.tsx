import type { ReactNode } from 'react';
import { Icon } from '@astryxdesign/core/Icon';
import { IconButton } from '@astryxdesign/core/IconButton';
import { ArrowUpIcon } from '@heroicons/react/24/outline';
import { WaveformIcon } from './WaveformIcon';
import { ChatBarComposer } from './ChatBarComposer';
import type { useMobileFrame } from './useMobileFrame';

// The close+chat-history header moved to ComposerModeOverlay.tsx
// (2026-09-16 follow-up, caught live from a screenshot: a header
// rendered INSIDE this component sits wherever the dock's own expanding
// composer panel happens to grow to — near the bottom, not the true
// screen top the request actually wanted, since that panel only grows
// upward from the nav bar rather than spanning the screen). Composer
// mode is now a genuine full-screen overlay, same register as
// ConversationModeOverlay, with its own top-pinned header; this
// component goes back to being just the input row.
interface ComposerProps {
  state: ReturnType<typeof useMobileFrame>;
  onVoiceStart: () => void;
  voiceSupported: boolean;
}

// Two buttons (2026-10-13, direct feedback): dictation, and in the send slot the
// conversation-mode button while the field is empty — typing turns that slot into
// Send, clearing the field turns it back. Send outside the composer's own bar
// (2026-10-27) is ours, as the composer's can only sit inside it.
function microphone({ onVoiceStart, voiceSupported }: ComposerProps) {
  return <IconButton label={voiceSupported ? 'Start voice recognition' : 'Speech recognition unavailable in this browser'}
    icon={<Icon icon="microphone" />} variant="ghost" isDisabled={!voiceSupported} onClick={onVoiceStart} data-dock-item="mic" />;
}

function conversation({ state, onVoiceStart }: ComposerProps) {
  return <IconButton label="Start conversation mode" tooltip="Start conversation mode" icon={<Icon icon={WaveformIcon} />}
    variant="ghost" onClick={onVoiceStart} ref={state.conversationRef} data-dock-item="voice" />;
}

/** The voice buttons for a composer that does not hold them (see `isActionsOutside`): mic, and conversation mode or Send. */
export function MobileFrameComposerActions(props: ComposerProps): ReactNode {
  const { state } = props;
  return <>
    {microphone(props)}
    {state.value.trim() === '' ? conversation(props)
      : <IconButton label="Send" icon={<Icon icon={ArrowUpIcon} />} variant="ghost" onClick={() => state.submit(state.value)} data-dock-item="send" />}
  </>;
}

/** `isActionsOutside`: a single-line bar only (2026-10-27, direct feedback); its buttons live in a row below it, from MobileFrameComposerActions. */
export function MobileFrameComposer(props: ComposerProps & { isActionsOutside?: boolean }) {
  const { state, isActionsOutside = false } = props;
  const isEmpty = state.value.trim() === '';
  return <ChatBarComposer value={state.value} onChange={state.setValue} onSubmit={state.submit}
    placeholder="Ask anything" inputRef={state.inputRef}
    {...(isActionsOutside ? { sendButton: <></> } : { sendActions: microphone(props), ...(isEmpty ? { sendButton: conversation(props) } : {}) })} />;
}
