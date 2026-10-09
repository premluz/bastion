import { expect, test, type Page } from '@playwright/test';

const story = '/iframe.html?id=shell-mobileframe--send-to-daniel&globals=theme:safe-one';
const conversation = (page: Page) => page.getByRole('region', { name: 'Send money conversation' });

async function openFunding(page: Page) {
  await page.goto(story);
  const flow = conversation(page);
  await flow.locator('[data-approval-card="send-recipient"] .astryx-radio-list-item:has(input[value="daniel-smith"])').click();
  await flow.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(flow.getByText('Where should the $50 come from?', { exact: true })).toBeVisible();
  return flow;
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 392, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
});

test('funding choices have concise copy and custom funding stays unapproved', async ({ page }) => {
  const flow = await openFunding(page);
  await expect(flow.getByRole('radio')).toHaveCount(4);
  await expect(flow.getByRole('button', { name: 'Continue', exact: true })).toBeDisabled();
  await expect(flow.getByRole('button', { name: 'Skip', exact: true })).toHaveCount(0);
  await expect(flow.getByText('USDC + USDT across your accounts · $62.00 total', { exact: true })).toHaveCount(0);
  await expect(flow.getByText('I’ll show you a simulated swap first', { exact: true })).toHaveCount(0);
  await expect(flow.getByText('I’ll show you a simulated purchase first', { exact: true })).toHaveCount(0);
  await flow.getByRole('radio', { name: 'Something else', exact: true }).click();
  await expect(flow.getByText('Tell me what you’d like to use in the composer.', { exact: true })).toBeVisible();
  await flow.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(flow).toHaveAttribute('data-send-stage', 'options');
});

test('inline sending ripples fit inside their route', async ({ page }) => {
  await page.goto('/iframe.html?id=nodes-paymentcard--inline-pending&globals=theme:safe-one');
  const fits = await page.locator('[data-payment-card="sending"]').evaluate((card) => {
    const route = card.querySelector('[data-pending]');
    const ripple = route?.querySelector('span');
    if (!(route instanceof HTMLElement) || !(ripple instanceof HTMLElement)) throw new Error('Pending route unavailable');
    return ripple.offsetHeight <= route.clientHeight && ripple.offsetWidth <= route.clientWidth;
  });
  expect(fits).toBe(true);
});

test('transfer card shrinks smoothly into sending and stays settled on completion', async ({ page }) => {
  const flow = await openFunding(page);
  await flow.getByRole('radio', { name: 'Consolidate your stable USD balances', exact: true }).click();
  await flow.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(flow.locator('[data-payment-card="review"]')).toBeVisible();

  const heights = await page.evaluate(async () => {
    const card = document.querySelector('[data-payment-card="review"]');
    const accept = card?.querySelector('[data-payment-action="accept"] button');
    if (!(card instanceof HTMLElement) || !(accept instanceof HTMLButtonElement)) throw new Error('Review card unavailable');
    const samples = [card.getBoundingClientRect().height];
    accept.click();
    const start = performance.now();
    const duration = getComputedStyle(document.documentElement).getPropertyValue('--duration-480').trim();
    const milliseconds = parseFloat(duration) * (duration.endsWith('ms') ? 1 : 1000);
    do {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const current = document.querySelector('[data-payment-card="sending"]');
      if (current instanceof HTMLElement) samples.push(current.getBoundingClientRect().height);
    } while (performance.now() - start < milliseconds * 2);
    return samples;
  });

  const first = heights[0];
  const last = heights.at(-1);
  if (first === undefined || last === undefined) throw new Error('Payment card heights unavailable');
  expect(first).toBeGreaterThan(last);
  expect(heights.some((height) => height < first && height > last)).toBe(true);
  await expect(flow.getByText('Transfer complete.', { exact: true })).toBeVisible();
  const completed = flow.locator('[data-payment-card="sent"]');
  await expect(completed).toBeVisible();
  expect(await completed.evaluate((element, settledHeight) => Math.abs(element.getBoundingClientRect().height - settledHeight), last)).toBeLessThan(1);
  await expect(completed.getByRole('button', { name: 'Confirm', exact: true })).toHaveCount(0);
});
