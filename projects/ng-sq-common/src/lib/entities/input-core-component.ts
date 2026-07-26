import { Input, Component } from '@angular/core';
import { ControlValueAccessorEnabler } from './control-value-accessor-enabler';

/**
 * @deprecated This class will be replaced with a signal-based mixin in Milestone 2.
 * Form components will use `input()` signals directly instead of inheriting
 * `@Input()` properties from a base class. The mixin pattern will provide
 * shared form field configuration (name, controlId, controlLabel, etc.)
 * via composition rather than inheritance.
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
