import { Input, Component } from '@angular/core';
import { ControlValueAccessorEnabler } from './control-value-accessor-enabler';

/**
 * @deprecated Use {@link FormFieldConfig} and {@link FORM_FIELD_DEFAULTS} instead.
 * Milestone 2 form components will declare their own `input()` signal
 * properties following the FormFieldConfig contract, using FORM_FIELD_DEFAULTS
 * for default values. Angular's `input()` must be called as a class field
 * initializer, so the composition pattern replaces inheritance.
 * This class is retained only for backward compatibility with un-migrated
 * form components during the transition.
 */
@Component({
  template: '',
  standalone: false
})
export class InputCoreComponent extends ControlValueAccessorEnabler {
  private defaultInputIdentifier = 'sq-form-control' + new Date().getTime().toString();

  @Input() name: string = this.defaultInputIdentifier;
  @Input() controlId: string = this.defaultInputIdentifier;
  @Input() controlLabel: string = '';
  @Input() controlPlaceholder: string = '';
  @Input() required: boolean = false;
  @Input() pattern: any = '';
  @Input() disabled: boolean = false;

  constructor() {
    super();
  }
}
