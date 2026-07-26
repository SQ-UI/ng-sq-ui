import { input, Component } from '@angular/core';
import { ControlValueAccessorEnabler } from './control-value-accessor-enabler';

/**
 * This class contains all the base properties
 * needed for every possible SQ UI form control
 **/
@Component({
  template: '',
  standalone: true
})
export class InputCoreComponent extends ControlValueAccessorEnabler {
  private defaultInputIdentifier = 'sq-form-control' + new Date().getTime().toString();

  name = input<string>(this.defaultInputIdentifier);
  controlId = input<string>(this.defaultInputIdentifier);
  controlLabel = input<string>('');
  controlPlaceholder = input<string>('');
  required = input<boolean>(false);
  pattern = input<any>('');
  disabled = input<boolean>(false);

  constructor() {
    super();
  }
}
