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

// Portfolio wiring order (2026-07-25): aggregate derivatives exposure
// trend for the Portfolio dashboard's own risk-limit context. Endpoint
// pinned to €21M — the real, already-authored "Aggregate exposure" figure
// (PortfolioDashboardPage.tsx / risk-desk-dashboard.scene.json) — so the
// chart agrees with the metric/ring-gauge quoting the same fact elsewhere
// on the page. Start value (€15M) is an authored extrapolation, not
// sourced from any existing fact: a plausible pre-buildup level consistent
// with eur-5y-irs/usd-10y-irs (the two positions already on the book
// before this window) totaling €14M, logged here rather than left
// unstated. Same Brownian-bridge shape as the yield-volatility series,
// scaled noise for a €M-magnitude value.
const PORTFOLIO_EXPOSURE_SERIES = {
  key: "portfolio-exposure-90d",
  label: "Aggregate exposure",
  start: 15,
  end: 21,
  noiseScale: 0.6,
};

// South Bow Corp price/volume (recovered 2026-07-25): the original
// series was generated ad hoc during Phase 16 and never added to this
// committed script — an accidental `git checkout` on the working-tree-
// only datasets.json (this repo has exactly one initial commit; every
// phase since has lived uncommitted) wiped it, and the exact original
// values/seed are unrecoverable. Regenerated here for real, closing that
// original gap rather than re-creating it: every value below is either a
// REAL fact this codebase quotes elsewhere (end price $40.34 — entities
// .json's own "Latest price"; the prior day's $40.26, giving the
// documented "+0.08 delta"; the 2026-06-21 capacity-expansion-filing
// spike, +4.5% day-over-day to $42.93 with volume 1.2M→3.35M and a
// partial fade over the following week — all per STATE.md's Phase 16
// revision entry) or an explicit, disclosed extrapolation (start price,
// baseline volume, and the day-to-day noise shape — none of these were
// ever quoted as facts elsewhere, so nothing is lost by re-choosing them).
function applyPinnedOverrides(points, overridesByDate) {
  return points.map((point) => (point.x in overridesByDate ? { x: point.x, y: overridesByDate[point.x] } : point));
}

const SOUTH_BOW_START_PRICE = 36.5; // extrapolated
const SOUTH_BOW_END_PRICE = 40.34; // real: entities.json "Latest price"
const SOUTH_BOW_PRIOR_DAY_PRICE = 40.26; // real: gives the documented +0.08 delta exactly
// date -> [price, volume in millions of shares] — the capacity-expansion
// -filing spike and its partial fade, pinned in full (narratively
// significant, same precedent as NORDBOND_VOLUME_PINNED above).
const SOUTH_BOW_SPIKE = {
  "2026-06-18": [40.6, 0.9],
  "2026-06-19": [40.7, 0.95],
  "2026-06-20": [41.09, 1.2],
  "2026-06-21": [42.93, 3.35],
  "2026-06-22": [42.4, 2.1],
  "2026-06-23": [42.0, 1.6],
  "2026-06-24": [41.7, 1.3],
  "2026-06-25": [41.5, 1.1],
};

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

  const { key, label, start, end, noiseScale } = PORTFOLIO_EXPOSURE_SERIES;
  datasets[key] = {
    kind: "series",
    series: [{ id: "exposure", label, points: generateDailySeries(key, START, END, start, end, noiseScale) }],
  };

  const priceOverrides = Object.fromEntries(Object.entries(SOUTH_BOW_SPIKE).map(([date, [price]]) => [date, price]));
  const volumeOverrides = Object.fromEntries(Object.entries(SOUTH_BOW_SPIKE).map(([date, [, volume]]) => [date, volume]));
  const pricePoints = applyPinnedOverrides(
    generateDailySeries("south-bow-corp-price-volume-90d:price", START, END, SOUTH_BOW_START_PRICE, SOUTH_BOW_END_PRICE, 0.5),
    priceOverrides,
  );
  // Endpoint delta is a quoted fact ("+0.08"), not left to the bridge's
  // own noise draw — forced exact regardless of what the generator chose.
  pricePoints[pricePoints.length - 2] = { x: pricePoints[pricePoints.length - 2].x, y: SOUTH_BOW_PRIOR_DAY_PRICE };
  pricePoints[pricePoints.length - 1] = { x: pricePoints[pricePoints.length - 1].x, y: SOUTH_BOW_END_PRICE };
  const volumePoints = applyPinnedOverrides(
    generateDailySeries("south-bow-corp-price-volume-90d:volume", START, END, 0.8, 0.9, 0.15).map((p) => ({
      x: p.x,
      y: Math.max(0.3, Math.round(p.y * 100) / 100),
    })),
    volumeOverrides,
  );
  datasets["south-bow-corp-price-volume-90d"] = {
    kind: "series",
    series: [
      { id: "price", label: "Price (USD)", points: pricePoints },
      { id: "volume", label: "Volume (M shares)", points: volumePoints },
    ],
  };

  writeFileSync(DATASETS_PATH, `${JSON.stringify(datasets, null, 2)}\n`);
  console.log(
    `Regenerated ${YIELD_VOLATILITY_SERIES.length} daily yield/volatility series + confirmed the pinned volume series + wrote ${key} + wrote south-bow-corp-price-volume-90d.`,
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
