import { TradableAssetSchema, type TradableAsset } from "../contracts/tradableAsset";
import equityJson from "../../universe/fixtures/equity-example.json";
import cryptoJson from "../../universe/fixtures/crypto-example.json";

// Phase 20 WO-1: replaces entityDetail.ts's resolveEntityDetail. Two
// golden fixtures only (the schema's own acceptance test, per the phase
// order) — every other entity in the universe (mock-filled Discover grid
// cards, unmigrated real entities like Halberg Materials/NordBond) has no
// TradableAsset fixture yet, by design at this proof-of-concept stage.
// EntityDetailPage shows an honest "not yet available" empty state for
// those rather than a dead click or a silent fallback to the retired
// EntityDetail shape (2026-08-15 ruling).
const FIXTURES: Record<string, unknown> = {
  [equityJson.id]: equityJson,
  [cryptoJson.id]: cryptoJson,
};

export function resolveTradableAsset(id: string): TradableAsset | undefined {
  const raw = FIXTURES[id];
  if (!raw) return undefined;
  const result = TradableAssetSchema.safeParse(raw);
  return result.success ? result.data : undefined;
}
