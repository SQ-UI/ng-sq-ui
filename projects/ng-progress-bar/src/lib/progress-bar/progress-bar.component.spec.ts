import { TestBed } from '@angular/core/testing';

import { ProgressBarComponent } from './progress-bar.component';

describe('ProgressBarComponent', () => {
  let component: ProgressBarComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    component = TestBed.runInInjectionContext(() => new ProgressBarComponent());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to a medium, non-infinite bar with no progress', () => {
    expect(component.size()).toBe('medium');
    expect(component.loaded()).toBe(0);
    expect(component.infinite()).toBe(false);
    expect(component.backgroundColor()).toBe('');
    expect(component.fillColor()).toBe('');
  });

  it('should reflect the provided size and loaded inputs', () => {
    Object.defineProperty(component, 'size', { value: () => 'large', configurable: true });
    Object.defineProperty(component, 'loaded', { value: () => 42, configurable: true });

    expect(component.size()).toBe('large');
    expect(component.loaded()).toBe(42);
  });

  it('should reflect the infinite input', () => {
    Object.defineProperty(component, 'infinite', { value: () => true, configurable: true });

    expect(component.infinite()).toBe(true);
  });
});
