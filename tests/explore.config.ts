import { defineConfig } from '@playwright/test';
import base from './mobile-shell.config';
export default defineConfig({ ...base, testMatch: /explore\.spec\.ts/ });
