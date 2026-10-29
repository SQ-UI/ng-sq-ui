# Angular 22 Upgrade — Branch Review & Action Plan

**Branch:** `morph-main` (HEAD `13d514b`, `origin/morph-main`, working tree clean)
**Reviewed:** 2026-10-28
**Review environment:** Node `v24.21.0`, npm 11, `npm ci --legacy-peer-deps`, TypeScript `6.0.3`, Angular `22.0.8`, ng-packagr `22.0.2`, Vitest `3.2.7`, `@analogjs/vitest-angular` `1.22.5`, `@analogjs/vite-plugin-angular` `2.6.4`

---

## 1. Executive summary

The branch **already contains most of the "modern Angular" migration content**: standalone components everywhere, signal `input()`/`output()`/`model()`/`contentChild()`, new control flow (`@if`/`@for`), zoneless bootstrap (`provideZonelessChangeDetection()`), `@angular/build` builders, ng-packagr partial compilation, Vitest instead of Karma, and `package.json` pinned to `@angular/* ^22.0.0`.

What it does **not** have is a green workspace. As committed, this branch cannot ship:

| Gate | Result |
|---|---|
| `npm ci --legacy-peer-deps` | ✅ passes (with 6 deprecation warnings) |
| `npm run build:libs` (7 libraries + `copy:styles`) | ✅ passes (heavy Sass deprecation output) |
| `npm run build` (demo app) | ❌ **fails** — `TS2339` in `sq-ui.component.ts` |
| `npm test` (`vitest run`) | ❌ **hangs forever** on the paginator spec (5+ min, no summary) |
| `npm run lint` (`ng lint`) | ❌ **fails** — `Cannot find module 'typescript-eslint'` for every project |
| `npx tsc -p tsconfig.spec.json --noEmit` | ❌ fails — `TS2688` (`vitest/globals`) + `TS6053` (`src/test.ts` missing) |

**Verdict:** the Angular 22 *port* is ~80 % done, but the branch is not mergeable, and CI cannot detect any of the four failures below because the only workflow runs tests only — and those hang.

**Effort estimate:** P0 blockers ≈ 1–2 dev-days; P1 compatibility hardening ≈ 1 week; P2–P6 (tooling, CI, packaging, docs, component bug backlog) ≈ 2–3 weeks, parallelisable.

---

## 2. Verified status matrix (reproduction)

```bash
export PATH="$HOME/.nvm/versions/node/v24.21.0/bin:$PATH"
npm ci --legacy-peer-deps                # EXIT 0
npm run build:libs                       # EXIT 0  → all 7 packages built + copy:styles
npm run build                            # EXIT 1  → see B1
npm test                                 # HANGS   → see B2
npm run lint                             # EXIT 1  → see B3
npx tsc -p tsconfig.spec.json --noEmit   # EXIT 2  → see B4
```

Observed deprecation warnings during `npm ci` (verbatim):

```
npm warn deprecated @angular/platform-browser-dynamic@22.0.8: @angular/platform-browser-dynamic is deprecated. Use `@angular/platform-browser` instead.
npm warn deprecated @angular/animations@22.0.8: @angular/animations is deprecated. Use `animate.enter` and `animate.leave` instead.
npm warn deprecated @angular-devkit/build-angular@22.0.8: Angular's Webpack support is deprecated. Use the esbuild and Vite-based "@angular/build" package instead.
npm warn deprecated @ngtools/webpack@22.0.8: Angular's Webpack support is deprecated.
```

Observed warnings during `npm run build` (verbatim):

```
One or more browsers which are configured in the project's Browserslist configuration
fall outside Angular's browser support for this version.
Unsupported browsers: and_qq 14.9, and_uc 15.5, android 150, chrome 118, chrome 109,
ios_saf 26.5, kaios 3.0-3.1, op_mob 80, opera 131, opera 127, safari 26.5, samsung 30, samsung 29
```

---

## 3. P0 — Blockers (fix first, in this order)

### B1. Demo app does not compile — `compatForm()` API changed in v22

`src/app/sq-ui/sq-ui/sq-ui.component.ts:253`

```
✘ [ERROR] TS2339: Property 'value' does not exist on type
  'FieldTree<{ name: string; dropdown: LabelValuePair; tags: string[];
             checkboxValue: boolean; textareaValue: string; }>'
```

Root cause (verified in `node_modules/@angular/forms/types/signals-compat.d.ts`): in v22 `compatForm()`
returns a **`FieldTree<TModel>`**, not a `FormGroup`.

```ts
// Angular 22
declare function compatForm<TModel>(model: WritableSignal<TModel>): FieldTree<TModel>;
declare function extractValue<T>(field: FieldTree<T>): RawValue<T>;
```

So `this.testForm.value` (`sq-ui.component.ts:253`) is dead code from the v21 API.

**Fix options (pick one — both are single-file changes):**

1. *Minimal:* `console.log('Signal Forms value:', extractValue(this.testForm));`
   (import `extractValue` from `@angular/forms/signals/compat`).
2. *Idiomatic v22:* drop `compatForm` in the demo — the model signal **is** the form. Use
   `testForm = form(this.formModel)` from `@angular/forms/signals` and `<form [formRoot]="testForm">`
   (`FormRoot`, selector `form[formRoot]`). Note the v22 field directive is exported as **`FormField`**
   with selector **`[formField]`** — not v21's `[field]`. Verified from the shipped exports:
   `@angular/forms/signals` → `FormField, FormRoot, form, submit, required, …`;
   `@angular/forms/signals/compat` → `compatForm, extractValue, SignalFormControl, NG_STATUS_CLASSES`.

**Acceptance:** `npm run build` exits 0.

### B2. `npm test` never terminates

`projects/ng-sq-common/src/lib/components/paginator/paginator.component.spec.ts`

Symptoms (verbatim from the run):

```
ERROR Error: done() callback is deprecated, use promise instead
    at context (@vitest/runner)
    at … paginator.component.spec.ts:85:13
    at PaginatorComponent.onPageClick (paginator.component.ts:84:21)

NG0953: Unexpected emit for destroyed `OutputRef`. The owning directive/component is destroyed.
   (repeated hundreds of times, forever)
```

Three independent faults stack up:

1. **Jasmine→Vitest `done()` usage** at `spec.ts:63, 85, 90, 165, 197, 218, 241`. Vitest 3 rejects `done`
   callbacks; the first thrown error is retried, so the test never settles.
2. **Leaked subscription**: `component.pageChange.subscribe(...)` (`spec.ts:72`) is never unsubscribed.
   After the fixture is destroyed the output still emits → `NG0953` spam, amplified by
   `setup-test.ts:17-21` overriding `console.error` to re-`throw`.
3. **Production code smell that makes the test flaky**: `PaginatorComponent.generatePaginatedCollection()`
   pushes the model update through `setTimeout(..., 100)` (`paginator.component.ts:172-174`) — an
   arbitrary async boundary inside a signal pipeline.

