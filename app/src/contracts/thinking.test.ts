import { describe, expect, it } from "vitest";
import { ThinkingStepSchema, WebResultSchema } from "./thinking";

const baseStep = {
  id: "step-1",
  kind: "search" as const,
  label: "Scanning listed assets above the 6% yield threshold",
  durationMs: 1100,
};

describe("ThinkingStepSchema — webResults (backward compatibility)", () => {
  it("accepts a step without webResults (existing fixtures unaffected)", () => {
    expect(ThinkingStepSchema.safeParse(baseStep).success).toBe(true);
  });

  it("accepts a step with a valid webResults array", () => {
    const step = {
      ...baseStep,
      webResults: [{ id: "1", title: "9 Best AI Tools for UI/UX Designers", domain: "www.toools.design" }],
    };
    expect(ThinkingStepSchema.safeParse(step).success).toBe(true);
  });

  it("accepts an empty webResults array", () => {
    expect(ThinkingStepSchema.safeParse({ ...baseStep, webResults: [] }).success).toBe(true);
  });
});

describe("WebResultSchema", () => {
  it("accepts a well-formed result", () => {
    expect(WebResultSchema.safeParse({ id: "1", title: "A page", domain: "example.com" }).success).toBe(true);
  });

  it("rejects an empty title", () => {
    expect(WebResultSchema.safeParse({ id: "1", title: "", domain: "example.com" }).success).toBe(false);
  });

  it("rejects an empty domain", () => {
    expect(WebResultSchema.safeParse({ id: "1", title: "A page", domain: "" }).success).toBe(false);
  });

  it("rejects a missing id", () => {
    expect(WebResultSchema.safeParse({ title: "A page", domain: "example.com" }).success).toBe(false);
  });
});
