import type { ReactNode } from 'react';
import { Dialog } from '@astryxdesign/core/Dialog';
import { Icon } from '@astryxdesign/core/Icon';
import { IconButton } from '@astryxdesign/core/IconButton';
import { AssistantOrb, type AssistantActivity } from './AssistantOrb';
import glowStyles from '../../theme/glow.module.css';
import styles from './ConversationModeOverlay.module.css';

export interface ConversationModeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
  activity?: Exclude<AssistantActivity, 'idle'>;
  sharedOrb?: boolean;
}

// Native modal behavior comes from Astryx: focus containment, Escape, restoration.
export function ConversationModeOverlay({ isOpen, onClose, children, activity = 'listening', sharedOrb = false }: ConversationModeOverlayProps) {
  return (
    <Dialog isOpen={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}
      variant="fullscreen" purpose="form" padding={0} className={styles.root}
      aria-label="Assistant conversation" aria-describedby="conversation-activity" data-shared-orb={String(sharedOrb)}>
      <div className={styles.layout}>
        {/* Top glow (2026-09-13, direct feedback: "this is global" — same
            topLeft+topRight combination AssetsHomeHeader already uses), on
            its own wrapper rather than .layout itself: .layout already
            owns a ::before for the bottom orb halo below, and glow's
            .topLeft/.topRight ALSO target ::before — applying both to one
            element would collide, silently dropping one. Neutral
            --accent-signal default, unset here: unlike Home's balance, a
            conversation has no up/down direction to color it by. */}
        <div className={`${styles.glow} ${glowStyles.root} ${glowStyles.topLeft} ${glowStyles.topRight} ${glowStyles.unclipped}`} />
        <div className={styles.transcript} role="log" aria-label="Conversation transcript" tabIndex={0}>
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
