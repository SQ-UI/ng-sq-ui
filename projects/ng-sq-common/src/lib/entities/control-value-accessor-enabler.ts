import { EventEmitter } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

/**
 * @deprecated This class will be replaced by Angular Signal Forms
 * (`@angular/forms/signals`) in Milestone 2. Form components will use
 * signal-backed form fields instead of the ControlValueAccessor pattern.
 * Use `compatForm` from `@angular/forms/signals/compat` during the
 * transition to maintain backward compatibility.
 *
 * The value type is `unknown`: the legacy contract is untyped (Angular's `ControlValueAccessor`
 * declares it as `any`), so consumers must narrow a read or parameterise a subclass.
 */
export class ControlValueAccessorEnabler implements ControlValueAccessor {
  protected _modelToViewChange = new EventEmitter<unknown>();
  protected _value: unknown;
  protected _onChange: (value: unknown) => void = () => {};
  protected _onTouched: () => void = () => {};

  constructor() {}

  get value(): unknown {
    return this._value;
  }

  set value(newValue: unknown) {
    if (newValue !== this._value) {
      this._value = newValue;
      this._onChange(newValue);
    }
  }

  onBlur() {
    this._onTouched();
  }

  writeValue(newValue: unknown): void {
    if (newValue !== this._value) {
      this._value = newValue;
      this._modelToViewChange.emit(newValue);
    }
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }
}