**Fix:**

- Rewrite the spec with `async/await` + `await fixture.whenStable()` (same pattern already applied to
  `datatable-column.component.spec.ts` in commit `ab6708c`); use `take(1)` or explicit `unsubscribe`.
- Replace `fixture.whenRenderingDone()` (`spec.ts:209, 230, 253`) with `await fixture.whenStable()`.
- Delete the `setTimeout` in `PaginatorComponent`; set `paginatedCollection` synchronously. If the delay
  was masking an `ExpressionChangedAfterItHasBeenChecked` error, fix the ordering instead (see C4/T5).

**Acceptance:** `npm test` prints a summary and exits (0, or 1 with genuine failures) in < 60 s.

### B3. `npm run lint` cannot start

```
Error when running ESLint: Cannot find module 'typescript-eslint'
Require stack: - /…/ng-sq-ui/eslint.config.js
```

`eslint.config.js:1-3` requires `@eslint/js`, `typescript-eslint`, `angular-eslint`, but `package.json`
declares only the two `@typescript-eslint/*` v8 packages plus `angular-eslint`. `node_modules/typescript-eslint`
does not exist (verified).

**Fix:** add `"typescript-eslint": "^8.x"` and `"@eslint/js": "^9.x"` to `devDependencies`, remove the
now-redundant `@typescript-eslint/eslint-plugin` / `@typescript-eslint/parser` entries, `npm dedupe`,
regenerate the lockfile.

**Acceptance:** `npm run lint` exits 0 for all 7 libraries + the app (after adding the missing lint target, T2).

### B4. Both spec tsconfigs are invalid

```
$ npx tsc -p tsconfig.spec.json --noEmit
error TS2688: Cannot find type definition file for 'vitest/globals'.
error TS6053: File '/…/src/test.ts' not found.
```

- `tsconfig.json:20-22` sets `"typeRoots": ["node_modules/@types"]`, which **blocks** non-`@types` type
  packages such as `vitest/globals`. Remove `typeRoots` (enumerate `types` instead).
- `tsconfig.spec.json:12-14` still lists `"files": ["src/test.ts"]` — that file was deleted with Karma.
  Every `projects/*/tsconfig.spec.json` has the same `files` entry pointing at its own `src/test.ts`,
  which exists but is a Karma leftover (T4).
- Reproducible per library: `npx tsc -p projects/ng-form-elements/tsconfig.spec.json --noEmit` → `TS2688`.

**Acceptance:** root and per-library spec tsconfigs type-check clean.

---

## 4. P1 — Angular 22 compatibility & deprecations

### C1. `@angular/platform-browser-dynamic` is deprecated (removal in v23)

Used by `setup-test.ts:3-6` and by all seven `projects/*/src/test.ts` Karma leftovers
(`BrowserDynamicTestingModule`, `platformBrowserDynamicTesting`).

**Action:** switch the test environment to the supported API (verified to exist in
`@angular/platform-browser/types/testing.d.ts`):

```ts
import { getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { provideZonelessChangeDetection } from '@angular/core';

getTestBed().initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
  providers: [provideZonelessChangeDetection()],   // align tests with the zoneless app
});
```

Then remove `@angular/platform-browser-dynamic` from `package.json` (only tests used it).

### C2. Zoneless app + zone-based tests (inconsistent runtime)

`src/main.ts:11` uses `provideZonelessChangeDetection()`, but `setup-test.ts:1` imports
`@analogjs/vitest-angular/setup-zone`, which pulls `zone.js`, `zone.js/testing`, `SyncTestZoneSpec` and
`ProxyZoneSpec` (verified in `node_modules/@analogjs/vitest-angular/setup-zone.js`). Tests therefore run
in **zone** mode: every zoneless regression (missing signal write, lost CD notification) is invisible in
CI, and `zone.js@^0.16.2` stays in `devDependencies` for no product reason.

**Action:**
(a) initialise the TestBed environment zoneless as in C1;
(b) upgrade `@analogjs/vitest-angular` from `1.22.5` to the `2.x` line (registry `latest = 2.9.2`) so it
matches `@analogjs/vite-plugin-angular@2.6.4`;
(c) drop the `singleFork: false / maxForks: 1 / fileParallelism: false` overrides in `vitest.config.ts:33-40`
once the suite is clean;
(d) keep `zone.js` only if a specific test still needs it.

### C3. `@angular/animations` is deprecated in v22

`npm ci` warning: *"@angular/animations is deprecated. Use `animate.enter` and `animate.leave` instead."*
`src/main.ts:4,12` also uses `provideAnimationsAsync()`, which is
`@deprecated 20.2 … Intent to remove in v23` (verified in
`@angular/platform-browser/types/animations-async.d.ts:38`).

**Action:** remove `@angular/animations` from dependencies and `provideAnimationsAsync()` from `main.ts`.
The library does not use the animations API at all — `ModalComponent` only toggles CSS classes
(`modal.component.html:3`, `modal.component.ts:57-73`). If animation support is wanted later, use
`animate.enter` / `animate.leave` bindings.

### C4. `@angular-devkit/build-angular` is deprecated **and unused**

Declared at `package.json:32`, but `angular.json` only uses `@angular/build:application`,
`@angular/build:dev-server`, `@angular/build:ng-packagr`. It drags in `@ngtools/webpack` and the whole
Webpack toolchain.

**Action:** remove it; keep only `@angular/build`, `@angular/cli`, `@angular/compiler-cli`.

### C5. Signal Forms custom-control contract (the real Milestone-2 work)

`@angular/forms` v22 defines the contract UI-kit controls should implement (verified in
`node_modules/@angular/forms/types/signals.d.ts:620`):

```ts
interface FormValueControl<TValue> extends FormUiControl<TValue> {
  readonly value: ModelSignal<TValue>;      // required
  readonly checked?: undefined;             // reserved for FormCheckboxControl
}

interface FormCheckboxControl extends FormUiControl<boolean> {
  readonly checked: ModelSignal<boolean>;   // required
  readonly value?: undefined;
}
```

`FormUiControl` optionally consumes `disabled`, `readonly`, `hidden`, `invalid`, `pending`, `touched`,
`dirty`, `name`, `required`, `min`, `max`, `minLength`, `maxLength`,
**`pattern?: InputSignal<readonly RegExp[]>`**, plus the `touch` output and `focus()` / `reset()` methods.

Gap analysis against the current code:

