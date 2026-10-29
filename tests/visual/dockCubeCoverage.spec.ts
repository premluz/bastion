import { expect, test } from '@playwright/test';

type CoverageProbe = typeof import('../../monolith/src/scene/edgeCoverageProbe');

test('cube resolve averages diagonal silhouettes and narrow seams', async ({ page }) => {
  await page.goto('/iframe.html?id=shell-mobileframe--attention-home-monolith', { waitUntil: 'load' });
  await expect(page.locator('[data-live-dock-cube] canvas')).toBeVisible({ timeout: 30_000 });
  const samples = await page.evaluate(async () => {
    const moduleUrl = '/monolith/src/scene/edgeCoverageProbe.ts';
    const probe: CoverageProbe = await import(moduleUrl);
    return probe.probeEdgeCoverage();
  });
  expect(samples).toHaveLength(2);
  const [silhouette, seam] = samples;
  if (silhouette === undefined || seam === undefined) throw new Error('Coverage patterns did not render');
  expect(silhouette.unfiltered.partialAlpha).toBe(0);
  expect(silhouette.filtered.visible).toBeGreaterThan(0);
  expect(silhouette.filtered.partialAlpha).toBeGreaterThan(0);
  expect(silhouette.filtered.partialAlpha).toBeLessThan(silhouette.filtered.visible);
  expect(seam.unfiltered.partialLight).toBe(0);
  expect(seam.filtered.visible).toBe(seam.unfiltered.visible);
  expect(seam.filtered.partialLight).toBeGreaterThan(0);
  expect(seam.filtered.partialLight).toBeLessThan(seam.filtered.visible);
  await test.info().attach('coverage-counts', { body: JSON.stringify(samples), contentType: 'application/json' });
});
