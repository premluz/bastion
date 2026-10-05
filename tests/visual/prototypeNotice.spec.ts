import { test, expect } from '@playwright/test';

const story = '/iframe.html?id=shell-mobileframe--default&globals=theme:safe-one';
const notice = 'This section is not available in the prototype yet.';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 392, height: 792 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(story);
});

test('wallet actions and quick actions explain unavailable prototype paths', async ({ page }) => {
  await page.getByRole('button', { name: 'Assets', exact: true }).click();
  const addMoney = page.getByRole('button', { name: 'Add money', exact: true });
  await addMoney.hover();
  await expect(page.getByRole('tooltip')).toHaveText(notice);
  await addMoney.click();
  await expect(page.getByRole('status').filter({ hasText: notice })).toBeVisible();

  await page.getByRole('button', { name: 'Open quick actions', exact: true }).click();
  const quickActions = page.getByRole('dialog', { name: 'Quick actions' });
  const addCash = quickActions.getByRole('button', { name: 'Add cash', exact: true });
  await addCash.hover();
  await expect(page.getByRole('tooltip')).toHaveText(notice);
  await addCash.click();
  await expect(page.getByRole('status').filter({ hasText: notice })).toBeVisible();

  await page.getByRole('button', { name: 'Manage', exact: true }).click();
  const cardDetails = page.getByRole('dialog', { name: /details$/ });
  await expect(cardDetails).toBeVisible();
  await cardDetails.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(cardDetails).not.toBeVisible();
  await page.locator('[data-testid^="history-"]').first().click();
  await expect(page.getByRole('status').filter({ hasText: notice })).toBeVisible();
});

test('settings remains active while other account sections explain their limits', async ({ page }) => {
  await page.getByRole('button', { name: 'Open account menu', exact: true }).click();
  const menu = page.getByRole('navigation', { name: 'Account menu' });
  const profile = menu.getByRole('button', { name: 'Profile', exact: true });
  await profile.hover();
  await expect(page.getByRole('tooltip')).toHaveText(notice);
  await profile.click();
  await expect(page.getByRole('status').filter({ hasText: notice })).toBeVisible();
  await menu.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Settings', exact: true })).toBeVisible();
});

test('Explorer tabs navigate while internal links show the prototype notice', async ({ page }) => {
  await page.getByRole('button', { name: 'Explore', exact: true }).click();
  const explore = page.getByRole('main', { name: 'Explore', exact: true });
  const categories = explore.getByRole('navigation', { name: 'Explore Categories' });
  await categories.getByRole('link', { name: 'Commodities', exact: true }).click();
  await expect(explore.getByText('Gold', { exact: true })).toBeVisible();
  await categories.getByRole('link', { name: 'All', exact: true }).click();

  const internalLink = explore.locator('[data-explore-link="#explore/list/blue-chips"]');
  await internalLink.hover();
  await expect(page.getByRole('tooltip')).toHaveText(notice);
  await internalLink.click();
  await expect(page.getByRole('status').filter({ hasText: notice })).toBeVisible();
  await expect(explore.getByRole('heading', { name: 'Blue Chips', exact: true })).toHaveCount(0);
});
