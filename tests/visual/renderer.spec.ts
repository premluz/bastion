import { test, expect } from '@playwright/test';

// One baseline per renderer story (4 real fixtures + the deliberately
// broken scene) across the 3 registered Meridian themes — same pattern as
// nodes.spec.ts. Reviewed once at creation, diff-only from here.
const RENDERER_STORIES = [
  'renderer-fixtures--asset-discovery',
  'renderer-fixtures--asset-discovery-refine',
  'renderer-fixtures--issuer-dossier',
  'renderer-fixtures--settlement-anomaly',
  'renderer-fixtures--audit-status-alert',
  'renderer-fixtures--broken',
] as const;

const THEMES = ['default', 'ops-dark', 'glass'] as const;

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
