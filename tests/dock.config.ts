import { defineConfig } from '@playwright/test';
import base from '../playwright.config';

export default defineConfig(base, {
  testDir: './visual',
  testMatch: /(?:dockCube|pillNavigation)\.spec\.ts/,
  workers: 1,
  timeout: 60_000,
  use: { baseURL: 'http://localhost:6008' },
  webServer: {
    cwd: new URL('..', import.meta.url).pathname,
    command: 'pnpm exec storybook dev -c .storybook -p 6008 --ci --quiet',
    url: 'http://localhost:6008',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
