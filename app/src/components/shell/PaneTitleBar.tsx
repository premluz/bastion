import type { ReactNode } from 'react';
import { Text } from '@astryxdesign/core/Text';
import styles from './PaneTitleBar.module.css';

interface PaneTitleBarProps {
  title?: ReactNode;
  /* Fully custom title block (2026-08-19, direct feedback: "title of
     entity detail should be only the one pane title... move logo to the
     left of pane title and under it move ticker") — `title` alone always
     renders through .title's single-line/ellipsis Text wrapper, correct
     for the plain-string case every existing consumer (Home, the generic
     page bar, ArtifactStack) uses, but wrong for a caller that needs its
     OWN two-line layout (name + a subline underneath, here a ticker
     symbol) — wrapping that composed node in another Text plus forcing
     white-space:nowrap on the whole block would clip or double-wrap it.
     `titleContent`, when given, replaces `title` entirely and renders
     raw, unwrapped, inside the same startGroup slot — the caller owns
     its own typography and truncation. Mutually exclusive with `title`;
     `titleContent` wins if both are somehow passed. */
  titleContent?: ReactNode;
  startContent?: ReactNode;
  endContent?: ReactNode;
}

// Reusable pane title bar (direct order, 2026-07-29) — the one shared
// component behind every full-row-width bar in the workbench (Home,
// every place page) AND, as of 2026-08-02, every page's own pane title
// (PageShell.tsx), AND, as of 2026-08-04, the artifact pane's own header
// (ArtifactStack.tsx — direct feedback: "artifacts pane header should
// also have gradient like page panes... should be a comp, with optional
// icon buttons in front of title (like back) and right hand side").
// `startContent` is that back-button slot — optional, rendered before
// the title in the same flex row, sharing .startGroup's min-width:0 with
// the title so long titles truncate (direct feedback, same order: "...
// truncated if no room, not breaking in 2 lines") instead of wrapping or
// pushing endContent's icons out. `title` itself optional (direct
// feedback, 2026-08-02: page titles moved out of WorkbenchTitleBar.tsx's
// top bar into each page's own pane — the top bar now renders this same
// component with no title, icons only) — omits the Text node entirely
// rather than rendering an empty one. See WorkbenchTitleBar.tsx for the
// icon-only composition, PageShell.tsx for the per-page title
// composition, and ArtifactStack.tsx for the back-button composition.
export function PaneTitleBar({ title, titleContent, startContent, endContent }: PaneTitleBarProps) {
  return (
    <div className={styles.root}>
      <div className={styles.startGroup}>
        {startContent}
        {titleContent != null
          ? titleContent
          : title != null && (
              // One step up from label/body's shared 14px tier (direct
              // feedback, 2026-08-02: "1 scale larger than currently") —
              // large is the next distinct size in Astryx's built-in Text
              // scale, 17px. display:block + .title's own overflow rules are
              // what make truncation possible; Text alone doesn't clip.
              <Text type="large" weight="semibold" display="block" className={styles.title}>
                {title}
              </Text>
            )}
      </div>
      {endContent && <div className={styles.endContent}>{endContent}</div>}
    </div>
  );
}
