# Migrating to 3.0

Concise breaking-change checklist for `@sq-ui/*` **3.0.0**.

## Requirements

- **Angular 22+**, **Node 22+**
- Peer packages: `@angular/core`, `@angular/common`, `@angular/forms` `^22.0.0`

## Standalone only

- All NgModules removed (`NgSqUiModule`, `NgFormElementsModule`, `NgSqCommonModule`, etc.)
- Import standalone components/directives into your `imports` array
- Umbrella `@sq-ui/ng-sq-ui` **re-exports** symbols only — no module

## Forms → Signal Forms

- Controls implement `FormValueControl` (`value` model) or `FormCheckboxControl` (`checked` model)
- Bind with `[formField]` from `@angular/forms/signals` — not `formControlName` / `ngModel` / `NG_VALUE_ACCESSOR`
- Removed: `InputCoreComponent`, `ControlValueAccessorEnabler`, CVA providers

| Control | Contract |
|---------|----------|
| `sq-input`, `sq-textarea`, `sq-dropdown`, `sq-typeahead`, `sq-tags-input`, `sq-radiobutton`, `sq-datetime-picker`, `sq-time-picker` | `FormValueControl` |
| `sq-checkbox` | `FormCheckboxControl` (`checked`) |
| `sq-button`, `sq-form-group`, `sq-progress-bar`, `sq-modal`, `sq-datatable`, `sq-paginator` | presentational / not form-value controls |

## Dates

- **moment removed** → `Temporal.PlainDate` / `Temporal.PlainTime`
- Install `@js-temporal/polyfill` for browsers without native Temporal

## Other removals

- **immutable** (`List`, etc.) → native arrays
- **Font Awesome 6** asset paths in `angular.json`
- Radio grouping uses `RadioGroupRegistry` (signals), not `CustomEventBroadcasterService`

## Older lines

- **2.x** — Angular 14–16 era (NgModules / CVA)
- **1.x** — older Angular / View Engine (see root README)
