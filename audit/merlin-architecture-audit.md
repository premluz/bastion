# Merlin — Architecture & Styling/Theming Audit

**Scope:** `app/src/` · read-only static analysis · audited against `CLAUDE.md` (authoritative), `tokens-spec.md`, `STATE.md` (context only).
**Baseline state:** `tsc -b app/tsconfig.json` clean · `vitest run` **42/42 passed** · `lint:tokens` **both halves clean**. Nothing here is a break; everything is law-conformance drift.

---

## 1. Summary

The token *cascade* is in excellent shape and the *engine boundary* is genuinely clean — the two things hardest to retrofit are both correct. The drift is concentrated in one rule and one bug class.

1. **Rule 4's inline-style ban is the single largest conformance gap: 127 occurrences across `components/` and `renderer/`, none caught by any lint.** All are token-sourced (no raw colors leak), so this is a *structural* violation, not a theming break — but the rule explicitly anticipates and forbids exactly this ("a fully token-sourced inline style still violates this rule"). ~103 are static and trivially movable to CSS modules; ~23 are legitimately dynamic and need a sanctioned pattern rather than deletion.
2. **The `min-width: 0` bug class has ~20 unswept files.** The highest-confidence instance is `SceneSummary.module.css:13` — a `1fr 1fr` grid *in the same file* whose sibling `1fr 1fr` grid at line 32 **is** container-query-guarded. One was fixed, its twin four lines up was not.
3. **`KeyIssuesCard.module.css:17` guards an artifact-pane grid with a `@media` query.** `SceneSummary.module.css:1-6` documents at length why this is wrong for pane-rendered nodes (pane width is independent of viewport). Same defect, opposite conclusions, in two neighbouring registry nodes.
4. **`EntityAssetTable.tsx:89` fixes the min-width bug *inline* rather than in its CSS module** — one violation causing another, and diverging from the `DataTable`/`Comparison` reference fix that the codebase itself documents as the pattern.
5. **`engine/assetDiscoveryMock.ts:164` uses `const asset: any`** — a flat rule-11 violation, and the file budget has silently regressed on several files that STATE.md previously logged as fixed.

**Two things worth saying plainly.** The lint script's regex cannot see `oklch()`, which the theme files use as their primary color format — so the guard that makes finding A1 "clean" would not catch a raw `oklch()` dropped into a component tomorrow. And `EntitiesPage.tsx` was logged at STATE.md:847 as a known 304→301-line violation left deliberately unfixed; it is now **346**, so it has grown by 45 lines since being flagged.

---

## 2. A. Token / styling violations

### A1 — Raw hex/rgb/hsl in components — **CLEAN**, with one caveat

