/** A CSS duration custom property (`250ms` or `0.25s`) on the root, in milliseconds. Fails loudly if it is not one. */
export function cssDurationMs(name: string): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const ms = raw.endsWith('ms') ? parseFloat(raw) : parseFloat(raw) * 1000;
  if (!Number.isFinite(ms)) throw new Error(`${name} is not a duration: "${raw}"`);
  return ms;
}
