const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/component-selector": ["error", { type: "element", prefix: "sq", style: "kebab-case" }],
      // Attribute directives use kebab-case selectors (`sq-checkbox-label`, `sq-tag`, ...).
      "@angular-eslint/directive-selector": ["error", { type: "attribute", prefix: "sq", style: "kebab-case" }],
      // TODO(3.0.0): `onSortClicked`, `onSelectItem` and `onUserInputEnd` are part of the
      // published API; rename them to drop the `on` prefix and switch this rule back on.
      "@angular-eslint/no-output-on-prefix": "off",
      // TODO: replace the remaining `any` usages with precise types, then raise to "error".
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // `sqOutsideClickListener` / `sqScrolledToBottomListener` are camelCase and part of the API.
    files: ["projects/ng-sq-common/src/lib/directives/*.ts"],
    rules: {
      "@angular-eslint/directive-selector": ["error", { type: "attribute", prefix: "sq", style: "camelCase" }],
    },
  },
  {
    // `sq-datatable-row` / `sq-datatable-column` are attribute components applied to <tr>/<th>.
    files: [
      "projects/ng-datatable/src/lib/datatable-row/*.ts",
      "projects/ng-datatable/src/lib/datatable-column/*.ts",
    ],
    rules: {
      "@angular-eslint/component-selector": ["error", { type: "attribute", prefix: "sq", style: "kebab-case" }],
    },
  },
  {
    // `hours`/`minutes` inputs and `hoursChange`/`minutesChange` outputs are the published API;
    // the component keeps them as `inputHours`/`inputMinutes` internally to avoid clashing with
    // the display signals.
    files: ["projects/ng-datetime-picker/src/lib/datetime-picker/time-picker/time-picker.component.ts"],
    rules: {
      "@angular-eslint/no-input-rename": "off",
      "@angular-eslint/no-output-rename": "off",
    },
  },
  {
    // Deprecated legacy base class kept for backwards compatibility; removed in 3.0.0.
    files: ["projects/ng-sq-common/src/lib/entities/input-core-component.ts"],
    rules: {
      "@angular-eslint/prefer-standalone": "off",
    },
  },
  {
    // The application shell keeps the Angular CLI default selector.
    files: ["src/app/app.component.ts"],
    rules: {
      "@angular-eslint/component-selector": ["error", { type: "element", prefix: "app", style: "kebab-case" }],
    },
  },
  {
    files: ["**/*.spec.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
    ],
    rules: {},
  }
);
