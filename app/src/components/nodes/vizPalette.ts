const VIZ_SLOTS = 6;

// Deterministic group/kind → viz-token mapping shared by entity-graph and
// geo-panel. Group/kind strings are scene-authored and open-ended (not a
// fixed enum in the DataSet contracts), so a node may never hardcode a
// specific value — only a stable hash into the 6-slot categorical palette.
export function vizToken(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return `var(--viz-${(hash % VIZ_SLOTS) + 1})`;
}
