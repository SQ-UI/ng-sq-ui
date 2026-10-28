import { EventEmitter } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

/**
 * @deprecated This class will be replaced by Angular Signal Forms
 * (`@angular/forms/signals`) in Milestone 2. Form components will use
 * signal-backed form fields instead of the ControlValueAccessor pattern.
 * Use `compatForm` from `@angular/forms/signals/compat` during the
 * transition to maintain backward compatibility.
 */
export class ControlValueAccessorEnabler implements ControlValueAccessor {
  protected _modelToViewChange: EventEmitter<any> = new EventEmitter();
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
      this._modelToViewChange.emit(newValue);
    }
  }

  registerOnChange(fn: (_: any) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }
}
