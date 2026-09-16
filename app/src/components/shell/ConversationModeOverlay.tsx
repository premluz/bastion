import type { ReactNode, Ref } from 'react';
import { Dialog } from '@astryxdesign/core/Dialog';
import { Icon } from '@astryxdesign/core/Icon';
import { IconButton } from '@astryxdesign/core/IconButton';
import { ClockIcon } from '@heroicons/react/24/outline';
import { AssistantOrb, type AssistantActivity } from './AssistantOrb';
import styles from './ConversationModeOverlay.module.css';

export interface ConversationModeOverlayProps {
  isOpen: boolean;
  // Bottom-right close (2026-09-16 rollback: restored to its original
  // position/behavior) — returns to the COMPOSER screen, not fully
  // closed. Astryx's own Dialog onOpenChange also calls this (Escape/
  // backdrop), same as before this whole feature started.
  onClose: () => void;
  // Top-left X (2026-09-16, kept from the header this rollback otherwise
  // reverts) — closes the assistant ALTOGETHER, back to idle. A
  // genuinely different action from onClose, not a second way to
  // trigger the same one: direct feedback drew this distinction
  // explicitly ("top left x closes the assistant altogether").
  onCloseAll: () => void;
  children?: ReactNode;
  activity?: Exclude<AssistantActivity, 'idle'>;
  sharedOrb?: boolean;
  scrollRef?: Ref<HTMLDivElement>;
}

// Native modal behavior comes from Astryx: focus containment, Escape, restoration.
export function ConversationModeOverlay({ isOpen, onClose, onCloseAll, children, activity = 'listening', sharedOrb = false, scrollRef }: ConversationModeOverlayProps) {
  return (
    <Dialog isOpen={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}
      variant="fullscreen" purpose="form" padding={0} className={styles.root}
      aria-label="Assistant conversation" aria-describedby="conversation-activity" data-shared-orb={String(sharedOrb)}>
      <div className={styles.layout}>
        {/* Top header kept from the prior pass (2026-09-16 rollback: "keep
            close and history on top") — X here closes the assistant
            ALTOGETHER (onCloseAll → idle), a genuinely different action
            from the bottom-right close restored below (→ composer).
            Chat-history remains an inert placeholder — no real history
            feature exists yet to open. */}
        <div className={styles.header}>
          <IconButton label="Close assistant" tooltip="Close assistant" icon={<Icon icon="close" />}
            variant="ghost" onClick={onCloseAll} data-autofocus="true" />
          <IconButton label="Chat history" icon={<Icon icon={ClockIcon} />} variant="ghost" />
        </div>
        <div ref={scrollRef} className={styles.transcript} role="log" aria-label="Conversation transcript" tabIndex={0}>
          {children}
        </div>
        {/* Rolled back to its original layout/behavior (2026-09-16, direct
            feedback: "roll back moving microphone to the center (keep on
            left) and close on the right... interaction as before") — mic
            left, orb centered between the two real controls, close right,
            returning to the composer screen exactly as it did before the
            top header was added. */}
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
            variant="ghost" size="lg" onClick={onClose} />
        </div>
      </div>
    </Dialog>
  );
}
