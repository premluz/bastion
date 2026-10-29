import { expect, test } from '@playwright/test';

test('main money balances use 32px and card values use XL', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 791 });
  await page.goto('/iframe.html?id=shell-mobileframe--default&globals=theme:bastion-aura-light', { waitUntil: 'load' });
  const home = page.getByRole('main', { name: 'Home', exact: true });
  await expect(home.getByRole('heading', { level: 1 })).toHaveCSS('font-size', '32px');
  const balanceCards = home.locator('[data-balance-tiles]');
  await expect(balanceCards.getByText('$3,475.45', { exact: true })).toHaveCSS('font-size', '20px');
  await expect(balanceCards.getByText('$5,445.70', { exact: true })).toHaveCSS('font-size', '20px');
  await page.setViewportSize({ width: 320, height: 700 });
  for (const amount of ['$3,475.45', '$5,445.70']) {
    const fits = await balanceCards.getByText(amount, { exact: true }).evaluate((element) => {
      const card = element.parentElement;
      if (!card) throw new Error('Balance value is missing its card');
      return element.getBoundingClientRect().right <= card.getBoundingClientRect().right - parseFloat(getComputedStyle(card).paddingRight);
    });
    expect(fits).toBe(true);
  }
  await page.getByRole('button', { name: 'Assets', exact: true }).click();
  const wallet = page.getByRole('main', { name: 'Wallet', exact: true });
  await expect(wallet.getByRole('heading', { level: 1 })).toHaveCSS('font-size', '32px');
  for (const amount of ['$1,024.11', '$1,850.00', '$601.34']) {
    await expect(wallet.getByRole('list', { name: 'Contributing balances' }).getByText(amount, { exact: true }))
      .toHaveCSS('font-size', '20px');
  }
});
