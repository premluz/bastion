import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import { Badge } from '@astryxdesign/core/Badge';
import { useArtifactStore } from '../../engine/stores/artifactStore';
import styles from './ArtifactStackControl.module.css';

// Home top-bar control (Phase 8H, revised) — always present (disabled
// rather than hidden when there are no artifacts yet, so the control's
// position is stable and its disabled state itself communicates "nothing
// to open"). Icon is the same "document" glyph ArtifactCard already uses
// for an artifact (viewColumns — Phase 8B WO-2's ai-chat-template
// adoption, not a fresh choice here). The count renders as a small badge
// overlapping the icon's own top-right corner, not beside it — the
// conventional notification-count treatment, not a second UI element.
export function ArtifactStackControl() {
  const count = useArtifactStore((state) => Object.keys(state.artifacts).length);
  const isStackOpen = useArtifactStore((state) => state.isStackOpen);
  const toggleStack = useArtifactStore((state) => state.toggleStack);

  return (
    <div className={styles.wrapper}>
      <IconButton
        label="Artifacts"
        tooltip="Artifacts"
        icon={<Icon icon="viewColumns" size="sm" />}
        variant={isStackOpen ? 'primary' : 'ghost'}
        isDisabled={count === 0}
        onClick={toggleStack}
      />
      {count > 0 && (
        // Ring in the canvas surface color separates the badge from the
        // icon button beneath it — without it, "neutral"'s own background
        // reads as near-invisible overlapping a light ghost/primary
        // button (found live: the first cut rendered as an unreadable
        // dark smudge, not a legible count). Positioning lives in
        // ArtifactStackControl.module.css, not inline — CLAUDE.md rule 4
        // is a structural ban on inline style objects, not just raw
        // values; a fully token-sourced style prop still violates it.
        <div className={styles.badgeWrapper}>
          <Badge variant="neutral" label={String(count)} />
        </div>
      )}
    </div>
  );
}
