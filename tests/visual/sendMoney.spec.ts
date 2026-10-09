import { test, expect, type Page } from '@playwright/test';
const story = '/iframe.html?id=shell-mobileframe--send-to-daniel&globals=theme:safe-one';
const flow = (page: Page) => page.getByRole('log', { name: 'Assistant transcript', exact: true }).getByRole('region', { name: 'Send money conversation' });
async function chooseDaniel(page: Page) {
  await flow(page).locator('[data-approval-card="send-recipient"] .astryx-radio-list-item:has(input[value="daniel-smith"])').click();
  await flow(page).getByRole('button', { name: 'Continue', exact: true }).click();
}
async function consolidate(page: Page) {
  await chooseDaniel(page);
  await flow(page).getByRole('radio', { name: 'Consolidate your stable USD balances', exact: true }).click();
  await flow(page).getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(flow(page).locator('[data-payment-card="review"]')).toBeVisible();
}
test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 392, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(story);
});

test('visible checks, internal consolidation, then explicit transfer approval', async ({ page }) => {
  await expect(flow(page).getByText('Checking balances across your accounts…', { exact: true })).toBeVisible();
  await expect(flow(page).getByText('Looking up Daniel…', { exact: true })).toBeVisible();
  await expect(flow(page).getByText('I found two Daniels: Daniel Smith or Daniel Jones.', { exact: true })).toBeVisible();
  await expect(flow(page).getByText('Available across accounts', { exact: true })).toHaveCount(0);
  await expect(flow(page).getByRole('button', { name: 'Skip', exact: true })).toHaveCount(0);
  await expect(flow(page).getByText('1 of 2', { exact: true })).toBeVisible();
  await expect(flow(page).getByRole('button', { name: 'Continue', exact: true })).toBeDisabled();
  await expect(flow(page).locator('[data-approval-card="send-recipient"] .astryx-radio')).toHaveCount(2);
  await expect(flow(page).locator('[data-approval-card="send-recipient"] .astryx-radio').first()).toBeHidden();
  await consolidate(page);
  const card = flow(page).locator('[data-payment-card="review"]');
  await expect(card).toContainText('Transfer to Daniel Smith');
  await expect(card).toContainText('$50.00');
  await expect(card).toContainText('$0.08');
  await expect(card).toHaveScreenshot('send-paul-review.png');
  await card.getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(flow(page).locator('[data-payment-card="sent"]').getByRole('status')).toHaveText('Transfer complete.');
  const reply = flow(page).getByText('$50 was sent to Daniel Smith. Anything else, Prem?', { exact: true });
  await expect(reply).toBeVisible();
  const replyFace = await reply.evaluate((element) => getComputedStyle(element).fontFamily);
  const agentFace = await reply.evaluate((element) => getComputedStyle(element).getPropertyValue('--face-voice').trim());
  expect(replyFace.replaceAll('"', '')).toBe(agentFace.replaceAll('"', ''));
  await expect(flow(page).getByRole('button', { name: 'Confirm', exact: true })).toHaveCount(0);
});

test('edit validates amount plus fee and returns to review; cancel keeps consolidation', async ({ page }) => {
  await consolidate(page);
  await flow(page).getByRole('button', { name: 'Edit', exact: true }).click();
  await flow(page).getByRole('textbox', { name: 'Amount in USD', exact: true }).fill('62');
  await expect(flow(page).getByRole('alert')).toContainText('$0.08');
  await expect(flow(page).getByRole('button', { name: 'Review changes', exact: true })).toBeDisabled();
  await flow(page).getByRole('textbox', { name: 'Amount in USD', exact: true }).fill('45');
  await flow(page).getByRole('textbox', { name: 'Payment note', exact: true }).fill('Coffee and cake');
  await flow(page).getByRole('button', { name: 'Review changes', exact: true }).click();
  await expect(flow(page)).toContainText('Transfer to Daniel Smith');
  await flow(page).getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(flow(page).getByRole('status')).toHaveText('Transfer cancelled');
  await expect(flow(page).getByText('Transfer cancelled. Consolidated funds remain in Main.', { exact: true })).toBeVisible();
});

