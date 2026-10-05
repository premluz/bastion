import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 392, height: 792 });
  await page.goto('/iframe.html?id=shell-mobileframe--default&globals=theme:safe-one');
  await page.getByRole('button', { name: 'Open account menu' }).click();
});

test('originating page survives opening and returning', async ({ page }) => {
  const source = page.getByTestId('account-source-page');
  await expect(source).toHaveCSS('opacity', '0.4');
  await expect(page.getByRole('navigation', { name: 'Account menu' })).toBeVisible();
  await page.getByRole('button', { name: 'Return to previous page' }).click();
  await expect(page.getByRole('button', { name: 'Open account menu' })).toBeFocused();
  await expect(source).toHaveCSS('opacity', '1');
  const home = page.getByRole('main', { name: 'Home', exact: true });
  await home.evaluate((element) => { element.scrollTop = 200; });
  const position = await home.evaluate((element) => element.scrollTop);
  await page.getByRole('button', { name: 'Open account menu' }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open account menu' })).toBeFocused();
  expect(await home.evaluate((element) => element.scrollTop)).toBe(position);
});

for (const width of [320, 392]) {
  test(`account screens fit ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 792 });
    for (const view of ['account-menu', 'your-accounts', 'edit-account', 'add-account', 'history']) {
      await page.goto(`/iframe.html?id=shell-mobileframe--${view}&globals=theme:safe-one`);
      await expect(page.getByTestId('mobile-shell')).toBeVisible();
      await page.emulateMedia({ reducedMotion: 'reduce' });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`${view}-${width}.png`) });
      if (view !== 'account-menu') {
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
        await page.keyboard.press('Tab');
        expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
      }
    }
  });
}

test('accounts can be renamed, added and selected', async ({ page }) => {
  await page.getByRole('button', { name: 'Account 1', exact: true }).click();
  await page.getByRole('button', { name: 'Edit Account 1' }).click();
  await page.getByRole('textbox', { name: 'Account name' }).fill('Everyday');
  await page.getByRole('button', { name: 'Save name' }).click();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Everyday');
  await page.getByRole('button', { name: 'Add account', exact: true }).click();
  await page.getByRole('button', { name: /Create new account/ }).click();
  await page.getByRole('textbox', { name: 'Account name' }).fill('Savings');
  await page.getByRole('button', { name: 'Add demo account' }).click();
  await expect(page.getByRole('dialog')).toContainText('Savings');
  await page.getByRole('button', { name: 'Close account sheet' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Account menu' })).toContainText('Savings');
});

test('history filters and details stay within the sheet', async ({ page }) => {
  await page.getByRole('button', { name: 'History', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Jupiter');
  await page.getByRole('radio', { name: 'Deposits', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toContainText('Jupiter');
  await page.getByRole('button', { name: /Received/ }).click();
  await expect(page.getByRole('dialog')).toHaveAttribute('aria-label', 'Activity details');
  await expect(page.getByRole('dialog')).toContainText('0.25 ETH');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('sheet enters from the middle and respects reduced motion', async ({ page }) => {
  await page.getByRole('button', { name: 'History', exact: true }).click();
  const dialog = page.getByRole('dialog');
  const frames = await dialog.evaluate((node) => node.getAnimations().flatMap((animation) =>
    (animation.effect as KeyframeEffect).getKeyframes()));
  expect(frames.some((frame) => String(frame.transform).includes('50%'))).toBe(true);
  await page.getByRole('button', { name: 'Close account sheet' }).click();
  await expect(dialog).not.toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'History', exact: true }).click();
  await expect(dialog).toHaveCSS('animation-name', 'none');
});
