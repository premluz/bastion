import { expect, test } from '@playwright/test';

for (const theme of ['bastion-aura', 'bastion-aura-light']) {
  test(`center cube opens chat in ${theme}`, async ({ page }) => {
    test.setTimeout(60_000);
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.setViewportSize({ width: 393, height: 791 });
    await page.goto(`/iframe.html?id=shell-mobileframe--attention-home-monolith&globals=theme:${theme}`, { waitUntil: 'load' });
    await expect(page.locator('[data-live-dock-cube] canvas')).toBeVisible({ timeout: 45_000 });
    await page.getByRole('button', { name: 'Open assistant', exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'Message input', exact: true })).toBeFocused();
    await expect(page.locator('[data-chat-cube]')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test(`monolith menu uses the card and fade treatment in ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 791 });
    await page.goto(`/iframe.html?id=shell-mobileframe--attention-home-monolith&globals=theme:${theme}`, { waitUntil: 'load' });
    await expect(page.getByRole('button', { name: 'Search', exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
    const menu = page.getByTestId('monolith-nav-menu');
    await expect(menu.getByRole('button')).toHaveText(['Search', 'Explore', 'Money', 'Investments', 'Home']);
    const scrim = page.getByTestId('monolith-menu-scrim');
    await expect(scrim).toBeVisible();
    expect(await scrim.evaluate((element) => getComputedStyle(element).backdropFilter)).toBe('none');
    await scrim.click({ position: { x: 200, y: 100 } });
    await expect(menu).toBeHidden();
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
    await menu.getByRole('button', { name: 'Explore', exact: true }).click();
    await expect(page.getByRole('main', { name: 'Explore' })).toBeVisible();
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
    await menu.getByRole('button', { name: 'Money', exact: true }).click();
    await expect(page.getByRole('main', { name: 'Wallet', exact: true }).getByRole('heading', { name: '$3,475.45' })).toBeVisible();
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
    await menu.getByRole('button', { name: 'Investments', exact: true }).click();
    await expect(page.getByRole('main', { name: 'Wallet', exact: true }).getByRole('heading', { name: '$5,445.70' })).toBeVisible();
    await page.getByRole('button', { name: 'Open quick actions', exact: true }).click();
    const actions = page.getByTestId('monolith-action-menu');
    await expect(actions.getByRole('button')).toHaveText(['Add cash', 'Send', 'Receive', 'Trade']);
    expect(await actions.evaluate((element) => getComputedStyle(element.parentElement?.parentElement ?? element).backgroundColor))
      .not.toBe('rgba(0, 0, 0, 0)');
  });
}
