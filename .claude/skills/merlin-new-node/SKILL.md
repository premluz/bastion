---
name: merlin-new-node
description: Adding a new registry component/node to Merlin. Trigger on "new node", "new component", "add to registry", "build the X node/panel/widget", or any request to create UI that scenes will render.
---

# New registry node — procedure

Guardrails and CLAUDE.md apply. A node without all four artifacts does not exist.

## 0. Verify need + intent
- Read the node's entry in `node-vocabulary.md` FIRST — it is ratified design law:
  the question the node answers, its register, its constraints. A node with no
  vocabulary entry must pass the node-addition test there before any code.
- Check `registry.ts` — type may already exist.
- Check Astryx (xds MCP / CLI docs) — wrap theirs before building custom. State
  which path you took.
- For layout/container primitives, verify the data-shape assumption its
  internals expect (message arrays, lists, fixed children) — not just the
  prop surface — before wrapping.

## 1. Name
- Type key: kebab-case (`"entity-graph"`). Component: PascalCase, one file, named
  export, in `components/nodes/`.

## 2. Build order (fixed)
1. **Prop schema** → `contracts/props/<type>.ts`. Bind nodes: data props match a
   `DataSet` shape from `contracts/data.ts` so `bind` resolves cleanly.
   Literal-prop nodes (metric, metric-grid, status-tag, confidence-meter,
   filter-summary, recommendation): authored props per the vocabulary's
   cross-cutting rules. No callbacks that reach stores. No children handling
   unless the node is a container.
2. **Component** → pure, props in / UI out. Tokens only — zero raw values; series
   colors from `--viz-1…6`. Honor the vocabulary principles (registers: facts
   permanent, reasoning active, recommendations provisional; emphasis is earned).
   No internal mount animation (fights the renderer's `reveal` stagger).
   Data-dependent geometry (layouts, scales, splits) uses established library
   math where available (d3-*); any hand-rolled heuristic must be tested
   against skewed real-world data, never uniform samples — greedy
   first-crossing heuristics degenerate exactly where real data lives.
   Established library math doesn't waive skewed-data verification either —
   read the library's preconditions (sort order, domains, non-negative
   values); defaults are not semantics.
   SVG text never auto-clips: any text inside a bounded SVG cell gets an
   explicit clipPath at birth, not after the first bleed.
3. **Register** → one lazy entry in `registry.ts`: `{ component, propSchema }`.
   Nothing else in that file.
4. **Story** → three states per the vocabulary: happy, partial data, designed
   empty — realistic fictional data from the universe (specific names, dates,
   quantities). Verified in EVERY registered theme. If a theme legibility issue
   appears → token issue, use merlin-theme-token skill, never patch the component.
   Responsive/measuring components (charts, anything sized via ResizeObserver)
   get a fixed-size story wrapper, not the responsive default — a responsive
   container can mis-measure specifically inside the screenshot pipeline
   (confirmed with recharts' ResponsiveContainer + Playwright, 2026-07-10:
   correct render via plain DOM checks, truncated in the committed baseline).
   The component itself stays responsive; only the story's wrapper is fixed.

## 3. Fixture coverage
- At least one scene in `scenes/` uses the node (via `bind`, or authored props for
  literal-prop nodes). Update contract tests if the type list is asserted.
- A node's first real in-scene render is a fresh visual review at scene scale
  IN ITS REAL VESSEL — the artifact panel at its default width, not an isolated
  story's canvas. Story-width evidence does not transfer to panel-width
  behavior. Confirmed 2026-07-10: geo-panel's Happy story looked correct at its
  fixed story width, but rendered as an 1248×1248px square inside
  asset-discovery-refine's actual full-width scene-grid column — `AspectRatio`
  has no built-in cap and had never been exercised at real container width
  before. Confirmed again 2026-07-11: concentration-map's own Phase 8D
  verification checked only the isolated Fixtures story (~900px) and missed a
  real bug (Nordkap Pension Trust's value/label both failing) that only showed
  at the artifact panel's actual ~353px rendered width.

## 4. Gate
- `vitest run` green · stories render in every registered theme · `test:visual`
  baseline committed (reviewed once at creation, then diff-only) · malformed props
  rejected by the Zod prop schema with a useful error (from Phase 4 onward,
  additionally surfaced as FallbackNode by the renderer).

## Done report
Type key · vocabulary entry honored (one line on how) · Astryx-wrapped or custom
(why) · files touched · gate evidence.
