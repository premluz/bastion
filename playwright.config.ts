import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  fullyParallel: true,
  // 'list' for terminal output (unchanged, still the primary gate-evidence
  // format per CLAUDE.md's session protocol); 'html' additionally writes a
  // real browsable report (open: 'never' — generated on every run, not
  // auto-opened, so it doesn't interrupt an agent session) to
  // playwright-report/ so a full pass/fail/diff view is available without
  // a live session. Both output paths are already gitignored (direct
  // order, 2026-08-13 — Playwright was already producing this and this
  // session had been discarding it every run rather than keeping it).
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.02 },
  },
  use: {
    baseURL: 'http://localhost:6006',
  },
  webServer: {
    command: 'pnpm exec storybook dev -c .storybook -p 6006 --ci --quiet',
    url: 'http://localhost:6006',
    reuseExistingServer: true,
    timeout: 60_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
