import { expect, test } from '@playwright/test';

test('orb overshoots and settles with its texture and glow aligned', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 392, height: 792 });
  await page.goto('/iframe.html?id=shell-mobileframe--composer-open&globals=theme:bastion');
  await page.getByRole('button', { name: 'Start conversation mode', exact: true }).waitFor();

  const samples = await page.evaluate(async () => {
    const trigger = document.querySelector('button[aria-label="Start conversation mode"]');
    if (!(trigger instanceof HTMLButtonElement)) throw new Error('Conversation trigger unavailable');
    trigger.click();
    const root = document.documentElement;
    const duration = getComputedStyle(root).getPropertyValue('--orb-morph-duration').trim();
    const milliseconds = parseFloat(duration) * (duration.endsWith('ms') ? 1 : 1000);
    const start = performance.now();
    const frames: { bar: number; texture: number; aura: number }[] = [];
    do {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      if (!root.hasAttribute('data-orb-morphing')) continue;
      frames.push({
        bar: Number(getComputedStyle(root, '::view-transition-new(dock-bar)').scale),
        texture: Number(getComputedStyle(root, '::view-transition-new(dock-orb-texture)').scale),
        aura: Number(getComputedStyle(root, '::view-transition-new(dock-orb-aura)').scale),
      });
    } while (performance.now() - start < milliseconds * 3);
    return frames.filter((frame) => Number.isFinite(frame.bar));
  });

  expect(samples.length).toBeGreaterThan(3);
  expect(Math.min(...samples.map((frame) => frame.bar))).toBeLessThan(1);
  const peak = samples.reduce((largest, frame) => frame.bar > largest.bar ? frame : largest);
  expect(peak.bar).toBeGreaterThan(1);
  expect(peak.texture).toBeCloseTo(peak.bar, 2);
  expect(peak.aura).toBeCloseTo(peak.bar, 2);
  expect(samples.at(-1)?.bar).toBeCloseTo(1, 2);
});
