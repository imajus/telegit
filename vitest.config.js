import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 60000, // 30 seconds timeout for AI agent tests
    hookTimeout: 30000, // 30 seconds for setup/teardown hooks
    environment: 'node',
    reporter: ['verbose'],
    globals: false,
    env: {
      NODE_ENV: 'evaluate',
    },
  },
});