| Component | Current | Gap |
|---|---|---|
| `Input`, `Textarea`, `TagsInput`, `Typeahead`, `Dropdown`, `Radiobutton`, `TimePicker`, `DatetimePicker` | `value = model<T>()` | ✅ already the right shape — add the optional state inputs/outputs to opt in |
| `CheckboxComponent` (`checkbox.component.ts:30`) | `value = model<any>(false)` | ❌ must expose `checked` for `[formField]`; keep `value` as deprecated alias or drop in a major |
| all form components (`pattern = input<string>('')`) | `string` | ❌ contract expects `readonly RegExp[]` — change type (major, document it) |
| all form components | nothing emits `touch` | ❌ add `touch = output<void>({ alias: 'touch' })` on blur so `debounce('blur')` works |
| `required` | `input<boolean>(false)` | ✅ compatible |
| `disabled` | `input<boolean>(false)` | ✅ compatible |

**Action:** introduce one *composed* partial in `ng-sq-common` that every control mixes in
(`FormFieldConfig` / `FORM_FIELD_DEFAULTS` in `form-field-signals.ts:22-44` is the seed), then add
integration tests that bind a control via `[formField]` to a `form()` model.

### C6. `@js-temporal/polyfill` on an Angular 22 baseline

`@js-temporal/polyfill@0.5.1` is a **runtime dependency** of `@sq-ui/ng-datetime-picker`
(`projects/ng-datetime-picker/package.json:55`) imported by `DatetimePickerComponent`,
`TimePickerComponent` and the demo app. With TS 6 / `lib: ["es2022","dom"]` it type-checks, but it ships
~100 KB to consumers whose browsers may already provide `Temporal`, and it forces a transitive dep on
every consumer.

**Action (P3, not blocking):** either make it an optional `peerDependency` or inject a `TEMPORAL` token
defaulting to `globalThis.Temporal ?? (await import('@js-temporal/polyfill'))`, plus a runtime smoke test.

### C7. Removable / stale dependencies

| Dependency | Why |
|---|---|
| `marked@^3` | not imported anywhere (verified by grep) |
| `vite-tsconfig-paths@^6` | not referenced by `vitest.config.ts` |
| `@types/node@^15` | 9 majors behind the Node 24 toolchain |
| `copyfiles@^2` | only used by `copy:styles`, should become an ng-packagr `assets` entry (P5) |
| `@angular/platform-browser-dynamic` | C1 |
| `@angular/animations` | C3 |
| `@angular-devkit/build-angular` | C4 |

---

## 5. P2 — Build, TypeScript and tooling configuration

### T1. Root `tsconfig.json` carries pre-Ivy leftovers

```jsonc
{
  "ignoreDeprecations": "6.0",           // line 4  – only needed while deprecated options remain
  "downlevelIteration": true,            // line 6  – pointless with target ES2022
  "useDefineForClassFields": false,      // line 17 – diverges from the Angular 22 default (true)
  "typeRoots": ["node_modules/@types"],  // lines 20-22 – breaks `vitest/globals` (B4)
  "strict": false, "noImplicitAny": false
}
```

**Action:** remove `downlevelIteration`, `typeRoots` and `ignoreDeprecations` as part of the cleanup;
align `useDefineForClassFields` with the CLI default; enable `strict` for the libraries at minimum (and
`strictTemplates`, T5).

### T2. `angular.json` gaps

- The app (`sq-ui`) has **no `lint` target** at all, and **no project has a `test` target** — `ng test`
  does not exist anywhere; tests run only through bare `vitest`.
- `lint` targets exist only for `ng-sq-ui`, `ng-datetime-picker`, `ng-datatable`, `ng-sq-common`,
  `ng-modal`. **`ng-form-elements` and `ng-progress-bar` are never linted.**
- `ng-form-elements` / `ng-progress-bar` omit `tsConfig` in `build.options` (only in per-configuration
  blocks) — inconsistent with the other five libraries.
- `production.namedChunks: false` is a Webpack-era option (still accepted, no effect on esbuild).
- `budgets` only enforce `anyComponentStyle` (6 kb).

**Action:** add `test` and `lint` targets to every project, normalise library build options, drop
`namedChunks`, add `bundle` budgets.

### T3. `vitest.config.ts`

- `test.include` lists only `projects/**` — **none of the app specs (`src/app/**/*.spec.ts`) ever run**
  (33 spec files exist, 23 are executed).
- Duplicated alias configuration (`resolve.alias` at lines 9-18 *and* `test.alias` at lines 47-52).
- `pool: 'forks'`, `maxForks: 1`, `fileParallelism: false` serialise the whole suite for no reason.
- `css: false` means component styles are never exercised.

**Action:** add `'src/**/*.spec.ts'` to `include`, keep one alias definition, allow parallelism, review
`css`.

### T4. Karma leftovers (dead files + missing dependency)

Seven `projects/*/src/test.ts` files still import `core-js/proposals/reflect-metadata`,
`zone.js/dist/zone`, `zone.js/dist/zone-testing` and configure the deprecated
`BrowserDynamicTestingModule`. `core-js` is **not installed** (verified), so these files cannot compile;
they are referenced by every `tsconfig.spec.json` `files` entry and matched by the lint patterns.

**Action:** delete all seven `src/test.ts` files, drop the `files` entries from the spec tsconfigs, and
keep a single modernised root `setup-test.ts` (C1/C2).

### T5. Template type-safety is off

No `strictTemplates` anywhere, so genuine type bugs pass silently. Examples:

- `datatable.component.html:32-35` binds `[itemsPerPage]="paginatorConfig().itemsPerPage"` (`number |
  undefined`) into `input<number>(10)`. Passing `undefined` **overrides** the default, so
  `Math.ceil(items.length / undefined)` → `NaN` → the paginator renders **zero pages** for the documented
  simplest setup `<sq-datatable [items]="items">` (`paginatorConfig` defaults to `{}`).
- `sort-item.ts` declares `name: string` but receives `name = input<string>()` (`string | undefined`)
  at `datatable-column.component.ts:37`.

**Action:** enable `strictTemplates` for the libraries, fix the flagged bindings, and make
`PaginatorComponent` fall back to defaults (`this.itemsPerPage() ?? 10`).

### T6. Sass: Dart Sass 3.0 will break this build

`npm run build:libs` emits dozens of deprecation warnings from the `angular-sass` plugin:

```
src/lib/radiobutton/radiobutton.component.scss:1:8   @import "…/colors.scss"   → @import rules are deprecated
src/lib/checkbox/checkbox.component.scss:16:18       darken($disabled-color, 30%) → use color.adjust
projects/ng-sq-common/src/lib/sq-ui-theme.scss:2:8   @import './styles/colors'
src/styles.scss:1:8                                  @import '../projects/…/sq-ui-theme'
```

**Action:** migrate every `@import` to `@use`/`@forward` with explicit namespaces, replace
`darken()`/`lighten()` with `color.adjust()`, and run the official migrator:
`npx sass-migrator module --migrate-deps <file>` then `npx sass-migrator color`.

### T7. `.browserslistrc` advertises browsers Angular 22 does not support

