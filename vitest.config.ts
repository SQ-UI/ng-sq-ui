/// <reference types="vitest" />
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import path from 'path';

export default defineConfig({
  plugins: [angular({ tsconfig: 'tsconfig.spec.json' })],
  resolve: {
    alias: [
      { find: /^@sq-ui\/ng-sq-common$/, replacement: path.resolve(__dirname, 'projects/ng-sq-common/src/index.ts') },
      { find: /^@sq-ui\/ng-sq-common\/(.*)/, replacement: path.resolve(__dirname, 'projects/ng-sq-common/src/$1') },
      { find: /^@sq-ui\/ng-form-elements$/, replacement: path.resolve(__dirname, 'projects/ng-form-elements/src/index.ts') },
      { find: /^@sq-ui\/ng-form-elements\/(.*)/, replacement: path.resolve(__dirname, 'projects/ng-form-elements/src/$1') },
      { find: /^@sq-ui\/ng-datetime-picker$/, replacement: path.resolve(__dirname, 'projects/ng-datetime-picker/src/index.ts') },
      { find: /^@sq-ui\/ng-datetime-picker\/(.*)/, replacement: path.resolve(__dirname, 'projects/ng-datetime-picker/src/$1') },
      { find: /^@sq-ui\/ng-datatable$/, replacement: path.resolve(__dirname, 'projects/ng-datatable/src/index.ts') },
      { find: /^@sq-ui\/ng-datatable\/(.*)/, replacement: path.resolve(__dirname, 'projects/ng-datatable/src/$1') },
    ],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: [
      'projects/ng-sq-common/src/**/*.spec.ts',
      'projects/ng-modal/src/**/*.spec.ts',
      'projects/ng-progress-bar/src/**/*.spec.ts',
      'projects/ng-form-elements/src/**/*.spec.ts',
      'projects/ng-datetime-picker/src/**/*.spec.ts',
      'projects/ng-datatable/src/**/*.spec.ts',
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
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text'],
      reportsDirectory: 'coverage',
    },
    alias: [
      { find: '@sq-ui/ng-sq-common', replacement: path.resolve(__dirname, 'projects/ng-sq-common/src/index.ts') },
      { find: '@sq-ui/ng-form-elements', replacement: path.resolve(__dirname, 'projects/ng-form-elements/src/index.ts') },
      { find: '@sq-ui/ng-datetime-picker', replacement: path.resolve(__dirname, 'projects/ng-datetime-picker/src/index.ts') },
      { find: '@sq-ui/ng-datatable', replacement: path.resolve(__dirname, 'projects/ng-datatable/src/index.ts') },
    ],
  },
});
