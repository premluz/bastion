import { useState } from 'react';
import styles from './BrandMark.module.css';

// Collapsed-sidebar logo mark (direct feedback, 2026-08-08: "we need to
// include logo in minimised state... source is from logo.svg in public. if
// not present then letter M as text"). SideNavHeading only renders its
// `heading` string in the expanded rail — confirmed live: at isCollapsed the
// text disappears entirely with no fallback glyph — but its own `icon` prop
// is explicitly designed for exactly this ("In collapsed mode: hide if no
// icon, show icon-only if has icon", SideNavHeading's own source comment).
// Passed as that icon in Sidebar.tsx.
//
// isCollapsed gates the render here rather than leaving SideNavHeading to
// decide: SideNavHeading's own EXPANDED behavior (confirmed live, then
// reported: "M sign should not be in front of logo in expanded pane") pairs
// icon + heading side by side when both are given — correct for a genuine
// product icon (its own doc example), wrong for a mark that exists ONLY as
// a collapsed-state fallback for the missing "Merlin" text. Rendering null
// when expanded is what keeps this a collapsed-only affordance rather than
// fighting SideNavHeading's documented pairing behavior.
//
// public/logo.svg does not exist yet (confirmed live before building this —
// only unrelated placeholder marks under public/logos/). Vite/Storybook
// don't process public/ through the module graph (same constraint
// AssetLogo.tsx's own comment documents), so there's no import to type-check
// against; onError state, same pattern AssetLogo.tsx already established for
// exactly this "asset may not exist" case, is what lets this render the
// letter fallback the instant a real file appears — no code change needed
// when logo.svg is added, only the file itself.
export function BrandMark({ isCollapsed }: { isCollapsed: boolean }) {
  const [failed, setFailed] = useState(false);

  if (!isCollapsed) {
    return null;
  }

  if (failed) {
    return (
      <div className={styles.fallback} aria-hidden="true">
        M
      </div>
    );
  }

  return (
    <img
      src="/logo.svg"
      alt=""
      className={styles.mark}
      onError={() => setFailed(true)}
    />
  );
}
