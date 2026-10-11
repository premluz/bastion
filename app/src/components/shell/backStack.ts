// Edge-swipe / system back (2026-10-10, direct feedback: "slide from left of
// screen should go back page — native gesture"). The shell's screens are state,
// not routes, so the browser's own back (the iOS web view's edge swipe, Android's
// back gesture, a desktop back button) has nothing to go back to. This keeps
// ONE extra history entry for as long as any "layer" is open (a non-home tab, a
// card's detail, the assistant, an account sheet…): back pops that entry and the
// top layer closes; if layers remain, the entry is put back.
//
// Written against a small environment so it can be tested without a browser.
export interface BackEnvironment {
  pushState(): void;
  back(): void;
  onPopState(listener: () => void): () => void;
  /** Runs `task` after the current work settles (a macrotask). */
  defer(task: () => void): void;
}

/** Closes the layer. Return true if it only stepped back within itself and is still open. */
export type BackHandler = () => boolean | void;

export function createBackStack(env: BackEnvironment) {
  const layers = new Map<number, BackHandler>();
  let nextId = 0;
  let trap = false;            // our extra history entry exists
  let ignoredPops = 0;         // popstates we caused ourselves with back()
  let releasePending = false;

  const arm = () => {
    if (trap) return;
    env.pushState();
    trap = true;
  };

  // Layers closing in-app (the X, a tab tap) must also remove the extra entry,
  // or the next swipe would spend itself on nothing. Deferred, because React
  // briefly unmounts and remounts effects (and a flow can swap one layer for
  // another in the same tick); only an entry that stays unused is released.
  const release = () => {
    releasePending = false;
    if (layers.size > 0 || !trap) return;
    trap = false;
    ignoredPops += 1;
    env.back();
  };

  env.onPopState(() => {
    if (ignoredPops > 0) { ignoredPops -= 1; return; }
    trap = false;                                  // the user's back spent the entry
    const topId = [...layers.keys()].pop();
    if (topId === undefined) return;
    const handler = layers.get(topId);
    layers.delete(topId);
    if (handler && handler() === true) layers.set(topId, handler);
    if (layers.size > 0) arm();
  });

  return {
    push(handler: BackHandler): number {
      const id = nextId++;
      layers.set(id, handler);
      arm();
      return id;
    },
    remove(id: number) {
      if (!layers.delete(id)) return;              // already closed by a back
      if (layers.size === 0 && trap && !releasePending) {
        releasePending = true;
        env.defer(release);
      }
    },
  };
}
