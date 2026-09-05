import { useEffect, useRef, type ReactNode, type UIEvent } from 'react';
import { usePageStore } from '../../engine/stores/pageStore';
import { PaneTitleBar } from './PaneTitleBar';
import styles from './PageShell.module.css';

interface PageShellProps {
  title: ReactNode;
  titleContent?: ReactNode;
  titleEndContent?: ReactNode;
  children: ReactNode;
  // scrollRestoreKey (2026-08-30, direct feedback: browser back from
  // Entity Detail to Discover should restore scroll position) — opt-in,
  // omitted by every existing caller (unaffected). Restores .paneScroll's
  // scrollTop from pageStore on mount and writes it back on scroll, keyed
  // by this string so unrelated pages never collide. Generic here rather
  // than special-cased for Discover: any page that unmounts on navigation
  // (every page does, per Frame.tsx's renderPage switch) can opt in the
  // same way.
  scrollRestoreKey?: string;
}

// Shared full-width page content wrapper. Title bar moved back in here
// (direct feedback, 2026-08-02, superseding Phase 8H's "title bar hoisted
// out" — see WorkbenchTitleBar.tsx's own comment for the other half of
// this reversal), now styled as the pane's own title bar (same
// PaneTitleBar component the artifact pane's Toolbar visually matches),
// not the app-wide top bar.
//
// PaneTitleBar lives INSIDE .paneScroll, as .paneBody's sibling (direct
// feedback, 2026-08-03: "gradient... to imitate smooth fadeout of
// content scrolling underneath") — reverses a prior turn's move to a
// plain, non-scrolling sibling of .paneScroll (that turn's own
// assumption, matching ArtifactStack.tsx's plain Toolbar, not something
// asked for). For rows to visibly pass under the bar and fade via its
// gradient, the bar has to be inside the same scrolling box they scroll
// in — PaneTitleBar.module.css's own position:sticky is what then pins
// it to the top of .paneScroll while everything else scrolls underneath.
// .pane itself stays the fixed-size, overflow:hidden box (so its radius
// actually clips its children, and .paneScroll — not .pane — is the only
// thing whose height varies with content).
export function PageShell({ title, titleContent, titleEndContent, children, scrollRestoreKey }: PageShellProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const setPageUiState = usePageStore((state) => state.setPageUiState);

  useEffect(() => {
    if (!scrollRestoreKey) return;
    // Read directly from the store at mount time rather than subscribing
    // via usePageStore — this is a one-shot restore of whatever value
    // mount-time finds, not reactive state this effect should re-run for
    // (re-running it if the value later changes, e.g. this same page
    // writing its own scroll position back, would fight the user's own
    // subsequent scrolling).
    const restoredScrollTop = usePageStore.getState().pageUiState[scrollRestoreKey]?.scrollTop;
    const el = scrollRef.current;
    if (el && restoredScrollTop !== undefined) el.scrollTop = restoredScrollTop;
  }, [scrollRestoreKey]);

  const handleScroll = scrollRestoreKey
    ? (event: UIEvent<HTMLDivElement>) => setPageUiState(scrollRestoreKey, { scrollTop: event.currentTarget.scrollTop })
    : undefined;

  return (
    <div className={styles.root}>
      <div className={styles.margin}>
        {/* data-glass-surface: useSpecularPointer's opt-in selector. A
            behaviour hook, not a style — the pane's material and whether a
            specular renders at all are decided entirely by tokens (see
            PageShell.module.css). Same posture as EntityLink's data
            attributes: the shell reaches DOM through attributes, never
            through callbacks reaching into components. */}
        <div className={styles.pane} data-glass-surface>
          <div className={styles.paneScroll} ref={scrollRef} onScroll={handleScroll}>
            <PaneTitleBar title={title} titleContent={titleContent} endContent={titleEndContent} />
            <div className={styles.paneBody}>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
