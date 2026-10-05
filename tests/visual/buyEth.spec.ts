import { test, expect } from '@playwright/test';

const story = '/iframe.html?id=shell-mobileframe--buy-eth&globals=theme:safe-one';
test.beforeEach(async ({ page }) => { await page.setViewportSize({ width: 392, height: 850 }); });

for (const currency of ['USDT', 'USDC']) {
  test(`${currency} follows the full staged purchase flow`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(story);
    const flow = page.getByLabel('ETH purchase conversation');
    await expect(flow.getByText('Thinking...', { exact: true })).toBeVisible();
    await expect(flow.getByText('Thinking...', { exact: true })).not.toHaveCSS('animation-name', 'none');
    await expect(flow.getByRole('radio', { name: currency, exact: true })).toBeVisible();
    await expect(flow.locator('header').getByText('Got it. Which would you like to fund it with?', { exact: true })).toBeVisible();
    await flow.getByRole('radio', { name: currency, exact: true }).click();
    await expect(flow.getByText(`Perfect. You want to use your ${currency} balance.`, { exact: true })).toBeVisible();
    await expect(flow.getByText('Finding best price...', { exact: true })).toBeVisible();
    await expect(flow.locator('[data-approval-card]')).toHaveCount(0);
    await expect(flow.getByText('Generating interface...', { exact: true })).toBeVisible();
    await expect(flow.getByText("Here's what that would get you:", { exact: true })).toBeVisible();
    await expect(flow.getByText(`800.00 ${currency}`, { exact: true })).toBeVisible();
    await expect(flow.getByText('0.2980 ETH', { exact: true })).toBeVisible();
    await flow.getByRole('button', { name: 'Confirm Purchase', exact: true }).click();
    await expect(flow.getByRole('button', { name: 'Purchase simulated', exact: true })).toBeDisabled();
    await expect(flow.getByText('Purchase simulated. Your real balances are unchanged.', { exact: true })).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('typed entry, insufficient balance and exiting work', async ({ page }) => {
  await page.goto('/iframe.html?id=shell-mobileframe--composer-open&globals=theme:safe-one');
  await page.getByRole('textbox', { name: 'Message input', exact: true }).fill('Buy Ethereum for $1000');
  await page.getByRole('region', { name: 'Assistant composer' }).getByRole('button', { name: 'Send', exact: true }).click();
  await expect(page.getByRole('radio', { name: 'USDT', exact: true })).toBeDisabled();
  await expect(page.getByRole('radio', { name: 'USDC', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Close purchase flow' }).click();
  await expect(page.getByRole('textbox', { name: 'Message input', exact: true })).toBeVisible();
});

test('one-second price stage, fade and scene-driven stagger', async ({ page }) => {
  await page.goto(story);
  await page.getByRole('radio', { name: 'USDT', exact: true }).click();
  const flow = page.getByLabel('ETH purchase conversation');
  const exit = await flow.locator('[data-leaving="true"]').evaluate((element) => ({
    duration: getComputedStyle(element).animationDuration,
    frames: element.getAnimations().flatMap((animation) => (animation.effect as KeyframeEffect).getKeyframes()),
  }));
  expect(exit.duration).toBe('0.32s');
  expect(exit.frames.some((frame) => frame.opacity === '0')).toBe(true);
  const transitions = await flow.evaluate((element) => new Promise<{ stage: string | null; time: number }[]>((resolve) => {
    const records = [{ stage: element.getAttribute('data-stage'), time: performance.now() }];
    const observer = new MutationObserver(() => {
      const stage = element.getAttribute('data-stage');
      records.push({ stage, time: performance.now() });
      if (stage === 'quote') { observer.disconnect(); resolve(records); }
    });
    observer.observe(element, { attributes: true, attributeFilter: ['data-stage'] });
  }));
  const price = transitions.find((record) => record.stage === 'price')!;
  const generated = transitions.find((record) => record.stage === 'interface')!;
  expect(generated.time - price.time).toBeGreaterThanOrEqual(950);
  expect(generated.time - price.time).toBeLessThan(1300);
  await expect(flow.getByRole('button', { name: 'Confirm Purchase', exact: true })).toBeVisible();
  const delays = await flow.locator('[class*="nodeWrapper"]').evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).animationDelay));
  expect(new Set(delays).size).toBeGreaterThan(3);
});

test('narrow reduced-motion quote baseline', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 850 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(story);
  await page.getByRole('radio', { name: 'USDT', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Confirm Purchase', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const card = page.locator('.astryx-card').last();
  await expect(card).toHaveScreenshot('purchase-card.png');
  await expect(page.getByLabel('ETH purchase conversation').locator('[class*="nodeWrapper"]').last()).toHaveCSS('animation-name', 'none');
});
