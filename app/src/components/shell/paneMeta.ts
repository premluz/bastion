import type { IconName } from '@astryxdesign/core/Icon';
import type { PaneKind } from '../../engine/stores/workbenchStore';

// Shared between WorkbenchRail (icon + tooltip) and Frame (resize-handle
// accessible label) so the two never drift — one source of truth per
// pane kind, per the "one enforcement point" discipline this phase
// already applies to reopen paths (workbenchStore.ts's artifactStore
// subscription).
//
// Icon choices are the closest real fit in Astryx's closed IconName set
// (astryx component Icon --dense) — no dedicated "entity"/"watch"/"clock
// history" icon exists. `checkDouble` for watchlist is the weakest fit
// (no eye/star/bookmark icon exists at all — eyeSlash would read as
// "hidden," the opposite of "watched"); flagged as a new Astryx
// beta-feedback exhibit rather than forced into a wrong-meaning icon.
export const PANE_META: Record<PaneKind, { icon: IconName; label: string }> = {
  artifact: { icon: 'viewColumns', label: 'Artifact panel' },
  entities: { icon: 'search', label: 'Entities' },
  sources: { icon: 'externalLink', label: 'Sources' },
  watchlist: { icon: 'checkDouble', label: 'Watchlist' },
  history: { icon: 'clock', label: 'History' },
};