The build warns that `chrome 109`, `opera 127`, `safari 26.5`, `samsung 29`, `android 150`… fall outside
Angular's support window (caused by `> 0.5%` + `last 2 versions` + `Firefox ESR` + `not dead`), and that
`kaios 2.5`, `op_mini all` are ignored as ES5-only.

**Action:** replace with an explicit modern list, e.g. `last 2 Chrome versions`, `last 2 Firefox
versions`, `last 2 Edge versions`, `last 2 Safari versions`, `Firefox ESR`, `not dead` — and re-check that
the warning is gone.

### T8. Lockfile hygiene

`package-lock.json` is `lockfileVersion: 2` (npm 7 era) while the toolchain is npm 11, and the CI installs
with `--legacy-peer-deps` to paper over peer gaps. Regenerate with `rm -rf node_modules package-lock.json
&& npm install` (v3 lockfile), commit it, and try to drop `--legacy-peer-deps` from CI.

---

## 6. P3 — Component & template defects found during the review

These are functional bugs (not style nits). They are ordered by user impact. All file references are
current `morph-main` lines.

| # | Component | Bug | Impact |
|---|---|---|---|
| D1 | `TypeaheadComponent` | `turnClickOutsideListenerOn()` calls `this.value.set([])` (`typeahead.component.ts:125-128`) and is bound to `(focus)` (`typeahead.component.html:46`) | **Focusing the input erases the bound value** — chips disappear on every click into the field |
| D2 | `TypeaheadComponent` | `debounceTime(this.delay())` is read once inside the constructor (`:70`) | `[delay]` input is ignored after construction (always the default 500 ms) |
| D3 | `TypeaheadComponent` | `selectedItems` is never seeded/synced from `value()` | Programmatic writes to `[(value)]` do not render chips; `removeSearchResult` then operates on a stale list |
| D4 | `DatatableComponent` + `PaginatorComponent` | `[itemsPerPage]`/`[lastPage]`/`[currentPage]` bound from `paginatorConfig()` which defaults to `{}` (`datatable.component.html:32-35`) | `undefined` overrides the input defaults → paginator renders with `NaN` page count and an empty collection |
| D5 | `PaginatorComponent` | `setTimeout(…, 100)` before emitting `paginatedCollection` (`paginator.component.ts:172-174`) | first render of any datatable is empty for 100 ms; makes tests async-happy and flaky (B2) |
| D6 | `PaginatorComponent` | `if (!items[lowerLimit]) { newUpperLimit = items.length - 1; }` (`:163-166`) | off-by-one: the last item of the collection is dropped when the page overflows |
| D7 | `PaginatorComponent` | `navigateToPage()` can index out of range → `onPageClick(undefined)` → `page.number` throws (`:90-98`) | runtime error if a disabled button is triggered programmatically |
| D8 | `DropdownComponent` | closing relies on **event bubbling**: the option's `(click)="selectOption(option)"` (`dropdown.component.html:47`) bubbles to the root `(click)="toggleOptionsDropdown()"` (`:6`), and `selectOption()` never sets `isOpen=false` (`dropdown.component.ts:64-68`) | any click inside the options panel (including padding) toggles the dropdown; adding `stopPropagation` would leave it permanently open. Needs explicit `isOpen.set(false)` + `$event.stopPropagation()` |
| D9 | `CheckboxComponent` / `RadiobuttonComponent` | wrapper `(click)` toggles the model **and** the inner `<input type=checkbox>` is also clickable (`checkbox.component.html:1-9`) | clicking the native input double-toggles / fires `isSelectedChange` twice; keyboard activation is not handled (`keydown.space`), and `aria-checked` is missing |
| D10 | `CollapseContentComponent` | content is rendered only when `isCollapsed()` is `true`, and the chevron mapping is inverted (`collapse-content.component.html:15, 21-23`) | the collapse is inverted; `@if` also destroys/recreates projected content → demo form state is lost on toggle |
| D11 | `DatetimePickerComponent` | initialisation lives in `ngOnInit()` (`:79-86`) and unconditionally seeds `selectedDates` with *today*, never reading the `value` input | `[(value)]` writes from the parent are ignored (no write-back path at all) |
| D12 | `TimePickerComponent` | `value` model is written in effects (`:85, 92, 108, 120, 125`) but **never read** | parent `[value]` is ignored; the picker always starts at "now"; emitting an output from an `effect` is a CD hazard |
| D13 | `TimePickerComponent` | `inputHours`/`inputMinutes` effects mutate `currentTime` (`:96-122`) | contradictory sources of truth with the `value` model and with `(hoursChange)`; last writer wins |
| D14 | all form components | `generateFormFieldId()` uses `new Date().getTime()` (`form-field-signals.ts:32-34`) | two components created in the same millisecond share an `id`/`name` → broken `<label for>`, broken radio grouping |
| D15 | `RadiobuttonComponent` | group exclusivity is broadcast through `CustomEventBroadcasterService` keyed by `name()` (`:44-57`) | O(n) broadcast per click and ordering-dependent; native radio grouping (`name`) would be simpler and a11y-correct |
| D16 | `TagsInputComponent` | `onUserInput` uses `$event.keyCode` (`:43, 49`) and compares `isModelEmpty` heuristics | `keyCode` is deprecated; Space/Backspace handling is fragile, no `,`/Enter support, no ARIA |
| D17 | `InputCoreComponent` | `standalone: false` component with `template: ''` (`input-core-component.ts:13-16`) exported publicly | unusable: no NgModule declares it any more, and it is `@deprecated` — dead API surface |
| D18 | `OutsideClickListenerDirective` | registers a `document` `click` listener in the constructor for **every** instance (`:16-26`) | N document listeners; no filtering by event target/`composedPath()`, no `passive` option |

Recommended sequencing for D1–D18: D4/D5/D6/D7 (paginator+datatable correctness) → D1/D2/D3 (typeahead) →
D8/D9 (dropdown/checkbox UX) → D10–D13 (datetime-picker value contract) → D14–D18 (cleanup).

### Test-coverage gaps that hide these bugs

- App specs never execute (T3) — 10 files, including every docs/demo component.
- `setup-test.ts:17-21` converts **any** `console.error` into a thrown `Error`. That turns framework
  warnings (e.g. `NG0953`, `NG0912`, hydration warnings) into test failures *and* blocks the retry logic
  of the runner. Prefer `expect(...).toHaveBeenCalledTimes(0)` or fail the test explicitly per case.
- No specs at all for `ModalComponent` behaviour beyond creation, for `TypeaheadComponent`'s debounce, or
  for `DatetimePickerComponent`'s value round-trip.

---

## 7. P4 — CI / CD

Current workflow `.github/workflows/main.yml`:

