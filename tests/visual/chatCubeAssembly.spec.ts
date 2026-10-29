import { expect, test, type Page } from '@playwright/test';
import { config } from '../../app/src/config';

type AssemblyProbe = typeof import('./chatCubeAssemblyProbe');
const STORY = '/iframe.html?id=shell-mobileframe--attention-home-monolith';
const EXPANSION_RATIO = 1.3;

async function expectAssembly(page: Page, button: string) {
  const sample = await page.evaluate(async (name) => {
    const moduleUrl = '/tests/visual/chatCubeAssemblyProbe.ts';
    const probe: AssemblyProbe = await import(moduleUrl);
    return probe.recordChatCubeAssembly(name);
  }, button);
  expect(sample.initial).toBeGreaterThan(0);
  if (config.agent.cubeAssembly) {
    expect(sample.maximum, JSON.stringify(sample)).toBeGreaterThan(sample.initial * EXPANSION_RATIO);
    expect(sample.final, JSON.stringify(sample)).toBeLessThan(sample.maximum);
  } else {
    expect(sample.maximum, JSON.stringify(sample)).toBeLessThan(sample.initial * EXPANSION_RATIO);
    expect(sample.final).toBeGreaterThan(0);
  }
  expect(sample.sameCanvas).toBe(true);
}

for (const theme of ['bastion-aura-light', 'bastion']) {
test(`messages and transcript actions respect the Cube assembly setting in ${theme}`, async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 392, height: 792 });
  await page.goto(`${STORY}&globals=theme:${theme}`, { waitUntil: 'load' });
  await expect(page.locator('[data-live-dock-cube] canvas')).toBeVisible({ timeout: 30_000 });
  await page.evaluate(() => document.documentElement.style.setProperty('--dock-cube-idle-period', '1000000000s'));
  await page.getByRole('button', { name: 'Open assistant', exact: true }).click();
  await page.waitForFunction(() => document.activeViewTransition === null);
  await page.getByRole('textbox', { name: 'Message input', exact: true }).fill('Send $50 to Daniel for coffee');
  await expectAssembly(page, 'Send');
  const thread = page.getByRole('log', { name: 'Assistant transcript', exact: true });
  await thread.locator('[data-approval-card="send-recipient"] .astryx-radio-list-item:has(input[value="daniel-smith"])').click();
  await expect(thread.getByRole('button', { name: 'Continue', exact: true })).toBeEnabled();
  await expectAssembly(page, 'Continue');
});
}

test('reduced motion keeps chat activity assembled', async ({ page }) => {
  test.skip(!config.agent.cubeAssembly, 'Enable assembly to verify its reduced-motion override');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 392, height: 792 });
  await page.goto(`${STORY}&globals=theme:bastion-aura-light`, { waitUntil: 'load' });
  await expect(page.locator('[data-live-dock-cube] canvas')).toBeVisible({ timeout: 30_000 });
  await page.getByRole('button', { name: 'Open assistant', exact: true }).click();
  await page.getByRole('textbox', { name: 'Message input', exact: true }).fill('Check my balance');
  const sample = await page.evaluate(async () => {
    document.documentElement.style.setProperty('--dock-cube-assembly-duration', '200ms');
    const moduleUrl = '/tests/visual/chatCubeAssemblyProbe.ts';
    const probe: AssemblyProbe = await import(moduleUrl);
    return probe.recordChatCubeAssembly('Send');
  });
  expect(sample.initial).toBeGreaterThan(0);
  expect(sample.maximum).toBeLessThan(sample.initial * EXPANSION_RATIO);
  expect(sample.sameCanvas).toBe(true);
});
