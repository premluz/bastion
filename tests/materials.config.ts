import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './visual', testMatch: /materials\.spec\.ts/,
  workers: 1, timeout: 60_000, reporter: 'list',
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.005 } },
  use: { ...devices['Desktop Chrome'], viewport: { width: 1000, height: 800 },
    baseURL: 'http://127.0.0.1:5191', reducedMotion: 'reduce' },
  webServer: {
    command: 'pnpm --filter brand-studio dev --host 127.0.0.1 --port 5191',
    url: 'http://127.0.0.1:5191', reuseExistingServer: false, timeout: 60_000,
  },
});
