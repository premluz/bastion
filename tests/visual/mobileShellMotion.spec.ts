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

test('voice orb visibly flows with normal motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 392, height: 792 });
  await page.goto('/iframe.html?id=shell-tabbar--idle&globals=theme:safe-one');
  await page.getByRole('button', { name: 'Assistant', exact: true }).click();
  await page.getByRole('button', { name: 'Start conversation mode', exact: true }).click();
  const orb = page.getByRole('dialog', { name: 'Assistant conversation', exact: true }).locator('canvas');
  await expect(orb).toBeVisible();

  const changedFraction = await orb.evaluate(async (canvas) => {
    if (!(canvas instanceof HTMLCanvasElement)) throw new Error('Voice orb canvas unavailable');
    const gl = canvas.getContext('webgl2');
    if (!gl) throw new Error('Voice orb WebGL2 context unavailable');
    const readFrame = () => {
      const pixels = new Uint8Array(canvas.width * canvas.height * 4);
      gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      return pixels;
    };
    await new Promise<void>((resolve) => setTimeout(resolve, 600));
    const first = readFrame();
    await new Promise<void>((resolve) => setTimeout(resolve, 1200));
    const second = readFrame();
    let changed = 0;
    for (let index = 3; index < first.length; index += 4) {
      if (first[index] !== second[index]) changed++;
    }
    return changed / (first.length / 4);
  });
  expect(changedFraction).toBeGreaterThan(0.05);
});

test('composer resize and WebGL texture fade finish together', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 392, height: 792 });
  await page.goto('/iframe.html?id=shell-mobileframe--composer-open&globals=theme:bastion');
  await page.getByRole('button', { name: 'Start conversation mode', exact: true }).waitFor();
  const surface = await page.evaluate(() => {
    const composer = document.querySelector('dialog[aria-label="Assistant composer"] .astryx-chat-composer');
    const body = composer?.firstElementChild;
    if (!(composer instanceof HTMLElement) || !(body instanceof HTMLElement)) throw new Error('Composer surface unavailable');
    return { outerName: getComputedStyle(composer).viewTransitionName,
      bodyName: getComputedStyle(body).viewTransitionName,
      radius: getComputedStyle(body).borderRadius,
      expectedRadius: getComputedStyle(document.documentElement).getPropertyValue('--radius-chat').trim() };
  });
  expect(surface.outerName).toBe('none');
  expect(surface.bodyName).toBe('dock-bar');
  expect(surface.radius).toBe(surface.expectedRadius);

  const samples = await page.evaluate(recordOrbEntrance);

  const morph = samples.filter((frame) => frame.morphing && frame.supported);
  expect(morph.every((frame) => frame.background === 'none')).toBe(true);
  expect(morph.every((frame) => frame.oldClip !== 'none' && frame.newClip !== 'none')).toBe(true);
  expect(morph.every((frame) => frame.fallbackOpacity === 0)).toBe(true);
  expect(morph.every((frame) => frame.coreBackground !== 'rgba(0, 0, 0, 0)')).toBe(true);
  expect(new Set(morph.map((frame) => frame.radius)).size).toBeGreaterThan(3);
  expect(morph.some((frame) => frame.oldOpacity > 0 && frame.oldOpacity < 1)).toBe(true);
  expect(morph.every((frame) => frame.canvasOpacity === 1)).toBe(true);
  expect(morph.some((frame) => frame.textureOpacity > 0 && frame.textureOpacity < 1 && frame.auraOpacity > 0 && frame.auraOpacity < 1)).toBe(true);
  expect(morph.some((frame) => frame.textureOpacity > 0.9 && frame.auraOpacity > 0.9)).toBe(true);
  const timing = morph[0];
  if (!timing) throw new Error('Orb morph did not render with WebGL support');
  expect([timing.textureDelay + timing.textureDuration, timing.auraDelay + timing.auraDuration]).toEqual([timing.barDelay + timing.barDuration, timing.barDelay + timing.barDuration]);
  expect(samples.at(-1)?.canvasOpacity).toBeGreaterThan(0.9);
});

