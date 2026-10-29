import { expect, test, type Page } from '@playwright/test';
import { cubePixelDifference, freezeCubeImage, recordCubeEntry, recordCubeIdle, recordCubeReturn, type CubeEntryFrame } from './dockCubeMotion';

const STORY = '/iframe.html?id=shell-mobileframe--attention-home-monolith';
const PIXEL_THRESHOLD = { noiseMultiplier: 5, minimumMeanChange: 1 } as const;
const errors = new WeakMap<Page, string[]>();

test.beforeAll(async ({ browser, baseURL }) => {
  const page = await browser.newPage();
  await page.goto(`${baseURL}${STORY}&globals=theme:bastion`, { waitUntil: 'load' });
  await expect(page.locator('[data-live-dock-cube] canvas')).toBeVisible({ timeout: 45_000 });
  await page.close();
});
test.beforeEach(({ page, baseURL }, info) => {
  const messages: string[] = [];
  errors.set(page, messages);
  page.on('pageerror', (error) => messages.push(error.message));
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const detail = `${message.location().url}: ${message.text()}`;
    if (message.location().url === `${baseURL}/images/card03.jpg`
      && message.text() === 'Failed to load resource: the server responded with a status of 404 (Not Found)') {
      info.annotations.push({ type: 'existing missing asset', description: detail });
    } else messages.push(detail);
  });
});
test.afterEach(({ page }) => { expect(errors.get(page)).toEqual([]); });

