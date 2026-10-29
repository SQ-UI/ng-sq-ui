import type {
  FormCheckboxControl,
  FormUiControl,
  FormValueControl,
} from '@angular/forms/signals';

/**
 * The Signal Forms contracts that the SQ-UI controls satisfy.
 *
 * A control that declares a `value` model (plus any of the optional state inputs such as
 * `disabled`, `required`, `touched`, `errors`, `patterns`) can be bound with the
 * `[formField]` directive from `@angular/forms/signals`:
 *
 * ```html
 * <sq-input [formField]="profileForm.name" controlLabel="Name" />
 * ```
 *
 * The aliases are re-exported so consumers do not need to depend on the exact
 * `@angular/forms/signals` type names.
 */
export type SqFormValueControl<TValue> = FormValueControl<TValue>;

/** Checkbox variant: the control exposes a `checked` model instead of `value`. */
export type SqFormCheckboxControl = FormCheckboxControl;

/** Optional surface a control can implement to receive the full field state. */
export type SqFormUiControl<TValue> = FormUiControl<TValue>;
