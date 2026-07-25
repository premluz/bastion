const VIZ_TOKENS = ['--viz-1', '--viz-2', '--viz-3', '--viz-4', '--viz-5', '--viz-6'] as const;

function hashToIndex(id: string, length: number): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return hash % length;
}

// Rounded-square identity glyph (direct feedback, 2026-07-20) — no real
// logos exist for any fictional entity, so this stands in for one: a
// deterministic color swatch (id-hashed pick from the existing
// --viz-1..6 data-viz palette, no new token). A letter monogram was
// considered and dropped: no "text on a colored fill" token exists
// anywhere in this stack (checked Astryx's own theme, not just ours),
// and inventing one would mean guessing per-hue contrast rather than
// proposing a real token — a plain swatch needs no text color at all,
// so it's the honest choice within what the architecture already has.
export function AssetLogo({ id }: { id: string }) {
  const token = VIZ_TOKENS[hashToIndex(id, VIZ_TOKENS.length)];
  return (
    <div
      style={{
        width: 'var(--space-32)',
        height: 'var(--space-32)',
        borderRadius: 'var(--radius-8)',
        background: `var(${token})`,
        flexShrink: 0,
      }}
    />
  );
}
