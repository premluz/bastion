import { describe, it, expect } from "vitest";
import { TradableAssetSchema } from "./tradableAsset";
import equity from "../../universe/fixtures/equity-example.json";
import crypto from "../../universe/fixtures/crypto-example.json";

describe("TradableAsset fixtures", () => {
  it("equity-example.json parses", () => {
    const result = TradableAssetSchema.safeParse(equity);
    expect(result.success ? undefined : result.error.issues).toBeUndefined();
  });

  it("crypto-example.json parses", () => {
    const result = TradableAssetSchema.safeParse(crypto);
    expect(result.success ? undefined : result.error.issues).toBeUndefined();
  });
});
