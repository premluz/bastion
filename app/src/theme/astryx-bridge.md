# Astryx bridge log

Semantic ↔ Astryx cascade variable mappings, logged in the same change that
introduces the mapping. Astryx original values pulled verbatim from
`pnpm exec astryx docs tokens` (0.1.4) on 2026-07-08.

Two bridge directions exist, for two different purposes — do not conflate them:

- **Direction A — pass-through** (`theme.default.css`): semantic token resolves
  TO the Astryx variable (`--surface-0: var(--color-background-body)`). This is
  what CLAUDE.md §5 means by "theme.default.css maps every semantic token to the
  active Astryx cascade variable." It lets our own components (which consume
  only semantic tokens) inherit Astryx's own light-dark() behavior, unmodified.
- **Direction B — override** (`theme.ops-dark.css`, `theme.glass.css`): Astryx
  variable resolves TO the semantic token (`--color-background-body: var(--surface-0)`).
  This is tokens-spec.md's "Astryx cascade overrides restated in OKLCH" — it lets
  Astryx's OWN components (wrapped, not forked) pick up our bespoke ◆ colors too.

A theme file uses one direction or the other, never both for the same variable.

## theme.default.css (pass-through, direction A)

| Meridian semantic | Astryx variable | Astryx original (light / dark) |
| --- | --- | --- |
| `--surface-0` | `--color-background-body` | `#F1F4F7` / `#111112` |
| `--surface-1` | `--color-background-surface` | `#FFFFFF` / `#1F1F22` |
| `--surface-2` | `--color-background-card` | `#FFFFFF` / `#1F1F22` |
| `--surface-3` | `--color-background-popover` | `#FFFFFF` / `#28292C` |
| `--ink-primary` | `--color-text-primary` | `#0A1317` / `#DFE2E5` |
| `--ink-secondary` | `--color-text-secondary` | `#4E606F` / `#AAAFB5` |
| `--ink-muted` | `--color-text-disabled` | `#A4B0BC` / `#6F747C` |
| `--accent-signal` | `--color-accent` | `#0064E0` / `#2694FE` |
| `--accent-alert` | `--color-error` | `#E3193B` / `#F5394F` |
| `--accent-warn` | `--color-warning` | `#E9AF08` / `#F2C00B` |
| `--accent-ok` | `--color-success` | `#0D8626` / `#0D8626` |
| `--edge` | `--color-border` | `#05365919` / `#F2F4F619` |
| `--viz-1` | `--color-icon-blue` | `#0064E0` / `#2694FE` |
| `--viz-2` | `--color-icon-teal` | `#009688` / `#26A69A` |
| `--viz-3` | `--color-icon-yellow` | `#FBC02D` / `#FFEE58` |
| `--viz-4` | `--color-icon-purple` | `#5B08D8` / `#7952FF` |
| `--viz-5` | `--color-icon-red` | `#D31130` / `#E3193B` |
| `--viz-6` | `--color-icon-green` | `#0D8626` / `#26A756` |

`--viz-1`…`--viz-6` (2026-07-10 addition, ruled by Prem): a 6-slot categorical
series palette for chart nodes (recharts), distinct from the single-hue
`--accent-*` set. `theme.default.css` maps them to 6 of Astryx's 10 named
`--color-icon-*` hue families (blue/teal/yellow/purple/red/green — chosen for
rough hue correspondence with the ◆ OKLCH hues below; cyan/gray/pink/orange
left unused). No direction-B bridge-back exists for these: unlike surfaces/
ink/accent/edge, Astryx's named hue families aren't a single semantic slot —
they're reused by many unrelated Astryx components, so forcing e.g.
`--color-icon-blue: var(--viz-1)` would silently recolor anything else on the
page using Astryx's "blue," not just charts. ops-dark/glass author their own
OKLCH values directly instead (see each file) — provisional pending Prem's ◆
tuning, not yet finalized.

`--edge-highlight`, `--surface-blur`, `--surface-opacity`, `--glow`, `--scrim`
have no Astryx equivalent — set to neutral/off (`transparent`, `0px`, `1`,
`none`, `transparent`). Not a color decision, so it doesn't compromise the
"no Meridian-authored OKLCH" rule for this file.

Note: `--color-accent`/`--color-error`/etc. above resolve to genuinely
different colors per stock theme (neutral vs stone) and per light/dark —
confirmed visually via test:visual (`default × neutral × light` renders
Astryx's actual dark-gray/red/olive/green palette, nothing like ops-dark's
saturated blue/red/orange/green).

## theme.ops-dark.css / theme.glass.css (override, direction B)

Same target Astryx variables as the table above, reversed direction — see
each file directly for its ◆ OKLCH values (ops-dark's are the original
tokens-spec.md ops-dark ◆ spec; glass's are tokens-spec.md's glass ◆ spec).
Both set `color-scheme: dark` and are scheme-locked (see below) — neither
is affected by the `astryxScheme` toggle.

## tokens.base.css (primitive bridge)

| Astryx variable | Purpose | Meridian primitive |
| --- | --- | --- |
| `--font-family-body` | Astryx's default UI sans stack | `--font-ui` falls back to it: `var(--font-family-body, system-ui, sans-serif)` |

Astryx ships colors as hex/`light-dark()` internally (their package, not ours
— the hex ban applies to code we author).

