# NG-SQ-UI

> Simple Quality UI kit for Angular

> built by developers for developers!

![angular](https://badge.fury.io/js/angular.svg)
![travis](https://travis-ci.com/SQ-UI/ng-sq-ui.svg?branch=master)
[![contributions welcome](https://img.shields.io/badge/issues-welcome-brightgreen.svg?style=flat)](https://github.com/SQ-UI/ng-sq-ui/issues)
[![Maintainability](https://api.codeclimate.com/v1/badges/d53c1670c301071be452/maintainability)](https://codeclimate.com/github/SQ-UI/ng-sq-ui/maintainability)
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors)
[![Mentioned in Awesome Angular](https://awesome.re/mentioned-badge.svg)](https://github.com/gdi2290/awesome-angular)
![Package download](https://img.shields.io/npm/dm/@sq-ui/ng-sq-ui.svg?logo=ng-sq-ui)
[![Stake to support us](https://badge.devprotocol.xyz/0x014f98F05c0BeD44B4Cf0532a93312a2135afaB8/descriptive)](https://stakes.social/0x014f98F05c0BeD44B4Cf0532a93312a2135afaB8)
[![Netlify Status](https://api.netlify.com/api/v1/badges/f9cb1185-dc56-4886-99b9-57627d0e892d/deploy-status)](https://app.netlify.com/sites/sq-ui-preview-develop/deploys)
 [![](https://data.jsdelivr.com/v1/package/npm/@sq-ui/ng-sq-ui/badge?style=rounded)](https://www.jsdelivr.com/package/npm/@sq-ui/ng-sq-ui)

## Docs

You will find a description of the public API for each component.
The components are grouped by modules. Any properties you can see through code inspection that are left out from this documentation are for internal use and you should not rely on them.

Any types of public interfaces and services are also included.

- [Home Page](http://bit.ly/ng-sq-ui-docs-home)
- [Installation](http://bit.ly/ng-sq-ui-docs-installation)
- [FormElementsModule](http://bit.ly/ng-sq-ui-docs-form-elements)
- [ModalModule](http://bit.ly/ng-sq-ui-docs-modal)
- [ProgressBarModule](http://bit.ly/ng-sq-ui-docs-progressbar)
- [DatetimePickerModule](http://bit.ly/ng-sq-ui-docs-datetime-picker)
- [DatatableModule](http://bit.ly/ng-sq-ui-docs-datatable)
- [CommonModule](http://bit.ly/ng-sq-ui-docs-common)
- [About us](http://bit.ly/ng-sq-ui-docs-about-us)
- [Bounty Program](http://bit.ly/bounty-program)
- [Live examples](http://bit.ly/ng-sq-ui-docs-live-examples)
- [Troubleshooting](http://bit.ly/ng-sq-ui-docs-troubleshooting)

## Compatibility matrix

| ng-sq-ui | Angular | Notes |
|---|---|---|
| **3.x** | **22** | Standalone-only, signal `input()`/`output()`/`model()`, zoneless-ready, Vitest 4, first-class `[formField]` (Signal Forms) support. **Breaking:** NgModules removed, `ControlValueAccessor` removed from the form controls, `pattern` is now `readonly RegExp[]` |
| 2.x | 14 – 21 | NgModule based (`FormElementsModule`, `ModalModule`, …) |
| 1.3.3 / 1.1.x | 10 – 12 (View Engine) | Use the 1.x packages if you are still on View Engine |

### Migrating 2.x → 3.x

```
NgModules                          → import the standalone components directly
[(ngModel)] / formControlName      → [(value)] (or [formField] with Angular Signal Forms)
@Input() name                      → name = input<string>()
@Output() valueChange = EventEmitter → value = model<T>()  /  output<T>()
*ngIf / *ngFor                     → @if / @for
pattern="..."                      → [pattern]="[/^\\d+$/]"  (pattern is now readonly RegExp[])
LabelValuePair.value: any          → LabelValuePair<TValue = unknown>  (parameterise it to keep the payload typed)
sq-datatable / sq-paginator items  → generic over the row type: DatatableComponent<T>, PaginatorComponent<T>
sq-radiobutton [(value)]           → generic over the value: RadiobuttonComponent<T>
sq-datetime-picker [(value)]       → DatetimePickerValue (single date or array, per [isMultipleSelect])
```

Every control also declares `implements SqFormFieldSignals, SqFormValueControl<T>`, so the shared
`name`/`controlId`/`controlLabel`/`controlPlaceholder`/`required`/`pattern`/`disabled`/`touch` surface
cannot drift between components.

## Installation

> You can clone / download this repo or install it as a node dependency.

```
npm i @sq-ui/ng-sq-ui@latest --save
```

-- or --

```
yarn add @sq-ui/ng-sq-ui@latest
```

## Usage

Import individual components directly in your standalone components:

```typescript
import { InputComponent, DropdownComponent } from '@sq-ui/ng-sq-ui';

@Component({
  standalone: true,
  imports: [InputComponent, DropdownComponent],
  template: `
    <sq-input controlLabel="Name" [(value)]="name"></sq-input>
    <sq-dropdown [options]="options" [(value)]="selected"></sq-dropdown>
  `,
})
export class MyComponent {
  readonly name = signal('');
  readonly selected = signal<LabelValuePair | null>(null);
  readonly options: LabelValuePair[] = [{ label: 'One', value: 1 }];
}
```

Every form control exposes a two-way `value` model, so it can be bound with `[(value)]`, driven from a
signal, or used with Angular Signal Forms through the `[formField]` directive.

ng-sq-ui does not come with a specific font. Including the default theme is also optional. Refer to our [Live examples page](http://bit.ly/ng-sq-ui-docs-live-examples).

Need a grid? [We've got you covered](https://sq-ui.github.io/sq-grid/)!

### Add styles to angular.json

```json
"styles": [
  "src/styles.css",
  "./node_modules/@sq-ui/ng-sq-common/sq-ui-theme.scss",
  "./node_modules/@sq-ui/ng-form-elements/styles/form-elements.scss",
  "./node_modules/@fortawesome/fontawesome-free/css/fontawesome.min.css",
  "./node_modules/@fortawesome/fontawesome-free/css/solid.min.css",
  "./node_modules/@fortawesome/fontawesome-free/css/regular.min.css",
],
```

> `@fortawesome/fontawesome-free` is an optional peer dependency — install it yourself if you want the
> icon set the components use.

### Angular Signal Forms

Every control exposes exactly what Angular's `[formField]` directive looks for (`value` model +
`disabled`/`required`/`pattern` inputs + a `touch` output), so a Signal Form binds with no adapter code:

```typescript
import { FormField, form, required } from '@angular/forms/signals';

@Component({
  standalone: true,
  imports: [FormField, InputComponent],
  template: `
    <sq-input controlLabel="Name"
              [formField]="profileForm.name"></sq-input>
  `,
})
export class ProfileComponent {
  readonly model = signal({ name: '' });
  readonly profileForm = form(this.model, path => {
    required(path.name);
  });
}
```

The repository covers this with `projects/ng-form-elements/src/lib/signal-forms.integration.spec.ts`
(model→view, view→model, checkbox state, `touch` → touched, schema `required` → native `required`).

### Apply styling to the components

To use our styling just add the `class="sq"` on a parent element.

```html
<body class="sq">
  <div class="row">
    <sq-input ...></sq-input>
  </div>
</body>
```

## Temporal & the polyfill

`@sq-ui/ng-datetime-picker` needs [`Temporal`](https://tc39.es/proposal-temporal/). It depends on
`@js-temporal/polyfill` so it works out of the box, and every internal usage goes through the
secondary entry point `@sq-ui/ng-datetime-picker/temporal`:

```ts
import { Temporal } from '@sq-ui/ng-datetime-picker/temporal';
```

If your target browsers already provide `Temporal` (or you prefer a lighter implementation), alias that
specifier to a one-line shim and drop ~100 kB from your bundle:

```ts
// src/temporal-native.ts
export const Temporal = (globalThis as { Temporal?: unknown }).Temporal;
```

```jsonc
// vite / esbuild configuration of your application
"resolve": { "alias": { "@sq-ui/ng-datetime-picker/temporal": "src/temporal-native.ts" } }
```

Because the datetime-picker package imports its own `Temporal` through that specifier, one alias
removes the polyfill from both bundles. The shim must be an ES module and the platform must really
expose `Temporal`, otherwise the picker throws when it is instantiated.

> Aliasing `@js-temporal/polyfill` directly works too — that is what the entry point re-exports.

## Running the checks

`npm test` is the canonical entry point (Vitest + jsdom + zoneless Angular testing):

| Command | Purpose |
|---|---|
| `npm test` | run every spec once — must terminate in well under a minute |
| `npm run test:watch` | watch mode |
| `npm run coverage` | writes `coverage/lcov.info` (uploaded by CI to CodeClimate) |
| `npm run typecheck` | `tsc -p tsconfig.spec.json --noEmit` — run **after** `npm run build:libs` (`@sq-ui/*` resolves from `dist/`) |
| `npm run lint` | ESLint for the demo app and all seven libraries (`no-explicit-any` is an **error**) |
| `npm run build:libs` / `npm run build` | build the packages / build the demo app |
| `npm run check:exports` | post-build guard for the generated `exports` map, entry points and published assets — run after `build:libs` (CI does) |

There is deliberately no `ng test` target: the suite runs through Vitest directly, so the same setup
covers the libraries and the demo application.

## Dependencies

| Package | Kind | Notes |
|---|---|---|
| `@angular/core`, `@angular/common`, `@angular/forms` | peer (`^22.0.0`) | every package |
| `@sq-ui/ng-sq-common` | dependency | pulled in by all the other packages |
| `@fortawesome/fontawesome-free` | **optional** peer | only the icons; add the CSS to `angular.json` if you want them |
| `@js-temporal/polyfill` | dependency of `@sq-ui/ng-datetime-picker` | can be aliased away when the platform provides `Temporal` — see above |
| `tslib` | dependency | TypeScript helpers |

## Try it out locally

```
git clone git@github.com:SQ-UI/ng-sq-ui.git
npm i
npm start
```

-- or --

```
git clone git@github.com:SQ-UI/ng-sq-ui.git
yarn install
npm start
```

The libraries are watched automatically when you run `npm start`:
* The TypeScript compiler for this project is configured to look for the libraries under `dist/` and if `dist/` does not exist, it refers to the libraries' source code. That is why you should run `npm start` instead of just `ng serve --open` - `npm start` removes `dist/` (if it exists) and then runs `ng serve --open`. This prepares the compiler to listen for changes under the `projects/` directory.

## Support

- Use NG-SQ-UI in your daily work.
- **Star** ⭐ it if you like.
- Join us on <a href="http://bit.ly/ng-sq-ui-slack">ng slack</a> or our main <a href="http://bit.ly/ng-sq-slack">SQ slack channel</a>.
- Follow us on [twitter](https://twitter.com/sq_ui_kit) to get latest updates.
- Or simply send an email to contact[at]sq-ui.xyz.
- Sponsor with [DevToken](https://stakes.social/0x014f98F05c0BeD44B4Cf0532a93312a2135afaB8)
- Tip us with BAT from brave awards or download [brave](https://brave.com/ngs747)

## Contribution

Want to file a bug, contribute some code, or improve documentation? Read up on our [Contributing Guide](CONTRIBUTING.md) before making a pull request.

## LICENSE

- [MIT](http://opensource.org/licenses/MIT)
- Feel free to use and contribute to the development.

## Contributors

Thanks goes to these wonderful <a href="https://github.com/sq-ui/ng-sq-ui/graphs/contributors">people</a>!

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/ardentia"><img src="https://avatars2.githubusercontent.com/u/41083417?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Plamena Radneva</b></sub></a><br /><a href="https://github.com/SQ-UI/ng-sq-ui/commits?author=ardentia" title="Code">💻</a> <a href="https://github.com/SQ-UI/ng-sq-ui/commits?author=ardentia" title="Documentation">📖</a> <a href="https://github.com/SQ-UI/ng-sq-ui/commits?author=ardentia" title="Tests">⚠️</a> <a href="#tutorial-ardentia" title="Tutorials">✅</a> <a href="#blog-ardentia" title="Blogposts">📝</a></td>
    <td align="center"><a href="https://github.com/samuil4"><img src="https://avatars0.githubusercontent.com/u/797921?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Samuil Gospodinov</b></sub></a><br /><a href="https://github.com/SQ-UI/ng-sq-ui/commits?author=samuil4" title="Code">💻</a> <a href="https://github.com/SQ-UI/ng-sq-ui/commits?author=samuil4" title="Documentation">📖</a> <a href="https://github.com/SQ-UI/ng-sq-ui/commits?author=samuil4" title="Tests">⚠️</a> <a href="#talk-samuil4" title="Talks">📢</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!
