import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { ModalComponent } from './modal.component';

describe('ModalComponent', () => {
  let component: ModalComponent;

  beforeEach(() => {
    vi.useFakeTimers();

    TestBed.configureTestingModule({});
    component = TestBed.runInInjectionContext(() => new ModalComponent());
    TestBed.tick();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start hidden and not listening for outside clicks', () => {
    expect(component.show()).toBe(false);
    expect(component.isHidden()).toBe(true);
    expect(component.listenForOutsideClick()).toBe(false);
  });

  it('should play the entrance animation and reveal the modal when opened', () => {
    component.open();
    TestBed.tick();

    expect(component.show()).toBe(true);
    expect(component.isHidden()).toBe(false);
    expect(component.animationClass()).toBe('fadeInDown');
    expect(component.listenForOutsideClick()).toBe(false);

    vi.advanceTimersByTime(500);

    expect(component.animationClass()).toBe('');
    expect(component.listenForOutsideClick()).toBe(true);
  });

  it('should play the exit animation and hide the modal when closed', () => {
    component.open();
    TestBed.tick();
    vi.advanceTimersByTime(500);

    component.close();
    TestBed.tick();

    expect(component.show()).toBe(false);
    expect(component.listenForOutsideClick()).toBe(false);
    expect(component.animationClass()).toBe('fadeOutUp');
    expect(component.isHidden()).toBe(false);

    vi.advanceTimersByTime(500);

    expect(component.isHidden()).toBe(true);
    expect(component.animationClass()).toBe('');
  });

  it('should honor a custom css animation configuration', () => {
    Object.defineProperty(component, 'customCssAnimation', {
      value: () => ({ duration: 100, entranceAnimation: 'customIn', exitAnimation: 'customOut' }),
      configurable: true,
    });

    component.open();
    TestBed.tick();

    expect(component.animationClass()).toBe('customIn');
    vi.advanceTimersByTime(100);

    component.close();
    TestBed.tick();

    expect(component.animationClass()).toBe('customOut');
  });

  it('should close and stop listening for outside clicks when a click occurs outside the modal', () => {
    component.open();
    TestBed.tick();
    vi.advanceTimersByTime(500);

    component.onClickOutsideComponent();
    TestBed.tick();

    expect(component.listenForOutsideClick()).toBe(false);
    expect(component.show()).toBe(false);
  });
});
