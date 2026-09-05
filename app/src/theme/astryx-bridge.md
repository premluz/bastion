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
| `--accent-signal` | ~~`--color-accent`~~ **overridden, see below** | `#0064E0` / `#2694FE` (stale — see note) |
| `--accent-alert` | `--color-error` | `#E3193B` / `#F5394F` |
| `--accent-warn` | `--color-warning` | `#E9AF08` / `#F2C00B` |
| `--accent-ok` | `--color-success` | `#0D8626` / `#0D8626` |
| `--delta-up` | `--color-icon-green` | `#0D8626` / `#26A756` |
| `--delta-down` | `--color-icon-red` | `#D31130` / `#E3193B` |
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

`--accent-signal` override (2026-08-30, direct order — third confirmed
illegible-chart-line occurrence: ring-chart, TrendChart, EarningsHistoryChart).
This row's own `#0064E0`/`#2694FE` values, pulled from `astryx docs tokens`
on 2026-07-08, are STALE against the currently installed
`@astryxdesign/theme-neutral@0.1.4`/`theme-stone@0.1.4` — confirmed by
reading each package's own `dist/theme.css` directly rather than trusting
this doc: both stock themes' real base `--color-accent` is monochrome
(`light-dark(#262626, #ebebeb)` neutral, `light-dark(#25252a, #f3f3f5)`
stone), not blue. Correct for Astryx's own UI chrome (a neutral accent is
the intended read for their buttons/focus rings); illegible as a chart-line
color, which several of our own components use `--accent-signal` for.
`theme.default.css`'s `--accent-signal` is now the one deliberate exception
to this file's own pass-through (Direction A) for every other token — it
reuses ops-dark's/glass's own already-proven authored value verbatim
(`oklch(.78 .14 225)`, confirmed 7.8:1 against this theme's own `--surface-1`
via canvas-based sRGB resolution, comfortably past WCAG AA's 4.5:1 floor)
rather than inventing a new hue. `--color-accent` itself is untouched —
Astryx's own components keep their own neutral accent unmodified; only the
semantic `--accent-signal` token our own components read is overridden.

## theme.ops-dark.css / theme.glass.css (override, direction B)

Same target Astryx variables as the table above, reversed direction — see
each file directly for its ◆ OKLCH values (ops-dark's are the original
tokens-spec.md ops-dark ◆ spec; glass's are tokens-spec.md's glass ◆ spec).
Both set `color-scheme: dark` and are scheme-locked (see below) — neither
is affected by the `astryxScheme` toggle.

## theme.safe-one.css (override, direction B)

Registered Phase 20 WO-2 (2026-08-15), a genuinely new 4th theme — not a
retune of ops-dark, not applied to any existing theme. Same target Astryx
variables as the table above, reversed direction (same posture as ops-
dark/glass); see the file directly for its own ◆ OKLCH values. Derived
from the supplied SAFE ONE reference screenshots (a cybersecurity-risk
dashboard), not from tokens-spec.md — no spec entry exists for this
theme yet; tokens-spec.md should gain one if this theme is promoted past
its current WO-2 scope. Scheme-locked (`color-scheme: dark`), unaffected
by `astryxScheme`, same as ops-dark/glass.

Structural notes for a future reader diffing this against ops-dark/glass:
surfaces/ink/accent-signal all share hue 285 (this codebase's existing
"purple" anchor, already `--viz-4`'s hue) rather than the other three
themes' hue 250 — a deliberate per-theme hue choice, not a typo.
`--accent-alert/-warn/-ok` and `--delta-up/-down` stay on their existing
hues across every theme (principle 8: tone/direction semantics are not a
per-theme taste dial). `--viz-1`…`--viz-6` also stay on their existing
hues/order — a "promote green to --viz-1" swap was tried and reverted in
this same change after confirming `--viz-1` is read by exactly ONE
consumer in the whole component tree (`AnalystConsensus.tsx`'s "bearish"
segment); swapping it would have painted bearish sentiment green,
backwards from every other theme's blue-for-bearish ordering, for zero
real benefit toward the reference's own look. The reason it's zero
benefit: every chart node's actual PRIMARY series color is
`--accent-signal`, not `--viz-1` — confirmed by reading `TimeSeries.tsx`/
`BarSeries.tsx`/`RingChart.tsx` directly, none of their own color arrays
start at `--viz-1`. `TimeSeries.tsx`'s primary trend line/area fill is
hardcoded to `--accent-signal` at 3 call sites (stroke + gradient stops),
consistent with every other registered theme — a real token-architecture
finding, not an oversight: the SAFE ONE reference shows a purple
interactive accent alongside green primary trend charts (two different
colors on one shared token), which the current architecture can't
express without a new `--chart-primary`-class token and a TimeSeries.tsx
component change. Ruled 2026-08-15: ship WO-2 with `--accent-signal`
purple everywhere including TrendChart/TimeSeries' primary line —
architecturally consistent with every other theme over matching the
reference's own green trend-line exactly; flagged as a known, accepted
deviation, not silently resolved either direction.
Surfaces are opaque oklch (no alpha channel, `--surface-opacity:
1`) — the reference's "glass-panel" read comes from `--surface-blur`/
`--edge`/`--spec-alpha` alone, not from true translucency the way
`theme.glass.css`'s own surfaces work.

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

## Universal list-row hover (`astryx-list-item`, `--color-overlay-hover`)

Astryx's `ListItem` only applies its own `:hover` background when the row
is genuinely interactive (`onClick`/`href` present — confirmed by reading
`Item.tsx`: the `interactive` stylex class, which is what actually carries
the `:hover` rule, is conditionally applied based on those two props, never
unconditionally). A List/ListItem with no defined per-row action — Data
Sources' "Connected" rows, some Entities/Watchlist rows — never gets that
class and so never shows a hover background, even though it's visually
indistinguishable from a hoverable row otherwise. Architect-reported live:
"we should have a hover state for all lists... while all should have."

Fix, theme.default.css only (unconditional/resolves-late, same reasoning
as the canvas rule above — one rule covers every registered theme):
targets `.astryx-list-item`, the stable class List's own "Theming" doc
table names as its intended override hook (`themeProps('list-item')`,
always applied regardless of interactivity), setting `background-color:
var(--color-overlay-hover)` on `:hover`. `--color-overlay-hover` itself is
Astryx's own variable — consumed as-is here, not bridged or reassigned,
same "direction A" reasoning as typography/motion: it already resolves
correctly per Astryx's own stock-theme + `color-scheme` pinning regardless
of which Meridian theme is active. Excludes `[aria-selected='true']`
(Astryx's own `.selected` class has lower specificity than this rule's
class+pseudo-class+hover, and would otherwise be visually overridden by
the plain hover background on the currently-open investigation's row —
found by reasoning through CSS specificity before shipping, not by a live
regression) and `[aria-disabled='true']` (already unreachable by `:hover`
via Astryx's own `pointer-events: none` on disabled items; excluded here
too so the rule states that guarantee rather than silently depending on
it).

## Artifact stack Card background (`--surface-0` + outline)

Phase 1 direct feedback: "the background color should be the same as the
composer background." Implemented using `--surface-3` (popover level).

Phase 2 revision (2026-07-29): "artifacts pane should match the workbench
background with outline only, not a raised surface." The popover level
creates visual separation from the workbench in dark schemes (dark-default's
`#111112` body vs `#28292C` popover; ops-dark's `.16` L vs `.26` L; glass's
`transparent` vs `.70` alpha). Intent is visual containment (outline only),
not surface elevation.

Fix, scoped to this one Card instance only (not a global theme rule, since
other default-variant Cards elsewhere in the app are correctly using the
card-level surface, not the workbench level) — `ArtifactStack.module.css`:
`.artifactCard:global(.astryx-card)[data-variant='default'] { background-
color: var(--surface-2); border: 0 solid var(--edge); }`. Specificity
deliberately matches Astryx's own `.astryx-card[data-variant="default"]` rule
exactly (class+class+attribute vs. class+attribute) so it reliably wins
regardless of import order, no `!important` needed.

**Phase 3 reversal (2026-08-02, direct feedback: "instead of outline make
it next surface level from bg, same for artifact pane")**: the Phase 2
"outline only, not a raised surface" ruling above is superseded — the
pane is now a raised surface again, one step above its ambient
background. What "ambient background" means changed too, in the same
order: content area was moved to match the sidenav (`--surface-0`, see
this file's own "Content area" theme-file entries), so one step up is now
`--surface-1`, not the workbench-level `--surface-0` Phase 2 specified.
Fix: `.artifactCard:global(.astryx-card)[data-variant='default'] {
background-color: var(--surface-1) }` — border dropped (no longer needed
once there's real background contrast, same as Astryx's own default-variant
Card relying on fill alone). `EntityDetailPage.module.css`'s `.detailCard`
got the identical reversal in the same order, for the same reason.

## Composer shadow removal (`astryx-chat-composer`)

Direct feedback: "the composer should not have shadow." Confirmed live via
computed styles before touching anything — `ChatComposer`'s own root
carries a real 3-layer `box-shadow` unconditionally (`themeProps('chat-
composer', {density})` in its own source, not guessed), on every instance
(the landing composer, the chat-mode `ChatBar` dock) regardless of state.

Fix, `theme.default.css`, unconditional/resolves-late (same reasoning as
the two rules above it — one rule covers every registered theme since
this removes a shadow rather than setting a themed color value, so there's
no per-theme value to bridge): `.astryx-chat-composer { box-shadow: none }`.

## Composer surface separation (`--color-border-emphasized`)

Direct feedback: "on light mode there's no bg for composer, or same as bg
underneath it." Confirmed live via computed styles, `shell-frame--default`
story, both `astryxScheme` values, before touching anything: the
composer's filled surface (`.astryx-chat-composer > div`, the same element
targeted by the shadow-removal rule above) resolves to Astryx
theme-neutral's own `--color-background-popover: light-dark(#ffffff,
#1b1b1b)`, painted directly against `:where(html,body)`'s
`--color-background-body: light-dark(#f1f1f1, #1b1b1b)` with no
intervening surface — a ~6% lightness gap in light scheme, and the exact
same value in dark scheme (`#1b1b1b` = `#1b1b1b`, literally invisible).
Previously masked by the composer's own box-shadow, removed above per
earlier direct feedback — the shadow was the only separation this pairing
ever had; removing it exposed this gap.

This is a `default`-theme-only gap in the narrow sense checked here
(composer fill vs. body/`--surface-0`): `ops-dark`/`glass` don't reuse
Astryx's stock popover/body pass-through — they define their own
`--surface-0..3` oklch scale and reassign `--color-background-*` to point
at it (`theme.ops-dark.css`/`theme.glass.css`), giving every level real
tonal distance by construction (confirmed live: `ops-dark`'s composer
resolves to `oklch(.26 .015 250)` against a `.16` body, `glass` the same
scale at `.7` alpha — both well-separated from the body).

**This was answering the wrong comparison, though** — the composer's
actual immediate background is `--surface-1` (AppShell's elevated content
backdrop), not `--surface-0`/body. Checked against the right baseline,
`ops-dark`/`glass` were two steps up (`--surface-3`/popover), not one —
see the "Correction" under the surface-separation entry further down for
the fix.

Fix, `theme.default.css`, scoped to `[data-theme='default']` only (not
unconditional like the two rules above it, since this one addresses a gap
specific to Astryx's own stock pass-through, not something true of every
theme): `[data-theme='default'] .astryx-chat-composer > div { border: 1px
solid var(--color-border-emphasized) }`. `--color-border-emphasized`
(`light-dark(#d4d4d4, #525252)`) consumed as-is, unbridged, same
"direction A" reasoning as `--color-overlay-hover` elsewhere in this file
— Astryx's own variable, not a new Meridian color. `--edge`
(`--color-border`, `light-dark(#ebebeb, ...)`) was checked first and
rejected: too close to the popover white to read as a real boundary.
Verified live: both `astryxScheme` values now show a visible composer
edge in `default`; `ops-dark`/`glass` computed styles unchanged at the
time (`border-width: 0px`, confirmed via `getComputedStyle`) — superseded
below, this claim no longer holds.

**Correction (2026-08-02, direct feedback: "composer should be 1 step
more in surface layer than the bg it's on, on all themes")**: the "no fix
needed" claim above was wrong on its own terms. `ops-dark`/`glass` were
never actually AT surface+1 — Astryx's unstyled `ChatComposer` resolves
this element to `--color-background-popover` (`--surface-3` in both
themes, this file's own mapping table above), while the composer's
ambient background (AppShell's default `elevated` variant, Frame.tsx
never overrides it) is `--surface-1`. That's surface+2, not surface+1 —
it read as "already separated" because surface+2 is *more* separated than
needed, not because it was the right amount. Fix, `theme.ops-dark.css`
and `theme.glass.css`, unconditional within each theme (both have real
tonal/alpha distance between adjacent surface tiers by construction, so
the plain semantic token works without an off-scale substitute):
`.astryx-chat-composer > div { background-color: var(--surface-2) }`.
`default` unchanged — its own `--color-background-gray` fix above stands,
since Astryx's stock light palette still collapses every raised-surface
level to identical white (unrelated to this correction, a stock-theme
limitation this file already documents), so the off-scale token remains
the only way to get real separation there.

**Follow-up direct feedback, same day**: "should be also surface color not
just outline" — a border alone read as an outline around an otherwise
still-white/still-invisible fill, not a distinct surface. Re-checked
Astryx's own background scale for anything else that could stand in for
`--color-background-popover` with genuinely more separation: every
"raised surface" level theme-neutral exposes — `--color-background-
surface`, `--color-background-card`, `--color-background-popover` — is
the identical `#ffffff` in light scheme (confirmed via the same theme.css
grep as above), so no pass-through *level* swap could ever fix this; the
gap is in Astryx's stock light-scheme palette itself, not in which level
we picked. The one Astryx neutral fill that isn't pinned to that same
white is `--color-background-gray` (theme-neutral's badge/tag-family
neutral, `light-dark(#e5e5e5, #FFFFFF1A)` via `--color-neutral`) — a flat,
genuinely distinct gray in light scheme, a visible translucent-white tint
over the dark body in dark scheme. Semantically it's borrowed from
Astryx's colored-badge-background family (red/orange/.../gray all live in
that same block) rather than a general elevated-surface token, but it's
still consumed as-is/unbridged, no new Meridian color, same precedent as
every other rule in this section.

Fix: added `background-color: var(--color-background-gray)` to the same
`[data-theme='default'] .astryx-chat-composer > div` rule above, alongside
(not replacing) the existing border — the two now read together as a
tinted panel with a defined edge, rather than either alone. Verified live:
both `astryxScheme` values of `default` show a visibly filled, bordered
composer distinct from the page; `ops-dark`/`glass` unaffected (rule still
scoped to `[data-theme='default']`, confirmed via `getComputedStyle`).

## Item hover, all rows (`astryx-item`)

Direct feedback (2026-07-20), Discover page: "all should have hover even
if no source to click," referring to the discovery-strip rows built on
Astryx's `Item` primitive. Same gap the list-item hover rule above
already documents and already fixes for `List`/`ListItem`: `Item` only
applies its own `:hover` treatment when given `onClick`/`href`, confirmed
in Astryx's own source, not guessed — most Discover-strip rows (anything
without a real investigation intent) carry neither.

Fix, `theme.default.css`, unconditional/resolves-late, identical
reasoning to the list-item rule immediately above it in that file — one
rule covers every theme: `.astryx-item:hover:not([aria-disabled='true'])
{ background-color: var(--color-overlay-hover) }`. Same variable, same
"consumed as-is" direction-A reasoning, not a new token. No
`[aria-selected]` exclusion needed here (unlike list-item) — `Item` has
no selected-state concept in this codebase's usage.

## Price delta indicators (`--delta-up`, `--delta-down`)

Direct feedback (2026-07-30), Discover Assets: "can't see clear red or
green down/up for 24h % and 7d %" in the asset table across themes. The
issue: Astryx's generic `--color-success`/`--color-error` (mapped to
`--accent-ok`/`--accent-alert`) have moderate saturation, insufficient
for small icon + text in data tables. Small deltas need higher perceptual
weight.

Solution: two new semantic tokens, `--delta-up` (positive, green) and
`--delta-down` (negative, red), with elevated chroma for visibility in
compact tables:

- `theme.default.css` (direction A): maps to Astryx's own
  `--color-icon-green` and `--color-icon-red` (higher saturation than
  the generic success/error pair, by Astryx's own design).
- `theme.ops-dark.css` and `theme.glass.css` (direction B): use oklch
  values with chroma +.11 vs. the generic accent pair (`--delta-up:
  oklch(.78 .26 165)` vs. `--accent-ok: oklch(.76 .15 165)`; `--delta-down:
  oklch(.72 .29 25)` vs. `--accent-alert: oklch(.68 .19 25)`), proven via
  live Discover page in all three themes (2026-07-30).

## Tooltip text color (`.astryx-tooltip` → `--surface-1-solid`) — 2026-08-07

Astryx's Tooltip is an *inverted* surface: it paints its chip in the primary
ink color and its text in a surface color. That is correct while surfaces are
opaque — and it silently broke when the glass themes gave `--surface-1` a .40
alpha, because the tooltip's own TEXT then inherited that alpha. Measured
live on a real rendered tooltip, not inferred: `color: oklch(.19 .015 250 /
.4)` on `background: oklch(.93 .01 250)` — 40%-transparent dark ink on a light
chip, which is exactly the "tooltip on dark mode text too pale" reported.

Override: `.astryx-tooltip { color: var(--surface-1-solid); }`, unconditional,
in all four theme files. Original value: whichever surface variable Astryx
maps its inverted text to (StyleX-generated, not greppable as a literal —
resolved by reading the live computed value). New value: the alpha-free twin
of the same surface, so the tooltip's text is fully opaque in every theme
while keeping Astryx's intended inversion.

Same root cause as a pinned-table-column seam fixed in the same change (the
pin itself was removed 2026-08-07, per direct feedback — Asset column no
longer sticky, so that specific symptom no longer applies): a consumer that
required an opaque surface silently inheriting a translucent one once glass
landed. `--surface-1-solid` exists to make that requirement explicit rather
than assumed.

## Neumorphic shading on `.astryx-list-item`/`.astryx-item`/`.astryx-button` — 2026-08-07

New cross-theme addition, direct order ("very subtle shadows on buttons and
main pane," Linear reference). `--shading-raised` (tokens.base.css: paired
inset box-shadows, light-top/dark-bottom) applied via `box-shadow` on:
- `.astryx-list-item[aria-selected='true']:not(:hover)` — selected-row cue,
  distinct from the existing hover rule (a flat `background-color` wash).
- `.astryx-button:not(:disabled)` — every variant, unconditional; the cue is
  about surface texture, not which action a button represents.

Neither class carries its own `box-shadow` today (confirmed live via
`getComputedStyle` before adding — `box-shadow: none` on both prior to this
change), so this is additive, not an override of an existing Astryx value.
Original value: none. New value: `var(--shading-raised)`, themed per-file
(near-zero in the glass themes deliberately — see theme.glass.css's own
comment for why stacking this on an already-translucent surface reads as mud).

## `#astryx-app-shell-main` side-edge glow — shipped 2026-08-07, removed 2026-08-08

`--edge-glow` added a paired soft box-shadow to AppShell's stable content-area
id, meant to reproduce a "light kind of thing" on the sidebar/content
boundary reportedly visible in a Linear reference screenshot. Retired the
next day after re-examining the same screenshot: that panel has no visible
sidebar/content seam at all — it reads as one continuous surface, and the
only edges present in the reference are around its floating AI panel (a
distinct pattern, not a divider). No override remains here; this element is
back to carrying only its background-color rule.

## SideNav footer-wrapper border-top — 2026-08-08

Astryx's `SideNav` wraps the `footer` prop in its own internal div (a
StyleX-compiled class with no stable name to select — the third direct
child of `.astryx-side-nav`). That wrapper carries a hairline `border-top`
in its own compiled output, confirmed live via `getComputedStyle` before
touching anything (`rgba(255,255,255,.1)`, present in every theme). No
`SideNav`/`footer` prop suppresses it (checked Astryx's own docs).

Override: `:global(.astryx-side-nav) > div:has(> .footerStack) { border-top:
none; margin-bottom: var(--space-16); }` in `Sidebar.module.css`, anchored to
the stable `.astryx-side-nav` class (already used elsewhere in this
codebase) rather than the unstable atomic classes, reaching the actual
wrapper via `:has()` from the one child class we control. First draft of
this rule wrote `.astryx-side-nav` as a bare selector inside a CSS Module —
CSS Modules scope every bare class by default, so it silently became a
locally-hashed class matching nothing on the real page (confirmed via
inspecting the compiled stylesheet: the selector had been rewritten to
`._astryx-side-nav_HASH`). Fixed with `:global(...)`. Worth remembering:
any global/Astryx class referenced from inside a `.module.css` file needs
`:global()` explicitly, or the module loader silently defeats it.

## `--shadow-low` (SegmentedControlItem selected-state drop-shadow) — 2026-08-15

Direct feedback: safe-one's period-selector (`SegmentedControlItem`'s
selected pill) reads with "too strong a shadow, doesn't feel like
neo-morphism." `SegmentedControlItem.tsx` applies `box-shadow:
shadowVars['--shadow-low']` unconditionally on its selected state; Astryx's
own default (`tokens.stylex.ts`) is `light-dark(rgba(0,0,0,.1),
rgba(0,0,0,.2))` — a real cast-shadow weight, not a neo-morphic lift, and no
theme file had ever overridden it before this entry (confirmed via grep).

Only safe-one was flagged (the other 4 themes' own screenshots were never
raised as an issue), but `lint-theme-parity.mjs` requires any token defined
in one theme to be defined in all five — so `--shadow-low` is now defined
everywhere: `default`/`ops-dark`/`glass`/`glass-light` each get Astryx's own
literal default value for their own color-scheme branch (a pass-through,
zero visual change), while `safe-one` gets a genuinely softer value (`0px 1px
1px oklch(0 0 0 / .12), 0px 1px 4px oklch(0 0 0 / .12)` vs. Astryx's `0px 1px
1px .1, 0px 2px 8px .1/.2`) — same restraint register as safe-one's own
already-existing `--shading-light`/`--shading-dark` comment ("this theme's
cards are thin-bordered + subtly blurred, not neumorphic").

## `--delta-up-bg`/`--delta-down-bg` (new semantic tokens, muted large-area delta fills) — 2026-08-16

Direct feedback: `AnalystConsensus`'s bearish/bullish bar segments, colored
`--delta-up`/`--delta-down` per the prior day's own ruling, read as "too
strong contrast" — the architect asked whether they were using tokens at
all (yes) and suggested matching the same background shade already used by
the Bullish/Bearish tag chips (`KeyIssuesCard`'s `Badge` components).

Root cause: `--delta-up`/`--delta-down` are tuned for small text/line
legibility (price-table deltas, `TrendChart`'s own line stroke) — full
saturation, opaque. `Badge`'s own `variant="green"`/`variant="red"` instead
read from Astryx's `--color-background-green`/`--color-background-red`
(`tokens.stylex.ts`: `light-dark(#24BB5E33, #24BB5E33)` /
`light-dark(#E3193B33, #E3193B33)` — the base hue at ~20% alpha) paired with
a separate, brighter `--color-text-green`/`--color-text-red` for the label
text — a genuine two-tier system, confirmed by reading `Badge.tsx`'s source
before adding anything.

New tokens added to close the same gap for this app's own components (not
every large fill should reach into Astryx's own background variable
directly — `default` theme does, since it's the pure-pass-through theme,
but the other 4 author their own oklch `--delta-up`/`--delta-down` and need
their own muted companion, not Astryx's fixed hex):

- `default`: `--delta-up-bg: var(--color-background-green)`,
  `--delta-down-bg: var(--color-background-red)` — direct pass-through,
  same posture as every other token in that file.
- `ops-dark`/`glass`/`safe-one`: `--delta-up-bg: oklch(.78 .26 165 / .2)`,
  `--delta-down-bg: oklch(.72 .29 25 / .2)` — same hue/chroma/lightness as
  each theme's own `--delta-up`/`--delta-down`, alpha dropped to `.2`
  (matching Astryx's own ~20% ratio).
- `glass-light`: `--delta-up-bg: oklch(.52 .19 165 / .2)`,
  `--delta-down-bg: oklch(.50 .22 25 / .2)` — same darkened light-scheme
  hue as that theme's own `--delta-up`/`--delta-down`, same `.2` alpha.

`AnalystConsensus.tsx`'s `SEGMENT_TOKENS` updated to consume `-bg` variants
for its bearish/bullish segments; neutral stays `--viz-2`, unchanged.

## `--tint-subtle`/`--tint-strong` (new semantic tokens, color-agnostic strength scale) — 2026-08-17

Direct feedback on `TrendChart`'s own area-fill gradient and glow (both
already `--delta-up`/`--delta-down`-colored per earlier entries above):
"subtler red/green (chart gradient and glow), this should be a token
value... strength alpha % of any color that we use for glow... should be
a token subtle/neutral/strong... could combine with any color in palette
green/red/theme accent."

Root gap: `glow.module.css`'s own glow had `opacity: var(--opacity-40)`
hardcoded directly on `.root::before, .root::after` — no per-instance
override existed the way `--glow-color` already had one. `TimeSeries.tsx`'s
own area-fill gradient had an even more literal problem: `stopOpacity={0.35}`,
a raw magic-value number with no token backing it at all (found while
implementing this, fixed along the way — not a separate, unrelated cleanup).

New primitive step: `--opacity-20` (`tokens.base.css`) — the existing scale
jumped `.12 → .40` with no real half-step; a genuine ~50% cut from `.40`
needed a value that didn't already exist.

New semantic pair, identical across all 5 theme files (a structural
opacity relationship, not a color — same posture as `--shadow-low`'s own
"all three panes get the same floor" precedent, just for tint strength
instead of a pixel value):
- `--tint-strong: var(--opacity-40)` — today's unchanged glow/gradient
  weight, the default for every existing consumer.
- `--tint-subtle: var(--opacity-20)` — the new ~50%-cut option.

Wiring: `glow.module.css`'s `.root` gained `--glow-strength: var(--tint-strong)`
as its own default (settable per-instance exactly like `--glow-color`
already is — no existing consumer's rendering changes unless it opts in).
`TrendChart.tsx` sets `--glow-strength: var(--tint-subtle)` alongside its
existing `--glow-color` override. `TimeSeries.tsx`'s gradient stop reads
`var(--tint-subtle)` via `style={{ stopOpacity: ... }}` (SVG's
`stop-opacity` presentation attribute accepts CSS custom properties
through `style`, not through the numeric `stopOpacity` JSX prop) — scoped
to `bleed` mode only; every other `time-series` usage keeps its original
literal `0.35`, untouched, since only the Entity Detail chart was asked
to change.

`KeyIssuesCard`'s own bullish/bearish glow is UNCHANGED — still
`--tint-strong` (the new default), since only the chart's own glow/
gradient was reported as too strong, not that pane.
