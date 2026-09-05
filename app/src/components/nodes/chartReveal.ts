// Chart line/area reveal (2026-08-31, direct feedback: charts should draw
// themselves in left-to-right, not appear instantly) — a named, scoped
// exception to CLAUDE.md rule 15 ("no per-component mount animation ...
// the interface-assembling effect is driven by node order, not per-
// component hacks"): that rule targets the SCENE-assembly stagger every
// other node type still uses unchanged; this is a chart's own intrinsic
// line-draw, which recharts already has natively (isAnimationActive was
// deliberately turned OFF everywhere in this app specifically to avoid
// double-animating a chart once for scene assembly AND once for its own
// line draw — see TimeSeries.tsx's own prior comment). Re-enabling it
// here restores recharts' own native capability with token-driven timing
// instead of leaving it fully off or falling back to recharts' own
// hardcoded 1500ms/'ease' default.
//
// Duration is a plain ms number read from a motion token (tokens.base.css/
// theme.*.css's own --motion-chart-reveal-duration), same "read the live
// theme value rather than guessing" precedent LandingState.tsx's own
// readMs already established. Easing can't use the same var(...)
// reference technique color/spacing values do: recharts consumes
// animationEasing as a JS animation-loop input, not a live CSS value, so
// a bare `var(--motion-enter-ease)` string would never resolve — this
// reads the theme's REAL resolved cubic-bezier(...) value via
// getComputedStyle at render time instead (confirmed via AskUserQuestion:
// reading the live token over hardcoding a duplicate curve, so a future
// re-tune of --motion-enter-ease/--ease-standard/--ease-float is picked
// up automatically, and each theme's own easing stays genuinely distinct
// rather than reading identically everywhere).
import type { EasingInput } from 'recharts';

export interface ChartRevealAnimation {
  animationDuration: number;
  animationEasing: EasingInput;
}

function readCssVar(varName: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

// recharts' EasingInput type only accepts a LITERAL `cubic-bezier(...)`
// template string, a fixed set of named curves, or a real function — it
// cannot express "any runtime string matching that pattern," so a value
// genuinely read from the DOM at runtime (this app's every theme's own
// --ease-standard/--ease-float, confirmed by reading tokens.base.css
// directly: both are always authored as `cubic-bezier(a, b, c, d)`) can
// never satisfy the type by construction, only by assertion. Verified via
// recharts' OWN runtime parser (animation/easing.js's createEasingFunction)
// before asserting: it accepts exactly this shape at runtime — a package-
// scoped override for a real gap between the vendor's type and its own
// accepted input, per CLAUDE.md's own carve-out for this situation, not a
// project-wide strictness loosening. Falls back to the named 'ease-out'
// curve (a real, always-valid member of the same union) if the token is
// ever missing or malformed, so a bad read degrades to a safe default
// instead of passing recharts a string it would silently reject.
function toEasingInput(raw: string): EasingInput {
  if (/^cubic-bezier\(\s*-?\d/.test(raw)) return raw as EasingInput;
  return 'ease-out';
}

export function getChartRevealAnimation(): ChartRevealAnimation {
  const durationRaw = readCssVar('--motion-chart-reveal-duration');
  const duration = parseFloat(durationRaw) || 480;
  const easing = toEasingInput(readCssVar('--motion-enter-ease'));
  return { animationDuration: duration, animationEasing: easing };
}
