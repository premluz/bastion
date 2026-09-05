import { BookmarkIcon as BookmarkOutline } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import { IconButton } from '@astryxdesign/core/IconButton';
import { useWatchlistStore } from '../../engine/stores/watchlistStore';
import styles from './WatchToggleButton.module.css';

// Shared watch-toggle affordance for Discover's grid and table views
// (2026-09-02, direct feedback: "the watchlist icon... should be
// bookmark (same as on nav), clicking it should fill (added state), and
// this icon should be visible on hovered card or row... on desktop, and
// on mobile visible of course"). Same BookmarkIcon Sidebar.tsx already
// uses for the Watchlist nav entry (@heroicons/react, approved dependency,
// CLAUDE.md §5) — outline when not watched, solid when watched, the
// standard Heroicons pairing, not a new icon choice. Reads
// useWatchlistStore directly (a shell component, free to touch stores —
// rule 6's own store-access ban is scoped to REGISTRY components) rather
// than threading an extra isWatched prop through EntityAssetGrid/
// EntityAssetTableCells, which only ever pass the watch() callback today.
// Click toggles both directions (2026-09-02 follow-up, direct feedback:
// "when added tooltip would say... 'Remove from watchlist' and also when
// clicked should indeed remove") — watch() alone was already a no-op
// once an item existed, so the click needed to branch to the store's new
// unwatch() action rather than the tooltip alone changing.
//
// Visibility: className={styles.trigger} is opacity:0 by default,
// revealed by the CALLER's own hover rule targeting this button's stable
// [data-watch-trigger] attribute (a card's own .cardWrapper:hover, a
// table's own tr:hover — two different DOM shapes, so the hover rule
// lives one level up in each caller, not here) — always visible once
// watched, so an added item's filled bookmark doesn't disappear the
// moment the pointer leaves (a state a user set is a fact, not a hover
// affordance). Always visible on any pointer that can't hover (mobile,
// touch) via a prefers-hover:none media query, per the order's own "on
// mobile visible of course."
export function WatchToggleButton({ entityId, name }: { entityId: string; name: string }) {
  const isWatched = useWatchlistStore((state) => Boolean(state.items[entityId]));
  const watch = useWatchlistStore((state) => state.watch);
  const unwatch = useWatchlistStore((state) => state.unwatch);

  return (
    <IconButton
      label={isWatched ? `Remove ${name} from watchlist` : `Watch ${name}`}
      tooltip={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
      icon={isWatched ? <BookmarkSolid width={16} height={16} /> : <BookmarkOutline width={16} height={16} />}
      variant="ghost"
      size="sm"
      className={isWatched ? styles.watched : styles.trigger}
      data-watch-trigger={isWatched ? undefined : true}
      onClick={() => (isWatched ? unwatch(entityId) : watch(entityId, name, 'manual'))}
    />
  );
}
