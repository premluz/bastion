import { create } from "zustand";
import { config } from "../../config";
import { useArtifactStore } from "./artifactStore";

export type PaneKind = (typeof config.workbench.panes)[number]["kind"];

export interface Pane {
  kind: PaneKind;
  open: boolean;
  width: number;
  minWidth: number;
  maxWidth: number;
}

interface WorkbenchState {
  panes: Pane[];
  togglePane: (kind: PaneKind) => void;
  openPane: (kind: PaneKind) => void;
  setWidth: (kind: PaneKind, width: number) => void;
}

export const useWorkbenchStore = create<WorkbenchState>((set) => ({
  panes: config.workbench.panes.map((pane) => ({ ...pane })),
  togglePane: (kind) =>
    set((state) => ({
      panes: state.panes.map((pane) => (pane.kind === kind ? { ...pane, open: !pane.open } : pane)),
    })),
  openPane: (kind) =>
    set((state) => ({
      panes: state.panes.map((pane) => (pane.kind === kind && !pane.open ? { ...pane, open: true } : pane)),
    })),
  setWidth: (kind, width) =>
    set((state) => ({
      panes: state.panes.map((pane) => (pane.kind === kind ? { ...pane, width } : pane)),
    })),
}));

// Rail-collapse ("open↔collapse per kind") is layered on top of
// artifactStore.openArtifactId, not a replacement for it — collapsing the
// artifact pane never discards which artifact is open. But the existing
// triggers (Phase 9 autoOpen, Sidebar/Transcript card-click) must keep
// forcing the pane visible exactly as before the workbench existed
// (WO-1's byte-identical gate), so any *new* openArtifactId reopens the
// pane if the rail had collapsed it. Module-scope subscribe, not a React
// effect, so this holds even when no workbench UI is mounted yet.
useArtifactStore.subscribe((state, prevState) => {
  if (state.openArtifactId && state.openArtifactId !== prevState.openArtifactId) {
    useWorkbenchStore.getState().openPane("artifact");
  }
});
