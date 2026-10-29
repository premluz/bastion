import { expect, test } from '@playwright/test';

for (const theme of ['bastion-aura', 'bastion-aura-light']) {
  test(`center cube opens chat in ${theme}`, async ({ page }) => {
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
}
