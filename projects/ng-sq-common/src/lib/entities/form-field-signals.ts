import type { InputSignal, OutputEmitterRef } from '@angular/core';

/**
 * Interface defining the contract for shared form field properties.
 * Replaces the InputCoreComponent inheritance pattern with composition.
 *
 * Every form control declares its own signal inputs following this contract, using
 * {@link FORM_FIELD_DEFAULTS} for the default values, so that all controls share the same
 * public API surface.
 */
export interface FormFieldConfig {
  name: string;
  controlId: string;
  controlLabel: string;
  controlPlaceholder: string;
  required: boolean;
  /**
   * Validation patterns. The name matches Angular Signal Forms' `FormUiControl.pattern`
   * (`InputSignal<readonly RegExp[]>`) so the `[formField]` directive binds them automatically.
   */
  pattern: readonly RegExp[];
  disabled: boolean;
}

/**
 * The signal-input half of the form field contract: the members every SQ-UI form control declares
 * with these exact types.
 *
 * ```ts
 * export class InputComponent implements SqFormFieldSignals, SqFormValueControl<string> { ... }
 * ```
 *
 * Declaring the interface is what stops the nine controls from drifting apart: a control that
 * forgets `touch`, or that types `pattern` as `string`, no longer compiles. Angular Signal Forms'
 * `[formField]` directive relies on exactly these members.
 */
export interface SqFormFieldSignals {
  readonly name: InputSignal<string>;
  readonly controlId: InputSignal<string>;
  readonly controlLabel: InputSignal<string>;
  readonly controlPlaceholder: InputSignal<string>;
  readonly required: InputSignal<boolean>;
  readonly pattern: InputSignal<readonly RegExp[]>;
  readonly disabled: InputSignal<boolean>;
  /** Fires when the user leaves the control, so `[formField]` can mark the field as touched. */
  readonly touch: OutputEmitterRef<void>;
}

/**
 * Monotonic counter so that two controls created in the same millisecond never share an id
 * (a timestamp-based id produced duplicate `id`/`name` attributes and broke `<label for>`).
 */
let formFieldIdCounter = 0;

export function generateFormFieldId(): string {
  formFieldIdCounter += 1;
  return `sq-form-control-${formFieldIdCounter}`;
}

/** Shared, frozen default so no control can mutate another's `pattern` value. */
const NO_PATTERNS: readonly RegExp[] = Object.freeze([]);

export const FORM_FIELD_DEFAULTS: FormFieldConfig = {
  name: '',
  controlId: '',
  controlLabel: '',
  controlPlaceholder: '',
  required: false,
  pattern: NO_PATTERNS,
  disabled: false,
};

/**
 * Serialises {@link FormFieldConfig.pattern} into the value understood by the native
 * `pattern` attribute (a `|`-separated list of regular expressions).
 */
export function toPatternAttribute(patterns: readonly RegExp[] | undefined): string {
  return (patterns ?? []).map(pattern => pattern.source).join('|');
}
