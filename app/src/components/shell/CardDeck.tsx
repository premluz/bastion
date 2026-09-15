import { useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import styles from './CardDeck.module.css';

export interface CardDeckProps {
  children: ReactNode[];
  'aria-label': string;
  // Rendered below the deck for whichever card is currently in front —
  // the reference shows the name/badge/Manage row as a single static row
  // under the stack, not one row travelling inside each slide.
  renderDetails?: (activeIndex: number) => ReactNode;
}

// Ported from a SwiftUI reference (swiftui-4-card-deck-swipe, direct
// request: "try this reference, might build a new comp off it") —
// individual card-throw gestures, replacing the continuous scrub the
// deck used previously. The reference's own constants (drag divisors,
// rest-state offsets, rotation-per-depth) are kept as literal ports
// rather than re-derived, since the ask was to match that interaction,
// not reinterpret it.
const SWIPE_THRESHOLD_PX = 90;
const DRAG_NORMALIZER_PX = 140;
const AXIS_LOCK_PX = 10;
const SETTLE_MS = 320;
const EXIT_MS = 420;

type Direction = 'left' | 'right' | null;

// clamp(-1, 1, x)
const clampUnit = (value: number) => Math.max(-1, Math.min(1, value));

export function CardDeck({ children, 'aria-label': ariaLabel, renderDetails }: CardDeckProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [exitDirection, setExitDirection] = useState<Direction>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const axisLocked = useRef(false);
  const exitTimer = useRef(0);
  const count = children.length;

  const wrap = (index: number) => ((index % count) + count) % count;

  const dragProgress = clampUnit(dragOffset / DRAG_NORMALIZER_PX);
  const leftProgress = Math.max(0, -dragProgress);
  const rightProgress = Math.max(0, dragProgress);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (count < 2 || isExiting) return;
    pointerStart.current = { x: event.clientX, y: event.clientY };
    axisLocked.current = false;
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    if (!start || isExiting) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    // Axis lock: the deck sits inside a vertically scrolling page, so a
    // mostly-vertical gesture must stay a page scroll rather than being
    // stolen as a card swipe.
    if (!axisLocked.current) {
      if (Math.abs(dx) < AXIS_LOCK_PX && Math.abs(dy) < AXIS_LOCK_PX) return;
      if (Math.abs(dy) > Math.abs(dx)) { pointerStart.current = null; return; }
      axisLocked.current = true;
      setIsDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    setDragOffset(dx);
  };

  const onPointerUp = () => {
    if (!pointerStart.current) return;
    pointerStart.current = null;
    if (!axisLocked.current) return;
    setIsDragging(false);
    const translation = dragOffset;
    if (translation <= -SWIPE_THRESHOLD_PX) {
      startExit('left');
    } else if (translation >= SWIPE_THRESHOLD_PX) {
      startExit('right');
    } else {
      setDragOffset(0);
    }
    axisLocked.current = false;
  };

  // Left exit: the front card flies off-screen left; the next card (its
  // own rest-state depth-1 slot) becomes front once the index advances.
  // Right exit: the PREVIOUS card comes back as front. The reference
  // gives it an elaborate two-phase escape/crown animation; this keeps
  // the single left/right symmetry the rest of this deck already uses
  // (advance/retreat by one), settling for a simpler right transition
  // rather than porting that two-phase choreography verbatim.
  const startExit = (direction: Direction) => {
    navigator.vibrate?.(8);
    setExitDirection(direction);
    setIsExiting(true);
    setDragOffset(direction === 'left' ? -DRAG_NORMALIZER_PX * 2.2 : DRAG_NORMALIZER_PX * 1.6);
    window.clearTimeout(exitTimer.current);
    exitTimer.current = window.setTimeout(() => {
      setSelectedIndex((current) => wrap(current + (direction === 'left' ? 1 : -1)));
      setIsExiting(false);
      setExitDirection(null);
      setDragOffset(0);
    }, EXIT_MS);
  };

  return (
    <div className={styles.root}>
      <div className={styles.track} role="region" aria-label={ariaLabel}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove}
        onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
        {children.map((child, index) => {
          const forward = wrap(index - selectedIndex);
          const isFront = forward === 0;
          let scale: number;
          let x: number;
          let y: number;
          let rotation: number;
          let opacity = 1;
          let zIndex: number;

          if (isFront) {
            if (isExiting && exitDirection === 'left') {
              x = dragOffset * 0.9;
              y = 10;
              rotation = -18;
              scale = 0.92;
            } else if (isExiting && exitDirection === 'right') {
              x = dragOffset * 0.42;
              y = 4;
              rotation = 6;
              scale = 0.965;
            } else {
              // Interactive drag: the front card follows the finger,
              // easing off on the right side the way the reference does
              // (rightProgress softens the 0.42 multiplier).
              x = dragOffset * 0.42 * (1 - rightProgress * 0.55) + 10 * rightProgress;
              y = 6 * leftProgress + 4 * rightProgress;
              rotation = -9 * leftProgress + 4 * rightProgress;
              scale = 1 - 0.03 * leftProgress - 0.015 * rightProgress;
            }
            zIndex = 100;
          } else if (forward === count - 1 && (dragOffset > 0 || (isExiting && exitDirection === 'right'))) {
            // The PREVIOUS card, rising into front from the back-right as
            // the user drags/exits right — the reference's "incoming"
            // card, interpolated the same eased way toward the front slot.
            const progress = isExiting ? 1 : Math.min(1, Math.max(0, dragOffset) / DRAG_NORMALIZER_PX);
            const eased = 1 - (1 - progress) ** 2;
            scale = 0.91 + 0.06 * eased;
            x = 22 - 68 * eased;
            y = 22 - 18 * eased;
            rotation = 12 - 18 * eased;
            zIndex = 12;
          } else {
            // Rest-state stack: diagonal down-right offsets, increasing
            // rotation per depth — ported directly from the reference's
            // back1/back2/back3 states (depths beyond 3 stay hidden).
            const depth = forward;
            // Reference offsets (8/15/22px) were tuned for its own 176px
            // card in a compact frame; at our card size and the deck's
            // tight masked band they read as visual noise rather than a
            // clear stack (2026-09-16, measured live: the composite of
            // barely-offset, barely-differentiated cards looked like a
            // rendering glitch, not an intentional deck). Horizontal and
            // vertical steps now scale independently — direct feedback:
            // "spread other cards more to the right" — rather than
            // reusing one magnitude for both axes the way the reference
            // does, since a symmetric step doesn't read as "more to the
            // right" specifically.
            const REST_SCALE_X = 6.5;
            const REST_SCALE_Y = 1.4;
            const base = [
              { s: 1, ox: 0, oy: 0, r: 0 },
              { s: 0.97, ox: 8 * REST_SCALE_X, oy: 8 * REST_SCALE_Y, r: 4 },
              { s: 0.94, ox: 15 * REST_SCALE_X, oy: 15 * REST_SCALE_Y, r: 8 },
              { s: 0.91, ox: 22 * REST_SCALE_X, oy: 22 * REST_SCALE_Y, r: 12 },
            ][Math.min(depth, 3)]!;
            scale = base.s + 0.03 * leftProgress - 0.03 * rightProgress;
            x = base.ox - 8 * leftProgress + 7 * rightProgress;
            // Stepped UP, not down (2026-09-16, confirmed with Prem): the
            // reference steps rear cards down-right, but our mask clips
            // each card's BOTTOM (tops stay anchored visible), so a
            // downward step pushes rear cards further into the clipped
            // area instead of revealing them — measured live, this is
            // why they read as barely-there. Flipping the vertical step
            // keeps the reference's rightward step and rotation-per-depth
            // direction while actually staying inside the visible band.
            y = -base.oy + 8 * leftProgress - 7 * rightProgress;
            rotation = base.r - 4 * leftProgress + 4 * rightProgress;
            if (depth === 2) opacity = 1 - 0.06 * rightProgress;
            if (depth >= 3) opacity = depth === 3 ? 1 - 0.18 * rightProgress : 0;
            zIndex = 30 - depth * 10;
          }

          return (
            <div key={index} className={styles.card} data-front={isFront}
              aria-hidden={!isFront}
              style={{
                zIndex,
                opacity,
                // -50% first: .card is left:50% in CSS so it can stay
                // centred as a group (2026-09-16, direct feedback: the
                // front card "remains in the center of screen"); each
                // card's own x/y then offsets it from that shared centre.
                transform: `translate3d(calc(-50% + ${x}px), ${y}px, 0) rotate(${rotation}deg) scale(${scale})`,
                transition: isDragging ? 'none'
                  : isExiting ? `transform ${EXIT_MS}ms var(--ease-standard), opacity ${EXIT_MS}ms var(--ease-standard)`
                  : `transform ${SETTLE_MS}ms var(--ease-float), opacity ${SETTLE_MS}ms var(--ease-standard)`,
              }}>
              {child}
            </div>
          );
        })}
      </div>
      {renderDetails?.(selectedIndex)}
      {count > 1 && (
        <div className={styles.dots} role="tablist" aria-label={`${ariaLabel} pagination`}>
          {children.map((_, index) => (
            <button key={index} type="button" role="tab" aria-selected={index === selectedIndex}
              aria-label={`Go to card ${index + 1}`} className={styles.dot} data-active={index === selectedIndex}
              onClick={() => setSelectedIndex(index)} />
          ))}
        </div>
      )}
    </div>
  );
}
