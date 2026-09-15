import { useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { useDeckMotionTokens } from './useDeckMotionTokens';
import { useDeckSpring } from './useDeckSpring';
import styles from './CardDeck.module.css';

export interface CardDeckProps {
  children: ReactNode[];
  'aria-label': string;
  // Rendered below the deck for whichever card is currently in front —
  // the reference shows the name/badge/Manage row as a single static row
  // under the stack, not one row travelling inside each slide (which is
  // what the prior scroll-snap version did).
  renderDetails?: (activeIndex: number) => ReactNode;
}

// Distance a card must travel before the swipe commits, as a share of the
// deck's own width — the spec's "if the swipe is cancelled before ~25-30%,
// spring everything back" threshold, read from --card-deck-commit-ratio.
const SWIPE_AXIS_LOCK_PX = 8;

// Drag-driven stacked deck (2026-09-16, direct feedback specifying the
// interaction physically: front card tracks the finger with rotation and
// scale-down, drops behind the deck past the commit threshold, the next
// card rises into the primary slot, and the former front card reappears
// rear-most for an infinite-deck feel).
//
// Replaces a scroll-snap track for THIS surface only — PromoCarousel
// still drives Home's promo strip, which wants a flat one-at-a-time
// carousel, not a deck (2026-09-16 call).
//
// Every card's transform derives from its depth (its distance from the
// front in the rotated order) plus live drag progress, rather than each
// card being imperatively animated: a reorder is then just an index
// change, which is what keeps "cards reorder, they don't fly across the
// screen" true by construction.
export function CardDeck({ children, 'aria-label': ariaLabel, renderDetails }: CardDeckProps) {
  const tokens = useDeckMotionTokens();
  const [activeIndex, setActiveIndex] = useState(0);
  const [drag, setDrag] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const axisLocked = useRef(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const count = children.length;

  // Springs to 0 on release: the committed reorder is an index change, so
  // the offset always settles home rather than animating to a new resting
  // offset. isDragging disables the spring entirely — a finger down means
  // the card tracks the pointer exactly.
  const springedDrag = useDeckSpring(isDragging ? drag : 0,
    { stiffness: tokens.stiffness, damping: tokens.damping }, !isDragging);
  const offset = isDragging ? drag : springedDrag;

  const width = trackRef.current?.offsetWidth ?? 1;
  const progress = Math.min(Math.abs(offset) / width, 1);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (count < 2) return;
    pointerStart.current = { x: event.clientX, y: event.clientY };
    axisLocked.current = false;
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    // Axis lock: the deck sits inside a vertically scrolling page, so a
    // mostly-vertical gesture must stay a page scroll rather than being
    // stolen as a card swipe.
    if (!axisLocked.current) {
      if (Math.abs(dx) < SWIPE_AXIS_LOCK_PX && Math.abs(dy) < SWIPE_AXIS_LOCK_PX) return;
      if (Math.abs(dy) > Math.abs(dx)) { pointerStart.current = null; return; }
      axisLocked.current = true;
      setIsDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    setDrag(dx);
  };

  const onPointerUp = () => {
    if (!pointerStart.current) return;
    pointerStart.current = null;
    if (axisLocked.current && Math.abs(drag) / width >= tokens.commitRatio) {
      // Haptic tick as the incoming card crosses into the primary slot.
      // Guarded: vibrate is absent on desktop Safari/Firefox entirely.
      navigator.vibrate?.(8);
      setActiveIndex((current) => (current + (drag < 0 ? 1 : count - 1)) % count);
    }
    setDrag(0);
    setIsDragging(false);
    axisLocked.current = false;
  };

  return (
    <div className={styles.root}>
      <div ref={trackRef} className={styles.track} role="region" aria-label={ariaLabel}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove}
        onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
        {children.map((child, index) => {
          const depth = (index - activeIndex + count) % count;
          const isFront = depth === 0;
          // Rear cards travel a fraction of the front card's distance —
          // the spec's "subtle parallax, rear cards move only ~55-70% as
          // far" — and each one's depth delay is applied as a transition
          // delay so the restack staggers front-to-back on release.
          const parallax = isFront ? 1 : tokens.parallax ** depth;
          const translate = isFront ? offset : offset * parallax * 0.35;
          // Past the commit threshold the front card dims and drops
          // behind; the incoming card gains contrast as it rises.
          const settledScale = 1 - depth * tokens.backScaleStep;
          const scale = isFront
            ? settledScale - (1 - tokens.dragScale) * progress
            : settledScale + (depth === 1 ? tokens.backScaleStep * progress : 0);
          // Regular stepped stack, not a rotational fan (2026-09-16,
          // direct feedback: "not like deck of playing cards spread,
          // instead regularly spaced kind of thing slanted"). Every card
          // shares ONE constant slant so they stay parallel; depth only
          // changes position, stepping left and UP so the spread reads
          // along the top edge — the prior fan stepped out of the bottom
          // corner and angled each layer differently, which is the
          // "spread is at bottom" the feedback called out.
          const rotation = tokens.slantDeg + (isFront
            ? tokens.dragRotationDeg * progress * Math.sign(offset || 1)
            : 0);
          // As the incoming card rises it closes its own one-step gap,
          // so depth 1 interpolates toward the front card's position.
          const closing = depth === 1 ? progress : 0;
          const stepX = -(depth - closing) * tokens.stepXPx;
          const stepY = -(depth - closing) * tokens.stepYPx;
          return (
            <div key={index} className={styles.card} data-front={isFront}
              aria-hidden={!isFront}
              style={{
                zIndex: count - depth,
                opacity: isFront ? 1 - progress * 0.4 : 1,
                transform: `translate3d(calc(${translate}px + ${stepX}px), ${stepY}px, 0) rotate(${rotation}deg) scale(${scale})`,
                transitionDelay: isDragging ? '0ms' : `${depth * tokens.depthDelayMs}ms`,
              }}>
              {child}
            </div>
          );
        })}
      </div>
      {renderDetails?.(activeIndex)}
      {count > 1 && (
        <div className={styles.dots} role="tablist" aria-label={`${ariaLabel} pagination`}>
          {children.map((_, index) => (
            <button key={index} type="button" role="tab" aria-selected={index === activeIndex}
              aria-label={`Go to card ${index + 1}`} className={styles.dot} data-active={index === activeIndex}
              onClick={() => setActiveIndex(index)} />
          ))}
        </div>
      )}
    </div>
  );
}