for (const [width, theme] of [[320, 'bastion'], [392, 'bastion-aura-light']] as const) {
  test(`cube clears the matching-height composer at ${width}px in ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 792 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`${STORY}&globals=theme:${theme}`, { waitUntil: 'load' });
    const nav = page.getByRole('navigation', { name: 'Pill navigation', exact: true });
    await expect(nav).toBeVisible({ timeout: 30_000 });
    expect(await page.evaluate(recordCubeIdle)).toEqual([0, 0, 0, 0]);
    await expect(page.locator('[data-orb="none"] > div').first()).toHaveCSS('opacity', '0');
    const navHeight = await nav.evaluate((element) => element.getBoundingClientRect().height);
    const muted = await nav.getByRole('button', { name: 'Explore', exact: true }).evaluate((element) => {
      const probe = document.createElement('span');
      probe.style.color = 'var(--ink-muted)';
      element.append(probe);
      const colors = { actual: getComputedStyle(element).color, expected: getComputedStyle(probe).color };
      probe.remove();
      return colors;
    });
    expect(muted.actual).toBe(muted.expected);
    await expect(nav.getByRole('button')).toHaveCount(4);
    await page.getByRole('button', { name: 'Open assistant', exact: true }).click();
    const input = page.getByRole('textbox', { name: 'Message input', exact: true });
    await expect(input).toBeFocused();
    await expect(page.getByRole('button', { name: 'Back', exact: true })).toHaveCSS('animation-name', 'none');
    const layout = await input.evaluate((element) => {
      const body = element.closest('.astryx-chat-composer')?.firstElementChild;
      const cube = document.querySelector('[data-live-dock-cube]');
      if (!(body instanceof HTMLElement) || !(cube instanceof HTMLElement)) throw new Error('Chat dock unavailable');
      const bounds = body.getBoundingClientRect();
      const cubeBounds = cube.getBoundingClientRect();
      return { height: bounds.height, gap: cubeBounds.top - bounds.bottom,
        target: Boolean(document.elementFromPoint(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)?.closest('.astryx-chat-composer')),
        transition: document.documentElement.matches(':active-view-transition') };
    });
    expect(layout.height).toBe(navHeight);
    expect(layout.gap).toBeGreaterThanOrEqual(16);
    expect(layout.target).toBe(true);
    expect(layout.transition).toBe(false);
    await expectSuggestionGap(page);
    await input.fill('Check my balance');
    await expect(input).toHaveText('Check my balance');
  });
}

for (const theme of ['bastion', 'glass-light']) {
test(`cube turns directionally and controls arrive near its end in ${theme}`, async ({ page }) => {
  await page.setViewportSize({ width: 392, height: 792 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(`${STORY}&globals=theme:${theme}`, { waitUntil: 'load' });
  await expect(page.locator('[data-live-dock-cube] canvas')).toBeVisible({ timeout: 30_000 });
  const idle = await page.evaluate(recordCubeIdle);
  expect(idle[0]).toBe(0);
  expect(idle[1]).toBeCloseTo(Math.PI / 15);
  expect(idle[2]).toBeCloseTo(Math.PI);
  expect(idle[3]).toBeCloseTo(Math.PI * 2);
  const frames = await page.evaluate(recordCubeEntry);
  await test.info().attach('cube-entry-timing', { body: JSON.stringify(frames), contentType: 'application/json' });
  const travelling = frames.filter((frame) => frame.active);
  expect(travelling.length).toBeGreaterThan(3);
  expect(travelling[0]?.delay).toBe(0);
  expect(travelling[0]?.duration).toBe(0.55);
  expectControlStagger(frames);
  expectComposerTravel(frames);
  expect(Math.min(...travelling.map((frame) => frame.rotation))).toBeLessThan(-Math.PI);
  expect(frames.at(-1)?.rotation).toBeCloseTo(-Math.PI);
  expect(Math.max(...travelling.map((frame) => frame.turnProgress))).toBeGreaterThan(0.1);
  const readable = travelling.filter((frame) => frame.inputOpacity > 0.9);
  expect(readable.length).toBeGreaterThan(0);
  expect(readable.every((frame) => frame.gap >= 0)).toBe(true);
  const moving = readable.filter((frame) => frame.turnProgress > 0 && frame.turnProgress < 1);
  expect(moving.length).toBeGreaterThan(0);
  expect(moving.every((frame) => frame.inputHit), JSON.stringify(moving.filter((frame) => !frame.inputHit).slice(0, 3))).toBe(true);
  expect(frames.at(-1)?.turnProgress).toBe(0);
  const input = page.getByRole('textbox', { name: 'Message input', exact: true });
  await input.click();
  await expect(input).toBeFocused();
  const returning = await page.evaluate(recordCubeReturn);
  expectReturnTravel(returning);
  expect(returning.at(-1)?.composerY).toBeGreaterThan(returning[0]?.composerY ?? 0);
  expect(returning.at(-1)?.composerWidth).toBeLessThan(returning[0]?.composerWidth ?? 0);
});
}

function expectControlStagger(frames: Awaited<ReturnType<typeof recordCubeEntry>>) {
  const start = frames[0];
  const halfway = frames.find((frame) => frame.turnProgress === 0.5);
  const late = frames.find((frame) => frame.turnProgress > 0.7 && frame.turnProgress < 0.8);
  const end = frames.find((frame) => frame.turnProgress === 1);
  if (!start || !halfway || !late || !end) throw new Error('Control animation samples unavailable');
  expect(start.controls.map((control) => control.id)).toEqual(['back', 'history', 'mic', 'voice']);
  const delays = start.controls.map((control) => control.delay);
  expect(delays).toEqual([...delays].sort((a, b) => b - a));
  expect(new Set(delays).size).toBe(4);
  expect(delays[0]).toBeGreaterThan(start.duration / 2);
  expect((delays[0] ?? 0) + (start.controls[0]?.duration ?? 0)).toBeCloseTo(start.duration);
  expect(start.controls.every((control) => control.opacity === 0)).toBe(true);
  expect(halfway.controls[0]?.opacity).toBe(0);
  expect(late.controls.at(-1)?.opacity).toBeGreaterThan(late.controls[0]?.opacity ?? 0);
  expect(end.controls.map((control) => control.opacity)).toEqual(frames.at(-1)?.controls.map((control) => control.opacity));
}

function expectComposerTravel(frames: CubeEntryFrame[]) {
  const moving = frames.filter((frame) => frame.active);
  const start = moving[0];
  const end = moving.at(-1);
  const early = moving.find((frame) => frame.turnProgress > 0.2 && frame.turnProgress < 0.3);
  if (!start || !end || !early) throw new Error('Composer travel samples unavailable');
  expect(start.composerY).toBeGreaterThan(end.composerY);
  expect(start.composerWidth).toBeLessThan(end.composerWidth);
  expect(new Set(moving.map((frame) => frame.composerY)).size).toBeGreaterThan(2);
  expect(Math.abs(early.rotation)).toBeGreaterThan(Math.PI * early.turnProgress);
  expect(moving.every((frame) => frame.sameCanvas && frame.liveOpacity === '1')).toBe(true);
  for (const frame of moving) {
    const distance = (frame.cubeX - start.cubeX) / (end.cubeX - start.cubeX);
    expect(frame.rotation).toBeCloseTo(-Math.PI * distance);
  }
}

function expectReturnTravel(frames: Awaited<ReturnType<typeof recordCubeReturn>>) {
  const start = frames[0], end = frames.at(-1);
  if (!start || !end) throw new Error('Cube return samples unavailable');
  expect(end.x).toBeGreaterThan(start.x);
  expect(Math.max(...frames.map((frame) => frame.x))).toBeGreaterThan(end.x);
  frames.forEach((frame) => {
    const progress = (frame.x - start.x) / (end.x - start.x);
    expect(frame.rotation).toBeCloseTo(-Math.PI * (1 - progress));
    expect(frame.sameCanvas).toBe(true);
  });
}

async function expectSuggestionGap(page: Page) {
  await expect.poll(() => page.evaluate(() => {
    const landing = document.querySelector('[class*="landing"][data-open]:not([data-away]) [data-variant="plain"]');
    const composer = document.querySelector('.astryx-chat-composer > div');
    if (!(landing instanceof HTMLElement) || !(composer instanceof HTMLElement)) throw new Error('Landing/composer unavailable');
    return composer.getBoundingClientRect().top - landing.getBoundingClientRect().bottom;
  })).toBeGreaterThanOrEqual(24);
}

for (const theme of ['bastion', 'glass-light']) {
test(`visible cube renders early in entry and return in ${theme}`, async ({ page }) => {
  await page.setViewportSize({ width: 392, height: 792 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(`${STORY}&globals=theme:${theme}`, { waitUntil: 'load' });
  const cube = page.locator('[data-live-dock-cube]');
  await expect(cube.locator('canvas')).toBeVisible({ timeout: 30_000 });
  for (const label of ['Open assistant', 'Back']) {
    const probe = await page.evaluate(freezeCubeImage, label);
    expect(probe.animations.map((animation) => animation.state)).toEqual(['paused']);
    const turned = await cube.screenshot({ path: test.info().outputPath(`${label}-turned.png`) });
    const unchanged = await cube.screenshot();
    const reference = turned.toString('base64');
    const noise = await page.evaluate(cubePixelDifference, { reference, sample: unchanged.toString('base64') });
    await page.evaluate(async () => {
      document.documentElement.style.setProperty('--dock-cube-turn', '0');
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    });
    const sample = (await cube.screenshot({ path: test.info().outputPath(`${label}-straight.png`) })).toString('base64');
    const change = await page.evaluate(cubePixelDifference, { reference, sample });
    expect(change, `Live orientation change must exceed renderer noise (${noise}); ${JSON.stringify(probe)}`).toBeGreaterThan(Math.max(noise * PIXEL_THRESHOLD.noiseMultiplier, PIXEL_THRESHOLD.minimumMeanChange));
    await page.evaluate(async () => {
      document.documentElement.style.removeProperty('--dock-cube-turn');
      const transition = document.activeViewTransition;
      document.getAnimations().filter((animation) => typeof animation.currentTime === 'number'
        && Number.isFinite(animation.effect?.getComputedTiming().endTime)).forEach((animation) => animation.finish());
      await transition?.finished;
    });
  }
});
}
