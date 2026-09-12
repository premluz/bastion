import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const STORY = '/iframe.html?id=shell-tabbar--idle&globals=theme:safe-one';
const assistant = (page: Page) => page.getByRole('button', { name: 'Assistant', exact: true });
const conversation = (page: Page) => page.getByRole('dialog', { name: 'Assistant conversation', exact: true });

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 392, height: 792 });
  await page.goto(STORY);
  await expect(assistant(page)).toBeVisible();
});

test('complete flow keeps the selected destination and user messages', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.getByRole('button', { name: 'Markets', exact: true }).click();
  await assistant(page).click();
  await expect(assistant(page)).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('button', { name: 'Markets', exact: true })).toHaveAttribute('aria-current', 'page');
  const input = page.getByRole('textbox', { name: 'Message input', exact: true });
  await expect(input).toBeFocused();
  await input.fill('Show my holdings.');
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await expect(page.getByRole('main')).toContainText('Show my holdings.');
  await input.fill('Compare them over the past week.');
  await page.getByRole('button', { name: 'Start conversation mode', exact: true }).click();
  await expect(conversation(page)).toBeVisible();
  await expect(conversation(page)).toContainText('Show my holdings.');
  await expect(conversation(page)).toContainText('Compare them over the past week.');
  await expect(conversation(page).getByRole('button', { name: 'Microphone unavailable in preview', exact: true })).toBeDisabled();
  await expect(page.getByRole('navigation', { name: 'Primary navigation', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Close conversation', exact: true }).click();
  await expect(conversation(page)).not.toBeVisible();
  await expect(assistant(page)).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('main').getByText('Compare them over the past week.', { exact: true })).toHaveCount(1);
  await page.getByRole('button', { name: 'Close composer', exact: true }).click();
  await expect(assistant(page)).toHaveAttribute('aria-expanded', 'false');
  await expect(assistant(page)).toBeFocused();
  expect(errors).toEqual([]);
});

test('keyboard closes the modal and restores its trigger without losing a draft', async ({ page }) => {
  await assistant(page).focus();
  await page.keyboard.press('Enter');
  const input = page.getByRole('textbox', { name: 'Message input', exact: true });
  await input.fill('An unfinished draft');
  await assistant(page).click();
  await assistant(page).click();
  await expect(input).toHaveText('An unfinished draft');
  const trigger = page.getByRole('button', { name: 'Start conversation mode', exact: true });
  await trigger.click();
  await expect(conversation(page)).toBeVisible();
  for (let index = 0; index < 5; index++) {
    await page.keyboard.press('Tab');
    expect(await conversation(page).evaluate((element) => element.matches(':modal'))).toBe(true);
    expect(await page.locator('[inert]').evaluateAll((elements) => elements.some((element) => element.contains(document.activeElement)))).toBe(false);
  }
  await page.keyboard.press('Escape');
  await expect(conversation(page)).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

for (const width of [320, 392, 430]) {
  test(`long and unbroken messages fit ${width}px with reachable controls`, async ({ page }) => {
    await page.setViewportSize({ width, height: 640 });
    await page.goto('/iframe.html?id=shell-tabbar--long-transcript&globals=theme:safe-one');
    const input = page.getByRole('textbox', { name: 'Message input', exact: true });
    await input.fill('asset_'.repeat(80));
    await page.getByRole('button', { name: 'Send', exact: true }).click();
    for (const name of ['Home', 'Markets', 'Assistant', 'Trade', 'Assets']) {
      const bounds = await page.getByRole('button', { name, exact: true }).boundingBox();
      if (!bounds) throw new Error(`${name} has no bounding box`);
      expect(bounds.width).toBeGreaterThanOrEqual(44);
      expect(bounds.height).toBeGreaterThanOrEqual(44);
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(640);
    }
    expect(await page.getByTestId('mobile-shell').evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    const transcript = page.getByRole('main');
    expect(await transcript.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
    expect(await transcript.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    await page.getByRole('button', { name: 'Start conversation mode', exact: true }).click();
    await expect(conversation(page)).toBeVisible();
    const log = conversation(page).getByRole('log');
    expect(await log.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    await expect(conversation(page).getByRole('button', { name: 'Close conversation', exact: true })).toBeInViewport();
  });
}

test('safe-one states have stable component screenshots', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const phone = page.getByTestId('mobile-shell');
  await expect(phone).toHaveScreenshot('safe-one-idle.png', { maxDiffPixelRatio: 0 });
  await assistant(page).click();
  await expect(phone).toHaveScreenshot('safe-one-composer.png', { maxDiffPixelRatio: 0 });
  await page.getByRole('textbox', { name: 'Message input', exact: true }).fill('Show my holdings.');
  await page.getByRole('button', { name: 'Start conversation mode', exact: true }).click();
  await expect(conversation(page)).toHaveScreenshot('safe-one-conversation.png', { maxDiffPixelRatio: 0 });
  const durations = await conversation(page).evaluate((element) =>
    element.getAnimations({ subtree: true }).map((animation) => animation.effect?.getTiming().duration));
  expect(durations).toEqual([]);
});

test('all new component stories boot from the built index', async ({ page, request }) => {
  const response = await request.get('/index.json');
  expect(response.ok()).toBe(true);
  const body: unknown = await response.json();
  expect(body).toHaveProperty('entries');
  const ids = ['shell-assistantorb--idle', 'shell-assistantorb--listening', 'shell-assistantorb--thinking',
    'shell-chatbarcomposer--local-submission', 'shell-conversationmodeoverlay--listening',
    'shell-tabbar--composer-open', 'shell-tabbar--conversation'];
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const id of ids) {
    await page.goto(`/iframe.html?id=${id}&globals=theme:safe-one`);
    await expect(page.locator('#storybook-root > *').first()).toBeVisible();
    await expect(page.locator('.sb-errordisplay')).not.toBeVisible();
  }
  expect(errors).toEqual([]);
});

test('safe-one shell tokens resolve and chrome motion uses the semantic timings', async ({ page }) => {
  const tokens = [...readFileSync('app/src/theme/shell.safe-one.css', 'utf8').matchAll(/(--[\w-]+)\s*:/g)]
    .map((match) => match[1]).filter((name): name is string => typeof name === 'string');
  const missing = await page.evaluate((names) => {
    const styles = getComputedStyle(document.documentElement);
    return names.filter((name) => !styles.getPropertyValue(name).trim());
  }, tokens);
  expect(missing).toEqual([]);
  await assistant(page).click();
  await page.getByRole('button', { name: 'Start conversation mode', exact: true }).click();
  const result = await page.locator('header[aria-label="Asset search"]').evaluate(async (header) => {
    await Promise.all(header.getAnimations().map((animation) => animation.finished));
    const style = getComputedStyle(header);
    return { opacity: style.opacity, duration: style.transitionDuration,
      expected: style.getPropertyValue('--motion-exit-duration').trim() };
  });
  expect(result.opacity).toBe('0');
  const expectedSeconds = parseFloat(result.expected) / (result.expected.endsWith('ms') ? 1000 : 1);
  expect(parseFloat(result.duration)).toBe(expectedSeconds);
});

test('existing Frame story still boots', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/iframe.html?id=shell-frame--default&globals=theme:safe-one');
  await expect(page.locator('#storybook-root > *').first()).toBeVisible();
  await expect(page.locator('.sb-errordisplay')).not.toBeVisible();
  expect(errors).toEqual([]);
});
