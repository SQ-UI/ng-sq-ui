import { OutsideClickListenerDirective } from './outside-click-listener.directive';
import { ElementRef, Renderer2 } from '@angular/core';

describe('OutsideClickListenerDirective', () => {
  it('should create an instance', () => {
    const elementRef = new ElementRef(null);
    const renderer2Mock = {
      listen: jest.fn(),
    } as unknown as Renderer2;

    const directive = new OutsideClickListenerDirective(elementRef, renderer2Mock);
    expect(directive).toBeTruthy();
  });
});
