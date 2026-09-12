import { z } from "zod";

// Unhydrated reference into universe/*.json, resolved by the intent
// resolver before a Scene reaches the renderer. See CLAUDE.md §6.
export const UniverseRefSchema = z.object({
  $ref: z.string().min(1),
});
export type UniverseRef = z.infer<typeof UniverseRefSchema>;

const TableColumnSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(["string", "number", "boolean", "date", "sparkline", "entity"]),
});

// sparkline (Phase 8E): a cell may carry an inline trend instead of a
// scalar — DataTable renders it via the sparkline node's own component
// (same reuse precedent as StatusTag/EntityHeader), never a second
// number/string reading of the same data.
const SparklineCellSchema = z.array(z.object({ x: z.string().min(1), y: z.number() }));
// entity link (Phase 8F): a cell may name a known, investigable entity
// instead of a bare label — only entities that genuinely carry an
// investigation intent (universe/entities.json) are ever authored this
// way, so a rendered link never points nowhere ("no dead controls").
const EntityLinkCellSchema = z.object({ entityId: z.string().min(1), label: z.string().min(1) });
const TableCellSchema = z.union([z.string(), z.number(), z.boolean(), z.null(), SparklineCellSchema, EntityLinkCellSchema]);

export const TableDataSetSchema = z.object({
  kind: z.literal("table"),
  columns: z.array(TableColumnSchema).min(1),
  rows: z.array(z.record(z.string(), TableCellSchema)),
});
export type TableDataSet = z.infer<typeof TableDataSetSchema>;

// entityId (Portfolio wiring order, 2026-07-25): a point may name a known,
// investigable entity, same precedent as EntityLinkCellSchema above — a
// chart category (e.g. a bar's x-label) can link out exactly like a table
// cell does. Optional, so every existing series fixture stays valid
// unchanged; only bar-series' bars currently read it.
const SeriesPointSchema = z.object({
  x: z.string(),
  y: z.number(),
  entityId: z.string().min(1).optional(),
});

const SeriesLineSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  points: z.array(SeriesPointSchema),
});

export const SeriesDataSetSchema = z.object({
  kind: z.literal("series"),
  series: z.array(SeriesLineSchema).min(1),
});
export type SeriesDataSet = z.infer<typeof SeriesDataSetSchema>;

// Bastion fork note: Merlin's `graph`/`geo` DataSet kinds (backing
// entity-graph/geo-panel, both pruned — no plausible reuse identified for
// a wallet app, see CLAUDE.md §10) were removed here rather than carried
// forward unused. If a future phase needs a relationship graph or a
// spatial panel, restore from git history rather than re-authoring blind.

const EntityAttributeSchema = z.object({
  label: z.string().min(1),
  value: z.union([z.string(), z.number()]),
});

// Bastion fork note: Merlin's optional `derivative` sub-shape (FX/rates
// counterparty-position fields — CLAUDE.md §6) was removed here — it was
// risk-desk-specific and nothing in Bastion's kept node set reads it. If
// a future phase needs it, restore from git history rather than
// re-authoring blind.
export const EntityDataSetSchema = z.object({
  kind: z.literal("entity"),
  entity: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    type: z.string().min(1),
    attributes: z.array(EntityAttributeSchema),
    tags: z.array(z.string()).optional(),
  }),
});
export type EntityDataSet = z.infer<typeof EntityDataSetSchema>;

// entity-cards (Phase 21, 2026-08-30): N entities, each with a price/yield
// read and a directional delta — the shape `asset-card-grid`'s registry
// node needs to drive AssetCardVisual (shell/AssetCardVisual.tsx) from
// Scene JSON. A NEW DataSet kind, not an extension of `table`: table's
// cells are typed per-COLUMN (TableColumnSchema.type), but every row here
// needs the SAME fixed set of fields (id/name/type/value/delta) rather
// than an author-defined column set — forcing that through table's
// column/row shape would mean one hardcoded column layout invented per
// scene, which is exactly the coupling DataSet kinds exist to avoid.
// `value` arrives PRE-FORMATTED (the scene author decides "$1,234.56" vs
// "5.8%"), matching AssetCardVisual's own formattedValue prop — this
// node has no opinion on currency/percent formatting, same reason
// EntityAssetGrid's own MarketAsset→row mapping formats before handing
// off (EntityAssetGrid.tsx's own assetToCardRow).
const EntityCardRowSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  value: z.string().min(1),
  deltaPercent: z.number(),
});

export const EntityCardsDataSetSchema = z.object({
  kind: z.literal("entity-cards"),
  entities: z.array(EntityCardRowSchema).min(1),
});
export type EntityCardsDataSet = z.infer<typeof EntityCardsDataSetSchema>;

// One point per entity on two genuinely numeric axes (2026-09-01,
// risk-return-scatter — "7D Return" vs "Volume"). A separate kind, not a
// widened SeriesPoint: every existing series consumer (BarSeries,
// ContributionBars, GeoPanel, TimeSeries, TrendChart) treats x as a
// category label, and this keeps that assumption untouched rather than
// auditing five call sites for a shape none of them will ever receive.
const ScatterPointSchema = z.object({
  label: z.string().min(1),
  x: z.number(),
  y: z.number(),
  entityId: z.string().min(1).optional(),
});

export const ScatterDataSetSchema = z.object({
  kind: z.literal("scatter"),
  points: z.array(ScatterPointSchema),
});
export type ScatterDataSet = z.infer<typeof ScatterDataSetSchema>;

// Hydration target for a dangling $ref — the resolver never lets a
// bare UniverseRef reach the renderer (CLAUDE.md §6).
export const MissingDataSetSchema = z.object({
  kind: z.literal("missing"),
  ref: z.string().min(1),
  reason: z.string().min(1),
});
export type MissingDataSet = z.infer<typeof MissingDataSetSchema>;

export const DataSetSchema = z.discriminatedUnion("kind", [
  TableDataSetSchema,
  SeriesDataSetSchema,
  EntityDataSetSchema,
  EntityCardsDataSetSchema,
  ScatterDataSetSchema,
  MissingDataSetSchema,
]);
export type DataSet = z.infer<typeof DataSetSchema>;
