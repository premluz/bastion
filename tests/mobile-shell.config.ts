import { defineConfig } from '@playwright/test';
import base from '../playwright.config';

// Exercise the built artifact on its own port; never reuse Merlin's dev server.
export default defineConfig({
  ...base,
  testDir: './visual',
  testMatch: /mobileShell(?:Motion)?\.spec\.ts/,
  use: { ...base.use, baseURL: 'http://127.0.0.1:6010' },
  webServer: {
    command: 'python3 -m http.server 6010 --bind 127.0.0.1 --directory storybook-static',
    cwd: process.cwd(),
    url: 'http://127.0.0.1:6010',
    reuseExistingServer: false,
    timeout: 15_000,
  },
});
