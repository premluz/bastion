import type { ReactNode, Ref } from 'react';
import { Dialog } from '@astryxdesign/core/Dialog';
import { Icon } from '@astryxdesign/core/Icon';
import { IconButton } from '@astryxdesign/core/IconButton';
import { ClockIcon } from '@heroicons/react/24/outline';
import { AssistantOrb, type AssistantActivity } from './AssistantOrb';
import styles from './ConversationModeOverlay.module.css';

export interface ConversationModeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
  activity?: Exclude<AssistantActivity, 'idle'>;
  sharedOrb?: boolean;
  scrollRef?: Ref<HTMLDivElement>;
}

// Native modal behavior comes from Astryx: focus containment, Escape, restoration.
export function ConversationModeOverlay({ isOpen, onClose, children, activity = 'listening', sharedOrb = false, scrollRef }: ConversationModeOverlayProps) {
  return (
    <Dialog isOpen={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}
      variant="fullscreen" purpose="form" padding={0} className={styles.root}
      aria-label="Assistant conversation" aria-describedby="conversation-activity" data-shared-orb={String(sharedOrb)}>
      <div className={styles.layout}>
        {/* Close moved to a top-left header (2026-09-16, direct feedback:
            "close would be in the top left corner") — reuses Sheet's own
            header rather than a bespoke one, same leading/trailing slot
            shape. Trailing is a placeholder for a future chat-history
            list (direct feedback: "icon button placeholder for chat
            history list" on the right) — inert for now, no real history
            feature exists yet to open. */}
        <div className={styles.header}>
          <IconButton label="Close conversation" tooltip="Close conversation" icon={<Icon icon="close" />}
            variant="ghost" onClick={onClose} data-autofocus="true" />
          <IconButton label="Chat history" icon={<Icon icon={ClockIcon} />} variant="ghost" />
        </div>
        <div ref={scrollRef} className={styles.transcript} role="log" aria-label="Conversation transcript" tabIndex={0}>
          {children}
        </div>
        <div className={styles.controls}>
          <IconButton label="Microphone unavailable in preview" icon={<Icon icon="microphone" />}
            variant="ghost" size="lg" isDisabled />
          <div className={styles.indicator}>
            {sharedOrb ? <span className={styles.orbSpace} /> : <AssistantOrb activity={activity} expanded />}
            <span id="conversation-activity" className={styles.srOnly} role="status">
              {activity === 'thinking' ? 'Thinking preview' : 'Listening preview — microphone is off'}
            </span>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
