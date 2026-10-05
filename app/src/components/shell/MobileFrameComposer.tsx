import { Icon } from '@astryxdesign/core/Icon';
import { IconButton } from '@astryxdesign/core/IconButton';
import { SignalIcon } from '@heroicons/react/24/outline';
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
export function MobileFrameComposer({ state, onVoiceStart, voiceSupported }: {
  state: ReturnType<typeof useMobileFrame>;
  onVoiceStart: () => void;
  voiceSupported: boolean;
}) {
  return <ChatBarComposer value={state.value} onChange={state.setValue} onSubmit={state.submit}
    placeholder="Ask anything" inputRef={state.inputRef}
    sendActions={<>
      <IconButton label={voiceSupported ? 'Start voice recognition' : 'Speech recognition unavailable in this browser'}
        icon={<Icon icon="microphone" />} variant="ghost" isDisabled={!voiceSupported} onClick={onVoiceStart} data-dock-item="mic" />
      <IconButton label="Start conversation mode" tooltip="Start conversation mode" icon={<Icon icon={SignalIcon} />}
        variant="ghost" onClick={onVoiceStart} ref={state.conversationRef} data-dock-item="voice" />
    </>} />;
}
