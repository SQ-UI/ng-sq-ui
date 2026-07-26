import { ElementRef, Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { ScrolledToBottomListenerDirective } from './scrolled-to-bottom-listener.directive';

function createFakeRenderer(): Renderer2 {
  return {
    listen: (target: EventTarget, eventName: string, callback: (event: Event) => void) => {
      target.addEventListener(eventName, callback);
      return () => target.removeEventListener(eventName, callback);
    },
  } as Renderer2;
}

describe('ScrolledToBottomListenerDirective', () => {
  let hostEl: HTMLDivElement;
  let directive: ScrolledToBottomListenerDirective;

  beforeEach(() => {
    hostEl = document.createElement('div');
    document.body.appendChild(hostEl);

    TestBed.configureTestingModule({
      providers: [
        { provide: ElementRef, useValue: new ElementRef(hostEl) },
        { provide: Renderer2, useValue: createFakeRenderer() },
      ],
    });

    directive = TestBed.runInInjectionContext(() => new ScrolledToBottomListenerDirective());
  });

  afterEach(() => {
    directive.ngOnDestroy();
    hostEl.remove();
    TestBed.resetTestingModule();
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should emit an event when the user has scrolled to the bottom of the container', () => {
    const mockHtmlEl = {
      scrollTop: 1400,
      scrollHeight: 2400,
      clientHeight: 1000,
    };

    const spy = vi.spyOn(directive.scrolledToBottom, 'emit');
    directive.checkIfHasScrolledToBottom(mockHtmlEl as HTMLElement);

    expect(spy).toHaveBeenCalled();
  });

  it('should not emit an event when the user has not scrolled to the bottom of the container', () => {
    const mockHtmlEl = {
      scrollTop: 1400,
      scrollHeight: 1500,
      clientHeight: 1000,
    };

    const spy = vi.spyOn(directive.scrolledToBottom, 'emit');
    directive.checkIfHasScrolledToBottom(mockHtmlEl as HTMLElement);

    expect(spy).not.toHaveBeenCalled();
  });

  it('should not emit an event when the user remains at the bottom of the container', () => {
    const mockHtmlEl = {
      scrollTop: 0,
      scrollHeight: 1500,
      clientHeight: 1000,
    };

    const spy = vi.spyOn(directive.scrolledToBottom, 'emit');
    directive.checkIfHasScrolledToBottom(mockHtmlEl as HTMLElement);

    expect(spy).not.toHaveBeenCalled();
  });

  it('should emit an event on a native scroll event once scrolled to the bottom', () => {
    Object.defineProperty(hostEl, 'scrollTop', { value: 1400, configurable: true });
    Object.defineProperty(hostEl, 'scrollHeight', { value: 2400, configurable: true });
    Object.defineProperty(hostEl, 'clientHeight', { value: 1000, configurable: true });

    const spy = vi.fn();
    directive.scrolledToBottom.subscribe(spy);

    hostEl.dispatchEvent(new Event('scroll'));

    expect(spy).toHaveBeenCalled();
  });
});