test('typed request stays inline and mode switching retains the same review', async ({ page }) => {
  await page.goto('/iframe.html?id=shell-mobileframe--composer-open&globals=theme:safe-one');
  await page.getByRole('textbox', { name: 'Message input', exact: true }).fill('Send $50 to Daniel for coffee');
  await page.getByRole('dialog', { name: 'Assistant composer' }).getByRole('button', { name: 'Send', exact: true }).click();
  await expect(page.getByTestId('mobile-shell')).toHaveAttribute('data-mode', 'composer');
  await consolidate(page);
  await page.getByRole('button', { name: 'Start conversation mode', exact: true }).click();
  const active = page.getByRole('dialog', { name: 'Assistant conversation' }).getByRole('region', { name: 'Send money conversation' });
  await expect(active).toHaveCount(1);
  await expect(active).toContainText('Transfer to Daniel Smith');
  await active.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(active).toContainText('Transfer cancelled. Consolidated funds remain in Main.');
});

test('alternate card funding is reviewed separately from sending', async ({ page }) => {
  await chooseDaniel(page);
  await flow(page).getByRole('radio', { name: 'Buy more USDT with your card', exact: true }).click();
  await flow(page).getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(flow(page).locator('[data-payment-card="funding"]')).toContainText('Buy USDT with your card');
  await flow(page).getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(flow(page).locator('[data-payment-card="review"]')).toBeVisible();
  await expect(flow(page)).toContainText('Transfer to Daniel Smith');
  await expect(flow(page)).toHaveAttribute('data-send-stage', 'review');
  await expect(flow(page).getByText('Payment simulated.', { exact: false })).toHaveCount(0);
});

test('recipient choice remains keyboard accessible with its visual radio hidden', async ({ page }) => {
  const recipient = flow(page).getByRole('radio', { name: 'Daniel Jones', exact: true });
  await recipient.focus();
  await recipient.press('Space');
  await expect(flow(page).getByRole('button', { name: 'Continue', exact: true })).toBeEnabled();
  await flow(page).getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(flow(page).locator('[data-approval-card="send-funding"]')).toBeVisible();
});

test('chat arrows revisit both questions without losing the recipient', async ({ page }) => {
  await flow(page).getByRole('radio', { name: 'Daniel Jones', exact: true }).press('Space');
  await expect(flow(page).getByText('1 of 2', { exact: true })).toBeVisible();
  await flow(page).getByRole('button', { name: 'Next question', exact: true }).click();
  await expect(flow(page).getByText('2 of 2', { exact: true })).toBeVisible();
  await flow(page).getByRole('button', { name: 'Previous question', exact: true }).click();
  await expect(flow(page).getByText('1 of 2', { exact: true })).toBeVisible();
  await expect(flow(page).getByRole('radio', { name: 'Daniel Jones', exact: true })).toBeChecked();
  await flow(page).getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(flow(page).getByText('2 of 2', { exact: true })).toBeVisible();
});

test('switching between chat and voice changes controls without resetting the question', async ({ page }) => {
  await chooseDaniel(page);
  await expect(flow(page).getByText('2 of 2', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Start conversation mode', exact: true }).click();
  const voice = page.getByRole('dialog', { name: 'Assistant conversation' }).getByRole('region', { name: 'Send money conversation' });
  await expect(voice.locator('[data-approval-card="send-funding"]')).toBeVisible();
  await expect(voice.getByRole('button', { name: 'Continue', exact: true })).toHaveCount(0);
  await page.getByRole('dialog', { name: 'Assistant conversation' }).getByRole('button', { name: 'Close conversation', exact: true }).click();
  await expect(flow(page).getByText('2 of 2', { exact: true })).toBeVisible();
});

test('payment component fits 320px and preserves readable details and action chips', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 850 });
  await page.goto('/iframe.html?id=nodes-paymentcard--review&globals=theme:safe-one');
  const card = page.locator('[data-payment-card="review"]');
  await expect(card.getByRole('button', { name: 'Confirm', exact: true })).toBeVisible();
  expect(await card.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  await expect(card).toHaveScreenshot('payment-card-narrow.png');
});
