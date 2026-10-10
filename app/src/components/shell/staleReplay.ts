// Some speech engines replay the previous phrase as the first result of a new
// listening session (2026-10-09, reported on device: pressing the orb printed
// "test", the word said in an earlier session). Nobody can say a phrase and
// have it recognised within a fraction of a second of the microphone opening,
// so a result that repeats the last submitted words that early is the engine
// talking, not the user.
export const STALE_REPLAY_WINDOW_MS = 600;

const key = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');

export function isStaleReplay(text: string, lastSubmitted: string, engineStartedAt: number, now: number): boolean {
  const heard = key(text);
  return heard !== '' && heard === key(lastSubmitted) && now - engineStartedAt < STALE_REPLAY_WINDOW_MS;
}