```yaml
on:
  push:         { branches: [ master, develop ] }
  pull_request: { branches: [ master, develop ] }
jobs.build.steps:
  - checkout@v4
  - setup-node@v4 { node-version: '22', check-latest: true }
  - run: npm ci --legacy-peer-deps
  - uses: paambaati/codeclimate-action@v6 { coverageCommand: npm run coverage }
```

Problems:

1. **Wrong branches.** The active development branch is `morph-main`; `develop` does not exist
   (`git branch -a` shows `master`, `morph-main`, feature branches). The workflow therefore only runs on
   `master` — PRs into the working branch get **no CI at all**. `.github/dependabot.yml` also targets the
   non-existent `develop`.
2. **No build, no lint.** Only `npm run coverage` runs — which is precisely why B1 (app build), B3 (lint)
   and B4 (tsconfig) went unnoticed.
3. **`npm run coverage` hangs** (B2) → the job burns the 6-hour default timeout (no `timeout-minutes`).
4. **Node version drift.** Angular 22 requires `node ^22.22.3 || ^24.15.0 || >=26` (verified in the
   `engines` of `@angular/cli`, `@angular/core`, `ng-packagr`). `node-version: '22'` + `check-latest` works
   today but is unpinned; add `.nvmrc` and an `engines` field, and use `node-version-file: .nvmrc`.
5. **No caching, no concurrency, no `permissions`, no `timeout-minutes`.**
6. `--legacy-peer-deps` should become unnecessary after T8.

**Proposed pipeline (single job, fail-fast):**

```yaml
name: CI
on:
  push:         { branches: [ master, main, morph-main ] }
  pull_request: {}
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
permissions: { contents: read }
jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version-file: '.nvmrc', cache: 'npm' }
      - run: npm ci
      - run: npx tsc -p tsconfig.spec.json --noEmit   # B4 guard
      - run: npm run lint                              # B3 guard
      - run: npm run build:libs                        # 7 library packages
      - run: npm run build                             # demo app (catches B1)
      - run: npm run test                              # hangs today → B2
      - uses: paambaati/codeclimate-action@v6          # coverage upload last
```

Also: point Dependabot at the real default branch and group `@angular/*` updates.

---

## 8. P5 — Packaging & release readiness

| Issue | Detail | Action |
|---|---|---|
| **No version bump** | All packages are still `2.0.1` while `peerDependencies` now require Angular `^22.0.0` (`projects/ng-sq-ui/package.json:63-67`) | Publish **3.0.0** — Angular 22 + signal inputs + removal of `ControlValueAccessor` is breaking |
| **`peerDependencies` only on the barrel package** | `ng-form-elements`, `ng-modal`, `ng-progress-bar`, `ng-datatable`, `ng-datetime-picker` declare **no** Angular peer deps | Add `@angular/{core,common,forms}` peers to every package |
| **`@fortawesome/fontawesome-free` is a runtime `dependency`** of `ng-sq-ui`, `ng-modal`, `ng-datatable`, `ng-datetime-picker` | consumers get a CSS-only package force-installed | Make it a `peerDependency` + document adding the CSS to `angular.json` `styles` |
| **Styles are copied by a shell script** | `copy:styles` (`package.json:11`) copies only `ng-sq-common` styles into `dist/`; `ng-form-elements/src/lib/styles/form-elements.scss` is **never published**, yet `docs/troubleshooting.md:20` tells users to import `@sq-ui/ng-sq-ui/styles/form-elements.scss` | Move styles into each library's `ng-package.json` `"assets"`, delete `copyfiles` |
| **`allowedNonPeerDependencies: ["."]`** in every `ng-package.json` | no-op placeholder that suppresses the dependency warnings which would have caught the above | Remove it and fix the real declarations |
| **View-Engine-era compiler options** | `tsconfig.lib.json` files still set `skipTemplateCodegen`, `strictMetadataEmit`, `fullTemplateTypeCheck`, `flatModuleId`/`flatModuleOutFile` | Remove — ignored/deprecated by ng-packagr 22; keep `compilationMode: partial` |
| **Barrel package resolves `dist/` first** | `projects/ng-sq-ui/tsconfig.lib.json` paths map `@sq-ui/*` → `../../dist/*` before sources | Keep `build:libs` ordered and document that `ng build ng-sq-ui` alone is unsupported |
| **No publishing metadata** | no `publishConfig`, no `sideEffects` in the per-library `package.json` | Add `publishConfig: { "directory": "../../dist/<lib>" }` and `"sideEffects": false` |

---

## 9. P6 — Docs & demo app

- `README.md:38-61` still documents the Angular 14 compatibility matrix and the 1.x/2.x versions.
- `docs/*.md` (the docsify site) is written entirely in NgModule terms — `FormElementsModule`,
  `ModalModule`, `NgSqCommonModule`, "Exported As", `InputCoreComponent` — while the code is
  standalone-only. `src/app/sq-common/common/sq-common.component.ts:29` still advertises
  `InputCoreComponent (class)`.
- `docs/installation.md` shows `ReactiveFormsModule` imports and `@import`-based styles that no longer match
  the signal-based API.
- The demo description text (`sq-ui.component.html:19-21`) still refers to the `compatForm()` bridge; it must
  be updated together with B1.
- `src/index.html:19-26` still ships the legacy **Universal Analytics** snippet (`UA-123737621-1`, shut down
  in 2023) — replace with GA4 or remove.
- `src/app/app-nav/app-nav.component.html:9-17, 51-61` depends on the external
  `buttons.github.io/buttons.js` script loaded from `index.html:12`.

**Action:** rewrite `README` (compatibility table for 3.x, standalone usage, Signal Forms usage), regenerate
`docs/*.md` from the current public barrels (`projects/*/src/index.ts`), and add a
"Migrating from 2.x (Angular 14) to 3.x (Angular 22)" section covering:
`ControlValueAccessor` → `FormValueControl`, `formControlName` → `[formField]`, `@Input` → `input()`,
`*ngIf` → `@if`, `EventEmitter` → `output()`, NgModule import → direct component import.

---

## 10. Execution plan

### Phase 0 — Unblock (0.5–1 day) → *goal: the branch compiles, lints, and tests terminate*

| # | Task | Files | Done when |
|---|---|---|---|
| 0.1 | Fix B1 (`extractValue` or `form()` + `formRoot`) | `src/app/sq-ui/sq-ui/sq-ui.component.ts` / `.html` | `npm run build` → 0 |
| 0.2 | Fix B3 (`typescript-eslint`, `@eslint/js`) + lockfile refresh | `package.json`, `package-lock.json` | `npm run lint` → 0 |
| 0.3 | Fix B4 (`typeRoots`, `files`) and delete the 7 Karma `test.ts` files (T4) | `tsconfig*.json`, `projects/*/src/test.ts` | `npx tsc -p tsconfig.spec.json --noEmit` → 0 |
| 0.4 | Fix B2: `async/await` paginator spec, drop the `setTimeout` in `PaginatorComponent` | `paginator.component.{ts,spec.ts}` | `npm test` terminates < 60 s |
| 0.5 | Modernise `setup-test.ts` (C1 + zoneless) | `setup-test.ts` | all specs still pass |