Not yet mapped in any direction: `--color-warning-muted`, `--color-success-muted`,
`--color-error-muted` — no component consumes them yet; map when one does. The
categorical data-viz palette (`--color-*-blue/cyan/gray/...`) is now partially
mapped — see `--viz-1`…`--viz-6` above (direction A only, by design).

## Stock theme wiring (data-astryx-theme)

`@astryxdesign/core`'s base CSS (`reset.css`, `astryx.css`) and both stock
theme CSS files (`theme-neutral/theme.css`, `theme-stone/theme.css`) are
imported globally in `.storybook/preview.ts`. Astryx scopes each stock
theme via `@scope ([data-astryx-theme="neutral"]) to ([data-astryx-theme])`,
independent of our own `data-theme` attribute — orthogonal axes on the same
root element. Astryx's theme CSS lives in `@layer astryx-theme`; direction-B
overrides in theme.ops-dark.css/theme.glass.css are unlayered, so they always
win over Astryx's own color values regardless of cascade order — CSS layers
rank any layered rule below any unlayered one. Direction-A pass-through in
theme.default.css doesn't override anything, so stock-theme colors flow
through untouched there, which is the point.

What Astryx's stock themes control regardless of theme/direction: typography
scale (`--font-size-*`, `--text-heading-*-leading`) and motion durations
(`--duration-fast/medium/...`) — these differ genuinely between neutral and
stone in all three Meridian themes, since none of the three bridge them.

## Light/dark pinning (color-scheme) — ops-dark & glass only

Each stock theme has ~96 `light-dark()`-valued variables neither ops-dark
nor glass bridges (syntax highlighting, muted status variants, categorical
data-viz colors). `light-dark()` resolves off the CSS `color-scheme`
property. `theme.ops-dark.css` and `theme.glass.css` set `color-scheme: dark`
— since both are fixed dark ◆ registers, this pins every unmapped Astryx
variable to its dark branch deterministically, regardless of the viewer's
OS/browser preference. Confirmed side effect via test:visual: browsers also
use `color-scheme` to pick the default canvas behind fully transparent
content, so glass's `--surface-0: transparent` falls back to a dark canvas
instead of white when no backdrop is supplied — closer to the spec's "AR
overlay" register.

`theme.default.css` deliberately does NOT set `color-scheme` — as a pure
pass-through, it has no register of its own to pin; Astryx's own light/dark
behavior (or the `astryxScheme` toggle, in Storybook) governs it directly.

## Exposing Astryx's light mode (astryxScheme global)

`.storybook/preview.ts` has a third, independent toolbar global,
`astryxScheme` (`dark` | `light`, default `dark`), applied via
`document.documentElement.style.colorScheme = ...` — but **only when
`theme === 'default'`**. For `ops-dark`/`glass` the decorator clears any
inline override (empty string) so their own scheme-locked stylesheet rule
applies unimpeded — inline style beats stylesheet, so leaving it set would
have silently broken the scheme lock.

Three independent Storybook axes: `theme` (default|ops-dark|glass),
`astryxTheme` (stock preset: neutral|stone), `astryxScheme` (Astryx-internal
dark|light, meaningful only under `theme=default`).

## Typography audit (Phase 8E) — the serif leak, root-caused

Live audit (real computed-`font-family` DOM walk, not eyeballed) found two
categories of unintended serif, both resolving to bare `Times` — the
browser's raw UA default, not any font Astryx or this project ever chose:

1. **Astryx-internal elements with no font class of their own**: `Badge`'s
   label span (StatusTag), `MetadataList`'s `<dt>` (EntityHeader's
   attribute labels), `ConfidenceMeter`'s label/value spans, `Blockquote`'s
   own text (Recommendation). Astryx applies `--font-family-body` only via
   its own scoped `.astryx-text`/`.astryx-heading` classes (confirmed by
   reading `astryx.css` directly — `--font-family-body` itself is a
   correctly sans-serif stack, `Figtree`/`Nunito Sans`/system-ui, nothing
   serif anywhere in Astryx's own CSS) — components that don't wrap their
   text in one of those two classes get nothing, and fall through to the
   browser default.
2. **This project's own hand-rolled SVG `<text>`**: `ConcentrationMap`,
   `EntityGraph`, `GeoPanel`, `chartCraft.tsx`'s `TabularTick` (used by
   `bar-series`/`time-series`) — none ever set `font-family` at all.

Root cause for both: this project's own `:where(html, body)` canvas rule
(theme.default.css, applies globally regardless of active theme via late
`var()` resolution — see "Canvas" above) set `background`/`color` but never
`font-family`, so nothing in the cascade ever supplied a sane default for
anything Astryx's own scoped classes didn't already cover.

Fix: three new semantic tokens, identical across all three registered
themes since typeface isn't a ◆ per-theme register (bridging
`tokens.base.css`'s `--font-ui`/`--font-data`/`--font-voice` primitives):
`--face-ui` (labels, UI chrome), `--face-data` (numerals/values, always
paired with `tabular-nums`), `--face-voice` (serif, Crimson — the agent's
interpretive prose only: text-block, recommendation; three-voice ◆ ruling,
node-vocabulary.md principle 2). `--face-ui` added to the existing
`:where(html, body)` rule closes category 1 for free, zero component
changes. Category 2 needed explicit `fontFamily` on every raw SVG `<text>`
element found (component changes, since SVG doesn't get a free ride from
the html/body default the way normal DOM text does when the split between
UI/data faces matters per-element).
