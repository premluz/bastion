import { expect, test, type Page } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { FRAME_LIMITS } from './dockCubeFrameProbe';

type FrameProbe = typeof import('./dockCubeFrameProbe');

const STORY = '/iframe.html?id=shell-mobileframe--attention-home-monolith&globals=theme:bastion-aura-light';

async function enterMode(page: Page, mode: 'idle' | 'open' | 'working') {
  if (mode === 'open') {
    await page.getByRole('button', { name: 'Open assistant', exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'Message input', exact: true })).toBeVisible();
    await page.waitForFunction(() => document.activeViewTransition === null);
  } else if (mode === 'working') {
    await page.getByRole('textbox', { name: 'Message input', exact: true }).fill('Check my balance');
    await page.getByRole('button', { name: 'Send', exact: true }).click();
    await expect(page.getByRole('log', { name: 'Assistant transcript', exact: true })).toBeVisible();
  }
}

test('light dock cube stays illuminated across consecutive frames', async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 392, height: 792 });
  await page.goto(STORY, { waitUntil: 'load' });
  const cube = page.locator('[data-live-dock-cube]');
  await expect(cube.locator('canvas')).toBeVisible({ timeout: 30_000 });
  const resolution = await cube.locator('canvas').evaluate((canvas) => {
    if (!(canvas instanceof HTMLCanvasElement)) throw new Error('Dock resolution check requires a canvas');
    return { rendered: canvas.width, displayed: canvas.getBoundingClientRect().width * devicePixelRatio };
  });
  expect(resolution.rendered).toBeGreaterThan(resolution.displayed);
  for (const mode of ['idle', 'open', 'working'] as const) {
    await enterMode(page, mode);
    const result = await page.evaluate(async () => {
      const moduleUrl = '/tests/visual/dockCubeFrameProbe.ts';
      const probe: FrameProbe = await import(moduleUrl);
      return probe.recordDockCubeFrames();
    });
    if (result.artifact !== null) {
      const path = test.info().outputPath(`cube-artifact-${mode}.png`);
      await writeFile(path, Buffer.from(result.artifact.slice(result.artifact.indexOf(',') + 1), 'base64'));
      await test.info().attach(`cube-artifact-${mode}`, { path, contentType: 'image/png' });
    }
    const failures = result.samples.filter((frame) => frame.dark > FRAME_LIMITS.maximumDarkPixels
      || frame.opaque < FRAME_LIMITS.minimumBodyPixels || frame.burst > FRAME_LIMITS.maximumBurstPixels);
    expect(failures.length, `${mode}: ${JSON.stringify(failures.slice(0, 5))}`).toBe(0);
  }
});
