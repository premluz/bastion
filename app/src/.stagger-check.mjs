import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 414, height: 896 } });
await page.goto('http://localhost:6006/iframe.html?id=shell-mobileframe--default&globals=theme:safe-one&viewMode=story');
await page.getByTestId('mobile-shell').waitFor({ state: 'attached' });
await page.waitForTimeout(1500);
for (const [nav, label] of [[/explore|markets|search/i, 'Explore'], [/home/i, 'Home'], [/assets|wallet/i, 'Wallet']]) {
  await page.getByRole('button', { name: nav }).first().click();
  await page.waitForTimeout(30);
  const r = await page.evaluate((label) => {
    const main = document.querySelector(`main[aria-label="${label}"]`);
    const anims = main ? main.getAnimations({ subtree: true }) : [];
    const byName = {}; for (const a of anims) { const n = a.animationName.replace(/^_/, '').replace(/_[a-z0-9]+_\d+$/, ''); byName[n] = (byName[n] || 0) + 1; }
    return { byName, delays: [...new Set(anims.filter(a=>a.animationName.includes('page-enter')||a.animationName.includes('reveal')).map((a) => a.effect.getTiming().delay))].slice(0,12) };
  }, label);
  console.log(label, JSON.stringify(r));
  await page.waitForTimeout(1500);
}
await browser.close();
