# BASTION — Node vocabulary
Status: DRAFT. This is design intent, not implementation spec — one entry per node:
the question it answers, what it looks like at a glance, register notes. Sonnet reads
this at Phase 1/2 alongside the merlin-new-node skill; components built without a
"why" become dashboard furniture, which is what this file prevents. Edit freely.

Fork note (2026-09-12): this file is trimmed from Merlin's own node-vocabulary.md,
which had grown through Merlin's Phase 3–21 build history. The Principles and
Cross-cutting rules below are domain-agnostic design law, kept verbatim. Node
entries are kept only for nodes that survived the fork's registry prune (see
CLAUDE.md §8, STATE.md's fork entry) — entries for `concentration-map`,
`entity-graph`, `geo-panel`, `comparison`, `ring-gauge`, `ring-chart`, `signal-feed`,
`status-grid` are dropped. Some kept entries' own "why not X" reasoning references
one of those now-pruned nodes by name (e.g. analyst-consensus's node-addition test
cites ring-gauge/ring-chart) — left as-is since it's historical design reasoning
that still explains why the kept node's shape is what it is, not a live dependency.
Merlin's Phase 12 risk/derivatives section and its Shell section's desktop
artifact-stack/pane-routing law are dropped or rewritten — Bastion has no desktop
workbench (CLAUDE.md §3) and no risk-desk persona.

## Principles (every node must satisfy these)
1. Conclude, then substantiate: headline findings reveal first, evidence after —
   the trail has already shown the reasoning; the scene is the decision surface.
   scene-summary is always reveal:1 — the root scene-grid keeps its own
   separate reveal:0 as the container, so scene-summary is every fixture's
   first CHILD — leading the scene's evidence panels in normal scroll flow.
   It is the literal implementation of conclude-then-substantiate. Numbering
   note: every fixture's own reveal sequence still reads unique and gapless
   from there.
2. Facts are permanent. Reasoning is active. Recommendations are provisional.
   These three never share a visual register. Three-voice typography: facts
   render in the UI/data faces; the agent's interpretive prose (findings,
   recommendations) renders in the voice face. The voice face is allowed ONLY
   in text-block and recommendation prose — never numerals, never labels,
   never data.

   Visual mechanism: every content pane — fact or reasoning — renders with the
   SAME zero-elevation treatment: outline only (`--surface-0` + `--edge`
   border), no shadow or raised surface, no borderless tier. Principle 2's
   "never share a visual register" rule is enforced entirely through
   typography (three-voice face + kicker label per paragraph 2 above) —
   chrome does not participate in the distinction. `panelFlat` is the one
   class.
3. Confidence belongs to conclusions, never to facts — data isn't confident;
   the agent is.
4. Every recommendation is prose with its evidence adjacent — recommendations
   are language, not buttons; the assistant recommends, it does not execute
   trades in v1 (open question, CLAUDE.md §10, on whether Bastion needs a
   simulated buy/sell action at all — this principle holds until that's
   resolved).
5. Motion indicates progress, never decoration (CLAUDE.md rule 15).
6. Missing data is rendered explicitly — designed empty/partial states and
   FallbackNode, never blank space.
7. One node answers one question.
8. Visual emphasis is earned, never default: only change, risk, uncertainty, or
   user focus deserve it. Everything else stays quiet.
9. Entity-first: users investigate entities and relationships — assets,
   metrics, and recommendations exist to deepen understanding of them.
10. State that names a human experience (seen, read, acknowledged) is set only
    by human action — machine convenience paths (auto-open, prefetch,
    background render) never claim it.
11. Controls are honest, in both directions. A control with nothing behind it
    is removed, not shipped inert. But a control that's part of stable,
    permanent chrome (a toolbar position, a nav slot) stays visible and
    truthfully disabled rather than popping in and out of existence as its
    target state changes — permanent chrome reads as more stable than chrome
    that appears and disappears. Context decides which arm applies: if the
    control ITSELF would be empty (no action to wire), remove it; if a stable
    fixture's target is temporarily empty (no assets connected yet), disable
    it.

