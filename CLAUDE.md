# MERLIN — Generative Intelligence Interface Prototype
## Master prompt & guardrails. This file is law. Read fully before any session.

---

## 1. Mission

Naming: **Meridian** = the reusable canvas repo (Phase 1, project-agnostic). **Merlin** = this project, duplicated from Meridian at Phase 2.

You are the executor. The architect is Prem: all reports, approvals, and escalations go to him. Conflicts resolve in this order: this file → tokens-spec.md → STATE.md → ask Prem. The architecture below is not open for redesign. You write code inside these constraints. If a constraint blocks a task, stop and report the conflict — do not improvise around it.

The product: a high-fidelity prototype of an AI intelligence platform (Palantir register) in which an agent appears to reason through a query and assemble the answering interface on the fly. Interfaces are not hardcoded pages — they are JSON scenes rendered dynamically through a component registry. Built on Meta's Astryx design system to prove agent-native fluency with their stack.

Three demo beats the code must serve:
1. User types a query → agent thinking trail streams → interface assembles piece by piece.
2. Theme switches live between Astryx stock themes — same components, token cascade only. Custom themes (`ops-dark`, `glass` — specced in tokens-spec.md) are deferred drop-ins; the architecture must make adding one a zero-component-change event.
3. An external agent pushes a new scene over MCP and the interface materializes without a reload.

## 2. Non-negotiable rules

1. **The scene contract is law.** All rendered UI derives from Scene JSON validated by Zod schemas in `src/contracts/`. No component is ever mounted from application code outside the renderer, except the app shell (chat bar, theme switch, frame).
2. **The registry is the only door.** JSON meets React in exactly one place: `src/registry/registry.ts` → `src/renderer/SceneRenderer.tsx`. Never import a scene into a component. Never import a component anywhere except the registry and its own story/test.
3. **Dependency direction is one-way:** `contracts ← registry ← renderer ← engine ← app`. Lower layers never import from higher layers. Components import only contracts (for prop types) and design-system primitives.
4. **Tokens only.** No raw hex, rgb, px shadows, or blur values inside components. Every visual value resolves through the token cascade (`src/theme/`). If a token doesn't exist, propose it in the phase report — don't inline the value. No inline style props/objects even when values are all var() references — positioning/layout is a stylesheet concern; a fully token-sourced inline style still violates this rule.
5. **Astryx first.** Before writing any UI element, check whether Astryx provides it (use the Astryx MCP server / CLI docs). Wrap Astryx components; build custom only for what Astryx lacks (thinking trail, scene canvas, glass surfaces). Never fork Astryx internals.
6. **Components are pure and dumb.** Props in, UI out. No fetching, no store access, no scene awareness inside registry components. Data reaches them through the renderer's binding resolution.
7. **Outbound interaction from registry components: data attributes + shell-level delegated listeners only — never callbacks, never engine/app imports.** `EntityLink` (Phase 8F) is the reference implementation. That's the sanctioned escape hatch for a registry component that needs to trigger something outside itself — written down so the next interactive need doesn't relitigate it.
8. **Unknown never crashes.** Unknown node type → `<FallbackNode/>` error card. Invalid props → Zod error surfaced in the card. The renderer must survive any malformed scene.
9. **One phase at a time.** Complete the current phase, run its gate, write the phase report, stop. Do not begin the next phase in the same session. Do not refactor files outside the current phase's scope.
10. **No new dependencies without approval.** The dependency list in §5 is closed. If you believe a package is needed, stop and state the case in one paragraph.
11. **TypeScript strict. No `any`, no `@ts-ignore`, no `as unknown as`.** If typing is hard, the design is wrong — report it.
12. **File budget:** no file over 200 lines except fixture JSON. If a file grows past that, split it and say so.
13. **Naming:** components `PascalCase`, one component per file, named exports. Scene node types are `kebab-case` strings (`"metric-grid"`, `"entity-graph"`) mapped in the registry.
14. **Every registry component ships with three artifacts in the same PR-equivalent:** the component, its Zod prop schema (registered in contracts), and its Storybook story. A component without all three does not exist.
15. **Motion is data, not decoration.** All animation timing/easing comes from motion tokens. The "interface assembling" effect is driven by node order in the scene tree, not per-component hacks.

## 3. Architecture

```
┌────────────────────────────────────────────────────────┐
│ APP SHELL   chat bar · theme switch · frame · canvas    │
├────────────────────────────────────────────────────────┤
│ ENGINE                                                  │
│  intent resolver (keyword index → scene id)             │
│  trail player (streams ThinkingStep[] on a clock)       │
│  scene store (active scene, assembly sequence)          │
│  live channel (SSE from MCP server → push_scene)        │
├────────────────────────────────────────────────────────┤
│ RENDERER    SceneRenderer: walk tree → registry lookup  │
│             → validate props → resolve data bindings    │
│             → staggered mount (assembly effect)         │
├────────────────────────────────────────────────────────┤
│ REGISTRY    type string → { component, propSchema }     │
├────────────────────────────────────────────────────────┤
│ COMPONENTS  Astryx wrappers + custom intelligence UI    │
├────────────────────────────────────────────────────────┤
│ CONTRACTS   Zod: Scene, Node, ThinkingStep, DataSet     │
├────────────────────────────────────────────────────────┤
│ THEME       token cascade · ops-dark · glass            │
└────────────────────────────────────────────────────────┘
          ▲ runtime MCP server (separate package)
            tools: list_scenes · get_scene · push_scene · query_data
```

The intent resolver is a strategy interface: `resolve(query: string): Promise<Scene>`. Implementation #1 is a keyword index built from scene manifests. Implementation #2 (later, out of scope until Phase 9) calls the Anthropic API to generate a Scene conforming to the same schema. Nothing above the resolver may know which implementation is active.

## 4. Locked file structure

Canvas boundary: everything marked ◇ originates in Meridian (the reusable canvas repo) and stays project-agnostic there; Merlin-specific improvements to ◇ areas are back-ported to Meridian deliberately, never automatically.

