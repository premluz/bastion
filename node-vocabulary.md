# MERLIN — Node vocabulary
Status: DRAFT. This is design intent, not implementation spec — one entry per node:
the question it answers, what it looks like at a glance, register notes. Sonnet reads
this at Phase 3/7 alongside the merlin-new-node skill; components built without a
"why" become dashboard furniture, which is what this file prevents. Edit freely.

## Principles (every node must satisfy these)
1. Conclude, then substantiate: headline findings reveal first, evidence after —
   the trail has already shown the reasoning; the scene is the decision surface.
2. Facts are permanent. Reasoning is active. Recommendations are provisional.
   These three never share a visual register. Three-voice typography (Phase
   8E, ◆ ratified): facts render in the UI/data faces; the agent's
   interpretive prose (findings, recommendations) renders in the voice
   face. The voice face is allowed ONLY in text-block and recommendation
   prose — never numerals, never labels, never data.
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
with direction. Big numeral, quiet label. A metric elevates the single most important fact for
the current question — its prominence is earned by the agent's reasoning, not by
the data model.

**metric-grid** — "what are the vital signs?" 2–4 metrics as one gestalt read.
Equal visual weight per cell; if one metric matters more, it's a `metric`, not a
grid member.

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

**comparison** — "which one, and on what grounds?" 2–3 entities side by side
across shared dimensions (yield, risk, liquidity, jurisdiction). Column-per-entity,
dimension rows; differences carry the emphasis, similarities stay quiet. This is
Scene 1's decision-support core.

**confidence-meter** — "how sure is the agent?" A 0–1 value rendered as a
restrained horizontal gauge + numeral, with one-word qualifier (low/moderate/high).
Never a gimmick dial — it's the trust architecture made visible, and it must look
like an instrument, not a game HUD. Appears beside conclusions, never decorating
raw data (data isn't confident; the agent is).

## Shell (Phase 5 — frame components, NOT registry nodes; intent only, design at
Phase 5; v2 model — Phase 8B WO-2/WO-3, architect-ratified via STATE.md;
sidebar — Phase 8C, architect-ratified via STATE.md)
The landing surface is the question, not a project browser — investigation-first,
never workspace-first. This is the one law that predates and survives the v2
model unchanged: LandingState opens on a centered question + composer + a
handful of real-intent suggestions, nothing resembling a dashboard.

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
inline in flat view. Entities lists every universe entity with a Watch
action and, where an investigation intent exists, an Investigate action.
Watchlist holds seeded entities (fictional statuses authored in the
universe) plus anything watched this session — from an entity-header, an
Entities row, or automatically once an alert turn lands — session-scoped,
stated in its own empty state, not a modal. Data Sources (Phase 8H WO-1)
ships as Sources' content unchanged: every universe source with an
honest "cited in N investigations this session" counter, zero until a
real trail cites it, never seeded — WO-2 adds a public-catalog section
and a mock connect flow on top, not a replacement of this.

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

## Trail vocabulary (Phase 6 — engine components, NOT registry nodes)
The reasoning surface is streamed by the trail player; scenes cannot lay it out.
Design intent, same standing as the nodes above:

**ThinkingTrail** — "what is the agent doing right now?" The container: steps
appear on the player's clock, active step visibly alive, completed steps settle.
Skippable by click. Reads as work being done, never as a fake chat transcript.

**StepRow** — one atomic reasoning action: kind icon, present-continuous label,
optional one-line detail. Active state = the only animated thing on screen at
that moment (principle 5).

**SourceChip** — the canonical visual representation of every source system,
wherever cited: trail steps, panel attributions, recommendations. Identical
rendering everywhere — users should recognize a source by its chip before reading
its name. Chips are the provenance language of the whole product.

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
