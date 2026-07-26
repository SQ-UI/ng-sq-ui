import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['projects/**/*.spec.ts'],
    setupFiles: ['./setup-test.ts'],
    css: false,
    alias: {
      '@sq-ui/ng-sq-common/(.*)': './projects/ng-sq-common/src/$1',
      '@sq-ui/ng-sq-common': './projects/ng-sq-common/src/index.ts',
    },
  },
});
