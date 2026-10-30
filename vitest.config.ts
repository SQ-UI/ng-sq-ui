/// <reference types="vitest" />
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import path from 'path';

const projectRoot = __dirname;

/** Maps the published package names to the workspace sources. */
const aliases = [
  { find: /^@sq-ui\/ng-sq-common$/, replacement: path.resolve(projectRoot, 'projects/ng-sq-common/src/index.ts') },
  { find: /^@sq-ui\/ng-sq-common\/(.*)/, replacement: path.resolve(projectRoot, 'projects/ng-sq-common/src/$1') },
  { find: /^@sq-ui\/ng-form-elements$/, replacement: path.resolve(projectRoot, 'projects/ng-form-elements/src/index.ts') },
  { find: /^@sq-ui\/ng-form-elements\/(.*)/, replacement: path.resolve(projectRoot, 'projects/ng-form-elements/src/$1') },
  { find: /^@sq-ui\/ng-datetime-picker\/temporal$/, replacement: path.resolve(projectRoot, 'projects/ng-datetime-picker/temporal/src/index.ts') },
  { find: /^@sq-ui\/ng-datetime-picker$/, replacement: path.resolve(projectRoot, 'projects/ng-datetime-picker/src/index.ts') },
  { find: /^@sq-ui\/ng-datetime-picker\/(.*)/, replacement: path.resolve(projectRoot, 'projects/ng-datetime-picker/src/$1') },
  { find: /^@sq-ui\/ng-datatable$/, replacement: path.resolve(projectRoot, 'projects/ng-datatable/src/index.ts') },
  { find: /^@sq-ui\/ng-datatable\/(.*)/, replacement: path.resolve(projectRoot, 'projects/ng-datatable/src/$1') },
  { find: /^@sq-ui\/ng-modal$/, replacement: path.resolve(projectRoot, 'projects/ng-modal/src/index.ts') },
  { find: /^@sq-ui\/ng-modal\/(.*)/, replacement: path.resolve(projectRoot, 'projects/ng-modal/src/$1') },
  { find: /^@sq-ui\/ng-progress-bar$/, replacement: path.resolve(projectRoot, 'projects/ng-progress-bar/src/index.ts') },
  { find: /^@sq-ui\/ng-progress-bar\/(.*)/, replacement: path.resolve(projectRoot, 'projects/ng-progress-bar/src/$1') },
];

export default defineConfig({
  plugins: [angular({ tsconfig: 'tsconfig.spec.json' })],
  resolve: {
    alias: aliases,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: [
      'projects/**/*.spec.ts',
      'src/**/*.spec.ts',
    ],
    setupFiles: ['./setup-test.ts'],
    css: false,
    restoreMocks: true,
    // Vitest 4 only excludes `node_modules`/`.git` by default, so the rest is spelled out.
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text'],
      reportsDirectory: 'coverage',
      // `coverage.all` was removed in Vitest 4: uncovered files are only reported when they match
      // this include pattern.
      include: ['projects/*/src/**/*.ts', 'src/app/**/*.ts'],
      exclude: ['**/*.spec.ts', '**/*.d.ts'],
    },
  },
});
