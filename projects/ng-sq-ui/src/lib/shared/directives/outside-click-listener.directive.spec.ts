import { OutsideClickListenerDirective } from './outside-click-listener.directive';
import { ElementRef } from '@angular/core';

describe('OutsideClickListenerDirective', () => {
  it('should create an instance', () => {
    const elementRef = new ElementRef(null);
    const renderer2Mock = jasmine.createSpyObj('renderer2Mock', [
      'destroy',
      'createElement',
      'createComment',
      'createText',
      'destroyNode',
      'appendChild',
      'insertBefore',
      'removeChild',
      'selectRootElement',
      'parentNode',
      'nextSibling',
      'setAttribute',
      'removeAttribute',
      'addClass',
      'removeClass',
      'setStyle',
      'removeStyle',
      'setProperty',
      'setValue',
      'listen'
    ]);

    const directive = new OutsideClickListenerDirective(elementRef, renderer2Mock);
    expect(directive).toBeTruthy();
  });
});
