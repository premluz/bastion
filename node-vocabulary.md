# MERLIN — Node vocabulary
Status: DRAFT. This is design intent, not implementation spec — one entry per node:
the question it answers, what it looks like at a glance, register notes. Sonnet reads
this at Phase 3/7 alongside the merlin-new-node skill; components built without a
"why" become dashboard furniture, which is what this file prevents. Edit freely.

## Principles (every node must satisfy these)
1. Conclude, then substantiate: headline findings reveal first, evidence after —
   the trail has already shown the reasoning; the scene is the decision surface.
   scene-summary is always reveal:1 — the root scene-grid keeps its own
   separate reveal:0 as the container, so scene-summary is every fixture's
   first CHILD — leading the scene's evidence panels in normal scroll flow.
   It is the literal implementation of conclude-then-substantiate. (Scene
   summary band order, phase-adjacent, ratified via STATE.md.) Numbering
   note: every fixture's own reveal sequence still reads unique and gapless
   from there.
2. Facts are permanent. Reasoning is active. Recommendations are provisional.
   These three never share a visual register. Three-voice typography (Phase
   8E, ◆ ratified): facts render in the UI/data faces; the agent's
   interpretive prose (findings, recommendations) renders in the voice
   face. The voice face is allowed ONLY in text-block and recommendation
   prose — never numerals, never labels, never data.
   
   Visual mechanism (Phase-adjacent, 2026-07-29, revised 2026-07-29,
   SUPERSEDED 2026-08-08): every content pane — fact or reasoning —
   now renders with the SAME zero-elevation treatment: outline only
   (`--surface-0` + `--edge` border), no shadow or raised surface, no
   borderless tier. Direct architect order retiring the prior "provisional
   content renders completely borderless" design: "each section must go
   with that pane that is using same class so we can ensure consistency."
   Principle 2's "never share a visual register" rule is now enforced
   entirely through typography (three-voice face + kicker label per
   paragraph 2 above) — chrome no longer participates in the distinction.
   `panelFlat` is the one class; `panelProvisional` is retired.
3. Confidence belongs to conclusions, never to facts — data isn't confident;
   the agent is.
4. Every recommendation is prose with its evidence adjacent — recommendations
   are language, not buttons; Merlin recommends, it does not execute in v1.
5. Motion indicates progress, never decoration (CLAUDE.md rule 15).
6. Missing data is rendered explicitly — designed empty/partial states and
   FallbackNode, never blank space.
7. One node answers one question.
8. Visual emphasis is earned, never default: only change, risk, uncertainty, or
   user focus deserve it. Everything else stays quiet.
9. Entity-first: users investigate entities and relationships — documents,
   metrics, alerts and recommendations exist to deepen understanding of them.
10. State that names a human experience (seen, read, acknowledged) is set only
    by human action — machine convenience paths (auto-open, prefetch,
    background render) never claim it. Ratified 2026-07-12 after the third
    incident in this family (Phase 8H WO-1's notification-bell bug, where
    autoOpen silently marked a pushed alert "seen" before anyone looked).
11. Controls are honest, in both directions. A control with nothing behind it
    is removed, not shipped inert — this is the usual arm, invoked whenever a
    template or pattern offers an affordance this project has no real action
    for. But a control that's part of stable, permanent chrome (a toolbar
    position, a nav slot) stays visible and truthfully disabled rather than
    popping in and out of existence as its target state changes — permanent
    chrome reads as more stable than chrome that appears and disappears.
    Context decides which arm applies: if the control ITSELF would be empty
    (no action to wire), remove it; if a stable fixture's target is
    temporarily empty (no artifacts yet), disable it. Ratified 2026-07-12
    (the artifact stack's always-visible, disabled-at-zero control).

Register (applies to every node): dense, matte, precise — data ink dominant, one
signal hue, no decoration that isn't information. Numbers in the data face with
tabular numerals; UI chrome (labels, titles, axis annotation) in the UI face;
the agent's own interpretive prose (text-block, recommendation) in the voice
face, nowhere else — see principle 2. Every node designed for its empty and
partial states, not just its happy one.

## Phase 3 — core eight

**scene-grid** — answers nothing; it is the stage. Invisible when working: a grid
container that spaces panels and carries the reveal order. If you notice it, it failed.

**panel** — "where does one thought end and the next begin?" The framing unit:
title, optional source attribution, content slot. Hairline edge, no chrome. All
evidence lives inside panels; panels never nest visual weight.

**metric** — "what's the headline number?" One value, one label, optional delta
with direction. Big numeral, quiet label — that's relative visual WEIGHT, not DOM
order: label leads (top), numeral follows (below), direct order 2026-07-27,
global (every metric/metric-grid usage app-wide). An optional `size` ("default" |
"compact", shell-direct-import only, not in the registered Zod contract) scales
the numeral down for denser grids — EntityDetailPage's About section is the first
user of "compact". A metric elevates the single most important fact for the
current question — its prominence is earned by the agent's reasoning, not by the
data model.

**metric-grid** — "what are the vital signs?" 2–4 metrics as one gestalt read.
Equal visual weight per cell; if one metric matters more, it's a `metric`, not a
grid member. Broadened 2026-07-27 for EntityDetailPage's About section specifically
(shell-direct-import, `minWidth`/`maxColumns` props not in the registered Zod
contract): up to 6 columns for a denser many-facts list, auto-fit reflowing to
~3 on a narrower column — a genuinely different job (a fuller fact list, not a
"vital signs" read) from the original 2–4-metric framing, which stays the rule
for every scene-JSON usage.

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

**entity-header** — "who or what am I looking at?" The dossier's identity strip
and the canonical consumer of the `entity` DataSet: name, type/class, 3–5 key
attributes (yield, rating, outstanding, jurisdiction), inline status-tag.
Bloomberg security-header register — dense, factual, permanent, and factual ONLY:
never reasoning, confidence, or recommendations. Everything in a dossier hangs
below it; there is never more than one per scene.

**filter-summary** — "what constraints shape these results?" Always-visible strip
of active constraints as plain statements (EU-regulated · yield >6% · >€50M ·
conservative mandate). Filters are facts, not reasoning — permanent register,
literal props. Its job is the refine beat: when the interface rearranges, this
node says why. Never interactive in v1 — it states, it doesn't edit.

**status-tag** — "what state is this thing in?" One word/short phrase in a small
capsule: OK / PENDING / FAILED / UNRATED. Accent semantics fixed system-wide
(ok/warn/alert), never per-scene. Inline-capable inside tables and dossiers.

## Phase 7 — extended five

**entity-graph** — "how are these connected?" The signature node: entities as
nodes, relationships as edges, positions authored (no simulation). Group hues
subtle, edge weight decorative. Node weight is the same status (Phase 8D) —
an optional per-node radius nudge, decorative only, never read for hover,
filtering, or edge logic. Its job in the demo is the Scene 3 moment — the
Kestrel cluster resolving into one visible structure, now with wallet size
legible via weighted radius. Legible at a glance: ≤20 nodes, labels always on.
v1 interaction pins: hover highlights the hovered entity's connected edges,
nothing else; no pan/zoom (the node count fits the frame); no temporal
replay, cluster collapse, or filtering — those are product features, not
demo scope.

**concentration-map** — "what dominates this whole?" A weighted treemap
(d3-hierarchy squarify, Phase 8E, sorted descending by value —
architect-ratified via STATE.md: squarify's own preconditions demand
descending input for correct aspect ratios, and the live before/after
comparison settled it. Supersedes Phase 8D's hand-rolled, order-preserving
layout, which degenerated on real skewed data), binding the existing table
DataSet: rows = holder/share, one
designated numeric column drives area. Names shown before values when
space is tight, ellipsized with a hover title rather than silently
dropped; legibility floor respected. Muted single-hue scale;
`--accent-signal` only for a cell the scene explicitly flags via props —
no red/green market coloring: this node encodes share, not performance
(principle 8). Facts register, permanent.
Its job in issuer-dossier is the holder-concentration answer entity-graph
used to only imply through edge count — now the dominant holder is
literally the biggest shape on screen.

**bar-series** — "how is it distributed over categories/periods?" Grouped
bars, up to 3 series, x is a category or period label (not necessarily a
date — same series shape as time-series, reused rather than a new
DataSet kind). Token colors, tabular-numeral ticks, tooltip through
tokens — same recharts craft as time-series (Phase 8E), minus the
gradient/reference-line/annotation vocabulary that's specific to a
continuous timeline. Its job in issuer-dossier is the distribution
record: eight discrete quarters read as bars, not a line implying
continuous motion between them.

**contribution-bars** — node-addition test (merlin-new-node skill §0),
cited before any code: "what drove this one outcome, ranked by
contribution?" Why can't an existing node answer it? `bar-series`
compares bar HEIGHTS across categories/periods on a shared vertical axis
— a distribution, not a ranked breakdown of what caused a single result.
`analyst-consensus`'s segmented bar is one bar split into PROPORTIONAL
segments summing to a whole (a composition); this node's rows are
independent, ranked magnitudes, not fractions of one total. `concentration-
map` is share-of-whole via area, wrong shape for a ranked list read
top-to-bottom. No existing node combines "several named rows, each a bar
proportional to its own contribution, sorted by size." Why is prose
insufficient? A ranked list of magnitudes reads faster as bar lengths
than as a sentence enumerating percentages — the same reasoning already
established for `ring-gauge`/`concentration-map`/`analyst-consensus`.
Reuses bar-series's own SeriesDataSet shape (Phase 21 follow-up,
2026-08-31) — one series only, x is the driver's name, y its own
contribution magnitude — and the same recharts craft (token colors,
tabular-numeral ticks, TokenTooltip), just `layout="vertical"` (recharts'
own name for horizontal bars: axes swap, YAxis carries the category
labels). Row order is authored, never sorted client-side — same
"order preserved, not computed" discipline `concentration-map`'s own
entry established. First real usage: a follow-up query in the same
crypto-movers thread ("41% weekly move") breaks Zenith Protocol's move
into its named drivers.

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

