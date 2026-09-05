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

// Positions are authored in the scene data payload, never computed at
// render time — no force simulation (CLAUDE.md §8, Phase 7).
//
// weight is decorative only (radius scaling, Phase 8D) — same status as
// edge weight below: no registered node may branch, filter, or compute
// on it.
const GraphNodeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  x: z.number(),
  y: z.number(),
  group: z.string().optional(),
  weight: z.number().optional(),
});

// weight is decorative only (e.g. edge thickness/opacity) — no
// registered node may branch, filter, or compute on it.
const GraphEdgeSchema = z.object({
  source: z.string().min(1),
  target: z.string().min(1),
  label: z.string().optional(),
  weight: z.number().optional(),
});

export const GraphDataSetSchema = z.object({
  kind: z.literal("graph"),
  nodes: z.array(GraphNodeSchema).min(1),
  edges: z.array(GraphEdgeSchema),
});
export type GraphDataSet = z.infer<typeof GraphDataSetSchema>;

// Stylized abstract map, no tile service — points/regions are plotted
// in a normalized 0..1 coordinate space (CLAUDE.md §8, Phase 7).
const GeoPointSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  kind: z.string().optional(),
});

const GeoRegionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  path: z.string().min(1),
});

export const GeoDataSetSchema = z.object({
  kind: z.literal("geo"),
  points: z.array(GeoPointSchema),
  regions: z.array(GeoRegionSchema).optional(),
});
export type GeoDataSet = z.infer<typeof GeoDataSetSchema>;

const EntityAttributeSchema = z.object({
  label: z.string().min(1),
  value: z.union([z.string(), z.number()]),
});

// Derivative-shaped attribute set (Phase 12 WO-2): an optional, typed
// sub-object on EntityDataSet — extends the existing entity shape, not a
// new DataSet kind (per the reuse precedent every other Phase 12 addition
// has followed). Fields cover what a derivative position needs that a
// generic label/value attribute doesn't structurally guarantee (a
// consumer can rely on `entity.derivative.counterparty` existing, rather
// than grep-matching a label string). Shared fact types that ALSO apply
// to non-derivative entities (e.g. RiskLens score) stay in the generic
// `attributes` array — this sub-object is only for facts specific to a
// derivative position's own identity.
const EntityDerivativeSchema = z.object({
  counterparty: z.string().min(1),
  notional: z.string().min(1),
  exposure: z.string().min(1),
  tenor: z.string().min(1),
  tradeDate: z.string().min(1),
});
export type EntityDerivative = z.infer<typeof EntityDerivativeSchema>;

export const EntityDataSetSchema = z.object({
  kind: z.literal("entity"),
  entity: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    type: z.string().min(1),
    attributes: z.array(EntityAttributeSchema),
    derivative: EntityDerivativeSchema.optional(),
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
  GraphDataSetSchema,
  GeoDataSetSchema,
  EntityDataSetSchema,
  EntityCardsDataSetSchema,
  ScatterDataSetSchema,
  MissingDataSetSchema,
]);
export type DataSet = z.infer<typeof DataSetSchema>;
