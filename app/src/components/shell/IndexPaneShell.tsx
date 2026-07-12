import type { ReactNode } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { Toolbar } from '@astryxdesign/core/Toolbar';
import { Text } from '@astryxdesign/core/Text';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import { useWorkbenchStore, type PaneKind } from '../../engine/stores/workbenchStore';

interface IndexPaneShellProps {
  paneKind: PaneKind;
  title: string;
  width: number;
  children: ReactNode;
}

// Shared chrome for the workbench's index panes (Phase 8G WO-2) —
// Entities/Sources/Watchlist/History. Same Card+Toolbar structure
// ArtifactPanel established (Phase 8B WO-2), factored out here since
// these four panes share it verbatim; ArtifactPanel keeps its own copy
// rather than adopting this shell — its close semantics
// (setOpenArtifact(null), discarding which artifact is open) and dynamic
// per-artifact title differ from an index pane's static title and
// togglePane-only close (nothing to discard — an index pane's own
// content never changes on close, only its visibility, per the routing
// law: "index panes are stable and never replaced by clicks within
// them").
export function IndexPaneShell({ paneKind, title, width, children }: IndexPaneShellProps) {
  const togglePane = useWorkbenchStore((state) => state.togglePane);

  return (
    <Card variant="default" padding={0} width={width} height="100%">
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ borderBottom: '1px solid var(--edge)' }}>
          <Toolbar
            label={`${title} actions`}
            startContent={
              <Text type="label" weight="semibold">
                {title}
              </Text>
            }
            endContent={
              <IconButton
                label={`Close ${title.toLowerCase()}`}
                icon={<Icon icon="close" size="sm" />}
                variant="ghost"
                onClick={() => togglePane(paneKind)}
              />
            }
          />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-16)' }}>{children}</div>
      </div>
    </Card>
  );
}
