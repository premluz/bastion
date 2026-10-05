import { test, expect } from '@playwright/test';

const story = '/iframe.html?id=shell-pillnavigation--default&globals=theme:safe-one';
test.beforeEach(async ({ page }) => { await page.setViewportSize({ width: 392, height: 792 }); await page.goto(story); });

test('destinations follow the requested order and selection changes', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Pill navigation' });
  await expect(nav.getByRole('button')).toHaveCount(4);
  expect(await nav.getByRole('button').evaluateAll((buttons) => buttons.map((button) => button.getAttribute('aria-label'))))
    .toEqual(['Home', 'Explore', 'Assets', 'Assistant']);
  for (const name of ['Explore', 'Assets', 'Assistant', 'Home']) {
    await nav.getByRole('button', { name, exact: true }).click();
    await expect(nav.getByRole('button', { name, exact: true })).toHaveAttribute('aria-current', 'page');
  }
  await expect(page.getByTestId('pill-navigation')).toHaveScreenshot('pill-navigation.png');
});

test('plus toggles the anchored menu and each action dispatches', async ({ page }) => {
  for (const [label, value] of [['Add cash', 'add-cash'], ['Send', 'send'], ['Receive', 'receive'], ['Trade', 'trade']] as const) {
    await page.getByRole('button', { name: 'Open quick actions', exact: true }).click();
    const menu = page.getByRole('dialog', { name: 'Quick actions' });
    await expect(menu).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close quick actions', exact: true })).toHaveAttribute('aria-expanded', 'true');
    await menu.getByRole('button', { name: label, exact: true }).click();
    await expect(menu).not.toBeVisible();
    await expect(page.getByRole('main').getByRole('status')).toHaveText(`${value} selected`);
    await expect(page.getByRole('button', { name: 'Open quick actions', exact: true }).locator('[class*="plus"]')).toHaveCSS('transform', 'none');
    // Astryx ignores trigger clicks for 50ms after any native popover hide.
    await page.waitForTimeout(60);
  }
});

test('close toggle, Escape and outside click dismiss the popover', async ({ page }) => {
  const open = page.getByRole('button', { name: 'Open quick actions', exact: true });
  const menu = page.getByRole('dialog', { name: 'Quick actions' });
  await open.click();
  await page.getByRole('button', { name: 'Close quick actions', exact: true }).click();
  await expect(menu).not.toBeVisible();
  await open.click();
  await page.keyboard.press('Escape');
  await expect(open).toBeFocused();
  await open.click();
  await page.locator('[class*="scrim"]').click();
  await expect(menu).not.toBeVisible();
});

test('floating menu stays above the trigger at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Open quick actions', exact: true }).click();
  const menu = page.getByRole('dialog', { name: 'Quick actions' });
  const trigger = page.getByRole('button', { name: 'Close quick actions', exact: true });
  await expect(menu).toBeVisible();
  const box = await menu.boundingBox();
  const anchor = await trigger.boundingBox();
  expect(box!.y + box!.height).toBeLessThanOrEqual(anchor!.y);
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(320);
  await expect(menu).toHaveScreenshot('pill-actions.png');
});

test('composer reveals as a full-screen overlay, preserves drafts and submits', async ({ page }) => {
  await page.goto('/iframe.html?id=shell-mobileframe--default&globals=theme:safe-one');
  const assistant = page.getByRole('button', { name: 'Assistant', exact: true });
  await assistant.click();
  const composer = page.getByRole('dialog', { name: 'Assistant composer', exact: true });
  const input = composer.getByRole('textbox', { name: 'Message input', exact: true });
  await expect(input).toBeFocused();
  await input.fill('Compare my holdings');
  await page.getByRole('button', { name: 'Close assistant', exact: true }).click();
  await expect(composer).not.toBeVisible();
  await assistant.click();
  await expect(input).toHaveText('Compare my holdings');
  await composer.getByRole('button', { name: 'Send', exact: true }).click();
  await expect(composer.getByRole('log', { name: 'Assistant transcript', exact: true })).toContainText('Compare my holdings');
});

test('active highlight slides, stretches, and settles after rapid changes', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Pill navigation' });
  await nav.getByRole('button', { name: 'Explore', exact: true }).click();
  const indicator = nav.locator('[data-active]');
  const frames = await indicator.locator('span').evaluate((element) => element.getAnimations().flatMap((animation) =>
    (animation.effect as KeyframeEffect).getKeyframes()));
  expect(frames.some((frame) => frame.transform === 'scaleX(1.18)')).toBe(true);
  await expect(indicator).toHaveCSS('transition-duration', '0.48s, 0.2s');
  await nav.getByRole('button', { name: 'Assistant', exact: true }).click();
  await nav.getByRole('button', { name: 'Home', exact: true }).click();
  await nav.getByRole('button', { name: 'Assets', exact: true }).click();
  await expect(indicator.locator('span')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  await expect.poll(async () => {
    const highlight = await indicator.boundingBox();
    const target = await nav.getByRole('button', { name: 'Assets', exact: true }).boundingBox();
    return Math.abs(highlight!.x - target!.x);
  }).toBeLessThanOrEqual(1);
});

test('selection honors reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Assistant', exact: true }).click();
  await expect(page.locator('[data-active] > span')).toHaveCSS('animation-name', 'none');
});
