import { TestBed } from '@angular/core/testing';

import { ButtonComponent, ButtonTypes } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    component = TestBed.runInInjectionContext(() => new ButtonComponent());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to a button type', () => {
    expect(component['resolvedType']()).toBe(ButtonTypes.Button);
  });

  it('should fall back to a button type when given an invalid type', () => {
    Object.defineProperty(component, 'type', { value: () => 'invalid-type', configurable: true });

    expect(component['resolvedType']()).toBe(ButtonTypes.Button);
  });

  it('should accept a valid submit type', () => {
    Object.defineProperty(component, 'type', { value: () => ButtonTypes.Submit, configurable: true });

    expect(component['resolvedType']()).toBe(ButtonTypes.Submit);
  });
});
