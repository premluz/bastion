import { describe, expect, it } from 'vitest';
import { isStaleReplay, STALE_REPLAY_WINDOW_MS } from './staleReplay';

describe('isStaleReplay', () => {
  it('flags the previous phrase arriving the instant a session starts, ignoring case and punctuation', () => {
    expect(isStaleReplay('Test.', 'test', 1000, 1100)).toBe(true);
    expect(isStaleReplay('send $50 to Daniel', 'Send 50 to daniel', 1000, 1300)).toBe(true);
  });
  it('lets a repeat through once the window has passed — a real second "yes"', () => {
    expect(isStaleReplay('yes', 'yes', 1000, 1000 + STALE_REPLAY_WINDOW_MS)).toBe(false);
  });
  it('never flags a different phrase, however early', () => {
    expect(isStaleReplay('confirm', 'test', 1000, 1010)).toBe(false);
  });
  it('never flags anything when nothing has been submitted yet', () => {
    expect(isStaleReplay('test', '', 1000, 1010)).toBe(false);
    expect(isStaleReplay('   ', '', 1000, 1010)).toBe(false);
  });
});
