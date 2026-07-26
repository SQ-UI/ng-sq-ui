import { TestBed } from '@angular/core/testing';

import { CheckboxComponent } from './checkbox.component';

describe('CheckboxComponent', () => {
  let component: CheckboxComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    component = TestBed.runInInjectionContext(() => new CheckboxComponent());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default checked to false', () => {
    expect(component.checked()).toBe(false);
  });

  it('should not have a value property', () => {
    expect((component as unknown as { value?: unknown }).value).toBeUndefined();
  });

  it('should toggle its checked state when clicked', () => {
    expect(component.checked()).toBe(false);
    component.toggleCheckboxSelection();
    expect(component.checked()).toBe(true);
    component.toggleCheckboxSelection();
    expect(component.checked()).toBe(false);
  });
});