### Phase 1 — Angular 22 API alignment (3–5 days)

1. Remove `@angular/animations`, `provideAnimationsAsync()`, `@angular/platform-browser-dynamic`,
   `@angular-devkit/build-angular`, `marked`, `vite-tsconfig-paths` (C1–C4, C7).
2. Upgrade `@analogjs/vitest-angular` to `2.x`; run the suite zoneless (C2).
3. Add a `test` target and a `lint` target to every project; add app specs to `vitest.config.ts` (T2, T3).
4. Enable `strict` + `strictTemplates` for the libraries and fix what it uncovers (T1, T5).
5. Add `touch` / state inputs and opt in to `FormValueControl` / `FormCheckboxControl`;
   `CheckboxComponent` gains `checked` (C5).

### Phase 2 — Correctness backlog (5–8 days)

Work the D-table in the order given in §6. Every fix lands with a regression spec — the current suite has
almost no behavioural coverage for these components.

### Phase 3 — Tooling, CI, publishing (2–3 days)

1. Sass migration (T6), browserslist (T7), lockfile v3 (T8).
2. New workflow per §7; make `npm test`, `npm run build`, `npm run lint` required checks.
3. Packaging: `assets` for styles, peer deps, `publishConfig`, `sideEffects`, version `3.0.0` (§8).

### Phase 4 — Docs & release (2 days)

Rewrite README + `docs/*` + the migration guide (§9); cut `3.0.0-rc.0`; verify `npm pack --dry-run` contents
for each `dist/*`; release.

---

## 11. Decisions needed before Phase 1

1. **Form-control public API** — keep `[(value)]` as the primary binding (current demo) or move to
   `[formField]` + `FormValueControl`? Recommendation: support both — `model()` already satisfies the
   signal-forms contract, so opting in is additive.
2. **`pattern` input type** — switching `string` → `readonly RegExp[]` is breaking; do it in 3.0.0 or keep
   `string` and add a separate `patterns` input? Recommendation: add `patterns: input<readonly RegExp[]>([])`
   in 3.0.0 and document the change.
3. **`CheckboxComponent`** — replace `value` with `checked` (breaking) or expose both? Recommendation: expose
   `checked` and keep `value` as a deprecated alias for one major.
4. **`@js-temporal/polyfill`** — hard dependency vs peer/optional (C6).
5. **Zone.js** — keep it as a dev-only test dependency or go fully zoneless in tests? Recommendation: fully
   zoneless; it is the only way to catch the bugs this branch introduces.
6. **`@angular-devkit/build-angular` removal** — confirm nothing else in the hosting/publishing flow needs it.

---

## 12. Definition of done (verification checklist)

```bash
export PATH="$HOME/.nvm/versions/node/v24.21.0/bin:$PATH"
npm ci                                    # no --legacy-peer-deps, no deprecation warnings
npx tsc -p tsconfig.spec.json --noEmit    # 0 errors
npm run lint                              # 0 errors, all 8 projects
npm run build:libs                        # 0 errors, no Sass deprecation warnings
npm run build                             # 0 errors, no browserslist warnings
npm test                                  # terminates, green, exits 0
npm run coverage                          # completes, lcov produced
```

Plus:

- [ ] Production build served; all 6 routes opened with no `NG0…` console warnings.
- [ ] `npm pack --dry-run` in each `dist/*` contains `styles/`, `README.md`, and correct peer metadata.
- [ ] No deprecated packages remain (`@angular/animations`, `@angular/platform-browser-dynamic`,
      `@angular-devkit/build-angular`).
- [ ] CI green on a PR targeting `morph-main`, with `lint`, `build:libs`, `build`, `test` as separate steps.

---

## 13. Execution log — 2026-10-28

Work executed against this plan, in order, with the verification for each step.

### 13.1 Phase 0 — blockers (done)

| Item | Change | Verification |
|---|---|---|
| **B1** | `sq-ui.component.ts`: `compatForm()` value read through `extractValue()` (v22 returns a `FieldTree`, not a `FormGroup`) | `npm run build` → **exit 0** |
| **B2** | `PaginatorComponent`: removed the `setTimeout(..., 100)`, synchronous `paginatedCollection`, default-aware getters, bounds-safe `generatePaginatedCollection`, guarded `onPageClick`/`navigateToPage`; `paginator.component.spec.ts` fully rewritten with `async/await` (15 tests, +4 new) | `npm test` terminates, 32 files / 108 tests green, ~7 s |
| **B3** | `package.json`: added `typescript-eslint` + `@eslint/js`, removed the redundant `@typescript-eslint/*` packages; `eslint.config.js` migrated to the flat-config reality (dual selector styles, documented rule exceptions) | `npm run lint` → **exit 0** (warnings only, tracked as TODO) |
| **B4** | `tsconfig.json`: dropped `typeRoots`, `baseUrl`, `downlevelIteration`, `ignoreDeprecations`, `useDefineForClassFields: false`; spec tsconfigs no longer reference `src/test.ts`; deleted the 7 Karma `src/test.ts` files | `npm run typecheck` → **exit 0** |

### 13.2 Phase 1 — Angular 22 alignment (done)

