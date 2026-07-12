---
name: merlin-scene-authoring
description: Creating or editing Merlin scene JSON. Trigger on "new scene", "scene file", "convert this narrative", "add intents", "thinking trail for", or any fixture work in scenes/.
---

# Scene authoring — procedure

Guardrails and CLAUDE.md apply. Narrative provided by Prem is content, not a suggestion — do not invent beyond it; where data must be extrapolated, keep it consistent with the narrative and flag additions in the report.

## 1. Identity
- `id` kebab-case, `title` human. `intents`: 5–8 entries — canonical phrase + natural variants + 1–2 keyword fragments (how someone actually types: "show me…", "what's happening with…").

## 2. Thinking trail
- 5–8 steps. Kind arc: `plan → search → retrieve → (correlate) → synthesize → verify`. Never open with synthesize.
- `durationMs` 600–1800 per step, 6–10s total. Vary durations — uniform timing reads fake.
- `label` = active voice, present continuous, specific ("Correlating login anomalies against known infrastructure…"). `detail` optional, one line.
- `sources` on search/retrieve steps: named fictional systems pulled from `universe/` — never invent per-scene sources; extend the universe instead.
- `confidence` on synthesize and verify only. Not 0.9-everything — vary honestly; an 0.72 is more credible than three 0.95s.

## 3. Data
- Universe first: shared entities, sources, and datasets live in `universe/*.json` under global keys; scenes reference them via `{ "$ref": "<key>" }`. Author or extend the universe BEFORE the scene; scene-local color (one-off values) may stay inline.
- Every payload in `data` is keyed and either a `DataSet` shape or a $ref. Nodes reference via `bind`, never inline.
- Literal metric/status/confidence props (metric, metric-grid, status-tag, confidence-meter, filter-summary — these take authored props, not `bind`, by design; `recommendation` also takes authored props but is generated interpretation, exempt from literal restatement) that restate a fact also present in entity/table data must match it exactly. Cross-check by hand at authoring time; there is no schema enforcement for this.
- Internal consistency is the quality bar: metric values must equal what the table/series would sum to; dates coherent; entities appearing in two panels carry identical names/ids.
- Specificity over volume: 8 rows of specific data beat 40 rows of filler.
- `comparison` binds a transposed table: rows = dimensions, columns = entities (2-3 per node-vocabulary.md).

## 4. Layout + choreography
- Root `scene-grid`. `reveal` indexes choreograph assembly: headline metrics first, evidence panels next, detail/graph last — the interface should appear to conclude, then substantiate.
- Reveal indexes unique and gapless (0,1,2…).

## 5. Register + gate
- Add to `manifest.json`. `vitest run` green (schema parse + any consistency tests). Load scene in the playground story; play the trail once — if pacing drags or snaps, adjust durations, not the player.

## Done report
Scene id · intents added · trail length/total ms · data payloads · anything extrapolated beyond the narrative.
