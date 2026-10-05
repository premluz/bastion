import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 500, height: 900 } });
await page.goto('http://localhost:6007/iframe.html?id=shell-mobileframe--conversation-mode&viewMode=story&globals=theme:ops-dark', { waitUntil: 'networkidle' });
await page.waitForTimeout(700);
const topFadeDisplay = await page.evaluate(() => {
  const el = document.querySelector('[class*="_topFade_"]');
  return el ? getComputedStyle(el).display : 'not found';
});
console.log('topFade display in conversation mode:', topFadeDisplay);
await browser.close();
