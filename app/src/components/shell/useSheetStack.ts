import { useCallback, useState } from 'react';

export interface SheetStackEntry { id: string; key: number }

// Multi-modal capability (2026-09-16, direct feedback: "comp that is
// resembling sheets... with multi modal capability") — an ordered stack
// of open sheet ids, not a single isOpen boolean. push() adds a new
// entry on top (a second sheet opened from within an already-open one);
// pop() removes the topmost only, never an arbitrary one — a sheet
// beneath the top is never dismissed out of order, matching how native
// sheet stacks behave (you close what's in front of you first). `key` is
// a monotonically increasing id, not the sheet's own semantic id — the
// same semantic sheet can be pushed, popped, and pushed again, and each
// occurrence needs its own React key so a fresh mount/animation plays
// every time rather than React reusing a DOM node keyed by a repeated
// string id.
let nextKey = 0;

export function useSheetStack() {
  const [stack, setStack] = useState<SheetStackEntry[]>([]);

  const push = useCallback((id: string) => {
    setStack((current) => [...current, { id, key: nextKey++ }]);
  }, []);

  const pop = useCallback(() => {
    setStack((current) => current.slice(0, -1));
  }, []);

  // Closes every sheet back to (and including) the first occurrence of
  // id, not just the top — for a caller that needs "close everything
  // opened from this point," e.g. a multi-step flow's own top-level
  // cancel. Closing a sheet that isn't in the stack is a no-op, not an
  // error: a stale callback firing after the stack already changed
  // shouldn't throw.
  const closeTo = useCallback((id: string) => {
    setStack((current) => {
      const index = current.findIndex((entry) => entry.id === id);
      return index === -1 ? current : current.slice(0, index);
    });
  }, []);

  const closeAll = useCallback(() => setStack([]), []);

  return { stack, push, pop, closeTo, closeAll, isOpen: (id: string) => stack.some((entry) => entry.id === id) };
}
