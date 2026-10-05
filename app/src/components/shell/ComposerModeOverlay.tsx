import type { ReactNode, Ref } from 'react';
import { Dialog } from '@astryxdesign/core/Dialog';
import { Icon } from '@astryxdesign/core/Icon';
import { IconButton } from '@astryxdesign/core/IconButton';
import { ClockIcon } from '@heroicons/react/24/outline';
import styles from './ComposerModeOverlay.module.css';

export interface ComposerModeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
  composer?: ReactNode;
  scrollRef?: Ref<HTMLDivElement>;
  /** Pushed back into depth while a modal (the sending screen) sits on top. */
  isReceded?: boolean;
}

// Full-screen composer (2026-09-16 follow-up — the header this replaces
// was first added INSIDE the dock's own expanding composer panel, which
// only grows upward from the nav bar rather than spanning the screen:
// direct feedback caught this live from a screenshot ("these close and
// history should be on top" — a top-left X/history pair rendering just
// above the input, not at the true screen edge). Confirmed with the
// user: composer becomes a genuine full-screen takeover, same register
// as ConversationModeOverlay (header pinned to the true top, input
// pinned to the true bottom), rather than swapping MobileFrame's own
// shared search header instead.
export function ComposerModeOverlay({ isOpen, onClose, children, composer, scrollRef, isReceded = false }: ComposerModeOverlayProps) {
  return (
    <Dialog isOpen={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}
      variant="fullscreen" purpose="form" padding={0} className={styles.root}
      aria-label="Assistant composer">
      <div className={styles.layout} data-receded={isReceded ? '' : undefined}>
        <div className={styles.header}>
          <IconButton label="Close assistant" tooltip="Close assistant" icon={<Icon icon="close" />}
            variant="ghost" onClick={onClose} data-autofocus="true" />
          <IconButton label="Chat history" icon={<Icon icon={ClockIcon} />} variant="ghost" />
        </div>
        <div ref={scrollRef} className={styles.transcript} role="log" aria-label="Assistant transcript" tabIndex={0}>
          {children}
        </div>
        <div className={styles.composerBody}>{composer}</div>
      </div>
    </Dialog>
  );
}
