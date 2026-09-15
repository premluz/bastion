import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { useDeckMotionTokens } from './useDeckMotionTokens';
import { useDeckSpring } from './useDeckSpring';
import styles from './CardDeck.module.css';

export interface CardDeckProps {
  children: ReactNode[];
  'aria-label': string;
  // Rendered below the deck for whichever card is currently in front —
  // the reference shows the name/badge/Manage row as a single static row
  // under the stack, not one row travelling inside each slide.
  renderDetails?: (activeIndex: number) => ReactNode;
}

// Pointer travel that advances the deck by exactly one card. Smaller than
// the track's own width so a comfortable flick moves a card, and a long
// scrub crosses several without needing a full screen-width per card.
const SCRUB_DISTANCE_PX = 120;
const AXIS_LOCK_PX = 8;
// Trackpad deltas are far finer-grained than pointer travel; this scales
// wheel distance into the same scrub space.
const WHEEL_SCALE = 0.6;

// Continuously scrubbed stacked deck (2026-09-16, direct feedback:
// "scroll magic mouse horizontal and drag across scrub should produce
// same interaction as clicking dots but continues — so could scrub
// across to go through all cards seamlessly... no separate drag the
// cards interaction, just triggering next card move").
//
// The deck's whole state is ONE fractional position: 1.4 means "40% of
// the way from card 1 to card 2". Every card's depth — and therefore its
// step, scale and z-order — is derived from that fraction, so the stack
// flows continuously through any number of cards rather than each card
// being thrown individually. Dragging, wheeling and clicking a dot all
// write to the same value, which is what makes them the same interaction
// at different granularities.
export function CardDeck({ children, 'aria-label': ariaLabel, renderDetails }: CardDeckProps) {
  const tokens = useDeckMotionTokens();
  // Committed target (whole number) and the live scrub offset in cards.
  const [target, setTarget] = useState(0);
  const [scrub, setScrub] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const axisLocked = useRef(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const wheelIdle = useRef(0);
  const count = children.length;
  const maxIndex = count - 1;

  // Settles to the nearest whole card when released; while scrubbing the
  // deck tracks the input exactly, so the spring is disabled.
  const settled = useDeckSpring(target, { stiffness: tokens.stiffness, damping: tokens.damping }, !isScrubbing);
  const position = isScrubbing ? target + scrub : settled;
  const activeIndex = Math.max(0, Math.min(maxIndex, Math.round(position)));

  const clamp = (value: number) => Math.max(0, Math.min(maxIndex, value));

  const commit = (next: number) => {
    const clamped = clamp(Math.round(next));
    // Haptic tick as a new card crosses into the primary slot. Guarded:
    // vibrate is absent on desktop Safari/Firefox entirely.
    if (clamped !== target) navigator.vibrate?.(8);
    setTarget(clamped);
  };

  // Latest committed target, read inside the native wheel handler — the
  // listener is registered once, so it must not close over a stale value.
  const targetRef = useRef(target);
  targetRef.current = target;

  // Horizontal wheel/trackpad scrub. Registered natively rather than via
  // onWheel so it can be non-passive: the deck must be able to preventDefault
  // on a horizontal gesture to stop the page scrolling sideways under it,
  // which React's own passive-by-default wheel listener cannot do.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || count < 2) return;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      setIsScrubbing(true);
      setScrub((current) => {
        const next = current + (event.deltaX / SCRUB_DISTANCE_PX) * WHEEL_SCALE;
        // Clamp against the committed target so the deck can't be scrubbed
        // past either end of the real deck.
        return clamp(targetRef.current + next) - targetRef.current;
      });
      // A wheel gesture has no "release" event, so settle on a quiet gap.
      window.clearTimeout(wheelIdle.current);
      wheelIdle.current = window.setTimeout(() => {
        setScrub((currentScrub) => {
          const landed = clamp(Math.round(targetRef.current + currentScrub));
          if (landed !== targetRef.current) navigator.vibrate?.(8);
          setTarget(landed);
          return 0;
        });
        setIsScrubbing(false);
      }, 120);
    };
    track.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      track.removeEventListener('wheel', onWheel);
      window.clearTimeout(wheelIdle.current);
    };
  }, [count, maxIndex]);

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
    // stolen as a deck scrub.
    if (!axisLocked.current) {
      if (Math.abs(dx) < AXIS_LOCK_PX && Math.abs(dy) < AXIS_LOCK_PX) return;
      if (Math.abs(dy) > Math.abs(dx)) { pointerStart.current = null; return; }
      axisLocked.current = true;
      setIsScrubbing(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    // Dragging left (negative dx) advances forward through the deck.
    setScrub(clamp(target - dx / SCRUB_DISTANCE_PX) - target);
  };

  const onPointerUp = () => {
    if (!pointerStart.current) return;
    pointerStart.current = null;
    if (axisLocked.current) commit(target + scrub);
    setScrub(0);
    setIsScrubbing(false);
    axisLocked.current = false;
  };

  return (
    <div className={styles.root}>
      <div ref={trackRef} className={styles.track} role="region" aria-label={ariaLabel}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove}
        onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
        {children.map((child, index) => {
          // Fractional depth: 0 is the front slot, and a card mid-scrub
          // sits between two slots rather than snapping between them.
          const depth = index - position;
          const isFront = Math.round(depth) === 0;
          // Cards already passed fade out as they leave the front slot;
          // those still ahead keep their place in the stack.
          const opacity = depth < -0.5 ? Math.max(0, 1 + (depth + 0.5) * 2) : 1;
          const scale = Math.max(0.5, 1 - Math.max(depth, 0) * tokens.backScaleStep);
          const stepX = -Math.max(depth, -1) * tokens.stepXPx;
          const stepY = -Math.max(depth, -1) * tokens.stepYPx;
          return (
            <div key={index} className={styles.card} data-front={isFront}
              aria-hidden={!isFront}
              style={{
                zIndex: count - Math.round(Math.max(depth, 0)),
                opacity,
                transform: `translate3d(${stepX}px, ${stepY}px, 0) rotate(${tokens.slantDeg}deg) scale(${scale})`,
                // No transition while scrubbing: the position itself is
                // already continuous, so a transition would smear it.
                transition: isScrubbing ? 'none' : undefined,
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
              onClick={() => commit(index)} />
          ))}
        </div>
      )}
    </div>
  );
}