Register (applies to every node): dense, matte, precise — data ink dominant, one
signal hue, no decoration that isn't information. Numbers in the data face with
tabular numerals; UI chrome (labels, titles, axis annotation) in the UI face;
the agent's own interpretive prose (text-block, recommendation) in the voice
face, nowhere else — see principle 2. Every node designed for its empty and
partial states, not just its happy one.

## Core nodes (surviving the fork prune)

**scene-grid** — answers nothing; it is the stage. Invisible when working: a grid
container that spaces panels and carries the reveal order. If you notice it, it failed.

**panel** — "where does one thought end and the next begin?" The framing unit:
title, optional source attribution, content slot. Hairline edge, no chrome. All
evidence lives inside panels; panels never nest visual weight.

**metric** — "what's the headline number?" One value, one label, optional delta
with direction. Big numeral, quiet label — label leads (top), numeral follows
(below). An optional `size` ("default" | "compact", shell-direct-import only, not
in the registered Zod contract) scales the numeral down for denser grids. A
metric elevates the single most important fact for the current question — its
prominence is earned by the agent's reasoning, not by the data model.

**metric-grid** — "what are the vital signs?" 2–4 metrics as one gestalt read.
Equal visual weight per cell; if one metric matters more, it's a `metric`, not a
grid member. A shell-direct-import variant (`minWidth`/`maxColumns` props, not in
the registered Zod contract) allows up to 6 columns for a denser fact list — a
genuinely different job (a fuller fact list, not a "vital signs" read) from the
original 2–4-metric framing, which stays the rule for every scene-JSON usage.

**data-table** — "show me the evidence, row by row." The workhorse. Dense rows,
column types respected (numerals right-aligned, tabular), status values may carry
a status-tag inline. Comfortable at 8 rows; designed for 5–20, not paging.

**time-series** — "how did it move?" Line chart, 1–3 series max, 90-day register.
Axis labels quiet, the line is the message. No gradients, no area fills unless a
band means something. Signal hue for the primary series only.

**text-block** — "what does the agent conclude?" Short prose: findings and
caveats — this is where "what remains unverified" lives as language. Body size
from the ramp, never decorated — its authority is its plainness. Facts register
(permanent); recommendations do NOT live here — they have their own node.

**recommendation** — "what should the user consider next?" Every scene's terminal
node. Prose recommendation + optional confidence + optional caveat, in the
provisional register (principle 2): visually distinct from text-block's permanence
— e.g. signal-hue hairline, "recommended" label. Never buttons, never actions,
never executes (principle 4). One recommendation per node.

**entity-header** — "who or what am I looking at?" The identity strip and the
canonical consumer of the `entity` DataSet: name, type/class, 3–5 key attributes,
inline status-tag. Dense, factual, permanent, and factual ONLY: never reasoning,
confidence, or recommendations. Everything about an entity hangs below it; there
is never more than one per scene.

**filter-summary** — "what constraints shape these results?" Always-visible strip
of active constraints as plain statements. Filters are facts, not reasoning —
permanent register, literal props. Its job is the refine beat: when the interface
rearranges, this node says why. Never interactive in v1 — it states, it doesn't edit.

**status-tag** — "what state is this thing in?" One word/short phrase in a small
capsule: OK / PENDING / FAILED / UNRATED. Accent semantics fixed system-wide
(ok/warn/alert), never per-scene. Inline-capable inside tables and headers.

**bar-series** — "how is it distributed over categories/periods?" Grouped
bars, up to 3 series, x is a category or period label (not necessarily a
date — same series shape as time-series, reused rather than a new
DataSet kind). Token colors, tabular-numeral ticks, tooltip through
tokens — same recharts craft as time-series, minus the gradient/reference-
line/annotation vocabulary that's specific to a continuous timeline.

