import { useEffect, type ReactNode } from 'react';
import { ResizeHandle, useResizable } from '@astryxdesign/core/Resizable';
import { useWorkbenchStore, type PaneKind } from '../../engine/stores/workbenchStore';

interface PaneResizeHandleProps {
  paneKind: PaneKind;
  label: string;
  children: (width: number) => ReactNode;
}

// Generalized resizable-pane wrapper (Phase 8G WO-1) — extracted from
// Frame.tsx's original artifact-only inline useResizable/ResizeHandle
// usage (Phase 8B WO-2) so every pane kind shares one implementation.
// Astryx's own guidance ("don't wrap panels in extra container components
// for resize") is honored: this returns a fragment, adding no DOM beyond
// the handle and the panel themselves — same shape as the original inline
// usage, just parameterized by pane kind.
export function PaneResizeHandle({ paneKind, label, children }: PaneResizeHandleProps) {
  const pane = useWorkbenchStore((state) => state.panes.find((p) => p.kind === paneKind));
  const setWidth = useWorkbenchStore((state) => state.setWidth);
  if (!pane) throw new Error(`PaneResizeHandle: no workbench pane registered for kind "${paneKind}"`);

  const resizable = useResizable({
    defaultSize: pane.width,
    minSizePx: pane.minWidth,
    maxSizePx: pane.maxWidth,
    autoSaveId: `merlin-pane-${paneKind}`,
  });

  useEffect(() => {
    setWidth(paneKind, resizable.size);
  }, [resizable.size, paneKind, setWidth]);

  return (
    <>
      <ResizeHandle
        direction="horizontal"
        resizable={resizable.props}
        isReversed
        pillPlacement="start"
        hasDivider
        label={label}
      />
      {children(resizable.size)}
    </>
  );
}
