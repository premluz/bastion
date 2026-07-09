# Meridian

Project-agnostic starter: tooling, design-system foundation, and a visual-
regression pipeline, built on Astryx (Meta's React/StyleX design system).
Ships no product. Duplicate this repo per project; nothing here should
assume a specific consumer.

## Quickstart

```
<duplicate this repo, rename package.json's "name" (root, minimum)>
pnpm i
pnpm exec playwright install chromium   # one-time, needed for test:visual
pnpm storybook                          # → localhost:6006
pnpm test:visual                        # 6/6 should pass, unmodified
```

`pnpm dev` boots Vite without error but serves nothing — `app/src` has no
entry point yet by design; Phase 1 ships the token/component foundation,
not an app shell. Nothing above should need a manual fix. If it does,
that's a defect in the canvas — fix it here, not in the clone.

## Token architecture (`app/src/theme/`)

Three tiers, strictly cascading. Components consume semantic tokens only
(`--surface-*`, `--ink-*`, `--accent-*`, ...) — never Astryx variables
directly, never raw `hex`/`rgb()`/`hsl()` — gated by `pnpm lint:tokens`
(chained into `pnpm verify`); color is OKLCH or a `var()` reference,
nothing else.

| File | Tier | Rule |
|---|---|---|
| `tokens.base.css` | Primitives | Raw scales only — spacing, radii, type, motion, z-depth, blur, opacity. Never referenced by components directly. |
| `theme.default.css` | Semantic | Pure pass-through — every token resolves *to* an Astryx variable. Zero Meridian-authored color. |
| `theme.ops-dark.css`, `theme.glass.css` | Semantic | ◆ owned themes — Meridian OKLCH values (see `tokens-spec.md`), scheme-locked (`color-scheme: dark`). |
| `astryx-bridge.md` | — | Every semantic↔Astryx mapping, both directions, logged. Read before touching any theme file. |

**Theme axes**, independent `data-*` attributes on root:
- `data-theme`: `default \| ops-dark \| glass` — `default` lets Astryx's own
  palette and light/dark switching flow through unmodified; `ops-dark`/
  `glass` are Meridian's fixed dark registers and ignore the viewer's
  OS/browser scheme entirely.
- `data-astryx-theme`: `neutral \| stone` — which Astryx stock preset loads.
- Storybook toolbar only: `astryxScheme` (dark\|light) exercises Astryx's
  own scheme switching — meaningful only under `theme=default`; ops-dark/
  glass are scheme-locked and ignore it.

Adding a theme = adding one mapping file, zero component changes. If a
component needs to change to support a new theme, that's an architecture
defect — report it, don't patch around it.

Astryx itself: check its CLI (`pnpm exec astryx docs <topic>`, `astryx
component <Name>`) before writing any UI element. Wrap components, never
fork them.

## Visual regression

`@playwright/test`'s native `toHaveScreenshot()` against Storybook's
`iframe.html` — no extra dependency. Specs in `tests/visual/*.spec.ts`,
baselines committed alongside code. Every component ships its story *and*
its baseline in the same change, never after.

New or changed baseline: `pnpm exec playwright test --update-snapshots`,
then actually look at the resulting screenshot before accepting it — a
green diff proves pixel-stability, not correctness.

## Governance

- **`CLAUDE.md`** — law for this repo. Rules, closed dependency list,
  structure, session protocol. Global `~/.claude/CLAUDE.md` guardrails
  apply beneath it; this file wins on conflict.
- **`tokens-spec.md`** — the ◆ color/token spec. Implement verbatim.
  Missing value → stop and ask, never invent.
- **`STATE.md`** — append-only memory, read at the start of every session:
  - *Approved decisions* — durable rulings, one line each, dated.
  - *Raw learnings* — mid-session observations that haven't earned a rule
    yet. Cleared only by a promotion review: promote into `CLAUDE.md`
    (global or project), keep as documentation near the relevant code, or
    delete if already fully encoded elsewhere.
  - *Session log* — what happened, gate results, open items.

Downstream projects duplicate this repo and bring their own `CLAUDE.md`.
Improvements made downstream get back-ported here deliberately, never
automatically.
