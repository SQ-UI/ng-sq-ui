// weird issue with Jest after updating to Angular ver 14:
// https://github.com/nrwl/nx/issues/7844#issuecomment-1139427677
const esModules = ['@angular', 'tslib', 'rxjs'].join('|');

module.exports = {
  preset: 'jest-preset-angular',
  // verbose: true,
  roots: ['projects'],
  restoreMocks: true,
  rootDir: './',
  modulePaths: ['<rootDir>'],
  modulePathIgnorePatterns: ['^.+\\.js$'],
  testEnvironment: 'jsdom',
  testMatch: ['**/?(*.)+(spec).ts?(x)'],
  transform: {
    '^.+\\.(ts|js|html)$': ['jest-preset-angular', {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      allowSyntheticDefaultImports: true,
      diagnostics: { warnOnly: true },
      stringifyContentPathRegex: '\\.html$',
    }],
  },
  moduleNameMapper: {
    '^@sq-ui/ng-sq-common/(.*)$': '<rootDir>/projects/ng-sq-common/src/$1',
    '@sq-ui/ng-sq-common': '<rootDir>/projects/ng-sq-common/src/index.ts',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageReporters: ['html'],
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  transformIgnorePatterns: [`<rootDir>/node_modules/(?!.*\\.mjs$|${esModules})`],
  coverageReporters: ["lcov", "text"],
};
