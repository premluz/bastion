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
    // minHeight: 0 (direct feedback, 2026-08-03: "content should not push
    // panes, they should be viewport height - margin bottom, same as in
    // composer") — height:100% alone doesn't stop a column flex item from
    // growing past its parent's height to fit tall content (min-height:
    // auto is the actual default fighting it); explicit 0 is what lets
    // this shrink to Frame.module.css's .contentColumn instead, the same
    // way ScrollAnchor.tsx's own root div already does for Home.
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, minWidth: 0 }}>
      {/* display:flex is load-bearing here, not decorative: .pane's own
          flex:1 (PageShell.module.css) only has any effect inside a flex
          container — without this, .pane sat in a plain block-level box
          and sized itself to its own content instead of the space this
          div actually has available, which was the real reason content
          kept pushing past the viewport (confirmed live via computed
          styles: every ancestor up to here correctly reported the real
          927px available height; only .pane, right where the flex
          container turned out to be block instead, ignored it). */}
      {/* Bottom gap matches the composer's own bottom padding (direct
          feedback, 2026-08-03: "content panes should have same
          margin-bottom as composer") — PanePadding.module.css's .padded,
          shared by the composer dock and the artifact pane's content,
          uses --space-32 vertical; this was --space-24, a mismatch. */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, padding: '0 var(--space-24) var(--space-32)' }}>
        <div className={styles.pane}>
          <div className={styles.paneScroll}>
            <PaneTitleBar title={title} endContent={titleEndContent} />
            <div className={styles.paneBody}>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
