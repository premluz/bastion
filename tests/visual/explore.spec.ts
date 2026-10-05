import { test, expect } from '@playwright/test';
const story = '/iframe.html?id=shell-mobileframe--default&globals=theme:safe-one';
test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 392, height: 792 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(story);
  await page.getByRole('button', { name: 'Explore', exact: true }).click();
});

test('All composes rows, cards, sparklines and linked groups', async ({ page }) => {
  const explore = page.getByRole('main', { name: 'Explore', exact: true });
  await expect(explore.getByRole('navigation', { name: 'Explore Categories' })).toBeVisible();
  await expect(explore.getByText('$5.2M cap · $3.7M vol', { exact: true })).toBeVisible();
  await expect(explore.getByRole('img', { name: 'Trend glyph' })).toHaveCount(3);
  await expect(explore.getByRole('heading')).toHaveText(['Trending', 'Perps', 'Earn', 'Stocks', 'Perps', 'Lists']);
  await expect(explore.getByRole('region', { name: 'Trending', exact: true })).toHaveScreenshot('explore-trending.png');
  await expect(explore.getByRole('region', { name: 'Perps', exact: true }).first()).toHaveScreenshot('explore-perps.png');
  await expect(explore.getByRole('region', { name: 'Earn', exact: true }).first()).toHaveScreenshot('explore-earn.png');
});

test('category tabs navigate while lists and asset links explain prototype limits', async ({ page }) => {
  const explore = page.getByRole('main', { name: 'Explore', exact: true });
  const tabs = explore.getByRole('navigation', { name: 'Explore Categories' });
  await tabs.getByRole('link', { name: 'Commodities', exact: true }).click();
  await expect(explore.getByText('Gold', { exact: true })).toBeVisible();
  await expect(explore.getByText('perpspad', { exact: true })).toHaveCount(0);
  await tabs.getByRole('link', { name: 'Perps', exact: true }).click();
  await explore.getByRole('link', { name: 'Forex', exact: true }).click();
  await expect(explore.getByText('Euro / US Dollar', { exact: true })).toBeVisible();
  await tabs.getByRole('link', { name: 'All', exact: true }).click();
  const notice = 'This section is not available in the prototype yet.';
  const listLink = explore.getByRole('link', { name: 'Blue Chips', exact: true });
  await listLink.hover();
  await expect(page.getByRole('tooltip')).toHaveText(notice);
  await listLink.click();
  await expect(page.getByRole('status').filter({ hasText: notice })).toBeVisible();
  await expect(explore.getByRole('heading', { name: 'Blue Chips', exact: true })).toHaveCount(0);
  await explore.locator('[data-explore-link="#explore/asset/eth"]').click();
  await expect(page.getByRole('status').filter({ hasText: notice })).toBeVisible();
  await expect(explore.getByRole('navigation', { name: 'Explore Categories' })).toBeVisible();
  await page.getByRole('button', { name: 'Home', exact: true }).click();
  await expect(page.getByRole('main', { name: 'Home', exact: true })).toBeVisible();
});

test('320px layout contains rows and scrollable cards without page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  const explore = page.getByRole('main', { name: 'Explore', exact: true });
  await expect(explore.getByText('perpspad', { exact: true })).toBeVisible();
  expect(await explore.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
  await expect(explore.getByRole('region', { name: 'Stocks', exact: true })).toHaveScreenshot('explore-stocks-narrow.png');
});

test('default nav opens a full-screen composer and aligns popover icons with close', async ({ page }) => {
  await page.getByRole('button', { name: 'Assistant', exact: true }).click();
  const composer = page.getByRole('dialog', { name: 'Assistant composer', exact: true });
  await expect(composer).toBeVisible();
  await page.getByRole('button', { name: 'Close assistant', exact: true }).click();
  await expect(composer).not.toBeVisible();
  await page.getByRole('button', { name: 'Open quick actions', exact: true }).click();
  const menu = page.getByRole('dialog', { name: 'Quick actions' });
  const trigger = await page.getByRole('button', { name: 'Close quick actions', exact: true }).boundingBox();
  for (const label of ['Add cash', 'Send', 'Receive', 'Trade']) {
    const button = menu.getByRole('button', { name: label, exact: true });
    const icon = await button.locator('svg').boundingBox();
    expect(Math.abs(icon!.x + icon!.width / 2 - trigger!.x - trigger!.width / 2)).toBeLessThan(1);
    await expect(button).toHaveCSS('text-align', 'right');
    await expect(button).toHaveCSS('box-shadow', 'none');
    await expect(button).toHaveCSS('border-top-width', '0px');
  }
});

test('Home retains owned quantities and row selection after sharing AssetRow', async ({ page }) => {
  await page.getByRole('button', { name: 'Home', exact: true }).click();
  const home = page.getByRole('main', { name: 'Home', exact: true });
  const row = home.locator('[data-asset-id="eth"]');
  await expect(row).toBeVisible();
  await row.click();
  await expect(row).toHaveAttribute('aria-selected', 'true');
  await row.click();
  await expect(row).not.toHaveAttribute('aria-selected');
  await expect(row).not.toContainText('cap');
  await expect(row).toHaveScreenshot('owned-asset-row.png');
});


test('card chart reaches both edges and bottom with a gradient area', async ({ page }) => {
  const card = page.locator('[data-explore-link="#explore/asset/btc"] .astryx-clickable-card');
  const chart = card.getByRole('img', { name: 'Trend glyph' });
  await expect(chart).toBeVisible();
  await expect.poll(() => card.evaluate((element) => {
    const svg = element.querySelector('svg[aria-label="Trend glyph"]')!;
    const box = element.getBoundingClientRect();
    const plot = svg.getBoundingClientRect();
    return Math.max(Math.abs(plot.left - box.left), Math.abs(box.right - plot.right), Math.abs(box.bottom - plot.bottom));
  })).toBeLessThan(1);
  await expect(chart.locator('linearGradient stop')).toHaveCount(2);
  await expect(chart.locator('path').first()).toHaveAttribute('fill', /^url/);
});