`pnpm lint:tokens` (run as its two halves, since `pnpm` is not on this machine's PATH):

```
Part 1 (grep #hex|rgb()|hsl()):  no matches  ✅
Part 2 (node lint-theme-parity.mjs):
  Theme parity OK — 47 semantic/primitive tokens consistent across 5 theme files.  ✅
```

Manual spot-checks beyond the regex — all clean: no `oklch/oklab/lab/lch` outside `theme/`; no color literals inside JS/TS template strings; no `px` box-shadow/blur in any component CSS; the only bare color keyword is `transparent` (`PageShell.module.css:211`, a keyword not a value — not a violation). `PLACEHOLDER_COLORS` (`StoriesAndAnalysisCard.tsx:6`) reads as a raw-color risk by its name but is `var(--viz-1..6)` throughout — ruled out.

| Item | Severity | Note |
|---|---|---|
| `package.json:10` — lint regex has no `oklch(`/`oklab(`/`lab(`/`lch(` arm | **Guard gap** | Theme files use `oklch()` as their primary format. A component author writing `oklch(.7 .1 250)` today passes lint. Currently zero actual violations — this is a hole in the net, not a leak through it. |

### A2 — Inline `style` props — **127 violations** (excluding `.stories.tsx`)

CLAUDE.md rule 4: *"No inline style props/objects even when values are all var() references — positioning/layout is a stylesheet concern; a fully token-sourced inline style still violates this rule."*

Every one is token-sourced, so **no theme breaks**. The severity is architectural: layout decisions living in JSX are invisible to the theme layer and to `lint:tokens`.

**Category 1 — static, trivially movable (~103).** Pure literal `display`/`gap`/`alignItems` objects. Representative, not exhaustive:

| file:line | Violation | Severity |
|---|---|---|
| `components/nodes/EntityHeader.tsx:37,38` | `style={{ display:'grid'/'flex', gap:'var(--space-8/12)' }}` | Cosmetic / structural |
| `components/nodes/Metric.tsx:35,39` | same pattern | Cosmetic / structural |
| `components/nodes/TextBlock.tsx:10,12` | grid + `fontFamily:'var(--face-voice)'` | Cosmetic / structural |
| `components/nodes/RingChart.tsx:46,48,52,85,87,88` | 6 in one file, incl. `flexShrink:0`, `maxWidth:'120px'` | Cosmetic / structural |
| `components/nodes/ConfidenceMeter.tsx:49,53,75,82` | incl. hardcoded `maxWidth:'120px'` (magic value) | Cosmetic / structural |
| `components/nodes/RingGauge.tsx:36,40,73,79` | incl. hardcoded `maxWidth:'160px'` (magic value) | Cosmetic / structural |
| `components/shell/Transcript.tsx:42,54,63,64` | grid/flex layout | Cosmetic / structural |
| `components/shell/Frame.tsx:132,153,159` | incl. `height:'100dvh'`, `minHeight:0` | Cosmetic / structural |
| `components/shell/EntityAssetGrid.tsx:36,39,73,77` | incl. `position:absolute` + offsets | Cosmetic / structural |
| `components/shell/EntityAssetTableCells.tsx:66,91` | incl. full button reset (`background:'none'`, `border:'none'`, `padding:0`) | Cosmetic / structural |
| `components/shell/InvestigationsPage.tsx:111,116,136` | incl. **`maxWidth: 320` — unitless magic number, no token** | **Magic value** |
| `components/shell/PaneFitCollapseHarness.tsx:90,91` | **`width: 300` magic number + `border:'1px dashed var(--edge)'`** | **Magic value** |

Two of these carry a second, independent rule-4 breach: `maxWidth: 320` and `width: 300` are raw magic numbers, which rule 4 bans separately from the inline-style question.

**Category 2 — genuinely dynamic (~23).** These *cannot* be a static class; each passes a runtime value into CSS. They are the defensible ones, but the rule as written admits no exception, so they need an explicit ratified carve-out (the CSS-custom-property-bridge pattern) rather than silent tolerance:

| file:line | Dynamic value | Assessment |
|---|---|---|
| `renderer/SceneRenderer.tsx:59` | `'--reveal-index': node.reveal` | **Load-bearing.** The assembly-stagger mechanism itself; rule 15 requires it be data-driven. Cannot be static. |
| `components/trail/TextChunkReveal.tsx:52,54` | `--chunk-stagger`, `--chunk-index` | Per-index stagger. Cannot be static. |
| `components/shell/AnimatedListItem.tsx:20`, `WatchlistPage.tsx:70` | `--item-index': index` | Cannot be static. |
| `components/nodes/AnalystConsensus.tsx:108,113` | `--marker-percent` from computed price position | Cannot be static. |
| `components/nodes/TrendChart.tsx:301,332` | `--glow-color`/`--accent-signal` from `trendColor` | Cannot be static. |
| `components/nodes/EntityGraph.tsx:41`, `ConcentrationMap.tsx:113` | `aspectRatio` from authored w/h | Cannot be static. |
| `components/shell/LandingState.tsx:143` | `transitionDelay: calc(... * ${index})` | Could move to `--item-index` + CSS, matching `AnimatedListItem`'s own pattern. **Inconsistent with the codebase's own solution.** |
| `components/shell/TrendDelta.tsx:26,27` | `color` from up/down | Documented workaround (`Text` has no semantic success/error color member). Justified in-file; still a rule-4 breach on paper. |
| `components/nodes/KeyIssuesCard.tsx:60,74`, `TimeSeries.tsx:181` | `--glow-color`/`--glow-strength` | **Values are literal constants** — these are static despite the custom-property form, and could be two CSS classes. |

### A3 — Astryx cascade variables read directly by components — **CLEAN**

Zero occurrences of `var(--color-background-*)`, `var(--color-text-*)`, `var(--color-border-*)`, `var(--spacing-N)` or `var(--font-*)` anywhere in `components/` or `renderer/`. The §7 indirection guarantee holds exactly as specified — components consume semantic tokens only. This is the strongest result in the audit and the one that actually protects the "add a theme = zero component changes" promise.

### A4 — Theme parity — **CLEAN**

`lint-theme-parity.mjs`: 47 semantic/primitive tokens consistent across all 5 registered theme files (`default`, `ops-dark`, `glass`, `glass-light`, `safe-one`). No missing-token drift.

---

## 3. B. Layout / overflow bug class (`min-width: auto` on flex/grid children)

**Method.** All 43 `.module.css` files under `components/` were enumerated; 33 declare `display:flex` or `display:grid`. **20 of those declare zero `min-width: 0`.** Each was then read against its paired `.tsx` to determine whether its children can hold intrinsically-wide content, and cross-referenced against `registry.ts` to establish whether it renders inside the resizable artifact pane (the pane is what makes this class *reachable* — a full-bleed component rarely narrows enough to trigger it).

The six previously-fixed sites (`Panel`, `DataTable`, `Comparison`, `assembly.module.css`, `DashboardLayout.module.css`, `ArtifactStack.module.css`) were confirmed fixed and are the reference pattern below.

| file:line | Flex/grid parent | Suspect child | Risk | Reasoning |
|---|---|---|---|---|
| `components/nodes/SceneSummary.module.css:13-17` | `.confidenceMetricsRow` `grid-template-columns: 1fr 1fr` | `.confidenceColumn` / `.metadataColumn` (both `display:grid`, hold text + metrics) | **HIGH** | **The strongest finding.** `.summaryRecommendationRow` (line 32) is the *identical* `1fr 1fr` grid and **is** guarded by a `@container (max-width:480px)` rule at line 38. `.confidenceMetricsRow` has neither that guard nor `min-width:0`. Same file, same node, same shape — one was swept, its twin was not. `.root` already sets `container-type:inline-size`, so the fix mechanism is present and unused. Node is registered (`registry.ts:119`) and appears in **7 fixture scenes**. |
| `components/nodes/KeyIssuesCard.module.css:17-21` | `.issueBody` `grid-template-columns: 1fr 1fr` | `.viewColumn > *` (`display:grid`, bull/bear prose + `.sourceRow` chips) | **HIGH** | Guarded by **`@media (max-width: 768px)` — a viewport query on an artifact-pane node.** `SceneSummary.module.css:1-6` documents precisely why this is wrong: *"this node renders inside a resizable artifact panel whose width is independent of the viewport — a media query would key off the browser window, not the pane, and could stay 2-column while the pane itself is too narrow to hold it."* On a wide monitor with a narrowed pane the media query never fires **and** there is no `min-width:0`, so two columns of prose are pinned at their intrinsic width. Registered at `registry.ts:167`. |
| `components/nodes/AnalystConsensus.module.css:83-92` | `.targetGrid` `grid-template-columns: repeat(4, 1fr)` | `.targetCell` ×4 (Low/Average/High/Current + `$nnn.nn` tabular figures) | **HIGH** | Four fixed fractional tracks holding currency values, no `min-width:0`, no container query anywhere in the file. Four columns is the tightest ratio in the codebase and the least able to absorb a narrow pane. Registered at `registry.ts:143`. |
| `components/nodes/AnalystConsensus.module.css:11-14, 35-38` | `.headerRow`, `.legendRow` (`display:flex`) | label/value text pairs | **MEDIUM** | Flex rows of text with no `min-width:0` and no `flex-wrap`. Same file, same absent guard; less severe than `.targetGrid` because content is shorter. |
| `components/shell/EntityAssetTable.tsx:89` | inline `display` chain → Astryx `Table` | `.astryx-table-scroll-wrapper` | **MEDIUM** | The only Astryx `Table` consumer **without** the `:global(.astryx-table-scroll-wrapper){min-width:0;width:100%}` override that `DataTable.module.css:25` and `Comparison.module.css:15` both document as *required in addition to* the parent's `min-width:0`. It compensates with an **inline** `{width:'100%',minWidth:0,overflow:'auto'}` — which works today, but note `.animatedTable` sits between that div and the Astryx wrapper as an unguarded intermediate. Fixes the symptom one level too high, off the documented pattern, and via a rule-4 violation. |
| `components/nodes/AssetPriceHeader.module.css:6-12, 21-29` | `.priceRow`, `.metaRow`, `.afterHoursRow` (`display:flex`) | price + delta + meta text | **MEDIUM** | Three unguarded flex rows; no `flex-wrap`, no `min-width:0`. Header content is short, which lowers likelihood, but long instrument names would overflow. Registered at `registry.ts:147`. |
| `components/nodes/TrendChart.module.css` (2 flex/grid decls) | — | Recharts `ResponsiveContainer` | **MEDIUM** | Recharts' responsive container is a classic offender: it measures its parent, and an unshrinkable parent makes it grow monotonically and never shrink back. Registered node, 338 lines. Worth a live narrow-pane check. |
| `components/nodes/EarningsHistoryChart.module.css:1` | 1 flex/grid decl, no `min-width:0` | chart body | **MEDIUM** | Same Recharts reasoning as above. |
| `components/nodes/AiRationaleRail.module.css:1-11` | `.root` grid, `.sourceRow` flex | source chips | **LOW** | `.sourceRow` **does** set `flex-wrap: wrap`, which is the correct mitigation for a chip row. `.root` grid is single-column. Largely self-protecting. |
| `components/nodes/Recommendation.module.css:1-4` | `.root` single-column grid | prose | **LOW** | Single-column grid; text wraps naturally. Only at risk if a child is itself unshrinkable. |
| `components/shell/Sidebar.module.css`, `Frame.module.css`, `ScrollAnchor.module.css`, `BrandMark.module.css`, `ConnectWalletDialog.module.css`, `DashboardSummaryHeader.module.css`, `StoriesAndAnalysisCard.module.css`, `AssetOverviewTab.module.css`, `ArtifactStackMount.module.css`, `trail/*.module.css` | various | various | **LOW** | Shell/trail chrome at stable widths, not inside the resizing pane. `Frame.module.css` already documents a `.contentColumn` `min-width` precedent, and `Sidebar` has its own fixed/collapsed widths. Listed for completeness; I would not chase these. |

**Judgment note.** I am confident in the top three (SceneSummary, KeyIssuesCard, AnalystConsensus) — each is a fixed-fraction multi-column grid, in a registered artifact-pane node, with no `min-width:0` and no container guard, and in two cases the codebase's own neighbouring code demonstrates the correct fix. The two Recharts entries are **reasoned inference, not confirmed** — `ResponsiveContainer`'s shrink behaviour depends on internals I did not verify statically, and both deserve a live narrow-pane check before anyone changes code. The LOW block is a completeness sweep, not a defect list.

---

## 4. C. Architecture conformance

### C1 — Dependency direction (rule 3) — **CLEAN**

Zero violations. `components/nodes/`, `components/trail/` and `renderer/` import **nothing** from `engine/`, `stores/`, `shell/` or `scenes/`. `contracts/` imports nothing upward. `registry/` imports nothing from `engine/` or app level.

The 30+ `engine/` imports in `components/shell/` are **not** violations — rule 1 exempts the app shell explicitly ("except the app shell"), and these are all shell files (`Frame`, `Transcript`, `ChatBar`, pages). Ruled out deliberately, since a naive grep flags them loudly.

### C2 — Registry purity (rule 2) — **CLEAN**

No scene JSON is imported outside the sanctioned path. The only `scenes/*.json` importers are `engine/sceneModule.ts:1`, `engine/resolver/keywordResolver.ts:4,13` and `engine/assetDiscovery.ts:145` — all engine-layer resolution, which is the designed door. No component imports a scene. One comment in `PortfolioDashboardPage.tsx:30` *mentions* a scene filename in prose only.

### C3 — File budget (rule 12) — **8 files over 200 lines**

Rule 12 exempts **only fixture JSON**, so CSS and theme files count.

| File | Lines | Status |
|---|---|---|
| `theme/theme.default.css` | 438 | Not justified in STATE.md |
| `components/shell/EntitiesPage.tsx` | **346** | **Regressed.** STATE.md:847 logs it as a known pre-existing violation at 304→301, deliberately left ("noted rather than silently fixed… per report, don't do"). It has since grown **+45 lines** with no new entry. |
| `components/nodes/TrendChart.tsx` | 338 | Not justified in STATE.md |
| `theme/theme.glass-light.css` | 276 | Not justified |
| `theme/theme.ops-dark.css` | 266 | Not justified |
| `theme/theme.glass.css` | 256 | Not justified |
| `components/shell/PageShell.module.css` | 256 | Not justified |
| `theme/theme.safe-one.css` | 237 | Not justified |
| `components/nodes/chartCraft.tsx` | 236 | Not justified. STATE.md:1252 explicitly reasoned it was "still well under budget" when code was moved *into* it — that is no longer true. |
| `contracts/tradableAsset.ts` | 229 | Not justified |
| `components/shell/Frame.module.css` | 219 | Not justified |
| `components/shell/Sidebar.tsx` | 213 | **Regressed.** Last logged at 136 / "233→145". |
| `engine/assetDiscoveryMock.ts` | 207 | **Regressed.** Last logged at 148. |

The five theme files are arguably a category the rule never contemplated (a token map has no meaningful "split") — worth an explicit architect ruling to exempt them, rather than leaving five permanent silent violations. The four *regressions* (`EntitiesPage`, `Sidebar`, `assetDiscoveryMock`, `chartCraft`) are the real signal: each was measured and reported under budget in a prior session and has since drifted past it unlogged.

### C4 — Component purity (rule 6) — **CLEAN**

No `components/nodes/` file touches any store or does any fetching. The one `useEffect` — `Metric.tsx:26` — is local prop-driven animation state, documented in-file (lines 20-23) as explicitly ratified against this rule alongside `EntityLink`'s hover-state precedent. Correctly ruled in, not a violation.

### C5 — Dead code — **CLEAN**

No commented-out JSX or CSS blocks. No `TODO`/`FIXME`/`XXX`/`HACK` anywhere in `components/`, `renderer/`, `engine/`, `contracts/`, `registry/`. The two grep hits (`chartCraft.tsx:86`, `WatchlistPage.tsx:65`) are prose comments that mention `<text>`/`<ul>` as *subjects*, not commented-out code. The "historical: reversed by direct order" law comments were left alone as instructed.

### C6 — Rule 11 (`any` / `ts-ignore`) — **1 violation** *(outside the brief's numbered list; reporting because it is a flat breach of a non-negotiable rule)*

| file:line | Violation |
|---|---|
| `engine/assetDiscoveryMock.ts:164` | `const asset: any = { … }` then conditionally assigned (`asset.yield`, `asset.price`, `asset.volume`, `asset.circulatingSupply` at lines 173-180). This is the standard escape hatch for building an object under `exactOptionalPropertyTypes` — i.e. exactly the "typing is hard, so the design is wrong" signal rule 11 tells you to *report* rather than suppress. It is also the sole `any` in the codebase, so the surrounding discipline is otherwise intact. |

---

## 5. False positives / checked and ruled out

Recorded so these aren't re-walked:

- **`components/shell/*` importing `engine/`** (30+ hits) — the app shell is explicitly exempt under rule 1. Not violations.
- **`PLACEHOLDER_COLORS`** (`StoriesAndAnalysisCard.tsx:6`) — name suggests raw colors; contents are `var(--viz-1..6)`. Clean.
- **`Metric.tsx:26` `useEffect`** — local animation state, ratified in-file against rule 6. Clean.
- **`PageShell.module.css:211` `background-color: transparent`** — a CSS keyword, not a color value. Clean.
- **`PaneControlButton.module.css:24,28,32` `color-mix(...)`** — derives from `var(--accent-signal)`; documented in-file as a derivation, not a raw value. Clean, and correctly not caught by the lint.
- **`chartCraft.tsx:86` / `WatchlistPage.tsx:65`** — prose comments containing `<text>`/`<ul>`, not commented-out code. Clean.
- **`oklch()` in `theme/*.css`** — correct and intended per tokens-spec.md ("Astryx cascade overrides restated in OKLCH"). Only the *lint's blindness to it elsewhere* is flagged, not its use here.
- **`AiRationaleRail.module.css` `.sourceRow`** — has `flex-wrap: wrap`, the correct mitigation. Ruled down to LOW, not omitted.
- **`Panel`, `DataTable`, `Comparison`, `ArtifactStack`, `assembly`, `DashboardLayout`** — the six known min-width sites; all re-verified as genuinely fixed, with the `:global(.astryx-table-scroll-wrapper)` two-part override present where needed.
- **`mcp-server/`, `tests/`, `.stories.tsx`** — outside the `app/src/` brief; not audited.

**Explicit uncertainty.** Section B's Recharts entries (`TrendChart`, `EarningsHistoryChart`) are inference from `ResponsiveContainer`'s known measurement behaviour, not statically confirmed — flagged as needing a live check rather than presented as findings. The theme-file entries in C3 are a literal reading of rule 12; whether a token map should be subject to a line budget at all is an architect's call, not mine.
