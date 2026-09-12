import { TradableAssetSchema, type TradableAsset } from "../contracts/tradableAsset";

// Bastion fork note: Merlin's two golden TradableAsset fixtures (South Bow
// Corp equity, Zenith Protocol crypto — universe/fixtures/*.json) were
// Merlin's own fictional-world content, deleted per the fork spec's
// "prune, don't adapt" rule for universe/scene content. Authoring Bastion's
// own fixtures is explicitly out of scope for this prune pass (see
// CLAUDE.md §10) — every id resolves to undefined (an honest "not yet
// available" empty state on EntityDetailPage) until a future phase adds
// real fixtures here, at which point this becomes the same
// Record<string, unknown>-keyed lookup Merlin's version was.
const FIXTURES: Record<string, unknown> = {};

export function resolveTradableAsset(id: string): TradableAsset | undefined {
  const raw = FIXTURES[id];
  if (!raw) return undefined;
  const result = TradableAssetSchema.safeParse(raw);
  return result.success ? result.data : undefined;
}
