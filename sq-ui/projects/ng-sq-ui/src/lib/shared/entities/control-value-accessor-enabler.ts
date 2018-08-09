import { Input, EventEmitter } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

/**
 * This class should be extended by all SQ UI custom
 * form controls so that they get recognized by Angular forms.
 * Its only purpose is to implement the ControlValueAccessor interface.
 * https://coryrylan.com/blog/angular-custom-form-controls-with-reactive-forms-and-ngmodel
 **/
export class ControlValueAccessorEnabler implements ControlValueAccessor {
  constructor() {}
  @Input('value') _value: any;
  protected _valueChange: EventEmitter<any> = new EventEmitter();

  //Placeholders for the callbacks which are later provided
  //by the Control Value Accessor
  onTouchedCallback: any = () => {};
  onChangeCallback: any = () => {};

  //get accessor
  get value(): any {
    return this._value;
  }

  //set accessor including call the onchange callback
  set value(v: any) {
    if (v !== this._value) {
      this._value = v;
      this.onChangeCallback(v);
      this._valueChange.emit(this._value);
    }
  }

  //Set touched on blur
  onBlur() {
    this.onTouchedCallback();
  }

  //From ControlValueAccessor interface
  writeValue(value: any) {
    if (value !== this._value) {
      this._value = value;
      this._valueChange.emit(this._value);
    }
  }

  //From ControlValueAccessor interface
  registerOnChange(fn) {
    this.onChangeCallback = fn;
  }

  //From ControlValueAccessor interface
  registerOnTouched(fn) {
    this.onTouchedCallback = fn;
  }
}
