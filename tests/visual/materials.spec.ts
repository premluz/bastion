import { test, expect, type Locator } from '@playwright/test';

const FAMILIES = ['ceramic', 'frosted', 'opal', 'obsidian', 'spectral'] as const;
const APPEARANCES = ['light', 'dark'] as const;

async function checkFrame(canvas: Locator, name: string): Promise<void> {
  await expect(canvas).toHaveScreenshot(name);
  // Playwright can skip unchanged images in update mode; explicitly write every requested baseline.
  if (test.info().config.updateSnapshots === 'all') {
    await canvas.screenshot({ path: test.info().snapshotPath(name) });
    console.log(`Regenerated material baseline: ${name}`);
  }
}

for (const appearance of APPEARANCES) {
  for (const family of FAMILIES) {
    test(`${appearance} ${family}: same geometry, lit and unlit`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });
      const path = `/material-check.html?family=${family}&appearance=${appearance}`;
      await page.goto(path, { waitUntil: 'load' });
      await expect(page.locator('main')).toHaveAttribute('data-ready', 'true', { timeout: 30_000 });
      const canvas = page.locator('canvas').first();
      await expect(canvas).toBeVisible();
      await checkFrame(canvas, `${appearance}-${family}-lit.png`);
      const lit = await canvas.screenshot();
      await page.goto(`${path}&unlit`, { waitUntil: 'load' });
      await expect(page.locator('main')).toHaveAttribute('data-ready', 'true', { timeout: 30_000 });
      await checkFrame(canvas, `${appearance}-${family}-unlit.png`);
      expect((await canvas.screenshot()).equals(lit), 'Cut illumination must change the rendered material').toBe(false);
      expect(errors).toEqual([]);
    });
  }
}

test('crack light moves while running and stays fixed while paused', async ({ page }) => {
  const path = '/material-check.html?family=frosted&appearance=light';
  const capture = async (query: string) => {
    await page.goto(`${path}${query}`, { waitUntil: 'load' });
    await expect(page.locator('main')).toHaveAttribute('data-ready', 'true', { timeout: 30_000 });
    return page.locator('canvas').screenshot();
  };
  const paused = await capture('');
  const pausedLater = await capture('&later');
  expect(paused.equals(pausedLater), 'Paused illumination must not drift across frames').toBe(true);
  const moving = await capture('&motion');
  const movingLater = await capture('&motion&later');
  expect(moving.equals(movingLater), 'Running illumination must redistribute along the cuts').toBe(false);
});

for (const [family, appearance, alternate] of [['opal', 'light', false], ['spectral', 'dark', true], ['obsidian', 'dark', false]] as const) {
  test(`${family} detached edge beams`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(`/material-check.html?family=${family}&appearance=${appearance}&open${alternate ? '&alternate' : ''}`, { waitUntil: 'load' });
    await expect(page.locator('main')).toHaveAttribute('data-ready', 'true', { timeout: 30_000 });
    await expect(page.locator('main')).toHaveAttribute('data-progress', '0.32');
    await checkFrame(page.locator('canvas'), `${appearance}-${family}-open.png`);
    expect(errors).toEqual([]);
  });
}
