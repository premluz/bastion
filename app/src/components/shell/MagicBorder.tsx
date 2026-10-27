import type { ReactNode } from 'react';
import styles from '../../theme/magicBorder.module.css';

export type MagicBorderVariant = 'rim' | 'bottom';

export interface MagicBorderProps {
  /** Something is being worked on: the rim glow swells in; off, it fades away. */
  isActive: boolean;
  /** rim: a soft glow all around the inside of the edge. bottom: a glow along the foot, a thin line on the
   *  bottom edge and a highlight running across it (indeterminate progress). */
  variant?: MagicBorderVariant;
  /** Sets --magic-border-radius (the wrapped element's corners), and any layout the wrapper needs. */
  className?: string | undefined;
  children: ReactNode;
}

// The magic border (theme/magicBorder.module.css) around any button or pane: the wrapped
// element, its soft inner rim glow (a blurred ring clipped to the element's shape, which a
// pseudo-element alone cannot do), and the hairline on the edge (the wrapper's ::after).
export function MagicBorder({ isActive, variant = 'rim', className, children }: MagicBorderProps) {
  return (
    <div className={className ? `${styles.root} ${className}` : styles.root} data-magic-border={isActive ? 'active' : undefined}
      data-magic-border-variant={variant} aria-busy={isActive}>
      {children}
      <span className={styles.clip} aria-hidden="true"><span className={styles.glow} /></span>
    </div>
  );
}
