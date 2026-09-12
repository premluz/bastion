import { test, expect } from '@playwright/test';

// Bastion fork note: Merlin's eight real-fixture renderer stories were
// deleted along with their scene JSON (universe/scene prune, CLAUDE.md
// §10) — only the synthetic Broken/StressTest stories survive, per
// Fixtures.stories.tsx.
const RENDERER_STORIES = [
  'renderer-fixtures--broken',
  'renderer-fixtures--stress-test-dense',
  'renderer-fixtures--stress-test-dense-broken',
] as const;

const THEMES = ['default', 'ops-dark', 'glass', 'glass-light', 'safe-one'] as const;

for (const storyId of RENDERER_STORIES) {
  for (const theme of THEMES) {
    test(`${storyId} — ${theme}`, async ({ page }) => {
      await page.goto(`/iframe.html?id=${storyId}&globals=theme:${theme}`);
      await page.waitForSelector('#storybook-root');
      // Reveal choreography staggers every node's mount by reveal * 60-90ms
      // (theme-dependent); wait past the longest fixture's last delay +
      // animation duration before capturing, so the baseline reflects the
      // settled scene, not a mid-assembly frame.
      await page.waitForTimeout(1200);
      await expect(page).toHaveScreenshot(`${storyId}-${theme}.png`, { fullPage: true });
    });
  }
}
