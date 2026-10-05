import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 500, height: 900 } });
await page.goto('http://localhost:6007/iframe.html?id=shell-mobileframe--default&viewMode=story&globals=theme:ops-dark', { waitUntil: 'networkidle' });
await page.waitForSelector('[data-testid="mobile-shell"]');
await page.waitForTimeout(500);
// tap Assistant/trade tab to land on .content (not .page)
await page.getByRole('button', { name: 'Trade', exact: true }).click().catch(() => {});
await page.waitForTimeout(400);
const info = await page.evaluate(() => {
  const main = document.querySelector('main[aria-label="Preview transcript"]');
  const topFade = document.querySelector('[class*="_topFade_"]');
  return { hasContent: !!main, topFadeDisplay: topFade ? getComputedStyle(topFade).display : 'not found' };
});
console.log(JSON.stringify(info));
await browser.close();
