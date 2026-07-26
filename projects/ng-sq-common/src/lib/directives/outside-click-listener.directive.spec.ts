import { ElementRef, Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { OutsideClickListenerDirective } from './outside-click-listener.directive';

function createFakeRenderer(): Renderer2 {
  return {
    listen: (target: 'document' | 'window' | 'body' | EventTarget, eventName: string, callback: (event: Event) => void) => {
      const el = (target === 'document' ? document : target === 'window' ? window : target === 'body' ? document.body : target) as EventTarget;
      el.addEventListener(eventName, callback);
      return () => el.removeEventListener(eventName, callback);
    },
  } as Renderer2;
}

describe('OutsideClickListenerDirective', () => {
  let hostEl: HTMLDivElement;
  let innerEl: HTMLButtonElement;
  let directive: OutsideClickListenerDirective;

  beforeEach(() => {
    hostEl = document.createElement('div');
    innerEl = document.createElement('button');
    hostEl.appendChild(innerEl);
    document.body.appendChild(hostEl);

    TestBed.configureTestingModule({
      providers: [
        { provide: ElementRef, useValue: new ElementRef(hostEl) },
        { provide: Renderer2, useValue: createFakeRenderer() },
      ],
    });

    directive = TestBed.runInInjectionContext(() => new OutsideClickListenerDirective());
  });

  afterEach(() => {
    directive.ngOnDestroy();
    hostEl.remove();
    TestBed.resetTestingModule();
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should not emit clickOutside by default (listenForOutsideClick is false)', () => {
    const spy = vi.fn();
    directive.clickOutside.subscribe(spy);

    document.body.click();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should emit clickOutside when a click happens outside the host element and listening is enabled', () => {
    Object.defineProperty(directive, 'listenForOutsideClick', { value: () => true, configurable: true });
    const spy = vi.fn();
    directive.clickOutside.subscribe(spy);

    document.body.click();

    expect(spy).toHaveBeenCalled();
  });

  it('should not emit clickOutside when a click happens inside the host element', () => {
    Object.defineProperty(directive, 'listenForOutsideClick', { value: () => true, configurable: true });
    const spy = vi.fn();
    directive.clickOutside.subscribe(spy);

    innerEl.click();

    expect(spy).not.toHaveBeenCalled();
  });
});
