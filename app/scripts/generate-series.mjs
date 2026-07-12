#!/usr/bin/env node
// Deterministic seeded series generator (Phase 8E) — committed, not
// ad-hoc: re-running this script reproduces byte-identical output for
// the same inputs, so the daily-resolution series it writes into
// universe/datasets.json are a real, regeneratable artifact, not a
// one-off hand edit. Endpoints (and, where a series' shape is itself
// narratively significant, every point) are pinned; only the values
// between pinned points are generated.
//
// Run: node app/scripts/generate-series.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATASETS_PATH = join(__dirname, "..", "universe", "datasets.json");

// mulberry32: small, fast, deterministic PRNG — no dependency needed for
// a one-file seeded generator.
function mulberry32(seed) {
  let state = seed;
  return function next() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (Math.imul(31, hash) + text.charCodeAt(i)) | 0;
  }
  return hash;
}

function dateRangeDaily(startISO, endISO) {
  const dates = [];
  let cursor = new Date(`${startISO}T00:00:00Z`);
  const end = new Date(`${endISO}T00:00:00Z`);
  while (cursor <= end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor = new Date(cursor.getTime() + 86400000);
  }
  return dates;
}

// Brownian-bridge random walk: seeded noise, then linearly corrected so
// the series starts at exactly startValue and ends at exactly endValue
// regardless of the noise draw — pinned endpoints, generated middle.
export function generateDailySeries(seed, startISO, endISO, startValue, endValue, noiseScale) {
  const rng = mulberry32(hashSeed(seed));
  const dates = dateRangeDaily(startISO, endISO);
  const count = dates.length;
  const raw = [0];
  for (let i = 1; i < count; i += 1) {
    raw.push(raw[i - 1] + (rng() - 0.5) * noiseScale);
  }
  const rawEnd = raw[count - 1];
  return dates.map((x, i) => {
    const t = i / (count - 1);
    const drift = startValue + (endValue - startValue) * t;
    const correctedNoise = raw[i] - rawEnd * t;
    return { x, y: Math.round((drift + correctedNoise) * 100) / 100 };
  });
}

// Every value in this series is narratively significant — the specific
// spike/dip shape is what "position-building ahead of an expected yield
// event" and the two settlement failures (07-06, 07-08) actually mean —
// so it's pinned in full rather than generated. Still routed through
// this committed script (not a separate hand-authored file) so the
// whole dataset has one reproducible source, per this order's own
// "endpoints and named narrative values pinned."
const NORDBOND_VOLUME_PINNED = [
  { x: "2026-06-29", y: 12 },
  { x: "2026-06-30", y: 14 },
  { x: "2026-07-01", y: 13 },
  { x: "2026-07-02", y: 22 },
  { x: "2026-07-03", y: 15 },
  { x: "2026-07-04", y: 28 },
  { x: "2026-07-05", y: 34 },
  { x: "2026-07-06", y: 18 },
  { x: "2026-07-07", y: 30 },
  { x: "2026-07-08", y: 16 },
];

// Endpoints below are pinned to the exact first/last values from the
// original weekly-resolution series (Phase 2 log: "pinned to the
// canonical yield 5.8/7.2/9.1/6.4" for the last point) — the last value
// of each yield series is quoted verbatim elsewhere in fixture text
// (asset-discovery's candidate table/recommendation), so regenerating
// must never move it. First values read directly from the pre-existing
// datasets.json before this script touched it, not approximated.
const YIELD_VOLATILITY_SERIES = [
  {
    key: "nordbond-2029-yield-volatility-90d",
    yield: { start: 5.7, end: 5.8 },
    volatility: { start: 1.2, end: 1.1 },
  },
  {
    key: "aldergate-estates-yield-volatility-90d",
    yield: { start: 6.9, end: 7.2 },
    volatility: { start: 2.6, end: 3.0 },
  },
  {
    key: "helios-yield-fund-yield-volatility-90d",
    yield: { start: 8.6, end: 9.1 },
    volatility: { start: 5.4, end: 7.2 },
  },
  {
    key: "vantara-metals-yield-volatility-90d",
    yield: { start: 6.0, end: 6.4 },
    volatility: { start: 4.1, end: 5.0 },
  },
];

const START = "2026-04-09";
const END = "2026-07-02";

function main() {
  const datasets = JSON.parse(readFileSync(DATASETS_PATH, "utf-8"));

  for (const series of YIELD_VOLATILITY_SERIES) {
    const target = datasets[series.key];
    if (!target) throw new Error(`Missing dataset key: ${series.key}`);
    target.series = [
      {
        id: "yield",
        label: target.series[0].label,
        points: generateDailySeries(`${series.key}:yield`, START, END, series.yield.start, series.yield.end, 0.35),
      },
      {
        id: "volatility",
        label: target.series[1].label,
        points: generateDailySeries(`${series.key}:volatility`, START, END, series.volatility.start, series.volatility.end, 0.25),
      },
    ];
  }

  const volumeTarget = datasets["nordbond-2029-volume-spikes"];
  if (!volumeTarget) throw new Error("Missing dataset key: nordbond-2029-volume-spikes");
  volumeTarget.series = [{ id: "volume", label: volumeTarget.series[0].label, points: NORDBOND_VOLUME_PINNED }];

  writeFileSync(DATASETS_PATH, `${JSON.stringify(datasets, null, 2)}\n`);
  console.log(`Regenerated ${YIELD_VOLATILITY_SERIES.length} daily yield/volatility series + confirmed the pinned volume series.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