```
Merlin/                          ← duplicated from Meridian (the canvas repo)
├── CLAUDE.md                      ← this file
├── tokens-spec.md                 ← Phase 0 color/type/motion values, authoritative
├── STATE.md                       ← session memory: read first, append last
├── app/                           ← Vite + React + TS
│   ├── src/
│   │   ├── contracts/
│   │   │   ├── scene.ts           ← Scene, SceneNode, DataBinding
│   │   │   ├── thinking.ts        ← ThinkingStep, StepKind, Confidence
│   │   │   ├── data.ts            ← DataSet shapes (table, series, graph, geo, entity)
│   │   │   └── props/             ← one Zod prop schema per registry component
│   │   ├── registry/
│   │   │   └── registry.ts        ← THE map. Lazy imports. Nothing else lives here.
│   │   ├── renderer/
│   │   │   ├── SceneRenderer.tsx
│   │   │   ├── FallbackNode.tsx
│   │   │   └── bindings.ts        ← resolve node.bind against scene.data
│   │   ├── engine/
│   │   │   ├── resolver/
│   │   │   │   ├── types.ts       ← IntentResolver interface
│   │   │   │   └── keywordResolver.ts
│   │   │   ├── trailPlayer.ts
│   │   │   ├── stores/            ← Zustand: session, scene, trail
│   │   │   └── liveChannel.ts     ← SSE client for MCP push
│   │   ├── components/
│   │   │   ├── shell/             ← ChatBar, Frame, ThemeSwitch, Canvas
│   │   │   ├── trail/             ← ThinkingTrail, StepRow, ConfidenceBadge, SourceChip
│   │   │   └── nodes/             ← registry components only
│   │   ├── theme/                 ◇ canvas
│   │   │   ├── tokens.base.css    ← primitives: scales, type, motion, z-depth
│   │   │   ├── theme.default.css  ← semantic tokens → active Astryx stock theme
│   │   │   └── astryx-bridge.md   ← semantic token ↔ Astryx variable mapping log
│   │   └── main.tsx
│   ├── scenes/                    ← fixture Scene JSON, one file per scene
│   │   ├── manifest.json          ← id → intents/keywords index
│   │   └── *.scene.json
│   └── universe/                  ← shared world: entities, sources, datasets, globally keyed
│       └── *.json                 ← flat keyed JSON; no query language, no relations engine
├── mcp-server/                    ← Node + @modelcontextprotocol/sdk
│   └── src/
│       ├── server.ts              ← tools: list_scenes, get_scene, push_scene, query_data
│       └── sse.ts                 ← broadcast channel to the app
└── .storybook/                    ← theme-switch toolbar, scene playground story
```

Do not add top-level directories. Do not relocate files between layers.

## 5. Stack (closed list)