**contribution-bars** — node-addition test (merlin-new-node skill §0),
cited before any code: "what drove this one outcome, ranked by
contribution?" Why can't an existing node answer it? `bar-series`
compares bar HEIGHTS across categories/periods on a shared vertical axis
— a distribution, not a ranked breakdown of what caused a single result.
`analyst-consensus`'s segmented bar is one bar split into PROPORTIONAL
segments summing to a whole (a composition); this node's rows are
independent, ranked magnitudes, not fractions of one total. No existing
node combines "several named rows, each a bar proportional to its own
contribution, sorted by size." Reuses bar-series's own SeriesDataSet shape
— one series only, x is the driver's name, y its own contribution
magnitude — and the same recharts craft (token colors, tabular-numeral
ticks, TokenTooltip), just `layout="vertical"`. Row order is authored,
never sorted client-side.

**sparkline** — "what's the trend, in passing?" A bare glyph, not a
chart: no axes, no tooltip, no grid, one hue (`--accent-signal` only).
Custom SVG via d3-scale/d3-shape, not recharts — meant to sit inline
next to a metric's value or inside a data-table cell, potentially many
per screen, where a full ResponsiveContainer per instance would be real
overhead. Fewer than two points renders nothing rather than an
EmptyState card — principle 6 ("missing data is rendered explicitly")
is a full-node rule; an inline glyph with nothing to show simply isn't
there, the enclosing metric or cell still carries its own real value
regardless.

**news-feed** — "what's being said about this?" Narrative headline + one-line
dek + source attribution + timestamp (binds to table: rows = articles). Headline
carries the visual weight (bold, larger than supporting text); dek stays quiet
underneath; source renders as the same SourceChip token every other provenance
citation already uses.

