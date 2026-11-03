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
    // `scrollTop` is fractional on zoomed / high-DPI screens, so an exact comparison can never hit
    // the bottom; allow a one-pixel tolerance.
    const distanceToBottom = element.scrollHeight - element.scrollTop - element.clientHeight;
    const hasScrolledToBottom = element.scrollTop > 0 && Math.abs(distanceToBottom) <= 1;

    if (hasScrolledToBottom) {
      this.scrolledToBottom.emit();
    }
  }

  ngOnDestroy() {
    this.listener();
  }
}
