import type { ReactNode } from 'react';
import styles from './AnimatedListItem.module.css';

interface AnimatedListItemProps {
  children: ReactNode;
  index: number;
}

// Wrapper for individual page components (cards, rows, sections) that
// creates a staggered entrance animation. Pass the item's position in its
// list via `index`; the component applies animation-delay based on
// --motion-table-stagger. Works with any component EXCEPT one whose
// parent relies on DOM-adjacency CSS (e.g. Astryx List's ':last-child'
// divider rule) — wrapping breaks that; see WatchlistPage.tsx for the
// direct className/style alternative used there instead.
export function AnimatedListItem({ children, index }: AnimatedListItemProps) {
  return (
    <div
      className={styles.animatedItem}
      style={{ '--item-index': index } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
