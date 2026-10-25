import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Geometry, collision and motion tests run full variant builds; under parallel load several take
    // 4–8 s, past vitest's 5 s default, though none hang.
    testTimeout: 20000,
  },
});
