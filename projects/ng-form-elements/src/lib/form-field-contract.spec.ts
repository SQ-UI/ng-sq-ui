import { TestBed } from '@angular/core/testing';
import type { Type } from '@angular/core';

import { CheckboxComponent } from './checkbox/checkbox.component';
import { InputComponent } from './input/input.component';
import { TagsInputComponent } from './tags-input/tags-input.component';

/** The `SqFormFieldSignals` members, as read from a component instance. */
interface FormFieldControl {
  name(): string;
  controlId(): string;
  controlLabel(): string;
  controlPlaceholder(): string;
  required(): boolean;
  pattern(): readonly RegExp[];
  disabled(): boolean;
}

/**
 * Runtime half of the shared form field contract (`SqFormFieldSignals` covers the compile-time half):
 * every control must start from `FORM_FIELD_DEFAULTS` and must not share `name`/`controlId` values.
 */
describe('form field contract', () => {
  const controls: Array<{ name: string; type: Type<FormFieldControl> }> = [
    { name: 'sq-input', type: InputComponent },
    { name: 'sq-checkbox', type: CheckboxComponent },
    { name: 'sq-tags-input', type: TagsInputComponent },
  ];

  for (const control of controls) {
    describe(control.name, () => {
      it('starts from the documented defaults', () => {
        const fixture = TestBed.createComponent(control.type);
        const component = fixture.componentInstance;
        fixture.detectChanges();

        expect(component.controlLabel()).toBe('');
        expect(component.controlPlaceholder()).toBe('');
        expect(component.required()).toBe(false);
        expect(component.pattern()).toEqual([]);
        expect(component.disabled()).toBe(false);
        expect(component.name()).toMatch(/^sq-form-control-\d+$/);
        expect(component.controlId()).toMatch(/^sq-form-control-\d+$/);
      });

      it('generates a unique id per instance', () => {
        const first = TestBed.createComponent(control.type).componentInstance;
        const second = TestBed.createComponent(control.type).componentInstance;

        expect(first.name()).not.toBe(second.name());
        expect(first.controlId()).not.toBe(second.controlId());
      });

      it('exposes the shared inputs', () => {
        const fixture = TestBed.createComponent(control.type);
        const component = fixture.componentInstance;

        fixture.componentRef.setInput('controlLabel', 'A label');
        fixture.componentRef.setInput('required', true);
        fixture.componentRef.setInput('pattern', [/^\d+$/]);
        fixture.componentRef.setInput('disabled', true);

        expect(component.controlLabel()).toBe('A label');
        expect(component.required()).toBe(true);
        expect(component.pattern()).toEqual([/^\d+$/]);
        expect(component.disabled()).toBe(true);
      });
    });
  }
});
