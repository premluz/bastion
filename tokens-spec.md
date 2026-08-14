# Token spec (Phase 1 canvas input) · OKLCH edition — project-agnostic, lives in Meridian (the canvas repo)
Sonnet: implement verbatim. All color authored in `oklch()` — hex is banned everywhere, including theme files. Values marked ◆ are Prem's taste decisions — implement as given, never substitute. Missing value → stop and ask, don't invent.

## Color system rules
- One neutral hue for the entire system: **H 250** (cold slate). Surfaces and ink are tinted neutrals on this hue — never gray (C 0).
- Ramps are defined as **L steps at fixed C/H**. Adjusting a ramp = moving L, nothing else.
- All four accents sit at **equal perceptual weight** (L .70–.78) — this is the OKLCH advantage, keep it.
- Interactive/derived states use **relative color syntax**, never hand-authored second values:
  hover `oklch(from var(--x) calc(l + .05) c h)` · pressed `calc(l - .04)` · disabled `l calc(c * .3) h / .5`
- Chroma discipline: neutrals ≤ .02, accents ≤ .19. Data UI, not a poster. Chroma increase request = report, don't apply.

## Primitives (`tokens.base.css`)

Spacing: 2 · 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 (px)
Radii: 2 · 4 · 8 · 12 · full

Type ◆
- UI face: bridge to Astryx's default sans (log in astryx-bridge.md)
- Data face: monospace stack for numerals, ids, coordinates, timestamps
- Voice face (Phase 8E typography audit ruling — three-voice system): serif,
  Crimson (`"Crimson Text", "Crimson Pro", Crimson, Georgia, "Times New Roman",
  serif`) — reserved for the agent's interpretive prose only (text-block,
  recommendation); never numerals, never labels, never data
- Ramp: 11 / 12 / 13 / 14 / 16 / 20 / 24 / 32 — dense-data bias; 13 is body, not 16
- Tabular numerals on all data faces (`font-variant-numeric: tabular-nums`)

Motion
- Durations: 120 · 200 · 320 · 480 ms
- Easings: `standard` cubic-bezier(.2,0,0,1) · `decel` cubic-bezier(0,0,.2,1) · `float` cubic-bezier(.16,1,.3,1)

Z-depth (shadow ∥ paired blur step) — shadow color oklch(0 0 0 / a)
- z0: none ∥ 0
- z1: 0 1px 2px oklch(0 0 0 / .4) ∥ 8
- z2: 0 4px 12px oklch(0 0 0 / .45) ∥ 16
- z3: 0 12px 32px oklch(0 0 0 / .5) ∥ 24
- z4: 0 24px 64px oklch(0 0 0 / .55) ∥ 40

Blur scale: 8 · 16 · 24 · 40 (px)
Opacity scale: .04 · .08 · .12 · .40 · .55 · .70

## Semantic — ops-dark ◆

Surfaces (L-ramp, C .015, H 250)
- --surface-0: oklch(.16 .015 250)   (canvas)
- --surface-1: oklch(.19 .015 250)
- --surface-2: oklch(.22 .015 250)
- --surface-3: oklch(.26 .015 250)
Ink (L-ramp, C .01, H 250)
- --ink-primary:   oklch(.93 .01 250)
- --ink-secondary: oklch(.70 .01 250)
- --ink-muted:     oklch(.50 .01 250)
Accents (equal-weight band, L .70–.78 — one signal, do not add hues)
- --accent-signal: oklch(.78 .14 225)
- --accent-alert:  oklch(.68 .19 25)
- --accent-warn:   oklch(.78 .16 75)
- --accent-ok:     oklch(.76 .15 165)
Structure
- --edge: oklch(1 0 0 / .08)
- --edge-highlight: transparent   (ops-dark has no refracted light)
- --surface-blur: 0
- --surface-opacity: 1
- --glow: none
- --scrim: transparent
Motion binding: enter 200/standard · exit 120/standard · assembly stagger step 60ms

Register: matte, dense, precise. Nothing floats, nothing glows except signal states.

## Semantic — glass ◆

Surfaces (same L-ramp, alpha channel active, blur on)
- --surface-0: transparent   (canvas shows through — app supplies deep backdrop)
- --surface-1: oklch(.19 .015 250 / .40)
- --surface-2: oklch(.22 .015 250 / .55)
- --surface-3: oklch(.26 .015 250 / .70)
- --surface-blur: 24px
Ink: identical trio to ops-dark (legibility constant across themes)
Accents: identical values + derived glow
- --glow: 0 0 12px oklch(from var(--accent-signal) l c h / .35)   (accent-signal only — never on ink)
Structure
- --edge: oklch(1 0 0 / .10)
- --edge-highlight: oklch(1 0 0 / .25)   (top edge only, 1px — refracted light)
- --scrim: oklch(.13 .015 250 / .35)   (raise alpha when contrast audit fails — this token, nothing else)
Depth: panels sit at z2 default, active/focused panel z3
Motion binding: enter 320/float · exit 200/decel · assembly stagger step 90ms

Register: suspended panes, additive light, unhurried. AR overlay credibility — legibility never traded for translucency.

## Semantic — glass-light ◆

The glass material lit from the other side. Registered 2026-08-06 (direct architect order), and the reason the ink invariant below was amended — a light scheme is exactly the case the original wording forbade.

