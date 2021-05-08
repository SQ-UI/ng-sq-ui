import { Input, Directive, Injectable } from '@angular/core';
import { ControlValueAccessorEnabler } from './control-value-accessor-enabler';

/**
 * This class contains all the base properties
 * needed for every possible SQ UI form control
 **/
@Injectable()
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
