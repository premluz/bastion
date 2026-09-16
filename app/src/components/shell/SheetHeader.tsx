import type { ReactNode } from 'react';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import { Heading } from '@astryxdesign/core/Heading';
import styles from './Sheet.module.css';

export interface SheetHeaderProps {
  title?: string;
  // Left affordance — a modern sheet is either a drill-in (back arrow,
  // returns to a previous step within the same flow) or a standalone
  // presentation (close/X, dismisses the whole sheet). Never both: this
  // is the ONE left-side slot, matching iOS/Android's own single-leading-
  // control convention rather than a generic "left content" ReactNode
  // that could accumulate multiple buttons over time.
  leading?: 'back' | 'close' | 'none';
  onLeadingClick?: () => void;
  // Right affordance — "think of modern mobile native patterns": either
  // a primary CTA (a filled checkmark button, e.g. "confirm and advance")
  // or a plain small text button (e.g. "Skip", "Done"), never a generic
  // slot either, so every sheet's header reads consistently rather than
  // each caller inventing its own right-side control.
  trailing?: ReactNode;
}

// The header every Sheet renders (2026-09-16, direct feedback: "header
// comp (left side could be left arrow or close) right side could be
// check btn as main CTA or small button, think of modern mobile native
// patterns"). Deliberately not Astryx's own DialogHeader — that's a
// desktop-dialog header (centered title, close-button-only, actions live
// in a separate LayoutFooter) confirmed via Merlin research to have no
// mobile/CTA-in-header precedent. This is Sheet's own header, built for
// the mobile-native "leading control / title / trailing CTA" row.
export function SheetHeader({ title, leading = 'none', onLeadingClick, trailing }: SheetHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerSide}>
        {leading !== 'none' && (
          <IconButton label={leading === 'back' ? 'Back' : 'Close'} variant="ghost"
            icon={<Icon icon={leading === 'back' ? 'chevronLeft' : 'close'} />} {...(onLeadingClick ? { onClick: onLeadingClick } : {})} />
        )}
      </div>
      {title && <Heading level={1} type="display-3" className={styles.headerTitle}>{title}</Heading>}
      <div className={styles.headerSide} data-align="end">{trailing}</div>
    </header>
  );
}
