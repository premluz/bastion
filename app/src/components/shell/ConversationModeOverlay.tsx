import type { ReactNode, Ref } from 'react';
import { Dialog } from '@astryxdesign/core/Dialog';
import { Icon } from '@astryxdesign/core/Icon';
import { IconButton } from '@astryxdesign/core/IconButton';
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
        {/* No top header here (2026-09-16, direct feedback: "on composer
            these X and history should be on top, and in conversation mode
            we shouldn't have those on top") — the close+chat-history row
            lives on the COMPOSER screen only (MobileFrameComposer.tsx);
            voice/conversation mode goes back to its original bottom-only
            controls, mic/orb/close, unchanged from before this feature. */}
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
          <IconButton label="Close conversation" tooltip="Close conversation" icon={<Icon icon="close" />}
            variant="ghost" size="lg" onClick={onClose} data-autofocus="true" />
        </div>
      </div>
    </Dialog>
  );
}
