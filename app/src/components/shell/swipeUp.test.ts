import { describe, expect, it } from 'vitest';
import { isSwipeStarted, shouldCommitSwipe, swipeProgress, swipeTravel, SWIPE_COMMIT_DISTANCE } from './swipeUp';

describe('swipeUp', () => {
  it('reveals in proportion to the rise and never past full', () => {
    expect(swipeProgress(0)).toBe(0);
    expect(swipeProgress(SWIPE_COMMIT_DISTANCE / 2)).toBe(0.5);
    expect(swipeProgress(SWIPE_COMMIT_DISTANCE * 3)).toBe(1);
  });

  it('dragging down, or a bad value, reveals nothing', () => {
    expect(swipeProgress(-40)).toBe(0);
    expect(swipeProgress(Number.NaN)).toBe(0);
  });

  it('treats a few pixels of jitter as a tap, not a swipe', () => {
    expect(isSwipeStarted(8)).toBe(false);
    expect(isSwipeStarted(10)).toBe(true);
  });

  it('commits a slow drag only past the distance', () => {
    expect(shouldCommitSwipe(SWIPE_COMMIT_DISTANCE - 1, 0.05)).toBe(false);
    expect(shouldCommitSwipe(SWIPE_COMMIT_DISTANCE, 0.05)).toBe(true);
  });

  it('commits a short flick, but not a fast twitch or a slow short drag', () => {
    expect(shouldCommitSwipe(30, 0.8)).toBe(true);
    expect(shouldCommitSwipe(10, 2)).toBe(false);
    expect(shouldCommitSwipe(30, 0.2)).toBe(false);
  });
});

describe('swipeTravel', () => {
  it('is the rise for an up swipe and the drop for a down swipe', () => {
    expect(swipeTravel('up', 300, 240)).toBe(60);
    expect(swipeTravel('down', 300, 360)).toBe(60);
  });

  it('is negative against the gesture, so it never reveals or commits', () => {
    expect(swipeTravel('up', 300, 360)).toBe(-60);
    expect(swipeTravel('down', 300, 240)).toBe(-60);
    expect(swipeProgress(swipeTravel('down', 300, 240))).toBe(0);
  });
});
