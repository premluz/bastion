import { z } from "zod";
import { EntityCardsDataSetSchema } from "../data";

// Bind node: data resolves against an EntityCardsDataSet via `bind`
// (CLAUDE.md §6, same pattern as data-table/time-series). Phase 21,
// 2026-08-30 — the registry-node half of "one card system serves both
// human browsing and assistant generation": renders the same card visual
// EntityAssetGrid.tsx uses on the Discover page, driven from Scene JSON
// for inline-in-transcript results instead of a callback-driven page.
export const AssetCardGridPropsSchema = z.object({
  data: EntityCardsDataSetSchema,
});
export type AssetCardGridProps = z.infer<typeof AssetCardGridPropsSchema>;