**confidence-meter** — "how sure is the agent?" A 0–1 value rendered as a
circular ring gauge + centered percentage + numeral, with one-word qualifier
(low/moderate/high). It's the trust architecture made visible, and it must look
like an instrument, not a game HUD — the ring is drawn with restrained,
tokens-only, d3-shape `arc()` math. Appears beside conclusions, never decorating
raw data (data isn't confident; the agent is).

**scene-summary** — "what's the verdict, before I read a single panel?" Every
scene's first-revealed node (principle 1): recommendation prose + confidence +
optional assumptions + optional caveat + the sources behind it, leading the
scene's evidence panels by reveal order. It replaces a standalone terminal
`recommendation` plus a separate `confidence-meter` — one verdict per scene,
now leading instead of trailing. Provisional register (principle 2): being
positioned first does not make it factual or permanent. Reuses `SourceChip`
(trail vocabulary) and `ConfidenceMeter` (its own registry node) directly.
Two-column layout: left column the ring (`hideCaption`) plus its one-word
qualifier; right column Sources/Unknowns/Assumptions, each its own `Metric`.
The scene's `caveat` note reads as ordinary body text across the panel's
full width, below the two-column row.

**dashboard-layout** — answers nothing itself; it is a denser stage, same
standing as `scene-grid` ("if you notice it, it failed"). Distinct from
`scene-grid` in exactly one capability: per-child asymmetric column/row
spanning (via Astryx's `GridSpan`). Column count and each child's span are
BOTH sourced from `config.ts` (`dashboardLayout.columns`/`.spans`), never from
scene JSON — this is the app's own UI configuring itself, decoupled from the
scene contract entirely.

**analyst-consensus** — node-addition test (merlin-new-node skill §0), cited
before any code: "What do outside analysts collectively think, and where does
the current price sit against their range?" — two related facts (a sentiment
distribution, a price position) that only mean something read together, not
two separate node instances. Two bars, both custom SVG/CSS: (1) a single
horizontal bar divided into bearish/neutral/bullish proportional segments,
muted per-segment token hues (no red/green performance framing — this is a
sentiment SPLIT, not a price move); (2) a single horizontal bar/axis carrying
four labeled point-markers (low/average/high/current), current visually
distinguished from the three analyst-derived positions. Literal-prop node —
facts register, permanent, never rendered in the voice face. Scoped to
crypto/stocks entities only (bonds/commodities don't carry analyst
buy/hold/sell consensus in the same sense) — flagged in CLAUDE.md §10 for
confirmation it's wanted in Bastion's own context at all.

**asset-price-header** — node-addition test: "What is this asset worth right
now, and how has that changed?" — last price, absolute and percent change, an
optional after-hours read, and today's range, read together as one glance-able
unit. Literal-prop node, facts register, permanent. A plain directional
indicator (color/arrow on the delta) is not itself a violation of the no-CTA
law (principle 4) — it's still a fact, not an action.

**earnings-history-chart** — node-addition test: "How has this company's actual
performance tracked what analysts expected, quarter over quarter?" — paired
actual-vs-estimate EPS bars across recent quarters. equity-token only (schema-
level, `TradableAssetSchema`'s own `earningsHistory?`) — absent for
crypto-native/tokenized-rwa, never a forced empty state. Flagged in CLAUDE.md
§10: this node has no obvious crypto analogue and may not belong in Bastion's
final node set.

**price-movement-timeline** — node-addition test against signal-feed AND
news-feed (this node sits close to both): "What individually notable things
has this asset's price/situation done, in order, each explained?" Distinct
from news-feed (general editorial coverage) in that it's scoped specifically
to price-relevant events. Reusable across asset classes: for a yield-register
asset, entries describe yield/event facts, not price ticks — never forcing
price-movement language onto a fixed-income-style asset (schema-level rule).

**ai-rationale-rail** — node-addition test: "Why is this asset moving, in the
agent's own words, backed by named sources?" — one scripted summary paragraph
plus its own source list and timestamp. Explicitly NOT `recommendation` — this
is reasoning/facts, never a call to act. Sources render as the same SourceChip
token every other provenance citation in this app already uses. Scripted/
template-generated text, same discipline as scene-summary/recommendation's own
synthesis — never live LLM generation, per this project's standing rule.

**trend-chart** (extends `time-series`, does not replace it) — period toggle
(1H/24H/7D/1M/YTD/1Y/MAX) and an optional `compareSeries` overlay. Additive
props over `time-series`'s existing multi-line support, not a new visual
grammar. Principle 8 gains one named, scoped exception here (not elsewhere):
this node's own primary line/area-fill, only when embedded in a compact
Overview-style form, may render in `--delta-up`/`--delta-down` (chosen by the
trend's own sign) instead of `--accent-signal`. This does NOT extend to
`time-series` itself (the bind node — stays `--accent-signal`, unchanged) or
any other chart node.

**key-issues-card** — node-addition test: "What are the live, contested
arguments for and against this asset right now, and who's making them?" — a
named topic with a bullish case and a bearish case read side by side, sourced
independently on each side. Facts/reasoning register (third-party bull/bear
framing, cited per side), never the assistant's own recommendation. Optional
at the asset level: absent means genuinely none authored, never a forced
empty card.

**asset-card-grid** — the Scene-JSON-driven half of "one card system serves
both human browsing and assistant generation": renders the same card visual a
shell-level asset grid uses, via the `entity-cards` DataSet kind, so an
inline-in-conversation result (e.g. "what are the hottest movers this week")
and the Explore screen's own grid render byte-identical cards.

**asset-trend-card** — a compact peer-comparison tile pairing an asset's
identity (logo/name) with a small trend-chart read — built for side-by-side
"how did these N assets do" rows.

**risk-return-scatter** — "how does this entity compare to its peers on two
numeric axes at once?" recharts' own ScatterChart, one labeled point per
entity, an optional subject-entity highlight. Domain-agnostic (any two
numeric axes) — kept per CLAUDE.md §10, flagged for confirmation since it
postdates the original fork spec's own visibility into Merlin's registry.

## Trail vocabulary (engine components, NOT registry nodes)
The reasoning surface is streamed by the trail player; scenes cannot lay it out.
Design intent, same standing as the nodes above:

**ThinkingTrail** — "what is the agent doing right now?" The container: steps
appear on the player's clock, active step visibly alive, completed steps settle.
Skippable by click. Reads as work being done, never as a fake chat transcript.
Connected git-log-style vertical timeline — a single rail runs through the
center of every step icon, first step to the trail's own terminal "Done" row (a
synthetic, client-only settled step ThinkingTrail itself appends once complete
— never persisted, never validated against a scene fixture). Once complete, the
whole trail is still an Astryx Collapsible with the "N reasoning steps · X.Xs"
summary — the count excludes Done, which is a terminal marker, not a reasoning
step.

**StepRow** — one atomic reasoning action, present-continuous label, optional
one-line detail. A STATUS icon — clock while active, check once settled — reads
as a real progress timeline against the connecting rail. Kind (plan/search/
retrieve/correlate/synthesize/verify) still governs everything else about a
step (label voice, which node renders below it), just isn't the icon.
ThinkingIndicator (a persistent, continuously pulsing "Thinking…" label) is a
deliberate, scoped exception to "active state is the only animated thing" —
it runs for the trail's whole active lifetime, simultaneously with whichever
row is mid-settle.

**SearchResultsCard** — `search`-kind steps only. An expandable, scrollable card
of mock web-search results (logo placeholder + title + domain per row, "N
results" count) rendered below a search step's label. Populated from
`ThinkingStep.webResults`, a field wholly separate from `sources`/SourceChip —
mock/placeholder data (engine/mockSearchResults.ts), intended to become a real
per-scenario web-search integration later without changing this card's own
shape. A different register from SourceChip (an external web citation, not an
internal system).

**SourceChip** — the canonical visual representation of every source system,
wherever cited: trail steps, panel attributions, recommendations. Identical
rendering everywhere — users should recognize a source by its chip before
reading its name. Chips are the provenance language of the whole product.

**ConfidenceBadge** — the trail-side sibling of confidence-meter: compact value +
qualifier on synthesize/verify steps. Same instrument register, smaller form.

## Shell (frame components, NOT registry nodes)

Bastion's shell is a mobile-only bottom-tab-bar + single-screen-stack model
(CLAUDE.md §3), not Merlin's desktop artifact-stack/multi-pane workbench.
Merlin's own extensive Shell-section routing law (transcript + artifact panel,
pages-vs-panes, workbench title bar, etc.) described a desktop information
architecture Bastion does not carry forward — it is not reproduced here.
Rebuilding the shell (`TabBar`, `ScreenStack`) is Phase 3 work; this section's
own vocabulary starts fresh once that phase writes real shell components.

One law survives verbatim, since it predates and is independent of the desktop
workbench shape: **the landing/ask surface is the question, not a project
browser** — investigation-first, never workspace-first. Whatever Bastion's
persistent ask/composer affordance ends up looking like (CLAUDE.md §10 open
question), it opens on the question, not a dashboard.

## Cross-cutting rules
- A node answers ONE question; if an entry above needs "and", it's two nodes.
- One conclusion per panel — panels that accumulate conclusions are becoming
  mini dashboards; split them.
- Literal-prop nodes (metric, metric-grid, status-tag, confidence-meter, filter-summary) restate
  facts that must match bound data exactly — per the scene-authoring skill.
  `recommendation` is NOT on this list: it is generated language grounded in those
  facts, never a literal restatement.
- Every node's Storybook story shows: happy state, partial data, empty state.
- Adding a node (the immune system): every proposal must answer — what single
  question does it answer? why can't an existing node answer it? why is the
  information insufficient as prose? No three answers, no node.
- Entity links: a `data-table` cell may name a known, investigable entity —
  authored as `{entityId, label}` on an `"entity"`-typed column, never on every
  entity mention in every node (entity-header's own name, and free-form
  text-block/recommendation prose stay plain text; this is not a general
  entity-detection pass, only this one node's cells). Facts register
  (principle 2): no color, no permanent decoration — underline appears on
  hover only, emphasis is earned (principle 8). Click submits that entity's
  investigation via the existing `submitQuery` path, landing as a normal turn.
  Only entities that genuinely carry an investigation intent are ever authored
  this way, so a link never points nowhere.
