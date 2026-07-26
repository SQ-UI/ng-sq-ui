import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { InputComponent } from './input.component';

describe('InputComponent', () => {
  let component: InputComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    component = TestBed.runInInjectionContext(() => new InputComponent());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default value to an empty string', () => {
    expect(component.value()).toBe('');
  });

  it('should update value on input', () => {
    component.onInput({ target: { value: 'hello world' } } as unknown as Event);

    expect(component.value()).toBe('hello world');
  });

  it('should emit touch on blur', () => {
    const spy = vi.fn();
    component.touch.subscribe(spy);

    component['emitTouch']();

    expect(spy).toHaveBeenCalled();
  });

  it('should derive a pattern attribute string from the pattern RegExp list', () => {
    expect(component['patternAttr']()).toBeUndefined();

    const singlePattern = TestBed.runInInjectionContext(() => new InputComponent());
    Object.defineProperty(singlePattern, 'pattern', { value: () => [/^[0-9]+$/], configurable: true });
    expect(singlePattern['patternAttr']()).toBe('^[0-9]+$');

    const multiPattern = TestBed.runInInjectionContext(() => new InputComponent());
    Object.defineProperty(multiPattern, 'pattern', { value: () => [/a/, /b/], configurable: true });
    expect(multiPattern['patternAttr']()).toBe('a|b');
  });
});
