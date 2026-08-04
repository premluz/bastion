import { useEffect, type RefObject } from 'react';
import { useArtifactStore } from '../../engine/stores/artifactStore';

// Phase 18's collapse trigger: watches the row's own measured width
// (ResizeObserver, not a hardcoded pixel-sum — the row already accounts
// for whatever the sidebar/AppShell chrome takes, no need to duplicate
// that number here) against the summed LAYOUT width of its direct
// children (offsetWidth, not scrollWidth/getBoundingClientRect).
// Confirmed live: scrollWidth includes the CSS `transform` the slide-in/
// out animation runs on — a pane resting at any transform other than
// translateX(0) (mid-animation, or a still-settling fill-forwards frame)
// gets measured at its PAINTED position, not its true layout footprint,
// which both false-triggered collapses and, combined with an unrelated
// wide-table-inside-a-narrower-pane case, made scrollWidth read overflow
// that wasn't really there. offsetWidth is transform-independent and
// reflects each pane's own declared box only — also a free fix for that
// second case, since summing direct children never descends into a
// child's own internal (and separately contained) overflow content.
// Overflowing and nothing already collapsed → collapse the
// least-recently-active of the currently-open candidates. Fits again →
// clear it. Deliberately shallow, matching the order's own scope ("never
// a 4th forced column," not a general N-deep cascade): at most one pane
// collapses at a time.
export function usePaneFitCollapse(rowRef: RefObject<HTMLDivElement | null>, openCandidates: readonly string[]): void {
  const collapsedPane = useArtifactStore((state) => state.collapsedPane);
  const setCollapsedPane = useArtifactStore((state) => state.setCollapsedPane);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return undefined;

    const checkFit = () => {
      const children = Array.from(row.children) as HTMLElement[];
      const childWidth = children.reduce((sum, child) => sum + child.offsetWidth, 0);
      const gapPx = parseFloat(getComputedStyle(row).columnGap) || 0;
      const totalWidth = childWidth + gapPx * Math.max(0, children.length - 1);
      const isOverflowing = totalWidth > row.clientWidth + 1;
      if (!isOverflowing) {
        if (collapsedPane) setCollapsedPane(null);
        return;
      }
      if (collapsedPane) return;
      const stillOpen = openCandidates.filter((pane) => pane !== collapsedPane);
      if (stillOpen.length === 0) return;
      const { paneActivity } = useArtifactStore.getState();
      const target = stillOpen.reduce((least, pane) =>
        (paneActivity[pane] ?? 0) < (paneActivity[least] ?? 0) ? pane : least,
      );
      setCollapsedPane(target);
    };

    // A pane MOUNTING (e.g. a restored pane sliding back in) changes
    // row.scrollWidth without changing row's OWN border-box size —
    // ResizeObserver only fires on the observed element's own box, never
    // on overflow caused by a child appearing, so a resize-only observer
    // missed exactly "restore, but it still doesn't fit" (confirmed
    // live). MutationObserver on row's direct children (not subtree —
    // trail steps streaming into the content column shouldn't trigger
    // this) catches that. Deliberately reacts ONLY to additions, never
    // removals: a removal is the collapse mechanism's OWN doing (the
    // pane's exit animation finishing), and re-running checkFit right
    // then is tautological — of course the row "fits" the instant the
    // thing that didn't fit is gone. Also confirmed live: reacting to
    // removals too created exactly that feedback loop (collapse → fits
    // once removed → un-collapse → overflows → collapse again, forever),
    // which was cancelling the exit animation mid-flight every cycle.
    // Genuine container growth still reaches the "fits again, clear it"
    // branch below through ResizeObserver, an external signal instead of
    // one caused by our own last action.
    const resizeObserver = new ResizeObserver(checkFit);
    resizeObserver.observe(row);
    const mutationObserver = new MutationObserver((mutations) => {
      if (mutations.some((m) => m.addedNodes.length > 0)) checkFit();
    });
    mutationObserver.observe(row, { childList: true });
    checkFit();
    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [rowRef, openCandidates, collapsedPane, setCollapsedPane]);
}
