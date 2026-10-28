import {
  Directive, ElementRef, Renderer2, OnDestroy, inject, output
} from '@angular/core';

@Directive({
  selector: '[sqScrolledToBottomListener]',
  standalone: true
})
export class ScrolledToBottomListenerDirective implements OnDestroy {
  scrolledToBottom = output<void>();

  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);

  private readonly listener = this.renderer.listen(this.elementRef.nativeElement, 'scroll', () => {
    this.checkIfHasScrolledToBottom(this.elementRef.nativeElement);
  });

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