async function recordOrbEntrance() {
  const trigger = document.querySelector('button[aria-label="Start conversation mode"]');
  if (!(trigger instanceof HTMLButtonElement)) throw new Error('Conversation trigger unavailable');
  trigger.click();
  const start = performance.now();
  const duration = getComputedStyle(document.documentElement).getPropertyValue('--orb-morph-duration').trim();
  const milliseconds = parseFloat(duration) * (duration.endsWith('ms') ? 1 : 1000);
  const frames: { radius: string; background: string; oldOpacity: number; oldClip: string; newClip: string;
    fallbackOpacity: number | null; coreBackground: string | null; canvasOpacity: number | null;
    textureOpacity: number; textureDelay: number; textureDuration: number; auraOpacity: number; auraDelay: number; auraDuration: number; barDelay: number; barDuration: number;
    supported: boolean; morphing: boolean }[] = [];
  do {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const canvas = document.querySelector('dialog[aria-label="Assistant conversation"] canvas');
    const pair = getComputedStyle(document.documentElement, '::view-transition-image-pair(dock-bar)');
    const old = getComputedStyle(document.documentElement, '::view-transition-old(dock-bar)');
    const bar = getComputedStyle(document.documentElement, '::view-transition-group(dock-bar)');
    const texture = getComputedStyle(document.documentElement, '::view-transition-new(dock-orb-texture)');
    const aura = getComputedStyle(document.documentElement, '::view-transition-new(dock-orb-aura)');
    const core = canvas?.parentElement;
    frames.push({ radius: pair.borderRadius, background: pair.backgroundImage, oldOpacity: Number(old.opacity),
      oldClip: old.clipPath, newClip: getComputedStyle(document.documentElement, '::view-transition-new(dock-bar)').clipPath,
      fallbackOpacity: core ? Number(getComputedStyle(core, '::before').opacity) : null,
      coreBackground: core ? getComputedStyle(core).backgroundColor : null,
      canvasOpacity: canvas ? Number(getComputedStyle(canvas).opacity) : null,
      textureOpacity: Number(texture.opacity), textureDelay: parseFloat(texture.animationDelay),
      textureDuration: parseFloat(texture.animationDuration), auraOpacity: Number(aura.opacity),
      auraDelay: parseFloat(aura.animationDelay), auraDuration: parseFloat(aura.animationDuration), barDelay: parseFloat(bar.animationDelay),
      barDuration: parseFloat(bar.animationDuration),
      supported: canvas?.getAttribute('data-liquid-supported') === 'true',
      morphing: document.documentElement.hasAttribute('data-orb-morphing') });
  } while (performance.now() - start < milliseconds * 3);
  return frames;
}

test('voice orb rounds back into the composer without a corner snap', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 392, height: 792 });
  await page.goto('/iframe.html?id=shell-mobileframe--conversation-mode&globals=theme:bastion');
  await page.getByRole('button', { name: 'Close conversation', exact: true }).waitFor();

  const frames = await page.evaluate(async () => {
    const close = document.querySelector('button[aria-label="Close conversation"]');
    if (!(close instanceof HTMLButtonElement)) throw new Error('Conversation close unavailable');
    const canvas = document.querySelector('dialog[aria-label="Assistant conversation"] canvas');
    if (!(canvas instanceof HTMLCanvasElement)) throw new Error('Orb texture unavailable');
    const textureName = getComputedStyle(canvas).viewTransitionName;
    close.click();
    const start = performance.now();
    const duration = getComputedStyle(document.documentElement).getPropertyValue('--orb-morph-duration').trim();
    const milliseconds = parseFloat(duration) * (duration.endsWith('ms') ? 1 : 1000);
    const samples: { radius: string; textureTransform: string; textureOpacity: number; textureAnimation: string }[] = [];
    do {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const root = document.documentElement;
      const group = getComputedStyle(root, '::view-transition-group(dock-orb-texture)');
      const old = getComputedStyle(root, '::view-transition-old(dock-orb-texture)');
      samples.push({ radius: getComputedStyle(root, '::view-transition-image-pair(dock-bar)').borderRadius,
        textureTransform: group.transform, textureOpacity: Number(old.opacity), textureAnimation: group.animationName });
    } while (performance.now() - start < milliseconds * 2);
    return { textureName, samples };
  });

  expect(frames.textureName).toBe('dock-orb-texture');
  expect(new Set(frames.samples.map((frame) => frame.radius)).size).toBeGreaterThan(3);
  const fading = frames.samples.filter((frame) => frame.textureTransform !== 'none'
    && frame.textureOpacity > 0 && frame.textureOpacity < 1);
  expect(fading.length).toBeGreaterThan(1);
  expect(new Set(fading.map((frame) => frame.textureTransform)).size).toBe(1);
  expect(fading.every((frame) => frame.textureAnimation === 'none')).toBe(true);
  await expect(page.getByRole('dialog', { name: 'Assistant composer', exact: true })).toBeVisible();
});

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
