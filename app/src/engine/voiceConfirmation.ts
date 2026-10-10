// A spoken answer to "shall I go ahead?" on a review card — one reading for
// every scenario (2026-10-09, direct feedback: Daniel should hear yes /
// confirm / accept like the mortgage top-up). Mixed answers count as neither.
export type Confirmation = 'confirm' | 'cancel';
export function parseConfirmation(text: string): Confirmation | null {
  const confirm = /\b(confirm(?:ed)?|accept(?:ed)?|yes|yeah|yep|sure|ok(?:ay)?|go ahead|do it|send it|top it up|approve(?:d)?)\b/i.test(text);
  const cancel = /\b(cancel|stop|no|nope|don’t|don't)\b/i.test(text);
  if (confirm === cancel) return null;
  return confirm ? 'confirm' : 'cancel';
}
