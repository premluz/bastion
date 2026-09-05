import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import { Text } from '@astryxdesign/core/Text';
import { useArtifactStore } from '../../engine/stores/artifactStore';

const PANE_LABELS: Record<string, string> = {
  transcript: 'Transcript',
  artifact: 'Artifacts',
};

// Phase 18's "labeled return point, one-click restore": what a pane
// becomes instead of vanishing outright when the collapse trigger picks
// it. Narrow on purpose — it should barely register against the row's
// own overflow math, unlike the pane it's standing in for.
export function CollapsedPaneChip({ pane }: { pane: string }) {
  const setCollapsedPane = useArtifactStore((state) => state.setCollapsedPane);
  const label = PANE_LABELS[pane] ?? pane;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-8)',
        width: '48px',
        flexShrink: 0,
      }}
    >
      <IconButton
        label={`Restore ${label}`}
        tooltip={`Restore ${label}`}
        icon={<Icon icon="chevronLeft" size="sm" />}
        variant="ghost"
        size="sm"
        onClick={() => setCollapsedPane(pane, false)}
      />
      <Text type="label" color="secondary" style={{ writingMode: 'vertical-rl' }}>
        {label}
      </Text>
    </div>
  );
}
