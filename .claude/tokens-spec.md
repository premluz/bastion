# Token spec (Phase 1 canvas input) · OKLCH edition — project-agnostic, lives in canvas
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

## Invariants
- Ink identical across themes; themes differ in surface physics and light, not in text color.
- One signal hue system-wide (H 225). New hue request = report, don't add.
- No hex, rgb(), or hsl() anywhere in the codebase — Phase 0 gate greps for all three.
- Astryx cascade overrides restated in OKLCH; log each in astryx-bridge.md with the original value.
