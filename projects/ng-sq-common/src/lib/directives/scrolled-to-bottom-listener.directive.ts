import {
  Directive, ElementRef, Renderer2, OnDestroy, output
} from '@angular/core';

@Directive({
  selector: '[sqScrolledToBottomListener]',
  standalone: true
})
export class ScrolledToBottomListenerDirective implements OnDestroy {
  scrolledToBottom = output<void>();

  private listener;

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {
    this.listener = this.renderer.listen(this.elementRef.nativeElement, 'scroll', () => {
      this.checkIfHasScrolledToBottom(this.elementRef.nativeElement);
    });
  }

  checkIfHasScrolledToBottom(element: HTMLElement) {
    const hasScrolledToBottom = element.scrollTop > 0 ? ((element.scrollHeight - element.scrollTop) === element.clientHeight) : false;

    if (hasScrolledToBottom) {
      this.scrolledToBottom.emit();
    }
  }

  ngOnDestroy() {
    this.listener();
  }
}
