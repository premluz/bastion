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
color: var(--surface-0); border: 1px solid var(--edge); }`. Specificity
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
