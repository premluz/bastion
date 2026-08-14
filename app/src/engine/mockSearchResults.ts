import type { StepKind, WebResult } from "../contracts/thinking";

// Placeholder web-search results for search-kind trail steps (direct
// order, 2026-08-10) — deliberately generic, not scenario-aware. Populates
// ThinkingStep.webResults so SearchResultsCard has something to render
// before a real web-search integration exists. Swap this generator's body
// for the real integration later; presentScene.ts's call site doesn't
// need to change shape when that happens.
const MOCK_RESULTS: WebResult[] = [
  { id: "mock-1", title: "Understanding Yield Thresholds in Fixed Income Markets", domain: "investopedia.com" },
  { id: "mock-2", title: "SEC Filing Database — Public Company Search", domain: "sec.gov" },
  { id: "mock-3", title: "Bond Yield Calculator and Screener", domain: "bloomberg.com" },
  { id: "mock-4", title: "Credit Rating Methodology Overview", domain: "moodys.com" },
  { id: "mock-5", title: "Market Data & Historical Pricing", domain: "marketwatch.com" },
];

export function mockSearchResultsFor(kind: StepKind): WebResult[] {
  return kind === "search" ? MOCK_RESULTS : [];
}
