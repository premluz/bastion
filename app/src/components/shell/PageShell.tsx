import type { ReactNode } from 'react';
import { PaneTitleBar } from './PaneTitleBar';
import styles from './PageShell.module.css';

interface PageShellProps {
  title: ReactNode;
  titleEndContent?: ReactNode;
  children: ReactNode;
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
export function PageShell({ title, titleEndContent, children }: PageShellProps) {
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
          <div className={styles.paneScroll}>
            <PaneTitleBar title={title} endContent={titleEndContent} />
            <div className={styles.paneBody}>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