| Item | Change |
|---|---|
| **C1** | `setup-test.ts` now uses `BrowserTestingModule` + `platformBrowserTesting` from `@angular/platform-browser/testing`; `@angular/platform-browser-dynamic` removed from `package.json` |
| **C2** | Tests run **zoneless** (no `zone.js`, no `@analogjs/vitest-angular/setup-zone`); all specs migrated from `waitForAsync`/`done`/`whenRenderingDone` to `async`/`await` |
| **C3** | `@angular/animations` dependency and `provideAnimationsAsync()` removed from `main.ts` |
| **C4/C7** | Removed `@angular-devkit/build-angular`, `marked`, `vite-tsconfig-paths`, `copyfiles`, `zone.js`; `@types/node` → `^24`; lockfile regenerated (`lockfileVersion: 3`) |
| **T1** | Root `tsconfig.json` cleaned; path aliases work without `baseUrl` (per-project `paths` re-based to `../../`) |
| **T2** | `angular.json`: `lint` targets added for the app + `ng-form-elements` + `ng-progress-bar`; `tsConfig` added to their build options; `namedChunks` dropped; `initial` bundle budget added |
| **T3** | `vitest.config.ts`: app specs are now collected (`src/**/*.spec.ts`), single alias source, serial-execution overrides removed |
| **T5** | `strictTemplates: true` for all seven libraries; View-Engine-era `angularCompilerOptions` (`skipTemplateCodegen`, `strictMetadataEmit`, `fullTemplateTypeCheck`, `flatModuleId`, …) removed; paginator inputs widened to `number \| undefined` so partial `paginatorConfig` bindings are type-safe |
| **T6** | Sass modernised: every `@import` → `@use`, `darken()` → `color.adjust()`, theme partials turned into `sq-reset`/`sq-base`/`sq-utilities` mixins — the build is now free of Sass deprecation warnings |
| **T7** | `.browserslistrc` replaced with the Angular 22 supported-browser list — the "unsupported browsers" warning is gone |
| **T8** | Lockfile regenerated to v3 (`npm install`); `--legacy-peer-deps` still required because of the `@angular/build` → `vitest@^4` peer (see §13.4) |
| **P4** | `.github/workflows/main.yml` rewritten: correct trigger branches, `node-version-file`, npm cache, concurrency, `timeout-minutes`, and `typecheck → lint → build:libs → build → coverage` steps; `.github/dependabot.yml` points at `morph-main` and groups Angular/tooling updates; `.nvmrc` added |
| **P5** | Libraries bumped to **3.0.0**; `peerDependencies` (`@angular/*`, optional `@fortawesome/fontawesome-free`) added to every package; `sideEffects: false` + `publishConfig.directory`; styles are now published through `ng-package.json` `assets` (verified: `dist/ng-sq-common/styles/*.scss`, `dist/ng-form-elements/styles/form-elements.scss`); `allowedNonPeerDependencies` lists the real non-peer deps |
| **P6** | `README.md`: new compatibility matrix (3.x ↔ Angular 22) and a 2.x → 3.x migration cheat-sheet, signal-based usage sample, corrected style paths |

### 13.3 Component fixes delivered with the migration

| Plan id | Fix |
|---|---|
| D4/D5/D6/D7 | Paginator: no `setTimeout`, correct last-page slice, no out-of-range navigation, `undefined` bindings fall back to defaults |
| D12/D13 + **D19 (new)** | `TimePickerComponent`: the `value` model is only emitted when it actually changes, and the `inputHours`/`inputMinutes`/`isMeridiem` effects are wrapped in `untracked()` — **this was an infinite effect loop that froze the browser whenever `[hours]`, `[minutes]` or `[isMeridiem]` were bound** |
| D11 | `DatetimePickerComponent.onTimeChange()` ignores the echo of its own emission (second half of the same feedback loop) |
| D17 | `InputCoreComponent` kept, but the lint rules that conflict with its legacy shape are explicitly scoped (removal scheduled for the 3.0.0 follow-up) |
| — | Dead code removed: `datatable-interaction-item.ts`, empty `ngOnInit`/constructors; constructor injection migrated to `inject()` |

### 13.4 New findings discovered while executing

| Id | Finding | Status |
|---|---|---|
| **D19** | `TimePickerComponent` effects read *and* wrote the same signals → infinite effect loop; any page binding `[hours]`/`[minutes]`/`[isMeridiem]` hangs (the docs page does) | **fixed** with `untracked()` |
| **D20** | `CalendarManagerService.generateCalendarForMonth()` — *investigated, **not a bug***: `tableRow.length <= 6` intentionally builds **7-cell (week) rows**, matching the 7 weekday headers. Now pinned by a regression spec (`6 rows × 7 days`) | closed (verified) |
| **T9** | `@js-temporal/polyfill` + Vite dependency optimizer — **resolved (false alarm)**: the "hang" was a **stale `node_modules/.vite` optimizer cache** left behind by interrupted runs, not an upstream bug. After a clean install the polyfill probe runs in 1.7 s and the demo spec executes. The exclusion workaround is gone | closed |
| **T10** | `@angular/build@22` peers `vitest@^4` — **resolved**: the workspace is now on **Vitest 4.1.12** / `@vitest/coverage-v8@4.1.12`, `npm install` and `npm ci` run **without** `--legacy-peer-deps` | closed |

### 13.5 Final verification (this branch)

```text
npm ci                        OK  no --legacy-peer-deps, no peer warnings
npm run build:libs            OK  exit 0 - 7 packages, styles published via assets, no Sass warnings
npm run typecheck             OK  exit 0 (needs a fresh dist/, hence the order)
npm run lint                  OK  exit 0 (0 errors, `any` warnings tracked as TODO)
npm run build                 OK  exit 0 - 326 kB initial, no browserslist warnings
npm test                      OK  exit 0 - 34 files / 124 tests (Vitest 4.1.12), ~8 s
```

### 13.6 Second batch — backlog fixes (done, same day)

| Plan id | Fix | Evidence |
|---|---|---|
| **D1** | typeahead: focusing the input no longer clears `[(value)]` (`turnClickOutsideListenerOn` only arms the outside-click listener) | new spec *"should focus the input without clearing the bound value"* |
| **D2** | typeahead: `[delay]` is honoured after construction — `debounce(() => timer(this.delay()))` reads it per keystroke | existing debounce specs still green |
| **D3** | typeahead: an effect mirrors programmatic `value` writes into the chip list (reference-compared, no loops) | new spec *"should mirror a programmatically assigned value into the chip list"* |
| **D8** | dropdown: `selectOption()` sets `isOpen=false` and the option click stops propagation, so closing is explicit instead of relying on bubbling | new spec *"should close the dropdown after an option is selected"* |
| **D9** | checkbox/radiobutton: the native `<input>` (stretched over the control by CSS) is now the **only** interaction path → single toggle, native keyboard/arrow support, `ngModel` replaced by `[checked]` | new spec *"should toggle exactly once when the native checkbox is clicked"*; radiobutton group specs still green |
| **D10** | `collapse-content`: expanded by default (same initial look), correct chevron and `aria-expanded`, `[hidden]` instead of `@if` so projected content and its state survive collapsing | 2 new specs (state flip + hidden-but-alive probe input) |
| **D11** | `datetime-picker`: opens on the bound `[(value)]` (Date / unix ms / ISO string / `PlainDate` / `PlainDateTime`, single and multiple) instead of always "today" | 2 new specs (value month + today fallback) |
| **D14** | `generateFormFieldId()` uses a monotonic counter instead of a timestamp → no duplicate `id`/`name` within a millisecond | — |
| **D16** | tags-input: `$event.key` (Space/Enter/Comma commit a tag, Backspace removes the last one) instead of deprecated `keyCode` | new spec for Enter/Comma |
| **D20** | verified **not a bug** (7-cell week rows) and pinned by a `6 × 7` regression spec | new calendar-manager spec |

Test suite grew **108 → 118 tests**; `typecheck`, `lint`, `build:libs` and `build` all stay green.

### 13.7 Vitest 4 migration (done — see `VITEST_4_MIGRATION_PLAN.md`)

