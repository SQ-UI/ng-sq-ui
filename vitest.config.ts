import { defineConfig } from 'vitest/config';
import * as path from 'node:path';

const resolveLib = (name: string) =>
  path.resolve(__dirname, `projects/${name}/src/index.ts`);

export default defineConfig({
  resolve: {
    alias: {
      '@sq-ui/ng-sq-common': resolveLib('ng-sq-common'),
      '@sq-ui/ng-form-elements': resolveLib('ng-form-elements'),
      '@sq-ui/ng-progress-bar': resolveLib('ng-progress-bar'),
      '@sq-ui/ng-modal': resolveLib('ng-modal'),
      '@sq-ui/ng-datetime-picker': resolveLib('ng-datetime-picker'),
      '@sq-ui/ng-datatable': resolveLib('ng-datatable'),
      '@sq-ui/ng-sq-ui': resolveLib('ng-sq-ui'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./setup-test.ts'],
    include: ['projects/**/*.spec.ts', 'src/**/*.spec.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '.tools/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
    },
  },
});