Surfaces (light L-ramp, alpha active, blur on)
- --surface-0: transparent   (canvas shows through — app supplies backdrop)
- --surface-1: oklch(.97 .004 250 / .62)
- --surface-2: oklch(.99 .003 250 / .70)
- --surface-3: oklch(1 0 0 / .78)
- --surface-blur: 32px
Ink: flipped ramp, same L-spacing as glass mirrored into the dark end
- --ink-primary: oklch(.24 .012 250) · --ink-secondary: oklch(.44 .012 250) · --ink-muted: oklch(.60 .010 250)
Accents: same hue identity (H 225 signal), lightness pulled to .52–.58 to carry on a light ground
Structure
- --edge: oklch(.24 .012 250 / .12)   (dark hairline — a white edge is invisible here)
- --edge-highlight: oklch(1 0 0 / .55)   (stays WHITE — it is the specular/refraction colour, and a highlight is where light hits regardless of scheme)
- --scrim: oklch(1 0 0 / .40)   (raise alpha when contrast audit fails — this token, nothing else)
Motion binding: identical to glass (pacing belongs to the register, not the lighting)

**Opacity asymmetry — the load-bearing rule.** Light glass needs MORE opacity than dark glass, not the same. Dark translucency is forgiving: whatever passes behind it darkens toward the ink's own ground and light text keeps its contrast. Light translucency is not — dark content behind a 40%-opaque white pane drags the surface grey and dark ink loses its footing. Hence .62→.78 here against glass's .40→.70, and a heavier blur (32 vs 24px) to destroy more backdrop structure before it can compete with text.

Register: same as glass — suspended panes, additive light, unhurried. Legibility never traded for translucency.

## Material

The glass themes' blur is consumed as `--surface-material`, a complete `backdrop-filter` value, not as a bare radius. Two reasons it is a token rather than a rule in each pane's stylesheet: panes state that they are surfaces which *can* carry a material, never which one; and matte themes set it to `none` rather than `blur(0px)`, because a zero-radius filter still spins up the filter pipeline and makes the element a containing block for fixed descendants — a layout consequence no matte theme asked for.

Blur always pairs with `saturate()` (`--saturate-140`/`--saturate-180`). A blurred backdrop loses apparent chroma — averaging neighbouring pixels pulls toward grey — so the saturation step is what separates frosted glass from a grey smear. Standard across Fluent Acrylic and every credible glassmorphism implementation.

**Specular** (`--spec-alpha`, `--spec-radius`): a pointer-tracked radial highlight in `--edge-highlight`'s colour, the thing that makes glass read as a lit material rather than a blurred rectangle. `--spec-alpha: 0` switches it off wholesale, which is how the matte themes opt out. Coordinates come from `useSpecularPointer` (shell-level, rAF-throttled) writing `--spec-x`/`--spec-y`; CSS cannot source pointer position on its own. One material layer per depth — panes are frosted, cards inside them are outline-only. Stacking frosted on frosted is what turns glassmorphism to mud.

**Restraint pass (2026-08-07).** Direct order: pull the glass themes back from an earlier Raycast-style reference (saturated, dramatic) toward a Linear-style one (near-monochrome, whisper-soft). `--saturate-180` → `--saturate-140` on `--surface-material` in `theme.glass.css` (glass-light was already at `-140`); `--spec-alpha` roughly halved in both glass themes; `--canvas-backdrop` chroma cut by roughly half in both, same two-pool structure retained (a uniform backdrop still blurs to itself and reads flat — that finding didn't change, only how saturated the pools are). Reference comparison, not a re-derivation from first principles: Linear's own frosted panels show almost no tint or specular presence, closer to "clarity through diffusion" than a colored film.

**Neumorphic shading** (`--shading-light`, `--shading-dark`, consumed as the paired token `--shading-raised`/`--shading-pressed` in `tokens.base.css`): a directional light-top/dark-bottom inset cue on OPAQUE interactive/structural surfaces — list rows, buttons, panes — distinct from the glass material vocabulary above (this is about surface *texture*, not translucency, and applies in every theme including the matte ones). Reference: Linear's own light-mode UI, whisper-soft even on an opaque background. Deliberately near-zero in the glass themes — stacking a second soft-light cue on an already-translucent, already-blurred surface reads as mud rather than craft; the glass value exists (not `none`) so the same rule works unconditionally across every theme rather than each consumer needing a theme-conditional check.

**Side-edge glow — removed (2026-08-08).** A `--edge-glow` token/consumer pair shipped 2026-08-07 based on a misread of the Linear reference screenshot (a "light kind of thing" on the sidebar/content boundary that turned out, on a closer look at the same screenshot, not to exist — that panel has no visible seam at all; the only edges in the reference are around its floating AI panel, a different pattern entirely). Retired same-day, all four theme files and its one consumer (`#astryx-app-shell-main`) — see STATE.md for the record.

## Invariants
- Ink identical WITHIN a scheme; a light scheme flips the ink ramp and nothing else. Themes otherwise differ in surface physics and light, not in text color — accents, viz palette, and motion hold constant across a scheme pair. (Amended 2026-08-06 for glass-light ◆; the original read "Ink identical across themes," which no light scheme can satisfy.)
- One signal hue system-wide (H 225). New hue request = report, don't add.
- No hex, rgb(), or hsl() anywhere in the codebase — Phase 0 gate greps for all three.
- Astryx cascade overrides restated in OKLCH; log each in astryx-bridge.md with the original value.
