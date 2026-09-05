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
// Overflowing → collapse the least-recently-active of the still-open
// candidates, one at a time, re-measuring after each (a single collapse
// removes one pane's real width from the row, which can already be enough
// — no reason to collapse a second one the instant the first would have
// sufficed). Fits again → restore collapsed panes one at a time, most-
// recently-collapsed first, stopping the instant restoring one more would
// overflow again (so a pane already fitting after a partial restore
// doesn't get needlessly popped back out). Content is never a candidate
// (protected, unchanged). Was capped at exactly one collapsed pane ever
// ("never a 4th forced column"); widened (2026-08-28, direct feedback) once
// a real row surfaced — Discover page, thread already started — where
// content + artifact alone still overflow after transcript's own collapse
// is spent, and the old cap left artifact stuck rendering full-width,
// visibly clipped off the row instead of collapsing. The still-shallow
// part of the original scope holds: this only ever removes real panes
// (transcript/artifact), never touches content, and stops as soon as the
// row fits — it's a loop over the same one-step decision, not open-ended
// cascading logic.
export function usePaneFitCollapse(rowRef: RefObject<HTMLDivElement | null>, openCandidates: readonly string[]): void {
  // Read via getState() inside checkFit (below), not the reactive
  // selector, and NOT listed in the effect's own dependency array either
  // — same reasoning paneActivity already uses. A restored pane's
  // reappearance fires the MutationObserver, which can invoke a STALE
  // closure's checkFit (captured at the previous collapsedPanes value)
  // before this effect's own cleanup/re-subscribe from that same state
  // change has run, undoing one collapse only to immediately reference
  // the pre-restore list and re-collapse from it — confirmed live as a
  // real oscillation (restore one of two panes, then incorrectly
  // re-collapse both from scratch instead of checking whether the second
  // could now also restore). Reading fresh from the store on every call
  // removes the stale-closure window entirely.
  const setCollapsedPane = useArtifactStore((state) => state.setCollapsedPane);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return undefined;

    const measure = () => {
      const children = Array.from(row.children) as HTMLElement[];
      const childWidth = children.reduce((sum, child) => sum + child.offsetWidth, 0);
      const gapPx = parseFloat(getComputedStyle(row).columnGap) || 0;
      const totalWidth = childWidth + gapPx * Math.max(0, children.length - 1);
      return totalWidth > row.clientWidth + 1;
    };

    // A collapsed pane stays mounted at its full offsetWidth throughout its
    // own exit animation (ArtifactStackMount/TranscriptPaneMount's own
    // isExiting → onAnimationEnd → unmount sequence) — its real DOM removal,
    // the thing that would actually shrink a future measure() call, doesn't
    // happen until well after this collapse decision returns. Waiting for
    // that removal to re-check (matching how a RESTORE's re-check already
    // works, via the MutationObserver's addition-catch) isn't an option:
    // MutationObserver here is deliberately additions-only (see its own
    // comment below), because reacting to a collapse's own removal is
    // exactly the "collapse → fits once removed → un-collapse → overflows
    // → collapse again, forever" loop that decision already fixed for the
    // single-pane case. So instead of re-checking after the fact, decide
    // how many panes to collapse in one pass, by SIMULATING each
    // candidate's removal against the measured widths already on hand
    // (offsetWidth doesn't change mid-animation, so the pane we're about to
    // collapse still reports its real, pre-collapse width right now) —
    // confirmed live as a real bug without this: the harness's two-pane row
    // (416px content in a 300px row) collapsed BOTH panes back-to-back on
    // first mount before either's removal could be measured, even though
    // removing just the one 200px pane alone already makes 300px fit.
    const checkFit = () => {
      const { collapsedPanes, paneActivity } = useArtifactStore.getState();
      const gapPx = parseFloat(getComputedStyle(row).columnGap) || 0;
      // A pane already mid-collapse (in collapsedPanes) is still mounted at
      // its full offsetWidth for the duration of its own exit animation —
      // its own CollapsedPaneChip mounts immediately alongside it (see
      // PaneFitCollapseHarness's own comment: siblings, not a ternary
      // swap), which is itself an ADDITION the MutationObserver reacts to,
      // re-invoking checkFit while the old pane is still fully present.
      // Counting BOTH the still-exiting pane's real width AND its new
      // chip's width overstates the row by a full pane width — confirmed
      // live as the actual second-collapse trigger (totalWidth grew
      // 416→480→544 across repeated checkFit calls purely from the chip's
      // own addition, never from real overflow). A pane already in
      // collapsedPanes contributes 0 to this sum (its committed future,
      // exit animation notwithstanding) — only its chip counts, matching
      // what the row will actually look like once the animation finishes.
      const children = Array.from(row.children) as HTMLElement[];
      const widthByPane = new Map(children.map((child) => [child.getAttribute('data-pane'), child.offsetWidth]));
      const countedChildren = children.filter((child) => {
        const pane = child.getAttribute('data-pane');
        return pane === null || !collapsedPanes.includes(pane);
      });
      const clientWidth = row.clientWidth;
      const totalWidth = countedChildren.reduce((sum, child) => sum + child.offsetWidth, 0) + gapPx * Math.max(0, children.length - 1);

      if (totalWidth > clientWidth + 1) {
        const stillOpen = [...openCandidates].filter((pane) => !collapsedPanes.includes(pane));
        // Collapse least-recently-active first, simulating each removal
        // against the running total until it fits or candidates run out —
        // one pass, no re-measurement needed since offsetWidth is already
        // known for every current child.
        stillOpen.sort((a, b) => (paneActivity[a] ?? 0) - (paneActivity[b] ?? 0));
        let remaining = totalWidth;
        for (const pane of stillOpen) {
          if (remaining <= clientWidth + 1) break;
          const paneWidth = widthByPane.get(pane);
          if (paneWidth === undefined) continue;
          setCollapsedPane(pane, true);
          remaining -= paneWidth + gapPx;
        }
        return;
      }
      // Fits (excluding already-collapsed panes' own mid-exit width, per
      // countedChildren above) — but that exclusion itself means "fits"
      // here can also be a collapse's OWN just-decided outcome, still
      // mid-exit-animation, whose new CollapsedPaneChip addition just
      // retriggered this very call. Restoring from THAT signal would
      // literally undo the collapse that produced it — confirmed live as
      // a real oscillation (collapse → chip mounts → "fits" (because the
      // collapsed pane's real width is excluded) → immediately restore →
      // overflow again → collapse again, forever). The disambiguator: a
      // pane whose collapse is still genuinely in flight is still present
      // in the DOM (mid-exit, not yet unmounted) — recomputing totalWidth
      // WITHOUT the countedChildren exclusion (i.e. every current child's
      // real, present width) tells us whether the row visually fits RIGHT
      // NOW, not just once exits finish. Only restore when that's true.
      const realTotalWidth = children.reduce((sum, child) => sum + child.offsetWidth, 0) + gapPx * Math.max(0, children.length - 1);
      if (realTotalWidth > clientWidth + 1) return;
      // Most-recently-collapsed first: the one just squeezed out is the
      // one most likely to fit back in first as space returns.
      const mostRecentlyCollapsed = collapsedPanes.at(-1);
      if (!mostRecentlyCollapsed) return;
      setCollapsedPane(mostRecentlyCollapsed, false);
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
  }, [rowRef, openCandidates, setCollapsedPane]);
}
