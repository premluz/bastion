// Swipe-up to open the assistant (2026-10-10, direct feedback: "interaction to
// open composer is swipe up, and then full reveal glow") and, mirrored, swipe-down
// to close it (2026-10-12, direct feedback). Pure maths for the gesture, in the
// gesture's own direction (a down swipe's "rise" is the drop): how far the glow has revealed while a finger drags, and whether a
// release commits. Distances are CSS pixels, velocity is px/ms (upward positive).
// Above a finger's natural jitter on a tap, since a swipe may now start on a button.
export const SWIPE_START_DISTANCE = 10;     // below this it is still a tap
export const SWIPE_COMMIT_DISTANCE = 72;    // a slow drag must pass this
export const SWIPE_COMMIT_VELOCITY = 0.5;   // or a flick this fast, after SWIPE_FLICK_MIN
export const SWIPE_FLICK_MIN = 24;

export type SwipeDirection = 'up' | 'down';

/** How far the finger has travelled in the gesture's own direction (up: rise; down: drop). */
export function swipeTravel(direction: SwipeDirection, startY: number, y: number): number {
  return direction === 'up' ? startY - y : y - startY;
}

/** 0 → 1 as the finger rises to the commit distance; dragging down never reveals. */
export function swipeProgress(rise: number): number {
  if (!Number.isFinite(rise) || rise <= 0) return 0;
  return Math.min(rise / SWIPE_COMMIT_DISTANCE, 1);
}

export function isSwipeStarted(rise: number): boolean {
  return rise >= SWIPE_START_DISTANCE;
}

/** Whether releasing now opens the assistant. */
export function shouldCommitSwipe(rise: number, velocity: number): boolean {
  if (rise >= SWIPE_COMMIT_DISTANCE) return true;
  return rise >= SWIPE_FLICK_MIN && velocity >= SWIPE_COMMIT_VELOCITY;
}
