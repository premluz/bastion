import { expect, test } from '@playwright/test';

test('forex pairs render two complete overlapping circular flags', async ({ page }) => {
  await page.setViewportSize({ width: 392, height: 792 });
  await page.goto('/iframe.html?id=shell-mobileframe--default&globals=theme:bastion-aura-light', { waitUntil: 'load' });
  await page.getByRole('button', { name: 'Explore', exact: true }).click();
  const explore = page.getByRole('main', { name: 'Explore', exact: true });
  await explore.getByRole('link', { name: 'Forex', exact: true }).click();
  for (const id of ['eurusd', 'gbpusd']) {
    const logo = explore.locator(`[data-asset-id="${id}"] [data-variant="forex"]`);
    await expect(logo.locator('img')).toHaveCount(2);
    const geometry = await logo.evaluate((element) => {
      const images = element.querySelectorAll('img');
      const backImage = images.item(0);
      const frontImage = images.item(1);
      if (!backImage || !frontImage) throw new Error('Forex logo must contain two flag images');
      const back = backImage.getBoundingClientRect();
      const front = frontImage.getBoundingClientRect();
      const root = element.getBoundingClientRect();
      return {
        backSize: back.width,
        frontSize: front.width,
        backRound: getComputedStyle(backImage).borderRadius,
        frontRound: getComputedStyle(frontImage).borderRadius,
        rootSize: root.width,
        frontRight: front.right,
        backRight: back.right,
        frontBottom: front.bottom,
        backBottom: back.bottom,
      };
    });
    expect(geometry.backSize).toBeGreaterThan(geometry.rootSize / 2);
    expect(geometry.frontSize).toBe(geometry.backSize);
    expect(geometry.backRound).toBe(geometry.frontRound);
    expect(geometry.frontRight).toBeGreaterThan(geometry.backRight);
    expect(geometry.frontBottom).toBeGreaterThan(geometry.backBottom);
  }
});
