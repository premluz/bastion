import { defineConfig } from '@playwright/test';
import base from '../playwright.config';

export default defineConfig({
  ...base,
  testDir: './visual',
  use: { ...base.use, baseURL: 'http://127.0.0.1:6011' },
  webServer: {
    command: 'python3 -m http.server 6011 --bind 127.0.0.1 --directory /tmp/bastion-storybook',
    url: 'http://127.0.0.1:6011',
    reuseExistingServer: false,
    timeout: 15_000,
  },
});
