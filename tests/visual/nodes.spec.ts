import { test, expect } from '@playwright/test';

// One baseline per node's Happy story across the 3 registered Meridian
// themes (default | ops-dark | glass) — reviewed once at creation per the
// merlin-new-node skill, diff-only from here.
const NODE_STORIES = [
  'nodes-scenegrid--happy',
  'nodes-panel--happy',
  'nodes-metric--happy',
  'nodes-metricgrid--happy',
  'nodes-datatable--happy',
  'nodes-timeseries--happy',
  'nodes-timeseries--combo',
  'nodes-textblock--happy',
  'nodes-statustag--happy',
  'nodes-recommendation--happy',
  'nodes-entityheader--happy',
  'nodes-filtersummary--happy',
  'nodes-entitygraph--happy',
  'nodes-geopanel--happy',
  'nodes-signalfeed--happy',
  'nodes-comparison--happy',
  'nodes-confidencemeter--happy',
  'nodes-concentrationmap--happy',
  'nodes-scenesummary--happy',
  'nodes-ringgauge--happy',
  'nodes-dashboardlayout--two-columns',
  'nodes-dashboardlayout--three-columns',
  'nodes-dashboardlayout--four-columns',
  'nodes-statusgrid--happy',
  'nodes-ringchart--happy',
  'nodes-newsfeed--happy',
] as const;

const THEMES = ['default', 'ops-dark', 'glass', 'glass-light'] as const;

for (const storyId of NODE_STORIES) {
  for (const theme of THEMES) {
    test(`${storyId} — ${theme}`, async ({ page }) => {
      await page.goto(`/iframe.html?id=${storyId}&globals=theme:${theme}`);
      await page.waitForSelector('#storybook-root');
      await expect(page).toHaveScreenshot(`${storyId}-${theme}.png`);
    });
  }
}

// All-rows invariant (Phase 8E): a row that's structurally present but
// visually undiscoverable is the same failure as a dropped row from a
// user's perspective — found live against Aldergate's real, skewed
// holder data (18/12/9/61) at the artifact panel's real, narrow width,
// not a uniform sample (see STATE.md). Every ConcentrationMap cell
// carries an SVG <title> unconditionally, regardless of whether it's
// big enough for visible text — checking title content (never
// size-gated) is what actually proves no row silently lost its identity,
// independent of the separate, already-covered "does it fit" legibility
// concern.
test('concentration-map — every row stays discoverable (all-rows invariant)', async ({ page }) => {
  await page.goto('/iframe.html?id=nodes-concentrationmap--happy&globals=theme:default');
  await page.waitForSelector('#storybook-root');
  const titles = await page.locator('svg title').allTextContents();
  for (const label of ['Meridian Capital Partners', 'Nordkap Pension Trust', 'Rhein Family Office', 'Other holders']) {
    expect(titles.some((t) => t.startsWith(label))).toBe(true);
  }
  expect(titles).toHaveLength(4);
});