- React 19, Vite, TypeScript strict
- `@astryxdesign/core`, `@astryxdesign/theme-neutral` (base to override), `@astryxdesign/cli` (dev)
- zod, zustand
- recharts (charts wrapped as registry nodes — Astryx's vega package is not on npm yet)
- `d3-scale`, `d3-shape`, `d3-hierarchy`, `d3-array` (+ their `@types/d3-*`) — math only, for custom-SVG registry nodes (`concentration-map`'s treemap layout, `bar-series`/`sparkline`'s scales); never canvas, never a rendering library — approved 2026-07-11, see STATE.md, Phase 8E
- `@heroicons/react` (2.2.0, exact pin) — extends Astryx's closed `IconName` set: import individual outline glyphs from `@heroicons/react/24/outline` as real `IconType` components, matching Astryx's own `defaultIcons.tsx` convention (24x24, currentColor, 1.5 stroke), same role the hand-copied `DocumentIcon.tsx`/`ChatIcon.tsx`/`BellIcon.tsx` precedent filled — approved 2026-08-05, see STATE.md
- storybook (react-vite)
- `@modelcontextprotocol/sdk` (mcp-server package only)
- `@types/node` (mcp-server package only, types-only, zero runtime — required to type `node:*` builtins in a plain Node process; approved 2026-07-11, see STATE.md)
- vitest (contracts + bindings + resolver tests)
- @playwright/test + @storybook/test-runner (visual regression only — baselines on disk, diff results as text; Playwright MCP usage governed by the visual-verification guardrails)

Nothing else. No animation library — motion via CSS transitions/keyframes driven by motion tokens and mount order. No CSS framework — Astryx cascade + theme files.

## 6. Contracts (authoritative sketch — refine in Phase 1, don't reinvent)

```ts
// scene.ts
Scene = {
  id: string
  title: string
  intents: string[]                 // keyword/alias index entries
  thinking: ThinkingStep[]
  data: Record<string, DataSet | UniverseRef>   // inline payload OR { "$ref": "universe key" }
  layout: SceneNode                 // root, usually type "scene-grid"
}

SceneNode = {
  id: string
  type: string                      // registry key, kebab-case
  props?: Record<string, unknown>   // validated against registry propSchema
  bind?: Record<string, string>     // propName → data key, resolved by renderer
  children?: SceneNode[]
  reveal?: number                   // assembly order index; renderer staggers by this
}

// thinking.ts
ThinkingStep = {
  id: string
  kind: "plan" | "search" | "retrieve" | "correlate" | "synthesize" | "verify"
  label: string                     // "Querying signals intelligence index…"
  detail?: string
  durationMs: number                // playback pacing
  sources?: { name: string; ref: string }[]
  confidence?: number               // 0–1, rendered as ConfidenceBadge
}
```

Data binding rule: nodes carry `bind`, never inline datasets. Renderer resolves `bind` against `scene.data` before validating props. A dangling bind is a FallbackNode, not a crash.

Universe layer: `universe/*.json` is the shared world — entities, sources, datasets under global keys. Scene `data` entries may be `{ "$ref": "<universe key>" }`; the RESOLVER hydrates refs at resolve-time, so renderer and registry never see refs — only hydrated scenes. A dangling $ref hydrates to a marked-missing DataSet → FallbackNode. Universe stays flat keyed JSON: no query language, no relations engine, no cross-file refs.

## 7. Token & theme rules

Three tiers, strictly cascading:
1. **Primitives** (`tokens.base.css`): raw scales — spacing, radii, type ramp, durations, easings, z-depth levels 0–4, blur scale, opacity scale. Theme-agnostic. Never referenced by components directly.
2. **Semantic** (per theme file): `--surface-0..3`, `--ink-primary/-secondary/-muted`, `--accent-signal`, `--accent-alert`, `--edge`, `--edge-highlight`, `--surface-blur`, `--surface-opacity`, `--glow`, `--scrim`, plus overrides of Astryx's cascade variables (document each in `astryx-bridge.md`).
3. **Component tokens** only when a component needs a themed value no semantic token expresses — added to both theme files in the same change.

Theme switching: `data-theme` attribute on the root, live, no remount.

**Launch model:** ship on Astryx stock themes. `theme.default.css` maps every semantic token to the active Astryx cascade variable — components consume semantic tokens ONLY, never Astryx variables directly. This indirection is the customization-ready guarantee: a future custom theme (`ops-dark`, `glass` — full value specs in tokens-spec.md) is a new mapping file registered next to `theme.default.css`, nothing else. If any component would need to change to support a new theme, that is an architecture defect — report it.

## 8. Phase plan — each phase ends at its gate, then STOP

**Phases S–1 — complete in Meridian.** Environment setup and the canvas foundation live in the Meridian repo under its own CLAUDE.md. Merlin exists only as a duplicate of a gate-passed Meridian. Never modify the Meridian repo from a Merlin session; canvas improvements are proposed as back-ports in the phase report.

**Phase 2 — Merlin instantiation + contracts.** Duplicate Meridian → Merlin repo; add the `mcp-server/` workspace stub. Then: all Zod schemas in `contracts/` (including UniverseRef + hydration), the shared `universe/` files (one connected fictional world: common source systems, entities recurring across scenes), three fixture scenes in `scenes/` (suggested: `network-anomaly`, `entity-dossier`, `regional-signals`) with realistic fictional intelligence data, `manifest.json`, contract tests: fixtures parse, every $ref resolves against the universe, hydrated scenes validate standalone, a corpus of malformed scenes (including dangling $refs) fails with useful errors.
*Checkpoint:* after drafting `contracts/data.ts`, STOP and present the DataSet shapes for approval before writing any fixture.
*Gate:* `vitest run` green; fixtures cover every planned node type at least once; Meridian repo untouched.

**Phase 3 — Registry + core nodes.** `registry.ts`; nodes: `scene-grid`, `panel`, `metric`, `metric-grid`, `data-table`, `time-series`, `text-block`, `status-tag`, `recommendation`, `entity-header`, `filter-summary` (eleven — vocabulary is authoritative on each node's intent). At this phase's gate, fixture scenes swap their terminal text-blocks to `recommendation`, the dossier gains its `entity-header`, and the refine scene gains its `filter-summary` (small authored-prop additions, no data changes). Astryx-wrapped where possible. Prop schema + story per node, stories verified in every registered theme.
*Gate:* Storybook renders all eleven in every registered theme; every node registered with a schema; `test:visual` baselines committed.

**Phase 4 — Renderer.** `SceneRenderer` (recursive, registry lookup, prop validation, bind resolution), `FallbackNode`, staggered assembly mount using `reveal` order and motion tokens. Playground story: paste arbitrary Scene JSON → render.
*Gate:* all three fixtures render from raw JSON; a deliberately broken scene shows FallbackNodes and never white-screens.

**Phase 5 — Intent engine + shell.** `IntentResolver` interface + `keywordResolver` (manifest index, alias matching, fuzzy-lite: lowercase, trim, token overlap), Zustand stores, ChatBar + Frame + Canvas. Query → resolve → scene swap with exit/enter assembly.
*Gate:* typing "show me the network anomaly" (and reasonable variants) loads the right scene; unresolved input returns an honest "no scene matched" state in the chat log.

**Phase 6 — Thinking trail.** `trailPlayer` streams steps on `durationMs` pacing into the trail store; `ThinkingTrail` UI (kind icon, label, animated active state, SourceChips, ConfidenceBadge). Sequence: trail plays → scene assembles as the final synthesize step completes. Skippable (click to fast-forward).
*Gate:* full loop — query → trail streams → interface assembles — feels like an agent working. Timing readable, not sluggish.

**Phase 7 — Extended nodes.** `entity-graph` (positions precomputed and authored in the scene data payload — no force simulation, no new deps), `geo-panel` (stylized abstract map, no tile service), `signal-feed`, `comparison`, `confidence-meter`. Same three-artifact rule.
*Gate:* fixture scenes updated to use them; Storybook and `test:visual` complete in every registered theme.

**Phase 8 — Visual polish.** Density, hierarchy, and motion pass across every node and fixture scene in the stock themes; contrast audit; empty/partial-data states reviewed. Custom themes (`ops-dark`, `glass` — tokens-spec.md) remain deferred drop-ins; if one is attempted, it is a new mapping file only.
*Gate:* theme flip on every fixture scene holds at demo fidelity; no component file was edited to achieve any visual fix (tokens/theme files only — a required component edit is a token-architecture bug to report).

**Phase 8B — Shell v2.** Architect-ordered revision, inserted after Phase 8's tokens-only pass opened. Engine invariant: contracts, resolver, renderer, registry, nodes — zero changes. Any work-order step requiring an engine change stops and reports. Three work orders, each gated, STOP between — do not begin the next in the same session.

*WO-1 — Turn & artifact architecture (no new visuals).* `sessionStore` reworked to a turn model: `{id, utterance, status, settled trail, artifactRef?}`. Every completed investigation registers an artifact (scene instance bound to its turn). `artifactStore`: which artifact is open. Canvas temporarily renders the open artifact unchanged. The bug — a second-query failure — is this WO's acceptance test: base query → trail → artifact, then refine query → new trail → new artifact, then a third repeat — three turns alive in the log, generation counter honored, no stale state. Diagnose the current failure and record root cause in STATE.md (confirm, don't assume).
*Gate:* multi-turn sequence verified live + all existing tests green.

*WO-2 — Template adoption, verbatim.* Scaffold `ai-chat-landing` + `ai-chat` to scratch; read fully; every adoption cites file+lines. (a) Landing state: centered greeting + composer + suggestion chips wired to real fixture intents — appears only before the first turn. (b) Conversation layout: user turns right, agent activity left, per template. (c) `ArtifactCard`: the template's document-card primitive exactly, filled with scene title + module + status — appears in the transcript when a trail completes. (d) `ArtifactPanel`: right-side panel per the template's artifact preview; opens on card click; scene renders inside it with the existing assembly stagger. Trail law holds: no agent bubbles. Composer affordances: adopt the template's attach/@ controls only if wired to something real (suggestion insertion); dead controls stay out, as ruled in the last work order.
*Gate:* full loop on all four fixtures in all three themes; `test:visual` regenerated once; before/after screenshots.

*WO-3 — Config + polish.* `app/src/config.ts` — typed module, the pattern for all future switches: `export const config = { artifacts: { autoOpen: true } } as const`. Panel auto-opens on trail completion when true; card-click always works. Amend node-vocabulary.md's Shell section to the v2 model (transcript + artifact panel, session-scoped, law lines preserved) — architect-ratified via a STATE.md entry citing this order. Baselines final, learnings delta in report.
*Gate:* flip `autoOpen` once each way, verified live. STOP — Phase 8's tokens-only punch-list pass remains open and follows.

**Phase 8C — Shell side-nav.** Single work order, architect-ordered, inserted after Phase 8B — log in STATE.md whether it ran before or after Phase 9 (both orderings are valid; only the log entry is required). Engine invariant unchanged: stores are READ by the sidebar, never restructured; one new action only (session reset).

Scaffold `shell-side-nav` to scratch, read fully, cite every adoption by file+lines. Adopt the sidebar primitive exactly; REJECT the template's grouping semantics — groups are Merlin's modules (Discover, Research, Investigate, Monitor, Portfolio — render only groups with turns, except Monitor which renders once any alert exists), never projects/workspaces. Rows: turn question (truncated), status dot via tokens (answered / no match / alert). Row click = open that turn's artifact (existing action). "New investigation" = store reset to landing state, confirmed-safe (no persistence to lose by design — say so in the empty state, not a modal). Search: client-side filter over current-session turns, or omitted — no dead controls. Library: out. Sidebar default state in `config.ts` (`expanded: true`). Amend node-vocabulary.md's Shell section: sidebar = investigation navigation, module-grouped, law line preserved verbatim.
*Gate:* full loop with sidebar in all three themes; if Phase 9 has landed, the pushed alert appearing under Monitor with its dot is part of the gate; `test:visual` regenerated once; report, stop.

**Phase 8D — Concentration map.** Single work order, `merlin-new-node` skill governs. Node-addition test satisfied by architect ruling (logged in STATE.md citing this order): question = "what dominates this whole?"; no existing node encodes proportion perceptually; dominance is spatial, not prose.

1. New registry node `concentration-map` — weighted treemap (squarified or slice-and-dice, authored data order preserved), binding the EXISTING table DataSet: rows = holder/share, one designated numeric column drives area. Labels + values inside cells where they fit, legibility floor respected. Muted single-hue scale; `--accent-signal` only for a cell the scene explicitly flags via props — NO red/green market coloring: this node encodes SHARE, not performance (principle 8). Facts register, permanent. Custom SVG expected (verify via `astryx search` first per skill §0; no treemap primitive is anticipated — if found, wrap it). Add the vocabulary entry to node-vocabulary.md verbatim from this order's description.
2. `entity-graph`: optional per-node `weight` prop → radius scaling, decorative-only (same status as edge weight — renderer logic never reads it).
3. Fixtures: issuer-dossier's relationship map is REMOVED — its holders payload rebinds to `concentration-map`; residual auditor/custodian relationships live as entity-header facts. `entity-graph` remains Scene 3's signature only. settlement-anomaly's wallet cluster gains authored weights reflecting accumulation size (values extrapolated consistently with the 11%/14-wallet narrative; log extrapolations).

*Gate:* three-state stories all themes · both fixtures verified live · vitest/tsc/lint:tokens clean · `test:visual` regenerated once · report with learnings delta · STOP.

**Phase 8E — Chart craft & data density.** One work order.

1. Deps (closed-list additions, architect-approved, pin exact): `d3-scale`, `d3-shape`, `d3-hierarchy`, `d3-array` — MATH ONLY, all rendering stays our SVG + tokens; no canvas anywhere.
2. `concentration-map` re-laid on `d3-hierarchy` squarify; label fit rules (hide value before name, ellipsize with title attr); all-rows invariant asserted in its test.
3. Recharts craft pass on `time-series`: token-gradient area fill, reference lines, event annotations, tabular tick formatting, tooltip restyled through tokens; combo variant (volume bars under line).
4. New nodes per `merlin-new-node` + vocabulary entries to add (architect-ratified, cite this order): `bar-series` ("how is it distributed over categories/periods?"), `sparkline` ("what's the trend, in passing?" — inline in metric and data-table cells, no axes, one hue).
5. Fixture density: deterministic seeded generator script (committed, not ad-hoc) regenerates all series at daily resolution, endpoints and named narrative values pinned; Scene 2 distributions → `bar-series` + sparklines; Scene 3 → combo chart with spike annotations at the two failure dates. Log every generated range as extrapolation.

*Gate:* all-rows treemap test · stories 3-state all themes · fixtures live · `test:visual` regenerated once · report, STOP.

**Phase 8F — Entity linking.** One small work order, after 8E. Universe entities carry an investigation intent; scenes render known entity names as links (facts register, underline on hover only — emphasis is earned); click submits that investigation via existing `submitQuery`.
*Gate:* both journeys (Screen→Diligence→Decide, Alert→Investigate→Act) walked live end-to-end.

**Phase 8G — Workbench (VS Code-model shell).** Runs after 8F (depends on entity→intent). Engine invariant absolute: stores read, one `watchlistStore` added, one `workbenchStore` added; Canvas, renderer, registry untouched. Two work orders.

*WO-1 — Layout architecture (no new content).* `workbenchStore`: ordered panes `[{kind, open, width}]`, actions `togglePane(kind)`/`setWidth(kind)`. Regions: icon rail (fixed) · transcript (always open, protected min-width) · panes (each resizable via the generalized handle extracted from today's `ArtifactPanel` — one component, reused). `ArtifactPanel` migrates INTO the workbench as pane kind `'artifact'`; behavior byte-identical (`autoOpen` config honored, card-click opens). Rail toggle semantics exactly: open↔collapse per kind, others unaffected. Default layout in `config.ts`. Check Astryx for a rail/workbench primitive first (`astryx search`), cite or justify custom.
*Gate:* full existing loop (query→trail→artifact, push→Monitor) runs byte-identical inside the workbench; panes resize and toggle independently; `test:visual` regenerated once.

*WO-2 — Section content + routing.* Entities / Sources / Watchlist / History panes per the section specs above (universe-driven; fictional statuses authored in universe, logged as extrapolation; Sources' citation counter computed live from turns). ROUTING LAW (add to node-vocabulary.md Shell section verbatim): "Content homes by kind: investigations always land in the artifact pane, replacing in place; index panes are stable and never replaced by clicks within them; the transcript never closes." Watch actions on entity-header and index rows → `watchlistStore`. Empty states designed, session-scoped stated in-line (principle 6).
*Gate:* entity clicked in a chart → investigation lands in artifact pane while the originating pane stays open · rail toggles verified all panes · three themes · report, STOP.

**Phase 8H — Pages architecture (Shell v3).** Supersedes Phase 8G WO-2's pane-based nav — the pane CONTENT built there (Entities, Sources, Watchlist, History) is reused as page content, nothing thrown away, everything rehomed. Two work orders.

*WO-1 — Nav, pages, artifact stack.*
1. `pageStore` (no router dependency — a page enum in the store, optional `location.hash` sync). Left sidebar becomes main nav per mockup: New investigation · Investigations · Entities · Watchlist · Data Sources; Recent list below (last N turns, view-all → Investigations page, filter control); bottom: identity chip (static) + notifications bell (badge = unseen alert turns, click focuses Monitor; hidden at zero).
2. Pages reuse 8G pane content 1:1: Investigations (module-grouped + flat toggle, absorbing History), Entities, Watchlist. Data Sources page ships as the current Sources content (WO-2 upgrades it). Workflows nav entry does NOT ship until Phase 11 does — no dead nav.
3. Home = the investigation surface (transcript + composer). Top bar: current investigation name, left; artifact control, right.
4. Right side: Artifacts is the ONLY pane. Control = icon + count, hidden until the first artifact. Stack: list (title · one-line description · version chip · status; current marked active) → select → artifact detail with Back-to-list → resizable as today. Versions: session lineage — refine turns version their parent (lineage key = scene family; display grouping only, no persistence). All opens still flow through the artifactStore→openPane subscription.
5. Routing law amended in node-vocabulary.md: "Left nav = places; the artifact pane = the one overlay; investigations always land there; pages never host scene renders."
*Gate:* every nav destination live in 3 themes · multi-turn run shows correct lineage grouping · alert flow end-to-end (push → bell badge → Monitor focus → artifact) · `test:visual` once · report, STOP.

*WO-2 — Data Sources page.* Runs after WO-1's gate. Connected sources (the seven, status/last-sync/cited-in-N) + a public catalog section (5–6 plausible fictional public feeds, authored in universe, logged) + a mock connect flow (select → permissions summary → confirm → appears as connected, session-scoped) — enterprise-integration design surface, UI-complete, wired to nothing real, stated honestly in its empty state.
*Gate:* connect flow walked live, three themes, report, STOP.

**Phase 8I — Market Pulse (surfaced vs investigated split).** Single work order, architect-ordered, small and self-contained.
1. New nav page, Market Pulse, positioned after Data Sources, before Investigations — a persistent, browsable section, not the landing state. LandingState's suggestion chips become a 2-3 card echo of Market Pulse's same data source (single JSON, two renderings) rather than separately authored content.
   Consider-not-build note for a later phase: an alert not yet opened is also "surfaced, not investigated" — Market Pulse could unify with the Monitor push (alert appears here first, badge/Investigation only on open). Flagged in STATE.md as a Phase 9-adjacent architecture note; the alert path itself is hardened and out of scope for this WO.
2. Content: authored per-session (`universe/marketPulse.json`, 4-6 cards spanning modules — the existing 3 landing suggestions promote here plus 1-2 new ones), NOT live-generated. Landing state's suggestion chips are a slice of this same data, not separately authored content.
3. Click → existing `submitQuery` path, unchanged. Once acted on, the card gets a subtle "Investigated" mark and links to its artifact — still lives in Market Pulse (it's a record of what was surfaced), the resulting turn also appears in Investigations as normal.
4. node-vocabulary.md Shell section gains the register law verbatim: "Surfaced (Market Pulse: agent-authored, no evidence, no trail) vs Investigated (has run the reasoning loop, has confidence) are different registers and never share a row style."
*Gate:* card click → full loop → card marks itself investigated → turn appears correctly in both Market Pulse and Investigations · empty state designed · three themes · `test:visual` once · report, STOP.

**Phase 9 — MCP server.** `mcp-server` package: `list_scenes`, `get_scene(id)`, `query_data(sceneId, key)`, `push_scene(scene)` (Zod-validated, broadcast over SSE); app `liveChannel` subscribes, pushed scene triggers trail + assembly as if typed.
*Gate:* Claude connected to the MCP server pushes a novel valid scene and it materializes in the running app; invalid push returns a structured error and the app is untouched.

**Phase 10 — Demo hardening.** Demo script scene sequence, keyboard shortcuts for the presenter, empty/error states, README with run instructions, optional: `llmResolver` stub implementing `IntentResolver` against the Anthropic API (flag-gated, off by default).
*Gate:* cold clone → `pnpm i && pnpm dev` → full demo in under 2 minutes of setup.

**Phase 11 — Workflow composer.** Block added now, executed after Phase 10. Workflows as data (`{steps: intents/scene refs}`), runner = sequential `presentScene` with pacing, builder surface = block palette + ordered lane, run lands as consecutive turns. No branching, no persistence beyond session. Detailed work order issued when reached.

**Phase 12 — Risk & Derivatives Module.** CLOSED as of 2026-07-18 (see STATE.md) — gate condition lifted mid-phase by legislation update, both work orders complete and ratified. Originally gated: fires only after Phase 10's freeze/recording is complete AND Prem's Phase 8 sitting has closed — superseded, see STATE.md's legislation-update entry. Backlog trigger, for the record: a Bank of America/trading contract lead (2026-07-17) plus the long-standing unbuilt Portfolio module. New persona: FX/derivatives risk officer. Journey: Monitor portfolio → drill into a flagged position → escalate/hedge recommendation. Two work orders.

*WO-1 — Portfolio dashboard scene.*
1. Universe: 3-4 derivative positions (FX options/rate swaps) as new entities, notional/counterparty/exposure facts, at least one linked to Kestrel (reuse, don't invent a new villain). New source system only if `RiskLens` genuinely can't extend to cover it — extend before duplicating.
2. New `ring-gauge` node — reuses confidence-meter's arc math, new registry entry, full vocabulary node-addition test citation (merlin-new-node skill §0) before any code.
3. One dashboard-grid fixture: exposure metric-grid, ring-gauge row, top-contributors bar-series, flagged-positions signal-feed. Leads with scene-summary per existing law (aggregate risk verdict, not a single-scene recommendation).
*Gate:* renders in 3 themes, all data traces to universe, no new architecture beyond ring-gauge, report, stop.

*WO-2 — Entity view + chart craft.*
1. Entity DataSet gains an optional derivative-shaped attribute set (documented, not a new DataSet kind — extend, per the reuse precedent). entity-header renders it same as any other entity.
2. time-series: multi-series overlay (2-3 lines, distinct dash/color via `--viz` tokens) + optional stat-strip metric-grid header. Existing node, additive props only — no new node type.
3. One entity + one investigation fixture using both.
*Gate:* entity view + enhanced chart live, 3 themes, existing time-series usages unaffected (regression-checked), report, stop.

Explicit non-goals, restated in the vocabulary entry when built: no order-book node, no buy/sell ticket, ever. Portfolio view recommends; it never executes.

**Phase 13 — Static dashboard pages.** New page type, `DashboardPage`, distinct from investigation pages: renders `dashboard-layout` + registry nodes directly from an authored data object — no `SceneRenderer`, no trail, no `submitQuery` involvement. Reuses the SAME nodes (`metric-grid`, `ring-gauge`, `status-grid`, `ring-chart`, `bar-series`, `signal-feed`) and the same header pattern as `scene-summary` (recommendation + confidence + sources) for trust-architecture consistency — but as a static header component, not the `scene-summary` registry node (it's not in a scene). Two work orders.

*WO-1 — Portfolio dashboard page.* New nav entry "Portfolio," pinned, always available (no artifact-stack lifecycle). Content = the existing `risk-desk-dashboard` fixture's data, re-rendered through `DashboardPage` instead of via investigation. Confirms the reuse works before building the second page.

*WO-2 — Risk dashboard page.* Second nav entry "Risk," similarly static, distinct content focus (if book-level exposure lives in Portfolio, Risk can focus on limit/breach/escalation posture specifically — Prem to confirm the split makes sense once WO-1 is visible, don't over-design the distinction blind).

*Gate:* both pages open instantly (no trail delay) from nav, render identically to their scene equivalents minus the assembly/trail animation, 3 themes, no `SceneRenderer`/`artifactStore`/`submitQuery` touched, report, stop.

**Phase 14 — Asset discovery view (Entities page upgrade).** Not gated behind the sitting — small, additive, same reuse posture as Phase 12. One work order.

1. Entities page gains three top strips (reusing `signal-feed`'s row craft): "Notable movers," "Recently cited" (real — count from turns/citations, like Sources' honest counter), "Newly added to universe" (session-fixed, not really "new" but styled the same).
2. Grid view: `sparkline` (existing node, already built) + price/yield + 24h delta per entity card — a genuine multi-column card grid using Phase 12's `dashboard-layout` primitive, filterable by module/type (reuse Market Pulse's persona-tag pattern).
3. Card click → EXISTING entity-link → `submitQuery` path. No new interaction pattern.
4. EXPLICITLY EXCLUDED, restated in the vocabulary entry: no Buy/Sell/Trade CTA, no wallet connect, no price-action framing as an invitation to transact. Deltas are informational (principle 2: facts register), never a call to action — that's what distinguishes this from every screenshot in this genre.
5. Nav: add "Discover" entry.

*Gate:* grid renders from real universe data, filters work, card click resolves correctly, 3 themes, report, stop.

**Phase 16 — Entity Detail page.** SUPERSEDED 2026-07-23 by the revised-scope order immediately below — same page, denser content. Original scope, for the record: chart/About/Statistics/scoped-Investigations, click-through from Asset Discovery's grid, no trade/buy-sell surface. Closed under the revision, not separately.

**Phase 16 (REVISED SCOPE, 2026-07-23) — Entity Detail page, denser.** Supersedes the Phase 16 order above — same page, denser content.

1. EntityDetailPage gains: Trend/Stats metric-grid (denser — 5-6 metrics not 2), price+yield dual-axis time-series (per last order), About block (existing attributes, fuller display, page has room, no cap).
2. NEW: news-feed node/section — headline, one-line dek, source attribution (SourceChip), timestamp. Content: 4-5 authored fictional headlines per entity with real narrative texture (not filler — tie to existing facts: Aldergate's audit lapse, Kestrel's accumulation, etc. become "headlines" for entities that have them; new entities get headlines that establish their character, SeekingAlpha-style).
3. NEW: related/compare entity strip — small card row, reuses entity-header-lite treatment, links to other entities (venue peers or sector peers).
4. Investigations panel scoped to entity (as previously ordered).
5. NEW UNIVERSE CONTENT: one equity entity (e.g. "South Bow Corp" or similar, pipeline/infra sector — real texture, not generic), tagged to the Phase 15-style second venue, with its own price series, News content, and ONE investigation scene reusing existing nodes (no new node types required to prove the concept). This is the single test case for asset-class generality — build ONE well before deciding whether to build more.

Explicitly still no trade/buy-sell — News/Stats/Compare is the SeekingAlpha register, not the Kraken register, and that distinction is the whole point.

*Gate:* entity page dense and complete for both a Solent bond AND the new equity entity, news feed populated with real texture (not lorem-ipsum), investigation panel scoped correctly, 3 themes, report, stop.

**Phase 17 — Responsive tiers.** SUPERSEDED 2026-07-25 by Phase 18 immediately below — same responsive-tiers work, now detailed and fired as a real phase order. Original backlog block, for the record: three tiers, tier 3 a standing decision not to build rather than a future phase. Closed under Phase 18, not separately.

1. **≥1024px** — current multi-pane behavior, unchanged. No work.
2. **768–1024px** — panes shrink proportionally to fit; genuinely new architecture, not a tweak, confirmed against the current codebase before scoping: the transcript pane is hard-fixed at 480px today (`flex: 0 0 480px`, not proportional), the content column has no protected minimum (`min-width: 0`), and per-node-type min-width is a new registry-level concept (`registry.ts` today only carries `{component, propSchema}`). Reuses the `comparison`-at-480px finding (Phase 8B WO-2, parked) as the first real breakpoint-driven minimum. If shrinking still isn't enough for a new pane to open, the least-recently-active existing pane collapses (label + one-click restore) — never a 4th forced column. This reintroduces "which pane is least active" tracking that Phase 8H's workbenchStore→artifactStore fold deliberately removed (only one pane existed then); bringing it back must cite this history explicitly in the work order, not silently re-add a mechanism that was removed on purpose. Detailed work order issued when reached.
3. **<768px** — CONFIRMED PERMANENTLY OUT OF SCOPE, not a future phase. Desktop-first is a legitimate, honestly-declared design decision for this category of tool (enterprise risk-desk tooling, per the Trading Advantage brief's own developer-handoff/design-systems register — no mobile signal), not an omission to eventually fix. The product's own demo thesis (assembling a sophisticated interface live) depends on multi-pane richness that a phone-width layout can't showcase, only undersell. Consistent with this project's own repeated pattern of stating a limitation honestly rather than building a fuller version nobody asked for (session-scoped storage, Watchlist, Data Sources' mock catalog). Substitute, approved, ships alongside tier 2's own phase (not a separate order): a minimal "designed for larger screens" notice below 768px — near-zero cost, converts a silently-cramped layout into an honestly-stated fence, same register as every other session-scoped/desktop-only disclosure already in this app.

*Gate (tier 2 + notice, when this phase is reached):* proportional shrink verified at 768/1024px boundaries, least-recently-active collapse verified with 3+ panes contending, the <768px notice verified as the only thing rendered below that width, 3 themes, report, stop.

**Phase 18 — Responsive tier 2 + desktop-only notice.** Supersedes Phase 17's backlog block — same work, fired for real. Scoped as a real phase, not a small order, per the sizing correction Sonnet gave when this was still draft law.

1. **Desktop-only notice, ships first, own gate, closes independently.** One width-based conditional (<768px) replaces app content with a plain, honest "Merlin is designed for larger screens" message — no multi-pane machinery mounts underneath it.
2. **Tier 2 mechanics.** Transcript pane: hard-fixed 480px → proportional/shrinkable with a real floor. Content column: `min-width: 0` → an actual protected minimum. Per-node-type min-width: a new, additive registry-level concept (`{component, propSchema}` extended, existing registrations unaffected). Least-recently-active pane tracking: reintroduced deliberately — state in the report why it's coming back after Phase 8H's workbenchStore→artifactStore fold removed it (only one pane existed then, now there are three), and confirm the new tracking does not re-fragment pane state the way that consolidation was fixing (i.e., "is this pane open" stays exactly where it already lives — pageStore/sessionStore/artifactStore — this only adds "when was it last active," a genuinely new concept, not a duplicate one).
3. **Collapse trigger.** When a new pane can't fit even at every pane's floor width, the least-recently-active existing pane collapses — via the existing collapse mechanism if one already fits, or a minimal new one scoped here. Labeled return point, one-click restore.

*Gate:* notice fires correctly at <768px (own checkpoint, can close independently of the rest); at 768–1024px, panes shrink to floor before anything collapses, verified with a real 3-pane-open scenario forcing a 4th; `comparison`/`concentration-map` render legibly at their floor widths; 3 themes; report, stop.

**Phase 19 — Entity Detail tabs + Analyst Consensus.** Depends on Phase 15 (My Portfolio, multi-wallet mock-connect) landing first for full credibility — Entity Detail's third-party-opinion surface reads strongest once the portfolio/holdings context it sits alongside is real, not still queued. Phase 15 remains queued/unfired as of this writing; this phase may be scoped/built in parallel if Phase 15 is still pending when reached, per the order's own escape hatch — not a hard block.

1. Entity Detail gains tab navigation (Overview / Financials / Coverage / Historical Data — names adapted to Merlin's actual data, not a literal copy of any reference UI's labels, since Merlin's entities aren't all equities). Overview = today's default view; other tabs house content that currently over-crowds the single scroll (news-feed moves to Coverage, deeper historical series to Historical Data).
2. New node: `analyst-consensus` (or similar name — cite the node-addition test per `merlin-new-node`) — buy/hold/sell distribution bar + low/average/high/current price positions. FACTS register (permanent, per principle 2) — this displays third-party opinion, not Merlin's own recommendation, so it is explicitly NOT provisional. Bind to a new consensus data field on relevant entities (crypto/stocks only — bonds don't have analyst consensus in the same sense; commodities likely N/A too — scope to where it's genuinely applicable, don't force it everywhere).
3. Data: author or extrapolate 1–2 real-feeling analyst-consensus datasets for South Bow Corp and one crypto/equity entity, consistent with whatever real/authored price data already exists there.

*Gate:* tabs work on Entity Detail without breaking existing content; `analyst-consensus` renders correctly where scoped; register-correct (facts, not reasoning); 3 themes; report, stop.

**Phase 15 — My Portfolio, multi-wallet mock-connect.** New nav page "Holdings" (name distinct from the existing "Portfolio" nav entry, which stays Phase 12/13's derivatives/risk-desk dashboard unchanged — no collision, two different registers: risk-desk exposure vs. personal multi-wallet holdings). Two work orders.

*WO-1 — Wallet connect flow + holdings data.*
1. New universe file `universe/wallets.json`: two mock wallets, matching the two asset classes already given full entity-detail treatment (Phase 16/19) — a crypto wallet holding Zenith Protocol/Solent Stablecoin-style positions, and a brokerage-style account holding South Bow Corp/Halberg Materials-style equity positions. Each with holdings rows (entity id, quantity, cost basis, current value — value computed from each entity's own already-authored current price, per the internal-consistency rule). No new entities invented; holdings reference existing `entities.json` ids only.
2. New `walletConnectionStore` (Zustand), same keyed-Record idempotency shape as `dataSourceConnectionStore.ts` (`connectedWalletIds: Record<string, true>`, one `connect(id)` action, in-memory only, session-scoped, never persisted — identical precedent, not a new pattern).
3. New `ConnectWalletDialog`, built the same way `ConnectSourceDialog.tsx` was: Astryx `Dialog` (`purpose="form"`), permissions/scope summary specific to a wallet ("read balances and transaction history," fictional), confirm/cancel footer, same explicit session-scoped honesty copy in both the page body and the dialog itself ("wired to nothing real... nothing persists after a session reset") — the exact disclosure pattern already ratified for Data Sources, reused verbatim in register, not reinvented.
4. Holdings page (WO-2) is empty/EmptyState until at least one wallet is connected — connecting is the only way holdings appear, same "session state gates content" discipline as Watchlist's own empty state.

*WO-2 — Holdings page content.*
1. New nav entry "Holdings," positioned immediately after "Watchlist" — groups the two personal/session-tracked pages together, ahead of the market-wide pages (Market Pulse, Portfolio, Risk, Data Sources).
2. Static page (Phase 13's `DashboardPage` pattern — no `SceneRenderer`, no trail, no `submitQuery` involvement; same reuse posture as the existing Portfolio dashboard and Phase 14's Discover grid).
3. Content per connected wallet: a card/section per wallet (name, type, connected-this-session marker) listing its holdings via existing nodes only — `data-table` or a card-grid reusing `dashboard-layout` (per Phase 14's precedent), `sparkline` per holding (existing node, already built), aggregate `metric-grid` header (total value across connected wallets, computed live, not authored). No new registry node required to prove this — if real gaps appear only at build time (e.g. a genuine "allocation by asset class" visual need), report and cite the node-addition test before adding one; don't pre-authorize a node in this order.
4. Entity click-through uses the existing entity-link → `submitQuery`/`openEntityDetail` path (Phase 8F/14 precedent), no new interaction pattern.
5. EXPLICITLY EXCLUDED, restated in the vocabulary entry: no Buy/Sell/Trade/Send/Receive CTA anywhere — this is a holdings *view*, not a wallet *app*. Same "informational, never a call to action" line already drawn for Phase 14's Discover grid and Phase 12's Portfolio dashboard.
6. node-vocabulary.md gains a Holdings section (register: facts, permanent, per principle 2 — a holding's quantity/value is a fact, not reasoning) and the mock-connect disclosure pattern is cited as reused from Data Sources, not re-authored.

*Gate:* connect flow walked live end-to-end (empty state → connect wallet → holdings appear) for at least 2 wallets across different asset classes; disconnected wallets' catalog stays separate from connected ones (mirroring Data Sources' "public catalog vs. connected this session" split); aggregate metric-grid value matches the sum of its own holdings (internal-consistency check, verified by hand at authoring time); no Buy/Sell surface anywhere; 3 themes; `test:visual` regenerated once; report, stop.

## 9. Session protocol

Every session:
0. Read STATE.md. It holds the current phase, approved deviations, and open items — treat its entries as approved law equal to this file.
1. State which phase you are in. If unclear from STATE.md + repo state, inspect and report before writing code.
2. List the files you will create/modify. Only those files.
3. Build. Consult the Astryx MCP/CLI docs before writing any UI element (rule 5).
4. Run the gate. Show the evidence (test output, story list, behavior description). UI phases: gate evidence = `pnpm test:visual` output; agent screenshots only for new-baseline approval or failure diagnosis, element-scoped, one look per case.
5. Write a phase report: what shipped, deviations (should be none), proposed tokens/deps awaiting approval, open risks.
6. Append to STATE.md: date, phase + gate status, decisions approved this session, open items, and one-line raw learnings (surprises, friction, would-have-prevented-rework). Never rewrite history — append only. Raw learnings are cleared at each phase gate by Prem's promotion review; do not act on them as rules until promoted.
7. Stop.

If you find yourself about to: add a dependency, exceed the file budget, put a hex value in a component, let a component read a store, or "quickly refactor" a neighboring layer — that is the signal to stop and report, not proceed.
