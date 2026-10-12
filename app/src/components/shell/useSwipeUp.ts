import { useCallback, useRef, type PointerEvent } from 'react';
import { isSwipeStarted, shouldCommitSwipe, swipeProgress, swipeTravel, type SwipeDirection } from './swipeUp';

interface Drag { id: number; startY: number; lastY: number; lastT: number; velocity: number; swiping: boolean }

export interface SwipeOptions {
  /** `up` opens (default); `down` is its mirror — the same maths on the finger's drop. */
  direction?: SwipeDirection;
  /** The custom property the progress (0 → 1) is written to on `ref`'s element. */
  property?: string;
}

// Binds the swipe maths to pointer events: it writes the progress (0 → 1) into a
// custom property (`--glow-progress` by default, like TouchIndicators' position) on
// the `ref` element as the finger travels, and calls `onCommit` at the trigger point
// or on a committing flick. The handlers may sit on a different element than `ref`.
// `isIgnored` lets the buttons inside keep their own taps.
export function useSwipeUp<T extends HTMLElement>(onCommit: () => void, isIgnored: (target: EventTarget) => boolean,
  { direction = 'up', property = '--glow-progress' }: SwipeOptions = {}) {
  const ref = useRef<T>(null);
  const drag = useRef<Drag | null>(null);
  // A swipe that ends over a button would otherwise also click it.
  const swiped = useRef(false);

  const show = (progress: number, dragging: boolean) => {
    const element = ref.current;
    if (!element) return;
    element.style.setProperty(property, String(progress));
    element.toggleAttribute('data-dragging', dragging);
  };
  // The gesture's progress outlives the commit: the morph's starting frame is the
  // half-morphed pill, so the owner calls `reset` once the opened state renders.
  const reset = useCallback(() => {
    ref.current?.style.setProperty(property, '0');
    ref.current?.removeAttribute('data-dragging');
  }, [property]);
  const commit = (progress: number) => {
    show(progress, false);
    onCommit();
  };

  const onPointerDown = (event: PointerEvent<T>) => {
    if (isIgnored(event.target) || event.button > 0) return;
    swiped.current = false;
    drag.current = { id: event.pointerId, startY: event.clientY, lastY: event.clientY, lastT: event.timeStamp, velocity: 0, swiping: false };
  };

  const onPointerMove = (event: PointerEvent<T>) => {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    const elapsed = Math.max(event.timeStamp - current.lastT, 1);
    // Smoothed, so one fast sample cannot decide the release.
    current.velocity = 0.6 * (swipeTravel(direction, current.lastY, event.clientY) / elapsed) + 0.4 * current.velocity;
    current.lastY = event.clientY;
    current.lastT = event.timeStamp;
    const rise = swipeTravel(direction, current.startY, event.clientY);
    if (!current.swiping && isSwipeStarted(rise)) {
      current.swiping = true;
      swiped.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (!current.swiping) return;
    // Reaching the trigger point commits at once — the new state locks in while
    // the finger is still down, rather than waiting for the release.
    if (shouldCommitSwipe(rise, 0)) {
      drag.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      commit(1);
      return;
    }
    show(swipeProgress(rise), true);
  };

  const finish = (event: PointerEvent<T>, commits: boolean) => {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    drag.current = null;
    const rise = swipeTravel(direction, current.startY, event.clientY);
    if (current.swiping && commits && shouldCommitSwipe(rise, current.velocity)) commit(swipeProgress(rise));
    else show(0, false);
  };

  return {
    ref,
    /** Clears the progress a commit left in place. */
    reset,
    /** True right after a swipe ended, so the click it produced can be ignored. */
    wasSwipe: () => swiped.current,
    handlers: {
      onPointerDown, onPointerMove,
      onPointerUp: (event: PointerEvent<T>) => finish(event, true),
      onPointerCancel: (event: PointerEvent<T>) => finish(event, false),
    },
  };
}
