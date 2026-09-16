import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { useFocusTrap } from '@astryxdesign/core/hooks';
import styles from './Sheet.module.css';

export type SheetSize = 'compact' | 'half' | 'full';

export interface SheetProps {
  size?: SheetSize;
  // Drag-up expands to 'full' (2026-09-16, direct feedback: "that handle
  // little line that user can drag down to close or up to expand if
  // expandable") — only meaningful when size isn't already 'full'.
  // Omitted/false: dragging up does nothing, the handle only closes.
  isExpandable?: boolean;
  onClose: () => void;
  // Fires once a drag-up gesture crosses the expand threshold — the
  // CALLER owns size state (same "lifted state" precedent as
  // MoneyPage/InvestmentsTab's own tab/period state), so Sheet itself
  // never mutates its own size prop; it only reports the gesture.
  onExpand?: () => void;
  // z-index this sheet renders at — assigned by whatever owns a
  // useSheetStack, not computed here: Sheet has no idea how many other
  // sheets exist or where it sits in the stack, only where it's told to
  // sit (same separation as CardDetailPage never deciding its own
  // z-index: 10 is real, but a THIRD/FOURTH stacked sheet needs the
  // stack owner assigning distinct values, not a hardcoded constant here).
  stackIndex?: number;
  // Recede visual (2026-09-16, same posture as MobileFrame's own assistant-
  // mode recede) for a sheet that now sits BENEATH a newly pushed one —
  // scales/dims slightly rather than vanishing outright, so the stack
  // reads as literal depth.
  isReceded?: boolean;
  children: ReactNode;
  'aria-label': string;
}

const CLOSE_THRESHOLD_PX = 100;
const EXPAND_THRESHOLD_PX = 60;

// General-purpose mobile sheet primitive (2026-09-16, direct feedback:
// "we need a comp that is resembling sheets, full screen, with header
// comp... and multi modal capability... sheets could vary in size and
// have that handle little line that user can drag down to close or up
// to expand if expandable"). Confirmed via Merlin research: no
// precedent exists there either — Merlin's own mobile modals are plain
// Dialog variant="fullscreen" with no handle, no drag gesture, no size
// variants, implicit DOM-order stacking. This is genuinely new,
// hand-rolled (no animation library in this stack, same discipline
// CardDeck's throw physics and CardDetailPage's shared-element FLIP
// transform already follow) rather than adapted from an existing
// pattern.
//
// Not built on Astryx's Dialog: Dialog uses the native <dialog> element
// with its own baked-in enter/exit keyframes and no drag-gesture hook —
// same reasoning CardDetailPage.tsx already documents for why IT isn't a
// Dialog either. This is a plain overlay div, positioned/stacked by
// whatever mounts it (see stackIndex/isReceded above).
export function Sheet({ size = 'half', isExpandable = false, onClose, onExpand, stackIndex = 0, isReceded = false, children, 'aria-label': ariaLabel }: SheetProps) {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  // Drives the enter transition via a real transition, not a `both`-
  // fill-mode @keyframes animation (the first version of this file used
  // that, and it broke the recede transform: a CSS animation's
  // fill-mode-held endpoint OVERRIDES any other rule setting `transform`
  // on the same element for as long as the fill mode holds it — caught
  // live, isReceded's own scale(0.9) computed correctly in the CSSOM but
  // never painted, because sheet-enter's `both` fill mode kept forcing
  // translateY(0) indefinitely after the animation finished, regardless
  // of source order or specificity). Starting false and flipping true on
  // the next frame after mount, combined with a plain CSS transition,
  // means the resting transform is just a normal composed value like any
  // other — recede's scale and the drag/enter translate coexist in one
  // string with no fill-mode fighting them.
  const [isEntered, setIsEntered] = useState(false);
  const pointerStart = useRef<{ y: number; time: number } | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsEntered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const { containerRef, focusFirst } = useFocusTrap<HTMLDivElement>({
    isActive: !isReceded && !isClosing,
    onEscape: onClose,
  });
  useEffect(() => { if (!isReceded && !isClosing) focusFirst(); }, [isReceded, isClosing, focusFirst]);

  function onHandlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    pointerStart.current = { y: event.clientY, time: Date.now() };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onHandlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!pointerStart.current) return;
    setIsDragging(true);
    setDragOffset(event.clientY - pointerStart.current.y);
  }

  function onHandlePointerUp() {
    const start = pointerStart.current;
    pointerStart.current = null;
    setIsDragging(false);
    if (!start) return;
    const elapsed = Date.now() - start.time;
    // Velocity-assisted threshold, not distance alone — a fast short
    // flick should close/expand the same way a slow long drag does,
    // same "real gesture, not just a ruler measurement" reasoning
    // CardDeck's own SWIPE_THRESHOLD_PX already applies (there via a
    // fixed distance since that gesture always runs to completion in
    // one held drag; here elapsed time is available too since a flick
    // is characteristically fast).
    const isFlick = elapsed < 200 && Math.abs(dragOffset) > 30;
    if (dragOffset >= CLOSE_THRESHOLD_PX || (isFlick && dragOffset > 0)) {
      close();
      return;
    }
    if (isExpandable && size !== 'full' && (-dragOffset >= EXPAND_THRESHOLD_PX || (isFlick && dragOffset < 0))) {
      onExpand?.();
    }
    setDragOffset(0);
  }

  function close() {
    setIsClosing(true);
    // Matches .sheet[data-closing='true']'s own exit transition duration
    // (Sheet.module.css) — the callback needs the SAME number the CSS
    // transition uses, and re-reading the custom property in JS here
    // would need an extra getComputedStyle round-trip for a value this
    // file already knows.
    window.setTimeout(onClose, 200);
  }

  // One composed transform string, not competing CSS rules — translateY
  // covers both the enter slide (100% → 0) and the live drag offset;
  // scale covers the recede state. Both always present together (scale
  // defaults to 1, never omitted) so switching isReceded never fights a
  // separately-sourced `transform` declaration the way the old
  // @keyframes approach did.
  const translateY = isClosing ? '100%' : !isEntered ? '100%' : `${Math.max(0, dragOffset)}px`;
  const scale = isReceded ? 'var(--shell-recede-scale-far)' : '1';

  return (
    <div className={styles.backdrop} data-closing={isClosing} data-receded={isReceded}
      style={{ zIndex: 20 + stackIndex } as React.CSSProperties}>
      {!isReceded && <button type="button" className={styles.scrim} aria-label="Close" onClick={close} tabIndex={-1} />}
      <div ref={containerRef} role="dialog" aria-modal="true" aria-label={ariaLabel}
        className={styles.sheet} data-size={size} data-dragging={isDragging} data-receded={isReceded} data-closing={isClosing}
        style={{ transform: `translateY(${translateY}) scale(${scale})` } as React.CSSProperties}>
        <div className={styles.handleZone}
          onPointerDown={onHandlePointerDown} onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerUp} onPointerCancel={onHandlePointerUp}>
          <div className={styles.handle} />
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
