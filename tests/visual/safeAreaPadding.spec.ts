import { expect, test } from '@playwright/test';

test('settings toggles the shared top and bottom page safe-area reserve', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 791 });
  await page.goto('/iframe.html?id=shell-mobileframe--default&globals=theme:bastion-aura-light', { waitUntil: 'load' });
  const home = page.locator('main[aria-label="Home"]');
  const padding = () => home.evaluate((element) => ({
    top: parseFloat(getComputedStyle(element).paddingTop),
    bottom: parseFloat(getComputedStyle(element).paddingBottom),
  }));
  const enabled = await padding();
  await page.getByRole('button', { name: 'Open account menu', exact: true }).click();
  await page.getByRole('navigation', { name: 'Account menu' }).getByRole('button', { name: 'Settings', exact: true }).click();
  const toggle = page.getByRole('switch', { name: 'Safe area padding' });
  await expect(toggle).toBeChecked();
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-safe-area-padding', 'off');
  const disabled = await padding();
  expect(enabled.top).toBeGreaterThan(disabled.top);
  expect(enabled.bottom).toBeGreaterThan(disabled.bottom);
  await page.reload({ waitUntil: 'load' });
  await expect(page.locator('html')).toHaveAttribute('data-safe-area-padding', 'off');
  expect(await padding()).toEqual(disabled);
  await page.getByRole('button', { name: 'Open account menu', exact: true }).click();
  await page.getByRole('navigation', { name: 'Account menu' }).getByRole('button', { name: 'Settings', exact: true }).click();
  await toggle.click();
  await expect(page.locator('html')).not.toHaveAttribute('data-safe-area-padding', 'off');
  expect(await padding()).toEqual(enabled);
});
