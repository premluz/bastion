import { test, expect } from '@playwright/test';

for (const width of [320, 392]) {
  test(`composer sits below nav; one orb travels continuously at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 792 });
    await page.goto('/iframe.html?id=shell-tabbar--composer-open&globals=theme:safe-one');
    const composer = page.getByRole('region', { name: 'Assistant composer', exact: true });
    await expect(composer).toBeVisible();
    await composer.evaluate((element) => Promise.all(element.getAnimations().map((animation) => animation.finished)));
    const navigation = await page.getByRole('navigation').boundingBox();
    const bounds = await composer.boundingBox();
    if (!navigation || !bounds) throw new Error('Shell geometry unavailable');
    expect(bounds.y).toBeGreaterThanOrEqual(navigation.y + navigation.height - 1);
    const result = await page.evaluate(recordConversationMotion);
    expect(result.gradient).toContain('radial-gradient');
    expect(result.gradientOpacity).toBeGreaterThan(0);
    expect(result.sameOrb).toBe(true);
    expect(result.orbCount).toBe(1);
    expect(result.end.y).toBeGreaterThan(result.startY + 50);
    expect(result.samples.some((sample) => sample.y > result.startY + 5 && sample.y < result.end.y - 5)).toBe(true);
    expect(result.samples.some((sample) => sample.nav > 0 && sample.nav < 1)).toBe(true);
    expect(result.samples.some((sample) => sample.controls > 0 && sample.controls < 1)).toBe(true);
    expect(result.end.nav).toBe(0);
    expect(result.end.composer).toBe(0);
    expect(result.end.controls).toBe(1);
    expect(Math.abs(result.end.y - result.end.controlsY)).toBeLessThan(2);
  });
}

// All timing evidence comes from one browser-process rAF sequence.
async function recordConversationMotion() {
  const orb = document.querySelector('nav [data-activity]');
  const navItem = document.querySelector('nav button');
  const composer = document.querySelector('section[aria-label="Assistant composer"]');
  const trigger = document.querySelector('button[aria-label="Start conversation mode"]');
  const phone = document.querySelector('[data-testid="mobile-shell"]');
  if (!(orb instanceof HTMLElement) || !(navItem instanceof HTMLElement) || !(composer instanceof HTMLElement)
    || !(trigger instanceof HTMLElement) || !(phone instanceof HTMLElement)) throw new Error('Missing preview elements');
  const halo = getComputedStyle(phone, '::before');
  const gradient = halo.backgroundImage, gradientOpacity = parseFloat(halo.opacity);
  const center = (element: Element) => { const box = element.getBoundingClientRect(); return box.y + box.height / 2; };
  const startY = center(orb), samples = [];
  const duration = getComputedStyle(phone).getPropertyValue('--shell-mode-duration').trim();
  const milliseconds = parseFloat(duration) * (duration.endsWith('ms') ? 1 : 1000);
  trigger.click();
  const start = performance.now();
  do {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const close = document.querySelector('button[aria-label="Close conversation"]');
    if (!(close instanceof HTMLElement)) throw new Error('Missing conversation close');
    samples.push({ y: center(orb), nav: parseFloat(getComputedStyle(navItem).opacity),
      composer: parseFloat(getComputedStyle(composer).opacity), controls: parseFloat(getComputedStyle(close).opacity),
      controlsY: center(close) });
  } while (performance.now() - start < milliseconds * 2);
  const end = samples.at(-1);
  if (!end) throw new Error('No animation frames recorded');
  return { gradient, gradientOpacity, startY, samples, end,
    sameOrb: document.querySelector('nav [data-activity]') === orb,
    orbCount: document.querySelectorAll('[data-activity]').length };
}
