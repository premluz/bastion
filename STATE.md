# MERLIN — STATE
Append-only session memory. Sonnet: read at session start, append at session end. Entries here are approved law, equal to CLAUDE.md. Prem: approvals happen by you writing "approved" under a pending item, or Sonnet recording your in-session approval.

## Current
- Phase: S — environment setup (Prem, manual)
- Blockers: scene narratives (Prem, before Phase 2 fixtures)

## Approved decisions
<!-- token additions, dep approvals, shape decisions — one line each, dated -->
- 2026-07-08: Astryx deps pinned at 0.1.4 (@astryxdesign/core, theme-neutral, theme-stone, cli) — versions given by Prem, cross-checked against npm registry.
- 2026-07-08: Astryx MCP server confirmed by Prem as `xds` @ https://astryx.atmeta.com/mcp (remote, type: url) — domain has no independently-verifiable Meta ownership signal (privacy-shielded WHOIS, generic Vercel host); wired in on Prem's explicit confirmation.

## Pending approval
<!-- Sonnet proposals awaiting Prem -->
- test:visual is wired purely through @playwright/test (playwright.config.ts, testDir ./tests/visual, webServer boots Storybook). @storybook/test-runner is installed per the closed dep list but not yet wired into any script — glueing it into visual-diffing would need jest-image-snapshot (not in the closed list) or an unverified expect(page).toHaveScreenshot() call outside the Playwright test runner. Flagging for Prem to confirm test-runner's intended role before Phase 1 components land.

## Session log
<!-- append: date · phase · gate result · decisions · open items -->
- 2026-07-08 · Phase 1 (manifests-only scaffolding) · no gate run (no install performed) · Scaffolded pnpm workspace (root + app/package.json), strict tsconfig (base + app + app/tsconfig.node), vite.config.ts (no test env/jsdom — not in closed dep list), .storybook/{main,preview}.ts, playwright.config.ts, .gitignore. Astryx deps/MCP resolved per above. Open items: app/src has no entry point or theme CSS yet (explicitly out of scope this session); jsdom/DOM test-environment choice for vitest deferred to when component tests start; test-runner role open (see Pending approval).
