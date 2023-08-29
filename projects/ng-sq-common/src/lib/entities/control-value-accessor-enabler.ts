import { EventEmitter } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

/**
 * This class should be extended by all SQ UI custom
 * form controls so that they get recognized by Angular forms.
 * Its only purpose is to implement the ControlValueAccessor interface.
 **/
export class ControlValueAccessorEnabler implements ControlValueAccessor {
  protected _value: any;
  protected _onChange: any = () => {};
  protected _onTouched: any = () => {};

  constructor() {}

  get value(): any {
    return this._value;
  }

  set value(newValue: any) {
    if (newValue !== this._value) {
      this._value = newValue;
      this._onChange(newValue);
    }
  }

  onBlur() {
    this._onTouched();
  }

  writeValue(newValue: any): void {
    if (newValue !== this._value) {
      this._value = newValue;
    }
  }

  registerOnChange(fn: (_: any) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }
}
