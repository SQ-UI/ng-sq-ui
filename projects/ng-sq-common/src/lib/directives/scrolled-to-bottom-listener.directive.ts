import {
  Directive, ElementRef, EventEmitter, Output, Renderer2, OnDestroy, NgZone, ChangeDetectorRef
} from '@angular/core';

@Directive({
  selector: '[sqScrolledToBottomListener]'
})
export class ScrolledToBottomListenerDirective implements OnDestroy {
  @Output() scrolledToBottom = new EventEmitter();

  private listener;

  constructor(private elementRef: ElementRef, private renderer: Renderer2, private ngZone: NgZone, private cd: ChangeDetectorRef) {
    this.ngZone.runOutsideAngular(() => {
      this.listener = this.renderer.listen(this.elementRef.nativeElement, 'scroll', () => {
        this.checkIfHasScrolledToBottom(this.elementRef.nativeElement);
      });
    });
  }

  checkIfHasScrolledToBottom(element: HTMLElement) {
    const hasScrolledToBottom = element.scrollTop > 0 ?
      (Math.ceil(element.scrollHeight - element.scrollTop) <= Math.ceil(element.clientHeight + 3)) : false;

    if (hasScrolledToBottom) {
      this.scrolledToBottom.emit();
      this.cd.detectChanges();
    }
  }

  ngOnDestroy() {
    this.listener();
  }
}
