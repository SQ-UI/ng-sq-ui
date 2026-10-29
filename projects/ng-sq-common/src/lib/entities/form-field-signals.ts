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
 * Monotonic counter so that two controls created in the same millisecond never share an id
 * (a timestamp-based id produced duplicate `id`/`name` attributes and broke `<label for>`).
 */
let formFieldIdCounter = 0;

export function generateFormFieldId(): string {
  formFieldIdCounter += 1;
  return `sq-form-control-${formFieldIdCounter}`;
}

export const FORM_FIELD_DEFAULTS: FormFieldConfig = {
  name: '',
  controlId: '',
  controlLabel: '',
  controlPlaceholder: '',
  required: false,
  pattern: [],
  disabled: false,
};

/**
 * Serialises {@link FormFieldConfig.pattern} into the value understood by the native
 * `pattern` attribute (a `|`-separated list of regular expressions).
 */
export function toPatternAttribute(patterns: readonly RegExp[] | undefined): string {
  return (patterns ?? []).map(pattern => pattern.source).join('|');
}
