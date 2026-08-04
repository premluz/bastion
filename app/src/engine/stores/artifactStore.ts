import { create } from "zustand";
import type { HydratedScene } from "../../contracts/scene";
import { config } from "../../config";
import { useSceneStore } from "./sceneStore";
import { useSessionStore } from "./sessionStore";
import { createPaneVisibilitySlice, type PaneVisibilityState } from "./paneVisibilitySlice";

export type { PaneKind } from "./paneVisibilitySlice";

export interface Artifact {
  scene: HydratedScene;
  module: string;
}

// Past turns' scenes live here, keyed by artifact id — the fix for the
// single-slot sceneStore.activeScene design (Phase 8B WO-1 root cause,
// see STATE.md): a turn's artifact is registered once and never
// overwritten by a later turn. `openArtifactId` is which one the
// artifact stack currently shows in its detail sub-view.
//
// Phase 8H folds the former workbenchStore's pane-open/width state in
// here directly — "Artifacts is the only pane" made a separate
// multi-pane store (and its cross-store subscription hack) redundant:
// there's exactly one pane now, tightly coupled to this store's own
// openArtifactId, so it lives on the same object rather than a second
// store kept in sync with this one. Pane-visibility fields (paneActivity/
// collapsedPane/isChatForcedOpen) are still part of THIS SAME store —
// only their definitions moved to paneVisibilitySlice.ts (2026-07-29,
// file budget) via Zustand's slice pattern, composed back in below.
interface ArtifactState extends PaneVisibilityState {
  artifacts: Record<string, Artifact>;
  openArtifactId: string | null;
  isStackOpen: boolean;
  isMaximized: boolean;
  stackWidth: number;
  viewedArtifactIds: Record<string, true>;
  registerArtifact: (id: string, artifact: Artifact) => void;
  patchOpenArtifactScene: (scene: HydratedScene) => void;
  setOpenArtifact: (id: string | null) => void;
  openArtifactSilently: (id: string) => void;
  toggleStack: () => void;
  closeStack: () => void;
  toggleMaximize: () => void;
  setStackWidth: (width: number) => void;
  reset: () => void;
}

export const useArtifactStore = create<ArtifactState>((set, get) => ({
  artifacts: {},
  openArtifactId: null,
  isStackOpen: false,
  isMaximized: false,
  stackWidth: config.artifactStack.defaultWidth,
  viewedArtifactIds: {},
  ...createPaneVisibilitySlice(set),
  registerArtifact: (id, artifact) => set((state) => ({ artifacts: { ...state.artifacts, [id]: artifact } })),
  // liveChannel's update-in-place path (2026-07-25): a pushed scene whose
  // id matches the CURRENTLY OPEN artifact swaps that artifact's scene in
  // place instead of presentScene.ts registering a brand-new turn/artifact
  // — the whole point being a smoothly-updating dashboard, not a fresh
  // turn appearing in the transcript. No-op if nothing is open (the id
  // match this requires can only happen with something open anyway, but
  // this stays honest rather than assuming). Node ids in the new scene's
  // layout are expected to match the old one's (same scene, revised
  // values) — SceneRenderer's own `wrap()` keys each node by `node.id`,
  // so matching ids is what keeps React from remounting the subtree and
  // losing the CSS transition on ring-gauge/metric's changed values;
  // liveChannel.ts's own id-match gate is what guarantees this is only
  // ever called with exactly that kind of revision.
  patchOpenArtifactScene: (scene) => {
    const id = get().openArtifactId;
    const artifact = id ? get().artifacts[id] : undefined;
    if (!id || !artifact) return;
    set((state) => ({ artifacts: { ...state.artifacts, [id]: { ...artifact, scene } } }));
    useSceneStore.getState().setActiveScene(scene);
  },
  // Setting a real id is "open this artifact" — same law WO-1's autoOpen
  // relied on (a new artifact always forces the stack open on it), now
  // inline instead of a separate subscription. Also syncs sceneStore's
  // activeScene here, in the one place both stores change together —
  // every prior call site (Sidebar, HistoryPane, Transcript's
  // ArtifactCard) had to remember to call both, which is exactly the
  // "two stores drift" class of bug Phase 8B WO-1's root cause already
  // was; folding the pairing into this action removes the chance of a
  // future call site forgetting the second half. Canvas.tsx (protected,
  // unchanged) still reads sceneStore.activeScene directly. Setting null
  // (unused by any current caller — the stack's own "Back to list" no
  // longer nulls this; there is always a "current" artifact once one
  // exists) stays supported for completeness, matching the store's own
  // optional type, and deliberately leaves activeScene untouched.
  setOpenArtifact: (id) => {
    set((state) => ({
      openArtifactId: id,
      isStackOpen: id ? true : state.isStackOpen,
      viewedArtifactIds: id ? { ...state.viewedArtifactIds, [id]: true } : state.viewedArtifactIds,
    }));
    if (id) {
      const artifact = get().artifacts[id];
      if (artifact) useSceneStore.getState().setActiveScene(artifact.scene);
      // Investigation threading order: opening an artifact always means
      // "show me this investigation" — the transcript (keyed on
      // sessionStore.activeThreadId) and the artifact stack move together
      // by construction, the same centralization precedent as the
      // sceneStore.setActiveScene call above. This also replaces the
      // earlier isLandingOverride-clearing call: activeThreadId !== null
      // is now the single signal Frame.tsx uses to leave the landing
      // composer, so setting it here already has that effect for free.
      const owningTurn = useSessionStore.getState().turns.find((turn) => turn.artifactRef === id);
      if (owningTurn) useSessionStore.getState().setActiveThread(owningTurn.threadId);
    }
  },
  // Used only by presentScene.ts's autoOpen path for a Monitor-module
  // artifact: the content still appears immediately (same law as every
  // other autoOpen), but doesn't count as "seen" — a push happening while
  // the user is elsewhere shouldn't silently clear the notification bell
  // before they've actually looked. Every other opener (a stack row, an
  // Investigate action, a Sidebar/Investigations row, autoOpen for a
  // non-alert scene) goes through setOpenArtifact above and does mark it
  // viewed — this is the one deliberate exception, not a second general
  // mechanism.
  openArtifactSilently: (id) => {
    set({ openArtifactId: id, isStackOpen: true });
    const artifact = get().artifacts[id];
    if (artifact) useSceneStore.getState().setActiveScene(artifact.scene);
  },
  // Closing resets maximize too — reopening the stack later (a new
  // artifact, a Sidebar row) should always start back in the normal
  // split layout, never surprise-maximized from a prior session.
  toggleStack: () =>
    set((state) => ({ isStackOpen: !state.isStackOpen, isMaximized: state.isStackOpen ? false : state.isMaximized })),
  // Idempotent, unlike toggleStack: a navigation side effect (pageStore.
  // setPage, leaving Home for a non-investigation place) must always land
  // on "closed" regardless of current state — a toggle here could
  // accidentally reopen an already-closed stack. openArtifactId/artifacts
  // stay untouched, same as toggleStack — this hides the pane, it doesn't
  // discard which artifact was open, so returning to Home still shows it.
  closeStack: () => set({ isStackOpen: false, isMaximized: false }),
  toggleMaximize: () => set((state) => ({ isMaximized: !state.isMaximized })),
  setStackWidth: (width) => set({ stackWidth: width }),
  reset: () =>
    set({
      artifacts: {},
      openArtifactId: null,
      isStackOpen: false,
      isMaximized: false,
      viewedArtifactIds: {},
      paneActivity: {},
      collapsedPane: null,
      isChatForcedOpen: false,
      isChatManuallyClosed: false,
    }),
}));
