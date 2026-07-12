import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    css: true,
    // vitest 4's defaultExclude is just node_modules/.git — tsc -b's
    // composite build emits compiled tests into dist/, which vitest
    // would otherwise pick up and run a second time.
    exclude: ['**/node_modules/**', '**/.git/**', '**/dist/**'],
  },
});
