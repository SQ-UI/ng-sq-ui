import {
  Directive, ElementRef, EventEmitter, Output, Renderer2, OnDestroy
} from '@angular/core';

@Directive({
  selector: '[sqScrolledToBottomListener]'
})
export class ScrolledToBottomListenerDirective implements OnDestroy {
  @Output() scrolledToBottom = new EventEmitter();

  private listener;

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {
    this.listener = this.renderer.listen(this.elementRef.nativeElement, 'scroll', () => {
      this.checkIfHasScrolledToBottom(this.elementRef.nativeElement);
    });
  }

  checkIfHasScrolledToBottom(element: HTMLElement) {
    const hasScrolledToBottom = element.scrollTop > 0 ?
      (Math.ceil(element.scrollHeight - element.scrollTop) <= element.clientHeight) : false;

    if (hasScrolledToBottom) {
      this.scrolledToBottom.emit();
    }
  }

  ngOnDestroy() {
    this.listener();
  }
}
