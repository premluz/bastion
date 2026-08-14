import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import { useSessionStore } from '../../engine/stores/sessionStore';
import { useArtifactStore } from '../../engine/stores/artifactStore';
import { ChatIcon } from './ChatIcon';
import controlStyles from './PaneControlButton.module.css';

// Place-page counterpart to ArtifactStackControl (direct order,
// 2026-07-29) — same IconButton/variant-by-open-state shape, no count
// badge (chat has no count) and always enabled (unlike Artifacts, there's
// always something to open: an empty composer). Reveals/closes the
// transcript pane in place, replacing EntityDetailPage's old one-click
// canned-intent "Investigate" button with an open invitation to type a
// real query while staying on the page.
export function ChatPaneControl() {
  const hasStarted = useSessionStore((state) => state.activeThreadId !== null);
  const isChatForcedOpen = useArtifactStore((state) => state.isChatForcedOpen);
  const isChatManuallyClosed = useArtifactStore((state) => state.isChatManuallyClosed);
  const toggleChatPane = useArtifactStore((state) => state.toggleChatPane);
  const isOpen = (hasStarted || isChatForcedOpen) && !isChatManuallyClosed;

  return (
    // Selected state: a soft accent-tinted layer, not Astryx's own
    // `primary` variant — see ArtifactStackControl.tsx's own comment for
    // the full reasoning (same treatment, same order, 2026-08-04).
    <IconButton
      label="Chat"
      tooltip={isOpen ? 'Close chat' : 'Open chat'}
      icon={<Icon icon={ChatIcon} size="sm" {...(isOpen ? { color: 'accent' as const } : {})} />}
      variant="ghost"
      className={isOpen ? controlStyles.selected : undefined}
      onClick={toggleChatPane}
    />
  );
}
