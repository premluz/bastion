import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';

interface ArtifactStackControlsProps {
  isMaximized: boolean;
  toggleMaximize: () => void;
  toggleStack: () => void;
}

// Extracted from ArtifactStack.tsx (over the 200-line budget once mobile
// hiding logic landed there) — the Maximize/Close pair from
// PaneTitleBar's endContent, unchanged otherwise.
export function ArtifactStackControls({ isMaximized, toggleMaximize, toggleStack }: ArtifactStackControlsProps) {
  return (
    <>
      <IconButton
        label={isMaximized ? 'Restore' : 'Maximize'}
        tooltip={isMaximized ? 'Restore' : 'Maximize'}
        icon={<Icon icon="arrowsUpDown" size="sm" style={{ transform: 'rotate(45deg)' }} />}
        variant={isMaximized ? 'primary' : 'ghost'}
        onClick={toggleMaximize}
      />
      {/* Close acts exactly like the top-bar Artifacts control (same
          action) — one on/off state, two entry points. */}
      <IconButton
        label="Close artifacts"
        tooltip="Close"
        icon={<Icon icon="close" size="sm" />}
        variant="ghost"
        onClick={toggleStack}
      />
    </>
  );
}
