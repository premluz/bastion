import { test, expect } from '@playwright/test';

const ASTRYX_THEMES = ['neutral', 'stone'] as const;
const ASTRYX_SCHEMES = ['dark', 'light'] as const;
const SCHEME_LOCKED_THEMES = ['ops-dark', 'glass'] as const;

// theme=default is where astryxTheme/astryxScheme are genuinely meaningful —
// it's a pass-through to Astryx's own light-dark() behavior.
for (const astryxTheme of ASTRYX_THEMES) {
  for (const astryxScheme of ASTRYX_SCHEMES) {
    test(`token sheet — default × ${astryxTheme} × ${astryxScheme}`, async ({ page }) => {
      await page.goto(
        `/iframe.html?id=theme-token-sheet--default&globals=theme:default;astryxTheme:${astryxTheme};astryxScheme:${astryxScheme}`,
      );
      await page.waitForSelector('[data-testid="token-sheet"]');
      await expect(page).toHaveScreenshot(`token-sheet-default-${astryxTheme}-${astryxScheme}.png`);
    });
  }
}

// ops-dark/glass are scheme-locked ◆ themes — one baseline each, astryxScheme has no effect.
for (const theme of SCHEME_LOCKED_THEMES) {
  test(`token sheet — ${theme} (scheme-locked)`, async ({ page }) => {
    await page.goto(`/iframe.html?id=theme-token-sheet--default&globals=theme:${theme}`);
    await page.waitForSelector('[data-testid="token-sheet"]');
    await expect(page).toHaveScreenshot(`token-sheet-${theme}.png`);
  });
}
