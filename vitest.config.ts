/// <reference types="vitest" />
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: [
      'projects/ng-sq-common/**/*.spec.ts',
      'projects/ng-modal/**/*.spec.ts',
      'projects/ng-progress-bar/**/*.spec.ts',
    ],
    exclude: [
      'projects/ng-form-elements/**',
      'projects/ng-datatable/**',
      'projects/ng-datetime-picker/**',
      'projects/ng-sq-ui/**',
    ],
    setupFiles: ['./setup-test.ts'],
    css: false,
    alias: {
      '@sq-ui/ng-sq-common/(.*)': './projects/ng-sq-common/src/$1',
      '@sq-ui/ng-sq-common': './projects/ng-sq-common/src/index.ts',
    },
  },
});
