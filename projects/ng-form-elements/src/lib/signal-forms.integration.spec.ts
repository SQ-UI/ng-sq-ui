import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormField, form, required } from '@angular/forms/signals';

import { CheckboxComponent } from './checkbox/checkbox.component';
import { InputComponent } from './input/input.component';

/**
 * `FormField` is the Signal Forms directive (selector `[formField]`). Binding it to an SQ-UI
 * control works because every control exposes a `value` model — the contract documented by
 * `SqFormValueControl` in `@sq-ui/ng-sq-common`.
 */
@Component({
  standalone: true,
  imports: [InputComponent, CheckboxComponent, FormField],
  template: `
    <form novalidate>
      <sq-input controlLabel="Name"
                controlPlaceholder="Your name"
                [formField]="profileForm.name"></sq-input>

      <sq-checkbox controlLabel="Subscribe"
                   [formField]="profileForm.subscribe"></sq-checkbox>
    </form>
  `,
})
class SignalFormsHostComponent {
  readonly model = signal({ name: 'initial', subscribe: false });
  readonly profileForm = form(this.model, path => {
    required(path.name);
  });
}

describe('SQ-UI controls with Angular Signal Forms', () => {
  let fixture: ComponentFixture<SignalFormsHostComponent>;

  function nameInput(): HTMLInputElement {
    return (fixture.nativeElement as HTMLElement).querySelector('sq-input input') as HTMLInputElement;
  }

  function checkboxInput(): HTMLInputElement {
    return (fixture.nativeElement as HTMLElement).querySelector('sq-checkbox input') as HTMLInputElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SignalFormsHostComponent] }).compileComponents();

    fixture = TestBed.createComponent(SignalFormsHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should render the model value inside the control', () => {
    expect(nameInput().value).toBe('initial');
  });

  it('should write user input back into the form model', async () => {
    const input = nameInput();
    input.value = 'typed by the user';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.model().name).toBe('typed by the user');
  });

  it('should keep a boolean control in sync with the model', async () => {
    checkboxInput().click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.model().subscribe).toBe(true);
  });

  it('should mark the field as touched when the control emits touch', async () => {
    expect(fixture.componentInstance.profileForm.name().touched()).toBe(false);

    nameInput().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.profileForm.name().touched()).toBe(true);
  });

  it('should receive the required flag from the form schema', () => {
    expect(nameInput().required).toBe(true);
  });
});
