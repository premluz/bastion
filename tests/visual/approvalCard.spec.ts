import { test, expect } from '@playwright/test';

const story = (name: string) => `/iframe.html?id=nodes-approvalcard--${name}&globals=theme:safe-one`;

test('single question has left radios and no multi-question controls', async ({ page }) => {
  await page.setViewportSize({ width: 392, height: 700 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(story('single-question'));
  await page.getByRole('radio', { name: 'USDT', exact: true }).check();
  await expect(page.getByRole('radio', { name: 'USDT', exact: true })).toBeChecked();
  for (const name of ['Previous question', 'Next question', 'Skip', 'Continue', 'Dismiss question']) {
    await expect(page.getByRole('button', { name, exact: true })).toHaveCount(0);
  }
  for (const row of await page.locator('.astryx-radio-list-item').all()) {
    const radio = await row.locator('.astryx-radio').boundingBox();
    const label = await row.locator('label').boundingBox();
    const bounds = await row.boundingBox();
    expect(radio!.width).toBeGreaterThan(10);
    expect(radio!.x + radio!.width).toBeLessThan(label!.x);
    expect(radio!.y + radio!.height).toBeLessThanOrEqual(bounds!.y + bounds!.height);
  }
  await expect(page.locator('.astryx-card')).toHaveScreenshot('approval-single.png');
});

test('multiple questions preserve answers and support skipping and custom responses', async ({ page }) => {
  await page.setViewportSize({ width: 392, height: 700 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(story('multiple-questions'));
  await expect(page.getByRole('button', { name: 'Previous question', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeDisabled();
  await expect(page.getByText('1/3', { exact: true })).toBeVisible();
  await page.getByRole('radio', { name: 'Five (full case)', exact: true }).check();
  await expect(page.locator('.astryx-card')).toHaveScreenshot('approval-multiple.png');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByText('2/3', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Previous question', exact: true }).click();
  await expect(page.getByRole('radio', { name: 'Five (full case)', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Next question', exact: true }).click();
  await page.getByRole('button', { name: 'Skip', exact: true }).click();
  await expect(page.getByText('3/3', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next question', exact: true })).toBeDisabled();
  await page.getByRole('textbox', { name: 'Something else', exact: true }).fill('After our pilot');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Answers submitted.');
});

test('optional controls can be omitted at narrow widths', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto(story('multiple-without-extras'));
  await expect(page.getByText('1/3', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Skip', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Dismiss question', exact: true })).toHaveCount(0);
  await expect(page.getByRole('textbox')).toHaveCount(0);
  expect(await page.locator('.astryx-card').evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
});
