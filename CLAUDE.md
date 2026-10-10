# BASTION — Simulated Crypto Wallet Prototype
## Master prompt & guardrails. This file is law. Read fully before any session.

---

## 1. Mission

Bastion is forked from Merlin (a desktop enterprise "generative intelligence interface" prototype) at the point Merlin's history ends. This file supersedes Merlin's CLAUDE.md entirely for this repository; Merlin's own file is preserved only in git history for reference. Conflicts resolve in this order: this file → tokens-spec.md → STATE.md → ask Prem. The architecture below is not open for redesign. You write code inside these constraints. If a constraint blocks a task, stop and report the conflict — do not improvise around it.

The product: a high-fidelity, mobile-only prototype of a simulated crypto wallet app, in which a user explores assets, views their own (simulated) holdings, connects a (mock) wallet, and asks an AI trading assistant questions about the market and their portfolio. Interfaces are not hardcoded pages — they are JSON scenes rendered dynamically through a component registry, exactly as in Merlin. This is Bastion's own inheritance from Merlin, not a rebuild: the engine (scene contracts, registry, renderer, trail player, token cascade) is proven infrastructure, reused as-is. What Bastion drops is Merlin's desktop shell and its enterprise/risk-desk domain content.

Demo beats the code must serve (same spirit as Merlin's, adapted to a single-column mobile shell):
1. User types or speaks a query → agent thinking trail streams → interface assembles piece by piece, in a single-column mobile layout (no multi-pane assembly — Merlin's workbench/artifact-stack model does not carry over).
2. Theme switches live between registered themes — same components, token cascade only. Merlin's `ops-dark`/`glass`/`safe-one` themes are inherited as a starting visual language (see the open question in §10 on whether Bastion keeps them or gets its own identity); the architecture must make adding a new one a zero-component-change event, exactly as it did for Merlin.
3. An external agent pushes a new scene over MCP and the interface materializes without a reload — same mechanism, unchanged.

**Explicit non-goals, stated honestly rather than silently omitted (Merlin's own recurring discipline, carried forward):**
- No real trading execution, no real funds movement, no real wallet integration. Every balance, price feed, and transaction in this prototype is simulated. This is stated as plainly as Merlin's "no order-book node, no buy/sell ticket, ever."
- No desktop layout. This is a mobile-only shell; there is no multi-pane/resizable-pane story to build or preserve.
- No enterprise/risk-desk vocabulary. `RiskLens`, `PortfolioAtlas`, derivatives, counterparty exposure, and every other Merlin-fictional-world proper noun stay in Merlin's history; Bastion authors its own crypto-native universe fresh (out of scope for this fork — see §10).

**Open question, not decided here (see §10 for the full list):** does "AI trading assistant" imply Bastion needs a simulated buy/sell action, not just a viewing/analysis surface? Merlin's whole design register (facts are permanent, recommendations are prose, never buttons, never executes) assumes an advisory-only posture. Bastion's own thesis may differ — this is not assumed either way here.

## 2. Non-negotiable rules

Inherited from Merlin verbatim in substance — these are engine/process laws, domain-agnostic, and not something a mobile wallet app gives any reason to relax:

1. **The scene contract is law.** All rendered UI derives from Scene JSON validated by Zod schemas in `src/contracts/`. No component is ever mounted from application code outside the renderer, except the app shell (composer/ask bar, theme switch, mobile frame).
2. **The registry is the only door.** JSON meets React in exactly one place: `src/registry/registry.ts` → `src/renderer/SceneRenderer.tsx`. Never import a scene into a component. Never import a component anywhere except the registry and its own story/test.
3. **Dependency direction is one-way:** `contracts ← registry ← renderer ← engine ← app`. Lower layers never import from higher layers. Components import only contracts (for prop types) and design-system primitives.
4. **Tokens only.** No raw hex, rgb, px shadows, or blur values inside components. Every visual value resolves through the token cascade (`src/theme/`). If a token doesn't exist, propose it in the phase report — don't inline the value. No inline style props/objects even when values are all var() references — positioning/layout is a stylesheet concern; a fully token-sourced inline style still violates this rule.
5. **Astryx first.** Before writing any UI element, check whether Astryx provides it (use the Astryx MCP server / CLI docs). Wrap Astryx components; build custom only for what Astryx lacks. Never fork Astryx internals.
6. **Components are pure and dumb.** Props in, UI out. No fetching, no store access, no scene awareness inside registry components. Data reaches them through the renderer's binding resolution.
7. **Outbound interaction from registry components: data attributes + shell-level delegated listeners only — never callbacks, never engine/app imports.** `EntityLink` is the reference implementation, inherited from Merlin unchanged. That's the sanctioned escape hatch for a registry component that needs to trigger something outside itself.
8. **Unknown never crashes.** Unknown node type → `<FallbackNode/>` error card. Invalid props → Zod error surfaced in the card. The renderer must survive any malformed scene.
9. **One phase at a time.** Complete the current phase, run its gate, write the phase report, stop. Do not begin the next phase in the same session. Do not refactor files outside the current phase's scope.
10. **No new dependencies without approval.** The dependency list in §5 is closed. If you believe a package is needed, stop and state the case in one paragraph.
11. **TypeScript strict. No `any`, no `@ts-ignore`, no `as unknown as`.** If typing is hard, the design is wrong — report it.
12. **File budget:** no file over 200 lines except fixture JSON. If a file grows past that, split it and say so.
13. **Naming:** components `PascalCase`, one component per file, named exports. Scene node types are `kebab-case` strings mapped in the registry.
14. **Every registry component ships with three artifacts in the same PR-equivalent:** the component, its Zod prop schema (registered in contracts), and its Storybook story. A component without all three does not exist.
15. **Motion is data, not decoration.** All animation timing/easing comes from motion tokens. The "interface assembling" effect is driven by node order in the scene tree, not per-component hacks.

## 3. Architecture

```
┌────────────────────────────────────────────────────────┐
│ APP SHELL   mobile frame · bottom tab bar · ask bar ·   │
│             theme switch · screen stack                │
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
│ THEME       token cascade · inherited Merlin themes     │
└────────────────────────────────────────────────────────┘
          ▲ runtime MCP server (separate package)
            tools: list_scenes · get_scene · push_scene · query_data
```

ENGINE / RENDERER / REGISTRY / COMPONENTS / CONTRACTS / THEME are unchanged in shape from Merlin — this is the proven part of the fork. APP SHELL is entirely new: Merlin's `Frame`/`WorkbenchRow`/`Sidebar`/pane-collapse/resize/`ArtifactStackMount`/`TranscriptPaneMount` machinery is **not carried over**. There is no multi-pane workbench in a single-column mobile app. What replaces it:

- A **bottom tab bar** (`components/shell/TabBar.tsx`) for the app's primary destinations (Explore, Holdings, Assistant, and whatever else Phase 3 scopes — see the open question in §10 on final tab set).
- A **screen stack** (`components/shell/ScreenStack.tsx`), a simple push/pop navigation model — one screen visible at a time, no side-by-side panes, no resizable panels. This is Bastion's equivalent of Merlin's `pageStore`-driven page switch, without the artifact-pane overlay concept: an investigation result renders as its own screen (or inline in a conversation view), not as a panel that opens beside other content.
- The **ask/composer bar** is a persistent bottom affordance (see the LandingState open question in §10), not Merlin's centered-greeting-before-first-turn pattern, since a mobile app has no equivalent of desktop's generous idle canvas.

The intent resolver is a strategy interface: `resolve(query: string): Promise<Scene>`. Implementation #1 is a keyword index built from scene manifests, inherited unchanged. Whether/when Bastion needs implementation #2 (an LLM-backed resolver) is not scoped by this fork pass.

## 4. Locked file structure

```
Bastion/
├── CLAUDE.md                      ← this file
├── tokens-spec.md                 ← color/type/motion values (see §10: inherited starting point or fresh — open question)
├── STATE.md                       ← session memory: read first, append last
├── app/                           ← Vite + React + TS
│   ├── src/
│   │   ├── contracts/
│   │   │   ├── scene.ts           ← Scene, SceneNode, DataBinding
│   │   │   ├── thinking.ts        ← ThinkingStep, StepKind, Confidence
│   │   │   ├── data.ts            ← DataSet shapes — trimmed, see §6
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
│   │   │   ├── stores/            ← Zustand: session, scene, trail, wallet connection, watchlist
│   │   │   └── liveChannel.ts     ← SSE client for MCP push
│   │   ├── components/
│   │   │   ├── shell/             ← TabBar, ScreenStack, ThemeSwitch, mobile Frame, ConnectWalletDialog
│   │   │   ├── trail/             ← ThinkingTrail, StepRow, ConfidenceBadge, SourceChip (unchanged from Merlin)
│   │   │   └── nodes/             ← registry components only
│   │   ├── theme/
│   │   │   ├── tokens.base.css    ← primitives: scales, type, motion, z-depth
│   │   │   ├── theme.default.css  ← semantic tokens → active Astryx stock theme
│   │   │   └── astryx-bridge.md   ← semantic token ↔ Astryx variable mapping log
│   │   └── main.tsx
│   ├── scenes/                    ← fixture Scene JSON, one file per scene — starts empty, see §10
│   │   ├── manifest.json          ← id → intents/keywords index — near-empty skeleton
│   │   └── *.scene.json           ← none yet; Bastion's own universe is fresh content, first Phase 1 task
│   └── universe/                  ← shared world: entities, sources, datasets, globally keyed — starts empty
├── mcp-server/                    ← Node + @modelcontextprotocol/sdk
│   └── src/
│       ├── server.ts              ← tools: list_scenes, get_scene, push_scene, query_data
│       └── sse.ts                 ← broadcast channel to the app
└── .storybook/                    ← theme-switch toolbar, scene playground story
```

Do not add top-level directories. Do not relocate files between layers.

## 5. Stack (closed list)

Same closed list Merlin used, inherited unchanged — no mobile-wallet-specific reason has been identified yet that Bastion needs something Merlin didn't:

- React 19, Vite, TypeScript strict
- `@astryxdesign/core`, `@astryxdesign/theme-neutral` (base to override), `@astryxdesign/cli` (dev)
- zod, zustand
- recharts (charts wrapped as registry nodes)
- `d3-scale`, `d3-shape`, `d3-hierarchy`, `d3-array` (+ their `@types/d3-*`) — math only, for custom-SVG registry nodes; never canvas, never a rendering library. **Open question (§10): with `concentration-map`/`entity-graph`/`geo-panel` pruned, is `d3-hierarchy` still needed?** `d3-scale`/`d3-shape` remain load-bearing for `sparkline`, which is kept.
- `@heroicons/react` (2.2.0, exact pin) — extends Astryx's closed `IconName` set
- storybook (react-vite)
- `@modelcontextprotocol/sdk` (mcp-server package only)
- `@types/node` (mcp-server package only, types-only)
- `@capacitor/core`, `@capacitor/ios` (exact pins) and `@capacitor/cli` (dev) — the iOS TestFlight wrapper in `app/ios/`, a thin native shell around the same Vite build. Approved by Prem 2026-10-09; the native project lives inside `app/`, not as a new top-level directory.
- vitest (contracts + bindings + resolver tests)
- @playwright/test + @storybook/test-runner (visual regression only)

Nothing else. No animation library. No CSS framework.

## 6. Contracts (authoritative sketch)

`Scene`/`SceneNode`/`ThinkingStep`/data-binding rules are kept verbatim from Merlin — domain-agnostic, proven:

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
  label: string
  detail?: string
  durationMs: number                // playback pacing
  sources?: { name: string; ref: string }[]
  confidence?: number               // 0–1, rendered as ConfidenceBadge
}
```

Data binding rule: nodes carry `bind`, never inline datasets. Renderer resolves `bind` against `scene.data` before validating props. A dangling bind is a FallbackNode, not a crash.

Universe layer: `universe/*.json` is the shared world — entities, sources, datasets under global keys. Scene `data` entries may be `{ "$ref": "<universe key>" }`; the RESOLVER hydrates refs at resolve-time. Universe stays flat keyed JSON: no query language, no relations engine, no cross-file refs.

**`DataSet` shapes — reviewed per kind, since Merlin's `data.ts` had grown to eight kinds by the time of this fork:**
- `table`, `series`, `entity`, `entity-cards`, `scatter`, `missing` — **kept.** All are domain-agnostic and back registry nodes Bastion is keeping (§8). `entity`'s optional `derivative` sub-shape (`EntityDerivativeSchema`: counterparty/notional/exposure/tenor/tradeDate) is risk-desk-specific and is **dropped** from the schema — nothing in the kept node set reads it.
- `graph`, `geo` — **dropped.** These existed solely to back `entity-graph` and `geo-panel`, both pruned per §8 (no plausible reuse identified for a wallet app; flagged as an open question in §10 in case that judgment is wrong).

## 7. Token & theme rules

Inherited from Merlin unchanged — this mechanism is exactly why the fork keeps `src/theme/`:

Three tiers, strictly cascading:
1. **Primitives** (`tokens.base.css`): raw scales — spacing, radii, type ramp, durations, easings, z-depth levels, blur scale, opacity scale. Theme-agnostic. Never referenced by components directly.
2. **Semantic** (per theme file): `--surface-0..3`, `--ink-primary/-secondary/-muted`, `--accent-signal`, `--accent-alert`, `--edge`, `--edge-highlight`, `--surface-blur`, `--surface-opacity`, `--glow`, `--scrim`, plus overrides of Astryx's cascade variables (documented in `astryx-bridge.md`).
3. **Component tokens** only when a component needs a themed value no semantic token expresses — added to both theme files in the same change.

Theme switching: `data-theme` attribute on the root, live, no remount.

**Launch model:** ship on Astryx stock themes. `theme.default.css` maps every semantic token to the active Astryx cascade variable — components consume semantic tokens ONLY, never Astryx variables directly. This indirection is the customization-ready guarantee: a new theme is a new mapping file registered next to `theme.default.css`, nothing else. If any component would need to change to support a new theme, that is an architecture defect — report it.

## 8. Registry — surviving nodes (post-prune)

Merlin's registry had grown to 32 node types by the time of this fork, spanning a Phase-3 "core eight" through Phase 21's TradableAsset-detail system. Bastion keeps the domain-agnostic and asset/price-shaped subset; enterprise/risk-desk-only nodes are pruned. See STATE.md's fork entry and the report accompanying this rewrite for the full per-file accounting. Kept nodes, by category:

- **Structural/trust architecture (Phase 3, Phase-adjacent):** `scene-grid`, `panel`, `metric`, `metric-grid`, `data-table`, `time-series`, `text-block`, `recommendation`, `entity-header`, `filter-summary`, `status-tag`, `confidence-meter`, `scene-summary`.
- **Charts, domain-agnostic (Phase 8E/21):** `bar-series`, `sparkline`, `contribution-bars`, `risk-return-scatter` — **flagged as an open question in §10**, since Merlin's own spec-writer didn't anticipate these when scoping this fork; they are mechanically generic (no enterprise content) but their retention wasn't pre-approved.
- **Asset/price detail system (Phase 19–21, "TradableAsset"):** `analyst-consensus`, `asset-price-header`, `earnings-history-chart`, `price-movement-timeline`, `ai-rationale-rail`, `trend-chart`, `key-issues-card`, `asset-card-grid`, `asset-trend-card`, `news-feed`. **Flagged as an open question in §10** — this entire subsystem is a much closer match to Bastion's "explore assets" screen than the original fork spec anticipated (built for a CoinGecko/Perplexity-Finance-style asset detail page), but keeping all ten nodes wholesale is a bigger call than a routine prune and is not decided silently here.
- **Layout primitive:** `dashboard-layout` — kept (generic grid/span mechanism, no domain content), but the risk-desk-specific *pages* built from it (`RiskDashboardPage`, `PortfolioDashboardPage`) are pruned.

Pruned: `concentration-map`, `entity-graph`, `geo-panel`, `comparison`, `ring-gauge`, `ring-chart`, `signal-feed`, `status-grid`. See §10 for the specific open question on `signal-feed`/`status-grid`, which are domain-agnostic mechanically but had no clear Bastion use identified in this pass.

## 9. Session protocol

Every session:
0. Read STATE.md. It holds the current phase, approved deviations, and open items — treat its entries as approved law equal to this file.
1. State which phase you are in. If unclear from STATE.md + repo state, inspect and report before writing code.
2. List the files you will create/modify. Only those files.
3. Build. Consult the Astryx MCP/CLI docs before writing any UI element (rule 5).
4. Run the gate. Show the evidence (test output, story list, behavior description).
5. Write a phase report: what shipped, deviations (should be none), proposed tokens/deps awaiting approval, open risks.
6. Append to STATE.md: date, phase + gate status, decisions approved this session, open items, and one-line raw learnings. Never rewrite history — append only.
7. Stop.

If you find yourself about to: add a dependency, exceed the file budget, put a hex value in a component, let a component read a store, or "quickly refactor" a neighboring layer — that is the signal to stop and report, not proceed.

## Phase plan (fresh — Merlin's 21-phase history does not apply)

Small, gated phases, matching Merlin's own discipline: one phase at a time, each ends at a gate, stop and report. This is a plan, not a commitment — later phases will be detailed/adjusted when reached, same as Merlin's own practice of issuing detailed work orders at the time.

- **Phase 1 — Instantiation + contracts.** Confirm the pruned contracts (`scene.ts`, `thinking.ts`, trimmed `data.ts`) compile and pass their existing tests against empty fixtures. Author Bastion's own first universe content (entities, sources) and first fixture scenes — explicitly NOT done in this fork pass, this is real Phase 1 work.
- **Phase 2 — Registry + core nodes reused/pruned verification.** Confirm every surviving registry entry renders in Storybook against the new (empty→seeded) universe; resolve the open questions in §10 that gate which nodes are actually in scope before building new fixtures against them.
- **Phase 3 — Mobile shell.** Build `TabBar`, `ScreenStack`, mobile `Frame` replacement; retire `WorkbenchRow`/`Sidebar`/pane-collapse remnants if any survive the prune pass; land the ask/composer bar per whichever LandingState answer §10 resolves to.
- **Phase 4 — Renderer/trail reuse verification.** Confirm `SceneRenderer`, `FallbackNode`, `bindings.ts`, and the full `components/trail/` tree work unchanged inside the new mobile shell, against real (if minimal) fixture scenes from Phase 1.
- **Phase 5 — Wallet-connect + assets screen.** Build the "explore assets" and "view owned assets" screens, starting from the kept `walletConnectionStore`/`ConnectWalletDialog` precedent and whichever asset-detail nodes §10 confirms are in scope.
- **Phase 6 — AI trading-assistant conversational flow.** The ask-a-question flow, scoped by whatever §10 concludes about trail-driven investigation vs. a more direct assistant response model.

## 10. Open questions for Prem before Phase 1

These are points where Merlin's law does not obviously map to Bastion, or where this fork pass found something Merlin's own spec-writer didn't anticipate. None are decided here — listed so Phase 1 doesn't start on a silent assumption.

1. **Does the AI trading assistant need a simulated buy/sell action, or is it view/analysis-only?** Merlin's entire design register (recommendations are prose, never buttons, never executes) assumes advisory-only. "AI trading feature" in Bastion's brief implies action, not just viewing. Not assumed either way.
2. **Does Bastion need `analyst-consensus`-style third-party opinion at all?** It's a strong stylistic match for a crypto asset detail page (buy/hold/sell distribution), but it's third-party-opinion framing borrowed from equities research — confirm it's wanted before re-skinning it.
3. **Does the AI assistant need a thinking-trail-driven "investigation," or does it answer more directly?** Merlin's whole demo thesis is trail-streams-then-interface-assembles for a slow, evidence-heavy analyst workflow. A mobile trading-assistant chat may want faster, more direct answers with the trail de-emphasized or optional. Not decided.
4. **The Phase 19–21 "TradableAsset" asset-detail subsystem** (`analyst-consensus`, `asset-price-header`, `earnings-history-chart`, `price-movement-timeline`, `ai-rationale-rail`, `trend-chart`, `key-issues-card`, `asset-card-grid`, `asset-trend-card`, `news-feed` — ten nodes plus `contracts/tradableAsset.ts`/`engine/tradableAsset.ts`/`EntityDetailPage.tsx`) is a much closer match to a CoinGecko/Perplexity-Finance-style crypto asset page than the original fork spec anticipated, since it postdates the spec-writer's knowledge of Merlin's later phases. This fork pass has **kept it intact rather than pruning it**, since deleting a working, on-thesis subsystem on a guess seemed like the bigger error — but confirm this call: keep, prune, or partially keep (e.g. drop `earnings-history-chart`, which is equities-earnings-specific and has no obvious crypto analogue).
5. **`bar-series`, `sparkline`, `contribution-bars`, `risk-return-scatter`** — domain-agnostic charts with no enterprise content, kept in this pass on the same "don't delete working generic infrastructure on a guess" reasoning as #4. Confirm.
6. **`signal-feed` and `status-grid`** — mechanically domain-agnostic (an event feed, a status grid) but no clear Bastion use was identified (no obvious "operational event log" or "grid of statuses" screen in a wallet app's four stated features). Pruned in this pass on the "no plausible reuse" test the fork spec applied to `concentration-map` et al. — confirm this wasn't too aggressive.
7. **The Holdings/wallet-connect precedent is stronger than the fork spec described.** `HoldingsPage.tsx`, `WatchlistPage.tsx`, `EntityDetailPage.tsx`, `walletConnectionStore`, and `ConnectWalletDialog` are all already wired together into something close to Bastion's own "view owned assets" + "connect wallet" screens (Merlin's own Phase 15/20/21 work). This fork pass kept all of them. Confirm this is the intended starting point rather than a from-scratch mobile design.
8. **`LandingState`'s replacement** — assumed in §3 to become a persistent bottom ask/composer bar rather than Merlin's centered-greeting-before-first-turn pattern, per the fork spec's own suggestion. This is stated as an assumption, not a decision: confirm before Phase 3 builds it.
9. **Final tab-bar destinations** — §3 names "Explore, Holdings, Assistant" as placeholders reflecting the brief's four stated features (explore, view owned, connect wallet, ask assistant — "connect wallet" reads as an action/state rather than its own tab). Not finalized.
10. **`tokens-spec.md`'s color/type/motion values** — kept in this pass as Bastion's starting visual language (they contain no Merlin business vocabulary, only OKLCH color/type/motion primitives and the ops-dark/glass/glass-light semantic mappings). Confirm whether Bastion should build on this inherited look or get its own visual identity from scratch — this fork pass did not empty the file, on the reasoning that "keep working infra, flag for review" beats "delete and rebuild from nothing," but this is exactly the kind of call the fork spec asked not to be made silently.
11. **`theme.safe-one.css`** (Merlin's fourth, cybersecurity-dashboard-styled theme) — kept alongside default/ops-dark/glass/glass-light since it's pure token values, no business content, but it was purpose-built for a different product's brief. Confirm whether it's worth keeping registered or should be dropped as noise.
12. **`d3-hierarchy`** — only consumer was `concentration-map`, now pruned. `sparkline` still needs `d3-scale`/`d3-shape`. Recommend dropping `d3-hierarchy`/`d3-array` from the dependency list if nothing else claims them by the time Phase 1 starts, but not removed unilaterally in this pass — confirm no planned Phase 1 content needs a hierarchy layout.
13. **`audit/merlin-architecture-audit.md`** — a point-in-time static-analysis report of Merlin's own component tree (references specific files, some now pruned). It goes stale immediately and isn't law. Not touched in this pass (spec didn't name it) — flagging: keep as historical record, or delete as dead weight?
14. **`narratives/universe.md`** — Merlin's own fictional-world narrative brief (Solent Markets, etc.), same register as `universe/*.json`. This pass deleted it as part of the universe-content prune (spec's "prune, don't adapt" logic applied by extension, since the spec didn't name this specific file) — confirm that extension of the rule was correct.