| Item | Change |
|---|---|
| Dependencies | `vitest` + `@vitest/coverage-v8` → **4.1.12**; `npm install` / `npm ci` are now `ERESOLVE`-free, `--legacy-peer-deps` removed from the CI workflow |
| Root cause of the earlier "hang" | A **stale `node_modules/.vite` dependency-optimizer cache** left behind by interrupted (`pkill -9`) runs — *not* an upstream bug and not the polyfill. After a clean install the polyfill probe ran in 1.7 s and every spec completed |
| Config | `coverage.include`/`exclude` added (`coverage.all` and `coverage.extensions` were removed in v4); explicit `test.exclude` (`node_modules`, `dist`) because v4 no longer ships a long default list; `poolOptions`/`test.alias` were never used |
| Specs | The `src/app/datetime-picker/**/*.spec.ts` exclusion is gone; that spec now runs and needed `provideRouter([])` (same missing-provider gap as the modal/sq-ui specs) |
| Result | **33 files / 119 tests** on Vitest 4.1.12, ~8 s, `coverage/lcov.info` produced |

### 13.8 Signal Forms opt-in — C5 (done)

| Item | Change |
|---|---|
| Contract | New `SqFormValueControl<T>`, `SqFormCheckboxControl`, `SqFormUiControl<T>` type aliases in `@sq-ui/ng-sq-common` (re-exported from `@angular/forms/signals`), so consumers do not depend on the exact Angular type names |
| `pattern` | `pattern` is now `input<readonly RegExp[]>([])` — the exact shape of `FormUiControl.pattern`, so `[formField]` binds the schema patterns automatically. `toPatternAttribute()` serialises it for the native attribute; `sq-input` binds `[pattern]="patternAttribute()"` |
| `touch` | Every control with a focusable element emits `touch` on blur (`sq-input`, `sq-textarea`, `sq-tags-input`, `sq-typeahead`, `sq-checkbox`, `sq-radiobutton`, `sq-time-picker`) → the directive marks the field as touched |
| `implements` | All nine form controls now declare `implements SqFormValueControl<T>` (`<string>`, `<string[]>`, `<LabelValuePair[]>`, `<LabelValuePair \| null>`, `<boolean>`, `<any>`) |
| Proof | New `projects/ng-form-elements/src/lib/signal-forms.integration.spec.ts` — **5 tests**: model→view, view→model (`input` event), checkbox state, `touch` → `field.touched()`, schema `required()` → native `required` |
| Docs | README gained an *Angular Signal Forms* section + the `pattern` migration row; the docsify module pages got a "documents the 2.x API" banner |

### 13.9 Remaining backlog (next PRs)

1. **C6** optional `@js-temporal/polyfill` (injection token or lazy import) — bundle-size only; the test runner no longer cares.
2. **T2** a real `test` architect target (or formally document `npm test` as the entry point), plus **D15** (radiobutton broadcast) if native radio grouping proves insufficient.
3. Full regeneration of `docs/*.md` (the banner only marks them as 2.x material).

---

## Appendix A — Where each claim was verified


| Claim | Evidence |
|---|---|
| App build fails on `compatForm().value` | `npm run build` → `TS2339 … Property 'value' does not exist on type 'FieldTree<…>'`; same from `npx tsc -p src/tsconfig.app.json --noEmit` |
| `compatForm` returns `FieldTree` | `node_modules/@angular/forms/types/signals-compat.d.ts:52, 87` and `extractValue` at `:165` |
| `[formField]` / `form[formRoot]` selectors (classes `FormField` / `FormRoot`) | selectors + `export { … FormField, FormRoot … }` in `node_modules/@angular/forms/fesm2022/signals.mjs` |
| `compatForm` / `extractValue` / `SignalFormControl` runtime exports | `export { NG_STATUS_CLASSES, SignalFormControl, compatForm, extractValue }` in `fesm2022/signals-compat.mjs` |
| `FormValueControl` / `FormCheckboxControl` | `node_modules/@angular/forms/types/signals.d.ts:620-658` |
| `FormUiControl.pattern: InputSignal<readonly RegExp[]>` | `node_modules/@angular/forms/types/signals.d.ts:585` |
| Tests hang, `done()` rejected, `NG0953` spam | captured `vitest run` output (5+ minutes, no summary) |
| Lint fails on missing `typescript-eslint` | captured `ng lint` output; `node_modules/typescript-eslint` absent |
| Spec tsconfigs broken | `npx tsc -p tsconfig.spec.json --noEmit` → `TS2688`, `TS6053` |
| `provideAnimationsAsync` deprecated 20.2, removal v23 | `node_modules/@angular/platform-browser/types/animations-async.d.ts:38` |
| `BrowserTestingModule` / `platformBrowserTesting` exist | `node_modules/@angular/platform-browser/types/testing.d.ts` |
| Node engine range `^22.22.3 \|\| ^24.15.0 \|\| >=26` | `engines` of `@angular/cli`, `@angular/core`, `ng-packagr` |
| `@analogjs/vitest-angular` latest is `2.9.2` | `npm view @analogjs/vitest-angular dist-tags` |
| 33 spec files, 23 executed | `find … -name '*.spec.ts' \| wc -l` vs `vitest.config.ts` `include` |
| `core-js` missing | `ls node_modules/core-js` → not found |
| Libraries build green | `npm run build:libs` → `EXIT: 0`, 7 × `Built @sq-ui/…` |
| `marked`, `vite-tsconfig-paths`, `@angular-devkit/build-angular` unused | repo-wide grep |

## Appendix B — Suggested commit sequence

```
fix(app): use extractValue / formRoot with Angular 22 compatForm          # B1
chore(deps): add typescript-eslint + @eslint/js, lockfile v3              # B3, T8
chore(ts): fix spec tsconfigs, delete Karma test.ts files                 # B4, T4
fix(paginator): set paginatedCollection synchronously                     # B2, D5
test(paginator): migrate done() callbacks to async/await                  # B2
chore(angular22): drop animations, platform-browser-dynamic, webpack deps # C1-C4
test: run zoneless, upgrade @analogjs/vitest-angular to 2.x               # C2
build: lint+test targets for every project, app specs in vitest include   # T2, T3
fix(typeahead): don't clear value on focus, honour [delay], sync model    # D1-D3
fix(datatable): default paginator inputs, fix off-by-one                  # D4, D6, D7
fix(dropdown): close on select with stopPropagation                       # D8
fix(checkbox,radiobutton): single toggle path + keyboard/a11y             # D9
fix(demo): restore collapse-content semantics                             # D10
fix(datetime-picker): accept [value], remove ngOnInit seeding             # D11-D13
feat(forms): FormValueControl opt-in (touch output, checked checkbox)     # C5
style(scss): @use/@forward + color.adjust                                 # T6
ci: verify build+lint+test on PRs, pin node                               # P4
release: 3.0.0 with peer deps, published styles, publishConfig            # P5
docs: 3.x README, migration guide, regenerated docs/                      # P6
```

