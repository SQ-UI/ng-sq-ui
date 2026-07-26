/// <reference types="vitest" />
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: [
      'projects/ng-sq-common/src/lib/services/**/*.spec.ts',
      'projects/ng-sq-common/src/lib/directives/**/*.spec.ts',
    ],
    setupFiles: ['./setup-test.ts'],
    css: false,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: false,
        maxForks: 1,
      },
    },
    fileParallelism: false,
    alias: {
      '@sq-ui/ng-sq-common/(.*)': './projects/ng-sq-common/src/$1',
      '@sq-ui/ng-sq-common': './projects/ng-sq-common/src/index.ts',
    },
  },
});
