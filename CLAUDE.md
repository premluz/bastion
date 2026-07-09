# MERIDIAN — Reusable Project Canvas
## Master prompt & guardrails for this repo. This file is law. Global ~/.claude guardrails apply beneath it.

## 1. Mission
Meridian is a project-agnostic starter: tooling, design-system foundation, and verification pipeline that any future project duplicates and builds on. It ships no product. You are the executor; the architect is Prem. Conflicts resolve: this file → tokens-spec.md → STATE.md → ask Prem.

HARD RULE — project agnosticism: zero product vocabulary anywhere in this repo. No domain concepts, no downstream project names, nothing that only makes sense for one consumer. If a piece serves one project, it does not belong in Meridian.

## 2. Rules
1. Tokens only: no raw hex/oklch/px-shadow/blur values in components — everything through the token cascade. No hex, rgb(), or hsl() anywhere; color is authored in oklch() per tokens-spec.md.
2. Astryx first: check Astryx (MCP/CLI docs) before writing any UI element; wrap, never fork.
3. TypeScript strict. No `any`, `@ts-ignore`, unchecked casts.
4. Closed dependency list (§4). New dep → stop, one-paragraph case, wait.
5. File budget 200 lines. One component per file, PascalCase, named exports.
6. Every component ships with its Storybook story and a visual-regression baseline in the same change.

## 3. Structure
```
Meridian/
├── CLAUDE.md · STATE.md · tokens-spec.md · .mcp.json
├── app/
│   └── src/
│       ├── components/        ← foundation components only (ThemeSwitch, primitives)
│       └── theme/
│           ├── tokens.base.css      ← primitives: scales, type, motion, z-depth
│           ├── theme.default.css    ← semantic tokens → active Astryx stock theme
│           └── astryx-bridge.md     ← semantic ↔ Astryx variable mapping log
├── .storybook/                ← theme-switch toolbar, token sheet story
└── .claude/skills/            ← empty; project skills belong to consuming repos
```

## 4. Stack (closed)
react, react-dom · @astryxdesign/core + two stock theme packages · dev: typescript, vite, @vitejs/plugin-react, vitest, storybook, @storybook/react-vite, @playwright/test, @astryxdesign/cli. Nothing else.

## 5. Token & theme architecture
Three tiers, strictly cascading:
1. **Primitives** (`tokens.base.css`): raw scales — spacing, radii, type ramp, durations, easings, z-depth, blur, opacity. Never referenced by components directly.
2. **Semantic** (theme files): surfaces, ink, accents, edges, blur/opacity/glow/scrim — full set and values in tokens-spec.md. Components consume semantic tokens ONLY, never Astryx variables directly.
3. **Component tokens** last resort; added to every registered theme file in the same change.

`theme.default.css` maps every semantic token to the active Astryx cascade variable (pass-through: zero Meridian-authored color in this file); log each mapping in astryx-bridge.md. Theme switching via `data-theme` on the root, live, no remount. Adding a theme = adding one mapping file. If any component would need to change to support a new theme, that is an architecture defect — report it.

## 6. Phases
**Phase S — Environment setup. PREM ONLY.** Toolchain, editor, .mcp.json, governance files. You verify prerequisites and report gaps; never install global tooling.

**Phase 1 — Canvas build.** pnpm workspace with `app/`, all §4 tooling configured, visual-regression pipeline (`pnpm test:visual`, baselines on disk, pass/fail as text), Astryx with two stock themes, full three-tier token architecture per tokens-spec.md, ThemeSwitch, token sheet story.
*Gate:* token sheet story flips between Astryx stock themes through the semantic layer with zero component changes; `test:visual` green; instantiation test — duplicate, rename, `pnpm i && pnpm dev` and Storybook run clean with no manual fixes.

Downstream projects duplicate this repo and bring their own CLAUDE.md. Improvements made downstream are back-ported here deliberately, never automatically. This repo is never modified from a downstream session.

## 7. Session protocol
0. Read STATE.md — its entries are approved law equal to this file.
1. State the phase; if unclear, inspect and report before writing code.
2. List files you will create/modify. Only those.
3. Build. Astryx docs before any UI element.
4. Run the gate; show evidence. Visual evidence = `test:visual` output; agent screenshots only for new-baseline approval or failure diagnosis, element-scoped, one look per case.
5. Phase report: shipped, deviations (should be none), proposals awaiting approval, risks.
6. Append to STATE.md (append-only). 7. Stop.
