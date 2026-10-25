import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5190, strictPort: true },
  test: {
    // Geometry, collision and motion tests run full variant builds; under parallel load several take
    // 4–8 s, past vitest's 5 s default, though none hang.
    testTimeout: 20000,
  },
});
