# Known issues

> Applies to **3.x** (Angular 22).

## Documentation

?> If you have blocked 3rd party cookies, the live examples will not work.
[Reason](https://github.com/stackblitz/core/issues/162)

## Styles

> I don't see the default styles in my project.

Two possible reasons:

1. You have not added the `sq` class to a parent element.
2. You have not included the theme files in `angular.json`:

```json
"styles": [
  "src/styles.css",
  "./node_modules/@sq-ui/ng-sq-common/sq-ui-theme.scss",
  "./node_modules/@sq-ui/ng-form-elements/styles/form-elements.scss",
  "./node_modules/@fortawesome/fontawesome-free/css/fontawesome.min.css",
  "./node_modules/@fortawesome/fontawesome-free/css/solid.min.css",
  "./node_modules/@fortawesome/fontawesome-free/css/regular.min.css"
]
```

> Icons are missing.

`@fortawesome/fontawesome-free` is an **optional** peer dependency: install it yourself if you want the
icon set the controls use. Without it the components still work, they just render no glyphs.

## Forms

> `[(ngModel)]` / `formControlName` stopped working after upgrading.

That is expected in 3.x: the controls no longer implement `ControlValueAccessor`, so Angular forms
directives cannot bind them. Use `[(value)]` with a signal, or `[formField]` with Angular Signal
Forms — see *Migrating 2.x → 3.x* in the README.

> `pattern="..."` throws a type error.

`pattern` is `readonly RegExp[]` in 3.x (it feeds both `[formField]` and the native attribute):

```html
<sq-input [pattern]="[/^\d+$/]"></sq-input>
```

> A template reads `value.value` / `paginatedCollection()[0].name` and TypeScript complains that the
> value is `unknown`.

That is the typed API doing its job. Parameterise the type at the source:

```typescript
readonly pairs = signal<LabelValuePair<Country>[]>([]);   // instead of LabelValuePair[]
readonly page = signal<User[]>([]);                       // PaginatorComponent<User>
readonly rows = signal<ToDoItem[]>([]);                   // DatatableComponent<ToDoItem>
```

## Bundle size

> The datetime pickers add ~100 kB.

`@js-temporal/polyfill` is a real dependency. If your target browsers provide `Temporal`, alias the
secondary entry point and the polyfill disappears from the bundle:

```jsonc
// vite / esbuild configuration
"resolve": { "alias": { "@sq-ui/ng-datetime-picker/temporal": "src/temporal-native.ts" } }
```

```typescript
// src/temporal-native.ts
export const Temporal = (globalThis as { Temporal?: unknown }).Temporal;
```

More in *Temporal & the polyfill* in the README.

## Working on this repository

> `npm run typecheck` / `npm run build` cannot resolve `@sq-ui/*`.

`tsconfig.json` resolves the packages from `dist/` first, so the libraries have to be built once:

```bash
npm run build:libs
npm run typecheck
```

CI does the same, in that order.

> A test run hangs or several specs fail with `Hook timed out in 10000ms`.

Vitest keeps an optimized dependency cache in `node_modules/.vite`. After an interrupted run (or a
`SIGKILL`) it can be left in a bad state — clear it and re-run:

```bash
rm -rf node_modules/.vite
npm test
```

> `ng test` does not exist.

By design: the workspace runs Vitest directly. Use `npm test` (single run) or `npm run test:watch`.