**geo-panel** — "where is this happening?" Stylized abstract map (normalized
coords, SVG regions, no tiles) with placed points. OPEN QUESTION for ratification:
no current fixture carries geo data. Add a jurisdiction view to the
discovery-refine scene (EU regions, assets placed by domicile — cheap, fits the
"only EU-regulated" beat)

**signal-feed** — "what just happened?" Chronological event stream (binds to
table: rows = events): timestamp, source chip, one-line event, optional status-tag.
The Monitor module's native surface and the Phase 9 alert's landing zone. Reads
top-down, newest first, no infinite scroll — a feed excerpt, not a firehose.
Each row reads as a watch item: entity · what changed · importance · timestamp.

**news-feed** (Phase 16) — "what's being said about this?" Narrative
headline + one-line dek + source attribution + timestamp (binds to table:
rows = articles). Node-addition test against signal-feed, cited before any
code: signal-feed answers "what just happened, operationally" — a
settlement failure, an audit lapse, logged as an event; news-feed answers
"what's the story being told" — editorial texture about an entity, the
SeekingAlpha register, not a change-detection feed. Distinct question,
distinct register, not a duplicate. Headline carries the visual weight
(bold, larger than signal-feed's own one-line event text); dek stays quiet
underneath in supporting text; source renders as the same SourceChip token
every other provenance citation already uses — one recognizable chip
regardless of where it appears. Content is authored, tied to existing
facts where the entity already has them (Aldergate's audit lapse becomes a
headline, not a new fact), establishing character where it doesn't (a new
entity's first few headlines). Entity Detail's own native surface.

**comparison** — "which one, and on what grounds?" 2–3 entities side by side
across shared dimensions (yield, risk, liquidity, jurisdiction). Column-per-entity,
dimension rows; differences carry the emphasis, similarities stay quiet. This is
Scene 1's decision-support core.

**confidence-meter** — "how sure is the agent?" A 0–1 value rendered as a
circular ring gauge (SUPERSEDES the original "restrained horizontal gauge...
never a gimmick dial" law — direct architect order, 2026-07-27, see STATE.md)
+ centered percentage + numeral, with one-word qualifier (low/moderate/high).
It's still the trust architecture made visible, and it must still look like
an instrument, not a game HUD — the ring is drawn with the same restrained,
tokens-only, d3-shape arc() math RingGauge's own instrument already uses
(Phase 12), not a decorative dial. Appears beside conclusions, never decorating
raw data (data isn't confident; the agent is).

## Phase-adjacent — scene summary band (Scene summary band order, architect-ratified via STATE.md)

**scene-summary** — "what's the verdict, before I read a single panel?" Every
scene's first-revealed node (principle 1): recommendation prose + confidence +
optional assumptions + optional caveat + the sources behind it, leading the
scene's evidence panels by reveal order. It is the literal implementation of
conclude-then-substantiate, and it replaces the old pattern of a standalone
terminal `recommendation` plus a separate `confidence-meter` — one verdict per
scene, not two, now leading instead of trailing. Provisional register
(principle 2): being positioned first does not make it factual or permanent —
it is still a recommendation, and its prose still carries the voice face
exactly as `recommendation`'s own text does; confidence, assumptions, caveat,
and sources are UI/data facts ABOUT that recommendation and stay in the
UI/data faces. Literal-prop node, not bound — same standing as
`recommendation`/`confidence-meter`, and subject to the same generated-language
exemption from the cross-cutting exact-match rule. Reuses `SourceChip` (trail
vocabulary) and `ConfidenceMeter` (its own registry node) directly rather than
reinventing either rendering — the sanctioned pattern for a node that needs
another node's already-built instrument. `recommendation` and
`confidence-meter` remain registered nodes; scene-summary does not replace
their existence, only their use as a scene's own terminal pairing.

Two-column confidence pane (direct order, 2026-07-29, second pass —
supersedes both the same-day `MetadataList` version and the first
`Metric`-under-the-ring version below). The confidence pane is now a
`Panel` (registered node, reused directly — same precedent as
`ConfidenceMeter`/`SourceChip`) titled with the scene's own
`confidenceLabel` ("Recommendation confidence," "Hedge-case confidence,"
etc., authored per scene) — the label lives on the card, not repeated
under the ring. Left column: the ring (`hideCaption`) plus ONLY its
one-word qualifier ("Moderate") set at `Metric`'s compact value size
(large/semibold) with no label above it — a description of the ring, not
a metric in its own right, since the ring's own numeral already carries
the number. Right column: Sources/Unknowns/Assumptions, each its own
`Metric` — the same label-top/value-below component Trend/Statistics/
About already use, reused here rather than Astryx's `MetadataList` (used
only briefly) or the ring's own former duplicate text caption
(`ConfidenceMeter`'s `hideCaption` flag — composition-only, not
scene-authorable). The scene's `caveat` note is NOT part of either
column — it reads as ordinary body text across the Panel's full width,
below the two-column row (a qualifier on the whole verdict, not scoped to
confidence specifically once it left the ring's own column). Unknowns is
a count like its siblings (`SceneSummaryPropsSchema` gained an
`unknowns: string[]` field mirroring `assumptions`) — NOT the caveat text;
no fixture authors it yet, so it renders 0 everywhere until a scene
actually enumerates open unknowns, same honest-empty-state standing as
Assumptions already had.

Confidence-timestamping principle (Sticky fix order, architect-ratified via
STATE.md): when a fixture's recommendation and its confidence-meter disagree,
the meter reflects the most recent narrative truth — prefer it. This is a
recency rule, not a tie-break: state WHY the meter wins in the extrapolation
log (what changed since the recommendation's own number was written), not
just which value was kept. See STATE.md's audit-status-alert entry for the
worked example (a gate that failed after the recommendation's 0.64 was
authored — the meter's later 0.42 is the truth as of now, and the log says so).

## Phase 12 — Risk & Derivatives Module

Explicit non-goal, restated here verbatim per the legislation: no
order-book node, no buy/sell ticket, ever. The portfolio view recommends;
it never executes (principle 4 applies to this persona exactly as it does
to every other — an escalate/hedge recommendation is prose with evidence
adjacent, same as any other scene's verdict, not a trading action).

**ring-gauge** — node-addition test (merlin-new-node skill §0), cited before
any code: What single question does it answer? "How much of a bounded
limit or capacity is used, at a glance?" — a fullness/utilization fact
(exposure against a risk limit, margin used against a ceiling), not a
conclusion. Why can't an existing node answer it? `metric` shows a raw
number with no sense of headroom against a ceiling; `confidence-meter` is
reserved exclusively for agent confidence about a conclusion (principle 3:
"confidence belongs to conclusions, never to facts") and using it for a
data fact like exposure utilization would violate that law directly, not
just stylistically; `bar-series`/`concentration-map` show a distribution
across categories, not a single value's fullness against one ceiling.
Why is prose insufficient? "84% of limit" as bare text doesn't carry the
same instant headroom read a fuel-gauge shape gives — same family of
reasoning as `concentration-map`'s own test ("dominance is spatial, not
prose"), one level narrower: fullness-of-one-thing, not share-of-a-whole.
A restrained ring/donut arc + centered numeral, token-hued fill against a
quiet track. Literal-prop node (value, max, label, tone authored per
scene, same standing as `metric`/`confidence-meter`/`status-tag`) — facts
register, permanent, NEVER used for agent confidence (principle 3 is the
hard boundary between this node and `confidence-meter`, not a style
choice). Tone is authored, not computed from the ratio — same fixed
system-wide ok/warn/alert semantics as `status-tag`, not
`confidence-meter`'s qualifier logic: confidence's "high" reads as good
(green), but a risk gauge's "high" utilization reads as bad, and reusing
confidence's tone mapping here would silently invert that meaning. A
ratio at or beyond 1.0 (limit met or breached) still renders — the arc
clamps visually at a full ring, the numeral does not lie about the true
value, and `tone: "alert"` is how a breach actually reads, not a crash or
a clipped bar. Reuses `d3-shape`'s `arc()` generator (already an approved
dependency, Phase 8E) for the path math — NOT "confidence-meter's arc
math," a premise this node-addition test found to be factually wrong:
`confidence-meter` wraps Astryx's `ProgressBar` and has no arc math of any
kind to reuse (logged in STATE.md). What IS genuinely carried over from
`confidence-meter` is the instrument register itself — "must look like an
instrument, not a game HUD" — applied here via the same restrained,
single-hue, no-chrome treatment, not shared code.

**dashboard-layout** — answers nothing itself; it is a denser stage, same
standing as `scene-grid` ("if you notice it, it failed"). Distinct from
`scene-grid` in exactly one capability: per-child asymmetric column/row
spanning (via Astryx's `GridSpan`) — `scene-grid` offers a single global
column count and nothing else (confirmed by reading `SceneGrid.tsx`: it
passes `children` straight into Astryx's `Grid` with no per-child
wrapping at all). Column count and each child's span are BOTH sourced
from `config.ts` (`dashboardLayout.columns`/`.spans`), never from scene
JSON — Prem's explicit instruction: this is Merlin's own UI configuring
itself, decoupled from the scene contract entirely, not a second way to
author the same thing `scene-grid`'s `columns` prop already does.
`spans` is author-ordered (index N governs the Nth child), not keyed by
node id or type. Astryx-first check (Phase 12 WO-1.5): `astryx component
--list` surfaces `Grid`+`GridSpan` under Layout, with a `GridSpan`
description reading "enabling masonry-style and asymmetric layouts" and
an existing template, `GridDashboardLayout` ("mixed-size widgets and a
full-width summary row") — almost exactly this node's brief. Wrapped
directly, nothing custom-built.

**status-grid** — "what's the state of many things at once, scannable in
one glance?" A compact matrix of small status indicators — many cells,
not `metric-grid`'s 2-4 ("if one metric matters more, it's a `metric`,
not a grid member" already caps that node out of this job). Reuses
`status-tag`'s fixed ok/warn/alert/neutral semantics per cell — not its
code (a dense matrix of `Badge` pills would fight `status-tag`'s own
pill-shaped, single-item register) — via Astryx's `StatusDot` (found by
the same `astryx component --list` search: "small colored dot... always
pair with a visible text label," which is exactly the cell shape this
node needs) laid out in Astryx's own responsive `Grid`. Astryx-first
check: searched explicitly for "matrix"/"heatmap" — neither exists;
`StatusDot`+`Grid` is the closest real pair, both wrapped, no custom SVG
needed at all for this node. Bound node (many cells means row data, not
something hand-authored per scene): binds to the existing table
DataSet, `labelColumn` + `toneColumn` — the schema itself refines every
row's tone cell to one of ok/warn/alert/neutral, so a bad value is a
`FallbackNode` (invalid-props), never a silent wrong color. Facts
register, permanent — same as `status-tag`, never confidence.

**ring-chart** — "how does this total break down across a handful of
categories, at a glance, in a compact card?" node-addition test against
`concentration-map` specifically, since both answer share-of-a-whole
questions: `concentration-map`'s own treemap needs real horizontal room
to stay legible — Phase 8E's own diagnosed bug (STATE.md) found labels
clipping and values disappearing at the real ~353px artifact-panel
width, well before a dashboard's own colSpan:1 card (roughly a third of
that) would be attempted. A donut+legend stays legible at that size for
a SMALL number of segments (capped at 6, matching the `--viz` palette)
because segment labels live in the legend, not in-place. Extends
`ring-gauge`'s own `d3-shape` `arc()` usage to N segments via `d3-shape`'s
`pie()` generator (still the same approved dependency, still zero new
architecture) — allocation-style (a whole divided into parts, no single
"fullness" reading), not gauge-style (one value against one limit) —
this is the real line between the two ring nodes, not their shared
math. Bound node, same `labelColumn`/`valueColumn` binding shape as
`concentration-map` (deliberate reuse, not a new DataSet shape). Facts
register, permanent, muted per-segment token hues (`--accent-signal` +
`--viz-2`..`--viz-6`) — no red/green performance coloring, same
principle-8 discipline `concentration-map` already holds.

## Phase 19 — Entity Detail Tabs + Analyst Consensus

Explicit non-goal, restated here per Entity Detail's own existing register
law (Shell section below): analyst-consensus is a facts-register display of
THIRD-PARTY opinion (what outside analysts think), never Merlin's own
recommendation and never a step toward one — it sits in the same
"News/Stats/Compare is the SeekingAlpha register, not the Kraken one"
posture the page already holds. No buy/sell/hold action is ever attached to
it; a consensus bar is read, not acted on, same as every other fact this
page renders.

**analyst-consensus** — node-addition test (merlin-new-node skill §0), cited
before any code: What single question does it answer? "What do outside
analysts collectively think, and where does the current price sit against
their range?" — two related facts (a sentiment distribution, a price
position) that only mean something read together, not two separate node
instances. Why can't an existing node answer it? `bar-series` compares bar
HEIGHTS across categories/periods — it has no mode for one bar split into
named proportional segments (buy/hold/sell as fractions of one whole).
`ring-chart` is allocation-style (a whole divided into parts) but renders as
a donut+legend, wrong shape for a linear low→high price axis with labeled
point-markers. `ring-gauge` is fullness-of-one-value-against-one-ceiling,
not a range with multiple named positions on it. `confidence-meter` is
reserved exclusively for agent confidence about a conclusion (principle 3)
— using it for third-party analyst sentiment would violate that boundary
the same way ring-gauge's own test found for exposure utilization. No
existing node combines "one bar, several proportional named segments" with
"one bar, several labeled point-markers on a shared axis." Why is prose
insufficient? "14 of 14 analysts bullish, average target above current
price" as bare text doesn't carry the same instant at-a-glance read a
segmented bar + marked price axis gives — the same family of reasoning
`ring-gauge`'s and `concentration-map`'s own tests already established for
this project (a shape reading faster than a sentence for a fact with real
spatial structure).

Two bars, both custom SVG/CSS (Astryx has no primitive for either shape —
`ProgressBar` is explicitly single-segment only per its own doc comment,
`Slider`'s `marks` prop is the nearest partial match but is an interactive
input control, the wrong register for a passive fact display; checked
before building custom, same `merlin-new-node` §0 discipline as
`concentration-map`/`ring-chart`): (1) a single horizontal bar divided into
bearish/neutral/bullish proportional segments, muted per-segment token
hues (no red/green performance framing — this is a sentiment SPLIT, not a
price move, same principle-8 discipline `concentration-map` already
holds for share-of-whole); (2) a single horizontal bar/axis carrying four
labeled point-markers (low/average/high/current), current visually
distinguished from the three analyst-derived positions since it's a
different kind of fact (today's real price vs. analysts' own numbers).
Literal-prop node (distribution counts + price positions authored per
scene/entity, same standing as `metric`/`ring-gauge`/`status-tag`) — facts
register, permanent, never rendered in the voice face (principle 2). Scoped
to crypto/stocks entities only, per CLAUDE.md's own Phase 19 order — bonds
and commodities don't carry analyst buy/hold/sell consensus in the same
sense, and this node is never forced onto an entity type it doesn't
genuinely apply to.

## Phase 20 — TradableAsset Unification (WO-1)

Explicit non-goal, restated per this section's own register law: every node
here displays facts (a price, a filing, a sourced explanation) or reused
third-party opinion (analyst-consensus, unchanged from Phase 19) — never
Merlin's own recommendation, and never a Buy/Sell/Trade/Send/Receive CTA,
consistent with every prior discovery/analysis surface in this app.

Scope correction, logged here not just in STATE.md: two of the six
components CLAUDE.md's Phase 20 block named — `AssetKeyStatsTable` and
`AssetSnippetCard` — are NOT registry nodes. Both are label/value fact
grids (`KeyStat[]`, `{label, value}` pairs); `EntityAbout.tsx`/
`EntityStatistics.tsx` already establish the reuse pattern for this exact
shape (`MetricGrid`+`Metric`, Merlin's own existing registry nodes, per
`Metric`'s own `{label, value, size}` props). Building a second, competing
label/value primitive would violate "search before you create" — these
ship as shell-level components (`components/shell/`), not through the
registry, same architectural status as `EntityAbout`/`EntityStatistics`
themselves.

**asset-price-header** — node-addition test (merlin-new-node skill §0),
cited before any code: What single question does it answer? "What is this
asset worth right now, and how has that changed?" — last price, absolute
and percent change, an optional after-hours read, and today's range, read
together as one glance-able unit. Why can't an existing node answer it?
`metric`/`metric-grid` render individual label/value facts but have no
built-in delta/direction affordance or a two-tier (regular-hours +
after-hours) price read — forcing this into a metric-grid would mean four
or five separate Metric cards where the reference pattern (and every real
finance surface) treats price+delta as one cohesive unit, not a scattered
grid. `ring-gauge` is fullness-against-a-ceiling, wrong shape for a signed
delta. Checked Astryx directly (no `Stat`/`Delta`/`PriceHeader` primitive
exists — confirmed via source, not assumed) before building custom. Why is
prose insufficient? "$40.33, up $0.07 (0.17%)" as bare text loses the
instant positive/negative read a numeral+arrow/color pairing gives — same
family of reasoning `ring-gauge`/`analyst-consensus`'s own tests already
established. Literal-prop node (authored/computed per asset, same standing
as `metric`), facts register, permanent. A plain directional indicator
(color/arrow on the delta) is not itself a violation of the no-CTA law
(principle 2 restated above) — it's still a fact, not an action; the line
stays where node-vocabulary.md's Holdings entry already drew it: a fact's
own color is not a Buy/Sell button sitting beside it.

**earnings-history-chart** — node-addition test: What single question does
it answer? "How has this company's actual performance tracked what
analysts expected, quarter over quarter?" — paired actual-vs-estimate EPS
bars (or lines) across recent quarters. Why can't an existing node answer
it? `bar-series` compares bar heights across categories but has no
built-in "two related values per category, one a target" pairing —
forcing actual+estimate into `bar-series` would need two full series with
no visual pairing between a quarter's own two values, losing the
beat/miss read entirely. `time-series` is continuous-trend shaped, wrong
register for discrete quarterly events. Why is prose insufficient? "Q2
2026: $0.67 actual vs $0.64 estimate" repeated four times as text loses
the beat/miss pattern a paired-bar read gives instantly. equity-token
only (schema-level, `TradableAssetSchema`'s own `earningsHistory?`) —
absent for crypto-native/tokenized-rwa, never a forced empty state.
Deep-links from Overview's Earnings preview card to the Earnings tab, per
the order's own "nothing on Overview is a dead end" IA law.

**price-movement-timeline** — node-addition test against signal-feed AND
news-feed (this node sits close to both, requires an explicit test against
each, not just one): What single question does it answer? "What
individually notable things has this asset's price/situation done, in
order, each explained?" Why can't signal-feed answer it? signal-feed
answers "what just happened, operationally" (a settlement failure, an
audit lapse) — a Monitor-module change-detection feed, table-bound, no
per-row narrative depth. price-movement-timeline entries carry a
headline+detail pair explaining a SPECIFIC price move or situational
event, closer to a dossier than an operational log. Why can't news-feed
answer it? news-feed is Entity Detail's own existing "what's the story
being told" surface (SeekingAlpha register) — genuinely the closest
match, and price-movement-timeline reuses its visual grammar deliberately
(headline weight, dek/detail in supporting text, SourceChip provenance)
rather than inventing a new one. The real distinction: news-feed is
general editorial coverage (dividend policy, risk-profile reads, whatever
the entity has coverage about); price-movement-timeline is scoped
specifically to price-relevant events and is REUSABLE ACROSS ALL THREE
ASSET CLASSES including yield-register assets — for a bond/RE/credit-fund
entity (once/if TradableAsset extends that far), entries describe yield/
audit/settlement EVENTS, not price ticks, reusing the existing NordBond/
Aldergate event pattern already in `universe/news.json`, never forcing
price-movement language onto a fixed-income asset (schema-level rule,
`TradableAssetSchema`'s own `TimelineEntrySchema` doc comment). Two
distinct nodes, not a duplicate, because they answer different questions
even where their rendering looks similar — same "distinct question,
distinct register" standard news-feed's own test held against signal-feed.
Deep-links from Overview's "Notable Price Movement" preview card to the
News/Analysis tab, per the order's IA law.

**ai-rationale-rail** — node-addition test: What single question does it
answer? "Why is this asset moving, in the agent's own words, backed by
named sources?" — the CoinGecko "Why BTC is moving" right-rail pattern: one
scripted summary paragraph plus its own source list and timestamp. Why
can't an existing node answer it? `recommendation` carries a confidence
score and sits in the PROVISIONAL register (principle 2) — this is
explicitly NOT that; explaining a move is reasoning/facts, never a
recommendation to act. `news-feed`/`price-movement-timeline` are lists of
discrete dated entries; this is one synthesized paragraph reading across
several of them, a different shape entirely (prose summary vs. itemized
feed). Why is prose insufficient? The prose IS the node's own content —
the test here is why it needs its OWN dedicated rail rather than living
inside an existing panel: it's a genuinely separate reading surface (right
rail, per the reference pattern), not a variant of an existing one.
Sources render as the same SourceChip token every other provenance
citation in this app already uses (Merlin's own existing component, per
node-vocabulary.md's own cross-cutting rule) — NOT Astryx's `Citation`
component, which is an inline numbered-footnote marker, wrong shape for a
list of named, timestamped sources. Scripted/template-generated text, same
discipline as scene-summary/recommendation's own synthesis (not live LLM
generation, per this project's standing rule).

**trend-chart** (extends `time-series`, does not replace it) — node-
addition test: What does the extension answer that the existing node
doesn't? "What did this asset do over a period the viewer picks, optionally
against a comparison line?" — period toggle (1H/24H/7D/1M/YTD/1Y/MAX) and
an optional `compareSeries` overlay (the NordBond-vs-related pattern from
the SAFE ONE-adjacent reference). Why not a new node? `time-series`
already renders a line/area series with reference lines and annotations
(Phase 8E craft pass) — period-toggle is additive UI state around the same
underlying series data (a client-side slice, per `TradableAssetSchema`'s
own `trendChart.series` being one flat array, not per-period stored data),
and `compareSeries` is structurally identical to `time-series`'s existing
multi-line support (Phase 12 WO-2's own multi-series overlay, `--viz`
token dash/color differentiation) — genuinely additive props, not a new
visual grammar, per Phase 12 WO-2's own "extend before duplicating"
precedent for this exact node. If the period-toggle's own local UI state
turns out to need a wrapper component around `time-series` rather than
fitting as passthrough props, that's a build-time implementation detail,
not a new registered node.

## Phase 21 — Entity Detail Overview Redesign

Restyles Overview only; Financials/Analysis/Earnings/News/Historical Data
tabs are unchanged. The WO-1 deep-link law stays in force here — every
card in the new two-column Overview still deep-links to its own tab,
nothing is a dead end.

**Principle 8 exception, named and scoped (2026-08-15 ruling)**: the
standing "no red/green performance-direction coloring" ban gains ONE
named exception — `trend-chart`'s own primary line/area-fill, and only
when embedded in Overview's compact form, may render in `--delta-up`/
`--delta-down` (chosen by the trend's own sign) instead of
`--accent-signal`. This does NOT extend to `time-series` (the bind node,
reused by scene-driven surfaces — stays `--accent-signal`, unchanged),
does NOT extend to any other chart node (`bar-series`, `ring-chart`,
`earnings-history-chart`, etc. — all stay accent/viz-only), and does NOT
license a general "price charts may use red/green" reading elsewhere in
this app. One named node, one named context, logged here so it is never
read as an implicit precedent for anything else.

**glow (CSS-module primitive, not a registry node)** — position variants
(bottom / top-left / top-right / bottomWide) × clip variants (clipped to
the pane / unclipped, overflow visible), color via a custom property
(defaults to `--accent-signal`; the trend-chart's own compact form passes
`--delta-up`/`--delta-down` per the exception above). Applied via
className to any existing Panel/Card, same escape-hatch posture as
`panelFlat` — a presentation-only style hook, not data, so it carries no
Zod contract and is not registry-scoped. Confirmed reusable outside
TradableAsset context before shipping (the phase's own gate requirement),
not accidentally coupled to one page.

**glow as a per-node toggle (2026-08-17 follow-up) — SUPERSEDED 2026-08-19,
moved to the pane** — `time-series`, `price-movement-timeline`, and
`earnings-history-chart` originally each gained their own additive,
optional `glow` boolean prop that wrapped the component's own content in
the glow primitive above. Direct feedback reversed this for the two
nodes with a real-world consumer: "the bottom gradient should be applied
to pane (card) rather than component of timeline itself, cards should
easily also have gradient glow system as we have it defined." Root
problem — a node applying glow to its OWN inner content, nested inside a
`Panel`/`PanelWithAction` Card, put the glow against the content's own
padded edge, not the card's true edge; visually indistinguishable from
"the glow isn't reaching the pane" the way `TrendChart`'s bleed bug read
before it was fixed the same way (see that entry above).
`price-movement-timeline`'s and `earnings-history-chart`'s own `glow`
prop is REMOVED (Zod schema and component both) — `glow`/`glowColor` now
live on `Panel` and `PanelWithAction` (nodes/Panel.tsx, shell/
PanelWithAction.tsx) instead, applying the SAME glow primitive to the
Card itself; content renders inside unchanged. `AssetOverviewTab.tsx`
opts the `PanelWithAction` wrapping each of these two INTO the glow at
its real call site, not the node inside it. `time-series` keeps its own
`glow` prop unchanged (still zero live TradableAsset consumers as of this
writing — `TrendChart` is Overview's own chart, a separate component with
its own data-driven `--delta-up`/`--delta-down` glow color, a legitimate
exception since it isn't wrapped by `Panel`/`PanelWithAction` at all);
revisit `time-series`'s own prop the same way if a real consumer
eventually needs it. This does NOT reopen the principle-8 exception
above — `earnings-history-chart`'s own bars stay on their existing
per-quarter `--delta-up`/`--delta-down` beat/miss coloring (a prior,
separately-ratified exception), unaffected by where the glow chrome now
lives. **General rule, stated for reuse**: any card wrapper (`Panel`,
`PanelWithAction`) can take `glow`/`glowColor` directly — a content
component should not wrap itself in glow when something will always
enclose it in a pane.

**key-issues-card** — node-addition test (merlin-new-node skill §0),
cited before any code: What single question does it answer? "What are
the live, contested arguments for and against this asset right now, and
who's making them?" — a named topic with a bullish case and a bearish
case read side by side, sourced independently on each side. Why can't an
existing node answer it? `analyst-consensus` aggregates a DISTRIBUTION
(counts across a bearish/neutral/bullish spectrum) — it has no mechanism
for two opposing PROSE arguments on a specific topic, and collapses many
analysts into one number rather than presenting a case. `ai-rationale-rail`
is a single synthesized paragraph explaining a past move, not two
opposing live arguments on an open question. `comparison` is entity-vs-
entity across shared dimensions, not one entity's own internal bull-vs-
bear tension. No existing node holds "two named, independently-sourced,
opposing prose arguments on one topic" as a shape. Why is prose
insufficient? A single paragraph blending both sides loses the
adversarial structure that makes a genuinely contested question legible
at a glance — the split itself (bull left, bear right, equal visual
weight) IS the fact being communicated, same "shape reads faster than a
sentence" reasoning `analyst-consensus`/`ring-gauge` already established.
Facts/reasoning register (third-party bull/bear framing, cited per side),
never Merlin's own recommendation — same boundary `analyst-consensus`
holds for third-party sentiment. Optional at the TradableAsset level:
absent means genuinely none authored, never a forced empty card.

**Notable Price Movement — rename + visual restyle, not a new node.**
The existing `price-movement-timeline` node/schema (`TimelineEntry`,
unchanged) is renamed in IA/label terms only ("Notable Price Movement"
replaces its earlier plain "notable price movement" card title — the
underlying registry key `price-movement-timeline` is unchanged, only its
rendered visual treatment gains a vertical day-marker-and-connecting-line
layout). Decided at build time per the order's own explicit escape hatch:
a restyle, not a fresh node-addition test, because the question it
answers and the data it binds are both unchanged — only the layout
(horizontal list → vertical timeline) differs. If a future need arises
for a genuinely different timeline shape (e.g. a horizontal scrubber),
that would warrant its own test; this one doesn't.

**Stories & Analysis — renamed section, placeholder images, no new data
shape.** What Overview's price-movement preview card was informally
called is retitled "Stories & Analysis" and gains a token-colored
placeholder image block per entry (no real image pipeline — same honest-
placeholder posture as Data Sources' own public catalog). No schema
change: still `TimelineEntry`, the image is a presentation-only
placeholder, not authored data.

## Shell (Phase 5 — frame components, NOT registry nodes; intent only, design at
Phase 5; v2 model — Phase 8B WO-2/WO-3, architect-ratified via STATE.md;
sidebar — Phase 8C, architect-ratified via STATE.md)
The landing surface is the question, not a project browser — investigation-first,
never workspace-first. This is the one law that predates and survives the v2
model unchanged: LandingState opens on a centered question + composer + a
handful of real-intent suggestions, nothing resembling a dashboard.

### Asset Category Coherence (Phase 18, codified 2026-07-30)
Six asset categories prove the architecture generalizes across radically different
registers (yield-first vs. price-ticker) without engine changes. This generality
is load-bearing; coherence across categories is the proof. Four standing rules:

1. **Category isolation:** Movers (Notable Movers) and Trending are crypto+stocks
   ONLY — momentum-framed surfaces exclude fixed-income/real-estate/credit-funds
   by rule. Newly Added is mixed-category WITH a category tag on every card,
   disambiguating which register each entity belongs to. No other surface mixes
   registers without an explicit category tag on every card.

2. **Field consistency:** Yield-first categories (covered-bonds, real-estate,
   credit-funds) never show %, always pp (percentage points — the movement in
   basis points). Price-ticker categories (crypto, stocks, commodities) never
   show pp, always % (percentage of price, the standard CMC/finance convention).
   A yield cell and a price-delta cell are visually and numerically distinct
   exactly because they measure different things, and this difference is
   non-negotiable across all six categories.

3. **Data source alignment:** Sparkline always tracks the category's PRIMARY metric
   — yield series for fixed-income, price series for price-driven assets. Never
   volume (even when volume is a separate column), never a mismatched series that
   would make the 7d% value and the sparkline shape contradict each other.

4. **Column logic:** Crypto/stocks/commodities render CMC-style columns (Asset |
   Price | 24h % | 7d % + Sparkline | Market Cap | Volume | Circulating Supply
   or equivalent). Covered-bonds/real-estate/credit-funds render yield-first
   columns (Asset | Yield | Rating/Distribution | Outstanding | Trend). Zero
   bleed between the two column sets — a crypto row never sneaks into yield
   columns, a bond row never shows a price-style delta.

**Process rule (before shipping any single-category change):** Verify it doesn't
create asymmetry across the other five categories. Check the sibling categories
in the same register (yield-first or price-ticker) render identically in
structure; check the opposite register remains genuinely differentiated (not a
muted copy, a real alternative). This prevents the drift pattern this entire
session caught: color inversion in one theme, column misplacement on one
category, field inconsistency when a new surface debuts.

Session-scoped, not single-turn: every turn asked this session stays alive.
Transcript renders the full history, oldest first — user utterance right,
agent activity left. A turn's agent-side content still describes the
investigation, not the world (entity-header's inverse) — status, source count,
elapsed reasoning time, its own thinking trail — but no longer re-echoes the
question as a heading of its own: the question already sits right there in the
user's own turn, immediately to its right, and repeating it read as dashboard
furniture, not investigation-first. Once a turn's trail settles, its agent-side
content gains an ArtifactCard naming the scene it produced.

The scene itself no longer sits fixed beneath the trail — it lives in
ArtifactPanel, a single right-side surface that shows whichever turn's
artifact is currently open (any turn, not only the latest — that's the entire
point of a session-scoped transcript). A card click always opens its own
artifact; auto-opening on trail completion is a configurable default
(app/src/config.ts, artifacts.autoOpen), not law — turning it off must never
change what a card click does.

Pages architecture (Phase 8H, supersedes Phase 8G's workbench/pane-rail
model — the index-pane CONTENT survives, rehomed as page content; the
rail-of-toggleable-panes mechanism does not). Routing law, amended and
binding on every page and every future one: "Left nav = places; the
artifact pane = the one overlay; investigations always land there; pages
never host scene renders." A scene is rendered in exactly one place in
this entire app: the artifact stack. No page ever mounts SceneRenderer or
Canvas directly — a page that wants to show what an investigation found
links to it (an Investigate action, a stack row), it never reproduces it
inline.

Unified workbench title bar (direct order, 2026-07-29). One title bar —
`PaneTitleBar`, a genuinely shared component, not three independently
hand-tuned bars kept matched by convention (`HomeTopBar`/`PageShell`
previously carried the identical flex/padding block in two files, their
own comments admitting as much) — runs the full row width above every
page, mirroring the placement Home's own top bar already used ("runs the
full row width... a sibling of the row below, not nested inside its
narrower content column"), now generalized past Home to every place.
Right side is contextual, composed via `WorkbenchTitleBar`: Home (the one
"investigation" place — its own transcript/trail lives there) keeps
Artifacts only; every other page gets a Chat toggle next to it —
`ChatPaneControl`, the same reveal/close pattern `ArtifactStackControl`
already established, now available everywhere per the routing law's own
"Artifacts is the ONLY pane, global across every page" standing rule,
extended to the transcript pane too. Opening chat on a page that hasn't
started an investigation yet (no `hasStarted`) is a genuinely new
capability, not previously possible — it's what lets Entity Detail's Chat
toggle (see below) work from a cold state.

Entity Detail (Phase 16, denser revision same day) is a place reached by
content click-through (Discover's grid cards, an "Other tracked entities"
row, a Related card) rather than left-nav, but the routing law still
governs it exactly the same way: it renders entity facts (Trend/
Statistics/About/Coverage, authored the same way a static dashboard page
is — no SceneRenderer, no scene), never a scene, and its own scoped
Investigations panel is itself a set of links into the one artifact
stack, never an inline reproduction of what those investigations found.
"Browse first, investigate second": a Discover card's click always lands
here now, regardless of whether the entity carries an investigation
intent. Its title bar's Chat toggle (2026-07-29, see the unified
workbench title bar law above) replaces what used to be a one-click
canned-intent Investigate action here — opening chat invites a real,
typed question instead of firing the entity's authored `intent` string
sight-unseen; a returning analyst can still type exactly that phrase if
they want the same investigation. Register law, restated for this page specifically:
News/Stats/Compare is the SeekingAlpha register, not the Kraken one — no
trade/buy-sell surface anywhere on it, ever; a directional chart line or
a plain metric is a fact, not an invitation to transact. Related/Compare
cards are venue peers or sector peers (same tag or same venue), a lighter
echo of an entity's identity than entity-header itself, not the node
reused verbatim — click browses to that entity's own page, same law.

**Page-section gap law (2026-08-10, architect-ordered, system-wide):**
`--space-16` is the ONE documented gap between top-level sections within a
page's content — the space between "Notable movers" and "Discover Assets"
on Discover, between "Trend"/"Statistics"/"About" on Entity Detail, between
metric-grid/ring-gauge/bar-series rows on Portfolio/Risk. Found
undocumented and drifted: `PageShell.module.css`'s `.paneBody` (Discover,
Entity Detail, Watchlist, Data Sources — every page that renders through
`PageShell`) had independently authored `--space-24`, never compared
side-by-side against `DashboardLayout.tsx`'s own Astryx `Grid gap={4}`
(Portfolio/Risk, = 16px) or `SceneGrid.tsx`'s identical `Grid gap={4}`
(every investigation artifact's own top-level layout) until reported live
("gap between pains [sections]... needs to be the same as... Portfolio...
global system wide gap size which needs to be documented"). Fixed to
`--space-16` everywhere — `DashboardLayout`/`SceneGrid` needed no change,
already correct by construction; `PageShell.module.css`'s `.paneBody` was
the one outlier, corrected to match. Any new page-level content wrapper
uses `--space-16` for this purpose — this is now the standing decision,
not a per-page judgment call.

**Proactive sweep, 2026-08-13** (`merlin-layout-law` skill, closing the
reactive-discovery gap this law's own four earlier rounds exposed — each
prior violation was found only after Prem reported it, one component at a
time): grepped every `gap:`/`Grid gap={N}` in `components/shell/` and
`components/nodes/` for the same relationship (sibling top-level sections/
cards) rather than waiting for each to surface independently. Found and
fixed three more: `InvestigationsPage.tsx`'s module-group wrapper (was
`--space-24`), `MarketPulsePage.tsx`'s card grid (was `gap={3}`/12px), and
`LandingState.tsx`'s suggestion-chip grid (was `gap={3}`/12px — this one
confirmed in scope specifically because it's documented elsewhere as "an
echo of Market Pulse's same data source," so the two renderings of the
same content needed to match; its `minWidth` was re-derived from 200px to
210px for the new gap math, live-verified via computed
`grid-template-columns`, not guessed). Two false positives correctly
excluded on inspection, not swept blind: `Transcript.tsx`'s `--space-24`
governs vertical space between conversation turns (a different register —
chat history rhythm, not sibling page sections) and `EntityDetailPage.tsx`
line 119's `--space-24` is a gap WITHIN one section (Statistics/About
sub-columns), not between top-level siblings — both left untouched.
`StatusGrid.tsx`'s `gap={3}` also excluded: a registry node's dense
status-row grid, the same denser register as `RelatedEntitiesStrip.tsx`'s
already-excluded `--space-12`, not this law's relationship.

Left nav (Sidebar) is now the app's primary navigation, not a
turn-history list — it names PLACES: New investigation (resets the
session outright, including the artifact stack — no confirm dialog,
nothing persists to lose by design, the reassurance lives in the empty
state's own copy, not a modal), then Investigations / Entities /
Watchlist / Data Sources, then a Recent list (the last few turns, a
filter control, "view all" into the Investigations page), then a static
identity chip and a notification bell (badge = alert-module turns whose
artifact has never been opened; hidden at zero; click jumps to
Investigations, module-grouped view, scrolled to Monitor). A Workflows
nav entry is deliberately absent until Phase 11 ships it — no nav entry
points at nothing.

Nav auto-collapses (2026-08-17, direct feedback) on either of two
triggers: navigating to any non-Home page pane, or the artifact pane
opening. Rising-edge only — it collapses on the TRANSITION into either
condition, not continuously while true, so a manual re-expand via the
existing collapse button sticks until the next distinct trigger (a new
page navigation, or the artifact pane opening again after being closed).
This does not reopen or change the underlying manual-toggle mechanism
(`Sidebar.tsx`'s own local `isCollapsed` state, still user-controlled) —
it only forces one additional transition at each of those two moments.

Home is the investigation surface — transcript (oldest first, user right
/ agent left, unchanged from the v2 model) plus the composer, plus its
own top bar: the current artifact's title on the left, the artifact
stack's open/count control on the right (hidden until the first artifact
exists). Every other page (Investigations, Entities, Watchlist, Data
Sources) replaces Home's own content area entirely while reusing the
exact same left nav and the exact same artifact stack on the right — the
stack is global, not Home-local; investigating an entity from the
Entities page still lands its result in the stack without leaving that
page.

The artifact stack is the one place a scene ever renders. It has two
sub-views: a list (every artifact this session — title, one-line origin,
a version chip, a status tag; the currently active one marked) and a
detail view (the scene itself, exactly as ArtifactPanel rendered it,
"Back to list" instead of a close button — closing the whole stack is
the top-bar control's job, not a per-artifact action). Opening any
artifact — autoOpen, a stack row, an Investigate action anywhere, a
pushed alert — always switches the stack to detail on that artifact;
every one of those paths is the same store action, never a
parallel mechanism. Versions are session lineage, not persistence: a
refine turn shares its parent's scene family (today: a scene id's
`-refine` suffix) and versions within that family are numbered by turn
order — display grouping only, computed live, nothing is written to
disk.

Investigations absorbs the old Sidebar/History content verbatim, offered
as two views of the same data: module-grouped (Discover, Research,
Investigate, Monitor, Portfolio, fixed order, a group exists only once
it has a turn — Monitor renders the moment an alert lands, Portfolio is
a forward reference same as entity-graph/geo-panel before Phase 7) and
flat (every turn, newest first). A row's status dot names what happened
to that turn: answered, alert (Monitor-module), no match — never color
alone. No-match turns collect in their own always-last "Unresolved"
group in module view (they don't fit any module by definition) and sit
inline in flat view. Entities (Phase 14: relabeled "Discover" in the nav
— same page/route, upgraded content; distinct from the "Discover" scene
module named two paragraphs up, a naming coincidence worth flagging, not
a shared mechanism) opens with three real strips reusing signal-feed's
own row craft — Notable movers (ranked by size of move, not direction —
a drop is just as notable as a gain), Recently cited (a live citation
counter over this session's turns, same honesty rule as Data Sources'
own: zero until a real trail cites it, never seeded), Newly added to
universe (session-fixed, styled identically to the other two but not a
real recency signal — this universe carries no authored "added on" date)
— then a filterable card grid (dashboard-layout, one sparkline + yield +
a directional delta per card, plus deterministic mocked filler rounding
every category to 12 cards for browsing density — fictional, no
`intent`, never resolves to an investigation) for the entities that
carry genuine price/yield history, and finally the original plain list
— Watch action and, where an investigation intent exists, an Investigate
action — for every other universe entity. Every strip/grid row hovers,
even the ones with nothing to click — an honest "this is legible and
scannable" affordance, never cursor-driven, so it doesn't imply an
action that isn't there. Register law, verbatim, binding on this page:
no Buy/Sell/Trade action anywhere, no wallet-connect affordance, no
price-action framing as an invitation to transact — a delta is a fact
(principle 2, "facts register"), never a call to action; that is what
distinguishes this page from every dashboard screenshot in its genre.
A plain directional indicator (an up/down arrow, colored via the
existing ok/alert accent tokens) is not itself a violation of that
law — it's still a fact, not a CTA — the line is a Buy/Sell button or a
wallet prompt sitting beside the number, not the number's own color.
Watchlist holds seeded entities (fictional statuses authored in the
universe) plus anything watched this session — from an entity-header, an
Entities row, or automatically once an alert turn lands — session-scoped,
stated in its own empty state, not a modal. Data Sources (Phase 8H WO-1)
ships as Sources' content unchanged: every universe source with an
honest "cited in N investigations this session" counter, zero until a
real trail cites it, never seeded — WO-2 adds a public-catalog section
and a mock connect flow on top, not a replacement of this.

Holdings (Phase 15) is the ONE sanctioned wallet-connect surface in the
app — the "no wallet-connect affordance" line two paragraphs up is
Discover/Asset Discovery's own scoped rule (Phase 14), not a blanket ban;
Holdings is where that affordance deliberately lives, nowhere else.
Empty until at least one wallet is connected (session-scoped state gates
content, same discipline as Watchlist's own empty state) — connecting is
a mock flow (`ConnectWalletDialog`), architecturally identical to Data
Sources' own mock-connect (Phase 8H WO-2): select a wallet row →
permissions summary → confirm → holdings appear, session-scoped, nothing
persists after a reset, stated in both the page body and the dialog
itself. Once connected, a wallet's holdings render via existing nodes
only (`data-table` with entity/sparkline cell types, `metric-grid` for
the aggregate total) — no new registry node. A holding's quantity/price/
value is a FACT (principle 2, permanent register), not reasoning or a
recommendation. EXPLICITLY EXCLUDED, same law as Discover's own grid: no
Buy/Sell/Trade/Send/Receive CTA anywhere on this page — this is a
holdings VIEW, not a wallet app; a plain fact (quantity, price, value) is
never itself a call to action, but no action control sits beside it
either.

Market Pulse (Phase 8I) is the agent's own surfaced-but-not-yet-
investigated observations — authored per-session in universe data, never
live-generated, positioned after Data Sources and before Investigations:
a step between the reference pages and the investigated record.
LandingState's suggestion chips are a 2-3 card echo of this same data
(single source, two renderings), never separately authored content.
Register law, verbatim, binding on this page and Home's own suggestion
chips alike: "Surfaced (Market Pulse: agent-authored, no evidence, no
trail) vs Investigated (has run the reasoning loop, has confidence) are
different registers and never share a row style." A card never leaves
Market Pulse once surfaced, investigated or not — it's a record of what
was surfaced, not a queue that empties. Clicking a surfaced card starts a
real investigation through the existing submitQuery path; clicking an
already-investigated one opens its artifact instead of asking the same
question twice — the resulting turn lands in Investigations exactly like
any other. Content law, verbatim (architect-ordered correction,
2026-07-12): "Cards are signals, not capabilities — headline + stake,
never an action description. What-needs-action lives in the assembled
investigation's recommendation, not the card." A card's `headline` names
what happened, past tense, specific; its `stake` says why it matters,
never what to do about it. An optional `persona` tag (`analyst` |
`risk-officer`) is authored per card, data-ready only — nothing filters
on it yet.

Pane placement law (direct order, 2026-07-29). Not a fixed side (chat-left
vs chat-right is not a rule Merlin follows — industry precedent is genuinely
split, e.g. Claude/ChatGPT anchor chat left, this product anchors it
differently and both are legitimate). The actual rule is directional, not
positional:

- ANCHOR (transcript/chat): stays where it is. It is the constant the
  user's attention already lives in; it never moves to make room for
  anything else.
- OUTPUT (artifact): opens immediately ADJACENT to the anchor — closest,
  because it is what the anchor just produced. Today this is to the
  anchor's right; the direction itself is not the law, adjacency is.
- CONTEXT (entity pages, index pages, any supporting view): opens
  BEYOND the output, further from the anchor — and is the first to
  recede/collapse (per the pane-collapse mechanism) when space runs out,
  because it is supporting material, not the active thread.

Any new pane type is placed by asking which of the three roles it plays
— anchor, output, or context — never by picking a side from habit. A
fourth simultaneous need is a signal to collapse the outermost context
pane first, never to compress the anchor or the output.

## Trail vocabulary (Phase 6 — engine components, NOT registry nodes)
The reasoning surface is streamed by the trail player; scenes cannot lay it out.
Design intent, same standing as the nodes above:

**ThinkingTrail** — "what is the agent doing right now?" The container: steps
appear on the player's clock, active step visibly alive, completed steps settle.
Skippable by click. Reads as work being done, never as a fake chat transcript.
Connected git-log-style vertical timeline (direct order, 2026-08-10) — a single
rail runs through the center of every step icon, first step to the trail's own
terminal "Done" row (a synthetic, client-only settled step ThinkingTrail itself
appends once complete — never persisted, never validated against a scene
fixture). Once complete, the whole trail is still an Astryx Collapsible with
the "N reasoning steps · X.Xs" summary, unchanged — the count excludes Done,
which is a terminal marker, not a reasoning step.

**StepRow** — one atomic reasoning action, present-continuous label, optional
one-line detail. **Icon SUPERSEDED, 2026-08-10, direct order**: was "kind icon
(plan/search/retrieve/correlate/synthesize/verify), not a status icon — our
steps don't have a failure state, and kind is the meaningful fact here." Now a
STATUS icon — clock while active, check once settled — to read as a real
progress timeline against the new connecting rail; a kind icon on a git-log
node answers the wrong question once the rail exists. Kind itself is
unchanged and still governs everything else about a step (label voice, which
node renders below it), just no longer the icon. **Motion SUPERSEDED, same
order**: was "active state = the only animated thing on screen at that moment
(principle 5)," absolute. Now principle 5 governs StepRow's own rows only — a
new, separate persistent pulse (ThinkingIndicator, below) runs continuously
for the trail's whole active lifetime, simultaneously with whichever row is
mid-settle. A deliberate, scoped exception, not a blanket repeal: nothing
else on the trail gained motion, and settled rows still carry none.

**ThinkingIndicator** — new, 2026-08-10. A persistent "Thinking…" label above
the step rows, pulsing continuously (reuses StepRow's own settle-pulse
keyframe/duration/easing verbatim) for as long as the trail is running;
absent once complete. The one place in this vocabulary where motion is
deliberately NOT scoped to a single active element — see StepRow's motion
amendment above.

**SearchResultsCard** — new, 2026-08-10, `search`-kind steps only. An
expandable, scrollable card of mock web-search results (logo placeholder +
title + domain per row, "N results" count) rendered below a search step's
label. Populated from `ThinkingStep.webResults` (contracts/thinking.ts), a
field wholly separate from `sources`/SourceChip below — mock/placeholder data
for now (engine/mockSearchResults.ts), intended to become a real per-scenario
web-search integration later without changing this card's own shape.
Explicitly NOT a SourceChip variant and does not touch SourceChip's own
"identical everywhere" guarantee (next entry) — a different register (an
external web citation, not an internal system) with a different rendering,
scoped to this one surface.

**SourceChip** — the canonical visual representation of every source system,
wherever cited: trail steps, panel attributions, recommendations. Identical
rendering everywhere — users should recognize a source by its chip before reading
its name. Chips are the provenance language of the whole product. Unchanged
by SearchResultsCard above — `sources`/SourceChip cites internal system
provenance (MarketTape, RiskLens); SearchResultsCard/`webResults` cites
external web pages. Two registers, never merged.

**ConfidenceBadge** — the trail-side sibling of confidence-meter: compact value +
qualifier on synthesize/verify steps. Same instrument register, smaller form.

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
- Entity links (Phase 8F): a `data-table`/`signal-feed` cell may name a known,
  investigable entity — authored as `{entityId, label}` on an `"entity"`-typed
  column, never on every entity mention in every node (comparison headers,
  entity-header's own name, and free-form text-block/recommendation prose stay
  plain text; this is not a general entity-detection pass, only these two
  nodes' cells). Facts register (principle 2): no color, no permanent
  decoration — underline appears on hover only, emphasis is earned (principle
  8). Click submits that entity's investigation via the existing `submitQuery`
  path, landing as a normal turn — same mechanism as typing the question.
  Only entities that genuinely carry an investigation intent
  (`universe/entities.json`) are ever authored this way, so a link never
  points nowhere.
