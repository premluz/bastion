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

const SeriesPointSchema = z.object({
  x: z.string(),
  y: z.number(),
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
  MissingDataSetSchema,
]);
export type DataSet = z.infer<typeof DataSetSchema>;
