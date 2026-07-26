import { Input, Component } from '@angular/core';
import { ControlValueAccessorEnabler } from './control-value-accessor-enabler';

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
