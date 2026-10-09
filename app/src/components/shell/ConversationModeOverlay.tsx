import type { ReactNode, Ref } from 'react';
import { Dialog } from '@astryxdesign/core/Dialog';
import { Icon } from '@astryxdesign/core/Icon';
import { IconButton } from '@astryxdesign/core/IconButton';
import { ChatMessage, ChatMessageBubble } from '@astryxdesign/core/Chat';
import { AssistantOrb, type AssistantActivity } from './AssistantOrb';
import type { useSpeechRecognition } from './useSpeechRecognition';
import { useUserSpeaking } from './useUserSpeaking';
import styles from './ConversationModeOverlay.module.css';

export interface ConversationModeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  speech: ReturnType<typeof useSpeechRecognition>;
  audioError?: string;
  children?: ReactNode;
  activity?: Exclude<AssistantActivity, 'idle'>;
  sharedOrb?: boolean;
  scrollRef?: Ref<HTMLDivElement>;
  /** Pushed back into depth while a modal (the sending screen) sits on top. */
  isReceded?: boolean;
  /** The assistant's voice clip is playing — the orb talks. */
  assistantSpeaking?: boolean;
}

// Native modal behavior comes from Astryx: focus containment, Escape, restoration.
export function ConversationModeOverlay({ isOpen, onClose, speech, audioError, children, activity = 'listening', sharedOrb = false, scrollRef, isReceded = false, assistantSpeaking = false }: ConversationModeOverlayProps) {
  // Two voices, two lights: the user's speech moves the bottom wash
  // (.root::before), the assistant's moves the orb (2026-10-06).
  const userSpeaking = useUserSpeaking(speech.isListening, speech.text);
  return (
    <Dialog isOpen={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}
      variant="fullscreen" purpose="form" padding={0} className={styles.root}
      aria-label="Assistant conversation" aria-describedby="conversation-activity" data-shared-orb={String(sharedOrb)}
      data-user-speaking={userSpeaking ? '' : undefined}>
      <div className={styles.layout} data-receded={isReceded ? '' : undefined}>
        {/* No top header here (2026-09-16, direct feedback: "on composer
            these X and history should be on top, and in conversation mode
            we shouldn't have those on top") — the close+chat-history row
            lives on the COMPOSER screen only (MobileFrameComposer.tsx);
            voice/conversation mode goes back to its original bottom-only
            controls, mic/orb/close, unchanged from before this feature. */}
        <div ref={scrollRef} className={styles.transcript} role="log" aria-label="Conversation transcript" tabIndex={0}>
          {children}
          {speech.text && <ChatMessage sender="user"><ChatMessageBubble>{speech.text}</ChatMessageBubble></ChatMessage>}
          {speech.error && <p role="alert">{speech.error}</p>}
          {audioError && <p role="alert">{audioError}</p>}
        </div>
        <div className={styles.controls}>
          <IconButton label={!speech.supported ? 'Speech recognition unavailable in this browser'
            : speech.isSuspended ? 'Microphone paused during voice response'
              : speech.isListening ? 'Stop voice recognition' : 'Start voice recognition'}
            icon={<span className={styles.micIcon} data-muted={!speech.isListening ? '' : undefined}><Icon icon="microphone" /></span>}
            variant="ghost" size="lg" isDisabled={!speech.supported || speech.isSuspended}
            aria-pressed={speech.isListening} onClick={speech.isListening ? speech.stop : speech.start} />
          <div className={styles.indicator}>
            {sharedOrb ? <span className={styles.orbSpace} /> : <AssistantOrb activity={activity} expanded speaking={assistantSpeaking} />}
            <button type="button" className={styles.orbRestore} aria-label="Resume voice recognition"
              disabled={!speech.supported || speech.isListening || speech.isSuspended} onClick={speech.start} />
            <span id="conversation-activity" className={styles.srOnly} role="status">
              {speech.isSuspended ? 'Playing voice response; microphone paused'
                : speech.isListening ? 'Listening to your voice' : activity === 'thinking' ? 'Thinking preview' : 'Microphone is off'}
            </span>
          </div>
          <IconButton label="Close conversation" tooltip="Close conversation" icon={<Icon icon="close" />}
            variant="ghost" size="lg" onClick={onClose} data-autofocus="true" />
        </div>
      </div>
    </Dialog>
  );
}
