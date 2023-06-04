import { ScrolledToBottomListenerDirective } from './scrolled-to-bottom-listener.directive';
import { ElementRef } from '@angular/core';

describe('ScrolledToBottomListenerDirective', () => {
  let elementRef: ElementRef;
  let renderer2Mock;
  let directive: ScrolledToBottomListenerDirective;

  beforeEach(() => {
    elementRef = new ElementRef(null);
    renderer2Mock = {
      scroll: jest.fn(),
      listen: jest.fn(),
    };

    directive = new ScrolledToBottomListenerDirective(elementRef, renderer2Mock);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should emit an event when the user has scrolled to the bottom of the container', () => {
    const mockHtmlEl = {
      scrollTop: 1400,
      scrollHeight: 2400,
      clientHeight: 1000
    };

    jest.spyOn(directive.scrolledToBottom, 'emit');
    directive.checkIfHasScrolledToBottom(mockHtmlEl as HTMLElement);

    expect(directive.scrolledToBottom.emit).toHaveBeenCalled();
  });

  it('should not emit an event when the user has not scrolled to the bottom of the container', () => {
    const mockHtmlEl = {
      scrollTop: 1400,
      scrollHeight: 1500,
      clientHeight: 1000
    };

    jest.spyOn(directive.scrolledToBottom, 'emit');
    directive.checkIfHasScrolledToBottom(mockHtmlEl as HTMLElement);

    expect(directive.scrolledToBottom.emit).not.toHaveBeenCalled();
  });

  it('should not emit an event when the user remains at the bottom of the container', () => {
    const mockHtmlEl = {
      scrollTop: 0,
      scrollHeight: 1500,
      clientHeight: 1000
    };

    jest.spyOn(directive.scrolledToBottom, 'emit');
    directive.checkIfHasScrolledToBottom(mockHtmlEl as HTMLElement);

    expect(directive.scrolledToBottom.emit).not.toHaveBeenCalled();
  });
});
