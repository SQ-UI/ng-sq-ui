/**
 * Interface defining the contract for shared form field properties.
 * Replaces the InputCoreComponent inheritance pattern with composition.
 *
 * In Milestone 2, each form component will declare its own signal inputs
 * following this interface, rather than inheriting from a base class:
 *
 * ```typescript
 * @Component({ standalone: true, ... })
 * export class InputComponent {
 *   // Signal inputs following FormFieldConfig contract
 *   readonly name = input<string>(generateFormFieldId());
 *   readonly controlId = input<string>(generateFormFieldId());
 *   readonly controlLabel = input<string>(FORM_FIELD_DEFAULTS.controlLabel);
 *   readonly controlPlaceholder = input<string>(FORM_FIELD_DEFAULTS.controlPlaceholder);
 *   readonly required = input<boolean>(FORM_FIELD_DEFAULTS.required);
 *   readonly pattern = input<string>(FORM_FIELD_DEFAULTS.pattern);
 *   readonly disabled = input<boolean>(FORM_FIELD_DEFAULTS.disabled);
 * }
 * ```
 */
export interface FormFieldConfig {
  name: string;
  controlId: string;
  controlLabel: string;
  controlPlaceholder: string;
  required: boolean;
  pattern: string;
  disabled: boolean;
}

export function generateFormFieldId(): string {
  return 'sq-form-control' + new Date().getTime().toString();
}

export const FORM_FIELD_DEFAULTS: FormFieldConfig = {
  name: '',
  controlId: '',
  controlLabel: '',
  controlPlaceholder: '',
  required: false,
  pattern: '',
  disabled: false,
};
