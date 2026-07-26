import {
  Directive, ElementRef, OnDestroy, Renderer2, inject, output
} from '@angular/core';

@Directive({
  selector: '[sqScrolledToBottomListener]',
  standalone: true,
})
export class ScrolledToBottomListenerDirective implements OnDestroy {
  private readonly elementRef = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  readonly scrolledToBottom = output<void>();

  private readonly unlisten = this.renderer.listen(this.elementRef.nativeElement, 'scroll', () => {
    this.checkIfHasScrolledToBottom(this.elementRef.nativeElement);
  });

  checkIfHasScrolledToBottom(element: HTMLElement) {
    const hasScrolledToBottom = element.scrollTop > 0 ? ((element.scrollHeight - element.scrollTop) === element.clientHeight) : false;

    if (hasScrolledToBottom) {
      this.scrolledToBottom.emit();
    }
  }

  ngOnDestroy() {
    this.unlisten();
  }
}
