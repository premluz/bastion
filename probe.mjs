import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 500, height: 400 } });
await page.goto('http://localhost:6007/iframe.html?id=shell-mobileframe--default&viewMode=story&globals=theme:ops-dark', { waitUntil: 'networkidle' });
await page.waitForSelector('[data-testid="mobile-shell"]');
await page.waitForTimeout(700);
await page.screenshot({ path: 'glow-check.png', clip: { x: 0, y: 0, width: 500, height: 300 } });
await browser.close();
